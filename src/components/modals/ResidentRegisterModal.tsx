import React, { useState } from 'react';
import {
  X,
  UserCheck,
  Building,
  Upload,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { ResidentRegistrationApplication, TenantSite, BlockId } from '../../types';

interface ResidentRegisterModalProps {
  currentSite: TenantSite;
  sites?: TenantSite[];
  onClose: () => void;
  onSubmitApplication: (app: ResidentRegistrationApplication) => void;
}

export const ResidentRegisterModal: React.FC<ResidentRegisterModalProps> = ({
  currentSite,
  sites,
  onClose,
  onSubmitApplication,
}) => {
  const [selectedSiteId, setSelectedSiteId] = useState(currentSite.id);
  const activeSite = (sites && sites.find((s) => s.id === selectedSiteId)) || currentSite;

  const [fullName, setFullName] = useState('');
  const [tcNo, setTcNo] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [block, setBlock] = useState<BlockId>('A');
  const [unitNo, setUnitNo] = useState('1');
  const [residentType, setResidentType] = useState<'owner' | 'tenant'>('tenant');
  const [documentType, setDocumentType] = useState<'title_deed' | 'lease_contract' | 'residence_certificate'>(
    'lease_contract'
  );
  const [documentName, setDocumentName] = useState('Kira_Kontrati_Belgesi.pdf');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const cleanPhone = phone.trim();
    const cleanEmail = email.trim();

    if (!cleanPhone) {
      setFormError('Lütfen SMS ile giriş şifrenizin gönderileceği cep telefonu numaranızı giriniz.');
      return;
    }

    const digitsOnly = cleanPhone.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      setFormError('Lütfen geçerli bir telefon numarası giriniz (en az 10 hane, örn: 0532 000 00 00).');
      return;
    }

    if (!cleanEmail) {
      setFormError('Lütfen aidat makbuzu ve bildirimlerin iletileceği e-posta adresinizi giriniz.');
      return;
    }

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setFormError('Lütfen geçerli bir e-posta adresi giriniz (örn: ad.soyad@ornek.com).');
      return;
    }

    setIsSubmitting(true);

    const newApp: ResidentRegistrationApplication = {
      id: `app-${Date.now()}`,
      siteId: activeSite.id,
      fullName: fullName.trim(),
      tcNo: tcNo.trim() || '10000000000',
      phone: cleanPhone,
      email: cleanEmail,
      block,
      unitNo,
      residentType,
      documentType,
      documentName,
      status: 'pending',
      applicationDate: new Date().toISOString().split('T')[0],
      notes,
    };

    setTimeout(() => {
      onSubmitApplication(newApp);
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 400);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-sm p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <UserCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="font-bold text-sm">Site Sakin Kayıt & İkametgah Başvurusu</h2>
              <p className="text-[11px] text-slate-400">{activeSite.profile.siteName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {isSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Başvurunuz Site Yönetimine İletildi!
            </h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              <strong>{activeSite.profile.siteName} - {block} Blok Daire {unitNo}</strong> ikametgah onay talebiniz site yönetimi onay masasına kaydedildi. Site yöneticisi tapu veya kira sözleşmenizi inceleyip onayladığında <strong>{phone}</strong> nolu telefonunuza SMS ile giriş şifreniz gönderilecek ve <strong>{email}</strong> adresinize onay e-postası iletilecektir.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              Tamamla ve Kapat
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-300 rounded-2xl flex items-start space-x-2.5 text-xs text-rose-800 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            {/* Site selector if multiple sites passed */}
            {sites && sites.length > 1 && (
              <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-1.5">
                <label className="block text-xs font-bold text-indigo-950 flex items-center space-x-1.5">
                  <Building className="w-4 h-4 text-indigo-600" />
                  <span>Kayıt Olmak İstediğiniz Site / Apartman *</span>
                </label>
                <select
                  value={selectedSiteId}
                  onChange={(e) => setSelectedSiteId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                >
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.profile.siteName} ({s.profile.city}) - {s.profile.totalFlats} Daire
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-indigo-700">
                  Lütfen ikamet ettiğiniz veya taşındığınız siteyi seçiniz.
                </p>
              </div>
            )}

            {/* Explanatory Notice */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-start space-x-2.5 text-xs text-amber-900">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                634 Sayılı KMK gereğince, site sakini hesap erişimi için ibraz edeceğiniz daire bilgilerinin <strong>Site Yönetimi tarafından onaylanması zorunludur</strong>.
              </span>
            </div>

            {/* Resident Personal Data */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                1. Kimlik & İletişim Bilgileri
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Adınız Soyadınız *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ad Soyad"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    T.C. Kimlik Numarası *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={11}
                    placeholder="11 Haneli TC No"
                    value={tcNo}
                    onChange={(e) => setTcNo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                    <Phone className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Cep Telefonu Numarası *</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      placeholder="0532 000 00 00"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    SMS giriş şifreniz bu numaraya iletilecektir
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                    <Mail className="w-3.5 h-3.5 text-indigo-600" />
                    <span>E-Posta Adresi *</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="ad.soyad@ornek.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Aidat makbuzları ve e-faturalar gönderilir
                  </span>
                </div>
              </div>

              {/* Informative notification box */}
              <div className="p-3 bg-indigo-50/80 border border-indigo-200 rounded-2xl flex items-start space-x-2.5 text-xs text-indigo-900">
                <Smartphone className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <strong className="block font-semibold">Telefon & E-Posta İletişim Güvencesi:</strong>
                  <p className="text-[11px] text-indigo-800 leading-relaxed">
                    Başvurunuz site yönetimi tarafından onaylandığında, hesabınızın tek kullanımlık SMS şifresi bu cep telefonuna gönderilecek ve aylık aidat bildirimleri bu e-posta adresine iletilecektir.
                  </p>
                </div>
              </div>
            </div>

            {/* Unit Details */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                2. Oturulan Daire & İkamet Türü
              </h3>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Blok</label>
                  <select
                    value={block}
                    onChange={(e) => setBlock(e.target.value as BlockId)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  >
                    <option value="A">A Blok</option>
                    <option value="B">B Blok</option>
                    <option value="C">C Blok</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Daire No</label>
                  <input
                    type="text"
                    required
                    placeholder="12"
                    value={unitNo}
                    onChange={(e) => setUnitNo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Statü</label>
                  <select
                    value={residentType}
                    onChange={(e) => setResidentType(e.target.value as 'owner' | 'tenant')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  >
                    <option value="owner">Ev Sahibi (Malik)</option>
                    <option value="tenant">Kiracı</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Document Proof Upload */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                3. İkamet Doğrulama Belgesi (Yönetim İncelemesi İçin)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Belge Türü *
                  </label>
                  <select
                    value={documentType}
                    onChange={(e) => {
                      const t = e.target.value as any;
                      setDocumentType(t);
                      if (t === 'title_deed') setDocumentName('Tapu_Belgesi_Fotokopisi.pdf');
                      if (t === 'lease_contract') setDocumentName('Kira_Kontrati_Noterli.pdf');
                      if (t === 'residence_certificate') setDocumentName('E_Devlet_Ikametgah_Belgesi.pdf');
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  >
                    <option value="lease_contract">Noter Onaylı Kira Sözleşmesi</option>
                    <option value="title_deed">Tapu Senedi / Kat Mülkiyeti</option>
                    <option value="residence_certificate">e-Devlet Yerleşim Yeri Belgesi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Dosya Eki
                  </label>
                  <div className="flex items-center space-x-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
                    <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="truncate font-mono">{documentName}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Yönetime Açıklama / Not
                </label>
                <textarea
                  rows={2}
                  placeholder="Örn: 15 Eylül tarihinde taşındım, sayaç devirleri yapıldı."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 resize-none"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center space-x-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Gönderiliyor...' : 'Yönetim Onayına Gönder'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
