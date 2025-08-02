const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const AmiTravel = require('../models/amiTravelSchema');
const { HolidayGoGoPackage } = require('../models/holidayGoGoGoSchema');
const { PulauMalaysiaPackage } = require('../models/pulauMalaysiaSchema');
const GeocodeCache = require('../models/geocodeCache');
const Inquiry = require('../models/inquiryModel');
const Feedback = require('../models/feedbackModel');
const mongoose = require('mongoose');

// @desc    Get admin dashboard statistics
// @route   GET /api/dashboard/admin/stats
// @access  Private/Admin
const getAdminDashboardStats = asyncHandler(async (req, res) => {
    try {
        // Get counts from all collections
        const [
            totalUsers,
            totalPackages,
            amiTravelCount,
            holidayGoGoCount,
            pulauMalaysiaCount,
            geocodingStats
        ] = await Promise.all([
            User.countDocuments(),
            Package.countDocuments(),
            AmiTravel.countDocuments(),
            HolidayGoGoPackage.countDocuments(),
            PulauMalaysiaPackage.countDocuments(),
            GeocodeCache.aggregate([
                {
                    $group: {
                        _id: null,
                        totalCached: { $sum: 1 },
                        verified: { $sum: { $cond: ['$isVerified', 1, 0] } },
                        highQuality: { $sum: { $cond: [{ $gte: ['$qualityScore', 80] }, 1, 0] } },
                        lowQuality: { $sum: { $cond: [{ $lt: ['$qualityScore', 50] }, 1, 0] } }
                    }
                }
            ])
        ]);

        // Calculate user growth (mock calculation - in real app, you'd compare with previous period)
        const userGrowth = 12; // This would be calculated from actual data

        const stats = geocodingStats[0] || {};

        res.json({
            success: true,
            data: {
                totalUsers,
                totalPackages: totalPackages + amiTravelCount + holidayGoGoCount + pulauMalaysiaCount,
                packageBreakdown: {
                    general: totalPackages,
                    amiTravel: amiTravelCount,
                    holidayGoGo: holidayGoGoCount,
                    pulauMalaysia: pulauMalaysiaCount
                },
                geocodingStats: {
                    totalCached: stats.totalCached || 0,
                    verified: stats.verified || 0,
                    qualityDistribution: {
                        high: stats.highQuality || 0,
                        low: stats.lowQuality || 0
                    }
                },
                userGrowth,
                scrapingStatus: {
                    lastUpdate: new Date().toISOString(),
                    status: 'Active'
                }
            }
        });
    } catch (error) {
        console.error('Error fetching admin dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard statistics',
            error: error.message
        });
    }
});

