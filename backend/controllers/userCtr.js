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

// @desc    Forgot password - send reset email
// @route   POST /api/users/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        res.status(400);
        throw new Error('Please provide your email address');
    }

    const user = await User.findOne({ email });
    if (!user) {
        res.status(404);
        throw new Error('User not found with this email address');
    }

    // Generate reset token
    const resetToken = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    // Create reset URL
    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password?token=${resetToken}`;

    // Email content
    const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1E40AF;">Password Reset Request</h2>
            <p>Hello ${user.name},</p>
            <p>You requested a password reset for your travel agency account.</p>
            <p>Click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" 
                   style="background-color: #1E40AF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                    Reset Password
                </a>
            </div>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this password reset, please ignore this email.</p>
            <p>Best regards,<br>Travel Agency Team</p>
        </div>
    `;

    try {
        // Send email using your existing email service
        const sendMail = require('../utils/sendMail');
        await sendMail({
            email: user.email,
            subject: 'Password Reset Request',
            message: emailContent
        });

        // Also try to send Telegram notification
        const telegramBotService = require('../services/telegramService');
        const telegramMessage = `🔒 *Password Reset Request*\n\n` +
            `Hello ${user.name},\n\n` +
            `You requested a password reset for your travel agency account.\n\n` +
            `Click the link below to reset your password:\n` +
            `${resetUrl}\n\n` +
            `⏰ This link will expire in 1 hour.\n\n` +
            `If you didn't request this, please ignore this message.`;
        
        await telegramBotService.sendNotificationByEmail(user.email, telegramMessage);

        res.status(200).json({
            message: 'Password reset email sent successfully. Please check your email.'
        });
    } catch (error) {
        console.error('Email sending error:', error);
        
        // Try to send Telegram notification as fallback
        try {
            const telegramBotService = require('../services/telegramService');
            const telegramMessage = `🔒 *Password Reset Request*\n\n` +
                `Hello ${user.name},\n\n` +
                `You requested a password reset for your travel agency account.\n\n` +
                `Click the link below to reset your password:\n` +
                `${resetUrl}\n\n` +
                `⏰ This link will expire in 1 hour.\n\n` +
                `If you didn't request this, please ignore this message.`;
            
            const telegramSent = await telegramBotService.sendNotificationByEmail(user.email, telegramMessage);
            
            if (telegramSent) {
                res.status(200).json({
                    message: 'Email service is temporarily unavailable, but we sent the reset link to your Telegram account.',
                    resetUrl: resetUrl,
                    note: 'Check your Telegram messages for the reset link.'
                });
            } else {
                // Both email and Telegram failed, provide fallback
                console.log('Both email and Telegram failed, providing reset token for testing');
                res.status(200).json({
                    message: 'Email service is temporarily unavailable. Here is your reset token for testing:',
                    resetToken: resetToken,
                    resetUrl: resetUrl,
                    note: 'In production, this would be sent via email. For testing, you can use this URL directly.'
                });
            }
        } catch (telegramError) {
            console.error('Telegram notification also failed:', telegramError);
            // Fallback: Return the reset token for testing purposes
            console.log('Both email and Telegram failed, providing reset token for testing');
            res.status(200).json({
                message: 'Email service is temporarily unavailable. Here is your reset token for testing:',
                resetToken: resetToken,
                resetUrl: resetUrl,
                note: 'In production, this would be sent via email. For testing, you can use this URL directly.'
            });
        }
    }
});

// @desc    Reset password with token
// @route   POST /api/users/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        res.status(400);
        throw new Error('Please provide token and new password');
    }

    if (newPassword.length < 6) {
        res.status(400);
        throw new Error('Password must be at least 6 characters long');
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find user
        const user = await User.findById(decoded.id);
        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.status(200).json({
            message: 'Password reset successfully. You can now login with your new password.'
        });
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            res.status(400);
            throw new Error('Invalid or expired reset token. Please request a new password reset.');
        }
        throw error;
    }
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
    forgotPassword,
    resetPassword,
    getAllUser,
    estimateIncome
};