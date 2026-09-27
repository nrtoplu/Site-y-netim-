import React, { useState } from 'react';
import {
  Building,
  Cloud,
  ShieldCheck,
  Bell,
  User,
  Sliders,
  Sparkles,
  ChevronDown,
  LogOut,
  HelpCircle,
  Eye,
  Type,
  Check,
  Key,
  Plus,
  Snowflake,
  Clock,
  Crown,
  UserCheck,
  Globe,
  Search,
  Lock,
} from 'lucide-react';
import { NotificationItem, SiteProfile, TenantSite, UserRole, AppUser } from '../types';
import { formatCountdownBadge } from '../utils/dateCalculations';

interface NavbarProps {
  sites: TenantSite[];
  currentSite: TenantSite;
  currentUser: AppUser | null;
  onSelectSite: (siteId: string) => void;
  onOpenNewSiteModal: () => void;
  activeRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onLogout: () => void;
  notifications: NotificationItem[];
  onOpenNotificationCenter: () => void;
  onOpenCloudModal: () => void;
  onOpenRegisterModal: () => void;
  onOpenResidentPermissionsModal?: () => void;
  fontSize: 'normal' | 'large' | 'xlarge';
  onFontSizeChange: (size: 'normal' | 'large' | 'xlarge') => void;
  highContrast: boolean;
  onToggleHighContrast: () => void;
  onOpenShortcutGuide: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  sites,
  currentSite,
  currentUser,
  onSelectSite,
  onOpenNewSiteModal,
  activeRole,
  onRoleChange,
  onLogout,
  notifications,
  onOpenNotificationCenter,
  onOpenCloudModal,
  onOpenRegisterModal,
  onOpenResidentPermissionsModal,
  fontSize,
  onFontSizeChange,
  highContrast,
  onToggleHighContrast,
  onOpenShortcutGuide,
}) => {
  const [showSiteDropdown, setShowSiteDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifPreview, setShowNotifPreview] = useState(false);
  const [showAccessibilityMenu, setShowAccessibilityMenu] = useState(false);

  const isSuperAdmin = currentUser?.role === 'superadmin';
  const unreadNotifs = notifications.filter((n) => !n.read);
  const currentCountdown = formatCountdownBadge(
    currentSite.license.expiresAt,
    currentSite.license.isSuspended
  );

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-800 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand and Multi-Tenant Site Switcher (Restricted to Super Admin) */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 shrink-0">
            <Building className="w-5 h-5" />
          </div>

          {/* Site Selector Trigger */}
          <div className="relative">
            {isSuperAdmin ? (
              /* SUPER ADMIN: Can switch between all sites */
              <button
                onClick={() => {
                  setShowSiteDropdown(!showSiteDropdown);
                  setShowUserMenu(false);
                }}
                className="flex items-center space-x-2 text-left p-1.5 rounded-xl hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200"
                title="Süper Admin Yetkisi: Site Değiştir veya Yeni Site Ekle"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 line-clamp-1">
                      {currentSite.profile.siteName}
                    </span>
                    <span
                      className={`hidden sm:inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] border ${currentCountdown.badgeClass}`}
                    >
                      {currentSite.license.isSuspended ? (
                        <Snowflake className="w-3 h-3 animate-spin duration-3000" />
                      ) : (
                        <Clock className="w-3 h-3" />
                      )}
                      <span>{currentCountdown.text}</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 hidden sm:flex items-center space-x-1">
                    <span>{currentSite.profile.city}</span>
                    <span>•</span>
                    <span>{currentSite.profile.totalFlats} Daire</span>
                    <span>•</span>
                    <span className="text-indigo-600 font-semibold">Tüm Siteleri Yönet ▼</span>
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
              </button>
            ) : (
              /* REGULAR USERS (Manager, Auditor, Resident): STRICTLY LOCKED TO THEIR OWN SITE */
              <div className="p-1.5">
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 line-clamp-1">
                    {currentSite.profile.siteName}
                  </span>
                  <span
                    className={`hidden sm:inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] border ${currentCountdown.badgeClass}`}
                  >
                    {currentSite.license.isSuspended ? (
                      <Snowflake className="w-3 h-3" />
                    ) : (
                      <Clock className="w-3 h-3" />
                    )}
                    <span>{currentCountdown.text}</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:flex items-center space-x-1">
                  <span>{currentSite.profile.city}</span>
                  <span>•</span>
                  <span>{currentSite.profile.totalFlats} Daire</span>
                  <span>•</span>
                  <span className="text-emerald-700 font-medium">Yetkili Hesap</span>
                </p>
              </div>
            )}

            {/* Sites Dropdown Menu - ONLY FOR SUPER ADMIN */}
            {isSuperAdmin && showSiteDropdown && (
              <div className="absolute left-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between border-b pb-2">
                  <span>Süper Admin: Kayıtlı Siteler ({sites.length})</span>
                  <span className="text-indigo-600 font-mono text-[10px]">Tam Erişim</span>
                </div>

                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto my-1">
                  {sites.map((site) => {
                    const isSelected = site.id === currentSite.id;
                    const cd = formatCountdownBadge(site.license.expiresAt, site.license.isSuspended);

                    return (
                      <button
                        key={site.id}
                        onClick={() => {
                          onSelectSite(site.id);
                          setShowSiteDropdown(false);
                        }}
                        className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between ${
                          isSelected ? 'bg-indigo-50/80 font-bold' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="space-y-0.5 pr-2">
                          <div className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                            <span>{site.profile.siteName}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {site.profile.city} • {site.profile.totalFlats} Daire • {site.license.planName}
                          </div>
                        </div>

                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0 ${cd.badgeClass}`}
                        >
                          {cd.text}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setShowSiteDropdown(false);
                      onOpenNewSiteModal();
                    }}
                    className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Yeni Site / Apartman Ekle</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center: Quick Register Button & Cloud Sync */}
        <div className="hidden lg:flex items-center space-x-2">
          {onOpenResidentPermissionsModal && (currentUser?.role === 'manager' || currentUser?.role === 'superadmin') && (
            <button
              onClick={onOpenResidentPermissionsModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-950 text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="Site sakinlerinin gördüğü menüleri aktif veya pasif yapın"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-600" />
              <span>Sakin Menü İzinleri</span>
            </button>
          )}

          {!isSuperAdmin && (
            <button
              onClick={onOpenRegisterModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-semibold transition-all shadow-xs cursor-pointer"
              title="Siteye yeni sakin başvurusu gönder"
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-700" />
              <span>Sakin Kayıt Ol / Başvuru</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenCloudModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50/80 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-medium transition-colors"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-semibold">2FA Korumalı Bulut Kasa</span>
            <Cloud className="w-3.5 h-3.5 text-emerald-600 ml-0.5" />
          </button>
        </div>

        {/* Right Tools & Authenticated User Profile */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Accessibility Quick Menu */}
          <div className="relative">
            <button
              onClick={() => setShowAccessibilityMenu(!showAccessibilityMenu)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              aria-label="Erişilebilirlik ve Görünüm Seçenekleri"
              title="Erişilebilirlik (Yazı Boyutu, Yüksek Kontrast)"
            >
              <Eye className="w-4 h-4" />
            </button>

            {showAccessibilityMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 text-xs space-y-3 z-50 animate-in fade-in zoom-in-95">
                <div className="font-bold text-slate-800 border-b pb-2 flex items-center justify-between">
                  <span>Erişilebilirlik Ayarları</span>
                  <button
                    onClick={() => setShowAccessibilityMenu(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs"
                  >
                    Kapat
                  </button>
                </div>

                <div>
                  <label className="block text-slate-500 font-medium mb-1.5 flex items-center space-x-1">
                    <Type className="w-3.5 h-3.5" />
                    <span>Yazı Boyutu Ölçeği:</span>
                  </label>
                  <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg">
                    <button
                      onClick={() => onFontSizeChange('normal')}
                      className={`py-1 rounded text-center font-medium ${
                        fontSize === 'normal' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      A
                    </button>
                    <button
                      onClick={() => onFontSizeChange('large')}
                      className={`py-1 rounded text-center font-semibold ${
                        fontSize === 'large' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      A+
                    </button>
                    <button
                      onClick={() => onFontSizeChange('xlarge')}
                      className={`py-1 rounded text-center font-bold ${
                        fontSize === 'xlarge' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                      }`}
                    >
                      A++
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-700 font-medium">Yüksek Kontrast:</span>
                  <button
                    onClick={onToggleHighContrast}
                    className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                      highContrast
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {highContrast ? 'Açık' : 'Kapalı'}
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setShowAccessibilityMenu(false);
                      onOpenShortcutGuide();
                    }}
                    className="w-full text-left text-indigo-600 hover:text-indigo-800 font-semibold flex items-center space-x-1.5 py-1"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Klavye Kısayolları Rehberi</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Notifications Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowNotifPreview(!showNotifPreview)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative"
              aria-label="Bildirimler"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
              )}
            </button>

            {showNotifPreview && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 text-xs z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-800 text-sm">Mobil & SMS Bildirimleri</span>
                    {unreadNotifs.length > 0 && (
                      <span className="bg-rose-100 text-rose-700 font-bold px-1.5 py-0.5 rounded-full text-[10px]">
                        {unreadNotifs.length} Yeni
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setShowNotifPreview(false);
                      onOpenNotificationCenter();
                    }}
                    className="text-indigo-600 font-semibold hover:underline"
                  >
                    Tümünü Gör
                  </button>
                </div>

                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto my-2">
                  {notifications.slice(0, 4).map((n) => (
                    <div
                      key={n.id}
                      className={`py-2.5 px-2 rounded-lg transition-colors ${
                        !n.read ? 'bg-indigo-50/50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-900">{n.title}</span>
                        <span className="text-[10px] text-slate-400">{n.date.split(' ')[0]}</span>
                      </div>
                      <p className="text-slate-600 text-[11px] line-clamp-2">{n.message}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setShowNotifPreview(false);
                      onOpenNotificationCenter();
                    }}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-center font-semibold text-xs"
                  >
                    Bildirim Merkezini Aç & Yeni SMS/Push Gönder
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Authenticated User Profile Menu & Log Out */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowSiteDropdown(false);
              }}
              className={`flex items-center space-x-2 pl-2.5 pr-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                activeRole === 'superadmin'
                  ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white border-amber-600 shadow-md shadow-amber-200'
                  : activeRole === 'manager'
                  ? 'bg-slate-900 text-white border-slate-800 shadow-sm'
                  : activeRole === 'auditor'
                  ? 'bg-purple-900 text-white border-purple-800 shadow-sm'
                  : activeRole === 'vendor'
                  ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-sm font-bold'
                  : 'bg-indigo-50 text-indigo-900 border-indigo-200 shadow-sm'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                  activeRole === 'superadmin'
                    ? 'bg-white/20 text-white'
                    : activeRole === 'manager'
                    ? 'bg-indigo-600 text-white'
                    : activeRole === 'auditor'
                    ? 'bg-purple-600 text-white'
                    : activeRole === 'vendor'
                    ? 'bg-slate-950 text-amber-400'
                    : 'bg-indigo-600 text-white'
                }`}
              >
                {activeRole === 'superadmin'
                  ? '👑'
                  : activeRole === 'manager'
                  ? 'YÖN'
                  : activeRole === 'auditor'
                  ? 'DNT'
                  : activeRole === 'vendor'
                  ? 'UST'
                  : 'SAK'}
              </div>

              <div className="text-left hidden sm:block">
                <div className="font-bold leading-tight truncate max-w-[120px]">
                  {currentUser?.fullName || 'Kullanıcı'}
                </div>
                <div className="text-[10px] opacity-80 leading-tight font-mono truncate max-w-[120px]">
                  {currentUser?.email || ''}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 text-xs z-50 animate-in fade-in zoom-in-95 space-y-3">
                {/* User info card */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs truncate">
                      {currentUser?.fullName}
                    </span>
                    <span className="flex items-center space-x-1 text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      <Lock className="w-2.5 h-2.5" />
                      <span>2FA Aktif</span>
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">{currentUser?.email}</div>
                  <div className="text-[10px] text-indigo-700 font-semibold pt-1">
                    {isSuperAdmin
                      ? '👑 Süper Admin (Tüm Platform Yetkisi)'
                      : activeRole === 'manager'
                      ? `🏢 ${currentSite.profile.siteName} Yöneticisi`
                      : activeRole === 'auditor'
                      ? `🔍 ${currentSite.profile.siteName} Bağımsız Denetçisi`
                      : activeRole === 'vendor'
                      ? `🔧 Tedarikçi & Usta Portalı (${currentUser?.companyName || 'Özkan Tesisat'})`
                      : `🏠 Daire Sakini (${currentUser?.unitDisplay || 'B Blok No:14'})`}
                  </div>
                </div>

                {/* Role Switcher (Available to test and switch between Manager, Resident, Auditor and Vendor view) */}
                {(isSuperAdmin || activeRole === 'manager' || activeRole === 'resident' || activeRole === 'auditor' || activeRole === 'vendor') && (
                  <div className="space-y-1 pt-1 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">
                      Kullanıcı Rolü & Görünüm Değiştir
                    </span>
                    {isSuperAdmin && (
                      <button
                        onClick={() => {
                          onRoleChange('superadmin');
                          setShowUserMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors ${
                          activeRole === 'superadmin' ? 'bg-amber-500 text-white font-bold' : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <span>👑 Süper Admin SaaS Paneli</span>
                        {activeRole === 'superadmin' && <Check className="w-4 h-4 text-white" />}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        onRoleChange('manager');
                        setShowUserMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors ${
                        activeRole === 'manager' ? 'bg-slate-900 text-white font-bold' : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span>🏢 Site Yönetici Modu</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-800 font-mono">Tam Yetki</span>
                      </div>
                      {activeRole === 'manager' && <Check className="w-4 h-4 text-white" />}
                    </button>
                    <button
                      onClick={() => {
                        onRoleChange('resident');
                        setShowUserMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors ${
                        activeRole === 'resident' ? 'bg-indigo-600 text-white font-bold' : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span>🏠 Sakin Modu (Ali Yılmaz)</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 font-mono font-bold">Kısıtlı Bilgi</span>
                      </div>
                      {activeRole === 'resident' && <Check className="w-4 h-4 text-white" />}
                    </button>
                    <button
                      onClick={() => {
                        onRoleChange('vendor');
                        setShowUserMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors ${
                        activeRole === 'vendor' ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span>🔧 Usta & Firma Portalı</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-mono font-bold">Usta Mustafa</span>
                      </div>
                      {activeRole === 'vendor' && <Check className="w-4 h-4 text-slate-950" />}
                    </button>
                    <button
                      onClick={() => {
                        onRoleChange('auditor');
                        setShowUserMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors ${
                        activeRole === 'auditor' ? 'bg-purple-900 text-white font-bold' : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span>🔍 Denetçi Modu</span>
                      {activeRole === 'auditor' && <Check className="w-4 h-4 text-white" />}
                    </button>
                  </div>
                )}

                {/* Logout Button */}
                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout();
                    }}
                    className="w-full py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-bold text-xs transition-colors flex items-center justify-center space-x-2 border border-rose-200"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Güvenli Çıkış Yap (Oturumu Kapat)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
