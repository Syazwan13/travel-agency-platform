const asyncHandler = require('express-async-handler');
const ProviderContact = require('../models/providerContactModel');

// @desc    Get provider contact information
// @route   GET /api/inquiries/providers/:provider/contact
// @access  Public
const getProviderContact = asyncHandler(async (req, res) => {
  const { provider } = req.params;
  
  const providerContact = await ProviderContact.getByProvider(provider);
  
  if (!providerContact) {
    res.status(404);
    throw new Error(`Contact information not found for provider: ${provider}`);
  }

  // Return only necessary public information
  res.json({
    success: true,
    data: {
      providerName: providerContact.providerName,
      businessName: providerContact.contactInfo.businessName,
      whatsappNumber: providerContact.contactInfo.whatsappNumber,
      responseTime: providerContact.contactInfo.responseTime,
      operatingHours: providerContact.contactInfo.operatingHours
    }
  });
});

// @desc    Get all provider contacts
// @route   GET /api/inquiries/providers/contacts/all
// @access  Public
const getAllProviderContacts = asyncHandler(async (req, res) => {
  const providers = await ProviderContact.getAllActive();
  
  // Return only necessary public information
  const publicData = providers.map(provider => ({
    providerName: provider.providerName,
    businessName: provider.contactInfo.businessName,
    whatsappNumber: provider.contactInfo.whatsappNumber,
    responseTime: provider.contactInfo.responseTime,
    operatingHours: provider.contactInfo.operatingHours
  }));

  res.json({
    success: true,
    data: publicData
  });
});

// @desc    Create provider contact
// @route   POST /api/inquiries/admin/providers
// @access  Private/Admin
const createProviderContact = asyncHandler(async (req, res) => {
  const {
    providerName,
    contactInfo,
    messageTemplates
  } = req.body;

  // Check if provider already exists
  const existingProvider = await ProviderContact.findOne({ providerName });
  if (existingProvider) {
    res.status(400);
    throw new Error(`Provider contact already exists for: ${providerName}`);
  }

  const providerContact = await ProviderContact.create({
    providerName,
    contactInfo,
    messageTemplates
  });

  res.status(201).json({
    success: true,
    data: providerContact
  });
});

// @desc    Update provider contact
// @route   PUT /api/inquiries/admin/providers/:provider
// @access  Private/Admin
const updateProviderContact = asyncHandler(async (req, res) => {
  const { provider } = req.params;
  
  const providerContact = await ProviderContact.findOne({ providerName: provider });
  
  if (!providerContact) {
    res.status(404);
    throw new Error(`Provider contact not found: ${provider}`);
  }

  const updatedProvider = await ProviderContact.findByIdAndUpdate(
    providerContact._id,
    req.body,
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    data: updatedProvider
  });
});

// @desc    Delete provider contact
// @route   DELETE /api/inquiries/admin/providers/:provider
// @access  Private/Admin
const deleteProviderContact = asyncHandler(async (req, res) => {
  const { provider } = req.params;
  
  const providerContact = await ProviderContact.findOne({ providerName: provider });
  
  if (!providerContact) {
    res.status(404);
    throw new Error(`Provider contact not found: ${provider}`);
  }

  await ProviderContact.findByIdAndDelete(providerContact._id);

  res.json({
    success: true,
    message: `Provider contact deleted: ${provider}`
  });
});

module.exports = {
  getProviderContact,
  getAllProviderContacts,
  createProviderContact,
  updateProviderContact,
  deleteProviderContact
};
