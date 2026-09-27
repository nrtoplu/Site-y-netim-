/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Scale,
  X,
  Download,
  Printer,
  AlertTriangle,
  Building,
  User,
  Phone,
  Mail,
  ShieldAlert,
  ShieldCheck,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  Copy,
  Check,
  Send,
} from 'lucide-react';
import { ApartmentUnit, SiteProfile } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { downloadLegalNoticePdf } from '../../utils/pdfExport';

interface LegalNoticeModalProps {
  unit: ApartmentUnit;
  siteProfile: SiteProfile;
  onClose: () => void;
  onNoticeDispatched?: (noticeDetails: {
    noticeRef: string;
    totalAmount: number;
    daysToPay: number;
  }) => void;
}

export const LegalNoticeModal: React.FC<LegalNoticeModalProps> = ({
  unit,
  siteProfile,
  onClose,
  onNoticeDispatched,
}) => {
  const overduePrincipal = Math.abs(unit.currentBalance);
  const lateFee = Math.round(overduePrincipal * 0.05); // %5 KMK
  const totalDemand = overduePrincipal + lateFee;

  const [daysToPay, setDaysToPay] = useState<number>(7);
  const [lawyerName, setLawyerName] = useState<string>('Av. Zeynep Yılmaz (Site Hukuk Danışmanı)');
  const [noticeRef] = useState<string>(
    () => `İHT-${unit.block}${unit.unitNo}-${Date.now().toString().slice(-6)}`
  );
  const [noticeDate] = useState<string>(() => new Date().toLocaleDateString('tr-TR'));

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dispatchLogged, setDispatchLogged] = useState(false);

  const defaultNoticeText = `YASAL İHTARNAME VE ÖDEME TALEBİ

İHTAR EDEN: ${siteProfile.siteName} Toplu Yapı Yönetim Kurulu
VEKİLİ / HUKUK SORUMLUSU: ${lawyerName}
MUHATAP: Sayın ${unit.residentName}
BAĞIMSIZ BÖLÜM: ${unit.block} Blok Daire No: ${unit.unitNo} (${
    unit.residentType === 'owner' ? 'Kat Maliki' : 'Kiracı / Bağımsız Bölümü Kullanan'
  })
İLETİŞİM: ${unit.phone || 'Kayıtlı telefon yok'}

KONU: 634 Sayılı Kat Mülkiyeti Kanunu'nun 20. ve 33. maddeleri uyarınca vadesi geçtiği halde ödenmeyen ortak gider aidat borcunun, işlemiş yasal gecikme tazminatının tahsili ve icra takibi öncesi son yasal ihtardır.

BORÇ DÖKÜMÜ VE HESAP MUTABAKATI:
1. Vadesi Geçmiş Ana Para Aidat/İşletme Borcu: ${formatCurrency(overduePrincipal)}
2. 634 S. KMK Md. 20/c Uyarınca %5 Kanuni Gecikme Tazminatı: ${formatCurrency(lateFee)}
TOPLAM ÖDENMESİ GEREKEN İHTAR TUTARI: ${formatCurrency(totalDemand)}

ÖDEME YAPILACAK BANKA HESABI:
Banka: ${siteProfile.bankName}
IBAN: ${siteProfile.iban}
Hesap Sahibi: ${siteProfile.accountHolder || siteProfile.siteName}
Açıklama: ${unit.block} Blok D:${unit.unitNo} Yasal İhtarname Kapatma

İHTARNAME METNİ:
Sayın Muhatap;
Yönetime tabi ${siteProfile.siteName} bünyesinde yer alan yukarıda bilgileri yazılı bağımsız bölümünüze tahakkuk eden ve vadesi geçmiş toplam ${formatCurrency(
    overduePrincipal
  )} ortak gider aidat ve işletme avansı borcunuz bulunmaktadır.

634 Sayılı Kat Mülkiyeti Kanunu'nun 20. maddesinin (c) fıkrası gereğince; "Gider veya avans payını ödemeyen kat maliki veya bağımsız bölümden fiilen yararlanan kiracı hakkında, diğer kat maliklerinden her biri veya yönetici tarafından, yönetim planına, bu Kanuna ve genel hükümlere göre dava açılabilir, icra takibi yapılabilir. Gider ve avans payının tamamını ödemeyen kat maliki ödemede geciktiği günler için aylık yüzde beş (%5) hesabıyla gecikme tazminatı ödemekle yükümlüdür."

Bu itibarla; işbu resmi ihtarnamenin tarafınıza tebliğinden itibaren ${daysToPay} (yedi) iş günü içerisinde yukarıda dökümü yer alan toplam ${formatCurrency(
    totalDemand
  )} tutarındaki borcun site yönetimimizin belirtilen banka hesabına eksiksiz olarak ödenmesini;

Aksi halde, borcun tahsili amacıyla 2004 Sayılı İcra ve İflas Kanunu hükümleri tahtında aleyhinize ilamsız icra takibi başlatılacağını, menkul/gayrimenkul mallarınız ile banka hesaplarınız ve araçlarınız üzerine haciz tatbik olunacağını, KMK 33. maddesi gereği dava açılacağını ve bu süreçte doğacak tüm icra ve yargılama giderleri ile Avukatlık Asgari Ücret Tarifesi uyarınca belirlenecek vekalet ücretinin tarafınıza yükleneceğini İHTAREN BİLDİRİRİZ.

İHTAR EDEN: ${siteProfile.siteName} Yönetim Kurulu Başkanı
HUKUK MÜŞAVİRLİĞİ: ${lawyerName}
DENETİM KURULU: ${siteProfile.auditorName || 'Site Denetçisi'}`;

  const [noticeText, setNoticeText] = useState(defaultNoticeText);

  const handleDownloadPdf = () => {
    setIsDownloading(true);
    try {
      downloadLegalNoticePdf({
        unit,
        siteProfile,
        overdueAmount: overduePrincipal,
        lateFeeAmount: lateFee,
        totalDemandAmount: totalDemand,
        noticeRef,
        noticeDate,
        daysToPay,
        customBodyText: noticeText,
        lawyerName,
      });
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);

      // Trigger dispatch log if not already done
      if (!dispatchLogged && onNoticeDispatched) {
        onNoticeDispatched({
          noticeRef,
          totalAmount: totalDemand,
          daysToPay,
        });
        setDispatchLogged(true);
      }
    } catch (err) {
      console.error('Legal notice PDF export error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(noticeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleRecordDispatch = () => {
    if (onNoticeDispatched) {
      onNoticeDispatched({
        noticeRef,
        totalAmount: totalDemand,
        daysToPay,
      });
      setDispatchLogged(true);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-rose-200 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-slate-950 text-white px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-800 shrink-0 print:hidden">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-300 border border-rose-400/30 flex items-center justify-center font-bold shrink-0">
              <Scale className="w-5 h-5 text-rose-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-sm sm:text-base tracking-tight">
                  Yasal İhtarname & Ödeme Talebi
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-200 font-bold border border-rose-400/30">
                  KMK Md. 20 & İİK Hükümleri
                </span>
              </div>
              <p className="text-xs text-rose-200">
                {unit.block} Blok D:{unit.unitNo} • {unit.residentName} için icra takibi öncesi yasal ihtarname oluşturma
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-end sm:self-auto">
            {/* Download Legal Notice PDF */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="px-4 py-2 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-extrabold rounded-xl text-xs transition shadow-xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 ring-1 ring-rose-400/50"
              title="Resmi Yasal İhtarnameyi PDF olarak indir"
            >
              <Download className="w-4 h-4 text-white" />
              <span>{isDownloading ? 'Oluşturuluyor...' : 'Yasal İhtarname İndir (PDF)'}</span>
            </button>

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="p-2 rounded-xl bg-rose-950/70 hover:bg-rose-900 text-rose-200 hover:text-white transition cursor-pointer"
              title="Yazdır / Baskı Önizleme"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-rose-300 hover:text-white hover:bg-rose-900 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Warning & Legal Mandate Banner */}
        <div className="bg-rose-50 border-b border-rose-200 px-5 sm:px-6 py-2.5 flex items-center justify-between text-xs text-rose-950 shrink-0 print:hidden">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              <strong>Resmi Hukuki Tebligat:</strong> Bu ihtarname, 634 Sayılı Kat Mülkiyeti Kanunu ve 2004 Sayılı İcra İflas Kanunu tahtında genel haciz takibi ve dava ikamesi öncesi son yasal ödeme ihtarıdır.
            </span>
          </div>
          {downloadSuccess && (
            <span className="font-bold text-emerald-700 flex items-center space-x-1">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>PDF Başarıyla İndirildi!</span>
            </span>
          )}
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 print:p-0">
          {/* Target Resident & Debt Breakdown Box */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white font-extrabold text-sm flex items-center justify-center shadow-xs shrink-0">
                {unit.block}:{unit.unitNo}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                    {unit.residentName}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                      unit.residentType === 'owner'
                        ? 'bg-sky-50 text-sky-700 border-sky-200'
                        : 'bg-purple-50 text-purple-700 border-purple-200'
                    }`}
                  >
                    {unit.residentType === 'owner' ? 'Kat Maliki' : 'Kiracı / Fiili Sakin'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-mono">
                  <span>📞 {unit.phone || 'Telefon Kaydı Yok'}</span>
                  <span>✉️ {unit.email || 'E-posta Yok'}</span>
                  <span>Kat {unit.floor} • {unit.grossM2} m²</span>
                </div>
              </div>
            </div>

            {/* Financial Summary Strip */}
            <div className="grid grid-cols-3 gap-2 text-right">
              <div className="p-2 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Ana Para Borcu</span>
                <span className="text-sm font-extrabold font-mono text-slate-900">
                  {formatCurrency(overduePrincipal)}
                </span>
              </div>

              <div className="p-2 bg-amber-50 rounded-xl border border-amber-200">
                <span className="text-[10px] uppercase font-bold text-amber-800 block">%5 Yasal Faiz</span>
                <span className="text-sm font-extrabold font-mono text-amber-700">
                  {formatCurrency(lateFee)}
                </span>
              </div>

              <div className="p-2 bg-rose-50 rounded-xl border border-rose-200">
                <span className="text-[10px] uppercase font-bold text-rose-800 block">Toplam İhtar</span>
                <span className="text-base font-extrabold font-mono text-rose-600">
                  {formatCurrency(totalDemand)}
                </span>
              </div>
            </div>
          </div>

          {/* Configuration Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-rose-600" />
                <span>Yasal Ödeme / Mehil Süresi:</span>
              </label>
              <select
                value={daysToPay}
                onChange={(e) => setDaysToPay(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500 cursor-pointer"
              >
                <option value={3}>3 (Üç) İş Günü (Acil İcra Öncesi)</option>
                <option value={5}>5 (Beş) İş Günü</option>
                <option value={7}>7 (Yedi) İş Günü (Standart Yasal Süre)</option>
                <option value={10}>10 (On) İş Günü</option>
                <option value={15}>15 (On Beş) Gün</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 flex items-center space-x-1">
                <Building className="w-3.5 h-3.5 text-rose-600" />
                <span>Hukuk Müşaviri / Vekil Bilgisi:</span>
              </label>
              <input
                type="text"
                value={lawyerName}
                onChange={(e) => setLawyerName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                placeholder="Avukat veya Hukuk Sorumlusu Adı..."
              />
            </div>
          </div>

          {/* Legal Notice Text Editor / Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-800 flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-rose-600" />
                <span>Resmi İhtarname Metni (Önizleme & Düzenleme):</span>
              </label>

              <div className="flex items-center space-x-2">
                <span className="text-[11px] text-slate-400 font-mono">Ref: {noticeRef}</span>
                <button
                  type="button"
                  onClick={handleCopyText}
                  className="text-rose-700 hover:text-rose-900 font-bold inline-flex items-center space-x-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Kopyalandı' : 'Metni Kopyala'}</span>
                </button>
              </div>
            </div>

            <textarea
              rows={11}
              value={noticeText}
              onChange={(e) => setNoticeText(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500 leading-relaxed resize-y shadow-2xs"
            />
          </div>

          {/* Bank Payment Verification Info */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs text-slate-600">
            <div>
              <span className="font-bold text-slate-800">Ödeme Yapılacak Resmi Hesap: </span>
              <span>
                {siteProfile.bankName} - {siteProfile.iban} ({siteProfile.accountHolder || siteProfile.siteName})
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Açıklama: {unit.block} Blok D:{unit.unitNo} İhtarname
            </span>
          </div>

          {/* Dispatch Confirmation Banner */}
          {dispatchLogged && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-2 text-xs text-emerald-900 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Yasal İhtarname Kaydedildi:</strong> Dairenin geçmiş ihtilaf zaman çizelgesine resmi ihtarname kaydı işlendi ve site bildirimlerine eklendi.
              </span>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Kat Mülkiyeti Kanunu Madde 20 & İcra İflas Kanunu Uyumlu</span>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            {!dispatchLogged && (
              <button
                type="button"
                onClick={handleRecordDispatch}
                className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition shadow-2xs flex items-center space-x-1.5 cursor-pointer"
                title="İhtarnameyi sisteme tebliğ edildi olarak kaydet"
              >
                <Send className="w-3.5 h-3.5 text-indigo-600" />
                <span>Zaman Çizelgesine İşle</span>
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition shadow-2xs flex items-center space-x-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Yazdır</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="px-5 py-2 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white rounded-xl text-xs font-extrabold transition shadow-xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-white" />
              <span>{isDownloading ? 'İndiriliyor...' : 'Yasal İhtarname PDF İndir'}</span>
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
