'use client';

import { useEffect, useState } from 'react';
import { ImageItem } from '../api/gallery/route';

interface ImageModalProps {
  images: ImageItem[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

export default function ImageModal({
  images,
  currentIndex,
  isOpen,
  onClose,
  onPrevious,
  onNext,
}: ImageModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  // Get current image first
  const currentImage = images[currentIndex];

  const handleDownload = async () => {
    if (!currentImage) return;
    
    try {
      setIsDownloading(true);
      console.log('Starting download for:', currentImage.name);
      
      // Use our download proxy API
      const downloadUrl = `/api/download?key=${encodeURIComponent(currentImage.key)}&filename=${encodeURIComponent(currentImage.name)}`;
      console.log('Download URL:', downloadUrl);
      
      // Try fetch first to check if the API works
      try {
        const response = await fetch(downloadUrl, { method: 'HEAD' });
        if (!response.ok) {
          throw new Error(`Download API returned ${response.status}: ${response.statusText}`);
        }
      } catch (fetchError) {
        console.error('Download API test failed:', fetchError);
        throw new Error('Download service is not available');
      }
      
      // Create download link
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = currentImage.name || `image-${currentIndex + 1}`;
      link.style.display = 'none';
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('Download triggered successfully');
      
    } catch (error) {
      console.error('Download failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to download image: ${errorMessage}`);
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (event.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          onPrevious();
          break;
        case 'ArrowRight':
          onNext();
          break;
        case 'd':
        case 'D':
          handleDownload();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onPrevious, onNext, handleDownload]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    setIsLoading(true);
  }, [currentIndex]);

  if (!isOpen || !currentImage) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
      <div 
        className="absolute inset-0 cursor-pointer"
        onClick={onClose}
      />
      
      <div className="relative max-h-screen max-w-screen-xl mx-4">
        {/* Control buttons */}
        <div className="absolute top-4 right-4 flex items-center space-x-2 z-20 bg-black bg-opacity-50 rounded-lg p-2">
          {/* Download button */}
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="text-white hover:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Download image"
          >
            {isDownloading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-1"></div>
            ) : (
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            )}
          </button>
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors"
            title="Close"
          >
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          )}
          
          <img
            src={currentImage.url}
            alt={currentImage.name}
            className={`max-h-screen max-w-full object-contain transition-opacity duration-300 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={() => setIsLoading(false)}
          />
        </div>

        {images.length > 1 && (
          <>
            <button
              onClick={onPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full p-2"
              disabled={currentIndex === 0}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={onNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full p-2"
              disabled={currentIndex === images.length - 1}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        <div className="absolute -bottom-20 left-0 right-0 text-center text-white">
          <h3 className="text-lg font-medium mb-1">{currentImage.name}</h3>
          <div className="flex justify-center items-center space-x-4 text-sm text-gray-300 mb-2">
            <span>{(currentImage.size / 1024).toFixed(1)} KB</span>
            {images.length > 1 && (
              <span>{currentIndex + 1} of {images.length}</span>
            )}
          </div>
          
          {/* Mobile download button - show on all screen sizes for better visibility */}
          <div className="mt-4">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Downloading...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}