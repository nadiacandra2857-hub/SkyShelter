/**
 * Mapping status atap ke teks Bahasa Indonesia dan tema visual
 */
export const ROOF_STATUS_MAP = {
  open: {
    label: 'Terbuka',
    description: 'Atap dalam posisi terbuka penuh, jemuran terpapar sinar.',
    color: 'sky',
    badgeVariant: 'sky',
  },
  closed: {
    label: 'Tertutup',
    description: 'Atap tertutup rapat, pakaian terlindungi dari presipitasi.',
    color: 'charcoal',
    badgeVariant: 'neutral',
  },
  opening: {
    label: 'Sedang Membuka',
    description: 'Motor sedang menggerakkan kanopi ke posisi terbuka.',
    color: 'amber',
    badgeVariant: 'warning',
  },
  closing: {
    label: 'Sedang Menutup',
    description: 'Motor sedang menutup kanopi untuk mengamankan jemuran.',
    color: 'amber',
    badgeVariant: 'warning',
  },
  unknown: {
    label: 'Tidak Diketahui',
    description: 'Kondisi fisik kanopi belum terkonfirmasi oleh sensor limit switch.',
    color: 'gray',
    badgeVariant: 'muted',
  },
};

/**
 * Mapping status sensor hujan fisik lokal
 */
export const RAIN_SENSOR_MAP = {
  dry: {
    label: 'Kering',
    description: 'Permukaan sensor bersih dari tetesan air hujan.',
    badgeVariant: 'success',
  },
  rain_detected: {
    label: 'Hujan Terdeteksi',
    description: 'Sensor mendeteksi presipitasi air hujan aktif!',
    badgeVariant: 'danger',
  },
  unknown: {
    label: 'Tidak Diketahui',
    description: 'Data telemetri sensor belum dapat divalidasi.',
    badgeVariant: 'muted',
  },
  disabled: {
    label: 'Nonaktif',
    description: 'Sensor fisik dinonaktifkan sementara (perangkat ESP belum tersedia). Sistem dipandu penuh oleh radar BMKG.',
    badgeVariant: 'muted',
  },
};

/**
 * Mapping keputusan sistem V2.0 (Early-Close & Safety)
 */
export const DECISION_MAP = {
  normal: {
    label: 'Normal',
    shortReason: 'Cuaca cerah/berawan, tidak terdeteksi risiko hujan tinggi.',
    badgeVariant: 'success',
    badgeText: 'Kondisi Normal',
  },
  standby: {
    label: 'Siaga',
    shortReason: 'Probabilitas hujan menengah (50% - 79%). Sistem siap menutup atap sewaktu-waktu.',
    badgeVariant: 'warning',
    badgeText: 'Mode Siaga',
  },
  early_close: {
    label: 'Menutup Lebih Awal',
    shortReason: 'Prakiraan hujan melampaui ambang batas (> 80%). Kanopi menutup proaktif.',
    badgeVariant: 'danger',
    badgeText: 'Early-Close Aktif',
  },
  rain_detected: {
    label: 'Hujan Terdeteksi',
    shortReason: 'Sensor lokal basah. Atap ditutup darurat demi perlindungan jemuran.',
    badgeVariant: 'danger',
    badgeText: 'Hujan Aktif',
  },
  unavailable: {
    label: 'Prakiraan Tidak Tersedia',
    shortReason: 'Layanan API cuaca tidak merespons. Sistem mengandalkan sensor hujan lokal murni.',
    badgeVariant: 'muted',
    badgeText: 'Sensor Lokal Murni',
  },
};

/**
 * Status koneksi perangkat
 */
export const CONNECTION_STATUS_MAP = {
  online: {
    label: 'Online',
    badgeVariant: 'success',
  },
  offline: {
    label: 'Offline',
    badgeVariant: 'danger',
  },
  unknown: {
    label: 'Tidak Diketahui',
    badgeVariant: 'muted',
  },
};

/**
 * Helper untuk format suhu
 */
export function formatTemp(temp) {
  if (temp === null || temp === undefined) return '-';
  return `${Math.round(temp)}°C`;
}

/**
 * Helper untuk format persentase
 */
export function formatPercentage(val) {
  if (val === null || val === undefined) return '-';
  return `${Math.round(val)}%`;
}
