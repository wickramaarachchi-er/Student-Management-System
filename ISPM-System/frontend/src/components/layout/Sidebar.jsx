/**
 * components/layout/Sidebar.jsx
 * Role-aware navigation sidebar with enterprise security aesthetic.
 */
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { ROLE_LABELS, ROLE_NAV_ITEMS, ROLE_BADGE_STYLES } from '../../utils/roles.js';
import Icon from '../common/Icon.jsx';

export default function Sidebar({ onItemClick }) {
  const { user } = useAuth();
  const navItems = (user?.role && ROLE_NAV_ITEMS[user.role]) || [];
  const roleLabel = (user?.role && ROLE_LABELS[user.role]) || user?.role || 'User';
  const roleBadgeStyle = (user?.role && ROLE_BADGE_STYLES[user.role]) || 'bg-slate-800 text-slate-300 border-slate-700';

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-800 bg-slate-900/90">
        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-900/40 shrink-0">
          <Icon name="shield" className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-sm text-slate-100 tracking-tight leading-snug truncate">ISPM Enterprise</span>
          <span className="text-[11px] text-slate-400 font-medium leading-tight truncate">Policy & Compliance</span>
        </div>
      </div>

      {/* Role Indicator Card */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-950/40">
        <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">
          Active Workspace
        </div>
        <div className={`text-xs px-3 py-1.5 rounded-lg border font-semibold inline-flex items-center gap-1.5 w-full justify-center ${roleBadgeStyle}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
          {roleLabel}
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Main Navigation
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onItemClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-950 border border-blue-500/30'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`
            }
          >
            <Icon name={item.icon} className="w-4 h-4 flex-shrink-0" />
            <span className="truncate flex-1">{item.label}</span>
          </NavLink>
        ))}
      </div>

      {/* Footer Status */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/50 text-xs text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-2 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          System Operational
        </span>
        <span className="text-[11px] font-mono text-slate-500 bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/50">v1.0</span>
      </div>
    </aside>
  );
}
