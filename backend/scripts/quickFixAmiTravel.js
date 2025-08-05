require('dotenv').config();
const mongoose = require('mongoose');
const AmiTravel = require('../models/amiTravelSchema');

mongoose.connect(process.env.DATABASE_CLOUD).then(async () => {
  console.log('Connected to MongoDB');
  
  const activeCount = await AmiTravel.countDocuments({ isActive: true });
  const inactiveCount = await AmiTravel.countDocuments({ isActive: false });
  const totalCount = await AmiTravel.countDocuments({});
  
  console.log('AmiTravel Package Status:');
  console.log('Active:', activeCount);
  console.log('Inactive:', inactiveCount);
  console.log('Total:', totalCount);
  
  if (inactiveCount > 0) {
    console.log('\nReactivating inactive packages...');
    const result = await AmiTravel.updateMany(
      { isActive: false },
      { $set: { isActive: true } }
    );
    console.log(`✅ Reactivated ${result.modifiedCount} packages`);
  } else {
    console.log('✅ All packages are already active');
  }
  
  process.exit(0);
}).catch(console.error);