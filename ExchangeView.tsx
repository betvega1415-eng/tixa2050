import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ShieldCheck, 
  Sparkles, 
  RefreshCw, 
  ChevronDown, 
  Clock, 
  DollarSign, 
  Layers, 
  Activity, 
  ExternalLink,
  Lock,
  ArrowLeftRight,
  Zap,
  Globe,
  Coins,
  SlidersHorizontal,
  Check
} from 'lucide-react';
import { 
  ForexPair, 
  AccountMode, 
  TradeDirection, 
  TradeDuration, 
  TimeframeId 
} from '../../types/forexTrading';
import { forexTradingEngine } from '../../core/forexTradingEngine';
import { blockchainEngine } from '../../core/blockchainEngine';
import { authEngine } from '../../core/authEngine';
import { currencyConversionEngine, MarketBalanceValuation } from '../../core/currencyConversionEngine';
import { CandlestickChart } from './CandlestickChart';
import { TradingControls } from './TradingControls';
import { ActiveTradesList } from './ActiveTradesList';
import { TradeHistoryTable } from './TradeHistoryTable';
import { TixaMultiCurrencyModal } from '../common/TixaMultiCurrencyModal';
import confetti from 'canvas-confetti';

interface ExchangeViewProps {
  selectedPairId?: string;
  onSelectPair?: (pairId: string) => void;
  onOpenAuth?: (mode: 'login' | 'register' | 'admin') => void;
  onOpenAuthModal?: () => void;
  onOpenDepositModal?: () => void;
}

