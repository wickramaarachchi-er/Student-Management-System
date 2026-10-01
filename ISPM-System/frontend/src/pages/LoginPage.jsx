/**
 * pages/LoginPage.jsx
 * Professional, accessible login page for the ISPM System.
 */
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import Icon from '../components/common/Icon.jsx';

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
        // Redirect to intended route or default /dashboard
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      } else {
        setErrorMessage(result.message || 'Invalid email or password');
      }
    } catch {
      setErrorMessage('A connection error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick helper to fill test accounts during development/review
  const fillCredentials = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Ispm@Dev2024!');
    setErrorMessage('');
    setFieldErrors({});
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      {/* Background Accent Grid / Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950/30 via-slate-950 to-slate-950 pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/30 text-blue-400 mb-4 shadow-lg shadow-blue-900/20">
            <Icon name="shield-check" className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            ISPM System
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-300">
            Information Security Policy Awareness & Management System
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Enterprise cyber governance, policy compliance, and awareness training
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl shadow-2xl p-6 sm:p-8 backdrop-blur-sm">
          {/* Top Security Banner */}
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-800 text-xs text-slate-400">
            <Icon name="lock" className="w-4 h-4 text-blue-400" />
            <span>Authorized personnel access only</span>
          </div>

          {/* Error Alert Box */}
          {errorMessage && (
            <div
              role="alert"
              className="mb-5 p-3.5 rounded-lg bg-red-950/60 border border-red-800/80 text-red-200 text-sm flex items-start gap-3"
            >
              <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-200 mb-1.5">
                Email Address <span className="text-red-400">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                disabled={isSubmitting}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
                }}
                className={`w-full px-3.5 py-2.5 bg-slate-950/80 border rounded-lg text-white text-sm focus:outline-none focus:ring-2 transition-all placeholder:text-slate-600 ${
                  fieldErrors.email
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-slate-700 focus:border-blue-500 focus:ring-blue-500/50'
                }`}
                placeholder="name@ispm.local"
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-400">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-200 mb-1.5">
                Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  disabled={isSubmitting}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
                  }}
                  className={`w-full px-3.5 py-2.5 pr-11 bg-slate-950/80 border rounded-lg text-white text-sm focus:outline-none focus:ring-2 transition-all placeholder:text-slate-600 ${
                    fieldErrors.password
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-slate-700 focus:border-blue-500 focus:ring-blue-500/50'
                  }`}
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 focus:outline-none p-1"
                >
                  <Icon name={showPassword ? 'eye-off' : 'eye'} className="w-4 h-4" />
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-red-400">{fieldErrors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-semibold text-sm text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 transition-colors shadow-lg shadow-blue-900/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo Switcher (Dev / Prototype Testing Helper) */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">
              Quick Fill Demo Accounts
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillCredentials('admin@ispm.local')}
                className="px-2 py-1.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-left truncate"
                title="System Administrator (admin@ispm.local)"
              >
                <div className="font-semibold text-purple-300">System Admin</div>
                <div className="text-[10px] text-slate-400 truncate">admin@ispm.local</div>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('compliance@ispm.local')}
                className="px-2 py-1.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-left truncate"
                title="Compliance Officer (compliance@ispm.local)"
              >
                <div className="font-semibold text-emerald-300">Compliance Officer</div>
                <div className="text-[10px] text-slate-400 truncate">compliance@ispm.local</div>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('training@ispm.local')}
                className="px-2 py-1.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-left truncate"
                title="Training Administrator (training@ispm.local)"
              >
                <div className="font-semibold text-amber-300">Training Admin</div>
                <div className="text-[10px] text-slate-400 truncate">training@ispm.local</div>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('employee@ispm.local')}
                className="px-2 py-1.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-left truncate"
                title="Employee (employee@ispm.local)"
              >
                <div className="font-semibold text-blue-300">Employee</div>
                <div className="text-[10px] text-slate-400 truncate">employee@ispm.local</div>
              </button>
            </div>
          </div>
        </div>

        {/* Security Notice Footer */}
        <p className="mt-6 text-center text-xs text-slate-500">
          This system is restricted to authorized personnel. All session events and actions are logged and audited.
        </p>
      </div>
    </div>
  );
}
