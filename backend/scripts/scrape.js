const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const scrapeAmitravelByPage = require('../utils/puppeteerAmitravel');
const scrapeHolidaygogoByPage = require('../utils/puppeteerHolidaygogo');
const AmiTravel = require('../models/amiTravelSchema');
const { HolidayGoGoPackage } = require('../models/holidayGoGoGoSchema');
const ProviderContact = require('../models/providerContactModel');

const islandPages = {
  amitravel: {
    Redang: 'https://www.amitravel.my/search/?_destination_home=pulau-redang-terengganu&_travel_type=island-hopping-tour',
    Perhentian: 'https://www.amitravel.my/search/?_destination_home=pulau-perhentian-terengganu&_travel_type=island-hopping-tour',
    Tioman: 'https://www.amitravel.my/search/?_destination_home=pulau-tioman&_travel_type=island-hopping-tour'
  },
  holidaygogo: {
    Redang: 'https://www.holidaygogogo.com/redang-package/',
    Perhentian: 'https://www.holidaygogogo.com/perhentian-package/',
    Tioman: 'https://www.holidaygogogo.com/tioman-package/'
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

// Get or create provider contact
async function getProviderContact(providerName) {
  try {
    // Try to find existing provider
    let provider = await ProviderContact.findOne({ providerName });
    
    if (!provider) {
      // Create new provider if not exists
      provider = await ProviderContact.create({
        providerName,
        contactInfo: {
          whatsappNumber: '+60123456789', // Default placeholder
          businessName: providerName,
          email: `contact@${providerName.toLowerCase()}.com`
        }
      });
      console.log(`✅ Created new provider contact for ${providerName}`);
    }
    
    return provider._id;
  } catch (error) {
    console.error(`❌ Error getting provider contact for ${providerName}:`, error);
    throw error;
  }
}

async function scrapeIsland(platform, island, url) {
  console.log(`🌴 Scraping ${platform} - ${island} from ${url}`);
  try {
    let data = [];

    if (platform === 'amitravel') {
      data = await scrapeAmitravelByPage(url, island);
      // Get AmiTravel provider ID
      const providerId = await getProviderContact('AmiTravel');
      
      // Delete existing packages for this destination
      await AmiTravel.deleteMany({ destination: island });
      
      if (data.length > 0) {
        // Add provider reference to each package
        const packagesWithProvider = data.map(pkg => ({
          ...pkg,
          provider: providerId
        }));
        
        await AmiTravel.insertMany(packagesWithProvider);
        console.log(`✅ Inserted ${data.length} packages into AmiTravel`);
      } else {
        console.log('⚠️ No packages found for AmiTravel');
      }
    } else if (platform === 'holidaygogo') {
      data = await scrapeHolidaygogoByPage(url, island);
      // Get HolidayGoGo provider ID
      const providerId = await getProviderContact('HolidayGoGo');
      
      if (data.length > 0) {
        // Add provider reference to each package
        const packagesWithProvider = data.map(pkg => ({
          ...pkg,
          provider: providerId
        }));
        
        // Use bulkWrite to upsert packages based on link
        const bulkOps = packagesWithProvider.map(pkg => ({
          updateOne: {
            filter: { link: pkg.link },
            update: { $set: { ...pkg, lastScraped: new Date() } },
            upsert: true
          }
        }));
        
        const result = await HolidayGoGoPackage.bulkWrite(bulkOps);
        console.log(`✅ Processed ${data.length} HolidayGoGo packages (${result.upsertedCount} inserted, ${result.modifiedCount} updated)`);
      } else {
        console.log('⚠️ No packages found for HolidayGoGo');
      }
    } else {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    return { success: true, count: data.length };
  } catch (error) {
    console.error(`❌ Error scraping ${platform} - ${island}:`, error);
    return { success: false, error };
  }
}

async function main() {
  try {
    await connectDB();
    const arg = process.argv[2];

    if (!arg) {
      console.log('Usage: node scripts/scrape.js [island|all]');
      console.log('Available islands:', Object.keys(islandPages.amitravel).join(', '));
      process.exit(1);
    }

    if (arg === 'all') {
      console.log('🔁 Scraping all platforms and islands...');
      const results = [];

      for (const [platform, islands] of Object.entries(islandPages)) {
        for (const [island, url] of Object.entries(islands)) {
          const { count } = await scrapeIsland(platform, island, url);
          results.push({ platform, island, count });
        }
      }

      console.log('\n📊 Scraping Summary:');
      results.forEach(({ platform, island, count }) => {
        console.log(`- ${platform} - ${island}: ${count} packages`);
      });

    } else {
      const island = arg;
      for (const [platform, islands] of Object.entries(islandPages)) {
        const url = islands[island];
        if (url) {
          await scrapeIsland(platform, island, url);
        } else {
          console.warn(`⚠️ Island "${island}" not found in ${platform}`);
        }
      }
    }

  } catch (err) {
    console.error('Script error:', err);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

main().catch(console.error);
