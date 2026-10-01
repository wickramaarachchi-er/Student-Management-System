/**
 * pages/ComplianceDashboardPage.jsx
 * Compliance Officer page — organization compliance monitoring.
 */
import { useState, useEffect, useCallback } from 'react';
import {
  getComplianceDashboardRequest,
  getEmployeeComplianceListRequest,
} from '../services/compliance.service.js';
import Icon from '../components/common/Icon.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import StatCard from '../components/common/StatCard.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import LoadingState from '../components/common/LoadingState.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import EmployeeEvidenceModal from '../components/compliance/EmployeeEvidenceModal.jsx';

const INPUT_CLASS = 'px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30';

export default function ComplianceDashboardPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUserId, setSelectedUserId] = useState(null);

  const fetchDashboardAndEmployees = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [dashRes, empRes] = await Promise.all([
        getComplianceDashboardRequest(),
        getEmployeeComplianceListRequest({ search: searchTerm, department: departmentFilter, status: statusFilter }),
      ]);

      if (dashRes.ok && dashRes.data?.success) {
        setDashboardData(dashRes.data.data);
      } else {
        setError(dashRes.data?.message || 'Failed to load compliance dashboard metrics.');
      }

      if (empRes.ok && empRes.data?.success) {
        setEmployees(empRes.data.data.employees || []);
      }
    } catch {
      setError('A network error occurred while loading compliance data.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, departmentFilter, statusFilter]);

  useEffect(() => {
    fetchDashboardAndEmployees();
  }, [fetchDashboardAndEmployees]);

  const summary = dashboardData?.summary || {
    totalEmployees: 0,
    fullyCompliantCount: 0,
    partiallyCompliantCount: 0,
    nonCompliantCount: 0,
    noRequirementsCount: 0,
    averageCompliancePercentage: 0,
  };

  const category = dashboardData?.categorySummaries || {
    policy: { percentage: 0, completed: 0, totalRequirements: 0 },
    training: { percentage: 0, completed: 0, totalRequirements: 0 },
    quiz: { percentage: 0, completed: 0, totalRequirements: 0 },
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Organization Compliance Dashboard"
        description="Monitor employee information-security compliance derived from live policy acknowledgements, training completions, and quiz scores."
        icon="award"
        action={
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-right shrink-0">
            <div className="text-2xl font-extrabold text-slate-100">{summary.averageCompliancePercentage}%</div>
            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Org Compliance Rate</div>
          </div>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <StatCard title="Monitored Employees" value={summary.totalEmployees} icon="users" />
        <StatCard title="Fully Compliant" value={summary.fullyCompliantCount} icon="shield-check"
          iconBg="bg-emerald-500/10 text-emerald-400 border-emerald-500/20" trend="100%" trendType="positive" />
        <StatCard title="Partially Compliant" value={summary.partiallyCompliantCount} icon="trending-up"
          iconBg="bg-amber-500/10 text-amber-400 border-amber-500/20" trend="1–99%" trendType="warning" />
        <StatCard title="Non-Compliant" value={summary.nonCompliantCount} icon="close"
          iconBg="bg-rose-500/10 text-rose-400 border-rose-500/20" trend="0%" trendType="negative" />
        <StatCard title="No Requirements" value={summary.noRequirementsCount} icon="users"
          iconBg="bg-slate-700/60 text-slate-300 border-slate-700/50" />
      </div>

      {/* Category Progress */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-4 pb-2 border-b border-slate-800">
          Compliance Progress by Requirement Pillar
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Policy Acknowledgements', key: 'policy', color: 'bg-blue-500' },
            { label: 'Training Completion', key: 'training', color: 'bg-indigo-500' },
            { label: 'Knowledge Assessments', key: 'quiz', color: 'bg-emerald-500' },
          ].map(({ label, key, color }) => (
            <div key={key} className="space-y-2.5">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-bold text-slate-200">{label}</span>
                <span className="text-sm font-extrabold text-slate-100">{category[key]?.percentage || 0}%</span>
              </div>
              <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${color} rounded-full transition-all duration-500`}
                  style={{ width: `${category[key]?.percentage || 0}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                {category[key]?.completed || 0} of {category[key]?.totalRequirements || 0} requirements met
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-sm">
        <div className="relative flex-1">
          <Icon name="search" className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search employees by name, email, or department..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Dept:</label>
            <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} className={INPUT_CLASS}>
              <option value="all">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Cybersecurity">Cybersecurity</option>
              <option value="Finance">Finance</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Status:</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={INPUT_CLASS}>
              <option value="all">All Statuses</option>
              <option value="COMPLIANT">Compliant</option>
              <option value="PARTIALLY_COMPLIANT">Partially Compliant</option>
              <option value="NON_COMPLIANT">Non-Compliant</option>
              <option value="NO_REQUIREMENTS">No Requirements</option>
            </select>
          </div>
        </div>
      </div>

      {/* Employee Roster Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-3.5 border-b border-slate-800">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Employee Compliance Roster</h2>
        </div>

        {loading ? (
          <div className="p-6"><LoadingState message="Calculating employee compliance roster…" /></div>
        ) : error ? (
          <div className="p-6"><ErrorState message={error} onRetry={fetchDashboardAndEmployees} /></div>
        ) : employees.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No matching compliance records"
              description="Try adjusting your search term, department filter, or compliance status selection."
              icon="user-check"
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Employee</th>
                  <th className="py-3.5 px-5">Department</th>
                  <th className="py-3.5 px-5">Completed / Total</th>
                  <th className="py-3.5 px-5">Outstanding</th>
                  <th className="py-3.5 px-5">Compliance %</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Evidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-xs">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-5">
                      <div className="font-bold text-slate-100">{emp.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{emp.email}</div>
                    </td>
                    <td className="py-4 px-5 text-slate-300 font-medium">{emp.department || 'General'}</td>
                    <td className="py-4 px-5 font-bold text-slate-200">
                      {emp.completedRequirements} / {emp.totalRequirements}
                    </td>
                    <td className="py-4 px-5">
                      {emp.outstandingRequirements > 0 ? (
                        <span className="font-bold text-amber-400">
                          {emp.outstandingRequirements} pending
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-semibold">None</span>
                      )}
                    </td>
                    <td className="py-4 px-5">
                      <span className="font-extrabold text-sm text-slate-100">{emp.compliancePercentage}%</span>
                    </td>
                    <td className="py-4 px-5">
                      <StatusBadge status={emp.complianceStatus} />
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={() => setSelectedUserId(emp.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 hover:border-blue-500 text-xs font-bold transition-all cursor-pointer"
                        title="View Compliance Evidence"
                      >
                        <Icon name="eye" className="w-3.5 h-3.5" />
                        <span>View Evidence</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <EmployeeEvidenceModal
        isOpen={Boolean(selectedUserId)}
        userId={selectedUserId}
        onClose={() => setSelectedUserId(null)}
      />
    </div>
  );
}
