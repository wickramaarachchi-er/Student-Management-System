import { Link } from 'react-router-dom';
import Icon from '../common/Icon.jsx';
import './ComplianceOfficerDashboard.css';

export default function TrainingAdminDashboard({ data }) {
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
