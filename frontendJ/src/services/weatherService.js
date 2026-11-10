import apiClient, { USE_MOCK_DATA } from './apiClient';
import {
  mockCurrentWeather,
  mockForecastDetail,
  mockWeatherStatus,
} from '../mocks/mockWeather';

export const DEFAULT_ADM4 = '35.78.07.1001';

export const FALLBACK_REGIONS = [
  {
    adm4: '35.78.07.1001',
    label: 'Genteng, Kota Surabaya',
    subdistrict: 'Embong Kaliasin',
    district: 'Genteng',
    city: 'Kota Surabaya',
    province: 'Jawa Timur',
    latitude: -7.26807,
    longitude: 112.744108,
  },
  {
    adm4: '35.78.08.1001',
    label: 'Gubeng, Kota Surabaya',
    subdistrict: 'Gubeng',
    district: 'Gubeng',
    city: 'Kota Surabaya',
    province: 'Jawa Timur',
    latitude: -7.2729,
    longitude: 112.749495,
  },
  {
    adm4: '35.78.04.1001',
    label: 'Wonokromo, Kota Surabaya',
    subdistrict: 'Wonokromo',
    district: 'Wonokromo',
    city: 'Kota Surabaya',
    province: 'Jawa Timur',
    latitude: -7.305127,
    longitude: 112.731612,
  },
  {
    adm4: '35.78.03.1001',
    label: 'Rungkut, Kota Surabaya',
    subdistrict: 'Kalirungkut',
    district: 'Rungkut',
    city: 'Kota Surabaya',
    province: 'Jawa Timur',
    latitude: -7.322299,
    longitude: 112.770703,
  },
  {
    adm4: '35.78.09.1001',
    label: 'Sukolilo, Kota Surabaya',
    subdistrict: 'Keputih',
    district: 'Sukolilo',
    city: 'Kota Surabaya',
    province: 'Jawa Timur',
    latitude: -7.289727,
    longitude: 112.819477,
  },
  {
    adm4: '35.78.10.1001',
    label: 'Tambaksari, Kota Surabaya',
    subdistrict: 'Tambaksari',
    district: 'Tambaksari',
    city: 'Kota Surabaya',
    province: 'Jawa Timur',
    latitude: -7.253365,
    longitude: 112.755155,
  },
  {
    adm4: '35.78.05.1001',
    label: 'Tegalsari, Kota Surabaya',
    subdistrict: 'Tegalsari',
    district: 'Tegalsari',
    city: 'Kota Surabaya',
    province: 'Jawa Timur',
    latitude: -7.270754,
    longitude: 112.737619,
  },
  {
    adm4: '35.78.06.1001',
    label: 'Sawahan, Kota Surabaya',
    subdistrict: 'Petemon',
    district: 'Sawahan',
    city: 'Kota Surabaya',
    province: 'Jawa Timur',
    latitude: -7.261793,
    longitude: 112.719149,
  },
  {
    adm4: '35.78.02.1001',
    label: 'Wonocolo, Kota Surabaya',
    subdistrict: 'Sidosermo',
    district: 'Wonocolo',
    city: 'Kota Surabaya',
    province: 'Jawa Timur',
    latitude: -7.310462,
    longitude: 112.753087,
  },
  {
    adm4: '35.78.01.1001',
    label: 'Karang Pilang, Kota Surabaya',
    subdistrict: 'Karang Pilang',
    district: 'Karang Pilang',
    city: 'Kota Surabaya',
    province: 'Jawa Timur',
    latitude: -7.340577,
    longitude: 112.689937,
  },
  {
    adm4: '35.78.14.1002',
    label: 'Tandes, Kota Surabaya',
    subdistrict: 'Tandes',
    district: 'Tandes',
    city: 'Kota Surabaya',
    province: 'Jawa Timur',
    latitude: -7.258994,
    longitude: 112.68594,
  },
  {
    adm4: '35.78.17.1001',
    label: 'Kenjeran, Kota Surabaya',
    subdistrict: 'Tanah Kali Kedinding',
    district: 'Kenjeran',
    city: 'Kota Surabaya',
    province: 'Jawa Timur',
    latitude: -7.226769,
    longitude: 112.774316,
  },
  {
    adm4: '35.78.15.1001',
    label: 'Krembangan, Kota Surabaya',
    subdistrict: 'Krembangan Selatan',
    district: 'Krembangan',
    city: 'Kota Surabaya',
    province: 'Jawa Timur',
    latitude: -7.238621,
    longitude: 112.735112,
  },
  {
    adm4: '35.78.16.1001',
    label: 'Semampir, Kota Surabaya',
    subdistrict: 'Ampel',
    district: 'Semampir',
    city: 'Kota Surabaya',
    province: 'Jawa Timur',
    latitude: -7.22917,
    longitude: 112.74317,
  },
  {
    adm4: '35.78.12.1001',
    label: 'Pabean Cantian, Kota Surabaya',
    subdistrict: 'Bongkaran',
    district: 'Pabean Cantian',
    city: 'Kota Surabaya',
    province: 'Jawa Timur',
    latitude: -7.242338,
    longitude: 112.743002,
  },
  {
    adm4: '35.78.13.1001',
    label: 'Bubutan, Kota Surabaya',
    subdistrict: 'Alun-alun Contong',
    district: 'Bubutan',
    city: 'Kota Surabaya',
    province: 'Jawa Timur',
    latitude: -7.249652,
    longitude: 112.738462,
  },
  {
    adm4: '35.78.11.1001',
    label: 'Simokerto, Kota Surabaya',
    subdistrict: 'Simokerto',
    district: 'Simokerto',
    city: 'Kota Surabaya',
    province: 'Jawa Timur',
    latitude: -7.237983,
    longitude: 112.756969,
  },
  {
    adm4: '35.78.18.1001',
    label: 'Lakarsantri, Kota Surabaya',
    subdistrict: 'Bangkingan',
    district: 'Lakarsantri',
    city: 'Kota Surabaya',
    province: 'Jawa Timur',
    latitude: -7.323786,
    longitude: 112.656806,
  },
  {
    adm4: '35.78.19.1001',
    label: 'Benowo, Kota Surabaya',
    subdistrict: 'Kandangan',
    district: 'Benowo',
    city: 'Kota Surabaya',
    province: 'Jawa Timur',
    latitude: -7.247702,
    longitude: 112.651128,
  },
  {
    adm4: '35.78.20.1001',
    label: 'Wiyung, Kota Surabaya',
    subdistrict: 'Wiyung',
    district: 'Wiyung',
    city: 'Kota Surabaya',
    province: 'Jawa Timur',
    latitude: -7.311868,
    longitude: 112.692892,
  },
  {
    adm4: '35.78.21.1001',
    label: 'Dukuh Pakis, Kota Surabaya',
    subdistrict: 'Dukuh Pakis',
    district: 'Dukuh Pakis',
    city: 'Kota Surabaya',
    province: 'Jawa Timur',
    latitude: -7.292997,
    longitude: 112.710293,
  },
  {
    adm4: '35.78.22.1001',
    label: 'Gayungan, Kota Surabaya',
    subdistrict: 'Gayungan',
    district: 'Gayungan',
    city: 'Kota Surabaya',
    province: 'Jawa Timur',
    latitude: -7.332904,
    longitude: 112.724901,
  },
  {
    adm4: '35.78.23.1001',
    label: 'Jambangan, Kota Surabaya',
    subdistrict: 'Jambangan',
    district: 'Jambangan',
    city: 'Kota Surabaya',
    province: 'Jawa Timur',
    latitude: -7.3192,
    longitude: 112.714363,
  },
  {
    adm4: '35.78.24.1001',
    label: 'Tenggilis Mejoyo, Kota Surabaya',
    subdistrict: 'Kutisari',
    district: 'Tenggilis Mejoyo',
    city: 'Kota Surabaya',
    province: 'Jawa Timur',
    latitude: -7.335426,
    longitude: 112.749727,
  },
  {
    adm4: '35.78.25.1001',
    label: 'Gunung Anyar, Kota Surabaya',
    subdistrict: 'Gunung Anyar',
    district: 'Gunung Anyar',
    city: 'Kota Surabaya',
    province: 'Jawa Timur',
    latitude: -7.338803,
    longitude: 112.788889,
  },
  {
    adm4: '35.78.26.1001',
    label: 'Mulyorejo, Kota Surabaya',
    subdistrict: 'Mulyorejo',
    district: 'Mulyorejo',
    city: 'Kota Surabaya',
    province: 'Jawa Timur',
    latitude: -7.27062,
    longitude: 112.782927,
  },
  {
    adm4: '35.78.27.1001',
    label: 'Sukomanunggal, Kota Surabaya',
    subdistrict: 'Sukomanunggal',
    district: 'Sukomanunggal',
    city: 'Kota Surabaya',
    province: 'Jawa Timur',
    latitude: -7.263447,
    longitude: 112.697121,
  },
  {
    adm4: '35.78.28.1001',
    label: 'Asem Rowo, Kota Surabaya',
    subdistrict: 'Asem Rowo',
    district: 'Asem Rowo',
    city: 'Kota Surabaya',
    province: 'Jawa Timur',
    latitude: -7.245314,
    longitude: 112.703629,
  },
  {
    adm4: '35.78.29.1001',
    label: 'Bulak, Kota Surabaya',
    subdistrict: 'Kedung Cowek',
    district: 'Bulak',
    city: 'Kota Surabaya',
    province: 'Jawa Timur',
    latitude: -7.21807,
    longitude: 112.782237,
  },
  {
    adm4: '35.78.30.1001',
    label: 'Pakal, Kota Surabaya',
    subdistrict: 'Pakal',
    district: 'Pakal',
    city: 'Kota Surabaya',
    province: 'Jawa Timur',
    latitude: -7.237907,
    longitude: 112.619039,
  },
  {
    adm4: '35.78.31.1001',
    label: 'Sambikerep, Kota Surabaya',
    subdistrict: 'Sambikerep',
    district: 'Sambikerep',
    city: 'Kota Surabaya',
    province: 'Jawa Timur',
    latitude: -7.27699,
    longitude: 112.652103,
  },
  {
    adm4: '35.24.22.2001',
    label: 'Lamongan, Lamongan',
    subdistrict: 'Rancangkencono',
    district: 'Lamongan',
    city: 'Lamongan',
    province: 'Jawa Timur',
    latitude: -7.15212,
    longitude: 112.37487,
  },
  {
    adm4: '35.24.05.2002',
    label: 'Babat, Lamongan',
    subdistrict: 'Karangkembang',
    district: 'Babat',
    city: 'Lamongan',
    province: 'Jawa Timur',
    latitude: -7.120704,
    longitude: 112.168539,
  },
  {
    adm4: '35.24.17.2001',
    label: 'Sukodadi, Lamongan',
    subdistrict: 'Siwalanrejo',
    district: 'Sukodadi',
    city: 'Lamongan',
    province: 'Jawa Timur',
    latitude: -7.136378,
    longitude: 112.321833,
  },
  {
    adm4: '35.24.14.1001',
    label: 'Paciran, Lamongan',
    subdistrict: 'Blimbing',
    district: 'Paciran',
    city: 'Lamongan',
    province: 'Jawa Timur',
    latitude: -6.884575,
    longitude: 112.300341,
  },
  {
    adm4: '35.24.07.2001',
    label: 'Brondong, Lamongan',
    subdistrict: 'Lohgung',
    district: 'Brondong',
    city: 'Lamongan',
    province: 'Jawa Timur',
    latitude: -6.900707,
    longitude: 112.181616,
  },
  {
    adm4: '35.24.25.2001',
    label: 'Deket, Lamongan',
    subdistrict: 'Sidorejo',
    district: 'Deket',
    city: 'Lamongan',
    province: 'Jawa Timur',
    latitude: -7.103144,
    longitude: 112.429561,
  },
  {
    adm4: '35.24.21.2001',
    label: 'Turi, Lamongan',
    subdistrict: 'Geger',
    district: 'Turi',
    city: 'Lamongan',
    province: 'Jawa Timur',
    latitude: -7.069698,
    longitude: 112.351021,
  },
  {
    adm4: '35.24.23.2001',
    label: 'Tikung, Lamongan',
    subdistrict: 'Wonokromo',
    district: 'Tikung',
    city: 'Lamongan',
    province: 'Jawa Timur',
    latitude: -7.201833,
    longitude: 112.390889,
  },
  {
    adm4: '35.24.16.2001',
    label: 'Mantup, Lamongan',
    subdistrict: 'Sukobendu',
    district: 'Mantup',
    city: 'Lamongan',
    province: 'Jawa Timur',
    latitude: -7.207596,
    longitude: 112.32042,
  },
  {
    adm4: '35.24.13.2001',
    label: 'Pucuk, Lamongan',
    subdistrict: 'Pucuk',
    district: 'Pucuk',
    city: 'Lamongan',
    province: 'Jawa Timur',
    latitude: -7.096045,
    longitude: 112.264258,
  },
  {
    adm4: '35.24.06.2001',
    label: 'Kedungpring, Lamongan',
    subdistrict: 'Dradahblumbang',
    district: 'Kedungpring',
    city: 'Lamongan',
    province: 'Jawa Timur',
    latitude: -7.21831,
    longitude: 112.185502,
  },
  {
    adm4: '35.24.12.2001',
    label: 'Sugio, Lamongan',
    subdistrict: 'Sidobogem',
    district: 'Sugio',
    city: 'Lamongan',
    province: 'Jawa Timur',
    latitude: -7.151866,
    longitude: 112.236502,
  },
  {
    adm4: '35.24.11.2001',
    label: 'Sambeng, Lamongan',
    subdistrict: 'Sidokumpul',
    district: 'Sambeng',
    city: 'Lamongan',
    province: 'Jawa Timur',
    latitude: -7.309698,
    longitude: 112.226784,
  },
  {
    adm4: '35.24.09.2001',
    label: 'Sekaran, Lamongan',
    subdistrict: 'Besur',
    district: 'Sekaran',
    city: 'Lamongan',
    province: 'Jawa Timur',
    latitude: -7.071833,
    longitude: 112.222611,
  },
  {
    adm4: '35.24.08.2001',
    label: 'Laren, Lamongan',
    subdistrict: 'Dateng',
    district: 'Laren',
    city: 'Lamongan',
    province: 'Jawa Timur',
    latitude: -6.965717,
    longitude: 112.220053,
  },
  {
    adm4: '35.24.15.2001',
    label: 'Solokuro, Lamongan',
    subdistrict: 'Dadapan',
    district: 'Solokuro',
    city: 'Lamongan',
    province: 'Jawa Timur',
    latitude: -6.920234,
    longitude: 112.300799,
  },
  {
    adm4: '35.24.18.2001',
    label: 'Karanggeneng, Lamongan',
    subdistrict: 'Bantengputih',
    district: 'Karanggeneng',
    city: 'Lamongan',
    province: 'Jawa Timur',
    latitude: -7.008238,
    longitude: 112.310363,
  },
  {
    adm4: '35.24.24.2001',
    label: 'Karangbinangun, Lamongan',
    subdistrict: 'Waruk',
    district: 'Karangbinangun',
    city: 'Lamongan',
    province: 'Jawa Timur',
    latitude: -7.034829,
    longitude: 112.415832,
  },
  {
    adm4: '35.24.26.2001',
    label: 'Glagah, Lamongan',
    subdistrict: 'Soko',
    district: 'Glagah',
    city: 'Lamongan',
    province: 'Jawa Timur',
    latitude: -7.058844,
    longitude: 112.459353,
  },
  {
    adm4: '35.24.20.2001',
    label: 'Kalitengah, Lamongan',
    subdistrict: 'Pucangro',
    district: 'Kalitengah',
    city: 'Lamongan',
    province: 'Jawa Timur',
    latitude: -7.045366,
    longitude: 112.354743,
  },
  {
    adm4: '35.24.10.2001',
    label: 'Maduran, Lamongan',
    subdistrict: 'Duriwetan',
    district: 'Maduran',
    city: 'Lamongan',
    province: 'Jawa Timur',
    latitude: -7.035442,
    longitude: 112.235375,
  },
  {
    adm4: '35.24.19.2001',
    label: 'Kembangbahu, Lamongan',
    subdistrict: 'Tlogoagung',
    district: 'Kembangbahu',
    city: 'Lamongan',
    province: 'Jawa Timur',
    latitude: -7.185517,
    longitude: 112.322996,
  },
  {
    adm4: '35.24.27.2001',
    label: 'Sarirejo, Lamongan',
    subdistrict: 'Kedungkumpul',
    district: 'Sarirejo',
    city: 'Lamongan',
    province: 'Jawa Timur',
    latitude: -7.204854,
    longitude: 112.430267,
  },
  {
    adm4: '35.24.03.2001',
    label: 'Modo, Lamongan',
    subdistrict: 'Jegreg',
    district: 'Modo',
    city: 'Lamongan',
    province: 'Jawa Timur',
    latitude: -7.24957,
    longitude: 112.096051,
  },
  {
    adm4: '35.24.04.2001',
    label: 'Ngimbang, Lamongan',
    subdistrict: 'Kedungmentawar',
    district: 'Ngimbang',
    city: 'Lamongan',
    province: 'Jawa Timur',
    latitude: -7.355087,
    longitude: 112.158214,
  },
  {
    adm4: '35.24.02.2001',
    label: 'Bluluk, Lamongan',
    subdistrict: 'Talunrejo',
    district: 'Bluluk',
    city: 'Lamongan',
    province: 'Jawa Timur',
    latitude: -7.295561,
    longitude: 112.101883,
  },
  {
    adm4: '35.24.01.2001',
    label: 'Sukorame, Lamongan',
    subdistrict: 'Sembung',
    district: 'Sukorame',
    city: 'Lamongan',
    province: 'Jawa Timur',
    latitude: -7.336706,
    longitude: 112.083136,
  },
  {
    adm4: '35.73.01.1001',
    label: 'Klojen, Kota Malang',
    subdistrict: 'Klojen',
    district: 'Klojen',
    city: 'Kota Malang',
    province: 'Jawa Timur',
    latitude: -7.9786,
    longitude: 112.6317,
  },
  {
    adm4: '35.10.01.1001',
    label: 'Banyuwangi Kota',
    subdistrict: 'Kepatihan',
    district: 'Banyuwangi',
    city: 'Kab. Banyuwangi',
    province: 'Jawa Timur',
    latitude: -8.2192,
    longitude: 114.3691,
  },
  {
    adm4: '35.77.01.1001',
    label: 'Kartoharjo, Kota Madiun',
    subdistrict: 'Kartoharjo',
    district: 'Kartoharjo',
    city: 'Kota Madiun',
    province: 'Jawa Timur',
    latitude: -7.6298,
    longitude: 111.5239,
  },
  {
    adm4: '35.28.01.1001',
    label: 'Pamekasan Kota, Madura',
    subdistrict: 'Barurambat',
    district: 'Pamekasan',
    city: 'Kab. Pamekasan',
    province: 'Jawa Timur',
    latitude: -7.1593,
    longitude: 113.4739,
  },
];

