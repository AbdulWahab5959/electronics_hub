// src/pages/OrdersPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { getOrders } from '../services/order'; // Import API function
import { useToast } from '../components/common/ToastNotification'; // Optional, for error feedback

export default function OrdersPage() {
  const { user, isAuthenticated } = useAuth();
  const showToast = useToast(); // If you have toast context; otherwise remove
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Status options for filter
  const statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
    }
  }, [isAuthenticated]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await getOrders();
      // ✅ response.data.data is the actual orders array
      const ordersData = Array.isArray(response.data.data) ? response.data.data : [];
      setOrders(ordersData);
    } catch (error) {
      console.error('Failed to load orders:', error);
      setOrders([]);
      if (showToast) showToast('Failed to load your orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'badge-pending', label: 'Pending' },
      processing: { class: 'badge-processing', label: 'Processing' },
      shipped: { class: 'badge-shipped', label: 'Shipped' },
      delivered: { class: 'badge-delivered', label: 'Delivered' },
      cancelled: { class: 'badge-cancelled', label: 'Cancelled' },
    };
    return badges[status] || { class: 'badge-default', label: status };
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      processing: '🔄',
      shipped: '🚚',
      delivered: '✅',
      cancelled: '❌',
    };
    return icons[status] || '📦';
  };

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(order => order.status === filter);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Calculate order item count
  const getItemCount = (items) => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  if (!isAuthenticated) {
    return (
      <div className="orders-page">
        <div className="container">
          <div className="auth-required">
            <div className="auth-icon">🔒</div>
            <h2>Please Login to View Orders</h2>
            <p>You need to be logged in to see your order history.</p>
            <Link to="/login" className="btn-primary">Login Now</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="container">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { name: 'Home', path: '/' },
            { name: 'My Account', path: '/dashboard' },
            { name: 'Orders', path: '/orders' }
          ]}
        />

        {/* Page Header */}
        <div className="orders-header">
          <div>
            <h1>My Orders</h1>
            <p>Track and manage your orders</p>
          </div>
          <Link to="/shop" className="shop-now-btn">
            Continue Shopping →
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="orders-stats">
          <div className="stat-card">
            <span className="stat-icon">📦</span>
            <div className="stat-info">
              <span className="stat-value">{orders.length}</span>
              <span className="stat-label">Total Orders</span>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">✅</span>
            <div className="stat-info">
              <span className="stat-value">
                {orders.filter(o => o.status === 'delivered').length}
              </span>
              <span className="stat-label">Delivered</span>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🚚</span>
            <div className="stat-info">
              <span className="stat-value">
                {orders.filter(o => o.status === 'shipped' || o.status === 'processing').length}
              </span>
              <span className="stat-label">In Transit</span>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="orders-filter">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              className={`filter-tab ${filter === option.value ? 'active' : ''}`}
              onClick={() => setFilter(option.value)}
            >
              {option.label}
              {option.value !== 'all' && (
                <span className="filter-count">
                  {orders.filter(o => o.status === option.value).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="orders-loading">
            <div className="loader-spinner-premium loader-lg"></div>
            <p>Loading your orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="empty-orders">
            <div className="empty-icon">📭</div>
            <h3>No orders found</h3>
            <p>
              {filter === 'all'
                ? "You haven't placed any orders yet."
                : `No ${filter} orders found.`}
            </p>
            <Link to="/shop" className="btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map((order) => {
              const statusBadge = getStatusBadge(order.status);
              const itemCount = getItemCount(order.items);

              return (
                <div key={order.order_number} className="order-card">
                  {/* Order Header */}
                  <div className="order-header">
                    <div className="order-info">
                      <div className="order-number">
                        <span className="label">Order #</span>
                        <strong>{order.order_number}</strong>
                      </div>
                      <div className="order-date">
                        <span className="label">Placed on</span>
                        <span>{formatDate(order.created_at)}</span>
                      </div>
                    </div>
                    <div className={`status-badge ${statusBadge.class}`}>
                      <span className="status-icon">{getStatusIcon(order.status)}</span>
                      {statusBadge.label}
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="order-items-preview">
                    {order.items.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="preview-item">
                        <div className="preview-image-placeholder">
                          {/* Use product image if available, fallback to icon */}
                          {item.product?.image ? (
                            <img src={item.product.image} alt={item.name} />
                          ) : (
                            <span>🛍️</span>
                          )}
                        </div>
                        <div className="preview-details">
                          <h4>{item.name}</h4>
                          <p>Qty: {item.quantity}</p>
                        </div>
                        <div className="preview-price">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="more-items">
                        +{order.items.length - 3} more items
                      </div>
                    )}
                  </div>

                  {/* Order Footer */}
                  <div className="order-footer">
                    <div className="order-page-summary">
                      <div className="summary-row">
                        <span>Items</span>
                        <strong>{itemCount}</strong>
                      </div>
                      <div className="summary-divider" />
                      <div className="summary-row">
                        <span>Order total</span>
                        <strong className="total-price">
                          ${parseFloat(order.total).toFixed(2)}  
                        </strong>
                      </div>
                    </div>

                    {/* Link uses order_number (backend route: /orders/number/{orderNumber}) */}
                    <Link to={`/orders/${order.order_number}`} className="view-order-btn">
                      <span className="btn-icon-wrap">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </span>
                      <span className="btn-label">View Details</span>
                      <span className="btn-arrow">↗</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Order Detail Modal (Optional) */}
        {selectedOrder && (
          <div className="order-modal" onClick={() => setSelectedOrder(null)}>
            <div className="order-modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setSelectedOrder(null)}>✕</button>
              <h2>Order Details</h2>
              {/* Add detailed order view here */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}