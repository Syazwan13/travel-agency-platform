require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/userModel');

async function getTravelAgencyCredentials() {
  try {
    await mongoose.connect(process.env.DATABASE_CLOUD || 'mongodb://127.0.0.1:27017/travel');
    console.log('🔗 Connected to MongoDB');
    
    // Get all users with their roles
    const allUsers = await User.find({}).select('name email role companyName status createdAt');
    
    console.log('\n📊 === TRAVEL AGENCY CREDENTIALS REPORT ===\n');
    
    if (allUsers.length === 0) {
      console.log('❌ No users found in database');
      return;
    }
    
    // Filter travel agency users
    const travelAgencies = allUsers.filter(user => user.role === 'travel_agency');
    const adminUsers = allUsers.filter(user => user.role === 'admin');
    const regularUsers = allUsers.filter(user => user.role === 'user');
    
    console.log(`📈 Database Summary:`);
    console.log(`   Total Users: ${allUsers.length}`);
    console.log(`   Travel Agencies: ${travelAgencies.length}`);
    console.log(`   Admin Users: ${adminUsers.length}`);
    console.log(`   Regular Users: ${regularUsers.length}`);
    
    if (travelAgencies.length > 0) {
      console.log('\n🏢 === TRAVEL AGENCY ACCOUNTS ===');
      travelAgencies.forEach((agency, index) => {
        console.log(`\n${index + 1}. ${agency.companyName || agency.name}`);
        console.log(`   📧 Email: ${agency.email}`);
        console.log(`   👤 Name: ${agency.name}`);
        console.log(`   🏷️  Role: ${agency.role}`);
        console.log(`   📊 Status: ${agency.status}`);
        console.log(`   📅 Created: ${agency.createdAt ? agency.createdAt.toLocaleDateString() : 'N/A'}`);
        console.log(`   🔑 Password: [Encrypted - Use forgot password to reset]`);
      });
    } else {
      console.log('\n⚠️  No travel agency accounts found!');
    }
    
    if (adminUsers.length > 0) {
      console.log('\n👑 === ADMIN ACCOUNTS ===');
      adminUsers.forEach((admin, index) => {
        console.log(`\n${index + 1}. ${admin.name}`);
        console.log(`   📧 Email: ${admin.email}`);
        console.log(`   🏷️  Role: ${admin.role}`);
        console.log(`   📊 Status: ${admin.status}`);
        console.log(`   📅 Created: ${admin.createdAt ? admin.createdAt.toLocaleDateString() : 'N/A'}`);
        console.log(`   🔑 Password: [Encrypted - Use forgot password to reset]`);
      });
    }
    
    console.log('\n🎯 === TEST CREDENTIALS (From createTestUsers.js) ===');
    console.log('\n👑 ADMIN USER:');
    console.log('   📧 Email: admin@travel.com');
    console.log('   🔑 Password: admin123');
    console.log('   🏷️  Role: admin');
    console.log('   🎯 Access: All dashboards');
    
    console.log('\n🏢 TRAVEL AGENT:');
    console.log('   📧 Email: agent@travel.com');
    console.log('   🔑 Password: agent123');
    console.log('   🏷️  Role: user (but acts as travel agent)');
    console.log('   🎯 Access: Agency + User dashboards');
    
    console.log('\n👤 CUSTOMER:');
    console.log('   📧 Email: customer@travel.com');
    console.log('   🔑 Password: customer123');
    console.log('   🏷️  Role: user');
    console.log('   🎯 Access: User dashboard only');
    
    console.log('\n🏢 === SEEDED TRAVEL AGENCIES (From seedProviderContacts.js) ===');
    console.log('\n1. AmiTravel:');
    console.log('   📧 Email: info@amitravel.com');
    console.log('   🔑 Password: amitravel123');
    console.log('   🏷️  Role: travel_agency');
    console.log('   🏢 Company: AmiTravel');
    
    console.log('\n2. HolidayGoGo:');
    console.log('   📧 Email: info@holidaygogogo.com');
    console.log('   🔑 Password: holidaygogo123');
    console.log('   🏷️  Role: travel_agency');
    console.log('   🏢 Company: HolidayGoGoGo');
    
    console.log('\n🌐 === LOGIN URLS ===');
    console.log('   🔗 Production Login: http://167.172.66.203:3000/login');
    console.log('   🔗 Local Login: http://localhost:5173/login');
    
    console.log('\n📋 === DASHBOARD URLS ===');
    console.log('   👑 Admin Dashboard: /dashboard/admin');
    console.log('   🏢 Agency Dashboard: /dashboard/agency');
    console.log('   👤 User Dashboard: /dashboard/user');
    
    console.log('\n⚠️  === IMPORTANT NOTES ===');
    console.log('   • All passwords shown are default passwords');
    console.log('   • Users should change passwords after first login');
    console.log('   • Travel agency accounts may need admin approval');
    console.log('   • Use forgot password feature to reset if needed');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

getTravelAgencyCredentials();