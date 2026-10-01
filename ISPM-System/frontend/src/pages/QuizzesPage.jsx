/**
 * pages/QuizzesPage.jsx
 * Unified Knowledge Assessments & Quizzes page with role-specific views.
 */
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { listQuizzesRequest } from '../services/quiz.service.js';
import Icon from '../components/common/Icon.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import LoadingState from '../components/common/LoadingState.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';

import CreateQuizModal from '../components/quizzes/CreateQuizModal.jsx';
import EditQuizModal from '../components/quizzes/EditQuizModal.jsx';
import ManageQuestionsModal from '../components/quizzes/ManageQuestionsModal.jsx';
import QuizTakingModal from '../components/quizzes/QuizTakingModal.jsx';
import QuizResultsReportModal from '../components/quizzes/QuizResultsReportModal.jsx';

export default function QuizzesPage() {
  const { user } = useAuth();
  const isTrainingAdmin = user?.role === 'TRAINING_ADMIN';
  const isEmployee = user?.role === 'EMPLOYEE';

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [questionsQuiz, setQuestionsQuiz] = useState(null);
  const [reportQuiz, setReportQuiz] = useState(null);
  const [takingQuizId, setTakingQuizId] = useState(null);

  // Quick action feedback
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const fetchQuizzes = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await listQuizzesRequest(params);
      if (res.ok && res.data?.success) {
        setQuizzes(res.data.data.quizzes || []);
      } else {
        setError(res.data?.message || 'Failed to load quizzes.');
      }
    } catch {
      setError('A network error occurred. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl shadow-xs flex items-center justify-between animate-in fade-in duration-150">
          <div className="flex items-center space-x-2">
            <Icon name="check" className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage('')} className="text-emerald-500 hover:text-emerald-700">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>
      )}

      <PageHeader
        title={isTrainingAdmin ? 'Quiz & Knowledge Assessment Management' : 'Policy & Security Knowledge Quizzes'}
        description={
          isTrainingAdmin
            ? 'Create assessments linked to training modules, configure passing thresholds, author questions, and review employee attempt scores.'
            : 'Validate your understanding of cybersecurity practices and training materials through interactive quizzes.'
        }
        icon="clipboard"
        action={
          isTrainingAdmin ? (
            <button
              id="add-quiz-btn"
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-950 cursor-pointer"
            >
              <Icon name="plus" className="w-4 h-4" />
              <span>Create New Quiz</span>
            </button>
          ) : null
        }
      />

      {/* Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
        <div className="relative">
          <Icon name="search" className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search quizzes by title or keywords…"
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Main Content View */}
      {loading ? (
        <LoadingState message="Loading assessments…" rows={4} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchQuizzes} />
      ) : quizzes.length === 0 ? (
        <EmptyState
          title="No quizzes found"
          description={
            isTrainingAdmin
              ? 'Click "Create New Quiz" to link an assessment to one of your training modules.'
              : 'There are no active security knowledge quizzes available at this time.'
          }
          icon="clipboard"
        />
      ) : isTrainingAdmin ? (
        /* ================= TRAINING ADMIN TABLE VIEW ================= */
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Quiz / Title</th>
                  <th className="py-3.5 px-5">Training Module</th>
                  <th className="py-3.5 px-5">Pass Mark</th>
                  <th className="py-3.5 px-5">Questions</th>
                  <th className="py-3.5 px-5">Module Status</th>
                  <th className="py-3.5 px-5">Attempts</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-xs">
                {quizzes.map((quiz) => (
                  <tr key={quiz.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-5 max-w-xs">
                      <div className="font-bold text-slate-100 text-sm">{quiz.title}</div>
                      <p className="text-slate-400 text-xs line-clamp-1 mt-0.5">
                        {quiz.description || 'No instructions provided.'}
                      </p>
                    </td>
                    <td className="py-4 px-5">
                      {quiz.trainingModule ? (
                        <div className="font-medium text-slate-200 flex items-center gap-1.5">
                          <Icon name="academic-cap" className="w-4 h-4 text-blue-400" />
                          <span className="line-clamp-1">{quiz.trainingModule.title}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">None</span>
                      )}
                    </td>
                    <td className="py-4 px-5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-blue-600/15 text-blue-300 border border-blue-500/20">
                        {quiz.passingScore}%
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <span className="font-semibold text-slate-200">
                        {quiz.questionCount || 0} questions
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <StatusBadge status={quiz.trainingModule?.isPublished ? 'PUBLISHED' : 'DRAFT'} />
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200">{quiz.attemptCount || 0}</span>
                        <button
                          onClick={() => setReportQuiz(quiz)}
                          className="text-blue-400 hover:text-blue-300 font-semibold hover:underline text-[11px] cursor-pointer"
                        >
                          View Results →
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          id={`manage-questions-${quiz.id}`}
                          onClick={() => setQuestionsQuiz(quiz)}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 hover:border-blue-500 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                          title="Manage Questions & Options"
                        >
                          <Icon name="clipboard" className="w-3.5 h-3.5" />
                          <span>Questions</span>
                        </button>
                        <button
                          onClick={() => setEditingQuiz(quiz)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                          title="Edit Settings"
                        >
                          <Icon name="pencil" className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setReportQuiz(quiz)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                          title="View Attempt Report"
                        >
                          <Icon name="chart" className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ================= EMPLOYEE QUIZ CATALOG VIEW ================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {quizzes.map((quiz) => {
            const hasCompletedTraining = Boolean(quiz.isTrainingCompleted ?? quiz.isPrerequisiteMet);
            const latestAttempt = quiz.latestAttempt;
            const hasPassed = Boolean(quiz.isPassed ?? latestAttempt?.isPassed);
            const canAttempt = Boolean(quiz.canAttempt ?? (hasCompletedTraining && quiz.questionCount > 0));
            const accentColor = hasPassed ? 'bg-emerald-500' : !hasCompletedTraining ? 'bg-slate-600' : latestAttempt ? 'bg-rose-500' : 'bg-blue-500';

            return (
              <div
                key={quiz.id}
                data-quiz-card={quiz.id}
                className="bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 hover:shadow-md transition-all flex flex-col overflow-hidden"
              >
                <div className={`h-1.5 w-full ${accentColor}`} />

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    {/* Status & Prerequisite Badges */}
                    <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
                      {hasPassed ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          <Icon name="check" className="w-3 h-3 mr-1" />
                          Passed ({latestAttempt?.score}%)
                        </span>
                      ) : latestAttempt ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                          <Icon name="close" className="w-3 h-3 mr-1" />
                          Failed ({latestAttempt.score}%)
                        </span>
                      ) : hasCompletedTraining ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-1.5"></span>
                          Ready to Attempt
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          <Icon name="lock" className="w-3 h-3 mr-1" />
                          Training Required
                        </span>
                      )}
                      <span className="inline-flex items-center text-[11px] font-medium text-slate-500">
                        Pass Mark: <strong className="ml-1 text-slate-300">{quiz.passingScore}%</strong>
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-100 line-clamp-2">{quiz.title}</h3>

                    {quiz.trainingModule && (
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-blue-400 font-medium">
                        <Icon name="academic-cap" className="w-3.5 h-3.5" />
                        <span className="line-clamp-1">{quiz.trainingModule.title}</span>
                      </div>
                    )}

                    <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                      {quiz.description || 'Test your knowledge on key principles and guidelines from this security module.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div className="text-[11px] text-slate-500">
                      {quiz.questionCount || 0} Questions
                    </div>
                    {canAttempt ? (
                      <button
                        data-start-quiz-btn={quiz.id}
                        onClick={() => setTakingQuizId(quiz.id)}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          hasPassed
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
                        }`}
                      >
                        <span>{hasPassed ? 'Retake Quiz' : latestAttempt ? 'Retry Quiz' : 'Start Assessment'}</span>
                        <Icon name="arrow-right" className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        disabled
                        className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/60 text-slate-500 cursor-not-allowed flex items-center gap-1.5"
                        title={!hasCompletedTraining ? 'Complete the training module first.' : 'Assessment unavailable.'}
                      >
                        <Icon name="lock" className="w-3.5 h-3.5" />
                        <span>Locked</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODALS */}
      {isCreateOpen && (
        <CreateQuizModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSuccess={() => {
            setIsCreateOpen(false);
            showToast('Quiz created successfully!');
            fetchQuizzes();
          }}
        />
      )}

      {editingQuiz && (
        <EditQuizModal
          isOpen={Boolean(editingQuiz)}
          quiz={editingQuiz}
          onClose={() => setEditingQuiz(null)}
          onSuccess={() => {
            setEditingQuiz(null);
            showToast('Quiz settings updated successfully!');
            fetchQuizzes();
          }}
        />
      )}

      {questionsQuiz && (
        <ManageQuestionsModal
          isOpen={Boolean(questionsQuiz)}
          quizId={questionsQuiz.id}
          onClose={() => setQuestionsQuiz(null)}
          onQuestionsChanged={() => {
            fetchQuizzes();
          }}
        />
      )}

      {reportQuiz && (
        <QuizResultsReportModal
          isOpen={Boolean(reportQuiz)}
          quizId={reportQuiz.id}
          onClose={() => setReportQuiz(null)}
        />
      )}

      {takingQuizId && (
        <QuizTakingModal
          isOpen={Boolean(takingQuizId)}
          quizId={takingQuizId}
          onClose={() => {
            setTakingQuizId(null);
            fetchQuizzes();
          }}
          onQuizSubmitted={() => {
            fetchQuizzes();
          }}
          onCompleted={() => {
            setTakingQuizId(null);
            showToast('Assessment submitted successfully!');
            fetchQuizzes();
          }}
        />
      )}
    </div>
  );
}
