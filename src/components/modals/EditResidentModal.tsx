import React, { useState } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  Home,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Shield,
  KeyRound,
  Trash2,
} from 'lucide-react';
import { ApartmentUnit } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface EditResidentModalProps {
  unit: ApartmentUnit;
  onClose: () => void;
  onUpdateUnit: (updatedUnit: ApartmentUnit) => void;
  onSendResetPassword: (phone: string, name: string) => void;
  onVacateUnit: (unitId: string) => void;
  onImpersonateResident: (unit: ApartmentUnit) => void;
}

export const EditResidentModal: React.FC<EditResidentModalProps> = ({
  unit,
  onClose,
  onUpdateUnit,
  onSendResetPassword,
  onVacateUnit,
  onImpersonateResident,
}) => {
  const [residentName, setResidentName] = useState(unit.residentName);
  const [residentType, setResidentType] = useState<'owner' | 'tenant'>(unit.residentType);
  const [phone, setPhone] = useState(unit.phone);
  const [email, setEmail] = useState(unit.email);
  const [plateNumber, setPlateNumber] = useState(unit.plateNumber || '');
  const [monthlyDues, setMonthlyDues] = useState(unit.monthlyDues);
  const [currentBalance, setCurrentBalance] = useState(unit.currentBalance);
  const [balanceAdjustment, setBalanceAdjustment] = useState<number | ''>('');
  const [adjustmentType, setAdjustmentType] = useState<'debt' | 'credit'>('debt');
  const [adjustmentNote, setAdjustmentNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let finalBalance = currentBalance;
    if (typeof balanceAdjustment === 'number' && balanceAdjustment > 0) {
      if (adjustmentType === 'debt') {
        // Borçlandır (bakiye daha negatifleşir)
        finalBalance -= balanceAdjustment;
      } else {
        // Alacaklandır / İndirim yap (bakiye pozitifleşir veya borç azalır)
        finalBalance += balanceAdjustment;
      }
    }

    const updated: ApartmentUnit = {
      ...unit,
      residentName,
      residentType,
      phone,
      email,
      plateNumber,
      monthlyDues,
      currentBalance: finalBalance,
    };

    onUpdateUnit(updated);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-sm p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Home className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="font-bold text-sm">
                Sakin Hesabına Müdahale: {unit.block} Blok Daire {unit.unitNo}
              </h2>
              <p className="text-[11px] text-slate-400">Site Yönetimi Tam Yetkili Hesap Düzenleyici</p>
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
          {/* Quick Impersonation and Actions */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 block">Sakin Portal Görünümü</span>
              <span className="text-[11px] text-slate-500">Bu sakinin gözünden sisteme giriş yap</span>
            </div>
            <button
              type="button"
              onClick={() => onImpersonateResident(unit)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors"
            >
              Sakin Olarak Oturum Aç
            </button>
          </div>

          {/* Resident Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              1. Sakin Bilgileri & İkamet Türü
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ad Soyad
                </label>
                <input
                  type="text"
                  required
                  value={residentName}
                  onChange={(e) => setResidentName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  İkamet Statüsü
                </label>
                <select
                  value={residentType}
                  onChange={(e) => setResidentType(e.target.value as 'owner' | 'tenant')}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="owner">Kat Maliki (Ev Sahibi)</option>
                  <option value="tenant">Kiracı</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Telefon</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">E-Posta</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Araç Plakası (Otopark)
                </label>
                <input
                  type="text"
                  placeholder="34 ABC 123"
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Aylık Aidat Tutarı (₺)
                </label>
                <input
                  type="number"
                  value={monthlyDues}
                  onChange={(e) => setMonthlyDues(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Balance & Debt Intervention */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                2. Bakiye & Borçlandırma Müdahalesi
              </h3>
              <span
                className={`font-mono font-extrabold text-xs px-2.5 py-0.5 rounded-full ${
                  currentBalance < 0
                    ? 'bg-rose-100 text-rose-700'
                    : currentBalance > 0
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                Mevcut Bakiye: {formatCurrency(currentBalance)}
              </span>
            </div>

            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3 text-xs">
              <div className="flex items-center space-x-2">
                <label className="font-semibold text-slate-700">Müdahale Türü:</label>
                <div className="flex items-center space-x-3">
                  <label className="inline-flex items-center space-x-1 cursor-pointer">
                    <input
                      type="radio"
                      name="adjType"
                      checked={adjustmentType === 'debt'}
                      onChange={() => setAdjustmentType('debt')}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <span className="text-rose-700 font-semibold">Borç Ekle (+)</span>
                  </label>
                  <label className="inline-flex items-center space-x-1 cursor-pointer">
                    <input
                      type="radio"
                      name="adjType"
                      checked={adjustmentType === 'credit'}
                      onChange={() => setAdjustmentType('credit')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-emerald-700 font-semibold">Alacak / Af (- Borç)</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Tutar (₺)
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={balanceAdjustment}
                    onChange={(e) =>
                      setBalanceAdjustment(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Gerekçe / Açıklama
                  </label>
                  <input
                    type="text"
                    placeholder="Örn: Ortak alan hasar bedeli"
                    value={adjustmentNote}
                    onChange={(e) => setAdjustmentNote(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Security Actions */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              3. Güvenlik & Tahliye İşlemleri
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onSendResetPassword(phone, residentName)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium flex items-center space-x-1.5 transition-colors"
              >
                <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                <span>Geçici Şifre SMS'i Gönder</span>
              </button>

              <button
                type="button"
                onClick={() => onVacateUnit(unit.id)}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-medium flex items-center space-x-1.5 transition-colors ml-auto"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Daireyi Boşalt / Tahliye</span>
              </button>
            </div>
          </div>

          {/* Footer Actions */}
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
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Değişiklikleri Kaydet</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
