#!/bin/bash
# -------------------------------------------------------------
# Cron Wrapper: Print Morning Briefing
# -------------------------------------------------------------

cd "$(dirname "$0")/.." || exit 1

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

echo "[$(date)] Cron: Printing Briefing..."
npx tsx scripts/print_briefing.ts
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo "[$(date)] Print success."
else
    echo "[$(date)] Print FAILED (Code: $EXIT_CODE)."
fi
exit $EXIT_CODE
