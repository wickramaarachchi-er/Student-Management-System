/**
 * pages/LoginPage.jsx
 * Enterprise authentication layout for the Information Security Policy & Management System (ISPM).
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
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-5 sm:p-8 lg:p-12 relative overflow-hidden font-sans select-none sm:select-auto">
      {/* Background Decorative Security Treatments */}
      <div 
        aria-hidden="true" 
        className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" 
      />
      <div 
        aria-hidden="true" 
        className="absolute top-1/2 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" 
      />
      <div 
        aria-hidden="true" 
        className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" 
      />

      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 xl:gap-16 items-center relative z-10 py-8 sm:py-12 my-auto">
        
        {/* ============================================================
            LEFT SIDE: Product Introduction & Capabilities (Preserved)
            ============================================================ */}
        <section 
          aria-label="Product Information"
          className="lg:col-span-7 flex flex-col justify-center space-y-6 sm:space-y-8 lg:pr-4"
        >
          {/* Brand Mark */}
          <div className="inline-flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner">
              <Icon name="shield" className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-black tracking-wider text-white uppercase flex items-center gap-2">
                ISPM
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              </div>
              <div className="text-xs font-medium text-slate-400 tracking-wide">
                Information Security Management
              </div>
            </div>
          </div>

          {/* Main Headline */}
          <div className="space-y-3 sm:space-y-4">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-snug sm:leading-[1.15]">
              Information Security <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
                Policy & Management
              </span>
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-slate-300/90 max-w-xl leading-relaxed font-normal">
              Manage security policies, employee awareness, training and compliance from one secure platform.
            </p>
          </div>

          {/* 3 Concise Capability Items */}
          <div className="hidden sm:grid grid-cols-1 gap-4 pt-2 max-w-xl">
            {/* Capability 1: Policy Management */}
            <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-sm hover:border-slate-700/80 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Icon name="shield-check" className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-100">Policy Management</h2>
                <p className="text-xs text-slate-400 mt-0.5 leading-normal">
                  Manage policy publishing, versioning and acknowledgements.
                </p>
              </div>
            </div>

            {/* Capability 2: Security Awareness */}
            <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-sm hover:border-slate-700/80 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                <Icon name="academic-cap" className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-100">Security Awareness</h2>
                <p className="text-xs text-slate-400 mt-0.5 leading-normal">
                  Deliver training and assess employee knowledge.
                </p>
              </div>
            </div>

            {/* Capability 3: Compliance Monitoring */}
            <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-sm hover:border-slate-700/80 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                <Icon name="chart" className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-100">Compliance Monitoring</h2>
                <p className="text-xs text-slate-400 mt-0.5 leading-normal">
                  Track organizational compliance and security activity.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            RIGHT SIDE: Clean, Spacious, Normal-Spread Login Card
            ============================================================ */}
        <section 
          aria-label="User Authentication"
          className="lg:col-span-5 flex justify-center w-full"
        >
          <div className="w-full max-w-[460px] bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl p-8 sm:p-10 backdrop-blur-xl">
            
            {/* Top Security Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-blue-600/15 border border-blue-500/25 flex items-center justify-center text-blue-400 shadow-xl shadow-blue-950/40">
                <Icon name="lock" className="w-8 h-8" />
              </div>
            </div>

            {/* Title Section with 32px bottom space */}
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-[30px] font-bold text-white tracking-tight leading-tight">
                Welcome back
              </h2>
              <p className="text-sm sm:text-base text-slate-400 mt-2 font-normal">
                Sign in to access your ISPM account
              </p>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div 
                role="alert" 
                className="mb-6 p-4 rounded-xl bg-rose-950/50 border border-rose-800/70 text-rose-200 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in duration-200"
              >
                <Icon name="close" className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="flex-1 font-medium">{errorMessage}</span>
              </div>
            )}

            {/* Main Form with Explicit space-y-6 */}
            <form onSubmit={handleSubmit} noValidate className="flex flex-col space-y-6">
              
              {/* Form Group 1: Email Address */}
              <div className="flex flex-col">
                <label 
                  htmlFor="email" 
                  className="block text-sm font-medium text-slate-200 mb-2"
                >
                  Email address
                </label>
                <div className="relative">
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
                    className={`w-full h-12 px-4 rounded-xl text-slate-100 text-base bg-slate-950/80 border transition-all placeholder:text-slate-500 focus:outline-none focus:ring-2 ${
                      fieldErrors.email 
                        ? 'border-rose-500 focus:ring-rose-500/40' 
                        : 'border-slate-700/80 focus:border-blue-500 focus:ring-blue-500/30'
                    }`}
                    placeholder="name@university.edu"
                  />
                </div>
                {fieldErrors.email && (
                  <p className="mt-1.5 text-xs text-rose-400 font-medium pl-1">{fieldErrors.email}</p>
                )}
              </div>

              {/* Form Group 2: Password */}
              <div className="flex flex-col">
                <label 
                  htmlFor="password" 
                  className="block text-sm font-medium text-slate-200 mb-2"
                >
                  Password
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
                    className={`w-full h-12 px-4 pr-12 rounded-xl text-slate-100 text-base bg-slate-950/80 border transition-all placeholder:text-slate-500 focus:outline-none focus:ring-2 ${
                      fieldErrors.password 
                        ? 'border-rose-500 focus:ring-rose-500/40' 
                        : 'border-slate-700/80 focus:border-blue-500 focus:ring-blue-500/30'
                    }`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer transition-colors"
                  >
                    <Icon name={showPassword ? 'eye-off' : 'eye'} className="w-5 h-5" />
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="mt-1.5 text-xs text-rose-400 font-medium pl-1">{fieldErrors.password}</p>
                )}
              </div>

              {/* Primary Action Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 flex items-center justify-center gap-2 rounded-xl font-semibold text-base text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 transition-all duration-150 shadow-lg shadow-blue-950/60 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <span>Sign In</span>
                  )}
                </button>
              </div>
            </form>

            {/* Bottom Security Footer Message */}
            <div className="mt-8 pt-5 border-t border-slate-800/60 flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
              <Icon name="shield-check" className="w-4 h-4 text-slate-500" />
              <span>Authorized access only</span>
            </div>

          </div>
        </section>

      </div>
    </main>
  );
}
