import React, { useEffect, useState } from 'react';
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
  inStock = true,
  onAddToCart,
}) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const numericPrice = parseFloat(price) || 0;
  const numericOriginalPrice = originalPrice ? parseFloat(originalPrice) || 0 : 0;

  const discountPercentage =
    discount ||
    (numericOriginalPrice > 0
      ? Math.round(((numericOriginalPrice - numericPrice) / numericOriginalPrice) * 100)
      : 0);

  useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setIsWishlisted(wishlist.some((item) => item.id === id));
  }, [id]);

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const product = {
      id,
      name,
      price: numericPrice,
      originalPrice: numericOriginalPrice,
      image,
      rating,
      reviews,
      discount: discountPercentage,
      isNew,
      isFeatured,
      inStock,
    };

    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const exists = wishlist.some((item) => item.id === id);

    let updatedWishlist;

    if (exists) {
      updatedWishlist = wishlist.filter((item) => item.id !== id);
      setIsWishlisted(false);
    } else {
      updatedWishlist = [...wishlist, product];
      setIsWishlisted(true);
    }

    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));

    window.dispatchEvent(new Event('wishlistUpdated'));
  };

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

  return (
    <div
      className={`product-card ${isHovered ? 'product-card-hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="product-badges">
        {discountPercentage > 0 && (
          <span className="badge badge-discount">-{discountPercentage}%</span>
        )}

        {isNew && <span className="badge badge-new">New</span>}

        {isFeatured && <span className="badge badge-featured">Featured</span>}
      </div>

      <button
        type="button"
        className={`wishlist-btn ${isWishlisted ? 'wishlist-active' : ''}`}
        onClick={handleWishlist}
        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <svg
          className="wishlist-icon"
          viewBox="0 0 24 24"
          fill={isWishlisted ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>

      <Link to={`/product/${id}`} className="product-image-link">
        <div className="product-image-wrapper">
          <img src={image} alt={name} className="product-image" loading="lazy" />

          {isHovered && (
            <div className="product-overlay">
              <div className="quick-view-btn">Quick View</div>
            </div>
          )}
        </div>
      </Link>

      <div className="product-info">
        <Link to={`/product/${id}`} className="product-title-link">
          <h3 className="product-title">{name}</h3>
        </Link>

        <div className="product-rating">
          <div className="stars">{renderStars()}</div>
          {reviews > 0 && <span className="reviews-count">({reviews})</span>}
        </div>

        <div className="product-price-section">
          {numericOriginalPrice > numericPrice ? (
            <>
              <span className="current-price">${numericPrice.toFixed(2)}</span>
              <span className="original-price">${numericOriginalPrice.toFixed(2)}</span>
              <span className="saved-badge">
                Save ${(numericOriginalPrice - numericPrice).toFixed(2)}
              </span>
            </>
          ) : (
            <span className="current-price">${numericPrice.toFixed(2)}</span>
          )}
        </div>

        <button
          type="button"
          className="add-to-cart-btn"
          onClick={() => onAddToCart?.(id)}
          disabled={!inStock}
        >
          <svg
            className="cart-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>

          {inStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
};