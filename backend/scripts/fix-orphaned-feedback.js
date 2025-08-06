require('dotenv').config();
const mongoose = require('mongoose');
const Feedback = require('../models/feedbackModel');
const Inquiry = require('../models/inquiryModel');
const AmiTravel = require('../models/amiTravelSchema');
const HolidayGoGo = require('../models/holidayGoGoGoSchema').HolidayGoGoPackage;
const PulauMalaysia = require('../models/pulauMalaysiaSchema').PulauMalaysiaPackage;

async function fixOrphanedFeedback() {
  console.log('🔧 Fixing orphaned feedback...');
  
  try {
    await mongoose.connect(process.env.DATABASE_CLOUD);
    console.log('✅ Connected to database');
    
    // Get all feedback entries
    const feedbacks = await Feedback.find();
    console.log(`📊 Found ${feedbacks.length} feedback entries`);
    
    let fixedCount = 0;
    let skippedCount = 0;
    
    for (const feedback of feedbacks) {
      console.log(`\n🔍 Checking feedback ${feedback._id} with packageId: ${feedback.packageId}`);
      
      // Check if package exists in any collection
      let packageExists = false;
      try {
        const exists = await AmiTravel.findById(feedback.packageId) ||
                      await HolidayGoGo.findById(feedback.packageId) ||
                      await PulauMalaysia.findById(feedback.packageId);
        packageExists = !!exists;
      } catch (e) {
        // Invalid ObjectId
        packageExists = false;
      }
      
      if (packageExists) {
        console.log('✅ Package exists, skipping...');
        skippedCount++;
        continue;
      }
      
      // Package doesn't exist, try to find the correct one
      console.log('❌ Package not found, searching for correct package...');
      
      // Get the inquiry for this feedback
      const inquiry = await Inquiry.findById(feedback.inquiryId);
      if (!inquiry) {
        console.log('⚠️ No inquiry found for this feedback');
        continue;
      }
      
      console.log(`📦 Looking for package with title: "${inquiry.packageInfo.packageTitle}"`);
      
      // Search for packages with matching title
      let foundPackage = null;
      
      try {
        foundPackage = await AmiTravel.findOne({ 
          title: { $regex: inquiry.packageInfo.packageTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' }
        });
      } catch (e) {}
      
      if (!foundPackage) {
        try {
          foundPackage = await HolidayGoGo.findOne({ 
            title: { $regex: inquiry.packageInfo.packageTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' }
          });
        } catch (e) {}
      }
      
      if (!foundPackage) {
        try {
          foundPackage = await PulauMalaysia.findOne({ 
            title: { $regex: inquiry.packageInfo.packageTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' }
          });
        } catch (e) {}
      }
      
      if (foundPackage) {
        console.log(`✅ Found matching package: ${foundPackage._id} - "${foundPackage.title}"`);
        
        // Update the feedback with the correct package ID
        await Feedback.updateOne(
          { _id: feedback._id },
          { packageId: foundPackage._id.toString() }
        );
        
        console.log('🔧 Updated feedback with correct package ID');
        fixedCount++;
      } else {
        console.log('❌ No matching package found');
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`✅ Fixed: ${fixedCount}`);
    console.log(`⏭️ Skipped (already correct): ${skippedCount}`);
    console.log(`❌ Could not fix: ${feedbacks.length - fixedCount - skippedCount}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

fixOrphanedFeedback();