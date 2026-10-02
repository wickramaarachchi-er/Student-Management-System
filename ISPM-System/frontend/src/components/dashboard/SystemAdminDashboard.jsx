/**
 * components/dashboard/SystemAdminDashboard.jsx
 * Enterprise dashboard view for SYSTEM_ADMIN role displaying live database statistics.
 */
import { Link } from 'react-router-dom';
import Icon from '../common/Icon.jsx';
import StatCard from '../common/StatCard.jsx';
import StatusBadge from '../common/StatusBadge.jsx';

/**
 * Format raw technical audit action strings into human-readable labels.
 */
const formatAuditAction = (action) => {
  if (!action) return 'Security Action';
  const actionMap = {
    LOGIN_SUCCESS: 'Successful Login',
    LOGIN_FAILED: 'Failed Login',
    LOGOUT: 'User Logout',
    USER_CREATED: 'User Created',
    USER_UPDATED: 'User Updated',
    USER_DELETED: 'User Deleted',
    PASSWORD_RESET: 'Password Reset',
    POLICY_CREATED: 'Policy Created',
    POLICY_PUBLISHED: 'Policy Published',
    POLICY_UPDATED: 'Policy Updated',
    POLICY_ACKNOWLEDGED: 'Policy Acknowledged',
    QUIZ_STARTED: 'Quiz Started',
    QUIZ_COMPLETED: 'Quiz Completed',
    TRAINING_STARTED: 'Training Started',
    TRAINING_COMPLETED: 'Training Completed',
    TICKET_CREATED: 'Ticket Created',
    TICKET_UPDATED: 'Ticket Updated',
    TICKET_RESOLVED: 'Ticket Resolved',
  };
  if (actionMap[action]) return actionMap[action];
  return action
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

/**
 * Sanitize descriptions to prevent raw quizId, UUIDs, or technical clutter from dominating.
 */
const cleanAuditDescription = (desc, action) => {
  if (!desc) return 'Security system action recorded';

  // Friendly human-readable summaries for quiz actions
  if (action === 'QUIZ_STARTED') {
    const emailMatch = desc.match(/by\s+([^\s)]+)/i);
    const email = emailMatch ? emailMatch[1] : '';
    return email ? `Quiz attempt started by ${email}` : 'Quiz attempt started';
  }
  if (action === 'QUIZ_COMPLETED') {
    const emailMatch = desc.match(/by\s+([^\s)]+)/i);
    const email = emailMatch ? emailMatch[1] : '';
    return email ? `Quiz attempt completed by ${email}` : 'Quiz attempt completed';
  }

  // General cleanup: remove (quizId: ...), (policyId: ...), raw UUIDs or technical identifiers
  return desc
    .replace(/\s*\([^)]*id:[^)]*\)/gi, '')
    .replace(/\s*\(quizId:[^)]*\)/gi, '')
    .replace(/\s*\(policyId:[^)]*\)/gi, '')
    .replace(/\s*\(userId:[^)]*\)/gi, '')
    .replace(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/gi, '')
    .replace(/\bcm[a-z0-9]{20,}\b/gi, '')
    .trim() || desc;
};

