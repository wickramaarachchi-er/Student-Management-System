/**
 * pages/LoginPage.jsx
 * Enterprise authentication layout for the ISPM Platform.
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

  const fillCredentials = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Ispm@Dev2024!');
    setErrorMessage('');
    setFieldErrors({});
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      {/* Background Subtle Security Pattern Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(30,64,175,0.15),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(15,23,42,0.8),transparent_50%)] pointer-events-none" />

      <div className="max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left Branding / Overview Panel (Desktop Only or Top on Mobile) */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-8 pr-0 lg:pr-6">
          <div>
            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wide uppercase mb-6">
              <Icon name="shield" className="w-4 h-4" />
              <span>University Security Governance Portal</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight leading-tight">
              Information Security Policy & Management
            </h1>
            <p className="mt-3 text-base text-slate-300 leading-relaxed">
              Centralized platform for policy distribution, mandatory awareness training, automated compliance tracking, and administrative audit monitoring.
            </p>
          </div>

          {/* Key Platform Capabilities List */}
          <div className="space-y-4 pt-2 border-t border-slate-800/80">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0 mt-0.5">
                <Icon name="shield-check" className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-200">Policy Lifecycle & Version Control</h4>
                <p className="text-xs text-slate-400">Formal policy publishing, version history, and legally binding employee acknowledgements.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0 mt-0.5">
                <Icon name="academic-cap" className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-200">Cyber Awareness & Knowledge Scoring</h4>
                <p className="text-xs text-slate-400">Interactive training modules, locked quiz prerequisite gates, and real-time pass/fail metrics.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0 mt-0.5">
                <Icon name="chart" className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-200">Executive Compliance Auditing</h4>
                <p className="text-xs text-slate-400">Departmental breakdowns, overall compliance scoring, and detailed audit log tracking.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Authentication Form Panel */}
        <div className="lg:col-span-6">
          <div className="bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-md">
            
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-slate-100">Sign In to Your Account</h2>
                <p className="text-xs text-slate-400 mt-1">Enter your credentials to access your security portal</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <Icon name="lock" className="w-5 h-5" />
              </div>
            </div>

            {errorMessage && (
              <div role="alert" className="mb-5 p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-3">
                <Icon name="close" className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{errorMessage}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address <span className="text-rose-400">*</span>
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
                  className={`w-full px-3.5 py-2.5 bg-slate-950 border rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 transition-all placeholder:text-slate-600 ${
                    fieldErrors.email ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-800 focus:border-blue-500 focus:ring-blue-500/40'
                  }`}
                  placeholder="name@university.edu"
                />
                {fieldErrors.email && <p className="mt-1 text-xs text-rose-400">{fieldErrors.email}</p>}
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Password <span className="text-rose-400">*</span>
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
                    className={`w-full px-3.5 py-2.5 pr-11 bg-slate-950 border rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 transition-all placeholder:text-slate-600 ${
                      fieldErrors.password ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-800 focus:border-blue-500 focus:ring-blue-500/40'
                    }`}
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1 rounded-lg focus:outline-none"
                  >
                    <Icon name={showPassword ? 'eye-off' : 'eye'} className="w-4 h-4" />
                  </button>
                </div>
                {fieldErrors.password && <p className="mt-1 text-xs text-rose-400">{fieldErrors.password}</p>}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 transition-all shadow-lg shadow-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <span>Sign In to Portal</span>
                  )}
                </button>
              </div>
            </form>

            {/* Quick Demo Role Selector for University Demonstration */}
            <div className="mt-6 pt-5 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Demo Role Accounts</span>
                <span className="text-[10px] text-slate-500 font-medium">Click to populate demo account</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => fillCredentials('admin@ispm.local')}
                  className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-all group cursor-pointer"
                >
                  <div className="font-semibold text-purple-300 group-hover:text-purple-200">System Admin</div>
                  <div className="text-[10px] text-slate-400 truncate">admin@ispm.local</div>
                </button>

                <button
                  type="button"
                  onClick={() => fillCredentials('compliance@ispm.local')}
                  className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-all group cursor-pointer"
                >
                  <div className="font-semibold text-emerald-300 group-hover:text-emerald-200">Compliance Officer</div>
                  <div className="text-[10px] text-slate-400 truncate">compliance@ispm.local</div>
                </button>

                <button
                  type="button"
                  onClick={() => fillCredentials('training@ispm.local')}
                  className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-all group cursor-pointer"
                >
                  <div className="font-semibold text-amber-300 group-hover:text-amber-200">Training Admin</div>
                  <div className="text-[10px] text-slate-400 truncate">training@ispm.local</div>
                </button>

                <button
                  type="button"
                  onClick={() => fillCredentials('employee@ispm.local')}
                  className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-all group cursor-pointer"
                >
                  <div className="font-semibold text-blue-300 group-hover:text-blue-200">Primary Employee</div>
                  <div className="text-[10px] text-slate-400 truncate">employee@ispm.local</div>
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
