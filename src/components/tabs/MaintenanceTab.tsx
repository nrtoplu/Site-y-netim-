import React, { useState } from 'react';
import {
  Wrench,
  PlusCircle,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Phone,
  UserCheck,
  Star,
  MessageSquare,
  Search,
  Filter,
  MapPin,
  Check,
} from 'lucide-react';
import { MaintenanceTicket, TicketStatus, TicketPriority, TicketCategory } from '../../types';
import { formatDate, formatCurrency } from '../../utils/formatters';

interface MaintenanceTabProps {
  tickets: MaintenanceTicket[];
  isResident: boolean;
  residentName?: string;
  residentUnitDisplay?: string;
  onOpenNewTicket: () => void;
  onUpdateTicketStatus: (ticketId: string, newStatus: TicketStatus, adminNotes?: string) => void;
  onRateTicket: (ticketId: string, rating: number) => void;
}

const CATEGORY_ICONS: Record<TicketCategory, string> = {
  elevator: '🛗 Asansör',
  plumbing: '🚰 Tesisat & Su',
  electrical: '⚡ Elektrik',
  gate: '🚧 Otopark & Kapı',
  landscape: '🌳 Bahçe & Peyzaj',
  cleaning: '🧹 Temizlik',
  noise: '🔊 Gürültü',
  other: '🔧 Diğer',
};

const STATUS_LABELS: Record<TicketStatus, { label: string; color: string }> = {
  submitted: { label: 'Talebiniz Alındı', color: 'bg-slate-100 text-slate-800' },
  in_review: { label: 'İnceleniyor', color: 'bg-blue-50 text-blue-800' },
  assigned: { label: 'Usta / Firma Atandı', color: 'bg-indigo-50 text-indigo-800' },
  in_progress: { label: 'Onarım Sürüyor', color: 'bg-amber-50 text-amber-800' },
  completed: { label: 'Tamamlandı & Çözüldü', color: 'bg-emerald-50 text-emerald-800' },
};

