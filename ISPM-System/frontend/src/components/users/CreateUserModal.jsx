/**
 * components/users/CreateUserModal.jsx
 * Modal dialog for System Administrator to create a new user account.
 */
import { useState } from 'react';
import { createUserRequest } from '../../services/user.service.js';
import Icon from '../common/Icon.jsx';

const ROLES = [
  { value: 'SYSTEM_ADMIN', label: 'System Administrator' },
  { value: 'COMPLIANCE_OFFICER', label: 'Compliance Officer' },
  { value: 'TRAINING_ADMIN', label: 'Training Administrator' },
  { value: 'EMPLOYEE', label: 'Employee' },
];

export default function CreateUserModal({ isOpen, onClose, onUserCreated }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'EMPLOYEE',
    department: '',
    phone: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState('');

  if (!isOpen) return null;

  const validate = () => {
    const errors = {};
    if (!formData.firstName.trim()) errors.firstName = 'First name is required.';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required.';
    if (!formData.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      errors.password = 'Password is required.';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long.';
    }

    if (!formData.role) errors.role = 'Role selection is required.';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await createUserRequest(formData);
      if (res.ok) {
        onUserCreated(res.data?.data?.user);
        onClose();
      } else {
        setApiError(res.data?.message || 'Failed to create user. Please verify input.');
      }
    } catch {
      setApiError('Unable to communicate with the server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 z-10"
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-user-title"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                <Icon name="plus" className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 id="create-user-title" className="text-lg font-bold text-white">
                  Add New User
                </h2>
                <p className="text-xs text-slate-400">Provision a new account with assigned role access</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Close modal"
            >
              <Icon name="close" className="w-5 h-5" />
            </button>
          </div>

          {/* API Error Box */}
          {apiError && (
            <div
              role="alert"
              className="mb-4 p-3 rounded-lg bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-center gap-2.5"
            >
              <Icon name="close" className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span className="font-medium">{apiError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label htmlFor="create-firstName" className="block text-xs font-semibold text-slate-300 mb-1">
                  First Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="create-firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="e.g. Jane"
                  className={`w-full px-3 py-2 bg-slate-950 border rounded-lg text-white text-xs focus:outline-none focus:ring-2 ${
                    fieldErrors.firstName
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-slate-700 focus:border-blue-500 focus:ring-blue-500/40'
                  }`}
                />
                {fieldErrors.firstName && <p className="mt-1 text-[11px] text-red-400">{fieldErrors.firstName}</p>}
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="create-lastName" className="block text-xs font-semibold text-slate-300 mb-1">
                  Last Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="create-lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="e.g. Silva"
                  className={`w-full px-3 py-2 bg-slate-950 border rounded-lg text-white text-xs focus:outline-none focus:ring-2 ${
                    fieldErrors.lastName
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-slate-700 focus:border-blue-500 focus:ring-blue-500/40'
                  }`}
                />
                {fieldErrors.lastName && <p className="mt-1 text-[11px] text-red-400">{fieldErrors.lastName}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="create-email" className="block text-xs font-semibold text-slate-300 mb-1">
                Email Address <span className="text-red-400">*</span>
              </label>
              <input
                id="create-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="user@ispm.local"
                className={`w-full px-3 py-2 bg-slate-950 border rounded-lg text-white text-xs focus:outline-none focus:ring-2 ${
                  fieldErrors.email
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-slate-700 focus:border-blue-500 focus:ring-blue-500/40'
                }`}
              />
              {fieldErrors.email && <p className="mt-1 text-[11px] text-red-400">{fieldErrors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="create-password" className="block text-xs font-semibold text-slate-300 mb-1">
                Initial Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="create-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 8 characters"
                  className={`w-full px-3 py-2 pr-10 bg-slate-950 border rounded-lg text-white text-xs focus:outline-none focus:ring-2 ${
                    fieldErrors.password
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-slate-700 focus:border-blue-500 focus:ring-blue-500/40'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  <Icon name={showPassword ? 'eye-off' : 'eye'} className="w-4 h-4" />
                </button>
              </div>
              {fieldErrors.password && <p className="mt-1 text-[11px] text-red-400">{fieldErrors.password}</p>}
            </div>

            {/* Role & Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="create-role" className="block text-xs font-semibold text-slate-300 mb-1">
                  System Role <span className="text-red-400">*</span>
                </label>
                <select
                  id="create-role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
                {fieldErrors.role && <p className="mt-1 text-[11px] text-red-400">{fieldErrors.role}</p>}
              </div>

              <div>
                <label htmlFor="create-department" className="block text-xs font-semibold text-slate-300 mb-1">
                  Department
                </label>
                <input
                  id="create-department"
                  name="department"
                  type="text"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="e.g. IT, Legal, HR"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="create-phone" className="block text-xs font-semibold text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                id="create-phone"
                name="phone"
                type="text"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. +94 77 123 4567"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-md shadow-blue-900/30 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
