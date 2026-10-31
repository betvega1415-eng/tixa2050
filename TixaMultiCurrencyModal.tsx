import React, { useState, useEffect } from 'react';
import { 
  X, 
  ArrowLeftRight, 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Sparkles, 
  Globe, 
  DollarSign, 
  Coins, 
  Layers, 
  Check, 
  Copy,
  Zap,
  RefreshCw,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import { currencyConversionEngine, CurrencyRateInfo } from '../../core/currencyConversionEngine';
import { forexTradingEngine } from '../../core/forexTradingEngine';

interface TixaMultiCurrencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCurrency?: (currencyCode: string) => void;
}

export const TixaMultiCurrencyModal: React.FC<TixaMultiCurrencyModalProps> = ({
  isOpen,
  onClose,
  onSelectCurrency
}) => {
  const [tixaInput, setTixaInput] = useState<string>('1');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<'ALL' | 'FIAT' | 'CRYPTO' | 'ASIA' | 'EUROPE'>('ALL');
  const [livePriceUsd, setLivePriceUsd] = useState<number>(currencyConversionEngine.getLiveTixaPriceUsd());
  const [preferredCurrency, setPreferredCurrency] = useState<string>(currencyConversionEngine.getPreferredCurrency());
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    const unsub = currencyConversionEngine.subscribe(() => {
      setLivePriceUsd(currencyConversionEngine.getLiveTixaPriceUsd());
      setPreferredCurrency(currencyConversionEngine.getPreferredCurrency());
    });
    return unsub;
  }, []);

  if (!isOpen) return null;

  const allCurrencies = currencyConversionEngine.getAllCurrencies();
  const numTixa = parseFloat(tixaInput) || 0;

  const filteredCurrencies = allCurrencies.filter(cur => {
    const matchesSearch = 
      cur.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cur.name.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'FIAT' && cur.type !== 'FIAT') return false;
    if (filterType === 'CRYPTO' && cur.type !== 'CRYPTO') return false;
    if (filterType === 'ASIA') {
      return ['BDT', 'INR', 'PKR', 'AED', 'SAR', 'QAR', 'JPY', 'MYR', 'IDR', 'SGD', 'CNY'].includes(cur.code);
    }
    if (filterType === 'EUROPE') {
      return ['EUR', 'GBP', 'CHF', 'SEK', 'NOK'].includes(cur.code);
    }
    return true;
  });

  const handleSelectAsPreferred = (code: string) => {
    currencyConversionEngine.setPreferredCurrency(code);
    setPreferredCurrency(code);
    if (onSelectCurrency) onSelectCurrency(code);
  };

  const handleCopyValue = (valStr: string, code: string) => {
    navigator.clipboard.writeText(valStr);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1500);
  };

  return (
    <div id="tixa-multi-currency-modal" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto font-mono">
      <div className="relative w-full max-w-4xl rounded-2xl bg-[#060c1d] border border-cyan-500/40 shadow-2xl p-4 sm:p-6 text-slate-100 space-y-5 my-6 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-black font-bold shadow-md shadow-cyan-500/20">
              <Zap className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white font-heading">
                  Native TIXA Real-Time Multi-Currency Matrix
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700/60 text-[10px]">
                  Live Ticker Sync
                </span>
              </div>
              <p className="text-xs text-slate-400">
                1 TIXA = ${livePriceUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT • Real-time conversion across 25+ global currencies
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Interactive Converter Calculator */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900/90 via-[#081126] to-cyan-950/70 border border-cyan-500/30 space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="w-full sm:w-1/2 space-y-1">
              <label className="text-[11px] text-slate-400 uppercase tracking-wider font-bold flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-cyan-400" />
                <span>Enter BTX (Native Base):</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  value={tixaInput}
                  onChange={e => setTixaInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-cyan-500/40 text-white font-mono text-sm font-bold focus:border-cyan-400 focus:outline-none"
                  placeholder="e.g. 1"
                />
                <span className="absolute right-3 top-2.5 text-cyan-400 font-bold text-xs">
                  TIXA
                </span>
              </div>
            </div>

            {/* Preferred Currency Quick Indicator */}
            <div className="w-full sm:w-1/2 p-3 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between gap-2">
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase">
                  ACTIVE PREFERRED CURRENCY ({preferredCurrency}):
                </span>
                <span className="text-base font-extrabold text-cyan-300">
                  {currencyConversionEngine.formatTixaPriceInCurrency(preferredCurrency, numTixa)}
                </span>
              </div>
              <span className="px-2 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-600/40 text-[10px] font-bold">
                Default Active
              </span>
            </div>
          </div>
        </div>

        {/* Search & Category Tabs */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search currency (e.g. BDT, USD, EUR, INR, BTC, GBP)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'ALL', label: 'All Currencies' },
              { id: 'ASIA', label: '🇧🇩 Asia (BDT, INR, AED)' },
              { id: 'FIAT', label: '🏦 Global Fiat' },
              { id: 'CRYPTO', label: '⚡ Crypto' },
              { id: 'EUROPE', label: '🇪🇺 Europe' },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterType(tab.id as any)}
                className={`px-3 py-2 rounded-xl whitespace-nowrap transition-all ${
                  filterType === tab.id
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold shadow-md'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Currency Rates Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-[50vh] overflow-y-auto p-1">
          {filteredCurrencies.map(cur => {
            const convertedVal = currencyConversionEngine.convertTixaToCurrency(numTixa, cur.code);
            const isPreferred = preferredCurrency === cur.code;
            const formattedDisplay = `${cur.symbol} ${convertedVal.toLocaleString('en-US', {
              minimumFractionDigits: cur.decimals,
              maximumFractionDigits: cur.decimals
            })} ${cur.code}`;

            return (
              <div
                key={cur.code}
                className={`p-3 rounded-xl border transition-all relative group flex flex-col justify-between ${
                  isPreferred
                    ? 'bg-cyan-950/70 border-cyan-400 shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{cur.flag}</span>
                    <div>
                      <span className="text-xs font-bold text-white block">{cur.code}</span>
                      <span className="text-[10px] text-slate-400 truncate max-w-[120px] block">{cur.name}</span>
                    </div>
                  </div>

                  {isPreferred ? (
                    <span className="px-2 py-0.5 rounded bg-cyan-500 text-black font-bold text-[9px]">
                      DEFAULT
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSelectAsPreferred(cur.code)}
                      className="opacity-80 hover:opacity-100 text-[10px] text-slate-400 hover:text-cyan-300 transition-colors"
                      title="Set as Default View Currency"
                    >
                      Set Default
                    </button>
                  )}
                </div>

                <div className="pt-2 space-y-1">
                  <div className="flex items-baseline justify-between gap-1">
                    <span className="text-[10px] text-slate-400">Converted Value:</span>
                    <button
                      type="button"
                      onClick={() => handleCopyValue(formattedDisplay, cur.code)}
                      className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
                      title="Copy Value"
                    >
                      {copiedCode === cur.code ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <div className="text-sm font-extrabold text-cyan-200 tracking-tight break-all font-mono">
                    {cur.symbol}{convertedVal.toLocaleString('en-US', {
                      minimumFractionDigits: cur.decimals,
                      maximumFractionDigits: cur.decimals
                    })} <span className="text-[10px] text-slate-400 font-normal">{cur.code}</span>
                  </div>
                  <div className="text-[9px] text-slate-400">
                    Rate: 1 USD ≈ {cur.type === 'CRYPTO' && cur.code !== 'USDT' ? `${cur.rateToUsd.toFixed(6)} ${cur.code}` : `${cur.rateToUsd} ${cur.code}`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info note */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              Real-time calculations adjust dynamically whenever you trade in any market pair or change currencies.
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition-colors shrink-0"
          >
            Close Matrix
          </button>
        </div>

      </div>
    </div>
  );
};
