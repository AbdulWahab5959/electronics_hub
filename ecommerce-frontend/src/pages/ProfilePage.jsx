import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/common/ToastNotification';
import { Breadcrumb } from '../components/common/Breadcrumb';
import {
  getProfile,
  updateProfile,
  changePassword,
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '../services/user';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const showToast = useToast();

  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Profile form
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
  });

  // Password form
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  // Addresses
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    title: 'Home',
    address: '',
    city: '',
    state: '',
    zip_code: '',      // ✅ matches backend column
    country: 'PK',
    is_default: false, // ✅ matches backend column
  });

  // Order stats (still mock, can be replaced later)
  const [orderStats, setOrderStats] = useState({
    total: 0,
    delivered: 0,
    pending: 0,
    totalSpent: 0,
  });

  useEffect(() => {
    loadProfile();
    loadAddresses();
    loadOrderStats();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const response = await getProfile();
      const userData = response.data.data.user;
      setProfileData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        bio: userData.bio || '',
      });
    } catch (error) {
      showToast('Failed to load profile', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAddresses = async () => {
    try {
      const response = await getAddresses();
      setAddresses(response.data.data);
    } catch (error) {
      console.error('Failed to load addresses', error);
    }
  };

  const loadOrderStats = () => {
    // TODO: replace with real API call to /orders/stats
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

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile(profileData);
      showToast('Profile updated successfully!', 'success');
      await loadProfile(); // refresh
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    if (passwordData.password !== passwordData.password_confirmation) {
      showToast('New passwords do not match', 'error');
      setIsSaving(false);
      return;
    }
    try {
      await changePassword(passwordData);
      showToast('Password changed successfully!', 'success');
      setPasswordData({
        current_password: '',
        password: '',
        password_confirmation: '',
      });
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingAddress) {
        await updateAddress(editingAddress.id, addressForm);
        showToast('Address updated', 'success');
      } else {
        await createAddress(addressForm);
        showToast('Address added', 'success');
      }
      await loadAddresses();
      setShowAddressForm(false);
      setEditingAddress(null);
      setAddressForm({
        title: 'Home',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        country: 'PK',
        is_default: false,
      });
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to save address', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (window.confirm('Delete this address?')) {
      try {
        await deleteAddress(id);
        showToast('Address deleted', 'info');
        await loadAddresses();
      } catch (error) {
        showToast('Failed to delete address', 'error');
      }
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await setDefaultAddress(id);
      showToast('Default address updated', 'success');
      await loadAddresses();
    } catch (error) {
      showToast('Failed to set default', 'error');
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setAddressForm(address);
    setShowAddressForm(true);
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <div className="profile-page">
      <div className="container">
        <Breadcrumb items={[{ name: 'Home', path: '/' }, { name: 'Profile', path: '/profile' }]} />
        <div className="profile-header">
          <h1>My Profile</h1>
          <p>Manage your account information</p>
        </div>
        <div className="profile-layout">
          <aside className="profile-sidebar">
            <div className="profile-avatar">
              <div className="avatar-circle">{profileData.name?.charAt(0)?.toUpperCase() || 'U'}</div>
              <h3>{profileData.name || 'User'}</h3>
              <p>{profileData.email}</p>
            </div>
            <nav className="profile-nav">
              <button className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
                <span className="nav-icon">👤</span> Personal Info
              </button>
              <button className={`nav-item ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
                <span className="nav-icon">🔒</span> Security
              </button>
              <button className={`nav-item ${activeTab === 'addresses' ? 'active' : ''}`} onClick={() => setActiveTab('addresses')}>
                <span className="nav-icon">📍</span> Addresses
              </button>
              <button className={`nav-item ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>
                <span className="nav-icon">📊</span> Stats
              </button>
            </nav>
            <button onClick={handleLogout} className="logout-btn">🚪 Logout</button>
          </aside>

          <main className="profile-content">
            {activeTab === 'profile' && (
              <div className="profile-card">
                <h2>Personal Information</h2>
                <form onSubmit={handleProfileUpdate} className="profile-form">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" value={profileData.name} onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" value={profileData.email} disabled />
                    <small>Email cannot be changed</small>
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input type="tel" value={profileData.phone} onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })} placeholder="+92 300 1234567" />
                  </div>
                  <div className="form-group">
                    <label>Bio (Optional)</label>
                    <textarea rows="4" value={profileData.bio} onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })} placeholder="Tell us about yourself..." />
                  </div>
                  <button type="submit" className="save-btn" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</button>
                </form>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="profile-card">
                <h2>Change Password</h2>
                <form onSubmit={handlePasswordChange} className="profile-form">
                  <div className="form-group">
                    <label>Current Password</label>
                    <input type="password" value={passwordData.current_password} onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <input type="password" value={passwordData.password} onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })} required minLength={8} />
                  </div>
                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input type="password" value={passwordData.password_confirmation} onChange={(e) => setPasswordData({ ...passwordData, password_confirmation: e.target.value })} required />
                  </div>
                  <button type="submit" className="save-btn" disabled={isSaving}>{isSaving ? 'Updating...' : 'Update Password'}</button>
                </form>
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="profile-card">
                <div className="addresses-header">
                  <h2>Saved Addresses</h2>
                  <button className="add-address-btn" onClick={() => { setEditingAddress(null); setAddressForm({ title: 'Home', address: '', city: '', state: '', zip_code: '', country: 'PK', is_default: false }); setShowAddressForm(true); }}>+ Add New Address</button>
                </div>
                {showAddressForm && (
                  <div className="address-form-card">
                    <h3>{editingAddress ? 'Edit Address' : 'New Address'}</h3>
                    <form onSubmit={handleAddressSubmit}>
                      <div className="form-row"><div className="form-group"><label>Address Title</label><select value={addressForm.title} onChange={(e) => setAddressForm({ ...addressForm, title: e.target.value })}><option>Home</option><option>Work</option><option>Other</option></select></div></div>
                      <div className="form-group"><label>Street Address</label><input type="text" value={addressForm.address} onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })} required /></div>
                      <div className="form-row"><div className="form-group"><label>City</label><input type="text" value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} required /></div><div className="form-group"><label>State/Province</label><input type="text" value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} required /></div></div>
                      <div className="form-row"><div className="form-group"><label>ZIP Code</label><input type="text" value={addressForm.zip_code} onChange={(e) => setAddressForm({ ...addressForm, zip_code: e.target.value })} required /></div><div className="form-group"><label>Country</label><select value={addressForm.country} onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}><option value="PK">Pakistan</option><option value="US">United States</option><option value="UK">United Kingdom</option><option value="CA">Canada</option><option value="AU">Australia</option></select></div></div>
                      <label className="checkbox-label"><input type="checkbox" checked={addressForm.is_default} onChange={(e) => setAddressForm({ ...addressForm, is_default: e.target.checked })} /> Set as default address</label>
                      <div className="form-actions"><button type="submit" className="save-btn" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Address'}</button><button type="button" className="cancel-btn" onClick={() => { setShowAddressForm(false); setEditingAddress(null); }}>Cancel</button></div>
                    </form>
                  </div>
                )}
                <div className="addresses-list">
                  {addresses.length === 0 ? (<div className="empty-addresses"><p>No saved addresses yet.</p><button className="add-address-btn" onClick={() => setShowAddressForm(true)}>Add Your First Address</button></div>) : (addresses.map((addr) => (<div key={addr.id} className="address-card"><div className="address-header"><h4>{addr.title}{addr.is_default && <span className="default-badge">Default</span>}</h4><div className="address-actions"><button onClick={() => handleEditAddress(addr)}>Edit</button><button onClick={() => handleDeleteAddress(addr.id)}>Delete</button>{!addr.is_default && <button onClick={() => handleSetDefault(addr.id)}>Set Default</button>}</div></div><div className="address-details"><p>{addr.address}</p><p>{addr.city}, {addr.state} {addr.zip_code}</p><p>{addr.country === 'PK' ? 'Pakistan' : addr.country}</p></div></div>)))}
                </div>
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="profile-card">
                <h2>Your Activity</h2>
                <div className="stats-grid">
                  <div className="stat-item"><div className="stat-number">{orderStats.total}</div><div className="stat-label">Total Orders</div></div>
                  <div className="stat-item"><div className="stat-number">{orderStats.delivered}</div><div className="stat-label">Delivered</div></div>
                  <div className="stat-item"><div className="stat-number">{orderStats.pending}</div><div className="stat-label">In Progress</div></div>
                  <div className="stat-item"><div className="stat-number">${orderStats.totalSpent.toFixed(2)}</div><div className="stat-label">Total Spent</div></div>
                </div>
                <div className="quick-actions"><h3>Quick Actions</h3><div className="action-links"><Link to="/orders" className="action-link"><span>📦</span> View Orders</Link><Link to="/wishlist" className="action-link"><span>❤️</span> Wishlist</Link><Link to="/shop" className="action-link"><span>🛍️</span> Continue Shopping</Link></div></div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}