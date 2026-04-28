// src/components/common/CartItem.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export const CartItem = ({ 
  id,
  name, 
  price, 
  image, 
  quantity = 1,
  maxStock = 10,
  onUpdateQuantity,
  onRemove,
  onMoveToWishlist
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [itemQuantity, setItemQuantity] = useState(quantity);

  const itemTotal = price * itemQuantity;

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1 || newQuantity > maxStock) return;
    
    setItemQuantity(newQuantity);
    setIsLoading(true);
    await onUpdateQuantity?.(id, newQuantity);
    setIsLoading(false);
  };

  const handleRemove = async () => {
    setIsLoading(true);
    await onRemove?.(id);
    setIsLoading(false);
  };

  const handleMoveToWishlist = async () => {
    setIsLoading(true);
    await onMoveToWishlist?.(id);
    setIsLoading(false);
  };

  return (
    <div className={`cart-item ${isLoading ? 'cart-item-loading' : ''}`}>
      {/* Loading Overlay */}
      {isLoading && <div className="cart-item-loader"></div>}
      
      {/* Product Image */}
      <Link to={`/product/${id}`} className="cart-item-image-link">
        <div className="cart-item-image-wrapper">
          <img src={image} alt={name} className="cart-item-image" />
        </div>
      </Link>

      {/* Product Details */}
      <div className="cart-item-details">
        <Link to={`/product/${id}`} className="cart-item-title-link">
          <h3 className="cart-item-title">{name}</h3>
        </Link>
        
        <div className="cart-item-actions">
          {/* Quantity Selector */}
          <div className="quantity-selector">
            <button 
              className="quantity-btn quantity-decrease"
              onClick={() => handleQuantityChange(itemQuantity - 1)}
              disabled={itemQuantity <= 1 || isLoading}
              aria-label="Decrease quantity"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14"/>
              </svg>
            </button>
            
            <span className="quantity-value">{itemQuantity}</span>
            
            <button 
              className="quantity-btn quantity-increase"
              onClick={() => handleQuantityChange(itemQuantity + 1)}
              disabled={itemQuantity >= maxStock || isLoading}
              aria-label="Increase quantity"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="cart-item-action-buttons">
            <button 
              className="cart-item-action move-to-wishlist"
              onClick={handleMoveToWishlist}
              disabled={isLoading}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              Move to Wishlist
            </button>
            
            <button 
              className="cart-item-action remove-item"
              onClick={handleRemove}
              disabled={isLoading}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                <path d="M10 11v5M14 11v5"/>
              </svg>
              Remove
            </button>
          </div>
        </div>
      </div>

      {/* Price & Total */}
      <div className="cart-item-price-section">
        <div className="cart-item-unit-price">
          <span className="price-label">Unit Price</span>
          <span className="price-value">${price.toFixed(2)}</span>
        </div>
        <div className="cart-item-total">
          <span className="total-label">Total</span>
          <span className="total-value">${itemTotal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};