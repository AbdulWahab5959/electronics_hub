// src/components/common/OrderSummary.jsx
import React, { useState } from 'react';

export const OrderSummary = ({ 
  subtotal = 0,
  discount = 0,
  shipping = 0,
  tax = 0,
  items = [],
  onApplyCoupon,
  onCheckout,
  isLoading = false
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);

  // Calculate totals
  const discountAmount = (subtotal * discount) / 100;
  const taxAmount = (subtotal - discountAmount) * (tax / 100);
  const total = subtotal - discountAmount + shipping + taxAmount;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }
    
    setCouponError('');
    const result = await onApplyCoupon?.(couponCode);
    
    if (result?.success) {
      setCouponApplied(true);
    } else {
      setCouponError(result?.error || 'Invalid coupon code');
    }
  };

  return (
    <div className="order-summary">
      <h3 className="order-summary-title">Order Summary</h3>
      
      {/* Items List */}
      {items.length > 0 && (
        <div className="order-items-preview">
          {items.slice(0, 3).map((item, index) => (
            <div key={index} className="order-preview-item">
              <div className="preview-item-info">
                <span className="preview-item-quantity">{item.quantity}×</span>
                <span className="preview-item-name">{item.name}</span>
              </div>
              <span className="preview-item-price">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
          {items.length > 5 && (
            <div className="order-more-items">
              +{items.length - 5} more items
            </div>
          )}
        </div>
      )}

      {/* Coupon Section */}
      <div className="coupon-section">
        <div className="coupon-input-wrapper">
          <input
            type="text"
            className={`coupon-input ${couponError ? 'coupon-input-error' : ''}`}
            placeholder="Enter coupon code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            disabled={couponApplied}
          />
          <button 
            className="coupon-apply-btn"
            onClick={handleApplyCoupon}
            disabled={couponApplied || isLoading}
          >
            {couponApplied ? 'Applied ✓' : 'Apply'}
          </button>
        </div>
        {couponError && <div className="coupon-error">{couponError}</div>}
        {couponApplied && (
          <div className="coupon-success">
            ✓ Coupon applied successfully!
          </div>
        )}
      </div>

      {/* Price Breakdown */}
      <div className="price-breakdown">
        <div className="breakdown-row">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        
        {discount > 0 && (
          <div className="breakdown-row discount-row">
            <span>Discount ({discount}% off)</span>
            <span className="discount-amount">-${discountAmount.toFixed(2)}</span>
          </div>
        )}
        
        <div className="breakdown-row">
          <span>Shipping</span>
          {shipping === 0 ? (
            <span className="free-shipping">Free</span>
          ) : (
            <span>${shipping.toFixed(2)}</span>
          )}
        </div>
        
        <div className="breakdown-row">
          <span>Tax ({tax}%)</span>
          <span>${taxAmount.toFixed(2)}</span>
        </div>
        
        <div className="breakdown-divider"></div>
        
        <div className="breakdown-row total-row">
          <span>Total</span>
          <span className="total-amount">${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Shipping Info */}
      <div className="shipping-info">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M1 3h15v13H1z"/>
          <path d="M16 8h4l3 3v5h-7V8z"/>
          <circle cx="5.5" cy="18.5" r="2.5"/>
          <circle cx="18.5" cy="18.5" r="2.5"/>
        </svg>
        <div>
          <strong>Free Shipping</strong>
          <span>On orders over $100</span>
        </div>
      </div>

      {/* Checkout Button */}
      <button 
        className="checkout-btn"
        onClick={onCheckout}
        disabled={isLoading || items.length === 0}
      >
        {isLoading ? (
          <span className="checkout-loading">
            <span className="spinner-small"></span>
            Processing...
          </span>
        ) : (
          <>
            Proceed to Checkout
          </>
        )}
      </button>

      {/* Trust Badges */}
      <div className="trust-badges">
        <div className="trust-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <span>Secure Checkout</span>
        </div>
        <div className="trust-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
          <span>30-Day Returns</span>
        </div>
      </div>
    </div>
  );
};