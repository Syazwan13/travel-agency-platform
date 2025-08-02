const asyncHandler = require('express-async-handler');
const Inquiry = require('../models/inquiryModel');
const ProviderContact = require('../models/providerContactModel');
const User = require('../models/userModel');
const { generateWhatsAppMessage } = require('../services/messageGeneratorService');
const { sendTelegramNotification } = require('../services/telegramNotifyService');

// @desc    Create new inquiry
// @route   POST /api/inquiries
// @access  Private
const createInquiry = asyncHandler(async (req, res) => {
  console.log('🔥 CREATE INQUIRY REQUEST RECEIVED');
  console.log('Request body keys:', Object.keys(req.body));
  console.log('Package info:', req.body.packageInfo);

  const {
    packageInfo,
    travelDetails,
    specialRequirements,
    contactPreferences
  } = req.body;

  // Validate required fields
  if (!packageInfo || !travelDetails) {
    res.status(400);
    throw new Error('Package info and travel details are required');
  }

  // Calculate total pax
  const adults = parseInt(travelDetails.groupInfo?.adults) || 0;
  const children = parseInt(travelDetails.groupInfo?.children) || 0;
  const infants = parseInt(travelDetails.groupInfo?.infants) || 0;
  const totalPax = adults + children + infants;

  if (totalPax === 0) {
    res.status(400);
    throw new Error('At least one traveler is required');
  }

  // Create inquiry record
  const inquiry = await Inquiry.create({
    userId: req.user ? req.user._id : null, // Allow anonymous inquiries
    packageInfo,
    travelDetails: {
      ...travelDetails,
      groupInfo: {
        ...travelDetails.groupInfo,
        totalPax
      }
    },
    specialRequirements,
    contactPreferences,
    analytics: {
      formStartedAt: new Date(),
      formCompletedAt: new Date(),
      deviceType: req.headers['user-agent'] || 'unknown',
      referrerPage: req.headers.referer || 'direct'
    }
  });

  // Populate user data for message generation (if user exists)
  if (inquiry.userId) {
    await inquiry.populate('userId', 'name email phoneNumber telegramChatId');
  }

  // Generate WhatsApp message
  const whatsappMessage = await generateWhatsAppMessage(inquiry);

  // Map provider names to proper case for provider contact lookup
  const providerNameMap = {
    // AmiTravel variations
    'amitravel': 'AmiTravel',
    'AmiTravel': 'AmiTravel',
    'AMI Travel': 'AmiTravel',
    'ami travel': 'AmiTravel',
    'Ami Travel': 'AmiTravel',

    // HolidayGoGo variations
    'holidaygogo': 'HolidayGoGo',
    'HolidayGoGo': 'HolidayGoGo',
    'holidaygogogo': 'HolidayGoGo',
    'Holiday GoGo': 'HolidayGoGo',
    'holiday gogo': 'HolidayGoGo',
    'HolidayGoGoGo': 'HolidayGoGo',

    // PulauMalaysia variations
    'pulaumalaysia': 'PulauMalaysia',
    'PulauMalaysia': 'PulauMalaysia',
    'Pulau Malaysia': 'PulauMalaysia',
    'pulau malaysia': 'PulauMalaysia',

    // Generic package
    'Package': 'Package',
    'package': 'Package'
  };

  const mappedProviderName = providerNameMap[packageInfo.packageSource] || packageInfo.packageSource;

  // Get provider contact info
  console.log('🔍 Provider mapping debug:', {
    originalSource: packageInfo.packageSource,
    mappedName: mappedProviderName,
    availableMappings: Object.keys(providerNameMap)
  });

  const providerContact = await ProviderContact.getByProvider(mappedProviderName);
  console.log('📞 Provider contact found:', !!providerContact);

  // Update inquiry status and WhatsApp data
  inquiry.status = 'submitted';
  inquiry.whatsappData.messageGenerated = whatsappMessage;

  if (providerContact) {
    inquiry.whatsappData.providerNumber = providerContact.contactInfo.whatsappNumber;
    console.log('✅ Provider contact details:', {
      whatsappNumber: providerContact.contactInfo.whatsappNumber,
      businessName: providerContact.contactInfo.businessName,
      responseTime: providerContact.contactInfo.responseTime
    });
  } else {
    console.log('❌ No provider contact found for:', mappedProviderName);

    // Log debugging information to help troubleshoot
    const allProviders = await ProviderContact.find({}).select('providerName');
    console.log('Available providers in database:', allProviders.map(p => p.providerName));
    console.log('Package source received:', packageInfo.packageSource);
    console.log('Mapped provider name:', mappedProviderName);
  }

  // Save the updated inquiry
  await inquiry.save();

  // Send Telegram notification to admin
  let tgMessage = `📝 *New Inquiry Submitted*\n`;
  if (inquiry.userId && inquiry.userId.name) {
    tgMessage += `👤 User: ${inquiry.userId.name}\n`;
  }
  tgMessage += `📦 Package: ${packageInfo?.packageTitle || 'N/A'}\n`;
  tgMessage += `👥 Pax: ${totalPax}\n`;
  tgMessage += `📅 Dates: ${travelDetails?.preferredDates?.startDate || 'N/A'} - ${travelDetails?.preferredDates?.endDate || 'N/A'}\n`;
  tgMessage += `🕒 Submitted: ${new Date().toLocaleString()}`;
  sendTelegramNotification(tgMessage, process.env.TELEGRAM_CHAT_ID);

  // Debug: log the inquiry.userId object
  console.log('inquiry.userId:', inquiry.userId);
  // Send Telegram notification to user (if linked)
  const FE_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
  if (inquiry.userId && inquiry.userId.telegramChatId) {
    const reviewUrl = `${FE_URL}/feedback?inquiryId=${inquiry._id}`;
    const userMessage = `Thank you for your inquiry, ${inquiry.userId.name}! After your trip, please leave us a review here: ${reviewUrl}`;
    console.log('Sending Telegram notification to user:', inquiry.userId.telegramChatId);
    console.log('User message:', userMessage);
    sendTelegramNotification(
      userMessage,
      inquiry.userId.telegramChatId
    );
  }

  // Prepare response with provider contact information
  const finalProviderContact = providerContact ? {
    whatsappNumber: providerContact.contactInfo.whatsappNumber,
    businessName: providerContact.contactInfo.businessName,
    responseTime: providerContact.contactInfo.responseTime
  } : null;

  const responseData = {
    success: true,
    message: 'Inquiry submitted successfully',
    data: inquiry,
    whatsappMessage,
    providerContact: finalProviderContact
  };

  console.log('📤 Sending response with providerContact:', !!responseData.providerContact);
  if (finalProviderContact) {
    console.log('📱 WhatsApp number in response:', finalProviderContact.whatsappNumber);
  }

  res.status(201).json(responseData);
});

