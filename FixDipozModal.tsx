import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Lock, 
  Unlock, 
  Clock, 
  CheckCircle, 
  TrendingUp, 
  DollarSign, 
  Wallet, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  X, 
  RefreshCw, 
  Package, 
  Truck, 
  Factory,
  History,
  AlertCircle,
  Cpu,
  Layers,
  Award
} from 'lucide-react';
import { blockchainEngine } from '../../core/blockchainEngine';
import { authEngine } from '../../core/authEngine';
import { soundEngine } from '../../core/soundEngine';
import confetti from 'canvas-confetti';

interface CompanyBox {
  id: number;
  name: string;
  category: string;
  price: number;
  logoBg: string;
  badge: string;
  tier: string;
}

interface InvestmentState {
  boxId: number;
  boxName: string;
  investedAt: number;
  expiresAt: number;
  amount: number;
  currentReturnRate: number; // fluctuating between 3% and 33%
  finalRateLocked?: number;
  claimed: boolean;
}

interface FixDipozTransaction {
  id: string;
  boxId: number;
  boxName: string;
  investedAt: string;
  completedAt: string;
  investAmount: number;
  returnPercentage: number;
  profitAmount: number;
  totalPayout: number;
}

const COMPANIES: CompanyBox[] = [
  { id: 1, name: 'Stripe Payments', category: 'Fintech Gateway', price: 3, logoBg: 'from-indigo-600 to-purple-700', badge: 'FINTECH', tier: 'VIP TIER 1' },
  { id: 2, name: 'PayPal Global', category: 'Digital Wallet', price: 6, logoBg: 'from-blue-600 to-indigo-800', badge: 'FINTECH', tier: 'VIP TIER 2' },
  { id: 3, name: 'Revolut NeoBank', category: 'Digital Banking', price: 12, logoBg: 'from-cyan-600 to-blue-700', badge: 'BANKING', tier: 'VIP TIER 3' },
  { id: 4, name: 'Wise Transfer', category: 'Cross-Border', price: 24, logoBg: 'from-emerald-600 to-teal-700', badge: 'FINTECH', tier: 'VIP TIER 4' },
  { id: 5, name: 'Shopify Commerce', category: 'E-Commerce SaaS', price: 48, logoBg: 'from-green-600 to-emerald-800', badge: 'RETAIL', tier: 'VIP TIER 5' },
  { id: 6, name: 'Stripe Capital', category: 'Enterprise Fin', price: 96, logoBg: 'from-violet-600 to-indigo-900', badge: 'FINTECH', tier: 'VIP TIER 6' },
  { id: 7, name: 'Apple Corp', category: 'Global Tech', price: 192, logoBg: 'from-slate-700 to-slate-900', badge: 'BIG TECH', tier: 'VIP TIER 7' },
  { id: 8, name: 'Google AI Cloud', category: 'Cloud Computing', price: 384, logoBg: 'from-blue-500 via-red-500 to-yellow-500', badge: 'AI & CLOUD', tier: 'VIP TIER 8' },
  { id: 9, name: 'Amazon Web Services', category: 'Enterprise Cloud', price: 768, logoBg: 'from-amber-600 to-orange-800', badge: 'CLOUD', tier: 'VIP TIER 9' },
  { id: 10, name: 'Microsoft Azure', category: 'Cloud Infrastructure', price: 1536, logoBg: 'from-cyan-700 to-blue-900', badge: 'SOFTWARE', tier: 'VIP TIER 10' },
  { id: 11, name: 'Tesla Energy', category: 'EV & Clean Tech', price: 3072, logoBg: 'from-red-700 to-zinc-900', badge: 'EV', tier: 'VIP TIER 11' },
  { id: 12, name: 'Binance Global', category: 'Crypto Liquidity', price: 6144, logoBg: 'from-yellow-600 to-amber-700', badge: 'CRYPTO', tier: 'VIP TIER 12' },
  { id: 13, name: 'Coinbase Institutional', category: 'Crypto Prime', price: 12288, logoBg: 'from-blue-600 to-cyan-800', badge: 'CRYPTO', tier: 'VIP TIER 13' },
  { id: 14, name: 'Samsung Electronics', category: 'Global Hardware', price: 24576, logoBg: 'from-indigo-600 to-blue-950', badge: 'HARDWARE', tier: 'VIP TIER 14' },
  { id: 15, name: 'Toyota Motor Corp', category: 'Automotive', price: 49152, logoBg: 'from-red-600 to-zinc-900', badge: 'AUTO', tier: 'VIP TIER 15' },
  { id: 16, name: 'Coca-Cola Co', category: 'Global FMCG', price: 98304, logoBg: 'from-red-600 to-rose-900', badge: 'FMCG', tier: 'VIP TIER 16' },
  { id: 17, name: 'Netflix Media', category: 'Streaming Media', price: 196608, logoBg: 'from-rose-600 to-red-950', badge: 'MEDIA', tier: 'VIP TIER 17' },
  { id: 18, name: 'Meta Platforms', category: 'Social Metaverse', price: 393216, logoBg: 'from-blue-600 to-indigo-900', badge: 'SOCIAL', tier: 'VIP TIER 18' },
  { id: 19, name: 'Nvidia AI', category: 'Semiconductors', price: 786432, logoBg: 'from-emerald-600 to-green-900', badge: 'SEMICON', tier: 'VIP TIER 19' },
  { id: 20, name: 'SpaceX Starlink', category: 'Aerospace', price: 1572864, logoBg: 'from-slate-800 to-zinc-950', badge: 'SPACE', tier: 'VIP TIER 20' },
  { id: 21, name: 'Alibaba Cloud', category: 'Global Retail Cloud', price: 3145728, logoBg: 'from-orange-600 to-amber-900', badge: 'RETAIL', tier: 'VIP TIER 21' },
  { id: 22, name: 'Tencent Gaming', category: 'Metaverse Gaming', price: 6291456, logoBg: 'from-blue-600 to-indigo-900', badge: 'GAMING', tier: 'VIP TIER 22' },
  { id: 23, name: 'Sony Entertainment', category: 'Media Tech', price: 12582912, logoBg: 'from-slate-700 to-blue-950', badge: 'MEDIA', tier: 'VIP TIER 23' },
  { id: 24, name: 'Nike Athletics', category: 'Global Apparel', price: 25165824, logoBg: 'from-amber-600 to-orange-950', badge: 'SPORTS', tier: 'VIP TIER 24' },
  { id: 25, name: 'Adidas AG', category: 'Global Sports', price: 50331648, logoBg: 'from-slate-700 to-zinc-900', badge: 'SPORTS', tier: 'VIP TIER 25' },
  { id: 26, name: 'Unilever PLC', category: 'Consumer Goods', price: 100663296, logoBg: 'from-blue-600 to-cyan-900', badge: 'FMCG', tier: 'VIP TIER 26' },
  { id: 27, name: 'Nestlé SA', category: 'Global Nutrition', price: 201326592, logoBg: 'from-amber-800 to-yellow-950', badge: 'FOOD', tier: 'VIP TIER 27' },
  { id: 28, name: 'Shell Global Energy', category: 'Energy Grid', price: 402653184, logoBg: 'from-yellow-600 to-amber-900', badge: 'ENERGY', tier: 'VIP TIER 28' },
  { id: 29, name: 'ExxonMobil Corp', category: 'Energy Systems', price: 805306368, logoBg: 'from-red-700 to-amber-950', badge: 'ENERGY', tier: 'VIP TIER 29' },
  { id: 30, name: 'Walmart Retail', category: 'Global Retail', price: 1610612736, logoBg: 'from-blue-600 to-cyan-950', badge: 'RETAIL', tier: 'VIP TIER 30' },
  { id: 31, name: 'JPMorgan Chase', category: 'Global Banking', price: 3221225472, logoBg: 'from-blue-700 to-indigo-950', badge: 'BANKING', tier: 'VIP TIER 31' },
  { id: 32, name: 'Visa Global', category: 'Payment Network', price: 6442450944, logoBg: 'from-blue-600 to-indigo-800', badge: 'PAYMENTS', tier: 'VIP TIER 32' },
  { id: 33, name: 'TIXA NET PAY', category: 'Decentralized Core', price: 12884901888, logoBg: 'from-cyan-500 to-blue-700', badge: 'WEB3 CORE', tier: 'VIP TIER 33' },
];

