import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from '@phosphor-icons/react/dist/csr/Heart';
import { ShoppingCartSimple } from '@phosphor-icons/react/dist/csr/ShoppingCartSimple';
import { Star } from '@phosphor-icons/react/dist/csr/Star';
import { StarHalf } from '@phosphor-icons/react/dist/csr/StarHalf';
import { formatMoney } from '../../utils/money';
import { readStoredArray, writeStoredArray } from '../../utils/comparison';
import { useToast } from './ToastNotification';

export const ProductCard = ({
  id,
  name,
  brand,
  price,
  originalPrice,
  original_price,
  image,
  rating = 0,
  reviews = 0,
  discount = null,
  isNew,
  is_new,
  inStock = true,
  stock,
  onAddToCart,
}) => {
  const showToast = useToast();
  const [isWishlisted, setIsWishlisted] = useState(() => {
    const wishlist = readStoredArray('wishlist');
    return wishlist.some((item) => String(item.id) === String(id));
  });
  useEffect(() => {
    const refresh = () => setIsWishlisted(readStoredArray('wishlist').some(item => String(item.id) === String(id)));
    window.addEventListener('wishlistUpdated', refresh); window.addEventListener('storage', refresh);
    return () => { window.removeEventListener('wishlistUpdated', refresh); window.removeEventListener('storage', refresh); };
  }, [id]);

  const numericPrice = Number(price) || 0;
  const numericOriginalPrice = Number(originalPrice ?? original_price) || 0;
  const numericRating = Math.min(5, Math.max(0, Number(rating) || 0));
  const isNewProduct = Boolean(isNew ?? is_new);
  const productInStock = stock === undefined ? inStock : Number(stock) > 0;

  const discountPercentage =
    Number(discount) ||
    (numericOriginalPrice > 0
      ? Math.round(((numericOriginalPrice - numericPrice) / numericOriginalPrice) * 100)
      : 0);

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const product = {
      id,
      name,
      brand,
      price: numericPrice,
      originalPrice: numericOriginalPrice,
      image,
      rating,
      reviews,
      discount: discountPercentage,
      isNew: isNewProduct,
      inStock: productInStock,
    };

    const wishlist = readStoredArray('wishlist');
    const exists = wishlist.some((item) => String(item.id) === String(id));

    let updatedWishlist;

    if (exists) {
      updatedWishlist = wishlist.filter((item) => String(item.id) !== String(id));
    } else {
      updatedWishlist = [...wishlist, product];
    }

    if (!writeStoredArray('wishlist', updatedWishlist)) {
      showToast('Your browser could not save your wishlist. Please try again.', 'error');
      return;
    }
    setIsWishlisted(!exists);

    window.dispatchEvent(new Event('wishlistUpdated'));
  };

  const renderStars = () => {
    return (
      <>
        {[...Array(5)].map((_, index) => {
          const value = numericRating - index;
          const isFull = value >= 1;
          const isHalf = !isFull && value >= 0.5;
          const StarIcon = isHalf ? StarHalf : Star;

          return (
            <StarIcon
              key={index}
              className={`star ${isFull || isHalf ? 'star-full' : 'star-empty'}`}
              size={14}
              weight={isFull || isHalf ? 'fill' : 'regular'}
              aria-hidden="true"
            />
          );
        })}
      </>
    );
  };

  return (
    <article className="product-card">
      <div className="product-badges">
        {discountPercentage > 0 && (
          <span className="badge badge-discount">Save {discountPercentage}%</span>
        )}

        {isNewProduct && <span className="badge badge-new">New</span>}
      </div>

      <button
        type="button"
        className={`wishlist-btn ${isWishlisted ? 'wishlist-active' : ''}`}
        onClick={handleWishlist}
        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart
          className="wishlist-icon"
          size={19}
          weight={isWishlisted ? 'fill' : 'regular'}
          aria-hidden="true"
        />
      </button>

      <Link to={`/product/${id}`} className="product-image-link" aria-label={`View ${name}`}>
        <div className="product-image-wrapper">
          <img
            src={image}
            alt={name}
            className="product-image"
            loading="lazy"
            decoding="async"
          />
        </div>
      </Link>

      <div className="product-info">
        {brand && <p className="product-brand">{brand}</p>}
        <Link to={`/product/${id}`} className="product-title-link">
          <h3 className="product-title">{name}</h3>
        </Link>

        {numericRating > 0 && (
          <div className="product-rating" role="img" aria-label={`Rated ${numericRating.toFixed(1)} out of 5`}>
            <div className="stars" aria-hidden="true">{renderStars()}</div>
            <span className="rating-value">{numericRating.toFixed(1)}</span>
            {reviews > 0 && <span className="reviews-count">({reviews})</span>}
          </div>
        )}

        <div className="product-price-section">
          {numericOriginalPrice > numericPrice ? (
            <>
              <span className="current-price">{formatMoney(numericPrice)}</span>
              <span className="original-price">{formatMoney(numericOriginalPrice)}</span>
            </>
          ) : (
            <span className="current-price">{formatMoney(numericPrice)}</span>
          )}
        </div>

        <button
          type="button"
          className="add-to-cart-btn"
          onClick={() => onAddToCart?.(id)}
          disabled={!productInStock}
        >
          <ShoppingCartSimple className="cart-icon" size={18} weight="regular" aria-hidden="true" />

          {productInStock ? 'Add to cart' : 'Out of stock'}
        </button>
      </div>
    </article>
  );
};
