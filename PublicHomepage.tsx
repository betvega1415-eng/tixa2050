import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  ShieldCheck, 
  Cpu, 
  Lock, 
  Compass, 
  Wallet, 
  ArrowLeftRight, 
  Coins, 
  Terminal, 
  FileText, 
  CheckCircle2, 
  Layers, 
  Globe2, 
  Flame, 
  Server, 
  Activity, 
  ChevronRight,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  ExternalLink,
  Code2,
  Building2,
  LayoutDashboard,
  History,
  UserCheck,
  Award,
  LayoutGrid,
  List,
  Calculator,
  Percent
} from 'lucide-react';
import { blockchainEngine } from '../../core/blockchainEngine';
import { authEngine } from '../../core/authEngine';
import { Block, Transaction, NetworkStats, Validator } from '../../types/blockchain';
import { HashBadge } from '../common/HashBadge';
import { ActiveTab } from '../common/Navbar';
import { RealtimePricePulseChart } from '../dashboard/RealtimePricePulseChart';
import { LiveMarketsBoard } from '../dashboard/LiveMarketsBoard';
import { HeroMediaSwiper } from '../common/HeroMediaSwiper';
import { BroadcastPopupModal } from '../common/BroadcastPopupModal';
import { CompanyCorporateModal, COMPANY_BUTTONS, CorporateTabType } from './CompanyCorporateModal';

interface PublicHomepageProps {
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAuth: (mode: 'login' | 'register' | 'admin') => void;
  onOpenFixDipoz: () => void;
}

