import React from 'react';
import PropTypes from 'prop-types';
import PackageCard from './PackageCard';

const PackageGrid = ({ 
  packages, 
  selectedPackages, 
  onPackageSelect, 
  onExternalClick, 
  loading,
  onLocate, // new prop
  resorts // <-- add resorts prop
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-200"></div>
            <div className="p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (packages.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No packages found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search criteria or filters to find more packages.
          </p>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Suggestions:</p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>• Try searching for popular destinations like "Langkawi" or "Redang"</li>
              <li>• Clear some filters to see more results</li>
              <li>• Check your price range settings</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {packages.map((packageData) => (
        <PackageCard
          key={packageData._id || `${packageData.title}-${packageData.destination}`}
          package={packageData}
          isSelected={selectedPackages.some(p => p._id === packageData._id)}
          onSelect={() => onPackageSelect(packageData)}
          onExternalClick={() => onExternalClick(packageData)}
          canSelect={selectedPackages.length < 4 || selectedPackages.some(p => p._id === packageData._id)}
          onLocate={onLocate ? () => onLocate(packageData) : undefined} // pass down
          resorts={resorts} // <-- pass resorts to PackageCard
        />
      ))}
    </div>
  );
};

PackageGrid.propTypes = {
  packages: PropTypes.array.isRequired,
  selectedPackages: PropTypes.array.isRequired,
  onPackageSelect: PropTypes.func.isRequired,
  onExternalClick: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  onLocate: PropTypes.func // optional
};

export default PackageGrid;
