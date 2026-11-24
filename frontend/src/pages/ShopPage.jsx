import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal } from '@phosphor-icons/react/dist/csr/SlidersHorizontal';
import { X } from '@phosphor-icons/react/dist/csr/X';
import { ProductCard } from '../components/common/ProductCard';
import { ProductFilter } from '../components/common/ProductFilter';
import { Pagination } from '../components/common/Pagination';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { getProducts, getCategories, getBrands } from '../services/product';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/common/ToastNotification';
import { formatMoney } from '../utils/money';

const pageSizes = [12, 24, 48, 96];
const filterKeys = ['category', 'price_min', 'price_max', 'rating', 'brands', 'inStock', 'onSale'];
const readNumber = (params, key, fallback) => {
  const value = params.get(key);
  return value !== null && value !== '' && Number.isFinite(Number(value)) && Number(value) >= 0 ? Number(value) : fallback;
};
const sortOptions = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price_low', label: 'Price: low to high' },
  { value: 'price_high', label: 'Price: high to low' },
  { value: 'rating', label: 'Highest rated' },
];

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.toString();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const showToast = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalProducts, setTotalProducts] = useState(0);
  const [catalogueFilters, setCatalogueFilters] = useState(null);
  const [filterError, setFilterError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const requestedPerPage = readNumber(searchParams, 'per_page', 12);
  const perPage = pageSizes.includes(requestedPerPage) ? requestedPerPage : 12;
  const page = Math.max(1, Math.floor(readNumber(searchParams, 'page', 1)));
  const sort = sortOptions.some(option => option.value === searchParams.get('sort')) ? searchParams.get('sort') : 'newest';
  const categoryNames = searchParams.get('category')?.split(',').filter(Boolean) || [];
  const brandNames = searchParams.get('brands')?.split(',').filter(Boolean) || [];
  const priceMin = readNumber(searchParams, 'price_min', 0);
  const priceMax = readNumber(searchParams, 'price_max', null);
  const rating = readNumber(searchParams, 'rating', 0);
  const inStock = searchParams.get('inStock') === 'true';
  const onSale = searchParams.get('onSale') === 'true';

  useEffect(() => {
    let active = true;
    setFilterError(false);
    Promise.all([getCategories(), getBrands()]).then(([categoryResponse, brandResponse]) => {
      if (!active) return;
      setCatalogueFilters({
        categories: categoryResponse.data.data.map(item => ({ name: item.category, count: item.count })),
        brands: brandResponse.data.data.map(item => ({ name: item.brand, count: item.count })),
        priceRange: { min: 0, max: Math.max(1, Number(categoryResponse.data.price_range.max)) },
      });
    }).catch(() => { if (active) setFilterError(true); });
    return () => { active = false; };
  }, [retry]);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams(query);
    setLoading(true);
    setError('');
    getProducts({
      page: Math.max(1, Math.floor(readNumber(params, 'page', 1))), per_page: perPage,
      category: params.get('category') || undefined,
      brand: params.get('brands') || undefined,
      price_min: readNumber(params, 'price_min', undefined),
      price_max: readNumber(params, 'price_max', undefined),
      rating: readNumber(params, 'rating', undefined),
      sort: params.get('sort') || 'newest',
      in_stock: params.get('inStock') === 'true' ? 1 : undefined,
      on_sale: params.get('onSale') === 'true' ? 1 : undefined,
    }, { signal: controller.signal }).then(response => {
      if (controller.signal.aborted) return;
      const result = response.data.data;
      const lastPage = Math.max(1, result.last_page);
      if (readNumber(params, 'page', 1) > lastPage) {
        if (lastPage > 1) params.set('page', lastPage); else params.delete('page');
        setSearchParams(params, { replace: true });
        return;
      }
      setProducts(result.data);
      setTotalProducts(result.total);
    }).catch(() => {
      if (!controller.signal.aborted) setError('Could not load products. Please try again.');
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [query, perPage, retry]);

  const updateParams = (edit, resetPage = true) => {
    setSearchParams(previous => {
      const next = new URLSearchParams(previous);
      edit(next);
      if (resetPage) next.delete('page');
      return next;
    });
  };
  const clearAllFilters = () => updateParams(params => filterKeys.forEach(key => params.delete(key)));
  const handleFilterChange = nextFilters => {
    updateParams(params => {
      filterKeys.forEach(key => params.delete(key));
      if (nextFilters.categories.length) params.set('category', nextFilters.categories.join(','));
      if (nextFilters.brands.length) params.set('brands', nextFilters.brands.join(','));
      if (nextFilters.priceMin > 0) params.set('price_min', nextFilters.priceMin);
      if (nextFilters.priceMax < catalogueFilters.priceRange.max) params.set('price_max', nextFilters.priceMax);
      if (nextFilters.rating) params.set('rating', nextFilters.rating);
      if (nextFilters.inStock) params.set('inStock', 'true');
      if (nextFilters.onSale) params.set('onSale', 'true');
    });
    setIsFilterOpen(false);
  };
  const removeValue = (key, value) => updateParams(params => {
    const remaining = params.get(key)?.split(',').filter(item => item !== value) || [];
    if (remaining.length) params.set(key, remaining.join(',')); else params.delete(key);
  });
  const labels = [
    ...categoryNames.map(name => ({ id: `category-${name}`, text: name, remove: () => removeValue('category', name) })),
    ...brandNames.map(name => ({ id: `brand-${name}`, text: name, remove: () => removeValue('brands', name) })),
    ...(priceMin > 0 || priceMax !== null ? [{ id: 'price', text: priceMax === null ? `${formatMoney(priceMin)} and up` : `${formatMoney(priceMin)} – ${formatMoney(priceMax)}`, remove: () => updateParams(params => { params.delete('price_min'); params.delete('price_max'); }) }] : []),
    ...(rating ? [{ id: 'rating', text: `${rating} stars & up`, remove: () => updateParams(params => params.delete('rating')) }] : []),
    ...(inStock ? [{ id: 'inStock', text: 'In stock', remove: () => updateParams(params => params.delete('inStock')) }] : []),
    ...(onSale ? [{ id: 'onSale', text: 'On sale', remove: () => updateParams(params => params.delete('onSale')) }] : []),
  ];
  const initialFilters = {
    categories: categoryNames, brands: brandNames, priceMin,
    priceMax: priceMax ?? catalogueFilters?.priceRange.max, rating, inStock, onSale,
  };
  const filterKey = JSON.stringify(initialFilters);
  const renderFilters = mobile => catalogueFilters ? <ProductFilter key={`${mobile}-${filterKey}`}
    {...catalogueFilters} initialFilters={initialFilters} onFilterChange={handleFilterChange}
    showMobile={mobile} onCloseMobile={() => setIsFilterOpen(false)} />
    : <p className="shop-filter-loading" role="status">{filterError ? <>Could not load filters. <button type="button" onClick={() => setRetry(value => value + 1)}>Try again</button></> : 'Loading filters…'}</p>;
  const handleAddToCart = async product => {
    if (!isAuthenticated) { showToast('Sign in to add products to your cart.', 'info'); return; }
    const added = await addToCart(product, 1);
    showToast(added ? `${product.name} added to cart.` : 'Could not update your cart. Please try again.', added ? 'success' : 'error');
  };
  const changeSort = value => updateParams(params => { if (value === 'newest') params.delete('sort'); else params.set('sort', value); });

  return <div className="shop-page">
    <div className="container">
      <Breadcrumb items={[{ name: 'Home', path: '/' }, { name: 'Shop', path: '/shop' }]} />
      <header className="shop-header"><h1>Shop Electronics</h1><p>Discover the latest tech gadgets at best prices</p></header>
      <div className="mobile-filter-bar">
        <button type="button" className="mobile-filter-btn" disabled={!catalogueFilters} onClick={() => setIsFilterOpen(true)} aria-haspopup="dialog" aria-expanded={isFilterOpen}>
          <SlidersHorizontal size={19} aria-hidden="true" /> Filters{labels.length > 0 && <span className="shop-filter-badge">{labels.length}</span>}
        </button>
        <div className="sort-wrapper"><label className="visually-hidden" htmlFor="shop-mobile-sort">Sort products</label>
          <select id="shop-mobile-sort" value={sort} onChange={event => changeSort(event.target.value)} className="sort-select">{sortOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
        </div>
      </div>
      <div className="shop-layout">
        <aside className="shop-sidebar" aria-label="Product filters">{renderFilters(false)}</aside>
        <section className="shop-products" aria-label="Products">
          <div className="products-header">
            <div className="results-info" role="status"><p>{loading ? 'Loading products…' : error ? 'Products unavailable' : <>Showing <strong>{products.length}</strong> of <strong>{totalProducts}</strong> products</>}</p></div>
            <div className="sorting-desktop"><label htmlFor="shop-sort">Sort by:</label>
              <select id="shop-sort" value={sort} onChange={event => changeSort(event.target.value)} className="sort-select">{sortOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
            </div>
          </div>
          {labels.length > 0 && <div className="shop-active-filters" aria-label="Selected filters">
            <span className="shop-active-label">Filtered by</span>
            {labels.map(label => <button key={label.id} type="button" className="shop-filter-chip" onClick={label.remove} aria-label={`Remove filter: ${label.text}`}>
              {label.text}<X size={14} weight="bold" aria-hidden="true" />
            </button>)}
            <button type="button" className="shop-filter-clear-all" onClick={clearAllFilters}>Clear all</button>
          </div>}
          {loading ? <div className="products-grid" aria-label="Loading products" aria-busy="true">{Array.from({ length: 6 }, (_, index) => <div className="store-product-skeleton" key={index}><span /><span /><span /></div>)}</div>
            : error ? <div className="no-products" role="alert"><h2>Products could not be loaded</h2><p>{error}</p><button type="button" className="clear-filters-btn" onClick={() => setRetry(value => value + 1)}>Try again</button></div>
            : products.length === 0 ? <div className="no-products"><h2>No products found</h2><p>Try removing a filter or choosing a different price range.</p><button type="button" className="clear-filters-btn" onClick={clearAllFilters}>Clear all filters</button></div>
            : <><div className="products-grid">{products.map(product => <ProductCard key={product.id} {...product} onAddToCart={() => handleAddToCart(product)} />)}</div>
              <Pagination currentPage={page} totalItems={totalProducts} itemsPerPage={perPage}
                onPageChange={newPage => updateParams(params => { if (newPage > 1) params.set('page', newPage); else params.delete('page'); }, false)}
                onItemsPerPageChange={size => updateParams(params => { if (size === 12) params.delete('per_page'); else params.set('per_page', size); })} />
            </>}
        </section>
      </div>
    </div>
    {isFilterOpen && renderFilters(true)}
  </div>;
}
