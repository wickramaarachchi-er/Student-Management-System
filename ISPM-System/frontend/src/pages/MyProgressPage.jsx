/**
 * pages/MyProgressPage.jsx
 * Employee Personal Cybersecurity Training Progress dashboard.
 * Displays personal completion statistics, progress breakdown, and assigned training module statuses.
 */
import { useState, useEffect } from 'react';
import { getMyProgressRequest } from '../services/training.service.js';
import { getMyQuizResultsRequest } from '../services/quiz.service.js';
import { getMyComplianceRequest } from '../services/compliance.service.js';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/common/Icon.jsx';
import TrainingDetailModal from '../components/training/TrainingDetailModal.jsx';

export default function MyProgressPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [quizResults, setQuizResults] = useState([]);
  const [complianceData, setComplianceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedModuleId, setSelectedModuleId] = useState(null);

  const fetchProgress = async () => {
    setLoading(true);
    setError('');
    try {
      const [trainRes, quizRes, compRes] = await Promise.all([
        getMyProgressRequest(),
        getMyQuizResultsRequest(),
        getMyComplianceRequest()
      ]);

      if (trainRes.ok && trainRes.data?.success) {
        setData(trainRes.data.data);
      } else {
        setError(trainRes.data?.message || 'Failed to retrieve progress data.');
      }

      if (quizRes.ok && quizRes.data?.success) {
        setQuizResults(quizRes.data.data.results || []);
      }

      if (compRes.ok && compRes.data?.success) {
        setComplianceData(compRes.data.data);
      }
    } catch {
      setError('A network error occurred while loading your progress.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  const summary = data?.summary || { total: 0, completed: 0, inProgress: 0, notStarted: 0 };
  const completionRate = summary.total > 0 ? Math.round((summary.completed / summary.total) * 100) : 0;
  const progressList = data?.progress || [];

  const compStatus = complianceData?.complianceStatus || 'NO_REQUIREMENTS';
  const compPercentage = complianceData?.compliancePercentage ?? 0;
  const compCompleted = complianceData?.completedRequirements ?? 0;
  const compTotal = complianceData?.totalRequirements ?? 0;
  const compOutstanding = complianceData?.outstandingRequirements ?? 0;
  const outstandingActions = complianceData?.outstandingActions || [];

  const getCompBadge = (status) => {
    switch (status) {
      case 'COMPLIANT':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <Icon name="check-circle" className="w-4 h-4 mr-1" />
            COMPLIANT
          </span>
        );
      case 'PARTIALLY_COMPLIANT':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Icon name="alert-circle" className="w-4 h-4 mr-1" />
            PARTIALLY COMPLIANT
          </span>
        );
      case 'NON_COMPLIANT':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <Icon name="x-circle" className="w-4 h-4 mr-1" />
            NON-COMPLIANT
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <Icon name="minus-circle" className="w-4 h-4 mr-1" />
            NO REQUIREMENTS
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
            <Icon name="user-check" className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">My Security Progress & Compliance</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Track your cybersecurity training completions, policy acknowledgements, and quiz achievements
            </p>
          </div>
        </div>

        {/* Overall Completion Metric Card */}
        <div className="flex items-center space-x-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200/80">
          <div className="text-right">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Overall Compliance
            </div>
            <div className="text-lg font-bold text-slate-800">{compPercentage}%</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
            {compCompleted}/{compTotal}
          </div>
        </div>
      </div>

      {/* My InfoSec Compliance Summary Box */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-md space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-800/60 pb-5">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                My InfoSec Compliance Summary
              </span>
              {getCompBadge(compStatus)}
            </div>
            <p className="text-xs text-slate-300">
              Live status derived from policy acknowledgements, training progress, and quiz scores
            </p>
          </div>

          <div className="flex items-center space-x-6 bg-white/10 px-5 py-3 rounded-xl border border-white/10">
            <div className="text-center">
              <div className="text-2xl font-black text-white">{compPercentage}%</div>
              <div className="text-[10px] text-indigo-200 uppercase font-semibold">Compliance Rate</div>
            </div>
            <div className="h-8 w-px bg-white/20"></div>
            <div className="text-center">
              <div className="text-2xl font-black text-emerald-400">{compCompleted} / {compTotal}</div>
              <div className="text-[10px] text-indigo-200 uppercase font-semibold">Completed Req.</div>
            </div>
            <div className="h-8 w-px bg-white/20"></div>
            <div className="text-center">
              <div className="text-2xl font-black text-amber-400">{compOutstanding}</div>
              <div className="text-[10px] text-indigo-200 uppercase font-semibold">Outstanding</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-indigo-200 font-medium">
            <span>Overall Requirement Fulfillment</span>
            <span>{compPercentage}% Complete</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden border border-indigo-800/50">
            <div
              className={`h-full transition-all duration-500 ${
                compStatus === 'COMPLIANT'
                  ? 'bg-emerald-500'
                  : compStatus === 'PARTIALLY_COMPLIANT'
                  ? 'bg-amber-400'
                  : compStatus === 'NON_COMPLIANT'
                  ? 'bg-rose-500'
                  : 'bg-slate-500'
              }`}
              style={{ width: `${compPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Outstanding Actions Checklist */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold text-indigo-200 uppercase tracking-wider flex items-center space-x-2">
            <Icon name="check-square" className="w-4 h-4 text-amber-400" />
            <span>Outstanding Action Items ({outstandingActions.length})</span>
          </h3>

          {outstandingActions.length === 0 ? (
            <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-4 flex items-center space-x-3 text-emerald-200 text-xs">
              <Icon name="check-circle" className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>Great job! You have satisfied all information security requirements. You are fully compliant.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {outstandingActions.map((act) => (
                <div
                  key={act.id}
                  className="bg-white/5 border border-white/10 hover:border-indigo-400/40 transition-all rounded-xl p-3 flex items-center justify-between space-x-3"
                >
                  <div className="flex items-start space-x-2.5 overflow-hidden">
                    <span
                      className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                        act.type === 'POLICY'
                          ? 'bg-indigo-400'
                          : act.type === 'TRAINING'
                          ? 'bg-amber-400'
                          : 'bg-rose-400'
                      }`}
                    ></span>
                    <div>
                      <p className="text-xs font-semibold text-white truncate">{act.title}</p>
                      <span className="text-[10px] text-slate-300 capitalize">{(act.type || 'requirement').toLowerCase()} requirement</span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(act.link)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-[11px] font-semibold transition-all flex-shrink-0 flex items-center space-x-1 shadow-xs"
                  >
                    <span>{act.actionText}</span>
                    <Icon name="arrow-right" className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Courses
          </p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-slate-800">{summary.total}</span>
            <span className="text-xs text-slate-400">Assigned</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
            Completed
          </p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-emerald-800">{summary.completed}</span>
            <span className="text-xs text-emerald-600 font-medium">Verified</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
            In Progress
          </p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-amber-800">{summary.inProgress}</span>
            <span className="text-xs text-amber-600 font-medium">Active</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Not Started
          </p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-slate-700">{summary.notStarted}</span>
            <span className="text-xs text-slate-400">Pending</span>
          </div>
        </div>
      </div>

      {/* Course List & Progress Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800">
            Training Modules & Curriculum Progress
          </h2>
          <span className="text-xs text-slate-500">
            {progressList.length} course{progressList.length !== 1 ? 's' : ''} available
          </span>
        </div>

        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-400 space-y-3">
            <Icon name="refresh" className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-sm font-medium">Loading personal progress...</p>
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
              {error}
            </div>
          </div>
        ) : progressList.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto mb-3">
              <Icon name="academic-cap" className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-700">No training modules available</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              There are currently no active training courses assigned to your department.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Training Course</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Started Date</th>
                  <th className="py-3.5 px-6">Completion Date</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {progressList.map((item) => {
                  const mod = item.trainingModule;
                  const isCompleted = item.status === 'COMPLETED';
                  const isInProgress = item.status === 'IN_PROGRESS';

                  return (
                    <tr key={mod.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6 max-w-sm">
                        <div className="font-bold text-slate-800 text-sm">{mod.title}</div>
                        <p className="text-slate-500 text-xs line-clamp-1 mt-0.5">
                          {mod.description || 'Cybersecurity awareness training'}
                        </p>
                      </td>

                      <td className="py-4 px-6">
                        {isCompleted ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Icon name="check" className="w-3.5 h-3.5 mr-1" />
                            Completed
                          </span>
                        ) : isInProgress ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
                            In Progress
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5"></span>
                            Not Started
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-slate-500">
                        {item.assignedAt ? new Date(item.assignedAt).toLocaleDateString() : '—'}
                      </td>

                      <td className="py-4 px-6 text-slate-500">
                        {item.completedAt ? (
                          <span className="font-semibold text-emerald-700">
                            {new Date(item.completedAt).toLocaleDateString()}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => setSelectedModuleId(mod.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all inline-flex items-center space-x-1.5 ${
                            isCompleted
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              : isInProgress
                              ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                          }`}
                        >
                          <span>{isCompleted ? 'Review' : isInProgress ? 'Resume' : 'Start'}</span>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quiz & Knowledge Assessment Results */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon name="clipboard" className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-800">
              Knowledge Assessments & Quiz Results
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            {quizResults.length} attempt{quizResults.length !== 1 ? 's' : ''} recorded
          </span>
        </div>

        {quizResults.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-xs text-slate-500">
              No quiz attempts recorded yet. Visit the Quizzes section to complete assessments for your finished training courses.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Assessment</th>
                  <th className="py-3.5 px-6">Associated Training</th>
                  <th className="py-3.5 px-6">Pass Mark</th>
                  <th className="py-3.5 px-6">Achieved Score</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Attempt Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {quizResults.map((result) => {
                  const quiz = result.quiz;
                  const isPassed = result.isPassed;

                  return (
                    <tr key={result.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-800">
                        {result.quiz?.title || result.quizTitle || 'Knowledge Assessment'}
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        {result.quiz?.trainingModule?.title || result.trainingModuleTitle || 'General Module'}
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-slate-600 font-medium">
                          {result.quiz?.passingScore || result.passingScore || 80}%
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`font-bold text-sm ${
                            isPassed ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {result.score}%
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {isPassed ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Icon name="check" className="w-3.5 h-3.5 mr-1" />
                            Passed
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <Icon name="close" className="w-3.5 h-3.5 mr-1" />
                            Failed
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right text-slate-500">
                        {result.submittedAt
                          ? new Date(result.submittedAt).toLocaleDateString()
                          : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Training Detail Modal for review or continuing */}
      <TrainingDetailModal
        isOpen={!!selectedModuleId}
        onClose={() => setSelectedModuleId(null)}
        moduleId={selectedModuleId}
        userRole="EMPLOYEE"
        onProgressUpdated={() => {
          fetchProgress();
        }}
      />
    </div>
  );
}
