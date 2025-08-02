const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/authMiddleWare');
const GeocodeCache = require('../models/geocodeCache');
const ResortLocation = require('../models/resortLocation');
const {
  populateResortCoordinates,
  getCachedResortCoordinates,
  fixGenericCoordinates,
  reGeocodeAllResorts,
  getCacheStats,
  improveCoordinateQuality
} = require('../utils/geocoding');
const { getGoogleReviews } = require('../controllers/resortController');

// GET /api/resorts - Get all cached resort coordinates (public read access)
router.get('/', async (req, res) => {
  try {
    // Use the new single-source ResortLocation collection
    const resorts = await ResortLocation.find({})
      .select('name island location coordinateSource')
      .sort({ island: 1, name: 1 });

    // Transform to match frontend expectations
    const transformedResorts = resorts.map(resort => ({
      id: resort._id,
      name: resort.name,
      island: resort.island,
      coordinates: resort.location?.coordinates || null,
      address: `${resort.name}, ${resort.island} Island, Malaysia`,
      precision: resort.coordinateSource === 'google_maps_research_exact' ? 'exact' : 'standard',
      source: 'resortlocations',
      coordinateSource: resort.coordinateSource || 'master'
    }));

    console.log(`📍 Serving ${transformedResorts.length} resorts from single-source collection`);
    const exactCount = transformedResorts.filter(r => r.precision === 'exact').length;
    console.log(`🎯 ${exactCount} resorts have exact Google Maps coordinates`);

    res.status(200).json({
      success: true,
      resorts: transformedResorts,
      count: transformedResorts.length,
      exactCoordinates: exactCount,
      source: 'single_source_resortlocations'
    });
  } catch (err) {
    console.error('Error fetching resorts:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch resorts.' });
  }
});

// GET /api/resorts/search-suggestions - Get search suggestions for islands and resorts (public access)
router.get('/search-suggestions', async (req, res) => {
  try {
    // Get unique island names and resort names for search suggestions
    const suggestions = await GeocodeCache.aggregate([
      {
        $group: {
          _id: null,
          islands: { $addToSet: '$island' },
          resorts: { $addToSet: '$resortName' }
        }
      },
      {
        $project: {
          _id: 0,
          suggestions: {
            $concatArrays: [
              { $filter: { input: '$islands', cond: { $ne: ['$$this', null] } } },
              { $filter: { input: '$resorts', cond: { $ne: ['$$this', null] } } }
            ]
          }
        }
      }
    ]);

    const suggestionList = suggestions.length > 0 ? suggestions[0].suggestions : [];
    
    // Sort suggestions alphabetically and remove duplicates
    const uniqueSuggestions = [...new Set(suggestionList)]
      .filter(item => item && item.trim().length > 0)
      .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

    res.status(200).json({
      success: true,
      suggestions: uniqueSuggestions,
      count: uniqueSuggestions.length
    });
  } catch (err) {
    console.error('Error fetching search suggestions:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch search suggestions.' });
  }
});

// Admin-only routes - require authentication and admin role
// POST /api/resorts/populate - Populate resort coordinates using OpenCage API
router.post('/populate', protect, isAdmin, populateResortCoordinates);

// POST /api/resorts/fix-generic - Fix resorts with generic coordinates
router.post('/fix-generic', protect, isAdmin, fixGenericCoordinates);

// POST /api/resorts/re-geocode-all - Re-geocode all resorts with real locations
router.post('/re-geocode-all', protect, isAdmin, reGeocodeAllResorts);

// GET /api/resorts/cache-stats - Get cache statistics
router.get('/cache-stats', protect, isAdmin, async (req, res) => {
  try {
    const stats = await getCacheStats();
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error getting cache stats',
      error: error.message
    });
  }
});

// POST /api/resorts/improve-quality - Improve coordinate quality for low-quality entries
router.post('/improve-quality', protect, isAdmin, improveCoordinateQuality);

// PATCH /api/resorts/:id/verify - Mark a resort coordinate as verified/unverified
router.patch('/:id/verify', protect, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;

    const updatedResort = await GeocodeCache.findByIdAndUpdate(
      id,
      {
        isVerified: Boolean(isVerified),
        lastUpdated: new Date()
      },
      { new: true }
    );

    if (!updatedResort) {
      return res.status(404).json({
        success: false,
        message: 'Resort not found'
      });
    }

    res.json({
      success: true,
      message: `Resort ${isVerified ? 'verified' : 'unverified'} successfully`,
      resort: updatedResort
    });
  } catch (error) {
    console.error('Error updating verification status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating verification status',
      error: error.message
    });
  }
});

