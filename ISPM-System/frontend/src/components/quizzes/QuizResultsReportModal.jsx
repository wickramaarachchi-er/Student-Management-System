/**
 * components/quizzes/QuizResultsReportModal.jsx
 * Modal dialog for Training Administrator to view employee quiz attempt results and metrics.
 */
import { useState, useEffect } from 'react';
import { getQuizResultsReportRequest } from '../../services/quiz.service.js';
import Icon from '../common/Icon.jsx';
import './QuizAdminDialogs.css';

export default function QuizResultsReportModal({ isOpen, onClose, quizId }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen && quizId) {
      loadReport();
    } else {
      setReport(null);
      setSearchTerm('');
    }
  }, [isOpen, quizId]);

  const loadReport = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getQuizResultsReportRequest(quizId);
      if (res.ok && res.data?.success) {
        setReport(res.data.data);
      } else {
        setError(res.data?.message || 'Failed to load results report.');
      }
    } catch {
      setError('A network error occurred while loading results.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const summary = report?.summary || {
    totalAttempts: 0,
    passedAttempts: 0,
    failedAttempts: 0,
    passRate: 0,
    averageScore: 0,
  };

  const attempts = report?.attempts || [];
  const filteredAttempts = attempts.filter((att) => {
    const emp = att.employee || {};
    const name = `${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase();
    const email = (emp.email || '').toLowerCase();
    const dept = (emp.department || '').toLowerCase();
    const q = searchTerm.toLowerCase();

    return !q || name.includes(q) || email.includes(q) || dept.includes(q);
  });

  return (
    <div className="quiz-admin-overlay fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="quiz-admin-dialog quiz-admin-results bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quiz-results-title"
      >
        {/* Header */}
        <div className="quiz-admin-header px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60 flex-shrink-0">
          <div className="quiz-admin-heading flex items-center space-x-3">
            <div className="quiz-admin-emblem w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Icon name="award" className="w-5 h-5" />
            </div>
            <div>
              <h2 id="quiz-results-title" className="text-lg font-bold text-slate-800">
                Quiz Evaluation Roster & Results
              </h2>
              <p className="text-xs text-slate-500">
                {report?.quiz?.title || 'Assessment performance metrics'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="quiz-admin-close text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <Icon name="close" className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="quiz-admin-body p-6 overflow-y-auto flex-1 space-y-6">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-400 space-y-3">
              <Icon name="refresh" className="w-8 h-8 animate-spin text-indigo-500" />
              <p className="text-sm font-medium">Loading evaluation report...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
              {error}
            </div>
          ) : (
            <>
              {/* Summary Metric Cards */}
              <div className="quiz-report-metrics grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Total Attempts
                  </p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">
                    {summary.totalAttempts}
                  </p>
                </div>
                <div className="p-4 bg-emerald-50/60 border border-emerald-200/70 rounded-xl">
                  <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                    Passed Attempts
                  </p>
                  <p className="text-2xl font-bold text-emerald-800 mt-1">
                    {summary.passedAttempts}
                  </p>
                </div>
                <div className="p-4 bg-rose-50/60 border border-rose-200/70 rounded-xl">
                  <p className="text-xs font-semibold text-rose-700 uppercase tracking-wider">
                    Failed Attempts
                  </p>
                  <p className="text-2xl font-bold text-rose-800 mt-1">
                    {summary.failedAttempts}
                  </p>
                </div>
                <div className="p-4 bg-indigo-50/60 border border-indigo-200/70 rounded-xl">
                  <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                    Pass Rate
                  </p>
                  <p className="text-2xl font-bold text-indigo-900 mt-1">
                    {summary.passRate}% <span className="text-xs font-medium text-slate-500">Avg. {summary.averageScore}%</span>
                  </p>
                </div>
              </div>

              {/* Search Bar */}
              <div className="quiz-report-search relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Icon name="search" className="w-4 h-4" />
                </span>
                <input
                  type="search" aria-label="Filter quiz attempts by employee name, email, or department"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter by employee name, email, or department..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              {/* Roster Table */}
              <div className="quiz-report-table border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      <th scope="col" className="py-3 px-4">Employee</th>
                      <th scope="col" className="py-3 px-4">Department</th>
                      <th scope="col" className="py-3 px-4">Attempt #</th>
                      <th scope="col" className="py-3 px-4">Score</th>
                      <th scope="col" className="py-3 px-4">Result</th>
                      <th scope="col" className="py-3 px-4">Submitted Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredAttempts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                          {searchTerm ? 'No attempts match your search.' : 'No quiz attempts recorded yet.'}
                        </td>
                      </tr>
                    ) : (
                      filteredAttempts.map((att) => (
                        <tr key={att.attemptId} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-800">
                              {att.employee?.firstName} {att.employee?.lastName}
                            </div>
                            <div className="text-slate-500 text-[11px] font-mono">
                              {att.employee?.email}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-600 font-medium">
                            {att.employee?.department || '—'}
                          </td>
                          <td className="py-3 px-4 text-slate-500 font-mono">
                            #{att.attemptNumber}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-800">
                            {att.score}%
                          </td>
                          <td className="py-3 px-4">
                            {att.isPassed ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                                Passed
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5"></span>
                                Failed
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-500">
                            {new Date(att.submittedAt).toLocaleDateString()} at{' '}
                            {new Date(att.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="quiz-admin-footer px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between flex-shrink-0">
          <p className="text-xs text-slate-500">
            Pass Threshold: <strong className="text-slate-700">{report?.quiz?.passingScore ?? 70}%</strong>
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors shadow-xs"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
}
