// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../components/ui/ToastNotification';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import api from '../../services/api';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const showToast = useToast();
  
  // Active tab state
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
  });
  
  // Password form state
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });
  
  // Address state
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    title: 'Home',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'PK',
    isDefault: false,
  });
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Order stats
  const [orderStats, setOrderStats] = useState({
    total: 0,
    delivered: 0,
    pending: 0,
    totalSpent: 0,
  });

  // Load user data
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
      });
    }
    loadAddresses();
    loadOrderStats();
  }, [user]);

  const loadAddresses = () => {
    // Load from localStorage (replace with API call)
    const savedAddresses = JSON.parse(localStorage.getItem('addresses') || '[]');
    setAddresses(savedAddresses);
  };

  const loadOrderStats = () => {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const delivered = orders.filter(o => o.status === 'delivered');
    const pending = orders.filter(o => o.status === 'pending' || o.status === 'processing');
    
    setOrderStats({
      total: orders.length,
      delivered: delivered.length,
      pending: pending.length,
      totalSpent: delivered.reduce((sum, o) => sum + o.total, 0),
    });
  };

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Replace with actual API call
      // await api.put('/user/profile', profileData);
      
      // Update local user data
      const updatedUser = { ...user, ...profileData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      showToast('Profile updated successfully!', 'success');
    } catch (error) {
      showToast('Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    if (passwordData.password !== passwordData.password_confirmation) {
      showToast('New passwords do not match', 'error');
      setIsSaving(false);
      return;
    }
    
    if (passwordData.password.length < 8) {
      showToast('Password must be at least 8 characters', 'error');
      setIsSaving(false);
      return;
    }
    
    try {
      // Replace with actual API call
      // await api.post('/user/change-password', passwordData);
      
      showToast('Password changed successfully!', 'success');
      setPasswordData({
        current_password: '',
        password: '',
        password_confirmation: '',
      });
    } catch (error) {
      showToast('Failed to change password', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle add/update address
  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    let newAddresses = [...addresses];
    
    if (editingAddress) {
      // Update existing address
      const index = addresses.findIndex(a => a.id === editingAddress.id);
      newAddresses[index] = { ...addressForm, id: editingAddress.id };
    } else {
      // Add new address
      newAddresses.push({ ...addressForm, id: Date.now() });
    }
    
    // If this address is default, remove default from others
    if (addressForm.isDefault) {
      newAddresses = newAddresses.map(addr => ({
        ...addr,
        isDefault: addr.id === (editingAddress?.id || newAddresses[newAddresses.length - 1].id),
      }));
    }
    
    localStorage.setItem('addresses', JSON.stringify(newAddresses));
    setAddresses(newAddresses);
    setShowAddressForm(false);
    setEditingAddress(null);
    setAddressForm({
      title: 'Home',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'PK',
      isDefault: false,
    });
    setIsSaving(false);
    showToast('Address saved successfully!', 'success');
  };

  // Handle delete address
  const handleDeleteAddress = (addressId) => {
    const newAddresses = addresses.filter(a => a.id !== addressId);
    localStorage.setItem('addresses', JSON.stringify(newAddresses));
    setAddresses(newAddresses);
    showToast('Address deleted', 'info');
  };

  // Edit address
  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setAddressForm(address);
    setShowAddressForm(true);
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <div className="profile-page">
      <div className="container">
        {/* Breadcrumb */}
        <Breadcrumb 
          items={[
            { name: 'Home', path: '/' },
            { name: 'My Account', path: '/dashboard' },
            { name: 'Profile', path: '/profile' }
          ]}
        />

        {/* Page Header */}
        <div className="profile-header">
          <h1>My Profile</h1>
          <p>Manage your account information</p>
        </div>

        {/* Profile Layout */}
        <div className="profile-layout">
          {/* Sidebar */}
          <aside className="profile-sidebar">
            <div className="profile-avatar">
              <div className="avatar-circle">
                {profileData.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <h3>{profileData.name}</h3>
              <p>{profileData.email}</p>
            </div>
            
            <nav className="profile-nav">
              <button 
                className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <span className="nav-icon">👤</span>
                Personal Info
              </button>
              <button 
                className={`nav-item ${activeTab === 'security' ? 'active' : ''}`}
                onClick={() => setActiveTab('security')}
              >
                <span className="nav-icon">🔒</span>
                Security
              </button>
              <button 
                className={`nav-item ${activeTab === 'addresses' ? 'active' : ''}`}
                onClick={() => setActiveTab('addresses')}
              >
                <span className="nav-icon">📍</span>
                Addresses
              </button>
              <button 
                className={`nav-item ${activeTab === 'stats' ? 'active' : ''}`}
                onClick={() => setActiveTab('stats')}
              >
                <span className="nav-icon">📊</span>
                Stats
              </button>
            </nav>
            
            <button onClick={handleLogout} className="logout-btn">
              <span>🚪</span>
              Logout
            </button>
          </aside>

          {/* Main Content */}
          <main className="profile-content">
            {/* Personal Info Tab */}
            {activeTab === 'profile' && (
              <div className="profile-card">
                <h2>Personal Information</h2>
                <form onSubmit={handleProfileUpdate} className="profile-form">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      required
                      disabled
                    />
                    <small>Email cannot be changed</small>
                  </div>
                  
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      placeholder="+92 300 1234567"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Bio (Optional)</label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      rows="4"
                      placeholder="Tell us a little about yourself..."
                    />
                  </div>
                  
                  <button type="submit" className="save-btn" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="profile-card">
                <h2>Change Password</h2>
                <form onSubmit={handlePasswordChange} className="profile-form">
                  <div className="form-group">
                    <label>Current Password</label>
                    <input
                      type="password"
                      value={passwordData.current_password}
                      onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      value={passwordData.password}
                      onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                      required
                    />
                    <small>Minimum 8 characters</small>
                  </div>
                  
                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordData.password_confirmation}
                      onChange={(e) => setPasswordData({ ...passwordData, password_confirmation: e.target.value })}
                      required
                    />
                  </div>
                  
                  <button type="submit" className="save-btn" disabled={isSaving}>
                    {isSaving ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="profile-card">
                <div className="addresses-header">
                  <h2>Saved Addresses</h2>
                  <button 
                    className="add-address-btn"
                    onClick={() => {
                      setEditingAddress(null);
                      setAddressForm({
                        title: 'Home',
                        address: '',
                        city: '',
                        state: '',
                        zipCode: '',
                        country: 'PK',
                        isDefault: false,
                      });
                      setShowAddressForm(true);
                    }}
                  >
                    + Add New Address
                  </button>
                </div>

                {showAddressForm && (
                  <div className="address-form-card">
                    <h3>{editingAddress ? 'Edit Address' : 'New Address'}</h3>
                    <form onSubmit={handleAddressSubmit}>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Address Title</label>
                          <select
                            value={addressForm.title}
                            onChange={(e) => setAddressForm({ ...addressForm, title: e.target.value })}
                          >
                            <option value="Home">Home</option>
                            <option value="Work">Work</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="form-group">
                        <label>Street Address</label>
                        <input
                          type="text"
                          value={addressForm.address}
                          onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                          required
                          placeholder="House number and street name"
                        />
                      </div>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label>City</label>
                          <input
                            type="text"
                            value={addressForm.city}
                            onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>State/Province</label>
                          <input
                            type="text"
                            value={addressForm.state}
                            onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label>ZIP Code</label>
                          <input
                            type="text"
                            value={addressForm.zipCode}
                            onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Country</label>
                          <select
                            value={addressForm.country}
                            onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                          >
                            <option value="PK">Pakistan</option>
                            <option value="US">United States</option>
                            <option value="UK">United Kingdom</option>
                            <option value="CA">Canada</option>
                            <option value="AU">Australia</option>
                          </select>
                        </div>
                      </div>
                      
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={addressForm.isDefault}
                          onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                        />
                        Set as default address
                      </label>
                      
                      <div className="form-actions">
                        <button type="submit" className="save-btn" disabled={isSaving}>
                          {isSaving ? 'Saving...' : 'Save Address'}
                        </button>
                        <button 
                          type="button" 
                          className="cancel-btn"
                          onClick={() => {
                            setShowAddressForm(false);
                            setEditingAddress(null);
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="addresses-list">
                  {addresses.length === 0 ? (
                    <div className="empty-addresses">
                      <p>No saved addresses yet.</p>
                      <button 
                        className="add-address-btn"
                        onClick={() => setShowAddressForm(true)}
                      >
                        Add Your First Address
                      </button>
                    </div>
                  ) : (
                    addresses.map((address) => (
                      <div key={address.id} className="address-card">
                        <div className="address-header">
                          <h4>
                            {address.title}
                            {address.isDefault && <span className="default-badge">Default</span>}
                          </h4>
                          <div className="address-actions">
                            <button onClick={() => handleEditAddress(address)}>Edit</button>
                            <button onClick={() => handleDeleteAddress(address.id)}>Delete</button>
                          </div>
                        </div>
                        <div className="address-details">
                          <p>{address.address}</p>
                          <p>{address.city}, {address.state} {address.zipCode}</p>
                          <p>{address.country === 'PK' ? 'Pakistan' : address.country}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Stats Tab */}
            {activeTab === 'stats' && (
              <div className="profile-card">
                <h2>Your Activity</h2>
                <div className="stats-grid">
                  <div className="stat-item">
                    <div className="stat-number">{orderStats.total}</div>
                    <div className="stat-label">Total Orders</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">{orderStats.delivered}</div>
                    <div className="stat-label">Delivered</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">{orderStats.pending}</div>
                    <div className="stat-label">In Progress</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">${orderStats.totalSpent.toFixed(2)}</div>
                    <div className="stat-label">Total Spent</div>
                  </div>
                </div>
                
                <div className="quick-actions">
                  <h3>Quick Actions</h3>
                  <div className="action-links">
                    <Link to="/orders" className="action-link">
                      <span>📦</span> View Orders
                    </Link>
                    <Link to="/wishlist" className="action-link">
                      <span>❤️</span> Wishlist
                    </Link>
                    <Link to="/shop" className="action-link">
                      <span>🛍️</span> Continue Shopping
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}