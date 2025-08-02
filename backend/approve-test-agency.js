const mongoose = require('mongoose');
require('dotenv').config();

async function approveTestAgency() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const User = require('./models/userModel');
    
    // Find and approve the test agency
    const agency = await User.findOne({ email: 'testagency@test.com' });
    if (agency) {
      console.log('Before approval:');
      console.log('Status:', agency.status);
      
      agency.status = 'active';
      await agency.save();
      
      console.log('\n✅ Test agency approved!');
      console.log('After approval:');
      console.log('Status:', agency.status);
      console.log('Role:', agency.role);
      console.log('Company:', agency.companyName);
    } else {
      console.log('Agency not found');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

approveTestAgency();
