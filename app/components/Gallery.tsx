'use client';

import { useEffect, useState } from 'react';
import ImageCard from './ImageCard';
import ImageModal from './ImageModal';
import Pagination from './Pagination';
import ImageCounter from './ImageCounter';
import { ImageItem, GalleryResponse } from '../api/gallery/route';

export default function Gallery() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);

  const IMAGES_PER_PAGE = 25;

  useEffect(() => {
    fetchImages(currentPage);
  }, [currentPage]);

  const fetchImages = async (page: number) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/gallery?page=${page}&limit=${IMAGES_PER_PAGE}`);
      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }
      
      const data: GalleryResponse = await response.json();
      setImages(data.images);
      setTotalCount(data.totalCount);
      setTotalPages(data.totalPages);
      setHasNextPage(data.hasNextPage);
      setHasPrevPage(data.hasPrevPage);
      setCurrentPage(data.currentPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedImageIndex(null); // Close modal when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openModal = (index: number) => {
    setSelectedImageIndex(index);
  };

  const closeModal = () => {
    setSelectedImageIndex(null);
  };

  const goToPrevious = () => {
    if (selectedImageIndex !== null && selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  const goToNext = () => {
    if (selectedImageIndex !== null && selectedImageIndex < images.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
  };

  const handleDelete = (key: string) => {
    // Close modal if open
    setSelectedImageIndex(null);

    // Refresh the gallery to reflect the deletion
    fetchImages(currentPage);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Photo Gallery</h1>
          <ImageCounter 
            totalCount={totalCount}
            currentPage={currentPage}
            totalPages={totalPages}
            imagesPerPage={IMAGES_PER_PAGE}
            isLoading={true}
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(IMAGES_PER_PAGE)].map((_, i) => (
            <div key={i} className="relative w-full pb-[100%] bg-gray-200 animate-pulse rounded-lg" />
          ))}
        </div>
        
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          hasNextPage={hasNextPage}
          hasPrevPage={hasPrevPage}
          onPageChange={handlePageChange}
          isLoading={true}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Photo Gallery</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <svg className="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Images</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => fetchImages(currentPage)}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (totalCount === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Photo Gallery</h1>
          <ImageCounter 
            totalCount={0}
            currentPage={1}
            totalPages={0}
            imagesPerPage={IMAGES_PER_PAGE}
            isLoading={false}
          />
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-md mx-auto">
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Images Found</h3>
            <p className="text-gray-600">The gallery is empty. Please check back later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Photo Gallery</h1>
        <ImageCounter 
          totalCount={totalCount}
          currentPage={currentPage}
          totalPages={totalPages}
          imagesPerPage={IMAGES_PER_PAGE}
          isLoading={false}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {images.map((image, index) => (
          <ImageCard
            key={image.key}
            image={image}
            onClick={() => openModal(index)}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        hasNextPage={hasNextPage}
        hasPrevPage={hasPrevPage}
        onPageChange={handlePageChange}
        isLoading={isLoading}
      />

      <ImageModal
        images={images}
        currentIndex={selectedImageIndex ?? 0}
        isOpen={selectedImageIndex !== null}
        onClose={closeModal}
        onPrevious={goToPrevious}
        onNext={goToNext}
      />
    </div>
  );
}