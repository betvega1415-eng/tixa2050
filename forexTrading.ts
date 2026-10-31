export type AccountMode = 'DEMO' | 'REAL';

export type TradeDirection = 'CALL' | 'PUT'; // CALL = BUY (Price goes UP), PUT = SELL (Price goes DOWN)

export type TradeDuration = '3S' | '5S' | '10S' | '15S' | '30S' | '1M' | '5M' | '15M' | '30M' | '1H';

export type TradeResult = 'PENDING' | 'WON' | 'LOST' | 'TIE';

export interface ForexCandle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ForexPair {
  id: string;
  name: string;
  base: string;
  quote: string;
  type: 'CRYPTO' | 'FOREX' | 'SYNTHETIC';
  currentPrice: number;
  change24h: number;
  high24h: number;
  low24h: number;
  payoutRate: number; // e.g. 0.88 = 88% return
  priceDecimals: number;
  spread: number;
  volume24h: number;
}

export interface ActiveTrade {
  id: string;
  pairId: string;
  pairName: string;
  accountMode: AccountMode;
  direction: TradeDirection;
  amount: number;
  entryPrice: number;
  currentPrice: number;
  duration: TradeDuration;
  durationSeconds: number;
  startTime: number;
  expiryTime: number;
  payoutRate: number;
  potentialProfit: number;
  status: TradeResult;
  traderAddress: string;
  txHash?: string;
}

export interface SettledTrade {
  id: string;
  pairId: string;
  pairName: string;
  accountMode: AccountMode;
  direction: TradeDirection;
  amount: number;
  entryPrice: number;
  exitPrice: number;
  duration: TradeDuration;
  durationSeconds: number;
  startTime: number;
  settledTime: number;
  payoutRate: number;
  pnl: number;
  payout: number;
  result: TradeResult;
  traderAddress: string;
  txHash?: string;
}

export type TimeframeId = '1s' | '5s' | '15s' | '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
