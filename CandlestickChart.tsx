import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  RefreshCw, 
  Layers, 
  TrendingUp, 
  Activity,
  Compass,
  Eye,
  Sliders,
  ChevronRight
} from 'lucide-react';
import { ForexCandle, ForexPair, TimeframeId, ActiveTrade } from '../../types/forexTrading';

interface CandlestickChartProps {
  pair: ForexPair;
  candles: ForexCandle[];
  timeframe: TimeframeId;
  onTimeframeChange: (tf: TimeframeId) => void;
  activeTrades: ActiveTrade[];
}

export const CandlestickChart: React.FC<CandlestickChartProps> = ({
  pair,
  candles,
  timeframe,
  onTimeframeChange,
  activeTrades
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 420 });
  const [hoveredCandle, setHoveredCandle] = useState<ForexCandle | null>(null);
  const [crosshairPos, setCrosshairPos] = useState<{ x: number; y: number } | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(35); // number of visible candles
  const [showIndicators, setShowIndicators] = useState(true);
  const [showVolume, setShowVolume] = useState(true);

  const timeframes: { id: TimeframeId; label: string }[] = [
    { id: '1s', label: '1S' },
    { id: '5s', label: '5S' },
    { id: '15s', label: '15S' },
    { id: '1m', label: '1M' },
    { id: '5m', label: '5M' },
    { id: '15m', label: '15M' },
    { id: '1h', label: '1H' },
    { id: '4h', label: '4H' },
    { id: '1d', label: '1D' }
  ];

  // Responsive container measurement
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setDimensions({
            width: Math.max(320, entry.contentRect.width),
            height: Math.max(340, Math.min(520, window.innerHeight * 0.48))
          });
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Visible candles based on zoom
  const visibleCandles = useMemo(() => {
    if (!candles || candles.length === 0) return [];
    return candles.slice(-zoomLevel);
  }, [candles, zoomLevel]);

  // Chart dimensions & paddings
  const padding = { top: 25, right: 72, bottom: 32, left: 12 };
  const chartWidth = dimensions.width - padding.left - padding.right;
  const chartHeight = dimensions.height - padding.top - padding.bottom;
  const volumeHeight = showVolume ? Math.min(65, chartHeight * 0.18) : 0;
  const candleAreaHeight = chartHeight - volumeHeight - (showVolume ? 8 : 0);

  // Min and Max prices in visible window
  const { minPrice, maxPrice, maxVol } = useMemo(() => {
    if (visibleCandles.length === 0) {
      return { 
        minPrice: pair.currentPrice * 0.99, 
        maxPrice: pair.currentPrice * 1.01, 
        maxVol: 100 
      };
    }
    let min = Infinity;
    let max = -Infinity;
    let maxV = 0;

    for (const c of visibleCandles) {
      if (c.low < min) min = c.low;
      if (c.high > max) max = c.high;
      if (c.volume > maxV) maxV = c.volume;
    }

    // Include active trade strike prices in scale if within range
    for (const trade of activeTrades) {
      if (trade.pairId === pair.id) {
        if (trade.entryPrice < min) min = trade.entryPrice;
        if (trade.entryPrice > max) max = trade.entryPrice;
      }
    }

    // Add 5% top/bottom buffer
    const range = Math.max(0.00001, max - min);
    return {
      minPrice: min - (range * 0.06),
      maxPrice: max + (range * 0.06),
      maxVol: maxV || 100
    };
  }, [visibleCandles, activeTrades, pair]);

  const priceToY = (price: number) => {
    const range = maxPrice - minPrice;
    if (range <= 0) return padding.top + candleAreaHeight / 2;
    const ratio = (price - minPrice) / range;
    return padding.top + candleAreaHeight * (1 - ratio);
  };

  const yToPrice = (y: number) => {
    const relativeY = y - padding.top;
    const ratio = 1 - (relativeY / candleAreaHeight);
    return minPrice + ratio * (maxPrice - minPrice);
  };

  const candleCount = visibleCandles.length;
  const candleSlotWidth = chartWidth / Math.max(1, candleCount);
  const candleBarWidth = Math.max(2, Math.min(18, candleSlotWidth * 0.7));

  // Compute EMA 9 and EMA 21
  const { ema9Points, ema21Points } = useMemo(() => {
    if (!showIndicators || visibleCandles.length < 5) {
      return { ema9Points: '', ema21Points: '' };
    }

    const calcEMA = (period: number) => {
      const k = 2 / (period + 1);
      const points: { x: number; y: number }[] = [];
      let ema = visibleCandles[0].close;

      visibleCandles.forEach((c, idx) => {
        ema = (c.close * k) + (ema * (1 - k));
        const x = padding.left + (idx * candleSlotWidth) + (candleSlotWidth / 2);
        const y = priceToY(ema);
        points.push({ x, y });
      });

      return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    };

    return {
      ema9Points: calcEMA(9),
      ema21Points: calcEMA(21)
    };
  }, [visibleCandles, showIndicators, candleSlotWidth, minPrice, maxPrice]);

  // Price Grid Levels (5 horizontal lines)
  const priceGridLevels = useMemo(() => {
    const levels = [];
    const stepCount = 5;
    for (let i = 0; i <= stepCount; i++) {
      const price = minPrice + ((maxPrice - minPrice) * (i / stepCount));
      const y = priceToY(price);
      levels.push({ price, y });
    }
    return levels;
  }, [minPrice, maxPrice, candleAreaHeight]);

  // Time Grid Levels (4-5 vertical labels)
  const timeGridLevels = useMemo(() => {
    if (visibleCandles.length === 0) return [];
    const levels = [];
    const step = Math.max(1, Math.floor(visibleCandles.length / 5));
    for (let i = 0; i < visibleCandles.length; i += step) {
      const candle = visibleCandles[i];
      const x = padding.left + (i * candleSlotWidth) + (candleSlotWidth / 2);
      const date = new Date(candle.timestamp);
      let label = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      if (timeframe === '1d') {
        label = `${date.getMonth() + 1}/${date.getDate()}`;
      }
      levels.push({ x, label });
    }
    return levels;
  }, [visibleCandles, candleSlotWidth, timeframe]);

  // Handle Mouse / Touch Crosshair
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    if (clientX >= padding.left && clientX <= dimensions.width - padding.right &&
        clientY >= padding.top && clientY <= padding.top + candleAreaHeight) {
      const index = Math.floor((clientX - padding.left) / candleSlotWidth);
      const candle = visibleCandles[Math.max(0, Math.min(visibleCandles.length - 1, index))];
      setHoveredCandle(candle || null);
      setCrosshairPos({ x: clientX, y: clientY });
    } else {
      setHoveredCandle(null);
      setCrosshairPos(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredCandle(null);
    setCrosshairPos(null);
  };

  const currentCandle = hoveredCandle || visibleCandles[visibleCandles.length - 1];
  const isUp = currentCandle ? currentCandle.close >= currentCandle.open : true;
  const currentPriceY = priceToY(pair.currentPrice);

  const formatPrice = (val: number) => {
    if (val >= 1000) {
      return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return val.toFixed(pair.priceDecimals);
  };

  return (
    <div 
      id="professional-candlestick-chart-container" 
      ref={containerRef}
      className="relative w-full bg-[#050914] rounded-2xl border border-slate-800/80 shadow-2xl overflow-hidden select-none flex flex-col"
    >
      {/* Top Chart Header & Indicator Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2.5 bg-slate-900/80 border-b border-slate-800/90 text-xs font-mono">
        {/* Timeframe Selector Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[10px] text-slate-500 font-bold uppercase mr-1 hidden sm:inline">TF:</span>
          {timeframes.map(tf => (
            <button
              key={tf.id}
              id={`tf-btn-${tf.id}`}
              type="button"
              onClick={() => onTimeframeChange(tf.id)}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                timeframe === tf.id
                  ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>

        {/* Chart View Actions (Indicators, Zoom, Refresh) */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => setShowIndicators(!showIndicators)}
            className={`px-2 py-1 rounded-lg flex items-center gap-1 border text-[11px] transition-colors ${
              showIndicators
                ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
            title="Toggle EMA 9 & EMA 21 Indicators"
          >
            <Activity className="w-3 h-3 text-cyan-400" />
            <span className="hidden sm:inline">EMA (9/21)</span>
          </button>

          <button
            type="button"
            onClick={() => setShowVolume(!showVolume)}
            className={`px-2 py-1 rounded-lg flex items-center gap-1 border text-[11px] transition-colors ${
              showVolume
                ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
            title="Toggle Volume Bars"
          >
            <Layers className="w-3 h-3 text-cyan-400" />
            <span className="hidden sm:inline">VOL</span>
          </button>

          <div className="flex items-center gap-0.5 bg-slate-950 rounded-lg p-0.5 border border-slate-800">
            <button
              type="button"
              onClick={() => setZoomLevel(prev => Math.min(90, prev + 10))}
              className="p-1 text-slate-400 hover:text-cyan-300 transition-colors"
              title="Zoom Out (More candles)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(prev => Math.max(15, prev - 10))}
              className="p-1 text-slate-400 hover:text-cyan-300 transition-colors"
              title="Zoom In (Fewer candles)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Real-time OHLC Floating Banner */}
      {currentCandle && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 sm:px-4 py-1.5 bg-[#030712]/90 border-b border-slate-800/40 text-[11px] font-mono">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-white tracking-wide">{pair.name}</span>
            <span className="text-[10px] px-1 py-0.2 rounded bg-slate-800 text-cyan-400 uppercase">
              {timeframe}
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-400">
            <span>O: <strong className="text-slate-200">{formatPrice(currentCandle.open)}</strong></span>
            <span>H: <strong className="text-emerald-400">{formatPrice(currentCandle.high)}</strong></span>
            <span>L: <strong className="text-rose-400">{formatPrice(currentCandle.low)}</strong></span>
            <span>C: <strong className={isUp ? 'text-emerald-400' : 'text-rose-400'}>{formatPrice(currentCandle.close)}</strong></span>
            {showVolume && <span>V: <strong className="text-slate-300">{currentCandle.volume.toLocaleString()}</strong></span>}
          </div>

          {showIndicators && (
            <div className="hidden md:flex items-center gap-3 ml-auto text-[10px]">
              <span className="flex items-center gap-1 text-cyan-400">
                <span className="w-2 h-0.5 bg-cyan-400 inline-block"></span> EMA9
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <span className="w-2 h-0.5 bg-amber-400 inline-block"></span> EMA21
              </span>
            </div>
          )}
        </div>
      )}

      {/* SVG Canvas Area */}
      <div className="relative flex-1 w-full overflow-hidden bg-[#040817]">
        <svg
          width={dimensions.width}
          height={dimensions.height - 80}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="cursor-crosshair w-full h-full block"
        >
          <defs>
            {/* Bullish Gradient */}
            <linearGradient id="bullishGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.9" />
            </linearGradient>

            {/* Bearish Gradient */}
            <linearGradient id="bearishGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#e11d48" stopOpacity="0.9" />
            </linearGradient>

            {/* Volume Bullish Gradient */}
            <linearGradient id="volBullish" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
            </linearGradient>

            {/* Volume Bearish Gradient */}
            <linearGradient id="volBearish" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Horizontal Price Grid Lines */}
          {priceGridLevels.map((lvl, idx) => (
            <g key={`price-grid-${idx}`}>
              <line
                x1={padding.left}
                y1={lvl.y}
                x2={dimensions.width - padding.right}
                y2={lvl.y}
                stroke="#1e293b"
                strokeWidth="1"
                strokeDasharray="3 3"
                opacity="0.6"
              />
              <text
                x={dimensions.width - padding.right + 6}
                y={lvl.y + 4}
                fill="#64748b"
                fontSize="10"
                fontFamily="monospace"
              >
                {formatPrice(lvl.price)}
              </text>
            </g>
          ))}

          {/* Vertical Time Grid Lines */}
          {timeGridLevels.map((lvl, idx) => (
            <g key={`time-grid-${idx}`}>
              <line
                x1={lvl.x}
                y1={padding.top}
                x2={lvl.x}
                y2={padding.top + candleAreaHeight}
                stroke="#1e293b"
                strokeWidth="1"
                strokeDasharray="2 4"
                opacity="0.4"
              />
              <text
                x={lvl.x}
                y={dimensions.height - 85}
                fill="#64748b"
                fontSize="9"
                fontFamily="monospace"
                textAnchor="middle"
              >
                {lvl.label}
              </text>
            </g>
          ))}

          {/* Volume Sub-Chart */}
          {showVolume && (
            <g id="volume-subchart">
              <line
                x1={padding.left}
                y1={padding.top + candleAreaHeight + 4}
                x2={dimensions.width - padding.right}
                y2={padding.top + candleAreaHeight + 4}
                stroke="#334155"
                strokeWidth="1"
              />
              {visibleCandles.map((c, i) => {
                const x = padding.left + (i * candleSlotWidth) + (candleSlotWidth / 2);
                const isBull = c.close >= c.open;
                const volHeight = (c.volume / (maxVol || 1)) * (volumeHeight - 8);
                const y = padding.top + candleAreaHeight + 8 + (volumeHeight - 8 - volHeight);

                return (
                  <rect
                    key={`vol-${c.timestamp}-${i}`}
                    x={x - (candleBarWidth / 2)}
                    y={y}
                    width={candleBarWidth}
                    height={Math.max(2, volHeight)}
                    fill={isBull ? 'url(#volBullish)' : 'url(#volBearish)'}
                    stroke={isBull ? '#10b981' : '#f43f5e'}
                    strokeWidth="0.5"
                    opacity="0.8"
                  />
                );
              })}
            </g>
          )}

          {/* Candlesticks (Wicks + Bodies) */}
          <g id="candlestick-series">
            {visibleCandles.map((c, idx) => {
              const xCenter = padding.left + (idx * candleSlotWidth) + (candleSlotWidth / 2);
              const isBull = c.close >= c.open;
              const openY = priceToY(c.open);
              const closeY = priceToY(c.close);
              const highY = priceToY(c.high);
              const lowY = priceToY(c.low);

              const bodyTop = Math.min(openY, closeY);
              const bodyHeight = Math.max(1.5, Math.abs(openY - closeY));
              const color = isBull ? '#10b981' : '#f43f5e';

              return (
                <g key={`candle-${c.timestamp}-${idx}`} className="transition-all duration-75">
                  {/* High - Low Wick */}
                  <line
                    x1={xCenter}
                    y1={highY}
                    x2={xCenter}
                    y2={lowY}
                    stroke={color}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />

                  {/* Candle Body */}
                  <rect
                    x={xCenter - (candleBarWidth / 2)}
                    y={bodyTop}
                    width={candleBarWidth}
                    height={bodyHeight}
                    fill={isBull ? '#059669' : '#e11d48'}
                    stroke={color}
                    strokeWidth="1"
                    rx="1"
                  />
                </g>
              );
            })}
          </g>

          {/* Technical Indicator Curves (EMA 9 & EMA 21) */}
          {showIndicators && (
            <g id="indicators">
              {ema9Points && (
                <path
                  d={ema9Points}
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="1.5"
                  opacity="0.85"
                />
              )}
              {ema21Points && (
                <path
                  d={ema21Points}
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="1.5"
                  opacity="0.85"
                />
              )}
            </g>
          )}

          {/* Active Trades Strike Price Lines */}
          {activeTrades.map(trade => {
            if (trade.pairId !== pair.id) return null;
            const strikeY = priceToY(trade.entryPrice);
            const isCall = trade.direction === 'CALL';
            const strokeColor = isCall ? '#10b981' : '#f43f5e';

            return (
              <g key={`trade-strike-${trade.id}`}>
                {/* Dotted Strike line */}
                <line
                  x1={padding.left}
                  y1={strikeY}
                  x2={dimensions.width - padding.right}
                  y2={strikeY}
                  stroke={strokeColor}
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />

                {/* Strike tag */}
                <g transform={`translate(${dimensions.width - padding.right + 2}, ${strikeY - 9})`}>
                  <rect
                    x="0"
                    y="0"
                    width="66"
                    height="18"
                    rx="4"
                    fill={isCall ? '#064e3b' : '#881337'}
                    stroke={strokeColor}
                    strokeWidth="1"
                  />
                  <text
                    x="33"
                    y="12"
                    fill="#ffffff"
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {isCall ? '▲ CALL' : '▼ PUT'} ${trade.amount}
                  </text>
                </g>
              </g>
            );
          })}

          {/* Live Market Price Pulsing Line & Price Tag */}
          <g id="live-price-pulse-line">
            <line
              x1={padding.left}
              y1={currentPriceY}
              x2={dimensions.width - padding.right}
              y2={currentPriceY}
              stroke="#06b6d4"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
            {/* Pulsing Dot at current tick */}
            <circle
              cx={dimensions.width - padding.right}
              cy={currentPriceY}
              r="4"
              fill="#06b6d4"
            >
              <animate
                attributeName="r"
                values="3;6;3"
                dur="1.5s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="1;0.4;1"
                dur="1.5s"
                repeatCount="indefinite"
              />
            </circle>

            {/* Price Tag Badge on Y-Axis */}
            <g transform={`translate(${dimensions.width - padding.right + 2}, ${currentPriceY - 10})`}>
              <rect
                x="0"
                y="0"
                width="68"
                height="20"
                rx="4"
                fill="#06b6d4"
                stroke="#22d3ee"
                strokeWidth="1"
              />
              <text
                x="34"
                y="14"
                fill="#000000"
                fontSize="10"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
              >
                {formatPrice(pair.currentPrice)}
              </text>
            </g>
          </g>

          {/* Crosshair Cursor Lines */}
          {crosshairPos && (
            <g id="crosshair-overlay" pointerEvents="none">
              {/* Vertical Time Line */}
              <line
                x1={crosshairPos.x}
                y1={padding.top}
                x2={crosshairPos.x}
                y2={padding.top + candleAreaHeight}
                stroke="#94a3b8"
                strokeWidth="0.8"
                strokeDasharray="2 2"
              />

              {/* Horizontal Price Line */}
              <line
                x1={padding.left}
                y1={crosshairPos.y}
                x2={dimensions.width - padding.right}
                y2={crosshairPos.y}
                stroke="#94a3b8"
                strokeWidth="0.8"
                strokeDasharray="2 2"
              />

              {/* Floating Price Tag at Crosshair */}
              <g transform={`translate(${dimensions.width - padding.right + 2}, ${crosshairPos.y - 9})`}>
                <rect
                  x="0"
                  y="0"
                  width="68"
                  height="18"
                  rx="3"
                  fill="#1e293b"
                  stroke="#475569"
                  strokeWidth="1"
                />
                <text
                  x="34"
                  y="12"
                  fill="#f8fafc"
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {formatPrice(yToPrice(crosshairPos.y))}
                </text>
              </g>
            </g>
          )}
        </svg>
      </div>

      {/* Chart Footer Indicator Legend */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-slate-950 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-2 h-2 rounded-sm bg-emerald-500 inline-block"></span> Bullish
          </span>
          <span className="flex items-center gap-1 text-rose-400">
            <span className="w-2 h-2 rounded-sm bg-rose-500 inline-block"></span> Bearish
          </span>
          <span className="hidden sm:flex items-center gap-1 text-cyan-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span> Real-Time Feed
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span>High: <strong className="text-slate-200">{formatPrice(pair.high24h)}</strong></span>
          <span>Low: <strong className="text-slate-200">{formatPrice(pair.low24h)}</strong></span>
        </div>
      </div>
    </div>
  );
};
