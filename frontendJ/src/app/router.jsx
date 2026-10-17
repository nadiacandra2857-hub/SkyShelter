import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import ControlPage from '../pages/ControlPage';
import WeatherPage from '../pages/WeatherPage';
import HistoryPage from '../pages/HistoryPage';
import SettingsPage from '../pages/SettingsPage';
import NotFoundPage from '../pages/NotFoundPage';
import { useAuth } from '../context/AuthContext';
import LoadingState from '../components/common/LoadingState';

/**
 * Komponen pelindung rute yang mewajibkan autentikasi aktif
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-offwhite">
        <LoadingState message="Memvalidasi kredensial login..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export function AppRouter() {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes inside AppLayout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="control" element={<ControlPage />} />
        <Route path="weather" element={<WeatherPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default AppRouter;
