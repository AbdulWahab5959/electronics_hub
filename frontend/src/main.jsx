// src/main.jsx - FINAL VERSION (NO testStyle)
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import 'bootstrap/dist/css/bootstrap.min.css' 
import 'bootstrap/dist/js/bootstrap.bundle.min.js'  
import './assets/css/index.css'
import './assets/css/storefront.css'
import './assets/css/shop.css'
import './assets/css/commerce.css'
import './assets/css/contact.css'
import './assets/css/checkout.css'
import './assets/css/orders.css'
import './assets/css/account-dashboard.css'
import './assets/css/profile.css'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
