import { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { CheckCircle } from '@phosphor-icons/react/dist/csr/CheckCircle';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { OrderSummary } from '../components/common/OrderSummary';
import { getOrderByNumber } from '../services/order';

export default function OrderSuccessPage() {
  const location = useLocation();
  const [params] = useSearchParams();
  const number = params.get('order') || location.state?.order?.order_number;
  const [result, setResult] = useState(null);
  useEffect(() => {
    if (!number) return;
    window.scrollTo({ top: 0, behavior: 'instant' });
    const controller = new AbortController();
    getOrderByNumber(number, { signal: controller.signal }).then(response => {
      if (!controller.signal.aborted) setResult({ number, order: response.data.data });
    }).catch(() => {
      if (!controller.signal.aborted) setResult({ number, error: 'Could not load this order. Please check My Orders.' });
    });
    return () => controller.abort();
  }, [number]);
  if (!number || (result?.number === number && result.error)) return <div className="commerce-state"><h1>Check your orders</h1><p role="alert">{result?.error || 'Choose an order from your account.'}</p><Link className="commerce-primary" to="/orders">My Orders</Link></div>;
  if (result?.number !== number) return <div className="commerce-state" role="status">Loading your order…</div>;
  const { order } = result;
  const shipping = order.shipping_address;
  const items = order.items.map(item => ({ ...item, image: item.product?.image }));
  const quote = { subtotal: items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0), shipping_cost: order.shipping_cost, tax: order.tax, total: order.total };
  return <div className="store-order-success"><div className="flow-container">
    <Breadcrumb items={[{ name: 'Home', path: '/' }, { name: 'My Orders', path: '/orders' }, { name: 'Order received' }]} />
    <header className="flow-success-header"><CheckCircle size={48} weight="duotone" aria-hidden="true" /><div><p className="commerce-eyebrow">THANK YOU FOR SHOPPING WITH TECHHUB</p><h1>Order received</h1><p className="flow-order-reference">{order.order_number}</p><p>Your order is {order.status.replaceAll('_', ' ')}. Cash on delivery — no online payment has been collected.</p></div></header>
    <div className="flow-success-layout"><OrderSummary classPrefix="flow-" showImages quote={quote} items={items} /><section className="flow-delivery-panel"><h2>Shipping address</h2><address><strong>{shipping.fullName}</strong><span>{shipping.address}</span>{shipping.apartment && <span>{shipping.apartment}</span>}<span>{shipping.city}, {shipping.state}{shipping.zipCode ? ' ' + shipping.zipCode : ''}</span><span>Pakistan</span></address><p>{shipping.phone}<br />{shipping.email}</p><h2>Payment</h2><p>Cash on delivery</p><span className="flow-payment-status">{order.payment_status === 'awaiting_collection' ? 'Pay on delivery' : order.payment_status.replaceAll('_', ' ')}</span></section></div>
    <div className="flow-success-actions"><Link className="flow-button primary" to={'/orders/' + encodeURIComponent(order.order_number)}>View order</Link><Link className="flow-button secondary" to="/shop">Continue shopping</Link></div>
  </div></div>;
}
