require('dotenv').config();
const mongoose = require('mongoose');
const GeocodeCache = require('../models/geocodeCache');

async function clearCache() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.DATABASE_CLOUD);
        console.log('Connected to MongoDB');

        // Delete all entries in the geocode cache
        await GeocodeCache.deleteMany({});
        console.log('Geocode cache cleared');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
    }
}

clearCache(); 