require('dotenv').config();
const mongoose = require('mongoose');
const Package = require('../models/pulauMalaysiaSchema');
const ProviderContact = require('../models/providerContactModel');

async function checkPackageStatus() {
  try {
    await mongoose.connect(process.env.DATABASE_CLOUD);
    console.log('🔗 Connected to MongoDB');
    
    const packages = await Package.find({}).populate('provider').select('title provider isActive destination price lastScraped');
    
    console.log('\n📊 === PACKAGE STATUS REPORT ===');
    console.log('================================');
    
    const holidayGoGoPackages = packages.filter(p => p.provider?.providerName === 'HolidayGoGoGo');
    const amiTravelPackages = packages.filter(p => p.provider?.providerName === 'AmiTravel');
    
    console.log(`\n🏢 HolidayGoGoGo Packages (${holidayGoGoPackages.length} total):`);
    holidayGoGoPackages.forEach((pkg, i) => {
      console.log(`${i+1}. ${pkg.title}`);
      console.log(`   📊 Status: ${pkg.isActive ? '✅ Active' : '❌ Inactive'}`);
      console.log(`   📍 Destination: ${pkg.destination}`);
      console.log(`   💰 Price: ${pkg.price}`);
      console.log(`   📅 Last Scraped: ${pkg.lastScraped ? pkg.lastScraped.toLocaleDateString() : 'Never'}`);
      console.log('   ---');
    });
    
    console.log(`\n🏢 AmiTravel Packages (${amiTravelPackages.length} total):`);
    amiTravelPackages.forEach((pkg, i) => {
      console.log(`${i+1}. ${pkg.title}`);
      console.log(`   📊 Status: ${pkg.isActive ? '✅ Active' : '❌ Inactive'}`);
      console.log(`   📍 Destination: ${pkg.destination}`);
      console.log(`   💰 Price: ${pkg.price}`);
      console.log(`   📅 Last Scraped: ${pkg.lastScraped ? pkg.lastScraped.toLocaleDateString() : 'Never'}`);
      console.log('   ---');
    });
    
    console.log(`\n📈 === SUMMARY ===`);
    console.log(`HolidayGoGoGo:`);
    console.log(`   ✅ Active: ${holidayGoGoPackages.filter(p => p.isActive).length}`);
    console.log(`   ❌ Inactive: ${holidayGoGoPackages.filter(p => !p.isActive).length}`);
    
    console.log(`AmiTravel:`);
    console.log(`   ✅ Active: ${amiTravelPackages.filter(p => p.isActive).length}`);
    console.log(`   ❌ Inactive: ${amiTravelPackages.filter(p => !p.isActive).length}`);
    
    // Check when packages were last updated
    const recentHolidayGo = holidayGoGoPackages.filter(p => {
      const daysSinceUpdate = (Date.now() - new Date(p.lastScraped)) / (1000 * 60 * 60 * 24);
      return daysSinceUpdate < 7; // Less than 7 days
    });
    
    const recentAmiTravel = amiTravelPackages.filter(p => {
      const daysSinceUpdate = (Date.now() - new Date(p.lastScraped)) / (1000 * 60 * 60 * 24);
      return daysSinceUpdate < 7; // Less than 7 days
    });
    
    console.log(`\n🕒 === RECENT UPDATES (Last 7 days) ===`);
    console.log(`HolidayGoGoGo: ${recentHolidayGo.length}/${holidayGoGoPackages.length} packages updated recently`);
    console.log(`AmiTravel: ${recentAmiTravel.length}/${amiTravelPackages.length} packages updated recently`);
    
    // Check provider contact status
    const providers = await ProviderContact.find({});
    console.log(`\n🏢 === PROVIDER STATUS ===`);
    providers.forEach(provider => {
      console.log(`${provider.providerName}: ${provider.isActive ? '✅ Active' : '❌ Inactive'}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkPackageStatus();