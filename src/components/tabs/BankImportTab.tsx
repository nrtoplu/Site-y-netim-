/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  Landmark,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Download,
  Filter,
  Search,
  Sparkles,
  PlusCircle,
  HelpCircle,
  Clock,
  ShieldCheck,
  Building2,
  Receipt,
  UserCheck,
  RefreshCw,
  X,
  BookmarkCheck,
  Send,
} from 'lucide-react';
import {
  BankTransactionMatch,
  ApartmentUnit,
  BankMatchingRule,
  TenantSite,
} from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  parseBankExcelFile,
  generateSampleBankExcelFile,
  matchBankTransaction,
} from '../../utils/bankMatcher';

interface BankImportTabProps {
  currentSite: TenantSite;
  onProcessTransaction: (
    tx: BankTransactionMatch,
    targetUnitId: string,
    period: string,
    rememberRule: boolean
  ) => void;
  onBulkProcessTransactions: (transactions: {
    tx: BankTransactionMatch;
    unitId: string;
    period: string;
    rememberRule: boolean;
  }[]) => void;
  onAddMatchingRule: (rule: BankMatchingRule) => void;
  onDeleteMatchingRule: (ruleId: string) => void;
  onUpdateTransactionsList: (transactions: BankTransactionMatch[]) => void;
}

