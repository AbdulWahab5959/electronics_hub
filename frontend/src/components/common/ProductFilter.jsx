import { useEffect, useId, useRef, useState } from 'react';
import { CaretDown } from '@phosphor-icons/react/dist/csr/CaretDown';
import { X } from '@phosphor-icons/react/dist/csr/X';

export function ProductFilter({ onFilterChange, initialFilters, categories = [], brands = [], priceRange, showMobile = false, onCloseMobile }) {
  const id = useId();
  const dialogRef = useRef(null);
  const [draft, setDraft] = useState(initialFilters);
  const [categoryLimit, setCategoryLimit] = useState(6);
  const [brandLimit, setBrandLimit] = useState(6);
  const [brandSearch, setBrandSearch] = useState('');
  const [priceError, setPriceError] = useState('');
  const minRef = useRef(null);
  const maxRef = useRef(null);

  useEffect(() => {
    if (!showMobile) return;
    const dialog = dialogRef.current;
    if (!dialog.open) dialog.showModal();
    // Removing the dialog releases the top layer. Closing it in effect cleanup
    // would queue a close event during StrictMode's setup check and dismiss it.

  }, [showMobile]);

  const toggle = (field, value) => setDraft(previous => ({ ...previous,
    [field]: previous[field].includes(value) ? previous[field].filter(item => item !== value) : [...previous[field], value],
  }));
  const clear = () => {
    const cleared = { categories: [], brands: [], priceMin: 0, priceMax: priceRange.max, rating: 0, inStock: false, onSale: false };
    setDraft(cleared);
    setBrandSearch('');
    setPriceError('');
    onFilterChange(cleared);
  };
  const apply = event => {
    event.preventDefault();
    const min = Number(draft.priceMin);
    const max = Number(draft.priceMax);
    if (min > max) {
      setPriceError('Minimum price must be less than or equal to maximum price.');
      minRef.current.focus();
      return;
    }
    onFilterChange({ ...draft, priceMin: min, priceMax: max });
  };
  const updatePrice = (field, value) => {
    setPriceError('');
    setDraft(previous => ({ ...previous, [field]: value }));
  };
  const matches = brands.filter(brand => brand.name.toLowerCase().includes(brandSearch.trim().toLowerCase()));
  const section = (title, children, open = false) => <details className="shop-filter-section" open={open || undefined}>
    <summary>{title}<CaretDown size={16} aria-hidden="true" /></summary>
    <div className="shop-filter-section-body">{children}</div>
  </details>;
  const options = (items, field, limit) => items.filter((item, index) => index < limit || draft[field].includes(item.name)).map(item => (
    <label className="shop-filter-option" key={item.name}>
      <input name={field} type="checkbox" value={item.name} checked={draft[field].includes(item.name)} onChange={() => toggle(field, item.name)} />
      <span>{item.name}</span><span className="shop-filter-count">{item.count}</span>
    </label>
  ));
  const form = <form className="shop-filter-form" aria-labelledby={`${id}-heading`} action="/shop" method="get" onSubmit={apply}>
    <header className="shop-filter-heading">
      <h2 id={`${id}-heading`}>Filters</h2>
      {showMobile ? <button type="button" className="shop-filter-close" aria-label="Close filters" autoFocus onClick={() => dialogRef.current.close()}><X size={20} /></button>
        : <button type="button" className="shop-filter-text-button" onClick={clear}>Reset</button>}
    </header>
    <div className="shop-filter-body">
      {section('Categories', <>
        {options(categories, 'categories', categoryLimit)}
        {categories.length > 6 && <button className="shop-filter-text-button" type="button" aria-expanded={categoryLimit > 6} onClick={() => setCategoryLimit(limit => limit === 6 ? categories.length : 6)}>
          {categoryLimit === 6 ? `Show all ${categories.length} categories` : 'Show fewer categories'}
        </button>}
      </>, true)}
      {section('Price range', <>
        <p className="shop-price-hint">Prices in Pakistani rupees (PKR)</p>
        <div className="shop-price-inputs">
          <label htmlFor={`${id}-min`}>Min (Rs)
            <input ref={minRef} id={`${id}-min`} name="price_min" type="number" inputMode="decimal" min="0" max={Math.max(priceRange.max, Number(draft.priceMax) || 0)} step="0.01" required value={draft.priceMin}
              aria-invalid={Boolean(priceError)} aria-describedby={priceError ? `${id}-price-error` : undefined} onChange={event => updatePrice('priceMin', event.target.value)} />
          </label>
          <label htmlFor={`${id}-max`}>Max (Rs)
            <input ref={maxRef} id={`${id}-max`} name="price_max" type="number" inputMode="decimal" min="0" step="0.01" required value={draft.priceMax}
              aria-invalid={Boolean(priceError)} aria-describedby={priceError ? `${id}-price-error` : undefined} onChange={event => updatePrice('priceMax', event.target.value)} />
          </label>
        </div>
        <label className="shop-price-slider-label" htmlFor={`${id}-slider`}>Maximum price <span>Rs {Number(draft.priceMax || 0).toLocaleString('en-PK')}</span></label>
        <input className="shop-price-slider" id={`${id}-slider`} name="price_slider" type="range" min="0" max={Math.max(priceRange.max, Number(draft.priceMax) || 0)} step="0.01" value={draft.priceMax || 0}
          onChange={event => updatePrice('priceMax', event.target.value)} />
        {priceError && <p className="shop-filter-error" id={`${id}-price-error`} role="alert">{priceError}</p>}
      </>, true)}
      {section('Brand', <>
        <label className="shop-brand-search" htmlFor={`${id}-brand-search`}>Find a brand
          <input id={`${id}-brand-search`} name="brand_search" type="search" placeholder="Search brands" value={brandSearch} onChange={event => { setBrandSearch(event.target.value); setBrandLimit(6); }} />
        </label>
        {options(matches, 'brands', brandLimit)}
        {matches.length === 0 && <p className="shop-price-hint">No matching brands.</p>}
        {matches.length > 6 && <button className="shop-filter-text-button" type="button" aria-expanded={brandLimit > 6} onClick={() => setBrandLimit(limit => limit === 6 ? matches.length : 6)}>
          {brandLimit === 6 ? `Show all ${matches.length} brands` : 'Show fewer brands'}
        </button>}
      </>)}
      {section('Customer rating', <fieldset className="shop-rating-options">
        <legend className="visually-hidden">Minimum customer rating</legend>
        {[0, 4, 3, 2, 1].map(rating => <label className="shop-filter-option" key={rating}>
          <input type="radio" name={`${id}-rating`} value={rating} checked={draft.rating === rating} onChange={() => setDraft(previous => ({ ...previous, rating }))} />
          <span>{rating ? `${rating} stars & up` : 'Any rating'}</span>
        </label>)}
      </fieldset>)}
      {section('Availability', <>
        <label className="shop-filter-option"><input name="inStock" type="checkbox" checked={draft.inStock} onChange={event => setDraft(previous => ({ ...previous, inStock: event.target.checked }))} /><span>In stock only</span></label>
        <label className="shop-filter-option"><input name="onSale" type="checkbox" checked={draft.onSale} onChange={event => setDraft(previous => ({ ...previous, onSale: event.target.checked }))} /><span>On sale</span></label>
      </>)}
    </div>
    <footer className="shop-filter-actions">
      {showMobile && <button type="button" className="shop-filter-reset" onClick={clear}>Reset</button>}
      <button type="submit" className="shop-filter-apply">Apply filters</button>
    </footer>
  </form>;
  return showMobile ? <dialog ref={dialogRef} className="shop-filter-dialog" aria-labelledby={`${id}-heading`} closedby="any" onClose={onCloseMobile}>{form}</dialog>
    : <search className="shop-filter-panel" aria-label="Filter products">{form}</search>;
}
