// src/pages/WishlistPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ui/ToastNotification';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { Button } from '../components/common/Button';

export default function WishlistPage() {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const showToast = useToast();
  
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(null);

  // Load wishlist from localStorage
  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = () => {
    setLoading(true);
    const savedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setWishlistItems(savedWishlist);
    setLoading(false);
  };

  // Add to cart and remove from wishlist
  const handleAddToCart = async (product) => {
    setAddingToCart(product.id);
    
    // Add to cart
    addToCart(product, 1);
    
    // Remove from wishlist
    const updatedWishlist = wishlistItems.filter(item => item.id !== product.id);
    setWishlistItems(updatedWishlist);
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    
    showToast(`${product.name} added to cart!`, 'success');
    setAddingToCart(null);
  };

  // Remove from wishlist only
  const handleRemoveFromWishlist = (productId, productName) => {
    const updatedWishlist = wishlistItems.filter(item => item.id !== productId);
    setWishlistItems(updatedWishlist);
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    showToast(`${productName} removed from wishlist`, 'info');
  };

  // Move all items to cart
  const handleMoveAllToCart = () => {
    wishlistItems.forEach(item => {
      addToCart(item, 1);
    });
    setWishlistItems([]);
    localStorage.setItem('wishlist', '[]');
    showToast(`All items moved to cart!`, 'success');
  };

  // Clear entire wishlist
  const handleClearWishlist = () => {
    setWishlistItems([]);
    localStorage.setItem('wishlist', '[]');
    showToast('Wishlist cleared', 'info');
  };

  if (!isAuthenticated) {
    return (
      <div className="wishlist-page">
        <div className="container">
          <div className="auth-required-wishlist">
            <div className="auth-icon">❤️</div>
            <h2>Please Login to View Wishlist</h2>
            <p>Sign in to access your saved items</p>
            <Link to="/login" className="btn-primary">Login Now</Link>
            <Link to="/register" className="btn-secondary">Create Account</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="container">
        {/* Breadcrumb */}
        <Breadcrumb 
          items={[
            { name: 'Home', path: '/' },
            { name: 'Wishlist', path: '/wishlist' }
          ]}
        />

        {/* Page Header */}
        <div className="wishlist-header">
          <div>
            <h1>My Wishlist</h1>
            <p>Products you've saved for later</p>
          </div>
          {wishlistItems.length > 0 && (
            <div className="header-actions">
              <button onClick={handleMoveAllToCart} className="move-all-btn">
                🛒 Move All to Cart
              </button>
              <button onClick={handleClearWishlist} className="clear-all-btn">
                🗑️ Clear All
              </button>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="wishlist-loading">
            <div className="loader-spinner-premium loader-lg"></div>
            <p>Loading your wishlist...</p>
          </div>
        )}

        {/* Empty Wishlist */}
        {!loading && wishlistItems.length === 0 && (
          <div className="empty-wishlist">
            <div className="empty-icon">❤️</div>
            <h3>Your wishlist is empty</h3>
            <p>Save items you love to your wishlist and they'll appear here.</p>
            <div className="empty-actions">
              <Link to="/shop" className="btn-primary">Start Shopping</Link>
              <Link to="/deals" className="btn-secondary">View Deals</Link>
            </div>
            <div className="featured-categories">
              <h4>Popular Categories</h4>
              <div className="categories-links">
                <Link to="/category/laptops">💻 Laptops</Link>
                <Link to="/category/headphones">🎧 Headphones</Link>
                <Link to="/category/smartwatches">⌚ Smartwatches</Link>
                <Link to="/category/gaming">🎮 Gaming</Link>
              </div>
            </div>
          </div>
        )}

        {/* Wishlist Grid */}
        {!loading && wishlistItems.length > 0 && (
          <>
            <div className="wishlist-stats">
              <span className="items-count">
                {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} in wishlist
              </span>
            </div>

            <div className="wishlist-grid">
              {wishlistItems.map((item) => (
                <div key={item.id} className="wishlist-card">
                  {/* Product Image */}
                  <Link to={`/product/${item.id}`} className="wishlist-image">
                    <img src={item.image} alt={item.name} />
                    {item.discount > 0 && (
                      <span className="discount-badge">-{item.discount}%</span>
                    )}
                  </Link>

                  {/* Product Info */}
                  <div className="wishlist-info">
                    <Link to={`/product/${item.id}`} className="product-title">
                      {item.name}
                    </Link>
                    
                    <div className="product-price">
                      <span className="current-price">${item.price.toFixed(2)}</span>
                      {item.originalPrice > item.price && (
                        <span className="original-price">${item.originalPrice.toFixed(2)}</span>
                      )}
                    </div>

                    {/* Rating */}
                    {item.rating && (
                      <div className="product-rating">
                        <div className="stars">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < Math.floor(item.rating) ? 'star filled' : 'star'}>
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="review-count">({item.reviews})</span>
                      </div>
                    )}

                    {/* Stock Status */}
                    <div className="stock-status">
                      {item.inStock !== false ? (
                        <span className="in-stock">✓ In Stock</span>
                      ) : (
                        <span className="out-of-stock">Out of Stock</span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="wishlist-actions">
                      <button 
                        className="add-to-cart-wishlist"
                        onClick={() => handleAddToCart(item)}
                        disabled={addingToCart === item.id || item.inStock === false}
                      >
                        {addingToCart === item.id ? (
                          <>
                            <span className="btn-spinner-small"></span>
                            Adding...
                          </>
                        ) : (
                          <>
                            🛒 Add to Cart
                          </>
                        )}
                      </button>
                      <button 
                        className="remove-wishlist"
                        onClick={() => handleRemoveFromWishlist(item.id, item.name)}
                      >
                        🗑️ Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Continue Shopping */}
            <div className="continue-shopping-wishlist">
              <Link to="/shop" className="continue-link">
                ← Continue Shopping
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}