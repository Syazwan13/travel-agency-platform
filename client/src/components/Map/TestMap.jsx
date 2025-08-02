import React from 'react';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';

// Test component to verify coordinates
const TestMap = () => {
  // Known Tioman Island coordinates
  const tiomanCoordinates = [104.1456, 2.8234];
  const [lng, lat] = tiomanCoordinates;
  const center = { lat, lng };

  console.log('🧪 TestMap - Tioman Island coordinates:', center);
  console.log('🧪 Google Maps URL:', `https://www.google.com/maps?q=${lat},${lng}&z=15`);

  return (
    <div style={{ width: '400px', height: '300px', margin: '20px', border: '2px solid #ccc' }}>
      <h3>Test Map - Tioman Island</h3>
      <p>Coordinates: [{lng}, {lat}]</p>
      <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
        <Map
          style={{ width: '100%', height: '250px' }}
          defaultCenter={center}
          defaultZoom={12}
          gestureHandling="greedy"
          onLoad={(map) => {
            console.log('🧪 Test map loaded, forcing center to:', center);
            setTimeout(() => {
              map.setCenter(center);
              map.setZoom(13);
            }, 1000);
          }}
        >
          <AdvancedMarker position={center} title="Tioman Island Test" />
        </Map>
      </APIProvider>
    </div>
  );
};

export default TestMap;
