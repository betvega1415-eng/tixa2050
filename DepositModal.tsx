import React, { useState, useEffect } from 'react';
import { 
  X, 
  ArrowDownLeft, 
  Copy, 
  Check, 
  QrCode, 
  DollarSign, 
  ShieldCheck, 
  Coins, 
  Smartphone, 
  CreditCard, 
  Building2, 
  AlertCircle,
  ExternalLink,
  Sparkles,
  Info,
  Search,
  Globe,
  Wallet,
  RefreshCw,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { ledgerEngine } from '../../core/ledgerEngine';
import { currencyConversionEngine } from '../../core/currencyConversionEngine';
import { authEngine } from '../../core/authEngine';
import { paymentConfigEngine } from '../../core/paymentConfigEngine';
import { PaymentMethodConfig } from '../../types/paymentConfig';
import { COUNTRIES, CountryData } from '../../data/countries';
import { PaymentLogoIcon, TixaCoBrandedBadge } from '../common/PaymentLogoIcon';
import { soundEngine } from '../../core/soundEngine';
import confetti from 'canvas-confetti';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const session = authEngine.getSession();
  const currentUser = authEngine.getCurrentUser();
  const settings = ledgerEngine.getSettings();

  // Active Payment Methods loaded dynamically from backend service
  const [activeMethods, setActiveMethods] = useState<PaymentMethodConfig[]>(
    paymentConfigEngine.getActivePaymentMethods()
  );
  
  // Tab/Category Filter: 'ALL' | 'STABLECOIN' | 'LAYER1_CRYPTO' | 'MFS_BANGLADESH' | 'EXCHANGE_PAY' | 'FIAT_BANK'
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Method
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodConfig>(
    activeMethods[0] || paymentConfigEngine.getPaymentMethods()[0]
  );

  // MFS Transfer Mode: 'PAYMENT' | 'SEND_MONEY' | 'CASH_OUT'
  const [selectedMfsMode, setSelectedMfsMode] = useState<'PAYMENT' | 'SEND_MONEY' | 'CASH_OUT'>('PAYMENT');

  // Input states
  const [localCurrency, setLocalCurrency] = useState<string>(currentUser?.currency || 'BDT');
  const [depositAmount, setDepositAmount] = useState<string>('50');
  const [senderAccountOrPhone, setSenderAccountOrPhone] = useState<string>(currentUser?.phone || '');
  const [txHashOrReference, setTxHashOrReference] = useState<string>('');

  // Status & Feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshingConfig, setIsRefreshingConfig] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Active address (User's single unique address)
  const activeAddress = session?.walletAddress || currentUser?.walletAddress || 'tx1alexchennoncustodial2050vault99aa';
  const tixaPrice = settings.tixaBasePriceUsdt;
  const currentCountry: CountryData | undefined = COUNTRIES.find(c => c.currency === localCurrency) || COUNTRIES[0];

  // Refresh reactive listener for payment config changes
  const refreshPaymentConfig = () => {
    const fresh = paymentConfigEngine.getActivePaymentMethods();
    setActiveMethods(fresh);
    if (fresh.length > 0) {
      // Keep selected or fallback
      setSelectedMethod(prev => {
        const stillExists = fresh.find(m => m.id === prev?.id);
        return stillExists || fresh[0];
      });
    }
  };

  useEffect(() => {
    const unsub = paymentConfigEngine.subscribe(refreshPaymentConfig);
    return unsub;
  }, []);

  useEffect(() => {
    if (currentUser?.currency) {
      setLocalCurrency(currentUser.currency);
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Manual Refresh Payment Information Button
  const handleManualRefreshInfo = () => {
    setIsRefreshingConfig(true);
    refreshPaymentConfig();
    setTimeout(() => {
      setIsRefreshingConfig(false);
    }, 400);
  };

  // Filter Methods
  const filteredMethods = activeMethods.filter(m => {
    const matchesSearch = 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.networkDisplayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.receivingAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.currency.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (categoryFilter === 'CRYPTO' && m.category !== 'STABLECOIN' && m.category !== 'LAYER1_CRYPTO') return false;
    if (categoryFilter === 'BANGLADESH' && m.category !== 'MFS_BANGLADESH') return false;
    if (categoryFilter === 'BANKS' && m.category !== 'FIAT_BANK' && m.category !== 'EXCHANGE_PAY') return false;
    return true;
  });

  // Deposit calculations
  const isCryptoAsset = selectedMethod.category === 'STABLECOIN' || selectedMethod.category === 'LAYER1_CRYPTO';
  const numAmount = parseFloat(depositAmount) || 0;

  const isMfs = selectedMethod?.category === 'MFS_BANGLADESH' || !!selectedMethod?.mfsModes;
  let effectiveReceivingAddress = selectedMethod?.receivingAddress || '';
  let effectiveInstructions = selectedMethod?.depositInstructions || '';
  let counterNumber = '';

  if (isMfs && selectedMethod?.mfsModes) {
    if (selectedMfsMode === 'PAYMENT') {
      effectiveReceivingAddress = selectedMethod.mfsModes.paymentNumber || selectedMethod.receivingAddress || '';
      effectiveInstructions = selectedMethod.mfsModes.paymentInstructions || selectedMethod.depositInstructions || '';
      counterNumber = selectedMethod.mfsModes.paymentCounter || '1';
    } else if (selectedMfsMode === 'SEND_MONEY') {
      effectiveReceivingAddress = selectedMethod.mfsModes.sendMoneyNumber || selectedMethod.receivingAddress || '';
      effectiveInstructions = selectedMethod.mfsModes.sendMoneyInstructions || selectedMethod.depositInstructions || '';
    } else if (selectedMfsMode === 'CASH_OUT') {
      effectiveReceivingAddress = selectedMethod.mfsModes.cashOutNumber || selectedMethod.receivingAddress || '';
      effectiveInstructions = selectedMethod.mfsModes.cashOutInstructions || selectedMethod.depositInstructions || '';
    }
  }

  let usdValue = 0;
  let tixaEquivalent = 0;
  let localFiatValue = 0;

  if (selectedMethod.currency === 'TIXA') {
    tixaEquivalent = numAmount;
    usdValue = numAmount * tixaPrice;
    localFiatValue = ledgerEngine.convertUsdToFiat(usdValue, localCurrency);
  } else if (selectedMethod.currency === 'USDT' || selectedMethod.currency === 'USDC') {
    usdValue = numAmount;
    tixaEquivalent = usdValue / tixaPrice;
    localFiatValue = ledgerEngine.convertUsdToFiat(usdValue, localCurrency);
  } else if (selectedMethod.currency === 'NISI') {
    const nisiUsd = currencyConversionEngine.getCryptoRate('NISI');
    usdValue = numAmount * nisiUsd;
    tixaEquivalent = usdValue / tixaPrice;
    localFiatValue = ledgerEngine.convertUsdToFiat(usdValue, localCurrency);
  } else if (selectedMethod.currency === 'SARA') {
    const saraUsd = currencyConversionEngine.getCryptoRate('SARA');
    usdValue = numAmount * saraUsd;
    tixaEquivalent = usdValue / tixaPrice;
    localFiatValue = ledgerEngine.convertUsdToFiat(usdValue, localCurrency);
  } else if (selectedMethod.currency === 'MUN') {
    const munUsd = currencyConversionEngine.getCryptoRate('MUN');
    usdValue = numAmount * munUsd;
    tixaEquivalent = usdValue / tixaPrice;
    localFiatValue = ledgerEngine.convertUsdToFiat(usdValue, localCurrency);
  } else {
    // Fiat / BDT
    localFiatValue = numAmount;
    const fiatRate = ledgerEngine.getFiatRate(localCurrency);
    usdValue = fiatRate > 0 ? numAmount / fiatRate : numAmount;
    tixaEquivalent = usdValue / tixaPrice;
  }

  const handleSubmitDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      if (numAmount <= 0) {
        throw new Error('Please enter a valid deposit amount.');
      }
      if (selectedMethod.minDepositUsd && usdValue < selectedMethod.minDepositUsd) {
        throw new Error(`Minimum deposit for ${selectedMethod.name} is $${selectedMethod.minDepositUsd} USD equivalent.`);
      }
      if (!txHashOrReference.trim()) {
        throw new Error('Please enter the Transaction Hash, TrxID, or Reference Number from your payment.');
      }

      await ledgerEngine.submitDeposit({
        userId: currentUser?.id || 'usr_guest_session',
        userEmail: currentUser?.email || 'wallet.holder@tixa.network',
        walletAddress: activeAddress,
        amount: selectedMethod.currency === 'TIXA' ? numAmount : tixaEquivalent,
        currency: selectedMethod.currency,
        method: selectedMethod.id as any,
        network: selectedMethod.network as any,
        txHashOrReference: txHashOrReference.trim(),
        senderAccountOrPhone: senderAccountOrPhone.trim() || undefined,
        usdEquivalent: usdValue,
        localCurrency,
        localAmount: localFiatValue,
        mfsTransferType: isMfs ? selectedMfsMode : undefined,
        depositAddressUsed: effectiveReceivingAddress
      });

      setSuccessMsg(
        `Deposit request for ${numAmount} ${selectedMethod.currency} submitted! Verified receiving target: ${effectiveReceivingAddress || selectedMethod.name}. Funds will be credited upon verification.`
      );
      soundEngine.play('deposit');
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });

      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 3000);
    } catch (err: any) {
      soundEngine.play('error');
      setErrorMsg(err.message || 'Deposit submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="user-deposit-payment-modal" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl bg-[#060c1c] border border-cyan-500/30 shadow-2xl p-4 sm:p-6 text-slate-100 space-y-5 my-6 max-h-[92vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-black font-bold shadow-md shadow-cyan-500/20">
              <ArrowDownLeft className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white font-heading">
                  Deposit Funds & Receive TIXA
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-mono">
                  Verified Payment Channels ({activeMethods.length})
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                USDT (TRC20/ERC20/BEP20), TIXA, Bitcoin, Solana, Binance Pay & Bangladesh MFS
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Refresh Payment Information Button */}
            <button
              type="button"
              onClick={handleManualRefreshInfo}
              disabled={isRefreshingConfig}
              title="Refresh latest verified receiving addresses from server"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-700 transition-colors flex items-center gap-1.5 text-xs font-mono"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingConfig ? 'animate-spin text-cyan-400' : ''}`} />
              <span className="hidden sm:inline">Refresh Info</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Co-Branded Rate Banner */}
        <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-950/50 via-slate-900 to-blue-950/50 border border-cyan-500/30 flex items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2 text-cyan-300">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              <strong>1 TIXA = ${tixaPrice.toLocaleString()} USDT</strong> • Credited to your single non-custodial address
            </span>
          </div>
          <span className="hidden sm:inline-block text-[10px] text-slate-400">
            Vault: {activeAddress.slice(0, 10)}...{activeAddress.slice(-6)}
          </span>
        </div>

        {/* Search & Category Filter Tabs */}
        <div className="space-y-2.5 font-mono text-xs">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search payment method (e.g. USDT, TRC20, Binance Pay, bKash, Solana)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {[
                { id: 'ALL', label: `All (${activeMethods.length})` },
                { id: 'CRYPTO', label: '🌐 Crypto & USDT' },
                { id: 'BANGLADESH', label: '🇧🇩 Bangladesh MFS' },
                { id: 'BANKS', label: '🏦 Banks & Binance Pay' },
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setCategoryFilter(tab.id as any)}
                  className={`px-3 py-2 rounded-xl whitespace-nowrap transition-all ${
                    categoryFilter === tab.id
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold shadow-md'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method Selector Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto p-1.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
            {filteredMethods.map(m => (
              <button
                key={m.id}
                type="button"
                id={`select-deposit-method-${m.id}`}
                onClick={() => setSelectedMethod(m)}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                  selectedMethod.id === m.id
                    ? 'bg-cyan-950/70 border-cyan-400 shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center p-1 shrink-0">
                  <PaymentLogoIcon type={m.iconType} className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white truncate">{m.name}</div>
                  <div className="text-[10px] text-cyan-400 truncate">{m.networkDisplayName.split(' ')[0]}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Payment Method Details with Active Address & QR Code */}
        {selectedMethod && (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900/95 via-[#081126] to-cyan-950/60 border border-cyan-500/40 space-y-4 font-mono text-xs shadow-xl">
            
            {/* Header of Selected Channel */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-950 border border-cyan-500/40 flex items-center justify-center p-1.5">
                  <PaymentLogoIcon type={selectedMethod.iconType} className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>{selectedMethod.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-600/40">
                      {selectedMethod.networkDisplayName}
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Currency: <span className="text-cyan-300 font-bold">{selectedMethod.currency}</span> • Min Deposit: ${selectedMethod.minDepositUsd.toFixed(2)} USD
                  </p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-600/40 text-[10px] font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>OFFICIAL VERIFIED RECEIVING TARGET</span>
              </span>
            </div>

            {/* MFS 3-System Selector: PAYMENT vs SEND MONEY vs CASH OUT */}
            {isMfs && (
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-cyan-300 flex items-center gap-1.5 font-sans">
                    <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                    পেমেন্ট সিস্টেম ও নম্বর নির্বাচন করুন (Select Transfer Mode):
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Active: <strong className="text-white">{selectedMfsMode}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-sans">
                  {/* Option 1: Payment (মার্চেন্ট পেমেন্ট) */}
                  <button
                    type="button"
                    onClick={() => setSelectedMfsMode('PAYMENT')}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      selectedMfsMode === 'PAYMENT'
                        ? 'bg-gradient-to-r from-pink-950/90 to-purple-950/90 border-pink-500 text-white shadow-lg ring-1 ring-pink-500/50'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-xs">1. PAYMENT</span>
                      {selectedMfsMode === 'PAYMENT' && <CheckCircle2 className="w-3.5 h-3.5 text-pink-400" />}
                    </div>
                    <div className="text-[10px] text-pink-300 mt-1">মার্চেন্ট পেমেন্ট (Make Payment)</div>
                    <div className="text-[9px] text-slate-400 mt-0.5 truncate font-mono">
                      {selectedMethod.mfsModes?.paymentNumber ? `No: ${selectedMethod.mfsModes.paymentNumber}` : '(Not Set)'}
                    </div>
                  </button>

                  {/* Option 2: Send Money (সেন্ড মানি) */}
                  <button
                    type="button"
                    onClick={() => setSelectedMfsMode('SEND_MONEY')}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      selectedMfsMode === 'SEND_MONEY'
                        ? 'bg-gradient-to-r from-cyan-950/90 to-blue-950/90 border-cyan-500 text-white shadow-lg ring-1 ring-cyan-500/50'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-xs">2. SEND MONEY</span>
                      {selectedMfsMode === 'SEND_MONEY' && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                    </div>
                    <div className="text-[10px] text-cyan-300 mt-1">সেন্ড মানি (Personal Send Money)</div>
                    <div className="text-[9px] text-slate-400 mt-0.5 truncate font-mono">
                      {selectedMethod.mfsModes?.sendMoneyNumber ? `No: ${selectedMethod.mfsModes.sendMoneyNumber}` : '(Not Set)'}
                    </div>
                  </button>

                  {/* Option 3: Cash Out (ক্যাশ আউট) */}
                  <button
                    type="button"
                    onClick={() => setSelectedMfsMode('CASH_OUT')}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      selectedMfsMode === 'CASH_OUT'
                        ? 'bg-gradient-to-r from-amber-950/90 to-orange-950/90 border-amber-500 text-white shadow-lg ring-1 ring-amber-500/50'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-xs">3. CASH OUT</span>
                      {selectedMfsMode === 'CASH_OUT' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                    </div>
                    <div className="text-[10px] text-amber-300 mt-1">ক্যাশ আউট (Agent Cash Out)</div>
                    <div className="text-[9px] text-slate-400 mt-0.5 truncate font-mono">
                      {selectedMethod.mfsModes?.cashOutNumber ? `No: ${selectedMethod.mfsModes.cashOutNumber}` : '(Not Set)'}
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Dynamic Receiving Address Layout (QR Code Removed) */}
            <div className="space-y-3">
              {/* Address Display & Copy Button */}
              <div className="space-y-1">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold flex items-center justify-between">
                  <span>
                    {isMfs ? `Active ${selectedMfsMode} Number / ID:` : 'Active Receiving Wallet Address / ID:'}
                  </span>
                  <span className="text-cyan-400 font-bold">
                    {isMfs ? `MFS ${selectedMfsMode}` : `Validated ${selectedMethod.network}`}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-cyan-500/30 flex items-center justify-between gap-2 shadow-inner">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-cyan-200 break-all select-all font-mono">
                      {effectiveReceivingAddress || (
                        <span className="text-slate-500 font-normal italic font-sans text-[11px]">
                          (No number/address configured yet for {selectedMfsMode} mode by Admin)
                        </span>
                      )}
                    </div>
                    {isMfs && selectedMfsMode === 'PAYMENT' && counterNumber && (
                      <div className="text-[10px] text-pink-300 font-sans mt-0.5 font-bold">
                        কাউন্টার নং (Counter No): {counterNumber}
                      </div>
                    )}
                  </div>

                  {effectiveReceivingAddress && (
                    <button
                      type="button"
                      id="copy-receiving-address-btn"
                      onClick={() => handleCopy(effectiveReceivingAddress, 'active-target-address')}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition-all shadow-md shrink-0"
                    >
                      {copiedKey === 'active-target-address' ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Copy Number</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Network Warning Alert Banner */}
              {selectedMethod.networkWarning && (
                <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/50 text-amber-200 text-[11px] flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{selectedMethod.networkWarning}</span>
                </div>
              )}

              {/* Instructions */}
              {effectiveInstructions && (
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-300 flex items-start gap-2">
                  <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{effectiveInstructions}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs font-mono flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Deposit Submission Form */}
        <form onSubmit={handleSubmitDeposit} className="space-y-4 font-mono text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Deposit Amount Input */}
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">
                Deposit Amount ({selectedMethod.currency}) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="e.g. 100"
                  value={depositAmount}
                  onChange={e => setDepositAmount(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono focus:border-cyan-500"
                />
                <span className="absolute right-3 top-2.5 text-cyan-400 font-bold">
                  {selectedMethod.currency}
                </span>
              </div>
            </div>

            {/* Local Currency Selector */}
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">
                Your Local Currency Reference
              </label>
              <select
                value={localCurrency}
                onChange={e => setLocalCurrency(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono focus:border-cyan-500"
              >
                {COUNTRIES.map(c => (
                  <option key={c.code} value={c.currency}>
                    {c.flag} {c.currency} ({c.name}) - 1 USD ≈ {c.rateToUsd} {c.currency}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Live Conversion Summary Bar */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">USD VALUE</span>
              <span className="text-white font-bold">
                ${usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">CREDITED TIXA COINS</span>
              <span className="text-cyan-300 font-bold">
                +{tixaEquivalent.toFixed(6)} TIXA
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">LOCAL FIAT EQUIVALENT</span>
              <span className="text-slate-300 font-bold">
                {currentCountry?.currencySymbol || ''} {localFiatValue.toLocaleString()} {localCurrency}
              </span>
            </div>
          </div>

          {/* Sender details and Trx Proof */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">
                Your Sender Address / Mobile / Pay ID:
              </label>
              <input
                type="text"
                placeholder={isCryptoAsset ? "e.g. 0x... or Tron address" : "e.g. 01712-XXXXXX"}
                value={senderAccountOrPhone}
                onChange={e => setSenderAccountOrPhone(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono focus:border-cyan-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-semibold">
                Transaction Hash / TrxID / Reference No. <span className="text-rose-400">*</span>:
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 0x8f72a9... or 9JA72KL98Z"
                value={txHashOrReference}
                onChange={e => setTxHashOrReference(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono focus:border-cyan-500 text-xs"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              id="submit-deposit-form-btn"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Submitting Proof...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Deposit Verification</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
