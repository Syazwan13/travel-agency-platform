const mongoose = require('mongoose');
require('dotenv').config();

async function identifyMissingCoordinates() {
  try {
    await mongoose.connect(process.env.DATABASE_CLOUD);
    console.log('Connected to MongoDB');
    
    console.log('=== PACKAGES WITH [0,0] COORDINATES ===\n');
    
    // Find all packages with [0,0] coordinates
    const invalidPackages = await mongoose.connection.db.collection('holidaygogogopackages')
      .find({ 'location.coordinates': [0, 0] }).toArray();
    
    console.log(`Found ${invalidPackages.length} packages with invalid coordinates:\n`);
    
    // Group by resort name
    const resortGroups = {};
    invalidPackages.forEach(pkg => {
      const resort = pkg.resort || 'Unknown Resort';
      if (!resortGroups[resort]) {
        resortGroups[resort] = {
          count: 0,
          destination: pkg.destination,
          packages: []
        };
      }
      resortGroups[resort].count++;
      resortGroups[resort].packages.push({
        title: pkg.title,
        price: pkg.price,
        id: pkg._id
      });
    });
    
    // Display grouped results
    Object.entries(resortGroups).forEach(([resort, data]) => {
      console.log(`🏨 ${resort} (${data.destination})`);
      console.log(`   📦 ${data.count} packages need coordinates`);
      console.log(`   📋 Sample titles:`);
      data.packages.slice(0, 2).forEach(pkg => {
        console.log(`      - ${pkg.title}`);
      });
      console.log('');
    });
    
    // Also check amitravel collection
    console.log('\n=== CHECKING AMITRAVEL COLLECTION ===');
    const amiInvalidPackages = await mongoose.connection.db.collection('amitravel')
      .find({ 'location.coordinates': [0, 0] }).toArray();
    
    console.log(`Found ${amiInvalidPackages.length} AmiTravel packages with [0,0] coordinates`);
    
    const amiResortGroups = {};
    amiInvalidPackages.forEach(pkg => {
      const resort = pkg.resort || 'Unknown Resort';
      if (!amiResortGroups[resort]) {
        amiResortGroups[resort] = {
          count: 0,
          destination: pkg.destination
        };
      }
      amiResortGroups[resort].count++;
    });
    
    Object.entries(amiResortGroups).forEach(([resort, data]) => {
      console.log(`🏨 ${resort} (${data.destination}) - ${data.count} packages`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

identifyMissingCoordinates();
