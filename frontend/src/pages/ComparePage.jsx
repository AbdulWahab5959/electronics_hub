// src/pages/ComparePage.jsx
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from '@phosphor-icons/react/dist/csr/CheckCircle';
import { MagnifyingGlass } from '@phosphor-icons/react/dist/csr/MagnifyingGlass';
import { Scales } from '@phosphor-icons/react/dist/csr/Scales';
import { ShoppingCartSimple } from '@phosphor-icons/react/dist/csr/ShoppingCartSimple';
import { X } from '@phosphor-icons/react/dist/csr/X';
import { useCart } from '../hooks/useCart';
import { useToast } from '../components/common/ToastNotification';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { getProducts } from '../services/product';
import { useAuth } from '../hooks/useAuth';
import { formatMoney } from '../utils/money';
import { comparisonProductKey, readStoredArray, restoreComparison, writeStoredArray } from '../utils/comparison';

export default function ComparePage() {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const comparisonHeading = useRef(null);
  const showToast = useToast();
  
  const [compareItems, setCompareItems] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [category, setCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(8);
  const [reloadKey, setReloadKey] = useState(0);
  const [addingToCart, setAddingToCart] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const products = [];
        let page = 1;
        let lastPage = 1;
        do {
          const response = await getProducts({ page, per_page: 100, sort: 'name_asc' }, { signal: controller.signal });
          const data = response.data.data;
          products.push(...data.data.map(normalizeProduct));
          lastPage = data.last_page;
          page += 1;
        } while (page <= lastPage && !controller.signal.aborted);
        if (controller.signal.aborted) return;
        // Some catalogue records repeat the same model under different IDs.
        // Keep one stable record per brand and model name.
        const uniqueProducts = [...new Map(
          [...products].sort((a, b) => Number(b.id) - Number(a.id))
            .map(product => [comparisonProductKey(product), product]),
        ).values()].sort((a, b) => a.name.localeCompare(b.name));
        setAllProducts(uniqueProducts);
        const saved = readStoredArray('compareItems');
        const restored = restoreComparison(saved, uniqueProducts);
        setCompareItems(restored);
        setCategory(restored[0]?.category || '');
        if (!writeStoredArray('compareItems', restored)) {
          setNotice('Your browser could not save this comparison. You can still compare products during this visit.');
        } else if (restored.length !== saved.length) {
          setNotice('Your saved comparison was updated to keep available products from one category.');
        }
      } catch {
        if (!controller.signal.aborted) setError('Could not load the product catalogue. Please try again.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void load();
    return () => controller.abort();
  }, [reloadKey]);

  const categories = [...new Set(allProducts.map(product => product.category).filter(Boolean))].sort();
  const searchResults = allProducts.filter(product => product.category === category &&
    `${product.name} ${product.brand}`.toLowerCase().includes(searchTerm.trim().toLowerCase()));
  const changeCategory = (value) => {
    if (compareItems.length) {
      saveCompareItems([]);
      setNotice('Comparison cleared for the new category. Choose products below.');
    } else setNotice('');
    setCategory(value);
    setSearchTerm('');
    setVisibleCount(8);
  };

  // Save compare items to localStorage
  const saveCompareItems = (items) => {
    setCompareItems(items);
    const saved = writeStoredArray('compareItems', items);
    setNotice(saved ? '' : 'Your browser could not save this comparison. You can still compare products during this visit.');
  };

  // Add product to compare
  const handleAddToCompare = (product) => {
    if (product.category !== category || compareItems.some(item => item.category !== product.category)) {
      showToast('Choose products from the same category to compare.', 'warning');
      return;
    }
    if (compareItems.length >= 4) {
      showToast('You can compare up to 4 products', 'warning');
      return;
    }
    
    if (compareItems.find(item => comparisonProductKey(item) === comparisonProductKey(product))) {
      showToast('Product already in comparison', 'info');
      return;
    }
    
    const newCompare = [...compareItems, product];
    saveCompareItems(newCompare);
    showToast(`${product.name} added to comparison`, 'success');
  };

  // Remove product from compare
  const handleRemoveFromCompare = (productId, productName) => {
    const newCompare = compareItems.filter(item => item.id !== productId);
    saveCompareItems(newCompare);
    showToast(`${productName} removed from comparison`, 'info');
  };

  // Clear all compared products
  const handleClearAll = () => {
    saveCompareItems([]);
    showToast('Comparison cleared', 'info');
  };

  // Add to cart from compare
  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      showToast('Sign in to add products to your cart.', 'info');
      return;
    }
    setAddingToCart(product.id);
    try {
      const added = await addToCart(product, 1);
      showToast(added ? `${product.name} added to cart` : 'Could not add to cart. Sign in and try again.', added ? 'success' : 'error');
    } catch {
      showToast('Could not add to cart. Please try again.', 'error');
    } finally {
      setAddingToCart(null);
    }
  };

  // Get comparison table headers
  const getUniqueSpecKeys = () => {
    const allSpecs = {};
    compareItems.forEach(item => {
      if (item.specs) {
        Object.keys(item.specs).forEach(key => {
          allSpecs[key] = true;
        });
      }
    });
    return Object.keys(allSpecs);
  };

  const specKeys = getUniqueSpecKeys();


  return (
    <div className="compare-page">
      <div className="container">
        {/* Breadcrumb */}
        <Breadcrumb 
          items={[
            { name: 'Home', path: '/' },
            { name: 'Compare', path: '/compare' }
          ]}
        />

        <header className="compare-header">
          <div>
            <p className="compare-eyebrow">Product comparison</p>
            <h1>Compare products</h1>
            <p>Price, availability and key specifications in one view.</p>
          </div>
          <div className="compare-header-actions">
            <p className="compare-selection-count" aria-live="polite">
              {compareItems.length} of 4 selected
            </p>
            {compareItems.length > 0 && (
              <button type="button" className="clear-compare-btn" onClick={() => {
                comparisonHeading.current?.focus({ preventScroll: true });
                comparisonHeading.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
              }}>View comparison</button>
            )}
            {compareItems.length > 0 && (
              <button type="button" onClick={handleClearAll} className="clear-compare-btn">
                Clear comparison
              </button>
            )}
          </div>
        </header>

        <section className="compare-picker" aria-labelledby="compare-search-heading">
          <div className="compare-search-heading">
            <h2 id="compare-search-heading">Find products to compare</h2>
            <p>Choose a category, then add up to four products to see their details side by side.</p>
          </div>
          <search className="compare-filters" aria-label="Filter comparison products">
            <div className="compare-field">
              <label htmlFor="compare-category">Category</label>
              <select id="compare-category" value={category} onChange={e => changeCategory(e.target.value)} disabled={loading || Boolean(error)}>
                <option value="">Choose a category</option>
                {categories.map(name => <option key={name} value={name}>{name}</option>)}
              </select>
            </div>
            <div className="compare-field">
              <label htmlFor="compare-product-search">Search in {category || 'your category'}</label>
              <div className="search-wrapper">
                <MagnifyingGlass size={20} aria-hidden="true" />
                <input id="compare-product-search" type="search" placeholder={category ? 'Search by product or brand, e.g. Dell, ASUS, Mac' : 'Choose a category first'}
                  value={searchTerm} disabled={!category || loading}
                  onChange={e => { setSearchTerm(e.target.value); setVisibleCount(8); }} />
              </div>
            </div>
          </search>
          <p className="compare-picker-help">Only products in the same category can be compared. Changing category starts a new comparison.</p>
          {notice && <p className="compare-notice" role="status">{notice}</p>}
          {error && <div className="compare-notice" role="alert">{error} <button type="button" className="clear-compare-btn" onClick={() => setReloadKey(key => key + 1)}>Try again</button></div>}
          {!loading && !error && !category && <p className="compare-picker-empty">Select a category above to browse products with photos and prices.</p>}
          {!loading && !error && category && <>
            <p className="compare-catalogue-count" role="status">{searchResults.length} {searchResults.length === 1 ? 'product' : 'products'} in {category}{searchTerm.trim() ? ` matching “${searchTerm.trim()}”` : ''}</p>
            <div className="compare-catalogue">
              {searchResults.slice(0, visibleCount).map(product => {
                const selected = compareItems.some(item => item.id === product.id);
                return <article className="compare-candidate" key={product.id}>
                  <ProductImage product={product} />
                  <div className="compare-candidate-info">
                    <p className="compare-candidate-brand">{product.brand}</p>
                    <h3><Link to={`/product/${product.id}`}>{product.name}</Link></h3>
                    <p className="compare-candidate-price">{formatPrice(product.price)}</p>
                  </div>
                  <button type="button" className="compare-add-button" disabled={selected || compareItems.length >= 4}
                    onClick={() => handleAddToCompare(product)} aria-label={`${selected ? 'Added' : 'Add to compare'}: ${product.name}`}>
                    {selected ? 'Added to compare' : compareItems.length >= 4 ? 'Comparison full' : 'Add to compare'}
                  </button>
                </article>;
              })}
            </div>
            {searchResults.length === 0 && <p className="compare-picker-empty">No products match “{searchTerm}” in {category}. Try another product or brand. <button type="button" className="clear-compare-btn" onClick={() => setSearchTerm('')}>Clear search</button></p>}
            {searchResults.length > visibleCount && <button type="button" className="clear-compare-btn" onClick={() => setVisibleCount(count => count + 8)}>Show more products</button>}
          </>}
        </section>

        {/* Loading State */}
        {loading && (
          <div className="compare-loading" role="status">
            <span>Loading product catalogue...</span>
            <div className="loader-spinner-premium loader-lg"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && compareItems.length === 0 && (
          <section className="empty-compare" aria-labelledby="compare-empty-heading">
            <div className="empty-icon" aria-hidden="true"><Scales size={34} weight="duotone" /></div>
            <div>
              <h2 id="compare-empty-heading">Your comparison starts here.</h2>
              <p>Choose a category above and click “Add to compare” on two or more products. Their photos, prices and specifications will appear here.</p>
              <Link to="/shop" className="compare-browse-link">Browse products</Link>
            </div>
          </section>
        )}

        {/* Comparison Table */}
        {!loading && compareItems.length > 0 && (
          <section className="compare-results" aria-labelledby="comparison-heading">
            <div className="compare-results-heading">
              <div>
                <p className="compare-eyebrow">Selected products</p>
                <h2 ref={comparisonHeading} tabIndex={-1} id="comparison-heading">Product details</h2>
              </div>
              <p>{compareItems.length === 1 ? 'Add one more product from this category to compare.' : `${category} · ${compareItems.length} products selected`}</p>
            </div>
            <p className="compare-scroll-hint" id="compare-scroll-help">Swipe or scroll horizontally to view all products. Use the arrow keys when the table is focused.</p>
            <div className="compare-table-wrapper" tabIndex="0" role="region" aria-labelledby="comparison-heading" aria-describedby="compare-scroll-help">
            <table className={`compare-table compare-table--${compareItems.length}`}>
              <caption className="visually-hidden">Comparison of selected products</caption>
              <thead>
                <tr>
                  <th className="spec-label" scope="col">Product</th>
                  {compareItems.map((item) => (
                    <th key={item.id} className="product-cell" scope="col">
                      <div className="product-header">
                        <button 
                          type="button"
                          className="remove-product"
                          onClick={() => handleRemoveFromCompare(item.id, item.name)}
                          aria-label={`Remove ${item.name} from comparison`}
                        >
                          <X size={16} weight="bold" aria-hidden="true" />
                        </button>
                        <ProductImage product={item} />
                        <Link to={`/product/${item.id}`} className="product-name">
                          {item.name}
                        </Link>
                        <div className="product-price-compare">
                          <span className="current">{formatPrice(item.price)}</span>
                          {item.originalPrice > item.price && (
                            <span className="original">{formatPrice(item.originalPrice)}</span>
                          )}
                        </div>
                        <button 
                          type="button"
                          className="add-to-cart-compare"
                          onClick={() => handleAddToCart(item)}
                          disabled={addingToCart !== null || !item.inStock}
                        >
                          <ShoppingCartSimple size={17} weight="regular" aria-hidden="true" />
                          {!item.inStock ? 'Out of stock' : addingToCart === item.id ? 'Adding...' : 'Add to Cart'}
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Rating Row */}
                <tr>
                  <th className="spec-label" scope="row">Rating</th>
                  {compareItems.map((item) => (
                    <td key={item.id} className="spec-value">
                      <div className="rating-compare">
                        <div className="stars">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < Math.floor(item.rating || 0) ? 'star filled' : 'star'}>
                              &#9733;
                            </span>
                          ))}
                        </div>
                        <span className="review-count">({item.reviews || 0} reviews)</span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Brand Row */}
                <tr>
                  <th className="spec-label" scope="row">Brand</th>
                  {compareItems.map((item) => (
                    <td key={item.id} className="spec-value">{item.brand || '-'}</td>
                  ))}
                </tr>

                {/* Category Row */}
                <tr>
                  <th className="spec-label" scope="row">Category</th>
                  {compareItems.map((item) => (
                    <td key={item.id} className="spec-value">{item.category || '-'}</td>
                  ))}
                </tr>

                {/* Stock Status Row */}
                <tr>
                  <th className="spec-label" scope="row">Availability</th>
                  {compareItems.map((item) => (
                    <td key={item.id} className="spec-value">
                      {item.inStock !== false ? (
                        <span className="in-stock-badge">In Stock</span>
                      ) : (
                        <span className="out-of-stock-badge">Out of Stock</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Dynamic Specs Rows */}
                {specKeys.map((key) => (
                  <tr key={key}>
                    <th className="spec-label" scope="row">
                      {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                    </th>
                    {compareItems.map((item) => (
                      <td key={item.id} className="spec-value">
                        {item.specs?.[key] ?? '-'}
                      </td>
                    ))}
                  </tr>
                ))}

                {/* Features Row */}
                <tr>
                  <th className="spec-label" scope="row">Features</th>
                  {compareItems.map((item) => (
                    <td key={item.id} className="spec-value">
                      <ul className="features-list-compare">
                        {item.features?.map((feature, idx) => (
                          <li key={idx}>
                            <CheckCircle className="check-mark" size={16} weight="fill" aria-hidden="true" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
            </div>
          </section>
        )}

        {/* Add More Products Note */}
        {compareItems.length > 0 && compareItems.length < 4 && (
          <p className="add-more-note">
            You can add {4 - compareItems.length} more {4 - compareItems.length === 1 ? 'product' : 'products'} to this comparison.
          </p>
        )}
      </div>
    </div>
  );
}


function parseData(value, fallback) {
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    return parsed && typeof parsed === 'object' ? parsed : fallback;
  } catch { return fallback; }
}

function normalizeProduct(product) {
  const features = parseData(product.features, []);
  const specs = parseData(product.specifications, {});
  return { ...product, price: Number(product.price) || 0,
    originalPrice: Number(product.original_price) || 0,
    specs: Array.isArray(specs) ? {} : specs,
    features: Array.isArray(features) ? features : [],
    inStock: Number(product.stock) > 0 };
}

function formatPrice(value) {
  return formatMoney(value);
}

function ProductImage({ product }) {
  const [failed, setFailed] = useState(false);
  return failed || !product.image ? (
    <div className="compare-image-fallback"><Scales size={28} aria-hidden="true" /><span>Photo unavailable</span></div>
  ) : <img className="compare-photo" src={product.image} alt={product.name} loading="lazy" onError={() => setFailed(true)} />;
}

