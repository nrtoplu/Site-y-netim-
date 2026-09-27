/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  X,
  History,
  Clock,
  CreditCard,
  Receipt,
  Calendar,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Filter,
  Search,
  Printer,
  Download,
  Plus,
  MessageSquare,
  ShieldCheck,
  Scale,
  FileText,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  User,
  Building,
  Phone,
  Mail,
  Car,
  ChevronDown,
  ExternalLink,
  Edit3,
  Smartphone,
  Send,
  Zap,
} from 'lucide-react';
import { ApartmentUnit, DuesRecord, SiteProfile, PaymentMethod } from '../../types';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';
import {
  TimelineEvent,
  generateUnitTimelineEvents,
  formatAutomatedPaymentReminderSms,
} from '../../utils/unitTimeline';
import { AutomatedPaymentReminderModal } from './AutomatedPaymentReminderModal';
import { AdvancedPaymentReportModal } from './AdvancedPaymentReportModal';
import { LegalNoticeModal } from './LegalNoticeModal';
import { ResidentCommunicationLogModal } from './ResidentCommunicationLogModal';
import { QuickCollectionModal } from './QuickCollectionModal';
import { getInitialUnitCommunicationLog } from '../../utils/communicationLog';

interface UnitTimelineModalProps {
  unit: ApartmentUnit;
  allUnits: ApartmentUnit[];
  dues: DuesRecord[];
  siteProfile: SiteProfile;
  onClose: () => void;
  onSelectUnit: (unit: ApartmentUnit) => void;
  onEditResident: (unit: ApartmentUnit) => void;
  onViewReceipt?: (due: DuesRecord) => void;
  onSendReminder?: (unit: ApartmentUnit, customMessage?: string) => void;
  onQuickCollect?: (
    unit: ApartmentUnit,
    amount: number,
    method: PaymentMethod,
    receiptNo: string,
    sendSms: boolean
  ) => void;
}

