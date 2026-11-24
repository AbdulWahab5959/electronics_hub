// Real account overview; all-time context replaces invented trends. TechHub's light palette wins.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowsClockwise } from '@phosphor-icons/react/dist/csr/ArrowsClockwise';
import { Package } from '@phosphor-icons/react/dist/csr/Package';
import { Truck } from '@phosphor-icons/react/dist/csr/Truck';
import { Heart } from '@phosphor-icons/react/dist/csr/Heart';
import { Receipt } from '@phosphor-icons/react/dist/csr/Receipt';
import { ShoppingCart } from '@phosphor-icons/react/dist/csr/ShoppingCart';
import { Headset } from '@phosphor-icons/react/dist/csr/Headset';
import { useAuth } from '../../hooks/useAuth';
import { getOrders } from '../../services/order';
import { getWishlist } from '../../services/wishlist';
import { OrderStatusBadge } from '../../components/common/OrderStatusBadge';
import { formatMoney } from '../../utils/money';
import { formatOrderDate, itemCount } from '../../utils/orders';
import { dashboardSummary, dashboardOrders } from '../../utils/dashboard';

export default function Dashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState(null);
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);
  const [updated, setUpdated] = useState(null);
  const [reload, setReload] = useState(0);
  const [view, setView] = useState('all');
  useEffect(() => {
    document.title = 'My Dashboard | TechHub';
    window.scrollTo({ top: 0, behavior: 'instant' });
    const controller = new AbortController();
    async function load() {
      setLoading(true); setErrors([]);
      const results = await Promise.allSettled([getOrders({ signal: controller.signal }), getWishlist({ signal: controller.signal })]);
      if (controller.signal.aborted) return;
      const failures = [];
      results.forEach((result, index) => {
        const data = result.status === 'fulfilled' ? result.value.data.data : null;
        if (Array.isArray(data)) (index === 0 ? setOrders : setWishlist)(data);
        else failures.push(index === 0 ? 'orders' : 'wishlist');
      });
      setErrors(failures);
      if (!failures.length) setUpdated(new Date().toISOString());
      setLoading(false);
    }
    void load();
    return () => { controller.abort(); document.title = 'TechHub | Electronics'; };
  }, [reload]);
  const summary = orders === null ? null : dashboardSummary(orders);
  const recent = dashboardOrders(orders || [], view).slice(0, 4);
  const firstName = user?.name?.trim().split(/\s+/)[0] || 'there';
  const stats = [
    { label: 'All orders', value: summary?.total, context: 'All time', icon: Package, path: '/orders', definition: 'All orders placed by this account, including cancelled orders.' },
    { label: 'In progress', value: summary?.active, context: 'Current', icon: Truck, path: '/orders?status=active', definition: 'Pending, processing and shipped orders.' },
    { label: 'Delivered value', value: summary ? formatMoney(summary.deliveredMinor / 100) : null, context: 'All time · PKR', icon: Receipt, path: '/orders?status=delivered', definition: 'Delivered order value including shipping and tax, not a payment receipt.' },
    { label: 'Saved items', value: wishlist?.length, context: 'Wishlist', icon: Heart, path: '/wishlist', definition: 'Products saved to this account’s wishlist.' },
  ];
  return <div className="account-overview"><div className="account-shell">
    <header className="account-heading"><div><p className="account-eyebrow">MY ACCOUNT</p><h1>Welcome back, {firstName}</h1></div><div className="account-toolbar"><span className="account-updated" role="status" title={updated ? 'Last complete refresh: ' + formatOrderDate(updated, true) + '. Refresh manually for the latest data.' : undefined}>{loading ? 'Updating…' : errors.length ? 'Update incomplete' : updated ? 'Updated ' + new Intl.DateTimeFormat('en-PK', { timeZone: 'Asia/Karachi', timeStyle: 'short' }).format(new Date(updated)) + ' PKT' : ''}</span><button type="button" className="account-button account-secondary" disabled={loading} onClick={() => setReload(value => value + 1)}><ArrowsClockwise size={18} aria-hidden="true" />Refresh</button><Link to="/shop" className="account-button">Shop electronics</Link></div></header>
    {errors.length > 0 && <div className="account-error" role="alert"><p>Could not refresh your {errors.join(' and ')}. {orders !== null || wishlist !== null ? 'Previously loaded data remains visible.' : 'Please try again.'}</p><button type="button" className="account-button account-secondary" onClick={() => setReload(value => value + 1)}>Try again</button></div>}
    <section aria-label="Account summary" className={'account-stats' + (loading ? ' account-refreshing' : '')} aria-busy={loading}>{stats.map(({ label, value, context, icon: Icon, path, definition }) => <Link to={path} className="account-stat" key={label} title={definition}><span className="account-stat-label">{label}<Icon size={19} aria-hidden="true" /></span><strong>{value ?? (loading ? <span className="account-skeleton" /> : '—')}</strong><span className="account-stat-context">{value == null && !loading ? 'Unavailable' : context}</span></Link>)}</section>
    <div className="account-main"><section className="account-orders" aria-labelledby="account-orders-title">
      <header className="account-panel-heading"><h2 id="account-orders-title">Recent orders</h2><Link to="/orders" className="account-text-button">View all orders</Link></header>
      <div className="account-order-controls"><div className="account-segments" role="group" aria-label="Recent order filter">{[['all', 'All'], ['active', 'In progress'], ['delivered', 'Delivered']].map(([key, label]) => <button type="button" key={key} aria-pressed={view === key} onClick={() => setView(key)}>{label}</button>)}</div><span className="account-muted">{orders === null ? (loading ? 'Loading…' : 'Unavailable') : 'Latest ' + recent.length}</span></div>
      {orders === null ? <div className="account-empty" role="status"><Package size={30} aria-hidden="true" /><h3>{loading ? 'Loading your orders…' : 'Orders unavailable'}</h3>{!loading && <p>Use Refresh to try again.</p>}</div> : recent.length === 0 ? <div className="account-empty"><Package size={30} aria-hidden="true" /><h3>{orders.length ? 'No ' + (view === 'active' ? 'orders in progress' : 'delivered orders') : 'Your first order starts here'}</h3><p>{orders.length ? 'Choose All to view your order history.' : 'Your orders and delivery status will appear here after checkout.'}</p><Link to={orders.length ? '/orders' : '/shop'} className="account-button account-secondary">{orders.length ? 'View order history' : 'Explore the shop'}</Link></div> : <div className={'account-table-wrap' + (loading ? ' account-refreshing' : '')} tabIndex={0} role="region" aria-label="Recent orders table" aria-busy={loading}><table className="account-table" role="table"><caption className="visually-hidden">Most recent {view === 'all' ? '' : view === 'active' ? 'in-progress ' : 'delivered '}orders</caption><thead role="rowgroup"><tr role="row"><th scope="col" role="columnheader">Order / placed</th><th scope="col" role="columnheader">Status</th><th scope="col" role="columnheader" className="account-amount">Total</th><th scope="col" role="columnheader"><span className="visually-hidden">Action</span></th></tr></thead><tbody role="rowgroup">{recent.map(order => <tr key={order.id} role="row"><th scope="row" role="rowheader"><Link to={'/orders/' + order.order_number}>{order.order_number}</Link><span>{formatOrderDate(order.created_at)} · {itemCount(order.items)} {itemCount(order.items) === 1 ? 'item' : 'items'}</span></th><td role="cell"><OrderStatusBadge status={order.status} /></td><td className="account-amount" role="cell">{formatMoney(order.total)}</td><td role="cell"><Link className="account-order-link" to={'/orders/' + order.order_number + (order.status === 'cancelled' || order.status === 'delivered' ? '' : '#tracking')} aria-label={(order.status === 'cancelled' || order.status === 'delivered' ? 'View order ' : 'Track order ') + order.order_number}>{order.status === 'cancelled' || order.status === 'delivered' ? 'View order' : 'Track order'}</Link></td></tr>)}</tbody></table></div>}
    </section><aside className="account-side"><section className="account-profile"><header><span className="account-avatar" aria-hidden="true">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span><div><h2>{user?.name}</h2><span>TechHub member</span></div></header><dl><div><dt>Email</dt><dd>{user?.email}</dd></div><div><dt>Member since</dt><dd>{formatOrderDate(user?.created_at)}</dd></div></dl><Link to="/profile" className="account-button account-secondary">Manage profile</Link></section><nav className="account-links" aria-label="Account shortcuts">{[{ icon: Heart, label: 'My wishlist', path: '/wishlist' }, { icon: ShoppingCart, label: 'Shopping cart', path: '/cart' }, { icon: Headset, label: 'Contact support', path: '/contact' }].map(({ icon: Icon, label, path }) => <Link key={path} to={path}><Icon size={20} aria-hidden="true" /><span>{label}</span></Link>)}</nav></aside></div>
  </div></div>;
}
