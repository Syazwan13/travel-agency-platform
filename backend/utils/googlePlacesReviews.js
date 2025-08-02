const axios = require('axios');

async function getGoogleReviews(placeName, apiKey, maxReviews = 10) {
  // 1. Find place_id
  const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json`;
  const searchParams = {
    input: placeName,
    inputtype: 'textquery',
    fields: 'place_id',
    key: apiKey
  };
  const searchResp = await axios.get(searchUrl, { params: searchParams });
  console.log('Google Place Search API response:', JSON.stringify(searchResp.data, null, 2));
  const candidates = searchResp.data.candidates;
  if (!candidates || candidates.length === 0) return [];
  const placeId = candidates[0].place_id;

  // 2. Get place details (including reviews)
  const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json`;
  const detailsParams = {
    place_id: placeId,
    fields: 'name,rating,reviews',
    key: apiKey
  };
  const detailsResp = await axios.get(detailsUrl, { params: detailsParams });
  console.log('Google Place Details API response:', JSON.stringify(detailsResp.data, null, 2));
  const reviews = detailsResp.data.result.reviews || [];

  // 3. Format and return reviews
  return reviews.slice(0, maxReviews).map(r => ({
    name: r.author_name,
    rating: r.rating,
    text: r.text,
    date: r.relative_time_description
  }));
}

module.exports = { getGoogleReviews }; 