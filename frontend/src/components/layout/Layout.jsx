import { useState, useEffect } from 'react';
import { ArrowUp } from '@phosphor-icons/react/dist/csr/ArrowUp';
import { Header } from './Header';
import { Footer } from './Footer';

export const Layout = ({ children, products = [] }) => {  // accept products prop
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="tech-layout">
      <Header products={products} />  {/* pass products to Header */}
      <main className="tech-main">
        {children}
      </main>
      <Footer />
      
      <button 
        className={`scroll-top-btn ${showScrollTop ? 'visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Scroll to top"
      >
        <ArrowUp size={20} weight="regular" aria-hidden="true" />
      </button>
    </div>
  );
};