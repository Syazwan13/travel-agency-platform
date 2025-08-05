require('dotenv').config();
const mongoose = require('mongoose');
const AmiTravel = require('../models/amiTravelSchema');
const { HolidayGoGoPackage } = require('../models/holidayGoGoGoSchema');

mongoose.connect(process.env.DATABASE_CLOUD).then(async () => {
  console.log('Sample prices from database:');
  
  const amiSamples = await AmiTravel.find({}).limit(3).select('title price');
  console.log('\nAmiTravel prices:');
  amiSamples.forEach(pkg => console.log(`- ${pkg.title}: '${pkg.price}'`));
  
  const holidaySamples = await HolidayGoGoPackage.find({}).limit(3).select('title price');
  console.log('\nHolidayGoGoGo prices:');
  holidaySamples.forEach(pkg => console.log(`- ${pkg.title}: '${pkg.price}'`));
  
  process.exit(0);
}).catch(console.error);