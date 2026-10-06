// src/pages/dashboard/Dashboard.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const firstName = user?.name?.split(' ')[0] || 'User';

  const greeting =
    new Date().getHours() < 12
      ? 'Good Morning'
      : new Date().getHours() < 18
      ? 'Good Afternoon'
      : 'Good Evening';

  const handleLogout = async () => {
    setIsLoading(true);
    await logout();
    window.location.href = '/login';
  };

  const stats = [
    { label: 'Total Orders', value: '12', icon: '📦', color: '#3b82f6', trend: '+12%' },
    { label: 'Total Spent', value: '$1,247', icon: '💰', color: '#10b981', trend: '+8%' },
    { label: 'Wishlist Items', value: '8', icon: '❤️', color: '#ef4444', trend: '+3' },
    { label: 'Reviews Given', value: '23', icon: '⭐', color: '#f59e0b', trend: '+5%' },
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

  const actions = [
    {
      title: 'Continue Shopping',
      desc: 'Discover new electronics',
      icon: '🛍️',
      path: '/shop',
    },
    {
      title: 'Track Orders',
      desc: 'View delivery status',
      icon: '📦',
      path: '/orders',
    },
    {
      title: 'Saved Wishlist',
      desc: 'View saved items',
      icon: '❤️',
      path: '/wishlist',
    },
    {
      title: 'Customer Support',
      desc: 'Get quick help',
      icon: '🎧',
      path: '/support',
    },
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <section className="dashboard-welcome">
          <div className="welcome-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>

          <div className="welcome-text">
            <h1>
              {greeting}, {firstName} 👋
            </h1>
            <p>Manage your orders, profile, wishlist, and account activity from one place.</p>
          </div>

          <button onClick={handleLogout} className="logout-btn" disabled={isLoading}>
            {isLoading ? 'Logging out...' : 'Logout'}
          </button>
        </section>

        <section className="stats-grid">
          {stats.map((stat) => (
            <div key={stat.label} className="stat-card">
              <div className="stat-icon" style={{ background: `${stat.color}15` }}>
                <span>{stat.icon}</span>
              </div>

              <div className="stat-info">
                <h3>{stat.value}</h3>
                <p>{stat.label}</p>
                <small>{stat.trend} this month</small>
              </div>
            </div>
          ))}
        </section>

        <section className="dashboard-section">
          <div className="section-header">
            <h2>Quick Actions</h2>
            <Link to="/shop" className="view-all">
              Browse Products Details
            </Link>
          </div>

          <div className="quick-actions-grid">
            {actions.map((action) => (
              <Link key={action.title} to={action.path} className="action-card">
                <span>{action.icon}</span>
                <h4>{action.title}</h4>
                <p>{action.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="dashboard-section">
          <div className="section-header">
            <h2>Recent Orders</h2>
            <Link to="/orders" className="view-all">
              View All Details
            </Link>
          </div>

          <div className="orders-table">
            {recentOrders.length === 0 ? (
              <div className="empty-state">
                <h3>No orders yet</h3>
                <p>Your recent orders will appear here once you start shopping.</p>
                <Link to="/shop">Start Shopping</Link>
              </div>
            ) : (
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
                        <button 
                          onClick={() => window.location.href = `/orders/${order.id.replace('#', '')}`}
                          className="order-link"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <section className="dashboard-section">
          <div className="section-header">
            <h2>Quick Links</h2>
          </div>

          <div className="quick-links-grid">
            {quickLinks.map((link) => (
              <Link key={link.name} to={link.path} className="quick-link">
                <span className="link-icon">{link.icon}</span>
                <span>{link.name}</span>
                <span className="link-arrow">Details</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="dashboard-section">
          <div className="section-header">
            <h2>Profile Information</h2>
            <Link to="/profile" className="view-all">
              Edit Details
            </Link>
          </div>

          <div className="profile-info">
            <div className="info-row">
              <span className="info-label">Full Name</span>
              <span className="info-value">{user?.name || 'Not available'}</span>
            </div>

            <div className="info-row">
              <span className="info-label">Email Address</span>
              <span className="info-value">{user?.email || 'Not available'}</span>
            </div>

            <div className="info-row">
              <span className="info-label">Member Since</span>
              <span className="info-value">
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString()
                  : 'Not available'}
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}