// Print all unique resort names from AmiTravel and HolidayGoGoGoPackage collections
// Usage: node backend/scripts/listResortNames.js

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const AmiTravel = require('../models/amiTravelSchema');
const { HolidayGoGoPackage } = require('../models/holidayGoGoGoSchema');

const MONGODB_URI = process.env.DATABASE_CLOUD || process.env.MONGODB_URI;

async function main() {
  await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  const amiPackages = await AmiTravel.find({});
  const hggPackages = await HolidayGoGoPackage.find({});

  const amiResorts = new Set();
  const hggResorts = new Set();

  for (const pkg of amiPackages) {
    if (pkg.resort) amiResorts.add(pkg.resort.trim());
  }
  for (const pkg of hggPackages) {
    if (pkg.resort) hggResorts.add(pkg.resort.trim());
    else if (pkg.title) hggResorts.add(pkg.title.split(',')[0].trim());
  }

  console.log('\nAmiTravel unique resort names:');
  Array.from(amiResorts).sort().forEach(name => console.log('  ' + name));

  console.log('\nHolidayGoGoGo unique resort names:');
  Array.from(hggResorts).sort().forEach(name => console.log('  ' + name));

  await mongoose.disconnect();
  console.log('Done.');
}

main().catch(err => { console.error(err); process.exit(1); });
