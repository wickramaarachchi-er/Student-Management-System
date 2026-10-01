/**
 * components/policies/ArchivePolicyModal.jsx
 * Confirmation modal for archiving an active policy (Compliance Officer only).
 */
import React, { useState } from 'react';
import { archivePolicyRequest } from '../../services/policy.service.js';

export function ArchivePolicyModal({ isOpen, onClose, policy, onArchived }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !policy) return null;

  async function handleArchive() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await archivePolicyRequest(policy.id);
      if (res.ok) {
        if (onArchived) onArchived(res.data?.data?.policy || res.data?.data);
        onClose();
      } else {
        setError(res.data?.message || 'Failed to archive policy.');
      }
    } catch (err) {
      setError('A network error occurred while archiving the policy.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="archive-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 sm:p-8">
        {/* Warning Icon & Header */}
        <div className="flex items-center gap-4 pb-4 border-b border-slate-800">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl text-amber-400 shrink-0">
            ⚠️
          </div>
          <div>
            <h2 id="archive-modal-title" className="text-xl font-bold text-white">
              Archive Policy
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              Confirm policy decommissioning
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
            {error}
          </div>
        )}

        <div className="py-5 space-y-3">
          <p className="text-sm text-slate-300 leading-relaxed">
            Are you sure you want to archive{' '}
            <strong className="text-white font-semibold">{policy.title}</strong>?
          </p>

          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2 text-xs text-slate-300">
            <div className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">•</span>
              <span>
                This policy will <strong className="text-white">no longer appear</strong> in active employee acknowledgement requirements.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">•</span>
              <span>
                All historical versions, audit trails, and signed acknowledgements are <strong className="text-white">permanently preserved</strong> for compliance inspections.
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleArchive}
            disabled={submitting}
            className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-sm font-medium transition-colors shadow-lg shadow-amber-600/20 flex items-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Archiving...</span>
              </>
            ) : (
              <span>Confirm Archive</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
export default ArchivePolicyModal;
