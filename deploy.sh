#!/bin/bash
set -e

echo "=== D-ONE MOTORS Deployment ==="
sudo docker compose up -d --build d-one-motors
echo ""
echo "=== Done! Container running on port 3001 ==="
echo "Host nginx proxies: d-one-motors.uz → localhost:3001"
