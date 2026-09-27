import React from 'react';
import { X, Key, Eye, Type, Accessibility, CheckCircle2 } from 'lucide-react';

interface ShortcutsModalProps {
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ onClose }) => {
  const SHORTCUTS = [
    { key: 'Alt + 1', desc: 'Genel Bakış (Dashboard)' },
    { key: 'Alt + 2', desc: 'Aidat Takibi & Online Tahsilat' },
    { key: 'Alt + 3', desc: 'Gider Yönetimi & Faturalar' },
    { key: 'Alt + 4', desc: 'Şeffaf Bütçe Raporlama Paneli' },
    { key: 'Alt + 5', desc: 'Arıza & Bakım Onarım Talepleri' },
    { key: 'Alt + 6', desc: 'Sakinler İletişim & Duyurular & Anketler' },
    { key: 'Alt + 7', desc: 'Dijital Arşiv & Karar Defteri' },
    { key: 'Alt + 8', desc: 'Mobil Bildirimler & SMS Merkezi' },
    { key: 'Alt + 9', desc: 'Güvenli Bulut Sunucu Durumu' },
    { key: 'Esc', desc: 'Açık Pencereyi / Makbuzu / Modalı Kapat' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-sm p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
    >
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Accessibility className="w-5 h-5 text-indigo-400" />
            <h2 id="shortcuts-title" className="font-semibold text-base">
              Erişilebilirlik & Klavye Kısayolları Rehberi
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600">
            ApsisCloud, engelli erişilebilirliği (WCAG 2.1 AA standartları) ve ekran okuyucu uyumluluğu gözetilerek tasarlanmıştır. Sayfalar arasında klavye kısayollarını kullanarak anında geçiş yapabilirsiniz.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 divide-y divide-slate-200/80">
            {SHORTCUTS.map((sc, idx) => (
              <div key={idx} className="py-2 flex items-center justify-between text-xs">
                <span className="text-slate-700 font-medium">{sc.desc}</span>
                <kbd className="px-2.5 py-1 bg-white border border-slate-300 rounded font-mono font-bold text-slate-900 shadow-xs">
                  {sc.key}
                </kbd>
              </div>
            ))}
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-xs text-indigo-950 space-y-1">
            <span className="font-bold block">Ekran Okuyucu ve Kontrast Desteği:</span>
            <p className="text-indigo-900 text-[11px]">
              Üst bardaki göz ikonunu kullanarak yazı tipi boyutunu (A / A+ / A++) büyütebilir, yüksek kontrastlı siyah/beyaz görünümü aktif edebilirsiniz.
            </p>
          </div>
        </div>

        <div className="bg-slate-100 px-6 py-3 flex justify-end items-center border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg"
          >
            Anladım, Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