// PATCH /api/resorts/:id/coordinates - Manually update resort coordinates
router.patch('/:id/coordinates', protect, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { coordinates, formattedAddress, method, qualityScore, isVerified } = req.body;

    // Validate coordinates
    if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates format. Expected [longitude, latitude]'
      });
    }

    const [lng, lat] = coordinates;
    if (typeof lng !== 'number' || typeof lat !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Coordinates must be numbers'
      });
    }

    // Basic bounds check for Malaysia
    if (lng < 99.0 || lng > 119.0 || lat < 0.8 || lat > 7.5) {
      return res.status(400).json({
        success: false,
        message: 'Coordinates appear to be outside Malaysia bounds'
      });
    }

    const updatedResort = await GeocodeCache.findByIdAndUpdate(
      id,
      {
        coordinates,
        formattedAddress: formattedAddress || 'Manually updated',
        method: method || 'manual_override',
        qualityScore: qualityScore || 100,
        isVerified: isVerified !== undefined ? Boolean(isVerified) : true,
        lastUpdated: new Date()
      },
      { new: true }
    );

    if (!updatedResort) {
      return res.status(404).json({
        success: false,
        message: 'Resort not found'
      });
    }

    res.json({
      success: true,
      message: 'Coordinates updated successfully',
      resort: updatedResort
    });
  } catch (error) {
    console.error('Error updating coordinates:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating coordinates',
      error: error.message
    });
  }
});

// POST /api/resorts/spread-overlapping - Add offsets to overlapping resort coordinates
router.post('/spread-overlapping', protect, isAdmin, async (req, res) => {
  try {
    console.log('🎯 Spreading overlapping resort coordinates...');

    const resorts = await GeocodeCache.find({});

    // Group resorts by coordinates to find overlaps
    const coordinateGroups = new Map();

    resorts.forEach(resort => {
      const coordKey = `${resort.coordinates[0]},${resort.coordinates[1]}`;
      if (!coordinateGroups.has(coordKey)) {
        coordinateGroups.set(coordKey, []);
      }
      coordinateGroups.get(coordKey).push(resort);
    });

    let spreadCount = 0;

    // Process groups with multiple resorts (overlapping)
    for (const [coordKey, group] of coordinateGroups) {
      if (group.length > 1) {
        console.log(`📍 Found ${group.length} resorts at ${coordKey}`);

        // Keep the first resort at original coordinates, spread others
        for (let i = 1; i < group.length; i++) {
          const resort = group[i];

          // Create realistic random offset (not circular pattern)
          const maxOffset = 0.01; // ~1km max offset
          const offsetLng = (Math.random() - 0.5) * maxOffset;
          const offsetLat = (Math.random() - 0.5) * maxOffset;

          const newCoordinates = [
            resort.coordinates[0] + offsetLng,
            resort.coordinates[1] + offsetLat
          ];

          await GeocodeCache.findByIdAndUpdate(resort._id, {
            coordinates: newCoordinates,
            formattedAddress: `${resort.formattedAddress} (spread ${i})`
          });

          console.log(`📍 Spread ${resort.resortName}: [${newCoordinates[0].toFixed(6)}, ${newCoordinates[1].toFixed(6)}]`);
          spreadCount++;
        }
      }
    }

    res.json({
      success: true,
      message: 'Spread overlapping coordinates',
      stats: {
        totalResorts: resorts.length,
        overlappingGroups: Array.from(coordinateGroups.values()).filter(g => g.length > 1).length,
        resortsSpread: spreadCount
      }
    });

  } catch (error) {
    console.error('❌ Error spreading coordinates:', error);
    res.status(500).json({
      success: false,
      message: 'Error spreading coordinates',
      error: error.message
    });
  }
});

