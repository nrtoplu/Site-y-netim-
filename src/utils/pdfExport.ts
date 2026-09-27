/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from 'jspdf';
import { ApartmentUnit, SiteProfile } from '../types';
import { formatCurrency, formatDate } from './formatters';
import { TimelineEvent } from './unitTimeline';

interface GenerateReportPdfOptions {
  unit: ApartmentUnit;
  siteProfile: SiteProfile;
  events: TimelineEvent[];
  reportDate?: string;
  reportRef?: string;
  notes?: string;
}

/**
 * Generates and downloads an Advanced Payment Report (Gelişmiş Ödeme Raporu) PDF
 * for a specific apartment unit using jsPDF.
 */
export const downloadAdvancedPaymentReportPdf = ({
  unit,
  siteProfile,
  events,
  reportDate = new Date().toLocaleDateString('tr-TR'),
  reportRef = `RAP-${unit.block}${unit.unitNo}-${Date.now().toString().slice(-6)}`,
  notes,
}: GenerateReportPdfOptions): void => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let y = margin;

  // --- HEADER SECTION ---
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(siteProfile.siteName.toUpperCase(), margin, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text(
    `${siteProfile.address} | Vergi No: ${siteProfile.taxNumber} - ${siteProfile.taxOffice}`,
    margin,
    18
  );
  doc.text(
    `Banka: ${siteProfile.bankName} | IBAN: ${siteProfile.iban}`,
    margin,
    23
  );

  // Report Title Badge (Right Side)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(251, 191, 36); // amber-400
  doc.text('GELISMIS ODEME RAPORU', pageWidth - margin, 12, { align: 'right' });
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text(`Ref No: ${reportRef}`, pageWidth - margin, 18, { align: 'right' });
  doc.text(`Tarih: ${reportDate}`, pageWidth - margin, 23, { align: 'right' });

  y = 35;

  // --- UNIT & RESIDENT INFORMATION BOX ---
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(margin, y, pageWidth - margin * 2, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('BAGIMSIZ BOLUM VE SAKIN BILGILERI', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);

  const col1X = margin + 4;
  const col2X = margin + 60;
  const col3X = margin + 120;

  doc.text(`Blok / No: ${unit.block} Blok - No: ${unit.unitNo}`, col1X, y + 12);
  doc.text(`Kat / Alan: Kat ${unit.floor} (${unit.grossM2} m2)`, col1X, y + 17);
  doc.text(`Arsa Payi: ${unit.landShare} / 1000`, col1X, y + 21);

  doc.text(`Sakin Adi: ${unit.residentName}`, col2X, y + 12);
  doc.text(`Ikamet Turu: ${unit.residentType === 'owner' ? 'Kat Maliki (Ev Sahibi)' : 'Kiraci'}`, col2X, y + 17);
  doc.text(`Plaka: ${unit.plateNumber || 'Kayitsiz'}`, col2X, y + 21);

  doc.text(`Telefon: ${unit.phone || 'Kayitli Degil'}`, col3X, y + 12);
  doc.text(`E-Posta: ${unit.email || 'Kayitli Degil'}`, col3X, y + 17);
  doc.text(`Aylik Sabit Aidat: ${formatCurrency(unit.monthlyDues)}`, col3X, y + 21);

  y += 28;

  // --- FINANCIAL KPI STRIP ---
  const totalCharged = events
    .filter((e) => e.type === 'charge')
    .reduce((sum, e) => sum + e.amount, 0);
  const totalPaid = events
    .filter((e) => e.type === 'payment')
    .reduce((sum, e) => sum + e.amount, 0);
  const totalLateFees = events
    .filter((e) => e.type === 'late_fee')
    .reduce((sum, e) => sum + e.amount, 0);
  const currentBal = unit.currentBalance;

  const cardWidth = (pageWidth - margin * 2 - 9) / 4;
  const kpis = [
    { label: 'TOPLAM TAHAKKUK', val: formatCurrency(totalCharged), color: [15, 23, 42] },
    { label: 'TOPLAM TAHSILAT', val: formatCurrency(totalPaid), color: [16, 185, 129] },
    { label: 'GECIKME ZAMMI (%5)', val: formatCurrency(totalLateFees), color: [217, 119, 6] },
    {
      label: 'GUNCEL CARI BAKIYE',
      val: currentBal === 0 ? '0,00 TL' : formatCurrency(currentBal),
      color: currentBal < 0 ? [225, 29, 72] : currentBal > 0 ? [16, 185, 129] : [15, 23, 42],
    },
  ];

  kpis.forEach((kpi, idx) => {
    const kpiX = margin + idx * (cardWidth + 3);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(kpiX, y, cardWidth, 14, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, kpiX + 3, y + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    doc.text(kpi.val, kpiX + 3, y + 10.5);
  });

  y += 18;

  // --- DETAILED TRANSACTIONS TABLE HEADER ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('KRONOLOJIK AIDAT VE ODEME HAREKETLERI CETVELI', margin, y);
  y += 4;

  const tableHeaderY = y;
  doc.setFillColor(241, 245, 249); // slate-100
  doc.rect(margin, tableHeaderY, pageWidth - margin * 2, 6, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);

  const tCols = {
    date: margin + 2,
    period: margin + 20,
    type: margin + 42,
    desc: margin + 68,
    ref: margin + 125,
    amount: margin + 155,
    balance: margin + 182,
  };

  doc.text('Tarih', tCols.date, tableHeaderY + 4);
  doc.text('Donem', tCols.period, tableHeaderY + 4);
  doc.text('Islem Turu', tCols.type, tableHeaderY + 4);
  doc.text('Aciklama', tCols.desc, tableHeaderY + 4);
  doc.text('Makbuz/Ref', tCols.ref, tableHeaderY + 4);
  doc.text('Tutar', tCols.amount, tableHeaderY + 4, { align: 'right' });
  doc.text('Bakiye', tCols.balance, tableHeaderY + 4, { align: 'right' });

  y = tableHeaderY + 6;

  // Sort events chronologically descending or ascending
  const sorted = [...events].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);

  sorted.forEach((item, index) => {
    // Check page overflow
    if (y > pageHeight - 35) {
      doc.addPage();
      y = margin;
      // Re-render minimal header
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, y, pageWidth - margin * 2, 6, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(71, 85, 105);
      doc.text('Tarih', tCols.date, y + 4);
      doc.text('Donem', tCols.period, y + 4);
      doc.text('Islem Turu', tCols.type, y + 4);
      doc.text('Aciklama', tCols.desc, y + 4);
      doc.text('Makbuz/Ref', tCols.ref, y + 4);
      doc.text('Tutar', tCols.amount, y + 4, { align: 'right' });
      doc.text('Bakiye', tCols.balance, y + 4, { align: 'right' });
      y += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
    }

    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, pageWidth - margin * 2, 5.5, 'F');
    }

    doc.setTextColor(30, 41, 59);
    doc.text(formatDate(item.date), tCols.date, y + 3.8);
    doc.text(item.period || '-', tCols.period, y + 3.8);

    // Type label
    const typeLabel =
      item.type === 'charge'
        ? 'Tahakkuk'
        : item.type === 'payment'
        ? 'Tahsilat'
        : item.type === 'late_fee'
        ? 'Gecikme Z.'
        : item.type === 'sms_reminder'
        ? 'SMS Hatirlat'
        : 'Ihtilaf Notu';
    doc.text(typeLabel, tCols.type, y + 3.8);

    // Truncated Description
    const maxDescWidth = 52;
    const cleanDesc = (item.title || item.description).replace(/[^\x20-\x7E\xA0-\xFF]/g, '');
    const truncatedDesc = doc.splitTextToSize(cleanDesc, maxDescWidth)[0] || cleanDesc;
    doc.text(truncatedDesc, tCols.desc, y + 3.8);

    // Receipt or reference
    const refText = item.receiptNo || item.transactionRef || '-';
    doc.text(refText, tCols.ref, y + 3.8);

    // Amount with color
    if (item.amount > 0) {
      if (item.type === 'payment') {
        doc.setTextColor(16, 185, 129);
        doc.text(`+${formatCurrency(item.amount)}`, tCols.amount, y + 3.8, { align: 'right' });
      } else {
        doc.setTextColor(225, 29, 72);
        doc.text(`-${formatCurrency(item.amount)}`, tCols.amount, y + 3.8, { align: 'right' });
      }
    } else {
      doc.setTextColor(100, 116, 139);
      doc.text('0,00 TL', tCols.amount, y + 3.8, { align: 'right' });
    }

    // Balance after
    doc.setTextColor(
      item.balanceAfter < 0 ? 225 : item.balanceAfter > 0 ? 16 : 71,
      item.balanceAfter < 0 ? 29 : item.balanceAfter > 0 ? 185 : 85,
      item.balanceAfter < 0 ? 72 : item.balanceAfter > 0 ? 129 : 105
    );
    doc.text(formatCurrency(item.balanceAfter), tCols.balance, y + 3.8, { align: 'right' });

    y += 5.5;
  });

  y += 4;

  // --- FOOTER & SIGNATURE SECTION ---
  if (y > pageHeight - 38) {
    doc.addPage();
    y = margin + 10;
  }

  // Legal declaration text
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'Isbu Gelismis Odeme Raporu, 634 Sayili Kat Mulkiyeti Kanunu ve 6698 Sayili KVKK hukumlerine uygun olarak dijital kayitlardan uretilmistir. Resmi site yonetim kurulu defteri ile mutabik hesap ozetidir.',
    margin,
    y
  );
  y += 6;

  // Signature columns
  const sigY = y;
  const sigWidth = (pageWidth - margin * 2) / 3;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);

  doc.text('SITE YONETIM KURULU BASKANI', margin + 4, sigY + 4);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(siteProfile.managementBoard[0] || 'Yonetim Kurulu Baskani', margin + 4, sigY + 8);
  doc.text('Imza / Muhur: _______________', margin + 4, sigY + 16);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('SAYMAN / MUHASEBE', margin + sigWidth + 4, sigY + 4);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(siteProfile.managementBoard[1] || 'Muhasebe Sorumlusu', margin + sigWidth + 4, sigY + 8);
  doc.text('Imza: _______________', margin + sigWidth + 4, sigY + 16);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('DENETIM KURULU', margin + sigWidth * 2 + 4, sigY + 4);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(siteProfile.auditorName || 'Site Denetcisi', margin + sigWidth * 2 + 4, sigY + 8);
  doc.text('Imza: _______________', margin + sigWidth * 2 + 4, sigY + 16);

  // Save / trigger browser download
  const safeResidentName = unit.residentName.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `Gelismis_Odeme_Raporu_${unit.block}Blok_D${unit.unitNo}_${safeResidentName}.pdf`;
  doc.save(fileName);
};

