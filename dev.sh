#!/usr/bin/env bash
# Helper script to run both Backend and Frontend concurrently

set -e

cleanup() {
    echo ""
    echo "Menghentikan semua layanan SkyShelter..."
    kill $(jobs -p) 2>/dev/null || true
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "================================================="
echo "  Memulai SkyShelter (Broker, Backend & Frontend)"
echo "================================================="

# Menjalankan Local MQTT Broker
echo "[MQTT Broker] Menjalankan broker lokal di port 1883..."
cd "$ROOT_DIR"
backendJ/.venv/bin/python scripts/run_mqtt_broker.py &
sleep 1

# Menjalankan Backend FastAPI
echo "[Backend] Menjalankan server di http://127.0.0.1:8005..."
cd "$ROOT_DIR/backendJ"
source .venv/bin/activate
python run.py &

# Menjalankan Frontend Vite
echo "[Frontend] Menjalankan server di http://127.0.0.1:5173..."
cd "$ROOT_DIR/frontendJ"
npm run dev &

wait

