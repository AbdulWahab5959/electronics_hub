// src/components/ui/ToastNotification.jsx
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

// ============================================
// TOAST TYPES (Using your CSS variables)
// ============================================
const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Toast Context for global access
const ToastContext = createContext(null);

// ============================================
// SINGLE TOAST COMPONENT
// ============================================
const Toast = ({ id, type, message, duration = 5000, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onClose(id), 300);
  };

  // Icons based on toast type
  const getIcon = () => {
    switch (type) {
      case TOAST_TYPES.SUCCESS:
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        );
      case TOAST_TYPES.ERROR:
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <circle cx="12" cy="16" r="0.5" fill="currentColor" stroke="none"/>
          </svg>
        );
      case TOAST_TYPES.WARNING:
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 9v4M12 17h.01"/>
            <path d="M12 2L1 21h22L12 2z"/>
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="12" x2="12" y2="16"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
        );
    }
  };

  return (
    <div className={`toast-premium toast-${type} ${isExiting ? 'toast-exit' : 'toast-enter'}`}>
      <div className="toast-icon">{getIcon()}</div>
      <div className="toast-content">
        <p className="toast-message">{message}</p>
      </div>
      <button className="toast-close" onClick={handleClose}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      <div className="toast-progress">
        <div className="toast-progress-bar" style={{ animationDuration: `${duration}ms` }}></div>
      </div>
    </div>
  );
};

// ============================================
// TOAST CONTAINER
// ============================================
const ToastContainer = ({ toasts, onClose }) => {
  return (
    <div className="toast-container-premium">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          id={toast.id}
          type={toast.type}
          message={toast.message}
          duration={toast.duration}
          onClose={onClose}
        />
      ))}
    </div>
  );
};

// ============================================
// TOAST PROVIDER (Wrap your app)
// ============================================
let toastId = 0;
let containerRoot = null;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = TOAST_TYPES.INFO, duration = 5000) => {
    const id = toastId++;
    setToasts(prev => [...prev, { id, message, type, duration }]);
    
    // Auto remove after duration + animation
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration + 300);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
};

// ============================================
// HOOK TO USE TOAST
// ============================================
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

// ============================================
// HELPER FUNCTIONS (Can be used anywhere)
// ============================================
let globalShowToast = null;

export const initToast = (showToastFn) => {
  globalShowToast = showToastFn;
};

export const toast = {
  success: (message, duration) => {
    if (globalShowToast) {
      globalShowToast(message, TOAST_TYPES.SUCCESS, duration);
    } else {
      console.warn('Toast not initialized. Wrap app with ToastProvider');
    }
  },
  error: (message, duration) => {
    if (globalShowToast) {
      globalShowToast(message, TOAST_TYPES.ERROR, duration);
    }
  },
  warning: (message, duration) => {
    if (globalShowToast) {
      globalShowToast(message, TOAST_TYPES.WARNING, duration);
    }
  },
  info: (message, duration) => {
    if (globalShowToast) {
      globalShowToast(message, TOAST_TYPES.INFO, duration);
    }
  }
};