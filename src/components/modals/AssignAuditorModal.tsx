import React, { useState } from 'react';
import {
  X,
  Search,
  ShieldCheck,
  UserCheck,
  FileCheck2,
  CheckCircle2,
  AlertCircle,
  Building,
} from 'lucide-react';
import { TenantSite, ApartmentUnit, SiteAuditor } from '../../types';

interface AssignAuditorModalProps {
  currentSite: TenantSite;
  currentManagerName: string;
  onClose: () => void;
  onAssignAuditor: (auditor: SiteAuditor) => void;
}

export const AssignAuditorModal: React.FC<AssignAuditorModalProps> = ({
  currentSite,
  currentManagerName,
  onClose,
  onAssignAuditor,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [auditorType, setAuditorType] = useState('Kat Maliki Denetçisi');
  const [notes, setNotes] = useState(
    'Yönetim kurulu mali hesaplarını, gelir-gider faturalarını ve işletme defterini incelemek üzere yetkilendirilmiştir.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fast pick from units
  const handleSelectUnit = (u: ApartmentUnit) => {
    setFullName(u.residentName);
    setEmail(u.email);
    setPhone(u.phone);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newAuditor: SiteAuditor = {
      id: `auditor-${Date.now()}`,
      siteId: currentSite.id,
      fullName,
      email,
      phone,
      appointedDate: new Date().toISOString().split('T')[0],
      appointedBy: currentManagerName,
      status: 'active',
      notes: `${auditorType} • ${notes}`,
    };

    setTimeout(() => {
      onAssignAuditor(newAuditor);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900 to-indigo-950 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm">Denetçi Ekle & Sisteme İnceleme Yetkisi Ver</h2>
              <p className="text-[11px] text-purple-200">{currentSite.profile.siteName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-2xl flex items-start space-x-2.5 text-xs text-purple-950">
            <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold">Bağımsız Denetim ve Şeffaflık İlkesi:</span>
              <p className="text-[11px] text-purple-800">
                Eklenen denetçi, kendi e-postası ve 2FA ile giriş yaparak sitenin tüm kasa hareketlerini, fatura eklerini, banka bakiyelerini ve aidat tahsilatlarını denetleme yetkisine sahip olur.
              </p>
            </div>
          </div>

          {/* Quick select from residents */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Sitedeki Bir Sakini Denetçi Olarak Seç:
            </label>
            <select
              onChange={(e) => {
                const selected = currentSite.units.find((u) => u.id === e.target.value);
                if (selected) handleSelectUnit(selected);
              }}
              defaultValue=""
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
            >
              <option value="" disabled>
                -- Daire sakinlerinden birini seçin --
              </option>
              {currentSite.units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.residentName} ({u.block} Blok D:{u.unitNo}) - {u.residentType === 'owner' ? 'Kat Maliki' : 'Kiracı'}
                </option>
              ))}
            </select>
          </div>

          {/* Personal information */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Denetçi Bilgileri & Erişim Tanımı
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Denetçi Adı Soyadı *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Av. Selin Aktaş"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Denetçi Statüsü *
                </label>
                <select
                  value={auditorType}
                  onChange={(e) => setAuditorType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                >
                  <option value="Kat Maliki Denetçisi">Kat Maliki Denetçisi</option>
                  <option value="Denetim Kurulu Başkanı">Denetim Kurulu Başkanı</option>
                  <option value="Bağımsız Mali Müşavir (SMMM)">Bağımsız Mali Müşavir (SMMM)</option>
                  <option value="Hukuk / Avukat Denetçi">Hukuk / Avukat Denetçi</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Giriş E-Posta Adresi *
                </label>
                <input
                  type="email"
                  required
                  placeholder="denetci@ornek.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  2FA Telefon Numarası *
                </label>
                <input
                  type="text"
                  required
                  placeholder="0532 000 00 00"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Yetkilendirme Kapsamı & Görev Notu
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 resize-none"
              />
            </div>
          </div>

          {/* Permissions Granted Preview */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 text-xs text-slate-600">
            <span className="font-bold text-slate-800 block text-[11px]">
              Denetçiye Verilen Özel İnceleme Yetkileri:
            </span>
            <ul className="list-disc list-inside space-y-0.5 text-[11px]">
              <li>Tüm banka hesap hareketleri ve kasa mevcudunu anlık görme</li>
              <li>Tüm harcama faturalarını ve tedarikçi makbuzlarını inceleme</li>
              <li>Aidat tahsilat oranları ve icra/borçlu listelerini denetleme</li>
              <li>Resmi Dijital Denetim Raporu hazırlayıp arşive mühürleme</li>
            </ul>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !fullName || !email}
              className="px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Yetkilendiriliyor...' : 'Denetçi Olarak Ata & 2FA Yetkisi Ver'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
