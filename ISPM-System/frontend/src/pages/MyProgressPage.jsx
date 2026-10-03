/**
 * pages/MyProgressPage.jsx
 * Employee personal security progress & compliance tracker.
 */
import { useState, useEffect } from 'react';
import { getMyProgressRequest } from '../services/training.service.js';
import { getMyQuizResultsRequest } from '../services/quiz.service.js';
import { getMyComplianceRequest } from '../services/compliance.service.js';
import Icon from '../components/common/Icon.jsx';
import './MyProgressPage.css';

import StatusBadge from '../components/common/StatusBadge.jsx';
import LoadingState from '../components/common/LoadingState.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import TrainingDetailModal from '../components/training/TrainingDetailModal.jsx';

export default function MyProgressPage() {
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
      if (trainRes.ok && trainRes.data?.success) setData(trainRes.data.data);
      else setError(trainRes.data?.message || 'Failed to retrieve progress data.');
      if (quizRes.ok && quizRes.data?.success) setQuizResults(quizRes.data.data.results || []);
      if (compRes.ok && compRes.data?.success) setComplianceData(compRes.data.data);
    } catch {
      setError('A network error occurred while loading your progress.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProgress(); }, []);

  const summary = data?.summary || { total: 0, completed: 0, inProgress: 0, notStarted: 0 };
  const progressList = data?.progress || [];
  const complianceSummary = complianceData?.summary || complianceData;
  const compStatus = complianceSummary?.complianceStatus || 'NO_REQUIREMENTS';
  const compPercentage = complianceSummary?.compliancePercentage ?? 0;
  const compCompleted = complianceSummary?.completedRequirements ?? 0;
  const compTotal = complianceSummary?.totalRequirements ?? 0;
  const compOutstanding = complianceSummary?.outstandingRequirements ?? 0;

  const progressBarColor = {
    COMPLIANT: 'bg-emerald-500',
    PARTIALLY_COMPLIANT: 'bg-amber-400',
    NON_COMPLIANT: 'bg-rose-500',
  }[compStatus] || 'bg-slate-500';

  return (
    <div className="my-progress-page">
      <header className="mp-header"><div><span className="mp-eyebrow">MY WORKSPACE / PROGRESS</span><h1>My security progress</h1><p>Your policies, courses, and assessment results in one personal scorecard.</p></div><button type="button" onClick={fetchProgress} disabled={loading}><Icon name="refresh" className="w-4 h-4" />{loading?'Refreshing...':'Refresh progress'}</button></header>

      {loading ? (
        <LoadingState message="Loading personal progress data…" rows={4} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchProgress} />
      ) : (
        <>
          {/* Compliance Summary Banner */}
          <div className="mp-compliance bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-5">
            <div className="mp-compliance-heading flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    My compliance scorecard
                  </span>
                  <StatusBadge status={compStatus} />
                </div>
                <p className="text-xs text-slate-400">
                  Live status derived from policy acknowledgements, training progress, and quiz scores.
                </p>
              </div>

              <div className="mp-score-summary flex items-center gap-6 bg-slate-950/70 px-5 py-3 rounded-xl border border-slate-800">
                <div className="text-center">
                  <div className="text-2xl font-black text-slate-100">{compPercentage}%</div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Compliance Rate</div>
                </div>
                <div className="h-8 w-px bg-slate-800" />
                <div className="text-center">
                  <div className="text-2xl font-black text-emerald-400">{compCompleted}/{compTotal}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Requirements Met</div>
                </div>
                <div className="h-8 w-px bg-slate-800" />
                <div className="text-center">
                  <div className="text-2xl font-black text-amber-400">{compOutstanding}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Outstanding</div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mp-compliance-meter space-y-1.5">
              <div className="flex justify-between text-xs text-slate-400 font-medium">
                <span>Overall Requirement Fulfillment</span>
                <span>{compPercentage}% Complete</span>
              </div>
              <div className="mp-meter-track w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full ${progressBarColor} transition-all duration-700 rounded-full`}
                  style={{ width: `${compPercentage}%` }}
                />
              </div>
            </div>

          </div>

          {/* Summary KPI Cards */}
          <section className="mp-stats" aria-label="My training summary">{[{label:'Assigned courses',value:summary.total,icon:'academic-cap',tone:'blue',detail:'Your current learning curriculum'},{label:'Completed',value:summary.completed,icon:'check',tone:'green',detail:'Courses you have finished'},{label:'In progress',value:summary.inProgress,icon:'trending-up',tone:'amber',detail:'Continue where you left off'},{label:'Not started',value:summary.notStarted,icon:'book',tone:'violet',detail:'Your next learning opportunities'}].map(stat=><article key={stat.label}><span className={'mp-stat-icon '+stat.tone}><Icon name={stat.icon} className="w-5 h-5" /></span><h2>{stat.label}</h2><strong>{stat.value}</strong><p>{stat.detail}</p></article>)}</section>

          {/* Training Module Table */}
          <div className="mp-records bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="mp-records-heading px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Training progress</h2>
              <span className="text-xs text-slate-400">{progressList.length} course{progressList.length !== 1 ? 's' : ''} available</span>
            </div>

            {progressList.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  title="No training modules available"
                  description="There are currently no active training courses assigned to your department."
                  icon="academic-cap"
                />
              </div>
            ) : (
              <div className="mp-table-scroll overflow-x-auto">
                <table className="mp-training-table w-full text-left border-collapse">
                  <colgroup><col style={{ width: "44%" }} /><col style={{ width: "16%" }} /><col style={{ width: "14%" }} /><col style={{ width: "14%" }} /><col style={{ width: "12%" }} /></colgroup>
                  <thead>
                    <tr className="mp-action-card bg-slate-950/60 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <th scope="col" className="py-3.5 px-5">Training Course</th>
                      <th scope="col" className="py-3.5 px-5">Status</th>
                      <th scope="col" className="py-3.5 px-5">Assigned Date</th>
                      <th scope="col" className="py-3.5 px-5">Completed Date</th>
                      <th scope="col" className="py-3.5 px-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70 text-xs">
                    {progressList.map((item) => {
                      const mod = item.trainingModule;
                      const isCompleted = item.status === 'COMPLETED';
                      const isInProgress = item.status === 'IN_PROGRESS';
                      return (
                        <tr key={mod.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-4 px-5 max-w-sm">
                            <div className="font-bold text-slate-100 text-sm">{mod.title}</div>
                            <p className="text-slate-400 text-xs line-clamp-1 mt-0.5">{mod.description || 'Cybersecurity awareness training'}</p>
                          </td>
                          <td className="py-4 px-5">
                            <StatusBadge status={item.status} type="training" />
                          </td>
                          <td className="py-4 px-5 text-slate-400">
                            {item.assignedAt ? new Date(item.assignedAt).toLocaleDateString() : '—'}
                          </td>
                          <td className="py-4 px-5">
                            {item.completedAt ? (
                              <span className="font-semibold text-emerald-400">{new Date(item.completedAt).toLocaleDateString()}</span>
                            ) : '—'}
                          </td>
                          <td className="py-4 px-5 text-right">
                            <button
                              onClick={() => setSelectedModuleId(mod.id)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer ${
                                isCompleted
                                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                                  : isInProgress
                                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-sm'
                                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
                              }`}
                            >
                              <span>{isCompleted ? 'Review' : isInProgress ? 'Resume' : 'Start'}</span>
                              <Icon name="trending-up" className="w-3.5 h-3.5" />
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

          {/* Quiz Results Table */}
          <div className="mp-records bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="mp-records-heading px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Assessment results</h2>
              <span className="text-xs text-slate-400">{quizResults.length} attempt{quizResults.length !== 1 ? 's' : ''} recorded</span>
            </div>

            {quizResults.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  title="No quiz attempts recorded"
                  description="Visit the Quizzes section to complete knowledge assessments for your finished training courses."
                  icon="clipboard-list"
                />
              </div>
            ) : (
              <div className="mp-table-scroll overflow-x-auto">
                <table className="mp-assessment-table w-full text-left border-collapse">
                  <colgroup><col style={{ width: "32%" }} /><col style={{ width: "24%" }} /><col style={{ width: "10%" }} /><col style={{ width: "11%" }} /><col style={{ width: "10%" }} /><col style={{ width: "13%" }} /></colgroup>
                  <thead>
                    <tr className="mp-action-card bg-slate-950/60 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <th scope="col" className="py-3.5 px-5">Assessment</th>
                      <th scope="col" className="py-3.5 px-5">Associated Training</th>
                      <th scope="col" className="py-3.5 px-5">Pass Mark</th>
                      <th scope="col" className="py-3.5 px-5">Score Achieved</th>
                      <th scope="col" className="py-3.5 px-5">Result</th>
                      <th scope="col" className="py-3.5 px-5 text-right">Attempt Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70 text-xs">
                    {quizResults.map((result) => {
                      const isPassed = result.isPassed;
                      return (
                        <tr key={result.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-4 px-5 font-bold text-slate-100">
                            {result.quiz?.title || result.quizTitle || 'Knowledge Assessment'}
                          </td>
                          <td className="py-4 px-5 text-slate-300">
                            {result.quiz?.trainingModule?.title || result.trainingModuleTitle || 'General Module'}
                          </td>
                          <td className="py-4 px-5 text-slate-400 font-medium">
                            {result.quiz?.passingScore ?? result.passingScore ?? 80}%
                          </td>
                          <td className="py-4 px-5">
                            <span className={`font-black text-sm ${isPassed ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {result.score}%
                            </span>
                          </td>
                          <td className="py-4 px-5">
                            <StatusBadge status={isPassed ? 'PASSED' : 'FAILED'} type="quiz" />
                          </td>
                          <td className="py-4 px-5 text-right text-slate-400">
                            {result.submittedAt ? new Date(result.submittedAt).toLocaleDateString() : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      <TrainingDetailModal
        isOpen={!!selectedModuleId}
        onClose={() => setSelectedModuleId(null)}
        moduleId={selectedModuleId}
        userRole="EMPLOYEE"
        onProgressUpdated={fetchProgress}
      />
    </div>
  );
}
