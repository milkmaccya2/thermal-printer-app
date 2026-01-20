import { defineAction } from 'astro:actions';
import { z } from 'astro/zod';
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
        const { applyFloydSteinberg, createEscPosRaster } = await import('../utils/printer');
        
        // Remove header data:image/png;base64,
        const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');

        // 1. Process base image: Resize & Custom Dithering
        // POS-80 typically supports 576 dots width (72mmprintable area)
        const safeWidth = 576;
        
        // Get raw grayscale pixel data
        const { data: rawData, info } = await sharp(buffer)
            .flatten({ background: { r: 255, g: 255, b: 255 } }) // Handle transparency
            .resize({ width: safeWidth }) // Force resize to full width
            .grayscale()
            .raw()
            .toBuffer({ resolveWithObject: true });

        const { width, height } = info;

        // 2. Apply Custom Dithering
        const ditheredPixels = applyFloydSteinberg(rawData, width, height);
        
        // 3. Convert to ESC/POS Raster Format
        const rasterData = createEscPosRaster(ditheredPixels, width, height);

        // Add Feed and Cut commands
        // Feed 4 lines (0x0A * 4)
        const footer = Buffer.from([
            0x0A, 0x0A, 0x0A, 0x0A 
        ]);
        
        const finalBuffer = Buffer.concat([rasterData, footer]);

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
  getPrinterStatus: defineAction({
    accept: 'json',
    handler: async () => {
      try {
        // Get Printer Status
        const { stdout: statusOut } = await execAsync('lpstat -p');
        const status = statusOut.split('\n')[0] || 'Unknown'; // Take first line e.g. "printer POS-80 is idle..."

        // Get Queue
        const { stdout: queueOut } = await execAsync('lpstat -o');
        const jobs = queueOut.split('\n')
            .filter(line => line.trim().length > 0)
            .map(line => {
                const parts = line.split(/\s+/);
                // lpstat -o output format varies but typically:
                // POS-80-55 milkmaccya 1024 Tue 18 ...
                return {
                    id: parts[0],
                    name: parts[0], // job id as name for now
                    file: 'Raw Data',
                    size: 'Unknown',
                    time: parts.slice(3).join(' ') || 'Just now',
                    user: parts[1],
                };
            });
            
        return { success: true, jobs, status };
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


