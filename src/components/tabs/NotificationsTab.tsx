import React, { useState } from 'react';
import {
  Bell,
  Smartphone,
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Users,
  CheckCheck,
} from 'lucide-react';
import { NotificationItem } from '../../types';

interface NotificationsTabProps {
  notifications: NotificationItem[];
  isResident: boolean;
  onSendNotification: (notif: NotificationItem) => void;
  onMarkAllRead: () => void;
  onTriggerTestPush: () => void;
}

export const NotificationsTab: React.FC<NotificationsTabProps> = ({
  notifications,
  isResident,
  onSendNotification,
  onMarkAllRead,
  onTriggerTestPush,
}) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState('all');
  const [channelPush, setChannelPush] = useState(true);
  const [channelSms, setChannelSms] = useState(true);
  const [channelEmail, setChannelEmail] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleTemplateSelect = (type: 'dues' | 'water' | 'meeting' | 'urgent') => {
    if (type === 'dues') {
      setTitle('💳 Aidat Ödeme Hatırlatması');
      setMessage('Değerli Sakinimiz, Mart 2025 aidat bedelinizin son ödeme günü 15 Mart\'tır. Online kredi kartı ile komisyonsuz ödeyebilirsiniz.');
    } else if (type === 'water') {
      setTitle('🚰 Su Deposu Temizliği ve Planlı Kesinti');
      setMessage('Yarın 10:00 - 14:00 saatleri arasında hidrofor bakımı nedeniyle kısa süreli su kesintisi yaşanacaktır.');
    } else if (type === 'meeting') {
      setTitle('📢 Olağan Genel Kurul Toplantı Çağrısı');
      setMessage('29 Mart 2025 Cumartesi günü saat 14:00\'da Site Sosyal Tesisinde Olağan Genel Kurul yapılacaktır.');
    } else if (type === 'urgent') {
      setTitle('⚠️ Acil Bilgilendirme: Otopark Bakımı');
      setMessage('Kapalı otopark giriş bariyerindeki teknik güncelleme nedeniyle lütfen güvenliğin yönlendirmesine uyunuz.');
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    const channels: ('push' | 'sms' | 'email')[] = [];
    if (channelPush) channels.push('push');
    if (channelSms) channels.push('sms');
    if (channelEmail) channels.push('email');

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title,
      message,
      date: new Date().toLocaleString('tr-TR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
      read: false,
      type: 'announcement',
      channels,
    };

    onSendNotification(newNotif);
    setTitle('');
    setMessage('');
    setSentSuccess(true);
    setTimeout(() => setSentSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Mobil Bildirimler & SMS İletişim Merkezi
          </h2>
          <p className="text-xs text-slate-500">
            Sakinlerin cep telefonlarına anlık push bildirim, toplu SMS ve e-posta entegrasyonu.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onTriggerTestPush}
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1.5"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
            <span>Telefona Canlı Bildirim Gönder (Test)</span>
          </button>

          <button
            onClick={onMarkAllRead}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-medium transition-colors flex items-center space-x-1.5"
          >
            <CheckCheck className="w-3.5 h-3.5 text-slate-500" />
            <span>Tümünü Okundu Say</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Notification History Feed */}
        <div className={`${isResident ? 'lg:col-span-3' : 'lg:col-span-2'} bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4`}>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">
              {isResident ? 'Dairenize Ulaşan Duyuru ve Bildirimler' : 'Gönderilen ve Alınan Bildirimler'}
            </h3>
            <span className="text-xs text-slate-400 font-mono">{notifications.length} Kayıt</span>
          </div>

          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 rounded-xl border transition-all space-y-1.5 ${
                  !notif.read
                    ? 'bg-indigo-50/40 border-indigo-200 ring-1 ring-indigo-200/40'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 text-xs">{notif.title}</span>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{notif.date}</span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>

                <div className="pt-2 flex items-center space-x-3 text-[11px] text-slate-400 border-t border-slate-100/80">
                  <span className="font-medium text-slate-500">İletim Kanalları:</span>
                  <div className="flex items-center space-x-1.5">
                    {notif.channels.includes('push') && (
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px]">
                        Mobil Push
                      </span>
                    )}
                    {notif.channels.includes('sms') && (
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px]">
                        SMS
                      </span>
                    )}
                    {notif.channels.includes('email') && (
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px]">
                        E-Posta
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Management Send Notification Form - Restricted from Residents */}
        {!isResident && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Toplu Bildirim & SMS Gönder</h3>
              <p className="text-xs text-slate-500">Yönetimden sakinlere anlık duyuru yayını.</p>
            </div>

            {/* Quick Template Buttons */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Hızlı Hazır Şablonlar:
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleTemplateSelect('dues')}
                  className="p-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg text-[11px] font-medium text-left transition-colors truncate"
                >
                  💳 Aidat Hatırlatması
                </button>
                <button
                  type="button"
                  onClick={() => handleTemplateSelect('water')}
                  className="p-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg text-[11px] font-medium text-left transition-colors truncate"
                >
                  🚰 Su Kesintisi
                </button>
                <button
                  type="button"
                  onClick={() => handleTemplateSelect('meeting')}
                  className="p-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg text-[11px] font-medium text-left transition-colors truncate"
                >
                  📢 Genel Kurul
                </button>
                <button
                  type="button"
                  onClick={() => handleTemplateSelect('urgent')}
                  className="p-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg text-[11px] font-medium text-left transition-colors truncate"
                >
                  ⚠️ Acil Otopark
                </button>
              </div>
            </div>

            <form onSubmit={handleSend} className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hedef Kitle
                </label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg outline-none bg-white font-medium text-slate-800"
                >
                  <option value="all">Tüm Site Sakinleri (36 Daire)</option>
                  <option value="debtors">Sadece Aidat Borcu Olanlar (4 Daire)</option>
                  <option value="blockA">A Blok Sakinleri</option>
                  <option value="blockB">B Blok Sakinleri</option>
                  <option value="blockC">C Blok Sakinleri</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bildirim Başlığı *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Örn: 2025/03 Aidat Ödeme Hatırlatması"
                  className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mesaj Metni *
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Sakinlere iletilecek SMS ve mobil bildirim içeriği..."
                  className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Channels checkboxes */}
              <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="block text-[11px] font-bold text-slate-700 uppercase">
                  İletim Kanalları
                </span>
                <div className="flex items-center space-x-3 text-xs text-slate-700">
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={channelPush}
                      onChange={(e) => setChannelPush(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <span>Mobil Push</span>
                  </label>
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={channelSms}
                      onChange={(e) => setChannelSms(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <span>SMS</span>
                  </label>
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={channelEmail}
                      onChange={(e) => setChannelEmail(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <span>E-Posta</span>
                  </label>
                </div>
              </div>

              {sentSuccess && (
                <div className="p-2.5 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg flex items-center space-x-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Bildirim tüm seçili sakinlere başarıyla iletildi!</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center space-x-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Bildirimi Anında Yayınla & Gönder</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
