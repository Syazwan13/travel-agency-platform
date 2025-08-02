const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

const protect = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies.token
        if(!token) {
            res.status(401)
            throw new Error("Not authorized to access this page, please login");
        }

        const verified = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(verified.id).select("-password");

        if(!user) {
            res.status(401)
            throw new Error("User not found");
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(400);
        throw new Error("Not authorized to access this page, please login");
    }
});

const isAdmin = (req, res, next) => {
    if(req.user && req.user.role === "admin") {
        next();
    } else {
        res.status(403);
        throw new Error("Not authorized as an admin");
    }
};

const isUser = (req, res, next) => {
    if(req.user && (req.user.role === "user" || req.user.role === "admin")) {
        next();
    } else {
        res.status(403);
        throw new Error("Access Denied");
    }
};

const isTravelAgency = (req, res, next) => {
    if(req.user && req.user.role === "travel_agency") {
        // Check if travel agency is approved
        if(req.user.status !== "active") {
            res.status(403);
            throw new Error("Your travel agency account is pending approval. Please wait for admin approval.");
        }
        next();
    } else {
        res.status(403);
        throw new Error("Not authorized as a travel agency");
    }
};

const isAdminOrTravelAgency = (req, res, next) => {
    if(req.user && req.user.role === "admin") {
        next();
    } else if(req.user && req.user.role === "travel_agency") {
        // Check if travel agency is approved
        if(req.user.status !== "active") {
            res.status(403);
            throw new Error("Your travel agency account is pending approval. Please wait for admin approval.");
        }
        next();
    } else {
        res.status(403);
        throw new Error("Access Denied - Admin or Travel Agency access required");
    }
};

const isSeller = (req, res, next) => {
    if(req.user && (req.user.role === "user" || req.user.role === "admin")) {
        next();
    } else {
        res.status(403);
        throw new Error("Access Denied");
    }
};

const isApproved = (req, res, next) => {
    if(req.user) {
        if(req.user.status !== "active") {
            const message = req.user.role === "travel_agency" 
                ? "Your travel agency account is pending admin approval. You will be notified once approved."
                : `Your account status is ${req.user.status}. Please contact support.`;
            res.status(403);
            throw new Error(message);
        }
        next();
    } else {
        res.status(401);
        throw new Error("User not found");
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