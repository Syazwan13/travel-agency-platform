const mongoose = require('mongoose');
require('dotenv').config();

async function analyzeAndImproveCoordinates() {
  try {
    await mongoose.connect(process.env.DATABASE_CLOUD);
    console.log('Connected to MongoDB');
    
    const collections = [
      { name: 'holidaygogogopackages', resortField: 'resort' },
      { name: 'amitravel', resortField: 'resort' },
      { name: 'resortlocations', resortField: 'name' },
      { name: 'geocodecaches', resortField: 'resortName' }
    ];
    
    for (const { name, resortField } of collections) {
      console.log(`\n=== ${name.toUpperCase()} ===`);
      const collection = mongoose.connection.db.collection(name);
      
      const docs = await collection.find({
        $or: [
          { 'location.coordinates': { $exists: true } },
          { coordinates: { $exists: true } }
        ]
      }).limit(10).toArray();
      
      console.log(`Found ${docs.length} documents with coordinates`);
      
      docs.forEach((doc, index) => {
        const coords = doc.location?.coordinates || doc.coordinates;
        const resortName = doc[resortField] || 'Unknown';
        
        if (coords && coords.length === 2) {
          const [lng, lat] = coords;
          const lngPrecision = lng.toString().split('.')[1]?.length || 0;
          const latPrecision = lat.toString().split('.')[1]?.length || 0;
          
          console.log(`\n${index + 1}. ${resortName}`);
          console.log(`   Current: [${lng}, ${lat}]`);
          console.log(`   Precision: Lng(${lngPrecision}), Lat(${latPrecision})`);
          
          // Check for low precision or [0,0] coordinates
          if (lng === 0 && lat === 0) {
            console.log(`   ❌ INVALID: [0,0] coordinates`);
          } else if (lngPrecision < 4 || latPrecision < 4) {
            console.log(`   ⚠️  LOW PRECISION: Consider updating`);
          } else {
            console.log(`   ✅ Good precision`);
          }
          
          // Generate Google Maps link for verification
          console.log(`   🗺️  Google Maps: https://www.google.com/maps?q=${lat},${lng}&z=16`);
        }
      });
    }
    
    // Check for resorts with [0,0] coordinates that need fixing
    console.log(`\n=== RESORTS NEEDING COORDINATE FIXES ===`);
    const invalidCoords = await mongoose.connection.db.collection('holidaygogogopackages')
      .find({ 'location.coordinates': [0, 0] }).limit(10).toArray();
    
    console.log(`Found ${invalidCoords.length} packages with [0,0] coordinates:`);
    invalidCoords.forEach(doc => {
      console.log(`- ${doc.resort} (${doc.destination})`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

analyzeAndImproveCoordinates();
