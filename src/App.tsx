/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { INITIAL_TENANT_SITES } from './data/tenantSites';
import { INITIAL_USERS } from './data/users';
import {
  TenantSite,
  ApartmentUnit,
  DuesRecord,
  ExpenseRecord,
  MaintenanceTicket,
  CommunityPost,
  ArchiveDocument,
  NotificationItem,
  ResidentRegistrationApplication,
  SaaSInvoice,
  UserRole,
  TicketStatus,
  AppUser,
  ManagementHandoverRecord,
  SiteAuditor,
  AuditInspectionReport,
  BankTransactionMatch,
  BankMatchingRule,
  VendorCompany,
  ServiceQuoteRequest,
  VendorQuote,
  PlatformProgramModule,
  VendorReview,
  VendorCommissionFee,
  VendorBillingModel,
  PaymentMethod,
} from './types';
import { INITIAL_VENDORS } from './data/vendorData';
import { DEFAULT_PLATFORM_MODULES } from './data/platformModules';
import { PowerOff } from 'lucide-react';
import { formatCurrency, generateReceiptNo } from './utils/formatters';

// Auth Screen (Email + 2-Factor Authentication)
import { AuthScreen } from './components/auth/AuthScreen';

import { Navbar } from './components/Navbar';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { SuperAdminPanel } from './components/superadmin/SuperAdminPanel';
import { SuspendedSiteScreen } from './components/SuspendedSiteScreen';
import { VendorPortalScreen } from './components/vendor/VendorPortalScreen';

// Management, Auditor & Resident Tabs
import { OverviewTab } from './components/tabs/OverviewTab';
import { ResidentsTab } from './components/tabs/ResidentsTab';
import { RegistrationsTab } from './components/tabs/RegistrationsTab';
import { AuditTab } from './components/tabs/AuditTab';
import { BankImportTab } from './components/tabs/BankImportTab';
import { DuesTab } from './components/tabs/DuesTab';
import { ExpensesTab } from './components/tabs/ExpensesTab';
import { BudgetTab } from './components/tabs/BudgetTab';
import { MaintenanceTab } from './components/tabs/MaintenanceTab';
import { MarketplaceTab } from './components/tabs/MarketplaceTab';
import { CommunityTab } from './components/tabs/CommunityTab';
import { ArchiveTab } from './components/tabs/ArchiveTab';
import { NotificationsTab } from './components/tabs/NotificationsTab';
import { CloudTab } from './components/tabs/CloudTab';

// AI Assistant Floating Widget
import { AIAssistantWidget } from './components/ai/AIAssistantWidget';

// Modals
import { PaymentModal } from './components/modals/PaymentModal';
import { ReceiptModal } from './components/modals/ReceiptModal';
import { NewExpenseModal } from './components/modals/NewExpenseModal';
import { NewTicketModal } from './components/modals/NewTicketModal';
import { NewPostModal } from './components/modals/NewPostModal';
import { NewDocumentModal } from './components/modals/NewDocumentModal';
import { DocumentViewerModal } from './components/modals/DocumentViewerModal';
import { CloudSecurityModal } from './components/modals/CloudSecurityModal';
import { ShortcutsModal } from './components/modals/ShortcutsModal';
import { MobilePushToast } from './components/MobilePushToast';
import { EditResidentModal } from './components/modals/EditResidentModal';
import { ResidentRegisterModal } from './components/modals/ResidentRegisterModal';
import { ResidentMenuPermissionsModal } from './components/modals/ResidentMenuPermissionsModal';
import { NewSiteModal } from './components/modals/NewSiteModal';
import { NewSaasInvoiceModal } from './components/modals/NewSaasInvoiceModal';
import { SaasInvoiceViewerModal } from './components/modals/SaasInvoiceViewerModal';
import { ManagementHandoverModal } from './components/modals/ManagementHandoverModal';
import { AssignAuditorModal } from './components/modals/AssignAuditorModal';

