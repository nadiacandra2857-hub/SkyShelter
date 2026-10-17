import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Sliders,
  CloudRain,
  History,
  Settings,
  Shield,
  Droplets,
  Wifi,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function Sidebar() {
  const { isMockMode, mockState, simulateRain, simulateConnection, resetSimulator } = useApp();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/control', label: 'Kendali Atap', icon: Sliders },
    { to: '/weather', label: 'Cuaca & Radar', icon: CloudRain },
    { to: '/history', label: 'Riwayat & Evaluasi', icon: History },
    { to: '/settings', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-forest-deep text-warm-offwhite h-screen sticky top-0 border-r border-forest shadow-soft-lg z-30 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-forest/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-forest flex items-center justify-center text-sage shadow-soft">
            <Shield className="w-6 h-6 text-sage" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-warm-offwhite tracking-wide">
              SkyShelter V2.0
            </h2>
            <p className="text-[11px] text-sage font-medium">
              Weather-Responsive Roof
            </p>
          </div>
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar" aria-label="Navigasi Utama">
        <div className="px-3 pb-2 text-[10px] font-semibold tracking-wider text-sage/70 uppercase">
          Menu Navigasi
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-forest text-warm-offwhite shadow-soft font-semibold border-l-4 border-sage'
                    : 'text-sage hover:bg-forest/40 hover:text-warm-offwhite'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        {/* Quick Simulator Panel in Sidebar */}
        {isMockMode && (
          <div className="mt-8 pt-4 border-t border-forest/60">
            <div className="px-3 pb-2 flex items-center justify-between">
              <span className="text-[10px] font-semibold tracking-wider text-soft-amber uppercase flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Lab Simulasi IoT
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-forest/40 border border-forest/80 space-y-2 text-xs">
              <div className="text-[11px] text-sage/90 leading-tight mb-2">
                Uji interaksi tanpa perangkat fisik:
              </div>

              {/* Rain Sensor Toggle */}
              <button
                type="button"
                onClick={() => simulateRain(!mockState?.rain_detected)}
                className={`w-full flex items-center justify-between p-2 rounded-xl transition-colors font-medium ${
                  mockState?.rain_detected
                    ? 'bg-soft-red/30 text-soft-red border border-soft-red/50'
                    : 'bg-forest/60 text-sage hover:bg-forest hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Droplets className="w-3.5 h-3.5" />
                  <span>Sensor Hujan</span>
                </span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-black/20">
                  {mockState?.rain_detected ? 'Basah' : 'Kering'}
                </span>
              </button>

              {/* Connection Toggle */}
              <button
                type="button"
                onClick={() => simulateConnection(mockState?.connection_status !== 'online')}
                className={`w-full flex items-center justify-between p-2 rounded-xl transition-colors font-medium ${
                  mockState?.connection_status === 'online'
                    ? 'bg-forest/60 text-sage hover:bg-forest hover:text-white'
                    : 'bg-soft-red/30 text-soft-red border border-soft-red/50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Wifi className="w-3.5 h-3.5" />
                  <span>ESP8266 Link</span>
                </span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-black/20">
                  {mockState?.connection_status === 'online' ? 'Online' : 'Offline'}
                </span>
              </button>

              {/* Reset Simulator */}
              <button
                type="button"
                onClick={resetSimulator}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[11px] text-sage/80 hover:text-white hover:bg-forest/50 rounded-lg transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Simulator</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Footer System Status */}
      <div className="p-4 border-t border-forest/60 text-[11px] text-sage/80">
        <div className="flex items-center justify-between mb-1">
          <span>Backend Target</span>
          <span className="font-mono text-warm-offwhite">FastAPI REST</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Firmware Target</span>
          <span className="font-mono text-warm-offwhite">ESP8266 V2.0</span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
