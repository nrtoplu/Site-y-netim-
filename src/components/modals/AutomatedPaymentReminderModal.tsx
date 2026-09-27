/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Smartphone,
  X,
  Send,
  CheckCircle2,
  AlertTriangle,
  Building,
  User,
  Phone,
  DollarSign,
  Copy,
  Check,
  ShieldCheck,
  MessageSquare,
} from 'lucide-react';
import { ApartmentUnit, SiteProfile } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { formatAutomatedPaymentReminderSms } from '../../utils/unitTimeline';

interface AutomatedPaymentReminderModalProps {
  unit: ApartmentUnit;
  siteProfile: SiteProfile;
  onClose: () => void;
  onConfirmSend: (smsText: string) => void;
}

export const AutomatedPaymentReminderModal: React.FC<AutomatedPaymentReminderModalProps> = ({
  unit,
  siteProfile,
  onClose,
  onConfirmSend,
}) => {
  const overdueAmount = Math.abs(unit.currentBalance);
  const defaultSms = formatAutomatedPaymentReminderSms(unit, siteProfile.siteName, overdueAmount);

  const [smsMessage, setSmsMessage] = useState(defaultSms);
  const [copied, setCopied] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(smsMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = () => {
    setIsSent(true);
    onConfirmSend(smsMessage);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-slate-950 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-950/10 border border-slate-950/20 flex items-center justify-center font-bold">
              <Smartphone className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base leading-tight">
                Send Automated Payment Reminder
              </h3>
              <p className="text-[11px] font-semibold text-amber-950/80">
                Önceden Formatlanmış Borç Hatırlatma SMS'i
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-950/70 hover:text-slate-950 hover:bg-black/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {/* Target Resident & Balance Card */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-1.5 font-bold text-slate-900 text-sm">
                <User className="w-4 h-4 text-indigo-600" />
                <span>{unit.residentName}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  {unit.block} Blok D:{unit.unitNo}
                </span>
              </div>
              <div className="flex items-center space-x-1 text-slate-500 font-mono text-xs">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>{unit.phone || '05XX XXX XX XX'}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Vadesi Geçmiş Borç</span>
              <span className="text-base font-extrabold font-mono text-rose-600">
                {formatCurrency(overdueAmount)}
              </span>
            </div>
          </div>

          {/* SMS Notification Composer */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 flex items-center space-x-1">
                <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                <span>Formatlanmış SMS Metni (Pre-formatted SMS Notification)</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                {smsMessage.length} Karakter (1 SMS)
              </span>
            </div>

            <div className="relative">
              <textarea
                rows={4}
                value={smsMessage}
                onChange={(e) => setSmsMessage(e.target.value)}
                className="w-full p-3 bg-amber-50/40 border border-amber-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-mono leading-relaxed"
              />
            </div>
          </div>

          {/* Gateway Dispatch Badge */}
          <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600">
            <div className="flex items-center space-x-2">
              <Building className="w-4 h-4 text-indigo-600" />
              <span>
                Gönderen Başlığı: <strong>{siteProfile.siteName.slice(0, 11).toUpperCase()}</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center space-x-1 cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Kopyalandı' : 'Metni Kopyala'}</span>
            </button>
          </div>

          {/* Sent Confirmation Alert */}
          {isSent && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start space-x-2.5 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-emerald-900 block font-bold">
                  SMS Başarıyla GSM Operatörüne İletildi
                </strong>
                <p className="text-emerald-700 text-[11px] mt-0.5">
                  {unit.residentName} ({unit.phone}) nolu telefona borç hatırlatması ve online ödeme linki gönderildi. Zaman çizelgesine resmi bildirim olarak işlendi.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>KVKK ve KMK Uyumlu Otomatik Bildirim</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 font-semibold transition cursor-pointer"
            >
              {isSent ? 'Kapat' : 'Vazgeç'}
            </button>

            {!isSent ? (
              <button
                type="button"
                onClick={handleSend}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold transition shadow-xs flex items-center space-x-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-slate-950" />
                <span>Send Automated Payment Reminder</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-xs cursor-pointer"
              >
                Tamamlandı
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
