const { Client } = require('@googlemaps/google-maps-services-js');
const GeocodeCache = require('../models/geocodeCache');
const AmiTravel = require('../models/amiTravelSchema');
const { HolidayGoGoPackage } = require('../models/holidayGoGoGoSchema');
const { PulauMalaysiaPackage } = require('../models/pulauMalaysiaSchema');

// Initialize Google Maps client
const googleMapsClient = new Client({});

// Resort name normalization and cleaning utilities
const RESORT_NAME_PATTERNS = {
  // Common resort name variations and their normalized forms
  'taaras': 'The Taaras Beach & Spa Resort',
  'laguna redang': 'Laguna Redang Island Resort',
  'redang beach resort': 'Redang Beach Resort',
  'coral redang': 'Coral Redang Island Resort',
  'redang mutiara': 'Redang Mutiara Beach Resort',
  'redang paradise': 'Redang Paradise Resort',
  'redang bay': 'Redang Bay Resort',
  'redang holiday': 'Redang Holiday Beach Villa',
  'berjaya redang': 'Berjaya Redang Resort',
  'sari pacifica': 'Sari Pacifica Resort & Spa Redang',

  'berjaya tioman': 'Berjaya Tioman Resort',
  'tunamaya': 'Tunamaya Beach & Spa Resort',
  'paya beach': 'Paya Beach Spa & Dive Resort',
  'aman tioman': 'Aman Tioman Beach Resort',
  'barat tioman': 'The Barat Beach Resort',
  'sun beach': 'Sun Beach Resort',
  'swiss garden': 'Swiss-Garden Beach Resort Damai Laut',

  'perhentian island resort': 'Perhentian Island Resort',
  'bubu resort': 'BuBu Resort',
  'coral view': 'Coral View Island Resort',
  'perhentian tuna bay': 'Tuna Bay Island Resort',
  'abdul chalets': 'Abdul Chalets',
  'mama chalets': 'Mama Chalets',
  'mohsin chalets': 'Mohsin Chalets'
};

// Resort name cleaning function
const cleanResortName = (name) => {
  if (!name || typeof name !== 'string') return '';

  let cleaned = name.trim();

  // Remove common prefixes/suffixes that don't help with geocoding
  cleaned = cleaned.replace(/^(package|tour|trip|holiday)\s*:?\s*/i, '');
  cleaned = cleaned.replace(/\s*(package|tour|trip|holiday)\s*$/i, '');

  // Remove duration patterns (3D2N, 2 days, etc.)
  cleaned = cleaned.replace(/\b\d+[dD]\d*[nN]?\b/g, '');
  cleaned = cleaned.replace(/\b\d+\s*(day|night)s?\b/gi, '');

  // Remove price patterns
  cleaned = cleaned.replace(/\bRM\s*\d+[\d,]*(\.\d+)?\b/gi, '');
  cleaned = cleaned.replace(/\$\s*\d+[\d,]*(\.\d+)?\b/gi, '');

  // Remove common promotional words
  cleaned = cleaned.replace(/\b(special|promo|deal|offer|discount|cheap|budget|luxury|premium)\b/gi, '');

  // Remove extra whitespace and normalize
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return cleaned;
};

// Extract resort name from different package sources
const extractResortName = (pkg, source) => {
  let resortName = '';

  if (source === 'AmiTravel') {
    resortName = pkg.resort || '';
  } else if (source === 'HolidayGoGo') {
    // For HolidayGoGo, use resort field if available, otherwise extract from title
    resortName = pkg.resort || '';
    if (!resortName && pkg.title) {
      // Extract resort name from title (usually before first comma)
      const titleParts = pkg.title.split(',');
      resortName = titleParts[0].trim();
    }
  } else if (source === 'PulauMalaysia') {
    // For PulauMalaysia, extract from title
    if (pkg.title) {
      const titleParts = pkg.title.split(',');
      resortName = titleParts[0].trim();
    }
  }

  return cleanResortName(resortName);
};

// Normalize resort name using known patterns
const normalizeResortName = (name) => {
  if (!name) return '';

  const lowerName = name.toLowerCase();

  // Check for exact matches in our patterns
  for (const [pattern, normalized] of Object.entries(RESORT_NAME_PATTERNS)) {
    if (lowerName.includes(pattern)) {
      return normalized;
    }
  }

  // If no pattern match, return cleaned name
  return name;
};

