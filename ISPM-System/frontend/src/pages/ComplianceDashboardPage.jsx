/**
 * pages/ComplianceDashboardPage.jsx
 * Compliance Administrator Dashboard page for COMPLIANCE_OFFICER.
 * Displays overall organization compliance KPI cards, category breakdown progress bars,
 * search & filterable employee compliance roster, and detailed employee evidence inspection.
 */
import { useState, useEffect, useCallback } from 'react';
import {
  getComplianceDashboardRequest,
  getEmployeeComplianceListRequest,
} from '../services/compliance.service.js';
import Icon from '../components/common/Icon.jsx';
import EmployeeEvidenceModal from '../components/compliance/EmployeeEvidenceModal.jsx';

export default function ComplianceDashboardPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Selected Employee for Evidence Inspection Modal
  const [selectedUserId, setSelectedUserId] = useState(null);

  const fetchDashboardAndEmployees = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [dashRes, empRes] = await Promise.all([
        getComplianceDashboardRequest(),
        getEmployeeComplianceListRequest({
          search: searchTerm,
          department: departmentFilter,
          status: statusFilter,
        }),
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

  const getStatusBadge = (status, pct) => {
    switch (status) {
      case 'COMPLIANT':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Icon name="check" className="w-3 h-3 mr-1" />
            COMPLIANT (100%)
          </span>
        );
      case 'PARTIALLY_COMPLIANT':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
            PARTIALLY COMPLIANT ({pct}%)
          </span>
        );
      case 'NON_COMPLIANT':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <Icon name="close" className="w-3 h-3 mr-1" />
            NON-COMPLIANT (0%)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            NO REQUIREMENTS
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
            <Icon name="award" className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Organization Compliance Dashboard</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Monitor employee information-security compliance derived from live policy acknowledgements, training completions, and quiz scores
            </p>
          </div>
        </div>

        {/* Overall Org Average Metric */}
        <div className="flex items-center space-x-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200/80 self-start sm:self-auto">
          <div className="text-right">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Org Compliance Rate
            </div>
            <div className="text-lg font-bold text-slate-800">
              {summary.averageCompliancePercentage}%
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
            ✓
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Active Employees
          </p>
          <div className="text-2xl font-bold text-slate-800 mt-2">
            {summary.totalEmployees}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
            Fully Compliant
          </p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-emerald-800">
              {summary.fullyCompliantCount}
            </span>
            <span className="text-xs text-emerald-600 font-medium">100%</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
            Partially Compliant
          </p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-amber-800">
              {summary.partiallyCompliantCount}
            </span>
            <span className="text-xs text-amber-600 font-medium">1-99%</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <p className="text-xs font-semibold text-rose-700 uppercase tracking-wider">
            Non-Compliant
          </p>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-rose-800">
              {summary.nonCompliantCount}
            </span>
            <span className="text-xs text-rose-600 font-medium">0%</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs col-span-2 sm:col-span-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            No Requirements
          </p>
          <div className="text-2xl font-bold text-slate-700 mt-2">
            {summary.noRequirementsCount}
          </div>
        </div>
      </div>

      {/* Category Progress Bars */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-800">Category Compliance Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Policy Compliance */}
          <div className="space-y-2">
            <div className="flex justify-between items-baseline text-xs font-bold text-slate-700">
              <span>Policy Acknowledgements</span>
              <span>{category.policy.percentage}%</span>
            </div>
            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${category.policy.percentage}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              {category.policy.completed} of {category.policy.totalRequirements} current version acknowledgements
            </p>
          </div>

          {/* Training Compliance */}
          <div className="space-y-2">
            <div className="flex justify-between items-baseline text-xs font-bold text-slate-700">
              <span>Training Completion</span>
              <span>{category.training.percentage}%</span>
            </div>
            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${category.training.percentage}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              {category.training.completed} of {category.training.totalRequirements} training modules completed
            </p>
          </div>

          {/* Quiz Compliance */}
          <div className="space-y-2">
            <div className="flex justify-between items-baseline text-xs font-bold text-slate-700">
              <span>Knowledge Assessments</span>
              <span>{category.quiz.percentage}%</span>
            </div>
            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${category.quiz.percentage}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              {category.quiz.completed} of {category.quiz.totalRequirements} quizzes passed
            </p>
          </div>
        </div>
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
            placeholder="Search employees by name, email, or department..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        <div className="flex items-center space-x-3 flex-wrap">
          <div className="flex items-center space-x-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Dept:
            </label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option value="all">All Depts</option>
              <option value="Engineering">Engineering</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Cybersecurity">Cybersecurity</option>
              <option value="Finance">Finance</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Status:
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
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
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-400 space-y-3">
            <Icon name="refresh" className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-sm font-medium">Calculating employee compliance roster...</p>
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
              {error}
            </div>
          </div>
        ) : employees.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto mb-3">
              <Icon name="user-check" className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-700">No matching employee compliance records found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your search term, department filter, or compliance status selection.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Employee</th>
                  <th className="py-3.5 px-6">Department</th>
                  <th className="py-3.5 px-6">Completed / Total</th>
                  <th className="py-3.5 px-6">Outstanding</th>
                  <th className="py-3.5 px-6">Compliance %</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-800">
                      <div>{emp.name}</div>
                      <div className="text-[11px] font-normal text-slate-400">{emp.email}</div>
                    </td>

                    <td className="py-4 px-6 text-slate-600 font-medium">
                      {emp.department || 'General'}
                    </td>

                    <td className="py-4 px-6 font-semibold text-slate-700">
                      {emp.completedRequirements} / {emp.totalRequirements}
                    </td>

                    <td className="py-4 px-6">
                      {emp.outstandingRequirements > 0 ? (
                        <span className="font-semibold text-amber-700">
                          {emp.outstandingRequirements} action{emp.outstandingRequirements !== 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-medium">None</span>
                      )}
                    </td>

                    <td className="py-4 px-6">
                      <span className="font-extrabold text-sm text-slate-800">
                        {emp.compliancePercentage}%
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      {getStatusBadge(emp.complianceStatus, emp.compliancePercentage)}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedUserId(emp.id)}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1.5 ml-auto"
                        title="Inspect Employee Compliance Evidence"
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

      {/* Employee Evidence Modal */}
      <EmployeeEvidenceModal
        isOpen={Boolean(selectedUserId)}
        userId={selectedUserId}
        onClose={() => setSelectedUserId(null)}
      />
    </div>
  );
}
