/**
 * components/dashboard/ComplianceOfficerDashboard.jsx
 * Dashboard view for COMPLIANCE_OFFICER role displaying real database compliance statistics.
 */
import { Link } from 'react-router-dom';
import Icon from '../common/Icon.jsx';

export default function ComplianceOfficerDashboard({ data }) {
  const { metrics, recentPolicies = [] } = data;
  const {
    activeEmployees = 0,
    fullyCompliantEmployees = 0,
    partiallyCompliantEmployees = 0,
    nonCompliantEmployees = 0,
    averageCompliancePercentage = 0,
    categorySummaries = {},
    totalPolicies = 0,
    activePublishedPolicies = 0,
    policiesRequiringAcknowledgement = 0,
    unreadNotificationCount = 0,
  } = metrics || {};

  const statCards = [
    {
      label: 'Active Employees',
      value: activeEmployees,
      detail: 'Monitored for compliance',
      icon: 'users',
      color: 'border-blue-800 text-blue-400',
    },
    {
      label: 'Fully Compliant',
      value: fullyCompliantEmployees,
      detail: `${Math.round((fullyCompliantEmployees / (activeEmployees || 1)) * 100)}% compliance rate`,
      icon: 'shield-check',
      color: 'border-emerald-800 text-emerald-400',
    },
    {
      label: 'Average Compliance',
      value: `${averageCompliancePercentage}%`,
      detail: `${partiallyCompliantEmployees} partial, ${nonCompliantEmployees} non-compliant`,
      icon: 'award',
      color: 'border-purple-800 text-purple-400',
    },
    {
      label: 'Published Policies',
      value: activePublishedPolicies,
      detail: `${policiesRequiringAcknowledgement} pending employee acks`,
      icon: 'book',
      color: 'border-amber-800 text-amber-400',
    },
  ];

  const quickActions = [
    { label: 'Compliance Tracking', path: '/compliance', icon: 'award', desc: 'Monitor employee compliance percentages and requirement gaps' },
    { label: 'Reports', path: '/reports', icon: 'chart', desc: 'Generate and export executive compliance summaries' },
    { label: 'Policy Management', path: '/policies', icon: 'book', desc: 'Draft, revise, and publish security policies' },
    { label: 'Audit Logs', path: '/audit-logs', icon: 'shield-check', desc: 'Verify timestamped policy signatures and log history' },
    { label: 'Notifications', path: '/notifications', icon: 'bell', desc: 'Dispatch compliance reminders and advisories' },
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

      {/* Compliance Category Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-sm font-bold text-white mb-4 pb-2 border-b border-slate-800">
          Compliance Progress by Requirement Category
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Policy Compliance</span>
              <span className="text-sm font-bold text-emerald-400">{categorySummaries.policy?.percentage || 0}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all duration-300"
                style={{ width: `${categorySummaries.policy?.percentage || 0}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-500 flex justify-between">
              <span>{categorySummaries.policy?.completed || 0} completed</span>
              <span>{categorySummaries.policy?.totalRequirements || 0} required</span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Training Compliance</span>
              <span className="text-sm font-bold text-blue-400">{categorySummaries.training?.percentage || 0}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-500 h-full transition-all duration-300"
                style={{ width: `${categorySummaries.training?.percentage || 0}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-500 flex justify-between">
              <span>{categorySummaries.training?.completed || 0} completed</span>
              <span>{categorySummaries.training?.totalRequirements || 0} required</span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Quiz Compliance</span>
              <span className="text-sm font-bold text-purple-400">{categorySummaries.quiz?.percentage || 0}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-purple-500 h-full transition-all duration-300"
                style={{ width: `${categorySummaries.quiz?.percentage || 0}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-500 flex justify-between">
              <span>{categorySummaries.quiz?.completed || 0} passed</span>
              <span>{categorySummaries.quiz?.totalRequirements || 0} required</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Policies Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
          <h2 className="text-sm font-bold text-white">Recent Security Policies</h2>
          <Link to="/policies" className="text-xs text-blue-400 hover:text-blue-300 font-medium">
            Manage Policies →
          </Link>
        </div>
        {recentPolicies.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">No security policies found.</p>
        ) : (
          <div className="space-y-3">
            {recentPolicies.map((pol) => (
              <div key={pol.id} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-slate-200">{pol.title}</div>
                  <div className="text-slate-500 mt-0.5">
                    Category: {pol.category} • Target: {pol.targetDepartment || 'All Departments'}
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                  pol.status === 'PUBLISHED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                  pol.status === 'DRAFT' ? 'bg-slate-800 text-slate-300 border border-slate-700' :
                  'bg-rose-950 text-rose-400 border border-rose-800'
                }`}>
                  {pol.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-sm font-bold text-white mb-4 pb-2 border-b border-slate-800">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
