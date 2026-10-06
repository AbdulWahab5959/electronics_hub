// src/components/common/Pagination.jsx
import React, { useState, useEffect } from 'react';

export const Pagination = ({
  currentPage = 1,
  totalItems = 0,
  itemsPerPage = 12,
  itemsPerPageOptions = [12, 24, 48, 96],
  siblingCount = 1,
  showItemsPerPage = true,
  showTotal = true,
  onPageChange,
  onItemsPerPageChange,
  className = ''
}) => {
  const [page, setPage] = useState(currentPage);
  const [perPage, setPerPage] = useState(itemsPerPage);
  
  // Calculate total pages
  const totalPages = Math.ceil(totalItems / perPage);
  
  // Sync with external prop changes
  useEffect(() => {
    setPage(currentPage);
  }, [currentPage]);
  
  useEffect(() => {
    setPerPage(itemsPerPage);
  }, [itemsPerPage]);

  // Generate page range with ellipsis
  const generatePaginationRange = () => {
    const totalPageNumbers = siblingCount * 2 + 5;
    const firstPageIndex = 1;
    const lastPageIndex = totalPages;
    
    if (totalPages <= totalPageNumbers) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    const leftSiblingIndex = Math.max(page - siblingCount, 1);
    const rightSiblingIndex = Math.min(page + siblingCount, totalPages);
    
    const showLeftEllipsis = leftSiblingIndex > 2;
    const showRightEllipsis = rightSiblingIndex < totalPages - 1;
    
    if (!showLeftEllipsis && showRightEllipsis) {
      const leftRange = Array.from({ length: 3 + 2 * siblingCount }, (_, i) => i + 1);
      return [...leftRange, '...', totalPages];
    }
    
    if (showLeftEllipsis && !showRightEllipsis) {
      const rightRange = Array.from(
        { length: 3 + 2 * siblingCount },
        (_, i) => totalPages - (3 + 2 * siblingCount) + i + 1
      );
      return [1, '...', ...rightRange];
    }
    
    if (showLeftEllipsis && showRightEllipsis) {
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i
      );
      return [1, '...', ...middleRange, '...', totalPages];
    }
    
    return [];
  };

  const paginationRange = generatePaginationRange();
  
  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === page) return;
    setPage(newPage);
    onPageChange?.(newPage);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Handle items per page change
  const handleItemsPerPageChange = (newPerPage) => {
    setPerPage(newPerPage);
    setPage(1);
    onItemsPerPageChange?.(newPerPage);
    onPageChange?.(1);
  };

  // Calculate range display
  const startItem = totalItems === 0 ? 0 : (page - 1) * perPage + 1;
  const endItem = Math.min(page * perPage, totalItems);

  // Don't show pagination if only one page
  if (totalPages <= 1 && totalItems <= perPage) {
    return null;
  }

  return (
    <div className={`pagination-premium ${className}`}>
      <div className="pagination-container">
        {/* Items Per Page Selector */}
        {showItemsPerPage && (
          <div className="pagination-per-page">
            <span className="per-page-label">Show</span>
            <select
              value={perPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="per-page-select"
            >
              {itemsPerPageOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <span className="per-page-label">items per page</span>
          </div>
        )}
        
        {/* Total Items Display */}
        {showTotal && totalItems > 0 && (
          <div className="pagination-total">
            Showing <strong>{startItem}</strong> - <strong>{endItem}</strong> of <strong>{totalItems.toLocaleString()}</strong> results
          </div>
        )}
        
        {/* Page Controls */}
        <div className="pagination-controls">
          {/* Previous Button */}
          <button
            className={`pagination-prev ${page === 1 ? 'disabled' : ''}`}
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            aria-label="Previous page"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
            <span>Previous</span>
          </button>
          
          {/* Page Numbers */}
          <div className="pagination-numbers">
            {paginationRange.map((pageNumber, index) => {
              if (pageNumber === '...') {
                return (
                  <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                    ...
                  </span>
                );
              }
              
              return (
                <button
                  key={pageNumber}
                  className={`pagination-number ${pageNumber === page ? 'active' : ''}`}
                  onClick={() => handlePageChange(pageNumber)}
                  aria-label={`Page ${pageNumber}`}
                  aria-current={pageNumber === page ? 'page' : undefined}
                >
                  {pageNumber}
                </button>
              );
            })}
          </div>
          
          {/* Next Button */}
          <button
            className={`pagination-next ${page === totalPages ? 'disabled' : ''}`}
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            aria-label="Next page"
          >
            <span>Next</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// LOAD MORE PAGINATION (Infinite Scroll Alternative)
// ============================================
export const LoadMorePagination = ({
  hasMore = true,
  isLoading = false,
  onLoadMore,
  loadingText = 'Loading...',
  loadMoreText = 'Load More Products',
  noMoreText = 'No more products to load'
}) => {
  if (!hasMore && !isLoading) {
    return (
      <div className="loadmore-end">
        <div className="loadmore-line"></div>
        <span>{noMoreText}</span>
        <div className="loadmore-line"></div>
      </div>
    );
  }
  
  return (
    <div className="loadmore-container">
      <button
        className="loadmore-button"
        onClick={onLoadMore}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span className="loadmore-spinner"></span>
            {loadingText}
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            {loadMoreText}
          </>
        )}
      </button>
    </div>
  );
};