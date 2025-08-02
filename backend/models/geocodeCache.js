const mongoose = require('mongoose');

const geocodeCacheSchema = new mongoose.Schema({
  query: {
    type: String,
    required: true,
    unique: true
  },
  resortName: {
    type: String,
    required: true
  },
  island: {
    type: String,
    required: true
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true,
    validate: {
      validator: function(v) {
        return v.length === 2 && 
               v[0] >= -180 && v[0] <= 180 && // longitude
               v[1] >= -90 && v[1] <= 90;     // latitude
      },
      message: 'Invalid coordinates format'
    }
  },
  formattedAddress: {
    type: String,
    required: true
  },
  qualityScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  method: {
    type: String,
    enum: ['api_geocoding', 'beach_match', 'fallback', 'manual'],
    default: 'api_geocoding'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  originalName: {
    type: String
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Create indexes for faster queries
// query index is already created by unique: true in schema
geocodeCacheSchema.index({ resortName: 1, island: 1 });
geocodeCacheSchema.index({ coordinates: '2dsphere' });

module.exports = mongoose.model('GeocodeCache', geocodeCacheSchema);
