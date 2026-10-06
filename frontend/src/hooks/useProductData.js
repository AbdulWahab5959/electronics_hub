import { useState, useEffect } from 'react';

export const useProductData = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchProducts = async () => {
      try {
        // Request a large number (or all) products for the search bar
        const response = await fetch('/api/products?per_page=1000');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const json = await response.json();
        const list = json.data?.data || json.data || [];
        if (!cancelled) setProducts(list);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProducts();
    return () => { cancelled = true; };
  }, []);

  return { products, loading, error };
};