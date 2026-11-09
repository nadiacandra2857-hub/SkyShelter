import { FALLBACK_REGIONS } from '../services/weatherService';

/**
 * Pembagian Sektor / Zona Wilayah Cuaca untuk Kota Surabaya dan Kabupaten Lamongan
 * Dilengkapi titik koordinat pusat sektor, zoom level optimal, dan offset mikroklimatologis.
 */
export const WEATHER_SECTIONS = [
  // ==================== KOTA SURABAYA ====================
  {
    id: 'sby-pusat',
    name: 'Surabaya Pusat',
    city: 'Kota Surabaya',
    shortName: 'Pusat',
    center: [-7.2625, 112.7420],
    zoom: 13,
    description: 'Jantung kota komersial, kepadatan tinggi & pusat pemerintahan',
    microclimate: {
      tempOffset: 0.5,
      humidityOffset: -3,
      rainOffset: -5,
      defaultCondition: 'Berawan',
    },
    districtAdm4s: [
      '35.78.07.1001', // Genteng
      '35.78.05.1001', // Tegalsari
      '35.78.13.1001', // Bubutan
      '35.78.11.1001', // Simokerto
      '35.78.08.1001', // Gubeng
      '35.78.06.1001', // Sawahan
    ],
  },
  {
    id: 'sby-utara',
    name: 'Surabaya Utara',
    city: 'Kota Surabaya',
    shortName: 'Utara',
    center: [-7.2300, 112.7550],
    zoom: 13,
    description: 'Kawasan pesisir pelabuhan Tanjung Perak & Selat Madura',
    microclimate: {
      tempOffset: -0.2,
      humidityOffset: 4,
      rainOffset: 5,
      defaultCondition: 'Cerah Berawan',
    },
    districtAdm4s: [
      '35.78.15.1001', // Krembangan
      '35.78.16.1001', // Semampir
      '35.78.12.1001', // Pabean Cantian
      '35.78.17.1001', // Kenjeran
      '35.78.29.1001', // Bulak
    ],
  },
  {
    id: 'sby-timur',
    name: 'Surabaya Timur',
    city: 'Kota Surabaya',
    shortName: 'Timur',
    center: [-7.2950, 112.7950],
    zoom: 13,
    description: 'Kawasan pesisir timur (Pamurbaya), kampus & pemukiman modern',
    microclimate: {
      tempOffset: -0.4,
      humidityOffset: 3,
      rainOffset: 2,
      defaultCondition: 'Berawan',
    },
    districtAdm4s: [
      '35.78.09.1001', // Sukolilo
      '35.78.26.1001', // Mulyorejo
      '35.78.03.1001', // Rungkut
      '35.78.24.1001', // Tenggilis Mejoyo
      '35.78.25.1001', // Gunung Anyar
    ],
  },
  {
    id: 'sby-selatan',
    name: 'Surabaya Selatan',
    city: 'Kota Surabaya',
    shortName: 'Selatan',
    center: [-7.3150, 112.7200],
    zoom: 13,
    description: 'Koridor pemukiman padat, industri ringan & perbatasan Sidoarjo',
    microclimate: {
      tempOffset: 0.2,
      humidityOffset: 1,
      rainOffset: 8,
      defaultCondition: 'Hujan Ringan',
    },
    districtAdm4s: [
      '35.78.04.1001', // Wonokromo
      '35.78.02.1001', // Wonocolo
      '35.78.01.1001', // Karang Pilang
      '35.78.20.1001', // Wiyung
      '35.78.21.1001', // Dukuh Pakis
      '35.78.22.1001', // Gayungan
      '35.78.23.1001', // Jambangan
    ],
  },
  {
    id: 'sby-barat',
    name: 'Surabaya Barat',
    city: 'Kota Surabaya',
    shortName: 'Barat',
    center: [-7.2650, 112.6650],
    zoom: 13,
    description: 'Kawasan perbukitan barat, perkotaan mandiri & perbatasan Gresik',
    microclimate: {
      tempOffset: 0.1,
      humidityOffset: 2,
      rainOffset: 6,
      defaultCondition: 'Berawan Tebal',
    },
    districtAdm4s: [
      '35.78.14.1002', // Tandes
      '35.78.27.1001', // Sukomanunggal
      '35.78.28.1001', // Asem Rowo
      '35.78.19.1001', // Benowo
      '35.78.30.1001', // Pakal
      '35.78.31.1001', // Sambikerep
      '35.78.18.1001', // Lakarsantri
    ],
  },

  // ==================== KABUPATEN LAMONGAN ====================
  {
    id: 'lmg-kota',
    name: 'Lamongan Kota & Tengah',
    city: 'Kab. Lamongan',
    shortName: 'Kota & Tengah',
    center: [-7.1150, 112.3300],
    zoom: 12,
    description: 'Pusat administratif kabupaten, sentra lumbung padi dataran tengah',
    microclimate: {
      tempOffset: 0.3,
      humidityOffset: -1,
      rainOffset: 3,
      defaultCondition: 'Berawan',
    },
    districtAdm4s: [
      '35.24.22.2001', // Lamongan
      '35.24.17.2001', // Sukodadi
      '35.24.21.2001', // Turi
      '35.24.13.2001', // Pucuk
      '35.24.20.2001', // Kalitengah
      '35.24.09.2001', // Sekaran
    ],
  },
  {
    id: 'lmg-pantura',
    name: 'Lamongan Pantura (Pesisir)',
    city: 'Kab. Lamongan',
    shortName: 'Pantura',
    center: [-6.9200, 112.2600],
    zoom: 12,
    description: 'Pesisir Laut Jawa, pelabuhan perikanan Brondong & wisata bahari WBL',
    microclimate: {
      tempOffset: -1.0,
      humidityOffset: 5,
      rainOffset: -8,
      defaultCondition: 'Cerah Berawan',
    },
    districtAdm4s: [
      '35.24.14.1001', // Paciran
      '35.24.07.2001', // Brondong
      '35.24.15.2001', // Solokuro
      '35.24.18.2001', // Karanggeneng
      '35.24.08.2001', // Laren
      '35.24.10.2001', // Maduran
    ],
  },
  {
    id: 'lmg-barat',
    name: 'Lamongan Barat',
    city: 'Kab. Lamongan',
    shortName: 'Barat',
    center: [-7.1800, 112.1500],
    zoom: 12,
    description: 'Simpang tiga strategis Babat, bantaran Bengawan Solo & koridor Bojonegoro',
    microclimate: {
      tempOffset: 0.1,
      humidityOffset: 3,
      rainOffset: 12,
      defaultCondition: 'Hujan Ringan',
    },
    districtAdm4s: [
      '35.24.05.2002', // Babat
      '35.24.06.2001', // Kedungpring
      '35.24.03.2001', // Modo
    ],
  },
  {
    id: 'lmg-timur',
    name: 'Lamongan Timur',
    city: 'Kab. Lamongan',
    shortName: 'Timur',
    center: [-7.0700, 112.4350],
    zoom: 12,
    description: 'Kawasan tambak air payau, rawa budidaya ikan & perbatasan Gresik',
    microclimate: {
      tempOffset: -0.2,
      humidityOffset: 6,
      rainOffset: 4,
      defaultCondition: 'Berawan',
    },
    districtAdm4s: [
      '35.24.25.2001', // Deket
      '35.24.24.2001', // Karangbinangun
      '35.24.26.2001', // Glagah
      '35.24.27.2001', // Sarirejo
    ],
  },
  {
    id: 'lmg-selatan',
    name: 'Lamongan Selatan',
    city: 'Kab. Lamongan',
    shortName: 'Selatan',
    center: [-7.2600, 112.2000],
    zoom: 12,
    description: 'Kawasan dataran tinggi perbukitan kapur selatan, hutan jati & perbatasan Mojokerto',
    microclimate: {
      tempOffset: -1.2,
      humidityOffset: 5,
      rainOffset: 15,
      defaultCondition: 'Hujan Sedang',
    },
    districtAdm4s: [
      '35.24.23.2001', // Tikung
      '35.24.16.2001', // Mantup
      '35.24.12.2001', // Sugio
      '35.24.11.2001', // Sambeng
      '35.24.19.2001', // Kembangbahu
      '35.24.04.2001', // Ngimbang
      '35.24.02.2001', // Bluluk
      '35.24.01.2001', // Sukorame
    ],
  },

  // ==================== ZONA STRATEGIS JAWA TIMUR ====================
  {
    id: 'mlg-raya',
    name: 'Malang Raya & Selatan',
    city: 'Malang Raya',
    shortName: 'Malang Raya',
    center: [-7.9786, 112.6317],
    zoom: 10,
    description: 'Dataran tinggi pegunungan Bromo-Semeru, iklim sejuk & sentra apel',
    microclimate: {
      tempOffset: -4.5,
      humidityOffset: 12,
      rainOffset: 20,
      defaultCondition: 'Hujan Ringan',
    },
    districtAdm4s: [
      '35.73.01.1001', // Klojen, Kota Malang
    ],
  },
  {
    id: 'tp-kuda',
    name: 'Tapal Kuda & Banyuwangi',
    city: 'Tapal Kuda',
    shortName: 'Banyuwangi',
    center: [-8.2192, 114.3691],
    zoom: 10,
    description: 'Ujung timur Pulau Jawa, Selat Bali & kawasan agraris pesisir',
    microclimate: {
      tempOffset: -0.8,
      humidityOffset: 6,
      rainOffset: 8,
      defaultCondition: 'Berawan',
    },
    districtAdm4s: [
      '35.10.01.1001', // Banyuwangi Kota
    ],
  },
  {
    id: 'mtr-barat',
    name: 'Mataraman & Madiun',
    city: 'Mataraman',
    shortName: 'Madiun',
    center: [-7.6298, 111.5239],
    zoom: 10,
    description: 'Kawasan barat Gunung Wilis, lumbung pangan & poros Madiun-Kediri',
    microclimate: {
      tempOffset: 0.2,
      humidityOffset: 2,
      rainOffset: 10,
      defaultCondition: 'Cerah Berawan',
    },
    districtAdm4s: [
      '35.77.01.1001', // Kartoharjo, Kota Madiun
    ],
  },
  {
    id: 'mdr-madura',
    name: 'Pulau Madura',
    city: 'Madura',
    shortName: 'Madura',
    center: [-7.1593, 113.4739],
    zoom: 10,
    description: 'Kawasan pesisir Selat Madura & Laut Jawa, sentra garam & tembakau',
    microclimate: {
      tempOffset: 1.0,
      humidityOffset: -4,
      rainOffset: -10,
      defaultCondition: 'Cerah',
    },
    districtAdm4s: [
      '35.28.01.1001', // Pamekasan Kota
    ],
  },
];