export const PublicHomepage: React.FC<PublicHomepageProps> = ({
  setActiveTab,
  onOpenAuth,
  onOpenFixDipoz
}) => {
  const [stats, setStats] = useState<NetworkStats>(blockchainEngine.getStats());
  const [recentBlocks, setRecentBlocks] = useState<Block[]>([]);
  const [validators, setValidators] = useState<Validator[]>(blockchainEngine.getValidators());
  const [validatorViewMode, setValidatorViewMode] = useState<'cards' | 'table'>('cards');
  const [isWhitepaperOpen, setIsWhitepaperOpen] = useState(false);
  const [corporateModalTab, setCorporateModalTab] = useState<CorporateTabType | null>(null);
  const [activeRoadmapPhase, setActiveRoadmapPhase] = useState<number>(4);
  const [userSession, setUserSession] = useState(authEngine.getSession());

  // Staking Rewards Calculator State
  const [stakeAmount, setStakeAmount] = useState<number>(5000);
  const averageNetworkApy = 32.5; // 32.5% average network yield
  const estimated30DayReturn = (stakeAmount * (averageNetworkApy / 100) * (30 / 365));
  const estimatedAnnualReturn = (stakeAmount * (averageNetworkApy / 100));

  useEffect(() => {
    const update = () => {
      setStats(blockchainEngine.getStats());
      setRecentBlocks(blockchainEngine.getBlocks().slice(-6).reverse());
      setValidators(blockchainEngine.getValidators());
      setUserSession(authEngine.getSession());
    };
    update();
    const unsubChain = blockchainEngine.subscribe(update);
    const unsubAuth = authEngine.subscribe(update);
    return () => {
      unsubChain();
      unsubAuth();
    };
  }, []);

  const topActiveValidators = [...validators]
    .filter(v => v.status === 'ACTIVE')
    .sort((a, b) => (b.stakedAmount + b.delegatedAmount) - (a.stakedAmount + a.delegatedAmount))
    .slice(0, 5);

  const top5TotalStaked = topActiveValidators.reduce(
    (sum, v) => sum + v.stakedAmount + v.delegatedAmount,
    0
  );
  const top5AvgUptime = topActiveValidators.length > 0
    ? topActiveValidators.reduce((sum, v) => sum + v.uptime, 0) / topActiveValidators.length
    : 100;

  const roadmapPhases = [
    { phase: 1, title: 'Architecture & Primitives', status: 'COMPLETED', desc: 'Mathematical consensus models, 7-layer modular boundary specification, cryptographic hash hierarchy.' },
    { phase: 2, title: 'Blockchain Prototype', status: 'COMPLETED', desc: 'In-memory state engine, deterministic Merkle root trees, non-custodial address derivation.' },
    { phase: 3, title: 'Consensus & Node Network', status: 'COMPLETED', desc: 'Validator node cluster deployment, transaction mempool, gas meter, and block packing engine.' },
    { phase: 4, title: 'Security & Independent Audits', status: 'COMPLETED', desc: 'Formal verification of BFT consensus, smart contract bytecode, and hardware cryptographic vaults.' },
    { phase: 5, title: 'Quantum Mainnet Deployment', status: 'ACTIVE', desc: 'Genesis block deployment with 250M TIXA hard-cap, high-throughput trading, and 21 institutional validator nodes.' },
    { phase: 6, title: 'Institutional Gateway Suite', status: 'ACTIVE', desc: 'Global multi-currency fiat gateways (bKash, Nagad, Stripe, SEPA), unified ledger accounting, and TX-20 tokens.' },
    { phase: 7, title: 'Cross-Chain Atomic Swaps', status: 'UPCOMING', desc: 'Trustless decentralized liquidity bridges to NISI, SARA, and MUN networks.' },
    { phase: 8, title: 'Top 100 Global Treasuries', status: 'UPCOMING', desc: 'Institutional sovereign wealth integration, automated liquidity buybacks, and carbon-neutral consensus.' },
    { phase: 9, title: 'Autonomous Agent AI Layer', status: 'UPCOMING', desc: 'Machine-to-machine high-frequency micropayments and autonomous algorithmic trading nodes.' },
    { phase: 10, title: 'Universal Global Settlement 2050', status: 'UPCOMING', desc: 'Global borderless financial standard with sub-second finality and zero transaction fee architecture.' }
  ];

  return (
    <div className="w-full space-y-20 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20">
        {/* Background Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-500/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[300px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Status Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-xs font-mono text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span>TIXA NETWORK PROTOCOL v2.4 // 3.0s FINALITY</span>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-400 font-semibold">MAINNET PRODUCTION LIVE</span>
          </div>

          {/* Main Titles */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white font-heading leading-tight">
              TIXA<span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">PAY</span>
            </h1>
            <p className="text-xl sm:text-2xl font-medium text-slate-200 font-heading">
              A Future-Ready Digital Infrastructure Network
            </p>
            <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Engineered with high-throughput BFT validator consensus, client-side non-custodial cryptography, and the TX-20 token standard for next-generation global financial settlement.
            </p>
          </div>

          {/* CTA Action Buttons System (Requirement 21) */}
          <div className="pt-2 space-y-4">
            {userSession ? (
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  id="hero-my-dashboard-btn"
                  onClick={() => setActiveTab('dashboard')}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-500 text-black font-bold text-sm tracking-wide shadow-lg shadow-cyan-500/25 hover:shadow-cyan-400/40 hover:scale-[1.02] transition-all"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>My Dashboard</span>
                </button>

                <button
                  type="button"
                  id="hero-my-wallet-btn"
                  onClick={() => setActiveTab('wallet')}
                  className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 text-slate-200 font-semibold text-sm transition-all"
                >
                  <Wallet className="w-4 h-4 text-cyan-400" />
                  <span>My Wallet</span>
                </button>

                <button
                  type="button"
                  id="hero-trade-now-btn"
                  onClick={() => setActiveTab('exchange')}
                  className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 text-slate-200 font-semibold text-sm transition-all"
                >
                  <ArrowLeftRight className="w-4 h-4 text-emerald-400" />
                  <span>Trade Now</span>
                </button>

                <button
                  type="button"
                  id="hero-transactions-btn"
                  onClick={() => setActiveTab('transactions')}
                  className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 text-slate-200 font-semibold text-sm transition-all"
                >
                  <History className="w-4 h-4 text-purple-400" />
                  <span>Transactions</span>
                </button>

                <button
                  type="button"
                  id="hero-security-btn"
                  onClick={() => setActiveTab('profile')}
                  className="flex items-center gap-2 px-4 py-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-mono transition-all"
                >
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>Security Vault</span>
                </button>

                <button
                  type="button"
                  id="hero-fixdipoz-btn"
                  onClick={onOpenFixDipoz}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 via-emerald-400 to-blue-500 text-black font-black text-sm tracking-wide shadow-lg shadow-cyan-500/30 hover:scale-[1.02] transition-all animate-pulse"
                >
                  <Zap className="w-4 h-4 fill-black" />
                  <span>FIXDIPOZ VIP MINING (33 BOX) ACTIVE</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Primary Row */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    id="hero-connect-wallet-btn"
                    onClick={() => onOpenAuth('login')}
                    className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-500 text-black font-bold text-sm tracking-wide shadow-lg shadow-cyan-500/25 hover:shadow-cyan-400/40 hover:scale-[1.02] transition-all"
                  >
                    <Wallet className="w-4 h-4" />
                    <span>Connect Wallet</span>
                  </button>

                  <button
                    type="button"
                    id="hero-create-account-btn"
                    onClick={() => onOpenAuth('register')}
                    className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 font-semibold text-sm transition-all shadow-md shadow-cyan-950"
                  >
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Create Account</span>
                  </button>

                  <button
                    type="button"
                    id="hero-start-trading-btn"
                    onClick={() => setActiveTab('exchange')}
                    className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 text-slate-200 font-semibold text-sm transition-all"
                  >
                    <ArrowLeftRight className="w-4 h-4 text-emerald-400" />
                    <span>Start Trading</span>
                  </button>

                  <button
                    type="button"
                    id="hero-view-markets-btn"
                    onClick={() => setActiveTab('markets')}
                    className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 text-slate-200 font-semibold text-sm transition-all"
                  >
                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                    <span>View Markets</span>
                  </button>

                  <button
                    type="button"
                    id="hero-guest-fixdipoz-btn"
                    onClick={onOpenFixDipoz}
                    className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 via-emerald-400 to-blue-500 text-black font-black text-sm tracking-wide shadow-lg shadow-cyan-500/30 hover:scale-[1.02] transition-all animate-pulse"
                  >
                    <Zap className="w-4 h-4 fill-black" />
                    <span>FIXDIPOZ VIP MINING (33 BOX) ACTIVE</span>
                  </button>
                </div>

                {/* Secondary Quick Jump Row */}
                <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => setActiveTab('wallet')}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-cyan-300 transition-colors"
                  >
                    [OPEN WALLET]
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('explorer')}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-cyan-300 transition-colors"
                  >
                    [EXPLORE BLOCKCHAIN]
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('transactions')}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-cyan-300 transition-colors"
                  >
                    [VIEW TRANSACTIONS]
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsWhitepaperOpen(true)}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-blue-300 transition-colors"
                  >
                    [WHITEPAPER & SPECS]
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Dynamic Front UI Hero Media Swiper (Auto-Swapping 3-5 Pictures / Videos / Boxes) */}
          <div className="pt-4 max-w-5xl mx-auto">
            <HeroMediaSwiper 
              onNavigateTab={(tab) => setActiveTab(tab as ActiveTab)} 
            />
          </div>

          <BroadcastPopupModal 
            onNavigateTab={(tab) => setActiveTab(tab as ActiveTab)} 
          />

          {/* Quick Metrics Bento Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 max-w-5xl mx-auto">
            <div className="p-4 rounded-2xl cyber-glass border border-cyan-500/20 text-left space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>TOTAL SUPPLY</span>
                <Coins className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-white font-mono tracking-tight">
                250,000,000
              </p>
              <p className="text-[11px] text-cyan-400 font-mono">TIXA (Fixed Hard Cap)</p>
            </div>

            <div className="p-4 rounded-2xl cyber-glass border border-cyan-500/20 text-left space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>CIRCULATING</span>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-white font-mono tracking-tight">
                {stats.circulatingSupply.toLocaleString()}
              </p>
              <p className="text-[11px] text-emerald-400 font-mono">66.0% In Circulation</p>
            </div>

            <div className="p-4 rounded-2xl cyber-glass border border-cyan-500/20 text-left space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>PEAK THROUGHPUT</span>
                <Activity className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-white font-mono tracking-tight">
                12,500 <span className="text-sm text-slate-400">TPS</span>
              </p>
              <p className="text-[11px] text-blue-400 font-mono">3.0s Block Finality</p>
            </div>

            <div className="p-4 rounded-2xl cyber-glass border border-cyan-500/20 text-left space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>BURNED FEES</span>
                <Flame className="w-3.5 h-3.5 text-rose-400" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-white font-mono tracking-tight">
                {stats.totalBurned.toFixed(2)}
              </p>
              <p className="text-[11px] text-rose-400 font-mono">TIXA Deflated On-Chain</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. REAL-TIME TIXA PRICE PULSE & 33 MARKETS LIVE DASHBOARD */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <RealtimePricePulseChart onTradeClick={() => setActiveTab('exchange')} />
        <LiveMarketsBoard onSelectPair={(pairId) => setActiveTab('exchange')} />
      </section>

      {/* 3. ECOSYSTEM SUITE CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-heading">
            TIXAPAY Ecosystem Suite
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            A unified modular architecture consisting of interconnected institutional applications.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card: Top 100 World Companies Holdings */}
          <div 
            onClick={() => setActiveTab('dashboard')}
            className="group cursor-pointer p-6 rounded-2xl cyber-glass-card hover:border-cyan-500/50 space-y-4 relative overflow-hidden border border-cyan-500/30"
          >
            <div className="absolute top-3 right-3">
              <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 text-[10px] font-mono font-bold animate-pulse">
                TOP 100 LIVE
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building2 className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white font-heading">Top 100 World Treasuries</h3>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Live dashboard of the Top 100 conglomerates, central banks, and funds holding TIXA. Real-time Up/Down shifts and World People comments.
              </p>
            </div>
            <div className="text-[11px] font-mono text-cyan-400/80 flex items-center gap-1.5">
              <span>Inspect 100 Companies & Discussion</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>

          {/* Card 1: Wallet */}
          <div 
            onClick={() => setActiveTab('wallet')}
            className="group cursor-pointer p-6 rounded-2xl cyber-glass-card hover:border-cyan-500/50 space-y-4"
          >
            <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wallet className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white font-heading">TIXA Wallet</h3>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Non-custodial cryptographic vault with BIP-39 mnemonic phrase generation, multi-account isolation, and hardware passkey protection.
              </p>
            </div>
            <div className="text-[11px] font-mono text-cyan-400/80 flex items-center gap-1.5">
              <span>Launch Wallet Engine</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>

          {/* Card 2: Explorer */}
          <div 
            onClick={() => setActiveTab('explorer')}
            className="group cursor-pointer p-6 rounded-2xl cyber-glass-card hover:border-cyan-500/50 space-y-4"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-950/80 border border-blue-500/40 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Compass className="w-6 h-6 text-blue-400" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white font-heading">TIXA Explorer</h3>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Real-time block inspector, deterministic Merkle root validation, transaction timeline, and validator performance analytics.
              </p>
            </div>
            <div className="text-[11px] font-mono text-blue-400/80 flex items-center gap-1.5">
              <span>Inspect On-Chain Ledger</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>

          {/* Card 3: Exchange */}
          <div 
            onClick={() => setActiveTab('exchange')}
            className="group cursor-pointer p-6 rounded-2xl cyber-glass-card hover:border-cyan-500/50 space-y-4"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ArrowLeftRight className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white font-heading">TIXA Exchange</h3>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Institutional order-book matching engine with live visual depth chart, limit & market order execution, and trading pair charts.
              </p>
            </div>
            <div className="text-[11px] font-mono text-emerald-400/80 flex items-center gap-1.5">
              <span>Open Trading Terminal</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>

          {/* Card 4: TX-20 Token Platform */}
          <div 
            onClick={() => setActiveTab('tokens')}
            className="group cursor-pointer p-6 rounded-2xl cyber-glass-card hover:border-cyan-500/50 space-y-4"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Coins className="w-6 h-6 text-amber-400" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white font-heading">TX-20 Token Platform</h3>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Smart asset factory enabling developers to mint, deploy, burn, and manage verifiable decentralized tokens on the TIXA ledger.
              </p>
            </div>
            <div className="text-[11px] font-mono text-amber-400/80 flex items-center gap-1.5">
              <span>Deploy TX-20 Asset</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>

          {/* Card 5: Developer Portal & 15 Steps */}
          <div 
            onClick={() => setActiveTab('developer')}
            className="group cursor-pointer p-6 rounded-2xl cyber-glass-card hover:border-cyan-500/50 space-y-4"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Terminal className="w-6 h-6 text-purple-400" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white font-heading">Developer Portal</h3>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Interactive Node JSON-RPC console, SDK code snippets (TS, Python, cURL), and complete 15-Step Blueprint Architecture Guide.
              </p>
            </div>
            <div className="text-[11px] font-mono text-purple-400/80 flex items-center gap-1.5">
              <span>Explore Dev Sandbox & Specs</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. LIVE BLOCKS & TRANSACTIONS STREAM */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-white font-heading flex items-center gap-2">
              <Server className="w-5 h-5 text-cyan-400" />
              <span>Real-Time Consensus Telemetry</span>
            </h2>
            <p className="text-xs text-slate-400">
              Live blocks generated by active validator nodes every ~3-4 seconds.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('explorer')}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>View All Blocks</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentBlocks.map(blk => (
            <div 
              key={blk.hash}
              onClick={() => setActiveTab('explorer')}
              className="p-4 rounded-xl cyber-glass border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-cyan-400 font-mono">
                    BLOCK #{blk.header.height}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-mono">
                    {blk.txCount} TXs
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  {new Date(blk.header.timestamp).toLocaleTimeString()}
                </span>
              </div>

              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Block Hash:</span>
                  <HashBadge hash={blk.hash} type="block" />
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Validator:</span>
                  <HashBadge hash={blk.header.validatorAddress} type="address" />
                </div>
                <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-800/60">
                  <span>Reward / Burn:</span>
                  <span className="text-slate-200">
                    <span className="text-emerald-400">+{blk.rewardTIXA.toFixed(2)} TIXA</span>
                    <span className="text-slate-600"> / </span>
                    <span className="text-rose-400">-{blk.burnedTIXA.toFixed(4)}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. TOP 5 ACTIVE VALIDATORS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-[11px] font-mono text-cyan-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span>BFT PROOF-OF-STAKE CONSENSUS</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white font-heading flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 text-cyan-400" />
              <span>Top 5 Active Validators</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Consensus validator nodes actively sealing blocks, securing ledger transactions, and staking TIXA on the TIXAPAY Quantum Mainnet.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Switcher */}
            <div className="flex items-center p-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
              <button
                type="button"
                onClick={() => setValidatorViewMode('cards')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                  validatorViewMode === 'cards'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Card Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setValidatorViewMode('table')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                  validatorViewMode === 'table'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Table Ledger View"
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Table</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('wallet')}
              className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Coins className="w-3.5 h-3.5 text-cyan-400" />
              <span>Stake TIXA</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('explorer')}
              className="px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white text-xs font-mono flex items-center gap-1 transition-all"
            >
              <span>All Validators</span>
              <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
            </button>
          </div>
        </div>

        {/* Validator Telemetry Metric Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl cyber-glass border border-slate-800/80 text-left space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>TOP 5 COMBINED STAKE</span>
              <Coins className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <p className="text-base sm:text-lg font-bold text-cyan-300 font-mono">
              {top5TotalStaked.toLocaleString()} <span className="text-xs text-slate-400">TIXA</span>
            </p>
            <p className="text-[10px] text-slate-500 font-mono">
              {((top5TotalStaked / (stats.totalStaked || 1)) * 100).toFixed(1)}% of network stake
            </p>
          </div>

          <div className="p-3.5 rounded-xl cyber-glass border border-slate-800/80 text-left space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>AVG CONSENSUS UPTIME</span>
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-base sm:text-lg font-bold text-emerald-400 font-mono">
              {top5AvgUptime.toFixed(2)}%
            </p>
            <p className="text-[10px] text-emerald-500/80 font-mono">
              Zero slashing penalty events
            </p>
          </div>

          <div className="p-3.5 rounded-xl cyber-glass border border-slate-800/80 text-left space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>ACTIVE VALIDATORS</span>
              <Server className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <p className="text-base sm:text-lg font-bold text-white font-mono">
              {stats.activeValidators} <span className="text-xs text-slate-400">Nodes Online</span>
            </p>
            <p className="text-[10px] text-blue-400/80 font-mono">
              Tendermint BFT 3.0s Epoch
            </p>
          </div>

          <div className="p-3.5 rounded-xl cyber-glass border border-slate-800/80 text-left space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>CONSENSUS REWARDS</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <p className="text-base sm:text-lg font-bold text-amber-300 font-mono">
              +{topActiveValidators.reduce((s, v) => s + v.totalRewards, 0).toFixed(2)} <span className="text-xs text-slate-400">TIXA</span>
            </p>
            <p className="text-[10px] text-amber-500/80 font-mono">
              Cumulative validator block yield
            </p>
          </div>
        </div>

        {/* STAKING REWARDS CALCULATOR */}
        <div className="p-6 sm:p-8 rounded-2xl cyber-glass border border-cyan-500/30 bg-gradient-to-br from-slate-950/90 via-slate-900/80 to-cyan-950/30 shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
                <Calculator className="w-3.5 h-3.5 text-cyan-400" />
                <span>INTERACTIVE YIELD ESTIMATOR</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white font-heading">
                Staking Rewards Calculator
              </h3>
              <p className="text-xs text-slate-400">
                Input your TIXA stake to project your estimated 30-day and annual earnings at the current average network yield.
              </p>
            </div>
            <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5">
              <div className="text-right">
                <p className="text-[10px] text-slate-400 font-mono uppercase">Average Network Yield</p>
                <p className="text-lg font-bold text-emerald-400 font-mono">{averageNetworkApy}% APY</p>
              </div>
              <Percent className="w-6 h-6 text-emerald-400 bg-emerald-500/10 p-1 rounded-lg" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            {/* Input Column */}
            <div className="lg:col-span-1 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">
                  STAKING AMOUNT (TIXA)
                </label>
                <div className="relative">
                  <Coins className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
                  <input
                    type="number"
                    min="100"
                    max="10000000"
                    step="100"
                    value={stakeAmount}
                    onChange={e => setStakeAmount(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold text-sm focus:outline-none focus:border-cyan-400 shadow-inner"
                  />
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-2">
                {[1000, 5000, 25000, 100000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setStakeAmount(amt)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                      stakeAmount === amt
                        ? 'bg-cyan-500 text-black font-bold shadow-md'
                        : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-cyan-500/50'
                    }`}
                  >
                    {amt.toLocaleString()} TIXA
                  </button>
                ))}
              </div>
            </div>

            {/* Results Column */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/20 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>ESTIMATED 30-DAY RETURN</span>
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                </div>
                <p className="text-xl sm:text-2xl font-bold text-cyan-300 font-mono">
                  +{estimated30DayReturn.toFixed(2)} <span className="text-xs text-slate-400 font-normal">TIXA</span>
                </p>
                <p className="text-[11px] text-slate-500 font-mono">
                  Compound yield accrued daily across active BFT validator epochs
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/20 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>ESTIMATED ANNUAL RETURN (APY)</span>
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono">
                  +{estimatedAnnualReturn.toFixed(2)} <span className="text-xs text-slate-400 font-normal">TIXA</span>
                </p>
                <p className="text-[11px] text-slate-500 font-mono">
                  Total projected earnings over 365 days of continuous network staking
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 font-mono">
            <span>* Rewards are distributed automatically every block (~3-4s). No lock-up slashing risk under standard BFT consensus.</span>
            <button
              type="button"
              onClick={() => setActiveTab('wallet')}
              className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 transition-colors"
            >
              <span>Start Staking Now</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* View Mode 1: Cards Grid */}
        {validatorViewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topActiveValidators.map((val, idx) => {
              const rank = idx + 1;
              const totalStake = val.stakedAmount + val.delegatedAmount;
              const votingPowerShare = stats.totalStaked > 0 
                ? ((totalStake / stats.totalStaked) * 100).toFixed(1)
                : '0.0';

              const rankBadgeColor = 
                rank === 1 ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.25)]' :
                rank === 2 ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.2)]' :
                rank === 3 ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50' :
                'bg-slate-800/80 text-slate-300 border-slate-700';

              return (
                <div
                  key={val.address}
                  className="group relative p-5 rounded-2xl cyber-glass-card hover:border-cyan-500/50 space-y-4 border border-slate-800/90 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-950/40"
                >
                  {/* Header: Rank + Node Name + Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`shrink-0 w-7 h-7 rounded-lg border flex items-center justify-center font-mono font-bold text-xs ${rankBadgeColor}`}>
                        #{rank}
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-sm sm:text-base font-bold text-white font-heading group-hover:text-cyan-300 transition-colors leading-tight truncate">
                          {val.name}
                        </h3>
                        <div className="mt-1">
                          <HashBadge hash={val.address} type="address" truncate length={12} />
                        </div>
                      </div>
                    </div>

                    <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/70 text-[10px] font-mono font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>{val.status}</span>
                    </span>
                  </div>

                  {/* Staking & Uptime Metrics Highlight Box */}
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-3">
                    {/* Staking Amount */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400 font-medium">Staking Amount</span>
                        <span className="text-cyan-400 font-bold">{votingPowerShare}% Power</span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-lg font-bold text-white font-mono tracking-tight">
                          {totalStake.toLocaleString()} <span className="text-xs text-cyan-300 font-normal">TIXA</span>
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          Fee: {val.commissionRate}%
                        </span>
                      </div>
                      {/* Breakdown */}
                      <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between pt-0.5">
                        <span>Self: {val.stakedAmount.toLocaleString()}</span>
                        <span>Delegated: {val.delegatedAmount.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Uptime Percentage */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400 font-medium">Uptime Percentage</span>
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <Activity className="w-3 h-3" />
                          <span>{val.uptime.toFixed(2)}%</span>
                        </span>
                      </div>
                      {/* Visual Uptime Meter Bar */}
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-cyan-400 via-emerald-400 to-emerald-300 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(0, val.uptime))}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Node Production Stats */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                      <span className="text-[10px] text-slate-500 block">BLOCKS PROPOSED</span>
                      <span className="text-slate-200 font-bold">{val.blocksProposed.toLocaleString()}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                      <span className="text-[10px] text-slate-500 block">TOTAL REWARDS</span>
                      <span className="text-amber-400 font-bold">+{val.totalRewards.toFixed(1)} TIXA</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setActiveTab('wallet')}
                      className="flex-1 py-2 px-3 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 hover:text-white font-semibold text-xs font-mono flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Coins className="w-3.5 h-3.5" />
                      <span>Stake</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('explorer')}
                      className="py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/40 text-slate-300 hover:text-white text-xs font-mono flex items-center justify-center gap-1 transition-all"
                      title="Inspect validator node details in explorer"
                    >
                      <span>Inspect</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* View Mode 2: Responsive Ledger Table */
          <div className="rounded-2xl cyber-glass border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">RANK</th>
                    <th className="p-3.5">VALIDATOR NODE</th>
                    <th className="p-3.5">ADDRESS</th>
                    <th className="p-3.5">STAKING AMOUNT</th>
                    <th className="p-3.5">UPTIME %</th>
                    <th className="p-3.5">COMMISSION</th>
                    <th className="p-3.5">BLOCKS</th>
                    <th className="p-3.5">REWARDS</th>
                    <th className="p-3.5 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {topActiveValidators.map((val, idx) => {
                    const rank = idx + 1;
                    const totalStake = val.stakedAmount + val.delegatedAmount;
                    const votingPowerShare = stats.totalStaked > 0 
                      ? ((totalStake / stats.totalStaked) * 100).toFixed(1)
                      : '0.0';

                    return (
                      <tr key={val.address} className="hover:bg-cyan-950/20 transition-colors">
                        <td className="p-3.5">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md font-bold text-xs ${
                            rank === 1 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50' :
                            rank === 2 ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50' :
                            rank === 3 ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50' :
                            'bg-slate-800 text-slate-400'
                          }`}>
                            #{rank}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <div>
                            <span className="font-bold text-white block">{val.name}</span>
                            <span className="text-[10px] text-emerald-400">● {val.status}</span>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <HashBadge hash={val.address} type="address" truncate length={12} />
                        </td>
                        <td className="p-3.5">
                          <div>
                            <span className="font-bold text-cyan-300 block">{totalStake.toLocaleString()} TIXA</span>
                            <span className="text-[10px] text-slate-400">{votingPowerShare}% voting power</span>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <div className="space-y-1 w-28">
                            <span className="font-bold text-emerald-400 block">{val.uptime.toFixed(2)}%</span>
                            <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
                              <div 
                                className="bg-emerald-400 h-full rounded-full"
                                style={{ width: `${Math.min(100, val.uptime)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 text-slate-300">{val.commissionRate}%</td>
                        <td className="p-3.5 text-slate-300">{val.blocksProposed.toLocaleString()}</td>
                        <td className="p-3.5 text-amber-400 font-bold">+{val.totalRewards.toFixed(1)} TIXA</td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setActiveTab('wallet')}
                              className="px-2.5 py-1 rounded bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-[11px] font-semibold transition-colors"
                            >
                              Stake
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveTab('explorer')}
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                              title="Inspect in Explorer"
                            >
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* 5. 10-PHASE ROADMAP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-800 text-[11px] font-mono text-cyan-300">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>GLOBAL ARCHITECTURAL STRATEGY</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-heading">
            TIXAPAY 10-Phase Roadmap
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            From formal mathematical architecture to mainnet genesis and autonomous AI agent execution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {roadmapPhases.map((phase) => {
            const isCompleted = phase.status === 'COMPLETED';
            const isActive = phase.status === 'ACTIVE';
            return (
              <div
                key={phase.phase}
                onClick={() => setActiveRoadmapPhase(phase.phase)}
                className={`p-4 rounded-xl text-left transition-all cursor-pointer ${
                  isActive
                    ? 'cyber-glass-glow border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                    : isCompleted
                    ? 'bg-slate-900/70 border border-emerald-800/60 hover:border-emerald-500/60'
                    : 'bg-slate-900/40 border border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    PHASE {phase.phase}
                  </span>
                  <span className={`text-[10px] font-mono font-semibold ${
                    isCompleted ? 'text-emerald-400' : isActive ? 'text-cyan-400 animate-pulse' : 'text-slate-500'
                  }`}>
                    {phase.status}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-100 font-heading mb-1">
                  {phase.title}
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {phase.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. SECURITY & TRUST BLUEPRINT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-3xl cyber-glass border border-cyan-500/30 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-1 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center">
                <Lock className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold text-white font-heading">
                Security & Zero-Backdoor Guarantee
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                TIXAPAY is built on immutable trust. Admins have zero access to user passwords or private keys. Every privileged action requires Multi-Sig quorum and leaves an unalterable SHA-256 audit proof.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('developer')}
                className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Review Complete 15-Step Blueprint</span>
              </button>
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Client-Side Key Derivation</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Private keys are derived locally from BIP-39 mnemonic seeds and encrypted with PBKDF2/AES. Plaintext never leaves the device.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Chained Audit Log</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  All administrative actions (freezes, mints, parameter adjustments) are cryptographically chained to prevent historical tampering.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Deterministic Finality</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Validator BFT voting reaches irreversible finality in 3.0s, eliminating the risk of chain reorganizations.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>WebAuthn Biometric Passkeys</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  FIDO2 hardware biometric prompts protect admin control operations from credential stuffing and phishing attacks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CORPORATE & PROTOCOL GOVERNANCE DIRECTORY (HOMEPAGE BOTTOM BUTTONS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-3xl cyber-glass border border-cyan-500/30 space-y-6 relative overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.1)]">
          {/* Ambient background glow */}
          <div className="absolute top-0 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800/80 pb-5">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-[11px] font-mono text-cyan-300">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                <span>COMPANY & PROTOCOL GOVERNANCE DIRECTORY</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
                Corporate Transparency & Protocol Standards
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
                Explore our legal registrations, global offices, engineering careers, scientific research publications, developer tools, and official communities.
              </p>
            </div>
            
            <div className="text-xs font-mono text-slate-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>10 Verified Institutional Portals</span>
            </div>
          </div>

          {/* 10 Requested Corporate & Protocol Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 pt-2">
            {COMPANY_BUTTONS.map((btn) => {
              const Icon = btn.icon;
              return (
                <button
                  key={btn.id}
                  type="button"
                  id={`btn-${btn.id}`}
                  onClick={() => setCorporateModalTab(btn.id)}
                  className={`group relative p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border transition-all duration-300 flex flex-col items-start justify-between min-h-[110px] text-left hover:scale-[1.03] hover:shadow-lg ${btn.color}`}
                >
                  <div className="w-full flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-center group-hover:border-cyan-400/50 transition-colors">
                      <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                    </div>
                    {btn.badge && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold bg-cyan-950 border border-cyan-700/60 text-cyan-300">
                        {btn.badge}
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-2 w-full">
                    <span className="text-xs sm:text-sm font-bold text-white block group-hover:text-cyan-200 transition-colors font-mono">
                      {btn.label}
                    </span>
                    <span className="text-[10px] text-slate-400 group-hover:text-slate-300 flex items-center gap-1 mt-0.5">
                      <span>Explore details</span>
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* WHITEPAPER MODAL */}
      {isWhitepaperOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-3xl bg-[#080d1f] border border-cyan-500/40 shadow-2xl p-6 sm:p-8 my-8 text-slate-100 max-h-[85vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                <h3 className="text-xl font-bold text-white font-heading">
                  TIXAPAY Protocol Whitepaper (v2.4)
                </h3>
              </div>
              <button
                onClick={() => setIsWhitepaperOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-cyan-200 font-mono text-xs">
                <strong>ABSTRACT:</strong> TIXAPAY is an original Layer-1 blockchain infrastructure combining validator-based BFT consensus with non-custodial cryptographic key vaults. It introduces the TX-20 smart asset standard and deterministic 3.0s transaction finality.
              </div>

              <h4 className="text-base font-bold text-white font-heading">1. Seven Modular Protocol Layers</h4>
              <p className="text-slate-400 text-xs">
                1. <strong>Networking Layer:</strong> Gossipsub P2P protocol with encrypted TLS 1.3 streams.<br/>
                2. <strong>Consensus Layer:</strong> TIXA-BFT Proof-of-Stake with 2/3 validator quorum.<br/>
                3. <strong>Execution Layer:</strong> Deterministic State Transition Machine (TX-VM).<br/>
                4. <strong>Settlement Layer:</strong> Merkle root state proofs with instant finality.<br/>
                5. <strong>Cryptography Layer:</strong> SHA-256 Merkle trees, Bech32 address derivation, BIP-39 mnemonic seeds.<br/>
                6. <strong>Storage Layer:</strong> Key-value state storage with rollback protection.<br/>
                7. <strong>Governance Layer:</strong> Multi-Sig parameter updates and treasury disbursement voting.
              </p>

              <h4 className="text-base font-bold text-white font-heading">2. Tokenomics & Deflationary Fee Policy</h4>
              <p className="text-slate-400 text-xs">
                - Maximum Supply: 250,000,000 TIXA (Strict Hard Cap)<br/>
                - Initial Genesis Allocation: 100M Treasury Reserve, 50M Ecosystem Grants, 45M Staking Pool, 55M Circulating.<br/>
                - Fee Mechanism: 50% of every transaction fee is permanently burned, 50% is rewarded to the active block proposing validator.
              </p>

              <h4 className="text-base font-bold text-white font-heading">3. Cryptographic Non-Custodial Architecture</h4>
              <p className="text-slate-400 text-xs">
                Users generate an air-gapped 12-word seed phrase locally. The derived private key is encrypted client-side using PBKDF2 with unique salts. No administrative interface or database ever has access to plaintext secrets.
              </p>
            </div>

            <div className="border-t border-slate-800 pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setIsWhitepaperOpen(false)}
                className="px-5 py-2 rounded-xl bg-cyan-500 text-black font-bold text-xs"
              >
                Close Whitepaper
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPANY CORPORATE & PROTOCOL MODAL */}
      <CompanyCorporateModal
        activeSection={corporateModalTab}
        onClose={() => setCorporateModalTab(null)}
        onSelectTab={(tab) => setCorporateModalTab(tab)}
        onNavigateToTab={setActiveTab}
      />
    </div>
  );
};
