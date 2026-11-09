import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signInAdmin, resetPassword } from '../../lib/api';
import { useAuth } from '../AdminApp';
import { isConfigured } from '../../lib/supabase';
import { Lock, User, Eye, EyeOff, ShieldAlert, ArrowRight, KeyRound, Sparkles } from 'lucide-react';

export default function AdminLogin() {
  const { setAdminUser } = useAuth();
  const [email, setEmail] = useState('joel@123');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState({ loading: false, msg: '', error: false });

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/admin/dashboard';

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const user = await signInAdmin(email, password);
      if (setAdminUser) setAdminUser(user);
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMsg(err.message || 'Invalid administrator credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = () => {
    setEmail('joel@123');
    setPassword('Admin@123');
    setErrorMsg('');
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotStatus({ loading: true, msg: '', error: false });
    try {
      await resetPassword(forgotEmail);
      setForgotStatus({
        loading: false,
        msg: 'Password reset link sent! Check your inbox for recovery instructions.',
        error: false
      });
    } catch (err) {
      setForgotStatus({
        loading: false,
        msg: err.message || 'Unable to send password recovery email.',
        error: true
      });
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      background: 'radial-gradient(circle at 10% 20%, #eef4f0 0%, #f8f6f0 80%)',
      padding: '24px'
    }}>
      <div style={{
        background: '#ffffff',
        width: 'min(450px, 100%)',
        borderRadius: '12px',
        border: '1px solid #e6dfd1',
        boxShadow: '0 20px 45px rgba(18, 40, 26, 0.08)',
        padding: '36px 32px'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: '#12281a',
            color: '#c78d1f',
            fontFamily: 'Playfair Display, serif',
            fontSize: '28px',
            fontWeight: 700,
            display: 'grid',
            placeItems: 'center',
            margin: '0 auto 12px'
          }}>
            a.
          </div>
          <h1 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '24px',
            color: '#12281a',
            fontWeight: 600,
            lineHeight: 1.1
          }}>
            Achar &amp; Co. Kitchen Admin
          </h1>
          <p style={{ fontSize: '13px', color: '#645a4e', marginTop: '6px' }}>
            Authorized Administrator Access &amp; CMS
          </p>
        </div>

        {/* Configured Admin Credentials Banner */}
        <div style={{
          background: '#fcfbf7',
          border: '1px solid #e6dfd1',
          borderLeft: '4px solid #c78d1f',
          borderRadius: '6px',
          padding: '12px 14px',
          fontSize: '12px',
          color: '#1d1a16',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div>
            <b style={{ color: '#12281a', display: 'block', fontSize: '12px', marginBottom: '2px' }}>
              🔑 Administrator Credentials:
            </b>
            <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#645a4e' }}>
              User: <strong style={{ color: '#12281a' }}>joel@123</strong> &bull; Pass: <strong style={{ color: '#12281a' }}>Admin@123</strong>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            style={{ fontSize: '10px', padding: '4px 8px', whiteSpace: 'nowrap' }}
            onClick={handleQuickFill}
          >
            Auto-fill
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div style={{
            background: '#fdf2f2',
            border: '1px solid #f8b4b4',
            borderRadius: '6px',
            padding: '10px 14px',
            fontSize: '12px',
            color: '#991b1b',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <ShieldAlert size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="loginEmail">Admin Username / Email</label>
            <div style={{ position: 'relative' }}>
              <input
                id="loginEmail"
                type="text"
                className="form-control"
                style={{ paddingLeft: '38px' }}
                placeholder="joel@123"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <User 
                size={16} 
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8e8273' }} 
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label htmlFor="loginPassword" style={{ margin: 0 }}>Password</label>
              <button
                type="button"
                onClick={() => {
                  setForgotEmail(email);
                  setShowForgotModal(true);
                }}
                style={{ background: 'none', border: 0, color: '#c78d1f', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
              >
                Forgot Password?
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                id="loginPassword"
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                style={{ paddingLeft: '38px', paddingRight: '40px' }}
                placeholder="••••••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <Lock 
                size={16} 
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8e8273' }} 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 0,
                  cursor: 'pointer',
                  color: '#8e8273',
                  padding: '4px'
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '10px', padding: '12px' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid #ede8dc', textAlign: 'center' }}>
          <p style={{ fontSize: '11px', color: '#8e8273', margin: 0 }}>
            🔒 Public registration is disabled. Administrator credentials are provisioned strictly through Supabase Auth.
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="modal-overlay" onClick={() => setShowForgotModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <button className="modal-close" onClick={() => setShowForgotModal(false)}>&times;</button>
            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
              <div style={{ fontSize: '28px', color: '#c78d1f', marginBottom: '6px' }}>🔑</div>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', color: '#12281a' }}>
                Reset Admin Password
              </h3>
              <p style={{ fontSize: '12px', color: '#645a4e', marginTop: '4px' }}>
                Enter your registered admin email address and we will generate a secure reset link.
              </p>
            </div>

            {forgotStatus.msg && (
              <div style={{
                background: forgotStatus.error ? '#fdf2f2' : '#dcfce7',
                color: forgotStatus.error ? '#991b1b' : '#166534',
                padding: '10px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                marginBottom: '16px'
              }}>
                {forgotStatus.msg}
              </div>
            )}

            <form onSubmit={handleForgotPassword}>
              <div className="form-group">
                <label>Admin Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  placeholder="admin@acharandco.com"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setShowForgotModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={forgotStatus.loading}
                >
                  {forgotStatus.loading ? 'Sending...' : 'Send Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

