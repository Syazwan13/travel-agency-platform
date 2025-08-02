# Quick Fix for Your Current DigitalOcean Deployment Issue

## Current Situation
You're getting errors because:
1. `/var/www` directory doesn't exist
2. You're cloning the repository multiple times
3. The deployment script needs to be run from the backend directory

## Quick Fix Commands

Run these commands on your DigitalOcean server:

```bash
# 1. Clean up any existing clones
cd ~
rm -rf travelagency

# 2. Create proper directory structure
sudo mkdir -p /var/www
cd /var/www

# 3. Clone repository properly (only once!)
sudo git clone https://github.com/Syazwan13/travel-agency-platform.git travelagency
cd travelagency

# 4. Fix ownership
sudo chown -R $USER:$USER /var/www/travelagency

# 5. Install backend dependencies
cd backend
npm install --production

# 6. Create logs directory
mkdir -p logs

# 7. Build frontend
cd ../client
npm install
npm run build

# 8. Return to backend and deploy
cd ../backend
chmod +x ../deploy.sh
../deploy.sh
```

## If You Want to Use the New Quick Deploy Script

Instead of the above, you can use the new all-in-one script:

```bash
# 1. Clean up
cd ~
rm -rf travelagency

# 2. Download and run the new quick deploy script
wget https://raw.githubusercontent.com/YOUR_USERNAME/travel-agency-platform/main/quick-deploy.sh
chmod +x quick-deploy.sh
sudo ./quick-deploy.sh
```

## Environment Configuration

After deployment, you MUST configure your environment:

```bash
# Edit the environment file
nano /var/www/travelagency/backend/.env

# Add your actual values for:
# - DATABASE_CLOUD (MongoDB connection string)
# - JWT_SECRET (generate a strong secret)
# - GOOGLE_MAPS_API_KEY
# - CLOUDINARY credentials
# - EMAIL credentials

# Restart the application
pm2 restart travelagency-backend
```

## Verify Deployment

```bash
# Check application status
pm2 status

# Check logs if there are issues
pm2 logs travelagency-backend

# Test the application
curl http://localhost:5001/api/health
```

## Access Your Application

Your application will be available at:
- `http://YOUR_SERVER_IP:5001`

## Optional: Setup Nginx Reverse Proxy

```bash
# Install Nginx
sudo apt install -y nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/travelagency

# Add this configuration:
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_IP;

    location / {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable the site
sudo ln -s /etc/nginx/sites-available/travelagency /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

This will make your application available on port 80 (standard HTTP port).
