/**
 * pages/TrainingProgressPage.jsx
 * Training Progress Oversight page for TRAINING_ADMIN.
 */
import { useState, useEffect, useCallback } from 'react';
import { listTrainingRequest } from '../services/training.service.js';
import Icon from '../components/common/Icon.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import LoadingState from '../components/common/LoadingState.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import TrainingProgressModal from '../components/training/TrainingProgressModal.jsx';

export default function TrainingProgressPage() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModuleId, setSelectedModuleId] = useState(null);

  const fetchModules = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await listTrainingRequest({ search: searchTerm });
      if (res.ok && res.data?.success) {
        setModules(res.data.data.modules || []);
      } else {
        setError(res.data?.message || 'Failed to load progress records.');
      }
    } catch {
      setError('A network error occurred. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Training Progress Oversight"
        description="Monitor organization-wide course engagement, completion ratios, and employee compliance statuses."
        icon="trending-up"
      />

      {/* Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
        <div className="relative">
          <Icon name="search" className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search training modules by name…"
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Modules Progress Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Course Completion Overview</h2>
          <span className="text-xs text-slate-400">{modules.length} active module{modules.length !== 1 ? 's' : ''}</span>
        </div>

        {loading ? (
          <div className="p-6"><LoadingState message="Loading training progress reports…" /></div>
        ) : error ? (
          <div className="p-6"><ErrorState message={error} onRetry={fetchModules} /></div>
        ) : modules.length === 0 ? (
          <div className="p-6"><EmptyState title="No training modules found" description="No active training modules are available." icon="academic-cap" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Training Module</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5">Completions</th>
                  <th className="py-3.5 px-5">In Progress</th>
                  <th className="py-3.5 px-5 text-right">Report</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-xs">
                {modules.map((mod) => {
                  const stats = mod.stats || { completed: 0, inProgress: 0, notStarted: 0 };
                  return (
                    <tr key={mod.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-5 max-w-sm">
                        <div className="font-bold text-slate-100 text-sm">{mod.title}</div>
                        <p className="text-slate-400 text-xs line-clamp-1 mt-0.5">{mod.description || 'Cybersecurity training course'}</p>
                      </td>
                      <td className="py-4 px-5">
                        <StatusBadge status={mod.isPublished ? 'PUBLISHED' : 'DRAFT'} />
                      </td>
                      <td className="py-4 px-5">
                        <span className="font-bold text-emerald-400">{stats.completed} employee{stats.completed !== 1 ? 's' : ''}</span>
                      </td>
                      <td className="py-4 px-5">
                        <span className="font-bold text-amber-400">{stats.inProgress} active</span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={() => setSelectedModuleId(mod.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 hover:border-blue-500 text-xs font-bold transition-all cursor-pointer"
                        >
                          <Icon name="eye" className="w-3.5 h-3.5" />
                          <span>View Roster</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Progress Report Modal */}
      <TrainingProgressModal
        isOpen={!!selectedModuleId}
        onClose={() => setSelectedModuleId(null)}
        moduleId={selectedModuleId}
      />
    </div>
  );
}
