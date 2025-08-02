# Travel Agency Platform - DigitalOcean Deployment Guide

## 🏗️ **Pre-Deployment Checklist**

### **1. DigitalOcean Account Setup**
- [ ] Create DigitalOcean account
- [ ] Add payment method
- [ ] Generate SSH key pair
- [ ] Note your local public SSH key

### **2. Environment Preparation**
- [ ] Prepare environment variables (see `.env.production` template below)
- [ ] Set up MongoDB Atlas OR plan for self-hosted MongoDB
- [ ] Prepare domain name (optional but recommended)

## 🚀 **Deployment Steps**

### **Step 1: Create Droplet**
1. **Droplet Configuration**:
   - **Image**: Ubuntu 22.04 LTS
   - **Plan**: $24/month (4GB RAM, 2 CPUs, 80GB SSD)
   - **Datacenter**: Choose closest to your users
   - **Authentication**: Add your SSH key
   - **Additional Options**: 
     - ✅ Monitoring
     - ✅ Backups (additional $4.8/month)

### **Step 2: Initial Server Setup**
```bash
# SSH into your droplet
ssh root@YOUR_DROPLET_IP

# Run the setup script
wget https://raw.githubusercontent.com/Syazwan13/travel-agency-platform/main/digitalocean-setup.sh
chmod +x digitalocean-setup.sh
./digitalocean-setup.sh
```

### **Step 3: Deploy Your Application**
```bash
# Clone your repository
cd /var/www
git clone https://github.com/Syazwan13/travel-agency-platform.git travelagency
cd travelagency

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies and build
cd ../client
npm install
npm run build

# Go back to backend
cd ../backend
```

### **Step 4: Environment Configuration**
```bash
# Create production environment file
nano .env
```

**Environment Variables Template** (`.env`):
```env
# Server Configuration
NODE_ENV=production
PORT=5001

# Database (Option 1: MongoDB Atlas - Recommended)
DATABASE_CLOUD=mongodb+srv://username:password@cluster.mongodb.net/travelagency?retryWrites=true&w=majority

# Database (Option 2: Local MongoDB)
# DATABASE_LOCAL=mongodb://localhost:27017/travelagency

# JWT Secret (Generate a strong secret)
JWT_SECRET=your-super-strong-jwt-secret-here

# Google Maps API
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Email Configuration (for notifications)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Telegram Bot (optional)
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_CHAT_ID=your-telegram-chat-id

# Scraping Configuration
SCRAPING_BATCH_SIZE=50
SCRAPING_DELAY=2000
MAX_RETRIES=3
ENABLE_AUTOMATED_SCRAPING=true
AUTOMATED_SCRAPING_SCHEDULE=0 2 * * *

# Security
CORS_ORIGIN=https://yourdomain.com
```

### **Step 5: Nginx Configuration**
```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/travelagency
```

**Nginx Configuration**:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Serve React frontend
    location / {
        root /var/www/travelagency/client/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend
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
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
        proxy_read_timeout 300;
    }

    # Handle uploads
    location /uploads/ {
        alias /var/www/travelagency/backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/travelagency /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### **Step 6: SSL Certificate (Let's Encrypt)**
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### **Step 7: Start Application with PM2**
```bash
# Start the backend with PM2
cd /var/www/travelagency/backend
pm2 start server.js --name "travelagency-backend"

# Save PM2 configuration
pm2 save
pm2 startup

# Check status
pm2 status
pm2 logs travelagency-backend
```

## 🔧 **Production Optimizations**

### **1. MongoDB Security** (if self-hosted)
```bash
# Secure MongoDB
sudo systemctl edit mongod

# Add to the override file:
[Service]
ExecStart=
ExecStart=/usr/bin/mongod --config /etc/mongod.conf --bind_ip 127.0.0.1
```

### **2. Log Management**
```bash
# Set up log rotation
sudo nano /etc/logrotate.d/travelagency
```

### **3. Monitoring Setup**
```bash
# Install monitoring tools
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

## 💰 **Cost Estimation**

### **Minimal Setup** ($29/month)
- Droplet (4GB): $24/month
- Backups: $4.8/month

### **Recommended Production** ($99/month)
- Droplet (4GB): $24/month
- Managed MongoDB: $60/month
- Spaces Storage: $5/month
- Backups: $4.8/month
- Load Balancer: $12/month (for scaling)

### **Enterprise Setup** ($200+/month)
- Multiple droplets with load balancer
- High-availability database cluster
- CDN integration
- Advanced monitoring

## 🛠️ **Maintenance Commands**

```bash
# Update application
cd /var/www/travelagency
git pull origin main
cd client && npm run build
cd ../backend && npm install
pm2 restart travelagency-backend

# Monitor logs
pm2 logs travelagency-backend --lines 100

# Database backup
mongodump --db travelagency --out /backup/$(date +%Y%m%d)

# Check system resources
htop
df -h
free -h
```

## 🚨 **Troubleshooting**

### **Common Issues**
1. **Port conflicts**: Check if port 5001 is available
2. **Memory issues**: Monitor with `htop`, upgrade droplet if needed
3. **Puppeteer issues**: Ensure all dependencies are installed
4. **SSL certificate**: Check domain DNS settings

### **Health Check Endpoint**
Your app includes `/api/health` endpoint for monitoring.

## 📞 **Support Resources**
- DigitalOcean Documentation
- PM2 Documentation
- MongoDB Atlas Support
- Let's Encrypt Community

---

**Next Steps After Deployment**:
1. Set up monitoring and alerts
2. Configure automated backups
3. Test all functionality in production
4. Set up staging environment for updates
5. Configure CDN for better performance
