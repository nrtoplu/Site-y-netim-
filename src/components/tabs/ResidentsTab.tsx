/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  UserCheck,
  UserX,
  Phone,
  Mail,
  Car,
  Home,
  Shield,
  Edit3,
  DollarSign,
  AlertCircle,
  KeyRound,
  Download,
  Plus,
  Sliders,
  History,
  Clock,
  Scale,
  Sparkles,
  HelpCircle,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  MessageSquare,
  Printer,
  ChevronDown,
  ChevronUp,
  FileText,
  Bell,
  PhoneCall,
  Send,
  Copy,
  Check,
  Zap,
  TrendingUp,
  Info,
} from 'lucide-react';
import { ApartmentUnit, BlockId, DuesRecord, SiteProfile, PaymentMethod } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  TimelineEvent,
  generateUnitTimelineEvents,
  formatAutomatedPaymentReminderSms,
} from '../../utils/unitTimeline';
import {
  CommunicationChannel,
  CommunicationLogEntry,
  getInitialUnitCommunicationLog,
} from '../../utils/communicationLog';
import { UnitTimelineModal } from '../modals/UnitTimelineModal';
import { AutomatedPaymentReminderModal } from '../modals/AutomatedPaymentReminderModal';
import { AdvancedPaymentReportModal } from '../modals/AdvancedPaymentReportModal';
import { LegalNoticeModal } from '../modals/LegalNoticeModal';
import { ResidentCommunicationLogModal } from '../modals/ResidentCommunicationLogModal';
import { QuickCollectionModal } from '../modals/QuickCollectionModal';

interface ResidentsTabProps {
  units: ApartmentUnit[];
  dues?: DuesRecord[];
  siteProfile?: SiteProfile;
  isResident: boolean;
  onEditResident: (unit: ApartmentUnit) => void;
  onSendResetPassword: (phone: string, name: string) => void;
  onImpersonateResident: (unit: ApartmentUnit) => void;
  onOpenResidentPermissionsModal?: () => void;
  onOpenRegisterModal?: () => void;
  onViewReceipt?: (due: DuesRecord) => void;
  onSendReminder?: (unit: ApartmentUnit, customMessage?: string) => void;
  onQuickCollect?: (
    unit: ApartmentUnit,
    amount?: number,
    method?: PaymentMethod,
    receiptNo?: string,
    sendSms?: boolean
  ) => void;
}

