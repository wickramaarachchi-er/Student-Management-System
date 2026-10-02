/**
 * components/layout/TopBar.jsx
 * Top navigation bar with platform identity and notification shortcut.
 */
import { Link } from 'react-router-dom';
import Icon from '../common/Icon.jsx';

export default function TopBar({ onToggleMobileMenu }) {
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

      {/* Right: Notification Shortcut */}
      <div className="flex items-center gap-3">
        <Link
          to="/notifications"
          title="Notifications"
          className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all relative focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Icon name="bell" className="w-5 h-5" />
        </Link>
      </div>
    </header>
  );
}

