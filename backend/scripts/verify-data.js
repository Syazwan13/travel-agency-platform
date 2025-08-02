require('dotenv').config();
const mongoose = require('mongoose');
const AmiTravel = require('../models/amiTravelSchema');

async function connectDB() {
    try {
        await mongoose.connect(process.env.DATABASE_CLOUD);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
}

async function verifyPackages() {
    try {
        await connectDB();

        // Get all packages
        const packages = await AmiTravel.find({}).limit(5);
        
        console.log('\nVerifying first 5 packages:\n');
        packages.forEach((pkg, index) => {
            console.log(`Package ${index + 1}:`);
            console.log('Title:', pkg.title);
            console.log('Price:', pkg.price);
            console.log('Resort:', pkg.resort);
            console.log('Destination:', pkg.destination);
            console.log('-------------------');
        });

    } catch (error) {
        console.error('Error verifying packages:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
}

// Run the verification
verifyPackages(); 