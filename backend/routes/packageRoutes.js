const express = require('express');
const router = express.Router();

const AmiTravel = require('../models/amiTravelSchema');
const { HolidayGoGoPackage } = require('../models/holidayGoGoGoSchema');
const auth = require('../middleware/authMiddleWare');
const { getAllPackages } = require('../controllers/packageController');

// General GET / route for /api/packages
router.get('/', getAllPackages);

// Provider-specific routes will be added here

// AmiTravel: Only allow AmiTravel agency to manage these
router.get('/amitravel/my', auth.protect, async (req, res) => {
  if (!req.user || req.user.role !== 'travel_agency') return res.status(403).json({ success: false, message: 'Not authorized' });
  // Find AmiTravel ProviderContactId for this user
  const amiTravelProviderName = 'AmiTravel';
  if (!req.user.providerContactId) return res.status(403).json({ success: false, message: 'No providerContactId' });
  const isAmiTravel = await require('../models/providerContactModel').findOne({ _id: req.user.providerContactId, providerName: amiTravelProviderName });
  if (!isAmiTravel) return res.status(403).json({ success: false, message: 'Not authorized for AmiTravel' });
  const packages = await AmiTravel.find({ provider: req.user.providerContactId });
  res.json({ success: true, data: { packages } });
});

router.post('/amitravel', auth.protect, async (req, res) => {
  if (!req.user || req.user.role !== 'travel_agency') return res.status(403).json({ success: false, message: 'Not authorized' });
  const amiTravelProviderName = 'AmiTravel';
  if (!req.user.providerContactId) return res.status(403).json({ success: false, message: 'No providerContactId' });
  const isAmiTravel = await require('../models/providerContactModel').findOne({ _id: req.user.providerContactId, providerName: amiTravelProviderName });
  if (!isAmiTravel) return res.status(403).json({ success: false, message: 'Not authorized for AmiTravel' });
  const pkg = new AmiTravel({ ...req.body, provider: req.user.providerContactId });
  await pkg.save();
  res.json({ success: true, data: pkg });
});

router.put('/amitravel/:id', auth.protect, async (req, res) => {
  if (!req.user || req.user.role !== 'travel_agency') return res.status(403).json({ success: false, message: 'Not authorized' });
  const amiTravelProviderName = 'AmiTravel';
  if (!req.user.providerContactId) return res.status(403).json({ success: false, message: 'No providerContactId' });
  const isAmiTravel = await require('../models/providerContactModel').findOne({ _id: req.user.providerContactId, providerName: amiTravelProviderName });
  if (!isAmiTravel) return res.status(403).json({ success: false, message: 'Not authorized for AmiTravel' });

  // Only allow updating certain fields
  const allowedFields = ['title', 'description', 'link', 'image', 'price', 'duration', 'inclusions', 'exclusions', 'resort', 'activities', 'features', 'destination', 'location_name', 'location', 'address'];
  const updateData = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) updateData[field] = req.body[field];
  }
  updateData.provider = req.user.providerContactId; // Always set provider

  // Debug logs
  console.log('PUT /amitravel/:id called');
  console.log('Request body:', req.body);
  console.log('Update data:', updateData);

  // Validate required fields
  const requiredFields = ['title', 'price', 'resort', 'destination'];
  for (const field of requiredFields) {
    if (!updateData[field]) {
      console.log('Missing required field:', field);
      return res.status(400).json({ success: false, message: `Missing required field: ${field}` });
    }
  }

  try {
    const pkg = await AmiTravel.findOneAndUpdate(
      { _id: req.params.id, provider: req.user.providerContactId },
      updateData,
      { new: true, runValidators: true }
    );
    if (!pkg) {
      console.log('Package not found for update:', req.params.id);
      return res.status(404).json({ success: false, message: 'Package not found' });
    }
    res.json({ success: true, data: pkg });
  } catch (err) {
    console.log('Error updating AmiTravel package:', err);
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/amitravel/:id', auth.protect, async (req, res) => {
  if (!req.user || req.user.role !== 'travel_agency') return res.status(403).json({ success: false, message: 'Not authorized' });
  const amiTravelProviderName = 'AmiTravel';
  if (!req.user.providerContactId) return res.status(403).json({ success: false, message: 'No providerContactId' });
  const isAmiTravel = await require('../models/providerContactModel').findOne({ _id: req.user.providerContactId, providerName: amiTravelProviderName });
  if (!isAmiTravel) return res.status(403).json({ success: false, message: 'Not authorized for AmiTravel' });
  const result = await AmiTravel.deleteOne({ _id: req.params.id, provider: req.user.providerContactId });
  res.json({ success: true, deletedCount: result.deletedCount });
});

