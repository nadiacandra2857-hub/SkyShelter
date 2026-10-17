import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import BottomNavigation from './BottomNavigation';
import ToastContainer from '../common/Toast';
import { useApp } from '../../context/AppContext';

export function AppLayout() {
  const { mockState, isMockMode } = useApp();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-warm-offwhite flex flex-col md:flex-row text-charcoal">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-8">
        <Topbar connectionStatus={mockState?.connection_status || 'online'} />

        {/* Mock Mode Notice Banner (Subtle & informative) */}
        {isMockMode && (
          <div className="bg-soft-amber-light border-b border-soft-amber/30 px-4 md:px-8 py-2 text-xs text-[#9A6B1A] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Mode Simulasi Aktif:</span>
              <span className="hidden sm:inline">
                Aplikasi berjalan mandiri tanpa memerlukan backend fisik atau broker MQTT.
              </span>
            </div>
            <span className="text-[11px] font-mono opacity-80">VITE_USE_MOCK_DATA=true</span>
          </div>
        )}

        {/* Page Content Outlet */}
        <main className="flex-1 px-4 md:px-8 py-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNavigation />

      {/* Global Toast Container */}
      <ToastContainer />
    </div>
  );
}

export default AppLayout;
