const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

// Define asyncHandler function to handle async errors
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

const protect = asyncHandler(async (req, res, next) => {
    try {
        // Added debugging logs
        console.log('------ Auth Middleware ------');
        console.log('Cookies received:', req.cookies);
        console.log('Headers:', {
            origin: req.headers.origin,
            referer: req.headers.referer,
            host: req.headers.host,
            authorization: req.headers.authorization ? 'Present' : 'Not present'
        });
        
        // Check for token in cookies
        const token = req.cookies.token;
        console.log('Token in cookies:', token ? 'Found' : 'Not found');
        
        // Also check Authorization header as fallback
        let headerToken;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            headerToken = req.headers.authorization.split(' ')[1];
            console.log('Token in Authorization header:', 'Found');
        }
        
        // Use token from cookies or header
        const tokenToUse = token || headerToken;
        
        if(!tokenToUse) {
            console.log('No token found in request');
            res.status(401).json({ message: "Not authorized to access this page, please login" });
            return;
        }

        console.log('Verifying token...');
        const verified = jwt.verify(tokenToUse, process.env.JWT_SECRET);
        console.log('Token verified, user ID:', verified.id);
        
        const user = await User.findById(verified.id).select("-password");

        if(!user) {
            console.log('User not found in database');
            res.status(401).json({ message: "User not found" });
            return;
        }

        console.log('Authentication successful for user:', user.name || user.email);
        req.user = user;
        next();
    } catch (error) {
        console.error('Authentication error:', error.message);
        res.status(401).json({ message: `Authentication failed: ${error.message}` });
        return;
    }
});

const isAdmin = (req, res, next) => {
    if(req.user && req.user.role === "admin") {
        next();
    } else {
        res.status(403).json({ message: "Not authorized as an admin" });
        return;
    }
};

const isUser = (req, res, next) => {
    if(req.user && (req.user.role === "user" || req.user.role === "admin")) {
        next();
    } else {
        res.status(403).json({ message: "Access Denied" });
        return;
    }
};

const isTravelAgency = (req, res, next) => {
    if(req.user && req.user.role === "travel_agency") {
        // Check if travel agency is approved
        if(req.user.status !== "active") {
            res.status(403).json({ message: "Your travel agency account is pending approval. Please wait for admin approval." });
            return;
        }
        next();
    } else {
        res.status(403).json({ message: "Not authorized as a travel agency" });
        return;
    }
};

const isAdminOrTravelAgency = (req, res, next) => {
    if(req.user && req.user.role === "admin") {
        next();
    } else if(req.user && req.user.role === "travel_agency") {
        // Check if travel agency is approved
        if(req.user.status !== "active") {
            res.status(403).json({ message: "Your travel agency account is pending approval. Please wait for admin approval." });
            return;
        }
        next();
    } else {
        res.status(403).json({ message: "Access Denied - Admin or Travel Agency access required" });
        return;
    }
};

const isSeller = (req, res, next) => {
    if(req.user && (req.user.role === "user" || req.user.role === "admin")) {
        next();
    } else {
        res.status(403).json({ message: "Access Denied" });
        return;
    }
};

const isApproved = (req, res, next) => {
    if(req.user) {
        if(req.user.status !== "active") {
            const message = req.user.role === "travel_agency" 
                ? "Your travel agency account is pending admin approval. You will be notified once approved."
                : `Your account status is ${req.user.status}. Please contact support.`;
            res.status(403).json({ message });
            return;
        }
        next();
    } else {
        res.status(401).json({ message: "User not found" });
        return;
    }
};

module.exports = {
    protect,
    isAdmin,
    isUser,
    isTravelAgency,
    isAdminOrTravelAgency,
    isSeller,
    isApproved
};