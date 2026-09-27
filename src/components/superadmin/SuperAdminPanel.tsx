/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Building2,
  Calendar,
  CreditCard,
  Plus,
  ShieldCheck,
  Snowflake,
  Flame,
  Clock,
  ArrowRight,
  Receipt,
  FileCheck,
  AlertTriangle,
  Search,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  RotateCcw,
  Wrench,
  Layers,
  Power,
  PowerOff,
  Trash2,
  Star,
  Phone,
  Mail,
  MapPin,
  BadgeCheck,
  X,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  PlusCircle,
  HelpCircle,
  Check,
  FileSpreadsheet,
  DollarSign,
  Gift,
  Percent,
} from 'lucide-react';
import {
  TenantSite,
  SaaSInvoice,
  VendorCompany,
  PlatformProgramModule,
  VendorReview,
  VendorTradeCategory,
  VendorCommissionFee,
  VendorBillingModel,
} from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { formatCountdownBadge, getDaysRemaining } from '../../utils/dateCalculations';
import { TRADE_CATEGORY_LABELS } from '../../data/vendorData';
import { ExcelSiteImportModal } from '../modals/ExcelSiteImportModal';

interface SuperAdminPanelProps {
  sites: TenantSite[];
  vendors: VendorCompany[];
  modules: PlatformProgramModule[];
  onSelectSite: (siteId: string) => void;
  onOpenNewSiteModal: () => void;
  onOpenNewInvoiceModal: (targetSiteId?: string) => void;
  onViewInvoice: (invoice: SaaSInvoice) => void;
  onToggleSuspendSite: (siteId: string) => void;
  onExtendLicense: (siteId: string, days?: number, convertToFull?: boolean) => void;
  onMarkInvoicePaid: (invoiceId: string) => void;
  onToggleSiteModule: (siteId: string, moduleId: string) => void;
  onAddPlatformModule: (newModule: PlatformProgramModule) => void;
  onDeletePlatformModule: (moduleId: string) => void;
  onToggleVendorStatus: (vendorId: string, reason?: string) => void;
  onAddVendor: (newVendor: VendorCompany) => void;
  onDeleteVendor: (vendorId: string) => void;
  onImportSite?: (newSite: TenantSite) => void;
  onAddVendorFee?: (vendorId: string, fee: VendorCommissionFee) => void;
  onMarkVendorFeePaid?: (vendorId: string, feeId: string) => void;
  onUpdateVendorBillingModel?: (
    vendorId: string,
    billingModel: VendorBillingModel,
    commissionRate?: number,
    annualSubscriptionFee?: number
  ) => void;
}

