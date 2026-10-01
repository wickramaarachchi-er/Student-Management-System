/**
 * components/training/TrainingDetailModal.jsx
 * Modal displaying full training module content, resource link, and Employee start/completion workflow.
 */
import { useState, useEffect } from 'react';
import { getTrainingRequest, startTrainingRequest, completeTrainingRequest } from '../../services/training.service.js';
import Icon from '../common/Icon.jsx';

export default function TrainingDetailModal({
  isOpen,
  onClose,
  moduleId,
  userRole,
  onProgressUpdated,
}) {
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Workflow states for employee
  const [isStarting, setIsStarting] = useState(false);
  const [showConfirmComplete, setShowConfirmComplete] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [actionError, setActionError] = useState('');

  const isEmployee = userRole === 'EMPLOYEE';

  useEffect(() => {
    if (isOpen && moduleId) {
      loadModule();
    } else {
      setModule(null);
      setShowConfirmComplete(false);
      setActionError('');
    }
  }, [isOpen, moduleId]);

  const loadModule = async () => {
    setLoading(true);
    setError('');
    setActionError('');
    setShowConfirmComplete(false);

    try {
      const res = await getTrainingRequest(moduleId);
      if (res.ok && res.data?.success) {
        setModule(res.data.data.module);
      } else {
        setError(res.data?.message || 'Failed to load training module.');
      }
    } catch {
      setError('A network error occurred while loading content.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTraining = async () => {
    setIsStarting(true);
    setActionError('');
    try {
      const res = await startTrainingRequest(moduleId);
      if (res.ok && res.data?.success) {
        const updatedProgress = res.data.data.progress;
        setModule((prev) => ({
          ...prev,
          userProgress: updatedProgress,
        }));
        if (onProgressUpdated) onProgressUpdated();
      } else {
        setActionError(res.data?.message || 'Could not start training.');
      }
    } catch {
      setActionError('Network error while starting training.');
    } finally {
      setIsStarting(false);
    }
  };

  const handleCompleteTraining = async () => {
    setIsCompleting(true);
    setActionError('');
    try {
      const res = await completeTrainingRequest(moduleId);
      if (res.ok && res.data?.success) {
        const updatedProgress = res.data.data.progress;
        setModule((prev) => ({
          ...prev,
          userProgress: updatedProgress,
        }));
        setShowConfirmComplete(false);
        if (onProgressUpdated) onProgressUpdated();
      } else {
        setActionError(res.data?.message || 'Could not mark training as complete.');
      }
    } catch {
      setActionError('Network error while completing training.');
    } finally {
      setIsCompleting(false);
    }
  };

  if (!isOpen) return null;

  const currentStatus = module?.userProgress?.status || 'NOT_STARTED';
  const completedAt = module?.userProgress?.completedAt;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="training-detail-title"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Icon name="academic-cap" className="w-5 h-5" />
            </div>
            <div>
              <h2 id="training-detail-title" className="text-lg font-bold text-slate-800 line-clamp-1">
                {loading ? 'Loading Training Module...' : module?.title}
              </h2>
              <div className="flex items-center space-x-2 mt-0.5">
                {module?.isPublished ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Published
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                    Draft
                  </span>
                )}
                {isEmployee && (
                  <>
                    <span className="text-slate-300">•</span>
                    {currentStatus === 'COMPLETED' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <Icon name="check" className="w-3 h-3 mr-1" />
                        Completed
                      </span>
                    ) : currentStatus === 'IN_PROGRESS' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        In Progress
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                        Not Started
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <Icon name="close" className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-3">
              <Icon name="refresh" className="w-8 h-8 animate-spin text-indigo-500" />
              <p className="text-sm font-medium">Loading training curriculum...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
              {error}
            </div>
          ) : module ? (
            <>
              {/* Summary Banner */}
              {module.description && (
                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl text-sm text-slate-700 leading-relaxed">
                  <p className="font-semibold text-slate-800 mb-1 text-xs uppercase tracking-wider">
                    Overview & Objective
                  </p>
                  {module.description}
                </div>
              )}

              {/* Resource URL Link if present */}
              {module.resourceUrl && (
                <div className="flex items-center justify-between p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                  <div className="flex items-center space-x-2 text-indigo-900 text-xs font-medium">
                    <Icon name="book" className="w-4 h-4 text-indigo-600" />
                    <span>External Course Materials & Reference Slides</span>
                  </div>
                  <a
                    href={module.resourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center space-x-1"
                  >
                    <span>Open Material</span>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              )}

              {/* Training Content View */}
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                  Training Curriculum
                </h3>
                <div className="p-5 bg-white border border-slate-200 rounded-xl text-slate-800 font-sans text-sm leading-relaxed whitespace-pre-wrap">
                  {module.content || 'No content authored for this module yet.'}
                </div>
              </div>

              {/* Employee Completion Status Banner */}
              {isEmployee && currentStatus === 'COMPLETED' && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-3 text-emerald-900">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 flex-shrink-0">
                    <Icon name="check" className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-emerald-800">
                      You have completed this training module!
                    </p>
                    <p className="text-xs text-emerald-600">
                      Completed on: {new Date(completedAt).toLocaleDateString()} at {new Date(completedAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Error */}
              {actionError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                  {actionError}
                </div>
              )}

              {/* Deliberate Confirmation Dialog for Complete Training */}
              {showConfirmComplete && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 flex-shrink-0 mt-0.5">
                      <Icon name="shield-check" className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-amber-900">
                        Confirm Training Completion
                      </h4>
                      <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                        By confirming, you attest that you have carefully read and reviewed all training guidelines and procedures outlined in this module.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowConfirmComplete(false)}
                      disabled={isCompleting}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-white rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      id="confirm-complete-btn"
                      type="button"
                      onClick={handleCompleteTraining}
                      disabled={isCompleting}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-60 transition-colors flex items-center space-x-1.5"
                    >
                      {isCompleting ? (
                        <>
                          <Icon name="refresh" className="w-3.5 h-3.5 animate-spin" />
                          <span>Recording...</span>
                        </>
                      ) : (
                        <>
                          <Icon name="check" className="w-3.5 h-3.5" />
                          <span>Yes, Mark Completed</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between flex-shrink-0">
          <div className="text-xs text-slate-500">
            {module?.creator && (
              <span>Author: {module.creator.firstName} {module.creator.lastName}</span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              id="close-detail-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Close
            </button>

            {/* Employee Actions */}
            {isEmployee && module && (
              <>
                {currentStatus === 'NOT_STARTED' && (
                  <button
                    id="start-training-btn"
                    type="button"
                    onClick={handleStartTraining}
                    disabled={isStarting}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-indigo-600/20 disabled:opacity-60 transition-all flex items-center space-x-2"
                  >
                    {isStarting ? (
                      <>
                        <Icon name="refresh" className="w-4 h-4 animate-spin" />
                        <span>Starting...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Start Training</span>
                      </>
                    )}
                  </button>
                )}

                {currentStatus === 'IN_PROGRESS' && !showConfirmComplete && (
                  <button
                    id="complete-training-btn"
                    type="button"
                    onClick={() => setShowConfirmComplete(true)}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-emerald-600/20 transition-all flex items-center space-x-2"
                  >
                    <Icon name="check" className="w-4 h-4" />
                    <span>Complete Training</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
