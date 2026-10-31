import { COUNTRIES, CountryInfo } from '../data/countries';

export interface GlobalTradeEvent {
  id: string;
  timestamp: number;
  symbol: string;
  coinName: string;
  userEmail: string;
  countryCode: string;
  countryName: string;
  countryFlag: string;
  direction: 'CALL' | 'PUT';
  amount: number;
  result: 'WIN' | 'LOSS';
  payoutRate: number; // e.g. 0.88 (+88%)
  profitOrLoss: number; // positive for win, negative for loss
  duration: string;
  executionPrice: number;
  isVipBoxWin?: boolean;
}

export interface CoinLiveTradingStats {
  activeTradersCount: number;
  liveWinRate: number;
  totalVolume24h: number;
  recentBiggestWin: {
    amount: number;
    userEmail: string;
    countryFlag: string;
    profit: number;
  };
  tradesWonCount: number;
  tradesLostCount: number;
}

// Curated list of prominent trading countries from global registry
const ACTIVE_TRADING_COUNTRIES = [
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬' }
];

const USER_NAME_PREFIXES = [
  'tariq', 'alex', 'betvega', 'hasan', 'john', 'emma', 'satox', 'yuki', 
  'mateo', 'ahmed', 'rahul', 'kim', 'sophie', 'chen', 'liam', 'fatih',
  'lucas', 'daniel', 'karim', 'elena', 'victor', 'tanvir', 'marcus', 'oliver',
  'arfat', 'david', 'samir', 'chloe', 'maxim', 'kenji', 'ananya', 'gabriel'
];

const EMAIL_DOMAINS = [
  'gmail.com', 'yahoo.com', 'outlook.com', 'icloud.com', 'proton.me', 
  'mail.com', 'web.de', 'crypto.net', 'trading.org'
];

const RANDOM_TRADE_AMOUNTS = [
  50, 50, 100, 100, 100, 200, 250, 300, 500, 500, 750, 1000, 1500, 2000, 3500, 5000
];

const TRADE_DURATIONS = ['3S', '5S', '10S', '15S', '30S', '1M', '5M'];

export class GlobalTradesEngine {
  private static instance: GlobalTradesEngine;
  private coinTradesMap: Map<string, GlobalTradeEvent[]> = new Map();
  private coinStatsMap: Map<string, CoinLiveTradingStats> = new Map();
  private activeCoinSymbol: string | null = null;
  private intervalTimer: any = null;
  private listeners: Set<() => void> = new Set();

  private constructor() {
    // Idle until activated by a component view
  }

  public static getInstance(): GlobalTradesEngine {
    if (!GlobalTradesEngine.instance) {
      GlobalTradesEngine.instance = new GlobalTradesEngine();
    }
    return GlobalTradesEngine.instance;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  /**
   * Set active coin to stream trades for (e.g. when user clicks on a custom token)
   */
  public setActiveCoin(symbol: string, coinName: string, currentPrice: number) {
    this.activeCoinSymbol = symbol;

    // Seed initial batch of trades if empty
    if (!this.coinTradesMap.has(symbol) || this.coinTradesMap.get(symbol)!.length === 0) {
      this.seedInitialTrades(symbol, coinName, currentPrice);
    }

    this.startStreaming(symbol, coinName, currentPrice);
    this.notify();
  }

  public clearActiveCoin() {
    this.activeCoinSymbol = null;
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
  }

  private startStreaming(symbol: string, coinName: string, currentPrice: number) {
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }

    // Stream 1 trade every 950ms (~1 second) as requested: "প্রতি সেকেন্ডে এ আপডেট হচ্ছে এরকম live show হবে"
    this.intervalTimer = setInterval(() => {
      if (!this.activeCoinSymbol || this.activeCoinSymbol !== symbol) return;
      this.generateLiveTrade(symbol, coinName, currentPrice);
      this.notify();
    }, 950);
  }

  private tradeCount = 0;