export interface GenerateLegalNoticePdfOptions {
  unit: ApartmentUnit;
  siteProfile: SiteProfile;
  overdueAmount?: number;
  lateFeeAmount?: number;
  totalDemandAmount?: number;
  noticeRef?: string;
  noticeDate?: string;
  daysToPay?: number;
  customBodyText?: string;
  lawyerName?: string;
}

/**
 * Generates and downloads a formal Legal Notice / Demand Letter (Yasal İhtarname) PDF
 * under KMK 634 Art. 20 & 33 for units with overdue balance.
 */
export const downloadLegalNoticePdf = ({
  unit,
  siteProfile,
  overdueAmount = Math.abs(unit.currentBalance),
  lateFeeAmount = Math.round(Math.abs(unit.currentBalance) * 0.05),
  totalDemandAmount = Math.abs(unit.currentBalance) + Math.round(Math.abs(unit.currentBalance) * 0.05),
  noticeRef = `IHT-${unit.block}${unit.unitNo}-${Date.now().toString().slice(-6)}`,
  noticeDate = new Date().toLocaleDateString('tr-TR'),
  daysToPay = 7,
  customBodyText,
  lawyerName = 'Av. Zeynep Yilmaz (Hukuk Danismani)',
}: GenerateLegalNoticePdfOptions): void => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const trToAscii = (str: string): string => {
    const map: Record<string, string> = {
      ç: 'c',
      Ç: 'C',
      ğ: 'g',
      Ğ: 'G',
      ı: 'i',
      İ: 'I',
      ö: 'o',
      Ö: 'O',
      ş: 's',
      Ş: 'S',
      ü: 'u',
      Ü: 'U',
    };
    return str.replace(/[çÇğĞıİöÖşŞüÜ]/g, (c) => map[c] || c);
  };

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let y = margin;

  // --- HEADER SECTION (Burgundy / Deep Crimson Warning Banner) ---
  doc.setFillColor(159, 18, 57); // rose-900
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(trToAscii(siteProfile.siteName.toUpperCase()), margin, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(254, 205, 211); // rose-200
  doc.text(
    trToAscii(
      `${siteProfile.address} | Vergi No: ${siteProfile.taxNumber} - ${siteProfile.taxOffice}`
    ),
    margin,
    17
  );
  doc.text(
    trToAscii(`Banka: ${siteProfile.bankName} | IBAN: ${siteProfile.iban}`),
    margin,
    22
  );

  // Legal Notice Title Badge
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(254, 240, 138); // yellow-200
  doc.text('YASAL IHTARNAME', pageWidth - margin, 11, { align: 'right' });
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text(`Ref: ${noticeRef}`, pageWidth - margin, 17, { align: 'right' });
  doc.text(`Teblig Tarihi: ${noticeDate}`, pageWidth - margin, 22, { align: 'right' });

  y = 34;

  // --- PARTIES BOX (IHTAR EDEN & MUHATAP) ---
  doc.setFillColor(255, 241, 242); // rose-50
  doc.setDrawColor(244, 63, 94); // rose-500
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 34, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(159, 18, 57); // rose-900

  // Left Column: IHTAR EDEN
  doc.text('IHTAR EDEN (ALACAKLI SITE YONETIMI):', margin + 4, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text(trToAscii(`${siteProfile.siteName} Toplu Yapi Yonetim Kurulu`), margin + 4, y + 11);
  doc.text(trToAscii(`Temsilci: ${siteProfile.managementBoard[0] || 'Kemal Ersoy (Yonetici)'}`), margin + 4, y + 16);
  doc.text(trToAscii(`Hukuk Sorumlusu / Vekil: ${lawyerName}`), margin + 4, y + 21);
  doc.text(trToAscii(`Iletisim: ${siteProfile.emergencyPhone || 'Site Yonetim Ofisi'}`), margin + 4, y + 26);

  // Right Column: MUHATAP
  const midX = margin + 98;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(159, 18, 57);
  doc.text('MUHATAP (BORCLU KAT SAKINI):', midX, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text(trToAscii(`Sayin: ${unit.residentName}`), midX, y + 11);
  doc.text(
    trToAscii(
      `Bagimsiz Bolum: ${unit.block} Blok - Daire No: ${unit.unitNo} (${
        unit.residentType === 'owner' ? 'Kat Maliki' : 'Kiraci / Fiili Kullanan'
      })`
    ),
    midX,
    y + 16
  );
  doc.text(trToAscii(`Telefon: ${unit.phone || 'Kayitli Degil'} | E-Posta: ${unit.email || 'Kayitli Degil'}`), midX, y + 21);
  doc.text(trToAscii(`Adres: ${siteProfile.address} No:${unit.unitNo}`), midX, y + 26);

  y += 38;

  // --- SUBJECT STRIP (KONU) ---
  doc.setFillColor(241, 245, 249); // slate-100
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 10, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('KONU:', margin + 3, y + 6.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(51, 65, 85);
  doc.text(
    trToAscii(
      '634 Sayili Kat Mulkiyeti Kanunu Md. 20 ve 33 uyarinca gecikmis aidat/isletme borcu, %5 gecikme tazminatinin tahsili ve icra takibi oncesi son yasal ihtardir.'
    ),
    margin + 17,
    y + 6.5
  );

  y += 14;

  // --- ITEMIZED DEBT AND BANK ACCOUNT TABLE ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(159, 18, 57);
  doc.text('TALEP EDILEN BORC VE HESAP MUTABAKAT CETVELI', margin, y);
  y += 4;

  // Table header
  doc.setFillColor(159, 18, 57);
  doc.rect(margin, y, pageWidth - margin * 2, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);

  doc.text('Kalem / Aciklama', margin + 3, y + 4.2);
  doc.text('Yasal Dayanak', margin + 85, y + 4.2);
  doc.text('Hesaplama Kriteri', margin + 130, y + 4.2);
  doc.text('Tutar', pageWidth - margin - 3, y + 4.2, { align: 'right' });

  y += 6;

  // Row 1: Principal
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, y, pageWidth - margin * 2, 5.5, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(30, 41, 59);
  doc.text(trToAscii(`Gecikmis Ana Para Ortak Gider / Aidat Borcu`), margin + 3, y + 3.8);
  doc.text('634 S. KMK Md. 20/a-b', margin + 85, y + 3.8);
  doc.text(trToAscii(`${unit.block} Blok D:${unit.unitNo} Cari Ekstresi`), margin + 130, y + 3.8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(225, 29, 72);
  doc.text(formatCurrency(overdueAmount), pageWidth - margin - 3, y + 3.8, { align: 'right' });

  y += 5.5;

  // Row 2: Late Fee
  doc.setFillColor(254, 242, 242);
  doc.rect(margin, y, pageWidth - margin * 2, 5.5, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(30, 41, 59);
  doc.text('Kanuni Gecikme Tazminati', margin + 3, y + 3.8);
  doc.text('634 S. KMK Md. 20/c', margin + 85, y + 3.8);
  doc.text('Aylik %5 Yasal Gecikme Zammi', margin + 130, y + 3.8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(217, 119, 6);
  doc.text(formatCurrency(lateFeeAmount), pageWidth - margin - 3, y + 3.8, { align: 'right' });

  y += 5.5;

  // Row 3: Total
  doc.setFillColor(255, 228, 230); // rose-100
  doc.rect(margin, y, pageWidth - margin * 2, 6.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(159, 18, 57);
  doc.text('TOPLAM ODENMESI GEREKEN IHTAR TUTARI:', margin + 3, y + 4.5);
  doc.text(
    trToAscii(`Odeme Suresi: ${daysToPay} Is Gunu`),
    margin + 85,
    y + 4.5
  );
  doc.setFontSize(9);
  doc.text(formatCurrency(totalDemandAmount), pageWidth - margin - 3, y + 4.5, { align: 'right' });

  y += 9.5;

  // Bank Account Details Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 11, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(15, 23, 42);
  doc.text(trToAscii(`ODEME YAPILACAK HESAP: ${siteProfile.bankName}`), margin + 3, y + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.text(trToAscii(`IBAN: ${siteProfile.iban}  |  Alici: ${siteProfile.accountHolder || siteProfile.siteName}`), margin + 3, y + 8.5);
  doc.text(
    trToAscii(`Aciklama: ${unit.block} Blok D:${unit.unitNo} Ihtarname Kapatma`),
    pageWidth - margin - 3,
    y + 8.5,
    { align: 'right' }
  );

  y += 15;

  // --- FORMAL LEGAL NOTICE BODY TEXT ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('IHTARNAME METNI VE HUKUKI BILDIRIMLER', margin, y);
  y += 4;

  const defaultBody = [
    `Sayin Muhatap;`,
    `Yonetime tabi ${trToAscii(siteProfile.siteName)} buynesinde yer alan yukarida bilgileri yazili ${unit.block} Blok Daire No:${unit.unitNo} bagimsiz bolumunuze ait gecmis donemlerden sarkan ve vadesi gectigi halde odenmemis olan toplam ${formatCurrency(overdueAmount)} tutarinda ortak gider aidat ve isletme avansi borcunuz tespit edilmistir.`,
    `634 Sayili Kat Mulkiyeti Kanunu'nun 20. maddesinin (c) fikrasi hukmu uyarinca; "Gider veya avans payini odemeyen kat maliki veya bagimsiz bolumden fiilen yararlanan kiraci hakkinda, diger kat maliklerinden her biri veya yonetici tarafindan yonetim planina, bu Kanuna ve genel hukumlere gore dava acilabilir, icra takibi yapilabilir. Gider ve avans payinin tamamini odemeyen kat maliki odemede geciktigi gunler icin aylik yuzde bes (%5) hesabıyla gecikme tazminati odemekle yukumludur."`,
    `Bu itibarla; isbu resmi ihtarnamenin tarafiniza tebliginden veya bildiriminden itibaren ${daysToPay} (yedi) is gunu icerisinde yukarida dokumu yer alan toplam ${formatCurrency(totalDemandAmount)} tutarindaki borcun site yonetimimizin belirtilen banka hesabina eksiksiz olarak odenmesini,`,
    `Verilen yasal sure icerisinde borcun odenmemesi halinde; 2004 Sayili Icra ve Iflas Kanunu hukumleri tahtinda aleyhinize genel haciz yoluyla ilamsiz icra takibi baslatilacagini, gayrimenkulleriniz, adiniza kayitli araclariniz, banka mevduatlariniz ve maasiniz uzerine haciz tatbik olunacagini, 634 Sayili Kanun'un 33. maddesi geregince hakimin mudahalesi ve tahliye davalari da dahil olmak uzere yasal yollara basvurulacagini;`,
    `Bu cercevede dogacak bilumum icra harclari, yargilama giderleri ve 1136 Sayili Avukatlik Kanunu ile Avukatlik Asgari Ucret Tarifesi uyarinca takdir edilecek vekalet ucretlerinin de tarafiniza tahmil edilecegini IHTAREN BILDIRIRIZ.`,
  ];

  const bodyParagraphs = customBodyText ? [customBodyText] : defaultBody;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(30, 41, 59);

  bodyParagraphs.forEach((para) => {
    const lines = doc.splitTextToSize(para, pageWidth - margin * 2);
    if (y + lines.length * 3.6 > pageHeight - 32) {
      doc.addPage();
      y = margin + 5;
    }
    doc.text(lines, margin, y);
    y += lines.length * 3.6 + 2;
  });

  // --- SIGNATURES & STAMPS (IHTAR EDEN / VEKILI / DENETCI) ---
  if (y > pageHeight - 36) {
    doc.addPage();
    y = margin + 10;
  } else {
    y = Math.max(y + 4, pageHeight - 34);
  }

  const sigWidth = (pageWidth - margin * 2) / 3;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);

  // Column 1: Board President
  doc.text('IHTAR EDEN', margin + 4, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.text(trToAscii(`${siteProfile.siteName} Yonetim Kurulu Baskani`), margin + 4, y + 4);
  doc.text(trToAscii(siteProfile.managementBoard[0] || 'Kemal Ersoy'), margin + 4, y + 8);
  doc.text('Imza / Muhur: ___________________', margin + 4, y + 16);

  // Column 2: Legal Counsel
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('HUKUK MUSAVIRLIGI', margin + sigWidth + 4, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.text(trToAscii(lawyerName), margin + sigWidth + 4, y + 4);
  doc.text('Site Hukuk Danismani / Vekil', margin + sigWidth + 4, y + 8);
  doc.text('Kase / Imza: ___________________', margin + sigWidth + 4, y + 16);

  // Column 3: Audit Board
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('DENETIM KURULU', margin + sigWidth * 2 + 4, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.text(trToAscii(siteProfile.auditorName || 'Site Denetcisi'), margin + sigWidth * 2 + 4, y + 4);
  doc.text('Denetim Kurulu Onayi', margin + sigWidth * 2 + 4, y + 8);
  doc.text('Imza: ___________________', margin + sigWidth * 2 + 4, y + 16);

  // Trigger download
  const safeResidentName = unit.residentName.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `Yasal_Ihtarname_${unit.block}Blok_D${unit.unitNo}_${safeResidentName}.pdf`;
  doc.save(fileName);
};

