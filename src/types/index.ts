export type BlockId = 'A' | 'B' | 'C';

export type PaymentStatus = 'paid' | 'pending' | 'overdue';

export type PaymentMethod = 'credit_card' | 'bank_transfer' | 'cash';

export interface ApartmentUnit {
  id: string;
  block: BlockId;
  unitNo: string;
  floor: number;
  residentName: string;
  residentType: 'owner' | 'tenant'; // Ev Sahibi / Kiracı
  phone: string;
  email: string;
  monthlyDues: number;
  currentBalance: number; // Negatif ise borçlu, 0 ise ödendi, pozitif ise avans
  plateNumber?: string;
  grossM2: number;
  landShare: number; // Arsa payı
}

export interface DuesRecord {
  id: string;
  unitId: string;
  unitDisplay: string; // e.g., "A Blok - D:12"
  residentName: string;
  month: string; // "Mart 2025"
  year: number;
  amount: number;
  lateFee: number; // Gecikme faizi
  status: PaymentStatus;
  dueDate: string;
  paidDate?: string;
  paymentMethod?: PaymentMethod;
  receiptNo?: string;
  transactionRef?: string;
  description: string;
}

export type ExpenseCategory =
  | 'elevator' // Asansör Bakımı
  | 'cleaning' // Temizlik & Hijyen
  | 'security' // Güvenlik & Kamera
  | 'energy' // Ortak Alan Elektrik/Su/Doğalgaz
  | 'garden' // Bahçe & Peyzaj
  | 'personnel' // Personel Maaş & SGK
  | 'maintenance' // Tamirat & Demirbaş
  | 'administrative'; // Yönetim & Hukuk / Muhasebe

export interface ExpenseRecord {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  invoiceNo: string;
  supplier: string;
  paidBy: string;
  description: string;
  status: 'approved' | 'pending_approval';
  documentName?: string;
}

export type TicketCategory =
  | 'elevator'
  | 'plumbing'
  | 'electrical'
  | 'gate'
  | 'landscape'
  | 'cleaning'
  | 'noise'
  | 'other';

export type TicketPriority = 'urgent' | 'high' | 'normal' | 'low';

export type TicketStatus = 'submitted' | 'in_review' | 'assigned' | 'in_progress' | 'completed';

export interface MaintenanceTicket {
  id: string;
  unitId: string;
  unitDisplay: string;
  residentName: string;
  category: TicketCategory;
  title: string;
  description: string;
  location: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  assignedTechnician?: string;
  technicianPhone?: string;
  cost?: number;
  adminNotes?: string;
  residentRating?: number;
  photoUrl?: string;
}

export type PostType = 'announcement' | 'marketplace' | 'poll' | 'help' | 'discussion';

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface CommunityPost {
  id: string;
  authorName: string;
  authorUnit: string;
  authorRole: 'manager' | 'resident';
  type: PostType;
  title: string;
  content: string;
  date: string;
  pinned?: boolean;
  urgent?: boolean;
  likes: number;
  userLiked?: boolean;
  comments: Array<{
    id: string;
    authorName: string;
    authorUnit: string;
    content: string;
    date: string;
  }>;
  pollOptions?: PollOption[];
  userVotedOptionId?: string;
  price?: string; // İkinci el eşya / ilan için
  contactPhone?: string;
}

export type DocumentCategory =
  | 'decision_book' // Karar Defteri
  | 'contract' // Sözleşmeler
  | 'invoice' // Faturalar ve Dekontlar
  | 'insurance' // Sigorta Poliçeleri
  | 'blueprint' // Mimari / Tesisat Projeleri
  | 'audit_report'; // Denetim Raporları

