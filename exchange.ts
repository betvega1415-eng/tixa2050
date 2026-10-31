export type OrderType = 'LIMIT' | 'MARKET';
export type OrderSide = 'BUY' | 'SELL';
export type OrderStatus = 'OPEN' | 'PARTIALLY_FILLED' | 'FILLED' | 'CANCELLED';

export interface MarketPair {
  id: string;
  name: string;
  baseSymbol: string;
  quoteSymbol: string;
  category: 'L1' | 'DeFi' | 'AI' | 'Meme' | 'Stable' | 'Major';
  baseTokenAddress?: string;
  lastPrice: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  volumeQuote24h: number;
  priceDecimals: number;
  amountDecimals: number;
  minOrderSize: number;
  sparkline: number[];
  lastTickDelta?: number;
}

export interface RealtimeTick {
  timestamp: number;
  timeLabel: string;
  price: number;
  delta: number;
  high: number;
  low: number;
  volume: number;
}

export interface Order {
  id: string;
  pairId: string;
  side: OrderSide;
  type: OrderType;
  price: number;
  amount: number;
  filledAmount: number;
  remainingAmount: number;
  total: number;
  traderAddress: string;
  status: OrderStatus;
  timestamp: number;
  txHash?: string;
}

export interface Trade {
  id: string;
  pairId: string;
  price: number;
  amount: number;
  side: OrderSide;
  makerOrderId: string;
  takerOrderId: string;
  timestamp: number;
  txHash: string;
}

export interface OrderBookLevel {
  price: number;
  amount: number;
  total: number;
  depthPercentage: number;
}

export interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
