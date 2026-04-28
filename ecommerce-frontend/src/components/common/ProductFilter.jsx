// src/components/shop/ProductFilter.jsx
import React, { useState, useEffect } from 'react';

export const ProductFilter = ({ 
  onFilterChange,
  initialFilters = {},
  categories = [],
  brands = [],
  sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  colors = [],
  priceRange = { min: 0, max: 1000 },
  showMobile = false,
  onCloseMobile
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(showMobile);
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    sizes: true,
    colors: true,
    brands: true
  });
  
  const [filters, setFilters] = useState({
    categories: initialFilters.categories || [],
    priceMin: initialFilters.priceMin || priceRange.min,
    priceMax: initialFilters.priceMax || priceRange.max,
    sizes: initialFilters.sizes || [],
    colors: initialFilters.colors || [],
    brands: initialFilters.brands || [],
    rating: initialFilters.rating || null,
    inStock: initialFilters.inStock || false,
    onSale: initialFilters.onSale || false
  });

  const [tempPrice, setTempPrice] = useState({ 
    min: filters.priceMin, 
    max: filters.priceMax 
  });

  // Sync mobile state
  useEffect(() => {
    setIsMobileOpen(showMobile);
  }, [showMobile]);

  // Apply filters and notify parent
  const applyFilters = () => {
    onFilterChange(filters);
    if (onCloseMobile) onCloseMobile();
  };

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Handle category checkbox
  const handleCategoryChange = (category) => {
    setFilters(prev => {
      const newCategories = prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category];
      return { ...prev, categories: newCategories };
    });
  };

  // Handle size checkbox
  const handleSizeChange = (size) => {
    setFilters(prev => {
      const newSizes = prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size];
      return { ...prev, sizes: newSizes };
    });
  };

  // Handle color checkbox
  const handleColorChange = (color) => {
    setFilters(prev => {
      const newColors = prev.colors.includes(color)
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color];
      return { ...prev, colors: newColors };
    });
  };

  // Handle brand checkbox
  const handleBrandChange = (brand) => {
    setFilters(prev => {
      const newBrands = prev.brands.includes(brand)
        ? prev.brands.filter(b => b !== brand)
        : [...prev.brands, brand];
      return { ...prev, brands: newBrands };
    });
  };

  // Handle rating filter
  const handleRatingChange = (rating) => {
    setFilters(prev => ({
      ...prev,
      rating: prev.rating === rating ? null : rating
    }));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      categories: [],
      priceMin: priceRange.min,
      priceMax: priceRange.max,
      sizes: [],
      colors: [],
      brands: [],
      rating: null,
      inStock: false,
      onSale: false
    });
    setTempPrice({ min: priceRange.min, max: priceRange.max });
  };

  // Count active filters
  const getActiveFilterCount = () => {
    let count = 0;
    count += filters.categories.length;
    count += filters.sizes.length;
    count += filters.colors.length;
    count += filters.brands.length;
    if (filters.rating) count++;
    if (filters.inStock) count++;
    if (filters.onSale) count++;
    if (filters.priceMin > priceRange.min || filters.priceMax < priceRange.max) count++;
    return count;
  };

  const FilterSection = ({ title, section, children }) => (
    <div className="filter-section">
      <button 
        className="filter-section-header"
        onClick={() => toggleSection(section)}
      >
        <span>{title}</span>
        <svg className={`filter-arrow ${expandedSections[section] ? 'expanded' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>
      {expandedSections[section] && (
        <div className="filter-section-content">
          {children}
        </div>
      )}
    </div>
  );

  const FilterContent = () => (
    <>
      {/* Categories */}
      {categories.length > 0 && (
        <FilterSection title="Categories" section="categories">
          <div className="filter-options">
            {categories.map(category => (
              <label key={category.id || category.name} className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.categories.includes(category.name || category)}
                  onChange={() => handleCategoryChange(category.name || category)}
                />
                <span className="checkmark"></span>
                <span className="filter-label">{category.name || category}</span>
                {category.count && <span className="filter-count">({category.count})</span>}
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Price Range */}
      <FilterSection title="Price Range" section="price">
        <div className="price-range">
          <div className="price-inputs">
            <div className="price-input-wrapper">
              <span>$</span>
              <input
                type="number"
                value={tempPrice.min}
                onChange={(e) => setTempPrice({ ...tempPrice, min: parseInt(e.target.value) || priceRange.min })}
                onBlur={() => setFilters(prev => ({ ...prev, priceMin: tempPrice.min }))}
                min={priceRange.min}
                max={tempPrice.max}
              />
            </div>
            <span className="price-separator">—</span>
            <div className="price-input-wrapper">
              <span>$</span>
              <input
                type="number"
                value={tempPrice.max}
                onChange={(e) => setTempPrice({ ...tempPrice, max: parseInt(e.target.value) || priceRange.max })}
                onBlur={() => setFilters(prev => ({ ...prev, priceMax: tempPrice.max }))}
                min={tempPrice.min}
                max={priceRange.max}
              />
            </div>
          </div>
          <div className="price-slider">
            <input
              type="range"
              min={priceRange.min}
              max={priceRange.max}
              value={tempPrice.min}
              onChange={(e) => setTempPrice({ ...tempPrice, min: parseInt(e.target.value) })}
              onMouseUp={() => setFilters(prev => ({ ...prev, priceMin: tempPrice.min }))}
              className="price-slider-min"
            />
            <input
              type="range"
              min={priceRange.min}
              max={priceRange.max}
              value={tempPrice.max}
              onChange={(e) => setTempPrice({ ...tempPrice, max: parseInt(e.target.value) })}
              onMouseUp={() => setFilters(prev => ({ ...prev, priceMax: tempPrice.max }))}
              className="price-slider-max"
            />
          </div>
        </div>
      </FilterSection>

      {/* Sizes */}
      {sizes.length > 0 && (
        <FilterSection title="Size" section="sizes">
          <div className="filter-sizes">
            {sizes.map(size => (
              <button
                key={size}
                className={`size-option ${filters.sizes.includes(size) ? 'active' : ''}`}
                onClick={() => handleSizeChange(size)}
              >
                {size}
              </button>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Colors */}
      {colors.length > 0 && (
        <FilterSection title="Color" section="colors">
          <div className="filter-colors">
            {colors.map(color => (
              <button
                key={color.name}
                className={`color-option ${filters.colors.includes(color.name) ? 'active' : ''}`}
                style={{ backgroundColor: color.code }}
                onClick={() => handleColorChange(color.name)}
                title={color.name}
              />
            ))}
          </div>
        </FilterSection>
      )}

      {/* Brands */}
      {brands.length > 0 && (
        <FilterSection title="Brands" section="brands">
          <div className="filter-options">
            {brands.map(brand => (
              <label key={brand.id || brand.name} className="filter-checkbox">
                <input
                  type="checkbox"
                  checked={filters.brands.includes(brand.name || brand)}
                  onChange={() => handleBrandChange(brand.name || brand)}
                />
                <span className="checkmark"></span>
                <span className="filter-label">{brand.name || brand}</span>
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Customer Rating */}
      <FilterSection title="Customer Rating" section="rating">
        <div className="filter-ratings">
          {[5, 4, 3, 2, 1].map(rating => (
            <button
              key={rating}
              className={`rating-option ${filters.rating === rating ? 'active' : ''}`}
              onClick={() => handleRatingChange(rating)}
            >
              <div className="rating-stars">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < rating ? 'star-filled' : 'star-empty'}>★</span>
                ))}
              </div>
              <span className="rating-text">& up</span>
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Status Filters */}
      <FilterSection title="Status" section="status">
        <div className="filter-options">
          <label className="filter-checkbox">
            <input
              type="checkbox"
              checked={filters.inStock}
              onChange={(e) => setFilters(prev => ({ ...prev, inStock: e.target.checked }))}
            />
            <span className="checkmark"></span>
            <span className="filter-label">In Stock Only</span>
          </label>
          <label className="filter-checkbox">
            <input
              type="checkbox"
              checked={filters.onSale}
              onChange={(e) => setFilters(prev => ({ ...prev, onSale: e.target.checked }))}
            />
            <span className="checkmark"></span>
            <span className="filter-label">On Sale</span>
          </label>
        </div>
      </FilterSection>
    </>
  );

  // Mobile Filter Drawer
  if (isMobileOpen) {
    return (
      <div className="filter-mobile-overlay" onClick={onCloseMobile}>
        <div className="filter-mobile-drawer" onClick={(e) => e.stopPropagation()}>
          <div className="filter-mobile-header">
            <h3>Filters</h3>
            <button className="filter-mobile-close" onClick={onCloseMobile}>✕</button>
          </div>
          <div className="filter-mobile-content">
            <FilterContent />
          </div>
          <div className="filter-mobile-footer">
            <button className="filter-clear-btn" onClick={clearAllFilters}>
              Clear All ({getActiveFilterCount()})
            </button>
            <button className="filter-apply-btn" onClick={applyFilters}>
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Desktop Filter Sidebar
  return (
    <div className="product-filter-premium">
      <div className="filter-header">
        <h3>Filters</h3>
        {getActiveFilterCount() > 0 && (
          <button className="filter-clear-link" onClick={clearAllFilters}>
            Clear All ({getActiveFilterCount()})
          </button>
        )}
      </div>
      <div className="filter-body">
        <FilterContent />
      </div>
      <button className="filter-apply-desktop" onClick={applyFilters}>
        Apply Filters
      </button>
    </div>
  );
};