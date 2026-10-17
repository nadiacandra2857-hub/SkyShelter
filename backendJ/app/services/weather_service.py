import json
import logging
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any, Tuple
import httpx
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.config import settings
from app.models.forecast import WeatherForecast
from app.schemas.weather import WeatherResponse, WeatherForecastDetailResponse, WeatherDataPoint
from app.utils.datetime import now_jakarta

logger = logging.getLogger("weather_service")


class BMKGAdapter:
    """Adapter untuk mengambil data prakiraan cuaca dari BMKG Open Data / Publik."""

    @staticmethod
    async def fetch(location: str, base_url: str) -> Dict[str, Any]:
        url = base_url.strip()
        # Default parameter jika endpoint publik BMKG
        params = {"adm4": "31.71.01.1001"} if "adm4" not in url else {}
        headers = {"User-Agent": "WeatherRoofingSystem/2.0"}

        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(url, params=params, headers=headers)
            resp.raise_for_status()
            data = resp.json()
            return BMKGAdapter._normalize(data, location)

    @staticmethod
    def _normalize(raw_data: Any, location: str) -> Dict[str, Any]:
        """Normalisasi struktur data BMKG menjadi format internal."""
        # BMKG API format standardisasi
        prob_rain = None
        condition = "Berawan"
        temp = 28.0
        hum = 75.0
        forecast_time = now_jakarta() + timedelta(minutes=settings.EARLY_CLOSE_HORIZON_MINUTES)

        try:
            # Mencari data cuaca dalam struktur JSON BMKG
            if isinstance(raw_data, dict):
                cuaca_list = raw_data.get("data", [{}])[0].get("cuaca", []) if "data" in raw_data else []
                if cuaca_list:
                    # Ambil cuaca periode terdekat
                    first_item = cuaca_list[0] if isinstance(cuaca_list[0], dict) else cuaca_list[0][0]
                    condition = first_item.get("weather_desc", condition)
                    temp = float(first_item.get("t", temp))
                    hum = float(first_item.get("hu", hum))
                    # Beberapa endpoint BMKG menyertakan pop (probability of precipitation)
                    if "pop" in first_item and first_item["pop"] is not None:
                        prob_rain = float(first_item["pop"])
                    elif "hujan" in condition.lower():
                        # Jika deskripsi secara eksplisit hujan, probabilitas hujan tinggi
                        prob_rain = 85.0
                    elif "berawan" in condition.lower():
                        prob_rain = 30.0
                    else:
                        prob_rain = 10.0
        except Exception as e:
            logger.warning(f"Error parsing BMKG payload: {e}")

        return {
            "provider": "bmkg",
            "location": location,
            "probability_of_rain": prob_rain,
            "weather_condition": condition,
            "temperature": temp,
            "humidity": hum,
            "forecast_at": forecast_time,
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
            "cnt": 8,  # Prakiraan hingga 24 jam kedepan (interval 3 jam)
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
        # OpenWeatherMap menyediakan 'pop' (Probability of Precipitation) antara 0.0 s.d 1.0
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
            "probability_of_rain": prob_rain,
            "weather_condition": weather_desc.title(),
            "temperature": temp,
            "humidity": hum,
            "forecast_at": forecast_time,
            "raw": data,
        }


