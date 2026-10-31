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
  X,
  TrendingUp,
  Send,
  RefreshCw,
  Info
} from 'lucide-react';
import { authEngine } from '../../core/authEngine';
import { UserAccount, AffiliateCommissionRecord, AffiliateWithdrawalRecord } from '../../types/auth';
import { nativeMarketEngine } from '../../core/nativeMarketEngine';
import { soundEngine } from '../../core/soundEngine';
import { AddressQrCode } from '../common/AddressQrCode';
import confetti from 'canvas-confetti';

export interface AffiliateDashboardProps {
  account: UserAccount;
  onRefreshAccount: () => void;
  className?: string;
}

export const AffiliateDashboard: React.FC<AffiliateDashboardProps> = ({
  account,
  onRefreshAccount,
  className = ''
}) => {
  // Copy states
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  // In-line & modal withdrawal states
  const [withdrawAddressInput, setWithdrawAddressInput] = useState<string>(account.walletAddress || '');
  const [withdrawAmountUSD, setWithdrawAmountUSD] = useState<string>('');
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawSuccess, setWithdrawSuccess] = useState<string | null>(null);
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);

  // Calculator State (+গানিতিক হিসাব: deposit * 0.0254)
  const [calcDepositUSD, setCalcDepositUSD] = useState<number>(1000);

  // Real-time TIXA price tracking
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

  // Update default withdraw address if account changes
  useEffect(() => {
    if (account.walletAddress && (!withdrawAddressInput || withdrawAddressInput === '')) {
      setWithdrawAddressInput(account.walletAddress);
    }
  }, [account.walletAddress]);

  // Derived affiliate metadata
  const affiliateCode = account.affiliateCode || `TIXA-AFF-${account.id.slice(-6).toUpperCase()}`;
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://tixapay.network';
  const affiliateLink = `${origin}/?ref=${affiliateCode}`;

  const availableBalanceUSD = account.affiliateBalanceUSD || 0;
  const totalEarnedUSD = account.affiliateTotalEarnedUSD || 0;
  const totalWithdrawnUSD = account.affiliateWithdrawnUSD || 0;
  const totalReferrals = account.affiliateTotalReferrals || 0;
  const commissions: AffiliateCommissionRecord[] = account.affiliateCommissions || [];
  const withdrawals: AffiliateWithdrawalRecord[] = account.affiliateWithdrawals || [];

  // TIXA conversion
  const availableTixaEquivalent = tixaPrice > 0 ? (availableBalanceUSD / tixaPrice) : 0;

  // Copy code handler
  const handleCopyCode = () => {
    navigator.clipboard.writeText(affiliateCode);
    setCopiedCode(true);
    soundEngine.play('click');
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // Copy link handler
  const handleCopyLink = () => {
    navigator.clipboard.writeText(affiliateLink);
    setCopiedLink(true);
    soundEngine.play('click');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Execute withdrawal to the specified TIXAPAY address
  const handleExecuteWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError(null);
    setWithdrawSuccess(null);

    const amount = parseFloat(withdrawAmountUSD);
    if (isNaN(amount) || amount <= 0) {
      setWithdrawError('Please enter a valid withdrawal amount greater than zero.');
      return;
    }

    if (amount > availableBalanceUSD) {
      setWithdrawError(`Insufficient affiliate balance. Available: $${availableBalanceUSD.toFixed(2)} USD.`);
      return;
    }

    const targetAddr = withdrawAddressInput.trim().toLowerCase();
    if (!targetAddr.startsWith('tx1') || targetAddr.length < 15) {
      setWithdrawError('Invalid destination: Must be a valid TIXAPAY Bech32 address starting with "tx1".');
      return;
    }

    setIsSubmittingWithdraw(true);

    try {
      const record = await authEngine.withdrawAffiliateEarnings(
        account.id,
        amount,
        tixaPrice,
        targetAddr
      );

      soundEngine.play('success');
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 }
      });

      setWithdrawSuccess(
        `🎉 Successfully transferred $${amount.toFixed(2)} USD (${record.tixaAmount.toFixed(6)} TIXA) to TIXAPAY address ${targetAddr.slice(0, 10)}...${targetAddr.slice(-6)}!`
      );
      setWithdrawAmountUSD('');
      onRefreshAccount();

      setTimeout(() => {
        setShowWithdrawDialog(false);
        setWithdrawSuccess(null);
      }, 4000);
    } catch (err: any) {
      soundEngine.play('error');
      setWithdrawError(err.message || 'Withdrawal execution failed.');
    } finally {
      setIsSubmittingWithdraw(false);
    }
  };

  // 2.54% Calculator calculation
  const calculatedCommissionUSD = Number((calcDepositUSD * 0.0254).toFixed(4));
  const calculatedTixaEquiv = tixaPrice > 0 ? (calculatedCommissionUSD / tixaPrice) : 0;

  return (
    <div className={`p-6 sm:p-8 rounded-3xl bg-[#060b1e] border border-cyan-500/30 space-y-7 shadow-2xl relative overflow-hidden ${className}`}>
      {/* Background Ambient Glows */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center text-black font-extrabold shadow-lg shadow-cyan-500/25">
            <Share2 className="w-6 h-6 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl sm:text-2xl font-extrabold text-white font-heading">
                Affiliate Dashboard
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>2.54% Commission Active</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Live statistics, referral tracking, and separate unmerged affiliate balance with instant TIXAPAY withdrawal
            </p>
          </div>
        </div>

        {/* Quick Action Button */}
        <button
          type="button"
          onClick={() => setShowWithdrawDialog(true)}
          disabled={availableBalanceUSD <= 0}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs font-mono transition-all shadow-lg ${
            availableBalanceUSD > 0
              ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-black shadow-emerald-500/25 hover:scale-[1.02]'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4" />
          <span>Withdraw to TIXAPAY Address</span>
        </button>
      </div>

      {/* Row 1: Referral Code & Sharing Link Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Referral Code Card */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300 flex items-center gap-1.5 font-bold">
              <Gift className="w-4 h-4 text-cyan-400" />
              <span>Your Referral Code</span>
            </span>
            <span className="text-[10px] text-cyan-400 font-mono">1-Click Copy</span>
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
              <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-500">Share this code with friends to enter in the registration referral box.</p>
        </div>

        {/* Referral Link Card */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300 flex items-center gap-1.5 font-bold">
              <Share2 className="w-4 h-4 text-emerald-400" />
              <span>Your Affiliate Referral Link</span>
            </span>
            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1"
            >
              <QrCode className="w-3 h-3" />
              <span>Show QR Code</span>
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
              <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-500">Auto-fills your referral code upon opening registration.</p>
        </div>
      </div>

      {/* Row 2: Live Statistics & Unmerged Balance Display */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#07132a] via-[#091b3b] to-[#081735] border border-cyan-500/40 relative overflow-hidden shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-cyan-300 font-bold uppercase tracking-wider">
                Unmerged Affiliate Earnings Balance
              </span>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">
                Tracked Separately
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-300 to-blue-400">
                ${availableBalanceUSD.toFixed(2)} USD
              </span>
              <span className="text-xs sm:text-sm font-mono text-slate-400">
                (≈ {availableTixaEquivalent.toFixed(6)} TIXA @ ${tixaPrice.toLocaleString()})
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowWithdrawDialog(true)}
            disabled={availableBalanceUSD <= 0}
            className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all ${
              availableBalanceUSD > 0
                ? 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-md shadow-cyan-500/20 hover:scale-[1.02]'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>Withdraw Earnings</span>
          </button>
        </div>

        {/* System Insulation Notice */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-cyan-500/20 text-xs text-slate-300 space-y-1 font-mono">
          <div className="flex items-center gap-2 text-cyan-300 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Balance Isolation Protocol:</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed pl-6">
            • As requested, this affiliate balance is <strong>strictly unmerged</strong> from your main trading and wallet balance.<br />
            • Earnings accrue instantly upon every referral deposit (2.54%) and can be withdrawn directly into any valid <strong>TIXAPAY mainnet address (tx1...)</strong>.
          </p>
        </div>

        {/* 4 Live Stats Metric Boxes */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 font-mono text-xs">
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-semibold">TOTAL EARNINGS</span>
            <span className="text-lg font-black text-emerald-400 block mt-0.5">${totalEarnedUSD.toFixed(2)} USD</span>
            <span className="text-[9px] text-slate-500 block">Lifetime 2.54% earned</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-semibold">TOTAL WITHDRAWN</span>
            <span className="text-lg font-black text-cyan-300 block mt-0.5">${totalWithdrawnUSD.toFixed(2)} USD</span>
            <span className="text-[9px] text-slate-500 block">Sent to TIXAPAY address</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-semibold">TOTAL REFERRALS</span>
            <span className="text-lg font-black text-white block mt-0.5">{totalReferrals} Users</span>
            <span className="text-[9px] text-slate-500 block">Joined via your link</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-semibold">COMMISSION RATE</span>
            <span className="text-lg font-black text-yellow-400 block mt-0.5">2.54%</span>
            <span className="text-[9px] text-slate-500 block">Of every deposit</span>
          </div>
        </div>
      </div>

      {/* Row 3: In-Card Quick Withdraw to TIXAPAY Address Section */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-cyan-500/25 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ArrowDownLeft className="w-5 h-5 text-cyan-400" />
            <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
              Withdraw to TIXAPAY Address
            </h4>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-800/60">
            Target Address: Bech32 (tx1...)
          </span>
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
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Input field: Withdraw to TIXAPAY address */}
            <div className="md:col-span-7 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-slate-300 font-bold flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Withdraw to TIXAPAY Address:</span>
                </label>
                {account.walletAddress && (
                  <button
                    type="button"
                    onClick={() => setWithdrawAddressInput(account.walletAddress)}
                    className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <span>Use My Address</span>
                  </button>
                )}
              </div>

              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="tx1..."
                  value={withdrawAddressInput}
                  onChange={e => {
                    setWithdrawAddressInput(e.target.value);
                    if (withdrawError) setWithdrawError(null);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-white font-mono text-xs placeholder-slate-600 focus:outline-none"
                />
              </div>
              <p className="text-[10px] text-slate-500">
                Enter your or any verified TIXAPAY address (must start with "tx1").
              </p>
            </div>

            {/* Input field: Withdraw Amount USD */}
            <div className="md:col-span-5 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-slate-300 font-bold">
                  Amount ($ USD):
                </label>
                <span className="text-[10px] text-cyan-400">
                  Max: ${availableBalanceUSD.toFixed(2)}
                </span>
              </div>

              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 font-mono">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={availableBalanceUSD}
                  required
                  placeholder="0.00"
                  value={withdrawAmountUSD}
                  onChange={e => {
                    setWithdrawAmountUSD(e.target.value);
                    if (withdrawError) setWithdrawError(null);
                  }}
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-white font-mono text-xs placeholder-slate-600 focus:outline-none"
                />
              </div>

              {/* Percentage shortcut buttons */}
              <div className="flex items-center gap-1.5 pt-0.5">
                {[0.25, 0.5, 0.75, 1.0].map(pct => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setWithdrawAmountUSD((availableBalanceUSD * pct).toFixed(2))}
                    className="flex-1 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 font-mono transition-colors"
                  >
                    {pct === 1.0 ? 'MAX' : `${pct * 100}%`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-800/80">
            <div className="text-[11px] text-slate-400">
              {parseFloat(withdrawAmountUSD) > 0 ? (
                <span>
                  Receiving: <strong className="text-emerald-400">{(parseFloat(withdrawAmountUSD) / tixaPrice).toFixed(6)} TIXA</strong> (@ ${tixaPrice.toLocaleString()} rate)
                </span>
              ) : (
                <span>Zero fee on protocol affiliate settlements</span>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmittingWithdraw || availableBalanceUSD <= 0}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs font-mono transition-all flex items-center justify-center gap-2 ${
                availableBalanceUSD > 0
                  ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-black shadow-lg shadow-emerald-500/20 hover:scale-[1.01]'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isSubmittingWithdraw ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing Withdrawal...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Execute Withdrawal to TIXAPAY Address</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Row 4: List of Referrals with Contribution Amounts */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-200 font-bold">
            <Users className="w-4 h-4 text-cyan-400" />
            <span>Referrals & Contribution Amounts ({commissions.length})</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Real-Time 2.54% Commission Ledger</span>
        </div>

        {commissions.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-2">
            <Users className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400 font-mono">
              No referral contributions recorded yet. Share your referral link or code to start earning 2.54% of every deposit!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/80">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-slate-900/90 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Date & Time</th>
                  <th className="py-2.5 px-3">Referred User</th>
                  <th className="py-2.5 px-3">Deposit Ref / Tx</th>
                  <th className="py-2.5 px-3 text-right">Deposit Amount</th>
                  <th className="py-2.5 px-3 text-center">Rate</th>
                  <th className="py-2.5 px-3 text-right">Contribution (2.54%)</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {commissions.map(c => (
                  <tr key={c.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-2.5 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(c.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-white font-medium">
                      {c.referredUserEmail}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px] font-mono">
                      {c.depositTxId.slice(0, 14)}...
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-300 font-bold">
                      ${c.depositAmountUSD.toFixed(2)} USD
                    </td>
                    <td className="py-2.5 px-3 text-center text-cyan-400 font-bold">
                      {(c.commissionRate * 100).toFixed(2)}%
                    </td>
                    <td className="py-2.5 px-3 text-right text-emerald-400 font-black">
                      +${c.commissionEarnedUSD.toFixed(2)} USD
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[9px] bg-emerald-950 border border-emerald-800/60 text-emerald-400 font-bold">
                        CREDITED
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Row 5: Mathematical 2.54% Commission Calculator */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-cyan-500/20 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-cyan-400" />
            <h4 className="text-sm font-bold text-white font-mono">
              2.54% Commission Mathematical Calculator
            </h4>
          </div>
          <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
            Formula: Deposit Amount × 0.0254
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-6 space-y-2">
            <label className="block text-xs font-mono text-slate-300">
              Potential Referral Deposit Amount ($ USD):
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-mono">$</span>
              <input
                type="number"
                min={10}
                max={1000000}
                step={50}
                value={calcDepositUSD}
                onChange={e => setCalcDepositUSD(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white font-mono focus:border-cyan-400 focus:outline-none"
              />
            </div>

            {/* Presets */}
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
              <span className="text-slate-400">Referral Deposit:</span>
              <span className="text-white font-bold">${calcDepositUSD.toLocaleString()} USD</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Commission Rate:</span>
              <span className="text-cyan-400 font-bold">2.54% (0.0254)</span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-emerald-300 font-bold">Your Earnings (USD):</span>
              <span className="text-lg font-black text-emerald-400">
                +${calculatedCommissionUSD.toFixed(2)} USD
              </span>
            </div>
            <div className="text-[10px] text-slate-500 text-right">
              ≈ {calculatedTixaEquiv.toFixed(6)} TIXA @ ${tixaPrice.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-sm rounded-3xl bg-[#070d1e] border border-cyan-500/40 p-6 text-center space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-sm font-bold text-white font-mono">Affiliate Referral QR</span>
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
              Copy Link
            </button>
          </div>
        </div>
      )}

      {/* MODAL: Dedicated Withdrawal Dialog */}
      {showWithdrawDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#070d1e] border border-cyan-500/40 shadow-2xl p-6 text-slate-100 space-y-5 my-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 to-emerald-500 flex items-center justify-center text-black font-bold">
                  <ArrowDownLeft className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-heading">
                    Withdraw Affiliate Earnings
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Direct Settlement to TIXAPAY Address
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowWithdrawDialog(false)}
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
              {/* Target Address Input */}
              <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-950 border border-cyan-500/30">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-bold flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Destination TIXAPAY Address:</span>
                  </label>
                  {account.walletAddress && (
                    <button
                      type="button"
                      onClick={() => setWithdrawAddressInput(account.walletAddress)}
                      className="text-[10px] text-cyan-400 hover:underline"
                    >
                      Autofill Primary Address
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  required
                  placeholder="tx1..."
                  value={withdrawAddressInput}
                  onChange={e => {
                    setWithdrawAddressInput(e.target.value);
                    if (withdrawError) setWithdrawError(null);
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-black border border-slate-700 focus:border-cyan-400 text-cyan-300 font-mono text-xs focus:outline-none"
                />
                <p className="text-[10px] text-slate-500">
                  Address must be a valid Bech32 TIXAPAY address starting with "tx1".
                </p>
              </div>

              {/* Amount to withdraw */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Withdrawal Amount ($ USD):</span>
                  <span className="text-cyan-400">Available: ${availableBalanceUSD.toFixed(2)} USD</span>
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
                    <span>Receiving TIXA:</span>
                    <span className="text-emerald-400 font-bold text-sm">
                      {(parseFloat(withdrawAmountUSD) / tixaPrice).toFixed(6)} TIXA
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span>Conversion Rate:</span>
                    <span>1 TIXA = ${tixaPrice.toLocaleString()} USD</span>
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowWithdrawDialog(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingWithdraw || availableBalanceUSD <= 0}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-black font-bold text-xs font-mono transition-all hover:scale-[1.02] shadow-md shadow-emerald-500/20"
                >
                  {isSubmittingWithdraw ? 'Processing...' : 'Confirm Withdrawal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
