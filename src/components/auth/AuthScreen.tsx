import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  KeyRound,
  Mail,
  Lock,
  Smartphone,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Building,
  Crown,
  Search,
  Users,
  Eye,
  EyeOff,
  RefreshCw,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { AppUser, TenantSite } from '../../types';

interface AuthScreenProps {
  users: AppUser[];
  sites: TenantSite[];
  onLoginSuccess: (user: AppUser) => void;
  onOpenRegisterModal?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  users,
  sites,
  onLoginSuccess,
  onOpenRegisterModal,
}) => {
  const [step, setStep] = useState<'credentials' | 'two_factor'>('credentials');
  const [email, setEmail] = useState('yonetici@zumrutsitesi.com');
  const [password, setPassword] = useState('Admin123*');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // 2FA state
  const [targetUser, setTargetUser] = useState<AppUser | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('742819');
  const [countdown, setCountdown] = useState(60);

  // Timer for OTP countdown
  useEffect(() => {
    let timer: any;
    if (step === 'two_factor' && countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedEmail = email.trim().toLowerCase();
    const matchedUser = users.find((u) => u.email.toLowerCase() === trimmedEmail);

    if (!matchedUser) {
      setErrorMsg('Bu e-posta adresine ait bir kullanıcı kaydı bulunamadı. Lütfen kontrol ediniz.');
      return;
    }

    // Generate random 6-digit OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setTargetUser(matchedUser);
    setOtpCode('');
    setCountdown(60);
    setStep('two_factor');
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUser) return;

    if (otpCode !== generatedOtp) {
      setErrorMsg('Girdiğiniz 6 haneli doğrulama kodu hatalı. Lütfen tekrar deneyiniz.');
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      onLoginSuccess(targetUser);
    }, 450);
  };

  const handleQuickSelectUser = (u: AppUser) => {
    setEmail(u.email);
    setPassword('GuvenliSifre2026!');
    setErrorMsg('');
  };

  const getUserSiteName = (u: AppUser) => {
    if (u.siteId === 'all') return '👑 Global SaaS Yetkilisi (Tüm Siteler)';
    const s = sites.find((site) => site.id === u.siteId);
    return s ? `${s.profile.siteName} (${s.profile.city})` : 'Site Yetkilisi';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-800">
      <div className="w-full max-w-md">
        {/* Brand Banner */}
        <div className="text-center mb-6 space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-400 text-white shadow-xl shadow-indigo-500/20 mb-1">
            <Building className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            ApsisCloud <span className="text-indigo-400 font-light text-lg">Giriş Kapısı</span>
          </h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Kat Mülkiyeti Kanunu ve KVKK Uyumlu İki Aşamalı Güvenli Yönetim Sistemi
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-700/30 overflow-hidden backdrop-blur-md">
          {/* Card Header Status */}
          <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex items-center justify-between text-white">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span className="font-bold text-xs tracking-wide">
                {step === 'credentials' ? '1. Aşama: Kimlik Doğrulama' : '2. Aşama: SMS / OTP Doğrulama (2FA)'}
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              256-Bit SSL
            </span>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {errorMsg && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start space-x-2.5 text-xs text-rose-800 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {step === 'credentials' ? (
              /* STEP 1: Email and Password */
              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Kayıtlı E-Posta Adresiniz *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ad.soyad@ornek.com"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Şifreniz *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>2FA Güvenlik Kodunu İste</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {onOpenRegisterModal && (
                  <div className="pt-3 mt-1 border-t border-slate-100">
                    <div className="p-3 bg-emerald-50/90 border border-emerald-200 rounded-2xl space-y-2 text-left">
                      <div className="flex items-center space-x-2 text-emerald-950 font-bold text-xs">
                        <UserCheck className="w-4 h-4 text-emerald-600" />
                        <span>Sitede Yeni Sakin misiniz?</span>
                      </div>
                      <p className="text-[11px] text-emerald-800 leading-relaxed">
                        Sitenize yeni taşındıysanız veya hesabınız henüz açılmadıysa, telefon numaranız ve e-posta adresinizle kayıt başvurusu oluşturabilirsiniz.
                      </p>
                      <button
                        type="button"
                        onClick={onOpenRegisterModal}
                        className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                        <span>Siteye Sakin Olarak Kayıt Ol (İkametgah Başvurusu)</span>
                      </button>
                    </div>
                  </div>
                )}
              </form>
            ) : (
              /* STEP 2: 2-Factor Authentication Code */
              <form onSubmit={handleOtpSubmit} className="space-y-5">
                {targetUser && (
                  <div className="p-3.5 bg-indigo-50/80 border border-indigo-200 rounded-2xl space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-indigo-950">{targetUser.fullName}</span>
                      <span className="font-mono text-[11px] text-indigo-700">{targetUser.phone}</span>
                    </div>
                    <p className="text-[11px] text-indigo-800">
                      Güvenliğiniz için kayıtlı cep telefonunuza 6 haneli tek kullanımlık SMS onay kodu iletildi.
                    </p>
                  </div>
                )}

                {/* Simulated SMS notification bubble for easy testing */}
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <Smartphone className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <span className="text-[11px] text-amber-900 block font-semibold">Simüle Edilen SMS Kodu:</span>
                      <span className="font-mono font-extrabold text-sm text-amber-950 tracking-widest">{generatedOtp}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setOtpCode(generatedOtp)}
                    className="px-2.5 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-lg text-[10px] font-bold transition-colors"
                  >
                    Kodu Doldur
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    6 Haneli Doğrulama Kodunu Giriniz *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    autoFocus
                    className="w-full text-center tracking-[0.75em] text-xl font-mono font-bold py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Kalan Süre: <strong className="font-mono text-slate-800">{countdown} sn</strong></span>
                  <button
                    type="button"
                    disabled={countdown > 0}
                    onClick={() => {
                      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
                      setGeneratedOtp(newOtp);
                      setCountdown(60);
                      setErrorMsg('');
                    }}
                    className={`font-semibold ${
                      countdown === 0 ? 'text-indigo-600 hover:underline' : 'text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    Yeniden Kod Gönder
                  </button>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    type="submit"
                    disabled={isVerifying || otpCode.length < 6}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-200 transition-all flex items-center justify-center space-x-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isVerifying ? 'Giriş Yapılıyor...' : 'Doğrula ve Güvenli Giriş Yap'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep('credentials');
                      setErrorMsg('');
                    }}
                    className="w-full py-2 text-slate-500 hover:text-slate-800 text-xs font-semibold text-center transition-colors"
                  >
                    ← Başka Hesap ile Giriş Yap
                  </button>
                </div>
              </form>
            )}

            {/* Quick Demo Accounts Switcher (For immediate testing) */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Test Hesapları (Hızlı Seçim)
                </span>
                <span className="text-[10px] text-indigo-600 font-semibold">Yetki & İzolasyon Testi</span>
              </div>

              <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto">
                {users.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleQuickSelectUser(u)}
                    className={`w-full text-left p-2 rounded-xl text-xs transition-all flex items-center justify-between border ${
                      email.toLowerCase() === u.email.toLowerCase()
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="flex items-center space-x-1.5">
                        <span>
                          {u.role === 'superadmin'
                            ? '👑'
                            : u.role === 'manager'
                            ? '🏢'
                            : u.role === 'auditor'
                            ? '🔍'
                            : u.role === 'vendor'
                            ? '🔧'
                            : '🏠'}
                        </span>
                        <span className="font-semibold text-slate-900 truncate">{u.fullName}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono truncate">{u.email}</div>
                    </div>

                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0 border ${
                        u.role === 'superadmin'
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : u.role === 'manager'
                          ? 'bg-indigo-100 text-indigo-900 border-indigo-300'
                          : u.role === 'auditor'
                          ? 'bg-purple-100 text-purple-900 border-purple-300'
                          : u.role === 'vendor'
                          ? 'bg-amber-500 text-slate-950 border-amber-600'
                          : 'bg-slate-200 text-slate-700 border-slate-300'
                      }`}
                    >
                      {u.role === 'superadmin'
                        ? 'Süper Admin'
                        : u.role === 'manager'
                        ? 'Yönetici'
                        : u.role === 'auditor'
                        ? 'Denetçi'
                        : u.role === 'vendor'
                        ? 'Usta & Firma'
                        : 'Sakin'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Security Footer */}
        <div className="mt-4 text-center text-xs text-slate-400 space-y-1">
          <p>🔒 2 Faktörlü Kimlik Doğrulama ile korunan bulut altyapısı.</p>
          <p className="text-[11px] text-slate-500">
            Sadece Süper Admin tüm siteleri görebilir; diğer kullanıcılar sadece kendi sitelerine erişebilir.
          </p>
        </div>
      </div>
    </div>
  );
};
