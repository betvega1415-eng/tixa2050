export interface NativeCoin {
  symbol: string;
  name: string;
  startingPrice: number;
  currentPrice: number;
  high24h: number;
  low24h: number;
  change24h: number;
  pulseCount: number;
  lastUpdate: number;
  status: 'LIVE' | 'PAUSED' | 'DISABLED';
  history: { timestamp: number; price: number; high: number; low: number; volume: number }[];
}

export interface MarketStateResponse {
  success: boolean;
  tixaCoin: NativeCoin;
  coins: Record<string, NativeCoin>;
  marketActive: boolean;
  volatilityMultiplier: number;
  totalPulses: number;
  lastPulseTime: number;
  pulsesPerSecond?: number;
  monthlyBasePrice?: number;
  monthlyGrowthUsd?: number;
  fluctuationRangeUsd?: number;
}

/**
 * BTX Coin Price Engine:
 * Base price is $0.05, fluctuating every second between $0.03 (min) and $0.09 (max).
 */
export function getBlueCoinMonthlyBasePrice(targetDate: Date = new Date()): number {
  return 0.05;
}

export class NativeMarketEngine {
  private static instance: NativeMarketEngine;
  private tixaCoin: NativeCoin = {
    symbol: 'TIXA',
    name: 'BTX',
    startingPrice: 0.05,
    currentPrice: 0.05,
    high24h: 0.09,
    low24h: 0.03,
    change24h: 0.0,
    pulseCount: 0,
    lastUpdate: Date.now(),
    status: 'LIVE',
    history: []
  };
  private coins: Record<string, NativeCoin> = {};
  private marketActive: boolean = true;
  private volatilityMultiplier: number = 1.0;
  private totalPulses: number = 0;
  private lastPulseTime: number = Date.now();
  private listeners: Set<() => void> = new Set();
  private pollInterval: any = null;
  private highFreqInterval: any = null;

  private constructor() {
    this.initEngines();
  }

  public static getInstance(): NativeMarketEngine {
    if (!NativeMarketEngine.instance) {
      NativeMarketEngine.instance = new NativeMarketEngine();
    }
    return NativeMarketEngine.instance;
  }

  private initEngines() {
    // 1. Initial server fetch
    this.fetchMarketState();

    if (typeof window !== 'undefined') {
      // 2. 1-second interval loop (fluctuates between $0.03 and $0.09, anchoring at $0.05)
      this.highFreqInterval = setInterval(() => {
        if (!this.marketActive) return;

        this.totalPulses++;
        const basePrice = 0.05;
        this.tixaCoin.startingPrice = basePrice;

        const minBound = 0.03;
        const maxBound = 0.09;

        // Dynamic swing per second
        const swingStep = (Math.random() - 0.495) * 0.012 * this.volatilityMultiplier;
        let newPrice = this.tixaCoin.currentPrice + swingStep;

        if (newPrice > maxBound) {
          newPrice = maxBound - (Math.random() * 0.005);
        } else if (newPrice < minBound) {
          newPrice = minBound + (Math.random() * 0.005);
        }

        this.tixaCoin.currentPrice = Number(newPrice.toFixed(4));
        this.tixaCoin.high24h = Math.max(this.tixaCoin.high24h, this.tixaCoin.currentPrice);
        this.tixaCoin.low24h = Math.min(this.tixaCoin.low24h, this.tixaCoin.currentPrice);
        this.tixaCoin.change24h = Number((((this.tixaCoin.currentPrice - basePrice) / basePrice) * 100).toFixed(2));
        this.tixaCoin.pulseCount++;
        this.tixaCoin.lastUpdate = Date.now();

        this.notifyListeners();
      }, 1000);

      // 3. Periodic synchronization with server state (every 1200ms)
      this.pollInterval = setInterval(() => {
        this.fetchMarketState();
      }, 1200);
    }
  }

  public getMonthlyBasePrice(): number {
    return getBlueCoinMonthlyBasePrice();
  }

  public getFluctuationRange(): number {
    return 5000;
  }

  public getPulsesPerSecond(): number {
    return 33;
  }

  public async fetchMarketState(): Promise<MarketStateResponse | null> {
    try {
      const res = await fetch('/api/market/state');
      if (!res.ok) return null;
      const data: MarketStateResponse = await res.json();
      if (data && data.success) {
        this.tixaCoin = data.tixaCoin || this.tixaCoin;
        this.coins = data.coins || this.coins;
        this.marketActive = data.marketActive ?? this.marketActive;
        this.volatilityMultiplier = data.volatilityMultiplier ?? this.volatilityMultiplier;
        this.totalPulses = data.totalPulses ?? this.totalPulses;
        this.lastPulseTime = data.lastPulseTime ?? this.lastPulseTime;
        this.notifyListeners();
        return data;
      }
    } catch (err) {
      // Silently fall back to local computation without throwing or logging error
    }
    return null;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(fn => {
      try {
        fn();
      } catch (e) {
        console.error(e);
      }
    });
  }

  public getTixaCoin(): NativeCoin {
    return this.tixaCoin;
  }

  public getCoins(): Record<string, NativeCoin> {
    return this.coins;
  }

  public getCoinList(): NativeCoin[] {
    return Object.values(this.coins);
  }

  public getCoin(symbol: string): NativeCoin | undefined {
    const clean = symbol.toUpperCase();
    if (clean === 'TIXA') return this.tixaCoin;
    return this.coins[clean];
  }

  public isMarketActive(): boolean {
    return this.marketActive;
  }

  public getTotalPulses(): number {
    return this.totalPulses;
  }

  public async fetchHistory(symbol: string): Promise<{ timestamp: number; price: number; high: number; low: number; volume: number }[]> {
    try {
      const res = await fetch(`/api/market/history/${symbol}`);
      if (!res.ok) return [];
      const data = await res.json();
      if (data && data.success) {
        return data.history || [];
      }
    } catch (err) {
      console.error(err);
    }
    return [];
  }

  public async adminControl(action: string, payload?: { symbol?: string; startingPrice?: number; volatility?: number }) {
    try {
      const res = await fetch('/api/market/admin/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...payload })
      });
      const data = await res.json();
      if (data && data.success) {
        this.marketActive = data.marketActive;
        this.volatilityMultiplier = data.volatilityMultiplier;
        this.tixaCoin = data.tixaCoin;
        this.coins = data.coins;
        this.notifyListeners();
      }
      return data;
    } catch (err) {
      console.error(err);
      return { success: false, error: String(err) };
    }
  }
}

export const nativeMarketEngine = NativeMarketEngine.getInstance();
