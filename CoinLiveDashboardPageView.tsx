import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Globe2, 
  Users, 
  Trophy, 
  Zap, 
  ArrowUpRight, 
  ArrowDownRight, 
  Filter, 
  Clock, 
  DollarSign, 
  Activity, 
  ShieldCheck,
  Sparkles,
  BarChart3,
  Wallet
} from 'lucide-react';
import { NativeCoin } from '../../core/nativeMarketEngine';
import { globalTradesEngine, GlobalTradeEvent, CoinLiveTradingStats } from '../../core/globalTradesEngine';
import { Skeleton } from '../common/Skeleton';
import { soundEngine } from '../../core/soundEngine';
import confetti from 'canvas-confetti';

interface CoinLiveDashboardPageViewProps {
  coin: NativeCoin;
  onCloseToMarkets: () => void;
  onTradeNow: (symbol: string) => void;
  chartHistory?: { timestamp: number; price: number; high: number; low: number; volume: number }[];
  isChartLoading?: boolean;
}

export const CoinLiveDashboardPageView: React.FC<CoinLiveDashboardPageViewProps> = ({
  coin,
  onCloseToMarkets,
  onTradeNow,
  chartHistory = [],
  isChartLoading = false
}) => {
  const [activeTab, setActiveTab] = useState<'GLOBAL_TRADES' | 'TICK_HISTORY'>('GLOBAL_TRADES');
  const [filterType, setFilterType] = useState<'ALL' | 'WIN' | 'LOSS' | 'HIGH_VALUE'>('ALL');
  const [trades, setTrades] = useState<GlobalTradeEvent[]>([]);
  const [stats, setStats] = useState<CoinLiveTradingStats | null>(null);
  const [latestTradeId, setLatestTradeId] = useState<string | null>(null);

  useEffect(() => {
    // Activate global trade stream for this specific coin
    globalTradesEngine.setActiveCoin(coin.symbol, coin.name, coin.currentPrice);

    const updateFromEngine = () => {
      const currentTrades = globalTradesEngine.getTrades(coin.symbol);
      const currentStats = globalTradesEngine.getStats(coin.symbol);
      
      if (currentTrades.length > 0) {
        setLatestTradeId(currentTrades[0].id);
      }
      setTrades([...currentTrades]);
      setStats({ ...currentStats });
    };

    updateFromEngine();
    const unsub = globalTradesEngine.subscribe(updateFromEngine);

    return () => {
      unsub();
      globalTradesEngine.clearActiveCoin();
    };
  }, [coin.symbol, coin.name, coin.currentPrice]);

  const filteredTrades = trades.filter(t => {
    if (filterType === 'WIN') return t.result === 'WIN';
    if (filterType === 'LOSS') return t.result === 'LOSS';
    if (filterType === 'HIGH_VALUE') return t.amount >= 1000;
    return true;
  });

  const isTixa = coin.symbol === 'TIXA';
  const isPositive = coin.change24h >= 0;

  return (
    <div className="w-full min-h-screen bg-[#030712] text-slate-100 pb-24 animate-in fade-in duration-300">
      
      {/* Top Header Navigation */}
      <div className="sticky top-0 z-40 bg-[#060a17]/95 backdrop-blur-xl border-b border-cyan-500/30 px-4 sm:px-8 py-5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onCloseToMarkets}
              className="p-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all flex items-center gap-2 font-mono text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Markets</span>
            </button>

            <div className="flex items-center gap-3.5">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm tracking-wider shadow-lg ${
                isTixa 
                  ? 'bg-gradient-to-tr from-cyan-400 to-blue-600 text-black shadow-cyan-500/30' 
                  : 'bg-slate-900 border border-cyan-500/40 text-cyan-300'
              }`}>
                {coin.symbol.slice(0, 4)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-white font-heading tracking-tight">
                    {coin.name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-lg bg-cyan-950 border border-cyan-500/40 text-xs font-mono font-bold text-cyan-300">
                    {coin.symbol}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>33Hz LIVE</span>
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-mono">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    <strong className="text-slate-200">
                      {stats ? stats.activeTradersCount.toLocaleString() : '2,840'}
                    </strong> Online Traders
                  </span>
                  <span>•</span>
                  <span className="text-slate-400">
                    Ref: ${coin.startingPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button
              type="button"
              onClick={() => onTradeNow(coin.symbol)}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-400 via-emerald-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-black text-xs sm:text-sm shadow-lg shadow-cyan-500/30 transition-all flex items-center gap-2 hover:scale-[1.02]"
            >
              <Zap className="w-4 h-4 fill-black" />
              <span>TRADE {coin.symbol} NOW</span>
            </button>
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        
        {/* STATS OVERVIEW CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-cyan-500/30 shadow-xl backdrop-blur-md">
            <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-bold">Current Market Price</span>
            <div className="text-2xl font-black text-white mt-1">
              ${(coin?.currentPrice ?? 0).toLocaleString('en-US', { minimumFractionDigits: (coin?.currentPrice ?? 0) < 10 ? 4 : 2 })}
            </div>
            <span className="text-[11px] text-cyan-400 block mt-1 font-semibold">±$5K Live Swings Active</span>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
            <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-bold">24h Price Change</span>
            <div className={`text-2xl font-black mt-1 flex items-center gap-1.5 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              <span>{isPositive ? '+' : ''}{(coin?.change24h ?? 0).toFixed(2)}%</span>
            </div>
            <span className="text-[11px] text-slate-400 block mt-1 font-mono">
              H: ${(coin?.high24h ?? 0).toLocaleString()} / L: ${(coin?.low24h ?? 0).toLocaleString()}
            </span>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-bold">Live Win Rate</span>
              <span className="text-xs font-bold text-emerald-400">{stats ? stats.liveWinRate : 64.2}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mt-3 flex">
              <div 
                className="bg-emerald-400 h-full transition-all duration-500" 
                style={{ width: `${stats ? stats.liveWinRate : 64.2}%` }} 
              />
              <div 
                className="bg-rose-500 h-full transition-all duration-500" 
                style={{ width: `${100 - (stats ? stats.liveWinRate : 64.2)}%` }} 
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-bold">
              <span className="text-emerald-400">Wins: {stats ? stats.tradesWonCount : 15}</span>
              <span className="text-rose-400">Loss: {stats ? stats.tradesLostCount : 9}</span>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/40 shadow-xl backdrop-blur-md">
            <span className="text-amber-400 block text-[11px] uppercase tracking-wider font-bold flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Recent Top Win</span>
            </span>
            <div className="text-lg font-black text-amber-300 mt-1 truncate">
              {stats?.recentBiggestWin?.countryFlag || '🇧🇩'} +${(stats?.recentBiggestWin?.profit ?? 4600).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-slate-400 block mt-1 truncate font-mono">
              By {stats?.recentBiggestWin?.userEmail || 'user***@gmail.com'} (${(stats?.recentBiggestWin?.amount ?? 5000).toLocaleString()})
            </span>
          </div>
        </div>

        {/* MAIN DASHBOARD CONTAINER */}
        <div className="bg-[#060a17] border border-cyan-500/30 rounded-3xl overflow-hidden shadow-2xl">
          
          {/* TABS SELECTOR & FILTERS */}
          <div className="px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 gap-4 bg-slate-950/50">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('GLOBAL_TRADES')}
                className={`py-2 px-4 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all ${
                  activeTab === 'GLOBAL_TRADES'
                    ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Globe2 className="w-4 h-4" />
                <span>Live Global Traders Feed</span>
                <span className="px-2 py-0.5 rounded-full bg-black/20 text-black text-[10px] animate-pulse">
                  LIVE
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('TICK_HISTORY')}
                className={`py-2 px-4 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all ${
                  activeTab === 'TICK_HISTORY'
                    ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>33Hz Tick History</span>
              </button>
            </div>

            {activeTab === 'GLOBAL_TRADES' && (
              <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setFilterType('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                    filterType === 'ALL'
                      ? 'bg-cyan-400 text-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('WIN')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                    filterType === 'WIN'
                      ? 'bg-emerald-400 text-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Wins 🏆
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('LOSS')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                    filterType === 'LOSS'
                      ? 'bg-rose-500 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Losses
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('HIGH_VALUE')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                    filterType === 'HIGH_VALUE'
                      ? 'bg-amber-400 text-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  $1,000+
                </button>
              </div>
            )}
          </div>

          {/* TAB CONTENT: GLOBAL TRADES OR TICK HISTORY */}
          {activeTab === 'GLOBAL_TRADES' ? (
            <div className="p-6 space-y-3 min-h-[420px]">
              {filteredTrades.length === 0 ? (
                <div className="py-24 text-center text-slate-500 text-xs font-mono italic">
                  No trades found for this filter.
                </div>
              ) : (
                filteredTrades.map((trade) => {
                  const isNewest = trade.id === latestTradeId;
                  const isWin = trade.result === 'WIN';
                  const isHighRoller = trade.amount >= 1000;
                  const isBangladesh = trade.countryCode === 'BD';
                  const isVipBox = trade.isVipBoxWin;

                  return (
                    <div
                      key={trade.id}
                      className={`p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-4 text-xs font-mono ${
                        isNewest
                          ? 'bg-cyan-950/80 border-cyan-400 shadow-xl shadow-cyan-500/25 scale-[1.01]'
                          : isWin
                            ? 'bg-slate-900/80 border-slate-800 hover:border-emerald-500/60 shadow-md'
                            : 'bg-slate-900/80 border-slate-800 hover:border-rose-500/60 shadow-md'
                      }`}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="relative">
                          <span className="text-3xl shrink-0 select-none block" title={trade.countryName}>
                            {trade.countryFlag}
                          </span>
                          {isBangladesh && (
                            <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded bg-emerald-500 text-black text-[9px] font-black uppercase">
                              BD
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white truncate">{trade.userEmail}</span>
                            <span className="text-[10px] text-slate-400">({trade.countryName})</span>
                            {isBangladesh && (
                              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] font-bold border border-emerald-500/40 animate-pulse">
                                🇧🇩 BD Live Trader
                              </span>
                            )}
                            {isVipBox && (
                              <span className="px-2 py-0.5 rounded bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-[10px] font-black shadow-md border border-amber-300 animate-bounce">
                                🎁 VIP Mystery Box Win!
                              </span>
                            )}
                            {isHighRoller && !isVipBox && (
                              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/40">
                                💎 VIP Whale
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                            <span className="text-cyan-300 font-bold">{coin.symbol}</span>
                            <span>•</span>
                            <span className={trade.direction === 'CALL' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                              {trade.direction === 'CALL' ? '🟢 BUY / CALL' : '🔴 SELL / PUT'}
                            </span>
                            <span>•</span>
                            <span>{new Date(trade.timestamp).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 shrink-0 text-right">
                        <div>
                          <div className="text-slate-400 text-[10px]">Stake Amount</div>
                          <div className="font-bold text-white">${(trade?.amount ?? 0).toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-slate-400 text-[10px]">Net Result</div>
                          <div className={`font-extrabold text-sm ${isWin ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isWin ? `+$${(trade?.profitOrLoss ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : `-$${(trade?.amount ?? 0).toLocaleString()}`}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div className="p-6 space-y-4 min-h-[420px]">
              <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-xs font-mono text-cyan-300 flex items-center justify-between">
                <span>33Hz High-Frequency Quantum Ticks Feed</span>
                <span className="text-emerald-400 font-bold">● Synchronized</span>
              </div>
              <div className="space-y-2 font-mono text-xs">
                {chartHistory.slice(-15).reverse().map((tick, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">{new Date(tick.timestamp).toLocaleTimeString()}</span>
                    <span className="text-white font-bold">${(tick?.price ?? 0).toLocaleString(undefined, { minimumFractionDigits: (coin?.currentPrice ?? 0) < 10 ? 4 : 2 })}</span>
                    <span className="text-emerald-400">H: ${(tick?.high ?? 0).toLocaleString()}</span>
                    <span className="text-rose-400">L: ${(tick?.low ?? 0).toLocaleString()}</span>
                    <span className="text-cyan-300">Vol: {(tick?.volume ?? 0).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
