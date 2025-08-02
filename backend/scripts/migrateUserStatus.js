require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/userModel');

async function migrateUserStatus() {
  try {
    await mongoose.connect(process.env.DATABASE_CLOUD || 'mongodb://127.0.0.1:27017/travel');
    console.log('Connected to MongoDB');
    
    // Update all existing travel agency users to have pending status
    const result = await User.updateMany(
      { 
        role: 'travel_agency',
        status: { $exists: false } // Only update users without status field
      },
      { 
        $set: { status: 'pending' }
      }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} travel agency users to pending status`);
    
    // Update all other users to active status
    const userResult = await User.updateMany(
      { 
        role: { $in: ['user', 'admin'] },
        status: { $exists: false }
      },
      { 
        $set: { status: 'active' }
      }
    );
    
    console.log(`✅ Updated ${userResult.modifiedCount} user/admin accounts to active status`);
    
    // Show summary
    const statusSummary = await User.aggregate([
      {
        $group: {
          _id: { role: '$role', status: '$status' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.role': 1, '_id.status': 1 }
      }
    ]);
    
    console.log('\n📊 User Status Summary:');
    statusSummary.forEach(item => {
      console.log(`   ${item._id.role} (${item._id.status}): ${item.count} users`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrateUserStatus();
