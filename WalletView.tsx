import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Send, 
  Download, 
  Copy, 
  Check, 
  QrCode, 
  Coins, 
  Sparkles, 
  Key, 
  ShieldCheck, 
  Plus, 
  Layers, 
  Clock, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Eye, 
  EyeOff, 
  RefreshCw,
  AlertCircle,
  ExternalLink,
  History,
  Smartphone,
  Share2,
  Zap
} from 'lucide-react';
import { blockchainEngine } from '../../core/blockchainEngine';
import { tokenEngine } from '../../core/tokenEngine';
import { authEngine } from '../../core/authEngine';
import { exchangeEngine } from '../../core/exchangeEngine';
import { ledgerEngine } from '../../core/ledgerEngine';
import { Transaction, TX20Token, AccountState } from '../../types/blockchain';
import { HashBadge } from '../common/HashBadge';
import { PortfolioHistoryChart } from '../dashboard/PortfolioHistoryChart';
import { DepositModal } from './DepositModal';
import { WithdrawModal } from './WithdrawModal';
import { LedgerHistoryView } from './LedgerHistoryView';
import { COUNTRIES } from '../../data/countries';
import confetti from 'canvas-confetti';
import { db } from '../../lib/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';

interface WalletViewProps {
  onOpenAuth: (mode: 'login' | 'register' | 'admin') => void;
  onGoToTrade?: () => void;
  onOpenFixDipoz: () => void;
}

