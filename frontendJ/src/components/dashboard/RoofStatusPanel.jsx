import React from 'react';
import { motion } from 'framer-motion';
import {
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  ShieldCheck,
  ShieldAlert,
  Sliders,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import Button from '../common/Button';
import { ROOF_STATUS_MAP } from '../../utils/formatters';
import { formatRelativeTime } from '../../utils/formatDate';
import { useWeatherTheme } from '../../context/WeatherThemeContext';

export function RoofStatusPanel({
  roofStatus = 'closed',
  mode = 'auto',
  lastUpdated,
  onOpenRoof,
  onCloseRoof,
  isOperating = false,
  rainDetected = false,
}) {
  const { theme, activeCondition } = useWeatherTheme();
  const statusInfo = ROOF_STATUS_MAP[roofStatus] || ROOF_STATUS_MAP.unknown;

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border p-6 flex flex-col justify-between transition-all duration-500 ${
        theme.card.roofCard
      }`}
    >
      {/* Background Soft Ambient Glow */}
      <div
        className={`absolute -right-16 -top-16 w-56 h-56 rounded-full blur-3xl opacity-25 pointer-events-none bg-gradient-to-br ${
          theme.card.glow
        }`}
      />

      {/* Top Header Information */}
      <div className="flex items-start justify-between gap-4 mb-4 z-10">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span
              className={`text-xs font-semibold tracking-wider uppercase ${
                theme.isDark ? 'text-slate-400' : 'text-muted-gray'
              }`}
            >
              Status Fisik Atap Jemuran
            </span>
            <span className={theme.isDark ? 'text-slate-600' : 'text-muted-gray'}>•</span>
            <span className={`text-xs font-semibold ${theme.text.headingAccent}`}>
              Mode {mode === 'auto' ? 'Otomatis' : 'Manual'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <h3 className={`text-2xl md:text-3xl font-extrabold font-sans ${theme.text.title}`}>
              {statusInfo.label}
            </h3>
          </div>

          <p className={`text-xs md:text-sm mt-1 max-w-md ${theme.text.subtitle}`}>
            {statusInfo.description}
          </p>
        </div>

        {/* Quick Mode Indicator Tag */}
        <div className="hidden sm:flex flex-col items-end text-right">
          <span className={`text-[11px] ${theme.isDark ? 'text-slate-400' : 'text-muted-gray'}`}>
            Pembaruan
          </span>
          <span className={`text-xs font-mono font-medium ${theme.text.title}`}>
            {lastUpdated ? formatRelativeTime(lastUpdated) : 'Baru saja'}
          </span>
        </div>
      </div>

      {/* Dynamic Roof & Clothes Shelter Illustration */}
      <div
        className={`my-3 py-4 px-3 rounded-2xl border flex flex-col items-center justify-center relative overflow-hidden transition-all duration-500 bg-gradient-to-b ${
          theme.illustration.skyBg
        } ${theme.isDark ? 'border-slate-700/80' : 'border-sage/20'}`}
      >
        <svg
          viewBox="0 0 420 185"
          className="w-full max-w-md h-40 md:h-44 transition-all duration-300"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Defs for gradients & clips */}
          <defs>
            <linearGradient id="sunGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
            <linearGradient id="lightningGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
            <linearGradient id="rainDropGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0284C7" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="stormRainGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#94A3B8" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {/* ==================================================== */}
          {/* 1. SKY WEATHER LAYER: CERAH (SUNNY)                   */}
          {/* ==================================================== */}
          {activeCondition === 'sunny' && (
            <g id="weather-sunny">
              {/* Sun ambient warmth beam */}
              <motion.circle
                cx="90"
                cy="38"
                r="36"
                fill="#FEF3C7"
                fillOpacity="0.6"
                animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.7, 0.5] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
              {/* Rotating Sun Rays */}
              <motion.g
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                style={{ originX: '90px', originY: '38px' }}
              >
                <circle cx="90" cy="38" r="24" stroke="#FBBF24" strokeOpacity="0.35" strokeWidth="2" strokeDasharray="5 4" />
                <path d="M90 8V16M90 60V68M60 38H68M112 38H120M69 17L75 23M105 53L111 59M69 59L75 53M105 23L111 17" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
              </motion.g>
              {/* Core Sun Disc */}
              <circle cx="90" cy="38" r="16" fill="url(#sunGradient)" />
              {/* Warm Sunbeam Projection down to the clothes when roof is open */}
              {roofStatus === 'open' && (
                <polygon
                  points="80,48 100,48 280,140 120,140"
                  fill="#F59E0B"
                  fillOpacity="0.08"
                />
              )}
              {/* Soft small white cloud in distance */}
              <path
                d="M310 32C310 27 314 23 319 23C321 23 323 24 324 25C326 21 330 18 335 18C341 18 346 22 346 28C350 28 353 31 353 35C353 39 350 42 346 42H316C312.7 42 310 39.3 310 36V32Z"
                fill="#FFFFFF"
                fillOpacity="0.75"
              />
            </g>
          )}

          {/* ==================================================== */}
          {/* 2. SKY WEATHER LAYER: BERAWAN / MENDUNG (CLOUDY)      */}
          {/* ==================================================== */}
          {activeCondition === 'cloudy' && (
            <g id="weather-cloudy">
              {/* Dimmed Sun peek */}
              <circle cx="95" cy="35" r="14" fill="#FDE68A" fillOpacity="0.6" />
              {/* Layer 1: Background cool cloud */}
              <motion.path
                d="M60 40C60 30 68 22 78 22C81 22 84 23 87 25C91 18 98 14 106 14C115 14 123 20 124 29C128 29 133 33 133 39C133 45 128 50 122 50H70C64.5 50 60 45.5 60 40Z"
                fill="#94A3B8"
                fillOpacity="0.5"
                animate={{ x: [-4, 4, -4] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              />
              {/* Layer 2: Foreground dense gray cloud */}
              <motion.path
                d="M90 44C90 32 100 22 112 22C116 22 120 23 124 26C129 18 138 12 148 12C160 12 170 20 172 32C178 32 184 37 184 44C184 51 178 56 170 56H102C95.4 56 90 50.6 90 44Z"
                fill="#64748B"
                fillOpacity="0.85"
                animate={{ x: [4, -4, 4] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              />
              {/* Layer 3: Secondary cloud right */}
              <motion.path
                d="M260 38C260 28 268 20 278 20C282 20 285 21 288 24C293 17 301 12 310 12C321 12 330 20 332 30C337 31 342 36 342 42C342 48 337 53 330 53H270C264.5 53 260 48.5 260 43V38Z"
                fill="#94A3B8"
                fillOpacity="0.65"
                animate={{ x: [-3, 3, -3] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              />
            </g>
          )}

          {/* ==================================================== */}
          {/* 3. SKY WEATHER LAYER: HUJAN / GERIMIS (RAINY)         */}
          {/* ==================================================== */}
          {activeCondition === 'rainy' && (
            <g id="weather-rainy">
              {/* Dense Rain Cloud Left */}
              <path
                d="M60 42C60 30 70 20 82 20C86 20 90 21 94 24C99 15 109 9 120 9C133 9 144 18 146 30C152 30 158 35 158 42C158 49 152 55 144 55H72C65.4 55 60 49.6 60 43V42Z"
                fill="#475569"
                fillOpacity="0.9"
              />
              {/* Dense Rain Cloud Right */}
              <path
                d="M240 40C240 28 250 18 262 18C266 18 270 19 274 22C279 13 289 8 300 8C313 8 324 17 326 29C332 29 338 34 338 41C338 48 332 54 324 54H252C245.4 54 240 48.6 240 42V40Z"
                fill="#475569"
                fillOpacity="0.85"
              />

              {/* Animated Rain Drops (Falling diagonal-vertical) */}
              {[
                { x: 75, delay: 0 },
                { x: 95, delay: 0.3 },
                { x: 115, delay: 0.6 },
                { x: 135, delay: 0.15 },
                { x: 200, delay: 0.45 },
                { x: 220, delay: 0.2 },
                { x: 255, delay: 0.5 },
                { x: 275, delay: 0.1 },
                { x: 300, delay: 0.7 },
                { x: 325, delay: 0.35 },
              ].map((drop, i) => (
                <motion.line
                  key={`raindrop-${i}`}
                  x1={drop.x}
                  y1={58}
                  x2={drop.x - 4}
                  y2={72}
                  stroke="url(#rainDropGrad)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  animate={{
                    y1: [55, 145],
                    y2: [70, 160],
                    opacity: [0, 0.9, 0],
                  }}
                  transition={{
                    duration: 0.85,
                    repeat: Infinity,
                    delay: drop.delay,
                    ease: 'linear',
                  }}
                />
              ))}

              {/* Rain splashes on ground / canopy */}
              <ellipse cx="100" cy="162" rx="6" ry="1.5" fill="#38BDF8" fillOpacity="0.4" />
              <ellipse cx="280" cy="162" rx="8" ry="1.8" fill="#38BDF8" fillOpacity="0.4" />
            </g>
          )}

          {/* ==================================================== */}
          {/* 4. SKY WEATHER LAYER: BADAI / HUJAN LEBAT (STORM)    */}
          {/* ==================================================== */}
          {activeCondition === 'storm' && (
            <g id="weather-storm">
              {/* Dark Threatening Clouds */}
              <path
                d="M45 42C45 28 56 16 70 16C75 16 80 18 84 21C90 10 102 3 115 3C130 3 143 14 145 28C152 28 159 34 159 42C159 50 152 56 143 56H59C51.3 56 45 49.7 45 42Z"
                fill="#1E293B"
              />
              <path
                d="M225 40C225 26 236 15 250 15C255 15 260 17 264 20C270 9 282 2 295 2C310 2 323 13 325 27C332 27 339 33 339 41C339 49 332 55 323 55H239C231.3 55 225 48.7 225 41V40Z"
                fill="#1E293B"
              />
              {/* Thundercloud overcast bridge */}
              <rect x="130" y="10" width="120" height="38" rx="10" fill="#0F172A" fillOpacity="0.9" />

              {/* Animated Lightning Bolt Flash */}
              <motion.path
                d="M175 25L160 52H178L164 80L195 48H178L190 25Z"
                fill="url(#lightningGlow)"
                stroke="#FEF08A"
                strokeWidth="1"
                animate={{
                  opacity: [0, 0, 1, 0, 1, 0.2, 0],
                  scale: [0.95, 1, 1.05, 1, 1.02, 1, 0.95],
                }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  repeatDelay: 1.5,
                  times: [0, 0.1, 0.15, 0.2, 0.25, 0.35, 1],
                }}
              />

              {/* Heavy Fierce Slanted Rain Drops */}
              {[
                { x: 60, delay: 0 },
                { x: 90, delay: 0.1 },
                { x: 120, delay: 0.3 },
                { x: 150, delay: 0.2 },
                { x: 190, delay: 0.4 },
                { x: 230, delay: 0.05 },
                { x: 270, delay: 0.25 },
                { x: 310, delay: 0.35 },
                { x: 350, delay: 0.15 },
              ].map((drop, i) => (
                <motion.line
                  key={`storm-drop-${i}`}
                  x1={drop.x}
                  y1={45}
                  x2={drop.x - 8}
                  y2={65}
                  stroke="url(#stormRainGrad)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  animate={{
                    y1: [40, 145],
                    y2: [62, 168],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 0.55,
                    repeat: Infinity,
                    delay: drop.delay,
                    ease: 'linear',
                  }}
                />
              ))}

              {/* Flash alert warning on ground */}
              <ellipse cx="210" cy="165" rx="80" ry="4" fill="#EF4444" fillOpacity="0.15" />
            </g>
          )}

          {/* ==================================================== */}
          {/* STATIC STRUCTURE: SHELTER FRAME PILLARS & RAILS      */}
          {/* ==================================================== */}
          <rect x="70" y="60" width="8" height="100" rx="3" fill="#363D39" />
          <rect x="342" y="60" width="8" height="100" rx="3" fill="#363D39" />
          <line x1="60" y1="62" x2="360" y2="62" stroke="#252B28" strokeWidth="6" strokeLinecap="round" />
          {/* Guide Rail */}
          <line
            x1="65"
            y1="56"
            x2="355"
            y2="56"
            stroke={theme.illustration.canopyStroke}
            strokeWidth="3"
            strokeDasharray="6 4"
          />

          {/* ==================================================== */}
          {/* HANGING CLOTHES (JEMURAN PAKAIAN)                    */}
          {/* ==================================================== */}
          <g transform="translate(100, 75)">
            {/* Clothes Line Wire */}
            <line x1="0" y1="12" x2="220" y2="12" stroke="#7B847E" strokeWidth="2" strokeLinecap="round" />

            {/* Hanger 1: Baju Kuning */}
            <path d="M25 12L38 25H12L25 12Z" stroke="#7B847E" strokeWidth="1.5" />
            <rect x="15" y="25" width="20" height="32" rx="4" fill="#E8B65B" fillOpacity="0.9" />

            {/* Hanger 2: Kemeja Hijau */}
            <path d="M85 12L98 25H72L85 12Z" stroke="#7B847E" strokeWidth="1.5" />
            <rect x="75" y="25" width="20" height="35" rx="4" fill="#2F6B50" fillOpacity="0.9" />

            {/* Hanger 3: Kaos Putih */}
            <path d="M145 12L158 25H132L145 12Z" stroke="#7B847E" strokeWidth="1.5" />
            <rect
              x="135"
              y="25"
              width="20"
              height="30"
              rx="4"
              fill={theme.isDark ? '#E2E8F0' : '#F6F5F0'}
              stroke="#A8BBA0"
              strokeWidth="1.5"
            />

            {/* Hanger 4: Celana Biru Tua */}
            <path d="M195 12L205 25H185L195 12Z" stroke="#7B847E" strokeWidth="1.5" />
            <rect x="187" y="25" width="16" height="42" rx="3" fill="#183D32" />
          </g>

          {/* ==================================================== */}
          {/* ANIMATED MOTORIZED CANOPY (ATAP GESER OTOMATIS)      */}
          {/* ==================================================== */}
          <motion.g
            animate={{
              x: roofStatus === 'open' ? -220 : 0,
            }}
            transition={{
              duration: roofStatus === 'opening' || roofStatus === 'closing' ? 1.8 : 0.4,
              ease: 'easeInOut',
            }}
          >
            {/* Canopy Slats */}
            <path
              d="M60 48L350 48L360 62L50 62Z"
              fill={theme.illustration.canopyColor}
              stroke={theme.illustration.canopyStroke}
              strokeWidth="2"
            />
            {/* Rib Lines */}
            <line x1="110" y1="48" x2="105" y2="62" stroke={activeCondition === 'sunny' ? '#D97706' : activeCondition === 'cloudy' ? '#475569' : '#0284C7'} strokeWidth="2" />
            <line x1="170" y1="48" x2="165" y2="62" stroke={activeCondition === 'sunny' ? '#D97706' : activeCondition === 'cloudy' ? '#475569' : '#0284C7'} strokeWidth="2" />
            <line x1="230" y1="48" x2="225" y2="62" stroke={activeCondition === 'sunny' ? '#D97706' : activeCondition === 'cloudy' ? '#475569' : '#0284C7'} strokeWidth="2" />
            <line x1="290" y1="48" x2="285" y2="62" stroke={activeCondition === 'sunny' ? '#D97706' : activeCondition === 'cloudy' ? '#475569' : '#0284C7'} strokeWidth="2" />

            {/* Front Canopy Cap */}
            <circle cx="360" cy="55" r="4.5" fill={activeCondition === 'sunny' ? '#F59E0B' : activeCondition === 'cloudy' ? '#334155' : '#0EA5E9'} />
          </motion.g>

          {/* Status Label Inside SVG */}
          <text
            x="210"
            y="174"
            textAnchor="middle"
            fill={theme.isDark ? '#E2E8F0' : '#64748B'}
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
        <div className="text-xs w-full sm:w-auto text-center sm:text-left">
          {rainDetected ? (
            <span className="text-soft-red font-semibold flex items-center gap-1.5 justify-center sm:justify-start">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 animate-pulse" />
              Safety Lock aktif: Sensor mendeteksi presipitasi air hujan.
            </span>
          ) : (
            <span className={`flex items-center gap-1.5 justify-center sm:justify-start ${theme.text.subtitle}`}>
              <ShieldCheck
                className={`w-4 h-4 ${
                  activeCondition === 'sunny'
                    ? 'text-amber-500'
                    : activeCondition === 'cloudy'
                    ? 'text-slate-600'
                    : 'text-sky-500'
                }`}
              />
              Kondisi jemuran aman dalam proteksi otomatis SkyShelter.
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant={
              roofStatus === 'open'
                ? activeCondition === 'cloudy'
                  ? 'outline'
                  : 'secondary'
                : activeCondition === 'sunny'
                ? 'amber'
                : activeCondition === 'cloudy'
                ? 'slate'
                : 'sky'
            }
            size="md"
            onClick={onOpenRoof}
            disabled={roofStatus === 'open' || isOperating || rainDetected}
            isLoading={isOperating && roofStatus === 'opening'}
            leftIcon={Maximize2}
            className={`flex-1 sm:flex-initial ${
              activeCondition === 'sunny'
                ? 'bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-soft shadow-amber-500/20 ring-1 ring-amber-400/30'
                : activeCondition === 'cloudy'
                ? roofStatus === 'open'
                  ? 'bg-slate-100 text-slate-500 border-slate-300 cursor-not-allowed opacity-60'
                  : 'bg-slate-700 hover:bg-slate-800 text-white shadow-sm ring-1 ring-slate-600/30'
                : 'bg-sky-500 hover:bg-sky-600 text-white font-semibold shadow-soft shadow-sky-100 ring-1 ring-sky-400/30'
            }`}
          >
            Buka Atap
          </Button>
          <Button
            variant={
              roofStatus === 'closed'
                ? 'secondary'
                : activeCondition === 'sunny'
                ? 'amber'
                : activeCondition === 'cloudy'
                ? 'slate'
                : 'sky'
            }
            size="md"
            onClick={onCloseRoof}
            disabled={roofStatus === 'closed' || isOperating}
            isLoading={isOperating && roofStatus === 'closing'}
            leftIcon={Minimize2}
            className={`flex-1 sm:flex-initial ${
              roofStatus === 'closed'
                ? 'opacity-60 cursor-not-allowed'
                : activeCondition === 'sunny'
                ? 'bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-soft'
                : activeCondition === 'cloudy'
                ? 'bg-slate-700 hover:bg-slate-800 text-white shadow-sm'
                : 'bg-sky-600 hover:bg-sky-700 text-white font-semibold shadow-soft'
            }`}
          >
            Tutup Atap
          </Button>
        </div>
      </div>
    </div>
  );
}

export default RoofStatusPanel;
