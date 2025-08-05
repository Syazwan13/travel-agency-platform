# Production Image Handling Guide

This guide explains how to properly handle images and file uploads in your production environment.

## 🏗️ **Current Setup Analysis**

Your application currently has:
- ✅ File upload middleware using Multer
- ✅ Static file serving from `/uploads` directory
- ✅ Image storage in `backend/uploads/` folders
- ❌ No production-optimized image handling

## 🚀 **Production Image Solutions**

### **Option 1: Local File System (Recommended for Your Setup)**

#### **1.1 Nginx Configuration for Static Files**

Create `/etc/nginx/sites-available/travelagency`:

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
    }

    # 🖼️ CRITICAL: Serve uploaded images
    location /uploads/ {
        alias /var/www/travelagency/backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
        add_header X-Content-Type-Options nosniff;
        
        # Security: Only allow image files
        location ~* \.(jpg|jpeg|png|gif|webp)$ {
            try_files $uri =404;
        }
        
        # Block access to other file types
        location ~* \.(php|js|css|txt|log)$ {
            deny all;
        }
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
}
```

#### **1.2 Backend Server Configuration**

Update your `backend/server.js`:

```javascript
// ✅ Serve static files from uploads directory with proper headers
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
    setHeaders: (res, path) => {
        // Set cache headers for images
        if (path.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
            res.setHeader('Cache-Control', 'public, max-age=2592000'); // 30 days
            res.setHeader('X-Content-Type-Options', 'nosniff');
        }
    }
}));
```

#### **1.3 File Upload Middleware Enhancement**

Update `backend/middleware/uploadMiddleware.js`:

```javascript
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const createUploadDirs = () => {
    const dirs = [
        path.join(__dirname, '../uploads/profile-photos'),
        path.join(__dirname, '../uploads/feedback-photos'),
        path.join(__dirname, '../uploads/package-images')
    ];
    
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
};

createUploadDirs();

// Configure storage with better file naming
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Determine upload directory based on file type or route
        let uploadDir = path.join(__dirname, '../uploads/profile-photos');
        
        if (req.route && req.route.path.includes('feedback')) {
            uploadDir = path.join(__dirname, '../uploads/feedback-photos');
        } else if (req.route && req.route.path.includes('package')) {
            uploadDir = path.join(__dirname, '../uploads/package-images');
        }
        
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Create unique filename with timestamp and random string
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        
        // Sanitize filename
        const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '_');
        cb(null, `${sanitizedName}-${uniqueSuffix}${ext}`);
    }
});

// Enhanced file filter
const fileFilter = (req, file, cb) => {
    // Check file type
    if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    
    // Check file extension
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (!allowedExtensions.includes(ext)) {
        return cb(new Error('Invalid file extension!'), false);
    }
    
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
        return cb(new Error('File size too large! Maximum 5MB allowed.'), false);
    }
    
    cb(null, true);
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 5 // Maximum 5 files per request
    }
});

module.exports = upload;
```

### **Option 2: Cloud Storage (Recommended for Scalability)**

#### **2.1 Cloudinary Integration**

Install Cloudinary:
```bash
npm install cloudinary multer-storage-cloudinary
```

Create `backend/utils/cloudinary.js`:

```javascript
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'travelagency',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [
            { width: 800, height: 600, crop: 'limit' }, // Resize large images
            { quality: 'auto:good' } // Optimize quality
        ]
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

module.exports = { upload, cloudinary };
```

#### **2.2 Environment Variables**

Add to your `.env`:
```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 🔧 **Frontend Image Handling**

### **3.1 Image Display Component**

Create `client/src/components/common/ImageDisplay.jsx`:

```jsx
import React, { useState } from 'react';

const ImageDisplay = ({ 
    src, 
    alt, 
    className = '', 
    fallbackSrc = '/placeholder-image.jpg',
    loading = 'lazy'
}) => {
    const [imageSrc, setImageSrc] = useState(src);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const handleImageLoad = () => {
        setIsLoading(false);
        setHasError(false);
    };

    const handleImageError = () => {
        setIsLoading(false);
        setHasError(true);
        setImageSrc(fallbackSrc);
    };

    return (
        <div className={`image-container ${className}`}>
            {isLoading && (
                <div className="image-loading">
                    <div className="loading-spinner"></div>
                </div>
            )}
            
            <img
                src={imageSrc}
                alt={alt}
                loading={loading}
                onLoad={handleImageLoad}
                onError={handleImageError}
                className={`image-display ${isLoading ? 'hidden' : ''}`}
                style={{ 
                    opacity: isLoading ? 0 : 1,
                    transition: 'opacity 0.3s ease-in-out'
                }}
            />
            
            {hasError && (
                <div className="image-error">
                    <span>Image not available</span>
                </div>
            )}
        </div>
    );
};

export default ImageDisplay;
```

