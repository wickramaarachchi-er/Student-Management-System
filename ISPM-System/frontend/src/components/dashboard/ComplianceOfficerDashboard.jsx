import { Link } from 'react-router-dom';
import Icon from '../common/Icon.jsx';
import './ComplianceOfficerDashboard.css';

const dateLabel = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function ComplianceOfficerDashboard({ data }) {
  const { metrics = {}, recentPolicies = [] } = data || {};
  const { activeEmployees = 0, fullyCompliantEmployees = 0, partiallyCompliantEmployees = 0,
    nonCompliantEmployees = 0, averageCompliancePercentage = 0, categorySummaries = {},
    activePublishedPolicies = 0, draftPolicies = 0, policiesRequiringAcknowledgement = 0 } = metrics;
  const cards = [
    { title: 'Monitored employees', value: activeEmployees, detail: 'Active workforce', icon: 'users', tone: 'indigo', path: '/compliance' },
    { title: 'Average compliance', value: `${averageCompliancePercentage}%`, detail: `${fullyCompliantEmployees} fully compliant`, icon: 'award', tone: 'teal', path: '/compliance' },
    { title: 'Needs attention', value: partiallyCompliantEmployees + nonCompliantEmployees, detail: `${partiallyCompliantEmployees} partial · ${nonCompliantEmployees} non-compliant`, icon: 'shield-check', tone: 'amber', path: '/compliance' },
    { title: 'Published policies', value: activePublishedPolicies, detail: `${policiesRequiringAcknowledgement} need acknowledgements`, icon: 'book', tone: 'violet', path: '/policies' },
  ];
  const categories = [
    ['policy', 'Policy acknowledgements', '#14b8a6'],
    ['training', 'Awareness training', '#6366f1'],
    ['quiz', 'Quiz assessments', '#a78bfa'],
  ];
  let offset = 0;
  const segments = categories.map(([key, , color]) => {
    const start = offset;
    offset += categorySummaries[key]?.totalRequirements ? categorySummaries[key].completed / categorySummaries[key].totalRequirements * 100 : 0;
    return `${color} ${start}% ${offset}%`;
  });
  const score = Math.round(averageCompliancePercentage);

  return <div className="compliance-overview">
    <section className="compliance-stats" aria-label="Compliance metrics">
      {cards.map((card) => <Link className={`compliance-stat ${card.tone}`} to={card.path} key={card.title}>
        <div className="compliance-stat-top"><span>{card.title}</span><span className="compliance-icon"><Icon name={card.icon} className="w-5 h-5" /></span></div>
        <strong>{card.value}</strong><div className="compliance-stat-bottom"><span>{card.detail}</span><span aria-hidden="true">↗</span></div>
      </Link>)}
    </section>

    <div className="compliance-middle">
      <section className="compliance-panel">
        <div className="compliance-panel-heading"><div><h2>Organization compliance</h2><p>Progress across your core security requirements</p></div><Link to="/compliance">View breakdown ↗</Link></div>
        <div className="compliance-distribution">
          <div className="compliance-donut" role="img" aria-label={`Average compliance ${score}%`} style={{ background: `conic-gradient(#14b8a6 0 ${score}%, #e9edf5 ${score}% 100%)` }}><div><strong>{score}%</strong><span>Average score</span></div></div>
          <div className="compliance-category-list">{categories.map(([key, label, color]) => {
            const summary = categorySummaries[key] || {};
            const percentage = Math.min(100, Math.max(0, summary.percentage || 0));
            return <div className="compliance-category" key={key}><div className="compliance-category-label"><span><i style={{ background: color }} />{label}</span><strong>{percentage}%</strong></div><div className="compliance-progress"><span style={{ width: `${percentage}%`, background: color }} /></div><small>{summary.completed || 0} of {summary.totalRequirements || 0} requirements complete</small></div>;
          })}</div>
        </div>
        <div className="compliance-panel-foot"><span>Workforce status</span><strong>{fullyCompliantEmployees} compliant</strong><span>{partiallyCompliantEmployees} partial</span><span>{nonCompliantEmployees} non-compliant</span></div>
      </section>
      <section className="compliance-workspace">
        <span className="compliance-eyebrow">COMPLIANCE WORKSPACE</span><h2>Keep your organization audit ready.</h2><p>Review employee evidence, manage policy governance, and share clear compliance reports.</p>
        <Link className="compliance-primary" to="/compliance"><Icon name="award" className="w-4 h-4" />Open compliance portal<span aria-hidden="true">↗</span></Link>
        <Link className="compliance-workspace-link" to="/reports"><Icon name="chart" className="w-4 h-4" /><span>View executive reports</span><span aria-hidden="true">↗</span></Link>
        <Link className="compliance-workspace-link" to="/policies"><Icon name="book" className="w-4 h-4" /><span>Manage security policies</span><b>{draftPolicies} drafts</b></Link>
      </section>
    </div>

    <section className="compliance-panel compliance-policy-panel">
      <div className="compliance-panel-heading"><div><h2>Recent policy updates</h2><p>Latest changes in your security governance library</p></div><Link to="/policies">Manage policies ↗</Link></div>
      {recentPolicies.length ? <div className="compliance-policy-list">{recentPolicies.slice(0, 5).map((policy) => <Link to="/policies" className="compliance-policy" key={policy.id}>
        <span className="compliance-policy-icon"><Icon name="book" className="w-4 h-4" /></span><div><h3>{policy.title}</h3><p>{policy.category || 'General'} · {policy.targetDepartment || 'All departments'}</p></div><span className={`compliance-badge ${policy.status === 'PUBLISHED' ? 'published' : 'draft'}`}>{policy.status === 'PUBLISHED' ? 'Published' : (policy.status || 'Draft').toLowerCase()}</span><time>{dateLabel(policy.updatedAt)}</time>
      </Link>)}</div> : <div className="compliance-empty"><Icon name="book" className="w-8 h-8" /><h3>No policy updates yet</h3><p>Recent changes to your policy library will appear here.</p></div>}
    </section>
    <div className="compliance-footer"><span>CyberShield / Compliance overview</span><span>Employee evidence · Policy governance · Reporting</span></div>
  </div>;
}
