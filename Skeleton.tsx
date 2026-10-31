import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'rounded' | 'circular' | 'text';
  animate?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rounded',
  animate = true
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full';
      case 'text':
        return 'rounded h-4';
      case 'rectangular':
        return 'rounded-none';
      case 'rounded':
      default:
        return 'rounded-xl';
    }
  };

  return (
    <div
      className={`relative overflow-hidden bg-slate-900/80 border border-slate-800/60 ${getVariantClass()} ${
        animate ? 'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.8s_infinite] before:bg-gradient-to-r before:from-transparent before:via-cyan-500/[0.08] before:to-transparent' : ''
      } ${className}`}
    />
  );
};

// =========================================================================
// 1. DASHBOARD METRICS SKELETON (4 CARDS)
// =========================================================================
export const DashboardMetricsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="p-5 rounded-2xl bg-[#060b1b] border border-cyan-500/20 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <Skeleton className="w-28 h-3.5 bg-slate-800/80" />
            <Skeleton variant="circular" className="w-6 h-6 bg-cyan-950/40 border-cyan-800/40" />
          </div>
          <Skeleton className="w-36 h-7 bg-slate-800" />
          <div className="flex items-center gap-2 pt-1">
            <Skeleton className="w-20 h-4 bg-slate-800/60 rounded-md" />
            <Skeleton className="w-16 h-3 bg-slate-800/40 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
};

