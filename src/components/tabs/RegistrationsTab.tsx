import React, { useState } from 'react';
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  ShieldCheck,
  Search,
  Filter,
  AlertTriangle,
  Building,
  User,
  Plus,
  Send,
  MessageSquare,
} from 'lucide-react';
import { ResidentRegistrationApplication } from '../../types';
import { formatDate } from '../../utils/formatters';

interface RegistrationsTabProps {
  applications: ResidentRegistrationApplication[];
  onApproveApplication: (applicationId: string) => void;
  onRejectApplication: (applicationId: string, reason: string) => void;
  onOpenNewApplicationModal: () => void;
}

export const RegistrationsTab: React.FC<RegistrationsTabProps> = ({
  applications,
  onApproveApplication,
  onRejectApplication,
  onOpenNewApplicationModal,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectingAppId, setRejectingAppId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const pendingCount = applications.filter((a) => a.status === 'pending').length;
  const approvedCount = applications.filter((a) => a.status === 'approved').length;
  const rejectedCount = applications.filter((a) => a.status === 'rejected').length;

  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.unitNo.includes(searchQuery) ||
      app.phone.includes(searchQuery);

    if (!matchesSearch) return false;
    if (filterStatus === 'pending') return app.status === 'pending';
    if (filterStatus === 'approved') return app.status === 'approved';
    if (filterStatus === 'rejected') return app.status === 'rejected';
    return true;
  });

  const handleConfirmReject = (appId: string) => {
    onRejectApplication(appId, rejectionReason || 'Belgeler doğrulanamadı.');
    setRejectingAppId(null);
    setRejectionReason('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              İkametgah & Sakin Onay Masası
            </h2>
            {pendingCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                {pendingCount} Bekleyen Başvuru
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Sisteme kayıt olan sakinlerin dairede ikamet ettiklerine dair ibraz ettikleri tapu ve kira sözleşmelerini doğrulayın.
          </p>
        </div>

        <button
          onClick={onOpenNewApplicationModal}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center space-x-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Sakin Kayıt Başvurusu Yap</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Onay Bekleyenler</span>
            <div className="text-2xl font-extrabold text-amber-600 font-mono mt-1">
              {pendingCount}
            </div>
            <p className="text-[11px] text-slate-400">Yönetim teyidi bekleniyor</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Onaylanmış Sakinler</span>
            <div className="text-2xl font-extrabold text-emerald-600 font-mono mt-1">
              {approvedCount}
            </div>
            <p className="text-[11px] text-slate-400">Daireye erişim izni verildi</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Reddedilen Başvurular</span>
            <div className="text-2xl font-extrabold text-rose-600 font-mono mt-1">
              {rejectedCount}
            </div>
            <p className="text-[11px] text-slate-400">Belgesi eksik veya uyuşmayan</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Başvuran adı, daire no veya telefon ara..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              filterStatus === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tümü ({applications.length})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              filterStatus === 'pending'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Bekleyenler ({pendingCount})
          </button>
          <button
            onClick={() => setFilterStatus('approved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              filterStatus === 'approved'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Onaylananlar ({approvedCount})
          </button>
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-3">
        {filteredApps.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-2">
            <UserCheck className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="font-bold text-sm text-slate-700">Kayıt Başvurusu Bulunamadı</h3>
            <p className="text-xs text-slate-500">
              Bu filtreye uygun sakin başvuru kaydı bulunmuyor.
            </p>
          </div>
        ) : (
          filteredApps.map((app) => (
            <div
              key={app.id}
              className={`bg-white border rounded-2xl p-5 shadow-xs transition-all ${
                app.status === 'pending'
                  ? 'border-amber-300 bg-amber-50/15 ring-1 ring-amber-200'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left: Applicant details */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2.5">
                    <span className="font-extrabold text-slate-900 text-sm">
                      {app.fullName}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        app.residentType === 'owner'
                          ? 'bg-sky-50 text-sky-700 border-sky-200'
                          : 'bg-purple-50 text-purple-700 border-purple-200'
                      }`}
                    >
                      {app.residentType === 'owner' ? 'Kat Maliki' : 'Kiracı'}
                    </span>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        app.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : app.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}
                    >
                      {app.status === 'approved'
                        ? '✓ Onaylandı'
                        : app.status === 'rejected'
                        ? '✕ Reddedildi'
                        : '⏳ Onay Bekliyor'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                    <span className="font-bold text-slate-800">
                      📍 {app.block} Blok Daire {app.unitNo}
                    </span>
                    <span className="font-mono">📞 {app.phone}</span>
                    <span>✉️ {app.email}</span>
                    <span className="text-slate-400">
                      Başvuru Tarihi: {formatDate(app.applicationDate)}
                    </span>
                  </div>

                  {/* Document and Notes */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700 font-mono text-[11px] border border-slate-200">
                      <FileText className="w-3.5 h-3.5 text-indigo-600" />
                      <span>İbraz Edilen Belge: {app.documentName}</span>
                    </div>

                    {app.notes && (
                      <span className="text-[11px] text-slate-500 italic">
                        "{app.notes}"
                      </span>
                    )}
                  </div>

                  {/* Rejection notice if rejected */}
                  {app.status === 'rejected' && app.rejectionReason && (
                    <div className="text-xs text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-200">
                      <strong>Reddedilme Gerekçesi:</strong> {app.rejectionReason}
                    </div>
                  )}
                </div>

                {/* Right: Actions */}
                {app.status === 'pending' && (
                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => onApproveApplication(app.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Daireyi Doğrula & Onayla</span>
                    </button>

                    <button
                      onClick={() => setRejectingAppId(app.id)}
                      className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reddet</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Rejection Prompt Inline */}
              {rejectingAppId === app.id && (
                <div className="mt-4 pt-3 border-t border-rose-200 bg-rose-50/70 p-3 rounded-xl space-y-2">
                  <label className="block text-xs font-bold text-rose-900">
                    Başvuruyu Reddetme Sebebi (Sakine SMS/E-posta ile iletilir):
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Örn: Tapu belgesi ile kimlik bilgisi uyuşmuyor."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-white border border-rose-300 rounded-lg text-xs"
                    />
                    <button
                      onClick={() => handleConfirmReject(app.id)}
                      className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold"
                    >
                      Reddet ve Bildir
                    </button>
                    <button
                      onClick={() => setRejectingAppId(null)}
                      className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
