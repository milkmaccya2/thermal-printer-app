#!/bin/bash

# -------------------------------------------------------------
# Morning Briefing Automation Script
# 
# Usage in Cron:
# 0 7 * * * /home/milkmaccya/git/thermal-printer-app/scripts/run_daily_briefing.sh >> /home/milkmaccya/git/thermal-printer-app/cron.log 2>&1
# -------------------------------------------------------------

# 1. Navigate to the project root directory
# (Resolves the script location and goes one level up)
cd "$(dirname "$0")/.." || exit 1

echo "========================================================"
echo "Starting Morning Briefing at $(date)"
echo "Project Dir: $(pwd)"

# 2. Load Node.js Environment (NVM)
# Cron runs in a minimal shell, so we need to load NVM manually to get 'node', 'npm', 'npx'.
export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
    . "$NVM_DIR/nvm.sh"
else
    echo "WARNING: nvm.sh not found at $NVM_DIR/nvm.sh"
    # Fallback: Try to use system node if available
fi

# Log Node version for debugging
echo "Node Version: $(node -v)"
echo "NPM Version: $(npm -v)"

# 3. Create public/images directory if it doesn't exist (just in case)
mkdir -p public/images

# 4. Fetch Weather Image
echo "--------------------------------------------------------"
echo "Step 1: Fetching Weather Image..."
npx tsx scripts/fetch_weather_image.ts
FETCH_EXIT_CODE=$?
if [ $FETCH_EXIT_CODE -ne 0 ]; then
    echo "❌ Error fetching weather image. Exit code: $FETCH_EXIT_CODE"
    # We continue anyway, hoping the old image or partial dashboard works? 
    # Or maybe exit? Let's try to continue to print *something* if possible, 
    # but the image might be stale.
fi

# 5. Print Briefing
echo "--------------------------------------------------------"
echo "Step 2: Capturing and Printing Dashboard..."
npx tsx scripts/print_briefing.ts
PRINT_EXIT_CODE=$?
if [ $PRINT_EXIT_CODE -ne 0 ]; then
    echo "❌ Error printing briefing. Exit code: $PRINT_EXIT_CODE"
    exit $PRINT_EXIT_CODE
fi

echo "--------------------------------------------------------"
echo "✅ Morning Briefing Completed Successfully at $(date)"
echo "========================================================"