// Real beach and area locations for each island
const ISLAND_LOCATIONS = {
  'redang': {
    center: [103.00759, 5.77736],
    beaches: [
      { name: 'Pasir Panjang', coords: [103.0325481, 5.7706757] },
      { name: 'Teluk Dalam', coords: [103.0089, 5.7801] },
      { name: 'Laguna Beach', coords: [103.0298, 5.7689] },
      { name: 'Coral Bay', coords: [103.0156, 5.7745] },
      { name: 'Teluk Kalong', coords: [103.0201, 5.7823] },
      { name: 'Chagar Hutang', coords: [103.0067, 5.7712] },
      { name: 'Turtle Bay', coords: [103.0134, 5.7834] }
    ]
  },
  'perhentian': {
    center: [102.7397, 5.9145],
    beaches: [
      { name: 'Long Beach Perhentian Kecil', coords: [102.7456, 5.9089] },
      { name: 'Coral Bay Perhentian Kecil', coords: [102.7423, 5.9067] },
      { name: 'Turtle Beach Perhentian Besar', coords: [102.7334, 5.9201] },
      { name: 'Three Coves Beach', coords: [102.7389, 5.9178] },
      { name: 'Teluk Pauh', coords: [102.7367, 5.9156] },
      { name: 'Adam & Eve Beach', coords: [102.7445, 5.9123] },
      { name: 'D Lagoon Beach', coords: [102.7412, 5.9134] }
    ]
  },
  'tioman': {
    center: [104.15949, 2.81789],
    beaches: [
      { name: 'Salang Beach', coords: [104.1456, 2.8567] },
      { name: 'Air Batang (ABC) Beach', coords: [104.1523, 2.8234] },
      { name: 'Tekek Beach', coords: [104.1595, 2.8179] },
      { name: 'Genting Beach', coords: [104.1634, 2.8089] },
      { name: 'Paya Beach', coords: [104.1712, 2.7956] },
      { name: 'Juara Beach', coords: [104.1889, 2.8123] },
      { name: 'Nipah Beach', coords: [104.1567, 2.8456] },
      { name: 'Monkey Beach', coords: [104.1489, 2.8345] },
      { name: 'Berjaya Beach', coords: [104.1623, 2.7834] }
    ]
  }
};

// Function to find the best beach location for a resort
const findBestBeachLocation = (resortName, island) => {
  const islandKey = safeToLower(island, 'island');
  const islandData = ISLAND_LOCATIONS[islandKey];

  if (!islandData) return null;

  const resortLower = safeToLower(resortName, 'resortName');

  // Try to match resort name with specific beach names
  for (const beach of islandData.beaches) {
    const beachWords = beach.name.toLowerCase().split(' ');
    const resortWords = resortLower.split(' ');

    // Check for direct beach name matches
    if (beachWords.some(word => resortWords.includes(word))) {
      console.log(`🏖️ Matched ${resortName} to ${beach.name}`);
      return beach.coords;
    }

    // Check for common beach keywords
    if (resortLower.includes('salang') && beach.name.includes('Salang')) return beach.coords;
    if (resortLower.includes('abc') && beach.name.includes('Air Batang')) return beach.coords;
    if (resortLower.includes('tekek') && beach.name.includes('Tekek')) return beach.coords;
    if (resortLower.includes('genting') && beach.name.includes('Genting')) return beach.coords;
    if (resortLower.includes('paya') && beach.name.includes('Paya')) return beach.coords;
    if (resortLower.includes('juara') && beach.name.includes('Juara')) return beach.coords;
    if (resortLower.includes('nipah') && beach.name.includes('Nipah')) return beach.coords;
    if (resortLower.includes('long beach') && beach.name.includes('Long Beach')) return beach.coords;
    if (resortLower.includes('coral bay') && beach.name.includes('Coral Bay')) return beach.coords;
    if (resortLower.includes('turtle') && beach.name.includes('Turtle')) return beach.coords;
    if (resortLower.includes('laguna') && beach.name.includes('Laguna')) return beach.coords;
    if (resortLower.includes('pasir panjang') && beach.name.includes('Pasir Panjang')) return beach.coords;
  }

  return null;
};

