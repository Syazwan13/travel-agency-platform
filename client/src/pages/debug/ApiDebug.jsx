import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ApiDebug = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testEndpoints = [
    {
      name: 'Backend Health',
      url: 'http://localhost:5001/health',
      method: 'GET'
    },
    {
      name: 'Backend Root',
      url: 'http://localhost:5001/',
      method: 'GET'
    },
    {
      name: 'All Packages',
      url: 'http://localhost:5001/api/packages',
      method: 'GET'
    },
    {
      name: 'Packages with Coordinates',
      url: 'http://localhost:5001/api/packages/with-coordinates',
      method: 'GET'
    },
    {
      name: 'Environment Variable API URL',
      url: `${import.meta.env.VITE_API_URL}/health`,
      method: 'GET'
    },
    {
      name: 'Proxy Test (relative)',
      url: '/api/packages',
      method: 'GET'
    }
  ];

  const testAllEndpoints = async () => {
    setLoading(true);
    const newResults = {};

    for (const endpoint of testEndpoints) {
      try {
        console.log(`Testing ${endpoint.name}: ${endpoint.url}`);
        const startTime = Date.now();
        
        const response = await axios({
          method: endpoint.method,
          url: endpoint.url,
          timeout: 10000,
          withCredentials: true
        });
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        newResults[endpoint.name] = {
          status: 'success',
          statusCode: response.status,
          responseTime: `${responseTime}ms`,
          dataSize: JSON.stringify(response.data).length,
          preview: typeof response.data === 'object' 
            ? JSON.stringify(response.data).substring(0, 200) + '...'
            : response.data.toString().substring(0, 200) + '...'
        };
      } catch (error) {
        console.error(`Error testing ${endpoint.name}:`, error);
        newResults[endpoint.name] = {
          status: 'error',
          error: error.message,
          code: error.code,
          statusCode: error.response?.status || 'N/A',
          details: error.response?.data || error.toString()
        };
      }
    }

    setResults(newResults);
    setLoading(false);
  };

  useEffect(() => {
    testAllEndpoints();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">API Debug Dashboard</h1>
        
        <div className="mb-6">
          <button 
            onClick={testAllEndpoints}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test All Endpoints'}
          </button>
        </div>

        <div className="grid gap-6">
          {testEndpoints.map((endpoint) => {
            const result = results[endpoint.name];
            
            return (
              <div key={endpoint.name} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{endpoint.name}</h3>
                  {result && (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(result.status)}`}>
                      {result.status}
                    </span>
                  )}
                </div>
                
                <div className="mb-3">
                  <span className="text-sm text-gray-500">URL: </span>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">{endpoint.url}</code>
                </div>

                {result && (
                  <div className="space-y-2">
                    {result.status === 'success' ? (
                      <>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Status Code:</span>
                            <div className="font-medium">{result.statusCode}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Response Time:</span>
                            <div className="font-medium">{result.responseTime}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Data Size:</span>
                            <div className="font-medium">{result.dataSize} chars</div>
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500 text-sm">Response Preview:</span>
                          <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                            {result.preview}
                          </pre>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Error Code:</span>
                            <div className="font-medium text-red-600">{result.code || 'N/A'}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Status Code:</span>
                            <div className="font-medium text-red-600">{result.statusCode}</div>
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500 text-sm">Error Message:</span>
                          <div className="text-red-600 text-sm mt-1">{result.error}</div>
                        </div>
                        {result.details && (
                          <div>
                            <span className="text-gray-500 text-sm">Details:</span>
                            <pre className="text-xs bg-red-50 p-2 rounded mt-1 overflow-x-auto text-red-700">
                              {typeof result.details === 'object' 
                                ? JSON.stringify(result.details, null, 2)
                                : result.details}
                            </pre>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {!result && loading && (
                  <div className="text-gray-500">Testing...</div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Environment Info</h3>
          <div className="text-sm space-y-1">
            <div><strong>VITE_API_URL:</strong> {import.meta.env.VITE_API_URL || 'Not set'}</div>
            <div><strong>Current URL:</strong> {window.location.origin}</div>
            <div><strong>Mode:</strong> {import.meta.env.MODE}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiDebug;
