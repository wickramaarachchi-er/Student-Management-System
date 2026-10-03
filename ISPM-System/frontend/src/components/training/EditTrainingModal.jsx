/**
 * components/training/EditTrainingModal.jsx
 * Modal dialog for Training Administrator to edit an existing Training Module.
 */
import { useState, useEffect } from 'react';
import { updateTrainingRequest } from '../../services/training.service.js';
import Icon from '../common/Icon.jsx';
import './TrainingDialogs.css';

export default function EditTrainingModal({ isOpen, onClose, trainingModule, onUpdated }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    resourceUrl: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (trainingModule) {
      setFormData({
        title: trainingModule.title || '',
        description: trainingModule.description || '',
        content: trainingModule.content || '',
        resourceUrl: trainingModule.resourceUrl || '',
      });
      setFieldErrors({});
      setApiError('');
    }
  }, [trainingModule]);

  if (!isOpen || !trainingModule) return null;

  const validate = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Title is required.';
    if (!formData.content.trim()) errors.content = 'Content is required.';
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
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        content: formData.content.trim(),
        resourceUrl: formData.resourceUrl.trim() || null,
      };

      const res = await updateTrainingRequest(trainingModule.id, payload);
      if (res.ok && res.data?.success) {
        onUpdated(res.data.data.module);
        onClose();
      } else {
        setApiError(res.data?.message || 'Failed to update training module.');
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

  return (
    <div className="training-dialog-overlay fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="training-dialog training-edit-dialog bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-training-title"
      >
        {/* Header */}
        <div className="training-dialog-header px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="training-dialog-heading flex items-center space-x-3">
            <div className="training-dialog-emblem w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Icon name="pencil" className="w-5 h-5" />
            </div>
            <div>
              <h2 id="edit-training-title" className="text-lg font-bold text-slate-800">
                Edit Training Module
              </h2>
              <p className="text-xs text-slate-500">
                Update module metadata, learning content, or reference links
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="training-dialog-close text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <Icon name="close" className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="training-dialog-form p-6 space-y-4">
          <div className="training-form-intro"><span>MODULE DETAILS</span><p>Refine the learning objective, curriculum, and supporting resources.</p></div>
          {apiError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
              {apiError}
            </div>
          )}

          <div className="training-form-field">
            <label htmlFor="edit-title" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Module Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="edit-title"
              name="title"
              type="text"
              required
              value={formData.title}
              onChange={handleChange}
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
            <label htmlFor="edit-description" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Summary / Objective
            </label>
            <textarea
              id="edit-description"
              name="description"
              rows={2}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 transition-all resize-none"
            />
          </div>

          <div>
            <label htmlFor="edit-content" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Training Content <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="edit-content"
              aria-describedby="training-content-hint"
              name="content"
              rows={6}
              required
              value={formData.content}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                fieldErrors.content
                  ? 'border-rose-300 focus:ring-rose-500/20 text-rose-900 bg-rose-50/20'
                  : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800'
              }`}
            />
            <p id="training-content-hint" className="training-field-hint">Use clear steps and practical examples to guide your learners.</p>
            {fieldErrors.content && (
              <p className="mt-1 text-xs text-rose-600 font-medium">{fieldErrors.content}</p>
            )}
          </div>

          <div>
            <label htmlFor="edit-resourceUrl" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Resource Link or Slide Deck URL (Optional)
            </label>
            <input
              id="edit-resourceUrl"
              name="resourceUrl"
              type="text"
              value={formData.resourceUrl}
              onChange={handleChange}
              placeholder="https://example.com/materials/presentation.pdf"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 transition-all"
            />
          </div>

          {/* Footer Controls */}
          <div className="training-dialog-footer pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="training-dialog-secondary px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="training-dialog-primary px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-indigo-600/20 disabled:opacity-60 transition-all flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <Icon name="refresh" className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Icon name="check" className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
