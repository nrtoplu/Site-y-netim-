import React, { useState } from 'react';
import {
  Search,
  ShieldCheck,
  UserCheck,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  Building,
  DollarSign,
  Plus,
  ArrowRightLeft,
  Calendar,
  Lock,
  FileText,
  BadgeCheck,
  XCircle,
} from 'lucide-react';
import {
  TenantSite,
  SiteAuditor,
  AuditInspectionReport,
  ManagementHandoverRecord,
} from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface AuditTabProps {
  currentSite: TenantSite;
  isAuditor: boolean;
  isManager: boolean;
  onOpenAssignAuditorModal: () => void;
  onOpenHandoverModal: () => void;
  onSubmitAuditReport: (report: AuditInspectionReport) => void;
}

export const AuditTab: React.FC<AuditTabProps> = ({
  currentSite,
  isAuditor,
  isManager,
  onOpenAssignAuditorModal,
  onOpenHandoverModal,
  onSubmitAuditReport,
}) => {
  const [showNewReportModal, setShowNewReportModal] = useState(false);
  const [reportPeriod, setReportPeriod] = useState('2026 Yılı 1. Dönem Denetim Raporu');
  const [financialEvaluation, setFinancialEvaluation] = useState<'approved' | 'approved_with_notes' | 'rejected'>('approved');
  const [findingsSummary, setFindingsSummary] = useState(
    'Banka hesap ekstreleri ile işletme defteri karşılaştırılmış; aidat tahsilatlarının banka hesabına eksiksiz yattığı, harcamaların tamamının faturalı olduğu tespit edilmiştir.'
  );
  const [recommendations, setRecommendations] = useState(
    'Demirbaş fonu birikimlerinin yüksek faizli vadeli hesapta değerlendirilmeye devam edilmesi ve gecikmiş aidatlar için icra takibine başlanması tavsiye olunur.'
  );
  const [discrepancies, setDiscrepancies] = useState('0');

  const auditors: SiteAuditor[] = currentSite.auditors || [
    {
      id: 'aud-1',
      siteId: currentSite.id,
      fullName: currentSite.profile.auditorName || 'Av. Selin Aktaş',
      email: 'denetci@zumrutsitesi.com',
      phone: '0535 222 33 44',
      appointedDate: '2025-06-01',
      appointedBy: currentSite.profile.managementBoard[0] || 'Kemal Ersoy',
      status: 'active',
      notes: 'Kat Maliki Asil Denetçisi • Kat Mülkiyeti Kanunu Denetim Kurulu Üyesi',
    },
  ];

  const auditReports: AuditInspectionReport[] = currentSite.auditReports || [
    {
      id: 'rep-1',
      siteId: currentSite.id,
      auditorName: currentSite.profile.auditorName || 'Av. Selin Aktaş',
      auditorEmail: 'denetci@zumrutsitesi.com',
      inspectionPeriod: '2025 Yılı Yıllık Genel Denetim Raporu',
      reportDate: '2025-12-28',
      financialEvaluation: 'approved',
      findingsSummary:
        'Yönetim kurulu dönemi boyunca 720.000 ₺ aidat tahakkuk ettirilmiş, %94.2 tahsilat başarısı sağlanmıştır. Tüm giderler faturalı ve karar defterine uygundur.',
      totalIncomeInspected: 720000,
      totalExpenseInspected: 614000,
      discrepanciesAmount: 0,
      recommendations: 'Gecikme faizlerinin düzenli işletilmesi ve asansör revizyon fonunun artırılması önerilir.',
      decisionHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    },
  ];

  const handovers: ManagementHandoverRecord[] = currentSite.handoverHistory || [];

  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();
    const newReport: AuditInspectionReport = {
      id: `rep-${Date.now()}`,
      siteId: currentSite.id,
      auditorName: isAuditor ? 'Av. Selin Aktaş' : currentSite.profile.auditorName,
      auditorEmail: 'denetci@zumrutsitesi.com',
      inspectionPeriod: reportPeriod,
      reportDate: new Date().toISOString().split('T')[0],
      financialEvaluation,
      findingsSummary,
      totalIncomeInspected: currentSite.dues.filter((d) => d.status === 'paid').reduce((s, d) => s + d.amount, 0),
      totalExpenseInspected: currentSite.expenses.reduce((s, e) => s + e.amount, 0),
      discrepanciesAmount: Number(discrepancies) || 0,
      recommendations,
      decisionHash: `sha256-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    };

    onSubmitAuditReport(newReport);
    setShowNewReportModal(false);
  };

  const totalPaidDues = currentSite.dues
    .filter((d) => d.status === 'paid')
    .reduce((sum, d) => sum + d.amount, 0);
  const totalExpenses = currentSite.expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Denetim Masası & Şeffaflık Kurulu
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">
              634 Sayılı KMK Madde 41
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Yönetim hesaplarının bağımsız denetçiler tarafından incelenmesi, ibra değerlendirmeleri ve yönetim devir teslim kayıtları.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Action buttons */}
          <button
            onClick={onOpenAssignAuditorModal}
            className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Denetçi Ata & Yetkilendir</span>
          </button>

          <button
            onClick={onOpenHandoverModal}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Yönetici Devir Teslimi</span>
          </button>
        </div>
      </div>

      {/* Audit KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-slate-500 text-xs font-medium block">Denetlenen Gelir / Tahsilat</span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1 font-mono">
            {formatCurrency(totalPaidDues)}
          </div>
          <span className="text-[10px] text-slate-400">Resmi banka & POS kayıtları</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-slate-500 text-xs font-medium block">Denetlenen Toplam Gider</span>
          <div className="text-2xl font-extrabold text-rose-600 mt-1 font-mono">
            {formatCurrency(totalExpenses)}
          </div>
          <span className="text-[10px] text-slate-400">{currentSite.expenses.length} adet fatura & makbuz</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-slate-500 text-xs font-medium block">Mevcut Kasa & Fon Varlığı</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">
            {formatCurrency(currentSite.profile.operatingFundBalance + currentSite.profile.reserveFundBalance)}
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold">Mutabakat Tamamlandı ✓</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-slate-500 text-xs font-medium block">Kayıtlı Denetçi Sayısı</span>
          <div className="text-2xl font-extrabold text-purple-700 mt-1 font-mono">
            {auditors.length} <span className="text-xs font-sans text-slate-400 font-normal">Yetkili</span>
          </div>
          <span className="text-[10px] text-purple-700 font-semibold">2FA Korumalı Giriş</span>
        </div>
      </div>

      {/* Section 1: Active Appointed Auditors */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-sm text-slate-900">
              Yetkili Denetim Kurulu Üyeleri & İnceleme Yetkilileri
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Yönetici tarafından atanmış bağımsız denetçiler
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {auditors.map((aud) => (
            <div
              key={aud.id}
              className="p-4 rounded-2xl border border-purple-200 bg-purple-50/20 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-xs">
                    {aud.fullName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{aud.fullName}</h4>
                    <span className="text-[10px] text-purple-700 font-mono font-semibold">
                      {aud.email}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Aktif Denetçi
                </span>
              </div>

              <p className="text-[11px] text-slate-600">{aud.notes}</p>

              <div className="pt-2 border-t border-purple-100 flex items-center justify-between text-[10px] text-slate-500">
                <span>Atayan: <strong>{aud.appointedBy}</strong></span>
                <span>Atanma Tarihi: {formatDate(aud.appointedDate)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Official Audit Reports & Evaluations */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
          <div className="flex items-center space-x-2">
            <FileCheck2 className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-sm text-slate-900">
              Resmi Denetim Raporları & Yönetim İbra Kayıtları
            </h3>
          </div>

          <button
            onClick={() => setShowNewReportModal(true)}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Yeni Denetim Raporu Yaz & Mühürle</span>
          </button>
        </div>

        <div className="space-y-3">
          {auditReports.map((rep) => (
            <div
              key={rep.id}
              className="p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all bg-white space-y-2.5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-sm text-slate-900">
                    {rep.inspectionPeriod}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      rep.financialEvaluation === 'approved'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : rep.financialEvaluation === 'approved_with_notes'
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-rose-100 text-rose-800 border-rose-300'
                    }`}
                  >
                    {rep.financialEvaluation === 'approved'
                      ? '✓ İbra Edildi (Kusursuz)'
                      : rep.financialEvaluation === 'approved_with_notes'
                      ? '⚠️ Şerhli İbra (Düzeltme İstendi)'
                      : '✕ İbra Edilmedi (Hata Tespit Edildi)'}
                  </span>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center space-x-2">
                  <span>Denetçi: <strong>{rep.auditorName}</strong></span>
                  <span>•</span>
                  <span>{formatDate(rep.reportDate)}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 space-y-1 border border-slate-100">
                <span className="font-semibold block text-slate-900">Tespit ve İnceleme Özeti:</span>
                <p>{rep.findingsSummary}</p>
                {rep.recommendations && (
                  <p className="text-slate-500 italic pt-1">
                    <strong>Tavsiyeler:</strong> {rep.recommendations}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400 font-mono pt-1">
                <span>Denetlenen Gelir: {formatCurrency(rep.totalIncomeInspected)} • Gider: {formatCurrency(rep.totalExpenseInspected)}</span>
                <span className="truncate max-w-xs">SHA-256 Dijital Mühür: {rep.decisionHash}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Management Succession History (Yönetici Devir Teslim Kayıtları) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center space-x-2">
            <ArrowRightLeft className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-sm text-slate-900">
              Yönetici Devir Teslim Geçmişi & Noter Tutanağı Arşivi
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Karar Defteri ve Noter Devirleri
          </span>
        </div>

        {handovers.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700">Henüz Yönetici Devir Teslimi Yapılmadı</p>
            <p>
              Mevcut Yönetim Kurulu Başkanı: <strong>{currentSite.profile.managementBoard[0]}</strong>. Görevi başka bir malike veya profesyonel yöneticiye devretmek için yukarıdaki "Yönetici Devir Teslimi" butonunu kullanabilirsiniz.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {handovers.map((h) => (
              <div
                key={h.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BadgeCheck className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-slate-900">
                      Karar No: {h.decisionNumber}
                    </span>
                    <span className="text-[10px] text-slate-400">({formatDate(h.handoverDate)})</span>
                  </div>
                  <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
                    Noter Onaylı Devir
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">Devreden Eski Yönetici:</span>
                    <strong>{h.previousManagerName}</strong> ({h.previousManagerEmail})
                  </div>
                  <div>
                    <span className="text-slate-400 block">Görevi Alan Yeni Yönetici:</span>
                    <strong className="text-indigo-900">{h.newManagerName}</strong> ({h.newManagerEmail})
                  </div>
                </div>

                <p className="text-slate-600 text-[11px] bg-white p-2 rounded-lg border border-slate-200">
                  {h.notes}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Audit Report Modal */}
      {showNewReportModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-sm p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileCheck2 className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-sm">Resmi Denetim Raporu Hazırla & Mühürle</h3>
              </div>
              <button
                onClick={() => setShowNewReportModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateReport} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Denetim Dönemi Başlığı *
                </label>
                <input
                  type="text"
                  required
                  value={reportPeriod}
                  onChange={(e) => setReportPeriod(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Yönetim Kurulu Mali İbra Kararı *
                </label>
                <select
                  value={financialEvaluation}
                  onChange={(e) => setFinancialEvaluation(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  <option value="approved">✓ İbra Edildi (Tüm hesaplar mutabık ve noksansız)</option>
                  <option value="approved_with_notes">⚠️ Şerhli İbra (Eksikler giderilmek şartıyla kabul)</option>
                  <option value="rejected">✕ İbra Edilmedi (Mali açık veya usulsüzlük tespit edildi)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Denetim Raporu Bulguları & İnceleme Notu *
                </label>
                <textarea
                  rows={3}
                  required
                  value={findingsSummary}
                  onChange={(e) => setFindingsSummary(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kat Malikleri Genel Kuruluna Tavsiyeler
                </label>
                <textarea
                  rows={2}
                  value={recommendations}
                  onChange={(e) => setRecommendations(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs resize-none"
                />
              </div>

              <div className="pt-2 border-t flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowNewReportModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Raporu İmzala & Arşive Mühürle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
