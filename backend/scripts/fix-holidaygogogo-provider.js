// Usage: node backend/scripts/fix-holidaygogogo-provider.js
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const { HolidayGoGoPackage } = require('../models/holidayGoGoGoSchema');

const PROVIDER_ID = '686d6b29cb190fd60762f71c';

async function main() {
  await mongoose.connect(process.env.DATABASE_CLOUD, { useNewUrlParser: true, useUnifiedTopology: true });
  const result = await HolidayGoGoPackage.updateMany({}, { provider: PROVIDER_ID });
  console.log('Updated packages:', result.modifiedCount);
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); }); 