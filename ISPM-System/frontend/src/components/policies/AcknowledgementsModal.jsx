/**
 * components/policies/AcknowledgementsModal.jsx
 * Displays the acknowledgement report for a published policy version (Compliance Officer only).
 */
import React, { useState, useEffect, useMemo } from 'react';
import { getPolicyAcknowledgementsRequest } from '../../services/policy.service.js';

export function AcknowledgementsModal({ isOpen, onClose, policy }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    if (!isOpen || !policy?.id) return;
    loadReport();
  }, [isOpen, policy?.id]);

  async function loadReport() {
    setLoading(true);
    setError(null);
    try {
      const res = await getPolicyAcknowledgementsRequest(policy.id);
      if (res.ok) {
        setReportData(res.data.data);
      } else {
        setError(res.data?.message || 'Failed to load policy acknowledgement report.');
      }
    } catch (err) {
      setError('A network error occurred while loading the report.');
    } finally {
      setLoading(false);
    }
  }

  const employeeRecords = useMemo(() => {
    return reportData?.acknowledgements || reportData?.employees || [];
  }, [reportData]);

  const filteredEmployees = useMemo(() => {
    return employeeRecords.filter((emp) => {
      const matchesSearch =
        search === '' ||
        (emp.name && emp.name.toLowerCase().includes(search.toLowerCase())) ||
        (emp.email && emp.email.toLowerCase().includes(search.toLowerCase())) ||
        (emp.department && emp.department.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACKNOWLEDGED' && emp.acknowledged) ||
        (statusFilter === 'PENDING' && !emp.acknowledged);

      return matchesSearch && matchesStatus;
    });
  }, [employeeRecords, search, statusFilter]);

  if (!isOpen || !policy) return null;

  const versionNum =
    reportData?.currentVersion?.versionNumber ??
    reportData?.version?.versionNumber ??
    policy.version ??
    '1.0';

  const ackCount = reportData?.summary?.acknowledged ?? reportData?.summary?.acknowledgedCount ?? 0;
  const pendCount = reportData?.summary?.pending ?? reportData?.summary?.pendingCount ?? 0;
  const totalCount = reportData?.summary?.totalEligible ?? employeeRecords.length;
  const compliancePct = reportData?.summary?.complianceRate ?? (totalCount > 0 ? Math.round((ackCount / totalCount) * 100) : 100);
  const targetScope = reportData?.policy?.targetDepartment || reportData?.summary?.targetDepartment || 'All Employees';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ack-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl p-6 sm:p-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-5 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Compliance Report
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Version {versionNum}
              </span>
            </div>
            <h2 id="ack-modal-title" className="text-xl sm:text-2xl font-bold text-white mt-1">
              Acknowledgements: {policy.title}
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              Auditing employee compliance for current published version.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-5 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-sm">Generating acknowledgement compliance report...</p>
            </div>
          ) : reportData ? (
            <>
              {/* Summary Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Target Scope</div>
                  <div className="text-lg font-bold text-white mt-1">
                    {targetScope}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{totalCount} eligible</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Compliance Rate</div>
                  <div className="text-2xl font-bold text-emerald-400 mt-1">
                    {compliancePct}%
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${compliancePct}%` }}
                    ></div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
                  <div className="text-xs font-medium text-emerald-400 uppercase tracking-wider">Acknowledged</div>
                  <div className="text-2xl font-bold text-emerald-300 mt-1">
                    {ackCount}
                  </div>
                  <div className="text-xs text-emerald-400/80 mt-0.5">signed & confirmed</div>
                </div>

                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20">
                  <div className="text-xs font-medium text-amber-400 uppercase tracking-wider">Pending Action</div>
                  <div className="text-2xl font-bold text-amber-300 mt-1">
                    {pendCount}
                  </div>
                  <div className="text-xs text-amber-400/80 mt-0.5">awaiting acknowledgement</div>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-72">
                  <input
                    type="text"
                    placeholder="Search employee or dept..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-3.5 py-2 pl-9 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                  />
                  <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setStatusFilter('ALL')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      statusFilter === 'ALL'
                        ? 'bg-slate-700 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    All ({employeeRecords.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('ACKNOWLEDGED')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      statusFilter === 'ACKNOWLEDGED'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Acknowledged ({ackCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('PENDING')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      statusFilter === 'PENDING'
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Pending ({pendCount})
                  </button>
                </div>
              </div>

              {/* Employee Acknowledgement Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/50">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-800/80 text-xs uppercase text-slate-400 font-medium tracking-wider">
                    <tr>
                      <th scope="col" className="px-4 py-3">Employee</th>
                      <th scope="col" className="px-4 py-3">Email</th>
                      <th scope="col" className="px-4 py-3">Department</th>
                      <th scope="col" className="px-4 py-3">Status</th>
                      <th scope="col" className="px-4 py-3">Acknowledged At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredEmployees.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-4 py-8 text-center text-slate-500">
                          No employees match the filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredEmployees.map((emp) => (
                        <tr key={emp.userId || emp.id || emp.email} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-4 py-3 font-medium text-white">{emp.name}</td>
                          <td className="px-4 py-3 text-slate-400 text-xs font-mono">{emp.email}</td>
                          <td className="px-4 py-3 text-slate-300">
                            {emp.department ? (
                              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs">
                                {emp.department}
                              </span>
                            ) : (
                              <span className="text-slate-500 text-xs">Unassigned</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {emp.acknowledged ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                Acknowledged
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-400">
                            {emp.acknowledgedAt ? new Date(emp.acknowledgedAt).toLocaleString() : '—'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
          <button
            onClick={loadReport}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5"
            disabled={loading}
          >
            <span>🔄</span> Refresh Report
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
export default AcknowledgementsModal;
