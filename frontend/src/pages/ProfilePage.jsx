import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/common/ToastNotification';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { MapPin } from '@phosphor-icons/react/dist/csr/MapPin';
import { PencilSimple } from '@phosphor-icons/react/dist/csr/PencilSimple';
import { Plus } from '@phosphor-icons/react/dist/csr/Plus';
import { ShieldCheck } from '@phosphor-icons/react/dist/csr/ShieldCheck';
import { Trash } from '@phosphor-icons/react/dist/csr/Trash';
import { UserCircle } from '@phosphor-icons/react/dist/csr/UserCircle';
import { getProfile, updateProfile, changePassword, getAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress, uploadAvatar } from '../services/user';

const emptyAddress = { title: 'Home', address: '', city: '', state: '', zip_code: '', country: 'PK', is_default: false };
const addressValues = (value = {}) => ({ title: value.title || 'Home', address: value.address || '', city: value.city || '', state: value.state || '', zip_code: value.zip_code || '', country: value.country || 'PK', is_default: Boolean(value.is_default) });

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const showToast = useToast();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', bio: '' });
  const [stats, setStats] = useState({ orders_count: 0, wishlist_count: 0 });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [password, setPassword] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [addresses, setAddresses] = useState([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressForm, setAddressForm] = useState(emptyAddress);
  const [editingAddress, setEditingAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);

  const loadProfile = async () => {
    const response = await getProfile();
    const data = response.data?.data || {};
    const nextUser = data.user || {};
    setProfile({ name: nextUser.name || '', email: nextUser.email || '', phone: nextUser.phone || '', bio: nextUser.bio || '' });
    setStats(data.stats || {});
    setAvatarPreview(nextUser.avatar_url || null);
  };
  const loadAddresses = async () => {
    setAddressLoading(true);
    try { const response = await getAddresses(); setAddresses(response.data?.data || []); }
    finally { setAddressLoading(false); }
  };
  useEffect(() => {
    let mounted = true;
    (async () => { setLoading(true); try { await Promise.all([loadProfile(), loadAddresses()]); } catch (requestError) { if (mounted) setError(requestError.response?.data?.message || 'We could not load your profile.'); } finally { if (mounted) setLoading(false); } })();
    return () => { mounted = false; };
  }, []);

  const submitProfile = async (event) => {
    event.preventDefault(); setSaving(true);
    try {
      if (avatar) { const formData = new FormData(); formData.append('avatar', avatar); const response = await uploadAvatar(formData); setAvatarPreview(response.data?.avatar_url || response.data?.data?.avatar_url || URL.createObjectURL(avatar)); setAvatar(null); }
      const response = await updateProfile({ name: profile.name, phone: profile.phone, bio: profile.bio });
      const nextUser = response.data?.data?.user || response.data?.data || {};
      setProfile((current) => ({ ...current, name: nextUser.name || current.name, phone: nextUser.phone || '', bio: nextUser.bio || '' }));
      showToast('Profile saved successfully.', 'success');
    } catch (requestError) { showToast(requestError.response?.data?.message || 'Unable to save your profile.', 'error'); }
    finally { setSaving(false); }
  };
  const submitPassword = async (event) => {
    event.preventDefault();
    if (password.password !== password.password_confirmation) { showToast('New passwords do not match.', 'error'); return; }
    setSaving(true);
    try { await changePassword(password); setPassword({ current_password: '', password: '', password_confirmation: '' }); showToast('Password updated successfully.', 'success'); }
    catch (requestError) { showToast(requestError.response?.data?.message || 'Unable to update your password.', 'error'); }
    finally { setSaving(false); }
  };
  const submitAddress = async (event) => {
    event.preventDefault(); setSaving(true);
    try { const payload = addressValues(addressForm); if (editingAddress) await updateAddress(editingAddress.id, payload); else await createAddress(payload); await loadAddresses(); setAddressForm(emptyAddress); setEditingAddress(null); setShowAddressForm(false); showToast(editingAddress ? 'Address updated.' : 'Address added.', 'success'); }
    catch (requestError) { showToast(requestError.response?.data?.message || 'Unable to save this address.', 'error'); }
    finally { setSaving(false); }
  };
  const removeAddress = async (address) => {
    if (!window.confirm(`Remove ${address.title || 'this address'}?`)) return;
    try { await deleteAddress(address.id); await loadAddresses(); showToast('Address removed.', 'success'); }
    catch (requestError) { showToast(requestError.response?.data?.message || 'Unable to remove this address.', 'error'); }
  };
  const makeDefault = async (address) => {
    try { await setDefaultAddress(address.id); await loadAddresses(); showToast('Default address updated.', 'success'); }
    catch (requestError) { showToast(requestError.response?.data?.message || 'Unable to update the default address.', 'error'); }
  };
  const tabs = [{ id: 'profile', label: 'Personal information', icon: UserCircle }, { id: 'security', label: 'Security', icon: ShieldCheck }, { id: 'addresses', label: 'Saved addresses', icon: MapPin }];
  const avatarLetter = (profile.name || user?.name || 'U').charAt(0).toUpperCase();

  return <div className="account-profile-page">
    <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Profile' }]} />
    <div className="account-profile-shell">
      <header className="profile-page-heading"><div><p className="account-eyebrow">ACCOUNT SETTINGS</p><h1>Profile</h1><p>Manage your details, password, and delivery addresses in one place.</p></div><button type="button" className="account-button account-secondary profile-logout" onClick={logout}>Sign out</button></header>
      {error && <div className="profile-alert" role="alert">{error}<button type="button" className="account-text-button" onClick={() => window.location.reload()}>Try again</button></div>}
      {loading ? <div className="profile-loading" role="status">Loading your profile…</div> : <div className="profile-layout">
        <aside className="profile-rail"><div className="profile-identity"><div className="profile-avatar">{avatarPreview ? <img src={avatarPreview} alt="" /> : avatarLetter}</div><div><strong>{profile.name || user?.name || 'Your profile'}</strong><span>{profile.email || user?.email || ''}</span></div></div><nav className="profile-tabs" aria-label="Profile sections" role="tablist">{tabs.map(({ id, label, icon: Icon }) => <button key={id} type="button" role="tab" aria-selected={activeTab === id} className={activeTab === id ? 'is-active' : ''} onClick={() => setActiveTab(id)}><Icon size={19} aria-hidden="true" />{label}</button>)}</nav><div className="profile-rail-note"><span>Account summary</span><strong>{stats.orders_count || 0} orders</strong><small>{stats.wishlist_count || 0} wishlist items</small></div></aside>
        <main className="profile-content">
          {activeTab === 'profile' && <section aria-labelledby="profile-details-title"><div className="profile-section-heading"><div><p className="account-eyebrow">YOUR DETAILS</p><h2 id="profile-details-title">Personal information</h2><p>Keep your contact details current for order updates.</p></div></div><form className="profile-form" onSubmit={submitProfile}><fieldset><legend className="visually-hidden">Personal information</legend><div className="profile-avatar-field"><div className="profile-avatar profile-avatar-large">{avatarPreview ? <img src={avatarPreview} alt="Current profile" /> : avatarLetter}</div><div><button type="button" className="account-button account-secondary" onClick={() => fileInputRef.current?.click()}>Change photo</button><input ref={fileInputRef} type="file" name="avatar" accept="image/*" hidden onChange={(event) => { const file = event.target.files?.[0]; if (file) { setAvatar(file); setAvatarPreview(URL.createObjectURL(file)); } }} /><small>JPG or PNG, up to 2 MB.</small></div></div><div className="profile-form-grid"><label htmlFor="profile-name">Full name<input id="profile-name" name="name" value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} autoComplete="name" required maxLength={255} /></label><label htmlFor="profile-email">Email address<input id="profile-email" name="email" value={profile.email} readOnly disabled autoComplete="email" /><small>Email is managed by your account.</small></label><label htmlFor="profile-phone">Phone number<input id="profile-phone" name="phone" value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} autoComplete="tel" inputMode="tel" /></label><label htmlFor="profile-bio" className="profile-span-2">About you<textarea id="profile-bio" name="bio" value={profile.bio} onChange={(event) => setProfile({ ...profile, bio: event.target.value })} maxLength={500} rows={4} /></label></div></fieldset><div className="profile-form-actions"><button className="account-button" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button></div></form></section>}
          {activeTab === 'security' && <section aria-labelledby="profile-security-title"><div className="profile-section-heading"><div><p className="account-eyebrow">SECURITY</p><h2 id="profile-security-title">Password and sign-in</h2><p>Use a strong password you do not reuse elsewhere.</p></div></div><form className="profile-form" onSubmit={submitPassword}><fieldset><legend className="visually-hidden">Change password</legend><div className="profile-form-grid"><label htmlFor="current-password">Current password<input id="current-password" name="current_password" type="password" value={password.current_password} onChange={(event) => setPassword({ ...password, current_password: event.target.value })} autoComplete="current-password" required /></label><span /><label htmlFor="new-password">New password<input id="new-password" name="password" type="password" minLength={8} value={password.password} onChange={(event) => setPassword({ ...password, password: event.target.value })} autoComplete="new-password" required /></label><label htmlFor="confirm-password">Confirm new password<input id="confirm-password" name="password_confirmation" type="password" minLength={8} value={password.password_confirmation} onChange={(event) => setPassword({ ...password, password_confirmation: event.target.value })} autoComplete="new-password" required /></label></div></fieldset><div className="profile-form-actions"><button className="account-button" type="submit" disabled={saving}>{saving ? 'Updating…' : 'Update password'}</button></div></form></section>}
          {activeTab === 'addresses' && <section aria-labelledby="profile-addresses-title"><div className="profile-section-heading"><div><p className="account-eyebrow">DELIVERY</p><h2 id="profile-addresses-title">Saved addresses</h2><p>Choose a default address to speed up checkout.</p></div><button type="button" className="account-button" onClick={() => { setEditingAddress(null); setAddressForm(emptyAddress); setShowAddressForm(true); }}><Plus size={18} aria-hidden="true" />Add address</button></div>{showAddressForm && <form className="profile-form profile-address-form" onSubmit={submitAddress}><fieldset><legend>{editingAddress ? 'Edit address' : 'Add address'}</legend><div className="profile-form-grid"><label htmlFor="address-title">Label<input id="address-title" name="title" value={addressForm.title} onChange={(event) => setAddressForm({ ...addressForm, title: event.target.value })} required /></label><label htmlFor="address-country">Country<input id="address-country" name="country" value={addressForm.country} onChange={(event) => setAddressForm({ ...addressForm, country: event.target.value })} autoComplete="country" required /></label><label htmlFor="address-line" className="profile-span-2">Street address<input id="address-line" name="address" value={addressForm.address} onChange={(event) => setAddressForm({ ...addressForm, address: event.target.value })} autoComplete="street-address" required /></label><label htmlFor="address-city">City<input id="address-city" name="city" value={addressForm.city} onChange={(event) => setAddressForm({ ...addressForm, city: event.target.value })} autoComplete="address-level2" required /></label><label htmlFor="address-state">Province / state<input id="address-state" name="state" value={addressForm.state} onChange={(event) => setAddressForm({ ...addressForm, state: event.target.value })} autoComplete="address-level1" required /></label><label htmlFor="address-zip">Postal code<input id="address-zip" name="zip_code" value={addressForm.zip_code} onChange={(event) => setAddressForm({ ...addressForm, zip_code: event.target.value })} autoComplete="postal-code" inputMode="numeric" required /></label></div><label className="profile-checkbox"><input type="checkbox" name="is_default" checked={addressForm.is_default} onChange={(event) => setAddressForm({ ...addressForm, is_default: event.target.checked })} />Make this my default address</label></fieldset><div className="profile-form-actions"><button type="submit" className="account-button" disabled={saving}>{saving ? 'Saving…' : editingAddress ? 'Save address' : 'Add address'}</button><button type="button" className="account-button account-secondary" onClick={() => { setShowAddressForm(false); setEditingAddress(null); }}>Cancel</button></div></form>}{addressLoading ? <div className="profile-loading" role="status">Loading addresses…</div> : addresses.length === 0 ? <div className="profile-empty"><MapPin size={26} aria-hidden="true" /><h3>No saved addresses yet</h3><p>Add one to make checkout faster.</p></div> : <div className="address-grid">{addresses.map((address) => <article className="address-card" key={address.id}><header><div><span className="address-label">{address.title || 'Address'}</span>{address.is_default && <span className="address-default">Default</span>}</div><MapPin size={21} aria-hidden="true" /></header><p>{address.address}<br />{address.city}, {address.state} {address.zip_code}<br />{address.country}</p><footer><button type="button" className="account-button account-secondary" onClick={() => { setEditingAddress(address); setAddressForm(addressValues(address)); setShowAddressForm(true); }}><PencilSimple size={17} aria-hidden="true" />Edit</button><button type="button" className="account-button account-danger" onClick={() => removeAddress(address)}><Trash size={17} aria-hidden="true" />Remove</button>{!address.is_default && <button type="button" className="account-text-button" onClick={() => makeDefault(address)}>Make default</button>}</footer></article>)}</div>}</section>}
        </main>
      </div>}
    </div>
  </div>;
}
