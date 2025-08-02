const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const fs = require('fs');
const path = require('path');

// @desc    Get user profile
// @route   GET /api/profile/me
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
        .select('-password')
        .populate('bookingHistory.packageId')
        .populate('favorites.packageId');
    
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    
    res.status(200).json(user);
});

// @desc    Update user profile
// @route   PUT /api/profile/update
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const {
        name,
        phoneNumber,
        address,
        preferences
    } = req.body;

    const user = await User.findById(req.user._id);
    
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Update basic info
    if (name) user.name = name;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (address) {
        user.address = {
            street: address.street || user.address.street,
            city: address.city || user.address.city,
            state: address.state || user.address.state,
            country: address.country || user.address.country,
            postalCode: address.postalCode || user.address.postalCode
        };
    }
    if (preferences) {
        user.preferences = {
            preferredDestinations: preferences.preferredDestinations || user.preferences.preferredDestinations,
            travelStyles: preferences.travelStyles || user.preferences.travelStyles,
            priceRange: {
                min: preferences.priceRange?.min || user.preferences.priceRange?.min,
                max: preferences.priceRange?.max || user.preferences.priceRange?.max
            },
            notifications: {
                email: preferences.notifications?.email !== undefined ? preferences.notifications.email : user.preferences.notifications?.email,
                priceAlerts: preferences.notifications?.priceAlerts !== undefined ? preferences.notifications.priceAlerts : user.preferences.notifications?.priceAlerts
            }
        };
    }

    const updatedUser = await user.save();
    res.status(200).json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        address: updatedUser.address,
        preferences: updatedUser.preferences,
        photo: updatedUser.photo
    });
});

// @desc    Update user photo
// @route   PUT /api/profile/photo
// @access  Private
const updateProfilePhoto = asyncHandler(async (req, res) => {
    console.log('Photo upload endpoint hit', req.file);
    if (!req.file) {
        res.status(400);
        throw new Error('Please upload a file');
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
        // Delete uploaded file if user not found
        fs.unlinkSync(req.file.path);
        res.status(404);
        throw new Error('User not found');
    }

    // Delete old photo if exists and it's not the default avatar
    if (user.photo && !user.photo.includes('default-avatar')) {
        const oldPhotoPath = path.join(__dirname, '..', user.photo);
        if (fs.existsSync(oldPhotoPath)) {
            fs.unlinkSync(oldPhotoPath);
        }
    }

    // Update user photo path in database
    const photoUrl = `/uploads/profile-photos/${req.file.filename}`;
    user.photo = photoUrl;
    await user.save();

    res.status(200).json({
        message: 'Profile photo updated successfully',
        photo: photoUrl
    });
});

// @desc    Update password
// @route   PUT /api/profile/password
// @access  Private
const updatePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
        res.status(400);
        throw new Error('Please provide both current and new password');
    }

    const user = await User.findById(req.user._id);
    
    if (!user || !(await user.matchPassword(currentPassword))) {
        res.status(400);
        throw new Error('Current password is incorrect');
    }
    
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({ message: 'Password updated successfully' });
});

// @desc    Get user's booking history
// @route   GET /api/profile/bookings
// @access  Private
const getBookingHistory = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
        .select('bookingHistory')
        .populate('bookingHistory.packageId');

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    res.status(200).json(user.bookingHistory);
});

// @desc    Get user's favorites
// @route   GET /api/profile/favorites
// @access  Private
const getFavorites = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
        .select('favorites')
        .populate('favorites.packageId');

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    res.status(200).json(user.favorites);
});

// Admin Controllers

// @desc    Get all users (admin)
// @route   GET /api/profile/admin/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find()
        .select('-password')
        .sort('-createdAt');
    res.status(200).json(users);
});

// @desc    Get user by ID (admin)
// @route   GET /api/profile/admin/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)
        .select('-password')
        .populate('bookingHistory.packageId')
        .populate('favorites.packageId');
    
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    
    res.status(200).json(user);
});

// @desc    Update user status (admin)
// @route   PUT /api/profile/admin/users/:id/status
// @access  Private/Admin
const updateUserStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    
    if (!['active', 'inactive', 'suspended'].includes(status)) {
        res.status(400);
        throw new Error('Invalid status');
    }

    const user = await User.findById(req.params.id);
    
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    
    user.status = status;
    await user.save();
    
    res.status(200).json({ message: 'User status updated successfully' });
});

module.exports = {
    getUserProfile,
    updateUserProfile,
    updateProfilePhoto,
    updatePassword,
    getBookingHistory,
    getFavorites,
    getAllUsers,
    getUserById,
    updateUserStatus
}; 