export const ResidentsTab: React.FC<ResidentsTabProps> = ({
  units,
  dues = [],
  siteProfile,
  isResident,
  onEditResident,
  onSendResetPassword,
  onImpersonateResident,
  onOpenResidentPermissionsModal,
  onOpenRegisterModal,
  onViewReceipt,
  onSendReminder,
  onQuickCollect,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBlock, setSelectedBlock] = useState<string>('all');
  const [filterType, setFilterType] = useState<'all' | 'debtors' | 'owners' | 'tenants'>('all');
  const [filterOverdueOnly, setFilterOverdueOnly] = useState<boolean>(false);
  const [showDuesBreakdownTooltip, setShowDuesBreakdownTooltip] = useState<boolean>(false);

  // Selected unit for inline timeline view
  const defaultSelectedUnit = useMemo(() => {
    return units.find((u) => u.currentBalance < 0) || units[0] || null;
  }, [units]);

  const [selectedTimelineUnit, setSelectedTimelineUnit] = useState<ApartmentUnit | null>(
    defaultSelectedUnit
  );
  const [isTimelineSectionExpanded, setIsTimelineSectionExpanded] = useState<boolean>(true);
  const [timelineFilter, setTimelineFilter] = useState<
    'all' | 'payment' | 'charge' | 'late_fee' | 'dispute_note'
  >('all');

  // Full-screen modal for formal print/deep inspection
  const [showFullModalUnit, setShowFullModalUnit] = useState<ApartmentUnit | null>(null);

  // Automated Payment Reminder Modal & alerts
  const [reminderModalUnit, setReminderModalUnit] = useState<ApartmentUnit | null>(null);
  const [reportUnit, setReportUnit] = useState<ApartmentUnit | null>(null);
  const [legalNoticeUnit, setLegalNoticeUnit] = useState<ApartmentUnit | null>(null);
  const [smsAlert, setSmsAlert] = useState<{
    unit: ApartmentUnit;
    message: string;
    timestamp: string;
  } | null>(null);
  const [legalNoticeAlert, setLegalNoticeAlert] = useState<{
    unit: ApartmentUnit;
    ref: string;
    amount: number;
    days: number;
  } | null>(null);

  // Extra dispute/SMS notes recorded during this session
  const [sessionNotes, setSessionNotes] = useState<Record<string, TimelineEvent[]>>({});

  // Sub-view panel tab: 'timeline' (Financial Chronology) vs 'communication' (Communication Log)
  const [selectedPanelTab, setSelectedPanelTab] = useState<'timeline' | 'communication'>('timeline');

  // Dedicated Communication Log Modal state
  const [communicationLogModalUnit, setCommunicationLogModalUnit] = useState<ApartmentUnit | null>(null);

  // Dynamic communication logs per unit
  const [unitCommunicationLogs, setUnitCommunicationLogs] = useState<
    Record<string, CommunicationLogEntry[]>
  >({});

  // Inline communication log filter & search
  const [commChannelFilter, setCommChannelFilter] = useState<'all' | CommunicationChannel>('all');
  const [commSearchQuery, setCommSearchQuery] = useState('');
  const [copiedLogId, setCopiedLogId] = useState<string | null>(null);

  // Inline Composer State
  const [showInlineComposer, setShowInlineComposer] = useState(false);
  const [inlineChannel, setInlineChannel] = useState<CommunicationChannel>('sms');
  const [inlineTitle, setInlineTitle] = useState('');
  const [inlineMessage, setInlineMessage] = useState('');
  const [inlineTemplate, setInlineTemplate] = useState('custom');
  const [inlineSuccessMsg, setInlineSuccessMsg] = useState<string | null>(null);

  // Quick Collection Modal state & Success alert
  const [quickCollectionUnit, setQuickCollectionUnit] = useState<ApartmentUnit | null>(null);
  const [quickCollectSuccessAlert, setQuickCollectSuccessAlert] = useState<{
    unit: ApartmentUnit;
    amount: number;
    receiptNo: string;
    date: string;
  } | null>(null);

  const filteredUnits = units.filter((u) => {
    const matchesSearch =
      u.residentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.unitNo.includes(searchQuery) ||
      u.phone.includes(searchQuery) ||
      (u.plateNumber && u.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (selectedBlock !== 'all' && u.block !== selectedBlock) return false;
    if (filterOverdueOnly && u.currentBalance >= 0) return false;
    if (filterType === 'debtors') return u.currentBalance < 0;
    if (filterType === 'owners') return u.residentType === 'owner';
    if (filterType === 'tenants') return u.residentType === 'tenant';
    return true;
  });

  const totalDebtors = units.filter((u) => u.currentBalance < 0).length;
  const totalDebtAmount = units
    .filter((u) => u.currentBalance < 0)
    .reduce((sum, u) => sum + Math.abs(u.currentBalance), 0);
  const totalOwners = units.filter((u) => u.residentType === 'owner').length;
  const totalTenants = units.filter((u) => u.residentType === 'tenant').length;

  // Collection & Outstanding Debt Metrics for the Current Period
  const periodCollectionMetrics = useMemo(() => {
    // Identify current active period (prefer 'Mart 2025' or latest available month in dues)
    const activePeriod =
      (dues && dues.length > 0 && (dues.find((d) => d.month === 'Mart 2025')?.month || dues[0].month)) ||
      'Mart 2025';

    const periodDues = dues && dues.length > 0 ? dues.filter((d) => d.month === activePeriod) : [];

    if (periodDues.length > 0) {
      const collectedAmount = periodDues
        .filter((d) => d.status === 'paid')
        .reduce((sum, d) => sum + d.amount + (d.lateFee || 0), 0);

      const outstandingDebtAmount = periodDues
        .filter((d) => d.status === 'pending' || d.status === 'overdue')
        .reduce((sum, d) => sum + d.amount + (d.lateFee || 0), 0);

      const overdueOnlyAmount = periodDues
        .filter((d) => d.status === 'overdue')
        .reduce((sum, d) => sum + d.amount + (d.lateFee || 0), 0);

      const totalExpected = collectedAmount + outstandingDebtAmount;
      const collectedPercentage =
        totalExpected > 0 ? Math.round((collectedAmount / totalExpected) * 100) : 0;
      const outstandingPercentage = 100 - collectedPercentage;

      const paidCount = periodDues.filter((d) => d.status === 'paid').length;
      const unpaidCount = periodDues.filter((d) => d.status !== 'paid').length;
      const overdueCount = periodDues.filter((d) => d.status === 'overdue').length;

      return {
        period: activePeriod,
        collectedAmount,
        outstandingDebtAmount,
        overdueOnlyAmount,
        totalExpected,
        collectedPercentage,
        outstandingPercentage,
        paidCount,
        unpaidCount,
        overdueCount,
        totalCount: periodDues.length,
      };
    }

    // Fallback: If no period dues records, compute from units directly
    const totalMonthly = units.reduce((sum, u) => sum + u.monthlyDues, 0);
    const totalDebt = units
      .filter((u) => u.currentBalance < 0)
      .reduce((sum, u) => sum + Math.abs(u.currentBalance), 0);
    const collected = Math.max(0, totalMonthly - totalDebt);
    const total = Math.max(totalMonthly, collected + totalDebt);
    const collectedPercentage = total > 0 ? Math.round((collected / total) * 100) : 0;
    const outstandingPercentage = 100 - collectedPercentage;

    return {
      period: activePeriod,
      collectedAmount: collected,
      outstandingDebtAmount: totalDebt,
      overdueOnlyAmount: totalDebt,
      totalExpected: total,
      collectedPercentage,
      outstandingPercentage,
      paidCount: units.filter((u) => u.currentBalance >= 0).length,
      unpaidCount: units.filter((u) => u.currentBalance < 0).length,
      overdueCount: units.filter((u) => u.currentBalance < 0).length,
      totalCount: units.length,
    };
  }, [dues, units]);

  const currentProfile: SiteProfile = siteProfile || {
    siteName: 'Zümrüt Park Konutları',
    address: 'Merkez Mah. Yönetim Ofisi',
    city: 'İstanbul',
    taxNumber: '1029384756',
    taxOffice: 'Ataşehir Vergi Dairesi',
    bankName: 'Garanti BBVA',
    iban: 'TR62 0006 2000 0012 3456 7890 12',
    accountHolder: 'Site Toplu Yapı Yönetim Kurulu',
    totalBlocks: 3,
    totalFlats: units.length,
    managementBoard: ['Kemal Ersoy (Yönetici)'],
    auditorName: 'Denetim Kurulu',
    reserveFundBalance: 0,
    operatingFundBalance: 0,
    emergencyPhone: '0850 000 00 00',
  };

  // Generate historical timeline events for the selected unit
  const activeTimelineUnit = selectedTimelineUnit || defaultSelectedUnit;
  const unitSessionNotes = activeTimelineUnit ? sessionNotes[activeTimelineUnit.id] || [] : [];

  const timelineEvents = useMemo(() => {
    if (!activeTimelineUnit) return [];
    return generateUnitTimelineEvents(activeTimelineUnit, dues, currentProfile, unitSessionNotes);
  }, [activeTimelineUnit, dues, currentProfile, unitSessionNotes]);

  const hasOverdueBalance =
    activeTimelineUnit &&
    (activeTimelineUnit.currentBalance < 0 || timelineEvents.some((e) => e.status === 'overdue'));

  const filteredTimelineEvents = useMemo(() => {
    let list = [...timelineEvents];
    if (timelineFilter !== 'all') {
      if (timelineFilter === 'dispute_note') {
        list = list.filter((e) => e.type === 'dispute_note' || e.type === 'sms_reminder');
      } else {
        list = list.filter((e) => e.type === timelineFilter);
      }
    }
    // Newest first for quick manager scanning
    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return list;
  }, [timelineEvents, timelineFilter]);

  // Helper to retrieve communication log for any unit
  const getUnitCommLogs = (targetUnit: ApartmentUnit): CommunicationLogEntry[] => {
    if (unitCommunicationLogs[targetUnit.id]) {
      return unitCommunicationLogs[targetUnit.id];
    }
    return getInitialUnitCommunicationLog(targetUnit, currentProfile);
  };

  const activeUnitCommLogs = useMemo(() => {
    if (!activeTimelineUnit) return [];
    return getUnitCommLogs(activeTimelineUnit);
  }, [activeTimelineUnit, unitCommunicationLogs, currentProfile]);

  const filteredCommLogs = useMemo(() => {
    let list = [...activeUnitCommLogs];

    if (commChannelFilter !== 'all') {
      list = list.filter((l) => l.channel === commChannelFilter);
    }

    if (commSearchQuery.trim()) {
      const q = commSearchQuery.toLowerCase();
      list = list.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.message.toLowerCase().includes(q) ||
          l.sender.toLowerCase().includes(q) ||
          (l.deliveryCode && l.deliveryCode.toLowerCase().includes(q))
      );
    }

    return list;
  }, [activeUnitCommLogs, commChannelFilter, commSearchQuery]);

  const handleAppendCommLog = (
    targetUnit: ApartmentUnit,
    newEntry: Omit<CommunicationLogEntry, 'id'>
  ) => {
    const entryWithId: CommunicationLogEntry = {
      ...newEntry,
      id: `comm-dyn-${Date.now()}`,
    };

    setUnitCommunicationLogs((prev) => {
      const currentList = prev[targetUnit.id] || getInitialUnitCommunicationLog(targetUnit, currentProfile);
      return {
        ...prev,
        [targetUnit.id]: [entryWithId, ...currentList],
      };
    });

    if (newEntry.channel === 'sms' && onSendReminder) {
      onSendReminder(targetUnit, newEntry.message);
    }
  };

  const handleSendAutomatedPaymentReminder = (targetUnit: ApartmentUnit, customText?: string) => {
    const textToSend =
      customText ||
      formatAutomatedPaymentReminderSms(
        targetUnit,
        currentProfile.siteName,
        Math.abs(targetUnit.currentBalance)
      );

    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    const newSmsEvent: TimelineEvent = {
      id: `sms-remind-${Date.now()}`,
      type: 'sms_reminder',
      date: today,
      period: 'Güncel Mutabakat',
      title: '📲 Otomatik Ödeme Hatırlatması (SMS İletildi)',
      description: `Alıcı: ${targetUnit.residentName} (${targetUnit.phone}) • Durum: GSM Operatörüne İletildi (200 OK). SMS: "${textToSend}"`,
      amount: 0,
      balanceAfter: targetUnit.currentBalance,
      status: 'note',
      author: currentProfile.managementBoard[0] || 'Site Yönetimi',
      smsContent: textToSend,
    };

    setSessionNotes((prev) => ({
      ...prev,
      [targetUnit.id]: [newSmsEvent, ...(prev[targetUnit.id] || [])],
    }));

    // Also register into Communication Log
    const newCommEntry: CommunicationLogEntry = {
      id: `comm-sms-${Date.now()}`,
      unitId: targetUnit.id,
      residentName: targetUnit.residentName,
      recipientPhone: targetUnit.phone,
      channel: 'sms',
      title: '📲 Otomatik Ödeme Hatırlatması (SMS)',
      message: textToSend,
      sentAt: today,
      timeStr: nowTime,
      sender: currentProfile.managementBoard[0] || 'Site Yönetimi',
      status: 'delivered',
      deliveryCode: 'GSM-OK-200',
      category: 'payment_reminder',
      meta: {
        overdueAmount: Math.abs(targetUnit.currentBalance),
        operatorResponse: 'DELIVERED_200_OK',
      },
    };

    setUnitCommunicationLogs((prev) => {
      const currentList = prev[targetUnit.id] || getInitialUnitCommunicationLog(targetUnit, currentProfile);
      return {
        ...prev,
        [targetUnit.id]: [newCommEntry, ...currentList],
      };
    });

    setSmsAlert({
      unit: targetUnit,
      message: textToSend,
      timestamp: 'Bugün, ' + nowTime,
    });

    if (onSendReminder) {
      onSendReminder(targetUnit, textToSend);
    }
  };

  const handleLegalNoticeDispatched = (
    targetUnit: ApartmentUnit,
    details: { noticeRef: string; totalAmount: number; daysToPay: number }
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    const newNoticeEvent: TimelineEvent = {
      id: `legal-notice-${Date.now()}`,
      type: 'dispute_note',
      date: today,
      period: 'Yasal İcra Süreci',
      title: '⚖️ Yasal İhtarname Düzenlendi (KMK Md. 20)',
      description: `Ref: ${details.noticeRef} • Toplam İhtar Tutarı: ${formatCurrency(
        details.totalAmount
      )} • Mehil Süresi: ${details.daysToPay} İş Günü. Alıcı: ${targetUnit.residentName} (${
        targetUnit.block
      } Blok D:${targetUnit.unitNo}). Vadesinde ödenmediği takdirde icra takibi başlatılacaktır.`,
      amount: 0,
      balanceAfter: targetUnit.currentBalance,
      status: 'overdue',
      author: currentProfile.managementBoard[0] || 'Site Yönetimi',
    };

    setSessionNotes((prev) => ({
      ...prev,
      [targetUnit.id]: [newNoticeEvent, ...(prev[targetUnit.id] || [])],
    }));

    // Also register into Communication Log
    const newLegalCommEntry: CommunicationLogEntry = {
      id: `comm-legal-${Date.now()}`,
      unitId: targetUnit.id,
      residentName: targetUnit.residentName,
      recipientPhone: targetUnit.phone,
      channel: 'legal_notice',
      title: '⚖️ 634 S. KMK Md. 20 Yasal İhtarname Tebliği',
      message: `Ref: ${details.noticeRef} • Toplam İhtar Tutarı: ${formatCurrency(
        details.totalAmount
      )} • Mehil Süresi: ${details.daysToPay} İş Günü. Alıcı: ${targetUnit.residentName} (${targetUnit.block} Blok D:${targetUnit.unitNo}). Vadesinde ödenmediği takdirde icra takibi başlatılacaktır.`,
      sentAt: today,
      timeStr: nowTime,
      sender: 'Site Hukuk Müşavirliği / Yönetim',
      status: 'delivered',
      deliveryCode: details.noticeRef,
      category: 'legal_notice',
      meta: {
        overdueAmount: details.totalAmount,
        noticeRef: details.noticeRef,
      },
    };

    setUnitCommunicationLogs((prev) => {
      const currentList = prev[targetUnit.id] || getInitialUnitCommunicationLog(targetUnit, currentProfile);
      return {
        ...prev,
        [targetUnit.id]: [newLegalCommEntry, ...currentList],
      };
    });

    setLegalNoticeAlert({
      unit: targetUnit,
      ref: details.noticeRef,
      amount: details.totalAmount,
      days: details.daysToPay,
    });
  };

  const handleOpenQuickCollection = (targetUnit: ApartmentUnit) => {
    setSelectedTimelineUnit(targetUnit);
    setQuickCollectionUnit(targetUnit);
  };

  const handleConfirmQuickCollection = (
    targetUnit: ApartmentUnit,
    collectedAmount: number,
    method: PaymentMethod,
    receiptNo: string,
    sendSms: boolean
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    // 1. Parent App handler
    if (onQuickCollect) {
      onQuickCollect(targetUnit, collectedAmount, method, receiptNo, sendSms);
    }

    // 2. Add to Timeline Events
    const methodLabel =
      method === 'cash' ? 'Nakit Kasa' : method === 'bank_transfer' ? 'Banka Havalesi' : 'Kredi Kartı POS';
    const newPaymentEvent: TimelineEvent = {
      id: `event-quickpay-${Date.now()}`,
      type: 'payment',
      date: today,
      period: 'Hızlı Tahsilat',
      title: `💳 Hızlı Tahsilat Alındı (${methodLabel})`,
      description: `Yönetici gişe işlemiyle ${formatCurrency(collectedAmount)} tutarındaki borç tahsil edildi ve cari hesap kapatıldı. Resmi Makbuz No: ${receiptNo}`,
      amount: collectedAmount,
      balanceAfter: Math.min(0, targetUnit.currentBalance + collectedAmount),
      status: 'paid',
      author: currentProfile.managementBoard[0] || 'Site Yönetimi',
      receiptNo,
    };

    setSessionNotes((prev) => ({
      ...prev,
      [targetUnit.id]: [newPaymentEvent, ...(prev[targetUnit.id] || [])],
    }));

    // 3. If sendSms, log to Communication Log
    if (sendSms) {
      const smsText = `Sayın ${targetUnit.residentName}, ${currentProfile.siteName} ${targetUnit.block} Blok D:${targetUnit.unitNo} no'lu dairenize ait ${formatCurrency(
        collectedAmount
      )} tutarındaki aidat borcunuz site yönetimi tarafından tahsil edilmiş ve cari hesabınız kapatılmıştır. Resmi Makbuz No: ${receiptNo}.`;

      const newCommEntry: CommunicationLogEntry = {
        id: `comm-quickpay-${Date.now()}`,
        unitId: targetUnit.id,
        residentName: targetUnit.residentName,
        recipientPhone: targetUnit.phone,
        channel: 'sms',
        title: '💳 Hızlı Tahsilat Makbuzu (SMS İletildi)',
        message: smsText,
        sentAt: today,
        timeStr: nowTime,
        sender: currentProfile.managementBoard[0] || 'Site Yönetimi Gişe',
        status: 'delivered',
        deliveryCode: `GSM-MAK-${receiptNo}`,
        category: 'payment_reminder',
        meta: {
          overdueAmount: collectedAmount,
          noticeRef: receiptNo,
          operatorResponse: 'DELIVERED_200_OK',
        },
      };

      setUnitCommunicationLogs((prev) => {
        const currentList = prev[targetUnit.id] || getInitialUnitCommunicationLog(targetUnit, currentProfile);
        return {
          ...prev,
          [targetUnit.id]: [newCommEntry, ...currentList],
        };
      });
    }

    // 4. Set Success Alert Banner
    setQuickCollectSuccessAlert({
      unit: targetUnit,
      amount: collectedAmount,
      receiptNo,
      date: `Bugün, ${nowTime}`,
    });

    // 5. Close Modal
    setQuickCollectionUnit(null);
  };

  const handleInlineSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTimelineUnit || !inlineTitle.trim() || !inlineMessage.trim()) return;

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const time = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    let deliveryCode = 'GSM-OK-200';
    if (inlineChannel === 'push') deliveryCode = 'FCM-PUSH-OK';
    else if (inlineChannel === 'legal_notice') deliveryCode = `IHT-${activeTimelineUnit.unitNo}-${Date.now().toString().slice(-4)}`;
    else if (inlineChannel === 'email') deliveryCode = 'SMTP-SENT-250';
    else if (inlineChannel === 'call_note') deliveryCode = 'GSM-CALL-LOG';

    handleAppendCommLog(activeTimelineUnit, {
      unitId: activeTimelineUnit.id,
      residentName: activeTimelineUnit.residentName,
      recipientPhone: activeTimelineUnit.phone,
      recipientEmail: activeTimelineUnit.email,
      channel: inlineChannel,
      title: inlineTitle.trim(),
      message: inlineMessage.trim(),
      sentAt: today,
      timeStr: time,
      sender: currentProfile.managementBoard[0] || 'Site Yönetimi',
      status: 'delivered',
      deliveryCode,
      category: inlineChannel === 'legal_notice' ? 'legal_notice' : inlineChannel === 'sms' ? 'payment_reminder' : 'announcement',
      meta: {
        overdueAmount: activeTimelineUnit.currentBalance < 0 ? Math.abs(activeTimelineUnit.currentBalance) : undefined,
        operatorResponse: 'OPERATOR_ACCEPTED_DELIVERED',
      },
    });

    setShowInlineComposer(false);
    setInlineTitle('');
    setInlineMessage('');
    setInlineSuccessMsg(`${inlineChannel === 'sms' ? 'SMS' : 'Bildirim'} başarıyla gönderildi ve iletişim günlüğüne işlendi.`);
    setTimeout(() => setInlineSuccessMsg(null), 4000);
  };

  if (isResident) {
    return (
      <div className="bg-white border border-rose-200 rounded-2xl p-8 text-center space-y-4 shadow-sm max-w-2xl mx-auto my-12">
        <div className="w-14 h-14 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-center mx-auto text-rose-600">
          <Shield className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-900">
            Erişim Yetkisi Sınırlandırıldı (Kısıtlı Görünüm)
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            6698 Sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ve Kat Mülkiyeti Kanunu uyarınca,
            diğer site sakinlerinin ad, soyad, telefon, plaka ve bireysel borç kayıtları kat
            sakinlerine kapalıdır.
          </p>
        </div>
        <div className="pt-2">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold">
            <AlertCircle className="w-4 h-4" />
            <span>Bu ekran yalnızca Site Yönetim Kurulu ve Denetim yetkililerine açıktır.</span>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Sakinler & Daire Hesapları Yönetimi</span>
          </h2>
          <p className="text-xs text-slate-500">
            Daire sakinlerinin iletişim bilgileri, ikamet türleri ve cari bakiye/borç hesaplarına
            doğrudan müdahale edin.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Trigger for Timeline Modal */}
          <button
            onClick={() => {
              const target = selectedTimelineUnit || defaultSelectedUnit;
              if (target) setShowFullModalUnit(target);
            }}
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
            title="Dairelerin geçmiş bakiye ve ödeme hareketleri zaman çizelgesini incele (İhtilaf Çözümü)"
          >
            <History className="w-3.5 h-3.5 text-slate-950" />
            <span>Ödeme Zaman Çizelgesi & İhtilaf Masası</span>
          </button>

          {/* Gelişmiş Ödeme Raporu (PDF) Button */}
          <button
            onClick={() => {
              const target = selectedTimelineUnit || defaultSelectedUnit;
              if (target) setReportUnit(target);
            }}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
            title="Seçili daire için resmi Gelişmiş Ödeme Raporu oluştur ve indirilebilir PDF formatında dışa aktar"
          >
            <FileText className="w-3.5 h-3.5 text-white" />
            <span>Gelişmiş Ödeme Raporu (PDF)</span>
          </button>

          {/* İletişim Günlüğü (SMS & Bildirim) Button */}
          <button
            onClick={() => {
              const target = selectedTimelineUnit || defaultSelectedUnit;
              if (target) {
                setSelectedTimelineUnit(target);
                setCommunicationLogModalUnit(target);
              }
            }}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
            title="Seçili sakin ile yapılan tüm SMS ve bildirim geçmişini İletişim Günlüğü formatında görüntüle"
          >
            <MessageSquare className="w-3.5 h-3.5 text-white" />
            <span>İletişim Günlüğü (SMS & Bildirim)</span>
          </button>

          {/* Yasal İhtarname (PDF) Button */}
          {totalDebtors > 0 && (
            <button
              onClick={() => {
                const target =
                  selectedTimelineUnit && selectedTimelineUnit.currentBalance < 0
                    ? selectedTimelineUnit
                    : units.find((u) => u.currentBalance < 0) || defaultSelectedUnit;
                if (target) setLegalNoticeUnit(target);
              }}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
              title="Gecikmiş bakiyesi bulunan sakinler için resmi yasal ihtarname metni oluştur ve PDF olarak kaydet"
            >
              <Scale className="w-3.5 h-3.5 text-white" />
              <span>Yasal İhtarname (PDF)</span>
            </button>
          )}

          {onOpenResidentPermissionsModal && (
            <button
              onClick={onOpenResidentPermissionsModal}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
              title="Site sakinlerinin gördüğü menüleri aktif veya pasif yapın"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Sakin Menü İzinleri (Aktif / Pasif)</span>
            </button>
          )}

          {onOpenRegisterModal && (
            <button
              onClick={onOpenRegisterModal}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
              title="Siteye yeni sakin kayıt veya ikametgah başvurusu ekle"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Yeni Sakin Kaydı Ekle</span>
            </button>
          )}

          <span className="text-xs font-semibold px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-200">
            {units.length} Bağımsız Bölüm Kayıtlı
          </span>
        </div>
      </div>

      {/* SMS Dispatched Alert Banner */}
      {smsAlert && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start justify-between gap-3 text-xs text-emerald-900 shadow-xs animate-in fade-in">
          <div className="flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center space-x-2">
                <strong className="font-extrabold text-emerald-950 text-sm">
                  Send Automated Payment Reminder: SMS Başarıyla İletildi
                </strong>
                <span className="text-[10px] bg-emerald-200 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  GSM 200 OK
                </span>
              </div>
              <p className="text-emerald-800 mt-1 leading-relaxed">
                <strong>{smsAlert.unit.residentName}</strong> ({smsAlert.unit.block} Blok D:
                {smsAlert.unit.unitNo}, {smsAlert.unit.phone}) sakinine vadesi geçmiş aidat borcu
                için önceden formatlanmış SMS bildirimi gönderildi ve zaman çizelgesine resmi kayıt
                işlendi.
              </p>
              <div className="mt-2 p-2 bg-white/80 border border-emerald-200 rounded-xl font-mono text-[11px] text-emerald-950">
                "{smsAlert.message}"
              </div>
            </div>
          </div>
          <button
            onClick={() => setSmsAlert(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold text-xs shrink-0 cursor-pointer"
          >
            Kapat
          </button>
        </div>
      )}

      {/* Legal Notice Dispatched Alert Banner */}
      {legalNoticeAlert && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start justify-between gap-3 text-xs text-rose-950 shadow-xs animate-in fade-in">
          <div className="flex items-start space-x-3">
            <Scale className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center space-x-2">
                <strong className="font-extrabold text-rose-950 text-sm">
                  Yasal İhtarname Düzenlendi ve Zaman Çizelgesine İşlendi
                </strong>
                <span className="text-[10px] bg-rose-200 text-rose-900 font-bold px-2 py-0.5 rounded-full font-mono">
                  {legalNoticeAlert.ref}
                </span>
                <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                  Mehil: {legalNoticeAlert.days} İş Günü
                </span>
              </div>
              <p className="text-rose-800 mt-1 leading-relaxed">
                <strong>{legalNoticeAlert.unit.residentName}</strong> ({legalNoticeAlert.unit.block} Blok D:
                {legalNoticeAlert.unit.unitNo}) sakinine ait toplam <strong>{formatCurrency(legalNoticeAlert.amount)}</strong> tutarındaki gecikmiş ortak gider aidat ve kanuni gecikme tazminatı borcu için resmi yasal ihtarname metni tanzim edildi, PDF olarak dışa aktarıldı ve resmi icra süreci öncesi kaydı tamamlandı.
              </p>
            </div>
          </div>
          <button
            onClick={() => setLegalNoticeAlert(null)}
            className="text-rose-700 hover:text-rose-900 font-bold text-xs shrink-0 cursor-pointer"
          >
            Kapat
          </button>
        </div>
      )}

      {/* Quick Collect Success Alert Banner */}
      {quickCollectSuccessAlert && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start justify-between gap-3 text-xs text-emerald-950 shadow-xs animate-in fade-in">
          <div className="flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center space-x-2">
                <strong className="font-extrabold text-emerald-950 text-sm">
                  Hızlı Ödeme Tahsilatı Başarıyla Alındı ✓
                </strong>
                <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded-full font-mono">
                  Makbuz: {quickCollectSuccessAlert.receiptNo}
                </span>
                <span className="text-[10px] bg-teal-100 text-teal-900 font-bold px-2 py-0.5 rounded-full">
                  {quickCollectSuccessAlert.date}
                </span>
              </div>
              <p className="text-emerald-800 mt-1 leading-relaxed">
                <strong>{quickCollectSuccessAlert.unit.residentName}</strong> ({quickCollectSuccessAlert.unit.block} Blok D:{quickCollectSuccessAlert.unit.unitNo}) sakinine ait <strong>{formatCurrency(quickCollectSuccessAlert.amount)}</strong> tutarındaki vadesi geçmiş borç tahsil edilmiş olarak işaretlendi, cari bakiye kapatıldı ve tahsilat SMS'i iletildi.
              </p>
              <div className="mt-2.5 flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTimelineUnit(quickCollectSuccessAlert.unit);
                    setSelectedPanelTab('communication');
                  }}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>İletişim Günlüğünü Aç</span>
                </button>
                {onViewReceipt && (
                  <button
                    type="button"
                    onClick={() => {
                      const matchedDue = dues.find(
                        (d) => d.unitId === quickCollectSuccessAlert.unit.id && d.status === 'paid'
                      );
                      if (matchedDue) onViewReceipt(matchedDue);
                    }}
                    className="px-3 py-1 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                  >
                    <Receipt className="w-3 h-3 text-emerald-600" />
                    <span>Resmi E-Makbuzu Görüntüle</span>
                  </button>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => setQuickCollectSuccessAlert(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold text-xs shrink-0 cursor-pointer"
          >
            Kapat
          </button>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-slate-500 text-xs font-medium block">Kat Malikleri (Ev Sahibi)</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">
            {totalOwners} <span className="text-xs font-sans text-slate-400 font-normal">Daire</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-slate-500 text-xs font-medium block">Kiracı Sakinler</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">
            {totalTenants} <span className="text-xs font-sans text-slate-400 font-normal">Daire</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-slate-500 text-xs font-medium block">Borçlu Sakin Sayısı</span>
          <div className="text-2xl font-extrabold text-rose-600 mt-1 font-mono">
            {totalDebtors} <span className="text-xs font-sans text-rose-400 font-normal">Daire</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-slate-500 text-xs font-medium block">Toplam Birikmiş Borç</span>
          <div className="text-2xl font-extrabold text-rose-600 mt-1 font-mono">
            {formatCurrency(totalDebtAmount)}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* INTEGRATED TIMELINE VIEW SECTION (Dispute Resolution & Payment Activity)   */}
      {/* ========================================================================= */}
      {activeTimelineUnit && (
        <div className="bg-white border-2 border-indigo-100 rounded-3xl shadow-sm overflow-hidden transition-all">
          {/* Timeline View Header & Unit Selector */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-400/30 flex items-center justify-center font-bold shrink-0">
                <History className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-extrabold text-sm sm:text-base tracking-tight">
                    Daire Cari Bakiye & Ödeme Zaman Çizelgesi
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-300 border border-amber-400/30 font-bold shrink-0">
                    İhtilaf Masası (Timeline View)
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Seçili dairenin tahakkuk, tahsilat, banka dekontu ve bakiye geçmişini inceleyin.
                </p>
              </div>
            </div>

            {/* Controls: Unit Dropdown & Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Unit Dropdown Selector */}
              <div className="relative">
                <select
                  value={activeTimelineUnit.id}
                  onChange={(e) => {
                    const target = units.find((u) => u.id === e.target.value);
                    if (target) setSelectedTimelineUnit(target);
                  }}
                  className="bg-slate-800 text-white text-xs font-semibold px-3 py-2 rounded-xl border border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-amber-500 cursor-pointer"
                  title="İncelenecek daireyi seçin"
                >
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.block} Blok D:{u.unitNo} - {u.residentName} (
                      {u.currentBalance === 0
                        ? '0 ₺ Mutabık'
                        : u.currentBalance < 0
                        ? `${formatCurrency(u.currentBalance)} Borç`
                        : `+${formatCurrency(u.currentBalance)} Avans`}
                      )
                    </option>
                  ))}
                </select>
              </div>

              {/* 'Send Automated Payment Reminder' Button specifically when unit has overdue balance */}
              {hasOverdueBalance && (
                <button
                  type="button"
                  onClick={() => setReminderModalUnit(activeTimelineUnit)}
                  className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-xl text-xs font-extrabold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer ring-1 ring-amber-400/50"
                  title="Vadesi geçmiş borç için sakine önceden formatlanmış SMS bildirimi ilet"
                >
                  <Smartphone className="w-4 h-4 text-slate-950" />
                  <span>Send Automated Payment Reminder</span>
                </button>
              )}

              {/* 'Yasal İhtarname (PDF)' Button specifically when unit has overdue balance */}
              {hasOverdueBalance && (
                <button
                  type="button"
                  onClick={() => setLegalNoticeUnit(activeTimelineUnit)}
                  className="px-3.5 py-2 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white rounded-xl text-xs font-extrabold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer ring-1 ring-rose-400/50"
                  title="Gecikmiş bakiyesi bulunan sakin için resmi Yasal İhtarname oluştur ve PDF olarak kaydet"
                >
                  <Scale className="w-4 h-4 text-white" />
                  <span>Yasal İhtarname (PDF)</span>
                </button>
              )}

              {/* Gelişmiş Ödeme Raporu (PDF) Button */}
              <button
                type="button"
                onClick={() => setReportUnit(activeTimelineUnit)}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
                title="Seçili daire için resmi Gelişmiş Ödeme Raporu oluştur ve indirilebilir PDF formatında dışa aktar"
              >
                <FileText className="w-4 h-4 text-white" />
                <span>Gelişmiş Ödeme Raporu (PDF)</span>
              </button>

              {/* İletişim Günlüğü (Communication Log) Toggle Button */}
              <button
                type="button"
                onClick={() => {
                  setSelectedPanelTab(
                    selectedPanelTab === 'communication' ? 'timeline' : 'communication'
                  );
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer ${
                  selectedPanelTab === 'communication'
                    ? 'bg-emerald-500 text-slate-950 font-extrabold ring-2 ring-emerald-300'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
                title="Seçili sakine ait SMS ve bildirim günlüğünü görüntüle veya gizle"
              >
                <MessageSquare className="w-4 h-4" />
                <span>İletişim Günlüğü</span>
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-slate-950/30 text-white">
                  {activeUnitCommLogs.length}
                </span>
              </button>

              {/* Full-Screen Detailed Statement Modal */}
              <button
                type="button"
                onClick={() => setShowFullModalUnit(activeTimelineUnit)}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition flex items-center space-x-1.5 cursor-pointer"
                title="Cari hesap ekstresini yazdır veya tam ekranda aç"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ekstre / Yazdır</span>
              </button>

              {/* Accordion Collapse/Expand Toggle */}
              <button
                type="button"
                onClick={() => setIsTimelineSectionExpanded(!isTimelineSectionExpanded)}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
                title={isTimelineSectionExpanded ? 'Paneli Küçült' : 'Paneli Genişlet'}
              >
                {isTimelineSectionExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Collapsible Content */}
          {isTimelineSectionExpanded && (
            <div className="p-4 sm:p-6 space-y-4">
              {/* Selected Unit Snapshot Bar */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-extrabold text-sm flex items-center justify-center shadow-xs shrink-0">
                    {activeTimelineUnit.block}:{activeTimelineUnit.unitNo}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                        {activeTimelineUnit.residentName}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                          activeTimelineUnit.residentType === 'owner'
                            ? 'bg-sky-50 text-sky-700 border-sky-200'
                            : 'bg-purple-50 text-purple-700 border-purple-200'
                        }`}
                      >
                        {activeTimelineUnit.residentType === 'owner' ? 'Kat Maliki' : 'Kiracı'}
                      </span>
                      <span className="text-xs text-slate-400 hidden sm:inline">
                        Kat {activeTimelineUnit.floor} • {activeTimelineUnit.grossM2} m²
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center space-x-1 font-mono">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{activeTimelineUnit.phone || 'Telefon Kaydı Yok'}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{activeTimelineUnit.email || 'E-posta Yok'}</span>
                      </span>
                      {activeTimelineUnit.plateNumber && (
                        <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded-md border border-slate-200">
                          🚗 {activeTimelineUnit.plateNumber}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Balance & Automated Reminder Action */}
                <div className="flex items-center space-x-3 self-end md:self-center">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Cari Bakiye Durumu
                    </span>
                    <span
                      className={`text-lg sm:text-xl font-extrabold font-mono ${
                        activeTimelineUnit.currentBalance < 0
                          ? 'text-rose-600'
                          : activeTimelineUnit.currentBalance > 0
                          ? 'text-emerald-600'
                          : 'text-slate-800'
                      }`}
                    >
                      {activeTimelineUnit.currentBalance === 0
                        ? '0,00 ₺ (Mutabık)'
                        : formatCurrency(activeTimelineUnit.currentBalance)}
                    </span>
                    <div className="text-[10px] text-slate-400">
                      Aylık Aidat: {formatCurrency(activeTimelineUnit.monthlyDues)}
                    </div>
                  </div>

                  {/* Send Automated Payment Reminder button specifically when unit has overdue balance */}
                  {hasOverdueBalance ? (
                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5">
                      {/* Hızlı Ödeme Al button */}
                      <button
                        type="button"
                        onClick={() => handleOpenQuickCollection(activeTimelineUnit)}
                        className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-extrabold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer ring-1 ring-emerald-400/50"
                        title="Vadesi geçmiş borcu otomatik tahsil et ve kapat"
                      >
                        <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                        <span>Hızlı Ödeme Al</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setReminderModalUnit(activeTimelineUnit)}
                        className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-xl text-xs font-extrabold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer ring-1 ring-amber-400/50"
                        title="Vadesi geçmiş borç için sakine önceden formatlanmış SMS bildirimi ilet"
                      >
                        <Smartphone className="w-4 h-4 text-slate-950" />
                        <span>Send Automated Payment Reminder</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setReportUnit(activeTimelineUnit)}
                        className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 rounded-xl text-xs font-bold border border-indigo-200 transition flex items-center space-x-1.5 cursor-pointer"
                        title="Gelişmiş Ödeme Raporu oluştur ve PDF formatında indir"
                      >
                        <FileText className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Rapor (PDF)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setLegalNoticeUnit(activeTimelineUnit)}
                        className="px-3.5 py-2 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white rounded-xl text-xs font-extrabold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer ring-1 ring-rose-400/50"
                        title="Gecikmiş bakiyesi bulunan sakin için resmi yasal ihtarname metni oluştur ve PDF olarak kaydet"
                      >
                        <Scale className="w-4 h-4 text-white" />
                        <span>Yasal İhtarname (PDF)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedPanelTab('communication')}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                          selectedPanelTab === 'communication'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                        title="Bu sakine ait tüm SMS ve bildirim günlüğünü görüntüle"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>İletişim Günlüğü ({activeUnitCommLogs.length})</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      {/* Hızlı Ödeme Al button */}
                      <button
                        type="button"
                        onClick={() => handleOpenQuickCollection(activeTimelineUnit)}
                        className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-300 transition flex items-center space-x-1.5 cursor-pointer"
                        title="Aidat tahsilatı yap"
                      >
                        <Zap className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Hızlı Ödeme Al</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setReportUnit(activeTimelineUnit)}
                        className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 rounded-xl text-xs font-bold border border-indigo-200 transition flex items-center space-x-1.5 cursor-pointer"
                        title="Gelişmiş Ödeme Raporu oluştur ve PDF formatında indir"
                      >
                        <FileText className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Rapor (PDF)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedPanelTab('communication')}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                          selectedPanelTab === 'communication'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                        title="Bu sakine ait tüm SMS ve bildirim günlüğünü görüntüle"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>İletişim Günlüğü ({activeUnitCommLogs.length})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onEditResident(activeTimelineUnit)}
                        className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 shadow-2xs transition flex items-center space-x-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Hesaba Müdahale</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Sub-view Switcher Tabs: Timeline vs Communication Log */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3 pt-1">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPanelTab('timeline')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                      selectedPanelTab === 'timeline'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>Cari Bakiye & Finansal Kronoloji</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPanelTab('communication')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                      selectedPanelTab === 'communication'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>İletişim Günlüğü & SMS Bildirimleri</span>
                    <span
                      className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                        selectedPanelTab === 'communication'
                          ? 'bg-white/20 text-white'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {activeUnitCommLogs.length}
                    </span>
                  </button>
                </div>

                {selectedPanelTab === 'communication' && (
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowInlineComposer(!showInlineComposer)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center space-x-1 cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                      <span>{showInlineComposer ? 'Formu Gizle' : 'Yeni SMS / Bildirim'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCommunicationLogModalUnit(activeTimelineUnit)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition flex items-center space-x-1 cursor-pointer"
                      title="İletişim günlüğünü tam ekran detay penceresinde aç"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span className="hidden sm:inline">Tam Ekran</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Sub-view: Timeline View */}
              {selectedPanelTab === 'timeline' && (
                <>
                  {/* Timeline Filters */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-b border-slate-100 pb-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-700 mr-1 flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Hareket Filtresi:</span>
                      </span>
                      <button
                        onClick={() => setTimelineFilter('all')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          timelineFilter === 'all'
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Tümü ({timelineEvents.length})
                      </button>
                      <button
                        onClick={() => setTimelineFilter('payment')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          timelineFilter === 'payment'
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Tahsilatlar
                      </button>
                      <button
                        onClick={() => setTimelineFilter('charge')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          timelineFilter === 'charge'
                            ? 'bg-slate-900 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Tahakkuklar
                      </button>
                      <button
                        onClick={() => setTimelineFilter('late_fee')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          timelineFilter === 'late_fee'
                            ? 'bg-amber-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Gecikme Zammı
                      </button>
                      <button
                        onClick={() => setTimelineFilter('dispute_note')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          timelineFilter === 'dispute_note'
                            ? 'bg-purple-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Notlar & SMS
                      </button>
                    </div>

                    <div className="text-xs text-slate-500 font-medium">
                      {filteredTimelineEvents.length} Kayıt Gösteriliyor
                    </div>
                  </div>

                  {/* Timeline Feed Stream */}
                  <div className="relative pl-6 sm:pl-8 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 space-y-4 max-h-[380px] overflow-y-auto pr-1">
                    {filteredTimelineEvents.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 text-xs">
                        Bu filtreye uygun geçmiş hareket bulunmuyor.
                      </div>
                    ) : (
                      filteredTimelineEvents.map((event) => {
                        const isPayment = event.type === 'payment';
                        const isLateFee = event.type === 'late_fee';
                        const isDispute = event.type === 'dispute_note';
                        const isSms = event.type === 'sms_reminder';

                        return (
                          <div key={event.id} className="relative group">
                            {/* Node Icon Dot */}
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

                            {/* Card */}
                            <div
                              className={`p-3.5 rounded-2xl border transition-all ${
                                isPayment
                                  ? 'bg-white border-emerald-200 hover:border-emerald-300'
                                  : isLateFee
                                  ? 'bg-amber-50/50 border-amber-200 hover:border-amber-300'
                                  : isSms
                                  ? 'bg-amber-50/80 border-amber-300 hover:border-amber-400'
                                  : isDispute
                                  ? 'bg-purple-50/50 border-purple-200 hover:border-purple-300'
                                  : 'bg-white border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                <div className="space-y-1">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="font-bold text-xs text-slate-900">
                                      {event.title}
                                    </span>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-600">
                                      {event.period}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      {formatDate(event.date)}
                                    </span>
                                  </div>

                                  <p className="text-xs text-slate-600 leading-relaxed">
                                    {event.description}
                                  </p>

                                  {/* Badges */}
                                  <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[11px]">
                                    {event.receiptNo && (
                                      <span className="font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                                        Makbuz: <strong className="text-indigo-900">{event.receiptNo}</strong>
                                      </span>
                                    )}
                                    {event.transactionRef && (
                                      <span className="font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                                        Ref: {event.transactionRef}
                                      </span>
                                    )}
                                    {event.paymentMethod && (
                                      <span className="text-slate-600 flex items-center space-x-1">
                                        <CreditCard className="w-3 h-3 text-emerald-600" />
                                        <span>
                                          {event.paymentMethod === 'credit_card'
                                            ? 'Kredi Kartı'
                                            : 'Banka Havalesi'}
                                        </span>
                                      </span>
                                    )}
                                    {isSms && (
                                      <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-md border border-amber-300 flex items-center space-x-1">
                                        <Smartphone className="w-3 h-3 text-amber-700" />
                                        <span>Otomatik SMS Bildirimi</span>
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Amount & Running Balance */}
                                <div className="text-left sm:text-right shrink-0 pt-1 sm:pt-0">
                                  {event.amount > 0 && (
                                    <div
                                      className={`text-xs sm:text-sm font-extrabold font-mono flex items-center sm:justify-end space-x-0.5 ${
                                        isPayment ? 'text-emerald-600' : 'text-rose-600'
                                      }`}
                                    >
                                      {isPayment ? (
                                        <>
                                          <ArrowDownRight className="w-3.5 h-3.5" />
                                          <span>+{formatCurrency(event.amount)}</span>
                                        </>
                                      ) : (
                                        <>
                                          <ArrowUpRight className="w-3.5 h-3.5" />
                                          <span>-{formatCurrency(event.amount)}</span>
                                        </>
                                      )}
                                    </div>
                                  )}

                                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                                    Bakiye:{' '}
                                    <strong
                                      className={
                                        event.balanceAfter < 0
                                          ? 'text-rose-600 font-bold'
                                          : event.balanceAfter > 0
                                          ? 'text-emerald-600 font-bold'
                                          : 'text-slate-700'
                                      }
                                    >
                                      {event.balanceAfter === 0
                                        ? '0 ₺'
                                        : formatCurrency(event.balanceAfter)}
                                    </strong>
                                  </div>

                                  {/* Overdue item action */}
                                  {event.status === 'overdue' && (
                                    <button
                                      type="button"
                                      onClick={() => setReminderModalUnit(activeTimelineUnit)}
                                      className="mt-1 px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded text-[10px] font-bold inline-flex items-center space-x-1 cursor-pointer"
                                    >
                                      <Smartphone className="w-3 h-3 text-amber-700" />
                                      <span>Send Automated Payment Reminder</span>
                                    </button>
                                  )}

                                  {event.dueRecord && onViewReceipt && (
                                    <button
                                      type="button"
                                      onClick={() => onViewReceipt(event.dueRecord!)}
                                      className="mt-1 text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold underline block sm:inline-block cursor-pointer"
                                    >
                                      Makbuz Gör
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </>
              )}

              {/* Sub-view: Communication Log (İletişim Günlüğü & SMS Bildirimleri) */}
              {selectedPanelTab === 'communication' && (
                <div className="space-y-4">
                  {/* Inline Composer Form if toggled */}
                  {showInlineComposer && (
                    <form
                      onSubmit={handleInlineSendMessage}
                      className="p-4 bg-indigo-50/80 border border-indigo-200 rounded-2xl animate-in fade-in space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-950 flex items-center space-x-1.5">
                          <Send className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Yeni İletişim / Bildirim Formu (GSM & Push Gateway)</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowInlineComposer(false)}
                          className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                        >
                          Kapat
                        </button>
                      </div>

                      {/* Templates */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-semibold text-slate-500 mr-1">Hazır Şablonlar:</span>
                        <button
                          type="button"
                          onClick={() => {
                            setInlineTemplate('debt');
                            setInlineChannel('sms');
                            setInlineTitle('Vadesi Geçmiş Aidat Hatırlatması');
                            setInlineMessage(
                              `Sayın ${activeTimelineUnit.residentName}, ${currentProfile.siteName} ${activeTimelineUnit.block} Blok D:${activeTimelineUnit.unitNo} dairenize ait ${formatCurrency(
                                Math.abs(activeTimelineUnit.currentBalance)
                              )} gecikmiş borcunuz bulunmaktadır. Online ödeme: https://apsiscloud.com/portal/pay/${activeTimelineUnit.id}`
                            );
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-200 transition cursor-pointer"
                        >
                          💰 Aidat Borç Hatırlatması
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setInlineTemplate('maintenance');
                            setInlineChannel('sms');
                            setInlineTitle('Planlı Su & Tesisat Bakımı');
                            setInlineMessage(
                              `Sayın Sakinimiz, belediye ana isale hattı bağlantı çalışması sebebiyle yarın 13:00 - 17:00 saatleri arasında geçici su kesintisi yaşanacaktır. Tedbirli olunması rica olunur.`
                            );
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-200 transition cursor-pointer"
                        >
                          🔧 Su / Tesisat Bakımı
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setInlineTemplate('meeting');
                            setInlineChannel('push');
                            setInlineTitle('Acil Blok Bilgilendirme Toplantısı');
                            setInlineMessage(
                              `Sayın ${activeTimelineUnit.residentName}, ${activeTimelineUnit.block} Blok ortak alan tesisat yenilemesi konulu toplantımız bu akşam saat 20:30'da blok girişinde gerçekleştirilecektir.`
                            );
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-200 transition cursor-pointer"
                        >
                          📢 Blok Toplantısı Çağrısı
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setInlineTemplate('call');
                            setInlineChannel('call_note');
                            setInlineTitle('Yönetici Telefon Mutabakat Notu');
                            setInlineMessage(
                              `Sakin ile telefon görüşmesi yapıldı. Daire hesabı ve aidat ödeme takvimi teyit edildi.`
                            );
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-200 transition cursor-pointer"
                        >
                          📞 Telefon Görüşme Notu
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-slate-600 block mb-1">
                            İletişim Kanalı
                          </label>
                          <select
                            value={inlineChannel}
                            onChange={(e) => setInlineChannel(e.target.value as CommunicationChannel)}
                            className="w-full bg-white text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                          >
                            <option value="sms">📲 SMS (GSM Operatör Gateway)</option>
                            <option value="push">🔔 Mobil Push Bildirimi</option>
                            <option value="email">📧 Kurumsal E-Posta</option>
                            <option value="legal_notice">⚖️ Yasal İhtarname Bildirimi</option>
                            <option value="call_note">📞 Telefon / Sesli Görüşme Kaydı</option>
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="text-[11px] font-bold text-slate-600 block mb-1">
                            Bildirim Başlığı / Konu
                          </label>
                          <input
                            type="text"
                            value={inlineTitle}
                            onChange={(e) => setInlineTitle(e.target.value)}
                            placeholder="Örn: Mart 2025 Aidat Ödeme Hatırlatması"
                            className="w-full bg-white text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-bold text-slate-600">
                            Mesaj Metni
                          </label>
                          <span className="text-[10px] text-slate-400">
                            {inlineMessage.length} karakter • {Math.max(1, Math.ceil(inlineMessage.length / 155))} SMS kredisi
                          </span>
                        </div>
                        <textarea
                          value={inlineMessage}
                          onChange={(e) => setInlineMessage(e.target.value)}
                          placeholder="Sakine iletilecek mesaj metnini yazınız..."
                          rows={2}
                          className="w-full bg-white text-xs p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                          required
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-slate-500">
                          Alıcı: <strong>{activeTimelineUnit.residentName}</strong> ({activeTimelineUnit.phone})
                        </span>
                        <button
                          type="submit"
                          disabled={!inlineTitle.trim() || !inlineMessage.trim()}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition shadow-xs flex items-center space-x-1.5 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Şimdi İlet & Kaydet</span>
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Inline Success Notice */}
                  {inlineSuccessMsg && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-900 flex items-center justify-between animate-in fade-in">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{inlineSuccessMsg}</span>
                      </div>
                      <button
                        onClick={() => setInlineSuccessMsg(null)}
                        className="text-emerald-700 hover:text-emerald-900 font-bold cursor-pointer"
                      >
                        Tamam
                      </button>
                    </div>
                  )}

                  {/* Channel Filter & Search Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-b border-slate-100 pb-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-700 mr-1 flex items-center space-x-1">
                        <Filter className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Kanal:</span>
                      </span>
                      <button
                        onClick={() => setCommChannelFilter('all')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          commChannelFilter === 'all'
                            ? 'bg-slate-900 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Tümü ({activeUnitCommLogs.length})
                      </button>
                      <button
                        onClick={() => setCommChannelFilter('sms')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1 ${
                          commChannelFilter === 'sms'
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                        }`}
                      >
                        <Smartphone className="w-3 h-3" />
                        <span>SMS ({activeUnitCommLogs.filter((l) => l.channel === 'sms').length})</span>
                      </button>
                      <button
                        onClick={() => setCommChannelFilter('push')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1 ${
                          commChannelFilter === 'push'
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                        }`}
                      >
                        <Bell className="w-3 h-3" />
                        <span>Push ({activeUnitCommLogs.filter((l) => l.channel === 'push').length})</span>
                      </button>
                      <button
                        onClick={() => setCommChannelFilter('legal_notice')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1 ${
                          commChannelFilter === 'legal_notice'
                            ? 'bg-rose-600 text-white shadow-2xs'
                            : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                        }`}
                      >
                        <Scale className="w-3 h-3" />
                        <span>Yasal İhtar ({activeUnitCommLogs.filter((l) => l.channel === 'legal_notice').length})</span>
                      </button>
                      <button
                        onClick={() => setCommChannelFilter('email')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1 ${
                          commChannelFilter === 'email'
                            ? 'bg-sky-600 text-white shadow-2xs'
                            : 'bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200'
                        }`}
                      >
                        <Mail className="w-3 h-3" />
                        <span>E-Posta ({activeUnitCommLogs.filter((l) => l.channel === 'email').length})</span>
                      </button>
                      {activeUnitCommLogs.some((l) => l.channel === 'call_note') && (
                        <button
                          onClick={() => setCommChannelFilter('call_note')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1 ${
                            commChannelFilter === 'call_note'
                              ? 'bg-amber-600 text-white shadow-2xs'
                              : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                          }`}
                        >
                          <PhoneCall className="w-3 h-3" />
                          <span>Telefon ({activeUnitCommLogs.filter((l) => l.channel === 'call_note').length})</span>
                        </button>
                      )}
                    </div>

                    <div className="relative w-full sm:w-56">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={commSearchQuery}
                        onChange={(e) => setCommSearchQuery(e.target.value)}
                        placeholder="Mesajlarda ara..."
                        className="w-full pl-8 pr-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Communication Log Feed */}
                  <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                    {filteredCommLogs.length === 0 ? (
                      <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-2">
                        <MessageSquare className="w-8 h-8 text-slate-400 mx-auto" />
                        <div className="text-xs font-bold text-slate-700">İletişim Kaydı Bulunamadı</div>
                        <p className="text-[11px] text-slate-500">
                          {commSearchQuery
                            ? 'Arama kriterlerine uygun mesaj veya bildirim kaydı bulunamadı.'
                            : 'Bu daire için henüz kayıtlı bir SMS veya bildirim bulunmamaktadır.'}
                        </p>
                      </div>
                    ) : (
                      filteredCommLogs.map((log) => {
                        const isCopied = copiedLogId === log.id;

                        const getBadge = () => {
                          switch (log.channel) {
                            case 'sms':
                              return (
                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <Smartphone className="w-2.5 h-2.5" />
                                  <span>SMS</span>
                                </span>
                              );
                            case 'push':
                              return (
                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                  <Bell className="w-2.5 h-2.5" />
                                  <span>Push Bildirim</span>
                                </span>
                              );
                            case 'legal_notice':
                              return (
                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                  <Scale className="w-2.5 h-2.5" />
                                  <span>Yasal İhtar</span>
                                </span>
                              );
                            case 'email':
                              return (
                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                                  <Mail className="w-2.5 h-2.5" />
                                  <span>E-Posta</span>
                                </span>
                              );
                            case 'call_note':
                              return (
                                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                  <PhoneCall className="w-2.5 h-2.5" />
                                  <span>Görüşme Notu</span>
                                </span>
                              );
                          }
                        };

                        return (
                          <div
                            key={log.id}
                            className="bg-white rounded-2xl p-3.5 border border-slate-200 hover:border-emerald-200 hover:shadow-2xs transition-all space-y-2"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                              <div className="flex items-center space-x-2">
                                {getBadge()}
                                <span className="font-bold text-xs text-slate-900">
                                  {log.title}
                                </span>
                              </div>

                              <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                                <span className="flex items-center space-x-1 font-mono">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  <span>
                                    {formatDate(log.sentAt)} • {log.timeStr}
                                  </span>
                                </span>

                                <span className="inline-flex items-center space-x-1 px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>İletildi (200 OK)</span>
                                </span>
                              </div>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs text-slate-800 leading-relaxed font-sans relative group">
                              <p className="whitespace-pre-wrap pr-16">{log.message}</p>

                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(log.message);
                                  setCopiedLogId(log.id);
                                  setTimeout(() => setCopiedLogId(null), 2000);
                                }}
                                className="absolute top-2 right-2 p-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-800 rounded-lg text-[10px] font-semibold transition flex items-center space-x-1 shadow-2xs cursor-pointer"
                                title="Metni panoya kopyala"
                              >
                                {isCopied ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-600" />
                                    <span className="text-emerald-700">Kopyalandı</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Kopyala</span>
                                  </>
                                )}
                              </button>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 pt-0.5">
                              <div className="flex items-center space-x-2">
                                <span>
                                  Gönderen: <strong>{log.sender}</strong>
                                </span>
                                {log.recipientPhone && (
                                  <span className="font-mono text-slate-400 hidden sm:inline">
                                    • GSM: {log.recipientPhone}
                                  </span>
                                )}
                                {log.deliveryCode && (
                                  <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded border border-slate-200">
                                    Ref: {log.deliveryCode}
                                  </span>
                                )}
                              </div>

                              {log.meta?.overdueAmount && (
                                <span className="font-semibold text-rose-600">
                                  Talep: {formatCurrency(log.meta.overdueAmount)}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Filter and Search Bar for Residents Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Sakin adı, daire no, tel veya plaka ara..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Block Selector */}
          <select
            value={selectedBlock}
            onChange={(e) => setSelectedBlock(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer"
          >
            <option value="all">Tüm Bloklar</option>
            <option value="A">A Blok</option>
            <option value="B">B Blok</option>
            <option value="C">C Blok</option>
          </select>

          {/* Quick Filters */}
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              filterType === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tümü
          </button>
          <button
            onClick={() => setFilterType('debtors')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              filterType === 'debtors'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Borçlular ({totalDebtors})
          </button>
          <button
            onClick={() => setFilterType('owners')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              filterType === 'owners'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Malikler ({totalOwners})
          </button>
          <button
            onClick={() => setFilterType('tenants')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              filterType === 'tenants'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Kiracılar ({totalTenants})
          </button>
          {/* 'Filter Overdue Only' Toggle Switch */}
          <div className="flex items-center pl-2 sm:border-l sm:border-slate-200">
            <label
              htmlFor="filter-overdue-toggle"
              className={`flex items-center space-x-2.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer select-none ${
                filterOverdueOnly
                  ? 'bg-rose-50 border-rose-300 text-rose-800 ring-2 ring-rose-400/40 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
              }`}
              title="Aktif edildiğinde sadece vadesi geçmiş borcu olan daireleri listeler, bakiyesi sıfır veya pozitif (avanslı) olanları gizler."
            >
              <div className="relative inline-flex items-center">
                <input
                  id="filter-overdue-toggle"
                  type="checkbox"
                  checked={filterOverdueOnly}
                  onChange={(e) => setFilterOverdueOnly(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-8 h-4.5 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-rose-600"></div>
              </div>
              <span className="flex items-center space-x-1.5 whitespace-nowrap">
                <span className={filterOverdueOnly ? 'text-rose-950 font-black' : 'text-slate-700'}>
                  Sadece Borçluları Filtrele (Filter Overdue Only)
                </span>
                {filterOverdueOnly && (
                  <span className="text-[10px] bg-rose-200 text-rose-900 px-1.5 py-0.2 rounded-full font-extrabold">
                    Aktif ({filteredUnits.length})
                  </span>
                )}
              </span>
            </label>
          </div>

          {/* Visual Progress Bar & Current Period Indicator (Collected Dues vs. Outstanding Debt) */}
          <div className="relative flex items-center pl-2 sm:border-l sm:border-slate-200">
            <div
              className="flex items-center space-x-2.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/90 hover:bg-slate-100/90 hover:border-slate-300 transition-all cursor-pointer select-none group shadow-2xs"
              onClick={() => setShowDuesBreakdownTooltip((prev) => !prev)}
              title={`${periodCollectionMetrics.period} Dönemi: Toplam %${periodCollectionMetrics.collectedPercentage} tahsilat yapıldı, %${periodCollectionMetrics.outstandingPercentage} borç bekliyor. Ayrıntılı döküm için tıklayın.`}
            >
              <div className="flex flex-col gap-1 min-w-[130px] sm:min-w-[170px]">
                {/* Header & Percentage Badges */}
                <div className="flex items-center justify-between text-[11px] font-bold leading-tight">
                  <span className="flex items-center space-x-1 text-slate-700">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate max-w-[85px] sm:max-w-none">{periodCollectionMetrics.period}:</span>
                    <span className="text-emerald-700 font-extrabold font-mono">
                      %{periodCollectionMetrics.collectedPercentage}
                    </span>
                  </span>
                  <span className="text-rose-600 font-mono text-[10px] font-semibold shrink-0 ml-1">
                    %{periodCollectionMetrics.outstandingPercentage} Borç
                  </span>
                </div>

                {/* Dual-Color Visual Progress Bar */}
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden flex shadow-inner">
                  <div
                    className="bg-emerald-500 h-2 transition-all duration-500 ease-out"
                    style={{
                      width: `${Math.min(100, Math.max(0, periodCollectionMetrics.collectedPercentage))}%`,
                    }}
                    title={`Tahsil Edilen Aidat: %${periodCollectionMetrics.collectedPercentage} (${formatCurrency(
                      periodCollectionMetrics.collectedAmount
                    )})`}
                  />
                  <div
                    className="bg-rose-500 h-2 transition-all duration-500 ease-out"
                    style={{
                      width: `${Math.min(100, Math.max(0, periodCollectionMetrics.outstandingPercentage))}%`,
                    }}
                    title={`Kalan / Gecikmiş Borç: %${periodCollectionMetrics.outstandingPercentage} (${formatCurrency(
                      periodCollectionMetrics.outstandingDebtAmount
                    )})`}
                  />
                </div>

                {/* Subtext Amounts Summary */}
                <div className="flex items-center justify-between text-[9px] font-mono leading-none text-slate-500">
                  <span className="text-emerald-700 font-bold">
                    ✓ {formatCurrency(periodCollectionMetrics.collectedAmount)}
                  </span>
                  <span className="text-slate-300">|</span>
                  <span className="text-rose-700 font-bold">
                    ⏳ {formatCurrency(periodCollectionMetrics.outstandingDebtAmount)}
                  </span>
                </div>
              </div>

              {/* Info Icon Button */}
              <button
                type="button"
                className="text-slate-400 hover:text-indigo-600 p-0.5 rounded-md transition cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDuesBreakdownTooltip((prev) => !prev);
                }}
                title="Detaylı dönem finansal dökümünü göster/gizle"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Floating Breakdown Popover */}
            {showDuesBreakdownTooltip && (
              <div
                className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-2xl border border-slate-200 shadow-xl p-4 z-40 text-xs animate-in fade-in zoom-in-95"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      <TrendingUp className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-xs">
                        {periodCollectionMetrics.period} Dönemi Aidat Dengesi
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        Tahsil Edilen Aidat vs. Bekleyen Borç Oranı
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDuesBreakdownTooltip(false)}
                    className="text-slate-400 hover:text-slate-600 font-bold text-xs p-1 rounded-md cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-2.5">
                  {/* Progress Bar inside popover */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-emerald-700">
                        Tahsilat: %{periodCollectionMetrics.collectedPercentage}
                      </span>
                      <span className="text-rose-700">
                        Kalan Borç: %{periodCollectionMetrics.outstandingPercentage}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden flex shadow-inner">
                      <div
                        className="bg-emerald-500 h-2.5 transition-all duration-500"
                        style={{ width: `${periodCollectionMetrics.collectedPercentage}%` }}
                      />
                      <div
                        className="bg-rose-500 h-2.5 transition-all duration-500"
                        style={{ width: `${periodCollectionMetrics.outstandingPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Collected Card */}
                  <div className="flex items-center justify-between p-2.5 bg-emerald-50/80 rounded-xl border border-emerald-200/80">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <div className="text-[10px] font-bold text-emerald-900 uppercase tracking-wide">
                          Tahsil Edilen Aidat
                        </div>
                        <div className="text-sm font-extrabold text-emerald-700 font-mono">
                          {formatCurrency(periodCollectionMetrics.collectedAmount)}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-black text-emerald-800 bg-white px-2 py-0.5 rounded-lg border border-emerald-200 shadow-2xs font-mono">
                      %{periodCollectionMetrics.collectedPercentage} ({periodCollectionMetrics.paidCount} Daire)
                    </span>
                  </div>

                  {/* Outstanding Debt Card */}
                  <div className="flex items-center justify-between p-2.5 bg-rose-50/80 rounded-xl border border-rose-200/80">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <div>
                        <div className="text-[10px] font-bold text-rose-900 uppercase tracking-wide">
                          Tahsil Bekleyen / Kalan Borç
                        </div>
                        <div className="text-sm font-extrabold text-rose-700 font-mono">
                          {formatCurrency(periodCollectionMetrics.outstandingDebtAmount)}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-black text-rose-800 bg-white px-2 py-0.5 rounded-lg border border-rose-200 shadow-2xs font-mono">
                      %{periodCollectionMetrics.outstandingPercentage} ({periodCollectionMetrics.unpaidCount} Daire)
                    </span>
                  </div>

                  {/* Period Total */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <span className="font-semibold">Dönem Toplam Tahakkuku:</span>
                    <span className="font-extrabold text-slate-900 font-mono">
                      {formatCurrency(periodCollectionMetrics.totalExpected)}
                    </span>
                  </div>

                  {/* Overdue alert if any */}
                  {periodCollectionMetrics.overdueOnlyAmount > 0 && (
                    <div className="flex items-center justify-between text-[11px] text-amber-800 bg-amber-50 px-2.5 py-1.5 rounded-xl border border-amber-200">
                      <span className="flex items-center space-x-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Vadesi Geçmiş Aidatlar:</span>
                      </span>
                      <span className="font-extrabold font-mono text-amber-900">
                        {formatCurrency(periodCollectionMetrics.overdueOnlyAmount)} ({periodCollectionMetrics.overdueCount} Daire)
                      </span>
                    </div>
                  )}

                  {/* Quick Filter Overdue Action Button */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setFilterOverdueOnly(true);
                        setShowDuesBreakdownTooltip(false);
                      }}
                      className="w-full py-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <Filter className="w-3 h-3 text-rose-600" />
                      <span>Sadece Borçlu ({periodCollectionMetrics.unpaidCount}) Daireyi Tabloda Filtrele</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Residents Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <th className="py-3 px-4">Daire</th>
                <th className="py-3 px-4">Sakin Adı Soyadı</th>
                <th className="py-3 px-4">İkamet Türü</th>
                <th className="py-3 px-4">İletişim & Plaka</th>
                <th className="py-3 px-4 text-right">Aylık Aidat</th>
                <th className="py-3 px-4 text-right">Cari Bakiye & Ekstre</th>
                <th className="py-3 px-4 text-right">Yönetim & İhtilaf Masası</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredUnits.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 px-4 text-center">
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                        <Filter className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-800">
                          {filterOverdueOnly
                            ? 'Aktif Gecikmiş Borcu Olan Daire Bulunmuyor'
                            : 'Kriterlere Uygun Daire Bulunamadı'}
                        </h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          {filterOverdueOnly
                            ? 'Harika! Tüm dairelerin cari hesapları mutabık veya avans bakiyeli durumda.'
                            : 'Arama sorgunuzu veya seçtiğiniz blok/ikamet filtrelerini değiştirerek tekrar deneyin.'}
                        </p>
                      </div>
                      {filterOverdueOnly && (
                        <button
                          type="button"
                          onClick={() => setFilterOverdueOnly(false)}
                          className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition cursor-pointer"
                        >
                          Filtreyi Temizle (Tüm Sakinleri Göster)
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUnits.map((u) => {
                const isSelected = activeTimelineUnit?.id === u.id;
                const isDebtor = u.currentBalance < 0;

                return (
                  <tr
                    key={u.id}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50/60 font-semibold'
                        : 'hover:bg-slate-50/80'
                    }`}
                    onClick={() => {
                      setSelectedTimelineUnit(u);
                      setIsTimelineSectionExpanded(true);
                    }}
                  >
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 text-xs block">
                        {u.block} Blok D:{u.unitNo}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Kat {u.floor} • {u.grossM2} m²
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                        <span>{u.residentName}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">{u.email}</span>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          u.residentType === 'owner'
                            ? 'bg-sky-50 text-sky-700 border-sky-200'
                            : 'bg-purple-50 text-purple-700 border-purple-200'
                        }`}
                      >
                        {u.residentType === 'owner' ? 'Kat Maliki' : 'Kiracı'}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-mono text-slate-700">{u.phone}</div>
                      {u.plateNumber && (
                        <span className="inline-block mt-0.5 font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                          🚗 {u.plateNumber}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                      {formatCurrency(u.monthlyDues)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex flex-col items-end">
                        <span
                          className={`font-mono font-extrabold flex items-center space-x-1 ${
                            u.currentBalance < 0
                              ? 'text-rose-600'
                              : u.currentBalance > 0
                              ? 'text-emerald-600'
                              : 'text-slate-600'
                          }`}
                        >
                          <span>
                            {u.currentBalance === 0
                              ? '0 ₺ (Ödendi)'
                              : formatCurrency(u.currentBalance)}
                          </span>
                          <History className="w-3.5 h-3.5 opacity-60" />
                        </span>
                        <span className="text-[10px] text-indigo-600 font-semibold flex items-center space-x-0.5">
                          <span>Zaman Çizelgesi &rarr;</span>
                        </span>
                      </div>
                    </td>

                    <td
                      className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* 'Hızlı Ödeme Al' (Fast Collection) button */}
                      <button
                        type="button"
                        onClick={() => handleOpenQuickCollection(u)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all inline-flex items-center space-x-1 shadow-xs cursor-pointer ${
                          isDebtor
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white ring-1 ring-emerald-400/50'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}
                        title={`${u.residentName} (${u.block} Blok D:${u.unitNo}) için ${
                          isDebtor
                            ? formatCurrency(Math.abs(u.currentBalance)) + ' tutarındaki gecikmiş borcu otomatik tahsil et ve kapat'
                            : 'aidat ödemesi al'
                        }`}
                      >
                        <Zap className="w-3 h-3 text-amber-300 fill-amber-300" />
                        <span>Hızlı Ödeme Al</span>
                      </button>

                      {/* 'Send Automated Payment Reminder' button when unit has overdue balance */}
                      {isDebtor && (
                        <button
                          type="button"
                          onClick={() => setReminderModalUnit(u)}
                          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-[11px] font-extrabold transition-all inline-flex items-center space-x-1 shadow-xs cursor-pointer"
                          title="Vadesi geçmiş borç için sakine önceden formatlanmış SMS bildirimi ilet"
                        >
                          <Smartphone className="w-3 h-3 text-slate-950" />
                          <span>Send Automated Payment Reminder</span>
                        </button>
                      )}

                      {/* 'Yasal İhtarname (PDF)' button when unit has overdue balance */}
                      {isDebtor && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTimelineUnit(u);
                            setLegalNoticeUnit(u);
                          }}
                          className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-bold transition-all inline-flex items-center space-x-1 shadow-2xs cursor-pointer"
                          title="Gecikmiş bakiyesi bulunan bu sakin için resmi yasal ihtarname metni oluştur ve PDF olarak kaydet"
                        >
                          <Scale className="w-3 h-3 text-rose-600" />
                          <span>İhtarname (PDF)</span>
                        </button>
                      )}

                      {/* 'İletişim Günlüğü' button */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTimelineUnit(u);
                          setSelectedPanelTab('communication');
                          setCommunicationLogModalUnit(u);
                        }}
                        className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-bold transition-all inline-flex items-center space-x-1 shadow-2xs cursor-pointer"
                        title="Bu sakine ait tüm SMS ve bildirim geçmişini (İletişim Günlüğü) görüntüle"
                      >
                        <MessageSquare className="w-3 h-3 text-emerald-600" />
                        <span>İletişim</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTimelineUnit(u);
                          setReportUnit(u);
                        }}
                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-[11px] font-bold transition-all inline-flex items-center space-x-1 shadow-2xs cursor-pointer"
                        title="Bu daire için Gelişmiş Ödeme Raporu oluştur ve PDF formatında indir"
                      >
                        <FileText className="w-3 h-3 text-indigo-600" />
                        <span>Rapor (PDF)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTimelineUnit(u);
                          setShowFullModalUnit(u);
                        }}
                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 rounded-lg text-[11px] font-bold transition-all inline-flex items-center space-x-1 shadow-2xs cursor-pointer"
                        title="Geçmiş aidat tahakkukları, tahsilat makbuzları ve gecikme cezaları zaman çizelgesi (İhtilaf Çözümü)"
                      >
                        <History className="w-3 h-3 text-amber-700" />
                        <span>Zaman Çizelgesi</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onEditResident(u)}
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-semibold transition-all inline-flex items-center space-x-1 shadow-xs cursor-pointer"
                        title="Sakin bilgilerine ve borç/alacak hesabına müdahale et"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Hesaba Müdahale</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onImpersonateResident(u)}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                        title="Bu sakin olarak oturum aç ve portalı gör"
                      >
                        Giriş Yap
                      </button>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Full Screen Unit Timeline Modal (Print & Deep Audit) */}
      {showFullModalUnit && (
        <UnitTimelineModal
          unit={showFullModalUnit}
          allUnits={units}
          dues={dues}
          siteProfile={currentProfile}
          onClose={() => setShowFullModalUnit(null)}
          onSelectUnit={(newUnit) => {
            setShowFullModalUnit(newUnit);
            setSelectedTimelineUnit(newUnit);
          }}
          onEditResident={(unitToEdit) => {
            setShowFullModalUnit(null);
            onEditResident(unitToEdit);
          }}
          onViewReceipt={onViewReceipt}
          onSendReminder={(unitToRemind, customMsg) => {
            handleSendAutomatedPaymentReminder(unitToRemind, customMsg);
          }}
          onQuickCollect={handleConfirmQuickCollection}
        />
      )}

      {/* Automated Payment Reminder Modal (Pre-formatted SMS notification) */}
      {reminderModalUnit && (
        <AutomatedPaymentReminderModal
          unit={reminderModalUnit}
          siteProfile={currentProfile}
          onClose={() => setReminderModalUnit(null)}
          onConfirmSend={(smsText) => {
            handleSendAutomatedPaymentReminder(reminderModalUnit, smsText);
            setReminderModalUnit(null);
          }}
        />
      )}

      {/* Advanced Payment Report Modal (Gelişmiş Ödeme Raporu & PDF Export) */}
      {reportUnit && (
        <AdvancedPaymentReportModal
          unit={reportUnit}
          siteProfile={currentProfile}
          dues={dues}
          extraNotes={sessionNotes[reportUnit.id] || []}
          onClose={() => setReportUnit(null)}
          onViewReceipt={onViewReceipt}
        />
      )}

      {/* Legal Notice Modal (Yasal İhtarname & PDF Export) */}
      {legalNoticeUnit && (
        <LegalNoticeModal
          unit={legalNoticeUnit}
          siteProfile={currentProfile}
          onClose={() => setLegalNoticeUnit(null)}
          onNoticeDispatched={(details) => {
            handleLegalNoticeDispatched(legalNoticeUnit, details);
          }}
        />
      )}

      {/* Resident Communication Log Modal (İletişim Günlüğü & SMS Bildirim Geçmişi) */}
      {communicationLogModalUnit && (
        <ResidentCommunicationLogModal
          unit={communicationLogModalUnit}
          siteProfile={currentProfile}
          logs={getUnitCommLogs(communicationLogModalUnit)}
          onClose={() => setCommunicationLogModalUnit(null)}
          onSendNewMessage={(newEntry) => {
            handleAppendCommLog(communicationLogModalUnit, newEntry);
          }}
          onOpenReport={(u) => setReportUnit(u)}
          onOpenLegalNotice={(u) => setLegalNoticeUnit(u)}
        />
      )}

      {/* Quick Collection Modal (Hızlı Ödeme Al & Otomatik Borç Kapatma) */}
      {quickCollectionUnit && (
        <QuickCollectionModal
          unit={quickCollectionUnit}
          siteProfile={currentProfile}
          onClose={() => setQuickCollectionUnit(null)}
          onConfirm={handleConfirmQuickCollection}
        />
      )}
    </div>
  );
};
