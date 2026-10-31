import { MarketPair, Order, Trade, OrderBookLevel, Candle, OrderSide, OrderType, RealtimeTick } from '../types/exchange';
import { blockchainEngine } from './blockchainEngine';

const STORAGE_ORDERS_KEY = 'tixa_exchange_orders_v2';
const STORAGE_TRADES_KEY = 'tixa_exchange_trades_v2';

export interface PortfolioDataPoint {
  timestamp: number;
  timeLabel: string;
  totalValueUsd: number;
  tixaHoldingUsd: number;
  tokensValueUsd: number;
  stakedValueUsd: number;
  pnlPercentage: number;
}

export class ExchangeEngine {
  private static instance: ExchangeEngine;

  // Base TIXA price = 990,000.00 USDT
  private baseTixaPrice = 990000;
  private currentTixaPrice = 990000;
  private lastTickDelta = 0;
  private realtimeTicks: RealtimeTick[] = [];
  private cycleCountdown = 60; // 60s countdown for 1-minute market cycle

  // Core Market Pairs (USDT, txUSD, NISI, SARA, MUN)
  private pairs: MarketPair[] = [
    {
      id: 'TIXA_USDT',
      name: 'TIXA / Tether USD',
      baseSymbol: 'TIXA',
      quoteSymbol: 'USDT',
      category: 'Major',
      lastPrice: 990000,
      change24h: 12.45,
      high24h: 1045000,
      low24h: 942000,
      volume24h: 148500000,
      volumeQuote24h: 147015000000,
      priceDecimals: 2,
      amountDecimals: 4,
      minOrderSize: 0.0001,
      sparkline: [950000, 962000, 948000, 975000, 982000, 970000, 990000]
    },
    {
      id: 'TIXA_txUSD',
      name: 'TIXA / Synthetic txUSD',
      baseSymbol: 'TIXA',
      quoteSymbol: 'txUSD',
      category: 'Stable',
      lastPrice: 990000,
      change24h: 12.18,
      high24h: 1042000,
      low24h: 940000,
      volume24h: 62400000,
      volumeQuote24h: 61776000000,
      priceDecimals: 2,
      amountDecimals: 4,
      minOrderSize: 0.0001,
      sparkline: [948000, 955000, 962000, 970000, 978000, 984000, 990000]
    },
    {
      id: 'TIXA_NISI',
      name: 'TIXA / NISI',
      baseSymbol: 'TIXA',
      quoteSymbol: 'NISI',
      category: 'Major',
      lastPrice: 15.4012,
      change24h: 8.65,
      high24h: 16.2570,
      low24h: 14.6545,
      volume24h: 42000,
      volumeQuote24h: 646850,
      priceDecimals: 4,
      amountDecimals: 4,
      minOrderSize: 0.001,
      sparkline: [14.8, 15.0, 14.9, 15.2, 15.3, 15.35, 15.4012]
    },
    {
      id: 'TIXA_SARA',
      name: 'TIXA / SARA',
      baseSymbol: 'TIXA',
      quoteSymbol: 'SARA',
      category: 'Major',
      lastPrice: 366.67,
      change24h: 9.40,
      high24h: 385.00,
      low24h: 345.20,
      volume24h: 152000,
      volumeQuote24h: 55733840,
      priceDecimals: 2,
      amountDecimals: 3,
      minOrderSize: 0.005,
      sparkline: [350, 354, 352, 359, 362, 364, 366.67]
    },
    {
      id: 'TIXA_MUN',
      name: 'TIXA / MUN',
      baseSymbol: 'TIXA',
      quoteSymbol: 'MUN',
      category: 'L1',
      lastPrice: 5210.50,
      change24h: 14.20,
      high24h: 5480.00,
      low24h: 4900.00,
      volume24h: 84000,
      volumeQuote24h: 437682000,
      priceDecimals: 2,
      amountDecimals: 2,
      minOrderSize: 0.01,
      sparkline: [4950, 5020, 5080, 5120, 5170, 5190, 5210.5]
    }
  ];

  private orders: Order[] = [];
  private trades: Trade[] = [];
  private candles: Record<string, Candle[]> = {};
  private listeners: Array<() => void> = [];
  private pulseInterval: any = null;
  private minuteCycleInterval: any = null;

  private constructor() {
    this.initializeExchange();
    this.seedRealtimeTicks();
    this.startPricePulseEngine();
  }

  public static getInstance(): ExchangeEngine {
    if (!ExchangeEngine.instance) {
      ExchangeEngine.instance = new ExchangeEngine();
    }
    return ExchangeEngine.instance;
  }

