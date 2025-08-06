
import { useState, useEffect } from 'react';
import GoogleMapComponent from '../../components/Map/GoogleMapComponent';
import SearchBar from '../../components/packages/SearchBar';
import api from '../../utils/apiConfig';
import './MapPage.css';


const MapPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch search suggestions on component mount
  useEffect(() => {
    const fetchSearchSuggestions = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/resorts/search-suggestions');
        if (response.data.success) {
          setSearchSuggestions(response.data.suggestions);
        }
      } catch (error) {
        console.error('Error fetching search suggestions:', error);
        // Fallback to basic suggestions if API fails
        setSearchSuggestions(['Redang', 'Perhentian', 'Tioman', 'Langkawi', 'Penang']);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchSuggestions();
  }, []);
  return (
    <div className="map-page min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-blue-200 relative overflow-hidden">
      {/* Decorative SVG/shape top left */}
      <div className="absolute top-0 left-0 w-40 h-40 opacity-20 z-0">
        {/* Add a playful SVG blob or cloud here */}
        {/* Example: <img src="/images/decor/blob-map.svg" alt="decor" /> */}
      </div>
      {/* Decorative SVG/shape bottom right */}
      <div className="absolute bottom-0 right-0 w-56 h-56 opacity-20 z-0">
        {/* Add a playful SVG wave or cloud here */}
        {/* Example: <img src="/images/decor/wave-map.svg" alt="decor" /> */}
      </div>
      <div className="page-header relative z-10 text-center py-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 mb-2 drop-shadow-md">
          Malaysia Island Travel Packages
        </h1>
        <p className="text-lg text-blue-700">
          Click on an island marker to view available travel packages for that destination
        </p>
      </div>
      <div className="flex justify-center z-20 relative mb-4">
        <div className="w-full max-w-xl">
          <SearchBar
            placeholder="Search resort or package on the map..."
            onSearch={setSearchQuery}
            suggestions={searchSuggestions}
          />
          {loading && (
            <div className="text-center mt-2">
              <span className="text-sm text-blue-600">Loading search suggestions...</span>
            </div>
          )}
        </div>
      </div>
      <div className="map-content relative z-10">
        <GoogleMapComponent searchQuery={searchQuery} />
      </div>
    </div>
  );
};

export default MapPage; 