export const MaintenanceTab: React.FC<MaintenanceTabProps> = ({
  tickets,
  isResident,
  residentName,
  residentUnitDisplay = 'B Blok No:14',
  onOpenNewTicket,
  onUpdateTicketStatus,
  onRateTicket,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<'all' | TicketStatus>('all');
  const [selectedPriority, setSelectedPriority] = useState<'all' | TicketPriority>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  const filteredTickets = tickets.filter((t) => {
    // If resident: only show their own unit's tickets and general common area tickets
    if (isResident) {
      const isMyUnit =
        t.unitDisplay === residentUnitDisplay ||
        (residentName && t.residentName.toLowerCase().includes(residentName.toLowerCase()));
      const isCommonArea =
        t.location.toLowerCase().includes('ortak') ||
        t.location.toLowerCase().includes('bina') ||
        t.location.toLowerCase().includes('bahçe') ||
        t.location.toLowerCase().includes('asansör') ||
        t.location.toLowerCase().includes('otopark') ||
        t.category === 'elevator' ||
        t.category === 'gate' ||
        t.category === 'landscape';

      if (!isMyUnit && !isCommonArea) {
        return false;
      }
    }

    if (selectedStatus !== 'all' && t.status !== selectedStatus) return false;
    if (selectedPriority !== 'all' && t.priority !== selectedPriority) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description.toLowerCase().includes(q);
      const matchLoc = t.location.toLowerCase().includes(q);
      const matchUnit = t.unitDisplay.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchLoc && !matchUnit) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Arıza & Bakım Onarım Talep Sistemi
          </h2>
          <p className="text-xs text-slate-500">
            Ortak alan ve bina teknik arızalarının anlık takibi, teknisyen atamaları ve sakin memnuniyet anketi.
          </p>
        </div>

        <button
          onClick={onOpenNewTicket}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Yeni Arıza Bildirimi Aç</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="w-full md:w-72 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Arıza adı, yer veya daire ara..."
            className="w-full text-xs py-2 pl-9 pr-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status buttons */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                selectedStatus === 'all' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              Tümü ({tickets.length})
            </button>
            <button
              onClick={() => setSelectedStatus('assigned')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                selectedStatus === 'assigned' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              İşlemde
            </button>
            <button
              onClick={() => setSelectedStatus('completed')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                selectedStatus === 'completed' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              Çözüldü
            </button>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400">
            Arama kriterlerinize uygun arıza veya bakım talebi bulunamadı.
          </div>
        ) : (
          filteredTickets.map((ticket) => {
            const statusInfo = STATUS_LABELS[ticket.status];
            const isCompleted = ticket.status === 'completed';

            return (
              <div
                key={ticket.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all space-y-4"
              >
                {/* Top Row: Category, Priority, ID & Status Badge */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-xs px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
                      {CATEGORY_ICONS[ticket.category] || ticket.category}
                    </span>

                    {/* Priority Badge */}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        ticket.priority === 'urgent'
                          ? 'bg-rose-100 text-rose-800'
                          : ticket.priority === 'high'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {ticket.priority === 'urgent'
                        ? 'Acil Öncelik'
                        : ticket.priority === 'high'
                        ? 'Yüksek Öncelik'
                        : 'Normal'}
                    </span>

                    <span className="text-xs font-mono text-slate-400">{ticket.id}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full border ${statusInfo.color}`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>
                </div>

                {/* Middle: Title, Description, Location */}
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {ticket.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{ticket.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-slate-500 pt-1">
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{ticket.location}</span>
                    </span>
                    <span>•</span>
                    <span>Bildiren: <strong className="text-slate-700">{ticket.residentName}</strong> ({ticket.unitDisplay})</span>
                    <span>•</span>
                    <span>{ticket.createdAt}</span>
                  </div>
                </div>

                {/* Progress Steps Timeline */}
                <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
                  <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                    <div className="space-y-1">
                      <div className="h-1.5 rounded-full bg-emerald-500" />
                      <span className="font-semibold text-emerald-800">1. Alındı</span>
                    </div>
                    <div className="space-y-1">
                      <div
                        className={`h-1.5 rounded-full ${
                          ticket.status !== 'submitted' ? 'bg-emerald-500' : 'bg-slate-200'
                        }`}
                      />
                      <span
                        className={
                          ticket.status !== 'submitted'
                            ? 'font-semibold text-emerald-800'
                            : 'text-slate-400'
                        }
                      >
                        2. İncelendi
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div
                        className={`h-1.5 rounded-full ${
                          ticket.status === 'assigned' ||
                          ticket.status === 'in_progress' ||
                          ticket.status === 'completed'
                            ? 'bg-emerald-500'
                            : 'bg-slate-200'
                        }`}
                      />
                      <span
                        className={
                          ticket.status === 'assigned' ||
                          ticket.status === 'in_progress' ||
                          ticket.status === 'completed'
                            ? 'font-semibold text-emerald-800'
                            : 'text-slate-400'
                        }
                      >
                        3. Usta Atandı
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div
                        className={`h-1.5 rounded-full ${
                          ticket.status === 'completed' ? 'bg-emerald-500' : 'bg-slate-200'
                        }`}
                      />
                      <span
                        className={
                          ticket.status === 'completed'
                            ? 'font-semibold text-emerald-800'
                            : 'text-slate-400'
                        }
                      >
                        4. Çözüldü
                      </span>
                    </div>
                  </div>
                </div>

                {/* Technician & Management Notes Box */}
                {(ticket.assignedTechnician || ticket.adminNotes) && (
                  <div className="bg-indigo-50/40 border border-indigo-100 rounded-xl p-3 text-xs space-y-1.5">
                    {ticket.assignedTechnician && (
                      <div className="flex items-center justify-between text-indigo-950 font-semibold">
                        <span className="flex items-center space-x-1.5">
                          <UserCheck className="w-4 h-4 text-indigo-600" />
                          <span>Görevlendirilen Usta: {ticket.assignedTechnician}</span>
                        </span>
                        {ticket.technicianPhone && (
                          <span className="flex items-center space-x-1 text-indigo-700 font-mono text-[11px]">
                            <Phone className="w-3 h-3" />
                            <span>{ticket.technicianPhone}</span>
                          </span>
                        )}
                      </div>
                    )}

                    {ticket.adminNotes && (
                      <div className="text-slate-600 text-[11px] pt-1 border-t border-indigo-100/60">
                        <strong>Yönetici Güncellemesi:</strong> {ticket.adminNotes}
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons for Management and Rating for Resident */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  {/* Resident Satisfaction Rating */}
                  {isCompleted ? (
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="text-slate-600 font-medium">Sakin Memnuniyet Puanı:</span>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => onRateTicket(ticket.id, star)}
                            className="text-amber-400 hover:scale-110 transition-transform"
                            title={`${star} Yıldız Ver`}
                          >
                            <Star
                              className={`w-4 h-4 ${
                                (ticket.residentRating || 0) >= star
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500">
                      Onarım süreci devam etmektedir.
                    </div>
                  )}

                  {/* Manager Controls: Update Status */}
                  {!isResident && !isCompleted && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          onUpdateTicketStatus(
                            ticket.id,
                            'assigned',
                            'Teknik servis yönlendirildi, malzeme temin ediliyor.'
                          )
                        }
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Usta Ata / Güncelle
                      </button>

                      <button
                        onClick={() =>
                          onUpdateTicketStatus(
                            ticket.id,
                            'completed',
                            'Arıza giderilmiş, sızdırmazlık ve test kontrolleri tamamlanmıştır.'
                          )
                        }
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center space-x-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Tamamlandı Olarak Kapat</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
