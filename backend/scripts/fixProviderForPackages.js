// fixProviderForPackages.js
require('dotenv').config();
const mongoose = require('mongoose');
const ProviderContact = require('../models/providerContactModel');

async function fixProviders() {
  await mongoose.connect(process.env.DATABASE_CLOUD, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });
  console.log('Connected to MongoDB');

  const providers = [
    { name: 'AmiTravel', match: /amitravel/i },
    { name: 'HolidayGoGo', match: /holidaygogo/i }
  ];

  // Find all packages where provider is a string
  const allStringProviderPackages = await Package.find({ provider: { $type: 'string' } });
  console.log('Found', allStringProviderPackages.length, 'packages with string provider');

  for (const provider of providers) {
    const providerContact = await ProviderContact.findOne({ providerName: provider.name });
    if (!providerContact) {
      console.log(`ProviderContact not found for ${provider.name}`);
      continue;
    }
    let updatedCount = 0;
    for (const pkg of allStringProviderPackages) {
      if (provider.match.test(pkg.provider)) {
        pkg.provider = providerContact._id;
        await pkg.save();
        updatedCount++;
      }
    }
    console.log(`Updated ${updatedCount} packages for ${provider.name}`);
  }

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

fixProviders(); 