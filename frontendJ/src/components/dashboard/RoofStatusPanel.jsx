import React from 'react';
import { motion } from 'framer-motion';
import {
  Sun,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Sliders,
  CheckCircle2,
  HelpCircle,
  ArrowUpRight,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import Button from '../common/Button';
import { ROOF_STATUS_MAP } from '../../utils/formatters';
import { formatTime, formatRelativeTime } from '../../utils/formatDate';

export function RoofStatusPanel({
  roofStatus = 'closed',
  mode = 'auto',
  lastUpdated,
  onOpenRoof,
  onCloseRoof,
  isOperating = false,
  rainDetected = false,
}) {
  const statusInfo = ROOF_STATUS_MAP[roofStatus] || ROOF_STATUS_MAP.unknown;

  // Persentase penutupan atap untuk ilustrasi animasi (0% = terbuka penuh, 100% = tertutup penuh)
  let canopyWidthPercentage = '100%';
  if (roofStatus === 'open') canopyWidthPercentage = '15%';
  if (roofStatus === 'closed') canopyWidthPercentage = '100%';
  if (roofStatus === 'opening') canopyWidthPercentage = '40%';
  if (roofStatus === 'closing') canopyWidthPercentage = '75%';

  return (
    <div className="relative overflow-hidden rounded-3xl bg-white border border-sage/30 shadow-soft-md p-6 flex flex-col justify-between">
      {/* Background soft glow based on status */}
      <div
        className={`absolute -right-16 -top-16 w-52 h-52 rounded-full blur-3xl opacity-20 pointer-events-none ${
          roofStatus === 'open'
            ? 'bg-emerald-400'
            : roofStatus === 'closed'
            ? 'bg-forest'
            : 'bg-soft-amber'
        }`}
      />

      {/* Top Header Information */}
      <div className="flex items-start justify-between gap-4 mb-4 z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold tracking-wider uppercase text-muted-gray">
              Status Fisik Atap Jemuran
            </span>
            <span className="text-xs text-muted-gray">•</span>
            <span className="text-xs font-medium text-forest">
              Mode {mode === 'auto' ? 'Otomatis' : 'Manual'}
            </span>
          </div>
          <h3 className="text-2xl md:text-3xl font-extrabold text-charcoal font-sans flex items-center gap-3">
            <span>{statusInfo.label}</span>
            <StatusBadge
              variant={statusInfo.badgeVariant}
              size="sm"
              pulse={roofStatus === 'opening' || roofStatus === 'closing'}
            >
              {roofStatus === 'opening' || roofStatus === 'closing' ? 'Bergerak' : 'Stabil'}
            </StatusBadge>
          </h3>
          <p className="text-xs md:text-sm text-muted-gray mt-1 max-w-md">
            {statusInfo.description}
          </p>
        </div>

        {/* Quick Mode Indicator Tag */}
        <div className="hidden sm:flex flex-col items-end text-right">
          <span className="text-[11px] text-muted-gray">Pembaruan</span>
          <span className="text-xs font-mono font-medium text-charcoal">
            {lastUpdated ? formatRelativeTime(lastUpdated) : 'Baru saja'}
          </span>
        </div>
      </div>

      {/* Interactive Roof & Clothes Shelter Illustration */}
      <div className="my-3 py-4 px-2 rounded-2xl bg-warm-surface/80 border border-sage/20 flex flex-col items-center justify-center relative">
        <svg
          viewBox="0 0 420 180"
          className="w-full max-w-md h-40 md:h-44 transition-all duration-300"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Sky background / sunlight */}
          {roofStatus === 'open' && (
            <motion.g
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <circle cx="90" cy="40" r="18" fill="#E8B65B" fillOpacity="0.8" />
              <circle cx="90" cy="40" r="26" stroke="#E8B65B" strokeOpacity="0.3" strokeWidth="2" strokeDasharray="4 4" />
              <path d="M90 10V18M90 62V70M60 40H68M112 40H120" stroke="#E8B65B" strokeWidth="2" strokeLinecap="round" />
            </motion.g>
          )}

          {/* Shelter Frame Pillars */}
          <rect x="70" y="60" width="8" height="100" rx="3" fill="#363D39" />
          <rect x="342" y="60" width="8" height="100" rx="3" fill="#363D39" />
          <line x1="60" y1="62" x2="360" y2="62" stroke="#252B28" strokeWidth="6" strokeLinecap="round" />
          {/* Guide Rail */}
          <line x1="65" y1="56" x2="355" y2="56" stroke="#A8BBA0" strokeWidth="3" strokeDasharray="6 4" />

          {/* Hanging Clothes Inside (Jemuran) */}
          <g transform="translate(100, 75)">
            {/* Clothes Line */}
            <line x1="0" y1="12" x2="220" y2="12" stroke="#7B847E" strokeWidth="2" strokeLinecap="round" />
            
            {/* Hanger 1: Baju Kuning */}
            <path d="M25 12L38 25H12L25 12Z" stroke="#7B847E" strokeWidth="1.5" />
            <rect x="15" y="25" width="20" height="32" rx="4" fill="#E8B65B" fillOpacity="0.9" />

            {/* Hanger 2: Kemeja Hijau */}
            <path d="M85 12L98 25H72L85 12Z" stroke="#7B847E" strokeWidth="1.5" />
            <rect x="75" y="25" width="20" height="35" rx="4" fill="#2F6B50" fillOpacity="0.9" />

            {/* Hanger 3: Kaos Putih */}
            <path d="M145 12L158 25H132L145 12Z" stroke="#7B847E" strokeWidth="1.5" />
            <rect x="135" y="25" width="20" height="30" rx="4" fill="#F6F5F0" stroke="#A8BBA0" strokeWidth="1.5" />

            {/* Hanger 4: Celana Biru Tua */}
            <path d="M195 12L205 25H185L195 12Z" stroke="#7B847E" strokeWidth="1.5" />
            <rect x="187" y="25" width="16" height="42" rx="3" fill="#183D32" />
          </g>

          {/* Animated Motorized Canopy (Atap Geser) */}
          <motion.g
            animate={{
              x: roofStatus === 'open' ? -220 : 0,
            }}
            transition={{
              duration: roofStatus === 'opening' || roofStatus === 'closing' ? 1.8 : 0.4,
              ease: 'easeInOut',
            }}
          >
            {/* Canopy Roof Slats */}
            <path
              d="M60 48L350 48L360 62L50 62Z"
              fill="#183D32"
              stroke="#A8BBA0"
              strokeWidth="2"
            />
            {/* Panel Texture Ribs */}
            <line x1="110" y1="48" x2="105" y2="62" stroke="#2F6B50" strokeWidth="2" />
            <line x1="170" y1="48" x2="165" y2="62" stroke="#2F6B50" strokeWidth="2" />
            <line x1="230" y1="48" x2="225" y2="62" stroke="#2F6B50" strokeWidth="2" />
            <line x1="290" y1="48" x2="285" y2="62" stroke="#2F6B50" strokeWidth="2" />

            {/* Front Canopy Cap */}
            <circle cx="360" cy="55" r="4" fill="#E8B65B" />
          </motion.g>

          {/* Status Label Inside SVG */}
          <text
            x="210"
            y="170"
            textAnchor="middle"
            fill="#7B847E"
            fontSize="11"
            fontWeight="600"
            fontFamily="Inter, sans-serif"
          >
            {roofStatus === 'open'
              ? 'Posisi Kanopi: Terbuka (Jemuran Terpapar Sinar)'
              : roofStatus === 'closed'
              ? 'Posisi Kanopi: Tertutup Penuh (Aman Terlindungi)'
              : roofStatus === 'opening'
              ? 'Kanopi Sedang Bergerak Membuka...'
              : 'Kanopi Sedang Bergerak Menutup...'}
          </text>
        </svg>
      </div>

      {/* Quick Action Controls */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 z-10">
        <div className="text-xs text-muted-gray w-full sm:w-auto text-center sm:text-left">
          {rainDetected ? (
            <span className="text-soft-red font-medium flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
              Safety Lock aktif karena hujan terdeteksi.
            </span>
          ) : (
            <span className="flex items-center gap-1 text-forest">
              <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
              Sistem siap menerima instruksi buka/tutup.
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant={roofStatus === 'open' ? 'secondary' : 'forest'}
            size="md"
            onClick={onOpenRoof}
            disabled={roofStatus === 'open' || isOperating || rainDetected}
            isLoading={isOperating && roofStatus === 'opening'}
            leftIcon={Maximize2}
            className="flex-1 sm:flex-initial"
          >
            Buka Atap
          </Button>
          <Button
            variant={roofStatus === 'closed' ? 'secondary' : 'primary'}
            size="md"
            onClick={onCloseRoof}
            disabled={roofStatus === 'closed' || isOperating}
            isLoading={isOperating && roofStatus === 'closing'}
            leftIcon={Minimize2}
            className="flex-1 sm:flex-initial"
          >
            Tutup Atap
          </Button>
        </div>
      </div>
    </div>
  );
}

export default RoofStatusPanel;
