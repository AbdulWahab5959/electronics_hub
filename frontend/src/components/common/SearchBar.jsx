import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlass } from '@phosphor-icons/react/dist/csr/MagnifyingGlass';
import { X } from '@phosphor-icons/react/dist/csr/X';
import { formatMoney } from '../../utils/money';

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

const normalize = (text) =>
  String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '');

function getMatchScore(product, searchValue) {
  const q = normalize(searchValue);
  if (!q) return 0;

  const name = normalize(product.name);
  const brand = normalize(product.brand || '');
  const category = normalize(product.category || '');
  const keywords = normalize(product.keywords || '');

  if (name === q) return 100;
  if (brand === q) return 95;
  if (category === q) return 90;
  if (keywords.includes(q)) return 85;

  if (name.startsWith(q)) return 80;
  if (brand.startsWith(q)) return 70;
  if (category.startsWith(q)) return 60;

  if (name.includes(q)) return 50;
  if (brand.includes(q)) return 40;
  if (category.includes(q)) return 35;
  if (keywords.includes(q)) return 30;

  if (q.length > 2) {
    const nameDist = levenshteinDistance(name.slice(0, q.length + 2), q);
    const maxLen = Math.max(name.length, q.length);
    const similarity = 1 - nameDist / maxLen;
    if (similarity > 0.6) return Math.floor(similarity * 45);
  }

  return 0;
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
  const [recent, setRecent] = useState(() => {
    const savedRecent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    return savedRecent.length ? savedRecent : recentSearches;
  });
  const [isLoading, setIsLoading] = useState(false);

  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

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

  // Filter products with debounce and loading indicator
  useEffect(() => {
    if (query.trim().length < 2) {
      return;
    }

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
    setIsLoading(value.trim().length >= 2);
    if (value.trim().length < 2) setSuggestions([]);
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

  const handleSubmit = (event) => {
    event.preventDefault();
    handleSearch();
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

  const shouldShowDropdown =
    isOpen &&
    (query.trim().length >= 2 || (query.trim().length === 0 && recent.length > 0));

  return (
    <search className="search-bar-wrapper" ref={searchRef} aria-label="Search products">
      <form className="search-bar-container" onSubmit={handleSubmit}>
        <div className="search-input-wrapper">
          <span className="search-icon">
            <MagnifyingGlass size={20} weight="regular" aria-hidden="true" />
          </span>

          <input
            ref={inputRef}
            type="search"
            className="search-input-field"
            placeholder={placeholder}
            value={query}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            aria-label="Search products"
            autoComplete="off"
          />

          {query && (
            <button
              type="button"
              className="search-clear"
              onClick={() => {
                setQuery('');
                setSuggestions([]);
                setIsLoading(false);
              }}
              aria-label="Clear search"
            >
              <X size={16} weight="regular" aria-hidden="true" />
            </button>
          )}

          <button
            type="submit"
            className="search-submit-btn"
            aria-label="Search"
          >
            <MagnifyingGlass size={18} weight="regular" aria-hidden="true" />
            <span>Search</span>
          </button>
        </div>

        {shouldShowDropdown && (
          <div className="search-dropdown" role="region" aria-label="Search suggestions">
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
                            {formatMoney(item.price)}
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
      </form>
    </search>
  );
};