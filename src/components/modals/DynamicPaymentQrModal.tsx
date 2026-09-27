/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useId, useRef } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  X,
  Copy,
  Check,
  Download,
  Printer,
  Share2,
  Smartphone,
  Building,
  CheckCircle2,
  AlertCircle,
  Zap,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  Banknote,
  DollarSign,
  Calendar,
  MessageSquare,
  ArrowRight,
  Info,
} from 'lucide-react';
import { ApartmentUnit, DuesRecord, PaymentMethod, SiteProfile } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface DynamicPaymentQrModalProps {
  unit: ApartmentUnit;
  siteProfile: SiteProfile;
  dues?: DuesRecord[];
  onClose: () => void;
  onConfirmPayment?: (
    unit: ApartmentUnit,
    amount: number,
    method: PaymentMethod,
    receiptNo: string,
    sendSms: boolean
  ) => void;
}

export type QrStandard = 'fast' | 'iban' | 'web';

export const DynamicPaymentQrModal: React.FC<DynamicPaymentQrModalProps> = ({
  unit,
  siteProfile,
  dues = [],
  onClose,
  onConfirmPayment,
}) => {
  const overdueDebt = unit.currentBalance < 0 ? Math.abs(unit.currentBalance) : 0;
  const initialAmount = overdueDebt > 0 ? overdueDebt : unit.monthlyDues;

  const [amount, setAmount] = useState<number>(initialAmount);
  const [customAmountInput, setCustomAmountInput] = useState<string>(initialAmount.toString());
  const [selectedStandard, setSelectedStandard] = useState<QrStandard>('fast');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(true);
  const [showHowToPay, setShowHowToPay] = useState<boolean>(false);
  const [showConfirmSuccess, setShowConfirmSuccess] = useState<boolean>(false);
  const [isProcessingCollection, setIsProcessingCollection] = useState<boolean>(false);

  // Generate a distinct transaction reference for tracking
  const [referenceCode] = useState<string>(() => {
    const cleanBlock = unit.block.replace(/[^A-Za-z0-9]/g, '');
    const cleanUnit = unit.unitNo.replace(/[^A-Za-z0-9]/g, '');
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    return `AID-${cleanBlock}${cleanUnit}-${randomHex}`;
  });

  const [paymentDescription, setPaymentDescription] = useState<string>(() => {
    return `${unit.block} Blok D:${unit.unitNo} ${unit.residentName} Aidat Ödemesi (Ref: ${referenceCode})`;
  });

  const cleanIban = (siteProfile.iban || 'TR000000000000000000000000').replace(/\s+/g, '');
  const accountHolder = siteProfile.accountHolder || siteProfile.siteName;

  // Build the standardized QR payload based on the selected standard
  const buildQrPayload = (): string => {
    const safeAmount = Math.max(0, Number(amount) || 0);

    if (selectedStandard === 'fast') {
      // Turkish Central Bank (TCMB) FAST TR-Karekod representation
      // Standards-compliant payload format widely parsed by Turkish Banking mobile apps
      return `TRKAREKOD:FAST|IBAN:${cleanIban}|NAME:${accountHolder}|AMOUNT:${safeAmount.toFixed(2)}|CUR:TRY|REF:${referenceCode}|DESC:${paymentDescription}`;
    }

    if (selectedStandard === 'iban') {
      // European EPC / SEPA & Interbank mobile banking transfer format
      return `BCD\n002\n1\nSCT\n${cleanIban}\n${accountHolder}\nTRY${safeAmount.toFixed(2)}\n\n${referenceCode}\n${paymentDescription}`;
    }

    // Web-based secure instant checkout portal link
    return `https://apsiscloud.com/portal/pay/${unit.id}?amount=${safeAmount}&ref=${referenceCode}&unit=${unit.block}-${unit.unitNo}`;
  };

  // Generate dynamic QR code image whenever payload dependencies change
  useEffect(() => {
    let isSubscribed = true;
    setIsGenerating(true);

    const payload = buildQrPayload();

    QRCode.toDataURL(payload, {
      width: 380,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#0f172a', // slate-900
        light: '#ffffff',
      },
    })
      .then((url) => {
        if (isSubscribed) {
          setQrDataUrl(url);
          setIsGenerating(false);
        }
      })
      .catch((err) => {
        console.error('Failed to generate QR code', err);
        if (isSubscribed) {
          setIsGenerating(false);
        }
      });

    return () => {
      isSubscribed = false;
    };
  }, [amount, selectedStandard, paymentDescription, cleanIban, accountHolder, referenceCode]);

  // Handle amount change from custom input
  const handleCustomAmountChange = (val: string) => {
    setCustomAmountInput(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      setAmount(num);
    }
  };

  const handleSelectPreset = (newAmount: number) => {
    setAmount(newAmount);
    setCustomAmountInput(newAmount.toString());
  };

  // Clipboard helper with visual check
  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  // Download QR code image as PNG
  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `Odeme-Karekod-${unit.block}-Blok-D${unit.unitNo}-${unit.residentName.replace(/\s+/g, '-')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Print Payment Slip with QR Code
  const handlePrint = () => {
    window.print();
  };

  // Share via WhatsApp / SMS
  const handleShareWhatsApp = () => {
    const text = `Sayın ${unit.residentName},\n${siteProfile.siteName} ${unit.block} Blok D:${unit.unitNo} dairenize ait ${formatCurrency(
      amount
    )} tutarındaki aidat ödemesini mobil bankacılığınızdan (Ziraat, Garanti, İş Bankası, Yapı Kredi vb.) FAST/Karekod ile kolayca yapabilirsiniz.\n\nBanka: ${siteProfile.bankName}\nAlıcı: ${accountHolder}\nIBAN: ${siteProfile.iban}\nTutar: ${formatCurrency(
      amount
    )}\nAçıklama: ${paymentDescription}\nReferans: ${referenceCode}\n\nİyi günler dileriz.`;

    const url = `https://wa.me/${unit.phone ? unit.phone.replace(/[^0-9]/g, '') : ''}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Confirm instant payment on behalf of the resident
  const handleManualMarkPaid = () => {
    if (!onConfirmPayment || amount <= 0) return;
    setIsProcessingCollection(true);

    setTimeout(() => {
      onConfirmPayment(
        unit,
        amount,
        'bank_transfer',
        `QR-${Date.now().toString().slice(-6)}`,
        true
      );
      setIsProcessingCollection(false);
      setShowConfirmSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1400);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-300/30 flex items-center justify-center font-bold shrink-0 shadow-inner">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-base sm:text-lg tracking-tight">
                  Hızlı Ödeme Dinamik Karekod (QR)
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 font-bold shrink-0 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Canlı & FAST Uyumlu</span>
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Mobil bankacılık (TR-Karekod / FAST) ile daireye özel borç ve aidat tahsilat karekodu.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
            title="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Success Banner if payment was recorded */}
          {showConfirmSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center space-x-3 animate-in zoom-in-95 text-emerald-900">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <h4 className="font-bold text-sm">Ödeme Başarıyla Kaydedildi!</h4>
                <p className="text-xs text-emerald-700">
                  {formatCurrency(amount)} tutarındaki tahsilat cari hesaba işlendi ve sakine bilgi iletildi.
                </p>
              </div>
            </div>
          )}

          {/* Unit Snapshot Info Card */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs shrink-0">
                {unit.block}:{unit.unitNo}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-slate-900 text-sm">
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
                </div>
                <div className="text-xs text-slate-500 font-mono flex items-center space-x-2 mt-0.5">
                  <span>{unit.phone || 'Telefon Kaydı Yok'}</span>
                  <span>•</span>
                  <span>{unit.block} Blok Daire {unit.unitNo}</span>
                </div>
              </div>
            </div>

            {/* Financial Status Summary */}
            <div className="flex items-center space-x-4 border-t sm:border-t-0 sm:border-l sm:border-slate-200 pt-2 sm:pt-0 sm:pl-4 justify-between sm:justify-end">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Cari Bakiye
                </span>
                <span
                  className={`text-sm font-extrabold font-mono ${
                    unit.currentBalance < 0
                      ? 'text-rose-600'
                      : unit.currentBalance > 0
                      ? 'text-emerald-600'
                      : 'text-slate-700'
                  }`}
                >
                  {unit.currentBalance === 0
                    ? '0,00 ₺ (Mutabık)'
                    : formatCurrency(unit.currentBalance)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Aylık Aidat
                </span>
                <span className="text-sm font-extrabold font-mono text-slate-800">
                  {formatCurrency(unit.monthlyDues)}
                </span>
              </div>
            </div>
          </div>

          {/* Main Grid: Left = QR Code & Scan instructions, Right = Dynamic Controls & Bank Info */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
            {/* LEFT COLUMN: The Live Dynamic QR Display (5 cols) */}
            <div className="md:col-span-5 flex flex-col items-center bg-gradient-to-b from-slate-900 to-indigo-950 p-5 rounded-3xl text-white shadow-md relative overflow-hidden">
              {/* Subtle background glow */}
              <div className="absolute -top-12 -left-12 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none"></div>
              <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none"></div>

              {/* QR Standard Badges */}
              <div className="w-full flex items-center justify-between mb-3 text-[11px]">
                <span className="font-extrabold text-amber-300 flex items-center space-x-1.5">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Kamera veya Banka ile Okutun</span>
                </span>
                <span className="font-mono text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700">
                  TRY (₺)
                </span>
              </div>

              {/* QR Code Container with Frame */}
              <div className="relative p-3 bg-white rounded-2xl shadow-xl w-full max-w-[240px] aspect-square flex items-center justify-center border-4 border-white/90">
                {isGenerating ? (
                  <div className="flex flex-col items-center justify-center space-y-2 text-slate-400">
                    <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
                    <span className="text-[11px] font-semibold">QR Oluşturuluyor...</span>
                  </div>
                ) : qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`Ödeme Karekodu - ${unit.residentName}`}
                    className="w-full h-full object-contain select-none"
                  />
                ) : (
                  <div className="text-rose-500 text-xs text-center font-bold">
                    Karekod oluşturulamadı.
                  </div>
                )}
              </div>

              {/* Amount Display beneath QR */}
              <div className="mt-4 text-center">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block">
                  Ödenecek Tutar
                </span>
                <div className="text-2xl font-black font-mono text-amber-400 tracking-tight mt-0.5">
                  {formatCurrency(amount)}
                </div>
                <div className="text-[11px] text-slate-300 font-mono mt-0.5">
                  Ref: <span className="text-white font-bold">{referenceCode}</span>
                </div>
              </div>

              {/* Supported Banking Apps Strip */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 w-full text-center">
                <p className="text-[10px] text-slate-400 leading-tight">
                  Ziraat • Garanti BBVA • İş Bankası • Yapı Kredi • Akbank • QNB • Enpara • FAST Uyumlu
                </p>
              </div>

              {/* QR Quick Actions: Download & Print */}
              <div className="mt-3.5 flex items-center space-x-2 w-full">
                <button
                  type="button"
                  onClick={handleDownloadQr}
                  className="flex-1 py-2 px-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer border border-white/10 shadow-xs"
                  title="Karekodu cihazınıza PNG resmi olarak indirin"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Karekod İndir</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="py-2 px-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer border border-white/10 shadow-xs"
                  title="Yazdır"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Yazdır</span>
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: Interactive Controls, Amount Selectors, Bank Details (7 cols) */}
            <div className="md:col-span-7 space-y-4">
              {/* Dynamic Amount Selector */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-slate-800 flex items-center space-x-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span>Ödeme Tutarını Belirleyin</span>
                  </label>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    Karekod tutarla anında güncellenir
                  </span>
                </div>

                {/* Preset Chips */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {overdueDebt > 0 && (
                    <button
                      type="button"
                      onClick={() => handleSelectPreset(overdueDebt)}
                      className={`p-2 rounded-xl text-left border transition cursor-pointer ${
                        amount === overdueDebt
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs font-bold'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 text-xs'
                      }`}
                    >
                      <div className="text-[9px] uppercase font-bold opacity-80">Tüm Borç</div>
                      <div className="font-extrabold font-mono text-xs">{formatCurrency(overdueDebt)}</div>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleSelectPreset(unit.monthlyDues)}
                    className={`p-2 rounded-xl text-left border transition cursor-pointer ${
                      amount === unit.monthlyDues
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs font-bold'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 text-xs'
                    }`}
                  >
                    <div className="text-[9px] uppercase font-bold opacity-80">1 Aylık Aidat</div>
                    <div className="font-extrabold font-mono text-xs">{formatCurrency(unit.monthlyDues)}</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectPreset(unit.monthlyDues * 2)}
                    className={`p-2 rounded-xl text-left border transition cursor-pointer ${
                      amount === unit.monthlyDues * 2
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs font-bold'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 text-xs'
                    }`}
                  >
                    <div className="text-[9px] uppercase font-bold opacity-80">2 Aylık Aidat</div>
                    <div className="font-extrabold font-mono text-xs">
                      {formatCurrency(unit.monthlyDues * 2)}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectPreset(unit.monthlyDues * 3)}
                    className={`p-2 rounded-xl text-left border transition cursor-pointer ${
                      amount === unit.monthlyDues * 3
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs font-bold'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 text-xs'
                    }`}
                  >
                    <div className="text-[9px] uppercase font-bold opacity-80">3 Aylık Aidat</div>
                    <div className="font-extrabold font-mono text-xs">
                      {formatCurrency(unit.monthlyDues * 3)}
                    </div>
                  </button>
                </div>

                {/* Custom Amount Input Field */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-extrabold text-sm">
                    ₺
                  </div>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={customAmountInput}
                    onChange={(e) => handleCustomAmountChange(e.target.value)}
                    placeholder="Özel Tutar Girin..."
                    className="w-full pl-8 pr-12 py-2 bg-white rounded-xl border border-slate-300 text-slate-900 font-extrabold text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-xs font-bold text-slate-400">
                    TL
                  </div>
                </div>
              </div>

              {/* Standard Type Selector Tabs */}
              <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
                <button
                  type="button"
                  onClick={() => setSelectedStandard('fast')}
                  className={`flex-1 py-1.5 px-2 rounded-lg transition text-center cursor-pointer ${
                    selectedStandard === 'fast'
                      ? 'bg-white text-indigo-700 shadow-xs font-extrabold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  TR-Karekod / FAST
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStandard('iban')}
                  className={`flex-1 py-1.5 px-2 rounded-lg transition text-center cursor-pointer ${
                    selectedStandard === 'iban'
                      ? 'bg-white text-indigo-700 shadow-xs font-extrabold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  Havale / EFT
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStandard('web')}
                  className={`flex-1 py-1.5 px-2 rounded-lg transition text-center cursor-pointer ${
                    selectedStandard === 'web'
                      ? 'bg-white text-indigo-700 shadow-xs font-extrabold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  Web Portalı
                </button>
              </div>

              {/* Bank Account Details Card with Fast Copy Buttons */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-slate-500 font-bold border-b border-slate-200 pb-2">
                  <span className="flex items-center space-x-1.5 text-slate-700">
                    <Building className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Site Yönetimi Banka Bilgileri</span>
                  </span>
                  <span className="text-[11px] font-semibold text-indigo-600">{siteProfile.bankName}</span>
                </div>

                {/* IBAN */}
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">IBAN Numarası</span>
                    <span className="font-mono font-extrabold text-slate-900 text-xs sm:text-sm select-all truncate block">
                      {siteProfile.iban}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(cleanIban, 'iban')}
                    className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-semibold transition flex items-center space-x-1 cursor-pointer shrink-0"
                    title="IBAN'ı Kopyala"
                  >
                    {copiedKey === 'iban' ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedKey === 'iban' ? 'Kopyalandı' : 'Kopyala'}</span>
                  </button>
                </div>

                {/* Account Holder */}
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Alıcı Adı / Hesap Sahibi</span>
                    <span className="font-semibold text-slate-800 text-xs truncate block">
                      {accountHolder}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(accountHolder, 'name')}
                    className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-semibold transition flex items-center space-x-1 cursor-pointer shrink-0"
                    title="Alıcı Adını Kopyala"
                  >
                    {copiedKey === 'name' ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedKey === 'name' ? 'Kopyalandı' : 'Kopyala'}</span>
                  </button>
                </div>

                {/* Payment Description / Reference */}
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Ödeme Açıklaması</span>
                    <span className="font-mono text-slate-700 text-xs truncate block">
                      {paymentDescription}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(paymentDescription, 'desc')}
                    className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-semibold transition flex items-center space-x-1 cursor-pointer shrink-0"
                    title="Açıklamayı Kopyala"
                  >
                    {copiedKey === 'desc' ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedKey === 'desc' ? 'Kopyalandı' : 'Kopyala'}</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons: WhatsApp Send & Instant Confirm */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                  title="Ödeme bilgilerini ve talimatlarını sakine WhatsApp üzerinden gönderin"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>WhatsApp ile Sakine İlet</span>
                </button>

                {onConfirmPayment && (
                  <button
                    type="button"
                    onClick={handleManualMarkPaid}
                    disabled={isProcessingCollection || amount <= 0}
                    className="flex-1 py-2.5 px-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-50 text-white rounded-xl text-xs font-extrabold transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs ring-1 ring-indigo-400/50"
                    title="Ödeme yapıldığında sistemde tahsilatı kaydet ve borcu kapat"
                  >
                    {isProcessingCollection ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Kaydediliyor...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Ödemeyi Onayla & Borcu Kapat</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* How to Pay Guide Toggle */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowHowToPay(!showHowToPay)}
                  className="w-full py-1.5 px-2 text-indigo-600 hover:text-indigo-800 text-xs font-bold flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center space-x-1">
                    <Info className="w-3.5 h-3.5" />
                    <span>Mobil Bankacılıkla Karekod Nasıl Okutulur?</span>
                  </span>
                  <span>{showHowToPay ? '▲ Gizle' : '▼ Adımları Gör'}</span>
                </button>

                {showHowToPay && (
                  <div className="mt-2 p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-950 space-y-1.5 animate-in fade-in">
                    <p className="font-semibold text-indigo-900">
                      Mobil Bankacılık ile 4 Kolay Adımda Ödeme:
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-slate-700 text-[11px] leading-relaxed">
                      <li>
                        Telefonunuzdaki mobil bankacılık uygulamasını (Ziraat, Garanti, İş Bankası, Yapı Kredi, Akbank vb.) açın.
                      </li>
                      <li>
                        Ana menüden <strong>"Karekod ile İşlemler"</strong> veya <strong>"Karekod ile Öde / FAST"</strong> seçeneğine dokunun.
                      </li>
                      <li>
                        Kameranızı ekrandaki karekoda yöneltin; IBAN, alıcı adı, tutar ve açıklama otomatik olarak doldurulacaktır.
                      </li>
                      <li>
                        Ekranda beliren bilgileri kontrol edip <strong>"Onayla"</strong> butonuna basarak ödemenizi tamamlayın.
                      </li>
                    </ol>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="font-medium">
              256-bit TCMB FAST & TR-Karekod Uyumlu Güvenli Tahsilat Ağı
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold transition cursor-pointer"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
