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

async function cleanDatabase() {
    try {
        await connectDB();

        // Delete all documents from the AmiTravel collection
        const result = await AmiTravel.deleteMany({});
        console.log(`Deleted ${result.deletedCount} packages from the database`);

    } catch (error) {
        console.error('Error cleaning database:', error);
    } finally {
        // Close the database connection
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

// Run the cleaning process
cleanDatabase(); 