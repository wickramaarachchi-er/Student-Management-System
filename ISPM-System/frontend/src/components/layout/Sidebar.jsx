/**
 * components/layout/Sidebar.jsx
 * Role-aware navigation sidebar.
 * Displays navigation items tailored specifically to the user's role.
 */
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { ROLE_LABELS, ROLE_NAV_ITEMS, ROLE_BADGE_STYLES } from '../../utils/roles.js';
import Icon from '../common/Icon.jsx';

export default function Sidebar({ onItemClick }) {
  const { user } = useAuth();
  const navItems = (user?.role && ROLE_NAV_ITEMS[user.role]) || [];
  const roleLabel = (user?.role && ROLE_LABELS[user.role]) || user?.role || 'User';
  const roleBadgeStyle = (user?.role && ROLE_BADGE_STYLES[user.role]) || 'bg-slate-800 text-slate-300';

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-800">
        <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-900/40">
          <Icon name="shield-check" className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-base text-slate-100 tracking-tight leading-tight">ISPM System</span>
          <span className="text-[11px] text-slate-400 font-medium leading-tight">Policy & Awareness</span>
        </div>
      </div>

      {/* User Role Card */}
      <div className="p-4 border-b border-slate-800/60 bg-slate-950/30">
        <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1.5">Active Role</div>
        <div className={`text-xs px-2.5 py-1.5 rounded-md border font-medium inline-block w-full text-center ${roleBadgeStyle}`}>
          {roleLabel}
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Navigation
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onItemClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-950'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`
            }
          >
            <Icon name={item.icon} className="w-4 h-4 flex-shrink-0" />
            <span className="truncate flex-1">{item.label}</span>
            {!['/dashboard', '/users', '/policies', '/training', '/training-progress', '/my-progress'].includes(item.path) && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/50 font-normal">
                Soon
              </span>
            )}
          </NavLink>
        ))}
      </div>

      {/* Footer System Status */}
      <div className="p-3 border-t border-slate-800 text-xs text-slate-500 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          System Online
        </span>
        <span className="text-[11px] font-mono text-slate-600">v0.1.0</span>
      </div>
    </aside>
  );
}
