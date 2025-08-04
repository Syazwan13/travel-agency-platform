# Production CORS Fix

This document addresses issues with CORS in the production environment at `http://167.172.66.203:5001`.

## Current Issues

1. The frontend at `http://167.172.66.203` is making requests to the API at `http://167.172.66.203:5001`
2. These requests are returning 400 Bad Request errors
3. Authentication tokens are not being properly processed in production

## Backend CORS Configuration Fix

Update the CORS configuration in `backend/server.js` to ensure it properly handles production requests:

```javascript
// CORS configuration - Enhanced for both specific environments and troubleshooting
app.use(cors({
  // Allow specific origins AND set to true for allowed origins
  origin: function(origin, callback) {
    const allowedOrigins = [
      // Local development
      'http://localhost:5173', 
      'http://localhost:3000',
      
      // Production - include all possible variations of your production domain
      'http://167.172.66.203',
      'https://167.172.66.203',
      'http://167.172.66.203:5001',
      'https://167.172.66.203:5001',
      'http://167.172.66.203:3000',
      'http://167.172.66.203:80'
    ];
    
    // Always log the origin for debugging
    console.log('CORS request from origin:', origin || 'no origin');
    
    // For development & troubleshooting - allow requests with no origin
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn('CORS request from unauthorized origin:', origin);
      // For production, be more strict about origins
      if (process.env.NODE_ENV === 'production') {
        // In production, you might want to reject unauthorized origins
        // Temporarily allow all origins while debugging
        callback(null, true);
        
        // Switch to this when CORS issues are resolved:
        // callback(new Error('Not allowed by CORS'));
      } else {
        // In development, allow all origins for easier testing
        callback(null, true);
      }
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

// Add debug middleware for tracking requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - Origin: ${req.headers.origin || 'none'}`);
  if (req.headers.authorization) {
    console.log('  Authorization header present');
  }
  if (req.cookies.token) {
    console.log('  Token cookie present');
  }
  next();
});
```

## Cookie Configuration Fix

Update the cookie settings in your authentication controllers (userCtr.js):

```javascript
// Set cookie options based on environment
const cookieOptions = {
  path: "/",
  httpOnly: true,
  expires: new Date(Date.now() + 1000 * 86400), // 1 day
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  secure: process.env.NODE_ENV === 'production'
};

// If in production and using a specific domain
if (process.env.NODE_ENV === 'production') {
  // Only add domain in production to avoid localhost issues
  // cookieOptions.domain = '167.172.66.203'; // Uncomment and test carefully
}

// Set the token cookie with the appropriate options
res.cookie("token", token, cookieOptions);
```

## Frontend API Configuration

Ensure that the frontend is using the correct API URL in production:

1. Set the VITE_API_URL environment variable when building:
   ```bash
   VITE_API_URL=http://167.172.66.203:5001 npm run build
   ```

2. Update your apiConfig.js to handle different environments:
   ```javascript
   import axios from 'axios';

   // Get API URL from environment variables, with fallbacks
   let API_URL = import.meta.env.VITE_API_URL;
   
   // If not set, determine based on hostname
   if (!API_URL) {
     if (window.location.hostname === 'localhost') {
       API_URL = 'http://localhost:5001';
     } else {
       API_URL = 'http://167.172.66.203:5001';
     }
   }
   
   console.log('API Config - Using API URL:', API_URL);
   ```

## Production Deployment Steps

1. Update the backend code with the CORS fixes
2. Restart the backend server
3. Build the frontend with the correct environment variables
4. Deploy the frontend build to your web server

After implementing these changes, the 400 Bad Request errors should be resolved in your production environment.
