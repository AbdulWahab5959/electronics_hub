import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin } from '@phosphor-icons/react/dist/csr/MapPin';
import { Money } from '@phosphor-icons/react/dist/csr/Money';
import { ClipboardText } from '@phosphor-icons/react/dist/csr/ClipboardText';
import { Check } from '@phosphor-icons/react/dist/csr/Check';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { getAddresses } from '../services/user';
import { createOrder, getCheckoutQuote } from '../services/order';
import { OrderSummary } from '../components/common/OrderSummary';
import { formatMoney } from '../utils/money';
import { shippingFields, normalizeShipping, validateShipping, isQuoteExpired, shippingErrorsFromApi } from '../utils/checkout';

const steps = [
  { label: 'Shipping', title: 'Shipping information', description: 'Where should we deliver your order?', Icon: MapPin },
  { label: 'Payment', title: 'Payment method', description: 'Choose how you’ll pay for your order.', Icon: Money },
  { label: 'Review', title: 'Review your order', description: 'Check your details and the final total before placing your order.', Icon: ClipboardText },
];

export default function CheckoutPage() {
  const { user } = useAuth();
  const { cartItems, isLoading: cartLoading, error: cartError, fetchCart } = useCart();
  const navigate = useNavigate();
  const [shipping, setShipping] = useState({ fullName: user?.name || '', email: user?.email || '', phone: user?.phone || '', address: '', apartment: '', city: '', state: '', zipCode: '', country: 'PK' });
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [step, setStep] = useState(1);
  const [quote, setQuote] = useState(null);
  const [clock, setClock] = useState(() => Date.now());
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const request = useRef(null);
  const submitting = useRef(false);
  const confirming = useRef(false);
  const formRef = useRef(null);
  const headingRef = useRef(null);
  const progressRef = useRef(null);
  const errorRef = useRef(null);
  const previousStep = useRef(1);
  const expired = isQuoteExpired(quote, clock);
  const paymentAvailable = quote?.payment_methods?.includes('cod');
  const { title, description, Icon } = steps[step - 1];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const controller = new AbortController();
    getAddresses({ signal: controller.signal }).then(response => {
      const addresses = response.data.data;
      const valid = addresses.filter(item => ['PK', 'Pakistan'].includes(item.country));
      const address = valid.find(item => item.is_default) || valid[0];
      if (address && !controller.signal.aborted) setShipping(previous => ({ ...previous, address: address.address || '', city: address.city || '', state: address.state || '', zipCode: address.zip_code || '', country: 'PK' }));
    }).catch(() => { /* A saved address is optional. */ }).finally(() => { if (!controller.signal.aborted) setProfileLoaded(true); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!quote) return;
    const expiry = Date.parse(quote.expires_at);
    const timer = setTimeout(() => setClock(Date.now()), Math.max(0, (Number.isFinite(expiry) ? expiry : 0) - Date.now() + 50));
    return () => clearTimeout(timer);
  }, [quote]);

  useEffect(() => {
    if (previousStep.current !== step) {
      headingRef.current?.focus({ preventScroll: true });
      progressRef.current?.scrollIntoView({ behavior: 'instant', block: 'start' });
      previousStep.current = step;
    }
  }, [step]);

  function focusError() { requestAnimationFrame(() => errorRef.current?.focus()); }
  function focusField(name) { requestAnimationFrame(() => formRef.current?.elements.namedItem(name)?.focus()); }

  async function confirmPrices() {
    if (confirming.current) return false;
    confirming.current = true; setProcessing(true); setError('');
    try {
      const response = await getCheckoutQuote();
      setQuote(response.data.data); return true;
    } catch (failure) {
      setError(failure.response?.data?.message || 'Could not confirm prices and availability. Please retry.');
      focusError(); return false;
    } finally { confirming.current = false; setProcessing(false); }
  }

  async function review(event) {
    event.preventDefault();
    if (processing) return;
    if (step === 2) { if (!expired && paymentAvailable) { setError(''); setStep(3); } return; }
    const invalid = validateShipping(shipping);
    setFieldErrors(invalid);
    if (Object.keys(invalid).length) { focusField(Object.keys(invalid)[0]); return; }
    setShipping(normalizeShipping(shipping));
    if (await confirmPrices()) setStep(2);
  }

  async function placeOrder(event) {
    event.preventDefault();
    if (submitting.current || (!quote && !request.current) || (expired && !request.current)) return;
    submitting.current = true; setProcessing(true); setError('');
    request.current ??= { idempotency_key: crypto.randomUUID(), quote_token: quote.quote_token, shipping_address: { ...shipping }, payment_method: 'cod' };
    setHasPendingRequest(true);
    try {
      const response = await createOrder(request.current);
      const order = response.data.data;
      await fetchCart();
      navigate('/order-success?order=' + encodeURIComponent(order.order_number), { state: { order }, replace: true });
    } catch (failure) {
      const status = failure.response?.status;
      const errors = failure.response?.data?.errors || {};
      setFieldErrors(shippingErrorsFromApi(errors));
      setError(Object.values(errors).flat()[0] || failure.response?.data?.message || 'We couldn’t confirm the result. Retry the same order request, or check My Orders before starting another order.');
      if ([400, 401, 403, 409, 422, 503].includes(status)) {
        request.current = null; setHasPendingRequest(false); setQuote(null); setStep(1);
        void fetchCart();
      }
      focusError();
    } finally { submitting.current = false; setProcessing(false); }
  }

  if (cartLoading || !profileLoaded) return <div className="commerce-state" role="status">Loading checkout…</div>;
  if (cartError && !hasPendingRequest) return <div className="commerce-state" role="alert"><h1>Could not load checkout</h1><p>{cartError}</p><Link className="commerce-primary" to="/cart">Return to cart</Link></div>;
  if (!cartItems.length && !hasPendingRequest) return <div className="commerce-state"><h1>Your cart is empty</h1><p>Add something to your cart to get started, or check your recent orders.</p><Link className="commerce-primary" to="/shop">Continue shopping</Link><Link className="flow-state-link" to="/orders">My Orders</Link></div>;

  return <div className="store-checkout"><div className="flow-container">
    <Breadcrumb items={[{ name: 'Home', path: '/' }, { name: 'Cart', path: '/cart' }, { name: 'Checkout' }]} />
    <header className="flow-header"><div><p className="commerce-eyebrow">COMPLETE YOUR ORDER</p><h1>Checkout</h1><p>Delivery details, payment, and a final check.</p></div><Link to="/cart">Return to cart</Link></header>
    <nav ref={progressRef} aria-label="Checkout progress" className="flow-progress"><ol>{steps.map((item, index) => <li key={item.label} className={step === index + 1 ? 'active' : step > index + 1 ? 'complete' : ''} aria-current={step === index + 1 ? 'step' : undefined}><span className="flow-step-number" aria-hidden="true">{step > index + 1 ? <Check size={18} weight="bold" /> : index + 1}</span><span><span className="flow-step-kicker">Step {index + 1}</span>{item.label}</span></li>)}</ol></nav>
    <div className="flow-content">
      <form ref={formRef} className="flow-panel" aria-labelledby="checkout-step-title" onSubmit={step === 3 ? placeOrder : review}>
        <div className="flow-panel-heading"><span className="flow-panel-icon"><Icon size={23} aria-hidden="true" /></span><div><h2 ref={headingRef} tabIndex={-1} id="checkout-step-title">{title}</h2><p>{description}</p></div></div>
        {error && <div ref={errorRef} tabIndex={-1} className="flow-error" role="alert">{error}{hasPendingRequest && <p><Link to="/orders">Check My Orders</Link> if you’re unsure whether the order was received.</p>}</div>}
        {expired && !hasPendingRequest && <div className="flow-notice" role="status"><p>The price confirmation has expired. Refresh prices and stock before continuing.</p><button type="button" className="flow-button secondary" disabled={processing} onClick={confirmPrices}>Refresh prices</button></div>}
        <fieldset disabled={processing || hasPendingRequest}>
          <legend className="visually-hidden">{title}</legend>
          {step === 1 && <><div className="flow-fields">{shippingFields.map(field => <div className={'flow-field' + (field.wide ? ' wide' : '')} key={field.name}><label htmlFor={'checkout-' + field.name}>{field.label} {field.required ? <span aria-hidden="true">*</span> : <span className="flow-optional">(optional)</span>}</label><input id={'checkout-' + field.name} name={field.name} type={field.type} autoComplete={'shipping ' + field.autoComplete} required={field.required} maxLength={field.max} value={shipping[field.name]} aria-invalid={Boolean(fieldErrors[field.name])} aria-describedby={fieldErrors[field.name] ? 'checkout-error-' + field.name : undefined} onChange={event => { setShipping(previous => ({ ...previous, [field.name]: event.target.value })); setFieldErrors(previous => ({ ...previous, [field.name]: '' })); }} />{fieldErrors[field.name] && <span id={'checkout-error-' + field.name} className="flow-field-error">{fieldErrors[field.name]}</span>}</div>)}</div><p className="flow-country"><MapPin size={17} aria-hidden="true" />Delivering within <strong>Pakistan</strong></p><p className="flow-helper">We’ll check current prices and stock before you review your order. Fields marked * are required.</p></>}
          {step === 2 && <><label className="flow-payment-option" htmlFor="checkout-cod"><input id="checkout-cod" type="radio" name="payment_method" value="cod" checked readOnly disabled={!paymentAvailable} /><span><strong>Cash on delivery</strong><span>Pay {formatMoney(quote.total)} when you receive your order.</span></span><Money size={27} aria-hidden="true" /></label><p className="flow-helper">No online payment is collected. Card and wallet payments are not available.</p>{!paymentAvailable && <p className="flow-error" role="alert">Cash on delivery is unavailable. Please return to your cart and try again.</p>}</>}
          {step === 3 && <div className="flow-review"><section><div className="flow-review-heading"><h3>Deliver to</h3><button type="button" onClick={() => setStep(1)}>Edit shipping</button></div><address><strong>{shipping.fullName}</strong><span>{shipping.address}</span>{shipping.apartment && <span>{shipping.apartment}</span>}<span>{shipping.city}, {shipping.state}{shipping.zipCode ? ' ' + shipping.zipCode : ''}</span><span>Pakistan</span></address><p>{shipping.phone}<br />{shipping.email}</p></section><section><div className="flow-review-heading"><h3>Payment method</h3><button type="button" onClick={() => setStep(2)}>Edit payment</button></div><p>Cash on delivery</p><p className="flow-helper">No payment has been collected. Amount due on delivery: <strong>{formatMoney(quote.total)}</strong>.</p></section><p className="flow-quote-valid">Prices confirmed until {new Date(quote.expires_at).toLocaleTimeString('en-PK', { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Karachi' })} PKT. Stock is checked again when you place the order.</p></div>}
        </fieldset>
        {step === 3 && <div className="flow-mobile-review-summary"><OrderSummary classPrefix="flow-" showImages quote={quote} items={quote.items} /></div>}
        <div className="flow-form-actions">{step > 1 && <button type="button" className="flow-button secondary" disabled={processing || hasPendingRequest} onClick={() => { setError(''); setStep(step - 1); }}>Back</button>}<button type="submit" className="flow-button primary" disabled={processing || (!hasPendingRequest && step > 1 && (expired || !paymentAvailable))}>{processing ? 'Please wait…' : hasPendingRequest ? 'Retry the same order request' : step === 1 ? 'Confirm prices & continue' : step === 2 ? 'Review order' : 'Place COD order — ' + formatMoney(quote.total)}</button></div>
        <p className="flow-final-note">{step === 3 ? 'Placing this order confirms a cash-on-delivery purchase.' : 'You can review everything before placing your order.'}</p>
      </form>
      <aside className={'flow-summary' + (step === 3 ? ' review-step' : '')}><OrderSummary classPrefix="flow-" showImages quote={quote} items={quote?.items || cartItems} subtotal={cartItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)} /><p className="flow-summary-help">Need to change a product or quantity? <Link to="/cart">Edit your cart</Link>.</p></aside>
    </div>
  </div></div>;
}
