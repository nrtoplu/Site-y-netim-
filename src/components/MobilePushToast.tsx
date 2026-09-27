import React, { useEffect, useState } from 'react';
import { Smartphone, X, Bell } from 'lucide-react';

interface MobilePushToastProps {
  title: string;
  body: string;
  onClose: () => void;
}

export const MobilePushToast: React.FC<MobilePushToastProps> = ({ title, body, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 6000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <aside
      aria-label="Mobil Bildirim Uyarısı"
      className="fixed top-4 right-4 z-50 max-w-sm w-full bg-slate-900/95 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 backdrop-blur-md animate-in slide-in-from-top-4 fade-in duration-300"
    >
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
          <Smartphone className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
              ApsisCloud • Mobil Bildirim
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Şimdi</span>
          </div>
          <h4 className="text-xs font-bold text-slate-100">{title}</h4>
          <p className="text-[11px] text-slate-300 leading-snug">{body}</p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg"
          aria-label="Bildirimi Kapat"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
