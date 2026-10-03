/**
 * pages/DashboardPage.jsx
 * Role-aware home dashboard fetching and presenting live database metrics.
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { ROLE_LABELS } from '../utils/roles.js';
import { fetchDashboardSummary } from '../services/dashboard.service.js';
import LoadingState from '../components/common/LoadingState.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import SystemAdminDashboard from '../components/dashboard/SystemAdminDashboard.jsx';
import ComplianceOfficerDashboard from '../components/dashboard/ComplianceOfficerDashboard.jsx';
import TrainingAdminDashboard from '../components/dashboard/TrainingAdminDashboard.jsx';
import EmployeeDashboard from '../components/dashboard/EmployeeDashboard.jsx';
import Icon from '../components/common/Icon.jsx';

export default function DashboardPage() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const role = user?.role;
  const roleLabel = (role && ROLE_LABELS[role]) || role || 'User';

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchDashboardSummary();
      setDashboardData(data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const renderRoleDashboard = () => {
    if (!dashboardData) return null;
    switch (role) {
      case 'SYSTEM_ADMIN':
        return <SystemAdminDashboard data={dashboardData} />;
      case 'COMPLIANCE_OFFICER':
        return <ComplianceOfficerDashboard data={dashboardData} />;
      case 'TRAINING_ADMIN':
        return <TrainingAdminDashboard data={dashboardData} />;
      case 'EMPLOYEE':
      default:
        return <EmployeeDashboard data={dashboardData} />;
    }
  };

  return (
    <div className={role === 'EMPLOYEE' ? 'employee-dashboard-page' : role === 'SYSTEM_ADMIN' ? 'admin-dashboard-page' : 'space-y-7 sm:space-y-8'}>
      {role === 'SYSTEM_ADMIN' || role === 'COMPLIANCE_OFFICER' ? (
        <div className="admin-page-header">
          <div><span className="admin-eyebrow">{role === 'SYSTEM_ADMIN' ? 'ADMINISTRATION / OVERVIEW' : role === 'COMPLIANCE_OFFICER' ? 'COMPLIANCE / OVERVIEW' : role === 'TRAINING_ADMIN' ? 'LEARNING / OVERVIEW' : 'MY SECURITY / OVERVIEW'}</span>
            <h1>Welcome back, {user?.firstName || roleLabel}.</h1>
            <p>{role === 'SYSTEM_ADMIN' ? 'Review platform administration and system activity.' : role === 'COMPLIANCE_OFFICER' ? 'Track organization compliance, policy acknowledgements, and audit readiness.' : role === 'TRAINING_ADMIN' ? 'Manage learning content and follow training outcomes across your organization.' : 'Keep up with your security requirements, learning, and progress.'}</p>
          </div>
          <div className="admin-header-actions"><span className="admin-header-date">{currentDateFormatted}</span>
            <button type="button" onClick={loadMetrics} disabled={loading} className="admin-refresh"><Icon name="refresh" className="w-4 h-4" />{loading ? 'Refreshing…' : 'Refresh'}</button>
          </div>
        </div>
      ) : role === 'TRAINING_ADMIN' ? (
        <header className="ta-page-header">
          <div><span className="ta-eyebrow">TRAINING / OVERVIEW</span><h1>Training overview</h1><p>Welcome back, {user?.firstName || 'Administrator'}. Keep your team informed and prepared.</p></div>
          <div className="ta-header-tools"><time dateTime={new Date().toISOString().slice(0, 10)}>{currentDateFormatted}</time><button type="button" onClick={loadMetrics} disabled={loading} className="ta-refresh"><Icon name="refresh" className="w-4 h-4" />{loading ? 'Refreshing…' : 'Refresh'}</button></div>
        </header>
      ) : role === 'EMPLOYEE' ? (
        <header className="employee-page-header">
          <div><span className="employee-header-eyebrow">MY WORKSPACE / OVERVIEW</span><h1>Welcome back, {user?.firstName || 'Employee'}.</h1><p>Your policies, training, and next steps — all in one place.</p></div>
          <div className="employee-header-tools"><span>{currentDateFormatted}</span><button type="button" onClick={loadMetrics} disabled={loading}><Icon name="refresh" className="w-4 h-4" />{loading ? 'Refreshing...' : 'Refresh'}</button></div>
        </header>
      ) : (<>
      {/* Page Header / Welcome Area */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-[#142347]">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-semibold mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span>Enterprise Security Dashboard</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-black text-white tracking-tight leading-none">
            Welcome back, {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : roleLabel}
          </h1>
          <p className="text-sm sm:text-base text-slate-400 font-normal leading-relaxed mt-3">
            {role === 'SYSTEM_ADMIN' && 'Manage users, support requests, and review system-wide security activity.'}
            {role === 'COMPLIANCE_OFFICER' && 'Information security policy oversight, compliance tracking, and reports.'}
            {role === 'TRAINING_ADMIN' && 'Manage security awareness training modules and assessment quizzes.'}
            {role === 'EMPLOYEE' && 'Your security awareness portal — policies, training, and compliance scorecard.'}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start lg:self-auto px-4 py-2 rounded-full bg-[#060e22] border border-[#142347] text-xs sm:text-sm text-slate-300 font-medium shadow-sm shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
          <span>{currentDateFormatted}</span>
        </div>
      </div>

      </>)}

      {/* Loading State */}
      {loading && <LoadingState message="Retrieving live dashboard metrics…" rows={4} />}

      {/* Error State */}
      {!loading && error && (
        <ErrorState
          title="Dashboard Load Failed"
          message={error}
          onRetry={loadMetrics}
        />
      )}

      {/* Dashboard Role Component */}
      {!loading && !error && renderRoleDashboard()}
    </div>
  );
}

