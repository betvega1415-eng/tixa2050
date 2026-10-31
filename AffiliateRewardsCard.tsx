import React, { useState, useEffect } from 'react';
import { 
  Share2, 
  Copy, 
  Check, 
  Users, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft,
  ShieldCheck, 
  Sparkles, 
  Calculator, 
  AlertTriangle, 
  CheckCircle2, 
  QrCode, 
  Wallet, 
  Lock, 
  Gift, 
  Clock,
  ExternalLink,
  X
} from 'lucide-react';
import { authEngine } from '../../core/authEngine';
import { UserAccount, AffiliateCommissionRecord, AffiliateWithdrawalRecord } from '../../types/auth';
import { nativeMarketEngine } from '../../core/nativeMarketEngine';
import { soundEngine } from '../../core/soundEngine';
import { AddressQrCode } from '../common/AddressQrCode';
import confetti from 'canvas-confetti';

interface AffiliateRewardsCardProps {
  account: UserAccount;
  onRefreshAccount: () => void;
}

export const AffiliateRewardsCard: React.FC<AffiliateRewardsCardProps> = ({
  account,
  onRefreshAccount
}) => {
  // Copy feedback states
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  // Withdrawal modal states
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmountUSD, setWithdrawAmountUSD] = useState('');
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawSuccess, setWithdrawSuccess] = useState<string | null>(null);
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState(false);

  // Mathematical Calculator State (+গানিতিক হিসাব ভালভাবে মিলাবে)
  const [calcDepositUSD, setCalcDepositUSD] = useState<number>(1000);

  // Active TIXA Price for USD <-> TIXA conversion
  const [tixaPrice, setTixaPrice] = useState<number>(() => {
    return nativeMarketEngine.getTixaCoin().currentPrice || 0.05;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const p = nativeMarketEngine.getTixaCoin().currentPrice;
      if (p && p > 0) setTixaPrice(p);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Compute Affiliate Link
  const affiliateCode = account.affiliateCode || `TIXA-AFF-${account.id.slice(-6).toUpperCase()}`;
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://tixapay.network';
  const affiliateLink = `${origin}/?ref=${affiliateCode}`;

  const availableBalanceUSD = account.affiliateBalanceUSD || 0;
  const totalEarnedUSD = account.affiliateTotalEarnedUSD || 0;
  const totalWithdrawnUSD = account.affiliateWithdrawnUSD || 0;
  const totalReferrals = account.affiliateTotalReferrals || 0;
  const commissions = account.affiliateCommissions || [];
  const withdrawals = account.affiliateWithdrawals || [];

  // TIXA equivalent of affiliate balance
  const availableTixaEquivalent = tixaPrice > 0 ? (availableBalanceUSD / tixaPrice) : 0;

  // Handle Copy Code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(affiliateCode);
    setCopiedCode(true);
    soundEngine.play('click');
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // Handle Copy Link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(affiliateLink);
    setCopiedLink(true);
    soundEngine.play('click');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Execute Withdrawal strictly to user's primary Tixapay address
  const handleExecuteWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError(null);
    setWithdrawSuccess(null);

    const amount = parseFloat(withdrawAmountUSD);
    if (isNaN(amount) || amount <= 0) {
      setWithdrawError('অনুগ্রহ করে সঠিক উইথড্র পরিমাণ লিখুন। (Please enter a valid amount)');
      return;
    }

    if (amount > availableBalanceUSD) {
      setWithdrawError(`পর্যাপ্ত এফিলিয়েট ব্যালেন্স নেই। সর্বোচ্চ ব্যালেন্স: $${availableBalanceUSD.toFixed(2)} USD`);
      return;
    }

    setIsSubmittingWithdraw(true);

    try {
      const record = await authEngine.withdrawAffiliateEarnings(
        account.id,
        amount,
        tixaPrice
      );

      soundEngine.play('success');
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      setWithdrawSuccess(
        `🎉 সফলভাবে $${amount.toFixed(2)} USD (${record.tixaAmount.toFixed(6)} TIXA) আপনার Tixapay মূল অ্যাড্রেসে ট্রান্সফার করা হয়েছে!`
      );
      setWithdrawAmountUSD('');
      onRefreshAccount();

      setTimeout(() => {
        setIsWithdrawModalOpen(false);
        setWithdrawSuccess(null);
      }, 3500);
    } catch (err: any) {
      soundEngine.play('error');
      setWithdrawError(err.message || 'উইথড্র করতে সমস্যা হয়েছে।');
    } finally {
      setIsSubmittingWithdraw(false);
    }
  };

  // 2.54% Exact Math: Deposit * 0.0254
  const calculatedCommissionUSD = Number((calcDepositUSD * 0.0254).toFixed(4));
  const calculatedTixaEquiv = tixaPrice > 0 ? (calculatedCommissionUSD / tixaPrice) : 0;

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-[#060b1e] border border-cyan-500/30 space-y-6 shadow-2xl relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center text-black font-extrabold shadow-lg shadow-cyan-500/25">
            <Share2 className="w-6 h-6 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-extrabold text-white font-heading">
                AFILET LINK & CODE SYSTEM
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>২.৫৪% কমিশন সক্রিয়</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              রেফারাল লিংক বা কোড থেকে একাউন্ট খুললে প্রতি ডিপোজিটের ২.৫৪% আনমার্জড কমিশন আয় করুন
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsWithdrawModalOpen(true)}
          disabled={availableBalanceUSD <= 0}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs font-mono transition-all shadow-lg ${
            availableBalanceUSD > 0
              ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-black shadow-emerald-500/25 hover:scale-[1.02]'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4" />
          <span>Tixapay মূল অ্যাড্রেসে উইথড্র করুন</span>
        </button>
      </div>

      {/* Affiliate Link & Code Display Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Affiliate Code Card */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-1.5 font-bold">
              <Gift className="w-4 h-4 text-cyan-400" />
              <span>আপনার AFILET কোড (Referral Code)</span>
            </span>
            <span className="text-[10px] text-cyan-400 font-mono">Instant 1-Click Copy</span>
          </div>

          <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-black border border-cyan-500/40 font-mono">
            <span className="text-base sm:text-lg font-black text-cyan-300 tracking-wider">
              {affiliateCode}
            </span>
            <button
              type="button"
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition-colors"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-black" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied!' : 'কোড কপি করুন'}</span>
            </button>
          </div>
        </div>

        {/* Affiliate Link Card */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-1.5 font-bold">
              <Share2 className="w-4 h-4 text-emerald-400" />
              <span>আপনার AFILET রেফারাল লিংক</span>
            </span>
            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1"
            >
              <QrCode className="w-3 h-3" />
              <span>QR কোড দেখুন</span>
            </button>
          </div>

          <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-black border border-emerald-500/40 font-mono">
            <span className="text-xs text-slate-300 truncate max-w-[200px] sm:max-w-[260px]">
              {affiliateLink}
            </span>
            <button
              type="button"
              onClick={handleCopyLink}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-colors"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-black" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied!' : 'লিংক কপি করুন'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Affiliate Balance Card (EXPLICIT UNMERGED BALANCE AS REQUESTED) */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#07132a] via-[#091b3b] to-[#081735] border border-cyan-500/40 relative overflow-hidden shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-cyan-300 font-bold uppercase tracking-wider">
                আলাদা এফিলিয়েট কমিশন ব্যালেন্স (Unmerged Affiliate Balance)
              </span>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">
                মূল ব্যালেন্স থেকে আলাদা
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-300 to-blue-400">
                ${availableBalanceUSD.toFixed(2)} USD
              </span>
              <span className="text-xs sm:text-sm font-mono text-slate-400">
                (≈ {availableTixaEquivalent.toFixed(6)} TIXA)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsWithdrawModalOpen(true)}
              disabled={availableBalanceUSD <= 0}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all ${
                availableBalanceUSD > 0
                  ? 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-md shadow-cyan-500/20'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>উইথড্র করুন</span>
            </button>
          </div>
        </div>

        {/* Explicit Rule Disclaimer Notice */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-cyan-500/20 text-xs text-slate-300 space-y-1 font-mono">
          <div className="flex items-center gap-2 text-cyan-300 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>সিস্টেম নিয়মাবলী (System Rule):</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed pl-6">
            • এই ব্যালেন্স মূল ওয়ালেট ব্যালেন্সের সাথে স্বয়ংক্রিয়ভাবে যোগ হবে না।<br />
            • এটি আলাদাভাবে থাকবে এবং শুধু মাত্র আপনার <strong>Tixapay এর মূল অ্যাড্রেসে</strong> (<code className="text-cyan-300">{account.walletAddress.slice(0, 10)}...{account.walletAddress.slice(-6)}</code>) উইথড্র করা যাবে।
          </p>
        </div>

        {/* 4 Stat Boxes Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 font-mono text-xs">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">মোট উপার্জিত কমিশন</span>
            <span className="text-base font-bold text-emerald-400 block mt-0.5">${totalEarnedUSD.toFixed(2)}</span>
            <span className="text-[9px] text-slate-500 block">সর্বমোট ২.৫৪% আয়</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">উইথড্র সম্পন্ন</span>
            <span className="text-base font-bold text-cyan-300 block mt-0.5">${totalWithdrawnUSD.toFixed(2)}</span>
            <span className="text-[9px] text-slate-500 block">মুল এড্রেসে পাঠানো হয়েছে</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">সফল রেফারাল ইউজার</span>
            <span className="text-base font-bold text-white block mt-0.5">{totalReferrals} জন</span>
            <span className="text-[9px] text-slate-500 block">আপনার লিংকে জয়েনকৃত</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">কমিশন রেট</span>
            <span className="text-base font-bold text-yellow-400 block mt-0.5">২.৫৪% লাইফটাইম</span>
            <span className="text-[9px] text-slate-500 block">প্রতিটি ডিপোজিটে</span>
          </div>
        </div>
      </div>

      {/* Interactive Mathematical Deposit Calculator (+গানিতিক হিসাব ভালভাবে মিলাবে) */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-cyan-500/20 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-cyan-400" />
            <h4 className="text-sm font-bold text-white font-mono">
              ২.৫৪% কমিশন গাণিতিক হিসাব ক্যালকুলেটর (Mathematical Calculator)
            </h4>
          </div>
          <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
            Formula: Deposit USD × 0.0254
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-6 space-y-2">
            <label className="block text-xs font-mono text-slate-300">
              রেফারাল ফ্রেন্ডের সম্ভাব্য ডিপোজিট পরিমাণ ($ USD):
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-mono">$</span>
              <input
                type="number"
                min={10}
                max={500000}
                step={50}
                value={calcDepositUSD}
                onChange={e => setCalcDepositUSD(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white font-mono focus:border-cyan-400 focus:outline-none"
              />
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {[100, 500, 1000, 5000, 10000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setCalcDepositUSD(val)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-colors ${
                    calcDepositUSD === val
                      ? 'bg-cyan-500 text-black font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  ${val.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-6 p-4 rounded-xl bg-black border border-cyan-500/40 space-y-2 font-mono">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">ডিপোজিট পরিমাণ:</span>
              <span className="text-white font-bold">${calcDepositUSD.toLocaleString()} USD</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">এফিলিয়েট কমিশন হার:</span>
              <span className="text-cyan-400 font-bold">২.৫৪% (0.0254)</span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-emerald-300 font-bold">আপনার মোট উপার্জন:</span>
              <span className="text-lg font-black text-emerald-400">
                +${calculatedCommissionUSD.toFixed(2)} USD
              </span>
            </div>
            <div className="text-[10px] text-slate-500 text-right">
              ≈ {calculatedTixaEquiv.toFixed(6)} TIXA (বর্তমান রেট অনুযায়ী)
            </div>
          </div>
        </div>
      </div>

      {/* Referral Commissions Log Table */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-300 font-bold">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>রেফারাল ডিপোজিট কমিশন হিস্ট্রি ({commissions.length})</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">রিয়েল-টাইম ২.৫৪% অটো-ক্রেডিট</span>
        </div>

        {commissions.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-2">
            <Users className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400 font-mono">
              এখনও কোনো রেফারাল কমিশন যোগ হয়নি। আপনার AFILET লিংক বন্ধুদের সাথে শেয়ার করুন!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/80">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-slate-900/90 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">তারিখ ও সময়</th>
                  <th className="py-2.5 px-3">রেফারাল ইউজার</th>
                  <th className="py-2.5 px-3">ডিপোজিট পরিমাণ</th>
                  <th className="py-2.5 px-3">হার</th>
                  <th className="py-2.5 px-3 text-right">কমিশন আয় (USD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {commissions.map(c => (
                  <tr key={c.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                      {new Date(c.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-white font-medium">
                      {c.referredUserEmail}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      ${c.depositAmountUSD.toFixed(2)} USD
                    </td>
                    <td className="py-2.5 px-3 text-cyan-400 font-bold">
                      {(c.commissionRate * 100).toFixed(2)}%
                    </td>
                    <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">
                      +${c.commissionEarnedUSD.toFixed(2)} USD
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* WITHDRAW AFFILIATE EARNINGS MODAL */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#070d1e] border border-cyan-500/40 shadow-2xl p-6 text-slate-100 space-y-5 my-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 to-emerald-500 flex items-center justify-center text-black font-bold">
                  <ArrowDownLeft className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-heading">
                    উইথড্র এফিলিয়েট কমিশন ব্যালেন্স
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Strictly to Primary Tixapay Wallet Address
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsWithdrawModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {withdrawError && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500 text-rose-300 text-xs flex items-center gap-2 font-mono">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{withdrawError}</span>
              </div>
            )}

            {withdrawSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs flex items-center gap-2 font-mono">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{withdrawSuccess}</span>
              </div>
            )}

            <form onSubmit={handleExecuteWithdrawal} className="space-y-4 font-mono text-xs">
              {/* Destination Address (LOCKED to Primary Tixapay Address as strictly required) */}
              <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-950 border border-cyan-500/30">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-bold flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>গন্তব্য এড্রেস (Destination Address - LOCKED):</span>
                  </label>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-700/60 text-emerald-400 font-bold">
                    Tixapay মূল এড্রেস
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-black font-mono text-cyan-300 text-xs break-all select-all border border-slate-800">
                  {account.walletAddress}
                </div>
                <p className="text-[10px] text-slate-500">
                  ⚠️ সুরক্ষার জন্য এই ব্যালেন্স শুধুমাত্র আপনার নিজস্ব Tixapay ভল্ট অ্যাড্রেসেই সরাসরি জমা হবে।
                </p>
              </div>

              {/* Amount to withdraw */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">উইথড্র পরিমাণ ($ USD):</span>
                  <span className="text-cyan-400">সর্বোচ্চ প্রাপ্য: ${availableBalanceUSD.toFixed(2)} USD</span>
                </div>

                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-mono">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={availableBalanceUSD}
                    required
                    value={withdrawAmountUSD}
                    onChange={e => setWithdrawAmountUSD(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 text-white font-mono text-sm focus:outline-none"
                  />
                </div>

                {/* Percentage Shortcuts */}
                <div className="flex items-center gap-2 pt-1">
                  {[0.25, 0.5, 0.75, 1.0].map(pct => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setWithdrawAmountUSD((availableBalanceUSD * pct).toFixed(2))}
                      className="flex-1 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 font-mono transition-colors"
                    >
                      {pct === 1.0 ? 'MAX 100%' : `${pct * 100}%`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Estimated TIXA credited */}
              {parseFloat(withdrawAmountUSD) > 0 && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-slate-400">
                  <div className="flex items-center justify-between text-xs">
                    <span>প্রাপ্য TIXA কয়েন:</span>
                    <span className="text-emerald-400 font-bold text-sm">
                      {(parseFloat(withdrawAmountUSD) / tixaPrice).toFixed(6)} TIXA
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span>হিসাব রেট:</span>
                    <span>1 TIXA = ${tixaPrice.toLocaleString()} USD</span>
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsWithdrawModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingWithdraw || availableBalanceUSD <= 0}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-black font-bold text-xs font-mono transition-all hover:scale-[1.02] shadow-md shadow-emerald-500/20"
                >
                  {isSubmittingWithdraw ? 'প্রসেসিং হচ্ছে...' : 'Tixapay মুল এড্রেসে উইথড্র নিশ্চিত করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR CODE MODAL */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-sm rounded-3xl bg-[#070d1e] border border-cyan-500/40 p-6 text-center space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-sm font-bold text-white font-mono">AFILET Referral QR</span>
              <button onClick={() => setShowQrModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="flex justify-center py-2">
              <AddressQrCode address={affiliateLink} size={200} />
            </div>
            <p className="text-xs text-slate-400 font-mono break-all">{affiliateLink}</p>
            <button
              onClick={() => {
                handleCopyLink();
                setShowQrModal(false);
              }}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs font-mono"
            >
              লিংক কপি করুন
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
