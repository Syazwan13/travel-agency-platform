const express = require('express');
const router = express.Router();
const Feedback = require('../models/feedbackModel');
const Inquiry = require('../models/inquiryModel');
const User = require('../models/userModel');
const { sendTelegramNotification } = require('../services/telegramNotifyService');
const multer = require('multer');
const path = require('path');

// Set up multer for photo uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/feedback-photos/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});
const upload = multer({ storage });

// POST /api/feedback - submit feedback
router.post('/', upload.array('photos', 5), async (req, res) => {
  const { inquiryId, rating, feedback, recommend, anonymous, service, accommodation, value } = req.body;
  let packageId = '';
  let userName = '';
  // Get packageId and userName from inquiry
  const inquiry = await Inquiry.findById(inquiryId).populate('userId', 'name telegramChatId');
  if (inquiry) {
    packageId = inquiry.packageInfo.packageId;
    userName = inquiry.userId && !anonymous ? inquiry.userId.name : '';
  }
  const photos = req.files ? req.files.map(f => f.path) : [];
  const newFeedback = new Feedback({
    inquiryId,
    packageId,
    userName,
    rating,
    service,
    accommodation,
    value,
    recommend,
    feedback,
    anonymous: anonymous === 'true' || anonymous === true,
    photos
  });
  await newFeedback.save();

  // Send Telegram thank you notification to user
  if (inquiry && inquiry.userId && inquiry.userId.telegramChatId) {
    sendTelegramNotification(
      'Thank you for your feedback! We appreciate your input and will use it to improve our service.',
      inquiry.userId.telegramChatId
    );
  }

  res.json({ success: true, message: 'Thank you for your feedback!' });
});

// GET /api/feedback/package/:packageId - get feedback for a package
router.get('/package/:packageId', async (req, res) => {
  const startTime = Date.now();
  try {
    const { packageId } = req.params;
    console.log(`🔍 [FEEDBACK] Getting feedback for package: ${packageId}`);
    
    // First try to find feedback with exact packageId match
    let feedbacks = await Feedback.find({ packageId }).sort({ createdAt: -1 });
    console.log(`📊 [FEEDBACK] Direct match found ${feedbacks.length} feedbacks for package ${packageId}`);
    
    // If no feedback found, try to find by matching package title/link from inquiries
    if (feedbacks.length === 0) {
      console.log(`🔍 [FEEDBACK] No direct match, searching by title/link...`);
      
      // Get current package details to find similar packages
      const AmiTravel = require('../models/amiTravelSchema');
      const HolidayGoGo = require('../models/holidayGoGoGoSchema').HolidayGoGoPackage;
      const PulauMalaysia = require('../models/pulauMalaysiaSchema').PulauMalaysiaPackage;
      
      let currentPackage = null;
      try {
        currentPackage = await AmiTravel.findById(packageId);
        if (currentPackage) console.log(`📦 [FEEDBACK] Found package in AmiTravel: ${currentPackage.title}`);
      } catch (e) {
        console.log(`⚠️ [FEEDBACK] Package ${packageId} not found in AmiTravel`);
      }
      
      if (!currentPackage) {
        try {
          currentPackage = await HolidayGoGo.findById(packageId);
          if (currentPackage) console.log(`📦 [FEEDBACK] Found package in HolidayGoGo: ${currentPackage.title}`);
        } catch (e) {
          console.log(`⚠️ [FEEDBACK] Package ${packageId} not found in HolidayGoGo`);
        }
      }
      
      if (!currentPackage) {
        try {
          currentPackage = await PulauMalaysia.findById(packageId);
          if (currentPackage) console.log(`📦 [FEEDBACK] Found package in PulauMalaysia: ${currentPackage.title}`);
        } catch (e) {
          console.log(`⚠️ [FEEDBACK] Package ${packageId} not found in PulauMalaysia`);
        }
      }
      
      if (currentPackage) {
        console.log(`🔍 [FEEDBACK] Searching inquiries for package title: "${currentPackage.title}"`);
        
        // Find inquiries with similar package titles
        const inquiries = await Inquiry.find({
          $or: [
            { 'packageInfo.packageTitle': currentPackage.title },
            { 'packageInfo.packageLink': currentPackage.link }
          ]
        }).select('_id');
        
        console.log(`📋 [FEEDBACK] Found ${inquiries.length} matching inquiries`);
        
        if (inquiries.length > 0) {
          const inquiryIds = inquiries.map(i => i._id);
          
          // Find feedback for these inquiries
          feedbacks = await Feedback.find({ 
            inquiryId: { $in: inquiryIds } 
          }).sort({ createdAt: -1 });
          
          console.log(`✅ [FEEDBACK] Found ${feedbacks.length} feedback entries by matching title/link for package ${packageId}`);
        }
      } else {
        console.log(`❌ [FEEDBACK] Package ${packageId} not found in any collection`);
      }
    }
    
    console.log(`⏱️ [FEEDBACK] Request completed in ${Date.now() - startTime}ms, returning ${feedbacks.length} feedbacks`);
    res.json(feedbacks);
    
  } catch (error) {
    console.error(`❌ [FEEDBACK] Error fetching feedback for package ${req.params.packageId}:`, error);
    res.status(500).json({ error: 'Failed to fetch feedback', details: error.message });
  }
});

