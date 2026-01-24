
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

const TARGET_URL = 'https://weather.yahoo.co.jp/weather/jp/13/4410.html';
const SELECTOR = '.forecastCity table tr > td:nth-child(1)'; // Target only Today's cell
const SAFE_WIDTH = 576; // Standard 80mm thermal printer width
const OUTPUT_PATH = path.join(process.cwd(), 'public', 'images', 'weather-today.png');

async function main() {
  console.log('🚀 Starting Weather Printer...');
  
  // 1. Launch Browser
  console.log('launching browser...');
  
  const launchOptions: any = {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  };

  // On Raspberry Pi (Linux ARM), use system Chromium instead of bundled Chrome (x64)
  if (process.platform === 'linux') {
      try {
          // Check common paths for Chromium on Pi
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
      } catch (e) { console.error('Error checking for system browser:', e); }
  }

  const browser = await puppeteer.launch(launchOptions);
  const page = await browser.newPage();
  
  // Set viewport to roughly desktop/tablet width to get the horizontal layout if possible, 
  // or mobile width if we want vertical. 
  // Yahoo Weather .forecastCity is usually a table. Desktop view is fine.
  await page.setViewport({ width: 1200, height: 800 });

  try {
    // 2. Go to URL
    console.log(`navigating to ${TARGET_URL}...`);
    await page.goto(TARGET_URL, { waitUntil: 'networkidle0' });

    // 3. Find Element
    console.log(`waiting for selector ${SELECTOR}...`);
    await page.waitForSelector(SELECTOR);
    const element = await page.$(SELECTOR);

    if (!element) {
      throw new Error(`Element ${SELECTOR} not found`);
    }

    // Capture screenshot of the element
    console.log('capturing screenshot...');
    const screenshotBuffer = await element.screenshot({ type: 'png' });
    
    // 4. Process Image (Resize & Dither)
    console.log('processing image...');
    const { data: rawData, info } = await sharp(screenshotBuffer)
        .flatten({ background: { r: 255, g: 255, b: 255 } })
        .resize({ width: SAFE_WIDTH })
        .grayscale()
        .raw()
        .toBuffer({ resolveWithObject: true });

    const { width, height } = info;
    
    // Apply Dithering
    const ditheredPixels = applyFloydSteinberg(rawData, width, height);

    // Convert to ESC/POS Raster
    const rasterData = createEscPosRaster(ditheredPixels, width, height);

    // Add 4 lines feed + Cut
    // We'll use 4 newlines for feed + Cut command
    // getCutCommand() typically sends Feed + Cut.
    // Let's explicitly do Feed(4) then Cut.
    // getCutCommand already does 0x0A x4 then Cut.
    const footer = getCutCommand(); 
    
    const finalBuffer = Buffer.concat([rasterData, footer]);

    // 5. Ensure directory exists and Save
    const outputDir = path.dirname(OUTPUT_PATH);
    try {
        await fs.mkdir(outputDir, { recursive: true });
    } catch (e) {}

    await fs.writeFile(OUTPUT_PATH, screenshotBuffer);
    console.log(`📸 Weather image saved to ${OUTPUT_PATH}`);

    // No printing here. Just save the image.
    console.log('✅ Done! Image ready for Astro dashboard.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
}

main();
