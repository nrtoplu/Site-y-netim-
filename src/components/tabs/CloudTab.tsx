import React, { useState } from 'react';
import {
  Cloud,
  Server,
  Lock,
  HardDrive,
  RefreshCw,
  Download,
  ShieldCheck,
  CheckCircle2,
  Database,
  Cpu,
  Activity,
  RotateCcw,
} from 'lucide-react';

interface CloudTabProps {
  siteDataExport: object;
  onResetData: () => void;
}

export const CloudTab: React.FC<CloudTabProps> = ({ siteDataExport, onResetData }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('Bugün, 04:00 (Otomatik Günlük)');
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const handleTriggerSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      const timeStr = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
      setLastSyncTime(`Bugün, ${timeStr} (Manuel Tetiklendi)`);
      setSyncMessage('Bulut sunucuları ile çift yönlü şifreli senkronizasyon tamamlandı (Gecikme: 14ms).');
      setTimeout(() => setSyncMessage(null), 4000);
    }, 1100);
  };

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(siteDataExport, null, 2));
    const dl = document.createElement('a');
    dl.setAttribute('href', dataStr);
    dl.setAttribute('download', `ZumrutPark_BulutYedek_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(dl);
    dl.click();
    dl.remove();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Güvenli Bulut Sunucu & Veri Depolama Altyapısı
          </h2>
          <p className="text-xs text-slate-500">
            Tüm site aidat, gider, sakin ve resmi evrak verileri yüksek güvenlikli bulut mimarisinde şifreli saklanır.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleTriggerSync}
            disabled={isSyncing}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center space-x-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Bulut Eşitleniyor...' : 'Şimdi Bulutla Eşitle'}</span>
          </button>
        </div>
      </div>

      {syncMessage && (
        <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-semibold rounded-xl flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{syncMessage}</span>
        </div>
      )}

      {/* Cloud Status Architecture Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Node 1: Primary */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Birincil Sunucu Düğümü
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Server className="w-4 h-4 text-indigo-600" />
            <span>İstanbul Tier-4 Veri Merkezi</span>
          </div>
          <div className="text-xs text-slate-500 space-y-1">
            <div className="flex justify-between">
              <span>Gecikme Süresi (Ping):</span>
              <span className="font-mono font-semibold text-emerald-600">14 ms</span>
            </div>
            <div className="flex justify-between">
              <span>Sunucu Durumu:</span>
              <span className="font-semibold text-slate-800">%100 Çevrimiçi</span>
            </div>
          </div>
        </div>

        {/* Node 2: Redundant */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Coğrafi Yedekli Bulut
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
          <div className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Cloud className="w-4 h-4 text-sky-600" />
            <span>Frankfurt EU-Central Yedek</span>
          </div>
          <div className="text-xs text-slate-500 space-y-1">
            <div className="flex justify-between">
              <span>Replikasyon Modu:</span>
              <span className="font-semibold text-slate-800">Senkronize Canlı</span>
            </div>
            <div className="flex justify-between">
              <span>Felaket Kurtarma:</span>
              <span className="font-semibold text-emerald-600">RPO: 0 sn / RTO: 30 sn</span>
            </div>
          </div>
        </div>

        {/* Node 3: Encryption */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Kriptografik Güvenlik
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>256-Bit AES & TLS 1.3</span>
          </div>
          <div className="text-xs text-slate-500 space-y-1">
            <div className="flex justify-between">
              <span>Veri İletimi:</span>
              <span className="font-semibold text-slate-800">SSL/TLS Şifreli</span>
            </div>
            <div className="flex justify-between">
              <span>Disk Şifreleme:</span>
              <span className="font-semibold text-emerald-600">Tam Disk Kriptolama</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cloud Backup Details & Data Management */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-2.5">
            <Database className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Yedekleme Noktaları ve Veri Güvencesi</h3>
              <p className="text-xs text-slate-500">
                Son Başarılı Yedekleme: <strong className="text-slate-800">{lastSyncTime}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={handleExport}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tüm Verileri Bilgisayara İndir (JSON)</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Otomatik Günlük Bulut Snapshot</span>
            </h4>
            <p className="leading-relaxed">
              Her gece saat 04:00'da tüm site aidat listesi, harcama faturaları ve dijital evraklar otomatik olarak kopyalanır ve 30 gün geriye dönük saklanır.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>KVKK ve KMK Uyumlu Veri Ayrımı</span>
            </h4>
            <p className="leading-relaxed">
              Kat sakinlerinin telefon ve TC kimlik bilgileri maskelenerek tutulur, bağımsız denetimler haricinde 3. şahıslara aktarılmaz.
            </p>
          </div>
        </div>

        {/* Demo Data Reset option */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-700 block">Sistem Verilerini Yeniden Başlat</span>
            <span className="text-[11px] text-slate-400">
              Demo verilerini fabrika ayarlarına sıfırlar.
            </span>
          </div>
          <button
            onClick={onResetData}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 rounded-lg text-xs font-semibold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Demo Verisine Sıfırla</span>
          </button>
        </div>
      </div>
    </div>
  );
};
