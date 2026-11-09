/**
 * Dynamic Weather Theme Engine for SkyShelter Dashboard
 * Mendukung 4 kondisi cuaca: 'sunny' | 'cloudy' | 'rainy' | 'storm'
 */

/**
 * Mendeteksi kondisi cuaca berdasarkan telemetri sensor lokal dan data prakiraan BMKG.
 * @param {Object} params
 * @param {boolean} [params.rainDetected] - Deteksi sensor hujan digital
 * @param {number} [params.rainAnalogValue] - Nilai ADC sensor hujan (< 400 = basah)
 * @param {string} [params.weatherConditionText] - Teks deskripsi BMKG (cth: "Hujan Petir", "Cerah Berawan")
 * @param {number} [params.probabilityOfRain] - Persentase probabilitas hujan
 * @param {number} [params.lightLux] - Intensitas cahaya sekitar dalam Lux
 * @returns {'sunny' | 'cloudy' | 'rainy' | 'storm'}
 */
export function determineWeatherTheme({
  rainDetected = false,
  rainAnalogValue = 1023,
  weatherConditionText = '',
  probabilityOfRain = 0,
  lightLux = 680,
} = {}) {
  const text = (weatherConditionText || '').toLowerCase();

  // 1. Prioritas Tertinggi: Kondisi Badai / Petir / Hujan Lebat
  const isStormText =
    text.includes('badai') ||
    text.includes('petir') ||
    text.includes('lebat') ||
    text.includes('thunderstorm') ||
    text.includes('heavy rain');

  if (isStormText && (rainDetected || rainAnalogValue < 500 || probabilityOfRain >= 70)) {
    return 'storm';
  }

  // 2. Prioritas Kedua: Hujan / Gerimis Aktif / Presipitasi Tinggi
  const isRainyText =
    text.includes('hujan') ||
    text.includes('gerimis') ||
    text.includes('rain') ||
    text.includes('drizzle') ||
    text.includes('presipitasi');

  if (rainDetected || rainAnalogValue < 400 || isRainyText || probabilityOfRain >= 50) {
    if (isStormText) return 'storm';
    return 'rainy';
  }

  // 3. Prioritas Ketiga: Berawan / Mendung
  const isCloudyText =
    text.includes('awan') ||
    text.includes('mendung') ||
    text.includes('overcast') ||
    text.includes('cloud') ||
    text.includes('kabut') ||
    text.includes('fog');

  if (isCloudyText || (probabilityOfRain >= 25 && probabilityOfRain < 50)) {
    return 'cloudy';
  }

  // 4. Default: Cerah / Panas
  return 'sunny';
}

/**
 * Konfigurasi Styling Tema Tailwind CSS Lengkap untuk setiap Skema Cuaca
 */
