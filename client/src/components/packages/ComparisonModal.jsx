import React from 'react';
import PropTypes from 'prop-types';

const ComparisonModal = ({ packages, onClose, onExternalClick }) => {
  const fallbackImage = 'https://via.placeholder.com/200x120?text=No+Image';

  const getProviderBadge = (source) => {
    const providerConfig = {
      'AmiTravel': { name: 'Ami Travel', color: 'bg-blue-100 text-blue-800' },
      'HolidayGoGo': { name: 'Holiday GoGo', color: 'bg-green-100 text-green-800' },
      'PulauMalaysia': { name: 'Pulau Malaysia', color: 'bg-purple-100 text-purple-800' },
      'Package': { name: 'Travel Package', color: 'bg-gray-100 text-gray-800' }
    };
    
    return providerConfig[source] || { name: source, color: 'bg-gray-100 text-gray-800' };
  };

  const extractPrice = (priceString) => {
    if (!priceString) return 'Price on request';
    
    // If price already contains "RM", return as is
    if (priceString.includes('RM')) {
      return priceString;
    }
    
    // Otherwise, extract number and add RM prefix
    const matches = priceString.match(/\d+/g);
    return matches ? `RM ${matches[0]}` : priceString;
  };

  const getComparisonRows = () => {
    return [
      {
        label: 'Image',
        type: 'image',
        getValue: (pkg) => pkg.image || fallbackImage
      },
      {
        label: 'Title',
        type: 'text',
        getValue: (pkg) => pkg.title || 'Untitled Package'
      },
      {
        label: 'Provider',
        type: 'badge',
        getValue: (pkg) => getProviderBadge(pkg.source || pkg.provider || 'Package')
      },
      {
        label: 'Price',
        type: 'price',
        getValue: (pkg) => extractPrice(pkg.price)
      },
      {
        label: 'Destination',
        type: 'text',
        getValue: (pkg) => pkg.destination || 'Not specified'
      },
      {
        label: 'Duration',
        type: 'text',
        getValue: (pkg) => pkg.duration || 'Not specified'
      },
      {
        label: 'Resort',
        type: 'text',
        getValue: (pkg) => pkg.resort || 'Not specified'
      },
      {
        label: 'Features',
        type: 'list',
        getValue: (pkg) => pkg.features || pkg.activities || pkg.highlights || []
      },
      {
        label: 'Inclusions',
        type: 'list',
        getValue: (pkg) => pkg.inclusions || []
      },
      {
        label: 'Description',
        type: 'text',
        getValue: (pkg) => pkg.description || 'No description available'
      }
    ];
  };

  const renderCellContent = (row, pkg) => {
    const value = row.getValue(pkg);

    switch (row.type) {
      case 'image':
        return (
          <img
            src={value}
            alt={pkg.title}
            className="w-full h-24 object-cover rounded"
            onError={(e) => {
              e.target.src = fallbackImage;
            }}
          />
        );
      
      case 'badge':
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${value.color}`}>
            {value.name}
          </span>
        );
      
      case 'price':
        return (
          <span className="font-semibold text-primary text-lg">
            {value}
          </span>
        );
      
      case 'list':
        return value.length > 0 ? (
          <ul className="text-sm space-y-1">
            {value.slice(0, 3).map((item, index) => (
              <li key={index} className="flex items-start">
                <span className="text-green-500 mr-1">•</span>
                {item}
              </li>
            ))}
            {value.length > 3 && (
              <li className="text-gray-500 text-xs">
                +{value.length - 3} more items
              </li>
            )}
          </ul>
        ) : (
          <span className="text-gray-500 text-sm">None specified</span>
        );
      
      case 'text':
      default:
        return (
          <span className="text-sm">
            {value.length > 100 ? `${value.substring(0, 100)}...` : value}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-blue-900 bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full overflow-hidden border-2 border-blue-200 relative">
        {/* Decorative SVG/icon top left */}
        <div className="absolute top-0 left-0 w-24 h-24 opacity-20 z-0">
          {/* Add a playful SVG blob or icon here */}
          {/* Example: <img src="/images/decor/blob-compare.svg" alt="decor" /> */}
        </div>
        {/* Decorative SVG/icon bottom right */}
        <div className="absolute bottom-0 right-0 w-32 h-32 opacity-20 z-0">
          {/* Add a playful SVG wave or icon here */}
          {/* Example: <img src="/images/decor/wave-compare.svg" alt="decor" /> */}
        </div>
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Package Comparison ({packages.length} packages)
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Comparison Table */}
        <div className="overflow-auto max-h-[calc(90vh-120px)]">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 w-32">
                  Features
                </th>
                {packages.map((pkg, index) => (
                  <th key={pkg._id || index} className="px-4 py-3 text-center text-sm font-medium text-gray-900 min-w-64">
                    Package {index + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {getComparisonRows().map((row, rowIndex) => (
                <tr key={row.label} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50 sticky left-0">
                    {row.label}
                  </td>
                  {packages.map((pkg, pkgIndex) => (
                    <td key={pkg._id || pkgIndex} className="px-4 py-3 text-center">
                      {renderCellContent(row, pkg)}
                    </td>
                  ))}
                </tr>
              ))}
              
              {/* Action Row */}
              <tr className="bg-gray-100">
                <td className="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50 sticky left-0">
                  Actions
                </td>
                {packages.map((pkg, index) => (
                  <td key={pkg._id || index} className="px-4 py-3 text-center">
                    <button
                      onClick={() => onExternalClick(pkg)}
                      className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors text-sm font-medium"
                    >
                      View Details
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Compare up to 4 packages side by side. Click "View Details" to visit the provider's website.
            </p>
            <button
              onClick={onClose}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              Close Comparison
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

ComparisonModal.propTypes = {
  packages: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
  onExternalClick: PropTypes.func.isRequired
};

export default ComparisonModal;