export default function App() {
  // --- USERS & AUTHENTICATION STATE ---
  const [users, setUsers] = useState<AppUser[]>(INITIAL_USERS);
  // Default logged-in user: Site Manager (or null if forced to log in initially)
  const [currentUser, setCurrentUser] = useState<AppUser | null>(INITIAL_USERS[1]); // Kemal Ersoy (Yönetici)

  // --- MULTI-TENANT SITES STATE ---
  const [sites, setSites] = useState<TenantSite[]>(INITIAL_TENANT_SITES);
  const [currentSiteId, setCurrentSiteId] = useState<string>('site-zumrut');
  const [vendors, setVendors] = useState<VendorCompany[]>(INITIAL_VENDORS);
  const [activeVendorId, setActiveVendorId] = useState<string>('ven-2'); // Mustafa Özkan (Özkan Hidrofor & Isı) default
  const [modules, setModules] = useState<PlatformProgramModule[]>(DEFAULT_PLATFORM_MODULES);

  // Currently active tenant site
  const currentSite = sites.find((s) => s.id === currentSiteId) || sites[0];
  const activeVendor = vendors.find((v) => v.id === activeVendorId) || vendors[0];

  // Helper to update current site state immutably
  const updateCurrentSite = useCallback(
    (updater: (prevSite: TenantSite) => TenantSite) => {
      setSites((prevSites) =>
        prevSites.map((site) => (site.id === currentSiteId ? updater(site) : site))
      );
    },
    [currentSiteId]
  );

  // --- UI & ROLE NAVIGATION STATE ---
  const [activeRole, setActiveRole] = useState<UserRole>('manager');
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  // Accessibility State
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [highContrast, setHighContrast] = useState(false);

  // --- MODALS STATE ---
  const [payingDue, setPayingDue] = useState<DuesRecord | null>(null);
  const [viewingReceiptDue, setViewingReceiptDue] = useState<DuesRecord | null>(null);
  const [viewingDoc, setViewingDoc] = useState<ArchiveDocument | null>(null);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showCloudModal, setShowCloudModal] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  // Resident and Multi-Tenant Specific Modals
  const [editingResidentUnit, setEditingResidentUnit] = useState<ApartmentUnit | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showResidentMenuPermissionsModal, setShowResidentMenuPermissionsModal] = useState(false);
  const [showNewSiteModal, setShowNewSiteModal] = useState(false);
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false);
  const [invoicePreselectedSiteId, setInvoicePreselectedSiteId] = useState<string | undefined>(undefined);
  const [viewingSaasInvoice, setViewingSaasInvoice] = useState<SaaSInvoice | null>(null);

  // Management Handover & Auditor Modals
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [showAssignAuditorModal, setShowAssignAuditorModal] = useState(false);

  // Live Simulated Mobile Push Toast
  const [pushToast, setPushToast] = useState<{ title: string; body: string } | null>(null);

  const showToast = useCallback((title: string, body: string) => {
    setPushToast({ title, body });
  }, []);

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) {
        if (e.key === '1') setActiveTab('overview');
        if (e.key === '2') setActiveTab('residents');
        if (e.key === '3') setActiveTab('registrations');
        if (e.key === '4') setActiveTab('audit');
        if (e.key === '5') setActiveTab('dues');
        if (e.key === '6') setActiveTab('expenses');
        if (e.key === '7') setActiveTab('budget');
        if (e.key === '8') setActiveTab('maintenance');
        if (e.key === '9') setActiveTab('community');
      }
      if (e.key === 'Escape') {
        setPayingDue(null);
        setViewingReceiptDue(null);
        setViewingDoc(null);
        setShowExpenseModal(false);
        setShowTicketModal(false);
        setShowPostModal(false);
        setShowDocumentModal(false);
        setShowCloudModal(false);
        setShowShortcutsModal(false);
        setEditingResidentUnit(null);
        setShowRegisterModal(false);
        setShowResidentMenuPermissionsModal(false);
        setShowNewSiteModal(false);
        setShowNewInvoiceModal(false);
        setViewingSaasInvoice(null);
        setShowHandoverModal(false);
        setShowAssignAuditorModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // -------------------------------------------------------------
  // AUTHENTICATION & TENANT ISOLATION HANDLERS
  // -------------------------------------------------------------

  const handleLoginSuccess = (user: AppUser) => {
    setCurrentUser(user);
    setActiveRole(user.role);

    // Enforce Tenant Isolation: If not superadmin, strictly lock to user's assigned site
    if (user.role !== 'superadmin' && user.siteId && user.siteId !== 'all') {
      setCurrentSiteId(user.siteId);
    }
    setActiveTab('overview');

    showToast(
      'Giriş Başarılı ✓ (2FA Doğrulandı)',
      `Hoş geldiniz, ${user.fullName} (${user.email}).`
    );
  };

  const handleLogout = () => {
    setCurrentUser(null);
    showToast('Oturum Kapatıldı', 'Güvenli çıkış yapıldı. Tekrar giriş yapabilirsiniz.');
  };

  // -------------------------------------------------------------
  // MULTI-TENANT & SAAS BILLING ACTIONS
  // -------------------------------------------------------------

  const handleSelectSite = (siteId: string) => {
    // Only Super Admin can switch sites
    if (currentUser?.role !== 'superadmin') {
      showToast('Erişim Reddedildi', 'Diğer siteleri sadece Süper Admin görüntüleyebilir.');
      return;
    }

    setCurrentSiteId(siteId);
    setActiveTab('overview');
    const selected = sites.find((s) => s.id === siteId);
    if (selected) {
      showToast(
        'Site Değiştirildi',
        `"${selected.profile.siteName}" (${selected.profile.city}) aktif hesap olarak yüklendi.`
      );
    }
  };

  const handleAddTenantSite = (newSite: TenantSite) => {
    setSites((prev) => [newSite, ...prev]);
    setCurrentSiteId(newSite.id);
    setActiveTab('overview');
    showToast(
      'Yeni Site Eklendi & Başlatıldı',
      `"${newSite.profile.siteName}" 365 günlük SaaS lisans sayacı ile aktif edildi.`
    );
  };

  const handleToggleSuspendSite = (siteId: string) => {
    setSites((prev) =>
      prev.map((s) => {
        if (s.id === siteId) {
          const isCurrentlySuspended = s.license.isSuspended;
          const updatedSuspended = !isCurrentlySuspended;
          return {
            ...s,
            license: {
              ...s.license,
              isSuspended: updatedSuspended,
              suspensionReason: updatedSuspended
                ? 'Yıllık ApsisCloud SaaS lisans yenileme faturası ödenmediği için program dondurulmuştur.'
                : undefined,
              suspendedAt: updatedSuspended ? new Date().toISOString() : undefined,
            },
          };
        }
        return s;
      })
    );

    const targetSite = sites.find((s) => s.id === siteId);
    const wasSuspended = targetSite?.license.isSuspended;

    if (wasSuspended) {
      showToast('Site Aktif Edildi', `"${targetSite?.profile.siteName}" program kilidi kaldırıldı.`);
    } else {
      showToast(
        'Site Programı Donduruldu ❄️',
        `"${targetSite?.profile.siteName}" yıllık lisans ödenmediği gerekçesiyle donduruldu.`
      );
    }
  };

  const handleExtendLicense = (siteId: string, days = 30, convertToFull = false) => {
    setSites((prev) =>
      prev.map((s) => {
        if (s.id === siteId) {
          const currentExp = new Date(s.license.expiresAt);
          const baseDate = currentExp > new Date() ? currentExp : new Date();
          baseDate.setDate(baseDate.getDate() + days);

          const isCurrentlyDemo = s.license.isDemo || s.license.planTier === 'demo';
          const willBeDemo = convertToFull ? false : isCurrentlyDemo;
          const remainingDays = Math.max(0, Math.ceil((baseDate.getTime() - Date.now()) / (1000 * 3600 * 24)));

          return {
            ...s,
            license: {
              ...s.license,
              expiresAt: baseDate.toISOString().split('T')[0],
              isSuspended: false,
              suspensionReason: undefined,
              isDemo: willBeDemo,
              planTier: convertToFull ? 'professional' : s.license.planTier,
              planName: convertToFull ? 'Kurumsal Profesyonel Paket' : s.license.planName,
              yearlyPrice: convertToFull ? (s.license.yearlyPrice || 28800) : s.license.yearlyPrice,
              autoRenew: convertToFull ? true : s.license.autoRenew,
              trialDaysRemaining: willBeDemo ? remainingDays : undefined,
            },
          };
        }
        return s;
      })
    );

    const targetSite = sites.find((s) => s.id === siteId);
    if (convertToFull) {
      showToast(
        'Tam Kurumsal Lisansa Geçildi 🎉',
        `"${targetSite?.profile.siteName}" demo kısıtlaması kaldırıldı ve +${days} gün kurumsal lisans tanımlandı.`
      );
    } else {
      showToast(
        'Lisans Süresi Uzatıldı',
        `"${targetSite?.profile.siteName}" aktiflik süresine +${days} gün eklendi.`
      );
    }
  };

  const handleImportSite = (newSite: TenantSite) => {
    setSites((prev) => [newSite, ...prev]);
    setCurrentSiteId(newSite.id);
    showToast(
      'Site Excel\'den Başarıyla Aktarıldı 🎉',
      `"${newSite.profile.siteName}" (${newSite.profile.totalFlats} Daire) sisteme kaydedildi.`
    );
  };

  const handleAddVendorFee = (vendorId: string, fee: VendorCommissionFee) => {
    setVendors((prev) =>
      prev.map((v) => {
        if (v.id === vendorId) {
          return {
            ...v,
            commissionFees: [fee, ...(v.commissionFees || [])],
          };
        }
        return v;
      })
    );
    showToast(
      'Firma Faturası / Komisyonu Yansıtıldı',
      `${fee.feeAmount.toLocaleString('tr-TR')} ₺ ${fee.feeType === 'job_commission' ? 'iş komisyon bedeli' : 'yıllık abonelik ücreti'} tahakkuk ettirildi.`
    );
  };

  const handleMarkVendorFeePaid = (vendorId: string, feeId: string) => {
    setVendors((prev) =>
      prev.map((v) => {
        if (v.id === vendorId) {
          return {
            ...v,
            commissionFees: (v.commissionFees || []).map((f) =>
              f.id === feeId
                ? {
                    ...f,
                    status: 'paid',
                    paidDate: new Date().toISOString().split('T')[0],
                    paymentMethod: 'Banka Havalesi / Sanal POS',
                  }
                : f
            ),
          };
        }
        return v;
      })
    );
    showToast('Tahsilat Kaydedildi', 'Firma komisyon / lisans ödemesi tahsil edildi olarak işaretlendi.');
  };

  const handleUpdateVendorBillingModel = (
    vendorId: string,
    billingModel: VendorBillingModel,
    commissionRate?: number,
    annualSubscriptionFee?: number
  ) => {
    setVendors((prev) =>
      prev.map((v) => {
        if (v.id === vendorId) {
          return {
            ...v,
            billingModel,
            commissionRate: commissionRate !== undefined ? commissionRate : v.commissionRate,
            annualSubscriptionFee:
              annualSubscriptionFee !== undefined ? annualSubscriptionFee : v.annualSubscriptionFee,
          };
        }
        return v;
      })
    );
    showToast('Firma Ücret Modeli Güncellendi', 'Komisyon ve yıllık lisans koşulları kaydedildi.');
  };

  const handleAddSaasInvoice = (newInvoice: SaaSInvoice) => {
    setSites((prev) =>
      prev.map((s) => {
        if (s.id === newInvoice.siteId) {
          return {
            ...s,
            saasInvoices: [newInvoice, ...s.saasInvoices],
          };
        }
        return s;
      })
    );

    showToast(
      'Yıllık Fatura Kesildi',
      `${newInvoice.siteName} için ${newInvoice.invoiceNumber} no lu lisans faturası oluşturuldu.`
    );
  };

  const handleMarkInvoicePaid = (invoiceId: string) => {
    let siteName = '';
    setSites((prev) =>
      prev.map((site) => {
        const hasInv = site.saasInvoices.some((i) => i.id === invoiceId);
        if (!hasInv) return site;

        siteName = site.profile.siteName;
        const updatedInvoices = site.saasInvoices.map((inv) =>
          inv.id === invoiceId
            ? {
                ...inv,
                status: 'paid' as const,
                paidDate: new Date().toISOString().split('T')[0],
              }
            : inv
        );

        // Also extend license by 365 days and unfreeze
        const expDate = new Date();
        expDate.setDate(expDate.getDate() + 365);

        return {
          ...site,
          saasInvoices: updatedInvoices,
          license: {
            ...site.license,
            expiresAt: expDate.toISOString().split('T')[0],
            isSuspended: false,
            suspensionReason: undefined,
          },
        };
      })
    );

    showToast(
      'Fatura Tahsil Edildi ✓',
      `${siteName} SaaS lisans faturası ödendi olarak işaretlendi ve 365 gün süre uzatıldı.`
    );
  };

  // -------------------------------------------------------------
  // YÖNETİCİ DEVRİ & DENETÇİ YETKİLENDİRME HANDLERS
  // -------------------------------------------------------------

  const handleExecuteHandover = (handoverData: ManagementHandoverRecord) => {
    // 1. Create official handover document for Digital Archive
    const handoverDoc: ArchiveDocument = {
      id: `doc-handover-${Date.now()}`,
      title: `Yönetim Kurulu Devir Teslim Tutanağı - Karar No: ${handoverData.decisionNumber}`,
      category: 'decision_book',
      date: handoverData.handoverDate,
      fileNumber: handoverData.decisionNumber,
      fileSize: '1.4 MB',
      fileFormat: 'PDF',
      tags: ['Devir Teslim', 'Karar Defteri', 'Yönetici', 'Noter Tasdiki'],
      summary: `${handoverData.previousManagerName} yönetim kurulu başkanlığı görevini ${handoverData.newManagerName} kişisine devretmiştir. Karar No: ${handoverData.decisionNumber}`,
      verifiedHash: `sha256-handover-${Date.now()}-a938c41`,
      uploader: handoverData.previousManagerName,
      accessRole: 'all',
    };

    // 2. Create notification for all residents
    const handoverNotif: NotificationItem = {
      id: `notif-handover-${Date.now()}`,
      title: '📢 Site Yönetimi Devir Teslimi Gerçekleşti',
      message: `Genel Kurul Karar No: ${handoverData.decisionNumber} uyarınca, sayın ${handoverData.newManagerName} yönetim kurulu başkanlığı görevini devralmıştır.`,
      date: 'Bugün, Şimdi',
      read: false,
      type: 'announcement',
      channels: ['push', 'sms', 'email'],
    };

    // 3. Update Site Profile and Archive
    updateCurrentSite((site) => ({
      ...site,
      profile: {
        ...site.profile,
        managementBoard: [handoverData.newManagerName, ...site.profile.managementBoard.slice(1)],
      },
      handoverHistory: [handoverData, ...(site.handoverHistory || [])],
      documents: [handoverDoc, ...site.documents],
      notifications: [handoverNotif, ...site.notifications],
    }));

    // 4. Update or add new manager user to Users list
    const newManagerUser: AppUser = {
      id: `user-mgr-${Date.now()}`,
      email: handoverData.newManagerEmail,
      fullName: `${handoverData.newManagerName} (Yönetici)`,
      phone: handoverData.newManagerPhone,
      role: 'manager',
      siteId: currentSite.id,
      twoFactorEnabled: true,
      twoFactorMethod: 'sms',
    };

    setUsers((prev) => [newManagerUser, ...prev]);

    // If current logged-in user was the manager, update their identity
    if (currentUser?.role === 'manager') {
      setCurrentUser(newManagerUser);
    }

    showToast(
      'Yönetici Devri Başarıyla Gerçekleşti ✓',
      `Yeni Yönetici: ${handoverData.newManagerName}. Devir tutanağı dijital arşive mühürlendi ve sakinlere duyuruldu.`
    );
  };

  const handleAssignAuditor = (newAuditor: SiteAuditor) => {
    // 1. Add to site auditors
    updateCurrentSite((site) => ({
      ...site,
      auditors: [newAuditor, ...(site.auditors || [])],
      notifications: [
        {
          id: `notif-aud-${Date.now()}`,
          title: '🔍 Yeni Bağımsız Denetçi Yetkilendirildi',
          message: `${newAuditor.fullName}, site yönetim hesaplarını denetlemek üzere denetim kuruluna atanmıştır.`,
          date: 'Bugün, Şimdi',
          read: false,
          type: 'announcement',
          channels: ['push'],
        },
        ...site.notifications,
      ],
    }));

    // 2. Add to app users so auditor can log in with their email and 2FA
    const auditorUser: AppUser = {
      id: `user-aud-${Date.now()}`,
      email: newAuditor.email,
      fullName: `${newAuditor.fullName} (Denetçi)`,
      phone: newAuditor.phone,
      role: 'auditor',
      siteId: currentSite.id,
      twoFactorEnabled: true,
      twoFactorMethod: 'sms',
    };

    setUsers((prev) => [auditorUser, ...prev]);

    showToast(
      'Denetçi Yetkilendirildi',
      `${newAuditor.fullName} (${newAuditor.email}) sisteme denetçi olarak tanımlandı ve 2FA giriş yetkisi verildi.`
    );
  };

  const handleSubmitAuditReport = (report: AuditInspectionReport) => {
    const reportDoc: ArchiveDocument = {
      id: `doc-audit-${Date.now()}`,
      title: `${report.inspectionPeriod} - ${report.auditorName}`,
      category: 'audit_report',
      date: report.reportDate,
      fileNumber: `DNT-${Date.now().toString().slice(-4)}`,
      fileSize: '1.2 MB',
      fileFormat: 'PDF',
      tags: ['Denetim', 'Mali İnceleme', 'İbra Raporu', 'KMK Madde 41'],
      summary: report.findingsSummary,
      verifiedHash: report.decisionHash,
      uploader: report.auditorName,
      accessRole: 'all',
    };

    updateCurrentSite((site) => ({
      ...site,
      auditReports: [report, ...(site.auditReports || [])],
      documents: [reportDoc, ...site.documents],
      notifications: [
        {
          id: `notif-rep-${Date.now()}`,
          title: '📋 Yeni Denetim Raporu Arşive Eklendi',
          message: `${report.auditorName} tarafından hazırlanan ${report.inspectionPeriod} dijital mühür vurularak arşive kaydedildi.`,
          date: 'Bugün, Şimdi',
          read: false,
          type: 'system',
          channels: ['push'],
        },
        ...site.notifications,
      ],
    }));

    showToast(
      'Denetim Raporu Mühürlendi',
      `${report.inspectionPeriod} dijital arşive kaydedildi ve kat maliklerinin incelemesine açıldı.`
    );
  };

  // -------------------------------------------------------------
  // RESIDENT ACCOUNTS INTERVENTION & REGISTRATION WORKFLOW
  // -------------------------------------------------------------

  const handleUpdateUnit = (updatedUnit: ApartmentUnit) => {
    updateCurrentSite((site) => ({
      ...site,
      units: site.units.map((u) => (u.id === updatedUnit.id ? updatedUnit : u)),
    }));

    showToast(
      'Sakin Hesabı Güncellendi',
      `${updatedUnit.block} Blok Daire ${updatedUnit.unitNo} (${updatedUnit.residentName}) bilgileri kaydedildi.`
    );
  };

  const handleSendResetPassword = (phone: string, name: string) => {
    const tempPass = Math.floor(100000 + Math.random() * 900000);
    const newNotif: NotificationItem = {
      id: `notif-pass-${Date.now()}`,
      title: '🔑 Geçici Şifre SMS İletildi',
      message: `${name} (${phone}) cep telefonuna sisteme giriş için geçici şifre iletildi.`,
      date: 'Bugün, Şimdi',
      read: false,
      type: 'system',
      channels: ['sms'],
    };

    updateCurrentSite((site) => ({
      ...site,
      notifications: [newNotif, ...site.notifications],
    }));

    showToast(
      'Şifre SMS Gönderildi',
      `${name} (${phone}) numarasına geçici şifre: ${tempPass} olarak iletildi.`
    );
  };

  const handleVacateUnit = (unitId: string) => {
    updateCurrentSite((site) => ({
      ...site,
      units: site.units.map((u) =>
        u.id === unitId
          ? {
              ...u,
              residentName: 'Boş Daire',
              residentType: 'owner',
              phone: '-',
              email: '-',
              plateNumber: undefined,
              currentBalance: 0,
            }
          : u
      ),
    }));

    showToast('Daire Tahliye Edildi', 'Daire boş duruma getirildi ve bakiye sıfırlandı.');
  };

  const handleRoleChange = (role: UserRole) => {
    setActiveRole(role);
    if (role === 'resident') {
      const residentAccount = users.find((u) => u.role === 'resident') || INITIAL_USERS[3];
      setCurrentUser(residentAccount);
      if (
        activeTab === 'residents' ||
        activeTab === 'registrations' ||
        activeTab === 'audit' ||
        activeTab === 'bank-import' ||
        activeTab === 'marketplace' ||
        activeTab === 'cloud'
      ) {
        setActiveTab('dues');
      }
      showToast(
        'Sakin Moduna Geçildi (Kısıtlı Görünüm)',
        'KVKK Koruma Devrede: Yalnızca kendi dairenizin borçları ve işlemleri görüntülenir.'
      );
    } else if (role === 'manager') {
      const managerAccount =
        users.find((u) => u.role === 'manager' && u.siteId === currentSite.id) || INITIAL_USERS[1];
      setCurrentUser(managerAccount);
      showToast(
        'Yönetici Moduna Dönüldü',
        `${managerAccount.fullName} yönetici yetkileriyle sisteme dönüldü.`
      );
    } else if (role === 'auditor') {
      const auditorAccount = users.find((u) => u.role === 'auditor') || INITIAL_USERS[2];
      setCurrentUser(auditorAccount);
      showToast(
        'Denetçi Moduna Geçildi',
        `${auditorAccount.fullName} denetim yetkileriyle sisteme dönüldü.`
      );
    } else if (role === 'vendor') {
      const vendorAccount =
        users.find((u) => u.role === 'vendor' && u.vendorId === activeVendorId) ||
        users.find((u) => u.role === 'vendor') ||
        INITIAL_USERS.find((u) => u.role === 'vendor');
      if (vendorAccount) {
        setCurrentUser(vendorAccount);
        if (vendorAccount.vendorId) {
          setActiveVendorId(vendorAccount.vendorId);
        }
      }
      showToast(
        'Usta & Tedarikçi Portalı Açıldı',
        `${activeVendor.companyName} (${activeVendor.authorizedPerson}) adına ihaleler, teklif verme masası ve hakediş takibine giriş yapıldı.`
      );
    } else if (role === 'superadmin') {
      const superadminAccount = users.find((u) => u.role === 'superadmin') || INITIAL_USERS[0];
      setCurrentUser(superadminAccount);
    }
  };

  const handleImpersonateResident = (unit: ApartmentUnit) => {
    const residentUser: AppUser = {
      id: `user-resident-${unit.id}`,
      email: unit.email !== '-' ? unit.email : `sakin.${unit.id.toLowerCase()}@zumrutsitesi.com`,
      fullName: unit.residentName,
      phone: unit.phone,
      role: 'resident',
      siteId: currentSite.id,
      unitDisplay: `${unit.block} Blok No:${unit.unitNo}`,
      unitId: unit.id,
      twoFactorEnabled: true,
      twoFactorMethod: 'sms',
    };
    setCurrentUser(residentUser);
    setActiveRole('resident');
    setEditingResidentUnit(null);
    setActiveTab('dues');
    showToast(
      'Sakin Hesabına Geçildi (Kısıtlı Görünüm)',
      `${unit.residentName} (${unit.block} Blok No:${unit.unitNo}) sakini olarak giriş yapıldı. Sadece bu dairenin borçları listelenir.`
    );
  };

  const handleSaveResidentAllowedTabs = (tabs: string[]) => {
    updateCurrentSite((site) => ({
      ...site,
      residentAllowedTabs: tabs,
    }));
    showToast(
      'Sakin Menü İzinleri Güncellendi ✓',
      `Site sakinlerinin erişebileceği menüler kaydedildi (${tabs.length} aktif menü).`
    );
    setShowResidentMenuPermissionsModal(false);
  };

  const handleSubmitRegistration = (newApp: ResidentRegistrationApplication) => {
    setSites((prevSites) =>
      prevSites.map((site) => {
        if (site.id === newApp.siteId) {
          return {
            ...site,
            pendingRegistrations: [newApp, ...site.pendingRegistrations],
            notifications: [
              {
                id: `notif-app-${Date.now()}`,
                title: '📢 Yeni Sakin Kayıt Başvurusu',
                message: `${newApp.fullName}, ${newApp.block} Blok Daire ${newApp.unitNo} için başvurdu. İletişim: 📞 ${newApp.phone} / ✉️ ${newApp.email}`,
                date: 'Bugün, Şimdi',
                read: false,
                type: 'system',
                channels: ['push', 'sms'],
              },
              ...site.notifications,
            ],
          };
        }
        return site;
      })
    );

    showToast(
      'Kayıt Talebi Alındı',
      `${newApp.fullName} (${newApp.block} Blok D:${newApp.unitNo}) başvurusu yönetim onay masasına kaydedildi. Tel: ${newApp.phone} • E-posta: ${newApp.email}`
    );
  };

  const handleApproveRegistration = (applicationId: string) => {
    let applicantName = '';
    let applicantBlock = '';
    let applicantUnit = '';
    let applicantApp: ResidentRegistrationApplication | undefined;

    updateCurrentSite((site) => {
      const app = site.pendingRegistrations.find((a) => a.id === applicationId);
      if (!app) return site;

      applicantName = app.fullName;
      applicantBlock = app.block;
      applicantUnit = app.unitNo;
      applicantApp = app;

      // Update unit resident
      const updatedUnits = site.units.map((u) => {
        if (u.block === app.block && u.unitNo === app.unitNo) {
          return {
            ...u,
            residentName: app.fullName,
            residentType: app.residentType,
            phone: app.phone,
            email: app.email,
          };
        }
        return u;
      });

      // Mark application approved
      const updatedApps = site.pendingRegistrations.map((a) =>
        a.id === applicationId
          ? {
              ...a,
              status: 'approved' as const,
              reviewedDate: new Date().toISOString().split('T')[0],
              reviewedBy: 'Site Yönetimi',
            }
          : a
      );

      // Create notification
      const welcomeNotif: NotificationItem = {
        id: `notif-appr-${Date.now()}`,
        title: '✅ Sakin Kaydı Onaylandı',
        message: `${app.fullName}, ${app.block} Blok Daire ${app.unitNo} daire sakini olarak onaylandı. 📞 ${app.phone} numarasına SMS ile giriş şifresi gönderildi.`,
        date: 'Bugün, Şimdi',
        read: false,
        type: 'system',
        channels: ['push', 'sms'],
      };

      return {
        ...site,
        units: updatedUnits,
        pendingRegistrations: updatedApps,
        notifications: [welcomeNotif, ...site.notifications],
      };
    });

    if (applicantApp) {
      const app = applicantApp;
      const newResidentUser: AppUser = {
        id: `user-res-${Date.now()}`,
        email: app.email.trim(),
        fullName: app.fullName.trim(),
        phone: app.phone.trim(),
        role: 'resident',
        siteId: currentSite.id,
        unitDisplay: `${app.block} Blok D:${app.unitNo}`,
        unitId: `unit-${app.block.toLowerCase()}${app.unitNo}`,
        twoFactorEnabled: true,
        twoFactorMethod: 'sms',
      };

      setUsers((prev) => [
        newResidentUser,
        ...prev.filter((u) => u.email.toLowerCase() !== app.email.trim().toLowerCase()),
      ]);
    }

    showToast(
      'Daire Sakini Onaylandı ✓',
      `${applicantName} (${applicantBlock} Blok D:${applicantUnit}) onaylandı ve kullanıcı hesabı oluşturuldu.`
    );
  };

  const handleRejectRegistration = (applicationId: string, reason: string) => {
    updateCurrentSite((site) => ({
      ...site,
      pendingRegistrations: site.pendingRegistrations.map((a) =>
        a.id === applicationId
          ? {
              ...a,
              status: 'rejected' as const,
              rejectionReason: reason,
              reviewedDate: new Date().toISOString().split('T')[0],
              reviewedBy: 'Site Yönetimi',
            }
          : a
      ),
    }));

    showToast('Başvuru Reddedildi', `Başvuru gerekçesiyle birlikte reddedildi.`);
  };

  // -------------------------------------------------------------
  // BANK EXCEL IMPORT & APARTMENT MATCHING ACTIONS
  // -------------------------------------------------------------

  const handleProcessBankTransaction = (
    tx: BankTransactionMatch,
    targetUnitId: string,
    period: string,
    rememberRule: boolean
  ) => {
    let assignedUnitDisplay = '';
    let assignedResidentName = '';
    const receiptNo = `MAK-${Date.now().toString().slice(-6)}`;

    updateCurrentSite((site) => {
      const targetUnit = site.units.find((u) => u.id === targetUnitId);
      if (!targetUnit) return site;

      assignedUnitDisplay = `${targetUnit.block} Blok No:${targetUnit.unitNo}`;
      assignedResidentName = targetUnit.residentName;

      // 1. Check if an existing pending due exists for this unit
      let updatedDues: DuesRecord[];
      const existingPendingDue = site.dues.find(
        (d) =>
          d.unitId === targetUnitId &&
          (d.status === 'pending' || d.status === 'overdue')
      );

      if (existingPendingDue) {
        updatedDues = site.dues.map((d) =>
          d.id === existingPendingDue.id
            ? {
                ...d,
                status: 'paid' as const,
                paidDate: tx.date,
                paymentMethod: 'bank_transfer' as const,
                receiptNo,
                transactionRef: tx.transactionRef,
                description: `${d.description || d.month} (Banka Havalesi: ${tx.senderName})`,
              }
            : d
        );
      } else {
        const newDue: DuesRecord = {
          id: `due-bank-${Date.now()}`,
          unitId: targetUnit.id,
          unitDisplay: assignedUnitDisplay,
          residentName: assignedResidentName,
          month: period || 'Eylül 2026 Aidatı',
          year: 2026,
          amount: tx.amount,
          lateFee: 0,
          status: 'paid',
          dueDate: tx.date,
          paidDate: tx.date,
          paymentMethod: 'bank_transfer',
          receiptNo,
          transactionRef: tx.transactionRef,
          description: `${period} Banka Havalesi (${tx.senderName})`,
        };
        updatedDues = [newDue, ...site.dues];
      }

      // 2. Update unit balance
      const updatedUnits = site.units.map((u) =>
        u.id === targetUnitId
          ? {
              ...u,
              currentBalance: u.currentBalance + tx.amount,
            }
          : u
      );

      // 3. Update bank transaction status to 'processed'
      const updatedBankTx: BankTransactionMatch[] = (site.bankTransactions || []).map((t) =>
        t.id === tx.id
          ? {
              ...t,
              matchedUnitId: targetUnitId,
              matchStatus: 'processed' as const,
              processedAt: new Date().toISOString(),
              processedReceiptNo: receiptNo,
              targetPeriod: period,
              assignedManager: currentUser?.fullName || 'Site Yöneticisi',
            }
          : t
      );

      // 4. Update matching rules if rememberRule is true
      let updatedRules = site.bankMatchingRules || [];
      if (rememberRule && tx.senderName && tx.senderName !== 'Bilinmeyen Gönderen') {
        const ruleExists = updatedRules.some(
          (r) => r.senderKeyword.toLowerCase() === tx.senderName.toLowerCase()
        );
        if (!ruleExists) {
          updatedRules = [
            ...updatedRules,
            {
              id: `rule-${Date.now()}`,
              senderKeyword: tx.senderName,
              unitId: targetUnitId,
              unitDisplay: `${assignedUnitDisplay} - ${assignedResidentName}`,
              createdAt: new Date().toISOString().split('T')[0],
            },
          ];
        }
      }

      // 5. Official E-Receipt in Archive
      const receiptDoc: ArchiveDocument = {
        id: `doc-receipt-${receiptNo}`,
        title: `E-Tahsilat Makbuzu - ${assignedUnitDisplay} (${period})`,
        category: 'invoice',
        date: tx.date,
        fileNumber: receiptNo,
        fileSize: '412 KB',
        fileFormat: 'PDF',
        tags: ['Makbuz', 'Banka Havalesi', assignedUnitDisplay, period],
        summary: `${tx.senderName} tarafından yapılan ${tx.amount} ₺ tutarındaki banka havalesi tahsilatı. İşlem Ref: ${tx.transactionRef}`,
        verifiedHash: `sha256-receipt-${Date.now()}`,
        uploader: 'Banka Entegrasyon Sistemi',
        accessRole: 'all',
      };

      // 6. Notification / Simulated SMS to Resident
      const residentNotif: NotificationItem = {
        id: `notif-bank-${Date.now()}`,
        title: '💳 Banka Havaleniz Hesabınıza İşlendi',
        message: `Sayın ${assignedResidentName}, ${site.profile.bankName} hesabımıza gelen ${tx.amount} ₺ tutarındaki havaleniz ${assignedUnitDisplay} ${period} aidatınıza işlenmiştir. E-Makbuz No: ${receiptNo}`,
        date: 'Bugün, Şimdi',
        read: false,
        type: 'payment',
        channels: ['sms', 'push'],
      };

      return {
        ...site,
        dues: updatedDues,
        units: updatedUnits,
        bankTransactions: updatedBankTx,
        bankMatchingRules: updatedRules,
        documents: [receiptDoc, ...site.documents],
        notifications: [residentNotif, ...site.notifications],
        profile: {
          ...site.profile,
          operatingFundBalance: site.profile.operatingFundBalance + tx.amount,
        },
      };
    });

    showToast(
      'Banka Havalesi Daireye İşlendi ✓',
      `${assignedResidentName} (${assignedUnitDisplay}) için ${tx.amount} ₺ tahsilat kaydedildi. Makbuz: ${receiptNo}`
    );
  };

  const handleBulkProcessBankTransactions = (
    items: {
      tx: BankTransactionMatch;
      unitId: string;
      period: string;
      rememberRule: boolean;
    }[]
  ) => {
    let totalProcessedAmount = 0;
    const processedCount = items.length;

    updateCurrentSite((site) => {
      let currentDues = [...site.dues];
      let currentUnits = [...site.units];
      let currentBankTx = [...(site.bankTransactions || [])];
      let currentRules = [...(site.bankMatchingRules || [])];
      let newDocs: ArchiveDocument[] = [];
      let newNotifs: NotificationItem[] = [];

      for (const item of items) {
        const { tx, unitId, period, rememberRule } = item;
        const targetUnit = currentUnits.find((u) => u.id === unitId);
        if (!targetUnit) continue;

        totalProcessedAmount += tx.amount;
        const unitDisplay = `${targetUnit.block} Blok No:${targetUnit.unitNo}`;
        const residentName = targetUnit.residentName;
        const receiptNo = `MAK-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

        // Check pending due
        const pendingIdx = currentDues.findIndex(
          (d) =>
            d.unitId === unitId && (d.status === 'pending' || d.status === 'overdue')
        );

        if (pendingIdx !== -1) {
          currentDues[pendingIdx] = {
            ...currentDues[pendingIdx],
            status: 'paid',
            paidDate: tx.date,
            paymentMethod: 'bank_transfer',
            receiptNo,
            transactionRef: tx.transactionRef,
            description: `${currentDues[pendingIdx].description || currentDues[pendingIdx].month} (Banka Havalesi: ${tx.senderName})`,
          };
        } else {
          currentDues.unshift({
            id: `due-bulk-bank-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            unitId: targetUnit.id,
            unitDisplay,
            residentName,
            month: period || 'Eylül 2026 Aidatı',
            year: 2026,
            amount: tx.amount,
            lateFee: 0,
            status: 'paid',
            dueDate: tx.date,
            paidDate: tx.date,
            paymentMethod: 'bank_transfer',
            receiptNo,
            transactionRef: tx.transactionRef,
            description: `${period} Banka Havalesi (${tx.senderName})`,
          });
        }

        // Update unit balance
        currentUnits = currentUnits.map((u) =>
          u.id === unitId ? { ...u, currentBalance: u.currentBalance + tx.amount } : u
        );

        // Update bank tx status
        currentBankTx = currentBankTx.map((t) =>
          t.id === tx.id
            ? {
                ...t,
                matchedUnitId: unitId,
                matchStatus: 'processed' as const,
                processedAt: new Date().toISOString(),
                processedReceiptNo: receiptNo,
                targetPeriod: period,
              }
            : t
        );

        // Update rules
        if (rememberRule && tx.senderName && tx.senderName !== 'Bilinmeyen Gönderen') {
          if (!currentRules.some((r) => r.senderKeyword.toLowerCase() === tx.senderName.toLowerCase())) {
            currentRules.push({
              id: `rule-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              senderKeyword: tx.senderName,
              unitId,
              unitDisplay: `${unitDisplay} - ${residentName}`,
              createdAt: new Date().toISOString().split('T')[0],
            });
          }
        }

        // Doc & Notification
        newDocs.push({
          id: `doc-rcpt-${receiptNo}`,
          title: `E-Tahsilat Makbuzu - ${unitDisplay} (${period})`,
          category: 'invoice',
          date: tx.date,
          fileNumber: receiptNo,
          fileSize: '410 KB',
          fileFormat: 'PDF',
          tags: ['Toplu Havale', unitDisplay, period],
          summary: `${tx.senderName} havale tahsilatı (${tx.amount} ₺)`,
          verifiedHash: `sha256-bulk-${Date.now()}`,
          uploader: 'Banka Entegrasyon Sistemi',
          accessRole: 'all',
        });

        newNotifs.push({
          id: `notif-bulk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          title: '💳 Banka Havaleniz Hesabınıza İşlendi',
          message: `Sayın ${residentName}, ${site.profile.bankName} hesabımıza gelen ${tx.amount} ₺ havaleniz (${period}) işlenmiştir. Makbuz: ${receiptNo}`,
          date: 'Bugün, Şimdi',
          read: false,
          type: 'payment',
          channels: ['sms', 'push'],
        });
      }

      return {
        ...site,
        dues: currentDues,
        units: currentUnits,
        bankTransactions: currentBankTx,
        bankMatchingRules: currentRules,
        documents: [...newDocs, ...site.documents],
        notifications: [...newNotifs, ...site.notifications],
        profile: {
          ...site.profile,
          operatingFundBalance: site.profile.operatingFundBalance + totalProcessedAmount,
        },
      };
    });

    showToast(
      'Toplu Havale Tahsilatı Tamamlandı ✓',
      `${processedCount} adet banka havalesi ilgili dairelere işlendi. Kasaya +${totalProcessedAmount} ₺ aktarıldı.`
    );
  };

  const handleAddMatchingRule = (rule: BankMatchingRule) => {
    updateCurrentSite((site) => ({
      ...site,
      bankMatchingRules: [rule, ...(site.bankMatchingRules || [])],
    }));
    showToast('Kural Eklendi', `"${rule.senderKeyword}" kuralı kaydedildi.`);
  };

  const handleDeleteMatchingRule = (ruleId: string) => {
    updateCurrentSite((site) => ({
      ...site,
      bankMatchingRules: (site.bankMatchingRules || []).filter((r) => r.id !== ruleId),
    }));
    showToast('Kural Silindi', 'Eşleştirme kuralı kaldırıldı.');
  };

  const handleUpdateBankTransactionsList = (newTxList: BankTransactionMatch[]) => {
    updateCurrentSite((site) => ({
      ...site,
      bankTransactions: newTxList,
    }));
  };

  // -------------------------------------------------------------
  // REGIONAL VENDORS & RFQ QUOTE ACTIONS
  // -------------------------------------------------------------

  const handleApproveQuote = (
    request: ServiceQuoteRequest,
    quote: VendorQuote,
    vendor: VendorCompany
  ) => {
    updateCurrentSite((site) => {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
      const contractDocId = `doc-contract-${Date.now()}`;
      const contractFileNo = `SOZ-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      // 1. Update quote requests in site
      const updatedRequests = (site.quoteRequests || []).map((r) => {
        if (r.id === request.id) {
          const updatedQuotes = r.quotes.map((q) => {
            if (q.id === quote.id) {
              return { ...q, status: 'accepted' as const };
            }
            return { ...q, status: 'rejected' as const };
          });
          return {
            ...r,
            status: 'awarded' as const,
            awardedQuoteId: quote.id,
            awardedVendorId: vendor.id,
            awardedVendorName: quote.vendorName,
            awardedAmount: quote.amount,
            awardedDate: dateStr,
            quotes: updatedQuotes,
          };
        }
        return r;
      });

      // 2. Automated Official Notification to Winning Contractor
      const vendorSmsText = `Sayın ${vendor.authorizedPerson} (${quote.vendorName}), ${site.profile.siteName} Yönetimi '${request.title}' işi için verdiğiniz ${quote.amount} ₺ tutarındaki teklifinizi ONAYLAMIŞTIR. İletişim: ${site.profile.emergencyPhone}. Resmi iş sözleşmesi hazırlanmıştır.`;

      const newNotification: NotificationItem = {
        id: `notif-vendor-${Date.now()}`,
        title: `✓ Teklif Onaylandı & Firmaya İletildi: ${quote.vendorName}`,
        message: `${request.title} işi için ${quote.vendorName} (${quote.vendorPhone}) teklifi onaylandı. Firmaya otomatik SMS ve sözleşme onayı iletildi: "${vendorSmsText}"`,
        date: `${dateStr} ${timeStr}`,
        type: 'maintenance',
        read: false,
        channels: ['sms', 'push'],
      };

      // 3. Official Contract Document in Digital Archive
      const contractDoc: ArchiveDocument = {
        id: contractDocId,
        title: `Hizmet Sözleşmesi & Teklif Kabul Tutanağı - ${quote.vendorName} (${request.title})`,
        category: 'contract',
        date: dateStr,
        fileNumber: contractFileNo,
        fileSize: '620 KB',
        fileFormat: 'PDF',
        tags: ['Sözleşme', 'Usta Teklifi', quote.vendorName, request.category],
        summary: `${request.title} kapsamında ${quote.vendorName} tarafından sunulan ${quote.amount} ₺ (KDV ${
          quote.includesVat ? 'Dahil' : 'Hariç'
        }) bedelli teklif kabul edilerek ${quote.warrantyMonths} ay garanti ve ${quote.deliveryDays} gün teslim şartıyla akdedilmiştir.`,
        verifiedHash: `sha256-contract-${Date.now()}`,
        uploader: 'Yönetim Kurulu & Tedarik Masası',
        accessRole: 'all',
      };

      // 4. Create / Update Maintenance Ticket
      const newTicket: MaintenanceTicket = {
        id: `ticket-rfq-${Date.now()}`,
        unitId: 'common-area',
        unitDisplay: 'Ortak Alan',
        residentName: 'Yönetim Kurulu',
        location: 'Site Ortak Alanı / Tesisat Odası',
        category:
          request.category === 'elevator'
            ? 'elevator'
            : request.category === 'plumbing'
            ? 'plumbing'
            : request.category === 'electrical'
            ? 'electrical'
            : 'other',
        title: `[Firma Onaylı] ${request.title} (${quote.vendorName})`,
        description: `İhale bedeli: ${quote.amount} ₺. Firma: ${quote.vendorName} (Yetkili: ${vendor.authorizedPerson} - Tel: ${quote.vendorPhone}). Garanti: ${quote.warrantyMonths} ay. Taahhüt: ${quote.deliveryDays} gün teslim.`,
        status: 'in_progress',
        priority: request.priority === 'urgent' ? 'urgent' : 'high',
        createdAt: dateStr,
        updatedAt: dateStr,
        assignedTechnician: `${quote.vendorName} (${vendor.authorizedPerson})`,
        technicianPhone: quote.vendorPhone,
        cost: quote.amount,
      };

      return {
        ...site,
        quoteRequests: updatedRequests,
        notifications: [newNotification, ...site.notifications],
        documents: [contractDoc, ...site.documents],
        tickets: [newTicket, ...site.tickets],
      };
    });

    showToast(
      'Teklif Onaylandı & Bilgi İletildi',
      `${quote.vendorName} firmasına SMS iletildi, bakım iş emri ve resmi sözleşme oluşturuldu.`
    );
  };

  const handleCreateQuoteRequest = (newRequest: ServiceQuoteRequest) => {
    updateCurrentSite((site) => ({
      ...site,
      quoteRequests: [newRequest, ...(site.quoteRequests || [])],
    }));
    showToast('Teklif Çağrısı Yayınlandı', 'Bölgedeki lisanslı firmalar iş ilanınızı görüntüleyebilir.');
  };

  const handleRegisterVendor = (newVendor: VendorCompany) => {
    setVendors((prev) => [newVendor, ...prev]);
    showToast('Firma / Usta Kaydı Alındı', `${newVendor.companyName} başarıyla sisteme kaydedildi.`);
  };

  const handleSubmitVendorQuote = (requestId: string, newQuote: VendorQuote) => {
    updateCurrentSite((site) => {
      const quoteRequests = (site.quoteRequests || []).map((req) => {
        if (req.id === requestId) {
          const existingIndex = req.quotes.findIndex((q) => q.vendorId === newQuote.vendorId);
          let updatedQuotes: VendorQuote[];
          if (existingIndex >= 0) {
            updatedQuotes = [...req.quotes];
            updatedQuotes[existingIndex] = newQuote;
          } else {
            updatedQuotes = [...req.quotes, newQuote];
          }
          return {
            ...req,
            status: req.status === 'open' ? ('reviewing' as const) : req.status,
            quotes: updatedQuotes,
          };
        }
        return req;
      });

      const newNotif: NotificationItem = {
        id: `notif-rfq-bid-${Date.now()}`,
        title: '💼 Yeni İhale Teklifi Geldi',
        message: `${newQuote.vendorName}, "${requestId}" ihalesine ${newQuote.amount.toLocaleString('tr-TR')} ₺ teklif sundu.`,
        date: 'Bugün, Şimdi',
        read: false,
        type: 'maintenance',
        channels: ['push', 'sms'],
      };

      return {
        ...site,
        quoteRequests,
        notifications: [newNotif, ...site.notifications],
      };
    });

    showToast(
      'Teklifiniz Başarıyla İletildi',
      `${newQuote.amount.toLocaleString('tr-TR')} ₺ tutarındaki teklifiniz site yönetimine sunuldu.`
    );
  };

  const handleUpdateJobProgress = (
    requestId: string,
    progress: 'material_prep' | 'on_site_work' | 'testing' | 'completed'
  ) => {
    updateCurrentSite((site) => ({
      ...site,
      quoteRequests: (site.quoteRequests || []).map((req) =>
        req.id === requestId ? { ...req, workProgressStatus: progress } : req
      ),
    }));

    const progressLabels: Record<string, string> = {
      material_prep: '1. Malzeme Tedariği Aşamasında',
      on_site_work: '2. Sahada Montaj & Tamirat Başladı',
      testing: '3. Test & Kalibrasyon Yapılıyor',
      completed: '4. İşi Teslim Etmeye Hazır',
    };

    showToast('İş Aşaması Güncellendi', progressLabels[progress] || progress);
  };

  const handleCompleteJobFromVendor = (
    requestId: string,
    completionData: {
      completionNotes: string;
      serviceInvoiceNo: string;
      completedAmount: number;
    }
  ) => {
    const req = (currentSite.quoteRequests || []).find((r) => r.id === requestId);
    const now = new Date().toISOString().split('T')[0];

    // Create an official expense record in the site management
    const newExpense: ExpenseRecord = {
      id: `exp-vendor-${Date.now()}`,
      title: `${req?.title || 'Teknik Servis İşi'} - Hakediş & Montaj Bedeli`,
      category: (req?.category as any) || 'maintenance',
      amount: completionData.completedAmount,
      date: now,
      invoiceNo: completionData.serviceInvoiceNo,
      supplier: activeVendor.companyName,
      paidBy: 'Site İşletme / Demirbaş Fonu',
      description: completionData.completionNotes,
      status: 'approved',
      documentName: `${completionData.serviceInvoiceNo}.pdf`,
    };

    updateCurrentSite((site) => ({
      ...site,
      quoteRequests: (site.quoteRequests || []).map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'completed' as const,
              workProgressStatus: 'completed' as const,
              completionNotes: completionData.completionNotes,
              serviceInvoiceNo: completionData.serviceInvoiceNo,
              completedDate: now,
            }
          : r
      ),
      expenses: [newExpense, ...site.expenses],
      tickets: site.tickets.map((t) =>
        t.title.includes(req?.title || '---')
          ? { ...t, status: 'completed' as const, adminNotes: `Usta Notu: ${completionData.completionNotes}` }
          : t
      ),
      notifications: [
        {
          id: `notif-job-done-${Date.now()}`,
          title: '✅ İş Tamamlandı & Hakediş Düzenlendi',
          message: `${activeVendor.companyName}, "${req?.title}" işini başarıyla tamamlayıp ${completionData.serviceInvoiceNo} nolu faturayı teslim etti.`,
          date: 'Bugün, Şimdi',
          read: false,
          type: 'maintenance',
          channels: ['push', 'sms'],
        },
        ...site.notifications,
      ],
    }));

    showToast(
      'İş Tamamlandı & Fatura Kesildi',
      `${activeVendor.companyName} adına ${completionData.serviceInvoiceNo} nolu hakediş faturası site sistemine işlendi.`
    );

    // Otomatik Komisyon Tahakkuku (Firma komisyon tarifesine göre)
    const commRate = activeVendor.commissionRate || 5;
    const isCommissionActive = activeVendor.billingModel !== 'annual_subscription';
    if (isCommissionActive && completionData.completedAmount > 0) {
      const feeAmount = Math.round((completionData.completedAmount * commRate) / 100);
      const autoFee: VendorCommissionFee = {
        id: `fee-auto-${Date.now()}`,
        vendorId: activeVendor.id,
        vendorName: activeVendor.companyName,
        siteId: currentSite.id,
        siteName: currentSite.profile.siteName,
        feeType: 'job_commission',
        jobTitle: req?.title || 'Tamamlanan Şantiye İşi',
        jobAmount: completionData.completedAmount,
        commissionRate: commRate,
        feeAmount,
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'pending',
        invoiceNo: `KOM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        createdAt: now.split(' ')[0],
        notes: `"${currentSite.profile.siteName}" şantiyesindeki "${req?.title}" işi tamamlanınca %${commRate} platform komisyonu yansıtıldı.`,
      };

      setVendors((prev) =>
        prev.map((v) =>
          v.id === activeVendor.id
            ? {
                ...v,
                completedJobsCount: v.completedJobsCount + 1,
                commissionFees: [autoFee, ...(v.commissionFees || [])],
              }
            : v
        )
      );
    } else {
      setVendors((prev) =>
        prev.map((v) =>
          v.id === activeVendor.id
            ? { ...v, completedJobsCount: v.completedJobsCount + 1 }
            : v
        )
      );
    }
  };

  const handleUpdateVendorProfile = (updatedVendor: VendorCompany) => {
    setVendors((prev) => prev.map((v) => (v.id === updatedVendor.id ? updatedVendor : v)));
    showToast('Firma Profili Güncellendi', 'İletişim ve yetki belgesi bilgileriniz güncellendi.');
  };

  const handleSelectVendor = (vendor: VendorCompany) => {
    setActiveVendorId(vendor.id);
    const matchedUser = users.find((u) => u.vendorId === vendor.id);
    if (matchedUser) {
      setCurrentUser(matchedUser);
    } else {
      setCurrentUser({
        id: `user-vendor-${vendor.id}`,
        email: vendor.email,
        fullName: `${vendor.authorizedPerson} (${vendor.companyName})`,
        phone: vendor.phone,
        role: 'vendor',
        siteId: currentSite.id,
        vendorId: vendor.id,
        companyName: vendor.companyName,
        tradeCategory: vendor.category,
        twoFactorEnabled: true,
        twoFactorMethod: 'sms',
      });
    }
    showToast('Firma Değiştirildi', `${vendor.companyName} hesabı aktif edildi.`);
  };

  // -------------------------------------------------------------
  // SUPER ADMIN: PROGRAM / MODÜL & FİRMA YÖNETİM AKSİYONLARI
  // -------------------------------------------------------------
  const handleToggleSiteModule = (siteId: string, moduleId: string) => {
    setSites((prev) =>
      prev.map((site) => {
        if (site.id !== siteId) return site;
        const currentModules = site.enabledModules || modules.map((m) => m.id);
        const isEnabled = currentModules.includes(moduleId);
        const newModules = isEnabled
          ? currentModules.filter((m) => m !== moduleId)
          : [...currentModules, moduleId];
        return {
          ...site,
          enabledModules: newModules,
        };
      })
    );
    const targetSite = sites.find((s) => s.id === siteId);
    const mod = modules.find((m) => m.id === moduleId);
    showToast(
      'Program Durumu Değiştirildi',
      `${targetSite?.profile.siteName || 'Site'} için "${mod?.name || moduleId}" programı güncellendi.`
    );
  };

  const handleAddPlatformModule = (newModule: PlatformProgramModule) => {
    setModules((prev) => [newModule, ...prev]);
    // Also enable by default for all sites
    setSites((prev) =>
      prev.map((site) => ({
        ...site,
        enabledModules: [...(site.enabledModules || modules.map((m) => m.id)), newModule.id],
      }))
    );
    showToast('Yeni Program Platforma Eklendi', `"${newModule.name}" modülü sisteme eklendi ve tüm sitelere tanımlandı.`);
  };

  const handleDeletePlatformModule = (moduleId: string) => {
    setModules((prev) => prev.filter((m) => m.id !== moduleId));
    setSites((prev) =>
      prev.map((site) => ({
        ...site,
        enabledModules: (site.enabledModules || modules.map((m) => m.id)).filter((m) => m !== moduleId),
      }))
    );
    showToast('Program Kaldırıldı', 'Modül platformdan kaldırıldı.');
  };

  const handleToggleVendorStatus = (vendorId: string, reason?: string) => {
    setVendors((prev) =>
      prev.map((v) => {
        if (v.id !== vendorId) return v;
        const willBeSuspended = v.status !== 'suspended';
        return {
          ...v,
          status: willBeSuspended ? 'suspended' : 'active',
          suspendedReason: willBeSuspended ? (reason || 'Süper Admin tarafından kapatıldı / askıya alındı') : undefined,
          suspendedDate: willBeSuspended ? new Date().toISOString().split('T')[0] : undefined,
        };
      })
    );
    const targetVendor = vendors.find((v) => v.id === vendorId);
    const willBeSuspended = targetVendor?.status !== 'suspended';
    showToast(
      willBeSuspended ? 'Firma Kapatıldı / Askıya Alındı' : 'Firma Tekrar Açıldı (Aktif)',
      `${targetVendor?.companyName || 'Firma'} durumu Süper Admin tarafından güncellendi.`
    );
  };

  const handleAddVendor = (newVendor: VendorCompany) => {
    setVendors((prev) => [newVendor, ...prev]);
    showToast('Yeni Firma Kaydedildi', `${newVendor.companyName} sisteme eklendi.`);
  };

  const handleDeleteVendor = (vendorId: string) => {
    setVendors((prev) => prev.filter((v) => v.id !== vendorId));
    showToast('Firma Silindi', 'Firma platformdan silindi.');
  };

  // -------------------------------------------------------------
  // SİTE YÖNETİMİ: FİRMA DEĞERLENDİRME & PUAN VERME
  // -------------------------------------------------------------
  const handleAddVendorReview = (vendorId: string, review: VendorReview) => {
    setVendors((prev) =>
      prev.map((v) => {
        if (v.id !== vendorId) return v;
        const currentReviews = v.reviews || [];
        const updatedReviews = [review, ...currentReviews];
        const totalScore = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
        const newRating = Number((totalScore / updatedReviews.length).toFixed(1));
        return {
          ...v,
          rating: newRating,
          reviews: updatedReviews,
          completedJobsCount: (v.completedJobsCount || 0) + 1,
        };
      })
    );
    showToast(
      'Değerlendirme Kaydedildi ⭐',
      `"${review.siteName}" yönetimi olarak ${review.rating} yıldız başarıyla verildi.`
    );
  };

  // -------------------------------------------------------------
  // DUES, EXPENSES, TICKETS & COMMUNITY ACTIONS (SITE-SPECIFIC)
  // -------------------------------------------------------------

  const handlePaymentSuccess = (paidDue: DuesRecord) => {
    updateCurrentSite((site) => {
      const updatedDues = site.dues.map((d) => (d.id === paidDue.id ? paidDue : d));
      const updatedProfile = {
        ...site.profile,
        operatingFundBalance: site.profile.operatingFundBalance + paidDue.amount,
      };

      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: '💳 Online Aidat Ödemesi Alındı',
        message: `${paidDue.residentName} (${paidDue.unitDisplay}) ${paidDue.month} aidatını (${paidDue.amount} ₺) kart ile ödedi.`,
        date: 'Bugün, Şimdi',
        read: false,
        type: 'payment',
        channels: ['push', 'sms'],
      };

      return {
        ...site,
        dues: updatedDues,
        profile: updatedProfile,
        notifications: [newNotif, ...site.notifications],
      };
    });

    showToast(
      'Online Aidat Tahsil Edildi',
      `${paidDue.unitDisplay} ${paidDue.month} aidatı tahsil edildi. Resmi makbuz hazırlandı.`
    );
    setViewingReceiptDue(paidDue);
  };

  const handleSendReminder = (due: DuesRecord) => {
    const newNotif: NotificationItem = {
      id: `notif-remind-${Date.now()}`,
      title: `📲 Aidat Hatırlatması Gönderildi`,
      message: `${due.residentName} (${due.unitDisplay}) için ${due.month} dönemine ait ${due.amount} ₺ borç hatırlatma SMS'i iletildi.`,
      date: 'Bugün, Şimdi',
      read: false,
      type: 'payment',
      channels: ['push', 'sms'],
    };

    updateCurrentSite((site) => ({
      ...site,
      notifications: [newNotif, ...site.notifications],
    }));

    showToast(
      'SMS Hatırlatması Gönderildi',
      `${due.residentName} (${due.unitDisplay}) cep telefonuna ödeme bağlantısı SMS iletildi.`
    );
  };

  const handleSendUnitReminder = (unit: ApartmentUnit, customMessage?: string) => {
    const overdueAmount = Math.abs(unit.currentBalance);
    const siteName = currentSite.profile.siteName;
    const smsMessage =
      customMessage ||
      `Sayın ${unit.residentName}, ${siteName} ${unit.block} Blok D:${unit.unitNo} no'lu bağımsız bölümünüze ait ${formatCurrency(
        overdueAmount
      )} vadesi geçmiş borcunuz bulunmaktadır. İhtilafları önlemek adına lütfen ödemenizi online portalımızdan gerçekleştiriniz.`;

    const newNotif: NotificationItem = {
      id: `notif-unit-remind-${Date.now()}`,
      title: `📲 Otomatik Ödeme Hatırlatma SMS'i İletildi`,
      message: `${unit.residentName} (${unit.block} Blok D:${unit.unitNo}, ${unit.phone}) nolu telefona borç hatırlatması gönderildi: "${smsMessage}"`,
      date: 'Bugün, Şimdi',
      read: false,
      type: 'payment',
      channels: ['push', 'sms'],
    };

    updateCurrentSite((site) => ({
      ...site,
      notifications: [newNotif, ...site.notifications],
    }));

    showToast(
      'Otomatik Ödeme Hatırlatması Gönderildi',
      `${unit.residentName} (${unit.phone}) adresine gecikmiş bakiye SMS bildirimi başarıyla iletildi.`
    );
  };

  const handleQuickCollectUnit = (
    unit: ApartmentUnit,
    amountToCollect?: number,
    paymentMethod: PaymentMethod = 'cash',
    receiptNo?: string,
    sendSmsNotification: boolean = true
  ) => {
    const overdueAmount =
      amountToCollect !== undefined && amountToCollect > 0
        ? amountToCollect
        : unit.currentBalance < 0
        ? Math.abs(unit.currentBalance)
        : unit.monthlyDues;

    const actualReceiptNo = receiptNo || generateReceiptNo();
    const today = new Date().toISOString().split('T')[0];
    const unitDisplay = `${unit.block} Blok D:${unit.unitNo}`;

    let paidDueRecord: DuesRecord | null = null;

    updateCurrentSite((site) => {
      // 1. Check if there are pending / overdue dues for this unit
      let duesUpdated = false;
      const updatedDues = site.dues.map((d) => {
        if (!duesUpdated && d.unitId === unit.id && (d.status === 'pending' || d.status === 'overdue')) {
          duesUpdated = true;
          paidDueRecord = {
            ...d,
            status: 'paid',
            paidDate: today,
            paymentMethod,
            receiptNo: actualReceiptNo,
            description: `${d.description || d.month} (Hızlı Gişe Tahsilatı - ${actualReceiptNo})`,
          };
          return paidDueRecord;
        }
        return d;
      });

      // If no pending due was found, create a new paid due record
      if (!duesUpdated) {
        paidDueRecord = {
          id: `due-quick-${unit.id}-${Date.now()}`,
          unitId: unit.id,
          unitDisplay,
          residentName: unit.residentName,
          month: 'Eylül 2026',
          year: 2026,
          amount: overdueAmount,
          lateFee: 0,
          status: 'paid',
          dueDate: today,
          paidDate: today,
          paymentMethod,
          receiptNo: actualReceiptNo,
          description: `Vadesi Geçmiş Bakiye Hızlı Tahsilatı (${actualReceiptNo})`,
        };
        updatedDues.unshift(paidDueRecord);
      }

      // 2. Update unit balance: reduce overdue debt (add positive amount or zero out negative balance)
      const updatedUnits = site.units.map((u) => {
        if (u.id === unit.id) {
          const newBalance = u.currentBalance < 0 ? Math.min(0, u.currentBalance + overdueAmount) : u.currentBalance;
          return {
            ...u,
            currentBalance: newBalance,
          };
        }
        return u;
      });

      // 3. Official receipt archive document
      const newDoc: ArchiveDocument = {
        id: `doc-quick-rcpt-${actualReceiptNo}`,
        title: `Hızlı Tahsilat Makbuzu - ${unitDisplay} (${unit.residentName})`,
        category: 'invoice',
        date: today,
        fileNumber: actualReceiptNo,
        fileSize: '380 KB',
        fileFormat: 'PDF',
        tags: ['Hızlı Tahsilat', unitDisplay, actualReceiptNo],
        summary: `${unit.residentName} adına ${overdueAmount} ₺ vadesi geçmiş aidat borcu tahsil edildi. Kasa: ${
          paymentMethod === 'cash' ? 'Nakit Kasa' : paymentMethod === 'bank_transfer' ? 'Banka Havalesi' : 'POS Kart'
        }`,
        verifiedHash: `sha256-quick-${Date.now()}`,
        uploader: 'Site Yönetimi Gişe',
        accessRole: 'all',
      };

      // 4. Notification & SMS
      const smsText = `Sayın ${unit.residentName}, ${site.profile.siteName} ${unitDisplay} nolu dairenize ait ${formatCurrency(
        overdueAmount
      )} tutarındaki vadesi geçmiş aidat borcunuz site yönetimi tarafından tahsil edilmiş ve cari hesabınız kapatılmıştır. Makbuz No: ${actualReceiptNo}`;

      const newNotif: NotificationItem = {
        id: `notif-quick-pay-${Date.now()}`,
        title: '💳 Hızlı Tahsilat Alındı & Borç Kapatıldı',
        message: `${unit.residentName} (${unitDisplay}) için ${overdueAmount} ₺ vadesi geçmiş borç tahsil edildi. Makbuz No: ${actualReceiptNo}${
          sendSmsNotification ? ` [SMS İletildi: "${smsText}"]` : ''
        }`,
        date: 'Bugün, Şimdi',
        read: false,
        type: 'payment',
        channels: sendSmsNotification ? ['push', 'sms'] : ['push'],
      };

      return {
        ...site,
        dues: updatedDues,
        units: updatedUnits,
        documents: [newDoc, ...site.documents],
        notifications: [newNotif, ...site.notifications],
        profile: {
          ...site.profile,
          operatingFundBalance: site.profile.operatingFundBalance + overdueAmount,
        },
      };
    });

    showToast(
      'Hızlı Tahsilat Başarılı ✓',
      `${unit.residentName} (${unitDisplay}) için ${formatCurrency(overdueAmount)} tutarında borç kapatıldı. Makbuz: ${actualReceiptNo}`
    );

    if (paidDueRecord) {
      setViewingReceiptDue(paidDueRecord);
    }
  };

  const handleGenerateBulkDues = () => {
    updateCurrentSite((site) => {
      const nextMonthDues: DuesRecord[] = site.units.map((u) => ({
        id: `due-next-${u.id}-${Date.now()}`,
        unitId: u.id,
        unitDisplay: `${u.block} Blok No:${u.unitNo}`,
        residentName: u.residentName,
        month: 'Ekim 2026',
        year: 2026,
        amount: u.monthlyDues,
        dueDate: '2026-10-15',
        status: 'pending',
        lateFee: 0,
        description: 'Ekim 2026 Genel İşletme Aidatı',
      }));

      return {
        ...site,
        dues: [...nextMonthDues, ...site.dues],
      };
    });

    showToast(
      'Yeni Dönem Aidatları Tahakkuk Edildi',
      `Tüm daireler için aidat borçları oluşturuldu ve SMS/Bildirim iletildi.`
    );
  };

  const handleAddExpense = (newExp: ExpenseRecord) => {
    updateCurrentSite((site) => ({
      ...site,
      expenses: [newExp, ...site.expenses],
      profile:
        newExp.status === 'approved'
          ? {
              ...site.profile,
              operatingFundBalance: Math.max(0, site.profile.operatingFundBalance - newExp.amount),
            }
          : site.profile,
    }));

    showToast(
      'Yeni Gider Kaydedildi',
      `${newExp.title} (${newExp.amount} ₺) fatura arşiviyle birlikte eklendi.`
    );
  };

  const handleAddTicket = (newTicket: MaintenanceTicket) => {
    updateCurrentSite((site) => ({
      ...site,
      tickets: [newTicket, ...site.tickets],
      notifications: [
        {
          id: `notif-ticket-${Date.now()}`,
          title: '🔧 Yeni Arıza Bildirimi',
          message: `${newTicket.residentName} (${newTicket.unitDisplay}): ${newTicket.title}`,
          date: 'Bugün, Şimdi',
          read: false,
          type: 'maintenance',
          channels: ['push'],
        },
        ...site.notifications,
      ],
    }));

    showToast('Arıza Bildirildi', `${newTicket.title} teknik listeye eklendi.`);
  };

  const handleUpdateTicketStatus = (
    ticketId: string,
    newStatus: TicketStatus,
    adminNotes?: string
  ) => {
    updateCurrentSite((site) => ({
      ...site,
      tickets: site.tickets.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              status: newStatus,
              adminNotes: adminNotes || t.adminNotes,
              assignedTechnician:
                newStatus === 'assigned'
                  ? t.assignedTechnician || 'Bina Teknik Servisi'
                  : t.assignedTechnician,
            }
          : t
      ),
    }));

    showToast('Talep Güncellendi', `Arıza durumu "${newStatus}" olarak kaydedildi.`);
  };

  const handleRateTicket = (ticketId: string, rating: number) => {
    updateCurrentSite((site) => ({
      ...site,
      tickets: site.tickets.map((t) => (t.id === ticketId ? { ...t, residentRating: rating } : t)),
    }));
    showToast('Teşekkür Ederiz!', `${rating} yıldız değerlendirmeniz kaydedildi.`);
  };

  const handleAddPost = (newPost: CommunityPost) => {
    updateCurrentSite((site) => ({
      ...site,
      posts: [newPost, ...site.posts],
    }));
    showToast('Paylaşım Yayınlandı', `"${newPost.title}" site panosuna eklendi.`);
  };

  const handleLikePost = (postId: string) => {
    updateCurrentSite((site) => ({
      ...site,
      posts: site.posts.map((p) => {
        if (p.id === postId) {
          const userLiked = !p.userLiked;
          return {
            ...p,
            userLiked,
            likes: userLiked ? p.likes + 1 : p.likes - 1,
          };
        }
        return p;
      }),
    }));
  };

  const handleVotePoll = (postId: string, optionId: string) => {
    updateCurrentSite((site) => ({
      ...site,
      posts: site.posts.map((p) => {
        if (p.id === postId && p.pollOptions) {
          if (p.userVotedOptionId === optionId) return p;
          const updatedOptions = p.pollOptions.map((opt) => {
            if (opt.id === optionId) return { ...opt, votes: opt.votes + 1 };
            if (opt.id === p.userVotedOptionId)
              return { ...opt, votes: Math.max(0, opt.votes - 1) };
            return opt;
          });
          return {
            ...p,
            userVotedOptionId: optionId,
            pollOptions: updatedOptions,
          };
        }
        return p;
      }),
    }));
    showToast('Oyunuz Kaydedildi', 'Anket sonuçları anlık güncellendi.');
  };

  const handleAddComment = (postId: string, content: string) => {
    const authorName =
      activeRole === 'manager'
        ? currentSite.profile.managementBoard[0] || 'Site Yöneticisi'
        : activeRole === 'auditor'
        ? currentSite.profile.auditorName || 'Denetçi'
        : 'Ali Yılmaz';
    const authorUnit =
      activeRole === 'manager'
        ? 'Site Yönetimi'
        : activeRole === 'auditor'
        ? 'Denetim Kurulu'
        : 'B Blok No:14';

    const newComment = {
      id: `comm-${Date.now()}`,
      authorName,
      authorUnit,
      content,
      date: 'Bugün, Şimdi',
    };

    updateCurrentSite((site) => ({
      ...site,
      posts: site.posts.map((p) =>
        p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p
      ),
    }));
  };

  const handleAddDocument = (newDoc: ArchiveDocument) => {
    updateCurrentSite((site) => ({
      ...site,
      documents: [newDoc, ...site.documents],
    }));
    showToast('Evrak Arşive Eklendi', `"${newDoc.title}" güvenli bulut kasasına yüklendi.`);
  };

  const handleSendNotification = (newNotif: NotificationItem) => {
    updateCurrentSite((site) => ({
      ...site,
      notifications: [newNotif, ...site.notifications],
    }));
    showToast(newNotif.title, newNotif.message);
  };

  const handleMarkAllRead = () => {
    updateCurrentSite((site) => ({
      ...site,
      notifications: site.notifications.map((n) => ({ ...n, read: true })),
    }));
    showToast('Bildirimler', 'Tüm bildirimler okundu olarak işaretlendi.');
  };

  const handleTriggerTestPush = () => {
    const samplePushes = [
      {
        title: '🚰 Su Kesintisi Hatırlatması',
        body: 'Bugün 10:00 - 13:00 saatleri arasında hidrofor bakımı yapılacaktır.',
      },
      {
        title: '💳 Aidat Tahsilatı',
        body: 'Aidatınız başarıyla tahsil edilmiştir. Resmi e-makbuzunuz hazırdır.',
      },
      {
        title: '📦 Güvenlikte Kargonuz Var',
        body: 'Daireniz adına Yurtiçi Kargo güvenliğe teslim edilmiştir.',
      },
    ];
    const picked = samplePushes[Math.floor(Math.random() * samplePushes.length)];
    showToast(picked.title, picked.body);
  };

  const handleResetData = () => {
    setSites(INITIAL_TENANT_SITES);
    setCurrentSiteId('site-zumrut');
    showToast('Sistem Sıfırlandı', 'Tüm site verileri orijinal fabrika ayarlarına döndürüldü.');
  };

  // -------------------------------------------------------------
  // CURRENT CONTEXT CALCULATIONS
  // -------------------------------------------------------------
  const isResident = activeRole === 'resident';
  const isSuperAdmin = activeRole === 'superadmin';
  const isAuditor = activeRole === 'auditor';
  const isManager = activeRole === 'manager';
  const isVendor = activeRole === 'vendor';
  const isSiteFrozen = currentSite.license.isSuspended;

  const currentResidentName = isResident
    ? currentUser?.fullName || 'Ali Yılmaz'
    : isAuditor
    ? currentSite.profile.auditorName || 'Av. Selin Aktaş (Denetçi)'
    : currentSite.profile.managementBoard[0] || 'Site Yöneticisi';
  const currentUnitDisplay = isResident
    ? currentUser?.unitDisplay || 'B Blok No:14'
    : isAuditor
    ? 'Denetim Kurulu'
    : 'Site Yönetim Kurulu';

  const pendingDuesCount = currentSite.dues.filter(
    (d) => d.status === 'pending' || d.status === 'overdue'
  ).length;
  const openTicketsCount = currentSite.tickets.filter((t) => t.status !== 'completed').length;
  const unreadNotifsCount = currentSite.notifications.filter((n) => !n.read).length;
  const pendingRegistrationsCount = currentSite.pendingRegistrations.filter(
    (a) => a.status === 'pending'
  ).length;

  const fontSizeClass =
    fontSize === 'xlarge' ? 'text-lg' : fontSize === 'large' ? 'text-base' : 'text-sm';

  // IF USER IS NOT LOGGED IN, RENDER 2FA AUTHENTICATION SCREEN
  if (!currentUser) {
    return (
      <>
        <AuthScreen
          users={users}
          sites={sites}
          onLoginSuccess={handleLoginSuccess}
          onOpenRegisterModal={() => setShowRegisterModal(true)}
        />
        {showRegisterModal && (
          <ResidentRegisterModal
            currentSite={currentSite}
            sites={sites}
            onClose={() => setShowRegisterModal(false)}
            onSubmitApplication={handleSubmitRegistration}
          />
        )}
      </>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors ${
        highContrast
          ? 'bg-black text-white contrast-125'
          : 'bg-slate-100/60 text-slate-800'
      } ${fontSizeClass}`}
    >
      {/* Top Navbar with Tenant Isolation & Authenticated User Session */}
      <Navbar
        sites={sites}
        currentSite={currentSite}
        currentUser={currentUser}
        onSelectSite={handleSelectSite}
        onOpenNewSiteModal={() => setShowNewSiteModal(true)}
        activeRole={activeRole}
        onRoleChange={handleRoleChange}
        onLogout={handleLogout}
        notifications={currentSite.notifications}
        onOpenNotificationCenter={() => {
          if (!isSuperAdmin) setActiveTab('notifications');
        }}
        onOpenCloudModal={() => setShowCloudModal(true)}
        onOpenRegisterModal={() => setShowRegisterModal(true)}
        onOpenResidentPermissionsModal={
          currentUser.role === 'manager' || currentUser.role === 'superadmin'
            ? () => setShowResidentMenuPermissionsModal(true)
            : undefined
        }
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        highContrast={highContrast}
        onToggleHighContrast={() => setHighContrast(!highContrast)}
        onOpenShortcutGuide={() => setShowShortcutsModal(true)}
      />

      {/* RESTRICTED RESIDENT VIEW TEST BANNER */}
      {isResident && !isSuperAdmin && (
        <div className="bg-gradient-to-r from-sky-900 via-indigo-950 to-slate-900 text-white text-xs px-4 py-2 border-b border-sky-700/50 flex flex-wrap items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold">🔒 Kısıtlı Son Kullanıcı / Sakin Modu:</span>
            <span className="text-slate-300">
              Giriş yapılan daire: <strong className="text-white">{currentUnitDisplay} ({currentResidentName})</strong>. KVKK gereği yalnızca kendi borçlarınız görüntülenir.
            </span>
          </div>
          <button
            onClick={() => handleRoleChange('manager')}
            className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-sky-200 hover:text-white rounded-lg border border-white/20 font-semibold transition-colors flex items-center space-x-1"
          >
            <span>Yönetici Moduna Dön &rarr;</span>
          </button>
        </div>
      )}

      {/* DEDICATED CONTRACTOR & VENDOR PORTAL INTERFACE */}
      {isVendor ? (
        <div className="flex-1 w-full">
          <VendorPortalScreen
            currentSite={currentSite}
            vendors={vendors}
            activeVendor={activeVendor}
            quoteRequests={currentSite.quoteRequests || []}
            tickets={currentSite.tickets}
            onSelectVendor={handleSelectVendor}
            onSubmitQuote={handleSubmitVendorQuote}
            onUpdateJobProgress={handleUpdateJobProgress}
            onCompleteJob={handleCompleteJobFromVendor}
            onUpdateTicketStatus={handleUpdateTicketStatus}
            onUpdateVendorProfile={handleUpdateVendorProfile}
            onSwitchRole={handleRoleChange}
          />
        </div>
      ) : isSuperAdmin ? (
        <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          <SuperAdminPanel
            sites={sites}
            vendors={vendors}
            modules={modules}
            onSelectSite={(siteId) => {
              setCurrentSiteId(siteId);
              setActiveRole('manager');
              setActiveTab('overview');
            }}
            onOpenNewSiteModal={() => setShowNewSiteModal(true)}
            onOpenNewInvoiceModal={(targetSiteId) => {
              setInvoicePreselectedSiteId(targetSiteId);
              setShowNewInvoiceModal(true);
            }}
            onViewInvoice={(invoice) => setViewingSaasInvoice(invoice)}
            onToggleSuspendSite={handleToggleSuspendSite}
            onExtendLicense={handleExtendLicense}
            onMarkInvoicePaid={handleMarkInvoicePaid}
            onToggleSiteModule={handleToggleSiteModule}
            onAddPlatformModule={handleAddPlatformModule}
            onDeletePlatformModule={handleDeletePlatformModule}
            onToggleVendorStatus={handleToggleVendorStatus}
            onAddVendor={handleAddVendor}
            onDeleteVendor={handleDeleteVendor}
            onImportSite={handleImportSite}
            onAddVendorFee={handleAddVendorFee}
            onMarkVendorFeePaid={handleMarkVendorFeePaid}
            onUpdateVendorBillingModel={handleUpdateVendorBillingModel}
          />
        </div>
      ) : isSiteFrozen ? (
        /* FROZEN / SUSPENDED SITE LOCKOUT SCREEN */
        <SuspendedSiteScreen
          site={currentSite}
          onOpenSuperAdmin={() => {
            if (currentUser.role === 'superadmin') {
              setActiveRole('superadmin');
            } else {
              showToast('Yetki Sınırı', 'Sadece Süper Admin lisans panelini açabilir.');
            }
          }}
          onUnsuspendSite={(siteId) => handleToggleSuspendSite(siteId)}
        />
      ) : (
        /* REGULAR SITE DASHBOARD (Manager / Auditor / Resident) */
        <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row">
          {/* Left Navigation Sidebar */}
          <Sidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            pendingDuesCount={pendingDuesCount}
            openTicketsCount={openTicketsCount}
            unreadNotifsCount={unreadNotifsCount}
            pendingRegistrationsCount={pendingRegistrationsCount}
            unmatchedBankTxCount={
              (currentSite.bankTransactions || []).filter((t) => t.matchStatus === 'unmatched')
                .length
            }
            activeRfqsCount={
              (currentSite.quoteRequests || []).filter(
                (r) => r.status === 'open' || r.status === 'reviewing'
              ).length
            }
            siteProfile={currentSite.profile}
            siteLicense={currentSite.license}
            isResident={isResident}
            isAuditor={isAuditor}
            enabledModules={currentSite.enabledModules || modules.map((m) => m.id)}
            residentAllowedTabs={currentSite.residentAllowedTabs}
            onOpenResidentPermissionsModal={
              currentUser.role === 'manager' || currentUser.role === 'superadmin'
                ? () => setShowResidentMenuPermissionsModal(true)
                : undefined
            }
          />

          {/* Main Content Area */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0" role="main">
            {isResident && currentSite.residentAllowedTabs && activeTab !== 'overview' && !currentSite.residentAllowedTabs.includes(activeTab) ? (
              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center max-w-xl mx-auto my-12 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                  <PowerOff className="w-8 h-8 text-amber-600" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900">
                    Bu Menü Site Yönetimi Tarafından Sakinlere Kapatılmıştır
                  </h3>
                  <p className="text-xs text-slate-500">
                    Bu bölüm site yönetim kurulu tarafından kat sakinlerinin erişimine geçici olarak kapatılmıştır. Detaylı bilgi için site yönetimiyle iletişime geçebilirsiniz.
                  </p>
                </div>
                <div className="pt-2 flex justify-center gap-2">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Genel Bakışa Dön
                  </button>
                </div>
              </div>
            ) : activeTab !== 'overview' && currentSite.enabledModules && !currentSite.enabledModules.includes(activeTab) ? (
              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center max-w-xl mx-auto my-12 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                  <PowerOff className="w-8 h-8 text-amber-600" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900">
                    Bu Program Siteniz İçin Kapatılmıştır
                  </h3>
                  <p className="text-xs text-slate-500">
                    "{modules.find((m) => m.id === activeTab)?.name || activeTab}" programı Süper Admin tarafından siteniz için geçici olarak devre dışı bırakılmıştır.
                  </p>
                </div>
                <div className="pt-2 flex justify-center gap-2">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
                  >
                    Genel Bakışa Dön
                  </button>
                  {currentUser?.role === 'superadmin' && (
                    <button
                      onClick={() => setActiveRole('superadmin')}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                    >
                      Süper Admin Masasında Aç
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <>
            {activeTab === 'overview' && (
              <OverviewTab
                siteProfile={currentSite.profile}
                isResident={isResident}
                residentName={currentResidentName}
                residentUnitId={currentUser?.unitId || (isResident ? 'unit-b14' : undefined)}
                residentUnitDisplay={currentUnitDisplay}
                dues={currentSite.dues}
                expenses={currentSite.expenses}
                tickets={currentSite.tickets}
                posts={currentSite.posts}
                units={currentSite.units}
                onNavigateTab={setActiveTab}
                onPayDue={(due) => setPayingDue(due)}
                onOpenNewTicket={() => setShowTicketModal(true)}
                onOpenNewExpense={() => setShowExpenseModal(true)}
                onOpenNewPost={() => setShowPostModal(true)}
              />
            )}

            {/* Sakinler & Hesap Yönetimi (Manager Only) */}
            {activeTab === 'residents' && (
              <ResidentsTab
                units={currentSite.units}
                dues={currentSite.dues}
                siteProfile={currentSite.profile}
                isResident={isResident}
                onEditResident={(unit) => setEditingResidentUnit(unit)}
                onSendResetPassword={handleSendResetPassword}
                onImpersonateResident={handleImpersonateResident}
                onOpenResidentPermissionsModal={() => setShowResidentMenuPermissionsModal(true)}
                onOpenRegisterModal={() => setShowRegisterModal(true)}
                onViewReceipt={(due) => setViewingReceiptDue(due)}
                onSendReminder={handleSendUnitReminder}
                onQuickCollect={handleQuickCollectUnit}
              />
            )}

            {/* İkametgah & Sakin Onay Masası (Manager Only) */}
            {activeTab === 'registrations' && (
              <RegistrationsTab
                applications={currentSite.pendingRegistrations}
                onApproveApplication={handleApproveRegistration}
                onRejectApplication={handleRejectRegistration}
                onOpenNewApplicationModal={() => setShowRegisterModal(true)}
              />
            )}

            {/* YENİ: Denetim Masası & Şeffaflık (Auditor & Manager) */}
            {activeTab === 'audit' && (
              <AuditTab
                currentSite={currentSite}
                isAuditor={isAuditor}
                isManager={isManager}
                onOpenAssignAuditorModal={() => setShowAssignAuditorModal(true)}
                onOpenHandoverModal={() => setShowHandoverModal(true)}
                onSubmitAuditReport={handleSubmitAuditReport}
              />
            )}

            {/* YENİ: Excel Banka Ekstresi & Havale Eşleme Masası (Manager Only) */}
            {activeTab === 'bank-import' && (
              <BankImportTab
                currentSite={currentSite}
                onProcessTransaction={handleProcessBankTransaction}
                onBulkProcessTransactions={handleBulkProcessBankTransactions}
                onAddMatchingRule={handleAddMatchingRule}
                onDeleteMatchingRule={handleDeleteMatchingRule}
                onUpdateTransactionsList={handleUpdateBankTransactionsList}
              />
            )}

            {activeTab === 'dues' && (
              <DuesTab
                dues={currentSite.dues}
                isResident={isResident}
                residentUnitId={currentUser?.unitId || (isResident ? 'unit-b14' : undefined)}
                residentName={currentResidentName}
                residentUnitDisplay={currentUnitDisplay}
                onPayDue={(due) => setPayingDue(due)}
                onViewReceipt={(due) => setViewingReceiptDue(due)}
                onSendReminder={handleSendReminder}
                onGenerateBulkDues={handleGenerateBulkDues}
                onNavigateBankImport={() => setActiveTab('bank-import')}
              />
            )}

            {activeTab === 'expenses' && (
              <ExpensesTab
                expenses={currentSite.expenses}
                isResident={isResident}
                onOpenNewExpense={() => setShowExpenseModal(true)}
              />
            )}

            {activeTab === 'budget' && (
              <BudgetTab
                siteProfile={currentSite.profile}
                dues={currentSite.dues}
                expenses={currentSite.expenses}
              />
            )}

            {activeTab === 'maintenance' && (
              <MaintenanceTab
                tickets={currentSite.tickets}
                isResident={isResident}
                residentName={currentResidentName}
                residentUnitDisplay={currentUnitDisplay}
                onOpenNewTicket={() => setShowTicketModal(true)}
                onUpdateTicketStatus={handleUpdateTicketStatus}
                onRateTicket={handleRateTicket}
              />
            )}

            {/* YENİ: Bölgesel Usta & Firma Teklif Masası */}
            {activeTab === 'marketplace' && (
              <MarketplaceTab
                currentSite={currentSite}
                vendors={vendors}
                quoteRequests={currentSite.quoteRequests || []}
                onApproveQuote={handleApproveQuote}
                onCreateQuoteRequest={handleCreateQuoteRequest}
                onRegisterVendor={handleRegisterVendor}
                onOpenVendorPortal={() => handleRoleChange('vendor')}
                onAddVendorReview={handleAddVendorReview}
              />
            )}

            {activeTab === 'community' && (
              <CommunityTab
                posts={currentSite.posts}
                currentResidentName={currentResidentName}
                currentUnitDisplay={currentUnitDisplay}
                isResident={isResident}
                onOpenNewPost={() => setShowPostModal(true)}
                onLikePost={handleLikePost}
                onVotePoll={handleVotePoll}
                onAddComment={handleAddComment}
              />
            )}

            {activeTab === 'archive' && (
              <ArchiveTab
                documents={currentSite.documents}
                isResident={isResident}
                onOpenNewDocument={() => setShowDocumentModal(true)}
                onViewDocument={(doc) => setViewingDoc(doc)}
              />
            )}

            {activeTab === 'notifications' && (
              <NotificationsTab
                notifications={currentSite.notifications}
                isResident={isResident}
                onSendNotification={handleSendNotification}
                onMarkAllRead={handleMarkAllRead}
                onTriggerTestPush={handleTriggerTestPush}
              />
            )}

            {activeTab === 'cloud' && (
              <CloudTab
                siteDataExport={{
                  siteProfile: currentSite.profile,
                  units: currentSite.units,
                  dues: currentSite.dues,
                  expenses: currentSite.expenses,
                  tickets: currentSite.tickets,
                  posts: currentSite.posts,
                  documents: currentSite.documents,
                }}
                onResetData={handleResetData}
              />
            )}
            </>
            )}
          </main>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-700">ApsisCloud Global SaaS</span>
            <span>• 634 Sayılı Kat Mülkiyeti Kanunu ve KVKK Uyumlu İki Aşamalı Giriş ve Denetim</span>
          </div>
          <div className="flex items-center space-x-4">
            {isSuperAdmin && (
              <>
                <button
                  onClick={() => setActiveRole('superadmin')}
                  className="text-amber-700 hover:underline font-bold flex items-center space-x-1"
                >
                  <span>👑 SaaS Admin Paneli</span>
                </button>
                <span>•</span>
              </>
            )}
            <button
              onClick={() => setShowShortcutsModal(true)}
              className="text-indigo-600 hover:underline font-medium"
            >
              Klavye Kısayolları (Alt+1..9)
            </button>
            <span>•</span>
            <button
              onClick={() => setShowCloudModal(true)}
              className="text-emerald-700 hover:underline font-medium"
            >
              Bulut Durumu: 2FA & 256-Bit SSL
            </button>
          </div>
        </div>
      </footer>

      {/* YENİ: Alt Kısımda Yapay Zekalı Asistan (ApsisAI - KMK & Sistem Danışmanı) */}
      <AIAssistantWidget
        currentSite={currentSite}
        activeRole={activeRole}
        onNavigateTab={(tab) => setActiveTab(tab as ActiveTab)}
      />

      {/* ----------------- MODALS ----------------- */}

      {/* Payment & Receipt Modals */}
      {payingDue && (
        <PaymentModal
          due={payingDue}
          siteProfile={currentSite.profile}
          onClose={() => setPayingDue(null)}
          onPaymentComplete={handlePaymentSuccess}
        />
      )}

      {viewingReceiptDue && (
        <ReceiptModal
          receipt={viewingReceiptDue}
          siteProfile={currentSite.profile}
          onClose={() => setViewingReceiptDue(null)}
        />
      )}

      {/* Site Management Modals */}
      {showExpenseModal && (
        <NewExpenseModal
          onClose={() => setShowExpenseModal(false)}
          onAddExpense={handleAddExpense}
        />
      )}

      {showTicketModal && (
        <NewTicketModal
          currentUnitId={isResident ? 'unit-b14' : 'unit-a1'}
          currentResidentName={currentResidentName}
          currentUnitDisplay={currentUnitDisplay}
          onClose={() => setShowTicketModal(false)}
          onAddTicket={handleAddTicket}
        />
      )}

      {showPostModal && (
        <NewPostModal
          currentResidentName={currentResidentName}
          currentUnitDisplay={currentUnitDisplay}
          isManager={activeRole === 'manager'}
          onClose={() => setShowPostModal(false)}
          onAddPost={handleAddPost}
        />
      )}

      {showDocumentModal && (
        <NewDocumentModal
          currentUploader={currentResidentName}
          onClose={() => setShowDocumentModal(false)}
          onAddDocument={handleAddDocument}
        />
      )}

      {viewingDoc && (
        <DocumentViewerModal doc={viewingDoc} onClose={() => setViewingDoc(null)} />
      )}

      {showCloudModal && (
        <CloudSecurityModal
          onClose={() => setShowCloudModal(false)}
          siteDataExport={{
            siteProfile: currentSite.profile,
            units: currentSite.units,
            dues: currentSite.dues,
            expenses: currentSite.expenses,
            tickets: currentSite.tickets,
            posts: currentSite.posts,
            documents: currentSite.documents,
          }}
        />
      )}

      {showShortcutsModal && <ShortcutsModal onClose={() => setShowShortcutsModal(false)} />}

      {/* Resident Account Intervention Modal */}
      {editingResidentUnit && (
        <EditResidentModal
          unit={editingResidentUnit}
          onClose={() => setEditingResidentUnit(null)}
          onUpdateUnit={handleUpdateUnit}
          onSendResetPassword={handleSendResetPassword}
          onVacateUnit={handleVacateUnit}
          onImpersonateResident={handleImpersonateResident}
        />
      )}

      {/* Resident Menu Permissions Modal (Yönetici Sakin Menü İzin Masası) */}
      {showResidentMenuPermissionsModal && (
        <ResidentMenuPermissionsModal
          siteName={currentSite.profile.siteName}
          allowedTabs={currentSite.residentAllowedTabs}
          onClose={() => setShowResidentMenuPermissionsModal(false)}
          onSaveAllowedTabs={handleSaveResidentAllowedTabs}
        />
      )}

      {/* Resident Registration Application Modal */}
      {showRegisterModal && (
        <ResidentRegisterModal
          currentSite={currentSite}
          sites={sites}
          onClose={() => setShowRegisterModal(false)}
          onSubmitApplication={handleSubmitRegistration}
        />
      )}

      {/* Management Handover Modal (Yönetici Devri) */}
      {showHandoverModal && (
        <ManagementHandoverModal
          currentSite={currentSite}
          currentManagerName={currentSite.profile.managementBoard[0] || 'Kemal Ersoy'}
          currentManagerEmail={currentUser.email}
          onClose={() => setShowHandoverModal(false)}
          onExecuteHandover={handleExecuteHandover}
        />
      )}

      {/* Assign Auditor Modal (Denetçi Ekle & Yetkilendir) */}
      {showAssignAuditorModal && (
        <AssignAuditorModal
          currentSite={currentSite}
          currentManagerName={currentSite.profile.managementBoard[0] || 'Kemal Ersoy'}
          onClose={() => setShowAssignAuditorModal(false)}
          onAssignAuditor={handleAssignAuditor}
        />
      )}

      {/* SaaS: Add New Site Modal */}
      {showNewSiteModal && (
        <NewSiteModal
          onClose={() => setShowNewSiteModal(false)}
          onAddSite={handleAddTenantSite}
        />
      )}

      {/* SaaS: Issue Annual Invoice Modal */}
      {showNewInvoiceModal && (
        <NewSaasInvoiceModal
          sites={sites}
          preselectedSiteId={invoicePreselectedSiteId}
          onClose={() => {
            setShowNewInvoiceModal(false);
            setInvoicePreselectedSiteId(undefined);
          }}
          onAddInvoice={handleAddSaasInvoice}
        />
      )}

      {/* SaaS: View Official E-Invoice Modal */}
      {viewingSaasInvoice && (
        <SaasInvoiceViewerModal
          invoice={viewingSaasInvoice}
          onClose={() => setViewingSaasInvoice(null)}
        />
      )}

      {/* Mobile Push Toast Notification */}
      {pushToast && (
        <MobilePushToast
          title={pushToast.title}
          body={pushToast.body}
          onClose={() => setPushToast(null)}
        />
      )}
    </div>
  );
}
