require('dotenv').config();
const mongoose = require('mongoose');
const GeocodeCache = require('./models/geocodeCache');

async function updatePackageCoordinates() {
  try {
    await mongoose.connect(process.env.DATABASE_CLOUD || process.env.DATABASE_URL);
    console.log('Connected to MongoDB');
    
    // Import package models
    const AmiTravel = require('./models/amiTravelSchema');
    const { HolidayGoGoPackage } = require('./models/holidayGoGoGoSchema');
    const { PulauMalaysiaPackage } = require('./models/pulauMalaysiaSchema');
    
    // Get the best coordinates for Tunamaya
    const tunamayaCoords = await GeocodeCache.findOne({
      resortName: { $regex: 'tunamaya', $options: 'i' },
      qualityScore: { $gte: 90 }
    }).sort({ qualityScore: -1 });
    
    if (!tunamayaCoords) {
      console.log('❌ No high-quality Tunamaya coordinates found');
      return;
    }
    
    console.log(`✅ Found best Tunamaya coordinates: [${tunamayaCoords.coordinates[0]}, ${tunamayaCoords.coordinates[1]}] (${tunamayaCoords.qualityScore}%)`);
    
    const validCoordinates = tunamayaCoords.coordinates;
    
    // Update AmiTravel packages
    console.log('\n🔄 Updating AmiTravel packages...');
    const amiResult = await AmiTravel.updateMany(
      { resort: { $regex: 'tunamaya', $options: 'i' } },
      { 
        $set: { 
          location: {
            type: 'Point',
            coordinates: validCoordinates
          }
        }
      }
    );
    console.log(`✅ Updated ${amiResult.modifiedCount} AmiTravel packages`);
    
    // Update HolidayGoGo packages
    console.log('\n🔄 Updating HolidayGoGo packages...');
    const hggResult = await HolidayGoGoPackage.updateMany(
      { resort: { $regex: 'tunamaya', $options: 'i' } },
      { 
        $set: { 
          location: {
            type: 'Point',
            coordinates: validCoordinates
          }
        }
      }
    );
    console.log(`✅ Updated ${hggResult.modifiedCount} HolidayGoGo packages`);
    
    // Update PulauMalaysia packages
    console.log('\n🔄 Updating PulauMalaysia packages...');
    const pmResult = await PulauMalaysiaPackage.updateMany(
      { resort: { $regex: 'tunamaya', $options: 'i' } },
      { 
        $set: { 
          location: {
            type: 'Point',
            coordinates: validCoordinates
          }
        }
      }
    );
    console.log(`✅ Updated ${pmResult.modifiedCount} PulauMalaysia packages`);
    
    // Verify the updates
    console.log('\n🔍 Verifying updates...');
    const updatedAmi = await AmiTravel.findOne({ resort: { $regex: 'tunamaya', $options: 'i' } });
    if (updatedAmi) {
      console.log(`✅ AmiTravel verification: [${updatedAmi.location.coordinates[0]}, ${updatedAmi.location.coordinates[1]}]`);
    }
    
    const updatedHgg = await HolidayGoGoPackage.findOne({ resort: { $regex: 'tunamaya', $options: 'i' } });
    if (updatedHgg) {
      console.log(`✅ HolidayGoGo verification: [${updatedHgg.location.coordinates[0]}, ${updatedHgg.location.coordinates[1]}]`);
    }
    
    console.log('\n🎉 All Tunamaya packages updated with valid coordinates!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

updatePackageCoordinates();
