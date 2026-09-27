import React from 'react';
import {
  CreditCard,
  Receipt,
  Wrench,
  MessageSquare,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  Calendar,
  DollarSign,
  Send,
  Download,
  FolderArchive,
  Sliders,
} from 'lucide-react';
import {
  SiteProfile,
  DuesRecord,
  ExpenseRecord,
  MaintenanceTicket,
  CommunityPost,
  ApartmentUnit,
} from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface OverviewTabProps {
  siteProfile: SiteProfile;
  isResident: boolean;
  residentName?: string;
  residentUnitId?: string;
  residentUnitDisplay?: string;
  dues: DuesRecord[];
  expenses: ExpenseRecord[];
  tickets: MaintenanceTicket[];
  posts: CommunityPost[];
  units: ApartmentUnit[];
  onNavigateTab: (tab: any) => void;
  onPayDue: (due: DuesRecord) => void;
  onOpenNewTicket: () => void;
  onOpenNewExpense: () => void;
  onOpenNewPost: () => void;
  onOpenResidentPermissionsModal?: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  siteProfile,
  isResident,
  residentName,
  residentUnitId,
  residentUnitDisplay = 'B Blok No:14',
  dues,
  expenses,
  tickets,
  posts,
  units,
  onNavigateTab,
  onPayDue,
  onOpenNewTicket,
  onOpenNewExpense,
  onOpenNewPost,
  onOpenResidentPermissionsModal,
}) => {
  const targetUnitId = residentUnitId || (isResident ? 'unit-b14' : undefined);
  const targetResidentName = residentName || (isResident ? 'Ali Yılmaz' : undefined);

  // Calculations
  const currentMonthDues = dues.filter((d) => d.month === 'Mart 2025');
  const paidDues = currentMonthDues.filter((d) => d.status === 'paid');
  const totalDueExpected = currentMonthDues.reduce((acc, d) => acc + d.amount, 0) || 1;
  const totalDueCollected = paidDues.reduce((acc, d) => acc + d.amount, 0);
  const collectionRate = Math.round((totalDueCollected / totalDueExpected) * 100);

  const totalExpensesMonth = expenses.reduce((acc, e) => acc + e.amount, 0);
  const activeTickets = tickets.filter((t) => t.status !== 'completed');

  // Resident isolated dues and tickets
  const residentDues = dues.filter((d) => {
    if (targetUnitId && d.unitId === targetUnitId) return true;
    if (targetResidentName && d.residentName.toLowerCase().includes(targetResidentName.toLowerCase())) return true;
    return false;
  });
  const pendingResidentDue = residentDues.find((d) => d.status === 'pending' || d.status === 'overdue');
  const lastPaidResidentDue = residentDues.find((d) => d.status === 'paid');
  const residentTickets = tickets.filter((t) => {
    if (targetUnitId && t.unitId === targetUnitId) return true;
    if (t.unitDisplay === residentUnitDisplay) return true;
    return false;
  });

  return (
    <div className="space-y-6">
      {/* Resident Welcome & Urgent Action Alert (When Resident Mode is Active) */}
      {isResident && (
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-indigo-700/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-indigo-200 border border-white/10">
              Sakin Portalı • {residentUnitDisplay}
            </span>
            <h2 className="text-xl font-bold">Hoş Geldiniz, {targetResidentName}</h2>
            <p className="text-xs text-indigo-200">
              {pendingResidentDue
                ? `Mart 2025 aidatınız beklemektedir. Güvenli 3D Secure kredi kartı veya havale ile 1 dakikada ödeyebilirsiniz.`
                : 'Tüm aidat borçlarınız ödenmiştir. Sistemde gecikmiş bir borcunuz bulunmamaktadır.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {pendingResidentDue ? (
              <button
                onClick={() => onPayDue(pendingResidentDue)}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-95 flex items-center space-x-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>Mart Aidatını Hemen Öde ({formatCurrency(pendingResidentDue.amount)})</span>
              </button>
            ) : (
              <div className="px-4 py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-semibold flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Aidat Borcunuz Yoktur</span>
              </div>
            )}

            <button
              onClick={onOpenNewTicket}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/20 transition-colors flex items-center space-x-1.5"
            >
              <Wrench className="w-3.5 h-3.5 text-amber-300" />
              <span>Arıza Bildirimi Aç</span>
            </button>
          </div>
        </div>
      )}

      {/* Manager Header & Action Bar */}
      {!isResident && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">
                {siteProfile.siteName} • Yönetim Kontrol Masası
              </h2>
              <p className="text-xs text-slate-500">
                {siteProfile.city} • {siteProfile.totalFlats} Daire • {siteProfile.totalBlocks} Blok
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenResidentPermissionsModal && (
              <button
                onClick={onOpenResidentPermissionsModal}
                className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-950 border border-indigo-200 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shadow-2xs"
                title="Sakinlerin mobil ve webde hangi menüleri göreceğini ayarlayın"
              >
                <Sliders className="w-3.5 h-3.5 text-indigo-700" />
                <span>Sakin Menü İzinleri (Aktif / Pasif)</span>
              </button>
            )}

            <button
              onClick={onOpenNewExpense}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
            >
              <Receipt className="w-3.5 h-3.5 text-amber-400" />
              <span>+ Gider Ekle</span>
            </button>

            <button
              onClick={onOpenNewPost}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>+ Duyuru Yayınla</span>
            </button>
          </div>
        </div>
      )}

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Kasa & Banka (Varlık Güvencesi) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-indigo-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>{isResident ? 'Site Varlıkları & Fonlar' : 'Toplam Banka & Kasa'}</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {formatCurrency(siteProfile.operatingFundBalance + siteProfile.reserveFundBalance)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>Cari: {formatCurrency(siteProfile.operatingFundBalance)}</span>
            <span className="text-emerald-700 font-medium">Banka Güvencesinde</span>
          </div>
        </div>

        {/* Metric 2: Aidat Durumu (Kişiye Özel / Yönetici Genel) */}
        {isResident ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-indigo-300 transition-colors">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
              <span>Dairemin Güncel Borcu</span>
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  pendingResidentDue
                    ? 'bg-amber-50 text-amber-600'
                    : 'bg-emerald-50 text-emerald-600'
                }`}
              >
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div
              className={`text-2xl font-extrabold font-mono ${
                pendingResidentDue ? 'text-amber-600' : 'text-emerald-600'
              }`}
            >
              {pendingResidentDue ? formatCurrency(pendingResidentDue.amount) : '0,00 ₺'}
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">
                {pendingResidentDue ? 'Vadesi Bekleyen Aidat' : 'Gecikmiş borç yok'}
              </span>
              <button
                onClick={() => onNavigateTab('dues')}
                className="text-indigo-600 font-semibold hover:underline"
              >
                Detay & Dekont &rarr;
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-indigo-300 transition-colors">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
              <span>Mart 2025 Tahsilat</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-extrabold text-indigo-700 font-mono">
                %{collectionRate}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                ({paidDues.length} / {currentMonthDues.length} Daire)
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, collectionRate)}%` }}
              />
            </div>
          </div>
        )}

        {/* Metric 3: Aylık Harcamalar (Genel Şeffaflık) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-indigo-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>{isResident ? 'Onaylı Site Giderleri' : 'Mart Ayı Giderleri'}</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {formatCurrency(totalExpensesMonth)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Faturalı & Arşivli</span>
            <button
              onClick={() => onNavigateTab('budget')}
              className="text-indigo-600 font-medium hover:underline"
            >
              Şeffaf Bütçe &rarr;
            </button>
          </div>
        </div>

        {/* Metric 4: Arıza Talepleri */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-indigo-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>{isResident ? 'Dairemizin Arıza Kayıtları' : 'Açık Arıza / Bakım'}</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-600 font-mono">
            {isResident ? `${residentTickets.length} Kayıt` : `${activeTickets.length} Talep`}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>{isResident ? 'Teknik Takipte' : '1 Acil Müdahale'}</span>
            <button
              onClick={() => onNavigateTab('maintenance')}
              className="text-indigo-600 font-semibold hover:underline"
            >
              {isResident ? 'Taleplerim' : 'Listeyi Gör'} &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Quick Action Hub - Strictly isolated based on role */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 px-1 flex items-center justify-between">
          <span>{isResident ? 'Sakin Hızlı İşlem Masası' : 'Hızlı Yönetim ve Sakin İşlemleri'}</span>
          {isResident && (
            <span className="text-[10px] text-slate-400 font-normal">Kısıtlı Yetkili Portalı</span>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
          <button
            onClick={() => onNavigateTab('dues')}
            className="p-3 bg-white hover:bg-indigo-50/60 border border-slate-200 rounded-xl text-left font-semibold text-slate-800 transition-colors flex flex-col justify-between"
          >
            <CreditCard className="w-4 h-4 text-indigo-600 mb-2" />
            <span>{isResident ? 'Aidatlarım & Online Öde' : 'Aidat Listesi & Ödeme'}</span>
          </button>

          {!isResident && (
            <button
              onClick={onOpenNewExpense}
              className="p-3 bg-white hover:bg-indigo-50/60 border border-slate-200 rounded-xl text-left font-semibold text-slate-800 transition-colors flex flex-col justify-between"
            >
              <Receipt className="w-4 h-4 text-emerald-600 mb-2" />
              <span>+ Yeni Gider Faturası</span>
            </button>
          )}

          <button
            onClick={onOpenNewTicket}
            className="p-3 bg-white hover:bg-indigo-50/60 border border-slate-200 rounded-xl text-left font-semibold text-slate-800 transition-colors flex flex-col justify-between"
          >
            <Wrench className="w-4 h-4 text-amber-600 mb-2" />
            <span>+ Arıza Bildirimi Aç</span>
          </button>

          <button
            onClick={() => onNavigateTab('community')}
            className="p-3 bg-white hover:bg-indigo-50/60 border border-slate-200 rounded-xl text-left font-semibold text-slate-800 transition-colors flex flex-col justify-between"
          >
            <MessageSquare className="w-4 h-4 text-purple-600 mb-2" />
            <span>{isResident ? 'Komşu Panosu & İlanlar' : '+ Duyuru / Anket Yayınla'}</span>
          </button>

          <button
            onClick={() => onNavigateTab('budget')}
            className="p-3 bg-white hover:bg-indigo-50/60 border border-slate-200 rounded-xl text-left font-semibold text-slate-800 transition-colors flex flex-col justify-between"
          >
            <TrendingUp className="w-4 h-4 text-sky-600 mb-2" />
            <span>Şeffaf Bütçe Raporu</span>
          </button>

          <button
            onClick={() => onNavigateTab('archive')}
            className="p-3 bg-white hover:bg-indigo-50/60 border border-slate-200 rounded-xl text-left font-semibold text-slate-800 transition-colors flex flex-col justify-between"
          >
            <FolderArchive className="w-4 h-4 text-indigo-700 mb-2" />
            <span>Karar Defteri & Arşiv</span>
          </button>

          {isResident && (
            <button
              onClick={() => onNavigateTab('notifications')}
              className="p-3 bg-white hover:bg-indigo-50/60 border border-slate-200 rounded-xl text-left font-semibold text-slate-800 transition-colors flex flex-col justify-between"
            >
              <Building2 className="w-4 h-4 text-teal-600 mb-2" />
              <span>Daire Bildirimlerim</span>
            </button>
          )}
        </div>
      </div>

      {/* Two-Column Grid: Cashflow Chart & Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Monthly Cashflow Breakdown */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Aylık Nakit Akışı & Gelir-Gider Dengesi</h3>
              <p className="text-xs text-slate-500">2025 Yılı İlk Çeyrek Bütçe Gerçekleşmesi</p>
            </div>
            <div className="flex items-center space-x-3 text-xs font-semibold">
              <span className="flex items-center space-x-1">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                <span className="text-slate-700">Gelir (Aidat & Avans)</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-3 h-3 rounded-full bg-indigo-500 inline-block" />
                <span className="text-slate-700">Gider (İşletme & Bakım)</span>
              </span>
            </div>
          </div>

          {/* SVG Cash Flow Bar Chart */}
          <div className="pt-2">
            <div className="h-56 w-full flex items-end justify-between gap-4 px-2 sm:px-6">
              {[
                { month: 'Ocak 2025', inc: 66600, exp: 58200 },
                { month: 'Şubat 2025', inc: 66600, exp: 61400 },
                { month: 'Mart 2025', inc: 64750, exp: 68250 },
                { month: 'Nisan (Tahmini)', inc: 66600, exp: 59000 },
              ].map((item, idx) => {
                const maxVal = 75000;
                const incHeight = (item.inc / maxVal) * 100;
                const expHeight = (item.exp / maxVal) * 100;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center group">
                    <div className="w-full flex items-end justify-center gap-1.5 sm:gap-3 h-44">
                      {/* Income Bar */}
                      <div
                        style={{ height: `${incHeight}%` }}
                        className="w-5 sm:w-10 bg-emerald-500 rounded-t-lg transition-all group-hover:bg-emerald-600 relative flex justify-center"
                      >
                        <span className="opacity-0 group-hover:opacity-100 absolute -top-7 bg-slate-900 text-white text-[10px] font-mono py-0.5 px-1.5 rounded transition-opacity whitespace-nowrap z-10">
                          {formatCurrency(item.inc)}
                        </span>
                      </div>

                      {/* Expense Bar */}
                      <div
                        style={{ height: `${expHeight}%` }}
                        className="w-5 sm:w-10 bg-indigo-500 rounded-t-lg transition-all group-hover:bg-indigo-600 relative flex justify-center"
                      >
                        <span className="opacity-0 group-hover:opacity-100 absolute -top-7 bg-slate-900 text-white text-[10px] font-mono py-0.5 px-1.5 rounded transition-opacity whitespace-nowrap z-10">
                          {formatCurrency(item.exp)}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-slate-600 mt-2 font-medium text-center">
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600 flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Veriler banka API entegrasyonu ve onaylı faturalarla anlık mutabıktır.</span>
            </span>
            <button
              onClick={() => onNavigateTab('budget')}
              className="text-indigo-600 font-semibold hover:underline"
            >
              Detaylı Denetim Raporu &rarr;
            </button>
          </div>
        </div>

        {/* Right 1 Col: Latest Announcements & Tickets Feed */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">Site Panosu & Son Gelişmeler</h3>
            <button
              onClick={() => onNavigateTab('community')}
              className="text-xs text-indigo-600 font-semibold hover:underline"
            >
              Tümü
            </button>
          </div>

          <div className="space-y-3">
            {posts.slice(0, 3).map((post) => (
              <div
                key={post.id}
                onClick={() => onNavigateTab('community')}
                className="p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-slate-50 transition-all cursor-pointer space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      post.type === 'announcement'
                        ? 'bg-indigo-50 text-indigo-700'
                        : post.type === 'poll'
                        ? 'bg-purple-50 text-purple-700'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {post.type === 'announcement' ? 'Duyuru' : post.type === 'poll' ? 'Anket' : 'İlan'}
                  </span>
                  <span className="text-[10px] text-slate-400">{formatDate(post.date)}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{post.title}</h4>
                <p className="text-[11px] text-slate-500 line-clamp-2">{post.content}</p>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={onOpenNewPost}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
            >
              + Komşulara Mesaj / İlan Paylaş
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
