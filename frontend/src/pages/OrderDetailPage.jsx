import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { cancelOrder, getOrderByNumber } from '../services/order';
import { formatMoney } from '../utils/money';

export default function OrderDetailPage() {
  const { orderNumber } = useParams();
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    getOrderByNumber(orderNumber, { signal: controller.signal }).then(response => {
      if (!controller.signal.aborted) setResult({ order: response.data.data });
    }).catch(() => {
      if (!controller.signal.aborted) setResult({ error: 'Order not found or unavailable.' });
    });
    return () => controller.abort();
  }, [orderNumber]);
  const cancel = async () => {
    setBusy(true);
    setError('');
    try {
      await cancelOrder(result.order.id);
      const response = await getOrderByNumber(orderNumber);
      setResult({ order: response.data.data });
    } catch (failure) {
      setError(failure.response?.data?.message || 'Cancellation failed. Please retry.');
    } finally { setBusy(false); }
  };
  if (!result) return <div className="container" role="status">Loading order…</div>;
  if (result.error) return <div className="container"><p role="alert">{result.error}</p><Link to="/orders">My Orders</Link></div>;
  const { order } = result;
  return <div className="order-detail-page"><div className="container">
    <Link to="/orders">Back to My Orders</Link><h1>Order {order.order_number}</h1>
    {error && <p role="alert">{error}</p>}
    <div className="detail-card"><p>Status: {order.status}</p>
      <p>Placed: {new Date(order.created_at).toLocaleString()}</p>
      <p>Last updated: {new Date(order.updated_at).toLocaleString()}</p>
      <p>Payment: {(order.payment_status || 'awaiting_collection').replaceAll('_', ' ')} — {order.payment_method === 'cod' ? 'Cash on delivery' : order.payment_method}</p>
      {order.status === 'pending' && order.payment_status === 'awaiting_collection' &&
        <button type="button" disabled={busy} onClick={cancel}>{busy ? 'Cancelling…' : 'Cancel order'}</button>}
    </div>
    <div className="detail-card"><h2>Items</h2>{order.items.map(item => <p key={item.id}>
      {item.quantity} × {item.name} — {formatMoney(Number(item.price) * item.quantity)}
    </p>)}
      <p>Subtotal: {formatMoney(order.subtotal)}</p><p>Shipping: {formatMoney(order.shipping_cost)}</p>
      <p>Tax: {formatMoney(order.tax)}</p><strong>Total: {formatMoney(order.total)}</strong>
    </div>
    <div className="detail-card"><h2>Shipping address</h2><p>{order.shipping_address.fullName}<br />
      {order.shipping_address.address}<br />{order.shipping_address.city}, {order.shipping_address.state}<br />
      {order.shipping_address.phone}</p></div>
  </div></div>;
}
