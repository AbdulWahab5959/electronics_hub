// src/pages/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/common/ProductCard';

export default function HomePage() {
  // Featured Electronics Products
  const featuredProducts = [
    {
      id: 1,
      name: "MacBook Pro 16\" M3 Chip",
      price: 2499.99,
      originalPrice: 2799.99,
      image: "https://placehold.co/400x400/3b82f6/white?text=MacBook+Pro",
      rating: 4.9,
      reviews: 3245,
      isNew: true,
      discount: 11
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
      discount: 12
    },
    {
      id: 3,
      name: "Apple Watch Ultra 2",
      price: 749.99,
      originalPrice: 799.99,
      image: "https://placehold.co/400x400/10b981/white?text=Apple+Watch",
      rating: 4.7,
      reviews: 2341,
      discount: 6
    },
    {
      id: 4,
      name: "Logitech MX Master 3S",
      price: 89.99,
      originalPrice: 99.99,
      image: "https://placehold.co/400x400/f59e0b/white?text=MX+Master",
      rating: 4.6,
      reviews: 1876,
      discount: 10
    }
  ];

  // Best Selling Electronics
  const bestSelling = [
    {
      id: 5,
      name: "Keychron K2 Mechanical Keyboard",
      price: 79.99,
      originalPrice: 99.99,
      image: "https://placehold.co/400x400/ef4444/white?text=Keychron",
      rating: 4.8,
      reviews: 3421,
      discount: 20
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
      discount: 8
    },
    {
      id: 7,
      name: "Bose QuietComfort Earbuds",
      price: 249.99,
      originalPrice: 299.99,
      image: "https://placehold.co/400x400/06b6d4/white?text=Bose",
      rating: 4.7,
      reviews: 1567,
      discount: 17
    },
    {
      id: 8,
      name: "LG UltraGear Gaming Monitor",
      price: 449.99,
      originalPrice: 549.99,
      image: "https://placehold.co/400x400/ec4899/white?text=LG+Monitor",
      rating: 4.8,
      reviews: 2345,
      discount: 18
    }
  ];

  // Electronics Categories
  const categories = [
    { name: "Laptops", icon: "💻", color: "#3b82f6", count: 245, slug: "laptops" },
    { name: "Headphones", icon: "🎧", color: "#8b5cf6", count: 189, slug: "headphones" },
    { name: "Smartwatches", icon: "⌚", color: "#10b981", count: 56, slug: "smartwatches" },
    { name: "Gaming Mouse", icon: "🖱️", color: "#f59e0b", count: 78, slug: "mouse" },
    { name: "Keyboards", icon: "⌨️", color: "#ef4444", count: 92, slug: "keyboards" },
    { name: "Gaming", icon: "🎮", color: "#ec4899", count: 156, slug: "gaming" },
    { name: "Audio", icon: "🔊", color: "#06b6d4", count: 134, slug: "audio" },
    { name: "Accessories", icon: "🔌", color: "#6b7280", count: 267, slug: "accessories" }
  ];

  // Brand Logos
  const brands = [
    { name: "Apple", logo: "🍎", color: "#000" },
    { name: "Samsung", logo: "⭐", color: "#1428a0" },
    { name: "Sony", logo: "🎵", color: "#000" },
    { name: "Dell", logo: "💻", color: "#007dc6" },
    { name: "HP", logo: "🖨️", color: "#0096d6" },
    { name: "Lenovo", logo: "📱", color: "#e2231a" },
    { name: "Razer", logo: "🐍", color: "#00ff00" },
    { name: "Logitech", logo: "🖱️", color: "#00b8f1" }
  ];

  const handleAddToCart = (id) => {
    console.log('Added to cart:', id);
  };

  return (
    <>
      {/* Hero Section */}
      <section className="home-hero">
        <div className="container">
            <div className="hero-content">
              <div className="hero-badge">
                <span className="badge-icon">⚡</span>
                Summer Mega Sale
              </div>
              <h1 className="hero-title">
                Premium <span className="hero-highlight">Electronics</span> at Best Prices
              </h1>
              <p className="hero-description">
                Discover the latest tech gadgets, laptops, headphones, and smartwatches. 
                Up to 40% off on selected items. Free shipping worldwide.
              </p>
              <div className="hero-buttons">
                <Link to="/shop" className="hero-btn-primary">
                  Shop Now
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </Link>
                <Link to="/deals" className="hero-btn-secondary">
                  View Deals
                </Link>
              </div>
              <div className="hero-stats">
                <div className="hero-stat">
                  <span className="stat-number">50K+</span>
                  <span className="stat-label">Happy Customers</span>
                </div>
                <div className="hero-stat">
                  <span className="stat-number">500+</span>
                  <span className="stat-label">Products</span>
                </div>
                <div className="hero-stat">
                  <span className="stat-number">24/7</span>
                  <span className="stat-label">Support</span>
                </div>
              </div>
            </div>
        </div>
      </section>

      {/* Brand Trust Bar */}
      <section className="brand-bar">
        <div className="container">
          <div className="brand-grid">
            {brands.map((brand) => (
              <div key={brand.name} className="brand-item">
                <span className="brand-icon">{brand.logo}</span>
                <span className="brand-name">{brand.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🚚</div>
              <h3>Free Shipping</h3>
              <p>On orders over $100</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔧</div>
              <h3>2 Year Warranty</h3>
              <p>On all electronics</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Price Match</h3>
              <p>Best price guarantee</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔄</div>
              <h3>Easy Returns</h3>
              <p>30-day return policy</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure Payment</h3>
              <p>SSL encrypted checkout</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="container">
          <div className="section-header">
            <h2>Shop by Category</h2>
            <p>Browse our wide range of electronics</p>
          </div>
          <div className="categories-grid">
            {categories.map((category) => (
              <Link 
                key={category.name} 
                to={`/category/${category.slug}`} 
                className="category-card"
                style={{ '--category-color': category.color }}
              >
                <div className="category-icon" style={{ background: category.color }}>
                  <span>{category.icon}</span>
                </div>
                <h3>{category.name}</h3>
                <span className="category-count">{category.count} products</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="products-section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2>Featured Products</h2>
              <p>Hand-picked just for you</p>
            </div>
            <Link to="/shop" className="view-all-link">
              View All
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
          <div className="products-grid">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Best Selling */}
      <section className="products-section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2>Best Sellers</h2>
              <p>Most popular electronics this month</p>
            </div>
            <Link to="/shop?sort=best-selling" className="view-all-link">
              View All
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
          <div className="products-grid">
            {bestSelling.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter-section">
        <div className="container">
          <div className="newsletter-wrapper">
            <div className="newsletter-icon">✉️</div>
            <h2>Subscribe to Tech Updates</h2>
            <p>Get exclusive deals, new product alerts, and tech news</p>
            <form className="newsletter-form">
              <input type="email" placeholder="Enter your email address" />
              <button type="submit">Subscribe</button>
            </form>
            <p className="newsletter-note">No spam. Unsubscribe anytime.</p>
          </div>
        </div>
      </section>
    </>
  );
}