const mongoose = require('mongoose');

const resortLocationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    island: {
        type: String,
        required: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    coordinateSource: {
        type: String,
        default: 'master'
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    isAlias: {
        type: Boolean,
        default: false
    },
    originalResort: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ResortLocation'
    }
}, {
    strict: false // Allow additional fields that might exist in the database
});

// Create a 2dsphere index for geospatial queries
resortLocationSchema.index({ location: '2dsphere' });

// Add method to get canonical resort name
resortLocationSchema.methods.getCanonicalName = async function() {
    if (!this.isAlias) return this.name;
    const original = await this.model('ResortLocation').findById(this.originalResort);
    return original ? original.name : this.name;
};

module.exports = mongoose.model('ResortLocation', resortLocationSchema);