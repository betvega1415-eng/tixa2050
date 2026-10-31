import React, { useState, useEffect, useRef } from 'react';
import { Bot, Sparkles, MessageSquareCode, Shield, Zap, X } from 'lucide-react';
import { tixaAiEngine, TixaAiSession } from '../../core/tixaAiEngine';

interface FloatingTixaAiButtonProps {
  onOpenDashboard: () => void;
}

export const FloatingTixaAiButton: React.FC<FloatingTixaAiButtonProps> = ({ onOpenDashboard }) => {
  // Default position: bottom right floating
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    if (typeof window !== 'undefined') {
      return {
        x: Math.max(16, window.innerWidth - 88),
        y: Math.max(80, window.innerHeight - 170)
      };
    }
    return { x: 20, y: 100 };
  });

  const [isDragging, setIsDragging] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [session, setSession] = useState<TixaAiSession>(() => tixaAiEngine.getCurrentSession());
  const [showTooltip, setShowTooltip] = useState(true);

  const buttonRef = useRef<HTMLDivElement>(null);

  // Sync with engine
  useEffect(() => {
    const unsub = tixaAiEngine.subscribe(() => {
      setSession(tixaAiEngine.getCurrentSession());
    });
    return unsub;
  }, []);

  // Update position on window resize so it stays in bounds
  useEffect(() => {
    const handleResize = () => {
      setPosition(prev => ({
        x: Math.min(Math.max(12, prev.x), window.innerWidth - 80),
        y: Math.min(Math.max(70, prev.y), window.innerHeight - 130)
      }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // only left click
    setIsDragging(true);
    setHasMoved(false);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  // Touch Drag Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setHasMoved(false);
      setDragOffset({
        x: touch.clientX - position.x,
        y: touch.clientY - position.y
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      setHasMoved(true);
      const newX = Math.min(Math.max(12, e.clientX - dragOffset.x), window.innerWidth - 80);
      const newY = Math.min(Math.max(65, e.clientY - dragOffset.y), window.innerHeight - 130);
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      setHasMoved(true);
      const touch = e.touches[0];
      const newX = Math.min(Math.max(12, touch.clientX - dragOffset.x), window.innerWidth - 80);
      const newY = Math.min(Math.max(65, touch.clientY - dragOffset.y), window.innerHeight - 130);
      setPosition({ x: newX, y: newY });
    };

    const handleTouchEnd = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, dragOffset]);

  const handleClick = (e: React.MouseEvent) => {
    if (hasMoved) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    setShowTooltip(false);
    onOpenDashboard();
  };

  const messageCount = session?.messages?.length || 0;

  return (
    <div
      ref={buttonRef}
      id="tixa-ai-floating-container"
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        touchAction: 'none'
      }}
      className="fixed top-0 left-0 z-50 select-none transition-shadow"
    >
      {/* Floating Prompt Bubble on First View */}
      {showTooltip && (
        <div className="absolute -top-12 right-0 sm:right-auto sm:-left-24 bg-gradient-to-r from-blue-950 to-indigo-950 border border-blue-500/60 text-white text-[11px] font-mono font-medium px-3 py-1.5 rounded-xl shadow-xl shadow-blue-500/20 whitespace-nowrap flex items-center gap-2 animate-bounce">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>TIXA AI 24/7 সাপোর্ট (৩৩ ভাষা)</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(false);
            }}
            className="text-slate-400 hover:text-white p-0.5 rounded"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Main Draggable TIXA AI Button */}
      <div
        id="tixa-ai-floating-btn"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={handleClick}
        className={`group relative flex items-center justify-center cursor-grab active:cursor-grabbing p-1 rounded-full transition-transform duration-200 ${
          isDragging ? 'scale-110' : 'hover:scale-105'
        }`}
        title="TIXA AI সাপোর্ট ড্যাশবোর্ড (সোয়াপ করে সরানো যাবে)"
      >
        {/* Outer Radiant Glow Rings */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 opacity-80 blur-md group-hover:opacity-100 animate-pulse transition-opacity" />
        
        {/* Futuristic Outer Ring with Tech Accents */}
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#070c1d] border-2 border-cyan-400/80 p-0.5 shadow-2xl shadow-cyan-500/30 flex items-center justify-center overflow-hidden">
          {/* Rotating Cyber Gradient Border Accent */}
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/30 via-indigo-500/20 to-purple-500/30 animate-spin" style={{ animationDuration: '8s' }} />

          {/* Center Orb Core */}
          <div className="relative z-10 w-full h-full rounded-full bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-950 flex flex-col items-center justify-center p-1 border border-blue-400/40">
            <div className="relative">
              <Bot className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              <Sparkles className="w-2.5 h-2.5 text-amber-300 absolute -top-1 -right-1.5 animate-ping" />
            </div>
            <span className="text-[9px] font-mono font-bold tracking-tighter text-cyan-200 leading-none mt-0.5">
              TIXA AI
            </span>
          </div>

          {/* Active Online Green Dot */}
          <div className="absolute top-1 right-1.5 z-20 flex items-center justify-center">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-slate-950"></span>
            </span>
          </div>

          {/* Message Count / Live Badge */}
          {messageCount > 1 && (
            <div className="absolute bottom-0.5 right-0.5 z-20 px-1.5 py-0.2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full border border-blue-300 text-[8px] font-mono font-bold text-white shadow">
              {messageCount}
            </div>
          )}
        </div>

        {/* Small "SWIPE / DRAG" indicator badge for users */}
        <div className="absolute -bottom-4 bg-slate-900/90 border border-slate-700/80 px-1.5 py-0.5 rounded text-[8px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          SWAP / DRAG
        </div>
      </div>
    </div>
  );
};
