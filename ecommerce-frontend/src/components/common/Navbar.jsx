// src/components/common/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Navbar.css';  // We'll create this next

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0); // Get from cart context

  // Handle scroll effect
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
    setIsMenuOpen(false);
  };

  const categories = [
    { name: 'Electronics', slug: 'electronics' },
    { name: 'Fashion', slug: 'fashion' },
    { name: 'Home & Living', slug: 'home-living' },
    { name: 'Sports', slug: 'sports' },
    { name: 'Books', slug: 'books' },
  ];

  return (
    <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
      <div className="container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🛒</span>
          <span className="logo-text">ShopHub</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar-desktop">
          {/* Categories Dropdown */}
          <div className="navbar-dropdown">
            <button className="dropdown-trigger">
              📂 Categories
              <span className="dropdown-arrow">▼</span>
            </button>
            <div className="dropdown-menu">
              {categories.map((cat) => (
                <Link key={cat.slug} to={`/category/${cat.slug}`} className="dropdown-item">
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="navbar-search">
            <input 
              type="text" 
              placeholder="Search products..." 
              className="search-input"
            />
            <button className="search-btn">🔍</button>
          </div>

          {/* Navigation Links */}
          <div className="navbar-links">
            <Link to="/shop" className="nav-link">Shop</Link>
            <Link to="/deals" className="nav-link hot">🔥 Hot Deals</Link>
            
            {/* Cart with Badge */}
            <Link to="/cart" className="nav-link cart-link">
              🛍️ Cart
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="user-menu">
                <button className="user-trigger">
                  👤 {user?.name?.split(' ')[0]}
                  <span className="dropdown-arrow">▼</span>
                </button>
                <div className="user-dropdown">
                  <Link to="/dashboard" className="dropdown-item">📊 Dashboard</Link>
                  <Link to="/orders" className="dropdown-item">📦 My Orders</Link>
                  <Link to="/wishlist" className="dropdown-item">❤️ Wishlist</Link>
                  <Link to="/profile" className="dropdown-item">⚙️ Settings</Link>
                  <hr />
                  <button onClick={handleLogout} className="dropdown-item logout">
                    🚪 Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="auth-links">
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/register" className="btn-primary-small">Sign Up Free</Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className={`mobile-menu-btn ${isMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="mobile-menu">
          <div className="mobile-search">
            <input type="text" placeholder="Search products..." />
            <button>🔍</button>
          </div>
          
          <div className="mobile-links">
            <Link to="/shop" onClick={() => setIsMenuOpen(false)}>🛍️ Shop</Link>
            <Link to="/deals" onClick={() => setIsMenuOpen(false)}>🔥 Hot Deals</Link>
            <Link to="/cart" onClick={() => setIsMenuOpen(false)}>🛍️ Cart</Link>
            
            <div className="mobile-categories">
              <div className="mobile-category-title">📂 Categories</div>
              {categories.map((cat) => (
                <Link key={cat.slug} to={`/category/${cat.slug}`} onClick={() => setIsMenuOpen(false)}>
                  {cat.name}
                </Link>
              ))}
            </div>

            {isAuthenticated ? (
              <>
                <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>📊 Dashboard</Link>
                <Link to="/orders" onClick={() => setIsMenuOpen(false)}>📦 Orders</Link>
                <button onClick={handleLogout} className="mobile-logout">🚪 Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>Login</Link>
                <Link to="/register" className="mobile-register" onClick={() => setIsMenuOpen(false)}>
                  Sign Up Free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};