const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/authMiddleWare');
const dashboardController = require('../controllers/dashboardController');

router.get('/admin/stats', protect, isAdmin, dashboardController.getAdminDashboardStats);
router.get('/admin/analytics', protect, isAdmin, dashboardController.getAdminAnalytics);
router.get('/agency/stats', protect, dashboardController.getAgencyDashboardStats);
router.get('/user/stats', protect, dashboardController.getUserDashboardStats);

module.exports = router;
