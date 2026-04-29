// src/pages/dashboard/Dashboard.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    await logout();
    window.location.href = '/login';
  };

  // Mock data - will be replaced with API calls later
  const stats = [
    { label: 'Total Orders', value: '12', icon: '📦', color: '#3b82f6' },
    { label: 'Total Spent', value: '$1,247', icon: '💰', color: '#10b981' },
    { label: 'Wishlist', value: '8', icon: '❤️', color: '#ef4444' },
    { label: 'Reviews', value: '23', icon: '⭐', color: '#f59e0b' },
  ];

  const recentOrders = [
    { id: '#ORD-001', date: '2024-01-15', total: '$299.99', status: 'Delivered' },
    { id: '#ORD-002', date: '2024-01-10', total: '$149.99', status: 'Shipped' },
    { id: '#ORD-003', date: '2024-01-05', total: '$89.99', status: 'Processing' },
  ];

  const quickLinks = [
    { name: 'My Orders', path: '/orders', icon: '📋' },
    { name: 'Wishlist', path: '/wishlist', icon: '❤️' },
    { name: 'Profile Settings', path: '/profile', icon: '⚙️' },
    { name: 'Address Book', path: '/addresses', icon: '📍' },
    { name: 'Payment Methods', path: '/payments', icon: '💳' },
    { name: 'Support Tickets', path: '/support', icon: '🎫' },
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* Welcome Section */}
        <div className="dashboard-welcome">
          <div className="welcome-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="welcome-text">
            <h1>Welcome back, {user?.name?.split(' ')[0]}!</h1>
            <p>Here's what's happening with your account today.</p>
          </div>
          <button onClick={handleLogout} className="logout-btn" disabled={isLoading}>
            {isLoading ? 'Logging out...' : '🚪 Logout'}
          </button>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          {stats.map((stat) => (
            <div key={stat.label} className="stat-card">
              <div className="stat-icon" style={{ background: `${stat.color}15` }}>
                <span>{stat.icon}</span>
              </div>
              <div className="stat-info">
                <h3>{stat.value}</h3>
                <p>{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Quick Actions</h2>
            <Link to="/shop" className="view-all">Browse Products →</Link>
          </div>
          <div className="quick-actions-grid">
            <Link to="/shop" className="action-card">
              <span>🛍️</span>
              <h4>Continue Shopping</h4>
              <p>Discover new electronics</p>
            </Link>
            <Link to="/orders" className="action-card">
              <span>📦</span>
              <h4>Track Orders</h4>
              <p>View your order status</p>
            </Link>
            <Link to="/wishlist" className="action-card">
              <span>❤️</span>
              <h4>Wishlist</h4>
              <p>Items you saved</p>
            </Link>
            <Link to="/support" className="action-card">
              <span>🎧</span>
              <h4>Get Support</h4>
              <p>24/7 customer service</p>
            </Link>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Orders</h2>
            <Link to="/orders" className="view-all">View All →</Link>
          </div>
          <div className="orders-table">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="order-id">{order.id}</td>
                    <td>{order.date}</td>
                    <td>{order.total}</td>
                    <td>
                      <span className={`status-badge status-${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <Link to={`/orders/${order.id}`} className="order-link">
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Links */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Quick Links</h2>
          </div>
          <div className="quick-links-grid">
            {quickLinks.map((link) => (
              <Link key={link.name} to={link.path} className="quick-link">
                <span className="link-icon">{link.icon}</span>
                <span>{link.name}</span>
                <span className="link-arrow">→</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Profile Info */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Profile Information</h2>
            <Link to="/profile" className="view-all">Edit →</Link>
          </div>
          <div className="profile-info">
            <div className="info-row">
              <span className="info-label">Full Name</span>
              <span className="info-value">{user?.name}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Email Address</span>
              <span className="info-value">{user?.email}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Member Since</span>
              <span className="info-value">{new Date(user?.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}