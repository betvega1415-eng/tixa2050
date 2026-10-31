import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine,
  BarChart,
  Bar
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Activity, 
  Radio, 
  Maximize2, 
  Sparkles, 
  ShieldCheck, 
  Flame,
  Clock,
  ArrowUpRight,
  Sliders,
  DollarSign
} from 'lucide-react';
import { exchangeEngine } from '../../core/exchangeEngine';
import { RealtimeTick } from '../../types/exchange';
import { Skeleton, RealtimePulseChartSkeleton } from '../common/Skeleton';

interface RealtimePricePulseChartProps {
  onTradeClick?: () => void;
}

export const RealtimePricePulseChart: React.FC<RealtimePricePulseChartProps> = ({ onTradeClick }) => {
  const [ticks, setTicks] = useState<RealtimeTick[]>(exchangeEngine.getRealtimeTicks());
  const [currentPrice, setCurrentPrice] = useState<number>(exchangeEngine.getTixaPrice());
  const [lastDelta, setLastDelta] = useState<number>(exchangeEngine.getLastTickDelta());
  const [cycleCountdown, setCycleCountdown] = useState<number>(exchangeEngine.getCycleCountdown());
  const [timeframe, setTimeframe] = useState<'1s' | '1m' | '15m' | '1h' | '24h'>('1s');
  const [chartType, setChartType] = useState<'area' | 'volume'>('area');
  const [isPulseGlow, setIsPulseGlow] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleUpdate = () => {
      const newTicks = exchangeEngine.getRealtimeTicks();
      const newPrice = exchangeEngine.getTixaPrice();
      const newDelta = exchangeEngine.getLastTickDelta();
      
      setTicks(newTicks);
      setCurrentPrice(newPrice);
      setLastDelta(newDelta);
      setCycleCountdown(exchangeEngine.getCycleCountdown());
      
      // Trigger flash glow
      setIsPulseGlow(true);
      const timer = setTimeout(() => setIsPulseGlow(false), 350);
      return () => clearTimeout(timer);
    };

    handleUpdate();
    const unsub = exchangeEngine.subscribe(handleUpdate);
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => {
      clearTimeout(timer);
      unsub();
    };
  }, []);

  const isUp = lastDelta >= 0;
  const tixaUsdtPair = exchangeEngine.getPair('TIXA_USDT');
  const high24h = tixaUsdtPair?.high24h || 1045000;
  const low24h = tixaUsdtPair?.low24h || 942000;
  const volume24h = tixaUsdtPair?.volume24h || 148500000;

  // Format currency with standard commas
  const formatUSD = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2
    }).format(val);
  };

  // Custom Tooltip for Recharts
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: RealtimeTick = payload[0].payload;
      const isTickPositive = (data.delta || 0) >= 0;
      return (
        <div className="p-3.5 rounded-xl bg-slate-950/95 border border-cyan-500/40 shadow-2xl backdrop-blur-md font-mono text-xs space-y-1.5 z-50">
          <div className="flex items-center justify-between gap-4 text-slate-400 text-[11px]">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>{data.timeLabel}</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
              1s Pulse
            </span>
          </div>

          <div className="pt-1 border-t border-slate-800/80">
            <span className="text-slate-400 text-[10px] block">TIXA/USDT RATE</span>
            <span className="text-base font-extrabold text-white">
              {formatUSD(data.price)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 text-[11px]">
            <span className="text-slate-400">1s Tick Delta:</span>
            <span className={`font-bold flex items-center gap-0.5 ${isTickPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isTickPositive ? '+' : ''}{formatUSD(data.delta)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 text-[11px]">
            <span className="text-slate-400">Vol Tick:</span>
            <span className="text-cyan-300 font-bold">{data.volume} TIXA</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Calculate dynamic min/max for YAxis domain
  const priceValues = ticks.map(t => t.price);
  const minTick = priceValues.length > 0 ? Math.min(...priceValues) : 900000;
  const maxTick = priceValues.length > 0 ? Math.max(...priceValues) : 1050000;
  const yDomainMin = Math.floor((minTick - 15000) / 10000) * 10000;
  const yDomainMax = Math.ceil((maxTick + 15000) / 10000) * 10000;

  if (isLoading) {
    return <RealtimePulseChartSkeleton />;
  }

  return (
    <div className="p-6 rounded-3xl cyber-glass border border-cyan-500/30 relative overflow-hidden space-y-6 shadow-[0_0_50px_rgba(6,182,212,0.08)]">
      {/* Background ambient glow pulse */}
      <div 
        className={`absolute -top-24 -right-24 w-96 h-96 rounded-full blur-[140px] pointer-events-none transition-all duration-700 ${
          isUp ? 'bg-emerald-500/15' : 'bg-rose-500/15'
        }`} 
      />

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-black font-extrabold shadow-lg shadow-cyan-500/30">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white font-heading tracking-wide">
                  TIXA / USDT Real-Time Price Stream
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 text-[10px] font-mono font-bold flex items-center gap-1.5 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  <span>1s LIVE PULSE</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Controls & Quick Actions */}
        <div className="flex items-center gap-3">
          {/* 1-Minute 33-Market Cycle Countdown Indicator */}
          <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs font-mono flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            <span className="text-slate-400">33-Mkt Cycle:</span>
            <span className="text-cyan-300 font-bold">{cycleCountdown}s</span>
          </div>

          {onTradeClick && (
            <button
              type="button"
              onClick={onTradeClick}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-bold text-xs font-mono shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1.5"
            >
              <span>Instant Trade</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Hero Live Metric Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1 font-mono">
        {/* Main Live Price with Pulse Effect */}
        <div className={`p-4 rounded-2xl bg-slate-950/70 border transition-all duration-300 ${
          isPulseGlow 
            ? (isUp ? 'border-emerald-400 bg-emerald-950/20 shadow-lg shadow-emerald-500/10' : 'border-rose-400 bg-rose-950/20 shadow-lg shadow-rose-500/10')
            : 'border-slate-800'
        }`}>
          <span className="text-[10px] text-slate-400 block font-semibold">LIVE TIXA PRICE (USDT)</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatUSD(currentPrice)}
            </span>
          </div>
          <span className={`text-xs font-bold flex items-center gap-1 mt-1 ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>{isUp ? '+' : ''}{formatUSD(lastDelta)} (1s)</span>
          </span>
        </div>

        {/* 24h High */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
          <span className="text-[10px] text-slate-400 block font-semibold">24H HIGH</span>
          <span className="text-xl sm:text-2xl font-bold text-white block mt-1">
            {formatUSD(high24h)}
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">Peak intraday high</span>
        </div>

        {/* 24h Low */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
          <span className="text-[10px] text-slate-400 block font-semibold">24H LOW</span>
          <span className="text-xl sm:text-2xl font-bold text-slate-200 block mt-1">
            {formatUSD(low24h)}
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">Intraday support floor</span>
        </div>

        {/* 24h Volume */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
          <span className="text-[10px] text-slate-400 block font-semibold">24H TIXA VOLUME</span>
          <span className="text-xl sm:text-2xl font-bold text-cyan-300 block mt-1">
            ${(volume24h / 1000000).toFixed(1)}M USDT
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">Across 33 Global Pairs</span>
        </div>
      </div>

      {/* Chart View Toolbar */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 font-mono text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 text-[11px] mr-1 hidden sm:inline">Interval:</span>
          {(['1s', '1m', '15m', '1h', '24h'] as const).map(tf => (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                timeframe === tf
                  ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tf.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setChartType(chartType === 'area' ? 'volume' : 'area')}
            className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-cyan-400 text-xs font-mono flex items-center gap-1"
          >
            <Sliders className="w-3 h-3 text-cyan-400" />
            <span>{chartType === 'area' ? 'Price Wave' : 'Volume Flow'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Recharts Canvas */}
      <div className="w-full h-80 bg-[#050914] rounded-2xl border border-slate-800/90 p-4 relative overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={ticks} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="tixaPricePulseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.45} />
                  <stop offset="60%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="tixaGreenGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} vertical={false} />

              <XAxis 
                dataKey="timeLabel" 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                interval="preserveStartEnd"
                minTickGap={30}
              />

              <YAxis 
                domain={[yDomainMin, yDomainMax]} 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                orientation="right"
                tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
              />

              <Tooltip content={<CustomTooltip />} />

              <ReferenceLine 
                y={990000} 
                stroke="#06b6d4" 
                strokeDasharray="4 4" 
                opacity={0.6}
                label={{ value: 'Base Peg: $990,000', fill: '#22d3ee', fontSize: 10, position: 'insideTopLeft' }} 
              />

              <Area 
                type="monotone" 
                dataKey="price" 
                stroke="#06b6d4" 
                strokeWidth={2.5} 
                fill="url(#tixaPricePulseGradient)"
                isAnimationActive={false}
                dot={false}
                activeDot={{ r: 6, fill: '#38bdf8', stroke: '#ffffff', strokeWidth: 2 }}
              />
            </AreaChart>
          ) : (
            <BarChart data={ticks} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} vertical={false} />
              <XAxis dataKey="timeLabel" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} orientation="right" />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="volume" 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]} 
                isAnimationActive={false} 
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Live Stream Footnote */}
      <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>Active Pulse Node: <span className="text-slate-200">validator-us-east-1 // 3ms Ping</span></span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-cyan-400 font-bold">100% In-Memory State Synchronized</span>
        </div>
      </div>
    </div>
  );
};
