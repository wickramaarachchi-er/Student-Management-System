/**
 * components/policies/PublishVersionModal.jsx
 * Confirmation modal for Compliance Officer to publish a policy version.
 */
import { useState, useEffect } from 'react';
import { publishPolicyVersionRequest, getPolicyRequest } from '../../services/policy.service.js';
import Icon from '../common/Icon.jsx';

export default function PublishVersionModal({ isOpen, policy, onClose, onVersionPublished }) {
  const [versions, setVersions] = useState([]);
  const [selectedVersionId, setSelectedVersionId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (policy && isOpen) {
      setIsLoading(true);
      setApiError('');
      getPolicyRequest(policy.id)
        .then((res) => {
          if (res.ok && res.data?.data?.policy) {
            const vers = res.data.data.policy.versions || [];
            setVersions(vers);
            if (vers.length > 0) {
              setSelectedVersionId(vers[0].id);
            }
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [policy, isOpen]);

  if (!isOpen || !policy) return null;

  const selectedVersion = versions.find((v) => v.id === selectedVersionId);

  const handlePublish = async () => {
    if (!selectedVersionId) return;

    setIsSubmitting(true);
    setApiError('');
    try {
      const res = await publishPolicyVersionRequest(policy.id, selectedVersionId);
      if (res.ok) {
        onVersionPublished(res.data?.data?.policy);
        onClose();
      } else {
        setApiError(res.data?.message || 'Failed to publish policy version.');
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
              <div className="w-10 h-10 rounded-xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Icon name="check" className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Publish Policy Version</h2>
                <p className="text-xs text-slate-400">Release active version for employee compliance</p>
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

          {isLoading ? (
            <div className="py-8 text-center">
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-400">Loading version details...</p>
            </div>
          ) : versions.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-xs text-amber-400 mb-3">
                No versions have been drafted for this policy yet.
              </p>
              <p className="text-xs text-slate-400">
                Please create Version 1.0 before publishing.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label htmlFor="select-version" className="block text-xs font-semibold text-slate-300 mb-1">
                  Select Version to Publish
                </label>
                <select
                  id="select-version"
                  value={selectedVersionId}
                  onChange={(e) => setSelectedVersionId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  {versions.map((v) => (
                    <option key={v.id} value={v.id}>
                      Version {v.versionNumber} (Created: {new Date(v.createdAt).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Warning / Explanation Banner */}
              <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-200 space-y-2 leading-relaxed">
                <div className="flex items-center gap-2 font-semibold text-amber-300">
                  <Icon name="shield-check" className="w-4 h-4 text-amber-400" />
                  <span>Important Compliance Impact</span>
                </div>
                <p>
                  Publishing <strong>Version {selectedVersion?.versionNumber}</strong> will make it the active official policy for{' '}
                  <span className="underline font-semibold">
                    {policy.targetDepartment ? `${policy.targetDepartment} Department` : 'All Employees (Org-wide)'}
                  </span>.
                </p>
                <p className="text-[11px] text-amber-300/80">
                  ⚠️ Employees who previously acknowledged an earlier version will be required to review and acknowledge this new version. Historical acknowledgement records for earlier versions remain securely preserved in audit trails.
                </p>
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
                  type="button"
                  onClick={handlePublish}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-md shadow-emerald-900/30 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <span>Confirm & Publish Version</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
