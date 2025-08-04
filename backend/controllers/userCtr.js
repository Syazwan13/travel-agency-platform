const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const AmiTravel = require('../models/amiTravelSchema');
const { HolidayGoGoPackage } = require('../models/holidayGoGoGoSchema');
const { PulauMalaysiaPackage } = require('../models/pulauMalaysiaSchema');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {expiresIn: "1d"});
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const {
        name,
        email,
        password,
        role = "user",
        phoneNumber,
        preferences,
        companyName,
        businessRegistrationNumber,
        address,
        website,
        description,
        specializations,
        contactPerson,
        whatsappNumber
    } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error("Please fill in all fields");
    }

    // Validate role
    const validRoles = ["admin", "user", "travel_agency"];
    if (!validRoles.includes(role)) {
        res.status(400);
        throw new Error("Invalid role specified");
    }

    // Additional validation for travel agency
    if (role === "travel_agency" && !companyName) {
        res.status(400);
        throw new Error("Company name is required for travel agency registration");
    }

    // Validate email format
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(email)) {
        res.status(400);
        throw new Error("Please enter a valid email address");
    }

    // Validate password length
    if (password.length < 6) {
        res.status(400);
        throw new Error("Password must be at least 6 characters");
    }

    const userExists = await User.findOne({ email });
    if(userExists) {
        res.status(400);
        throw new Error("Email is already in use");
    }

    // Prepare user data based on role
    const userData = {
        name,
        email,
        password,
        role,
        phoneNumber: phoneNumber || "",
    };

    // Add role-specific fields
    if (role === "user" && preferences) {
        userData.preferences = preferences;
    }

    if (role === "travel_agency") {
        userData.companyName = companyName;
        userData.businessRegistrationNumber = businessRegistrationNumber || "";
        userData.address = address || {};
        userData.website = website || "";
        userData.description = description || "";
        userData.specializations = specializations || [];
        userData.contactPerson = contactPerson || "";
        userData.whatsappNumber = whatsappNumber || "";
    }

    const user = await User.create(userData);

    const token = generateToken(user._id);
    
    // Set cookie options based on environment
    const cookieOptions = {
        path: "/",
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400), // 1 day
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        secure: process.env.NODE_ENV === 'production' && process.env.USE_HTTPS === 'true'
    };

    res.cookie("token", token, cookieOptions);

    if(user) {
        const {_id, name, email, photo, role} = user;
        res.status(201).json({
            _id, 
            name, 
            email, 
            photo, 
            role,
            token
        });
    } else {
        res.status(400);
        throw new Error("Invalid user data");
    }
});

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error("Please enter your email and password");
    } 

    const user = await User.findOne({ email });
    if(!user) {
        res.status(400);
        throw new Error("User not found, please sign up");
    }

    const passwordIsCorrect = await user.matchPassword(password);
    if (!passwordIsCorrect) {
        res.status(400);
        throw new Error("Invalid password");
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    const token = generateToken(user._id);
    
    // Set cookie options based on environment
    const cookieOptions = {
        path: "/",
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400), // 1 day
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        secure: process.env.NODE_ENV === 'production' && process.env.USE_HTTPS === 'true'
    };

    res.cookie("token", token, cookieOptions);

    const { _id, name, photo, role } = user;
    res.status(200).json({
        _id,
        name,
        email,
        photo,
        role,
        token
    });
});

// @desc    Get login status
// @route   GET /api/users/loggedIn
// @access  Public
const loginStatus = asyncHandler(async (req, res) => {
    const token = req.cookies.token;
    if(!token) {
        return res.json(false);
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if(verified) {
        return res.json(true);
    }
    return res.json(false);
});

// @desc    Logout user
// @route   GET /api/users/logout
// @access  Public
const logoutUser = asyncHandler(async (req, res) => {
    // Set cookie options based on environment
    const cookieOptions = {
        path: "/",
        httpOnly: true,
        expires: new Date(0),
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        secure: process.env.NODE_ENV === 'production' && process.env.USE_HTTPS === 'true'
    };
    
    res.cookie("token", "", cookieOptions);
    return res.status(200).json({ message: "Successfully logged out" });
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("-password");
    if (user) {
        res.status(200).json(user);
    } else {
        res.status(404);
        throw new Error("User not found");
    }
});

// @desc    Add package to favorites
// @route   POST /api/users/favorites
// @access  Private
const addToFavorites = asyncHandler(async (req, res) => {
    const { packageId, packageType } = req.body;
    if (!packageId || !packageType) {
        res.status(400);
        throw new Error("Please provide package ID and type");
    }
    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }
    // Check if package already in favorites
    const isAlreadyFavorite = user.favorites.some(fav => fav.packageId && fav.packageId.toString() === packageId);
    if (isAlreadyFavorite) {
        res.status(400);
        throw new Error("Package already in favorites");
    }
    user.favorites.push({ packageId });
    user.favoriteType = packageType;
    await user.save();
    // Return full favorite package details
    const favorites = await Promise.all(
        user.favorites.map(async fav => {
            let pkg = await AmiTravel.findById(fav.packageId).lean();
            if (!pkg) pkg = await HolidayGoGoPackage.findById(fav.packageId).lean();
            if (!pkg) pkg = await PulauMalaysiaPackage.findById(fav.packageId).lean();
            if (pkg) {
                return {
                    ...pkg,
                    packageId: fav.packageId
                };
            }
            return null;
        })
    );
    res.status(200).json({
        message: "Package added to favorites",
        favorites: favorites.filter(Boolean)
    });
});

