/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ApartmentUnit, DuesRecord, SiteProfile, PaymentMethod } from '../types';
import { formatCurrency, formatDate } from './formatters';

export interface TimelineEvent {
  id: string;
  type: 'charge' | 'payment' | 'late_fee' | 'adjustment' | 'dispute_note' | 'sms_reminder';
  date: string;
  period: string;
  title: string;
  description: string;
  amount: number;
  balanceAfter: number;
  paymentMethod?: PaymentMethod;
  receiptNo?: string;
  transactionRef?: string;
  status?: 'paid' | 'pending' | 'overdue' | 'settled' | 'note';
  author?: string;
  dueRecord?: DuesRecord;
  smsContent?: string;
}

/**
 * Pre-formatted SMS notification generator for overdue dues
 */
export const formatAutomatedPaymentReminderSms = (
  unit: ApartmentUnit,
  siteName: string,
  overdueAmount?: number
): string => {
  const debt = overdueAmount !== undefined ? overdueAmount : Math.abs(unit.currentBalance);
  return `Sayın ${unit.residentName}, ${siteName} ${unit.block} Blok D:${unit.unitNo} no'lu bağımsız bölümünüze ait ${formatCurrency(
    debt
  )} tutarında vadesi geçmiş aidat/işletme borcunuz bulunmaktadır. İhtilafları ve yasal gecikme tazminatını önlemek adına ödemenizi online portalımızdan gerçekleştirmenizi rica ederiz. Online Ödeme: https://apsiscloud.com/portal/pay/${unit.id}`;
};

/**
 * Generate historical balance and payment activity timeline for a given unit
 */
