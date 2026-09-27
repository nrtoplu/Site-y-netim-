import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Building2,
  Lock,
  CheckCircle2,
  Copy,
  Check,
  Shield,
  Smartphone,
  ArrowRight,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { DuesRecord, SiteProfile } from '../../types';
import { formatCurrency, generateReceiptNo } from '../../utils/formatters';

interface PaymentModalProps {
  due: DuesRecord;
  siteProfile: SiteProfile;
  onClose: () => void;
  onPaymentComplete: (updatedDue: DuesRecord) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  due,
  siteProfile,
  onClose,
  onPaymentComplete,
}) => {
  const [activeTab, setActiveTab] = useState<'card' | 'bank'>('card');
  const [step, setStep] = useState<'details' | 'otp' | 'success'>('details');

  // Card Form State
  const [cardNumber, setCardNumber] = useState('5428 7200 4819 3342');
  const [cardHolder, setCardHolder] = useState(due.residentName || 'ALİ YILMAZ');
  const [expiry, setExpiry] = useState('11/27');
  const [cvv, setCvv] = useState('482');
  const [installment, setInstallment] = useState('1');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // OTP State
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState(false);

  // Bank Transfer Form State
  const [copiedIban, setCopiedIban] = useState(false);
  const [eftSenderName, setEftSenderName] = useState(due.residentName);
  const [eftRefNo, setEftRefNo] = useState('EFT-' + Math.floor(100000 + Math.random() * 900000));
  const [bankSubmitting, setBankSubmitting] = useState(false);

  const totalAmount = due.amount + (due.lateFee || 0);

  const handleCopyIban = () => {
    navigator.clipboard.writeText(siteProfile.iban.replace(/\s+/g, ''));
    setCopiedIban(true);
    setTimeout(() => setCopiedIban(false), 2000);
  };

  const handleStartCardPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep('otp');
    }, 900);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 4) {
      setOtpError(true);
      return;
    }
    setOtpError(false);
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setStep('success');

      const updatedDue: DuesRecord = {
        ...due,
        status: 'paid',
        paidDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'credit_card',
        receiptNo: generateReceiptNo(),
        transactionRef: `3DS-${Math.floor(10000000 + Math.random() * 90000000)}`,
        description: `${due.month} Aidatı (Online 3D Secure Kart Tahsilatı)`,
      };

      onPaymentComplete(updatedDue);
    }, 1100);
  };

  const handleBankTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBankSubmitting(true);
    setTimeout(() => {
      setBankSubmitting(false);
      setStep('success');

      const updatedDue: DuesRecord = {
        ...due,
        status: 'paid',
        paidDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'bank_transfer',
        receiptNo: generateReceiptNo(),
        transactionRef: eftRefNo,
        description: `${due.month} Aidatı (${siteProfile.bankName} Havale/EFT Dekontu)`,
      };

      onPaymentComplete(updatedDue);
    }, 1000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-sm p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-modal-title"
    >
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
              <Lock className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 id="payment-modal-title" className="font-semibold text-base">
                Güvenli Online Aidat Ödemesi
              </h2>
              <p className="text-xs text-slate-300">
                256-Bit SSL Şifrelemeli Banka Entegrasyonu
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
            aria-label="Ödeme penceresini kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Due Summary Card */}
        <div className="bg-indigo-50/70 border-b border-indigo-100 px-6 py-3 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-indigo-900 block">
              {due.unitDisplay} • {due.residentName}
            </span>
            <span className="text-xs text-indigo-700">
              {due.month} Aidat Bedeli {due.lateFee > 0 && `(+${formatCurrency(due.lateFee)} Gecikme Zammı)`}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 block uppercase font-medium">Ödenecek Tutar</span>
            <span className="text-xl font-bold text-indigo-900 font-mono">
              {formatCurrency(totalAmount)}
            </span>
          </div>
        </div>

        {/* Success View */}
        {step === 'success' ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Ödemeniz Başarıyla Gerçekleşti!</h3>
              <p className="text-sm text-slate-600 mt-1 max-w-sm mx-auto">
                {due.month} aidat ödemeniz site bütçesine işlenmiş ve bakiyeniz güncellenmiştir. Resmi tahsilat makbuzunuz üretilmiştir.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-w-sm mx-auto text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Tutar:</span>
                <span className="font-bold text-slate-800 font-mono">{formatCurrency(totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">İşlem Saati:</span>
                <span className="text-slate-700">Şimdi (Canlı Onay)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Banka Onay Kodu:</span>
                <span className="font-mono text-indigo-600 font-semibold">TRX-{Math.floor(100000 + Math.random() * 900000)}</span>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-center space-x-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl shadow-sm transition-all"
              >
                Tamam, Pencereyi Kapat
              </button>
            </div>
          </div>
        ) : step === 'otp' ? (
          /* 3D Secure OTP Verification Step */
          <div className="p-6 space-y-5">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start space-x-3">
              <Smartphone className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 space-y-1">
                <p className="font-semibold">3D Secure Doğrulama Kodu Gönderildi</p>
                <p>
                  Bankanızda kayıtlı cep telefonunuza 6 haneli güvenlik şifresi SMS ile gönderilmiştir. Lütfen kodu giriniz. (Test Kodu: <strong className="font-mono text-indigo-700 bg-amber-100 px-1 py-0.5 rounded">748291</strong>)
                </p>
              </div>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4 max-w-sm mx-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tek Kullanımlık Onay Kodu (SMS OTP)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="748291"
                    className="w-full text-center tracking-[0.5em] text-2xl font-mono py-2.5 px-4 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none font-bold text-slate-900"
                    autoFocus
                  />
                </div>
                {otpError && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Lütfen gelen 6 haneli güvenlik kodunu eksiksiz giriniz.</span>
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Kalan Süre: 02:45</span>
                <button
                  type="button"
                  onClick={() => setOtpCode('748291')}
                  className="text-indigo-600 hover:underline font-medium"
                >
                  Kodu Otomatik Doldur
                </button>
              </div>

              <div className="pt-2 flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="w-1/3 py-2.5 border border-slate-300 text-slate-700 font-medium text-xs rounded-xl hover:bg-slate-50"
                >
                  Geri Dön
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-2/3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Doğrulanıyor...</span>
                  ) : (
                    <>
                      <span>Ödemeyi Tamamla</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Payment Method Tabs (Card vs Bank) */
          <div>
            {/* Tabs */}
            <div className="flex border-b border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTab('card')}
                className={`flex-1 py-3 px-4 text-xs font-semibold flex items-center justify-center space-x-2 border-b-2 transition-colors ${
                  activeTab === 'card'
                    ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Kredi / Banka Kartı (Anında Onay)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('bank')}
                className={`flex-1 py-3 px-4 text-xs font-semibold flex items-center justify-center space-x-2 border-b-2 transition-colors ${
                  activeTab === 'bank'
                    ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Havale / EFT / FAST</span>
              </button>
            </div>

            {activeTab === 'card' ? (
              <form onSubmit={handleStartCardPayment} className="p-6 space-y-4">
                {/* Virtual Card Preview */}
                <div className="w-full h-44 rounded-2xl bg-gradient-to-tr from-slate-900 via-indigo-900 to-indigo-700 p-5 text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute right-[-20px] top-[-20px] w-40 h-40 bg-white/5 rounded-full blur-xl pointer-events-none" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold tracking-wider text-indigo-200 uppercase">
                      Site Aidat Kartı
                    </span>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-mono font-bold">
                        TROY / VISA
                      </span>
                    </div>
                  </div>

                  <div className="font-mono text-lg tracking-[0.25em] font-semibold text-slate-100">
                    {cardNumber || '•••• •••• •••• ••••'}
                  </div>

                  <div className="flex items-end justify-between text-xs">
                    <div>
                      <span className="text-[9px] text-indigo-300 block uppercase tracking-wider">
                        Kart Sahibi
                      </span>
                      <span className="font-medium tracking-wide uppercase">
                        {cardHolder || 'AD SOYAD'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-indigo-300 block uppercase tracking-wider text-right">
                        Son Kul.
                      </span>
                      <span className="font-mono font-medium">{expiry || 'MM/YY'}</span>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Kart Numarası
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="5428 7200 4819 3342"
                        className="w-full text-sm font-mono py-2 pl-9 pr-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        required
                      />
                      <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Kart Üzerindeki İsim
                      </label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        placeholder="ALİ YILMAZ"
                        className="w-full text-sm py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none uppercase"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          SKT (Ay/Yıl)
                        </label>
                        <input
                          type="text"
                          value={expiry}
                          onChange={(e) => setExpiry(e.target.value)}
                          placeholder="11/27"
                          maxLength={5}
                          className="w-full text-sm font-mono py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          CVV / CVC
                        </label>
                        <input
                          type="text"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value)}
                          placeholder="482"
                          maxLength={4}
                          className="w-full text-sm font-mono py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Installment Selector */}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Ödeme Taksit Seçeneği
                    </label>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <label
                        className={`border rounded-lg p-2 flex flex-col cursor-pointer transition-colors ${
                          installment === '1'
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-semibold'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="installment"
                          value="1"
                          checked={installment === '1'}
                          onChange={() => setInstallment('1')}
                          className="sr-only"
                        />
                        <span>Tek Çekim</span>
                        <span className="font-mono text-indigo-700 mt-0.5">
                          {formatCurrency(totalAmount)}
                        </span>
                        <span className="text-[10px] text-emerald-600">Komisyonsuz</span>
                      </label>

                      <label
                        className={`border rounded-lg p-2 flex flex-col cursor-pointer transition-colors ${
                          installment === '3'
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-semibold'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="installment"
                          value="3"
                          checked={installment === '3'}
                          onChange={() => setInstallment('3')}
                          className="sr-only"
                        />
                        <span>3 Taksit</span>
                        <span className="font-mono text-indigo-700 mt-0.5">
                          3 x {formatCurrency(Math.round(totalAmount / 3))}
                        </span>
                        <span className="text-[10px] text-slate-500">Vade Farksız</span>
                      </label>

                      <label
                        className={`border rounded-lg p-2 flex flex-col cursor-pointer transition-colors ${
                          installment === '6'
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-semibold'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="installment"
                          value="6"
                          checked={installment === '6'}
                          onChange={() => setInstallment('6')}
                          className="sr-only"
                        />
                        <span>6 Taksit</span>
                        <span className="font-mono text-indigo-700 mt-0.5">
                          6 x {formatCurrency(Math.round((totalAmount * 1.05) / 6))}
                        </span>
                        <span className="text-[10px] text-amber-600">+%5 Banka Payı</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Security Trust Badges */}
                <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100">
                  <span className="flex items-center space-x-1">
                    <Shield className="w-3.5 h-3.5 text-emerald-600" />
                    <span>3D Secure ile SMS Doğrulamalı</span>
                  </span>
                  <span>Masterpass • Troy • Visa</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Bağlantı Kuruluyor...</span>
                  ) : (
                    <>
                      <span>{formatCurrency(totalAmount)} Güvenli Öde</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Bank Transfer View */
              <form onSubmit={handleBankTransferSubmit} className="p-6 space-y-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-500 block">BANKA ADI</span>
                      <span className="text-sm font-bold text-slate-800">{siteProfile.bankName}</span>
                    </div>
                    <span className="text-xs bg-indigo-100 text-indigo-800 font-semibold px-2 py-0.5 rounded">
                      Resmi Hesap
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-slate-500 block">HESAP SAHİBİ</span>
                    <span className="text-xs font-bold text-slate-800">{siteProfile.accountHolder}</span>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-slate-500 block mb-1">IBAN NUMARASI</span>
                    <div className="flex items-center justify-between bg-white border border-slate-300 rounded-lg p-2 font-mono text-xs font-semibold text-slate-900">
                      <span>{siteProfile.iban}</span>
                      <button
                        type="button"
                        onClick={handleCopyIban}
                        className="inline-flex items-center space-x-1 text-indigo-600 hover:text-indigo-800 text-xs px-2 py-1 rounded hover:bg-indigo-50"
                      >
                        {copiedIban ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedIban ? 'Kopyalandı' : 'Kopyala'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-[11px] text-amber-900">
                    <strong>Önemli Açıklama Şablonu:</strong> Havale/EFT yaparken açıklama kısmına{' '}
                    <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-semibold">
                      "{due.unitDisplay} {due.residentName} {due.month} Aidatı"
                    </code>{' '}
                    yazmayı unutmayınız.
                  </div>
                </div>

                {/* Dekont Bildirim Formu */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Dekont Bildirimi Yap
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">Gönderen Adı Soyadı</label>
                      <input
                        type="text"
                        value={eftSenderName}
                        onChange={(e) => setEftSenderName(e.target.value)}
                        className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">Dekont Referans No / Kod</label>
                      <input
                        type="text"
                        value={eftRefNo}
                        onChange={(e) => setEftRefNo(e.target.value)}
                        className="w-full text-xs font-mono py-2 px-3 border border-slate-300 rounded-lg outline-none"
                        required
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={bankSubmitting}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {bankSubmitting ? (
                    <span>Kayıt İşleniyor...</span>
                  ) : (
                    <>
                      <FileCheck className="w-4 h-4" />
                      <span>Havale Dekontunu Bildir & Onaya Gönder</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
