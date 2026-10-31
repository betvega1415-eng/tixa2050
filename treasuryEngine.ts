import { CompanyHolding, WorldComment, TreasurySummaryMetrics, CommentSentiment, UserTier } from '../types/treasury';
import { TOP_100_COMPANY_HOLDINGS } from '../data/companyHoldings';
import { INITIAL_WORLD_COMMENTS, WORLD_COMMENTS_STREAM_POOL } from '../data/worldComments';
import { exchangeEngine } from './exchangeEngine';

const STORAGE_COMMENTS_KEY = 'tixa_world_comments_v2';
const STORAGE_LIKES_KEY = 'tixa_user_liked_comments_v2';

export class TreasuryEngine {
  private static instance: TreasuryEngine;
  private holdings: CompanyHolding[] = [];
  private comments: WorldComment[] = [];
  private userLikedIds: Set<string> = new Set();
  private subscribers: Array<() => void> = [];
  private streamInterval: any = null;
  private tickInterval: any = null;
  private poolIndex = 0;

  private constructor() {
    this.init();
  }

  public static getInstance(): TreasuryEngine {
    if (!TreasuryEngine.instance) {
      TreasuryEngine.instance = new TreasuryEngine();
    }
    return TreasuryEngine.instance;
  }

  private init() {
    // Load holdings
    this.holdings = JSON.parse(JSON.stringify(TOP_100_COMPANY_HOLDINGS));

    // Load liked comments from localStorage
    try {
      const storedLikes = localStorage.getItem(STORAGE_LIKES_KEY);
      if (storedLikes) {
        this.userLikedIds = new Set(JSON.parse(storedLikes));
      }
    } catch {
      this.userLikedIds = new Set();
    }

    // Load world comments
    try {
      const stored = localStorage.getItem(STORAGE_COMMENTS_KEY);
      if (stored) {
        const parsed: WorldComment[] = JSON.parse(stored);
        this.comments = parsed.map(c => ({
          ...c,
          isLikedByUser: this.userLikedIds.has(c.id)
        }));
      } else {
        this.comments = INITIAL_WORLD_COMMENTS.map(c => ({
          ...c,
          isLikedByUser: this.userLikedIds.has(c.id)
        }));
        this.saveComments();
      }
    } catch {
      this.comments = INITIAL_WORLD_COMMENTS;
    }

    // Subscribe to exchangeEngine for live TIXA price sync
    exchangeEngine.subscribe(() => {
      this.syncHoldingsWithLivePrice();
    });

    // Start background simulation for live up/down ticks
    this.startSimulationIntervals();
  }

  private startSimulationIntervals() {
    if (this.tickInterval) clearInterval(this.tickInterval);
    if (this.streamInterval) clearInterval(this.streamInterval);

    // Dynamic micro-tick updates every 3.5 seconds
    this.tickInterval = setInterval(() => {
      this.simulateMicroTick();
    }, 3500);

    // Periodic incoming world comment stream every 12 seconds
    this.streamInterval = setInterval(() => {
      this.injectStreamComment();
    }, 12000);
  }

  private syncHoldingsWithLivePrice() {
    const currentPrice = exchangeEngine.getCurrentTixaPrice();
    this.holdings = this.holdings.map(company => {
      const totalValueUsd = company.tixaHeld * currentPrice;
      const pnlTotalPercent = Number((((currentPrice - company.avgEntryPrice) / company.avgEntryPrice) * 100).toFixed(2));
      return {
        ...company,
        totalValueUsd,
        pnlTotalPercent
      };
    });
    this.notify();
  }

