// src/pages/OrderSuccessPage.jsx
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';

export default function OrderSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [order, setOrder] = useState(null);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Get order from location state or localStorage
    if (location.state?.order) {
      setOrder(location.state.order);
      clearCart();
      // Save to localStorage for history
      const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      existingOrders.unshift(location.state.order);
      localStorage.setItem('orders', JSON.stringify(existingOrders));
      localStorage.setItem('lastOrder', JSON.stringify(location.state.order));
    } else {
      const lastOrder = localStorage.getItem('lastOrder');
      if (lastOrder) {
        setOrder(JSON.parse(lastOrder));
      } else {
        navigate('/shop');
      }
    }
  }, []);

  // Auto redirect countdown
  useEffect(() => {
    if (!order) return;
    
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/orders');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [order, navigate]);

  if (!order) {
    return (
      <div className="order-success-page">
        <div className="container">
          <div className="success-loading">
            <div className="loader-spinner-premium loader-lg"></div>
            <p>Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-success-page">
      <div className="container">
        <div className="success-card">
          {/* Success Animation */}
          <div className="success-animation">
            <div className="success-circle">
              <div className="success-checkmark">✓</div>
            </div>
          </div>

          <h1>Order Confirmed! 🎉</h1>
          <p className="success-message">
            Thank you for your purchase. Your order has been received and is being processed.
          </p>

          {/* Order Details */}
          <div className="order-summary-card">
            <div className="order-summary-header">
              <h3>Order Summary</h3>
              <span className="order-status processing">Processing</span>
            </div>
            
            <div className="order-info-grid">
              <div className="order-info-item">
                <span className="info-label">Order Number</span>
                <strong className="info-value">{order.order_number}</strong>
              </div>
              <div className="order-info-item">
                <span className="info-label">Date</span>
                <strong className="info-value">
                  {new Date(order.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </strong>
              </div>
              <div className="order-info-item">
                <span className="info-label">Payment Method</span>
                <strong className="info-value">
                  {order.payment_method === 'card' ? 'Credit Card' : 
                   order.payment_method === 'paypal' ? 'PayPal' : 'Cash on Delivery'}
                </strong>
              </div>
              <div className="order-info-item">
                <span className="info-label">Total Amount</span>
                <strong className="info-value total-amount">${order.total.toFixed(2)}</strong>
              </div>
            </div>
          </div>

          {/* Items Summary */}
          <div className="items-summary">
            <h3>Items Ordered</h3>
            <div className="items-list">
              {order.items.map((item, index) => (
                <div key={index} className="summary-item">
                  <div className="item-image-placeholder">
                    <span>🛍️</span>
                  </div>
                  <div className="item-details">
                    <h4>{item.name}</h4>
                    <p>Quantity: {item.quantity}</p>
                  </div>
                  <div className="item-price">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          {order.shipping_address && (
            <div className="shipping-summary">
              <h3>Shipping Address</h3>
              <div className="address-details">
                <p>
                  {order.shipping_address.firstName} {order.shipping_address.lastName}<br />
                  {order.shipping_address.address}<br />
                  {order.shipping_address.apartment && <>{order.shipping_address.apartment}<br /></>}
                  {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zipCode}<br />
                  {order.shipping_address.country}<br />
                  Phone: {order.shipping_address.phone}<br />
                  Email: {order.shipping_address.email}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="success-actions">
            <Link to="/orders" className="btn-primary">
              View My Orders
            </Link>
            <Link to="/shop" className="btn-secondary">
              Continue Shopping
            </Link>
          </div>

          {/* Auto Redirect Note */}
          <p className="redirect-note">
            Redirecting to orders page in {countdown} seconds...
          </p>
        </div>
      </div>
    </div>
  );
}