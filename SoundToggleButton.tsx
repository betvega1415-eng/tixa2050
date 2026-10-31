import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Volume1, Sparkles, Music, Sliders, Check } from 'lucide-react';
import { soundEngine, SoundEffectType } from '../../core/soundEngine';

interface SoundToggleButtonProps {
  variant?: 'navbar' | 'compact' | 'floating';
}

export const SoundToggleButton: React.FC<SoundToggleButtonProps> = ({ variant = 'navbar' }) => {
  const [enabled, setEnabled] = useState<boolean>(soundEngine.isEnabled());
  const [volume, setVolume] = useState<number>(soundEngine.getVolume());
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [animatingSound, setAnimatingSound] = useState<boolean>(false);

  useEffect(() => {
    const unsub = soundEngine.subscribe(() => {
      setEnabled(soundEngine.isEnabled());
      setVolume(soundEngine.getVolume());
    });
    return unsub;
  }, []);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = soundEngine.toggle();
    setEnabled(newState);
    if (newState) {
      setAnimatingSound(true);
      setTimeout(() => setAnimatingSound(false), 800);
    }
  };

  const handlePlaySample = (type: SoundEffectType, e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.play(type);
    setAnimatingSound(true);
    setTimeout(() => setAnimatingSound(false), 500);
  };

  const handleSetVolume = (newVol: number, e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.setVolume(newVol);
    if (!enabled && newVol > 0) {
      soundEngine.setEnabled(true);
    }
    soundEngine.play('click');
  };

  return (
    <div className="relative inline-block text-left">
      {/* Sound Toggle Button */}
      <div className="flex items-center">
        <button
          type="button"
          id="sound-fx-toggle-btn"
          onClick={handleToggle}
          onContextMenu={(e) => {
            e.preventDefault();
            setShowMenu(!showMenu);
          }}
          title={enabled ? 'Sound FX: ON (Click to mute, right-click for settings)' : 'Sound FX: MUTED (Click to turn on)'}
          className={`relative group flex items-center justify-center gap-1 sm:gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg sm:rounded-xl text-xs font-mono transition-all duration-200 ${
            enabled
              ? 'bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-500/40 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
              : 'bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-400'
          }`}
          data-sound="toggle"
        >
          {enabled ? (
            <>
              {volume > 0.4 ? (
                <Volume2 className={`w-3.5 h-3.5 text-cyan-400 ${animatingSound ? 'scale-125 text-cyan-200 transition-transform' : ''}`} />
              ) : (
                <Volume1 className={`w-3.5 h-3.5 text-cyan-400 ${animatingSound ? 'scale-125 text-cyan-200 transition-transform' : ''}`} />
              )}
              <span className="hidden xl:inline font-bold text-[10px] tracking-wider text-cyan-300">FX</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden xl:inline font-medium text-[10px] text-slate-400">MUTE</span>
            </>
          )}
        </button>

        {/* Quick Menu Arrow Trigger (Desktop/Tablet only for compact mobile screen) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className={`hidden sm:inline-flex px-1 py-1.5 rounded-r-xl -ml-1 border-y border-r text-[10px] transition-colors ${
            enabled 
              ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-400 hover:bg-cyan-900/60' 
              : 'bg-slate-900/60 border-slate-700/60 text-slate-500 hover:bg-slate-800'
          }`}
          title="Sound FX Options & Audio Samples"
        >
          ▾
        </button>
      </div>

      {/* Modern Sound FX Settings & Sample Palette Dropdown */}
      {showMenu && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowMenu(false)} 
          />
          <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#080e22] border border-cyan-500/40 shadow-2xl p-3 z-50 text-xs font-mono space-y-3 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1.5 text-white font-bold">
                <Music className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-heading">Modern Audio FX Engine</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${enabled ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'bg-slate-800 text-slate-400'}`}>
                {enabled ? 'ENABLED' : 'MUTED'}
              </span>
            </div>

            {/* Enable / Disable Button */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  soundEngine.setEnabled(true);
                  setShowMenu(false);
                }}
                className={`flex-1 py-1.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                  enabled 
                    ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20' 
                    : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Sound ON</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  soundEngine.setEnabled(false);
                  setShowMenu(false);
                }}
                className={`flex-1 py-1.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                  !enabled 
                    ? 'bg-rose-500/20 border border-rose-500 text-rose-300' 
                    : 'bg-slate-900 border border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <VolumeX className="w-3.5 h-3.5" />
                <span>Mute</span>
              </button>
            </div>

            {/* Volume Presets */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] text-slate-400 block flex items-center justify-between">
                <span>Output Volume Level</span>
                <span className="text-cyan-400 font-bold">{Math.round(volume * 100)}%</span>
              </span>
              <div className="grid grid-cols-4 gap-1">
                {[0.1, 0.25, 0.5, 0.8].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={(e) => handleSetVolume(v, e)}
                    className={`py-1 rounded-lg text-[10px] font-bold border transition-all ${
                      Math.abs(volume - v) < 0.05
                        ? 'bg-cyan-950 border-cyan-400 text-cyan-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {Math.round(v * 100)}%
                  </button>
                ))}
              </div>
            </div>

            {/* Modern Synthesized Sound Previews */}
            <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
              <span className="text-[10px] text-slate-400 block">Modern Sound Samples (Click to test):</span>
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={(e) => handlePlaySample('click', e)}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 text-left flex items-center justify-between"
                >
                  <span>Crisp Click</span>
                  <span className="text-[9px] text-slate-500">▶</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => handlePlaySample('tab', e)}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 text-left flex items-center justify-between"
                >
                  <span>Tab Blip</span>
                  <span className="text-[9px] text-slate-500">▶</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => handlePlaySample('success', e)}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-emerald-950/60 border border-slate-800 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-300 text-left flex items-center justify-between"
                >
                  <span>Crystal Chime</span>
                  <span className="text-[9px] text-emerald-500">▶</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => handlePlaySample('trade', e)}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 text-left flex items-center justify-between"
                >
                  <span>Trade Pulse</span>
                  <span className="text-[9px] text-cyan-500">▶</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => handlePlaySample('deposit', e)}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-amber-950/60 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-amber-300 text-left flex items-center justify-between col-span-2"
                >
                  <span>Golden Vault Inflow Shimmer</span>
                  <span className="text-[9px] text-amber-400">▶</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
