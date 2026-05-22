// src/pages/CartPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartItem } from '../components/common/CartItem';
import { OrderSummary } from '../components/common/OrderSummary';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/common/ToastNotification';

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
    addToWishlist,
  } = useCart();

  const [isLoading, setIsLoading] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleUpdateQuantity = async (productId, newQuantity) => {
    setIsLoading(true);
    await updateQuantity(productId, newQuantity);
    setIsLoading(false);
  };

  const handleRemoveItem = async (productId) => {
    setIsLoading(true);
    await removeFromCart(productId);
    showToast('Item removed from cart', 'info');
    setIsLoading(false);
  };

  const handleMoveToWishlist = async (productId) => {
    setIsLoading(true);

    const product = cartItems.find((item) => item.id === productId);

    if (product && addToWishlist) {
      await addToWishlist(product);
      await removeFromCart(productId);
      showToast('Moved to wishlist', 'success');
    }

    setIsLoading(false);
  };

  const handleApplyCoupon = async (code) => {
    if (!code?.trim()) {
      return { success: false, error: 'Please enter a coupon code' };
    }

    const coupon = code.toUpperCase();

    if (coupon === 'SAVE10') {
      setCouponDiscount(10);
      showToast('Coupon applied successfully!', 'success');
      return { success: true };
    }

    if (coupon === 'SAVE20') {
      setCouponDiscount(20);
      showToast('Coupon applied successfully!', 'success');
      return { success: true };
    }

    setCouponDiscount(0);
    return { success: false, error: 'Invalid coupon code' };
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      showToast('Please login to continue checkout', 'warning');
      navigate('/login');
      return;
    }

    navigate('/checkout');
  };

  const subtotal = cartTotal;
  const discountAmount = (subtotal * couponDiscount) / 100;
  const shipping = subtotal > 100 ? 0 : 10;

  const orderItems = cartItems.map((item) => ({
    id: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    image: item.image,
  }));

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-container">
          <Breadcrumb
            items={[
              { name: 'Home', path: '/' },
              { name: 'Cart', path: '/cart' },
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <Breadcrumb
          items={[
            { name: 'Home', path: '/' },
            { name: 'Shop', path: '/shop' },
            { name: 'Cart', path: '/cart' },
          ]}
        />

        <div className="cart-header">
          <h1>Shopping Cart</h1>
          <p>
            {cartCount} {cartCount === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        <div className="cart-content">
          <section className="cart-items-section">
            <div className="cart-items-header">
              <div className="header-product">Product</div>
              <div className="header-price">Price</div>
              <div className="header-quantity">Quantity</div>
              <div className="header-total">Total</div>
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

            <div className="cart-actions">
              <Link to="/shop" className="continue-shopping">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Continue Shopping
              </Link>

              <button type="button" onClick={clearCart} className="clear-cart-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Clear Cart
              </button>
            </div>
          </section>

          <aside className="cart-summary-section">
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
          </aside>
        </div>

        <div className="recommended-section">
          <h2>You May Also Like</h2>
          <div className="recommended-grid">
            <p className="recommended-placeholder">
              Recommended products will appear here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}