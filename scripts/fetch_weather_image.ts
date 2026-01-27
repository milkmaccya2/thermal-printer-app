
import puppeteer from 'puppeteer';
import fs from 'node:fs/promises';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';

const execAsync = promisify(exec);

const TARGET_URL = 'https://weather.yahoo.co.jp/weather/jp/13/4410.html';
const SELECTOR = '.forecastCity table tr > td:nth-child(1)'; // Target only Today's cell
const OUTPUT_PATH = path.join(process.cwd(), 'public', 'images', 'weather-today.png');

async function main() {
  console.log('🚀 Starting Weather Printer...');
  
  // 1. Launch Browser
  console.log('launching browser...');
  
  const launchOptions: any = {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  };

  // On Raspberry Pi (Linux ARM), use system Chromium
  if (process.platform === 'linux') {
      try {
        const { execSync } = await import('node:child_process');
        try {
            const path = execSync('which chromium || which chromium-browser || which google-chrome-stable').toString().trim();
            if (path) {
                launchOptions.executablePath = path;
                console.log(`Using system browser at ${path}`);
            }
        } catch (e) {
             console.error('System Chromium search failed. Trying common paths...');
        }
      } catch (e) { console.error('Error checking for system browser:', e); }
  }

  const browser = await puppeteer.launch(launchOptions);
  const page = await browser.newPage();
  
  // Set viewport roughly desktop width
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

    // Capture screenshot
    console.log('capturing screenshot...');
    const screenshotBuffer = await element.screenshot({ type: 'png' });
    
    // 5. Ensure directory exists and Save
    const outputDir = path.dirname(OUTPUT_PATH);
    try {
        await fs.mkdir(outputDir, { recursive: true });
    } catch (e) {}

    await fs.writeFile(OUTPUT_PATH, screenshotBuffer);
    console.log(`📸 Weather image saved to ${OUTPUT_PATH}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
}

main();
