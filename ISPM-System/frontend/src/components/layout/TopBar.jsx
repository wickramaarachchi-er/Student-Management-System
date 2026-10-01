/**
 * components/layout/TopBar.jsx
 * Top navigation bar with user profile, role display, notification link, and sign-out control.
 */
import { useNavigate, Link } from 'react-router-dom';
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
  const roleBadgeStyle = (user?.role && ROLE_BADGE_STYLES[user.role]) || 'bg-slate-800 text-slate-300 border-slate-700';
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'User';

  return (
    <header className="h-16 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between z-20 sticky top-0">
      {/* Left: Mobile Menu Toggle & Brand Context */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          aria-label="Toggle navigation menu"
          className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          <Icon name="menu" className="w-6 h-6" />
        </button>

        <div className="hidden md:flex flex-col">
          <span className="text-sm font-bold text-slate-100 tracking-tight leading-none">
            Information Security Policy & Awareness Platform
          </span>
          <span className="text-[11px] text-slate-400 font-medium mt-0.5">
            Enterprise Compliance Portal
          </span>
        </div>
        <div className="md:hidden">
          <span className="text-sm font-bold text-slate-100">ISPM Platform</span>
        </div>
      </div>

      {/* Right: Notification shortcut, User Profile & Sign out */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Notification Bell Shortcut */}
        <Link
          to="/notifications"
          title="Notifications"
          className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all relative focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Icon name="bell" className="w-5 h-5" />
        </Link>

        <div className="h-5 w-px bg-slate-800" />

        {/* User Info */}
        <div className="flex items-center gap-3 text-right">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs font-bold text-slate-100 leading-tight">
              {fullName}
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              {user?.department && (
                <span className="text-[11px] text-slate-400 font-medium">
                  {user.department}
                </span>
              )}
              <span className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold ${roleBadgeStyle}`}>
                {roleLabel}
              </span>
            </div>
          </div>

          {/* User Avatar Circle */}
          <div className="w-9 h-9 rounded-full bg-blue-600/20 border border-blue-500/40 text-blue-300 font-bold text-xs flex items-center justify-center shadow-inner shrink-0">
            {user?.firstName?.charAt(0) || 'U'}
            {user?.lastName?.charAt(0) || ''}
          </div>
        </div>

        <div className="h-5 w-px bg-slate-800" />

        {/* Sign out Button */}
        <button
          type="button"
          onClick={handleLogout}
          title="Sign out of the system"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-rose-200 hover:bg-rose-950/50 border border-slate-800 hover:border-rose-800/60 transition-all focus:outline-none focus:ring-2 focus:ring-rose-500"
        >
          <Icon name="logout" className="w-4 h-4 text-slate-400 group-hover:text-rose-400" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
