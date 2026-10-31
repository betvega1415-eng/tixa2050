import React, { useState, useEffect } from 'react';
import { 
  User, 
  CheckCircle2, 
  Heart, 
  Bookmark, 
  Video, 
  Coins, 
  Play, 
  Share2, 
  Settings,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { BlueTixaVideo, BlueTixaUserProfile } from '../../types/blueTixa';
import { blueTixaVideoEngine } from '../../core/blueTixaVideoEngine';
import { blueTixaRewardEngine } from '../../core/blueTixaRewardEngine';
import { authEngine } from '../../core/authEngine';
import { HashBadge } from '../common/HashBadge';

interface BlueTixaProfileViewProps {
  creatorId?: string;
  onSelectVideo: (videoId: string) => void;
  onOpenCreate: () => void;
  onOpenRewards: () => void;
}

export const BlueTixaProfileView: React.FC<BlueTixaProfileViewProps> = ({
  creatorId,
  onSelectVideo,
  onOpenCreate,
  onOpenRewards
}) => {
  const session = authEngine.getSession();
  const activeUserId = creatorId || session?.walletAddress || 'CURRENT_USER';
  const isSelf = !creatorId || creatorId === 'CURRENT_USER' || creatorId === session?.walletAddress;

  const [activeTab, setActiveTab] = useState<'videos' | 'saved' | 'liked'>('videos');
  const [profile, setProfile] = useState<BlueTixaUserProfile | null>(null);
  const [videos, setVideos] = useState<BlueTixaVideo[]>([]);
  const [savedVideos, setSavedVideos] = useState<BlueTixaVideo[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    // Look up profile
    const existing = blueTixaVideoEngine.getCreatorProfile(activeUserId);
    if (existing) {
      setProfile(existing);
    } else {
      // Default self profile
      const userName = session?.email ? session.email.split('@')[0] : 'TIXA Pioneer';
      setProfile({
        id: activeUserId,
        handle: session ? `@${userName.toLowerCase()}` : '@tixapioneer',
        name: userName,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        bio: 'TIXA Web3 Creator & Decentralized Trader. Exploring the 2050 Quantum Consensus. 🚀',
        walletAddress: session?.walletAddress || 'TXA1111222233334444555566667777888899990000',
        isVerified: true,
        followersCount: 1420,
        followingCount: 38,
        likesReceivedCount: 12400,
        totalVideosCount: 3,
        joinedDate: 'Aug 2026'
      });
    }

    setVideos(blueTixaVideoEngine.getUserVideos(activeUserId));
    setSavedVideos(blueTixaVideoEngine.getSavedVideos());
  }, [activeUserId, session]);

  const handleToggleFollow = () => {
    if (profile) {
      const next = blueTixaVideoEngine.toggleFollow(profile.id);
      setIsFollowing(next);
      setProfile(prev => prev ? {
        ...prev,
        followersCount: prev.followersCount + (next ? 1 : -1)
      } : null);
    }
  };

  if (!profile) return null;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Profile Header Card */}
      <div className="p-6 rounded-3xl bg-[#060c1c] border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.1)] space-y-5">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="relative">
            <img 
              src={profile.avatar} 
              alt={profile.name} 
              className="w-24 h-24 rounded-full border-2 border-cyan-400 p-0.5 object-cover shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            />
            {profile.isVerified && (
              <div className="absolute bottom-0 right-0 p-1 rounded-full bg-cyan-500 text-black">
                <CheckCircle2 className="w-4 h-4 fill-cyan-400 text-black" />
              </div>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-white font-mono flex items-center justify-center sm:justify-start gap-2">
                  <span>{profile.name}</span>
                </h1>
                <span className="text-xs font-mono text-cyan-400">{profile.handle}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-2">
                {isSelf ? (
                  <>
                    <button
                      onClick={onOpenRewards}
                      className="px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 hover:bg-cyan-500/30 text-cyan-300 font-mono text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <Coins className="w-3.5 h-3.5 text-amber-400" />
                      <span>Rewards</span>
                    </button>
                    <button
                      onClick={onOpenCreate}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono text-xs font-bold transition shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                    >
                      + Create Short
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleToggleFollow}
                    className={`px-6 py-2 rounded-xl font-mono text-xs font-bold transition ${
                      isFollowing
                        ? 'bg-slate-800 text-slate-300 border border-slate-700'
                        : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                    }`}
                  >
                    {isFollowing ? 'Following' : '+ Follow'}
                  </button>
                )}
              </div>
            </div>

            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">{profile.bio}</p>

            <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
              <span className="text-[11px] font-mono text-slate-500">Wallet:</span>
              <HashBadge hash={profile.walletAddress} type="address" />
            </div>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-800 text-center font-mono">
          <div>
            <div className="text-lg font-bold text-white">{profile.followersCount.toLocaleString()}</div>
            <div className="text-[10px] text-slate-400 uppercase">Followers</div>
          </div>
          <div>
            <div className="text-lg font-bold text-white">{profile.followingCount.toLocaleString()}</div>
            <div className="text-[10px] text-slate-400 uppercase">Following</div>
          </div>
          <div>
            <div className="text-lg font-bold text-rose-400">{profile.likesReceivedCount.toLocaleString()}</div>
            <div className="text-[10px] text-slate-400 uppercase">Total Likes</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-around border-b border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab('videos')}
          className={`py-3 px-6 text-xs font-mono font-bold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'videos'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>Videos ({videos.length})</span>
        </button>

        {isSelf && (
          <button
            type="button"
            onClick={() => setActiveTab('saved')}
            className={`py-3 px-6 text-xs font-mono font-bold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'saved'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Saved ({savedVideos.length})</span>
          </button>
        )}
      </div>

      {/* Video Grid */}
      <div>
        {activeTab === 'videos' && (
          videos.length === 0 ? (
            <div className="py-16 text-center text-slate-500 space-y-3">
              <Video className="w-10 h-10 mx-auto opacity-30 text-cyan-400" />
              <p className="text-xs font-mono">No videos published yet.</p>
              {isSelf && (
                <button
                  onClick={onOpenCreate}
                  className="px-4 py-2 rounded-xl bg-cyan-500 text-black font-bold font-mono text-xs"
                >
                  Upload Video
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {videos.map(v => (
                <div
                  key={v.id}
                  onClick={() => onSelectVideo(v.id)}
                  className="group cursor-pointer rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition aspect-[9/14] relative flex flex-col justify-end p-3"
                >
                  <img src={v.thumbnailUrl} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  <div className="relative z-10 space-y-1">
                    <div className="text-xs font-bold text-white line-clamp-2">{v.caption}</div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-cyan-300">
                      <span className="flex items-center gap-1">
                        <Play className="w-2.5 h-2.5" />
                        {v.viewsCount.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1 text-rose-400">
                        <Heart className="w-2.5 h-2.5" />
                        {v.likesCount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === 'saved' && (
          savedVideos.length === 0 ? (
            <div className="py-16 text-center text-slate-500 space-y-2">
              <Bookmark className="w-10 h-10 mx-auto opacity-30 text-cyan-400" />
              <p className="text-xs font-mono">No bookmarked videos yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {savedVideos.map(v => (
                <div
                  key={v.id}
                  onClick={() => onSelectVideo(v.id)}
                  className="group cursor-pointer rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition aspect-[9/14] relative flex flex-col justify-end p-3"
                >
                  <img src={v.thumbnailUrl} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  <div className="relative z-10 space-y-1">
                    <div className="text-xs font-bold text-white line-clamp-2">{v.caption}</div>
                    <div className="text-[10px] font-mono text-cyan-300 flex items-center gap-1">
                      <Play className="w-2.5 h-2.5" />
                      {v.viewsCount.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};
