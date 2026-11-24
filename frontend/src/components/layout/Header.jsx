import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Headset } from '@phosphor-icons/react/dist/csr/Headset';
import { Heart } from '@phosphor-icons/react/dist/csr/Heart';
import { List } from '@phosphor-icons/react/dist/csr/List';
import { Receipt } from '@phosphor-icons/react/dist/csr/Receipt';
import { Scales } from '@phosphor-icons/react/dist/csr/Scales';
import { ShoppingCartSimple } from '@phosphor-icons/react/dist/csr/ShoppingCartSimple';
import { SignOut } from '@phosphor-icons/react/dist/csr/SignOut';
import { Storefront } from '@phosphor-icons/react/dist/csr/Storefront';
import { UserCircle } from '@phosphor-icons/react/dist/csr/UserCircle';
import { X } from '@phosphor-icons/react/dist/csr/X';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { SearchBar } from '../common/SearchBar';
import { TechHubBrand } from '../common/TechHubBrand';
import { useToast } from '../common/ToastNotification';

export const Header = ({ products = [] }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const showToast = useToast();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : previousOverflow;
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileMenuOpen]);

  const closeMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = async () => {
    const result = await logout();
    if (!result.success) {
      showToast(result.error, 'error');
      return;
    }
    closeMenu();
    navigate('/login');
  };

  const navLinks = [
    ...(isAuthenticated
      ? [
          { name: 'Dashboard', path: '/dashboard' },
          { name: 'Orders', path: '/orders' },
        ]
      : []),
    { name: 'Shop', path: '/shop' },
    { name: 'Compare', path: '/compare' },
    { name: 'Contact', path: '/contact' },
  ];

  const mobileLinks = [
    { name: 'Shop', path: '/shop', Icon: Storefront },
    { name: 'Compare products', path: '/compare', Icon: Scales },
    { name: 'Wishlist', path: '/wishlist', Icon: Heart },
    { name: 'Cart', path: '/cart', Icon: ShoppingCartSimple },
    { name: 'Contact us', path: '/contact', Icon: Headset },
    ...(isAuthenticated
      ? [
          { name: 'Dashboard', path: '/dashboard', Icon: Storefront },
          { name: 'Orders', path: '/orders', Icon: Receipt },
          { name: 'Profile', path: '/profile', Icon: UserCircle },
        ]
      : []),
  ];

  return (
    <header className={`tech-header ${isScrolled ? 'header-scrolled' : ''}`}>
  
      <div className="tech-main-header">
        <div className="container">
          <div className="main-header-content">
            <TechHubBrand className="header-brand" onClick={closeMenu} />

            <div className="tech-nav-bar">
              <nav className="tech-nav" aria-label="Main navigation">
                <div className="nav-links">
                  {navLinks.map((link) => (
                    <NavLink
                      key={link.name}
                      to={link.path}
                      className={({ isActive }) =>
                        `nav-link${isActive ? ' nav-link-active' : ''}`
                      }
                    >
                      {link.name}
                    </NavLink>
                  ))}
                </div>
              </nav>
            </div>

            <div className="header-search">
              <SearchBar
                products={products}
                placeholder="Search products, brands, categories"
              />
            </div>

            <div className="tech-actions">
              <Link to="/wishlist" className="action-icon" aria-label="Wishlist">
                <Heart size={20} weight="regular" aria-hidden="true" />
                <span className="action-label">Wishlist</span>
              </Link>

              <Link to="/cart" className="action-icon" aria-label="Cart">
                <ShoppingCartSimple size={20} weight="regular" aria-hidden="true" />
                <span className="action-label">Cart</span>
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </Link>

              {isAuthenticated ? (
                <div className="user-menu">
                  <button
                    type="button"
                    className="user-trigger"
                    aria-label={`Account: ${user?.name || 'profile'}`}
                  >
                    <span className="user-avatar">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                    <span className="user-name">{user?.name?.split(' ')[0]}</span>
                  </button>
                  <div className="user-dropdown">
                    <Link to="/profile">Profile</Link>
                    <Link to="/orders">Orders</Link>
                    <hr />
                    <button type="button" onClick={handleLogout}>Sign out</button>
                  </div>
                </div>
              ) : (
                <div className="auth-buttons">
                  <Link to="/login" className="btn-login">Sign in</Link>
                  <Link to="/register" className="btn-signup">Create account</Link>
                </div>
              )}
            </div>

            <button
              type="button"
              className={`mobile-menu-trigger ${isMobileMenuOpen ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              {isMobileMenuOpen ? (
                <X size={21} weight="regular" aria-hidden="true" />
              ) : (
                <List size={22} weight="regular" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <button
          type="button"
          className="mobile-menu-overlay"
          onClick={closeMenu}
          aria-label="Close navigation"
        />
      )}

      <div
        id="mobile-navigation"
        className={`mobile-menu-panel ${isMobileMenuOpen ? 'open' : ''}`}
        aria-hidden={!isMobileMenuOpen}
      >
        <div className="mobile-menu-header">
          <TechHubBrand onClick={closeMenu} />
          <button type="button" onClick={closeMenu} aria-label="Close menu">
            <X size={20} weight="regular" aria-hidden="true" />
          </button>
        </div>

        <nav className="mobile-section" aria-label="Mobile navigation">
          {mobileLinks.map(({ name, path, Icon }) => (
            <NavLink key={path} to={path} onClick={closeMenu}>
              <Icon size={20} weight="regular" aria-hidden="true" />
              <span>{name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mobile-auth">
          {isAuthenticated ? (
            <>
              <div className="mobile-account">
                <UserCircle size={22} weight="regular" aria-hidden="true" />
                <span>Signed in as {user?.name || 'customer'}</span>
              </div>
              <button type="button" onClick={handleLogout}>
                <SignOut size={18} weight="regular" aria-hidden="true" />
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={closeMenu}>Sign in</Link>
              <Link to="/register" onClick={closeMenu}>Create account</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
