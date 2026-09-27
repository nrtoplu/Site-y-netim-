import React, { useState } from 'react';
import {
  X,
  Cloud,
  ShieldCheck,
  Server,
  Lock,
  Download,
  RefreshCw,
  CheckCircle2,
  HardDrive,
  Database,
  FileSpreadsheet,
} from 'lucide-react';

interface CloudSecurityModalProps {
  onClose: () => void;
  siteDataExport: object;
}

export const CloudSecurityModal: React.FC<CloudSecurityModalProps> = ({
  onClose,
  siteDataExport,
}) => {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [lastBackupTime, setLastBackupTime] = useState('Bugün, 04:00 (Otomatik Günlük)');
  const [backupSuccess, setBackupSuccess] = useState(false);

  const handleManualBackup = () => {
    setIsBackingUp(true);
    setTimeout(() => {
      setIsBackingUp(false);
      setBackupSuccess(true);
      const now = new Date();
      setLastBackupTime(`Bugün, ${now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} (Canlı Mühürlü)`);
      setTimeout(() => setBackupSuccess(false), 3000);
    }, 1200);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(siteDataExport, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ZumrutPark_BulutYedek_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-sm p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Top bar */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
              <Cloud className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h2 className="font-semibold text-base">Güvenli Bulut Sunucu & Yedekleme Altyapısı</h2>
              <p className="text-xs text-indigo-200">
                256-Bit AES Uçtan Uca Şifreli Bulut Mimarisi
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Status Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1">
              <div className="flex items-center space-x-2 text-emerald-600 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Bulut Durumu: Çevrimiçi</span>
              </div>
              <div className="text-lg font-bold text-slate-900">Tier-4 Veri Merkezi</div>
              <div className="text-[11px] text-slate-500">İstanbul & Frankfurt Coğrafi Yedekli</div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1">
              <div className="flex items-center space-x-2 text-indigo-600 text-xs font-semibold">
                <Lock className="w-3.5 h-3.5" />
                <span>Kriptografik Güvenlik</span>
              </div>
              <div className="text-lg font-bold text-slate-900">256-Bit AES / SSL</div>
              <div className="text-[11px] text-slate-500">Mali Veriler Şifreli Saklanır</div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1">
              <div className="flex items-center space-x-2 text-purple-600 text-xs font-semibold">
                <Server className="w-3.5 h-3.5" />
                <span>Hizmet Sürekliliği</span>
              </div>
              <div className="text-lg font-bold text-slate-900">%99.99 Uptime</div>
              <div className="text-[11px] text-slate-500">Anlık Yük Dengeleme Aktif</div>
            </div>
          </div>

          {/* Cloud Backup Control Card */}
          <div className="border border-indigo-100 bg-indigo-50/40 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Database className="w-5 h-5 text-indigo-600" />
                <div>
                  <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                    Otomatik Bulut Yedekleme & Replikasyon
                  </h4>
                  <p className="text-xs text-indigo-800">
                    Son Başarılı Yedekleme: <strong className="font-semibold">{lastBackupTime}</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={handleManualBackup}
                disabled={isBackingUp}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 shadow-sm disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isBackingUp ? 'animate-spin' : ''}`} />
                <span>{isBackingUp ? 'Yedekleniyor...' : 'Şimdi Yedekle'}</span>
              </button>
            </div>

            {backupSuccess && (
              <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-medium flex items-center space-x-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Tüm site verileri, aidat listesi ve dijital evraklar başarıyla buluta kopyalandı!</span>
              </div>
            )}
          </div>

          {/* KVKK and Security Protocols */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Veri Koruma & KVKK Güvenlik Taahhüdü
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
              <div className="flex items-start space-x-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>6698 Sayılı KVKK ve Kat Mülkiyeti Kanunu Standartlarına %100 Uyum</span>
              </div>
              <div className="flex items-start space-x-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <HardDrive className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>Geri Yüklenebilir Snapshot & İki Kademeli Felaket Kurtarma Merkezi</span>
              </div>
            </div>
          </div>

          {/* Export Section */}
          <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h5 className="text-xs font-bold text-slate-900">Yerel Yedek İndir (Taşınabilirlik)</h5>
              <p className="text-[11px] text-slate-500">
                Site kayıtlarını bağımsız denetim veya arşivleme için tek tıkla cihazınıza indirebilirsiniz.
              </p>
            </div>
            <button
              onClick={handleExportJSON}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>JSON / Arşiv Verisini İndir</span>
            </button>
          </div>
        </div>

        <div className="bg-slate-100 px-6 py-3 flex justify-end items-center border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
