// src/pages/ShopPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/common/ProductCard';
import { ProductFilter } from '../components/shop/ProductFilter';
import { Pagination } from '../components/common/Pagination';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { useCart } from '../hooks/useCart';
import { useToast } from '../components/ui/ToastNotification';

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();
  const showToast = useToast();
  
  // State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Filter state
  const [filters, setFilters] = useState({
    categories: searchParams.getAll('category') || [],
    priceMin: Number(searchParams.get('priceMin')) || 0,
    priceMax: Number(searchParams.get('priceMax')) || 1000,
    rating: Number(searchParams.get('rating')) || 0,
    sortBy: searchParams.get('sort') || 'newest',
  });
  
  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: Number(searchParams.get('page')) || 1,
    itemsPerPage: 12,
  });

  // Mock products data (replace with API call)
  const mockProducts = [
    {
      id: 1,
      name: "MacBook Pro 16\" M3 Chip",
      price: 2499.99,
      originalPrice: 2799.99,
      image: "https://placehold.co/400x400/3b82f6/white?text=MacBook+Pro",
      rating: 4.9,
      reviews: 3245,
      isNew: true,
      discount: 11,
      category: "laptops",
      stock: 15
    },
    {
      id: 2,
      name: "Sony WH-1000XM5 Headphones",
      price: 349.99,
      originalPrice: 399.99,
      image: "https://placehold.co/400x400/8b5cf6/white?text=Sony+Headphones",
      rating: 4.8,
      reviews: 5678,
      isNew: true,
      discount: 12,
      category: "headphones",
      stock: 42
    },
    {
      id: 3,
      name: "Apple Watch Ultra 2",
      price: 749.99,
      originalPrice: 799.99,
      image: "https://placehold.co/400x400/10b981/white?text=Apple+Watch",
      rating: 4.7,
      reviews: 2341,
      discount: 6,
      category: "smartwatches",
      stock: 28
    },
    {
      id: 4,
      name: "Logitech MX Master 3S",
      price: 89.99,
      originalPrice: 99.99,
      image: "https://placehold.co/400x400/f59e0b/white?text=MX+Master",
      rating: 4.6,
      reviews: 1876,
      discount: 10,
      category: "mouse",
      stock: 56
    },
    {
      id: 5,
      name: "Keychron K2 Mechanical Keyboard",
      price: 79.99,
      originalPrice: 99.99,
      image: "https://placehold.co/400x400/ef4444/white?text=Keychron",
      rating: 4.8,
      reviews: 3421,
      discount: 20,
      category: "keyboards",
      stock: 34
    },
    {
      id: 6,
      name: "iPad Pro 12.9\" M2",
      price: 1099.99,
      originalPrice: 1199.99,
      image: "https://placehold.co/400x400/6366f1/white?text=iPad+Pro",
      rating: 4.9,
      reviews: 2109,
      isNew: true,
      discount: 8,
      category: "tablets",
      stock: 12
    },
    {
      id: 7,
      name: "Bose QuietComfort Earbuds",
      price: 249.99,
      originalPrice: 299.99,
      image: "https://placehold.co/400x400/06b6d4/white?text=Bose",
      rating: 4.7,
      reviews: 1567,
      discount: 17,
      category: "headphones",
      stock: 23
    },
    {
      id: 8,
      name: "LG UltraGear Gaming Monitor",
      price: 449.99,
      originalPrice: 549.99,
      image: "https://placehold.co/400x400/ec4899/white?text=LG+Monitor",
      rating: 4.8,
      reviews: 2345,
      discount: 18,
      category: "monitors",
      stock: 8
    },
  ];

  // Categories for filter
  const categories = [
    { name: "Laptops", slug: "laptops", count: 45 },
    { name: "Headphones", slug: "headphones", count: 32 },
    { name: "Smartwatches", slug: "smartwatches", count: 18 },
    { name: "Mouse", slug: "mouse", count: 24 },
    { name: "Keyboards", slug: "keyboards", count: 28 },
    { name: "Monitors", slug: "monitors", count: 15 },
    { name: "Tablets", slug: "tablets", count: 12 },
    { name: "Accessories", slug: "accessories", count: 56 },
  ];

  // Fetch products when filters or pagination change
  useEffect(() => {
    fetchProducts();
  }, [filters, pagination.currentPage, pagination.itemsPerPage]);

  // Sync URL params with state
  useEffect(() => {
    const params = {};
    if (filters.categories.length) params.category = filters.categories;
    if (filters.priceMin > 0) params.priceMin = filters.priceMin;
    if (filters.priceMax < 1000) params.priceMax = filters.priceMax;
    if (filters.rating > 0) params.rating = filters.rating;
    if (filters.sortBy !== 'newest') params.sort = filters.sortBy;
    if (pagination.currentPage > 1) params.page = pagination.currentPage;
    setSearchParams(params);
  }, [filters, pagination.currentPage]);

  const fetchProducts = async () => {
    setLoading(true);
    
    // Simulate API call - replace with actual API
    setTimeout(() => {
      let filtered = [...mockProducts];
      
      // Filter by categories
      if (filters.categories.length) {
        filtered = filtered.filter(p => filters.categories.includes(p.category));
      }
      
      // Filter by price
      filtered = filtered.filter(p => 
        p.price >= filters.priceMin && p.price <= filters.priceMax
      );
      
      // Filter by rating
      if (filters.rating > 0) {
        filtered = filtered.filter(p => p.rating >= filters.rating);
      }
      
      // Sort products
      switch (filters.sortBy) {
        case 'price_low':
          filtered.sort((a, b) => a.price - b.price);
          break;
        case 'price_high':
          filtered.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          filtered.sort((a, b) => b.rating - a.rating);
          break;
        case 'newest':
          filtered.sort((a, b) => b.id - a.id);
          break;
        default:
          break;
      }
      
      // Paginate
      const start = (pagination.currentPage - 1) * pagination.itemsPerPage;
      const paginated = filtered.slice(start, start + pagination.itemsPerPage);
      
      setProducts(paginated);
      setTotalProducts(filtered.length);
      setLoading(false);
    }, 500);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = (productId) => {
    const product = mockProducts.find(p => p.id === productId);
    if (product) {
      addToCart(product, 1);
      showToast(`${product.name} added to cart!`, 'success');
    }
  };

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'popular', label: 'Most Popular' },
  ];

  return (
    <div className="shop-page">
      <div className="container">
        {/* Breadcrumb */}
        <Breadcrumb 
          items={[
            { name: 'Home', path: '/' },
            { name: 'Shop', path: '/shop' }
          ]}
        />

        {/* Page Header */}
        <div className="shop-header">
          <h1>Shop Electronics</h1>
          <p>Discover the latest tech gadgets at best prices</p>
        </div>

        {/* Mobile Filter Button */}
        <div className="mobile-filter-bar">
          <button 
            className="mobile-filter-btn"
            onClick={() => setIsFilterOpen(true)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="21" x2="4" y2="14"/>
              <line x1="4" y1="10" x2="4" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12" y2="3"/>
              <line x1="20" y1="21" x2="20" y2="16"/>
              <line x1="20" y1="12" x2="20" y2="3"/>
              <line x1="2" y1="14" x2="6" y2="14"/>
              <line x1="10" y1="12" x2="14" y2="12"/>
              <line x1="18" y1="16" x2="22" y2="16"/>
            </svg>
            Filters
            {Object.keys(filters).some(k => 
              k !== 'sortBy' && filters[k] && filters[k].length > 0
            ) && <span className="filter-badge">●</span>}
          </button>
          
          <div className="sort-wrapper">
            <select 
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className="sort-select"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="shop-layout">
          {/* Sidebar Filters (Desktop) */}
          <aside className="shop-sidebar">
            <ProductFilter 
              categories={categories}
              priceRange={{ min: 0, max: 1000 }}
              onFilterChange={handleFilterChange}
              initialFilters={filters}
            />
          </aside>

          {/* Products Area */}
          <main className="shop-products">
            {/* Results Info & Sorting (Desktop) */}
            <div className="products-header">
              <div className="results-info">
                {!loading && (
                  <p>Showing <strong>{products.length}</strong> of <strong>{totalProducts}</strong> products</p>
                )}
              </div>
              
              <div className="sorting-desktop">
                <label>Sort by:</label>
                <select 
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                  className="sort-select"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="products-loading">
                <div className="loader-spinner-premium loader-lg"></div>
              </div>
            ) : products.length > 0 ? (
              <div className="products-grid">
                {products.map(product => (
                  <ProductCard
                    key={product.id}
                    {...product}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            ) : (
              <div className="no-products">
                <div className="no-products-icon">🔍</div>
                <h3>No products found</h3>
                <p>Try adjusting your filters or search terms</p>
                <button 
                  className="clear-filters-btn"
                  onClick={() => {
                    setFilters({
                      categories: [],
                      priceMin: 0,
                      priceMax: 1000,
                      rating: 0,
                      sortBy: 'newest',
                    });
                  }}
                >
                  Clear all filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {!loading && totalProducts > pagination.itemsPerPage && (
              <Pagination
                currentPage={pagination.currentPage}
                totalItems={totalProducts}
                itemsPerPage={pagination.itemsPerPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={(newPerPage) => {
                  setPagination({ currentPage: 1, itemsPerPage: newPerPage });
                }}
              />
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {isFilterOpen && (
        <ProductFilter 
          showMobile={true}
          onCloseMobile={() => setIsFilterOpen(false)}
          onFilterChange={(newFilters) => {
            handleFilterChange(newFilters);
            setIsFilterOpen(false);
          }}
          categories={categories}
          priceRange={{ min: 0, max: 1000 }}
          initialFilters={filters}
        />
      )}
    </div>
  );
}