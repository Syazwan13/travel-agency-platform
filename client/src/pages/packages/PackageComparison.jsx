import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SearchBar from '../../components/packages/SearchBar';
import FilterPanel from '../../components/packages/FilterPanel';
import PackageGrid from '../../components/packages/PackageGrid';
import ComparisonModal from '../../components/packages/ComparisonModal';
import InquiryForm from '../../components/inquiry/InquiryForm';
import WhatsAppSuccessModal from '../../components/inquiry/WhatsAppSuccessModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const PackageComparison = () => {
  const [packages, setPackages] = useState([]);
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPackages, setSelectedPackages] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  const [showBulkInquiry, setShowBulkInquiry] = useState(false);
  const [inquiryResult, setInquiryResult] = useState(null);
  const [filters, setFilters] = useState({
    priceRange: { min: 0, max: 2000 },
    destinations: [],
    providers: [],
    resorts: [], // <-- add this line!
    sortBy: 'title'
  });

  // Available destinations and providers for filtering
  const [availableDestinations, setAvailableDestinations] = useState([]);
  const [availableProviders, setAvailableProviders] = useState([]);
  const [resorts, setResorts] = useState([]); // <-- add resorts state

  useEffect(() => {
    fetchPackages();
    fetchResorts(); // <-- fetch resorts on mount
  }, []);

  useEffect(() => {
    applyFilters();
  }, [packages, searchQuery, filters]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch packages from all sources (including those without coordinates)
      const response = await axios.get(`${API_URL}/api/packages/`);
      const allPackages = response.data.data.packages || [];

      // Extract unique destinations and providers
      const destinations = [...new Set(allPackages.map(pkg => pkg.destination).filter(Boolean))];
      const providers = [...new Set(allPackages.map(pkg => pkg.source || pkg.provider).filter(Boolean))];

      setPackages(allPackages);
      setAvailableDestinations(destinations);
      setAvailableProviders(providers);
    } catch (err) {
      console.error('Error fetching packages:', err);
      setError('Failed to load packages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchResorts = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/resorts`);
      setResorts(response.data.resorts || []);
    } catch (err) {
      console.error('Error fetching resorts:', err);
    }
  };

  const applyFilters = () => {
    let filtered = [...packages];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(pkg => 
        pkg.title?.toLowerCase().includes(query) ||
        pkg.destination?.toLowerCase().includes(query) ||
        pkg.description?.toLowerCase().includes(query) ||
        pkg.resort?.toLowerCase().includes(query)
      );
    }

    // Price filter
    filtered = filtered.filter(pkg => {
      const price = extractPrice(pkg.price);
      return price >= filters.priceRange.min && price <= filters.priceRange.max;
    });

    // Destination filter
    if (filters.destinations.length > 0) {
      filtered = filtered.filter(pkg => 
        filters.destinations.includes(pkg.destination)
      );
    }

    // Resort filter
    if (filters.resorts && filters.resorts.length > 0) {
      filtered = filtered.filter(pkg =>
        filters.resorts.includes(pkg.resort)
      );
    }

    // Provider filter
    if (filters.providers.length > 0) {
      filtered = filtered.filter(pkg => 
        filters.providers.includes(pkg.source || pkg.provider)
      );
    }

    // Sort packages
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'price-low':
          return extractPrice(a.price) - extractPrice(b.price);
        case 'price-high':
          return extractPrice(b.price) - extractPrice(a.price);
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        case 'destination':
          return (a.destination || '').localeCompare(b.destination || '');
        default:
          return 0;
      }
    });

    setFilteredPackages(filtered);
  };

  const extractPrice = (priceString) => {
    if (!priceString) return 0;
    const matches = priceString.match(/\d+/g);
    return matches ? parseInt(matches[0]) : 0;
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handlePackageSelect = (packageData) => {
    setSelectedPackages(prev => {
      const isSelected = prev.find(p => p._id === packageData._id);
      if (isSelected) {
        return prev.filter(p => p._id !== packageData._id);
      } else if (prev.length < 4) {
        return [...prev, packageData];
      }
      return prev;
    });
  };

  const handleComparePackages = () => {
    if (selectedPackages.length >= 2) {
      setShowComparison(true);
    }
  };

  const handleExternalClick = async (packageData) => {
    try {
      // Track click for analytics
      await axios.post(`${API_URL}/api/packages/track-click`, {
        packageId: packageData._id,
        source: packageData.source || packageData.provider,
        destination: packageData.destination
      }, { withCredentials: true }).catch(() => {}); // Don't fail if tracking fails

      // Open external link
      window.open(packageData.link, '_blank');
    } catch (err) {
      console.error('Error tracking click:', err);
      // Still open the link even if tracking fails
      window.open(packageData.link, '_blank');
    }
  };

  // Bulk inquiry handlers
  const handleBulkInquiry = () => {
    if (selectedPackages.length > 0) {
      setShowBulkInquiry(true);
    }
  };

  const handleInquirySuccess = (result) => {
    setShowBulkInquiry(false);
    setInquiryResult(result);
  };

  const handleCloseInquiry = () => {
    setShowBulkInquiry(false);
  };

  const handleCloseSuccess = () => {
    setInquiryResult(null);
  };

  // Build resortsByDestination from packages
  const resortsByDestination = packages.reduce((acc, pkg) => {
    if (!pkg.destination || !pkg.resort) return acc;
    if (!acc[pkg.destination]) acc[pkg.destination] = [];
    if (!acc[pkg.destination].includes(pkg.resort)) {
      acc[pkg.destination].push(pkg.resort);
    }
    return acc;
  }, {});

  if (loading) {
    return <LoadingSpinner message="Loading packages..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-blue-200 relative overflow-hidden">
      {/* Decorative SVG/shape top left */}
      <div className="absolute top-0 left-0 w-40 h-40 opacity-20 z-0">
        {/* Add a playful SVG blob or cloud here */}
        {/* Example: <img src="/images/decor/blob-packages.svg" alt="decor" /> */}
      </div>
      {/* Decorative SVG/shape bottom right */}
      <div className="absolute bottom-0 right-0 w-56 h-56 opacity-20 z-0">
        {/* Add a playful SVG wave or cloud here */}
        {/* Example: <img src="/images/decor/wave-packages.svg" alt="decor" /> */}
      </div>
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 mb-2 drop-shadow-md">
              Compare Travel Packages
            </h1>
            <p className="text-lg text-blue-700">
              Find and compare the best travel packages from multiple providers
            </p>
          </div>
          {/* Decorative icon or wave (optional) */}
          <div className="w-20 h-20 opacity-30">
            {/* Add a travel icon or wave SVG here */}
            {/* Example: <img src="/images/decor/plane-packages.svg" alt="icon" /> */}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar 
            onSearch={handleSearch}
            placeholder="Search by destination (e.g. Redang, Perhentian, Tioman)..."
            suggestions={availableDestinations}
          />
        </div>

        {/* Popular destinations (remove Langkawi) */}
        <div className="mb-2">
          <span className="text-sm text-gray-600 font-medium mr-2">Popular destinations:</span>
          {/* Only show Redang, Perhentian, Tioman */}
          <button className="bg-gray-100 px-3 py-1 rounded-full text-sm mr-2 hover:bg-blue-100" onClick={() => handleSearch('Redang')}>Redang</button>
          <button className="bg-gray-100 px-3 py-1 rounded-full text-sm mr-2 hover:bg-blue-100" onClick={() => handleSearch('Perhentian')}>Perhentian</button>
          <button className="bg-gray-100 px-3 py-1 rounded-full text-sm mr-2 hover:bg-blue-100" onClick={() => handleSearch('Tioman')}>Tioman</button>
        </div>

        {/* Filter Panel */}
        <div className="mb-6">
          <FilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            availableDestinations={availableDestinations}
            availableProviders={availableProviders}
            packages={packages}
            resortsByDestination={resortsByDestination} // <-- add this prop!
          />
        </div>

        {/* Comparison Bar */}
        {selectedPackages.length > 0 && (
          <div className="mb-6 bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="font-medium text-gray-700">
                  {selectedPackages.length} package(s) selected for comparison
                </span>
                <div className="flex space-x-2">
                  {selectedPackages.map(pkg => (
                    <span key={pkg._id} className="bg-primary bg-opacity-10 text-primary px-2 py-1 rounded text-sm">
                      {pkg.title?.substring(0, 20)}...
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedPackages([])}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Clear All
                </button>
                <button
                  onClick={handleBulkInquiry}
                  disabled={selectedPackages.length < 1}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Inquire ({selectedPackages.length})
                </button>
                <button
                  onClick={handleComparePackages}
                  disabled={selectedPackages.length < 2}
                  className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Compare ({selectedPackages.length})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredPackages.length} of {packages.length} packages
            {searchQuery && ` for "${searchQuery}"`}
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Package Grid */}
        <PackageGrid
          packages={filteredPackages}
          selectedPackages={selectedPackages}
          onPackageSelect={handlePackageSelect}
          onExternalClick={handleExternalClick}
          loading={loading}
          resorts={resorts} // <-- pass resorts prop
        />

        {/* Comparison Modal */}
        {showComparison && (
          <ComparisonModal
            packages={selectedPackages}
            onClose={() => setShowComparison(false)}
            onExternalClick={handleExternalClick}
          />
        )}

        {/* Bulk Inquiry Modal */}
        {showBulkInquiry && (
          <InquiryForm
            packageData={{
              _id: 'bulk-inquiry',
              title: `${selectedPackages.length} Selected Packages`,
              price: 'Multiple packages',
              description: `Inquiry for ${selectedPackages.map(p => p.title).join(', ')}`,
              provider: 'Multiple providers',
              destination: 'Multiple destinations',
              duration: 'Various',
              selectedPackages: selectedPackages
            }}
            onClose={handleCloseInquiry}
            onSuccess={handleInquirySuccess}
          />
        )}

        {/* WhatsApp Success Modal */}
        {inquiryResult && (
          <WhatsAppSuccessModal
            inquiryData={inquiryResult}
            onClose={handleCloseSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default PackageComparison;
