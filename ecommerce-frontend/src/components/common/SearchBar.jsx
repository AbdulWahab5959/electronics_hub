import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// Simple Levenshtein distance for spelling‑tolerant matching
function levenshteinDistance(a, b) {
  const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + cost
      );
    }
  }
  return matrix[b.length][a.length];
}

export const SearchBar = ({
  onSearch,
  products = [],
  placeholder = 'Search products...',
  recentSearches = [],
  onCloseOverlay, // <-- NEW PROP
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [recent, setRecent] = useState(recentSearches);
  const [isLoading, setIsLoading] = useState(false);

  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Load recent searches from localStorage on mount
  useEffect(() => {
    const savedRecent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    setRecent(savedRecent);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Normalize text for consistent comparison
  const normalize = (text) =>
    String(text || '')
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, ''); // remove punctuation

  // Enhanced matching: exact, startsWith, includes, fuzzy (Levenshtein)
  const getMatchScore = (product, searchValue) => {
    const q = normalize(searchValue);
    if (!q) return 0;

    const name = normalize(product.name);
    const brand = normalize(product.brand || '');
    const category = normalize(product.category || '');
    const keywords = normalize(product.keywords || '');

    // Exact match (highest priority)
    if (name === q) return 100;
    if (brand === q) return 95;
    if (category === q) return 90;
    if (keywords.includes(q)) return 85;

    // Starts with
    if (name.startsWith(q)) return 80;
    if (brand.startsWith(q)) return 70;
    if (category.startsWith(q)) return 60;

    // Contains
    if (name.includes(q)) return 50;
    if (brand.includes(q)) return 40;
    if (category.includes(q)) return 35;
    if (keywords.includes(q)) return 30;

    // Fuzzy (spelling tolerant) – only for longer queries
    if (q.length > 2) {
      const nameDist = levenshteinDistance(name.slice(0, q.length + 2), q);
      const maxLen = Math.max(name.length, q.length);
      const similarity = 1 - nameDist / maxLen;
      if (similarity > 0.6) return Math.floor(similarity * 45);
    }

    return 0;
  };

  // Filter products with debounce and loading indicator
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(() => {
      const matchedProducts = products
        .map((product) => ({
          ...product,
          matchScore: getMatchScore(product, query),
        }))
        .filter((product) => product.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 6); // show up to 6 suggestions

      setSuggestions(matchedProducts);
      setIsLoading(false);
    }, 200); // debounce

    return () => {
      clearTimeout(timer);
      setIsLoading(false);
    };
  }, [query, products]);

  const saveRecentSearch = (term) => {
    const cleanTerm = term.trim();
    if (!cleanTerm) return;

    const updatedRecent = [
      cleanTerm,
      ...recent.filter((item) => item.toLowerCase() !== cleanTerm.toLowerCase()),
    ].slice(0, 5);

    setRecent(updatedRecent);
    localStorage.setItem('recentSearches', JSON.stringify(updatedRecent));
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(true);
    onSearch?.(value);
  };

  const handleSearch = (searchValue = query) => {
    const cleanValue = searchValue.trim();
    if (!cleanValue) return;

    saveRecentSearch(cleanValue);
    setIsOpen(false);

    // Close the parent overlay (if provided)
    onCloseOverlay?.();

    navigate(`/search?q=${encodeURIComponent(cleanValue)}`);
  };

  const handleSuggestionClick = (product) => {
    saveRecentSearch(product.name);
    setQuery(product.name);
    setIsOpen(false);
    navigate(`/product/${product.id}`);
  };

  const handleRecentClick = (term) => {
    setQuery(term);
    handleSearch(term);
  };

  const clearRecent = () => {
    setRecent([]);
    localStorage.removeItem('recentSearches');
  };

  return (
    <div className="search-bar-wrapper" ref={searchRef}>
      <div className="search-bar-container">
        <div className="search-input-wrapper">
          <span className="search-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </span>

          <input
            ref={inputRef}
            type="text"
            className="search-input-field"
            placeholder={placeholder}
            value={query}
            onChange={handleInputChange}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            onFocus={() => setIsOpen(true)}
          />

          {query && (
            <button
              type="button"
              className="search-clear"
              onClick={() => {
                setQuery('');
                setSuggestions([]);
              }}
              aria-label="Clear"
            >
              ✕
            </button>
          )}

          <button
            type="button"
            className="search-submit-btn"
            onClick={() => handleSearch()}
          >
            Search
          </button>
        </div>

        {isOpen && (
          <div className="search-dropdown">
            {query.trim().length >= 2 ? (
              isLoading ? (
                <div className="search-loading">
                  <div className="loading-spinner"></div>
                  <span>Searching products...</span>
                </div>
              ) : suggestions.length > 0 ? (
                <>
                  <div className="search-suggestions">
                    <div className="dropdown-header">
                      <span>Matching Products</span>
                    </div>

                    {suggestions.map((item) => (
                      <button
                        type="button"
                        key={item.id}
                        className="suggestion-item"
                        onClick={() => handleSuggestionClick(item)}
                      >
                        <img src={item.image} alt={item.name} />
                        <div className="suggestion-info">
                          <div className="suggestion-name">{item.name}</div>
                          <div className="suggestion-meta">
                            {item.brand && <span className="suggestion-brand">{item.brand}</span>}
                            {item.category && <span className="suggestion-category">{item.category}</span>}
                          </div>
                          <div className="suggestion-price">
                            ${Number(item.price || 0).toFixed(2)}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="search-footer">
                    <button type="button" onClick={() => handleSearch()}>
                      See all results for "{query}"
                    </button>
                  </div>
                </>
              ) : (
                <div className="no-results">
                  <span>🔍</span>
                  <p>No matching products found for "{query}"</p>
                  <button type="button" onClick={() => handleSearch()}>
                    Search anyway
                  </button>
                </div>
              )
            ) : (
              <div className="search-popular">
                {recent.length > 0 && (
                  <div className="popular-section">
                    <div className="dropdown-header">
                      <span>Recent Searches</span>
                      <button type="button" className="clear-recent" onClick={clearRecent}>
                        Clear all
                      </button>
                    </div>
                    <div className="recent-tags">
                      {recent.map((term, index) => (
                        <button
                          type="button"
                          key={index}
                          className="recent-tag"
                          onClick={() => handleRecentClick(term)}
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="no-results small">
                  <p>Start typing to search products.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};