// Function to add small realistic offset to coordinates
const addRealisticOffset = (baseCoords, index, total) => {
  // Much smaller offset - only ±0.001 degrees (≈100m)
  const maxOffset = 0.001;

  // Use index to create consistent but varied positions
  const angle = (index / total) * 2 * Math.PI;
  const radius = maxOffset * (0.3 + (index % 3) * 0.2); // Vary radius 0.3-0.7 of max

  const offsetLng = Math.cos(angle) * radius;
  const offsetLat = Math.sin(angle) * radius;

  return [
    baseCoords[0] + offsetLng,
    baseCoords[1] + offsetLat
  ];
};
// Enhanced function to get coordinates from Google Maps Geocoding API with quality scoring
const getCoordinatesFromAddress = async (query, resortName, island) => {
  try {
    console.log(`🔍 Geocoding: "${query}" for ${resortName} in ${island}`);

    const response = await googleMapsClient.geocode({
      params: {
        address: query,
        key: process.env.GOOGLE_MAPS_API_KEY,
        region: 'my', // Restrict to Malaysia
        language: 'en',
        components: 'country:MY' // Restrict to Malaysia
      }
    });

    if (response.data && response.data.results && response.data.results.length > 0) {
      let bestResult = null;
      let bestScore = 0;
      for (const geocodeResult of response.data.results) {
        if (!geocodeResult.geometry || !geocodeResult.geometry.location) {
          console.log('⚠️ Skipping result with missing geometry/location:', geocodeResult);
          continue;
        }
        const { lat, lng } = geocodeResult.geometry.location;
        const coordinates = [lng, lat]; // [longitude, latitude] for GeoJSON
        const formattedAddress = geocodeResult.formatted_address;
        const candidateResult = { coordinates, formattedAddress, raw: geocodeResult };
        const score = calculateQualityScore(candidateResult, resortName, island);
        console.log(`📊 Result: [${lng?.toFixed(6)}, ${lat?.toFixed(6)}] Score: ${score} - ${formattedAddress}`);
        if (score > bestScore) {
          bestScore = score;
          bestResult = candidateResult;
        }
      }
      if (bestResult && bestScore > 20) { // Minimum quality threshold
        const { coordinates, formattedAddress } = bestResult;
        console.log(`✅ Best result: [${coordinates[0].toFixed(6)}, ${coordinates[1].toFixed(6)}] Score: ${bestScore} - ${formattedAddress}`);
        await GeocodeCache.findOneAndUpdate(
          { query: query && typeof query === 'string' ? query.toLowerCase() : '' },
          {
            query: query && typeof query === 'string' ? query.toLowerCase() : '',
            resortName,
            island,
            coordinates,
            formattedAddress,
            qualityScore: bestScore,
            method: 'api_geocoding',
            lastUpdated: new Date()
          },
          { upsert: true, new: true }
        );
        return { coordinates, formattedAddress, qualityScore: bestScore };
      } else {
        console.log(`⚠️ No high-quality results found for: "${query}" (best score: ${bestScore})`);
        return null;
      }
    } else {
      console.log(`⚠️ No results found for: "${query}"`);
      console.log('Full API response:', JSON.stringify(response.data, null, 2));
      return null;
    }
  } catch (error) {
    console.error(`❌ Google Maps Geocoding error for "${query}":`, error.message);
    if (error.response && error.response.data) {
      console.error('Google Maps API Error Details:', error.response.data);
    }
    return null;
  }
};

