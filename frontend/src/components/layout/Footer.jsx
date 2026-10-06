// src/components/layout/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const categories = [
    { name: 'Laptops', icon: '💻', link: '/category/laptops' },
    { name: 'Headphones', icon: '🎧', link: '/category/headphones' },
    { name: 'Smartwatches', icon: '⌚', link: '/category/smartwatches' },
    { name: 'Gaming Mouse', icon: '🖱️', link: '/category/mouse' },
    { name: 'Mechanical Keyboards', icon: '⌨️', link: '/category/keyboards' },
    { name: 'Gaming Consoles', icon: '🎮', link: '/category/gaming' },
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

  const socialLinks = [
    { name: 'Facebook', icon: '📘', url: 'https://facebook.com', color: '#1877f2' },
    { name: 'Instagram', icon: '📷', url: 'https://instagram.com', color: '#e4405f' },
    { name: 'Twitter', icon: '🐦', url: 'https://twitter.com', color: '#1da1f2' },
    { name: 'YouTube', icon: '🎥', url: 'https://youtube.com', color: '#ff0000' },
    { name: 'LinkedIn', icon: '🔗', url: 'https://linkedin.com', color: '#0077b5' },
  ];

  return (
    <footer className="tech-footer-premium">
      {/* Trust Badges Section */}
      <div className="footer-trust-premium">
        <div className="container">
          <div className="trust-grid-premium">
            <div className="trust-card">
              <div className="trust-icon-wrapper">
                <span className="trust-icon">🚚</span>
              </div>
              <div className="trust-info">
                <h4>Free Shipping</h4>
                <p>On orders over $100</p>
              </div>
            </div>
            <div className="trust-card">
              <div className="trust-icon-wrapper">
                <span className="trust-icon">🔧</span>
              </div>
              <div className="trust-info">
                <h4>24-Month Warranty</h4>
                <p>On all electronics</p>
              </div>
            </div>
            <div className="trust-card">
              <div className="trust-icon-wrapper">
                <span className="trust-icon">💰</span>
              </div>
              <div className="trust-info">
                <h4>Price Match</h4>
                <p>Best price guaranteed</p>
              </div>
            </div>
            <div className="trust-card">
              <div className="trust-icon-wrapper">
                <span className="trust-icon">🔄</span>
              </div>
              <div className="trust-info">
                <h4>30-Day Returns</h4>
                <p>Hassle-free returns</p>
              </div>
            </div>
            <div className="trust-card">
              <div className="trust-icon-wrapper">
                <span className="trust-icon">🔒</span>
              </div>
              <div className="trust-info">
                <h4>Secure Checkout</h4>
                <p>SSL encrypted payment</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Section */}
      <div className="footer-main-premium">
        <div className="container">
          <div className="footer-grid-premium">
            {/* Brand Column */}
            <div className="footer-brand-premium">
              <div className="footer-logo-premium">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                  <line x1="8" y1="21" x2="16" y2="21"/>
                  <line x1="12" y1="17" x2="12" y2="21"/>
                  <circle cx="8" cy="10" r="1.5" fill="currentColor" stroke="none"/>
                  <circle cx="16" cy="10" r="1.5" fill="currentColor" stroke="none"/>
                </svg>
                <div className="logo-text">
                  <span className="logo-main">Tech<span className="logo-accent">Hub</span></span>
                  <span className="logo-tagline">Electronics Store</span>
                </div>
              </div>
              <p className="footer-description-premium">
                Your premier destination for cutting-edge electronics. 
                From laptops to smartwatches, we bring you the best in tech with 
                exceptional customer service and competitive prices.
              </p>
              <div className="footer-apps-premium">
                <span>Download our app:</span>
                <div className="app-buttons-premium">
                  <a href="#" className="app-store">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.02.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                    App Store
                  </a>
                  <a href="#" className="google-play">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-7.841 4.827 5.539-7.129zm4.293 2.771l2.132 1.095c.65.335.65.875 0 1.21l-3.184 1.637-3.283-3.283 3.3-3.3 3.035 1.641zM4.54 3.443l7.84 4.826-2.3 2.3-5.54-7.126z"/>
                    </svg>
                    Google Play
                  </a>
                </div>
              </div>
            </div>

            {/* Categories Column */}
            <div className="footer-links-premium">
              <h4>Shop Categories</h4>
              <ul>
                {categories.map((cat) => (
                  <li key={cat.name}>
                    <Link to={cat.link}>
                      <span className="link-icon">{cat.icon}</span>
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Column */}
            <div className="footer-links-premium">
              <h4>Support</h4>
              <ul>
                {support.map((item) => (
                  <li key={item.name}>
                    <Link to={item.link}>{item.name}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Column */}
            <div className="footer-links-premium">
              <h4>Company</h4>
              <ul>
                {company.map((item) => (
                  <li key={item.name}>
                    <Link to={item.link}>{item.name}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter Section */}
            <div className="footer-newsletter-premium">
              <h4>Tech Updates</h4>
              <p>Subscribe for exclusive deals and new product alerts</p>
              <form className="newsletter-form-premium">
                <input type="email" placeholder="Your email address" />
                <button type="submit">
                  Subscribe
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              </form>
              <div className="social-links-premium">
                {socialLinks.map((social) => (
                  <a 
                    key={social.name} 
                    href={social.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="social-link"
                    style={{ '--social-color': social.color }}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom-premium">
        <div className="container">
          <div className="bottom-content-premium">
            <p>&copy; {currentYear} TechHub. All rights reserved.</p>
            <div className="payment-methods-premium">
              <span title="Visa">💳 Visa</span>
              <span title="Mastercard">💳 Mastercard</span>
              <span title="PayPal">💰 PayPal</span>
              <span title="Apple Pay">📱 Apple Pay</span>
              <span title="Google Pay">⚡ Google Pay</span>
              <span title="Klarna">💎 Klarna</span>
            </div>
            <div className="footer-bottom-links-premium">
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms of Service</Link>
              <Link to="/cookies">Cookie Settings</Link>
              <Link to="/sitemap">Sitemap</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};