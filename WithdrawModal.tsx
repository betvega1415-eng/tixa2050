import React, { useState, useEffect } from 'react';
import { 
  X, 
  ArrowUpRight, 
  Wallet, 
  Coins, 
  DollarSign, 
  ShieldCheck, 
  AlertCircle, 
  Check, 
  Smartphone, 
  Building2, 
  QrCode,
  Info,
  Search,
  Sparkles,
  Bookmark,
  BookMarked,
  Edit2,
  Trash2,
  Plus,
  Star,
  CheckCircle2
} from 'lucide-react';
import { ledgerEngine } from '../../core/ledgerEngine';
import { blockchainEngine } from '../../core/blockchainEngine';
import { authEngine } from '../../core/authEngine';
import { tokenEngine } from '../../core/tokenEngine';
import { CryptoNetwork } from '../../types/ledger';
import { SavedWithdrawalAddress } from '../../types/auth';
import { COUNTRIES, CountryData } from '../../data/countries';
import { PAYMENT_GATEWAYS, PaymentGatewayItem } from '../../data/paymentGateways';
import { PaymentLogoIcon, TixaCoBrandedBadge } from '../common/PaymentLogoIcon';
import { soundEngine } from '../../core/soundEngine';
import confetti from 'canvas-confetti';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const session = authEngine.getSession();
  const currentUser = authEngine.getCurrentUser();
  const settings = ledgerEngine.getSettings();

  const activeAddress = session?.walletAddress || currentUser?.walletAddress || 'tx1alexchennoncustodial2050vault99aa';

  // Active Tab/Filter: 'ALL' | 'BANGLADESH' | 'CRYPTO' | 'BANKS'
  const [activeTab, setActiveTab] = useState<'ALL' | 'BANGLADESH' | 'CRYPTO' | 'BANKS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Gateway / Destination
  const [selectedGateway, setSelectedGateway] = useState<PaymentGatewayItem>(PAYMENT_GATEWAYS[0]);

  // Asset selection: 'TIXA' or TX20 tokens
  const [selectedAsset, setSelectedAsset] = useState<string>('TIXA');
  const [tokens, setTokens] = useState(tokenEngine.getTokens());
  const [availableBalance, setAvailableBalance] = useState<number>(0);

  // Input amounts & destinations
  const [amount, setAmount] = useState<string>('0.01');
  const [destinationAddressOrAccount, setDestinationAddressOrAccount] = useState<string>(currentUser?.phone || '');
  const [accountHolderName, setAccountHolderName] = useState<string>(currentUser?.name || '');
  const [bankName, setBankName] = useState<string>('City Bank Ltd');
  const [localCurrency, setLocalCurrency] = useState<string>(currentUser?.currency || 'BDT');

  // Saved Withdrawal Addresses State
  const [savedAddresses, setSavedAddresses] = useState<SavedWithdrawalAddress[]>([]);
  const [saveToAddressBook, setSaveToAddressBook] = useState<boolean>(true);
  const [addressLabel, setAddressLabel] = useState<string>('');
  const [showAddressManager, setShowAddressManager] = useState<boolean>(false);

  // Edit / Add Address in Manager
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState<string>('');
  const [editAddressNumber, setEditAddressNumber] = useState<string>('');
  const [editHolderName, setEditHolderName] = useState<string>('');
  const [editGatewayId, setEditGatewayId] = useState<string>('bkash');

  // Status & loading
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const tixaPrice = settings.tixaBasePriceUsdt;
  const currentCountry: CountryData | undefined = COUNTRIES.find(c => c.currency === localCurrency) || COUNTRIES[0];

  const refreshSavedAddresses = () => {
    const list = authEngine.getSavedWithdrawalAddresses(currentUser?.email);
    setSavedAddresses(list);
  };

  const refreshBalances = () => {
    const acc = blockchainEngine.getOrCreateAccount(activeAddress);
    if (selectedAsset === 'TIXA') {
      setAvailableBalance(acc.balance);
    } else {
      setAvailableBalance(acc.tokens?.[selectedAsset] || 0);
    }
  };

  useEffect(() => {
    refreshBalances();
    refreshSavedAddresses();
    const unsubB = blockchainEngine.subscribe(refreshBalances);
    const unsubA = authEngine.subscribe(refreshSavedAddresses);
    return () => {
      unsubB();
      unsubA();
    };
  }, [activeAddress, selectedAsset, currentUser]);

  useEffect(() => {
    if (currentUser?.currency) setLocalCurrency(currentUser.currency);
    if (currentUser?.phone && !destinationAddressOrAccount) setDestinationAddressOrAccount(currentUser.phone);
    if (currentUser?.name && !accountHolderName) setAccountHolderName(currentUser.name);
  }, [currentUser]);

  // Quick autofill saved address
  const handleSelectSavedAddress = (saved: SavedWithdrawalAddress) => {
    setDestinationAddressOrAccount(saved.addressOrNumber);
    if (saved.accountHolderName) setAccountHolderName(saved.accountHolderName);
    const matchedGateway = PAYMENT_GATEWAYS.find(g => g.id === saved.methodId);
    if (matchedGateway) setSelectedGateway(matchedGateway);
    setAddressLabel(saved.label || '');
  };

  // Save new address from manager
  const handleSaveNewAddressInManager = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAddressNumber.trim()) return;
    const gateway = PAYMENT_GATEWAYS.find(g => g.id === editGatewayId);
    authEngine.saveWithdrawalAddress({
      email: currentUser?.email,
      methodId: editGatewayId,
      methodName: gateway?.tixaLabel || editGatewayId,
      network: gateway?.category || 'BANGLADESH_MFS',
      addressOrNumber: editAddressNumber.trim(),
      accountHolderName: editHolderName.trim() || undefined,
      label: editLabel.trim() || `${gateway?.tixaLabel || editGatewayId} Saved`
    });
    setEditAddressNumber('');
    setEditLabel('');
    setEditHolderName('');
    refreshSavedAddresses();
  };

  // Update existing saved address
  const handleUpdateSavedAddress = (addressId: string) => {
    if (!editAddressNumber.trim()) return;
    const gateway = PAYMENT_GATEWAYS.find(g => g.id === editGatewayId);
    authEngine.updateWithdrawalAddress({
      email: currentUser?.email,
      addressId,
      updates: {
        addressOrNumber: editAddressNumber.trim(),
        accountHolderName: editHolderName.trim() || undefined,
        label: editLabel.trim() || undefined,
        methodId: editGatewayId,
        methodName: gateway?.tixaLabel || editGatewayId,
        network: gateway?.category || 'BANGLADESH_MFS'
      }
    });
    setEditingAddressId(null);
    setEditAddressNumber('');
    setEditLabel('');
    setEditHolderName('');
    refreshSavedAddresses();
  };

  // Delete saved address
  const handleDeleteSavedAddress = (addressId: string) => {
    authEngine.deleteWithdrawalAddress({ email: currentUser?.email, addressId });
    refreshSavedAddresses();
  };

  if (!isOpen) return null;

  // Filter Gateways
  const filteredGateways = PAYMENT_GATEWAYS.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          g.nameBn.includes(searchQuery) ||
                          g.tixaLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          g.description.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (activeTab === 'BANGLADESH') return g.category === 'BANGLADESH_MFS';
    if (activeTab === 'CRYPTO') return g.category === 'CRYPTO_WALLET';
    if (activeTab === 'BANKS') return g.category === 'BANGLADESH_BANK';
    return true;
  });

  const numAmount = parseFloat(amount) || 0;
  const isCryptoGateway = selectedGateway.category === 'CRYPTO_WALLET';
  const feePercent = isCryptoGateway ? settings.cryptoWithdrawFeePercent : settings.localWithdrawFeePercent;
  const feeAmount = numAmount * (feePercent / 100);
  const netAmount = Math.max(0, numAmount - feeAmount);

  const usdValue = selectedAsset === 'TIXA' ? numAmount * tixaPrice : numAmount;
  const fiatRate = ledgerEngine.getFiatRate(localCurrency);
  const localCurrencyAmount = usdValue * fiatRate;
  const netLocalCurrencyAmount = (netAmount * (selectedAsset === 'TIXA' ? tixaPrice : 1)) * fiatRate;

  const handleSubmitWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      if (numAmount <= 0) {
        throw new Error('Please enter a valid withdrawal amount.');
      }
      if (numAmount > availableBalance) {
        throw new Error(`Insufficient balance. You have ${availableBalance.toFixed(6)} ${selectedAsset} available.`);
      }
      if (!destinationAddressOrAccount.trim()) {
        throw new Error(`Please specify the recipient account number, phone, or wallet address for ${selectedGateway.tixaLabel}.`);
      }

      // If user checked save to address book
      if (saveToAddressBook) {
        const exists = savedAddresses.some(
          s => s.addressOrNumber.toLowerCase() === destinationAddressOrAccount.trim().toLowerCase() &&
               s.methodId === selectedGateway.id
        );
        if (!exists) {
          authEngine.saveWithdrawalAddress({
            email: currentUser?.email,
            methodId: selectedGateway.id,
            methodName: selectedGateway.tixaLabel,
            network: selectedGateway.category,
            addressOrNumber: destinationAddressOrAccount.trim(),
            accountHolderName: accountHolderName.trim() || undefined,
            label: addressLabel.trim() || `${selectedGateway.tixaLabel} Saved`
          });
        }
      }

      await ledgerEngine.submitWithdrawal({
        userId: currentUser?.id || 'usr_guest_session',
        userEmail: currentUser?.email || 'wallet.holder@tixa.network',
        walletAddress: activeAddress,
        asset: selectedAsset,
        amount: numAmount,
        feeAmount,
        destinationMethod: selectedGateway.id as any,
        network: isCryptoGateway ? (selectedGateway.defaultNetwork as any || 'TRC20') : undefined,
        destinationAddressOrAccount: destinationAddressOrAccount.trim(),
        accountHolderName: accountHolderName.trim() || undefined,
        bankName: selectedGateway.category === 'BANGLADESH_BANK' ? selectedGateway.name : undefined,
        localCurrency,
        localCurrencyAmount
      });

      setSuccessMsg(`Withdrawal request of ${numAmount} ${selectedAsset} queued for Admin dispatch via ${selectedGateway.tixaLabel}!`);
      soundEngine.play('success');
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });

      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 2500);
    } catch (err: any) {
      soundEngine.play('error');
      setErrorMsg(err.message || 'Withdrawal failed to process.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl bg-[#060c1c] border border-rose-500/30 shadow-2xl p-4 sm:p-6 text-slate-100 space-y-5 my-6 max-h-[92vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-600 flex items-center justify-center text-white font-bold shadow-md shadow-rose-500/20">
              <ArrowUpRight className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white font-heading">
                  Withdraw Funds & Cash Out
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-mono">
                  All Gateways × TIXA Co-Branded
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Direct cashout to bKash, Nagad, Rocket, Cellfin, Binance, Trust Wallet & Global Exchanges
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

        {/* Balance Status Banner */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-slate-900 via-rose-950/40 to-slate-900 border border-rose-500/30 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-300">Single Wallet Balance:</span>
            <span className="text-cyan-300 font-bold">
              {availableBalance.toFixed(6)} {selectedAsset}
            </span>
            <span className="text-slate-500">
              (≈ ${(availableBalance * (selectedAsset === 'TIXA' ? tixaPrice : 1)).toLocaleString('en-US', { minimumFractionDigits: 2 })})
            </span>
          </div>

          <button
            type="button"
            onClick={() => setAmount(availableBalance.toString())}
            className="px-2 py-1 rounded bg-slate-800 text-cyan-300 border border-slate-700 hover:border-cyan-500 text-[10px] font-bold"
          >
            USE MAX BALANCE
          </button>
        </div>

        {/* Search & Category Filter Tabs */}
        <div className="space-y-2.5">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search cashout gateway (e.g. bKash, Nagad, Binance, Rocket, Trust Wallet)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-white placeholder-slate-500 font-mono focus:border-rose-500 focus:outline-none"
              />
            </div>
            
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 font-mono text-xs">
              {[
                { id: 'ALL', label: 'All Destinations (22)' },
                { id: 'BANGLADESH', label: '🇧🇩 Bangladesh MFS' },
                { id: 'CRYPTO', label: '🌐 Crypto Wallets' },
                { id: 'BANKS', label: '🏦 Banks & Wire' },
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-2 rounded-xl whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-rose-500 to-amber-600 text-white font-bold shadow-md'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Visual Logos & Gateway Selection Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-52 overflow-y-auto p-1.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
            {filteredGateways.map(g => (
              <TixaCoBrandedBadge
                key={g.id}
                logoType={g.logoType}
                brandName={g.tixaLabel}
                brandNameBn={g.nameBn}
                badge={g.badge.split(' ')[0]}
                selected={selectedGateway.id === g.id}
                onClick={() => setSelectedGateway(g)}
                size="sm"
              />
            ))}
          </div>
        </div>

        {/* Selected Destination Info */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900 to-rose-950/40 border border-rose-500/40 flex items-center justify-between gap-3 font-mono text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-950 border border-rose-500/40 flex items-center justify-center p-1">
              <PaymentLogoIcon type={selectedGateway.logoType} className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>{selectedGateway.tixaLabel}</span>
                <span className="text-xs text-rose-400">({selectedGateway.nameBn})</span>
              </h4>
              <p className="text-[11px] text-slate-400">{selectedGateway.description}</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[10px]">
            {selectedGateway.badge}
          </span>
        </div>

        {/* Saved Withdrawal Addresses Quick Access & Address Book Management */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 font-sans text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookMarked className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-slate-200 text-xs">
                My Saved Withdrawal Addresses
              </span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-mono font-bold">
                {savedAddresses.length} saved
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowAddressManager(!showAddressManager)}
              className="text-xs text-cyan-400 hover:text-cyan-300 underline font-semibold flex items-center gap-1"
            >
              {showAddressManager ? 'Hide Address Book' : 'Manage Addresses'}
            </button>
          </div>

          {/* Quick Select Chips */}
          {savedAddresses.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {savedAddresses.map(sa => (
                <button
                  key={sa.id}
                  type="button"
                  onClick={() => handleSelectSavedAddress(sa)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-mono transition-all flex items-center gap-2 ${
                    destinationAddressOrAccount === sa.addressOrNumber
                      ? 'bg-cyan-950 border-cyan-500 text-cyan-200 ring-1 ring-cyan-500/40 shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <Bookmark className="w-3 h-3 text-cyan-400" />
                  <span className="font-bold">{sa.label || sa.methodName}:</span>
                  <span className="text-cyan-300">{sa.addressOrNumber}</span>
                  {destinationAddressOrAccount === sa.addressOrNumber && (
                    <Check className="w-3 h-3 text-emerald-400" />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-[11px] text-slate-400 italic">
              No saved addresses found. Enter account details below and check "Save for future withdrawals" to save automatically.
            </div>
          )}

          {/* Address Book Manager Panel (Edit, Add, Delete) */}
          {showAddressManager && (
            <div className="mt-3 p-3.5 rounded-xl bg-[#080e22] border border-cyan-500/40 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-bold text-cyan-300 text-xs flex items-center gap-1.5">
                  <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
                  Manage Address Book & Save New Addresses
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Address Book Manager</span>
              </div>

              {/* List of existing saved addresses with Edit & Delete */}
              {savedAddresses.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {savedAddresses.map(item => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between gap-2"
                    >
                      {editingAddressId === item.id ? (
                        <div className="w-full space-y-2">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <input
                              type="text"
                              placeholder="Label (e.g. My bKash)"
                              value={editLabel}
                              onChange={e => setEditLabel(e.target.value)}
                              className="p-1.5 rounded bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                            />
                            <input
                              type="text"
                              placeholder="Address / Phone Number"
                              value={editAddressNumber}
                              onChange={e => setEditAddressNumber(e.target.value)}
                              className="p-1.5 rounded bg-slate-900 border border-cyan-500 text-white text-xs font-mono"
                            />
                            <input
                              type="text"
                              placeholder="Account Holder Name"
                              value={editHolderName}
                              onChange={e => setEditHolderName(e.target.value)}
                              className="p-1.5 rounded bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                            />
                          </div>
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingAddressId(null)}
                              className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-xs"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateSavedAddress(item.id)}
                              className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              <span>Save Changes</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="min-w-0 flex-1 font-mono">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-xs">{item.label}</span>
                              <span className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700 text-cyan-300 text-[10px]">
                                {item.methodName}
                              </span>
                            </div>
                            <div className="text-slate-300 text-xs truncate mt-0.5">
                              {item.addressOrNumber} {item.accountHolderName ? `(${item.accountHolderName})` : ''}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingAddressId(item.id);
                                setEditLabel(item.label);
                                setEditAddressNumber(item.addressOrNumber);
                                setEditHolderName(item.accountHolderName || '');
                                setEditGatewayId(item.methodId);
                              }}
                              className="p-1.5 rounded-lg bg-slate-900 hover:bg-cyan-950 text-cyan-400 border border-slate-700 hover:border-cyan-500 transition-colors"
                              title="Edit this saved address"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteSavedAddress(item.id)}
                              className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950 text-rose-400 border border-slate-700 hover:border-rose-500 transition-colors"
                              title="Delete this saved address"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Address Form inside Manager */}
              <form onSubmit={handleSaveNewAddressInManager} className="pt-2 border-t border-slate-800/80 space-y-2">
                <span className="text-[11px] font-bold text-slate-300 block">
                  + Add New Withdrawal Address:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <select
                    value={editGatewayId}
                    onChange={e => setEditGatewayId(e.target.value)}
                    className="p-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-mono"
                  >
                    {PAYMENT_GATEWAYS.map(g => (
                      <option key={g.id} value={g.id}>
                        {g.tixaLabel}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Label (e.g. My Personal Account)"
                    value={editLabel}
                    onChange={e => setEditLabel(e.target.value)}
                    className="p-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-mono"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Account / Address"
                    value={editAddressNumber}
                    onChange={e => setEditAddressNumber(e.target.value)}
                    className="p-2 rounded-lg bg-slate-950 border border-cyan-500/50 text-white text-xs font-mono"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center justify-center gap-1 shadow-md"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Address</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

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

        {/* Form Inputs */}
        <form onSubmit={handleSubmitWithdrawal} className="space-y-4 font-mono text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Asset to withdraw */}
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">
                Select Asset to Withdraw
              </label>
              <select
                value={selectedAsset}
                onChange={e => setSelectedAsset(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono focus:border-rose-500"
              >
                <option value="TIXA">TIXA (Benchmark: ${tixaPrice.toLocaleString()} USDT)</option>
                {tokens.map(t => (
                  <option key={t.address} value={t.address}>
                    {t.symbol} ({t.name}) - TX20
                  </option>
                ))}
              </select>
            </div>

            {/* Withdrawal Amount */}
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">
                Amount ({selectedAsset})
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="0.01"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono focus:border-rose-500"
                />
                <span className="absolute right-3 top-2.5 text-rose-400 font-bold">
                  {selectedAsset}
                </span>
              </div>
            </div>
          </div>

          {/* Live Net Payout Summary */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">GROSS USD VALUE</span>
              <span className="text-white font-bold">
                ${usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">NETWORK / PROCESSING FEE ({feePercent}%)</span>
              <span className="text-rose-400 font-bold">
                {feeAmount.toFixed(6)} {selectedAsset}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">NET PAYOUT ({localCurrency})</span>
              <span className="text-emerald-400 font-bold">
                {currentCountry?.currencySymbol || ''} {netLocalCurrencyAmount.toLocaleString()} {localCurrency}
              </span>
            </div>
          </div>

          {/* Destination Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">
                Recipient {selectedGateway.tixaLabel} Account / Phone / Address <span className="text-rose-400">*</span>:
              </label>
              <input
                type="text"
                required
                placeholder={isCryptoGateway ? "e.g. 0x... or TRC20 address or UID" : "e.g. 018XXXXXXXX or Bank Acc"}
                value={destinationAddressOrAccount}
                onChange={e => setDestinationAddressOrAccount(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono focus:border-rose-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-semibold">
                Account Holder Name / Memo:
              </label>
              <input
                type="text"
                placeholder="e.g. Alex Chen"
                value={accountHolderName}
                onChange={e => setAccountHolderName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono focus:border-rose-500 text-xs"
              />
            </div>
          </div>

          {/* Save this address checkbox & label input */}
          <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none font-sans text-slate-200">
              <input
                type="checkbox"
                checked={saveToAddressBook}
                onChange={e => setSaveToAddressBook(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400 bg-slate-900 border-slate-700"
              />
              <span className="font-semibold">Save for future withdrawals</span>
            </label>

            {saveToAddressBook && (
              <input
                type="text"
                placeholder="Label (e.g. My Main Account)"
                value={addressLabel}
                onChange={e => setAddressLabel(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono placeholder-slate-500"
              />
            )}
          </div>

          {/* Action buttons */}
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
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-600 hover:from-rose-400 hover:to-amber-500 text-white font-bold text-xs font-mono transition-all shadow-lg shadow-rose-500/25 disabled:opacity-50"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>{isSubmitting ? 'Dispatching to Queue...' : `Confirm Cash Out via ${selectedGateway.tixaLabel}`}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
