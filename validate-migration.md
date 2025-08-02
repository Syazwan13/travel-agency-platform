# Google Maps Migration Validation Guide

## Prerequisites

1. **Set up Google Maps API Key:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the following APIs:
     - Maps JavaScript API
     - Geocoding API
   - Create credentials (API Key)
   - Restrict the API key to your domain for security
   - Update environment variables:
     - `backend/.env`: `GOOGLE_MAPS_API_KEY=your_actual_api_key`
     - `client/.env`: `VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key`

## Testing Steps

### 1. Test Backend Geocoding
```bash
cd backend
node test-googlemaps.js
```
Expected: Should show coordinates for Malaysian resort locations using Google Maps API.

### 2. Test Frontend Map Display
```bash
cd client
npm run dev
```
Navigate to the map page and verify:
- Google Maps loads instead of Leaflet
- Island markers appear (blue)
- Resort markers appear (red) 
- Clicking markers shows info windows
- Sidebar functionality works

### 3. Test Geocoding Manager
In the map page:
- Click "Populate Resort Coordinates (Google Maps)"
- Verify coordinates are fetched using Google Maps API
- Check browser console for "Google Maps" references instead of "OpenCage"

### 4. Verify Data Accuracy
Compare coordinates before and after migration:
- Old coordinates (OpenCage) vs New coordinates (Google Maps)
- Check if resort locations are more accurate on the map

## Migration Summary

### What Changed:
- ✅ Backend: OpenCage API → Google Maps Geocoding API
- ✅ Frontend: Leaflet → Google Maps with @vis.gl/react-google-maps
- ✅ Dependencies: Removed leaflet, react-leaflet, opencage-api-client
- ✅ Added: @vis.gl/react-google-maps, @googlemaps/google-maps-services-js
- ✅ Environment: Added Google Maps API key configuration
- ✅ Components: Created GoogleMapComponent, updated GeocodingManager, MapPage
- ✅ Files: Removed old MapComponent.jsx, renamed test-opencage.js to test-googlemaps.js

### What Stayed the Same:
- ✅ Database structure (geocache collection)
- ✅ API endpoints and routes
- ✅ Admin tools functionality
- ✅ Package filtering and display
- ✅ Island navigation and bounds
- ✅ Resort popup information

## Troubleshooting

### Common Issues:
1. **Map not loading**: Check Google Maps API key and enabled APIs
2. **Geocoding errors**: Verify API key has Geocoding API enabled
3. **CORS issues**: Ensure API key domain restrictions are correct
4. **Rate limiting**: Google Maps has different rate limits than OpenCage

### Performance Notes:
- Google Maps generally provides more accurate coordinates
- Better handling of Malaysian locations
- Improved map rendering and interaction
- More reliable geocoding results
