import { Link } from 'react-router-dom';
import Icon from '../common/Icon.jsx';
import './ComplianceOfficerDashboard.css';

export default function EmployeeDashboard({ data }) {
  const { metrics = {}, attentionItems = [] } = data || {};
  const { policiesRequiringAcknowledgement = 0, acknowledgedPolicyCount = 0,
    trainingCompletedCount = 0, trainingInProgressCount = 0, trainingNotStartedCount = 0,
    quizzesPassed = 0, quizzesOutstanding = 0, ownCompliancePercentage = 0,
    complianceStatus = 'PARTIALLY_COMPLIANT' } = metrics;
  const cards = [
    { title: 'My compliance score', value: `${ownCompliancePercentage}%`, detail: `Status: ${complianceStatus.replaceAll('_', ' ').toLowerCase()}`, icon: 'shield-check', tone: ownCompliancePercentage === 100 ? 'teal' : 'amber', path: '/my-progress' },
    { title: 'Policies pending', value: policiesRequiringAcknowledgement, detail: `${acknowledgedPolicyCount} acknowledged`, icon: 'book', tone: 'violet', path: '/policies' },
    { title: 'Training completed', value: trainingCompletedCount, detail: `${trainingInProgressCount} in progress · ${trainingNotStartedCount} not started`, icon: 'academic-cap', tone: 'indigo', path: '/training' },
    { title: 'Quizzes passed', value: quizzesPassed, detail: `${quizzesOutstanding} outstanding`, icon: 'award', tone: 'teal', path: '/quizzes' },
  ];
  const actions = [
    { title: 'Security policies', detail: 'Review and acknowledge required policies', icon: 'book', path: '/policies' },
    { title: 'Awareness training', detail: 'Complete your assigned learning modules', icon: 'academic-cap', path: '/training' },
    { title: 'Knowledge quizzes', detail: 'Check your understanding of security topics', icon: 'clipboard-list', path: '/quizzes' },
    { title: 'My progress', detail: 'Review your completion and compliance status', icon: 'award', path: '/my-progress' },
    { title: 'Security helpdesk', detail: 'Ask a question or report a concern', icon: 'helpdesk', path: '/helpdesk' },
    { title: 'Notifications', detail: 'Read reminders and security alerts', icon: 'bell', path: '/notifications' },
  ];
  return <div className="compliance-overview">
    <section className="compliance-stats" aria-label="My security progress">{cards.map((card) => <Link className={`compliance-stat ${card.tone}`} to={card.path} key={card.title}>
      <div className="compliance-stat-top"><span>{card.title}</span><span className="compliance-icon"><Icon name={card.icon} className="w-5 h-5" /></span></div><strong>{card.value}</strong><div className="compliance-stat-bottom"><span>{card.detail}</span><span aria-hidden="true">↗</span></div>
    </Link>)}</section>
    <div className="compliance-middle">
      <section className="compliance-panel"><div className="compliance-panel-heading"><div><h2>{attentionItems.length ? 'Recent items needing attention' : 'You are up to date'}</h2><p>{attentionItems.length ? 'Your current outstanding security requirements' : 'Your required policies, training, and assessments are complete'}</p></div><span className={`employee-attention-count ${attentionItems.length ? 'has-items' : ''}`}>{attentionItems.length} due</span></div>
        {attentionItems.length ? <ol className="employee-activity">{attentionItems.slice(0, 6).map((item) => <li key={item.id}><span className="employee-event-dot" /><div className="employee-event-copy"><div className="employee-event-title"><span>{item.type}</span><Link to={item.link}>Take action ↗</Link></div><h3>{item.title}</h3><p>{item.detail}</p></div></li>)}</ol> : <div className="compliance-empty employee-empty"><span className="employee-done-icon"><Icon name="check" className="w-6 h-6" /></span><h3>All requirements complete</h3><p>New tasks will appear here when action is needed.</p></div>}
      </section>
      <section className="compliance-workspace"><span className="compliance-eyebrow">MY SECURITY WORKSPACE</span><h2>Stay ready. Stay secure.</h2><p>Continue your learning and keep your security requirements current.</p>
        <Link className="compliance-primary" to="/my-progress"><Icon name="award" className="w-4 h-4" />View my progress<span aria-hidden="true">↗</span></Link>
        <Link className="compliance-workspace-link" to="/policies"><Icon name="book" className="w-4 h-4" /><span>Review pending policies</span><b>{policiesRequiringAcknowledgement}</b></Link>
        <Link className="compliance-workspace-link" to="/training"><Icon name="academic-cap" className="w-4 h-4" /><span>Continue training</span><b>{trainingInProgressCount}</b></Link>
      </section>
    </div>
    <section className="compliance-panel"><div className="compliance-panel-heading"><div><h2>Security portal</h2><p>Quick access to your learning and support tools</p></div></div>
      <div className="employee-action-grid">{actions.map((action) => <Link to={action.path} className="employee-action" key={action.path}><span><Icon name={action.icon} className="w-4 h-4" /></span><div><h3>{action.title}</h3><p>{action.detail}</p></div><b aria-hidden="true">↗</b></Link>)}</div>
    </section>
    <div className="compliance-footer"><span>CyberShield / My security overview</span><span>Policies · Training · Assessments</span></div>
  </div>;
}
