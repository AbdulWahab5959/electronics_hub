// src/components/shop/ProductFilter.jsx
import React, { useState, useEffect } from 'react';

export const ProductFilter = ({
  onFilterChange,
  initialFilters = {},
  categories = [],
  brands = [],
  priceRange = { min: 0, max: 1000 },
  showMobile = false,
  onCloseMobile
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(showMobile);

  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    brands: true,
    rating: true,
    status: true
  });

  const [filters, setFilters] = useState({
    categories: initialFilters.categories || [],
    priceMin: initialFilters.priceMin ?? priceRange.min,
    priceMax: initialFilters.priceMax ?? priceRange.max,
    brands: initialFilters.brands || [],
    rating: initialFilters.rating || null,
    inStock: initialFilters.inStock || false,
    onSale: initialFilters.onSale || false
  });

  const [tempPrice, setTempPrice] = useState({
    min: initialFilters.priceMin ?? priceRange.min,
    max: initialFilters.priceMax ?? priceRange.max
  });

  useEffect(() => {
    setIsMobileOpen(showMobile);
  }, [showMobile]);

  const applyFilters = () => {
    const finalFilters = {
      ...filters,
      priceMin: Number(tempPrice.min) || priceRange.min,
      priceMax: Number(tempPrice.max) || priceRange.max
    };

    onFilterChange(finalFilters);
    if (onCloseMobile) onCloseMobile();
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const renderFilterSection = (title, section, children) => (
    <div className="filter-section">
      <button
        type="button"
        className="filter-section-header"
        onClick={() => toggleSection(section)}
      >
        <span>{title}</span>
        <svg
          className={`filter-arrow ${expandedSections[section] ? 'expanded' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {expandedSections[section] && (
        <div className="filter-section-content">{children}</div>
      )}
    </div>
  );

  const handleCategoryChange = (category) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleBrandChange = (brand) => {
    setFilters(prev => ({
      ...prev,
      brands: prev.brands.includes(brand)
        ? prev.brands.filter(b => b !== brand)
        : [...prev.brands, brand]
    }));
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      categories: [],
      priceMin: priceRange.min,
      priceMax: priceRange.max,
      brands: [],
      rating: null,
      inStock: false,
      onSale: false
    };

    setFilters(clearedFilters);
    setTempPrice({ min: priceRange.min, max: priceRange.max });
    onFilterChange(clearedFilters);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    count += filters.categories.length;
    count += filters.brands.length;
    if (filters.rating) count++;
    if (filters.inStock) count++;
    if (filters.onSale) count++;
    if (Number(tempPrice.min) > priceRange.min || Number(tempPrice.max) < priceRange.max) count++;
    return count;
  };

  const content = (
    <>
      {categories.length > 0 &&
        renderFilterSection('Categories', 'categories', (
          <div className="filter-options">
            {categories.map(category => {
              const categoryName = category.name || category;
              return (
                <label key={category.id || categoryName} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(categoryName)}
                    onChange={() => handleCategoryChange(categoryName)}
                  />
                  <span className="checkmark"></span>
                  <span className="filter-label">{categoryName}</span>
                  {category.count && <span className="filter-count">({category.count})</span>}
                </label>
              );
            })}
          </div>
        ))}

      {renderFilterSection('Price Range', 'price', (
        <div className="price-range">
          <div className="price-inputs">
            <div className="price-input-wrapper">
              <span>$</span>
              <input
                type="text"
                inputMode="numeric"
                value={tempPrice.min}
                onChange={(e) =>
                  setTempPrice(prev => ({
                    ...prev,
                    min: e.target.value.replace(/\D/g, '')
                  }))
                }
              />
            </div>

            <span className="price-separator">—</span>

            <div className="price-input-wrapper">
              <span>$</span>
              <input
                type="text"
                inputMode="numeric"
                value={tempPrice.max}
                onChange={(e) =>
                  setTempPrice(prev => ({
                    ...prev,
                    max: e.target.value.replace(/\D/g, '')
                  }))
                }
              />
            </div>
          </div>

          <div className="price-slider">
            <input
              type="range"
              min={priceRange.min}
              max={priceRange.max}
              value={Number(tempPrice.min) || priceRange.min}
              onChange={(e) =>
                setTempPrice(prev => ({ ...prev, min: e.target.value }))
              }
              className="price-slider-min"
            />

            <input
              type="range"
              min={priceRange.min}
              max={priceRange.max}
              value={Number(tempPrice.max) || priceRange.max}
              onChange={(e) =>
                setTempPrice(prev => ({ ...prev, max: e.target.value }))
              }
              className="price-slider-max"
            />
          </div>
        </div>
      ))}

      {brands.length > 0 &&
        renderFilterSection('Brands', 'brands', (
          <div className="filter-options">
            {brands.map(brand => {
              const brandName = brand.name || brand;
              return (
                <label key={brand.id || brandName} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={filters.brands.includes(brandName)}
                    onChange={() => handleBrandChange(brandName)}
                  />
                  <span className="checkmark"></span>
                  <span className="filter-label">{brandName}</span>
                  {brand.count && <span className="filter-count">({brand.count})</span>}
                </label>
              );
            })}
          </div>
        ))}

      {renderFilterSection('Customer Rating', 'rating', (
        <div className="filter-ratings">
          {[5, 4, 3, 2, 1].map(rating => (
            <button
              type="button"
              key={rating}
              className={`rating-option ${filters.rating === rating ? 'active' : ''}`}
              onClick={() =>
                setFilters(prev => ({
                  ...prev,
                  rating: prev.rating === rating ? null : rating
                }))
              }
            >
              <div className="rating-stars">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < rating ? 'star-filled' : 'star-empty'}>
                    ★
                  </span>
                ))}
              </div>
              <span className="rating-text">& up</span>
            </button>
          ))}
        </div>
      ))}

      {renderFilterSection('Status', 'status', (
        <div className="filter-options">
          <label className="filter-checkbox">
            <input
              type="checkbox"
              checked={filters.inStock}
              onChange={(e) =>
                setFilters(prev => ({ ...prev, inStock: e.target.checked }))
              }
            />
            <span className="checkmark"></span>
            <span className="filter-label">In Stock Only</span>
          </label>

          <label className="filter-checkbox">
            <input
              type="checkbox"
              checked={filters.onSale}
              onChange={(e) =>
                setFilters(prev => ({ ...prev, onSale: e.target.checked }))
              }
            />
            <span className="checkmark"></span>
            <span className="filter-label">On Sale</span>
          </label>
        </div>
      ))}
    </>
  );

  if (isMobileOpen) {
    return (
      <div className="filter-mobile-overlay" onClick={onCloseMobile}>
        <div className="filter-mobile-drawer" onClick={(e) => e.stopPropagation()}>
          <div className="filter-mobile-header">
            <h3>Filters</h3>
            <button type="button" className="filter-mobile-close" onClick={onCloseMobile}>
              ✕
            </button>
          </div>

          <div className="filter-mobile-content">{content}</div>

          <div className="filter-mobile-footer">
            <button type="button" className="filter-clear-btn" onClick={clearAllFilters}>
              Clear All ({getActiveFilterCount()})
            </button>
            <button type="button" className="filter-apply-btn" onClick={applyFilters}>
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="product-filter-premium">
      <div className="filter-header">
        <h3>Filters</h3>
        {getActiveFilterCount() > 0 && (
          <button type="button" className="filter-clear-link" onClick={clearAllFilters}>
            Clear All ({getActiveFilterCount()})
          </button>
        )}
      </div>

      <div className="filter-body">{content}</div>

      <button type="button" className="filter-apply-desktop" onClick={applyFilters}>
        Apply Filters
      </button>
    </div>
  );
};