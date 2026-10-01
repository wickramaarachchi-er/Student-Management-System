/**
 * components/policies/CreateVersionModal.jsx
 * Modal dialog for Compliance Officer to create a new revision/version of a policy.
 */
import { useState, useEffect } from 'react';
import { createPolicyVersionRequest } from '../../services/policy.service.js';
import Icon from '../common/Icon.jsx';

export default function CreateVersionModal({ isOpen, policy, onClose, onVersionCreated }) {
  const [versionNumber, setVersionNumber] = useState(1);
  const [content, setContent] = useState('');
  const [changeSummary, setChangeSummary] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (policy) {
      // Suggest next version number
      const nextNum = (policy.versionCount || 0) + 1;
      setVersionNumber(nextNum);
      setContent('');
      setChangeSummary('');
      setFieldErrors({});
      setApiError('');
    }
  }, [policy]);

  if (!isOpen || !policy) return null;

  const validate = () => {
    const errors = {};
    if (!versionNumber || versionNumber < 1) {
      errors.versionNumber = 'Version number must be a positive integer (e.g. 1, 2, 3).';
    }
    if (!content.trim()) {
      errors.content = 'Policy content is required.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await createPolicyVersionRequest(policy.id, {
        versionNumber: Number(versionNumber),
        content: content.trim(),
        changeSummary: changeSummary.trim() || undefined,
      });

      if (res.ok) {
        onVersionCreated(res.data?.data?.version);
        onClose();
      } else {
        setApiError(res.data?.message || 'Failed to create policy version.');
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
          className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 z-10"
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                <Icon name="clipboard-list" className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  Create Policy Version
                </h2>
                <p className="text-xs text-slate-400 truncate max-w-md">
                  Target: <strong className="text-slate-200">{policy.title}</strong>
                </p>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Version Number */}
              <div>
                <label htmlFor="version-number" className="block text-xs font-semibold text-slate-300 mb-1">
                  Version Number (Integer) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-xs">v</span>
                  <input
                    id="version-number"
                    type="number"
                    min="1"
                    step="1"
                    value={versionNumber}
                    onChange={(e) => setVersionNumber(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                {fieldErrors.versionNumber && <p className="mt-1 text-[11px] text-red-400">{fieldErrors.versionNumber}</p>}
              </div>

              {/* Change Summary */}
              <div>
                <label htmlFor="version-summary" className="block text-xs font-semibold text-slate-300 mb-1">
                  Change Summary / Revision Notes
                </label>
                <input
                  id="version-summary"
                  type="text"
                  value={changeSummary}
                  onChange={(e) => setChangeSummary(e.target.value)}
                  placeholder="e.g. Annual policy review and MFA mandate"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Policy Content */}
            <div>
              <label htmlFor="version-content" className="block text-xs font-semibold text-slate-300 mb-1">
                Full Policy Content (Requirements, Controls, Guidelines) <span className="text-red-400">*</span>
              </label>
              <textarea
                id="version-content"
                rows={9}
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  if (fieldErrors.content) setFieldErrors({ ...fieldErrors, content: '' });
                }}
                placeholder="Enter complete policy clauses, mandatory compliance rules, responsibilities, and procedural requirements..."
                className={`w-full p-3 bg-slate-950 border rounded-lg text-white text-xs font-mono leading-relaxed focus:outline-none resize-y ${
                  fieldErrors.content
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                }`}
              />
              {fieldErrors.content && <p className="mt-1 text-[11px] text-red-400">{fieldErrors.content}</p>}
            </div>

            {/* Notice */}
            <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-800/60 text-[11px] text-blue-300 flex items-start gap-2">
              <Icon name="shield-check" className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <span>
                New versions are created in <strong>DRAFT</strong> status. Historical versions are preserved. You can publish this revision when ready to mandate employee re-acknowledgement.
              </span>
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
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-md shadow-blue-900/30 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Version Draft</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