export interface ArchiveDocument {
  id: string;
  title: string;
  category: DocumentCategory;
  date: string;
  fileNumber: string; // Karar No / Belge Kayıt No
  fileSize: string;
  fileFormat: 'PDF' | 'DWG' | 'JPG';
  tags: string[];
  summary: string;
  verifiedHash: string; // SHA-256 dijital mühür simülasyonu
  uploader: string;
  accessRole: 'all' | 'owners_only' | 'management_only';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'payment' | 'announcement' | 'maintenance' | 'system' | 'poll';
  channels: ('push' | 'sms' | 'email')[];
  actionLink?: string;
}

export interface SiteProfile {
  siteName: string;
  address: string;
  city: string;
  taxNumber: string;
  taxOffice: string;
  bankName: string;
  iban: string;
  accountHolder: string;
  totalBlocks: number;
  totalFlats: number;
  managementBoard: string[];
  auditorName: string;
  reserveFundBalance: number; // Demirbaş fonu
  operatingFundBalance: number; // İşletme fonu
  emergencyPhone: string;
}

// --- SaaS PLATFORM & MULTI-TENANT TYPES ---

export type SaaSLicenseStatus = 'active' | 'grace_period' | 'suspended';

export interface SaaSLicense {
  planName: string; // e.g., 'Kurumsal Profesyonel Paket'
  planTier: 'starter' | 'professional' | 'enterprise' | 'demo';
  yearlyPrice: number; // e.g., 24000 ₺
  currency: string;
  startDate: string; // '2025-05-15'
  expiresAt: string; // '2026-11-15'
  isSuspended: boolean; // Donduruldu mu?
  suspensionReason?: string; // e.g., '2026 Yıllık SaaS Lisans Faturası Ödenmedi'
  suspendedAt?: string;
  autoRenew: boolean;
  contactEmail: string;
  contactPhone: string;
  isDemo?: boolean; // 1 Aylık Ücretsiz Demo Sürümü mü?
  trialDaysRemaining?: number;
}

export type SaasInvoiceStatus = 'paid' | 'pending' | 'overdue';

export interface SaaSInvoice {
  id: string;
  invoiceNumber: string; // 'APS-2026-0089'
  siteId: string;
  siteName: string;
  taxNumber: string;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  amount: number;
  taxRate: number; // e.g., 0.20
  taxAmount: number;
  totalAmount: number;
  period: string; // e.g., '2026 - 2027 Yıllık Platform Lisansı'
  status: SaasInvoiceStatus;
  paymentMethod?: string;
  notes?: string;
}

export type RegistrationStatus = 'pending' | 'approved' | 'rejected';

export interface ResidentRegistrationApplication {
  id: string;
  siteId: string;
  fullName: string;
  tcNo: string;
  phone: string;
  email: string;
  block: BlockId;
  unitNo: string;
  residentType: 'owner' | 'tenant';
  documentType: 'title_deed' | 'lease_contract' | 'residence_certificate';
  documentName: string;
  status: RegistrationStatus;
  applicationDate: string;
  reviewedDate?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  notes?: string;
}

export interface BankMatchingRule {
  id: string;
  senderKeyword: string;
  unitId: string;
  unitDisplay: string;
  createdAt: string;
}

export type BankMatchStatus = 'auto_matched' | 'unmatched' | 'manually_assigned' | 'processed';

export interface BankTransactionMatch {
  id: string;
  date: string;
  senderName: string;
  senderIban?: string;
  description: string;
  amount: number;
  transactionRef: string;
  matchedUnitId?: string;
  matchStatus: BankMatchStatus;
  matchConfidence?: number; // e.g. 95%
  suggestedReason?: string;
  targetPeriod: string; // e.g. 'Eylül 2026 Aidatı'
  rememberRule?: boolean;
  processedAt?: string;
  processedReceiptNo?: string;
  assignedManager?: string;
}

