import React, { useState, useEffect } from 'react';
import { 
  X, 
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
  BarChart3
} from 'lucide-react';
import { NativeCoin } from '../../core/nativeMarketEngine';
import { globalTradesEngine, GlobalTradeEvent, CoinLiveTradingStats } from '../../core/globalTradesEngine';
import { Skeleton } from '../common/Skeleton';

interface CoinLiveDashboardModalProps {
  coin: NativeCoin;
  onClose: () => void;
  onTradeNow: (symbol: string) => void;
  chartHistory?: { timestamp: number; price: number; high: number; low: number; volume: number }[];
  isChartLoading?: boolean;
}

export const CoinLiveDashboardModal: React.FC<CoinLiveDashboardModalProps> = ({
  coin,
  onClose,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-[#070e24] border border-cyan-500/40 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl relative overflow-hidden font-sans">
        
        {/* Top Glow Ambient Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400" />
        
        {/* MODAL HEADER */}
        <div className="p-5 sm:p-6 border-b border-slate-800/80 bg-slate-950/60 flex items-center justify-between gap-4">
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
                <h2 className="text-xl sm:text-2xl font-black text-white font-heading tracking-tight">
                  {coin.name}
                </h2>
                <span className="px-2 py-0.5 rounded-lg bg-cyan-950 border border-cyan-500/40 text-xs font-mono font-bold text-cyan-300">
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

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* STATS OVERVIEW CARDS */}
        <div className="p-4 sm:p-6 pb-2 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-inner">
            <span className="text-slate-500 block text-[10px] uppercase tracking-wider font-semibold">Current Price</span>
            <div className="text-lg font-black text-white mt-0.5">
              ${coin.currentPrice.toLocaleString('en-US', { minimumFractionDigits: coin.currentPrice < 10 ? 4 : 2 })}
            </div>
            <span className="text-[10px] text-cyan-400 block mt-0.5">±$5K Live Swings</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/90">
            <span className="text-slate-500 block text-[10px] uppercase tracking-wider font-semibold">24h Change</span>
            <div className={`text-lg font-black mt-0.5 flex items-center gap-1 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{isPositive ? '+' : ''}{coin.change24h.toFixed(2)}%</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              H: ${coin.high24h.toLocaleString()} / L: ${coin.low24h.toLocaleString()}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/90">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 block text-[10px] uppercase tracking-wider font-semibold">Live Win Rate</span>
              <span className="text-[10px] font-bold text-emerald-400">{stats ? stats.liveWinRate : 64.2}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-2 flex">
              <div 
                className="bg-emerald-400 h-full transition-all duration-500" 
                style={{ width: `${stats ? stats.liveWinRate : 64.2}%` }} 
              />
              <div 
                className="bg-rose-500 h-full transition-all duration-500" 
                style={{ width: `${100 - (stats ? stats.liveWinRate : 64.2)}%` }} 
              />
            </div>
            <div className="flex justify-between text-[9px] text-slate-400 mt-1">
              <span className="text-emerald-400">Wins: {stats ? stats.tradesWonCount : 15}</span>
              <span className="text-rose-400">Loss: {stats ? stats.tradesLostCount : 9}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-950/40 to-slate-900/90 border border-amber-500/30">
            <span className="text-amber-400 block text-[10px] uppercase tracking-wider font-bold flex items-center gap-1">
              <Trophy className="w-3 h-3 text-amber-400" />
              <span>Recent Top Win</span>
            </span>
            <div className="text-base font-black text-amber-300 mt-0.5 truncate">
              {stats?.recentBiggestWin?.countryFlag || '🇧🇩'} +${(stats?.recentBiggestWin?.profit ?? 4600).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
              By {stats?.recentBiggestWin?.userEmail || 'user***@gmail.com'} (${(stats?.recentBiggestWin?.amount ?? 5000).toLocaleString()})
            </span>
          </div>
        </div>

        {/* TABS SELECTOR */}
        <div className="px-4 sm:px-6 pt-3 flex items-center justify-between border-b border-slate-800 gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('GLOBAL_TRADES')}
              className={`pb-3 px-3 text-xs font-mono font-bold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'GLOBAL_TRADES'
                  ? 'border-cyan-400 text-cyan-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe2 className="w-4 h-4 text-cyan-400" />
              <span>Live Global Traders Feed</span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] animate-pulse">
                LIVE
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('TICK_HISTORY')}
              className={`pb-3 px-3 text-xs font-mono font-bold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'TICK_HISTORY'
                  ? 'border-cyan-400 text-cyan-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span>33Hz Tick History</span>
            </button>
          </div>

          {/* If on trades tab, show filter */}
          {activeTab === 'GLOBAL_TRADES' && (
            <div className="flex items-center gap-1 pb-2">
              <button
                type="button"
                onClick={() => setFilterType('ALL')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold transition-all ${
                  filterType === 'ALL'
                    ? 'bg-cyan-500 text-black font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilterType('WIN')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold transition-all ${
                  filterType === 'WIN'
                    ? 'bg-emerald-500 text-black font-bold'
                    : 'bg-slate-900 text-emerald-400 hover:bg-slate-800'
                }`}
              >
                Wins 🏆
              </button>
              <button
                type="button"
                onClick={() => setFilterType('LOSS')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold transition-all ${
                  filterType === 'LOSS'
                    ? 'bg-rose-500 text-white font-bold'
                    : 'bg-slate-900 text-rose-400 hover:bg-slate-800'
                }`}
              >
                Losses
              </button>
              <button
                type="button"
                onClick={() => setFilterType('HIGH_VALUE')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold hidden sm:inline-block transition-all ${
                  filterType === 'HIGH_VALUE'
                    ? 'bg-amber-500 text-black font-bold'
                    : 'bg-slate-900 text-amber-400 hover:bg-slate-800'
                }`}
              >
                $1,000+
              </button>
            </div>
          )}
        </div>

        {/* TAB 1: LIVE GLOBAL TRADES FEED */}
        {activeTab === 'GLOBAL_TRADES' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2.5 min-h-[320px]">
            {filteredTrades.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-mono">
                No trades found for this filter.
              </div>
            ) : (
              filteredTrades.map((trade, idx) => {
                const isNewest = trade.id === latestTradeId;
                const isWin = trade.result === 'WIN';
                const isHighRoller = trade.amount >= 1000;

                return (
                  <div
                    key={trade.id}
                    className={`p-3 sm:p-3.5 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-3 text-xs font-mono ${
                      isNewest
                        ? 'bg-cyan-950/50 border-cyan-400 shadow-md shadow-cyan-500/20 scale-[1.008]'
                        : isWin
                          ? 'bg-slate-900/60 border-slate-800/80 hover:border-emerald-500/40'
                          : 'bg-slate-900/60 border-slate-800/80 hover:border-rose-500/40'
                    }`}
                  >
                    {/* Country & User Email */}
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xl sm:text-2xl shrink-0 select-none" title={trade.countryName}>
                        {trade.countryFlag}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white truncate max-w-[130px] sm:max-w-[180px]">
                            {trade.userEmail}
                          </span>
                          <span className="text-[10px] text-slate-400 hidden sm:inline-block">
                            ({trade.countryName})
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span className="text-slate-500">{new Date(trade.timestamp).toLocaleTimeString()}</span>
                          <span>•</span>
                          <span className="text-cyan-300">{trade.duration}</span>
                          {isHighRoller && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold border border-amber-500/30">
                              HIGH ROLLER
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Trade Direction & Amount */}
                    <div className="text-center shrink-0">
                      <div className="flex items-center justify-center gap-1">
                        <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                          trade.direction === 'CALL'
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-950/80 text-rose-400 border border-rose-500/30'
                        }`}>
                          {trade.direction === 'CALL' ? (
                            <>
                              <ArrowUpRight className="w-3 h-3" />
                              <span>CALL</span>
                            </>
                          ) : (
                            <>
                              <ArrowDownRight className="w-3 h-3" />
                              <span>PUT</span>
                            </>
                          )}
                        </span>
                      </div>
                      <span className="text-slate-300 text-xs font-bold block mt-1">
                        ${trade.amount.toLocaleString()}
                      </span>
                    </div>

                    {/* Result & Profit/Loss */}
                    <div className="text-right shrink-0 min-w-[100px] sm:min-w-[130px]">
                      <div className="flex items-center justify-end gap-1.5">
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold ${
                          isWin
                            ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        }`}>
                          {isWin ? 'WIN 🏆' : 'LOSS'}
                        </span>
                      </div>
                      <div className={`text-sm font-black mt-1 ${isWin ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isWin ? `+$${trade.profitOrLoss.toFixed(2)}` : `-$${trade.amount.toFixed(2)}`}
                      </div>
                      {isWin && (
                        <span className="text-[10px] text-emerald-500/90 font-semibold block">
                          +{Math.round(trade.payoutRate * 100)}% Payout
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: TICK HISTORY */}
        {activeTab === 'TICK_HISTORY' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2 min-h-[320px] font-mono text-xs">
            <div className="flex justify-between text-slate-400 pb-2 border-b border-slate-800 text-[11px]">
              <span>TIMESTAMP</span>
              <span>PRICE TICK</span>
              <span>VOLUME</span>
            </div>
            {isChartLoading ? (
              <div className="space-y-2 py-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <Skeleton className="w-20 h-4 bg-slate-800" />
                    <Skeleton className="w-24 h-4 bg-slate-700" />
                    <Skeleton className="w-16 h-3.5 bg-slate-800" />
                  </div>
                ))}
              </div>
            ) : chartHistory.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No tick pulses recorded yet.
              </div>
            ) : (
              chartHistory.slice(-25).reverse().map((tick, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400">{new Date(tick.timestamp).toLocaleTimeString()}</span>
                  <span className="text-cyan-300 font-bold">${tick.price.toLocaleString('en-US', { minimumFractionDigits: tick.price < 10 ? 4 : 2 })}</span>
                  <span className="text-slate-500">Vol: {tick.volume}</span>
                </div>
              ))
            )}
          </div>
        )}

        {/* MODAL FOOTER */}
        <div className="p-4 sm:p-6 bg-slate-950/90 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs">
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span>Streaming global live orders (every 1s) from 99+ countries on TIXA Native Chain</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => onTradeNow(coin.symbol)}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-extrabold text-xs shadow-lg shadow-cyan-500/25 flex items-center gap-1.5"
            >
              <span>Trade {coin.symbol} Now</span>
              <ArrowUpRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
