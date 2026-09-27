import React, { useState } from 'react';
import { X, MessageSquare, Megaphone, Tag, Vote, Send } from 'lucide-react';
import { CommunityPost, PostType } from '../../types';

interface NewPostModalProps {
  currentResidentName: string;
  currentUnitDisplay: string;
  isManager: boolean;
  onClose: () => void;
  onAddPost: (post: CommunityPost) => void;
}

export const NewPostModal: React.FC<NewPostModalProps> = ({
  currentResidentName,
  currentUnitDisplay,
  isManager,
  onClose,
  onAddPost,
}) => {
  const [type, setType] = useState<PostType>(isManager ? 'announcement' : 'marketplace');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [price, setPrice] = useState('');
  const [phone, setPhone] = useState('0536 123 45 67');
  const [urgent, setUrgent] = useState(false);
  const [pollOptions, setPollOptions] = useState(['Seçenek 1', 'Seçenek 2']);

  const handleAddPollOption = () => {
    if (pollOptions.length < 5) {
      setPollOptions([...pollOptions, `Seçenek ${pollOptions.length + 1}`]);
    }
  };

  const handleUpdatePollOption = (index: number, val: string) => {
    const updated = [...pollOptions];
    updated[index] = val;
    setPollOptions(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      authorName: currentResidentName,
      authorUnit: isManager ? 'Site Yönetim Kurulu' : currentUnitDisplay,
      authorRole: isManager ? 'manager' : 'resident',
      type,
      title: type === 'announcement' ? `📢 ${title}` : type === 'poll' ? `🗳️ ${title}` : title,
      content,
      date: new Date().toISOString().split('T')[0],
      pinned: isManager && urgent,
      urgent: isManager && urgent,
      likes: 0,
      userLiked: false,
      comments: [],
      price: type === 'marketplace' ? price : undefined,
      contactPhone: type === 'marketplace' ? phone : undefined,
      pollOptions:
        type === 'poll'
          ? pollOptions.map((text, idx) => ({ id: `opt-${idx + 1}`, text, votes: 0 }))
          : undefined,
    };

    onAddPost(newPost);
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
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            <h2 className="font-semibold text-base">Yeni Topluluk Paylaşımı Oluştur</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Post Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Paylaşım Türü
            </label>
            <div className="grid grid-cols-3 gap-2">
              {isManager && (
                <button
                  type="button"
                  onClick={() => setType('announcement')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition-colors ${
                    type === 'announcement'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Megaphone className="w-4 h-4 text-indigo-600" />
                  <span>Resmi Duyuru</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setType('marketplace')}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition-colors ${
                  type === 'marketplace'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Tag className="w-4 h-4 text-emerald-600" />
                <span>İkinci El & İlan</span>
              </button>

              <button
                type="button"
                onClick={() => setType('poll')}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition-colors ${
                  type === 'poll'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Vote className="w-4 h-4 text-purple-600" />
                <span>Şeffaf Anket / Oylama</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Başlık *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                type === 'marketplace'
                  ? 'Örn: Temiz Çalışma Masası ve Sandalye'
                  : type === 'poll'
                  ? 'Örn: Sosyal Tesis Açılış Kapanış Saatleri Oylaması'
                  : 'Örn: Su Deposu Yıllık Dezenfeksiyon Çalışması'
              }
              className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {type === 'marketplace' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fiyat / Bedel (₺)
                </label>
                <input
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Örn: 850 ₺ veya Ücretsiz"
                  className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  İletişim Telefonu
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg outline-none"
                />
              </div>
            </div>
          )}

          {type === 'poll' && (
            <div className="space-y-2 bg-purple-50/50 p-3 rounded-xl border border-purple-100">
              <label className="block text-xs font-semibold text-purple-950">
                Oylama Seçenekleri (En fazla 5 seçenek)
              </label>
              {pollOptions.map((opt, idx) => (
                <input
                  key={idx}
                  type="text"
                  value={opt}
                  onChange={(e) => handleUpdatePollOption(idx, e.target.value)}
                  placeholder={`Seçenek ${idx + 1}`}
                  className="w-full text-xs py-1.5 px-3 border border-purple-200 rounded-lg bg-white outline-none"
                />
              ))}
              {pollOptions.length < 5 && (
                <button
                  type="button"
                  onClick={handleAddPollOption}
                  className="text-xs text-purple-700 font-semibold hover:underline"
                >
                  + Seçenek Ekle
                </button>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              İçerik & Detaylar *
            </label>
            <textarea
              rows={4}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Ayrıntılı bilgi, tarih ve açıklamaları buraya yazabilirsiniz..."
              className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {isManager && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="urgent-check"
                checked={urgent}
                onChange={(e) => setUrgent(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <label htmlFor="urgent-check" className="text-xs text-slate-700 font-medium">
                Önemli / Başa Sabitle (Tüm sakinlere anlık bildirim gider)
              </label>
            </div>
          )}

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
              <Send className="w-3.5 h-3.5" />
              <span>Yayınla</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
