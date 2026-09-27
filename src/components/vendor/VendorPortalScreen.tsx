/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Wrench,
  Building2,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  Send,
  ShieldCheck,
  Star,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertCircle,
  FileText,
  BadgeCheck,
  Award,
  ArrowRight,
  Sparkles,
  ArrowUpDown,
  Droplets,
  Zap,
  Paintbrush,
  Shield,
  Trees,
  Home,
  Briefcase,
  Layers,
  DollarSign,
  FileCheck,
  Check,
  X,
  ChevronRight,
  ExternalLink,
  HelpCircle,
  TrendingUp,
  User,
  Plus,
  RefreshCw,
  PhoneCall,
  HardHat,
  PackageCheck,
  FileSpreadsheet,
  AlertTriangle,
} from 'lucide-react';
import {
  VendorCompany,
  ServiceQuoteRequest,
  VendorQuote,
  VendorTradeCategory,
  MaintenanceTicket,
  TenantSite,
  UserRole,
} from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { TRADE_CATEGORY_LABELS } from '../../data/vendorData';

interface VendorPortalScreenProps {
  currentSite: TenantSite;
  vendors: VendorCompany[];
  activeVendor: VendorCompany;
  quoteRequests: ServiceQuoteRequest[];
  tickets: MaintenanceTicket[];
  onSelectVendor: (vendor: VendorCompany) => void;
  onSubmitQuote: (requestId: string, newQuote: VendorQuote) => void;
  onUpdateJobProgress: (
    requestId: string,
    progress: 'material_prep' | 'on_site_work' | 'testing' | 'completed'
  ) => void;
  onCompleteJob: (
    requestId: string,
    completionData: {
      completionNotes: string;
      serviceInvoiceNo: string;
      completedAmount: number;
    }
  ) => void;
  onUpdateTicketStatus: (
    ticketId: string,
    status: MaintenanceTicket['status'],
    technicianNotes?: string
  ) => void;
  onUpdateVendorProfile: (updatedVendor: VendorCompany) => void;
  onSwitchRole: (role: UserRole) => void;
}

