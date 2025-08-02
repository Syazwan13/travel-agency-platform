require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/userModel');

async function createAdmin() {
  try {
    await mongoose.connect(process.env.DATABASE_CLOUD || 'mongodb://127.0.0.1:27017/travel');
    console.log('Connected to MongoDB');
    
    // Get email from command line argument
    const email = process.argv[2];
    
    if (!email) {
      console.log('❌ Please provide an email address');
      console.log('Usage: node scripts/createAdmin.js <email>');
      console.log('Example: node scripts/createAdmin.js admin@example.com');
      process.exit(1);
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      // Update existing user to admin
      existingUser.role = 'admin';
      await existingUser.save();
      console.log(`✅ User ${email} has been made an admin!`);
    } else {
      // Create new admin user
      const adminUser = await User.create({
        name: 'Admin User',
        email: email,
        password: 'admin123', // Default password
        role: 'admin'
      });
      console.log(`✅ New admin user created!`);
      console.log(`   Email: ${email}`);
      console.log(`   Password: admin123`);
      console.log(`   ⚠️  Please change the password after first login!`);
    }
    
    console.log('\n🎯 Dashboard Access:');
    console.log('   Admin Dashboard: http://localhost:5173/dashboard/admin');
    console.log('   Agency Dashboard: http://localhost:5173/dashboard/agency');
    console.log('   User Dashboard: http://localhost:5173/dashboard/user');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdmin();
