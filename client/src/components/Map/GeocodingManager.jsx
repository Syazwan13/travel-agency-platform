import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './GeocodingManager.css';

const GeocodingManager = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [resortStats, setResortStats] = useState(null);

  // Only render for admin users
  if (!user || user.role !== 'admin') {
    return null;
  }

  const populateResortCoordinates = async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      console.log('🚀 Starting resort geocoding process with Google Maps...');
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/resorts/populate`);

      if (response.data.success) {
        setResults(response.data);
        console.log('✅ Resort geocoding completed with Google Maps:', response.data);
      } else {
        throw new Error(response.data.message || 'Failed to populate resort coordinates');
      }
    } catch (err) {
      console.error('❌ Resort geocoding error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearResortCache = async () => {
    try {
      const response = await axios.delete(`${import.meta.env.VITE_API_URL}/api/resorts/clear`);
      if (response.data.success) {
        setResults(null);
        setResortStats(null);
        console.log('🧹 Resort cache cleared');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const checkResortStats = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/resorts`);
      setResortStats(response.data);
    } catch (err) {
      console.error('Error fetching resort stats:', err);
    }
  };

  const fixGenericCoordinates = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/resorts/fix-generic`);
      if (response.data.success) {
        setResults(response.data);
        console.log('✅ Fixed generic coordinates:', response.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const spreadOverlapping = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/resorts/spread-overlapping`);
      if (response.data.success) {
        setResults(response.data);
        console.log('✅ Spread overlapping coordinates:', response.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const reGeocodeAllResorts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/resorts/re-geocode-all`);
      if (response.data.success) {
        setResults(response.data);
        console.log('✅ Re-geocoded all resorts:', response.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const improveCoordinateQuality = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/resorts/improve-quality`);
      if (response.data.success) {
        setResults(response.data);
        console.log('✅ Improved coordinate quality:', response.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="geocoding-manager">
      <h3>🗺️ Resort Geocoding Manager (Google Maps)</h3>
      <p>Manage resort coordinates and geocoding operations using Google Maps API</p>

      <div className="geocoding-actions">
        <button
          onClick={reGeocodeAllResorts}
          disabled={loading}
          className="re-geocode-btn"
          style={{ backgroundColor: '#e74c3c', color: 'white', fontWeight: 'bold' }}
        >
          {loading ? '🔄 Re-geocoding All...' : '🎯 Re-geocode All Resorts (REAL LOCATIONS)'}
        </button>

        <button
          onClick={populateResortCoordinates}
          disabled={loading}
          className="populate-btn"
        >
          {loading ? '🔄 Geocoding Resorts...' : '📍 Populate Resort Coordinates (Google Maps)'}
        </button>

        <button
          onClick={fixGenericCoordinates}
          disabled={loading}
          className="fix-btn"
        >
          🔧 Fix Generic Coordinates
        </button>

        <button
          onClick={spreadOverlapping}
          disabled={loading}
          className="spread-btn"
        >
          🎯 Spread Overlapping Resorts
        </button>

        <button
          onClick={clearResortCache}
          disabled={loading}
          className="clear-btn"
        >
          🧹 Clear Resort Cache
        </button>

        <button
          onClick={checkResortStats}
          disabled={loading}
          className="stats-btn"
        >
          📊 Check Resort Stats
        </button>

        <button
          onClick={improveCoordinateQuality}
          disabled={loading}
          className="improve-btn"
          style={{ backgroundColor: '#28a745', color: 'white', fontWeight: 'bold' }}
        >
          {loading ? '⚡ Improving Quality...' : '⚡ Improve Low Quality Coordinates'}
        </button>
      </div>

      {error && (
        <div className="geocoding-error">
          <p>❌ Error: {error}</p>
        </div>
      )}

      {resortStats && (
        <div className="resort-stats">
          <h4>📊 Current Resort Statistics</h4>
          <p>🏨 Total Resorts with Coordinates: <strong>{resortStats.count}</strong></p>
        </div>
      )}

      {results && (
        <div className="geocoding-results">
          <h4>✅ Operation Results</h4>
          <div className="results-summary">
            {results.stats.totalResorts && (
              <div className="result-item">
                <span className="label">Total Resorts:</span>
                <span className="count">{results.stats.totalResorts}</span>
              </div>
            )}
            {results.stats.successCount !== undefined && (
              <div className="result-item success">
                <span className="label">Successfully Geocoded:</span>
                <span className="count">{results.stats.successCount}</span>
              </div>
            )}
            {results.stats.failCount !== undefined && (
              <div className="result-item error">
                <span className="label">Failed to Geocode:</span>
                <span className="count">{results.stats.failCount}</span>
              </div>
            )}
            {results.stats.fixedWithSpecific !== undefined && (
              <div className="result-item success">
                <span className="label">Fixed with Specific Coords:</span>
                <span className="count">{results.stats.fixedWithSpecific}</span>
              </div>
            )}
            {results.stats.fixedWithOffset !== undefined && (
              <div className="result-item">
                <span className="label">Fixed with Offset:</span>
                <span className="count">{results.stats.fixedWithOffset}</span>
              </div>
            )}
            {results.stats.overlappingGroups !== undefined && (
              <div className="result-item">
                <span className="label">Overlapping Groups:</span>
                <span className="count">{results.stats.overlappingGroups}</span>
              </div>
            )}
            {results.stats.resortsSpread !== undefined && (
              <div className="result-item success">
                <span className="label">Resorts Spread:</span>
                <span className="count">{results.stats.resortsSpread}</span>
              </div>
            )}
            {results.stats.beachMatchCount !== undefined && (
              <div className="result-item success">
                <span className="label">Beach Matches:</span>
                <span className="count">{results.stats.beachMatchCount}</span>
              </div>
            )}
            {results.stats.apiSuccessCount !== undefined && (
              <div className="result-item success">
                <span className="label">API Geocoded:</span>
                <span className="count">{results.stats.apiSuccessCount}</span>
              </div>
            )}
            {results.stats.fallbackCount !== undefined && (
              <div className="result-item">
                <span className="label">Fallback Locations:</span>
                <span className="count">{results.stats.fallbackCount}</span>
              </div>
            )}
          </div>

          {results.stats.sources && (
            <div className="source-stats">
              <h5>📦 Package Sources</h5>
              <div className="source-item">
                <span className="source">AmiTravel:</span>
                <span className="count">{results.stats.sources.AmiTravel} packages</span>
              </div>
              <div className="source-item">
                <span className="source">HolidayGoGo:</span>
                <span className="count">{results.stats.sources.HolidayGoGo} packages</span>
              </div>
              <div className="source-item">
                <span className="source">PulauMalaysia:</span>
                <span className="count">{results.stats.sources.PulauMalaysia} packages</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GeocodingManager; 