// =========================================================================
// 2. USER DASHBOARD BANNER SKELETON
// =========================================================================
export const DashboardBannerSkeleton: React.FC = () => {
  return (
    <div className="relative rounded-3xl bg-gradient-to-r from-[#09122a] via-[#091938] to-[#07132a] border border-cyan-500/30 p-6 sm:p-8 shadow-2xl overflow-hidden space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="w-24 h-5 rounded-md bg-emerald-950/60 border border-emerald-800/40" />
            <span className="text-slate-600 text-xs font-mono">•</span>
            <Skeleton className="w-32 h-4 rounded bg-cyan-950/60" />
          </div>
          <Skeleton className="w-64 sm:w-80 h-9 rounded-xl bg-slate-800" />
          <div className="flex items-center gap-2">
            <Skeleton className="w-12 h-3.5 bg-slate-800/50" />
            <Skeleton className="w-48 h-5 rounded-lg bg-slate-800/70" />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="w-24 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30" />
          <Skeleton className="w-28 h-10 rounded-xl bg-slate-900 border border-slate-700" />
          <Skeleton className="w-32 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/30" />
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// 3. DASHBOARD CHARTS SKELETON (AREA + PIE)
// =========================================================================
export const DashboardChartsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
      {/* Area Chart Skeleton (2 cols) */}
      <div className="lg:col-span-2 p-6 rounded-3xl bg-[#060b1b] border border-cyan-500/20 space-y-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1.5">
            <Skeleton className="w-44 h-5 rounded-lg bg-slate-800" />
            <Skeleton className="w-60 h-3 rounded bg-slate-800/60" />
          </div>
          <div className="flex gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800">
            {['1D', '1W', '1M', '1Y'].map(t => (
              <Skeleton key={t} className="w-8 h-6 rounded-md bg-slate-800/80" />
            ))}
          </div>
        </div>

        <div className="h-64 w-full flex flex-col justify-end gap-3 pt-4 px-2">
          <div className="w-full flex items-end justify-between gap-2 h-44">
            {[40, 65, 55, 80, 70, 90, 85, 100, 95].map((h, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <Skeleton 
                  className={`w-full bg-cyan-500/15 border-t border-cyan-400/40 rounded-t-lg transition-all`} 
                  style={{ height: `${h}%` } as React.CSSProperties}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between border-t border-slate-800 pt-2">
            {[1, 2, 3, 4, 5, 6, 7].map(i => (
              <Skeleton key={i} className="w-8 h-2.5 bg-slate-800/50" />
            ))}
          </div>
        </div>
      </div>

      {/* Pie / Asset Breakdown Skeleton (1 col) */}
      <div className="p-6 rounded-3xl bg-[#060b1b] border border-cyan-500/20 space-y-4 shadow-xl flex flex-col justify-between">
        <div className="space-y-1.5">
          <Skeleton className="w-36 h-5 rounded-lg bg-slate-800" />
          <Skeleton className="w-48 h-3 rounded bg-slate-800/60" />
        </div>

        <div className="h-44 w-full flex items-center justify-center">
          <div className="relative flex items-center justify-center">
            <Skeleton variant="circular" className="w-32 h-32 border-4 border-cyan-500/20 bg-slate-900" />
            <div className="absolute w-16 h-16 rounded-full bg-[#060b1b] border border-slate-800" />
          </div>
        </div>

        <div className="space-y-2 pt-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton variant="circular" className="w-2.5 h-2.5 bg-cyan-400/40" />
                <Skeleton className="w-24 h-3 bg-slate-800/70" />
              </div>
              <Skeleton className="w-10 h-3 bg-slate-800" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// 4. MARKETS TABLE & BOARD SKELETON
// =========================================================================
interface MarketsSkeletonProps {
  rows?: number;
  showHeader?: boolean;
}

export const MarketsTableSkeleton: React.FC<MarketsSkeletonProps> = ({ 
  rows = 8,
  showHeader = true 
}) => {
  return (
    <div className="rounded-2xl bg-[#060b1b] border border-cyan-500/20 overflow-hidden shadow-xl animate-in fade-in duration-300">
      {showHeader && (
        <div className="p-4 bg-[#09112a] border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-36 h-4 bg-slate-800" />
            <Skeleton className="w-20 h-4 rounded-full bg-cyan-950/60 border border-cyan-800/40" />
          </div>
          <Skeleton className="w-48 h-8 rounded-xl bg-slate-900 border border-slate-700" />
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-[#080f24] border-b border-slate-800 text-[11px] font-mono text-slate-500 uppercase">
              <th className="py-3 px-4">Coin / Asset</th>
              <th className="py-3 px-4 text-right">Price (USD)</th>
              <th className="py-3 px-4 text-right">24h Change</th>
              <th className="py-3 px-4 text-right hidden sm:table-cell">24h High</th>
              <th className="py-3 px-4 text-right hidden sm:table-cell">24h Low</th>
              <th className="py-3 px-4 text-center hidden md:table-cell">Status</th>
              <th className="py-3 px-4 text-center">Trade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 font-mono">
            {Array.from({ length: rows }).map((_, idx) => (
              <tr key={idx} className="hover:bg-cyan-950/10 transition-colors">
                {/* Coin symbol & avatar */}
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <Skeleton variant="rounded" className="w-9 h-9 rounded-xl bg-slate-800/90" />
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Skeleton className="w-14 h-4 bg-slate-700 rounded" />
                        {idx === 0 && (
                          <Skeleton className="w-16 h-3.5 bg-cyan-950/60 rounded" />
                        )}
                      </div>
                      <Skeleton className="w-20 h-2.5 bg-slate-800/60 rounded" />
                    </div>
                  </div>
                </td>

                {/* Price */}
                <td className="py-3.5 px-4 text-right">
                  <div className="flex flex-col items-end gap-1">
                    <Skeleton className="w-20 h-4 bg-slate-700 rounded" />
                    <Skeleton className="w-12 h-2.5 bg-slate-800/60 rounded" />
                  </div>
                </td>

                {/* 24h Change Pill */}
                <td className="py-3.5 px-4 text-right">
                  <div className="inline-flex justify-end">
                    <Skeleton className="w-16 h-5 rounded-md bg-emerald-950/40 border border-emerald-900/30" />
                  </div>
                </td>

                {/* 24h High */}
                <td className="py-3.5 px-4 text-right hidden sm:table-cell">
                  <Skeleton className="w-14 h-3.5 bg-slate-800 ml-auto rounded" />
                </td>

                {/* 24h Low */}
                <td className="py-3.5 px-4 text-right hidden sm:table-cell">
                  <Skeleton className="w-14 h-3.5 bg-slate-800 ml-auto rounded" />
                </td>

                {/* Status */}
                <td className="py-3.5 px-4 text-center hidden md:table-cell">
                  <Skeleton className="w-14 h-4 mx-auto rounded-full bg-slate-800/70" />
                </td>

                {/* Trade Button */}
                <td className="py-3.5 px-4 text-center">
                  <Skeleton className="w-16 h-7 mx-auto rounded-lg bg-cyan-500/20 border border-cyan-500/30" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// =========================================================================
// 5. TOP 100 TITANS HOLDINGS SKELETON
// =========================================================================
export const HoldingsDashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="p-5 rounded-2xl bg-[#060b1b] border border-cyan-500/20 space-y-2">
            <Skeleton className="w-28 h-3.5 bg-slate-800" />
            <Skeleton className="w-36 h-7 bg-slate-700" />
            <Skeleton className="w-24 h-3 bg-slate-800/60" />
          </div>
        ))}
      </div>

      {/* Filter and Tab Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="w-24 h-8 rounded-xl bg-slate-800" />
          ))}
        </div>
        <Skeleton className="w-56 h-8 rounded-xl bg-slate-800/80" />
      </div>

      {/* Table rows */}
      <MarketsTableSkeleton rows={10} showHeader={false} />
    </div>
  );
};

// =========================================================================
// 6. REALTIME PULSE CHART SKELETON
// =========================================================================
export const RealtimePulseChartSkeleton: React.FC = () => {
  return (
    <div className="p-6 rounded-3xl bg-[#060b1b] border border-cyan-500/25 space-y-5 shadow-2xl animate-in fade-in duration-300">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="w-28 h-4 rounded-full bg-cyan-950/60" />
            <Skeleton className="w-3.5 h-3.5 rounded-full bg-emerald-500/40" />
          </div>
          <div className="flex items-baseline gap-3">
            <Skeleton className="w-40 h-8 bg-slate-700 rounded-lg" />
            <Skeleton className="w-20 h-5 bg-emerald-950/60 rounded-md" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {['1s', '1m', '15m', '1h', '24h'].map(t => (
            <Skeleton key={t} className="w-8 h-7 rounded-lg bg-slate-800" />
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-72 w-full flex flex-col justify-end gap-2 pt-4">
        <div className="w-full flex items-end justify-between gap-1.5 h-56">
          {[30, 45, 60, 50, 75, 70, 85, 95, 80, 90, 88, 100, 92, 96, 90].map((h, i) => (
            <Skeleton 
              key={i} 
              className="flex-1 bg-cyan-500/10 border-t border-cyan-400/30 rounded-t-sm" 
              style={{ height: `${h}%` } as React.CSSProperties} 
            />
          ))}
        </div>
        <div className="flex justify-between border-t border-slate-800/80 pt-2">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="w-10 h-2.5 bg-slate-800/40" />
          ))}
        </div>
      </div>
    </div>
  );
};
