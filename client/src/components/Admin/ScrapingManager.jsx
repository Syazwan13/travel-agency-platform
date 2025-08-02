import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardCard from '../dashboard/DashboardCard';
import ProgressBar from '../dashboard/ProgressBar';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const ScrapingManager = () => {
  const [scrapingStatus, setScrapingStatus] = useState({
    isRunning: false,
    currentOperation: null,
    statistics: null,
    cronStatus: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSources, setSelectedSources] = useState(['AmiTravel', 'HolidayGoGo', 'PulauMalaysia']);

  const availableSources = [
    { id: 'AmiTravel', name: 'Ami Travel', color: 'bg-blue-100 text-blue-800' },
    { id: 'HolidayGoGo', name: 'Holiday GoGo', color: 'bg-green-100 text-green-800' },
    { id: 'PulauMalaysia', name: 'Pulau Malaysia', color: 'bg-purple-100 text-purple-800' }
  ];

  useEffect(() => {
    fetchScrapingStatus();
    fetchStatistics();
    fetchCronStatus();

    // Set up polling for running operations
    const interval = setInterval(() => {
      if (scrapingStatus.isRunning) {
        fetchScrapingStatus();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [scrapingStatus.isRunning]);

  const fetchScrapingStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/scraping/running`, {
        withCredentials: true
      });
      
      const runningOps = response.data.data;
      setScrapingStatus(prev => ({
        ...prev,
        isRunning: runningOps.isScrapingInProgress,
        currentOperation: runningOps.operations[0] || null
      }));
    } catch (err) {
      console.error('Error fetching scraping status:', err);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/scraping/statistics`, {
        withCredentials: true
      });
      
      setScrapingStatus(prev => ({
        ...prev,
        statistics: response.data.data
      }));
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  };

  const fetchCronStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/scraping/cron/status`, {
        withCredentials: true
      });
      
      setScrapingStatus(prev => ({
        ...prev,
        cronStatus: response.data.data
      }));
    } catch (err) {
      console.error('Error fetching cron status:', err);
    }
  };

  const handleStartScraping = async () => {
    if (selectedSources.length === 0) {
      setError('Please select at least one source to scrape');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`${API_URL}/api/scraping/start`, {
        sources: selectedSources,
        config: {
          timeout: 300000,
          retryAttempts: 3
        }
      }, {
        withCredentials: true
      });

      if (response.data.success) {
        setScrapingStatus(prev => ({
          ...prev,
          isRunning: true
        }));
        
        // Start polling for updates
        setTimeout(fetchScrapingStatus, 1000);
      }
    } catch (err) {
      console.error('Error starting scraping:', err);
      setError(err.response?.data?.message || 'Failed to start scraping');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelScraping = async () => {
    if (!scrapingStatus.currentOperation) return;

    try {
      setLoading(true);
      const response = await axios.post(
        `${API_URL}/api/scraping/cancel/${scrapingStatus.currentOperation.operationId}`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        setScrapingStatus(prev => ({
          ...prev,
          isRunning: false,
          currentOperation: null
        }));
      }
    } catch (err) {
      console.error('Error cancelling scraping:', err);
      setError(err.response?.data?.message || 'Failed to cancel scraping');
    } finally {
      setLoading(false);
    }
  };

  const handleSourceToggle = (sourceId) => {
    setSelectedSources(prev => 
      prev.includes(sourceId)
        ? prev.filter(id => id !== sourceId)
        : [...prev, sourceId]
    );
  };

  const formatDuration = (ms) => {
    if (!ms) return 'N/A';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Manual Scraping Control */}
      <DashboardCard 
        title="Manual Data Refresh"
        error={error}
      >
        <div className="space-y-4">
          {/* Source Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Sources to Scrape:
            </label>
            <div className="flex flex-wrap gap-2">
              {availableSources.map(source => (
                <label key={source.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedSources.includes(source.id)}
                    onChange={() => handleSourceToggle(source.id)}
                    disabled={scrapingStatus.isRunning}
                    className="rounded border-gray-300 text-primary focus:ring-primary mr-2"
                  />
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${source.color}`}>
                    {source.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Current Operation Status */}
          {scrapingStatus.isRunning && scrapingStatus.currentOperation && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-blue-900">
                  Scraping in Progress
                </h4>
                <span className="text-sm text-blue-700">
                  {scrapingStatus.currentOperation.currentStep}
                </span>
              </div>
              
              <ProgressBar
                value={scrapingStatus.currentOperation.progress || 0}
                max={100}
                color="info"
                showPercentage={true}
                className="mb-2"
              />
              
              <div className="flex justify-between text-sm text-blue-700">
                <span>
                  Started: {new Date(scrapingStatus.currentOperation.startTime).toLocaleTimeString()}
                </span>
                <span>
                  Operation ID: {scrapingStatus.currentOperation.operationId?.substring(0, 8)}...
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleStartScraping}
              disabled={loading || scrapingStatus.isRunning || selectedSources.length === 0}
              className="flex-1 bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Starting...
                </div>
              ) : scrapingStatus.isRunning ? (
                'Scraping in Progress...'
              ) : (
                'Refresh Data Now'
              )}
            </button>

            {scrapingStatus.isRunning && (
              <button
                onClick={handleCancelScraping}
                disabled={loading}
                className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </DashboardCard>

      {/* Statistics */}
      {scrapingStatus.statistics && (
        <DashboardCard title="Scraping Statistics (Last 30 Days)">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {scrapingStatus.statistics.statistics.totalOperations || 0}
              </div>
              <div className="text-sm text-gray-600">Total Operations</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {scrapingStatus.statistics.statistics.successfulOperations || 0}
              </div>
              <div className="text-sm text-gray-600">Successful</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {scrapingStatus.statistics.statistics.failedOperations || 0}
              </div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {scrapingStatus.statistics.statistics.totalPackagesProcessed || 0}
              </div>
              <div className="text-sm text-gray-600">Packages Processed</div>
            </div>
          </div>
        </DashboardCard>
      )}

      {/* Cron Status */}
      {scrapingStatus.cronStatus && (
        <DashboardCard title="Automated Scraping Schedule">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Status:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                scrapingStatus.cronStatus.enabled 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {scrapingStatus.cronStatus.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Active Tasks:</span>
              <span className="text-sm text-gray-900">
                {scrapingStatus.cronStatus.activeTasks} / {scrapingStatus.cronStatus.totalTasks}
              </span>
            </div>
            
            {scrapingStatus.cronStatus.nextRuns && scrapingStatus.cronStatus.nextRuns.length > 0 && (
              <div>
                <span className="text-sm font-medium text-gray-700">Next Run:</span>
                <div className="text-sm text-gray-900 mt-1">
                  {new Date(scrapingStatus.cronStatus.nextRuns[0].nextRun).toLocaleString()}
                </div>
              </div>
            )}
          </div>
        </DashboardCard>
      )}
    </div>
  );
};

export default ScrapingManager;