  public subscribe(callback: () => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notify(): void {
    this.listeners.forEach(cb => {
      try { cb(); } catch (err) { console.error('Exchange listener err', err); }
    });
  }

  private initializeExchange(): void {
    try {
      const storedOrders = localStorage.getItem(STORAGE_ORDERS_KEY);
      const storedTrades = localStorage.getItem(STORAGE_TRADES_KEY);
      if (storedOrders) this.orders = JSON.parse(storedOrders);
      if (storedTrades) this.trades = JSON.parse(storedTrades);
    } catch {
      // Ignore
    }

    // Seed historical candles for core pairs
    for (const pair of this.pairs) {
      this.candles[pair.id] = this.generateHistoricalCandles(pair.lastPrice, 40);
    }
  }

  private seedRealtimeTicks(): void {
    const now = Date.now();
    let p = this.baseTixaPrice - 4500;
    for (let i = 40; i >= 0; i--) {
      const t = now - (i * 1000);
      const delta = (Math.random() - 0.495) * 8000;
      p = Math.max(900000, p + delta);
      const date = new Date(t);
      const timeLabel = date.toTimeString().split(' ')[0];
      this.realtimeTicks.push({
        timestamp: t,
        timeLabel,
        price: Number(p.toFixed(2)),
        delta: Number(delta.toFixed(2)),
        high: Number((p + Math.random() * 2500).toFixed(2)),
        low: Number((p - Math.random() * 2500).toFixed(2)),
        volume: Math.floor(Math.random() * 45 + 10)
      });
    }
    this.currentTixaPrice = p;
  }

  private generateHistoricalCandles(basePrice: number, count: number): Candle[] {
    const candles: Candle[] = [];
    const now = Date.now();
    const intervalMs = 15 * 60 * 1000; // 15m intervals
    let price = basePrice * 0.94;

    for (let i = count; i >= 0; i--) {
      const time = now - (i * intervalMs);
      const change = (Math.random() - 0.48) * (basePrice * 0.02);
      const open = price;
      const close = Math.max(0.01, open + change);
      const high = Math.max(open, close) + Math.random() * (basePrice * 0.012);
      const low = Math.min(open, close) - Math.random() * (basePrice * 0.012);
      const volume = Math.floor(Math.random() * 25000) + 5000;

      candles.push({
        timestamp: time,
        open,
        high,
        low: Math.max(0.001, low),
        close,
        volume
      });
      price = close;
    }
    return candles;
  }

  // Real-time 1-Second Price Pulse & Market Cycle Shift
  private startPricePulseEngine(): void {
    if (this.pulseInterval) clearInterval(this.pulseInterval);
    if (this.minuteCycleInterval) clearInterval(this.minuteCycleInterval);

    // 1-Second TIXA Price Pulse (Fluctuates by ±$10,000 / sec)
    this.pulseInterval = setInterval(() => {
      const meanReversion = (this.baseTixaPrice - this.currentTixaPrice) * 0.08;
      const randomShock = (Math.random() - 0.495) * 10000;
      const delta = randomShock + meanReversion;
      
      const newPrice = Number((this.currentTixaPrice + delta).toFixed(2));
      this.lastTickDelta = delta;
      this.currentTixaPrice = newPrice;

      // Update TIXA/USDT and TIXA/txUSD market records
      const tixaUsdt = this.pairs.find(p => p.id === 'TIXA_USDT');
      if (tixaUsdt) {
        tixaUsdt.lastPrice = newPrice;
        tixaUsdt.lastTickDelta = delta;
        tixaUsdt.high24h = Math.max(tixaUsdt.high24h, newPrice);
        tixaUsdt.low24h = Math.min(tixaUsdt.low24h, newPrice);
        tixaUsdt.sparkline = [...tixaUsdt.sparkline.slice(-6), newPrice];
      }

      const tixaTxUsd = this.pairs.find(p => p.id === 'TIXA_txUSD');
      if (tixaTxUsd) {
        tixaTxUsd.lastPrice = newPrice;
        tixaTxUsd.lastTickDelta = delta;
      }

      // Add to realtime tick buffer (keep last 60 ticks)
      const now = Date.now();
      const date = new Date(now);
      const timeLabel = date.toTimeString().split(' ')[0];
      this.realtimeTicks.push({
        timestamp: now,
        timeLabel,
        price: newPrice,
        delta: Number(delta.toFixed(2)),
        high: Number((newPrice + Math.random() * 2000).toFixed(2)),
        low: Number((newPrice - Math.random() * 2000).toFixed(2)),
        volume: Math.floor(Math.random() * 35 + 8)
      });
      if (this.realtimeTicks.length > 60) {
        this.realtimeTicks.shift();
      }

      // Decrement cycle countdown
      this.cycleCountdown -= 1;
      if (this.cycleCountdown <= 0) {
        this.cycleCountdown = 60;
        this.triggerMarketCycle();
      }

      // Random trade creation for TIXA_USDT
      if (Math.random() > 0.35) {
        const side: OrderSide = delta >= 0 ? 'BUY' : 'SELL';
        const tradeAmount = Number((Math.random() * 2.5 + 0.1).toFixed(4));
        this.trades.unshift({
          id: `trade_${now}_${Math.random().toString(36).slice(2, 6)}`,
          pairId: 'TIXA_USDT',
          price: newPrice,
          amount: tradeAmount,
          side,
          makerOrderId: 'order_market_maker',
          takerOrderId: 'order_taker',
          timestamp: now,
          txHash: `0xtrade_${Math.random().toString(36).slice(2, 10)}`
        });
        if (this.trades.length > 80) this.trades.pop();
      }

      if (tixaUsdt) this.matchOpenOrders(tixaUsdt);
      this.notify();
    }, 1000);
  }

  public triggerMarketCycle(): void {
    for (const pair of this.pairs) {
      if (pair.id === 'TIXA_USDT' || pair.id === 'TIXA_txUSD') continue;

      const deltaPercent = (Math.random() - 0.48) * 0.025;
      const newPrice = Number((pair.lastPrice * (1 + deltaPercent)).toFixed(pair.priceDecimals));

      if (newPrice > 0) {
        pair.lastPrice = newPrice;
        pair.lastTickDelta = deltaPercent * 100;
        pair.high24h = Math.max(pair.high24h, newPrice);
        pair.low24h = Math.min(pair.low24h, newPrice);
        pair.volume24h += Math.floor(Math.random() * 1200 + 100);
        pair.change24h = Number((pair.change24h + (deltaPercent * 50)).toFixed(2));
        pair.sparkline = [...pair.sparkline.slice(-6), newPrice];

        const pairCandles = this.candles[pair.id];
        if (pairCandles && pairCandles.length > 0) {
          const lastCandle = pairCandles[pairCandles.length - 1];
          lastCandle.close = newPrice;
          lastCandle.high = Math.max(lastCandle.high, newPrice);
          lastCandle.low = Math.min(lastCandle.low, newPrice);
          lastCandle.volume += 80;
        }
      }
    }
    this.notify();
  }

  private matchOpenOrders(pair: MarketPair): void {
    const openOrders = this.orders.filter(o => o.pairId === pair.id && o.status === 'OPEN');
    for (const order of openOrders) {
      if (order.side === 'BUY' && pair.lastPrice <= order.price) {
        order.status = 'FILLED';
        order.filledAmount = order.amount;
        order.remainingAmount = 0;
        this.settleFilledOrder(order, pair);
      } else if (order.side === 'SELL' && pair.lastPrice >= order.price) {
        order.status = 'FILLED';
        order.filledAmount = order.amount;
        order.remainingAmount = 0;
        this.settleFilledOrder(order, pair);
      }
    }
  }

  private settleFilledOrder(order: Order, pair: MarketPair): void {
    const userAcc = blockchainEngine.getOrCreateAccount(order.traderAddress);
    if (order.side === 'BUY') {
      userAcc.balance += order.amount;
    } else {
      userAcc.balance = Math.max(0, userAcc.balance);
    }
    this.saveOrders();
  }

  public async placeOrder(params: {
    pairId: string;
    side: OrderSide;
    type: OrderType;
    price: number;
    amount: number;
    traderAddress: string;
  }): Promise<Order> {
    const pair = this.pairs.find(p => p.id === params.pairId);
    if (!pair) throw new Error('Invalid market pair');

    const totalCost = params.type === 'MARKET' ? pair.lastPrice * params.amount : params.price * params.amount;
    const traderAcc = blockchainEngine.getOrCreateAccount(params.traderAddress);

    if (traderAcc.isFrozen) {
      throw new Error('Account is frozen. Trading operations restricted.');
    }

    const orderId = `ord_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const effectivePrice = params.type === 'MARKET' ? pair.lastPrice : params.price;

    const newOrder: Order = {
      id: orderId,
      pairId: params.pairId,
      side: params.side,
      type: params.type,
      price: effectivePrice,
      amount: params.amount,
      filledAmount: params.type === 'MARKET' ? params.amount : 0,
      remainingAmount: params.type === 'MARKET' ? 0 : params.amount,
      total: totalCost,
      traderAddress: params.traderAddress,
      status: params.type === 'MARKET' ? 'FILLED' : 'OPEN',
      timestamp: Date.now(),
      txHash: `0xorder_${orderId}`
    };

    this.orders.unshift(newOrder);

    if (newOrder.status === 'FILLED') {
      this.trades.unshift({
        id: `trade_${Date.now()}_${orderId}`,
        pairId: params.pairId,
        price: effectivePrice,
        amount: params.amount,
        side: params.side,
        makerOrderId: 'market_pool',
        takerOrderId: orderId,
        timestamp: Date.now(),
        txHash: newOrder.txHash!
      });
      this.settleFilledOrder(newOrder, pair);
    }

    this.saveOrders();
    this.notify();
    return newOrder;
  }

  public cancelOrder(orderId: string, traderAddress: string): void {
    const order = this.orders.find(o => o.id === orderId && o.traderAddress === traderAddress);
    if (!order) throw new Error('Order not found');
    if (order.status !== 'OPEN') throw new Error('Only open orders can be cancelled');

    order.status = 'CANCELLED';
    this.saveOrders();
    this.notify();
  }

  public getOrderBook(pairId: string): { bids: OrderBookLevel[]; asks: OrderBookLevel[] } {
    const pair = this.pairs.find(p => p.id === pairId) || this.pairs[0];
    const currentPrice = pair.lastPrice;

    const bids: OrderBookLevel[] = [];
    const asks: OrderBookLevel[] = [];

    let cumBidTotal = 0;
    let cumAskTotal = 0;

    for (let i = 1; i <= 9; i++) {
      const p = Number((currentPrice * (1 - (i * 0.0025))).toFixed(pair.priceDecimals));
      const amt = Number((Math.sin(i * 1.5) * 1.5 + 2.5 + (i * 0.4)).toFixed(4));
      cumBidTotal += amt;
      bids.push({
        price: p,
        amount: amt,
        total: Number(cumBidTotal.toFixed(4)),
        depthPercentage: Math.min(100, Math.round((cumBidTotal / 35) * 100))
      });
    }

    for (let i = 1; i <= 9; i++) {
      const p = Number((currentPrice * (1 + (i * 0.0025))).toFixed(pair.priceDecimals));
      const amt = Number((Math.cos(i * 1.5) * 1.4 + 2.2 + (i * 0.35)).toFixed(4));
      cumAskTotal += amt;
      asks.push({
        price: p,
        amount: amt,
        total: Number(cumAskTotal.toFixed(4)),
        depthPercentage: Math.min(100, Math.round((cumAskTotal / 35) * 100))
      });
    }

    return { bids, asks: asks.reverse() };
  }

  public getPortfolioHistory(tixaBalance: number = 25.5): PortfolioDataPoint[] {
    const history: PortfolioDataPoint[] = [];
    const now = Date.now();
    const points = 24;
    const currentRate = this.currentTixaPrice;

    for (let i = points; i >= 0; i--) {
      const time = now - (i * 3600 * 1000);
      const hour = new Date(time).getHours().toString().padStart(2, '0') + ':00';
      const factor = 0.92 + (0.08 * (1 - i / points)) + ((Math.sin(i * 0.6) * 0.02));
      const histTixaPrice = currentRate * factor;
      const tixaVal = tixaBalance * histTixaPrice;
      const tokensVal = 185000 + (Math.sin(i) * 12000);
      const stakedVal = 10.0 * histTixaPrice;
      const total = tixaVal + tokensVal + stakedVal;

      history.push({
        timestamp: time,
        timeLabel: hour,
        totalValueUsd: Number(total.toFixed(2)),
        tixaHoldingUsd: Number(tixaVal.toFixed(2)),
        tokensValueUsd: Number(tokensVal.toFixed(2)),
        stakedValueUsd: Number(stakedVal.toFixed(2)),
        pnlPercentage: Number(((total / (tixaBalance * 920000 + 170000) - 1) * 100).toFixed(2))
      });
    }
    return history;
  }

  public getRealtimeTicks(): RealtimeTick[] {
    return [...this.realtimeTicks];
  }

  public getTixaPrice(): number {
    return this.currentTixaPrice;
  }

  public getCurrentTixaPrice(): number {
    return this.currentTixaPrice;
  }

  public getLastTickDelta(): number {
    return this.lastTickDelta;
  }

  public getCycleCountdown(): number {
    return this.cycleCountdown;
  }

  public getPairs(): MarketPair[] {
    return [...this.pairs];
  }

  public getPair(pairId: string): MarketPair | undefined {
    return this.pairs.find(p => p.id === pairId);
  }

  public getCandles(pairId: string): Candle[] {
    return this.candles[pairId] || [];
  }

  public getRecentTrades(pairId: string): Trade[] {
    return this.trades.filter(t => t.pairId === pairId).slice(0, 30);
  }

  public getUserOrders(traderAddress: string): Order[] {
    return this.orders.filter(o => o.traderAddress === traderAddress);
  }

  private saveOrders(): void {
    try {
      localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(this.orders.slice(0, 100)));
      localStorage.setItem(STORAGE_TRADES_KEY, JSON.stringify(this.trades.slice(0, 100)));
    } catch (e) {
      console.warn('Storage save failed for exchange', e);
    }
  }
}

export const exchangeEngine = ExchangeEngine.getInstance();
