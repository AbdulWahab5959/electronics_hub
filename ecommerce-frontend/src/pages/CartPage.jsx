// src/pages/CartPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartItem } from '../components/common/CartItem';
import { OrderSummary } from '../components/common/OrderSummary';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { Button } from '../components/common/Button';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/ui/ToastNotification';

export default function CartPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const showToast = useToast();
  
  const {
    cartItems,
    cartCount,
    cartTotal,
    updateQuantity,
    removeFromCart,
    clearCart,
    addToWishlist
  } = useCart();

  const [isLoading, setIsLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Handle quantity update
  const handleUpdateQuantity = async (productId, newQuantity) => {
    setIsLoading(true);
    await updateQuantity(productId, newQuantity);
    setIsLoading(false);
  };

  // Handle remove item
  const handleRemoveItem = async (productId) => {
    setIsLoading(true);
    await removeFromCart(productId);
    showToast('Item removed from cart', 'info');
    setIsLoading(false);
  };

  // Handle move to wishlist
  const handleMoveToWishlist = async (productId) => {
    setIsLoading(true);
    const product = cartItems.find(item => item.id === productId);
    if (product) {
      await addToWishlist(product);
      await removeFromCart(productId);
      showToast('Moved to wishlist', 'success');
    }
    setIsLoading(false);
  };

  // Apply coupon code
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setIsLoading(true);
    setCouponError('');
    
    // Simulate API call - replace with actual coupon validation
    setTimeout(() => {
      if (couponCode.toUpperCase() === 'SAVE10') {
        setCouponDiscount(10);
        setCouponApplied(true);
        showToast('Coupon applied successfully!', 'success');
      } else if (couponCode.toUpperCase() === 'SAVE20') {
        setCouponDiscount(20);
        setCouponApplied(true);
        showToast('Coupon applied successfully!', 'success');
      } else {
        setCouponError('Invalid coupon code');
        setCouponDiscount(0);
        setCouponApplied(false);
      }
      setIsLoading(false);
    }, 500);
  };

  // Handle checkout
  const handleCheckout = () => {
    if (!isAuthenticated) {
      showToast('Please login to continue checkout', 'warning');
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  // Calculate order totals
  const subtotal = cartTotal;
  const discountAmount = (subtotal * couponDiscount) / 100;
  const shipping = subtotal > 100 ? 0 : 10;
  const tax = (subtotal - discountAmount) * 0.08; // 8% tax
  const total = subtotal - discountAmount + shipping + tax;

  // Format cart items for order summary preview
  const orderItems = cartItems.map(item => ({
    id: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    image: item.image
  }));

  // If cart is empty
  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <Breadcrumb 
            items={[
              { name: 'Home', path: '/' },
              { name: 'Cart', path: '/cart' }
            ]}
          />
          
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added any items to your cart yet.</p>
            <div className="empty-cart-actions">
              <Link to="/shop" className="btn-primary">
                Continue Shopping
              </Link>
              <Link to="/wishlist" className="btn-secondary">
                View Wishlist
              </Link>
            </div>
            <div className="featured-products-placeholder">
              <h3>Featured Products</h3>
              <p>Check out our best sellers!</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        {/* Breadcrumb */}
        <Breadcrumb 
          items={[
            { name: 'Home', path: '/' },
            { name: 'Shop', path: '/shop' },
            { name: 'Cart', path: '/cart' }
          ]}
        />

        {/* Page Header */}
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          <p>{cartCount} {cartCount === 1 ? 'item' : 'items'} in your cart</p>
        </div>

        {/* Cart Content */}
        <div className="cart-content">
          {/* Cart Items Section */}
          <div className="cart-items-section">
            <div className="cart-items-header">
              <div className="header-product">Product</div>
              <div className="header-price">Price</div>
              <div className="header-quantity">Quantity</div>
              <div className="header-total">Total</div>
              <div className="header-action"></div>
            </div>

            <div className="cart-items-list">
              {cartItems.map((item) => (
                <CartItem
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  price={item.price}
                  image={item.image}
                  quantity={item.quantity}
                  maxStock={item.stock || 99}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemove={handleRemoveItem}
                  onMoveToWishlist={handleMoveToWishlist}
                />
              ))}
            </div>

            {/* Cart Actions */}
            <div className="cart-actions">
              <Link to="/shop" className="continue-shopping">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Continue Shopping
              </Link>
              
              <button onClick={clearCart} className="clear-cart-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
                Clear Cart
              </button>
            </div>
          </div>

          {/* Order Summary Section */}
          <div className="cart-summary-section">
            <OrderSummary
              subtotal={subtotal}
              discount={couponDiscount}
              shipping={shipping}
              tax={8}
              items={orderItems}
              onApplyCoupon={handleApplyCoupon}
              onCheckout={handleCheckout}
              isLoading={isLoading}
            />
            
            {/* Coupon Input (Additional) */}
            <div className="coupon-section-cart">
              <h4>Coupon Code</h4>
              <div className="coupon-input-group">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  disabled={couponApplied}
                />
                <button 
                  onClick={handleApplyCoupon}
                  disabled={couponApplied || isLoading}
                >
                  {couponApplied ? 'Applied ✓' : 'Apply'}
                </button>
              </div>
              {couponError && <p className="coupon-error">{couponError}</p>}
              {couponApplied && (
                <p className="coupon-success">
                  Coupon applied! You saved ${discountAmount.toFixed(2)}
                </p>
              )}
              <div className="available-coupons">
                <p>Available coupons:</p>
                <span className="coupon-tag">SAVE10</span>
                <span className="coupon-tag">SAVE20</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Products Section */}
        <div className="recommended-section">
          <h2>You May Also Like</h2>
          <div className="recommended-grid">
            {/* This will be populated with API call */}
            <p className="recommended-placeholder">Recommended products will appear here</p>
          </div>
        </div>
      </div>
    </div>
  );
}