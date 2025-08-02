// seedProviderContacts.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/userModel');
const ProviderContact = require('../models/providerContactModel');

async function seedProviderUsers() {
  await mongoose.connect(process.env.DATABASE_CLOUD, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });
  console.log('Connected to MongoDB');

  const providers = [
    {
      providerName: 'AmiTravel',
      email: 'info@amitravel.com',
      password: 'amitravel123', // Change after first login
      companyName: 'AmiTravel',
      contactPerson: 'AmiTravel Admin',
    },
    {
      providerName: 'HolidayGoGo',
      email: 'info@holidaygogogo.com',
      password: 'holidaygogo123', // Change after first login
      companyName: 'HolidayGoGoGo',
      contactPerson: 'HolidayGoGoGo Admin',
    }
  ];

  for (const provider of providers) {
    const providerContact = await ProviderContact.findOne({ providerName: provider.providerName });
    if (!providerContact) {
      console.log(`ProviderContact not found for ${provider.providerName}`);
      continue;
    }
    let user = await User.findOne({ email: provider.email });
    if (!user) {
      user = new User({
        name: provider.companyName,
        email: provider.email,
        password: provider.password,
        role: 'travel_agency',
        companyName: provider.companyName,
        contactPerson: provider.contactPerson,
        providerContactId: providerContact._id
      });
      await user.save();
      console.log(`Created travel agency user for ${provider.providerName}`);
    } else {
      console.log(`User already exists for ${provider.providerName}`);
    }
  }

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

seedProviderUsers();