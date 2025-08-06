const asyncHandler = require('express-async-handler');
const { getGoogleReviews: getGooglePlacesReviews } = require('../utils/googlePlacesReviews');

function extractResortName(fullTitle) {
  // Remove anything in parentheses
  let name = fullTitle.replace(/\(.*?\)/g, '');
  // Remove duration like 2d1n
  name = name.replace(/\d+d\d+n/gi, '');
  // Remove common promo/extra words
  name = name.replace(/package|promo|snorkeling|escape|tour|room|ferry|team building|diving|holiday|beach|teambuilding/gi, '');
  // Remove common island names
  name = name.replace(/perhentian|redang|tioman|langkawi|pangkor|kapas|besar|besar island|island/gi, '');
  // Only keep up to the last Resort/Hotel/Chalet/Villa/Inn/Lodge
  const match = name.match(/([A-Za-z\s]+?(Resort|Hotel|Chalet|Villa|Inn|Lodge))/i);
  if (match) return match[0].replace(/\s+/g, ' ').trim();
  // Fallback: remove extra spaces and return
  return name.replace(/\s+/g, ' ').trim();
}

// @desc    Get Google reviews for a resort
// @route   GET /api/resorts/google-reviews?name=Resort+Name
// @access  Public
const getGoogleReviews = async (req, res) => {
  const fullName = req.query.name;
  if (!fullName) return res.status(400).json({ error: 'Missing resort name' });
  
  const name = extractResortName(fullName);
  console.log(`🔍 Getting Google reviews for: "${name}" (original: "${fullName}")`);
  
  try {
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ Google API key not configured');
      return res.json({ reviews: [], error: 'Google API key not configured', usedName: name });
    }
    
    const reviews = await getGooglePlacesReviews(name, apiKey, 10);
    console.log(`✅ Found ${reviews.length} Google reviews for "${name}"`);
    res.json({ reviews, usedName: name });
    
  } catch (err) {
    console.error('❌ Google Reviews API Error:', err.message || err);
    
    // Return empty reviews instead of error to avoid breaking the UI
    res.json({ 
      reviews: [], 
      error: 'Failed to fetch Google reviews',
      details: err.message || err.toString(),
      usedName: name 
    });
  }
};

module.exports = { getGoogleReviews }; 