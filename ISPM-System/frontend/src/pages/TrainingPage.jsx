/**
 * pages/TrainingPage.jsx
 * Unified Security Awareness Training page with role-specific views for
 * TRAINING_ADMIN (Course management, authoring, publishing, and oversight) and
 * EMPLOYEE (Published training course catalog, curriculum viewer, progress tracking).
 */
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { listTrainingRequest, publishTrainingRequest } from '../services/training.service.js';
import Icon from '../components/common/Icon.jsx';

import CreateTrainingModal from '../components/training/CreateTrainingModal.jsx';
import EditTrainingModal from '../components/training/EditTrainingModal.jsx';
import TrainingDetailModal from '../components/training/TrainingDetailModal.jsx';
import TrainingProgressModal from '../components/training/TrainingProgressModal.jsx';
import ArchiveTrainingModal from '../components/training/ArchiveTrainingModal.jsx';

export default function TrainingPage() {
  const { user } = useAuth();
  const isTrainingAdmin = user?.role === 'TRAINING_ADMIN';
  const isEmployee = user?.role === 'EMPLOYEE';

  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [detailModuleId, setDetailModuleId] = useState(null);
  const [progressModuleId, setProgressModuleId] = useState(null);
  const [archivingModule, setArchivingModule] = useState(null);

  // Quick action feedback
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const fetchModules = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await listTrainingRequest(params);
      if (res.ok && res.data?.success) {
        setModules(res.data.data.modules || []);
      } else {
        setError(res.data?.message || 'Failed to load training modules.');
      }
    } catch {
      setError('A network error occurred. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  const handlePublish = async (mod) => {
    try {
      const res = await publishTrainingRequest(mod.id);
      if (res.ok && res.data?.success) {
        showToast(`"${mod.title}" has been published and is now live for employees.`);
        fetchModules();
      } else {
        showToast(res.data?.message || 'Failed to publish module.');
      }
    } catch {
      showToast('Network error while publishing module.');
    }
  };

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
            <Icon name="academic-cap" className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              {isTrainingAdmin ? 'Training Management & Curriculum' : 'Security Awareness Training'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {isTrainingAdmin
                ? 'Author cybersecurity courses, publish learning modules, and monitor employee training progress'
                : 'Engage with required cybersecurity training modules to protect company systems and data'}
            </p>
          </div>
        </div>

        {isTrainingAdmin && (
          <button
            id="add-training-btn"
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-indigo-600/20 transition-all flex items-center space-x-2 self-start sm:self-auto"
          >
            <Icon name="plus" className="w-4 h-4" />
            <span>Add Training Module</span>
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
            placeholder="Search training modules by title or keywords..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        {isTrainingAdmin && (
          <div className="flex items-center space-x-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Status:
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            >
              <option value="all">All Modules</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
            </select>
          </div>
        )}
      </div>

      {/* Main Content View */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 flex flex-col items-center justify-center text-slate-400 space-y-3">
          <Icon name="refresh" className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm font-medium">Loading training modules...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
          {error}
        </div>
      ) : modules.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto mb-3">
            <Icon name="academic-cap" className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-700">No training modules found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {isTrainingAdmin
              ? 'Click "Add Training Module" to author your first awareness module.'
              : 'There are no active security training courses assigned at this time.'}
          </p>
        </div>
      ) : isTrainingAdmin ? (
        /* ================= TRAINING ADMIN TABLE VIEW ================= */
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Course Module</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Employee Progress</th>
                  <th className="py-3.5 px-6">Created / Author</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {modules.map((mod) => (
                  <tr key={mod.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 max-w-sm">
                      <div className="font-bold text-slate-800 text-sm">{mod.title}</div>
                      <p className="text-slate-500 text-xs line-clamp-1 mt-0.5">
                        {mod.description || 'No description provided.'}
                      </p>
                      {mod.resourceUrl && (
                        <div className="mt-1 flex items-center space-x-1 text-[11px] text-indigo-600 font-medium">
                          <Icon name="book" className="w-3.5 h-3.5" />
                          <span>External resources attached</span>
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-6">
                      {mod.isPublished ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5"></span>
                          Draft
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3 text-xs">
                        <span className="text-emerald-700 font-semibold" title="Completed">
                          ✓ {mod.stats?.completed || 0}
                        </span>
                        <span className="text-amber-700 font-semibold" title="In Progress">
                          ⋯ {mod.stats?.inProgress || 0}
                        </span>
                        <button
                          onClick={() => setProgressModuleId(mod.id)}
                          className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline text-[11px]"
                        >
                          View Report →
                        </button>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-slate-500">
                      <div>{new Date(mod.createdAt).toLocaleDateString()}</div>
                      <div className="text-[11px] text-slate-400">
                        {mod.creator ? `${mod.creator.firstName} ${mod.creator.lastName}` : 'System'}
                      </div>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setDetailModuleId(mod.id)}
                          className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium transition-colors"
                          title="View Curriculum"
                        >
                          <Icon name="eye" className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setEditingModule(mod)}
                          className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium transition-colors"
                          title="Edit Module"
                        >
                          <Icon name="pencil" className="w-3.5 h-3.5" />
                        </button>

                        {!mod.isPublished ? (
                          <button
                            onClick={() => handlePublish(mod)}
                            className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1"
                            title="Publish for employees"
                          >
                            <Icon name="check" className="w-3.5 h-3.5" />
                            <span>Publish</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => setArchivingModule(mod)}
                            className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1"
                            title="Deactivate / Unpublish"
                          >
                            <Icon name="power" className="w-3.5 h-3.5" />
                            <span>Deactivate</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ================= EMPLOYEE COURSE CATALOG VIEW ================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {modules.map((mod) => {
            const status = mod.userProgress?.status || 'NOT_STARTED';
            const isCompleted = status === 'COMPLETED';
            const isInProgress = status === 'IN_PROGRESS';

            return (
              <div
                key={mod.id}
                data-module-card={mod.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden"
              >
                {/* Top Accent Strip */}
                <div
                  className={`h-1.5 w-full ${
                    isCompleted
                      ? 'bg-emerald-500'
                      : isInProgress
                      ? 'bg-amber-500'
                      : 'bg-indigo-500'
                  }`}
                />

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    {/* Status Badge */}
                    <div className="flex items-center justify-between mb-3">
                      {isCompleted ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Icon name="check" className="w-3 h-3 mr-1" />
                          Completed
                        </span>
                      ) : isInProgress ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
                          In Progress
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5"></span>
                          Not Started
                        </span>
                      )}

                      <span className="text-[11px] text-slate-400">
                        {new Date(mod.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-800 line-clamp-2">
                      {mod.title}
                    </h3>

                    <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                      {mod.description || 'Review essential cybersecurity guidelines and policies in this interactive training module.'}
                    </p>
                  </div>

                  {/* Card Footer */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-[11px] text-slate-400">
                      {mod.resourceUrl ? (
                        <span className="text-indigo-600 font-medium">Resources attached</span>
                      ) : (
                        <span>Curriculum ready</span>
                      )}
                    </div>

                    <button
                      data-action-btn={mod.id}
                      onClick={() => setDetailModuleId(mod.id)}
                      className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                        isCompleted
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          : isInProgress
                          ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                      }`}
                    >
                      <span>
                        {isCompleted ? 'Review' : isInProgress ? 'Resume' : 'Start Training'}
                      </span>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <CreateTrainingModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={(newMod) => {
          showToast(`Training module "${newMod.title}" created successfully as Draft.`);
          fetchModules();
        }}
      />

      <EditTrainingModal
        isOpen={!!editingModule}
        onClose={() => setEditingModule(null)}
        trainingModule={editingModule}
        onUpdated={(updMod) => {
          showToast(`Training module "${updMod.title}" updated successfully.`);
          fetchModules();
        }}
      />

      <TrainingDetailModal
        isOpen={!!detailModuleId}
        onClose={() => setDetailModuleId(null)}
        moduleId={detailModuleId}
        userRole={user?.role}
        onProgressUpdated={() => {
          fetchModules();
        }}
      />

      <TrainingProgressModal
        isOpen={!!progressModuleId}
        onClose={() => setProgressModuleId(null)}
        moduleId={progressModuleId}
      />

      <ArchiveTrainingModal
        isOpen={!!archivingModule}
        onClose={() => setArchivingModule(null)}
        trainingModule={archivingModule}
        onArchived={(archMod) => {
          showToast(`Training module "${archMod.title}" has been deactivated.`);
          fetchModules();
        }}
      />
    </div>
  );
}
