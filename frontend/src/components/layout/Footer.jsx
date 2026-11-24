import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { TechHubBrand } from '../common/TechHubBrand';

// Site content — centralized so it can be extracted into i18n in the future.
const COPYRIGHT = '© TechHub';
const TAGLINE = 'Electronics for work, study and everyday life.';

const FOOTER_GROUPS = [
  {
    label: 'Explore',
    links: [
      { label: 'Shop all', to: '/shop' },
      { label: 'Compare products', to: '/compare' },
    ],
  },
  {
    label: 'Customer care',
    links: [
      { label: 'Contact us', to: '/contact' },
    ],
  },
];

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

          {FOOTER_GROUPS.map((group) => (
            <div key={group.label} className="store-footer-group">
              <h2>{group.label}</h2>
              <nav aria-label={group.label}>
                {group.links.map((link) => (
                  <Link key={link.to} className="footer-link" to={link.to}>
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          ))}

          <div className="store-footer-group">
            <h2>Your account</h2>
            <nav aria-label="Your account">
              <AccountLinks isAuthenticated={isAuthenticated} />
            </nav>
          </div>
        </div>

        <div className="store-footer-bottom text-center">
          <span>{COPYRIGHT} {new Date().getFullYear()}</span>
          <span>{TAGLINE}</span>
        </div>
      </div>
    </footer>
  );
};

const AccountLinks = ({ isAuthenticated }) => (
  <>
    <Link className="footer-link" to="/wishlist">Wishlist</Link>
    <Link className="footer-link" to="/cart">Cart</Link>
    {isAuthenticated ? (
      <>
        <Link className="footer-link" to="/orders">Orders</Link>
        <Link className="footer-link" to="/profile">Profile</Link>
      </>
    ) : (
      <Link className="footer-link" to="/login">Sign in</Link>
    )}
  </>
);
