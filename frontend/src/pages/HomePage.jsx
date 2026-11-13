import { Link } from 'react-router-dom';
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
          <h1 id="home-heading">Find the right tech.</h1>
          <p className="store-hero-description">
            Explore laptops, phones, audio and accessories from brands you know.
          </p>
          <Link to="/shop" className="store-primary-link">Browse the shop</Link>
        </div>
        <div className="store-hero-media">
          <img
            src={heroImage}
            alt="Laptop from the electronics collection"
            fetchPriority="high"
          />
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
                <span className="store-category-arrow" aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="store-section store-products-section" aria-labelledby="products-heading">
        <div className="store-section-heading">
          <h2 id="products-heading">
            {featuredProducts.length > 0 ? 'Featured products' : 'Products'}
          </h2>
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
    </div>
  );
}
