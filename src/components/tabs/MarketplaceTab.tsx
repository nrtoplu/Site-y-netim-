/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Briefcase,
  Building2,
  CheckCircle2,
  Clock,
  Filter,
  PlusCircle,
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
  Check,
  X,
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
  MessageSquare,
} from 'lucide-react';
import {
  ServiceQuoteRequest,
  VendorCompany,
  VendorQuote,
  VendorTradeCategory,
  TenantSite,
  VendorReview,
} from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { TRADE_CATEGORY_LABELS, INITIAL_VENDORS } from '../../data/vendorData';

interface MarketplaceTabProps {
  currentSite: TenantSite;
  vendors: VendorCompany[];
  quoteRequests: ServiceQuoteRequest[];
  onApproveQuote: (
    request: ServiceQuoteRequest,
    quote: VendorQuote,
    vendor: VendorCompany
  ) => void;
  onCreateQuoteRequest: (newRequest: ServiceQuoteRequest) => void;
  onRegisterVendor: (newVendor: VendorCompany) => void;
  onOpenVendorPortal?: () => void;
  onAddVendorReview?: (vendorId: string, review: VendorReview) => void;
}

export const MarketplaceTab: React.FC<MarketplaceTabProps> = ({
  currentSite,
  vendors,
  quoteRequests,
  onApproveQuote,
  onCreateQuoteRequest,
  onRegisterVendor,
  onOpenVendorPortal,
  onAddVendorReview,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'rfqs' | 'vendors'>('rfqs');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showNewRfqModal, setShowNewRfqModal] = useState(false);
  const [showVendorRegisterModal, setShowVendorRegisterModal] = useState(false);
  const [evaluatingVendor, setEvaluatingVendor] = useState<VendorCompany | null>(null);
  const [viewingReviewsVendor, setViewingReviewsVendor] = useState<VendorCompany | null>(null);
  const [confirmApproveQuote, setConfirmApproveQuote] = useState<{
    request: ServiceQuoteRequest;
    quote: VendorQuote;
    vendor: VendorCompany;
  } | null>(null);

  // Review & Evaluation state
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewJobTitle, setReviewJobTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [criteriaQuality, setCriteriaQuality] = useState<number>(5);
  const [criteriaTiming, setCriteriaTiming] = useState<number>(5);
  const [criteriaPricing, setCriteriaPricing] = useState<number>(5);
  const [criteriaComm, setCriteriaComm] = useState<number>(5);

  // New RFQ Form state
  const [rfqTitle, setRfqTitle] = useState('');
  const [rfqCategory, setRfqCategory] = useState<VendorTradeCategory>('plumbing');
  const [rfqDescription, setRfqDescription] = useState('');
  const [rfqPriority, setRfqPriority] = useState<'urgent' | 'normal' | 'low'>('normal');
  const [rfqBudget, setRfqBudget] = useState('');
  const [rfqDeadline, setRfqDeadline] = useState('2026-10-15');

  // Vendor Register Form state
  const [companyName, setCompanyName] = useState('');
  const [authorizedPerson, setAuthorizedPerson] = useState('');
  const [vendorCategory, setVendorCategory] = useState<VendorTradeCategory>('plumbing');
  const [vendorPhone, setVendorPhone] = useState('');
  const [vendorEmail, setVendorEmail] = useState('');
  const [vendorAddress, setVendorAddress] = useState('');
  const [vendorCity, setVendorCity] = useState(currentSite.profile.city || 'İstanbul');
  const [vendorDistricts, setVendorDistricts] = useState('Kadıköy, Ataşehir, Üsküdar');
  const [vendorTaxNo, setVendorTaxNo] = useState('');
  const [vendorTaxOffice, setVendorTaxOffice] = useState('');
  const [vendorCertNo, setVendorCertNo] = useState('');

  // Calculate statistics
  const totalVendors = vendors.length;
  const activeRfqs = quoteRequests.filter((r) => r.status === 'open' || r.status === 'reviewing').length;
  const awardedRfqs = quoteRequests.filter((r) => r.status === 'awarded').length;
  const totalBids = quoteRequests.reduce((sum, r) => sum + r.quotes.length, 0);

  // Filter RFQs
  const filteredRfqs = quoteRequests.filter((rfq) => {
    if (selectedCategory !== 'all' && rfq.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = rfq.title.toLowerCase().includes(q);
      const matchDesc = rfq.description.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }
    return true;
  });

  // Filter Vendors
  const filteredVendors = vendors.filter((v) => {
    if (selectedCategory !== 'all' && v.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = v.companyName.toLowerCase().includes(q);
      const matchPerson = v.authorizedPerson.toLowerCase().includes(q);
      const matchDistricts = v.districts.some((d) => d.toLowerCase().includes(q));
      if (!matchName && !matchPerson && !matchDistricts) return false;
    }
    return true;
  });

  const getCategoryIcon = (category: VendorTradeCategory) => {
    switch (category) {
      case 'elevator':
        return <ArrowUpDown className="w-4 h-4 text-indigo-600" />;
      case 'plumbing':
        return <Droplets className="w-4 h-4 text-blue-600" />;
      case 'electrical':
        return <Zap className="w-4 h-4 text-amber-600" />;
      case 'painting_facade':
        return <Paintbrush className="w-4 h-4 text-emerald-600" />;
      case 'security_camera':
        return <Shield className="w-4 h-4 text-rose-600" />;
      case 'gardening_landscape':
        return <Trees className="w-4 h-4 text-green-600" />;
      case 'cleaning':
        return <Sparkles className="w-4 h-4 text-teal-600" />;
      case 'roof_insulation':
        return <Home className="w-4 h-4 text-orange-600" />;
      default:
        return <Briefcase className="w-4 h-4 text-slate-600" />;
    }
  };

  const handleCreateRfqSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rfqTitle.trim() || !rfqDescription.trim()) {
      alert('Lütfen iş başlığı ve detaylı açıklama giriniz.');
      return;
    }

    const newRfq: ServiceQuoteRequest = {
      id: `rfq-${Date.now()}`,
      siteId: currentSite.id,
      siteName: currentSite.profile.siteName,
      title: rfqTitle.trim(),
      category: rfqCategory,
      description: rfqDescription.trim(),
      priority: rfqPriority,
      estimatedBudget: rfqBudget ? parseFloat(rfqBudget) : undefined,
      deadline: rfqDeadline,
      status: 'open',
      quotes: [],
      createdAt: new Date().toISOString().split('T')[0],
    };

    onCreateQuoteRequest(newRfq);
    setShowNewRfqModal(false);
    setRfqTitle('');
    setRfqDescription('');
    setRfqBudget('');
  };

  const handleRegisterVendorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !authorizedPerson.trim() || !vendorPhone.trim()) {
      alert('Lütfen firma ünvanı, yetkili kişi ve telefon numarasını giriniz.');
      return;
    }

    const newVendor: VendorCompany = {
      id: `ven-${Date.now()}`,
      companyName: companyName.trim(),
      authorizedPerson: authorizedPerson.trim(),
      category: vendorCategory,
      city: vendorCity.trim() || 'İstanbul',
      districts: vendorDistricts.split(',').map((d) => d.trim()).filter(Boolean),
      phone: vendorPhone.trim(),
      email: vendorEmail.trim() || `${companyName.toLowerCase().replace(/\s+/g, '')}@firma.com`,
      address: vendorAddress.trim() || `${vendorDistricts} / ${vendorCity}`,
      taxNumber: vendorTaxNo.trim() || undefined,
      taxOffice: vendorTaxOffice.trim() || undefined,
      certNumber: vendorCertNo.trim() || 'Mesleki Yeterlilik Belgesi Mevcut',
      rating: 5.0,
      completedJobsCount: 0,
      isVerified: true,
      registeredDate: new Date().toISOString().split('T')[0],
      notes: 'Sistem üzerinden yeni kayıt oldu.',
    };

    onRegisterVendor(newVendor);
    setShowVendorRegisterModal(false);
    setCompanyName('');
    setAuthorizedPerson('');
    setVendorPhone('');
    setVendorEmail('');
    setVendorAddress('');
    setVendorTaxNo('');
    setVendorTaxOffice('');
    setVendorCertNo('');
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evaluatingVendor || !onAddVendorReview) return;

    const newReview: VendorReview = {
      id: `rev-${Date.now()}`,
      vendorId: evaluatingVendor.id,
      siteId: currentSite.id,
      siteName: currentSite.profile.siteName,
      managerName: currentSite.profile.managementBoard[0] || 'Site Yöneticisi',
      rating: reviewRating,
      date: new Date().toISOString().split('T')[0],
      jobTitle: reviewJobTitle.trim() || 'Site Bakım / Onarım İşi',
      comment: reviewComment.trim(),
      criteriaRatings: {
        quality: criteriaQuality,
        timing: criteriaTiming,
        pricing: criteriaPricing,
        communication: criteriaComm,
      },
    };

    onAddVendorReview(evaluatingVendor.id, newReview);
    setEvaluatingVendor(null);
    setReviewJobTitle('');
    setReviewComment('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  Bölgesel Usta & Firma Teklif Masası
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-semibold border border-indigo-200">
                    Hizmet Tedarik Portalı
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  Bölgenizdeki lisanslı asansörcü, tesisatçı, elektrikçi ve tadilat firmalarından siteniz için doğrudan teklif isteyin. Onaylanan teklif hangi firmaya aitse o firmaya otomatik bilgi (SMS/E-posta) ulaşır.
                </p>
              </div>
            </div>
          </div>

          {/* Top Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {onOpenVendorPortal && (
              <button
                onClick={onOpenVendorPortal}
                className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl text-xs transition flex items-center space-x-1.5 shadow-sm shadow-amber-200"
                title="Ustalar ve Firmalar için Ayrı Özel Arayüzü Aç"
              >
                <Briefcase className="w-4 h-4 text-slate-950" />
                <span>🔧 Usta & Firma Arayüzünü Aç →</span>
              </button>
            )}

            <button
              onClick={() => setShowVendorRegisterModal(true)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 border border-slate-200"
            >
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>+ Firma / Usta Olarak Kaydol</span>
            </button>

            <button
              onClick={() => setShowNewRfqModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Yeni Teklif Çağrısı Başlat</span>
            </button>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
            <span className="text-[11px] font-medium text-slate-500 block">Kayıtlı Bölgesel Firmalar</span>
            <span className="text-xl font-bold text-slate-900 mt-0.5 block">{totalVendors} Firma</span>
            <span className="text-[10px] text-emerald-700 font-medium">✓ Doğrulanmış Esnaf & Usta</span>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
            <span className="text-[11px] font-medium text-slate-500 block">Aktif Teklif Çağrıları</span>
            <span className="text-xl font-bold text-indigo-600 mt-0.5 block">{activeRfqs} İhale</span>
            <span className="text-[10px] text-slate-500 font-medium">Teklif toplanıyor</span>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
            <span className="text-[11px] font-medium text-slate-500 block">Gelen Toplam Teklif</span>
            <span className="text-xl font-bold text-slate-900 mt-0.5 block">{totalBids} Teklif</span>
            <span className="text-[10px] text-slate-500 font-medium">İncelemeye hazır</span>
          </div>

          <div className="bg-emerald-50/70 rounded-xl p-3 border border-emerald-200">
            <span className="text-[11px] font-medium text-emerald-800 block">Onaylanan & Başlatılan</span>
            <span className="text-xl font-bold text-emerald-700 mt-0.5 block">{awardedRfqs} İhale</span>
            <span className="text-[10px] text-emerald-800 font-medium">Firmaya bilgi ulaştı</span>
          </div>
        </div>
      </div>

      {/* Main Tab Controls & Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Sub tabs */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveSubTab('rfqs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              activeSubTab === 'rfqs'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Sitemizin Teklif Talepleri ({quoteRequests.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('vendors')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              activeSubTab === 'vendors'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Bölgedeki Kayıtlı Firmalar ({vendors.length})</span>
          </button>
        </div>

        {/* Filter by Category & Search */}
        <div className="flex items-center space-x-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
          >
            <option value="all">Tüm Branşlar / Kategoriler</option>
            {Object.entries(TRADE_CATEGORY_LABELS).map(([key, val]) => (
              <option key={key} value={key}>
                {val.label}
              </option>
            ))}
          </select>

          <div className="relative w-48 sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Firma adı, iş başlığı..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* SUB TAB 1: RFQ LIST & COMPARISON MATRIX */}
      {activeSubTab === 'rfqs' && (
        <div className="space-y-6">
          {filteredRfqs.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700">Henüz Teklif Çağrısı Bulunmuyor</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Sitenizde yapılacak bir arıza, bakım veya tadilat işi için yukarıdaki "Yeni Teklif Çağrısı Başlat" butonuna tıklayarak bölgedeki firmalardan teklif toplayabilirsiniz.
              </p>
            </div>
          ) : (
            filteredRfqs.map((rfq) => {
              const isAwarded = rfq.status === 'awarded';
              const catInfo = TRADE_CATEGORY_LABELS[rfq.category] || {
                label: rfq.category,
                color: 'indigo',
              };

              return (
                <div
                  key={rfq.id}
                  className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
                    isAwarded
                      ? 'border-emerald-300 ring-2 ring-emerald-500/20'
                      : 'border-slate-200'
                  }`}
                >
                  {/* RFQ Header Bar */}
                  <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-50/60 to-white">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {getCategoryIcon(rfq.category)}
                          <span>{catInfo.label}</span>
                        </span>

                        {rfq.priority === 'urgent' && (
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">
                            Acil İhtiyaç
                          </span>
                        )}

                        {isAwarded ? (
                          <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>İHALE ONAYLANDI & FİRMAYA BİLGİ VERİLDİ</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200 flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>Teklifler Toplanıyor ({rfq.quotes.length} Teklif)</span>
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-slate-900">{rfq.title}</h3>
                      <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
                        {rfq.description}
                      </p>
                    </div>

                    {/* Metadata */}
                    <div className="text-right shrink-0 space-y-1">
                      {rfq.estimatedBudget && (
                        <div className="text-xs">
                          <span className="text-slate-400">Tahmini Bütçe: </span>
                          <span className="font-bold text-slate-800">
                            {formatCurrency(rfq.estimatedBudget)}
                          </span>
                        </div>
                      )}
                      <div className="text-[11px] text-slate-400 flex items-center justify-end gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Son Teklif: {formatDate(rfq.deadline)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Incoming Quotes Comparison Section */}
                  <div className="p-5 bg-slate-50/40">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <BadgeCheck className="w-4 h-4 text-indigo-600" />
                        Bölgedeki Firmalardan Gelen Teklifler ({rfq.quotes.length})
                      </h4>
                      <span className="text-[11px] text-slate-500">
                        {isAwarded
                          ? '✓ Sözleşme onaylandı ve firmaya SMS/E-posta ile bilgi iletildi.'
                          : 'Teklifleri karşılaştırın ve en uygun teklifi onaylayın.'}
                      </span>
                    </div>

                    {rfq.quotes.length === 0 ? (
                      <div className="p-6 bg-white rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500">
                        Henüz bölgedeki ustalardan teklif gelmedi. Bölgedeki firmalar sisteme giriş yaptıklarında teklif verecektir.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {rfq.quotes.map((quote) => {
                          const isThisQuoteAccepted = quote.status === 'accepted';
                          const isThisQuoteRejected = quote.status === 'rejected';
                          const matchingVendor = vendors.find((v) => v.id === quote.vendorId);

                          return (
                            <div
                              key={quote.id}
                              className={`bg-white rounded-2xl p-4 border transition-all flex flex-col justify-between ${
                                isThisQuoteAccepted
                                  ? 'border-emerald-400 bg-emerald-50/20 shadow-md ring-2 ring-emerald-500/20'
                                  : isThisQuoteRejected
                                  ? 'border-slate-200 opacity-60 bg-slate-50'
                                  : 'border-slate-200 hover:border-indigo-300 hover:shadow-xs'
                              }`}
                            >
                              <div className="space-y-3">
                                {/* Vendor Profile Top */}
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <div className="flex items-center space-x-1.5">
                                      <span className="font-bold text-slate-900 text-sm">
                                        {quote.vendorName}
                                      </span>
                                      {quote.isVerifiedVendor && (
                                        <span title="Doğrulanmış Lisanslı Firma">
                                          <BadgeCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[11px] text-slate-500 flex items-center space-x-2 mt-0.5">
                                      <span className="flex items-center text-amber-500 font-semibold">
                                        <Star className="w-3 h-3 fill-amber-400 mr-0.5" />
                                        {quote.vendorRating}
                                      </span>
                                      <span>•</span>
                                      <span className="flex items-center gap-1 font-mono text-slate-600">
                                        <Phone className="w-3 h-3 text-slate-400" />
                                        {quote.vendorPhone}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Bid Price Tag */}
                                  <div className="text-right">
                                    <div className="text-lg font-black text-slate-900">
                                      {formatCurrency(quote.amount)}
                                    </div>
                                    <div className="text-[10px] text-slate-500">
                                      {quote.includesVat ? 'KDV Dahil' : '+ %20 KDV Hariç'}
                                    </div>
                                  </div>
                                </div>

                                {/* Delivery & Warranty Badges */}
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/80">
                                    <span className="text-[10px] text-slate-400 block">Teslim Süresi</span>
                                    <span className="font-bold text-slate-700">
                                      ⏱ {quote.deliveryDays} İş Günü
                                    </span>
                                  </div>
                                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/80">
                                    <span className="text-[10px] text-slate-400 block">Garanti</span>
                                    <span className="font-bold text-slate-700">
                                      🛡 {quote.warrantyMonths} Ay Garanti
                                    </span>
                                  </div>
                                </div>

                                {/* Materials & Details */}
                                <div className="text-xs space-y-1">
                                  <div className="text-slate-700">
                                    <span className="font-semibold text-slate-900">Malzeme / Kapsam: </span>
                                    {quote.materialQuality}
                                  </div>
                                  {quote.notes && (
                                    <p className="text-slate-500 italic text-[11px]">
                                      "{quote.notes}"
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Action Footer */}
                              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                                <span className="text-[10px] text-slate-400">
                                  Teklif Tarihi: {formatDate(quote.submittedDate)}
                                </span>

                                {isThisQuoteAccepted ? (
                                  <div className="flex flex-wrap items-center gap-2">
                                    <div className="px-3 py-1 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm">
                                      <Check className="w-4 h-4" />
                                      <span>KAZANAN TEKLİF & ONAYLANDI</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const matchedV =
                                          matchingVendor || vendors.find((v) => v.id === quote.vendorId);
                                        if (matchedV) {
                                          setEvaluatingVendor(matchedV);
                                          setReviewJobTitle(rfq.title);
                                          setReviewRating(5);
                                          setReviewComment('');
                                          setCriteriaQuality(5);
                                          setCriteriaTiming(5);
                                          setCriteriaPricing(5);
                                          setCriteriaComm(5);
                                        }
                                      }}
                                      className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                                      title="İşi tamamlayan firmayı site yönetimi olarak değerlendir"
                                    >
                                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                      <span>Firmayı Puanla & Değerlendir</span>
                                    </button>
                                  </div>
                                ) : isThisQuoteRejected ? (
                                  <span className="text-xs text-slate-400 italic">
                                    Farklı teklif tercih edildi
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => {
                                      const matchedV = matchingVendor || {
                                        id: quote.vendorId,
                                        companyName: quote.vendorName,
                                        authorizedPerson: 'Yetkili',
                                        category: quote.vendorCategory,
                                        city: currentSite.profile.city,
                                        districts: ['Kadıköy'],
                                        phone: quote.vendorPhone,
                                        email: quote.vendorEmail,
                                        address: 'İstanbul',
                                        rating: quote.vendorRating,
                                        completedJobsCount: 10,
                                        isVerified: quote.isVerifiedVendor,
                                        registeredDate: quote.submittedDate,
                                      };
                                      setConfirmApproveQuote({
                                        request: rfq,
                                        quote,
                                        vendor: matchedV,
                                      });
                                    }}
                                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
                                  >
                                    <Award className="w-3.5 h-3.5 text-amber-300" />
                                    <span>Teklifi Onayla & İşi Başlat</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* SUB TAB 2: VENDOR DIRECTORY */}
      {activeSubTab === 'vendors' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">
              Bölgenizdeki Lisanslı & Onaylı Esnaflar ({filteredVendors.length} Firma)
            </h3>
            <span className="text-xs text-slate-500">
              {currentSite.profile.city} / Kadıköy, Ataşehir, Çankaya bölgeleri
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVendors.map((vendor) => {
              const catInfo = TRADE_CATEGORY_LABELS[vendor.category] || {
                label: vendor.category,
                color: 'indigo',
              };
              const isSuspended = vendor.status === 'suspended';
              const reviewsList = vendor.reviews || [];

              return (
                <div
                  key={vendor.id}
                  className={`bg-white rounded-2xl p-5 border shadow-sm transition-all flex flex-col justify-between ${
                    isSuspended
                      ? 'border-rose-300 bg-rose-50/20'
                      : 'border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                        {getCategoryIcon(vendor.category)}
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <div className="flex items-center space-x-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 text-amber-800 text-xs font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{vendor.rating.toFixed(1)}</span>
                          <span className="text-[10px] text-amber-600 font-normal">
                            ({vendor.completedJobsCount} İş)
                          </span>
                        </div>
                        {reviewsList.length > 0 && (
                          <button
                            onClick={() => setViewingReviewsVendor(vendor)}
                            className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold underline cursor-pointer"
                          >
                            {reviewsList.length} Site Yorumunu Gör →
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center space-x-1">
                        <h4 className="font-bold text-slate-900 text-sm leading-snug">
                          {vendor.companyName}
                        </h4>
                        {vendor.isVerified && (
                          <BadgeCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-indigo-700 font-semibold mt-0.5">
                        {vendor.authorizedPerson} • {catInfo.label}
                      </p>
                    </div>

                    {/* Suspension Notice if closed by Super Admin */}
                    {isSuspended && (
                      <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-0.5">
                        <span className="font-bold flex items-center space-x-1">
                          <span>🔒 Faaliyeti Askıya Alındı (Süper Admin)</span>
                        </span>
                        <p className="text-[11px] text-rose-700 italic">
                          "{vendor.suspendedReason || 'Süper Admin tarafından geçici olarak kapatılmıştır.'}"
                        </p>
                      </div>
                    )}

                    {/* Cert and info */}
                    <div className="text-xs text-slate-600 space-y-1.5 pt-1">
                      <div className="flex items-center text-slate-500 text-[11px] gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{vendor.districts.slice(0, 3).join(', ')}</span>
                      </div>
                      <div className="flex items-center text-slate-700 font-mono text-[11px] gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{vendor.phone}</span>
                      </div>
                      <div className="flex items-center text-slate-500 text-[11px] gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{vendor.email}</span>
                      </div>
                      {vendor.certNumber && (
                        <div className="text-[10px] bg-slate-50 text-slate-500 p-2 rounded-xl border border-slate-200/80">
                          <span className="font-semibold text-slate-700">Yetki Belgesi: </span>
                          {vendor.certNumber}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    {/* Rate & Review Button */}
                    <button
                      onClick={() => {
                        setEvaluatingVendor(vendor);
                        setReviewRating(5);
                        setReviewJobTitle('');
                        setReviewComment('');
                        setCriteriaQuality(5);
                        setCriteriaTiming(5);
                        setCriteriaPricing(5);
                        setCriteriaComm(5);
                      }}
                      className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition flex items-center space-x-1"
                      title="Bu firmaya site yönetimi olarak puan ve değerlendirme yaz"
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>Değerlendir & Puan Ver</span>
                    </button>

                    {!isSuspended ? (
                      <button
                        onClick={() => {
                          setRfqCategory(vendor.category);
                          setRfqTitle(`${vendor.companyName} için Teklif Talebi`);
                          setShowNewRfqModal(true);
                        }}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition"
                      >
                        Teklif İste
                      </button>
                    ) : (
                      <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-lg">
                        Kapatılmış Firma
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: Teklifi Onayla & Kazanan Firmaya Bilgi Gönder */}
      {confirmApproveQuote && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Teklifi Onayla & İşi Başlat</h3>
                  <p className="text-[11px] text-slate-500">
                    Firmaya otomatik SMS ve sözleşme kabul bildirimi iletilecektir
                  </p>
                </div>
              </div>
              <button
                onClick={() => setConfirmApproveQuote(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 my-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">İhale / İş Başlığı:</span>
                  <span className="font-bold text-slate-900">{confirmApproveQuote.request.title}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Kazanan Firma:</span>
                  <span className="font-bold text-indigo-700 text-sm">
                    {confirmApproveQuote.quote.vendorName}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Firma Yetkilisi:</span>
                  <span className="font-semibold text-slate-800">
                    {confirmApproveQuote.vendor.authorizedPerson} ({confirmApproveQuote.quote.vendorPhone})
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <span className="text-slate-500">Onaylanan Teklif Bedeli:</span>
                  <span className="text-base font-extrabold text-slate-900">
                    {formatCurrency(confirmApproveQuote.quote.amount)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Taahhüt Edilen Teslim:</span>
                  <span className="font-bold text-slate-800">
                    {confirmApproveQuote.quote.deliveryDays} İş Günü • {confirmApproveQuote.quote.warrantyMonths} Ay Garanti
                  </span>
                </div>
              </div>

              {/* Automated Notification Preview to the Contractor */}
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1.5">
                <div className="flex items-center space-x-1.5 text-emerald-800 font-bold">
                  <Send className="w-3.5 h-3.5" />
                  <span>Firmaya Gönderilecek Otomatik SMS & Bilgilendirme:</span>
                </div>
                <p className="text-[11px] text-emerald-900 italic font-mono bg-white/80 p-2.5 rounded-lg border border-emerald-200 leading-relaxed">
                  "Sayın {confirmApproveQuote.vendor.authorizedPerson} ({confirmApproveQuote.quote.vendorName}), {currentSite.profile.siteName} Yönetimi '{confirmApproveQuote.request.title}' işi için verdiğiniz {formatCurrency(confirmApproveQuote.quote.amount)} tutarındaki teklifinizi ONAYLAMIŞTIR. İletişim: {currentSite.profile.emergencyPhone}. Resmi iş sözleşmesi hazırlanmıştır."
                </p>
              </div>

              <div className="text-[11px] text-slate-500 space-y-1">
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Sistemde otomatik olarak bir "Bakım / İş Emri" kaydı açılacaktır.</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Resmi "Hizmet Sözleşmesi & Teklif Kabul Belgesi" dijital arşive eklenecektir.</span>
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setConfirmApproveQuote(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold text-xs hover:bg-slate-50"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={() => {
                  onApproveQuote(
                    confirmApproveQuote.request,
                    confirmApproveQuote.quote,
                    confirmApproveQuote.vendor
                  );
                  setConfirmApproveQuote(null);
                }}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow transition flex items-center space-x-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Teklifi Onayla & Firmaya Bilgi Gönder</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Yeni Teklif Çağrısı Başlat */}
      {showNewRfqModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <PlusCircle className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">Yeni Teklif Çağrısı Başlat</h3>
              </div>
              <button
                onClick={() => setShowNewRfqModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRfqSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Yapılacak İş / İhale Başlığı *
                </label>
                <input
                  type="text"
                  required
                  value={rfqTitle}
                  onChange={(e) => setRfqTitle(e.target.value)}
                  placeholder="Örn: B Blok Hidrofor Pompa Değişimi veya Asansör Revizyonu"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Hizmet Branşı / Kategori *</label>
                  <select
                    value={rfqCategory}
                    onChange={(e) => setRfqCategory(e.target.value as VendorTradeCategory)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {Object.entries(TRADE_CATEGORY_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Öncelik Durumu</label>
                  <select
                    value={rfqPriority}
                    onChange={(e) => setRfqPriority(e.target.value as 'urgent' | 'normal' | 'low')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="normal">Normal İhtiyaç</option>
                    <option value="urgent">Acil Arıza / İhtiyaç</option>
                    <option value="low">Planlı / Düşük Öncelik</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Tahmini Bütçe (TL - Opsiyonel)
                  </label>
                  <input
                    type="number"
                    value={rfqBudget}
                    onChange={(e) => setRfqBudget(e.target.value)}
                    placeholder="35000"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Son Teklif Verme Tarihi *</label>
                  <input
                    type="date"
                    required
                    value={rfqDeadline}
                    onChange={(e) => setRfqDeadline(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  İşin Detaylı Tanımı & İhtiyaç Şartnamesi *
                </label>
                <textarea
                  rows={4}
                  required
                  value={rfqDescription}
                  onChange={(e) => setRfqDescription(e.target.value)}
                  placeholder="Ustalardan ve firmalardan beklenen malzeme kalitesi, marka tercihleri, iş kapsamı ve garanti şartlarını detaylandırınız..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowNewRfqModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-sm"
                >
                  Teklif Çağrısını Yayınla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Yeni Firma / Usta Kaydı */}
      {showVendorRegisterModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">Firma & Usta Olarak Kaydol</h3>
              </div>
              <button
                onClick={() => setShowVendorRegisterModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-2">
              Bölgenizdeki apartman ve sitelerin teklif çağrılarını görmek ve teklif vermek için firma profilinizi oluşturun.
            </p>

            <form onSubmit={handleRegisterVendorSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Firma Ticari Ünvanı / Usta Adı *
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Örn: Anadolu Asansör Ltd. veya Usta Ahmet Demir"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Yetkili Kişi *</label>
                  <input
                    type="text"
                    required
                    value={authorizedPerson}
                    onChange={(e) => setAuthorizedPerson(e.target.value)}
                    placeholder="Örn: Müh. Ahmet Demir"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Hizmet Branşı *</label>
                  <select
                    value={vendorCategory}
                    onChange={(e) => setVendorCategory(e.target.value as VendorTradeCategory)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {Object.entries(TRADE_CATEGORY_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Telefon (SMS/WhatsApp Bildirimi İçin) *
                  </label>
                  <input
                    type="text"
                    required
                    value={vendorPhone}
                    onChange={(e) => setVendorPhone(e.target.value)}
                    placeholder="0532 111 22 33"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">E-Posta</label>
                  <input
                    type="email"
                    value={vendorEmail}
                    onChange={(e) => setVendorEmail(e.target.value)}
                    placeholder="info@firma.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Hizmet İli</label>
                  <input
                    type="text"
                    value={vendorCity}
                    onChange={(e) => setVendorCity(e.target.value)}
                    placeholder="İstanbul"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Hizmet İlçeleri</label>
                  <input
                    type="text"
                    value={vendorDistricts}
                    onChange={(e) => setVendorDistricts(e.target.value)}
                    placeholder="Kadıköy, Ataşehir, Üsküdar"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Vergi Dairesi & No</label>
                  <input
                    type="text"
                    value={vendorTaxNo}
                    onChange={(e) => setVendorTaxNo(e.target.value)}
                    placeholder="Kozyatağı V.D. 4820194821"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ustalık / Yetki Belge No</label>
                  <input
                    type="text"
                    value={vendorCertNo}
                    onChange={(e) => setVendorCertNo(e.target.value)}
                    placeholder="TSE HYB / MYK Seviye 4"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Atölye / Ofis Adresi</label>
                <input
                  type="text"
                  value={vendorAddress}
                  onChange={(e) => setVendorAddress(e.target.value)}
                  placeholder="Ataşehir / İstanbul"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowVendorRegisterModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-sm"
                >
                  Firma Kaydını Tamamla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SİTE YÖNETİMİ FİRMA DEĞERLENDİRME & PUAN VER */}
      {evaluatingVendor && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Firmayı Değerlendir & Puan Ver
                  </h3>
                  <p className="text-xs text-slate-500">
                    {evaluatingVendor.companyName} ({evaluatingVendor.authorizedPerson})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEvaluatingVendor(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
              {/* Star Rating Picker */}
              <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200 text-center space-y-1.5">
                <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">
                  Genel Memnuniyet Puanı
                </span>
                <div className="flex items-center justify-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 transition-transform hover:scale-125 focus:outline-none"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= reviewRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-bold text-amber-800">
                  {reviewRating === 5
                    ? '⭐⭐⭐⭐⭐ Mükemmel (Kesinlikle Tavsiye Ederim)'
                    : reviewRating === 4
                    ? '⭐⭐⭐⭐ Çok İyi (Memnun Kaldık)'
                    : reviewRating === 3
                    ? '⭐⭐⭐ Orta / Standart'
                    : reviewRating === 2
                    ? '⭐⭐ Yetersiz / Sorunlu'
                    : '⭐ Kötü / Tavsiye Edilmez'}
                </span>
              </div>

              {/* Job Title */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Yapılan Arıza / Şantiye İşi Başlığı *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Bodrum Kat Hidrofor Tank Değişimi & Basınç Ayarı"
                  value={reviewJobTitle}
                  onChange={(e) => setReviewJobTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Sub-Criteria Ratings */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-[11px]">
                <div>
                  <span className="text-slate-600 block mb-1">İşçilik & Malzeme Kalitesi: <strong>{criteriaQuality}/5</strong></span>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setCriteriaQuality(num)}
                        className={`w-6 h-6 rounded-lg font-bold ${
                          num <= criteriaQuality ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-slate-600 block mb-1">Zamanında Teslimat: <strong>{criteriaTiming}/5</strong></span>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setCriteriaTiming(num)}
                        className={`w-6 h-6 rounded-lg font-bold ${
                          num <= criteriaTiming ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-slate-600 block mb-1">Fiyat & Hakediş Şeffaflığı: <strong>{criteriaPricing}/5</strong></span>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setCriteriaPricing(num)}
                        className={`w-6 h-6 rounded-lg font-bold ${
                          num <= criteriaPricing ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-slate-600 block mb-1">İletişim & Usta Yaklaşımı: <strong>{criteriaComm}/5</strong></span>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setCriteriaComm(num)}
                        className={`w-6 h-6 rounded-lg font-bold ${
                          num <= criteriaComm ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Comment text */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Yönetim Değerlendirmesi & Yorumunuz *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ustanın işçiliği, sözünde durması, faturası ve tavsiyeniz hakkında diğer site yöneticilerine rehber olacak detayları yazınız..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="text-[10px] text-slate-500">
                Bu değerlendirme {currentSite.profile.siteName} yönetimi adına yayınlanacak ve firmanın genel puanına doğrudan etki edecektir.
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEvaluatingVendor(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md shadow-amber-200"
                >
                  Puanı & Yorumu Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SİTE YÖNETİMLERİNİN YORUMLARINI VE PUANLARINI GÖR */}
      {viewingReviewsVendor && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  {viewingReviewsVendor.companyName} Değerlendirmeleri
                </h3>
                <p className="text-xs text-slate-500">
                  Site yönetimleri tarafından yazılan resmi değerlendirmeler ve puanlar
                </p>
              </div>
              <button
                onClick={() => setViewingReviewsVendor(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Overall stats bar */}
            <div className="flex items-center justify-between p-3.5 bg-amber-50 rounded-2xl border border-amber-200">
              <div className="flex items-center space-x-2">
                <div className="text-2xl font-black text-amber-800">
                  {viewingReviewsVendor.rating.toFixed(1)}
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.round(viewingReviewsVendor.rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-amber-900 font-semibold block">
                    {viewingReviewsVendor.reviews?.length || 0} Site Değerlendirmesi
                  </span>
                </div>
              </div>

              <span className="text-xs text-amber-900 font-bold bg-white/80 px-2.5 py-1 rounded-xl border border-amber-200">
                {viewingReviewsVendor.completedJobsCount} Başarılı İş
              </span>
            </div>

            {/* Reviews List */}
            <div className="max-h-80 overflow-y-auto space-y-3 pr-1 text-xs">
              {(viewingReviewsVendor.reviews || []).length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  Henüz site yönetimi değerlendirmesi bulunmuyor.
                </div>
              ) : (
                (viewingReviewsVendor.reviews || []).map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-slate-900">{rev.siteName}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-600 font-medium">{rev.managerName}</span>
                        </div>
                        <span className="text-[10px] text-indigo-700 font-semibold block">
                          İş: {rev.jobTitle}
                        </span>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center space-x-0.5 justify-end">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {formatDate(rev.date)}
                        </span>
                      </div>
                    </div>

                    <p className="text-slate-700 text-xs italic">
                      "{rev.comment}"
                    </p>

                    {rev.criteriaRatings && (
                      <div className="grid grid-cols-4 gap-1 pt-1 border-t border-slate-200/60 text-[9px] text-slate-500">
                        <span>İşçilik: <strong>{rev.criteriaRatings.quality}/5</strong></span>
                        <span>Teslim: <strong>{rev.criteriaRatings.timing}/5</strong></span>
                        <span>Fiyat: <strong>{rev.criteriaRatings.pricing}/5</strong></span>
                        <span>İletişim: <strong>{rev.criteriaRatings.communication}/5</strong></span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t flex justify-end">
              <button
                onClick={() => setViewingReviewsVendor(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
