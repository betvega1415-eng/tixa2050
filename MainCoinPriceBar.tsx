import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Sparkles, 
  ArrowUpRight, 
  Info, 
  ChevronRight, 
  Zap, 
  Globe2, 
  Layers,
  Globe,
  Coins,
  ChevronDown,
  ArrowLeftRight
} from 'lucide-react';
import { exchangeEngine } from '../../core/exchangeEngine';
import { forexTradingEngine } from '../../core/forexTradingEngine';
import { currencyConversionEngine, CurrencyRateInfo } from '../../core/currencyConversionEngine';
import { TixaMultiCurrencyModal } from './TixaMultiCurrencyModal';
import { ActiveTab } from './Navbar';

interface MainCoinPriceBarProps {
  onTradeClick?: () => void;
  onExploreClick?: () => void;
}

export const MainCoinPriceBar: React.FC<MainCoinPriceBarProps> = ({
  onTradeClick,
  onExploreClick
}) => {
  const [livePriceUsd, setLivePriceUsd] = useState(currencyConversionEngine.getLiveTixaPriceUsd());
  const [preferredCurrency, setPreferredCurrency] = useState(currencyConversionEngine.getPreferredCurrency());
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const [isMultiCurrencyModalOpen, setIsMultiCurrencyModalOpen] = useState(false);
  const [tickAnimation, setTickAnimation] = useState(false);
  const [tickDirection, setTickDirection] = useState<'UP' | 'DOWN'>('UP');

  const popularCurrencies = ['BDT', 'USD', 'EUR', 'GBP', 'INR', 'AED', 'SAR', 'JPY', 'NISI', 'SARA', 'MUN'];

  useEffect(() => {
    let lastPrice = currencyConversionEngine.getLiveTixaPriceUsd();

    const update = () => {
      const current = currencyConversionEngine.getLiveTixaPriceUsd();
      if (current !== lastPrice) {
        setTickDirection(current > lastPrice ? 'UP' : 'DOWN');
        setTickAnimation(true);
        lastPrice = current;
        const timer = setTimeout(() => setTickAnimation(false), 600);
        return () => clearTimeout(timer);
      }
      setLivePriceUsd(current);
      setPreferredCurrency(currencyConversionEngine.getPreferredCurrency());
    };

    const unsubCurrency = currencyConversionEngine.subscribe(update);
    const unsubForex = forexTradingEngine.subscribe(update);

    return () => {
      unsubCurrency();
      unsubForex();
    };
  }, []);

  const curInfo = currencyConversionEngine.getCurrencyInfo(preferredCurrency);
  const convertedPriceStr = currencyConversionEngine.formatTixaPriceInCurrency(preferredCurrency, 1);
  const tixaPair = forexTradingEngine.getPair('TIXA_USDT') || {
    currentPrice: 990000.00,
    change24h: 12.45,
    high24h: 1045000.00,
    low24h: 942000.00,
    volume24h: 148500000
  };

  const isPositive = tixaPair.change24h >= 0;
  const marketCap = (livePriceUsd * 250000000).toLocaleString('en-US', {
    maximumFractionDigits: 0
  });

  const handleSelectCurrency = (code: string) => {
    currencyConversionEngine.setPreferredCurrency(code);
    setPreferredCurrency(code);
    setIsCurrencyDropdownOpen(false);
  };

  return (
    <>
      <div id="tixa-mainnet-price-bar" className="w-full bg-gradient-to-r from-[#070d1e] via-[#09142c] to-[#070d1e] border-b border-cyan-500/25 py-2 px-3 sm:px-6 text-xs shadow-lg relative z-40">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 font-mono">
          
          {/* Left: Native Coin Identity & Real-Time Price with Multi-Currency Converted Value */}
          <div className="flex items-center gap-2.5 sm:gap-4 flex-wrap">
            {/* Logo & Badge */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center p-0.5 shadow-md shadow-cyan-500/20">
                <Zap className="w-3.5 h-3.5 text-black" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-white tracking-wider font-heading text-sm">
                  TIXA
                </span>
                <span className="text-[10px] text-cyan-400 font-bold bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-500/30">
                  NATIVE COIN
                </span>
              </div>
            </div>

            {/* Base USD Live Price */}
            <div className="flex items-center gap-1.5">
              <span className={`text-sm sm:text-base font-extrabold transition-all duration-300 ${
                tickAnimation ? (tickDirection === 'UP' ? 'text-emerald-300 scale-105' : 'text-rose-300 scale-105') : 'text-white'
              }`}>
                ${livePriceUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>

              <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                isPositive 
                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-rose-950/80 text-rose-400 border border-rose-500/30'
              }`}>
                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {isPositive ? '+' : ''}{tixaPair.change24h.toFixed(2)}%
              </span>
            </div>

            {/* REAL-TIME CONVERTED CURRENCY BADGE & SELECTOR */}
            <div className="relative">
              <button
                type="button"
                id="realtime-currency-selector-btn"
                onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 font-bold text-xs transition-all shadow-sm shadow-cyan-950/50"
                title="Change display currency (Real-Time Conversion)"
              >
                <span>{curInfo.flag}</span>
                <span className="font-extrabold text-white">≈ {convertedPriceStr}</span>
                <span className="text-[10px] text-cyan-400 font-normal">({preferredCurrency})</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* Quick Currency Dropdown Menu */}
              {isCurrencyDropdownOpen && (
                <div className="absolute left-0 mt-2 w-64 max-h-80 overflow-y-auto rounded-2xl bg-[#090e1f] border border-cyan-500/50 shadow-2xl p-2 z-50 divide-y divide-slate-800/80">
                  <div className="px-2.5 py-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
                    <span>Select Real-Time Currency</span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCurrencyDropdownOpen(false);
                        setIsMultiCurrencyModalOpen(true);
                      }}
                      className="text-cyan-400 hover:text-cyan-300 underline lowercase"
                    >
                      all (25+)
                    </button>
                  </div>

                  <div className="py-1 space-y-1">
                    {popularCurrencies.map(code => {
                      const info = currencyConversionEngine.getCurrencyInfo(code);
                      const rateStr = currencyConversionEngine.formatTixaPriceInCurrency(code, 1);
                      const isSelected = preferredCurrency === code;
                      return (
                        <button
                          key={code}
                          type="button"
                          onClick={() => handleSelectCurrency(code)}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                            isSelected 
                              ? 'bg-cyan-500 text-black font-bold' 
                              : 'hover:bg-slate-900 text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span>{info.flag}</span>
                            <span className="text-xs">{info.code}</span>
                          </div>
                          <span className={`text-xs font-mono font-bold ${isSelected ? 'text-black' : 'text-cyan-300'}`}>
                            {rateStr}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCurrencyDropdownOpen(false);
                        setIsMultiCurrencyModalOpen(true);
                      }}
                      className="w-full py-1.5 text-center text-xs text-cyan-300 hover:bg-cyan-950 rounded-lg transition-colors font-bold flex items-center justify-center gap-1"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Open Multi-Currency Matrix</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Matrix Modal trigger button */}
            <button
              type="button"
              id="open-multi-currency-matrix-btn"
              onClick={() => setIsMultiCurrencyModalOpen(true)}
              className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-[10px] transition-colors"
              title="View all 25+ real-time currency conversions"
            >
              <ArrowLeftRight className="w-3 h-3 text-cyan-400" />
              <span>All Currencies</span>
            </button>
          </div>

          {/* Center / Right: 24H High, Low, Volume, Market Cap */}
          <div className="flex items-center gap-3 sm:gap-5 text-[11px] text-slate-300 flex-wrap">
            <div className="hidden xl:flex items-center gap-1.5">
              <span className="text-slate-500">24H HIGH:</span>
              <span className="text-emerald-400 font-semibold">${tixaPair.high24h.toLocaleString()}</span>
            </div>

            <div className="hidden xl:flex items-center gap-1.5">
              <span className="text-slate-500">24H LOW:</span>
              <span className="text-rose-400 font-semibold">${tixaPair.low24h.toLocaleString()}</span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5">
              <span className="text-slate-500">24H VOL:</span>
              <span className="text-cyan-300 font-semibold">${(tixaPair.volume24h / 1000000).toFixed(2)}M</span>
            </div>

            <div className="hidden lg:flex items-center gap-1.5">
              <span className="text-slate-500">MARKET CAP:</span>
              <span className="text-indigo-300 font-semibold">${marketCap}</span>
            </div>

            {/* Quick CTA Actions */}
            <div className="flex items-center gap-2">
              {onTradeClick && (
                <button
                  type="button"
                  id="header-trade-action-btn"
                  onClick={onTradeClick}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs shadow-sm shadow-cyan-500/20 hover:scale-[1.02] transition-all"
                >
                  <span>Trade</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Currency Rate Matrix & Converter Modal */}
      <TixaMultiCurrencyModal
        isOpen={isMultiCurrencyModalOpen}
        onClose={() => setIsMultiCurrencyModalOpen(false)}
        onSelectCurrency={(code) => {
          setPreferredCurrency(code);
          setIsMultiCurrencyModalOpen(false);
        }}
      />
    </>
  );
};

