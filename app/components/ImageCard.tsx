'use client';

import { useState, useEffect, useRef } from 'react';
import { ImageItem } from '../api/gallery/route';

interface ImageCardProps {
  image: ImageItem;
  onClick: () => void;
}

export default function ImageCard({ image, onClick }: ImageCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debug logging
  useEffect(() => {
    console.log(`[ImageCard] ${image.name}: Component mounted`);
    console.log(`[ImageCard] ${image.name}: URL = ${image.url}`);
    console.log(`[ImageCard] ${image.name}: Key = ${image.key}`);
    
    // Check container dimensions
    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      console.log(`[ImageCard] ${image.name}: Container dimensions = ${containerRect.width}x${containerRect.height}`);
      setDebugInfo(`Container: ${Math.round(containerRect.width)}x${Math.round(containerRect.height)}`);
    }
  }, [image]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    console.log(`[ImageCard] ${image.name}: Image loaded successfully`);
    console.log(`[ImageCard] ${image.name}: Natural dimensions = ${img.naturalWidth}x${img.naturalHeight}`);
    console.log(`[ImageCard] ${image.name}: Display dimensions = ${img.width}x${img.height}`);
    
    // Check computed styles
    const computedStyle = window.getComputedStyle(img);
    console.log(`[ImageCard] ${image.name}: Computed styles:`, {
      objectFit: computedStyle.objectFit,
      width: computedStyle.width,
      height: computedStyle.height,
      display: computedStyle.display,
      opacity: computedStyle.opacity,
      visibility: computedStyle.visibility,
    });
    
    setIsLoading(false);
    setDebugInfo(`${img.naturalWidth}x${img.naturalHeight} → ${img.width}x${img.height}`);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error(`[ImageCard] ${image.name}: Image failed to load`);
    console.error(`[ImageCard] ${image.name}: Error event:`, e);
    console.error(`[ImageCard] ${image.name}: Image src:`, e.currentTarget.src);
    setIsLoading(false);
    setHasError(true);
    setDebugInfo('FAILED TO LOAD');
  };

  return (
    <div 
      className="group relative cursor-pointer overflow-hidden rounded-lg bg-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
      onClick={onClick}
    >
      {/* Fixed height container for more reliable rendering */}
      <div 
        ref={containerRef}
        className="w-full h-64 bg-gray-200 relative flex items-center justify-center"
        style={{ minHeight: '256px' }} // Explicit height fallback
      >
        
        {/* Always render the image - no conditional hiding */}
        <img
          ref={imgRef}
          src={image.url}
          alt={image.name}
          className="w-full h-full object-cover rounded-lg block"
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'cover',
            display: hasError ? 'none' : 'block'
          }}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy"
          width="300"
          height="300"
        />
        
        {/* Loading skeleton - overlay */}
        {isLoading && !hasError && (
          <div className="absolute inset-0 animate-pulse bg-gray-300 rounded-lg flex items-center justify-center">
            <div className="text-gray-500 text-sm">Loading...</div>
          </div>
        )}
        
        {/* Error state */}
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-lg">
            <div className="text-center text-gray-500">
              <svg className="mx-auto h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-xs">Failed to load</p>
            </div>
          </div>
        )}
        
        {/* Debug info overlay - only in development */}
        {process.env.NODE_ENV === 'development' && debugInfo && (
          <div className="absolute top-1 left-1 bg-black bg-opacity-75 text-white text-xs p-1 rounded">
            {debugInfo}
          </div>
        )}
      </div>
      
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-0 transition-all duration-300 group-hover:bg-opacity-20 rounded-lg" />
      
      {/* Image info overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-b-lg">
        <h3 className="text-sm font-medium text-white truncate">{image.name}</h3>
        <p className="text-xs text-gray-200">
          {(image.size / 1024).toFixed(1)} KB
        </p>
      </div>
    </div>
  );
}