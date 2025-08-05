const mongoose = require('mongoose');

const amiTravelSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  link: String,
  image: String,
  price: {
    type: String,
    required: true
  },
  duration: String,
  inclusions: [{
    type: String,
    trim: true
  }],
  exclusions: [{
    type: String,
    trim: true
  }],
  resort: {
    type: String,
    required: true
  },
  activities: [String],
  features: [String],
  destination: {
    type: String,
    required: true
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProviderContact',
    required: true
  },
  location_name: String,
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  address: String,
  lastScraped: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { collection: 'amitravel' });

// Create a 2dsphere index on the location field
amiTravelSchema.index({ location: '2dsphere' });

// Make (destination + title) combination unique
amiTravelSchema.index(
  { 
    destination: 1,
    title: 1 
  }, 
  { 
    unique: true,
    background: true // Create index in background to not block operations
  }
);

// Add text index for full-text search on title, destination, and resort
amiTravelSchema.index({ title: 'text', destination: 'text', resort: 'text' });

// Add single-field indexes for regex search performance
amiTravelSchema.index({ title: 1 });
amiTravelSchema.index({ destination: 1 });
amiTravelSchema.index({ resort: 1 });

// Check if the model already exists
const AmiTravel = mongoose.models.AmiTravel || mongoose.model('AmiTravel', amiTravelSchema);

// Register a generic 'Package' model for compatibility (fixes MissingSchemaError)
if (!mongoose.models.Package) {
  mongoose.model('Package', amiTravelSchema);
}

module.exports = AmiTravel;
