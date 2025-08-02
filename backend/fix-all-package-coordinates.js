require('dotenv').config();
const mongoose = require('mongoose');
const GeocodeCache = require('./models/geocodeCache');

async function fixAllPackageCoordinates() {
  try {
    await mongoose.connect(process.env.DATABASE_CLOUD || process.env.DATABASE_URL);
    console.log('Connected to MongoDB');
    
    // Import package models
    const AmiTravel = require('./models/amiTravelSchema');
    const { HolidayGoGoPackage } = require('./models/holidayGoGoGoSchema');
    const { PulauMalaysiaPackage } = require('./models/pulauMalaysiaSchema');
    
    // Get all geocode cache entries
    const allCoords = await GeocodeCache.find({}).sort({ qualityScore: -1 });
    console.log(`📍 Found ${allCoords.length} coordinate entries in cache`);
    
    let amiUpdated = 0, hggUpdated = 0, pmUpdated = 0;
    
    // Function to normalize resort name for matching
    const normalizeResortName = (name) => {
      return name?.toLowerCase()
        .replace(/&/g, 'and')
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    };
    
    // Function to find best coordinates for a resort
    const findCoordinatesForResort = (resortName) => {
      if (!resortName) return null;
      
      const normalized = normalizeResortName(resortName);
      
      // Try exact match first
      let match = allCoords.find(coord => 
        normalizeResortName(coord.resortName) === normalized
      );
      
      // Try partial match
      if (!match) {
        match = allCoords.find(coord => 
          normalized.includes(normalizeResortName(coord.resortName)) ||
          normalizeResortName(coord.resortName).includes(normalized)
        );
      }
      
      // Try keyword matching
      if (!match && normalized.length > 5) {
        const keywords = normalized.split(' ').filter(word => word.length > 3);
        match = allCoords.find(coord => {
          const coordNormalized = normalizeResortName(coord.resortName);
          return keywords.some(keyword => coordNormalized.includes(keyword));
        });
      }
      
      return match ? match.coordinates : null;
    };
    
    // Fix AmiTravel packages
    console.log('\n🔄 Fixing AmiTravel packages with [0,0] coordinates...');
    const amiPackages = await AmiTravel.find({
      'location.coordinates': [0, 0]
    });
    
    for (const pkg of amiPackages) {
      const coords = findCoordinatesForResort(pkg.resort);
      if (coords) {
        await AmiTravel.updateOne(
          { _id: pkg._id },
          { 
            $set: { 
              location: {
                type: 'Point',
                coordinates: coords
              }
            }
          }
        );
        amiUpdated++;
        console.log(`✅ Updated ${pkg.resort}: [${coords[0]}, ${coords[1]}]`);
      } else {
        console.log(`❌ No coordinates found for: ${pkg.resort}`);
      }
    }
    
    // Fix HolidayGoGo packages
    console.log('\n🔄 Fixing HolidayGoGo packages with [0,0] coordinates...');
    const hggPackages = await HolidayGoGoPackage.find({
      'location.coordinates': [0, 0]
    });
    
    for (const pkg of hggPackages) {
      const coords = findCoordinatesForResort(pkg.resort);
      if (coords) {
        await HolidayGoGoPackage.updateOne(
          { _id: pkg._id },
          { 
            $set: { 
              location: {
                type: 'Point',
                coordinates: coords
              }
            }
          }
        );
        hggUpdated++;
        console.log(`✅ Updated ${pkg.resort}: [${coords[0]}, ${coords[1]}]`);
      } else {
        console.log(`❌ No coordinates found for: ${pkg.resort}`);
      }
    }
    
    // Fix PulauMalaysia packages
    console.log('\n🔄 Fixing PulauMalaysia packages with [0,0] coordinates...');
    const pmPackages = await PulauMalaysiaPackage.find({
      'location.coordinates': [0, 0]
    });
    
    for (const pkg of pmPackages) {
      const coords = findCoordinatesForResort(pkg.resort);
      if (coords) {
        await PulauMalaysiaPackage.updateOne(
          { _id: pkg._id },
          { 
            $set: { 
              location: {
                type: 'Point',
                coordinates: coords
              }
            }
          }
        );
        pmUpdated++;
        console.log(`✅ Updated ${pkg.resort}: [${coords[0]}, ${coords[1]}]`);
      } else {
        console.log(`❌ No coordinates found for: ${pkg.resort}`);
      }
    }
    
    console.log('\n📊 Summary:');
    console.log(`🎯 AmiTravel packages updated: ${amiUpdated}/${amiPackages.length}`);
    console.log(`🎯 HolidayGoGo packages updated: ${hggUpdated}/${hggPackages.length}`);
    console.log(`🎯 PulauMalaysia packages updated: ${pmUpdated}/${pmPackages.length}`);
    console.log(`🎉 Total packages fixed: ${amiUpdated + hggUpdated + pmUpdated}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixAllPackageCoordinates();
