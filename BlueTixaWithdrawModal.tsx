import React, { useState } from 'react';
import { 
  X, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Coins, 
  Lock, 
  Wallet, 
  AlertCircle, 
  ExternalLink,
  RefreshCw,
  Copy,
  Check,
  Building2,
  Sparkles
} from 'lucide-react';
import { SupportedWithdrawalNetwork, BlueTixaWithdrawal } from '../../types/blueTixa';
import { blueTixaRewardEngine } from '../../core/blueTixaRewardEngine';
import { authEngine } from '../../core/authEngine';
import confetti from 'canvas-confetti';

interface BlueTixaWithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  availablePoints: number;
  onSuccess: (withdrawal: BlueTixaWithdrawal) => void;
}

export const BlueTixaWithdrawModal: React.FC<BlueTixaWithdrawModalProps> = ({
  isOpen,
  onClose,
  availablePoints,
  onSuccess
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [pointsInput, setPointsInput] = useState<string>('500');
  const [selectedNetwork, setSelectedNetwork] = useState<SupportedWithdrawalNetwork>('TIXA_MAINNET');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [securityPin, setSecurityPin] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [completedWithdrawal, setCompletedWithdrawal] = useState<BlueTixaWithdrawal | null>(null);
  const [copiedTx, setCopiedTx] = useState(false);

  const session = authEngine.getSession();
  const config = blueTixaRewardEngine.getAdminConfig();

  // Set default wallet address if user has session
  React.useEffect(() => {
    if (session?.walletAddress && !walletAddress) {
      setWalletAddress(session.walletAddress);
    }
  }, [session, isOpen]);

  if (!isOpen) return null;

  const parsedPoints = parseInt(pointsInput, 10) || 0;
  const usdValue = Number((parsedPoints / config.pointsPerUsd).toFixed(2));
  const minRequired = config.minWithdrawalPoints; // 500 points = $5.00

  // Calculate live TIXA equivalent if selected
  const liveTixaCoinPrice = 990000.00;
  const tixaCoinPayout = Number((usdValue / liveTixaCoinPrice).toFixed(6));

  const networkOptions: { id: SupportedWithdrawalNetwork; name: string; asset: 'TIXA' | 'USDT'; fee: string; badge: string }[] = [
    { id: 'TIXA_MAINNET', name: 'TIXA Native Mainnet v2.4', asset: 'TIXA', fee: '0.00% (Instant Free)', badge: 'Recommended' },
    { id: 'USDT_TRC20', name: 'Tether USDT (TRC-20)', asset: 'USDT', fee: '0.00% Promo', badge: 'Fast' },
    { id: 'USDT_BEP20', name: 'Tether USDT (BNB Chain BEP-20)', asset: 'USDT', fee: '0.00% Promo', badge: 'Low Gas' },
    { id: 'USDT_ERC20', name: 'Tether USDT (Ethereum ERC-20)', asset: 'USDT', fee: '$1.00 USD Gas', badge: 'Standard' }
  ];

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (parsedPoints < minRequired) {
      setErrorMsg(`Minimum withdrawal is ${minRequired} Points ($${(minRequired / config.pointsPerUsd).toFixed(2)} USD).`);
      return;
    }
    if (parsedPoints > availablePoints) {
      setErrorMsg(`Entered amount exceeds your verified available balance (${availablePoints.toLocaleString()} Points).`);
      return;
    }
    setStep(2);
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!walletAddress || walletAddress.trim().length < 10) {
      setErrorMsg('Please enter a valid non-custodial or exchange public receiving address.');
      return;
    }
    setStep(3);
  };

  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (securityPin.length < 4) {
      setErrorMsg('Please enter your 4 to 6 digit security authorization PIN / 2FA code.');
      return;
    }

    setIsProcessing(true);

    const result = blueTixaRewardEngine.requestWithdrawal({
      userId: session?.walletAddress || 'CURRENT_USER',
      userName: session?.email ? session.email.split('@')[0] : 'TIXA Creator',
      walletAddress: walletAddress.trim(),
      network: selectedNetwork,
      points: parsedPoints
    });

    if (!result.success || !result.withdrawal) {
      setIsProcessing(false);
      setErrorMsg(result.error || 'Withdrawal dispatch failed');
      return;
    }

    // Step 4: Success confirmation
    setCompletedWithdrawal(result.withdrawal);
    setIsProcessing(false);
    setStep(4);
    onSuccess(result.withdrawal);

    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (e) {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
      <div 
        className="w-full max-w-lg bg-[#060b18] border border-cyan-500/30 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.25)] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#081026]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.4)]">
              <Wallet className="w-4 h-4 text-black" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-mono tracking-wide">BLUE TIXA Wallet Withdrawal</h3>
              <p className="text-[10px] text-cyan-400 font-mono">100 Points = $1.00 USD (Min 500 Pts / $5)</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Multi-Step Indicator */}
        {step < 4 && (
          <div className="px-6 py-2.5 bg-[#070e20] border-b border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
            <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-cyan-400 font-bold' : 'text-slate-500'}`}>
              <span className="w-4 h-4 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-[10px]">1</span>
              <span>Amount</span>
            </div>
            <span className="text-slate-600">→</span>
            <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-cyan-400 font-bold' : 'text-slate-500'}`}>
              <span className="w-4 h-4 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-[10px]">2</span>
              <span>Wallet & Network</span>
            </div>
            <span className="text-slate-600">→</span>
            <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-cyan-400 font-bold' : 'text-slate-500'}`}>
              <span className="w-4 h-4 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-[10px]">3</span>
              <span>Security Auth</span>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 flex items-center gap-2 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: Enter Points */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-4">
              <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-mono">Available Verified Balance</span>
                  <div className="text-xl font-bold text-white font-mono flex items-center gap-1.5 mt-0.5">
                    <Coins className="w-5 h-5 text-amber-400" />
                    <span>{availablePoints.toLocaleString()} Points</span>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-xs text-slate-400">USD Value</span>
                  <div className="text-lg font-bold text-emerald-400">
                    ${(availablePoints / config.pointsPerUsd).toFixed(2)} USD
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300">Enter Points to Withdraw</label>
                <div className="relative">
                  <input
                    type="number"
                    min={minRequired}
                    max={availablePoints}
                    step={10}
                    value={pointsInput}
                    onChange={(e) => setPointsInput(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700/80 rounded-2xl text-lg font-mono font-bold text-cyan-300 focus:outline-none focus:border-cyan-400"
                  />
                  <div className="absolute right-3 top-3 text-xs font-mono text-slate-400">
                    ≈ ${usdValue.toFixed(2)} USD
                  </div>
                </div>
              </div>

              {/* Quick Select Buttons */}
              <div className="grid grid-cols-4 gap-2">
                {[500, 1000, 2500, availablePoints].map((pts, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPointsInput(pts.toString())}
                    className="py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-xs font-mono text-slate-300 hover:text-white transition"
                  >
                    {i === 3 ? 'Max All' : `${pts} pts ($${(pts/100).toFixed(0)})`}
                  </button>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Minimum Withdrawal:</span>
                  <strong className="text-cyan-300">500 Points ($5.00 USD)</strong>
                </div>
                <div className="flex justify-between">
                  <span>Conversion Rate:</span>
                  <strong className="text-white">100 Points = $1.00 USD</strong>
                </div>
              </div>

              <button
                type="submit"
                disabled={parsedPoints < minRequired || parsedPoints > availablePoints}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold font-mono text-xs shadow-[0_0_20px_rgba(6,182,212,0.4)] disabled:opacity-40 flex items-center justify-center gap-2 transition"
              >
                <span>Continue to Wallet Selection</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 2: Wallet Address & Network */}
          {step === 2 && (
            <form onSubmit={handleStep2Submit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-300">Select Payout Asset & Network</label>
                <div className="space-y-2">
                  {networkOptions.map(net => (
                    <label
                      key={net.id}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                        selectedNetwork === net.id
                          ? 'bg-cyan-950/40 border-cyan-400 text-white shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="withdrawalNet"
                          value={net.id}
                          checked={selectedNetwork === net.id}
                          onChange={() => setSelectedNetwork(net.id)}
                          className="accent-cyan-500"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-200">{net.name}</div>
                          <div className="text-[10px] text-slate-500">Asset: {net.asset} • Fee: {net.fee}</div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono">
                        {net.badge}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300 flex items-center justify-between">
                  <span>Recipient Public Wallet Address</span>
                  {session?.walletAddress && (
                    <button
                      type="button"
                      onClick={() => setWalletAddress(session.walletAddress)}
                      className="text-[10px] text-cyan-400 hover:underline"
                    >
                      Use Connected Wallet
                    </button>
                  )}
                </label>
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="Paste your 0x... / TXA... / TRC20 receiving address"
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-2xl text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Non-Custodial Security: We will NEVER request or store your private key or seed phrase.</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs font-bold transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={!walletAddress.trim()}
                  className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold font-mono text-xs shadow-[0_0_15px_rgba(6,182,212,0.3)] disabled:opacity-40 flex items-center justify-center gap-1.5 transition"
                >
                  <span>Review & Verify</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Security Auth PIN */}
          {step === 3 && (
            <form onSubmit={handleStep3Submit} className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs font-mono">
                <div className="text-slate-400 pb-2 border-b border-slate-800 text-xs font-bold text-white uppercase tracking-wider">
                  Withdrawal Summary
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Withdraw Points:</span>
                  <strong className="text-cyan-400">{parsedPoints.toLocaleString()} Points</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">USD Value:</span>
                  <strong className="text-emerald-400">${usdValue.toFixed(2)} USD</strong>
                </div>
                {selectedNetwork === 'TIXA_MAINNET' && (
                  <div className="flex justify-between text-cyan-300">
                    <span>TIXA Coin Amount:</span>
                    <strong>{tixaCoinPayout.toFixed(6)} TIXA</strong>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Network:</span>
                  <strong className="text-white">{selectedNetwork}</strong>
                </div>
                <div className="flex justify-between truncate">
                  <span className="text-slate-400">Destination:</span>
                  <strong className="text-slate-300 truncate max-w-[200px]">{walletAddress}</strong>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Security Authorization PIN / 2FA</span>
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={securityPin}
                  onChange={(e) => setSecurityPin(e.target.value)}
                  placeholder="Enter 4-6 digit PIN (e.g. 123456)"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700/80 rounded-2xl text-center text-lg font-mono font-bold tracking-widest text-cyan-300 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-1/3 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs font-bold transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isProcessing || securityPin.length < 4}
                  className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-bold font-mono text-xs shadow-[0_0_20px_rgba(16,185,129,0.4)] disabled:opacity-40 flex items-center justify-center gap-1.5 transition"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isProcessing ? 'Authorizing & Dispatching...' : 'Confirm & Dispatch Payout'}</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: Transaction Processing / Blockchain Confirmation */}
          {step === 4 && completedWithdrawal && (
            <div className="py-4 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 mx-auto shadow-[0_0_25px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-base font-bold text-white font-mono">Withdrawal Dispatched Successfully!</h4>
                <p className="text-xs text-slate-400 mt-1">
                  {completedWithdrawal.requestedPoints.toLocaleString()} Points (${completedWithdrawal.usdAmount.toFixed(2)} USD) deducted from reward ledger.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-left space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Withdrawal ID:</span>
                  <span className="text-cyan-300 font-bold">{completedWithdrawal.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Network:</span>
                  <span className="text-white">{completedWithdrawal.network}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Receiving Wallet:</span>
                  <span className="text-slate-300 truncate max-w-[200px]">{completedWithdrawal.walletAddress}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-800/80">
                  <span className="text-slate-500">Tx Hash:</span>
                  <div className="flex items-center gap-1 text-[11px] text-emerald-400">
                    <span className="truncate max-w-[140px]">{completedWithdrawal.txHash}</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (completedWithdrawal.txHash) {
                          navigator.clipboard.writeText(completedWithdrawal.txHash);
                          setCopiedTx(true);
                          setTimeout(() => setCopiedTx(false), 2000);
                        }
                      }}
                      className="p-1 hover:text-white"
                    >
                      {copiedTx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold font-mono text-xs shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              >
                Done & Return to BLUE TIXA
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
