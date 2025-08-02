import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ProductCard } from '../../components/cards/ProductCard';

const TestPage = () => {
  const [logs, setLogs] = useState([]);
  const [packages, setPackages] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { message, type, timestamp }]);
    console.log(`[${timestamp}] ${message}`);
  };

  const testPackageEndpoint = async () => {
    setLoading(true);
    setLogs([]);
    addLog('Starting package endpoint test...');

    try {
      addLog('Testing environment variables...');
      addLog(`VITE_API_URL: ${import.meta.env.VITE_API_URL}`);
      addLog(`Current origin: ${window.location.origin}`);

      addLog('Making API request to /api/packages/with-coordinates...');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/packages/with-coordinates`);
      
      addLog(`Response status: ${response.status}`, 'success');
      addLog(`Response data type: ${typeof response.data}`);
      addLog(`Response success: ${response.data.success}`);
      
      if (response.data && response.data.data && response.data.data.packages) {
        const packageCount = response.data.data.packages.length;
        addLog(`Found ${packageCount} packages`, 'success');
        setPackages(response.data.data.packages.slice(0, 3)); // Show first 3 packages
        
        // Log first package structure
        if (packageCount > 0) {
          const firstPackage = response.data.data.packages[0];
          addLog(`First package title: ${firstPackage.title}`);
          addLog(`First package source: ${firstPackage.source}`);
          addLog(`First package price: ${firstPackage.price}`);
        }
      } else {
        addLog('No packages found in response', 'warning');
        addLog(`Response structure: ${JSON.stringify(response.data).substring(0, 200)}...`);
      }

    } catch (error) {
      addLog(`Error: ${error.message}`, 'error');
      addLog(`Error code: ${error.code}`, 'error');
      if (error.response) {
        addLog(`Response status: ${error.response.status}`, 'error');
        addLog(`Response data: ${JSON.stringify(error.response.data)}`, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const testProviderContacts = async () => {
    setLoading(true);
    setLogs([]);
    addLog('Testing provider contacts API...');

    try {
      addLog('Making API request to /api/inquiries/providers/contacts/all...');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/inquiries/providers/contacts/all`);

      addLog(`Response status: ${response.status}`, 'success');

      if (response.data && response.data.data) {
        const providerCount = response.data.data.length;
        addLog(`Found ${providerCount} provider contacts`, 'success');
        setProviders(response.data.data);

        response.data.data.forEach(provider => {
          addLog(`Provider: ${provider.providerName} - ${provider.whatsappNumber}`);
        });
      } else {
        addLog('No provider contacts found', 'warning');
      }

    } catch (error) {
      addLog(`Error: ${error.message}`, 'error');
      if (error.response) {
        addLog(`Response status: ${error.response.status}`, 'error');
        addLog(`Response data: ${JSON.stringify(error.response.data)}`, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const testDirectEndpoint = async () => {
    setLoading(true);
    setLogs([]);
    addLog('Testing direct endpoint...');

    try {
      const response = await axios.get('http://localhost:5001/api/packages');
      addLog(`Direct endpoint status: ${response.status}`, 'success');
      
      if (response.data && response.data.data && response.data.data.packages) {
        const packageCount = response.data.data.packages.length;
        addLog(`Direct endpoint found ${packageCount} packages`, 'success');
      }
    } catch (error) {
      addLog(`Direct endpoint error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const testProxyEndpoint = async () => {
    setLoading(true);
    setLogs([]);
    addLog('Testing proxy endpoint...');

    try {
      const response = await axios.get('/api/packages');
      addLog(`Proxy endpoint status: ${response.status}`, 'success');
      
      if (response.data && response.data.data && response.data.data.packages) {
        const packageCount = response.data.data.packages.length;
        addLog(`Proxy endpoint found ${packageCount} packages`, 'success');
      }
    } catch (error) {
      addLog(`Proxy endpoint error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getLogColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">API Test Page</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Test Controls */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
          <div className="space-y-3">
            <button 
              onClick={testPackageEndpoint}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              Test Package Endpoint (with-coordinates)
            </button>
            
            <button 
              onClick={testDirectEndpoint}
              disabled={loading}
              className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              Test Direct Endpoint
            </button>
            
            <button
              onClick={testProxyEndpoint}
              disabled={loading}
              className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
            >
              Test Proxy Endpoint
            </button>

            <button
              onClick={testProviderContacts}
              disabled={loading}
              className="w-full px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
            >
              Test Provider Contacts API
            </button>
          </div>
          
          {loading && (
            <div className="mt-4 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Testing...</p>
            </div>
          )}
        </div>

        {/* Logs */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Logs</h2>
          <div className="h-64 overflow-y-auto bg-gray-50 p-3 rounded text-sm">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs yet. Click a test button to start.</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className={`mb-1 ${getLogColor(log.type)}`}>
                  <span className="text-gray-400">[{log.timestamp}]</span> {log.message}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Package Preview with Inquiry Form */}
      {packages.length > 0 && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Package Preview with Inquiry Form (First 3)</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {packages.map((pkg, index) => (
              <ProductCard
                key={index}
                title={pkg.title}
                price={pkg.price}
                description={pkg.description}
                image={pkg.image}
                link={pkg.link}
                provider={pkg.provider}
                destination={pkg.destination}
                duration={pkg.duration}
                packageId={pkg._id || pkg.id || `test-${index}`}
                source={pkg.source}
              />
            ))}
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">🧪 Test Instructions:</h3>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. Click the "📞 Inquire" button on any package card</li>
              <li>2. Fill out the multi-step inquiry form</li>
              <li>3. Submit the form to generate a WhatsApp message</li>
              <li>4. Click "Contact via WhatsApp" to test the integration</li>
            </ol>
          </div>
        </div>
      )}

      {/* Provider Contacts Display */}
      {providers.length > 0 && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Provider Contacts</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {providers.map((provider, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2">{provider.providerName}</h3>
                <p className="text-sm text-gray-600 mb-1"><strong>Business:</strong> {provider.businessName}</p>
                <p className="text-sm text-gray-600 mb-1"><strong>WhatsApp:</strong> {provider.whatsappNumber}</p>
                <p className="text-sm text-gray-600 mb-1"><strong>Response Time:</strong> {provider.responseTime}</p>
                <div className="mt-2">
                  <p className="text-xs text-gray-500"><strong>Operating Hours:</strong></p>
                  <p className="text-xs text-gray-500">Weekdays: {provider.operatingHours.weekdays.start} - {provider.operatingHours.weekdays.end}</p>
                  <p className="text-xs text-gray-500">Weekends: {provider.operatingHours.weekends.start} - {provider.operatingHours.weekends.end}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestPage;
