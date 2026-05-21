import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export const ProductCard = ({ 
  id,
  name, 
  price, 
  originalPrice, 
  image, 
  rating = 0, 
  reviews = 0,
  discount = null,
  isNew = false,
  isFeatured = false,
  onAddToCart,
  onAddToWishlist
}) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // ✅ Convert price and originalPrice to numbers safely
  const numericPrice = parseFloat(price) || 0;
  const numericOriginalPrice = originalPrice ? (parseFloat(originalPrice) || 0) : 0;

  // Calculate discount if not provided
  const discountPercentage = discount || (numericOriginalPrice > 0 ? Math.round(((numericOriginalPrice - numericPrice) / numericOriginalPrice) * 100) : 0);
  
  // Generate star rating
  const renderStars = () => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    return (
      <>
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} className="star star-full">★</span>
        ))}
        {halfStar && <span className="star star-half">½</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} className="star star-empty">☆</span>
        ))}
      </>
    );
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    onAddToWishlist?.(id);
  };

  return (
    <div 
      className={`product-card ${isHovered ? 'product-card-hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badges */}
      <div className="product-badges">
        {discountPercentage > 0 && (
          <span className="badge badge-discount">-{discountPercentage}%</span>
        )}
        {isNew && (
          <span className="badge badge-new">New</span>
        )}
        {isFeatured && (
          <span className="badge badge-featured">Featured</span>
        )}
      </div>

      {/* Wishlist Button */}
      <button 
        className={`wishlist-btn ${isWishlisted ? 'wishlist-active' : ''}`}
        onClick={handleWishlist}
        aria-label="Add to wishlist"
      >
        <svg className="wishlist-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </button>

      {/* Product Image */}
      <Link to={`/product/${id}`} className="product-image-link">
        <div className="product-image-wrapper">
          <img 
            src={image} 
            alt={name} 
            className="product-image"
            loading="lazy"
          />
          {isHovered && (
            <div className="product-overlay">
              <div className="quick-view-btn">Quick View</div>
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="product-info">
        <Link to={`/product/${id}`} className="product-title-link">
          <h3 className="product-title">{name}</h3>
        </Link>

        {/* Rating */}
        <div className="product-rating">
          <div className="stars">{renderStars()}</div>
          {reviews > 0 && <span className="reviews-count">({reviews})</span>}
        </div>

        {/* Price */}
        <div className="product-price-section">
          {numericOriginalPrice > numericPrice ? (
            <>
              <span className="current-price">${numericPrice.toFixed(2)}</span>
              <span className="original-price">${numericOriginalPrice.toFixed(2)}</span>
              <span className="saved-badge">Save ${(numericOriginalPrice - numericPrice).toFixed(2)}</span>
            </>
          ) : (
            <span className="current-price">${numericPrice.toFixed(2)}</span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button 
          className="add-to-cart-btn"
          onClick={() => onAddToCart?.(id)}
        >
          <svg className="cart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1"/>
            <circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          Add to Cart
        </button>
      </div>
    </div>
  );
};