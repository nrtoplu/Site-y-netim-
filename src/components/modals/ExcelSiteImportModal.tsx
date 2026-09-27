/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  X,
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  Building2,
  Users,
  Sparkles,
  Calendar,
  Gift,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { TenantSite, ApartmentUnit, DuesRecord, BlockId } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface ExcelSiteImportModalProps {
  onClose: () => void;
  onImportSite: (newSite: TenantSite) => void;
}

interface ParsedRow {
  siteName?: string;
  city?: string;
  district?: string;
  address?: string;
  managerName?: string;
  managerPhone?: string;
  managerEmail?: string;
  block?: string;
  unitNo?: string | number;
  floor?: number;
  residentName?: string;
  residentType?: string;
  residentPhone?: string;
  residentEmail?: string;
  monthlyDues?: number;
  grossM2?: number;
}

export const ExcelSiteImportModal: React.FC<ExcelSiteImportModalProps> = ({
  onClose,
  onImportSite,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // Parsed Data Summary
  const [parsedSiteName, setParsedSiteName] = useState<string>('');
  const [parsedCity, setParsedCity] = useState<string>('İstanbul');
  const [parsedAddress, setParsedAddress] = useState<string>('');
  const [parsedManagerName, setParsedManagerName] = useState<string>('');
  const [parsedManagerPhone, setParsedManagerPhone] = useState<string>('');
  const [parsedManagerEmail, setParsedManagerEmail] = useState<string>('');
  const [parsedUnits, setParsedUnits] = useState<ApartmentUnit[]>([]);
  const [detectedBlocks, setDetectedBlocks] = useState<string[]>([]);

  // License Option (Default 1 Month Free Demo as requested!)
  const [isDemoLicense, setIsDemoLicense] = useState<boolean>(true);

  // Template Downloader
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Site Adı': 'Zümrüt Vadi Konakları',
        'Şehir': 'İstanbul',
        'İlçe': 'Ataşehir',
        'Adres': 'Barbaros Mah. Çiğdem Sok. No:18',
        'Yönetici Adı': 'Cemil Taşçı',
        'Yönetici Telefon': '0532 999 88 77',
        'Yönetici E-posta': 'yonetim@zumrutvadi.com',
        'Blok': 'A',
        'Daire No': '1',
        'Kat': 1,
        'Sakin Adı': 'Ali Osman Demir',
        'Sakin Tipi (Ev Sahibi / Kiracı)': 'Ev Sahibi',
        'Sakin Telefon': '0533 111 22 33',
        'Sakin E-posta': 'ali.demir@gmail.com',
        'Aidat Tutarı (TL)': 2500,
        'Brüt m2': 145,
      },
      {
        'Site Adı': 'Zümrüt Vadi Konakları',
        'Şehir': 'İstanbul',
        'İlçe': 'Ataşehir',
        'Adres': 'Barbaros Mah. Çiğdem Sok. No:18',
        'Yönetici Adı': 'Cemil Taşçı',
        'Yönetici Telefon': '0532 999 88 77',
        'Yönetici E-posta': 'yonetim@zumrutvadi.com',
        'Blok': 'A',
        'Daire No': '2',
        'Kat': 1,
        'Sakin Adı': 'Berna Yılmaz',
        'Sakin Tipi (Ev Sahibi / Kiracı)': 'Kiracı',
        'Sakin Telefon': '0535 444 55 66',
        'Sakin E-posta': 'berna@hotmail.com',
        'Aidat Tutarı (TL)': 2500,
        'Brüt m2': 145,
      },
      {
        'Site Adı': 'Zümrüt Vadi Konakları',
        'Şehir': 'İstanbul',
        'İlçe': 'Ataşehir',
        'Adres': 'Barbaros Mah. Çiğdem Sok. No:18',
        'Yönetici Adı': 'Cemil Taşçı',
        'Yönetici Telefon': '0532 999 88 77',
        'Yönetici E-posta': 'yonetim@zumrutvadi.com',
        'Blok': 'B',
        'Daire No': '1',
        'Kat': 1,
        'Sakin Adı': 'Murat Karaca',
        'Sakin Tipi (Ev Sahibi / Kiracı)': 'Ev Sahibi',
        'Sakin Telefon': '0542 888 77 66',
        'Sakin E-posta': 'murat@karaca.com',
        'Aidat Tutarı (TL)': 2800,
        'Brüt m2': 160,
      },
      {
        'Site Adı': 'Zümrüt Vadi Konakları',
        'Şehir': 'İstanbul',
        'İlçe': 'Ataşehir',
        'Adres': 'Barbaros Mah. Çiğdem Sok. No:18',
        'Yönetici Adı': 'Cemil Taşçı',
        'Yönetici Telefon': '0532 999 88 77',
        'Yönetici E-posta': 'yonetim@zumrutvadi.com',
        'Blok': 'B',
        'Daire No': '2',
        'Kat': 1,
        'Sakin Adı': 'Ebru Güneş',
        'Sakin Tipi (Ev Sahibi / Kiracı)': 'Ev Sahibi',
        'Sakin Telefon': '0538 333 22 11',
        'Sakin E-posta': 'ebru@gunes.com',
        'Aidat Tutarı (TL)': 2800,
        'Brüt m2': 160,
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Site ve Daire Listesi');
    XLSX.writeFile(workbook, 'ApsisCloud_Site_Daire_Import_Sablonu.xlsx');
  };

  // Process File
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);
    setErrorMessage('');

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<any>(ws, { header: 1 });

        if (!data || data.length < 2) {
          setErrorMessage('Yüklenen Excel dosyasında veri satırı bulunamadı.');
          setIsProcessing(false);
          return;
        }

        // Header mapping
        const headers: string[] = (data[0] as string[]).map((h) =>
          String(h || '').trim().toLowerCase()
        );

        const findColIndex = (keywords: string[]) => {
          return headers.findIndex((h) => keywords.some((k) => h.includes(k)));
        };

        const siteNameIdx = findColIndex(['site adı', 'site adi', 'apartman', 'site']);
        const cityIdx = findColIndex(['şehir', 'sehir', 'il']);
        const districtIdx = findColIndex(['ilçe', 'ilce']);
        const addressIdx = findColIndex(['adres', 'lokasyon']);
        const managerNameIdx = findColIndex(['yönetici adı', 'yonetici', 'bina sorumlusu']);
        const managerPhoneIdx = findColIndex(['yönetici tel', 'yonetici tel', 'yönetici telefon']);
        const managerEmailIdx = findColIndex(['yönetici e-posta', 'yonetici email', 'yonetici e-posta']);
        const blockIdx = findColIndex(['blok']);
        const unitNoIdx = findColIndex(['daire no', 'daire', 'kapı no', 'kapi no']);
        const floorIdx = findColIndex(['kat']);
        const residentNameIdx = findColIndex(['sakin adı', 'sakin adi', 'ad soyad', 'kat maliki', 'kiracı']);
        const residentTypeIdx = findColIndex(['sakin tipi', 'durum', 'tip']);
        const residentPhoneIdx = findColIndex(['sakin tel', 'telefon', 'gsm']);
        const residentEmailIdx = findColIndex(['sakin e-posta', 'e-posta', 'email']);
        const duesIdx = findColIndex(['aidat', 'tutar', 'bedel']);
        const m2Idx = findColIndex(['m2', 'brüt', 'alan']);

        const detectedUnits: ApartmentUnit[] = [];
        const blockSet = new Set<string>();
        let siteNameExtracted = '';
        let cityExtracted = 'İstanbul';
        let addressExtracted = '';
        let managerNameExtracted = '';
        let managerPhoneExtracted = '';
        let managerEmailExtracted = '';

        const tempSiteId = `site-${Date.now()}`;

        for (let i = 1; i < data.length; i++) {
          const row = data[i] as any[];
          if (!row || row.length === 0 || row.every((c) => c === undefined || c === null || c === '')) {
            continue;
          }

          if (siteNameIdx >= 0 && row[siteNameIdx] && !siteNameExtracted) {
            siteNameExtracted = String(row[siteNameIdx]).trim();
          }
          if (cityIdx >= 0 && row[cityIdx] && cityExtracted === 'İstanbul') {
            cityExtracted = String(row[cityIdx]).trim();
          }
          if (addressIdx >= 0 && row[addressIdx] && !addressExtracted) {
            addressExtracted = String(row[addressIdx]).trim();
          }
          if (districtIdx >= 0 && row[districtIdx] && !addressExtracted.includes(String(row[districtIdx]))) {
            addressExtracted += ` ${String(row[districtIdx]).trim()}`;
          }
          if (managerNameIdx >= 0 && row[managerNameIdx] && !managerNameExtracted) {
            managerNameExtracted = String(row[managerNameIdx]).trim();
          }
          if (managerPhoneIdx >= 0 && row[managerPhoneIdx] && !managerPhoneExtracted) {
            managerPhoneExtracted = String(row[managerPhoneIdx]).trim();
          }
          if (managerEmailIdx >= 0 && row[managerEmailIdx] && !managerEmailExtracted) {
            managerEmailExtracted = String(row[managerEmailIdx]).trim();
          }

          const rawBlock = blockIdx >= 0 && row[blockIdx] ? String(row[blockIdx]).trim().toUpperCase() : 'A';
          const blockLetter: BlockId = (rawBlock.charAt(0) as BlockId) || 'A';
          blockSet.add(blockLetter);

          const rawUnitNo = unitNoIdx >= 0 && row[unitNoIdx] ? String(row[unitNoIdx]).trim() : String(i);
          const rawFloor = floorIdx >= 0 && row[floorIdx] ? parseInt(String(row[floorIdx]), 10) : Math.ceil(parseInt(rawUnitNo, 10) / 4) || 1;
          const rawResidentName = residentNameIdx >= 0 && row[residentNameIdx] ? String(row[residentNameIdx]).trim() : `Daire ${blockLetter}-${rawUnitNo} Sakini`;
          const rawResidentType = residentTypeIdx >= 0 && String(row[residentTypeIdx]).toLowerCase().includes('kira') ? 'tenant' : 'owner';
          const rawPhone = residentPhoneIdx >= 0 && row[residentPhoneIdx] ? String(row[residentPhoneIdx]).trim() : '0532 000 00 00';
          const rawEmail = residentEmailIdx >= 0 && row[residentEmailIdx] ? String(row[residentEmailIdx]).trim() : `daire.${blockLetter.toLowerCase()}${rawUnitNo}@site.com`;
          const rawDues = duesIdx >= 0 && row[duesIdx] ? parseFloat(String(row[duesIdx]).replace(/[^0-9.]/g, '')) || 2000 : 2000;
          const rawM2 = m2Idx >= 0 && row[m2Idx] ? parseFloat(String(row[m2Idx]).replace(/[^0-9.]/g, '')) || 135 : 135;

          detectedUnits.push({
            id: `${tempSiteId}-u-${blockLetter}${rawUnitNo}-${i}`,
            block: blockLetter,
            unitNo: rawUnitNo,
            floor: isNaN(rawFloor) ? 1 : rawFloor,
            residentName: rawResidentName,
            residentType: rawResidentType,
            phone: rawPhone,
            email: rawEmail,
            monthlyDues: rawDues,
            currentBalance: 0,
            grossM2: rawM2,
            landShare: Math.round(100 / Math.max(data.length - 1, 1)),
          });
        }

        if (detectedUnits.length === 0) {
          setErrorMessage('Excel dosyasında geçerli daire veya bağımsız bölüm satırı bulunamadı.');
          setIsProcessing(false);
          return;
        }

        setParsedSiteName(siteNameExtracted || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
        setParsedCity(cityExtracted);
        setParsedAddress(addressExtracted || `${cityExtracted} Merkez`);
        setParsedManagerName(managerNameExtracted || 'Site Yöneticisi');
        setParsedManagerPhone(managerPhoneExtracted || '0532 000 00 00');
        setParsedManagerEmail(managerEmailExtracted || 'yonetim@site.com');
        setParsedUnits(detectedUnits);
        setDetectedBlocks(Array.from(blockSet));
        setIsProcessing(false);
      } catch (err: any) {
        console.error('Excel parse error:', err);
        setErrorMessage('Excel dosyası ayrıştırılırken hata oluştu. Lütfen dosya formatını kontrol ediniz.');
        setIsProcessing(false);
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parsedSiteName || parsedUnits.length === 0) {
      alert('Lütfen geçerli bir Excel dosyası yükleyiniz.');
      return;
    }

    const siteId = `site-${Date.now()}`;
    const slug = parsedSiteName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const totalBlocks = Math.max(detectedBlocks.length, 1);
    const totalFlats = parsedUnits.length;

    // Expiry calculation: 30 days for Demo, 365 days for Standard
    const expiryDate = new Date();
    if (isDemoLicense) {
      expiryDate.setDate(expiryDate.getDate() + 30); // 1 Month Demo
    } else {
      expiryDate.setDate(expiryDate.getDate() + 365); // 1 Year Standard
    }

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

    // Initial Dues for current month so manager can start using immediately
    const initialDues: DuesRecord[] = parsedUnits.map((u) => ({
      id: `due-init-${u.id}`,
      unitId: u.id,
      unitDisplay: `${u.block} Blok - No:${u.unitNo}`,
      residentName: u.residentName,
      month: currentMonth,
      year: currentYear,
      amount: u.monthlyDues,
      lateFee: 0,
      status: 'pending',
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: `${currentMonth} Olağan İşletme Aidatı`,
    }));

    const newTenantSite: TenantSite = {
      id: siteId,
      slug,
      profile: {
        siteName: parsedSiteName,
        address: parsedAddress || `${parsedCity} Merkez`,
        city: parsedCity,
        taxNumber: '1029384756',
        taxOffice: `${parsedCity} Vergi Dairesi`,
        bankName: 'Türkiye İş Bankası',
        iban: 'TR12 0006 4000 0011 9988 7766 55',
        accountHolder: `${parsedSiteName} Site Yönetimi`,
        totalBlocks,
        totalFlats,
        managementBoard: [parsedManagerName ? `${parsedManagerName} (Yönetici)` : 'Site Yönetim Kurulu'],
        auditorName: 'Denetçi Üye',
        reserveFundBalance: 40000,
        operatingFundBalance: 15000,
        emergencyPhone: parsedManagerPhone || '0850 000 00 00',
      },
      license: {
        planName: isDemoLicense
          ? '1 Aylık Ücretsiz Deneme (Demo Paketi)'
          : 'Kurumsal Profesyonel Paket',
        planTier: isDemoLicense ? 'demo' : 'professional',
        yearlyPrice: isDemoLicense ? 0 : 28800,
        currency: 'TRY',
        startDate: new Date().toISOString().split('T')[0],
        expiresAt: expiryDate.toISOString().split('T')[0],
        isSuspended: false,
        autoRenew: !isDemoLicense,
        contactEmail: parsedManagerEmail || `yonetim@${slug}.com`,
        contactPhone: parsedManagerPhone || '0216 000 00 00',
        isDemo: isDemoLicense,
        trialDaysRemaining: isDemoLicense ? 30 : undefined,
      },
      units: parsedUnits,
      dues: initialDues,
      expenses: [],
      tickets: [],
      posts: [
        {
          id: `post-excel-${Date.now()}`,
          authorName: parsedManagerName || 'Site Yönetimi',
          authorUnit: 'Yönetim Masası',
          authorRole: 'manager',
          type: 'announcement',
          title: `🎉 ${parsedSiteName} Excel Üzerinden Başarıyla Kuruldu!`,
          content: `${totalFlats} adet bağımsız bölüm ve sakin kayıtları Excel listesinden otomatik olarak ApsisCloud sistemine aktarılmıştır. Tüm sakinlerimiz aidatlarını online ödeyebilir ve arıza taleplerini iletebilir.`,
          date: new Date().toISOString().split('T')[0],
          pinned: true,
          likes: 3,
          comments: [],
        },
      ],
      documents: [],
      notifications: [
        {
          id: `notif-excel-${Date.now()}`,
          title: isDemoLicense ? '🎁 1 Aylık Demo Hesabı Aktif Edildi' : '✅ Site Kurulumu Tamamlandı',
          message: `${parsedSiteName} (${totalFlats} Daire) Excel'den başarıyla sisteme aktarıldı. ${isDemoLicense ? '30 günlük ücretsiz deneme süresi başladı.' : 'Lisans aktif edildi.'}`,
          date: 'Bugün, Şimdi',
          read: false,
          type: 'system',
          channels: ['push', 'sms'],
        },
      ],
      pendingRegistrations: [],
      saasInvoices: isDemoLicense
        ? [
            {
              id: `saas-demo-${Date.now()}`,
              invoiceNumber: `APS-DEMO-${Math.floor(1000 + Math.random() * 9000)}`,
              siteId,
              siteName: parsedSiteName,
              taxNumber: '1029384756',
              issueDate: new Date().toISOString().split('T')[0],
              dueDate: expiryDate.toISOString().split('T')[0],
              amount: 0,
              taxRate: 0,
              taxAmount: 0,
              totalAmount: 0,
              period: '1 Aylık Ücretsiz Deneme (30 Gün)',
              status: 'paid',
              paidDate: new Date().toISOString().split('T')[0],
              paymentMethod: 'Ücretsiz Demo',
              notes: '30 günlük deneme sürümü aktif edildi.',
            },
          ]
        : [],
    };

    onImportSite(newTenantSite);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-7 text-slate-800 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                Excel'den Otomatik Site & Daire İçe Aktar
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                  .XLSX & .CSV
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Mevcut Excel listenizi yükleyerek site, blok, daire ve sakin bilgilerini saniyeler içinde otomatik olarak sisteme aktarın.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Template Download Bar */}
        <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="font-bold text-xs text-indigo-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Hazır Excel Şablonu (Tavsiye Edilir)</span>
            </span>
            <p className="text-[11px] text-indigo-700">
              Sütun başlıkları (Site Adı, Blok, Daire No, Sakin Adı, Telefon, Aidat vb.) hazır örnek şablonu indirin.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 shrink-0 shadow-sm shadow-indigo-200"
          >
            <Download className="w-4 h-4" />
            <span>Örnek Şablonu İndir (.xlsx)</span>
          </button>
        </div>

        {/* Step 2: Upload Box */}
        <div className="space-y-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xlsx, .xls, .csv"
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/30 rounded-2xl p-6 text-center cursor-pointer transition-all space-y-2 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-slate-200 flex items-center justify-center mx-auto text-slate-500 group-hover:text-emerald-600 group-hover:border-emerald-300 transition-colors">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                {fileName ? `Yüklenen Dosya: ${fileName}` : 'Excel veya CSV Dosyanızı Buraya Sürükleyin veya Seçin'}
              </span>
              <span className="text-[11px] text-slate-400">
                .xlsx, .xls veya .csv formatlarını destekler
              </span>
            </div>
            {isProcessing && (
              <span className="inline-block text-xs font-semibold text-emerald-600 animate-pulse">
                Excel satırları okunuyor ve analiz ediliyor...
              </span>
            )}
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Step 3: Parsed Data Preview & Options */}
        {parsedUnits.length > 0 && (
          <div className="space-y-4 pt-2 border-t border-slate-200">
            {/* Success summary badge */}
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-2 text-emerald-900 font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>
                  {parsedUnits.length} Daire Başarıyla Tespit Edildi ({detectedBlocks.join(', ')} Blok)
                </span>
              </div>
              <span className="text-emerald-800 text-[11px]">
                Otomatik Site Kimliği Oluşturuldu
              </span>
            </div>

            {/* Editable summary inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Tespit Edilen Site Adı</label>
                <input
                  type="text"
                  value={parsedSiteName}
                  onChange={(e) => setParsedSiteName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Şehir</label>
                <input
                  type="text"
                  value={parsedCity}
                  onChange={(e) => setParsedCity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Yönetici Adı</label>
                <input
                  type="text"
                  value={parsedManagerName}
                  onChange={(e) => setParsedManagerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* License Package Selector: Demo (1 Month) vs Standard */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-800 block">
                Lisans & Deneme Paketi Seçimi:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div
                  onClick={() => setIsDemoLicense(true)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 ${
                    isDemoLicense
                      ? 'border-purple-500 bg-purple-50/60 ring-2 ring-purple-500/20 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Gift className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-extrabold text-slate-900">1 Aylık Ücretsiz Demo</span>
                      <span className="px-1.5 py-0.2 bg-purple-600 text-white rounded-md text-[9px] font-bold">
                        TAVSİYE
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Siteye 30 gün boyunca tüm modüller açık ücretsiz deneme hesabı tanımlanır.
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => setIsDemoLicense(false)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 ${
                    !isDemoLicense
                      ? 'border-indigo-500 bg-indigo-50/60 ring-2 ring-indigo-500/20 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Building2 className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-900 block">Yıllık Profesyonel Lisans</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      1 Yıllık (365 Gün) tam kurumsal lisans ve yıllık fatura oluşturulur.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Daire Listesi Önizleme Tablosu */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">
                  Daire Listesi Önizlemesi (İlk {Math.min(parsedUnits.length, 5)} / {parsedUnits.length} Kayıt)
                </span>
                <span className="text-[11px] text-slate-400">
                  Tüm liste otomatik olarak içe aktarılacaktır
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead className="bg-slate-100 text-slate-600 font-bold sticky top-0">
                    <tr>
                      <th className="p-2">Blok / No</th>
                      <th className="p-2">Sakin Adı</th>
                      <th className="p-2">Durum</th>
                      <th className="p-2">Telefon</th>
                      <th className="p-2 text-right">Aylık Aidat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {parsedUnits.slice(0, 8).map((u, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2 font-bold text-slate-800">
                          {u.block} Blok - No:{u.unitNo}
                        </td>
                        <td className="p-2 font-medium text-slate-900">{u.residentName}</td>
                        <td className="p-2">
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                              u.residentType === 'owner'
                                ? 'bg-indigo-50 text-indigo-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {u.residentType === 'owner' ? 'Ev Sahibi' : 'Kiracı'}
                          </span>
                        </td>
                        <td className="p-2 text-slate-500 font-mono">{u.phone}</td>
                        <td className="p-2 text-right font-bold text-slate-800">
                          {formatCurrency(u.monthlyDues)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-slate-500">
                {isDemoLicense ? '🎁 30 Günlük Ücretsiz Demo Hesabı Olarak Kurulacak' : '💼 1 Yıllık Lisansla Kurulacak'}
              </span>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-emerald-200 flex items-center space-x-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Sitenin Kurulumunu Tamamla ({parsedUnits.length} Daire)</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
