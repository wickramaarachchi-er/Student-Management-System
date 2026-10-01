/**
 * components/training/ArchiveTrainingModal.jsx
 * Modal dialog for Training Administrator to archive/deactivate a Training Module.
 */
import { useState } from 'react';
import { archiveTrainingRequest } from '../../services/training.service.js';
import Icon from '../common/Icon.jsx';

export default function ArchiveTrainingModal({ isOpen, onClose, trainingModule, onArchived }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  if (!isOpen || !trainingModule) return null;

  const handleArchive = async () => {
    setIsSubmitting(true);
    setApiError('');
    try {
      const res = await archiveTrainingRequest(trainingModule.id);
      if (res.ok && res.data?.success) {
        onArchived(res.data.data.module);
        onClose();
      } else {
        setApiError(res.data?.message || 'Failed to deactivate training module.');
      }
    } catch {
      setApiError('A network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="archive-training-title"
      >
        <div className="p-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mb-4">
            <Icon name="power" className="w-6 h-6" />
          </div>

          <h3 id="archive-training-title" className="text-lg font-bold text-slate-800">
            Deactivate Training Module
          </h3>

          <p className="mt-2 text-xs text-slate-600 leading-relaxed">
            Are you sure you want to deactivate <strong className="text-slate-800">&ldquo;{trainingModule.title}&rdquo;</strong>?
          </p>

          <div className="mt-3 p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-800 leading-relaxed">
            <span className="font-semibold block mb-0.5">Historical Progress Preserved</span>
            This module will be hidden from the active Employee training catalog, but all historical employee training progress and completion records will remain intact.
          </div>

          {apiError && (
            <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
              {apiError}
            </div>
          )}

          <div className="mt-6 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleArchive}
              disabled={isSubmitting}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-amber-600/20 disabled:opacity-60 transition-all flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <Icon name="refresh" className="w-4 h-4 animate-spin" />
                  <span>Deactivating...</span>
                </>
              ) : (
                <>
                  <Icon name="power" className="w-4 h-4" />
                  <span>Deactivate Module</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
