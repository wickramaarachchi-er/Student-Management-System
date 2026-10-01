/**
 * components/dashboard/EmployeeDashboard.jsx
 * Dashboard view for EMPLOYEE role displaying personal progress, compliance, and real attention items.
 */
import { Link } from 'react-router-dom';
import Icon from '../common/Icon.jsx';

export default function EmployeeDashboard({ data }) {
  const { metrics, attentionItems = [] } = data;
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
    unreadNotificationCount = 0,
    ownOpenHelpdeskCount = 0,
  } = metrics || {};

  const statCards = [
    {
      label: 'My Security Compliance',
      value: `${ownCompliancePercentage}%`,
      detail: `Status: ${complianceStatus.replace('_', ' ')}`,
      icon: 'shield-check',
      color: ownCompliancePercentage === 100
        ? 'border-emerald-800 text-emerald-400'
        : ownCompliancePercentage > 0
        ? 'border-amber-800 text-amber-400'
        : 'border-rose-800 text-rose-400',
    },
    {
      label: 'Policies Pending Ack',
      value: policiesRequiringAcknowledgement,
      detail: `${acknowledgedPolicyCount} policies acknowledged`,
      icon: 'book',
      color: policiesRequiringAcknowledgement > 0 ? 'border-amber-800 text-amber-400' : 'border-emerald-800 text-emerald-400',
    },
    {
      label: 'Training Completed',
      value: trainingCompletedCount,
      detail: `${trainingInProgressCount} in progress, ${trainingNotStartedCount} not started`,
      icon: 'academic-cap',
      color: 'border-blue-800 text-blue-400',
    },
    {
      label: 'Quizzes Passed',
      value: quizzesPassed,
      detail: `${quizzesOutstanding} outstanding quizzes`,
      icon: 'clipboard-list',
      color: 'border-purple-800 text-purple-400',
    },
  ];

  const quickActions = [
    { label: 'Security Policies', path: '/policies', icon: 'book', desc: 'Review and acknowledge mandatory security policies' },
    { label: 'Awareness Training', path: '/training', icon: 'academic-cap', desc: 'Complete interactive cyber hygiene modules' },
    { label: 'Knowledge Quizzes', path: '/quizzes', icon: 'clipboard-list', desc: 'Test your understanding of passwords and security' },
    { label: 'My Progress', path: '/my-progress', icon: 'award', desc: 'View your completed certifications and detailed status' },
    { label: 'Helpdesk', path: '/helpdesk', icon: 'helpdesk', desc: 'Ask security questions or report suspicious emails' },
    { label: 'Notifications', path: '/notifications', icon: 'bell', desc: 'Check personal reminders and security alerts' },
  ];

  return (
    <div className="space-y-6">
      {/* Primary Personal Stat Cards */}
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

      {/* Dynamic "What Needs Your Attention" Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-white">What Needs Your Attention</h2>
            <p className="text-xs text-slate-400">Action items derived live from your current compliance requirements</p>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
            {attentionItems.length} {attentionItems.length === 1 ? 'Item' : 'Items'} Pending
          </span>
        </div>

        {attentionItems.length === 0 ? (
          <div className="p-6 text-center bg-slate-950/40 rounded-lg border border-slate-800/60">
            <Icon name="check" className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-white">You're all caught up!</p>
            <p className="text-xs text-slate-400 mt-1">All policies acknowledged, courses completed, and quizzes passed.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {attentionItems.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                      item.type === 'POLICY' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                      item.type === 'TRAINING' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                      item.type === 'QUIZ' ? 'bg-purple-950 text-purple-300 border border-purple-800' :
                      'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}>
                      {item.type}
                    </span>
                    <h3 className="text-xs font-semibold text-white">{item.title}</h3>
                  </div>
                  <p className="text-xs text-slate-400">{item.detail}</p>
                </div>
                <Link
                  to={item.link}
                  className="inline-flex items-center justify-center text-xs font-semibold px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white transition-colors flex-shrink-0"
                >
                  Take Action →
                </Link>
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
