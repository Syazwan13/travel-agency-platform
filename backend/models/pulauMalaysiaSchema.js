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
    destination: {
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
    highlights: [{
        type: String,
        trim: true
    }],
    type: {
        type: String,
        enum: ['package'],
        default: 'package'
    }
}, {
    timestamps: true
});

// Add indexes for better query performance
packageSchema.index({ link: 1 }, { unique: true });
packageSchema.index({ destination: 1 });
packageSchema.index({ type: 1 });

// Create models
const PulauMalaysiaPackage = mongoose.model('PulauMalaysiaPackage', packageSchema);

module.exports = {
    PulauMalaysiaPackage
}; 