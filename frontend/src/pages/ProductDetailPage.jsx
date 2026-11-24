import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { QuantitySelector } from '../components/common/QuantitySelector';
import { RatingStars } from '../components/common/RatingStars';
import { ProductCard } from '../components/common/ProductCard';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';   // ✅ added
import { useToast } from '../components/common/ToastNotification';
import { getProduct } from '../services/product';
import { formatMoney } from '../utils/money';
import { Heart } from '@phosphor-icons/react/dist/csr/Heart';
import { readStoredArray, writeStoredArray } from '../utils/comparison';

export default function ProductDetailPage() {
  const { id } = useParams();
  return <ProductDetail key={id} id={id} />;
}

function ProductDetail({ id }) {
  const navigate = useNavigate();
  const { addToCart, isUpdating } = useCart();
  const { isAuthenticated } = useAuth();   // ✅ authentication status
  const showToast = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [saved, setSaved] = useState(() => readStoredArray('wishlist').some(item => String(item.id) === String(id)));
  useEffect(() => {
    const refresh = () => setSaved(readStoredArray('wishlist').some(item => String(item.id) === String(id)));
    window.addEventListener('wishlistUpdated', refresh); window.addEventListener('storage', refresh);
    return () => { window.removeEventListener('wishlistUpdated', refresh); window.removeEventListener('storage', refresh); };
  }, [id]);
  function toggleSaved() {
    const current = readStoredArray('wishlist');
    const exists = current.some(item => String(item.id) === String(id));
    const next = exists ? current.filter(item => String(item.id) !== String(id)) : [...current, { id: product.id, name: product.name, image: product.image }];
    if (!writeStoredArray('wishlist', next)) { showToast('Your browser could not save your wishlist. Please retry.', 'error'); return; }
    setSaved(!exists); window.dispatchEvent(new Event('wishlistUpdated'));
    showToast(exists ? 'Removed from wishlist.' : 'Saved to your wishlist.', 'info');
  }

  useEffect(() => {
    window.scrollTo(0, 0);
    const controller = new AbortController();
    const fetchProduct = async () => {
    try {
      const response = await getProduct(id, { signal: controller.signal });
      if (controller.signal.aborted) return;
      const { product: productData, related_products } = response.data.data;

      // Parse specifications if it's a JSON string
      if (typeof productData.specifications === 'string') {
        try {
          productData.specifications = JSON.parse(productData.specifications);
        } catch {
          productData.specifications = {};
        }
      } else if (!productData.specifications || typeof productData.specifications !== 'object') {
        productData.specifications = {};
      }

      // Parse features if it's a JSON string
      if (typeof productData.features === 'string') {
        try {
          productData.features = JSON.parse(productData.features);
        } catch {
          productData.features = [];
        }
      } else if (!Array.isArray(productData.features)) {
        productData.features = [];
      }

      productData.features = Array.isArray(productData.features) ? productData.features.filter(feature => typeof feature === 'string') : [];
      productData.specifications = productData.specifications && typeof productData.specifications === 'object' && !Array.isArray(productData.specifications) ? productData.specifications : {};
      setProduct(productData);
      setRelatedProducts(related_products || []);
    } catch (error) {
      if (!controller.signal.aborted) setError(error.response?.status === 404 ? 'Product not found' : 'Could not load this product. Please try again.');
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
    };
    void fetchProduct();
    return () => controller.abort();
  }, [id]);

  const handleAddToCart = async () => {
    if (adding) return;
    if (!isAuthenticated) {
      showToast('Please log in to add items to your cart.', 'info');
      navigate('/login', { state: { from: `/product/${id}` } });
      return;
    }
    if (product && product.stock > 0) {
      setAdding(true);
      const success = await addToCart(product, quantity);
      setAdding(false);
      showToast(success ? `${quantity} × ${product.name} added to cart!` : 'Could not add this quantity. Check availability and retry.', success ? 'success' : 'error');
    }
  };

  const handleBuyNow = async () => {
    if (adding) return;
    if (!isAuthenticated) {
      showToast('Please log in to proceed.', 'info');
      navigate('/login', { state: { from: `/product/${id}` } });
      return;
    }
    if (product && product.stock > 0) {
      setAdding(true);
      const success = await addToCart(product, quantity);
      setAdding(false);
      if (success) navigate('/cart');
      else showToast('Could not add this quantity. Check availability and retry.', 'error');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="product-detail-loading" role="status" aria-label="Loading product details">
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
          <p>Browse the shop for available products, or try loading this page again.</p>
          <Link to="/shop" className="btn-primary">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <div className="container">
        <Breadcrumb 
          items={[
            { name: 'Home', path: '/' },
            { name: 'Shop', path: '/shop' },
            { name: product.category || 'Category', path: `/shop?category=${encodeURIComponent(product.category)}` },
            { name: product.name }
          ]}
        />

        {/* Product Main Section */}
        <div className="product-detail-grid">
          {/* Product Gallery */}
          <div className="product-gallery">
            <div className="main-image">
              <img
                src={product.image || '/product-placeholder.svg'}
                alt={product.name}
                onError={(e) => { e.target.onerror = null; e.target.src = '/product-placeholder.svg'; }}
              />
              {product.discount > 0 && (
                <div className="discount-badge">-{product.discount}%</div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="product-info-detail">
            <div className="product-brand">{product.brand || ''}</div>
            <h1 className="product-title-detail">{product.name}</h1>
            
            <div className="product-rating-section">
              <RatingStars rating={product.rating || 0} totalReviews={product.reviews || 0} />
              <span className="review-link">
                <button type="button" onClick={() => { setActiveTab('reviews'); document.getElementById('product-information')?.scrollIntoView({ behavior: 'instant', block: 'start' }); }}>Rating summary</button>
              </span>
            </div>

            <div className="product-price-section">
              {Number(product.original_price) > Number(product.price) ? (
                <>
                  <span className="price-current">{formatMoney(product.price)}</span>
                  <span className="price-original">{formatMoney(product.original_price)}</span>
                  <span className="price-saved">Save {formatMoney(Number(product.original_price) - Number(product.price))}</span>
                </>
              ) : (
                <span className="price-current">{formatMoney(product.price)}</span>
              )}
            </div>

            <div className="product-description-short">
              <p>{product.description || 'No description available.'}</p>
            </div>

            {/* Stock Status */}
            <div className="stock-status">
              {product.stock > 0 ? (
                <div className="in-stock">
                  <span className="stock-dot"></span>
                  In Stock | {product.stock} units available
                </div>
              ) : (
                <div className="out-of-stock">Out of Stock</div>
              )}
            </div>

            <div className="product-sku">SKU: {product.sku || product.id}</div>

            {/* Quantity & Add to Cart */}
            <div className="product-actions">
              <div className="quantity-wrapper">
                <QuantitySelector
                  initialQuantity={1}
                  min={1}
                  max={Math.max(1, Math.min(Number(product.stock), 99))}
                  disabled={product.stock <= 0 || adding || isUpdating}
                  showLabel
                  onChange={setQuantity}
                  size="lg"
                />
              </div>

              <div className="action-buttons">
                <button 
                  className="add-to-cart-btn-detail"
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0 || adding || isUpdating}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1"/>
                    <circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                  </svg>
                  {adding ? 'Adding…' : product.stock > 0 ? 'Add to cart' : 'Out of stock'}
                </button>
                
                <button 
                  className="buy-now-btn"
                  onClick={handleBuyNow}
                  disabled={product.stock <= 0 || adding || isUpdating}
                >
                  Add and view cart
                </button>
              </div>
              <button type="button" className="commerce-save" aria-pressed={saved} onClick={toggleSaved}><Heart size={19} weight={saved ? 'fill' : 'regular'} aria-hidden="true" />{saved ? 'Saved to wishlist' : 'Save to wishlist'}</button>
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
                <span>Shipping and taxes confirmed at checkout</span>
              </div>
              <div className="shipping-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
                <span>Stock checked again when you add to cart</span>
              </div>
              <div className="shipping-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <span>Questions? <Link to="/contact">Contact our team</Link> before ordering</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="product-tabs" id="product-information">
          <div className="tabs-header">
            <button type="button" aria-pressed={activeTab === 'description'} className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`} onClick={() => setActiveTab('description')}>Description</button>
            <button type="button" aria-pressed={activeTab === 'specifications'} className={`tab-btn ${activeTab === 'specifications' ? 'active' : ''}`} onClick={() => setActiveTab('specifications')}>Specifications</button>
            <button type="button" aria-pressed={activeTab === 'features'} className={`tab-btn ${activeTab === 'features' ? 'active' : ''}`} onClick={() => setActiveTab('features')}>Features</button>
            <button type="button" aria-pressed={activeTab === 'reviews'} className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>Reviews ({(product.reviews || 0).toLocaleString()})</button>
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
                  <table className="specs-table" aria-label="Product specifications">
                    <tbody>
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <tr key={key}>
                          <th scope="row" className="spec-label">{key.replaceAll('_', ' ').replace(/^./, c => c.toUpperCase())}</th>
                          <td className="spec-value">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</td>
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
                          <path d="M20 6L9 17l-5-5"/>
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
                  <p>Customer rating summary. Written reviews are not available on this page.</p>
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
                  brand={product.brand}
                  stock={product.stock}
                  name={product.name}
                  price={product.price}
                  originalPrice={product.original_price}
                  image={product.image}
                  rating={product.rating}
                  reviews={product.reviews}
                  discount={product.discount}
                  isNew={product.is_new}
                  isFeatured={product.is_featured}
                  onAddToCart={async () => {
                    if (!isAuthenticated) {
                      showToast('Please log in to add items to your cart.', 'info');
                      navigate('/login');
                      return;
                    }
                    const success = await addToCart(product, 1);
                    showToast(success ? `1 × ${product.name} added to cart!` : 'Could not add this item. Check stock and retry.', success ? 'success' : 'error');
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
