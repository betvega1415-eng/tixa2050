import React, { useState, useEffect } from 'react';
import {
  Bot,
  MessageSquare,
  ShieldCheck,
  Send,
  Image as ImageIcon,
  CheckCircle2,
  RefreshCw,
  Search,
  User,
  Clock,
  Globe,
  Sparkles,
  AlertTriangle,
  FileText,
  Filter,
  Check,
  Trash2,
  Lock
} from 'lucide-react';
import { authEngine } from '../../core/authEngine';
import confetti from 'canvas-confetti';

interface ServerSessionData {
  id: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  isGuest: boolean;
  language: string;
  createdAt: number;
  updatedAt: number;
  status: 'ACTIVE' | 'RESOLVED' | 'ADMIN_ATTENDING';
  messages: Array<{
    id: string;
    sender: 'user' | 'ai' | 'admin';
    text: string;
    imageBase64?: string;
    imageMimeType?: string;
    timestamp: number;
    language: string;
    officerName?: string;
    officerRole?: string;
  }>;
  hasImageQuery: boolean;
  ipAddress?: string;
}

export const TixaAiAdminMonitor: React.FC = () => {
  const [sessions, setSessions] = useState<ServerSessionData[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'RESOLVED' | 'HAS_IMAGE'>('ALL');
  const [adminReplyText, setAdminReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const currentAdmin = authEngine.getCurrentAdmin();

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/tixa-ai/sessions');
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.sessions)) {
        setSessions(data.sessions);
        if (!selectedSessionId && data.sessions.length > 0) {
          setSelectedSessionId(data.sessions[0].id);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch TIXA AI sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 4000); // live polling every 4s
    return () => clearInterval(interval);
  }, []);

  const selectedSession = sessions.find(s => s.id === selectedSessionId) || sessions[0];

  // Send official Admin reply
  const handleSendAdminReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSession || !adminReplyText.trim() || isSendingReply) return;

    setIsSendingReply(true);
    try {
      const res = await fetch('/api/tixa-ai/admin-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: selectedSession.id,
          adminId: currentAdmin?.id || 'dr_vance',
          officerName: currentAdmin?.name || 'Protocol Officer',
          officerRole: currentAdmin?.role || 'SUPER_ADMIN',
          text: adminReplyText.trim()
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAdminReplyText('');
        confetti({ particleCount: 30, spread: 45 });
        fetchSessions();
      }
    } catch (err) {
      console.error('Failed to send admin reply:', err);
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleUpdateStatus = async (sessionId: string, newStatus: 'ACTIVE' | 'RESOLVED') => {
    try {
      await fetch('/api/tixa-ai/update-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, status: newStatus })
      });
      fetchSessions();
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  const handleClearSession = async (sessionId: string) => {
    if (!window.confirm('Delete this AI chat session from server storage?')) return;
    try {
      await fetch('/api/tixa-ai/clear-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
      fetchSessions();
    } catch (err) {
      console.error('Clear failed:', err);
    }
  };

  // Quick reply presets
  const handleQuickTemplate = (text: string) => {
    setAdminReplyText(text);
  };

  const filteredSessions = sessions.filter(s => {
    if (filterStatus === 'ACTIVE' && s.status === 'RESOLVED') return false;
    if (filterStatus === 'RESOLVED' && s.status !== 'RESOLVED') return false;
    if (filterStatus === 'HAS_IMAGE' && !s.hasImageQuery) return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchEmail = s.userEmail?.toLowerCase().includes(q);
      const matchName = s.userName?.toLowerCase().includes(q);
      const matchId = s.id.toLowerCase().includes(q);
      const matchMessage = s.messages.some(m => m.text.toLowerCase().includes(q));
      return matchEmail || matchName || matchId || matchMessage;
    }
    return true;
  });

  const totalImageQueries = sessions.filter(s => s.hasImageQuery).length;
  const totalActive = sessions.filter(s => s.status !== 'RESOLVED').length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Metric Strip */}
      <div className="bg-gradient-to-r from-blue-950/80 via-[#0b132b] to-indigo-950/80 border border-blue-500/40 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950 border border-blue-500/60 text-blue-300 text-xs font-mono">
            <Bot className="w-3.5 h-3.5 text-cyan-400" />
            <span>TIXA AI PROTOCOL CHAT & INTELLIGENCE MONITOR</span>
          </div>
          <h2 className="text-2xl font-bold text-white font-heading">
            Live Support & 33-Language Chat Oversight
          </h2>
          <p className="text-xs text-slate-400">
            Real-time feed of all visitor & user interactions across 33 global languages with visual image analysis and live Admin takeover capability.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchSessions}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-cyan-500 text-xs font-mono text-cyan-300 hover:text-white flex items-center gap-2 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Feed</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
          <div className="text-[11px] font-mono text-slate-400">Total Conversations</div>
          <div className="text-xl font-bold text-white font-mono">{sessions.length}</div>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
          <div className="text-[11px] font-mono text-slate-400">Active Live Sessions</div>
          <div className="text-xl font-bold text-emerald-400 font-mono">{totalActive}</div>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
          <div className="text-[11px] font-mono text-slate-400">Image Vision Inquiries</div>
          <div className="text-xl font-bold text-cyan-400 font-mono">{totalImageQueries}</div>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
          <div className="text-[11px] font-mono text-slate-400">Active Officer</div>
          <div className="text-sm font-bold text-purple-300 font-mono truncate">
            {currentAdmin?.shortName || 'Dr. Vance'} ({currentAdmin?.role || 'SUPER_ADMIN'})
          </div>
        </div>
      </div>

      {/* Master Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Session List (5 cols) */}
        <div className="lg:col-span-5 bg-[#090e21] border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
          {/* Search & Filter Controls */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search user, email, message..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs text-white placeholder:text-slate-500 font-mono"
              />
            </div>

            <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar text-xs font-mono">
              {(['ALL', 'ACTIVE', 'HAS_IMAGE', 'RESOLVED'] as const).map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilterStatus(f)}
                  className={`px-2.5 py-1 rounded-lg border whitespace-nowrap transition-colors ${
                    filterStatus === f
                      ? 'bg-blue-900/80 border-cyan-400 text-cyan-200 font-bold'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {f === 'HAS_IMAGE' ? 'Images' : f}
                </button>
              ))}
            </div>
          </div>

          {/* Session Cards List */}
          <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredSessions.length === 0 ? (
              <div className="text-center py-12 text-xs font-mono text-slate-500">
                No matching TIXA AI chat sessions found.
              </div>
            ) : (
              filteredSessions.map(sess => {
                const isSelected = sess.id === selectedSession?.id;
                const lastMsg = sess.messages[sess.messages.length - 1];

                return (
                  <button
                    key={sess.id}
                    type="button"
                    onClick={() => setSelectedSessionId(sess.id)}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all relative ${
                      isSelected
                        ? 'bg-gradient-to-br from-blue-950 to-indigo-950 border-cyan-400 ring-2 ring-cyan-500/20 shadow-lg'
                        : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className={`w-2 h-2 rounded-full ${sess.status === 'RESOLVED' ? 'bg-slate-500' : 'bg-emerald-400 animate-pulse'}`} />
                        <span className="font-bold text-xs text-white font-mono truncate">
                          {sess.userName || (sess.isGuest ? 'Guest Visitor' : 'User')}
                        </span>
                        {sess.isGuest ? (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                            GUEST
                          </span>
                        ) : (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                            USER
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">
                        {new Date(sess.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {sess.userEmail && (
                      <div className="text-[11px] font-mono text-slate-400 truncate mb-1">
                        {sess.userEmail}
                      </div>
                    )}

                    <div className="text-xs text-slate-300 line-clamp-1 mb-2 font-sans">
                      {lastMsg?.text || 'No messages'}
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-white/5 pt-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-400 font-bold uppercase">{sess.language}</span>
                        {sess.hasImageQuery && (
                          <span className="flex items-center gap-0.5 text-amber-300 font-semibold">
                            <ImageIcon className="w-3 h-3" /> Image Query
                          </span>
                        )}
                      </div>
                      <span className="text-slate-500">{sess.messages.length} msgs</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Conversation Inspector & Reply Composer (7 cols) */}
        <div className="lg:col-span-7 bg-[#090e21] border border-slate-800 rounded-2xl flex flex-col shadow-xl min-h-[640px] overflow-hidden">
          {selectedSession ? (
            <>
              {/* Active Header */}
              <div className="p-4 bg-[#0c1228] border-b border-slate-800 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-white font-mono truncate">
                      {selectedSession.userName || 'Guest'} ({selectedSession.id.slice(-8)})
                    </h3>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                      selectedSession.status === 'RESOLVED'
                        ? 'bg-slate-800 text-slate-400 border-slate-700'
                        : 'bg-emerald-950 text-emerald-300 border-emerald-600'
                    }`}>
                      {selectedSession.status}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-slate-400 mt-0.5 flex items-center gap-2">
                    <span>Language: <strong className="text-cyan-300 uppercase">{selectedSession.language}</strong></span>
                    <span>•</span>
                    <span>IP: {selectedSession.ipAddress || '127.0.0.1'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {selectedSession.status !== 'RESOLVED' ? (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(selectedSession.id, 'RESOLVED')}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 text-xs font-mono flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Resolve</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(selectedSession.id, 'ACTIVE')}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 text-xs font-mono"
                    >
                      Reopen
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleClearSession(selectedSession.id)}
                    className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900 border border-rose-800/60 text-rose-400"
                    title="Delete Chat Log"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Message Transcript */}
              <div className="flex-1 p-4 space-y-4 max-h-[420px] overflow-y-auto custom-scrollbar bg-[#050814]">
                {selectedSession.messages.map(m => {
                  const isUser = m.sender === 'user';
                  const isAdmin = m.sender === 'admin';
                  const isAi = m.sender === 'ai';

                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col max-w-[88%] ${isUser ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 mb-1">
                        {isUser && <span>User / Visitor</span>}
                        {isAi && <span className="text-cyan-400 font-bold">TIXA AI Engine</span>}
                        {isAdmin && (
                          <span className="text-rose-400 font-bold flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            <span>{m.officerName || 'Admin'} ({m.officerRole || 'SUPER_ADMIN'})</span>
                          </span>
                        )}
                        <span>•</span>
                        <span>{new Date(m.timestamp).toLocaleTimeString()}</span>
                      </div>

                      <div
                        className={`p-3 rounded-2xl text-xs leading-relaxed ${
                          isUser
                            ? 'bg-blue-600 text-white rounded-br-none'
                            : isAdmin
                            ? 'bg-purple-950/80 border border-purple-500/60 text-purple-100 rounded-bl-none'
                            : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                        }`}
                      >
                        {m.imageBase64 && (
                          <div className="mb-2 rounded-lg overflow-hidden border border-cyan-500/40 bg-black/80 max-w-xs">
                            <img
                              src={m.imageBase64}
                              alt="Query Screenshot"
                              className="max-h-48 w-full object-contain cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => setPreviewImage(m.imageBase64 || null)}
                            />
                            <div className="p-1 text-[9px] font-mono text-cyan-300 text-center">
                              Click to expand screenshot
                            </div>
                          </div>
                        )}
                        <div className="whitespace-pre-wrap">{m.text}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Admin Direct Response Composer */}
              <div className="p-4 bg-[#0b1022] border-t border-slate-800 space-y-3">
                {/* Template Chips */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px] font-mono">
                  {[
                    'আপনার অনুরোধটি যাচাই করা হয়েছে, ফান্ড নিরাপদ।',
                    'Please provide the Blockchain Transaction Hash.',
                    'আপনার ডুয়াল-ওটিপি ১৮০ সেকেন্ডের মধ্যে সাবমিট করুন।',
                    'Official Admin clearance granted.'
                  ].map((t, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleQuickTemplate(t)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-500 text-slate-400 hover:text-cyan-300 whitespace-nowrap text-[10px]"
                    >
                      {t.length > 28 ? t.substring(0, 28) + '...' : t}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSendAdminReply} className="flex gap-2">
                  <input
                    type="text"
                    value={adminReplyText}
                    onChange={e => setAdminReplyText(e.target.value)}
                    placeholder={`Dispatch official Admin response as ${currentAdmin?.shortName || 'Admin'}...`}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-rose-500 text-xs text-white font-mono placeholder:text-slate-500"
                  />
                  <button
                    type="submit"
                    disabled={isSendingReply || !adminReplyText.trim()}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold text-xs font-mono flex items-center gap-1.5 shadow-lg shadow-rose-600/20 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Reply</span>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-2">
              <Bot className="w-12 h-12 text-slate-600" />
              <div className="font-mono text-xs">Select a chat session to monitor messages & take over.</div>
            </div>
          )}
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh] bg-slate-950 p-2 rounded-2xl border border-cyan-500/80">
            <img src={previewImage} alt="User Screenshot" className="max-h-[80vh] w-auto object-contain rounded-xl" />
          </div>
        </div>
      )}
    </div>
  );
};
