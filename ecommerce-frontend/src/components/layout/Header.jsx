// src/components/layout/Header.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { SearchBar } from '../common/SearchBar';

export const Header = ({ products = [] }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);   // controls overlay

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen || isSearchOpen ? 'hidden' : 'auto';
    return () => (document.body.style.overflow = 'auto');
  }, [isMobileMenuOpen, isSearchOpen]);

  const closeMenus = () => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    closeMenus();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Shop', path: '/shop' },
    { name: 'Orders', path: '/orders' },
    { name: 'Contact Us', path: '/contact' },
  ];

  const Logo = () => (
    <Link to="/" className="tech-logo" onClick={closeMenus}>
      <div className="logo-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
          <circle cx="8" cy="10" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="16" cy="10" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      </div>
      <div className="logo-text">
        <span className="logo-main">Tech<span className="logo-accent">Hub</span></span>
        <span className="logo-tagline">Electronics Store</span>
      </div>
    </Link>
  );

  return (
    <header className={`tech-header ${isScrolled ? 'header-scrolled' : ''}`}>
      {/* Top bar (unchanged) */}
      <div className="tech-top-bar">
        <div className="container">
          <div className="top-bar-content">
            <div className="top-bar-marquee">
              <span className="marquee-icon">⚡</span>
              <span className="marquee-text">
                Free 2-Day Delivery on Orders $100+ | 24-Month Warranty on All Electronics | Price Match Guarantee
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

      {/* Main header row – single line */}
      <div className="tech-main-header">
        <div className="container">
          <div className="main-header-content">
            <Logo />

            {/* Desktop navigation */}
            <div className="tech-nav-bar">
              <nav className="tech-nav">
                <div className="nav-links">
                  {navLinks.map((link) => (
                    <Link key={link.name} to={link.path} className="nav-link">
                      <span>{link.name}</span>
                    </Link>
                  ))}
                </div>
              </nav>
            </div>

            {/* Actions + Search icon + Auth */}
            <div className="tech-actions">
              {/* Wishlist */}
              <Link to="/wishlist" className="action-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                <span className="action-label">Wishlist</span>
              </Link>

              {/* Cart */}
              <Link to="/cart" className="action-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                <span className="action-label">Cart</span>
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </Link>

              {/* 🔍 SEARCH ICON (opens overlay) */}
              <button
                type="button"
                className="desktop-search-icon"
                onClick={() => setIsSearchOpen(true)}
                aria-label="Open search"
              >
                🔍
              </button>

              {/* User / Auth */}
              {isAuthenticated ? (
                <div className="user-menu">
                  <button type="button" className="user-trigger">
                    <div className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
                    <span className="user-name">{user?.name?.split(' ')[0]}</span>
                    <svg className="dropdown-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                  <div className="user-dropdown">
                    <Link to="/profile">Profile</Link>
                    <Link to="/support-tickets">Support Tickets</Link>
                    <hr />
                    <button onClick={handleLogout}>Logout</button>
                  </div>
                </div>
              ) : (
                <div className="auth-buttons">
                  <Link to="/login" className="btn-login">Login</Link>
                  <Link to="/register" className="btn-signup">Sign Up</Link>
                </div>
              )}
            </div>

            {/* Mobile menu trigger */}
            <button
              type="button"
              className={`mobile-menu-trigger ${isMobileMenuOpen ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Open menu"
            >
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
      </div>

      {/* SEARCH OVERLAY (contains SearchBar) */}
      {isSearchOpen && (
        <div className="search-overlay" onClick={() => setIsSearchOpen(false)}>
          <div className="search-overlay-box" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="search-close"
              onClick={() => setIsSearchOpen(false)}
              aria-label="Close search"
            >
              ✕
            </button>
            <SearchBar
              products={products}
              placeholder="Search products by name, brand, or category..."
            />
          </div>
        </div>
      )}

      {/* Mobile menu panel (unchanged, but you can optionally replace its search form with SearchBar too) */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setIsMobileMenuOpen(false)} />
      )}
      <div className={`mobile-menu-panel ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-header">
          <Logo />
          <button onClick={() => setIsMobileMenuOpen(false)}>✕</button>
        </div>

        <div className="mobile-search">
          <form onSubmit={(e) => { e.preventDefault(); /* handle mobile search */ }}>
            <input type="text" placeholder="Search electronics..." />
            <button type="submit">🔍</button>
          </form>
        </div>

        <div className="mobile-section">
          <Link to="/dashboard" onClick={closeMenus}>Dashboard</Link>
          <Link to="/shop" onClick={closeMenus}>Shop</Link>
          <Link to="/orders" onClick={closeMenus}>Orders</Link>
          <Link to="/contact" onClick={closeMenus}>Contact Us</Link>
          <Link to="/compare" onClick={closeMenus}>Compare Products</Link>
          <Link to="/wishlist" onClick={closeMenus}>Wishlist</Link>
          <Link to="/cart" onClick={closeMenus}>Cart</Link>
          <Link to="/profile" onClick={closeMenus}>Profile</Link>
          <Link to="/support-tickets" onClick={closeMenus}>Support Tickets</Link>
          <Link to="/track-order" onClick={closeMenus}>Track Order</Link>
          <Link to="/support" onClick={closeMenus}>Support</Link>
        </div>

        <div className="mobile-auth">
          {isAuthenticated ? (
            <button onClick={handleLogout}>Logout</button>
          ) : (
            <>
              <Link to="/login" onClick={closeMenus}>Login</Link>
              <Link to="/register" onClick={closeMenus}>Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};