import { Link } from 'react-router-dom';
import Icon from '../common/Icon.jsx';
import './TrainingAdminDashboard.css';
import { Link } from 'react-router-dom';
import Icon from '../common/Icon.jsx';
import './ComplianceOfficerDashboard.css';

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
  const { metrics = {} } = data || {};
  const { totalTrainingModules = 0, publishedTrainingModules = 0, unpublishedTrainingModules = 0,
    totalQuizzes = 0, totalProgressRecords = 0, completedProgressRecords = 0,
    completionRate = 0, totalQuizAttempts = 0, passedQuizAttempts = 0, quizPassRate = 0 } = metrics;
  const cards = [
    { title: 'Training modules', value: totalTrainingModules, detail: `${publishedTrainingModules} published · ${unpublishedTrainingModules} drafts`, icon: 'academic-cap', tone: 'indigo', path: '/training' },
    { title: 'Active quizzes', value: totalQuizzes, detail: `${totalQuizAttempts} learner attempts`, icon: 'clipboard-list', tone: 'violet', path: '/quizzes' },
    { title: 'Course completion', value: `${completionRate}%`, detail: `${completedProgressRecords} of ${totalProgressRecords} records complete`, icon: 'trending-up', tone: 'teal', path: '/training-progress' },
    { title: 'Quiz pass rate', value: `${quizPassRate}%`, detail: `${passedQuizAttempts} passed of ${totalQuizAttempts} attempts`, icon: 'award', tone: 'amber', path: '/training-progress' },
  ];
  const percent = (n) => Math.min(100, Math.max(0, Number(n) || 0));
  return <div className="compliance-overview">
    <section className="compliance-stats" aria-label="Training metrics">{cards.map((card) => <Link className={`compliance-stat ${card.tone}`} to={card.path} key={card.title}>
      <div className="compliance-stat-top"><span>{card.title}</span><span className="compliance-icon"><Icon name={card.icon} className="w-5 h-5" /></span></div><strong>{card.value}</strong><div className="compliance-stat-bottom"><span>{card.detail}</span><span aria-hidden="true">↗</span></div>
    </Link>)}</section>
    <div className="compliance-middle">
      <section className="compliance-panel"><div className="compliance-panel-heading"><div><h2>Learning outcomes</h2><p>Completion and assessment performance across your organization</p></div><Link to="/training-progress">View learner progress ↗</Link></div>
        <div className="training-metrics">
          <div className="training-metric"><div className="compliance-category-label"><span>Course completion</span><strong>{completionRate}%</strong></div><div className="compliance-progress"><span style={{ width: `${percent(completionRate)}%`, background: '#14b8a6' }} /></div><small>{completedProgressRecords} of {totalProgressRecords} progress records completed</small></div>
          <div className="training-metric"><div className="compliance-category-label"><span>Quiz pass rate</span><strong>{quizPassRate}%</strong></div><div className="compliance-progress"><span style={{ width: `${percent(quizPassRate)}%`, background: '#8b5cf6' }} /></div><small>{passedQuizAttempts} of {totalQuizAttempts} quiz attempts passed</small></div>
          <div className="training-counts"><div><span>Published modules</span><strong>{publishedTrainingModules}</strong></div><div><span>Draft modules</span><strong>{unpublishedTrainingModules}</strong></div><div><span>Assessments</span><strong>{totalQuizzes}</strong></div></div>
        </div>
      </section>
      <section className="compliance-workspace"><span className="compliance-eyebrow">TRAINING WORKSPACE</span><h2>Build confident security habits.</h2><p>Keep learning content current and follow completion across your team.</p>
        <Link className="compliance-primary" to="/training"><Icon name="academic-cap" className="w-4 h-4" />Manage training catalog<span aria-hidden="true">↗</span></Link>
        <Link className="compliance-workspace-link" to="/quizzes"><Icon name="clipboard-list" className="w-4 h-4" /><span>Manage assessments</span><b>{totalQuizzes} quizzes</b></Link>
        <Link className="compliance-workspace-link" to="/training-progress"><Icon name="trending-up" className="w-4 h-4" /><span>Review learner progress</span><span aria-hidden="true">↗</span></Link>
      </section>
    </div>
    <section className="compliance-panel"><div className="compliance-panel-heading"><div><h2>Training activity snapshot</h2><p>Current learner activity totals</p></div><Link to="/training-progress">Open progress report ↗</Link></div>
      <div className="training-activity"><div><span className="training-activity-icon"><Icon name="check" className="w-4 h-4" /></span><div><h3>Completed learning records</h3><p>Learners who have completed assigned training</p></div><strong>{completedProgressRecords}</strong></div><div><span className="training-activity-icon quiz"><Icon name="award" className="w-4 h-4" /></span><div><h3>Successful quiz attempts</h3><p>Assessments passed by learners</p></div><strong>{passedQuizAttempts}</strong></div></div>
    </section>
    <div className="compliance-footer"><span>CyberShield / Training overview</span><span>Learning modules · Assessments · Learner progress</span></div>
  </div>;
}
