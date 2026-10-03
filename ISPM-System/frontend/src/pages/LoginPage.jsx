/**
 * pages/LoginPage.jsx
 * Login page for ISPM.
 */
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import Icon from '../components/common/Icon.jsx';
import './LoginPage.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const result = await login(email.trim(), password);
      if (result.ok) {
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      } else {
        setErrorMessage(result.message || 'Invalid credentials. Please verify your email and password.');
      }
    } catch {
      setErrorMessage('A security connection error occurred. Please check network connectivity and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-shell">
        <aside className="login-identity" aria-label="ISPM">
          <div className="login-brand"><span className="login-brand-mark"><Icon name="shield-check" aria-hidden="true" /></span><span>ISPM</span></div>
          <div className="login-emblem" aria-hidden="true">
            <div className="login-emblem-ring login-emblem-ring-outer" />
            <div className="login-emblem-ring login-emblem-ring-inner" />
            <div className="login-emblem-shield"><Icon name="shield-check" /></div>
          </div>
          <p className="login-system-name">Information Security<br />Policy &amp; Management</p>
        </aside>
        <section className="login-card" aria-labelledby="login-title">
          <h1 id="login-title">Welcome back</h1>
          {errorMessage && <p role="alert" className="login-error">{errorMessage}</p>}
          <form onSubmit={handleSubmit} noValidate className="login-form" aria-busy={isSubmitting}>
            <div className="login-field">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                inputMode="email"
                autoCapitalize="none"
                spellCheck={false}
                required
                disabled={isSubmitting}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
                }}
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                placeholder="name@organization.com"
              />
              {fieldErrors.email && <p id="email-error" role="alert" className="login-field-error">{fieldErrors.email}</p>}
            </div>

            <div className="login-field">
              <label htmlFor="password">Password</label>
              <div className="login-password-wrap">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  disabled={isSubmitting}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
                  }}
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  aria-controls="password"
                  className="login-password-toggle"
                >
                  <Icon name={showPassword ? 'eye-off' : 'eye'} aria-hidden="true" />
                </button>
              </div>
              {fieldErrors.password && <p id="password-error" role="alert" className="login-field-error">{fieldErrors.password}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="login-submit">
              {isSubmitting ? <><span className="login-spinner" aria-hidden="true" /> Signing in...</> : <>Sign in</>}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
