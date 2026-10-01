/**
 * components/layout/TopBar.jsx
 * Top navigation bar with user profile display and logout control.
 */
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { ROLE_LABELS, ROLE_BADGE_STYLES } from '../../utils/roles.js';
import Icon from '../common/Icon.jsx';

export default function TopBar({ onToggleMobileMenu }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const roleLabel = (user?.role && ROLE_LABELS[user.role]) || user?.role || 'User';
  const roleBadgeStyle = (user?.role && ROLE_BADGE_STYLES[user.role]) || 'bg-slate-800 text-slate-300';
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'User';

  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur-sm border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between z-10 sticky top-0">
      {/* Left: Mobile Menu Toggle & Brand context */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          aria-label="Toggle navigation menu"
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Icon name="menu" className="w-6 h-6" />
        </button>

        <div className="hidden sm:block">
          <span className="text-sm font-semibold text-slate-200">
            Information Security Policy Awareness & Management System
          </span>
        </div>
        <div className="sm:hidden">
          <span className="text-sm font-semibold text-slate-200">ISPM System</span>
        </div>
      </div>

      {/* Right: User Profile & Logout */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* User Info (hidden on very small screens, responsive) */}
        <div className="flex items-center gap-3 text-right">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-semibold text-slate-100 leading-tight">
              {fullName}
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              {user?.department && (
                <span className="text-xs text-slate-400">
                  {user.department}
                </span>
              )}
              <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${roleBadgeStyle}`}>
                {roleLabel}
              </span>
            </div>
          </div>

          {/* User Avatar Circle */}
          <div className="w-9 h-9 rounded-full bg-blue-600/20 border border-blue-500/40 text-blue-300 font-semibold text-sm flex items-center justify-center">
            {user?.firstName?.charAt(0) || 'U'}
            {user?.lastName?.charAt(0) || ''}
          </div>
        </div>

        <div className="h-6 w-px bg-slate-800" />

        {/* Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          title="Sign out of the system"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-red-950/40 hover:border-red-800/50 border border-transparent transition-all focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <Icon name="logout" className="w-4 h-4 text-slate-400 group-hover:text-red-400" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
