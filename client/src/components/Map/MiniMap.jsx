import React, { useEffect, useRef } from 'react';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';

const MiniMap = ({ coordinates, resortName }) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  
  // Enhanced coordinate validation
  if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
    console.warn('MiniMap: Invalid coordinates provided:', coordinates);
    return (
      <div style={{ 
        width: '100%', 
        height: 200, 
        borderRadius: 8, 
        background: '#f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#666'
      }}>
        No location data available
      </div>
    );
  }

  const [lng, lat] = coordinates;

  // Validate coordinate values
  if (typeof lng !== 'number' || typeof lat !== 'number') {
    console.warn('MiniMap: Coordinates must be numbers:', { lng, lat });
    return null;
  }

  // Validate coordinate bounds
  if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
    console.warn('MiniMap: Coordinates out of valid bounds:', { lng, lat });
    return null;
  }

  const center = { lat, lng };
  const markerPosition = { lat, lng }; // Explicit marker position
  
  console.log(`🗺️ MiniMap rendering for ${resortName}:`, { 
    center, 
    markerPosition,
    coordinates,
    coordinatesMatch: center.lat === markerPosition.lat && center.lng === markerPosition.lng,
    googleMapsUrl: `https://www.google.com/maps?q=${lat},${lng}&z=15`
  });

  // Force re-render when coordinates change
  useEffect(() => {
    if (mapRef.current && coordinates) {
      console.log(`🔄 Coordinates changed for ${resortName}, updating map...`);
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.setCenter(center);
          mapRef.current.setZoom(16);
          console.log(`✅ Map re-centered to new coordinates:`, center);
        }
      }, 100);
    }
  }, [coordinates, center, resortName]);

  return (
    <div style={{ 
      width: '100%', 
      height: 200, 
      borderRadius: 8, 
      overflow: 'hidden', 
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      position: 'relative'
    }}>
      {/* Enhanced debug overlay with precision info */}
      <div style={{
        position: 'absolute',
        top: 5,
        left: 5,
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '4px 8px',
        borderRadius: 4,
        fontSize: '9px',
        zIndex: 1000,
        fontFamily: 'monospace'
      }}>
        <div>{lat.toFixed(6)}, {lng.toFixed(6)}</div>
        <div style={{ fontSize: '8px', opacity: 0.8 }}>
          Precision: {lng.toString().split('.')[1]?.length || 0}dp
        </div>
        <div style={{ fontSize: '8px', opacity: 0.8 }}>
          Accuracy: ~{Math.pow(10, -(lng.toString().split('.')[1]?.length || 0)) * 111000}m
        </div>
      </div>
      
      <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
        <Map
          style={{ width: '100%', height: '100%' }}
          defaultCenter={center}
          defaultZoom={15}
          gestureHandling="greedy"
          disableDefaultUI={true}
          onLoad={(map) => {
            mapRef.current = map;
            console.log(`📍 Map loaded for ${resortName} at:`, center);
            console.log(`🎯 Marker will be placed at:`, markerPosition);
            // Force center and ensure marker alignment
            setTimeout(() => {
              if (mapRef.current) {
                mapRef.current.setCenter(center);
                mapRef.current.setZoom(16); // Higher zoom for better precision
                console.log(`🔄 Map re-centered to:`, center);
              }
            }, 500);
          }}
        >
          <Marker 
            ref={markerRef}
            position={markerPosition}
            title={`${resortName} - Precise Location [${lng.toFixed(6)}, ${lat.toFixed(6)}]`}
            clickable={true}
            onClick={() => {
              console.log(`📍 Marker clicked for ${resortName} at:`, markerPosition);
              // Open Google Maps in new tab for verification
              window.open(`https://www.google.com/maps?q=${lat},${lng}&z=17`, '_blank');
            }}
          />
        </Map>
      </APIProvider>
    </div>
  );
};

export default MiniMap;
