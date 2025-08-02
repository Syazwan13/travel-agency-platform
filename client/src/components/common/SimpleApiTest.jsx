import React, { useState } from 'react';
import axios from 'axios';

const SimpleApiTest = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testApi = async () => {
    setLoading(true);
    setResult('Testing...');
    
    try {
      console.log('Testing API connection...');
      const response = await axios.get('http://localhost:5001/api/packages');
      console.log('API Response:', response);
      
      if (response.data && response.data.success) {
        const packageCount = response.data.data?.packages?.length || 0;
        setResult(`✅ Success! Found ${packageCount} packages`);
      } else {
        setResult(`❌ API returned: ${JSON.stringify(response.data)}`);
      }
    } catch (error) {
      console.error('API Error:', error);
      setResult(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testWithEnvVar = async () => {
    setLoading(true);
    setResult('Testing with env var...');
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      console.log('Using API URL:', apiUrl);
      
      const response = await axios.get(`${apiUrl}/api/packages`);
      console.log('API Response:', response);
      
      if (response.data && response.data.success) {
        const packageCount = response.data.data?.packages?.length || 0;
        setResult(`✅ Success with env var! Found ${packageCount} packages`);
      } else {
        setResult(`❌ API returned: ${JSON.stringify(response.data)}`);
      }
    } catch (error) {
      console.error('API Error:', error);
      setResult(`❌ Error with env var: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testWithProxy = async () => {
    setLoading(true);
    setResult('Testing with proxy...');
    
    try {
      console.log('Testing with Vite proxy...');
      const response = await axios.get('/api/packages');
      console.log('Proxy Response:', response);
      
      if (response.data && response.data.success) {
        const packageCount = response.data.data?.packages?.length || 0;
        setResult(`✅ Success with proxy! Found ${packageCount} packages`);
      } else {
        setResult(`❌ Proxy returned: ${JSON.stringify(response.data)}`);
      }
    } catch (error) {
      console.error('Proxy Error:', error);
      setResult(`❌ Error with proxy: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto mt-8">
      <h3 className="text-lg font-semibold mb-4">Simple API Test</h3>
      
      <div className="space-y-3">
        <button 
          onClick={testApi}
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test Direct API
        </button>
        
        <button 
          onClick={testWithEnvVar}
          disabled={loading}
          className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          Test with Env Var
        </button>
        
        <button 
          onClick={testWithProxy}
          disabled={loading}
          className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          Test with Proxy
        </button>
      </div>
      
      <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
        <strong>Result:</strong> {result || 'Click a button to test'}
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        <div><strong>VITE_API_URL:</strong> {import.meta.env.VITE_API_URL || 'Not set'}</div>
        <div><strong>Current Origin:</strong> {window.location.origin}</div>
      </div>
    </div>
  );
};

export default SimpleApiTest;
