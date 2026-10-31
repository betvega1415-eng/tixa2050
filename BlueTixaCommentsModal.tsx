import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  Heart, 
  MessageSquare, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { BlueTixaComment } from '../../types/blueTixa';
import { blueTixaVideoEngine } from '../../core/blueTixaVideoEngine';
import { authEngine } from '../../core/authEngine';

interface BlueTixaCommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
  videoTitle: string;
  commentsCount: number;
}

export const BlueTixaCommentsModal: React.FC<BlueTixaCommentsModalProps> = ({
  isOpen,
  onClose,
  videoId,
  videoTitle,
  commentsCount
}) => {
  const [comments, setComments] = useState<BlueTixaComment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const session = authEngine.getSession();

  useEffect(() => {
    if (isOpen && videoId) {
      setComments(blueTixaVideoEngine.getComments(videoId));
    }
  }, [isOpen, videoId]);

  if (!isOpen) return null;

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    setIsSubmitting(true);
    const userName = session?.email ? session.email.split('@')[0] : 'TIXA Pioneer';
    const user = {
      id: session?.walletAddress || 'CURRENT_USER',
      name: userName,
      handle: session ? `@${userName.toLowerCase()}` : '@pioneer',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
    };

    const added = blueTixaVideoEngine.addComment({
      videoId,
      content: newCommentText.trim(),
      userId: user.id,
      userName: user.name,
      userHandle: user.handle,
      userAvatar: user.avatar
    });

    setComments(prev => [added, ...prev]);
    setNewCommentText('');
    setIsSubmitting(false);
  };

  const handleToggleLike = (commentId: string) => {
    const isLiked = blueTixaVideoEngine.toggleLikeComment(commentId);
    setComments(prev => prev.map(c => {
      if (c.id === commentId) {
        return {
          ...c,
          isLiked,
          likesCount: c.likesCount + (isLiked ? 1 : -1)
        };
      }
      return c;
    }));
  };

  const quickEmojis = ['🔥', '🚀', '💎', '👏', '📈', '⚡', '💯', '🙌'];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-lg bg-[#060b18] border border-cyan-500/30 rounded-t-3xl sm:rounded-3xl shadow-[0_0_40px_rgba(6,182,212,0.25)] flex flex-col h-[75vh] sm:h-[600px] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#091124]">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white font-mono tracking-wide">
              Comments <span className="text-cyan-400">({comments.length})</span>
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Context */}
        <div className="px-5 py-2 bg-cyan-950/30 border-b border-cyan-900/30 text-xs text-slate-400 truncate">
          On: <span className="text-cyan-300 italic">{videoTitle}</span>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30 text-cyan-400" />
              <p className="text-sm">No comments yet. Be the first to start the conversation!</p>
            </div>
          ) : (
            comments.map((comm) => (
              <div key={comm.id} className="flex items-start gap-3 group">
                <img 
                  src={comm.userAvatar} 
                  alt={comm.userName}
                  className="w-8 h-8 rounded-full border border-cyan-500/30 object-cover mt-0.5" 
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200">{comm.userName}</span>
                    <span className="text-[10px] font-mono text-cyan-400/80">{comm.userHandle}</span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(comm.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed break-words">{comm.content}</p>
                </div>
                <button 
                  onClick={() => handleToggleLike(comm.id)}
                  className={`flex flex-col items-center gap-0.5 p-1 transition ${
                    comm.isLiked ? 'text-rose-500' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${comm.isLiked ? 'fill-rose-500' : ''}`} />
                  <span className="text-[9px] font-mono">{comm.likesCount}</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Quick Emoji Bar */}
        <div className="px-4 py-1.5 bg-[#080e1e] border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {quickEmojis.map(emoji => (
            <button
              key={emoji}
              type="button"
              onClick={() => setNewCommentText(prev => prev + emoji)}
              className="text-base px-2 py-0.5 rounded-lg hover:bg-slate-800 transition"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSendComment} className="p-3 bg-[#091124] border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder="Add a comment... (earn viewer engagement points)"
            className="flex-1 px-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-sans"
          />
          <button
            type="submit"
            disabled={!newCommentText.trim() || isSubmitting}
            className="p-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold disabled:opacity-40 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
