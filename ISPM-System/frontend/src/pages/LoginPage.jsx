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

  const quickLogins = [
    { label: 'Employee', email: 'employee@ispm.local', role: 'EMPLOYEE' },
    { label: 'Compliance Officer', email: 'compliance@ispm.local', role: 'COMPLIANCE_OFFICER' },
    { label: 'Admin', email: 'admin@ispm.local', role: 'SYSTEM_ADMIN' },
  ];

  const handleQuickFill = (userEmail) => {
    setEmail(userEmail);
    setPassword('Ispm@Dev2024!');
    setFieldErrors({});
    setErrorMessage('');
  };

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
    <main className="min-h-screen bg-[#030712] text-slate-100 flex items-center justify-center p-6 sm:p-10 lg:p-16 relative overflow-hidden font-sans">
      {/* Background Decorative Gradient Orbs */}
      <div
        aria-hidden="true"
        className="absolute -top-48 -left-48 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-48 -right-48 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:32px_32px] opacity-20 pointer-events-none"
      />

      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 xl:gap-20 items-center relative z-10 py-8 my-auto">

        {/* LEFT SIDE: Brand & Value Prop */}
        <section
          aria-label="Product Information"
          className="lg:col-span-7 flex flex-col justify-center space-y-8 lg:pr-6"
        >
          {/* Brand Mark */}
          <div className="inline-flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
              <Icon name="shield" className="w-6 h-6" />
            </div>
            <div>
              <div className="text-lg font-black tracking-wider text-white uppercase flex items-center gap-2">
                ISPM
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              </div>
              <div className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
                Information Security Platform
              </div>
            </div>
          </div>

          {/* Main Headline */}
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
              Enterprise Security & <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400">
                Compliance Management
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed font-normal">
              A unified portal for security policies, awareness training, employee compliance tracking, and security audit readiness.
            </p>
          </div>

          {/* Value Prop Features */}
          <div className="grid grid-cols-1 gap-4 pt-2 max-w-xl">
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-[#060e22] border border-[#142347] hover:border-[#1e3a75] transition-all shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                <Icon name="shield-check" className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h2 className="text-sm font-bold text-white">Policy Lifecycle & Acknowledgements</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Version-controlled policy publishing with mandatory employee signature logs and audit trails.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-2xl bg-[#060e22] border border-[#142347] hover:border-[#1e3a75] transition-all shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
                <Icon name="academic-cap" className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h2 className="text-sm font-bold text-white">Awareness Training & Knowledge Quizzes</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Interactive cyber hygiene modules and assessments that automatically evaluate compliance readiness.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT SIDE: Spacious, High-End Login Card */}
        <section
          aria-label="User Authentication"
          className="lg:col-span-5 flex justify-center w-full"
        >
          <div className="w-full max-w-[480px] bg-[#060e22] border border-[#142347] rounded-3xl shadow-2xl p-8 sm:p-10 backdrop-blur-xl relative">

            {/* Top Security Header */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-xl shadow-blue-950/50 mx-auto mb-4">
                <Icon name="lock" className="w-7 h-7" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Welcome back
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-2">
                Sign in to your enterprise security portal
              </p>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div
                role="alert"
                className="mb-6 p-4 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs sm:text-sm flex items-start gap-3"
              >
                <Icon name="close" className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="flex-1 font-medium">{errorMessage}</span>
              </div>
            )}

            {/* Main Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-6">

              {/* Email Input */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-xs sm:text-sm font-semibold text-slate-200 uppercase tracking-wider"
                >
                  Email Address
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
                    className={`w-full h-12 px-4 rounded-xl text-slate-100 text-sm bg-[#030712] border transition-all placeholder:text-slate-500 focus:outline-none focus:ring-2 ${
                      fieldErrors.email
                        ? 'border-rose-500 focus:ring-rose-500/40'
                        : 'border-[#142347] focus:border-blue-500 focus:ring-blue-500/40'
                    }`}
                    placeholder="e.g. employee@ispm.local"
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-xs text-rose-400 font-medium pl-1">{fieldErrors.email}</p>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-xs sm:text-sm font-semibold text-slate-200 uppercase tracking-wider"
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
                    className={`w-full h-12 px-4 pr-12 rounded-xl text-slate-100 text-sm bg-[#030712] border transition-all placeholder:text-slate-500 focus:outline-none focus:ring-2 ${
                      fieldErrors.password
                        ? 'border-rose-500 focus:ring-rose-500/40'
                        : 'border-[#142347] focus:border-blue-500 focus:ring-blue-500/40'
                    }`}
                    placeholder="Enter your security password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-colors"
                  >
                    <Icon name={showPassword ? 'eye-off' : 'eye'} className="w-5 h-5" />
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-xs text-rose-400 font-medium pl-1">{fieldErrors.password}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 flex items-center justify-center gap-2 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 transition-all shadow-lg shadow-blue-950/60 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <span>Sign In to Dashboard →</span>
                  )}
                </button>
              </div>
            </form>

            {/* Quick Demo Fill Buttons */}
            <div className="mt-7 pt-5 border-t border-[#142347]">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 text-center">
                Quick Demo Accounts
              </div>
              <div className="grid grid-cols-3 gap-2">
                {quickLogins.map((acc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickFill(acc.email)}
                    className="px-2 py-1.5 rounded-lg bg-[#030712] hover:bg-[#0b1633] border border-[#142347] hover:border-blue-500/50 text-[11px] font-semibold text-slate-300 hover:text-blue-400 transition-all text-center truncate"
                  >
                    {acc.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer Notice */}
            <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-500 font-medium">
              <Icon name="shield-check" className="w-3.5 h-3.5 text-slate-500" />
              <span>TLS 1.3 Encrypted &bull; ISO 27001 Certified Access</span>
            </div>

          </div>
        </section>

      </div>
    </main>
  );
}
