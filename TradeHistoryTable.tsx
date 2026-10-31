import React, { useState } from 'react';
import { 
  History, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2, 
  XCircle, 
  MinusCircle, 
  ExternalLink,
  Filter,
  Layers
} from 'lucide-react';
import { SettledTrade, AccountMode } from '../../types/forexTrading';

interface TradeHistoryTableProps {
  trades: SettledTrade[];
}

export const TradeHistoryTable: React.FC<TradeHistoryTableProps> = ({ trades }) => {
  const [filterMode, setFilterMode] = useState<'ALL' | AccountMode>('ALL');

  const filteredTrades = trades.filter(t => {
    if (filterMode === 'ALL') return true;
    return t.accountMode === filterMode;
  });

  const wonCount = filteredTrades.filter(t => t.result === 'WON').length;
  const totalCount = filteredTrades.length;
  const winRate = totalCount > 0 ? Math.round((wonCount / totalCount) * 100) : 0;
  const netPnL = filteredTrades.reduce((acc, t) => acc + t.pnl, 0);

  return (
    <div id="settled-trade-history-section" className="bg-[#050915] rounded-2xl border border-slate-800/80 p-4 sm:p-5 shadow-2xl font-mono text-xs space-y-4">
      {/* Header with Metrics and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-cyan-400" />
          <h3 className="font-bold text-white text-sm">Settled Trade History</h3>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
            {filteredTrades.length} trades
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setFilterMode('ALL')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              filterMode === 'ALL'
                ? 'bg-cyan-500 text-black shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ALL
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('DEMO')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              filterMode === 'DEMO'
                ? 'bg-amber-500 text-black shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            DEMO
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('REAL')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              filterMode === 'REAL'
                ? 'bg-emerald-500 text-black shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            REAL
          </button>
        </div>
      </div>

      {/* Performance Summary Banner */}
      {totalCount > 0 && (
        <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px]">
          <div>
            <span className="text-slate-500 block text-[10px]">WIN RATE</span>
            <strong className={`text-sm ${winRate >= 50 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {winRate}% ({wonCount}/{totalCount})
            </strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">NET PROFIT/LOSS</span>
            <strong className={`text-sm ${netPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {netPnL >= 0 ? `+$${netPnL.toFixed(2)}` : `-$${Math.abs(netPnL).toFixed(2)}`}
            </strong>
          </div>
          <div className="text-right">
            <span className="text-slate-500 block text-[10px]">ACCOUNT MODE</span>
            <strong className="text-slate-300 uppercase">{filterMode}</strong>
          </div>
        </div>
      )}

      {/* Trades Table */}
      {filteredTrades.length === 0 ? (
        <div className="py-10 text-center text-slate-500 text-xs">
          No trade history found in {filterMode} mode. Place your first BUY or SELL trade above!
        </div>
      ) : (
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-500">
                <th className="py-2 px-2">PAIR & TIME</th>
                <th className="py-2 px-2">TYPE</th>
                <th className="py-2 px-2">DIRECTION</th>
                <th className="py-2 px-2 text-right">ENTRY / EXIT</th>
                <th className="py-2 px-2 text-right">AMOUNT</th>
                <th className="py-2 px-2 text-right">DUR</th>
                <th className="py-2 px-2 text-right">RESULT</th>
                <th className="py-2 px-2 text-right">P/L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredTrades.map(trade => {
                const isWon = trade.result === 'WON';
                const isTie = trade.result === 'TIE';
                const dateStr = new Date(trade.settledTime).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit', 
                  second: '2-digit' 
                });

                return (
                  <tr 
                    key={trade.id} 
                    id={`trade-row-${trade.id}`}
                    className="hover:bg-slate-900/50 transition-colors"
                  >
                    <td className="py-2.5 px-2">
                      <div className="font-bold text-white">{trade.pairName}</div>
                      <div className="text-[10px] text-slate-500">{dateStr}</div>
                    </td>

                    <td className="py-2.5 px-2">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        trade.accountMode === 'DEMO'
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                          : 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40'
                      }`}>
                        {trade.accountMode}
                      </span>
                    </td>

                    <td className="py-2.5 px-2">
                      {trade.direction === 'CALL' ? (
                        <span className="flex items-center gap-1 text-emerald-400 font-bold">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          <span>BUY / CALL</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-rose-400 font-bold">
                          <ArrowDownRight className="w-3.5 h-3.5" />
                          <span>SELL / PUT</span>
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-2 text-right">
                      <div className="text-slate-300">{trade.entryPrice.toLocaleString()}</div>
                      <div className={`text-[10px] ${isWon ? 'text-emerald-400' : 'text-rose-400'}`}>
                        → {trade.exitPrice.toLocaleString()}
                      </div>
                    </td>

                    <td className="py-2.5 px-2 text-right font-bold text-white">
                      ${trade.amount.toFixed(2)}
                    </td>

                    <td className="py-2.5 px-2 text-right text-slate-400 font-semibold">
                      {trade.duration}
                    </td>

                    <td className="py-2.5 px-2 text-right">
                      {isWon ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>WON</span>
                        </span>
                      ) : isTie ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-700 text-[10px] font-bold">
                          <MinusCircle className="w-3 h-3 text-slate-400" />
                          <span>TIE</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-500/40 text-[10px] font-bold">
                          <XCircle className="w-3 h-3 text-rose-400" />
                          <span>LOST</span>
                        </span>
                      )}
                    </td>

                    <td className={`py-2.5 px-2 text-right font-bold ${
                      trade.pnl > 0 ? 'text-emerald-400' : trade.pnl === 0 ? 'text-slate-400' : 'text-rose-400'
                    }`}>
                      {trade.pnl > 0 ? `+$${trade.pnl.toFixed(2)}` : `-$${Math.abs(trade.pnl).toFixed(2)}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
