import React, { useState } from 'react';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';

const CoordinateComparison = ({ resortName, dbCoordinates }) => {
  const [googleMapsCoords, setGoogleMapsCoords] = useState(null);
  const [manualCoords, setManualCoords] = useState('');
  const [comparisonData, setComparisonData] = useState(null);

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371000; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lng2-lng1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  };

  const handleManualCoordsSubmit = () => {
    try {
      const coords = manualCoords.split(',').map(c => parseFloat(c.trim()));
      if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
        const [newLat, newLng] = coords;
        setGoogleMapsCoords([newLng, newLat]); // Convert to [lng, lat] format
        
        if (dbCoordinates && dbCoordinates.length === 2) {
          const [dbLng, dbLat] = dbCoordinates;
          const distance = calculateDistance(dbLat, dbLng, newLat, newLng);
          const precision = Math.min(
            newLng.toString().split('.')[1]?.length || 0,
            newLat.toString().split('.')[1]?.length || 0
          );
          
          setComparisonData({
            database: { lat: dbLat, lng: dbLng },
            googleMaps: { lat: newLat, lng: newLng },
            distance: distance,
            precision: precision,
            accuracy: Math.pow(10, -precision) * 111000 // Approximate accuracy in meters
          });
        }
      } else {
        alert('Invalid coordinates format. Use: latitude, longitude');
      }
    } catch (error) {
      alert('Error parsing coordinates');
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', margin: '10px 0' }}>
      <h3>Coordinate Comparison: {resortName}</h3>
      
      {/* Database coordinates */}
      <div style={{ marginBottom: '15px' }}>
        <strong>Database Coordinates:</strong>
        {dbCoordinates && dbCoordinates.length === 2 ? (
          <div style={{ fontFamily: 'monospace', backgroundColor: '#f5f5f5', padding: '5px', margin: '5px 0' }}>
            [{dbCoordinates[0]}, {dbCoordinates[1]}]
            <br />
            <small>
              Precision: {dbCoordinates[0].toString().split('.')[1]?.length || 0} decimal places
              <br />
              Accuracy: ~{Math.pow(10, -(dbCoordinates[0].toString().split('.')[1]?.length || 0)) * 111000}m
            </small>
          </div>
        ) : (
          <span style={{ color: 'red' }}>No coordinates found</span>
        )}
      </div>

      {/* Manual coordinate input */}
      <div style={{ marginBottom: '15px' }}>
        <strong>Google Maps Coordinates:</strong>
        <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
          <input
            type="text"
            value={manualCoords}
            onChange={(e) => setManualCoords(e.target.value)}
            placeholder="Enter lat,lng from Google Maps (e.g., 2.823446, 104.145684)"
            style={{ flex: 1, padding: '5px' }}
          />
          <button onClick={handleManualCoordsSubmit} style={{ padding: '5px 10px' }}>
            Compare
          </button>
        </div>
        <small style={{ color: '#666' }}>
          Get coordinates from Google Maps: Right-click location → Copy coordinates
        </small>
      </div>

      {/* Comparison results */}
      {comparisonData && (
        <div style={{ marginBottom: '15px', backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '5px' }}>
          <strong>Comparison Results:</strong>
          <div style={{ fontFamily: 'monospace', fontSize: '12px' }}>
            <div>📍 Database: [{comparisonData.database.lng}, {comparisonData.database.lat}]</div>
            <div>🗺️  Google Maps: [{comparisonData.googleMaps.lng}, {comparisonData.googleMaps.lat}]</div>
            <div style={{ color: comparisonData.distance < 100 ? 'green' : comparisonData.distance < 1000 ? 'orange' : 'red' }}>
              📏 Distance: {comparisonData.distance.toFixed(2)}m
            </div>
            <div>🎯 New Precision: {comparisonData.precision} decimal places (~{comparisonData.accuracy.toFixed(1)}m accuracy)</div>
          </div>
        </div>
      )}

      {/* Side-by-side maps */}
      {dbCoordinates && googleMapsCoords && (
        <div style={{ display: 'flex', gap: '10px', height: '300px' }}>
          <div style={{ flex: 1 }}>
            <h4>Database Location</h4>
            <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
              <Map
                style={{ width: '100%', height: '250px' }}
                defaultCenter={{ lat: dbCoordinates[1], lng: dbCoordinates[0] }}
                defaultZoom={16}
              >
                <Marker 
                  position={{ lat: dbCoordinates[1], lng: dbCoordinates[0] }}
                  title="Database Location"
                />
              </Map>
            </APIProvider>
          </div>
          
          <div style={{ flex: 1 }}>
            <h4>Google Maps Location</h4>
            <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
              <Map
                style={{ width: '100%', height: '250px' }}
                defaultCenter={{ lat: googleMapsCoords[1], lng: googleMapsCoords[0] }}
                defaultZoom={16}
              >
                <Marker 
                  position={{ lat: googleMapsCoords[1], lng: googleMapsCoords[0] }}
                  title="Google Maps Location"
                />
              </Map>
            </APIProvider>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div style={{ marginTop: '15px', fontSize: '12px', color: '#666' }}>
        <strong>How to get precise coordinates from Google Maps:</strong>
        <ol>
          <li>Open Google Maps and search for the resort</li>
          <li>Right-click on the exact location</li>
          <li>Click "What's here?" or copy coordinates directly</li>
          <li>Paste the coordinates in the format: latitude, longitude</li>
        </ol>
      </div>
    </div>
  );
};

export default CoordinateComparison;
