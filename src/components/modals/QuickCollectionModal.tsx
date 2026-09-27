/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Zap,
  X,
  CheckCircle2,
  Building,
  User,
  CreditCard,
  Banknote,
  DollarSign,
  Smartphone,
  ShieldCheck,
  Receipt,
  ArrowRight,
} from 'lucide-react';
import { ApartmentUnit, PaymentMethod, SiteProfile } from '../../types';
import { formatCurrency, generateReceiptNo } from '../../utils/formatters';

interface QuickCollectionModalProps {
  unit: ApartmentUnit;
  siteProfile: SiteProfile;
  onClose: () => void;
  onConfirm: (
    unit: ApartmentUnit,
    amount: number,
    method: PaymentMethod,
    receiptNo: string,
    sendSms: boolean
  ) => void;
}

export const QuickCollectionModal: React.FC<QuickCollectionModalProps> = ({
  unit,
  siteProfile,
  onClose,
  onConfirm,
}) => {
  const overdueDebt = unit.currentBalance < 0 ? Math.abs(unit.currentBalance) : 0;
  const [amount, setAmount] = useState<number>(overdueDebt > 0 ? overdueDebt : unit.monthlyDues);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [receiptNo, setReceiptNo] = useState<string>(() => generateReceiptNo());
  const [sendSms, setSendSms] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    setIsProcessing(true);
    setTimeout(() => {
      onConfirm(unit, amount, paymentMethod, receiptNo, sendSms);
      setIsProcessing(false);
    }, 350);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 text-white border border-white/30 flex items-center justify-center font-bold shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-base tracking-tight">
                  Hızlı Ödeme Al & Tahsilat
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-400/30 text-emerald-200 border border-emerald-300/30 font-bold shrink-0">
                  Otomatik Kapatma
                </span>
              </div>
              <p className="text-xs text-emerald-100">
                Seçilen sakinin vadesi geçmiş borcunu tahsil edilmiş olarak işaretleyin.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {/* Target Resident Information Card */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs shrink-0">
                {unit.block}:{unit.unitNo}
              </div>
              <div>
                <div className="font-extrabold text-slate-900 text-sm">
                  {unit.residentName}
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  {unit.phone || 'Telefon Kaydı Yok'} • {unit.residentType === 'owner' ? 'Kat Maliki' : 'Kiracı'}
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                Vadesi Geçmiş Borç
              </span>
              <span className="text-base font-extrabold font-mono text-rose-600">
                {formatCurrency(overdueDebt)}
              </span>
            </div>
          </div>

          {/* Amount Field */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Tahsil Edilecek Tutar (₺)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                ₺
              </span>
              <input
                type="number"
                min="1"
                step="any"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full pl-8 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-mono font-extrabold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Bu tutar onaylandığında sakinin cari borcundan düşülecek ve bakiye sıfırlanacaktır.
            </p>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Tahsilat Yöntemi / Kasa
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center space-y-1 transition cursor-pointer ${
                  paymentMethod === 'cash'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-300'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Banknote className="w-4 h-4 text-emerald-600" />
                <span>Nakit (Kasa)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('bank_transfer')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center space-y-1 transition cursor-pointer ${
                  paymentMethod === 'bank_transfer'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-300'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Building className="w-4 h-4 text-indigo-600" />
                <span>Havale / EFT</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('credit_card')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center space-y-1 transition cursor-pointer ${
                  paymentMethod === 'credit_card'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-300'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-4 h-4 text-purple-600" />
                <span>POS / Kart</span>
              </button>
            </div>
          </div>

          {/* Receipt Number & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Makbuz No
              </label>
              <input
                type="text"
                value={receiptNo}
                onChange={(e) => setReceiptNo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Tahsilat Tarihi
              </label>
              <input
                type="text"
                disabled
                value={new Date().toLocaleDateString('tr-TR')}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono text-slate-600 cursor-not-allowed"
              />
            </div>
          </div>

          {/* SMS Notification Checkbox */}
          <label className="flex items-center space-x-2.5 p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={sendSms}
              onChange={(e) => setSendSms(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
            />
            <div className="text-xs text-emerald-950 font-medium leading-tight">
              <strong>Sakine SMS Tahsilat Dekontu İletilsin</strong>
              <div className="text-[11px] text-emerald-700">
                Ödemenin alındığı ve cari bakiyenin sıfırlandığı {unit.phone || 'telefona'} SMS ile bildirilir.
              </div>
            </div>
          </label>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition cursor-pointer"
            >
              Vazgeç
            </button>

            <button
              type="submit"
              disabled={isProcessing || amount <= 0}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 disabled:opacity-50 text-white font-extrabold rounded-xl text-xs transition-all shadow-md flex items-center space-x-1.5 cursor-pointer ring-1 ring-emerald-400/50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isProcessing
                  ? 'İşleniyor...'
                  : `Hızlı Tahsilatı Tamamla (${formatCurrency(amount)})`}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
