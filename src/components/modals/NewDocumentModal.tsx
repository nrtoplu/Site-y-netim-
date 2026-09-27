import React, { useState } from 'react';
import { X, FileText, Upload, ShieldCheck } from 'lucide-react';
import { ArchiveDocument, DocumentCategory } from '../../types';
import { generateHash } from '../../utils/formatters';

interface NewDocumentModalProps {
  currentUploader: string;
  onClose: () => void;
  onAddDocument: (doc: ArchiveDocument) => void;
}

const CATEGORIES: { value: DocumentCategory; label: string }[] = [
  { value: 'decision_book', label: 'Karar Defteri & Noter Tasdiki' },
  { value: 'contract', label: 'Hizmet & Bakım Sözleşmeleri' },
  { value: 'invoice', label: 'Fatura, Dekont & Fiş Arşivi' },
  { value: 'insurance', label: 'Ortak Alan Sigorta Poliçeleri' },
  { value: 'audit_report', label: 'Denetim & Faaliyet Raporları' },
  { value: 'blueprint', label: 'Mimari, Statik & Tesisat Projeleri' },
];

export const NewDocumentModal: React.FC<NewDocumentModalProps> = ({
  currentUploader,
  onClose,
  onAddDocument,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('decision_book');
  const [fileNumber, setFileNumber] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [summary, setSummary] = useState('');
  const [fileSize, setFileSize] = useState('2.4 MB');
  const [fileFormat, setFileFormat] = useState<'PDF' | 'DWG' | 'JPG'>('PDF');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const newDoc: ArchiveDocument = {
      id: `DOC-2025-${Math.floor(10 + Math.random() * 90)}`,
      title,
      category,
      date: new Date().toISOString().split('T')[0],
      fileNumber: fileNumber || `BELGE-${Date.now().toString().slice(-4)}`,
      fileSize,
      fileFormat,
      tags: tags.length > 0 ? tags : ['Yönetim Belgesi', 'Dijital Arşiv'],
      summary: summary || 'Resmi site evrakı, yönetim kurulu tarafından sisteme taranarak arşivlenmiştir.',
      verifiedHash: generateHash(title + Date.now()),
      uploader: currentUploader,
      accessRole: 'all',
    };

    onAddDocument(newDoc);
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
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <h2 className="font-semibold text-base">Dijital Arşive Resmi Evrak Ekle</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Evrak / Belge Adı *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: 2025/03 Nolu Asansör Revizyon Kararı"
              className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kayıt / Karar No
              </label>
              <input
                type="text"
                value={fileNumber}
                onChange={(e) => setFileNumber(e.target.value)}
                placeholder="KD-2025/04"
                className="w-full text-xs font-mono py-2 px-3 border border-slate-300 rounded-lg outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Format</label>
              <select
                value={fileFormat}
                onChange={(e) => setFileFormat(e.target.value as 'PDF' | 'DWG' | 'JPG')}
                className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg outline-none bg-white"
              >
                <option value="PDF">PDF (Taranmış Resmi Belge)</option>
                <option value="DWG">DWG (AutoCAD Mimari)</option>
                <option value="JPG">JPG / PNG (Yüksek Çözünürlük)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Dosya Boyutu</label>
              <input
                type="text"
                value={fileSize}
                onChange={(e) => setFileSize(e.target.value)}
                className="w-full text-xs font-mono py-2 px-3 border border-slate-300 rounded-lg outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Etiketler (Virgülle ayırın)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Karar Defteri, Asansör, 2025, Noter"
              className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Evrak Özeti & Karar Maddeleri
            </label>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Belgenin ana konusu ve sakinleri ilgilendiren kararlar..."
              className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg outline-none"
            />
          </div>

          {/* Secure Cloud Signature Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-600 flex items-start space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-800">256-bit SHA Dijital Mühür & Arşiv Güvenliği</p>
              <p className="text-slate-500">
                Yüklenen her resmi evraka otomatik olarak kriptografik hash damgası vurulur ve bulut depolama sunucularında değiştirilemez biçimde saklanır.
              </p>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center space-x-1.5"
            >
              <Upload className="w-4 h-4" />
              <span>Belgeyi Mühürle & Arşive Ekle</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
