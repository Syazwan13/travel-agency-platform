const mongoose = require('mongoose');
require('dotenv').config();

async function getCoordinateComparisonTool() {
  try {
    await mongoose.connect(process.env.DATABASE_CLOUD);
    console.log('Connected to MongoDB');
    
    console.log('=== COORDINATE COMPARISON TOOL ===\n');
    console.log('This tool shows current database coordinates vs Google Maps for verification\n');
    
    // Get all resorts that might need coordinate verification
    const collections = ['holidaygogogopackages', 'amitravel'];
    const resortCoordinates = new Map();
    
    for (const collectionName of collections) {
      const docs = await mongoose.connection.db.collection(collectionName)
        .find({ 'location.coordinates': { $exists: true, $ne: [0, 0] } }).toArray();
      
      docs.forEach(doc => {
        const resort = doc.resort;
        const coords = doc.location?.coordinates;
        if (resort && coords && coords.length === 2) {
          if (!resortCoordinates.has(resort)) {
            resortCoordinates.set(resort, {
              coordinates: coords,
              destination: doc.destination,
              packages: 0
            });
          }
          resortCoordinates.get(resort).packages++;
        }
      });
    }
    
    console.log('📋 RESORT COORDINATES FOR VERIFICATION:\n');
    console.log('Copy these coordinates to Google Maps to verify accuracy:\n');
    
    // Group by destination for easier verification
    const byDestination = {};
    resortCoordinates.forEach((data, resort) => {
      const dest = data.destination || 'Unknown';
      if (!byDestination[dest]) byDestination[dest] = [];
      byDestination[dest].push({ resort, ...data });
    });
    
    Object.entries(byDestination).forEach(([destination, resorts]) => {
      console.log(`🏝️ ${destination.toUpperCase()}:`);
      resorts.forEach(({ resort, coordinates, packages }) => {
        const [lng, lat] = coordinates;
        console.log(`\n🏨 ${resort}:`);
        console.log(`   📍 Database: ${lat}, ${lng}`);
        console.log(`   📦 Packages: ${packages}`);
        console.log(`   🔗 Google Maps: https://www.google.com/maps?q=${lat},${lng}&z=17`);
        console.log(`   📝 To update: If different, copy exact coordinates from Google Maps`);
      });
      console.log('\n' + '='.repeat(60) + '\n');
    });
    
    console.log('🛠️ HOW TO USE THIS TOOL:\n');
    console.log('1. Click each Google Maps link above');
    console.log('2. Verify the marker is at the correct resort location');
    console.log('3. If wrong, right-click the correct location on Google Maps');
    console.log('4. Copy the coordinates (format: lat, lng)');
    console.log('5. Update the database using the update script\n');
    
    console.log('📝 COORDINATE UPDATE TEMPLATE:');
    console.log(`
// Add to GOOGLE_MAPS_EXACT_COORDINATES object:
'Resort Name': [lng, lat], // [longitude, latitude] format
    `);
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

getCoordinateComparisonTool();
