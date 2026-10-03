import { Link } from 'react-router-dom';
import Icon from '../common/Icon.jsx';
import './TrainingAdminDashboard.css';

const percent = value => Math.min(100, Math.max(0, Number(value) || 0));
function Outcome({ title, subtitle, rate, total, completed, positive, remaining, tone, path }) {
  return <section className={`ta-panel ta-outcome ${tone}`}>
    <div className="ta-panel-heading"><div><h2>{title}</h2><p>{subtitle}</p></div><Icon name={tone === 'mint' ? 'trending-up' : 'award'} /></div>
    <div className="ta-outcome-body">
      <div className="ta-ring" style={{ '--rate': `${total ? percent(rate) : 0}%` }} role="img" aria-label={`${title}: ${total ? `${percent(rate)}%` : 'no data yet'}`}><div><strong>{total ? `${percent(rate)}%` : '—'}</strong><span>{total ? 'overall rate' : 'No data yet'}</span></div></div>
      <div className="ta-legend"><div><i className="ta-dot" /><span>{positive}</span><strong>{completed}</strong></div><div><i className="ta-dot muted" /><span>{remaining}</span><strong>{Math.max(0, total - completed)}</strong></div><div className="ta-legend-total"><span>Total records</span><strong>{total}</strong></div></div>
    </div>
    <Link className="ta-panel-link" to={path}>View {tone === 'mint' ? 'learner progress' : 'assessments'}<span aria-hidden="true">↗</span></Link>
  </section>;
}
export default function TrainingAdminDashboard({ data }) {
  const { totalTrainingModules = 0, publishedTrainingModules = 0, unpublishedTrainingModules = 0, totalQuizzes = 0, totalProgressRecords = 0, completedProgressRecords = 0, completionRate = 0, totalQuizAttempts = 0, passedQuizAttempts = 0, quizPassRate = 0, unreadNotificationCount = 0 } = data?.metrics || {};
  const stats = [
    { label: 'Training modules', value: totalTrainingModules, detail: `${publishedTrainingModules} published · ${unpublishedTrainingModules} drafts`, icon: 'academic-cap', tone: 'blue' },
    { label: 'Assessments', value: totalQuizzes, detail: `${totalQuizAttempts} quiz attempts recorded`, icon: 'clipboard-list', tone: 'violet' },
    { label: 'Training completion', value: totalProgressRecords ? `${percent(completionRate)}%` : '—', detail: `${completedProgressRecords} of ${totalProgressRecords} records completed`, icon: 'trending-up', tone: 'mint' },
    { label: 'Assessment pass rate', value: totalQuizAttempts ? `${percent(quizPassRate)}%` : '—', detail: `${passedQuizAttempts} of ${totalQuizAttempts} attempts passed`, icon: 'award', tone: 'amber' },
  ];
  const actions = [
    { title: 'Training catalog', text: 'Build and publish security awareness modules.', path: '/training', icon: 'academic-cap', tone: 'blue' },
    { title: 'Quiz management', text: 'Manage questions, assessments, and passing scores.', path: '/quizzes', icon: 'clipboard-list', tone: 'violet' },
    { title: 'Learner progress', text: 'Follow learning milestones and completion status.', path: '/training-progress', icon: 'users', tone: 'mint' },
    { title: 'Notifications', text: 'Review your training updates and notifications.', path: '/notifications', icon: 'bell', tone: 'amber' },
  ];
  return <div className="ta-dashboard">
    <section className="ta-banner"><div><span className="ta-eyebrow">SECURITY AWARENESS</span><h2>A stronger security culture starts here.</h2><p>Bring your courses, assessments, and learning outcomes into focus.</p></div><Link className="ta-primary" to="/training"><Icon name="academic-cap" className="w-4 h-4" />Manage training<span aria-hidden="true">↗</span></Link></section>
    <section className="ta-stats" aria-label="Training summary">{stats.map(stat => <article className="ta-stat" key={stat.label}><div className="ta-stat-top"><span>{stat.label}</span><span className={`ta-icon ${stat.tone}`}><Icon name={stat.icon} className="w-[18px] h-[18px]" /></span></div><strong className="ta-stat-value">{stat.value}</strong><p>{stat.detail}</p></article>)}</section>
    <div className="ta-section-heading"><div><h2>Learning outcomes</h2><p>Organization-wide training and assessment performance</p></div><span className="ta-period">All time</span></div>
    <div className="ta-analytics">
      <Outcome title="Course completion" subtitle="Completed training progress records" rate={completionRate} total={totalProgressRecords} completed={completedProgressRecords} positive="Completed" remaining="Not completed" tone="mint" path="/training-progress" />
      <Outcome title="Assessment performance" subtitle="Pass results across recorded quiz attempts" rate={quizPassRate} total={totalQuizAttempts} completed={passedQuizAttempts} positive="Passed" remaining="Not passed" tone="violet" path="/quizzes" />
      <section className="ta-panel ta-catalog"><div className="ta-panel-heading"><div><h2>Catalog readiness</h2><p>Your training publication overview</p></div><Icon name="book" /></div><div className="ta-catalog-total"><strong>{totalTrainingModules}</strong><span>training modules</span></div><div className="ta-publication-bar" role="img" aria-label={`${publishedTrainingModules} published modules, ${unpublishedTrainingModules} drafts`}><span style={{ width: `${totalTrainingModules ? percent(publishedTrainingModules / totalTrainingModules * 100) : 0}%` }} /></div><div className="ta-catalog-row"><span><i className="ta-dot" />Published</span><strong>{publishedTrainingModules}</strong></div><div className="ta-catalog-row"><span><i className="ta-dot draft" />Drafts</span><strong>{unpublishedTrainingModules}</strong></div><Link className="ta-panel-link" to="/training">{unpublishedTrainingModules ? 'Review draft modules' : 'Open training catalog'}<span aria-hidden="true">↗</span></Link></section>
    </div>
    <div className="ta-section-heading"><div><h2>Your workspace</h2><p>Everything you need to keep learning moving</p></div><Link className="ta-notification-link" to="/notifications"><Icon name="bell" className="w-4 h-4" />{unreadNotificationCount} unread</Link></div>
    <nav className="ta-actions" aria-label="Training management">{actions.map(action => <Link to={action.path} className="ta-action" key={action.path}><span className={`ta-icon ${action.tone}`}><Icon name={action.icon} /></span><span className="ta-action-arrow" aria-hidden="true">↗</span><h3>{action.title}</h3><p>{action.text}</p><span className="ta-action-label">Open workspace <span aria-hidden="true">→</span></span></Link>)}</nav>
  </div>;
}
