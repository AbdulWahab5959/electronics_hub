import { formatMoney } from '../../utils/money';

export function OrderSummary({ subtotal = 0, quote, items = [], onCheckout, isLoading = false, disabled = false, classPrefix = '', showImages = false }) {
  const cls = names => names.split(' ').map(name => classPrefix + name).join(' ');
  return <div className={cls('order-summary')}>
    <h2 className={cls('order-summary-title')}>Order summary</h2>
    <div className={cls('order-items-preview')}>{items.map(item => <div className={cls('order-preview-item')} key={item.product_id ?? item.id}>
      {showImages && <img className={cls('preview-image')} src={item.image || '/product-placeholder.svg'} alt="" onError={e => { e.target.onerror = null; e.target.src = '/product-placeholder.svg'; }} />}
      <span>{item.quantity} × {item.name}</span>
      <span>{formatMoney(item.line_total ?? Number(item.price) * item.quantity)}</span>
    </div>)}</div>
    <div className={cls('price-breakdown')}>
      <div className={cls('breakdown-row')}><span>Subtotal</span><span>{formatMoney(quote?.subtotal ?? subtotal)}</span></div>
      {quote ? <>
        <div className={cls('breakdown-row')}><span>Shipping</span><span>{formatMoney(quote.shipping_cost)}</span></div>
        <div className={cls('breakdown-row')}><span>Tax</span><span>{formatMoney(quote.tax)}</span></div>
        <div className={cls('breakdown-row total-row')}><span>Total</span><strong>{formatMoney(quote.total)}</strong></div>
      </> : <p>Shipping, tax, availability, and the final amount are confirmed at checkout.</p>}
    </div>
    {onCheckout && <button type="button" className={cls('checkout-btn')} onClick={onCheckout} disabled={disabled || isLoading || !items.length}>
      {isLoading ? 'Please wait…' : 'Proceed to checkout'}
    </button>}
  </div>;
}