### **3.2 Image Upload Component**

Create `client/src/components/common/ImageUpload.jsx`:

```jsx
import React, { useState, useRef } from 'react';
import axios from 'axios';

const ImageUpload = ({ 
    onUpload, 
    multiple = false, 
    maxFiles = 5,
    acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxSize = 5 * 1024 * 1024 // 5MB
}) => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef(null);

    const handleFileSelect = async (event) => {
        const files = Array.from(event.target.files);
        
        // Validate files
        const validFiles = files.filter(file => {
            if (!acceptedTypes.includes(file.type)) {
                alert(`Invalid file type: ${file.name}`);
                return false;
            }
            
            if (file.size > maxSize) {
                alert(`File too large: ${file.name} (max ${maxSize / 1024 / 1024}MB)`);
                return false;
            }
            
            return true;
        });

        if (validFiles.length === 0) return;

        setUploading(true);
        setProgress(0);

        try {
            const formData = new FormData();
            validFiles.forEach(file => {
                formData.append('images', file);
            });

            const response = await axios.post('/api/upload/images', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    setProgress(percentCompleted);
                }
            });

            if (response.data.success) {
                onUpload(response.data.images);
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Upload failed. Please try again.');
        } finally {
            setUploading(false);
            setProgress(0);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className="image-upload">
            <input
                ref={fileInputRef}
                type="file"
                multiple={multiple}
                accept={acceptedTypes.join(',')}
                onChange={handleFileSelect}
                disabled={uploading}
                style={{ display: 'none' }}
            />
            
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="upload-button"
            >
                {uploading ? 'Uploading...' : 'Choose Images'}
            </button>
            
            {uploading && (
                <div className="upload-progress">
                    <div 
                        className="progress-bar"
                        style={{ width: `${progress}%` }}
                    ></div>
                    <span>{progress}%</span>
                </div>
            )}
        </div>
    );
};

export default ImageUpload;
```

## 🚀 **Deployment Steps**

### **Step 1: Prepare Upload Directories**

```bash
# On your production server
cd /var/www/travelagency/backend
mkdir -p uploads/profile-photos
mkdir -p uploads/feedback-photos
mkdir -p uploads/package-images

# Set proper permissions
chmod 755 uploads
chmod 755 uploads/*
chown -R www-data:www-data uploads
```

### **Step 2: Update Nginx Configuration**

```bash
# Copy the nginx configuration above to your server
sudo nano /etc/nginx/sites-available/travelagency

# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### **Step 3: Restart Backend**

```bash
# Restart your Node.js application
pm2 restart all

# Check logs
pm2 logs
```

## 🔍 **Testing Image Uploads**

### **Test Upload Endpoint**

```bash
# Test file upload
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "images=@test-image.jpg" \
  http://yourdomain.com/api/upload/images
```

### **Test Image Access**

```bash
# Test if images are accessible
curl -I http://yourdomain.com/uploads/profile-photos/image-name.jpg
```

## 📊 **Performance Optimization**

### **Image Optimization**

1. **Resize images on upload**:
```javascript
const sharp = require('sharp');

const optimizeImage = async (buffer, options = {}) => {
    const { width = 800, height = 600, quality = 80 } = options;
    
    return await sharp(buffer)
        .resize(width, height, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality })
        .toBuffer();
};
```

2. **Generate thumbnails**:
```javascript
const generateThumbnail = async (buffer) => {
    return await sharp(buffer)
        .resize(200, 200, { fit: 'cover' })
        .jpeg({ quality: 70 })
        .toBuffer();
};
```

### **Caching Strategy**

```nginx
# In nginx configuration
location /uploads/ {
    expires 30d;
    add_header Cache-Control "public, immutable";
    add_header Vary "Accept-Encoding";
}
```

## 🔒 **Security Considerations**

1. **File type validation** (already implemented)
2. **File size limits** (already implemented)
3. **Secure file naming** (prevents path traversal)
4. **Access control** (nginx blocks non-image files)
5. **HTTPS enforcement** (for production)

## 💡 **Best Practices**

1. **Always validate files** on both frontend and backend
2. **Use CDN** for high-traffic applications
3. **Implement image compression** for better performance
4. **Set up monitoring** for upload failures
5. **Regular backup** of uploaded files
6. **Clean up orphaned files** periodically

This setup will give you a robust, secure, and scalable image handling system for your production environment! 