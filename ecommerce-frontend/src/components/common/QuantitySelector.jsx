// src/components/common/QuantitySelector.jsx
import React, { useState, useEffect } from 'react';

export const QuantitySelector = ({ 
  initialQuantity = 1,
  min = 1,
  max = 99,
  size = 'md',
  showLabel = false,
  labelText = 'Quantity',
  onChange,
  onError,
  disabled = false,
  stockAvailable = null
}) => {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [error, setError] = useState('');

  // Sync with external initialQuantity changes
  useEffect(() => {
    setQuantity(initialQuantity);
  }, [initialQuantity]);

  const validateQuantity = (value) => {
    if (value < min) {
      setError(`Minimum quantity is ${min}`);
      onError?.(`Minimum quantity is ${min}`);
      return false;
    }
    if (value > max) {
      setError(`Maximum quantity is ${max}`);
      onError?.(`Maximum quantity is ${max}`);
      return false;
    }
    if (stockAvailable !== null && value > stockAvailable) {
      setError(`Only ${stockAvailable} items in stock`);
      onError?.(`Only ${stockAvailable} items in stock`);
      return false;
    }
    setError('');
    return true;
  };

  const updateQuantity = (newQuantity) => {
    if (disabled) return;
    
    const parsed = Math.min(max, Math.max(min, newQuantity));
    
    if (validateQuantity(parsed)) {
      setQuantity(parsed);
      onChange?.(parsed);
    }
  };

  const handleDecrease = () => {
    updateQuantity(quantity - 1);
  };

  const handleIncrease = () => {
    updateQuantity(quantity + 1);
  };

  const handleInputChange = (e) => {
    let value = parseInt(e.target.value);
    if (isNaN(value)) value = min;
    updateQuantity(value);
  };

  const handleBlur = () => {
    if (quantity < min) updateQuantity(min);
    if (quantity > max) updateQuantity(max);
    if (stockAvailable !== null && quantity > stockAvailable) updateQuantity(stockAvailable);
  };

  const sizeClasses = {
    sm: 'qs-sm',
    md: 'qs-md',
    lg: 'qs-lg'
  };

  const isDecreaseDisabled = disabled || quantity <= min;
  const isIncreaseDisabled = disabled || quantity >= max || (stockAvailable !== null && quantity >= stockAvailable);

  return (
    <div className={`quantity-selector-premium ${sizeClasses[size]} ${disabled ? 'disabled' : ''}`}>
      {showLabel && (
        <label className="qs-label">{labelText}</label>
      )}
      
      <div className="qs-controls">
        <button
          className={`qs-btn qs-decrease ${isDecreaseDisabled ? 'disabled' : ''}`}
          onClick={handleDecrease}
          disabled={isDecreaseDisabled}
          type="button"
          aria-label="Decrease quantity"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M5 12h14"/>
          </svg>
        </button>
        
        <div className="qs-input-wrapper">
          <input
            type="text"
            className={`qs-input ${error ? 'error' : ''}`}
            value={quantity}
            onChange={handleInputChange}
            onBlur={handleBlur}
            disabled={disabled}
            aria-label="Quantity"
            inputMode="numeric"
          />
          {error && <span className="qs-error-tooltip">{error}</span>}
        </div>
        
        <button
          className={`qs-btn qs-increase ${isIncreaseDisabled ? 'disabled' : ''}`}
          onClick={handleIncrease}
          disabled={isIncreaseDisabled}
          type="button"
          aria-label="Increase quantity"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </button>
      </div>
      
      {stockAvailable !== null && !error && (
        <div className="qs-stock-info">
          <span className={`stock-badge ${stockAvailable <= 5 ? 'low' : stockAvailable <= 20 ? 'limited' : 'available'}`}>
            {stockAvailable <= 5 ? `Only ${stockAvailable} left!` : stockAvailable <= 20 ? `${stockAvailable} in stock` : 'In stock'}
          </span>
        </div>
      )}
      
      {error && !disabled && (
        <div className="qs-error-message">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <circle cx="12" cy="16" r="0.5" fill="currentColor" stroke="none"/>
          </svg>
          {error}
        </div>
      )}
    </div>
  );
};