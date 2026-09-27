import React, { useState } from 'react';
import { X, Receipt, PlusCircle, AlertCircle } from 'lucide-react';
import { ExpenseCategory, ExpenseRecord } from '../../types';

interface NewExpenseModalProps {
  onClose: () => void;
  onAddExpense: (expense: ExpenseRecord) => void;
}

const CATEGORY_OPTIONS: { value: ExpenseCategory; label: string }[] = [
  { value: 'elevator', label: 'Asansör Bakım & Revizyon' },
  { value: 'personnel', label: 'Personel Maaş & SGK' },
  { value: 'energy', label: 'Ortak Alan Elektrik / Su / Doğalgaz' },
  { value: 'security', label: 'Güvenlik & Kamera Sistemleri' },
  { value: 'garden', label: 'Bahçe, Peyzaj & İlaçlama' },
  { value: 'cleaning', label: 'Temizlik & Hijyen Sarf Malzemesi' },
  { value: 'maintenance', label: 'Tamirat, Tesisat & Demirbaş' },
  { value: 'administrative', label: 'Yönetim, Hukuk & Noter Harçları' },
];

export const NewExpenseModal: React.FC<NewExpenseModalProps> = ({ onClose, onAddExpense }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('maintenance');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [invoiceNo, setInvoiceNo] = useState('');
  const [supplier, setSupplier] = useState('');
  const [paidBy, setPaidBy] = useState('Site Yönetim Hesabı');
  const [description, setDescription] = useState('');
  const [documentName, setDocumentName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || Number(amount) <= 0) return;

    const newExpense: ExpenseRecord = {
      id: `exp-${Date.now()}`,
      title,
      category,
      amount: Number(amount),
      date,
      invoiceNo: invoiceNo || `FTR-${Math.floor(10000 + Math.random() * 90000)}`,
      supplier: supplier || 'Yerel Tedarikçi',
      paidBy,
      description,
      status: 'approved',
      documentName: documentName || 'fatura_dekont_eklendi.pdf',
    };

    onAddExpense(newExpense);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-sm p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Receipt className="w-5 h-5 text-indigo-400" />
            <h2 className="font-semibold text-base">Yeni Site Gideri / Fatura Kaydet</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Harcama Başlığı / Açıklaması *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: Otopark LED Projektörleri Değişimi"
              className="w-full text-sm py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Gider Kategorisi *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full text-xs py-2.5 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tutar (₺ KDV Dahil) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="4250.00"
                className="w-full text-sm font-mono py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Fatura / Fiş Tarihi</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Fatura / Makbuz No</label>
              <input
                type="text"
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                placeholder="FTR-2025-091"
                className="w-full text-xs font-mono py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tedarikçi / Firma / Usta</label>
              <input
                type="text"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="Örn: Güven Elektrik Ltd."
                className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ödeme Yapılan Kasa/Hesap</label>
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="w-full text-xs py-2.5 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              >
                <option value="Site Yönetim Hesabı (İş Bankası)">İş Bankası Ticari Hesap</option>
                <option value="Nakit İşletme Kasası">Nakit İşletme Kasası</option>
                <option value="Demirbaş Yedek Akçe Hesabı">Demirbaş Fonu</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Detaylı Açıklama</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Yapılan işlemin kapsamı ve garanti bilgisi..."
              className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Fatura / Dekont Dosyası</label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                placeholder="otopark_aydinlatma_fatura.pdf"
                className="flex-1 text-xs py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
              />
              <button
                type="button"
                onClick={() => setDocumentName(`fatura_${Date.now().toString().slice(-4)}.pdf`)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg"
              >
                Belge Simüle Et
              </button>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center space-x-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Gideri Kaydet & Bütçeye İşle</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
