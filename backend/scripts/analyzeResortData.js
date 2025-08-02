// Analyze resort data for likely geocoding problems
// Usage: node backend/scripts/analyzeResortData.js

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const AmiTravel = require('../models/amiTravelSchema');
const { HolidayGoGoPackage } = require('../models/holidayGoGoGoSchema');
const { cleanResortName, normalizeResortName } = require('../utils/geocoding');

const MONGODB_URI = process.env.DATABASE_CLOUD || process.env.MONGODB_URI;

function isLikelyProblematic(name) {
  if (!name) return true;
  // Too short, generic, or contains placeholder words
  const lower = name.toLowerCase();
  if (name.length < 5) return true;
  if (/resort|package|hotel|island|beach|trip|tour|holiday/.test(lower) && lower.split(' ').length <= 2) return true;
  if (/tba|n\/a|unknown|test|sample/.test(lower)) return true;
  return false;
}

async function main() {
  await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  const amiPackages = await AmiTravel.find({});
  const hggPackages = await HolidayGoGoPackage.find({});

  let problems = [];

  for (const pkg of amiPackages) {
    const raw = pkg.resort || '';
    const cleaned = cleanResortName(raw);
    const normalized = normalizeResortName(cleaned);
    if (isLikelyProblematic(cleaned) || isLikelyProblematic(normalized)) {
      problems.push({ source: 'AmiTravel', id: pkg._id, raw, cleaned, normalized });
    }
  }

  for (const pkg of hggPackages) {
    const raw = pkg.resort || (pkg.title ? pkg.title.split(',')[0].trim() : '');
    const cleaned = cleanResortName(raw);
    const normalized = normalizeResortName(cleaned);
    if (isLikelyProblematic(cleaned) || isLikelyProblematic(normalized)) {
      problems.push({ source: 'HolidayGoGoGo', id: pkg._id, raw, cleaned, normalized });
    }
  }

  if (problems.length === 0) {
    console.log('No likely problematic resort names found.');
  } else {
    console.log('Likely problematic resort names:');
    problems.forEach(p => {
      console.log(`[${p.source}] id=${p.id}\n  raw: ${p.raw}\n  cleaned: ${p.cleaned}\n  normalized: ${p.normalized}`);
    });
    console.log(`Total problematic: ${problems.length}`);
  }

  await mongoose.disconnect();
  console.log('Done.');
}

main().catch(err => { console.error(err); process.exit(1); });
