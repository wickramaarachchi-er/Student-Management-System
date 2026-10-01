/**
 * components/quizzes/CreateQuizModal.jsx
 * Modal dialog for Training Administrator to create a new Quiz associated with a Training Module.
 */
import { useState, useEffect } from 'react';
import { createQuizRequest } from '../../services/quiz.service.js';
import { listTrainingRequest } from '../../services/training.service.js';
import Icon from '../common/Icon.jsx';

export default function CreateQuizModal({ isOpen, onClose, onCreated }) {
  const [formData, setFormData] = useState({
    trainingModuleId: '',
    title: '',
    description: '',
    passingScore: 70,
    maxAttempts: 3,
    timeLimitMinutes: '',
  });

  const [trainingModules, setTrainingModules] = useState([]);
  const [loadingModules, setLoadingModules] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadModules();
    }
  }, [isOpen]);

  const loadModules = async () => {
    setLoadingModules(true);
    try {
      const res = await listTrainingRequest();
      if (res.ok && res.data?.success) {
        setTrainingModules(res.data.data.modules || []);
      }
    } catch {
      // Ignored
    } finally {
      setLoadingModules(false);
    }
  };

  if (!isOpen) return null;

  const validate = () => {
    const errors = {};
    if (!formData.trainingModuleId) errors.trainingModuleId = 'Please select a related training module.';
    if (!formData.title.trim()) errors.title = 'Quiz title is required.';
    if (formData.passingScore < 0 || formData.passingScore > 100) {
      errors.passingScore = 'Passing score must be between 0 and 100.';
    }
    if (formData.maxAttempts < 1) {
      errors.maxAttempts = 'Max attempts must be at least 1.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        trainingModuleId: formData.trainingModuleId,
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        passingScore: Number(formData.passingScore),
        maxAttempts: Number(formData.maxAttempts),
        timeLimitMinutes: formData.timeLimitMinutes ? Number(formData.timeLimitMinutes) : undefined,
      };

      const res = await createQuizRequest(payload);
      if (res.ok && res.data?.success) {
        onCreated(res.data.data.quiz);
        handleClose();
      } else {
        setApiError(res.data?.message || 'Failed to create quiz.');
        if (res.data?.errors) {
          setFieldErrors(res.data.errors);
        }
      }
    } catch {
      setApiError('A network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      trainingModuleId: '',
      title: '',
      description: '',
      passingScore: 70,
      maxAttempts: 3,
      timeLimitMinutes: '',
    });
    setFieldErrors({});
    setApiError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-quiz-title"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Icon name="clipboard-list" className="w-5 h-5" />
            </div>
            <div>
              <h2 id="create-quiz-title" className="text-lg font-bold text-slate-800">
                Create Knowledge Assessment
              </h2>
              <p className="text-xs text-slate-500">
                Configure quiz evaluation rules and connect to a training module
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <Icon name="close" className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {apiError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
              {apiError}
            </div>
          )}

          <div>
            <label htmlFor="trainingModuleId" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Related Training Module <span className="text-rose-500">*</span>
            </label>
            <select
              id="trainingModuleId"
              name="trainingModuleId"
              required
              value={formData.trainingModuleId}
              onChange={handleChange}
              disabled={loadingModules}
              className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                fieldErrors.trainingModuleId
                  ? 'border-rose-300 focus:ring-rose-500/20 text-rose-900 bg-rose-50/20'
                  : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800'
              }`}
            >
              <option value="">-- Select Training Module --</option>
              {trainingModules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title} {m.isPublished ? '(Published)' : '(Draft)'}
                </option>
              ))}
            </select>
            {fieldErrors.trainingModuleId && (
              <p className="mt-1 text-xs text-rose-600 font-medium">{fieldErrors.trainingModuleId}</p>
            )}
          </div>

          <div>
            <label htmlFor="title" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Quiz Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Phishing Awareness Knowledge Assessment"
              className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                fieldErrors.title
                  ? 'border-rose-300 focus:ring-rose-500/20 text-rose-900 bg-rose-50/20'
                  : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800'
              }`}
            />
            {fieldErrors.title && (
              <p className="mt-1 text-xs text-rose-600 font-medium">{fieldErrors.title}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Description / Instructions
            </label>
            <textarea
              id="description"
              name="description"
              rows={2}
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief instructions for employees taking this assessment..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="passingScore" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Pass Mark (%) <span className="text-rose-500">*</span>
              </label>
              <input
                id="passingScore"
                name="passingScore"
                type="number"
                min="0"
                max="100"
                required
                value={formData.passingScore}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 transition-all"
              />
            </div>

            <div>
              <label htmlFor="maxAttempts" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Max Attempts
              </label>
              <input
                id="maxAttempts"
                name="maxAttempts"
                type="number"
                min="1"
                required
                value={formData.maxAttempts}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 transition-all"
              />
            </div>

            <div>
              <label htmlFor="timeLimitMinutes" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Time Limit (mins)
              </label>
              <input
                id="timeLimitMinutes"
                name="timeLimitMinutes"
                type="number"
                min="1"
                placeholder="Optional"
                value={formData.timeLimitMinutes}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 transition-all"
              />
            </div>
          </div>

          {/* Footer Controls */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              id="submit-create-quiz-btn"
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-indigo-600/20 disabled:opacity-60 transition-all flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <Icon name="refresh" className="w-4 h-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Icon name="plus" className="w-4 h-4" />
                  <span>Create Quiz</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
