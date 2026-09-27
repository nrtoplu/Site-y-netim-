/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  X,
  Send,
  Sparkles,
  Maximize2,
  Minimize2,
  Trash2,
  HelpCircle,
  Building2,
  FileSpreadsheet,
  Users,
  Briefcase,
  Scale,
  ChevronDown,
} from 'lucide-react';
import { TenantSite, UserRole } from '../../types';

interface AIAssistantWidgetProps {
  currentSite: TenantSite;
  activeRole: UserRole;
  onNavigateTab?: (tab: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const AIAssistantWidget: React.FC<AIAssistantWidgetProps> = ({
  currentSite,
  activeRole,
  onNavigateTab,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const initialWelcomeText = `Merhaba! Ben **ApsisAI**, sitenizin yapay zeka destekli yönetim ve mevzuat asistanıyım. 

634 Sayılı Kat Mülkiyeti Kanunu (KMK), aidat gecikme tazminatları (%5), **Banka Excel Ekstresi ile uyuşmayan havale atama**, **Bölgedeki ustalardan teklif toplama**, sakin kayıt onayları ve denetçi raporları hakkında her şeyi bana sorabilirsiniz.`;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: initialWelcomeText,
      timestamp: 'Şimdi',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          siteName: currentSite.profile.siteName,
          userRole: activeRole,
        }),
      });

      if (!response.ok) {
        throw new Error(`Sunucu yanıt vermedi (${response.status})`);
      }

      const data = await response.json();
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'Cevap alınamadı.',
        timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: unknown) {
      // Offline fallback
      const errorMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: `**ApsisAI Bilgi Bankası:**
"${query}" sorunuz incelendi. 
- **Usta Teklifleri için:** Sol menüdeki "Usta & Firma Teklifleri" sekmesinden yeni teklif çağrısı açabilir, gelen teklifleri onayladığınızda firmaya anında bilgi iletebilirsiniz.
- **Banka Ekstresi için:** "Banka Excel & Havale Eşleme" sekmesinden uyuşmayan havaleleri ilgili daireye tek tıkla atayabilirsiniz.
- **KMK Aidat için:** Kat Mülkiyeti Kanunu Madde 20 uyarınca geciken aidata aylık %5 faiz uygulanır.`,
        timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const QUICK_QUESTIONS = [
    {
      title: 'Usta Teklifleri',
      icon: Briefcase,
      text: 'Bölgedeki ustalardan ve firmalardan nasıl teklif toplayıp onaylarım? Onaylanan firmaya bilgi nasıl gider?',
    },
    {
      title: 'Banka Ekstresi',
      icon: FileSpreadsheet,
      text: 'Banka ekstresinde ismi sakinle uyuşmayan veya açıklaması eksik ödemeleri daireye nasıl atarım?',
    },
    {
      title: 'Aidat Gecikme Faizi',
      icon: Scale,
      text: 'Kat Mülkiyeti Kanununa göre aidatını ödemeyen sakine kanunen ne kadar gecikme faizi uygulanır?',
    },
    {
      title: 'Yönetici & Denetçi',
      icon: Users,
      text: 'Sitede denetçi nasıl atanır ve genel kurulda yeni yöneticiye devir-teslim nasıl yapılır?',
    },
  ];

  return (
    <div className="fixed bottom-4 right-4 z-40 font-sans print:hidden">
      {/* Collapsed Pill Button */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="group flex items-center space-x-2.5 px-4 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 border border-white/20"
          aria-label="ApsisAI Asistanı Aç"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-300 rounded-full border-2 border-emerald-700 animate-pulse" />
          </div>
          <div className="text-left">
            <span className="text-xs font-bold block leading-tight flex items-center gap-1">
              ApsisAI Asistan
              <Sparkles className="w-3 h-3 text-amber-300" />
            </span>
            <span className="text-[10px] text-emerald-100 font-medium block leading-tight">
              KMK & Sistem Danışmanı
            </span>
          </div>
        </button>
      )}

      {/* Expanded Chat Box */}
      {isOpen && (
        <div
          className={`bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden transition-all duration-300 ${
            isMinimized
              ? 'w-80 h-14'
              : 'w-[94vw] sm:w-[440px] h-[580px] max-h-[85vh]'
          }`}
        >
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  ApsisAI • Yönetim & KMK Asistanı
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </h3>
                <p className="text-[10px] text-slate-300">
                  {currentSite.profile.siteName} • 7/24 Akıllı Destek
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1 text-slate-300">
              <button
                onClick={() =>
                  setMessages([
                    {
                      id: 'welcome',
                      sender: 'assistant',
                      text: initialWelcomeText,
                      timestamp: 'Şimdi',
                    },
                  ])
                }
                title="Sohbeti Temizle"
                className="p-1 hover:text-white hover:bg-white/10 rounded-lg text-slate-400 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? 'Büyüt' : 'Küçült'}
                className="p-1 hover:text-white hover:bg-white/10 rounded-lg text-slate-400 transition"
              >
                {isMinimized ? (
                  <Maximize2 className="w-3.5 h-3.5" />
                ) : (
                  <Minimize2 className="w-3.5 h-3.5" />
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Kapat"
                className="p-1 hover:text-white hover:bg-white/10 rounded-lg text-slate-400 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body when not minimized */}
          {!isMinimized && (
            <>
              {/* Quick Prompt Chips */}
              <div className="p-2.5 bg-slate-50 border-b border-slate-200 shrink-0 overflow-x-auto flex items-center space-x-1.5 no-scrollbar">
                {QUICK_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(q.text)}
                    disabled={isLoading}
                    className="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-lg text-[11px] font-medium text-slate-700 hover:text-indigo-700 whitespace-nowrap transition flex items-center space-x-1 shrink-0 shadow-2xs"
                  >
                    <q.icon className="w-3 h-3 text-indigo-500" />
                    <span>{q.title}</span>
                  </button>
                ))}
              </div>

              {/* Messages Container */}
              <div className="flex-1 p-3.5 overflow-y-auto space-y-3 text-xs bg-gradient-to-b from-white to-slate-50/50">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl p-3 shadow-xs leading-relaxed whitespace-pre-wrap ${
                        msg.sender === 'user'
                          ? 'bg-indigo-600 text-white rounded-br-xs'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[9px] text-slate-400 mt-0.5 px-1">
                      {msg.timestamp}
                    </span>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-center space-x-2 text-slate-500 bg-white border border-slate-200 p-2.5 rounded-2xl w-fit shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
                    <span className="text-xs">ApsisAI yanıt hazırlıyor...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3 bg-white border-t border-slate-200 shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="KMK, aidat, usta teklifi veya ekstre hakkında sorun..."
                    disabled={isLoading}
                    className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 placeholder-slate-400"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim() || isLoading}
                    className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-xl shadow-xs transition"
                    title="Gönder"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
                <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 px-1">
                  <span>Gemini 3.8 Flash & KMK Bilgi Bankası</span>
                  <span>Enter ↵ ile gönder</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
