import React, { useState } from 'react';
import { X, Building2, Plus, ShieldCheck, MapPin, Phone, User, DollarSign } from 'lucide-react';
import { TenantSite, ApartmentUnit, DuesRecord, BlockId } from '../../types';

interface NewSiteModalProps {
  onClose: () => void;
  onAddSite: (newSite: TenantSite) => void;
}

export const NewSiteModal: React.FC<NewSiteModalProps> = ({ onClose, onAddSite }) => {
  const [siteName, setSiteName] = useState('');
  const [city, setCity] = useState('İstanbul');
  const [address, setAddress] = useState('');
  const [totalBlocks, setTotalBlocks] = useState(2);
  const [totalFlats, setTotalFlats] = useState(24);
  const [managerName, setManagerName] = useState('');
  const [managerPhone, setManagerPhone] = useState('');
  const [managerEmail, setManagerEmail] = useState('');
  const [taxOffice, setTaxOffice] = useState('');
  const [taxNumber, setTaxNumber] = useState('');
  const [bankName, setBankName] = useState('Türkiye İş Bankası');
  const [iban, setIban] = useState('TR99 0006 4000 0011 2345 6789 00');
  const [planTier, setPlanTier] = useState<'starter' | 'professional' | 'enterprise' | 'demo'>('professional');
  const [yearlyPrice, setYearlyPrice] = useState(24000);
  const [monthlyDuePerFlat, setMonthlyDuePerFlat] = useState(1750);
  const [isDemo, setIsDemo] = useState(false);

  const handlePlanChange = (tier: 'starter' | 'professional' | 'enterprise' | 'demo') => {
    setPlanTier(tier);
    if (tier === 'demo') {
      setIsDemo(true);
      setYearlyPrice(0);
    } else {
      setIsDemo(false);
      if (tier === 'starter') setYearlyPrice(18000);
      if (tier === 'professional') setYearlyPrice(28800);
      if (tier === 'enterprise') setYearlyPrice(45000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteName) return;

    const slug = siteName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const siteId = `site-${Date.now()}`;

    // Auto-generate sample units for this site
    const generatedUnits: ApartmentUnit[] = [];
    const blocks: BlockId[] = ['A', 'B', 'C'];
    const flatsPerBlock = Math.ceil(totalFlats / totalBlocks);

    for (let b = 0; b < totalBlocks; b++) {
      const blockLetter = blocks[b % blocks.length];
      for (let u = 1; u <= flatsPerBlock; u++) {
        if (generatedUnits.length >= totalFlats) break;
        generatedUnits.push({
          id: `${siteId}-u-${blockLetter}${u}`,
          block: blockLetter,
          unitNo: String(u),
          floor: Math.ceil(u / 4),
          residentName: u === 1 ? managerName || 'Ali Yönetici' : `Daire ${blockLetter}-${u} Sakini`,
          residentType: u % 3 === 0 ? 'tenant' : 'owner',
          phone: u === 1 ? managerPhone || '0532 000 00 00' : `0532 ${Math.floor(100 + Math.random() * 900)} 00 ${u < 10 ? '0' + u : u}`,
          email: `daire.${blockLetter.toLowerCase()}${u}@${slug}.com`,
          monthlyDues: monthlyDuePerFlat,
          currentBalance: 0,
          grossM2: 135,
          landShare: 25,
        });
      }
    }

    const currentYear = new Date().getFullYear();
    const expiryDate = new Date();
    if (isDemo) {
      expiryDate.setDate(expiryDate.getDate() + 30); // 30 Days Free Demo
    } else {
      expiryDate.setDate(expiryDate.getDate() + 365); // 1 year from now
    }

    const newTenantSite: TenantSite = {
      id: siteId,
      slug,
      profile: {
        siteName,
        address: address || `${city} Merkez`,
        city,
        taxNumber: taxNumber || '1234567890',
        taxOffice: taxOffice || `${city} Vergi Dairesi`,
        bankName,
        iban,
        accountHolder: `${siteName} Site Yönetimi`,
        totalBlocks,
        totalFlats,
        managementBoard: [managerName ? `${managerName} (Yönetici)` : 'Site Yönetim Kurulu'],
        auditorName: 'Denetçi Mali Müşavir',
        reserveFundBalance: 50000,
        operatingFundBalance: 25000,
        emergencyPhone: managerPhone || '0850 000 00 00',
      },
      license: {
        planName: isDemo
          ? '1 Aylık Ücretsiz Deneme (Demo Paketi)'
          : planTier === 'enterprise'
          ? 'Kurumsal Rezidans Paketi'
          : planTier === 'professional'
          ? 'Kurumsal Profesyonel Paket'
          : 'Standart Butik Site Paketi',
        planTier,
        yearlyPrice,
        currency: 'TRY',
        startDate: new Date().toISOString().split('T')[0],
        expiresAt: expiryDate.toISOString().split('T')[0],
        isSuspended: false,
        autoRenew: !isDemo,
        contactEmail: managerEmail || 'yonetim@' + slug + '.com',
        contactPhone: managerPhone || '0212 000 00 00',
        isDemo,
        trialDaysRemaining: isDemo ? 30 : undefined,
      },
      units: generatedUnits,
      dues: [],
      expenses: [],
      tickets: [],
      posts: [
        {
          id: `post-init-${Date.now()}`,
          authorName: managerName || 'Site Yönetimi',
          authorUnit: 'Yönetim Ofisi',
          authorRole: 'manager',
          type: 'announcement',
          title: `Hoş Geldiniz: ${siteName} ApsisCloud Sistemine Geçti`,
          content: 'Sitemiz artık tüm aidat takibi, resmi faturalar, arıza bildirimleri ve şeffaf bütçe yönetimini ApsisCloud üzerinden yürütecektir.',
          date: new Date().toISOString().split('T')[0],
          pinned: true,
          likes: 5,
          comments: [],
        },
      ],
      documents: [],
      notifications: [
        {
          id: `notif-init-${Date.now()}`,
          title: '🎉 Yeni Site Kurulumu Başarılı',
          message: `${siteName} platformda aktif edilmiştir. 1 yıllık SaaS lisansı başlatılmıştır.`,
          date: 'Bugün, Şimdi',
          read: false,
          type: 'system',
          channels: ['push'],
        },
      ],
      pendingRegistrations: [],
      saasInvoices: [
        {
          id: `saas-inv-${Date.now()}`,
          invoiceNumber: `APS${currentYear}-${Math.floor(1000 + Math.random() * 9000)}`,
          siteId,
          siteName,
          taxNumber: taxNumber || '1234567890',
          issueDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          amount: Math.round(yearlyPrice / 1.2),
          taxRate: 0.2,
          taxAmount: yearlyPrice - Math.round(yearlyPrice / 1.2),
          totalAmount: yearlyPrice,
          period: `${currentYear} - ${currentYear + 1} Yıllık Platform Lisansı (${totalFlats} Daire)`,
          status: 'paid',
          paidDate: new Date().toISOString().split('T')[0],
          paymentMethod: 'Banka Transferi',
        },
      ],
    };

    onAddSite(newTenantSite);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-sm p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Building2 className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="font-bold text-sm">Platforma Yeni Site / Apartman Ekle</h2>
              <p className="text-[11px] text-slate-400">Çoklu Hesap (Multi-Tenant) Sihirbazı</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Site Basic Info */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              1. Site Kimlik Bilgileri
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Site / Apartman Adı *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Ihlamur Konakları"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Şehir *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Bursa / Nilüfer"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Açık Adres</label>
              <input
                type="text"
                placeholder="Mahalle, cadde ve sokak bilgisi"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Blok Sayısı</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={totalBlocks}
                  onChange={(e) => setTotalBlocks(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Toplam Daire</label>
                <input
                  type="number"
                  min={2}
                  max={500}
                  value={totalFlats}
                  onChange={(e) => setTotalFlats(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Aylık Aidat (₺)</label>
                <input
                  type="number"
                  min={100}
                  value={monthlyDuePerFlat}
                  onChange={(e) => setMonthlyDuePerFlat(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Manager Info */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              2. İlk Yönetici İletişim Bilgileri
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Yönetici Adı</label>
                <input
                  type="text"
                  placeholder="Ad Soyad"
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Telefon</label>
                <input
                  type="text"
                  placeholder="0532 000 00 00"
                  value={managerPhone}
                  onChange={(e) => setManagerPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">E-Posta</label>
                <input
                  type="email"
                  placeholder="yonetici@site.com"
                  value={managerEmail}
                  onChange={(e) => setManagerEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* SaaS License Plan Selection */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              3. Yıllık SaaS Abonelik Paketi & Aktiflik Süresi
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => handlePlanChange('demo')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  planTier === 'demo'
                    ? 'border-purple-600 bg-purple-50/80 ring-2 ring-purple-500 shadow-sm'
                    : 'border-slate-200 hover:border-purple-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="block text-[11px] font-bold text-slate-900">🎁 1 Ay Demo</span>
                  <span className="text-[9px] bg-purple-600 text-white px-1.5 py-0.2 rounded font-bold">
                    ÜCRETSİZ
                  </span>
                </div>
                <span className="text-[10px] text-slate-500">30 Gün Deneme</span>
                <span className="block mt-1 font-mono font-bold text-xs text-purple-700">
                  0 ₺ (Ücretsiz)
                </span>
              </button>

              <button
                type="button"
                onClick={() => handlePlanChange('starter')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  planTier === 'starter'
                    ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="block text-[11px] font-bold text-slate-900">Standart Butik</span>
                <span className="text-[10px] text-slate-500">1-24 Daire</span>
                <span className="block mt-1 font-mono font-bold text-xs text-indigo-700">
                  18.000 ₺/yıl
                </span>
              </button>

              <button
                type="button"
                onClick={() => handlePlanChange('professional')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  planTier === 'professional'
                    ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="block text-[11px] font-bold text-slate-900">Profesyonel</span>
                <span className="text-[10px] text-slate-500">25-60 Daire</span>
                <span className="block mt-1 font-mono font-bold text-xs text-indigo-700">
                  28.800 ₺/yıl
                </span>
              </button>

              <button
                type="button"
                onClick={() => handlePlanChange('enterprise')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  planTier === 'enterprise'
                    ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="block text-[11px] font-bold text-slate-900">Rezidans Kule</span>
                <span className="text-[10px] text-slate-500">60+ Daire</span>
                <span className="block mt-1 font-mono font-bold text-xs text-indigo-700">
                  45.000 ₺/yıl
                </span>
              </button>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Yeni site oluşturulduğunda <strong>365 Günlük Aktiflik Sayacı</strong> otomatik başlayacak ve izole veri tabanı tahsis edilecektir.
              </span>
            </div>
          </div>

          {/* Actions */}
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
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Siteyi Oluştur ve Aktif Et</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