export const UnitTimelineModal: React.FC<UnitTimelineModalProps> = ({
  unit,
  allUnits,
  dues,
  siteProfile,
  onClose,
  onSelectUnit,
  onEditResident,
  onViewReceipt,
  onSendReminder,
  onQuickCollect,
}) => {
  const [filterType, setFilterType] = useState<
    'all' | 'payment' | 'charge' | 'late_fee' | 'dispute_note' | 'sms_reminder'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [showAddNoteForm, setShowAddNoteForm] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderAlert, setReminderAlert] = useState<{
    phone: string;
    message: string;
    timestamp: string;
  } | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showLegalNoticeModal, setShowLegalNoticeModal] = useState(false);
  const [showCommLogModal, setShowCommLogModal] = useState(false);
  const [showQuickCollectionModal, setShowQuickCollectionModal] = useState(false);

  const [disputeNotes, setDisputeNotes] = useState<TimelineEvent[]>([
    {
      id: `initial-note-${unit.id}`,
      type: 'dispute_note',
      date: '2025-02-18',
      period: 'Şubat 2025',
      title: 'İhtilaf & İletişim Notu (Site Yönetimi)',
      description:
        unit.currentBalance < 0
          ? 'Sakin ile aidat gecikmesi konusunda telefon görüşmesi sağlandı. Ay sonuna kadar ödeme taahhüdü alındı.'
          : 'Sakin ile hesap mutabakatı sağlandı. Herhangi bir bakiye uyuşmazlığı bulunmuyor.',
      amount: 0,
      balanceAfter: unit.currentBalance,
      status: 'settled',
      author: siteProfile.managementBoard[0] || 'Kemal Ersoy (Yönetici)',
    },
  ]);

  // Generate historical timeline tailored to this unit
  const timelineEvents = useMemo(() => {
    return generateUnitTimelineEvents(unit, dues, siteProfile, disputeNotes);
  }, [unit, dues, siteProfile, disputeNotes]);

  const hasOverdueBalance =
    unit.currentBalance < 0 || timelineEvents.some((e) => e.status === 'overdue');

  // Filtered & sorted view for rendering
  const displayEvents = useMemo(() => {
    let list = [...timelineEvents];

    if (filterType !== 'all') {
      if (filterType === 'dispute_note') {
        list = list.filter((e) => e.type === 'dispute_note' || e.type === 'sms_reminder');
      } else {
        list = list.filter((e) => e.type === filterType);
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          (e.receiptNo && e.receiptNo.toLowerCase().includes(q)) ||
          (e.transactionRef && e.transactionRef.toLowerCase().includes(q)) ||
          e.period.toLowerCase().includes(q)
      );
    }

    if (sortOrder === 'desc') {
      list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else {
      list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }

    return list;
  }, [timelineEvents, filterType, searchQuery, sortOrder]);

  // Statistics
  const totalBilled = timelineEvents
    .filter((e) => e.type === 'charge')
    .reduce((sum, e) => sum + e.amount, 0);
  const totalPaid = timelineEvents
    .filter((e) => e.type === 'payment')
    .reduce((sum, e) => sum + e.amount, 0);
  const totalLateFees = timelineEvents
    .filter((e) => e.type === 'late_fee')
    .reduce((sum, e) => sum + e.amount, 0);
  const paymentCount = timelineEvents.filter((e) => e.type === 'payment').length;
  const chargeCount = timelineEvents.filter((e) => e.type === 'charge').length;
  const noteCount = timelineEvents.filter(
    (e) => e.type === 'dispute_note' || e.type === 'sms_reminder'
  ).length;

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const newNote: TimelineEvent = {
      id: `dispute-note-${Date.now()}`,
      type: 'dispute_note',
      date: new Date().toISOString().split('T')[0],
      period: 'Güncel Mutabakat',
      title: 'Yönetim Mutabakat / İhtilaf Notu',
      description: newNoteText.trim(),
      amount: 0,
      balanceAfter: unit.currentBalance,
      status: 'note',
      author: siteProfile.managementBoard[0] || 'Site Yöneticisi',
    };

    setDisputeNotes((prev) => [newNote, ...prev]);
    setNewNoteText('');
    setShowAddNoteForm(false);
  };

  const handleTriggerAutomatedReminder = (smsText?: string) => {
    const defaultText = formatAutomatedPaymentReminderSms(
      unit,
      siteProfile.siteName,
      Math.abs(unit.currentBalance)
    );
    const textToSend = smsText || defaultText;
    const today = new Date().toISOString().split('T')[0];

    const newSmsEvent: TimelineEvent = {
      id: `sms-remind-${Date.now()}`,
      type: 'sms_reminder',
      date: today,
      period: 'Güncel Dönem',
      title: '📲 Otomatik Ödeme Hatırlatması (SMS İletildi)',
      description: `Alıcı: ${unit.residentName} (${unit.phone || '05XX XXX XX XX'}) • Durum: GSM Operatörüne İletildi (200 OK). İletilen Metin: "${textToSend}"`,
      amount: 0,
      balanceAfter: unit.currentBalance,
      status: 'note',
      author: siteProfile.managementBoard[0] || 'Site Yönetimi',
      smsContent: textToSend,
    };

    setDisputeNotes((prev) => [newSmsEvent, ...prev]);
    setReminderAlert({
      phone: unit.phone || '05XX XXX XX XX',
      message: textToSend,
      timestamp: 'Bugün, ' + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    });

    if (onSendReminder) {
      onSendReminder(unit, textToSend);
    }
  };

  const handleConfirmQuickCollection = (
    targetUnit: ApartmentUnit,
    amount: number,
    method: PaymentMethod,
    receiptNo: string,
    sendSms: boolean
  ) => {
    if (onQuickCollect) {
      onQuickCollect(targetUnit, amount, method, receiptNo, sendSms);
    }
    const today = new Date().toISOString().split('T')[0];
    const quickPayNote: TimelineEvent = {
      id: `quickpay-note-${Date.now()}`,
      type: 'payment',
      date: today,
      period: 'Hızlı Tahsilat',
      title: `💳 Hızlı Tahsilat Alındı (${
        method === 'cash' ? 'Nakit Kasa' : method === 'bank_transfer' ? 'Banka Havalesi' : 'Kredi Kartı POS'
      })`,
      description: `Yönetici gişe işlemiyle ${formatCurrency(amount)} tutarındaki borç tahsil edildi ve cari hesap kapatıldı. Resmi Makbuz No: ${receiptNo}`,
      amount,
      balanceAfter: Math.min(0, targetUnit.currentBalance + amount),
      status: 'paid',
      author: siteProfile.managementBoard[0] || 'Site Yönetimi Gişe',
      receiptNo,
    };
    setDisputeNotes((prev) => [quickPayNote, ...prev]);
    setShowQuickCollectionModal(false);
  };

  const handlePrintStatement = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-5 sm:px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0 print:hidden">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center justify-center font-bold shrink-0">
              <History className="w-5 h-5 text-indigo-300" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-base tracking-tight truncate">
                  Cari Bakiye & Ödeme Zaman Çizelgesi
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 font-bold shrink-0">
                  İhtilaf Çözüm Masası
                </span>
              </div>
              <p className="text-xs text-slate-300 truncate">
                {siteProfile.siteName} • Daire Hesap Ekstresi & Ödeme Kronolojisi
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {/* Quick Unit Switcher */}
            <div className="relative hidden sm:block">
              <select
                value={unit.id}
                onChange={(e) => {
                  const target = allUnits.find((u) => u.id === e.target.value);
                  if (target) onSelectUnit(target);
                }}
                className="bg-slate-800/90 text-white text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                title="Başka bir dairenin zaman çizelgesine hızlı geçiş yap"
              >
                {allUnits.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.block} Blok D:{u.unitNo} - {u.residentName} (
                    {u.currentBalance === 0
                      ? '0 ₺'
                      : u.currentBalance < 0
                      ? `${formatCurrency(u.currentBalance)} Borç`
                      : `+${formatCurrency(u.currentBalance)} Avans`}
                    )
                  </option>
                ))}
              </select>
            </div>

            {/* Hızlı Ödeme Al Button */}
            <button
              onClick={() => setShowQuickCollectionModal(true)}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-xs transition flex items-center space-x-1.5 cursor-pointer shadow-xs ring-1 ring-emerald-400/50"
              title="Vadesi geçmiş borcu otomatik tahsil et ve hesabı kapat"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>Hızlı Ödeme Al</span>
            </button>

            {/* Gelişmiş Ödeme Raporu PDF Button */}
            <button
              onClick={() => setShowReportModal(true)}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition flex items-center space-x-1.5 cursor-pointer"
              title="Resmi Gelişmiş Ödeme Raporu oluştur ve PDF indir"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Gelişmiş Ödeme Raporu (PDF)</span>
            </button>

            {/* Yasal İhtarname PDF Button */}
            {hasOverdueBalance && (
              <button
                onClick={() => setShowLegalNoticeModal(true)}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
                title="Gecikmiş bakiye için resmi Yasal İhtarname oluştur ve PDF olarak kaydet"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Yasal İhtarname (PDF)</span>
              </button>
            )}

            {/* İletişim Günlüğü Button */}
            <button
              onClick={() => setShowCommLogModal(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
              title="Sakinle yapılan tüm SMS ve bildirim geçmişini incele"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>İletişim Günlüğü</span>
            </button>

            <button
              onClick={handlePrintStatement}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Cari Hesap Ekstresini Yazdır / PDF İndir"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Selected Unit Snapshot Hero Banner */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 sm:px-6 py-3.5 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white font-extrabold text-sm flex items-center justify-center shadow-sm shrink-0">
                {unit.block}:{unit.unitNo}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-sm sm:text-base text-slate-900">
                    {unit.residentName}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                      unit.residentType === 'owner'
                        ? 'bg-sky-50 text-sky-700 border-sky-200'
                        : 'bg-purple-50 text-purple-700 border-purple-200'
                    }`}
                  >
                    {unit.residentType === 'owner' ? 'Kat Maliki' : 'Kiracı'}
                  </span>
                  <span className="text-[11px] text-slate-400 hidden md:inline">
                    Kat {unit.floor} • {unit.grossM2} m² • Arsa Payı: {unit.landShare}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500 mt-0.5">
                  <span className="flex items-center space-x-1 font-mono">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{unit.phone || 'Telefon Kaydı Yok'}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span>{unit.email || 'E-posta Kaydı Yok'}</span>
                  </span>
                  {unit.plateNumber && (
                    <span className="flex items-center space-x-1 font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      <Car className="w-3 h-3 text-slate-400" />
                      <span>{unit.plateNumber}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Current Balance Tag & Automated Reminder Action */}
            <div className="flex items-center space-x-3 self-end sm:self-center">
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Cari Bakiye Durumu
                </span>
                <div
                  className={`text-lg sm:text-xl font-extrabold font-mono ${
                    unit.currentBalance < 0
                      ? 'text-rose-600'
                      : unit.currentBalance > 0
                      ? 'text-emerald-600'
                      : 'text-slate-800'
                  }`}
                >
                  {unit.currentBalance === 0 ? '0,00 ₺' : formatCurrency(unit.currentBalance)}
                </div>
                <span
                  className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    unit.currentBalance < 0
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : unit.currentBalance > 0
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {unit.currentBalance < 0
                    ? '⚠️ Ödenmemiş Borç Var'
                    : unit.currentBalance > 0
                    ? '✓ Fazla / Avans Bakiye'
                    : '✓ Bakiye Mutabık (Sıfır)'}
                </span>
              </div>

              <div className="flex flex-col gap-1.5 print:hidden">
                {/* Hızlı Ödeme Al Button */}
                <button
                  type="button"
                  onClick={() => setShowQuickCollectionModal(true)}
                  className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold rounded-xl text-xs transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer ring-1 ring-emerald-400/50"
                  title="Dairenin vadesi geçmiş borcunu tek tıkla tahsil et ve kapat"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                  <span>Hızlı Ödeme Al</span>
                </button>

                {/* Send Automated Payment Reminder Button specifically when unit has overdue balance */}
                {hasOverdueBalance && (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowReminderModal(true)}
                      className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold rounded-xl text-xs transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer ring-1 ring-amber-400/50"
                      title="Vadesi geçmiş aidat borcu için sakine otomatik SMS hatırlatması gönder"
                    >
                      <Smartphone className="w-3.5 h-3.5 text-slate-950" />
                      <span>Send Automated Payment Reminder</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowLegalNoticeModal(true)}
                      className="px-3 py-1.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-extrabold rounded-xl text-xs transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer ring-1 ring-rose-400/50"
                      title="Gecikmiş bakiye için resmi yasal ihtarname metni oluştur ve PDF olarak kaydet"
                    >
                      <Scale className="w-3.5 h-3.5 text-white" />
                      <span>Yasal İhtarname (PDF)</span>
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => setShowCommLogModal(true)}
                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs transition border border-emerald-200 flex items-center space-x-1 cursor-pointer"
                  title="Sakin iletişim günlüğünü aç"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>İletişim Günlüğü</span>
                </button>

                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => onEditResident(unit)}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 shadow-2xs transition-colors flex items-center space-x-1 cursor-pointer"
                    title="Daire borç veya iletişim bilgilerine doğrudan müdahale et"
                  >
                    <Edit3 className="w-3 h-3 text-indigo-600" />
                    <span>Düzeltme Yap</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowAddNoteForm(!showAddNoteForm)}
                    className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 rounded-xl text-xs font-semibold border border-indigo-200 transition-colors flex items-center space-x-1 cursor-pointer"
                  >
                    <MessageSquare className="w-3 h-3 text-indigo-600" />
                    <span>İhtilaf Notu</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reminder Sent Feedback Banner */}
        {reminderAlert && (
          <div className="px-5 sm:px-6 py-2.5 bg-emerald-50 border-b border-emerald-200 flex items-center justify-between text-xs text-emerald-900 animate-in fade-in shrink-0">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Send Automated Payment Reminder:</strong> {reminderAlert.phone} nolu telefona gecikmiş bakiye SMS hatırlatması başarıyla iletildi.
              </span>
            </div>
            <button
              onClick={() => setReminderAlert(null)}
              className="text-emerald-700 hover:text-emerald-900 font-bold text-xs"
            >
              Tamam
            </button>
          </div>
        )}

        {/* Dispute Resolution Note Form (Expandable) */}
        {showAddNoteForm && (
          <form
            onSubmit={handleAddNote}
            className="p-4 bg-indigo-50/70 border-b border-indigo-200 animate-in fade-in space-y-2 shrink-0"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-950 flex items-center space-x-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                <span>Bu Daire İçin Mutabakat & İhtilaf Notu Ekle</span>
              </span>
              <button
                type="button"
                onClick={() => setShowAddNoteForm(false)}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Kapat
              </button>
            </div>
            <textarea
              required
              rows={2}
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="Örn: Sakin ile telefon görüşmesi yapıldı. 15 Şubat tarihli Garanti BBVA banka dekontunu ibraz etti, inceleniyor..."
              className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 resize-none shadow-2xs"
            />
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowAddNoteForm(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Zaman Çizelgesine Notu Kaydet</span>
              </button>
            </div>
          </form>
        )}

        {/* Key Metrics KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-4 bg-white border-b border-slate-100 shrink-0">
          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Toplam Tahakkuk
            </span>
            <div className="text-sm sm:text-base font-extrabold text-slate-900 font-mono mt-0.5">
              {formatCurrency(totalBilled)}
            </div>
            <span className="text-[10px] text-slate-400">{chargeCount} Aylık Dönem</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
              Toplam Tahsil Edilen
            </span>
            <div className="text-sm sm:text-base font-extrabold text-emerald-700 font-mono mt-0.5">
              {formatCurrency(totalPaid)}
            </div>
            <span className="text-[10px] text-emerald-600">{paymentCount} Başarılı Tahsilat</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-amber-50/70 border border-amber-200/80">
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
              KMK Gecikme Zammı
            </span>
            <div className="text-sm sm:text-base font-extrabold text-amber-700 font-mono mt-0.5">
              {formatCurrency(totalLateFees)}
            </div>
            <span className="text-[10px] text-amber-600">%5 Kanuni Faiz Tahakkuku</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80">
            <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider block">
              Aylık Sabit Aidat
            </span>
            <div className="text-sm sm:text-base font-extrabold text-indigo-700 font-mono mt-0.5">
              {formatCurrency(unit.monthlyDues)}
            </div>
            <span className="text-[10px] text-indigo-600">Her Ayın 15'i Vade</span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="px-5 sm:px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0 print:hidden">
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                filterType === 'all'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              Tümü ({timelineEvents.length})
            </button>
            <button
              onClick={() => setFilterType('payment')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                filterType === 'payment'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              Tahsilatlar ({paymentCount})
            </button>
            <button
              onClick={() => setFilterType('charge')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                filterType === 'charge'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              Tahakkuklar ({chargeCount})
            </button>
            <button
              onClick={() => setFilterType('late_fee')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                filterType === 'late_fee'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              Gecikme Zammı
            </button>
            <button
              onClick={() => setFilterType('dispute_note')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                filterType === 'dispute_note'
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              Notlar & SMS ({noteCount})
            </button>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Makbuz, dekont ref veya açıklama..."
                className="w-full pl-8 pr-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center space-x-1 shrink-0 cursor-pointer"
              title="Sıralama yönünü değiştir"
            >
              <span>{sortOrder === 'desc' ? 'Yeniden Eskiye' : 'Eskiden Yeniye'}</span>
            </button>
          </div>
        </div>

        {/* Printable Formal Statement Header (Only visible when printed) */}
        <div className="hidden print:block p-6 border-b border-slate-300">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-bold text-slate-900">{siteProfile.siteName}</h1>
              <p className="text-xs text-slate-600">{siteProfile.address}</p>
              <p className="text-xs text-slate-600">
                Vergi No: {siteProfile.taxNumber} • {siteProfile.taxOffice}
              </p>
            </div>
            <div className="text-right">
              <h2 className="text-base font-bold text-slate-800">RESMİ CARİ HESAP EKSTRESİ</h2>
              <p className="text-xs text-slate-500">Tarih: {new Date().toLocaleDateString('tr-TR')}</p>
              <p className="text-xs font-mono font-bold text-slate-800">
                Bağımsız Bölüm: {unit.block} Blok Daire {unit.unitNo}
              </p>
              <p className="text-xs text-slate-700">Sakin: {unit.residentName}</p>
            </div>
          </div>
        </div>

        {/* Timeline Events Feed */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {displayEvents.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <History className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700">Kayıt Bulunamadı</h4>
              <p className="text-xs text-slate-400">
                Bu filtreye veya arama kriterine uygun bir zaman çizelgesi hareketi bulunmuyor.
              </p>
            </div>
          ) : (
            <div className="relative pl-6 sm:pl-8 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 space-y-6">
              {displayEvents.map((event) => {
                const isPayment = event.type === 'payment';
                const isLateFee = event.type === 'late_fee';
                const isDispute = event.type === 'dispute_note';
                const isSms = event.type === 'sms_reminder';

                return (
                  <div key={event.id} className="relative group">
                    {/* Node Dot / Icon */}
                    <div
                      className={`absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white shadow-2xs ${
                        isPayment
                          ? 'bg-emerald-600 text-white'
                          : isLateFee
                          ? 'bg-amber-500 text-white'
                          : isSms
                          ? 'bg-amber-600 text-white'
                          : isDispute
                          ? 'bg-purple-600 text-white'
                          : 'bg-indigo-600 text-white'
                      }`}
                    >
                      {isPayment ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : isLateFee ? (
                        <AlertTriangle className="w-3.5 h-3.5" />
                      ) : isSms ? (
                        <Smartphone className="w-3.5 h-3.5" />
                      ) : isDispute ? (
                        <MessageSquare className="w-3.5 h-3.5" />
                      ) : (
                        <Receipt className="w-3.5 h-3.5" />
                      )}
                    </div>

                    {/* Timeline Item Card */}
                    <div
                      className={`p-4 rounded-2xl border transition-all ${
                        isPayment
                          ? 'bg-white border-emerald-200 hover:border-emerald-300 shadow-2xs'
                          : isLateFee
                          ? 'bg-amber-50/40 border-amber-200 hover:border-amber-300 shadow-2xs'
                          : isSms
                          ? 'bg-amber-50/70 border-amber-300 hover:border-amber-400 shadow-xs'
                          : isDispute
                          ? 'bg-purple-50/40 border-purple-200 hover:border-purple-300 shadow-2xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        {/* Event Details */}
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-extrabold text-xs sm:text-sm text-slate-900">
                              {event.title}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-600 border border-slate-200">
                              {event.period}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {formatDate(event.date)}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed">
                            {event.description}
                          </p>

                          {/* Reference & Proof Badges */}
                          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                            {event.receiptNo && (
                              <span className="inline-flex items-center space-x-1 font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                                <span>Makbuz No:</span>
                                <strong className="text-indigo-900">{event.receiptNo}</strong>
                              </span>
                            )}

                            {event.transactionRef && (
                              <span className="inline-flex items-center space-x-1 font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                                <span>Ref:</span>
                                <strong className="text-slate-900">{event.transactionRef}</strong>
                              </span>
                            )}

                            {event.paymentMethod && (
                              <span className="inline-flex items-center space-x-1 text-slate-600">
                                <CreditCard className="w-3 h-3 text-emerald-600" />
                                <span>
                                  {event.paymentMethod === 'credit_card'
                                    ? 'Kredi Kartı (3D Secure)'
                                    : event.paymentMethod === 'bank_transfer'
                                    ? 'Banka Havalesi'
                                    : 'Kasa Nakit'}
                                </span>
                              </span>
                            )}

                            {event.author && (
                              <span className="inline-flex items-center space-x-1 text-purple-700 font-medium">
                                <User className="w-3 h-3" />
                                <span>Kaydeden: {event.author}</span>
                              </span>
                            )}

                            {isSms && (
                              <span className="inline-flex items-center space-x-1 text-amber-800 font-semibold bg-amber-100/80 px-2 py-0.5 rounded-md border border-amber-300">
                                <Smartphone className="w-3 h-3 text-amber-700" />
                                <span>Otomatik SMS Bildirimi</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Amount & Running Balance */}
                        <div className="text-left sm:text-right shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                          {event.amount > 0 && (
                            <div
                              className={`text-sm sm:text-base font-extrabold font-mono flex items-center sm:justify-end space-x-1 ${
                                isPayment ? 'text-emerald-600' : 'text-rose-600'
                              }`}
                            >
                              {isPayment ? (
                                <>
                                  <ArrowDownRight className="w-4 h-4" />
                                  <span>+{formatCurrency(event.amount)}</span>
                                </>
                              ) : (
                                <>
                                  <ArrowUpRight className="w-4 h-4" />
                                  <span>-{formatCurrency(event.amount)}</span>
                                </>
                              )}
                            </div>
                          )}

                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                            İşlem Sonrası Bakiye:{' '}
                            <strong
                              className={
                                event.balanceAfter < 0
                                   ? 'text-rose-600 font-bold'
                                  : event.balanceAfter > 0
                                  ? 'text-emerald-600 font-bold'
                                  : 'text-slate-700'
                              }
                            >
                              {event.balanceAfter === 0 ? '0 ₺' : formatCurrency(event.balanceAfter)}
                            </strong>
                          </div>

                          <div className="flex flex-col items-start sm:items-end gap-1 mt-1 print:hidden">
                            {/* Send Automated Payment Reminder button specifically on overdue items */}
                            {event.status === 'overdue' && (
                              <button
                                type="button"
                                onClick={() => setShowReminderModal(true)}
                                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-[11px] font-bold transition flex items-center space-x-1 cursor-pointer"
                                title="Bu vadesi geçmiş tahakkuk için sakine otomatik SMS hatırlatması ilet"
                              >
                                <Smartphone className="w-3 h-3 text-amber-700" />
                                <span>Send Automated Payment Reminder</span>
                              </button>
                            )}

                            {/* View Official Receipt Trigger */}
                            {event.dueRecord && onViewReceipt && (
                              <button
                                type="button"
                                onClick={() => onViewReceipt(event.dueRecord!)}
                                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold underline inline-flex items-center space-x-1 cursor-pointer"
                              >
                                <span>Resmi Makbuzu İncele</span>
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Audit Statement & Close Button */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              634 Sayılı Kat Mülkiyeti Kanunu ve KVKK Uyumlu İhtilaf Masası Kayıtları
            </span>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            {/* Hızlı Ödeme Al Button */}
            <button
              type="button"
              onClick={() => setShowQuickCollectionModal(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-extrabold transition shadow-xs flex items-center space-x-1.5 cursor-pointer ring-1 ring-emerald-400/50"
              title="Vadesi geçmiş borcu kapatmak için hızlı tahsilat yap"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>Hızlı Ödeme Al</span>
            </button>

            <button
              type="button"
              onClick={() => setShowReportModal(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center space-x-1.5 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Gelişmiş Ödeme Raporu (PDF)</span>
            </button>

            {hasOverdueBalance && (
              <>
                <button
                  type="button"
                  onClick={() => setShowReminderModal(true)}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-extrabold transition shadow-xs flex items-center space-x-1.5 cursor-pointer"
                >
                  <Smartphone className="w-3.5 h-3.5 text-slate-950" />
                  <span>Send Automated Payment Reminder</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowLegalNoticeModal(true)}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-extrabold transition shadow-xs flex items-center space-x-1.5 cursor-pointer"
                  title="Gecikmiş borç için resmi Yasal İhtarname oluştur ve PDF olarak kaydet"
                >
                  <Scale className="w-3.5 h-3.5 text-white" />
                  <span>Yasal İhtarname (PDF)</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => setShowCommLogModal(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center space-x-1.5 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>İletişim Günlüğü</span>
            </button>

            <button
              onClick={handlePrintStatement}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition shadow-2xs flex items-center space-x-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Ekstre Yazdır</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>

      {/* Automated Payment Reminder Modal */}
      {showReminderModal && (
        <AutomatedPaymentReminderModal
          unit={unit}
          siteProfile={siteProfile}
          onClose={() => setShowReminderModal(false)}
          onConfirmSend={(smsText) => {
            handleTriggerAutomatedReminder(smsText);
            setShowReminderModal(false);
          }}
        />
      )}

      {/* Advanced Payment Report Modal */}
      {showReportModal && (
        <AdvancedPaymentReportModal
          unit={unit}
          siteProfile={siteProfile}
          dues={dues}
          extraNotes={disputeNotes}
          onClose={() => setShowReportModal(false)}
          onViewReceipt={onViewReceipt}
        />
      )}

      {/* Legal Notice Modal */}
      {showLegalNoticeModal && (
        <LegalNoticeModal
          unit={unit}
          siteProfile={siteProfile}
          onClose={() => setShowLegalNoticeModal(false)}
          onNoticeDispatched={(details) => {
            const today = new Date().toISOString().split('T')[0];
            const newNoticeEvent: TimelineEvent = {
              id: `legal-notice-${Date.now()}`,
              type: 'dispute_note',
              date: today,
              period: 'Yasal İcra Süreci',
              title: '⚖️ Yasal İhtarname Düzenlendi (KMK Md. 20)',
              description: `Ref: ${details.noticeRef} • Toplam İhtar Tutarı: ${formatCurrency(
                details.totalAmount
              )} • Mehil Süresi: ${details.daysToPay} İş Günü. Alıcı: ${unit.residentName} (${
                unit.block
              } Blok D:${unit.unitNo}). Vadesinde ödenmediği takdirde icra takibi başlatılacaktır.`,
              amount: 0,
              balanceAfter: unit.currentBalance,
              status: 'overdue',
              author: siteProfile.managementBoard[0] || 'Site Yönetimi',
            };
            setDisputeNotes((prev) => [newNoticeEvent, ...prev]);
          }}
        />
      )}

      {/* Resident Communication Log Modal */}
      {showCommLogModal && (
        <ResidentCommunicationLogModal
          unit={unit}
          siteProfile={siteProfile}
          logs={getInitialUnitCommunicationLog(unit, siteProfile)}
          onClose={() => setShowCommLogModal(false)}
          onSendNewMessage={(newEntry) => {
            if (newEntry.channel === 'sms' && onSendReminder) {
              onSendReminder(unit, newEntry.message);
            }
          }}
          onOpenReport={() => setShowReportModal(true)}
          onOpenLegalNotice={() => setShowLegalNoticeModal(true)}
        />
      )}

      {/* Quick Collection Modal (Hızlı Ödeme Al & Otomatik Borç Kapatma) */}
      {showQuickCollectionModal && (
        <QuickCollectionModal
          unit={unit}
          siteProfile={siteProfile}
          onClose={() => setShowQuickCollectionModal(false)}
          onConfirm={handleConfirmQuickCollection}
        />
      )}
    </div>
  );
};