// HolidayGoGoGo: Only allow HolidayGoGoGo agency to manage these
router.get('/holidaygogogo/my', auth.protect, async (req, res) => {
  if (!req.user || req.user.role !== 'travel_agency') return res.status(403).json({ success: false, message: 'Not authorized' });
  const providerName = 'HolidayGoGo';
  if (!req.user.providerContactId) return res.status(403).json({ success: false, message: 'No providerContactId' });
  const isProvider = await require('../models/providerContactModel').findOne({ _id: req.user.providerContactId, providerName });
  if (!isProvider) return res.status(403).json({ success: false, message: 'Not authorized for HolidayGoGoGo' });
  const packages = await HolidayGoGoPackage.find({ provider: req.user.providerContactId });
  res.json({ success: true, data: { packages } });
});

router.post('/holidaygogogo', auth.protect, async (req, res) => {
  if (!req.user || req.user.role !== 'travel_agency') return res.status(403).json({ success: false, message: 'Not authorized' });
  const providerName = 'HolidayGoGo';
  if (!req.user.providerContactId) return res.status(403).json({ success: false, message: 'No providerContactId' });
  const isProvider = await require('../models/providerContactModel').findOne({ _id: req.user.providerContactId, providerName });
  if (!isProvider) return res.status(403).json({ success: false, message: 'Not authorized for HolidayGoGoGo' });
  const pkg = new HolidayGoGoPackage({ ...req.body, provider: req.user.providerContactId });
  await pkg.save();
  res.json({ success: true, data: pkg });
});

router.put('/holidaygogogo/:id', auth.protect, async (req, res) => {
  if (!req.user || req.user.role !== 'travel_agency') return res.status(403).json({ success: false, message: 'Not authorized' });
  const providerName = 'HolidayGoGo';
  if (!req.user.providerContactId) return res.status(403).json({ success: false, message: 'No providerContactId' });
  const isProvider = await require('../models/providerContactModel').findOne({ _id: req.user.providerContactId, providerName });
  if (!isProvider) return res.status(403).json({ success: false, message: 'Not authorized for HolidayGoGoGo' });

  // Only allow updating certain fields
  const allowedFields = ['title', 'description', 'link', 'image', 'price', 'duration', 'inclusions', 'exclusions', 'resort', 'activities', 'features', 'destination', 'location_name', 'location', 'address'];
  const updateData = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) updateData[field] = req.body[field];
  }
  updateData.provider = req.user.providerContactId; // Always set provider

  // Debug logs
  console.log('PUT /holidaygogogo/:id called');
  console.log('Request body:', req.body);
  console.log('Update data:', updateData);

  // Validate required fields
  const requiredFields = ['title', 'price', 'resort', 'destination'];
  for (const field of requiredFields) {
    if (!updateData[field]) {
      console.log('Missing required field:', field);
      return res.status(400).json({ success: false, message: `Missing required field: ${field}` });
    }
  }

  try {
    const pkg = await HolidayGoGoPackage.findOneAndUpdate(
      { _id: req.params.id, provider: req.user.providerContactId },
      updateData,
      { new: true, runValidators: true }
    );
    if (!pkg) {
      console.log('Package not found for update:', req.params.id);
      return res.status(404).json({ success: false, message: 'Package not found' });
    }
    res.json({ success: true, data: pkg });
  } catch (err) {
    console.log('Error updating HolidayGoGoGo package:', err);
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/holidaygogogo/:id', auth.protect, async (req, res) => {
  if (!req.user || req.user.role !== 'travel_agency') return res.status(403).json({ success: false, message: 'Not authorized' });
  const providerName = 'HolidayGoGo';
  if (!req.user.providerContactId) return res.status(403).json({ success: false, message: 'No providerContactId' });
  const isProvider = await require('../models/providerContactModel').findOne({ _id: req.user.providerContactId, providerName });
  if (!isProvider) return res.status(403).json({ success: false, message: 'Not authorized for HolidayGoGoGo' });
  const result = await HolidayGoGoPackage.deleteOne({ _id: req.params.id, provider: req.user.providerContactId });
  res.json({ success: true, deletedCount: result.deletedCount });
});

module.exports = router;
