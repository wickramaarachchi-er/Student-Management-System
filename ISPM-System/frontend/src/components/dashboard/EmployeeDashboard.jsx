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
    complianceStatus = 'PARTIALLY_COMPLIANT',
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
    <div className="space-y-10 sm:space-y-12">
      {/* Primary Personal Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
        <StatCard
          title="My Compliance Score"
          value={`${ownCompliancePercentage}%`}
          subtitle={`Status: ${complianceStatus.replace('_', ' ')}`}
          icon="shield-check"
          iconBg={
            ownCompliancePercentage === 100
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
              : 'bg-[#392408] text-[#fbbf24] border-[#784d12]'
          }
          trend={ownCompliancePercentage === 100 ? 'Fully Compliant' : 'Outstanding Action'}
          trendType={ownCompliancePercentage === 100 ? 'positive' : 'warning'}
        />
        <StatCard
          title="Policies Pending"
          value={policiesRequiringAcknowledgement}
          subtitle={`${acknowledgedPolicyCount} policies acknowledged`}
          icon="book"
          iconBg="bg-[#392408] text-[#fbbf24] border-[#784d12]"
          trend={policiesRequiringAcknowledgement === 0 ? 'Up to Date' : 'Signature Due'}
          trendType={policiesRequiringAcknowledgement === 0 ? 'positive' : 'warning'}
        />
        <StatCard
          title="Training Completed"
          value={trainingCompletedCount}
          subtitle={`${trainingInProgressCount} in progress, ${trainingNotStartedCount} unstarted`}
          icon="academic-cap"
          iconBg="bg-[#0b2447] text-[#60a5fa] border-[#1d4ed8]/40"
        />
        <StatCard
          title="Quizzes Passed"
          value={quizzesPassed}
          subtitle={`${quizzesOutstanding} outstanding assessments`}
          icon="clipboard-list"
          iconBg="bg-[#28114b] text-[#c084fc] border-[#7e22ce]/40"
        />
      </div>

      {/* Dynamic "What Needs Your Attention" Section */}
      <div className="space-y-5">
        <div className="flex items-center justify-between pb-2 border-b border-[#142347]/60">
          <div>
            <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
              WHAT NEEDS YOUR ATTENTION
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Action items derived live from your current compliance requirements
            </p>
          </div>
          <span className="text-xs sm:text-sm text-slate-300 font-semibold tracking-wide bg-[#060e22] px-3.5 py-1.5 rounded-full border border-[#142347]">
            {attentionItems.length} {attentionItems.length === 1 ? 'Requirement' : 'Requirements'} Due
          </span>
        </div>

        {attentionItems.length === 0 ? (
          <div className="p-10 text-center bg-[#060e22] rounded-2xl border border-[#142347] my-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <Icon name="check" className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white">You are 100% Compliant!</h3>
            <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
              All required security policies have been acknowledged, awareness modules completed, and assessments passed.
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {attentionItems.map((item) => (
              <div
                key={item.id}
                className="px-6 py-5 rounded-2xl bg-[#060e22] hover:bg-[#091533] border border-[#142347] flex flex-col sm:flex-row sm:items-center justify-between gap-5 transition-all shadow-sm"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-950/80 border border-sky-500/40 text-sky-400 text-xs font-extrabold uppercase tracking-wide shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.8)]" />
                      {item.type}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">{item.title}</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-400 pl-0.5">{item.detail}</p>
                </div>
                <Link
                  to={item.link}
                  className="inline-flex items-center justify-center text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white shadow-lg shadow-blue-950/60 transition-all shrink-0 whitespace-nowrap"
                >
                  Take Action →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Security Portal Navigation Section */}
      <div className="space-y-5 pt-2">
        <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-wider pb-2 border-b border-[#142347]/60">
          SECURITY PORTAL NAVIGATION
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {quickActions.map((action, idx) => (
            <Link
              key={idx}
              to={action.path}
              className="p-6 rounded-2xl bg-[#060e22] hover:bg-[#091533] border border-[#142347] hover:border-blue-500/50 transition-all flex flex-col justify-between group shadow-sm min-h-[150px]"
            >
              <div>
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Icon name={action.icon} className="w-5 h-5" />
                  </div>
                  <span className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                    {action.label}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mt-2">{action.desc}</p>
              </div>
              <span className="text-xs sm:text-sm text-blue-400 font-semibold mt-5 inline-flex items-center gap-1 group-hover:translate-x-1.5 transition-transform">
                Launch →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
