// src/pages/ShopPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/common/ProductCard';
import { ProductFilter } from '../components/common/ProductFilter';
import { Pagination } from '../components/common/Pagination';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { getProducts, getCategories } from '../services/product';
import { useCart } from '../hooks/useCart';
import { useToast } from '../components/common/ToastNotification';

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();
  const showToast = useToast();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [categories, setCategories] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter state – aligned with backend parameter names
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    price_min: Number(searchParams.get('price_min')) || 0,
    price_max: Number(searchParams.get('price_max')) || 1000,
    rating: Number(searchParams.get('rating')) || 0,
    sort: searchParams.get('sort') || 'newest',
  });

  // Pagination state
  const [pagination, setPagination] = useState({
    page: Number(searchParams.get('page')) || 1,
    per_page: 12,
  });

  // Load categories once
  useEffect(() => {
    loadCategories();
  }, []);

  // Fetch products when filters or pagination change
  useEffect(() => {
    fetchProducts();
    updateUrlParams();
  }, [filters, pagination.page, pagination.per_page]);

  const loadCategories = async () => {
  try {
    const res = await getCategories();
    let categoriesArray = [];
    // Your categories endpoint probably returns a similar wrapper: { success: true, data: [...] }
    if (res.data && Array.isArray(res.data.data)) {
      categoriesArray = res.data.data;
    } else if (Array.isArray(res.data)) {
      categoriesArray = res.data;
    }
    setCategories(categoriesArray);
  } catch (error) {
    console.error('Failed to load categories', error);
  }
};

const fetchProducts = async () => {
  setLoading(true);
  try {
    const params = {
      page: pagination.page,
      per_page: pagination.per_page,
      category: filters.category || undefined,
      price_min: filters.price_min > 0 ? filters.price_min : undefined,
      price_max: filters.price_max < 1000 ? filters.price_max : undefined,
      rating: filters.rating > 0 ? filters.rating : undefined,
      sort: filters.sort,
    };
    const response = await getProducts(params);
    
    // ✅ Correct extraction for your API structure
    const paginatedData = response.data?.data;
    const productsArray = paginatedData?.data || [];
    const total = paginatedData?.total || 0;
    
    setProducts(productsArray);
    setTotalProducts(total);
  } catch (error) {
    console.error('Failed to fetch products', error);
    showToast('Failed to load products', 'error');
    setProducts([]);
    setTotalProducts(0);
  } finally {
    setLoading(false);
  }
};

  const updateUrlParams = () => {
    const params = {};
    if (filters.category) params.category = filters.category;
    if (filters.price_min > 0) params.price_min = filters.price_min;
    if (filters.price_max < 1000) params.price_max = filters.price_max;
    if (filters.rating > 0) params.rating = filters.rating;
    if (filters.sort !== 'newest') params.sort = filters.sort;
    if (pagination.page > 1) params.page = pagination.page;
    setSearchParams(params);
  };

  const handleFilterChange = (newFilters) => {
    // Convert frontend filter structure to backend structure
    const backendFilters = {
      category: newFilters.categories?.length === 1 ? newFilters.categories[0] : '',
      price_min: newFilters.priceMin,
      price_max: newFilters.priceMax,
      rating: newFilters.rating,
      sort: newFilters.sortBy || filters.sort,
    };
    setFilters(backendFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = (product) => {
    if (!addToCart) {
      console.warn('addToCart not available – CartProvider may be missing');
      showToast('Cart is not available', 'error');
      return;
    }
    addToCart(product, 1);
    showToast(`${product.name} added to cart!`, 'success');
  };

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
  ];

  // Convert categories to the format expected by ProductFilter
  const filterCategories = categories.map(cat => ({
    name: cat.category || cat.name,
    slug: cat.category?.toLowerCase() || cat.name?.toLowerCase(),
    count: cat.count,
  }));

  return (
    <div className="shop-page">
      <div className="container">
        <Breadcrumb items={[{ name: 'Home', path: '/' }, { name: 'Shop', path: '/shop' }]} />

        <div className="shop-header">
          <h1>Shop Electronics</h1>
          <p>Discover the latest tech gadgets at best prices</p>
        </div>

        <div className="mobile-filter-bar">
          <button className="mobile-filter-btn" onClick={() => setIsFilterOpen(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="21" x2="4" y2="14" />
              <line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" />
              <line x1="20" y1="12" x2="20" y2="3" />
              <line x1="2" y1="14" x2="6" y2="14" />
              <line x1="10" y1="12" x2="14" y2="12" />
              <line x1="18" y1="16" x2="22" y2="16" />
            </svg>
            Filters
            {(filters.category || filters.price_min > 0 || filters.price_max < 1000 || filters.rating > 0) && <span className="filter-badge">●</span>}
          </button>
          <div className="sort-wrapper">
            <select value={filters.sort} onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value }))} className="sort-select">
              {sortOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
        </div>

        <div className="shop-layout">
          <aside className="shop-sidebar">
            <ProductFilter
              categories={filterCategories}
              priceRange={{ min: 0, max: 1000 }}
              onFilterChange={handleFilterChange}
              initialFilters={{
                categories: filters.category ? [filters.category] : [],
                priceMin: filters.price_min,
                priceMax: filters.price_max,
                rating: filters.rating,
                sortBy: filters.sort,
              }}
            />
          </aside>

          <main className="shop-products">
            <div className="products-header">
              <div className="results-info">
                {!loading && <p>Showing <strong>{products.length}</strong> of <strong>{totalProducts}</strong> products</p>}
              </div>
              <div className="sorting-desktop">
                <label>Sort by:</label>
                <select value={filters.sort} onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value }))} className="sort-select">
                  {sortOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="products-loading"><div className="loader-spinner-premium loader-lg"></div></div>
            ) : products.length === 0 ? (
              <div className="no-products">
                <div className="no-products-icon">🔍</div>
                <h3>No products found</h3>
                <p>Try adjusting your filters or search terms</p>
                <button className="clear-filters-btn" onClick={() => handleFilterChange({ categories: [], priceMin: 0, priceMax: 1000, rating: 0, sortBy: 'newest' })}>
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                <div className="products-grid">
                  {products.map(product => (
                    <ProductCard
                      key={product.id}
                      {...product}
                      onAddToCart={() => handleAddToCart(product)}
                    />
                  ))}
                </div>
                <Pagination
                  currentPage={pagination.page}
                  totalItems={totalProducts}
                  itemsPerPage={pagination.per_page}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={(newPerPage) => setPagination({ page: 1, per_page: newPerPage })}
                />
              </>
            )}
          </main>
        </div>
      </div>

      {isFilterOpen && (
        <ProductFilter
          showMobile
          onCloseMobile={() => setIsFilterOpen(false)}
          onFilterChange={(newFilters) => { handleFilterChange(newFilters); setIsFilterOpen(false); }}
          categories={filterCategories}
          priceRange={{ min: 0, max: 1000 }}
          initialFilters={{
            categories: filters.category ? [filters.category] : [],
            priceMin: filters.price_min,
            priceMax: filters.price_max,
            rating: filters.rating,
            sortBy: filters.sort,
          }}
        />
      )}
    </div>
  );
}