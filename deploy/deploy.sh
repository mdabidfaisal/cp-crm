#!/bin/bash
# Run this on your LOCAL machine after cloning from GitHub
# Deploys the built CRM to your VPS

set -e

VPS="root@147.79.67.217"
REMOTE_PATH="/var/www/crm.codeprophet.com.bd"

echo "=== 1. Installing dependencies ==="
npm install

echo "=== 2. Building production bundle ==="
npm run build

echo "=== 3. Uploading to VPS ==="
rsync -avz --delete dist/ "$VPS:$REMOTE_PATH"

echo "=== 4. Setting permissions ==="
ssh "$VPS" "chown -R www-data:www-data $REMOTE_PATH 2>/dev/null; chmod -R 755 $REMOTE_PATH"

echo ""
echo "=== DEPLOYMENT COMPLETE ==="
echo "Visit: http://crm.codeprophet.com.bd:8080"
echo ""
echo "If you set up SSL, visit: https://crm.codeprophet.com.bd"
