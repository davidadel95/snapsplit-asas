'use client';

import { useState, useEffect } from 'react';
import { ImageItem } from '../api/gallery/route';

interface ImageCardProps {
  image: ImageItem;
  onClick: () => void;
}

export default function ImageCard({ image, onClick }: ImageCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    console.log('ImageCard rendered:', image.name, 'URL:', image.url);
  }, [image]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.log('Image loaded successfully:', image.name);
    const img = e.currentTarget;
    console.log('Image dimensions:', img.naturalWidth, 'x', img.naturalHeight);
    setIsLoading(false);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error('Image failed to load:', image.name);
    console.error('URL:', image.url);
    console.error('Error:', e);
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div
      className="group relative cursor-pointer overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
      onClick={onClick}
      style={{ aspectRatio: '1/1', width: '100%' }}
    >
      {/* Background color - only show if loading or error */}
      <div className="absolute inset-0 bg-gray-200" />

      {/* Image - Base layer */}
      {!hasError && (
        <img
          src={image.url}
          alt={image.name}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            display: 'block',
            opacity: isLoading ? 0 : 1,
            transition: 'opacity 0.3s ease-in-out',
            zIndex: 1
          }}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy"
        />
      )}

      {/* Loading overlay */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 2 }}>
          <div className="text-gray-500 text-sm">Loading...</div>
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 2 }}>
          <div className="text-center text-gray-500">
            <svg className="mx-auto h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xs">Failed to load</p>
          </div>
        </div>
      )}

      {/* Hover overlay */}
      {!isLoading && (
        <div
          className="absolute inset-0 bg-black opacity-0 transition-opacity duration-300 group-hover:opacity-20"
          style={{ zIndex: 3 }}
        />
      )}

      {/* Image info overlay */}
      {!isLoading && (
        <div
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ zIndex: 4 }}
        >
          <h3 className="text-sm font-medium text-white truncate">{image.name}</h3>
          <p className="text-xs text-gray-200">
            {(image.size / 1024).toFixed(1)} KB
          </p>
        </div>
      )}

    </div>
  );
}
