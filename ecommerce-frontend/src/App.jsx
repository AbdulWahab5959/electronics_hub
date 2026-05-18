import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/common/ToastNotification';
import { CartProvider } from './context/CartContext';

// Pages
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import Dashboard from './pages/dashboard/Dashboard'; 
import Shop from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';   


// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
            <CartProvider>
              <Layout>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/product/:id" element={<ProductDetailPage />} />  
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
                    path="/profile" 
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
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