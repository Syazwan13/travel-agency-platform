// ✅ Always require dotenv at the very top
require('dotenv').config(); // Automatically loads .env in the same folder

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
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
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors({
  origin: ['http://localhost:5173', `http://139.59.116.182:${process.env.PORT || 5001}`],
  credentials: true
}));
console.log('CORS configured for:', ['http://localhost:5173', `http://139.59.116.182:${process.env.PORT || 5001}`]);

// ✅ Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Serve React frontend static files
app.use(express.static(path.join(__dirname, '../client/dist')));

// ✅ API Routes

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

app.use("/api/websitescrape", websiteScrapeRoute);
app.use("/api/packages", packageRoute);
app.use("/api/users", userRoute);
app.use("/api/profile", profileRoute);
app.use("/api/dashboard", dashboardRoute);
app.use("/api/scraping", scrapingRoute);
app.use("/api/inquiries", inquiryRoute);
app.use('/api/resorts', resortRoute);
app.use('/api/feedback', feedbackRoutes);
console.log('Routes configured');

// ✅ Catch-all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// ✅ Initialize cron
cronScheduler.init();
console.log('Cron scheduler initialized');

// ✅ Error handler
app.use(errorHandler);

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
    const server = app.listen(PORT, () => {
      console.log(`Server Running on http://localhost:${PORT}`);
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
