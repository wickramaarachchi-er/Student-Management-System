/**
 * pages/LoginPage.jsx
 * Sign in to the CyberShield security and compliance workspace.
 */
import { useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import Icon from '../components/common/Icon.jsx';
import './LoginPage.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const emailRef = useRef(null);
  const passwordRef = useRef(null);
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
    if (errors.email) emailRef.current?.focus();
    else if (errors.password) passwordRef.current?.focus();
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
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
        <section aria-label="Product information" className="login-story">
          <div className="login-brand">
            <span className="login-brand-mark"><Icon name="shield" aria-hidden="true" /></span>
            <div><strong>CyberShield</strong><span>Security &amp; compliance</span></div>
          </div>
          <div className="login-story-content">
            <h1>Security &amp; compliance</h1>
            <p className="login-story-description">Sign in to access your organization’s policies, training, and compliance records.</p>
          </div>
        </section>

        <section aria-labelledby="login-title" className="login-form-panel">
          <div className="login-form-content">
            <h2 id="login-title">Sign in</h2>
            <p className="login-form-description">Use your organization account to continue.</p>

            {/* Error Message Alert */}
            {errorMessage && (
              <div
                role="alert"
                className="login-error"
              >
                <Icon name="close" className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="flex-1 font-medium">{errorMessage}</span>
              </div>
            )}

            {/* Sign-in form */}
            <form onSubmit={handleSubmit} noValidate className="login-form" aria-busy={isSubmitting}>

              {/* Form Group 1: Email Address */}
              <div className="login-field">
                <label htmlFor="email">
                  Email address
                </label>
                <div>
                  <input
                    ref={emailRef}
                    aria-invalid={Boolean(fieldErrors.email)}
                    aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                    required
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                    disabled={isSubmitting}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setFieldErrors((errors) => ({ ...errors, email: '' }));
                      setErrorMessage('');
                    }}

                    placeholder="name@university.edu"
                  />
                </div>
                {fieldErrors.email && (
                  <p id="email-error" className="login-field-error" role="alert">{fieldErrors.email}</p>
                )}
              </div>

              {/* Form Group 2: Password */}
              <div className="login-field">
                <label htmlFor="password">
                  Password
                </label>
                <div className="login-password-wrap">
                  <input
                    ref={passwordRef}
                    aria-invalid={Boolean(fieldErrors.password)}
                    aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                    required
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    disabled={isSubmitting}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setFieldErrors((errors) => ({ ...errors, password: '' }));
                      setErrorMessage('');
                    }}

                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    disabled={isSubmitting}
                    aria-pressed={showPassword}
                    aria-controls="password"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="login-password-toggle"
                  >
                    <Icon name={showPassword ? 'eye-off' : 'eye'} className="w-5 h-5" />
                  </button>
                </div>
                {fieldErrors.password && (
                  <p id="password-error" className="login-field-error" role="alert">{fieldErrors.password}</p>
                )}
              </div>

              <button type="submit" disabled={isSubmitting} className="login-submit">
                {isSubmitting ? <><span className="login-spinner" aria-hidden="true" /> Signing in...</> : <>Sign in to workspace <span aria-hidden="true">&rarr;</span></>}
              </button>
            </form>
            <p className="login-account-help">Need an account? Contact your system administrator.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