export interface TenantSite {
  id: string;
  slug: string;
  profile: SiteProfile;
  license: SaaSLicense;
  units: ApartmentUnit[];
  dues: DuesRecord[];
  expenses: ExpenseRecord[];
  tickets: MaintenanceTicket[];
  posts: CommunityPost[];
  documents: ArchiveDocument[];
  notifications: NotificationItem[];
  pendingRegistrations: ResidentRegistrationApplication[];
  saasInvoices: SaaSInvoice[];
  auditors?: SiteAuditor[];
  auditReports?: AuditInspectionReport[];
  handoverHistory?: ManagementHandoverRecord[];
  bankTransactions?: BankTransactionMatch[];
  bankMatchingRules?: BankMatchingRule[];
  quoteRequests?: ServiceQuoteRequest[];
  enabledModules?: string[]; // Super Admin tarafından aktif edilen modüller/programlar
  customModules?: PlatformProgramModule[]; // Super Admin tarafından eklenen özel programlar
  residentAllowedTabs?: string[]; // Site Yönetimi tarafından sakinlerin görmesine izin verilen menüler
}

export type UserRole = 'superadmin' | 'manager' | 'auditor' | 'resident' | 'vendor';

export interface AppUser {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: UserRole;
  siteId?: string; // 'all' for superadmin, specific siteId for manager/auditor/resident
  unitDisplay?: string; // e.g. "B Blok No:14"
  unitId?: string;
  vendorId?: string; // e.g. 'ven-2'
  companyName?: string; // e.g. 'Özkan Hidrofor & Isı Sistemleri'
  tradeCategory?: VendorTradeCategory;
  twoFactorEnabled: boolean;
  twoFactorMethod: 'sms' | 'authenticator' | 'email';
}

export interface ManagementHandoverRecord {
  id: string;
  siteId: string;
  previousManagerName: string;
  previousManagerEmail: string;
  newManagerName: string;
  newManagerEmail: string;
  newManagerPhone: string;
  newManagerTcNo: string;
  decisionNumber: string; // Genel Kurul Karar Defteri No
  handoverDate: string;
  notes: string;
  documentTitle?: string;
}

export interface SiteAuditor {
  id: string;
  siteId: string;
  fullName: string;
  email: string;
  phone: string;
  appointedDate: string;
  appointedBy: string;
  status: 'active' | 'inactive';
  notes?: string;
}

export interface AuditInspectionReport {
  id: string;
  siteId: string;
  auditorName: string;
  auditorEmail: string;
  inspectionPeriod: string; // e.g., "2026 Yılı 1. Dönem Denetim Raporu"
  reportDate: string;
  financialEvaluation: 'approved' | 'approved_with_notes' | 'rejected';
  findingsSummary: string;
  totalIncomeInspected: number;
  totalExpenseInspected: number;
  discrepanciesAmount: number;
  recommendations: string;
  decisionHash: string;
}

// -------------------------------------------------------------
// REGIONAL CONTRACTORS, VENDORS & RFQ QUOTE SYSTEM
// -------------------------------------------------------------

export type VendorTradeCategory =
  | 'elevator' // Asansör Bakım & Revizyon
  | 'plumbing' // Su, Isı & Hidrofor Tesisatı
  | 'electrical' // Elektrik, Jeneratör & Aydınlatma
  | 'painting_facade' // Dış Cephe, Mantolama & Boya
  | 'security_camera' // Kamera, Yangın & Güvenlik
  | 'gardening_landscape' // Bahçe & Peyzaj
  | 'cleaning' // Temizlik & İlaçlama
  | 'roof_insulation'; // Çatı & İzolasyon

export interface VendorReview {
  id: string;
  vendorId: string;
  siteId: string;
  siteName: string;
  managerName: string;
  rating: number; // 1 to 5
  date: string;
  jobTitle: string; // e.g. "Hidrofor Basınç Tankı Değişimi"
  comment: string;
  criteriaRatings?: {
    quality: number; // İşçilik Kalitesi (1-5)
    timing: number; // Zamanında Teslimat (1-5)
    pricing: number; // Fiyat & Hakediş Uygunluğu (1-5)
    communication: number; // İletişim & Nezaket (1-5)
  };
}

