import json
import logging
import math
from datetime import datetime, timedelta, timezone
from typing import Optional, List, Dict, Any, Tuple
import httpx
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.config import settings
from app.models.forecast import WeatherForecast
from app.schemas.weather import (
    WeatherResponse,
    WeatherForecastDetailResponse,
    WeatherDataPoint,
    BMKGRegionItem,
    NearestRegionResponse,
    UserCoordinates,
)
from app.utils.datetime import now_jakarta

logger = logging.getLogger("weather_service")

# Basis Data Wilayah BMKG Tingkat IV Terfokus (Kota Surabaya & Kabupaten Lamongan)
POPULAR_BMKG_REGIONS: List[Dict[str, Any]] = [
    # === KOTA SURABAYA ===
    {
        "adm4": "35.78.07.1001",
        "label": "Genteng, Kota Surabaya",
        "subdistrict": "Embong Kaliasin",
        "district": "Genteng",
        "city": "Kota Surabaya",
        "province": "Jawa Timur",
        "latitude": -7.26807,
        "longitude": 112.744108,
    },
    {
        "adm4": "35.78.08.1001",
        "label": "Gubeng, Kota Surabaya",
        "subdistrict": "Gubeng",
        "district": "Gubeng",
        "city": "Kota Surabaya",
        "province": "Jawa Timur",
        "latitude": -7.2729,
        "longitude": 112.749495,
    },
    {
        "adm4": "35.78.04.1001",
        "label": "Wonokromo, Kota Surabaya",
        "subdistrict": "Wonokromo",
        "district": "Wonokromo",
        "city": "Kota Surabaya",
        "province": "Jawa Timur",
        "latitude": -7.305127,
        "longitude": 112.731612,
    },
    {
        "adm4": "35.78.03.1001",
        "label": "Rungkut, Kota Surabaya",
        "subdistrict": "Kalirungkut",
        "district": "Rungkut",
        "city": "Kota Surabaya",
        "province": "Jawa Timur",
        "latitude": -7.322299,
        "longitude": 112.770703,
    },
    {
        "adm4": "35.78.09.1001",
        "label": "Sukolilo, Kota Surabaya",
        "subdistrict": "Keputih",
        "district": "Sukolilo",
        "city": "Kota Surabaya",
        "province": "Jawa Timur",
        "latitude": -7.289727,
        "longitude": 112.819477,
    },
    {
        "adm4": "35.78.10.1001",
        "label": "Tambaksari, Kota Surabaya",
        "subdistrict": "Tambaksari",
        "district": "Tambaksari",
        "city": "Kota Surabaya",
        "province": "Jawa Timur",
        "latitude": -7.253365,
        "longitude": 112.755155,
    },
    {
        "adm4": "35.78.05.1001",
        "label": "Tegalsari, Kota Surabaya",
        "subdistrict": "Tegalsari",
        "district": "Tegalsari",
        "city": "Kota Surabaya",
        "province": "Jawa Timur",
        "latitude": -7.270754,
        "longitude": 112.737619,
    },
    {
        "adm4": "35.78.06.1001",
        "label": "Sawahan, Kota Surabaya",
        "subdistrict": "Petemon",
        "district": "Sawahan",
        "city": "Kota Surabaya",
        "province": "Jawa Timur",
        "latitude": -7.261793,
        "longitude": 112.719149,
    },
    {
        "adm4": "35.78.02.1001",
        "label": "Wonocolo, Kota Surabaya",
        "subdistrict": "Sidosermo",
        "district": "Wonocolo",
        "city": "Kota Surabaya",
        "province": "Jawa Timur",
        "latitude": -7.310462,
        "longitude": 112.753087,
    },
    {
        "adm4": "35.78.01.1001",
        "label": "Karang Pilang, Kota Surabaya",
        "subdistrict": "Karang Pilang",
        "district": "Karang Pilang",
        "city": "Kota Surabaya",
        "province": "Jawa Timur",
        "latitude": -7.340577,
        "longitude": 112.689937,
    },
    {
        "adm4": "35.78.14.1002",
        "label": "Tandes, Kota Surabaya",
        "subdistrict": "Tandes",
        "district": "Tandes",
        "city": "Kota Surabaya",
        "province": "Jawa Timur",
        "latitude": -7.258994,
        "longitude": 112.68594,
    },
    {
        "adm4": "35.78.17.1001",
        "label": "Kenjeran, Kota Surabaya",
        "subdistrict": "Tanah Kali Kedinding",
        "district": "Kenjeran",
        "city": "Kota Surabaya",
        "province": "Jawa Timur",
        "latitude": -7.226769,
        "longitude": 112.774316,
    },
    {
        "adm4": "35.78.15.1001",
        "label": "Krembangan, Kota Surabaya",
        "subdistrict": "Krembangan Selatan",
        "district": "Krembangan",
        "city": "Kota Surabaya",
        "province": "Jawa Timur",
        "latitude": -7.238621,
        "longitude": 112.735112,
    },
    {
        "adm4": "35.78.16.1001",
        "label": "Semampir, Kota Surabaya",
        "subdistrict": "Ampel",
        "district": "Semampir",
        "city": "Kota Surabaya",
        "province": "Jawa Timur",
        "latitude": -7.22917,
        "longitude": 112.74317,
    },
    {
        "adm4": "35.78.12.1001",
        "label": "Pabean Cantian, Kota Surabaya",
        "subdistrict": "Bongkaran",
        "district": "Pabean Cantian",
        "city": "Kota Surabaya",
        "province": "Jawa Timur",
        "latitude": -7.242338,
        "longitude": 112.743002,
    },
    {
        "adm4": "35.78.13.1001",
        "label": "Bubutan, Kota Surabaya",
        "subdistrict": "Alun-alun Contong",
        "district": "Bubutan",
        "city": "Kota Surabaya",
        "province": "Jawa Timur",
        "latitude": -7.249652,
        "longitude": 112.738462,
    },
    {
        "adm4": "35.78.11.1001",
        "label": "Simokerto, Kota Surabaya",
        "subdistrict": "Simokerto",
        "district": "Simokerto",
        "city": "Kota Surabaya",
        "province": "Jawa Timur",
        "latitude": -7.237983,
        "longitude": 112.756969,
    },
    {
        "adm4": "35.78.18.1001",
        "label": "Lakarsantri, Kota Surabaya",
        "subdistrict": "Bangkingan",
        "district": "Lakarsantri",
        "city": "Kota Surabaya",
        "province": "Jawa Timur",
        "latitude": -7.323786,
        "longitude": 112.656806,
    },
    {
        "adm4": "35.78.19.1001",
        "label": "Benowo, Kota Surabaya",
        "subdistrict": "Kandangan",
        "district": "Benowo",
        "city": "Kota Surabaya",
        "province": "Jawa Timur",
        "latitude": -7.247702,
        "longitude": 112.651128,
    },
    {
        "adm4": "35.78.20.1001",
        "label": "Wiyung, Kota Surabaya",
        "subdistrict": "Wiyung",
        "district": "Wiyung",
        "city": "Kota Surabaya",
        "province": "Jawa Timur",
        "latitude": -7.311868,
        "longitude": 112.692892,
    },
    {
        "adm4": "35.78.21.1001",
        "label": "Dukuh Pakis, Kota Surabaya",
        "subdistrict": "Dukuh Pakis",
        "district": "Dukuh Pakis",
        "city": "Kota Surabaya",
        "province": "Jawa Timur",
        "latitude": -7.292997,
        "longitude": 112.710293,
    },
    {
        "adm4": "35.78.22.1001",
        "label": "Gayungan, Kota Surabaya",
        "subdistrict": "Gayungan",
        "district": "Gayungan",
        "city": "Kota Surabaya",
        "province": "Jawa Timur",
        "latitude": -7.332904,
        "longitude": 112.724901,
    },
    {
        "adm4": "35.78.23.1001",
        "label": "Jambangan, Kota Surabaya",
        "subdistrict": "Jambangan",
        "district": "Jambangan",
        "city": "Kota Surabaya",
        "province": "Jawa Timur",
        "latitude": -7.3192,
        "longitude": 112.714363,
    },
    {
        "adm4": "35.78.24.1001",
        "label": "Tenggilis Mejoyo, Kota Surabaya",
        "subdistrict": "Kutisari",
        "district": "Tenggilis Mejoyo",
        "city": "Kota Surabaya",
        "province": "Jawa Timur",
        "latitude": -7.335426,
        "longitude": 112.749727,
    },
    {
        "adm4": "35.78.25.1001",
        "label": "Gunung Anyar, Kota Surabaya",
        "subdistrict": "Gunung Anyar",
        "district": "Gunung Anyar",
        "city": "Kota Surabaya",
        "province": "Jawa Timur",
        "latitude": -7.338803,
        "longitude": 112.788889,
    },
    {
        "adm4": "35.78.26.1001",
        "label": "Mulyorejo, Kota Surabaya",
        "subdistrict": "Mulyorejo",
        "district": "Mulyorejo",
        "city": "Kota Surabaya",
        "province": "Jawa Timur",
        "latitude": -7.27062,
        "longitude": 112.782927,
    },
    {
        "adm4": "35.78.27.1001",
        "label": "Sukomanunggal, Kota Surabaya",
        "subdistrict": "Sukomanunggal",
        "district": "Sukomanunggal",
        "city": "Kota Surabaya",
        "province": "Jawa Timur",
        "latitude": -7.263447,
        "longitude": 112.697121,
    },
    {
        "adm4": "35.78.28.1001",
        "label": "Asem Rowo, Kota Surabaya",
        "subdistrict": "Asem Rowo",
        "district": "Asem Rowo",
        "city": "Kota Surabaya",
        "province": "Jawa Timur",
        "latitude": -7.245314,
        "longitude": 112.703629,
    },
    {
        "adm4": "35.78.29.1001",
        "label": "Bulak, Kota Surabaya",
        "subdistrict": "Kedung Cowek",
        "district": "Bulak",
        "city": "Kota Surabaya",
        "province": "Jawa Timur",
        "latitude": -7.21807,
        "longitude": 112.782237,
    },
    {
        "adm4": "35.78.30.1001",
        "label": "Pakal, Kota Surabaya",
        "subdistrict": "Pakal",
        "district": "Pakal",
        "city": "Kota Surabaya",
        "province": "Jawa Timur",
        "latitude": -7.237907,
        "longitude": 112.619039,
    },
    {
        "adm4": "35.78.31.1001",
        "label": "Sambikerep, Kota Surabaya",
        "subdistrict": "Sambikerep",
        "district": "Sambikerep",
        "city": "Kota Surabaya",
        "province": "Jawa Timur",
        "latitude": -7.27699,
        "longitude": 112.652103,
    },
    # === KABUPATEN LAMONGAN ===
    {
        "adm4": "35.24.22.2001",
        "label": "Lamongan, Lamongan",
        "subdistrict": "Rancangkencono",
        "district": "Lamongan",
        "city": "Lamongan",
        "province": "Jawa Timur",
        "latitude": -7.15212,
        "longitude": 112.37487,
    },
    {
        "adm4": "35.24.05.2002",
        "label": "Babat, Lamongan",
        "subdistrict": "Karangkembang",
        "district": "Babat",
        "city": "Lamongan",
        "province": "Jawa Timur",
        "latitude": -7.120704,
        "longitude": 112.168539,
    },
    {
        "adm4": "35.24.17.2001",
        "label": "Sukodadi, Lamongan",
        "subdistrict": "Siwalanrejo",
        "district": "Sukodadi",
        "city": "Lamongan",
        "province": "Jawa Timur",
        "latitude": -7.136378,
        "longitude": 112.321833,
    },
    {
        "adm4": "35.24.14.1001",
        "label": "Paciran, Lamongan",
        "subdistrict": "Blimbing",
        "district": "Paciran",
        "city": "Lamongan",
        "province": "Jawa Timur",
        "latitude": -6.884575,
        "longitude": 112.300341,
    },
    {
        "adm4": "35.24.07.2001",
        "label": "Brondong, Lamongan",
        "subdistrict": "Lohgung",
        "district": "Brondong",
        "city": "Lamongan",
        "province": "Jawa Timur",
        "latitude": -6.900707,
        "longitude": 112.181616,
    },
    {
        "adm4": "35.24.25.2001",
        "label": "Deket, Lamongan",
        "subdistrict": "Sidorejo",
        "district": "Deket",
        "city": "Lamongan",
        "province": "Jawa Timur",
        "latitude": -7.103144,
        "longitude": 112.429561,
    },
    {
        "adm4": "35.24.21.2001",
        "label": "Turi, Lamongan",
        "subdistrict": "Geger",
        "district": "Turi",
        "city": "Lamongan",
        "province": "Jawa Timur",
        "latitude": -7.069698,
        "longitude": 112.351021,
    },
    {
        "adm4": "35.24.23.2001",
        "label": "Tikung, Lamongan",
        "subdistrict": "Wonokromo",
        "district": "Tikung",
        "city": "Lamongan",
        "province": "Jawa Timur",
        "latitude": -7.201833,
        "longitude": 112.390889,
    },
    {
        "adm4": "35.24.16.2001",
        "label": "Mantup, Lamongan",
        "subdistrict": "Sukobendu",
        "district": "Mantup",
        "city": "Lamongan",
        "province": "Jawa Timur",
        "latitude": -7.207596,
        "longitude": 112.32042,
    },
    {
        "adm4": "35.24.13.2001",
        "label": "Pucuk, Lamongan",
        "subdistrict": "Pucuk",
        "district": "Pucuk",
        "city": "Lamongan",
        "province": "Jawa Timur",
        "latitude": -7.096045,
        "longitude": 112.264258,
    },
    {
        "adm4": "35.24.06.2001",
        "label": "Kedungpring, Lamongan",
        "subdistrict": "Dradahblumbang",
        "district": "Kedungpring",
        "city": "Lamongan",
        "province": "Jawa Timur",
        "latitude": -7.21831,
        "longitude": 112.185502,
    },
    {
        "adm4": "35.24.12.2001",
        "label": "Sugio, Lamongan",
        "subdistrict": "Sidobogem",
        "district": "Sugio",
        "city": "Lamongan",
        "province": "Jawa Timur",
        "latitude": -7.151866,
        "longitude": 112.236502,
    },
    {
        "adm4": "35.24.11.2001",
        "label": "Sambeng, Lamongan",
        "subdistrict": "Sidokumpul",
        "district": "Sambeng",
        "city": "Lamongan",
        "province": "Jawa Timur",
        "latitude": -7.309698,
        "longitude": 112.226784,
    },
    {
        "adm4": "35.24.09.2001",
        "label": "Sekaran, Lamongan",
        "subdistrict": "Besur",
        "district": "Sekaran",
        "city": "Lamongan",
        "province": "Jawa Timur",
        "latitude": -7.071833,
        "longitude": 112.222611,
    },
    {
        "adm4": "35.24.08.2001",
        "label": "Laren, Lamongan",
        "subdistrict": "Dateng",
        "district": "Laren",
        "city": "Lamongan",
        "province": "Jawa Timur",
        "latitude": -6.965717,
        "longitude": 112.220053,
    },
    {
        "adm4": "35.24.15.2001",
        "label": "Solokuro, Lamongan",
        "subdistrict": "Dadapan",
        "district": "Solokuro",
        "city": "Lamongan",
        "province": "Jawa Timur",
        "latitude": -6.920234,
        "longitude": 112.300799,
    },
    {
        "adm4": "35.24.18.2001",
        "label": "Karanggeneng, Lamongan",
        "subdistrict": "Bantengputih",
        "district": "Karanggeneng",
        "city": "Lamongan",
        "province": "Jawa Timur",
        "latitude": -7.008238,
        "longitude": 112.310363,
    },
    {
        "adm4": "35.24.24.2001",
        "label": "Karangbinangun, Lamongan",
        "subdistrict": "Waruk",
        "district": "Karangbinangun",
        "city": "Lamongan",
        "province": "Jawa Timur",
        "latitude": -7.034829,
        "longitude": 112.415832,
    },
    {
        "adm4": "35.24.26.2001",
        "label": "Glagah, Lamongan",
        "subdistrict": "Soko",
        "district": "Glagah",
        "city": "Lamongan",
        "province": "Jawa Timur",
        "latitude": -7.058844,
        "longitude": 112.459353,
    },
    {
        "adm4": "35.24.20.2001",
        "label": "Kalitengah, Lamongan",
        "subdistrict": "Pucangro",
        "district": "Kalitengah",
        "city": "Lamongan",
        "province": "Jawa Timur",
        "latitude": -7.045366,
        "longitude": 112.354743,
    },
    {
        "adm4": "35.24.10.2001",
        "label": "Maduran, Lamongan",
        "subdistrict": "Duriwetan",
        "district": "Maduran",
        "city": "Lamongan",
        "province": "Jawa Timur",
        "latitude": -7.035442,
        "longitude": 112.235375,
    },
    {
        "adm4": "35.24.19.2001",
        "label": "Kembangbahu, Lamongan",
        "subdistrict": "Tlogoagung",
        "district": "Kembangbahu",
        "city": "Lamongan",
        "province": "Jawa Timur",
        "latitude": -7.185517,
        "longitude": 112.322996,
    },
    {
        "adm4": "35.24.27.2001",
        "label": "Sarirejo, Lamongan",
        "subdistrict": "Kedungkumpul",
        "district": "Sarirejo",
        "city": "Lamongan",
        "province": "Jawa Timur",
        "latitude": -7.204854,
        "longitude": 112.430267,
    },
    {
        "adm4": "35.24.03.2001",
        "label": "Modo, Lamongan",
        "subdistrict": "Jegreg",
        "district": "Modo",
        "city": "Lamongan",
        "province": "Jawa Timur",
        "latitude": -7.24957,
        "longitude": 112.096051,
    },
    {
        "adm4": "35.24.04.2001",
        "label": "Ngimbang, Lamongan",
        "subdistrict": "Kedungmentawar",
        "district": "Ngimbang",
        "city": "Lamongan",
        "province": "Jawa Timur",
        "latitude": -7.355087,
        "longitude": 112.158214,
    },
    {
        "adm4": "35.24.02.2001",
        "label": "Bluluk, Lamongan",
        "subdistrict": "Talunrejo",
        "district": "Bluluk",
        "city": "Lamongan",
        "province": "Jawa Timur",
        "latitude": -7.295561,
        "longitude": 112.101883,
    },
    {
        "adm4": "35.24.01.2001",
        "label": "Sukorame, Lamongan",
        "subdistrict": "Sembung",
        "district": "Sukorame",
        "city": "Lamongan",
        "province": "Jawa Timur",
        "latitude": -7.336706,
        "longitude": 112.083136,
    },
    # === REGIONAL JAWA TIMUR HUBS ===
    {
        "adm4": "35.73.01.1001",
        "label": "Klojen, Kota Malang (Malang Raya)",
        "subdistrict": "Klojen",
        "district": "Klojen",
        "city": "Kota Malang",
        "province": "Jawa Timur",
        "latitude": -7.9786,
        "longitude": 112.6318,
    },
    {
        "adm4": "35.77.01.1001",
        "label": "Kartoharjo, Kota Madiun (Mataraman)",
        "subdistrict": "Kartoharjo",
        "district": "Kartoharjo",
        "city": "Kota Madiun",
        "province": "Jawa Timur",
        "latitude": -7.6298,
        "longitude": 111.5239,
    },
    {
        "adm4": "35.10.15.2001",
        "label": "Giri, Banyuwangi (Tapal Kuda)",
        "subdistrict": "Giri",
        "district": "Giri",
        "city": "Banyuwangi",
        "province": "Jawa Timur",
        "latitude": -8.2045,
        "longitude": 114.3644,
    },
    {
        "adm4": "35.28.03.2001",
        "label": "Pamekasan, Madura",
        "subdistrict": "Barurambat Kota",
        "district": "Pamekasan",
        "city": "Pamekasan",
        "province": "Jawa Timur",
        "latitude": -7.1611,
        "longitude": 113.4744,
    },
]


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Menghitung jarak lingkaran besar (Great-Circle Distance) antara dua titik koordinat dalam kilometer."""
    R = 6371.0  # Radius bumi (km)
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2.0) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(R * c, 2)


def find_nearest_region(lat: float, lon: float) -> Tuple[Dict[str, Any], float]:
    """Menemukan wilayah BMKG tingkat IV terdekat berdasarkan koordinat GPS pengguna."""
    best_region = POPULAR_BMKG_REGIONS[0]
    min_dist = float("inf")

    for reg in POPULAR_BMKG_REGIONS:
        r_lat = reg.get("latitude")
        r_lon = reg.get("longitude")
        if r_lat is not None and r_lon is not None:
            dist = haversine_km(lat, lon, r_lat, r_lon)
            if dist < min_dist:
                min_dist = dist
                best_region = reg

    return best_region, min_dist


def parse_iso_or_local(dt_str: Optional[str], tz) -> Optional[datetime]:
    """Parse string tanggal dari format BMKG (ISO UTC atau format 'YYYY-MM-DD HH:MM:SS')."""
    if not dt_str:
        return None
    try:
        if "T" in dt_str:
            clean = dt_str.replace("Z", "+00:00")
            parsed = datetime.fromisoformat(clean)
            return parsed.astimezone(tz)
        else:
            parsed = datetime.strptime(dt_str, "%Y-%m-%d %H:%M:%S")
            return parsed.replace(tzinfo=tz)
    except Exception:
        return None


class OpenMeteoAdapter:
    """Adapter untuk mengambil data prakiraan cuaca berkecepatan tinggi dari Open-Meteo (Update 15 Menit & Per Jam)."""

    WMO_CODES: Dict[int, str] = {
        0: "Cerah",
        1: "Cerah Berawan",
        2: "Sebagian Berawan",
        3: "Berawan",
        45: "Berkabut",
        48: "Berkabut Rime",
        51: "Gerimis Ringan",
        53: "Gerimis Sedang",
        55: "Gerimis Lebat",
        56: "Gerimis Beku",
        57: "Gerimis Beku Lebat",
        61: "Hujan Ringan",
        63: "Hujan Sedang",
        65: "Hujan Lebat",
        66: "Hujan Beku",
        67: "Hujan Beku Lebat",
        71: "Salju Ringan",
        73: "Salju Sedang",
        75: "Salju Lebat",
        77: "Butiran Salju",
        80: "Hujan Lokal Ringan",
        81: "Hujan Lokal Sedang",
        82: "Hujan Lokal Lebat",
        85: "Hujan Salju",
        86: "Hujan Salju Lebat",
        95: "Badai Petir",
        96: "Badai Petir Ringan",
        99: "Badai Petir Lebat",
    }

    @staticmethod
    def degrees_to_compass(deg: Optional[float]) -> str:
        if deg is None:
            return "T"
        directions = ["U", "UTL", "TL", "TTL", "T", "TGG", "TG", "SGG", "S", "SBD", "BD", "BBD", "B", "BBL", "BL", "UBL"]
        val = int((deg / 22.5) + 0.5)
        return directions[val % 16]

    @staticmethod
    async def fetch(
        lat: float,
        lon: float,
        base_url: str,
        location_meta: Optional[Dict[str, Any]] = None,
        adm4: Optional[str] = None
    ) -> Dict[str, Any]:
        url = base_url.strip()
        params = {
            "latitude": round(lat, 4),
            "longitude": round(lon, 4),
            "current": "temperature_2m,relative_humidity_2m,precipitation,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m",
            "hourly": "temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m",
            "minutely_15": "precipitation",
            "timezone": "Asia/Jakarta",
            "forecast_days": 3,
        }
        headers = {
            "User-Agent": "WeatherRoofingSystem/2.0 (Open-Meteo High-Speed)",
            "Accept": "application/json",
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url, params=params, headers=headers)
            resp.raise_for_status()
            data = resp.json()
            return OpenMeteoAdapter._normalize(data, lat, lon, location_meta, adm4)

    @staticmethod
    def _normalize(
        raw_data: Dict[str, Any],
        lat: float,
        lon: float,
        location_meta: Optional[Dict[str, Any]],
        target_adm4: Optional[str]
    ) -> Dict[str, Any]:
        now = now_jakarta()
        meta = location_meta or {}
        display_location = meta.get("label") or f"Jawa Timur ({lat:.2f}, {lon:.2f})"
        adm4_code = meta.get("adm4") or target_adm4 or getattr(settings, "BMKG_DEFAULT_ADM4", "35.78.07.1001")
        prov = meta.get("province", "Jawa Timur")
        kotkab = meta.get("city", "Kota Surabaya")
        kec = meta.get("district")
        desa = meta.get("subdistrict")

        current = raw_data.get("current", {})
        hourly = raw_data.get("hourly", {})
        minutely_15 = raw_data.get("minutely_15", {})

        cur_temp = float(current.get("temperature_2m", 28.0))
        cur_hum = float(current.get("relative_humidity_2m", 75.0))
        cur_precip = float(current.get("precipitation", 0.0))
        cur_code = int(current.get("weather_code", 2))
        cur_cloud = float(current.get("cloud_cover", 50.0))
        cur_wind_speed = float(current.get("wind_speed_10m", 10.0))
        cur_wind_deg = current.get("wind_direction_10m")
        cur_wind_dir = OpenMeteoAdapter.degrees_to_compass(cur_wind_deg)
        cur_condition = OpenMeteoAdapter.WMO_CODES.get(cur_code, "Berawan")

        # Ekstraksi titik cuaca per jam (72 titik)
        hourly_times = hourly.get("time", [])
        hourly_temps = hourly.get("temperature_2m", [])
        hourly_hums = hourly.get("relative_humidity_2m", [])
        hourly_pops = hourly.get("precipitation_probability", [])
        hourly_precips = hourly.get("precipitation", [])
        hourly_codes = hourly.get("weather_code", [])
        hourly_clouds = hourly.get("cloud_cover", [])
        hourly_winds = hourly.get("wind_speed_10m", [])
        hourly_wind_degs = hourly.get("wind_direction_10m", [])

        hourly_data_points: List[WeatherDataPoint] = []
        cur_pop = 15.0

        for i, t_str in enumerate(hourly_times):
            try:
                dt_parsed = parse_iso_or_local(f"{t_str}:00" if len(t_str) == 16 else t_str, now.tzinfo)
                if not dt_parsed:
                    continue

                code_i = int(hourly_codes[i]) if i < len(hourly_codes) and hourly_codes[i] is not None else 2
                cond_i = OpenMeteoAdapter.WMO_CODES.get(code_i, "Berawan")
                temp_i = float(hourly_temps[i]) if i < len(hourly_temps) and hourly_temps[i] is not None else cur_temp
                hum_i = float(hourly_hums[i]) if i < len(hourly_hums) and hourly_hums[i] is not None else cur_hum
                pop_i = float(hourly_pops[i]) if i < len(hourly_pops) and hourly_pops[i] is not None else 0.0
                precip_i = float(hourly_precips[i]) if i < len(hourly_precips) and hourly_precips[i] is not None else 0.0
                cloud_i = float(hourly_clouds[i]) if i < len(hourly_clouds) and hourly_clouds[i] is not None else cur_cloud
                wind_i = float(hourly_winds[i]) if i < len(hourly_winds) and hourly_winds[i] is not None else cur_wind_speed
                wdeg_i = hourly_wind_degs[i] if i < len(hourly_wind_degs) else None
                wdir_i = OpenMeteoAdapter.degrees_to_compass(wdeg_i)

                if precip_i > 0 or code_i in [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99]:
                    pop_i = max(pop_i, 85.0 + min(13.0, precip_i * 4.0))

                pop_i = round(min(100.0, max(0.0, pop_i)), 1)

                point = WeatherDataPoint(
                    time=dt_parsed,
                    weather_condition=cond_i,
                    probability_of_rain=pop_i,
                    temperature=temp_i,
                    humidity=hum_i,
                    precipitation=precip_i,
                    cloud_cover=cloud_i,
                    wind_speed=wind_i,
                    wind_direction=wdir_i,
                    weather_code=code_i,
                    icon_url=None,
                    local_datetime=t_str.replace("T", " ") + (":00" if len(t_str) == 16 else ""),
                )
                hourly_data_points.append(point)

                if abs((dt_parsed - now).total_seconds()) <= 3600:
                    cur_pop = max(cur_pop, pop_i)
            except Exception:
                continue

        if cur_precip > 0 or cur_code in [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99]:
            cur_pop = max(cur_pop, 90.0)

        m15_precips = minutely_15.get("precipitation", [])
        if m15_precips and any(p > 0 for p in m15_precips[:4]):
            cur_pop = max(cur_pop, 85.0)

        forecast_time = now + timedelta(minutes=settings.EARLY_CLOSE_HORIZON_MINUTES)

        return {
            "provider": "open-meteo",
            "location": display_location,
            "adm4": adm4_code,
            "province": prov,
            "city": kotkab,
            "district": kec,
            "subdistrict": desa,
            "latitude": lat,
            "longitude": lon,
            "timezone": "Asia/Jakarta",
            "probability_of_rain": round(cur_pop, 1),
            "weather_condition": cur_condition,
            "temperature": cur_temp,
            "humidity": cur_hum,
            "precipitation": cur_precip,
            "cloud_cover": cur_cloud,
            "wind_speed": cur_wind_speed,
            "wind_direction": cur_wind_dir,
            "weather_code": cur_code,
            "icon_url": None,
            "forecast_at": forecast_time,
            "hourly_points": hourly_data_points,
            "raw": raw_data,
        }


class BMKGAdapter:
    """Adapter untuk mengambil data prakiraan cuaca dari BMKG Open Data / Publik."""

    @staticmethod
    async def fetch(location: str, base_url: str, adm4: Optional[str] = None) -> Dict[str, Any]:
        url = base_url.strip()
        target_adm4 = (adm4 or getattr(settings, "BMKG_DEFAULT_ADM4", "35.78.07.1001")).strip()
        params = {"adm4": target_adm4}
        headers = {
            "User-Agent": "WeatherRoofingSystem/2.0 (Early-Close Automation Jemuran)",
            "Accept": "application/json",
        }

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url, params=params, headers=headers)
            resp.raise_for_status()
            data = resp.json()
            return BMKGAdapter._normalize(data, location, target_adm4)

    @staticmethod
    def _normalize(raw_data: Any, fallback_location: str, target_adm4: str) -> Dict[str, Any]:
        """Normalisasi struktur data BMKG menjadi format internal."""
        now = now_jakarta()
        lokasi = raw_data.get("lokasi", {}) if isinstance(raw_data, dict) else {}
        prov = lokasi.get("provinsi", "")
        kotkab = lokasi.get("kotkab", "")
        kec = lokasi.get("kecamatan", "")
        desa = lokasi.get("desa", "")
        adm4_code = lokasi.get("adm4") or target_adm4
        lat = float(lokasi["lat"]) if lokasi.get("lat") is not None else None
        lon = float(lokasi["lon"]) if lokasi.get("lon") is not None else None
        tz_name = lokasi.get("timezone", "Asia/Jakarta")

        loc_parts = [p for p in [desa, kec, kotkab] if p]
        display_location = ", ".join(loc_parts) if loc_parts else (kotkab or prov or fallback_location)

        # Ekstraksi semua slot per jam / periode cuaca BMKG
        cuaca_raw = raw_data.get("data", [{}])[0].get("cuaca", []) if isinstance(raw_data, dict) and "data" in raw_data else []
        flat_slots: List[Dict[str, Any]] = []

        for day_block in cuaca_raw:
            if isinstance(day_block, list):
                for item in day_block:
                    if isinstance(item, dict):
                        flat_slots.append(item)
            elif isinstance(day_block, dict):
                flat_slots.append(day_block)

        hourly_data_points: List[WeatherDataPoint] = []
        parsed_slots_meta: List[Dict[str, Any]] = []

        for item in flat_slots:
            dt_raw = item.get("datetime") or item.get("utc_datetime")
            local_dt_str = item.get("local_datetime")
            dt_parsed = parse_iso_or_local(dt_raw, now.tzinfo)
            if not dt_parsed and local_dt_str:
                dt_parsed = parse_iso_or_local(local_dt_str, now.tzinfo)
            if not dt_parsed:
                continue

            w_desc = item.get("weather_desc") or item.get("weather_desc_en") or "Berawan"
            try:
                w_code = int(item.get("weather", 3))
            except (ValueError, TypeError):
                w_code = 3

            t_val = float(item.get("t", 28.0)) if item.get("t") is not None else 28.0
            hu_val = float(item.get("hu", 75.0)) if item.get("hu") is not None else 75.0
            tp_val = float(item.get("tp", 0.0)) if item.get("tp") is not None else 0.0
            tcc_val = float(item.get("tcc", 0.0)) if item.get("tcc") is not None else 0.0
            ws_val = float(item.get("ws", 0.0)) if item.get("ws") is not None else 0.0
            wd_val = item.get("wd") or ""
            icon_url = item.get("image") or ""

            w_lower = w_desc.lower()
            if any(r in w_lower for r in ["hujan", "petir", "badai", "gerimis"]) or w_code in [60, 61, 62, 63, 64, 65, 95, 97]:
                calculated_pop = min(98.0, 80.0 + max(0.0, tp_val) * 5.0)
            elif "tebal" in w_lower or w_code == 4:
                calculated_pop = 55.0 + max(0.0, tp_val) * 10.0
            elif "berawan" in w_lower or w_code in [2, 3]:
                calculated_pop = min(75.0, 30.0 + max(0.0, tp_val) * 20.0)
            elif "cerah" in w_lower or w_code in [0, 1]:
                calculated_pop = 10.0 + max(0.0, tp_val) * 10.0
            else:
                calculated_pop = 20.0 + max(0.0, tp_val) * 10.0

            calculated_pop = round(min(100.0, max(0.0, calculated_pop)), 1)

            point = WeatherDataPoint(
                time=dt_parsed,
                weather_condition=w_desc,
                probability_of_rain=calculated_pop,
                temperature=t_val,
                humidity=hu_val,
                precipitation=tp_val,
                cloud_cover=tcc_val,
                wind_speed=ws_val,
                wind_direction=wd_val,
                weather_code=w_code,
                icon_url=icon_url,
                local_datetime=local_dt_str,
            )
            hourly_data_points.append(point)
            parsed_slots_meta.append({
                "time": dt_parsed,
                "point": point,
            })

        hourly_data_points.sort(key=lambda p: p.time)
        parsed_slots_meta.sort(key=lambda m: m["time"])

        current_point: Optional[WeatherDataPoint] = None
        if parsed_slots_meta:
            current_point = min(
                parsed_slots_meta,
                key=lambda m: abs((m["time"] - now).total_seconds())
            )["point"]

        if not current_point and hourly_data_points:
            current_point = hourly_data_points[0]

        prob_rain = current_point.probability_of_rain if current_point else 20.0
        condition = current_point.weather_condition if current_point else "Berawan"
        temp = current_point.temperature if current_point else 28.0
        hum = current_point.humidity if current_point else 75.0
        precip = current_point.precipitation if current_point else 0.0
        cloud = current_point.cloud_cover if current_point else 0.0
        ws = current_point.wind_speed if current_point else 0.0
        wd = current_point.wind_direction if current_point else ""
        code = current_point.weather_code if current_point else 3
        icon = current_point.icon_url if current_point else ""

        forecast_time = now + timedelta(minutes=settings.EARLY_CLOSE_HORIZON_MINUTES)

        return {
            "provider": "bmkg",
            "location": display_location,
            "adm4": adm4_code,
            "province": prov,
            "city": kotkab,
            "district": kec,
            "subdistrict": desa,
            "latitude": lat,
            "longitude": lon,
            "timezone": tz_name,
            "probability_of_rain": prob_rain,
            "weather_condition": condition,
            "temperature": temp,
            "humidity": hum,
            "precipitation": precip,
            "cloud_cover": cloud,
            "wind_speed": ws,
            "wind_direction": wd,
            "weather_code": code,
            "icon_url": icon,
            "forecast_at": forecast_time,
            "hourly_points": hourly_data_points,
            "raw": raw_data,
        }


class OpenWeatherMapAdapter:
    """Adapter untuk mengambil data prakiraan cuaca dari OpenWeatherMap API."""

    @staticmethod
    async def fetch(location: str, api_key: str, base_url: str) -> Dict[str, Any]:
        if not api_key:
            raise ValueError("OPENWEATHER_API_KEY tidak dikonfigurasi.")

        url = f"{base_url.rstrip('/')}/forecast"
        params = {
            "q": location,
            "appid": api_key,
            "units": "metric",
            "cnt": 8,
        }

        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()
            return OpenWeatherMapAdapter._normalize(data, location)

    @staticmethod
    def _normalize(data: Dict[str, Any], location: str) -> Dict[str, Any]:
        """Normalisasi struktur data OpenWeatherMap."""
        forecast_list = data.get("list", [])
        if not forecast_list:
            raise ValueError("Data prakiraan OpenWeatherMap kosong.")

        first = forecast_list[0]
        raw_pop = first.get("pop", 0.0)
        prob_rain = round(float(raw_pop) * 100.0, 1)

        weather_desc = first.get("weather", [{}])[0].get("description", "Unknown")
        main_data = first.get("main", {})
        temp = float(main_data.get("temp", 28.0))
        hum = float(main_data.get("humidity", 70.0))

        forecast_time = now_jakarta() + timedelta(minutes=settings.EARLY_CLOSE_HORIZON_MINUTES)
        if "dt" in first:
            try:
                forecast_time = datetime.fromtimestamp(first["dt"], tz=now_jakarta().tzinfo)
            except Exception:
                pass

        return {
            "provider": "openweathermap",
            "location": location,
            "adm4": None,
            "province": None,
            "city": location,
            "district": None,
            "subdistrict": None,
            "latitude": None,
            "longitude": None,
            "timezone": "Asia/Jakarta",
            "probability_of_rain": prob_rain,
            "weather_condition": weather_desc.title(),
            "temperature": temp,
            "humidity": hum,
            "precipitation": float(first.get("rain", {}).get("3h", 0.0)),
            "cloud_cover": float(first.get("clouds", {}).get("all", 0.0)),
            "wind_speed": float(first.get("wind", {}).get("speed", 0.0)),
            "wind_direction": str(first.get("wind", {}).get("deg", "")),
            "weather_code": None,
            "icon_url": None,
            "forecast_at": forecast_time,
            "hourly_points": [],
            "raw": data,
        }


class WeatherService:
    def __init__(self):
        # Cache per-wilayah (adm4) untuk efisiensi dan kecepatan
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._last_refresh_requested: Optional[datetime] = None
        self._last_successful_fetch: Optional[datetime] = None
        self._active_provider: str = settings.WEATHER_PROVIDER

    def resolve_target_adm4(
        self,
        adm4: Optional[str] = None,
        lat: Optional[float] = None,
        lon: Optional[float] = None
    ) -> Tuple[str, Optional[Dict[str, Any]], Optional[float]]:
        """
        Menentukan kode adm4 & metadata lokasi:
        1. Jika adm4 diberikan secara eksplisit, gunakan langsung dan cari metadata koordinatnya.
        2. Jika lat & lon GPS diberikan, temukan stasiun/kelurahan terdekat.
        3. Jika tidak ada, gunakan default sistem (Genteng, Surabaya / Lamongan).
        """
        if adm4 and adm4.strip():
            target = adm4.strip()
            matched = next((r for r in POPULAR_BMKG_REGIONS if r.get("adm4") == target), None)
            return target, matched, None

        if lat is not None and lon is not None:
            best_reg, dist = find_nearest_region(lat, lon)
            return best_reg["adm4"], best_reg, dist

        default_code = getattr(settings, "BMKG_DEFAULT_ADM4", "35.78.07.1001")
        matched = next((r for r in POPULAR_BMKG_REGIONS if r.get("adm4") == default_code), POPULAR_BMKG_REGIONS[0])
        return default_code, matched, None

    def get_nearest_region_info(self, lat: float, lon: float) -> NearestRegionResponse:
        """Mengembalikan informasi wilayah BMKG terdekat berdasarkan koordinat GPS pengguna."""
        best_reg, dist = find_nearest_region(lat, lon)
        return NearestRegionResponse(
            nearest_region=BMKGRegionItem(**best_reg),
            distance_km=dist,
            user_coordinates=UserCoordinates(latitude=lat, longitude=lon),
        )

    async def get_current_weather(
        self,
        db: Session,
        force_refresh: bool = False,
        adm4: Optional[str] = None,
        lat: Optional[float] = None,
        lon: Optional[float] = None,
    ) -> WeatherResponse:
        """Mengambil cuaca terkini berdasarkan kode adm4 BMKG atau koordinat GPS pengguna."""
        now = now_jakarta()
        target_adm4, nearest_meta, dist = self.resolve_target_adm4(adm4, lat, lon)

        cached_entry = self._cache.get(target_adm4)
        if not force_refresh and cached_entry:
            expires_at = cached_entry.get("expires_at")
            if expires_at and now < expires_at:
                cached_resp = cached_entry["response"].model_copy()
                cached_resp.is_cached = True
                return cached_resp

        target_lat = lat if lat is not None else (nearest_meta.get("latitude") if nearest_meta else -7.26807)
        target_lon = lon if lon is not None else (nearest_meta.get("longitude") if nearest_meta else 112.744108)

        # Coba ambil data dari API eksternal (Open-Meteo atau fallback BMKG)
        fetch_result = await self._fetch_from_providers(
            adm4=target_adm4,
            lat=target_lat,
            lon=target_lon,
            location_meta=nearest_meta
        )

        if fetch_result:
            normalized, provider_used, is_fallback = fetch_result
            status_str = "fallback" if is_fallback else "success"

            response = WeatherResponse(
                provider=provider_used,
                location=normalized["location"],
                adm4=normalized.get("adm4") or target_adm4,
                province=normalized.get("province"),
                city=normalized.get("city"),
                district=normalized.get("district"),
                subdistrict=normalized.get("subdistrict"),
                latitude=normalized.get("latitude"),
                longitude=normalized.get("longitude"),
                timezone=normalized.get("timezone"),
                probability_of_rain=normalized["probability_of_rain"],
                weather_condition=normalized["weather_condition"],
                temperature=normalized["temperature"],
                humidity=normalized["humidity"],
                precipitation=normalized.get("precipitation"),
                cloud_cover=normalized.get("cloud_cover"),
                wind_speed=normalized.get("wind_speed"),
                wind_direction=normalized.get("wind_direction"),
                weather_code=normalized.get("weather_code"),
                icon_url=normalized.get("icon_url"),
                forecast_horizon_minutes=settings.EARLY_CLOSE_HORIZON_MINUTES,
                forecast_at=normalized["forecast_at"],
                fetched_at=now,
                is_stale=False,
                is_cached=False,
                status=status_str
            )

            # Simpan ke cache memory
            expires_at = now + timedelta(minutes=settings.WEATHER_CACHE_MINUTES)
            self._cache[target_adm4] = {
                "response": response,
                "expires_at": expires_at,
                "hourly_points": normalized.get("hourly_points", []),
                "raw": normalized.get("raw"),
            }
            self._last_successful_fetch = now
            self._active_provider = provider_used

            # Simpan log ke database SQLite
            self._save_forecast_to_db(db, response, normalized.get("raw"))
            return response

        # Jika API eksternal gagal: cari data terakhir di DB
        latest_record = db.query(WeatherForecast).order_by(desc(WeatherForecast.fetched_at)).first()
        if latest_record:
            stale_response = WeatherResponse(
                provider=latest_record.provider,
                location=latest_record.location,
                adm4=target_adm4,
                probability_of_rain=latest_record.probability_of_rain,
                weather_condition=latest_record.weather_condition,
                temperature=latest_record.temperature,
                humidity=latest_record.humidity,
                forecast_horizon_minutes=latest_record.forecast_horizon_minutes,
                forecast_at=latest_record.forecast_at,
                fetched_at=latest_record.fetched_at,
                is_stale=True,
                is_cached=False,
                status="stale"
            )
            return stale_response

        # Tidak ada data sama sekali di DB
        unavailable_response = WeatherResponse(
            provider="none",
            location=settings.WEATHER_LOCATION,
            adm4=target_adm4,
            probability_of_rain=None,
            weather_condition="Data cuaca tidak tersedia",
            temperature=None,
            humidity=None,
            forecast_horizon_minutes=settings.EARLY_CLOSE_HORIZON_MINUTES,
            forecast_at=now,
            fetched_at=now,
            is_stale=True,
            is_cached=False,
            status="unavailable"
        )
        return unavailable_response

    async def get_weather_forecast_detail(
        self,
        db: Session,
        adm4: Optional[str] = None,
        lat: Optional[float] = None,
        lon: Optional[float] = None,
        force_refresh: bool = False
    ) -> WeatherForecastDetailResponse:
        """Mengambil detail prakiraan cuaca lengkap dengan data time-series per periode."""
        target_adm4, _, _ = self.resolve_target_adm4(adm4, lat, lon)
        base = await self.get_current_weather(db, force_refresh=force_refresh, adm4=target_adm4)

        # Coba ambil titik cuaca langsung dari cache memory jika tersedia
        cached_entry = self._cache.get(target_adm4)
        if cached_entry and cached_entry.get("hourly_points"):
            return WeatherForecastDetailResponse(
                **base.model_dump(exclude={"hourly_forecasts"}),
                hourly_forecasts=cached_entry["hourly_points"]
            )

        # Coba ekstraksi dari payload historis database
        hourly_points: List[WeatherDataPoint] = []
        now = now_jakarta()
        base_hour = now.replace(minute=0, second=0, microsecond=0)

        latest_record = db.query(WeatherForecast).order_by(desc(WeatherForecast.fetched_at)).first()
        if latest_record and latest_record.raw_payload:
            try:
                raw_data = json.loads(latest_record.raw_payload)
                if base.provider == "bmkg" and isinstance(raw_data, dict):
                    cuaca_raw = raw_data.get("data", [{}])[0].get("cuaca", []) if "data" in raw_data else []
                    flat_slots = []
                    for day_block in cuaca_raw:
                        if isinstance(day_block, list):
                            flat_slots.extend([it for it in day_block if isinstance(it, dict)])
                        elif isinstance(day_block, dict):
                            flat_slots.append(day_block)

                    for item in flat_slots:
                        dt_raw = item.get("datetime") or item.get("utc_datetime")
                        local_dt_str = item.get("local_datetime")
                        dt_parsed = parse_iso_or_local(dt_raw, now.tzinfo) or parse_iso_or_local(local_dt_str, now.tzinfo)
                        if not dt_parsed:
                            continue
                        w_desc = item.get("weather_desc") or "Berawan"
                        w_code = int(item.get("weather", 3))
                        tp_val = float(item.get("tp", 0.0))

                        w_lower = w_desc.lower()
                        if any(r in w_lower for r in ["hujan", "petir", "badai", "gerimis"]) or w_code in [60, 61, 62, 63, 64, 65, 95, 97]:
                            pop = min(98.0, 80.0 + max(0.0, tp_val) * 5.0)
                        elif "tebal" in w_lower or w_code == 4:
                            pop = 55.0
                        elif "berawan" in w_lower:
                            pop = 30.0 + max(0.0, tp_val) * 20.0
                        elif "cerah" in w_lower:
                            pop = 10.0
                        else:
                            pop = 20.0

                        hourly_points.append(
                            WeatherDataPoint(
                                time=dt_parsed,
                                weather_condition=w_desc,
                                probability_of_rain=round(min(100.0, pop), 1),
                                temperature=float(item.get("t", 28.0)),
                                humidity=float(item.get("hu", 75.0)),
                                precipitation=tp_val,
                                cloud_cover=float(item.get("tcc", 0.0)),
                                wind_speed=float(item.get("ws", 0.0)),
                                wind_direction=item.get("wd", ""),
                                weather_code=w_code,
                                icon_url=item.get("image", ""),
                                local_datetime=local_dt_str,
                            )
                        )
            except Exception as e:
                logger.warning(f"Gagal mem-parse raw forecast payload untuk hourly: {e}")

        # Fallback jika tidak ada data sama sekali
        if not hourly_points:
            base_temp = base.temperature if base.temperature is not None else 27.0
            base_hum = base.humidity if base.humidity is not None else 72.0
            conditions_flow = ["Berawan", "Cerah Berawan", "Cerah", "Hujan Ringan", "Berawan", "Cerah"]
            temp_flow = [27.0, 28.0, 29.0, 26.0, 26.0, 27.0]

            for h in range(8):
                t = base_hour + timedelta(hours=h * 3)
                flow_cond = conditions_flow[h % len(conditions_flow)]
                flow_temp = temp_flow[h % len(temp_flow)]

                hourly_points.append(
                    WeatherDataPoint(
                        time=t,
                        weather_condition=flow_cond,
                        probability_of_rain=85.0 if "Hujan" in flow_cond else 20.0,
                        temperature=flow_temp,
                        humidity=base_hum,
                        precipitation=1.5 if "Hujan" in flow_cond else 0.0,
                        cloud_cover=60.0,
                        wind_speed=3.0,
                        wind_direction="E",
                        weather_code=61 if "Hujan" in flow_cond else 3,
                        icon_url=None,
                        local_datetime=t.strftime("%Y-%m-%d %H:%M:%S"),
                    )
                )

        return WeatherForecastDetailResponse(
            **base.model_dump(exclude={"hourly_forecasts"}),
            hourly_forecasts=hourly_points,
        )

    async def _fetch_from_providers(
        self,
        adm4: str,
        lat: Optional[float] = None,
        lon: Optional[float] = None,
        location_meta: Optional[Dict[str, Any]] = None
    ) -> Optional[Tuple[Dict[str, Any], str, bool]]:
        """Mengambil data dari provider utama (Open-Meteo) dan fallback ke BMKG / OpenWeatherMap."""
        location = settings.WEATHER_LOCATION
        target_lat = lat if lat is not None else -7.26807
        target_lon = lon if lon is not None else 112.744108

        preferred = getattr(settings, "WEATHER_PROVIDER", "open-meteo").lower()

        # OPSI A: OPEN-METEO SEBAGAI PROVIDER UTAMA
        if preferred == "open-meteo":
            try:
                om_url = getattr(settings, "OPEN_METEO_API_BASE_URL", "https://api.open-meteo.com/v1/forecast")
                res = await OpenMeteoAdapter.fetch(
                    lat=target_lat,
                    lon=target_lon,
                    base_url=om_url,
                    location_meta=location_meta,
                    adm4=adm4
                )
                return res, "open-meteo", False
            except Exception as om_err:
                logger.warning(f"Open-Meteo fetch gagal: {om_err}. Mencoba fallback ke BMKG...")
                try:
                    res = await BMKGAdapter.fetch(location, settings.BMKG_API_BASE_URL, adm4=adm4)
                    return res, "bmkg", True
                except Exception as bmkg_err:
                    logger.warning(f"BMKG fallback juga gagal: {bmkg_err}.")
                    if settings.OPENWEATHER_API_KEY:
                        try:
                            res = await OpenWeatherMapAdapter.fetch(
                                location, settings.OPENWEATHER_API_KEY, settings.OPENWEATHER_API_BASE_URL
                            )
                            return res, "openweathermap", True
                        except Exception as owm_err:
                            logger.error(f"Semua provider cuaca gagal: {owm_err}")
                return None

        # OPSI B: BMKG SEBAGAI PROVIDER UTAMA
        elif preferred == "bmkg":
            try:
                res = await BMKGAdapter.fetch(location, settings.BMKG_API_BASE_URL, adm4=adm4)
                return res, "bmkg", False
            except Exception as e:
                logger.warning(f"BMKG fetch gagal: {e}. Mencoba fallback ke Open-Meteo...")
                try:
                    om_url = getattr(settings, "OPEN_METEO_API_BASE_URL", "https://api.open-meteo.com/v1/forecast")
                    res = await OpenMeteoAdapter.fetch(
                        lat=target_lat,
                        lon=target_lon,
                        base_url=om_url,
                        location_meta=location_meta,
                        adm4=adm4
                    )
                    return res, "open-meteo", True
                except Exception as om_err:
                    logger.error(f"Fallback Open-Meteo juga gagal: {om_err}")
                return None

        # OPSI C: OPENWEATHERMAP
        else:
            try:
                res = await OpenWeatherMapAdapter.fetch(
                    location, settings.OPENWEATHER_API_KEY, settings.OPENWEATHER_API_BASE_URL
                )
                return res, "openweathermap", False
            except Exception as e:
                logger.warning(f"OpenWeatherMap fetch gagal: {e}. Mencoba fallback ke Open-Meteo...")
                try:
                    om_url = getattr(settings, "OPEN_METEO_API_BASE_URL", "https://api.open-meteo.com/v1/forecast")
                    res = await OpenMeteoAdapter.fetch(
                        lat=target_lat,
                        lon=target_lon,
                        base_url=om_url,
                        location_meta=location_meta,
                        adm4=adm4
                    )
                    return res, "open-meteo", True
                except Exception as fallback_e:
                    logger.error(f"Fallback Open-Meteo juga gagal: {fallback_e}")
                return None

    def _save_forecast_to_db(self, db: Session, res: WeatherResponse, raw: Any):
        try:
            record = WeatherForecast(
                provider=res.provider,
                location=res.location,
                probability_of_rain=res.probability_of_rain if res.probability_of_rain is not None else 0.0,
                forecast_horizon_minutes=res.forecast_horizon_minutes,
                forecast_at=res.forecast_at,
                fetched_at=res.fetched_at,
                weather_condition=res.weather_condition,
                temperature=res.temperature,
                humidity=res.humidity,
                is_stale=res.is_stale,
                status=res.status,
                raw_payload=json.dumps(raw) if raw else None,
            )
            db.add(record)
            db.commit()
        except Exception as e:
            db.rollback()
            logger.error(f"Gagal menyimpan data cuaca ke DB: {e}")

    def check_refresh_rate_limit(self) -> Tuple[bool, int]:
        """Memeriksa apakah refresh diperbolehkan atau masih dalam cooldown."""
        now = now_jakarta()
        cooldown = settings.WEATHER_REFRESH_COOLDOWN_SECONDS
        if self._last_refresh_requested:
            elapsed = (now - self._last_refresh_requested).total_seconds()
            if elapsed < cooldown:
                remaining = int(cooldown - elapsed)
                return False, remaining
        return True, 0

    def record_refresh_request(self):
        self._last_refresh_requested = now_jakarta()

    def get_status_info(self, adm4: Optional[str] = None) -> Dict[str, Any]:
        """Mengembalikan status teknis provider cuaca."""
        now = now_jakarta()
        target_adm4, _, _ = self.resolve_target_adm4(adm4)
        can_refresh, remaining = self.check_refresh_rate_limit()

        cached_entry = self._cache.get(target_adm4)
        is_stale = False
        cache_expires_at = None
        if cached_entry:
            resp = cached_entry["response"]
            cache_expires_at = cached_entry.get("expires_at")
            is_stale = resp.is_stale or (cache_expires_at and now > cache_expires_at)

        return {
            "provider": self._active_provider,
            "configured_provider": settings.WEATHER_PROVIDER,
            "is_available": self._last_successful_fetch is not None,
            "last_successful_fetch": self._last_successful_fetch,
            "cache_expires_at": cache_expires_at,
            "is_stale": is_stale,
            "refresh_cooldown_remaining_seconds": remaining,
            "poll_interval_minutes": settings.WEATHER_POLL_INTERVAL_MINUTES,
            "location": cached_entry["response"].location if cached_entry else settings.WEATHER_LOCATION,
            "adm4": target_adm4,
        }

    def get_popular_regions(self) -> List[BMKGRegionItem]:
        """Daftar wilayah tingkat IV rekomendasi/populer untuk memudahkan pemilihan."""
        return [BMKGRegionItem(**reg) for reg in POPULAR_BMKG_REGIONS]


# Singleton instance
weather_service = WeatherService()
