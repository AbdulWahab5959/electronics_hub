import { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { MagnifyingGlass } from '@phosphor-icons/react/dist/csr/MagnifyingGlass';
import { Package } from '@phosphor-icons/react/dist/csr/Package';
import { Truck } from '@phosphor-icons/react/dist/csr/Truck';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { OrderStatusBadge } from '../components/common/OrderStatusBadge';
import { getOrders } from '../services/order';
import { formatMoney } from '../utils/money';
import { orderStatuses, statusLabel, filterOrders, itemCount, formatOrderDate, orderPage } from '../utils/orders';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const status = ['active', ...orderStatuses].includes(params.get('status')) ? params.get('status') : 'all';
  const query = params.get('q') || '';
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = 'My Orders | TechHub';
    const controller = new AbortController();
    async function load() {
      setLoading(true); setError('');
      try {
        const response = await getOrders({ signal: controller.signal });
        if (!Array.isArray(response.data.data)) throw new Error('Invalid response');
        if (!controller.signal.aborted) setOrders(response.data.data);
      } catch {
        if (!controller.signal.aborted) setError('Could not load your orders. Please retry.');
      } finally { if (!controller.signal.aborted) setLoading(false); }
    }
    void load();
    return () => { controller.abort(); document.title = 'TechHub | Electronics'; };
  }, [reload]);
  const filtered = filterOrders(orders, query, status);
  const { page, pages, items, from, to } = orderPage(filtered, params.get('page'));
  const listLocation = location.pathname + location.search;
  function changeFilter(key, value) {
    // Read the committed URL so fast consecutive controls preserve each other's changes.
    const next = new URLSearchParams(window.location.search);
    next.delete('page');
    if (!value || value === 'all') next.delete(key); else next.set(key, value);
    setParams(next, { replace: true });
  }
  function changePage(nextPage) {
    const next = new URLSearchParams(window.location.search);
    if (nextPage === 1) next.delete('page'); else next.set('page', String(nextPage));
    setParams(next, { replace: true });
    document.getElementById('history-results')?.scrollIntoView({ behavior: 'instant', block: 'start' });
  }
  return <div className="store-orders"><div className="history-container">
    <Breadcrumb items={[{ name: 'Home', path: '/' }, { name: 'My Orders' }]} />
    <header className="history-header"><div><p className="commerce-eyebrow">YOUR TECHHUB ACCOUNT</p><h1>My Orders</h1><p>Track your purchases and find every order in one place.</p></div><Link className="history-button primary" to="/shop">Continue shopping</Link></header>
    {!loading && !error && <div className="history-counts"><div><strong>{orders.length}</strong><span>Total orders</span></div><div><strong>{orders.filter(o => ['pending', 'processing', 'shipped'].includes(o.status)).length}</strong><span>In progress</span></div><div><strong>{orders.filter(o => o.status === 'delivered').length}</strong><span>Delivered</span></div></div>}
    <search className="history-controls" aria-label="Find your orders"><div className="history-search"><label htmlFor="history-search">Search orders</label><div><MagnifyingGlass size={19} aria-hidden="true" /><input id="history-search" type="search" value={query} onChange={event => changeFilter('q', event.target.value)} placeholder="Order reference or product name" /></div></div><div className="history-filter"><label htmlFor="history-status">Order status</label><select id="history-status" value={status} onChange={event => changeFilter('status', event.target.value)}><option value="all">All orders ({orders.length})</option><option value="active">In progress ({orders.filter(o => ['pending', 'processing', 'shipped'].includes(o.status)).length})</option>{orderStatuses.map(value => <option key={value} value={value}>{statusLabel(value)} ({orders.filter(o => o.status === value).length})</option>)}</select></div><button type="button" className="history-button secondary" disabled={loading} onClick={() => setReload(value => value + 1)}>{loading ? 'Loading…' : 'Refresh orders'}</button></search>
    {error && <div className="history-error" role="alert"><p>{error}</p><button type="button" className="history-button secondary" onClick={() => setReload(value => value + 1)}>Try again</button></div>}
    <div id="history-results" className="history-results" aria-busy={loading}>
      {loading && !orders.length ? <div className="history-empty"><Package size={36} aria-hidden="true" /><p>Loading your orders…</p></div> : !orders.length && !error ? <div className="history-empty"><Package size={42} aria-hidden="true" /><h2>No orders yet</h2><p>Your purchases will appear here once you place an order.</p><Link className="history-button primary" to="/shop">Explore the shop</Link></div> : !filtered.length && !error ? <div className="history-empty"><h2>No matching orders</h2><p>Try another reference or product name, or clear your filters.</p><button type="button" className="history-button secondary" onClick={() => setParams({}, { replace: true })}>Clear filters</button></div> : <>
        {orders.length > 0 && <p className="history-result-count" role="status">Showing {from}–{to} of {filtered.length} {filtered.length === 1 ? 'order' : 'orders'}{status !== 'all' ? ' · ' + statusLabel(status) : ''}</p>}
        <ul className="history-list" role="list">{items.map(order => <li key={order.order_number}><article className="history-order-card">
          <header className="history-card-header"><div><p className="history-reference-label">Order reference</p><h2><Link to={'/orders/' + encodeURIComponent(order.order_number)} state={{ from: listLocation }}>{order.order_number}</Link></h2><p>Placed {formatOrderDate(order.created_at)}</p></div><OrderStatusBadge status={order.status} /></header>
          <ul className="history-items" role="list">{(order.items || []).slice(0, 2).map(item => <li key={item.id}><img src={item.product?.image || '/product-placeholder.svg'} alt="" loading="lazy" onError={event => { event.target.onerror = null; event.target.src = '/product-placeholder.svg'; }} /><div><h3>{item.name}</h3><p>Quantity: {item.quantity}</p></div><strong>{formatMoney(Number(item.price) * item.quantity)}</strong></li>)}</ul>
          {order.items?.length > 2 && <p className="history-more">+{order.items.length - 2} more {order.items.length - 2 === 1 ? 'product' : 'products'} in this order</p>}
          <footer className="history-card-footer"><div><span>{itemCount(order.items)} {itemCount(order.items) === 1 ? 'item' : 'items'} · Order total</span><strong>{formatMoney(order.total)}</strong></div><div className="history-card-actions">{order.status !== 'cancelled' && <Link className="history-button secondary" to={'/orders/' + encodeURIComponent(order.order_number) + '#tracking'} state={{ from: listLocation }} aria-label={'Track order ' + order.order_number}><Truck size={17} aria-hidden="true" />Track order</Link>}<Link className="history-button primary" to={'/orders/' + encodeURIComponent(order.order_number)} state={{ from: listLocation }} aria-label={'View details for order ' + order.order_number}>View details</Link></div></footer>
        </article></li>)}</ul>
        {filtered.length > 8 && <nav className="history-pagination" aria-label="Orders pages"><button type="button" className="history-button secondary" disabled={page === 1} onClick={() => changePage(page - 1)}>Previous</button><span>Page {page} of {pages}</span><button type="button" className="history-button secondary" disabled={page === pages} onClick={() => changePage(page + 1)}>Next</button></nav>}
      </>}
    </div>
  </div></div>;
}
