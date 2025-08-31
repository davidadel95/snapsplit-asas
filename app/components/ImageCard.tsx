'use client';

import { useState } from 'react';
import { ImageItem } from '../api/gallery/route';

interface ImageCardProps {
  image: ImageItem;
  onClick: () => void;
}

export default function ImageCard({ image, onClick }: ImageCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div 
      className="group relative cursor-pointer overflow-hidden rounded-lg bg-gray-100 transition-transform duration-300 hover:scale-105"
      onClick={onClick}
    >
      <div className="aspect-square w-full">
        {isLoading && (
          <div className="absolute inset-0 animate-pulse bg-gray-300" />
        )}
        {hasError ? (
          <div className="flex h-full items-center justify-center bg-gray-200">
            <div className="text-center text-gray-500">
              <svg className="mx-auto h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">Failed to load</p>
            </div>
          </div>
        ) : (
          <img
            src={image.url}
            alt={image.name}
            className={`h-full w-full object-cover transition-opacity duration-300 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
            loading="lazy"
          />
        )}
      </div>
      
      <div className="absolute inset-0 bg-black bg-opacity-0 transition-all duration-300 group-hover:bg-opacity-20" />
      
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <h3 className="text-sm font-medium text-white truncate">{image.name}</h3>
        <p className="text-xs text-gray-200">
          {(image.size / 1024).toFixed(1)} KB
        </p>
      </div>
    </div>
  );
}