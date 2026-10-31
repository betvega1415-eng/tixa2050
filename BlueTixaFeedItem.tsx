import React, { useState, useRef, useEffect } from 'react';
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  Bookmark, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Check, 
  Plus, 
  Music, 
  Disc, 
  Flag, 
  ShieldCheck, 
  Coins,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { BlueTixaVideo } from '../../types/blueTixa';
import { blueTixaVideoEngine } from '../../core/blueTixaVideoEngine';
import { blueTixaRewardEngine } from '../../core/blueTixaRewardEngine';
import { authEngine } from '../../core/authEngine';
import confetti from 'canvas-confetti';

interface BlueTixaFeedItemProps {
  video: BlueTixaVideo;
  isActive: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenComments: (video: BlueTixaVideo) => void;
  onOpenShare: (video: BlueTixaVideo) => void;
  onOpenReport: (video: BlueTixaVideo) => void;
  onSelectHashtag: (tag: string) => void;
  onSelectCreator: (creatorId: string) => void;
}

export const BlueTixaFeedItem: React.FC<BlueTixaFeedItemProps> = ({
  video,
  isActive,
  isMuted,
  onToggleMute,
  onOpenComments,
  onOpenShare,
  onOpenReport,
  onSelectHashtag,
  onSelectCreator
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLiked, setIsLiked] = useState(video.isLiked || false);
  const [likesCount, setLikesCount] = useState(video.likesCount);
  const [isSaved, setIsSaved] = useState(video.isSaved || false);
  const [isFollowing, setIsFollowing] = useState(video.isFollowing || false);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [burstPos, setBurstPos] = useState({ x: 50, y: 50 });

  // Safe video source with automatic fallback on network/format error
  const fallbackUrls = [
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4'
  ];
  const [currentVideoSrc, setCurrentVideoSrc] = useState<string>(() => {
    if (video.videoUrl && !video.videoUrl.includes('mixkit.co')) {
      return video.videoUrl;
    }
    return fallbackUrls[0];
  });
  const [videoHasError, setVideoHasError] = useState(false);

  // Watch time and verification tracking
  const [watchProgressSeconds, setWatchProgressSeconds] = useState(0);
  const [isEligibleVerified, setIsEligibleVerified] = useState(false);
  const [pointsEarnedPill, setPointsEarnedPill] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const lastTapTimeRef = useRef<number>(0);
  const watchTimerRef = useRef<any>(null);

  const session = authEngine.getSession();
  const viewerUserId = session?.walletAddress || 'CURRENT_USER';

  // Sync state when video prop changes
  useEffect(() => {
    setIsLiked(video.isLiked || false);
    setLikesCount(video.likesCount);
    setIsSaved(video.isSaved || false);
    setIsFollowing(video.isFollowing || false);
    setVideoHasError(false);
    const safeSrc = (video.videoUrl && !video.videoUrl.includes('mixkit.co')) ? video.videoUrl : fallbackUrls[0];
    setCurrentVideoSrc(safeSrc);
  }, [video.id, video.videoUrl, video.isLiked, video.likesCount, video.isSaved, video.isFollowing]);

  // Handle Autoplay & Pause when active
  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        videoRef.current.currentTime = 0;
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            setIsPlaying(true);
          }).catch(() => {
            // Autoplay blocked without user gesture
            setIsPlaying(false);
          });
        }

        // Start watch timer for verified reward tracking
        setWatchProgressSeconds(0);
        setIsEligibleVerified(false);

        if (watchTimerRef.current) clearInterval(watchTimerRef.current);
        watchTimerRef.current = setInterval(() => {
          setWatchProgressSeconds(sec => {
            const nextSec = sec + 1;
            // When reaching 5 seconds, trigger anti-fraud eligible verification!
            if (nextSec === 5) {
              const res = blueTixaRewardEngine.recordWatchSession({
                videoId: video.id,
                creatorId: video.creatorId,
                viewerUserId: viewerUserId,
                watchDurationSeconds: 5,
                completedLoop: false
              });

              if (res.eligibleForViewerReward || res.eligibleForCreatorReward) {
                setIsEligibleVerified(true);
                if (res.viewerPointsAwarded > 0) {
                  setPointsEarnedPill(`+${res.viewerPointsAwarded} Watch Pts`);
                  setTimeout(() => setPointsEarnedPill(null), 3000);
                }
              }
            }
            return nextSec;
          });
        }, 1000);

      } else {
        try {
          videoRef.current.pause();
        } catch (e) {}
        setIsPlaying(false);
        if (watchTimerRef.current) clearInterval(watchTimerRef.current);
      }
    }

    return () => {
      if (watchTimerRef.current) clearInterval(watchTimerRef.current);
    };
  }, [isActive, video.id, viewerUserId]);

  const handleVideoError = () => {
    if (currentVideoSrc !== fallbackUrls[0]) {
      setCurrentVideoSrc(fallbackUrls[0]);
    } else {
      setVideoHasError(true);
    }
  };

  const handleVideoClick = (e: React.MouseEvent) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapTimeRef.current < DOUBLE_TAP_DELAY) {
      // Double tap -> Like video with heart particle!
      const rect = e.currentTarget.getBoundingClientRect();
      setBurstPos({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100
      });
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 900);

      if (!isLiked) {
        const res = blueTixaVideoEngine.toggleLike(video.id);
        setIsLiked(res.isLiked);
        setLikesCount(res.newCount);
      }
    } else {
      // Single tap -> Play/Pause toggle
      if (videoRef.current) {
        if (isPlaying) {
          videoRef.current.pause();
          setIsPlaying(false);
        } else {
          videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        }
      }
    }
    lastTapTimeRef.current = now;
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const res = blueTixaVideoEngine.toggleLike(video.id);
    setIsLiked(res.isLiked);
    setLikesCount(res.newCount);
    if (res.isLiked) {
      try {
        confetti({
          particleCount: 25,
          spread: 40,
          origin: { x: 0.85, y: 0.6 }
        });
      } catch (e) {}
    }
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const saved = blueTixaVideoEngine.toggleSave(video.id);
    setIsSaved(saved);
  };

  const handleFollowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = blueTixaVideoEngine.toggleFollow(video.creatorId);
    setIsFollowing(next);
  };

  return (
    <div className="relative w-full h-full max-w-md mx-auto bg-black rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] select-none flex items-center justify-center">
      {/* HTML5 Video Element or Dynamic Visual Backdrop */}
      {!videoHasError ? (
        <video
          ref={videoRef}
          src={currentVideoSrc}
          poster={video.thumbnailUrl}
          loop
          playsInline
          muted={isMuted}
          onError={handleVideoError}
          onClick={handleVideoClick}
          className="w-full h-full object-cover cursor-pointer"
        />
      ) : (
        <div 
          onClick={handleVideoClick}
          className="relative w-full h-full cursor-pointer flex items-center justify-center overflow-hidden"
        >
          <img 
            src={video.thumbnailUrl} 
            alt={video.caption}
            className="w-full h-full object-cover filter brightness-75 scale-105 transition-transform duration-1000" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60" />
        </div>
      )}

      {/* Paused Overlay Indicator */}
      {!isPlaying && (
        <div 
          onClick={handleVideoClick}
          className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[1px] cursor-pointer"
        >
          <div className="w-16 h-16 rounded-full bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-[0_0_30px_rgba(6,182,212,0.4)] animate-scale-up">
            <Play className="w-8 h-8 ml-1 fill-cyan-400" />
          </div>
        </div>
      )}

      {/* Double Tap Heart Burst Animation */}
      {showHeartBurst && (
        <div 
          className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2 animate-ping text-rose-500 z-30"
          style={{ left: `${burstPos.x}%`, top: `${burstPos.y}%` }}
        >
          <Heart className="w-24 h-24 fill-rose-500 drop-shadow-[0_0_20px_rgba(244,63,94,0.8)]" />
        </div>
      )}

      {/* Top Header Controls Strip */}
      <div className="absolute top-4 inset-x-4 flex items-center justify-between z-20 pointer-events-auto">
        {/* Verified Eligible View Watch Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-cyan-500/30 text-[11px] font-mono text-cyan-300">
          <ShieldCheck className={`w-3.5 h-3.5 ${isEligibleVerified ? 'text-emerald-400 fill-emerald-400/20' : 'text-cyan-400'}`} />
          <span>{isEligibleVerified ? 'Verified View ✓' : `Watch ${Math.max(0, 5 - watchProgressSeconds)}s for Points`}</span>
        </div>

        {/* Mute/Unmute Toggle */}
        <button
          onClick={onToggleMute}
          className="p-2.5 rounded-full bg-black/60 backdrop-blur-md border border-slate-700/80 text-white hover:bg-black/80 hover:text-cyan-300 transition"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
        </button>
      </div>

      {/* Points Earned Floating Toast */}
      {pointsEarnedPill && (
        <div className="absolute top-16 inset-x-0 mx-auto w-fit px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-emerald-500 text-black font-extrabold font-mono text-xs shadow-[0_0_25px_rgba(245,158,11,0.6)] animate-bounce z-30 flex items-center gap-1.5">
          <Coins className="w-4 h-4" />
          <span>{pointsEarnedPill}</span>
        </div>
      )}

      {/* Floating Right Interaction Stack */}
      <div className="absolute right-3 bottom-20 flex flex-col items-center gap-4 z-20">
        {/* Creator Avatar with Follow Button */}
        <div className="relative mb-2">
          <img 
            src={video.creatorAvatar} 
            alt={video.creatorName}
            onClick={() => onSelectCreator(video.creatorId)}
            className="w-12 h-12 rounded-full border-2 border-cyan-400 p-0.5 object-cover cursor-pointer hover:scale-105 transition shadow-[0_0_15px_rgba(6,182,212,0.4)]" 
          />
          {!isFollowing && (
            <button
              onClick={handleFollowClick}
              className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-5 h-5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-black flex items-center justify-center font-bold shadow-md hover:scale-110 transition"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Like Button */}
        <button
          onClick={handleLikeClick}
          className="flex flex-col items-center gap-1 group"
        >
          <div className={`p-3 rounded-full bg-black/60 backdrop-blur-md border border-slate-700/60 group-hover:scale-110 transition ${
            isLiked ? 'text-rose-500 border-rose-500/50' : 'text-white'
          }`}>
            <Heart className={`w-6 h-6 ${isLiked ? 'fill-rose-500' : ''}`} />
          </div>
          <span className="text-[11px] font-mono font-bold text-white drop-shadow-md">
            {likesCount.toLocaleString()}
          </span>
        </button>

        {/* Comments Button */}
        <button
          onClick={() => onOpenComments(video)}
          className="flex flex-col items-center gap-1 group"
        >
          <div className="p-3 rounded-full bg-black/60 backdrop-blur-md border border-slate-700/60 text-white group-hover:scale-110 transition">
            <MessageSquare className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-mono font-bold text-white drop-shadow-md">
            {video.commentsCount.toLocaleString()}
          </span>
        </button>

        {/* Save / Bookmark Button */}
        <button
          onClick={handleSaveClick}
          className="flex flex-col items-center gap-1 group"
        >
          <div className={`p-3 rounded-full bg-black/60 backdrop-blur-md border border-slate-700/60 group-hover:scale-110 transition ${
            isSaved ? 'text-amber-400 border-amber-500/50' : 'text-white'
          }`}>
            <Bookmark className={`w-6 h-6 ${isSaved ? 'fill-amber-400' : ''}`} />
          </div>
          <span className="text-[11px] font-mono font-bold text-white drop-shadow-md">
            {video.savesCount.toLocaleString()}
          </span>
        </button>

        {/* Share Button */}
        <button
          onClick={() => onOpenShare(video)}
          className="flex flex-col items-center gap-1 group"
        >
          <div className="p-3 rounded-full bg-black/60 backdrop-blur-md border border-slate-700/60 text-white group-hover:scale-110 transition">
            <Share2 className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-mono font-bold text-white drop-shadow-md">
            {video.sharesCount.toLocaleString()}
          </span>
        </button>

        {/* Report / Safety Button */}
        <button
          onClick={() => onOpenReport(video)}
          className="p-2.5 rounded-full bg-black/50 backdrop-blur-md border border-slate-800 text-slate-400 hover:text-rose-400 transition"
        >
          <Flag className="w-4 h-4" />
        </button>

        {/* Rotating Vinyl Audio Disc */}
        <div className="mt-1">
          <div className={`w-10 h-10 rounded-full bg-gradient-to-tr from-slate-900 via-slate-800 to-black p-1 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.3)] ${
            isPlaying ? 'animate-spin' : ''
          }`} style={{ animationDuration: '4s' }}>
            <div className="w-full h-full rounded-full bg-cyan-950 flex items-center justify-center text-cyan-300">
              <Disc className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Metadata & Caption Overlay */}
      <div className="absolute bottom-4 inset-x-4 pr-16 z-20 space-y-2 pointer-events-auto">
        {/* Creator Info */}
        <div 
          onClick={() => onSelectCreator(video.creatorId)}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <span className="text-sm font-bold text-white font-mono group-hover:text-cyan-300 transition drop-shadow-md">
            {video.creatorName}
          </span>
          <span className="text-xs font-mono text-cyan-400 drop-shadow-md">
            {video.creatorHandle}
          </span>
          {video.creatorIsVerified && (
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400/20 shrink-0" />
          )}
        </div>

        {/* Caption */}
        <p className="text-xs text-slate-100 leading-relaxed drop-shadow line-clamp-3 font-sans">
          {video.caption}
        </p>

        {/* Hashtags */}
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {video.hashtags.map(tag => (
            <button
              key={tag}
              onClick={() => onSelectHashtag(tag)}
              className="text-[11px] font-mono font-bold text-cyan-300 hover:text-cyan-200 hover:underline drop-shadow"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Audio Track Marquee */}
        <div className="flex items-center gap-2 pt-1 text-[11px] font-mono text-slate-300 drop-shadow">
          <Music className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="truncate">{video.audioTitle} • {video.audioArtist}</span>
        </div>
      </div>
    </div>
  );
};