interface FixDipozModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FixDipozModal: React.FC<FixDipozModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'boxes' | 'history'>('boxes');
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  const [investments, setInvestments] = useState<Record<number, InvestmentState>>(() => {
    try {
      const saved = localStorage.getItem('tixa_fixdipoz_investments');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [fixDipozWallet, setFixDipozWallet] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('tixa_fixdipoz_wallet');
      return saved ? parseFloat(saved) : 0.00;
    } catch {
      return 0.00;
    }
  });

  const [transactions, setTransactions] = useState<FixDipozTransaction[]>(() => {
    try {
      const saved = localStorage.getItem('tixa_fixdipoz_transactions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  const session = authEngine.getSession();
  const userBalance = session ? blockchainEngine.getBalance(session.walletAddress) : 1250;

  // Save states
  useEffect(() => {
    try {
      localStorage.setItem('tixa_fixdipoz_investments', JSON.stringify(investments));
    } catch {}
  }, [investments]);

  useEffect(() => {
    try {
      localStorage.setItem('tixa_fixdipoz_wallet', fixDipozWallet.toString());
    } catch {}
  }, [fixDipozWallet]);

  useEffect(() => {
    try {
      localStorage.setItem('tixa_fixdipoz_transactions', JSON.stringify(transactions));
    } catch {}
  }, [transactions]);

  // Live mining timer & 24h completion check
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setCurrentTime(now);

      setInvestments(prev => {
        let updated = { ...prev };
        let hasChanges = false;
        let newlyCompletedEarnings = 0;
        let newTransactionsList: FixDipozTransaction[] = [];

        Object.keys(updated).forEach(idStr => {
          const id = parseInt(idStr);
          const inv = updated[id];
          if (!inv || inv.claimed) return;

          // Fluctuating mining rate between 3% and 33% every second
          const randomRate = parseFloat((3 + Math.random() * 30).toFixed(2));

          if (now >= inv.expiresAt) {
            // 24 hours completed automatically!
            const lockedRate = inv.currentReturnRate || 15; // fallback rate
            const profitAmount = inv.amount * (lockedRate / 100);
            const totalPayout = inv.amount + profitAmount;
            
            newlyCompletedEarnings += totalPayout;

            // Record transaction
            const newTx: FixDipozTransaction = {
              id: 'TX-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
              boxId: inv.boxId,
              boxName: inv.boxName,
              investedAt: new Date(inv.investedAt).toLocaleString(),
              completedAt: new Date(now).toLocaleString(),
              investAmount: inv.amount,
              returnPercentage: lockedRate,
              profitAmount: parseFloat(profitAmount.toFixed(2)),
              totalPayout: parseFloat(totalPayout.toFixed(2))
            };
            newTransactionsList.push(newTx);

            updated[id] = { ...inv, claimed: true, finalRateLocked: lockedRate };
            hasChanges = true;
          } else {
            updated[id] = { ...inv, currentReturnRate: randomRate };
            hasChanges = true;
          }
        });

        if (newlyCompletedEarnings > 0) {
          setFixDipozWallet(w => {
            const nextW = w + newlyCompletedEarnings;
            try { localStorage.setItem('tixa_fixdipoz_wallet', nextW.toString()); } catch {}
            return nextW;
          });

          if (newTransactionsList.length > 0) {
            setTransactions(txs => [...newTransactionsList, ...txs]);
          }

          soundEngine.play('success');
          confetti({ particleCount: 80, spread: 80, origin: { y: 0.5 } });
        }

        return hasChanges ? updated : prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!isOpen) return null;

  const handleInvest = (box: CompanyBox) => {
    if (!session) {
      alert('Please log into your vault first to invest in FIXDIPOZ VIP boxes.');
      return;
    }

    if (userBalance < box.price) {
      soundEngine.play('error');
      alert(`Insufficient main wallet balance! You need $${box.price.toLocaleString()} but have $${userBalance.toLocaleString()}`);
      return;
    }

    // Deduct instantly from main balance
    const success = blockchainEngine.deductBalance(
      session.walletAddress, 
      box.price, 
      `FIXDIPOZ 24H Mining Investment in Box #${box.id} (${box.name})`
    );

    if (!success) {
      soundEngine.play('error');
      alert('Failed to deduct balance from main wallet.');
      return;
    }

    const now = Date.now();
    const duration24Hours = 24 * 60 * 60 * 1000; // 24 hours
    const expiresAt = now + duration24Hours;
    const initialRate = parseFloat((3 + Math.random() * 30).toFixed(2));

    setInvestments(prev => ({
      ...prev,
      [box.id]: {
        boxId: box.id,
        boxName: box.name,
        investedAt: now,
        expiresAt: expiresAt,
        amount: box.price,
        currentReturnRate: initialRate,
        claimed: false
      }
    }));

    soundEngine.play('success');
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
  };

  const handleWithdrawToMain = () => {
    if (fixDipozWallet <= 0) {
      soundEngine.play('error');
      alert('No balance available in FIXDIPOZ internal wallet to withdraw.');
      return;
    }

    if (!session) {
      alert('Please log in first.');
      return;
    }

    const amountToTransfer = fixDipozWallet;
    blockchainEngine.creditBalance(session.walletAddress, amountToTransfer);
    setFixDipozWallet(0);
    try { localStorage.setItem('tixa_fixdipoz_wallet', '0'); } catch {}

    soundEngine.play('success');
    confetti({ particleCount: 120, spread: 90, origin: { y: 0.4 } });
  };

  const formatCountdown = (expiresAt: number) => {
    const diff = expiresAt - currentTime;
    if (diff <= 0) return '00:00:00 (Processing...)';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const filteredCompanies = COMPANIES.filter(c => {
    if (activeFilter === 'ALL') return true;
    return c.badge === activeFilter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/9 backdrop-blur-xl overflow-y-auto">
      <div className="relative w-full max-w-7xl bg-[#060a17] border border-cyan-500/50 rounded-3xl shadow-2xl shadow-cyan-500/30 flex flex-col max-h-[94vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 py-5 bg-gradient-to-r from-cyan-950 via-[#050b1a] to-blue-950 border-b border-cyan-500/40 gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-cyan-400 via-emerald-400 to-blue-500 text-black shadow-lg shadow-cyan-500/40">
              <Cpu className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-wider font-heading">
                  FIXDIPOZ VIP MINING <span className="text-cyan-400 font-mono">(33 BOXES)</span>
                </h2>
                <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 font-mono text-xs font-bold animate-pulse">
                  ACTIVE PROTOCOL
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Institutional 24H Autonomous Mining • Live Fluctuating ROI (3% – 33%) • Secure Vault Integration
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            {/* FIXDIPOZ Internal Wallet Widget */}
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-900/95 border border-cyan-500/50 shadow-inner">
              <div className="flex flex-col text-right">
                <span className="text-[10px] uppercase font-mono text-cyan-400 font-bold tracking-wider">FIXDIPOZ Wallet</span>
                <span className="text-base font-black font-mono text-emerald-400">${fixDipozWallet.toFixed(2)}</span>
              </div>
              <button
                type="button"
                onClick={handleWithdrawToMain}
                disabled={fixDipozWallet <= 0}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-black font-extrabold text-xs shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 shrink-0"
              >
                <Wallet className="w-4 h-4" />
                <span>Claim to Main</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Status Bar */}
        <div className="bg-gradient-to-r from-slate-950 via-[#070e22] to-slate-950 border-b border-slate-800 px-6 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-7xl mx-auto text-xs font-mono">
            <div className="flex items-center gap-2 text-cyan-300">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span>MAIN WALLET BALANCE: <strong className="text-white">${userBalance.toLocaleString()}</strong></span>
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <span>⚡ 24-Hour Autonomous Cycle</span>
              <span>•</span>
              <span>🛡️ Smart Contract Secured</span>
              <span>•</span>
              <span>💎 Instant Profit Crediting</span>
            </div>
          </div>
        </div>

        {/* Tabs & Modern Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-3.5 bg-[#040711] border-b border-slate-800 gap-4">
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('boxes')}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-mono font-black flex items-center justify-center gap-2 transition-all ${
                activeTab === 'boxes'
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-black shadow-lg shadow-cyan-500/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>33 VIP Mining Tiers</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-mono font-black flex items-center justify-center gap-2 transition-all ${
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-black shadow-lg shadow-cyan-500/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Mining Ledger History ({transactions.length})</span>
            </button>
          </div>

          {activeTab === 'boxes' && (
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {['ALL', 'FINTECH', 'BIG TECH', 'CLOUD', 'CRYPTO', 'ENERGY', 'RETAIL', 'AI & CLOUD'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 ${
                    activeFilter === filter
                      ? 'bg-emerald-400 text-black shadow-md font-black'
                      : 'bg-slate-900/90 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-[#060a17]">
          {activeTab === 'boxes' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {filteredCompanies.map(box => {
                const inv = investments[box.id];
                const isInvested = inv && !inv.claimed;
                const estimatedProfit = box.price * 0.15; // estimated 15% average

                return (
                  <div
                    key={box.id}
                    className={`relative p-5 rounded-3xl border transition-all duration-300 flex flex-col justify-between shadow-xl backdrop-blur-md group hover:-translate-y-1 ${
                      isInvested
                        ? 'bg-gradient-to-b from-slate-900 via-cyan-950/60 to-slate-950 border-cyan-400 shadow-cyan-500/30 ring-2 ring-cyan-500/40'
                        : 'bg-slate-900/90 hover:bg-slate-900 border-slate-800/80 hover:border-cyan-500/50'
                    }`}
                  >
                    {/* Top Tier & Badge */}
                    <div className="flex items-center justify-between mb-3.5">
                      <span className="text-[10px] font-mono font-black px-2.5 py-1 rounded-lg bg-cyan-950/90 text-cyan-300 border border-cyan-800/80 shadow-sm">
                        {box.tier}
                      </span>
                      <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-slate-800/90 text-slate-300 font-bold">
                        {box.badge}
                      </span>
                    </div>

                    {/* Company Logo / Header */}
                    <div className="flex items-center gap-3.5 mb-4">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${box.logoBg} flex items-center justify-center text-white font-black text-base shadow-lg shrink-0 group-hover:scale-105 transition-transform`}>
                        {box.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-extrabold text-white truncate tracking-wide">{box.name}</h3>
                        <p className="text-[11px] text-slate-400 truncate font-mono">{box.category}</p>
                      </div>
                    </div>

                    {/* Financial Metrics Card */}
                    <div className="space-y-2.5 mb-4 p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800/90 shadow-inner">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-mono">Principal:</span>
                        <span className="font-extrabold font-mono text-white">${box.price.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-mono">Est. Profit (15%):</span>
                        <span className="font-extrabold font-mono text-emerald-400">+${estimatedProfit.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-800/80">
                        <span className="text-slate-400 font-mono">Mining Yield:</span>
                        <span className="font-black font-mono text-cyan-300 animate-pulse">
                          {isInvested ? `${inv.currentReturnRate}%` : '3% – 33% ROI'}
                        </span>
                      </div>
                    </div>

                    {/* Action Button / Countdown */}
                    {isInvested ? (
                      <div className="space-y-2.5">
                        <div className="p-2.5 rounded-2xl bg-cyan-950/80 border border-cyan-500/50 text-center shadow-inner">
                          <div className="text-[9px] uppercase font-mono text-cyan-300 font-bold">24H Mining Countdown</div>
                          <div className="text-xs font-mono font-black text-white tracking-widest mt-0.5">
                            {formatCountdown(inv.expiresAt)}
                          </div>
                        </div>
                        <div className="w-full py-2.5 rounded-2xl bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 font-black text-xs flex items-center justify-center gap-2 shadow-md">
                          <Lock className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
                          <span>MINING ACTIVE</span>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleInvest(box)}
                        className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-400 via-emerald-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-black text-xs transition-all shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 hover:scale-[1.02]"
                      >
                        <Zap className="w-4 h-4 fill-black" />
                        <span>START MINING (${box.price.toLocaleString()})</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-2 font-mono">
                  <History className="w-4 h-4 text-cyan-400" />
                  <span>FIXDIPOZ 24-HOUR COMPLETED MINING LEDGER HISTORY</span>
                </h3>
                <span className="text-xs font-mono text-slate-400">Total Records: {transactions.length}</span>
              </div>

              {transactions.length === 0 ? (
                <div className="py-20 text-center text-slate-500 italic text-sm font-mono">
                  No completed mining transactions yet. Start investing in VIP boxes and wait for 24-hour completion.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-mono">
                        <th className="p-3.5">TX ID</th>
                        <th className="p-3.5">VIP Box / Enterprise</th>
                        <th className="p-3.5">Invested Time</th>
                        <th className="p-3.5">Completed Time</th>
                        <th className="p-3.5">Principal</th>
                        <th className="p-3.5">ROI %</th>
                        <th className="p-3.5">Profit Earned</th>
                        <th className="p-3.5 text-right">Total Payout</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900 font-mono">
                      {transactions.map(tx => (
                        <tr key={tx.id} className="hover:bg-slate-900/60 transition-colors">
                          <td className="p-3.5 text-cyan-400 font-bold">{tx.id}</td>
                          <td className="p-3.5 text-white font-sans font-bold">{tx.boxName}</td>
                          <td className="p-3.5 text-slate-400 text-[11px]">{tx.investedAt}</td>
                          <td className="p-3.5 text-slate-400 text-[11px]">{tx.completedAt}</td>
                          <td className="p-3.5 text-white">${tx.investAmount.toLocaleString()}</td>
                          <td className="p-3.5 text-emerald-400 font-bold">+{tx.returnPercentage}%</td>
                          <td className="p-3.5 text-cyan-300 font-bold">+${tx.profitAmount.toLocaleString()}</td>
                          <td className="p-3.5 text-right text-emerald-300 font-black text-sm">
                            ${tx.totalPayout.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#040711] border-t border-slate-800">
          <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>24-hour cycle automatically credits principal + fluctuating profit to FIXDIPOZ Wallet with immutable ledger history.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs border border-slate-700 transition-colors font-mono"
          >
            Close Dashboard
          </button>
        </div>

      </div>
    </div>
  );
};
