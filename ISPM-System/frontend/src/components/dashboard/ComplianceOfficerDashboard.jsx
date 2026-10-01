/**
 * components/dashboard/ComplianceOfficerDashboard.jsx
 * Dashboard view for COMPLIANCE_OFFICER role displaying real database compliance statistics.
 */
import { Link } from 'react-router-dom';
import Icon from '../common/Icon.jsx';
import StatCard from '../common/StatCard.jsx';
import StatusBadge from '../common/StatusBadge.jsx';

export default function ComplianceOfficerDashboard({ data }) {
  const { metrics, recentPolicies = [] } = data || {};
  const {
    activeEmployees = 0,
    fullyCompliantEmployees = 0,
    partiallyCompliantEmployees = 0,
    nonCompliantEmployees = 0,
    averageCompliancePercentage = 0,
    categorySummaries = {},
    activePublishedPolicies = 0,
    policiesRequiringAcknowledgement = 0,
  } = metrics || {};

  const quickActions = [
    { label: 'Compliance Audit Portal', path: '/compliance', icon: 'award', desc: 'Monitor employee compliance percentages and requirement gaps' },
    { label: 'Executive Reports', path: '/reports', icon: 'chart', desc: 'Generate and export executive compliance summaries' },
    { label: 'Policy Governance', path: '/policies', icon: 'book', desc: 'Draft, revise, and publish security policies' },
    { label: 'Security Audit Logs', path: '/audit-logs', icon: 'shield-check', desc: 'Verify timestamped policy signatures and log history' },
    { label: 'Security Advisories', path: '/notifications', icon: 'bell', desc: 'Dispatch compliance reminders and advisories' },
  ];

  return (
    <div className="space-y-6">
      {/* Primary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Monitored Employees"
          value={activeEmployees}
          subtitle="Active workforce pool"
          icon="users"
          iconBg="bg-blue-500/10 text-blue-400 border-blue-500/20"
        />
        <StatCard
          title="Fully Compliant"
          value={fullyCompliantEmployees}
          subtitle={`${Math.round((fullyCompliantEmployees / (activeEmployees || 1)) * 100)}% of total workforce`}
          icon="shield-check"
          iconBg="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          trend="Passed All Requirements"
          trendType="positive"
        />
        <StatCard
          title="Average Compliance"
          value={`${averageCompliancePercentage}%`}
          subtitle={`${partiallyCompliantEmployees} partial, ${nonCompliantEmployees} non-compliant`}
          icon="award"
          iconBg="bg-purple-500/10 text-purple-400 border-purple-500/20"
          trend={averageCompliancePercentage >= 80 ? 'Optimal Rate' : 'Improvement Needed'}
          trendType={averageCompliancePercentage >= 80 ? 'positive' : 'warning'}
        />
        <StatCard
          title="Published Policies"
          value={activePublishedPolicies}
          subtitle={`${policiesRequiringAcknowledgement} pending acknowledgements`}
          icon="book"
          iconBg="bg-amber-500/10 text-amber-400 border-amber-500/20"
        />
      </div>

      {/* Compliance Category Progress */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-4 pb-2 border-b border-slate-800 flex items-center justify-between">
          <span>Organization Progress by Requirement Pillar</span>
          <Link to="/compliance" className="text-xs font-semibold text-blue-400 hover:text-blue-300">
            View Compliance Breakdown →
          </Link>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">Policy Acknowledgements</span>
              <span className="text-base font-extrabold text-emerald-400">{categorySummaries.policy?.percentage || 0}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all duration-500"
                style={{ width: `${categorySummaries.policy?.percentage || 0}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-400 flex justify-between font-medium">
              <span>{categorySummaries.policy?.completed || 0} completed</span>
              <span>{categorySummaries.policy?.totalRequirements || 0} total required</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">Awareness Training</span>
              <span className="text-base font-extrabold text-blue-400">{categorySummaries.training?.percentage || 0}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-500 h-full transition-all duration-500"
                style={{ width: `${categorySummaries.training?.percentage || 0}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-400 flex justify-between font-medium">
              <span>{categorySummaries.training?.completed || 0} completed</span>
              <span>{categorySummaries.training?.totalRequirements || 0} total required</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">Quiz Assessments</span>
              <span className="text-base font-extrabold text-purple-400">{categorySummaries.quiz?.percentage || 0}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-purple-500 h-full transition-all duration-500"
                style={{ width: `${categorySummaries.quiz?.percentage || 0}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-400 flex justify-between font-medium">
              <span>{categorySummaries.quiz?.completed || 0} passed</span>
              <span>{categorySummaries.quiz?.totalRequirements || 0} total required</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Security Policies */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Active Security Governance Policies</h2>
          <Link to="/policies" className="text-xs text-blue-400 hover:text-blue-300 font-semibold">
            Manage Policies →
          </Link>
        </div>
        {recentPolicies.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No security policies registered in system.</p>
        ) : (
          <div className="space-y-3">
            {recentPolicies.map((pol) => (
              <div key={pol.id} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs gap-3">
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-slate-100 truncate">{pol.title}</div>
                  <div className="text-slate-400 mt-0.5 text-[11px]">
                    Category: {pol.category} • Target: {pol.targetDepartment || 'All Departments'}
                  </div>
                </div>
                <StatusBadge status={pol.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-4 pb-2 border-b border-slate-800">
          Compliance Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
