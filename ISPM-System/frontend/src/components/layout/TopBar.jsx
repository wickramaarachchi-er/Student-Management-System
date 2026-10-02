/**
 * components/layout/TopBar.jsx
 * Top navigation bar with platform identity and notification shortcut.
 */
import { Link } from 'react-router-dom';
import Icon from '../common/Icon.jsx';

export default function TopBar({ onToggleMobileMenu }) {
  return (
    <header className="h-16 bg-[#040817]/95 backdrop-blur-md border-b border-[#122043] px-4 sm:px-8 flex items-center justify-between z-20 sticky top-0">
      {/* Left: Mobile Menu Toggle & Brand Context */}
      <div className="flex items-center gap-3.5">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          aria-label="Toggle navigation menu"
          className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          <Icon name="menu" className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex flex-col">
          <span className="text-[15px] font-bold text-white tracking-tight leading-none">
            Information Security Policy & Awareness Platform
          </span>
          <span className="text-xs text-slate-400 font-medium mt-1">
            Enterprise Compliance Portal
          </span>
        </div>
        <div className="sm:hidden">
          <span className="text-sm font-bold text-white">ISPM Platform</span>
        </div>
      </div>

      {/* Right: Notification Shortcut */}
      <div className="flex items-center gap-3">
        <Link
          to="/notifications"
          title="Notifications"
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700/60 transition-all relative focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Icon name="bell" className="w-5 h-5" />
        </Link>
      </div>
    </header>
  );
}

