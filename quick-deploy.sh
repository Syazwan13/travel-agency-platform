#!/bin/bash

# Quick deployment script for DigitalOcean - Fixed Version
# Run this script as root on your DigitalOcean droplet

echo "🚀 Travel Agency Platform - Quick Deployment..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Please run as root (use sudo)"
    exit 1
fi

# Update system first
echo "📦 Updating system..."
apt update && apt upgrade -y

# Install Node.js 20.x if not installed
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js 20.x..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

# Install PM2 if not installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
fi

# Install Git if not installed
if ! command -v git &> /dev/null; then
    echo "📦 Installing Git..."
    apt install -y git
fi

# Install Puppeteer dependencies
echo "📦 Installing Chrome/Puppeteer dependencies..."
apt-get install -y \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    wget \
    xdg-utils

# Create /var/www directory if it doesn't exist
echo "📁 Creating application directory..."
mkdir -p /var/www
cd /var/www

# Remove existing directory if it exists
if [ -d "travelagency" ]; then
    echo "🧹 Removing existing deployment..."
    rm -rf travelagency
fi

# Clone repository
echo "📥 Cloning repository..."
git clone https://github.com/Syazwan13/travel-agency-platform.git travelagency
cd travelagency

# Check if clone was successful
if [ ! -d "backend" ] || [ ! -d "client" ]; then
    echo "❌ Error: Repository clone failed or missing directories"
    exit 1
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install --production

# Create logs directory
mkdir -p logs

# Install frontend dependencies and build
echo "🏗️ Building frontend..."
cd ../client
npm install
npm run build

# Return to backend directory
cd ../backend

# Check if .env exists, if not create template
if [ ! -f ".env" ]; then
    echo "📝 Creating environment template..."
    cat > .env << EOF
# Server Configuration
NODE_ENV=production
PORT=5001

# Database (MongoDB Atlas - Replace with your connection string)
DATABASE_CLOUD=mongodb+srv://username:password@cluster.mongodb.net/travelagency?retryWrites=true&w=majority

# JWT Secret (Replace with a strong secret)
JWT_SECRET=your-super-strong-jwt-secret-change-this

# Google Maps API (Replace with your API key)
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Cloudinary (Replace with your credentials)
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Scraping Configuration
SCRAPING_BATCH_SIZE=50
SCRAPING_DELAY=2000
MAX_RETRIES=3
ENABLE_AUTOMATED_SCRAPING=true
EOF
    echo "⚠️  IMPORTANT: Edit /var/www/travelagency/backend/.env with your actual configuration values!"
fi

# Stop any existing PM2 processes
echo "🔄 Stopping existing processes..."
pm2 delete travelagency-backend 2>/dev/null || true

# Start application with PM2
echo "🚀 Starting application..."
pm2 start ecosystem.config.json

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup systemd -u root --hp /root

echo ""
echo "✅ Deployment Complete!"
echo ""
echo "📊 Application Status:"
pm2 status
echo ""
echo "🔧 Next Steps:"
echo "1. Edit environment file: nano /var/www/travelagency/backend/.env"
echo "2. Restart application: pm2 restart travelagency-backend"
echo "3. Setup Nginx reverse proxy (optional)"
echo "4. Setup SSL certificate (optional)"
echo ""
echo "🌐 Your application should be running on port 5001"
echo "   Access it at: http://YOUR_SERVER_IP:5001"
