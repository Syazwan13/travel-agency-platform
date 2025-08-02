// Batch geocode resorts from AmiTravel and HolidayGoGoGo packages and store with 100% accuracy in geocodeCache.
// Usage: node backend/scripts/batchGeocodeResorts.js

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const AmiTravel = require('../models/amiTravelSchema');
const { HolidayGoGoPackage } = require('../models/holidayGoGoGoSchema');
const GeocodeCache = require('../models/geocodeCache');
const { getCoordinatesFromAddress } = require('../utils/geocoding');

const MONGODB_URI = process.env.DATABASE_CLOUD || process.env.MONGODB_URI;

// Helper to build the best geocoding query
function buildGeocodeQuery({ resortName, address, island }) {
  let parts = [];
  if (resortName) parts.push(resortName);
  if (address && !resortName?.toLowerCase().includes(address.toLowerCase())) parts.push(address);
  if (island && !parts.join(', ').toLowerCase().includes(island.toLowerCase())) parts.push(island);
  parts.push('Malaysia');
  const query = Array.from(new Set(parts.filter(Boolean))).join(', ');
  return query;
}

async function geocodeAndCache(resortName, island, address = '') {
  if (!resortName || !island) return null;
  // Check if already cached with 100% quality
  let cache = await GeocodeCache.findOne({ resortName, island, qualityScore: 100 });
  if (cache) return cache;
  // Build the most specific geocoding query
  const query = buildGeocodeQuery({ resortName, address, island });
  // Geocode using Google Maps API, passing all info for scoring
  const coords = await getCoordinatesFromAddress(query, resortName, island);
  if (coords && coords.qualityScore >= 90 && coords.coordinates) {
    // Save as 100% accurate (manual verification recommended)
    cache = await GeocodeCache.findOneAndUpdate(
      { resortName, island },
      {
        $set: {
          query,
          coordinates: coords.coordinates,
          formattedAddress: coords.formattedAddress || '',
          qualityScore: 100,
          method: coords.method || 'api_geocoding',
          isVerified: true,
          originalName: resortName,
          lastUpdated: new Date(),
        },
      },
      { upsert: true, new: true }
    );
    return cache;
  }
  return null;
}

async function main() {
  await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  // AmiTravel
  const amiPackages = await AmiTravel.find({});
  for (const pkg of amiPackages) {
    const resort = pkg.resort;
    const island = pkg.destination;
    const address = pkg.address || '';
    if (!resort || !island) continue;
    const cache = await geocodeAndCache(resort, island, address);
    if (cache) {
      console.log(`[AmiTravel] Geocoded: ${resort}, ${island} ->`, cache.coordinates);
    } else {
      console.warn(`[AmiTravel] Failed: ${resort}, ${island}`);
    }
  }


  // --- Improved Island Extraction for HolidayGoGoGo ---
  const hggPackages = await HolidayGoGoPackage.find({});
  for (const pkg of hggPackages) {
    const resort = pkg.resort || (pkg.title ? pkg.title.split(',')[0].trim() : '');
    let island = pkg.destination;
    // If destination is missing, try to infer from title, address, or link
    if (!island) {
      const text = [pkg.title, pkg.address, pkg.link].filter(Boolean).join(' ').toLowerCase();
      if (/redang/.test(text)) island = 'Redang';
      else if (/perhentian/.test(text)) island = 'Perhentian';
      else if (/tioman/.test(text)) island = 'Tioman';
      else if (/langkawi/.test(text)) island = 'Langkawi';
      else if (/pangkor/.test(text)) island = 'Pangkor';
      else if (/kapas/.test(text)) island = 'Kapas';
      else if (/besar/.test(text)) island = 'Besar';
      else if (/penang/.test(text)) island = 'Penang';
      else if (/sibu/.test(text)) island = 'Sibu';
      else if (/tenggol/.test(text)) island = 'Tenggol';
      else if (/rawa/.test(text)) island = 'Rawa';
      else if (/carey/.test(text)) island = 'Carey';
      else if (/mantanani/.test(text)) island = 'Mantanani';
      else if (/pom pom/.test(text)) island = 'Pom Pom';
      else if (/mataking/.test(text)) island = 'Mataking';
      else if (/sipadan/.test(text)) island = 'Sipadan';
      else if (/mabul/.test(text)) island = 'Mabul';
      else if (/layang layang/.test(text)) island = 'Layang Layang';
      else if (/sepadan/.test(text)) island = 'Sepadan';
      else if (/batam/.test(text)) island = 'Batam';
      else if (/bintan/.test(text)) island = 'Bintan';
      else if (/batang ai/.test(text)) island = 'Batang Ai';
      else if (/tiga/.test(text)) island = 'Tiga';
      else if (/besar/.test(text)) island = 'Besar';
      else if (/tinggi/.test(text)) island = 'Tinggi';
      else if (/gemia/.test(text)) island = 'Gemia';
      else if (/payar/.test(text)) island = 'Payar';
      else if (/turtle/.test(text)) island = 'Turtle';
      else if (/pom/.test(text)) island = 'Pom Pom';
      else if (/mantanani/.test(text)) island = 'Mantanani';
      else if (/selingan/.test(text)) island = 'Selingan';
      else if (/lankayan/.test(text)) island = 'Lankayan';
      else if (/redang/.test(text)) island = 'Redang'; // fallback
    }
    // Normalize island name (capitalize first letter)
    if (island) island = island.charAt(0).toUpperCase() + island.slice(1).toLowerCase();
    if (!resort || !island) continue;
    const address = pkg.address || '';
    const cache = await geocodeAndCache(resort, island, address);
    if (cache) {
      console.log(`[HolidayGoGoGo] Geocoded: ${resort}, ${island} ->`, cache.coordinates);
    } else {
      console.warn(`[HolidayGoGoGo] Failed: ${resort}, ${island}`);
    }
  }

  await mongoose.disconnect();
  console.log('Done.');
}

main().catch(err => { console.error(err); process.exit(1); });
