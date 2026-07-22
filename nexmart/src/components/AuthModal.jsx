import { useState, useEffect, useContext } from 'react';
import { AppCtx } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { getPasswordStrength, avatarColorFromEmail, getInitials } from '../utils/auth';
import { login as apiLogin, register as apiRegister, getMe } from '../api/auth';
import { setTokens } from '../api/client';
import PasswordRules from './PasswordRules';

export default function AuthModal() {
  const { authModal, setAuthModal, user, authRedirect, setAuthRedirect, loginUser } = useContext(AppCtx);
  const { addToast } = useToast();
  const [view, setView] = useState('login');
  const [viewDir, setViewDir] = useState('forward');
  const [closing, setClosing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);

  // Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPwd, setShowLoginPwd] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [showRegPwd, setShowRegPwd] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Forgot
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  useEffect(() => {
    if (authModal) { setView(authModal); setError(''); }
  }, [authModal]);

  if (!authModal || user) return null;

  const switchView = (nextView, dir = 'forward') => {
    setViewDir(dir); setView(nextView); setError(''); setForgotSent(false);
  };

  const close = () => {
    setClosing(true);
    setTimeout(() => { setClosing(false); setAuthModal(null); setAuthRedirect(null); }, 250);
  };

  const triggerShake = (msg) => {
    setError(msg); setShaking(true);
    setTimeout(() => setShaking(false), 450);
  };

  const _afterAuth = (me) => {
    setAuthModal(null);
    addToast(`Welcome${me.first_name ? `, ${me.first_name}` : ''}! 👋`, '🎉');
    if (authRedirect) { window.location.hash = authRedirect; setAuthRedirect(null); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginEmail.trim()) return triggerShake('Please enter your email');
    if (!loginPassword) return triggerShake('Please enter your password');
    if (!/\S+@\S+\.\S+/.test(loginEmail)) return triggerShake('Please enter a valid email');
    setLoading(true);
    try {
      const tokenRes = await apiLogin(loginEmail, loginPassword);
      setTokens(tokenRes.access_token, tokenRes.refresh_token);
      const me = await getMe();
      await loginUser(tokenRes, me);
      _afterAuth(me);
    } catch (err) {
      triggerShake(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regName.trim()) return triggerShake('Please enter your name');
    if (!regEmail.trim()) return triggerShake('Please enter your email');
    if (!/\S+@\S+\.\S+/.test(regEmail)) return triggerShake('Please enter a valid email');
    if (regPassword.length < 8) return triggerShake('Password must be at least 8 characters');
    if (regPassword !== regConfirm) return triggerShake('Passwords do not match');
    if (!agreeTerms) return triggerShake('Please agree to the terms of service');
    const parts = regName.trim().split(' ');
    const firstName = parts[0];
    const lastName = parts.slice(1).join(' ') || parts[0];
    setLoading(true);
    try {
      const tokenRes = await apiRegister(regEmail, regPassword, firstName, lastName);
      setTokens(tokenRes.access_token, tokenRes.refresh_token);
      const me = await getMe();
      await loginUser(tokenRes, me);
      _afterAuth(me);
    } catch (err) {
      triggerShake(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = (e) => {
    e.preventDefault();
    if (!forgotEmail.trim() || !/\S+@\S+\.\S+/.test(forgotEmail)) return triggerShake('Please enter a valid email');
    setLoading(true);
    setTimeout(() => { setLoading(false); setForgotSent(true); }, 1000);
  };

  const handleSocialLogin = () => {};

  const pwdStrength = getPasswordStrength(regPassword);
  const viewCls = `auth-view${viewDir === 'back' ? ' back' : ''}`;

  return (
    <div className="auth-overlay">
      <div className={`auth-overlay-bg${closing ? ' closing' : ''}`} onClick={close}/>
      <div className={`auth-modal dm-card${closing ? ' closing' : ''}${shaking ? ' auth-shake' : ''}`}>

        {/* Close button */}
        <button onClick={close} className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full dm-surface flex items-center justify-center dm-text-muted hover:dm-text transition-colors btn-press">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>

        <div className="p-8">

          {/* ═══ LOGIN ═══ */}
          {view === 'login' && (
            <div className={viewCls} key="login">
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">👋</div>
                <h2 className="font-heading text-2xl font-bold dm-text">Welcome Back</h2>
                <p className="text-sm dm-text-muted mt-1">Sign in to your NEXMART account</p>
              </div>

              <div className="space-y-3 mb-5">
                <button onClick={() => handleSocialLogin('Google')} className="social-btn social-btn-google opacity-50 cursor-not-allowed" disabled title="Coming soon">
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>
                <button onClick={() => handleSocialLogin('Apple')} className="social-btn social-btn-apple opacity-50 cursor-not-allowed" disabled title="Coming soon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  Continue with Apple
                </button>
              </div>

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px" style={{background:'var(--border-color)'}}/>
                <span className="text-xs font-semibold dm-text-muted uppercase tracking-wider">or sign in with email</span>
                <div className="flex-1 h-px" style={{background:'var(--border-color)'}}/>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium flex items-center gap-2">
                  <span>⚠️</span> {error}
                </div>
              )}

              <form onSubmit={handleLogin}>
                <div className="auth-field">
                  <label className="dm-text-muted" htmlFor="login-email">Email</label>
                  <input id="login-email" name="email" autoComplete="email" type="email" value={loginEmail} onChange={e=>setLoginEmail(e.target.value)} placeholder="you@example.com" className="dm-input border dm-border" autoFocus/>
                </div>
                <div className="auth-field">
                  <label className="dm-text-muted" htmlFor="login-password">Password</label>
                  <input id="login-password" name="password" autoComplete="current-password" type={showLoginPwd?'text':'password'} value={loginPassword} onChange={e=>setLoginPassword(e.target.value)} className="dm-input border dm-border pr-12"/>
                  <button type="button" className="field-icon" onClick={()=>setShowLoginPwd(p=>!p)}
                    aria-label={showLoginPwd?'Hide password':'Show password'}>{showLoginPwd?'🙈':'👁️'}</button>
                </div>
                <div className="flex items-center justify-between mb-6">
                  <label className="auth-checkbox dm-text-muted">
                    <input type="checkbox" checked={rememberMe} onChange={e=>setRememberMe(e.target.checked)}/> Remember me
                  </label>
                  <button type="button" onClick={()=>switchView('forgot')} className="text-xs font-semibold text-accent hover:underline">Forgot password?</button>
                </div>
                <button type="submit" disabled={loading} className="w-full py-3.5 bg-accent text-white font-bold rounded-xl text-sm btn-press hover:bg-accent/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                  {loading?<div className="auth-spinner"/>:'Sign In'}
                </button>
              </form>

              <p className="text-center text-sm dm-text-muted mt-6">
                Don't have an account?{' '}
                <button onClick={()=>switchView('register')} className="font-bold text-accent hover:underline">Create one</button>
              </p>
            </div>
          )}

          {/* ═══ REGISTER ═══ */}
          {view === 'register' && (
            <div className={viewCls} key="register">
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">🚀</div>
                <h2 className="font-heading text-2xl font-bold dm-text">Create Account</h2>
                <p className="text-sm dm-text-muted mt-1">Join NEXMART for the best deals</p>
              </div>

              {regName && (
                <div className="flex justify-center mb-5">
                  <div className="user-avatar-lg" style={{background:regEmail?avatarColorFromEmail(regEmail):'#FF4D00'}}>
                    {getInitials(regName)}
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium flex items-center gap-2">
                  <span>⚠️</span> {error}
                </div>
              )}

              <form onSubmit={handleRegister}>
                <div className="auth-field">
                  <label className="dm-text-muted" htmlFor="reg-name">Full Name</label>
                  <input id="reg-name" name="name" autoComplete="name" type="text" value={regName} onChange={e=>setRegName(e.target.value)} placeholder="John Doe" className="dm-input border dm-border" autoFocus/>
                </div>
                <div className="auth-field">
                  <label className="dm-text-muted" htmlFor="reg-email">Email</label>
                  <input id="reg-email" name="email" autoComplete="email" type="email" value={regEmail} onChange={e=>setRegEmail(e.target.value)} placeholder="you@example.com" className="dm-input border dm-border"/>
                </div>
                <div className="auth-field">
                  <label className="dm-text-muted" htmlFor="reg-password">Password</label>
                  <input id="reg-password" name="new-password" autoComplete="new-password" aria-describedby="reg-password-rules"
                    type={showRegPwd?'text':'password'} value={regPassword} onChange={e=>setRegPassword(e.target.value)} className="dm-input border dm-border pr-12"/>
                  <button type="button" className="field-icon" onClick={()=>setShowRegPwd(p=>!p)}
                    aria-label={showRegPwd?'Hide password':'Show password'}>{showRegPwd?'🙈':'👁️'}</button>
                  {regPassword && (
                    <div>
                      <div className="pwd-strength dm-surface"><div className={`pwd-strength-fill ${pwdStrength.cls}`}/></div>
                    </div>
                  )}
                  {/* Requirements are visible from the start, not after a failed submit. */}
                  <PasswordRules value={regPassword} id="reg-password-rules"/>
                </div>
                <div className="auth-field relative">
                  <label className="dm-text-muted" htmlFor="reg-confirm">Confirm Password</label>
                  <input id="reg-confirm" name="confirm-password" autoComplete="new-password" type="password" value={regConfirm} onChange={e=>setRegConfirm(e.target.value)} className="dm-input border dm-border pr-12"/>
                  {regConfirm && regPassword && (
                    <span className="absolute right-4 bottom-3 text-sm" aria-hidden="true">{regConfirm===regPassword?'✅':'❌'}</span>
                  )}
                  {regConfirm && regPassword && regConfirm!==regPassword && (
                    <p className="text-[11px] text-red-500 mt-1">Passwords don't match yet</p>
                  )}
                </div>
                <label className="auth-checkbox dm-text-muted mb-6 block">
                  <input type="checkbox" checked={agreeTerms} onChange={e=>setAgreeTerms(e.target.checked)}/>
                  I agree to the <span className="text-accent font-semibold cursor-pointer hover:underline">Terms</span> and <span className="text-accent font-semibold cursor-pointer hover:underline">Privacy Policy</span>
                </label>
                <button type="submit" disabled={loading} className="w-full py-3.5 bg-accent text-white font-bold rounded-xl text-sm btn-press hover:bg-accent/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 mt-4">
                  {loading?<div className="auth-spinner"/>:'Create Account'}
                </button>
              </form>

              <p className="text-center text-sm dm-text-muted mt-6">
                Already have an account?{' '}
                <button onClick={()=>switchView('login','back')} className="font-bold text-accent hover:underline">Sign in</button>
              </p>
            </div>
          )}

          {/* ═══ FORGOT PASSWORD ═══ */}
          {view === 'forgot' && (
            <div className={viewCls} key="forgot">
              {!forgotSent ? (
                <>
                  <div className="text-center mb-6">
                    <div className="text-4xl mb-3">🔑</div>
                    <h2 className="font-heading text-2xl font-bold dm-text">Reset Password</h2>
                    <p className="text-sm dm-text-muted mt-1">Enter your email and we'll send a reset link</p>
                  </div>

                  {error && (
                    <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium flex items-center gap-2">
                      <span>⚠️</span> {error}
                    </div>
                  )}

                  <form onSubmit={handleForgot}>
                    <div className="auth-field">
                      <label className="dm-text-muted">Email Address</label>
                      <input type="email" value={forgotEmail} onChange={e=>setForgotEmail(e.target.value)} placeholder="you@example.com" className="dm-input border dm-border" autoFocus/>
                    </div>
                    <button type="submit" disabled={loading} className="w-full py-3.5 bg-accent text-white font-bold rounded-xl text-sm btn-press hover:bg-accent/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                      {loading?<div className="auth-spinner"/>:'Send Reset Link'}
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="auth-success-icon bg-green-100">✅</div>
                  <h2 className="font-heading text-2xl font-bold dm-text">Check Your Inbox</h2>
                  <p className="text-sm dm-text-muted mt-2 max-w-xs mx-auto">
                    We've sent a reset link to <strong className="dm-text">{forgotEmail}</strong>.
                  </p>
                  <p className="text-xs dm-text-muted mt-4">
                    Didn't receive it?{' '}
                    <button onClick={()=>setForgotSent(false)} className="text-accent font-semibold hover:underline">Resend</button>
                  </p>
                </div>
              )}

              <div className="text-center mt-6">
                <button onClick={()=>switchView('login','back')} className="font-bold text-accent hover:underline flex items-center gap-1 mx-auto text-sm">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                  Back to Sign In
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
