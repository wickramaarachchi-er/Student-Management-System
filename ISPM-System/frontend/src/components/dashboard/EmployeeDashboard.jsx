/**
 * components/dashboard/EmployeeDashboard.jsx
 * Dashboard view for EMPLOYEE role displaying personal progress, compliance, and real attention items.
 */
import { Link } from 'react-router-dom';
import Icon from '../common/Icon.jsx';
import StatCard from '../common/StatCard.jsx';
import StatusBadge from '../common/StatusBadge.jsx';

export default function EmployeeDashboard({ data }) {
  const { metrics, attentionItems = [] } = data || {};
  const {
    policiesRequiringAcknowledgement = 0,
    acknowledgedPolicyCount = 0,
    trainingCompletedCount = 0,
    trainingInProgressCount = 0,
    trainingNotStartedCount = 0,
    quizzesPassed = 0,
    quizzesOutstanding = 0,
    ownCompliancePercentage = 0,
    complianceStatus = 'NO_REQUIREMENTS',
  } = metrics || {};

  const quickActions = [
    { label: 'Security Policies', path: '/policies', icon: 'book', desc: 'Review and acknowledge mandatory security policies' },
    { label: 'Awareness Training', path: '/training', icon: 'academic-cap', desc: 'Complete interactive cyber hygiene modules' },
    { label: 'Knowledge Quizzes', path: '/quizzes', icon: 'clipboard-list', desc: 'Test your understanding of passwords and security' },
    { label: 'My Progress Portal', path: '/my-progress', icon: 'award', desc: 'View your completed certifications and detailed status' },
    { label: 'Security Helpdesk', path: '/helpdesk', icon: 'helpdesk', desc: 'Ask security questions or report suspicious emails' },
    { label: 'Notifications', path: '/notifications', icon: 'bell', desc: 'Check personal reminders and security alerts' },
  ];

  return (
    <div className="space-y-6">
      {/* Primary Personal Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="My Compliance Score"
          value={`${ownCompliancePercentage}%`}
          subtitle={`Status: ${complianceStatus.replace('_', ' ')}`}
          icon="shield-check"
          iconBg={
            ownCompliancePercentage === 100
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : ownCompliancePercentage > 0
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
          }
          trend={ownCompliancePercentage === 100 ? 'Fully Compliant' : 'Outstanding Action'}
          trendType={ownCompliancePercentage === 100 ? 'positive' : 'warning'}
        />
        <StatCard
          title="Policies Pending"
          value={policiesRequiringAcknowledgement}
          subtitle={`${acknowledgedPolicyCount} policies acknowledged`}
          icon="book"
          iconBg="bg-amber-500/10 text-amber-400 border-amber-500/20"
          trend={policiesRequiringAcknowledgement === 0 ? 'Up to Date' : 'Signature Due'}
          trendType={policiesRequiringAcknowledgement === 0 ? 'positive' : 'warning'}
        />
        <StatCard
          title="Training Completed"
          value={trainingCompletedCount}
          subtitle={`${trainingInProgressCount} in progress, ${trainingNotStartedCount} unstarted`}
          icon="academic-cap"
          iconBg="bg-blue-500/10 text-blue-400 border-blue-500/20"
        />
        <StatCard
          title="Quizzes Passed"
          value={quizzesPassed}
          subtitle={`${quizzesOutstanding} outstanding assessments`}
          icon="clipboard-list"
          iconBg="bg-purple-500/10 text-purple-400 border-purple-500/20"
        />
      </div>

      {/* Dynamic "What Needs Your Attention" Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">What Needs Your Attention</h2>
            <p className="text-xs text-slate-400 mt-0.5">Action items derived live from your current compliance requirements</p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-md bg-slate-950 text-slate-300 border border-slate-800 font-semibold">
            {attentionItems.length} {attentionItems.length === 1 ? 'Requirement' : 'Requirements'} Due
          </span>
        </div>

        {attentionItems.length === 0 ? (
          <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800/80 my-2">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <Icon name="check" className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-100">You are 100% Compliant!</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              All required security policies have been acknowledged, awareness modules completed, and assessments passed.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {attentionItems.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-all"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={item.type} />
                    <h3 className="text-sm font-bold text-slate-100 truncate">{item.title}</h3>
                  </div>
                  <p className="text-xs text-slate-400">{item.detail}</p>
                </div>
                <Link
                  to={item.link}
                  className="inline-flex items-center justify-center text-xs font-bold px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-950 transition-all shrink-0"
                >
                  Take Action →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-4 pb-2 border-b border-slate-800">
          Security Portal Navigation
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
