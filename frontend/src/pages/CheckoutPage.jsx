import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { getAddresses } from '../services/user';
import { createOrder, getCheckoutQuote } from '../services/order';
import { OrderSummary } from '../components/common/OrderSummary';
import { formatMoney } from '../utils/money';

const fields = [
  ['fullName', 'Full name', 'text', 'name', true],
  ['email', 'Email', 'email', 'email', true],
  ['phone', 'Phone', 'tel', 'tel', true],
  ['address', 'Street address', 'text', 'address-line1', true],
  ['apartment', 'Apartment / landmark', 'text', 'address-line2', false],
  ['city', 'City', 'text', 'address-level2', true],
  ['state', 'Province / region', 'text', 'address-level1', true],
  ['zipCode', 'Postal code (optional)', 'text', 'postal-code', false],
];

export default function CheckoutPage() {
  const { user } = useAuth();
  const { cartItems, isLoading: cartLoading, error: cartError, fetchCart } = useCart();
  const navigate = useNavigate();
  const [shipping, setShipping] = useState({
    fullName: user?.name || '', email: user?.email || '', phone: user?.phone || '',
    address: '', apartment: '', city: '', state: '', zipCode: '', country: 'PK',
  });
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [step, setStep] = useState(1);
  const [quote, setQuote] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const request = useRef(null);
  const submitting = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    getAddresses({ signal: controller.signal }).then(response => {
      const addresses = response.data.data;
      const address = addresses.find(item => item.is_default) || addresses[0];
      if (address && !controller.signal.aborted) setShipping(previous => ({
        ...previous, address: address.address, city: address.city, state: address.state,
        zipCode: address.zip_code || '', country: 'PK',
      }));
    }).catch(() => {
      // A saved address is optional; the customer can enter one below.
    }).finally(() => {
      if (!controller.signal.aborted) setProfileLoaded(true);
    });
    return () => controller.abort();
  }, []);

  const review = async event => {
    event.preventDefault();
    if (processing) return;
    setError('');
    if (step === 2) { setStep(3); return; }
    setProcessing(true);
    try {
      const response = await getCheckoutQuote();
      setQuote(response.data.data);
      setStep(2);
    } catch (failure) {
      setError(failure.response?.data?.message || 'Could not confirm your cart. Please retry.');
    } finally { setProcessing(false); }
  };

  const placeOrder = async event => {
    event.preventDefault();
    if (submitting.current) return;
    if (!quote && !request.current) return;
    submitting.current = true;
    setProcessing(true);
    setError('');
    request.current ??= {
      idempotency_key: crypto.randomUUID(),
      quote_token: quote.quote_token,
      shipping_address: { ...shipping },
      payment_method: 'cod',
    };
    setHasPendingRequest(true);
    try {
      const response = await createOrder(request.current);
      const order = response.data.data;
      // The backend cleared exactly the committed cart in its transaction.
      await fetchCart();
      navigate('/order-success?order=' + encodeURIComponent(order.order_number), { state: { order }, replace: true });
    } catch (failure) {
      const status = failure.response?.status;
      const fields = Object.values(failure.response?.data?.errors || {}).flat();
      setError(fields[0] || failure.response?.data?.message || 'The result is uncertain. Retry this same request or check My Orders before placing another order.');
      if ([400, 401, 403, 409, 422, 503].includes(status)) {
        request.current = null;
        setHasPendingRequest(false);
        setQuote(null);
        setStep(1);
        void fetchCart();
      }
      // Network/500 errors preserve the exact request/key for safe retries.
    } finally {
      submitting.current = false;
      setProcessing(false);
    }
  };

  if (cartLoading || !profileLoaded) return <div className="container" role="status">Loading checkout…</div>;
  if (cartError && !hasPendingRequest) return <div className="container" role="alert">
    <p>{cartError}</p><Link to="/cart">Return to cart</Link>
  </div>;
  if (!cartItems.length && !hasPendingRequest) return <div className="container">
    <h1>Your cart is empty</h1><Link to="/orders">Check My Orders</Link> · <Link to="/shop">Continue shopping</Link>
  </div>;

  return <div className="checkout-page"><div className="container">
    <h1>Checkout</h1>
    <nav aria-label="Checkout progress"><ol className="checkout-steps">
      {['Shipping', 'Payment', 'Review'].map((label, index) =>
        <li key={label} aria-current={step === index + 1 ? 'step' : undefined}>{index + 1}. {label}</li>)}
    </ol></nav>
    {error && <div className="alert-error" role="alert">{error}</div>}
    <div className="checkout-content">
      <form className="checkout-card" onSubmit={step === 3 ? placeOrder : review}>
        <fieldset disabled={processing || hasPendingRequest}>
          <legend>{step === 1 ? 'Shipping information' : step === 2 ? 'Payment method' : 'Review your order'}</legend>
          {step === 1 && <>
            {fields.map(([name, label, type, autoComplete, required]) => <div className="form-group" key={name}>
              <label htmlFor={'checkout-' + name}>{label}{required ? ' *' : ''}</label>
              <input id={'checkout-' + name} name={name} type={type} autoComplete={'shipping ' + autoComplete}
                required={required} maxLength={name === 'address' ? 500 : name === 'phone' ? 30 : name === 'zipCode' ? 20 : 255}
                value={shipping[name]} onChange={event => setShipping(previous => ({ ...previous, [name]: event.target.value }))} />
            </div>)}
            <p>Country: Pakistan</p>
          </>}
          {step === 2 && <div className="payment-info-message">
            <label><input type="radio" name="payment_method" value="cod" checked readOnly /> Cash on delivery</label>
            <p>Pay the confirmed amount when you receive your order. Online payments are not currently available.</p>
          </div>}
          {step === 3 && <>
            <h2>Deliver to</h2>
            <p>{shipping.fullName}<br />{shipping.address}<br />{shipping.apartment}
              <br />{shipping.city}, {shipping.state} {shipping.zipCode}<br />{shipping.phone}<br />{shipping.email}</p>
            <h2>Payment</h2><p>Cash on delivery — payment has not been collected.</p>
            <p>Quote expires at {new Date(quote.expires_at).toLocaleTimeString()}.</p>
          </>}
        </fieldset>
        <div className="form-actions">
          {step > 1 && <button type="button" className="btn-back" disabled={processing || hasPendingRequest} onClick={() => setStep(step - 1)}>Back</button>}
          <button type="submit" className="btn-next" disabled={processing}>
            {processing ? 'Please wait…' : hasPendingRequest ? 'Retry the same order request' : step === 1 ? 'Confirm availability and price' : step === 2 ? 'Review order' : 'Place COD order — ' + formatMoney(quote.total)}
          </button>
        </div>
        <Link to="/orders">My Orders</Link> · <Link to="/cart">Return to cart</Link>
      </form>
      <aside><OrderSummary quote={quote} items={quote?.items || cartItems} subtotal={cartItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)} /></aside>
    </div>
  </div></div>;
}
