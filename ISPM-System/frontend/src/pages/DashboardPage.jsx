/**
 * pages/DashboardPage.jsx
 * Role-aware home dashboard fetching and presenting live database metrics.
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { ROLE_LABELS, ROLE_BADGE_STYLES } from '../utils/roles.js';
import { fetchDashboardSummary } from '../services/dashboard.service.js';
import Icon from '../components/common/Icon.jsx';
import LoadingState from '../components/common/LoadingState.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import SystemAdminDashboard from '../components/dashboard/SystemAdminDashboard.jsx';
import ComplianceOfficerDashboard from '../components/dashboard/ComplianceOfficerDashboard.jsx';
import TrainingAdminDashboard from '../components/dashboard/TrainingAdminDashboard.jsx';
import EmployeeDashboard from '../components/dashboard/EmployeeDashboard.jsx';

export default function DashboardPage() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const role = user?.role;
  const roleLabel = (role && ROLE_LABELS[role]) || role || 'User';
  const roleBadge = (role && ROLE_BADGE_STYLES[role]) || 'bg-slate-800 text-slate-300 border-slate-700';

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
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-7 relative overflow-hidden shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className={`text-xs px-2.5 py-1 rounded-lg border font-bold inline-flex items-center gap-1.5 ${roleBadge}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
                {roleLabel}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Session Active
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-100 tracking-tight leading-snug">
              Welcome back, {user?.firstName} {user?.lastName}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              {role === 'SYSTEM_ADMIN' && 'System administration, user access management, helpdesk dispatch, and security event monitoring.'}
              {role === 'COMPLIANCE_OFFICER' && 'Information security policy oversight, compliance tracking, departmental auditing, and regulatory reporting.'}
              {role === 'TRAINING_ADMIN' && 'Cyber awareness training modules, knowledge assessment quizzes, and learner milestone tracking.'}
              {role === 'EMPLOYEE' && 'Your personal security awareness portal — policies, training, assessments, and your compliance scorecard.'}
            </p>
          </div>

          {/* Account Summary Card */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 shrink-0 text-sm space-y-2.5 md:w-64">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Account Details</div>
            <div className="text-xs text-slate-300">
              <span className="text-slate-500">Email: </span>
              <span className="font-mono text-slate-200">{user?.email}</span>
            </div>
            <div className="text-xs text-slate-300">
              <span className="text-slate-500">Department: </span>
              <span className="text-slate-200">{user?.department || 'General'}</span>
            </div>
            {user?.phone && (
              <div className="text-xs text-slate-300">
                <span className="text-slate-500">Phone: </span>
                <span className="text-slate-200">{user.phone}</span>
              </div>
            )}
            <div className="text-xs flex items-center gap-2 pt-1.5 border-t border-slate-800/80">
              <Icon name="shield-check" className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Session Authenticated</span>
            </div>
          </div>
        </div>
      </div>

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
