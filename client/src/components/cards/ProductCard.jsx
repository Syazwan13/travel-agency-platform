import React, { useState } from 'react';
import PropTypes from "prop-types";
import { Title } from "../common/Design";
import InquiryForm from "../inquiry/InquiryForm";
import WhatsAppSuccessModal from "../inquiry/WhatsAppSuccessModal";

const fallbackImg = 'https://via.placeholder.com/300x180?text=No+Image';

export const ProductCard = ({ title, price, description, image, link, provider, destination, duration, packageId, source }) => {
    const [showInquiryForm, setShowInquiryForm] = useState(false);
    const [inquiryResult, setInquiryResult] = useState(null);
    // Try to extract days from the description or title
    let days = '';
    const daysMatch = (title || '').match(/(\d+)[dD](\d+)[nN]/);
    if (daysMatch) {
        days = daysMatch[1];
    }
    
    // Extract reviews count if available
    let reviews = '';
    const reviewsMatch = (description || '').match(/(\d+)\s*reviews?/i);
    if (reviewsMatch) {
        reviews = reviewsMatch[1];
    }
    
    // Use provided image or fallback
    const imageUrl = image || fallbackImg;
    
    // Get provider badge color
    const getProviderColor = (provider) => {
        if (!provider) return 'bg-gray-500';
        
        if (provider.includes('holidaygogogo')) return 'bg-green-600';
        if (provider.includes('pulaumalaysia')) return 'bg-blue-600';
        if (provider.includes('permata')) return 'bg-purple-600';
        if (provider.includes('amitravel')) return 'bg-red-600';
        
        return 'bg-gray-500';
    };
    
    // Format provider name
    const formatProvider = (provider) => {
        if (!provider) return 'Unknown';
        
        if (provider.includes('holidaygogogo')) return 'HolidayGoGoGo';
        if (provider.includes('pulaumalaysia')) return 'PulauMalaysia';
        if (provider.includes('permata')) return 'PermataHolidays';
        if (provider.includes('amitravel')) return 'AMI Travel';
        
        return provider;
    };
    
    // Determine button text based on provider
    const getButtonText = () => {
        // For AMI Travel and other external providers, use "Visit Website"
        if (provider && (
            provider.includes('amitravel') || 
            provider.includes('holidaygogogo') ||
            provider.includes('pulaumalaysia') ||
            provider.includes('permata')
        )) {
            return "Visit Website";
        }
        return "View Package";
    };
    
    const buttonText = getButtonText();

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
        _id: packageId,
        id: packageId,
        title,
        price,
        description,
        image,
        link,
        provider: source || provider,
        destination,
        duration
    };

    return (
        <div className="bg-white shadow-xl rounded-3xl overflow-hidden flex flex-col h-full hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-2 border-blue-100 relative">
            {/* Decorative floating icon top right */}
            <div className="absolute top-3 right-3 w-8 h-8 opacity-20 z-10">
                {/* Add a playful travel icon or SVG here */}
                {/* Example: <img src="/images/decor/plane-mini.svg" alt="icon" /> */}
            </div>
            {/* Image Section */}
            <div className="h-48 overflow-hidden relative bg-blue-50 flex items-center justify-center">
                {imageUrl ? (
                    <img 
                        src={imageUrl} 
                        alt={title} 
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-blue-300 text-lg">[Image]</div>
                )}
                {/* Price Badge */}
                {price && price !== 'Price not available' && (
                    <div className="absolute bottom-2 right-2 bg-blue-500 text-white px-4 py-1 rounded-full text-base font-bold shadow-md">
                        {price}
                    </div>
                )}
                {/* Provider Badge */}
                {provider && (
                    <div className={`absolute top-2 left-2 ${getProviderColor(provider)} text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md border-2 border-white`}> 
                        {formatProvider(provider)}
                    </div>
                )}
            </div>
            {/* Content Section */}
            <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                    <h3 className="text-blue-900 font-bold text-xl mb-2 line-clamp-2 leading-tight drop-shadow-sm">{title}</h3>
                    {/* Info Row */}
                    <div className="flex gap-4 mb-3 text-sm">
                        {days && (
                            <div className="flex items-center text-blue-700 font-medium gap-1">
                                {/* Add a calendar or clock icon here if desired */}
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {days}D
                            </div>
                        )}
                        {reviews && (
                            <div className="flex items-center text-yellow-500 font-medium gap-1">
                                {/* Add a star icon here if desired */}
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                {reviews} reviews
                            </div>
                        )}
                    </div>
                    {description && !reviews && (
                        <div className="text-blue-700 text-base mb-4 line-clamp-2">
                            {description.length > 100
                                ? description.slice(0, 100) + '...'
                                : description}
                        </div>
                    )}
                </div>
                {/* Action Buttons */}
                <div className="mt-4 flex gap-2">
                    <button
                        onClick={handleInquiryClick}
                        className="flex-1 rounded-full text-base bg-green-500 text-white px-4 py-2 text-center font-semibold hover:bg-green-600 transition-colors shadow-md"
                    >
                        📞 Inquire
                    </button>
                    <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 rounded-full text-base bg-blue-500 text-white px-4 py-2 text-center font-semibold hover:bg-blue-600 transition-colors shadow-md"
                    >
                        {buttonText}
                    </a>
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
        </div>
    );
};

ProductCard.propTypes = {
    title: PropTypes.string.isRequired,
    price: PropTypes.string,
    description: PropTypes.string,
    image: PropTypes.string,
    link: PropTypes.string.isRequired,
    provider: PropTypes.string,
    destination: PropTypes.string,
    duration: PropTypes.string,
    packageId: PropTypes.string,
    source: PropTypes.string
};