// @desc    Get user's inquiries
// @route   GET /api/inquiries
// @access  Private
const getUserInquiries = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const inquiries = await Inquiry.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('userId', 'name email');

  const total = await Inquiry.countDocuments({ userId: req.user._id });

  res.json({
    success: true,
    data: inquiries,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get inquiry by ID
// @route   GET /api/inquiries/:id
// @access  Private
const getInquiryById = asyncHandler(async (req, res) => {
  const inquiry = await Inquiry.findById(req.params.id).populate('userId', 'name email');

  if (!inquiry) {
    res.status(404);
    throw new Error('Inquiry not found');
  }

  // Check if user owns this inquiry or is admin
  if (inquiry.userId && inquiry.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this inquiry');
  }

  res.json({
    success: true,
    data: inquiry
  });
});

// @desc    Track WhatsApp click
// @route   POST /api/inquiries/:id/track-whatsapp
// @access  Private
const trackWhatsAppClick = asyncHandler(async (req, res) => {
  const inquiry = await Inquiry.findById(req.params.id);

  if (!inquiry) {
    res.status(404);
    throw new Error('Inquiry not found');
  }

  // Update WhatsApp tracking
  inquiry.whatsappData.clickedAt = new Date();
  inquiry.whatsappData.clickCount = (inquiry.whatsappData.clickCount || 0) + 1;
  await inquiry.save();

  res.json({
    success: true,
    message: 'WhatsApp click tracked'
  });
});

// @desc    Regenerate WhatsApp message
// @route   POST /api/inquiries/:id/generate-message
// @access  Private
const regenerateMessage = asyncHandler(async (req, res) => {
  const inquiry = await Inquiry.findById(req.params.id);

  if (!inquiry) {
    res.status(404);
    throw new Error('Inquiry not found');
  }

  // Populate user data if exists
  if (inquiry.userId) {
    await inquiry.populate('userId', 'name email phoneNumber');
  }

  const whatsappMessage = await generateWhatsAppMessage(inquiry);

  // Map provider names to proper case for provider contact lookup
  const providerNameMap = {
    // AmiTravel variations
    'amitravel': 'AmiTravel',
    'AmiTravel': 'AmiTravel',
    'AMI Travel': 'AmiTravel',
    'ami travel': 'AmiTravel',
    'Ami Travel': 'AmiTravel',

    // HolidayGoGo variations
    'holidaygogo': 'HolidayGoGo',
    'HolidayGoGo': 'HolidayGoGo',
    'holidaygogogo': 'HolidayGoGo',
    'Holiday GoGo': 'HolidayGoGo',
    'holiday gogo': 'HolidayGoGo',
    'HolidayGoGoGo': 'HolidayGoGo',

    // PulauMalaysia variations
    'pulaumalaysia': 'PulauMalaysia',
    'PulauMalaysia': 'PulauMalaysia',
    'Pulau Malaysia': 'PulauMalaysia',
    'pulau malaysia': 'PulauMalaysia',

    // Generic package
    'Package': 'Package',
    'package': 'Package'
  };

  const mappedProviderName = providerNameMap[inquiry.packageInfo.packageSource] || inquiry.packageInfo.packageSource;
  const providerContact = await ProviderContact.getByProvider(mappedProviderName);

  // Update inquiry with generated message
  inquiry.whatsappData.messageGenerated = whatsappMessage;
  if (providerContact) {
    inquiry.whatsappData.providerNumber = providerContact.contactInfo.whatsappNumber;
  }
  await inquiry.save();

  res.json({
    success: true,
    message: whatsappMessage,
    providerContact: providerContact ? {
      whatsappNumber: providerContact.contactInfo.whatsappNumber,
      businessName: providerContact.contactInfo.businessName,
      responseTime: providerContact.contactInfo.responseTime
    } : null
  });
});

module.exports = {
  createInquiry,
  getUserInquiries,
  getInquiryById,
  trackWhatsAppClick,
  regenerateMessage
};