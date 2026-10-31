import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Search, 
  Plus, 
  Coins, 
  Video, 
  User, 
  Sparkles, 
  Compass, 
  Flame, 
  ArrowUp, 
  ArrowDown, 
  X, 
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Award,
  Wallet
} from 'lucide-react';
import { BlueTixaVideo } from '../../types/blueTixa';
import { blueTixaVideoEngine } from '../../core/blueTixaVideoEngine';
import { blueTixaRewardEngine } from '../../core/blueTixaRewardEngine';
import { BlueTixaFeedItem } from './BlueTixaFeedItem';
import { BlueTixaCommentsModal } from './BlueTixaCommentsModal';
import { BlueTixaShareModal } from './BlueTixaShareModal';
import { BlueTixaReportModal } from './BlueTixaReportModal';
import { BlueTixaCreateModal } from './BlueTixaCreateModal';
import { BlueTixaDiscoverModal } from './BlueTixaDiscoverModal';
import { BlueTixaRewardsDashboard } from './BlueTixaRewardsDashboard';
import { BlueTixaCreatorStudio } from './BlueTixaCreatorStudio';
import { BlueTixaProfileView } from './BlueTixaProfileView';
import { authEngine } from '../../core/authEngine';

interface BlueTixaViewProps {
  onCloseToMainApp: () => void;
}