class WeatherService:
    def __init__(self):
        self._cached_response: Optional[WeatherResponse] = None
        self._cache_expires_at: Optional[datetime] = None
        self._last_refresh_requested: Optional[datetime] = None
        self._last_successful_fetch: Optional[datetime] = None
        self._active_provider: str = settings.WEATHER_PROVIDER

    async def get_current_weather(
        self,
        db: Session,
        force_refresh: bool = False
    ) -> WeatherResponse:
        """
        Mengambil cuaca terkini:
        - Jika cache valid dan tidak force_refresh: kembalikan cache.
        - Jika expired/forced: coba provider utama (BMKG), jika gagal coba fallback (OpenWeatherMap).
        - Jika keduanya gagal: cari data historis terakhir di database, tandai sebagai is_stale=True.
        - Jika tidak ada sama sekali: kembalikan objek dengan status='unavailable'.
        """
        now = now_jakarta()

        if not force_refresh and self._cached_response and self._cache_expires_at:
            if now < self._cache_expires_at:
                # Cache masih hangat
                cached = self._cached_response.model_copy()
                cached.is_cached = True
                return cached

        # Coba ambil data dari API eksternal
        fetch_result = await self._fetch_from_providers()

        if fetch_result:
            normalized, provider_used, is_fallback = fetch_result
            status_str = "fallback" if is_fallback else "success"

            response = WeatherResponse(
                provider=provider_used,
                location=normalized["location"],
                probability_of_rain=normalized["probability_of_rain"],
                weather_condition=normalized["weather_condition"],
                temperature=normalized["temperature"],
                humidity=normalized["humidity"],
                forecast_horizon_minutes=settings.EARLY_CLOSE_HORIZON_MINUTES,
                forecast_at=normalized["forecast_at"],
                fetched_at=now,
                is_stale=False,
                is_cached=False,
                status=status_str
            )

            # Simpan ke cache
            self._cached_response = response
            self._cache_expires_at = now + timedelta(minutes=settings.WEATHER_CACHE_MINUTES)
            self._last_successful_fetch = now
            self._active_provider = provider_used

            # Simpan log ke database secara persisten
            self._save_forecast_to_db(db, response, normalized.get("raw"))
            return response

        # Jika API eksternal gagal: cari data terakhir di DB
        latest_record = db.query(WeatherForecast).order_by(desc(WeatherForecast.fetched_at)).first()
        if latest_record:
            stale_response = WeatherResponse(
                provider=latest_record.provider,
                location=latest_record.location,
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
            self._cached_response = stale_response
            return stale_response

        # Tidak ada data sama sekali di DB
        unavailable_response = WeatherResponse(
            provider="none",
            location=settings.WEATHER_LOCATION,
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

    async def _fetch_from_providers(self) -> Optional[Tuple[Dict[str, Any], str, bool]]:
        """Mencoba provider utama lalu fallback."""
        location = settings.WEATHER_LOCATION

        # Prioritas 1: BMKG jika diset sebagai utama
        if settings.WEATHER_PROVIDER == "bmkg":
            try:
                res = await BMKGAdapter.fetch(location, settings.BMKG_API_BASE_URL)
                return res, "bmkg", False
            except Exception as e:
                logger.warning(f"BMKG fetch gagal: {e}. Mencoba fallback ke OpenWeatherMap...")
                if settings.OPENWEATHER_API_KEY:
                    try:
                        res = await OpenWeatherMapAdapter.fetch(
                            location, settings.OPENWEATHER_API_KEY, settings.OPENWEATHER_API_BASE_URL
                        )
                        return res, "openweathermap", True
                    except Exception as fallback_e:
                        logger.error(f"Fallback OpenWeatherMap juga gagal: {fallback_e}")
                return None
        else:
            # Prioritas 1: OpenWeatherMap
            try:
                res = await OpenWeatherMapAdapter.fetch(
                    location, settings.OPENWEATHER_API_KEY, settings.OPENWEATHER_API_BASE_URL
                )
                return res, "openweathermap", False
            except Exception as e:
                logger.warning(f"OpenWeatherMap fetch gagal: {e}. Mencoba fallback ke BMKG...")
                try:
                    res = await BMKGAdapter.fetch(location, settings.BMKG_API_BASE_URL)
                    return res, "bmkg", True
                except Exception as fallback_e:
                    logger.error(f"Fallback BMKG juga gagal: {fallback_e}")
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

    def get_status_info(self) -> Dict[str, Any]:
        """Mengembalikan status teknis provider cuaca."""
        now = now_jakarta()
        can_refresh, remaining = self.check_refresh_rate_limit()
        is_stale = False
        if self._cached_response:
            is_stale = self._cached_response.is_stale
            if self._cache_expires_at and now > self._cache_expires_at:
                is_stale = True

        return {
            "provider": self._active_provider,
            "configured_provider": settings.WEATHER_PROVIDER,
            "is_available": self._last_successful_fetch is not None,
            "last_successful_fetch": self._last_successful_fetch,
            "cache_expires_at": self._cache_expires_at,
            "is_stale": is_stale,
            "refresh_cooldown_remaining_seconds": remaining,
            "poll_interval_minutes": settings.WEATHER_POLL_INTERVAL_MINUTES,
            "location": settings.WEATHER_LOCATION,
        }


# Singleton instance
weather_service = WeatherService()
