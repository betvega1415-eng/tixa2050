import React, { useState, useRef, useEffect } from 'react';
import { Palette, Zap, Sparkles, Check, ChevronDown, Layers, Moon, SunMedium } from 'lucide-react';
import { useTheme, AppTheme, THEME_OPTIONS } from '../../context/ThemeContext';
import { soundEngine } from '../../core/soundEngine';

interface ThemeSwitcherProps {
  variant?: 'navbar' | 'compact' | 'drawer' | 'card';
  className?: string;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ 
  variant = 'navbar',
  className = ''
}) => {
  const { theme, setTheme, toggleTheme, isCyberBlue, isMinimalistMono } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectTheme = (selected: AppTheme, e: React.MouseEvent) => {
    e.stopPropagation();
    setTheme(selected);
    setIsOpen(false);
  };

  if (variant === 'card') {
    return (
      <div className={`p-4 rounded-2xl border transition-all ${
        isCyberBlue 
          ? 'bg-[#080d22]/80 border-cyan-500/30 shadow-lg shadow-cyan-950/40' 
          : 'bg-zinc-900/90 border-zinc-700/80 shadow-lg shadow-black/60'
      } ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Palette className={`w-4 h-4 ${isCyberBlue ? 'text-cyan-400' : 'text-zinc-200'}`} />
            <span className="font-heading font-bold text-sm text-slate-100">Interface Theme Engine</span>
          </div>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
            isCyberBlue 
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-700' 
              : 'bg-zinc-800 text-zinc-200 border border-zinc-600'
          }`}>
            {isCyberBlue ? 'Cyber Blue Active' : 'Minimalist Mono Active'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Cyber Blue Option Card */}
          <button
            type="button"
            onClick={(e) => handleSelectTheme('cyber-blue', e)}
            data-sound="toggle"
            className={`flex flex-col text-left p-3 rounded-xl border transition-all relative overflow-hidden ${
              isCyberBlue
                ? 'bg-gradient-to-br from-cyan-950/70 to-blue-950/60 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-xs text-white">Cyber Blue</span>
              </div>
              {isCyberBlue && <Check className="w-3.5 h-3.5 text-cyan-400" />}
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Futuristic neon cyan glow, glassmorphism, and holographic Web3 cyber grids.
            </p>
            <div className="flex items-center gap-1 mt-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
            </div>
          </button>

          {/* Minimalist Mono Option Card */}
          <button
            type="button"
            onClick={(e) => handleSelectTheme('minimalist-mono', e)}
            data-sound="toggle"
            className={`flex flex-col text-left p-3 rounded-xl border transition-all relative overflow-hidden ${
              isMinimalistMono
                ? 'bg-zinc-800/90 border-zinc-300 shadow-[0_0_20px_rgba(255,255,255,0.15)]'
                : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Moon className="w-4 h-4 text-zinc-100" />
                <span className="font-bold text-xs text-white">Minimalist Mono</span>
              </div>
              {isMinimalistMono && <Check className="w-3.5 h-3.5 text-zinc-100" />}
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Ultra-clean monochrome obsidian palette, high-contrast silver borders & zero neon clutter.
            </p>
            <div className="flex items-center gap-1 mt-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_6px_#ffffff]"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-400"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-700"></span>
            </div>
          </button>
        </div>
      </div>
    );
  }

  if (variant === 'compact' || variant === 'drawer') {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        <button
          type="button"
          id="theme-switcher-compact-toggle"
          onClick={toggleTheme}
          data-sound="toggle"
          title={`Active: ${THEME_OPTIONS[theme].name}. Click to switch theme.`}
          className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-mono font-medium transition-all duration-200 border ${
            isCyberBlue
              ? 'bg-cyan-950/60 hover:bg-cyan-900/70 border-cyan-500/40 text-cyan-300'
              : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-600 text-zinc-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {isCyberBlue ? (
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-zinc-200" />
            )}
            <span>Theme: {THEME_OPTIONS[theme].name}</span>
          </div>
          <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
            isCyberBlue ? 'bg-cyan-900/80 text-cyan-200' : 'bg-zinc-800 text-zinc-300'
          }`}>
            TOGGLE
          </span>
        </button>
      </div>
    );
  }

  // Default 'navbar' variant
  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <div className="flex items-center">
        {/* Main Quick Toggle Button */}
        <button
          type="button"
          id="navbar-theme-toggle-btn"
          onClick={toggleTheme}
          onContextMenu={(e) => {
            e.preventDefault();
            setIsOpen(!isOpen);
          }}
          data-sound="toggle"
          title={`Theme: ${THEME_OPTIONS[theme].name} (Click to toggle, right-click for menu)`}
          className={`relative group flex items-center justify-center gap-1 sm:gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg sm:rounded-xl text-xs font-mono transition-all duration-200 ${
            isCyberBlue
              ? 'bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-500/40 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
              : 'bg-zinc-900 hover:bg-zinc-800 border border-zinc-600 text-zinc-100 shadow-[0_0_12px_rgba(255,255,255,0.08)]'
          }`}
        >
          {isCyberBlue ? (
            <>
              <Zap className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-12 transition-transform" />
              <span className="hidden xl:inline font-bold text-[10px] tracking-wider text-cyan-300">
                CYBER
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee] animate-pulse" />
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-zinc-100 group-hover:-rotate-12 transition-transform" />
              <span className="hidden xl:inline font-bold text-[10px] tracking-wider text-zinc-200">
                MONO
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_#ffffff]" />
            </>
          )}
        </button>

        {/* Dropdown Menu Arrow Trigger (Desktop/Tablet only for cleaner mobile screen) */}
        <button
          type="button"
          id="navbar-theme-dropdown-arrow"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className={`hidden sm:inline-flex px-1 py-1.5 rounded-r-xl -ml-1 border-y border-r text-[10px] transition-colors ${
            isCyberBlue
              ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-400 hover:bg-cyan-900/60'
              : 'bg-zinc-900 border-zinc-600 text-zinc-300 hover:bg-zinc-800'
          }`}
          title="Choose UI Visual Theme"
        >
          ▾
        </button>
      </div>

      {/* Popover Menu with Detailed Preview Cards */}
      {isOpen && (
        <div className={`absolute right-0 mt-2 w-72 rounded-2xl border shadow-2xl p-3 z-50 text-xs font-mono space-y-2.5 animate-in fade-in zoom-in-95 duration-150 ${
          isCyberBlue
            ? 'bg-[#080d22] border-cyan-500/40 shadow-cyan-950/80'
            : 'bg-[#0c0c0e] border-zinc-700 shadow-black'
        }`}>
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-1.5 text-white font-bold">
              <Palette className={`w-3.5 h-3.5 ${isCyberBlue ? 'text-cyan-400' : 'text-zinc-200'}`} />
              <span className="font-heading">Visual Theme Switcher</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
              SAVED TO STORAGE
            </span>
          </div>

          <div className="space-y-1.5">
            {/* Option 1: Cyber Blue */}
            <button
              type="button"
              onClick={(e) => handleSelectTheme('cyber-blue', e)}
              data-sound="toggle"
              className={`w-full flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                isCyberBlue
                  ? 'bg-cyan-950/70 border-cyan-400 text-white shadow-md shadow-cyan-950/60'
                  : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
              }`}
            >
              <div className={`mt-0.5 p-1.5 rounded-lg ${isCyberBlue ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'}`}>
                <Zap className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">Cyber Blue</span>
                  {isCyberBlue && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                </div>
                <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                  Futuristic neon cyan glow, glassmorphism & holographic grid.
                </p>
                <div className="flex items-center gap-1 mt-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_4px_#22d3ee]"></span>
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span className="text-[9px] text-cyan-400/90 font-mono ml-1">Default Neon Mode</span>
                </div>
              </div>
            </button>

            {/* Option 2: Minimalist Mono */}
            <button
              type="button"
              onClick={(e) => handleSelectTheme('minimalist-mono', e)}
              data-sound="toggle"
              className={`w-full flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                isMinimalistMono
                  ? 'bg-zinc-800/90 border-zinc-300 text-white shadow-md shadow-zinc-900/80'
                  : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
              }`}
            >
              <div className={`mt-0.5 p-1.5 rounded-lg ${isMinimalistMono ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'}`}>
                <Moon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">Minimalist Mono</span>
                  {isMinimalistMono && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                </div>
                <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                  Obsidian dark noir, high-contrast grayscale & ultra-sharp precision.
                </p>
                <div className="flex items-center gap-1 mt-1.5">
                  <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_4px_#ffffff]"></span>
                  <span className="w-2 h-2 rounded-full bg-zinc-400"></span>
                  <span className="text-[9px] text-zinc-300 font-mono ml-1">Obsidian Monochrome</span>
                </div>
              </div>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Instant Zero-Reload Switch</span>
            <span className="font-bold text-slate-300">TIXAPAY UI</span>
          </div>
        </div>
      )}
    </div>
  );
};
