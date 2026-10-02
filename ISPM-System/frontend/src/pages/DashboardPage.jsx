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
    <div className={role === 'SYSTEM_ADMIN' ? 'admin-dashboard-page' : 'space-y-7 sm:space-y-8'}>
      {role === 'SYSTEM_ADMIN' ? (
        <div className="admin-page-header">
          <div><span className="admin-eyebrow">ADMINISTRATION / OVERVIEW</span>
            <h1>Welcome back, {user?.firstName || 'Administrator'}.</h1>
            <p>Here?s what?s happening across your platform.</p>
          </div>
          <div className="admin-header-actions"><span className="admin-header-date">{currentDateFormatted}</span>
            <button type="button" onClick={loadMetrics} disabled={loading} className="admin-refresh"><Icon name="refresh" className="w-4 h-4" />{loading ? 'Refreshing?' : 'Refresh'}</button>
          </div>
        </div>
      ) : (<>
      {/* Page Header / Welcome Area */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span>Enterprise Security Dashboard</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Welcome back,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-white">
              {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : roleLabel}
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400 font-normal leading-relaxed mt-2.5">
            {role === 'SYSTEM_ADMIN' && 'Central command for platform accounts, operational health, and real-time security tracking.'}
            {role === 'COMPLIANCE_OFFICER' && 'Information security policy oversight, compliance tracking, and governance reports.'}
            {role === 'TRAINING_ADMIN' && 'Manage security awareness training modules and assessment quizzes.'}
            {role === 'EMPLOYEE' && 'Your security awareness portal — policies, training, and compliance scorecard.'}
          </p>
        </div>
        <div className="flex items-center gap-2.5 self-start lg:self-auto px-4 py-2 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs sm:text-sm text-slate-300 font-medium shadow-md shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
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

