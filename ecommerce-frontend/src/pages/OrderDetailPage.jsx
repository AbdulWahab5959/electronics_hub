// src/pages/OrderDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/common/ToastNotification';
import { Breadcrumb } from '../components/common/Breadcrumb';


export default function OrderDetailPage() {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const showToast = useToast();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trackingInfo, setTrackingInfo] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      showToast('Please login to view order details', 'warning');
      navigate('/login');
      return;
    }
    loadOrderDetails();
  }, [orderNumber, isAuthenticated]);

  const loadOrderDetails = () => {
    setLoading(true);
    // Simulate API call – replace with actual backend call
    const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    const foundOrder = savedOrders.find(o => o.order_number === orderNumber);
    
    if (foundOrder) {
      setOrder(foundOrder);
      // Simulate tracking info (would come from API)
      setTrackingInfo({
        carrier: 'FastShip Express',
        trackingNumber: 'TRK' + Math.floor(Math.random() * 1000000),
        estimatedDelivery: new Date(Date.now() + 3 * 86400000).toLocaleDateString(),
        status: foundOrder.status,
        history: [
          { date: foundOrder.created_at, status: 'Order placed', location: 'Online' },
          { date: new Date(Date.now() - 2 * 86400000).toISOString(), status: 'Processing', location: 'Warehouse' },
          ...(foundOrder.status === 'shipped' || foundOrder.status === 'delivered' ? [
            { date: new Date(Date.now() - 1 * 86400000).toISOString(), status: 'Shipped', location: 'Distribution center' }
          ] : []),
          ...(foundOrder.status === 'delivered' ? [
            { date: new Date().toISOString(), status: 'Delivered', location: 'Your address' }
          ] : [])
        ]
      });
    } else {
      showToast('Order not found', 'error');
      navigate('/orders');
    }
    setLoading(false);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'badge-pending', label: 'Pending', icon: '⏳' },
      processing: { class: 'badge-processing', label: 'Processing', icon: '🔄' },
      shipped: { class: 'badge-shipped', label: 'Shipped', icon: '🚚' },
      delivered: { class: 'badge-delivered', label: 'Delivered', icon: '✅' },
      cancelled: { class: 'badge-cancelled', label: 'Cancelled', icon: '❌' },
    };
    return badges[status] || { class: 'badge-default', label: status, icon: '📦' };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="order-detail-page">
        <div className="container">
          <div className="loading-spinner-premium">
            <div className="spinner-ring"></div>
            <p>Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const statusBadge = getStatusBadge(order.status);

  return (
    <div className="order-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { name: 'Home', path: '/' },
            { name: 'My Orders', path: '/orders' },
            { name: `Order ${order.order_number}`, path: `/orders/${order.order_number}` }
          ]}
        />

        {/* Header with back button */}
        <div className="order-detail-header">
          <Link to="/orders" className="back-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Orders
          </Link>
          <div className="order-title-section">
            <h1>Order #{order.order_number}</h1>
            <div className={`status-badge-large ${statusBadge.class}`}>
              <span className="status-icon">{statusBadge.icon}</span>
              {statusBadge.label}
            </div>
          </div>
          <p className="order-date-header">Placed on {formatDate(order.created_at)}</p>
        </div>

        {/* Main Grid */}
        <div className="order-detail-grid">
          {/* Left Column: Order Items & Summary */}
          <div className="order-detail-left">
            {/* Items List */}
            <div className="detail-card items-card">
              <h2>Order Items</h2>
              <div className="items-list-detail">
                {order.items.map((item, idx) => (
                  <div key={idx} className="detail-item">
                    <div className="item-image">
                      {item.image ? (
                        <img src={item.image} alt={item.name} />
                      ) : (
                        <div className="image-placeholder">🛍️</div>
                      )}
                    </div>
                    <div className="item-details">
                      <h3>{item.name}</h3>
                      <p className="item-sku">SKU: {item.id || 'N/A'}</p>
                      <div className="item-meta">
                        <span className="item-quantity">Qty: {item.quantity}</span>
                        <span className="item-price">${item.price.toFixed(2)} each</span>
                      </div>
                    </div>
                    <div className="item-total">
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="order-summary-detail">
                <div className="summary-line">
                  <span>Subtotal</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="summary-line">
                  <span>Shipping</span>
                  <span>{order.shipping === 0 ? 'Free' : `$${order.shipping.toFixed(2)}`}</span>
                </div>
                <div className="summary-line">
                  <span>Tax (8%)</span>
                  <span>${order.tax.toFixed(2)}</span>
                </div>
                <div className="summary-line total-line">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="detail-card payment-card">
              <h2>Payment Method</h2>
              <div className="payment-detail">
                <div className="payment-icon">
                  {order.payment_method === 'card' && '💳'}
                  {order.payment_method === 'paypal' && '📘'}
                  {order.payment_method === 'cod' && '💰'}
                </div>
                <div className="payment-info">
                  <strong>
                    {order.payment_method === 'card' && 'Credit Card'}
                    {order.payment_method === 'paypal' && 'PayPal'}
                    {order.payment_method === 'cod' && 'Cash on Delivery'}
                  </strong>
                  {order.payment_method === 'card' && <p>•••• •••• •••• 4242</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Shipping & Tracking */}
          <div className="order-detail-right">
            {/* Shipping Address */}
            <div className="detail-card address-card">
              <h2>Shipping Address</h2>
              <div className="address-detail">
                <p>
                  {order.shipping_address.fullName || order.customer.name}<br />
                  {order.shipping_address.address}<br />
                  {order.shipping_address.apartment && <>{order.shipping_address.apartment}<br /></>}
                  {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zipCode}<br />
                  {order.shipping_address.country}<br />
                  Phone: {order.shipping_address.phone || order.customer.phone}<br />
                  Email: {order.customer.email}
                </p>
              </div>
            </div>

            {/* Tracking / Timeline */}
            {trackingInfo && (
              <div className="detail-card tracking-card">
                <h2>Tracking & Timeline</h2>
                <div className="tracking-header">
                  <div className="tracking-number">
                    <span>Carrier:</span> <strong>{trackingInfo.carrier}</strong>
                  </div>
                  <div className="tracking-number">
                    <span>Tracking #:</span> <strong>{trackingInfo.trackingNumber}</strong>
                  </div>
                  <div className="estimated-delivery">
                    <span>Est. Delivery:</span> <strong>{trackingInfo.estimatedDelivery}</strong>
                  </div>
                </div>
                <div className="timeline">
                  {trackingInfo.history.map((event, idx) => (
                    <div key={idx} className="timeline-item">
                      <div className="timeline-dot"></div>
                      <div className="timeline-content">
                        <div className="timeline-status">{event.status}</div>
                        <div className="timeline-date">{formatDate(event.date)}</div>
                        {event.location && <div className="timeline-location">{event.location}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="detail-card actions-card">
              <Link to="/shop" className="action-btn shop-btn">Continue Shopping</Link>
              {order.status !== 'delivered' && order.status !== 'cancelled' && (
                <button className="action-btn support-btn">Need Help?</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}