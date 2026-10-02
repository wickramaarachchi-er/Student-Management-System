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

  if (user?.role === 'SYSTEM_ADMIN') {
    const groups = [
      { title: 'Workspace', paths: ['/dashboard', '/users'] },
      { title: 'Operations', paths: ['/helpdesk', '/notifications', '/audit-logs'] },
    ];

    return (
      <aside className="admin-sidebar" aria-label="Administration sidebar">
        <Link to="/dashboard" onClick={onItemClick} className="admin-sidebar-brand" aria-label="ISPM dashboard">
          <span className="admin-sidebar-logo"><Icon name="shield" className="w-6 h-6" /></span>
          <span><strong>ISPM<span className="admin-brand-dot">.</span></strong><small>Security &amp; Compliance</small></span>
        </Link>
        <div className="admin-sidebar-workspace"><span className="admin-workspace-emblem"><Icon name="lock" className="w-4 h-4" /></span><div><strong>Administration</strong><span>System administrator</span></div></div>
        <nav className="admin-sidebar-nav" aria-label="Sidebar Navigation">
          {groups.map((group) => <div className="admin-nav-group" key={group.title}>
            <h2>{group.title}</h2>
            {navItems.filter((item) => group.paths.includes(item.path)).map((item) => (
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

  return (
    <aside className="w-[260px] bg-slate-950 border-r border-slate-800 flex flex-col h-full select-none">
      {/* Brand / Logo Area */}
      <div className="h-20 flex items-center gap-3.5 px-5 border-b border-slate-800/80 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-950/40 shrink-0">
          <Icon name="shield" className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-[17px] text-white tracking-tight leading-tight truncate">
            ISPM
          </span>
          <span className="text-xs text-slate-400 font-normal leading-tight truncate mt-0.5">
            Security & Compliance
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav aria-label="Sidebar Navigation" className="flex-1 overflow-y-auto px-3.5 pt-5 pb-4 space-y-1.5">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onItemClick}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 px-3.5 h-11 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 ${
                isActive
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100 border border-transparent'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`w-5 h-5 flex items-center justify-center shrink-0 transition-colors ${
                    isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                >
                  <Icon name={item.icon} className="w-[18px] h-[18px]" />
                </span>
                <span className="truncate flex-1">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom User Account & Sign Out Area */}
      <div className="p-4 border-t border-slate-800/80 shrink-0 bg-slate-950">
        <div className="flex items-center gap-3 px-1">
          <div className="w-9 h-9 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-300 font-semibold text-xs flex items-center justify-center shadow-inner shrink-0">
            {initials}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-medium text-slate-200 truncate leading-snug">
              {fullName}
            </span>
            <span className="text-xs text-slate-500 truncate leading-tight mt-0.5">
              {roleLabel}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full h-10 px-3 rounded-lg text-sm font-medium text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors flex items-center gap-2.5 mt-3 focus:outline-none focus:ring-2 focus:ring-rose-500/40"
        >
          <Icon name="logout" className="w-4 h-4 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}