  public simulateMicroTick() {
    const currentPrice = exchangeEngine.getCurrentTixaPrice();
    
    // Pick 4-8 random companies to experience live on-chain delta/shift
    const sampleSize = Math.floor(Math.random() * 5) + 4;
    const indices = new Set<number>();
    while (indices.size < sampleSize) {
      indices.add(Math.floor(Math.random() * this.holdings.length));
    }

    this.holdings = this.holdings.map((company, idx) => {
      if (indices.has(idx)) {
        // Random micro delta (-0.8% to +1.2%)
        const deltaPct = (Math.random() * 2.0 - 0.7);
        const new24h = Number((company.pnl24hPercent + deltaPct * 0.15).toFixed(2));
        const direction: 'up' | 'down' | 'neutral' = deltaPct > 0.05 ? 'up' : deltaPct < -0.05 ? 'down' : 'neutral';
        
        // Small accumulation simulation for active strategies
        let newAmount = company.tixaHeld;
        if (company.treasuryStrategy === 'Accumulate' && Math.random() > 0.6) {
          newAmount += Math.floor(Math.random() * 5) + 1;
        }

        const totalValueUsd = newAmount * currentPrice;
        const pnlTotalPercent = Number((((currentPrice - company.avgEntryPrice) / company.avgEntryPrice) * 100).toFixed(2));

        // Update sparkline
        const updatedSparkline = [...company.sparkline.slice(1), Math.round(currentPrice * (1 + (new24h / 200)))];

        return {
          ...company,
          tixaHeld: newAmount,
          totalValueUsd,
          pnl24hPercent: new24h,
          pnlTotalPercent,
          tickDirection: direction,
          sparkline: updatedSparkline
        };
      }
      return company;
    });

    this.notify();
  }

  private injectStreamComment() {
    if (this.comments.length >= 100) {
      // Keep list under 100 items
      this.comments = this.comments.slice(0, 80);
    }

    const template = WORLD_COMMENTS_STREAM_POOL[this.poolIndex % WORLD_COMMENTS_STREAM_POOL.length];
    this.poolIndex++;

    const newComment: WorldComment = {
      ...template,
      id: `wc-stream-${Date.now()}`,
      timestamp: Date.now(),
      likesCount: Math.floor(Math.random() * 25) + 5,
      isLikedByUser: false
    };

    this.comments = [newComment, ...this.comments];
    this.saveComments();
    this.notify();
  }

  private saveComments() {
    try {
      localStorage.setItem(STORAGE_COMMENTS_KEY, JSON.stringify(this.comments.slice(0, 100)));
      localStorage.setItem(STORAGE_LIKES_KEY, JSON.stringify(Array.from(this.userLikedIds)));
    } catch (e) {
      console.warn('Storage write failed', e);
    }
  }

  // Public Getters
  public getHoldings(): CompanyHolding[] {
    return this.holdings;
  }

  public getTop33Holdings(): CompanyHolding[] {
    return this.holdings.slice(0, 33);
  }

  public getComments(): WorldComment[] {
    return this.comments;
  }

  public getMetrics(): TreasurySummaryMetrics {
    const currentPrice = exchangeEngine.getCurrentTixaPrice();
    const totalTixaInTreasuries = this.holdings.reduce((acc, c) => acc + c.tixaHeld, 0);
    const totalTreasuryValueUsd = totalTixaInTreasuries * currentPrice;
    const circulatingSupply = 165000000; // 165M circulating
    const percentOfCirculatingSupply = Number(((totalTixaInTreasuries / circulatingSupply) * 100).toFixed(2));

    const sortedBy24h = [...this.holdings].sort((a, b) => b.pnl24hPercent - a.pnl24hPercent);
    const topGainer = sortedBy24h[0] || { name: 'Apple Inc.', ticker: 'AAPL', pnl24hPercent: 4.82 };

    const liveUpCount = this.holdings.filter(c => c.pnl24hPercent >= 0).length;
    const liveDownCount = this.holdings.length - liveUpCount;

    const net24hInflowUsd = this.holdings.reduce((acc, c) => acc + (c.delta24hAmount * currentPrice), 0);

    // Comment statistics
    const avgTargetPrice2050 = this.comments.length > 0 
      ? Math.round(this.comments.reduce((acc, c) => acc + c.futureGoalPrice, 0) / this.comments.length) 
      : 3500000;

    const bullishComments = this.comments.filter(c => c.sentiment === 'BULLISH' || c.sentiment === 'ULTRA_BULLISH' || c.sentiment === 'MOON_2050').length;
    const bullishSentimentPercent = this.comments.length > 0 
      ? Math.round((bullishComments / this.comments.length) * 100) 
      : 96;

    return {
      totalTixaInTreasuries,
      totalTreasuryValueUsd,
      percentOfCirculatingSupply,
      totalCompaniesTracked: this.holdings.length,
      topGainer24h: {
        name: topGainer.name,
        ticker: topGainer.ticker,
        gainPercent: topGainer.pnl24hPercent
      },
      net24hInflowUsd,
      liveUpCount,
      liveDownCount,
      avgTargetPrice2050,
      bullishSentimentPercent,
      totalWorldComments: this.comments.length
    };
  }

