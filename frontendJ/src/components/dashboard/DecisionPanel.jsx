import React from 'react';
import { Cpu, ShieldCheck, AlertTriangle, CloudRain, CheckCircle, HelpCircle } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import { DECISION_MAP } from '../../utils/formatters';

export function DecisionPanel({ decision = 'normal', decisionReason, earlyCloseRecommended }) {
  const decisionInfo = DECISION_MAP[decision] || DECISION_MAP.normal;

  const decisionIcons = {
    normal: CheckCircle,
    standby: AlertTriangle,
    early_close: CloudRain,
    rain_detected: CloudRain,
    unavailable: HelpCircle,
  };

  const IconComponent = decisionIcons[decision] || Cpu;

  return (
    <div className="rounded-3xl bg-white border border-sage/30 shadow-soft-md p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-forest/10 text-forest flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold tracking-wider uppercase text-muted-gray">
              Keputusan Sistem V2.0
            </span>
          </div>

          <StatusBadge variant={decisionInfo.badgeVariant} size="sm">
            {decisionInfo.badgeText}
          </StatusBadge>
        </div>

        <div className="flex items-start gap-3 mt-2">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
              decision === 'early_close' || decision === 'rain_detected'
                ? 'bg-soft-red-light text-soft-red'
                : decision === 'standby'
                ? 'bg-soft-amber-light text-[#9A6B1A]'
                : 'bg-soft-green-light text-forest'
            }`}
          >
            <IconComponent className="w-5 h-5" />
          </div>

          <div>
            <h4 className="text-lg font-bold text-charcoal leading-snug">
              {decisionInfo.label}
            </h4>
            <p className="text-xs md:text-sm text-muted-gray mt-1 leading-relaxed">
              {decisionReason || decisionInfo.shortReason}
            </p>
          </div>
        </div>
      </div>

      {/* Rules Explanatory Checklist */}
      <div className="mt-5 pt-4 border-t border-sage/20 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-muted-gray">Hirarki 1 (Sensor Fisik)</span>
          <span className="font-semibold text-charcoal">Ground Truth Tertinggi</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-gray">Hirarki 2 (Prediksi Cuaca)</span>
          <span className="font-semibold text-charcoal">
            Early-Close {earlyCloseRecommended ? 'Aktif' : 'Pasif'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default DecisionPanel;
