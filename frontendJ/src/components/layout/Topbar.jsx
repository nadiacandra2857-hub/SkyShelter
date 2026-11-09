import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Clock, User, LogOut, Radio } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWeatherTheme } from '../../context/WeatherThemeContext';
import { formatFullDate, formatTime } from '../../utils/formatDate';
import { USE_MOCK_DATA } from '../../services/apiClient';

export function Topbar() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme } = useWeatherTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header
      className={`sticky top-0 z-30 backdrop-blur-md border-b px-4 md:px-8 py-3.5 flex items-center justify-between transition-colors duration-500 ${
        theme.isDark
          ? 'bg-slate-950/80 border-slate-800 text-slate-100'
          : theme.id === 'sunny'
          ? 'bg-white/85 border-amber-200/80 text-charcoal'
          : theme.id === 'cloudy'
          ? 'bg-white/85 border-slate-200/80 text-charcoal'
          : 'bg-white/80 border-sky-100/80 text-charcoal'
      }`}
    >
      {/* Brand & Desktop Date */}
      <div className="flex items-center gap-3 md:gap-4">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-soft border ${
              theme.id === 'sunny'
                ? 'bg-amber-50 border-amber-200/80 text-amber-500'
                : theme.id === 'cloudy'
                ? 'bg-slate-100 border-slate-300 text-slate-700'
                : 'bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800/50 text-sky-500'
            }`}
          >
            <Shield
              className={`w-5 h-5 ${
                theme.id === 'sunny'
                  ? 'text-amber-500 fill-amber-500/10'
                  : theme.id === 'cloudy'
                  ? 'text-slate-700 fill-slate-700/10'
                  : 'text-sky-500 fill-sky-500/10'
              }`}
            />
          </div>
          <div>
            <h1 className={`text-sm font-bold leading-tight ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>
              SkyShelter
            </h1>
            <p className={`text-[10px] ${
              theme.isDark
                ? 'text-slate-400'
                : theme.id === 'sunny'
                ? 'text-amber-600 font-semibold'
                : theme.id === 'cloudy'
                ? 'text-slate-600 font-semibold'
                : 'text-sky-600 font-medium'
            }`}>
              Smart Roofing
            </p>
          </div>
        </div>

        {/* Live Date on Desktop */}
        <div
          className={`hidden md:flex items-center gap-2 text-xs pl-3 border-l ${
            theme.isDark
              ? 'border-slate-800 text-slate-400'
              : theme.id === 'sunny'
              ? 'border-amber-200 text-slate-500'
              : theme.id === 'cloudy'
              ? 'border-slate-200 text-slate-500'
              : 'border-sky-200/60 text-slate-500'
          }`}
        >
          <Clock className={`w-3.5 h-3.5 ${
            theme.id === 'sunny' ? 'text-amber-500' : theme.id === 'cloudy' ? 'text-slate-600' : 'text-sky-500'
          }`} />
          <span className={`font-medium ${theme.isDark ? 'text-slate-200' : 'text-charcoal'}`}>
            {formatFullDate(currentTime)}
          </span>
          <span>•</span>
          <span className={`font-mono font-semibold ${
            theme.isDark
              ? 'text-sky-400'
              : theme.id === 'sunny'
              ? 'text-amber-600'
              : theme.id === 'cloudy'
              ? 'text-slate-700'
              : 'text-sky-600'
          }`}>
            {formatTime(currentTime)} WIB
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 md:gap-3">


        {/* Profile Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            className={`flex items-center gap-2 p-1.5 md:px-3 md:py-1.5 rounded-xl transition-colors focus:ring-2 ${
              theme.id === 'cloudy'
                ? 'hover:bg-slate-100 dark:hover:bg-slate-800 focus:ring-slate-400'
                : theme.id === 'sunny'
                ? 'hover:bg-amber-50 dark:hover:bg-slate-800 focus:ring-amber-400'
                : 'hover:bg-sky-50 dark:hover:bg-slate-800 focus:ring-sky-500'
            }`}
            aria-expanded={profileOpen}
            aria-haspopup="true"
            aria-label="Menu Pengguna"
          >
            <div className={`w-8 h-8 rounded-full text-white flex items-center justify-center font-semibold text-xs shadow-soft ${
              theme.id === 'sunny'
                ? 'bg-amber-500 shadow-amber-500/20'
                : theme.id === 'cloudy'
                ? 'bg-slate-700 shadow-slate-900/20'
                : 'bg-sky-500 shadow-sky-100'
            }`}>
              {user?.username ? user.username.charAt(0).toUpperCase() : 'A'}
            </div>
            <span className={`hidden md:inline text-xs font-semibold ${theme.isDark ? 'text-white' : 'text-charcoal'}`}>
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
              <div
                className={`absolute right-0 mt-2 w-56 rounded-2xl py-2 z-50 animate-in fade-in zoom-in-95 shadow-soft-lg border ${
                  theme.isDark
                    ? 'bg-slate-900 border-slate-700 text-white shadow-2xl shadow-black/80'
                    : 'bg-white border-slate-200 text-charcoal'
                }`}
              >
                <div className={`px-4 py-2 border-b ${theme.isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                  <p className={`text-xs font-semibold ${theme.isDark ? 'text-white' : 'text-charcoal'}`}>{user?.username || 'Administrator'}</p>
                  <p className={`text-[11px] truncate ${theme.isDark ? 'text-slate-400' : 'text-muted-gray'}`}>{user?.email || 'admin@jemuran.local'}</p>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className={`w-full px-4 py-2 text-left text-xs text-soft-red flex items-center gap-2 transition-colors ${
                    theme.isDark ? 'hover:bg-red-950/40' : 'hover:bg-soft-red-light/50'
                  }`}
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
