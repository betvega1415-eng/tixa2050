import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line 
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  ArrowUpRight, 
  Activity, 
  Flame, 
  Globe2, 
  Coins, 
  SlidersHorizontal,
  Clock,
  Sparkles,
  Zap,
  Layers,
  ChevronRight,
  Filter
} from 'lucide-react';
import { exchangeEngine } from '../../core/exchangeEngine';
import { MarketPair } from '../../types/exchange';
import { Skeleton, MarketsTableSkeleton } from '../common/Skeleton';

interface LiveMarketsBoardProps {
  onSelectPair?: (pairId: string) => void;
}

export const LiveMarketsBoard: React.FC<LiveMarketsBoardProps> = ({ onSelectPair }) => {
  const [pairs, setPairs] = useState<MarketPair[]>(exchangeEngine.getPairs());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [cycleCountdown, setCycleCountdown] = useState<number>(exchangeEngine.getCycleCountdown());
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [isLoading, setIsLoading] = useState(true);

  const refresh = () => {
    setPairs([...exchangeEngine.getPairs()]);
    setCycleCountdown(exchangeEngine.getCycleCountdown());
  };

  const [liveTick, setLiveTick] = useState<number>(0);

  useEffect(() => {
    refresh();
    const unsub = exchangeEngine.subscribe(refresh);
    const timer = setTimeout(() => setIsLoading(false), 400);

    const tickTimer = setInterval(() => {
      setLiveTick(t => t + 1);
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(tickTimer);
      unsub();
    };
  }, []);

  const isGlobalCrypto = (pair: MarketPair) => {
    const internalSymbols = ['TIXA', 'USDT', 'USDC', 'txUSD', 'NISI', 'SARA', 'MUN', 'BTX'];
    return !internalSymbols.includes(pair.baseSymbol) && !internalSymbols.includes(pair.quoteSymbol);
  };

  const getLiveChange = (pair: MarketPair) => {
    if (!isGlobalCrypto(pair)) return pair.change24h;
    const seed = pair.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const wave = Math.sin((liveTick + seed) * 0.8) * 0.35;
    return Number((pair.change24h + wave).toFixed(2));
  };

  const categories = [
    { id: 'ALL', label: 'All 33 Markets' },
    { id: 'Major', label: 'Major Pairs' },
    { id: 'L1', label: 'Layer 1s' },
    { id: 'DeFi', label: 'DeFi Protocols' },
    { id: 'AI', label: 'AI & Compute' },
    { id: 'Meme', label: 'Meme Tokens' },
    { id: 'Stable', label: 'Stables' }
  ];

  const filteredPairs = pairs.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.baseSymbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.quoteSymbol.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Calculate high-level stats
  const totalVolumeUsd = pairs.reduce((acc, p) => acc + (p.volume24h * (p.quoteSymbol === 'USDT' || p.quoteSymbol === 'txUSD' ? 1 : 15)), 0);
  const topGainer = [...pairs].sort((a, b) => getLiveChange(b) - getLiveChange(a))[0];
  const topLoser = [...pairs].sort((a, b) => getLiveChange(a) - getLiveChange(b))[0];

  const formatPrice = (pair: MarketPair) => {
    if (isGlobalCrypto(pair)) {
      return <span className="text-slate-400 italic">🔒 Price Hidden (Live %)</span>;
    }
    if (pair.quoteSymbol === 'USDT' || pair.quoteSymbol === 'txUSD' || pair.quoteSymbol === 'USDC') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: pair.priceDecimals
      }).format(pair.lastPrice);
    }
    return `${pair.lastPrice.toLocaleString(undefined, { maximumFractionDigits: pair.priceDecimals })} ${pair.quoteSymbol}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: 33 Live Markets Status & 1-Minute Shift Cycle */}
      <div className="p-6 rounded-3xl cyber-glass border border-cyan-500/25 relative overflow-hidden space-y-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Globe2 className="w-4 h-4" />
              </div>
              <h3 className="text-xl font-bold text-white font-heading">
                33 Live Global Market Liquidity Pools
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700 text-[10px] font-mono font-bold">
                33 PAIRS ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Live market order book depth • High-frequency 1-minute algorithmic market shifts
            </p>
          </div>

          {/* 1-Minute Cycle Progress Countdown */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-2xl bg-slate-950/80 border border-cyan-500/30 flex items-center gap-3 font-mono">
              <div className="relative flex items-center justify-center">
                <Activity className="w-4 h-4 text-cyan-400 animate-spin" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">1-MIN MARKET REFRESH</span>
                <span className="text-sm font-bold text-cyan-300">
                  Cycle in: {cycleCountdown}s
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => exchangeEngine.triggerMarketCycle()}
              className="px-3.5 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-cyan-300 hover:text-white flex items-center gap-1.5 transition-all"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Force Sync</span>
            </button>
          </div>
        </div>

        {/* 33-Market Quick Highlight Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
          {/* Top Gainer */}
          {topGainer && (
            <div 
              onClick={() => onSelectPair && onSelectPair(topGainer.id)}
              className="p-3.5 rounded-2xl bg-slate-950/60 border border-emerald-500/30 flex items-center justify-between cursor-pointer hover:border-emerald-400 transition-all"
            >
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold flex items-center gap-1">
                  <Flame className="w-3 h-3 text-emerald-400" />
                  <span>TOP GAINER 24H</span>
                </span>
                <span className="text-sm font-bold text-white mt-0.5 block">{topGainer.name}</span>
                <span className="text-[11px] text-slate-400">{formatPrice(topGainer)}</span>
              </div>
              <span className="px-2.5 py-1 rounded-xl bg-emerald-950/80 text-emerald-300 border border-emerald-700 font-bold text-xs">
                +{topGainer.change24h.toFixed(2)}%
              </span>
            </div>
          )}

          {/* Top Volume */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-cyan-500/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold flex items-center gap-1">
                <Activity className="w-3 h-3 text-cyan-400" />
                <span>AGGREGATE 24H VOLUME</span>
              </span>
              <span className="text-sm font-bold text-white mt-0.5 block">
                ${(totalVolumeUsd / 1000000).toFixed(2)}M USD
              </span>
              <span className="text-[11px] text-cyan-400">Deep Liquidity Across 33 Pairs</span>
            </div>
            <span className="px-2.5 py-1 rounded-xl bg-cyan-950/80 text-cyan-300 border border-cyan-700 font-bold text-xs">
              33 Markets
            </span>
          </div>

          {/* Core Peg */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-indigo-500/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span>TIXA BASE ASSET VALUE</span>
              </span>
              <span className="text-sm font-bold text-white mt-0.5 block">$990,000.00 USDT</span>
            </div>
            <span className="px-2.5 py-1 rounded-xl bg-indigo-950/80 text-indigo-300 border border-indigo-700 font-bold text-xs">
              Oracle 1s
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 font-mono text-xs">
          {categories.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input & View Toggle */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search 33 markets (e.g. BTC, SOL, PEPE)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1.5 rounded-lg font-bold ${
                viewMode === 'table' ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              List
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1.5 rounded-lg font-bold ${
                viewMode === 'grid' ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              Grid
            </button>
          </div>
        </div>
      </div>

      {/* Markets Content */}
      {isLoading ? (
        <MarketsTableSkeleton rows={8} showHeader={false} />
      ) : viewMode === 'table' ? (
        <div className="overflow-hidden rounded-2xl cyber-glass border border-slate-800 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#060b17] border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="p-4">Market Pair</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Last Price</th>
                  <th className="p-4">24h Change</th>
                  <th className="p-4">24h Range</th>
                  <th className="p-4">24h Volume</th>
                  <th className="p-4">7D Sparkline</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredPairs.map(pair => {
                  const liveChange = getLiveChange(pair);
                  const isUp = liveChange >= 0;
                  const sparkData = pair.sparkline.map((val, idx) => ({ idx, val }));
                  return (
                    <tr 
                      key={pair.id} 
                      className="hover:bg-slate-900/50 transition-colors group cursor-pointer"
                      onClick={() => onSelectPair && onSelectPair(pair.id)}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center font-bold text-cyan-400 text-xs">
                            {pair.baseSymbol.slice(0, 2)}
                          </div>
                          <div>
                            <span className="font-bold text-white block text-sm">{pair.baseSymbol}/{pair.quoteSymbol}</span>
                            <span className="text-[10px] text-slate-400">{pair.name}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 text-[10px] font-bold">
                          {pair.category}
                        </span>
                      </td>

                      <td className="p-4 font-bold text-white text-sm">
                        {formatPrice(pair)}
                      </td>

                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                          isUp 
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800' 
                            : 'bg-rose-950/80 text-rose-300 border border-rose-800'
                        }`}>
                          {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          <span>{isUp ? '+' : ''}{liveChange.toFixed(2)}%</span>
                        </span>
                      </td>

                      <td className="p-4 text-slate-300 text-[11px]">
                        <div className="space-y-0.5">
                          <div className="flex justify-between text-[10px] text-slate-400">
                            <span>L: {pair.low24h.toLocaleString()}</span>
                            <span>H: {pair.high24h.toLocaleString()}</span>
                          </div>
                          <div className="w-24 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div 
                              className="h-full bg-cyan-400 rounded-full" 
                              style={{ width: `${Math.min(100, Math.max(15, ((pair.lastPrice - pair.low24h) / (pair.high24h - pair.low24h || 1)) * 100))}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="p-4 text-slate-300 font-semibold">
                        {pair.volume24h.toLocaleString()} {pair.baseSymbol}
                      </td>

                      {/* Mini Recharts Sparkline */}
                      <td className="p-4 w-28 h-12">
                        <div className="w-24 h-8">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={sparkData}>
                              <Line 
                                type="monotone" 
                                dataKey="val" 
                                stroke={isUp ? '#10b981' : '#f43f5e'} 
                                strokeWidth={2} 
                                dot={false} 
                                isAnimationActive={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </td>

                      <td className="p-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onSelectPair) onSelectPair(pair.id);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-cyan-500 hover:text-black border border-slate-700 text-cyan-400 text-xs font-bold transition-all flex items-center gap-1 ml-auto"
                        >
                          <span>Trade</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPairs.map(pair => {
            const liveChange = getLiveChange(pair);
            const isUp = liveChange >= 0;
            const sparkData = pair.sparkline.map((val, idx) => ({ idx, val }));
            return (
              <div
                key={pair.id}
                onClick={() => onSelectPair && onSelectPair(pair.id)}
                className="p-5 rounded-2xl cyber-glass border border-slate-800 hover:border-cyan-500/50 cursor-pointer space-y-4 transition-all hover:scale-[1.01]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center font-bold text-cyan-400">
                      {pair.baseSymbol.slice(0, 2)}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{pair.baseSymbol}/{pair.quoteSymbol}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">{pair.category}</span>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-0.5 ${
                    isUp ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}>
                    {isUp ? '+' : ''}{liveChange.toFixed(2)}%
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-mono block">LAST PRICE</span>
                  <span className="text-lg font-extrabold text-white font-mono">{formatPrice(pair)}</span>
                </div>

                <div className="w-full h-12 bg-slate-950/40 rounded-xl p-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparkData}>
                      <Line 
                        type="monotone" 
                        dataKey="val" 
                        stroke={isUp ? '#10b981' : '#f43f5e'} 
                        strokeWidth={2} 
                        dot={false} 
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 font-mono text-[11px]">
                  <span className="text-slate-400">Vol: {pair.volume24h.toLocaleString()}</span>
                  <span className="text-cyan-400 font-bold flex items-center gap-1">
                    <span>Trade Now</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