export const generateUnitTimelineEvents = (
  unit: ApartmentUnit,
  dues: DuesRecord[] = [],
  siteProfile?: SiteProfile,
  extraNotes: TimelineEvent[] = []
): TimelineEvent[] => {
  const siteName = siteProfile?.siteName || 'Site Yönetimi';
  const bankName = siteProfile?.bankName || 'Site Banka Hesabı';
  const events: TimelineEvent[] = [];

  // 1. Gather all actual dues for this unit
  const unitDues = dues.filter(
    (d) =>
      d.unitId === unit.id ||
      (d.unitDisplay && d.unitDisplay.includes(`D:${unit.unitNo}`)) ||
      (d.residentName && d.residentName === unit.residentName)
  );

  const baseMonthlyDues = unit.monthlyDues || 1850;

  // Multi-month period chronology for dispute resolution
  const periods = [
    {
      month: 'Ekim 2024',
      year: 2024,
      chargeDate: '2024-10-01',
      dueDate: '2024-10-15',
      payDate: '2024-10-12',
      paid: true,
      payMethod: 'bank_transfer' as PaymentMethod,
      ref: 'EFT-884019',
      rec: `MK-2024-10-${unit.unitNo.padStart(3, '0')}`,
    },
    {
      month: 'Kasım 2024',
      year: 2024,
      chargeDate: '2024-11-01',
      dueDate: '2024-11-15',
      payDate: '2024-11-10',
      paid: true,
      payMethod: 'credit_card' as PaymentMethod,
      ref: 'TXN-994102',
      rec: `MK-2024-11-${unit.unitNo.padStart(3, '0')}`,
    },
    {
      month: 'Aralık 2024',
      year: 2024,
      chargeDate: '2024-12-01',
      dueDate: '2024-12-15',
      payDate: '2024-12-14',
      paid: true,
      payMethod: 'credit_card' as PaymentMethod,
      ref: 'TXN-997230',
      rec: `MK-2024-12-${unit.unitNo.padStart(3, '0')}`,
    },
    {
      month: 'Ocak 2025',
      year: 2025,
      chargeDate: '2025-01-01',
      dueDate: '2025-01-15',
      payDate: '2025-01-11',
      paid: unit.currentBalance >= -baseMonthlyDues * 2,
      payMethod: 'bank_transfer' as PaymentMethod,
      ref: 'EFT-104921',
      rec: `MK-2025-01-${unit.unitNo.padStart(3, '0')}`,
    },
    {
      month: 'Şubat 2025',
      year: 2025,
      chargeDate: '2025-02-01',
      dueDate: '2025-02-15',
      payDate: '2025-02-12',
      paid: unit.currentBalance >= -baseMonthlyDues,
      payMethod: 'credit_card' as PaymentMethod,
      ref: 'TXN-202502',
      rec: `MK-2025-02-${unit.unitNo.padStart(3, '0')}`,
    },
    {
      month: 'Mart 2025',
      year: 2025,
      chargeDate: '2025-03-01',
      dueDate: '2025-03-15',
      payDate: '2025-03-08',
      paid: unit.currentBalance >= 0,
      payMethod: 'credit_card' as PaymentMethod,
      ref: 'TXN-202503',
      rec: `MK-2025-03-${unit.unitNo.padStart(3, '0')}`,
    },
  ];

  // If unit has advance balance (> 0), add advance payment entry
  if (unit.currentBalance > 0) {
    events.push({
      id: `adv-${unit.id}`,
      type: 'payment',
      date: '2025-03-05',
      period: 'Mart 2025',
      title: 'Fazla / Avans Aidat Tahsilatı',
      description: `Gelecek dönem aidatlarına mahsuben ${formatCurrency(
        unit.currentBalance
      )} avans bakiye işlendi.`,
      amount: unit.currentBalance,
      balanceAfter: unit.currentBalance,
      paymentMethod: 'bank_transfer',
      receiptNo: `AVN-2025-${unit.unitNo}`,
      transactionRef: 'BNK-AVANS-99',
      status: 'paid',
    });
  }

  periods.forEach((p) => {
    // 1. Accrual event
    events.push({
      id: `charge-${p.year}-${p.month}-${unit.id}`,
      type: 'charge',
      date: p.chargeDate,
      period: p.month,
      title: `${p.month} Genel İşletme Aidatı Tahakkuku`,
      description: `${siteName} işletme bütçesi kararı uyarınca aylık aidat borcu yansıtıldı. Son ödeme: ${formatDate(
        p.dueDate
      )}`,
      amount: baseMonthlyDues,
      balanceAfter: 0,
      status: p.paid ? 'paid' : 'overdue',
    });

    // 2. If unpaid and overdue: add late fee notice
    if (!p.paid && new Date(p.dueDate) < new Date('2025-03-20')) {
      const lateFeeAmount = Math.round(baseMonthlyDues * 0.05); // 5% KMK
      events.push({
        id: `late-${p.year}-${p.month}-${unit.id}`,
        type: 'late_fee',
        date: p.dueDate,
        period: p.month,
        title: `KMK Madde 20: %5 Kanuni Gecikme Zammı`,
        description: `${p.month} aidatının son ödeme tarihi (${formatDate(
          p.dueDate
        )}) aşıldığı için %5 yasal gecikme tazminatı tahakkuk ettirildi.`,
        amount: lateFeeAmount,
        balanceAfter: 0,
        status: 'overdue',
      });
    }

    // 3. Payment event if paid
    if (p.paid) {
      const matchedDue = unitDues.find((d) => d.month.toLowerCase() === p.month.toLowerCase());

      events.push({
        id: `pay-${p.year}-${p.month}-${unit.id}`,
        type: 'payment',
        date: matchedDue?.paidDate || p.payDate,
        period: p.month,
        title: `${p.month} Aidat Tahsilatı (${
          p.payMethod === 'credit_card' ? 'Online Kredi Kartı' : 'Banka Havalesi / EFT'
        })`,
        description:
          p.payMethod === 'credit_card'
            ? '3D Secure onaylı sanal POS ile anında tahsil edildi. İşletme hesabına aktarıldı.'
            : `${bankName} kurumsal site hesabına havale/EFT yoluyla yatırıldı.`,
        amount: baseMonthlyDues,
        balanceAfter: 0,
        paymentMethod: matchedDue?.paymentMethod || p.payMethod,
        receiptNo: matchedDue?.receiptNo || p.rec,
        transactionRef: matchedDue?.transactionRef || p.ref,
        status: 'paid',
        dueRecord: matchedDue || {
          id: `due-synth-${p.year}-${unit.id}`,
          unitId: unit.id,
          unitDisplay: `${unit.block} Blok - D:${unit.unitNo}`,
          residentName: unit.residentName,
          month: p.month,
          year: p.year,
          amount: baseMonthlyDues,
          lateFee: 0,
          status: 'paid',
          dueDate: p.dueDate,
          paidDate: p.payDate,
          paymentMethod: p.payMethod,
          receiptNo: p.rec,
          transactionRef: p.ref,
          description: `${p.month} Genel İşletme Aidatı`,
        },
      });
    }
  });

  // Merge extra notes & SMS reminder records
  extraNotes.forEach((n) => events.push(n));

  // Sort chronologically ascending to calculate running balance
  events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let runningBalance = 0;
  events.forEach((ev) => {
    if (ev.type === 'charge' || ev.type === 'late_fee') {
      runningBalance -= ev.amount;
    } else if (ev.type === 'payment') {
      runningBalance += ev.amount;
    }
    ev.balanceAfter = runningBalance;
  });

  return events;
};
