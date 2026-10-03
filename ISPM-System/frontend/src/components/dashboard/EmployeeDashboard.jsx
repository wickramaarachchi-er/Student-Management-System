import { Link } from 'react-router-dom';
import Icon from '../common/Icon.jsx';
import './EmployeeDashboard.css';

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

  const score = Math.min(100, Math.max(0, Number(ownCompliancePercentage) || 0));
  const progressRows = [
    { label: 'Policy acknowledgements', completed: acknowledgedPolicyCount, total: acknowledgedPolicyCount + policiesRequiringAcknowledgement, tone: 'blue' },
    { label: 'Training modules', completed: trainingCompletedCount, total: trainingCompletedCount + trainingInProgressCount + trainingNotStartedCount, tone: 'green' },
    { label: 'Knowledge quizzes', completed: quizzesPassed, total: quizzesPassed + quizzesOutstanding, tone: 'violet' },
  ];
  const cards = [
    { label: 'My compliance', value: score + '%', detail: complianceStatus.replaceAll('_', ' ').toLowerCase(), icon: 'shield-check', tone: 'blue' },
    { label: 'Policies pending', value: policiesRequiringAcknowledgement, detail: acknowledgedPolicyCount + ' acknowledged', icon: 'book', tone: 'amber' },
    { label: 'Training completed', value: trainingCompletedCount, detail: trainingInProgressCount + ' in progress ? ' + trainingNotStartedCount + ' not started', icon: 'academic-cap', tone: 'green' },
    { label: 'Quizzes passed', value: quizzesPassed, detail: quizzesOutstanding + ' assessments outstanding', icon: 'award', tone: 'violet' },
  ];
  const itemIcons = { POLICY: 'book', TRAINING: 'academic-cap', QUIZ: 'clipboard-list', NOTIFICATION: 'bell', HELPDESK: 'helpdesk' };

  return (
    <div className="employee-dashboard">
      <section className="employee-stats" aria-label="My security overview">
        {cards.map(card => <article key={card.label}><span className={'employee-stat-icon ' + card.tone}><Icon name={card.icon} className="w-5 h-5" /></span><h2>{card.label}</h2><strong>{card.value}</strong><p>{card.detail}</p></article>)}
      </section>

      <div className="employee-workspace">
        <section className="employee-panel employee-attention" aria-labelledby="employee-attention-title">
          <div className="employee-panel-heading"><div><span className="employee-section-eyebrow">YOUR NEXT STEPS</span><h2 id="employee-attention-title">Needs your attention</h2><p>Requirements and updates from your security portal.</p></div><span className="employee-count">{attentionItems.length} item{attentionItems.length !== 1 ? 's' : ''}</span></div>
          {attentionItems.length === 0 ? <div className="employee-all-clear"><span><Icon name="check" className="w-6 h-6" /></span><h3>You're all caught up</h3><p>No pending actions or updates right now.</p><Link to="/my-progress">View my progress <span aria-hidden="true">?</span></Link></div>
            : <div className="employee-attention-list">{attentionItems.map(item => <article key={item.id} className="employee-attention-row">
              <span className="employee-item-icon"><Icon name={itemIcons[item.type] || 'shield'} className="w-4 h-4" /></span>
              <div className="employee-item-copy"><span className="employee-item-type">{item.type.toLowerCase()}</span><h3>{item.title}</h3><p>{item.detail}</p></div>
              <Link to={item.link} className="employee-action-link" aria-label={'Take action: ' + item.title}>Take action <span aria-hidden="true">?</span></Link>
            </article>)}</div>}
        </section>

        <aside className="employee-panel employee-progress" aria-labelledby="employee-progress-title">
          <div className="employee-panel-heading"><div><span className="employee-section-eyebrow">PERSONAL SCORECARD</span><h2 id="employee-progress-title">Your security progress</h2><p>Small steps toward a safer workplace.</p></div></div>
          <div className="employee-progress-body">
            <div className="employee-score"><div><span>Overall compliance</span><strong>{score}%</strong></div><progress max="100" value={score} aria-label="Overall compliance" /><p>{complianceStatus.replaceAll('_', ' ').toLowerCase()}</p></div>
            <div className="employee-progress-rows">{progressRows.map(row => <div key={row.label} className={'employee-progress-row ' + row.tone}><div><span>{row.label}</span><strong>{row.completed} / {row.total}</strong></div>{row.total > 0 ? <progress max={row.total} value={row.completed} aria-label={row.label} /> : <div className="employee-no-requirements">No current requirements</div>}</div>)}</div>
            <Link to="/my-progress" className="employee-progress-link">View detailed progress <span aria-hidden="true">?</span></Link>
          </div>
          <div className="employee-support"><Icon name="helpdesk" className="w-5 h-5" /><div><h3>Need a hand?</h3><p>Ask a security question or report a concern.</p><Link to="/helpdesk">Open the helpdesk <span aria-hidden="true">?</span></Link></div></div>
        </aside>
      </div>

      <section className="employee-shortcuts" aria-labelledby="employee-shortcuts-title"><div className="employee-shortcuts-heading"><h2 id="employee-shortcuts-title">Explore your security portal</h2><p>Everything you need to stay informed and prepared.</p></div>
        <div className="employee-shortcut-grid">{quickActions.map(action => <Link key={action.path} to={action.path} className="employee-shortcut"><span className="employee-shortcut-icon"><Icon name={action.icon} className="w-5 h-5" /></span><div><h3>{action.label}</h3><p>{action.desc}</p></div><span className="employee-shortcut-arrow" aria-hidden="true">?</span></Link>)}</div>
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
