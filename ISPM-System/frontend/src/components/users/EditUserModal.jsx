/**
 * components/users/EditUserModal.jsx
 * Modal dialog for System Administrator to edit user profile details.
 * (Password is explicitly excluded per security requirements).
 */
import { useState, useEffect } from 'react';
import { updateUserRequest } from '../../services/user.service.js';
import Icon from '../common/Icon.jsx';

const ROLES = [
  { value: 'SYSTEM_ADMIN', label: 'System Administrator' },
  { value: 'COMPLIANCE_OFFICER', label: 'Compliance Officer' },
  { value: 'TRAINING_ADMIN', label: 'Training Administrator' },
  { value: 'EMPLOYEE', label: 'Employee' },
];

export default function EditUserModal({ isOpen, user, onClose, onUserUpdated }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'EMPLOYEE',
    department: '',
    phone: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        role: user.role || 'EMPLOYEE',
        department: user.department || '',
        phone: user.phone || '',
      });
      setFieldErrors({});
      setApiError('');
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const validate = () => {
    const errors = {};
    if (!formData.firstName.trim()) errors.firstName = 'First name is required.';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required.';
    if (!formData.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }
    if (!formData.role) errors.role = 'Role is required.';

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
      const res = await updateUserRequest(user.id, formData);
      if (res.ok) {
        onUserUpdated(res.data?.data?.user);
        onClose();
      } else {
        setApiError(res.data?.message || 'Failed to update user. Please verify input.');
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
          aria-labelledby="edit-user-title"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                <Icon name="pencil" className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 id="edit-user-title" className="text-lg font-bold text-white">
                  Edit User Profile
                </h2>
                <p className="text-xs text-slate-400">Update account metadata and role permissions</p>
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
                <label htmlFor="edit-firstName" className="block text-xs font-semibold text-slate-300 mb-1">
                  First Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="edit-firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
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
                <label htmlFor="edit-lastName" className="block text-xs font-semibold text-slate-300 mb-1">
                  Last Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="edit-lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
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
              <label htmlFor="edit-email" className="block text-xs font-semibold text-slate-300 mb-1">
                Email Address <span className="text-red-400">*</span>
              </label>
              <input
                id="edit-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-slate-950 border rounded-lg text-white text-xs focus:outline-none focus:ring-2 ${
                  fieldErrors.email
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-slate-700 focus:border-blue-500 focus:ring-blue-500/40'
                }`}
              />
              {fieldErrors.email && <p className="mt-1 text-[11px] text-red-400">{fieldErrors.email}</p>}
            </div>

            {/* Role & Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-role" className="block text-xs font-semibold text-slate-300 mb-1">
                  System Role <span className="text-red-400">*</span>
                </label>
                <select
                  id="edit-role"
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
                <label htmlFor="edit-department" className="block text-xs font-semibold text-slate-300 mb-1">
                  Department
                </label>
                <input
                  id="edit-department"
                  name="department"
                  type="text"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="edit-phone" className="block text-xs font-semibold text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                id="edit-phone"
                name="phone"
                type="text"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
              />
            </div>

            {/* Info Notice about Password */}
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
              <Icon name="lock" className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <span>Passwords cannot be viewed or edited here. A dedicated password reset workflow is used.</span>
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
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