  private generateLiveTrade(symbol: string, coinName: string, currentPrice: number): GlobalTradeEvent {
    this.tradeCount++;
    // Ensure roughly 1 in every 10-12 traders is from Bangladesh (BD)
    const isBangladesh = (this.tradeCount % 11 === 0) || (Math.random() < 0.12);
    const country = isBangladesh 
      ? { code: 'BD', name: 'Bangladesh', flag: '🇧🇩' }
      : ACTIVE_TRADING_COUNTRIES.filter(c => c.code !== 'BD')[Math.floor(Math.random() * (ACTIVE_TRADING_COUNTRIES.length - 1))];

    const prefix = isBangladesh 
      ? ['tariq', 'hasan', 'rakib', 'shakil', 'joy', 'tanvir', 'arfat', 'samir'][Math.floor(Math.random() * 8)]
      : USER_NAME_PREFIXES[Math.floor(Math.random() * USER_NAME_PREFIXES.length)];

    const domain = EMAIL_DOMAINS[Math.floor(Math.random() * EMAIL_DOMAINS.length)];
    const randomDigits = Math.floor(10 + Math.random() * 89);
    
    const maskedPrefix = prefix.length > 3 
      ? prefix.slice(0, 3) + '***' + prefix.slice(-2) 
      : prefix + '***' + randomDigits;
    const userEmail = `${maskedPrefix}@${domain}`;

    const amount = RANDOM_TRADE_AMOUNTS[Math.floor(Math.random() * RANDOM_TRADE_AMOUNTS.length)];
    const direction: 'CALL' | 'PUT' = Math.random() > 0.48 ? 'CALL' : 'PUT';
    
    // 64% win probability
    const isWin = Math.random() < 0.64;
    const result: 'WIN' | 'LOSS' = isWin ? 'WIN' : 'LOSS';
    const payoutRate = 0.85 + Number((Math.random() * 0.12).toFixed(2));
    
    // VIP Box Win bonus (20% of wins get a VIP Box win bonus)
    const isVipBoxWin = isWin && (Math.random() < 0.22);
    let baseProfit = isWin ? Number((amount * payoutRate).toFixed(2)) : -amount;
    if (isVipBoxWin) {
      baseProfit += Number((amount * (1.2 + Math.random() * 2.5)).toFixed(2)); // Extra VIP box reward
    }

    const duration = TRADE_DURATIONS[Math.floor(Math.random() * TRADE_DURATIONS.length)];

    const trade: GlobalTradeEvent = {
      id: `trade_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: Date.now(),
      symbol,
      coinName,
      userEmail,
      countryCode: country.code,
      countryName: country.name,
      countryFlag: country.flag,
      direction,
      amount,
      result,
      payoutRate,
      profitOrLoss: baseProfit,
      duration,
      executionPrice: currentPrice,
      isVipBoxWin
    };

    const existing = this.coinTradesMap.get(symbol) || [];
    const updated = [trade, ...existing].slice(0, 40);
    this.coinTradesMap.set(symbol, updated);

    this.updateStats(symbol, trade);

    return trade;
  }

  private seedInitialTrades(symbol: string, coinName: string, currentPrice: number) {
    const list: GlobalTradeEvent[] = [];
    const now = Date.now();
    for (let i = 0; i < 15; i++) {
      const country = ACTIVE_TRADING_COUNTRIES[Math.floor(Math.random() * ACTIVE_TRADING_COUNTRIES.length)];
      const prefix = USER_NAME_PREFIXES[Math.floor(Math.random() * USER_NAME_PREFIXES.length)];
      const domain = EMAIL_DOMAINS[Math.floor(Math.random() * EMAIL_DOMAINS.length)];
      const randomDigits = Math.floor(10 + Math.random() * 89);
      const userEmail = `${prefix.slice(0, 3)}***${randomDigits}@${domain}`;
      const amount = RANDOM_TRADE_AMOUNTS[Math.floor(Math.random() * RANDOM_TRADE_AMOUNTS.length)];
      const direction: 'CALL' | 'PUT' = Math.random() > 0.5 ? 'CALL' : 'PUT';
      const isWin = Math.random() < 0.63;
      const result: 'WIN' | 'LOSS' = isWin ? 'WIN' : 'LOSS';
      const payoutRate = 0.88;
      const profitOrLoss = isWin ? Number((amount * payoutRate).toFixed(2)) : -amount;
      const duration = TRADE_DURATIONS[Math.floor(Math.random() * TRADE_DURATIONS.length)];

      list.push({
        id: `seed_${i}_${symbol}`,
        timestamp: now - (i * 1800),
        symbol,
        coinName,
        userEmail,
        countryCode: country.code,
        countryName: country.name,
        countryFlag: country.flag,
        direction,
        amount,
        result,
        payoutRate,
        profitOrLoss,
        duration,
        executionPrice: currentPrice
      });
    }

    this.coinTradesMap.set(symbol, list);

    this.coinStatsMap.set(symbol, {
      activeTradersCount: Math.floor(1800 + Math.random() * 2400),
      liveWinRate: 64.2,
      totalVolume24h: Math.floor(150000 + Math.random() * 800000),
      recentBiggestWin: {
        amount: 5000,
        userEmail: 'bet***15@gmail.com',
        countryFlag: '🇧🇩',
        profit: 4600.00
      },
      tradesWonCount: 9,
      tradesLostCount: 6
    });
  }

  private updateStats(symbol: string, latestTrade: GlobalTradeEvent) {
    let stats = this.coinStatsMap.get(symbol);
    if (!stats) {
      stats = {
        activeTradersCount: 2450,
        liveWinRate: 63.5,
        totalVolume24h: 350000,
        recentBiggestWin: {
          amount: 1000,
          userEmail: 'tari***bd@gmail.com',
          countryFlag: '🇧🇩',
          profit: 880.00
        },
        tradesWonCount: 1,
        tradesLostCount: 0
      };
    }

    stats.totalVolume24h += latestTrade.amount;
    // Slight jitter in active traders count
    stats.activeTradersCount += Math.floor(Math.random() * 5) - 2;
    if (stats.activeTradersCount < 1200) stats.activeTradersCount = 1200;

    if (latestTrade.result === 'WIN') {
      stats.tradesWonCount++;
      if (latestTrade.profitOrLoss > stats.recentBiggestWin.profit) {
        stats.recentBiggestWin = {
          amount: latestTrade.amount,
          userEmail: latestTrade.userEmail,
          countryFlag: latestTrade.countryFlag,
          profit: latestTrade.profitOrLoss
        };
      }
    } else {
      stats.tradesLostCount++;
    }

    const total = stats.tradesWonCount + stats.tradesLostCount;
    if (total > 0) {
      stats.liveWinRate = Number(((stats.tradesWonCount / total) * 100).toFixed(1));
    }

    this.coinStatsMap.set(symbol, stats);
  }

  public getTrades(symbol: string): GlobalTradeEvent[] {
    return this.coinTradesMap.get(symbol) || [];
  }

  public getStats(symbol: string): CoinLiveTradingStats {
    return this.coinStatsMap.get(symbol) || {
      activeTradersCount: 2180,
      liveWinRate: 63.8,
      totalVolume24h: 420000,
      recentBiggestWin: {
        amount: 5000,
        userEmail: 'bet***15@gmail.com',
        countryFlag: '🇧🇩',
        profit: 4600.00
      },
      tradesWonCount: 15,
      tradesLostCount: 9
    };
  }
}

export const globalTradesEngine = GlobalTradesEngine.getInstance();
