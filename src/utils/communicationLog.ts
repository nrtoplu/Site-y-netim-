/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ApartmentUnit, SiteProfile } from '../types';
import { formatCurrency, formatDate } from './formatters';

export type CommunicationChannel = 'sms' | 'push' | 'legal_notice' | 'email' | 'call_note';
export type CommunicationDeliveryStatus = 'delivered' | 'read' | 'pending' | 'failed';

export interface CommunicationLogEntry {
  id: string;
  unitId: string;
  residentName: string;
  recipientPhone?: string;
  recipientEmail?: string;
  channel: CommunicationChannel;
  title: string;
  message: string;
  sentAt: string; // YYYY-MM-DD
  timeStr: string; // HH:mm
  sender: string;
  status: CommunicationDeliveryStatus;
  deliveryCode?: string;
  category?: 'payment_reminder' | 'legal_notice' | 'announcement' | 'maintenance' | 'system';
  meta?: {
    overdueAmount?: number;
    noticeRef?: string;
    actionUrl?: string;
    operatorResponse?: string;
  };
}

/**
 * Returns pre-seeded realistic communication history for a unit
 */
export const getInitialUnitCommunicationLog = (
  unit: ApartmentUnit,
  siteProfile?: SiteProfile
): CommunicationLogEntry[] => {
  const siteName = siteProfile?.siteName || 'Zümrüt Park Konutları';
  const managerName = siteProfile?.managementBoard?.[0] || 'Kemal Ersoy (Yönetici)';
  const phone = unit.phone || '0532 000 00 00';
  const email = unit.email || `${unit.unitNo.toLowerCase()}@site.com`;
  const isDebtor = unit.currentBalance < 0;
  const overdueDebt = Math.abs(unit.currentBalance);

  const logs: CommunicationLogEntry[] = [];

  // Common Announcement: General Assembly
  logs.push({
    id: `comm-ga-${unit.id}`,
    unitId: unit.id,
    residentName: unit.residentName,
    recipientPhone: phone,
    channel: 'push',
    title: 'Olağan Genel Kurul Toplantı Çağrısı',
    message: `Sayın ${unit.residentName}, ${siteName} 2025 Yılı Olağan Genel Kurul Toplantısı 20 Nisan 2025 Pazar günü saat 14:00'da Site Sosyal Tesislerinde yapılacaktır. Katılımınız önemle rica olunur.`,
    sentAt: '2025-03-10',
    timeStr: '11:15',
    sender: `${siteName} Yönetim Kurulu`,
    status: 'read',
    deliveryCode: 'FCM-PUSH-200',
    category: 'announcement',
  });

  // Common Maintenance: Elevator Inspection
  logs.push({
    id: `comm-maint-${unit.id}`,
    unitId: unit.id,
    residentName: unit.residentName,
    recipientPhone: phone,
    channel: 'sms',
    title: 'Planlı Asansör Bakımı ve Yeşil Etiket Denetimi',
    message: `Sayın Sakinimiz (${unit.block} Blok D:${unit.unitNo}), 14 Mart Cuma günü 10:00-14:00 saatleri arasında blok asansörlerimizde A Tipi Muayene Kuruluşu periyodik denetimi yapılacaktır. Anlayışınız için teşekkür ederiz.`,
    sentAt: '2025-03-12',
    timeStr: '09:40',
    sender: 'Sistem Otomasyonu',
    status: 'delivered',
    deliveryCode: 'GSM-BULK-9182',
    category: 'maintenance',
  });

  if (isDebtor) {
    // 1. Initial soft reminder SMS
    logs.push({
      id: `comm-remind-1-${unit.id}`,
      unitId: unit.id,
      residentName: unit.residentName,
      recipientPhone: phone,
      channel: 'sms',
      title: 'Vade Hatırlatma SMS Bildirimi',
      message: `Sayın ${unit.residentName}, ${siteName} ${unit.block} Blok D:${unit.unitNo} no'lu bağımsız bölümünüze ait aidat ödeme vadesi 15 Mart'tır. Ödemelerinizi online portalımızdan veya site yönetim hesabına gerçekleştirebilirsiniz.`,
      sentAt: '2025-03-14',
      timeStr: '13:20',
      sender: managerName,
      status: 'read',
      deliveryCode: 'GSM-VOD-7721',
      category: 'payment_reminder',
      meta: {
        overdueAmount: overdueDebt,
        actionUrl: `https://apsiscloud.com/portal/pay/${unit.id}`,
      },
    });

    // 2. Overdue payment reminder SMS
    logs.push({
      id: `comm-remind-2-${unit.id}`,
      unitId: unit.id,
      residentName: unit.residentName,
      recipientPhone: phone,
      channel: 'sms',
      title: 'Gecikmiş Aidat Hatırlatma SMS\'i (KMK 20)',
      message: `Sayın ${unit.residentName}, ${siteName} ${unit.block} Blok D:${unit.unitNo} no'lu dairenize ait ${formatCurrency(
        overdueDebt
      )} tutarında vadesi geçmiş borcunuz bulunmaktadır. İhtilafları ve gecikme tazminatını önlemek için ödemenizi tamamlayınız: https://apsiscloud.com/portal/pay/${unit.id}`,
      sentAt: '2025-03-18',
      timeStr: '15:45',
      sender: managerName,
      status: 'delivered',
      deliveryCode: 'GSM-TURKCELL-8829',
      category: 'payment_reminder',
      meta: {
        overdueAmount: overdueDebt,
        operatorResponse: 'DELIVERED_TO_HANDSET',
      },
    });

    // 3. Urgent push notification
    logs.push({
      id: `comm-push-debt-${unit.id}`,
      unitId: unit.id,
      residentName: unit.residentName,
      recipientPhone: phone,
      channel: 'push',
      title: '⚠️ Bakiye İhtarı: Vadesi Geçmiş Aidat Borcu',
      message: `${unit.block} Blok D:${unit.unitNo} carinizde ${formatCurrency(
        overdueDebt
      )} gecikmiş bakiye tespit edilmiştir. KMK Md. 20 uyarınca aylık %5 gecikme zammı işletilmektedir.`,
      sentAt: '2025-03-22',
      timeStr: '10:05',
      sender: 'Finans Servisi',
      status: 'delivered',
      deliveryCode: 'FCM-PRIORITY-HIGH',
      category: 'payment_reminder',
    });

    // 4. Phone negotiation / call note
    logs.push({
      id: `comm-call-${unit.id}`,
      unitId: unit.id,
      residentName: unit.residentName,
      recipientPhone: phone,
      channel: 'call_note',
      title: 'Yönetim Bakiye Mutabakatı Telefon Görüşmesi',
      message: `Sakin ile borç bakiyesi konusunda telefon görüşmesi gerçekleştirildi. Sakin maaş gününde (ayın 28'inde) ödemenin tamamını yapacağını beyan etti. Süreç takip edilmektedir.`,
      sentAt: '2025-03-23',
      timeStr: '16:30',
      sender: managerName,
      status: 'delivered',
      category: 'system',
    });
  } else {
    // Settled resident: payment confirmation SMS
    logs.push({
      id: `comm-pay-ok-${unit.id}`,
      unitId: unit.id,
      residentName: unit.residentName,
      recipientPhone: phone,
      channel: 'sms',
      title: 'Aidat Tahsilat ve Makbuz Bildirimi (SMS)',
      message: `Sayın ${unit.residentName}, ${unit.block} Blok D:${unit.unitNo} aidat ödemeniz site kurumsal hesabına intikal etmiştir. Resmi e-makbuzunuz hazırlanmış olup portalınızdan görüntülenebilir. Teşekkür ederiz.`,
      sentAt: '2025-03-08',
      timeStr: '14:22',
      sender: 'Muhasebe Servisi',
      status: 'delivered',
      deliveryCode: 'GSM-POS-OK-112',
      category: 'payment_reminder',
    });

    // Email circular
    logs.push({
      id: `comm-email-${unit.id}`,
      unitId: unit.id,
      residentName: unit.residentName,
      recipientEmail: email,
      channel: 'email',
      title: '2025 Yılı 1. Çeyrek Gelir-Gider Faaliyet Raporu',
      message: `Sayın Kat Sakinimiz, ${siteName} 2025 Ocak-Mart dönemi Denetim Kurulu onaylı gelir-gider ve kasa raporu ekte tarafınıza takdim edilmiştir.`,
      sentAt: '2025-03-01',
      timeStr: '10:00',
      sender: 'Denetim Kurulu',
      status: 'read',
      deliveryCode: 'SMTP-DELIVERED-250',
      category: 'announcement',
    });
  }

  // Sort descending by date & time (newest first)
  return logs.sort((a, b) => {
    const timeA = new Date(`${a.sentAt}T${a.timeStr}:00`).getTime();
    const timeB = new Date(`${b.sentAt}T${b.timeStr}:00`).getTime();
    return timeB - timeA;
  });
};
