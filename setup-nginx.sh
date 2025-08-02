#!/bin/bash

# Nginx setup script for Travel Agency Platform
# Run this on your DigitalOcean droplet after the main deployment

echo "🌐 Setting up Nginx reverse proxy..."

# Install Nginx
apt update
apt install -y nginx

# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Create new site configuration
cat > /etc/nginx/sites-available/travelagency << 'EOF'
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_IP;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;

    # Serve static files (frontend build)
    location / {
        root /var/www/travelagency/client/dist;
        try_files $uri $uri/ /index.html;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API routes
    location /api/ {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Handle uploads
    location /uploads/ {
        alias /var/www/travelagency/backend/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Health check
    location /health {
        proxy_pass http://localhost:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Enable the site
ln -s /etc/nginx/sites-available/travelagency /etc/nginx/sites-enabled/

# Test Nginx configuration
nginx -t

if [ $? -eq 0 ]; then
    # Restart Nginx
    systemctl restart nginx
    systemctl enable nginx
    
    echo "✅ Nginx configured successfully!"
    echo "🌐 Your application is now accessible via your domain/IP"
    echo ""
    echo "📝 Next steps:"
    echo "1. Update the server_name in /etc/nginx/sites-available/travelagency"
    echo "2. Set up SSL certificate with Let's Encrypt (recommended)"
    echo "3. Point your domain to this server's IP address"
else
    echo "❌ Nginx configuration test failed!"
    echo "Please check the configuration file."
fi
