# Single Droplet Architecture for Travel Agency Platform

## 🏗️ **Complete Stack on One Droplet ($24/month)**

```
┌─────────────────────────────────────────────────────────────┐
│                    DigitalOcean Droplet                    │
│                   Ubuntu 22.04 LTS                         │
│                    4GB RAM, 2 CPUs                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🌐 Nginx (Port 80/443)                                   │
│  ├── Frontend: React App (served as static files)         │
│  └── Backend: Proxy to Node.js (Port 5001)               │
│                                                             │
│  🚀 Node.js Backend (Port 5001)                           │
│  ├── Express.js API server                                │
│  ├── JWT Authentication                                    │
│  ├── File upload handling                                  │
│  └── Package search & comparison                           │
│                                                             │
│  🕷️ Web Scraping Service                                  │
│  ├── Puppeteer + Chrome                                   │
│  ├── Automated cron jobs (2 AM daily)                     │
│  ├── Manual trigger from admin dashboard                   │
│  └── Multi-source scraping (AmiTravel, etc.)             │
│                                                             │
│  🗄️ MongoDB Database                                      │
│  ├── Package data storage                                 │
│  ├── User accounts & preferences                          │
│  ├── Scraping logs & analytics                           │
│  └── Local storage (ultra-fast queries)                   │
│                                                             │
│  📁 File Storage                                           │
│  ├── User uploaded images                                 │
│  ├── Feedback attachments                                 │
│  └── Backup files                                         │
│                                                             │
│  🔧 Process Management (PM2)                              │
│  ├── Auto-restart Node.js on crashes                     │
│  ├── Load balancing across CPU cores                      │
│  ├── Log management and rotation                          │
│  └── Memory usage monitoring                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘

🌍 Internet Traffic Flow:
User → Domain (your-travel-site.com) → Droplet IP → Nginx → 
├── Static files (React) for frontend requests
└── Node.js backend for /api/* requests
```

## 🚀 **Deployment Process:**

### **Step 1: Server Setup (5 minutes)**
```bash
# Automated setup script handles:
- Node.js installation
- MongoDB installation  
- Nginx configuration
- PM2 process manager
- Firewall setup
- SSL certificate (Let's Encrypt)
```

### **Step 2: Code Deployment (3 minutes)**
```bash
# Clone from GitHub
git clone https://github.com/Syazwan13/travel-agency-platform.git

# Build frontend
cd client && npm install && npm run build

# Start backend
cd backend && npm install && pm2 start server.js
```

### **Step 3: Nginx Configuration (2 minutes)**
```nginx
# Serves React app for all routes
location / {
    root /var/www/travelagency/client/dist;
    try_files $uri $uri/ /index.html;
}

# Proxies API calls to Node.js backend
location /api/ {
    proxy_pass http://localhost:5001;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

## 💰 **Cost Breakdown:**
- **Droplet (4GB)**: $24/month
- **Domain name**: $12/year (~$1/month)
- **Backups**: $4.8/month (optional but recommended)
- **Total**: $25-30/month for everything

## 🔄 **Traffic Flow Example:**
1. **User visits** `your-travel-site.com`
2. **Nginx serves** React frontend (static files)
3. **React makes API calls** to `/api/packages`
4. **Nginx proxies** to Node.js backend on port 5001
5. **Backend queries** local MongoDB database
6. **Response sent back** through same path

## 🎯 **Perfect for Your Needs Because:**
- ✅ **Web scraping works flawlessly** (full system control)
- ✅ **Fast database queries** (no network latency)
- ✅ **Simple deployment** (one server, one configuration)
- ✅ **Cost effective** (everything included)
- ✅ **Easy debugging** (all logs in one place)
- ✅ **Room to grow** (can upgrade droplet size anytime)

## 🔧 **Management Tools:**
- **PM2 Dashboard**: Monitor Node.js processes
- **MongoDB Compass**: Database management GUI
- **Nginx logs**: Web server access logs
- **System monitoring**: htop, disk usage, memory
