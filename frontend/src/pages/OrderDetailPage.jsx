import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Check } from '@phosphor-icons/react/dist/csr/Check';
import { Package } from '@phosphor-icons/react/dist/csr/Package';
import { XCircle } from '@phosphor-icons/react/dist/csr/XCircle';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { OrderSummary } from '../components/common/OrderSummary';
import { OrderStatusBadge } from '../components/common/OrderStatusBadge';
import { cancelOrder, getOrderByNumber, trackOrder } from '../services/order';
import { formatMoney } from '../utils/money';
import { canCancelOrder, formatOrderDate, itemCount, paymentLabel, progressSteps, statusDescription, statusLabel } from '../utils/orders';

export default function OrderDetailPage() {
  const { orderNumber } = useParams();
  return <OrderDetail key={orderNumber} orderNumber={orderNumber} />;
}

function OrderDetail({ orderNumber }) {
  const location = useLocation();
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [requiresRefresh, setRequiresRefresh] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [reload, setReload] = useState(0);
  const dialogRef = useRef(null);
  const trackingRef = useRef(null);
  const mutating = useRef(false);
  const refreshController = useRef(null);
  const order = result?.order;
  const from = typeof location.state?.from === 'string' ? location.state.from : '';
  const returnPath = from === '/orders' || from.startsWith('/orders?') ? from : '/orders';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = 'Order ' + orderNumber + ' | TechHub';
    const controller = new AbortController();
    getOrderByNumber(orderNumber, { signal: controller.signal }).then(response => {
      if (!controller.signal.aborted) setResult({ order: response.data.data });
    }).catch(failure => {
      if (!controller.signal.aborted) setResult({ error: [403, 404].includes(failure.response?.status) ? 'Order not found or unavailable for your account.' : 'Could not load this order. Please retry.' });
    });
    return () => { controller.abort(); refreshController.current?.abort(); document.title = 'TechHub | Electronics'; };
  }, [orderNumber, reload]);

  useEffect(() => {
    if (order?.order_number && location.hash === '#tracking') {
      trackingRef.current?.focus({ preventScroll: true });
      trackingRef.current?.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
  }, [order?.order_number, location.hash]);

  async function refreshStatus() {
    if (refreshing || mutating.current) return;
    const controller = new AbortController();
    refreshController.current = controller;
    setRefreshing(true); setError(''); setNotice('');
    try {
      // Check the owner-scoped tracking endpoint, then refresh full payment/cancellation details.
      await trackOrder(orderNumber, { signal: controller.signal });
      const response = await getOrderByNumber(orderNumber, { signal: controller.signal });
      if (!controller.signal.aborted) { setResult({ order: response.data.data }); setRequiresRefresh(false); setNotice('Order status refreshed.'); }
    } catch {
      if (!controller.signal.aborted) setError('Could not refresh the order status. Please try again.');
    } finally { if (!controller.signal.aborted) setRefreshing(false); }
  }

  async function confirmCancellation() {
    if (mutating.current || !canCancelOrder(order) || requiresRefresh) return;
    mutating.current = true; setBusy(true); setError(''); setNotice('');
    try {
      const response = await cancelOrder(order.id);
      // The cancellation response contains the committed order and its product snapshots.
      // Avoid a second GET turning a successful cancellation into a false failure.
      setResult({ order: response.data.data }); setRequiresRefresh(false);
      setNotice(order.payment_method === 'cod' ? 'Order cancelled. No cash-on-delivery payment is due.' : 'Order cancelled.');
      dialogRef.current?.close();
      requestAnimationFrame(() => trackingRef.current?.focus({ preventScroll: true }));
    } catch (failure) {
      setRequiresRefresh(true);
      dialogRef.current?.close();
      setError(failure.response?.data?.message || 'We couldn’t confirm cancellation. Refresh the order status before trying again.');
      try {
        const response = await getOrderByNumber(orderNumber);
        setResult({ order: response.data.data }); setRequiresRefresh(false);
        if (response.data.data.status === 'cancelled') { setError(''); setNotice('Order cancelled.'); }
      } catch { /* Retain the last known order and require a status refresh. */ }
    } finally { mutating.current = false; setBusy(false); }
  }

  if (!result) return <div className="commerce-state"><Package size={36} aria-hidden="true" /><p>Loading order…</p></div>;
  if (result.error) return <div className="commerce-state"><h1>Order unavailable</h1><p role="alert">{result.error}</p><button type="button" className="history-button secondary" onClick={() => { setResult(null); setReload(value => value + 1); }}>Try again</button><Link className="flow-state-link" to={returnPath}>Back to My Orders</Link></div>;
  const shipping = order.shipping_address || {};
  const items = (order.items || []).map(item => ({ ...item, image: item.product?.image || item.image }));
  const currentStep = progressSteps.indexOf(order.status);
  const quote = { subtotal: order.subtotal ?? items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0), shipping_cost: order.shipping_cost, tax: order.tax, total: order.total };
  return <div className="store-order-detail"><div className="history-container">
    <Breadcrumb items={[{ name: 'Home', path: '/' }, { name: 'My Orders', path: returnPath }, { name: 'Order details' }]} />
    <header className="history-header"><div><p className="commerce-eyebrow">YOUR TECHHUB PURCHASE</p><h1>Order details</h1><p className="history-detail-reference">{order.order_number}</p><p>Placed {formatOrderDate(order.created_at, true)} · {itemCount(items)} {itemCount(items) === 1 ? 'item' : 'items'}</p></div><Link className="history-back" to={returnPath}>Back to My Orders</Link></header>
    {error && <div className="history-error" role="alert"><p>{error}</p>{requiresRefresh && <p>Refresh the status to check whether this order can still be cancelled.</p>}</div>}
    <p className="history-notice" role="status">{notice}</p>
    <section id="tracking" className="history-tracking"><header><div><h2 ref={trackingRef} tabIndex={-1}>Order tracking</h2><p>Last updated {formatOrderDate(order.updated_at, true)}</p></div><button type="button" className="history-button secondary" disabled={refreshing || busy} onClick={refreshStatus}>{refreshing ? 'Refreshing…' : 'Refresh status'}</button></header>
      <div className="history-tracking-current"><OrderStatusBadge status={order.status} /><p>{statusDescription(order.status)}</p></div>
      {order.status === 'cancelled' ? <div className="history-cancelled-note"><XCircle size={24} aria-hidden="true" /><p>This order will not proceed to delivery. If you still need these products, you can place a new order from the shop.</p></div> : currentStep >= 0 && <ol className="history-timeline" role="list">{progressSteps.map((status, index) => <li className={index < currentStep ? 'complete' : index === currentStep ? 'current' : ''} key={status} aria-current={index === currentStep ? 'step' : undefined}><span className="history-timeline-mark" aria-hidden="true">{index < currentStep ? <Check size={17} weight="bold" /> : index + 1}</span><span>{status === 'pending' ? 'Order placed' : statusLabel(status)}<small>{index < currentStep ? 'Completed' : index === currentStep ? 'Current status' : 'Not yet reached'}</small></span></li>)}</ol>}
    </section>
    <div className="history-detail-layout"><section className="history-order-items"><OrderSummary classPrefix="flow-" showImages quote={quote} items={items} /><p className="history-snapshot-note">Prices and quantities shown are from this order.</p></section><aside className="history-detail-side"><section className="history-info-panel"><h2>Shipping address</h2><address><strong>{shipping.fullName}</strong><span>{shipping.address}</span>{shipping.apartment && <span>{shipping.apartment}</span>}<span>{shipping.city}, {shipping.state}{shipping.zipCode ? ' ' + shipping.zipCode : ''}</span>{shipping.country && <span>{shipping.country === 'PK' ? 'Pakistan' : shipping.country}</span>}</address><p>{shipping.phone}<br />{shipping.email}</p><h2>Payment</h2><p>{order.payment_method === 'cod' ? 'Cash on delivery' : String(order.payment_method || 'Unknown').replaceAll('_', ' ')}</p><span className="history-payment-status">{paymentLabel(order.payment_status)}</span></section>
      <section className="history-manage-panel"><h2>Need help with this order?</h2><p>Include your order reference when you contact our team.</p><Link className="history-button secondary" to="/contact">Contact TechHub</Link>{canCancelOrder(order) && <><div className="history-cancel-action"><p>You can cancel while this order is pending and payment has not been collected.</p><button type="button" className="history-button danger" disabled={busy || refreshing || requiresRefresh} onClick={() => { if (!dialogRef.current?.open) dialogRef.current?.showModal(); }}>Cancel order</button></div></>}</section>
    </aside></div>
    <dialog ref={dialogRef} className="history-cancel-dialog" aria-labelledby="cancel-order-title" aria-describedby="cancel-order-description cancel-order-progress" onCancel={event => { if (busy) event.preventDefault(); }}>
      <h2 id="cancel-order-title">Cancel this order?</h2><p className="history-dialog-reference">{order.order_number}</p><p id="cancel-order-description">This will cancel the whole order for <strong>{formatMoney(order.total)}</strong>. If you still want these items, you’ll need to place a new order.</p><p id="cancel-order-progress" role="status" hidden={!busy}>Please wait while we confirm the cancellation.</p><form method="dialog" className="history-dialog-actions"><button type="submit" value="keep" className="history-button secondary" autoFocus disabled={busy}>Keep order</button><button type="button" className="history-button danger filled" disabled={busy} onClick={confirmCancellation}>{busy ? 'Cancelling…' : 'Confirm cancellation'}</button></form>
    </dialog>
  </div></div>;
}
