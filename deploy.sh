#!/bin/bash

# Quick deployment script for DigitalOcean
# Run this script after initial server setup

echo "🚀 Deploying Travel Agency Platform..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in backend directory. Please run from backend folder."
    exit 1
fi

# Install production dependencies
echo "📦 Installing backend dependencies..."
npm install --production

# Build frontend
echo "🏗️ Building frontend..."
cd ../client
npm install
npm run build

# Return to backend
cd ../backend

# Create logs directory
mkdir -p logs

# Set up environment if not exists
if [ ! -f ".env" ]; then
    echo "📝 Setting up environment file..."
    cp ../.env.production .env
    echo "⚠️  Please edit .env file with your actual configuration values"
fi

# Start application with PM2
echo "🔄 Starting application with PM2..."
pm2 delete travelagency-backend 2>/dev/null || true
pm2 start ecosystem.config.json

# Save PM2 configuration
pm2 save

# Show status
echo "✅ Deployment complete!"
echo ""
echo "📊 Application Status:"
pm2 status

echo ""
echo "📝 Next Steps:"
echo "1. Edit .env file with your actual configuration"
echo "2. Restart PM2: pm2 restart travelagency-backend"
echo "3. Check logs: pm2 logs travelagency-backend"
echo "4. Set up SSL certificate if using custom domain"
