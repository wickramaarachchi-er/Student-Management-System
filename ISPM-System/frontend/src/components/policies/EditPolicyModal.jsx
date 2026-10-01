/**
 * components/policies/EditPolicyModal.jsx
 * Modal dialog for Compliance Officer to update policy metadata.
 */
import { useState, useEffect } from 'react';
import { updatePolicyRequest } from '../../services/policy.service.js';
import Icon from '../common/Icon.jsx';

const POLICY_CATEGORIES = [
  'Access Control',
  'Data Protection',
  'Incident Response',
  'Acceptable Use',
  'Network Security',
  'Password Governance',
  'Remote Work',
  'Vendor Risk Management',
];

export default function EditPolicyModal({ isOpen, policy, onClose, onPolicyUpdated }) {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Access Control',
    description: '',
    targetDepartment: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (policy) {
      setFormData({
        title: policy.title || '',
        category: policy.category || 'Access Control',
        description: policy.description || '',
        targetDepartment: policy.targetDepartment || '',
      });
      setFieldErrors({});
      setApiError('');
    }
  }, [policy]);

  if (!isOpen || !policy) return null;

  const validate = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Policy title is required.';
    if (!formData.category.trim()) errors.category = 'Category is required.';

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
      const payload = {
        ...formData,
        targetDepartment: formData.targetDepartment.trim() || null,
      };
      const res = await updatePolicyRequest(policy.id, payload);
      if (res.ok) {
        if (onPolicyUpdated) onPolicyUpdated(res.data?.data?.policy);
        onClose();
      } else {
        setApiError(res.data?.message || 'Failed to update policy metadata.');
      }
    } catch {
      setApiError('Unable to connect to the server. Please try again.');
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
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                <Icon name="pencil" className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Edit Policy Metadata</h2>
                <p className="text-xs text-slate-400">Update title, category, scope, and description</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              <Icon name="close" className="w-5 h-5" />
            </button>
          </div>

          {/* API Error Alert */}
          {apiError && (
            <div
              role="alert"
              className="mb-4 p-3 rounded-lg bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-center gap-2"
            >
              <Icon name="close" className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span className="font-medium">{apiError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label htmlFor="edit-policy-title" className="block text-xs font-semibold text-slate-300 mb-1">
                Policy Title <span className="text-red-400">*</span>
              </label>
              <input
                id="edit-policy-title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-slate-950 border rounded-lg text-white text-xs focus:outline-none focus:ring-2 ${
                  fieldErrors.title
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-slate-700 focus:border-purple-500 focus:ring-purple-500/40'
                }`}
              />
              {fieldErrors.title && <p className="mt-1 text-[11px] text-red-400">{fieldErrors.title}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-policy-category" className="block text-xs font-semibold text-slate-300 mb-1">
                  Category <span className="text-red-400">*</span>
                </label>
                <select
                  id="edit-policy-category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-purple-500"
                >
                  {POLICY_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="edit-policy-dept" className="block text-xs font-semibold text-slate-300 mb-1">
                  Target Department
                </label>
                <input
                  id="edit-policy-dept"
                  name="targetDepartment"
                  type="text"
                  value={formData.targetDepartment}
                  onChange={handleChange}
                  placeholder="Leave empty for all (Org-wide)"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="edit-policy-desc" className="block text-xs font-semibold text-slate-300 mb-1">
                Description / Objective
              </label>
              <textarea
                id="edit-policy-desc"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-purple-500 resize-none"
              />
            </div>

            {/* Action buttons */}
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
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 transition-colors shadow-md shadow-purple-900/30 disabled:opacity-50"
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
