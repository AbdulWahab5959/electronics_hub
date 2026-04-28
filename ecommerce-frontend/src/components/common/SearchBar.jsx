// src/components/common/SearchBar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const SearchBar = ({ 
  onSearch, 
  placeholder = "Search products...",
  recentSearches = [],
  popularSearches = ["Headphones", "Laptop", "Shoes", "T-shirt", "Watch"]
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recent, setRecent] = useState(recentSearches);
  
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

  // Fetch suggestions
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsLoading(true);
      // Simulate API call - replace with actual API
      const mockSuggestions = [
        { id: 1, name: `${query} Wireless Headphones`, price: 79.99, image: '/api/placeholder/40/40' },
        { id: 2, name: `${query} Laptop Pro`, price: 999.99, image: '/api/placeholder/40/40' },
        { id: 3, name: `${query} Smart Watch`, price: 199.99, image: '/api/placeholder/40/40' },
      ].filter(item => item.name.toLowerCase().includes(query.toLowerCase()));
      
      setSuggestions(mockSuggestions);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(true);
    onSearch?.(value);
  };

  const handleSearch = () => {
    if (query.trim()) {
      // Save to recent searches
      const updatedRecent = [query, ...recent.filter(r => r !== query)].slice(0, 5);
      setRecent(updatedRecent);
      localStorage.setItem('recentSearches', JSON.stringify(updatedRecent));
      
      setIsOpen(false);
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.name);
    handleSearch();
  };

  const handleRecentClick = (term) => {
    setQuery(term);
    handleSearch();
  };

  const clearRecent = () => {
    setRecent([]);
    localStorage.removeItem('recentSearches');
  };

  return (
    <div className="search-bar-wrapper" ref={searchRef}>
      <div className="search-bar-container">
        {/* Search Input */}
        <div className="search-input-wrapper">
          <span className="search-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
          </span>
          
          <input
            ref={inputRef}
            type="text"
            className="search-input-field"
            placeholder={placeholder}
            value={query}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            onFocus={() => setIsOpen(true)}
          />
          
          {query && (
            <button className="search-clear" onClick={() => setQuery('')}>
              ✕
            </button>
          )}
          
          <button className="search-submit-btn" onClick={handleSearch}>
            Search
          </button>
        </div>

        {/* Dropdown Results */}
        {isOpen && (
          <div className="search-dropdown">
            {isLoading ? (
              <div className="search-loading">
                <div className="loading-spinner"></div>
                Loading...
              </div>
            ) : suggestions.length > 0 ? (
              <>
                <div className="search-suggestions">
                  <div className="dropdown-header">
                    <span>Suggestions</span>
                  </div>
                  {suggestions.map((item) => (
                    <div 
                      key={item.id} 
                      className="suggestion-item"
                      onClick={() => handleSuggestionClick(item)}
                    >
                      <img src={item.image} alt={item.name} />
                      <div className="suggestion-info">
                        <div className="suggestion-name">{item.name}</div>
                        <div className="suggestion-price">${item.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="search-footer">
                  <button onClick={handleSearch}>
                    See all results for "{query}"
                  </button>
                </div>
              </>
            ) : query.length >= 2 ? (
              <div className="no-results">
                <span>🔍</span>
                <p>No products found for "{query}"</p>
                <button onClick={handleSearch}>Search all products</button>
              </div>
            ) : (
              <div className="search-popular">
                {recent.length > 0 && (
                  <div className="popular-section">
                    <div className="dropdown-header">
                      <span>Recent Searches</span>
                      <button className="clear-recent" onClick={clearRecent}>
                        Clear all
                      </button>
                    </div>
                    <div className="recent-tags">
                      {recent.map((term, index) => (
                        <button 
                          key={index} 
                          className="recent-tag"
                          onClick={() => handleRecentClick(term)}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                          </svg>
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="popular-section">
                  <div className="dropdown-header">
                    <span>Popular Searches</span>
                  </div>
                  <div className="popular-tags">
                    {popularSearches.map((term, index) => (
                      <button 
                        key={index} 
                        className="popular-tag"
                        onClick={() => handleRecentClick(term)}
                      >
                        🔥 {term}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};