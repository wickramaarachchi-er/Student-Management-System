/**
 * layouts/DashboardLayout.jsx
 * Unified dashboard shell containing responsive sidebar, header, and content area.
 */
import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import Sidebar from '../components/layout/Sidebar.jsx';
import TopBar from '../components/layout/TopBar.jsx';
import Icon from '../components/common/Icon.jsx';
import '../pages/ComplianceOfficerPages.css';

export default function DashboardLayout() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const isAdminOverview = user?.role === 'SYSTEM_ADMIN' && ['/dashboard', '/users'].includes(pathname);
  const isAdminHelpdesk = user?.role === 'SYSTEM_ADMIN' && pathname === '/helpdesk';
  const isAdminActivity = user?.role === 'SYSTEM_ADMIN' && ['/notifications', '/audit-logs'].includes(pathname);
  const isComplianceWorkspace = user?.role === 'COMPLIANCE_OFFICER' && ['/dashboard', '/policies', '/compliance', '/reports', '/audit-logs', '/notifications', '/profile'].includes(pathname);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className={`h-screen w-screen bg-[#030712] text-slate-100 flex overflow-hidden font-sans${isComplianceWorkspace ? ' compliance-workspace-shell' : ''}`}>
      {/* Desktop Sidebar (Fixed & Stable, 100% viewport height, never scrolls away) */}
      <div className="hidden lg:flex lg:flex-shrink-0 h-screen sticky top-0 z-30">
        <Sidebar />
      </div>

      {/* Mobile / Tablet Drawer Overlay & Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Slide-out Sidebar Panel */}
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-[#040817] shadow-2xl flex flex-col z-10 border-r border-[#142347]">
            <div className="p-3 border-b border-[#142347] flex justify-end">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 focus:outline-none"
                aria-label="Close navigation"
              >
                <Icon name="close" className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <Sidebar onItemClick={() => setMobileMenuOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Column (Scrolls independently while sidebar stays stable) */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <TopBar onToggleMobileMenu={() => setMobileMenuOpen(true)} />

        <main className={`flex-1 overflow-y-auto px-6 py-8 sm:px-10 sm:py-9 lg:px-12 lg:py-10 ${isComplianceWorkspace ? 'compliance-workspace-main' : 'bg-[#030712]'}`}>
          <div className={`max-w-[1550px] w-full mx-auto pb-16 ${isComplianceWorkspace ? 'compliance-officer-pages' : ''}`}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
