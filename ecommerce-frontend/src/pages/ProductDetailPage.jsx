import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { QuantitySelector } from '../components/common/QuantitySelector';
import { RatingStars } from '../components/common/RatingStars';
import { ProductCard } from '../components/common/ProductCard';
import { useCart } from '../hooks/useCart';
import { useToast } from '../components/common/ToastNotification';
import { getProduct, getProducts } from '../services/product'; // import real API functions

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const showToast = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
    window.scrollTo(0, 0);
    // reset quantity when product changes
    setQuantity(1);
    setSelectedImage(0);
  }, [id]);

const fetchProduct = async () => {
  setLoading(true);
  try {
    const response = await getProduct(id);
    const { product: productData, related_products } = response.data.data;

    // ✅ Parse specifications safely
    if (typeof productData.specifications === 'string') {
      try {
        productData.specifications = JSON.parse(productData.specifications);
      } catch {
        productData.specifications = {};  // fallback
      }
    } else if (!productData.specifications || typeof productData.specifications !== 'object') {
      productData.specifications = {};
    }

    // ✅ Parse features safely
    if (typeof productData.features === 'string') {
      try {
        productData.features = JSON.parse(productData.features);
      } catch {
        productData.features = [];   // fallback
      }
    } else if (!Array.isArray(productData.features)) {
      productData.features = [];
    }

    setProduct(productData);
    setRelatedProducts(related_products || []);
  } catch (error) {
    console.error('Failed to load product:', error);
    showToast('Failed to load product details', 'error');
    setProduct(null);
  } finally {
    setLoading(false);
  }
};

  const handleAddToCart = () => {
    if (product && product.inStock) {
      addToCart(product, quantity);
      showToast(`${quantity} × ${product.name} added to cart!`, 'success');
    }
  };

  const handleBuyNow = () => {
    if (product && product.inStock) {
      addToCart(product, quantity);
      navigate('/cart');
    }
  };

  const handleAddToWishlist = () => {
    setIsWishlisted(!isWishlisted);
    showToast(
      isWishlisted ? 'Removed from wishlist' : 'Added to wishlist',
      'success'
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="product-detail-loading">
        <div className="container">
          <div className="loading-skeleton">
            <div className="skeleton-gallery shimmer"></div>
            <div className="skeleton-info shimmer"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error or product not found
  if (error || !product) {
    return (
      <div className="product-not-found">
        <div className="container">
          <h2>{error || 'Product Not Found'}</h2>
          <p>The product you're looking for doesn't exist or has been removed.</p>
          <Link to="/shop" className="btn-primary">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  const images = product.images?.length
    ? product.images.map(img => img.url || img.path || img.image)
    : ['https://placehold.co/600x600?text=No+Image'];

  // Normalize discount percentage
  const discount = product.discount_percentage || product.discount || 
    (product.original_price && product.price 
      ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
      : 0);

  return (
    <div className="product-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <Breadcrumb 
          items={[
            { name: 'Home', path: '/' },
            { name: 'Shop', path: '/shop' },
            { name: product.category?.name || product.category_name || 'Category', path: `/shop?category=${product.category?.slug || product.category}` },
            { name: product.name }
          ]}
        />

        {/* Product Main Section */}
        <div className="product-detail-grid">
          {/* Product Gallery */}
          <div className="product-gallery">
            <div className="main-image">
              <img
                src={product.image || 'https://placehold.co/600x600?text=No+Image'}
                alt={product.name}
                onError={(e) => { e.target.src = 'https://placehold.co/600x600?text=No+Image'; }}
              />
              {product.discount > 0 && (
                <div className="discount-badge">-{product.discount}%</div>
              )}
            </div>
            {/* Only show thumbnails if you have more than one image – optional */}
            {false && (
              <div className="thumbnail-list">
                {/* ... */}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="product-info-detail">
            <div className="product-brand">{product.brand?.name || product.brand_name || ''}</div>
            <h1 className="product-title-detail">{product.name}</h1>
            
            <div className="product-rating-section">
              <RatingStars rating={product.rating || 0} totalReviews={product.reviews_count || 0} />
              <span className="review-link">
                <a href="#reviews">See all {(product.reviews_count || 0).toLocaleString()} reviews</a>
              </span>
            </div>

            <div className="product-price-section">
              {product.original_price > product.price ? (
                <>
                  <span className="price-current">${parseFloat(product.price).toFixed(2)}</span>
                  <span className="price-original">${parseFloat(product.original_price).toFixed(2)}</span>
                  <span className="price-saved">Save ${(parseFloat(product.original_price) - parseFloat(product.price)).toFixed(2)}</span>
                </>
              ) : (
                <span className="price-current">${parseFloat(product.price).toFixed(2)}</span>
              )}
            </div>

            <div className="product-description-short">
              <p>{product.description || 'No description available.'}</p>
            </div>

            {/* Stock Status */}
            <div className="stock-status">
              {product.inStock || product.stock > 0 ? (
                <div className="in-stock">
                  <span className="stock-dot"></span>
                  In Stock | {product.stock} units available
                </div>
              ) : (
                <div className="out-of-stock">Out of Stock</div>
              )}
            </div>

            {/* SKU */}
            <div className="product-sku">SKU: {product.sku || product.id}</div>

            {/* Quantity & Add to Cart */}
            <div className="product-actions">
              <div className="quantity-wrapper">
                <label>Quantity:</label>
                <QuantitySelector
                  initialQuantity={1}
                  min={1}
                  max={product.stock || 10}
                  onChange={setQuantity}
                  size="lg"
                />
              </div>

              <div className="action-buttons">
                <button 
                  className="add-to-cart-btn-detail"
                  onClick={handleAddToCart}
                  disabled={!(product.inStock || product.stock > 0)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1"/>
                    <circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                  </svg>
                  Add to Cart
                </button>
                
                <button 
                  className="buy-now-btn"
                  onClick={handleBuyNow}
                  disabled={!(product.inStock || product.stock > 0)}
                >
                  Buy Now
                </button>
              </div>
            </div>

            {/* Shipping Info (static, keep as is) */}
            <div className="shipping-info-detail">
              <div className="shipping-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 3h15v13H1z"/>
                  <path d="M16 8h4l3 3v5h-7V8z"/>
                  <circle cx="5.5" cy="18.5" r="2.5"/>
                  <circle cx="18.5" cy="18.5" r="2.5"/>
                </svg>
                <span>Free shipping on orders over $100</span>
              </div>
              <div className="shipping-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
                <span>24-month warranty included</span>
              </div>
              <div className="shipping-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <span>Secure payment & 30-day returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="product-tabs">
          <div className="tabs-header">
            <button
              className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
              onClick={() => setActiveTab('description')}
            >
              Description
            </button>
            <button
              className={`tab-btn ${activeTab === 'specifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('specifications')}
            >
              Specifications
            </button>
            <button
              className={`tab-btn ${activeTab === 'features' ? 'active' : ''}`}
              onClick={() => setActiveTab('features')}
            >
              Features
            </button>
            <button
              className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews ({(product.reviews || 0).toLocaleString()})
            </button>
          </div>

          <div className="tabs-content">
            {activeTab === 'description' && (
              <div className="tab-description">
                <p>{product.description || 'No description available.'}</p>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="tab-specifications">
                {product.specifications && Object.keys(product.specifications).length > 0 ? (
                  <table className="specs-table">
                    <tbody>
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <tr key={key}>
                          <td className="spec-label">{key.charAt(0).toUpperCase() + key.slice(1)}</td>
                          <td className="spec-value">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No specifications available.</p>
                )}
              </div>
            )}

            {activeTab === 'features' && (
              <div className="tab-features">
                {product.features && product.features.length > 0 ? (
                  <ul className="features-list">
                    {product.features.map((feature, index) => (
                      <li key={index}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No features listed.</p>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="tab-reviews">
                <div className="reviews-summary">
                  <div className="average-rating">
                    <span className="rating-number">{product.rating || 0}</span>
                    <RatingStars rating={product.rating || 0} size="lg" />
                    <span className="total-reviews">Based on {(product.reviews || 0).toLocaleString()} reviews</span>
                  </div>
                </div>
                <div className="review-form-prompt">
                  <p>Have you used this product? <Link to="/login">Log in</Link> to leave a review.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="related-products">
            <h2>You May Also Like</h2>
            <div className="related-products-grid">
              {relatedProducts.map(product => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  originalPrice={product.original_price}   // snake_case → camelCase
                  image={product.image}
                  rating={product.rating}
                  reviews={product.reviews}
                  discount={product.discount}
                  isNew={product.is_new}
                  isFeatured={product.is_featured}
                  onAddToCart={() => addToCart(product, 1)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}