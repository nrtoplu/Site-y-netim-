import React, { useState } from 'react';
import {
  CreditCard,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  PlusCircle,
  FileSpreadsheet,
  Lock,
  ShieldCheck,
  Smartphone,
  Info,
} from 'lucide-react';
import { DuesRecord, BlockId, PaymentStatus } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface DuesTabProps {
  dues: DuesRecord[];
  isResident: boolean;
  residentUnitId?: string;
  residentName?: string;
  residentUnitDisplay?: string;
  onPayDue: (due: DuesRecord) => void;
  onViewReceipt: (due: DuesRecord) => void;
  onSendReminder: (due: DuesRecord) => void;
  onGenerateBulkDues: () => void;
  onNavigateBankImport?: () => void;
}

export const DuesTab: React.FC<DuesTabProps> = ({
  dues,
  isResident,
  residentUnitId,
  residentName,
  residentUnitDisplay = 'B Blok No:14',
  onPayDue,
  onViewReceipt,
  onSendReminder,
  onGenerateBulkDues,
  onNavigateBankImport,
}) => {
  const [selectedBlock, setSelectedBlock] = useState<'all' | BlockId>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | PaymentStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const targetUnitId = residentUnitId || (isResident ? 'unit-b14' : undefined);
  const targetResidentName = residentName || (isResident ? 'Ali Yılmaz' : undefined);

  // STRICT PRIVACY ENFORCEMENT:
  // If user is resident (son kullanıcı), strictly isolate only their own dues records.
  // Other residents' financial data, debt amounts, and identities are completely excluded!
  const baseDues = isResident
    ? dues.filter((d) => {
        if (targetUnitId && d.unitId === targetUnitId) return true;
        if (
          targetResidentName &&
          d.residentName.toLowerCase().includes(targetResidentName.toLowerCase())
        ) {
          return true;
        }
        return false;
      })
    : dues;

  // Secondary interactive filters (status, month, etc.)
  const filteredDues = baseDues.filter((d) => {
    if (!isResident && selectedBlock !== 'all') {
      const blockLetter = d.unitDisplay.charAt(0) as BlockId;
      if (blockLetter !== selectedBlock) return false;
    }

    if (selectedStatus !== 'all' && d.status !== selectedStatus) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchMonth = d.month.toLowerCase().includes(q);
      if (isResident) {
        // Resident can only search their own records by month/period or status
        if (!matchMonth) return false;
      } else {
        const matchName = d.residentName.toLowerCase().includes(q);
        const matchUnit = d.unitDisplay.toLowerCase().includes(q);
        if (!matchName && !matchUnit && !matchMonth) return false;
      }
    }

    return true;
  });

  const totalDuesAmount = filteredDues.reduce((acc, d) => acc + d.amount, 0);
  const totalPaidAmount = filteredDues
    .filter((d) => d.status === 'paid')
    .reduce((acc, d) => acc + d.amount, 0);
  const totalPendingAmount = filteredDues
    .filter((d) => d.status === 'pending')
    .reduce((acc, d) => acc + d.amount, 0);
  const totalOverdueAmount = filteredDues
    .filter((d) => d.status === 'overdue')
    .reduce((acc, d) => acc + d.amount + (d.lateFee || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>{isResident ? 'Aidatlarım & Online Güvenli Ödeme' : 'Aidat Yönetimi & Tahsilat Takip Portalı'}</span>
            {isResident && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-300">
                Kişiye Özel Kısıtlı Görünüm
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-500">
            {isResident
              ? 'Kat Mülkiyeti Kanunu ve KVKK kapsamında yalnızca kendi dairenize ait tahakkuklar ve resmi dekontlar listelenir.'
              : '634 Sayılı Kat Mülkiyeti Kanunu standartlarında tahakkuk, 3D Secure kart ödemesi ve resmi makbuzlandırma.'}
          </p>
        </div>

        {!isResident && (
          <div className="flex items-center space-x-2">
            {onNavigateBankImport && (
              <button
                onClick={onNavigateBankImport}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center space-x-1.5"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Excel Banka Ekstresi İçe Aktar</span>
              </button>
            )}
            <button
              onClick={onGenerateBulkDues}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center space-x-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Nisan 2025 Toplu Aidat Tahakkuk Et</span>
            </button>
          </div>
        )}
      </div>

      {/* KVKK & Privacy Banner for Site Residents */}
      {isResident && (
        <div className="bg-sky-50/90 border border-sky-200 rounded-2xl p-4 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sky-950 shadow-xs">
          <div className="flex items-start sm:items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Lock className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <div className="font-bold text-slate-900 flex flex-wrap items-center gap-2">
                <span>KVKK & Kişisel Veri Gizliliği Koruması Aktif</span>
                <span className="bg-sky-200 text-sky-900 text-[10px] px-2 py-0.5 rounded-full font-semibold font-mono">
                  Dairenize Özel: {residentUnitDisplay}
                </span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) uyarınca, bu sayfada{' '}
                <strong>yalnızca kendi bağımsız bölümünüze</strong> ait aidat borçları ve ödeme dekontları görüntülenir.
                Diğer kat maliklerinin borç ve ödeme bilgileri tamamen gizlidir ve erişilemez.
              </p>
            </div>
          </div>
          <div className="shrink-0 flex items-center space-x-1 text-emerald-700 bg-emerald-100/70 border border-emerald-300 px-2.5 py-1 rounded-lg text-[10px] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>256-Bit SSL Koruma</span>
          </div>
        </div>
      )}

      {/* Summary KPI Cards - strictly scoped to resident when in resident mode */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block">
            {isResident ? 'Dairemin Toplam Tahakkuku' : 'Listelenen Tahakkuk'}
          </span>
          <span className="text-lg font-bold text-slate-900 font-mono">
            {formatCurrency(totalDuesAmount)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {isResident ? `${filteredDues.length} Dönem Kaydı` : `${filteredDues.length} Kayıt`}
          </span>
        </div>

        <div className="bg-white border border-emerald-200 rounded-xl p-4 shadow-xs bg-emerald-50/20">
          <span className="text-[11px] font-semibold text-emerald-800 block">
            {isResident ? 'Ödediğim Toplam Tutar' : 'Tahsil Edilen Tutar'}
          </span>
          <span className="text-lg font-bold text-emerald-600 font-mono">
            {formatCurrency(totalPaidAmount)}
          </span>
          <span className="text-[10px] text-emerald-700 block mt-0.5">
            {isResident ? 'E-Makbuzlu / Onaylı' : 'Kasa & Bankada'}
          </span>
        </div>

        <div className="bg-white border border-amber-200 rounded-xl p-4 shadow-xs bg-amber-50/20">
          <span className="text-[11px] font-semibold text-amber-800 block">
            {isResident ? 'Vadesi Bekleyen Aidatım' : 'Bekleyen Ödemeler'}
          </span>
          <span className="text-lg font-bold text-amber-600 font-mono">
            {formatCurrency(totalPendingAmount)}
          </span>
          <span className="text-[10px] text-amber-700 block mt-0.5">
            {isResident ? 'Vadesi Gelmemiş' : 'Vadesi Gelmemiş'}
          </span>
        </div>

        <div className="bg-white border border-rose-200 rounded-xl p-4 shadow-xs bg-rose-50/20">
          <span className="text-[11px] font-semibold text-rose-800 block">
            {isResident ? 'Gecikmiş Borcum (Varsa)' : 'Geciken / Hukuki Borç'}
          </span>
          <span className="text-lg font-bold text-rose-600 font-mono">
            {formatCurrency(totalOverdueAmount)}
          </span>
          <span className="text-[10px] text-rose-700 block mt-0.5">
            {isResident ? 'KMK Aylık %5 Faiz Dahil' : 'Kanuni Faiz Dahil'}
          </span>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {isResident ? (
          /* Resident Specific Restricted Filter View */
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-3">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-800 bg-slate-100 px-3 py-2 rounded-xl">
              <span className="text-indigo-600">🏠 Tanımlı Daire:</span>
              <span className="font-bold">{residentUnitDisplay}</span>
              <span className="text-slate-400">({targetResidentName})</span>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-56">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Dönem ara (Örn: Mart, 2025)..."
                  className="w-full text-xs py-2 pl-9 pr-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>

              {/* Status Selector */}
              <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs shrink-0">
                {(['all', 'paid', 'pending', 'overdue'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setSelectedStatus(st)}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                      selectedStatus === st
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {st === 'all'
                      ? 'Tümü'
                      : st === 'paid'
                      ? 'Ödenen'
                      : st === 'pending'
                      ? 'Bekleyen'
                      : 'Gecikmede'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Manager Full Site Filter View */
          <>
            <div className="w-full md:w-72 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Sakin adı, daire no (Örn: A-12)..."
                className="w-full text-xs py-2 pl-9 pr-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Block Selector */}
              <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs">
                {(['all', 'A', 'B', 'C'] as const).map((block) => (
                  <button
                    key={block}
                    onClick={() => setSelectedBlock(block)}
                    className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                      selectedBlock === block
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {block === 'all' ? 'Tüm Bloklar' : `${block} Blok`}
                  </button>
                ))}
              </div>

              {/* Status Selector */}
              <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs">
                {(['all', 'paid', 'pending', 'overdue'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setSelectedStatus(st)}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                      selectedStatus === st
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {st === 'all'
                      ? 'Tümü'
                      : st === 'paid'
                      ? 'Ödendi'
                      : st === 'pending'
                      ? 'Bekliyor'
                      : 'Gecikmede'}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Dues Records Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">Bağımsız Bölüm</th>
                {!isResident && <th className="px-4 py-3.5">Kat Sakini</th>}
                <th className="px-4 py-3.5">Dönem</th>
                <th className="px-4 py-3.5">Tutar</th>
                <th className="px-4 py-3.5">Son Ödeme Tarihi</th>
                <th className="px-4 py-3.5">Durum</th>
                <th className="px-4 py-3.5 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDues.length === 0 ? (
                <tr>
                  <td colSpan={isResident ? 6 : 7} className="px-6 py-12 text-center text-slate-400">
                    <Info className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    {isResident
                      ? 'Dairenize ait aranan kriterde aidat kaydı bulunmamaktadır.'
                      : 'Arama kriterlerine uygun aidat kaydı bulunamadı.'}
                  </td>
                </tr>
              ) : (
                filteredDues.map((due) => {
                  const isPaid = due.status === 'paid';
                  const isOverdue = due.status === 'overdue';

                  return (
                    <tr
                      key={due.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isResident ? 'bg-indigo-50/20' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <span className="font-bold text-slate-900">{due.unitDisplay}</span>
                        {isResident && (
                          <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] bg-indigo-100 text-indigo-800 font-semibold">
                            Daireniz
                          </span>
                        )}
                      </td>

                      {!isResident && (
                        <td className="px-4 py-3 font-semibold text-slate-800">
                          {due.residentName}
                        </td>
                      )}

                      <td className="px-4 py-3 text-slate-700 font-medium">{due.month}</td>

                      <td className="px-4 py-3 font-mono font-bold text-slate-900">
                        {formatCurrency(due.amount)}
                        {due.lateFee > 0 && (
                          <span className="block text-[10px] text-rose-600 font-normal">
                            +{formatCurrency(due.lateFee)} gecikme faizi
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-slate-500">{formatDate(due.dueDate)}</td>

                      <td className="px-4 py-3">
                        {isPaid ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>ÖDENDİ</span>
                          </span>
                        ) : isOverdue ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            <span>GECİKMEDE</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>BEKLİYOR</span>
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {isPaid ? (
                            <button
                              onClick={() => onViewReceipt(due)}
                              className="inline-flex items-center space-x-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                              title="Resmi Tahsilat Makbuzunu Görüntüle & Yazdır"
                            >
                              <FileText className="w-3.5 h-3.5 text-indigo-600" />
                              <span>E-Makbuz</span>
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => onPayDue(due)}
                                className="inline-flex items-center space-x-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                                <span>Hemen Kartla Öde</span>
                              </button>

                              {!isResident && (
                                <button
                                  onClick={() => onSendReminder(due)}
                                  className="p-1 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors"
                                  title="SMS & E-Posta Hatırlatma Gönder"
                                >
                                  <Smartphone className="w-4 h-4" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
