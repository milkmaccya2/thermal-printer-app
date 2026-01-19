import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import fs from 'node:fs/promises';
import os from 'node:os';

const execAsync = promisify(exec);

export const server = {
  printText: defineAction({
    accept: 'json',
    input: z.object({
      text: z.string(),
    }),
    handler: async ({ text }) => {
      try {
        const { default: iconv } = await import('iconv-lite');
        const tmpDir = os.tmpdir();
        const fileName = `print-text-${Date.now()}.bin`; // Changed to .bin
        const filePath = path.join(tmpDir, fileName);

        // Convert text to CP932 (Shift-JIS) buffer for Japanese support
        // Most thermal printers support Shift-JIS or PC932
        const textBuffer = iconv.encode(text + '\n', 'Shift_JIS');
        
        // Append Cut Command: Feed 4 lines + GS V 66 0
        const cutBuffer = Buffer.from([
            0x0A, 0x0A, 0x0A, 0x0A, 
            0x1d, 0x56, 0x42, 0x00 
        ]);
        
        const finalBuffer = Buffer.concat([textBuffer, cutBuffer]);

        await fs.writeFile(filePath, finalBuffer);
        console.log(`Text file saved to ${filePath}`);

        // Send raw text file
        const { stdout, stderr } = await execAsync(`lp -o raw "${filePath}"`);
        console.log('lp output:', stdout);
        if (stderr) console.error('lp stderr:', stderr);

        return { success: true, message: 'Text sent to printer (RAW)', path: filePath };
      } catch (error: any) {
        console.error('Text Print error:', error);
        return { success: false, message: error.message };
      }
    },
  }),

  printImage: defineAction({
    accept: 'json',
    input: z.object({
      image: z.string(), // Base64 data string: "data:image/png;base64,..."
    }),
    handler: async ({ image }) => {
      try {
        const { default: sharp } = await import('sharp');
        // Remove header data:image/png;base64,
        const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');

        // 1. Process base image: Resize & Custom Dithering
        const safeWidth = 512;
        
        // Get raw grayscale pixel data
        const { data: rawData, info } = await sharp(buffer)
            .flatten({ background: { r: 255, g: 255, b: 255 } }) // Handle transparency
            .resize({ width: safeWidth, withoutEnlargement: true })
            .grayscale()
            .raw()
            .toBuffer({ resolveWithObject: true });

        const width = info.width;
        const height = info.height;
        
        // Use Int16Array to prevent overflow/wrapping during error distribution
        const pixels = new Int16Array(rawData);

        // Floyd-Steinberg Dithering Algorithm
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = y * width + x;
                const oldVal = pixels[idx];
                
                // Threshold pixel (0 or 255)
                const newVal = oldVal < 128 ? 0 : 255;
                pixels[idx] = newVal;
                
                const error = oldVal - newVal;
                
                // Distribute error to neighbors
                if (x + 1 < width) pixels[idx + 1] += (error * 7) >> 4;
                if (y + 1 < height && x - 1 >= 0) pixels[idx + width - 1] += (error * 3) >> 4;
                if (y + 1 < height) pixels[idx + width] += (error * 5) >> 4;
                if (y + 1 < height && x + 1 < width) pixels[idx + width + 1] += (error * 1) >> 4;
            }
        }
        
        // 2. Convert to ESC/POS Raster Format (GS v 0)
        // Command: GS v 0 m xL xH yL yH d1...dk
        // m=0 (Normal)
        // xL, xH = width in bytes (little endian)
        // yL, yH = height in dots (little endian)
        
        const widthBytes = Math.ceil(width / 8);
        const header = Buffer.from([
            0x1d, 0x76, 0x30, 0x00, 
            widthBytes & 0xff, (widthBytes >> 8) & 0xff,
            height & 0xff, (height >> 8) & 0xff
        ]);
        
        // Pack pixels into bytes
        const rasterBuffer = Buffer.alloc(widthBytes * height);
        rasterBuffer.fill(0);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                // If pixel is BLACK (0), set the bit to 1. 
                // In thermal printing, 1 usually means "burn" (black).
                // Our pixels array has 0 for black, 255 for white after thresholding.
                if (pixels[y * width + x] === 0) {
                    const byteIndex = y * widthBytes + Math.floor(x / 8);
                    const bitIndex = 7 - (x % 8);
                    rasterBuffer[byteIndex] |= (1 << bitIndex);
                }
            }
        }

        // Add Feed and Cut commands
        // Feed 4 lines (0x0A * 4)
        // Removed partial cut command to prevent double cutting if printer auto-cuts
        const footer = Buffer.from([
            0x0A, 0x0A, 0x0A, 0x0A 
        ]);
        
        const finalBuffer = Buffer.concat([header, rasterBuffer, footer]);

        const tmpDir = os.tmpdir();
        const fileName = `print-image-${Date.now()}.bin`;
        const filePath = path.join(tmpDir, fileName);

        await fs.writeFile(filePath, finalBuffer);
        console.log(`ESC/POS Binary file saved to ${filePath}`);

        // Send raw binary
        const { stdout, stderr } = await execAsync(`lp -o raw "${filePath}"`);
        
        console.log('lp output:', stdout);
        if (stderr) console.error('lp stderr:', stderr);

        return { success: true, message: 'Image sent to printer (RAW)' };
      } catch (error: any) {
        console.error('Image Print error:', error);
        return { success: false, message: error.message };
      }
    },
  }),

  // Queue Management Actions
  getQueue: defineAction({
    accept: 'json',
    handler: async () => {
      try {
        const { stdout } = await execAsync('lpstat -o');
        const jobs = stdout.split('\n')
            .filter(line => line.trim().length > 0)
            .map(line => {
                const parts = line.split(/\s+/);
                return {
                    id: parts[0],
                    user: parts[1],
                    status: 'Pending', 
                    raw: line
                };
            });
        return { success: true, jobs };
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    }
  }),
  
  cancelJob: defineAction({
    accept: 'json',
    input: z.object({ jobId: z.string() }),
    handler: async ({ jobId }) => {
        try {
            await execAsync(`cancel "${jobId}"`);
            return { success: true, message: `Job ${jobId} canceled` };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }
  }),

  clearQueue: defineAction({
    accept: 'json',
    handler: async () => {
        try {
            await execAsync('cancel -a');
            return { success: true, message: 'All jobs canceled' };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }
  }),

  enablePrinter: defineAction({
    accept: 'json',
    handler: async () => {
        try {
            // Re-enable printing (often needed after errors)
            // cupsenable is standard command to resume paused printers
            await execAsync('cupsenable $(lpstat -p | cut -d " " -f 2)');
            return { success: true, message: 'Printers enabled' };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }
  }),
};


