import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ArrowLeftRight, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  Activity, 
  Sparkles, 
  Lock, 
  Unlock, 
  PieChart as PieChartIcon, 
  Coins, 
  Send, 
  Plus, 
  Clock, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight,
  Zap,
  Globe2,
  RefreshCw
} from 'lucide-react';
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
  Cell
} from 'recharts';
import { authEngine } from '../../core/authEngine';
import { blockchainEngine } from '../../core/blockchainEngine';
import { exchangeEngine } from '../../core/exchangeEngine';
import { ledgerEngine } from '../../core/ledgerEngine';
import { currencyConversionEngine } from '../../core/currencyConversionEngine';
import { HashBadge } from '../common/HashBadge';
import { ActiveTab } from '../common/Navbar';
import { DepositModal } from '../wallet/DepositModal';
import { WithdrawModal } from '../wallet/WithdrawModal';
import { HeroMediaSwiper } from '../common/HeroMediaSwiper';
import { BroadcastPopupModal } from '../common/BroadcastPopupModal';
import { 
  Skeleton, 
  DashboardMetricsSkeleton, 
  DashboardBannerSkeleton, 
  DashboardChartsSkeleton 
} from '../common/Skeleton';
import confetti from 'canvas-confetti';
import { useLanguage } from '../../context/LanguageContext';

interface UserDashboardViewProps {
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAuth: (mode: 'login' | 'register' | 'admin') => void;
  onOpenFixDipoz: () => void;
}

