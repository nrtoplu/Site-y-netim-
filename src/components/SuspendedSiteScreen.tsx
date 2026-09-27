import React from 'react';
import {
  AlertOctagon,
  Lock,
  PhoneCall,
  Mail,
  ShieldAlert,
  CreditCard,
  Building,
  ArrowRight,
  RefreshCw,
  FileText,
} from 'lucide-react';
import { TenantSite } from '../types';
import { formatCurrency } from '../utils/formatters';

interface SuspendedSiteScreenProps {
  site: TenantSite;
  onOpenSuperAdmin: () => void;
  onUnsuspendSite: (siteId: string) => void;
}

export const SuspendedSiteScreen: React.FC<SuspendedSiteScreenProps> = ({
  site,
  onOpenSuperAdmin,
  onUnsuspendSite,
}) => {
  const pendingInvoices = site.saasInvoices.filter(
    (inv) => inv.status === 'overdue' || inv.status === 'pending'
  );
  const totalUnpaid = pendingInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-3xl border-2 border-rose-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Banner */}
        <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-slate-900 text-white p-6 sm:p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 translate-x-8 -translate-y-8 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="w-16 h-16 rounded-2xl bg-rose-600/30 border border-rose-400/40 text-rose-300 flex items-center justify-center mx-auto mb-4 backdrop-blur-md shadow-lg">
            <Lock className="w-8 h-8 text-rose-200" />
          </div>

          <span className="inline-block px-3 py-1 bg-rose-500/20 border border-rose-400/30 text-rose-200 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            ApsisCloud • Lisans Kısıtlaması
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Sistem Program Erişimi Dondurulmuştur
          </h1>
          <p className="mt-2 text-rose-200 text-xs sm:text-sm max-w-lg mx-auto">
            <strong className="text-white">{site.profile.siteName}</strong> yönetim ve sakin panelleri, yıllık SaaS lisans yenileme bedeli ödenmediği için geçici olarak askıya alınmıştır.
          </p>
        </div>

        {/* Content Details */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2">
            <div className="flex items-center space-x-2 text-rose-900 font-bold text-sm">
              <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Dondurulma Gerekçesi</span>
            </div>
            <p className="text-xs text-rose-800 leading-relaxed">
              {site.license.suspensionReason ||
                'Yıllık ApsisCloud yazılım kullanım lisans bedeli süresinde tahsil edilemediği için 634 Sayılı Kat Mülkiyeti Kanunu ve KVKK veri güvenliği protokolü gereğince dondurulmuştur.'}
            </p>
          </div>

          {/* Site & Invoice Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Etkilenen Site
              </span>
              <div className="font-bold text-slate-800 text-sm flex items-center space-x-1.5">
                <Building className="w-4 h-4 text-indigo-600" />
                <span>{site.profile.siteName}</span>
              </div>
              <p className="text-xs text-slate-500">{site.profile.city} • {site.profile.totalFlats} Daire</p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Bekleyen SaaS Lisans Faturası
              </span>
              <div className="font-extrabold text-rose-600 text-base font-mono">
                {totalUnpaid > 0 ? formatCurrency(totalUnpaid) : formatCurrency(site.license.yearlyPrice)}
              </div>
              <p className="text-[11px] text-slate-500">
                Lisans Planı: {site.license.planName}
              </p>
            </div>
          </div>

          {/* Information Notice */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-3 text-xs text-amber-900">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold">Verileriniz Güvendedir:</strong>
              <span>
                Site aidat listesi, gelir-gider makbuzları ve resmi karar defterleri Tier-4 bulut kasasında şifreli olarak saklanmaktadır. Lisans faturası ödendiğinde tüm sistem anında kaldığı yerden kesintisiz aktif olacaktır.
              </span>
            </div>
          </div>

          {/* Contact and Actions */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-600 space-y-1 text-center sm:text-left">
              <span className="font-bold block text-slate-800">ApsisCloud Lisans Destek Hattı:</span>
              <div className="flex items-center justify-center sm:justify-start space-x-3 text-slate-500">
                <span className="flex items-center space-x-1">
                  <PhoneCall className="w-3.5 h-3.5 text-indigo-600" />
                  <span>0850 441 90 00</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Mail className="w-3.5 h-3.5 text-indigo-600" />
                  <span>lisans@apsiscloud.com</span>
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button
                onClick={() => onUnsuspendSite(site.id)}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center space-x-1.5"
                title="Süper admin yetkisiyle dondurmayı kaldır ve siteyi aktif et"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Programı Aktif Et</span>
              </button>

              <button
                onClick={onOpenSuperAdmin}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center space-x-1.5"
              >
                <span>Süper Admin Paneli</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