// @desc    Remove package from favorites
// @route   DELETE /api/users/favorites/:packageId
// @access  Private
const removeFromFavorites = asyncHandler(async (req, res) => {
    const { packageId } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }
    user.favorites = user.favorites.filter(fav => fav.packageId && fav.packageId.toString() !== packageId);
    await user.save();
    // Return full favorite package details
    const favorites = await Promise.all(
        user.favorites.map(async fav => {
            let pkg = await AmiTravel.findById(fav.packageId).lean();
            if (!pkg) pkg = await HolidayGoGoPackage.findById(fav.packageId).lean();
            if (!pkg) pkg = await PulauMalaysiaPackage.findById(fav.packageId).lean();
            if (pkg) {
                return {
                    ...pkg,
                    packageId: fav.packageId
                };
            }
            return null;
        })
    );
    res.status(200).json({
        message: "Package removed from favorites",
        favorites: favorites.filter(Boolean)
    });
});

// @desc    Get user's favorite packages
// @route   GET /api/users/favorites
// @access  Private
const getFavorites = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }
    // Fetch each favorite from the correct collection
    const favorites = await Promise.all(
        user.favorites.map(async fav => {
            // Try each model
            let pkg = await AmiTravel.findById(fav.packageId).lean();
            if (!pkg) pkg = await HolidayGoGoPackage.findById(fav.packageId).lean();
            if (!pkg) pkg = await PulauMalaysiaPackage.findById(fav.packageId).lean();
            if (pkg) {
                return {
                    ...pkg,
                    packageId: fav.packageId
                };
            }
            return null;
        })
    );
    res.status(200).json(favorites.filter(Boolean));
});

// @desc    Add search to history
// @route   POST /api/users/search-history
// @access  Private
const addSearchHistory = asyncHandler(async (req, res) => {
    const { query } = req.body;
    
    if (!query) {
        res.status(400);
        throw new Error("Please provide search query");
    }

    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    user.searchHistory.push({ query });
    await user.save();

    res.status(200).json({
        message: "Search added to history",
        searchHistory: user.searchHistory
    });
});

// @desc    Get user's search history
// @route   GET /api/users/search-history
// @access  Private
const getSearchHistory = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
        .select('searchHistory')
        .sort({ 'searchHistory.timestamp': -1 });

    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    res.status(200).json(user.searchHistory);
});

// @desc    Get user's balance
// @route   GET /api/users/sell-amount
// @access  Private
const getUserBalance = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('balance');
    
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    res.status(200).json({
        balance: user.balance
    });
});

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private/Admin
const getAllUser = asyncHandler(async (req, res) => {
    const users = await User.find().select('-password');
    res.status(200).json(users);
});

// @desc    Get estimated income (admin only)
// @route   GET /api/users/estimate-income
// @access  Private/Admin
const estimateIncome = asyncHandler(async (req, res) => {
    const users = await User.find();
    const totalCommission = users.reduce((acc, user) => acc + user.commisionBalance, 0);
    
    res.status(200).json({
        totalUsers: users.length,
        totalCommission
    });
});

module.exports = {
    registerUser,
    loginUser,
    loginStatus,
    logoutUser,
    getUser,
    addToFavorites,
    removeFromFavorites,
    getFavorites,
    addSearchHistory,
    getSearchHistory,
    getUserBalance,
    getAllUser,
    estimateIncome
};