export const ExchangeView: React.FC<ExchangeViewProps> = ({ 
  selectedPairId: propSelectedPairId,
  onSelectPair: propOnSelectPair,
  onOpenAuth,
  onOpenAuthModal,
  onOpenDepositModal 
}) => {
  const [pairs, setPairs] = useState<ForexPair[]>(forexTradingEngine.getPairs());
  const [internalSelectedPairId, setInternalSelectedPairId] = useState<string>(propSelectedPairId || 'TIXA_USDT');
  
  const selectedPairId = propSelectedPairId || internalSelectedPairId;
  const setSelectedPairId = (id: string) => {
    setInternalSelectedPairId(id);
    if (propOnSelectPair) {
      propOnSelectPair(id);
    }
  };

  useEffect(() => {
    if (propSelectedPairId) {
      setInternalSelectedPairId(propSelectedPairId);
    }
  }, [propSelectedPairId]);
  const [accountMode, setAccountMode] = useState<AccountMode>('DEMO');
  const [timeframe, setTimeframe] = useState<TimeframeId>('1s');
  const [isPairDropdownOpen, setIsPairDropdownOpen] = useState(false);
  const [isPlacing, setIsPlacing] = useState(false);
  const [tradeSuccessMsg, setTradeSuccessMsg] = useState<string | null>(null);
  const [isMatrixModalOpen, setIsMatrixModalOpen] = useState(false);
  const [preferredCurrency, setPreferredCurrency] = useState(currencyConversionEngine.getPreferredCurrency());

  // Engine state
  const activePair = pairs.find(p => p.id === selectedPairId) || pairs[0];
  const candles = forexTradingEngine.getCandles(selectedPairId, timeframe);
  const activeTrades = forexTradingEngine.getActiveTrades();
  const settledTrades = forexTradingEngine.getSettledTrades();
  const demoBalance = forexTradingEngine.getDemoBalance();

  // Connected Web3 Wallet session
  const session = authEngine.getSession();
  const defaultWallet = 'tx1alexchennoncustodial2050vault99aa';
  const connectedAddress = session?.walletAddress || defaultWallet;
  const isWalletConnected = !!session || true; // true with default non-custodial vault

  const realAccount = blockchainEngine.getOrCreateAccount(connectedAddress);
  const realBalanceTixa = realAccount ? realAccount.balance : 0;
  const liveTixaPrice = currencyConversionEngine.getLiveTixaPriceUsd();

  // Calculate market valuation based on TIXA coin price
  const effectiveTixaHolding = accountMode === 'DEMO' 
    ? (liveTixaPrice > 0 ? demoBalance / liveTixaPrice : 0.1)
    : realBalanceTixa;

  const marketValuation: MarketBalanceValuation = currencyConversionEngine.calculateMarketBalance(
    effectiveTixaHolding,
    activePair,
    preferredCurrency
  );

  const availableBalance = accountMode === 'DEMO' 
    ? demoBalance 
    : marketValuation.totalUsdValue;

  // Refresh subscriptions
  const refreshState = () => {
    setPairs([...forexTradingEngine.getPairs()]);
    setPreferredCurrency(currencyConversionEngine.getPreferredCurrency());
  };

  useEffect(() => {
    const unsubForex = forexTradingEngine.subscribe(refreshState);
    const unsubCurrency = currencyConversionEngine.subscribe(refreshState);
    return () => {
      unsubForex();
      unsubCurrency();
    };
  }, [selectedPairId, timeframe]);

  // Handle Placing Trade
  const handlePlaceTrade = async (direction: TradeDirection, amount: number, duration: TradeDuration) => {
    setIsPlacing(true);
    setTradeSuccessMsg(null);

    try {
      const trade = await forexTradingEngine.placeTrade({
        pairId: selectedPairId,
        accountMode,
        direction,
        amount,
        duration,
        traderAddress: connectedAddress
      });

      const equivalentTixa = (amount / liveTixaPrice).toFixed(6);
      setTradeSuccessMsg(`Trade placed: ${direction} $${amount.toFixed(2)} (${equivalentTixa} TIXA) on ${activePair.name} (${duration})`);
      setTimeout(() => setTradeSuccessMsg(null), 3500);
    } catch (err: any) {
      alert(err.message || 'Failed to execute trade.');
    } finally {
      setIsPlacing(false);
    }
  };

  const handleRefillDemo = () => {
    forexTradingEngine.refillDemoBalance(100000.00);
  };

  const isPositiveChange = activePair.change24h >= 0;

  return (
    <div id="forex-exchange-terminal-view" className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 space-y-4 font-sans">
      {/* TOP HEADER: Pair Selector, Live Ticker, DEMO / REAL Switch, & Account Balance */}
      <div className="bg-[#050915] rounded-2xl border border-slate-800/90 p-3.5 sm:p-4 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-mono">
        {/* Market Pair & Live Price */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Pair Dropdown Button */}
          <div className="relative">
            <button
              type="button"
              id="market-pair-selector-btn"
              onClick={() => setIsPairDropdownOpen(!isPairDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/90 border border-cyan-500/30 hover:border-cyan-400 text-white font-bold text-sm sm:text-base transition-all shadow-md shadow-cyan-950/30"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>{activePair.name}</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {isPairDropdownOpen && (
              <div className="absolute left-0 mt-2 w-72 max-h-96 overflow-y-auto rounded-2xl bg-[#090e1f] border border-cyan-500/40 shadow-2xl p-2 z-50 divide-y divide-slate-800/60">
                <div className="px-3 py-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  Select Trading Pair
                </div>
                {pairs.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setSelectedPairId(p.id);
                      setIsPairDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors ${
                      p.id === selectedPairId
                        ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40'
                        : 'hover:bg-slate-900 text-slate-200'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs">{p.name}</div>
                      <div className="text-[10px] text-slate-400">{p.type} • +{Math.round(p.payoutRate * 100)}% Payout</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold">
                        {p.quote === 'JPY' ? '¥' : (p.quote === 'EUR' ? '€' : (p.quote === 'GBP' ? '£' : '$'))}
                        {p.currentPrice.toLocaleString(undefined, { minimumFractionDigits: p.priceDecimals, maximumFractionDigits: p.priceDecimals })}
                      </div>
                      <div className={`text-[10px] ${p.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {p.change24h >= 0 ? '+' : ''}{p.change24h.toFixed(2)}%
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Live Price Tag */}
          <div className="flex items-center gap-2">
            <span className="text-lg sm:text-2xl font-bold text-white tracking-tight">
              {activePair.quote === 'JPY' ? '¥' : (activePair.quote === 'EUR' ? '€' : (activePair.quote === 'GBP' ? '£' : '$'))}
              {activePair.currentPrice.toLocaleString(undefined, { 
                minimumFractionDigits: activePair.priceDecimals, 
                maximumFractionDigits: activePair.priceDecimals 
              })}
            </span>
            <span className={`px-2 py-0.5 rounded-lg text-xs font-bold flex items-center gap-1 ${
              isPositiveChange
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                : 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
            }`}>
              {isPositiveChange ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{isPositiveChange ? '+' : ''}{activePair.change24h.toFixed(2)}%</span>
            </span>
          </div>

          <div className="hidden xl:flex items-center gap-3 text-xs text-slate-400 border-l border-slate-800 pl-3">
            <span>24h High: <strong className="text-slate-200">${activePair.high24h.toLocaleString()}</strong></span>
            <span>24h Low: <strong className="text-slate-200">${activePair.low24h.toLocaleString()}</strong></span>
            <span>Payout: <strong className="text-cyan-400">+{Math.round(activePair.payoutRate * 100)}%</strong></span>
          </div>
        </div>

        {/* ACCOUNT SWITCHER [ DEMO ] [ REAL ] & LIVE BALANCE DISPLAY (Valued according to TIXA coin price) */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* DEMO / REAL Toggle Switch */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 shadow-inner">
            <button
              type="button"
              id="switch-demo-account-btn"
              onClick={() => setAccountMode('DEMO')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                accountMode === 'DEMO'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>DEMO</span>
            </button>

            <button
              type="button"
              id="switch-real-account-btn"
              onClick={() => setAccountMode('REAL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                accountMode === 'REAL'
                  ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>REAL</span>
            </button>
          </div>

          {/* Account Balance Header Badge */}
          <div className={`px-3.5 py-1.5 rounded-xl border flex items-center gap-2.5 ${
            accountMode === 'DEMO'
              ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
              : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
          }`}>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">
                  {accountMode === 'DEMO' ? 'DEMO POOL' : 'REAL TIXA VALUATION'}
                </span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-700/50">
                  {marketValuation.formattedTixa}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm sm:text-base font-extrabold text-white">
                  ${availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-cyan-300 font-normal">
                  ≈ {marketValuation.formattedPreferredFiat}
                </span>
              </div>
            </div>

            {accountMode === 'DEMO' ? (
              <button
                type="button"
                id="header-refill-demo-btn"
                onClick={handleRefillDemo}
                title="Refill Demo Balance to $100,000.00"
                className="p-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="flex items-center gap-1 text-[10px] text-cyan-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>MAINNET</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* REAL-TIME MARKET VALUATION BRIDGE (Shows active market balance based on TIXA coin price) */}
      <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-[#060e22] via-[#09142e] to-[#060e22] border border-cyan-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs font-mono shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-black font-bold shrink-0 shadow-md shadow-cyan-500/20">
            <Coins className="w-5 h-5 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-white text-sm">
                Active Market Balance for {activePair.name}:
              </span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[11px] font-bold">
                {marketValuation.formattedMarketQuote}
              </span>
              {activePair.base !== 'TIXA' && (
                <span className="text-[11px] text-slate-400">
                  (≈ {marketValuation.marketBaseBalance.toFixed(4)} {activePair.base})
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 pt-0.5">
              Source: <strong className="text-cyan-300">{marketValuation.formattedTixa}</strong> native coins @ live price of <strong className="text-emerald-400">${liveTixaPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong> • Local Equivalent: <strong className="text-cyan-300">{marketValuation.formattedPreferredFiat}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={() => setIsMatrixModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/30 text-cyan-300 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Multi-Currency Rates</span>
          </button>
        </div>
      </div>

      {/* Real Account Web3 Wallet Connection Strip (When REAL mode is selected) */}
      {accountMode === 'REAL' && (
        <div className="p-3 sm:p-3.5 rounded-2xl bg-[#090e1f] border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">Non-Custodial Web3 Vault:</span>
                <span className="text-cyan-300 text-[11px] bg-slate-900 px-2 py-0.5 rounded border border-slate-800 truncate max-w-[160px] sm:max-w-xs">
                  {connectedAddress}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Network: <strong className="text-emerald-400">TIXA Mainnet v2.4</strong> • Holding: <strong className="text-cyan-300">{realBalanceTixa.toFixed(6)} TIXA</strong> (Valued at ${marketValuation.totalUsdValue.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => {
                const acc = blockchainEngine.getOrCreateAccount(connectedAddress);
                alert(`Wallet verified on-chain: ${acc.balance.toFixed(6)} TIXA Coins (Valued at $${(acc.balance * liveTixaPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT)`);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Refresh</span>
            </button>
            {onOpenDepositModal && (
              <button
                type="button"
                id="wallet-deposit-usdt-btn"
                onClick={onOpenDepositModal}
                className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center gap-1 shadow-md shadow-cyan-500/20 transition-all"
              >
                <span>Deposit TIXA / USDT</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Success Notification Banner */}
      {tradeSuccessMsg && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-in fade-in">
          <Zap className="w-4 h-4 text-emerald-400" />
          <span>{tradeSuccessMsg}</span>
        </div>
      )}

      {/* CENTER: Professional Candlestick Chart */}
      <CandlestickChart
        pair={activePair}
        candles={candles}
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        activeTrades={activeTrades}
      />

      {/* Active Trades Live Countdown Cards */}
      <ActiveTradesList
        activeTrades={activeTrades}
        pairs={pairs}
      />

      {/* BOTTOM: Trading Controls (Amount, Duration, Call/Put buttons) */}
      <TradingControls
        pair={activePair}
        accountMode={accountMode}
        availableBalance={availableBalance}
        marketValuation={marketValuation}
        onPlaceTrade={handlePlaceTrade}
        onRefillDemo={handleRefillDemo}
        isPlacing={isPlacing}
        onOpenDeposit={onOpenDepositModal}
        onOpenWalletAuth={onOpenAuth ? () => onOpenAuth('login') : onOpenAuthModal}
        isWalletConnected={isWalletConnected}
      />

      {/* LOWER SECTION: Settled Trade History Table */}
      <TradeHistoryTable
        trades={settledTrades}
      />

      {/* Multi-Currency Rate Matrix Modal */}
      <TixaMultiCurrencyModal
        isOpen={isMatrixModalOpen}
        onClose={() => setIsMatrixModalOpen(false)}
        onSelectCurrency={(code) => {
          setPreferredCurrency(code);
          currencyConversionEngine.setPreferredCurrency(code);
        }}
      />
    </div>
  );
};

