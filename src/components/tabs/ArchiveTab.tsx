import React, { useState } from 'react';
import {
  FolderArchive,
  Search,
  PlusCircle,
  FileText,
  ShieldCheck,
  Download,
  Calendar,
  Eye,
  Tag,
  Hash,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { ArchiveDocument, DocumentCategory } from '../../types';
import { formatDate } from '../../utils/formatters';

interface ArchiveTabProps {
  documents: ArchiveDocument[];
  isResident: boolean;
  onOpenNewDocument: () => void;
  onViewDocument: (doc: ArchiveDocument) => void;
}

const CATEGORY_NAMES: Record<DocumentCategory, { title: string; color: string }> = {
  decision_book: { title: 'Karar Defteri (Noter Onaylı)', color: 'bg-amber-50 text-amber-900 border-amber-200' },
  contract: { title: 'Hizmet & Bakım Sözleşmeleri', color: 'bg-indigo-50 text-indigo-900 border-indigo-200' },
  insurance: { title: 'Ortak Alan Sigorta Poliçeleri', color: 'bg-emerald-50 text-emerald-900 border-emerald-200' },
  blueprint: { title: 'Mimari & Statik Tesisat Projeleri', color: 'bg-sky-50 text-sky-900 border-sky-200' },
  audit_report: { title: 'Mali Denetim & İbra Raporları', color: 'bg-purple-50 text-purple-900 border-purple-200' },
  invoice: { title: 'Fatura & Dekont Arşivi', color: 'bg-slate-100 text-slate-800 border-slate-200' },
};

export const ArchiveTab: React.FC<ArchiveTabProps> = ({
  documents,
  isResident,
  onOpenNewDocument,
  onViewDocument,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | DocumentCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDocs = documents.filter((doc) => {
    // End-user / Resident Restricted Access: hide confidential manager & auditor internal files
    if (isResident && doc.accessRole && doc.accessRole !== 'all') {
      return false;
    }

    if (selectedCategory !== 'all' && doc.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = doc.title.toLowerCase().includes(q);
      const matchNo = doc.fileNumber.toLowerCase().includes(q);
      const matchTags = doc.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchNo && !matchTags) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Dijital Arşivleme & Resmi Karar Defteri Modülü
          </h2>
          <p className="text-xs text-slate-500">
            Site karar defterleri, asansör sözleşmeleri, sigorta poliçeleri ve mimari projelerin SHA-256 mühürlü bulut kasası.
          </p>
        </div>

        {!isResident && (
          <button
            onClick={onOpenNewDocument}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center space-x-1.5 self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Arşive Resmi Evrak Ekle</span>
          </button>
        )}
      </div>

      {/* Cloud Security Banner for Digital Archive */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 shadow-md flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
            <Lock className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-100 flex items-center space-x-2">
              <span>Değiştirilemez Kriptografik Dijital Arşiv (WORM Korumalı)</span>
              <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-mono">
                SHA-256 AKTİF
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Yüklenen belgeler Kat Mülkiyeti Kanunu ve KVKK uyarınca 10 yıl yasal saklama güvencesi altındadır.
            </p>
          </div>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="w-full md:w-80 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Belge adı, karar no, etiket ara..."
            className="w-full text-xs py-2 pl-9 pr-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="text-xs py-2 px-3 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-700"
          >
            <option value="all">Tüm Arşiv Kategorileri ({documents.length})</option>
            {Object.entries(CATEGORY_NAMES).map(([key, item]) => (
              <option key={key} value={key}>
                {item.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Documents Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => {
          const catInfo = CATEGORY_NAMES[doc.category] || {
            title: doc.category,
            color: 'bg-slate-100 text-slate-800',
          };

          return (
            <div
              key={doc.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold border ${catInfo.color}`}
                  >
                    {catInfo.title}
                  </span>
                  <span className="font-mono text-[11px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded">
                    {doc.fileFormat} • {doc.fileSize}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                    {doc.title}
                  </h3>
                  <div className="text-[11px] text-indigo-700 font-mono font-semibold mt-1">
                    No: {doc.fileNumber}
                  </div>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {doc.summary}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {doc.tags.slice(0, 3).map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Details & Action */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">{formatDate(doc.date)}</span>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => onViewDocument(doc)}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>İncele</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
