import React, { useState } from 'react';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';

const CoordinateDebugger = ({ coordinates, resortName }) => {
  const [mapCenter, setMapCenter] = useState(null);
  const [markerPos, setMarkerPos] = useState(null);
  
  if (!coordinates || coordinates.length !== 2) {
    return <div>No coordinates to debug</div>;
  }
  
  const [lng, lat] = coordinates;
  const center = { lat, lng };
  
  return (
    <div style={{ 
      border: '2px solid #007bff', 
      borderRadius: '8px', 
      padding: '15px', 
      margin: '10px 0',
      backgroundColor: '#f8f9fa'
    }}>
      <h4 style={{ color: '#007bff', marginBottom: '10px' }}>
        🔧 Coordinate Debugger: {resortName}
      </h4>
      
      {/* Coordinate Information */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '15px',
        marginBottom: '15px'
      }}>
        <div>
          <strong>Database Coordinates:</strong>
          <div style={{ fontFamily: 'monospace', backgroundColor: 'white', padding: '8px', borderRadius: '4px' }}>
            [{lng}, {lat}]
          </div>
          <small>Format: [longitude, latitude]</small>
        </div>
        
        <div>
          <strong>Map Objects:</strong>
          <div style={{ fontFamily: 'monospace', backgroundColor: 'white', padding: '8px', borderRadius: '4px' }}>
            Center: {`{lat: ${lat}, lng: ${lng}}`}<br/>
            Marker: {`{lat: ${lat}, lng: ${lng}}`}
          </div>
          <small>Both should be identical</small>
        </div>
      </div>
      
      {/* Alignment Check */}
      <div style={{ marginBottom: '15px' }}>
        <strong>Alignment Status:</strong>
        <div style={{ 
          color: center.lat === lat && center.lng === lng ? 'green' : 'red',
          fontWeight: 'bold'
        }}>
          {center.lat === lat && center.lng === lng ? '✅ Perfect Alignment' : '❌ Misaligned'}
        </div>
      </div>
      
      {/* Live Map for Testing */}
      <div style={{ height: '300px', border: '1px solid #ddd', borderRadius: '4px' }}>
        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
          <Map
            style={{ width: '100%', height: '100%' }}
            defaultCenter={center}
            defaultZoom={16}
            gestureHandling="greedy"
            onLoad={(map) => {
              console.log('🔧 Debug map loaded');
              setMapCenter(center);
              setMarkerPos(center);
            }}
            onCenterChanged={(e) => {
              if (e.detail && e.detail.center) {
                setMapCenter(e.detail.center);
              }
            }}
          >
            <Marker 
              position={center}
              title={`Debug Marker - ${resortName}`}
              onClick={() => {
                console.log('🔧 Debug marker clicked at:', center);
                alert(`Marker Position: ${lat}, ${lng}\nClick OK to open in Google Maps`);
                window.open(`https://www.google.com/maps?q=${lat},${lng}&z=17`, '_blank');
              }}
            />
          </Map>
        </APIProvider>
      </div>
      
      {/* Real-time Status */}
      <div style={{ marginTop: '10px', fontSize: '12px' }}>
        <div><strong>Map Center:</strong> {mapCenter ? `${mapCenter.lat}, ${mapCenter.lng}` : 'Loading...'}</div>
        <div><strong>Marker Position:</strong> {markerPos ? `${markerPos.lat}, ${markerPos.lng}` : 'Loading...'}</div>
        <div><strong>Google Maps Link:</strong> 
          <a href={`https://www.google.com/maps?q=${lat},${lng}&z=17`} target="_blank" rel="noopener noreferrer">
            Open in Google Maps
          </a>
        </div>
      </div>
    </div>
  );
};

export default CoordinateDebugger;
