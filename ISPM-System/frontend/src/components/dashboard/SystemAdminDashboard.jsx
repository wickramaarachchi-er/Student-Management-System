/**
 * components/dashboard/SystemAdminDashboard.jsx
 * Dashboard view for SYSTEM_ADMIN role displaying real database statistics.
 */
import { Link } from 'react-router-dom';
import Icon from '../common/Icon.jsx';

export default function SystemAdminDashboard({ data }) {
  const { metrics, recentHelpdeskTickets = [], recentSystemActivity = [] } = data;
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

  const statCards = [
    {
      label: 'Total Users',
      value: totalUsers,
      detail: `${activeUsers} active, ${inactiveUsers} inactive`,
      icon: 'users',
      color: 'border-blue-800 text-blue-400',
    },
    {
      label: 'Active Users',
      value: activeUsers,
      detail: `${Math.round((activeUsers / (totalUsers || 1)) * 100)}% of total accounts`,
      icon: 'user-check',
      color: 'border-emerald-800 text-emerald-400',
    },
    {
      label: 'Unresolved Tickets',
      value: unresolvedHelpdeskCount,
      detail: `${openHelpdeskTickets} open, ${inProgressHelpdeskTickets} in-progress`,
      icon: 'helpdesk',
      color: 'border-amber-800 text-amber-400',
    },
    {
      label: 'Unread Notifications',
      value: unreadNotificationCount,
      detail: 'Personal system alerts',
      icon: 'bell',
      color: 'border-purple-800 text-purple-400',
    },
  ];

  const quickActions = [
    { label: 'Manage Users', path: '/users', icon: 'users', desc: 'Create and update employee accounts and roles' },
    { label: 'Helpdesk', path: '/helpdesk', icon: 'helpdesk', desc: 'Triage technical support and security inquiries' },
    { label: 'Audit Logs', path: '/audit-logs', icon: 'shield-check', desc: 'Inspect system action history and security logs' },
    { label: 'Notifications', path: '/notifications', icon: 'bell', desc: 'View and manage security advisories' },
  ];

  return (
    <div className="space-y-6">
      {/* Primary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-400">{card.label}</span>
              <div className={`p-2 rounded-lg bg-slate-800 border ${card.color}`}>
                <Icon name={card.icon} className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{card.value}</div>
            <div className="text-xs text-slate-400">{card.detail}</div>
          </div>
        ))}
      </div>

      {/* Users Breakdown by Role */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-sm font-bold text-white mb-4 pb-2 border-b border-slate-800">
          User Directory Breakdown by Role
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 text-center">
            <span className="text-xs text-slate-400 block mb-1">System Admins</span>
            <span className="text-xl font-bold text-purple-400">{usersByRole.SYSTEM_ADMIN || 0}</span>
          </div>
          <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 text-center">
            <span className="text-xs text-slate-400 block mb-1">Compliance Officers</span>
            <span className="text-xl font-bold text-emerald-400">{usersByRole.COMPLIANCE_OFFICER || 0}</span>
          </div>
          <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 text-center">
            <span className="text-xs text-slate-400 block mb-1">Training Admins</span>
            <span className="text-xl font-bold text-amber-400">{usersByRole.TRAINING_ADMIN || 0}</span>
          </div>
          <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 text-center">
            <span className="text-xs text-slate-400 block mb-1">Employees</span>
            <span className="text-xl font-bold text-blue-400">{usersByRole.EMPLOYEE || 0}</span>
          </div>
        </div>
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Helpdesk Tickets */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white">Recent Helpdesk Tickets</h2>
            <Link to="/helpdesk" className="text-xs text-blue-400 hover:text-blue-300 font-medium">
              View all →
            </Link>
          </div>
          {recentHelpdeskTickets.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No recent tickets logged.</p>
          ) : (
            <div className="space-y-3">
              {recentHelpdeskTickets.map((t) => (
                <div key={t.id} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-200">{t.subject}</div>
                    <div className="text-slate-500 mt-0.5">
                      By {t.creator ? `${t.creator.firstName} ${t.creator.lastName}` : 'Unknown'} • {new Date(t.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                    t.status === 'OPEN' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                    t.status === 'IN_PROGRESS' ? 'bg-blue-950 text-blue-400 border border-blue-800' :
                    'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  }`}>
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Audit Activity */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white">Recent System Activity</h2>
            <Link to="/audit-logs" className="text-xs text-blue-400 hover:text-blue-300 font-medium">
              View Audit Logs →
            </Link>
          </div>
          {recentSystemActivity.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No audit activity recorded.</p>
          ) : (
            <div className="space-y-3">
              {recentSystemActivity.map((log) => (
                <div key={log.id} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-blue-400 font-semibold">{log.action}</span>
                    <span className="text-[10px] text-slate-500">{new Date(log.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="text-slate-300 truncate">{log.description || 'System event'}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{log.userEmail || 'System'}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-sm font-bold text-white mb-4 pb-2 border-b border-slate-800">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, idx) => (
            <Link
              key={idx}
              to={action.path}
              className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-blue-800/80 transition-colors flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Icon name={action.icon} className="w-4 h-4 text-blue-400 group-hover:text-blue-300" />
                  <span className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                    {action.label}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{action.desc}</p>
              </div>
              <span className="text-[11px] text-blue-400 font-medium mt-3 block">Access module →</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
