/**
 * components/layout/TopBar.jsx
 * Top navigation bar with platform identity and notification shortcut.
 */
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getUnreadCountRequest } from '../../services/notification.service.js';
import Icon from '../common/Icon.jsx';
import { useAuth } from '../../hooks/useAuth.js';

export default function TopBar({ onToggleMobileMenu }) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let active = true;
    let refreshing = false;
    setUnreadCount(0);
    const refreshUnreadCount = async () => {
      if (!user?.id || refreshing) return;
      refreshing = true;
      try {
        const response = await getUnreadCountRequest();
        if (active && response.ok && response.data?.success) {
          setUnreadCount(response.data.data.unreadCount || 0);
        }
      } catch {
        // Keep the last known count when the network is temporarily unavailable.
      } finally {
        refreshing = false;
      }
    };
    refreshUnreadCount();
    const interval = window.setInterval(refreshUnreadCount, 30000);
    window.addEventListener('focus', refreshUnreadCount);
    window.addEventListener('notifications-updated', refreshUnreadCount);
    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener('focus', refreshUnreadCount);
      window.removeEventListener('notifications-updated', refreshUnreadCount);
    };
  }, [user?.id, pathname]);

  const notificationLabel = unreadCount > 0
    ? 'Notifications (' + unreadCount + ' unread)'
    : 'Notifications';
  const isComplianceOfficer = user?.role === 'COMPLIANCE_OFFICER';
  return (
    <header className={`portal-topbar ${isComplianceOfficer ? 'compliance-topbar' : ''} h-16 bg-[#040817]/95 backdrop-blur-md border-b border-[#122043] px-4 sm:px-8 flex items-center justify-between z-20 sticky top-0`}>
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
            CyberShield
          </span>
          <span className="text-xs text-slate-400 font-medium mt-1">
            Security &amp; Compliance Portal
          </span>
        </div>
        <div className="sm:hidden">
          <span className="text-sm font-bold text-white">CyberShield</span>
        </div>
      </div>

      {/* Right: Notification Shortcut */}
      <div className="flex items-center gap-3">
        <Link to="/profile" title="My profile" aria-label="My profile" className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <Icon name="user-check" className="w-5 h-5" />
        </Link>
        <Link
          to="/notifications"
          title={notificationLabel}
          aria-label={notificationLabel}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700/60 transition-all relative focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Icon name="bell" className="w-5 h-5" />
          {unreadCount > 0 && (
            <span aria-hidden="true" className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-[#040817]" />
          )}
        </Link>
      </div>
    </header>
  );
}

