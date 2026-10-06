// src/pages/auth/VerifyEmail.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom';
import api from '../../services/api';

export default function VerifyEmail() {
  const { id, hash } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState(location.state?.email || '');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    // If URL has id and hash, process verification link
    if (id && hash) {
      verifyEmailFromLink();
    } else {
      // Show verification reminder page
      setStatus('reminder');
    }
  }, []);

  // Process verification link from email
  const verifyEmailFromLink = async () => {
    try {
      const response = await api.get(`/email/verify/${id}/${hash}`, {
        params: { 
          expires: searchParams.get('expires'), 
          signature: searchParams.get('signature') 
        }
      });
      setStatus('success');
      setMessage(response.data.message || 'Email verified successfully!');
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Verification failed. The link may be expired.');
    }
  };

  // Send verification email
  const sendVerificationEmail = async () => {
    if (!email) {
      setMessage('Please enter your email address');
      return;
    }

    setIsSending(true);
    setMessage('');
    
    try {
      const response = await api.post('/email/resend', { email });
      setMessage(response.data.message || 'Verification email sent! Please check your inbox.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to send verification email');
    } finally {
      setIsSending(false);
    }
  };

  // Loading state
  if (status === 'loading') {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <h1>Loading...</h1>
            </div>
            <div className="loader-spinner-premium loader-md"></div>
          </div>
        </div>
      </div>
    );
  }

  // Verification processing state
  if (status === 'verifying') {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <div className="auth-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
              </div>
              <h1>Verifying Email</h1>
              <p>Please wait while we verify your email...</p>
            </div>
            <div className="loader-spinner-premium loader-md"></div>
          </div>
        </div>
      </div>
    );
  }

  // Success from verification link
  if (status === 'success') {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <div className="auth-icon success">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <h1>Email Verified!</h1>
              <p>{message}</p>
              <p>You can now login to your account.</p>
            </div>
            <div className="auth-link">
              <a href="/login">← Go to Login</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error from verification link
  if (status === 'error') {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <div className="auth-icon error">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <circle cx="12" cy="16" r="0.5" fill="currentColor" stroke="none"/>
                </svg>
              </div>
              <h1>Verification Failed</h1>
              <p>{message}</p>
            </div>
            <div className="auth-link">
              <a href="/login">← Back to Login</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // REMINDER PAGE: Show when user is redirected here after login
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 12h-6l-2 3H10l-2-3H2"/>
                <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/>
              </svg>
            </div>
            <h1>Verify Your Email</h1>
            <p>We need to verify your email address before you can continue.</p>
          </div>

          {/* Success/Error Message */}
          {message && (
            <div className={message.includes('sent') ? 'alert-success' : 'alert-error'}>
              {message}
            </div>
          )}

          {/* Email Input */}
          <div className="form-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <span className="input-icon">📧</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                disabled={isSending}
              />
            </div>
          </div>

          {/* Send Verification Email Button */}
          <button 
            onClick={sendVerificationEmail} 
            className="auth-btn"
            disabled={isSending}
          >
            {isSending ? (
              <>
                <span className="btn-spinner"></span>
                Sending...
              </>
            ) : (
              'Send Verification Email'
            )}
          </button>

          <div className="auth-link" style={{ marginTop: '20px' }}>
            <a href="/login">← Back to Login</a>
          </div>
        </div>
      </div>
    </div>
  );
}