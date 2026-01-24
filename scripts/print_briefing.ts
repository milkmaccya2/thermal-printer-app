
import puppeteer from 'puppeteer';
import sharp from 'sharp';
import fs from 'node:fs/promises';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import os from 'node:os';
import { applyFloydSteinberg, createEscPosRaster } from '../src/utils/printer';
import { getCutCommand } from '../src/utils/printCommands';

const execAsync = promisify(exec);

// Assuming Astro is running locally on port 4321
const TARGET_URL = 'http://localhost:4321/briefing';
const SAFE_WIDTH = 576; // Standard 80mm thermal printer width

async function main() {
  console.log('🚀 Starting Morning Briefing Printer...');
  
  // 1. Launch Browser
  console.log('launching browser...');
  
  const launchOptions: any = {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  };

  if (process.platform === 'linux') {
      try {
          const paths = ['/usr/bin/chromium-browser', '/usr/bin/chromium'];
          for (const p of paths) {
              const fs = await import('node:fs/promises');
              try {
                  await fs.access(p);
                  launchOptions.executablePath = p;
                  console.log(`Using system browser at ${p}`);
                  break;
              } catch {}
          }
      } catch (e) {}
  }

  const browser = await puppeteer.launch(launchOptions);
  const page = await browser.newPage();
  
  // Set viewport width to match printer safely
  await page.setViewport({ width: SAFE_WIDTH, height: 1200 });

  try {
    // 2. Go to URL
    console.log(`navigating to ${TARGET_URL}...`);
    // Need networkidle0 to ensure images (like weather) are loaded
    await page.goto(TARGET_URL, { waitUntil: 'networkidle0' });

    // Optional: Wait strictly for the weather image if dynamic
    // await page.waitForSelector('img[src*="weather-today"]');

    // Capture screenshot of the full page content
    const bodyHandle = await page.$('body');
    const boundingBox = await bodyHandle?.boundingBox();
    const height = boundingBox?.height || 1000;
    
    // Resize viewport to full content height for complete screenshot
    await page.setViewport({ width: SAFE_WIDTH, height: Math.ceil(height) });

    console.log('capturing screenshot...');
    const screenshotBuffer = await page.screenshot({ 
        fullPage: true,
        type: 'png'
    });
    
    // Save Preview for debug
    const previewPath = path.join(process.cwd(), 'docs', 'briefing-preview.png');
    await fs.writeFile(previewPath, screenshotBuffer);
    console.log(`📸 Preview saved to ${previewPath}`);

    // 4. Process Image (Resize & Dither)
    console.log('processing image...');
    
    // Use sharp to process
    const { data: rawData, info } = await sharp(screenshotBuffer)
        .flatten({ background: { r: 255, g: 255, b: 255 } })
        .resize({ width: SAFE_WIDTH })
        .grayscale()
        .raw()
        .toBuffer({ resolveWithObject: true });

    const { width: finalWidth, height: finalHeight } = info;
    
    // Apply Dithering
    const ditheredPixels = applyFloydSteinberg(rawData, finalWidth, finalHeight);

    // Convert to ESC/POS Raster
    const rasterData = createEscPosRaster(ditheredPixels, finalWidth, finalHeight);

    // Add Feed + Cut
    const footer = getCutCommand(); 
    
    const finalBuffer = Buffer.concat([rasterData, footer]);

    // 5. Build Temp File for Printing
    const tmpDir = os.tmpdir();
    const fileName = `briefing-print-${Date.now()}.bin`;
    const filePath = path.join(tmpDir, fileName);
    
    await fs.writeFile(filePath, finalBuffer);
    console.log(`Saved binary to ${filePath}`);

    // 6. Print
    console.log(`Sending to printer via lp...`);
    try {
        const { stdout, stderr } = await execAsync(`lp -o raw "${filePath}"`);
        console.log('lp output:', stdout);
        if (stderr) console.error('lp stderr:', stderr);
        console.log('✅ Print command sent!');
    } catch (e: any) {
        console.warn('⚠️ Printing failed:', e.message);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
}

main();
