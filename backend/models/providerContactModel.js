const mongoose = require('mongoose');

const providerContactSchema = new mongoose.Schema({
  providerName: {
    type: String,
    required: true,
    enum: ['AmiTravel', 'HolidayGoGo', 'PulauMalaysia', 'Package'],
    unique: true
  },
  contactInfo: {
    whatsappNumber: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          // E.164 format validation (international phone number)
          return /^\+?[1-9]\d{1,14}$/.test(v.replace(/[\s-]/g, ''));
        },
        message: 'Invalid WhatsApp number format'
      }
    },
    businessName: {
      type: String,
      required: true
    },
    email: String,
    alternativeEmails: [String],
    phoneNumbers: [String],
    website: String,
    operatingHours: {
      timezone: { type: String, default: 'Asia/Kuala_Lumpur' },
      weekdays: { 
        start: { type: String, default: '09:00' }, 
        end: { type: String, default: '18:00' } 
      },
      weekends: { 
        start: { type: String, default: '09:00' }, 
        end: { type: String, default: '17:00' } 
      }
    },
    responseTime: {
      type: String,
      default: 'Usually responds within 2-4 hours'
    }
  },
  messageTemplates: {
    greeting: { 
      type: String, 
      default: 'Hello! I\'m interested in your travel package.' 
    },
    signature: { 
      type: String, 
      default: 'Thank you for your time!' 
    },
    customFields: [String]
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  lastUpdated: { 
    type: Date, 
    default: Date.now 
  }
}, { 
  timestamps: true 
});

// Update lastUpdated on save
providerContactSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

// Static method to get provider contact by name
providerContactSchema.statics.getByProvider = function(providerName) {
  return this.findOne({ providerName, isActive: true });
};

// Static method to get all active providers
providerContactSchema.statics.getAllActive = function() {
  return this.find({ isActive: true }).sort({ providerName: 1 });
};

// Utility to ensure default providers exist
providerContactSchema.statics.ensureDefaultProviders = async function() {
  const defaults = [
    {
      providerName: 'AmiTravel',
      contactInfo: {
        whatsappNumber: '+60123456789',
        businessName: 'AmiTravel',
        email: 'info@amitravel.com',
        website: 'https://amitravel.com'
      }
    },
    {
      providerName: 'HolidayGoGo',
      contactInfo: {
        whatsappNumber: '+60198765432',
        businessName: 'HolidayGoGoGo',
        email: 'info@holidaygogogo.com',
        website: 'https://holidaygogogo.com'
      }
    }
  ];
  for (const def of defaults) {
    const exists = await this.findOne({ providerName: def.providerName });
    if (!exists) {
      await this.create(def);
    }
  }
};

module.exports = mongoose.model('ProviderContact', providerContactSchema);
