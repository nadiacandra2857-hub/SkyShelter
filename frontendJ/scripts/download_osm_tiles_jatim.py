import os
import sys
import math
import time
import urllib.request
import urllib.error
from concurrent.futures import ThreadPoolExecutor, as_completed

# Direktori target penyimpanan ubin peta lokal
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
TARGET_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, "..", "public", "tiles"))

# Konversi Derajat Koordinat ke Tile Index (Web Mercator)
def deg2num(lat_deg, lon_deg, zoom):
    lat_rad = math.radians(lat_deg)
    n = 1 << zoom
    xtile = int((lon_deg + 180.0) / 360.0 * n)
    ytile = int((1.0 - math.asinh(math.tan(lat_rad)) / math.pi) / 2.0 * n)
    return (xtile, ytile)

# Bounding Box Jawa Timur & Penyangga Layar Lebar
JATIM_EXPANDED = {
    "min_lat": -9.20,
    "max_lat": -6.40,
    "min_lon": 110.20,
    "max_lon": 115.20,
}

# Area Metropolitan Surabaya & Lamongan (Detail Zoom 12)
SURABAYA_LAMONGAN_BOUNDS = {
    "min_lat": -7.45,
    "max_lat": -6.80,
    "min_lon": 112.05,
    "max_lon": 112.90,
}

# Daftar tile yang perlu diunduh
def build_tile_list():
    tiles = []
    
    # 1. Seluruh Provinsi Jawa Timur + Penyangga Layar Lebar: Zoom 7 s/d 11
    for z in range(7, 12):
        x1, y1 = deg2num(JATIM_EXPANDED["max_lat"], JATIM_EXPANDED["min_lon"], z)
        x2, y2 = deg2num(JATIM_EXPANDED["min_lat"], JATIM_EXPANDED["max_lon"], z)
        x_min, x_max = min(x1, x2), max(x1, x2)
        y_min, y_max = min(y1, y2), max(y1, y2)
        for x in range(x_min, x_max + 1):
            for y in range(y_min, y_max + 1):
                tiles.append((z, x, y))

    # 2. Detail Metropolitan Surabaya - Lamongan: Zoom 12 & Zoom 13
    for z in [12, 13]:
        x1, y1 = deg2num(SURABAYA_LAMONGAN_BOUNDS["max_lat"], SURABAYA_LAMONGAN_BOUNDS["min_lon"], z)
        x2, y2 = deg2num(SURABAYA_LAMONGAN_BOUNDS["min_lat"], SURABAYA_LAMONGAN_BOUNDS["max_lon"], z)
        x_min, x_max = min(x1, x2), max(x1, x2)
        y_min, y_max = min(y1, y2), max(y1, y2)
        for x in range(x_min, x_max + 1):
            for y in range(y_min, y_max + 1):
                tiles.append((z, x, y))

    return sorted(list(set(tiles)))

def is_blocked_tile(data):
    if len(data) == 6987:
        return True
    if b"blocked" in data.lower() or b"osm.wiki" in data.lower():
        return True
    return False

def download_single_tile(z, x, y):
    tile_dir = os.path.join(TARGET_DIR, str(z), str(x))
    os.makedirs(tile_dir, exist_ok=True)
    tile_file = os.path.join(tile_dir, f"{y}.png")

    if os.path.exists(tile_file):
        size = os.path.getsize(tile_file)
        if size != 6987 and size > 1000:
            return "cached"
        else:
            try:
                os.remove(tile_file)
            except Exception:
                pass

    # Sumber cermin:
    # 1. OSM Jerman (resmi OpenStreetMap tanpa 403 block)
    # 2. Esri World Street Map (cepat, CDN global, 0% gagal)
    sources = [
        f"https://tile.openstreetmap.de/{z}/{x}/{y}.png",
        f"https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
    ]

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    }

    for url in sources:
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=5) as resp:
                if resp.status == 200:
                    data = resp.read()
                    if not is_blocked_tile(data) and len(data) > 500:
                        with open(tile_file, "wb") as f:
                            f.write(data)
                        return "downloaded"
        except Exception:
            continue

    return "failed"

def main():
    print("=" * 70)
    print("  SkyShelter - Batch Tile Downloader Jawa Timur (Clean Dual-Source)")
    print("=" * 70)
    print(f"Target Direktori: {TARGET_DIR}")

    tiles = build_tile_list()
    total = len(tiles)
    print(f"Total ubin (tiles) Jawa Timur yang disiapkan: {total} tiles (Zoom 7-12)")
    print("Mengunduh ubin yang belum ada di cache...")

    start_time = time.time()
    downloaded = 0
    cached = 0
    failed = 0

    with ThreadPoolExecutor(max_workers=8) as executor:
        future_to_tile = {
            executor.submit(download_single_tile, z, x, y): (z, x, y)
            for (z, x, y) in tiles
        }

        for idx, future in enumerate(as_completed(future_to_tile), 1):
            res = future.result()
            if res == "downloaded":
                downloaded += 1
            elif res == "cached":
                cached += 1
            else:
                failed += 1

            if idx % 40 == 0 or idx == total:
                percent = (idx / total) * 100
                sys.stdout.write(f"\rProgress: [{idx}/{total}] {percent:.1f}% | Baru: {downloaded} | Cache: {cached} | Gagal: {failed}")
                sys.stdout.flush()

    elapsed = time.time() - start_time
    print(f"\n\nSelesai dalam {elapsed:.2f} detik!")
    print(f"- Total Ubin Siap: {downloaded + cached}/{total}")
    print(f"- Baru Diunduh: {downloaded}")
    print(f"- Dari Cache: {cached}")
    print(f"- Gagal: {failed}")
    print(f"Semua ubin tersimpan di: {TARGET_DIR}")
    print("=" * 70)

if __name__ == "__main__":
    main()
