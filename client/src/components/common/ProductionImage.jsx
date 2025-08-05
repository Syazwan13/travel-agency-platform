import React, { useState, useEffect } from 'react';

const ProductionImage = ({ 
    src, 
    alt, 
    className = '', 
    fallbackSrc = '/images/home/beach.jpg',
    ...props 
}) => {
    const [imageSrc, setImageSrc] = useState(src);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        setImageSrc(src);
        setIsLoading(true);
        setHasError(false);
    }, [src]);

    const handleImageLoad = () => {
        console.log('✅ Image loaded successfully:', imageSrc);
        setIsLoading(false);
        setHasError(false);
    };

    const handleImageError = (e) => {
        console.error('❌ Image failed to load:', imageSrc);
        console.error('Error details:', e);
        
        setIsLoading(false);
        setHasError(true);
        
        // Try fallback if we haven't already
        if (retryCount === 0 && fallbackSrc && fallbackSrc !== imageSrc) {
            console.log('🔄 Trying fallback image:', fallbackSrc);
            setImageSrc(fallbackSrc);
            setRetryCount(1);
            setIsLoading(true);
        } else {
            // If fallback also failed, show error state
            console.error('❌ Both primary and fallback images failed');
        }
    };

    return (
        <div className={`image-container relative ${className}`}>
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-2xl">
                    <div className="text-gray-500 text-sm">Loading...</div>
                </div>
            )}
            
            <img
                src={imageSrc}
                alt={alt}
                className={`w-full h-full object-cover rounded-2xl shadow-md transition-opacity duration-300 ${
                    isLoading ? 'opacity-0' : 'opacity-100'
                }`}
                onLoad={handleImageLoad}
                onError={handleImageError}
                {...props}
            />
            
            {hasError && retryCount > 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-2xl">
                    <div className="text-center text-gray-500">
                        <div className="text-sm mb-2">Image not available</div>
                        <div className="text-xs">Path: {imageSrc}</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductionImage; 