/**
 * pages/QuizzesPage.jsx
 * Unified Knowledge Assessments & Quizzes page with role-specific views for:
 * - TRAINING_ADMIN: Quiz configuration, question authoring, thresholds, and attempt reporting.
 * - EMPLOYEE: Available assessment catalog, training prerequisite status, quiz taking interface, and immediate feedback.
 */
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { listQuizzesRequest } from '../services/quiz.service.js';
import Icon from '../components/common/Icon.jsx';

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

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
            <Icon name="clipboard" className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              {isTrainingAdmin ? 'Quiz & Knowledge Assessment Management' : 'Policy & Security Knowledge Quizzes'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {isTrainingAdmin
                ? 'Create assessments linked to training modules, configure passing thresholds, author questions, and review employee attempt scores'
                : 'Validate your understanding of cybersecurity practices and training materials through interactive quizzes'}
            </p>
          </div>
        </div>

        {isTrainingAdmin && (
          <button
            id="add-quiz-btn"
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-indigo-600/20 transition-all flex items-center space-x-2 self-start sm:self-auto"
          >
            <Icon name="plus" className="w-4 h-4" />
            <span>Create New Quiz</span>
          </button>
        )}
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Icon name="search" className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search quizzes by title or keywords..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* Main Content View */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 flex flex-col items-center justify-center text-slate-400 space-y-3">
          <Icon name="refresh" className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm font-medium">Loading assessments...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
          {error}
        </div>
      ) : quizzes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto mb-3">
            <Icon name="clipboard" className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-700">No quizzes found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {isTrainingAdmin
              ? 'Click "Create New Quiz" to link an assessment to one of your training modules.'
              : 'There are no active security knowledge quizzes available at this time.'}
          </p>
        </div>
      ) : isTrainingAdmin ? (
        /* ================= TRAINING ADMIN TABLE VIEW ================= */
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Quiz / Title</th>
                  <th className="py-3.5 px-6">Training Module</th>
                  <th className="py-3.5 px-6">Pass Mark</th>
                  <th className="py-3.5 px-6">Questions</th>
                  <th className="py-3.5 px-6">Module Status</th>
                  <th className="py-3.5 px-6">Attempts</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {quizzes.map((quiz) => (
                  <tr key={quiz.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 max-w-xs">
                      <div className="font-bold text-slate-800 text-sm">{quiz.title}</div>
                      <p className="text-slate-500 text-xs line-clamp-1 mt-0.5">
                        {quiz.description || 'No instructions provided.'}
                      </p>
                    </td>

                    <td className="py-4 px-6">
                      {quiz.trainingModule ? (
                        <div className="font-medium text-slate-700 flex items-center space-x-1.5">
                          <Icon name="academic-cap" className="w-4 h-4 text-indigo-500" />
                          <span>{quiz.trainingModule.title}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">None</span>
                      )}
                    </td>

                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {quiz.passingScore}%
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <span className="font-semibold text-slate-700">
                        {quiz.questionCount || 0} questions
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      {quiz.trainingModule?.isPublished ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
                          Module Draft
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-700">
                          {quiz.attemptCount || 0}
                        </span>
                        <button
                          onClick={() => setReportQuiz(quiz)}
                          className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline text-[11px]"
                        >
                          View Results →
                        </button>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          id={`manage-questions-${quiz.id}`}
                          onClick={() => setQuestionsQuiz(quiz)}
                          className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1"
                          title="Manage Questions & Options"
                        >
                          <Icon name="clipboard" className="w-3.5 h-3.5" />
                          <span>Questions</span>
                        </button>

                        <button
                          onClick={() => setEditingQuiz(quiz)}
                          className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium transition-colors"
                          title="Edit Settings"
                        >
                          <Icon name="pencil" className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setReportQuiz(quiz)}
                          className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium transition-colors"
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

            return (
              <div
                key={quiz.id}
                data-quiz-card={quiz.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden"
              >
                {/* Top Accent Strip */}
                <div
                  className={`h-1.5 w-full ${
                    hasPassed
                      ? 'bg-emerald-500'
                      : !hasCompletedTraining
                      ? 'bg-slate-300'
                      : latestAttempt
                      ? 'bg-rose-500'
                      : 'bg-indigo-500'
                  }`}
                />

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    {/* Status & Prerequisite Badges */}
                    <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
                      {hasPassed ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Icon name="check" className="w-3 h-3 mr-1" />
                          Passed ({latestAttempt?.score}%)
                        </span>
                      ) : latestAttempt ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          <Icon name="close" className="w-3 h-3 mr-1" />
                          Failed ({latestAttempt.score}%)
                        </span>
                      ) : hasCompletedTraining ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-1.5"></span>
                          Ready to Attempt
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <Icon name="lock" className="w-3 h-3 mr-1" />
                          Training Required
                        </span>
                      )}

                      <span className="inline-flex items-center text-[11px] font-medium text-slate-500">
                        Pass Mark: <strong className="ml-1 text-slate-700">{quiz.passingScore}%</strong>
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-800 line-clamp-2">
                      {quiz.title}
                    </h3>

                    {quiz.trainingModule && (
                      <div className="mt-1 flex items-center space-x-1.5 text-xs text-indigo-600 font-medium">
                        <Icon name="academic-cap" className="w-3.5 h-3.5" />
                        <span className="line-clamp-1">{quiz.trainingModule.title}</span>
                      </div>
                    )}

                    <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                      {quiz.description || 'Test your knowledge on key principles and guidelines from this security module.'}
                    </p>
                  </div>

                  {/* Card Footer */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-[11px] text-slate-400">
                      {quiz.questionCount || 0} Questions
                    </div>

                    {canAttempt ? (
                      <button
                        data-start-quiz-btn={quiz.id}
                        onClick={() => setTakingQuizId(quiz.id)}
                        className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                          hasPassed
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                        }`}
                      >
                        <span>{hasPassed ? 'Retake Quiz' : latestAttempt ? 'Retry Quiz' : 'Start Assessment'}</span>
                        <Icon name="arrow-right" className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        disabled
                        className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-400 cursor-not-allowed flex items-center space-x-1.5"
                        title={
                          !hasCompletedTraining
                            ? 'You must complete the associated training module first.'
                            : 'Assessment is currently unavailable.'
                        }
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
