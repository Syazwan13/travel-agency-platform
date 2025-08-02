require('dotenv').config();
const mongoose = require('mongoose');
const AmiTravel = require('../models/amiTravelSchema');
const { HolidayGoGoPackage } = require('../models/holidayGoGoSchema');
const { PulauMalaysiaPackage } = require('../models/pulauMalaysiaSchema');

async function listResorts() {
  try {
    await mongoose.connect(process.env.DATABASE_CLOUD);
    console.log('Connected to MongoDB');
    
    const [amiPackages, holidayGoGoPackages, pulauPackages] = await Promise.all([
      AmiTravel.find({location: {$exists: true}}).select('resort destination location source'),
      HolidayGoGoPackage.find({location: {$exists: true}}).select('title destination location source'),
      PulauMalaysiaPackage.find({location: {$exists: true}}).select('title destination location source')
    ]);
    
    console.log('\nAmiTravel Resorts:');
    amiPackages.forEach(pkg => console.log(`- ${pkg.resort} (${pkg.destination})`));
    
    console.log('\nHolidayGoGo Resorts:');
    holidayGoGoPackages.forEach(pkg => console.log(`- ${pkg.title} (${pkg.destination})`));
    
    console.log('\nPulauMalaysia Resorts:');
    pulauPackages.forEach(pkg => console.log(`- ${pkg.title} (${pkg.destination})`));
    
    console.log(`\nTotal resorts with coordinates: ${amiPackages.length + holidayGoGoPackages.length + pulauPackages.length}`);
    
    // Group by island
    const byIsland = {};
    
    const addToIsland = (pkg, source, name) => {
      const island = pkg.destination;
      if (!byIsland[island]) byIsland[island] = [];
      byIsland[island].push({
        name: name,
        source: source,
        coordinates: pkg.location?.coordinates
      });
    };
    
    amiPackages.forEach(pkg => addToIsland(pkg, 'AmiTravel', pkg.resort));
    holidayGoGoPackages.forEach(pkg => addToIsland(pkg, 'HolidayGoGo', pkg.title));
    pulauPackages.forEach(pkg => addToIsland(pkg, 'PulauMalaysia', pkg.title));
    
    console.log('\nResorts by Island:');
    for (const [island, resorts] of Object.entries(byIsland)) {
      console.log(`\n${island} (${resorts.length} resorts):`);
      
      // Group by provider
      const byProvider = {};
      resorts.forEach(resort => {
        if (!byProvider[resort.source]) byProvider[resort.source] = [];
        byProvider[resort.source].push(resort.name);
      });
      
      for (const [provider, providerResorts] of Object.entries(byProvider)) {
        console.log(`  ${provider} (${providerResorts.length}):`);
        providerResorts.forEach(name => console.log(`    - ${name}`));
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

listResorts(); 