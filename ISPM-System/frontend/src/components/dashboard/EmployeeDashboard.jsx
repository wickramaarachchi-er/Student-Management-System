import { Link } from 'react-router-dom';
import Icon from '../common/Icon.jsx';
import './EmployeeDashboard.css';


export default function EmployeeDashboard({ data }) {
  const { metrics = {}, attentionItems = [] } = data || {};
  const { policiesRequiringAcknowledgement = 0, acknowledgedPolicyCount = 0,
    trainingCompletedCount = 0, trainingInProgressCount = 0, trainingNotStartedCount = 0,
    quizzesPassed = 0, quizzesOutstanding = 0, ownCompliancePercentage = 0,
    complianceStatus = 'PARTIALLY_COMPLIANT' } = metrics;
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
  const quickActions = [
    { label: 'Security policies', desc: 'Review and acknowledge required policies', icon: 'book', path: '/policies' },
    { label: 'Awareness training', desc: 'Complete your assigned learning modules', icon: 'academic-cap', path: '/training' },
    { label: 'Knowledge quizzes', desc: 'Check your understanding of security topics', icon: 'clipboard-list', path: '/quizzes' },
    { label: 'My progress', desc: 'Review your completion and compliance status', icon: 'award', path: '/my-progress' },
    { label: 'Security helpdesk', desc: 'Ask a question or report a concern', icon: 'helpdesk', path: '/helpdesk' },
    { label: 'Notifications', desc: 'Read reminders and security alerts', icon: 'bell', path: '/notifications' },
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
      </section>
    </div>
  );
}
