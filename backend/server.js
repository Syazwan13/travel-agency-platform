// ✅ Always require dotenv at the very top
require('dotenv').config(); // Automatically loads .env in the same folder

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const fs = require('fs');

const websiteScrapeRoute = require('./routes/websiteScrapeRoutes');
const packageRoute = require('./routes/packageRoutes');
const userRoute = require('./routes/userRoute');
const profileRoute = require('./routes/profileRoutes');
const dashboardRoute = require('./routes/dashboardRoutes');
const scrapingRoute = require('./routes/scrapingRoutes');
const inquiryRoute = require('./routes/inquiryRoutes');
const resortRoute = require('./routes/resortRoutes');
const cronScheduler = require('./services/cronScheduler');
const errorHandler = require('./middleware/errorMiddleWare');
const feedbackRoutes = require('./routes/feedbackRoutes');
const telegramBotService = require('./services/telegramService');

// Ensure uploads/feedback-photos directory exists
const feedbackPhotosDir = path.join(__dirname, 'uploads/feedback-photos');
if (!fs.existsSync(feedbackPhotosDir)) {
  fs.mkdirSync(feedbackPhotosDir, { recursive: true });
}

const app = express();

// ✅ Detailed startup logging
console.log('Starting server...');
console.log('process.cwd():', process.cwd());
console.log('Environment:', process.env.NODE_ENV);
console.log('Port:', process.env.PORT);
console.log('Database URL:', process.env.DATABASE_CLOUD ? 'Set' : 'Not set');

// ✅ Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads', 'profile-photos');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Created uploads directory:', uploadDir);
}

// ✅ Middleware
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// CORS configuration - Enhanced for both specific environments and troubleshooting
app.use(cors({
  // Allow specific origins AND set to true for allowed origins
  origin: function(origin, callback) {
    const allowedOrigins = [
      // Local development
      'http://localhost:5173', 
      'http://localhost:3000',
      
      // Production
      'http://167.172.66.203',
      'http://167.172.66.203:5001',
      'http://167.172.66.203:3000',
      'http://167.172.66.203:80'
    ];
    
    // For development & troubleshooting - allow requests with no origin
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS request from:', origin);
      // For troubleshooting - allow all origins temporarily
      callback(null, true);
      
      // Change to this when troubleshooting is complete:
      // callback(new Error('Not allowed by CORS'));
    }
  },
  
  // Important: These settings are needed for cookies/auth to work properly
  credentials: true,
      
  // Allow all common methods
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  
  // Allow all the headers that might be used
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Accept', 
    'Origin', 
    'Access-Control-Request-Method', 
    'Access-Control-Request-Headers'
  ],
  
  // Allow browsers to receive these headers in response
  exposedHeaders: ['Content-Length', 'X-Total-Count']
}));

console.log('CORS configured for local, production and troubleshooting');

// ✅ Routes
app.get('/', (req, res) => {
  res.json({ message: 'Travel scraping API is running...', timestamp: new Date().toISOString() });
});

app.get('/health', (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  };
  res.json(health);
});

// Debug endpoint for CORS testing
app.get('/cors-test', (req, res) => {
  res.json({ 
    message: 'CORS is working properly',
    origin: req.headers.origin,
    headers: req.headers,
    timestamp: new Date().toISOString()
  });
});

app.use("/api/websitescrape", websiteScrapeRoute);
app.use("/api/packages", packageRoute);
app.use("/api/users", userRoute);
app.use("/api/profile", profileRoute);
app.use("/api/dashboard", dashboardRoute);
app.use("/api/scraping", scrapingRoute);
app.use("/api/inquiries", inquiryRoute);
app.use('/api/resorts', resortRoute);
app.use('/api/feedback', feedbackRoutes);

// ✅ Test route to check if image exists
app.get('/test-image', (req, res) => {
  const imagePath = path.join(__dirname, '../client/dist/images/home/hero-travel.jpg');
  const exists = fs.existsSync(imagePath);
  res.json({
    success: true,
    imageExists: exists,
    imagePath: imagePath,
    message: exists ? 'Image file found' : 'Image file not found'
  });
});

console.log('Routes configured');

// ✅ Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Serve static files from client dist directory (IMAGES MUST COME BEFORE CATCH-ALL)
app.use(express.static(path.join(__dirname, '../client/dist'), {
  setHeaders: (res, filePath) => {
    // Log static file requests for debugging
    if (filePath.includes('.jpg') || filePath.includes('.png') || filePath.includes('.gif')) {
      console.log('📁 Serving static file:', filePath);
      // Set proper cache headers for images
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
  }
}));

// ✅ Add explicit route for testing image serving
app.get('/test-image', (req, res) => {
  const imagePath = path.join(__dirname, '../client/dist/images/home/hero-travel.jpg');
  console.log('🧪 Testing image at path:', imagePath);
  
  if (fs.existsSync(imagePath)) {
    console.log('✅ Image file exists');
    res.json({ 
      status: 'success', 
      imagePath: '/images/home/hero-travel.jpg',
      fullPath: imagePath,
      exists: true 
    });
  } else {
    console.log('❌ Image file not found');
    res.status(404).json({ 
      status: 'error', 
      message: 'Image not found',
      imagePath: '/images/home/hero-travel.jpg',
      fullPath: imagePath,
      exists: false 
    });
  }
});

// ✅ Error handler
app.use(errorHandler);

// ✅ Catch-all route for frontend (must be last)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// ✅ Initialize cron
cronScheduler.init();
console.log('Cron scheduler initialized');

// ✅ Initialize Telegram bot
telegramBotService.init();
console.log('Telegram bot service initialized');

// ✅ Connect to MongoDB
const PORT = process.env.PORT || 5001;
console.log('Attempting to connect to MongoDB...');

const mongoOptions = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

mongoose
  .connect(process.env.DATABASE_CLOUD, mongoOptions)
  .then(() => {
    console.log('MongoDB connected successfully');
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server Running on http://0.0.0.0:${PORT}`);
    });

    server.on('error', (error) => {
      console.error('Server error:', error);
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
        process.exit(1);
      }
    });

    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      
      // Shutdown Telegram bot
      telegramBotService.shutdown();
      
      // Shutdown cron scheduler
      cronScheduler.shutdown();
      
      server.close(() => {
        console.log('Server closed');
        mongoose.connection.close(false, () => {
          console.log('MongoDB connection closed');
          process.exit(0);
        });
      });
    });

    // Handle SIGINT (Ctrl+C)
    process.on('SIGINT', () => {
      console.log('SIGINT received. Shutting down gracefully...');
      
      // Shutdown Telegram bot
      telegramBotService.shutdown();
      
      // Shutdown cron scheduler  
      cronScheduler.shutdown();
      
      server.close(() => {
        console.log('Server closed');
        mongoose.connection.close(false, () => {
          console.log('MongoDB connection closed');
          process.exit(0);
        });
      });
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
