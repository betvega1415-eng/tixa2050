import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  DollarSign, 
  ShieldCheck, 
  AlertCircle, 
  Sparkles,
  Zap,
  Info,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  ArrowDownRight,
  Coins
} from 'lucide-react';
import { 
  ForexPair, 
  AccountMode, 
  TradeDirection, 
  TradeDuration 
} from '../../types/forexTrading';
import { currencyConversionEngine, MarketBalanceValuation } from '../../core/currencyConversionEngine';
import { soundEngine } from '../../core/soundEngine';

interface TradingControlsProps {
  pair: ForexPair;
  accountMode: AccountMode;
  availableBalance: number;
  marketValuation?: MarketBalanceValuation;
  onPlaceTrade: (direction: TradeDirection, amount: number, duration: TradeDuration) => Promise<void>;
  onRefillDemo: () => void;
  isPlacing: boolean;
  onOpenDeposit?: () => void;
  onOpenWalletAuth?: () => void;
  isWalletConnected: boolean;
}

export const TradingControls: React.FC<TradingControlsProps> = ({
  pair,
  accountMode,
  availableBalance,
  marketValuation,
  onPlaceTrade,
  onRefillDemo,
  isPlacing,
  onOpenDeposit,
  onOpenWalletAuth,
  isWalletConnected
}) => {
  const [duration, setDuration] = useState<TradeDuration>('10S');
  const [amountInput, setAmountInput] = useState<string>('100');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingDirection, setPendingDirection] = useState<TradeDirection | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const durationOptions: { id: TradeDuration; label: string }[] = [
    { id: '3S', label: '3S' },
    { id: '5S', label: '5S' },
    { id: '10S', label: '10S' },
    { id: '15S', label: '15S' },
    { id: '30S', label: '30S' },
    { id: '1M', label: '1M' },
    { id: '5M', label: '5M' },
    { id: '15M', label: '15M' },
    { id: '30M', label: '30M' },
    { id: '1H', label: '1H' }
  ];

  const quickAmounts = [10, 25, 50, 100, 500, 1000];

  const parsedAmount = parseFloat(amountInput) || 0;
  const potentialProfit = parsedAmount * pair.payoutRate;
  const totalReturn = parsedAmount + potentialProfit;
  const payoutPercentage = Math.round(pair.payoutRate * 100);

  // Real-time conversions
  const liveTixaPrice = currencyConversionEngine.getLiveTixaPriceUsd();
  const preferredCurrency = currencyConversionEngine.getPreferredCurrency();
  const curInfo = currencyConversionEngine.getCurrencyInfo(preferredCurrency);
  const curSymbol = curInfo.symbol || (preferredCurrency === 'BTC' ? '₿' : '$');
  const curDecimals = curInfo.decimals !== undefined ? curInfo.decimals : (curInfo.type === 'CRYPTO' ? 6 : 2);
  
  const enteredTixaEquivalent = liveTixaPrice > 0 ? (parsedAmount / liveTixaPrice) : 0;
  const enteredFiat = currencyConversionEngine.convertUsdToFiat(parsedAmount, preferredCurrency);
  const potentialProfitFiat = currencyConversionEngine.convertUsdToFiat(potentialProfit, preferredCurrency);

  const isDemoExhausted = accountMode === 'DEMO' && availableBalance < 10;
  const isRealInsufficient = accountMode === 'REAL' && (availableBalance < parsedAmount || availableBalance <= 0);

  const handleInitiateTrade = (direction: TradeDirection) => {
    setErrorMessage(null);

    if (parsedAmount <= 0) {
      soundEngine.play('error');
      setErrorMessage('Please enter a valid trade amount.');
      return;
    }

    if (accountMode === 'DEMO') {
      if (availableBalance < parsedAmount) {
        soundEngine.play('error');
        setErrorMessage('Demo balance insufficient. Please refill demo balance.');
        return;
      }
      // Instant execution for demo
      soundEngine.play('trade');
      onPlaceTrade(direction, parsedAmount, duration);
    } else {
      // Real Account
      if (!isWalletConnected) {
        soundEngine.play('tap');
        if (onOpenWalletAuth) onOpenWalletAuth();
        return;
      }
      if (availableBalance < parsedAmount) {
        soundEngine.play('error');
        setErrorMessage(`Insufficient Real Balance ($${availableBalance.toFixed(2)} available).`);
        return;
      }
      // Show confirmation dialog for real funds
      soundEngine.play('tap');
      setPendingDirection(direction);
      setShowConfirmModal(true);
    }
  };

  const handleConfirmRealTrade = async () => {
    if (!pendingDirection) return;
    setShowConfirmModal(false);
    soundEngine.play('trade');
    await onPlaceTrade(pendingDirection, parsedAmount, duration);
    setPendingDirection(null);
  };

  return (
    <div id="forex-trading-controls-panel" className="bg-[#050915] rounded-2xl border border-slate-800/80 p-4 sm:p-5 shadow-2xl flex flex-col gap-4">
      {/* Demo Balance Exhausted Refill Alert */}
      {isDemoExhausted && (
        <div className="p-3.5 rounded-xl bg-amber-950/70 border border-amber-500/50 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2 text-amber-300 text-xs font-mono">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <p className="font-bold">Demo Balance Exhausted</p>
              <p className="text-[11px] text-amber-400/80">Refill $100,000.00 DEMO virtual funds to practice risk-free trading.</p>
            </div>
          </div>
          <button
            type="button"
            id="refill-demo-balance-btn"
            onClick={onRefillDemo}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-mono font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-950/60 transition-all shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>REFILL DEMO BALANCE</span>
          </button>
        </div>
      )}

      {/* Real Balance Insufficient Notice */}
      {accountMode === 'REAL' && isRealInsufficient && (
        <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 flex items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Insufficient Real Balance ($${availableBalance.toFixed(2)} USDT available).</span>
          </div>
          {onOpenDeposit && (
            <button
              type="button"
              onClick={onOpenDeposit}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs font-mono transition-colors"
            >
              Deposit USDT
            </button>
          )}
        </div>
      )}

      {/* Duration Selector */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Trade Expiry Duration</span>
          </span>
          <span className="text-cyan-400 font-bold">{duration}</span>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
          {durationOptions.map(opt => (
            <button
              key={opt.id}
              type="button"
              id={`duration-btn-${opt.id}`}
              onClick={() => setDuration(opt.id)}
              className={`py-2 rounded-xl font-mono text-xs font-bold transition-all ${
                duration === opt.id
                  ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/25 scale-[1.02]'
                  : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Trade Amount & Quick Selectors */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
            <span>Trade Amount (USDT)</span>
          </span>
          <span className="text-slate-400">
            Available: <strong className={accountMode === 'DEMO' ? 'text-amber-400' : 'text-emerald-400'}>
              ${availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </strong>
            {marketValuation && (
              <span className="text-cyan-300 ml-1">({marketValuation.formattedTixa})</span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono font-bold">$</span>
            <input
              type="number"
              id="trade-amount-input"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              placeholder="100.00"
              min="1"
              step="1"
              className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-base font-bold focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <button
            type="button"
            onClick={() => setAmountInput(Math.max(10, Math.floor(availableBalance)).toString())}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs font-bold transition-colors"
          >
            MAX
          </button>
        </div>

        {/* Real-time TIXA Native & Local Fiat Equivalent Pill */}
        <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-cyan-400" />
            <span>TIXA Native Cost:</span>
            <strong className="text-cyan-300">{enteredTixaEquivalent.toFixed(6)} TIXA</strong>
          </div>
          <div className="text-slate-300">
            Local Value: <strong className="text-emerald-400">{curSymbol}{enteredFiat.toLocaleString('en-US', { minimumFractionDigits: curDecimals, maximumFractionDigits: curDecimals })} {preferredCurrency}</strong>
          </div>
        </div>

        {/* Quick Amount Buttons */}
        <div className="grid grid-cols-6 gap-1.5">
          {quickAmounts.map(val => (
            <button
              key={val}
              type="button"
              id={`quick-amount-btn-${val}`}
              onClick={() => setAmountInput(val.toString())}
              className={`py-1.5 rounded-lg text-xs font-mono transition-colors ${
                parsedAmount === val
                  ? 'bg-slate-800 text-cyan-400 border border-cyan-500/40 font-bold'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800/60'
              }`}
            >
              ${val}
            </button>
          ))}
        </div>
      </div>

      {/* Payout & Return Summary Bar */}
      <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800/80 flex items-center justify-between text-xs font-mono">
        <div>
          <span className="text-slate-500 block text-[10px] uppercase">Payout Rate</span>
          <span className="text-cyan-400 font-bold text-sm">+{payoutPercentage}%</span>
        </div>
        <div className="text-right">
          <span className="text-slate-500 block text-[10px] uppercase">Potential Payout</span>
          <span className="text-emerald-400 font-bold text-sm">
            +${potentialProfit.toFixed(2)} <span className="text-slate-400 font-normal text-xs">(${totalReturn.toFixed(2)})</span>
          </span>
          <div className="text-[10px] text-cyan-300">
            ≈ +{liveTixaPrice > 0 ? (potentialProfit / liveTixaPrice).toFixed(6) : '0.000000'} TIXA • +{curSymbol}{potentialProfitFiat.toLocaleString('en-US', { minimumFractionDigits: curDecimals, maximumFractionDigits: curDecimals })} {preferredCurrency}
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-2.5 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Primary BUY/CALL and SELL/PUT Buttons */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        {/* BUY / CALL BUTTON */}
        <button
          type="button"
          id="trade-buy-call-btn"
          disabled={isPlacing || (accountMode === 'REAL' && isRealInsufficient)}
          onClick={() => handleInitiateTrade('CALL')}
          className="relative group overflow-hidden py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 active:scale-[0.98] text-black font-mono font-bold transition-all shadow-lg shadow-emerald-950/40 disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-0.5"
        >
          <div className="flex items-center gap-1.5 text-sm sm:text-base">
            <ArrowUpRight className="w-5 h-5 text-black stroke-[3]" />
            <span>BUY / CALL</span>
          </div>
          <span className="text-[10px] font-semibold text-emerald-950 tracking-wide">
            PROFIT IF HIGHER (+{payoutPercentage}%)
          </span>
        </button>

        {/* SELL / PUT BUTTON */}
        <button
          type="button"
          id="trade-sell-put-btn"
          disabled={isPlacing || (accountMode === 'REAL' && isRealInsufficient)}
          onClick={() => handleInitiateTrade('PUT')}
          className="relative group overflow-hidden py-3.5 px-4 rounded-2xl bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 active:scale-[0.98] text-white font-mono font-bold transition-all shadow-lg shadow-rose-950/40 disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-0.5"
        >
          <div className="flex items-center gap-1.5 text-sm sm:text-base">
            <ArrowDownRight className="w-5 h-5 text-white stroke-[3]" />
            <span>SELL / PUT</span>
          </div>
          <span className="text-[10px] font-semibold text-rose-200 tracking-wide">
            PROFIT IF LOWER (+{payoutPercentage}%)
          </span>
        </button>
      </div>

      {/* Real Account Safety Confirmation Modal */}
      {showConfirmModal && pendingDirection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-[#090e1f] border border-cyan-500/40 shadow-2xl p-5 space-y-4 font-mono text-xs">
            <div className="flex items-center gap-2 text-cyan-400 border-b border-slate-800 pb-3">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <h3 className="font-bold text-sm text-white">Confirm Real Account Trade</h3>
            </div>

            <div className="space-y-2.5 text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Pair:</span>
                <strong className="text-white">{pair.name}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Direction:</span>
                <strong className={pendingDirection === 'CALL' ? 'text-emerald-400' : 'text-rose-400'}>
                  {pendingDirection === 'CALL' ? '▲ BUY / CALL (Price UP)' : '▼ SELL / PUT (Price DOWN)'}
                </strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Trade Amount:</span>
                <div className="text-right">
                  <strong className="text-white">${parsedAmount.toFixed(2)} USDT</strong>
                  <div className="text-[10px] text-cyan-300">≈ {enteredTixaEquivalent.toFixed(6)} TIXA Coins</div>
                  <div className="text-[10px] text-slate-400">≈ {curSymbol}{enteredFiat.toLocaleString('en-US', { minimumFractionDigits: curDecimals, maximumFractionDigits: curDecimals })} {preferredCurrency}</div>
                </div>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Duration:</span>
                <strong className="text-cyan-400">{duration}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Potential Payout:</span>
                <div className="text-right">
                  <strong className="text-emerald-400">+${potentialProfit.toFixed(2)}</strong>
                  <div className="text-[10px] text-cyan-300">≈ +{liveTixaPrice > 0 ? (potentialProfit / liveTixaPrice).toFixed(6) : 0} TIXA</div>
                </div>
              </div>
              <div className="flex justify-between py-1 text-[11px] text-slate-400">
                <span>Network:</span>
                <span className="text-cyan-300">TIXA Mainnet v2.4 (On-Chain Settlement)</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-[11px]">
              This will deduct {enteredTixaEquivalent.toFixed(6)} TIXA from your connected vault and credit profits in real TIXA valuation upon win.
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  setPendingDirection(null);
                }}
                className="py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-real-trade-submit-btn"
                onClick={handleConfirmRealTrade}
                className="py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold shadow-lg shadow-cyan-500/30"
              >
                Confirm & Sign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
