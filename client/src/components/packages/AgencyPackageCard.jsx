import React from 'react';

const AgencyPackageCard = ({ pkg, onEdit, onDelete }) => {
  const fallbackImage = 'https://via.placeholder.com/400x250?text=No+Image';
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={pkg.image || fallbackImage}
          alt={pkg.title}
          className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
          onError={e => { e.target.src = fallbackImage; }}
        />
        {/* Price Badge */}
        <div className="absolute bottom-3 right-3">
          <span className="bg-white bg-opacity-90 text-gray-900 px-2 py-1 rounded text-sm font-semibold">
            {pkg.price || 'Price on request'}
          </span>
        </div>
      </div>
      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{pkg.title || 'Untitled Package'}</h3>
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {pkg.destination || 'Destination not specified'}
        </div>
        {pkg.description && (
          <p className="text-sm text-gray-600 mb-3">{pkg.description}</p>
        )}
        {pkg.duration && (
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {pkg.duration}
          </div>
        )}
        {/* Edit/Delete Buttons */}
        <div className="flex space-x-2 mt-4">
          <button onClick={() => onEdit(pkg)} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">Edit</button>
          <button onClick={() => onDelete(pkg._id)} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">Delete</button>
        </div>
      </div>
    </div>
  );
};

export default AgencyPackageCard; 