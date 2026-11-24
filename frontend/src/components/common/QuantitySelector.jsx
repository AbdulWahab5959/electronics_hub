import { useId, useState } from 'react';

export function QuantitySelector({ initialQuantity = 1, min = 1, max = 99, size = 'md', showLabel = false, labelText = 'Quantity', onChange, disabled = false, stockAvailable = null }) {
  const id = useId();
  const limit = Math.max(min, Math.min(max, stockAvailable ?? max));
  const [quantity, setQuantity] = useState(String(initialQuantity));
  function commit(value) {
    const next = Math.min(limit, Math.max(min, Math.trunc(Number(value)) || min));
    setQuantity(String(next)); onChange?.(next);
  }
  return <div className={`quantity-selector-premium qs-${size}`}>
    {showLabel && <label className="qs-label" htmlFor={id}>{labelText}</label>}
    <div className="qs-controls">
      <button type="button" className="qs-btn" aria-label="Decrease quantity" disabled={disabled || Number(quantity) <= min} onClick={() => commit(Number(quantity) - 1)}>−</button>
      <input id={id} className="qs-input" type="number" inputMode="numeric" aria-label={showLabel ? undefined : labelText} min={min} max={limit} step="1" value={quantity} disabled={disabled} onChange={e => { setQuantity(e.target.value); const n = Number(e.target.value); if (e.target.value && Number.isInteger(n) && n >= min && n <= limit) onChange?.(n); }} onBlur={() => commit(quantity)} onKeyDown={e => { if (e.key === 'Enter') commit(quantity); }} />
      <button type="button" className="qs-btn" aria-label="Increase quantity" disabled={disabled || Number(quantity) >= limit} onClick={() => commit(Number(quantity) + 1)}>+</button>
    </div>
  </div>;
}
