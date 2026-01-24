#!/bin/bash
# -------------------------------------------------------------
# Cron Wrapper: Fetch Weather Image
# -------------------------------------------------------------

cd "$(dirname "$0")/.." || exit 1

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

# Ensure output dir exists
mkdir -p public/images

echo "[$(date)] Cron: Fetching Weather Image..."
npx tsx scripts/fetch_weather_image.ts
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo "[$(date)] Weather fetch success."
else
    echo "[$(date)] Weather fetch FAILED (Code: $EXIT_CODE)."
fi
exit $EXIT_CODE
