import React, { useState } from 'react';
import PropTypes from 'prop-types';

const FilterPanel = ({ 
  filters, 
  onFilterChange, 
  availableDestinations, 
  availableProviders,
  packages,
  resortsByDestination // <-- NEW PROP: { [destination]: [resort, ...] }
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate price range from packages
  const priceRange = React.useMemo(() => {
    const prices = packages.map(pkg => {
      const priceString = pkg.price || '0';
      const matches = priceString.match(/\d+/g);
      return matches ? parseInt(matches[0]) : 0;
    }).filter(price => price > 0);

    return {
      min: Math.min(...prices, 0),
      max: Math.max(...prices, 2000)
    };
  }, [packages]);

  const handlePriceRangeChange = (field, value) => {
    onFilterChange({
      priceRange: {
        ...filters.priceRange,
        [field]: parseInt(value)
      }
    });
  };

  const handleDestinationChange = (destination) => {
    const newDestinations = filters.destinations.includes(destination)
      ? filters.destinations.filter(d => d !== destination)
      : [...filters.destinations, destination];
    
    onFilterChange({ destinations: newDestinations });
  };

  const handleProviderChange = (provider) => {
    const newProviders = filters.providers.includes(provider)
      ? filters.providers.filter(p => p !== provider)
      : [...filters.providers, provider];
    
    onFilterChange({ providers: newProviders });
  };

  const handleSortChange = (sortBy) => {
    onFilterChange({ sortBy });
  };

  const clearAllFilters = () => {
    onFilterChange({
      priceRange: { min: priceRange.min, max: priceRange.max },
      destinations: [],
      providers: [],
      sortBy: 'title'
    });
  };

  const hasActiveFilters = 
    filters.destinations.length > 0 || 
    filters.providers.length > 0 ||
    filters.priceRange.min > priceRange.min ||
    filters.priceRange.max < priceRange.max;

  // Resort selection handler
  const handleResortChange = (resort) => {
    const newResorts = filters.resorts && filters.resorts.includes(resort)
      ? filters.resorts.filter(r => r !== resort)
      : [...(filters.resorts || []), resort];
    onFilterChange({ resorts: newResorts });
  };

  // Compute available resorts based on selected destinations
  const availableResorts = React.useMemo(() => {
    if (!filters.destinations || filters.destinations.length === 0) return [];
    const allResorts = filters.destinations.flatMap(dest => (resortsByDestination?.[dest] || []));
    // Remove duplicates
    return [...new Set(allResorts)];
  }, [filters.destinations, resortsByDestination]);

  return (
    <div className="bg-white bg-opacity-90 rounded-2xl shadow-lg p-6 border-2 border-blue-100">
      {/* Optionally add a decorative icon or SVG here */}
      {/* Example: <img src="/images/decor/filter-icon.svg" alt="icon" className="w-8 h-8 mb-2 opacity-30" /> */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-medium text-gray-900">Filters</h3>
            {hasActiveFilters && (
              <span className="bg-primary bg-opacity-10 text-primary px-2 py-1 rounded-full text-sm">
                Active
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear All
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <svg
                className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Content */}
      <div className={`px-6 py-4 ${isExpanded ? 'block' : 'hidden'} lg:block`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3"> {/* Reduced gap */}
          
          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            >
              <option value="title">Title (A-Z)</option>
              <option value="price-low">Price (Low to High)</option>
              <option value="price-high">Price (High to Low)</option>
              <option value="destination">Destination</option>
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price Range (RM)
            </label>
            <div className="space-y-2">
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.priceRange.min}
                  onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.priceRange.max}
                  onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>
              <div className="text-xs text-gray-500">
                Range: RM {priceRange.min} - RM {priceRange.max}
              </div>
            </div>
          </div>

          {/* Destinations */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Destinations
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {availableDestinations.map(destination => (
                <label key={destination} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.destinations.includes(destination)}
                    onChange={() => handleDestinationChange(destination)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-gray-700">{destination}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Resorts (Dynamic, only show if at least one destination is selected) */}
          {filters.destinations && filters.destinations.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resorts
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {availableResorts.length === 0 ? (
                  <span className="text-xs text-gray-400">No resorts available</span>
                ) : (
                  availableResorts.map(resort => (
                    <label key={resort} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.resorts && filters.resorts.includes(resort)}
                        onChange={() => handleResortChange(resort)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="ml-2 text-sm text-gray-700">{resort}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Providers */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Providers
            </label>
            <div className="space-y-2">
              {availableProviders.map(provider => (
                <label key={provider} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.providers.includes(provider)}
                    onChange={() => handleProviderChange(provider)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {provider === 'AmiTravel' ? 'Ami Travel' : 
                     provider === 'HolidayGoGo' ? 'Holiday GoGo' :
                     provider === 'PulauMalaysia' ? 'Pulau Malaysia' : provider}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              {filters.destinations.map(destination => (
                <span
                  key={destination}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {destination}
                  <button
                    onClick={() => handleDestinationChange(destination)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
              {/* Show selected resorts in summary */}
              {filters.resorts && filters.resorts.map(resort => (
                <span
                  key={resort}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                >
                  {resort}
                  <button
                    onClick={() => handleResortChange(resort)}
                    className="ml-1 text-purple-600 hover:text-purple-800"
                  >
                    ×
                  </button>
                </span>
              ))}
              {filters.providers.map(provider => (
                <span
                  key={provider}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                >
                  {provider}
                  <button
                    onClick={() => handleProviderChange(provider)}
                    className="ml-1 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              ))}
              {(filters.priceRange.min > priceRange.min || filters.priceRange.max < priceRange.max) && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  RM {filters.priceRange.min} - RM {filters.priceRange.max}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

FilterPanel.propTypes = {
  filters: PropTypes.object.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  availableDestinations: PropTypes.array.isRequired,
  availableProviders: PropTypes.array.isRequired,
  packages: PropTypes.array.isRequired,
  resortsByDestination: PropTypes.object.isRequired // <-- NEW PROP
};

export default FilterPanel;

// ---
// PARENT COMPONENT INSTRUCTIONS:
// 1. Pass a resortsByDestination prop: { Tioman: ["Resort A", ...], Redang: ["Resort B", ...], ... }
// 2. Add a 'resorts' array to your filters state and handle it in onFilterChange.
// 3. To filter packages by resort, use the selected resorts in filters.resorts.
// ---
