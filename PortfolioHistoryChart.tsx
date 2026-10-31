import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  PieChart as PieIcon, 
  Layers, 
  Coins, 
  ShieldCheck, 
  Sparkles,
  ArrowUpRight,
  RefreshCw,
  DollarSign
} from 'lucide-react';
import { exchangeEngine, PortfolioDataPoint } from '../../core/exchangeEngine';
import { blockchainEngine } from '../../core/blockchainEngine';
import { tokenEngine } from '../../core/tokenEngine';
import { TX20Token } from '../../types/blockchain';
import { Skeleton, DashboardChartsSkeleton } from '../common/Skeleton';

interface PortfolioHistoryChartProps {
  walletAddress: string;
  tixaBalance?: number;
  stakedBalance?: number;
}

export const PortfolioHistoryChart: React.FC<PortfolioHistoryChartProps> = ({
  walletAddress,
  tixaBalance = 25.5,
  stakedBalance = 10.0
}) => {
  const [currentPrice, setCurrentPrice] = useState<number>(exchangeEngine.getTixaPrice());
  const [historyData, setHistoryData] = useState<PortfolioDataPoint[]>([]);
  const [tokens, setTokens] = useState<TX20Token[]>([]);
  const [viewMode, setViewMode] = useState<'timeline' | 'allocation'>('timeline');
  const [isLoading, setIsLoading] = useState(true);

  const refresh = () => {
    const p = exchangeEngine.getTixaPrice();
    setCurrentPrice(p);
    setHistoryData(exchangeEngine.getPortfolioHistory(tixaBalance));
    setTokens(tokenEngine.getTokens());
  };

  useEffect(() => {
    refresh();
    const unsubExchange = exchangeEngine.subscribe(refresh);
    const unsubToken = tokenEngine.subscribe(refresh);
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => {
      clearTimeout(timer);
      unsubExchange();
      unsubToken();
    };
  }, [walletAddress, tixaBalance, stakedBalance]);

  // Asset values based on current live TIXA price ($990,000 base ±$10,000 pulse)
  const liquidTixaVal = tixaBalance * currentPrice;
  const stakedTixaVal = stakedBalance * currentPrice;
  const tokensVal = 245000; // Value of secondary TX-20 tokens
  const totalPortfolioValue = liquidTixaVal + stakedTixaVal + tokensVal;

  const formatUSD = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2
    }).format(val);
  };

  // Pie chart data
  const allocationData = [
    { name: 'Liquid TIXA', value: liquidTixaVal, color: '#06b6d4' },
    { name: 'Staked Validator Node', value: stakedTixaVal, color: '#6366f1' },
    { name: 'TX-20 Smart Tokens', value: tokensVal, color: '#10b981' }
  ];

  // Custom Tooltip for Timeline AreaChart
  const CustomTimelineTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: PortfolioDataPoint = payload[0].payload;
      return (
        <div className="p-3.5 rounded-xl bg-slate-950/95 border border-cyan-500/40 shadow-2xl backdrop-blur-md font-mono text-xs space-y-1.5 z-50">
          <div className="flex items-center justify-between gap-4 text-slate-400 text-[11px]">
            <span>Time: {data.timeLabel} UTC</span>
            <span className="text-emerald-400 font-bold">+{data.pnlPercentage}% PnL</span>
          </div>

          <div className="pt-1 border-t border-slate-800">
            <span className="text-slate-400 text-[10px] block">TOTAL NET ASSET VALUE</span>
            <span className="text-base font-extrabold text-white">
              {formatUSD(data.totalValueUsd)}
            </span>
          </div>

          <div className="space-y-0.5 text-[11px] pt-1 text-slate-300">
            <div className="flex justify-between gap-3">
              <span className="text-cyan-400">Liquid Holdings:</span>
              <span>{formatUSD(data.tixaHoldingUsd)}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-indigo-400">Staked Yield:</span>
              <span>{formatUSD(data.stakedValueUsd)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="p-6 rounded-3xl cyber-glass border border-slate-800 space-y-6 shadow-xl relative overflow-hidden animate-in fade-in duration-300">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Skeleton variant="circular" className="w-8 h-8 bg-cyan-950 border border-cyan-800" />
            <div className="space-y-1.5">
              <Skeleton className="w-48 h-4 bg-slate-800" />
              <Skeleton className="w-64 h-3 bg-slate-800/60" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="w-24 h-8 rounded-xl bg-slate-800" />
            <Skeleton className="w-24 h-8 rounded-xl bg-slate-800" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
              <Skeleton className="w-24 h-3 bg-slate-800" />
              <Skeleton className="w-36 h-6 bg-slate-700" />
              <Skeleton className="w-28 h-3 bg-slate-800/60" />
            </div>
          ))}
        </div>

        <div className="w-full h-72 bg-[#050914] rounded-2xl border border-slate-800/90 p-4 flex flex-col justify-end gap-3">
          <div className="w-full flex items-end justify-between gap-2 h-48">
            {[45, 60, 55, 75, 70, 85, 80, 95, 90, 100].map((h, i) => (
              <Skeleton key={i} className="flex-1 bg-emerald-500/10 border-t border-emerald-400/30 rounded-t-sm" style={{ height: `${h}%` } as React.CSSProperties} />
            ))}
          </div>
          <div className="flex justify-between border-t border-slate-800/80 pt-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="w-8 h-2.5 bg-slate-800/50" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-3xl cyber-glass border border-slate-800 space-y-6 shadow-xl relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-black font-bold">
              <Wallet className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-heading">
                Portfolio Net Asset Valuation (NAV)
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Real-time valuation based on live $990,000 TIXA/USDT exchange oracle
              </p>
            </div>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs">
          <button
            type="button"
            onClick={() => setViewMode('timeline')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'timeline'
                ? 'bg-cyan-500 text-black shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>24H Trend</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('allocation')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'allocation'
                ? 'bg-cyan-500 text-black shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            <span>Allocation</span>
          </button>
        </div>
      </div>

      {/* Portfolio Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-cyan-500/20">
          <span className="text-[10px] text-slate-400 block font-semibold">TOTAL PORTFOLIO (USDT)</span>
          <span className="text-2xl font-extrabold text-white block mt-1">
            {formatUSD(totalPortfolioValue)}
          </span>
          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>+14.85% (+{formatUSD(totalPortfolioValue * 0.1485)})</span>
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
          <span className="text-[10px] text-slate-400 block font-semibold">TIXA HOLDINGS ({tixaBalance} TIXA)</span>
          <span className="text-xl font-bold text-cyan-300 block mt-1">
            {formatUSD(liquidTixaVal)}
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">Rate: {formatUSD(currentPrice)}/TIXA</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
          <span className="text-[10px] text-slate-400 block font-semibold">STAKED CONSENSUS ({stakedBalance} TIXA)</span>
          <span className="text-xl font-bold text-indigo-300 block mt-1">
            {formatUSD(stakedTixaVal)}
          </span>
          <span className="text-[11px] text-emerald-400 font-bold block mt-1">APY: 18.4% Compounding</span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-72 bg-[#050914] rounded-2xl border border-slate-800/90 p-4 relative overflow-hidden">
        {viewMode === 'timeline' ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historyData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="50%" stopColor="#06b6d4" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} vertical={false} />
              <XAxis dataKey="timeLabel" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false} 
                orientation="right"
                tickFormatter={(val) => `$${(val / 1000000).toFixed(1)}M`}
              />
              <Tooltip content={<CustomTimelineTooltip />} />
              <Area 
                type="monotone" 
                dataKey="totalValueUsd" 
                stroke="#10b981" 
                strokeWidth={2.5} 
                fill="url(#portfolioGradient)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-around h-full gap-4">
            <div className="w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {allocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [formatUSD(Number(value)), 'Allocation']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3 font-mono text-xs w-full sm:w-60">
              {allocationData.map(item => (
                <div key={item.name} className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-300">{item.name}</span>
                  </div>
                  <span className="font-bold text-white">
                    {((item.value / totalPortfolioValue) * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
