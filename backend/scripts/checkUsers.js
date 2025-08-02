require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/userModel');

async function checkUsers() {
  try {
    await mongoose.connect(process.env.DATABASE_CLOUD || 'mongodb://127.0.0.1:27017/travel');
    console.log('Connected to MongoDB');
    
    const users = await User.find({}).select('name email role createdAt');
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
      console.log('\n📝 To create users:');
      console.log('1. Go to: http://localhost:5173/register');
      console.log('2. Create a regular user account');
      console.log('3. Run this script again to see the user');
      console.log('4. Use the createAdmin.js script to make a user admin');
    } else {
      console.log(`✅ Found ${users.length} user(s):`);
      console.log('\n📊 User List:');
      users.forEach((user, index) => {
        console.log(`${index + 1}. Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Created: ${user.createdAt.toLocaleDateString()}`);
        console.log('   ---');
      });
      
      const adminUsers = users.filter(u => u.role === 'admin');
      const regularUsers = users.filter(u => u.role === 'user');
      
      console.log(`\n📈 Summary:`);
      console.log(`   Admin users: ${adminUsers.length}`);
      console.log(`   Regular users: ${regularUsers.length}`);
      
      if (adminUsers.length === 0) {
        console.log('\n⚠️  No admin users found!');
        console.log('   Run: node scripts/createAdmin.js <email> to make a user admin');
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkUsers();
