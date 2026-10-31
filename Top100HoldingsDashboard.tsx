import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  TrendingUp, 
  TrendingDown, 
  Search, 
  ShieldCheck, 
  Coins, 
  DollarSign, 
  Globe2, 
  Layers, 
  Zap, 
  Activity, 
  Flame, 
  Sparkles, 
  Filter, 
  ArrowUpRight, 
  CheckCircle2, 
  Lock, 
  PieChart as PieIcon, 
  MessageSquare,
  ChevronRight,
  ExternalLink,
  Info,
  Radio,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis
} from 'recharts';
import { treasuryEngine } from '../../core/treasuryEngine';
import { exchangeEngine } from '../../core/exchangeEngine';
import { CompanyHolding, SectorType, TreasuryStrategy } from '../../types/treasury';
import { WorldCommentsFeed } from './WorldCommentsFeed';
import { HashBadge } from '../common/HashBadge';
import { Skeleton, HoldingsDashboardSkeleton } from '../common/Skeleton';

interface Top100HoldingsDashboardProps {
  onTradeClick?: () => void;
  onOpenAuth?: (mode: 'login' | 'register' | 'admin') => void;
}

export const Top100HoldingsDashboard: React.FC<Top100HoldingsDashboardProps> = ({
  onTradeClick,
  onOpenAuth
}) => {
  const [holdings, setHoldings] = useState<CompanyHolding[]>(treasuryEngine.getHoldings());
  const [metrics, setMetrics] = useState(treasuryEngine.getMetrics());
  const [currentTixaPrice, setCurrentTixaPrice] = useState(exchangeEngine.getCurrentTixaPrice());
  const [activeTab, setActiveTab] = useState<'top100' | 'top33' | 'sectors' | 'world_comments'>('top100');
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters & Search
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const [selectedCountry, setSelectedCountry] = useState<string>('ALL');
  const [selectedStrategy, setSelectedStrategy] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'rank' | 'holdings' | 'value' | 'pnl24h' | 'pnlTotal'>('rank');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  
  // Company Inspection Modal
  const [selectedCompany, setSelectedCompany] = useState<CompanyHolding | null>(null);

  const refresh = () => {
    setHoldings([...treasuryEngine.getHoldings()]);
    setMetrics(treasuryEngine.getMetrics());
    setCurrentTixaPrice(exchangeEngine.getCurrentTixaPrice());
  };

  useEffect(() => {
    refresh();
    const unsubTreasury = treasuryEngine.subscribe(refresh);
    const unsubExchange = exchangeEngine.subscribe(refresh);
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => {
      clearTimeout(timer);
      unsubTreasury();
      unsubExchange();
    };
  }, []);

  const sectorsList: Array<{ id: string; label: string }> = [
    { id: 'ALL', label: 'All Sectors' },
    { id: 'Tech Giants', label: 'Tech Giants' },
    { id: 'Sovereign Wealth & Central Banks', label: 'Sovereign & Central Banks' },
    { id: 'Asset Management & Hedge Funds', label: 'Asset Managers & Funds' },
    { id: 'Banking & Financial Institutions', label: 'Banking & Institutions' },
    { id: 'AI & Semiconductor', label: 'AI & Semiconductor' },
    { id: 'Energy & Conglomerates', label: 'Energy & Conglomerates' },
    { id: 'Crypto & Web3 Native', label: 'Crypto & Web3 Native' }
  ];

  const countriesList = [
    { id: 'ALL', label: 'Global (All Countries)' },
    { id: 'United States', label: '🇺🇸 United States' },
    { id: 'Singapore', label: '🇸🇬 Singapore' },
    { id: 'United Arab Emirates', label: '🇦🇪 UAE (Dubai/Abu Dhabi)' },
    { id: 'Switzerland', label: '🇨🇭 Switzerland' },
    { id: 'Japan', label: '🇯🇵 Japan' },
    { id: 'China', label: '🇨🇳 China' },
    { id: 'United Kingdom', label: '🇬🇧 United Kingdom' },
    { id: 'Germany', label: '🇩🇪 Germany' },
    { id: 'France', label: '🇫🇷 France' },
    { id: 'Saudi Arabia', label: '🇸🇦 Saudi Arabia' }
  ];

  // Base list based on Top 33 or Top 100 tab
  const baseList = activeTab === 'top33' ? holdings.slice(0, 33) : holdings;

  // Filter
  const filteredHoldings = baseList.filter(c => {
    const matchesSector = selectedSector === 'ALL' || c.sector === selectedSector;
    const matchesCountry = selectedCountry === 'ALL' || c.country === selectedCountry;
    const matchesStrategy = selectedStrategy === 'ALL' || c.treasuryStrategy === selectedStrategy;
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.sector.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSector && matchesCountry && matchesStrategy && matchesSearch;
  });

  // Sort
  const sortedHoldings = [...filteredHoldings].sort((a, b) => {
    let comp = 0;
    if (sortBy === 'rank') comp = a.rank - b.rank;
    else if (sortBy === 'holdings') comp = b.tixaHeld - a.tixaHeld;
    else if (sortBy === 'value') comp = b.totalValueUsd - a.totalValueUsd;
    else if (sortBy === 'pnl24h') comp = b.pnl24hPercent - a.pnl24hPercent;
    else if (sortBy === 'pnlTotal') comp = b.pnlTotalPercent - a.pnlTotalPercent;

    return sortOrder === 'asc' ? comp : -comp;
  });

  // Format currency helpers
  const formatUsd = (val: number) => {
    if (val >= 1e12) return `$${(val / 1e12).toFixed(2)}T`;
    if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
    if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
    return `$${val.toLocaleString()}`;
  };

  // Pie chart data for sectors
  const sectorDataMap: { [key: string]: number } = {};
  holdings.forEach(c => {
    sectorDataMap[c.sector] = (sectorDataMap[c.sector] || 0) + c.tixaHeld;
  });
  const sectorChartData = Object.keys(sectorDataMap).map(sector => ({
    name: sector,
    value: sectorDataMap[sector]
  }));
  const SECTOR_COLORS = ['#06b6d4', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#f43f5e'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-16">
      {/* 1. TOP STATS HERO BANNER: LIVE TIXA CORPORATE TREASURY INDEX */}
      <div className="p-6 sm:p-8 rounded-3xl cyber-glass border border-cyan-500/30 relative overflow-hidden space-y-6">
        {/* Glow accents */}
        <div className="absolute top-0 right-1/4 w-96 h-48 bg-cyan-500/10 blur-[90px] rounded-full pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/90 border border-cyan-500/40 text-xs font-mono text-cyan-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <span>TOP 100 WORLD COMPANIES TIXA HOLDINGS DASHBOARD</span>
              <span className="text-slate-600">|</span>
              <span className="text-emerald-400 font-bold">PROOFS VERIFIED ON-CHAIN</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-heading tracking-tight">
              Top 100 Global Treasuries & Sovereign Reserves
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-mono max-w-3xl leading-relaxed">
              Live tracking of 100 multinational conglomerates, sovereign wealth funds, and banking institutions holding TIXA coin in cold vaults. Real-time 24h & 1-minute up/down portfolio shifts.
            </p>
          </div>

          {/* Quick Actions & Live TIXA Price Ticker */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-3 rounded-2xl bg-slate-950/80 border border-cyan-500/40 font-mono text-right">
              <span className="text-[10px] text-slate-400 block font-semibold">TIXA BASE ORACLE PRICE</span>
              <span className="text-lg sm:text-xl font-black text-cyan-300 block">
                ${currentTixaPrice.toLocaleString()} USD
              </span>
              <span className="text-[10px] text-emerald-400 font-bold flex items-center justify-end gap-1">
                <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span>Live ±1s Pulse</span>
              </span>
            </div>

            <button
              type="button"
              onClick={() => treasuryEngine.triggerManualSync()}
              className="px-4 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400 text-xs font-mono text-cyan-300 hover:text-white flex items-center gap-2 transition-all shadow-md"
            >
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Simulate Live Shift</span>
            </button>
          </div>
        </div>

        {/* 4 Metric Bento Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-2 font-mono">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-cyan-500/25 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>TOTAL COINS HELD</span>
              <Coins className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {metrics.totalTixaInTreasuries.toLocaleString()} <span className="text-xs text-cyan-400">TIXA</span>
            </p>
            <p className="text-[11px] text-cyan-400">{metrics.percentOfCirculatingSupply}% of Circulating Supply</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-emerald-500/25 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>TREASURY VALUE USD</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-emerald-300 tracking-tight">
              {formatUsd(metrics.totalTreasuryValueUsd)}
            </p>
            <p className="text-[11px] text-emerald-400">Across Top 100 Companies</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-indigo-500/25 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>LIVE UP / DOWN PULSE</span>
              <Activity className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="flex items-center gap-3 pt-0.5">
              <span className="flex items-center gap-1 text-emerald-400 font-bold text-lg">
                <TrendingUp className="w-4 h-4" />
                <span>{metrics.liveUpCount} UP</span>
              </span>
              <span className="text-slate-600">/</span>
              <span className="flex items-center gap-1 text-rose-400 font-bold text-lg">
                <TrendingDown className="w-4 h-4" />
                <span>{metrics.liveDownCount} DOWN</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Real-time Balance Shifts</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-amber-500/25 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>TOP 24H GAINER</span>
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-lg font-bold text-white truncate">
              {metrics.topGainer24h.name}
            </p>
            <p className="text-[11px] text-amber-400 font-bold">
              +{metrics.topGainer24h.gainPercent.toFixed(2)}% ({metrics.topGainer24h.ticker})
            </p>
          </div>
        </div>
      </div>

      {/* 2. PRIMARY VIEW SWITCHER TABS */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            type="button"
            id="tab-top100-btn"
            onClick={() => setActiveTab('top100')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all ${
              activeTab === 'top100'
                ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/25'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Top 100 Companies (Full List)</span>
          </button>

          <button
            type="button"
            id="tab-top33-btn"
            onClick={() => setActiveTab('top33')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all ${
              activeTab === 'top33'
                ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/25'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Top 33 Titans & Sovereigns</span>
          </button>

          <button
            type="button"
            id="tab-sectors-btn"
            onClick={() => setActiveTab('sectors')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all ${
              activeTab === 'sectors'
                ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/25'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <PieIcon className="w-4 h-4" />
            <span>Sector Analytics</span>
          </button>

          <button
            type="button"
            id="tab-comments-btn"
            onClick={() => setActiveTab('world_comments')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all ${
              activeTab === 'world_comments'
                ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/25'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>World People Comments & Goals</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 text-[10px]">
              LIVE
            </span>
          </button>
        </div>

        {/* View mode toggle (Table / Grid) for company views */}
        {(activeTab === 'top100' || activeTab === 'top33') && (
          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg font-bold ${
                  viewMode === 'table' ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                Table View
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-lg font-bold ${
                  viewMode === 'grid' ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                Cards View
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. CONDITIONAL RENDER BY ACTIVE TAB */}
      {activeTab === 'world_comments' ? (
        <WorldCommentsFeed onTradeClick={onTradeClick} />
      ) : activeTab === 'sectors' ? (
        /* Sector Analytics View */
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sector Pie Breakdown */}
            <div className="p-6 rounded-3xl cyber-glass border border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-white font-heading flex items-center gap-2">
                <PieIcon className="w-5 h-5 text-cyan-400" />
                <span>TIXA Treasury Distribution by Sector</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Aggregate TIXA coin allocation across global industries.
              </p>

              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sectorChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={105}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {sectorChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={SECTOR_COLORS[index % SECTOR_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0];
                          return (
                            <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono shadow-xl space-y-1">
                              <p className="font-bold text-white">{data.name}</p>
                              <p className="text-cyan-400">
                                {Number(data.value).toLocaleString()} TIXA
                              </p>
                              <p className="text-emerald-400">
                                {formatUsd(Number(data.value) * currentTixaPrice)} USD
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Sector Legend */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-slate-800">
                {sectorChartData.map((sec, idx) => (
                  <div key={sec.name} className="flex items-center justify-between p-2 rounded-xl bg-slate-950/40">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: SECTOR_COLORS[idx % SECTOR_COLORS.length] }}></span>
                      <span className="text-slate-300 truncate">{sec.name}</span>
                    </div>
                    <span className="font-bold text-cyan-300">{sec.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top 10 Holders Bar Comparison */}
            <div className="p-6 rounded-3xl cyber-glass border border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-white font-heading flex items-center gap-2">
                <Building2 className="w-5 h-5 text-cyan-400" />
                <span>Top 10 Institutional Giants Comparison</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Holdings in TIXA Coins (Rank 1 to 10).
              </p>

              <div className="w-full h-80 font-mono text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={holdings.slice(0, 10)} layout="vertical" margin={{ left: 50, right: 30, top: 10, bottom: 10 }}>
                    <XAxis type="number" stroke="#64748b" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <YAxis dataKey="ticker" type="category" stroke="#64748b" />
                    <RechartsTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload as CompanyHolding;
                          return (
                            <div className="p-3 rounded-xl bg-slate-900 border border-cyan-500/40 text-xs font-mono shadow-xl space-y-1">
                              <p className="font-bold text-white">{item.name} ({item.ticker})</p>
                              <p className="text-cyan-400">{item.tixaHeld.toLocaleString()} TIXA</p>
                              <p className="text-emerald-400">{formatUsd(item.totalValueUsd)} USD</p>
                              <p className="text-slate-400">{item.country} • {item.sector}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="tixaHeld" fill="#06b6d4" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Top 100 or Top 33 Companies List */
        <div className="space-y-6">
          {/* Filter, Search & Sort Bar */}
          <div className="space-y-4 p-5 rounded-2xl cyber-glass border border-slate-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search 100 companies (e.g. Apple, TSMC, BlackRock)..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 text-xs"
                />
              </div>

              {/* Sector Dropdown */}
              <div>
                <select
                  value={selectedSector}
                  onChange={e => setSelectedSector(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 text-xs"
                >
                  {sectorsList.map(s => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>

              {/* Country Dropdown */}
              <div>
                <select
                  value={selectedCountry}
                  onChange={e => setSelectedCountry(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 text-xs"
                >
                  {countriesList.map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 text-xs"
                >
                  <option value="rank">Sort: Rank (#1 to #100)</option>
                  <option value="holdings">Sort: Holdings (TIXA Coins)</option>
                  <option value="value">Sort: Total Value ($ USD)</option>
                  <option value="pnl24h">Sort: 24h PnL Up / Down</option>
                  <option value="pnlTotal">Sort: Total Return %</option>
                </select>

                <button
                  type="button"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-cyan-400 font-bold hover:bg-slate-800"
                  title="Toggle Ascending / Descending"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>

            {/* Quick Strategy Filters */}
            <div className="flex flex-wrap items-center gap-2 font-mono text-xs pt-1 border-t border-slate-800/60">
              <span className="text-slate-400 text-[11px] flex items-center gap-1">
                <Filter className="w-3 h-3 text-cyan-400" />
                <span>Strategy:</span>
              </span>
              {['ALL', 'Accumulate', 'HODL', 'Staking'].map(strat => (
                <button
                  key={strat}
                  type="button"
                  onClick={() => setSelectedStrategy(strat)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
                    selectedStrategy === strat
                      ? 'bg-cyan-500 text-black'
                      : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {strat === 'ALL' ? 'All Strategies' : strat}
                </button>
              ))}
              <span className="ml-auto text-slate-400 text-[11px]">
                Showing {sortedHoldings.length} of {activeTab === 'top33' ? '33' : '100'} Treasuries
              </span>
            </div>
          </div>

          {/* Table View */}
          {isLoading ? (
            <HoldingsDashboardSkeleton />
          ) : viewMode === 'table' ? (
            <div className="overflow-hidden rounded-2xl cyber-glass border border-slate-800 shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#060b17] border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="p-4">Rank & Company</th>
                      <th className="p-4">Country & Sector</th>
                      <th className="p-4">TIXA Held</th>
                      <th className="p-4">USD Value</th>
                      <th className="p-4">Live 24h Shift</th>
                      <th className="p-4">Total Return %</th>
                      <th className="p-4">Strategy</th>
                      <th className="p-4">7D Trend</th>
                      <th className="p-4 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {sortedHoldings.map(company => {
                      const isUp = company.pnl24hPercent >= 0;
                      const sparkData = company.sparkline.map((val, idx) => ({ idx, val }));
                      return (
                        <tr
                          key={company.id}
                          onClick={() => setSelectedCompany(company)}
                          className="hover:bg-slate-900/50 transition-colors group cursor-pointer"
                        >
                          {/* Rank & Company */}
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-slate-500 text-xs w-6 text-right">
                                #{company.rank}
                              </span>
                              <div 
                                className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs text-white border border-slate-700 shadow-sm"
                                style={{ backgroundColor: company.logoBg }}
                              >
                                {company.logoText}
                              </div>
                              <div>
                                <span className="font-bold text-white block text-sm group-hover:text-cyan-300 transition-colors">
                                  {company.name}
                                </span>
                                <span className="text-[10px] text-cyan-400">{company.ticker}</span>
                              </div>
                            </div>
                          </td>

                          {/* Country & Sector */}
                          <td className="p-4">
                            <div className="space-y-0.5">
                              <span className="text-slate-200 block text-xs">
                                {company.flagEmoji} {company.country}
                              </span>
                              <span className="text-[10px] text-slate-400 block truncate max-w-[140px]">
                                {company.sector}
                              </span>
                            </div>
                          </td>

                          {/* TIXA Held */}
                          <td className="p-4 font-bold text-white text-sm">
                            <div>
                              <span>{company.tixaHeld.toLocaleString()}</span>
                              <span className="text-cyan-400 text-xs ml-1 font-normal">TIXA</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-normal">
                              Avg ${company.avgEntryPrice.toLocaleString()}
                            </span>
                          </td>

                          {/* USD Value */}
                          <td className="p-4 font-bold text-emerald-300 text-sm">
                            {formatUsd(company.totalValueUsd)}
                          </td>

                          {/* Live 24h Shift with animated glow */}
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                              isUp 
                                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800 shadow-[0_0_10px_rgba(16,185,129,0.15)]' 
                                : 'bg-rose-950/80 text-rose-300 border border-rose-800 shadow-[0_0_10px_rgba(244,63,94,0.15)]'
                            }`}>
                              {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                              <span>{isUp ? '+' : ''}{company.pnl24hPercent.toFixed(2)}%</span>
                            </span>
                          </td>

                          {/* Total Return % */}
                          <td className="p-4 text-slate-200 font-semibold">
                            <span className="text-emerald-400">
                              +{company.pnlTotalPercent.toFixed(2)}%
                            </span>
                          </td>

                          {/* Strategy */}
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              company.treasuryStrategy === 'Accumulate'
                                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                                : company.treasuryStrategy === 'Staking'
                                ? 'bg-purple-950 text-purple-300 border border-purple-700'
                                : 'bg-slate-900 text-slate-300 border border-slate-700'
                            }`}>
                              {company.treasuryStrategy}
                            </span>
                          </td>

                          {/* Mini Sparkline */}
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

                          {/* Details Button */}
                          <td className="p-4 text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCompany(company);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-cyan-500 hover:text-black border border-slate-700 text-cyan-400 text-xs font-bold transition-all flex items-center gap-1 ml-auto"
                            >
                              <span>Audit</span>
                              <ChevronRight className="w-3 h-3" />
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
              {sortedHoldings.map(company => {
                const isUp = company.pnl24hPercent >= 0;
                const sparkData = company.sparkline.map((val, idx) => ({ idx, val }));
                return (
                  <div
                    key={company.id}
                    onClick={() => setSelectedCompany(company)}
                    className="p-5 rounded-2xl cyber-glass border border-slate-800 hover:border-cyan-500/50 cursor-pointer space-y-4 transition-all hover:scale-[1.01]"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs text-white border border-slate-700 shadow-sm"
                          style={{ backgroundColor: company.logoBg }}
                        >
                          {company.logoText}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{company.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono">#{company.rank}</span>
                          </div>
                          <span className="text-[11px] text-cyan-400 font-mono">
                            {company.flagEmoji} {company.ticker} • {company.country}
                          </span>
                        </div>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-0.5 ${
                        isUp ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}>
                        {isUp ? '+' : ''}{company.pnl24hPercent.toFixed(2)}%
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-950/60 font-mono text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">TIXA COINS</span>
                        <span className="text-sm font-bold text-white">{company.tixaHeld.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">PORTFOLIO VALUE</span>
                        <span className="text-sm font-bold text-emerald-300">{formatUsd(company.totalValueUsd)}</span>
                      </div>
                    </div>

                    <div className="w-full h-10 bg-slate-950/40 rounded-xl p-1">
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
                      <span className="text-slate-400">{company.sector}</span>
                      <span className="text-cyan-400 font-bold flex items-center gap-1">
                        <span>View Vault</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 4. COMPANY DETAILS AUDIT MODAL */}
      {selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-2xl rounded-3xl cyber-glass-glow border border-cyan-500/50 p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedCompany(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-4">
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-base text-white border border-slate-700 shadow-xl"
                style={{ backgroundColor: selectedCompany.logoBg }}
              >
                {selectedCompany.logoText}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700 font-mono font-bold">
                    RANK #{selectedCompany.rank} GLOBAL TREASURY
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {selectedCompany.flagEmoji} {selectedCompany.country}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white font-heading mt-1">
                  {selectedCompany.name} ({selectedCompany.ticker})
                </h3>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-cyan-500/30 space-y-0.5">
                <span className="text-[10px] text-slate-400 block">TIXA COINS HELD</span>
                <span className="text-base font-bold text-white">{selectedCompany.tixaHeld.toLocaleString()} TIXA</span>
                <span className="text-[10px] text-cyan-400 block">Cold Storage Vault</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-emerald-500/30 space-y-0.5">
                <span className="text-[10px] text-slate-400 block">PORTFOLIO VALUE</span>
                <span className="text-base font-bold text-emerald-300">{formatUsd(selectedCompany.totalValueUsd)}</span>
                <span className="text-[10px] text-emerald-400 block">USD Benchmark</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-indigo-500/30 space-y-0.5">
                <span className="text-[10px] text-slate-400 block">TOTAL RETURN (PnL)</span>
                <span className="text-base font-bold text-emerald-400">+{selectedCompany.pnlTotalPercent.toFixed(2)}%</span>
                <span className="text-[10px] text-slate-400 block">Avg: ${selectedCompany.avgEntryPrice.toLocaleString()}</span>
              </div>
            </div>

            {/* On-Chain Proof-of-Reserves Audit */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="font-bold flex items-center gap-1.5 text-cyan-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>On-Chain Cold Storage Proof-of-Reserves</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">VERIFIED</span>
              </div>

              <div className="space-y-1 text-slate-400">
                <span className="text-[10px] uppercase">Vault Address Hash</span>
                <HashBadge hash={selectedCompany.vaultAddress} type="address" />
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-800">
                <div>
                  <span className="text-slate-500 block">Treasury Strategy:</span>
                  <span className="text-slate-200 font-bold">{selectedCompany.treasuryStrategy}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Staking Status:</span>
                  <span className="text-purple-400 font-bold">
                    {selectedCompany.stakingYieldApy ? `${selectedCompany.stakingYieldApy}% APY Active` : 'Non-Staked'}
                  </span>
                </div>
              </div>
            </div>

            {/* Corporate Strategic Notes */}
            <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 space-y-1">
              <span className="text-[10px] text-cyan-400 uppercase font-mono font-bold">
                Institutional Thesis & Ecosystem Purpose:
              </span>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {selectedCompany.notes}
              </p>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedCompany(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 font-bold"
              >
                Close Audit
              </button>

              {onTradeClick && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCompany(null);
                    onTradeClick();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold text-xs font-mono shadow-md"
                >
                  Trade TIXA Pairs Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
