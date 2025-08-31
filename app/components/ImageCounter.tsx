'use client';

interface ImageCounterProps {
  totalCount: number;
  currentPage: number;
  totalPages: number;
  imagesPerPage: number;
  isLoading?: boolean;
}

export default function ImageCounter({
  totalCount,
  currentPage,
  totalPages,
  imagesPerPage,
  isLoading = false,
}: ImageCounterProps) {
  if (isLoading) {
    return (
      <div className="text-center mb-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-48 mx-auto mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-32 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (totalCount === 0) {
    return (
      <div className="text-center mb-6">
        <p className="text-gray-600">No images found</p>
      </div>
    );
  }

  const startIndex = (currentPage - 1) * imagesPerPage + 1;
  const endIndex = Math.min(currentPage * imagesPerPage, totalCount);

  return (
    <div className="text-center mb-6">
      <p className="text-lg font-medium text-gray-900">
        {totalCount.toLocaleString()} {totalCount === 1 ? 'Image' : 'Images'} Found
      </p>
      <p className="text-sm text-gray-600 mt-1">
        Showing {startIndex.toLocaleString()}-{endIndex.toLocaleString()} of {totalCount.toLocaleString()}
        {totalPages > 1 && (
          <span className="ml-2">
            • Page {currentPage} of {totalPages}
          </span>
        )}
      </p>
    </div>
  );
}