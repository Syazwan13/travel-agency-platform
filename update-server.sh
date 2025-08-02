#!/bin/bash

# Quick server update script for DigitalOcean deployment
echo "🚀 Starting server update..."

# Pull latest changes
echo "📥 Pulling latest changes from GitHub..."
git pull origin main

# Navigate to backend
cd backend

# Restart PM2 application
echo "🔄 Restarting application..."
pm2 restart travel-agency-app

# Show status
echo "📊 Application status:"
pm2 status

# Test the endpoints
echo "🧪 Testing endpoints..."
sleep 2
curl -s http://localhost:5001/health | jq '.' || echo "Health check endpoint response received"

echo "✅ Server update complete!"
echo "🌐 Your website should now be available at: http://139.59.116.182:5001"
