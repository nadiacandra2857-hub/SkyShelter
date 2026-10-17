import React from 'react';
import { Droplets, Sun, Thermometer, Wind, AlertTriangle, ShieldCheck } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import { RAIN_SENSOR_MAP, formatTemp } from '../../utils/formatters';
import { formatRelativeTime } from '../../utils/formatDate';

export function LocalSensorPanel({
  rainSensor = 'dry',
  rainDetected = false,
  rainAnalogValue = 1023,
  lightLux = 680,
  temperature = 29.5,
  humidity = 65,
  lastUpdated,
}) {
  const sensorInfo = RAIN_SENSOR_MAP[rainSensor] || RAIN_SENSOR_MAP.unknown;

  return (
    <div
      className={`rounded-3xl p-6 border transition-all duration-300 shadow-soft-md flex flex-col justify-between ${
        rainDetected
          ? 'bg-soft-red-light/70 border-soft-red/40'
          : 'bg-white border-sage/30'
      }`}
    >
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                rainDetected ? 'bg-soft-red text-white' : 'bg-forest/10 text-forest'
              }`}
            >
              <Droplets className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold tracking-wider uppercase text-muted-gray">
              Sensor Hujan Lokal
            </span>
          </div>

          <StatusBadge
            variant={rainDetected ? 'danger' : 'success'}
            size="sm"
            pulse={rainDetected}
          >
            {sensorInfo.label}
          </StatusBadge>
        </div>

        {/* Big Reading Status */}
        <div className="mt-3">
          <h4 className="text-xl md:text-2xl font-bold text-charcoal flex items-center gap-2">
            <span>{rainDetected ? 'Presipitasi Aktif' : 'Permukaan Kering'}</span>
          </h4>
          <p className="text-xs text-muted-gray mt-1 leading-relaxed">
            {rainDetected
              ? 'Tetesan air hujan terdeteksi langsung di area jemuran. Sistem memprioritaskan penutupan kanopi segera.'
              : 'Sensor bersih dan kering. Kondisi fisik lokal aman untuk proses penjemuran pakaian.'}
          </p>
        </div>
      </div>

      {/* Sensor Telemetry Metrics Grid */}
      <div className="mt-6 pt-4 border-t border-sage/20">
        <div className="grid grid-cols-2 gap-3 text-xs">
          {/* Nilai Analog Sensor Hujan */}
          <div className="p-2.5 rounded-xl bg-warm-surface border border-sage/15">
            <span className="text-[11px] text-muted-gray block">Nilai Analog (ADC)</span>
            <span className="font-mono font-bold text-charcoal text-sm">
              {rainAnalogValue ?? 1023}
              <span className="text-[10px] font-normal text-muted-gray ml-1">
                {rainAnalogValue < 400 ? '(Basah)' : '(Kering)'}
              </span>
            </span>
          </div>

          {/* Intensitas Cahaya (LDR) */}
          <div className="p-2.5 rounded-xl bg-warm-surface border border-sage/15">
            <span className="text-[11px] text-muted-gray block flex items-center gap-1">
              <Sun className="w-3 h-3 text-soft-amber" />
              <span>Intensitas Cahaya</span>
            </span>
            <span className="font-mono font-bold text-charcoal text-sm">
              {lightLux !== null ? `${Math.round(lightLux)} Lux` : '-'}
            </span>
          </div>

          {/* Suhu Udara Lingkungan */}
          <div className="p-2.5 rounded-xl bg-warm-surface border border-sage/15">
            <span className="text-[11px] text-muted-gray block flex items-center gap-1">
              <Thermometer className="w-3 h-3 text-forest" />
              <span>Suhu Udara</span>
            </span>
            <span className="font-mono font-bold text-charcoal text-sm">
              {formatTemp(temperature)}
            </span>
          </div>

          {/* Kelembapan Relatif */}
          <div className="p-2.5 rounded-xl bg-warm-surface border border-sage/15">
            <span className="text-[11px] text-muted-gray block flex items-center gap-1">
              <Wind className="w-3 h-3 text-sage" />
              <span>Kelembapan</span>
            </span>
            <span className="font-mono font-bold text-charcoal text-sm">
              {humidity ? `${Math.round(humidity)}%` : '-'}
            </span>
          </div>
        </div>

        {/* Ground Truth Safety Note */}
        <div className="mt-3 flex items-center justify-between text-[11px] text-muted-gray">
          <span className="flex items-center gap-1 text-forest font-medium">
            <ShieldCheck className="w-3 h-3" />
            Ground Truth: ESP8266 HW
          </span>
          <span className="font-mono">{formatRelativeTime(lastUpdated)}</span>
        </div>
      </div>
    </div>
  );
}

export default LocalSensorPanel;
