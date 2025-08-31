'use client';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export default function Pagination({
  currentPage,
  totalPages,
  hasNextPage,
  hasPrevPage,
  onPageChange,
  isLoading = false,
}: PaginationProps) {
  const generatePageNumbers = () => {
    const pages = [];
    const delta = 2; // Show 2 pages before and after current page
    const rangeStart = Math.max(1, currentPage - delta);
    const rangeEnd = Math.min(totalPages, currentPage + delta);

    // Always show first page
    if (rangeStart > 1) {
      pages.push(1);
      if (rangeStart > 2) {
        pages.push('...');
      }
    }

    // Show range around current page
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i);
    }

    // Always show last page
    if (rangeEnd < totalPages) {
      if (rangeEnd < totalPages - 1) {
        pages.push('...');
      }
      pages.push(totalPages);
    }

    return pages;
  };

  if (totalPages <= 1) {
    return null;
  }

  const pageNumbers = generatePageNumbers();

  return (
    <nav className="flex items-center justify-center space-x-1 mt-8">
      {/* Previous button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrevPage || isLoading}
        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          !hasPrevPage || isLoading
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
        }`}
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Page numbers */}
      <div className="flex items-center space-x-1">
        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-400">
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isCurrentPage = pageNum === currentPage;

          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              disabled={isLoading}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isCurrentPage
                  ? 'bg-blue-600 text-white'
                  : isLoading
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      {/* Next button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNextPage || isLoading}
        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          !hasNextPage || isLoading
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
        }`}
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Jump to first/last on mobile */}
      <div className="hidden sm:flex items-center space-x-1 ml-4">
        {currentPage > 3 && (
          <button
            onClick={() => onPageChange(1)}
            disabled={isLoading}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
              isLoading
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            First
          </button>
        )}
        
        {currentPage < totalPages - 2 && (
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={isLoading}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
              isLoading
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            Last
          </button>
        )}
      </div>
    </nav>
  );
}