// POST /api/resorts/fix-circular-patterns - Remove artificial circular patterns and re-geocode
router.post('/fix-circular-patterns', protect, isAdmin, async (req, res) => {
  try {
    console.log('🔧 Fixing artificial circular patterns...');

    const resorts = await GeocodeCache.find({
      $or: [
        { formattedAddress: /\(spread \d+\)/ },
        { qualityScore: { $lt: 40 } }
      ]
    });

    console.log(`Found ${resorts.length} resorts with potential artificial coordinates`);

    let fixedCount = 0;

    // Clear artificial coordinates and re-geocode
    for (const resort of resorts) {
      console.log(`🔄 Re-geocoding ${resort.resortName}...`);

      // Delete the artificial entry
      await GeocodeCache.findByIdAndDelete(resort._id);
      fixedCount++;
    }

    res.json({
      success: true,
      message: 'Fixed circular patterns - coordinates cleared for re-geocoding',
      stats: {
        artificialCoordsRemoved: fixedCount,
        message: 'Run populate-coordinates to get fresh geocoding results'
      }
    });

  } catch (error) {
    console.error('❌ Error fixing circular patterns:', error);
    res.status(500).json({
      success: false,
      message: 'Error fixing circular patterns',
      error: error.message
    });
  }
});

// DELETE /api/resorts/clear - Clear all cached resort coordinates
router.delete('/clear', protect, isAdmin, async (req, res) => {
  try {
    const result = await GeocodeCache.deleteMany({});
    res.json({
      success: true,
      message: `Cleared ${result.deletedCount} cached resort coordinates`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error clearing resort cache:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing resort cache',
      error: error.message
    });
  }
});

// GET /api/resorts/geocode?name=resortName - Get coordinates for a specific resort
router.get('/geocode', async (req, res) => {
  try {
    const resortName = req.query.name;
    
    if (!resortName) {
      return res.status(400).json({
        success: false,
        message: 'Resort name is required'
      });
    }

    console.log(`🔍 Looking up coordinates for resort: "${resortName}"`);

    // Use the new single-source ResortLocation collection
    // Try exact match first
    let resort = await ResortLocation.findOne({ 
      name: { $regex: `^${resortName.trim()}$`, $options: 'i' } 
    });

    // If no exact match, try partial match
    if (!resort) {
      resort = await ResortLocation.findOne({ 
        name: { $regex: resortName.trim(), $options: 'i' } 
      });
    }

    // If still no match, try finding by any part of the name
    if (!resort) {
      const searchTerms = resortName.trim().split(/\s+/).filter(term => term.length > 2);
      for (const term of searchTerms) {
        resort = await ResortLocation.findOne({ 
          name: { $regex: term, $options: 'i' } 
        });
        if (resort) break;
      }
    }

    if (resort && resort.location && resort.location.coordinates && resort.location.coordinates.length === 2) {
      const coordinates = resort.location.coordinates;
      console.log(`✅ Found exact coordinates for "${resortName}": [${coordinates[0].toFixed(6)}, ${coordinates[1].toFixed(6)}]`);
      console.log(`📍 Source: Single-source master coordinates (resortlocations)`);
      
      res.json({
        success: true,
        coordinates: coordinates,
        resortName: resort.name,
        island: resort.island,
        source: 'resortlocations',
        precision: 'exact',
        coordinateSource: resort.coordinateSource || 'master',
        method: 'single_source_lookup'
      });
    } else {
      console.log(`❌ No coordinates found for resort: "${resortName}"`);
      console.log(`🔍 Available resorts in database:`, await ResortLocation.find({}).select('name island').limit(5));
      
      res.json({
        success: false,
        message: `No coordinates found for resort: ${resortName}`,
        coordinates: null,
        suggestion: 'Check resort name spelling or availability'
      });
    }

  } catch (error) {
    console.error('Error in geocode lookup:', error);
    res.status(500).json({
      success: false,
      message: 'Error looking up resort coordinates',
      error: error.message
    });
  }
});

