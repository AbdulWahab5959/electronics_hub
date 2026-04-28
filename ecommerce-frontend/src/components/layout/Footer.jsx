// src/components/layout/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const categories = [
    { name: 'Laptops', link: '/category/laptops' },
    { name: 'Headphones', link: '/category/headphones' },
    { name: 'Smartwatches', link: '/category/smartwatches' },
    { name: 'Gaming Mouse', link: '/category/mouse' },
    { name: 'Mechanical Keyboards', link: '/category/keyboards' },
    { name: 'Gaming Consoles', link: '/category/gaming' },
  ];

  const support = [
    { name: 'Help Center', link: '/help' },
    { name: 'Warranty Information', link: '/warranty' },
    { name: 'Returns & Refunds', link: '/returns' },
    { name: 'Shipping Info', link: '/shipping' },
    { name: 'Product Registration', link: '/register-product' },
    { name: 'Drivers & Downloads', link: '/drivers' },
  ];

  const company = [
    { name: 'About TechHub', link: '/about' },
    { name: 'Careers', link: '/careers' },
    { name: 'Press', link: '/press' },
    { name: 'Affiliate Program', link: '/affiliate' },
    { name: 'Become a Seller', link: '/seller' },
    { name: 'Sustainability', link: '/sustainability' },
  ];

  return (
    <footer className="tech-footer">
      {/* Trust Badges */}
      <div className="footer-trust">
        <div className="container">
          <div className="trust-grid">
            <div className="trust-item">
              <div className="trust-icon">🚚</div>
              <div className="trust-text">
                <h4>Free Shipping</h4>
                <p>On orders over $100</p>
              </div>
            </div>
            <div className="trust-item">
              <div className="trust-icon">🔧</div>
              <div className="trust-text">
                <h4>24-Month Warranty</h4>
                <p>On all electronics</p>
              </div>
            </div>
            <div className="trust-item">
              <div className="trust-icon">💰</div>
              <div className="trust-text">
                <h4>Price Match</h4>
                <p>Best price guaranteed</p>
              </div>
            </div>
            <div className="trust-item">
              <div className="trust-icon">🔄</div>
              <div className="trust-text">
                <h4>30-Day Returns</h4>
                <p>Hassle-free returns</p>
              </div>
            </div>
            <div className="trust-item">
              <div className="trust-icon">🔒</div>
              <div className="trust-text">
                <h4>Secure Checkout</h4>
                <p>SSL encrypted payment</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            {/* Brand Column */}
            <div className="footer-brand">
              <div className="footer-logo">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                  <line x1="8" y1="21" x2="16" y2="21"/>
                  <line x1="12" y1="17" x2="12" y2="21"/>
                  <circle cx="8" cy="10" r="1.5" fill="currentColor" stroke="none"/>
                  <circle cx="16" cy="10" r="1.5" fill="currentColor" stroke="none"/>
                </svg>
                <span>Tech<span>Hub</span></span>
              </div>
              <p className="footer-description">
                Your premier destination for cutting-edge electronics. 
                From laptops to smartwatches, we bring you the best in tech.
              </p>
              <div className="footer-apps">
                <span>Download our app:</span>
                <div className="app-buttons">
                  <a href="#">App Store</a>
                  <a href="#">Google Play</a>
                </div>
              </div>
            </div>

            {/* Categories Column */}
            <div className="footer-links">
              <h4>Shop Categories</h4>
              {categories.map((cat) => (
                <Link key={cat.name} to={cat.link}>{cat.name}</Link>
              ))}
            </div>

            {/* Support Column */}
            <div className="footer-links">
              <h4>Support</h4>
              {support.map((item) => (
                <Link key={item.name} to={item.link}>{item.name}</Link>
              ))}
            </div>

            {/* Company Column */}
            <div className="footer-links">
              <h4>Company</h4>
              {company.map((item) => (
                <Link key={item.name} to={item.link}>{item.name}</Link>
              ))}
            </div>

            {/* Newsletter */}
            <div className="footer-newsletter">
              <h4>Tech Updates</h4>
              <p>Subscribe for exclusive deals and new product alerts</p>
              <form className="newsletter-form">
                <input type="email" placeholder="Your email address" />
                <button type="submit">Subscribe</button>
              </form>
              <div className="social-links">
                <a href="#">📘</a>
                <a href="#">📷</a>
                <a href="#">🐦</a>
                <a href="#">🎥</a>
                <a href="#">💬</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment & Copyright */}
      <div className="footer-bottom">
        <div className="container">
          <div className="bottom-content">
            <p>&copy; {currentYear} TechHub. All rights reserved.</p>
            <div className="payment-methods">
              <span>💳 Visa</span>
              <span>💳 Mastercard</span>
              <span>💰 PayPal</span>
              <span>📱 Apple Pay</span>
              <span>⚡ Google Pay</span>
              <span>💎 Klarna</span>
            </div>
            <div className="footer-bottom-links">
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms of Service</Link>
              <Link to="/cookies">Cookie Settings</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};