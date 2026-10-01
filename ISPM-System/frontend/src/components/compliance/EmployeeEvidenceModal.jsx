/**
 * components/compliance/EmployeeEvidenceModal.jsx
 * Modal dialog for Compliance Officer to inspect detailed compliance evidence for a specific employee.
 * Displays overall compliance KPI metrics, policy acknowledgements, training progress, quiz attempts,
 * and outstanding action items.
 */
import { useState, useEffect } from 'react';
import { getEmployeeComplianceDetailsRequest } from '../../services/compliance.service.js';
import Icon from '../common/Icon.jsx';

export default function EmployeeEvidenceModal({ isOpen, onClose, userId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'policies' | 'training' | 'quizzes'

  useEffect(() => {
    if (isOpen && userId) {
      loadDetails();
    } else {
      setData(null);
      setError('');
      setActiveTab('summary');
    }
  }, [isOpen, userId]);

  const loadDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getEmployeeComplianceDetailsRequest(userId);
      if (res.ok && res.data?.success) {
        setData(res.data.data);
      } else {
        setError(res.data?.message || 'Failed to load employee compliance evidence.');
      }
    } catch {
      setError('A network error occurred while loading compliance evidence.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const emp = data?.employee;
  const summary = data?.summary;
  const evidence = data?.evidence || { policies: [], training: [], quizzes: [] };
  const actions = data?.outstandingActions || [];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLIANT':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Icon name="check" className="w-3.5 h-3.5 mr-1" />
            COMPLIANT (100%)
          </span>
        );
      case 'PARTIALLY_COMPLIANT':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
            PARTIALLY COMPLIANT ({summary?.compliancePercentage}%)
          </span>
        );
      case 'NON_COMPLIANT':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <Icon name="close" className="w-3.5 h-3.5 mr-1" />
            NON-COMPLIANT (0%)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
            NO REQUIREMENTS
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="employee-evidence-title"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Icon name="user-check" className="w-5 h-5" />
            </div>
            <div>
              <h2 id="employee-evidence-title" className="text-lg font-bold text-slate-800">
                {emp ? `${emp.firstName} ${emp.lastName}` : 'Employee Compliance Evidence'}
              </h2>
              <p className="text-xs text-slate-500">
                {emp ? `${emp.email} • ${emp.department || 'General Department'}` : 'Loading details...'}
              </p>
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-400 space-y-3">
              <Icon name="refresh" className="w-8 h-8 animate-spin text-indigo-500" />
              <p className="text-sm font-medium">Calculating compliance evidence...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
              {error}
            </div>
          ) : (
            <>
              {/* Overall Summary KPI Header Card */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1.5 text-center sm:text-left">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Overall Compliance Status
                    </span>
                    {getStatusBadge(summary.complianceStatus)}
                  </div>
                  <p className="text-xs text-slate-600">
                    Completed <strong>{summary.completedRequirements}</strong> of <strong>{summary.totalRequirements}</strong> total applicable security requirements.
                  </p>
                </div>

                {/* Progress Bar & Percentage */}
                <div className="w-full sm:w-64 space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Adherence Level</span>
                    <span>{summary.compliancePercentage}%</span>
                  </div>
                  <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        summary.compliancePercentage === 100
                          ? 'bg-emerald-500'
                          : summary.compliancePercentage > 0
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${summary.compliancePercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="border-b border-slate-200 flex items-center space-x-4">
                <button
                  onClick={() => setActiveTab('summary')}
                  className={`pb-3 text-xs font-semibold border-b-2 transition-colors ${
                    activeTab === 'summary'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Overview & Outstanding ({actions.length})
                </button>
                <button
                  onClick={() => setActiveTab('policies')}
                  className={`pb-3 text-xs font-semibold border-b-2 transition-colors ${
                    activeTab === 'policies'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Policies ({summary.policy.completed}/{summary.policy.total})
                </button>
                <button
                  onClick={() => setActiveTab('training')}
                  className={`pb-3 text-xs font-semibold border-b-2 transition-colors ${
                    activeTab === 'training'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Training ({summary.training.completed}/{summary.training.total})
                </button>
                <button
                  onClick={() => setActiveTab('quizzes')}
                  className={`pb-3 text-xs font-semibold border-b-2 transition-colors ${
                    activeTab === 'quizzes'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Quizzes ({summary.quiz.completed}/{summary.quiz.total})
                </button>
              </div>

              {/* TAB 1: SUMMARY & OUTSTANDING ACTIONS */}
              {activeTab === 'summary' && (
                <div className="space-y-4">
                  <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                      Category Compliance Breakdown
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[11px] font-semibold text-slate-500">Policies</span>
                        <div className="text-lg font-bold text-slate-800 mt-0.5">
                          {summary.policy.percentage}%
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {summary.policy.completed} / {summary.policy.total} Acknowledged
                        </span>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[11px] font-semibold text-slate-500">Training Modules</span>
                        <div className="text-lg font-bold text-slate-800 mt-0.5">
                          {summary.training.percentage}%
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {summary.training.completed} / {summary.training.total} Completed
                        </span>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[11px] font-semibold text-slate-500">Knowledge Quizzes</span>
                        <div className="text-lg font-bold text-slate-800 mt-0.5">
                          {summary.quiz.percentage}%
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {summary.quiz.completed} / {summary.quiz.total} Passed
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                      <Icon name="alert" className="w-4 h-4 text-amber-600" />
                      <span>Outstanding Required Actions ({actions.length})</span>
                    </h4>
                    {actions.length === 0 ? (
                      <p className="text-xs text-amber-800 font-medium">
                        ✓ All information security requirements have been fully satisfied.
                      </p>
                    ) : (
                      <ul className="space-y-1.5 pl-2">
                        {actions.map((act, idx) => (
                          <li key={idx} className="text-xs text-amber-900 font-medium flex items-center space-x-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0"></span>
                            <span>{act}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: POLICIES EVIDENCE */}
              {activeTab === 'policies' && (
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase">
                        <th className="py-3 px-4">Policy Title</th>
                        <th className="py-3 px-4">Current Version</th>
                        <th className="py-3 px-4">Target Dept</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Acknowledged Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {evidence.policies.map((p) => (
                        <tr key={p.policyId} className="hover:bg-slate-50/60">
                          <td className="py-3 px-4 font-bold text-slate-800">{p.title}</td>
                          <td className="py-3 px-4 font-semibold text-slate-600">v{p.currentVersionNumber}</td>
                          <td className="py-3 px-4 text-slate-500">{p.targetDepartment || 'All'}</td>
                          <td className="py-3 px-4">
                            {p.isAcknowledged ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <Icon name="check" className="w-3 h-3 mr-1" />
                                Acknowledged
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                Pending Ack
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right text-slate-500">
                            {p.acknowledgedAt ? new Date(p.acknowledgedAt).toLocaleDateString() : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB 3: TRAINING EVIDENCE */}
              {activeTab === 'training' && (
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase">
                        <th className="py-3 px-4">Training Module</th>
                        <th className="py-3 px-4">Progress Status</th>
                        <th className="py-3 px-4">Assigned Date</th>
                        <th className="py-3 px-4 text-right">Completion Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {evidence.training.map((t) => (
                        <tr key={t.trainingModuleId} className="hover:bg-slate-50/60">
                          <td className="py-3 px-4 font-bold text-slate-800">{t.title}</td>
                          <td className="py-3 px-4">
                            {t.status === 'COMPLETED' ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <Icon name="check" className="w-3 h-3 mr-1" />
                                Completed
                              </span>
                            ) : t.status === 'IN_PROGRESS' ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                In Progress
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                Not Started
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-500">
                            {t.assignedAt ? new Date(t.assignedAt).toLocaleDateString() : '—'}
                          </td>
                          <td className="py-3 px-4 text-right text-slate-500">
                            {t.completedAt ? new Date(t.completedAt).toLocaleDateString() : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB 4: QUIZZES EVIDENCE */}
              {activeTab === 'quizzes' && (
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase">
                        <th className="py-3 px-4">Quiz Title</th>
                        <th className="py-3 px-4">Associated Training</th>
                        <th className="py-3 px-4">Pass Mark</th>
                        <th className="py-3 px-4">Latest Score</th>
                        <th className="py-3 px-4 text-right">Attempt Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {evidence.quizzes.map((q) => (
                        <tr key={q.quizId} className="hover:bg-slate-50/60">
                          <td className="py-3 px-4 font-bold text-slate-800">{q.title}</td>
                          <td className="py-3 px-4 text-slate-600">{q.trainingModuleTitle}</td>
                          <td className="py-3 px-4 text-slate-600 font-medium">{q.passingScore}%</td>
                          <td className="py-3 px-4">
                            {q.isPassed ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Passed ({q.latestScore}%)
                              </span>
                            ) : q.latestScore !== null ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                Failed ({q.latestScore}%)
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                No Attempt
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right text-slate-500">
                            {q.submittedAt ? new Date(q.submittedAt).toLocaleDateString() : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-end flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            Close Evidence
          </button>
        </div>
      </div>
    </div>
  );
}