// @desc    Get package analytics for admin
// @route   GET /api/dashboard/admin/package-analytics
// @access  Private/Admin
const getPackageAnalytics = asyncHandler(async (req, res) => {
    try {
        // Get package distribution by destination
        const [
            packagesByDestination,
            recentPackages,
            activePackages
        ] = await Promise.all([
            Package.aggregate([
                { $group: { _id: '$destination', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),
            Package.find().sort({ createdAt: -1 }).limit(10).select('title destination createdAt'),
            Package.countDocuments({ isActive: true })
        ]);

        res.json({
            success: true,
            data: {
                packagesByDestination,
                recentPackages,
                activePackages,
                totalPackages: await Package.countDocuments()
            }
        });
    } catch (error) {
        console.error('Error fetching package analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching package analytics',
            error: error.message
        });
    }
});

// @desc    Get agency dashboard statistics
// @route   GET /api/dashboard/agency/stats
// @access  Private
const getAgencyDashboardStats = asyncHandler(async (req, res) => {
    try {
        // Get providerContactId for this agency
        const providerContactId = req.user?.providerContactId;
        if (!providerContactId) {
            return res.status(403).json({ success: false, message: 'No providerContactId for this user' });
        }

        // Get all package IDs for this provider
        const [amiPackages, hgggPackages, pmPackages] = await Promise.all([
            AmiTravel.find({ provider: providerContactId }).select('_id'),
            HolidayGoGoPackage.find({ provider: providerContactId }).select('_id'),
            PulauMalaysiaPackage.find({ provider: providerContactId }).select('_id'),
        ]);
        const packageIds = [
            ...amiPackages.map(p => p._id.toString()),
            ...hgggPackages.map(p => p._id.toString()),
            ...pmPackages.map(p => p._id.toString())
        ];

        // Real-time inquiry trends (by month)
        const inquiryTrends = await Inquiry.aggregate([
            { $match: { 'packageInfo.packageId': { $in: packageIds } } },
            { $group: {
                _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
                count: { $sum: 1 }
            }},
            { $sort: { _id: 1 } }
        ]);
        // Real-time recent reviews
        const recentReviews = await Feedback.find({ packageId: { $in: packageIds } })
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();
        // Average rating
        const avgRatingAgg = await Feedback.aggregate([
            { $match: { packageId: { $in: packageIds } } },
            { $group: { _id: null, avg: { $avg: '$rating' } } }
        ]);
        const averageRating = avgRatingAgg[0]?.avg || null;

        // Get real package data for better analytics
        const [
            amiTravelCount,
            holidayGoGoCount,
            pulauMalaysiaCount,
            amiTravelDest,
            holidayGoGoDest,
            pulauMalaysiaDest,
            amiTravelProv,
            holidayGoGoProv,
            pulauMalaysiaProv
        ] = await Promise.all([
            AmiTravel.countDocuments({ provider: providerContactId }),
            HolidayGoGoPackage.countDocuments({ provider: providerContactId }),
            PulauMalaysiaPackage.countDocuments({ provider: providerContactId }),
            AmiTravel.aggregate([
                { $match: { provider: providerContactId } },
                { $group: { _id: '$destination', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]),
            HolidayGoGoPackage.aggregate([
                { $match: { provider: providerContactId } },
                { $group: { _id: '$destination', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]),
            PulauMalaysiaPackage.aggregate([
                { $match: { provider: providerContactId } },
                { $group: { _id: '$destination', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]),
            AmiTravel.aggregate([
                { $match: { provider: providerContactId } },
                { $group: { _id: '$provider', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),
            HolidayGoGoPackage.aggregate([
                { $match: { provider: providerContactId } },
                { $group: { _id: '$provider', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),
            PulauMalaysiaPackage.aggregate([
                { $match: { provider: providerContactId } },
                { $group: { _id: '$provider', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ])
        ]);
        const totalPackages = amiTravelCount + holidayGoGoCount + pulauMalaysiaCount;
        // Merge destination stats
        const destMap = new Map();
        [amiTravelDest, holidayGoGoDest, pulauMalaysiaDest].flat().forEach(dest => {
            if (!destMap.has(dest._id)) destMap.set(dest._id, 0);
            destMap.set(dest._id, destMap.get(dest._id) + dest.count);
        });
        const packagesByDestination = Array.from(destMap.entries()).map(([name, count]) => ({ _id: name, count }));
        packagesByDestination.sort((a, b) => b.count - a.count);
        // Merge provider stats
        const provMap = new Map();
        [amiTravelProv, holidayGoGoProv, pulauMalaysiaProv].flat().forEach(prov => {
            if (!provMap.has(prov._id)) provMap.set(prov._id, 0);
            provMap.set(prov._id, provMap.get(prov._id) + prov.count);
        });
        const packagesByProvider = Array.from(provMap.entries()).map(([name, count]) => ({ _id: name, count }));
        packagesByProvider.sort((a, b) => b.count - a.count);
        // Compose response
        res.json({
            success: true,
            data: {
                totalPackages,
                popularDestinations: packagesByDestination.map(dest => ({ name: dest._id || 'Unknown', packages: dest.count })),
                packagesByProvider: packagesByProvider.map(provider => ({ name: provider._id || 'Unknown', count: provider.count })),
                inquiryTrends,
                recentReviews,
                averageRating
            }
        });
    } catch (error) {
        console.error('Error fetching agency dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching agency dashboard statistics',
            error: error.message
        });
    }
});

// @desc    Get user engagement statistics
// @route   GET /api/dashboard/agency/engagement
// @access  Private
const getUserEngagementStats = asyncHandler(async (req, res) => {
    try {
        // Get user engagement data
        const [
            totalUsers,
            usersWithFavorites,
            usersWithSearchHistory,
            averagePreferences
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ 'favorites.0': { $exists: true } }),
            User.countDocuments({ 'searchHistory.0': { $exists: true } }),
            User.aggregate([
                { $project: { preferredDestinationsCount: { $size: { $ifNull: ['$preferences.preferredDestinations', []] } } } },
                { $group: { _id: null, avgPreferences: { $avg: '$preferredDestinationsCount' } } }
            ])
        ]);

        const engagementRate = totalUsers > 0 ? ((usersWithFavorites / totalUsers) * 100).toFixed(1) : 0;
        const searchEngagementRate = totalUsers > 0 ? ((usersWithSearchHistory / totalUsers) * 100).toFixed(1) : 0;

        res.json({
            success: true,
            data: {
                totalUsers,
                usersWithFavorites,
                usersWithSearchHistory,
                engagementRate: parseFloat(engagementRate),
                searchEngagementRate: parseFloat(searchEngagementRate),
                averagePreferences: averagePreferences[0]?.avgPreferences || 0
            }
        });
    } catch (error) {
        console.error('Error fetching user engagement stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user engagement statistics',
            error: error.message
        });
    }
});

// @desc    Get user dashboard statistics
// @route   GET /api/dashboard/user/stats
// @access  Private
const getUserDashboardStats = asyncHandler(async (req, res) => {
    try {
        const userId = req.user._id;

        // Get user's personal statistics
        const user = await User.findById(userId).select('favorites bookingHistory preferences');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Mock recommendations based on user preferences
        const mockRecommendations = [
            {
                title: 'Langkawi Beach Resort Package',
                destination: 'Langkawi',
                price: 'RM 450',
                reason: 'Based on your interest in beach destinations'
            },
            {
                title: 'Redang Diving Adventure',
                destination: 'Redang',
                price: 'RM 380',
                reason: 'Popular among users with similar preferences'
            }
        ];

        res.json({
            success: true,
            data: {
                favoritesCount: user.favorites?.length || 0,
                bookingHistoryCount: user.bookingHistory?.length || 0,
                preferredDestinationsCount: user.preferences?.preferredDestinations?.length || 0,
                recommendations: mockRecommendations,
                hasPreferences: !!(user.preferences?.preferredDestinations?.length || user.preferences?.travelStyles?.length)
            }
        });
    } catch (error) {
        console.error('Error fetching user dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user dashboard statistics',
            error: error.message
        });
    }
});

const getAdminAnalytics = asyncHandler(async (req, res) => {
  // Inquiry Analytics
  const totalInquiries = await Inquiry.countDocuments();
  const inquiriesByPackage = await Inquiry.aggregate([
    { $group: { _id: '$packageInfo.packageId', count: { $sum: 1 }, title: { $first: '$packageInfo.packageTitle' } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
  const inquiriesByMonth = await Inquiry.aggregate([
    { $group: {
      _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
      count: { $sum: 1 }
    }},
    { $sort: { _id: 1 } }
  ]);

  // User Analytics
  const totalUsers = await User.countDocuments();
  const now = new Date();
  const daysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // last 30 days
  const activeUsers = await Inquiry.distinct('userId', { createdAt: { $gte: daysAgo } });
  const activeUsersCount = activeUsers.length;

  // Feedback/Review Analytics
  const totalFeedbacks = await Feedback.countDocuments();
  const avgRatingAgg = await Feedback.aggregate([{ $group: { _id: null, avg: { $avg: '$rating' } } }]);
  const avgRating = avgRatingAgg[0]?.avg || 0;
  const mostReviewedPackages = await Feedback.aggregate([
    { $group: { _id: '$packageId', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]);
  const recentReviews = await Feedback.find().sort({ createdAt: -1 }).limit(5);

  // Package Analytics
  // (Assume totalPackages is already present elsewhere)
  const mostPopularPackages = inquiriesByPackage.slice(0, 5);
  const avgRatingPerPackage = await Feedback.aggregate([
    { $group: { _id: '$packageId', avg: { $avg: '$rating' } } },
    { $sort: { avg: -1 } },
    { $limit: 10 }
  ]);

  res.json({
    totalInquiries,
    inquiriesByPackage,
    inquiriesByMonth,
    totalUsers,
    activeUsers: activeUsersCount,
    totalFeedbacks,
    avgRating,
    mostReviewedPackages,
    recentReviews,
    mostPopularPackages,
    avgRatingPerPackage
  });
});

module.exports = {
    getAdminDashboardStats,
    getPackageAnalytics,
    getAgencyDashboardStats,
    getUserEngagementStats,
    getUserDashboardStats,
    getAdminAnalytics
};
