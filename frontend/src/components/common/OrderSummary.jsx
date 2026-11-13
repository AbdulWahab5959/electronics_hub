import { formatMoney } from '../../utils/money';

export function OrderSummary({ subtotal = 0, quote, items = [], onCheckout, isLoading = false }) {
  return <div className="order-summary">
    <h3 className="order-summary-title">Order summary</h3>
    <div className="order-items-preview">{items.map(item => <div className="order-preview-item" key={item.product_id ?? item.id}>
      <span>{item.quantity} × {item.name}</span>
      <span>{formatMoney(item.line_total ?? Number(item.price) * item.quantity)}</span>
    </div>)}</div>
    <div className="price-breakdown">
      <div className="breakdown-row"><span>Subtotal</span><span>{formatMoney(quote?.subtotal ?? subtotal)}</span></div>
      {quote ? <>
        <div className="breakdown-row"><span>Shipping</span><span>{formatMoney(quote.shipping_cost)}</span></div>
        <div className="breakdown-row"><span>Tax</span><span>{formatMoney(quote.tax)}</span></div>
        <div className="breakdown-row total-row"><span>Total</span><strong>{formatMoney(quote.total)}</strong></div>
      </> : <p>Shipping, tax, availability, and the final amount are confirmed at checkout.</p>}
    </div>
    {onCheckout && <button type="button" className="checkout-btn" onClick={onCheckout} disabled={isLoading || !items.length}>
      {isLoading ? 'Please wait…' : 'Proceed to checkout'}
    </button>}
  </div>;
}