// Debug endpoint to test feedback system
router.get('/debug/:packageId', async (req, res) => {
  try {
    const { packageId } = req.params;
    const debug = {
      packageId,
      timestamp: new Date().toISOString(),
      results: {}
    };
    
    // Check if package exists in any collection
    const AmiTravel = require('../models/amiTravelSchema');
    const HolidayGoGo = require('../models/holidayGoGoGoSchema').HolidayGoGoPackage;
    const PulauMalaysia = require('../models/pulauMalaysiaSchema').PulauMalaysiaPackage;
    
    // Check AmiTravel
    try {
      const amiPackage = await AmiTravel.findById(packageId);
      debug.results.amiTravel = amiPackage ? { found: true, title: amiPackage.title } : { found: false };
    } catch (e) {
      debug.results.amiTravel = { found: false, error: e.message };
    }
    
    // Check HolidayGoGo
    try {
      const holidayPackage = await HolidayGoGo.findById(packageId);
      debug.results.holidayGoGo = holidayPackage ? { found: true, title: holidayPackage.title } : { found: false };
    } catch (e) {
      debug.results.holidayGoGo = { found: false, error: e.message };
    }
    
    // Check PulauMalaysia
    try {
      const pulauPackage = await PulauMalaysia.findById(packageId);
      debug.results.pulauMalaysia = pulauPackage ? { found: true, title: pulauPackage.title } : { found: false };
    } catch (e) {
      debug.results.pulauMalaysia = { found: false, error: e.message };
    }
    
    // Check direct feedback
    const directFeedback = await Feedback.find({ packageId });
    debug.results.directFeedback = {
      count: directFeedback.length,
      feedbacks: directFeedback.map(f => ({
        id: f._id,
        rating: f.rating,
        userName: f.userName,
        createdAt: f.createdAt
      }))
    };
    
    // Check all feedback
    const allFeedback = await Feedback.find().limit(10);
    debug.results.allFeedback = {
      totalCount: await Feedback.countDocuments(),
      sample: allFeedback.map(f => ({
        id: f._id,
        packageId: f.packageId,
        rating: f.rating,
        userName: f.userName
      }))
    };
    
    // Check inquiries
    const allInquiries = await Inquiry.find().limit(5).select('packageInfo');
    debug.results.inquiries = {
      totalCount: await Inquiry.countDocuments(),
      sample: allInquiries.map(i => ({
        id: i._id,
        packageId: i.packageInfo?.packageId,
        title: i.packageInfo?.packageTitle
      }))
    };
    
    res.json(debug);
    
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

module.exports = router; 