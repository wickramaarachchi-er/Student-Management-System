/**
 * pages/LoginPage.jsx
 * Enterprise authentication layout for the Information Security Policy & Management System (ISPM).
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
        <section className="login-story" aria-label="About ISPM">
          <div className="login-brand">
            <span className="login-brand-mark"><Icon name="shield-check" /></span>
            <div><strong>ISPM<span className="login-brand-dot">.</span></strong><span>Information Security Management</span></div>
          </div>
          <div className="login-story-content">
            <p className="login-eyebrow"><span /> YOUR SECURITY WORKSPACE</p>
            <h1>A stronger security<br />culture starts <em>here.</em></h1>
            <p className="login-story-description">Bring your policies, people and compliance together. One workspace for a more security-aware organization.</p>
            <div className="login-capabilities">
              {[
                ['book', 'Policies, made clear', 'Publish, manage and acknowledge security policies.'],
                ['academic-cap', 'Awareness that matters', 'Build knowledge through training and assessments.'],
                ['chart', 'Compliance in focus', 'Keep track of progress and security activity.'],
              ].map(([icon, title, description]) => (
                <div className="login-capability" key={title}>
                  <span className="login-capability-icon"><Icon name={icon} /></span>
                  <div><h2>{title}</h2><p>{description}</p></div>
                </div>
              ))}
            </div>
          </div>
          <div className="login-story-footer"><Icon name="shield-check" /><span>Better awareness. Stronger protection.</span></div>
          <div className="login-orbit login-orbit-one" aria-hidden="true" />
          <div className="login-orbit login-orbit-two" aria-hidden="true" />
        </section>

        <section className="login-form-panel" aria-labelledby="login-heading">
          <div className="login-access-label"><Icon name="lock" /> ACCOUNT ACCESS</div>
          <div className="login-form-content">
            <span className="login-form-mark"><Icon name="lock" /></span>
            <p className="login-form-eyebrow">WELCOME TO YOUR WORKSPACE</p>
            <h2 id="login-heading">Welcome back.</h2>
            <p className="login-form-description">Sign in to continue to your ISPM account.</p>

            {errorMessage && <div className="login-error" role="alert"><Icon name="close" /><span>{errorMessage}</span></div>}

            <form onSubmit={handleSubmit} noValidate className="login-form" aria-busy={isSubmitting}>
              <div className="login-field">
                <label htmlFor="email">Email address</label>
                <input id="email" name="email" type="email" autoComplete="email" disabled={isSubmitting}
                  value={email} onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
                  }}
                  aria-invalid={Boolean(fieldErrors.email)} aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                  placeholder="you@organization.com" />
                {fieldErrors.email && <p id="email-error" className="login-field-error" role="alert">{fieldErrors.email}</p>}
              </div>
              <div className="login-field">
                <label htmlFor="password">Password</label>
                <div className="login-password-wrap">
                  <input id="password" name="password" type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password" disabled={isSubmitting} value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
                    }}
                    aria-invalid={Boolean(fieldErrors.password)} aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                    placeholder="Enter your password" />
                  <button type="button" className="login-password-toggle" onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} disabled={isSubmitting}>
                    <Icon name={showPassword ? 'eye-off' : 'eye'} />
                  </button>
                </div>
                {fieldErrors.password && <p id="password-error" className="login-field-error" role="alert">{fieldErrors.password}</p>}
              </div>
              <button type="submit" disabled={isSubmitting} className="login-submit">
                {isSubmitting ? <><span className="login-spinner" aria-hidden="true" /> Signing in...</> : <>Sign in to workspace <span aria-hidden="true">&rarr;</span></>}
              </button>
            </form>
            <p className="login-account-help">Need access? Contact your system administrator.</p>
            <div className="login-form-footer"><Icon name="shield-check" /><span>For authorized users only</span></div>
          </div>
          <p className="login-panel-footer">Information Security Policy &amp; Management System</p>
        </section>
      </div>
    </main>
  );
}
