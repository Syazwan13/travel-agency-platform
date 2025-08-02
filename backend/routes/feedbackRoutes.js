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
  const { packageId } = req.params;
  const feedbacks = await Feedback.find({ packageId }).sort({ createdAt: -1 });
  res.json(feedbacks);
});

module.exports = router; 