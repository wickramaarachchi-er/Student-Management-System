/**
 * components/quizzes/ManageQuestionsModal.jsx
 * Comprehensive Question Authoring and Management dialog for Training Administrator.
 * Supports viewing questions, adding new questions with dynamic options, editing,
 * and deleting questions with confirmation.
 */
import { useState, useEffect, useCallback } from 'react';
import {
  getQuizRequest,
  createQuestionRequest,
  updateQuestionRequest,
  deleteQuestionRequest,
} from '../../services/quiz.service.js';
import Icon from '../common/Icon.jsx';
import './QuizAdminDialogs.css';

export default function ManageQuestionsModal({ isOpen, onClose, quizId, onQuestionsChanged }) {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');

  // Mode: 'LIST' | 'CREATE' | 'EDIT'
  const [viewMode, setViewMode] = useState('LIST');
  const [activeQuestion, setActiveQuestion] = useState(null);

  // Question Form State
  const [questionText, setQuestionText] = useState('');
  const [points, setPoints] = useState(1);
  const [options, setOptions] = useState([
    { optionText: '', isCorrect: true },
    { optionText: '', isCorrect: false },
    { optionText: '', isCorrect: false },
    { optionText: '', isCorrect: false },
  ]);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete confirmation
  const [deletingQuestionId, setDeletingQuestionId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadQuiz = useCallback(async () => {
    setLoading(true);
    setApiError('');
    try {
      const res = await getQuizRequest(quizId);
      if (res.ok && res.data?.success) {
        setQuiz(res.data.data.quiz);
      } else {
        setApiError(res.data?.message || 'Failed to load quiz questions.');
      }
    } catch {
      setApiError('A network error occurred.');
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    if (isOpen && quizId) {
      loadQuiz();
      setViewMode('LIST');
      setActiveQuestion(null);
      setFormError('');
    }
  }, [isOpen, quizId, loadQuiz]);

  if (!isOpen) return null;

  const startCreate = () => {
    setQuestionText('');
    setPoints(1);
    setOptions([
      { optionText: '', isCorrect: true },
      { optionText: '', isCorrect: false },
    ]);
    setFormError('');
    setViewMode('CREATE');
  };

  const startEdit = (q) => {
    setActiveQuestion(q);
    setQuestionText(q.questionText || '');
    setPoints(q.points || 1);
    setOptions(
      (q.options || []).map((o) => ({
        id: o.id,
        optionText: o.optionText,
        isCorrect: Boolean(o.isCorrect),
      }))
    );
    setFormError('');
    setViewMode('EDIT');
  };

  const handleOptionTextChange = (idx, text) => {
    setOptions((prev) => {
      const next = [...prev];
      next[idx].optionText = text;
      return next;
    });
  };

  const handleSelectCorrect = (idx) => {
    setOptions((prev) =>
      prev.map((opt, i) => ({
        ...opt,
        isCorrect: i === idx,
      }))
    );
  };

  const addOptionRow = () => {
    setOptions((prev) => [...prev, { optionText: '', isCorrect: false }]);
  };

  const removeOptionRow = (idx) => {
    if (options.length <= 2) {
      setFormError('At least 2 answer options are required.');
      return;
    }
    const wasCorrect = options[idx].isCorrect;
    const next = options.filter((_, i) => i !== idx);
    if (wasCorrect && next.length > 0) {
      next[0].isCorrect = true; // Fallback default correct option
    }
    setOptions(next);
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!questionText.trim()) {
      setFormError('Question text cannot be empty.');
      return;
    }

    const filledOptions = options.map((o) => ({
      ...o,
      optionText: o.optionText.trim(),
    }));

    if (filledOptions.some((o) => !o.optionText)) {
      setFormError('All answer option fields must have text.');
      return;
    }

    if (filledOptions.length < 2) {
      setFormError('A minimum of 2 options is required.');
      return;
    }

    const correctCount = filledOptions.filter((o) => o.isCorrect).length;
    if (correctCount !== 1) {
      setFormError('Please select exactly one correct answer option.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        questionText: questionText.trim(),
        points: Number(points) || 1,
        options: filledOptions,
      };

      let res;
      if (viewMode === 'CREATE') {
        res = await createQuestionRequest(quizId, payload);
      } else {
        res = await updateQuestionRequest(quizId, activeQuestion.id, payload);
      }

      if (res.ok && res.data?.success) {
        await loadQuiz();
        setViewMode('LIST');
        if (onQuestionsChanged) onQuestionsChanged();
      } else {
        setFormError(res.data?.message || 'Failed to save question.');
      }
    } catch {
      setFormError('Network error while saving question.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    setIsDeleting(true);
    try {
      const res = await deleteQuestionRequest(quizId, questionId);
      if (res.ok && res.data?.success) {
        setDeletingQuestionId(null);
        await loadQuiz();
        if (onQuestionsChanged) onQuestionsChanged();
      } else {
        setApiError(res.data?.message || 'Failed to delete question.');
      }
    } catch {
      setApiError('Network error while deleting question.');
    } finally {
      setIsDeleting(false);
    }
  };

  const questionsList = quiz?.questions || [];

  return (
    <div className="quiz-admin-overlay fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="quiz-admin-dialog quiz-admin-questions bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="manage-questions-title"
      >
        {/* Header */}
        <div className="quiz-admin-header px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60 flex-shrink-0">
          <div className="quiz-admin-heading flex items-center space-x-3">
            <div className="quiz-admin-emblem w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Icon name="clipboard-list" className="w-5 h-5" />
            </div>
            <div>
              <h2 id="manage-questions-title" className="text-lg font-bold text-slate-800">
                {viewMode === 'LIST'
                  ? 'Manage Quiz Questions'
                  : viewMode === 'CREATE'
                  ? 'Author New Question'
                  : 'Edit Question'}
              </h2>
              <p className="text-xs text-slate-500">
                {quiz?.title || 'Security knowledge evaluation syllabus'}
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
              <p className="text-sm font-medium">Loading question bank...</p>
            </div>
          ) : apiError ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
              {apiError}
            </div>
          ) : viewMode === 'LIST' ? (
            /* ================= VIEW 1: QUESTIONS LIST ================= */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Question Bank ({questionsList.length})
                </p>
                <button
                  id="add-question-btn"
                  onClick={startCreate}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center space-x-1.5"
                >
                  <Icon name="plus" className="w-3.5 h-3.5" />
                  <span>Add Question</span>
                </button>
              </div>

              {questionsList.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto mb-2.5">
                    <Icon name="clipboard-list" className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-700">No questions authored yet</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    A quiz must have at least one question before it can be attempted by employees.
                  </p>
                  <button
                    onClick={startCreate}
                    className="mt-3 px-4 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
                  >
                    Author First Question
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {questionsList.map((q, qIdx) => (
                    <div
                      key={q.id}
                      className="quiz-question-card p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl hover:border-slate-300 transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start space-x-2.5">
                          <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                            {qIdx + 1}
                          </span>
                          <div>
                            <p className="text-sm font-bold text-slate-800 leading-snug">
                              {q.questionText}
                            </p>
                            <span className="text-[11px] text-slate-400 font-medium">
                              Value: {q.points} point{q.points !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>

                        <div className="quiz-question-actions flex items-center space-x-1.5 flex-shrink-0">
                          <button
                            onClick={() => startEdit(q)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors"
                            title="Edit Question" aria-label={"Edit question " + (qIdx + 1)}
                          >
                            <Icon name="pencil" className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingQuestionId(q.id)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Question" aria-label={"Delete question " + (qIdx + 1)}
                          >
                            <Icon name="close" className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Options List */}
                      <div className="quiz-answer-grid grid grid-cols-1 sm:grid-cols-2 gap-2 pl-8">
                        {(q.options || []).map((opt) => (
                          <div
                            key={opt.id}
                            className={`p-2 rounded-xl text-xs flex items-center space-x-2 border ${
                              opt.isCorrect
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                                : 'bg-white border-slate-200 text-slate-700'
                            }`}
                          >
                            <span
                              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 ${
                                opt.isCorrect
                                  ? 'bg-emerald-600 text-white'
                                  : 'border border-slate-300 text-slate-400'
                              }`}
                            >
                              {opt.isCorrect ? '✓' : '•'}
                            </span>
                            <span className="quiz-answer-text flex-1">{opt.optionText}</span>
                            {opt.isCorrect && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                                Correct
                              </span>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Delete Confirmation prompt */}
                      {deletingQuestionId === q.id && (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between animate-in fade-in duration-100">
                          <p className="text-xs text-rose-800 font-medium">
                            Delete Question {qIdx + 1}? This action cannot be undone.
                          </p>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setDeletingQuestionId(null)}
                              disabled={isDeleting}
                              className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-800 font-medium rounded-lg"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(q.id)}
                              disabled={isDeleting}
                              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-xs"
                            >
                              {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* ================= VIEW 2: AUTHOR / EDIT FORM ================= */
            <form onSubmit={handleSaveQuestion} className="space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Question Text <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="questionText"
                  rows={2}
                  required
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="e.g. Which of the following best defines a spear phishing attack?"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 resize-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Points
                </label>
                <input
                  id="questionPoints"
                  type="number"
                  min="1"
                  max="10"
                  required
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  className="w-24 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
                />
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Answer Options <span className="text-rose-500">*</span> (Select the correct option)
                  </label>
                  <button
                    type="button"
                    onClick={addOptionRow}
                    className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold flex items-center space-x-1"
                  >
                    <Icon name="plus" className="w-3.5 h-3.5" />
                    <span>Add Option</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {options.map((opt, oIdx) => (
                    <div
                      key={oIdx}
                      className={`p-2.5 rounded-xl border flex items-center space-x-3 transition-colors ${
                        opt.isCorrect
                          ? 'bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-400/20'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      {/* Radio button for single correct option */}
                      <label className="flex items-center space-x-1.5 cursor-pointer flex-shrink-0">
                        <input
                          type="radio"
                          name="correctOptionRadio"
                          checked={opt.isCorrect}
                          onChange={() => handleSelectCorrect(oIdx)}
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 focus:ring-1"
                        />
                        <span
                          className={`text-xs font-bold ${
                            opt.isCorrect ? 'text-emerald-700' : 'text-slate-400'
                          }`}
                        >
                          {opt.isCorrect ? 'Correct' : 'Option ' + (oIdx + 1)}
                        </span>
                      </label>

                      <input
                        type="text"
                        required
                        value={opt.optionText}
                        onChange={(e) => handleOptionTextChange(oIdx, e.target.value)}
                        aria-label={`Answer option ${oIdx + 1}`} placeholder={`Option ${oIdx + 1} text...`}
                        className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />

                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOptionRow(oIdx)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                          title="Remove option"
                        >
                          <Icon name="close" className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="quiz-admin-form-actions pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setViewMode('LIST')}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="save-question-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-60 transition-all flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <Icon name="refresh" className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Icon name="check" className="w-4 h-4" />
                      <span>{viewMode === 'CREATE' ? 'Add to Bank' : 'Save Question'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="quiz-admin-footer px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between flex-shrink-0">
          <p className="text-xs text-slate-500">
            {questionsList.length} question{questionsList.length !== 1 ? 's' : ''} in assessment
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
