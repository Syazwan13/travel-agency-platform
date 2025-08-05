require('dotenv').config();
const mongoose = require('mongoose');
const AmiTravel = require('../models/amiTravelSchema');

async function reactivateAmiTravelPackages() {
  try {
    await mongoose.connect(process.env.DATABASE_CLOUD);
    console.log('🔗 Connected to MongoDB');
    
    // Count inactive packages
    const inactiveCount = await AmiTravel.countDocuments({ isActive: false });
    console.log(`📊 Found ${inactiveCount} inactive AmiTravel packages`);
    
    if (inactiveCount === 0) {
      console.log('✅ All AmiTravel packages are already active!');
      process.exit(0);
    }
    
    // Update all inactive packages to active
    const result = await AmiTravel.updateMany(
      { isActive: false },
      { 
        $set: { 
          isActive: true,
          lastScraped: new Date()
        }
      }
    );
    
    console.log(`✅ Successfully reactivated ${result.modifiedCount} AmiTravel packages`);
    
    // Verify the update
    const activeCount = await AmiTravel.countDocuments({ isActive: true });
    const totalCount = await AmiTravel.countDocuments({});
    
    console.log(`📊 Final Status:`);
    console.log(`   Active: ${activeCount}`);
    console.log(`   Total: ${totalCount}`);
    console.log(`   Success Rate: ${((activeCount/totalCount) * 100).toFixed(1)}%`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

reactivateAmiTravelPackages();