import { Link, useNavigate } from 'react-router-dom';
import { CartItem } from '../components/common/CartItem';
import { OrderSummary } from '../components/common/OrderSummary';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';

export default function CartPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { cartItems, cartCount, cartTotal, isLoading, error, fetchCart, updateQuantity, removeFromCart, clearCart } = useCart();
  if (isLoading) return <div className="container" role="status">Loading your cart…</div>;
  if (!isAuthenticated) return <div className="container"><h1>Your cart</h1><Link to="/login" state={{ from: '/cart' }}>Sign in to view your cart</Link></div>;
  return <div className="cart-page"><div className="cart-container">
    <Breadcrumb items={[{ name: 'Home', path: '/' }, { name: 'Cart', path: '/cart' }]} />
    <h1>Shopping cart</h1><p>{cartCount} items</p>
    {error && <div role="alert"><p>{error}</p><button type="button" onClick={() => fetchCart()}>Reload cart</button></div>}
    {!cartItems.length ? <div className="empty-cart"><h2>Your cart is empty</h2><Link to="/shop">Continue shopping</Link></div> :
      <div className="cart-content">
        <section className="cart-items-section" aria-label="Cart items">
          {cartItems.map(item => <CartItem key={item.id} id={item.id} productId={item.product_id}
            name={item.name} image={item.image} price={item.price} quantity={item.quantity}
            maxStock={Math.min(item.stock, 99)} onUpdateQuantity={updateQuantity} onRemove={removeFromCart} />)}
          <button type="button" className="clear-cart-btn" onClick={clearCart}>Clear cart</button>
          <Link to="/shop">Continue shopping</Link>
        </section>
        <aside className="cart-summary-section"><OrderSummary items={cartItems} subtotal={cartTotal} onCheckout={() => navigate('/checkout')} /></aside>
      </div>}
  </div></div>;
}
