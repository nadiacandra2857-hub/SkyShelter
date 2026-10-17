import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Sliders, CloudRain, History, Settings } from 'lucide-react';

export function BottomNavigation() {
  const navItems = [
    { to: '/', label: 'Beranda', icon: LayoutDashboard },
    { to: '/control', label: 'Kendali', icon: Sliders },
    { to: '/weather', label: 'Cuaca', icon: CloudRain },
    { to: '/history', label: 'Riwayat', icon: History },
    { to: '/settings', label: 'Setelan', icon: Settings },
  ];

  return (
    <nav
      aria-label="Navigasi Bawah Mobile"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-sage/25 shadow-soft-lg pb-safe"
    >
      <div className="flex items-center justify-around px-2 py-1.5 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center min-w-[56px] min-h-[44px] rounded-xl transition-all duration-200 select-none ${
                  isActive
                    ? 'text-forest font-bold scale-105'
                    : 'text-muted-gray hover:text-charcoal'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNavigation;
