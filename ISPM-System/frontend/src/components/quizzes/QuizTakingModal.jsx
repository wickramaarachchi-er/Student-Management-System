/**
 * components/quizzes/QuizTakingModal.jsx
 * Employee Quiz-taking modal interface.
 * Features question-by-question or scrollable questionnaire, radio button selection,
 * deliberate confirmation before submission, and immediate score/pass-fail display.
 */
import { useState, useEffect } from 'react';
import { startQuizRequest, submitQuizRequest } from '../../services/quiz.service.js';
import Icon from '../common/Icon.jsx';
import './QuizAdminDialogs.css';
import './EmployeeQuizDialog.css';

export default function QuizTakingModal({ isOpen, onClose, quizId, onQuizSubmitted }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quizData, setQuizData] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [questions, setQuestions] = useState([]);

  // Selected answers: Map<questionId, selectedOptionId>
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);

  // Submission workflow
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (isOpen && quizId) {
      startQuiz();
    } else {
      setQuizData(null);
      setAttemptId(null);
      setQuestions([]);
      setSelectedAnswers({});
      setCurrentQuestionIdx(0);
      setShowConfirmSubmit(false);
      setSubmissionResult(null);
      setSubmitError('');
    }
  }, [isOpen, quizId]);

  const startQuiz = async () => {
    setLoading(true);
    setError('');
    setSubmitError('');
    setShowConfirmSubmit(false);
    setSubmissionResult(null);

    try {
      const res = await startQuizRequest(quizId);
      if (res.ok && res.data?.success) {
        setQuizData(res.data.data.quiz);
        setAttemptId(res.data.data.attempt.id);
        setQuestions(res.data.data.questions || []);
      } else {
        setError(res.data?.message || 'Could not start quiz assessment.');
      }
    } catch {
      setError('A network error occurred while starting the assessment.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId, optionId) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmitAttempt = async () => {
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const answersPayload = Object.entries(selectedAnswers).map(([qId, optId]) => ({
        questionId: qId,
        selectedOptionId: optId,
      }));

      const res = await submitQuizRequest(quizId, attemptId, answersPayload);
      if (res.ok && res.data?.success) {
        setSubmissionResult(res.data.data);
        setShowConfirmSubmit(false);
        if (onQuizSubmitted) onQuizSubmitted(res.data.data);
      } else {
        setSubmitError(res.data?.message || 'Failed to submit quiz attempt.');
      }
    } catch {
      setSubmitError('A network error occurred while submitting your answers.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const totalQuestions = questions.length;
  const currentQ = questions[currentQuestionIdx];
  const answeredCount = Object.keys(selectedAnswers).length;
  const isAllAnswered = totalQuestions > 0 && answeredCount >= totalQuestions;

  return (
    <div className="quiz-admin-overlay fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="quiz-admin-dialog employee-quiz-dialog bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quiz-taking-title"
      >
        {/* Header */}
        <div className="quiz-admin-header px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60 flex-shrink-0">
          <div className="quiz-admin-heading flex items-center space-x-3">
            <div className="quiz-admin-emblem w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Icon name="clipboard-list" className="w-5 h-5" />
            </div>
            <div>
              <h2 id="quiz-taking-title" className="text-lg font-bold text-slate-800">
                {quizData?.title || 'Security Knowledge Assessment'}
              </h2>
              <div className="flex items-center space-x-2 mt-0.5 text-xs text-slate-500">
                <span>Pass mark: {quizData?.passingScore ?? 70}%</span>
                {totalQuestions > 0 && !submissionResult && (
                  <>
                    <span>•</span>
                    <span>
                      Answered {answeredCount} of {totalQuestions}
                    </span>
                  </>
                )}
              </div>
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
              <p className="text-sm font-medium">Preparing assessment questions...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
              {error}
            </div>
          ) : submissionResult ? (
            /* ================= VIEW: SUBMISSION RESULT ================= */
            <div className="space-y-6 py-4 animate-in fade-in duration-200">
              <div
                className={`employee-quiz-result p-6 rounded-2xl border text-center ${
                  submissionResult.isPassed
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50/80 border-rose-200 text-rose-900'
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center text-white mb-3 shadow-md ${
                    submissionResult.isPassed ? 'bg-emerald-600 shadow-emerald-900/20' : 'bg-rose-600 shadow-rose-900/20'
                  }`}
                >
                  {submissionResult.isPassed ? (
                    <Icon name="check" className="w-8 h-8 stroke-[3]" />
                  ) : (
                    <Icon name="close" className="w-8 h-8 stroke-[3]" />
                  )}
                </div>

                <h3 id="quiz-result-status" className="text-xl font-bold">
                  {submissionResult.isPassed ? 'Assessment Passed!' : 'Assessment Failed'}
                </h3>
                <p className="text-xs mt-1 text-slate-600">
                  {submissionResult.isPassed
                    ? 'Congratulations! You have satisfied the knowledge retention requirement.'
                    : `You scored below the passing threshold of ${submissionResult.passingScore}%. You may review the materials and re-attempt.`}
                </p>

                {/* Score Pill */}
                <div className="mt-5 inline-flex items-baseline space-x-2 bg-white px-6 py-3 rounded-2xl border border-slate-200/80 shadow-xs">
                  <span id="quiz-result-score" className="text-3xl font-extrabold text-slate-800">
                    {submissionResult.score}%
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">
                    ({submissionResult.pointsEarned} / {submissionResult.totalPoints} points)
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
                <div className="flex justify-between">
                  <span>Questions Correct:</span>
                  <span className="font-semibold text-slate-800">
                    {submissionResult.correctCount} of {submissionResult.totalQuestions}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Submitted At:</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(submissionResult.submittedAt).toLocaleDateString()} at{' '}
                    {new Date(submissionResult.submittedAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          ) : currentQ ? (
            /* ================= VIEW: QUESTIONNAIRE ================= */
            <div className="space-y-5">
              {/* Question Navigation Chips */}
              <div className="employee-question-nav flex items-center space-x-1.5 overflow-x-auto pb-1">
                {questions.map((q, idx) => {
                  const isAnswered = Boolean(selectedAnswers[q.id]);
                  const isCurrent = idx === currentQuestionIdx;

                  return (
                    <button
                      key={q.id} aria-label={"Question " + (idx + 1) + (isAnswered ? ", answered" : ", unanswered")} aria-current={isCurrent ? "step" : undefined}
                      onClick={() => setCurrentQuestionIdx(idx)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${
                        isCurrent
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : isAnswered
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Active Question Box */}
              <div className="employee-question-box p-5 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {currentQuestionIdx + 1}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 leading-snug">
                      {currentQ.questionText}
                    </h3>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Points: {currentQ.points}
                    </span>
                  </div>
                </div>

                {/* Radio Options */}
                <div className="employee-answer-options space-y-2.5 pl-10">
                  {(currentQ.options || []).map((opt) => {
                    const isSelected = selectedAnswers[currentQ.id] === opt.id;

                    return (
                      <label
                        key={opt.id}
                        data-option-label={opt.id}
                        className={`flex items-center space-x-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-indigo-50/80 border-indigo-300 ring-1 ring-indigo-400/20 text-indigo-900 font-semibold'
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question_${currentQ.id}`}
                          value={opt.id}
                          checked={isSelected}
                          onChange={() => handleSelectOption(currentQ.id, opt.id)}
                          className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-xs leading-relaxed flex-1">{opt.optionText}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Submit Error */}
              {submitError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                  {submitError}
                </div>
              )}

              {/* Confirmation Dialog before Final Submission */}
              {showConfirmSubmit && (
                <div className="employee-quiz-confirmation p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 flex-shrink-0 mt-0.5">
                      <Icon name="shield-check" className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-amber-900">
                        Confirm Quiz Submission
                      </h4>
                      <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                        Submit Quiz? You will not be able to change this attempt after submission.
                        Your answers will be evaluated immediately.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowConfirmSubmit(false)}
                      disabled={isSubmitting}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-white rounded-lg transition-colors"
                    >
                      Return to Quiz
                    </button>
                    <button
                      id="confirm-submit-quiz-btn"
                      type="button"
                      onClick={handleSubmitAttempt}
                      disabled={isSubmitting}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-60 transition-colors flex items-center space-x-1.5"
                    >
                      {isSubmitting ? (
                        <>
                          <Icon name="refresh" className="w-3.5 h-3.5 animate-spin" />
                          <span>Grading...</span>
                        </>
                      ) : (
                        <>
                          <Icon name="check" className="w-3.5 h-3.5" />
                          <span>Confirm & Submit</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer Navigation */}
        <div className="quiz-admin-footer px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between flex-shrink-0">
          {submissionResult ? (
            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
              >
                Close & Return
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setCurrentQuestionIdx((p) => Math.max(0, p - 1))}
                  disabled={currentQuestionIdx === 0}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentQuestionIdx((p) => Math.min(totalQuestions - 1, p + 1))}
                  disabled={currentQuestionIdx === totalQuestions - 1}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                >
                  Next
                </button>
              </div>

              <div>
                {!showConfirmSubmit && (
                  <button
                    id="submit-quiz-trigger-btn"
                    type="button"
                    onClick={() => setShowConfirmSubmit(true)}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-emerald-600/20 transition-all flex items-center space-x-1.5"
                  >
                    <Icon name="check" className="w-4 h-4" />
                    <span>Submit Quiz</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
