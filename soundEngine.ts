// TIXA Next-Gen Modern Audio Synthesizer Engine
// High-tech, futuristic UI sound synthesis using native Web Audio API (Zero external assets, 0ms latency)

export type SoundEffectType = 
  | 'click' 
  | 'tap' 
  | 'tab' 
  | 'toggle' 
  | 'success' 
  | 'trade' 
  | 'deposit' 
  | 'error' 
  | 'hover';

class SoundEngine {
  private audioCtx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private masterVolume: number = 0.25; // Balanced, non-intrusive modern UI level
  private listeners: Set<() => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tixa_sound_fx_enabled');
      if (saved !== null) {
        this.soundEnabled = saved === 'true';
      } else {
        this.soundEnabled = true;
      }
      
      const savedVol = localStorage.getItem('tixa_sound_fx_vol');
      if (savedVol !== null) {
        this.masterVolume = parseFloat(savedVol) || 0.25;
      }
    }
  }

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }

    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }

    return this.audioCtx;
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  public setEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('tixa_sound_fx_enabled', enabled ? 'true' : 'false');
    }
    this.notify();
    if (enabled) {
      this.play('toggle');
    }
  }

  public toggle(): boolean {
    const newState = !this.soundEnabled;
    this.setEnabled(newState);
    return newState;
  }

  public getVolume(): number {
    return this.masterVolume;
  }

  public setVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    if (typeof window !== 'undefined') {
      localStorage.setItem('tixa_sound_fx_vol', this.masterVolume.toString());
    }
    this.notify();
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notify() {
    this.listeners.forEach(cb => cb());
  }

  /**
   * Synthesize Modern High-Tech UI Clicks and Acoustic Feedback
   */
  public play(type: SoundEffectType = 'click') {
    if (!this.soundEnabled || typeof window === 'undefined') return;

    try {
      const ctx = this.initContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(this.masterVolume, now);
      masterGain.connect(ctx.destination);

      switch (type) {
        case 'click': {
          // Modern Haptic Glass / Crisp Tactile Click
          // Short fast high-frequency sine pulse + resonant bandpass
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(2400, now);
          filter.Q.setValueAtTime(3.5, now);

          osc.type = 'sine';
          osc.frequency.setValueAtTime(1600, now);
          osc.frequency.exponentialRampToValueAtTime(320, now + 0.038);

          gain.gain.setValueAtTime(0.7, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.038);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(masterGain);

          osc.start(now);
          osc.stop(now + 0.04);
          break;
        }

        case 'tap': {
          // Soft tactile tap (for secondary items)
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(650, now);
          osc.frequency.exponentialRampToValueAtTime(140, now + 0.025);

          gain.gain.setValueAtTime(0.4, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(now);
          osc.stop(now + 0.03);
          break;
        }

        case 'tab': {
          // Futuristic Tab Switch (dual chirp sweep)
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(580, now);
          osc.frequency.exponentialRampToValueAtTime(1180, now + 0.05);

          gain.gain.setValueAtTime(0.35, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(now);
          osc.stop(now + 0.06);
          break;
        }

        case 'toggle': {
          // Clean futuristic switch tick
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();

          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(880, now);
          osc1.frequency.exponentialRampToValueAtTime(1450, now + 0.04);

          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(440, now);
          osc2.frequency.exponentialRampToValueAtTime(880, now + 0.04);

          gain.gain.setValueAtTime(0.4, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(masterGain);

          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + 0.05);
          osc2.stop(now + 0.05);
          break;
        }

        case 'success': {
          // Harmonious Modern Crystal Chime (C6 - E6 - G6 ascending)
          const freqs = [1046.50, 1318.51, 1567.98];
          freqs.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const noteStart = now + (idx * 0.045);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, noteStart);

            gain.gain.setValueAtTime(0.0, now);
            gain.gain.setValueAtTime(0.3, noteStart);
            gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.22);

            osc.connect(gain);
            gain.connect(masterGain);

            osc.start(noteStart);
            osc.stop(noteStart + 0.24);
          });
          break;
        }

        case 'trade': {
          // High-tech Order Execution Sweep
          const osc = ctx.createOscillator();
          const filter = ctx.createBiquadFilter();
          const gain = ctx.createGain();

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(3000, now);
          filter.frequency.exponentialRampToValueAtTime(800, now + 0.12);

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(950, now);
          osc.frequency.exponentialRampToValueAtTime(420, now + 0.12);

          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(masterGain);

          osc.start(now);
          osc.stop(now + 0.13);
          break;
        }

        case 'deposit': {
          // Shimmering Golden Coin / Vault Inflow
          const freqs = [784, 987.77, 1174.66, 1567.98];
          freqs.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const noteStart = now + (idx * 0.035);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, noteStart);
            osc.frequency.exponentialRampToValueAtTime(freq * 1.05, noteStart + 0.15);

            gain.gain.setValueAtTime(0.0, now);
            gain.gain.setValueAtTime(0.25, noteStart);
            gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.18);

            osc.connect(gain);
            gain.connect(masterGain);

            osc.start(noteStart);
            osc.stop(noteStart + 0.2);
          });
          break;
        }

        case 'error': {
          // Low dampened caution boop
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(180, now);
          osc.frequency.setValueAtTime(130, now + 0.06);

          gain.gain.setValueAtTime(0.35, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(now);
          osc.stop(now + 0.15);
          break;
        }

        case 'hover': {
          // Ultra soft micro-tick on hover
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(2200, now);
          osc.frequency.exponentialRampToValueAtTime(1800, now + 0.012);

          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.012);

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(now);
          osc.stop(now + 0.015);
          break;
        }
      }
    } catch (e) {
      // AudioContext policy or unsupported browser safe catch
    }
  }

  private lastPlayTime: number = 0;

  /**
   * Initializes global delegated listener for buttons & interactive elements
   */
  public attachGlobalClickListener() {
    if (typeof window === 'undefined') return;

    const handler = (e: MouseEvent) => {
      try {
        const rawTarget = e.target;
        if (!rawTarget || !(rawTarget instanceof Element)) return;

        const clickable = rawTarget.closest('button, a, [role="button"], input[type="button"], input[type="submit"], .cursor-pointer, select, [tabindex="0"]');
        if (clickable) {
          const now = Date.now();
          if (now - this.lastPlayTime < 45) return; // Prevent double trigger clipping
          this.lastPlayTime = now;

          const rawSoundAttr = clickable.getAttribute('data-sound');
          if (rawSoundAttr === 'none' || rawSoundAttr === 'off') {
            return;
          }
          if (rawSoundAttr) {
            this.play(rawSoundAttr as SoundEffectType);
          } else {
            this.play('click');
          }
        }
      } catch {
        // Safe catch for detached elements or cross-origin iframes
      }
    };

    window.addEventListener('click', handler, { passive: true, capture: true });
  }
}

export const soundEngine = new SoundEngine();

// Auto-activate delegated modern click sound on client load
if (typeof window !== 'undefined') {
  soundEngine.attachGlobalClickListener();
}
