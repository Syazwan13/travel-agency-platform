const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/authMiddleWare');
const upload = require('../middleware/uploadMiddleware');
const {
    getUserProfile,
    updateUserProfile,
    updateProfilePhoto,
    updatePassword,
    getBookingHistory,
    getFavorites,
    getAllUsers,
    getUserById,
    updateUserStatus
} = require('../controllers/profileController');

// User routes
router.get('/me', protect, getUserProfile);
router.put('/update', protect, updateUserProfile);
router.put('/photo', protect, upload.single('photo'), updateProfilePhoto);
router.put('/password', protect, updatePassword);
router.get('/bookings', protect, getBookingHistory);
router.get('/favorites', protect, getFavorites);

// Admin routes
router.get('/admin/users', protect, isAdmin, getAllUsers);
router.get('/admin/users/:id', protect, isAdmin, getUserById);
router.put('/admin/users/:id/status', protect, isAdmin, updateUserStatus);

module.exports = router; 