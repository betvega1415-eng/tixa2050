import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Sparkles, 
  ArrowUpRight, 
  Clock, 
  ExternalLink, 
  Volume2, 
  VolumeX, 
  Pause, 
  Zap, 
  Check, 
  X,
  Radio
} from 'lucide-react';
import { broadcastMediaEngine } from '../../core/broadcastMediaEngine';
import { BroadcastMediaItem } from '../../types/broadcast';
import { authEngine } from '../../core/authEngine';

interface HeroMediaSwiperProps {
  onNavigateTab?: (tab: string) => void;
  onOpenDeposit?: () => void;
}

export const HeroMediaSwiper: React.FC<HeroMediaSwiperProps> = ({ onNavigateTab, onOpenDeposit }) => {
  const [session, setSession] = useState(authEngine.getSession());
  const [banners, setBanners] = useState<BroadcastMediaItem[]>(() => {
    const s = authEngine.getSession();
    const u = s ? authEngine.getUserById(s.userId) : null;
    return broadcastMediaEngine.getActiveBroadcasts('HERO_SWIPER', s?.email, s?.phone || u?.phone);
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const refreshBanners = () => {
    const currentSession = authEngine.getSession();
    setSession(currentSession);
    const user = currentSession ? authEngine.getUserById(currentSession.userId) : null;
    const userPhone = currentSession?.phone || user?.phone;
    const active = broadcastMediaEngine.getActiveBroadcasts(
      'HERO_SWIPER',
      currentSession?.email,
      userPhone
    );
    setBanners(active);
  };

  useEffect(() => {
    const unsub = broadcastMediaEngine.subscribe(refreshBanners);
    return unsub;
  }, []);

  // Auto swiping timer (every 4.5 seconds)
  useEffect(() => {
    if (banners.length <= 1 || isPaused) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % banners.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [banners.length, isPaused]);

  // Record impression for current banner
  const currentBannerId = banners[currentIndex]?.id;
  const recordedIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (currentBannerId && !recordedIdsRef.current.has(currentBannerId)) {
      recordedIdsRef.current.add(currentBannerId);
      broadcastMediaEngine.recordImpression(currentBannerId);
    }
  }, [currentBannerId]);

  const handleNext = () => {
    if (banners.length === 0) return;
    setCurrentIndex(prev => (prev + 1) % banners.length);
  };

  const handlePrev = () => {
    if (banners.length === 0) return;
    setCurrentIndex(prev => (prev - 1 + banners.length) % banners.length);
  };

  // Touch swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) handleNext(); // swipe left
    if (diff < -50) handlePrev(); // swipe right
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const handleActionClick = (banner: BroadcastMediaItem) => {
    broadcastMediaEngine.recordClick(banner.id);

    if (banner.type === 'video' && banner.videoUrl) {
      setActiveVideoUrl(banner.videoUrl);
      return;
    }

    if (!banner.actionUrl) return;

    if (banner.actionUrl.startsWith('#')) {
      const target = banner.actionUrl.replace('#', '');
      if (target === 'deposit' && onOpenDeposit) {
        onOpenDeposit();
      } else if (onNavigateTab) {
        onNavigateTab(target);
      }
    } else if (banner.actionUrl.startsWith('http')) {
      window.open(banner.actionUrl, '_blank', 'noopener,noreferrer');
    } else if (onNavigateTab) {
      onNavigateTab(banner.actionUrl);
    }
  };

  if (banners.length === 0) {
    return null;
  }

  const current = banners[currentIndex] || banners[0];

  return (
    <div 
      id="hero-media-swiper-carousel" 
      className="relative w-full rounded-3xl overflow-hidden shadow-2xl border border-cyan-500/30 group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Media Image / Gradient */}
      <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden bg-slate-950">
        {current.imageUrl ? (
          <img 
            src={current.imageUrl} 
            alt={current.title}
            className="w-full h-full object-cover object-center transform scale-105 transition-all duration-1000 ease-out brightness-[0.45] group-hover:scale-100"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-r ${current.gradientTheme || 'from-cyan-950 via-slate-950 to-blue-950'}`} />
        )}

        {/* Cyber Neon Overlay Lines & Grid */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#040711] via-black/40 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-radial-gradient pointer-events-none opacity-40" />

        {/* Content Box */}
        <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-between z-10">
          
          {/* Top Row: Badge, Live Indicator & Counter */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              {current.badgeText && (
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-extrabold text-[11px] font-mono tracking-wider shadow-lg shadow-cyan-500/30 flex items-center gap-1.5 animate-pulse">
                  <Sparkles className="w-3.5 h-3.5" />
                  {current.badgeText}
                </span>
              )}

              {current.type === 'video' && (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-950/80 border border-rose-500/60 text-rose-300 text-[10px] font-mono flex items-center gap-1">
                  <Play className="w-3 h-3 fill-rose-400" />
                  VIDEO MEDIA
                </span>
              )}

              {current.targetType !== 'ALL' && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/60 text-amber-300 text-[10px] font-mono flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" />
                  PERSONALIZED FOR YOU
                </span>
              )}

              {current.endDate && (
                <span className="hidden sm:flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-900/80 border border-slate-700 text-slate-300 text-[10px] font-mono">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  Valid till {current.endDate} {current.endTime || ''}
                </span>
              )}
            </div>

            {/* Slide Count Indicator */}
            <div className="px-3 py-1 rounded-full bg-black/60 border border-slate-700/80 backdrop-blur-md text-[11px] font-mono text-cyan-300 flex items-center gap-1.5">
              <span className="font-bold text-white">{currentIndex + 1}</span>
              <span className="text-slate-500">/</span>
              <span>{banners.length}</span>
              {isPaused && <Pause className="w-3 h-3 text-amber-400 ml-1" />}
            </div>
          </div>

          {/* Bottom Area: Main Headline, Subtitle, Message & CTA */}
          <div className="max-w-2xl space-y-3">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-white font-heading tracking-tight drop-shadow-md leading-tight">
                {current.title}
              </h2>
              {current.subtitle && (
                <p className="text-xs sm:text-sm font-semibold text-cyan-300 font-mono drop-shadow">
                  {current.subtitle}
                </p>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed drop-shadow max-w-xl">
              {current.message}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2 flex-wrap">
              {current.actionLabel && (
                <button
                  type="button"
                  onClick={() => handleActionClick(current)}
                  className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:from-cyan-300 hover:to-indigo-500 text-black font-extrabold text-xs sm:text-sm font-mono tracking-wide shadow-xl shadow-cyan-500/25 flex items-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95"
                >
                  {current.type === 'video' ? <Play className="w-4 h-4 fill-black" /> : <Sparkles className="w-4 h-4" />}
                  <span>{current.actionLabel}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              )}

              {current.type === 'video' && current.videoUrl && (
                <button
                  type="button"
                  onClick={() => setActiveVideoUrl(current.videoUrl || null)}
                  className="px-4 py-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-white text-xs font-mono flex items-center gap-2 backdrop-blur-md transition-colors"
                >
                  <Play className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
                  <span>Watch Video Clip</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows (Prev / Next) */}
      {banners.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous Slide"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-cyan-500 hover:text-black border border-slate-700 hover:border-cyan-400 text-white backdrop-blur-md flex items-center justify-center transition-all z-20 opacity-80 group-hover:opacity-100"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Next Slide"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-cyan-500 hover:text-black border border-slate-700 hover:border-cyan-400 text-white backdrop-blur-md flex items-center justify-center transition-all z-20 opacity-80 group-hover:opacity-100"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Bottom Pagination Dots & Thumbnails Indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-3 right-6 z-20 flex items-center gap-1.5 bg-black/50 p-1.5 rounded-full border border-slate-800 backdrop-blur-md">
          {banners.map((b, idx) => (
            <button
              key={b.id}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`transition-all rounded-full ${
                currentIndex === idx 
                  ? 'w-6 h-2 bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]' 
                  : 'w-2 h-2 bg-slate-600 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>
      )}

      {/* Video Modal Player if opened */}
      {activeVideoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-3xl rounded-3xl bg-[#090e23] border border-cyan-500/50 shadow-2xl p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-cyan-400 fill-cyan-400" />
                <h3 className="text-base font-bold text-white font-heading">
                  {current.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveVideoUrl(null)}
                className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black border border-slate-800">
              <video 
                src={activeVideoUrl} 
                controls 
                autoPlay 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
