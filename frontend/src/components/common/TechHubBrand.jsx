import { Devices } from '@phosphor-icons/react/dist/csr/Devices';
import { Link } from 'react-router-dom';

export const TechHubBrand = ({ className = '', onClick }) => (
  <Link to="/" className={`tech-logo ${className}`.trim()} onClick={onClick}>
    <span className="logo-icon">
      <Devices size={34} weight="duotone" aria-hidden="true" />
    </span>
    <span className="logo-text">
      <span className="logo-main">
        Tech<span className="logo-accent">Hub</span>
      </span>
      <span className="logo-tagline">Electronics store</span>
    </span>
  </Link>
);
