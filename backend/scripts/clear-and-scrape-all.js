const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const scrapeAmitravelByPage = require('../utils/puppeteerAmitravel');
const scrapeHolidaygogoByPage = require('../utils/puppeteerHolidaygogo');
const AmiTravel = require('../models/amiTravelSchema');
const { HolidayGoGoPackage, HolidayGoGoAccommodation, HolidayGoGoActivity } = require('../models/holidayGoGoGoSchema');
const { PulauMalaysiaPackage, PulauMalaysiaAccommodation, PulauMalaysiaActivity } = require('../models/pulauMalaysiaSchema');
const { getCoordinatesFromAddress } = require('../utils/geocoding');
const GeocodeCache = require('../models/geocodeCache');

// Island pages to scrape
const islandPages = {
  amitravel: {
    Redang: 'https://www.amitravel.my/search/?_destination_home=pulau-redang-terengganu&_travel_type=island-hopping-tour',
    Perhentian: 'https://www.amitravel.my/search/?_destination_home=pulau-perhentian-terengganu&_travel_type=island-hopping-tour',
    Tioman: 'https://www.amitravel.my/search/?_destination_home=pulau-tioman&_travel_type=island-hopping-tour',
    Langkawi: 'https://www.amitravel.my/search/?_destination_home=langkawi&_travel_type=island-hopping-tour'
  },
  holidaygogo: {
    Redang: 'https://www.holidaygogogo.com/redang-package/',
    Perhentian: 'https://www.holidaygogogo.com/perhentian-package/',
    Tioman: 'https://www.holidaygogogo.com/tioman-package/',
    Langkawi: 'https://www.holidaygogogo.com/langkawi-package/'
  }
};

async function connectDB() {
  try {
    await mongoose.connect(process.env.DATABASE_CLOUD);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function clearDatabase() {
  try {
    console.log('🧹 Clearing database collections...');
    
    // Clear all collections
    const [amiResult, holidayGoGoPackageResult, 
           pulauPackageResult] = await Promise.all([
      AmiTravel.deleteMany({}),
      HolidayGoGoPackage.deleteMany({}),
      PulauMalaysiaPackage.deleteMany({})
    ]);
    
    console.log(`✅ Deleted:
      - ${amiResult.deletedCount} AmiTravel packages
      - ${holidayGoGoPackageResult.deletedCount} HolidayGoGo packages
      - ${pulauPackageResult.deletedCount} PulauMalaysia packages
    `);
    
    return true;
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    return false;
  }
}

async function scrapeIsland(platform, island, url) {
  console.log(`🌴 Scraping ${platform} - ${island} from ${url}`);
  try {
    let data = [];

    if (platform === 'amitravel') {
      data = await scrapeAmitravelByPage(url, island);
      
      if (data.length > 0) {
        await AmiTravel.insertMany(data);
        console.log(`✅ Inserted ${data.length} packages into AmiTravel`);
      } else {
        console.log('⚠️ No packages found for AmiTravel');
      }
    } else if (platform === 'holidaygogo') {
      data = await scrapeHolidaygogoByPage(url, island);
      
      if (data.length > 0) {
        await HolidayGoGoPackage.insertMany(data);
        console.log(`✅ Inserted ${data.length} packages into HolidayGoGo`);
      } else {
        console.log('⚠️ No packages found for HolidayGoGo');
      }
    } else {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    return data.length;
  } catch (error) {
    console.error(`❌ Error scraping ${platform} - ${island}:`, error);
    return 0;
  }
}

async function updateCoordinates() {
  console.log('🌍 Updating coordinates for all packages...');
  
  try {
    // Get all packages from each source
    const [holidayGoGoPackages, pulauMalaysiaPackages, amiTravelPackages] = await Promise.all([
      HolidayGoGoPackage.find(),
      PulauMalaysiaPackage.find(),
      AmiTravel.find()
    ]);

    console.log(`Found packages:
      HolidayGoGo: ${holidayGoGoPackages.length}
      PulauMalaysia: ${pulauMalaysiaPackages.length}
      AmiTravel: ${amiTravelPackages.length}
    `);

    // Process packages from each source
    const updatePackages = async (packages, source) => {
      let updatedCount = 0;
      for (const pkg of packages) {
        try {
          // Extract resort name and island from package data
          let resortName, island;
          
          if (source === 'AmiTravel') {
            resortName = pkg.resort;
            island = pkg.destination;
          } else {
            // For HolidayGoGo and PulauMalaysia
            const titleParts = pkg.title.split(',');
            resortName = titleParts[0].trim();
            island = pkg.destination;
          }

          if (!resortName || !island) {
            console.log(`❌ Missing resort name or island for package: ${pkg._id}`);
            continue;
          }

          // Get coordinates
          const coordinates = await getCoordinatesFromAddress(resortName, island);
          if (!coordinates) {
            console.log(`❌ Could not get coordinates for: ${resortName}, ${island}`);
            continue;
          }

          // Update package
          pkg.location = coordinates.location;
          pkg.address = coordinates.formattedAddress;
          await pkg.save();
          updatedCount++;

          // Add a delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
          console.error(`Error processing package ${pkg._id}:`, error);
        }
      }
      return updatedCount;
    };

    // Update all packages
    const [
      holidayGoGoUpdated,
      pulauMalaysiaUpdated,
      amiTravelUpdated
    ] = await Promise.all([
      updatePackages(holidayGoGoPackages, 'HolidayGoGo'),
      updatePackages(pulauMalaysiaPackages, 'PulauMalaysia'),
      updatePackages(amiTravelPackages, 'AmiTravel')
    ]);

    console.log(`
Updated packages:
  HolidayGoGo: ${holidayGoGoUpdated}
  PulauMalaysia: ${pulauMalaysiaUpdated}
  AmiTravel: ${amiTravelUpdated}
Total: ${holidayGoGoUpdated + pulauMalaysiaUpdated + amiTravelUpdated}
    `);
    
    return true;
  } catch (error) {
    console.error('❌ Error updating coordinates:', error);
    return false;
  }
}

async function main() {
  try {
    // Connect to database
    await connectDB();
    
    // Clear database
    const cleared = await clearDatabase();
    if (!cleared) {
      console.error('Failed to clear database. Aborting.');
      return;
    }
    
    // Scrape all islands from all platforms
    console.log('🔁 Scraping all platforms and islands...');
    const results = [];

    for (const [platform, islands] of Object.entries(islandPages)) {
      for (const [island, url] of Object.entries(islands)) {
        const count = await scrapeIsland(platform, island, url);
        results.push({ platform, island, count });
      }
    }

    console.log('\n📊 Scraping Summary:');
    results.forEach(({ platform, island, count }) => {
      console.log(`- ${platform} - ${island}: ${count} packages`);
    });
    
    // Update coordinates
    await updateCoordinates();
    
    console.log('✅ Process completed successfully!');
    
  } catch (err) {
    console.error('❌ Script error:', err);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

main().catch(console.error); 