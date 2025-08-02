const mongoose = require('mongoose');

// Base schema for common fields across all types
const baseSchema = {
    title: {
        type: String,
        required: [true, "Title is required"],
        trim: true
    },
    description: {
        type: String,
        required: false,
        trim: true,
        default: ""
    },
    price: {
        type: String,
        required: false,
        default: "Price not available"
    },
    image: {
        type: String,
        required: false,
        default: ""
    },
    link: {
        type: String,
        required: [true, "Link is required"],
        trim: true
    },
    resort: {
        type: String,
        required: false,
        trim: true,
        default: ""
    },
    destination: {
        type: String,
        required: false,
        trim: true
    },
    location_name: {
        type: String,
        required: false,
        trim: true,
        default: ""
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            default: undefined
        }
    },
    address: {
        type: String,
        required: false,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastScraped: {
        type: Date,
        default: Date.now
    },
    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProviderContact',
        required: true
    }
};

// Package Schema
const packageSchema = new mongoose.Schema({
    ...baseSchema,
    duration: {
        type: String,
        required: false,
        trim: true
    },
    inclusions: [{
        type: String,
        trim: true
    }],
    exclusions: [{
        type: String,
        trim: true
    }],
    type: {
        type: String,
        enum: ['package'],
        default: 'package'
    }
}, {
    timestamps: true,
    collection: 'holidaygogogopackages'
});

// Add indexes for better query performance
packageSchema.index({ link: 1 }, { unique: true });
packageSchema.index({ destination: 1 });
packageSchema.index({ type: 1 });
packageSchema.index({ location: '2dsphere' });

// Create models
const HolidayGoGoPackage = mongoose.model('HolidayGoGoPackage', packageSchema);

module.exports = {
    HolidayGoGoPackage
};