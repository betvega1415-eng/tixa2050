import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Star, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  Zap, 
  ShieldCheck, 
  Activity,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { nativeMarketEngine, NativeCoin } from '../../core/nativeMarketEngine';
import { ActiveTab } from '../common/Navbar';
import { Skeleton, MarketsTableSkeleton } from '../common/Skeleton';
import { CoinNetworkMotion } from '../common/CoinNetworkMotion';

interface MarketsViewProps {
  onSelectPairForTrade?: (pairId: string) => void;
  onSelectPair?: (pairId: string) => void;
  setActiveTab?: (tab: ActiveTab) => void;
  onOpenAuth?: (mode: 'login' | 'register' | 'admin') => void;
  onSelectNativeCoin?: (coin: NativeCoin) => void;
}

export const MarketsView: React.FC<MarketsViewProps> = ({
  onSelectPairForTrade,
  onSelectPair,
  setActiveTab,
  onOpenAuth,
  onSelectNativeCoin
}) => {
  const [tixaCoin, setTixaCoin] = useState<NativeCoin>(nativeMarketEngine.getTixaCoin());
  const [coins, setCoins] = useState<Record<string, NativeCoin>>(nativeMarketEngine.getCoins());
  const [searchQuery, setSearchQuery] = useState('');
  const [isMarketActive, setIsMarketActive] = useState(nativeMarketEngine.isMarketActive());
  const [pulsingCoins, setPulsingCoins] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const prevPricesRef = useRef<Record<string, number>>({});

  useEffect(() => {
    const update = () => {
      const newTixa = nativeMarketEngine.getTixaCoin();
      const newCoins = nativeMarketEngine.getCoins();
      
      setTixaCoin({ ...newTixa });
      setCoins({ ...newCoins });
      setIsMarketActive(nativeMarketEngine.isMarketActive());
    };
    update();
    const unsub = nativeMarketEngine.subscribe(update);
    const loadTimer = setTimeout(() => setIsLoading(false), 450);

    return () => {
      clearTimeout(loadTimer);
      unsub();
    };
  }, []);

  const allCoinsList: NativeCoin[] = [tixaCoin, ...Object.values(coins)];

  const filteredCoins = allCoinsList.filter(coin => 
    coin.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coin.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTradeClick = (symbol: string) => {
    const pairId = `${symbol}_USDT`;
    if (onSelectPairForTrade) onSelectPairForTrade(pairId);
    else if (onSelectPair) onSelectPair(pairId);
    if (setActiveTab) setActiveTab('exchange');
  };

  const openChart = async (coin: NativeCoin) => {
    if (onSelectNativeCoin) {
      onSelectNativeCoin(coin);
      return;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#091129] via-[#071329] to-[#0a1b38] border border-cyan-500/25 p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>TIXA NATIVE BASE // BTX // 33 PULSES PER SECOND</span>
                <span className={`w-2 h-2 rounded-full ${isMarketActive ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-heading">
                BTX <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">& Native Markets</span>
              </h1>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-cyan-500/30 shadow-lg shadow-cyan-950/30 font-mono text-xs shrink-0">
              <span className="text-cyan-400 block text-[10px] font-bold">BTX PRICE</span>
              <span className="text-base font-black text-white">${tixaCoin.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              <span className={`text-[10px] block font-bold ${tixaCoin.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {tixaCoin.change24h >= 0 ? '+' : ''}{tixaCoin.change24h.toFixed(2)}% 24h
              </span>
            </div>
          </div>

          {/* Coin Network Motion Data Transfer Graphic */}
          <CoinNetworkMotion />
        </div>
      </div>

      {/* Search Input */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-300 font-heading">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span>BTX (Native Base) & 33 Custom Tokens</span>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search coin symbol (e.g. TIXA, QXA, ZEV)..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
          />
        </div>
      </div>

      {/* Markets Table (COIN, PRICE, 24H CHANGE, HIGH, LOW, STATUS, TRADE) */}
      {isLoading ? (
        <MarketsTableSkeleton rows={10} showHeader={false} />
      ) : (
        <div className="rounded-2xl bg-[#060b1b] border border-cyan-500/20 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#09112a] border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase">
                  <th className="py-3.5 px-4">Coin / Asset</th>
                  <th className="py-3.5 px-4 text-right">Price (USD)</th>
                  <th className="py-3.5 px-4 text-right">24h Change</th>
                  <th className="py-3.5 px-4 text-right">24h High</th>
                  <th className="py-3.5 px-4 text-right">24h Low</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Trade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredCoins.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500 text-sm">
                      No coins found matching "{searchQuery}".
                    </td>
                  </tr>
                ) : (
                  filteredCoins.map((coin) => {
                    const isPositive = coin.change24h >= 0;
                    const isTixa = coin.symbol === 'TIXA';

                    return (
                      <tr
                        key={coin.symbol}
                        onClick={() => openChart(coin)}
                        className={`cursor-pointer transition-all duration-300 group ${
                          pulsingCoins[coin.symbol] 
                            ? 'bg-cyan-500/30 border-cyan-400 scale-[1.002] shadow-lg shadow-cyan-500/30' 
                            : 'hover:bg-cyan-950/20'
                        }`}
                      >
                        {/* COIN */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                              isTixa 
                                ? 'bg-gradient-to-tr from-cyan-400 to-blue-600 text-black shadow-lg shadow-cyan-500/30' 
                                : 'bg-slate-900 border border-slate-700 text-cyan-300'
                            }`}>
                              {coin.symbol.slice(0, 4)}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-white text-sm tracking-wide font-sans">
                                  {coin.symbol}
                                </span>
                                {isTixa && <span className="px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-[9px] text-cyan-300">NATIVE BASE</span>}
                              </div>
                              <span className="text-[10px] text-slate-400 font-sans block">
                                {coin.name}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* PRICE */}
                        <td className="py-4 px-4 text-right">
                          <span className="text-sm font-extrabold text-white">
                            ${coin.currentPrice.toLocaleString('en-US', {
                              minimumFractionDigits: coin.currentPrice < 10 ? 4 : 2,
                              maximumFractionDigits: coin.currentPrice < 10 ? 4 : 2
                            })}
                          </span>
                        </td>

                        {/* 24H CHANGE */}
                        <td className="py-4 px-4 text-right">
                          <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[11px] font-bold ${
                            isPositive 
                              ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-500/30' 
                              : 'text-rose-400 bg-rose-950/60 border border-rose-500/30'
                          }`}>
                            {isPositive ? '+' : ''}{coin.change24h.toFixed(2)}%
                          </span>
                        </td>

                        {/* HIGH */}
                        <td className="py-4 px-4 text-right text-slate-300">
                          ${coin.high24h.toLocaleString('en-US', { minimumFractionDigits: coin.currentPrice < 10 ? 4 : 2 })}
                        </td>

                        {/* LOW */}
                        <td className="py-4 px-4 text-right text-slate-400">
                          ${coin.low24h.toLocaleString('en-US', { minimumFractionDigits: coin.currentPrice < 10 ? 4 : 2 })}
                        </td>

                        {/* STATUS */}
                        <td className="py-4 px-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                            coin.status === 'LIVE' 
                              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30' 
                              : 'bg-amber-950/80 text-amber-400 border border-amber-500/30'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${coin.status === 'LIVE' ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                            <span>{coin.status}</span>
                          </span>
                        </td>

                        {/* TRADE */}
                        <td className="py-4 px-4 text-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTradeClick(coin.symbol);
                            }}
                            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-all"
                          >
                            <span>TRADE</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
