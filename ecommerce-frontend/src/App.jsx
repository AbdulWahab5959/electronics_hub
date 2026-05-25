import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/common/ToastNotification';
import { CartProvider } from './context/CartContext';
import { useProductData } from './hooks/useProductData';  // import the hook

// Pages
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import Dashboard from './pages/dashboard/Dashboard';
import Shop from './pages/ShopPage';
import ContactUs from './pages/ContactPage';
import ProductDetailPage from './pages/ProductDetailPage';
import Cart from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import ComparePage from './pages/ComparePage';
import SearchResultsPage from './pages/SearchResultsPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';





// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';

function App() {
  const { products, loading, error } = useProductData();

  // Show a loading indicator while products are being fetched
  if (loading) {
    return (
      <div className="global-loader">
        <div className="loader-spinner-premium loader-lg"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  // Even if there's an error, we still render the app with empty products
  if (error) {
    console.error('Product loading error:', error);
  }

  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <Layout products={products}>   {/* pass products to Layout */}
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/contact" element={<ContactUs />} />

                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/compare" element={<ComparePage />} />
                <Route path="/search" element={<SearchResultsPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/verify-email/:id?/:hash?" element={<VerifyEmail />} />
                {/* Protected Routes */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/orders" 
                  element={
                    <ProtectedRoute>
                      <OrdersPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/orders/:id" 
                  element={
                    <ProtectedRoute>
                      <OrderDetailPage />
                    </ProtectedRoute>
                  } 
                />
                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;