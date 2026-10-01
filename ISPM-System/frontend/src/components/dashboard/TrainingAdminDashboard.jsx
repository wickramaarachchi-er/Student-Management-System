/**
 * components/dashboard/TrainingAdminDashboard.jsx
 * Dashboard view for TRAINING_ADMIN role displaying real database training and quiz metrics.
 */
import { Link } from 'react-router-dom';
import Icon from '../common/Icon.jsx';

export default function TrainingAdminDashboard({ data }) {
  const { metrics } = data;
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
    unreadNotificationCount = 0,
  } = metrics || {};

  const statCards = [
    {
      label: 'Total Training Modules',
      value: totalTrainingModules,
      detail: `${publishedTrainingModules} published, ${unpublishedTrainingModules} drafts`,
      icon: 'academic-cap',
      color: 'border-amber-800 text-amber-400',
    },
    {
      label: 'Published Quizzes',
      value: totalQuizzes,
      detail: `${totalQuizAttempts} total quiz attempts logged`,
      icon: 'clipboard-list',
      color: 'border-blue-800 text-blue-400',
    },
    {
      label: 'Completion Rate',
      value: `${completionRate}%`,
      detail: `${completedProgressRecords} of ${totalProgressRecords} progress records completed`,
      icon: 'trending-up',
      color: 'border-emerald-800 text-emerald-400',
    },
    {
      label: 'Quiz Pass Rate',
      value: `${quizPassRate}%`,
      detail: `${passedQuizAttempts} passed of ${totalQuizAttempts} attempts`,
      icon: 'award',
      color: 'border-purple-800 text-purple-400',
    },
  ];

  const quickActions = [
    { label: 'Training Modules', path: '/training', icon: 'academic-cap', desc: 'Design, edit, and publish cyber awareness courses' },
    { label: 'Quizzes', path: '/quizzes', icon: 'clipboard-list', desc: 'Manage quiz questions, options, and passing scores' },
    { label: 'Training Progress', path: '/training-progress', icon: 'trending-up', desc: 'Monitor employee learning milestones and completion status' },
    { label: 'Notifications', path: '/notifications', icon: 'bell', desc: 'Dispatch alerts for upcoming training deadlines' },
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

      {/* Overview Analytics Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-sm font-bold text-white mb-4 pb-2 border-b border-slate-800">
          Organization Training & Assessment Metrics
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Training Progress Overview */}
          <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">Training Completion Overview</span>
              <span className="text-xs font-bold text-emerald-400 font-mono">{completionRate}% Rate</span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${completionRate}%` }} />
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800 text-center">
                <span className="text-slate-500 block text-[10px]">Total Modules</span>
                <span className="text-white font-bold">{totalTrainingModules}</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800 text-center">
                <span className="text-slate-500 block text-[10px]">Published Courses</span>
                <span className="text-emerald-400 font-bold">{publishedTrainingModules}</span>
              </div>
            </div>
          </div>

          {/* Quiz Pass Rate Overview */}
          <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">Quiz Performance Overview</span>
              <span className="text-xs font-bold text-purple-400 font-mono">{quizPassRate}% Pass Rate</span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div className="bg-purple-500 h-full transition-all duration-300" style={{ width: `${quizPassRate}%` }} />
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800 text-center">
                <span className="text-slate-500 block text-[10px]">Total Quizzes</span>
                <span className="text-white font-bold">{totalQuizzes}</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800 text-center">
                <span className="text-slate-500 block text-[10px]">Passed Attempts</span>
                <span className="text-purple-400 font-bold">{passedQuizAttempts}</span>
              </div>
            </div>
          </div>
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