export const WEATHER_THEMES = {
  sunny: {
    id: 'sunny',
    name: 'Cerah / Panas',
    tagline: 'Sinar matahari optimal untuk jemuran',
    iconName: 'Sun',
    accentColor: '#F59E0B',
    isDark: false,

    // Background atmosferik halaman
    pageBg:
      'bg-gradient-to-br from-amber-50/60 via-orange-50/30 to-sky-50/20 transition-colors duration-500',
    topbarBg: 'bg-white/85 backdrop-blur-md border-amber-200/60 text-charcoal',

    // Card umum & per-panel
    card: {
      base: 'bg-white/95 border-amber-100/80 shadow-sm shadow-amber-100/50 hover:border-amber-300 transition-all duration-300',
      glow: 'from-amber-400/20 to-orange-300/15',
      roofCard:
        'bg-gradient-to-b from-white via-amber-50/20 to-white border-amber-200/80 shadow-[0_6px_25px_rgba(245,158,11,0.08)]',
      sensorCard: 'bg-white/95 border-amber-100/80 hover:border-amber-300/90 shadow-sm shadow-amber-100/50',
      weatherCard: 'bg-white/95 border-amber-100/80 hover:border-amber-300/90 shadow-sm shadow-amber-100/50',
      decisionCard: 'bg-white/95 border-amber-100/80 shadow-sm shadow-amber-100/50',
      activityCard: 'bg-white/95 border-amber-100/80 shadow-sm shadow-amber-100/50',
      telemetryBox: 'bg-amber-50/50 border-amber-200/80 text-charcoal',
    },

    // Typography
    text: {
      title: 'text-charcoal',
      subtitle: 'text-muted-gray',
      headingAccent: 'text-amber-700',
      highlight: 'text-amber-600',
      sensorVal: 'text-charcoal',
    },

    // Badge styling spesifik tema
    badges: {
      statusTheme: 'bg-amber-100 text-amber-800 border-amber-200',
      dry: 'bg-amber-50 text-amber-800 border-amber-200',
      wet: 'bg-soft-red-light text-soft-red border-soft-red/40',
      open: 'bg-amber-50 text-amber-800 border-amber-200',
      closed: 'bg-slate-100 text-slate-800 border-slate-300',
      dotTheme: 'bg-amber-500',
    },

    // Ilustrasi visual atap
    illustration: {
      skyBg: 'from-amber-100 via-amber-50/60 to-orange-50/50',
      sunFill: '#F59E0B',
      sunRay: '#D97706',
      sunGlow: '#FEF3C7',
      cloudFill: '#CBD5E1',
      groundStroke: '#D97706',
      canopyColor: '#B45309',
      canopyStroke: '#F59E0B',
      roofBannerBg: 'bg-amber-50 border-amber-200 text-amber-900',
    },

    // Aksen tombol & ikon
    pillActive: 'bg-amber-500 text-white shadow-sm shadow-amber-500/20',
    iconWrapper: 'bg-amber-50 text-amber-600 border border-amber-200/80',
    weatherChip: 'bg-amber-50 text-amber-800 border-amber-200',
  },

  cloudy: {
    id: 'cloudy',
    name: 'Berawan / Mendung',
    tagline: 'Langit teduh dengan tutupan awan abu-abu',
    iconName: 'Cloud',
    accentColor: '#334155',
    isDark: false,

    // Background atmosferik halaman
    pageBg:
      'bg-gradient-to-br from-slate-100 via-slate-50 to-zinc-100/70 transition-colors duration-500',
    topbarBg: 'bg-white/85 backdrop-blur-md border-slate-200/80 text-charcoal',

    // Card umum & per-panel
    card: {
      base: 'bg-white/95 border-slate-200/80 shadow-sm hover:border-slate-300 transition-all duration-300',
      glow: 'from-slate-400/20 to-zinc-400/20',
      roofCard:
        'bg-gradient-to-b from-white via-slate-50/50 to-white border-slate-200/80 shadow-sm',
      sensorCard: 'bg-white/95 border-slate-200/80 hover:border-slate-300 shadow-sm',
      weatherCard: 'bg-white/95 border-slate-200/80 hover:border-slate-300 shadow-sm',
      decisionCard: 'bg-white/95 border-slate-200/80 shadow-sm',
      activityCard: 'bg-white/95 border-slate-200/80 shadow-sm',
      telemetryBox: 'bg-slate-100/80 border-slate-200/80 text-charcoal',
    },

    // Typography
    text: {
      title: 'text-charcoal',
      subtitle: 'text-muted-gray',
      headingAccent: 'text-slate-700',
      highlight: 'text-slate-700',
      sensorVal: 'text-charcoal',
    },

    // Badge styling spesifik tema
    badges: {
      statusTheme: 'bg-slate-200 text-slate-800 border-slate-300',
      dry: 'bg-slate-100 text-slate-800 border-slate-200',
      wet: 'bg-soft-red-light text-soft-red border-soft-red/40',
      open: 'bg-slate-100 text-slate-800 border-slate-200',
      closed: 'bg-zinc-100 text-zinc-800 border-zinc-300',
      dotTheme: 'bg-slate-700',
    },

    // Ilustrasi visual atap
    illustration: {
      skyBg: 'from-slate-200/80 via-zinc-100/70 to-slate-200/60',
      sunFill: '#E2E8F0',
      sunRay: '#CBD5E1',
      sunGlow: '#F1F5F9',
      cloudFill: '#94A3B8',
      groundStroke: '#64748B',
      canopyColor: '#334155',
      canopyStroke: '#64748B',
      roofBannerBg: 'bg-slate-100 border-slate-300 text-slate-800',
    },

    // Aksen tombol & ikon
    pillActive: 'bg-slate-700 hover:bg-slate-800 text-white shadow-sm',
    iconWrapper: 'bg-slate-100 text-slate-700 border border-slate-300',
    weatherChip: 'bg-slate-100 text-slate-800 border-slate-300',
  },

  rainy: {
    id: 'rainy',
    name: 'Hujan / Gerimis',
    tagline: 'Presipitasi aktif, kanopi atap melindungi pakaian',
    iconName: 'CloudRain',
    accentColor: '#06B6D4',
    isDark: false,

    // Background atmosferik halaman
    pageBg:
      'bg-gradient-to-br from-sky-50/80 via-cyan-50/50 to-blue-50/30 transition-colors duration-500',
    topbarBg: 'bg-white/85 backdrop-blur-md border-sky-200 text-charcoal',

    // Card umum & per-panel
    card: {
      base: 'bg-white/95 border-cyan-200/80 shadow-[0_4px_22px_rgba(6,182,212,0.12)] hover:border-cyan-400 transition-all duration-300',
      glow: 'from-cyan-400/25 to-indigo-400/20',
      roofCard:
        'bg-gradient-to-b from-white via-cyan-50/30 to-white border-cyan-300/80 shadow-[0_6px_28px_rgba(6,182,212,0.15)]',
      sensorCard: 'bg-cyan-50/40 border-cyan-300 hover:border-cyan-400',
      weatherCard: 'bg-white/95 border-cyan-200/80 hover:border-cyan-400 shadow-[0_4px_20px_rgba(6,182,212,0.1)]',
      decisionCard: 'bg-white/95 border-cyan-200/80',
      activityCard: 'bg-white/95 border-cyan-200/80',
      telemetryBox: 'bg-cyan-50/70 border-cyan-200 text-charcoal',
    },

    // Typography
    text: {
      title: 'text-charcoal',
      subtitle: 'text-muted-gray',
      headingAccent: 'text-cyan-800',
      highlight: 'text-cyan-600',
      sensorVal: 'text-charcoal',
    },

    // Badge styling spesifik tema
    badges: {
      statusTheme: 'bg-cyan-100 text-cyan-950 border-cyan-300',
      dry: 'bg-slate-100 text-slate-700 border-slate-200',
      wet: 'bg-cyan-100 text-cyan-900 border-cyan-400 font-semibold',
      open: 'bg-amber-100 text-amber-900 border-amber-300',
      closed: 'bg-cyan-100 text-cyan-950 border-cyan-300 font-semibold',
      dotTheme: 'bg-cyan-500',
    },

    // Ilustrasi visual atap
    illustration: {
      skyBg: 'from-slate-200 via-cyan-100/60 to-indigo-100/50',
      sunFill: '#94A3B8',
      sunRay: '#CBD5E1',
      sunGlow: '#E2E8F0',
      cloudFill: '#64748B',
      groundStroke: '#0891B2',
      canopyColor: '#0E7490',
      canopyStroke: '#67E8F9',
      roofBannerBg: 'bg-cyan-50 border-cyan-200 text-cyan-900',
    },

    // Aksen tombol & ikon
    pillActive: 'bg-cyan-600 text-white shadow-soft',
    iconWrapper: 'bg-cyan-100 text-cyan-800',
    weatherChip: 'bg-cyan-100 text-cyan-900 border-cyan-300',
  },

  storm: {
    id: 'storm',
    name: 'Badai / Hujan Lebat',
    tagline: 'Kondisi cuaca ekstrem, status siaga darurat penuh',
    iconName: 'CloudLightning',
    accentColor: '#EF4444',
    isDark: true,

    // Background atmosferik dramatis gelap dengan kontras tinggi
    pageBg:
      'bg-gradient-to-br from-slate-950 via-[#131B2E] to-slate-900 text-slate-100 transition-colors duration-500',
    topbarBg: 'bg-slate-900/90 backdrop-blur-md border-amber-500/30 text-white',

    // Card umum & per-panel
    card: {
      base: 'bg-slate-900/90 border-slate-700/80 shadow-[0_4px_30px_rgba(0,0,0,0.5)] hover:border-amber-500/60 transition-all duration-300 text-slate-100',
      glow: 'from-amber-500/30 via-red-500/25 to-indigo-600/30',
      roofCard:
        'bg-gradient-to-b from-slate-900 via-slate-850 to-slate-900 border-amber-500/40 shadow-[0_6px_35px_rgba(239,68,68,0.18)] text-slate-100',
      sensorCard: 'bg-slate-900/90 border-red-500/50 hover:border-red-400 text-slate-100',
      weatherCard: 'bg-slate-900/90 border-indigo-500/40 hover:border-indigo-400 shadow-[0_4px_25px_rgba(99,102,241,0.2)] text-slate-100',
      decisionCard: 'bg-slate-900/90 border-amber-500/40 text-slate-100',
      activityCard: 'bg-slate-900/90 border-slate-700/80 text-slate-100',
      telemetryBox: 'bg-slate-800/80 border-slate-700 text-slate-100',
    },

    // Typography
    text: {
      title: 'text-white',
      subtitle: 'text-slate-300',
      headingAccent: 'text-amber-400',
      highlight: 'text-red-400',
      sensorVal: 'text-white',
    },

    // Badge styling spesifik tema
    badges: {
      statusTheme: 'bg-red-950/80 text-red-300 border-red-500/60 font-semibold',
      dry: 'bg-slate-800 text-slate-300 border-slate-700',
      wet: 'bg-red-900/90 text-red-200 border-red-500 animate-pulse font-bold',
      open: 'bg-amber-900/80 text-amber-200 border-amber-500',
      closed: 'bg-indigo-950 text-indigo-200 border-indigo-500 font-semibold',
      dotTheme: 'bg-red-500 animate-ping',
    },

    // Ilustrasi visual atap
    illustration: {
      skyBg: 'from-slate-950 via-slate-900 to-indigo-950',
      sunFill: '#475569',
      sunRay: '#64748B',
      sunGlow: '#1E293B',
      cloudFill: '#1E293B',
      groundStroke: '#EF4444',
      canopyColor: '#0F172A',
      canopyStroke: '#F59E0B',
      roofBannerBg: 'bg-red-950/70 border-red-500/60 text-red-200',
    },

    // Aksen tombol & ikon
    pillActive: 'bg-red-600 text-white shadow-soft',
    iconWrapper: 'bg-red-950/80 text-red-400 border border-red-800/60',
    weatherChip: 'bg-red-950/80 text-red-300 border-red-600/70',
  },
};


