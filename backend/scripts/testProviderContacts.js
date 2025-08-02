const mongoose = require('mongoose');
const ProviderContact = require('../models/providerContactModel');
require('dotenv').config({ path: './.env' });

const testProviderContacts = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.DATABASE_CLOUD);
    console.log('Connected to MongoDB');

    // Test provider lookup
    const testProviders = ['AmiTravel', 'HolidayGoGo', 'PulauMalaysia', 'Package'];
    
    console.log('\n🔍 Testing provider contact lookup:');
    for (const provider of testProviders) {
      console.log(`\nTesting provider: ${provider}`);
      const contact = await ProviderContact.getByProvider(provider);
      
      if (contact) {
        console.log(`✅ Found contact for ${provider}:`);
        console.log(`   WhatsApp: ${contact.contactInfo.whatsappNumber}`);
        console.log(`   Business: ${contact.contactInfo.businessName}`);
      } else {
        console.log(`❌ No contact found for ${provider}`);
      }
    }

    // List all available providers
    console.log('\n📋 All available providers in database:');
    const allProviders = await ProviderContact.find({});
    allProviders.forEach(provider => {
      console.log(`   - ${provider.providerName}: ${provider.contactInfo.whatsappNumber}`);
    });

  } catch (error) {
    console.error('❌ Error testing provider contacts:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
};

// Run the test
if (require.main === module) {
  testProviderContacts();
}

module.exports = { testProviderContacts };
