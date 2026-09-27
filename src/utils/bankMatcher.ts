/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as XLSX from 'xlsx';
import { ApartmentUnit, BankMatchingRule, BankTransactionMatch } from '../types';

/**
 * Normalizes Turkish characters and lowercases text for robust matching.
 */
export function normalizeTurkishText(text: string): string {
  if (!text) return '';
  return text
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Matches a raw bank transaction against apartment units and custom manager rules.
 */
export function matchBankTransaction(
  rawItem: {
    id?: string;
    date: string;
    senderName: string;
    senderIban?: string;
    description: string;
    amount: number;
    transactionRef?: string;
    targetPeriod?: string;
  },
  units: ApartmentUnit[],
  rules: BankMatchingRule[] = []
): BankTransactionMatch {
  const normSender = normalizeTurkishText(rawItem.senderName);
  const normDesc = normalizeTurkishText(rawItem.description);
  const combined = `${normSender} ${normDesc}`;

  // 1. Check memorized manager matching rules first
  for (const rule of rules) {
    const normKeyword = normalizeTurkishText(rule.senderKeyword);
    if (normKeyword && (normSender.includes(normKeyword) || combined.includes(normKeyword))) {
      const unit = units.find((u) => u.id === rule.unitId);
      if (unit) {
        return {
          id: rawItem.id || `bank-tx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          date: rawItem.date,
          senderName: rawItem.senderName,
          senderIban: rawItem.senderIban,
          description: rawItem.description,
          amount: rawItem.amount,
          transactionRef: rawItem.transactionRef || `TR-${Math.floor(10000000 + Math.random() * 90000000)}`,
          matchedUnitId: unit.id,
          matchStatus: 'auto_matched',
          matchConfidence: 99,
          suggestedReason: `Daha önce kaydedilen kural eşleşti: "${rule.senderKeyword}" → ${unit.block} Blok D:${unit.unitNo}`,
          targetPeriod: rawItem.targetPeriod || 'Eylül 2026 Aidatı',
          rememberRule: false,
        };
      }
    }
  }

  // 2. Check by Resident Full Name or Last Name
  for (const unit of units) {
    const normResident = normalizeTurkishText(unit.residentName);
    if (!normResident || unit.residentName === 'Boş Daire') continue;

    // Direct exact or includes match
    if (normSender.includes(normResident) || normResident.includes(normSender)) {
      return {
        id: rawItem.id || `bank-tx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        date: rawItem.date,
        senderName: rawItem.senderName,
        senderIban: rawItem.senderIban,
        description: rawItem.description,
        amount: rawItem.amount,
        transactionRef: rawItem.transactionRef || `TR-${Math.floor(10000000 + Math.random() * 90000000)}`,
        matchedUnitId: unit.id,
        matchStatus: 'auto_matched',
        matchConfidence: 95,
        suggestedReason: `İsim eşleşmesi tespit edildi: ${unit.residentName} (${unit.block} Blok D:${unit.unitNo})`,
        targetPeriod: rawItem.targetPeriod || 'Eylül 2026 Aidatı',
        rememberRule: false,
      };
    }

    // Name parts match (first name and last name)
    const nameParts = normResident.split(' ').filter((p) => p.length > 2);
    if (nameParts.length >= 2) {
      const matchAllParts = nameParts.every((part) => normSender.includes(part));
      if (matchAllParts) {
        return {
          id: rawItem.id || `bank-tx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          date: rawItem.date,
          senderName: rawItem.senderName,
          senderIban: rawItem.senderIban,
          description: rawItem.description,
          amount: rawItem.amount,
          transactionRef: rawItem.transactionRef || `TR-${Math.floor(10000000 + Math.random() * 90000000)}`,
          matchedUnitId: unit.id,
          matchStatus: 'auto_matched',
          matchConfidence: 90,
          suggestedReason: `İsim-soyisim eşleşmesi tespit edildi: ${unit.residentName}`,
          targetPeriod: rawItem.targetPeriod || 'Eylül 2026 Aidatı',
          rememberRule: false,
        };
      }
    }
  }

  // 3. Check for Block and Unit Number in description or sender (e.g. "B-14", "B14", "A 2", "Daire 3")
  for (const unit of units) {
    const blockLetter = unit.block.toLowerCase();
    const unitNo = unit.unitNo;

    // Patterns: "b14", "b-14", "b 14", "b blok daire 14", "daire 14"
    const blockUnitPattern = new RegExp(`\\b${blockLetter}\\s*[-/]?\\s*${unitNo}\\b`, 'i');
    const explicitUnitPattern = new RegExp(`\\b(?:daire|no|d)\\s*[:#-]?\\s*${unitNo}\\b`, 'i');

    if (blockUnitPattern.test(combined)) {
      return {
        id: rawItem.id || `bank-tx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        date: rawItem.date,
        senderName: rawItem.senderName,
        senderIban: rawItem.senderIban,
        description: rawItem.description,
        amount: rawItem.amount,
        transactionRef: rawItem.transactionRef || `TR-${Math.floor(10000000 + Math.random() * 90000000)}`,
        matchedUnitId: unit.id,
        matchStatus: 'auto_matched',
        matchConfidence: 85,
        suggestedReason: `Açıklamada "${unit.block} Blok D:${unit.unitNo}" ifadesi tespit edildi`,
        targetPeriod: rawItem.targetPeriod || 'Eylül 2026 Aidatı',
        rememberRule: false,
      };
    } else if (explicitUnitPattern.test(combined) && normDesc.includes(blockLetter)) {
      return {
        id: rawItem.id || `bank-tx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        date: rawItem.date,
        senderName: rawItem.senderName,
        senderIban: rawItem.senderIban,
        description: rawItem.description,
        amount: rawItem.amount,
        transactionRef: rawItem.transactionRef || `TR-${Math.floor(10000000 + Math.random() * 90000000)}`,
        matchedUnitId: unit.id,
        matchStatus: 'auto_matched',
        matchConfidence: 75,
        suggestedReason: `Açıklamada blok ve daire no bulundu: D:${unit.unitNo}`,
        targetPeriod: rawItem.targetPeriod || 'Eylül 2026 Aidatı',
        rememberRule: false,
      };
    }
  }

  // 4. No reliable match found -> UNMATCHED!
  return {
    id: rawItem.id || `bank-tx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    date: rawItem.date,
    senderName: rawItem.senderName || 'Bilinmeyen Gönderen',
    senderIban: rawItem.senderIban,
    description: rawItem.description || 'Havale / EFT Açıklaması Yok',
    amount: rawItem.amount,
    transactionRef: rawItem.transactionRef || `TR-${Math.floor(10000000 + Math.random() * 90000000)}`,
    matchedUnitId: undefined,
    matchStatus: 'unmatched',
    matchConfidence: 0,
    suggestedReason: '⚠️ Gönderen adı ve açıklama hiçbir daireyle uyuşmadı. Lütfen daire seçimi yapınız.',
    targetPeriod: rawItem.targetPeriod || 'Eylül 2026 Aidatı',
    rememberRule: true, // Default to true so manager can memorize
  };
}

/**
 * Parses uploaded Excel / CSV file buffer and returns matched transactions.
 */
export function parseBankExcelFile(
  fileBuffer: ArrayBuffer,
  units: ApartmentUnit[],
  rules: BankMatchingRule[] = []
): { transactions: BankTransactionMatch[]; parseErrors: string[] } {
  const parseErrors: string[] = [];
  const transactions: BankTransactionMatch[] = [];

  try {
    const workbook = XLSX.read(fileBuffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];

    // Read as 2D array of rows to reliably identify headers
    const rawData: (string | number | undefined)[][] = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: '',
    });

    if (!rawData || rawData.length === 0) {
      parseErrors.push('Excel dosyasında veri bulunamadı.');
      return { transactions, parseErrors };
    }

    // Find header row (the row containing keywords like tarih, gönderen, tutar, vb.)
    let headerRowIdx = -1;
    let colIndices = {
      date: -1,
      sender: -1,
      desc: -1,
      amount: -1,
      ref: -1,
      iban: -1,
    };

    for (let r = 0; r < Math.min(10, rawData.length); r++) {
      const row = rawData[r];
      let hasDate = false;
      let hasAmount = false;

      row.forEach((cellVal, colIdx) => {
        const text = normalizeTurkishText(String(cellVal));
        if (text.includes('tarih') || text.includes('date') || text.includes('islem tarihi')) {
          colIndices.date = colIdx;
          hasDate = true;
        }
        if (
          text.includes('tutar') ||
          text.includes('alacak') ||
          text.includes('miktar') ||
          text.includes('amount') ||
          text.includes('bakiye')
        ) {
          colIndices.amount = colIdx;
          hasAmount = true;
        }
        if (
          text.includes('gonderen') ||
          text.includes('ad soyad') ||
          text.includes('karsi taraf') ||
          text.includes('unvan') ||
          text.includes('musteri')
        ) {
          colIndices.sender = colIdx;
        }
        if (
          text.includes('aciklama') ||
          text.includes('dekont') ||
          text.includes('islem detayi') ||
          text.includes('not')
        ) {
          colIndices.desc = colIdx;
        }
        if (text.includes('ref') || text.includes('dekont no') || text.includes('fis no')) {
          colIndices.ref = colIdx;
        }
        if (text.includes('iban') || text.includes('hesap no')) {
          colIndices.iban = colIdx;
        }
      });

      if (hasDate && hasAmount) {
        headerRowIdx = r;
        break;
      }
    }

    // If headers not found by keyword, fallback to default standard positions:
    // Col 0: Tarih, Col 1: Gönderen, Col 2: Açıklama, Col 3: Tutar, Col 4: Ref, Col 5: IBAN
    if (headerRowIdx === -1) {
      headerRowIdx = 0;
      colIndices = { date: 0, sender: 1, desc: 2, amount: 3, ref: 4, iban: 5 };
    } else {
      // Fill missing columns with best defaults if not set
      if (colIndices.sender === -1) colIndices.sender = 1;
      if (colIndices.desc === -1) colIndices.desc = 2;
      if (colIndices.ref === -1) colIndices.ref = 4;
      if (colIndices.iban === -1) colIndices.iban = 5;
    }

    // Parse transaction rows
    for (let r = headerRowIdx + 1; r < rawData.length; r++) {
      const row = rawData[r];
      if (!row || row.length === 0) continue;

      const rawDate = row[colIndices.date];
      const rawSender = String(row[colIndices.sender] || '').trim();
      const rawDesc = String(row[colIndices.desc] || '').trim();
      const rawAmountVal = row[colIndices.amount];
      const rawRef = String(row[colIndices.ref] || '').trim();
      const rawIban = String(row[colIndices.iban] || '').trim();

      // Clean amount: support "1.850,00 TL", "1850.00", "1,850", etc.
      let amount = 0;
      if (typeof rawAmountVal === 'number') {
        amount = rawAmountVal;
      } else if (typeof rawAmountVal === 'string') {
        const cleanStr = rawAmountVal
          .replace(/[₺TL\s]/g, '')
          .replace(/\./g, '')
          .replace(',', '.');
        amount = parseFloat(cleanStr) || 0;
      }

      // Ignore zero or negative transactions (only incoming credits)
      if (amount <= 0) continue;

      // Clean date
      let dateStr = new Date().toISOString().split('T')[0];
      if (rawDate) {
        if (typeof rawDate === 'number') {
          // Excel serial date to JS Date
          const jsDate = new Date(Math.round((rawDate - 25569) * 86400 * 1000));
          if (!isNaN(jsDate.getTime())) {
            dateStr = jsDate.toISOString().split('T')[0];
          }
        } else {
          const s = String(rawDate).trim();
          // Check DD.MM.YYYY
          const dmyMatch = s.match(/(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})/);
          if (dmyMatch) {
            const year = dmyMatch[3].length === 2 ? `20${dmyMatch[3]}` : dmyMatch[3];
            const month = dmyMatch[2].padStart(2, '0');
            const day = dmyMatch[1].padStart(2, '0');
            dateStr = `${year}-${month}-${day}`;
          }
        }
      }

      const matchedTx = matchBankTransaction(
        {
          id: `bank-tx-${Date.now()}-${r}`,
          date: dateStr,
          senderName: rawSender || 'Bilinmeyen Gönderen',
          senderIban: rawIban || undefined,
          description: rawDesc || 'Banka Havalesi',
          amount,
          transactionRef: rawRef || `REF-${dateStr.replace(/-/g, '')}-${r}`,
        },
        units,
        rules
      );

      transactions.push(matchedTx);
    }
  } catch (err: unknown) {
    parseErrors.push(`Dosya işlenirken hata oluştu: ${err instanceof Error ? err.message : String(err)}`);
  }

  return { transactions, parseErrors };
}

/**
 * Generates downloadable sample Bank Statement Excel workbook (.xlsx).
 */
export function generateSampleBankExcelFile(): Uint8Array {
  const sampleData = [
    {
      'İşlem Tarihi': '2026-09-21',
      'Gönderen Adı': 'Hakan Özdemir',
      'Açıklama': 'A Blok No:1 Eylül 2026 Aidatı',
      'Tutar (TL)': 1850,
      'Dekont No': 'GAR-20260921-01',
      'Gönderen IBAN': 'TR45 0006 2000 0001 2345 6789 01',
    },
    {
      'İşlem Tarihi': '2026-09-21',
      'Gönderen Adı': 'Canan Güneş',
      'Açıklama': 'A-2 Aidat Ödemesi',
      'Tutar (TL)': 1850,
      'Dekont No': 'ISB-20260921-02',
      'Gönderen IBAN': 'TR12 0006 4000 0011 2233 4455 66',
    },
    {
      'İşlem Tarihi': '2026-09-22',
      'Gönderen Adı': 'Fatma Demirtaş',
      'Açıklama': 'Havale / Kira ve Aidat',
      'Tutar (TL)': 1850,
      'Dekont No': 'YKB-20260922-03',
      'Gönderen IBAN': 'TR88 0006 7000 0000 9988 7766 55',
    },
    {
      'İşlem Tarihi': '2026-09-22',
      'Gönderen Adı': 'Şükrü Tan',
      'Açıklama': 'Site Aidat Bedeli',
      'Tutar (TL)': 3700,
      'Dekont No': 'ZIR-20260922-04',
      'Gönderen IBAN': 'TR90 0001 0000 1234 5678 9012 34',
    },
    {
      'İşlem Tarihi': '2026-09-23',
      'Gönderen Adı': 'Ali Yılmaz',
      'Açıklama': 'B14 Daire Aidat',
      'Tutar (TL)': 1850,
      'Dekont No': 'AKB-20260923-05',
      'Gönderen IBAN': 'TR22 0004 6000 0088 1122 3344 55',
    },
    {
      'İşlem Tarihi': '2026-09-23',
      'Gönderen Adı': 'Bilinmeyen Gönderen',
      'Açıklama': 'FAST Ödeme',
      'Tutar (TL)': 1850,
      'Dekont No': 'FST-20260923-06',
      'Gönderen IBAN': 'TR66 0003 2000 0012 3456 7890 12',
    },
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Banka Ekstresi');
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Uint8Array(wbout);
}
