/**
 * pages/TrainingProgressPage.jsx
 * Training Progress Oversight page for TRAINING_ADMIN.
 * Displays overall organization progress metrics across all authored training modules.
 */
import { useState, useEffect, useCallback } from 'react';
import { listTrainingRequest } from '../services/training.service.js';
import Icon from '../components/common/Icon.jsx';
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
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
            <Icon name="trending-up" className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Training Progress Oversight</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Monitor organization-wide course engagement, completion ratios, and employee compliance statuses
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Icon name="search" className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search training modules by name..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* Modules Progress Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800">
            Course Completion Overview
          </h2>
          <span className="text-xs text-slate-500">
            {modules.length} active module{modules.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-400 space-y-3">
            <Icon name="refresh" className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-sm font-medium">Loading training reports...</p>
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
              {error}
            </div>
          </div>
        ) : modules.length === 0 ? (
          <div className="p-16 text-center text-slate-400 text-sm">
            No training modules found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Training Module</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Completions</th>
                  <th className="py-3.5 px-6">In Progress</th>
                  <th className="py-3.5 px-6 text-right">Detailed Report</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {modules.map((mod) => {
                  const stats = mod.stats || { completed: 0, inProgress: 0, notStarted: 0 };

                  return (
                    <tr key={mod.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6 max-w-sm">
                        <div className="font-bold text-slate-800 text-sm">{mod.title}</div>
                        <p className="text-slate-500 text-xs line-clamp-1 mt-0.5">
                          {mod.description || 'Cybersecurity training course'}
                        </p>
                      </td>

                      <td className="py-4 px-6">
                        {mod.isPublished ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            Draft
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        <span className="font-semibold text-emerald-700">
                          {stats.completed} employee{stats.completed !== 1 ? 's' : ''}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <span className="font-semibold text-amber-700">
                          {stats.inProgress} active
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => setSelectedModuleId(mod.id)}
                          className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold transition-colors inline-flex items-center space-x-1.5"
                        >
                          <span>View Roster</span>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
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
