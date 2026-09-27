import React, { useState } from 'react';
import {
  X,
  UserCheck,
  Building,
  Calendar,
  FileText,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  ArrowRightLeft,
} from 'lucide-react';
import { TenantSite, ApartmentUnit, ManagementHandoverRecord } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface ManagementHandoverModalProps {
  currentSite: TenantSite;
  currentManagerName: string;
  currentManagerEmail: string;
  onClose: () => void;
  onExecuteHandover: (handoverData: ManagementHandoverRecord) => void;
}

export const ManagementHandoverModal: React.FC<ManagementHandoverModalProps> = ({
  currentSite,
  currentManagerName,
  currentManagerEmail,
  onClose,
  onExecuteHandover,
}) => {
  const [newManagerName, setNewManagerName] = useState('');
  const [newManagerEmail, setNewManagerEmail] = useState('');
  const [newManagerPhone, setNewManagerPhone] = useState('');
  const [newManagerTcNo, setNewManagerTcNo] = useState('');
  const [decisionNumber, setDecisionNumber] = useState('GK-2026/04');
  const [handoverDate, setHandoverDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState(
    'Olağan Kat Malikleri Genel Kurulu toplantısında alınan karar uyarınca tüm banka hesapları, işletme defteri, karar defteri ve kasa mevcudu eksiksiz devredilmiştir.'
  );
  const [confirmFundsMatch, setConfirmFundsMatch] = useState(false);
  const [confirmDecisionBook, setConfirmDecisionBook] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick select from residents
  const handleSelectResident = (u: ApartmentUnit) => {
    setNewManagerName(u.residentName);
    setNewManagerEmail(u.email);
    setNewManagerPhone(u.phone);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmFundsMatch || !confirmDecisionBook) {
      alert('Lütfen devir teslim şartlarını ve mutabakat onaylarını işaretleyiniz.');
      return;
    }

    setIsSubmitting(true);
    const handoverRecord: ManagementHandoverRecord = {
      id: `handover-${Date.now()}`,
      siteId: currentSite.id,
      previousManagerName: currentManagerName,
      previousManagerEmail: currentManagerEmail,
      newManagerName,
      newManagerEmail,
      newManagerPhone,
      newManagerTcNo: newManagerTcNo || '11111111111',
      decisionNumber,
      handoverDate,
      notes,
      documentTitle: `Yonetim_Devir_Teslim_Tutanagi_${decisionNumber.replace('/', '_')}.pdf`,
    };

    setTimeout(() => {
      onExecuteHandover(handoverRecord);
      setIsSubmitting(false);
      onClose();
    }, 450);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm">Resmi Yönetici Devir Teslim İşlemi</h2>
              <p className="text-[11px] text-slate-400">
                {currentSite.profile.siteName} • 634 Sayılı KMK Madde 34 Uyarınca
              </p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
          {/* Important Notice */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-start space-x-2.5 text-xs text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold">Hukuki ve Mali Sorumluluk Uyarısı:</span>
              <p className="text-[11px]">
                Yönetici devri onaylandığında, mevcut işletme kasası, banka yetkileri ve yönetim paneli erişim hakları yeni yöneticiye aktarılacak, resmi devir tutanağı dijital arşive SHA-256 mührüyle kaydedilecektir.
              </p>
            </div>
          </div>

          {/* Current Manager Summary */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] font-semibold uppercase">
                Görevi Devreden Yönetici
              </span>
              <strong className="text-slate-900 text-xs">{currentManagerName}</strong>
              <div className="text-[11px] text-slate-500">{currentManagerEmail}</div>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] font-semibold uppercase">
                Devredilen Kasa & Fon Bakiyesi
              </span>
              <div className="text-emerald-700 font-bold font-mono text-xs">
                Kasa: {formatCurrency(currentSite.profile.operatingFundBalance)}
              </div>
              <div className="text-indigo-700 font-semibold font-mono text-[11px]">
                Demirbaş: {formatCurrency(currentSite.profile.reserveFundBalance)}
              </div>
            </div>
          </div>

          {/* Fast select from residents */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Sitedeki Bir Sakini Yönetici Olarak Seç (İsteğe Bağlı Hızlı Doldurma):
            </label>
            <select
              onChange={(e) => {
                const selected = currentSite.units.find((u) => u.id === e.target.value);
                if (selected) handleSelectResident(selected);
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

          {/* New Manager Information */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Yeni Yönetici Bilgileri
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Yeni Yönetici Adı Soyadı *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ad Soyad"
                  value={newManagerName}
                  onChange={(e) => setNewManagerName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  T.C. Kimlik No *
                </label>
                <input
                  type="text"
                  required
                  maxLength={11}
                  placeholder="11 haneli TC no"
                  value={newManagerTcNo}
                  onChange={(e) => setNewManagerTcNo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  E-Posta (Giriş İçin) *
                </label>
                <input
                  type="email"
                  required
                  placeholder="yeni.yonetici@mail.com"
                  value={newManagerEmail}
                  onChange={(e) => setNewManagerEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Telefon Numarası *
                </label>
                <input
                  type="text"
                  required
                  placeholder="0532 000 00 00"
                  value={newManagerPhone}
                  onChange={(e) => setNewManagerPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Decision and Date */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Genel Kurul & Karar Defteri Bilgileri
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Genel Kurul Karar Numarası *
                </label>
                <input
                  type="text"
                  required
                  value={decisionNumber}
                  onChange={(e) => setDecisionNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Devir Teslim Tarihi *
                </label>
                <input
                  type="date"
                  required
                  value={handoverDate}
                  onChange={(e) => setHandoverDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Devir Teslim Tutanağı Notları & Açıklama
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 resize-none"
              />
            </div>
          </div>

          {/* Verification Checkboxes */}
          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            <label className="flex items-start space-x-2 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={confirmFundsMatch}
                onChange={(e) => setConfirmFundsMatch(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-slate-700 font-medium">
                İşletme kasası ({formatCurrency(currentSite.profile.operatingFundBalance)}) ve demirbaş fonu hesap bakiyelerinin banka dekontlarıyla mutabık olduğunu onaylıyorum.
              </span>
            </label>

            <label className="flex items-start space-x-2 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={confirmDecisionBook}
                onChange={(e) => setConfirmDecisionBook(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-slate-700 font-medium">
                Karar defteri, fatura klasörleri ve bina anahtarlarının yeni yöneticiye teslim edildiğini teyit ediyorum.
              </span>
            </label>
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
              disabled={isSubmitting || !confirmFundsMatch || !confirmDecisionBook}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Devir Yapılıyor...' : 'Yöneticiyi Devret & Arşivle'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
