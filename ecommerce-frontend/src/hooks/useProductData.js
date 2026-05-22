// src/hooks/useProductData.js
import { useState, useEffect } from 'react';

// Mock product data – replace with your actual products
const MOCK_PRODUCTS = [
  {
    id: 1,
    name: 'MacBook Pro 14"',
    price: 1999.99,
    image: 'https://via.placeholder.com/100?text=MacBook',
    brand: 'Apple',
    category: 'Laptops',
    keywords: 'apple laptop m3 pro silicon',
    inStock: true,
    rating: 4.8,
    reviews: 124
  },
  {
    id: 2,
    name: 'Sony WH-1000XM5',
    price: 399.99,
    image: 'https://via.placeholder.com/100?text=Sony',
    brand: 'Sony',
    category: 'Headphones',
    keywords: 'noise cancelling wireless bluetooth',
    inStock: true,
    rating: 4.9,
    reviews: 89
  },
  {
    id: 3,
    name: 'Samsung Galaxy S24 Ultra',
    price: 1299.99,
    image: 'https://via.placeholder.com/100?text=Samsung',
    brand: 'Samsung',
    category: 'Smartphones',
    keywords: 'android phone camera',
    inStock: true,
    rating: 4.7,
    reviews: 234
  },
  {
    id: 4,
    name: 'Logitech MX Master 3S',
    price: 99.99,
    image: 'https://via.placeholder.com/100?text=Logitech',
    brand: 'Logitech',
    category: 'Accessories',
    keywords: 'mouse ergonomic wireless',
    inStock: true,
    rating: 4.6,
    reviews: 456
  },
  {
    id: 5,
    name: 'Dell XPS 15',
    price: 1899.99,
    image: 'https://via.placeholder.com/100?text=Dell',
    brand: 'Dell',
    category: 'Laptops',
    keywords: 'windows laptop intel',
    inStock: false,
    rating: 4.5,
    reviews: 78
  },
  {
    id: 6,
    name: 'Apple Watch Series 9',
    price: 429.99,
    image: 'https://via.placeholder.com/100?text=AppleWatch',
    brand: 'Apple',
    category: 'Smartwatches',
    keywords: 'fitness tracker health',
    inStock: true,
    rating: 4.8,
    reviews: 312
  },
  {
    id: 7,
    name: 'Bose QuietComfort Ultra',
    price: 429.99,
    image: 'https://via.placeholder.com/100?text=Bose',
    brand: 'Bose',
    category: 'Headphones',
    keywords: 'noise cancelling comfort',
    inStock: true,
    rating: 4.7,
    reviews: 67
  },
  {
    id: 8,
    name: 'iPad Pro 12.9"',
    price: 1099.99,
    image: 'https://via.placeholder.com/100?text=iPad',
    brand: 'Apple',
    category: 'Tablets',
    keywords: 'tablet m2 drawing',
    inStock: true,
    rating: 4.9,
    reviews: 203
  }
];

export const useProductData = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulate network delay (optional)
    const timer = setTimeout(() => {
      setProducts(MOCK_PRODUCTS);
      setLoading(false);
    }, 500);

    // If you want to fetch from real API later, replace above with:
    /*
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err.message);
        // Fallback to mock data
        setProducts(MOCK_PRODUCTS);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
    */

    return () => clearTimeout(timer);
  }, []);

  return { products, loading, error };
};