export const weatherService = {
  /**
   * Mengambil daftar wilayah tingkat IV (ADM4) populer
   */
  async getPopularRegions() {
    try {
      const response = await apiClient.get('/weather/regions');
      return response.data;
    } catch {
      return FALLBACK_REGIONS;
    }
  },

  /**
   * Menemukan wilayah BMKG terdekat berdasarkan koordinat GPS
   */
  async getNearestRegion(lat, lon) {
    if (USE_MOCK_DATA) {
      await new Promise((r) => setTimeout(r, 200));
      return {
        nearest_region: FALLBACK_REGIONS[0],
        distance_km: 1.25,
        user_coordinates: { latitude: lat, longitude: lon },
      };
    }

    const response = await apiClient.get('/weather/nearest', {
      params: { lat, lon },
    });
    return response.data;
  },

  /**
   * Mengambil kondisi cuaca terkini berdasarkan kode adm4 BMKG atau koordinat GPS
   */
  async getCurrentWeather(adm4 = DEFAULT_ADM4, lat = null, lon = null) {
    if (USE_MOCK_DATA) {
      await new Promise((r) => setTimeout(r, 250));
      return {
        ...mockCurrentWeather,
        adm4,
        fetched_at: new Date().toISOString(),
      };
    }

    const params = {};
    if (adm4) params.adm4 = adm4;
    if (lat !== null && lat !== undefined) params.lat = lat;
    if (lon !== null && lon !== undefined) params.lon = lon;

    const response = await apiClient.get('/weather/current', { params });
    return response.data;
  },

  /**
   * Mengambil prakiraan cuaca detail dan time series BMKG
   */
  async getForecast(adm4 = DEFAULT_ADM4, lat = null, lon = null) {
    if (USE_MOCK_DATA) {
      await new Promise((r) => setTimeout(r, 350));
      return {
        ...mockForecastDetail,
        adm4,
        fetched_at: new Date().toISOString(),
      };
    }

    const params = {};
    if (adm4) params.adm4 = adm4;
    if (lat !== null && lat !== undefined) params.lat = lat;
    if (lon !== null && lon !== undefined) params.lon = lon;

    const response = await apiClient.get('/weather/forecast', { params });
    return response.data;
  },

  /**
   * Mengambil status kesehatan & cache API cuaca
   */
  async getWeatherStatus(adm4 = DEFAULT_ADM4) {
    if (USE_MOCK_DATA) {
      await new Promise((r) => setTimeout(r, 200));
      return {
        ...mockWeatherStatus,
        adm4,
        last_successful_fetch: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
        cache_expires_at: new Date(Date.now() + 12 * 60 * 1000).toISOString(),
      };
    }

    const response = await apiClient.get('/weather/status', {
      params: adm4 ? { adm4 } : {},
    });
    return response.data;
  },

  /**
   * Meminta backend merefresh data dari BMKG (POST /weather/refresh)
   */
  async refreshWeather(adm4 = DEFAULT_ADM4, lat = null, lon = null) {
    if (USE_MOCK_DATA) {
      await new Promise((r) => setTimeout(r, 600));
      return {
        success: true,
        message: 'Data cuaca regional berhasil diperbarui dari satelit simulasi.',
        weather: {
          ...mockCurrentWeather,
          adm4,
          fetched_at: new Date().toISOString(),
          is_stale: false,
          is_cached: false,
        },
      };
    }

    const params = {};
    if (adm4) params.adm4 = adm4;
    if (lat !== null && lat !== undefined) params.lat = lat;
    if (lon !== null && lon !== undefined) params.lon = lon;

    const response = await apiClient.post('/weather/refresh', null, { params });
    return response.data;
  },
};

export default weatherService;
