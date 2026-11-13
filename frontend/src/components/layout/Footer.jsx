import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { TechHubBrand } from '../common/TechHubBrand';

export const Footer = () => {
  const { isAuthenticated } = useAuth();

  return (
    <footer className="store-footer">
      <div className="store-footer-inner">
        <div className="store-footer-top">
          <div className="store-footer-brand">
            <TechHubBrand className="footer-tech-logo" />
            <p>Computers, phones, audio and accessories for everyday use.</p>
          </div>

          <div className="store-footer-group">
            <h2>Explore</h2>
            <nav aria-label="Explore">
              <Link to="/shop">Shop all</Link>
              <Link to="/compare">Compare products</Link>
            </nav>
          </div>

          <div className="store-footer-group">
            <h2>Customer care</h2>
            <nav aria-label="Customer care">
              <Link to="/contact">Contact us</Link>
            </nav>
          </div>

          <div className="store-footer-group">
            <h2>Your account</h2>
            <nav aria-label="Your account">
              <Link to="/wishlist">Wishlist</Link>
              <Link to="/cart">Cart</Link>
              {isAuthenticated ? (
                <>
                  <Link to="/orders">Orders</Link>
                  <Link to="/profile">Profile</Link>
                </>
              ) : (
                <Link to="/login">Sign in</Link>
              )}
            </nav>
          </div>
        </div>

        <div className="store-footer-bottom">
          <span>&copy; {new Date().getFullYear()} TechHub</span>
          <span>Electronics for work, study and everyday life.</span>
        </div>
      </div>
    </footer>
  );
};
