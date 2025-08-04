import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ApiTest = () => {
  const [apiStatus, setApiStatus] = useState({
    backend: 'checking...',
    packages: 'checking...',
    health: 'checking...'
  });

  useEffect(() => {
    testApiConnections();
  }, []);

  const testApiConnections = async () => {
    // Test 1: Backend health check
    try {
              const healthResponse = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/health`);
      setApiStatus(prev => ({
        ...prev,
        health: `✅ Connected - ${healthResponse.data.status}`
      }));
    } catch (error) {
      setApiStatus(prev => ({
        ...prev,
        health: `❌ Failed - ${error.message}`
      }));
    }

    // Test 2: Backend root endpoint
    try {
              const backendResponse = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/`);
      setApiStatus(prev => ({
        ...prev,
        backend: `✅ Connected - ${backendResponse.data.message}`
      }));
    } catch (error) {
      setApiStatus(prev => ({
        ...prev,
        backend: `❌ Failed - ${error.message}`
      }));
    }

    // Test 3: Packages endpoint
    try {
              const packagesResponse = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/packages`);
      const packageCount = packagesResponse.data.data?.packages?.length || 0;
      setApiStatus(prev => ({
        ...prev,
        packages: `✅ Connected - ${packageCount} packages found`
      }));
    } catch (error) {
      setApiStatus(prev => ({
        ...prev,
        packages: `❌ Failed - ${error.message}`
      }));
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto mt-8">
      <h3 className="text-lg font-semibold mb-4">API Connection Test</h3>
      <div className="space-y-2">
        <div>
          <strong>Health Check:</strong> {apiStatus.health}
        </div>
        <div>
          <strong>Backend Root:</strong> {apiStatus.backend}
        </div>
        <div>
          <strong>Packages API:</strong> {apiStatus.packages}
        </div>
      </div>
      <button 
        onClick={testApiConnections}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Test Again
      </button>
    </div>
  );
};

export default ApiTest;
