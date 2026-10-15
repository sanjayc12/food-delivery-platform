import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Lock, User, Utensils } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { errorMessage } from '../api/client';

export function AuthArt() {
  return (
    <aside className="auth__art" aria-hidden="true">
      <div className="auth__brand"><span className="brand__mark"><Utensils size={18} /></span> Food<b>Rush</b></div>
      <h2>Hot food.<br />Live tracking.<br />Zero guesswork.</h2>
      <p>Order from your favourite restaurants and watch every step of your delivery in real time.</p>
      <div className="auth__floaters">
        <span>🍕</span><span>🍔</span><span>🍜</span><span>🥗</span><span>🍰</span><span>🌮</span>
      </div>
    </aside>
  );
}

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: '', password: '' });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const user = await login(form.username.trim(), form.password);
      toast.success(`Welcome back, ${user.username}!`);
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      setError(errorMessage(err, 'Could not sign in'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      <AuthArt />
      <main className="auth__panel">
        <form className="auth__form" onSubmit={submit} noValidate>
          <h1>Welcome back</h1>
          <p className="muted">Sign in to order and track your food.</p>

          {error && <div className="alert alert--error" role="alert">{error}</div>}

          <label className="field">
            <span>Username</span>
            <div className="input">
              <User size={18} />
              <input value={form.username} onChange={set('username')} autoComplete="username" placeholder="your username" required autoFocus />
            </div>
          </label>

          <label className="field">
            <span>Password</span>
            <div className="input">
              <Lock size={18} />
              <input
                type={show ? 'text' : 'password'}
                value={form.password}
                onChange={set('password')}
                autoComplete="current-password"
                placeholder="your password"
                required
              />
              <button type="button" className="input__btn" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}>
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          <button className="btn btn--primary btn--block" disabled={busy || !form.username || !form.password}>
            {busy ? <><Loader2 size={18} className="spin" /> Signing in...</> : 'Sign in'}
          </button>

          <p className="auth__switch">New here? <Link to="/register">Create an account</Link></p>
        </form>
      </main>
    </div>
  );
}
