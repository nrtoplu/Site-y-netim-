import React from 'react';
import {
  LayoutDashboard,
  CreditCard,
  Receipt,
  PieChart,
  Wrench,
  MessageSquare,
  FolderArchive,
  Bell,
  Cloud,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  Building,
  Users,
  UserCheck,
  Clock,
  Snowflake,
  Search,
  FileSpreadsheet,
  Briefcase,
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { SiteProfile, SaaSLicense } from '../types';
import { formatCountdownBadge } from '../utils/dateCalculations';

export type ActiveTab =
  | 'overview'
  | 'residents'
  | 'registrations'
  | 'audit'
  | 'bank-import'
  | 'dues'
  | 'expenses'
  | 'budget'
  | 'maintenance'
  | 'marketplace'
  | 'community'
  | 'archive'
  | 'notifications'
  | 'cloud';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  pendingDuesCount: number;
  openTicketsCount: number;
  unreadNotifsCount: number;
  pendingRegistrationsCount?: number;
  unmatchedBankTxCount?: number;
  activeRfqsCount?: number;
  siteProfile: SiteProfile;
  siteLicense?: SaaSLicense;
  isResident: boolean;
  isAuditor?: boolean;
  enabledModules?: string[];
  residentAllowedTabs?: string[];
  onOpenResidentPermissionsModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  pendingDuesCount,
  openTicketsCount,
  unreadNotifsCount,
  pendingRegistrationsCount = 0,
  unmatchedBankTxCount = 0,
  activeRfqsCount = 0,
  siteProfile,
  siteLicense,
  isResident,
  isAuditor = false,
  enabledModules,
  residentAllowedTabs,
  onOpenResidentPermissionsModal,
}) => {
  const countdown = siteLicense
    ? formatCountdownBadge(siteLicense.expiresAt, siteLicense.isSuspended)
    : null;

  const NAV_ITEMS: {
    id: ActiveTab;
    label: string;
    icon: React.ElementType;
    badge?: string | number;
    badgeColor?: string;
    managerOnly?: boolean;
    residentHidden?: boolean;
  }[] = [
    { id: 'overview', label: 'Genel Bakış', icon: LayoutDashboard },
    {
      id: 'residents',
      label: 'Sakinler & Hesap Yönetimi',
      icon: Users,
      managerOnly: true,
    },
    {
      id: 'registrations',
      label: 'İkametgah Onay Masası',
      icon: UserCheck,
      badge: pendingRegistrationsCount > 0 ? pendingRegistrationsCount : undefined,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300 font-bold animate-pulse',
      managerOnly: true,
    },
    {
      id: 'audit',
      label: 'Denetim Masası & İnceleme',
      icon: Search,
      badge: isAuditor ? 'Yetkili' : undefined,
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-300 font-bold',
      residentHidden: true,
    },
    {
      id: 'bank-import',
      label: 'Banka Excel & Havale Eşleme',
      icon: FileSpreadsheet,
      badge: unmatchedBankTxCount > 0 ? `${unmatchedBankTxCount} Seçim Bekliyor` : 'Yeni',
      badgeColor:
        unmatchedBankTxCount > 0
          ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold animate-pulse'
          : 'bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold',
      managerOnly: true,
    },
    {
      id: 'dues',
      label: isResident ? 'Aidatlarım & Online Öde' : 'Aidat Takibi & Tahsilat',
      icon: CreditCard,
      badge: pendingDuesCount > 0 ? pendingDuesCount : undefined,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    },
    {
      id: 'expenses',
      label: 'Gider Yönetimi & Faturalar',
      icon: Receipt,
    },
    {
      id: 'budget',
      label: 'Şeffaf Bütçe & Denetim',
      icon: PieChart,
    },
    {
      id: 'maintenance',
      label: isResident ? 'Arıza Bildir & Takip' : 'Arıza & Bakım Talepleri',
      icon: Wrench,
      badge: openTicketsCount > 0 ? openTicketsCount : undefined,
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    },
    {
      id: 'marketplace',
      label: 'Usta & Firma Teklifleri',
      icon: Briefcase,
      badge: activeRfqsCount > 0 ? `${activeRfqsCount} İhale` : 'Teklif Al',
      badgeColor:
        activeRfqsCount > 0
          ? 'bg-indigo-100 text-indigo-800 border-indigo-300 font-bold'
          : 'bg-slate-100 text-slate-600 border-slate-200 text-[10px]',
      managerOnly: true,
    },
    {
      id: 'community',
      label: 'Sakinler İletişim & Anketler',
      icon: MessageSquare,
    },
    {
      id: 'archive',
      label: 'Dijital Arşiv & Kararlar',
      icon: FolderArchive,
    },
    {
      id: 'notifications',
      label: 'Mobil Bildirimler & SMS',
      icon: Bell,
      badge: unreadNotifsCount > 0 ? unreadNotifsCount : undefined,
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    },
    {
      id: 'cloud',
      label: 'Güvenli Bulut Altyapısı',
      icon: Cloud,
      managerOnly: true,
    },
  ];

  const visibleNavItems = NAV_ITEMS.filter((item) => {
    if (isResident) {
      if (item.managerOnly) return false;
      if (item.residentHidden) return false;
      // Site management resident menu visibility check
      if (residentAllowedTabs && item.id !== 'overview' && !residentAllowedTabs.includes(item.id)) {
        return false;
      }
    }
    // Super Admin module enablement check
    if (enabledModules && item.id !== 'overview' && !enabledModules.includes(item.id)) return false;
    return true;
  });

  return (
    <aside className="w-full lg:w-64 shrink-0 bg-white lg:bg-slate-50/50 border-r border-slate-200 p-4 flex flex-col justify-between">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Yönetim Modülleri</span>
          {countdown && (
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full border ${countdown.badgeClass}`}
            >
              {countdown.text}
            </span>
          )}
        </div>

        <nav className="space-y-1">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-500'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isActive
                        ? 'bg-white/20 text-white border-transparent'
                        : item.badgeColor || 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {!isResident && onOpenResidentPermissionsModal && (
          <div className="pt-3 mt-3 border-t border-slate-200">
            <button
              onClick={onOpenResidentPermissionsModal}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-indigo-50/80 hover:bg-indigo-100 text-indigo-950 border border-indigo-200/80 text-xs font-bold transition-all group cursor-pointer shadow-2xs"
              title="Site sakinlerinin sol menüde hangi programları göreceğini açıp kapatın"
            >
              <div className="flex items-center space-x-2">
                <span className="p-1 rounded-lg bg-indigo-600 text-white">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </span>
                <span className="text-[11px]">Sakin Menü İzinleri</span>
              </div>
              <span className="text-[10px] text-indigo-700 font-semibold group-hover:translate-x-0.5 transition-transform">
                Aç/Kapat &rarr;
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom Information Card: Kasa & Lisans Sayaç Durumu */}
      <div className="mt-6 pt-4 border-t border-slate-200/80 space-y-3">
        {/* SaaS License Counter Box */}
        {countdown && siteLicense && (
          <div
            className={`border rounded-2xl p-3 shadow-xs space-y-1 text-xs ${
              siteLicense.isSuspended
                ? 'bg-rose-50 border-rose-200'
                : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700">ApsisCloud SaaS Lisansı</span>
              <span className="text-[10px] text-indigo-600 font-bold">{siteLicense.planTier}</span>
            </div>
            <div className="flex items-center space-x-1.5 pt-0.5">
              {siteLicense.isSuspended ? (
                <Snowflake className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              ) : (
                <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              )}
              <span className="font-bold text-slate-800 text-[11px]">
                {countdown.text}
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              Bitiş: {siteLicense.expiresAt}
            </div>
          </div>
        )}

        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
            <span>Cari İşletme Kasası</span>
            <span className="font-semibold text-emerald-600">Aktif</span>
          </div>
          <div className="text-base font-extrabold text-slate-900 font-mono">
            {formatCurrency(siteProfile.operatingFundBalance)}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
            <span>Demirbaş Fonu:</span>
            <span className="font-mono font-semibold text-indigo-700">
              {formatCurrency(siteProfile.reserveFundBalance)}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-[11px] text-slate-500 px-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>KVKK ve KMK Uyumlu Bulut Arşivi</span>
        </div>
      </div>
    </aside>
  );
};

