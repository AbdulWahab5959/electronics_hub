import { useEffect, useState } from 'react';
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { resendVerification, verifyEmail } from '../../services/auth';

export default function VerifyEmail() {
  const { id, hash } = useParams();
  const [params] = useSearchParams();
  const { state } = useLocation();
  const [result, setResult] = useState(null);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const expires = params.get('expires');
  const signature = params.get('signature');

  useEffect(() => {
    if (!id || !hash) return;
    let active = true;
    verifyEmail(id, hash, expires, signature).then(response => {
      if (active) setResult({ success: true, message: response.data.message });
    }).catch(error => {
      if (active) setResult({ success: false, message: error.response?.data?.message || 'This link is invalid or expired. Sign in to request another.' });
    });
    return () => { active = false; };
  }, [id, hash, expires, signature]);

  const resend = async () => {
    setSending(true);
    setMessage('');
    try {
      const response = await resendVerification();
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.status === 401
        ? 'Please sign in with your email and password to request another verification email.'
        : error.response?.status === 429
          ? 'Please wait one minute before requesting another email.'
          : 'Could not request verification. Please try again.');
    } finally { setSending(false); }
  };

  return <div className="auth-page"><div className="auth-container"><div className="auth-card">
    <div className="auth-header">
      <h1>{id && hash ? (result ? (result.success ? 'Email verified' : 'Verification failed') : 'Verifying email…') : 'Verify your email'}</h1>
      <p role="status">{result?.message || (id && hash ? 'Checking your link…' : 'Open the verification link in your inbox, then sign in.')}</p>
      {state?.email && <p>{state.email}</p>}
    </div>
    {(!id || (result && !result.success)) && <button type="button" className="auth-btn" disabled={sending} onClick={resend}>
      {sending ? 'Requesting…' : 'Resend verification email'}
    </button>}
    <p role="status">{message}</p>
    <div className="auth-link"><Link to="/login">Back to login</Link></div>
  </div></div></div>;
}
