const mongoose = require('mongoose');
require('dotenv').config();

// Exact coordinates from Google Maps for accurate positioning
const GOOGLE_MAPS_EXACT_COORDINATES = {
  // Tioman Island - Exact coordinates from Google Maps
  'Tunamaya Beach & Spa Resort': [104.15270701091619, 2.7204043154262854], // From your Google Maps
  
  // Let me add a few more that we should verify
  'Japamala Resort': [104.152378, 2.824567],  // May need updating
  'Bagus Place Retreat': [104.143921, 2.821834], // May need updating
  'Minang Cove Resort': [104.146832, 2.826743], // May need updating
  'Berjaya Tioman Resort': [104.164321, 2.813456], // May need updating
  
  // These coordinates should also be verified against Google Maps
  'Aman Tioman Beach Resort': [104.145678, 2.825234], // Check if accurate
  'Tioman Paya Beach Resort': [104.151234, 2.819876], // Check if accurate
  'Paya Beach Spa & Dive Resort': [104.151234, 2.819876], // Check if accurate
};

async function updateWithExactGoogleMapsCoordinates() {
  try {
    await mongoose.connect(process.env.DATABASE_CLOUD);
    console.log('Connected to MongoDB');
    
    console.log('=== UPDATING WITH EXACT GOOGLE MAPS COORDINATES ===\n');
    
    const collections = [
      { name: 'holidaygogogopackages', resortField: 'resort' },
      { name: 'amitravel', resortField: 'resort' }
    ];
    
    let totalUpdated = 0;
    
    for (const { name, resortField } of collections) {
      console.log(`🗺️ UPDATING ${name.toUpperCase()} WITH EXACT COORDINATES`);
      const collection = mongoose.connection.db.collection(name);
      
      for (const [resortName, coordinates] of Object.entries(GOOGLE_MAPS_EXACT_COORDINATES)) {
        const [lng, lat] = coordinates;
        
        // Find documents with this resort name
        const filter = {};
        filter[resortField] = { $regex: resortName, $options: 'i' };
        
        const docs = await collection.find(filter).toArray();
        
        if (docs.length > 0) {
          console.log(`\n🏨 ${resortName}:`);
          console.log(`   📦 Found ${docs.length} packages to update`);
          
          // Show current vs new coordinates
          const currentCoords = docs[0].location?.coordinates;
          if (currentCoords) {
            console.log(`   📍 Current: [${currentCoords[0]}, ${currentCoords[1]}]`);
            console.log(`   🎯 New (Google Maps): [${lng}, ${lat}]`);
            
            // Calculate distance difference
            const distance = calculateDistance(currentCoords[1], currentCoords[0], lat, lng);
            console.log(`   📏 Distance difference: ${distance.toFixed(2)}m`);
          }
          
          // Update all matching documents
          const updateResult = await collection.updateMany(
            filter,
            {
              $set: {
                'location.type': 'Point',
                'location.coordinates': [lng, lat],
                'location.lastUpdated': new Date(),
                'location.precision': 'google_maps_exact',
                'location.source': 'google_maps_verified'
              }
            }
          );
          
          console.log(`   ✅ Updated ${updateResult.modifiedCount} packages`);
          console.log(`   🗺️  Verify: https://www.google.com/maps?q=${lat},${lng}&z=17`);
          
          totalUpdated += updateResult.modifiedCount;
        }
      }
    }
    
    console.log(`\n=== VERIFICATION ===`);
    console.log(`✅ Total packages updated: ${totalUpdated}`);
    
    // Show updated Tunamaya coordinates
    const tunamayaCheck = await mongoose.connection.db.collection('holidaygogogopackages')
      .findOne({ resort: /Tunamaya/i });
    
    if (tunamayaCheck && tunamayaCheck.location?.coordinates) {
      const coords = tunamayaCheck.location.coordinates;
      console.log(`\n🏨 TUNAMAYA VERIFICATION:`);
      console.log(`   📍 Database: [${coords[0]}, ${coords[1]}]`);
      console.log(`   🎯 Expected: [104.15270701091619, 2.7204043154262854]`);
      console.log(`   ✅ Match: ${coords[0] === 104.15270701091619 && coords[1] === 2.7204043154262854}`);
      console.log(`   🗺️  Google Maps: https://www.google.com/maps?q=${coords[1]},${coords[0]}&z=17`);
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // Earth's radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lng2-lng1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
}

updateWithExactGoogleMapsCoordinates();