export const BlueTixaView: React.FC<BlueTixaViewProps> = ({ onCloseToMainApp }) => {
  const session = authEngine.getSession();
  const userId = session?.walletAddress || 'CURRENT_USER';

  // Sub-view router
  const [subView, setSubView] = useState<'feed' | 'rewards' | 'studio' | 'profile'>('feed');
  const [selectedCreatorId, setSelectedCreatorId] = useState<string | undefined>(undefined);

  // Feed state
  const [feedCategory, setFeedCategory] = useState<'forYou' | 'following' | 'trending'>('forYou');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [videos, setVideos] = useState<BlueTixaVideo[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(true);

  // Modals state
  const [commentVideo, setCommentVideo] = useState<BlueTixaVideo | null>(null);
  const [shareVideo, setShareVideo] = useState<BlueTixaVideo | null>(null);
  const [reportVideo, setReportVideo] = useState<BlueTixaVideo | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [isDiscoverOpen, setIsDiscoverOpen] = useState<boolean>(false);

  // Reward points pill
  const [userPoints, setUserPoints] = useState<number>(() => blueTixaRewardEngine.getUserRewardSummary(userId).availablePoints);

  const containerRef = useRef<HTMLDivElement>(null);

  // Load Feed
  const loadFeed = () => {
    const feed = blueTixaVideoEngine.getFeed({
      filter: activeTag ? undefined : feedCategory,
      hashtag: activeTag || undefined
    });
    setVideos(feed);
    if (currentIndex >= feed.length) {
      setCurrentIndex(0);
    }
  };

  useEffect(() => {
    loadFeed();
    const unsub = blueTixaVideoEngine.subscribe(() => {
      loadFeed();
    });
    const unsubReward = blueTixaRewardEngine.subscribe(() => {
      setUserPoints(blueTixaRewardEngine.getUserRewardSummary(userId).availablePoints);
    });
    return () => {
      unsub();
      unsubReward();
    };
  }, [feedCategory, activeTag, userId]);

  // Keyboard navigation for feed
  useEffect(() => {
    if (subView !== 'feed') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (commentVideo || shareVideo || reportVideo || isCreateOpen || isDiscoverOpen) return;

      if (e.key === 'ArrowDown' || e.key === 'j') {
        handleNextVideo();
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        handlePrevVideo();
      } else if (e.key === 'm') {
        setIsMuted(m => !m);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, videos.length, subView, commentVideo, shareVideo, reportVideo, isCreateOpen, isDiscoverOpen]);

  const handleNextVideo = () => {
    if (currentIndex < videos.length - 1) {
      setCurrentIndex(idx => idx + 1);
    }
  };

  const handlePrevVideo = () => {
    if (currentIndex > 0) {
      setCurrentIndex(idx => idx - 1);
    }
  };

  const currentVideo = videos[currentIndex] || null;

  return (
    <div className="fixed inset-0 z-40 bg-[#040814] text-white flex flex-col overflow-hidden animate-fade-in">
      {/* Top Navbar */}
      <header className="h-16 px-4 sm:px-6 bg-[#050b1a]/95 border-b border-cyan-500/20 backdrop-blur-md flex items-center justify-between z-30 shrink-0">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onCloseToMainApp}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-cyan-500/40 transition flex items-center gap-1 text-xs font-mono"
            title="Return to TIXA Core Dashboard"
          >
            <ChevronLeft className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Back to TIXA</span>
          </button>

          <div 
            onClick={() => {
              setSubView('feed');
              setActiveTag(null);
            }}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-black font-extrabold shadow-[0_0_15px_rgba(6,182,212,0.4)] group-hover:scale-105 transition">
              <Play className="w-4 h-4 fill-black text-black ml-0.5" />
            </div>
            <div>
              <div className="text-sm font-extrabold font-mono tracking-wider flex items-center gap-1.5">
                <span className="text-cyan-400">BLUE</span>
                <span className="text-white">TIXA</span>
                <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 text-[9px] border border-cyan-500/40">2050</span>
              </div>
              <p className="text-[9px] font-mono text-slate-400 hidden sm:block">Decentralized Short-Video Protocol</p>
            </div>
          </div>
        </div>

        {/* Center Categories (Only when viewing feed) */}
        {subView === 'feed' ? (
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-2xl border border-slate-800 text-xs font-mono">
            {activeTag ? (
              <div className="flex items-center gap-2 px-3 py-1 bg-cyan-500 text-black font-bold rounded-xl text-xs">
                <span>{activeTag}</span>
                <button onClick={() => setActiveTag(null)} className="hover:opacity-75">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setFeedCategory('forYou');
                    setCurrentIndex(0);
                  }}
                  className={`px-3 py-1.5 rounded-xl transition ${
                    feedCategory === 'forYou'
                      ? 'bg-cyan-500 text-black font-bold shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  For You
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFeedCategory('trending');
                    setCurrentIndex(0);
                  }}
                  className={`px-3 py-1.5 rounded-xl transition ${
                    feedCategory === 'trending'
                      ? 'bg-cyan-500 text-black font-bold shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Trending
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFeedCategory('following');
                    setCurrentIndex(0);
                  }}
                  className={`px-3 py-1.5 rounded-xl transition ${
                    feedCategory === 'following'
                      ? 'bg-cyan-500 text-black font-bold shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Following
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="text-xs font-mono text-cyan-300 font-bold uppercase tracking-wider hidden sm:block">
            {subView === 'rewards' && '• Reward Ledger & Payout Center •'}
            {subView === 'studio' && '• Creator Studio & Video Analytics •'}
            {subView === 'profile' && '• Profile & Saved Showcase •'}
          </div>
        )}

        {/* Right Navigation & Action Items */}
        <div className="flex items-center gap-2">
          {/* Search / Discover */}
          <button
            onClick={() => setIsDiscoverOpen(true)}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 transition"
            title="Discover & Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Create Button */}
          <button
            onClick={() => setIsCreateOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold font-mono text-xs shadow-[0_0_15px_rgba(6,182,212,0.3)] transition"
          >
            <Plus className="w-4 h-4 text-cyan-200" />
            <span>+ Create</span>
          </button>

          {/* Rewards Hub Button with Live Points */}
          <button
            onClick={() => setSubView('rewards')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono transition ${
              subView === 'rewards'
                ? 'bg-cyan-500 text-black font-bold border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'bg-slate-900/90 border-slate-800 text-cyan-300 hover:border-cyan-500/40'
            }`}
          >
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>{userPoints.toLocaleString()} Pts</span>
          </button>

          {/* Creator Studio Button */}
          <button
            onClick={() => setSubView('studio')}
            className={`p-2.5 rounded-xl border text-xs font-mono transition ${
              subView === 'studio'
                ? 'bg-cyan-500 text-black border-cyan-400'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-cyan-300'
            }`}
            title="Creator Studio"
          >
            <Video className="w-4 h-4" />
          </button>

          {/* Profile Button */}
          <button
            onClick={() => {
              setSelectedCreatorId(undefined);
              setSubView('profile');
            }}
            className={`p-2.5 rounded-xl border text-xs font-mono transition ${
              subView === 'profile'
                ? 'bg-cyan-500 text-black border-cyan-400'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-cyan-300'
            }`}
            title="My Profile"
          >
            <User className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main View Body */}
      <main className="flex-1 relative overflow-hidden bg-gradient-to-b from-[#030611] to-[#010308] flex items-center justify-center">
        {/* SUBVIEW: Vertical Video Feed */}
        {subView === 'feed' && (
          <div className="w-full h-full flex items-center justify-center p-2 sm:p-4 relative">
            {videos.length === 0 ? (
              <div className="text-center py-20 space-y-4 max-w-sm">
                <Video className="w-12 h-12 mx-auto text-cyan-400 opacity-40 animate-pulse" />
                <h3 className="text-base font-bold text-white font-mono">No Videos in this Feed Category</h3>
                <p className="text-xs text-slate-400">
                  Be the first creator to upload a short-video under this topic!
                </p>
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold font-mono text-xs"
                >
                  + Upload Short Video
                </button>
              </div>
            ) : currentVideo ? (
              <div className="relative w-full max-w-md h-[calc(100vh-5rem)] flex items-center justify-center">
                <BlueTixaFeedItem
                  key={currentVideo.id}
                  video={currentVideo}
                  isActive={true}
                  isMuted={isMuted}
                  onToggleMute={() => setIsMuted(m => !m)}
                  onOpenComments={(vid) => setCommentVideo(vid)}
                  onOpenShare={(vid) => setShareVideo(vid)}
                  onOpenReport={(vid) => setReportVideo(vid)}
                  onSelectHashtag={(tag) => {
                    setActiveTag(tag);
                    setCurrentIndex(0);
                  }}
                  onSelectCreator={(cid) => {
                    setSelectedCreatorId(cid);
                    setSubView('profile');
                  }}
                />

                {/* Vertical Step Controls (Next / Prev) */}
                <div className="hidden md:flex absolute -right-16 top-1/2 transform -translate-y-1/2 flex-col gap-3">
                  <button
                    onClick={handlePrevVideo}
                    disabled={currentIndex === 0}
                    className="p-3 rounded-full bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition shadow-lg"
                    title="Previous Video (Up Arrow)"
                  >
                    <ArrowUp className="w-5 h-5" />
                  </button>
                  <div className="text-[10px] font-mono text-center text-slate-500">
                    {currentIndex + 1}/{videos.length}
                  </div>
                  <button
                    onClick={handleNextVideo}
                    disabled={currentIndex === videos.length - 1}
                    className="p-3 rounded-full bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition shadow-lg"
                    title="Next Video (Down Arrow)"
                  >
                    <ArrowDown className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* SUBVIEW: Rewards Dashboard */}
        {subView === 'rewards' && (
          <div className="w-full h-full overflow-y-auto">
            <BlueTixaRewardsDashboard
              onOpenCreate={() => setIsCreateOpen(true)}
              onOpenFeed={() => setSubView('feed')}
            />
          </div>
        )}

        {/* SUBVIEW: Creator Studio */}
        {subView === 'studio' && (
          <div className="w-full h-full overflow-y-auto">
            <BlueTixaCreatorStudio
              onOpenCreate={() => setIsCreateOpen(true)}
              onOpenRewards={() => setSubView('rewards')}
            />
          </div>
        )}

        {/* SUBVIEW: Profile Showcase */}
        {subView === 'profile' && (
          <div className="w-full h-full overflow-y-auto">
            <BlueTixaProfileView
              creatorId={selectedCreatorId}
              onSelectVideo={(vidId) => {
                const targetIdx = videos.findIndex(v => v.id === vidId);
                if (targetIdx !== -1) {
                  setCurrentIndex(targetIdx);
                }
                setSubView('feed');
              }}
              onOpenCreate={() => setIsCreateOpen(true)}
              onOpenRewards={() => setSubView('rewards')}
            />
          </div>
        )}
      </main>

      {/* Bottom Mobile Create Float (on small screens) */}
      <div className="sm:hidden fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setIsCreateOpen(true)}
          className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-black flex items-center justify-center font-bold shadow-[0_0_20px_rgba(6,182,212,0.5)] active:scale-95 transition"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Modals */}
      {commentVideo && (
        <BlueTixaCommentsModal
          isOpen={true}
          onClose={() => setCommentVideo(null)}
          videoId={commentVideo.id}
          creatorHandle={commentVideo.creatorHandle}
        />
      )}

      {shareVideo && (
        <BlueTixaShareModal
          isOpen={true}
          onClose={() => setShareVideo(null)}
          videoId={shareVideo.id}
          videoTitle={shareVideo.caption}
          creatorHandle={shareVideo.creatorHandle}
        />
      )}

      {reportVideo && (
        <BlueTixaReportModal
          isOpen={true}
          onClose={() => setReportVideo(null)}
          videoId={reportVideo.id}
          creatorId={reportVideo.creatorId}
          creatorHandle={reportVideo.creatorHandle}
        />
      )}

      {isCreateOpen && (
        <BlueTixaCreateModal
          isOpen={true}
          onClose={() => setIsCreateOpen(false)}
          onSuccess={(newVideo) => {
            loadFeed();
            setSubView('feed');
            setCurrentIndex(0);
          }}
        />
      )}

      {isDiscoverOpen && (
        <BlueTixaDiscoverModal
          isOpen={true}
          onClose={() => setIsDiscoverOpen(false)}
          onSelectHashtag={(tag) => {
            setActiveTag(tag);
            setSubView('feed');
            setCurrentIndex(0);
          }}
          onSelectVideo={(vidId) => {
            const idx = videos.findIndex(v => v.id === vidId);
            if (idx !== -1) {
              setCurrentIndex(idx);
            }
            setSubView('feed');
          }}
          onSelectCreator={(cid) => {
            setSelectedCreatorId(cid);
            setSubView('profile');
          }}
        />
      )}
    </div>
  );
};
