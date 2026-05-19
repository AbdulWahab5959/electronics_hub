// src/pages/ShopPage.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/common/ProductCard';
import { ProductFilter } from '../components/common/ProductFilter';
import { Pagination } from '../components/common/Pagination';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { getProducts, getCategories, getBrands } from '../services/product';
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
  const [brands, setBrands] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    price_min: Number(searchParams.get('price_min')) || 0,
    price_max: Number(searchParams.get('price_max')) || 1000,
    rating: Number(searchParams.get('rating')) || 0,
    sort: searchParams.get('sort') || 'newest',
    brands: searchParams.get('brands') ? searchParams.get('brands').split(',') : [],
    inStock: searchParams.get('inStock') === 'true',
    onSale: searchParams.get('onSale') === 'true',
  });

  const [pagination, setPagination] = useState({
    page: Number(searchParams.get('page')) || 1,
    per_page: 12,
  });

  useEffect(() => {
    loadCategories();
    loadBrands();
  }, []);

  useEffect(() => {
    fetchProducts();
    updateUrlParams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, pagination.page, pagination.per_page]);

  const loadCategories = async () => {
    try {
      const res = await getCategories();
      const categoriesArray = res.data?.data || [];
      setCategories(categoriesArray);
    } catch (error) {
      console.error('Failed to load categories', error);
    }
  };

  const loadBrands = async () => {
    try {
      const res = await getBrands();
      const brandsArray = res.data?.data || [];
      setBrands(brandsArray);
    } catch (error) {
      console.error('Failed to load brands', error);
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

        // IMPORTANT: backend expects "brand", not "brands"
        brand: filters.brands?.length ? filters.brands.join(',') : undefined,

        in_stock: filters.inStock ? 1 : undefined,
        on_sale: filters.onSale ? 1 : undefined,
      };

      console.log('🔍 Fetching products with params:', params);

      const response = await getProducts(params);
      console.log('📦 Products response:', response.data);

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
    if (filters.brands.length) params.brands = filters.brands.join(',');
    if (filters.inStock) params.inStock = true;
    if (filters.onSale) params.onSale = true;

    setSearchParams(params);
  };

  const handleFilterChange = (newFilters) => {
    console.log('🔄 Filter changed:', newFilters);

    setFilters(prev => ({
      ...prev,
      category: newFilters.categories?.length ? newFilters.categories.join(',') : '',
      price_min: newFilters.priceMin ?? 0,
      price_max: newFilters.priceMax ?? 1000,
      rating: newFilters.rating ?? 0,
      brands: newFilters.brands || [],
      inStock: newFilters.inStock || false,
      onSale: newFilters.onSale || false,
    }));

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

  const clearAllFilters = () => {
    setFilters({
      category: '',
      price_min: 0,
      price_max: 1000,
      rating: 0,
      sort: 'newest',
      brands: [],
      inStock: false,
      onSale: false,
    });

    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
  ];

  const filterCategories = categories.map(cat => ({
    name: cat.category || cat.name,
    slug: cat.category?.toLowerCase() || cat.name?.toLowerCase(),
    count: cat.count,
  }));

  const filterBrands = brands.map(brand => ({
    name: brand.brand || brand.name,
    count: brand.count,
  }));

  const buildInitialFilters = () => ({
    categories: filters.category ? filters.category.split(',') : [],
    priceMin: filters.price_min,
    priceMax: filters.price_max,
    rating: filters.rating,
    brands: filters.brands,
    inStock: filters.inStock,
    onSale: filters.onSale,
  });

  const hasActiveFilters =
    filters.category ||
    filters.price_min > 0 ||
    filters.price_max < 1000 ||
    filters.rating > 0 ||
    filters.brands.length ||
    filters.inStock ||
    filters.onSale;

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
            {hasActiveFilters && <span className="filter-badge">●</span>}
          </button>

          <div className="sort-wrapper">
            <select
              value={filters.sort}
              onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value }))}
              className="sort-select"
            >
              {sortOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="shop-layout">
          <aside className="shop-sidebar">
            <ProductFilter
              categories={filterCategories}
              brands={filterBrands}
              priceRange={{ min: 0, max: 1000 }}
              onFilterChange={handleFilterChange}
              initialFilters={buildInitialFilters()}
            />
          </aside>

          <main className="shop-products">
            <div className="products-header">
              <div className="results-info">
                {!loading && (
                  <p>
                    Showing <strong>{products.length}</strong> of{' '}
                    <strong>{totalProducts}</strong> products
                  </p>
                )}
              </div>

              <div className="sorting-desktop">
                <label>Sort by:</label>
                <select
                  value={filters.sort}
                  onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value }))}
                  className="sort-select"
                >
                  {sortOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="products-loading">
                <div className="loader-spinner-premium loader-lg"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="no-products">
                <div className="no-products-icon">🔍</div>
                <h3>No products found</h3>
                <p>Try adjusting your filters or search terms</p>
                <button className="clear-filters-btn" onClick={clearAllFilters}>
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
                  onItemsPerPageChange={(newPerPage) =>
                    setPagination({ page: 1, per_page: newPerPage })
                  }
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
          onFilterChange={(newFilters) => {
            handleFilterChange(newFilters);
            setIsFilterOpen(false);
          }}
          categories={filterCategories}
          brands={filterBrands}
          priceRange={{ min: 0, max: 1000 }}
          initialFilters={buildInitialFilters()}
        />
      )}
    </div>
  );
}