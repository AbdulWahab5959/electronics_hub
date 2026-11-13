import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatMoney } from '../../utils/money';

export function CartItem({ id, productId, name, image, price, quantity, maxStock, onUpdateQuantity, onRemove }) {
  const [busy, setBusy] = useState(false);
  const update = async next => {
    setBusy(true);
    try { await onUpdateQuantity(id, next); } finally { setBusy(false); }
  };
  const remove = async () => {
    setBusy(true);
    try { await onRemove(id); } finally { setBusy(false); }
  };
  return <div className={'cart-item' + (busy ? ' cart-item-loading' : '')}>
    <Link to={'/product/' + productId} className="cart-item-image-link"><img className="cart-item-image" src={image} alt={name} /></Link>
    <div className="cart-item-details">
      <Link to={'/product/' + productId}><h3>{name}</h3></Link>
      <div className="quantity-selector">
        <button type="button" aria-label={'Decrease quantity of ' + name} disabled={busy || quantity <= 1}
          onClick={() => update(Math.min(quantity - 1, Math.max(maxStock, 1)))}>−</button>
        <span className="quantity-value">{quantity}</span>
        <button type="button" aria-label={'Increase quantity of ' + name} disabled={busy || quantity >= maxStock}
          onClick={() => update(quantity + 1)}>+</button>
      </div>
      {maxStock < quantity && <p role="status">Only {maxStock} currently available. Update or remove this item.</p>}
      <button type="button" disabled={busy} onClick={remove}>Remove</button>
    </div>
    <div className="cart-item-price-section">
      <p>Unit price: {formatMoney(price)}</p><strong>{formatMoney(Number(price) * quantity)}</strong>
    </div>
  </div>;
}
