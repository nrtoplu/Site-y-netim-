import React, { useState } from 'react';
import { X, Receipt, Building, Calendar, DollarSign, CheckCircle2 } from 'lucide-react';
import { TenantSite, SaaSInvoice } from '../../types';
import { generateSaaSInvoiceNumber } from '../../utils/dateCalculations';

interface NewSaasInvoiceModalProps {
  sites: TenantSite[];
  preselectedSiteId?: string;
  onClose: () => void;
  onAddInvoice: (newInvoice: SaaSInvoice) => void;
}

export const NewSaasInvoiceModal: React.FC<NewSaasInvoiceModalProps> = ({
  sites,
  preselectedSiteId,
  onClose,
  onAddInvoice,
}) => {
  const [selectedSiteId, setSelectedSiteId] = useState(preselectedSiteId || sites[0]?.id || '');
  const selectedSite = sites.find((s) => s.id === selectedSiteId) || sites[0];

  const currentYear = new Date().getFullYear();
  const [period, setPeriod] = useState(
    `${currentYear} - ${currentYear + 1} Yıllık ApsisCloud Lisans Yenileme (${selectedSite?.profile.totalFlats || 36} Daire)`
  );
  const [amount, setAmount] = useState(selectedSite?.license.yearlyPrice || 24000);
  const [taxRate, setTaxRate] = useState(0.2); // %20 KDV
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState(
    'Yıllık lisans süresi 30 gün içinde ödenmediği takdirde sistem erişimi otomatik olarak dondurulacaktır.'
  );

  const handleSiteChange = (newSiteId: string) => {
    setSelectedSiteId(newSiteId);
    const site = sites.find((s) => s.id === newSiteId);
    if (site) {
      setAmount(site.license.yearlyPrice);
      setPeriod(
        `${currentYear} - ${currentYear + 1} Yıllık ApsisCloud Lisans Yenileme (${site.profile.totalFlats} Daire)`
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSite) return;

    const netAmount = Number(amount);
    const taxAmount = Math.round(netAmount * taxRate);
    const totalAmount = netAmount + taxAmount;

    const newInv: SaaSInvoice = {
      id: `saas-inv-${Date.now()}`,
      invoiceNumber: generateSaaSInvoiceNumber(),
      siteId: selectedSite.id,
      siteName: selectedSite.profile.siteName,
      taxNumber: selectedSite.profile.taxNumber,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate,
      amount: netAmount,
      taxRate,
      taxAmount,
      totalAmount,
      period,
      status: 'pending',
      notes,
    };

    onAddInvoice(newInv);
    onClose();
  };

  const netNum = Number(amount) || 0;
  const kdvNum = Math.round(netNum * taxRate);
  const totalNum = netNum + kdvNum;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-sm p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Receipt className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="font-bold text-sm">Siteye Yıllık SaaS Faturası Kes</h2>
              <p className="text-[11px] text-slate-400">ApsisCloud Platform Lisans Faturalandırma</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Fatura Kesilecek Site / Apartman
            </label>
            <select
              value={selectedSiteId}
              onChange={(e) => handleSiteChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.profile.siteName} ({site.profile.city} - {site.profile.totalFlats} Daire)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Fatura Dönemi & Açıklama
            </label>
            <input
              type="text"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Net Yıllık Lisans Bedeli (₺)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                min={1000}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Son Ödeme Vade Tarihi
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Pricing Preview Box */}
          <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Net Hizmet Tutarı:</span>
              <span className="font-mono font-semibold">{netNum.toLocaleString('tr-TR')} ₺</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Hesaplanan KDV (%20):</span>
              <span className="font-mono font-semibold">{kdvNum.toLocaleString('tr-TR')} ₺</span>
            </div>
            <div className="flex justify-between text-indigo-950 font-bold text-sm pt-2 border-t border-indigo-200/60">
              <span>Genel Fatura Toplamı:</span>
              <span className="font-mono text-indigo-700">{totalNum.toLocaleString('tr-TR')} ₺</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Fatura & İhtar Notu (Opsiyonel)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center space-x-1.5"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Faturayı Kes ve İlet</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
