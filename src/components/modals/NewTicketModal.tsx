import React, { useState } from 'react';
import { X, Wrench, AlertTriangle, CheckCircle } from 'lucide-react';
import { MaintenanceTicket, TicketCategory, TicketPriority } from '../../types';

interface NewTicketModalProps {
  currentUnitDisplay: string;
  currentResidentName: string;
  currentUnitId: string;
  onClose: () => void;
  onAddTicket: (ticket: MaintenanceTicket) => void;
}

const CATEGORIES: { value: TicketCategory; label: string }[] = [
  { value: 'elevator', label: 'Asansör Arızası' },
  { value: 'plumbing', label: 'Su Tesisatı & Hidrofor' },
  { value: 'electrical', label: 'Elektrik & Aydınlatma' },
  { value: 'gate', label: 'Otopark Bariyeri & Kapı Otomasyonu' },
  { value: 'landscape', label: 'Bahçe, Peyzaj & Sulama' },
  { value: 'cleaning', label: 'Temizlik & Ortak Alan Hijyeni' },
  { value: 'noise', label: 'Gürültü / Düzen Şikayeti' },
  { value: 'other', label: 'Diğer Arıza & Bakım Talebi' },
];

export const NewTicketModal: React.FC<NewTicketModalProps> = ({
  currentUnitDisplay,
  currentResidentName,
  currentUnitId,
  onClose,
  onAddTicket,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TicketCategory>('elevator');
  const [priority, setPriority] = useState<TicketPriority>('normal');
  const [location, setLocation] = useState('B Blok - Kat Holü');
  const [description, setDescription] = useState('');
  const [hasPhoto, setHasPhoto] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const now = new Date();
    const formattedNow = `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`;

    const newTicket: MaintenanceTicket = {
      id: `TCK-2025-${Math.floor(10 + Math.random() * 90)}`,
      unitId: currentUnitId,
      unitDisplay: currentUnitDisplay,
      residentName: currentResidentName,
      category,
      title,
      description,
      location,
      priority,
      status: 'submitted',
      createdAt: formattedNow,
      updatedAt: formattedNow,
      photoUrl: hasPhoto ? 'ariza_fotografi.jpg' : undefined,
    };

    onAddTicket(newTicket);
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
            <Wrench className="w-5 h-5 text-amber-400" />
            <h2 className="font-semibold text-base">Yeni Arıza & Bakım Talebi Bildir</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs flex justify-between">
            <div>
              <span className="text-slate-500 block">Bildiren Sakin:</span>
              <span className="font-bold text-slate-800">{currentResidentName}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Daire Bilgisi:</span>
              <span className="font-bold text-indigo-700">{currentUnitDisplay}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Arıza / Talep Başlığı *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: 2. Kat Koridor Lambası Yanmıyor"
              className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TicketCategory)}
                className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Aciliyet Derecesi</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TicketPriority)}
                className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              >
                <option value="low">Düşük (Rutin)</option>
                <option value="normal">Normal</option>
                <option value="high">Yüksek (Hızlı Müdahale)</option>
                <option value="urgent">Acil (Güvenlik / Su Baskını)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tam Konum / Mevki
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Örn: B Blok 4. Kat Merdiven Boşluğu"
              className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detaylı Açıklama
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Arızanın tam olarak ne zaman başladığı ve belirtileri..."
              className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-xs text-slate-700 font-medium">Fotoğraf / Görsel Ekle</span>
            <button
              type="button"
              onClick={() => setHasPhoto(!hasPhoto)}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                hasPhoto
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100'
              }`}
            >
              {hasPhoto ? '✓ Fotoğraf Eklendi' : '+ Fotoğraf Seç'}
            </button>
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
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center space-x-1.5"
            >
              <Wrench className="w-4 h-4" />
              <span>Talebi Yönetime İlet</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
