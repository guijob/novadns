#!/bin/bash
set -e

# ─── NovaDNS Lightsail Setup Script (Coolify) ───
# Run on a fresh Ubuntu instance:
#   bash setup.sh

echo "==> Updating system..."
sudo apt-get update && sudo apt-get upgrade -y

echo "==> Installing Coolify..."
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | sudo bash

echo ""
echo "============================================"
echo "  Coolify is installed!"
echo "============================================"
echo ""
echo "Next steps:"
echo ""
echo "  1. Open http://$(curl -s ifconfig.me):8000 in your browser"
echo "  2. Create your admin account"
echo "  3. Add a new project > Add resource > Public Repository (or connect GitHub)"
echo "  4. Set the build pack to 'Dockerfile'"
echo "  5. Add your environment variables from .env.local"
echo "  6. Set your domain (Coolify handles SSL automatically)"
echo "  7. Deploy!"
echo ""
echo "After that, every push to main auto-deploys."
echo ""
