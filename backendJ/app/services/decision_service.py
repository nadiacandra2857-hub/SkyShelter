from typing import Optional, Tuple
from app.core.config import settings


class DecisionResult:
    def __init__(
        self,
        decision: str,
        reason: str,
        early_close_recommended: bool,
        rain_priority_active: bool
    ):
        # decision: "normal", "standby", "early_close", "rain_detected", "unavailable"
        self.decision = decision
        self.reason = reason
        self.early_close_recommended = early_close_recommended
        self.rain_priority_active = rain_priority_active

    def to_dict(self):
        return {
            "decision": self.decision,
            "reason": self.reason,
            "early_close_recommended": self.early_close_recommended,
            "rain_priority_active": self.rain_priority_active,
        }


class DecisionService:
    @staticmethod
    def evaluate(
        rain_detected: bool,
        probability_of_rain: Optional[float],
        weather_available: bool,
        threshold: Optional[float] = None,
        forecast_feature_enabled: bool = True
    ) -> DecisionResult:
        """
        Logika Keputusan Cuaca V2.0:
        1. Sensor hujan lokal adalah prioritas utama (ground truth).
           Jika terdeteksi hujan -> status: 'rain_detected'.
        2. Jika sensor lokal kering dan fitur prediksi aktif:
           - Jika API cuaca tidak tersedia/gagal -> status: 'unavailable'.
           - Jika probabilitas hujan >= ambang early-close -> status: 'early_close' (rekomendasi atap ditutup lebih awal).
           - Jika probabilitas sedang (>= 50% dan < ambang) -> status: 'standby'.
           - Jika probabilitas rendah (< 50%) -> status: 'normal'.
        3. Jika fitur prediksi dinonaktifkan di pengaturan:
           - Mengandalkan sensor lokal sepenuhnya -> status: 'normal' (jika kering).
        """
        active_threshold = threshold if threshold is not None else settings.EARLY_CLOSE_THRESHOLD

        esp_rain_enabled = getattr(settings, 'ENABLE_ESP_RAIN_SENSOR', False)
        active_rain = rain_detected if esp_rain_enabled else False

        # Aturan 1: Sensor fisik lokal mendeteksi hujan (Prioritas Tertinggi - jika sensor aktif)
        if active_rain:
            return DecisionResult(
                decision="rain_detected",
                reason="Sensor lokal mendeteksi presipitasi/hujan aktif. Prioritas penutupan fisik diaktifkan.",
                early_close_recommended=True,
                rain_priority_active=True
            )

        # Jika sensor kering tetapi fitur prediksi cuaca dinonaktifkan
        if not forecast_feature_enabled:
            return DecisionResult(
                decision="normal",
                reason="Sensor lokal kering. Fitur prediksi cuaca V2.0 saat ini dinonaktifkan pengguna.",
                early_close_recommended=False,
                rain_priority_active=False
            )

        # Aturan 5: Sensor kering, namun data API cuaca gagal didapatkan
        if not weather_available or probability_of_rain is None:
            return DecisionResult(
                decision="unavailable",
                reason="Sensor lokal kering, namun data prediksi cuaca eksternal saat ini tidak tersedia.",
                early_close_recommended=False,
                rain_priority_active=False
            )

        # Aturan 2: Sensor lokal kering dan probabilitas hujan melebihi ambang batas early-close
        if probability_of_rain >= active_threshold:
            return DecisionResult(
                decision="early_close",
                reason=(
                    f"Sensor hujan ESP nonaktif (tahap perakitan). Prakiraan presipitasi Open-Meteo mendeteksi ({probability_of_rain:.1f}%) mencapai ambang early-close ({active_threshold:.1f}%). Disarankan menutup atap lebih awal."
                    if not esp_rain_enabled
                    else f"Sensor lokal kering, tetapi probabilitas hujan ({probability_of_rain:.1f}%) mencapai atau melebihi ambang early-close ({active_threshold:.1f}%). Disarankan menutup atap lebih awal."
                ),
                early_close_recommended=True,
                rain_priority_active=False
            )

        # Aturan 3: Probabilitas hujan sedang (50% <= prob < threshold)
        if probability_of_rain >= 50.0:
            return DecisionResult(
                decision="standby",
                reason=f"Sensor lokal kering. Probabilitas hujan sedang ({probability_of_rain:.1f}%). Sistem dalam mode siaga (standby).",
                early_close_recommended=False,
                rain_priority_active=False
            )

        # Aturan 4: Sensor lokal kering dan probabilitas rendah (< 50%)
        return DecisionResult(
            decision="normal",
            reason=f"Sensor lokal kering dan potensi hujan rendah ({probability_of_rain:.1f}%). Kondisi operasional normal.",
            early_close_recommended=False,
            rain_priority_active=False
        )
