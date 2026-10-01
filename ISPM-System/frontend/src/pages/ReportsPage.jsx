/**
 * pages/ReportsPage.jsx
 * Compliance Officer Report-Oriented View
 * Displays organization compliance summaries, category adherence, search/filter controls,
 * and printable compliance roster with evidence inspection capability.
 */
import { useState, useEffect } from 'react';
import {
  getComplianceDashboardRequest,
  getEmployeeComplianceListRequest,
  getEmployeeComplianceDetailsRequest
} from '../services/compliance.service.js';
import Icon from '../components/common/Icon.jsx';
import EmployeeEvidenceModal from '../components/compliance/EmployeeEvidenceModal.jsx';

export default function ReportsPage() {
  const [summaryData, setSummaryData] = useState(null);
  const [employeesData, setEmployeesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Search
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Evidence Modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [evidenceData, setEvidenceData] = useState(null);
  const [loadingEvidence, setLoadingEvidence] = useState(false);

  const fetchReportData = async () => {
    setLoading(true);
    setError('');
    try {
      const [dashRes, empRes] = await Promise.all([
        getComplianceDashboardRequest(),
        getEmployeeComplianceListRequest({ search, department, status: statusFilter })
      ]);

      if (dashRes.ok && dashRes.data?.success) {
        setSummaryData(dashRes.data.data);
      } else {
        setError(dashRes.data?.message || 'Failed to load report metrics.');
      }

      if (empRes.ok && empRes.data?.success) {
        setEmployeesData(empRes.data.data.employees || []);
      }
    } catch {
      setError('A network error occurred while compiling compliance reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [search, department, statusFilter]);

  const handleOpenEvidence = async (user) => {
    setSelectedUser(user);
    setLoadingEvidence(true);
    try {
      const res = await getEmployeeComplianceDetailsRequest(user.id);
      if (res.ok && res.data?.success) {
        setEvidenceData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching evidence:', err);
    } finally {
      setLoadingEvidence(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const overview = summaryData?.overview || {};
  const categories = summaryData?.categories || {};

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLIANT':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Icon name="check-circle" className="w-3.5 h-3.5 mr-1" />
            COMPLIANT
          </span>
        );
      case 'PARTIALLY_COMPLIANT':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Icon name="alert-circle" className="w-3.5 h-3.5 mr-1" />
            PARTIALLY COMPLIANT
          </span>
        );
      case 'NON_COMPLIANT':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <Icon name="x-circle" className="w-3.5 h-3.5 mr-1" />
            NON-COMPLIANT
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
            <Icon name="minus-circle" className="w-3.5 h-3.5 mr-1" />
            NO REQUIREMENTS
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 print:p-0 print:space-y-4">
      {/* Header & Print Action */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:shadow-none print:border-none print:p-0">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0 print:hidden">
            <Icon name="chart-bar" className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">InfoSec Compliance Executive Report</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive organization compliance audit summary, adherence metrics, and employee roster
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 print:hidden">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center space-x-2"
          >
            <Icon name="printer" className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center text-slate-400 space-y-3 bg-white rounded-2xl border border-slate-100">
          <Icon name="refresh" className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm font-medium">Generating executive compliance report...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-sm text-rose-700">
          {error}
        </div>
      ) : (
        <>
          {/* Executive Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Overall Compliance Rate
              </span>
              <div className="text-3xl font-extrabold text-indigo-600 mt-2">
                {overview.averageCompliancePercentage || 0}%
              </div>
              <p className="text-xs text-slate-400 mt-1">Average across active personnel</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                Fully Compliant
              </span>
              <div className="text-3xl font-extrabold text-emerald-700 mt-2">
                {overview.fullyCompliantEmployees || 0}
              </div>
              <p className="text-xs text-emerald-600 mt-1">
                out of {overview.totalActiveEmployees || 0} active employees
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
              <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                Partially Compliant
              </span>
              <div className="text-3xl font-extrabold text-amber-700 mt-2">
                {overview.partiallyCompliantEmployees || 0}
              </div>
              <p className="text-xs text-amber-600 mt-1">Pending items exist</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
              <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">
                Non-Compliant
              </span>
              <div className="text-3xl font-extrabold text-rose-700 mt-2">
                {overview.nonCompliantEmployees || 0}
              </div>
              <p className="text-xs text-rose-600 mt-1">0% requirement progress</p>
            </div>
          </div>

          {/* Category Adherence Breakdown */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Category Compliance Breakdown
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Policy Category */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Policies</span>
                  <span className="text-base font-extrabold text-indigo-600">
                    {categories.policy?.percentage || 0}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full transition-all duration-500"
                    style={{ width: `${categories.policy?.percentage || 0}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 mt-3">
                  <span>Completed: <b>{categories.policy?.completed || 0}</b></span>
                  <span>Outstanding: <b>{categories.policy?.outstanding || 0}</b></span>
                  <span>Total: <b>{categories.policy?.applicableRequirements || 0}</b></span>
                </div>
              </div>

              {/* Training Category */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Training Modules</span>
                  <span className="text-base font-extrabold text-indigo-600">
                    {categories.training?.percentage || 0}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full transition-all duration-500"
                    style={{ width: `${categories.training?.percentage || 0}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 mt-3">
                  <span>Completed: <b>{categories.training?.completed || 0}</b></span>
                  <span>Outstanding: <b>{categories.training?.outstanding || 0}</b></span>
                  <span>Total: <b>{categories.training?.applicableRequirements || 0}</b></span>
                </div>
              </div>

              {/* Quiz Category */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Knowledge Assessments</span>
                  <span className="text-base font-extrabold text-indigo-600">
                    {categories.quiz?.percentage || 0}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full transition-all duration-500"
                    style={{ width: `${categories.quiz?.percentage || 0}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 mt-3">
                  <span>Passed: <b>{categories.quiz?.passed || 0}</b></span>
                  <span>Outstanding: <b>{categories.quiz?.outstanding || 0}</b></span>
                  <span>Total: <b>{categories.quiz?.applicableRequirements || 0}</b></span>
                </div>
              </div>
            </div>
          </div>

          {/* Roster & Filter Controls */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden print:border-none print:shadow-none">
            <div className="px-6 py-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
              <h2 className="text-sm font-bold text-slate-800">
                Detailed Employee Compliance Roster
              </h2>

              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  placeholder="Search name/email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:outline-none w-48"
                />

                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">All Departments</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Administration">Administration</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value="">All Statuses</option>
                  <option value="COMPLIANT">Compliant</option>
                  <option value="PARTIALLY_COMPLIANT">Partially Compliant</option>
                  <option value="NON_COMPLIANT">Non-Compliant</option>
                  <option value="NO_REQUIREMENTS">No Requirements</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-6">Employee</th>
                    <th className="py-3 px-6">Department</th>
                    <th className="py-3 px-6 text-center">Progress (Comp / Total)</th>
                    <th className="py-3 px-6 text-center">Compliance Rate</th>
                    <th className="py-3 px-6 text-center">Status</th>
                    <th className="py-3 px-6 text-right print:hidden">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {employeesData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No employee records found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    employeesData.map((emp) => (
                      <tr key={emp.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-800">
                            {emp.firstName} {emp.lastName}
                          </div>
                          <div className="text-[11px] text-slate-400">{emp.email}</div>
                        </td>
                        <td className="py-4 px-6 text-slate-600 font-medium">
                          {emp.department || 'General'}
                        </td>
                        <td className="py-4 px-6 text-center font-semibold text-slate-700">
                          {emp.completedRequirements} / {emp.totalRequirements}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="font-bold text-slate-800">
                            {emp.compliancePercentage}%
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          {getStatusBadge(emp.complianceStatus)}
                        </td>
                        <td className="py-4 px-6 text-right print:hidden">
                          <button
                            onClick={() => handleOpenEvidence(emp)}
                            className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition-all inline-flex items-center space-x-1"
                          >
                            <Icon name="eye" className="w-3.5 h-3.5" />
                            <span>Evidence</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Evidence Inspection Modal */}
      <EmployeeEvidenceModal
        isOpen={!!selectedUser}
        onClose={() => {
          setSelectedUser(null);
          setEvidenceData(null);
        }}
        evidenceData={evidenceData}
        loading={loadingEvidence}
      />
    </div>
  );
}
