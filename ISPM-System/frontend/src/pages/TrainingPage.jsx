/**
 * pages/TrainingPage.jsx
 * Unified Security Awareness Training page with role-specific views.
 */
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { listTrainingRequest, publishTrainingRequest } from '../services/training.service.js';
import Icon from '../components/common/Icon.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import LoadingState from '../components/common/LoadingState.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';

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
        <div className="p-4 bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 text-xs font-semibold rounded-xl shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="check" className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage('')} className="text-emerald-400 hover:text-emerald-200 cursor-pointer">
            <Icon name="close" className="w-4 h-4" />
          </button>
        </div>
      )}

      <PageHeader
        title={isTrainingAdmin ? 'Training Management & Curriculum' : 'Security Awareness Training'}
        description={
          isTrainingAdmin
            ? 'Author cybersecurity courses, publish learning modules, and monitor employee training progress.'
            : 'Engage with required cybersecurity training modules to protect company systems and data.'
        }
        icon="academic-cap"
        action={
          isTrainingAdmin ? (
            <button
              id="add-training-btn"
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-950 cursor-pointer"
            >
              <Icon name="plus" className="w-4 h-4" />
              <span>Add Training Module</span>
            </button>
          ) : null
        }
      />

      {/* Filter / Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Icon name="search" className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search training modules by title or keywords…"
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {isTrainingAdmin && (
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium text-slate-100 focus:outline-none focus:border-blue-500"
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
        <LoadingState message="Loading training modules…" rows={4} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchModules} />
      ) : modules.length === 0 ? (
        <EmptyState
          title="No training modules found"
          description={
            isTrainingAdmin
              ? 'Click "Add Training Module" to author your first awareness module.'
              : 'There are no active security training courses assigned at this time.'
          }
          icon="academic-cap"
        />
      ) : isTrainingAdmin ? (
        /* ================= TRAINING ADMIN TABLE VIEW ================= */
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Course Module</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5">Employee Progress</th>
                  <th className="py-3.5 px-5">Created / Author</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-xs">
                {modules.map((mod) => (
                  <tr key={mod.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-5 max-w-sm">
                      <div className="font-bold text-slate-100 text-sm">{mod.title}</div>
                      <p className="text-slate-400 text-xs line-clamp-1 mt-0.5">{mod.description || 'No description provided.'}</p>
                      {mod.resourceUrl && (
                        <div className="mt-1 flex items-center gap-1 text-[11px] text-blue-400 font-medium">
                          <Icon name="book" className="w-3.5 h-3.5" />
                          <span>External resources attached</span>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-5">
                      <StatusBadge status={mod.isPublished ? 'PUBLISHED' : 'DRAFT'} />
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-emerald-400 font-bold">✓ {mod.stats?.completed || 0}</span>
                        <span className="text-amber-400 font-bold">⋯ {mod.stats?.inProgress || 0}</span>
                        <button
                          onClick={() => setProgressModuleId(mod.id)}
                          className="text-blue-400 hover:text-blue-300 font-semibold hover:underline text-[11px] cursor-pointer"
                        >
                          View Report →
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-slate-400">
                      <div>{new Date(mod.createdAt).toLocaleDateString()}</div>
                      <div className="text-[11px] text-slate-500">{mod.creator ? `${mod.creator.firstName} ${mod.creator.lastName}` : 'System'}</div>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => setDetailModuleId(mod.id)} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer" title="View Curriculum"><Icon name="eye" className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setEditingModule(mod)} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer" title="Edit Module"><Icon name="pencil" className="w-3.5 h-3.5" /></button>
                        {!mod.isPublished ? (
                          <button onClick={() => handlePublish(mod)} className="px-2.5 py-1.5 rounded-lg bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 hover:border-emerald-500 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer" title="Publish for employees">
                            <Icon name="check" className="w-3.5 h-3.5" /><span>Publish</span>
                          </button>
                        ) : (
                          <button onClick={() => setArchivingModule(mod)} className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-white border border-amber-500/30 hover:border-amber-500 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer" title="Deactivate">
                            <Icon name="power" className="w-3.5 h-3.5" /><span>Deactivate</span>
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
            const accentColor = isCompleted ? 'bg-emerald-500' : isInProgress ? 'bg-amber-500' : 'bg-blue-500';
            const badgeStatus = isCompleted ? 'COMPLETED' : isInProgress ? 'IN_PROGRESS' : 'NOT_STARTED';

            return (
              <div
                key={mod.id}
                data-module-card={mod.id}
                className="bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 hover:shadow-md transition-all flex flex-col overflow-hidden"
              >
                <div className={`h-1.5 w-full ${accentColor}`} />

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <StatusBadge status={badgeStatus} />
                      <span className="text-[11px] text-slate-500">{new Date(mod.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-100 line-clamp-2">{mod.title}</h3>
                    <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                      {mod.description || 'Review essential cybersecurity guidelines and policies in this interactive training module.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div className="text-[11px] text-slate-500">
                      {mod.resourceUrl ? <span className="text-blue-400 font-medium">Resources attached</span> : <span>Curriculum ready</span>}
                    </div>
                    <button
                      data-action-btn={mod.id}
                      onClick={() => setDetailModuleId(mod.id)}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        isCompleted
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                          : isInProgress
                          ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-sm'
                          : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
                      }`}
                    >
                      <span>{isCompleted ? 'Review' : isInProgress ? 'Resume' : 'Start Training'}</span>
                      <Icon name="arrow-right" className="w-3.5 h-3.5" />
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
