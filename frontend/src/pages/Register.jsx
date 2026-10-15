import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Lock, Mail, Phone, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { errorMessage } from '../api/client';
import { AuthArt } from './Login';

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', phoneNumber: '' });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const emailOk = /^\S+@\S+\.\S+$/.test(form.email);
  const valid = form.username.trim().length >= 3 && emailOk && form.password.length >= 6;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await register({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        phoneNumber: form.phoneNumber.trim() || undefined,
      });
      toast.success('Account created. You are signed in!');
      navigate('/', { replace: true });
    } catch (err) {
      setError(errorMessage(err, 'Could not create your account'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      <AuthArt />
      <main className="auth__panel">
        <form className="auth__form" onSubmit={submit} noValidate>
          <h1>Create your account</h1>
          <p className="muted">It takes less than a minute.</p>

          {error && <div className="alert alert--error" role="alert">{error}</div>}

          <label className="field">
            <span>Username</span>
            <div className="input">
              <User size={18} />
              <input value={form.username} onChange={set('username')} autoComplete="username" placeholder="at least 3 characters" required autoFocus />
            </div>
          </label>

          <label className="field">
            <span>Email</span>
            <div className="input">
              <Mail size={18} />
              <input type="email" value={form.email} onChange={set('email')} autoComplete="email" placeholder="you@example.com" required />
            </div>
          </label>

          <label className="field">
            <span>Phone <em>(optional)</em></span>
            <div className="input">
              <Phone size={18} />
              <input type="tel" value={form.phoneNumber} onChange={set('phoneNumber')} autoComplete="tel" placeholder="98765 43210" />
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
                autoComplete="new-password"
                placeholder="at least 6 characters"
                required
              />
              <button type="button" className="input__btn" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}>
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          <button className="btn btn--primary btn--block" disabled={busy || !valid}>
            {busy ? <><Loader2 size={18} className="spin" /> Creating account...</> : 'Create account'}
          </button>

          <p className="auth__switch">Already have an account? <Link to="/login">Sign in</Link></p>
        </form>
      </main>
    </div>
  );
}
