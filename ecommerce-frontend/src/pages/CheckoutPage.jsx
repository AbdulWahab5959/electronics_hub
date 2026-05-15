// src/pages/CheckoutPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/common/ToastNotification';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { OrderSummary } from '../components/common/OrderSummary';
import { Button } from '../components/common/Button';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();
  const showToast = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Form state - Shipping Info
  const [shippingInfo, setShippingInfo] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    email: user?.email || '',
    phone: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'PK',
  });

  // Form state - Payment Info
  const [paymentInfo, setPaymentInfo] = useState({
    method: 'card',
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    saveCard: false,
  });

  // Billing info
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [billingInfo, setBillingInfo] = useState({ ...shippingInfo });

  // Form errors
  const [errors, setErrors] = useState({});

  // Redirect if cart is empty
  useEffect(() => {
    if (!isAuthenticated) {
      showToast('Please login to continue checkout', 'warning');
      navigate('/login');
      return;
    }
    if (cartItems.length === 0) {
      showToast('Your cart is empty', 'warning');
      navigate('/cart');
    }
  }, [cartItems, isAuthenticated, navigate]);

  // Calculate totals
  const subtotal = cartTotal;
  const shipping = subtotal > 100 ? 0 : 10;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  // Handle shipping form change
  const handleShippingChange = (e) => {
    setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  // Handle payment form change
  const handlePaymentChange = (e) => {
    setPaymentInfo({ ...paymentInfo, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  // Validate Step 1 - Shipping
  const validateStep1 = () => {
    const newErrors = {};
    if (!shippingInfo.firstName) newErrors.firstName = 'First name required';
    if (!shippingInfo.lastName) newErrors.lastName = 'Last name required';
    if (!shippingInfo.email) newErrors.email = 'Email required';
    if (!shippingInfo.phone) newErrors.phone = 'Phone required';
    if (!shippingInfo.address) newErrors.address = 'Address required';
    if (!shippingInfo.city) newErrors.city = 'City required';
    if (!shippingInfo.state) newErrors.state = 'State/Povince required';
    if (!shippingInfo.zipCode) newErrors.zipCode = 'ZIP code required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate Step 2 - Payment
  const validateStep2 = () => {
    if (paymentInfo.method === 'card') {
      const newErrors = {};
      if (!paymentInfo.cardName) newErrors.cardName = 'Name on card required';
      if (!paymentInfo.cardNumber) newErrors.cardNumber = 'Card number required';
      if (!paymentInfo.cardExpiry) newErrors.cardExpiry = 'Expiry date required';
      if (!paymentInfo.cardCvv) newErrors.cardCvv = 'CVV required';
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }
    return true;
  };

  // Handle next step
  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle back step
  const handleBack = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle place order
  const handlePlaceOrder = async () => {
    if (!validateStep2()) return;

    setIsProcessing(true);

    // Prepare order data
    const orderData = {
      order_number: 'ORD-' + Date.now(),
      customer: {
        name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
        email: shippingInfo.email,
        phone: shippingInfo.phone,
      },
      shipping_address: shippingInfo,
      billing_address: sameAsShipping ? shippingInfo : billingInfo,
      payment_method: paymentInfo.method,
      items: cartItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
      subtotal: subtotal,
      shipping: shipping,
      tax: tax,
      total: total,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    // Save order to localStorage (temporary - replace with API call)
    const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    existingOrders.unshift(orderData);
    localStorage.setItem('orders', JSON.stringify(existingOrders));

    // Simulate API call
    setTimeout(() => {
      clearCart();
      setIsProcessing(false);
      setOrderPlaced(true);
      
      // Store order confirmation data
      localStorage.setItem('lastOrder', JSON.stringify(orderData));
      
      showToast('Order placed successfully!', 'success');
      navigate('/order-success', { state: { order: orderData } });
    }, 2000);
  };

  // Format card number with spaces
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Format expiry date
  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + (v.length > 2 ? '/' + v.substring(2, 4) : '');
    }
    return v;
  };

  // Handle card number input
  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    setPaymentInfo({ ...paymentInfo, cardNumber: formatted });
  };

  // Handle expiry input
  const handleExpiryChange = (e) => {
    const formatted = formatExpiry(e.target.value);
    setPaymentInfo({ ...paymentInfo, cardExpiry: formatted });
  };

  if (orderPlaced) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="order-success">
            <div className="success-icon">✓</div>
            <h2>Order Placed Successfully!</h2>
            <p>Thank you for your purchase. You will receive a confirmation email shortly.</p>
            <Link to="/orders" className="btn-primary">View Orders</Link>
            <Link to="/shop" className="btn-secondary">Continue Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container">
        {/* Breadcrumb */}
        <Breadcrumb 
          items={[
            { name: 'Home', path: '/' },
            { name: 'Cart', path: '/cart' },
            { name: 'Checkout', path: '/checkout' }
          ]}
        />

        {/* Page Header */}
        <div className="checkout-header">
          <h1>Checkout</h1>
          <p>Complete your order</p>
        </div>

        {/* Progress Steps */}
        <div className="checkout-progress">
          <div className={`progress-step ${currentStep >= 1 ? 'active' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-label">Shipping</div>
          </div>
          <div className={`progress-line ${currentStep >= 2 ? 'active' : ''}`}></div>
          <div className={`progress-step ${currentStep >= 2 ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">Payment</div>
          </div>
          <div className={`progress-line ${currentStep >= 3 ? 'active' : ''}`}></div>
          <div className={`progress-step ${currentStep >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-label">Confirm</div>
          </div>
        </div>

        {/* Checkout Content */}
        <div className="checkout-content">
          {/* Form Section */}
          <div className="checkout-form-section">
            {/* Step 1 - Shipping Information */}
            {currentStep === 1 && (
              <div className="checkout-card">
                <h2>Shipping Information</h2>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={shippingInfo.firstName}
                      onChange={handleShippingChange}
                      className={errors.firstName ? 'error' : ''}
                    />
                    {errors.firstName && <span className="error-msg">{errors.firstName}</span>}
                  </div>
                  <div className="form-group">
                    <label>Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={shippingInfo.lastName}
                      onChange={handleShippingChange}
                      className={errors.lastName ? 'error' : ''}
                    />
                    {errors.lastName && <span className="error-msg">{errors.lastName}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={shippingInfo.email}
                      onChange={handleShippingChange}
                      className={errors.email ? 'error' : ''}
                    />
                    {errors.email && <span className="error-msg">{errors.email}</span>}
                  </div>
                  <div className="form-group">
                    <label>Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={shippingInfo.phone}
                      onChange={handleShippingChange}
                      placeholder="(123) 456-7890"
                      className={errors.phone ? 'error' : ''}
                    />
                    {errors.phone && <span className="error-msg">{errors.phone}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label>Street Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={shippingInfo.address}
                    onChange={handleShippingChange}
                    placeholder="House number and street name"
                    className={errors.address ? 'error' : ''}
                  />
                  {errors.address && <span className="error-msg">{errors.address}</span>}
                </div>

                <div className="form-group">
                  <label>Apartment, Suite, etc. (Optional)</label>
                  <input
                    type="text"
                    name="apartment"
                    value={shippingInfo.apartment}
                    onChange={handleShippingChange}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>City *</label>
                    <input
                      type="text"
                      name="city"
                      value={shippingInfo.city}
                      onChange={handleShippingChange}
                      className={errors.city ? 'error' : ''}
                    />
                    {errors.city && <span className="error-msg">{errors.city}</span>}
                  </div>
                  <div className="form-group">
                    <label>State/Province *</label>
                    <input
                      type="text"
                      name="state"
                      value={shippingInfo.state}
                      onChange={handleShippingChange}
                      className={errors.state ? 'error' : ''}
                    />
                    {errors.state && <span className="error-msg">{errors.state}</span>}
                  </div>
                  <div className="form-group">
                    <label>ZIP Code *</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={shippingInfo.zipCode}
                      onChange={handleShippingChange}
                      className={errors.zipCode ? 'error' : ''}
                    />
                    {errors.zipCode && <span className="error-msg">{errors.zipCode}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label>Country *</label>
                  <select name="country" value={shippingInfo.country} onChange={handleShippingChange}>
                    <option value="PK">Pakistan</option>
                    <option value="US">United States</option>
                    <option value="UK">United Kingdom</option>
                    <option value="CA">Canada</option>
                    <option value="AU">Australia</option>
                  </select>
                </div>

                <div className="form-actions">
                  <button className="btn-next" onClick={handleNext}>
                    Continue to Payment
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2 - Payment Information */}
            {currentStep === 2 && (
              <div className="checkout-card">
                <h2>Payment Method</h2>

                <div className="payment-methods">
                  <button
                    type="button"
                    className={`payment-tab ${paymentInfo.method === 'card' ? 'active' : ''}`}
                    onClick={() => setPaymentInfo({ ...paymentInfo, method: 'card' })}
                  >
                    💳 Credit Card
                  </button>
                  <button
                    type="button"
                    className={`payment-tab ${paymentInfo.method === 'paypal' ? 'active' : ''}`}
                    onClick={() => setPaymentInfo({ ...paymentInfo, method: 'paypal' })}
                  >
                    PayPal
                  </button>
                  <button
                    type="button"
                    className={`payment-tab ${paymentInfo.method === 'cod' ? 'active' : ''}`}
                    onClick={() => setPaymentInfo({ ...paymentInfo, method: 'cod' })}
                  >
                    Cash on Delivery
                  </button>
                </div>

                {paymentInfo.method === 'card' && (
                  <div className="card-payment-form">
                    <div className="form-group">
                      <label>Name on Card *</label>
                      <input
                        type="text"
                        name="cardName"
                        value={paymentInfo.cardName}
                        onChange={handlePaymentChange}
                        className={errors.cardName ? 'error' : ''}
                        placeholder="John Doe"
                      />
                      {errors.cardName && <span className="error-msg">{errors.cardName}</span>}
                    </div>

                    <div className="form-group">
                      <label>Card Number *</label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={paymentInfo.cardNumber}
                        onChange={handleCardNumberChange}
                        className={errors.cardNumber ? 'error' : ''}
                        placeholder="1234 5678 9012 3456"
                        maxLength="19"
                      />
                      {errors.cardNumber && <span className="error-msg">{errors.cardNumber}</span>}
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Expiry Date *</label>
                        <input
                          type="text"
                          name="cardExpiry"
                          value={paymentInfo.cardExpiry}
                          onChange={handleExpiryChange}
                          className={errors.cardExpiry ? 'error' : ''}
                          placeholder="MM/YY"
                          maxLength="5"
                        />
                        {errors.cardExpiry && <span className="error-msg">{errors.cardExpiry}</span>}
                      </div>
                      <div className="form-group">
                        <label>CVV *</label>
                        <input
                          type="text"
                          name="cardCvv"
                          value={paymentInfo.cardCvv}
                          onChange={handlePaymentChange}
                          className={errors.cardCvv ? 'error' : ''}
                          placeholder="123"
                          maxLength="4"
                        />
                        {errors.cardCvv && <span className="error-msg">{errors.cardCvv}</span>}
                      </div>
                    </div>

                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="saveCard"
                        checked={paymentInfo.saveCard}
                        onChange={(e) => setPaymentInfo({ ...paymentInfo, saveCard: e.target.checked })}
                      />
                      Save card for future purchases
                    </label>
                  </div>
                )}

                {paymentInfo.method === 'paypal' && (
                  <div className="payment-info-message">
                    <p>You will be redirected to PayPal to complete your payment.</p>
                  </div>
                )}

                {paymentInfo.method === 'cod' && (
                  <div className="payment-info-message">
                    <p>Pay with cash when you receive your order.</p>
                  </div>
                )}

                {/* Billing Address */}
                <div className="billing-section">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={sameAsShipping}
                      onChange={(e) => setSameAsShipping(e.target.checked)}
                    />
                    Billing address same as shipping
                  </label>

                  {!sameAsShipping && (
                    <div className="billing-form">
                      <h3>Billing Address</h3>
                      {/* Add billing address fields here - similar to shipping */}
                    </div>
                  )}
                </div>

                <div className="form-actions">
                  <button className="btn-back" onClick={handleBack}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                    Back
                  </button>
                  <button className="btn-next" onClick={handleNext}>
                    Review Order
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 - Order Review */}
            {currentStep === 3 && (
              <div className="checkout-card">
                <h2>Review Your Order</h2>
                
                <div className="order-review">
                  <div className="review-section">
                    <h3>Shipping Address</h3>
                    <p>
                      {shippingInfo.firstName} {shippingInfo.lastName}<br />
                      {shippingInfo.address}<br />
                      {shippingInfo.apartment && <>{shippingInfo.apartment}<br /></>}
                      {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}<br />
                      {shippingInfo.country}<br />
                      Phone: {shippingInfo.phone}<br />
                      Email: {shippingInfo.email}
                    </p>
                    <button className="edit-link" onClick={() => setCurrentStep(1)}>Edit</button>
                  </div>

                  <div className="review-section">
                    <h3>Payment Method</h3>
                    <p>
                      {paymentInfo.method === 'card' && 'Credit Card'}
                      {paymentInfo.method === 'paypal' && 'PayPal'}
                      {paymentInfo.method === 'cod' && 'Cash on Delivery'}
                    </p>
                    {paymentInfo.method === 'card' && (
                      <p>Card ending in {paymentInfo.cardNumber.slice(-4)}</p>
                    )}
                    <button className="edit-link" onClick={() => setCurrentStep(2)}>Edit</button>
                  </div>

                  <div className="review-section">
                    <h3>Items</h3>
                    <div className="review-items">
                      {cartItems.map((item, idx) => (
                        <div key={idx} className="review-item">
                          <div className="review-item-info">
                            <span className="item-quantity">{item.quantity}×</span>
                            <span className="item-name">{item.name}</span>
                          </div>
                          <span className="item-price">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <button className="edit-link" onClick={() => navigate('/cart')}>Edit</button>
                  </div>
                </div>

                <div className="order-total-review">
                  <div className="total-row">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="total-row">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="total-row">
                    <span>Tax (8%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="total-row grand-total">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="form-actions">
                  <button className="btn-back" onClick={handleBack}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                    Back
                  </button>
                  <button className="btn-place-order" onClick={handlePlaceOrder} disabled={isProcessing}>
                    {isProcessing ? (
                      <>
                        <span className="btn-spinner"></span>
                        Processing...
                      </>
                    ) : (
                      `Place Order • $${total.toFixed(2)}`
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="checkout-summary-section">
            <OrderSummary
              subtotal={subtotal}
              shipping={shipping}
              tax={8}
              items={cartItems.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity
              }))}
              onCheckout={() => {}}
              showActions={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}