export const SuperAdminPanel: React.FC<SuperAdminPanelProps> = ({
  sites,
  vendors,
  modules,
  onSelectSite,
  onOpenNewSiteModal,
  onOpenNewInvoiceModal,
  onViewInvoice,
  onToggleSuspendSite,
  onExtendLicense,
  onMarkInvoicePaid,
  onToggleSiteModule,
  onAddPlatformModule,
  onDeletePlatformModule,
  onToggleVendorStatus,
  onAddVendor,
  onDeleteVendor,
  onImportSite,
  onAddVendorFee,
  onMarkVendorFeePaid,
  onUpdateVendorBillingModel,
}) => {
  const [activeTab, setActiveTab] = useState<'sites' | 'modules' | 'vendors' | 'commissions' | 'invoices'>('sites');

  // Excel Import Modal
  const [showExcelImportModal, setShowExcelImportModal] = useState(false);

  // Site Extension Modal
  const [extendModalSite, setExtendModalSite] = useState<TenantSite | null>(null);
  const [extendDaysChoice, setExtendDaysChoice] = useState<number>(30);
  const [extendConvertToFull, setExtendConvertToFull] = useState<boolean>(false);

  // Vendor Commission & Billing State
  const [billingModalVendor, setBillingModalVendor] = useState<VendorCompany | null>(null);
  const [selectedVendorForBillingId, setSelectedVendorForBillingId] = useState<string>(vendors[0]?.id || '');
  const [feeTypeInput, setFeeTypeInput] = useState<'job_commission' | 'annual_subscription'>('job_commission');
  const [feeJobTitleInput, setFeeJobTitleInput] = useState('');
  const [feeJobAmountInput, setFeeJobAmountInput] = useState<number>(20000);
  const [feeCommissionRateInput, setFeeCommissionRateInput] = useState<number>(5);
  const [feeAnnualAmountInput, setFeeAnnualAmountInput] = useState<number>(4800);
  const [feeNotesInput, setFeeNotesInput] = useState('');

  // Edit Vendor Billing Model Modal
  const [editModelVendor, setEditModelVendor] = useState<VendorCompany | null>(null);
  const [modelChoice, setModelChoice] = useState<VendorBillingModel>('commission');
  const [modelRateInput, setModelRateInput] = useState<number>(5);
  const [modelAnnualFeeInput, setModelAnnualFeeInput] = useState<number>(4800);

  // Sites Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'suspended'>('all');

  // Modules Filter & Selected Site for Module Configuration
  const [selectedSiteIdForModules, setSelectedSiteIdForModules] = useState<string>(sites[0]?.id || '');
  const [showNewModuleModal, setShowNewModuleModal] = useState(false);
  const [newModuleName, setNewModuleName] = useState('');
  const [newModuleCategory, setNewModuleCategory] = useState<PlatformProgramModule['category']>('addon');
  const [newModuleDesc, setNewModuleDesc] = useState('');

  // Vendors Filter & Actions
  const [vendorSearch, setVendorSearch] = useState('');
  const [vendorCategoryFilter, setVendorCategoryFilter] = useState<string>('all');
  const [vendorStatusFilter, setVendorStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [suspendModalVendor, setSuspendModalVendor] = useState<VendorCompany | null>(null);
  const [suspendReasonInput, setSuspendReasonInput] = useState('');
  const [showNewVendorModal, setShowNewVendorModal] = useState(false);
  const [viewingReviewsVendor, setViewingReviewsVendor] = useState<VendorCompany | null>(null);

  // New Vendor Form
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newAuthPerson, setNewAuthPerson] = useState('');
  const [newVendorCategory, setNewVendorCategory] = useState<VendorTradeCategory>('plumbing');
  const [newVendorCity, setNewVendorCity] = useState('İstanbul');
  const [newVendorDistricts, setNewVendorDistricts] = useState('Kadıköy, Ataşehir, Ümraniye');
  const [newVendorPhone, setNewVendorPhone] = useState('');
  const [newVendorEmail, setNewVendorEmail] = useState('');
  const [newVendorCert, setNewVendorCert] = useState('MYK Seviye 4 Tescilli');

  // Selected site object for module configuration
  const siteForModules = sites.find((s) => s.id === selectedSiteIdForModules) || sites[0];

  // Aggregated platform stats
  const totalSites = sites.length;
  const totalFlats = sites.reduce((sum, s) => sum + s.profile.totalFlats, 0);
  const totalYearlyVolume = sites.reduce((sum, s) => sum + s.license.yearlyPrice, 0);
  const suspendedCount = sites.filter((s) => s.license.isSuspended).length;

  const allInvoices: SaaSInvoice[] = sites.flatMap((s) => s.saasInvoices || []);
  const collectedAmount = allInvoices
    .filter((i) => i.status === 'paid')
    .reduce((sum, i) => sum + i.totalAmount, 0);
  const pendingAmount = allInvoices
    .filter((i) => i.status === 'pending' || i.status === 'overdue')
    .reduce((sum, i) => sum + i.totalAmount, 0);

  // Vendor Commissions & Subscription Fees Stats
  const allCommissionFees: VendorCommissionFee[] = vendors.flatMap((v) => v.commissionFees || []);
  const totalPaidCommissions = allCommissionFees
    .filter((f) => f.status === 'paid')
    .reduce((sum, f) => sum + f.feeAmount, 0);
  const totalPendingCommissions = allCommissionFees
    .filter((f) => f.status === 'pending' || f.status === 'overdue')
    .reduce((sum, f) => sum + f.feeAmount, 0);
  const totalAnnualVendorFees = allCommissionFees
    .filter((f) => f.feeType === 'annual_subscription' && f.status === 'paid')
    .reduce((sum, f) => sum + f.feeAmount, 0);
  const demoSitesCount = sites.filter((s) => s.license.isDemo || s.license.planTier === 'demo').length;

  // Filtered sites
  const filteredSites = sites.filter((s) => {
    const matchesSearch =
      s.profile.siteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.profile.city.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filterStatus === 'active') return !s.license.isSuspended;
    if (filterStatus === 'suspended') return s.license.isSuspended;
    return true;
  });

  // Filtered Vendors
  const filteredVendors = vendors.filter((v) => {
    if (vendorCategoryFilter !== 'all' && v.category !== vendorCategoryFilter) return false;
    const isSuspended = v.status === 'suspended';
    if (vendorStatusFilter === 'active' && isSuspended) return false;
    if (vendorStatusFilter === 'suspended' && !isSuspended) return false;
    if (vendorSearch.trim()) {
      const q = vendorSearch.toLowerCase();
      const matchName = v.companyName.toLowerCase().includes(q);
      const matchPerson = v.authorizedPerson.toLowerCase().includes(q);
      const matchCity = v.city.toLowerCase().includes(q);
      if (!matchName && !matchPerson && !matchCity) return false;
    }
    return true;
  });

  const handleCreateModuleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleName.trim() || !newModuleDesc.trim()) return;

    const newModule: PlatformProgramModule = {
      id: `custom-${Date.now()}`,
      name: newModuleName.trim(),
      category: newModuleCategory,
      description: newModuleDesc.trim(),
      iconName: 'Sparkles',
      isCore: false,
      defaultEnabled: true,
      author: 'Süper Admin',
      version: 'v1.0',
    };

    onAddPlatformModule(newModule);
    setShowNewModuleModal(false);
    setNewModuleName('');
    setNewModuleDesc('');
  };

  const handleCreateVendorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim() || !newAuthPerson.trim() || !newVendorPhone.trim()) {
      alert('Lütfen firma adı, yetkili usta ve telefon alanlarını doldurunuz.');
      return;
    }

    const newVendor: VendorCompany = {
      id: `ven-${Date.now()}`,
      companyName: newCompanyName.trim(),
      authorizedPerson: newAuthPerson.trim(),
      category: newVendorCategory,
      city: newVendorCity.trim() || 'İstanbul',
      districts: newVendorDistricts.split(',').map((d) => d.trim()).filter(Boolean),
      phone: newVendorPhone.trim(),
      email: newVendorEmail.trim() || `${newCompanyName.toLowerCase().replace(/\s+/g, '')}@firma.com`,
      address: `${newVendorDistricts} / ${newVendorCity}`,
      certNumber: newVendorCert.trim() || 'TSE & Sanayi Bakanlığı Onaylı',
      rating: 5.0,
      completedJobsCount: 0,
      isVerified: true,
      registeredDate: new Date().toISOString().split('T')[0],
      status: 'active',
      reviews: [],
    };

    onAddVendor(newVendor);
    setShowNewVendorModal(false);
    setNewCompanyName('');
    setNewAuthPerson('');
    setNewVendorPhone('');
    setNewVendorEmail('');
  };

  const handleConfirmSuspendVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suspendModalVendor) return;

    onToggleVendorStatus(
      suspendModalVendor.id,
      suspendReasonInput || 'Süper Admin tarafından hizmete kapatıldı'
    );
    setSuspendModalVendor(null);
    setSuspendReasonInput('');
  };

  const handleCreateFeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetVendor = billingModalVendor || vendors.find((v) => v.id === selectedVendorForBillingId) || vendors[0];
    if (!targetVendor || !onAddVendorFee) return;

    const feeAmount =
      feeTypeInput === 'job_commission'
        ? Math.round((feeJobAmountInput * feeCommissionRateInput) / 100)
        : feeAnnualAmountInput;

    const newFee: VendorCommissionFee = {
      id: `fee-${Date.now()}`,
      vendorId: targetVendor.id,
      vendorName: targetVendor.companyName,
      feeType: feeTypeInput,
      jobTitle: feeTypeInput === 'job_commission' ? feeJobTitleInput || 'Şantiye İşi Komisyonu' : 'Yıllık Taşeron Üyelik Lisansı',
      jobAmount: feeTypeInput === 'job_commission' ? feeJobAmountInput : undefined,
      commissionRate: feeTypeInput === 'job_commission' ? feeCommissionRateInput : undefined,
      feeAmount,
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'pending',
      invoiceNo: `${feeTypeInput === 'job_commission' ? 'KOM' : 'YIL'}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString().split('T')[0],
      notes: feeNotesInput || 'Süper Admin tarafından platform hizmet bedeli yansıtıldı.',
    };

    onAddVendorFee(targetVendor.id, newFee);
    setBillingModalVendor(null);
    setFeeJobTitleInput('');
    setFeeNotesInput('');
  };

  const handleUpdateModelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModelVendor || !onUpdateVendorBillingModel) return;

    onUpdateVendorBillingModel(
      editModelVendor.id,
      modelChoice,
      modelRateInput,
      modelAnnualFeeInput
    );
    setEditModelVendor(null);
  };

  const handleExtendConfirmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!extendModalSite) return;

    onExtendLicense(extendModalSite.id, extendDaysChoice, extendConvertToFull);
    setExtendModalSite(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 rounded-full text-xs font-bold tracking-wider uppercase">
                ApsisCloud • Global SaaS Platform Yönetimi
              </span>
              <span className="flex items-center space-x-1 text-emerald-400 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Çoklu Site & Tedarikçi Mimarisi</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Süper Admin & Program / Firma Yönetim Masası
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Tüm sitelere ait yazılım programlarını/modüllerini ekleyip çıkarın, taşeron & usta firmalarını açıp kapatın ve platform genelindeki finansal operasyonları tek merkezden yönetin.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowExcelImportModal(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center space-x-2"
              title="Excel'den toplu site, daire ve sakin kayıtlarını otomatik çek"
            >
              <FileSpreadsheet className="w-4 h-4 text-white" />
              <span>📊 Excel'den Site İçe Aktar</span>
            </button>

            <button
              onClick={() => onOpenNewInvoiceModal()}
              className="px-4 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 shadow-sm transition-all flex items-center space-x-2"
            >
              <Receipt className="w-4 h-4 text-amber-400" />
              <span>Yıllık Fatura Kes</span>
            </button>

            <button
              onClick={onOpenNewSiteModal}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Site Ekle</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Kayıtlı Siteler</span>
            <Building2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2 font-mono">
            {totalSites} <span className="text-xs text-slate-400 font-sans font-normal">Site</span>
          </div>
          <div className="text-[11px] text-purple-600 font-bold mt-1">
            {demoSitesCount > 0 ? `🎁 ${demoSitesCount} Demo Deneme Sürümü` : `Toplam ${totalFlats} Daire`}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Aktif Modüller</span>
            <Layers className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-purple-600 mt-2 font-mono">
            {modules.length} <span className="text-xs text-slate-400 font-sans font-normal">Modül</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Site bazlı açma/kapatma
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Usta & Firmalar</span>
            <Wrench className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2 font-mono">
            {vendors.length} <span className="text-xs text-slate-400 font-sans font-normal">Firma</span>
          </div>
          <div className="text-[11px] text-amber-600 font-medium mt-1">
            {vendors.filter((v) => v.status === 'suspended').length > 0
              ? `${vendors.filter((v) => v.status === 'suspended').length} Kapalı / Askıda`
              : 'Tüm firmalar açık & aktif'}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Platform Komisyonu</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-2 font-mono">
            {formatCurrency(totalPaidCommissions)}
          </div>
          <div className="text-[11px] text-amber-600 font-semibold mt-1">
            {totalPendingCommissions > 0 ? `${formatCurrency(totalPendingCommissions)} Bekliyor` : 'Tüm komisyonlar tahsil edildi'}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Dondurulan Siteler</span>
            <Snowflake className="w-4 h-4 text-rose-600" />
          </div>
          <div className={`text-2xl font-extrabold mt-2 font-mono ${suspendedCount > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
            {suspendedCount} <span className="text-xs font-sans font-normal">Site</span>
          </div>
          <div className="text-[11px] text-rose-500 font-medium mt-1">
            {suspendedCount > 0 ? 'Ödeme yapılmadığı için kilitli' : 'Tüm siteler erişilebilir'}
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('sites')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center space-x-2 ${
            activeTab === 'sites'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Siteler & Lisans Sayaçları ({sites.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('modules')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center space-x-2 ${
            activeTab === 'modules'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Programlar & Modül Masası (Ekleme / Çıkarma)</span>
        </button>

        <button
          onClick={() => setActiveTab('vendors')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center space-x-2 ${
            activeTab === 'vendors'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Firmalar & Ustalar (Açma / Kapatma)</span>
          {vendors.filter((v) => v.status === 'suspended').length > 0 && (
            <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px] font-bold">
              {vendors.filter((v) => v.status === 'suspended').length} Kapalı
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('commissions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center space-x-2 ${
            activeTab === 'commissions'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>💰 Firma Komisyon & Ücret Masası</span>
          {totalPendingCommissions > 0 && (
            <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 rounded-full text-[10px] font-bold">
              {formatCurrency(totalPendingCommissions)}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center space-x-2 ${
            activeTab === 'invoices'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Yıllık SaaS Lisans Faturaları ({allInvoices.length})</span>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: SITES & LICENSES */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'sites' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Site veya şehir ara..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  filterStatus === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tümü ({sites.length})
              </button>
              <button
                onClick={() => setFilterStatus('active')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  filterStatus === 'active'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Aktif ({sites.filter((s) => !s.license.isSuspended).length})
              </button>
              <button
                onClick={() => setFilterStatus('suspended')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  filterStatus === 'suspended'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Dondurulmuş ({suspendedCount})
              </button>
            </div>
          </div>

          {/* Sites Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSites.map((site) => {
              const isDemo = site.license.isDemo || site.license.planTier === 'demo';
              const countdown = formatCountdownBadge(site.license.expiresAt, site.license.isSuspended, isDemo);
              const daysLeft = getDaysRemaining(site.license.expiresAt);

              return (
                <div
                  key={site.id}
                  className={`bg-white border rounded-2xl p-5 shadow-xs transition-all ${
                    site.license.isSuspended
                      ? 'border-rose-300 bg-rose-50/20'
                      : isDemo
                      ? 'border-purple-300 bg-purple-50/15 ring-1 ring-purple-400/30'
                      : daysLeft <= 14
                      ? 'border-amber-300 bg-amber-50/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-base text-slate-900">
                          {site.profile.siteName}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${countdown.badgeClass}`}
                        >
                          {countdown.text}
                        </span>
                        {isDemo && (
                          <span className="text-[9px] bg-purple-600 text-white font-extrabold px-1.5 py-0.2 rounded uppercase">
                            Demo
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {site.profile.city} • {site.profile.totalFlats} Daire • {site.license.planName}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg block">
                        {site.license.yearlyPrice > 0 ? `${formatCurrency(site.license.yearlyPrice)} / Yıl` : 'Ücretsiz Demo'}
                      </span>
                    </div>
                  </div>

                  {/* Modules quick badge preview */}
                  <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[10px]">
                    <span className="text-slate-400 font-semibold">Aktif Modüller:</span>
                    {modules.slice(0, 5).map((m) => {
                      const isEnabled = !site.enabledModules || site.enabledModules.includes(m.id);
                      return (
                        <span
                          key={m.id}
                          className={`px-1.5 py-0.2 rounded border ${
                            isEnabled
                              ? 'bg-slate-100 text-slate-700 border-slate-200'
                              : 'bg-slate-50 text-slate-400 border-slate-200 line-through'
                          }`}
                        >
                          {m.name.split(' ')[0]}
                        </span>
                      );
                    })}
                    <span className="text-indigo-600 font-bold">
                      +{modules.length > 5 ? modules.length - 5 : 0} daha
                    </span>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {site.license.isSuspended ? (
                        <button
                          onClick={() => onToggleSuspendSite(site.id)}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all flex items-center space-x-1"
                        >
                          <Flame className="w-3.5 h-3.5" />
                          <span>Dondurmayı Kaldır</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onToggleSuspendSite(site.id)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-800 border border-slate-300 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1"
                        >
                          <Snowflake className="w-3.5 h-3.5 text-rose-600" />
                          <span>Dondur</span>
                        </button>
                      )}

                      {/* Quick 1 Month Demo / Extension button */}
                      {isDemo ? (
                        <button
                          onClick={() => onExtendLicense(site.id, 30)}
                          className="px-2.5 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-300 rounded-lg text-xs font-bold transition-all flex items-center space-x-1"
                          title="Demo süresini 30 gün daha uzat"
                        >
                          <Gift className="w-3.5 h-3.5 text-purple-700" />
                          <span>+30 Gün Demo</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onExtendLicense(site.id, 30)}
                          className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1"
                          title="+1 Ay (30 Gün) süre uzat"
                        >
                          <Clock className="w-3.5 h-3.5 text-purple-600" />
                          <span>+1 Ay</span>
                        </button>
                      )}

                      <button
                        onClick={() => onExtendLicense(site.id, 365, true)}
                        className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1"
                        title="1 Yıl (365 Gün) lisans uzat"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>+1 Yıl</span>
                      </button>

                      <button
                        onClick={() => {
                          setExtendModalSite(site);
                          setExtendDaysChoice(30);
                          setExtendConvertToFull(!isDemo);
                        }}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1"
                        title="Özel gün sayısı ile süre uzat veya demoyu tam lisansa çevir"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Süre Uzat...</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedSiteIdForModules(site.id);
                          setActiveTab('modules');
                        }}
                        className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1"
                        title="Bu siteye ait modülleri aç/kapat"
                      >
                        <Layers className="w-3.5 h-3.5 text-purple-600" />
                        <span>Modüller</span>
                      </button>
                    </div>

                    <button
                      onClick={() => onSelectSite(site.id)}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5"
                    >
                      <span>Site Paneline Geç</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: PROGRAMLAR & MODÜLLER MASASI (EKLEME / ÇIKARMA) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'modules' && (
        <div className="space-y-5">
          {/* Header Card with Site Selector */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                Programlar & Modül Kontrol Masası
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold border border-purple-200">
                  {modules.length} Program
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Süper Admin olarak sitelerin kullanacağı modülleri tek tıkla açıp kapatabilir veya platforma özel yeni yazılım modülü ekleyebilirsiniz.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Site selector dropdown */}
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-600">Site Seçimi:</span>
                <select
                  value={selectedSiteIdForModules}
                  onChange={(e) => setSelectedSiteIdForModules(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 cursor-pointer"
                >
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>
                      🏢 {s.profile.siteName} ({s.profile.city})
                    </option>
                  ))}
                </select>
              </div>

              {/* Add Custom Module Button */}
              <button
                onClick={() => setShowNewModuleModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-200 flex items-center space-x-1.5 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Yeni Program / Modül Ekle</span>
              </button>
            </div>
          </div>

          {/* Modules Table for Selected Site */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xs text-slate-800">
                  Seçili Site: <strong className="text-purple-700">{siteForModules.profile.siteName}</strong>
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500">
                  {modules.filter((m) => !siteForModules.enabledModules || siteForModules.enabledModules.includes(m.id)).length} / {modules.length} Program Aktif
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-[11px] text-slate-500">
                  Kapatılan modül sitenin menüsünden ve kullanıcı erişiminden tamamen gizlenir.
                </span>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {modules.map((mod) => {
                const isEnabled =
                  !siteForModules.enabledModules || siteForModules.enabledModules.includes(mod.id);
                const isCore = mod.isCore;

                return (
                  <div
                    key={mod.id}
                    className={`p-4 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isEnabled ? 'hover:bg-slate-50/80' : 'bg-slate-50/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                          isEnabled
                            ? 'bg-purple-100 text-purple-700 border border-purple-200'
                            : 'bg-slate-200 text-slate-500 border border-slate-300'
                        }`}
                      >
                        <Layers className="w-5 h-5" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-slate-900">{mod.name}</span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                              mod.category === 'core'
                                ? 'bg-indigo-100 text-indigo-800'
                                : mod.category === 'finance'
                                ? 'bg-emerald-100 text-emerald-800'
                                : mod.category === 'technical'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {mod.category}
                          </span>
                          {mod.version && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              {mod.version}
                            </span>
                          )}
                          {!mod.isCore && (
                            <span className="text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200">
                              Özel Eklenti
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 max-w-xl">{mod.description}</p>
                      </div>
                    </div>

                    {/* Right: Toggle Switch & Delete if custom */}
                    <div className="flex items-center space-x-3 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => onToggleSiteModule(siteForModules.id, mod.id)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 border shadow-xs ${
                          isEnabled
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {isEnabled ? (
                          <>
                            <Power className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Program Aktif (Açık)</span>
                          </>
                        ) : (
                          <>
                            <PowerOff className="w-3.5 h-3.5 text-slate-400" />
                            <span>Program Kapalı</span>
                          </>
                        )}
                      </button>

                      {!mod.isCore && (
                        <button
                          onClick={() => {
                            if (confirm(`"${mod.name}" programını platformdan kalıcı olarak silmek istiyor musunuz?`)) {
                              onDeletePlatformModule(mod.id);
                            }
                          }}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200"
                          title="Bu programı platformdan kaldır"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: FİRMALAR & USTALAR MASASI (AÇMA / KAPATMA & DENETİM) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'vendors' && (
        <div className="space-y-4">
          {/* Header Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                Tedarikçi Firmalar & Taşeron Masası
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-200">
                  {vendors.length} Kayıtlı Firma
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Süper Admin yetkisiyle kurallara uymayan veya şikayet alan firmaları dondurabilir/kapatabilir, yeni lisanslı firmalar ekleyebilir ve site yönetimlerinin değerlendirmelerini inceleyebilirsiniz.
              </p>
            </div>

            <button
              onClick={() => setShowNewVendorModal(true)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-200 flex items-center space-x-1.5 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Yeni Firma & Usta Ekle</span>
            </button>
          </div>

          {/* Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={vendorSearch}
                onChange={(e) => setVendorSearch(e.target.value)}
                placeholder="Firma, usta veya şehir ara..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <select
                value={vendorCategoryFilter}
                onChange={(e) => setVendorCategoryFilter(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-amber-500 cursor-pointer"
              >
                <option value="all">Tüm Branşlar</option>
                {Object.entries(TRADE_CATEGORY_LABELS).map(([catKey, val]) => (
                  <option key={catKey} value={catKey}>
                    {val.label}
                  </option>
                ))}
              </select>

              <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setVendorStatusFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    vendorStatusFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tümü ({vendors.length})
                </button>
                <button
                  onClick={() => setVendorStatusFilter('active')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    vendorStatusFilter === 'active'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Açık & Faal ({vendors.filter((v) => v.status !== 'suspended').length})
                </button>
                <button
                  onClick={() => setVendorStatusFilter('suspended')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    vendorStatusFilter === 'suspended'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Kapatılan / Dondurulan ({vendors.filter((v) => v.status === 'suspended').length})
                </button>
              </div>
            </div>
          </div>

          {/* Vendors Directory Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredVendors.map((vendor) => {
              const isSuspended = vendor.status === 'suspended';
              const catInfo = TRADE_CATEGORY_LABELS[vendor.category] || { label: vendor.category };
              const reviewsCount = vendor.reviews?.length || 0;

              return (
                <div
                  key={vendor.id}
                  className={`bg-white border rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between ${
                    isSuspended
                      ? 'border-rose-300 bg-rose-50/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Top Status & Name */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                            isSuspended
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          <Wrench className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <h4 className="font-extrabold text-sm text-slate-900 leading-snug">
                              {vendor.companyName}
                            </h4>
                            {vendor.isVerified && (
                              <BadgeCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-slate-500 font-medium">
                            {vendor.authorizedPerson} • {catInfo.label}
                          </p>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                          isSuspended
                            ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}
                      >
                        {isSuspended ? '🔒 KAPATILDI / ASKIDA' : '🟢 AÇIK & FAAL'}
                      </span>
                    </div>

                    {/* Suspension reason if closed */}
                    {isSuspended && (
                      <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-800 space-y-0.5">
                        <span className="font-bold block">Kapatılma Gerekçesi (Süper Admin):</span>
                        <p className="text-[11px] italic">"{vendor.suspendedReason || 'İnceleme nedeniyle donduruldu'}"</p>
                        {vendor.suspendedDate && (
                          <span className="text-[10px] text-rose-500 block">Kayıt: {formatDate(vendor.suspendedDate)}</span>
                        )}
                      </div>
                    )}

                    {/* Specs & Ratings */}
                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Puan & Değerlendirme</span>
                        <div className="flex items-center space-x-1 font-bold text-amber-600">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{vendor.rating.toFixed(1)} / 5.0</span>
                          <span className="text-slate-400 font-normal">({reviewsCount} Yorum)</span>
                        </div>
                        {reviewsCount > 0 ? (
                          <button
                            type="button"
                            onClick={() => setViewingReviewsVendor(vendor)}
                            className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold underline cursor-pointer mt-0.5"
                          >
                            Site Değerlendirmelerini Gör →
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Henüz yorum yok</span>
                        )}
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Tamamlanan İş</span>
                        <span className="font-bold text-slate-700">
                          {vendor.completedJobsCount} Şantiye İşi
                        </span>
                      </div>
                    </div>

                    {/* Contact & Cert */}
                    <div className="text-xs text-slate-600 space-y-1">
                      <div className="flex items-center space-x-1.5 text-slate-500 text-[11px]">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{vendor.phone}</span>
                        <span>•</span>
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span className="truncate">{vendor.email}</span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-slate-500 text-[11px]">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{vendor.city} ({vendor.districts.slice(0, 3).join(', ')})</span>
                      </div>
                      {vendor.certNumber && (
                        <div className="text-[10px] text-slate-500 font-mono">
                          Belge No: {vendor.certNumber}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Super Admin Action Buttons */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      {isSuspended ? (
                        <button
                          onClick={() => onToggleVendorStatus(vendor.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1 shadow-xs"
                        >
                          <Power className="w-3.5 h-3.5" />
                          <span>Firmayı Tekrar Aç (Aktif Et)</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSuspendModalVendor(vendor);
                            setSuspendReasonInput('Standart dışı işçilik şikayeti & denetim gereği');
                          }}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 border border-rose-300 rounded-lg text-xs font-bold transition flex items-center space-x-1"
                        >
                          <PowerOff className="w-3.5 h-3.5" />
                          <span>Firmayı Kapat / Dondur</span>
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        if (confirm(`"${vendor.companyName}" firmasını platformdan tamamen silmek istiyor musunuz?`)) {
                          onDeleteVendor(vendor.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                      title="Firmayı Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 4: FİRMA KOMİSYON & YILLIK ÜCRET MASASI */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'commissions' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                  <DollarSign className="w-5 h-5" />
                </span>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  Firma Komisyon & Yıllık Ücret Yönetim Masası
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                    {vendors.length} Tedarikçi Firma
                  </span>
                </h3>
              </div>
              <p className="text-xs text-slate-500 max-w-2xl">
                Süper Admin olarak firmaların yaptığı işlere göre yüzde komisyon (%3 - %10) veya yıllık sabit listeleme/lisans bedeli yansıtın, tahakkuk eden ücretleri ve tahsilat durumunu takip edin.
              </p>
            </div>

            <button
              onClick={() => {
                setBillingModalVendor(vendors[0] || null);
                setSelectedVendorForBillingId(vendors[0]?.id || '');
                setFeeTypeInput('job_commission');
                setFeeJobTitleInput('');
                setFeeJobAmountInput(25000);
                setFeeCommissionRateInput(vendors[0]?.commissionRate || 5);
              }}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-200 flex items-center space-x-2 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Yeni Komisyon / Ücret Yansıt</span>
            </button>
          </div>

          {/* Revenue & Commission KPI Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-700 rounded-2xl p-4 text-white shadow-md">
              <div className="flex items-center justify-between opacity-90 text-xs font-medium">
                <span>Tahsil Edilen Komisyonlar</span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-2xl font-black mt-2 font-mono">
                {formatCurrency(totalPaidCommissions)}
              </div>
              <div className="text-[11px] opacity-80 mt-1">
                {allCommissionFees.filter((f) => f.status === 'paid').length} adet ödeme tamamlandı
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-4 text-white shadow-md">
              <div className="flex items-center justify-between opacity-90 text-xs font-medium">
                <span>Bekleyen Komisyon Alacağı</span>
                <Clock className="w-4 h-4" />
              </div>
              <div className="text-2xl font-black mt-2 font-mono">
                {formatCurrency(totalPendingCommissions)}
              </div>
              <div className="text-[11px] opacity-80 mt-1">
                {allCommissionFees.filter((f) => f.status === 'pending' || f.status === 'overdue').length} adet tahakkuk bekliyor
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-4 text-white shadow-md">
              <div className="flex items-center justify-between opacity-90 text-xs font-medium">
                <span>Yıllık Firma Lisans Gelirleri</span>
                <Calendar className="w-4 h-4" />
              </div>
              <div className="text-2xl font-black mt-2 font-mono">
                {formatCurrency(totalAnnualVendorFees)}
              </div>
              <div className="text-[11px] opacity-80 mt-1">
                Sabit yıllık üyelik tarifesi
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                <span>Firma Ücret Modeli Dağılımı</span>
                <Percent className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-sm font-bold text-slate-800 mt-2 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-700 font-semibold">• İş Başı % Komisyon:</span>
                  <span className="font-mono font-bold">
                    {vendors.filter((v) => v.billingModel !== 'annual_subscription').length} Firma
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-indigo-700 font-semibold">• Yıllık Sabit Lisans:</span>
                  <span className="font-mono font-bold">
                    {vendors.filter((v) => v.billingModel === 'annual_subscription' || v.billingModel === 'hybrid').length} Firma
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Firmalar ve Ücret Sözleşmeleri */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  Firmalar, Komisyon Oranları & Yıllık Ücret Tarifeleri
                </h4>
                <p className="text-xs text-slate-500">
                  Her firmanın platforma ödeyeceği iş başı komisyon oranını (%3 - %15) veya yıllık sabit üyelik bedelini belirleyin.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="py-3 px-4">Firma & Yetkili</th>
                    <th className="py-3 px-4">Hizmet Branşı</th>
                    <th className="py-3 px-4">Uygulanan Ücret Modeli</th>
                    <th className="py-3 px-4">Tarife Detayı</th>
                    <th className="py-3 px-4 text-center">Tamamlanan İş</th>
                    <th className="py-3 px-4 text-right">Tahsil Edilen</th>
                    <th className="py-3 px-4 text-right">Bekleyen</th>
                    <th className="py-3 px-4 text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {vendors.map((vendor) => {
                    const vendorFees = vendor.commissionFees || [];
                    const paidSum = vendorFees
                      .filter((f) => f.status === 'paid')
                      .reduce((s, f) => s + f.feeAmount, 0);
                    const pendingSum = vendorFees
                      .filter((f) => f.status === 'pending' || f.status === 'overdue')
                      .reduce((s, f) => s + f.feeAmount, 0);
                    const catInfo = TRADE_CATEGORY_LABELS[vendor.category] || { label: vendor.category };
                    const model = vendor.billingModel || 'commission';

                    return (
                      <tr key={vendor.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{vendor.companyName}</div>
                          <div className="text-[11px] text-slate-500">{vendor.authorizedPerson} • {vendor.city}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-medium text-slate-700">
                            {catInfo.label}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {model === 'commission' && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[11px] border border-emerald-200">
                              İş Başı Komisyon
                            </span>
                          )}
                          {model === 'annual_subscription' && (
                            <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 font-bold text-[11px] border border-indigo-200">
                              Yıllık Sabit Lisans
                            </span>
                          )}
                          {model === 'hybrid' && (
                            <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-bold text-[11px] border border-purple-200">
                              Hibrit (Komisyon + Yıllık)
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                          {model === 'commission' && `%${vendor.commissionRate || 5} İş Komisyonu`}
                          {model === 'annual_subscription' && `${formatCurrency(vendor.annualSubscriptionFee || 4800)} / Yıl`}
                          {model === 'hybrid' && `%${vendor.commissionRate || 5} + ${formatCurrency(vendor.annualSubscriptionFee || 4800)}/Yıl`}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-slate-800">
                          {vendor.completedJobsCount} İş
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                          {formatCurrency(paidSum)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-amber-600">
                          {pendingSum > 0 ? formatCurrency(pendingSum) : '-'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => {
                                setEditModelVendor(vendor);
                                setModelChoice(vendor.billingModel || 'commission');
                                setModelRateInput(vendor.commissionRate || 5);
                                setModelAnnualFeeInput(vendor.annualSubscriptionFee || 4800);
                              }}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition"
                              title="Firmanın ücret modelini ve komisyon oranını değiştir"
                            >
                              Modeli Düzenle
                            </button>
                            <button
                              onClick={() => {
                                setBillingModalVendor(vendor);
                                setSelectedVendorForBillingId(vendor.id);
                                setFeeTypeInput(vendor.billingModel === 'annual_subscription' ? 'annual_subscription' : 'job_commission');
                                setFeeJobTitleInput('');
                                setFeeJobAmountInput(20000);
                                setFeeCommissionRateInput(vendor.commissionRate || 5);
                                setFeeAnnualAmountInput(vendor.annualSubscriptionFee || 4800);
                              }}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
                              title="Bu firmaya yeni komisyon veya yıllık lisans faturası kes"
                            >
                              + Ücret Yansıt
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Tahakkuk Eden Komisyon & Lisans Faturaları */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  Firmalara Kesilen Komisyon & Üyelik Faturaları / Tahsilat Listesi
                </h4>
                <p className="text-xs text-slate-500">
                  Platform tarafından firmalara yansıtılan iş komisyonu ve yıllık abonelik faturalarının ödeme takibi.
                </p>
              </div>
            </div>

            {allCommissionFees.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                Henüz firmalara yansıtılmış komisyon veya yıllık lisans faturası bulunmuyor.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-600 font-bold">
                      <th className="py-3 px-4">Fatura No</th>
                      <th className="py-3 px-4">Firma Adı</th>
                      <th className="py-3 px-4">Ücret Türü</th>
                      <th className="py-3 px-4">İş / Şantiye Bilgisi</th>
                      <th className="py-3 px-4 text-right">İş Tutarı</th>
                      <th className="py-3 px-4 text-center">Komisyon Oranı</th>
                      <th className="py-3 px-4 text-right">Tahakkuk Eden Tutar</th>
                      <th className="py-3 px-4">Vade Tarihi</th>
                      <th className="py-3 px-4 text-center">Durum</th>
                      <th className="py-3 px-4 text-right">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {allCommissionFees.map((fee) => (
                      <tr key={fee.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                          {fee.invoiceNo || 'KOM-2026'}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {fee.vendorName}
                        </td>
                        <td className="py-3 px-4">
                          {fee.feeType === 'job_commission' ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                              İş Komisyonu
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold border border-indigo-200">
                              Yıllık Üyelik
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-800">{fee.jobTitle}</div>
                          {fee.siteName && (
                            <div className="text-[10px] text-slate-500">🏢 {fee.siteName}</div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-600">
                          {fee.jobAmount ? formatCurrency(fee.jobAmount) : '-'}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-emerald-700 font-mono">
                          {fee.commissionRate ? `%${fee.commissionRate}` : '-'}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-extrabold text-slate-900">
                          {formatCurrency(fee.feeAmount)}
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                          <div>{formatDate(fee.dueDate)}</div>
                          {fee.paidDate && (
                            <div className="text-[10px] text-emerald-600">Ödendi: {formatDate(fee.paidDate)}</div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              fee.status === 'paid'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : fee.status === 'overdue'
                                ? 'bg-rose-100 text-rose-800 border-rose-300'
                                : 'bg-amber-100 text-amber-800 border-amber-300'
                            }`}
                          >
                            {fee.status === 'paid'
                              ? '✓ Tahsil Edildi'
                              : fee.status === 'overdue'
                              ? '⚠️ Vadesi Geçti'
                              : '⏳ Ödeme Bekliyor'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {fee.status !== 'paid' && onMarkVendorFeePaid && (
                            <button
                              onClick={() => onMarkVendorFeePaid(fee.vendorId, fee.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
                            >
                              Ödendi İşaretle
                            </button>
                          )}
                          {fee.status === 'paid' && (
                            <span className="text-[11px] text-slate-400 font-medium italic">
                              {fee.paymentMethod || 'Tahsil Edildi'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 5: YILLIK SAAS LİSANS FATURALARI */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                SaaS Platform Yıllık Lisans Faturaları
              </h3>
              <p className="text-xs text-slate-500">
                ApsisCloud tarafından sitelere kesilen resmi abonelik ve lisans faturaları
              </p>
            </div>

            <button
              onClick={() => onOpenNewInvoiceModal()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Fatura Oluştur</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="py-3 px-4">Fatura No</th>
                    <th className="py-3 px-4">Site Adı</th>
                    <th className="py-3 px-4">Dönem / Açıklama</th>
                    <th className="py-3 px-4">Düzenleme / Vade</th>
                    <th className="py-3 px-4 text-right">Tutar (KDV Dahil)</th>
                    <th className="py-3 px-4 text-center">Durum</th>
                    <th className="py-3 px-4 text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {allInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{inv.siteName}</td>
                      <td className="py-3 px-4 text-slate-600">{inv.period}</td>
                      <td className="py-3 px-4 text-slate-500">
                        <div>Düzenleme: {formatDate(inv.issueDate)}</div>
                        <div className="text-[10px] text-slate-400">Vade: {formatDate(inv.dueDate)}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono">
                        {formatCurrency(inv.totalAmount)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            inv.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : inv.status === 'overdue'
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : 'bg-amber-100 text-amber-800 border-amber-300'
                          }`}
                        >
                          {inv.status === 'paid'
                            ? 'Ödendi'
                            : inv.status === 'overdue'
                            ? 'Vadesi Geçti'
                            : 'Ödeme Bekliyor'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => onViewInvoice(inv)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                          >
                            Görüntüle
                          </button>
                          {inv.status !== 'paid' && (
                            <button
                              onClick={() => onMarkInvoicePaid(inv.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
                            >
                              Ödendi İşaretle
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: YENİ PROGRAM / MODÜL EKLE */}
      {/* ------------------------------------------------------------- */}
      {showNewModuleModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-slate-800 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2">
                <Layers className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Yeni Platform Programı / Modülü Ekle
                </h3>
              </div>
              <button
                onClick={() => setShowNewModuleModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateModuleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Program / Modül Adı *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Akıllı Havuz & Spor Salonu Rezervasyon Modülü"
                  value={newModuleName}
                  onChange={(e) => setNewModuleName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Modül Kategorisi
                </label>
                <select
                  value={newModuleCategory}
                  onChange={(e) =>
                    setNewModuleCategory(e.target.value as PlatformProgramModule['category'])
                  }
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none cursor-pointer"
                >
                  <option value="addon">Eklenti / Katma Değerli Servis (addon)</option>
                  <option value="technical">Teknik & Arıza (technical)</option>
                  <option value="finance">Finans & Muhasebe (finance)</option>
                  <option value="community">Sakin & Sosyal (community)</option>
                  <option value="compliance">Hukuk & Mevzuat (compliance)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Modül Açıklaması & Kapsamı *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Bu modülün sitelerde ne işe yaradığını ve yetkilerini açıklayınız..."
                  value={newModuleDesc}
                  onChange={(e) => setNewModuleDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-purple-900 text-xs">
                ✓ Eklenen modül tüm sitelerin modül yönetim listesine gelir; Süper Admin istediği siteye açıp kapatabilir.
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowNewModuleModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-md shadow-purple-200"
                >
                  Programı Sisteme Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: FİRMAYI KAPAT / DONDUR ONAYI */}
      {/* ------------------------------------------------------------- */}
      {suspendModalVendor && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-slate-800 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900">
                  Firmayı Kapat / Hizmeti Askıya Al
                </h3>
              </div>
              <button
                onClick={() => setSuspendModalVendor(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmSuspendVendor} className="space-y-4 text-xs">
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 space-y-1">
                <span className="font-bold text-rose-900 block">{suspendModalVendor.companyName}</span>
                <span className="text-[11px] text-rose-700 block">
                  Yetkili: {suspendModalVendor.authorizedPerson} • {TRADE_CATEGORY_LABELS[suspendModalVendor.category]?.label}
                </span>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Kapatılma / Askıya Alma Nedeni *
                </label>
                <textarea
                  rows={3}
                  required
                  value={suspendReasonInput}
                  onChange={(e) => setSuspendReasonInput(e.target.value)}
                  placeholder="Örn: Standart dışı malzeme şikayeti, belge yenilenmesi bekleniyor..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="text-[11px] text-slate-500">
                Firma kapatıldığında portal üzerinden yeni ihalelere teklif veremez ve site yönetimlerine pasif/kilitli olarak görünür.
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSuspendModalVendor(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md shadow-rose-200"
                >
                  Firmayı Kapat & Dondur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: SÜPER ADMİN YENİ FİRMA / USTA EKLE */}
      {/* ------------------------------------------------------------- */}
      {showNewVendorModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 text-slate-800 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2 text-amber-600">
                <Wrench className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900">
                  Yeni Onaylı Firma & Usta Ekle
                </h3>
              </div>
              <button
                onClick={() => setShowNewVendorModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVendorSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-slate-700 font-bold mb-1">
                    Firma / Ticari Ünvan *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Lider Asansör ve Bakım A.Ş."
                    value={newCompanyName}
                    onChange={(e) => setNewCompanyName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-slate-700 font-bold mb-1">
                    Yetkili Usta / Mühendis *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Usta Mehmet Yıldız"
                    value={newAuthPerson}
                    onChange={(e) => setNewAuthPerson(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Uzmanlık / Hizmet Branşı *
                  </label>
                  <select
                    value={newVendorCategory}
                    onChange={(e) => setNewVendorCategory(e.target.value as VendorTradeCategory)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
                  >
                    {Object.entries(TRADE_CATEGORY_LABELS).map(([catKey, val]) => (
                      <option key={catKey} value={catKey}>
                        {val.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    İletişim Telefonu *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="0532 000 00 00"
                    value={newVendorPhone}
                    onChange={(e) => setNewVendorPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Şehir
                  </label>
                  <input
                    type="text"
                    value={newVendorCity}
                    onChange={(e) => setNewVendorCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Hizmet Verdiği İlçeler
                  </label>
                  <input
                    type="text"
                    value={newVendorDistricts}
                    onChange={(e) => setNewVendorDistricts(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Yetki Belgesi & Ruhsat No
                </label>
                <input
                  type="text"
                  value={newVendorCert}
                  onChange={(e) => setNewVendorCert(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowNewVendorModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-md shadow-amber-200"
                >
                  Firmayı Onayla & Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: SİTE YÖNETİMLERİNİN FİRMA DEĞERLENDİRMELERİ & PUANLARI */}
      {/* ------------------------------------------------------------- */}
      {viewingReviewsVendor && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 text-slate-800 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Site Yönetimleri Değerlendirme Raporu
                  </h3>
                  <p className="text-xs text-slate-500">
                    {viewingReviewsVendor.companyName} • Yetkili: {viewingReviewsVendor.authorizedPerson}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingReviewsVendor(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Score Summary Box */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="text-3xl font-black text-amber-700 font-mono">
                  {viewingReviewsVendor.rating.toFixed(1)}
                </div>
                <div>
                  <div className="flex items-center text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= Math.round(viewingReviewsVendor.rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-amber-900 font-semibold">
                    Toplam {viewingReviewsVendor.reviews?.length || 0} Site Yönetimi Puanladı
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-0.5">
                <div>Tamamlanan İş: <strong className="text-slate-900">{viewingReviewsVendor.completedJobsCount} Adet</strong></div>
                <div>Doğrulama: <strong className="text-emerald-700">✓ Onaylı Taşeron</strong></div>
              </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Site Yönetimlerinin Yazdığı Yorumlar & Kriter Puanları
              </h4>

              {(!viewingReviewsVendor.reviews || viewingReviewsVendor.reviews.length === 0) ? (
                <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-500 text-xs">
                  Bu firmaya henüz site yönetimleri tarafından yazılı değerlendirme yapılmamış.
                </div>
              ) : (
                <div className="space-y-3">
                  {viewingReviewsVendor.reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="bg-slate-50/80 border border-slate-200 rounded-2xl p-4 space-y-2.5 text-xs hover:border-indigo-200 transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-extrabold text-slate-900 text-sm">
                              🏢 {rev.siteName}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 font-semibold">
                              {rev.managerName}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">
                            🔧 İş: {rev.jobTitle}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          <div className="flex items-center text-amber-500 bg-white px-2 py-1 rounded-lg border border-amber-200 font-bold text-xs">
                            <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" />
                            <span>{rev.rating}.0 / 5.0</span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {formatDate(rev.date)}
                          </span>
                        </div>
                      </div>

                      {/* Sub-Criteria breakdown */}
                      {rev.criteriaRatings && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] bg-white p-2 rounded-xl border border-slate-200/60">
                          <div>
                            <span className="text-slate-400 block">İşçilik Kalitesi</span>
                            <span className="font-bold text-slate-800">{rev.criteriaRatings.quality} / 5</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Zamanında Teslim</span>
                            <span className="font-bold text-slate-800">{rev.criteriaRatings.timing} / 5</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Fiyat Uygunluğu</span>
                            <span className="font-bold text-slate-800">{rev.criteriaRatings.pricing} / 5</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Usta İletişimi</span>
                            <span className="font-bold text-slate-800">{rev.criteriaRatings.communication} / 5</span>
                          </div>
                        </div>
                      )}

                      {/* Comment text */}
                      <p className="text-slate-700 italic text-xs bg-white/70 p-2.5 rounded-xl border border-slate-200/50">
                        "{rev.comment}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingReviewsVendor(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: SİTE LİSANS / DEMO SÜRESİ UZATMA */}
      {/* ------------------------------------------------------------- */}
      {extendModalSite && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-slate-800 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2 text-indigo-700">
                <Clock className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900">
                  Site Lisans & Demo Süresini Uzat
                </h3>
              </div>
              <button
                onClick={() => setExtendModalSite(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExtendConfirmSubmit} className="space-y-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 text-sm">
                    {extendModalSite.profile.siteName}
                  </span>
                  {(extendModalSite.license.isDemo || extendModalSite.license.planTier === 'demo') ? (
                    <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold text-[10px]">
                      🎁 1 Aylık Demo
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      Kurumsal Lisans
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500">
                  Mevcut Bitiş Tarihi: <strong className="font-mono text-slate-800">{formatDate(extendModalSite.license.expiresAt)}</strong>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  Uzatılacak Süre Seçimi *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: '+15 Gün (Yarım Ay)', days: 15 },
                    { label: '+30 Gün (1 Ay)', days: 30 },
                    { label: '+90 Gün (3 Ay)', days: 90 },
                    { label: '+365 Gün (1 Yıl)', days: 365 },
                  ].map((opt) => (
                    <button
                      key={opt.days}
                      type="button"
                      onClick={() => setExtendDaysChoice(opt.days)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                        extendDaysChoice === opt.days
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Veya Özel Gün Sayısı Girin
                </label>
                <input
                  type="number"
                  min="1"
                  max="1825"
                  value={extendDaysChoice}
                  onChange={(e) => setExtendDaysChoice(parseInt(e.target.value, 10) || 30)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {(extendModalSite.license.isDemo || extendModalSite.license.planTier === 'demo') && (
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 space-y-1.5">
                  <label className="flex items-center space-x-2 cursor-pointer font-bold text-purple-950 text-xs">
                    <input
                      type="checkbox"
                      checked={extendConvertToFull}
                      onChange={(e) => setExtendConvertToFull(e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded-sm focus:ring-purple-500"
                    />
                    <span>Demoyu Tam Lisansa Çevir (Demo etiketini kaldır)</span>
                  </label>
                  <p className="text-[11px] text-purple-800">
                    İşaretlendiğinde site Demo modundan çıkarılır ve tam Kurumsal Profesyonel Paket olarak kaydedilir.
                  </p>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setExtendModalSite(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-200"
                >
                  Süreyi Uzat ve Onayla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: FİRMAYA KOMİSYON / YILLIK ÜCRET YANSIT */}
      {/* ------------------------------------------------------------- */}
      {billingModalVendor && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 text-slate-800 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2 text-emerald-700">
                <DollarSign className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900">
                  Firmaya Komisyon / Yıllık Ücret Yansıt
                </h3>
              </div>
              <button
                onClick={() => setBillingModalVendor(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFeeSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  İlgili Taşeron Firma *
                </label>
                <select
                  value={selectedVendorForBillingId || billingModalVendor.id}
                  onChange={(e) => setSelectedVendorForBillingId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                >
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.companyName} ({v.authorizedPerson})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  Ücretlendirme Türü *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFeeTypeInput('job_commission')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                      feeTypeInput === 'job_commission'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    💼 Yapılan İş Başı Komisyon
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeeTypeInput('annual_subscription')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                      feeTypeInput === 'annual_subscription'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    📅 Yıllık Sabit Lisans Bedeli
                  </button>
                </div>
              </div>

              {feeTypeInput === 'job_commission' ? (
                <>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Yapılan İş / Şantiye Başlığı *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Örn: Asansör Periyodik Bakım ve Halat Revizyonu"
                      value={feeJobTitleInput}
                      onChange={(e) => setFeeJobTitleInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        İş / Hakediş Tutarı (TL) *
                      </label>
                      <input
                        type="number"
                        min="100"
                        required
                        value={feeJobAmountInput}
                        onChange={(e) => setFeeJobAmountInput(parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        Komisyon Oranı (%) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        required
                        value={feeCommissionRateInput}
                        onChange={(e) => setFeeCommissionRateInput(parseFloat(e.target.value) || 5)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-emerald-950 font-bold">
                    <span>Tahakkuk Edecek Komisyon:</span>
                    <span className="text-base font-mono text-emerald-700">
                      {formatCurrency(Math.round((feeJobAmountInput * feeCommissionRateInput) / 100))}
                    </span>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Yıllık Platform Listeleme Bedeli (TL) *
                  </label>
                  <input
                    type="number"
                    min="500"
                    required
                    value={feeAnnualAmountInput}
                    onChange={(e) => setFeeAnnualAmountInput(parseFloat(e.target.value) || 4800)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Firmanın 1 yıl boyunca tüm sitelerin teklif masasında listelenmesi için tahakkuk ettirilen bedeldir.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Açıklama / Fatura Notu
                </label>
                <input
                  type="text"
                  placeholder="Örn: 2026-2027 Dönemi platform katılım komisyonu"
                  value={feeNotesInput}
                  onChange={(e) => setFeeNotesInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setBillingModalVendor(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-200"
                >
                  Ücret Faturasını Kaydet & Gönder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: FİRMA ÜCRET MODELİ DÜZENLE */}
      {/* ------------------------------------------------------------- */}
      {editModelVendor && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-slate-800 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2 text-indigo-700">
                <Percent className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900">
                  Firma Ücret Modelini Düzenle
                </h3>
              </div>
              <button
                onClick={() => setEditModelVendor(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateModelSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block">{editModelVendor.companyName}</span>
                <span className="text-[11px] text-slate-500">Yetkili: {editModelVendor.authorizedPerson}</span>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Uygulanacak Platform Ücret Modeli *
                </label>
                <select
                  value={modelChoice}
                  onChange={(e) => setModelChoice(e.target.value as VendorBillingModel)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="commission">İş Başı Komisyon Modeli (% Kesinti)</option>
                  <option value="annual_subscription">Yıllık Sabit Lisans / Listeleme Ücreti</option>
                  <option value="hybrid">Hibrit Model (% Komisyon + Yıllık Ücret)</option>
                </select>
              </div>

              {(modelChoice === 'commission' || modelChoice === 'hybrid') && (
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    İş Başı Kesilecek Komisyon Oranı (%) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={modelRateInput}
                    onChange={(e) => setModelRateInput(parseFloat(e.target.value) || 5)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold"
                  />
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    Standart tavsiye edilen oran %5'tir.
                  </span>
                </div>
              )}

              {(modelChoice === 'annual_subscription' || modelChoice === 'hybrid') && (
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Yıllık Sabit Üyelik Lisans Bedeli (TL) *
                  </label>
                  <input
                    type="number"
                    min="1000"
                    required
                    value={modelAnnualFeeInput}
                    onChange={(e) => setModelAnnualFeeInput(parseFloat(e.target.value) || 4800)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold"
                  />
                </div>
              )}

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditModelVendor(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-200"
                >
                  Modeli Güncelle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: EXCEL'DEN SİTE İÇE AKTARMA */}
      {/* ------------------------------------------------------------- */}
      {showExcelImportModal && (
        <ExcelSiteImportModal
          onClose={() => setShowExcelImportModal(false)}
          onImportSite={(newSite) => {
            if (onImportSite) {
              onImportSite(newSite);
            }
          }}
        />
      )}
    </div>
  );
};
