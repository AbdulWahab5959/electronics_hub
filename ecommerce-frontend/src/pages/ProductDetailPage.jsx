// src/pages/ProductDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { QuantitySelector } from '../components/common/QuantitySelector';
import { RatingStars } from '../components/common/RatingStars';
import { ProductCard } from '../components/common/ProductCard';
import { useCart } from '../hooks/useCart';
import { useToast } from '../components/common/ToastNotification';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const showToast = useToast();
  
  // State
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Mock product data (replace with API call)
  const mockProduct = {
    id: parseInt(id),
    name: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
    brand: "Sony",
    price: 349.99,
    originalPrice: 399.99,
    discount: 12,
    rating: 4.8,
    reviews: 5678,
    description: "Experience unparalleled noise cancellation and premium sound quality with the Sony WH-1000XM5 headphones. Industry-leading noise cancellation with Dual Noise Sensor technology. Exceptional sound quality with Sony's HD Noise Cancelling Processor QN1. Ultra-comfortable design with soft fit leather. Up to 30 hours of battery life with quick charging (3 minutes charge gives 3 hours playback).",
    specifications: {
      brand: "Sony",
      model: "WH-1000XM5",
      color: "Black",
      connectivity: "Bluetooth 5.2",
      batteryLife: "30 hours",
      chargingTime: "3.5 hours",
      weight: "250g",
      warranty: "1 year",
    },
    features: [
      "Industry-leading noise cancellation",
      "Premium sound quality",
      "30-hour battery life",
      "Quick charging support",
      "Multipoint connection",
      "Speak-to-chat technology",
      "Adaptive sound control",
      "Wearing detection",
    ],
    inStock: true,
    stockCount: 45,
    sku: "SONY-WH1000XM5-BLK",
    images: [
      "https://placehold.co/600x600/3b82f6/white?text=Headphone+Front",
      "https://placehold.co/600x600/8b5cf6/white?text=Headphone+Side",
      "https://placehold.co/600x600/10b981/white?text=Headphone+Back",
      "https://placehold.co/600x600/f59e0b/white?text=Headphone+Case",
    ],
    category: "headphones",
    tags: ["wireless", "noise-cancelling", "premium", "sony"],
  };

  // Related products
  const mockRelatedProducts = [
    {
      id: 2,
      name: "Bose QuietComfort Earbuds",
      price: 249.99,
      originalPrice: 299.99,
      image: "https://placehold.co/400x400/06b6d4/white?text=Bose",
      rating: 4.7,
      reviews: 1567,
      discount: 17,
    },
    {
      id: 3,
      name: "Apple AirPods Pro 2",
      price: 199.99,
      originalPrice: 249.99,
      image: "https://placehold.co/400x400/6366f1/white?text=AirPods",
      rating: 4.9,
      reviews: 8921,
      discount: 20,
    },
    {
      id: 4,
      name: "Sennheiser Momentum 4",
      price: 299.99,
      originalPrice: 349.99,
      image: "https://placehold.co/400x400/ec4899/white?text=Sennheiser",
      rating: 4.6,
      reviews: 2345,
      discount: 14,
    },
  ];

  useEffect(() => {
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchProduct = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setProduct(mockProduct);
      setRelatedProducts(mockRelatedProducts);
      setLoading(false);
    }, 500);
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

  if (!product) {
    return (
      <div className="product-not-found">
        <div className="container">
          <h2>Product Not Found</h2>
          <p>The product you're looking for doesn't exist.</p>
          <Link to="/shop" className="btn-primary">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <Breadcrumb 
          items={[
            { name: 'Home', path: '/' },
            { name: 'Shop', path: '/shop' },
            { name: product.category, path: `/category/${product.category}` },
            { name: product.name }
          ]}
        />

        {/* Product Main Section */}
        <div className="product-detail-grid">
          {/* Product Gallery */}
          <div className="product-gallery">
            <div className="main-image">
              <img src={product.images[selectedImage]} alt={product.name} />
              {product.discount > 0 && (
                <div className="discount-badge">-{product.discount}%</div>
              )}
            </div>
            <div className="thumbnail-list">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img src={img} alt={`${product.name} view ${index + 1}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="product-info-detail">
            <div className="product-brand">{product.brand}</div>
            <h1 className="product-title-detail">{product.name}</h1>
            
            <div className="product-rating-section">
              <RatingStars rating={product.rating} totalReviews={product.reviews} />
              <span className="review-link">
                <Link to="#reviews">See all {product.reviews.toLocaleString()} reviews</Link>
              </span>
            </div>

            <div className="product-price-section">
              {product.originalPrice > product.price ? (
                <>
                  <span className="price-current">${product.price.toFixed(2)}</span>
                  <span className="price-original">${product.originalPrice.toFixed(2)}</span>
                  <span className="price-saved">Save ${(product.originalPrice - product.price).toFixed(2)}</span>
                </>
              ) : (
                <span className="price-current">${product.price.toFixed(2)}</span>
              )}
            </div>

            <div className="product-description-short">
              <p>{product.description.substring(0, 200)}...</p>
            </div>

            {/* Stock Status */}
            <div className="stock-status">
              {product.inStock ? (
                <div className="in-stock">
                  <span className="stock-dot"></span>
                  In Stock | {product.stockCount} units available
                </div>
              ) : (
                <div className="out-of-stock">Out of Stock</div>
              )}
            </div>

            {/* SKU */}
            <div className="product-sku">SKU: {product.sku}</div>

            {/* Quantity & Add to Cart */}
            <div className="product-actions">
              <div className="quantity-wrapper">
                <label>Quantity:</label>
                <QuantitySelector
                  initialQuantity={1}
                  min={1}
                  max={product.stockCount}
                  onChange={setQuantity}
                  size="lg"
                />
              </div>

              <div className="action-buttons">
                <button 
                  className="add-to-cart-btn-detail"
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
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
                  disabled={!product.inStock}
                >
                  Buy Now
                </button>
              </div>

              <button 
                className={`wishlist-btn-detail ${isWishlisted ? 'active' : ''}`}
                onClick={handleAddToWishlist}
              >
                <svg viewBox="0 0 24 24" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                {isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </button>
            </div>

            {/* Shipping Info */}
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
              Reviews ({product.reviews.toLocaleString()})
            </button>
          </div>

          <div className="tabs-content">
            {activeTab === 'description' && (
              <div className="tab-description">
                <p>{product.description}</p>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="tab-specifications">
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
              </div>
            )}

            {activeTab === 'features' && (
              <div className="tab-features">
                <ul className="features-list">
                  {product.features.map((feature, index) => (
                    <li key={index}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="tab-reviews">
                <div className="reviews-summary">
                  <div className="average-rating">
                    <span className="rating-number">{product.rating}</span>
                    <RatingStars rating={product.rating} size="lg" />
                    <span className="total-reviews">Based on {product.reviews.toLocaleString()} reviews</span>
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
                  {...product}
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