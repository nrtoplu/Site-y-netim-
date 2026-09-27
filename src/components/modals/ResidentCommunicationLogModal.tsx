/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  MessageSquare,
  Smartphone,
  Bell,
  Scale,
  Mail,
  PhoneCall,
  X,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Send,
  Copy,
  Check,
  Building,
  User,
  Shield,
  AlertTriangle,
  ArrowUpDown,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileText,
} from 'lucide-react';
import { ApartmentUnit, SiteProfile } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  CommunicationChannel,
  CommunicationLogEntry,
} from '../../utils/communicationLog';

interface ResidentCommunicationLogModalProps {
  unit: ApartmentUnit;
  siteProfile: SiteProfile;
  logs: CommunicationLogEntry[];
  onClose: () => void;
  onSendNewMessage?: (newEntry: Omit<CommunicationLogEntry, 'id'>) => void;
  onOpenReport?: (unit: ApartmentUnit) => void;
  onOpenLegalNotice?: (unit: ApartmentUnit) => void;
}

export const ResidentCommunicationLogModal: React.FC<ResidentCommunicationLogModalProps> = ({
  unit,
  siteProfile,
  logs,
  onClose,
  onSendNewMessage,
  onOpenReport,
  onOpenLegalNotice,
}) => {
  const [activeChannelFilter, setActiveChannelFilter] = useState<
    'all' | CommunicationChannel
  >('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Message Composer State
  const [showComposer, setShowComposer] = useState(false);
  const [newChannel, setNewChannel] = useState<CommunicationChannel>('sms');
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [templateType, setTemplateType] = useState<string>('custom');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successAlert, setSuccessAlert] = useState<string | null>(null);

  const phone = unit.phone || '0532 000 00 00';
  const email = unit.email || 'kayitli-yok@site.com';
  const isDebtor = unit.currentBalance < 0;
  const overdueDebt = Math.abs(unit.currentBalance);

  // Filtered and searched logs
  const filteredLogs = useMemo(() => {
    let result = [...logs];

    if (activeChannelFilter !== 'all') {
      result = result.filter((l) => l.channel === activeChannelFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.message.toLowerCase().includes(q) ||
          l.sender.toLowerCase().includes(q) ||
          (l.deliveryCode && l.deliveryCode.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => {
      const dateA = new Date(`${a.sentAt}T${a.timeStr || '00:00'}:00`).getTime();
      const dateB = new Date(`${b.sentAt}T${b.timeStr || '00:00'}:00`).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [logs, activeChannelFilter, searchQuery, sortOrder]);

  // Statistics
  const totalCount = logs.length;
  const smsCount = logs.filter((l) => l.channel === 'sms').length;
  const pushCount = logs.filter((l) => l.channel === 'push').length;
  const legalCount = logs.filter((l) => l.channel === 'legal_notice').length;
  const emailCount = logs.filter((l) => l.channel === 'email').length;
  const callCount = logs.filter((l) => l.channel === 'call_note').length;

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleApplyTemplate = (type: string) => {
    setTemplateType(type);
    const siteName = siteProfile.siteName;

    if (type === 'debt_reminder') {
      setNewChannel('sms');
      setNewTitle('Vadesi Geçmiş Aidat Hatırlatması');
      setNewMessage(
        `Sayın ${unit.residentName}, ${siteName} ${unit.block} Blok D:${unit.unitNo} no'lu bağımsız bölümünüze ait ${formatCurrency(
          overdueDebt
        )} tutarında gecikmiş aidat borcunuz bulunmaktadır. İhtilaf ve gecikme tazminatını önlemek amacıyla online portalımızdan ödeme yapmanızı rica ederiz: https://apsiscloud.com/portal/pay/${unit.id}`
      );
    } else if (type === 'urgent_meeting') {
      setNewChannel('push');
      setNewTitle('Acil Blok Sakinleri Bilgilendirme Toplantısı');
      setNewMessage(
        `Sayın ${unit.residentName}, ${unit.block} Blok kazan dairesi ve bina ortak tesisat yenilemesi konulu olağanüstü toplantımız bu akşam saat 20:30'da blok girişinde gerçekleştirilecektir.`
      );
    } else if (type === 'maintenance') {
      setNewChannel('sms');
      setNewTitle('Planlı Su & Tesisat Bakımı Duyurusu');
      setNewMessage(
        `Sayın Sakinimiz, belediye ana isale hattı bağlantı çalışması sebebiyle yarın 13:00 - 17:00 saatleri arasında geçici su kesintisi yaşanacaktır. Tedbirli olunması rica olunur.`
      );
    } else if (type === 'general_notice') {
      setNewChannel('push');
      setNewTitle('Site Yönetimi Genel Bildirimi');
      setNewMessage(
        `Sayın ${unit.residentName}, site huzuru ve güvenliği için ortak alan kullanım kurallarına gösterdiğiniz hassasiyet için teşekkür ederiz.`
      );
    } else if (type === 'call_log') {
      setNewChannel('call_note');
      setNewTitle('Yönetici Telefon Mutabakat Notu');
      setNewMessage(
        `Sakin ile telefon görüşmesi yapıldı. Daire hesabı ve aidat ödeme takvimi teyit edildi.`
      );
    }
  };

  const handleSubmitNewMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newMessage.trim()) return;

    setIsSubmitting(true);

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const time = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    let deliveryCode = 'GSM-OK-200';
    if (newChannel === 'push') deliveryCode = 'FCM-PUSH-OK';
    else if (newChannel === 'legal_notice') deliveryCode = `IHT-${unit.unitNo}-${Date.now().toString().slice(-4)}`;
    else if (newChannel === 'email') deliveryCode = 'SMTP-SENT-250';
    else if (newChannel === 'call_note') deliveryCode = 'GSM-CALL-LOG';

    const newLogItem: Omit<CommunicationLogEntry, 'id'> = {
      unitId: unit.id,
      residentName: unit.residentName,
      recipientPhone: phone,
      recipientEmail: email,
      channel: newChannel,
      title: newTitle.trim(),
      message: newMessage.trim(),
      sentAt: today,
      timeStr: time,
      sender: siteProfile.managementBoard[0] || 'Site Yönetim Kurulu',
      status: 'delivered',
      deliveryCode,
      category:
        newChannel === 'legal_notice'
          ? 'legal_notice'
          : newChannel === 'sms'
          ? 'payment_reminder'
          : 'announcement',
      meta: {
        overdueAmount: isDebtor ? overdueDebt : undefined,
        operatorResponse: 'OPERATOR_ACCEPTED_DELIVERED',
      },
    };

    if (onSendNewMessage) {
      onSendNewMessage(newLogItem);
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setShowComposer(false);
      setNewTitle('');
      setNewMessage('');
      setTemplateType('custom');
      setSuccessAlert(
        `${
          newChannel === 'sms'
            ? 'SMS Bildirimi'
            : newChannel === 'push'
            ? 'Push Bildirimi'
            : newChannel === 'legal_notice'
            ? 'Yasal İhtar Kaydı'
            : newChannel === 'email'
            ? 'E-Posta'
            : 'Görüşme Kaydı'
        } başarıyla iletildi ve iletişim günlüğüne işlendi.`
      );
      setTimeout(() => setSuccessAlert(null), 4000);
    }, 400);
  };

  const getChannelBadge = (channel: CommunicationChannel) => {
    switch (channel) {
      case 'sms':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Smartphone className="w-3 h-3" />
            <span>SMS Bildirimi</span>
          </span>
        );
      case 'push':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Bell className="w-3 h-3" />
            <span>Mobil Push</span>
          </span>
        );
      case 'legal_notice':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <Scale className="w-3 h-3" />
            <span>Yasal İhtarname</span>
          </span>
        );
      case 'email':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
            <Mail className="w-3 h-3" />
            <span>E-Posta</span>
          </span>
        );
      case 'call_note':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <PhoneCall className="w-3 h-3" />
            <span>Telefon Görüşmesi</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden my-auto">
        {/* Top Header Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 shrink-0 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-400/30 flex items-center justify-center font-bold shrink-0">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-base sm:text-lg tracking-tight">
                  Daire İletişim Günlüğü & Bildirim Geçmişi
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-bold shrink-0">
                  Communication Log
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Seçili sakine ait tüm SMS bildirimleri, mobil anlık uyarılar, yasal ihtarnameler ve iletim raporları.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowComposer(!showComposer)}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-xl text-xs font-extrabold transition shadow-xs flex items-center space-x-1.5 cursor-pointer ring-1 ring-amber-400/50"
              title="Bu sakine yeni SMS veya bildirim ilet"
            >
              <Send className="w-3.5 h-3.5 text-slate-950" />
              <span>Yeni SMS / Bildirim Gönder</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Resident Snapshot Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 sm:px-6 py-3.5 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white font-extrabold text-sm flex items-center justify-center shadow-xs shrink-0">
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
                <span className="text-xs text-slate-400">
                  {siteProfile.siteName}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-0.5">
                <span className="font-mono flex items-center space-x-1">
                  <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{phone}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{email}</span>
                </span>
                {unit.plateNumber && (
                  <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200">
                    🚗 {unit.plateNumber}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 self-end md:self-center">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Cari Bakiye
              </span>
              <span
                className={`text-base font-extrabold font-mono ${
                  unit.currentBalance < 0
                    ? 'text-rose-600'
                    : unit.currentBalance > 0
                    ? 'text-emerald-600'
                    : 'text-slate-700'
                }`}
              >
                {unit.currentBalance === 0 ? '0,00 ₺ Mutabık' : formatCurrency(unit.currentBalance)}
              </span>
            </div>

            {onOpenReport && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenReport(unit);
                }}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                title="Gelişmiş Ödeme Raporu PDF görüntüle"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                <span>Rapor (PDF)</span>
              </button>
            )}

            {isDebtor && onOpenLegalNotice && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenLegalNotice(unit);
                }}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                title="Yasal İhtarname oluştur"
              >
                <Scale className="w-3.5 h-3.5 text-rose-600" />
                <span>İhtarname (PDF)</span>
              </button>
            )}
          </div>
        </div>

        {/* Success Alert Banner */}
        {successAlert && (
          <div className="px-5 sm:px-6 py-2.5 bg-emerald-50 border-b border-emerald-200 text-xs font-semibold text-emerald-900 flex items-center justify-between animate-in fade-in shrink-0">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successAlert}</span>
            </div>
            <button
              onClick={() => setSuccessAlert(null)}
              className="text-emerald-700 hover:text-emerald-900 font-bold"
            >
              Tamam
            </button>
          </div>
        )}

        {/* Message Composer (Expandable) */}
        {showComposer && (
          <form
            onSubmit={handleSubmitNewMessage}
            className="p-5 bg-indigo-50/80 border-b border-indigo-200 animate-in fade-in space-y-3 shrink-0"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-950 flex items-center space-x-1.5">
                <Send className="w-4 h-4 text-indigo-600" />
                <span>Yeni İletişim / Bildirim Formu (GSM & Push Gateway)</span>
              </span>
              <button
                type="button"
                onClick={() => setShowComposer(false)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                Vazgeç
              </button>
            </div>

            {/* Template Buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-500 mr-1">Hazır Şablonlar:</span>
              <button
                type="button"
                onClick={() => handleApplyTemplate('debt_reminder')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition cursor-pointer ${
                  templateType === 'debt_reminder'
                    ? 'bg-amber-500 text-slate-950 border-amber-600 font-bold'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                💰 Aidat Borç Hatırlatması
              </button>
              <button
                type="button"
                onClick={() => handleApplyTemplate('maintenance')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition cursor-pointer ${
                  templateType === 'maintenance'
                    ? 'bg-amber-500 text-slate-950 border-amber-600 font-bold'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                🔧 Tesisat / Su Bakımı
              </button>
              <button
                type="button"
                onClick={() => handleApplyTemplate('urgent_meeting')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition cursor-pointer ${
                  templateType === 'urgent_meeting'
                    ? 'bg-amber-500 text-slate-950 border-amber-600 font-bold'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                📢 Blok Toplantısı Çağrısı
              </button>
              <button
                type="button"
                onClick={() => handleApplyTemplate('call_log')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition cursor-pointer ${
                  templateType === 'call_log'
                    ? 'bg-amber-500 text-slate-950 border-amber-600 font-bold'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
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
                  value={newChannel}
                  onChange={(e) => setNewChannel(e.target.value as CommunicationChannel)}
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
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
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
                  {newMessage.length} karakter • {Math.max(1, Math.ceil(newMessage.length / 155))} SMS kredisi
                </span>
              </div>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Sakine iletilecek mesaj metnini yazınız..."
                rows={3}
                className="w-full bg-white text-xs p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-500">
                Alıcı: <strong>{unit.residentName}</strong> ({phone})
              </span>
              <button
                type="submit"
                disabled={isSubmitting || !newTitle.trim() || !newMessage.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition shadow-xs flex items-center space-x-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Gönderiliyor...' : 'Şimdi İlet & Kaydet'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Filter and Stats Bar */}
        <div className="px-5 sm:px-6 py-3 bg-white border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 shrink-0">
          {/* Channel Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            <button
              onClick={() => setActiveChannelFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeChannelFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tümü ({totalCount})
            </button>
            <button
              onClick={() => setActiveChannelFilter('sms')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1 ${
                activeChannelFilter === 'sms'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <Smartphone className="w-3 h-3" />
              <span>SMS ({smsCount})</span>
            </button>
            <button
              onClick={() => setActiveChannelFilter('push')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1 ${
                activeChannelFilter === 'push'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
              }`}
            >
              <Bell className="w-3 h-3" />
              <span>Push ({pushCount})</span>
            </button>
            <button
              onClick={() => setActiveChannelFilter('legal_notice')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1 ${
                activeChannelFilter === 'legal_notice'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              <Scale className="w-3 h-3" />
              <span>Yasal İhtar ({legalCount})</span>
            </button>
            <button
              onClick={() => setActiveChannelFilter('email')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1 ${
                activeChannelFilter === 'email'
                  ? 'bg-sky-600 text-white shadow-2xs'
                  : 'bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200'
              }`}
            >
              <Mail className="w-3 h-3" />
              <span>E-Posta ({emailCount})</span>
            </button>
            {callCount > 0 && (
              <button
                onClick={() => setActiveChannelFilter('call_note')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center space-x-1 ${
                  activeChannelFilter === 'call_note'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                <PhoneCall className="w-3 h-3" />
                <span>Telefon ({callCount})</span>
              </button>
            )}
          </div>

          {/* Search & Sort */}
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Mesajlarda ara..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer"
              title={sortOrder === 'desc' ? 'Yeniden Eskiye' : 'Eskiden Yeniye'}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Message Logs Feed (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3.5 bg-slate-50/50">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                İletişim Kaydı Bulunamadı
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {searchQuery || activeChannelFilter !== 'all'
                  ? 'Uygulanan filtrelere uygun mesaj veya bildirim kaydı mevcut değil.'
                  : 'Bu daire için henüz kayıtlı bir SMS veya bildirim bulunmamaktadır.'}
              </p>
              <button
                type="button"
                onClick={() => setShowComposer(true)}
                className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold transition hover:bg-indigo-700 inline-flex items-center space-x-1 cursor-pointer"
              >
                <Send className="w-3 h-3" />
                <span>İlk SMS / Bildirimi Gönder</span>
              </button>
            </div>
          ) : (
            filteredLogs.map((log) => {
              const isCopied = copiedId === log.id;
              return (
                <div
                  key={log.id}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 hover:border-indigo-200 hover:shadow-xs transition-all space-y-3"
                >
                  {/* Item Top Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2.5">
                      {getChannelBadge(log.channel)}
                      <h4 className="font-extrabold text-sm text-slate-900">
                        {log.title}
                      </h4>
                    </div>

                    <div className="flex items-center space-x-2 text-xs text-slate-500">
                      <span className="flex items-center space-x-1 font-mono text-[11px]">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>
                          {formatDate(log.sentAt)} • {log.timeStr}
                        </span>
                      </span>

                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>İletildi (200 OK)</span>
                      </span>
                    </div>
                  </div>

                  {/* Message Content Box */}
                  <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs text-slate-800 leading-relaxed font-sans relative group">
                    <p className="whitespace-pre-wrap">{log.message}</p>

                    <button
                      onClick={() => handleCopyMessage(log.id, log.message)}
                      className="absolute top-2 right-2 p-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-800 rounded-lg text-[10px] font-semibold transition flex items-center space-x-1 shadow-2xs cursor-pointer"
                      title="Mesaj metnini panoya kopyala"
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

                  {/* Meta details footer */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-500 border-t border-slate-100">
                    <div className="flex items-center space-x-3">
                      <span>
                        Gönderen: <strong>{log.sender}</strong>
                      </span>
                      {log.recipientPhone && (
                        <span className="font-mono text-slate-400">
                          GSM: {log.recipientPhone}
                        </span>
                      )}
                      {log.deliveryCode && (
                        <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                          Ref: {log.deliveryCode}
                        </span>
                      )}
                    </div>

                    {log.meta?.overdueAmount && (
                      <span className="font-semibold text-rose-600">
                        Talep Tutarı: {formatCurrency(log.meta.overdueAmount)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 sm:p-5 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Tüm SMS ve bildirim kayıtları 6698 Sayılı KVKK ve Kat Mülkiyeti Kanunu uyarınca zaman damgasıyla loglanmaktadır.
            </span>
          </div>

          <div className="flex items-center space-x-2 justify-end">
            <button
              onClick={() => setShowComposer(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center space-x-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Yeni SMS İlet</span>
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
    </div>
  );
};
