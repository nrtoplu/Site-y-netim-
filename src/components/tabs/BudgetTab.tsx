import React, { useState } from 'react';
import {
  PieChart,
  Printer,
  Download,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Building,
  FileSpreadsheet,
  FileText,
  BadgeCheck,
} from 'lucide-react';
import { SiteProfile, DuesRecord, ExpenseRecord } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface BudgetTabProps {
  siteProfile: SiteProfile;
  dues: DuesRecord[];
  expenses: ExpenseRecord[];
}

export const BudgetTab: React.FC<BudgetTabProps> = ({ siteProfile, dues, expenses }) => {
  const [reportMonth, setReportMonth] = useState('Mart 2025');

  // Income calculations
  const totalDuesCollected = dues
    .filter((d) => d.status === 'paid')
    .reduce((acc, d) => acc + d.amount, 0);

  const totalDuesPending = dues
    .filter((d) => d.status === 'pending')
    .reduce((acc, d) => acc + d.amount, 0);

  const totalDuesOverdue = dues
    .filter((d) => d.status === 'overdue')
    .reduce((acc, d) => acc + d.amount + (d.lateFee || 0), 0);

  // Expense calculations
  const totalApprovedExpenses = expenses
    .filter((e) => e.status === 'approved')
    .reduce((acc, e) => acc + e.amount, 0);

  const netMonthlySurplus = totalDuesCollected - totalApprovedExpenses;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadReport = () => {
    const reportContent = `ZÜMRÜT PARK KONUTLARI SİTESİ\nŞEFFAF MALİ DENETİM VE BÜTÇE RAPORU (${reportMonth})\n\n1. GELİR BİLGİLERİ:\n- Tahsil Edilen Aidatlar: ${formatCurrency(totalDuesCollected)}\n- Vadesi Bekleyen Aidatlar: ${formatCurrency(totalDuesPending)}\n- Gecikmiş / Takipteki Alacaklar: ${formatCurrency(totalDuesOverdue)}\n\n2. GİDER VE HARCAMA BİLGİLERİ:\n- Onaylı İşletme Giderleri: ${formatCurrency(totalApprovedExpenses)}\n- Aylık Net Fazla / Bakiye: ${formatCurrency(netMonthlySurplus)}\n\n3. KASA VE BANKA VARLIKLARI:\n- Cari İşletme Kasası: ${formatCurrency(siteProfile.operatingFundBalance)}\n- Demirbaş / Yedek Akçe Fonu: ${formatCurrency(siteProfile.reserveFundBalance)}\n- Toplam Nakit Varlık: ${formatCurrency(siteProfile.operatingFundBalance + siteProfile.reserveFundBalance)}\n\nDENETÇİ ONAYI:\nAv. Zeynep Yılmaz (Site Denetçisi) - Kat Mülkiyeti Kanunu Madde 41 Uyarınca Denetlenmiştir.`;

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Mali_Denetim_Raporu_${reportMonth.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header and Download Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Şeffaf Bütçe & Mali Denetim Raporu
          </h2>
          <p className="text-xs text-slate-500">
            Tüm kat maliklerine ve sakinlerine açık, denetçi onaylı anlık gelir-gider ve kasa mutabakatı.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Raporu Yazdır</span>
          </button>

          <button
            onClick={handleDownloadReport}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Resmi Mali Özeti İndir</span>
          </button>
        </div>
      </div>

      {/* Primary Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Bank & Cash Balances */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">
              Site Kasa & Banka Mevcutları
            </span>
            <Building className="w-4 h-4 text-indigo-300" />
          </div>

          <div>
            <div className="text-2xl font-extrabold font-mono tracking-tight text-white">
              {formatCurrency(siteProfile.operatingFundBalance + siteProfile.reserveFundBalance)}
            </div>
            <div className="text-[11px] text-indigo-200 mt-0.5">Toplam Likit Varlıklar</div>
          </div>

          <div className="pt-3 border-t border-indigo-700/60 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-indigo-200">İş Bankası Cari Hesap:</span>
              <span className="font-mono font-bold">{formatCurrency(siteProfile.operatingFundBalance)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-indigo-200">Demirbaş / Yedek Akçe Fonu:</span>
              <span className="font-mono font-bold text-emerald-400">
                {formatCurrency(siteProfile.reserveFundBalance)}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Gelir Durumu */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Aidat ve İşletme Gelirleri
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
              Gelir Kalemi
            </span>
          </div>

          <div>
            <div className="text-2xl font-extrabold font-mono text-emerald-600">
              {formatCurrency(totalDuesCollected)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Bu Ay Tahsil Edilen Net Tutar</div>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Bekleyen Tahakkuk:</span>
              <span className="font-mono font-semibold text-amber-600">
                {formatCurrency(totalDuesPending)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Gecikmiş Alacaklar:</span>
              <span className="font-mono font-semibold text-rose-600">
                {formatCurrency(totalDuesOverdue)}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Gider ve Net Fark */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              İşletme Harcamaları & Net
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
              Gider Kalemi
            </span>
          </div>

          <div>
            <div className="text-2xl font-extrabold font-mono text-slate-900">
              {formatCurrency(totalApprovedExpenses)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Faturalı Onaylı Giderler</div>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Dönem Net Durumu:</span>
              <span
                className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                  netMonthlySurplus >= 0
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-rose-50 text-rose-700'
                }`}
              >
                {netMonthlySurplus >= 0 ? '+' : ''}
                {formatCurrency(netMonthlySurplus)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Bütçe Uyum Oranı:</span>
              <span className="text-emerald-700 font-semibold">%97.8 Planlanan Bütçede</span>
            </div>
          </div>
        </div>
      </div>

      {/* Official Income-Expense Statement Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Gelir-Gider Tablosu ve Bütçe Gerçekleşme Analizi
            </h3>
            <p className="text-xs text-slate-500">
              Kat Mülkiyeti Kanunu Madde 20 & 41 gereğince hazırlanmış resmi mali hesap tablosudur.
            </p>
          </div>

          <div className="text-xs text-slate-500">
            Dönem: <strong className="text-slate-800 font-semibold">{reportMonth}</strong>
          </div>
        </div>

        {/* Detailed Breakdown Rows */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Left Column: GELİRLER */}
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-emerald-50 text-emerald-950 p-2.5 rounded-xl text-xs font-bold">
              <span>GELİR KALEMLERİ</span>
              <span>TUTAR (₺)</span>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span>Mart 2025 Normal İşletme Aidatları (36 Daire)</span>
                <span className="font-mono font-bold">66.600 ₺</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span>Tahsil Edilen Kanuni Gecikme Zammı (%5)</span>
                <span className="font-mono font-bold">370 ₺</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span>Sosyal Tesis & Kapalı Otopark Giriş Kartı Gelirleri</span>
                <span className="font-mono font-bold">1.200 ₺</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span>Vadeli Mevduat & Fon Nemalanma Gelirleri</span>
                <span className="font-mono font-bold">3.450 ₺</span>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl flex justify-between font-bold text-xs text-slate-900 border border-slate-200">
              <span>TOPLAM TAHAKKUK GELİRİ:</span>
              <span className="font-mono text-emerald-700">71.620 ₺</span>
            </div>
          </div>

          {/* Right Column: GİDERLER */}
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-indigo-50 text-indigo-950 p-2.5 rounded-xl text-xs font-bold">
              <span>GİDER KALEMLERİ</span>
              <span>TUTAR (₺)</span>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span>Site Personeli Aylık Maaş, Yol & SGK Tahakkukları</span>
                <span className="font-mono font-bold">34.200 ₺</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span>BEDAŞ Ortak Alan Elektrik ve Enerji Gideri</span>
                <span className="font-mono font-bold">11.450 ₺</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span>Otis Asansör 6 Adet Kabin Aylık Bakım & Yağlama</span>
                <span className="font-mono font-bold">6.800 ₺</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span>Yeşil Vadi Peyzaj, Budama ve Bahar Gübreleme</span>
                <span className="font-mono font-bold">4.500 ₺</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span>Hijyen Malzemeleri & Ortak Alan Temizlik Sarfiyatı</span>
                <span className="font-mono font-bold">3.100 ₺</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span>Kale Güvenlik 32 Adet Kamera Bulut Depolama</span>
                <span className="font-mono font-bold">2.400 ₺</span>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl flex justify-between font-bold text-xs text-slate-900 border border-slate-200">
              <span>TOPLAM ONAYLI GİDER:</span>
              <span className="font-mono text-indigo-700">62.450 ₺</span>
            </div>
          </div>
        </div>

        {/* Auditor's Formal Sign-off Card */}
        <div className="mt-6 pt-4 border-t border-slate-200 bg-slate-50/70 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <BadgeCheck className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                <span>Denetçi İnceleme ve Tasdik Şerhi</span>
                <span className="text-emerald-700 font-normal">• Resmi Onaylı</span>
              </div>
              <p className="text-[11px] text-slate-600">
                "Mart 2025 dönemi tüm banka ekstreleri, faturalar ve tahsilat makbuzları tarafımca incelenmiş olup KMK Madde 41 uyarınca mevzuata uygun bulunmuştur."
              </p>
              <div className="text-[10px] text-slate-500 font-semibold pt-0.5">
                {siteProfile.auditorName} • İstanbul Barosu Sicil No: 48920
              </div>
            </div>
          </div>

          <div className="shrink-0 bg-white border border-slate-200 px-3 py-2 rounded-lg text-center">
            <span className="text-[10px] text-slate-400 block uppercase font-mono">Dijital Mühür No</span>
            <span className="font-mono text-xs font-bold text-indigo-700">DNT-2025-03-91</span>
          </div>
        </div>
      </div>
    </div>
  );
};
