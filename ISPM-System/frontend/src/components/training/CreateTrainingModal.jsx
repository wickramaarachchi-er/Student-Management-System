/**
 * components/training/CreateTrainingModal.jsx
 * Modal dialog for Training Administrator to create a new Training Module.
 */
import { useState } from 'react';
import { createTrainingRequest } from '../../services/training.service.js';
import Icon from '../common/Icon.jsx';

export default function CreateTrainingModal({ isOpen, onClose, onCreated }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    resourceUrl: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState('');

  if (!isOpen) return null;

  const validate = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Training module title is required.';
    if (!formData.content.trim()) errors.content = 'Training content is required.';

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
        description: formData.description.trim() || undefined,
        content: formData.content.trim(),
        resourceUrl: formData.resourceUrl.trim() || undefined,
      };

      const res = await createTrainingRequest(payload);
      if (res.ok && res.data?.success) {
        onCreated(res.data.data.module);
        handleClose();
      } else {
        setApiError(res.data?.message || 'Failed to create training module.');
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
      title: '',
      description: '',
      content: '',
      resourceUrl: '',
    });
    setFieldErrors({});
    setApiError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-training-title"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Icon name="academic-cap" className="w-5 h-5" />
            </div>
            <div>
              <h2 id="create-training-title" className="text-lg font-bold text-slate-800">
                Create Training Module
              </h2>
              <p className="text-xs text-slate-500">
                Author new security awareness course material (saved as Draft)
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
            <label htmlFor="title" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Module Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Phishing Awareness & Social Engineering Defense"
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
              Summary / Objective
            </label>
            <textarea
              id="description"
              name="description"
              rows={2}
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief summary of what employees will learn in this session..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 transition-all resize-none"
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Training Content <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="content"
              name="content"
              rows={6}
              required
              value={formData.content}
              onChange={handleChange}
              placeholder="Detailed training syllabus, guidelines, procedures, and learning objectives..."
              className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                fieldErrors.content
                  ? 'border-rose-300 focus:ring-rose-500/20 text-rose-900 bg-rose-50/20'
                  : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800'
              }`}
            />
            {fieldErrors.content && (
              <p className="mt-1 text-xs text-rose-600 font-medium">{fieldErrors.content}</p>
            )}
          </div>

          <div>
            <label htmlFor="resourceUrl" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Resource Link or Slide Deck URL (Optional)
            </label>
            <input
              id="resourceUrl"
              name="resourceUrl"
              type="text"
              value={formData.resourceUrl}
              onChange={handleChange}
              placeholder="https://example.com/slides/security-overview.pdf"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 transition-all"
            />
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
                  <span>Save Training</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
