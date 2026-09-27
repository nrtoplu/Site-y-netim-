import React, { useState } from 'react';
import {
  Receipt,
  PlusCircle,
  Search,
  Filter,
  Download,
  FileCheck,
  CheckCircle2,
  Clock,
  Building,
  Calendar,
} from 'lucide-react';
import { ExpenseRecord, ExpenseCategory } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface ExpensesTabProps {
  expenses: ExpenseRecord[];
  isResident: boolean;
  onOpenNewExpense: () => void;
}

const CATEGORY_MAP: Record<ExpenseCategory, { label: string; color: string }> = {
  elevator: { label: 'Asansör Bakım', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  personnel: { label: 'Personel & SGK', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  energy: { label: 'Ortak Elektrik/Su', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  security: { label: 'Güvenlik & Kamera', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  garden: { label: 'Bahçe & Peyzaj', color: 'bg-teal-50 text-teal-700 border-teal-200' },
  cleaning: { label: 'Temizlik & Hijyen', color: 'bg-sky-50 text-sky-700 border-sky-200' },
  maintenance: { label: 'Tamirat & Demirbaş', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  administrative: { label: 'Yönetim & Hukuk', color: 'bg-slate-100 text-slate-700 border-slate-200' },
};

export const ExpensesTab: React.FC<ExpensesTabProps> = ({
  expenses,
  isResident,
  onOpenNewExpense,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | ExpenseCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredExpenses = expenses.filter((e) => {
    if (selectedCategory !== 'all' && e.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = e.title.toLowerCase().includes(q);
      const matchSupplier = e.supplier.toLowerCase().includes(q);
      const matchInvoice = e.invoiceNo.toLowerCase().includes(q);
      if (!matchTitle && !matchSupplier && !matchInvoice) return false;
    }
    return true;
  });

  const totalExpense = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);

  // Group by category for percentage breakdown
  const categoryTotals: Record<string, number> = {};
  expenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Gider Yönetimi & Onaylı Fatura Kayıtları
          </h2>
          <p className="text-xs text-slate-500">
            Sitenin tüm işletme harcamaları faturalı ve şeffaf biçimde taranarak arşivlenmektedir.
          </p>
        </div>

        {!isResident && (
          <button
            onClick={onOpenNewExpense}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center space-x-1.5 self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Yeni Gider / Fatura Ekle</span>
          </button>
        )}
      </div>

      {/* Category Breakdown Progress */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800 uppercase tracking-wider">
            Aylık Harcama Kalemleri Dağılımı
          </span>
          <span className="font-bold text-slate-900 font-mono">
            Toplam: {formatCurrency(expenses.reduce((a, b) => a + b.amount, 0))}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {Object.entries(CATEGORY_MAP).map(([catKey, val]) => {
            const sum = categoryTotals[catKey] || 0;
            if (sum === 0) return null;
            return (
              <div
                key={catKey}
                onClick={() => setSelectedCategory(selectedCategory === catKey ? 'all' : (catKey as ExpenseCategory))}
                className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                  selectedCategory === catKey
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="text-slate-500 text-[11px] truncate">{val.label}</div>
                <div className="text-sm font-bold text-slate-900 font-mono mt-0.5">
                  {formatCurrency(sum)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Fatura no, tedarikçi, harcama adı..."
            className="w-full text-xs py-2 pl-9 pr-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="text-xs py-2 px-3 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700"
          >
            <option value="all">Tüm Harcama Kategorileri</option>
            {Object.entries(CATEGORY_MAP).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">Harcama Başlığı</th>
                <th className="px-4 py-3.5">Kategori</th>
                <th className="px-4 py-3.5">Tedarikçi / Muhatap</th>
                <th className="px-4 py-3.5">Fatura No</th>
                <th className="px-4 py-3.5">Tarih</th>
                <th className="px-4 py-3.5">Tutar</th>
                <th className="px-4 py-3.5">Durum</th>
                <th className="px-4 py-3.5 text-right">Fatura Belgesi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-slate-400">
                    Arama kriterlerine uygun gider kaydı bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => {
                  const catInfo = CATEGORY_MAP[exp.category] || {
                    label: exp.category,
                    color: 'bg-slate-100 text-slate-700',
                  };

                  return (
                    <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-bold text-slate-900 block">{exp.title}</span>
                        <span className="text-[11px] text-slate-500 line-clamp-1">
                          {exp.description}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${catInfo.color}`}
                        >
                          {catInfo.label}
                        </span>
                      </td>

                      <td className="px-4 py-3 font-medium text-slate-800">{exp.supplier}</td>

                      <td className="px-4 py-3 font-mono text-slate-600">{exp.invoiceNo}</td>

                      <td className="px-4 py-3 text-slate-500">{formatDate(exp.date)}</td>

                      <td className="px-4 py-3 font-mono font-bold text-slate-900">
                        {formatCurrency(exp.amount)}
                      </td>

                      <td className="px-4 py-3">
                        {exp.status === 'approved' ? (
                          <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>ONAYLANDI</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>ONAY BEKLİYOR</span>
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center space-x-1 text-xs text-indigo-600 font-semibold hover:text-indigo-800 cursor-pointer">
                          <FileCheck className="w-3.5 h-3.5" />
                          <span>{exp.documentName || 'Fatura.pdf'}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