export default function SystemAdminDashboard({ data }) {
  const { metrics, recentHelpdeskTickets = [], recentSystemActivity = [] } = data || {};
  const {
    totalUsers = 0,
    activeUsers = 0,
    inactiveUsers = 0,
    usersByRole = {},
    openHelpdeskTickets = 0,
    inProgressHelpdeskTickets = 0,
    unresolvedHelpdeskCount = 0,
    unreadNotificationCount = 0,
  } = metrics || {};

  const quickActions = [
    {
      label: 'Manage Users',
      path: '/users',
      icon: 'users',
      desc: 'Create and manage employee accounts and access roles.',
    },
    {
      label: 'Helpdesk',
      path: '/helpdesk',
      icon: 'helpdesk',
      desc: 'Triage technical support and security inquiries.',
    },
    {
      label: 'Audit Logs',
      path: '/audit-logs',
      icon: 'shield-check',
      desc: 'Inspect system action history and security logs.',
    },
    {
      label: 'Notifications',
      path: '/notifications',
      icon: 'bell',
      desc: 'View and manage system alerts and advisories.',
    },
  ];

  return (
    <div className="space-y-12">
      {/* 1. Primary Metric Cards */}
      <section aria-label="Key Performance Indicators">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Total Users"
            value={totalUsers}
            subtitle={`${activeUsers} active, ${inactiveUsers} inactive`}
            icon="users"
            iconBg="bg-blue-500/10 text-blue-400 border-blue-500/20"
          />
          <StatCard
            title="Active Users"
            value={activeUsers}
            subtitle={`${Math.round((activeUsers / (totalUsers || 1)) * 100)}% active rate`}
            icon="user-check"
            iconBg="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            trend="Healthy"
            trendType="positive"
          />
          <StatCard
            title="Open Tickets"
            value={unresolvedHelpdeskCount}
            subtitle={`${openHelpdeskTickets} open, ${inProgressHelpdeskTickets} in progress`}
            icon="helpdesk"
            iconBg="bg-amber-500/10 text-amber-400 border-amber-500/20"
            trend={unresolvedHelpdeskCount > 0 ? 'Requires Action' : 'All Clear'}
            trendType={unresolvedHelpdeskCount > 0 ? 'warning' : 'positive'}
          />
          <StatCard
            title="Unread Notifications"
            value={unreadNotificationCount}
            subtitle="System & security alerts"
            icon="bell"
            iconBg="bg-purple-500/10 text-purple-400 border-purple-500/20"
          />
        </div>
      </section>

      {/* 2. Users by Role Section */}
      <section aria-label="Users by Role" className="pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-purple-500 rounded-full shrink-0" />
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Users by Role</h2>
              <p className="text-xs text-slate-400 mt-0.5">Directory allocation across security privilege tiers</p>
            </div>
          </div>
          <Link
            to="/users"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 hover:text-blue-300 text-xs font-semibold border border-blue-500/20 transition-colors w-fit"
          >
            <span>View all users</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* System Admins */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-purple-800/30 hover:border-purple-600/50 shadow-md transition-all flex flex-col justify-between min-h-[130px]">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-purple-300">System Administrators</span>
              <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/30">
                <Icon name="shield" className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-white">{usersByRole.SYSTEM_ADMIN || 0}</span>
              <span className="text-xs text-purple-300/70 font-medium">
                {usersByRole.SYSTEM_ADMIN === 1 ? '1 user' : `${usersByRole.SYSTEM_ADMIN || 0} users`}
              </span>
            </div>
          </div>

          {/* Compliance Officers */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-emerald-800/30 hover:border-emerald-600/50 shadow-md transition-all flex flex-col justify-between min-h-[130px]">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-emerald-300">Compliance Officers</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <Icon name="shield-check" className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-white">{usersByRole.COMPLIANCE_OFFICER || 0}</span>
              <span className="text-xs text-emerald-300/70 font-medium">
                {usersByRole.COMPLIANCE_OFFICER === 1 ? '1 user' : `${usersByRole.COMPLIANCE_OFFICER || 0} users`}
              </span>
            </div>
          </div>

          {/* Training Admins */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-amber-800/30 hover:border-amber-600/50 shadow-md transition-all flex flex-col justify-between min-h-[130px]">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-amber-300">Training Administrators</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                <Icon name="academic-cap" className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-white">{usersByRole.TRAINING_ADMIN || 0}</span>
              <span className="text-xs text-amber-300/70 font-medium">
                {usersByRole.TRAINING_ADMIN === 1 ? '1 user' : `${usersByRole.TRAINING_ADMIN || 0} users`}
              </span>
            </div>
          </div>

          {/* Employees */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-blue-800/30 hover:border-blue-600/50 shadow-md transition-all flex flex-col justify-between min-h-[130px]">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-blue-300">Employees</span>
              <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
                <Icon name="users" className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-white">{usersByRole.EMPLOYEE || 0}</span>
              <span className="text-xs text-blue-300/70 font-medium">
                {usersByRole.EMPLOYEE === 1 ? '1 user' : `${usersByRole.EMPLOYEE || 0} users`}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Main Information Grid: Helpdesk & Audit */}
      <section aria-label="Recent System Activity" className="pt-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1.5 h-6 bg-emerald-500 rounded-full shrink-0" />
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">System & Support Activity</h2>
            <p className="text-xs text-slate-400 mt-0.5">Live helpdesk dispatch queue and real-time security audit events</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
          {/* Recent Helpdesk Activity */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5 pb-3.5 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Icon name="helpdesk" className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white">Recent Helpdesk Activity</h3>
                </div>
                <Link
                  to="/helpdesk"
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                >
                  View Helpdesk
                  <span aria-hidden="true">→</span>
                </Link>
              </div>

              {recentHelpdeskTickets.length === 0 ? (
                <p className="text-sm text-slate-500 py-10 text-center">No recent tickets in queue.</p>
              ) : (
                <div className="space-y-3">
                  {recentHelpdeskTickets.map((t) => (
                    <div
                      key={t.id}
                      className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-sm text-slate-100 truncate">{t.subject}</div>
                        <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                          <span>{t.creator ? `${t.creator.firstName} ${t.creator.lastName || ''}`.trim() : 'User'}</span>
                          <span className="text-slate-600">•</span>
                          <span>
                            {new Date(t.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                      <StatusBadge status={t.status} className="shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Audit Activity */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5 pb-3.5 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Icon name="shield-check" className="w-5 h-5 text-blue-400" />
                  <h3 className="text-base font-bold text-white">Recent Audit Activity</h3>
                </div>
                <Link
                  to="/audit-logs"
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                >
                  View Audit Logs
                  <span aria-hidden="true">→</span>
                </Link>
              </div>

              {recentSystemActivity.length === 0 ? (
                <p className="text-sm text-slate-500 py-10 text-center">No recent audit logs available.</p>
              ) : (
                <div className="space-y-3">
                  {recentSystemActivity.map((log) => (
                    <div
                      key={log.id}
                      className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-sm text-blue-400 truncate">
                          {formatAuditAction(log.action)}
                        </span>
                        <span className="text-xs text-slate-400 shrink-0 font-mono">
                          {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="text-slate-300 text-xs truncate leading-relaxed">
                        {cleanAuditDescription(log.description, log.action)}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono truncate">
                        {log.userEmail || 'System'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Quick Actions */}
      <section aria-label="Quick Actions" className="pt-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1.5 h-6 bg-indigo-500 rounded-full shrink-0" />
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Quick Actions</h2>
            <p className="text-xs text-slate-400 mt-0.5">Administrative shortcuts and governance controls</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {quickActions.map((action, idx) => (
            <Link
              key={idx}
              to={action.path}
              className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800/90 hover:border-blue-500/50 hover:bg-slate-900 transition-all flex flex-col justify-between group shadow-md min-h-[145px]"
            >
              <div>
                <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors mb-3.5">
                  <Icon name={action.icon} className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                  {action.label}
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{action.desc}</p>
              </div>
              <div className="mt-5 flex items-center justify-between text-xs font-semibold text-blue-400">
                <span>Open module</span>
                <span className="group-hover:translate-x-1.5 transition-transform text-sm">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}


