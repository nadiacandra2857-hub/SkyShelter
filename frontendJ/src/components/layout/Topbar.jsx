import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Wifi, WifiOff, Clock, User, LogOut, Settings as SettingsIcon } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { formatFullDate, formatTime } from '../../utils/formatDate';

export function Topbar({ connectionStatus = 'online' }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { isMockMode, simulateRain, mockState } = useApp();
  const navigate = useNavigate();

  // Clock ticker per second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isOnline = connectionStatus === 'online';

  return (
    <header className="sticky top-0 z-30 bg-warm-offwhite/90 backdrop-blur-md border-b border-sage/20 px-4 md:px-8 py-3.5 flex items-center justify-between transition-colors">
      {/* Brand & Mobile Title */}
      <div className="flex items-center gap-3">
        <div className="md:hidden flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-forest-deep flex items-center justify-center text-sage">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-forest-deep leading-tight">SkyShelter</h1>
            <p className="text-[10px] text-muted-gray">Smart Roofing</p>
          </div>
        </div>

        {/* Live Date on Desktop */}
        <div className="hidden md:flex items-center gap-2 text-xs text-muted-gray">
          <Clock className="w-3.5 h-3.5 text-forest" />
          <span className="font-medium text-charcoal">{formatFullDate(currentTime)}</span>
          <span>•</span>
          <span className="font-mono text-forest-deep font-semibold">{formatTime(currentTime)} WIB</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Mock Mode Indicator */}
        {isMockMode && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-soft-amber-light border border-soft-amber/40 text-[11px] font-medium text-[#9A6B1A]">
            <span className="w-1.5 h-1.5 rounded-full bg-soft-amber animate-pulse" />
            <span>Simulasi Aktif</span>
          </div>
        )}

        {/* Device Connection Status */}
        <StatusBadge
          variant={isOnline ? 'success' : 'danger'}
          size="sm"
          pulse={isOnline}
          className="shadow-sm"
        >
          <span className="hidden sm:inline">ESP8266: </span>
          <span>{isOnline ? 'Online' : 'Offline'}</span>
        </StatusBadge>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1.5 md:px-3 md:py-1.5 rounded-xl hover:bg-sage/15 transition-colors focus:ring-2 focus:ring-forest"
            aria-expanded={profileOpen}
            aria-haspopup="true"
            aria-label="Menu Pengguna"
          >
            <div className="w-8 h-8 rounded-full bg-forest text-warm-offwhite flex items-center justify-center font-semibold text-xs shadow-soft">
              {user?.username ? user.username.charAt(0).toUpperCase() : 'A'}
            </div>
            <span className="hidden md:inline text-xs font-semibold text-charcoal">
              {user?.username || 'Admin'}
            </span>
          </button>

          {profileOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setProfileOpen(false)}
                aria-hidden="true"
              />
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-soft-lg border border-sage/30 py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-4 py-2 border-b border-sage/15">
                  <p className="text-xs font-semibold text-charcoal">{user?.username || 'Administrator'}</p>
                  <p className="text-[11px] text-muted-gray truncate">{user?.email || 'admin@jemuran.local'}</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    navigate('/settings');
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-charcoal hover:bg-warm-surface flex items-center gap-2 transition-colors"
                >
                  <SettingsIcon className="w-3.5 h-3.5 text-muted-gray" />
                  <span>Pengaturan Sistem</span>
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-xs text-soft-red hover:bg-soft-red-light/50 flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar (Logout)</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Topbar;
