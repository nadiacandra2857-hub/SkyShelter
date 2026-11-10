import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Sliders,
  CloudRain,
  History,
  Settings,
  Droplets,
  Sun,
  Cloud,
  CloudLightning,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useWeatherTheme } from '../../context/WeatherThemeContext';

export function Sidebar() {
  const { mockState } = useApp();
  const { activeCondition } = useWeatherTheme();
  const isSunny = activeCondition === 'sunny';
  const isCloudy = activeCondition === 'cloudy';

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/control', label: 'Kendali', icon: Sliders },
    { to: '/weather', label: 'Cuaca', icon: CloudRain },
    { to: '/history', label: 'Riwayat', icon: History },
    { to: '/settings', label: 'Setelan', icon: Settings },
  ];

  const isRain =
    Boolean(mockState?.rain_detected) ||
    activeCondition === 'rainy' ||
    activeCondition === 'storm';

  return (
    <aside
      className="fixed bottom-3 sm:bottom-4 md:bottom-5 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center select-none max-w-[95vw] pointer-events-none"
      aria-label="Dynamic Island Navigation"
    >
      {/* Main Bottom Dynamic Island Pill */}
      <motion.div
        layout
        transition={{ type: 'spring', damping: 30, stiffness: 420 }}
        className={`pointer-events-auto flex items-center gap-1 sm:gap-1.5 p-1.5 sm:p-2 rounded-full bg-slate-950/95 backdrop-blur-md border ${
          activeCondition === 'storm'
            ? 'border-red-500/60 shadow-[0_12px_40px_rgba(239,68,68,0.3)] ring-2 ring-red-500/20'
            : isRain
            ? 'border-cyan-400/60 shadow-[0_12px_40px_rgba(56,189,248,0.3)] ring-2 ring-cyan-400/20'
            : isSunny
            ? 'border-amber-400/40 shadow-xl shadow-amber-950/20 ring-1 ring-amber-400/20'
            : isCloudy
            ? 'border-slate-700/60 shadow-xl shadow-slate-900/40'
            : 'border-slate-800 shadow-xl'
        } transition-colors duration-300`}
      >
        {/* Navigation Tabs */}
        <nav className="flex items-center gap-0.5 sm:gap-1" aria-label="Navigasi Dynamic Island">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `relative flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-xs transition-colors duration-200 ${
                    isActive
                      ? 'text-white font-semibold'
                      : isSunny
                      ? 'text-slate-400 hover:text-amber-300 hover:bg-white/5 font-medium'
                      : isCloudy
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-white/5 font-medium'
                      : 'text-slate-400 hover:text-sky-300 hover:bg-white/5 font-medium'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Animated Sliding Pill for Active Tab */}
                    {isActive && (
                      <motion.div
                        layoutId="dynamic-island-active-indicator"
                        className={`absolute inset-0 rounded-full text-white -z-10 ${
                          activeCondition === 'storm'
                            ? 'bg-red-600 shadow-md shadow-red-600/30 border border-red-500/30'
                            : isCloudy
                            ? 'bg-slate-700 shadow-md shadow-slate-900/20 border border-slate-600/40'
                            : isSunny
                            ? 'bg-amber-500 shadow-md shadow-amber-500/30 border border-amber-400/30'
                            : 'bg-sky-500 shadow-md shadow-sky-500/25 border border-sky-400/30'
                        }`}
                        transition={{ type: 'spring', damping: 25, stiffness: 380 }}
                      />
                    )}
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className={`${isActive ? 'inline' : 'hidden md:inline'}`}>
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Live Weather Capsule (Dynamic Island Live State) */}
        {activeCondition === 'storm' && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-400/30 text-[11px] font-medium animate-pulse"
          >
            <CloudLightning className="w-3.5 h-3.5 text-red-300" />
            <span className="hidden sm:inline">Badai!</span>
          </motion.div>
        )}
        {activeCondition === 'rainy' && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-[11px] font-medium animate-pulse"
          >
            <Droplets className="w-3.5 h-3.5 text-cyan-300" />
            <span className="hidden sm:inline">Hujan!</span>
          </motion.div>
        )}
        {activeCondition === 'sunny' && (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-400/25 text-[11px] font-medium">
            <Sun className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Cerah</span>
          </div>
        )}
        {activeCondition === 'cloudy' && (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-medium">
            <Cloud className="w-3.5 h-3.5 text-slate-300" />
            <span className="hidden sm:inline">Berawan</span>
          </div>
        )}
      </motion.div>
    </aside>
  );
}

export default Sidebar;