export interface PlatformProgramModule {
  id: string;
  name: string;
  category: 'core' | 'finance' | 'technical' | 'community' | 'compliance' | 'addon';
  description: string;
  iconName: string;
  isCore?: boolean;
  defaultEnabled?: boolean;
  author?: string;
  version?: string;
}

export interface VendorCompany {
  id: string;
  companyName: string;
  authorizedPerson: string; // Yetkili usta veya şirket müdürü
  category: VendorTradeCategory;
  city: string; // e.g. "İstanbul"
  districts: string[]; // e.g. ["Kadıköy", "Ataşehir", "Üsküdar", "Maltepe"]
  phone: string;
  email: string;
  address: string;
  taxNumber?: string;
  taxOffice?: string;
  certNumber?: string; // Mesleki Yeterlilik / TSE No
  rating: number; // 4.8 / 5
  completedJobsCount: number;
  isVerified: boolean;
  avatarUrl?: string;
  notes?: string;
  registeredDate: string;
  iban?: string; // Hakediş ödemeleri için IBAN
  emergencyAvailable?: boolean; // 7/24 Acil Nöbetçi Servis
  servicesOffered?: string[]; // Sunduğu hizmetler listesi
  status?: 'active' | 'suspended'; // Super admin tarafından açma / kapatma
  suspendedReason?: string;
  suspendedDate?: string;
  reviews?: VendorReview[];
  billingModel?: VendorBillingModel; // 'commission' (İş başı %) | 'annual_subscription' (Sabit yıllık) | 'hybrid'
  commissionRate?: number; // Yüzde e.g. 5 (%)
  annualSubscriptionFee?: number; // e.g. 4800 ₺ / Yıl
  subscriptionExpiresAt?: string; // e.g. '2027-01-01'
  commissionFees?: VendorCommissionFee[];
}

export type VendorBillingModel = 'commission' | 'annual_subscription' | 'hybrid';

export interface VendorCommissionFee {
  id: string;
  vendorId: string;
  vendorName: string;
  siteId?: string;
  siteName?: string;
  feeType: 'job_commission' | 'annual_subscription';
  jobTitle?: string;
  jobAmount?: number;
  commissionRate?: number; // e.g. 5 (%)
  feeAmount: number; // e.g. 750 ₺
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  paidDate?: string;
  paymentMethod?: string;
  invoiceNo?: string;
  createdAt: string;
  notes?: string;
}

export interface VendorQuote {
  id: string;
  requestId: string;
  vendorId: string;
  vendorName: string;
  vendorCategory: VendorTradeCategory;
  vendorPhone: string;
  vendorEmail: string;
  vendorRating: number;
  isVerifiedVendor: boolean;
  amount: number;
  currency: 'TRY';
  includesVat: boolean; // KDV Dahil mi?
  deliveryDays: number; // Teslimat / Tamamlama süresi (gün)
  warrantyMonths: number; // Garanti süresi (ay)
  materialQuality: string; // Örn. "TSE Belgeli 1. Sınıf Malzeme"
  notes: string;
  submittedDate: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface ServiceQuoteRequest {
  id: string;
  siteId: string;
  siteName: string;
  title: string;
  category: VendorTradeCategory;
  description: string;
  priority: 'urgent' | 'normal' | 'low';
  estimatedBudget?: number;
  deadline: string;
  status: 'open' | 'reviewing' | 'awarded' | 'completed';
  awardedQuoteId?: string;
  awardedVendorId?: string;
  awardedVendorName?: string;
  awardedAmount?: number;
  awardedDate?: string;
  managerNotes?: string;
  quotes: VendorQuote[];
  createdAt: string;
  workProgressStatus?: 'material_prep' | 'on_site_work' | 'testing' | 'completed';
  completionNotes?: string;
  completedDate?: string;
  serviceInvoiceNo?: string;
}


