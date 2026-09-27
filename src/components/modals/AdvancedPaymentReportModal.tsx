/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  X,
  FileText,
  Download,
  Printer,
  Calendar,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Building,
  User,
  Phone,
  Mail,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Receipt,
  CreditCard,
  History,
  Check,
  Sparkles,
} from 'lucide-react';
import { ApartmentUnit, SiteProfile, DuesRecord } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { TimelineEvent, generateUnitTimelineEvents } from '../../utils/unitTimeline';
import { downloadAdvancedPaymentReportPdf } from '../../utils/pdfExport';

interface AdvancedPaymentReportModalProps {
  unit: ApartmentUnit;
  siteProfile: SiteProfile;
  dues?: DuesRecord[];
  extraNotes?: TimelineEvent[];
  onClose: () => void;
  onViewReceipt?: (due: DuesRecord) => void;
}

export const AdvancedPaymentReportModal: React.FC<AdvancedPaymentReportModalProps> = ({
  unit,
  siteProfile,
  dues = [],
  extraNotes = [],
  onClose,
  onViewReceipt,
}) => {
  const [dateFilter, setDateFilter] = useState<'all' | '6months' | '3months' | 'currentYear'>('all');
  const [includeLateFees, setIncludeLateFees] = useState(true);
  const [includeDisputeNotes, setIncludeDisputeNotes] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Generate all chronological events for this unit
  const allEvents = useMemo(() => {
    return generateUnitTimelineEvents(unit, dues, siteProfile, extraNotes);
  }, [unit, dues, siteProfile, extraNotes]);

  // Apply filters
  const filteredEvents = useMemo(() => {
    let list = [...allEvents];

    if (!includeLateFees) {
      list = list.filter((e) => e.type !== 'late_fee');
    }

    if (!includeDisputeNotes) {
      list = list.filter((e) => e.type !== 'dispute_note' && e.type !== 'sms_reminder');
    }

    if (dateFilter === '3months') {
      const cutoff = new Date('2025-01-01');
      list = list.filter((e) => new Date(e.date) >= cutoff);
    } else if (dateFilter === '6months') {
      const cutoff = new Date('2024-10-01');
      list = list.filter((e) => new Date(e.date) >= cutoff);
    } else if (dateFilter === 'currentYear') {
      list = list.filter((e) => e.date.startsWith('2025') || e.date.startsWith('2026'));
    }

    // Sort descending for readable formal statement
    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return list;
  }, [allEvents, includeLateFees, includeDisputeNotes, dateFilter]);

  // KPI Computations
  const totalCharged = filteredEvents
    .filter((e) => e.type === 'charge')
    .reduce((sum, e) => sum + e.amount, 0);
  const totalPaid = filteredEvents
    .filter((e) => e.type === 'payment')
    .reduce((sum, e) => sum + e.amount, 0);
  const totalLateFees = filteredEvents
    .filter((e) => e.type === 'late_fee')
    .reduce((sum, e) => sum + e.amount, 0);
  const chargeCount = filteredEvents.filter((e) => e.type === 'charge').length;
  const paymentCount = filteredEvents.filter((e) => e.type === 'payment').length;

  const reportRef = useMemo(() => {
    return `RAP-${unit.block}${unit.unitNo}-${Date.now().toString().slice(-6)}`;
  }, [unit]);

  const reportDate = useMemo(() => {
    return new Date().toLocaleDateString('tr-TR');
  }, []);

  const handleDownloadPdf = () => {
    setIsDownloading(true);
    try {
      downloadAdvancedPaymentReportPdf({
        unit,
        siteProfile,
        events: filteredEvents,
        reportDate,
        reportRef,
      });
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        {/* Top Control Bar (Hidden when printed) */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-5 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 shrink-0 print:hidden">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-400/30 flex items-center justify-center font-bold shrink-0">
              <FileText className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-sm sm:text-base tracking-tight">
                  Gelişmiş Ödeme Raporu (Resmi Daire Ekstresi)
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-300 font-bold border border-amber-400/30">
                  PDF Dışa Aktarım
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {unit.block} Blok D:{unit.unitNo} • {unit.residentName} için resmi muhasebe mutabakat raporu
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-end sm:self-auto">
            {/* Download PDF Button */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold rounded-xl text-xs transition shadow-xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              title="Raporu resmi PDF formatında bilgisayarınıza indirin"
            >
              <Download className="w-4 h-4 text-slate-950" />
              <span>{isDownloading ? 'PDF Oluşturuluyor...' : 'PDF İndir (.pdf)'}</span>
            </button>

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title="Yazdır / Baskı Önizleme"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter & Customization Toolbar (Hidden when printed) */}
        <div className="bg-slate-50 px-5 sm:px-6 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 print:hidden">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-700 flex items-center space-x-1">
              <Filter className="w-3.5 h-3.5 text-indigo-600" />
              <span>Dönem Filtresi:</span>
            </span>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">Tüm Dönemler ({allEvents.length} Kayıt)</option>
              <option value="currentYear">Bu Yıl (2025 - 2026)</option>
              <option value="6months">Son 6 Aylık Dönem</option>
              <option value="3months">Son 3 Aylık Dönem</option>
            </select>

            <label className="flex items-center space-x-1.5 cursor-pointer ml-2 text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={includeLateFees}
                onChange={(e) => setIncludeLateFees(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Gecikme Zammı Dahil</span>
            </label>

            <label className="flex items-center space-x-1.5 cursor-pointer ml-1 text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={includeDisputeNotes}
                onChange={(e) => setIncludeDisputeNotes(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>İhtilaf & SMS Kayıtları</span>
            </label>
          </div>

          {downloadSuccess && (
            <div className="flex items-center space-x-1 text-emerald-700 font-bold animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>PDF Başarıyla İndirildi!</span>
            </div>
          )}
        </div>

        {/* Printable Formal Document Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 print:p-0 print:overflow-visible">
          {/* Official Site Letterhead */}
          <div className="border-b-2 border-slate-900 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {siteProfile.siteName}
                </h1>
                <p className="text-xs text-slate-600 mt-1">{siteProfile.address}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs text-slate-500 mt-1 font-mono">
                  <span>Vergi Dairesi: {siteProfile.taxOffice}</span>
                  <span>Vergi No: {siteProfile.taxNumber}</span>
                  <span>Banka: {siteProfile.bankName}</span>
                </div>
                <div className="text-xs font-mono font-bold text-slate-700 mt-1">
                  IBAN: {siteProfile.iban}
                </div>
              </div>

              <div className="sm:text-right shrink-0">
                <div className="inline-block px-3 py-1 bg-amber-500 text-slate-950 font-extrabold text-xs rounded-lg uppercase tracking-wider mb-1">
                  RESMİ GELİŞMİŞ ÖDEME RAPORU
                </div>
                <div className="text-xs font-mono text-slate-500">
                  Rapor Ref: <strong className="text-slate-800">{reportRef}</strong>
                </div>
                <div className="text-xs text-slate-500">
                  Tanzim Tarihi: <strong className="text-slate-800">{reportDate}</strong>
                </div>
                <div className="text-xs text-slate-500">
                  Mevzuat: <strong>634 Sayılı KMK Madde 20 & 33</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Unit & Resident Demographics Profile Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5">
            <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-3 flex items-center space-x-2">
              <Building className="w-4 h-4 text-indigo-600" />
              <span>Bağımsız Bölüm ve Sakin Bilgileri</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <div className="text-slate-500">Bağımsız Bölüm:</div>
                <div className="font-extrabold text-slate-900 text-sm">
                  {unit.block} Blok - No: {unit.unitNo}
                </div>
                <div className="text-slate-500 text-[11px]">
                  Kat {unit.floor} • {unit.grossM2} m² • Arsa Payı: {unit.landShare} / 1000
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-slate-500">Sakin Adı Soyadı:</div>
                <div className="font-extrabold text-slate-900 text-sm flex items-center space-x-1.5">
                  <span>{unit.residentName}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                      unit.residentType === 'owner'
                        ? 'bg-sky-50 text-sky-700 border-sky-200'
                        : 'bg-purple-50 text-purple-700 border-purple-200'
                    }`}
                  >
                    {unit.residentType === 'owner' ? 'Kat Maliki' : 'Kiracı'}
                  </span>
                </div>
                <div className="text-slate-500 text-[11px] font-mono">
                  Plaka: {unit.plateNumber || 'Plaka Kayıtsız'}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-slate-500">İletişim Bilgileri:</div>
                <div className="font-mono text-slate-800">{unit.phone || 'Telefon Kaydı Yok'}</div>
                <div className="text-slate-500 text-[11px]">{unit.email || 'E-posta Kaydı Yok'}</div>
              </div>
            </div>
          </div>

          {/* Financial KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Toplam Tahakkuk
              </span>
              <div className="text-base sm:text-lg font-extrabold text-slate-900 font-mono mt-0.5">
                {formatCurrency(totalCharged)}
              </div>
              <span className="text-[11px] text-slate-500">{chargeCount} Aylık Dönem</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200">
              <span className="text-[10px] uppercase font-bold text-emerald-800 block tracking-wider">
                Toplam Tahsilat
              </span>
              <div className="text-base sm:text-lg font-extrabold text-emerald-700 font-mono mt-0.5">
                {formatCurrency(totalPaid)}
              </div>
              <span className="text-[11px] text-emerald-600">{paymentCount} Başarılı Ödeme</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200">
              <span className="text-[10px] uppercase font-bold text-amber-800 block tracking-wider">
                Gecikme Zammı (%5)
              </span>
              <div className="text-base sm:text-lg font-extrabold text-amber-700 font-mono mt-0.5">
                {formatCurrency(totalLateFees)}
              </div>
              <span className="text-[11px] text-amber-600">KMK Md. 20 Yasal Faiz</span>
            </div>

            <div
              className={`p-3.5 rounded-2xl border ${
                unit.currentBalance < 0
                  ? 'bg-rose-50/80 border-rose-200'
                  : unit.currentBalance > 0
                  ? 'bg-emerald-50/80 border-emerald-200'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <span
                className={`text-[10px] uppercase font-bold block tracking-wider ${
                  unit.currentBalance < 0 ? 'text-rose-800' : 'text-slate-400'
                }`}
              >
                Güncel Net Bakiye
              </span>
              <div
                className={`text-base sm:text-lg font-extrabold font-mono mt-0.5 ${
                  unit.currentBalance < 0
                    ? 'text-rose-600'
                    : unit.currentBalance > 0
                    ? 'text-emerald-600'
                    : 'text-slate-800'
                }`}
              >
                {unit.currentBalance === 0 ? '0,00 ₺' : formatCurrency(unit.currentBalance)}
              </div>
              <span
                className={`text-[11px] font-bold ${
                  unit.currentBalance < 0
                    ? 'text-rose-700'
                    : unit.currentBalance > 0
                    ? 'text-emerald-700'
                    : 'text-slate-600'
                }`}
              >
                {unit.currentBalance < 0
                  ? 'Vadesi Geçmiş Borç'
                  : unit.currentBalance > 0
                  ? 'Avans Bakiye'
                  : 'Mutabık / Borç Yok'}
              </span>
            </div>
          </div>

          {/* Itemized Chronological Accounting Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                <History className="w-4 h-4 text-indigo-600" />
                <span>Kronolojik Aidat ve Ödeme Hareketleri Cetveli</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                {filteredEvents.length} İşlem Kaydı
              </span>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-2.5 px-3">Tarih</th>
                    <th className="py-2.5 px-3">Dönem</th>
                    <th className="py-2.5 px-3">İşlem Türü</th>
                    <th className="py-2.5 px-4">Açıklama</th>
                    <th className="py-2.5 px-3">Makbuz / Dekont Ref</th>
                    <th className="py-2.5 px-3 text-right">İşlem Tutarı</th>
                    <th className="py-2.5 px-3 text-right">İşlem Sonrası Bakiye</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredEvents.map((item, idx) => {
                    const isPayment = item.type === 'payment';
                    const isLateFee = item.type === 'late_fee';
                    const isSms = item.type === 'sms_reminder';
                    const isDispute = item.type === 'dispute_note';

                    return (
                      <tr
                        key={item.id || idx}
                        className={`hover:bg-slate-50 transition-colors ${
                          idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'
                        }`}
                      >
                        <td className="py-2.5 px-3 font-mono text-[11px] whitespace-nowrap text-slate-500">
                          {formatDate(item.date)}
                        </td>

                        <td className="py-2.5 px-3 whitespace-nowrap font-medium text-slate-800">
                          {item.period}
                        </td>

                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              isPayment
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : isLateFee
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : isSms
                                ? 'bg-amber-100 text-amber-900 border-amber-300'
                                : isDispute
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {isPayment
                              ? 'Tahsilat'
                              : isLateFee
                              ? 'Gecikme Zammı'
                              : isSms
                              ? 'SMS Hatırlatma'
                              : isDispute
                              ? 'İhtilaf Notu'
                              : 'Tahakkuk'}
                          </span>
                        </td>

                        <td className="py-2.5 px-4 text-slate-600 max-w-xs">
                          <div className="font-semibold text-slate-800">{item.title}</div>
                          <div className="text-[11px] text-slate-500 truncate">{item.description}</div>
                        </td>

                        <td className="py-2.5 px-3 font-mono text-[11px] whitespace-nowrap text-slate-600">
                          {item.receiptNo ? (
                            <span className="font-bold text-indigo-700">{item.receiptNo}</span>
                          ) : item.transactionRef ? (
                            <span>{item.transactionRef}</span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono font-bold whitespace-nowrap">
                          {item.amount > 0 ? (
                            <span className={isPayment ? 'text-emerald-600' : 'text-rose-600'}>
                              {isPayment ? '+' : '-'}
                              {formatCurrency(item.amount)}
                            </span>
                          ) : (
                            <span className="text-slate-400">0,00 ₺</span>
                          )}
                        </td>

                        <td className="py-2.5 px-3 text-right font-mono font-bold whitespace-nowrap">
                          <span
                            className={
                              item.balanceAfter < 0
                                ? 'text-rose-600'
                                : item.balanceAfter > 0
                                ? 'text-emerald-600'
                                : 'text-slate-700'
                            }
                          >
                            {item.balanceAfter === 0 ? '0 ₺' : formatCurrency(item.balanceAfter)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Legal Advisory & Settlement Notice */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs text-slate-600">
            <div className="flex items-center space-x-2 font-bold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Yasal İhtar ve Mutabakat Bildirimi (KMK Md. 20 / 33)</span>
            </div>
            <p className="leading-relaxed">
              Kat Mülkiyeti Kanunu'nun 20. maddesi gereğince, kat malikleri ve kiracılar ortak yerlerin bakım, onarım ve işletme giderlerine arsa payları oranında veya yönetim planı hükümlerine göre katılmakla yükümlüdür. Gününde ödenmeyen aidat ve işletme avansı borçlarına aylık %5 kanuni gecikme tazminatı uygulanır. Vadesi geçmiş borç bakiyesi bulunması durumunda site yönetimi icra takibi ve dava açma yetkisine haizdir.
            </p>
          </div>

          {/* Official Signatures & Seal Block */}
          <div className="pt-6 border-t-2 border-slate-200">
            <div className="grid grid-cols-3 gap-6 text-center text-xs">
              <div className="space-y-8">
                <div className="font-extrabold text-slate-900 uppercase">
                  Site Yönetim Kurulu Başkanı
                </div>
                <div className="border-t border-dashed border-slate-300 pt-2 text-slate-600">
                  {siteProfile.managementBoard[0] || 'Yönetim Kurulu Başkanı'}
                  <div className="text-[10px] text-slate-400">İmza / Mühür</div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="font-extrabold text-slate-900 uppercase">Sayman / Muhasebe</div>
                <div className="border-t border-dashed border-slate-300 pt-2 text-slate-600">
                  {siteProfile.managementBoard[1] || 'Muhasebe Sorumlusu'}
                  <div className="text-[10px] text-slate-400">İmza</div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="font-extrabold text-slate-900 uppercase">Denetim Kurulu</div>
                <div className="border-t border-dashed border-slate-300 pt-2 text-slate-600">
                  {siteProfile.auditorName || 'Site Denetçisi'}
                  <div className="text-[10px] text-slate-400">İmza</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls (Hidden when printed) */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>
              ApsisCloud Resmi Muhasebe Modülü tarafından oluşturulmuştur.
            </span>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition shadow-2xs flex items-center space-x-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Yazdır / Baskı Önizleme</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-extrabold transition shadow-xs flex items-center space-x-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-950" />
              <span>{isDownloading ? 'İndiriliyor...' : 'Gelişmiş Ödeme Raporu İndir (.pdf)'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
