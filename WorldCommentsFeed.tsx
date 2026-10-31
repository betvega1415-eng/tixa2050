import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Flame, 
  Sparkles, 
  TrendingUp, 
  Globe2, 
  Heart, 
  Filter, 
  Search, 
  ShieldCheck, 
  Target, 
  Calendar, 
  User, 
  CheckCircle2,
  ThumbsUp,
  Share2,
  Tag,
  Radio,
  Zap
} from 'lucide-react';
import { treasuryEngine } from '../../core/treasuryEngine';
import { WorldComment, CommentSentiment, UserTier } from '../../types/treasury';

interface WorldCommentsFeedProps {
  onTradeClick?: () => void;
}

export const WorldCommentsFeed: React.FC<WorldCommentsFeedProps> = () => {
  const [comments, setComments] = useState<WorldComment[]>(treasuryEngine.getComments());
  const [filterSentiment, setFilterSentiment] = useState<string>('ALL');
  const [filterHorizon, setFilterHorizon] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [postSuccessMessage, setPostSuccessMessage] = useState(false);

  // Form State
  const [authorName, setAuthorName] = useState('');
  const [authorHandle, setAuthorHandle] = useState('');
  const [authorCountry, setAuthorCountry] = useState('United States');
  const [flagEmoji, setFlagEmoji] = useState('🇺🇸');
  const [userTier, setUserTier] = useState<UserTier>('Retail Investor');
  const [message, setMessage] = useState('');
  const [futureGoalPrice, setFutureGoalPrice] = useState<number>(3000000);
  const [timeHorizon, setTimeHorizon] = useState<'2026' | '2030' | '2040' | '2050'>('2030');
  const [sentiment, setSentiment] = useState<CommentSentiment>('ULTRA_BULLISH');
  const [customTag, setCustomTag] = useState('');

  const refresh = () => {
    setComments([...treasuryEngine.getComments()]);
  };

  useEffect(() => {
    refresh();
    const unsub = treasuryEngine.subscribe(refresh);
    return unsub;
  }, []);

  const countriesList = [
    { name: 'United States', flag: '🇺🇸', code: 'US' },
    { name: 'Japan', flag: '🇯🇵', code: 'JP' },
    { name: 'United Arab Emirates', flag: '🇦🇪', code: 'AE' },
    { name: 'Switzerland', flag: '🇨🇭', code: 'CH' },
    { name: 'Singapore', flag: '🇸🇬', code: 'SG' },
    { name: 'United Kingdom', flag: '🇬🇧', code: 'GB' },
    { name: 'Germany', flag: '🇩🇪', code: 'DE' },
    { name: 'South Korea', flag: '🇰🇷', code: 'KR' },
    { name: 'China', flag: '🇨🇳', code: 'CN' },
    { name: 'India', flag: '🇮🇳', code: 'IN' },
    { name: 'Brazil', flag: '🇧🇷', code: 'BR' },
    { name: 'France', flag: '🇫🇷', code: 'FR' },
    { name: 'Australia', flag: '🇦🇺', code: 'AU' },
    { name: 'Canada', flag: '🇨🇦', code: 'CA' },
    { name: 'Nigeria', flag: '🇳🇬', code: 'NG' },
    { name: 'Saudi Arabia', flag: '🇸🇦', code: 'SA' },
    { name: 'Global Citizen', flag: '🌐', code: 'UN' }
  ];

  const handleCountryChange = (cName: string) => {
    setAuthorCountry(cName);
    const found = countriesList.find(c => c.name === cName);
    if (found) {
      setFlagEmoji(found.flag);
    }
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsPosting(true);
    const tags = customTag.trim() 
      ? customTag.split(' ').map(t => t.startsWith('#') ? t : `#${t}`) 
      : ['#TIXAPAY', '#WorldVoice', '#FutureGoal'];

    treasuryEngine.addComment({
      authorName: authorName.trim() || 'Global TIXA Pioneer',
      authorHandle: authorHandle.trim() || '@pioneer_2050',
      authorCountry,
      countryCode: countriesList.find(c => c.name === authorCountry)?.code || 'UN',
      flagEmoji,
      userTier,
      message,
      futureGoalPrice: Number(futureGoalPrice) || 2500000,
      timeHorizon,
      sentiment,
      tags
    });

    setMessage('');
    setCustomTag('');
    setIsPosting(false);
    setPostSuccessMessage(true);
    setTimeout(() => setPostSuccessMessage(false), 4000);
  };

  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    treasuryEngine.toggleLikeComment(id);
  };

  const filteredComments = comments.filter(c => {
    const matchesSentiment = filterSentiment === 'ALL' || c.sentiment === filterSentiment;
    const matchesHorizon = filterHorizon === 'ALL' || c.timeHorizon === filterHorizon;
    const matchesSearch = 
      c.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.authorCountry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSentiment && matchesHorizon && matchesSearch;
  });

  const getSentimentBadge = (sent: CommentSentiment) => {
    switch (sent) {
      case 'MOON_2050':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-950/80 border border-purple-500/50 text-purple-300 font-mono text-[10px] font-bold">
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span>MOON 2050 ($5M+)</span>
          </span>
        );
      case 'ULTRA_BULLISH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-mono text-[10px] font-bold">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span>ULTRA BULLISH</span>
          </span>
        );
      case 'BULLISH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 font-mono text-[10px] font-bold">
            <TrendingUp className="w-3 h-3 text-cyan-400" />
            <span>BULLISH</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300 font-mono text-[10px] font-bold">
            <span>NEUTRAL</span>
          </span>
        );
    }
  };

  const metrics = treasuryEngine.getMetrics();

  return (
    <div className="space-y-8">
      {/* Top Banner: World People Consensus Barometer */}
      <div className="p-6 rounded-3xl cyber-glass border border-cyan-500/30 relative overflow-hidden space-y-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Globe2 className="w-4 h-4" />
              </div>
              <h3 className="text-xl font-bold text-white font-heading">
                World People Live Discussion & 2050 Price Goals
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 text-[10px] font-mono font-bold flex items-center gap-1">
                <Radio className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
                <span>GLOBAL STREAM LIVE</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Real-time sentiment stream from institutional quant funds, validator nodes, and global holders.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => treasuryEngine.triggerManualSync()}
              className="px-3.5 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-cyan-300 hover:text-white flex items-center gap-1.5 transition-all"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Fetch New Stream</span>
            </button>
          </div>
        </div>

        {/* Global Barometer Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-cyan-500/30 space-y-1">
            <span className="text-[10px] text-slate-400 block font-semibold flex items-center gap-1">
              <Target className="w-3 h-3 text-cyan-400" />
              <span>AVERAGE 2050 TARGET GOAL</span>
            </span>
            <p className="text-xl font-bold text-cyan-300">
              ${(metrics.avgTargetPrice2050 / 1000000).toFixed(2)}M USD
            </p>
            <p className="text-[10px] text-slate-400">Consensus from {metrics.totalWorldComments} Verified Posts</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-emerald-500/30 space-y-1">
            <span className="text-[10px] text-slate-400 block font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              <span>GLOBAL BULLISH SENTIMENT</span>
            </span>
            <p className="text-xl font-bold text-emerald-400">
              {metrics.bullishSentimentPercent}% Bullish
            </p>
            <p className="text-[10px] text-emerald-500/80">Extreme Institutional Conviction</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-purple-500/30 space-y-1">
            <span className="text-[10px] text-slate-400 block font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span>COMMUNITY TARGET HORIZON</span>
            </span>
            <p className="text-xl font-bold text-purple-300">
              2030 – 2050 Era
            </p>
            <p className="text-[10px] text-purple-400/80">Planetary Settlement Standard</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Post Live Comment Form (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl cyber-glass border border-slate-800 space-y-5">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-cyan-400" />
              <h4 className="text-base font-bold text-white font-heading">
                Broadcast Your Live Voice & Future Goal
              </h4>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Post your prediction, investment thesis, and price target to the decentralized global live stream.
            </p>

            {postSuccessMessage && (
              <div className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-600 text-emerald-300 text-xs font-mono flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Your comment has been broadcasted to the live world ledger!</span>
              </div>
            )}

            <form onSubmit={handlePostComment} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 text-[10px] uppercase">Your Name / Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alexander Vance"
                    value={authorName}
                    onChange={e => setAuthorName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 text-[10px] uppercase">Handle / Social</label>
                  <input
                    type="text"
                    placeholder="@handle"
                    value={authorHandle}
                    onChange={e => setAuthorHandle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 text-[10px] uppercase">Country / City</label>
                  <select
                    value={authorCountry}
                    onChange={e => handleCountryChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  >
                    {countriesList.map(c => (
                      <option key={c.name} value={c.name}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 text-[10px] uppercase">Investor Tier</label>
                  <select
                    value={userTier}
                    onChange={e => setUserTier(e.target.value as UserTier)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Retail Investor">Retail Investor</option>
                    <option value="Whale">Whale Holder</option>
                    <option value="Institutional Analyst">Institutional Analyst</option>
                    <option value="Validator Node">Validator Node</option>
                    <option value="Core Dev">Core Dev</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 text-[10px] uppercase">TIXA Future Target Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                    <input
                      type="number"
                      step="100000"
                      min="500000"
                      max="50000000"
                      value={futureGoalPrice}
                      onChange={e => setFutureGoalPrice(Number(e.target.value))}
                      className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 font-bold text-cyan-300"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 text-[10px] uppercase">Target Horizon</label>
                  <select
                    value={timeHorizon}
                    onChange={e => setTimeHorizon(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="2026">2026 (Short-Term)</option>
                    <option value="2030">2030 (Mid-Term)</option>
                    <option value="2040">2040 (Long-Term)</option>
                    <option value="2050">2050 (Planetary Era)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 text-[10px] uppercase">Market Sentiment</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSentiment('BULLISH')}
                    className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-all ${
                      sentiment === 'BULLISH'
                        ? 'bg-cyan-500 text-black border-cyan-400 shadow-md shadow-cyan-500/20'
                        : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}
                  >
                    Bullish
                  </button>
                  <button
                    type="button"
                    onClick={() => setSentiment('ULTRA_BULLISH')}
                    className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-all ${
                      sentiment === 'ULTRA_BULLISH'
                        ? 'bg-emerald-500 text-black border-emerald-400 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}
                  >
                    Ultra Bullish
                  </button>
                  <button
                    type="button"
                    onClick={() => setSentiment('MOON_2050')}
                    className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-all ${
                      sentiment === 'MOON_2050'
                        ? 'bg-purple-500 text-white border-purple-400 shadow-md shadow-purple-500/20'
                        : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}
                  >
                    Moon 2050 🚀
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 text-[10px] uppercase">Your Commentary / Analysis / Vision</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Share your views on TIXA coin institutional adoption, technology specs, consensus security, or long-term financial freedom..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 text-xs resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 text-[10px] uppercase">Custom Tags (Optional)</label>
                <input
                  type="text"
                  placeholder="#Institutional #DiamondHands #TIXAPAY"
                  value={customTag}
                  onChange={e => setCustomTag(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 focus:outline-none focus:border-cyan-400 text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={isPosting || !message.trim()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-500 text-black font-bold text-xs tracking-wide shadow-lg shadow-cyan-500/25 hover:shadow-cyan-400/40 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>Broadcast Live to World Stream</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Live Comments Feed (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 font-mono text-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {['ALL', 'MOON_2050', 'ULTRA_BULLISH', 'BULLISH'].map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFilterSentiment(s)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                    filterSentiment === s
                      ? 'bg-cyan-500 text-black'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {s === 'ALL' ? 'All Comments' : s === 'MOON_2050' ? 'Moon 2050' : s.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search worldwide posts..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-cyan-400 w-full sm:w-48"
              />
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-3.5 max-h-[750px] overflow-y-auto pr-1">
            {filteredComments.map(comment => {
              const timeFormatted = new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              return (
                <div
                  key={comment.id}
                  className="p-5 rounded-2xl cyber-glass border border-slate-800 hover:border-cyan-500/40 transition-all space-y-3 relative group"
                >
                  {/* Header: Author Info */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${comment.avatarColor} flex items-center justify-center text-black font-black text-sm shadow-md`}>
                        {comment.flagEmoji}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{comment.authorName}</span>
                          {comment.isVerified && (
                            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                          )}
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-400 font-mono">
                            {comment.userTier}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                          <span>{comment.authorHandle}</span>
                          <span>•</span>
                          <span>{comment.flagEmoji} {comment.authorCountry}</span>
                          <span>•</span>
                          <span>{timeFormatted}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      {getSentimentBadge(comment.sentiment)}
                    </div>
                  </div>

                  {/* Target Price Goal Pill */}
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-950/80 border border-cyan-500/20 text-xs font-mono">
                    <Target className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-slate-400">Future Goal Target:</span>
                    <span className="text-cyan-300 font-bold">
                      ${comment.futureGoalPrice.toLocaleString()} USD
                    </span>
                    <span className="text-slate-500">({comment.timeHorizon} Horizon)</span>
                  </div>

                  {/* Message Body */}
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                    {comment.message}
                  </p>

                  {/* Tags & Action Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs font-mono">
                    <div className="flex flex-wrap gap-1.5">
                      {comment.tags.map((tag, idx) => (
                        <span key={idx} className="text-[10px] text-cyan-400/80 hover:text-cyan-300">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={(e) => handleLike(comment.id, e)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-mono transition-all ${
                          comment.isLikedByUser
                            ? 'bg-rose-950/80 text-rose-300 border-rose-600 shadow-sm shadow-rose-900/50'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${comment.isLikedByUser ? 'fill-rose-400 text-rose-400' : ''}`} />
                        <span>{comment.likesCount}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
