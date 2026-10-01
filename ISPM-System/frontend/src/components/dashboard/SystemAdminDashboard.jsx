/**
 * components/dashboard/SystemAdminDashboard.jsx
 * Dashboard view for SYSTEM_ADMIN role displaying real database statistics.
 */
import { Link } from 'react-router-dom';
import Icon from '../common/Icon.jsx';
import StatCard from '../common/StatCard.jsx';
import StatusBadge from '../common/StatusBadge.jsx';

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
    { label: 'Manage Users', path: '/users', icon: 'users', desc: 'Create and update employee accounts and access roles' },
    { label: 'Helpdesk Queue', path: '/helpdesk', icon: 'helpdesk', desc: 'Triage technical support and security inquiries' },
    { label: 'Audit Logs', path: '/audit-logs', icon: 'shield-check', desc: 'Inspect system action history and security logs' },
    { label: 'Notifications', path: '/notifications', icon: 'bell', desc: 'View and manage system alerts and advisories' },
  ];

  return (
    <div className="space-y-6">
      {/* Primary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Accounts"
          value={totalUsers}
          subtitle={`${activeUsers} active, ${inactiveUsers} inactive`}
          icon="users"
          iconBg="bg-blue-500/10 text-blue-400 border-blue-500/20"
        />
        <StatCard
          title="Active Accounts"
          value={activeUsers}
          subtitle={`${Math.round((activeUsers / (totalUsers || 1)) * 100)}% active rate`}
          icon="user-check"
          iconBg="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          trend="Healthy"
          trendType="positive"
        />
        <StatCard
          title="Unresolved Tickets"
          value={unresolvedHelpdeskCount}
          subtitle={`${openHelpdeskTickets} open, ${inProgressHelpdeskTickets} in-progress`}
          icon="helpdesk"
          iconBg="bg-amber-500/10 text-amber-400 border-amber-500/20"
          trend={unresolvedHelpdeskCount > 0 ? 'Requires Action' : 'All Clear'}
          trendType={unresolvedHelpdeskCount > 0 ? 'warning' : 'positive'}
        />
        <StatCard
          title="Unread Alerts"
          value={unreadNotificationCount}
          subtitle="System & security notifications"
          icon="bell"
          iconBg="bg-purple-500/10 text-purple-400 border-purple-500/20"
        />
      </div>

      {/* Users Breakdown by Role */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-4 pb-2 border-b border-slate-800 flex items-center justify-between">
          <span>User Directory Role Allocation</span>
          <Link to="/users" className="text-xs font-semibold text-blue-400 hover:text-blue-300">
            View All Users →
          </Link>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-purple-800/40 text-center">
            <span className="text-xs text-purple-300 font-semibold block mb-1">System Administrators</span>
            <span className="text-2xl font-extrabold text-purple-300">{usersByRole.SYSTEM_ADMIN || 0}</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/70 border border-emerald-800/40 text-center">
            <span className="text-xs text-emerald-300 font-semibold block mb-1">Compliance Officers</span>
            <span className="text-2xl font-extrabold text-emerald-300">{usersByRole.COMPLIANCE_OFFICER || 0}</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/70 border border-amber-800/40 text-center">
            <span className="text-xs text-amber-300 font-semibold block mb-1">Training Administrators</span>
            <span className="text-2xl font-extrabold text-amber-300">{usersByRole.TRAINING_ADMIN || 0}</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/70 border border-blue-800/40 text-center">
            <span className="text-xs text-blue-300 font-semibold block mb-1">Employees</span>
            <span className="text-2xl font-extrabold text-blue-300">{usersByRole.EMPLOYEE || 0}</span>
          </div>
        </div>
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Helpdesk Queue */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Helpdesk Queue Activity</h2>
            <Link to="/helpdesk" className="text-xs text-blue-400 hover:text-blue-300 font-semibold">
              Open Queue →
            </Link>
          </div>
          {recentHelpdeskTickets.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No recent tickets in queue.</p>
          ) : (
            <div className="space-y-3">
              {recentHelpdeskTickets.map((t) => (
                <div key={t.id} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-slate-100 truncate">{t.subject}</div>
                    <div className="text-slate-400 mt-0.5 text-[11px]">
                      By {t.creator ? `${t.creator.firstName} ${t.creator.lastName}` : 'Unknown'} • {new Date(t.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <StatusBadge status={t.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Audit Log Activity */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Recent System Audit Events</h2>
            <Link to="/audit-logs" className="text-xs text-blue-400 hover:text-blue-300 font-semibold">
              Full Logs →
            </Link>
          </div>
          {recentSystemActivity.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No recent audit logs available.</p>
          ) : (
            <div className="space-y-3">
              {recentSystemActivity.map((log) => (
                <div key={log.id} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-blue-400 font-semibold truncate">{log.action}</span>
                    <span className="text-[10px] text-slate-500 shrink-0">{new Date(log.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-slate-300 truncate">{log.description || 'Security system action'}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{log.userEmail || 'System'}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-4 pb-2 border-b border-slate-800">
          Administrative Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, idx) => (
            <Link
              key={idx}
              to={action.path}
              className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-blue-500/50 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Icon name={action.icon} className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                    {action.label}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{action.desc}</p>
              </div>
              <span className="text-xs text-blue-400 font-semibold mt-4 block">Launch →</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
