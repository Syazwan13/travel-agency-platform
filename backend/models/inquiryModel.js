const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  // User Information (optional for anonymous inquiries)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  
  // Package Information
  packageInfo: {
    packageId: { type: String, required: true },
    packageSource: { 
      type: String, 
      enum: ['AmiTravel', 'HolidayGoGo', 'PulauMalaysia', 'Package'],
      required: true 
    },
    packageTitle: { type: String, required: true },
    packagePrice: String,
    packageDestination: String,
    packageDuration: String,
    packageLink: String
  },
  
  // Travel Details
  travelDetails: {
    preferredDates: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      isFlexible: { type: Boolean, default: false },
      flexibilityDays: { type: Number, default: 0 }
    },
    groupInfo: {
      adults: { type: Number, required: true, min: 1 },
      children: { type: Number, default: 0 },
      infants: { type: Number, default: 0 },
      totalPax: { type: Number, required: true }
    },
    accommodationPreferences: {
      roomType: { 
        type: String, 
        enum: ['single', 'double', 'twin', 'family', 'suite', 'any'],
        default: 'any'
      },
      roomCount: { type: Number, default: 1 },
      bedPreference: {
        type: String,
        enum: ['king', 'queen', 'twin', 'any'],
        default: 'any'
      },
      viewPreference: {
        type: String,
        enum: ['sea', 'garden', 'city', 'any'],
        default: 'any'
      }
    }
  },
  
  // Special Requirements
  specialRequirements: {
    dietaryRestrictions: [String],
    celebrationOccasion: String,
    budgetRange: {
      min: Number,
      max: Number,
      currency: { type: String, default: 'MYR' }
    },
    customRequests: String
  },
  
  // Contact Preferences
  contactPreferences: {
    preferredContactMethod: {
      type: String,
      enum: ['whatsapp', 'email', 'phone'],
      default: 'whatsapp'
    },
    preferredContactTime: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'anytime'],
      default: 'anytime'
    },
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    }
  },
  
  // WhatsApp Integration
  whatsappData: {
    messageGenerated: String,
    messageSent: { type: Boolean, default: false },
    sentAt: Date,
    providerNumber: String,
    messageId: String
  },
  
  // Status Tracking
  status: {
    type: String,
    enum: ['draft', 'submitted', 'contacted', 'quoted', 'booked', 'cancelled'],
    default: 'draft'
  },
  
  // Analytics
  analytics: {
    formStartedAt: Date,
    formCompletedAt: Date,
    timeToComplete: Number,
    deviceType: String,
    referrerPage: String
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
inquirySchema.index({ userId: 1, createdAt: -1 });
inquirySchema.index({ 'packageInfo.packageSource': 1 });
inquirySchema.index({ status: 1 });
inquirySchema.index({ 'travelDetails.preferredDates.startDate': 1 });

// Virtual for total days
inquirySchema.virtual('totalDays').get(function() {
  if (this.travelDetails.preferredDates.startDate && this.travelDetails.preferredDates.endDate) {
    const diffTime = Math.abs(this.travelDetails.preferredDates.endDate - this.travelDetails.preferredDates.startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return 0;
});

module.exports = mongoose.model('Inquiry', inquirySchema);
