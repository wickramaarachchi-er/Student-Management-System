/**
 * components/training/TrainingProgressModal.jsx
 * Modal dialog for Training Administrator to view employee progress report for a module.
 */
import { useState, useEffect } from 'react';
import { getTrainingProgressReportRequest } from '../../services/training.service.js';
import Icon from '../common/Icon.jsx';
import './TrainingDialogs.css';
import './TrainingProgressReport.css';

export default function TrainingProgressModal({ isOpen, onClose, moduleId }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    if (isOpen && moduleId) {
      loadReport();
    } else {
      setReport(null);
      setSearchTerm('');
      setStatusFilter('ALL');
    }
  }, [isOpen, moduleId]);

  const loadReport = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getTrainingProgressReportRequest(moduleId);
      if (res.ok && res.data?.success) {
        setReport(res.data.data);
      } else {
        setError(res.data?.message || 'Failed to load progress report.');
      }
    } catch {
      setError('A network error occurred while loading progress report.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const employees = report?.employees || [];
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      !searchTerm.trim() ||
      `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.department && emp.department.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'ALL' ||
      emp.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const summary = report?.summary || {
    totalEmployees: 0,
    completed: 0,
    inProgress: 0,
    notStarted: 0,
  };

  return (
    <div className="training-dialog-overlay fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="training-dialog training-progress-report bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="progress-report-title"
      >
        {/* Header */}
        <div className="training-dialog-header px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60 flex-shrink-0">
          <div className="training-dialog-heading flex items-center space-x-3">
            <div className="training-dialog-emblem w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Icon name="trending-up" className="w-5 h-5" />
            </div>
            <div>
              <h2 id="progress-report-title" className="text-lg font-bold text-slate-800">
                Employee Training Progress Report
              </h2>
              <p className="text-xs text-slate-500">
                {report?.module?.title || 'Course completion metrics across all active employees'}
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

        {/* Modal Body */}
        <div className="training-dialog-body p-6 overflow-y-auto flex-1 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-3">
              <Icon name="refresh" className="w-8 h-8 animate-spin text-indigo-500" />
              <p className="text-sm font-medium">Loading employee progress statistics...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
              {error}
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="training-progress-metrics grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Total Employees
                  </p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">
                    {summary.totalEmployees}
                  </p>
                </div>
                <div className="p-4 bg-emerald-50/60 border border-emerald-200/70 rounded-xl">
                  <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                    Completed
                  </p>
                  <p className="text-2xl font-bold text-emerald-800 mt-1">
                    {summary.completed}
                  </p>
                </div>
                <div className="p-4 bg-amber-50/60 border border-amber-200/70 rounded-xl">
                  <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                    In Progress
                  </p>
                  <p className="text-2xl font-bold text-amber-800 mt-1">
                    {summary.inProgress}
                  </p>
                </div>
                <div className="p-4 bg-slate-100/60 border border-slate-200/80 rounded-xl">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Not Started
                  </p>
                  <p className="text-2xl font-bold text-slate-700 mt-1">
                    {summary.notStarted}
                  </p>
                </div>
              </div>

              {/* Filters */}
              <div className="training-progress-filters flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="training-progress-search relative flex-1">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Icon name="search" className="w-4 h-4" />
                  </span>
                  <input
                    type="search" aria-label="Search employees by name, email, or department"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by employee name, email, or department..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>

                <div className="training-progress-tabs flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl">
                  {['ALL', 'COMPLETED', 'IN_PROGRESS', 'NOT_STARTED'].map((st) => (
                    <button
                      key={st} aria-pressed={statusFilter === st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        statusFilter === st
                          ? 'bg-white text-slate-800 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {st === 'ALL'
                        ? 'All'
                        : st === 'COMPLETED'
                        ? 'Completed'
                        : st === 'IN_PROGRESS'
                        ? 'In Progress'
                        : 'Not Started'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Employee Table */}
              <div className="training-progress-roster border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      <th scope="col" className="py-3 px-4">Employee</th>
                      <th scope="col" className="py-3 px-4">Department</th>
                      <th scope="col" className="py-3 px-4">Training Status</th>
                      <th scope="col" className="py-3 px-4">Assigned date</th>
                      <th scope="col" className="py-3 px-4">Completed Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredEmployees.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                          No employee records match the selected criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredEmployees.map((emp) => (
                        <tr key={emp.employeeId} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-800">
                              {emp.firstName} {emp.lastName}
                            </div>
                            <div className="text-slate-500 text-[11px] font-mono">
                              {emp.email}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-600 font-medium">
                            {emp.department || '—'}
                          </td>
                          <td className="py-3 px-4">
                            {emp.status === 'COMPLETED' ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                                Completed
                              </span>
                            ) : emp.status === 'IN_PROGRESS' ? (
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
                          </td>
                          <td className="py-3 px-4 text-slate-500">
                            {emp.assignedAt ? new Date(emp.assignedAt).toLocaleDateString() : '—'}
                          </td>
                          <td className="py-3 px-4 text-slate-500">
                            {emp.completedAt ? (
                              <span className="font-medium text-emerald-700">
                                {new Date(emp.completedAt).toLocaleDateString()}
                              </span>
                            ) : (
                              '—'
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="training-dialog-footer px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between flex-shrink-0">
          <p className="text-xs text-slate-500">
            Showing {filteredEmployees.length} of {employees.length} employees
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors shadow-xs"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
}
