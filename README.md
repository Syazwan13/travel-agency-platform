# 🏝️ Travel Agency Platform

A comprehensive travel agency management platform with automated data scraping, package comparison, and multi-role dashboards for seamless travel package management and comparison.

## 🚀 Features

### 🔍 **Automated Data Scraping**
- **Multi-Source Scraping**: AmiTravel, HolidayGoGo, PulauMalaysia
- **Smart Scheduling**: Automated daily scraping with conflict detection
- **Real-time Monitoring**: Live progress tracking and status updates
- **Manual Controls**: Admin-triggered scraping with source selection

### 📊 **Package Comparison System**
- **Advanced Search**: Fuzzy matching and intelligent filtering
- **Side-by-Side Comparison**: Compare packages from multiple providers
- **Price Analytics**: Track pricing trends and best deals
- **Interactive Maps**: Google Maps integration with resort locations

### 🎛️ **Multi-Role Dashboards**
- **Admin Dashboard**: System monitoring, user management, scraping controls
- **Agency Dashboard**: Package management, analytics, customer inquiries
- **User Dashboard**: Saved packages, comparison history, preferences

### 🗺️ **Smart Location Mapping**
- **Coordinate Verification**: Automated resort location validation
- **Google Maps Integration**: Interactive maps with accurate positioning
- **Geocoding System**: Intelligent address-to-coordinates conversion

## 🏗️ Architecture

### **Backend** (`/backend`)
- **Framework**: Node.js + Express.js
- **Database**: MongoDB with Mongoose ODM
- **Scraping**: Puppeteer for dynamic content extraction
- **APIs**: RESTful API design with comprehensive endpoints
- **Authentication**: JWT-based auth with role-based access control

### **Frontend** (`/client`)
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS for responsive design
- **State Management**: React Context API
- **Routing**: React Router v7
- **Charts**: Chart.js for analytics visualization

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+ 
- MongoDB (local or MongoDB Atlas)
- Git

### **Development Setup**

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/travel-agency-platform.git
   cd travel-agency-platform
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd client
   npm install
   npm run dev
   ```

4. **Environment Variables**
   Create `.env` in the backend folder:
   ```env
   DATABASE_CLOUD=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   GOOGLE_MAPS_API_KEY=your_google_maps_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   # See .env.production for complete list
   ```

## 🌐 Deployment

### **DigitalOcean Deployment**
See our comprehensive [DigitalOcean Deployment Guide](DIGITALOCEAN_DEPLOYMENT_GUIDE.md) for step-by-step instructions.

**Quick Deploy:**
```bash
# On your DigitalOcean droplet
wget https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/digitalocean-setup.sh
chmod +x digitalocean-setup.sh
./digitalocean-setup.sh
```

### **Production Checklist**
- [ ] Set up MongoDB Atlas or secure self-hosted MongoDB
- [ ] Configure environment variables for production
- [ ] Set up SSL certificate (Let's Encrypt)
- [ ] Configure Nginx reverse proxy
- [ ] Set up PM2 for process management
- [ ] Enable automated backups

## 📖 Documentation

- [📋 Automated Scraping System](AUTOMATED_SCRAPING_SYSTEM.md)
- [📦 Package Comparison Implementation](PACKAGE_COMPARISON_IMPLEMENTATION.md)
- [🎛️ Dashboard Implementation Guide](DASHBOARD_IMPLEMENTATION.md)
- [🌐 DigitalOcean Deployment Guide](DIGITALOCEAN_DEPLOYMENT_GUIDE.md)
- [🔧 Coordinate System Improvements](COORDINATE_SYSTEM_IMPROVEMENTS.md)

## 🛠️ API Endpoints

### **Core APIs**
- `GET /api/packages` - Get all packages with filtering
- `POST /api/packages/search` - Advanced package search
- `GET /api/packages/compare` - Compare multiple packages
- `POST /api/scraping/trigger` - Manual scraping trigger
- `GET /api/scraping/status` - Get scraping status

### **Dashboard APIs**
- `GET /api/dashboard/stats` - Dashboard analytics
- `GET /api/dashboard/users` - User management
- `POST /api/dashboard/packages` - Package management

### **Authentication**
- `POST /api/users/login` - User login
- `POST /api/users/register` - User registration
- `GET /api/users/profile` - Get user profile

## 🔧 Development Tools

### **Testing**
```bash
# Backend API testing
npm run test:api

# Frontend component testing
npm run test:components

# End-to-end testing
npm run test:e2e
```

### **Code Quality**
```bash
# ESLint check
npm run lint

# Format code
npm run format

# Type checking (if TypeScript)
npm run type-check
```

## 📊 System Requirements

### **Minimum Requirements**
- **RAM**: 2GB (4GB recommended for scraping)
- **Storage**: 20GB SSD
- **CPU**: 2 cores
- **Network**: Stable internet for scraping

### **Recommended Production**
- **RAM**: 8GB+
- **Storage**: 100GB+ SSD
- **CPU**: 4+ cores
- **Database**: Managed MongoDB Atlas
- **CDN**: CloudFlare for static assets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `/docs` folder for detailed guides
- **Issues**: Open a GitHub issue for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions

## 🔮 Roadmap

- [ ] **Mobile App**: React Native mobile application
- [ ] **AI Recommendations**: ML-powered package suggestions
- [ ] **Payment Integration**: Direct booking with payment processing
- [ ] **Multi-language**: Internationalization support
- [ ] **Advanced Analytics**: Predictive pricing and demand analysis

---

**Built with ❤️ for travelers and travel agencies worldwide**
