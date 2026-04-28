// src/components/layout/Header.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Electronics categories
  const categories = [
    { name: 'Laptops', icon: '💻', slug: 'laptops', color: '#3b82f6' },
    { name: 'Headphones', icon: '🎧', slug: 'headphones', color: '#8b5cf6' },
    { name: 'Smartwatches', icon: '⌚', slug: 'smartwatches', color: '#10b981' },
    { name: 'Mouse', icon: '🖱️', slug: 'mouse', color: '#f59e0b' },
    { name: 'Keyboards', icon: '⌨️', slug: 'keyboards', color: '#ef4444' },  ];

  return (
    <header className={`tech-header ${isScrolled ? "header-scrolled" : ""}`}>
      {/* Top Bar - Electronics Announcement */}
      <div className="tech-top-bar">
        <div className="container">
          <div className="top-bar-content">
            <div className="top-bar-marquee">
              <span className="marquee-icon">⚡</span>
              <span className="marquee-text">
                Free 2-Day Delivery on Orders $100+ | 24-Month Warranty on All
                Electronics | Price Match Guarantee
              </span>
              <span className="marquee-icon">⚡</span>
            </div>
            <div className="top-bar-links">
              <Link to="/track-order">Track Order</Link>
              <Link to="/support">Support</Link>
              <Link to="/business">Business Store</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="tech-main-header">
        <div className="container">
          <div className="main-header-content">
            {/* Logo */}
            <Link to="/" className="tech-logo">
              <div className="logo-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                  <circle
                    cx="8"
                    cy="10"
                    r="1.5"
                    fill="currentColor"
                    stroke="none"
                  />
                  <circle
                    cx="16"
                    cy="10"
                    r="1.5"
                    fill="currentColor"
                    stroke="none"
                  />
                </svg>
              </div>
              <div className="logo-text">
                <span className="logo-main">
                  Tech<span className="logo-accent">Hub</span>
                </span>
                <span className="logo-tagline">Electronics Store</span>
              </div>
            </Link>

            {/* Search Bar - Electronics Focused */}
            <form className="tech-search" onSubmit={handleSearch}>
              <div className="search-category">
                <select>
                  <option>All Categories</option>
                  <option>Laptops</option>
                  <option>Headphones</option>
                  <option>Smartwatches</option>
                  <option>Mouse</option>
                  <option>Keyboards</option>
                  <option>Gaming</option>
                </select>
              </div>
              <input
                type="text"
                placeholder="Search for laptops, headphones, smartwatches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </button>
            </form>

            {/* Header Actions */}
            <div className="tech-actions">
              <Link to="/compare" className="action-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 9l4-4-4-4" />
                  <path d="M18 15l-4 4 4 4" />
                  <path d="M2 9h14M22 15h-14" />
                </svg>
                <span className="action-label">Compare</span>
              </Link>

              <Link to="/wishlist" className="action-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                <span className="action-label">Wishlist</span>
              </Link>

              <Link to="/cart" className="action-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="9" cy="21" r="1" /> 
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                <span className="action-label">Cart</span>
                {cartCount > 0 && (
                  <span className="cart-badge">{cartCount}</span>
                )}
              </Link>

              {isAuthenticated ? (
                <div className="user-menu">
                  <button className="user-trigger">
                    <div className="user-avatar">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="user-name">
                      {user?.name?.split(" ")[0]}
                    </span>
                    <svg
                      className="dropdown-arrow"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                  <div className="user-dropdown">
                    <Link to="/dashboard">📊 Dashboard</Link>
                    <Link to="/orders">📦 My Orders</Link>
                    <Link to="/wishlist">❤️ Wishlist</Link>
                    <Link to="/compare">🔄 Compare</Link>
                    <Link to="/support-tickets">🎫 Support Tickets</Link>
                    <hr />
                    <button onClick={handleLogout}>🚪 Logout</button>
                  </div>
                </div>
              ) : (
                <div className="auth-buttons">
                  <Link to="/login" className="btn-login">
                    Login
                  </Link>
                  <Link to="/register" className="btn-signup">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Trigger */}
            <button
              className={`mobile-menu-trigger ${isMobileMenuOpen ? "active" : ""}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Navigation Bar */}
      <div className="tech-nav-bar">
        <div className="container">
          <nav className="tech-nav">
            <button className="nav-all-categories">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
              All Categories
            </button>
            <div className="nav-links">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  to={`/category/${category.slug}`}
                  className="nav-link"
                  style={{ "--hover-color": category.color }}
                >
                  <span className="nav-icon">{category.icon}</span>
                  <span>{category.name}</span>
                </Link>
              ))}
            </div>
            <div className="nav-featured">
              <Link to="/deals" className="nav-deals">
                🔥 Hot Deals
              </Link>
              <Link to="/new-arrivals" className="nav-new">
                ✨ New Arrivals
              </Link>
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <div className={`mobile-menu-panel ${isMobileMenuOpen ? "open" : ""}`}>
        <div className="mobile-menu-header">
          <div className="mobile-logo">TechHub</div>
          <button onClick={() => setIsMobileMenuOpen(false)}>✕</button>
        </div>
        <div className="mobile-search">
          <form onSubmit={handleSearch}>
            <input type="text" placeholder="Search electronics..." />
            <button type="submit">🔍</button>
          </form>
        </div>
        <div className="mobile-categories">
          <h4>Categories</h4>
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              to={`/category/${cat.slug}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {cat.icon} {cat.name}
            </Link>
          ))}
        </div>
        <div className="mobile-links">
          <Link to="/deals" onClick={() => setIsMobileMenuOpen(false)}>
            🔥 Hot Deals
          </Link>
          <Link to="/new-arrivals" onClick={() => setIsMobileMenuOpen(false)}>
            ✨ New Arrivals
          </Link>
          <Link to="/compare" onClick={() => setIsMobileMenuOpen(false)}>
            🔄 Compare Products
          </Link>
          <Link to="/support" onClick={() => setIsMobileMenuOpen(false)}>
            🎧 Support
          </Link>
        </div>
        <div className="mobile-auth">
          {isAuthenticated ? (
            <button onClick={handleLogout}>Logout</button>
          ) : (
            <>
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                Login
              </Link>
              <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};