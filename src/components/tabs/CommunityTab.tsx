import React, { useState } from 'react';
import {
  MessageSquare,
  Megaphone,
  Tag,
  Vote,
  Heart,
  Share2,
  Send,
  PlusCircle,
  Pin,
  Clock,
  Phone,
  User,
  CheckCircle2,
} from 'lucide-react';
import { CommunityPost, PostType } from '../../types';
import { formatDate } from '../../utils/formatters';

interface CommunityTabProps {
  posts: CommunityPost[];
  currentResidentName: string;
  currentUnitDisplay: string;
  isResident: boolean;
  onOpenNewPost: () => void;
  onLikePost: (postId: string) => void;
  onVotePoll: (postId: string, optionId: string) => void;
  onAddComment: (postId: string, commentText: string) => void;
}

export const CommunityTab: React.FC<CommunityTabProps> = ({
  posts,
  currentResidentName,
  currentUnitDisplay,
  isResident,
  onOpenNewPost,
  onLikePost,
  onVotePoll,
  onAddComment,
}) => {
  const [filterType, setFilterType] = useState<'all' | PostType>('all');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const filteredPosts = posts.filter((p) => {
    if (filterType !== 'all' && p.type !== filterType) return false;
    return true;
  });

  const handleCommentSubmit = (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    onAddComment(postId, text);
    setCommentInputs({ ...commentInputs, [postId]: '' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Sakinler Arası İletişim, Duyurular ve Oylamalar
          </h2>
          <p className="text-xs text-slate-500">
            Komşularla dayanışma, yönetim resmi duyuruları, şeffaf anketler ve ikinci el ilan panosu.
          </p>
        </div>

        <button
          onClick={onOpenNewPost}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Yeni Paylaşım / İlan Aç</span>
        </button>
      </div>

      {/* Category Sub-Navigation */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3 overflow-x-auto text-xs">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-xl font-semibold transition-colors shrink-0 ${
            filterType === 'all'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Tüm Akış ({posts.length})
        </button>

        <button
          onClick={() => setFilterType('announcement')}
          className={`px-3 py-1.5 rounded-xl font-semibold transition-colors flex items-center space-x-1.5 shrink-0 ${
            filterType === 'announcement'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Megaphone className="w-3.5 h-3.5" />
          <span>Resmi Duyurular</span>
        </button>

        <button
          onClick={() => setFilterType('poll')}
          className={`px-3 py-1.5 rounded-xl font-semibold transition-colors flex items-center space-x-1.5 shrink-0 ${
            filterType === 'poll'
              ? 'bg-purple-600 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Vote className="w-3.5 h-3.5" />
          <span>Şeffaf Anket & Oylama</span>
        </button>

        <button
          onClick={() => setFilterType('marketplace')}
          className={`px-3 py-1.5 rounded-xl font-semibold transition-colors flex items-center space-x-1.5 shrink-0 ${
            filterType === 'marketplace'
              ? 'bg-emerald-600 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>Komşu İkinci El / İlan</span>
        </button>
      </div>

      {/* Posts Stream */}
      <div className="space-y-5">
        {filteredPosts.map((post) => {
          const totalPollVotes =
            post.pollOptions?.reduce((acc, opt) => acc + opt.votes, 0) || 1;

          return (
            <div
              key={post.id}
              className={`bg-white border rounded-2xl p-6 shadow-xs space-y-4 transition-all ${
                post.pinned
                  ? 'border-indigo-300 ring-1 ring-indigo-200/50 bg-gradient-to-b from-indigo-50/20 to-white'
                  : 'border-slate-200'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white ${
                      post.authorRole === 'manager'
                        ? 'bg-indigo-700 shadow-xs'
                        : 'bg-emerald-600'
                    }`}
                  >
                    {post.authorName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 text-sm">{post.authorName}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          post.authorRole === 'manager'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {post.authorUnit}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(post.date)}</span>
                      {post.type === 'marketplace' && post.price && (
                        <>
                          <span>•</span>
                          <span className="font-bold text-emerald-700 text-xs">
                            Fiyat: {post.price}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {post.pinned && (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                    <Pin className="w-3 h-3 text-amber-700" />
                    <span>Önemli Duyuru</span>
                  </span>
                )}
              </div>

              {/* Title & Body */}
              <div className="space-y-2">
                <h3 className="text-base font-bold text-slate-900">{post.title}</h3>
                <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                  {post.content}
                </div>
              </div>

              {/* Interactive Poll / Voting UI */}
              {post.type === 'poll' && post.pollOptions && (
                <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-4 space-y-3">
                  <div className="text-xs font-bold text-purple-950 uppercase tracking-wider flex items-center justify-between">
                    <span>Kat Malikleri Canlı Oylama</span>
                    <span className="font-mono text-purple-700">
                      Toplam {totalPollVotes} Oy Kullanıldı
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {post.pollOptions.map((option) => {
                      const percentage = Math.round((option.votes / totalPollVotes) * 100) || 0;
                      const isVoted = post.userVotedOptionId === option.id;

                      return (
                        <div
                          key={option.id}
                          onClick={() => onVotePoll(post.id, option.id)}
                          className={`relative border rounded-xl p-3 cursor-pointer transition-all overflow-hidden ${
                            isVoted
                              ? 'border-purple-600 bg-purple-50 ring-1 ring-purple-400'
                              : 'border-slate-200 bg-white hover:border-purple-300'
                          }`}
                        >
                          {/* Progress fill */}
                          <div
                            className="absolute top-0 bottom-0 left-0 bg-purple-100/70 transition-all duration-500 pointer-events-none"
                            style={{ width: `${percentage}%` }}
                          />

                          <div className="relative flex items-center justify-between text-xs z-10">
                            <span className="font-medium text-slate-900 flex items-center space-x-1.5">
                              {isVoted && <CheckCircle2 className="w-4 h-4 text-purple-700 shrink-0" />}
                              <span>{option.text}</span>
                            </span>
                            <span className="font-mono font-bold text-purple-900">
                              %{percentage} ({option.votes} oy)
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Marketplace Contact Details */}
              {post.type === 'marketplace' && post.contactPhone && (
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 text-xs flex items-center justify-between">
                  <span className="text-emerald-900">
                    İlgilenen komşularımız doğrudan iletişime geçebilir:
                  </span>
                  <a
                    href={`tel:${post.contactPhone}`}
                    className="inline-flex items-center space-x-1 font-mono font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-emerald-200"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{post.contactPhone}</span>
                  </a>
                </div>
              )}

              {/* Likes & Comments Count */}
              <div className="pt-2 border-t border-slate-100 flex items-center space-x-4 text-xs text-slate-500">
                <button
                  onClick={() => onLikePost(post.id)}
                  className={`flex items-center space-x-1.5 font-semibold transition-colors ${
                    post.userLiked ? 'text-rose-600' : 'hover:text-rose-600'
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 ${post.userLiked ? 'fill-rose-600 text-rose-600' : ''}`}
                  />
                  <span>{post.likes} Beğeni</span>
                </button>

                <div className="flex items-center space-x-1.5">
                  <MessageSquare className="w-4 h-4 text-slate-400" />
                  <span>{post.comments.length} Yorum</span>
                </div>
              </div>

              {/* Existing Comments list */}
              {post.comments.length > 0 && (
                <div className="bg-slate-50 rounded-xl p-3 space-y-2 text-xs">
                  {post.comments.map((comment) => (
                    <div key={comment.id} className="text-slate-700 space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <strong className="text-slate-900 font-semibold">{comment.authorName}</strong>
                        <span className="text-[10px] text-slate-400 font-mono">({comment.authorUnit})</span>
                        <span className="text-[10px] text-slate-400">• {comment.date}</span>
                      </div>
                      <p className="text-slate-600 pl-1">{comment.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* New Comment Input */}
              <form
                onSubmit={(e) => handleCommentSubmit(post.id, e)}
                className="flex items-center space-x-2 pt-1"
              >
                <input
                  type="text"
                  value={commentInputs[post.id] || ''}
                  onChange={(e) =>
                    setCommentInputs({ ...commentInputs, [post.id]: e.target.value })
                  }
                  placeholder="Komşunuza saygılı bir yorum yazın..."
                  className="flex-1 text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <button
                  type="submit"
                  className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors"
                  aria-label="Yorumu Gönder"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
};