// Function to clear geocache and populate with resort coordinates
const populateResortCoordinates = async (req, res) => {
  try {
    console.log('🧹 Clearing existing geocache...');
    await GeocodeCache.deleteMany({});

    console.log('📦 Fetching all packages...');
    const [amiTravelPackages, holidayGoGoPackages, pulauMalaysiaPackages] = await Promise.all([
      AmiTravel.find({ resort: { $exists: true, $ne: '' } }).select('resort destination'),
      HolidayGoGoPackage.find({ resort: { $exists: true, $ne: '' } }).select('resort destination'),
      PulauMalaysiaPackage.find({ resort: { $exists: true, $ne: '' } }).select('resort destination')
    ]);

    // Extract unique resorts
    const resortSet = new Map();

    // Process AmiTravel packages with improved name extraction
    amiTravelPackages.forEach(pkg => {
      const resortName = extractResortName(pkg, 'AmiTravel');
      if (resortName && pkg.destination) {
        const key = `${resortName.toLowerCase()}_${pkg.destination.toLowerCase()}`;
        resortSet.set(key, {
          name: resortName,
          island: pkg.destination,
          source: 'AmiTravel',
          originalName: pkg.resort
        });
      }
    });

    // Process HolidayGoGo packages with improved name extraction
    holidayGoGoPackages.forEach(pkg => {
      const resortName = extractResortName(pkg, 'HolidayGoGo');
      if (resortName && pkg.destination) {
        const key = `${resortName.toLowerCase()}_${pkg.destination.toLowerCase()}`;
        if (!resortSet.has(key)) {
          resortSet.set(key, {
            name: resortName,
            island: pkg.destination,
            source: 'HolidayGoGo',
            originalName: pkg.resort || pkg.title
          });
        }
      }
    });

    // Process PulauMalaysia packages with improved name extraction
    pulauMalaysiaPackages.forEach(pkg => {
      const resortName = extractResortName(pkg, 'PulauMalaysia');
      if (resortName && pkg.destination) {
        const key = `${resortName.toLowerCase()}_${pkg.destination.toLowerCase()}`;
        if (!resortSet.has(key)) {
          resortSet.set(key, {
            name: resortName,
            island: pkg.destination,
            source: 'PulauMalaysia',
            originalName: pkg.title
          });
        }
      }
    });

    const uniqueResorts = Array.from(resortSet.values());
    console.log(`🏨 Found ${uniqueResorts.length} unique resorts to geocode`);

    let successCount = 0;
    let failCount = 0;

    // Geocode each resort with improved strategies
    for (let i = 0; i < uniqueResorts.length; i++) {
      const resort = uniqueResorts[i];

      // Create more specific search queries based on island
      let queries = [];

      if (safeToLower(resort.island, 'island') === 'redang') {
        queries = [
          `${resort.name}, Pulau Redang, Terengganu, Malaysia`,
          `${resort.name} Resort, Pulau Redang, Malaysia`,
          `${resort.name}, Redang Island, Terengganu, Malaysia`,
          `${resort.name} Beach Resort, Pulau Redang, Malaysia`,
          `${resort.name}, Kuala Nerus, Terengganu, Malaysia`
        ];
      } else if (safeToLower(resort.island, 'island') === 'perhentian') {
        queries = [
          `${resort.name}, Pulau Perhentian, Terengganu, Malaysia`,
          `${resort.name} Resort, Perhentian Islands, Malaysia`,
          `${resort.name}, Perhentian Kecil, Malaysia`,
          `${resort.name}, Perhentian Besar, Malaysia`,
          `${resort.name} Beach Resort, Pulau Perhentian, Malaysia`
        ];
      } else if (safeToLower(resort.island, 'island') === 'tioman') {
        queries = [
          `${resort.name}, Pulau Tioman, Pahang, Malaysia`,
          `${resort.name} Resort, Tioman Island, Malaysia`,
          `${resort.name}, Tioman, Pahang, Malaysia`,
          `${resort.name} Beach Resort, Pulau Tioman, Malaysia`
        ];
      } else {
        // Generic queries for other islands
        queries = [
          `${resort.name}, ${resort.island}, Malaysia`,
          `${resort.name} Resort, ${resort.island}, Malaysia`,
          `${resort.name}, Malaysia`,
          `${resort.name} Hotel, ${resort.island}, Malaysia`
        ];
      }

      let found = false;
      let bestResult = null;

      for (const query of queries) {
        const result = await getCoordinatesFromAddress(query, resort.name, resort.island);
        if (result) {
          // Check if this is a generic Malaysia coordinate
          const isGeneric = result.coordinates[0] === 112.5 && result.coordinates[1] === 2.5;

          if (!isGeneric) {
            // Found specific coordinates, use them immediately
            successCount++;
            found = true;
            break;
          } else if (!bestResult) {
            // Store generic result as fallback
            bestResult = result;
          }
        }

        // Rate limiting - wait 1 second between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // If we only found generic coordinates, try one more specific approach
      if (!found && bestResult) {
        console.log(`⚠️ Only generic coordinates found for ${resort.name}, trying specific location search...`);

        // Try with specific beach/area names if available
        const specificQueries = [];
        if (safeToLower(resort.island, 'island') === 'redang') {
          specificQueries.push(
            `${resort.name}, Pasir Panjang, Redang, Malaysia`,
            `${resort.name}, Teluk Dalam, Redang, Malaysia`,
            `${resort.name}, Laguna Beach, Redang, Malaysia`
          );
        } else if (safeToLower(resort.island, 'island') === 'perhentian') {
          specificQueries.push(
            `${resort.name}, Long Beach, Perhentian, Malaysia`,
            `${resort.name}, Coral Bay, Perhentian, Malaysia`,
            `${resort.name}, Turtle Beach, Perhentian, Malaysia`
          );
        }

        for (const query of specificQueries) {
          const result = await getCoordinatesFromAddress(query, resort.name, resort.island);
          if (result && !(result.coordinates[0] === 112.5 && result.coordinates[1] === 2.5)) {
            successCount++;
            found = true;
            break;
          }
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // If still no specific coordinates, use the generic ones but add small random offset
        if (!found) {
          console.log(`📍 Using generic coordinates with offset for ${resort.name}`);
          await useGenericWithOffset(resort, bestResult);
          successCount++;
          found = true;
        }
      }

      if (!found) {
        console.log(`❌ Failed to geocode: ${resort.name} in ${resort.island}`);
        failCount++;
      }

      // Progress indicator
      if ((i + 1) % 5 === 0) {
        console.log(`📍 Progress: ${i + 1}/${uniqueResorts.length} resorts processed`);
      }
    }

    console.log(`✅ Geocoding complete! Success: ${successCount}, Failed: ${failCount}`);

    res.json({
      success: true,
      message: 'Resort coordinates populated successfully',
      stats: {
        totalResorts: uniqueResorts.length,
        successCount,
        failCount,
        sources: {
          AmiTravel: amiTravelPackages.length,
          HolidayGoGo: holidayGoGoPackages.length,
          PulauMalaysia: pulauMalaysiaPackages.length
        }
      }
    });

  } catch (error) {
    console.error('❌ Error populating resort coordinates:', error);
    res.status(500).json({
      success: false,
      message: 'Error populating resort coordinates',
      error: error.message
    });
  }
};

// Function to get all cached resort coordinates
const getCachedResortCoordinates = async () => {
  try {
    const cachedResorts = await GeocodeCache.find({}).select('resortName island coordinates formattedAddress');
    return cachedResorts.map(resort => ({
      name: resort.resortName,
      island: resort.island,
      coordinates: resort.coordinates,
      address: resort.formattedAddress
    }));
  } catch (error) {
    console.error('Error fetching cached resort coordinates:', error);
    return [];
  }
};

// Enhanced query generation with better strategies
const createEnhancedQueries = (resortName, island) => {
  const queries = [];
  const normalizedName = normalizeResortName(resortName);
  const cleanName = cleanResortName(resortName);

  // Use normalized name if different from original
  const primaryName = normalizedName !== resortName ? normalizedName : cleanName;

  if (safeToLower(island, 'island') === 'redang') {
    queries.push(
      // Most specific queries first
      `${primaryName}, Pulau Redang, Terengganu, Malaysia`,
      `${primaryName}, Redang Island, Terengganu, Malaysia`,
      `${primaryName}, Pasir Panjang, Pulau Redang, Malaysia`,
      `${primaryName}, Teluk Dalam, Pulau Redang, Malaysia`,
      `${primaryName}, Laguna Beach, Pulau Redang, Malaysia`,
      `${primaryName} Resort, Pulau Redang, Malaysia`,
      `${primaryName}, Redang, Malaysia`,
      // Fallback with original name if different
      ...(primaryName !== resortName ? [
        `${resortName}, Pulau Redang, Terengganu, Malaysia`,
        `${resortName} Resort, Redang, Malaysia`
      ] : [])
    );
  } else if (safeToLower(island, 'island') === 'perhentian') {
    queries.push(
      `${primaryName}, Pulau Perhentian, Terengganu, Malaysia`,
      `${primaryName}, Perhentian Islands, Terengganu, Malaysia`,
      `${primaryName}, Long Beach, Perhentian Kecil, Malaysia`,
      `${primaryName}, Coral Bay, Perhentian Kecil, Malaysia`,
      `${primaryName}, Perhentian Besar, Malaysia`,
      `${primaryName} Resort, Pulau Perhentian, Malaysia`,
      `${primaryName}, Perhentian, Malaysia`,
      ...(primaryName !== resortName ? [
        `${resortName}, Pulau Perhentian, Malaysia`,
        `${resortName} Resort, Perhentian, Malaysia`
      ] : [])
    );
  } else if (safeToLower(island, 'island') === 'tioman') {
    queries.push(
      `${primaryName}, Pulau Tioman, Pahang, Malaysia`,
      `${primaryName}, Tioman Island, Pahang, Malaysia`,
      `${primaryName}, Salang Beach, Tioman, Malaysia`,
      `${primaryName}, ABC Beach, Tioman, Malaysia`,
      `${primaryName}, Tekek, Tioman, Malaysia`,
      `${primaryName}, Juara Beach, Tioman, Malaysia`,
      `${primaryName}, Paya Beach, Tioman, Malaysia`,
      `${primaryName} Resort, Pulau Tioman, Malaysia`,
      `${primaryName}, Tioman, Malaysia`,
      ...(primaryName !== resortName ? [
        `${resortName}, Pulau Tioman, Malaysia`,
        `${resortName} Resort, Tioman, Malaysia`
      ] : [])
    );
  } else if (safeToLower(island, 'island') === 'langkawi') {
    queries.push(
      `${primaryName}, Langkawi, Kedah, Malaysia`,
      `${primaryName}, Pulau Langkawi, Malaysia`,
      `${primaryName}, Pantai Cenang, Langkawi, Malaysia`,
      `${primaryName}, Kuah, Langkawi, Malaysia`,
      `${primaryName} Resort, Langkawi, Malaysia`,
      ...(primaryName !== resortName ? [
        `${resortName}, Langkawi, Malaysia`
      ] : [])
    );
  } else if (safeToLower(island, 'island') === 'pangkor') {
    queries.push(
      `${primaryName}, Pulau Pangkor, Perak, Malaysia`,
      `${primaryName}, Pangkor Island, Malaysia`,
      `${primaryName}, Pasir Bogak, Pangkor, Malaysia`,
      `${primaryName} Resort, Pangkor, Malaysia`,
      ...(primaryName !== resortName ? [
        `${resortName}, Pangkor, Malaysia`
      ] : [])
    );
  } else {
    // Generic island queries
    queries.push(
      `${primaryName}, Pulau ${island}, Malaysia`,
      `${primaryName}, ${island} Island, Malaysia`,
      `${primaryName}, ${island}, Malaysia`,
      `${primaryName} Resort, ${island}, Malaysia`,
      `${primaryName} Beach Resort, ${island}, Malaysia`,
      ...(primaryName !== resortName ? [
        `${resortName}, ${island}, Malaysia`
      ] : [])
    );
  }

  // Remove duplicates and empty queries
  return [...new Set(queries.filter(q => q.trim().length > 0))];
};

// Enhanced coordinate validation and quality scoring
const isGenericCoordinate = (coords) => {
  if (!coords || coords.length !== 2) return true;

  const [lng, lat] = coords;

  // Check for exact generic coordinates
  if ((lng === 112.5 && lat === 2.5) || // Malaysia center
      (lng === 101.9758 && lat === 4.2105)) { // KL center
    return true;
  }

  // Check for coordinates that are too close to country/state centers
  const genericCenters = [
    [112.5, 2.5],    // Malaysia center
    [101.9758, 4.2105], // KL center
    [103.8198, 1.3521], // Singapore center
    [100.3327, 5.4164], // Penang center
  ];

  for (const [centerLng, centerLat] of genericCenters) {
    const distance = Math.sqrt(Math.pow(lng - centerLng, 2) + Math.pow(lat - centerLat, 2));
    if (distance < 0.01) { // Very close to generic center
      return true;
    }
  }

  return false;
};

// Validate coordinates are within reasonable bounds for Malaysian islands
const validateCoordinatesForIsland = (coords, island) => {
  if (!coords || coords.length !== 2) return { valid: false, reason: 'Invalid coordinate format' };

  const [lng, lat] = coords;

  // Basic Malaysia bounds check
  if (lng < 99.0 || lng > 119.0 || lat < 0.8 || lat > 7.5) {
    return { valid: false, reason: 'Coordinates outside Malaysia bounds' };
  }

  // Island-specific bounds
  const islandBounds = {
    'redang': { minLng: 102.8, maxLng: 103.1, minLat: 5.7, maxLat: 5.8 },
    'perhentian': { minLng: 102.7, maxLng: 102.8, minLat: 5.8, maxLat: 6.0 },
    'tioman': { minLng: 104.1, maxLng: 104.2, minLat: 2.7, maxLat: 2.9 },
    'langkawi': { minLng: 99.6, maxLng: 99.9, minLat: 6.2, maxLat: 6.5 },
    'pangkor': { minLng: 100.5, maxLng: 100.6, minLat: 4.2, maxLat: 4.3 }
  };

  const bounds = islandBounds[safeToLower(island, 'island')];
  if (bounds) {
    if (lng < bounds.minLng || lng > bounds.maxLng || lat < bounds.minLat || lat > bounds.maxLat) {
      return { valid: false, reason: `Coordinates outside ${island} island bounds` };
    }
  }

  return { valid: true, reason: 'Valid coordinates' };
};

// Calculate quality score for geocoding result
const calculateQualityScore = (result, resortName, island) => {
  if (!result || !result.coordinates) return 0;

  let score = 0;
  const { coordinates, formattedAddress } = result;

  // Base score for having coordinates
  score += 10;

  // Check if coordinates are generic
  if (isGenericCoordinate(coordinates)) {
    score -= 50; // Heavy penalty for generic coordinates
  }

  // Validate coordinates for island
  const validation = validateCoordinatesForIsland(coordinates, island);
  if (validation.valid) {
    score += 30;
  } else {
    score -= 20;
  }

  // Check if formatted address contains resort name
  if (formattedAddress && resortName && island) {
    const addressLower = typeof formattedAddress === 'string' ? formattedAddress.toLowerCase() : '';
    const resortLower = typeof resortName === 'string' ? resortName.toLowerCase() : '';
    const islandLower = typeof island === 'string' ? island.toLowerCase() : '';

    if (addressLower.includes(resortLower)) {
      score += 25;
    }

    // Check if address contains island name
    if (addressLower.includes(islandLower)) {
      score += 15;
    }

    // Check if address contains Malaysia
    if (addressLower.includes('malaysia')) {
      score += 10;
    }
  } else {
    if (!formattedAddress) console.log('⚠️ calculateQualityScore: formattedAddress is undefined:', formattedAddress);
    if (!resortName) console.log('⚠️ calculateQualityScore: resortName is undefined:', resortName);
    if (!island) console.log('⚠️ calculateQualityScore: island is undefined:', island);
  }

  // Penalty for very short or generic addresses
  if (!formattedAddress || formattedAddress.length < 20) {
    score -= 10;
  }

  return Math.max(0, score); // Ensure non-negative score
};

// Function to fix generic coordinates by re-geocoding with better strategies
const fixGenericCoordinates = async (req, res) => {
  try {
    console.log('🔧 Fixing generic coordinates...');

    // Find all resorts with generic coordinates [112.5, 2.5]
    const genericResorts = await GeocodeCache.find({
      coordinates: [112.5, 2.5]
    });

    console.log(`🎯 Found ${genericResorts.length} resorts with generic coordinates`);

    let fixedCount = 0;
    let offsetCount = 0;

    for (const resort of genericResorts) {
      console.log(`🔍 Re-geocoding: ${resort.resortName} in ${resort.island}`);

      // Try improved geocoding strategies
      let queries = [];

      if (safeToLower(resort.island, 'island') === 'redang') {
        queries = [
          `${resort.resortName}, Pulau Redang, Terengganu, Malaysia`,
          `${resort.resortName} Resort, Pulau Redang, Malaysia`,
          `${resort.resortName}, Redang Island, Terengganu, Malaysia`,
          `${resort.resortName}, Pasir Panjang, Redang, Malaysia`,
          `${resort.resortName}, Teluk Dalam, Redang, Malaysia`
        ];
      } else if (safeToLower(resort.island, 'island') === 'perhentian') {
        queries = [
          `${resort.resortName}, Pulau Perhentian, Terengganu, Malaysia`,
          `${resort.resortName} Resort, Perhentian Islands, Malaysia`,
          `${resort.resortName}, Perhentian Kecil, Malaysia`,
          `${resort.resortName}, Perhentian Besar, Malaysia`,
          `${resort.resortName}, Long Beach, Perhentian, Malaysia`
        ];
      }

      let found = false;
      for (const query of queries) {
        const result = await getCoordinatesFromAddress(query, resort.resortName, resort.island);
        if (result && !(result.coordinates[0] === 112.5 && result.coordinates[1] === 2.5)) {
          console.log(`✅ Found specific coordinates for ${resort.resortName}`);
          fixedCount++;
          found = true;
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // If still generic, add offset
      if (!found) {
        const offsetLng = (Math.random() - 0.5) * 0.02;
        const offsetLat = (Math.random() - 0.5) * 0.02;

        const newCoordinates = [112.5 + offsetLng, 2.5 + offsetLat];

        await GeocodeCache.findByIdAndUpdate(resort._id, {
          coordinates: newCoordinates,
          formattedAddress: `${resort.formattedAddress} (with offset)`
        });

        console.log(`📍 Added offset to ${resort.resortName}: [${newCoordinates[0].toFixed(6)}, ${newCoordinates[1].toFixed(6)}]`);
        offsetCount++;
      }
    }

    res.json({
      success: true,
      message: 'Fixed generic coordinates',
      stats: {
        totalGeneric: genericResorts.length,
        fixedWithSpecific: fixedCount,
        fixedWithOffset: offsetCount
      }
    });

  } catch (error) {
    console.error('❌ Error fixing generic coordinates:', error);
    res.status(500).json({
      success: false,
      message: 'Error fixing generic coordinates',
      error: error.message
    });
  }
};

// Smart cache management functions
const getCacheStats = async () => {
  try {
    const totalCached = await GeocodeCache.countDocuments();
    const highQuality = await GeocodeCache.countDocuments({ qualityScore: { $gte: 80 } });
    const mediumQuality = await GeocodeCache.countDocuments({ qualityScore: { $gte: 50, $lt: 80 } });
    const lowQuality = await GeocodeCache.countDocuments({ qualityScore: { $lt: 50 } });
    const verified = await GeocodeCache.countDocuments({ isVerified: true });

    const byMethod = await GeocodeCache.aggregate([
      { $group: { _id: '$method', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    return {
      totalCached,
      qualityDistribution: {
        high: highQuality,
        medium: mediumQuality,
        low: lowQuality
      },
      verified,
      byMethod: byMethod.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    };
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return null;
  }
};

// Function to identify and re-geocode low quality coordinates
const improveCoordinateQuality = async (req, res) => {
  try {
    console.log('🔧 Identifying low quality coordinates for improvement...');

    // Find coordinates with low quality scores or generic coordinates
    const lowQualityResorts = await GeocodeCache.find({
      $or: [
        { qualityScore: { $lt: 50 } },
        { coordinates: [112.5, 2.5] },
        { method: 'fallback' },
        { isVerified: false, qualityScore: { $lt: 80 } }
      ]
    }).sort({ qualityScore: 1 });

    console.log(`🎯 Found ${lowQualityResorts.length} resorts with low quality coordinates`);

    let improvedCount = 0;
    let failedCount = 0;

    for (const resort of lowQualityResorts) {
      console.log(`\n🔍 Improving: ${resort.resortName} in ${resort.island} (Current score: ${resort.qualityScore})`);

      // First try known resort database
      // const knownCoords = findKnownResortCoordinates(resort.resortName, resort.island);
      // if (knownCoords && knownCoords.qualityScore > resort.qualityScore) {
      //   await GeocodeCache.findByIdAndUpdate(resort._id, {
      //     coordinates: knownCoords.coordinates,
      //     formattedAddress: knownCoords.address,
      //     qualityScore: knownCoords.qualityScore,
      //     method: knownCoords.method,
      //     lastUpdated: new Date()
      //   });

      //   console.log(`✅ Improved with known coordinates: Score ${resort.qualityScore} -> ${knownCoords.qualityScore}`);
      //   improvedCount++;
      //   continue;
      // }

      // Try enhanced API geocoding with better queries
      const queries = createEnhancedQueries(resort.resortName, resort.island);
      let bestResult = null;
      let bestScore = resort.qualityScore;

      for (const query of queries) {
        const result = await getCoordinatesFromAddress(query, resort.resortName, resort.island);
        if (result && result.qualityScore > bestScore) {
          bestResult = result;
          bestScore = result.qualityScore;
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      if (bestResult && bestScore > resort.qualityScore + 10) { // Significant improvement
        await GeocodeCache.findByIdAndUpdate(resort._id, {
          coordinates: bestResult.coordinates,
          formattedAddress: bestResult.formattedAddress,
          qualityScore: bestResult.qualityScore,
          method: 'api_geocoding_improved',
          lastUpdated: new Date()
        });

        console.log(`✅ Improved with API: Score ${resort.qualityScore} -> ${bestResult.qualityScore}`);
        improvedCount++;
      } else {
        console.log(`⚠️ No improvement found for ${resort.resortName}`);
        failedCount++;
      }
    }

    res.json({
      success: true,
      message: 'Coordinate quality improvement completed',
      stats: {
        totalProcessed: lowQualityResorts.length,
        improved: improvedCount,
        failed: failedCount
      }
    });

  } catch (error) {
    console.error('❌ Error improving coordinate quality:', error);
    res.status(500).json({
      success: false,
      message: 'Error improving coordinate quality',
      error: error.message
    });
  }
};

/**
 * Re-geocode all resorts in the database using Google Geocoding API.
 * This function updates the coordinates for all resorts, skipping those already verified.
 * It does NOT use any hardcoded coordinates file.
 */
const reGeocodeAllResorts = async (req, res) => {
  try {
    const Resort = require('../models/resortLocation');
    const GeocodeCache = require('../models/geocodeCache');
    const allResorts = await Resort.find({});
    let updated = 0;
    let skipped = 0;
    let errors = 0;
    for (const resort of allResorts) {
      // Skip if already verified in cache
      const cached = await GeocodeCache.findOne({ resortName: resort.resortName, island: resort.island });
      if (cached && cached.isVerified) {
        skipped++;
        continue;
      }
      // Build address query
      const queries = createEnhancedQueries(resort.resortName, resort.island);
      let bestResult = null;
      let bestScore = 0;
      for (const query of queries) {
        const result = await getCoordinatesFromAddress(query, resort.resortName, resort.island);
        if (result && result.qualityScore > bestScore) {
          bestResult = result;
          bestScore = result.qualityScore;
        }
        await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limit
      }
      if (bestResult && bestResult.coordinates && bestResult.qualityScore > 0) {
        await GeocodeCache.findOneAndUpdate(
          { resortName: resort.resortName, island: resort.island },
          {
            coordinates: bestResult.coordinates,
            formattedAddress: bestResult.formattedAddress,
            qualityScore: bestResult.qualityScore,
            method: 'api_geocoding',
            lastUpdated: new Date(),
            isVerified: false
          },
          { upsert: true }
        );
        updated++;
      } else {
        errors++;
      }
    }
    res.json({
      success: true,
      message: 'Re-geocoding completed',
      stats: {
        total: allResorts.length,
        updated,
        skipped,
        errors
      }
    });
  } catch (error) {
    console.error('Error in reGeocodeAllResorts:', error);
    res.status(500).json({ success: false, message: 'Error in re-geocoding', error: error.message });
  }
};

// Defensive .toLowerCase() helper
function safeToLower(val, label) {
  if (typeof val === 'string') return val.toLowerCase();
  console.log(`⚠️ safeToLower: ${label} is not a string:`, val);
  return '';
}

module.exports = {
  getCoordinatesFromAddress,
  populateResortCoordinates,
  getCachedResortCoordinates,
  fixGenericCoordinates,
  reGeocodeAllResorts,
  getCacheStats,
  improveCoordinateQuality,
  extractResortName,
  normalizeResortName,
  cleanResortName,
  calculateQualityScore,
  validateCoordinatesForIsland
};
