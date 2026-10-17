# Weather-Responsive Roofing System (SkyShelter V2.0) — Frontend Web

Platform antarmuka web modern, responsif, dan interaktif untuk memantau dan mengontrol sistem atap jemuran otomatis berbasis **Sensor Hujan Lokal** (*Ground Truth*) dan **Prediksi Cuaca Regional** (*Early-Close Algorithm*).

Dirancang khusus dengan konsep desain **Natural Smart Home Dashboard** menggunakan **React + Vite**, **Tailwind CSS**, **Framer Motion**, dan **Recharts**, siap terintegrasi secara modular dengan backend **Python + FastAPI**.

---

## 1. Fitur Utama

- 🏠 **Dashboard Interaktif & Ilustrasi Kanopi Animasi SVG**: Visualisasi pergerakan atap kanopi buka/tutup secara nyata dengan representasi tiang dan pakaian jemuran.
- 🌧️ **Prioritas Keselamatan Sensor Fisik (Ground Truth #1)**: Jika sensor hujan lokal mendeteksi presipitasi, sistem mengaktifkan `RAIN_SAFETY_LOCK` untuk menutup kanopi darurat dan memblokir pembukaan manual.
- ⚡ **Algoritma Early-Close Cuaca (V2.0)**: Menutup kanopi secara preventif saat probabilitas hujan melampaui ambang batas (default 80%) dalam horizon 60 menit ke depan sebelum hujan tiba.
- 🎮 **Pusat Kendali Motor Atap**: Tombol buka/tutup atap, pemilihan mode Otomatis/Manual, tracking status eksekusi perintah (*pending*, *accepted*, *succeeded*, *failed*, *timeout*), dan kalkulasi waktu respons (*response time* ms).
- ⛅ **Monitoring Cuaca & Radar BMKG**: Menampilkan probabilitas hujan, suhu, kelembapan, status cache satelit, dan kurva grafik proyeksi presipitasi bertahap.
- 📈 **Riwayat Telemetri & Evaluasi Model**: Grafik visualisasi sensor analog ADC, log kejadian terfilter, kartu evaluasi model (*Akurasi, Presisi, Recall, F1-Score*), dan tombol ekspor berkas CSV langsung.
- ⚙️ **Pengaturan Parameter Dinamis**: Konfigurasi ambang batas early-close, horizon prediksi, interval polling, dan jeda stabilisasi pasca-hujan.
- 🧪 **Laboratorium Simulasi IoT Terintegrasi**: Pengujian instan respon antarmuka tanpa memerlukan mikrokontroler fisik atau broker MQTT langsung dari sidebar.
- 📱 **Mobile-First & Responsif Penuh**: Dilengkapi navigasi bawah (*bottom navigation*) untuk smartphone (target interaksi 44×44 px) dan sidebar proporsional untuk desktop.

---

## 2. Palet Warna (Natural Smart Home)

| Nama Warna | Kode Hex | Penggunaan |
| :--- | :--- | :--- |
| **Deep Forest Green** | `#183D32` | Identitas utama, header, tombol primer |
| **Forest Green** | `#2F6B50` | Warna aksen, indikator aktif, status normal |
| **Sage** | `#A8BBA0` | Border halus, ornamen kanopi, badge netral |
| **Warm Off-White** | `#F6F5F0` | Latar belakang halaman utama (*background*) |
| **White** | `#FFFFFF` | Latar kartu informasi dan panel konten |
| **Charcoal** | `#252B28` | Tipografi utama, teks judul, kontras tinggi |
| **Muted Gray** | `#7B847E` | Metadata, label sekunder, timestamp |
| **Soft Amber** | `#E8B65B` | Status peringatan siaga, probabilitas cuaca |
| **Soft Red** | `#D96C5F` | Status hujan aktif, safety lock, bahaya |

---

## 3. Persyaratan Sistem

- **Node.js**: versi `18.x`, `20.x`, atau `22.x+` (Direkomendasikan Node.js LTS).
- **npm**: versi `9.x` atau `10.x+`.
- **Browser Modern**: Chrome, Firefox, Edge, atau Safari dengan dukungan CSS Grid dan Flexbox.

---

## 4. Langkah Instalasi & Menjalankan Aplikasi

### A. Clone atau Buka Direktori Frontend
```bash
cd frontendJ
```

### B. Menginstal Dependensi
```bash
npm install
```

### C. Konfigurasi Environment File
Salin file `.env.example` menjadi `.env`:
```bash
# Windows (PowerShell)
copy .env.example .env

# Linux / macOS
cp .env.example .env
```

### D. Menjalankan Server Development (Vite)
```bash
npm run dev
```
Aplikasi akan aktif di alamat: `http://127.0.0.1:5173` atau `http://localhost:5173`.

### E. Build untuk Produksi
```bash
npm run build
```
Hasil build bundel produksi akan terdistribusi di folder `dist/` dengan *vendor code-splitting* optimal (< 500 kB per berkas).

---

## 5. Mode Simulasi vs Mode API Backend FastAPI

Frontend ini dirancang dengan arsitektur sakelar mode (*toggle mode*) melalui variabel lingkungan:

### 1. Mode Simulasi (`VITE_USE_MOCK_DATA=true`)
- Aplikasi berjalan mandiri tanpa memerlukan server backend Python atau hardware ESP8266.
- Menampilkan banner status simulasi di bagian atas halaman.
- Seluruh interaksi tombol kendali, perubahan mode, filter histori, grafik sensor, dan ekspor CSV dapat diuji secara penuh.
- Tersedia **Lab Simulasi IoT** pada bilah sisi desktop (Sidebar) untuk memicu tetesan air hujan atau memutus koneksi perangkat secara virtual.
- **Akun Uji Coba Default**:
  - **Username:** `admin`
  - **Password:** `adminPassword123!`

### 2. Mode Backend FastAPI (`VITE_USE_MOCK_DATA=false`)
- Frontend berkomunikasi langsung melalui HTTP REST API dengan backend FastAPI di `http://localhost:8000/api/v1`.
- Memanfaatkan token autentikasi **Bearer JWT** yang disimpan aman di `sessionStorage` (bukan localStorage biasa).
- Penanganan error respons HTTP, status loading, dan koneksi server offline tertangani secara anggun melalui Axios interceptor terpusat.

---

## 6. Daftar Endpoint REST API yang Terhubung

Frontend siap berkomunikasi dengan rute backend FastAPI berikut:

| Modul | Method | Endpoint | Keterangan |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/v1/auth/login` | Login pengguna & penerbitan token JWT |
| | `GET` | `/api/v1/auth/me` | Memeriksa data profil pengguna aktif |
| | `POST` | `/api/v1/auth/logout` | Konfirmasi logout sisi klien |
| **Dashboard** | `GET` | `/api/v1/dashboard/summary` | Agregasi lengkap status atap, cuaca, telemetri |
| | `GET` | `/api/v1/dashboard/status` | Polling ringan status instan & keputusan |
| **Perangkat** | `GET` | `/api/v1/devices` | Daftar perangkat terdaftar |
| | `GET` | `/api/v1/devices/{id}/status` | Status telemetri & heartbeat perangkat |
| | `POST` | `/api/v1/devices/{id}/commands` | Mengirim perintah `open` atau `close` |
| | `PATCH` | `/api/v1/devices/{id}/mode` | Mengubah mode operasi `auto` atau `manual` |
| **Cuaca** | `GET` | `/api/v1/weather/current` | Kondisi cuaca regional terkini |
| | `GET` | `/api/v1/weather/forecast` | Prakiraan detail per jam / horizon |
| | `GET` | `/api/v1/weather/status` | Kesehatan penyedia cuaca & status cache |
| | `POST` | `/api/v1/weather/refresh` | Paksa pembaruan data BMKG / OpenWeatherMap |
| **Histori** | `GET` | `/api/v1/history/activities` | Log aktivitas sistem dengan filter kategori |
| | `GET` | `/api/v1/history/sensors` | Rekaman telemetri sensor analog & cahaya |
| | `GET` | `/api/v1/history/forecasts` | Rekaman riwayat prakiraan presipitasi |
| | `GET` | `/api/v1/history/evaluation` | Evaluasi akurasi, presisi, recall, & F1 |
| | `GET` | `/api/v1/history/export` | Unduhan berkas laporan format CSV |
| **Pengaturan**| `GET` | `/api/v1/settings` | Mengambil ambang early-close & jeda |
| | `PATCH` | `/api/v1/settings` | Memperbarui parameter konfigurasi |

---

## 7. Struktur Folder Proyek

```text
frontendJ/
├── public/
│   └── assets/
│       └── roof-icon.svg          # Favicon & logo SVG kanopi jemuran
├── src/
│   ├── app/
│   │   ├── App.jsx                # Komponen induk aplikasi
│   │   ├── router.jsx             # Navigasi & rute terlindungi (ProtectedRoute)
│   │   └── providers.jsx          # Provider gabungan (Auth & App Context)
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.jsx         # Tombol aksesibel dengan loading & varian tema
│   │   │   ├── StatusBadge.jsx    # Badge status dengan dot indikator berkedip
│   │   │   ├── LoadingState.jsx   # Indikator pemuatan data
│   │   │   ├── ErrorState.jsx     # Penampil error dengan tombol coba ulang
│   │   │   ├── EmptyState.jsx     # Penampil kondisi data kosong
│   │   │   ├── ConfirmDialog.jsx  # Dialog modal konfirmasi interaksi kritis
│   │   │   └── Toast.jsx          # Kontainer notifikasi toast mengambang
│   │   ├── layout/
│   │   │   ├── AppLayout.jsx      # Layout induk responsif
│   │   │   ├── Sidebar.jsx        # Bilah samping desktop dengan lab simulasi
│   │   │   ├── Topbar.jsx         # Bilah atas dengan jam live WIB & profil
│   │   │   └── BottomNavigation.jsx # Navigasi bawah ramah ibu jari mobile
│   │   ├── dashboard/
│   │   │   ├── RoofStatusPanel.jsx # Ilustrasi atap animasi SVG & kontrol cepat
│   │   │   ├── LocalSensorPanel.jsx # Telemetri sensor hujan fisik (Ground Truth)
│   │   │   ├── WeatherSummary.jsx  # Ringkasan probabilitas presipitasi satelit
│   │   │   ├── DecisionPanel.jsx   # Penjelasan logika keputusan V2.0
│   │   │   └── RecentActivity.jsx  # Log pergerakan atap & event cuaca terbaru
│   │   └── charts/
│   │       ├── RainHistoryChart.jsx # Grafik Recharts telemetri ADC sensor hujan
│   │       └── ForecastChart.jsx    # Grafik Recharts probabilitas & ambang 80%
│   ├── pages/
│   │   ├── LoginPage.jsx          # Halaman masuk dengan form validasi
│   │   ├── DashboardPage.jsx      # Halaman utama visualisasi monitoring
│   │   ├── ControlPage.jsx        # Halaman kendali motor & log perintah
│   │   ├── WeatherPage.jsx        # Halaman analisis prakiraan cuaca regional
│   │   ├── HistoryPage.jsx        # Halaman filter log, sensor, & evaluasi model
│   │   ├── SettingsPage.jsx       # Halaman pengaturan ambang & spesifikasi
│   │   └── NotFoundPage.jsx       # Halaman error 404 tema natural
│   ├── services/
│   │   ├── apiClient.js           # Axios terpusat dengan interceptor & token
│   │   ├── authService.js         # Layanan autentikasi login & logout
│   │   ├── dashboardService.js    # Layanan ringkasan status dashboard
│   │   ├── deviceService.js       # Layanan kendali buka/tutup & mode perangkat
│   │   ├── weatherService.js      # Layanan data cuaca BMKG & refresh
│   │   ├── historyService.js      # Layanan telemetri, evaluasi, & ekspor CSV
│   │   └── settingsService.js     # Layanan parameter konfigurasi dinamis
│   ├── mocks/
│   │   ├── mockDashboard.js       # Data simulasi dashboard & status kanopi
│   │   ├── mockWeather.js         # Data simulasi satelit BMKG & proyeksi waktu
│   │   └── mockHistory.js         # Data simulasi 24 jam sensor & confusion matrix
│   ├── hooks/
│   │   ├── useDashboard.js        # Hook status dashboard dengan auto-refresh
│   │   ├── useDeviceControl.js    # Hook kendali motor dengan timer waktu respon
│   │   ├── useWeather.js          # Hook data cuaca dengan indikator kedaluwarsa
│   │   └── useHistory.js          # Hook filter histori & pengunduh CSV
│   ├── context/
│   │   ├── AuthContext.jsx        # State autentikasi & validasi sesi
│   │   └── AppContext.jsx         # State notifikasi toast & pemicu simulasi
│   ├── utils/
│   │   ├── formatDate.js          # Pemformatan tanggal & waktu lokal Indonesia
│   │   ├── formatters.js          # Kamus mapping label status sistem
│   │   └── exportCsv.js           # Utilitas konversi CSV dengan UTF-8 BOM
│   ├── styles/
│   │   └── index.css              # Konfigurasi Tailwind, scrollbar, & aksesibilitas
│   └── main.jsx                   # Entry point React Vite
├── .env                           # Konfigurasi aktif
├── .env.example                   # Contoh konfigurasi environment
├── .gitignore                     # Filter git
├── index.html                     # HTML shell dengan font Inter & Manrope
├── package.json                   # Dependensi proyek
├── postcss.config.js              # Konfigurasi PostCSS
├── tailwind.config.js             # Konfigurasi tema warna & bayangan Tailwind
└── vite.config.js                 # Konfigurasi Vite & vendor chunking
```

---

## 8. Lisensi & Pemeliharaan

Dikembangkan sebagai bagian dari sistem perlindungan jemuran cerdas **Weather-Responsive Roofing System V2.0**.
Dilarang menggunakan rahasia API atau kunci enkripsi fisik di sisi antarmuka frontend.
