import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Image as ImageIcon,
  X,
  Sparkles,
  Volume2,
  VolumeX,
  RotateCcw,
  Globe,
  ShieldCheck,
  CheckCircle2,
  Copy,
  ExternalLink,
  ChevronDown,
  Search,
  User,
  Paperclip,
  Maximize2,
  Minimize2,
  AlertCircle,
  Plus,
  MessageSquare,
  Trash2,
  Layers,
  Clock,
  Shield
} from 'lucide-react';
import {
  tixaAiEngine,
  TixaAiSession,
  TixaAiMessage,
  TixaAiInboxSummary,
  TIXA_AI_33_LANGUAGES,
  SupportedAiLanguage
} from '../../core/tixaAiEngine';
import { authEngine } from '../../core/authEngine';
import confetti from 'canvas-confetti';

interface TixaAiDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth?: (mode: 'login' | 'register' | 'admin') => void;
  onOpenRbacAdmin?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const TixaAiDashboardModal: React.FC<TixaAiDashboardModalProps> = ({
  isOpen,
  onClose,
  onOpenAuth,
  onOpenRbacAdmin,
  onNavigateTab
}) => {
  const [session, setSession] = useState<TixaAiSession>(() => tixaAiEngine.getCurrentSession());
  const [inboxes, setInboxes] = useState<TixaAiInboxSummary[]>(() => tixaAiEngine.getUserInboxes());
  const [showInboxesDrawer, setShowInboxesDrawer] = useState(false);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [selectedImageMimeType, setSelectedImageMimeType] = useState<string>('image/png');
  const [imageFileName, setImageFileName] = useState<string>('');
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [langSearch, setLangSearch] = useState('');
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [previewImageModal, setPreviewImageModal] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [adminRedirecting, setAdminRedirecting] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentUser = authEngine.getCurrentUser();

  // Sync user state whenever authEngine emits changes or modal opens
  useEffect(() => {
    if (isOpen) {
      const activeSess = tixaAiEngine.syncUser(currentUser);
      setSession(activeSess);
      setInboxes(tixaAiEngine.getUserInboxes());
    }
  }, [isOpen, currentUser]);

  // Subscribe to engine state changes
  useEffect(() => {
    const unsub = tixaAiEngine.subscribe(() => {
      setSession(tixaAiEngine.getCurrentSession());
      setInboxes(tixaAiEngine.getUserInboxes());
    });
    return unsub;
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [session?.messages, loading, isOpen]);

  if (!isOpen) return null;

  const currentLangObj = TIXA_AI_33_LANGUAGES.find(l => l.code === session.language) || TIXA_AI_33_LANGUAGES[0];

  const filteredLanguages = TIXA_AI_33_LANGUAGES.filter(l =>
    l.name.toLowerCase().includes(langSearch.toLowerCase()) ||
    l.nativeName.toLowerCase().includes(langSearch.toLowerCase()) ||
    l.code.toLowerCase().includes(langSearch.toLowerCase())
  );

  // File / Image selection handler
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('অনুগ্রহ করে শুধুমাত্র ছবি (JPG, PNG, WebP) ফাইল নির্বাচন করুন।');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('ছবির আকার সর্বোচ্চ 10MB হতে পারবে।');
      return;
    }

    setImageFileName(file.name);
    setSelectedImageMimeType(file.type);

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setSelectedImageBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setSelectedImageBase64(null);
    setImageFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Submit User Message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputText.trim() && !selectedImageBase64) || loading) return;

    const messageText = inputText.trim();
    const imagePayload = selectedImageBase64 || undefined;
    const mimePayload = selectedImageMimeType;

    // Reset inputs
    setInputText('');
    setSelectedImageBase64(null);
    setImageFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';

    setLoading(true);

    try {
      await tixaAiEngine.sendMessage({
        text: messageText,
        imageBase64: imagePayload,
        imageMimeType: mimePayload,
        user: currentUser ? { id: currentUser.id, email: currentUser.email, name: currentUser.name } : undefined
      });
    } catch (err) {
      console.error('Send message failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create brand new isolated inbox for current user
  const handleCreateNewInbox = () => {
    tixaAiEngine.createNewSession(session.language, currentUser ? { id: currentUser.id, email: currentUser.email, name: currentUser.name } : undefined);
    setShowInboxesDrawer(false);
    confetti({ particleCount: 30, spread: 45 });
  };

  // Switch to another saved inbox of this user
  const handleSelectInbox = (inboxId: string) => {
    tixaAiEngine.switchInbox(inboxId);
    setShowInboxesDrawer(false);
  };

  // Delete an inbox
  const handleDeleteInbox = (e: React.MouseEvent, inboxId: string) => {
    e.stopPropagation();
    if (window.confirm('আপনি কি এই ইনবক্সটি মুছে ফেলতে চান?')) {
      tixaAiEngine.deleteInbox(inboxId);
    }
  };

  // Quick Prompt Click
  const handleQuickPrompt = (promptText: string) => {
    setInputText(promptText);
  };

  // Text-To-Speech
  const handleSpeakText = (msgId: string, text: string, langCode: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Text-to-Speech is not supported in this browser.');
      return;
    }

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    setSpeakingMsgId(msgId);

    const cleanText = text.replace(/[*#`_]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);

    const langMap: Record<string, string> = {
      bn: 'bn-BD',
      en: 'en-US',
      hi: 'hi-IN',
      ar: 'ar-SA',
      es: 'es-ES',
      fr: 'fr-FR',
      de: 'de-DE',
      zh: 'zh-CN',
      ja: 'ja-JP',
      ru: 'ru-RU'
    };

    utterance.lang = langMap[langCode] || 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    window.speechSynthesis.speak(utterance);
  };

  const handleCopyText = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const quickPromptsByLang: Record<string, string[]> = {
    bn: [
      'TIXAPAY কী এবং কীভাবে কাজ করে?',
      'Blue TIXA (BTX) ভিডিও রিওয়ার্ড কীভাবে আয় করব?',
      'bKash / Nagad / ক্রিপ্টো ডিপোজিট ও উইথড্র নিয়ম',
      'Dual-OTP (Gmail + SMS) ১৮০ সেকেন্ড সিকিউরিটি',
      'ট্রেডিং ও ফরেক্স (Gold/EUR/USD) ১০০x লিভারেজ',
      '৪ জন অনুমোদিত এডমিন অফিসার ও লাইভ সাপোর্ট'
    ],
    en: [
      'What is TIXAPAY blockchain architecture?',
      'How to earn Blue TIXA (BTX) video rewards & staking?',
      'Deposit and instant withdrawal guidelines',
      'Dual-OTP 180s military-grade security system',
      'Crypto & Forex trading with 100x leverage',
      'Contact live Admin Protocol officers'
    ]
  };

  const activePrompts = quickPromptsByLang[session.language] || quickPromptsByLang['en'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      {/* Admin Passcode Clearance Banner Modal (when secret code entered) */}
      {adminRedirecting && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 p-4">
          <div className="p-6 rounded-2xl bg-blue-950 border border-blue-400 text-center max-w-md space-y-3 shadow-2xl shadow-blue-500/50 animate-bounce">
            <ShieldCheck className="w-12 h-12 text-cyan-400 mx-auto animate-pulse" />
            <h4 className="text-lg font-bold text-white font-mono">
              SECRET ADMIN PROTOCOL RECOGNIZED
            </h4>
            <p className="text-xs text-blue-200 font-sans">
              গোপন কোড যাচাই সফল হয়েছে। ৪ জন এডমিন অফিসারের পাসওয়ার্ড লগইন ড্যাশবোর্ড লোড হচ্ছে...
            </p>
          </div>
        </div>
      )}

      {/* Main Modal Container */}
      <div
        id="tixa-ai-dashboard-modal"
        className={`w-full mx-auto my-auto bg-[#080d1e] border border-cyan-500/40 rounded-2xl sm:rounded-3xl shadow-2xl shadow-cyan-950/80 flex flex-col overflow-hidden transition-all duration-300 relative shrink-0 ${
          isExpanded ? 'h-[94vh] max-w-6xl' : 'h-[88vh] max-h-[780px] max-w-4xl'
        }`}
      >
        {/* ================================================================= */}
        {/* --- HEADER: TIXA AI NEURAL HUB & 33 LANGUAGES ---                 */}
        {/* ================================================================= */}
        <div className="px-4 py-3 sm:px-6 sm:py-3.5 bg-gradient-to-r from-blue-950/90 via-[#0a122e] to-indigo-950/90 border-b border-cyan-500/30 flex items-center justify-between gap-3 shrink-0">
          {/* Brand Left */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/30 shrink-0 flex items-center justify-center">
              <div className="w-full h-full rounded-[14px] bg-[#070c1d] flex items-center justify-center">
                <Bot className="w-6 h-6 text-cyan-300 animate-pulse" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#070c1d]" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-bold text-base sm:text-lg text-white truncate flex items-center gap-1.5">
                  <span>TIXAPAY AI</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                    33 LANGUAGES
                  </span>
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 truncate">
                <span className="inline-flex items-center gap-1 text-emerald-400 font-mono text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Isolated User Vault
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-[11px] font-mono text-cyan-300 truncate">
                  Admin Real-Time Sync
                </span>
              </div>
            </div>
          </div>

          {/* Controls Right */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Inboxes Switcher Button */}
            <button
              type="button"
              onClick={() => setShowInboxesDrawer(!showInboxesDrawer)}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-all shadow-sm ${
                showInboxesDrawer
                  ? 'bg-cyan-500 text-black font-bold border-cyan-400'
                  : 'bg-slate-900/90 border-slate-700/80 hover:border-cyan-500/80 text-cyan-300'
              }`}
              title="View all saved chat inboxes for this user"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Inboxes ({inboxes.length})</span>
            </button>

            {/* + New Chat Button */}
            <button
              type="button"
              onClick={handleCreateNewInbox}
              className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border border-blue-400/60 text-xs font-mono text-white flex items-center gap-1 font-bold shadow-md transition-all"
              title="Start a new chat inbox"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Chat</span>
            </button>

            {/* 33-Languages Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-cyan-500/80 text-xs font-mono text-white flex items-center gap-1.5 transition-all shadow-sm"
              >
                <span>{currentLangObj.flag}</span>
                <span className="hidden sm:inline font-semibold">{currentLangObj.nativeName}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isLangMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 sm:w-72 bg-[#0a1128] border border-cyan-500/40 rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-xl animate-fadeIn">
                  <div className="p-2 border-b border-slate-800 mb-1">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search 33 languages..."
                        value={langSearch}
                        onChange={(e) => setLangSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                    {filteredLanguages.map(l => (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => {
                          tixaAiEngine.setLanguage(l.code);
                          setIsLangMenuOpen(false);
                        }}
                        className={`w-full px-2.5 py-2 rounded-lg text-left text-xs font-mono flex items-center justify-between transition-colors ${
                          session.language === l.code
                            ? 'bg-blue-900/80 text-cyan-300 font-bold border border-cyan-500/50'
                            : 'hover:bg-slate-800/80 text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{l.flag}</span>
                          <span>{l.nativeName}</span>
                          <span className="text-[10px] text-slate-400">({l.name})</span>
                        </div>
                        {session.language === l.code && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Expand / Minimize */}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-xl bg-slate-900/80 border border-slate-700/80 hover:border-slate-500 text-slate-400 hover:text-white transition-colors hidden sm:flex"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900/80 border border-slate-700/80 hover:border-rose-500 text-slate-400 hover:text-rose-400 transition-colors"
              title="Close TIXA AI"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* --- USER / GUEST IDENTIFIER STRIP ---                             */}
        {/* ================================================================= */}
        <div className="px-4 py-2 bg-[#050917] border-b border-slate-800/80 flex items-center justify-between text-xs font-mono shrink-0">
          <div className="flex items-center gap-2 truncate">
            {currentUser ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-300 font-semibold truncate">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>User Vault: {currentUser.name} ({currentUser.email})</span>
              </span>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-slate-400 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>Guest Visitor Inbox</span>
                </span>
                {onOpenAuth && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAuth('login');
                    }}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 underline font-semibold"
                  >
                    Log In to save questions
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400 shrink-0">
            <span className="hidden sm:inline-flex items-center gap-1 text-cyan-300">
              <MessageSquare className="w-3 h-3 text-cyan-400" />
              <span className="truncate max-w-[140px] font-bold">{session.title || 'Chat'}</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
              {session.messages.length} Messages
            </span>
          </div>
        </div>

        {/* ================================================================= */}
        {/* --- INBOXES DRAWER / OVERLAY ---                                  */}
        {/* ================================================================= */}
        {showInboxesDrawer && (
          <div className="absolute top-[88px] left-0 bottom-0 w-full sm:w-80 bg-[#060b1b]/95 border-r border-cyan-500/40 z-40 backdrop-blur-xl p-4 flex flex-col shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <h4 className="font-mono font-bold text-sm text-white">
                  {currentUser ? `${currentUser.name}'s Inboxes` : 'Guest Inboxes'}
                </h4>
              </div>
              <button
                type="button"
                onClick={handleCreateNewInbox}
                className="px-2 py-1 rounded-lg bg-cyan-500 text-black font-bold font-mono text-xs flex items-center gap-1 hover:bg-cyan-400 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
              {inboxes.length === 0 ? (
                <div className="p-4 text-center text-xs font-mono text-slate-500">
                  No saved conversations yet.
                </div>
              ) : (
                inboxes.map(inbox => {
                  const isCurrent = session.id === inbox.id;
                  return (
                    <div
                      key={inbox.id}
                      onClick={() => handleSelectInbox(inbox.id)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-start justify-between gap-2 group ${
                        isCurrent
                          ? 'bg-blue-950/80 border-cyan-400 text-white shadow-md shadow-cyan-950/50'
                          : 'bg-slate-900/70 hover:bg-slate-800/80 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs font-mono truncate flex items-center gap-1.5">
                          <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? 'text-cyan-400' : 'text-slate-500'}`} />
                          <span className="truncate">{inbox.title}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate mt-1">
                          {inbox.lastSnippet}
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 text-[10px] font-mono text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(inbox.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span>•</span>
                          <span>{inbox.messageCount} msgs</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteInbox(e, inbox.id)}
                        className="p-1 rounded text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete inbox"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 text-center">
              <button
                type="button"
                onClick={() => setShowInboxesDrawer(false)}
                className="w-full py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-slate-300 hover:text-white"
              >
                Close Drawer
              </button>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* --- CHAT MESSAGES BODY ---                                        */}
        {/* ================================================================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar bg-gradient-to-b from-[#080d1e] via-[#060914] to-[#040710]">
          {session.messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isAdmin = msg.sender === 'admin';
            const isAi = msg.sender === 'ai';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[92%] sm:max-w-[85%] ${
                  isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {/* Avatar Icon */}
                <div className="shrink-0 mt-1">
                  {isUser ? (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold font-mono shadow">
                      U
                    </div>
                  ) : isAdmin ? (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-amber-600 flex items-center justify-center text-white text-xs font-bold font-mono shadow-lg shadow-rose-500/20">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-cyan-500/20">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>

                {/* Bubble Container */}
                <div
                  className={`rounded-2xl p-4 transition-all ${
                    isUser
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/10'
                      : isAdmin
                      ? 'bg-[#1a1128] border border-rose-500/50 text-slate-100 shadow-xl shadow-rose-950/40'
                      : 'bg-slate-900/90 border border-slate-700/80 text-slate-100 shadow-xl'
                  }`}
                >
                  {/* Sender Header */}
                  <div className="flex items-center justify-between gap-3 mb-1.5 pb-1 border-b border-white/10 text-[11px] font-mono">
                    <div className="flex items-center gap-1.5 font-bold">
                      {isUser && <span>You</span>}
                      {isAi && <span className="text-cyan-300 flex items-center gap-1"><Sparkles className="w-3 h-3" /> TIXA AI Intelligence</span>}
                      {isAdmin && (
                        <span className="text-rose-300 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                          <span>Official Admin: {msg.officerName || 'Officer'} ({msg.officerRole || 'SUPER_ADMIN'})</span>
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 opacity-80">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Attached Image (if any) */}
                  {msg.imageBase64 && (
                    <div className="mb-3 rounded-xl overflow-hidden border border-cyan-500/40 bg-black/50 relative group">
                      <img
                        src={msg.imageBase64}
                        alt="Shared Query Asset"
                        className="max-h-64 sm:max-h-72 w-full object-contain cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setPreviewImageModal(msg.imageBase64 || null)}
                      />
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-mono text-cyan-300">
                        Click to view full image
                      </div>
                    </div>
                  )}

                  {/* Message Content */}
                  <div className="text-sm whitespace-pre-wrap leading-relaxed font-sans select-text">
                    {msg.text}
                  </div>

                  {/* Bubble Action Controls (for AI and Admin replies) */}
                  {!isUser && (
                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
                      <div className="flex items-center gap-2">
                        {/* Audio TTS */}
                        <button
                          type="button"
                          onClick={() => handleSpeakText(msg.id, msg.text, msg.language || session.language)}
                          className="hover:text-cyan-300 p-1 rounded hover:bg-slate-800 transition-colors flex items-center gap-1 text-[11px]"
                          title="Listen in speech voice"
                        >
                          {speakingMsgId === msg.id ? (
                            <>
                              <VolumeX className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                              <span className="text-cyan-400">Stop</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>Listen</span>
                            </>
                          )}
                        </button>

                        {/* Copy text */}
                        <button
                          type="button"
                          onClick={() => handleCopyText(msg.id, msg.text)}
                          className="hover:text-white p-1 rounded hover:bg-slate-800 transition-colors flex items-center gap-1 text-[11px]"
                          title="Copy response"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>{copiedMsgId === msg.id ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>

                      <span className="text-[10px] text-slate-500">
                        {currentLangObj.flag} {msg.language?.toUpperCase() || 'BN'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {loading && (
            <div className="flex gap-3 max-w-[85%] mr-auto items-center animate-fadeIn">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-cyan-500/20">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-cyan-500/40 text-slate-300 text-xs font-mono flex items-center gap-2 shadow-lg">
                <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
                <span>TIXA AI is analyzing your inquiry & quantum blockchain telemetry...</span>
                <span className="flex gap-1 ml-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ================================================================= */}
        {/* --- QUICK ACTION PROMPT CHIPS ---                                 */}
        {/* ================================================================= */}
        <div className="px-4 py-2 bg-[#070b1a] border-t border-slate-800/90 shrink-0 overflow-x-auto flex gap-1.5 no-scrollbar">
          {activePrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleQuickPrompt(prompt)}
              className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-blue-950/80 border border-slate-700/80 hover:border-cyan-500/60 text-xs font-mono text-slate-300 hover:text-cyan-200 transition-all whitespace-nowrap shrink-0 shadow-sm"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* ================================================================= */}
        {/* --- IMAGE ATTACHMENT PREVIEW TRAY (IF ATTACHED) ---               */}
        {/* ================================================================= */}
        {selectedImageBase64 && (
          <div className="px-4 py-2 bg-slate-900/95 border-t border-cyan-500/30 flex items-center justify-between gap-3 animate-fadeIn shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-cyan-400/60 shrink-0 bg-black">
                <img src={selectedImageBase64} alt="Attached Preview" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-mono text-white font-bold truncate flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{imageFileName || 'Screenshot / Image'}</span>
                </div>
                <div className="text-[11px] text-cyan-300 font-mono">
                  TIXA AI Visual Engine Ready to Inspect
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClearImage}
              className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 border border-rose-500 text-rose-300 transition-colors"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ================================================================= */}
        {/* --- INPUT COMPOSER ---                                            */}
        {/* ================================================================= */}
        <div className="p-3 sm:p-4 bg-[#0a1024] border-t border-cyan-500/30 shrink-0">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleImageFileChange}
            />

            {/* Picture Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`p-2.5 sm:p-3 rounded-xl border transition-all flex items-center justify-center shrink-0 ${
                selectedImageBase64
                  ? 'bg-cyan-950 border-cyan-400 text-cyan-300'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-700 hover:border-cyan-500 text-slate-300 hover:text-cyan-300'
              }`}
              title="Upload picture / screenshot for AI analysis"
            >
              <ImageIcon className="w-5 h-5" />
            </button>

            {/* Message Text Input */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  selectedImageBase64
                    ? "ছবিটি সম্পর্কে প্রশ্ন লিখুন বা সরাসরি পাঠান..."
                    : `TIXA AI-কে প্রশ্ন করুন (${currentLangObj.nativeName} অথবা যেকোনো ৩৩ ভাষায়)...`
                }
                className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 text-sm text-white placeholder:text-slate-500 font-sans"
              />
            </div>

            {/* Send Button */}
            <button
              type="submit"
              disabled={loading || (!inputText.trim() && !selectedImageBase64)}
              className="px-4 sm:px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm font-mono tracking-wide shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-40 flex items-center justify-center gap-2 shrink-0"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>

          <div className="mt-2 text-center text-[10px] font-mono text-slate-500 flex items-center justify-center gap-2">
            <span>TIXAPAY AI Multimodal Engine</span>
            <span>•</span>
            <span>Per-User Question Isolation</span>
            <span>•</span>
            <span>Connected to Admin Terminal</span>
          </div>
        </div>
      </div>

      {/* Full Image Preview Modal */}
      {previewImageModal && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-fadeIn"
          onClick={() => setPreviewImageModal(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-slate-950 p-2 rounded-2xl border border-cyan-500/60 shadow-2xl">
            <button
              type="button"
              onClick={() => setPreviewImageModal(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900 border border-slate-700 text-white hover:text-rose-400"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={previewImageModal} alt="Expanded Asset Preview" className="max-h-[85vh] w-auto object-contain rounded-xl" />
          </div>
        </div>
      )}
    </div>
  );
};
