# Reversion Plan: Restore Yahoo Weather Scraping

## Goal Description
Revert the weather forecast implementation back to the Puppeteer-based scraping of Yahoo Weather images, as requested by the user. The API-based implementation will be removed.

## Proposed Changes

### Logic Layer
#### [NEW] [scripts/fetch_weather_image.ts](file:///Users/yokoyama/.gemini/antigravity/playground/orbital-skylab/scripts/fetch_weather_image.ts)
- Restore the original Puppeteer script that:
    1. Launches Chromium.
    2. Navigates to Yahoo Weather (Tokyo).
    3. Screenshots the forecast table.
    4. Saves to `public/images/weather-today.png`.
    - Note: I will remove the unused `sharp` / `ESC/POS` logic that was previously identified as dead code, keeping it a clean "Screenshot & Save" script as discussed in the initial review, to keep it "smart" but functionally identical to the original requirement.

#### [NEW] [src/pages/api/weather-image.ts](file:///Users/yokoyama/.gemini/antigravity/playground/orbital-skylab/src/pages/api/weather-image.ts)
- Restore the API route that serves the image from `public/images/weather-today.png`.

#### [MODIFY] [scripts/cron_fetch_weather.sh](file:///Users/yokoyama/.gemini/antigravity/playground/orbital-skylab/scripts/cron_fetch_weather.sh)
- Re-enable the execution of `scripts/fetch_weather_image.ts`.

#### [DELETE] [src/utils/weather.ts](file:///Users/yokoyama/.gemini/antigravity/playground/orbital-skylab/src/utils/weather.ts)
- Remove the JMA API utility.

### UI Layer
#### [MODIFY] [src/pages/briefing.astro](file:///Users/yokoyama/.gemini/antigravity/playground/orbital-skylab/src/pages/briefing.astro)
- Revert the "WEATHER" section to use `<img src="/api/weather-image?t=..." />`.
- Remove imports for `lucide-react` weather icons and the `weather.ts` utility.

## Verification Plan
### Manual Verification
1.  Run `npx tsx scripts/fetch_weather_image.ts` to ensure it captures an image.
2.  Start `pnpm run dev`.
3.  Check `http://localhost:4321/briefing` to see the Yahoo Weather image displayed.
