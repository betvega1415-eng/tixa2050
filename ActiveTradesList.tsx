import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight, 
  Zap, 
  CheckCircle2, 
  AlertCircle,
  Timer
} from 'lucide-react';
import { ActiveTrade, ForexPair } from '../../types/forexTrading';

interface ActiveTradesListProps {
  activeTrades: ActiveTrade[];
  pairs: ForexPair[];
}

export const ActiveTradesList: React.FC<ActiveTradesListProps> = ({ activeTrades, pairs }) => {
  const [, setTick] = useState(0);

  // Re-render countdown every 100ms for smooth live countdown display
  useEffect(() => {
    if (activeTrades.length === 0) return;
    const interval = setInterval(() => setTick(t => t + 1), 100);
    return () => clearInterval(interval);
  }, [activeTrades.length]);

  if (activeTrades.length === 0) {
    return null;
  }

  return (
    <div id="active-trades-section" className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
          <Timer className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>Active Trades ({activeTrades.length})</span>
        </h3>
        <span className="text-[11px] font-mono text-slate-400">Live Expiry Countdown</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {activeTrades.map(trade => {
          const pair = pairs.find(p => p.id === trade.pairId);
          const currentPrice = pair ? pair.currentPrice : trade.entryPrice;
          const now = Date.now();
          const remainingMs = Math.max(0, trade.expiryTime - now);
          const totalMs = trade.durationSeconds * 1000;
          const progressPercent = Math.max(0, Math.min(100, (1 - (remainingMs / totalMs)) * 100));

          const seconds = Math.floor(remainingMs / 1000);
          const tenths = Math.floor((remainingMs % 1000) / 100);
          const formattedTimer = `00:${seconds.toString().padStart(2, '0')}.${tenths}`;

          const isCall = trade.direction === 'CALL';
          const isWinning = isCall 
            ? currentPrice > trade.entryPrice 
            : currentPrice < trade.entryPrice;
          const isTie = currentPrice === trade.entryPrice;

          const priceDecimals = pair ? pair.priceDecimals : 2;

          return (
            <div
              key={trade.id}
              id={`active-trade-card-${trade.id}`}
              className={`p-3.5 rounded-2xl border transition-all relative overflow-hidden font-mono text-xs shadow-xl ${
                isWinning
                  ? 'bg-emerald-950/30 border-emerald-500/50 shadow-emerald-950/30'
                  : isTie
                  ? 'bg-slate-900/60 border-slate-700'
                  : 'bg-rose-950/30 border-rose-500/50 shadow-rose-950/30'
              }`}
            >
              {/* Progress Bar Header */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800">
                <div 
                  className={`h-full transition-all duration-100 ${
                    isWinning ? 'bg-emerald-400' : 'bg-rose-400'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Trade Info Header */}
              <div className="flex items-center justify-between pt-1 pb-2 border-b border-slate-800/80">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white text-sm">{trade.pairName}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    trade.accountMode === 'DEMO'
                      ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                      : 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40'
                  }`}>
                    {trade.accountMode}
                  </span>
                </div>

                {/* Expiry Countdown Timer */}
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-cyan-300 font-bold text-xs">
                  <Clock className="w-3 h-3 text-cyan-400 animate-spin" />
                  <span>{formattedTimer}</span>
                </div>
              </div>

              {/* Direction & Amount */}
              <div className="grid grid-cols-2 gap-2 my-2.5">
                <div className="flex items-center gap-1.5">
                  {isCall ? (
                    <div className="flex items-center gap-1 text-emerald-400 font-bold">
                      <ArrowUpRight className="w-4 h-4 stroke-[3]" />
                      <span>CALL</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-rose-400 font-bold">
                      <ArrowDownRight className="w-4 h-4 stroke-[3]" />
                      <span>PUT</span>
                    </div>
                  )}
                  <span className="text-slate-400 font-semibold">${trade.amount}</span>
                </div>

                <div className="text-right">
                  <span className="text-slate-500 text-[10px] block">Expected PnL</span>
                  <span className={`font-bold ${isWinning ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isWinning ? `+$${trade.potentialProfit.toFixed(2)}` : `-$${trade.amount.toFixed(2)}`}
                  </span>
                </div>
              </div>

              {/* Price Delta Comparison */}
              <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/60 flex items-center justify-between text-[11px]">
                <div>
                  <span className="text-slate-500 text-[10px] block">Strike Entry</span>
                  <span className="text-slate-200">{trade.entryPrice.toFixed(priceDecimals)}</span>
                </div>

                <div className="text-right">
                  <span className="text-slate-500 text-[10px] block">Live Market</span>
                  <span className={`font-bold ${isWinning ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {currentPrice.toFixed(priceDecimals)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
