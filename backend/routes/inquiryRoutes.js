const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/authMiddleWare');
const {
  createInquiry,
  getUserInquiries,
  getInquiryById,
  trackWhatsAppClick,
  regenerateMessage
} = require('../controllers/inquiryController');

const {
  getProviderContact,
  getAllProviderContacts,
  createProviderContact
} = require('../controllers/providerContactController');

// Inquiry routes
router.post('/', protect, createInquiry); // Only authenticated users can create inquiries
router.get('/', protect, getUserInquiries);
router.get('/:id', protect, getInquiryById);

// WhatsApp Integration routes
router.post('/:id/generate-message', regenerateMessage); // Allow anonymous message generation
router.post('/:id/track-whatsapp', trackWhatsAppClick); // Allow anonymous tracking

// Provider contact routes
router.get('/providers/:provider/contact', getProviderContact);
router.get('/providers/contacts/all', getAllProviderContacts);

// Admin routes for provider management
router.post('/admin/providers', protect, isAdmin, createProviderContact);

module.exports = router;
