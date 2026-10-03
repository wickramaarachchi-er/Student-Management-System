/**
 * pages/ReportsPage.jsx
 * Executive compliance report view for COMPLIANCE_OFFICER.
 */
import { useState, useEffect } from 'react';
import {
  getComplianceDashboardRequest,
  getEmployeeComplianceListRequest,
  getEmployeeComplianceDetailsRequest
} from '../services/compliance.service.js';
import Icon from '../components/common/Icon.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import StatCard from '../components/common/StatCard.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import LoadingState from '../components/common/LoadingState.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import EmployeeEvidenceModal from '../components/compliance/EmployeeEvidenceModal.jsx';
import './ReportsPage.css';

const INPUT_CLASS = 'px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-blue-500';

export default function ReportsPage() {
  const [summaryData, setSummaryData] = useState(null);
  const [employeesData, setEmployeesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
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
      if (dashRes.ok && dashRes.data?.success) setSummaryData(dashRes.data.data);
      else setError(dashRes.data?.message || 'Failed to load report metrics.');
      if (empRes.ok && empRes.data?.success) setEmployeesData(empRes.data.data.employees || []);
    } catch {
      setError('A network error occurred while compiling compliance reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReportData(); }, [search, department, statusFilter]);

  const handleOpenEvidence = async (user) => {
    setSelectedUser(user);
    setLoadingEvidence(true);
    try {
      const res = await getEmployeeComplianceDetailsRequest(user.id);
      if (res.ok && res.data?.success) setEvidenceData(res.data.data);
    } catch {
      // silently fail
    } finally {
      setLoadingEvidence(false);
    }
  };

  const overview = summaryData?.overview || {};
  const categories = summaryData?.categories || {};

  return (
    <div className="exec-report space-y-6">
      <PageHeader
        title="InfoSec Compliance Executive Report"
        description="Comprehensive organization compliance audit summary, adherence metrics, and complete employee roster."
        icon="chart"
        action={
          <button
            onClick={() => window.print()}
            className="exec-print inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors border border-slate-700 cursor-pointer print:hidden"
          >
            <Icon name="eye" className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        }
      />

      {loading ? (
        <LoadingState message="Generating executive compliance report…" rows={5} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchReportData} />
      ) : (
        <>
          {/* Executive Summary KPIs */}
          <div className="exec-kpis grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Overall Compliance Rate"
              value={`${overview.averageCompliancePercentage || 0}%`}
              subtitle="Average across active personnel"
              icon="award"
              iconBg="bg-blue-500/10 text-blue-400 border-blue-500/20"
            />
            <StatCard
              title="Fully Compliant"
              value={overview.fullyCompliantEmployees || 0}
              subtitle={`of ${overview.totalActiveEmployees || 0} active employees`}
              icon="shield-check"
              iconBg="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              trend="100%" trendType="positive"
            />
            <StatCard
              title="Partially Compliant"
              value={overview.partiallyCompliantEmployees || 0}
              subtitle="Pending action items exist"
              icon="trending-up"
              iconBg="bg-amber-500/10 text-amber-400 border-amber-500/20"
              trend="1–99%" trendType="warning"
            />
            <StatCard
              title="Non-Compliant"
              value={overview.nonCompliantEmployees || 0}
              subtitle="0% requirement progress"
              icon="close"
              iconBg="bg-rose-500/10 text-rose-400 border-rose-500/20"
              trend="Critical" trendType="negative"
            />
          </div>

          {/* Category Progress Breakdown */}
          <div className="exec-categories bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-4 pb-2 border-b border-slate-800">
              Compliance Adherence by Requirement Category
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Policy Acknowledgements', key: 'policy', color: 'bg-blue-500', completedKey: 'completed', outstandingKey: 'outstanding' },
                { label: 'Training Modules', key: 'training', color: 'bg-indigo-500', completedKey: 'completed', outstandingKey: 'outstanding' },
                { label: 'Knowledge Assessments', key: 'quiz', color: 'bg-emerald-500', completedKey: 'passed', outstandingKey: 'outstanding' },
              ].map(({ label, key, color, completedKey, outstandingKey }) => (
                <div key={key} className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">{label}</span>
                    <span className="text-sm font-extrabold text-slate-100">{categories[key]?.percentage || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div className={`${color} h-full rounded-full transition-all duration-500`}
                      style={{ width: `${categories[key]?.percentage || 0}%` }} />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                    <span>Completed: <b className="text-slate-200">{categories[key]?.[completedKey] || 0}</b></span>
                    <span>Outstanding: <b className="text-amber-400">{categories[key]?.[outstandingKey] || 0}</b></span>
                    <span>Total: <b className="text-slate-200">{categories[key]?.applicableRequirements || 0}</b></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Roster Table */}
          <div className="exec-roster bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="exec-roster-heading px-6 py-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Detailed Employee Compliance Roster</h2>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  placeholder="Search name / email…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl border border-slate-800 bg-slate-950 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 w-44"
                />
                <select value={department} onChange={(e) => setDepartment(e.target.value)} className={INPUT_CLASS}>
                  <option value="">All Departments</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Administration">Administration</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                </select>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={INPUT_CLASS}>
                  <option value="">All Statuses</option>
                  <option value="COMPLIANT">Compliant</option>
                  <option value="PARTIALLY_COMPLIANT">Partially Compliant</option>
                  <option value="NON_COMPLIANT">Non-Compliant</option>
                  <option value="NO_REQUIREMENTS">No Requirements</option>
                </select>
              </div>
            </div>

            <div className="exec-table-scroll overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-5">Employee</th>
                    <th className="py-3.5 px-5">Department</th>
                    <th className="py-3.5 px-5 text-center">Completed / Total</th>
                    <th className="py-3.5 px-5 text-center">Rate</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5 text-right print:hidden">Evidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 text-xs">
                  {employeesData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10">
                        <EmptyState title="No employee records found" description="Try adjusting your search or filter criteria." icon="user-check" />
                      </td>
                    </tr>
                  ) : (
                    employeesData.map((emp) => (
                      <tr key={emp.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-4 px-5">
                          <div className="font-bold text-slate-100">{emp.firstName} {emp.lastName}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{emp.email}</div>
                        </td>
                        <td className="py-4 px-5 text-slate-300 font-medium">{emp.department || 'General'}</td>
                        <td className="py-4 px-5 text-center font-bold text-slate-100">
                          {emp.completedRequirements} / {emp.totalRequirements}
                        </td>
                        <td className="py-4 px-5 text-center">
                          <span className="font-extrabold text-slate-100">{emp.compliancePercentage}%</span>
                        </td>
                        <td className="py-4 px-5">
                          <StatusBadge status={emp.complianceStatus} />
                        </td>
                        <td className="py-4 px-5 text-right print:hidden">
                          <button
                            onClick={() => handleOpenEvidence(emp)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 hover:border-blue-500 text-xs font-bold transition-all cursor-pointer"
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

      <EmployeeEvidenceModal
        isOpen={!!selectedUser}
        onClose={() => { setSelectedUser(null); setEvidenceData(null); }}
        evidenceData={evidenceData}
        loading={loadingEvidence}
      />
    </div>
  );
}
