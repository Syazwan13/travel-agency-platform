const PackageDataEnhancer = require('./enhancePackageData');

/**
 * Main execution script for enhancing package data
 * Run with: node backend/scripts/runPackageEnhancement.js [options]
 * 
 * Options:
 * --test: Run in test mode (limit 5 packages per collection)
 * --source=<source>: Only process specific source (amitravel, holidaygogo, pulaumalaysia)
 * --limit=<number>: Limit number of packages to process per collection
 */

async function main() {
  const args = process.argv.slice(2);
  const isTestMode = args.includes('--test');
  const sourceArg = args.find(arg => arg.startsWith('--source='));
  const limitArg = args.find(arg => arg.startsWith('--limit='));
  
  const targetSource = sourceArg ? sourceArg.split('=')[1].toLowerCase() : null;
  const limit = limitArg ? parseInt(limitArg.split('=')[1]) : (isTestMode ? 5 : null);

  console.log('🚀 Starting Package Data Enhancement');
  console.log('=====================================');
  
  if (isTestMode) {
    console.log('🧪 Running in TEST MODE (limited packages)');
  }
  
  if (targetSource) {
    console.log(`🎯 Target source: ${targetSource}`);
  }
  
  if (limit) {
    console.log(`📊 Limit per collection: ${limit} packages`);
  }

  const enhancer = new PackageDataEnhancer();
  const startTime = new Date();

  try {
    await enhancer.connectDB();

    // Process based on target source or all sources
    if (!targetSource || targetSource === 'amitravel') {
      console.log('\n🔄 Processing AmiTravel packages...');
      await enhancer.updateAmiTravelPackages(limit);
    }

    if (!targetSource || targetSource === 'holidaygogo') {
      console.log('\n🔄 Processing HolidayGoGo packages...');
      await enhancer.updateHolidayGoGoPackages(limit);
    }

    if (!targetSource || targetSource === 'pulaumalaysia') {
      console.log('\n🔄 Processing PulauMalaysia packages...');
      await enhancer.updatePulauMalaysiaPackages(limit);
    }

    const endTime = new Date();
    const duration = Math.round((endTime - startTime) / 1000);

    console.log('\n🎉 Package Enhancement Complete!');
    console.log('=====================================');
    console.log(`⏱️  Total time: ${duration} seconds`);
    enhancer.printStats();

    // Summary of changes
    console.log('\n📋 Summary of Changes:');
    console.log('   ✅ Added missing duration data');
    console.log('   ✅ Added missing inclusions data');
    console.log('   ✅ Added missing exclusions data');
    console.log('   ✅ Removed unnecessary description fields');
    console.log('   ✅ Removed unnecessary features fields');

  } catch (error) {
    console.error('❌ Enhancement failed:', error);
    process.exit(1);
  } finally {
    await enhancer.cleanup();
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⚠️  Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n⚠️  Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Run the main function
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = main;
