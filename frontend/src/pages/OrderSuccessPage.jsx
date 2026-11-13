import { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { getOrderByNumber } from '../services/order';
import { formatMoney } from '../utils/money';

export default function OrderSuccessPage() {
  const location = useLocation();
  const [params] = useSearchParams();
  const number = params.get('order') || location.state?.order?.order_number;
  const [result, setResult] = useState(null);
  useEffect(() => {
    if (!number) return;
    const controller = new AbortController();
    getOrderByNumber(number, { signal: controller.signal }).then(response => {
      if (!controller.signal.aborted) setResult({ order: response.data.data });
    }).catch(() => {
      if (!controller.signal.aborted) setResult({ error: 'Could not load this order. Please check My Orders.' });
    });
    return () => controller.abort();
  }, [number]);
  if (!number || result?.error) return <div className="container"><p role="alert">{result?.error || 'Choose an order from your account.'}</p><Link to="/orders">My Orders</Link></div>;
  if (!result) return <div className="container" role="status">Loading your order…</div>;
  const { order } = result;
  return <div className="order-success-page"><div className="container"><div className="success-card">
    <h1>Order received</h1><p>{order.order_number}</p>
    <p>Status: {order.status}. Payment: {order.payment_status.replaceAll('_', ' ')}.</p>
    <p>Cash on delivery — no online payment has been collected.</p>
    <div className="items-summary">{order.items.map(item => <p key={item.id}>{item.quantity} × {item.name}: {formatMoney(Number(item.price) * item.quantity)}</p>)}</div>
    <p className="total-amount">Total: {formatMoney(order.total)}</p>
    <h2>Shipping address</h2><p>{order.shipping_address.fullName}<br />{order.shipping_address.address}<br />
      {order.shipping_address.city}, {order.shipping_address.state}</p>
    <div className="success-actions"><Link to={'/orders/' + order.order_number}>View order</Link><Link to="/shop">Continue shopping</Link></div>
  </div></div></div>;
}
