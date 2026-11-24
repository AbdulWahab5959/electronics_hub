import { Link } from 'react-router-dom';
import { CreditCard } from '@phosphor-icons/react/dist/csr/CreditCard';
import { Headset } from '@phosphor-icons/react/dist/csr/Headset';
import { ShieldCheck } from '@phosphor-icons/react/dist/csr/ShieldCheck';
import { Truck } from '@phosphor-icons/react/dist/csr/Truck';
import { ProductCard } from '../components/common/ProductCard';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { useToast } from '../components/common/ToastNotification';

const fallbackHeroImage =
  'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&h=900&fit=crop';

export default function HomePage({ products = [], loading = false, error = null }) {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const showToast = useToast();

  const laptopImage = products.find(
    (product) =>
      product.image &&
      /laptop/i.test(`${product.category || ''} ${product.name || ''}`),
  )?.image;
  const heroImage = laptopImage || fallbackHeroImage;

  const categories = [...new Set(products.map((product) => product.category).filter(Boolean))]
    .slice(0, 4)
    .map((category) => ({
      name: category,
      image: products.find((product) => product.category === category && product.image)?.image,
    }));

  const featuredProducts = products.filter((product) => product.is_featured);
  const productsToShow = (featuredProducts.length ? featuredProducts : products).slice(0, 4);

  const handleAddToCart = async (productId) => {
    const product = products.find((item) => String(item.id) === String(productId));
    if (!product) {
      showToast('This product is no longer available.', 'error');
      return;
    }

    if (!isAuthenticated) {
      showToast('Sign in to add products to your cart.', 'info');
      return;
    }

    const added = await addToCart(product, 1);
    showToast(
      added ? `${product.name} added to your cart.` : 'Could not update your cart. Please try again.',
      added ? 'success' : 'error',
    );
  };

  return (
    <div className="storefront-home">
      <section className="store-hero" aria-labelledby="home-heading">
        <div className="store-hero-copy">
          <p className="store-eyebrow">Electronics for real life</p>
          <h1 id="home-heading">Tech that fits the way you live and work.</h1>
          <p className="store-hero-description">
            Compare practical choices for your desk, your bag, and your home—then order with help when you need it.
          </p>
          <div className="store-hero-actions">
            <Link to="/shop" className="store-primary-link">Browse products</Link>
            <Link to="/compare" className="store-secondary-link">Compare products</Link>
          </div>
          <p className="store-hero-note">Browse by category, compare details, and build a cart at your own pace.</p>
        </div>
        <div className="store-hero-media">
          <img
            src={heroImage}
            alt="Laptop from the electronics collection"
            fetchPriority="high"
          />
          <div className="store-hero-media-caption">
            <span>Tools for work, study, and everyday life</span>
          </div>
        </div>
      </section>

      <section className="home-service-panel" aria-labelledby="service-heading">
        <div className="home-service-lead">
          <span className="home-service-icon" aria-hidden="true"><Truck size={28} weight="duotone" /></span>
          <div>
            <p className="store-eyebrow">Delivery and support</p>
            <h2 id="service-heading">Get the right product, with a clear next step.</h2>
            <p>Choose what fits, review the details, and contact us if you need help before placing an order.</p>
            <Link to="/contact" className="home-text-link">Ask about delivery or product support</Link>
          </div>
        </div>

        <div className="home-service-list">
          <article className="home-service-item">
            <ShieldCheck size={22} weight="duotone" aria-hidden="true" />
            <div>
              <h3>Product details first</h3>
              <p>Use product pages and comparison tools to make an informed choice.</p>
            </div>
          </article>
          <article className="home-service-item">
            <CreditCard size={22} weight="duotone" aria-hidden="true" />
            <div>
              <h3>Simple checkout</h3>
              <p>Keep your selections together and review your cart before checkout.</p>
            </div>
          </article>
          <article className="home-service-item">
            <Headset size={22} weight="duotone" aria-hidden="true" />
            <div>
              <h3>Human help</h3>
              <p>Contact the TechHub team when you need guidance on a product.</p>
            </div>
          </article>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="store-section" aria-labelledby="category-heading">
          <div className="store-section-heading">
            <h2 id="category-heading">Shop by category</h2>
          </div>
          <div className="store-category-grid">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={`/shop?category=${encodeURIComponent(category.name)}`}
                className="store-category-link"
              >
                {category.image && (
                  <img src={category.image} alt="" loading="lazy" />
                )}
                <span>{category.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="store-section store-products-section" aria-labelledby="products-heading">
        <div className="store-section-heading">
          <div>
            <p className="store-eyebrow">Selected for the shop</p>
            <h2 id="products-heading">
              {featuredProducts.length > 0 ? 'Featured products' : 'Products'}
            </h2>
          </div>
          <Link to="/shop" className="home-text-link">View all products</Link>
        </div>

        {loading ? (
          <div className="store-product-grid" aria-label="Loading products" role="status">
            {[...Array(4)].map((_, index) => (
              <div className="store-product-skeleton" key={index}>
                <span />
                <span />
                <span />
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="store-catalog-message" role="alert">
            We could not load products. Please refresh the page and try again.
          </p>
        ) : productsToShow.length > 0 ? (
          <div className="store-product-grid">
            {productsToShow.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                brand={product.brand}
                price={product.price}
                originalPrice={product.original_price}
                image={product.image}
                rating={product.rating}
                reviews={product.reviews}
                discount={product.discount}
                isNew={product.is_new}
                inStock={Number(product.stock) > 0}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        ) : (
          <p className="store-catalog-message">
            There are no products in the catalogue yet.
          </p>
        )}
      </section>

      <section className="home-story" aria-labelledby="about-heading">
        <div className="home-story-mark" aria-hidden="true">
          <span>TH</span>
        </div>
        <div className="home-story-copy">
          <p className="store-eyebrow">About TechHub</p>
          <h2 id="about-heading">A practical electronics store for everyday decisions.</h2>
          <p>
            TechHub brings laptops, phones, audio, accessories, and comparison tools into one straightforward place. We focus on the information that helps you choose, not noise that gets in the way.
          </p>
          <div className="home-story-actions">
            <Link to="/shop" className="store-secondary-link">Explore the catalogue</Link>
            <Link to="/contact" className="home-text-link">Contact TechHub</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
