import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import InquiryForm from '../inquiry/InquiryForm';
import WhatsAppSuccessModal from '../inquiry/WhatsAppSuccessModal';
import MiniMap from '../Map/MiniMap';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { normalizeResortName } from '../../utils/resortPackageMatching';
import axios from 'axios'; // <-- Add axios for backend call

const PackageCard = ({
  package: pkg,
  isSelected,
  onSelect,
  onExternalClick,
  canSelect,
  onLocate,
  resorts // <-- add resorts prop
}) => {
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [inquiryResult, setInquiryResult] = useState(null);
  const [googleReviews, setGoogleReviews] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [loadingGoogleReviews, setLoadingGoogleReviews] = useState(false);
  const [loadingUserReviews, setLoadingUserReviews] = useState(false);
  const [showGoogleReviews, setShowGoogleReviews] = useState(false);
  const [showUserReviews, setShowUserReviews] = useState(false);
  const [showMiniMap, setShowMiniMap] = useState(false);
  const [miniMapCoords, setMiniMapCoords] = useState(null);
  const [miniMapLoading, setMiniMapLoading] = useState(false);
  const { user, favorites, addFavorite, removeFavorite } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  // Always treat favorites as an array
  const safeFavorites = Array.isArray(favorites) ? favorites : [];
  const fallbackImage = 'https://via.placeholder.com/400x250?text=No+Image';
  
  const getProviderBadge = (source) => {
    const providerConfig = {
      'AmiTravel': { name: 'Ami Travel', color: 'bg-blue-100 text-blue-800' },
      'HolidayGoGo': { name: 'Holiday GoGo', color: 'bg-green-100 text-green-800' },
      'PulauMalaysia': { name: 'Pulau Malaysia', color: 'bg-purple-100 text-purple-800' },
      'Package': { name: 'Travel Package', color: 'bg-gray-100 text-gray-800' }
    };
    
    const config = providerConfig[source] || { name: source, color: 'bg-gray-100 text-gray-800' };
    return config;
  };

  const extractPrice = (priceString) => {
    if (!priceString) return 'Price on request';
    return priceString;
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const provider = getProviderBadge(pkg.source || pkg.provider || 'Package');

  // Fetch Google reviews
  useEffect(() => {
    if (showGoogleReviews && googleReviews.length === 0 && pkg.resort) {
      setLoadingGoogleReviews(true);
      fetch(`/api/resorts/google-reviews?name=${encodeURIComponent(pkg.resort)}`)
        .then(res => res.json())
        .then(data => setGoogleReviews(data.reviews || []))
        .catch(() => setGoogleReviews([]))
        .finally(() => setLoadingGoogleReviews(false));
    }
  }, [showGoogleReviews, pkg.resort]);

  // Fetch user reviews
  useEffect(() => {
    if (showUserReviews && userReviews.length === 0 && pkg._id) {
      setLoadingUserReviews(true);
      fetch(`/api/feedback/package/${pkg._id}`)
        .then(res => res.json())
        .then(data => setUserReviews(data || []))
        .catch(() => setUserReviews([]))
        .finally(() => setLoadingUserReviews(false));
    }
  }, [showUserReviews, pkg._id]);

  useEffect(() => {
    if (user && safeFavorites && pkg._id) {
      setIsFavorite(safeFavorites.some(fav => fav.packageId === pkg._id));
    } else {
      setIsFavorite(false);
    }
  }, [user, safeFavorites, pkg._id]);

  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    console.log('Favorite button clicked!', { user, isFavorite, pkgId: pkg._id });
    if (!user) {
      alert('Please log in to save favorites.');
      return;
    }
    try {
      if (!isFavorite) {
        console.log('Calling addFavorite', pkg._id);
        await addFavorite(pkg._id);
      } else {
        console.log('Calling removeFavorite', pkg._id);
        await removeFavorite(pkg._id);
      }
      // setIsFavorite will be updated by context
    } catch (err) {
      console.error('Failed to update favorites:', err);
      alert('Failed to update favorites.');
    }
  };

  // Handle inquiry form
  const handleInquiryClick = () => {
    setShowInquiryForm(true);
  };

  const handleInquirySuccess = (result) => {
    setShowInquiryForm(false);
    setInquiryResult(result);
  };

  const handleCloseInquiry = () => {
    setShowInquiryForm(false);
  };

  const handleCloseSuccess = () => {
    setInquiryResult(null);
  };

  // Prepare package data for inquiry form
  const packageData = {
    _id: pkg._id || pkg.id || `pkg-${Date.now()}`,
    id: pkg._id || pkg.id || `pkg-${Date.now()}`,
    title: pkg.title || 'Package Title',
    price: pkg.price || 'Price on request',
    description: pkg.description || '',
    image: pkg.image || '',
    link: pkg.link || '',
    provider: pkg.source || pkg.provider || 'Travel Provider',
    destination: pkg.destination || '',
    duration: pkg.duration || '',
    source: pkg.source || pkg.provider || 'Package'
  };

  // Enhanced handler for Locate on Map with prioritized coordinate sources
  const handleLocateOnMap = async () => {
    console.log('🗺️ Locating resort on map for:', pkg.resort || pkg.title);
    
    let coords = null;
    let coordSource = '';
    
    // 1. PRIORITY: Check pkg.location object format (lat/lng properties)
    if (pkg.location && typeof pkg.location === 'object') {
      console.log('📍 Raw pkg.location object:', pkg.location);
      
      // Handle object format with lat/lng properties
      if (typeof pkg.location.lat === 'number' && typeof pkg.location.lng === 'number') {
        coords = [pkg.location.lng, pkg.location.lat]; // Convert to [lng, lat] array format
        coordSource = 'package.location (object format)';
        console.log('✅ Found coordinates in pkg.location object:', { lat: pkg.location.lat, lng: pkg.location.lng });
        console.log('✅ Converted to array format:', coords);
      }
      // Handle array format in coordinates property
      else if (Array.isArray(pkg.location.coordinates) && pkg.location.coordinates.length === 2) {
        coords = pkg.location.coordinates;
        coordSource = 'package.location.coordinates (array format)';
        console.log('✅ Found coordinates in pkg.location.coordinates:', coords);
      }
    }
    
    // 2. FALLBACK: Check pkg.coordinates 
    if (!coords && pkg.coordinates && Array.isArray(pkg.coordinates) && pkg.coordinates.length === 2) {
      coords = pkg.coordinates;
      coordSource = 'package.coordinates';
      console.log('✅ Found coordinates in pkg.coordinates:', coords, 'Type:', typeof coords[0], typeof coords[1]);
    } 
    
    // 3. FALLBACK: Search in resorts array if available
    if (!coords && resorts && pkg.resort) {
      const match = resorts.find(r => normalizeResortName(r.name) === normalizeResortName(pkg.resort));
      if (match && match.coordinates && match.coordinates.length === 2) {
        coords = match.coordinates;
        coordSource = 'resorts array lookup';
        console.log('✅ Found coordinates in resorts array:', coords, 'Type:', typeof coords[0], typeof coords[1]);
      } else {
        console.log('❌ No matching resort found in resorts array for:', pkg.resort);
        console.log('Available resorts:', resorts?.map(r => r.name).slice(0, 5));
      }
    }

    // Validate coordinates before using
    if (coords && coords.length === 2) {
      const [lng, lat] = coords;
      const isValidNumbers = typeof lng === 'number' && typeof lat === 'number' && 
                            !isNaN(lng) && !isNaN(lat) && 
                            lng !== 0 && lat !== 0;
      
      if (isValidNumbers) {
        console.log('🎯 Using valid coordinates:', coords);
        console.log('📍 Coordinate source:', coordSource);
        console.log('📍 Coordinates details:', { lng, lat, withinBounds: lng >= 99.0 && lng <= 119.0 && lat >= 0.8 && lat <= 7.5 });
        
        // Update MiniMap with validated coordinates
        setMiniMapCoords(coords);
        setShowMiniMap(v => !v);
        return;
      } else {
        console.warn('❌ Invalid coordinate values:', { coords, lng, lat, types: [typeof lng, typeof lat] });
        coords = null; // Reset coords to trigger API fetch
      }
    }

    // 4. LAST RESORT: If still no coords, try to fetch from backend API
    if (pkg.resort) {
      console.log('🔍 No valid coordinates found locally, fetching from backend API for:', pkg.resort);
      setMiniMapLoading(true);
      
      try {
        const encodedResortName = encodeURIComponent(pkg.resort);
        const apiUrl = `${import.meta.env.VITE_API_URL || ''}/api/resorts/geocode?name=${encodedResortName}`;
        console.log('📡 Making API request to:', apiUrl);
        
        const res = await axios.get(apiUrl);
        console.log('📡 API response:', res.data);
        
        if (res.data && res.data.success && res.data.coordinates && res.data.coordinates.length === 2) {
          console.log('✅ Successfully fetched coordinates from API:', res.data.coordinates);
          console.log('📍 API coordinate source: backend geocode lookup');
          setMiniMapCoords(res.data.coordinates);
          setShowMiniMap(true);
        } else {
          console.warn('❌ API returned no valid coordinates:', res.data);
          setMiniMapCoords(null);
          setShowMiniMap(true);
        }
      } catch (err) {
        console.error('❌ Error fetching coordinates from API:', err);
        console.error('Error details:', {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data
        });
        setMiniMapCoords(null);
        setShowMiniMap(true);
      } finally {
        setMiniMapLoading(false);
      }
    } else if (onLocate) {
      console.log('🔄 No resort name available, calling onLocate callback');
      onLocate(pkg);
    } else {
      console.warn('⚠️ No resort name and no onLocate callback available');
      setShowMiniMap(true);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg ${
      isSelected ? 'ring-2 ring-primary ring-opacity-50' : ''
    }`}>
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={pkg.image || fallbackImage}
          alt={pkg.title}
          className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
          onError={(e) => {
            e.target.src = fallbackImage;
          }}
        />
        
        {/* Provider Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${provider.color}`}>
            {provider.name}
          </span>
        </div>

        {/* Favorite Icon */}
        <button
          className="absolute bottom-3 left-3 z-10 text-red-500 hover:scale-110 transition-transform"
          onClick={handleFavoriteClick}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {isFavorite ? <FaHeart size={22} /> : <FaRegHeart size={22} />}
        </button>

        {/* Compare Checkbox */}
        <div className="absolute top-3 right-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onSelect}
              disabled={!canSelect}
              className="rounded border-gray-300 text-primary focus:ring-primary bg-white bg-opacity-90"
            />
            <span className="ml-1 text-xs text-white bg-black bg-opacity-50 px-1 rounded">
              Compare
            </span>
          </label>
        </div>

        {/* Price Badge */}
        <div className="absolute bottom-3 right-3">
          <span className="bg-white bg-opacity-90 text-gray-900 px-2 py-1 rounded text-sm font-semibold">
            {extractPrice(pkg.price)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {pkg.title || 'Untitled Package'}
        </h3>

        {/* Destination */}
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {pkg.destination || 'Destination not specified'}
        </div>

        {/* Description */}
        {pkg.description && (
          <p className="text-sm text-gray-600 mb-3">
            {truncateText(pkg.description)}
          </p>
        )}

        {/* Includes */}
        {(pkg.inclusions || pkg.includes) && (pkg.inclusions || pkg.includes).length > 0 && (
          <div className="mb-3">
            <h4 className="text-sm font-medium text-gray-800 mb-1">Includes:</h4>
            <div className="text-xs text-gray-600 space-y-1">
              {(pkg.inclusions || pkg.includes).slice(0, 3).map((item, index) => (
                <div key={index} className="flex items-start">
                  <span className="text-green-500 mr-1">✓</span>
                  <span>{item}</span>
                </div>
              ))}
              {(pkg.inclusions || pkg.includes).length > 3 && (
                <div className="text-xs text-gray-500 italic">
                  +{(pkg.inclusions || pkg.includes).length - 3} more items included
                </div>
              )}
            </div>
          </div>
        )}

        {/* Excludes */}
        {(pkg.exclusions || pkg.excludes) && (pkg.exclusions || pkg.excludes).length > 0 && (
          <div className="mb-3">
            <h4 className="text-sm font-medium text-gray-800 mb-1">Excludes:</h4>
            <div className="text-xs text-gray-600 space-y-1">
              {(pkg.exclusions || pkg.excludes).slice(0, 2).map((item, index) => (
                <div key={index} className="flex items-start">
                  <span className="text-red-500 mr-1">✗</span>
                  <span>{item}</span>
                </div>
              ))}
              {(pkg.exclusions || pkg.excludes).length > 2 && (
                <div className="text-xs text-gray-500 italic">
                  +{(pkg.exclusions || pkg.excludes).length - 2} more items excluded
                </div>
              )}
            </div>
          </div>
        )}

        {/* Features */}
        {(pkg.features || pkg.activities || pkg.highlights) && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {(pkg.features || pkg.activities || pkg.highlights || []).slice(0, 3).map((feature, index) => (
                <span
                  key={index}
                  className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                >
                  {feature}
                </span>
              ))}
              {(pkg.features || pkg.activities || pkg.highlights || []).length > 3 && (
                <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                  +{(pkg.features || pkg.activities || pkg.highlights || []).length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Duration */}
        {pkg.duration && (
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {pkg.duration}
          </div>
        )}

        {/* Resort */}
        {pkg.resort && (
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            {pkg.resort}
          </div>
        )}

        {/* Reviews Section */}
        <div className="mt-4 space-y-3">
          {/* Google Reviews */}
          <div>
            <button
              className="text-blue-600 underline text-sm font-medium mb-2 flex items-center"
              onClick={() => setShowGoogleReviews(v => !v)}
            >
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {showGoogleReviews ? 'Hide' : 'Show'} Google Reviews
            </button>
            {showGoogleReviews && (
              <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-2 max-h-60 overflow-y-auto">
                <div className="text-xs text-blue-600 font-medium mb-2">🌐 Google Reviews</div>
                {loadingGoogleReviews && <div className="text-xs text-gray-500">Loading Google reviews...</div>}
                {!loadingGoogleReviews && googleReviews.length === 0 && <div className="text-xs text-gray-500">No Google reviews found.</div>}
                {!loadingGoogleReviews && googleReviews.map((review, idx) => (
                  <div key={idx} className="mb-3 border-b border-blue-100 pb-2 last:border-b-0 last:pb-0">
                    <div className="flex items-center mb-1">
                      <span className="font-semibold text-sm mr-2">{review.name}</span>
                      <span className="text-yellow-500 text-xs">{'★'.repeat(Math.round(review.rating))}</span>
                      <span className="ml-2 text-xs text-gray-400">{review.date}</span>
                    </div>
                    <div className="text-xs text-gray-700">{review.text}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User Reviews */}
          <div>
            <button
              className="text-green-600 underline text-sm font-medium mb-2 flex items-center"
              onClick={() => setShowUserReviews(v => !v)}
            >
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
              </svg>
              {showUserReviews ? 'Hide' : 'Show'} User Reviews
            </button>
            {showUserReviews && (
              <div className="bg-green-50 border border-green-200 rounded p-3 mt-2 max-h-60 overflow-y-auto">
                <div className="text-xs text-green-600 font-medium mb-2">👥 User Reviews</div>
                {loadingUserReviews && <div className="text-xs text-gray-500">Loading user reviews...</div>}
                {!loadingUserReviews && userReviews.length === 0 && <div className="text-xs text-gray-500">No user reviews yet. Be the first to review!</div>}
                {!loadingUserReviews && userReviews.map((review, idx) => (
                  <div key={idx} className="mb-3 border-b border-green-100 pb-2 last:border-b-0 last:pb-0">
                    <div className="flex items-center mb-1">
                      <span className="font-semibold text-sm mr-2">{review.userName || 'Anonymous'}</span>
                      <span className="text-yellow-500 text-xs">{'★'.repeat(review.rating)}</span>
                      <span className="ml-2 text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="text-xs text-gray-700 mb-1">{review.feedback}</div>
                    {review.service && review.accommodation && review.value && (
                      <div className="text-xs text-gray-500">
                        Service: {review.service}★ | Accommodation: {review.accommodation}★ | Value: {review.value}★
                      </div>
                    )}
                    {review.recommend && (
                      <div className="text-xs mt-1">
                        <span className={`px-2 py-1 rounded ${review.recommend === 'yes' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {review.recommend === 'yes' ? '✓ Recommended' : '✗ Not Recommended'}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mt-4 min-w-0">
          <button
            onClick={handleInquiryClick}
            className="flex-1 min-w-[120px] bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm font-medium flex items-center justify-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Inquire
          </button>
          <button
            onClick={handleInquiryClick}
            className="flex-1 min-w-[120px] bg-green-500 text-white py-2 px-3 rounded-lg hover:bg-green-600 transition-colors duration-200 text-sm font-medium flex items-center justify-center"
            title="Direct WhatsApp Inquiry"
          >
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.52 3.48A12 12 0 003.48 20.52l-1.32 4.84a1 1 0 001.22 1.22l4.84-1.32A12 12 0 0020.52 3.48zm-8.52 17a10 10 0 1110-10 10 10 0 01-10 10zm4.29-7.71l-2.54-2.54a1 1 0 00-1.42 0l-2.54 2.54a1 1 0 001.42 1.42l1.29-1.3V17a1 1 0 002 0v-3.59l1.29 1.3a1 1 0 001.42-1.42z" />
            </svg>
            <span style={{ color: '#25D366' }}>WhatsApp Inquiry</span>
          </button>
          <button
            onClick={onExternalClick}
            className="flex-1 min-w-[120px] bg-primary text-white py-2 px-3 rounded-lg hover:bg-primary-dark transition-colors duration-200 text-sm font-medium"
          >
            View Details
          </button>
          <button
            onClick={onSelect}
            disabled={!canSelect}
            className={`flex-1 min-w-[120px] px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              isSelected
                ? 'bg-primary text-white'
                : canSelect
                ? 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                : 'border border-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isSelected ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            )}
          </button>
          <button
            onClick={handleLocateOnMap}
            className="flex-1 min-w-[120px] bg-blue-500 text-white py-2 px-3 rounded-lg hover:bg-blue-600 transition-colors duration-200 text-sm font-medium flex items-center justify-center"
            title="Locate on Map"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
              <line x1="12" y1="2" x2="12" y2="6" stroke="currentColor" strokeWidth="2" />
              <line x1="12" y1="18" x2="12" y2="22" stroke="currentColor" strokeWidth="2" />
              <line x1="2" y1="12" x2="6" y2="12" stroke="currentColor" strokeWidth="2" />
              <line x1="18" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2" />
            </svg>
            {showMiniMap ? 'Hide Map' : 'Locate on Map'}
          </button>
        </div>
      </div>

      {/* Inquiry Form Modal */}
      {showInquiryForm && (
        <InquiryForm
          packageData={packageData}
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

      {/* MiniMap beside the card */}
      {showMiniMap && (
        miniMapLoading ? (
          <div className="mt-4 text-blue-500 text-sm">Locating resort...</div>
        ) : miniMapCoords && miniMapCoords.length === 2 ? (
          <div className="mt-4">
            <MiniMap coordinates={miniMapCoords} resortName={pkg.resort || pkg.title} />
          </div>
        ) : (
          <div className="mt-4 text-red-500 text-sm">No map available for this resort. Coordinates missing.</div>
        )
      )}
    </div>
  );
};

PackageCard.propTypes = {
  package: PropTypes.object.isRequired,
  isSelected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  onExternalClick: PropTypes.func.isRequired,
  canSelect: PropTypes.bool.isRequired,
  onLocate: PropTypes.func, // optional
  resorts: PropTypes.arrayOf(PropTypes.object) // new prop type
};

export default PackageCard;
