import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart } from '@phosphor-icons/react/dist/csr/Heart';
import { ShoppingCartSimple } from '@phosphor-icons/react/dist/csr/ShoppingCartSimple';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/common/ToastNotification';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { RatingStars } from '../components/common/RatingStars';
import { getProducts } from '../services/product';
import { readStoredArray, writeStoredArray } from '../utils/comparison';
import { hydrateWishlist, moveSavedItems } from '../utils/wishlist';
import { formatMoney } from '../utils/money';

export default function WishlistPage() {
  const { isAuthenticated } = useAuth();
  const { addToCart, isUpdating } = useCart();
  const navigate = useNavigate();
  const showToast = useToast();
  const [catalogue, setCatalogue] = useState([]);
  const [saved, setSaved] = useState(() => readStoredArray('wishlist'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const [reload, setReload] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true); setError('');
      try {
        const products = [];
        let page = 1, last = 1;
        do {
          const response = await getProducts({ per_page: 100, page }, { signal: controller.signal });
          products.push(...response.data.data.data);
          last = response.data.data.last_page; page++;
        } while (page <= last && !controller.signal.aborted);
        if (!controller.signal.aborted) setCatalogue(products);
      } catch { if (!controller.signal.aborted) setError('Could not refresh prices and stock. Your saved items are safe. Please retry.'); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }
    void load();
    return () => controller.abort();
  }, [reload]);
  useEffect(() => {
    const refresh = () => setSaved(readStoredArray('wishlist'));
    window.addEventListener('wishlistUpdated', refresh); window.addEventListener('storage', refresh);
    return () => { window.removeEventListener('wishlistUpdated', refresh); window.removeEventListener('storage', refresh); };
  }, []);
  const items = hydrateWishlist(saved, catalogue);
  function persist(next) {
    if (!writeStoredArray('wishlist', next)) {
      showToast('Your browser could not update your wishlist. Please retry.', 'error'); return false;
    }
    setSaved(next); window.dispatchEvent(new Event('wishlistUpdated')); return true;
  }
  function remove(id) {
    // Resolve old duplicate IDs as well, without overwriting another tab's additions.
    const current = readStoredArray('wishlist');
    return persist(current.filter(item => String(hydrateWishlist([item], catalogue)[0]?.id) !== String(id)));
  }
  async function move(products) {
    if (pending.current || isUpdating) return;
    if (!isAuthenticated) { navigate('/login', { state: { from: '/wishlist' } }); return; }
    pending.current = true; setBusy(true);
    try {
      const moved = await moveSavedItems(products, addToCart, remove);
      const eligible = products.filter(p => p.available && Number(p.stock) > 0).length;
      showToast(moved ? `${moved} ${moved === 1 ? 'item added' : 'items added'} to cart.${moved < eligible ? ' Other items remain saved; check cart limits and stock.' : ''}` : 'Could not add these items. They remain in your wishlist. Check stock and retry.', moved === eligible && moved ? 'success' : 'info');
    } finally { pending.current = false; setBusy(false); }
  }
  const locked = busy || isUpdating;
  return <div className="wishlist-page commerce-wishlist"><div className="container">
    <Breadcrumb items={[{ name: 'Home', path: '/' }, { name: 'Wishlist' }]} />
    <header className="wishlist-header">
      <div><p className="commerce-eyebrow">SAVED FOR LATER</p><h1>Your wishlist</h1><p>{saved.length ? `${items.length} saved ${items.length === 1 ? 'product' : 'products'}` : 'Keep your favourites in one place.'}</p></div>
      {items.length > 0 && <div className="header-actions"><button type="button" className="commerce-primary" disabled={locked || loading || Boolean(error) || !items.some(p => p.available && p.stock > 0)} onClick={() => move(items)}><ShoppingCartSimple size={19} />{busy ? 'Adding…' : 'Add available items to cart'}</button><button type="button" className="commerce-secondary" disabled={locked} onClick={() => persist([])}>Clear wishlist</button></div>}
    </header>
    <p className="commerce-notice">Saved in this browser. Prices and availability are refreshed from our catalogue.{!isAuthenticated && ' Sign in when you’re ready to add items to your cart.'}</p>
    {loading ? <div className="commerce-state" role="status">Refreshing your saved products…</div> : error ? <div className="commerce-state" role="alert"><p>{error}</p><button type="button" className="commerce-secondary" onClick={() => setReload(n => n + 1)}>Retry</button></div> : !items.length ? <div className="commerce-state"><Heart size={42} aria-hidden="true" /><h2>Your wishlist is empty</h2><p>Tap the heart on a product to save it here.</p><Link to="/shop" className="commerce-primary">Explore the shop</Link></div> : <>
      <div className="wishlist-grid">{items.map(item => <article className="wishlist-card" key={item.id}>
        <Link to={item.available ? `/product/${item.id}` : '/shop'} className="wishlist-image"><img src={item.image || '/product-placeholder.svg'} alt={item.name} loading="lazy" onError={e => { e.target.onerror = null; e.target.src = '/product-placeholder.svg'; }} /></Link>
        <div className="wishlist-info"><p className="product-brand">{item.brand || 'Saved product'}</p><Link to={item.available ? `/product/${item.id}` : '/shop'} className="product-title">{item.name}</Link>
          {item.available && <><RatingStars rating={Number(item.rating) || 0} totalReviews={Number(item.reviews) || 0} size="sm" /><div className="product-price"><strong>{formatMoney(item.price)}</strong>{Number(item.original_price) > Number(item.price) && <del>{formatMoney(item.original_price)}</del>}</div></>}
          <p className="commerce-stock">{!item.available ? 'No longer available' : item.stock > 0 ? 'In stock' : 'Out of stock'}</p>
          <div className="wishlist-actions"><button type="button" className="commerce-primary" disabled={locked || !item.available || item.stock <= 0} onClick={() => move([item])}><ShoppingCartSimple size={18} />{busy ? 'Adding…' : 'Add to cart'}</button><button type="button" className="commerce-secondary" disabled={locked} aria-label={`Remove ${item.name} from wishlist`} onClick={() => remove(item.id)}>Remove</button></div>
        </div>
      </article>)}</div><Link className="commerce-continue" to="/shop">Continue shopping</Link>
    </>}
  </div></div>;
}
