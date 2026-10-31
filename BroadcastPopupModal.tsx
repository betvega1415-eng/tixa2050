import React, { useState, useEffect } from 'react';
import { Sparkles, X, ArrowUpRight, Play, Zap, Clock } from 'lucide-react';
import { broadcastMediaEngine } from '../../core/broadcastMediaEngine';
import { BroadcastMediaItem } from '../../types/broadcast';
import { authEngine } from '../../core/authEngine';

interface BroadcastPopupModalProps {
  onNavigateTab?: (tab: string) => void;
  onOpenDeposit?: () => void;
}

export const BroadcastPopupModal: React.FC<BroadcastPopupModalProps> = ({ onNavigateTab, onOpenDeposit }) => {
  const [activePopup, setActivePopup] = useState<BroadcastMediaItem | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const session = authEngine.getSession();
    const user = session ? authEngine.getUserById(session.userId) : null;
    const userPhone = session?.phone || user?.phone;
    const popups = broadcastMediaEngine.getActiveBroadcasts(
      'POPUP_MODAL',
      session?.email,
      userPhone
    );

    if (popups.length > 0) {
      const topPopup = popups[0];
      const dismissedKey = `dismissed_popup_${topPopup.id}`;
      const isDismissed = sessionStorage.getItem(dismissedKey);

      if (!isDismissed) {
        setActivePopup(topPopup);
        setIsOpen(true);
        broadcastMediaEngine.recordImpression(topPopup.id);
      }
    }
  }, []);

  const handleClose = () => {
    if (activePopup) {
      sessionStorage.setItem(`dismissed_popup_${activePopup.id}`, 'true');
    }
    setIsOpen(false);
  };

  const handleAction = () => {
    if (!activePopup) return;
    broadcastMediaEngine.recordClick(activePopup.id);
    handleClose();

    if (!activePopup.actionUrl) return;

    if (activePopup.actionUrl.startsWith('#')) {
      const target = activePopup.actionUrl.replace('#', '');
      if (target === 'deposit' && onOpenDeposit) {
        onOpenDeposit();
      } else if (onNavigateTab) {
        onNavigateTab(target);
      }
    } else if (activePopup.actionUrl.startsWith('http')) {
      window.open(activePopup.actionUrl, '_blank', 'noopener,noreferrer');
    } else if (onNavigateTab) {
      onNavigateTab(activePopup.actionUrl);
    }
  };

  if (!isOpen || !activePopup) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#090e23] border-2 border-cyan-500/60 shadow-2xl overflow-hidden p-6 space-y-4 text-slate-100">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Media Thumbnail */}
        {activePopup.imageUrl && (
          <div className="relative h-44 -mx-6 -mt-6 overflow-hidden bg-slate-950">
            <img 
              src={activePopup.imageUrl} 
              alt={activePopup.title}
              className="w-full h-full object-cover brightness-[0.7]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#090e23] via-transparent to-transparent" />
            
            {activePopup.badgeText && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 text-black font-extrabold text-[11px] font-mono shadow-lg flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {activePopup.badgeText}
              </span>
            )}
          </div>
        )}

        {/* Content */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white font-heading">
            {activePopup.title}
          </h3>
          {activePopup.subtitle && (
            <p className="text-xs font-semibold text-cyan-300 font-mono">
              {activePopup.subtitle}
            </p>
          )}
          <p className="text-xs text-slate-300 font-mono leading-relaxed pt-1">
            {activePopup.message}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 pt-3">
          {activePopup.actionLabel && (
            <button
              onClick={handleAction}
              className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:from-cyan-300 text-black font-extrabold text-xs font-mono flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all"
            >
              <span>{activePopup.actionLabel}</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleClose}
            className="py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white text-xs font-mono transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
