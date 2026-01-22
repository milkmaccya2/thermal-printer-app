import { defineAction } from 'astro:actions';
import { z } from 'astro/zod';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import fs from 'node:fs/promises';
import os from 'node:os';
import iconv from 'iconv-lite';
import sharp from 'sharp';
import { applyFloydSteinberg, createEscPosRaster } from '../utils/printer';
import { getCutCommand } from '../utils/printCommands';

const execAsync = promisify(exec);

export const printerActions = {
  /**
   * Prints raw text to the default printer.
   * Converts text to Shift_JIS (CP932) for Japanese support.
   * Feeds 4 lines and cuts the paper after printing.
   */
  printText: defineAction({
    accept: 'json',
    input: z.object({
      text: z.string(),
    }),
    handler: async ({ text }) => {
      try {
        const tmpDir = os.tmpdir();
        const fileName = `print-text-${Date.now()}.bin`;
        const filePath = path.join(tmpDir, fileName);

        // Convert text to CP932 (Shift-JIS) buffer for Japanese support
        const textBuffer = iconv.encode(text + '\n', 'Shift_JIS');
        
        // Append Cut Command
        const finalBuffer = Buffer.concat([textBuffer, getCutCommand()]);

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

  /**
   * Prints an image to the default printer.
   * Accepts a Base64 encoded image string.
   * Resizes, dithers (Floyd-Steinberg), and converts to ESC/POS raster format.
   */
  printImage: defineAction({
    accept: 'json',
    input: z.object({
      image: z.string(), // Base64 data string
    }),
    handler: async ({ image }) => {
      try {
        // Remove header data:image/png;base64,
        const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');

        // 1. Process base image: Resize & Custom Dithering
        const safeWidth = 576;
        
        // Get raw grayscale pixel data
        const { data: rawData, info } = await sharp(buffer)
            .flatten({ background: { r: 255, g: 255, b: 255 } })
            .resize({ width: safeWidth })
            .grayscale()
            .raw()
            .toBuffer({ resolveWithObject: true });

        const { width, height } = info;

        // 2. Apply Custom Dithering
        const ditheredPixels = applyFloydSteinberg(rawData, width, height);
        
        // 3. Convert to ESC/POS Raster Format
        const rasterData = createEscPosRaster(ditheredPixels, width, height);

        // Add Feed and Cut commands (manual implementation in original code was just feed, but lets use cut command if consistent or just feed)
        // Original code: Feed 4 lines. Let's strictly follow original logic but maybe use helper? 
        // Original code had 0x0A * 4. getCutCommand has that + cut.
        // Let's use getCutCommand() for consistency in "Job finish" behavior.
        // Wait, original printImage footer was ONLY feed 4 lines, NO cut. 
        // User might want to tear it manually or maybe I should stick to original behavior?
        // Let's stick to original behavior for now to be safe, or upgrade?
        // Let's safe: Feed 4 lines only as per original code.
        const footer = Buffer.from([0x0A, 0x0A, 0x0A, 0x0A]);
        
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

  /**
   * Sends a "Force Cut" command to the printer.
   * Useful if the paper was not cut correctly after a job.
   */
  forceCut: defineAction({
    accept: 'json',
    handler: async () => {
      try {
        const cutBuffer = getCutCommand();
        
        const tmpDir = os.tmpdir();
        const fileName = `force-cut-${Date.now()}.bin`;
        const filePath = path.join(tmpDir, fileName);

        await fs.writeFile(filePath, cutBuffer);
        await execAsync(`lp -o raw "${filePath}"`);
        
        return { success: true, message: 'Cut command sent' };
      } catch (error: any) {
        return { success: false, message: error.message };
      }
    }
  }),
};
