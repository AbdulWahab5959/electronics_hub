// src/components/common/Breadcrumb.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Breadcrumb = ({ 
  items = [],
  separator = '/',
  showHome = true,
  homeText = 'Home',
  homePath = '/',
  className = '',
  truncateLength = 30
}) => {
  const location = useLocation();
  
  // Generate breadcrumb items from current URL if not provided
  const generateFromPath = () => {
    const pathnames = location.pathname.split('/').filter(x => x);
    
    // Format pathnames to display names
    return pathnames.map((path, index) => {
      // Convert kebab-case or snake_case to readable text
      let name = path
        .replace(/-/g, ' ')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase());
      
      // Decode URL encoded characters
      name = decodeURIComponent(name);
      
      // Truncate long names
      if (name.length > truncateLength) {
        name = name.substring(0, truncateLength) + '...';
      }
      
      const url = `/${pathnames.slice(0, index + 1).join('/')}`;
      
      return { name, path: url };
    });
  };
  
  // Use provided items or generate from URL
  let breadcrumbItems = items.length > 0 ? items : generateFromPath();
  
  // Add home item if enabled
  if (showHome && (breadcrumbItems.length > 0 || items.length === 0)) {
    breadcrumbItems = [{ name: homeText, path: homePath }, ...breadcrumbItems];
  }
  
  // Don't show breadcrumb if only home exists and no other items
  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <nav className={`breadcrumb-premium ${className}`} aria-label="Breadcrumb">
      <ol className="breadcrumb-list">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          
          return (
            <li key={index} className="breadcrumb-item">
              {isLast ? (
                <span className="breadcrumb-current" aria-current="page">
                  {item.icon && <span className="breadcrumb-icon">{item.icon}</span>}
                  {item.name}
                </span>
              ) : (
                <>
                  <Link to={item.path} className="breadcrumb-link">
                    {item.icon && <span className="breadcrumb-icon">{item.icon}</span>}
                    {item.name}
                  </Link>
                  <span className="breadcrumb-separator" aria-hidden="true">
                    {separator}
                  </span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

// ============================================
// PRODUCT BREADCRUMB (E-commerce specific)
// ============================================
export const ProductBreadcrumb = ({ 
  category, 
  subcategory, 
  productName,
  categoryPath,
  subcategoryPath 
}) => {
  const items = [];
  
  if (category) {
    items.push({ 
      name: category, 
      path: categoryPath || `/category/${category.toLowerCase().replace(/ /g, '-')}`,
      icon: '📁'
    });
  }
  
  if (subcategory) {
    items.push({ 
      name: subcategory, 
      path: subcategoryPath || `/category/${category?.toLowerCase().replace(/ /g, '-')}/${subcategory.toLowerCase().replace(/ /g, '-')}`,
      icon: '📂'
    });
  }
  
  if (productName) {
    items.push({ 
      name: productName,
      icon: '🏷️'
    });
  }
  
  return <Breadcrumb items={items} />;
};

// ============================================
// SHOP BREADCRUMB (For product listing)
// ============================================
export const ShopBreadcrumb = ({ category, subcategory }) => {
  const items = [];
  
  items.push({ name: 'Shop', path: '/shop', icon: '🛍️' });
  
  if (category) {
    items.push({ 
      name: category, 
      path: `/category/${category.toLowerCase().replace(/ /g, '-')}`,
      icon: '📁'
    });
  }
  
  if (subcategory) {
    items.push({ 
      name: subcategory,
      icon: '📂'
    });
  }
  
  return <Breadcrumb items={items} />;
};

// ============================================
// ACCOUNT BREADCRUMB (For user dashboard)
// ============================================
export const AccountBreadcrumb = ({ page }) => {
  const items = [
    { name: 'My Account', path: '/dashboard', icon: '👤' }
  ];
  
  if (page) {
    items.push({ name: page });
  }
  
  return <Breadcrumb items={items} />;
};