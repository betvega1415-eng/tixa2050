import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, UserPlus, LogIn, ArrowRight, X, Cpu, Globe, Award, Zap } from 'lucide-react';
import { soundEngine } from '../../core/soundEngine';
import confetti from 'canvas-confetti';

interface WelcomeAnnouncementModalProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const WelcomeAnnouncementModal: React.FC<WelcomeAnnouncementModalProps> = ({ onOpenAuth }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const hasSeen = localStorage.getItem('tixa_visitor_announcement_seen_v1');
      if (!hasSeen) {
        // Show after a short delay for maximum impact
        const timer = setTimeout(() => {
          setIsOpen(true);
          soundEngine.play('success');
          confetti({ particleCount: 100, spread: 90, origin: { y: 0.4 } });
        }, 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    try {
      localStorage.setItem('tixa_visitor_announcement_seen_v1', 'true');
    } catch {}
  };

  const handleAction = (mode: 'login' | 'register') => {
    handleClose();
    onOpenAuth(mode);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#091428] via-[#050b18] to-[#030712] border-2 border-cyan-500/50 rounded-3xl shadow-2xl shadow-cyan-500/40 p-6 sm:p-8 overflow-hidden">
        
        {/* Background glow effects */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-900/85 text-slate-400 hover:text-white border border-slate-700 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-cyan-400 via-emerald-400 to-blue-500 text-black shadow-lg shadow-cyan-500/40 animate-pulse">
            <Shield className="w-8 h-8 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold border border-cyan-500/40 uppercase">
                Official Announcement
              </span>
              <span className="text-emerald-400 font-mono text-xs font-bold">• Live Ecosystem</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-heading uppercase tracking-wide mt-1">
              Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">TIXA Net Pay</span>
            </h2>
          </div>
        </div>

        {/* Announcement Message Body */}
        <div className="space-y-4 mb-8 text-slate-300 text-sm font-sans leading-relaxed">
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/30 shadow-inner space-y-2">
            <p className="font-bold text-white flex items-center gap-2 text-xs font-mono">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Attention New Visitor:</span>
            </p>
            <p className="text-xs sm:text-sm text-slate-300">
              To unlock full non-custodial decentralized vault capabilities, professional trading, and <strong className="text-cyan-300">FIXDIPOZ VIP Mining (33 Boxes)</strong>, please log into your account or create a new secure vault instantly.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Instant Account Creation</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <Award className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Zero-Trust Security</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={() => handleAction('register')}
            className="w-full sm:flex-1 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-cyan-400 via-emerald-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-extrabold text-xs sm:text-sm shadow-lg shadow-cyan-500/30 transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
          >
            <UserPlus className="w-4 h-4 stroke-[2.5]" />
            <span>Create New Account</span>
          </button>

          <button
            type="button"
            onClick={() => handleAction('login')}
            className="w-full sm:flex-1 py-3.5 px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 hover:text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In / Login</span>
          </button>
        </div>

        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={handleClose}
            className="text-[11px] font-mono text-slate-500 hover:text-slate-300 underline transition-colors"
          >
            Continue as Guest / Explore Platform
          </button>
        </div>

      </div>
    </div>
  );
};