  // User Actions
  public addComment(data: {
    authorName: string;
    authorHandle: string;
    authorCountry: string;
    countryCode: string;
    flagEmoji: string;
    userTier: UserTier;
    message: string;
    futureGoalPrice: number;
    timeHorizon: '2026' | '2030' | '2040' | '2050';
    sentiment: CommentSentiment;
    tags?: string[];
  }): WorldComment {
    const avatarGradients = [
      'from-cyan-500 to-blue-600',
      'from-emerald-500 to-teal-600',
      'from-purple-500 to-indigo-600',
      'from-amber-500 to-orange-600',
      'from-rose-500 to-pink-600',
      'from-yellow-400 to-emerald-600'
    ];
    const avatarColor = avatarGradients[Math.floor(Math.random() * avatarGradients.length)];

    const newComment: WorldComment = {
      id: `wc-user-${Date.now()}`,
      authorName: data.authorName.trim() || 'Anonymous Pioneer',
      authorHandle: data.authorHandle.startsWith('@') ? data.authorHandle.trim() : `@${data.authorHandle.trim() || 'tixa_holder'}`,
      authorCountry: data.authorCountry || 'Global Citizen',
      countryCode: data.countryCode || 'UN',
      flagEmoji: data.flagEmoji || '🌐',
      userTier: data.userTier || 'Retail Investor',
      avatarColor,
      timestamp: Date.now(),
      message: data.message.trim(),
      futureGoalPrice: Number(data.futureGoalPrice) || 2500000,
      timeHorizon: data.timeHorizon || '2050',
      sentiment: data.sentiment || 'BULLISH',
      likesCount: 1,
      isLikedByUser: true,
      isVerified: false,
      tags: data.tags && data.tags.length > 0 ? data.tags : ['#TIXAPAY', '#WorldVoice', '#FutureGoal']
    };

    this.userLikedIds.add(newComment.id);
    this.comments = [newComment, ...this.comments];
    this.saveComments();
    this.notify();
    return newComment;
  }

  public toggleLikeComment(commentId: string): boolean {
    const comment = this.comments.find(c => c.id === commentId);
    if (!comment) return false;

    if (this.userLikedIds.has(commentId)) {
      this.userLikedIds.delete(commentId);
      comment.likesCount = Math.max(0, comment.likesCount - 1);
      comment.isLikedByUser = false;
    } else {
      this.userLikedIds.add(commentId);
      comment.likesCount += 1;
      comment.isLikedByUser = true;
    }

    this.saveComments();
    this.notify();
    return comment.isLikedByUser;
  }

  public triggerManualSync() {
    this.simulateMicroTick();
    this.injectStreamComment();
  }

  // Subscribe pattern
  public subscribe(callback: () => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(s => s !== callback);
    };
  }

  private notify() {
    this.subscribers.forEach(cb => {
      try {
        cb();
      } catch (err) {
        console.error('Error in TreasuryEngine subscriber', err);
      }
    });
  }
}

export const treasuryEngine = TreasuryEngine.getInstance();
