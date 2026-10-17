from datetime import datetime, timezone, timedelta
from zoneinfo import ZoneInfo
from typing import Optional

try:
    from zoneinfo import ZoneInfo
    JAKARTA_TZ = ZoneInfo("Asia/Jakarta")
except Exception:
    JAKARTA_TZ = timezone(timedelta(hours=7), name="WIB")


def now_jakarta() -> datetime:
    """Mengembalikan datetime saat ini dalam zona waktu Asia/Jakarta."""
    return datetime.now(JAKARTA_TZ)


def to_jakarta_iso(dt: Optional[datetime]) -> Optional[str]:
    """Mengonversi objek datetime ke string ISO 8601 dengan offset zona waktu Asia/Jakarta."""
    if dt is None:
        return None
    if dt.tzinfo is None:
        # Jika naive datetime dari database, asumsikan Jakarta atau ubah ke Jakarta
        dt = dt.replace(tzinfo=JAKARTA_TZ)
    else:
        dt = dt.astimezone(JAKARTA_TZ)
    return dt.isoformat()


def parse_datetime(dt_str: str) -> datetime:
    """Menguraikan string ISO 8601 ke datetime dengan timezone Asia/Jakarta."""
    dt = datetime.fromisoformat(dt_str)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=JAKARTA_TZ)
    else:
        dt = dt.astimezone(JAKARTA_TZ)
    return dt