// GET /api/resorts/test-resort/:name - Test matching for a specific resort
router.get('/test-resort/:name', protect, isAdmin, async (req, res) => {
  try {
    const resortName = req.params.name;

    const [resort, amiTravelPackages, holidayGoGoPackages] = await Promise.all([
      GeocodeCache.findOne({ resortName: { $regex: resortName, $options: 'i' } }),
      require('../models/amiTravelSchema').find({}),
      require('../models/holidayGoGoGoSchema').HolidayGoGoPackage.find({})
    ]);

    const allPackages = [
      ...amiTravelPackages.map(pkg => ({ ...pkg.toObject(), source: 'AmiTravel' })),
      ...holidayGoGoPackages.map(pkg => ({ ...pkg.toObject(), source: 'HolidayGoGo' }))
    ];

    const directMatches = allPackages.filter(pkg =>
      pkg.resort?.toLowerCase().includes(resortName.toLowerCase())
    );

    res.json({
      success: true,
      resort: resort ? {
        name: resort.resortName,
        island: resort.island,
        coordinates: resort.coordinates
      } : null,
      totalPackages: allPackages.length,
      directMatches: directMatches.length,
      matches: directMatches.map(p => ({
        resort: p.resort,
        title: p.title,
        source: p.source
      }))
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/resorts/debug-matching - Debug resort-package matching
router.get('/debug-matching', protect, isAdmin, async (req, res) => {
  try {
    const AmiTravel = require('../models/amiTravelSchema');
    const { HolidayGoGoPackage } = require('../models/holidayGoGoGoSchema');

    const [resorts, amiTravelPackages, holidayGoGoPackages] = await Promise.all([
      GeocodeCache.find({}).select('resortName island coordinates formattedAddress'),
      AmiTravel.find({}).select('resort destination title'),
      HolidayGoGoPackage.find({}).select('resort destination title')
    ]);

    const allPackages = [
      ...amiTravelPackages.map(pkg => ({ ...pkg.toObject(), source: 'AmiTravel' })),
      ...holidayGoGoPackages.map(pkg => ({ ...pkg.toObject(), source: 'HolidayGoGo' }))
    ];

    // Test matching for each resort
    const matchingResults = resorts.map(resort => {
      const directMatches = allPackages.filter(pkg =>
        pkg.resort?.toLowerCase().includes(resort.resortName.toLowerCase())
      );

      const fuzzyMatches = allPackages.filter(pkg => {
        if (!pkg.resort) return false;
        const resortWords = resort.resortName.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        const packageWords = pkg.resort.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        return resortWords.some(w => packageWords.some(pw => pw.includes(w) || w.includes(pw)));
      });

      return {
        resort: resort.resortName,
        island: resort.island,
        directMatches: directMatches.length,
        fuzzyMatches: fuzzyMatches.length,
        sampleMatches: directMatches.slice(0, 2).map(p => ({ resort: p.resort, title: p.title }))
      };
    });

    res.json({
      success: true,
      totalResorts: resorts.length,
      totalPackages: allPackages.length,
      matchingResults: matchingResults.slice(0, 20), // First 20 for debugging
      packageResorts: [...new Set(allPackages.map(p => p.resort).filter(r => r))].slice(0, 20)
    });

  } catch (error) {
    console.error('❌ Error debugging matching:', error);
    res.status(500).json({
      success: false,
      message: 'Error debugging matching',
      error: error.message
    });
  }
});

// GET /api/resorts/debug - Debug resort coordinates by island
router.get('/debug', protect, isAdmin, async (req, res) => {
  try {
    const resorts = await GeocodeCache.find({}).select('resortName island coordinates formattedAddress');

    // Group by island and analyze coordinates
    const analysis = {};
    const genericCoords = [112.5, 2.5];

    resorts.forEach(resort => {
      const island = resort.island || 'Unknown';
      if (!analysis[island]) {
        analysis[island] = {
          total: 0,
          generic: 0,
          specific: 0,
          resorts: []
        };
      }

      analysis[island].total++;
      const isGeneric = resort.coordinates[0] === genericCoords[0] && resort.coordinates[1] === genericCoords[1];

      if (isGeneric) {
        analysis[island].generic++;
      } else {
        analysis[island].specific++;
      }

      analysis[island].resorts.push({
        name: resort.resortName,
        coordinates: resort.coordinates,
        address: resort.formattedAddress,
        isGeneric
      });
    });

    res.json({
      success: true,
      totalResorts: resorts.length,
      analysis,
      genericCoordinates: genericCoords
    });
  } catch (error) {
    console.error('Error debugging resorts:', error);
    res.status(500).json({
      success: false,
      message: 'Error debugging resorts',
      error: error.message
    });
  }
});

router.get('/google-reviews', getGoogleReviews);

module.exports = router;