/**
 * Mengembalikan styling warna dinamis untuk tombol, badge, dan aksen UI
 * berdasarkan kondisi cuaca aktif ('sunny' | 'cloudy' | 'rainy' | 'storm').
 */
export function getWeatherColors(condition = 'sunny', isDark = false) {
  switch (condition) {
    case 'sunny':
      return {
        // Tombol aksi utama / basemap terpilih
        primaryBtn: 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm shadow-amber-500/20 border-amber-400 ring-1 ring-amber-400/30',
        activeBtn: 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs',
        // Tombol subtle (cth: GPS aktif, Pusatkan ke GPS)
        subtleBtn: isDark
          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
          : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300 shadow-xs',
        // Badge indikator & pil status
        badge: isDark
          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
          : 'bg-amber-50 text-amber-800 border-amber-200',
        badgeDot: 'bg-amber-400',
        iconBox: isDark
          ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
          : 'bg-amber-50 text-amber-600 border-amber-200',
        textAccent: isDark ? 'text-amber-400' : 'text-amber-600',
        ringPulse: 'border-amber-400 bg-amber-500/20',
      };

    case 'cloudy':
      return {
        primaryBtn: 'bg-slate-700 hover:bg-slate-800 text-white shadow-sm border-slate-600 ring-1 ring-slate-500/30',
        activeBtn: 'bg-slate-700 hover:bg-slate-800 text-white shadow-xs',
        subtleBtn: isDark
          ? 'bg-slate-700/50 text-slate-200 border-slate-600/60 hover:bg-slate-700/70'
          : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 shadow-xs',
        badge: isDark
          ? 'bg-slate-800 text-slate-300 border-slate-700'
          : 'bg-slate-100 text-slate-800 border-slate-300',
        badgeDot: 'bg-slate-400',
        iconBox: isDark
          ? 'bg-slate-800 text-slate-300 border-slate-700'
          : 'bg-slate-100 text-slate-700 border-slate-300',
        textAccent: isDark ? 'text-slate-300' : 'text-slate-700',
        ringPulse: 'border-slate-400 bg-slate-500/20',
      };

    case 'storm':
      return {
        primaryBtn: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/25 border-indigo-500 ring-1 ring-indigo-400/30',
        activeBtn: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs',
        subtleBtn: isDark
          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 hover:bg-indigo-500/30'
          : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border-indigo-300 shadow-xs',
        badge: isDark
          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
          : 'bg-indigo-50 text-indigo-800 border-indigo-200',
        badgeDot: 'bg-indigo-400',
        iconBox: isDark
          ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
          : 'bg-indigo-50 text-indigo-600 border-indigo-200',
        textAccent: isDark ? 'text-indigo-400' : 'text-indigo-600',
        ringPulse: 'border-indigo-400 bg-indigo-500/20',
      };

    case 'rainy':
    default:
      return {
        primaryBtn: 'bg-sky-600 hover:bg-sky-700 text-white shadow-sm shadow-sky-600/25 border-sky-500 ring-1 ring-sky-400/30',
        activeBtn: 'bg-sky-600 hover:bg-sky-700 text-white shadow-xs',
        subtleBtn: isDark
          ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 hover:bg-sky-500/30'
          : 'bg-sky-50 hover:bg-sky-100 text-sky-800 border-sky-300 shadow-xs',
        badge: isDark
          ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
          : 'bg-sky-50 text-sky-800 border-sky-200',
        badgeDot: 'bg-sky-400',
        iconBox: isDark
          ? 'bg-sky-500/15 text-sky-400 border-sky-500/30'
          : 'bg-sky-50 text-sky-600 border-sky-200',
        textAccent: isDark ? 'text-sky-400' : 'text-sky-600',
        ringPulse: 'border-sky-400 bg-sky-500/20',
      };
  }
}
