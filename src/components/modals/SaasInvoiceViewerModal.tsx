import React from 'react';
import { X, Printer, Download, CheckCircle2, Building, ShieldCheck } from 'lucide-react';
import { SaaSInvoice } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface SaasInvoiceViewerModalProps {
  invoice: SaaSInvoice;
  onClose: () => void;
}

export const SaasInvoiceViewerModal: React.FC<SaasInvoiceViewerModalProps> = ({
  invoice,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-sm p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Actions */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-sm">Resmi SaaS e-Arşiv Lisans Faturası</span>
            <span className="text-xs text-slate-400 font-mono">({invoice.invoiceNumber})</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Yazdır / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Sheet */}
        <div className="p-8 sm:p-10 space-y-6 bg-white text-slate-900 font-sans print:p-0">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-slate-900 pb-6 gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-base">
                  A
                </div>
                <span className="text-xl font-extrabold tracking-tight text-slate-900">
                  ApsisCloud Bilişim A.Ş.
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                Bulut Site ve Toplu Yapı Yönetim Sistemleri<br />
                Maslak Mah. Büyükdere Cad. No:245 Sarıyer / İstanbul<br />
                Boğaziçi Kurumlar V.D. - VKN: 0920491823
              </p>
            </div>

            <div className="text-right sm:text-right space-y-1">
              <span className="inline-block px-3 py-1 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-md">
                e-Arşiv Fatura
              </span>
              <div className="text-base font-extrabold font-mono text-slate-900">
                {invoice.invoiceNumber}
              </div>
              <div className="text-xs text-slate-500">
                Düzenleme Tarihi: <strong className="text-slate-800 font-mono">{formatDate(invoice.issueDate)}</strong>
              </div>
              <div className="text-xs text-slate-500">
                Vade Tarihi: <strong className="text-slate-800 font-mono">{formatDate(invoice.dueDate)}</strong>
              </div>
            </div>
          </div>

          {/* Customer / Site Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-200/80 text-xs">
            <div>
              <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px] mb-1">
                Müşteri / Muhatap Site
              </span>
              <div className="font-extrabold text-sm text-slate-900 mb-1">
                {invoice.siteName}
              </div>
              <p className="text-slate-600">Vergi / T.C. No: <span className="font-mono font-bold">{invoice.taxNumber}</span></p>
              <p className="text-slate-500 mt-1">Kat Malikleri Kurulu / Toplu Yapı Temsilciliği</p>
            </div>

            <div className="sm:text-right">
              <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px] mb-1">
                Ödeme & Lisans Durumu
              </span>
              <span
                className={`inline-block px-3 py-1 rounded-full font-bold text-xs border ${
                  invoice.status === 'paid'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}
              >
                {invoice.status === 'paid' ? 'Tahsil Edildi (Ödendi)' : 'Ödeme Bekliyor'}
              </span>
              {invoice.paidDate && (
                <div className="text-slate-500 mt-1">
                  Ödeme Tarihi: <span className="font-mono">{formatDate(invoice.paidDate)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Line Item Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-2.5 px-4">Hizmet / Açıklama</th>
                  <th className="py-2.5 px-4 text-center">Birim</th>
                  <th className="py-2.5 px-4 text-right">KDV</th>
                  <th className="py-2.5 px-4 text-right">Tutar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                <tr>
                  <td className="py-3 px-4">
                    <strong className="block text-slate-900">{invoice.period}</strong>
                    <span className="text-[11px] text-slate-500">
                      Tier-4 Bulut Sunucu, 256-Bit SSL, Sınırsız SMS/Bildirim Altyapısı Dahil
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">1 Yıl</td>
                  <td className="py-3 px-4 text-right font-mono">%20</td>
                  <td className="py-3 px-4 text-right font-mono font-bold">
                    {formatCurrency(invoice.amount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Total Breakdown */}
          <div className="flex justify-end">
            <div className="w-64 space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Ara Toplam:</span>
                <span className="font-mono font-semibold">{formatCurrency(invoice.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span>KDV (%20):</span>
                <span className="font-mono font-semibold">{formatCurrency(invoice.taxAmount)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t-2 border-slate-900 font-extrabold text-base text-slate-900">
                <span>Genel Toplam:</span>
                <span className="font-mono text-indigo-700">{formatCurrency(invoice.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Footer Notes */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 space-y-1">
            <div className="font-bold text-slate-700 flex items-center space-x-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Elektronik Fatura Güvenlik Bildirimi</span>
            </div>
            <p>
              Bu fatura 213 Sayılı Vergi Usul Kanunu uyarınca Gelir İdaresi Başkanlığı (GİB) e-Arşiv Fatura standartlarında düzenlenmiştir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
