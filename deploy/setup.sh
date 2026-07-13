#!/bin/bash
# Run this ONCE on your VPS to set up the CRM from scratch
# Usage: ssh root@147.79.67.217 'bash -s' < deploy/setup.sh

set -e

DOMAIN="crm.codeprophet.com.bd"
PORT=8080
WEB_ROOT="/var/www/$DOMAIN"

echo "=== 1. Installing Nginx ==="
apt update -y
apt install -y nginx certbot python3-certbot-nginx

echo "=== 2. Creating web directory ==="
mkdir -p "$WEB_ROOT"

echo "=== 3. Creating Nginx config ==="
cat > "/etc/nginx/sites-available/$DOMAIN" << 'NGINX'
server {
    listen 8080;
    server_name crm.codeprophet.com.bd 147.79.67.217;

    root /var/www/crm.codeprophet.com.bd;
    index index.html;

    gzip on;
    gzip_types text/plain application/javascript application/json text/css;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
NGINX

ln -sf "/etc/nginx/sites-available/$DOMAIN" "/etc/nginx/sites-enabled/"

# Remove default if present
rm -f /etc/nginx/sites-enabled/default

nginx -t && systemctl reload nginx

echo ""
echo "=== SETUP COMPLETE ==="
echo "Server is ready. Now deploy the files from your local machine:"
echo ""
echo "  1. On your local machine, run: npm run build"
echo "  2. Then run: rsync -avz --delete dist/ root@147.79.67.217:$WEB_ROOT"
echo ""
echo "  Visit: http://$DOMAIN:$PORT"
echo ""

# Ask about SSL
read -p "Set up HTTPS with Let's Encrypt? (y/n): " SSL_ANSWER
if [ "$SSL_ANSWER" = "y" ]; then
    # Temporarily use port 80 for certbot verification
    cat > "/etc/nginx/sites-available/$DOMAIN-ssl" << 'SSLNGINX'
server {
    listen 80;
    server_name crm.codeprophet.com.bd;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
SSLNGINX

    ln -sf "/etc/nginx/sites-available/$DOMAIN-ssl" "/etc/nginx/sites-enabled/"
    systemctl reload nginx

    certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "admin@$DOMAIN" || \
    certbot --nginx -d "$DOMAIN"

    # Replace config with SSL version
    cat > "/etc/nginx/sites-available/$DOMAIN" << 'SSLFINAL'
server {
    listen 80;
    server_name crm.codeprophet.com.bd;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name crm.codeprophet.com.bd;

    ssl_certificate /etc/letsencrypt/live/crm.codeprophet.com.bd/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/crm.codeprophet.com.bd/privkey.pem;

    root /var/www/crm.codeprophet.com.bd;
    index index.html;

    gzip on;
    gzip_types text/plain application/javascript application/json text/css;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
SSLFINAL

    rm -f "/etc/nginx/sites-enabled/$DOMAIN-ssl"
    systemctl reload nginx

    echo ""
    echo "=== HTTPS ENABLED ==="
    echo "Visit: https://$DOMAIN"
fi
