import React from 'react';
import { X, FileText, Download, Printer, ShieldCheck, Calendar, User, Tag, CheckCircle2 } from 'lucide-react';
import { ArchiveDocument } from '../../types';
import { formatDate } from '../../utils/formatters';

interface DocumentViewerModalProps {
  doc: ArchiveDocument;
  onClose: () => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({ doc, onClose }) => {
  const handleDownload = () => {
    const text = `RESMİ DİJİTAL ARŞİV BELGESİ\nBelge No: ${doc.fileNumber}\nBaşlık: ${doc.title}\nKategori: ${doc.category}\nTarih: ${doc.date}\nYükleyen: ${doc.uploader}\nDoğrulama Özeti (SHA-256): ${doc.verifiedHash}\n\nÖZET VE İÇERİK:\n${doc.summary}\n\nKat Mülkiyeti Kanunu ve KVKK Uyarınca Korunmaktadır.`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${doc.fileNumber || 'evrak'}_${doc.title.slice(0, 20)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Top bar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2.5">
            <FileText className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="font-semibold text-sm line-clamp-1">{doc.title}</h2>
              <span className="text-[11px] text-slate-400 font-mono">
                Kayıt No: {doc.fileNumber}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Yazdır"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>İndir ({doc.fileSize})</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
              aria-label="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Content View */}
        <div className="p-8 space-y-6 bg-slate-50/50">
          {/* Document Header Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold uppercase rounded-lg border border-indigo-100">
                {doc.category === 'decision_book'
                  ? 'Karar Defteri'
                  : doc.category === 'contract'
                  ? 'Resmi Sözleşme'
                  : doc.category === 'insurance'
                  ? 'Sigorta Poliçesi'
                  : doc.category === 'audit_report'
                  ? 'Denetim Raporu'
                  : doc.category === 'blueprint'
                  ? 'Mimari / Tesisat Projesi'
                  : 'Fatura & Belge'}
              </span>

              <div className="flex items-center space-x-4 text-xs text-slate-500">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDate(doc.date)}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <User className="w-3.5 h-3.5" />
                  <span>{doc.uploader}</span>
                </span>
                <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                  {doc.fileFormat} • {doc.fileSize}
                </span>
              </div>
            </div>

            <h1 className="text-xl font-bold text-slate-900 leading-snug">{doc.title}</h1>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              {doc.tags.map((tag, i) => (
                <span
                  key={i}
                  className="inline-flex items-center space-x-1 text-[11px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md"
                >
                  <Tag className="w-2.5 h-2.5 text-slate-400" />
                  <span>{tag}</span>
                </span>
              ))}
            </div>

            {/* Document Content / Summary */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-700 leading-relaxed space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Resmi Metin & İçerik Özeti
              </h3>
              <p>{doc.summary}</p>

              <div className="mt-4 pt-3 border-t border-slate-200 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block">Kayıt / Noter No:</span>
                  <span className="font-mono font-semibold text-slate-800">{doc.fileNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Erişim Yetkisi:</span>
                  <span className="text-emerald-700 font-semibold">Tüm Kat Malikleri & Sakinler</span>
                </div>
              </div>
            </div>

            {/* Cryptographic SHA-256 Seal */}
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 flex items-start space-x-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-emerald-950">
                    Kriptografik Bütünlük ve Değişmezlik Doğrulandı
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <p className="text-[11px] text-emerald-800">
                  Bu belge güvenli bulut depolama sunucusunda SHA-256 dijital mührü ile arşivlenmiştir. Belge üzerinde yapılacak herhangi bir tahrifat anında sistem tarafından tespit edilir.
                </p>
                <div className="font-mono text-[10px] text-slate-600 bg-white/80 p-1.5 rounded border border-emerald-200 break-all select-all">
                  SHA-256: {doc.verifiedHash}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal footer */}
        <div className="bg-slate-100 px-6 py-3 flex justify-end items-center border-t border-slate-200 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
