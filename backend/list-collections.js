const mongoose = require('mongoose');
require('dotenv').config();

async function listCollections() {
  try {
    await mongoose.connect(process.env.DATABASE_CLOUD);
    console.log('Connected to MongoDB');
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nAvailable collections:');
    collections.forEach(col => console.log(`- ${col.name}`));
    
    // Check each collection for coordinate data
    for (const col of collections) {
      console.log(`\n=== ${col.name.toUpperCase()} ===`);
      const collection = mongoose.connection.db.collection(col.name);
      
      // Sample a few documents to see the structure
      const sample = await collection.findOne({});
      if (sample) {
        console.log('Sample document structure:');
        console.log('Keys:', Object.keys(sample));
        
        // Check for coordinates
        if (sample.location?.coordinates) {
          console.log('Has location.coordinates:', sample.location.coordinates);
        }
        if (sample.coordinates) {
          console.log('Has coordinates:', sample.coordinates);
        }
        if (sample.resort) {
          console.log('Resort name:', sample.resort);
        }
      }
      
      // Count documents with coordinates
      const countWithCoords = await collection.countDocuments({
        $or: [
          { 'location.coordinates': { $exists: true } },
          { coordinates: { $exists: true } }
        ]
      });
      console.log(`Documents with coordinates: ${countWithCoords}`);
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

listCollections();
