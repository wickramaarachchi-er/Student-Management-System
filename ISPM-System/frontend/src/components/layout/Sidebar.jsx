/**
 * components/layout/Sidebar.jsx
 * Enterprise-grade Information Security Policy & Management System (ISPM) navigation sidebar.
 */
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { ROLE_NAV_ITEMS, ROLE_LABELS } from '../../utils/roles.js';
import Icon from '../common/Icon.jsx';
import './Sidebar.css';

export default function Sidebar({ onItemClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = (user?.role && ROLE_NAV_ITEMS[user.role]) || [];
  const roleLabel = (user?.role && ROLE_LABELS[user.role]) || 'User';
  const fullName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User' : 'User';
  const initials = `${user?.firstName?.charAt(0) || 'U'}${user?.lastName?.charAt(0) || ''}`;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const workspaces = {
    SYSTEM_ADMIN: { title: 'Administration', icon: 'lock' },
    COMPLIANCE_OFFICER: { title: 'Compliance', icon: 'shield-check' },
    TRAINING_ADMIN: { title: 'Training', icon: 'academic-cap' },
    EMPLOYEE: { title: 'Employee Workspace', icon: 'user-check' },
  };
  const workspace = workspaces[user?.role] || { title: 'Workspace', icon: 'shield' };
  const operationPaths = ['/helpdesk', '/notifications', '/audit-logs'];
  const groups = [
    { title: 'Workspace', items: navItems.filter((item) => !operationPaths.includes(item.path)) },
    { title: 'Operations', items: navItems.filter((item) => operationPaths.includes(item.path)) },
  ];
    return (
      <aside className="admin-sidebar" aria-label={`${roleLabel} sidebar`}>
        <Link to="/dashboard" onClick={onItemClick} className="admin-sidebar-brand" aria-label="CyberShield dashboard">
          <span className="admin-sidebar-logo"><Icon name="shield" className="w-6 h-6" /></span>
          <span><strong>CyberShield</strong><small>Security &amp; Compliance</small></span>
        </Link>
        <div className="admin-sidebar-workspace"><span className="admin-workspace-emblem"><Icon name={workspace.icon} className="w-4 h-4" /></span><div><strong>{workspace.title}</strong><span>{roleLabel}</span></div></div>
        <nav className="admin-sidebar-nav" aria-label="Sidebar Navigation">
          {groups.filter((group) => group.items.length > 0).map((group) => <div className="admin-nav-group" key={group.title}>
            <h2>{group.title}</h2>
            {group.items.map((item) => (
              <NavLink key={item.path} to={item.path} onClick={onItemClick} className={({ isActive }) => `admin-nav-item${isActive ? ' is-active' : ''}`}>
                {({ isActive }) => <><Icon name={item.icon} className="w-[18px] h-[18px]" /><span>{item.label}</span>{isActive && <span className="admin-nav-indicator" aria-hidden="true" />}</>}
              </NavLink>
            ))}
          </div>)}
        </nav>
        <div className="admin-sidebar-account">
          <div className="admin-sidebar-profile"><span className="admin-sidebar-avatar">{initials}</span><div><strong title={fullName}>{fullName}</strong><small title={user?.email}>{user?.email || roleLabel}</small></div></div>
          <button type="button" onClick={handleLogout} className="admin-sidebar-signout"><Icon name="logout" className="w-4 h-4" /><span>Sign out</span><span aria-hidden="true">&#8594;</span></button>
        </div>
      </aside>
    );
}

