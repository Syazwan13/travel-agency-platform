require('dotenv').config();
const mongoose = require('mongoose');
const AmiTravel = require('../models/amiTravelSchema');

async function addIsActiveField() {
  try {
    await mongoose.connect(process.env.DATABASE_CLOUD);
    console.log('🔗 Connected to MongoDB');
    
    // Count packages without isActive field
    const packagesWithoutIsActive = await AmiTravel.countDocuments({ 
      isActive: { $exists: false } 
    });
    
    console.log(`📊 Found ${packagesWithoutIsActive} packages without isActive field`);
    
    if (packagesWithoutIsActive === 0) {
      console.log('✅ All packages already have isActive field!');
      process.exit(0);
    }
    
    // Add isActive: true to all packages that don't have it
    const result = await AmiTravel.updateMany(
      { isActive: { $exists: false } },
      { $set: { isActive: true } }
    );
    
    console.log(`✅ Added isActive field to ${result.modifiedCount} packages`);
    
    // Verify the update
    const totalPackages = await AmiTravel.countDocuments({});
    const activePackages = await AmiTravel.countDocuments({ isActive: true });
    const inactivePackages = await AmiTravel.countDocuments({ isActive: false });
    
    console.log(`\n📊 Final Status:`);
    console.log(`   Total packages: ${totalPackages}`);
    console.log(`   Active packages: ${activePackages}`);
    console.log(`   Inactive packages: ${inactivePackages}`);
    console.log(`   Success rate: ${((activePackages/totalPackages) * 100).toFixed(1)}%`);
    
    console.log('\n🎉 AmiTravel packages should now show as "Active" in the frontend!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addIsActiveField();