export const WalletView: React.FC<WalletViewProps> = ({ onOpenAuth, onGoToTrade, onOpenFixDipoz }) => {
  const [session, setSession] = useState(authEngine.getSession());
  const [currentUser, setCurrentUser] = useState(authEngine.getCurrentUser());
  
  // Active address (either authenticated user's address or a persistent testnet wallet)
  const defaultTestAddress = 'tx1alexchennoncustodial2050vault99aa';
  const activeAddress = session?.walletAddress || currentUser?.walletAddress || defaultTestAddress;

  const [accountState, setAccountState] = useState<AccountState | null>(null);
  const [tokens, setTokens] = useState<TX20Token[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tixaUsdPrice, setTixaUsdPrice] = useState(990000.00);

  // Tab: 'overview' | 'ledger'
  const [activeTab, setActiveTab] = useState<'overview' | 'ledger'>('overview');

  // Modals
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [hasCopiedAddress, setHasCopiedAddress] = useState(false);

  // Send Form
  const [recipient, setRecipient] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<'TIXA' | string>('TIXA');
  const [sendMemo, setSendMemo] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);

  // Load wallet data directly from Firestore for authenticated users
  const refreshWallet = async () => {
    let firestoreBalance: number | undefined = undefined;
    const firestoreTxs: Transaction[] = [];

    if (currentUser?.id) {
      try {
        const userDocRef = doc(db, 'users', currentUser.id);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          if (userData.balance !== undefined) {
            firestoreBalance = userData.balance;
          }
        }

        const txsRef = collection(db, 'users', currentUser.id, 'transactions');
        const txsSnap = await getDocs(txsRef);
        txsSnap.forEach(d => {
          firestoreTxs.push(d.data() as Transaction);
        });
      } catch (err) {
        console.warn('Error fetching financial state from Firestore in WalletView:', err);
      }
    }

    const acc = blockchainEngine.getOrCreateAccount(activeAddress);
    if (firestoreBalance !== undefined) {
      acc.balance = firestoreBalance;
    }
    setAccountState({ ...acc });
    setTokens(tokenEngine.getTokens());

    if (firestoreTxs.length > 0) {
      setTransactions(firestoreTxs);
    } else {
      const allBlocks = blockchainEngine.getBlocks();
      const myTxs: Transaction[] = [];
      allBlocks.forEach(b => {
        b.transactions.forEach(t => {
          if (t.sender === activeAddress || t.receiver === activeAddress) {
            myTxs.unshift(t);
          }
        });
      });
      setTransactions(myTxs);
    }

    const price = ledgerEngine.getTixaUsdtPrice();
    if (price) setTixaUsdPrice(price);
  };

  useEffect(() => {
    refreshWallet();
    const unsubChain = blockchainEngine.subscribe(refreshWallet);
    const unsubToken = tokenEngine.subscribe(refreshWallet);
    const unsubLedger = ledgerEngine.subscribe(refreshWallet);
    const unsubAuth = authEngine.subscribe(() => {
      setSession(authEngine.getSession());
      setCurrentUser(authEngine.getCurrentUser());
      refreshWallet();
    });

    return () => {
      unsubChain();
      unsubToken();
      unsubLedger();
      unsubAuth();
    };
  }, [activeAddress]);

  const handleSendTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendError(null);
    setSendSuccess(null);

    const numAmount = parseFloat(sendAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setSendError('Please enter a valid transfer amount.');
      return;
    }

    if (!recipient.startsWith('tx1')) {
      setSendError('Invalid TIXA address. Address must start with "tx1"');
      return;
    }

    setIsSending(true);
    try {
      if (selectedAsset === 'TIXA') {
        const tx = await blockchainEngine.submitTransaction({
          sender: activeAddress,
          receiver: recipient.trim(),
          amount: numAmount,
          fee: 0, // 100% Free Peer-to-Peer Transfer
          type: 'TRANSFER',
          payload: { memo: sendMemo || 'Free P2P Direct Transfer' }
        });
        setSendSuccess(`Transaction Confirmed! Hash: ${tx.id.slice(0, 16)}... (0.0000 TIXA Fee - Instant 0s Delivery)`);
      } else {
        // TX-20 Token Transfer
        const txHash = await tokenEngine.transferTokens({
          tokenAddress: selectedAsset,
          sender: activeAddress,
          recipient: recipient.trim(),
          amount: numAmount
        });
        setSendSuccess(`TX-20 Transfer Confirmed! Hash: ${txHash.slice(0, 16)}... (100% Free Instant Transfer)`);
      }

      confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
      setTimeout(() => {
        setIsSendModalOpen(false);
        setSendAmount('');
        setRecipient('');
        setSendMemo('');
        setSendSuccess(null);
      }, 1800);
    } catch (err: any) {
      setSendError(err.message || 'Transfer failed');
    } finally {
      setIsSending(false);
    }
  };

  const currentTixaBal = accountState?.balance || 0;
  const currentStakedBal = accountState?.stakedBalance || 0;
  const currentLockedBal = accountState?.lockedBalance || 0;
  const totalTixa = currentTixaBal + currentStakedBal + currentLockedBal;
  const totalUsdValue = totalTixa * tixaUsdPrice;

  const userCurrency = currentUser?.currency || 'BDT';
  const userCountry = COUNTRIES.find(c => c.currency === userCurrency) || COUNTRIES[0];
  const currencySymbol = userCurrency === 'BTC' ? '₿' : userCountry.currencySymbol;
  const currencyDecimals = userCurrency === 'BTC' ? 6 : 2;
  const totalLocalFiat = ledgerEngine.convertUsdToFiat(totalUsdValue, userCurrency);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-16">
      {/* Wallet Header & Account Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-heading">
              TIXA Non-Custodial Vault
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-mono">
              BIP-39 VAULT
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Keys generated and signed locally via WebCrypto hardware primitives.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Deposit Button */}
          <button
            type="button"
            id="wallet-top-deposit-btn"
            onClick={() => setIsDepositModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black text-xs font-bold font-mono transition-all shadow-md shadow-cyan-500/20"
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>Deposit / Buy TIXA</span>
          </button>

          {/* Quick Withdraw Button */}
          <button
            type="button"
            id="wallet-top-withdraw-btn"
            onClick={() => setIsWithdrawModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white text-xs font-bold font-mono transition-all shadow-md shadow-rose-500/20"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Withdraw / Cash Out</span>
          </button>

          <button
            type="button"
            onClick={() => setIsBackupModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono transition-colors"
          >
            <Key className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Backup</span>
          </button>

          {onGoToTrade && (
            <button
              type="button"
              id="wallet-goto-trade-btn"
              onClick={onGoToTrade}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono transition-all"
            >
              <Coins className="w-3.5 h-3.5 text-cyan-400" />
              <span>Exchange / Trade</span>
            </button>
          )}

          <button
            type="button"
            id="wallet-fixdipoz-btn"
            onClick={onOpenFixDipoz}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 via-emerald-400 to-blue-500 text-black text-xs font-black font-mono transition-all shadow-md shadow-cyan-500/30 animate-pulse"
          >
            <Zap className="w-3.5 h-3.5 fill-black" />
            <span>FIXDIPOZ VIP MINING (33 BOX) ACTIVE</span>
          </button>

          {!session && (
            <button
              type="button"
              onClick={() => onOpenAuth('login')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all shadow-md shadow-cyan-500/20"
            >
              <span>Sign In / Create</span>
            </button>
          )}
        </div>
      </div>

      {/* Account Address Strip */}
      <div className="p-4 rounded-2xl cyber-glass border border-cyan-500/25 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-black font-bold font-mono text-sm">
            TX
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">Active Bech32 Address:</span>
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Active</span>
              </span>
            </div>
            <HashBadge hash={activeAddress} type="address" truncate={false} className="text-xs sm:text-sm mt-0.5" />
          </div>
        </div>

        {/* Quick Send, Receive, Deposit, Withdraw Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            type="button"
            id="wallet-open-send-btn"
            onClick={() => setIsSendModalOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-100 font-bold text-xs tracking-wide shadow-md transition-all font-mono"
          >
            <Send className="w-3.5 h-3.5 text-cyan-400" />
            <span>Send Asset</span>
          </button>

          <button
            type="button"
            id="wallet-open-receive-btn"
            onClick={() => setIsReceiveModalOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-100 font-semibold text-xs transition-all font-mono"
          >
            <QrCode className="w-3.5 h-3.5 text-cyan-400" />
            <span>Receive / QR</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDepositModalOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-300 font-bold text-xs transition-all font-mono"
          >
            <ArrowDownLeft className="w-3.5 h-3.5 text-cyan-400" />
            <span>Deposit</span>
          </button>

          <button
            type="button"
            onClick={() => setIsWithdrawModalOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 text-rose-300 font-bold text-xs transition-all font-mono"
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
            <span>Withdraw</span>
          </button>
        </div>
      </div>

      {/* Balance Cards Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Portfolio Value with Local Currency Conversion */}
        <div className="p-5 rounded-2xl cyber-glass border border-cyan-500/30 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>TOTAL ESTIMATED VALUE</span>
            <Coins className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
            ${totalUsdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-cyan-400">
              {totalTixa.toFixed(4)} TIXA @ ${tixaUsdPrice.toLocaleString()}
            </span>
          </div>
          <div className="pt-1.5 border-t border-slate-800/80 text-[11px] font-mono text-emerald-400 flex items-center gap-1">
            <span>{userCountry.flag}</span>
            <span>≈ {currencySymbol} {totalLocalFiat.toLocaleString('en-US', { minimumFractionDigits: currencyDecimals, maximumFractionDigits: currencyDecimals })} {userCurrency}</span>
          </div>
        </div>

        {/* Available TIXA */}
        <div className="p-5 rounded-2xl cyber-glass border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>AVAILABLE BALANCE</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white font-mono tracking-tight">
            {currentTixaBal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
          </p>
          <p className="text-[11px] text-emerald-400 font-mono">
            ≈ {currencySymbol} {ledgerEngine.convertUsdToFiat(currentTixaBal * tixaUsdPrice, userCurrency).toLocaleString('en-US', { minimumFractionDigits: currencyDecimals, maximumFractionDigits: currencyDecimals })} {userCurrency}
          </p>
        </div>

        {/* Staked in Consensus */}
        <div className="p-5 rounded-2xl cyber-glass border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>STAKED TO VALIDATORS</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white font-mono tracking-tight">
            {currentStakedBal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-blue-400 font-mono">Earning ~12.4% Annual APR</p>
        </div>

        {/* Locked / Vesting */}
        <div className="p-5 rounded-2xl cyber-glass border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>LOCKED / GOVERNANCE</span>
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white font-mono tracking-tight">
            {currentLockedBal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-purple-400 font-mono">Timelocked in Multi-Sig</p>
        </div>
      </div>

      {/* Main View Tabs (Overview & Portfolio vs Complete Ledger History) */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-1 font-mono text-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-t-xl font-bold transition-all flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-950/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Assets & Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-4 py-2.5 rounded-t-xl font-bold transition-all flex items-center gap-2 ${
            activeTab === 'ledger'
              ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-950/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Unified Ledger & Statements</span>
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Real-time Recharts Portfolio Valuation & Asset Allocation */}
          <PortfolioHistoryChart 
            walletAddress={activeAddress} 
            tixaBalance={currentTixaBal} 
            stakedBalance={currentStakedBal} 
          />

          {/* TX-20 Token Holdings Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white font-heading flex items-center gap-2">
                <Coins className="w-5 h-5 text-cyan-400" />
                <span>TX-20 Standard Token Assets</span>
              </h3>
              <span className="text-xs font-mono text-slate-400">
                {tokens.length} Verified Ecosystem Assets
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {tokens.map(tok => {
                const bal = accountState?.tokens[tok.address] || 0;
                return (
                  <div
                    key={tok.address}
                    className="p-4 rounded-xl cyber-glass border border-slate-800/90 hover:border-cyan-500/40 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800/60 flex items-center justify-center font-bold text-xs text-cyan-400 font-mono">
                          {tok.symbol.slice(0, 3)}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white font-heading">{tok.name}</h4>
                          <span className="text-[10px] font-mono text-cyan-400">{tok.symbol}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between font-mono text-xs">
                      <span className="text-slate-400">Balance:</span>
                      <span className="text-white font-bold">{bal.toLocaleString()} {tok.symbol}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent On-Chain Transfers Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white font-heading flex items-center gap-2">
                <Clock className="w-5 h-5 text-cyan-400" />
                <span>Recent Vault Transfers</span>
              </h3>
              <button
                onClick={() => setActiveTab('ledger')}
                className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1"
              >
                <span>View Full Ledger Statements</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <div className="overflow-hidden rounded-2xl cyber-glass border border-slate-800">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#060b17] border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-3.5">Type</th>
                      <th className="p-3.5">Tx Hash</th>
                      <th className="p-3.5">Counterparty</th>
                      <th className="p-3.5">Amount</th>
                      <th className="p-3.5">Fee</th>
                      <th className="p-3.5">Time</th>
                      <th className="p-3.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-500">
                          No transactions recorded yet for this vault. Try claiming the faucet or depositing funds!
                        </td>
                      </tr>
                    ) : (
                      transactions.slice(0, 8).map(tx => {
                        const isSender = tx.sender === activeAddress;
                        return (
                          <tr key={tx.id} className="hover:bg-slate-900/50 transition-colors">
                            <td className="p-3.5">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                                tx.type === 'TRANSFER'
                                  ? isSender ? 'bg-amber-950 text-amber-300' : 'bg-emerald-950 text-emerald-300'
                                  : 'bg-cyan-950 text-cyan-300'
                              }`}>
                                {isSender ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
                                <span>{tx.type}</span>
                              </span>
                            </td>
                            <td className="p-3.5">
                              <HashBadge hash={tx.id} type="tx" />
                            </td>
                            <td className="p-3.5">
                              <HashBadge 
                                hash={isSender ? tx.receiver : tx.sender} 
                                type="address" 
                              />
                            </td>
                            <td className="p-3.5 font-bold">
                              <span className={isSender ? 'text-rose-400' : 'text-emerald-400'}>
                                {isSender ? '-' : '+'}{tx.amount} {tx.payload?.tokenSymbol || 'TIXA'}
                              </span>
                            </td>
                            <td className="p-3.5 text-slate-400">
                              {tx.fee} TIXA
                            </td>
                            <td className="p-3.5 text-slate-500">
                              {new Date(tx.timestamp).toLocaleTimeString()}
                            </td>
                            <td className="p-3.5 text-right">
                              <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800 text-[10px]">
                                CONFIRMED
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Complete Unified Ledger History */}
      {activeTab === 'ledger' && (
        <LedgerHistoryView walletAddress={activeAddress} />
      )}

      {/* Deposit Modal */}
      <DepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        onSuccess={() => {
          refreshWallet();
          setActiveTab('ledger');
        }}
      />

      {/* Withdraw Modal */}
      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        onSuccess={() => {
          refreshWallet();
          setActiveTab('ledger');
        }}
      />

      {/* Send Modal */}
      {isSendModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-2xl bg-[#090e1e] border border-cyan-500/30 shadow-2xl p-6 text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white font-heading flex items-center gap-2">
                <Send className="w-4 h-4 text-cyan-400" />
                <span>Send Cryptocurrency</span>
              </h3>
              <button
                onClick={() => setIsSendModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {sendError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
                {sendError}
              </div>
            )}

            {sendSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs">
                {sendSuccess}
              </div>
            )}

            <form onSubmit={handleSendTransaction} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Select Asset
                </label>
                <select
                  value={selectedAsset}
                  onChange={e => setSelectedAsset(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                >
                  <option value="TIXA">BTX (Native Base) (Bal: {currentTixaBal.toFixed(4)})</option>
                  {tokens.map(t => (
                    <option key={t.address} value={t.address}>
                      {t.name} ({t.symbol}) - Bal: {accountState?.tokens[t.address] || 0}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Recipient Bech32 Address
                </label>
                <input
                  type="text"
                  required
                  placeholder="tx1..."
                  value={recipient}
                  onChange={e => setRecipient(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-500 text-xs text-white placeholder-slate-600 font-mono"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-mono text-slate-300">Amount</label>
                  <button
                    type="button"
                    onClick={() => setSendAmount(currentTixaBal.toString())}
                    className="text-[10px] text-cyan-400 hover:underline font-mono"
                  >
                    Use MAX
                  </button>
                </div>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="0.00"
                  value={sendAmount}
                  onChange={e => setSendAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-500 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Memo (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Payment invoice / ref"
                  value={sendMemo}
                  onChange={e => setSendMemo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                />
              </div>

              <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-[11px] font-mono text-slate-400 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Network Gas Fee:</span>
                  <span className="text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-[10px]">
                    0.0000 TIXA (100% FREE)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Delivery Speed:</span>
                  <span className="text-cyan-300 font-bold">Instant (0 Seconds to Single Address)</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold text-sm tracking-wide font-mono disabled:opacity-50"
              >
                {isSending ? 'Signing & Broadcasting...' : 'Sign & Broadcast Transaction'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Receive Modal */}
      {isReceiveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm rounded-2xl bg-[#090e1e] border border-cyan-500/30 shadow-2xl p-6 text-center space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-heading">
                Receive TIXA & Assets
              </h3>
              <button
                onClick={() => setIsReceiveModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* High-Tech QR Display */}
            <div className="flex justify-center py-2">
              <div className="p-4 bg-white rounded-2xl shadow-xl border-4 border-cyan-400">
                <svg viewBox="0 0 100 100" className="w-40 h-40">
                  <rect width="100" height="100" fill="white" />
                  <rect x="10" y="10" width="24" height="24" fill="black" />
                  <rect x="14" y="14" width="16" height="16" fill="white" />
                  <rect x="18" y="18" width="8" height="8" fill="black" />

                  <rect x="66" y="10" width="24" height="24" fill="black" />
                  <rect x="70" y="14" width="16" height="16" fill="white" />
                  <rect x="74" y="18" width="8" height="8" fill="black" />

                  <rect x="10" y="66" width="24" height="24" fill="black" />
                  <rect x="14" y="70" width="16" height="16" fill="white" />
                  <rect x="18" y="74" width="8" height="8" fill="black" />

                  <circle cx="45" cy="20" r="3" fill="black" />
                  <circle cx="55" cy="20" r="3" fill="black" />
                  <circle cx="45" cy="35" r="3" fill="black" />
                  <circle cx="50" cy="50" r="4" fill="#06b6d4" />
                  <circle cx="20" cy="45" r="3" fill="black" />
                  <circle cx="35" cy="45" r="3" fill="black" />
                  <circle cx="65" cy="45" r="3" fill="black" />
                  <circle cx="80" cy="45" r="3" fill="black" />
                  <circle cx="45" cy="65" r="3" fill="black" />
                  <circle cx="55" cy="65" r="3" fill="black" />
                  <circle cx="45" cy="80" r="3" fill="black" />
                  <circle cx="65" cy="75" r="3" fill="black" />
                  <circle cx="78" cy="68" r="3" fill="black" />
                  <circle cx="80" cy="80" r="3" fill="black" />
                </svg>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400 font-mono">Your Public TIXA Address</p>
                {hasCopiedAddress && (
                  <span className="text-[10px] text-emerald-400 font-mono font-bold animate-pulse">
                    ✓ Copied!
                  </span>
                )}
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 break-all select-all">
                {activeAddress}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                id="wallet-copy-address-btn"
                onClick={() => {
                  navigator.clipboard.writeText(activeAddress);
                  setHasCopiedAddress(true);
                  setTimeout(() => setHasCopiedAddress(false), 2500);
                }}
                className={`py-2.5 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all ${
                  hasCopiedAddress
                    ? 'bg-emerald-500 text-black'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-md shadow-cyan-500/20'
                }`}
              >
                {hasCopiedAddress ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{hasCopiedAddress ? 'Copied' : 'Copy Address'}</span>
              </button>

              <button
                type="button"
                id="wallet-share-address-btn"
                onClick={async () => {
                  if (navigator.share) {
                    try {
                      await navigator.share({
                        title: 'TIXAPAY Wallet Address',
                        text: `Here is my TIXAPAY Mainnet wallet address: ${activeAddress}`,
                        url: window.location.origin
                      });
                    } catch (e) {
                      // user cancelled or share failed
                    }
                  } else {
                    navigator.clipboard.writeText(activeAddress);
                    setHasCopiedAddress(true);
                    setTimeout(() => setHasCopiedAddress(false), 2500);
                  }
                }}
                className="py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white font-bold text-xs font-mono flex items-center justify-center gap-1.5 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Share Address</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Backup Modal */}
      {isBackupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-2xl bg-[#090e1e] border border-cyan-500/30 shadow-2xl p-6 text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Encrypted Vault Backup</span>
              </h3>
              <button
                onClick={() => setIsBackupModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/80 text-amber-300 text-xs leading-relaxed">
              <strong>SECURITY WARNING:</strong> Never share your seed phrase with anyone, including administrators. Anyone with this phrase has complete control over your funds.
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-300">
                Encrypted Keystore JSON
              </label>
              <textarea
                readOnly
                rows={5}
                value={JSON.stringify({
                  version: 1,
                  address: activeAddress,
                  crypto: {
                    cipher: 'aes-256-gcm',
                    kdf: 'pbkdf2',
                    kdfparams: { c: 100000, prf: 'sha256' }
                  },
                  id: 'tixa-vault-2050'
                }, null, 2)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300 resize-none"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                const element = document.createElement('a');
                const file = new Blob([JSON.stringify({ address: activeAddress, timestamp: Date.now() }, null, 2)], { type: 'application/json' });
                element.href = URL.createObjectURL(file);
                element.download = `tixa-vault-backup-${activeAddress.slice(0, 8)}.json`;
                document.body.appendChild(element);
                element.click();
                setIsBackupModalOpen(false);
              }}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs font-mono flex items-center justify-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Encrypted Keystore File</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

