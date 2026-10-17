# Weather-Responsive Roofing System (SkyShelter V2.0)

Platform sistem cerdas pemantauan dan pengendalian atap jemuran otomatis berbasis **Sensor Hujan Lokal** (*Ground Truth*) dan **Prediksi Cuaca Eksternal** (*Early-Close Algorithm*).

---

## Arsitektur Monorepo / Multi-Folder

```text
SkyShelter/
├── frontendJ/                     # Antarmuka Web (React + Vite + Tailwind CSS)
│   ├── public/                    # Aset statis & logo SVG
│   ├── src/                       # Logika frontend, komponen, pages, services, mocks
│   ├── .env.example               # Contoh environment variable frontend
│   ├── index.html                 # Shell HTML & typography
│   ├── package.json               # Dependensi React
│   ├── README.md                  # Dokumentasi lengkap frontend
│   └── vite.config.js             # Konfigurasi Vite
│
├── backendJ/                      # REST API Server (Python + FastAPI + SQLite)
│   ├── app/                       # Source code backend FastAPI
│   ├── tests/                     # Suite pengujian otomatis Pytest
│   ├── .env.example               # Contoh environment variable backend
│   ├── requirements.txt           # Dependensi Python
│   └── README.md                  # Dokumentasi lengkap backend
│
└── README.md                      # Dokumentasi pengantar monorepo
```

---

## Panduan Cepat Menjalankan Sistem

### 1. Menjalankan Frontend (React + Vite)
```bash
cd frontendJ
npm install
npm run dev
```
- Server aktif di: `http://127.0.0.1:5173`
- Mode simulasi bawaan aktif (`VITE_USE_MOCK_DATA=true`), dapat langsung diuji tanpa backend aktif.

### 2. Menjalankan Backend (Python + FastAPI)
```bash
cd backendJ
python -m venv .venv
.\.venv\Scripts\activate       # Windows PowerShell
pip install -r requirements.txt
python run.py init-db
python run.py
```
- API Base URL: `http://127.0.0.1:8000/api/v1`
- Swagger UI Docs: `http://127.0.0.1:8000/docs`

Untuk menghubungkan Frontend dengan Backend asli:
Ubah di `frontendJ/.env`:
```env
VITE_USE_MOCK_DATA=false
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
```