/**
 * Peta Lookup ADM4 ke Section ID
 */
export const ADM4_TO_SECTION = {};
WEATHER_SECTIONS.forEach((sec) => {
  sec.districtAdm4s.forEach((code) => {
    ADM4_TO_SECTION[code] = sec;
  });
});

/**
 * Helper untuk menghitung kondisi cuaca sintetik per kecamatan dan per section
 * berbasis BMKG active telemetry agar konsisten, realistis, dan informatif.
 */
export function buildRegionalWeather(baseWeather, currentAdm4) {
  const baseTemp = baseWeather?.temperature ?? 29.5;
  const baseProb = baseWeather?.probability_of_rain ?? 45.0;
  const baseHum = baseWeather?.humidity ?? 72.0;
  const baseCond = baseWeather?.weather_condition || 'Berawan';

  // Format kondisi cuaca berdasarkan probabilitas hujan
  const getConditionFromProb = (prob, fallback) => {
    if (prob >= 80) return 'Hujan Sedang';
    if (prob >= 60) return 'Hujan Ringan';
    if (prob >= 40) return 'Berawan Tebal';
    if (prob >= 20) return 'Berawan';
    return 'Cerah Berawan';
  };

  // Hitung data per wilayah/kecamatan
  const districtsMap = {};
  FALLBACK_REGIONS.forEach((reg) => {
    const sec = ADM4_TO_SECTION[reg.adm4] || WEATHER_SECTIONS[0];
    const isCurrentActive = reg.adm4 === currentAdm4;

    if (isCurrentActive && baseWeather) {
      districtsMap[reg.adm4] = {
        ...reg,
        sectionId: sec.id,
        sectionName: sec.name,
        temperature: baseTemp,
        probability_of_rain: baseProb,
        humidity: baseHum,
        weather_condition: baseCond,
        wind_speed: baseWeather?.wind_speed ?? 18.0,
        isExactBmkg: true,
      };
      return;
    }

    // Korelasi berdasarkan microclimate sektor
    const offset = sec.microclimate || {};
    const seededVariability = ((parseInt(reg.adm4.slice(-4), 10) || 1000) % 7) - 3;
    const temp = Math.round((baseTemp + (offset.tempOffset || 0) + seededVariability * 0.2) * 10) / 10;
    const prob = Math.max(5, Math.min(95, Math.round(baseProb + (offset.rainOffset || 0) + seededVariability * 2)));
    const hum = Math.max(30, Math.min(98, Math.round(baseHum + (offset.humidityOffset || 0) + seededVariability)));
    const condition = getConditionFromProb(prob, offset.defaultCondition || 'Berawan');

    districtsMap[reg.adm4] = {
      ...reg,
      sectionId: sec.id,
      sectionName: sec.name,
      temperature: temp,
      probability_of_rain: prob,
      humidity: hum,
      weather_condition: condition,
      wind_speed: Math.round(15 + Math.abs(seededVariability) * 3),
      isExactBmkg: false,
    };
  });

  // Agregasi per section
  const sectionsWithWeather = WEATHER_SECTIONS.map((sec) => {
    const dList = sec.districtAdm4s.map((code) => districtsMap[code]).filter(Boolean);
    const count = dList.length || 1;

    const avgTemp = Math.round((dList.reduce((acc, d) => acc + d.temperature, 0) / count) * 10) / 10;
    const avgProb = Math.round(dList.reduce((acc, d) => acc + d.probability_of_rain, 0) / count);
    const avgHum = Math.round(dList.reduce((acc, d) => acc + d.humidity, 0) / count);

    // Temukan kondisi dominan
    const dominantCondition = getConditionFromProb(avgProb);
    const isHighRisk = avgProb >= 80;
    const isModerateRisk = avgProb >= 50 && avgProb < 80;

    return {
      ...sec,
      avgTemperature: avgTemp,
      avgProbabilityOfRain: avgProb,
      avgHumidity: avgHum,
      dominantCondition,
      riskLevel: isHighRisk ? 'high' : isModerateRisk ? 'moderate' : 'low',
      hasActiveDistrict: sec.districtAdm4s.includes(currentAdm4),
      districts: dList,
    };
  });

  return {
    districtsMap,
    sectionsWithWeather,
  };
}