export const VendorPortalScreen: React.FC<VendorPortalScreenProps> = ({
  currentSite,
  vendors,
  activeVendor,
  quoteRequests,
  tickets,
  onSelectVendor,
  onSubmitQuote,
  onUpdateJobProgress,
  onCompleteJob,
  onUpdateTicketStatus,
  onUpdateVendorProfile,
  onSwitchRole,
}) => {
  const [activePortalTab, setActivePortalTab] = useState<
    'tenders' | 'my-bids' | 'active-jobs' | 'service-tickets' | 'finances' | 'profile'
  >('tenders');

  // Filter states for Tenders
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [tenderSearchQuery, setTenderSearchQuery] = useState('');
  const [onlyMyCategory, setOnlyMyCategory] = useState(true);

  // Quote Submission Modal state
  const [selectedTenderForQuote, setSelectedTenderForQuote] =
    useState<ServiceQuoteRequest | null>(null);
  const [bidAmount, setBidAmount] = useState<string>('');
  const [bidIncludesVat, setBidIncludesVat] = useState(true);
  const [bidDeliveryDays, setBidDeliveryDays] = useState<number>(3);
  const [bidWarrantyMonths, setBidWarrantyMonths] = useState<number>(24);
  const [bidMaterialQuality, setBidMaterialQuality] = useState<string>('');
  const [bidNotes, setBidNotes] = useState<string>('');

  // Complete Job Modal state
  const [completingTender, setCompletingTender] = useState<ServiceQuoteRequest | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');
  const [completionInvoiceNo, setCompletionInvoiceNo] = useState('');

  // Ticket handling state
  const [selectedTicketForUpdate, setSelectedTicketForUpdate] =
    useState<MaintenanceTicket | null>(null);
  const [ticketActionNotes, setTicketActionNotes] = useState('');
  const [ticketNewStatus, setTicketNewStatus] =
    useState<MaintenanceTicket['status']>('in_progress');

  // Profile edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editPhone, setEditPhone] = useState(activeVendor.phone);
  const [editEmail, setEditEmail] = useState(activeVendor.email);
  const [editAddress, setEditAddress] = useState(activeVendor.address);
  const [editIban, setEditIban] = useState(
    activeVendor.iban || 'TR00 0000 0000 0000 0000 0000 00'
  );
  const [editEmergency, setEditEmergency] = useState(
    activeVendor.emergencyAvailable ?? true
  );

  // Filtered quote requests for the active vendor
  const vendorQuotes = quoteRequests.flatMap((r) =>
    r.quotes
      .filter((q) => q.vendorId === activeVendor.id)
      .map((q) => ({ request: r, quote: q }))
  );

  // Awarded active jobs for this vendor
  const awardedJobs = quoteRequests.filter(
    (r) =>
      r.status === 'awarded' &&
      (r.awardedVendorId === activeVendor.id ||
        r.quotes.some((q) => q.vendorId === activeVendor.id && q.status === 'accepted'))
  );

  // Completed jobs
  const completedJobs = quoteRequests.filter(
    (r) => r.status === 'completed' && r.awardedVendorId === activeVendor.id
  );

  // Assigned tickets that match category or technician
  const assignedTickets = tickets.filter(
    (t) =>
      t.category === activeVendor.category ||
      t.assignedTechnician?.toLowerCase().includes(activeVendor.authorizedPerson.toLowerCase()) ||
      t.assignedTechnician?.toLowerCase().includes(activeVendor.companyName.toLowerCase())
  );

  // Tenders available to bid on
  const availableTenders = quoteRequests.filter((r) => {
    if (r.status === 'completed') return false;
    if (onlyMyCategory && r.category !== activeVendor.category) return false;
    if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;
    if (tenderSearchQuery.trim()) {
      const q = tenderSearchQuery.toLowerCase();
      const match =
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.siteName.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const getCategoryIcon = (category: VendorTradeCategory) => {
    switch (category) {
      case 'elevator':
        return <ArrowUpDown className="w-4 h-4 text-indigo-500" />;
      case 'plumbing':
        return <Droplets className="w-4 h-4 text-sky-500" />;
      case 'electrical':
        return <Zap className="w-4 h-4 text-amber-500" />;
      case 'painting_facade':
        return <Paintbrush className="w-4 h-4 text-emerald-500" />;
      case 'security_camera':
        return <Shield className="w-4 h-4 text-rose-500" />;
      case 'gardening_landscape':
        return <Trees className="w-4 h-4 text-green-500" />;
      case 'cleaning':
        return <Sparkles className="w-4 h-4 text-teal-500" />;
      case 'roof_insulation':
        return <Home className="w-4 h-4 text-orange-500" />;
      default:
        return <Wrench className="w-4 h-4 text-slate-400" />;
    }
  };

  const handleOpenQuoteModal = (tender: ServiceQuoteRequest) => {
    if (activeVendor.status === 'suspended') {
      alert(
        `⚠️ Firmanız Süper Admin tarafından askıya alınmıştır / kapatılmıştır.\nGerekçe: "${activeVendor.suspendedReason || 'İnceleme devam ediyor'}"\nYeni ihalelere teklif veremezsiniz.`
      );
      return;
    }
    setSelectedTenderForQuote(tender);
    // If vendor already bid, prefill
    const existing = tender.quotes.find((q) => q.vendorId === activeVendor.id);
    if (existing) {
      setBidAmount(existing.amount.toString());
      setBidIncludesVat(existing.includesVat);
      setBidDeliveryDays(existing.deliveryDays);
      setBidWarrantyMonths(existing.warrantyMonths);
      setBidMaterialQuality(existing.materialQuality);
      setBidNotes(existing.notes);
    } else {
      setBidAmount(tender.estimatedBudget ? (tender.estimatedBudget * 0.9).toString() : '15000');
      setBidIncludesVat(true);
      setBidDeliveryDays(3);
      setBidWarrantyMonths(24);
      setBidMaterialQuality(
        activeVendor.category === 'plumbing'
          ? 'Wilo 16 Bar EPDM Membran + Pirinç Bağlantı Elemanları'
          : activeVendor.category === 'elevator'
          ? 'TSE & CE Belgeli Orijinal Revizyon Parçaları'
          : 'TSE Standartlarında 1. Kalite Malzeme'
      );
      setBidNotes(
        `${activeVendor.companyName} olarak işçilik, montaj, devreye alma ve garanti belgesi taahhüt ediyoruz.`
      );
    }
  };

  const handleSubmitQuoteForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenderForQuote) return;

    const parsedAmount = parseFloat(bidAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Lütfen geçerli bir teklif tutarı giriniz.');
      return;
    }

    const newQuote: VendorQuote = {
      id: `quote-${activeVendor.id}-${Date.now()}`,
      requestId: selectedTenderForQuote.id,
      vendorId: activeVendor.id,
      vendorName: activeVendor.companyName,
      vendorCategory: activeVendor.category,
      vendorPhone: activeVendor.phone,
      vendorEmail: activeVendor.email,
      vendorRating: activeVendor.rating,
      isVerifiedVendor: activeVendor.isVerified,
      amount: parsedAmount,
      currency: 'TRY',
      includesVat: bidIncludesVat,
      deliveryDays: Number(bidDeliveryDays),
      warrantyMonths: Number(bidWarrantyMonths),
      materialQuality: bidMaterialQuality || '1. Kalite Standart Malzeme',
      notes: bidNotes,
      submittedDate: new Date().toISOString().split('T')[0],
      status: 'pending',
    };

    onSubmitQuote(selectedTenderForQuote.id, newQuote);
    setSelectedTenderForQuote(null);
  };

  const handleOpenCompleteModal = (tender: ServiceQuoteRequest) => {
    setCompletingTender(tender);
    setCompletionInvoiceNo(`SRV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    setCompletionNotes(
      `${tender.title} işi başarıyla tamamlanmış, sahada testleri yapılmış ve çalışır vaziyette site yönetimine teslim edilmiştir.`
    );
  };

  const handleCompleteJobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingTender) return;

    onCompleteJob(completingTender.id, {
      completionNotes,
      serviceInvoiceNo: completionInvoiceNo,
      completedAmount: completingTender.awardedAmount || completingTender.estimatedBudget || 0,
    });
    setCompletingTender(null);
  };

  const handleTicketStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketForUpdate) return;

    onUpdateTicketStatus(
      selectedTicketForUpdate.id,
      ticketNewStatus,
      ticketActionNotes || undefined
    );
    setSelectedTicketForUpdate(null);
  };

  const handleSaveProfile = () => {
    onUpdateVendorProfile({
      ...activeVendor,
      phone: editPhone,
      email: editEmail,
      address: editAddress,
      iban: editIban,
      emergencyAvailable: editEmergency,
    });
    setIsEditingProfile(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Professional Contractor Brand Banner */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between py-3.5 gap-3">
            {/* Left: Brand Identity & Active Vendor */}
            <div className="flex items-center space-x-3 w-full md:w-auto">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-600 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-amber-900/40 shrink-0 ring-2 ring-amber-400/20">
                <HardHat className="w-6 h-6" />
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-base sm:text-lg text-white tracking-tight">
                    {activeVendor.companyName}
                  </span>
                  <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                    <BadgeCheck className="w-3 h-3 text-emerald-400" />
                    <span>Onaylı Usta / Firma</span>
                  </span>
                </div>
                <div className="text-xs text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                  <span className="text-amber-400 font-semibold flex items-center space-x-1">
                    <User className="w-3 h-3 inline" />
                    <span>{activeVendor.authorizedPerson}</span>
                  </span>
                  <span>•</span>
                  <span className="text-slate-300">
                    {TRADE_CATEGORY_LABELS[activeVendor.category]?.label || 'Teknik Servis'}
                  </span>
                  <span>•</span>
                  <span className="text-amber-300 font-medium flex items-center space-x-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline" />
                    <span>{activeVendor.rating.toFixed(1)}</span>
                    <span className="text-slate-400">({activeVendor.completedJobsCount} İş)</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Vendor Switcher & Role Navigation */}
            <div className="flex items-center space-x-2 sm:space-x-3 w-full md:w-auto justify-between md:justify-end">
              {/* Vendor Selector Dropdown */}
              <div className="relative">
                <select
                  value={activeVendor.id}
                  onChange={(e) => {
                    const picked = vendors.find((v) => v.id === e.target.value);
                    if (picked) onSelectVendor(picked);
                  }}
                  className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 pr-7 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none appearance-none cursor-pointer"
                  title="Firma & Usta Hesabını Değiştir"
                >
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      🔧 {v.companyName} ({v.authorizedPerson})
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">
                  ▼
                </div>
              </div>

              {/* Quick Switch to Site Management */}
              <button
                onClick={() => onSwitchRole('manager')}
                className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm shadow-indigo-900/50"
                title="Site Yönetici Paneline Dön"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Site Yönetimi</span>
              </button>

              {/* Quick Switch to Resident */}
              <button
                onClick={() => onSwitchRole('resident')}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold transition-all flex items-center space-x-1.5"
                title="Sakin Görünümüne Geç"
              >
                <Home className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Sakin Görünümü</span>
              </button>
            </div>
          </div>

          {/* Portal Sub-Navigation Tabs */}
          <nav className="flex space-x-2 border-t border-slate-800/80 pt-2 pb-2 overflow-x-auto text-xs font-semibold">
            <button
              onClick={() => setActivePortalTab('tenders')}
              className={`px-3 py-2 rounded-xl flex items-center space-x-2 transition-all shrink-0 ${
                activePortalTab === 'tenders'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Açık İhaleler & İş Fırsatları</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activePortalTab === 'tenders'
                    ? 'bg-slate-950/20 text-slate-950'
                    : 'bg-slate-800 text-amber-400'
                }`}
              >
                {quoteRequests.filter((r) => r.status === 'open' || r.status === 'reviewing').length}
              </span>
            </button>

            <button
              onClick={() => setActivePortalTab('my-bids')}
              className={`px-3 py-2 rounded-xl flex items-center space-x-2 transition-all shrink-0 ${
                activePortalTab === 'my-bids'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>Verdiğim Teklifler</span>
              {vendorQuotes.length > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    activePortalTab === 'my-bids'
                      ? 'bg-slate-950/20 text-slate-950'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {vendorQuotes.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActivePortalTab('active-jobs')}
              className={`px-3 py-2 rounded-xl flex items-center space-x-2 transition-all shrink-0 ${
                activePortalTab === 'active-jobs'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <PackageCheck className="w-4 h-4" />
              <span>Kazanılan İhaleler & Devam Eden İşler</span>
              {awardedJobs.length > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    activePortalTab === 'active-jobs'
                      ? 'bg-slate-950/20 text-slate-950'
                      : 'bg-emerald-500/20 text-emerald-400 animate-pulse'
                  }`}
                >
                  {awardedJobs.length} Aktif
                </span>
              )}
            </button>

            <button
              onClick={() => setActivePortalTab('service-tickets')}
              className={`px-3 py-2 rounded-xl flex items-center space-x-2 transition-all shrink-0 ${
                activePortalTab === 'service-tickets'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>Teknik Servis & Arıza Talepleri</span>
              {assignedTickets.length > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    activePortalTab === 'service-tickets'
                      ? 'bg-slate-950/20 text-slate-950'
                      : 'bg-sky-500/20 text-sky-400'
                  }`}
                >
                  {assignedTickets.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActivePortalTab('finances')}
              className={`px-3 py-2 rounded-xl flex items-center space-x-2 transition-all shrink-0 ${
                activePortalTab === 'finances'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>💰 Hakediş & Komisyon Masası</span>
              {(activeVendor.commissionFees || []).filter((f) => f.status === 'pending').length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-amber-400 text-slate-950">
                  {(activeVendor.commissionFees || []).filter((f) => f.status === 'pending').length} Bekleyen
                </span>
              )}
            </button>

            <button
              onClick={() => setActivePortalTab('profile')}
              className={`px-3 py-2 rounded-xl flex items-center space-x-2 transition-all shrink-0 ${
                activePortalTab === 'profile'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Firma Profili & Belgeler</span>
            </button>
          </nav>
        </div>
      </header>

      {/* SUPER ADMIN SUSPENSION WARNING BANNER */}
      {activeVendor.status === 'suspended' && (
        <div className="bg-rose-950 border-b border-rose-800 text-rose-200 px-4 py-3">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start sm:items-center space-x-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <strong className="text-white block font-bold">
                  Hesabınız Süper Admin Tarafından Geçici Olarak Kapatılmıştır / Askıya Alınmıştır
                </strong>
                <span className="text-[11px] text-rose-300">
                  Gerekçe: "{activeVendor.suspendedReason || 'Sistem incelemesi ve denetim gereği'}"
                  {activeVendor.suspendedDate && ` • İşlem Tarihi: ${formatDate(activeVendor.suspendedDate)}`}.
                  Yeni ihalelere teklif veremezsiniz.
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-rose-900 border border-rose-700 text-white rounded-lg text-[10px] font-bold shrink-0">
              Hizmete Kapalı (Askıda)
            </span>
          </div>
        </div>
      )}

      {/* Main Container Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI Summary Cards for Contractor */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Açık İhaleler
              </span>
              <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <Briefcase className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-2 text-2xl font-black text-white">
              {availableTenders.length}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Bölgenizdeki güncel site talepleri
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Verilen Tekliflerim
              </span>
              <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                <FileCheck className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-2 text-2xl font-black text-white">
              {vendorQuotes.length}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {vendorQuotes.filter((v) => v.quote.status === 'pending').length} tanesi incelemede
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Kazanılan / Aktif İşler
              </span>
              <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Award className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-2 text-2xl font-black text-emerald-400">
              {awardedJobs.length}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Sözleşmesi onaylanan şantiyeler
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Başarı & Memnuniyet
              </span>
              <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              </span>
            </div>
            <div className="mt-2 text-2xl font-black text-white flex items-center space-x-1">
              <span>{activeVendor.rating.toFixed(1)}</span>
              <span className="text-xs text-slate-500 font-normal">/ 5.0</span>
            </div>
            <p className="text-[11px] text-emerald-400 mt-1">
              %98 zamanında teslimat oranı
            </p>
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* TAB 1: AÇIK İHALELER & İŞ FIRSATLARI */}
        {/* ------------------------------------------------------------------ */}
        {activePortalTab === 'tenders' && (
          <div className="space-y-4">
            {/* Search & Filter Header */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="İhale başlığı veya arıza ara..."
                  value={tenderSearchQuery}
                  onChange={(e) => setTenderSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <button
                  onClick={() => setOnlyMyCategory(!onlyMyCategory)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center space-x-1.5 ${
                    onlyMyCategory
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Sadece Branşım ({TRADE_CATEGORY_LABELS[activeVendor.category]?.label})</span>
                </button>

                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    if (e.target.value !== 'all') setOnlyMyCategory(false);
                  }}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                >
                  <option value="all">Tüm Kategoriler</option>
                  {Object.entries(TRADE_CATEGORY_LABELS).map(([catKey, val]) => (
                    <option key={catKey} value={catKey}>
                      {val.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tenders Grid */}
            {availableTenders.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
                <Briefcase className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-white">
                  Şu Anda Açık İhale Bulunmuyor
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Filtreleri sıfırlayabilir veya diğer kategorilerdeki site ihalelerini inceleyebilirsiniz.
                </p>
                <button
                  onClick={() => {
                    setOnlyMyCategory(false);
                    setCategoryFilter('all');
                    setTenderSearchQuery('');
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
                >
                  Tüm Kategorileri Göster
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableTenders.map((tender) => {
                  const isMyCategory = tender.category === activeVendor.category;
                  const myExistingQuote = tender.quotes.find(
                    (q) => q.vendorId === activeVendor.id
                  );
                  const isAwardedToMe =
                    tender.status === 'awarded' &&
                    tender.awardedVendorId === activeVendor.id;

                  return (
                    <div
                      key={tender.id}
                      className={`bg-slate-900 rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                        isAwardedToMe
                          ? 'border-emerald-500/50 shadow-lg shadow-emerald-950/30'
                          : isMyCategory
                          ? 'border-amber-500/30 hover:border-amber-500/60'
                          : 'border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-3">
                        {/* Card Top Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center space-x-2">
                            <span className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                              {getCategoryIcon(tender.category)}
                            </span>
                            <div>
                              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                                {TRADE_CATEGORY_LABELS[tender.category]?.label}
                              </span>
                              <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
                                <Building2 className="w-3 h-3 text-slate-500 inline" />
                                <span>{tender.siteName}</span>
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-1">
                            {tender.priority === 'urgent' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center space-x-1 animate-pulse">
                                <AlertTriangle className="w-2.5 h-2.5" />
                                <span>Acil İhale</span>
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                              {tender.quotes.length} Teklif Verildi
                            </span>
                          </div>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h4 className="text-sm font-bold text-white line-clamp-2 leading-snug">
                            {tender.title}
                          </h4>
                          <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                            {tender.description}
                          </p>
                        </div>

                        {/* Budget & Deadline specs */}
                        <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-500 block">
                              Tahmini Site Bütçesi
                            </span>
                            <span className="font-bold text-emerald-400">
                              {tender.estimatedBudget
                                ? formatCurrency(tender.estimatedBudget)
                                : 'Belirtilmedi'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block">
                              Son Teklif Tarihi
                            </span>
                            <span className="font-semibold text-slate-300 flex items-center space-x-1">
                              <Calendar className="w-3 h-3 text-slate-500" />
                              <span>{formatDate(tender.deadline)}</span>
                            </span>
                          </div>
                        </div>

                        {/* If current vendor already gave a quote */}
                        {myExistingQuote && (
                          <div className="p-2.5 rounded-xl bg-indigo-950/30 border border-indigo-800/40 text-xs flex items-center justify-between">
                            <div className="space-y-0.5">
                              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block">
                                Verdiğiniz Teklif
                              </span>
                              <span className="font-bold text-white">
                                {formatCurrency(myExistingQuote.amount)} (KDV {myExistingQuote.includesVat ? 'Dahil' : 'Hariç'})
                              </span>
                            </div>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                myExistingQuote.status === 'accepted'
                                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                  : myExistingQuote.status === 'rejected'
                                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                                  : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                              }`}
                            >
                              {myExistingQuote.status === 'accepted'
                                ? '✓ Kabul Edildi'
                                : myExistingQuote.status === 'rejected'
                                ? '✕ Başkası Seçildi'
                                : '⏳ İnceleniyor'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <div className="pt-4 mt-3 border-t border-slate-800/80 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500">
                          Yayınlanma: {formatDate(tender.createdAt)}
                        </span>

                        <button
                          onClick={() => handleOpenQuoteModal(tender)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-md ${
                            myExistingQuote
                              ? 'bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30'
                              : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20'
                          }`}
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{myExistingQuote ? 'Teklifi Güncelle' : 'Teklif Ver'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 2: VERDİĞİM TEKLİFLER */}
        {/* ------------------------------------------------------------------ */}
        {activePortalTab === 'my-bids' && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Verdiğim Teklifler & İhale Durumu
                </h3>
                <p className="text-xs text-slate-400">
                  {activeVendor.companyName} adına sitelere sunduğunuz tüm tekliflerin güncel sonuçları
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-800 text-amber-400 text-xs font-bold border border-slate-700">
                {vendorQuotes.length} Toplam Teklif
              </span>
            </div>

            {vendorQuotes.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
                <FileCheck className="w-12 h-12 text-slate-600 mx-auto" />
                <h4 className="text-base font-bold text-white">
                  Henüz Teklif Vermediniz
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Açık İhaleler sekmesinden sitelerin arıza ve bakım işlerine teklif hazırlayıp gönderebilirsiniz.
                </p>
                <button
                  onClick={() => setActivePortalTab('tenders')}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs"
                >
                  Açık İhaleleri Gör →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {vendorQuotes.map(({ request, quote }) => {
                  const isAccepted =
                    quote.status === 'accepted' || request.awardedQuoteId === quote.id;
                  const isRejected = quote.status === 'rejected';

                  return (
                    <div
                      key={quote.id}
                      className={`bg-slate-900 border rounded-2xl p-4 sm:p-5 transition-all ${
                        isAccepted
                          ? 'border-emerald-500/40 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/20'
                          : isRejected
                          ? 'border-slate-800 opacity-75'
                          : 'border-slate-800'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                              {request.siteName}
                            </span>
                            <span>•</span>
                            <span className="text-xs text-slate-400">
                              {TRADE_CATEGORY_LABELS[request.category]?.label}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-white mt-0.5">
                            {request.title}
                          </h4>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-xs font-bold px-3 py-1 rounded-full border ${
                              isAccepted
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                : isRejected
                                ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                                : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                            }`}
                          >
                            {isAccepted
                              ? '🏆 İhale Kazanıldı & Onaylandı'
                              : isRejected
                              ? '✕ Başka Teklif Seçildi'
                              : '⏳ Yönetim İncelemesinde'}
                          </span>
                        </div>
                      </div>

                      {/* Quote detail cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Teklif Tutarınız</span>
                          <span className="font-extrabold text-white text-sm">
                            {formatCurrency(quote.amount)}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            {quote.includesVat ? 'KDV Dahil' : 'KDV Hariç'}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-500 block">İş Teslim Süresi</span>
                          <span className="font-semibold text-slate-200">
                            {quote.deliveryDays} İş Günü
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-500 block">Garanti Taahhüdü</span>
                          <span className="font-semibold text-slate-200">
                            {quote.warrantyMonths} Ay Yerinde Garanti
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-500 block">Teklif Tarihi</span>
                          <span className="font-semibold text-slate-400">
                            {formatDate(quote.submittedDate)}
                          </span>
                        </div>
                      </div>

                      {/* Notes / Material */}
                      <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 text-xs space-y-1">
                        <div className="flex items-center space-x-1.5 text-slate-400 font-medium">
                          <PackageCheck className="w-3.5 h-3.5 text-amber-400" />
                          <span>Kullanılacak Malzeme: {quote.materialQuality}</span>
                        </div>
                        <p className="text-slate-300 text-[11px] italic">
                          "{quote.notes}"
                        </p>
                      </div>

                      {isAccepted && (
                        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
                          <span className="text-xs text-emerald-400 font-semibold flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Site Yönetimi bu teklifi kabul etti. İşi Devam Eden İşler sekmesinden yönetebilirsiniz.</span>
                          </span>

                          <button
                            onClick={() => setActivePortalTab('active-jobs')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors"
                          >
                            İş Emrine Git →
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 3: KAZANILAN İHALELER & DEVAM EDEN İŞLER */}
        {/* ------------------------------------------------------------------ */}
        {activePortalTab === 'active-jobs' && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Kazanılan İhaleler & Aktif Şantiye İş Emirleri
                </h3>
                <p className="text-xs text-slate-400">
                  Site yönetiminin onayladığı, devam eden montaj, revizyon ve hakediş işlemleri
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                {awardedJobs.length} Aktif Sözleşme
              </span>
            </div>

            {awardedJobs.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
                <PackageCheck className="w-12 h-12 text-slate-600 mx-auto" />
                <h4 className="text-base font-bold text-white">
                  Aktif Devam Eden Sözleşmeniz Bulunmuyor
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Site yönetimleri teklifinizi onayladığında, iş emri ve şantiye detayları otomatik olarak burada listelenir.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {awardedJobs.map((job) => {
                  const acceptedQuote = job.quotes.find(
                    (q) => q.vendorId === activeVendor.id && q.status === 'accepted'
                  ) || job.quotes.find((q) => q.vendorId === activeVendor.id);

                  const progress = job.workProgressStatus || 'material_prep';

                  return (
                    <div
                      key={job.id}
                      className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-5 shadow-lg shadow-emerald-950/20 space-y-4"
                    >
                      {/* Top Bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                              ✓ Sözleşme Aktif
                            </span>
                            <span className="text-xs font-bold text-white">
                              {job.siteName}
                            </span>
                            <span className="text-xs text-slate-500">•</span>
                            <span className="text-xs text-slate-400">
                              {TRADE_CATEGORY_LABELS[job.category]?.label}
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-white mt-1">
                            {job.title}
                          </h4>
                        </div>

                        <div className="text-left sm:text-right">
                          <span className="text-[10px] text-slate-400 block">Sözleşme Bedeli</span>
                          <span className="text-base font-black text-emerald-400">
                            {formatCurrency(job.awardedAmount || acceptedQuote?.amount || 0)}
                          </span>
                        </div>
                      </div>

                      {/* Site Contact Card */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-500 uppercase font-bold block">
                            Site Yöneticisi & İletişim
                          </span>
                          <span className="font-bold text-white block">
                            {currentSite.profile.managementBoard[0] || 'Site Yöneticisi'}
                          </span>
                          <span className="text-slate-400 text-[11px] flex items-center space-x-1">
                            <Phone className="w-3 h-3 text-emerald-400 inline" />
                            <span>{currentSite.profile.emergencyPhone || '0533 111 22 33'}</span>
                          </span>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-500 uppercase font-bold block">
                            Şantiye / Bina Adresi
                          </span>
                          <span className="text-slate-300 font-medium line-clamp-2">
                            {currentSite.profile.address}, {currentSite.profile.city}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-500 uppercase font-bold block">
                            Taahhüt Edilen Süre
                          </span>
                          <span className="font-semibold text-amber-400">
                            {acceptedQuote?.deliveryDays || 3} İş Gününde Teslim
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            {acceptedQuote?.warrantyMonths || 24} Ay Garanti
                          </span>
                        </div>
                      </div>

                      {/* Progress Stages Tracker */}
                      <div className="space-y-2 pt-1">
                        <span className="text-xs font-bold text-slate-300">
                          İş İlerleme Durumu:
                        </span>
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { id: 'material_prep', label: '1. Malzeme Tedariği' },
                            { id: 'on_site_work', label: '2. Sahada Montaj & Tamir' },
                            { id: 'testing', label: '3. Test & Kalibrasyon' },
                            { id: 'completed', label: '4. İşi Teslim Et' },
                          ].map((step, idx) => {
                            const isCurrent = progress === step.id;
                            const isDone =
                              (step.id === 'material_prep' && progress !== 'material_prep') ||
                              (step.id === 'on_site_work' &&
                                (progress === 'testing' || progress === 'completed')) ||
                              (step.id === 'testing' && progress === 'completed');

                            return (
                              <button
                                key={step.id}
                                onClick={() =>
                                  step.id === 'completed'
                                    ? handleOpenCompleteModal(job)
                                    : onUpdateJobProgress(
                                        job.id,
                                        step.id as 'material_prep' | 'on_site_work' | 'testing'
                                      )
                                }
                                className={`p-2.5 rounded-xl text-center text-xs font-semibold border transition-all ${
                                  isCurrent
                                    ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-md shadow-amber-500/20'
                                    : isDone
                                    ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800'
                                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                                }`}
                              >
                                {step.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-xs text-slate-400">
                          {job.managerNotes
                            ? `Yönetici Notu: ${job.managerNotes}`
                            : 'Yönetici onayladı. İşe başlayabilirsiniz.'}
                        </span>

                        <button
                          onClick={() => handleOpenCompleteModal(job)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center space-x-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>İşi Tamamla & Hakediş Bildir</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 4: TEKNİK SERVİS & ARIZA İŞ EMİRLERİ */}
        {/* ------------------------------------------------------------------ */}
        {activePortalTab === 'service-tickets' && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Doğrudan Atanan Arıza & Teknik Servis Talepleri
                </h3>
                <p className="text-xs text-slate-400">
                  Site sakinleri veya yönetim tarafından branşınıza ({TRADE_CATEGORY_LABELS[activeVendor.category]?.label}) yönlendirilen arıza kayıtları
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 text-xs font-bold border border-sky-500/30">
                {assignedTickets.length} Talep
              </span>
            </div>

            {assignedTickets.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
                <Wrench className="w-12 h-12 text-slate-600 mx-auto" />
                <h4 className="text-base font-bold text-white">
                  Şu Anda Atanmış Açık Arıza Bulunmuyor
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Site yönetimi acil daire içi sızıntı, elektrik veya asansör arızası kaydettiğinde bildirim alacaksınız.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assignedTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 space-y-3 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-sky-400 font-bold uppercase tracking-wider block">
                          {ticket.location} • {ticket.unitDisplay}
                        </span>
                        <h4 className="text-sm font-bold text-white mt-0.5">
                          {ticket.title}
                        </h4>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          ticket.status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : ticket.status === 'in_progress'
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {ticket.status === 'completed'
                          ? 'Çözüldü'
                          : ticket.status === 'in_progress'
                          ? 'Müdahale Ediliyor'
                          : 'İnceleniyor'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {ticket.description}
                    </p>

                    <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between text-slate-300">
                        <span>Bildiren Sakin:</span>
                        <span className="font-semibold text-white">{ticket.residentName}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400 text-[11px]">
                        <span>Tarih:</span>
                        <span>{formatDate(ticket.createdAt)}</span>
                      </div>
                      {ticket.adminNotes && (
                        <div className="text-[11px] text-amber-300/90 pt-1 border-t border-slate-800">
                          Not: {ticket.adminNotes}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">
                        Öncelik: <span className="text-slate-300 font-semibold uppercase">{ticket.priority}</span>
                      </span>

                      <button
                        onClick={() => {
                          setSelectedTicketForUpdate(ticket);
                          setTicketNewStatus(ticket.status === 'completed' ? 'completed' : 'in_progress');
                          setTicketActionNotes(ticket.adminNotes || '');
                        }}
                        className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
                      >
                        Durum Güncelle →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 4.5: HAKEDİŞ & PLATFORM KOMİSYON / ÜCRET MASASI */}
        {/* ------------------------------------------------------------------ */}
        {activePortalTab === 'finances' && (
          <div className="space-y-6">
            {/* Header info */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      Firma Hakediş, Komisyon & Yıllık Ücret Takip Masası
                    </h3>
                    <p className="text-xs text-slate-400">
                      Tamamlanan site işlerinden platforma kesilen komisyonları ve yıllık üyelik bedellerini şeffaf olarak inceleyin.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400 font-medium">Uygulanan Model:</span>
                <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-bold">
                  {activeVendor.billingModel === 'annual_subscription'
                    ? `📅 Yıllık Sabit Lisans (${formatCurrency(activeVendor.annualSubscriptionFee || 4800)}/Yıl)`
                    : activeVendor.billingModel === 'hybrid'
                    ? `⚡ Hibrit (%${activeVendor.commissionRate || 5} + ${formatCurrency(activeVendor.annualSubscriptionFee || 4800)}/Yıl)`
                    : `💼 İş Başı %${activeVendor.commissionRate || 5} Komisyon Modeli`}
                </span>
              </div>
            </div>

            {/* Financial Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Tamamlanan İş Hacmi
                </span>
                <div className="text-2xl font-black text-white mt-2 font-mono">
                  {activeVendor.completedJobsCount} <span className="text-xs font-normal text-slate-400">Şantiye</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Platform üzerinden teslim edilen</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Ödenen Komisyon Bedeli
                </span>
                <div className="text-2xl font-black text-emerald-400 mt-2 font-mono">
                  {formatCurrency(
                    (activeVendor.commissionFees || [])
                      .filter((f) => f.status === 'paid')
                      .reduce((s, f) => s + f.feeAmount, 0)
                  )}
                </div>
                <p className="text-[11px] text-emerald-500/80 mt-1">Süper Admin'e tahsilatı tamamlanan</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Bekleyen Komisyon / Ücret
                </span>
                <div className="text-2xl font-black text-amber-400 mt-2 font-mono">
                  {formatCurrency(
                    (activeVendor.commissionFees || [])
                      .filter((f) => f.status === 'pending' || f.status === 'overdue')
                      .reduce((s, f) => s + f.feeAmount, 0)
                  )}
                </div>
                <p className="text-[11px] text-amber-500/80 mt-1">Vadesi yaklaşan / bekleyen borç</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Komisyon Kesinti Oranınız
                </span>
                <div className="text-2xl font-black text-indigo-400 mt-2 font-mono">
                  %{activeVendor.commissionRate || 5}
                </div>
                <p className="text-[11px] text-indigo-400/80 mt-1">Kazanılan iş tutarı üzerinden hesaplanır</p>
              </div>
            </div>

            {/* Invoices List */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xs">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white">
                    Platform Komisyon ve Hizmet Bedeli Tahakkuk Listesi
                  </h4>
                  <p className="text-xs text-slate-400">
                    ApsisCloud Süper Admin tarafından kesilen resmi komisyon faturaları ve tahsilat durumu
                  </p>
                </div>
              </div>

              {(!activeVendor.commissionFees || activeVendor.commissionFees.length === 0) ? (
                <div className="p-10 text-center text-slate-500 text-xs">
                  Henüz tahakkuk etmiş bir komisyon veya üyelik faturası bulunmamaktadır.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-bold">
                        <th className="py-3 px-4">Fatura No</th>
                        <th className="py-3 px-4">Hizmet / Şantiye Bilgisi</th>
                        <th className="py-3 px-4">Ücret Türü</th>
                        <th className="py-3 px-4 text-right">İş Tutarı</th>
                        <th className="py-3 px-4 text-center">Komisyon Oranı</th>
                        <th className="py-3 px-4 text-right">Kesilen Komisyon</th>
                        <th className="py-3 px-4">Vade Tarihi</th>
                        <th className="py-3 px-4 text-center">Durum</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {activeVendor.commissionFees.map((fee) => (
                        <tr key={fee.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-amber-400">
                            {fee.invoiceNo || 'KOM-2026'}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-white">{fee.jobTitle}</div>
                            {fee.siteName && (
                              <div className="text-[10px] text-slate-400">🏢 {fee.siteName}</div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {fee.feeType === 'job_commission' ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                                İş Komisyonu
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-bold border border-indigo-500/30">
                                Yıllık Üyelik
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-slate-400">
                            {fee.jobAmount ? formatCurrency(fee.jobAmount) : '-'}
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-emerald-400 font-mono">
                            {fee.commissionRate ? `%${fee.commissionRate}` : '-'}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-black text-white">
                            {formatCurrency(fee.feeAmount)}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                            {formatDate(fee.dueDate)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                fee.status === 'paid'
                                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                  : fee.status === 'overdue'
                                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                                  : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                              }`}
                            >
                              {fee.status === 'paid'
                                ? '✓ Ödendi'
                                : fee.status === 'overdue'
                                ? '⚠️ Vadesi Geçti'
                                : '⏳ Ödeme Bekliyor'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Info notice box */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-start space-x-3 text-xs text-slate-400">
              <HelpCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <strong className="text-white block font-semibold">Komisyon ve Ücretlendirme İlkeleri</strong>
                <p>
                  ApsisCloud platformunda site yönetimleri tarafından kabul edilen ve tamamlanan her servis/onarım işi için sözleşmenizdeki komisyon oranı (%5) yansıtılır. Yıllık abonelik modelindeki firmalar ise sabit listeleme bedeli öder. Sorularınız için Süper Admin destek hattı ile iletişime geçebilirsiniz.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 5: FİRMA PROFİLİ & YETKİ BELGELERİ */}
        {/* ------------------------------------------------------------------ */}
        {activePortalTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Details & Edit */}
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">
                        {activeVendor.companyName}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {TRADE_CATEGORY_LABELS[activeVendor.category]?.label} Yetkili Taşeronu
                      </p>
                    </div>
                  </div>

                  {!isEditingProfile ? (
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700"
                    >
                      Bilgileri Düzenle
                    </button>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setIsEditingProfile(false)}
                        className="px-3 py-1.5 bg-slate-800 text-slate-400 rounded-xl text-xs"
                      >
                        İptal
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
                      >
                        Kaydet
                      </button>
                    </div>
                  )}
                </div>

                {/* Form fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                  <div>
                    <label className="text-slate-400 block mb-1">Yetkili Usta / Mühendis</label>
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-white font-medium">
                      {activeVendor.authorizedPerson}
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">İletişim Telefonu</label>
                    {isEditingProfile ? (
                      <input
                        type="text"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full bg-slate-950 p-2.5 rounded-xl border border-slate-700 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    ) : (
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-white font-medium">
                        {activeVendor.phone}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Resmi E-Posta</label>
                    {isEditingProfile ? (
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="w-full bg-slate-950 p-2.5 rounded-xl border border-slate-700 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    ) : (
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-white font-medium">
                        {activeVendor.email}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Hakediş Ödemesi Banka IBAN</label>
                    {isEditingProfile ? (
                      <input
                        type="text"
                        value={editIban}
                        onChange={(e) => setEditIban(e.target.value)}
                        className="w-full bg-slate-950 p-2.5 rounded-xl border border-slate-700 text-white font-mono text-[11px] focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    ) : (
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-white font-mono text-[11px]">
                        {activeVendor.iban || 'TR62 0001 5001 9283 7465 1928 33'}
                      </div>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-slate-400 block mb-1">Atölye & Ofis Adresi</label>
                    {isEditingProfile ? (
                      <input
                        type="text"
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        className="w-full bg-slate-950 p-2.5 rounded-xl border border-slate-700 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    ) : (
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-white">
                        {activeVendor.address}
                      </div>
                    )}
                  </div>
                </div>

                {/* 7/24 Emergency Toggle */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white block">
                      7/24 Acil Müdahale & Nöbetçi Usta Servisi
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Aktif olduğunda siteler gece acil su baskını veya asansör arızasında sizi arayabilir.
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      if (isEditingProfile) {
                        setEditEmergency(!editEmergency);
                      } else {
                        onUpdateVendorProfile({
                          ...activeVendor,
                          emergencyAvailable: !activeVendor.emergencyAvailable,
                        });
                      }
                    }}
                    className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                      (isEditingProfile ? editEmergency : activeVendor.emergencyAvailable)
                        ? 'bg-emerald-500'
                        : 'bg-slate-800'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        (isEditingProfile ? editEmergency : activeVendor.emergencyAvailable)
                          ? 'translate-x-6'
                          : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Service Areas */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span>Yetkili Hizmet Bölgeleri (İlçeler)</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Bu ilçelerdeki siteler ihale açtığında size öncelikli teklif daveti gönderilir:
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {activeVendor.districts.map((district) => (
                    <span
                      key={district}
                      className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-slate-300"
                    >
                      📍 {district}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right 1 Col: Credentials & Verification */}
            <div className="space-y-5">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center space-x-2">
                  <BadgeCheck className="w-5 h-5 text-emerald-400" />
                  <h4 className="text-sm font-bold text-white">
                    Resmi Doğrulama & Yetki Belgeleri
                  </h4>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">
                      Mesleki Yeterlilik / TSE No
                    </span>
                    <span className="font-semibold text-emerald-400 block">
                      {activeVendor.certNumber || 'MYK Seviye 4 Tescilli'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      ✓ Bakanlık ve Meslek Odası Onaylı
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">
                      Vergi Dairesi & No
                    </span>
                    <span className="font-semibold text-slate-200 block">
                      {activeVendor.taxOffice} - {activeVendor.taxNumber}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      ✓ Faal Mükellef & E-Fatura Uyumlu
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">
                      Kayıt Tarihi
                    </span>
                    <span className="font-semibold text-slate-300">
                      {formatDate(activeVendor.registeredDate)}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                  <span className="font-bold block mb-0.5">ApsisCloud Tedarikçi Güvencesi</span>
                  Tüm teklifleriniz ve hakediş faturalarınız 634 sayılı KMK mevzuatına uygun olarak resmi arşivde saklanır.
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ------------------------------------------------------------------ */}
      {/* MODAL: TEKLİF HAZIRLA & GÖNDER */}
      {/* ------------------------------------------------------------------ */}
      {selectedTenderForQuote && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 text-slate-100 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Teklif Hazırla & Gönder
                  </h3>
                  <p className="text-xs text-slate-400">
                    {selectedTenderForQuote.siteName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTenderForQuote(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitQuoteForm} className="space-y-4 text-xs">
              {/* Tender summary */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                  İhale Başlığı
                </span>
                <span className="font-bold text-white text-xs block">
                  {selectedTenderForQuote.title}
                </span>
                <span className="text-[11px] text-slate-400 block line-clamp-2">
                  {selectedTenderForQuote.description}
                </span>
              </div>

              {/* Amount & VAT */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Teklif Bedeli (₺) *
                  </label>
                  <input
                    type="number"
                    required
                    min={100}
                    step={100}
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder="Örn. 28500"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    KDV Durumu
                  </label>
                  <button
                    type="button"
                    onClick={() => setBidIncludesVat(!bidIncludesVat)}
                    className={`w-full py-2.5 rounded-xl font-bold border transition-colors ${
                      bidIncludesVat
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    {bidIncludesVat ? '✓ KDV Dahil' : '+ %20 KDV Hariç'}
                  </button>
                </div>
              </div>

              {/* Days & Warranty */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    İş Teslim Süresi (İş Günü) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={60}
                    value={bidDeliveryDays}
                    onChange={(e) => setBidDeliveryDays(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Garanti Süresi (Ay) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    max={120}
                    value={bidWarrantyMonths}
                    onChange={(e) => setBidWarrantyMonths(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Material Quality */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Kullanılacak Parça & Malzeme Standardı *
                </label>
                <input
                  type="text"
                  required
                  value={bidMaterialQuality}
                  onChange={(e) => setBidMaterialQuality(e.target.value)}
                  placeholder="Örn: Wilo 16 Bar EPDM Membran + Pirinç Çekvalf"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Teklif Açıklaması & Şartname Notları
                </label>
                <textarea
                  rows={3}
                  value={bidNotes}
                  onChange={(e) => setBidNotes(e.target.value)}
                  placeholder="İşçilik, demontaj, nakliye ve servis kapsamını belirtiniz..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setSelectedTenderForQuote(null)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-500/20"
                >
                  Teklifi Siteye İlet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MODAL: İŞİ TAMAMLA & HAKEDİŞ BİLDİR */}
      {/* ------------------------------------------------------------------ */}
      {completingTender && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 text-slate-100 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    İş Tamamlama & Hakediş Raporu
                  </h3>
                  <p className="text-xs text-slate-400">
                    {completingTender.siteName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCompletingTender(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCompleteJobSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                  Tamamlanan İş
                </span>
                <span className="font-bold text-white text-xs block">
                  {completingTender.title}
                </span>
                <span className="text-emerald-400 font-extrabold text-sm block">
                  Hakediş Tutarı: {formatCurrency(completingTender.awardedAmount || 0)}
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Düzenlenen Servis / İrsaliyeli Fatura No *
                </label>
                <input
                  type="text"
                  required
                  value={completionInvoiceNo}
                  onChange={(e) => setCompletionInvoiceNo(e.target.value)}
                  placeholder="Örn: FAT-2026-00492"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Teknik Servis Müdahale & Teslim Notu *
                </label>
                <textarea
                  rows={4}
                  required
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-emerald-300 text-xs">
                ✓ Onaylandığında site yönetiminin gider faturası masasına hakediş kaydı otomatik eklenecek ve iş başarıyla kapatılacaktır.
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setCompletingTender(null)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-lg shadow-emerald-900/30"
                >
                  İşi Tamamla & Raporu Onayla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* MODAL: ARIZA İŞ EMRİ DURUM GÜNCELLE */}
      {/* ------------------------------------------------------------------ */}
      {selectedTicketForUpdate && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-slate-100 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Wrench className="w-5 h-5 text-sky-400" />
                <h3 className="text-base font-bold text-white">
                  Teknik Servis Durumu Güncelle
                </h3>
              </div>
              <button
                onClick={() => setSelectedTicketForUpdate(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTicketStatusSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-0.5">
                <span className="font-bold text-white text-xs block">
                  {selectedTicketForUpdate.title}
                </span>
                <span className="text-[11px] text-slate-400 block">
                  {selectedTicketForUpdate.location} • {selectedTicketForUpdate.residentName}
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Yeni Durum
                </label>
                <select
                  value={ticketNewStatus}
                  onChange={(e) =>
                    setTicketNewStatus(e.target.value as MaintenanceTicket['status'])
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  <option value="in_progress">Müdahale Ediliyor / Sahada</option>
                  <option value="completed">Tamamlandı & Çözüldü</option>
                  <option value="in_review">İnceleniyor / Parça Bekleniyor</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Teknisyen / Usta Notu
                </label>
                <textarea
                  rows={3}
                  value={ticketActionNotes}
                  onChange={(e) => setTicketActionNotes(e.target.value)}
                  placeholder="Örn: Vana contası yenilendi, testler yapıldı sızıntı kesildi."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setSelectedTicketForUpdate(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl"
                >
                  Durumu Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
