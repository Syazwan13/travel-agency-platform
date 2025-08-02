const PackageDataEnhancer = require('./enhancePackageData');

/**
 * Test script for package enhancement
 * Tests the enhancement process with a small sample
 */

async function testEnhancement() {
  console.log('🧪 Testing Package Enhancement System');
  console.log('====================================');

  const enhancer = new PackageDataEnhancer();

  try {
    await enhancer.connectDB();

    console.log('\n🔍 Testing with 2 packages from each collection...');
    
    // Test with limited packages
    await enhancer.updateAmiTravelPackages(2);
    await enhancer.updateHolidayGoGoPackages(2);
    await enhancer.updatePulauMalaysiaPackages(2);

    console.log('\n✅ Test completed successfully!');
    enhancer.printStats();

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await enhancer.cleanup();
  }
}

if (require.main === module) {
  testEnhancement();
}

module.exports = testEnhancement;
