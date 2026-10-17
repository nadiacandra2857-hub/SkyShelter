import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import Button from '../components/common/Button';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-3xl bg-forest/10 text-forest flex items-center justify-center mb-4 shadow-soft">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <span className="text-xs font-mono font-bold tracking-wider text-soft-amber uppercase mb-1">
        Error 404 — Halaman Tidak Ditemukan
      </span>

      <h1 className="text-2xl md:text-3xl font-extrabold text-charcoal font-sans mb-2">
        Halaman di Luar Radius Sensor
      </h1>

      <p className="text-xs md:text-sm text-muted-gray max-w-md mb-6 leading-relaxed">
        Tautan yang Anda tuju tidak tersedia atau telah dipindahkan. Silakan kembali ke dashboard utama untuk memantau status atap jemuran.
      </p>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="md"
          onClick={() => navigate(-1)}
          leftIcon={ArrowLeft}
          className="bg-white"
        >
          Kembali
        </Button>
        <Button
          variant="forest"
          size="md"
          onClick={() => navigate('/')}
          leftIcon={Home}
        >
          Ke Dashboard
        </Button>
      </div>
    </div>
  );
}

export default NotFoundPage;
