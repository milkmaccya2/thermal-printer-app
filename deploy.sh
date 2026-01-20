#!/bin/bash

# Configuration
HOST="milkmaccya@RaspberryPi4.local"
REMOTE_DIR="~/git/thermal-printer-app"

# Command to execute on the remote server
# 1. Load NVM to ensure node/pnpm are available
# 2. Go to project dir
# 3. Git pull
# 4. Install dependencies (rebuilds sharp for Pi)
# 5. Build Astro app
# 6. Restart PM2 process
REMOTE_SCRIPT="
export NVM_DIR=\"\$HOME/.nvm\"
[ -s \"\$NVM_DIR/nvm.sh\" ] && . \"\$NVM_DIR/nvm.sh\"

cd $REMOTE_DIR
echo '🚀 Starting deployment...'

echo '📦 Pulling latest changes...'
git pull

echo '🔧 Installing dependencies...'
pnpm install

echo '🏗️  Building application...'
pnpm build

echo '🔄 Restarting PM2 process...'
pnpm exec pm2 restart thermal-printer-app

echo '✅ Deployment complete!'
"

# Execute via SSH
ssh -t $HOST "$REMOTE_SCRIPT"
