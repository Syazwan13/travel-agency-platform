#!/bin/bash

# SSL Setup with Let's Encrypt for Travel Agency Platform
# Make sure you have a domain pointing to your server before running this

echo "🔒 Setting up SSL certificate with Let's Encrypt..."

# Check if domain is provided
if [ -z "$1" ]; then
    echo "❌ Please provide your domain name"
    echo "Usage: ./setup-ssl.sh yourdomain.com"
    exit 1
fi

DOMAIN=$1

# Install Certbot
echo "📦 Installing Certbot..."
apt update
apt install -y snapd
snap install core; snap refresh core
snap install --classic certbot

# Create symlink
ln -sf /snap/bin/certbot /usr/bin/certbot

# Update Nginx configuration with domain
echo "🔧 Updating Nginx configuration..."
sed -i "s/YOUR_DOMAIN_OR_IP/$DOMAIN/g" /etc/nginx/sites-available/travelagency

# Test Nginx configuration
nginx -t
if [ $? -ne 0 ]; then
    echo "❌ Nginx configuration error!"
    exit 1
fi

# Reload Nginx
systemctl reload nginx

# Obtain SSL certificate
echo "🔒 Obtaining SSL certificate for $DOMAIN..."
certbot --nginx -d $DOMAIN

# Check if certificate was obtained successfully
if [ $? -eq 0 ]; then
    echo "✅ SSL certificate installed successfully!"
    echo "🌐 Your site is now accessible at: https://$DOMAIN"
    
    # Set up auto-renewal
    echo "⚙️ Setting up automatic certificate renewal..."
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
    
    echo ""
    echo "🎉 Deployment complete!"
    echo "Your travel agency platform is now live at: https://$DOMAIN"
else
    echo "❌ Failed to obtain SSL certificate"
    echo "Please ensure:"
    echo "1. Your domain is pointing to this server"
    echo "2. Port 80 and 443 are open"
    echo "3. No other services are using these ports"
fi
