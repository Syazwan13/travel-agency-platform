import { useState, useEffect, useMemo } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import api from '../../utils/apiConfig';
import './MapComponent.css';

const formatPrice = (price) => {
  if (!price) return 'Price on request';
  
  // If price already contains "RM", return as is
  if (price.toString().includes('RM')) {
    return price;
  }
  
  // Otherwise, extract number and add RM prefix
  const numericPrice = parseFloat(price.replace(/[^0-9.]/g, ''));
  return !isNaN(numericPrice) ? `RM ${numericPrice.toFixed(2)}` : price;
};

// Enhanced package matching function with better precision
const findStrictPackageMatches = (resort, allPackages) => {
  // Add null checks
  if (!resort || !resort.name || !Array.isArray(allPackages)) {
    console.warn('Invalid input to findStrictPackageMatches:', { resort, packagesCount: allPackages?.length });
    return [];
  }

  return allPackages.filter(pkg => {
    if (!pkg || !pkg.resort) return false;
    
    const resortName = resort.name.toLowerCase().trim();
    const packageResort = pkg.resort.toLowerCase().trim();
    
    // 1. Exact match (highest priority)
    if (packageResort === resortName) {
      return true;
    }
    
    // 2. Exact match ignoring common suffixes/prefixes
    const cleanResortName = resortName
      .replace(/\b(resort|hotel|beach|island|spa|dive|chalet|the)\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    const cleanPackageResort = packageResort
      .replace(/\b(resort|hotel|beach|island|spa|dive|chalet|the)\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (cleanPackageResort === cleanResortName && cleanResortName.length > 3) {
      return true;
    }
    
    // 3. Very strict substring match (only if one is clearly contained in the other)
    if (resortName.length > 8 && packageResort.includes(resortName)) {
      return true;
    }
    if (packageResort.length > 8 && resortName.includes(packageResort)) {
      return true;
    }
    
    return false;
  });
};

// Enhanced filtering to prioritize high-quality coordinates
const getFilteredResorts = (resorts, allPackages) => {
  if (!Array.isArray(resorts) || !Array.isArray(allPackages)) {
    console.warn('Invalid input to getFilteredResorts:', { resortsCount: resorts?.length, packagesCount: allPackages?.length });
    return [];
  }

  return resorts.filter(resort => {
    if (!resort || !resort.name) return false;
    
    // Remove generic/suspicious resort names
    const name = resort.name.toLowerCase();
    if (name === 'destinations' || name === 'resort' || name.length < 4 || /^\d+$/.test(name)) {
      return false;
    }
    
    // Check if resort has strict package matches
    const packages = findStrictPackageMatches(resort, allPackages);
    return packages.length > 0;
  }).sort((a, b) => {
    // Sort by coordinate quality (higher quality first)
    const qualityA = a?.qualityScore || 0;
    const qualityB = b?.qualityScore || 0;
    return qualityB - qualityA;
  });
};

// Function to determine marker color based on provider(s)
const PROVIDER_COLORS = {
  AmiTravel: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  HolidayGoGoGo: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  PulauMalaysia: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  Multi: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
};

const getResortProviders = (resort, allPackages) => {
  if (!resort || !Array.isArray(allPackages)) {
    console.warn('Invalid input to getResortProviders:', { resort, packagesCount: allPackages?.length });
    return [];
  }

  const matches = findStrictPackageMatches(resort, allPackages);
  const providers = new Set();
  matches.forEach(pkg => {
    if (pkg && pkg.source) providers.add(pkg.source);
  });
  return Array.from(providers);
};

const getMarkerColor = (resort, allPackages) => {
  if (!resort) {
    console.warn('Invalid resort provided to getMarkerColor');
    return PROVIDER_COLORS.Multi;
  }

  const providers = getResortProviders(resort, allPackages);
  if (providers.length > 1) return PROVIDER_COLORS.Multi;
  if (providers[0] === 'AmiTravel') return PROVIDER_COLORS.AmiTravel;
  if (providers[0] === 'HolidayGoGoGo') return PROVIDER_COLORS.HolidayGoGoGo;
  if (providers[0] === 'PulauMalaysia') return PROVIDER_COLORS.PulauMalaysia;
  return PROVIDER_COLORS.Multi;
};

// Function to get marker size based on package count
const getMarkerSize = (packageCount) => {
  if (packageCount >= 10) return { width: 35, height: 51 }; // Large for many packages
  if (packageCount >= 5) return { width: 30, height: 46 };  // Medium for some packages
  return { width: 25, height: 41 }; // Default size
};

// Malaysia islands with enhanced bounds
const islandLocations = [
 
  {
    id: 2,
    name: 'Pulau Tioman',
    position: { lat: 2.7914, lng: 104.1710 },
    description: 'Beautiful island off the east coast of Peninsular Malaysia, known for its pristine beaches and diving opportunities.',
    searchTerm: 'tioman',
    bounds: { north: 2.8914, south: 2.6914, east: 104.2710, west: 104.0710 },
  },
  {
    id: 3,
    name: 'Pulau Redang',
    position: { lat: 5.7833, lng: 103.0167 },
    description: 'One of the largest islands off the east coast of Malaysia, known for its crystal clear waters and coral reefs.',
    searchTerm: 'redang',
    bounds: { north: 5.8833, south: 5.6833, east: 103.1167, west: 102.9167 },
  },
  {
    id: 4,
    name: 'Pulau Perhentian',
    position: { lat: 5.9000, lng: 102.7333 },
    description: 'A small group of beautiful, coral-fringed islands off the coast of northeastern Malaysia.',
    searchTerm: 'perhentian',
    bounds: { north: 6.0000, south: 5.8000, east: 102.8333, west: 102.6333 },
  },
];

const PackageCard = ({ pkg }) => (
  <div className="sidebar-package-card">
    <div className="package-header">
      <h4>{pkg.title || pkg.resort}</h4>
      <span className={`package-source-badge ${pkg.source?.toLowerCase()}`}>{pkg.source}</span>
    </div>
    {pkg.image && (
      <img
        src={pkg.image}
        alt={pkg.title || pkg.resort}
        className="package-card-image"
        onError={(e) => (e.target.style.display = 'none')}
      />
    )}
    <div className="package-card-details">
      <p className="package-card-price">{formatPrice(pkg.price)}</p>
      <p className="package-card-description">{pkg.description}</p>
      <a href={pkg.link} target="_blank" rel="noopener noreferrer" className="package-card-link">
        View Details
      </a>
    </div>
  </div>
);

const MapInner = ({ 
  mapCenter, 
  mapZoom, 
  transformedResorts, 
  allPackages, 
  selectedMarker, 
  infoWindowContent, 
  onIslandClick, 
  onResortClick,
  searchQuery,
  mapKey
}) => {
  const [selectedMarkerState, setSelectedMarker] = useState(null);
  const [infoWindowContentState, setInfoWindowContent] = useState(null);

  // Update local state when props change
  useEffect(() => {
    setSelectedMarker(selectedMarker);
    setInfoWindowContent(infoWindowContent);
  }, [selectedMarker, infoWindowContent]);

  const handleIslandMarkerClick = (island) => {
    onIslandClick(island);
  };

  const handleResortMarkerClick = (resort) => {
    console.log('🏨 Resort clicked:', resort.name, 'Island:', resort.island);
    console.log('📦 Total packages available:', allPackages.length);
    
    // Use strict package matching
    const resortPackages = findStrictPackageMatches(resort, allPackages);
    
    console.log('🎯 Strict packages found for', resort.name, ':', resortPackages.length);
    resortPackages.slice(0, 3).forEach(pkg => {
      console.log('  - Package:', pkg.resort, '| Title:', pkg.title?.substring(0, 40));
    });

    // Call the parent's onResortClick handler instead
    onResortClick(resort, resortPackages);
  };

  const handleInfoWindowClose = () => {
    setSelectedMarker(null);
    setInfoWindowContent(null);
  };

  const handleViewPackagesClick = (resort, packages) => {
    onResortClick(resort, packages);
    handleInfoWindowClose();
  };

  return (
    <div style={{ position: 'relative' }}>
      <Map
        key={mapKey}
        style={{ height: '500px', width: '100%' }}
        defaultCenter={mapCenter}
        defaultZoom={mapZoom}
        gestureHandling={'greedy'}
        disableDefaultUI={false}
        mapId={import.meta.env.VITE_GOOGLE_MAPS_MAP_ID}
      >
      {/* Island markers */}
      {islandLocations.map(island => (
        <AdvancedMarker
          key={`island-${island.id}`}
          position={island.position}
          title={island.name}
          onClick={() => handleIslandMarkerClick(island)}
        >
          <Pin background={'#1976d2'} borderColor={'#0d47a1'} glyphColor={'#fff'} />
        </AdvancedMarker>
      ))}

      {/* Resort markers - Enhanced with quality indicators */}
      {transformedResorts.length === 0 && searchQuery && searchQuery.trim() && (
        <div style={{position:'absolute',top:80,left:'50%',transform:'translateX(-50%)',zIndex:1000,background:'#fff',padding:'10px 20px',borderRadius:8,boxShadow:'0 2px 8px rgba(0,0,0,0.08)',color:'#c00',fontWeight:'bold'}}>
          No results found for "{searchQuery}"
        </div>
      )}
      {transformedResorts.map((resort, idx) => {
        if (resort.coordinates && resort.coordinates.length === 2) {
          // Get package count for this resort
          const packageCount = findStrictPackageMatches(resort, allPackages).length;
          const providers = getResortProviders(resort, allPackages);
          let pinColor = '#7e57c2';
          let borderColor = '#4527a0';
          
          // Since we're only showing filtered results, all markers are relevant to search
          // Highlight based on search query relevance or provider
          let highlight = false;
          if (searchQuery && searchQuery.trim()) {
            highlight = true; // All shown markers are search results
            pinColor = '#ff4081'; // pink highlight for search results
            borderColor = '#c51162';
          } else if (providers.length > 1) {
            pinColor = '#8e24aa';
            borderColor = '#4a148c';
          } else if (providers[0] === 'AmiTravel') {
            pinColor = '#388e3c';
            borderColor = '#1b5e20';
          } else if (providers[0] === 'HolidayGoGoGo') {
            pinColor = '#fbc02d';
            borderColor = '#e65100';
          } else if (providers[0] === 'PulauMalaysia') {
            pinColor = '#1976d2';
            borderColor = '#0d47a1';
          }
          
          return (
            <AdvancedMarker
              key={resort.id}
              position={{ lat: resort.coordinates[1], lng: resort.coordinates[0] }}
              title={`${resort.name} (${packageCount} packages, Providers: ${providers.join(', ')})`}
              onClick={() => handleResortMarkerClick(resort)}
            >
              <Pin background={pinColor} borderColor={borderColor} glyphColor={'#fff'} />
            </AdvancedMarker>
          );
        }
        return null;
      })}

      {/* Info Window */}
      {selectedMarkerState && infoWindowContentState && (
        <InfoWindow
          position={
            infoWindowContentState.type === 'island'
              ? infoWindowContentState.data.position
              : { 
                  lat: infoWindowContentState.data.coordinates[1], 
                  lng: infoWindowContentState.data.coordinates[0] 
                }
          }
          onCloseClick={handleInfoWindowClose}
        >
          <div className="info-window-content">
            {infoWindowContentState.type === 'island' ? (
              <div className="island-popup">
                <h3>{infoWindowContentState.data.name}</h3>
                <p>{infoWindowContentState.data.description}</p>
              </div>
            ) : (
              <div className="resort-popup">
                <h3>{infoWindowContentState.data.name}</h3>
                <p className="resort-island">📍 {infoWindowContentState.data.island}</p>
                
                {/* Coordinate Quality Indicator */}
                <div className="coordinate-quality" style={{ 
                  marginBottom: '8px', 
                  padding: '4px 8px', 
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  backgroundColor: infoWindowContentState.data.qualityScore >= 80 ? '#d4edda' : 
                                   infoWindowContentState.data.qualityScore >= 50 ? '#fff3cd' : '#f8d7da',
                  color: infoWindowContentState.data.qualityScore >= 80 ? '#155724' : 
                         infoWindowContentState.data.qualityScore >= 50 ? '#856404' : '#721c24',
                  border: '1px solid',
                  borderColor: infoWindowContentState.data.qualityScore >= 80 ? '#c3e6cb' : 
                              infoWindowContentState.data.qualityScore >= 50 ? '#ffeaa7' : '#f5c6cb'
                }}>
                  🎯 Location Quality: {infoWindowContentState.data.qualityScore || 'Unknown'}%
                  {infoWindowContentState.data.method && (
                    <span style={{ marginLeft: '5px', opacity: 0.7 }}>
                      ({infoWindowContentState.data.method.replace('_', ' ')})
                    </span>
                  )}
                </div>
                
                <div className="provider-list" style={{ marginBottom: '8px', fontSize: '12px' }}>
                  <strong>Providers:</strong> {getResortProviders(infoWindowContentState.data, allPackages).join(', ')}
                </div>

                <div className="package-count">
                  <strong>{infoWindowContentState.packages.length} packages available</strong>
                </div>
                
                {infoWindowContentState.packages.length > 0 && (
                  <div className="sample-packages" style={{ marginTop: '10px', marginBottom: '10px' }}>
                    <p style={{ fontSize: '12px', fontWeight: 'bold', margin: '5px 0' }}>Sample packages:</p>
                    {infoWindowContentState.packages.slice(0, 3).map((pkg, idx) => (
                      <div key={idx} style={{ fontSize: '11px', marginBottom: '3px', color: '#666' }}>
                        • {pkg.title?.substring(0, 45) || pkg.resort}...
                        <span style={{ color: '#007bff', marginLeft: '5px' }}>
                          ({pkg.source})
                        </span>
                      </div>
                    ))}
                    {infoWindowContentState.packages.length > 3 && (
                      <div style={{ fontSize: '11px', color: '#888', fontStyle: 'italic' }}>
                        ...and {infoWindowContentState.packages.length - 3} more packages
                      </div>
                    )}
                  </div>
                )}
                
                <button
                  className="view-packages-btn"
                  onClick={() => handleViewPackagesClick(infoWindowContentState.data, infoWindowContentState.packages)}
                  style={{ 
                    backgroundColor: infoWindowContentState.packages.length > 0 ? '#007bff' : '#6c757d',
                    cursor: infoWindowContentState.packages.length > 0 ? 'pointer' : 'not-allowed'
                  }}
                >
                  {infoWindowContentState.packages.length > 0 
                    ? `View All ${infoWindowContentState.packages.length} Packages` 
                    : 'No Packages Available'
                  }
                </button>
              </div>
            )}
          </div>
        </InfoWindow>
      )}
      </Map>
      
      {/* Map Legend */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        backgroundColor: 'white',
        padding: '10px',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        fontSize: '12px',
        zIndex: 1000
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>📍 Marker Legend</div>
        <div style={{ marginBottom: '4px' }}>
          <span style={{ color: 'green', fontWeight: 'bold' }}>🟢</span> AmiTravel
        </div>
        <div style={{ marginBottom: '4px' }}>
          <span style={{ color: 'orange', fontWeight: 'bold' }}>🟠</span> HolidayGoGoGo
        </div>
        <div style={{ marginBottom: '4px' }}>
          <span style={{ color: 'blue', fontWeight: 'bold' }}>🔵</span> PulauMalaysia
        </div>
        <div style={{ marginBottom: '8px' }}>
          <span style={{ color: 'purple', fontWeight: 'bold' }}>🟣</span> Multiple Providers
        </div>
        <div style={{ fontSize: '10px', color: '#666', fontStyle: 'italic' }}>
          Size indicates package count
        </div>
      </div>
    </div>
  );
};

const GoogleMapComponent = ({ searchQuery = '' }) => {
  const [selectedIsland, setSelectedIsland] = useState(null);
  const [resorts, setResorts] = useState([]);
  const [allPackages, setAllPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedResort, setSelectedResort] = useState(null);
  const [selectedResortPackages, setSelectedResortPackages] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [infoWindowContent, setInfoWindowContent] = useState(null);

  // Filter and transform resort data
  const transformedResorts = useMemo(() => {
    const filtered = getFilteredResorts(resorts, allPackages);
    return filtered.map(resort => ({
      ...resort,
      coordinates: resort.location?.coordinates || resort.coordinates || []
    }));
  }, [resorts, allPackages]);

  // Function to refresh resort data
  const forceRefreshResortData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/resorts/coordinates', {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (response.status !== 200) {
        throw new Error('Failed to refresh resort data');
      }
      const data = response.data;
      console.log('Refreshed resort data:', data);
      setResorts(data);
      // The transformedResorts memo will automatically update
      setMapKey(prev => prev + 1);
    } catch (error) {
      console.error('Error refreshing resort data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1) Fetch all resorts from geocache (Google Maps API results)
        const resortsRes = await api.get('/api/resorts');
        console.log('Resorts response:', resortsRes.data);
        const resortsData = resortsRes.data.resorts || [];
        
        // 2) Fetch ALL packages (not just those with coordinates)
        const packagesRes = await api.get('/api/packages');
        console.log('Packages response:', packagesRes.data);
        console.log('Number of packages fetched:', packagesRes.data.data.packages?.length || 0);
        const packages = packagesRes.data.data.packages || [];
        
        // Set state - transformedResorts will automatically update
        setAllPackages(packages);
        setResorts(resortsData);

        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load map data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Log coordinates whenever they change
  useEffect(() => {
    if (transformedResorts.length > 0) {
      console.log('Current resort coordinates:');
      transformedResorts.forEach(resort => {
        console.log(`${resort.name}:`, resort.coordinates);
      });
    }
  }, [transformedResorts]);

  const handleIslandClick = (island) => {
    setSelectedIsland(island);
    setShowSidebar(true);
  };

  const handleResortClick = (resort, packages) => {
    setSelectedResort(resort);
    setSelectedResortPackages(packages);
    setSelectedMarker(`resort-${resort.name}`);
    setInfoWindowContent({
      type: 'resort',
      data: resort,
      packages: packages
    });
  };


  // Apply search and island filtering to transformed resorts
  const filteredBySearch = useMemo(() => {
    const searchLower = searchQuery.trim().toLowerCase();
    let filtered = transformedResorts;
    
    if (searchLower) {
      filtered = filtered.filter(resort => {
        // 1. Match resort name (exact or partial)
        if (resort.name.toLowerCase().includes(searchLower)) return true;
        
        // 2. Match island name
        if (resort.island && resort.island.toLowerCase().includes(searchLower)) return true;
        
        // 3. Match resort name without common words (hotel, resort, beach, etc.)
        const cleanResortName = resort.name
          .toLowerCase()
          .replace(/\b(resort|hotel|beach|island|spa|dive|chalet|the|beach|villa|lodge)\b/g, '')
          .replace(/\s+/g, ' ')
          .trim();
        if (cleanResortName.includes(searchLower) || searchLower.includes(cleanResortName)) {
          return true;
        }
        
        // 4. Match any package title or resort field for this resort
        const pkgs = findStrictPackageMatches(resort, allPackages);
        const packageMatch = pkgs.some(pkg => {
          const title = (pkg.title || '').toLowerCase();
          const resortField = (pkg.resort || '').toLowerCase();
          const location = (pkg.location_name || '').toLowerCase();
          
          return title.includes(searchLower) || 
                 resortField.includes(searchLower) || 
                 location.includes(searchLower);
        });
        
        if (packageMatch) return true;
        
        // 5. Match search terms split by spaces (for multi-word searches)
        const searchTerms = searchLower.split(/\s+/).filter(term => term.length > 2);
        if (searchTerms.length > 1) {
          const resortWords = resort.name.toLowerCase().split(/\s+/);
          const islandWords = (resort.island || '').toLowerCase().split(/\s+/);
          const allWords = [...resortWords, ...islandWords];
          
          return searchTerms.every(term => 
            allWords.some(word => word.includes(term))
          );
        }
        
        return false;
      });
    }

    if (selectedIsland) {
      const islandName = selectedIsland.searchTerm.toLowerCase();
      filtered = filtered.filter(resort => {
        const resortIsland = resort.island?.toLowerCase() || '';
        return resortIsland.includes(islandName);
      });
    }

    return filtered;
  }, [transformedResorts, searchQuery, selectedIsland, allPackages]);

  // Auto-zoom to first search result if searching
  const { mapCenter, mapZoom } = useMemo(() => {
    if (selectedIsland) {
      return {
        mapCenter: selectedIsland.position,
        mapZoom: 11
      };
    }
    
    const searchLower = searchQuery.trim().toLowerCase();
    if (searchLower && filteredBySearch.length > 0) {
      const first = filteredBySearch[0];
      if (first.coordinates && first.coordinates.length === 2) {
        return {
          mapCenter: { lat: first.coordinates[1], lng: first.coordinates[0] },
          mapZoom: 13
        };
      }
    }
    
    return {
      mapCenter: { lat: 4.2105, lng: 101.9758 },
      mapZoom: 6
    };
  }, [selectedIsland, searchQuery, filteredBySearch]);

  // Add this before the return statement
  useEffect(() => {
    if (resorts.length > 0) {
      // Log the coordinates for debugging
      console.log('Current resort coordinates:');
      resorts.forEach(resort => {
        if (resort.location && resort.location.coordinates) {
          console.log(`${resort.name}:`, resort.location.coordinates);
        } else if (resort.coordinates) {
          console.log(`${resort.name}:`, resort.coordinates);
        }
      });
    }
  }, [resorts]);

  if (loading) {
    return <div className="loading">Loading map data...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  console.log(`📊 Map Stats: ${resorts.length} total resorts → ${transformedResorts.length} transformed → ${filteredBySearch.length} displayed on map${searchQuery ? ` (filtered by: "${searchQuery}")` : ''}`);

  return (
    <div className="google-map-container">
      <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
        <MapInner
          mapCenter={mapCenter}
          mapZoom={mapZoom}
          transformedResorts={filteredBySearch} // Use filtered results instead of all resorts
          allPackages={allPackages}
          onIslandClick={handleIslandClick}
          onResortClick={handleResortClick}
          searchQuery={searchQuery}
          mapKey={mapKey}
          selectedMarker={selectedMarker}
          infoWindowContent={infoWindowContent}
        />
      </APIProvider>

      {showSidebar && (
        <div className="map-sidebar">
          <div className="sidebar-header">
            <h3>
              {selectedIsland ? selectedIsland.name : selectedResort?.name}
            </h3>
            <button className="close-sidebar" onClick={() => setShowSidebar(false)}>
              ×
            </button>
          </div>
          <div className="sidebar-content">
            {selectedIsland && (
              <div>
                <p>{selectedIsland.description}</p>
                <h4>Resorts on {selectedIsland.name}:</h4>
                <div className="resorts-list">
                  {filteredResorts.map((resort, idx) => (
                    <div key={idx} className="resort-item">
                      <h5>{resort.name}</h5>
                      <p>{resort.address}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {selectedResort && (
              <div>
                <h4>Packages for {selectedResort.name}:</h4>
                <div className="packages-list">
                  {selectedResortPackages.map((pkg, idx) => (
                    <PackageCard key={idx} pkg={pkg} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add refresh button */}
      <button 
        onClick={forceRefreshResortData}
        disabled={isLoading}
        className="absolute top-4 right-4 z-10 bg-white px-3 py-2 rounded-md shadow-md hover:bg-gray-50"
      >
        {isLoading ? 'Refreshing...' : 'Refresh Map'}
      </button>
    </div>
  );
};

export default GoogleMapComponent;
