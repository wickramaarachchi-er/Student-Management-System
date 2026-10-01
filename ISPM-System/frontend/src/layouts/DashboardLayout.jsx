/**
 * layouts/DashboardLayout.jsx
 * Unified dashboard shell containing responsive sidebar, header, and content area.
 */
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar.jsx';
import TopBar from '../components/layout/TopBar.jsx';
import Icon from '../components/common/Icon.jsx';

export default function DashboardLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <div className="flex flex-1 min-h-screen">
        {/* Desktop Sidebar (hidden on mobile/tablet, visible on lg screens) */}
        <div className="hidden lg:block lg:flex-shrink-0">
          <Sidebar />
        </div>

        {/* Mobile / Tablet Drawer Overlay & Sidebar */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Slide-out Sidebar Panel */}
            <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-slate-900 shadow-2xl flex flex-col z-10">
              <div className="p-3 border-b border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
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

        {/* Main Content Column */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TopBar onToggleMobileMenu={() => setMobileMenuOpen(true)} />

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-950">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
