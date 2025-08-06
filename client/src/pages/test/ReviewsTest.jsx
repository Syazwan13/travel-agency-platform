import React, { useState } from 'react';
import api from '../../utils/apiConfig';

const ReviewsTest = () => {
  const [packageId, setPackageId] = useState('');
  const [userReviews, setUserReviews] = useState(null);
  const [googleReviews, setGoogleReviews] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);

  const addLog = (message, type = 'info') => {
    setLogs(prev => [...prev, { 
      message, 
      type, 
      timestamp: new Date().toLocaleTimeString() 
    }]);
  };

  const testUserReviews = async () => {
    if (!packageId) {
      addLog('Please enter a package ID', 'error');
      return;
    }

    setLoading(true);
    addLog(`Testing user reviews for package: ${packageId}`, 'info');

    try {
      const response = await api.get(`/api/feedback/package/${packageId}`);
      console.log('User reviews API response:', response.data);
      
      // Handle both array responses and error objects
      if (Array.isArray(response.data)) {
        setUserReviews(response.data);
        addLog(`✅ User reviews API success: ${response.data.length} reviews found`, 'success');
      } else if (response.data && response.data.error) {
        addLog(`❌ User reviews API error: ${response.data.error}`, 'error');
        setUserReviews([]);
      } else {
        addLog(`⚠️ Unexpected response format: ${typeof response.data}`, 'warning');
        setUserReviews(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      addLog(`❌ User reviews API error: ${error.message}`, 'error');
      setUserReviews([]);
      console.error('User reviews error:', error);
    } finally {
      setLoading(false);
    }
  };

  const testGoogleReviews = async () => {
    if (!packageId) {
      addLog('Please enter a package ID', 'error');
      return;
    }

    setLoading(true);
    addLog(`Testing Google reviews for package: ${packageId}`, 'info');

    try {
      // First get package info to extract resort name
      const debugResponse = await api.get(`/api/feedback/debug/${packageId}`);
      const packageInfo = debugResponse.data;
      
      let resortName = 'Test Resort';
      if (packageInfo.results.amiTravel?.found) {
        resortName = packageInfo.results.amiTravel.title;
      } else if (packageInfo.results.holidayGoGo?.found) {
        resortName = packageInfo.results.holidayGoGo.title;
      } else if (packageInfo.results.pulauMalaysia?.found) {
        resortName = packageInfo.results.pulauMalaysia.title;
      }

      addLog(`Using resort name: ${resortName}`, 'info');

      const response = await api.get(`/api/resorts/google-reviews?name=${encodeURIComponent(resortName)}`);
      setGoogleReviews(response.data);
      addLog(`✅ Google reviews API success: ${response.data.reviews?.length || 0} reviews found`, 'success');
      
      if (response.data.error) {
        addLog(`⚠️ Google reviews API warning: ${response.data.error}`, 'warning');
      }
    } catch (error) {
      addLog(`❌ Google reviews API error: ${error.message}`, 'error');
      console.error('Google reviews error:', error);
    } finally {
      setLoading(false);
    }
  };

  const testDebugInfo = async () => {
    if (!packageId) {
      addLog('Please enter a package ID', 'error');
      return;
    }

    setLoading(true);
    addLog(`Getting debug info for package: ${packageId}`, 'info');

    try {
      const response = await api.get(`/api/feedback/debug/${packageId}`);
      setDebugInfo(response.data);
      addLog(`✅ Debug info retrieved successfully`, 'success');
    } catch (error) {
      addLog(`❌ Debug info error: ${error.message}`, 'error');
      console.error('Debug info error:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Reviews System Test</h1>
      
      {/* Input Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Package ID
            </label>
            <input
              type="text"
              value={packageId}
              onChange={(e) => setPackageId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter package ID to test..."
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={testUserReviews}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              Test User Reviews
            </button>
            <button
              onClick={testGoogleReviews}
              disabled={loading}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              Test Google Reviews
            </button>
            <button
              onClick={testDebugInfo}
              disabled={loading}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
            >
              Debug Info
            </button>
          </div>
        </div>
      </div>

      {/* Logs Section */}
      <div className="bg-gray-900 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white font-semibold">Console Logs</h2>
          <button
            onClick={clearLogs}
            className="px-3 py-1 bg-gray-700 text-white text-sm rounded hover:bg-gray-600"
          >
            Clear Logs
          </button>
        </div>
        <div className="bg-black rounded p-3 max-h-64 overflow-y-auto font-mono text-sm">
          {logs.length === 0 ? (
            <div className="text-gray-400">No logs yet...</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className={`mb-1 ${
                log.type === 'error' ? 'text-red-400' : 
                log.type === 'success' ? 'text-green-400' : 
                log.type === 'warning' ? 'text-yellow-400' : 
                'text-gray-300'
              }`}>
                <span className="text-gray-500">{log.timestamp}</span> {log.message}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Results Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Reviews */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">User Reviews</h2>
          {userReviews === null ? (
            <p className="text-gray-500">Click "Test User Reviews" to fetch data</p>
          ) : (
            <div className="space-y-3">
              <div className="text-sm text-gray-600 mb-3">
                Found {Array.isArray(userReviews) ? userReviews.length : 0} reviews
              </div>
              <div className="max-h-64 overflow-y-auto">
                {!Array.isArray(userReviews) || userReviews.length === 0 ? (
                  <p className="text-gray-500">No user reviews found</p>
                ) : (
                  userReviews.map((review, index) => (
                    <div key={index} className="border-b pb-2 mb-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{review.userName || 'Anonymous'}</span>
                        <span className="text-yellow-500">{'★'.repeat(review.rating)}</span>
                      </div>
                      <p className="text-sm text-gray-700">{review.feedback}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Google Reviews */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Google Reviews</h2>
          {googleReviews === null ? (
            <p className="text-gray-500">Click "Test Google Reviews" to fetch data</p>
          ) : (
            <div className="space-y-3">
              <div className="text-sm text-gray-600 mb-3">
                Found {googleReviews.reviews?.length || 0} reviews
                {googleReviews.usedName && (
                  <div className="text-xs">Used name: {googleReviews.usedName}</div>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto">
                {!Array.isArray(googleReviews.reviews) || googleReviews.reviews.length === 0 ? (
                  <div>
                    <p className="text-gray-500 mb-2">No Google reviews found</p>
                    {googleReviews.error && (
                      <p className="text-red-500 text-sm">Error: {googleReviews.error}</p>
                    )}
                  </div>
                ) : (
                  googleReviews.reviews.map((review, index) => (
                    <div key={index} className="border-b pb-2 mb-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{review.name}</span>
                        <span className="text-yellow-500">{'★'.repeat(Math.round(review.rating))}</span>
                      </div>
                      <p className="text-sm text-gray-700">{review.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Debug Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
          {debugInfo === null ? (
            <p className="text-gray-500">Click "Debug Info" to fetch data</p>
          ) : (
            <div className="max-h-64 overflow-y-auto">
              <pre className="text-xs bg-gray-100 p-2 rounded whitespace-pre-wrap">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Sample Package IDs */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
        <h3 className="font-semibold text-yellow-800 mb-2">💡 Test with sample package IDs:</h3>
        <div className="text-sm text-yellow-700 space-y-1">
          <div>Try these IDs that should have reviews:</div>
          <div className="font-mono bg-yellow-100 p-1 rounded">687428a6ab98b9d9f97253cf</div>
          <div className="font-mono bg-yellow-100 p-1 rounded">687428a6ab98b9d9f97253d2</div>
          <div>Or get any package ID from the main packages page by inspecting the network tab.</div>
        </div>
      </div>
    </div>
  );
};

export default ReviewsTest;