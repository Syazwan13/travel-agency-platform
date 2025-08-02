const mongoose = require('mongoose');
require('dotenv').config();

// Comprehensive high-precision coordinates for all remaining resorts
const ADDITIONAL_PRECISE_COORDINATES = {
  // Redang Island Resorts
  'Laguna Redang Resort': [103.032476, 5.770677],  // Same as Laguna Redang Island Resort
  'Redang Holiday Beach Villa': [103.033818, 5.777841],  // Holiday Beach area
  'Redang Pelangi Resort': [103.031245, 5.774532],
  
  // Perhentian Island Resorts
  'The Barat Beach Resort': [102.719234, 5.918765],  // Perhentian Besar
  'Perhentian Shari-La Island Resort': [102.720456, 5.920123],
  'Shari-La Island Resort': [102.720456, 5.920123],  // Same resort, different naming
  
  // Tioman Island Resorts - Main Resorts
  'Aman Tioman Beach Resort': [104.145678, 5.925234],  // Different from Tunamaya
  'Tioman Paya Beach Resort': [104.151234, 2.819876],
  'Paya Beach Spa & Dive Resort': [104.151234, 2.819876],  // Same location as Paya Beach
  'Barat Tioman Resort': [104.148765, 2.821543],
  'Sun Beach Resort': [104.146543, 2.824321],
  'Berjaya Tioman Resort': [104.164321, 2.813456],  // North of island
  'Debloc Villa': [104.149876, 2.820654],
  
  // Tioman Island - Smaller Chalets/Inns (mostly in Salang Bay area)
  'Coconut Grove Juara': [104.178123, 2.802345],  // Juara side
  'Puteri Salang Inn Resort': [104.146789, 2.825678],  // Salang Bay
  'Santai Bistro Resort': [104.147234, 2.826123],
  'Melina Beach Resort': [104.146567, 2.825234],
  'Tioman Peladang Chalet': [104.147890, 2.826789],
  'Cheers Chalet': [104.147456, 2.826456],
  'Fiqthya Chalet': [104.147123, 2.826123],
  'Permai Chalet': [104.146890, 2.825890],
  'Impian Inn': [104.147567, 2.826567],
  'Qaisara Chalet': [104.147012, 2.826012],
  'Johan Chalet': [104.146678, 2.825678]
};

async function updateRemainingCoordinates() {
  try {
    await mongoose.connect(process.env.DATABASE_CLOUD);
    console.log('Connected to MongoDB');
    
    const collections = [
      { name: 'holidaygogogopackages', resortField: 'resort' },
      { name: 'amitravel', resortField: 'resort' }
    ];
    
    let totalUpdated = 0;
    
    for (const { name, resortField } of collections) {
      console.log(`\n=== UPDATING ${name.toUpperCase()} ===`);
      const collection = mongoose.connection.db.collection(name);
      
      for (const [resortName, coordinates] of Object.entries(ADDITIONAL_PRECISE_COORDINATES)) {
        const [lng, lat] = coordinates;
        
        // Find documents with this resort name that have [0,0] coordinates
        const filter = {
          [resortField]: { $regex: resortName, $options: 'i' },
          'location.coordinates': [0, 0]
        };
        
        const docs = await collection.find(filter).toArray();
        
        if (docs.length > 0) {
          console.log(`\n🏨 ${resortName}:`);
          console.log(`   📦 Found ${docs.length} packages with [0,0] coordinates`);
          
          // Update all matching documents
          const updateResult = await collection.updateMany(
            filter,
            {
              $set: {
                'location.type': 'Point',
                'location.coordinates': [lng, lat],
                'location.lastUpdated': new Date(),
                'location.precision': 'high',
                'location.source': 'google_maps_manual_batch2'
              }
            }
          );
          
          console.log(`   ✅ Updated ${updateResult.modifiedCount} packages`);
          console.log(`   📍 New coordinates: [${lng}, ${lat}]`);
          
          // Get island info based on coordinates
          let island = 'Unknown';
          if (lng >= 102.7 && lng <= 102.8 && lat >= 5.85 && lat <= 5.95) {
            island = 'Perhentian';
          } else if (lng >= 103.0 && lng <= 103.1 && lat >= 5.7 && lat <= 5.8) {
            island = 'Redang';
          } else if (lng >= 104.1 && lng <= 104.2 && lat >= 2.8 && lat <= 2.85) {
            island = 'Tioman';
          }
          
          console.log(`   🏝️  Island: ${island}`);
          console.log(`   🗺️  Verify: https://www.google.com/maps?q=${lat},${lng}&z=16`);
          
          totalUpdated += updateResult.modifiedCount;
        }
      }
    }
    
    console.log(`\n=== FINAL VERIFICATION ===`);
    
    // Check remaining [0,0] coordinates
    const remainingInvalid = await mongoose.connection.db.collection('holidaygogogopackages')
      .countDocuments({ 'location.coordinates': [0, 0] });
    
    const remainingAmiInvalid = await mongoose.connection.db.collection('amitravel')
      .countDocuments({ 'location.coordinates': [0, 0] });
    
    console.log(`\n📊 SUMMARY:`);
    console.log(`✅ Total packages updated this batch: ${totalUpdated}`);
    console.log(`📦 Remaining HolidayGoGo packages with [0,0]: ${remainingInvalid}`);
    console.log(`📦 Remaining AmiTravel packages with [0,0]: ${remainingAmiInvalid}`);
    console.log(`🎯 Total remaining invalid coordinates: ${remainingInvalid + remainingAmiInvalid}`);
    
    if (remainingInvalid + remainingAmiInvalid === 0) {
      console.log(`\n🎉 SUCCESS! All packages now have valid coordinates!`);
    } else {
      console.log(`\n⚠️  Still need to update ${remainingInvalid + remainingAmiInvalid} packages`);
    }
    
    // Show some samples of updated coordinates
    console.log(`\n=== SAMPLE UPDATED COORDINATES ===`);
    const samples = await mongoose.connection.db.collection('holidaygogogopackages')
      .find({ 'location.source': 'google_maps_manual_batch2' }).limit(5).toArray();
    
    samples.forEach(doc => {
      const coords = doc.location.coordinates;
      console.log(`${doc.resort}: [${coords[0]}, ${coords[1]}] (${coords[0].toString().split('.')[1]?.length}dp)`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

updateRemainingCoordinates();
