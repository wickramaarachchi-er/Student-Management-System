/**
 * components/users/StatusConfirmModal.jsx
 * Confirmation dialog for activating or deactivating a user account.
 */
import { useState } from 'react';
import { updateUserStatusRequest } from '../../services/user.service.js';
import Icon from '../common/Icon.jsx';

export default function StatusConfirmModal({ isOpen, user, onClose, onStatusChanged }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  if (!isOpen || !user) return null;

  const willActivate = !user.isActive;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setApiError('');

    try {
      const res = await updateUserStatusRequest(user.id, willActivate);
      if (res.ok) {
        onStatusChanged(res.data?.data?.user);
        onClose();
      } else {
        setApiError(res.data?.message || 'Failed to update user status.');
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
          className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 z-10"
          role="dialog"
          aria-modal="true"
        >
          {/* Icon and Title */}
          <div className="flex items-start gap-4 mb-4">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                willActivate
                  ? 'bg-emerald-600/10 border border-emerald-500/20 text-emerald-400'
                  : 'bg-red-600/10 border border-red-500/20 text-red-400'
              }`}
            >
              <Icon name="power" className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {willActivate ? 'Activate User Account' : 'Deactivate User Account'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Confirmation required</p>
            </div>
          </div>

          {/* Description Content */}
          <div className="text-xs text-slate-300 space-y-2 mb-5 leading-relaxed bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
            <p>
              Are you sure you want to{' '}
              <strong className={willActivate ? 'text-emerald-400' : 'text-red-400'}>
                {willActivate ? 'activate' : 'deactivate'}
              </strong>{' '}
              the following account?
            </p>
            <div className="font-mono text-[11px] text-slate-200">
              {user.firstName} {user.lastName} ({user.email})
            </div>
            {!willActivate && (
              <p className="text-amber-400/90 text-[11px] pt-1 border-t border-slate-800">
                ⚠️ Once deactivated, the user will be immediately rejected upon attempting to log in or make API calls. Audit and history records are preserved.
              </p>
            )}
          </div>

          {/* Error message */}
          {apiError && (
            <div
              role="alert"
              className="mb-4 p-3 rounded-lg bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-center gap-2"
            >
              <Icon name="close" className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

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
              type="button"
              onClick={handleConfirm}
              disabled={isSubmitting}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold text-white transition-colors shadow-md disabled:opacity-50 ${
                willActivate
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/30'
                  : 'bg-red-600 hover:bg-red-500 shadow-red-900/30'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Confirm {willActivate ? 'Activation' : 'Deactivation'}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
