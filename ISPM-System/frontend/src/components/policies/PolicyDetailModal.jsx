/**
 * components/policies/PolicyDetailModal.jsx
 * Policy reading experience for Employees and version inspector for Compliance Officers.
 * Includes intentional checkbox confirmation for employee acknowledgement.
 */
import React, { useState, useEffect } from 'react';
import { getPolicyRequest, acknowledgePolicyRequest } from '../../services/policy.service.js';

export function PolicyDetailModal({ isOpen, onClose, policyId, userRole, onAcknowledged }) {
  const [loading, setLoading] = useState(false);
  const [policy, setPolicy] = useState(null);
  const [error, setError] = useState(null);
  const [selectedVersionId, setSelectedVersionId] = useState(null);

  // Acknowledgement interaction state for Employee
  const [confirmedRead, setConfirmedRead] = useState(false);
  const [submittingAck, setSubmittingAck] = useState(false);
  const [ackSuccess, setAckSuccess] = useState(false);
  const [ackError, setAckError] = useState(null);

  useEffect(() => {
    if (!isOpen || !policyId) return;
    loadPolicyDetails();
    setConfirmedRead(false);
    setAckSuccess(false);
    setAckError(null);
  }, [isOpen, policyId]);

  async function loadPolicyDetails() {
    setLoading(true);
    setError(null);
    try {
      const res = await getPolicyRequest(policyId);
      if (res.ok) {
        const data = res.data?.data?.policy || res.data?.data;
        setPolicy(data);
        // Default selected version to current published version or latest version
        if (data.currentVersion?.id) {
          setSelectedVersionId(data.currentVersion.id);
        } else if (data.versions && data.versions.length > 0) {
          setSelectedVersionId(data.versions[0].id);
        }
      } else {
        setError(res.data?.message || 'Failed to load policy details.');
      }
    } catch (err) {
      setError('A network error occurred while loading the policy.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAcknowledge() {
    if (!confirmedRead) return;
    setSubmittingAck(true);
    setAckError(null);
    try {
      const res = await acknowledgePolicyRequest(policyId);
      if (res.ok) {
        setAckSuccess(true);
        // Update local policy state
        setPolicy((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            userAcknowledgement: {
              acknowledged: true,
              acknowledgedAt: res.data.data?.acknowledgedAt || new Date().toISOString(),
              versionId: res.data.data?.policyVersionId,
            },
          };
        });
        if (onAcknowledged) {
          onAcknowledged(res.data.data);
        }
      } else {
        setAckError(res.data?.message || 'Failed to acknowledge policy.');
      }
    } catch (err) {
      setAckError('A network error occurred while acknowledging the policy.');
    } finally {
      setSubmittingAck(false);
    }
  }

  if (!isOpen) return null;

  const currentVersion = policy?.currentVersion;
  const versionsList = policy?.versions || [];
  const activeVersion =
    versionsList.find((v) => v.id === selectedVersionId) ||
    currentVersion ||
    (versionsList.length > 0 ? versionsList[0] : null);

  const isEmployee = userRole === 'EMPLOYEE';
  const isComplianceOfficer = userRole === 'COMPLIANCE_OFFICER';

  const isAcknowledged = policy?.userAcknowledgement?.acknowledged === true;
  const acknowledgedAt = policy?.userAcknowledgement?.acknowledgedAt;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl p-6 sm:p-8 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-5 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {policy?.category?.replace(/_/g, ' ') || 'SECURITY POLICY'}
              </span>

              {policy?.targetDepartment ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  Target: {policy.targetDepartment}
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-700/50 text-slate-300 border border-slate-600/30">
                  Target: All Departments
                </span>
              )}

              {/* Status Badge */}
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  policy?.status === 'PUBLISHED'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : policy?.status === 'ARCHIVED'
                    ? 'bg-slate-700 text-slate-400'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}
              >
                {policy?.status || 'DRAFT'}
              </span>

              {/* Employee Acknowledgement Badge in Header */}
              {isEmployee && (
                <span
                  className={`px-3 py-0.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                    isAcknowledged
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                      : 'bg-rose-950/80 text-rose-300 border border-rose-500/40 animate-pulse'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isAcknowledged ? 'bg-emerald-400' : 'bg-rose-400'
                    }`}
                  ></span>
                  {isAcknowledged ? 'Acknowledged' : 'Acknowledgement Required'}
                </span>
              )}
            </div>

            <h2 id="detail-modal-title" className="text-xl sm:text-2xl font-bold text-white mt-1">
              {policy?.title || 'Loading Policy...'}
            </h2>
            {policy?.description && (
              <p className="text-sm text-slate-400">{policy.description}</p>
            )}
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto py-5 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-sm">Loading policy content...</p>
            </div>
          ) : policy ? (
            <>
              {/* Version Selector for Compliance Officer or Multi-version view */}
              {isComplianceOfficer && versionsList.length > 1 && (
                <div className="flex items-center gap-2 p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 text-xs">
                  <span className="text-slate-400 font-medium">Select Version to Inspect:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {versionsList.map((ver) => {
                      const isCurrent = currentVersion?.id === ver.id;
                      const isSelected = selectedVersionId === ver.id;
                      return (
                        <button
                          key={ver.id}
                          type="button"
                          onClick={() => setSelectedVersionId(ver.id)}
                          className={`px-3 py-1 rounded-lg font-mono transition-colors flex items-center gap-1 ${
                            isSelected
                              ? 'bg-indigo-600 text-white font-bold'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <span>v{ver.versionNumber}</span>
                          {isCurrent && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                              Published
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Version Meta Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-800/40 rounded-xl border border-slate-800 text-xs text-slate-300">
                <div>
                  <span className="text-slate-500 block">Viewing Version</span>
                  <span className="font-mono font-bold text-white text-sm">
                    v{activeVersion?.versionNumber || policy.version || '1.0'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Published Date</span>
                  <span className="text-white font-medium">
                    {policy.publishedAt
                      ? new Date(policy.publishedAt).toLocaleDateString()
                      : 'Unpublished'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Effective Date</span>
                  <span className="text-white font-medium">
                    {activeVersion?.effectiveDate
                      ? new Date(activeVersion.effectiveDate).toLocaleDateString()
                      : 'Immediate'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Created By</span>
                  <span className="text-white font-medium">
                    {policy.creator
                      ? `${policy.creator.firstName} ${policy.creator.lastName}`
                      : 'Compliance Officer'}
                  </span>
                </div>
              </div>

              {/* Change summary if present */}
              {activeVersion?.changeSummary && (
                <div className="p-3 bg-indigo-950/20 border border-indigo-500/20 rounded-xl text-xs">
                  <span className="font-semibold text-indigo-300 block mb-0.5">Version Change Summary:</span>
                  <p className="text-indigo-200/90">{activeVersion.changeSummary}</p>
                </div>
              )}

              {/* Full Policy Content */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Policy Document Content
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">
                    {activeVersion?.content?.length || 0} characters
                  </span>
                </div>
                <div className="p-5 sm:p-6 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans max-h-96 overflow-y-auto select-text shadow-inner">
                  {activeVersion?.content || policy.description || 'No content provided for this policy.'}
                </div>
              </div>

              {/* Employee Acknowledgement Box */}
              {isEmployee && (
                <div className="p-5 rounded-xl border transition-all duration-300 bg-slate-800/40 border-slate-700/60">
                  {isAcknowledged ? (
                    <div className="flex items-center gap-3 text-emerald-400">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xl shrink-0">
                        ✓
                      </div>
                      <div>
                        <div className="font-bold text-white text-base">
                          Policy Acknowledged
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          You confirmed and acknowledged version{' '}
                          <strong className="text-emerald-400 font-mono">
                            {currentVersion?.versionNumber || policy.version}
                          </strong>{' '}
                          on{' '}
                          <strong className="text-white">
                            {acknowledgedAt ? new Date(acknowledgedAt).toLocaleString() : 'today'}
                          </strong>
                          . Your record has been audited.
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-xl text-rose-400 shrink-0">
                          ✍️
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-base">
                            Mandatory Employee Acknowledgement Required
                          </h4>
                          <p className="text-xs text-slate-400 mt-0.5">
                            As part of organizational compliance, you must read the entire document above and confirm your understanding.
                          </p>
                        </div>
                      </div>

                      {ackError && (
                        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                          {ackError}
                        </div>
                      )}

                      {/* Confirmation Checkbox */}
                      <label className="flex items-start gap-3 p-3.5 bg-slate-900/80 rounded-xl border border-slate-700/80 cursor-pointer hover:border-emerald-500/60 transition-colors">
                        <input
                          type="checkbox"
                          id="ack-confirm-checkbox"
                          checked={confirmedRead}
                          onChange={(e) => setConfirmedRead(e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded border-slate-700 text-emerald-600 focus:ring-emerald-500 bg-slate-800"
                        />
                        <span className="text-xs text-slate-300 font-medium leading-relaxed">
                          I confirm that I have read, understood, and agree to comply with the guidelines set forth in this Information Security Policy (Version {currentVersion?.versionNumber || policy.version}).
                        </span>
                      </label>

                      {/* Acknowledge Button */}
                      <div className="flex justify-end">
                        <button
                          type="button"
                          id="ack-submit-btn"
                          onClick={handleAcknowledge}
                          disabled={!confirmedRead || submittingAck}
                          className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2"
                        >
                          {submittingAck ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Submitting Acknowledgement...</span>
                            </>
                          ) : (
                            <>
                              <span>✓</span>
                              <span>Submit Policy Acknowledgement</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
export default PolicyDetailModal;
