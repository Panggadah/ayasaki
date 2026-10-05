import React, { useState } from 'react';
import { Lock, KeyRound, AlertCircle, CheckCircle2, X } from 'lucide-react';

interface PINModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (pin: string) => void;
}

export const PINModal: React.FC<PINModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) {
      setError('Masukkan PIN terlebih dahulu');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pin.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onSuccess(pin.trim());
        setPin('');
        onClose();
      } else {
        setError(data.message || 'PIN PJ salah! Silakan coba lagi.');
      }
    } catch (err: any) {
      setError('Terjadi kendala jaringan: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUseDefault = () => {
    setPin('1234');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Masuk sebagai PJ Matkul</h3>
            <p className="text-xs text-slate-500">
              Khusus Penanggung Jawab untuk upload & edit tugas
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              PIN Verifikasi PJ
            </label>
            <div className="relative">
              <input
                type="password"
                maxLength={10}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError(null);
                }}
                placeholder="Masukkan PIN (Default: 1234)"
                autoFocus
                className="w-full px-4 py-3 pl-11 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg tracking-widest font-mono"
              />
              <KeyRound className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
            
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                PIN Bawaan Pabrik: <span className="font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">1234</span>
              </span>
              <button
                type="button"
                onClick={handleUseDefault}
                className="text-blue-600 hover:underline font-medium cursor-pointer"
              >
                Gunakan 1234
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
            <div className="font-semibold text-slate-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Hak Akses PJ Matkul:
            </div>
            <p>• Mengunggah tugas baru & link pengumpulan</p>
            <p>• Memperpanjang deadline & memberi pengumuman</p>
            <p>• Mengedit atau menghapus rincian tugas</p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 border border-slate-200 text-slate-700 rounded-xl font-medium text-sm hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl font-semibold text-sm shadow-md shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Memverifikasi...' : 'Verifikasi & Masuk'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
