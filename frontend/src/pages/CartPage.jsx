import { Link, useNavigate } from 'react-router-dom';
import { CartItem } from '../components/common/CartItem';
import { OrderSummary } from '../components/common/OrderSummary';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { Trash } from '@phosphor-icons/react/dist/csr/Trash';

export default function CartPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { cartItems, cartCount, cartTotal, isLoading, isUpdating, error, fetchCart, updateQuantity, removeFromCart, clearCart } = useCart();
  const unavailable = cartItems.some(item => item.quantity > Math.min(Number(item.stock) || 0, 99));
  if (isLoading) return <div className="commerce-state" role="status">Loading your cart…</div>;
  if (!isAuthenticated) return <div className="commerce-state"><p className="commerce-eyebrow">YOUR SHOPPING BAG</p><h1>Your cart</h1><p>Sign in to see your saved cart and continue shopping.</p><Link className="commerce-primary" to="/login" state={{ from: '/cart' }}>Sign in to view your cart</Link></div>;
  return <div className="commerce-cart-page"><div className="commerce-cart-container">
    <Breadcrumb items={[{ name: 'Home', path: '/' }, { name: 'Cart', path: '/cart' }]} />
    <header className="commerce-cart-heading"><div><p className="commerce-eyebrow">YOUR SHOPPING BAG</p><h1>Shopping cart</h1><p>Review your items before checkout.</p></div><span className="commerce-cart-count" role="status">{cartCount} {cartCount === 1 ? 'item' : 'items'}</span></header>
    {error && <div role="alert"><p>{error}</p><button type="button" onClick={() => fetchCart()}>Reload cart</button></div>}
    {!cartItems.length && !error ? <div className="commerce-state"><h2>Your cart is empty</h2><p>Explore the shop and add your favourites to get started.</p><Link className="commerce-primary" to="/shop">Continue shopping</Link></div> :
      <div className="commerce-cart-content">
        <section className="commerce-cart-items-section" aria-label="Cart items">
          {cartItems.map(item => <CartItem key={item.id} id={item.id} productId={item.product_id}
            name={item.name} image={item.image} price={item.price} quantity={item.quantity}
            disabled={isUpdating} maxStock={Math.max(0, Math.min(Number(item.stock) || 0, 99))} onUpdateQuantity={updateQuantity} onRemove={removeFromCart} />)}
          <div className="commerce-cart-bottom-actions"><Link to="/shop">Continue shopping</Link><button type="button" className="commerce-cart-clear" disabled={isUpdating || !cartItems.length} onClick={clearCart}><Trash size={17} aria-hidden="true" />Clear cart</button></div>
        </section>
        <aside className="commerce-cart-summary-section">{unavailable && <p role="status" className="commerce-notice">Update or remove unavailable items before checkout.</p>}<OrderSummary classPrefix="commerce-" disabled={Boolean(error) || unavailable} isLoading={isUpdating} items={cartItems} subtotal={cartTotal} onCheckout={() => navigate('/checkout')} /></aside>
      </div>}
  </div></div>;
}
