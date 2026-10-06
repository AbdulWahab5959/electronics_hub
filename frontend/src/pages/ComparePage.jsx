// src/pages/ComparePage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useToast } from '../components/common/ToastNotification';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { Button } from '../components/common/Button';

export default function ComparePage() {
  const { addToCart } = useCart();
  const showToast = useToast();
  
  const [compareItems, setCompareItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [addingToCart, setAddingToCart] = useState(null);

  // Mock products for search
  const allProducts = [
    {
      id: 1,
      name: "MacBook Pro 16\" M3 Chip",
      price: 2499.99,
      originalPrice: 2799.99,
      image: "https://placehold.co/400x400/3b82f6/white?text=MacBook+Pro",
      rating: 4.9,
      reviews: 3245,
      category: "Laptops",
      brand: "Apple",
      specs: {
        processor: "Apple M3 (12-core)",
        ram: "18GB Unified",
        storage: "512GB SSD",
        display: "16.2-inch Liquid Retina XDR",
        battery: "Up to 22 hours",
        weight: "4.7 lbs",
        os: "macOS",
      },
      features: ["M3 Chip", "Liquid Retina XDR", "1080p Camera", "Studio-quality mics"],
      inStock: true,
    },
    {
      id: 2,
      name: "Sony WH-1000XM5 Headphones",
      price: 349.99,
      originalPrice: 399.99,
      image: "https://placehold.co/400x400/8b5cf6/white?text=Sony+Headphones",
      rating: 4.8,
      reviews: 5678,
      category: "Audio",
      brand: "Sony",
      specs: {
        type: "Over-ear",
        connectivity: "Bluetooth 5.2",
        battery: "30 hours",
        noiseCancelling: "Yes",
        weight: "250g",
      },
      features: ["Noise Cancelling", "30hr Battery", "Quick Charge", "Multipoint"],
      inStock: true,
    },
    {
      id: 3,
      name: "Apple Watch Ultra 2",
      price: 749.99,
      originalPrice: 799.99,
      image: "https://placehold.co/400x400/10b981/white?text=Apple+Watch",
      rating: 4.7,
      reviews: 2341,
      category: "Wearables",
      brand: "Apple",
      specs: {
        display: "1.92-inch Retina",
        battery: "36 hours",
        waterResistant: "100m",
        gps: "Yes",
        cellular: "Yes",
      },
      features: ["Titanium Case", "Dual-frequency GPS", "Siren", "Emergency SOS"],
      inStock: true,
    },
    {
      id: 4,
      name: "Logitech MX Master 3S",
      price: 89.99,
      originalPrice: 99.99,
      image: "https://placehold.co/400x400/f59e0b/white?text=MX+Master",
      rating: 4.6,
      reviews: 1876,
      category: "Accessories",
      brand: "Logitech",
      specs: {
        sensor: "8K DPI",
        buttons: "6",
        connectivity: "Bluetooth + USB",
        battery: "70 days",
      },
      features: ["MagSpeed Wheel", "Quiet Clicks", "8K DPI", "Multi-device"],
      inStock: true,
    },
    {
      id: 5,
      name: "Keychron K2 Mechanical Keyboard",
      price: 79.99,
      originalPrice: 99.99,
      image: "https://placehold.co/400x400/ef4444/white?text=Keychron",
      rating: 4.8,
      reviews: 3421,
      category: "Keyboards",
      brand: "Keychron",
      specs: {
        layout: "75%",
        switchType: "Gateron Pro",
        connectivity: "Bluetooth + USB-C",
        battery: "4000mAh",
      },
      features: ["Hot-swappable", "RGB Backlight", "Mac/Win Layout", "Wireless"],
      inStock: true,
    },
  ];

  // Load compare items from localStorage
  useEffect(() => {
    loadCompareItems();
  }, []);

  const loadCompareItems = () => {
    setLoading(true);
    const savedCompare = JSON.parse(localStorage.getItem('compareItems') || '[]');
    setCompareItems(savedCompare);
    setLoading(false);
  };

  // Save compare items to localStorage
  const saveCompareItems = (items) => {
    localStorage.setItem('compareItems', JSON.stringify(items));
    setCompareItems(items);
  };

  // Add product to compare
  const handleAddToCompare = (product) => {
    if (compareItems.length >= 4) {
      showToast('You can compare up to 4 products', 'warning');
      return;
    }
    
    if (compareItems.find(item => item.id === product.id)) {
      showToast('Product already in comparison', 'info');
      return;
    }
    
    const newCompare = [...compareItems, product];
    saveCompareItems(newCompare);
    showToast(`${product.name} added to comparison`, 'success');
    setShowSearch(false);
    setSearchTerm('');
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
    setAddingToCart(product.id);
    addToCart(product, 1);
    showToast(`${product.name} added to cart!`, 'success');
    setAddingToCart(null);
  };

  // Search products
  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term.length > 1) {
      const results = allProducts.filter(product =>
        product.name.toLowerCase().includes(term.toLowerCase()) &&
        !compareItems.find(item => item.id === product.id)
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
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

        {/* Page Header */}
        <div className="compare-header">
          <div>
            <h1>Compare Products</h1>
            <p>Compare specs, prices, and features side by side</p>
          </div>
          {compareItems.length > 0 && (
            <button onClick={handleClearAll} className="clear-compare-btn">
              Clear All
            </button>
          )}
        </div>

        {/* Add Product Section */}
        <div className="add-product-section">
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Search products to compare..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setShowSearch(true)}
            />
            <button className="search-icon-btn">🔍</button>
          </div>
          
          {showSearch && searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map(product => (
                <div key={product.id} className="search-result-item">
                  <img src={product.image} alt={product.name} />
                  <div className="result-info">
                    <h4>{product.name}</h4>
                    <p>${product.price}</p>
                  </div>
                  <button onClick={() => handleAddToCompare(product)}>
                    Compare
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="compare-loading">
            <div className="loader-spinner-premium loader-lg"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && compareItems.length === 0 && (
          <div className="empty-compare">
            <div className="empty-icon">🔄</div>
            <h3>No products to compare</h3>
            <p>Add products to see side-by-side comparison</p>
            <Link to="/shop" className="btn-primary">Browse Products</Link>
          </div>
        )}

        {/* Comparison Table */}
        {!loading && compareItems.length > 0 && (
          <div className="compare-table-wrapper">
            <table className="compare-table">
              <thead>
                <tr>
                  <th className="spec-label">Product</th>
                  {compareItems.map((item) => (
                    <th key={item.id} className="product-cell">
                      <div className="product-header">
                        <button 
                          className="remove-product"
                          onClick={() => handleRemoveFromCompare(item.id, item.name)}
                        >
                          ✕
                        </button>
                        <img src={item.image} alt={item.name} />
                        <Link to={`/product/${item.id}`} className="product-name">
                          {item.name}
                        </Link>
                        <div className="product-price-compare">
                          <span className="current">${item.price.toFixed(2)}</span>
                          {item.originalPrice > item.price && (
                            <span className="original">${item.originalPrice.toFixed(2)}</span>
                          )}
                        </div>
                        <button 
                          className="add-to-cart-compare"
                          onClick={() => handleAddToCart(item)}
                          disabled={addingToCart === item.id}
                        >
                          {addingToCart === item.id ? 'Adding...' : 'Add to Cart'}
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Rating Row */}
                <tr>
                  <td className="spec-label">Rating</td>
                  {compareItems.map((item) => (
                    <td key={item.id} className="spec-value">
                      <div className="rating-compare">
                        <div className="stars">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < Math.floor(item.rating || 0) ? 'star filled' : 'star'}>
                              ★
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
                  <td className="spec-label">Brand</td>
                  {compareItems.map((item) => (
                    <td key={item.id} className="spec-value">{item.brand || '-'}</td>
                  ))}
                </tr>

                {/* Category Row */}
                <tr>
                  <td className="spec-label">Category</td>
                  {compareItems.map((item) => (
                    <td key={item.id} className="spec-value">{item.category || '-'}</td>
                  ))}
                </tr>

                {/* Stock Status Row */}
                <tr>
                  <td className="spec-label">Availability</td>
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
                    <td className="spec-label">
                      {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                    </td>
                    {compareItems.map((item) => (
                      <td key={item.id} className="spec-value">
                        {item.specs?.[key] || '-'}
                      </td>
                    ))}
                  </tr>
                ))}

                {/* Features Row */}
                <tr>
                  <td className="spec-label">Features</td>
                  {compareItems.map((item) => (
                    <td key={item.id} className="spec-value">
                      <ul className="features-list-compare">
                        {item.features?.map((feature, idx) => (
                          <li key={idx}>
                            <span className="check-mark">✓</span>
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
        )}

        {/* Add More Products Note */}
        {compareItems.length > 0 && compareItems.length < 4 && (
          <div className="add-more-note">
            <p>Add up to {4 - compareItems.length} more {4 - compareItems.length === 1 ? 'product' : 'products'} to compare</p>
          </div>
        )}
      </div>
    </div>
  );
}