import React, { useState, useEffect } from 'react';
import { 
  Coins, 
  Wallet, 
  TrendingUp, 
  Eye, 
  Play, 
  Gift, 
  ArrowUpRight, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ExternalLink,
  Sparkles,
  HelpCircle,
  Lock,
  ChevronRight
} from 'lucide-react';
import { BlueTixaWithdrawal } from '../../types/blueTixa';
import { blueTixaRewardEngine } from '../../core/blueTixaRewardEngine';
import { BlueTixaWithdrawModal } from './BlueTixaWithdrawModal';
import { authEngine } from '../../core/authEngine';

interface BlueTixaRewardsDashboardProps {
  onOpenCreate: () => void;
  onOpenFeed: () => void;
}

export const BlueTixaRewardsDashboard: React.FC<BlueTixaRewardsDashboardProps> = ({
  onOpenCreate,
  onOpenFeed
}) => {
  const session = authEngine.getSession();
  const userId = session?.walletAddress || 'CURRENT_USER';

  const [summary, setSummary] = useState(() => blueTixaRewardEngine.getUserRewardSummary(userId));
  const [withdrawals, setWithdrawals] = useState<BlueTixaWithdrawal[]>(() => 
    blueTixaRewardEngine.getAllWithdrawals().filter(w => w.userId === userId || (userId === 'CURRENT_USER' && (w.userId === 'CURRENT_USER' || w.userId === 'CURRENT_WALLET')))
  );
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  useEffect(() => {
    const unsub = blueTixaRewardEngine.subscribe(() => {
      setSummary(blueTixaRewardEngine.getUserRewardSummary(userId));
      setWithdrawals(
        blueTixaRewardEngine.getAllWithdrawals().filter(w => w.userId === userId || (userId === 'CURRENT_USER' && (w.userId === 'CURRENT_USER' || w.userId === 'CURRENT_WALLET')))
      );
    });
    return () => unsub();
  }, [userId]);

  const config = blueTixaRewardEngine.getAdminConfig();
  const minPoints = config.minWithdrawalPoints; // 500
  const progressPercent = Math.min(100, Math.round((summary.availablePoints / minPoints) * 100));

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 bg-gradient-to-r from-[#07132e] via-[#0b1b3d] to-[#081126] border border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.15)]">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>BLUE TIXA Transparent Reward Ledger</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
              Creator & Viewer Rewards
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Earn verified cryptographic points by creating trending short-videos or watching verified creator content. Instant withdrawal to non-custodial wallets.
            </p>
          </div>

          {/* Main Action Card */}
          <div className="p-5 rounded-2xl bg-black/50 border border-cyan-500/40 backdrop-blur-xl min-w-[280px] space-y-3">
            <div>
              <span className="text-[11px] font-mono text-slate-400">Available Reward Balance</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-cyan-300 font-mono flex items-center gap-2">
                <Coins className="w-7 h-7 text-amber-400" />
                <span>{summary.availablePoints.toLocaleString()} Points</span>
              </div>
              <div className="text-sm font-mono text-emerald-400 font-bold mt-0.5">
                ≈ ${summary.usdValue.toFixed(2)} USD
              </div>
            </div>

            {/* Threshold Progress */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>Withdrawal Threshold:</span>
                <span className={summary.canWithdraw ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                  {summary.availablePoints}/{minPoints} Pts ($5)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${summary.canWithdraw ? 'bg-gradient-to-r from-emerald-500 to-cyan-400' : 'bg-cyan-500'}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Withdraw Button Rule (Requirement 7) */}
            {summary.canWithdraw ? (
              <button
                type="button"
                onClick={() => setIsWithdrawModalOpen(true)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-bold font-mono text-xs shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2 transition transform active:scale-98"
              >
                <Wallet className="w-4 h-4" />
                <span>Withdraw Payout</span>
              </button>
            ) : (
              <div className="w-full py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-400 font-mono text-xs text-center flex items-center justify-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Minimum withdrawal: 500 Points ($5)</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Point Conversion Formula Matrix (Requirement 6) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { points: '100 Points', usd: '$1.00 USD', desc: 'Base Unit' },
          { points: '500 Points', usd: '$5.00 USD', desc: 'Min Withdrawal' },
          { points: '1,000 Points', usd: '$10.00 USD', desc: 'Creator Tier' },
          { points: '10,000 Points', usd: '$100.00 USD', desc: 'Whale Tier' }
        ].map((item, idx) => (
          <div key={idx} className="p-4 rounded-2xl bg-[#060c1c] border border-cyan-900/40 text-center space-y-1">
            <span className="text-[10px] font-mono text-cyan-400/80 uppercase">{item.desc}</span>
            <div className="text-base font-bold text-white font-mono">{item.points}</div>
            <div className="text-xs font-mono font-bold text-emerald-400">= {item.usd}</div>
          </div>
        ))}
      </div>

      {/* Earnings Breakdown Grid (Requirement 9) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#060c1c] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono">Today's Earnings</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-white font-mono">
            +{summary.todayEarned.toLocaleString()} Pts
          </div>
          <span className="text-[11px] font-mono text-emerald-400 block">
            ≈ +${(summary.todayEarned / config.pointsPerUsd).toFixed(2)} USD
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#060c1c] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono">Video Creator Rewards</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-white font-mono">
            {summary.videoEarningsPoints.toLocaleString()} Pts
          </div>
          <span className="text-[11px] font-mono text-purple-400 block">
            ≈ ${(summary.videoEarningsPoints / config.pointsPerUsd).toFixed(2)} USD
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#060c1c] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono">Viewer Watch Rewards</span>
            <Eye className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl font-bold text-white font-mono">
            {summary.watchEarningsPoints.toLocaleString()} Pts
          </div>
          <span className="text-[11px] font-mono text-sky-400 block">
            ≈ ${(summary.watchEarningsPoints / config.pointsPerUsd).toFixed(2)} USD
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#060c1c] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono">Lifetime Total Earned</span>
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-400 font-mono">
            {summary.lifetimeEarned.toLocaleString()} Pts
          </div>
          <span className="text-[11px] font-mono text-emerald-400 block">
            ≈ ${(summary.lifetimeEarned / config.pointsPerUsd).toFixed(2)} USD
          </span>
        </div>
      </div>

      {/* How to Earn More Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-950/40 to-slate-900 border border-cyan-500/30 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-cyan-300 font-mono">Creator Monetization</span>
            <p className="text-xs text-slate-300">Publish high-retention short videos and earn 200 pts ($2.00) per 1,000 eligible views.</p>
          </div>
          <button
            onClick={onOpenCreate}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold font-mono text-xs shrink-0 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
          >
            + Create Video
          </button>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-950/40 to-slate-900 border border-blue-500/30 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-blue-300 font-mono">Viewer Watch Rewards</span>
            <p className="text-xs text-slate-300">Watch short-videos continuously to earn up to 200 points ($2.00 USD) daily.</p>
          </div>
          <button
            onClick={onOpenFeed}
            className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold font-mono text-xs shrink-0"
          >
            Watch Feed ▶
          </button>
        </div>
      </div>

      {/* Withdrawal History (Requirement 9 & 12) */}
      <div className="rounded-3xl bg-[#060c1c] border border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white font-mono">Withdrawal History & Blockchain Status</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">{withdrawals.length} Dispatches</span>
        </div>

        {withdrawals.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <Wallet className="w-8 h-8 mx-auto mb-2 opacity-30 text-cyan-400" />
            <p className="text-xs">No withdrawals yet. Reach 500 Points to submit your first on-chain payout!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3">ID / Time</th>
                  <th className="px-5 py-3">Points / USD</th>
                  <th className="px-5 py-3">Network & Wallet</th>
                  <th className="px-5 py-3">Tx Hash</th>
                  <th className="px-5 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {withdrawals.map(wd => (
                  <tr key={wd.id} className="hover:bg-slate-900/40 transition">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-white">{wd.id}</div>
                      <div className="text-[10px] text-slate-500">{new Date(wd.requestedAt).toLocaleString()}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-cyan-300 font-bold">{wd.requestedPoints.toLocaleString()} Pts</div>
                      <div className="text-emerald-400 text-[11px]">${wd.usdAmount.toFixed(2)} USD</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-white">{wd.network}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{wd.walletAddress}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      {wd.txHash ? (
                        <span className="text-emerald-400/90 truncate max-w-[120px] block font-mono text-[10px]">
                          {wd.txHash.slice(0, 10)}...{wd.txHash.slice(-6)}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[10px]">Pending Mempool</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        wd.status === 'COMPLETED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : wd.status === 'PROCESSING'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse'
                          : wd.status === 'REJECTED'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}>
                        {wd.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Withdrawal Modal */}
      <BlueTixaWithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        availablePoints={summary.availablePoints}
        onSuccess={() => {
          setSummary(blueTixaRewardEngine.getUserRewardSummary(userId));
        }}
      />
    </div>
  );
};
