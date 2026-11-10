import React from 'react';
import { Cpu, ShieldCheck, AlertTriangle, CloudRain, CheckCircle, HelpCircle } from 'lucide-react';
import { DECISION_MAP } from '../../utils/formatters';
import { useWeatherTheme } from '../../context/WeatherThemeContext';

export function DecisionPanel({ decision = 'normal', decisionReason, earlyCloseRecommended }) {
  const { theme, activeCondition } = useWeatherTheme();
  const decisionInfo = DECISION_MAP[decision] || DECISION_MAP.normal;

  const decisionIcons = {
    normal: CheckCircle,
    standby: AlertTriangle,
    early_close: CloudRain,
    rain_detected: CloudRain,
    unavailable: HelpCircle,
  };

  const IconComponent = decisionIcons[decision] || Cpu;
  const isSunny = activeCondition === 'sunny';
  const isCloudy = activeCondition === 'cloudy';

  return (
    <div
      className={`rounded-3xl p-6 border transition-all duration-500 shadow-soft-md flex flex-col justify-between ${
        theme.card.decisionCard
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors border ${
                isSunny
                  ? 'bg-amber-50 border-amber-200/80 text-amber-500'
                  : isCloudy
                  ? 'bg-slate-100 border-slate-300 text-slate-700'
                  : 'bg-sky-50 dark:bg-sky-950/60 border-sky-200/80 text-sky-500'
              }`}
            >
              <Cpu className={`w-4 h-4 ${isSunny ? 'text-amber-500' : isCloudy ? 'text-slate-600' : 'text-sky-500'}`} />
            </div>
            <span
              className={`text-xs font-semibold tracking-wider uppercase ${
                theme.isDark ? 'text-slate-400' : 'text-muted-gray'
              }`}
            >
              Keputusan Sistem V2.0
            </span>
          </div>
        </div>

        <div className="flex items-start gap-3 mt-2">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
              decision === 'early_close' || decision === 'rain_detected'
                ? 'bg-soft-red-light text-soft-red'
                : decision === 'standby'
                ? 'bg-soft-amber-light text-[#9A6B1A]'
                : isSunny
                ? 'bg-amber-50 text-amber-600 border border-amber-200/60'
                : isCloudy
                ? 'bg-slate-100 text-slate-700 border border-slate-300'
                : 'bg-sky-50 text-sky-600 border border-sky-200/60'
            }`}
          >
            <IconComponent className="w-5 h-5" />
          </div>

          <div>
            <h4 className={`text-lg font-bold leading-snug ${theme.text.title}`}>
              {decisionInfo.label}
            </h4>
            <p className={`text-xs md:text-sm mt-1 leading-relaxed ${theme.text.subtitle}`}>
              {decisionReason || decisionInfo.shortReason}
            </p>
          </div>
        </div>
      </div>

      {/* Rules Explanatory Checklist */}
      <div
        className={`mt-5 pt-4 border-t space-y-2 text-xs ${
          theme.isDark ? 'border-slate-800' : 'border-sage/20'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className={theme.isDark ? 'text-slate-400' : 'text-muted-gray'}>
            Sensor Fisik ESP
          </span>
          <span className="text-[11px] font-semibold text-slate-400">
            Nonaktif (Dipandu Satelit Open-Meteo)
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className={theme.isDark ? 'text-slate-400' : 'text-muted-gray'}>
            Hirarki 2 (Prediksi Cuaca)
          </span>
          <span className={`font-semibold ${theme.text.title}`}>
            Early-Close {earlyCloseRecommended ? 'Aktif' : 'Pasif'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default DecisionPanel;
