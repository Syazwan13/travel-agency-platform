# Production Deployment Checklist

This checklist helps ensure that your application deploys correctly in production, addressing the 400 Bad Request errors you're encountering.

## Frontend Deployment

1. **Environment Variables**
   - [ ] Set `VITE_API_URL` to the correct production URL: `http://167.172.66.203:5001`
   - [ ] Ensure this is set during the build process

2. **Build Process**
   ```bash
   cd client
   npm run build
   ```

3. **Static Files Configuration**
   - [ ] Ensure your web server (nginx, etc.) correctly serves your static files
   - [ ] Make sure routing is configured to handle client-side routing with `try_files $uri $uri/ /index.html;`

## Backend Deployment

1. **Environment Variables**
   - [ ] Verify `.env` file in the backend directory includes all necessary variables:
     ```
     PORT=5001
     NODE_ENV=production
     JWT_SECRET=your_secure_jwt_secret
     DATABASE_CLOUD=mongodb+srv://...
     ```
   - [ ] Ensure CORS is properly configured with the correct origins
   - [ ] Make sure cookie settings match your domain setup

2. **Authentication Configuration**
   - [ ] Ensure cookie domain settings match your production domain
   - [ ] Check that SameSite and Secure cookie flags are properly configured
   - [ ] Verify JWT secret is properly set in production

3. **Server Configuration**
   - [ ] Update CORS settings in server.js to include your production domain
   - [ ] Ensure the server is listening on the correct port

## Deployment Process

1. **Backend Deployment**
   ```bash
   cd backend
   npm install --production
   pm2 start ecosystem.config.json
   ```

2. **Verify API Endpoints**
   - [ ] Test health endpoint: `http://167.172.66.203:5001/health`
   - [ ] Test CORS test endpoint: `http://167.172.66.203:5001/cors-test`

3. **Debug Common Issues**
   - [ ] Check server logs: `pm2 logs`
   - [ ] Verify MongoDB connection: `mongo <your-connection-string> --eval "db.adminCommand('ping')"`
   - [ ] Check network connectivity: `curl -v http://167.172.66.203:5001/health`

## Specific Solutions for 400 Bad Request Issues

1. **CORS Configuration**
   - Ensure the following settings in your backend/server.js:
   ```javascript
   app.use(cors({
     origin: [
       'http://167.172.66.203', 
       'http://167.172.66.203:80',
       // Add your production frontend domain
     ],
     credentials: true,
     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
     allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
   }));
   ```

2. **Cookie Settings**
   - Update cookie settings in all authentication-related controllers:
   ```javascript
   res.cookie("token", token, {
     path: "/",
     httpOnly: true,
     expires: new Date(Date.now() + 1000 * 86400), // 1 day
     sameSite: "none", // Important for cross-origin requests
     secure: true, // Required when sameSite is 'none'
     domain: process.env.NODE_ENV === 'production' ? '167.172.66.203' : undefined // Set domain in production
   });
   ```

3. **Local Storage Token**
   - Make sure the token is properly stored in localStorage
   - Verify that the token is included in Authorization headers for API requests

## Testing Deployed Application

1. **User Authentication**
   - [ ] Test user registration
   - [ ] Test user login
   - [ ] Verify that authenticated API calls work after login

2. **Admin Dashboard**
   - [ ] Test admin login
   - [ ] Verify dashboard analytics endpoint works
   - [ ] Verify user stats endpoint works

3. **API Status Monitoring**
   - [ ] Consider implementing enhanced logging for production
   - [ ] Add monitoring for API endpoints to catch issues early

By following this checklist, you should be able to resolve the 400 Bad Request errors in your production environment.
