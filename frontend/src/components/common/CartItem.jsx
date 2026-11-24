import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatMoney } from '../../utils/money';
import { Minus } from '@phosphor-icons/react/dist/csr/Minus';
import { Plus } from '@phosphor-icons/react/dist/csr/Plus';
import { Trash } from '@phosphor-icons/react/dist/csr/Trash';

export function CartItem({ id, productId, name, image, price, quantity, maxStock, disabled = false, onUpdateQuantity, onRemove }) {
  const [busy, setBusy] = useState(false);
  const update = async next => {
    setBusy(true);
    try { await onUpdateQuantity(id, next); } finally { setBusy(false); }
  };
  const remove = async () => {
    setBusy(true);
    try { await onRemove(id); } finally { setBusy(false); }
  };
  return <article aria-label={name} aria-busy={busy} className={'commerce-cart-item' + (busy ? ' commerce-cart-item-loading' : '')}>
    <Link to={'/product/' + productId} className="commerce-cart-item-image-link"><img className="commerce-cart-item-image" src={image || '/product-placeholder.svg'} alt={name} onError={e => { e.target.onerror = null; e.target.src = '/product-placeholder.svg'; }} /></Link>
    <div className="commerce-cart-item-details">
      <Link to={'/product/' + productId}><h3>{name}</h3></Link>
      <p className="commerce-cart-unit-price">{formatMoney(price)} <span>each</span></p>
      <div className="commerce-cart-item-controls">
        <div className="commerce-cart-quantity" role="group" aria-label={'Quantity for ' + name}>
          <button type="button" className="commerce-cart-decrease" title="Decrease quantity" aria-label={'Decrease quantity of ' + name} disabled={disabled || busy || quantity <= 1 || maxStock < 1}
            onClick={() => update(Math.min(quantity - 1, Math.max(maxStock, 1)))}><Minus size={18} weight="bold" aria-hidden="true" /></button>
          <output className="commerce-cart-quantity-value" aria-live="polite" aria-label={'Quantity of ' + name}>{quantity}</output>
          <button type="button" className="commerce-cart-increase" title="Increase quantity" aria-label={'Increase quantity of ' + name} disabled={disabled || busy || quantity >= maxStock}
            onClick={() => update(quantity + 1)}><Plus size={18} weight="bold" aria-hidden="true" /></button>
        </div>
        <button type="button" className="commerce-cart-remove" title="Remove item" disabled={disabled || busy} aria-label={'Remove ' + name + ' from cart'} onClick={remove}><Trash size={19} aria-hidden="true" /></button>
      </div>
      {maxStock < quantity && <p role="status">Only {maxStock} currently available. Update or remove this item.</p>}
    </div>
    <div className="commerce-cart-item-price-section">
      <p>Item total</p><strong>{formatMoney(Number(price) * quantity)}</strong>
    </div>
  </article>;
}
