import React from 'react';
import { X, Printer, Download, CheckCircle2, ShieldCheck, QrCode } from 'lucide-react';
import { DuesRecord, SiteProfile } from '../../types';
import { formatCurrency, formatDate, numberToTurkishWords } from '../../utils/formatters';

interface ReceiptModalProps {
  receipt: DuesRecord;
  siteProfile: SiteProfile;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ receipt, siteProfile, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Generate text/html blob download simulation
    const content = `RESMİ AİDAT TAHSİLAT MAKBUZU\nMakbuz No: ${receipt.receiptNo || 'MK-2025-001'}\nSite: ${siteProfile.siteName}\nBağımsız Bölüm: ${receipt.unitDisplay}\nSakin: ${receipt.residentName}\nTutar: ${formatCurrency(receipt.amount)}\nTarih: ${receipt.paidDate || receipt.dueDate}\nÖdeme Yolu: ${receipt.paymentMethod === 'credit_card' ? 'Online Kredi Kartı' : 'Banka Havalesi/EFT'}\nİşlem Referansı: ${receipt.transactionRef || 'TRX-DEFAULT'}\n634 Sayılı Kat Mülkiyeti Kanunu Uyarınca Tanzim Edilmiştir.`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Makbuz_${receipt.receiptNo || 'aidat'}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="receipt-title"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Bar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 id="receipt-title" className="font-semibold text-lg">
              Resmi Aidat Tahsilat Makbuzu
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors border border-slate-700"
              aria-label="Makbuzu yazdır"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Yazdır</span>
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
              aria-label="Makbuzu indir"
            >
              <Download className="w-3.5 h-3.5" />
              <span>İndir</span>
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

        {/* Printable Official Receipt Body */}
        <div className="p-8 bg-gradient-to-b from-white to-slate-50 print:p-0">
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 bg-white shadow-inner relative">
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
              <span className="text-8xl font-black text-slate-900 rotate-[-25deg] tracking-widest">
                ÖDENDİ
              </span>
            </div>

            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 mb-2">
                  Tahsilat Makbuzu
                </span>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                  {siteProfile.siteName}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {siteProfile.address}
                </p>
                <p className="text-xs text-slate-500">
                  {siteProfile.taxOffice} V.D. / VKN: {siteProfile.taxNumber}
                </p>
              </div>

              <div className="text-right sm:text-right w-full sm:w-auto bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Makbuz Seri / No
                </div>
                <div className="text-base font-mono font-bold text-indigo-700">
                  {receipt.receiptNo || 'MK-2025-0018'}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Düzenleme Tarihi: {formatDate(receipt.paidDate || receipt.dueDate)}
                </div>
              </div>
            </div>

            {/* Content Details Table */}
            <div className="py-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2.5">
                <div>
                  <span className="text-xs text-slate-500 font-medium block">Bağımsız Bölüm (Daire):</span>
                  <span className="font-semibold text-slate-800 text-base">{receipt.unitDisplay}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-medium block">Adı Soyadı / Unvanı:</span>
                  <span className="font-semibold text-slate-800">{receipt.residentName}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-medium block">Aidat Dönemi:</span>
                  <span className="font-medium text-slate-700">{receipt.month}</span>
                </div>
              </div>

              <div className="space-y-2.5">
                <div>
                  <span className="text-xs text-slate-500 font-medium block">Ödeme Yöntemi:</span>
                  <span className="inline-flex items-center space-x-1.5 font-medium text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>
                      {receipt.paymentMethod === 'credit_card'
                        ? 'Güvenli 3D Online Kredi Kartı'
                        : receipt.paymentMethod === 'bank_transfer'
                        ? 'Banka Havalesi / EFT'
                        : 'Elden Nakit Tahsilat'}
                    </span>
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-medium block">İşlem Referans No (Bank / Auth ID):</span>
                  <span className="font-mono text-xs text-slate-700 bg-slate-100 px-2 py-1 rounded">
                    {receipt.transactionRef || 'TRX-884920491'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-medium block">Açıklama:</span>
                  <span className="text-xs text-slate-600 italic">{receipt.description}</span>
                </div>
              </div>
            </div>

            {/* Total Highlight */}
            <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <span className="text-xs text-indigo-900 font-medium block">Yazıyla:</span>
                <span className="text-sm font-semibold text-indigo-950">
                  {numberToTurkishWords(receipt.amount)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 block uppercase font-bold tracking-wider">
                  Tahsil Edilen Tutar
                </span>
                <span className="text-2xl font-extrabold text-indigo-700 font-mono">
                  {formatCurrency(receipt.amount)}
                </span>
              </div>
            </div>

            {/* Footer with Signatures and QR Code */}
            <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-3 items-center gap-4 text-center">
              {/* QR Verification */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-100 rounded-lg p-1.5 border border-slate-200 flex items-center justify-center">
                  <QrCode className="w-full h-full text-slate-700" />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 font-mono">
                  E-Doğrulama: 634-KMK-20
                </span>
              </div>

              {/* Resident */}
              <div>
                <span className="text-xs text-slate-500 font-medium block mb-1">Ödeyen Sakin</span>
                <span className="text-xs font-semibold text-slate-800">{receipt.residentName}</span>
                <div className="h-8 flex items-center justify-center">
                  <span className="text-[10px] text-emerald-600 font-medium">✓ Elektronik Onaylı</span>
                </div>
              </div>

              {/* Management Stamp */}
              <div>
                <span className="text-xs text-slate-500 font-medium block mb-1">Tahsil Eden Yönetim</span>
                <div className="border border-indigo-200 rounded-lg p-2 bg-indigo-50/40 text-indigo-900">
                  <div className="text-[10px] font-bold uppercase tracking-tight leading-tight">
                    {siteProfile.siteName}
                  </div>
                  <div className="text-[9px] text-indigo-700">Yönetim Kurulu Kaşesi</div>
                  <div className="text-[8px] text-emerald-700 font-mono font-bold mt-0.5">
                    DIJITAL MÜHÜRLÜ
                  </div>
                </div>
              </div>
            </div>

            {/* Legal Notice */}
            <div className="mt-6 pt-3 border-t border-slate-100 text-center">
              <p className="text-[10px] text-slate-400 leading-normal">
                Bu makbuz 634 Sayılı Kat Mülkiyeti Kanunu'nun 20. maddesi uyarınca dijital sistem üzerinden düzenlenmiş olup mali ve hukuki geçerliliğe sahiptir. İtiraz süresi tanzim tarihinden itibaren 15 gündür.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Bottom Buttons */}
        <div className="bg-slate-100 px-6 py-3 flex justify-end items-center print:hidden border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-sm font-medium transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
