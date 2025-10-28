'use client';

import { useState } from 'react';
import { ImageItem } from '../api/gallery/route';

interface ImageCardProps {
  image: ImageItem;
  onClick: () => void;
  onDelete?: (key: string) => void;
}

export default function ImageCard({ image, onClick, onDelete }: ImageCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the modal

    if (!confirm(`Are you sure you want to delete "${image.name}"? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch('/api/delete-image', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key: image.key }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete image');
      }

      // Notify parent component
      if (onDelete) {
        onDelete(image.key);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete image. Please try again.');
      setIsDeleting(false);
    }
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

      {/* Delete button */}
      {!isLoading && onDelete && (
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ zIndex: 5 }}
          title="Delete image"
        >
          {isDeleting ? (
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          )}
        </button>
      )}

    </div>
  );
}
