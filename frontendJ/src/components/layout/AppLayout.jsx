import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import ToastContainer from '../common/Toast';
import ErrorBoundary from '../common/ErrorBoundary';
import { useWeatherTheme } from '../../context/WeatherThemeContext';

export function AppLayout() {
  const { theme } = useWeatherTheme();

  return (
    <div
      className={`min-h-screen flex flex-col relative transition-colors duration-500 ${
        theme.pageBg
      } ${theme.isDark ? 'text-slate-100' : 'text-charcoal'}`}
    >
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-28 sm:pb-32">
        <Topbar />

        {/* Page Content Outlet */}
        <main className="flex-1 px-4 md:px-8 py-6 max-w-7xl w-full mx-auto">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>

      {/* Floating Bottom Dynamic Island Navigation */}
      <Sidebar />

      {/* Global Toast Container */}
      <ToastContainer />
    </div>
  );
}

export default AppLayout;