export const BankImportTab: React.FC<BankImportTabProps> = ({
  currentSite,
  onProcessTransaction,
  onBulkProcessTransactions,
  onAddMatchingRule,
  onDeleteMatchingRule,
  onUpdateTransactionsList,
}) => {
  const units = currentSite.units;
  const rules = currentSite.bankMatchingRules || [];
  const transactions = currentSite.bankTransactions || [];

  // File upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Local state for rows being edited before processing
  // Maps tx.id -> { unitId: string, period: string, rememberRule: boolean }
  const [rowEdits, setRowEdits] = useState<Record<string, { unitId: string; period: string; rememberRule: boolean }>>({});

  // Filter and search
  const [statusFilter, setStatusFilter] = useState<'all' | 'unmatched' | 'matched' | 'processed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showManualTxModal, setShowManualTxModal] = useState(false);

  // New manual transaction form state
  const [manualSender, setManualSender] = useState('');
  const [manualAmount, setManualAmount] = useState<string>('1850');
  const [manualDesc, setManualDesc] = useState('');
  const [manualUnitId, setManualUnitId] = useState<string>(units[0]?.id || '');
  const [manualPeriod, setManualPeriod] = useState<string>('Eylül 2026 Aidatı');

  // Stats calculation
  const totalAmount = transactions.reduce((acc, t) => acc + t.amount, 0);
  const unmatchedCount = transactions.filter((t) => t.matchStatus === 'unmatched').length;
  const matchedCount = transactions.filter((t) => t.matchStatus === 'auto_matched' || t.matchStatus === 'manually_assigned').length;
  const processedCount = transactions.filter((t) => t.matchStatus === 'processed').length;

  // Filtered list
  const filteredTransactions = transactions.filter((tx) => {
    if (statusFilter === 'unmatched') {
      if (tx.matchStatus !== 'unmatched') return false;
    } else if (statusFilter === 'matched') {
      if (tx.matchStatus !== 'auto_matched' && tx.matchStatus !== 'manually_assigned') return false;
    } else if (statusFilter === 'processed') {
      if (tx.matchStatus !== 'processed') return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSender = tx.senderName.toLowerCase().includes(q);
      const matchDesc = tx.description.toLowerCase().includes(q);
      const matchRef = tx.transactionRef.toLowerCase().includes(q);
      const matchPeriod = tx.targetPeriod.toLowerCase().includes(q);
      if (!matchSender && !matchDesc && !matchRef && !matchPeriod) return false;
    }

    return true;
  });

  // Handle file reading
  const handleFile = async (file: File) => {
    setIsProcessingFile(true);
    setUploadMessage(null);
    try {
      const buffer = await file.arrayBuffer();
      const result = parseBankExcelFile(buffer, units, rules);

      if (result.parseErrors.length > 0 && result.transactions.length === 0) {
        setUploadMessage({ type: 'error', text: result.parseErrors.join(' | ') });
      } else {
        // Merge with existing
        const updated = [...result.transactions, ...transactions];
        onUpdateTransactionsList(updated);

        const newUnmatched = result.transactions.filter((t) => t.matchStatus === 'unmatched').length;
        const newMatched = result.transactions.length - newUnmatched;

        setUploadMessage({
          type: 'success',
          text: `"${file.name}" başarıyla aktarıldı. ${newMatched} ödeme otomatik eşleşti, ${newUnmatched} ödeme daire ataması bekliyor.`,
        });
      }
    } catch (err: unknown) {
      setUploadMessage({
        type: 'error',
        text: `Dosya okunurken beklenmedik hata: ${err instanceof Error ? err.message : String(err)}`,
      });
    } finally {
      setIsProcessingFile(false);
    }
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Download Sample Excel Template
  const handleDownloadTemplate = () => {
    const excelBytes = generateSampleBankExcelFile();
    const blob = new Blob([excelBytes.buffer as ArrayBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ApsisCloud_Banka_Ekstre_Sablonu_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Quick Bank Preset Loaders
  const handleLoadBankPreset = (bankName: string) => {
    let sampleItems = [];
    const today = new Date().toISOString().split('T')[0];

    if (bankName === 'isbank') {
      sampleItems = [
        {
          senderName: 'Hakan Özdemir',
          description: 'A1 Eylül Aidatı',
          amount: 1850,
          transactionRef: `ISB-${Date.now().toString().slice(-6)}-01`,
        },
        {
          senderName: 'Canan Güneş',
          description: 'Aidat Havalesi',
          amount: 1850,
          transactionRef: `ISB-${Date.now().toString().slice(-6)}-02`,
        },
        {
          senderName: 'Mehmet Ali Demirtaş', // Unmatched!
          description: 'EFT Havale Ödemesi',
          amount: 1850,
          transactionRef: `ISB-${Date.now().toString().slice(-6)}-03`,
        },
        {
          senderName: 'Şükrü Tan', // Unmatched!
          description: 'Aidat Bedeli',
          amount: 3700,
          transactionRef: `ISB-${Date.now().toString().slice(-6)}-04`,
        },
        {
          senderName: 'Ali Yılmaz',
          description: 'B-14 Aidat',
          amount: 1850,
          transactionRef: `ISB-${Date.now().toString().slice(-6)}-05`,
        },
      ];
    } else if (bankName === 'garanti') {
      sampleItems = [
        {
          senderName: 'Dr. Selin Yurtsever',
          description: 'C Blok D:5 Aidat',
          amount: 1850,
          transactionRef: `GAR-${Date.now().toString().slice(-6)}-11`,
        },
        {
          senderName: 'Av. Zeynep Yılmaz',
          description: 'A3 Dairesi Aidatı',
          amount: 1850,
          transactionRef: `GAR-${Date.now().toString().slice(-6)}-12`,
        },
        {
          senderName: 'Fatma Gültekin (Yılmaz)', // Unmatched or partial!
          description: 'FAST Borç Ödeme',
          amount: 1850,
          transactionRef: `GAR-${Date.now().toString().slice(-6)}-13`,
        },
      ];
    } else {
      sampleItems = [
        {
          senderName: 'Berkant Çelik',
          description: 'C Blok No 4 Aidat',
          amount: 1850,
          transactionRef: `ZIR-${Date.now().toString().slice(-6)}-21`,
        },
        {
          senderName: 'Bilinmeyen Gönderen', // Unmatched!
          description: 'Kira ve Ortak Gider Aidatı',
          amount: 1850,
          transactionRef: `ZIR-${Date.now().toString().slice(-6)}-22`,
        },
      ];
    }

    const newMatches: BankTransactionMatch[] = sampleItems.map((item, idx) =>
      matchBankTransaction(
        {
          id: `tx-preset-${Date.now()}-${idx}`,
          date: today,
          senderName: item.senderName,
          description: item.description,
          amount: item.amount,
          transactionRef: item.transactionRef,
        },
        units,
        rules
      )
    );

    const merged = [...newMatches, ...transactions];
    onUpdateTransactionsList(merged);

    const unmatched = newMatches.filter((m) => m.matchStatus === 'unmatched').length;
    setUploadMessage({
      type: 'success',
      text: `${bankName.toUpperCase()} test ekstresi yüklendi: ${newMatches.length} adet havale eklendi (${unmatched} tanesi isim uyuşmazlığı nedeniyle yönetici onayı bekliyor).`,
    });
  };

  // Helper for row values (falls back to transaction matchedUnitId if not touched)
  const getRowUnitId = (tx: BankTransactionMatch): string => {
    if (rowEdits[tx.id]?.unitId !== undefined) {
      return rowEdits[tx.id].unitId;
    }
    return tx.matchedUnitId || '';
  };

  const getRowPeriod = (tx: BankTransactionMatch): string => {
    if (rowEdits[tx.id]?.period !== undefined) {
      return rowEdits[tx.id].period;
    }
    return tx.targetPeriod || 'Eylül 2026 Aidatı';
  };

  const getRowRememberRule = (tx: BankTransactionMatch): boolean => {
    if (rowEdits[tx.id]?.rememberRule !== undefined) {
      return rowEdits[tx.id].rememberRule;
    }
    return tx.rememberRule ?? true;
  };

  const handleRowChange = (
    txId: string,
    changes: Partial<{ unitId: string; period: string; rememberRule: boolean }>
  ) => {
    const tx = transactions.find((t) => t.id === txId);
    if (!tx) return;

    setRowEdits((prev) => ({
      ...prev,
      [txId]: {
        unitId: changes.unitId !== undefined ? changes.unitId : getRowUnitId(tx),
        period: changes.period !== undefined ? changes.period : getRowPeriod(tx),
        rememberRule: changes.rememberRule !== undefined ? changes.rememberRule : getRowRememberRule(tx),
      },
    }));
  };

  // Process single transaction
  const handleProcessSingle = (tx: BankTransactionMatch) => {
    const chosenUnitId = getRowUnitId(tx);
    if (!chosenUnitId) {
      alert('Lütfen önce bu ödemenin ait olduğu daireyi seçiniz!');
      return;
    }
    const period = getRowPeriod(tx);
    const rememberRule = getRowRememberRule(tx);

    onProcessTransaction(tx, chosenUnitId, period, rememberRule);
  };

  // Bulk Process all matched or assigned transactions
  const handleProcessAllMatched = () => {
    const validItems = transactions
      .filter((t) => t.matchStatus !== 'processed')
      .map((tx) => {
        const unitId = getRowUnitId(tx);
        return {
          tx,
          unitId,
          period: getRowPeriod(tx),
          rememberRule: getRowRememberRule(tx),
        };
      })
      .filter((item) => Boolean(item.unitId));

    if (validItems.length === 0) {
      alert('Sisteme işlenebilecek eşleşmiş veya daire seçilmiş havale bulunamadı.');
      return;
    }

    if (
      confirm(
        `Toplam ${validItems.length} adet havale ilgili dairelerin aidat hesaplarına işlenecek ve tahsilat makbuzları kesilecektir. Onaylıyor musunuz?`
      )
    ) {
      onBulkProcessTransactions(validItems);
    }
  };

  // Manual Transaction creation
  const handleSaveManualTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualSender.trim()) {
      alert('Lütfen gönderen adını giriniz.');
      return;
    }
    const amt = parseFloat(manualAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('Lütfen geçerli bir tutar giriniz.');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const newTx: BankTransactionMatch = {
      id: `manual-tx-${Date.now()}`,
      date: today,
      senderName: manualSender.trim(),
      description: manualDesc.trim() || 'Banka Havalesi (Manuel Giriş)',
      amount: amt,
      transactionRef: `MNL-${Date.now().toString().slice(-6)}`,
      matchedUnitId: manualUnitId,
      matchStatus: manualUnitId ? 'manually_assigned' : 'unmatched',
      matchConfidence: 100,
      suggestedReason: 'Yönetici tarafından doğrudan daireye atandı',
      targetPeriod: manualPeriod,
      rememberRule: true,
    };

    onUpdateTransactionsList([newTx, ...transactions]);
    setShowManualTxModal(false);
    setManualSender('');
    setManualDesc('');
    setUploadMessage({
      type: 'success',
      text: `${newTx.senderName} adına ${formatCurrency(newTx.amount)} tutarındaki havale sisteme eklendi.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  Excel Banka Ekstresi & Otomatik Havale Eşleme
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                    Akıllı Eşleme Motoru
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  Bankanızdan (İş Bankası, Garanti, Ziraat vb.) indirdiğiniz hesap ekstresini aktarın. İsimleri uyuşmayan ödemeleri yönetici olarak ilgili daireye atayın.
                </p>
              </div>
            </div>
          </div>

          {/* Top Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowRulesModal(true)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 border border-slate-200"
            >
              <BookmarkCheck className="w-4 h-4 text-indigo-600" />
              <span>Kayıtlı Kurallar ({rules.length})</span>
            </button>

            <button
              onClick={() => setShowManualTxModal(true)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 border border-slate-200"
            >
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              <span>Tekil Havale Ekle</span>
            </button>

            <button
              onClick={handleDownloadTemplate}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Örnek Excel Şablonu (.xlsx)</span>
            </button>
          </div>
        </div>

        {/* Upload Alert Notification */}
        {uploadMessage && (
          <div
            className={`mt-4 p-3.5 rounded-xl text-xs flex items-center justify-between ${
              uploadMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            <div className="flex items-center space-x-2">
              {uploadMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{uploadMessage.text}</span>
            </div>
            <button
              onClick={() => setUploadMessage(null)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Drag and Drop Zone + Presets */}
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`lg:col-span-2 border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
              isDragging
                ? 'border-emerald-500 bg-emerald-50/50'
                : 'border-slate-300 hover:border-emerald-400 bg-slate-50/50 hover:bg-emerald-50/20'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFile(e.target.files[0]);
                }
              }}
              accept=".xlsx,.xls,.csv,.txt"
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800">
              Banka Excel veya CSV Ekstresini Sürükleyip Bırakın
            </p>
            <p className="text-xs text-slate-500 mt-1">
              veya bilgisayarınızdan dosya seçmek için <span className="text-emerald-700 font-semibold underline">tıklayın</span> (.xlsx, .xls, .csv desteklenir)
            </p>
            <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Otomatik sütun tespiti: Tarih, Gönderen Adı, Dekont Açıklaması, Tutar (TL), IBAN</span>
            </div>
          </div>

          {/* Quick Simulation Presets */}
          <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Hızlı Test Ekstreleri (1 Tıkla Yükle)
              </span>
              <p className="text-xs text-slate-600 mt-1">
                Hazır banka formatlarını test edin (içinde hem uyuşan hem uyuşmayan havaleler bulunur):
              </p>
            </div>

            <div className="space-y-2 mt-3">
              <button
                onClick={() => handleLoadBankPreset('isbank')}
                className="w-full text-left px-3 py-2 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl text-xs font-semibold text-slate-700 hover:text-blue-700 transition-all flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-blue-600" />
                  <span>İş Bankası Eylül Ekstresi</span>
                </div>
                <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">5 Havale</span>
              </button>

              <button
                onClick={() => handleLoadBankPreset('garanti')}
                className="w-full text-left px-3 py-2 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-xs font-semibold text-slate-700 hover:text-emerald-700 transition-all flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span>Garanti BBVA Ekstresi</span>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">3 Havale</span>
              </button>

              <button
                onClick={() => handleLoadBankPreset('ziraat')}
                className="w-full text-left px-3 py-2 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 rounded-xl text-xs font-semibold text-slate-700 hover:text-rose-700 transition-all flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-rose-600" />
                  <span>Ziraat Bankası Ekstresi</span>
                </div>
                <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded">2 Havale</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Toplam Banka Hareketi</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{transactions.length} Adet</p>
            <p className="text-xs text-slate-500 mt-0.5">{formatCurrency(totalAmount)}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Landmark className="w-6 h-6" />
          </div>
        </div>

        {/* UNMATCHED HIGHLIGHT CARD */}
        <div
          onClick={() => setStatusFilter('unmatched')}
          className={`p-4 rounded-2xl border shadow-sm flex items-center justify-between cursor-pointer transition-all ${
            unmatchedCount > 0
              ? 'bg-amber-50/80 border-amber-300 hover:bg-amber-100/70 ring-2 ring-amber-400/30'
              : 'bg-white border-slate-200'
          }`}
        >
          <div>
            <div className="flex items-center space-x-1.5">
              <p className="text-xs font-bold text-amber-900">Uyuşmayan / Daire Bekleyen</p>
              {unmatchedCount > 0 && (
                <span className="animate-pulse w-2 h-2 rounded-full bg-amber-600" />
              )}
            </div>
            <p className="text-2xl font-black text-amber-700 mt-1">{unmatchedCount} Havale</p>
            <p className="text-xs text-amber-800 mt-0.5">Yönetici Seçimi Gerekiyor</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div
          onClick={() => setStatusFilter('matched')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between cursor-pointer hover:border-emerald-300 transition-all"
        >
          <div>
            <p className="text-xs font-medium text-slate-500">Otomatik Eşleşen Daireler</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{matchedCount} Adet</p>
            <p className="text-xs text-slate-500 mt-0.5">Doğrudan sisteme aktarılabilir</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div
          onClick={() => setStatusFilter('processed')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between cursor-pointer hover:border-indigo-300 transition-all"
        >
          <div>
            <p className="text-xs font-medium text-slate-500">Sisteme İşlenen & Makbuzlanan</p>
            <p className="text-2xl font-bold text-indigo-600 mt-1">{processedCount} Adet</p>
            <p className="text-xs text-slate-500 mt-0.5">Aidat borcundan düşüldü</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Receipt className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Unmatched Alert Notice if unmatchedCount > 0 */}
      {unmatchedCount > 0 && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-4 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-sm">
                Dikkat: {unmatchedCount} Adet Gelen Havalenin İsmi Daire Sakinleriyle Uyuşmadı!
              </h4>
              <p className="text-xs text-amber-100">
                Aşağıdaki tabloda sarı işaretli ödemeler için ilgili daireyi listeden seçip "Daireye İşle" butonuna basarak tahsilatı tamamlayabilirsiniz.
              </p>
            </div>
          </div>
          <button
            onClick={() => setStatusFilter('unmatched')}
            className="px-4 py-2 bg-white text-amber-900 rounded-xl text-xs font-bold shadow hover:bg-amber-50 transition-all shrink-0"
          >
            Sadece Uyuşmayanları Göster ({unmatchedCount})
          </button>
        </div>
      )}

      {/* Transactions Management Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Filter Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tümü ({transactions.length})
            </button>
            <button
              onClick={() => setStatusFilter('unmatched')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                statusFilter === 'unmatched'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-amber-100/70 text-amber-900 hover:bg-amber-200/80 border border-amber-300'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Uyuşmayanlar ({unmatchedCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('matched')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                statusFilter === 'matched'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Eşleşenler ({matchedCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('processed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                statusFilter === 'processed'
                  ? 'bg-indigo-700 text-white'
                  : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Sisteme İşlenenler ({processedCount})</span>
            </button>
          </div>

          {/* Search & Bulk Action */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Gönderen adı, açıklama, dekont no..."
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Bulk process button */}
            <button
              onClick={handleProcessAllMatched}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center space-x-1.5 shrink-0"
              title="Dairesi belirlenmiş tüm havaleleri tek tıkla aidat listesine aktar"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Tüm Eşleşenleri Toplu Aktar</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">Henüz Gösterilecek Banka Hareketi Yok</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Yukarıdaki alandan Excel/CSV ekstrenizi yükleyebilir veya "İş Bankası / Garanti Ekstresi Yükle" butonuna tıklayarak örnek verileri inceleyebilirsiniz.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="p-3.5">İşlem Tarihi & Ref</th>
                  <th className="p-3.5">Gönderen (Banka Kaydı)</th>
                  <th className="p-3.5">Banka Dekont Açıklaması</th>
                  <th className="p-3.5">Tutar (TL)</th>
                  <th className="p-3.5 min-w-[280px]">
                    Atanacak Daire & Dönem
                    <span className="ml-1.5 text-emerald-700 font-normal lowercase">
                      (Yönetici Seçimi)
                    </span>
                  </th>
                  <th className="p-3.5 text-right">İşlem & Makbuz</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {filteredTransactions.map((tx) => {
                  const currentUnitId = getRowUnitId(tx);
                  const currentPeriod = getRowPeriod(tx);
                  const rememberRule = getRowRememberRule(tx);

                  const matchedUnit = units.find((u) => u.id === currentUnitId);
                  const isUnmatched = tx.matchStatus === 'unmatched';
                  const isProcessed = tx.matchStatus === 'processed';

                  return (
                    <tr
                      key={tx.id}
                      className={`transition-colors ${
                        isProcessed
                          ? 'bg-slate-50/60 opacity-80'
                          : isUnmatched
                          ? 'bg-amber-50/40 hover:bg-amber-50/70'
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      {/* Tarih & Ref */}
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="font-semibold text-slate-800">{formatDate(tx.date)}</div>
                        <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                          <span>{tx.transactionRef}</span>
                        </div>
                      </td>

                      {/* Gönderen Bilgisi */}
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{tx.senderName}</div>
                        {tx.senderIban ? (
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {tx.senderIban}
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-400">Havale / FAST</div>
                        )}
                      </td>

                      {/* Açıklama & Sistem Teşhisi */}
                      <td className="p-3.5 max-w-xs">
                        <div className="text-slate-700 italic">"{tx.description}"</div>
                        {tx.suggestedReason && (
                          <div
                            className={`mt-1 text-[11px] font-medium flex items-center gap-1 ${
                              isUnmatched ? 'text-amber-700' : 'text-emerald-700'
                            }`}
                          >
                            {isUnmatched ? (
                              <AlertTriangle className="w-3 h-3 shrink-0" />
                            ) : (
                              <CheckCircle2 className="w-3 h-3 shrink-0" />
                            )}
                            <span className="truncate">{tx.suggestedReason}</span>
                          </div>
                        )}
                      </td>

                      {/* Tutar */}
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="text-sm font-extrabold text-slate-900">
                          {formatCurrency(tx.amount)}
                        </span>
                      </td>

                      {/* Daire Seçimi (Yönetici Atama Masası) */}
                      <td className="p-3.5">
                        {isProcessed ? (
                          <div className="space-y-1">
                            <div className="flex items-center space-x-1.5 text-emerald-800 font-bold">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>{matchedUnit?.block} Blok D:{matchedUnit?.unitNo} ({matchedUnit?.residentName})</span>
                            </div>
                            <div className="text-[11px] text-slate-500">
                              Dönem: <span className="font-semibold text-slate-700">{tx.targetPeriod}</span> • Makbuz: <span className="font-mono text-indigo-700">{tx.processedReceiptNo}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {/* APARTMENT SELECTOR DROPDOWN */}
                            <div className="relative">
                              <select
                                value={currentUnitId}
                                onChange={(e) =>
                                  handleRowChange(tx.id, { unitId: e.target.value })
                                }
                                className={`w-full text-xs rounded-xl px-2.5 py-1.5 font-medium border focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                                  !currentUnitId
                                    ? 'bg-amber-100/80 border-amber-400 text-amber-900 font-bold animate-pulse'
                                    : 'bg-white border-slate-300 text-slate-800'
                                }`}
                              >
                                <option value="">⚠️ Daire Seçiniz (İsim Uyuşmadı)</option>

                                {/* A Blok */}
                                <optgroup label="🏢 A Blok">
                                  {units
                                    .filter((u) => u.block === 'A')
                                    .map((u) => (
                                      <option key={u.id} value={u.id}>
                                        {u.block} Blok D:{u.unitNo} - {u.residentName} ({u.residentType === 'owner' ? 'Ev Sahibi' : 'Kiracı'}) - [Borç: {formatCurrency(Math.abs(u.currentBalance))}]
                                      </option>
                                    ))}
                                </optgroup>

                                {/* B Blok */}
                                <optgroup label="🏢 B Blok">
                                  {units
                                    .filter((u) => u.block === 'B')
                                    .map((u) => (
                                      <option key={u.id} value={u.id}>
                                        {u.block} Blok D:{u.unitNo} - {u.residentName} ({u.residentType === 'owner' ? 'Ev Sahibi' : 'Kiracı'}) - [Borç: {formatCurrency(Math.abs(u.currentBalance))}]
                                      </option>
                                    ))}
                                </optgroup>

                                {/* C Blok */}
                                <optgroup label="🏢 C Blok">
                                  {units
                                    .filter((u) => u.block === 'C')
                                    .map((u) => (
                                      <option key={u.id} value={u.id}>
                                        {u.block} Blok D:{u.unitNo} - {u.residentName} ({u.residentType === 'owner' ? 'Ev Sahibi' : 'Kiracı'}) - [Borç: {formatCurrency(Math.abs(u.currentBalance))}]
                                      </option>
                                    ))}
                                </optgroup>
                              </select>
                            </div>

                            {/* Secondary Row: Period selector + Remember Rule Checkbox */}
                            <div className="flex flex-wrap items-center gap-2">
                              {/* Period selection */}
                              <select
                                value={currentPeriod}
                                onChange={(e) =>
                                  handleRowChange(tx.id, { period: e.target.value })
                                }
                                className="text-[11px] rounded-lg px-2 py-1 bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none"
                              >
                                <option value="Eylül 2026 Aidatı">Eylül 2026 Aidatı</option>
                                <option value="Ekim 2026 Aidatı">Ekim 2026 Aidatı</option>
                                <option value="Ağustos 2026 Aidatı">Ağustos 2026 (Gecikmiş)</option>
                                <option value="Demirbaş / Ek Fon">Demirbaş / Ek Bütçe</option>
                                <option value="Cari Avans Ödemesi">Cari Avans / Fazla Ödeme</option>
                              </select>

                              {/* Remember rule checkbox if sender name exists */}
                              {tx.senderName && tx.senderName !== 'Bilinmeyen Gönderen' && (
                                <label className="flex items-center space-x-1.5 text-[11px] text-slate-600 cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    checked={rememberRule}
                                    onChange={(e) =>
                                      handleRowChange(tx.id, { rememberRule: e.target.checked })
                                    }
                                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                                  />
                                  <span title={`"${tx.senderName}" bundan sonraki ekstrelerde otomatik bu daireye atanır`}>
                                    Bu göndereni hatırla
                                  </span>
                                </label>
                              )}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right whitespace-nowrap">
                        {isProcessed ? (
                          <div className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-xl">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>İşlendi</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleProcessSingle(tx)}
                              disabled={!currentUnitId}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center space-x-1 ${
                                currentUnitId
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                              }`}
                              title={
                                currentUnitId
                                  ? 'Bu havaleyi daireye tahsilat olarak işle ve makbuz kes'
                                  : 'Lütfen önce yukarıdan daire seçiniz'
                              }
                            >
                              <span>Daireye İşle</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info Card: KMK ve Muhasebe Entegrasyonu */}
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-xs text-slate-600 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3">
          <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-slate-800">
              634 Sayılı Kat Mülkiyeti Kanunu ve Şeffaf Muhasebe Uyumu
            </p>
            <p className="text-slate-500">
              İçe aktarılan her banka hareketi, seçilen dairenin aidat borcundan düşülür, sitenin cari işletme kasasına eklenir ve dijital arşive resmi e-tahsilat makbuzu olarak kaydedilir. Ayrıca daire sakinine anında SMS ve mobil push bildirimi iletilir.
            </p>
          </div>
        </div>
      </div>

      {/* MODAL: Kayıtlı Eşleştirme Kuralları */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <BookmarkCheck className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Kayıtlı Havale Eşleştirme Kuralları
                </h3>
              </div>
              <button
                onClick={() => setShowRulesModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-3">
              Yöneticinin daha önce onayladığı isim eşleştirmeleri burada saklanır. Banka ekstresi yüklendiğinde bu kurallar öncelikli olarak kontrol edilir.
            </p>

            <div className="mt-4 max-h-64 overflow-y-auto space-y-2">
              {rules.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  Henüz kayıtlı eşleştirme kuralı yok. Havale işlerken "Bu göndereni hatırla" seçeneğini işaretlediğinizde kurallar buraya eklenir.
                </div>
              ) : (
                rules.map((r) => (
                  <div
                    key={r.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800">"{r.senderKeyword}"</span>
                      <span className="text-slate-400 mx-2">→</span>
                      <span className="font-semibold text-emerald-700">{r.unitDisplay}</span>
                    </div>
                    <button
                      onClick={() => onDeleteMatchingRule(r.id)}
                      className="text-rose-600 hover:text-rose-800 text-[11px] font-medium px-2 py-1 rounded hover:bg-rose-50"
                    >
                      Sil
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowRulesModal(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Tekil Manuel Havale Girişi */}
      {showManualTxModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <PlusCircle className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base">Manuel Havale Satırı Ekle</h3>
              </div>
              <button
                onClick={() => setShowManualTxModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveManualTx} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Gönderen Adı Soyadı *
                </label>
                <input
                  type="text"
                  required
                  value={manualSender}
                  onChange={(e) => setManualSender(e.target.value)}
                  placeholder="Örn: Fatma Demirtaş"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tutar (TL) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={manualAmount}
                    onChange={(e) => setManualAmount(e.target.value)}
                    placeholder="1850"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Aidat Dönemi</label>
                  <select
                    value={manualPeriod}
                    onChange={(e) => setManualPeriod(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Eylül 2026 Aidatı">Eylül 2026 Aidatı</option>
                    <option value="Ekim 2026 Aidatı">Ekim 2026 Aidatı</option>
                    <option value="Ağustos 2026 Aidatı">Ağustos 2026 Aidatı</option>
                    <option value="Demirbaş / Ek Bütçe">Demirbaş / Ek Bütçe</option>
                    <option value="Cari Avans Ödemesi">Cari Avans Ödemesi</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Atanacak Daire (Opsiyonel)
                </label>
                <select
                  value={manualUnitId}
                  onChange={(e) => setManualUnitId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Daireyi Sonra Seçeceğim (Uyuşmayan olarak ekle)</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.block} Blok D:{u.unitNo} - {u.residentName} ({formatCurrency(u.monthlyDues)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Banka Açıklaması</label>
                <input
                  type="text"
                  value={manualDesc}
                  onChange={(e) => setManualDesc(e.target.value)}
                  placeholder="Örn: B14 nolu daire kira ve aidat ödemesi"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowManualTxModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm"
                >
                  Havale Listesine Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