export const UserDashboardView: React.FC<UserDashboardViewProps> = ({
  setActiveTab,
  onOpenAuth,
  onOpenFixDipoz
}) => {
  const { t } = useLanguage();
  const [session, setSession] = useState(authEngine.getSession());
  const [account, setAccount] = useState(session ? authEngine.getUserById(session.userId) : null);
  const [pairs, setPairs] = useState(exchangeEngine.getPairs());
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [timeRange, setTimeRange] = useState<'1D' | '1W' | '1M' | '1Y'>('1M');
  const [isLoading, setIsLoading] = useState(true);

  // Real-time balance calculations
  const defaultAddress = session?.walletAddress || 'tx1alexchennoncustodial2050vault99aa';
  const [tixaBalance, setTixaBalance] = useState<number>(() => {
    return blockchainEngine.getBalance(defaultAddress);
  });

  const refreshUserData = () => {
    const s = authEngine.getSession();
    setSession(s);
    if (s) {
      setAccount(authEngine.getUserById(s.userId));
      setTixaBalance(blockchainEngine.getBalance(s.walletAddress));
    }
    setPairs([...exchangeEngine.getPairs()]);
  };

  useEffect(() => {
    refreshUserData();
    const unsubAuth = authEngine.subscribe(refreshUserData);
    const unsubChain = blockchainEngine.subscribe(refreshUserData);
    const unsubEx = exchangeEngine.subscribe(refreshUserData);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);

    return () => {
      clearTimeout(timer);
      unsubAuth();
      unsubChain();
      unsubEx();
    };
  }, []);

  const tixaPrice = pairs.find(p => p.id === 'TIXA_USDT')?.lastPrice || 142.85;
  const lockedTixa = 125.00; // Locked in staking / open limit orders
  const availableTixa = Math.max(0, tixaBalance - lockedTixa);
  const usdxBalance = 10000.00;
  const wnisiBalance = 0.45;
  const wsaraBalance = 3.20;
  const nisiPrice = currencyConversionEngine.getCryptoRate('NISI') || 64280.50;
  const saraPrice = currencyConversionEngine.getCryptoRate('SARA') || 3485.20;

  // Calculate Total Portfolio Value in USD
  const totalPortfolioUSD = 
    (tixaBalance * tixaPrice) + 
    usdxBalance + 
    (wnisiBalance * nisiPrice) + 
    (wsaraBalance * saraPrice);

  const todayProfitUSD = totalPortfolioUSD * 0.0682;
  const todayProfitPercent = 6.82;

  // Portfolio Chart Data
  const chartData = [
    { time: 'Aug 01', value: totalPortfolioUSD * 0.82 },
    { time: 'Aug 05', value: totalPortfolioUSD * 0.86 },
    { time: 'Aug 10', value: totalPortfolioUSD * 0.84 },
    { time: 'Aug 15', value: totalPortfolioUSD * 0.91 },
    { time: 'Aug 20', value: totalPortfolioUSD * 0.95 },
    { time: 'Aug 24', value: totalPortfolioUSD * 0.98 },
    { time: 'Today', value: totalPortfolioUSD }
  ];

  // Asset Distribution Data
  const assetData = [
    { name: 'TIXA Native', value: tixaBalance * tixaPrice, color: '#06b6d4' },
    { name: 'USDX Stable', value: usdxBalance, color: '#10b981' },
    { name: 'WNISI (Layer 1)', value: wnisiBalance * nisiPrice, color: '#f59e0b' },
    { name: 'WSARA (Layer 1)', value: wsaraBalance * saraPrice, color: '#8b5cf6' }
  ];

  const username = account?.name || session?.email.split('@')[0] || 'Web3 Commander';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-in fade-in duration-300">
      {isLoading ? (
        <div className="space-y-8 animate-in fade-in duration-200">
          <DashboardBannerSkeleton />
          <DashboardMetricsSkeleton />
          <DashboardChartsSkeleton />
        </div>
      ) : (
        <>
          {/* 1. TOP SECTION: WELCOME BACK BANNER */}
          <div className="relative rounded-3xl bg-gradient-to-r from-[#09122a] via-[#091938] to-[#07132a] border border-cyan-500/30 p-6 sm:p-8 shadow-2xl overflow-hidden">
            <div className="absolute -top-10 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-400 text-xs font-mono font-bold border border-emerald-800">
                    ACTIVE ACCOUNT
                  </span>
                  <span className="text-slate-500 text-xs font-mono">•</span>
                  <span className="text-cyan-400 text-xs font-mono">NON-CUSTODIAL VAULT</span>
                </div>
                
                <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-heading uppercase tracking-wide">
                  Welcome Back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">{username}</span>
                </h1>

                <div className="flex items-center gap-3 text-xs font-mono text-slate-300">
                  <span className="text-slate-500">Vault:</span>
                  <HashBadge hash={session?.walletAddress || defaultAddress} type="address" />
                </div>
              </div>

              {/* Action Button Bar */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  id="dashboard-deposit-btn"
                  onClick={() => setIsDepositOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs shadow-lg shadow-cyan-500/25 hover:scale-[1.02] transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('btn_deposit', 'Deposit')}</span>
                </button>

                <button
                  type="button"
                  id="dashboard-withdraw-btn"
                  onClick={() => setIsWithdrawOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white font-semibold text-xs transition-all"
                >
                  <ArrowUpRight className="w-4 h-4 text-cyan-400" />
                  <span>{t('btn_withdraw', 'Withdraw')}</span>
                </button>

                <button
                  type="button"
                  id="dashboard-trade-btn"
                  onClick={() => setActiveTab('exchange')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 font-mono text-xs transition-all"
                >
                  <ArrowLeftRight className="w-4 h-4 text-cyan-400" />
                  <span>{t('btn_swap', 'Instant Trade')}</span>
                </button>

                <button
                  type="button"
                  id="dashboard-fixdipoz-btn"
                  onClick={onOpenFixDipoz}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-emerald-400 to-blue-500 text-black font-black text-xs shadow-lg shadow-cyan-500/30 hover:scale-[1.02] transition-all animate-pulse"
                >
                  <Zap className="w-4 h-4 fill-black" />
                  <span>FIXDIPOZ VIP MINING (33 BOX) ACTIVE</span>
                </button>
              </div>
            </div>
          </div>

          {/* Dynamic Front UI Media Swiper (Auto-Swapping 3-5 Pictures / Videos / Boxes) */}
          <HeroMediaSwiper 
            onNavigateTab={(tab) => setActiveTab(tab as ActiveTab)} 
            onOpenDeposit={() => setIsDepositOpen(true)}
          />

          <BroadcastPopupModal 
            onNavigateTab={(tab) => setActiveTab(tab as ActiveTab)}
            onOpenDeposit={() => setIsDepositOpen(true)}
          />

          {/* 2. PORTFOLIO & BALANCE METRICS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Portfolio Value */}
            <div className="p-5 rounded-2xl bg-[#060b1b] border border-cyan-500/25 space-y-2 shadow-lg">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>{t('dash_total_balance', 'TOTAL PORTFOLIO VALUE')}</span>
                <PieChartIcon className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                ${totalPortfolioUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 font-semibold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+${todayProfitUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} (+{todayProfitPercent}%) Today</span>
              </div>
            </div>

            {/* Native Coin Balance (TIXA) */}
            <div className="p-5 rounded-2xl bg-[#060b1b] border border-cyan-500/25 space-y-2 shadow-lg">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>NATIVE COIN (TIXA)</span>
                <Zap className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-cyan-300 font-mono">
                {tixaBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-sm text-cyan-400/80">TIXA</span>
              </div>
              <div className="text-xs font-mono text-slate-400">
                ≈ ${(tixaBalance * tixaPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
              </div>
            </div>

            {/* Available Balance */}
            <div className="p-5 rounded-2xl bg-[#060b1b] border border-cyan-500/25 space-y-2 shadow-lg">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>AVAILABLE BALANCE</span>
                <Unlock className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                {availableTixa.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-sm text-emerald-500/80">TIXA</span>
              </div>
              <div className="text-xs font-mono text-slate-400">
                Instant Unrestricted Spending
              </div>
            </div>

            {/* Locked / Staking Balance */}
            <div className="p-5 rounded-2xl bg-[#060b1b] border border-cyan-500/25 space-y-2 shadow-lg">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>LOCKED / STAKED</span>
                <Lock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">
                {lockedTixa.toFixed(2)} <span className="text-sm text-amber-400/80">TIXA</span>
              </div>
              <div className="text-xs font-mono text-amber-400/90 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Yielding 14.8% APY Validator Staking</span>
              </div>
            </div>
          </div>

          {/* 3. CHARTS SECTION: PORTFOLIO GROWTH & ASSET ALLOCATION */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Growth Area Chart (2 Cols) */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-[#060b1b] border border-cyan-500/20 space-y-4 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white font-heading">
                    Portfolio Performance
                  </h3>
                  <p className="text-xs text-slate-400">
                    Net asset value across on-chain tokens and stable deposits
                  </p>
                </div>

                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-mono">
                  {(['1D', '1W', '1M', '1Y'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setTimeRange(tab)}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        timeRange === tab
                          ? 'bg-cyan-500 text-black font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-64 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="dashboardAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: '#64748b' }} domain={['auto', 'auto']} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#090e24', borderColor: '#06b6d4', borderRadius: '12px' }}
                      formatter={(val: number) => [`$${val.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 'Portfolio Net Value']}
                    />
                    <Area type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#dashboardAreaGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Asset Distribution (1 Col) */}
            <div className="p-6 rounded-3xl bg-[#060b1b] border border-cyan-500/20 space-y-4 shadow-xl">
              <h3 className="text-lg font-bold text-white font-heading">
                Asset Breakdown
              </h3>
              <p className="text-xs text-slate-400">
                Vault distribution by asset class
              </p>

              <div className="h-44 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={assetData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {assetData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#090e24', borderColor: '#06b6d4', borderRadius: '12px' }}
                      formatter={(val: number) => [`$${val.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 'Value']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 pt-2 text-xs font-mono">
                {assetData.map(item => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-300">{item.name}</span>
                    </div>
                    <span className="text-white font-bold">
                      {((item.value / totalPortfolioUSD) * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* 4. QUICK ACTION SHORTCUTS & ECOSYSTEM HUB */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          onClick={() => setActiveTab('exchange')}
          className="p-5 rounded-2xl bg-gradient-to-br from-[#08132e] to-[#04091a] border border-cyan-500/30 hover:border-cyan-400/60 cursor-pointer group transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <ArrowLeftRight className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
              0% MAKER FEE
            </span>
          </div>
          <h4 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
            Trade on Order-Book Exchange
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            Execute Limit, Market, and Stop orders directly against decentralized liquidity.
          </p>
        </div>

        <div 
          onClick={() => setActiveTab('markets')}
          className="p-5 rounded-2xl bg-gradient-to-br from-[#08132e] to-[#04091a] border border-cyan-500/30 hover:border-cyan-400/60 cursor-pointer group transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              33+ PAIRS
            </span>
          </div>
          <h4 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
            Explore All Markets
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            Track real-time 24h highs, lows, market caps, and volatility trends.
          </p>
        </div>

        <div 
          onClick={() => setActiveTab('holdings')}
          className="p-5 rounded-2xl bg-gradient-to-br from-[#08132e] to-[#04091a] border border-cyan-500/30 hover:border-cyan-400/60 cursor-pointer group transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <Globe2 className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-mono text-purple-400 bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
              TOP 100 TITANS
            </span>
          </div>
          <h4 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
            Global Treasuries & 2050 Goals
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            Inspect reserves held by Apple, BlackRock, NVIDIA, Temasek, and worldwide commentary.
          </p>
        </div>
      </div>

      {/* Deposit Modal */}
      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        onSuccess={() => {
          refreshUserData();
          setIsDepositOpen(false);
        }}
      />

      {/* Withdraw Modal */}
      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        onSuccess={() => {
          refreshUserData();
          setIsWithdrawOpen(false);
        }}
      />
    </div>
  );
};
