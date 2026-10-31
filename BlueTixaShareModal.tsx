import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  Send, 
  Twitter, 
  Globe, 
  QrCode,
  Link2
} from 'lucide-react';
import { blueTixaVideoEngine } from '../../core/blueTixaVideoEngine';

interface BlueTixaShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
  videoTitle: string;
  creatorHandle: string;
}

export const BlueTixaShareModal: React.FC<BlueTixaShareModalProps> = ({
  isOpen,
  onClose,
  videoId,
  videoTitle,
  creatorHandle
}) => {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  if (!isOpen) return null;

  const shareUrl = `${window.location.origin}/#bluetixa/v/${videoId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    blueTixaVideoEngine.recordShare(videoId);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `BLUE TIXA - ${creatorHandle}`,
          text: videoTitle,
          url: shareUrl
        });
        blueTixaVideoEngine.recordShare(videoId);
        onClose();
      } catch (e) {
        // Ignored if cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(`Watch "${videoTitle}" by ${creatorHandle} on BLUE TIXA Decentralized Short-Video! 🚀💎`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`, '_blank');
    blueTixaVideoEngine.recordShare(videoId);
  };

  const handleTelegramShare = () => {
    const text = encodeURIComponent(`Watch on BLUE TIXA: ${videoTitle}`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${text}`, '_blank');
    blueTixaVideoEngine.recordShare(videoId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md bg-[#060b18] border border-cyan-500/30 rounded-t-3xl sm:rounded-3xl shadow-[0_0_40px_rgba(6,182,212,0.25)] p-5 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white font-mono tracking-wide">Share Short-Video</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Social Options Grid */}
        <div className="grid grid-cols-4 gap-3 py-6 text-center">
          <button 
            onClick={handleWebShare}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <Share2 className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono text-slate-300">Quick Share</span>
          </button>

          <button 
            onClick={handleTwitterShare}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 group-hover:scale-110 transition">
              <Twitter className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono text-slate-300">X (Twitter)</span>
          </button>

          <button 
            onClick={handleTelegramShare}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 group-hover:scale-110 transition">
              <Send className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono text-slate-300">Telegram</span>
          </button>

          <button 
            onClick={() => setShowQr(!showQr)}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 group-hover:scale-110 transition">
              <QrCode className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-mono text-slate-300">QR Code</span>
          </button>
        </div>

        {/* QR Code Expansion */}
        {showQr && (
          <div className="p-4 mb-4 rounded-2xl bg-slate-900 border border-slate-800 text-center animate-fade-in">
            <div className="w-32 h-32 mx-auto bg-white p-2 rounded-xl flex items-center justify-center">
              <QrCode className="w-28 h-28 text-slate-950" />
            </div>
            <p className="text-[10px] text-slate-400 mt-2 font-mono">Scan with camera to watch on mobile</p>
          </div>
        )}

        {/* Copy Link Bar */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
          <Link2 className="w-4 h-4 ml-2 text-cyan-400 shrink-0" />
          <input 
            type="text" 
            readOnly 
            value={shareUrl}
            className="w-full bg-transparent text-xs text-slate-300 font-mono focus:outline-none truncate" 
          />
          <button
            onClick={handleCopyLink}
            className={`px-3 py-1.5 rounded-xl font-bold font-mono text-xs flex items-center gap-1.5 transition ${
              copied 
                ? 'bg-emerald-500 text-black' 
                : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_12px_rgba(6,182,212,0.3)]'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
