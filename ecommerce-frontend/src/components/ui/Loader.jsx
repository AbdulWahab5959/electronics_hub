// src/components/ui/Loader.jsx
import React from 'react';

// ============================================
// MAIN LOADER COMPONENT
// ============================================
export const Loader = ({ 
  size = 'md',        // sm, md, lg
  type = 'spinner',   // spinner, dots, pulse
  fullScreen = false,
  text = '',
  color = 'primary'   // primary, white, success, danger
}) => {
  const sizeClasses = {
    sm: 'loader-sm',
    md: 'loader-md',
    lg: 'loader-lg'
  };

  // Different loader types
  const renderLoader = () => {
    switch (type) {
      case 'dots':
        return (
          <div className={`loader-dots-premium ${sizeClasses[size]}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        );
      case 'pulse':
        return (
          <div className={`loader-pulse-premium ${sizeClasses[size]}`}>
            <div></div>
            <div></div>
            <div></div>
          </div>
        );
      default:
        return (
          <div className={`loader-spinner-premium ${sizeClasses[size]} spinner-${color}`}>
            <svg viewBox="0 0 50 50">
              <circle cx="25" cy="25" r="20" fill="none" />
            </svg>
          </div>
        );
    }
  };

  // Full screen overlay
  if (fullScreen) {
    return (
      <div className="loader-fullscreen-premium">
        <div className="loader-fullscreen-content">
          {renderLoader()}
          {text && <p className="loader-fullscreen-text">{text}</p>}
        </div>
      </div>
    );
  }

  // Inline loader
  return (
    <div className="loader-container-premium">
      {renderLoader()}
      {text && <span className="loader-text-premium">{text}</span>}
    </div>
  );
};

// ============================================
// SKELETON LOADER - MOST IMPORTANT FOR E-COMMERCE
// ============================================
export const SkeletonLoader = ({ 
  type = 'product',   // product, cart-item, text, product-grid, category
  count = 1,
  columns = 4
}) => {
  
  const renderSkeleton = () => {
    switch (type) {
      // Product card skeleton (for shop page)
      case 'product':
        return (
          <div className="skeleton-product-premium">
            <div className="skeleton-image shimmer"></div>
            <div className="skeleton-title shimmer"></div>
            <div className="skeleton-rating shimmer"></div>
            <div className="skeleton-price shimmer"></div>
            <div className="skeleton-button shimmer"></div>
          </div>
        );
      
      // Product grid skeleton (responsive columns)
      case 'product-grid':
        return (
          <div className="skeleton-product-grid-premium" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {[...Array(count)].map((_, i) => (
              <div key={i} className="skeleton-product-premium">
                <div className="skeleton-image shimmer"></div>
                <div className="skeleton-title shimmer"></div>
                <div className="skeleton-rating shimmer"></div>
                <div className="skeleton-price shimmer"></div>
              </div>
            ))}
          </div>
        );
      
      // Cart item skeleton
      case 'cart-item':
        return (
          <div className="skeleton-cart-premium">
            <div className="skeleton-cart-image shimmer"></div>
            <div className="skeleton-cart-details">
              <div className="skeleton-title shimmer"></div>
              <div className="skeleton-price shimmer"></div>
              <div className="skeleton-quantity shimmer"></div>
            </div>
          </div>
        );
      
      // Text lines skeleton
      case 'text':
        return (
          <div className="skeleton-text-premium">
            <div className="skeleton-line shimmer"></div>
            <div className="skeleton-line shimmer"></div>
            <div className="skeleton-line-small shimmer"></div>
          </div>
        );
      
      // Category card skeleton
      case 'category':
        return (
          <div className="skeleton-category-premium">
            <div className="skeleton-category-image shimmer"></div>
            <div className="skeleton-category-title shimmer"></div>
          </div>
        );
      
      // Order summary skeleton
      case 'order-summary':
        return (
          <div className="skeleton-order-premium">
            <div className="skeleton-line shimmer"></div>
            <div className="skeleton-line shimmer"></div>
            <div className="skeleton-line shimmer"></div>
            <div className="skeleton-divider shimmer"></div>
            <div className="skeleton-line-large shimmer"></div>
          </div>
        );
      
      default:
        return null;
    }
  };

  // Return single skeleton
  if (count === 1) {
    return <div className="skeleton-wrapper-premium">{renderSkeleton()}</div>;
  }

  // Return multiple skeletons
  return (
    <div className="skeleton-wrapper-premium">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="skeleton-item-premium">
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
};

// ============================================
// BUTTON LOADER (For forms and buttons)
// ============================================
export const ButtonLoader = ({ text = 'Loading...', size = 'sm' }) => {
  return (
    <span className="button-loader-premium">
      <span className="button-spinner"></span>
      {text}
    </span>
  );
};

// ============================================
// PAGE LOADER (For route transitions)
// ============================================
export const PageLoader = () => {
  return (
    <div className="page-loader-premium">
      <div className="page-loader-content">
        <div className="page-loader-logo">🛒</div>
        <div className="page-loader-bar">
          <div className="page-loader-progress"></div>
        </div>
      </div>
    </div>
  );
};