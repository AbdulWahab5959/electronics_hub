import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts } from '../services/product';
import { ProductCard } from '../components/common/ProductCard';

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return;
    const fetchResults = async () => {
      setLoading(true);
      try {
        const params = { search: query };
        const res = await getProducts(params);
        const list = res.data.data?.data || res.data.data || [];

        // Map API snake_case fields to ProductCard camelCase props
        const mapped = list.map((product) => ({
          ...product,
          originalPrice: product.original_price,
          isNew: product.is_new,
          isFeatured: product.is_featured,
          inStock: product.in_stock,
        }));

        setProducts(mapped);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query]);

  return (
    <div className="search-results-page">
      <h2>Results for “{query}”</h2>
      {loading ? (
        <p>Loading results...</p>
      ) : products.length > 0 ? (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      ) : (
        <p>No products found. Try a different search term.</p>
      )}
    </div>
  );
};

export default SearchResultsPage;