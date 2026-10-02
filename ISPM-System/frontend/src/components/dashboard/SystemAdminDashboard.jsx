import { Link } from 'react-router-dom';
import Icon from '../common/Icon.jsx';
import './SystemAdminDashboard.css';

const readable = (value = '') => value.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
const dateLabel = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};
const roles = [
  ['EMPLOYEE', 'Employees', '#6366f1'],
  ['SYSTEM_ADMIN', 'System administrators', '#14b8a6'],
  ['COMPLIANCE_OFFICER', 'Compliance officers', '#f59e0b'],
  ['TRAINING_ADMIN', 'Training administrators', '#a78bfa'],
];

export default function SystemAdminDashboard({ data }) {
  const { metrics = {}, recentHelpdeskTickets = [], recentSystemActivity = [] } = data || {};
  const { totalUsers = 0, activeUsers = 0, inactiveUsers = 0, usersByRole = {}, openHelpdeskTickets = 0,
    inProgressHelpdeskTickets = 0, unresolvedHelpdeskCount = 0, unreadNotificationCount = 0 } = metrics;
  const activeRate = totalUsers ? Math.min(100, Math.round(activeUsers / totalUsers * 100)) : 0;
  const roleTotal = roles.reduce((sum, [key]) => sum + (usersByRole[key] || 0), 0);
  let offset = 0;
  const segments = roles.map(([key, , color]) => {
    const start = offset;
    offset += roleTotal ? (usersByRole[key] || 0) / roleTotal * 100 : 0;
    return `${color} ${start}% ${offset}%`;
  });
  const cards = [
    { title: 'Total users', value: totalUsers, detail: `${inactiveUsers} inactive accounts`, icon: 'users', path: '/users', tone: 'indigo' },
    { title: 'Active accounts', value: activeUsers, detail: `${activeRate}% of all accounts`, icon: 'user-check', path: '/users', tone: 'teal' },
    { title: 'Support queue', value: unresolvedHelpdeskCount, detail: `${openHelpdeskTickets} open · ${inProgressHelpdeskTickets} in progress`, icon: 'helpdesk', path: '/helpdesk', tone: 'amber' },
    { title: 'Unread notifications', value: unreadNotificationCount, detail: unreadNotificationCount ? 'Your inbox needs a look' : 'You’re all caught up', icon: 'bell', path: '/notifications', tone: 'violet' },
  ];

  return (
    <div className="admin-overview">
      <section className="admin-stats" aria-label="Administration metrics">
        {cards.map((card) => <Link className={`admin-stat ${card.tone}`} to={card.path} key={card.title}>
          <div className="admin-stat-top"><span>{card.title}</span><span className="admin-icon"><Icon name={card.icon} className="w-5 h-5" /></span></div>
          <strong>{card.value.toLocaleString()}</strong><div className="admin-stat-bottom"><span>{card.detail}</span><span aria-hidden="true">&#8599;</span></div>
        </Link>)}
      </section>

      <div className="admin-middle">
        <section className="admin-panel">
          <div className="admin-panel-heading"><div><h2>Account distribution</h2><p>A clear view of access across your organization</p></div><Link to="/users">Manage users &#8599;</Link></div>
          <div className="admin-distribution">
            <div className="admin-donut" role="img" aria-label={`Role distribution: ${roles.map(([key, label]) => `${label}: ${usersByRole[key] || 0}`).join(', ')}`} style={{ background: roleTotal ? `conic-gradient(${segments.join(', ')})` : '#e2e8f0' }}><div><strong>{totalUsers}</strong><span>Total users</span></div></div>
            <div className="admin-role-list">{roles.map(([key, label, color]) => <div className="admin-role" key={key}><span className="admin-role-dot" style={{ background: color }} /><span>{label}</span><strong>{usersByRole[key] || 0}</strong><small>{roleTotal ? Math.round((usersByRole[key] || 0) / roleTotal * 100) : 0}%</small></div>)}</div>
          </div>
          <div className="admin-account-foot"><span><i />Active accounts</span><strong>{activeUsers} of {totalUsers}</strong><div className="admin-progress"><span style={{ width: `${activeRate}%` }} /></div></div>
        </section>
        <section className="admin-workspace">
          <span className="admin-eyebrow">YOUR WORKSPACE</span><h2>Keep things moving.</h2><p>Manage access, follow up on requests, and stay on top of system activity.</p>
          <Link className="admin-primary" to="/users"><Icon name="users" className="w-4 h-4" />Manage user accounts<span aria-hidden="true">&#8599;</span></Link>
          <Link className="admin-workspace-link" to="/helpdesk"><Icon name="helpdesk" className="w-4 h-4" /><span>Review support requests</span><b>{unresolvedHelpdeskCount}</b></Link>
          <Link className="admin-workspace-link" to="/audit-logs"><Icon name="shield-check" className="w-4 h-4" /><span>Explore audit logs</span><span aria-hidden="true">&#8599;</span></Link>
        </section>
      </div>

      <div className="admin-bottom">
        <section className="admin-panel">
          <div className="admin-panel-heading"><div><h2>Recent support tickets</h2><p>The latest requests from your team</p></div><Link to="/helpdesk">View all &#8599;</Link></div>
          {recentHelpdeskTickets.length ? <div className="admin-ticket-list">{recentHelpdeskTickets.slice(0, 5).map((ticket) => <Link to="/helpdesk" className="admin-ticket" key={ticket.id}>
            <span className={`admin-ticket-icon ${['HIGH', 'CRITICAL'].includes(ticket.priority) ? 'urgent' : ''}`}><Icon name="helpdesk" className="w-4 h-4" /></span>
            <div className="admin-ticket-copy"><h3>{ticket.subject || 'Support request'}</h3><p>{[ticket.creator?.firstName, ticket.creator?.lastName].filter(Boolean).join(' ') || ticket.creator?.email || 'User'} <span>· {dateLabel(ticket.createdAt)}</span></p><small>{readable(ticket.priority || 'LOW')} priority</small></div>
            <span className={`admin-badge ${ticket.status === 'OPEN' ? 'pending' : ticket.status === 'IN_PROGRESS' ? 'progress' : 'resolved'}`}>{readable(ticket.status || 'OPEN')}</span>
          </Link>)}</div> : <div className="admin-empty"><Icon name="helpdesk" className="w-8 h-8" /><h3>No recent tickets</h3><p>New support requests will appear here.</p></div>}
        </section>
        <section className="admin-panel">
          <div className="admin-panel-heading"><div><h2>System activity</h2><p>Recent events from the audit trail</p></div><Link to="/audit-logs">View all &#8599;</Link></div>
          {recentSystemActivity.length ? <ol className="admin-activity">{recentSystemActivity.slice(0, 5).map((event) => <li key={event.id}><span className={`admin-event-dot ${event.action?.includes('FAILED') ? 'failed' : ''}`} /><div><div className="admin-event-title"><h3>{readable(event.action || 'System event')}</h3><time dateTime={event.createdAt}>{dateLabel(event.createdAt)}</time></div><p>{event.description || 'System event recorded'}</p><small>{event.userEmail || 'System'}</small></div></li>)}</ol> : <div className="admin-empty"><Icon name="shield-check" className="w-8 h-8" /><h3>No recent activity</h3><p>Recorded system events will appear here.</p></div>}
        </section>
      </div>
      <div className="admin-footer"><span>ISPM / Administration overview</span><span>Account access · Support · Audit trail</span></div>
    </div>
  );
}
