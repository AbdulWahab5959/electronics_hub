// src/components/checkout/CheckoutForm.jsx
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

export const CheckoutForm = ({ 
  cartTotal = 0,
  onSubmit,
  isLoading = false 
}) => {
  const { user } = useAuth();
  
  // Form state
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Shipping Info
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    email: user?.email || '',
    phone: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    
    // Payment Info
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    saveCard: false,
    
    // Billing
    sameAsShipping: true,
    billingAddress: {},
  });
  
  const [errors, setErrors] = useState({});
  const [paymentMethod, setPaymentMethod] = useState('card');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = 'First name required';
    if (!formData.lastName) newErrors.lastName = 'Last name required';
    if (!formData.email) newErrors.email = 'Email required';
    if (!formData.phone) newErrors.phone = 'Phone required';
    if (!formData.address) newErrors.address = 'Address required';
    if (!formData.city) newErrors.city = 'City required';
    if (!formData.state) newErrors.state = 'State required';
    if (!formData.zipCode) newErrors.zipCode = 'ZIP code required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    if (paymentMethod === 'card') {
      const newErrors = {};
      if (!formData.cardName) newErrors.cardName = 'Name on card required';
      if (!formData.cardNumber) newErrors.cardNumber = 'Card number required';
      if (!formData.cardExpiry) newErrors.cardExpiry = 'Expiry date required';
      if (!formData.cardCvv) newErrors.cardCvv = 'CVV required';
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateStep2()) {
      await onSubmit(formData, paymentMethod);
    }
  };

  return (
    <form className="checkout-form" onSubmit={handleSubmit}>
      {/* Progress Steps */}
      <div className="checkout-steps">
        <div className={`step ${step >= 1 ? 'active' : ''}`}>
          <div className="step-number">1</div>
          <div className="step-label">Shipping</div>
        </div>
        <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
        <div className={`step ${step >= 2 ? 'active' : ''}`}>
          <div className="step-number">2</div>
          <div className="step-label">Payment</div>
        </div>
      </div>

      {/* Step 1: Shipping Information */}
      {step === 1 && (
        <div className="checkout-section">
          <h3 className="section-title">Shipping Information</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>First Name *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={errors.firstName ? 'error' : ''}
              />
              {errors.firstName && <span className="error-msg">{errors.firstName}</span>}
            </div>
            
            <div className="form-group">
              <label>Last Name *</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
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
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-msg">{errors.email}</span>}
            </div>
            
            <div className="form-group">
              <label>Phone *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={errors.phone ? 'error' : ''}
                placeholder="(123) 456-7890"
              />
              {errors.phone && <span className="error-msg">{errors.phone}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Street Address *</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={errors.address ? 'error' : ''}
              placeholder="House number and street name"
            />
            {errors.address && <span className="error-msg">{errors.address}</span>}
          </div>

          <div className="form-group">
            <label>Apartment, Suite, etc. (Optional)</label>
            <input
              type="text"
              name="apartment"
              value={formData.apartment}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>City *</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className={errors.city ? 'error' : ''}
              />
              {errors.city && <span className="error-msg">{errors.city}</span>}
            </div>
            
            <div className="form-group">
              <label>State *</label>
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                className={errors.state ? 'error' : ''}
              >
                <option value="">Select State</option>
                <option value="CA">California</option>
                <option value="TX">Texas</option>
                <option value="NY">New York</option>
                <option value="FL">Florida</option>
              </select>
              {errors.state && <span className="error-msg">{errors.state}</span>}
            </div>
            
            <div className="form-group">
              <label>ZIP Code *</label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                className={errors.zipCode ? 'error' : ''}
              />
              {errors.zipCode && <span className="error-msg">{errors.zipCode}</span>}
            </div>
          </div>

          <button type="button" className="btn-next" onClick={handleNext}>
            Continue to Payment
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      )}

      {/* Step 2: Payment Information */}
      {step === 2 && (
        <div className="checkout-section">
          <h3 className="section-title">Payment Method</h3>
          
          {/* Payment Method Tabs */}
          <div className="payment-methods">
            <button
              type="button"
              className={`payment-tab ${paymentMethod === 'card' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('card')}
            >
              💳 Credit Card
            </button>
            <button
              type="button"
              className={`payment-tab ${paymentMethod === 'paypal' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('paypal')}
            >
              PayPal
            </button>
          </div>

          {paymentMethod === 'card' && (
            <div className="payment-section">
              <div className="form-group">
                <label>Name on Card *</label>
                <input
                  type="text"
                  name="cardName"
                  value={formData.cardName}
                  onChange={handleChange}
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
                  value={formData.cardNumber}
                  onChange={handleChange}
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
                    value={formData.cardExpiry}
                    onChange={handleChange}
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
                    value={formData.cardCvv}
                    onChange={handleChange}
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
                  checked={formData.saveCard}
                  onChange={(e) => setFormData({ ...formData, saveCard: e.target.checked })}
                />
                Save card for future purchases
              </label>
            </div>
          )}

          {paymentMethod === 'paypal' && (
            <div className="payment-section paypal-section">
              <p>You will be redirected to PayPal to complete your payment.</p>
            </div>
          )}

          <div className="order-total-preview">
            <div className="total-row">
              <span>Total Amount:</span>
              <span className="total-price">${cartTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-back" onClick={handleBack}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back
            </button>
            
            <button type="submit" className="btn-place-order" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="spinner-small"></span>
                  Processing...
                </>
              ) : (
                `Place Order • $${cartTotal.toFixed(2)}`
              )}
            </button>
          </div>
        </div>
      )}
    </form>
  );
};

