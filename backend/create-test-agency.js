const mongoose = require('mongoose');
require('dotenv').config();

async function createTestTravelAgency() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const User = require('./models/userModel');
    
    // Create test travel agency
    const testAgency = await User.create({
      name: "Test Travel Agency",
      email: "testagency@test.com", 
      password: "test123",
      role: "travel_agency",
      companyName: "Test Travel Agency Sdn Bhd",
      businessRegistrationNumber: "TEST123456",
      phoneNumber: "+60123456789",
      address: {
        street: "123 Test Street",
        city: "Kuala Lumpur", 
        state: "Kuala Lumpur",
        country: "Malaysia",
        postalCode: "50100"
      },
      website: "https://www.testtravelagency.com",
      description: "A test travel agency for functionality testing",
      specializations: ["Domestic Tours", "Budget Travel"],
      contactPerson: "Test Person",
      whatsappNumber: "+60123456789",
      providerContactId: "686d6b29cb190fd60762f71c"
    });
    
    console.log('✅ Test travel agency created!');
    console.log('Email:', testAgency.email);
    console.log('Password: test123');
    console.log('Status:', testAgency.status);
    console.log('Role:', testAgency.role);
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

createTestTravelAgency();
