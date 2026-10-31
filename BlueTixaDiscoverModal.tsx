import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Hash, 
  TrendingUp, 
  Music, 
  User, 
  Play, 
  Flame,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { BlueTixaVideo } from '../../types/blueTixa';
import { blueTixaVideoEngine } from '../../core/blueTixaVideoEngine';
import { TRENDING_HASHTAGS, POPULAR_AUDIO_TRACKS, INITIAL_BLUE_TIXA_USERS } from '../../data/blueTixaSeedData';

interface BlueTixaDiscoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectHashtag: (tag: string) => void;
  onSelectVideo: (videoId: string) => void;
  onSelectCreator: (creatorId: string) => void;
}

export const BlueTixaDiscoverModal: React.FC<BlueTixaDiscoverModalProps> = ({
  isOpen,
  onClose,
  onSelectHashtag,
  onSelectVideo,
  onSelectCreator
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BlueTixaVideo[]>([]);

  if (!isOpen) return null;

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (q.trim()) {
      setSearchResults(blueTixaVideoEngine.getFeed({ searchQuery: q }));
    } else {
      setSearchResults([]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
      <div 
        className="w-full max-w-2xl bg-[#060b18] border border-cyan-500/30 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.25)] overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="p-4 border-b border-slate-800 bg-[#081026] flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search videos, creators (@elena_crypto), #hashtags, trading signals..."
              autoFocus
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-sans"
            />
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Search Results if query exists */}
          {searchQuery.trim().length > 0 ? (
            <div className="space-y-4">
              <h4 className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                Search Results ({searchResults.length})
              </h4>
              {searchResults.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-30 text-cyan-400" />
                  <p className="text-xs">No matching videos or creators found for "{searchQuery}".</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {searchResults.map(v => (
                    <div 
                      key={v.id}
                      onClick={() => {
                        onSelectVideo(v.id);
                        onClose();
                      }}
                      className="group cursor-pointer rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition aspect-[9/14] relative flex flex-col justify-end p-2.5"
                    >
                      <img src={v.thumbnailUrl} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                      <div className="relative z-10 space-y-1">
                        <div className="text-[11px] font-bold text-white line-clamp-2">{v.caption}</div>
                        <div className="text-[10px] text-cyan-300 font-mono flex items-center gap-1">
                          <Play className="w-2.5 h-2.5" />
                          <span>{v.viewsCount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Trending Hashtags */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono text-white font-bold">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Trending Topics & Hashtags</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {TRENDING_HASHTAGS.map(item => (
                    <button
                      key={item.tag}
                      onClick={() => {
                        onSelectHashtag(item.tag);
                        onClose();
                      }}
                      className="p-3 rounded-2xl bg-[#081026] border border-slate-800 hover:border-cyan-500/50 text-left transition flex items-center justify-between group"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition font-mono">{item.tag}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{item.count}</div>
                      </div>
                      <Hash className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Verified Creators */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono text-white font-bold">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Featured Creators</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {INITIAL_BLUE_TIXA_USERS.map(user => (
                    <div 
                      key={user.id}
                      onClick={() => {
                        onSelectCreator(user.id);
                        onClose();
                      }}
                      className="p-3 rounded-2xl bg-[#081026] border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition flex items-center gap-3"
                    >
                      <img src={user.avatar} alt="" className="w-10 h-10 rounded-full border border-cyan-500/30 object-cover" />
                      <div className="flex-1 truncate">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-white truncate">{user.name}</span>
                          {user.isVerified && <CheckCircle2 className="w-3 h-3 text-cyan-400 shrink-0" />}
                        </div>
                        <div className="text-[10px] text-cyan-300 font-mono">{user.handle}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{user.followersCount.toLocaleString()} followers</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trending Audio */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono text-white font-bold">
                  <Music className="w-4 h-4 text-purple-400" />
                  <span>Trending Sounds & Beats</span>
                </div>
                <div className="space-y-2">
                  {POPULAR_AUDIO_TRACKS.map(track => (
                    <div 
                      key={track.id}
                      className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                          <Music className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">{track.title}</div>
                          <div className="text-[10px] text-slate-400">{track.artist}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded-full border border-cyan-900">
                        {track.uses}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
