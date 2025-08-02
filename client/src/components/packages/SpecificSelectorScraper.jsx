import React, { useState } from 'react';
import axios from 'axios';

const SpecificSelectorScraper = () => {
  const [url, setUrl] = useState('');
  const [selector, setSelector] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [scrapeMode, setScrapeMode] = useState('specific'); // Changed default to 'specific'

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Use the appropriate endpoint based on the scrape mode
      const endpoint = scrapeMode === 'exact' ? 'exact-selector' : 'specific-selector';
      const queryParams = scrapeMode === 'exact' 
        ? `url=${encodeURIComponent(url)}&selector=${encodeURIComponent(selector)}` 
        : `url=${encodeURIComponent(url)}`;
      
      const response = await axios.get(`/api/scrape/${endpoint}?${queryParams}`);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred');
      console.error('Error scraping from selector:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">CSS Selector Scraper</h2>
      <p className="mb-4 text-gray-600">
        This tool scrapes content from a webpage using CSS selectors. Enter the URL of the page you want to scrape.
      </p>

      <div className="mb-4">
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => setScrapeMode('specific')}
            className={`px-4 py-2 rounded-md ${
              scrapeMode === 'specific'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Smart Scraper
          </button>
          <button
            type="button"
            onClick={() => setScrapeMode('exact')}
            className={`px-4 py-2 rounded-md ${
              scrapeMode === 'exact'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Exact Selector
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          {scrapeMode === 'specific'
            ? 'Smart Scraper automatically tries different selectors to find content.'
            : 'Exact Selector uses the exact CSS selector you provide.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
            URL to Scrape
          </label>
          <input
            type="url"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/page-to-scrape"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {scrapeMode === 'exact' && (
          <div className="mb-4">
            <label htmlFor="selector" className="block text-sm font-medium text-gray-700 mb-1">
              CSS Selector
            </label>
            <input
              type="text"
              id="selector"
              value={selector}
              onChange={(e) => setSelector(e.target.value)}
              placeholder=".package-list-item or #main-content"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required={scrapeMode === 'exact'}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Scraping...' : 'Scrape Content'}
        </button>
      </form>

      {loading && (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md mb-4">
          <h3 className="text-lg font-medium text-red-800">Error</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">Scraping Results</h3>
          <p className="mb-2 text-gray-700">{result.message}</p>

          {result.success ? (
            <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
              {/* For specific-selector endpoint */}
              {result.data.package ? (
                <div className="space-y-4">
                  <h4 className="text-lg font-medium">{result.data.package.title}</h4>
                  <p className="font-bold text-green-600">{result.data.package.price}</p>
                  <p className="text-gray-600">{result.data.package.description}</p>
                  
                  {result.data.package.image && (
                    <div className="mt-2">
                      <img 
                        src={result.data.package.image} 
                        alt={result.data.package.title} 
                        className="max-w-full h-auto rounded-md"
                      />
                    </div>
                  )}
                  
                  <div className="pt-2">
                    <a 
                      href={result.data.package.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Package
                    </a>
                  </div>
                </div>
              ) : result.data.packages ? (
                <div>
                  <h4 className="text-lg font-medium mb-2">Found {result.data.packages.length} packages</h4>
                  <div className="space-y-4">
                    {result.data.packages.map((pkg, index) => (
                      <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                        <h5 className="font-medium">{pkg.title}</h5>
                        <p className="font-bold text-green-600">{pkg.price}</p>
                        <p className="text-sm text-gray-600">{pkg.description}</p>
                        
                        {pkg.image && (
                          <div className="mt-2">
                            <img 
                              src={pkg.image} 
                              alt={pkg.title} 
                              className="max-w-full h-auto max-h-40 rounded-md"
                            />
                          </div>
                        )}
                        
                        <div className="pt-2">
                          <a 
                            href={pkg.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                          >
                            View Package
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : result.data.items ? (
                // For exact-selector endpoint
                <div>
                  <h4 className="text-lg font-medium mb-2">Found {result.data.items.length} items</h4>
                  <p className="text-sm text-gray-500 mb-4">Using selector: {result.data.selector}</p>
                  
                  <div className="space-y-4">
                    {result.data.items.map((item, index) => (
                      <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                        <h5 className="font-medium">{item.title}</h5>
                        <p className="font-bold text-green-600">{item.price}</p>
                        <p className="text-sm text-gray-600">{item.description}</p>
                        
                        {item.image && (
                          <div className="mt-2">
                            <img 
                              src={item.image} 
                              alt={item.title} 
                              className="max-w-full h-auto max-h-40 rounded-md"
                            />
                          </div>
                        )}
                        
                        <div className="pt-2">
                          <a 
                            href={item.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                          >
                            View Item
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p>No data found.</p>
              )}
            </div>
          ) : (
            <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
              <p>No content found with the specified selector.</p>
              {result.data?.sampleHtml && (
                <div className="mt-4">
                  <h4 className="text-md font-medium mb-2">Sample HTML from page:</h4>
                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                    {result.data.sampleHtml.substring(0, 500)}...
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SpecificSelectorScraper; 