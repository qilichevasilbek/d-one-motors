#!/bin/bash
set -e

DOMAIN="d-one-motors.uz"
EMAIL="info@d-one-motors.uz"
SERVICE="d-one-motors"

echo "=== D-ONE MOTORS Deployment ==="
echo "Domain: $DOMAIN"
echo ""

# Step 1: Check if SSL certs already exist
if [ -d "./certbot/conf/live/$DOMAIN" ]; then
    echo "[*] SSL certificates found. Deploying with HTTPS..."

    sudo docker compose up -d --build $SERVICE

    echo "[OK] Site live at https://$DOMAIN"
else
    echo "[*] No SSL certificates found. Setting up..."

    # Step 2: Start with HTTP-only config to get certs
    echo "[1/4] Starting with HTTP-only config..."

    # Temporarily use init config
    cp nginx.conf nginx.conf.bak
    cp nginx-init.conf nginx.conf

    # Create certbot directories
    mkdir -p certbot/conf certbot/www

    sudo docker compose up -d --build $SERVICE

    echo "[2/4] Waiting for nginx to start..."
    sleep 5

    # Step 3: Get SSL certificate
    echo "[3/4] Requesting SSL certificate from Let's Encrypt..."
    sudo docker compose run --rm certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        -d "$DOMAIN" \
        -d "www.$DOMAIN" \
        --email "$EMAIL" \
        --agree-tos \
        --no-eff-email

    # Step 4: Switch to full SSL nginx config and rebuild
    echo "[4/4] Switching to HTTPS config..."
    mv nginx.conf.bak nginx.conf

    sudo docker compose up -d --build $SERVICE

    echo ""
    echo "[OK] SSL configured! Site live at https://$DOMAIN"
fi

# Start certbot auto-renewal
sudo docker compose up -d certbot

echo ""
echo "=== Deployment complete ==="
echo "  - https://$DOMAIN"
echo "  - SSL auto-renews via certbot container"
echo ""
echo "Useful commands:"
echo "  sudo docker compose logs -f $SERVICE  # View nginx logs"
echo "  sudo docker compose logs -f certbot   # View certbot logs"
echo "  sudo docker compose down              # Stop all"
echo "  sudo docker compose up -d --build $SERVICE  # Rebuild & restart"
