#!/bin/bash

echo "=== Gmail SMTP Configuration Update ==="
echo ""
echo "Please provide your Gmail configuration:"
echo ""

# Read Gmail configuration
read -p "Enter your Gmail address: " GMAIL_ADDRESS
read -p "Enter your 16-character App Password: " APP_PASSWORD

echo ""
echo "Updating server configuration..."

# SSH into server and update .env file
ssh root@167.172.66.203 "cd /var/www/travelagency/backend && sed -i 's/SMTP_HOST=.*/SMTP_HOST=smtp.gmail.com/' .env && sed -i 's/SMTP_PORT=.*/SMTP_PORT=587/' .env && sed -i 's/SMTP_EMAIL=.*/SMTP_EMAIL=$GMAIL_ADDRESS/' .env && sed -i 's/SMTP_PASS=.*/SMTP_PASS=$APP_PASSWORD/' .env && sed -i 's/SMTP_FROM_EMAIL=.*/SMTP_FROM_EMAIL=$GMAIL_ADDRESS/' .env && sed -i 's/SMTP_FROM_NAME=.*/SMTP_FROM_NAME=Travel Agency/' .env"

echo "Configuration updated successfully!"
echo ""
echo "Restarting backend server..."

# Restart the backend server
ssh root@167.172.66.203 "cd /var/www/travelagency/backend && pm2 restart travelagency-backend"

echo ""
echo "✅ Gmail SMTP configuration updated and server restarted!"
echo "You can now test the forgot password functionality." 