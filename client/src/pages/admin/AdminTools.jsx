import React from 'react';
import ScrapingManager from '../../components/admin/ScrapingManager';
import GeocodingManager from '../../components/Map/GeocodingManager';

const AdminTools = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🛠️ Admin Tools</h1>
          <p className="mt-2 text-gray-600">Manage system operations and data quality</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Scraping Manager */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">🔄 Scraping Manager</h2>
            <ScrapingManager />
          </div>

          {/* Geocoding Manager */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">🗺️ Resort Geocoding Manager</h2>
            <GeocodingManager />
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📊 System Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900">Scraping Operations</h3>
              <p className="text-gray-600 mt-1">Manage package data collection from multiple sources</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900">Geocoding Management</h3>
              <p className="text-gray-600 mt-1">Ensure accurate resort coordinates for mapping</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900">Data Quality</h3>
              <p className="text-gray-600 mt-1">Monitor and improve data accuracy across the platform</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTools; 