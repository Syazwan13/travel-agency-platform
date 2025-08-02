require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/userModel');

async function createTestUsers() {
  try {
    await mongoose.connect(process.env.DATABASE_CLOUD || 'mongodb://127.0.0.1:27017/travel');
    console.log('Connected to MongoDB');
    
    // Create test users
    const testUsers = [
      {
        name: 'Admin User',
        email: 'admin@travel.com',
        password: 'admin123',
        role: 'admin',
        preferences: {
          preferredDestinations: ['Langkawi', 'Redang'],
          travelStyles: ['Beach', 'Adventure'],
          priceRange: { min: 200, max: 1000 }
        }
      },
      {
        name: 'Travel Agent',
        email: 'agent@travel.com',
        password: 'agent123',
        role: 'user',
        preferences: {
          preferredDestinations: ['Perhentian', 'Tioman'],
          travelStyles: ['Diving', 'Relaxation'],
          priceRange: { min: 300, max: 800 }
        }
      },
      {
        name: 'John Customer',
        email: 'customer@travel.com',
        password: 'customer123',
        role: 'user',
        preferences: {
          preferredDestinations: ['Langkawi'],
          travelStyles: ['Family', 'Beach'],
          priceRange: { min: 150, max: 600 }
        }
      }
    ];
    
    console.log('🔄 Creating test users...');
    
    for (const userData of testUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      
      if (existingUser) {
        console.log(`⚠️  User ${userData.email} already exists, skipping...`);
      } else {
        await User.create(userData);
        console.log(`✅ Created user: ${userData.name} (${userData.email}) - Role: ${userData.role}`);
      }
    }
    
    console.log('\n🎯 Test Login Credentials:');
    console.log('\n👑 ADMIN USER (Access to all dashboards):');
    console.log('   Email: admin@travel.com');
    console.log('   Password: admin123');
    console.log('   Dashboards: Admin + Agency + User');
    
    console.log('\n🏢 TRAVEL AGENT (Agency + User dashboards):');
    console.log('   Email: agent@travel.com');
    console.log('   Password: agent123');
    console.log('   Dashboards: Agency + User');
    
    console.log('\n👤 CUSTOMER (User dashboard only):');
    console.log('   Email: customer@travel.com');
    console.log('   Password: customer123');
    console.log('   Dashboards: User');
    
    console.log('\n🌐 Dashboard URLs:');
    console.log('   Login: http://localhost:5173/login');
    console.log('   Admin Dashboard: http://localhost:5173/dashboard/admin');
    console.log('   Agency Dashboard: http://localhost:5173/dashboard/agency');
    console.log('   User Dashboard: http://localhost:5173/dashboard/user');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createTestUsers();
