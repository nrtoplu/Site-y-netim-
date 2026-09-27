/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Shield,
  CreditCard,
  Receipt,
  PieChart,
  Wrench,
  MessageSquare,
  FolderArchive,
  Bell,
  Briefcase,
  LayoutDashboard,
  CheckCircle2,
  Info,
  Sliders,
  Power,
  PowerOff,
  Sparkles,
} from 'lucide-react';
import { ActiveTab } from '../Sidebar';

interface ResidentMenuOption {
  id: ActiveTab;
  title: string;
  category: string;
  description: string;
  icon: React.ElementType;
  defaultAllowed: boolean;
}

export const RESIDENT_MENU_OPTIONS: ResidentMenuOption[] = [
  {
    id: 'overview',
    title: 'Genel Bakış Paneli',
    category: 'Temel Erişim',
    description: 'Sakinlerin kişisel karşılama ekranı, güncel aidat durumu ve özet sayaçları görmesini sağlar.',
    icon: LayoutDashboard,
    defaultAllowed: true,
  },
  {
    id: 'dues',
    title: 'Aidatlarım & Online Ödeme Masası',
    category: 'Finans',
    description: 'Daire sakininin kendi aidat borçlarını listelemesi ve 3D Secure kredi kartı / havale ile ödeme yapabilmesi.',
    icon: CreditCard,
    defaultAllowed: true,
  },
  {
    id: 'expenses',
    title: 'Giderler & Harcama Faturaları',
    category: 'Şeffaflık & Denetim',
    description: 'Sitenin yaptığı ortak alan harcamalarını ve faturaları sakinlerin şeffafça inceleyebilmesi.',
    icon: Receipt,
    defaultAllowed: true,
  },
  {
    id: 'budget',
    title: 'Şeffaf Bütçe & Kasa Grafikleri',
    category: 'Şeffaflık & Denetim',
    description: 'İşletme ve demirbaş bütçesi gerçekleşme oranlarını, tahsilat başarı yüzdelerini sakinlere açar.',
    icon: PieChart,
    defaultAllowed: true,
  },
  {
    id: 'maintenance',
    title: 'Arıza Bildirimi & Bakım Talebi',
    category: 'Teknik Servis',
    description: 'Daire sakinlerinin apartman/site yönetimine arıza bildiriminde bulunması ve usta durumunu takip etmesi.',
    icon: Wrench,
    defaultAllowed: true,
  },
  {
    id: 'community',
    title: 'Sakinler İletişim Pano & Anketler',
    category: 'Sosyal',
    description: 'Site içi komşuluk duyuruları, anket oylamaları ve sakinler arası paylaşım panosu.',
    icon: MessageSquare,
    defaultAllowed: true,
  },
  {
    id: 'archive',
    title: 'Dijital Belge & Karar Defteri',
    category: 'Hukuk & Arşiv',
    description: 'Genel kurul tutanakları, işletme projesi ve resmi site tüzüğünün sakinler tarafından indirilmesi.',
    icon: FolderArchive,
    defaultAllowed: true,
  },
  {
    id: 'notifications',
    title: 'Mobil Bildirimler & SMS',
    category: 'İletişim',
    description: 'Yönetim tarafından gönderilen acil su kesintisi, toplantı çağrısı ve aidat duyuru bildirimleri.',
    icon: Bell,
    defaultAllowed: true,
  },
  {
    id: 'marketplace',
    title: 'Bölgesel Usta & Firma Masası',
    category: 'Tedarik',
    description: 'Siteye onaylanmış tesisatçı, elektrikçi, çilingir ve asansör firmalarının iletişim kartlarını sakinlere gösterir.',
    icon: Briefcase,
    defaultAllowed: false,
  },
];

export const DEFAULT_RESIDENT_ALLOWED_TABS: ActiveTab[] = [
  'overview',
  'dues',
  'expenses',
  'budget',
  'maintenance',
  'community',
  'archive',
  'notifications',
];

interface ResidentMenuPermissionsModalProps {
  onClose: () => void;
  siteName: string;
  allowedTabs?: string[];
  onSaveAllowedTabs: (tabs: string[]) => void;
}

export const ResidentMenuPermissionsModal: React.FC<ResidentMenuPermissionsModalProps> = ({
  onClose,
  siteName,
  allowedTabs,
  onSaveAllowedTabs,
}) => {
  const [selectedTabs, setSelectedTabs] = useState<string[]>(
    allowedTabs && allowedTabs.length > 0 ? allowedTabs : DEFAULT_RESIDENT_ALLOWED_TABS
  );

  const toggleTab = (tabId: string) => {
    setSelectedTabs((prev) =>
      prev.includes(tabId) ? prev.filter((id) => id !== tabId) : [...prev, tabId]
    );
  };

  const handleSelectAll = () => {
    setSelectedTabs(RESIDENT_MENU_OPTIONS.map((m) => m.id));
  };

  const handleSelectDefaults = () => {
    setSelectedTabs(DEFAULT_RESIDENT_ALLOWED_TABS);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveAllowedTabs(selectedTabs);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center justify-center font-bold">
              <Sliders className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-base tracking-tight">
                  Sakin Menü & Erişim İzin Masası
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-bold">
                  Yönetici Kontrolü
                </span>
              </div>
              <p className="text-xs text-slate-300">{siteName} • Kat Sakinleri Menü Görünürlüğü</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Notification */}
        <div className="px-6 py-3 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between text-xs text-indigo-900 shrink-0">
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              Burada <strong>pasif</strong> yaptığınız menüler, site sakinlerinin sol gezinme çubuğunda gizlenir ve erişime kapatılır.
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
            >
              Tümünü Aç
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={handleSelectDefaults}
              className="text-[11px] font-bold text-slate-600 hover:underline cursor-pointer"
            >
              Varsayılan
            </button>
          </div>
        </div>

        {/* Content List */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-3">
          <div className="space-y-2.5">
            {RESIDENT_MENU_OPTIONS.map((menu) => {
              const Icon = menu.icon;
              const isEnabled = selectedTabs.includes(menu.id);

              return (
                <div
                  key={menu.id}
                  onClick={() => toggleTab(menu.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isEnabled
                      ? 'bg-white border-indigo-200 shadow-xs hover:border-indigo-300 ring-1 ring-indigo-500/10'
                      : 'bg-slate-50/70 border-slate-200 opacity-60 hover:opacity-80'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                        isEnabled
                          ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                          : 'bg-slate-200 text-slate-500 border border-slate-300'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                          {menu.title}
                        </span>
                        <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                          {menu.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {menu.description}
                      </p>
                    </div>
                  </div>

                  {/* Toggle Indicator Button */}
                  <div className="shrink-0 flex items-center space-x-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border hidden sm:inline-block ${
                        isEnabled
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-slate-200 text-slate-600 border-slate-300'
                      }`}
                    >
                      {isEnabled ? '🟢 Sakine Açık' : '🔒 Gizli / Kapalı'}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTab(menu.id);
                      }}
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 focus:outline-hidden ${
                        isEnabled ? 'bg-indigo-600 justify-end' : 'bg-slate-300 justify-start'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Action Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <div className="text-xs text-slate-500 font-medium">
              Aktif Sakin Menüsü: <strong className="text-indigo-700">{selectedTabs.length}</strong> / {RESIDENT_MENU_OPTIONS.length}
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-200 flex items-center space-x-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Menü Ayarlarını Kaydet</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
