/**
 * components/dashboard/TrainingAdminDashboard.jsx
 * Dashboard view for TRAINING_ADMIN role displaying real database training and quiz metrics.
 */
import { Link } from 'react-router-dom';
import Icon from '../common/Icon.jsx';
import StatCard from '../common/StatCard.jsx';

export default function TrainingAdminDashboard({ data }) {
  const { metrics } = data || {};
  const {
    totalTrainingModules = 0,
    publishedTrainingModules = 0,
    unpublishedTrainingModules = 0,
    totalQuizzes = 0,
    totalProgressRecords = 0,
    completedProgressRecords = 0,
    completionRate = 0,
    totalQuizAttempts = 0,
    passedQuizAttempts = 0,
    quizPassRate = 0,
  } = metrics || {};

  const quickActions = [
    { label: 'Training Catalog', path: '/training', icon: 'academic-cap', desc: 'Design, edit, and publish cyber awareness courses' },
    { label: 'Quiz Management', path: '/quizzes', icon: 'clipboard-list', desc: 'Manage quiz questions, options, and passing scores' },
    { label: 'Learner Progress', path: '/training-progress', icon: 'trending-up', desc: 'Monitor employee learning milestones and completion status' },
    { label: 'Training Alerts', path: '/notifications', icon: 'bell', desc: 'Dispatch advisories for upcoming training deadlines' },
  ];

  return (
    <div className="space-y-6">
      {/* Primary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Training Modules"
          value={totalTrainingModules}
          subtitle={`${publishedTrainingModules} published, ${unpublishedTrainingModules} drafts`}
          icon="academic-cap"
          iconBg="bg-amber-500/10 text-amber-400 border-amber-500/20"
        />
        <StatCard
          title="Active Quizzes"
          value={totalQuizzes}
          subtitle={`${totalQuizAttempts} total quiz attempts logged`}
          icon="clipboard-list"
          iconBg="bg-blue-500/10 text-blue-400 border-blue-500/20"
        />
        <StatCard
          title="Completion Rate"
          value={`${completionRate}%`}
          subtitle={`${completedProgressRecords} of ${totalProgressRecords} progress records`}
          icon="trending-up"
          iconBg="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          trend="Healthy Progress"
          trendType="positive"
        />
        <StatCard
          title="Quiz Pass Rate"
          value={`${quizPassRate}%`}
          subtitle={`${passedQuizAttempts} passed of ${totalQuizAttempts} attempts`}
          icon="award"
          iconBg="bg-purple-500/10 text-purple-400 border-purple-500/20"
          trend={quizPassRate >= 70 ? 'High Passing Rate' : 'Review Quizzes'}
          trendType={quizPassRate >= 70 ? 'positive' : 'warning'}
        />
      </div>

      {/* Analytics Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-4 pb-2 border-b border-slate-800">
          Organization Training & Assessment Progress
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Course Completion */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">Course Completion Rate</span>
              <span className="text-base font-extrabold text-emerald-400 font-mono">{completionRate}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${completionRate}%` }} />
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-center">
                <span className="text-slate-400 block text-[11px]">Total Modules</span>
                <span className="text-slate-100 font-bold text-sm">{totalTrainingModules}</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-center">
                <span className="text-slate-400 block text-[11px]">Published Courses</span>
                <span className="text-emerald-400 font-bold text-sm">{publishedTrainingModules}</span>
              </div>
            </div>
          </div>

          {/* Quiz Performance */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">Assessment Pass Rate</span>
              <span className="text-base font-extrabold text-purple-400 font-mono">{quizPassRate}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div className="bg-purple-500 h-full transition-all duration-500" style={{ width: `${quizPassRate}%` }} />
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-center">
                <span className="text-slate-400 block text-[11px]">Total Assessments</span>
                <span className="text-slate-100 font-bold text-sm">{totalQuizzes}</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-center">
                <span className="text-slate-400 block text-[11px]">Passed Attempts</span>
                <span className="text-purple-400 font-bold text-sm">{passedQuizAttempts}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-4 pb-2 border-b border-slate-800">
          Management Actions
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
