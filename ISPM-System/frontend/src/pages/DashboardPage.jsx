/**
 * pages/DashboardPage.jsx
 * Role-aware home dashboard fetching and presenting live database metrics.
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { ROLE_LABELS, ROLE_BADGE_STYLES } from '../utils/roles.js';
import { fetchDashboardSummary } from '../services/dashboard.service.js';
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
  const roleBadge = (role && ROLE_BADGE_STYLES[role]) || 'bg-slate-800 text-slate-300';

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchDashboardSummary();
      setDashboardData(data);
    } catch (err) {
      console.error('[DashboardPage] Error loading dashboard data:', err);
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
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 relative overflow-hidden shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2.5 py-1 rounded-md border font-semibold ${roleBadge}`}>
                {roleLabel}
              </span>
              <span className="text-xs text-slate-400 font-medium">Session Active</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight">
              Welcome back, {user?.firstName} {user?.lastName}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              {role === 'SYSTEM_ADMIN' && 'System administration, user access management, helpdesk dispatch, and security logs.'}
              {role === 'COMPLIANCE_OFFICER' && 'Information security policy oversight, compliance tracking, and audit reporting.'}
              {role === 'TRAINING_ADMIN' && 'Cyber awareness training modules, quizzes, and learner milestone tracking.'}
              {role === 'EMPLOYEE' && 'Your security awareness dashboard, policy acknowledgements, courses, and quizzes.'}
            </p>
          </div>

          {/* User Profile Card */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-4 flex-shrink-0 text-sm space-y-2 md:w-64">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Account Details</div>
            <div className="text-xs text-slate-300">
              <span className="text-slate-500">Email:</span> <span className="font-mono text-slate-200">{user?.email}</span>
            </div>
            <div className="text-xs text-slate-300">
              <span className="text-slate-500">Dept:</span> <span className="text-slate-200">{user?.department || 'General'}</span>
            </div>
            {user?.phone && (
              <div className="text-xs text-slate-300">
                <span className="text-slate-500">Phone:</span> <span className="text-slate-200">{user.phone}</span>
              </div>
            )}
            <div className="text-xs text-slate-300 flex items-center gap-1.5 pt-1 border-t border-slate-800/80">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              <span className="text-emerald-400 font-medium">Authentication Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center space-y-3">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
          <p className="text-sm text-slate-400 font-medium">Retrieving real-time dashboard metrics from database...</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="bg-rose-950/40 border border-rose-800/80 rounded-xl p-6 text-center space-y-3">
          <div className="text-rose-400 font-semibold text-sm">Failed to load dashboard data</div>
          <p className="text-xs text-rose-300/80">{error}</p>
          <button
            onClick={loadMetrics}
            className="px-4 py-2 text-xs font-semibold rounded bg-rose-900 hover:bg-rose-800 text-rose-200 transition-colors"
          >
            Retry Loading Metrics
          </button>
        </div>
      )}

      {/* Dashboard Role Component */}
      {!loading && !error && renderRoleDashboard()}
    </div>
  );
}
