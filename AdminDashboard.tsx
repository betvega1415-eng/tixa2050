import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Users, 
  Sliders, 
  Activity, 
  Fingerprint, 
  Flame, 
  Key, 
  RefreshCw, 
  Check, 
  X,
  Vote,
  Sparkles,
  ArrowDownLeft,
  ArrowUpRight,
  UserCheck,
  UserX,
  Settings,
  QrCode,
  DollarSign,
  Smartphone,
  Building2,
  ExternalLink,
  Search,
  Download,
  Send,
  Coins,
  BookOpen,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { authEngine } from '../../core/authEngine';
import { auditEngine } from '../../core/auditEngine';
import { ledgerEngine } from '../../core/ledgerEngine';
import { blockchainEngine } from '../../core/blockchainEngine';
import { nativeMarketEngine } from '../../core/nativeMarketEngine';
import { db } from '../../lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { SecurityAuditLog, MultiSigAction, AuthRequestLog, UserAccount } from '../../types/auth';
import { DepositRequest, WithdrawalRequest, SystemLedgerSettings } from '../../types/ledger';
import { HashBadge } from '../common/HashBadge';
import { ADMIN_PROTOCOL_RULES_20 } from '../../data/paymentGateways';
import { PaymentLogoIcon } from '../common/PaymentLogoIcon';
import { PaymentAddressManagement } from './PaymentAddressManagement';
import { TixaAiAdminMonitor } from './TixaAiAdminMonitor';
import { AdminBroadcastMediaManagement } from './AdminBroadcastMediaManagement';
import { AdminSessionMonitor } from './AdminSessionMonitor';
import confetti from 'canvas-confetti';

interface AdminDashboardProps {
  onOpenAuth: (mode: 'login' | 'register' | 'admin') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onOpenAuth }) => {
  const [adminUser, setAdminUser] = useState(authEngine.getCurrentAdmin());
  const [activeTab, setActiveTab] = useState<'admin_sessions' | 'media_broadcast' | 'native_market' | 'tixa_ai_monitor' | 'payment_addresses' | 'otp_monitor' | 'direct_dispatch' | 'protocol_rules' | 'auth_requests' | 'deposits' | 'withdrawals' | 'settings' | 'proposals' | 'governance' | 'audit' | 'batch_control'>('admin_sessions');

  // OTP Sessions Monitoring State
  const [otpSessions, setOtpSessions] = useState(authEngine.getOtpSessions());
  const [copiedOtpId, setCopiedOtpId] = useState<string | null>(null);

  // Direct Crypto Dispatch State
  const [allUsers, setAllUsers] = useState<UserAccount[]>(authEngine.getAllUsers());
  const [targetUserIdentifier, setTargetUserIdentifier] = useState<string>('');
  const [dispatchAmount, setDispatchAmount] = useState<string>('5000');
  const [dispatchAsset, setDispatchAsset] = useState<string>('TIXA');
  const [dispatchMemo, setDispatchMemo] = useState<string>('Admin Protocol Genesis Mint Allocation');
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState<string | null>(null);
  const [dispatchError, setDispatchError] = useState<string | null>(null);

  // 20 Protocol Rules Search
  const [rulesSearch, setRulesSearch] = useState('');

  // Auth Requests
  const [authRequests, setAuthRequests] = useState<AuthRequestLog[]>([]);
  const [authFilterStatus, setAuthFilterStatus] = useState<string>('ALL');

  // Deposit Requests
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [depositFilterStatus, setDepositFilterStatus] = useState<string>('ALL');

  // Withdrawal Requests
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [withdrawFilterStatus, setWithdrawFilterStatus] = useState<string>('ALL');

  // System Settings
  const [settings, setSettings] = useState<SystemLedgerSettings>(ledgerEngine.getSettings());
  const [editPrice, setEditPrice] = useState<number>(settings.tixaBasePriceUsdt);
  const [editBkash, setEditBkash] = useState<string>(settings.merchantAccounts.bkashMerchantNumber || settings.bkashNumber);
  const [editRocket, setEditRocket] = useState<string>(settings.merchantAccounts.rocketMerchantNumber || settings.rocketNumber);
  const [editNagad, setEditNagad] = useState<string>(settings.merchantAccounts.nagadMerchantNumber || settings.nagadNumber);
  const [editBinancePay, setEditBinancePay] = useState<string>(settings.merchantAccounts.binancePayId || settings.binancePayId);
  const [editCryptoDepositAddr, setEditCryptoDepositAddr] = useState<string>(settings.merchantAccounts.cryptoDepositAddresses.TRC20 || settings.cryptoDepositAddress);
  const [settingsSuccess, setSettingsSuccess] = useState<string | null>(null);

  // Multi-sig Proposals state
  const [proposals, setProposals] = useState<MultiSigAction[]>([]);
  const [newProposalTitle, setNewProposalTitle] = useState('');
  const [newProposalType, setNewProposalType] = useState<MultiSigAction['actionType']>('TREASURY_MINT');
  const [newProposalAmount, setNewProposalAmount] = useState('10000');
  const [isProposing, setIsProposing] = useState(false);

  // Address Freeze/Unfreeze state
  const [targetAddress, setTargetAddress] = useState('');
  const [freezeReason, setFreezeReason] = useState('');
  const [freezeActionLoading, setFreezeActionLoading] = useState(false);
  const [freezeMsg, setFreezeMsg] = useState<string | null>(null);

  // Audit Logs state
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>([]);
  const [chainValid, setChainValid] = useState<boolean | null>(null);
  const [verifyingChain, setVerifyingChain] = useState(false);

  // Batch Control state
  const [batchTargetGroup, setBatchTargetGroup] = useState<'all' | 'active' | 'suspended' | 'verified'>('active');
  const [batchActionType, setBatchActionType] = useState<'PAUSE_WALLET' | 'BROADCAST_NOTICE' | 'GRANT_BONUS' | 'UNPAUSE_WALLET'>('BROADCAST_NOTICE');
  const [batchMessage, setBatchMessage] = useState('SECURITY NOTICE: Protocol verification required for all active accounts.');
  const [batchBonusAmount, setBatchBonusAmount] = useState('100');
  const [batchExecuting, setBatchExecuting] = useState(false);
  const [batchResultMsg, setBatchResultMsg] = useState<string | null>(null);
  const [batchLogs, setBatchLogs] = useState<{ id: string; timestamp: number; action: string; targetGroup: string; affectedCount: number; adminName: string }[]>([
    { id: 'b_1', timestamp: Date.now() - 3600000, action: 'BROADCAST_NOTICE', targetGroup: 'active', affectedCount: 1, adminName: adminUser?.name || 'Super Admin' }
  ]);

  const handleExecuteBatchAction = async () => {
    setBatchResultMsg(null);
    setBatchExecuting(true);
    try {
      const matchingUsers = allUsers.filter(u => {
        if (batchTargetGroup === 'active') return u.status === 'active' || !u.status;
        if (batchTargetGroup === 'suspended') return u.status === 'suspended';
        if (batchTargetGroup === 'verified') return u.emailVerified || u.phone;
        return true;
      });

      if (matchingUsers.length === 0) {
        throw new Error('No users match the selected target group.');
      }

      await new Promise(resolve => setTimeout(resolve, 1000));

      let updatedUsers = [...allUsers];
      if (batchActionType === 'PAUSE_WALLET') {
        updatedUsers = updatedUsers.map(u => {
          const isMatch = matchingUsers.some(m => m.id === u.id);
          return isMatch ? { ...u, status: 'suspended' as const } : u;
        });
      } else if (batchActionType === 'UNPAUSE_WALLET') {
        updatedUsers = updatedUsers.map(u => {
          const isMatch = matchingUsers.some(m => m.id === u.id);
          return isMatch ? { ...u, status: 'active' as const } : u;
        });
      }

      setAllUsers(updatedUsers);
      confetti({ particleCount: 75, spread: 85, origin: { y: 0.6 } });

      const newLog = {
        id: `batch_${Date.now()}`,
        timestamp: Date.now(),
        action: batchActionType,
        targetGroup: batchTargetGroup,
        affectedCount: matchingUsers.length,
        adminName: adminUser?.name || 'Admin'
      };

      setBatchLogs([newLog, ...batchLogs]);
      setBatchResultMsg(`✅ Batch action "${batchActionType}" successfully executed on ${matchingUsers.length} user(s)!`);
    } catch (err: any) {
      setBatchResultMsg(`❌ Batch execution error: ${err.message}`);
    } finally {
      setBatchExecuting(false);
    }
  };

  const refreshAll = () => {
    setAdminUser(authEngine.getCurrentAdmin());
    setAllUsers(authEngine.getAllUsers());
    setOtpSessions(authEngine.getOtpSessions());
    setAuthRequests(authEngine.getAuthRequests());
    setDeposits(ledgerEngine.getDeposits());
    setWithdrawals(ledgerEngine.getWithdrawals());
    setSettings(ledgerEngine.getSettings());
    setProposals(authEngine.getMultiSigProposals());
    setAuditLogs(auditEngine.getLogs());
  };

  useEffect(() => {
    refreshAll();
    const interval = setInterval(refreshAll, 2000);
    const unsubAuth = authEngine.subscribe(refreshAll);
    const unsubLedger = ledgerEngine.subscribe(refreshAll);
    const unsubChain = blockchainEngine.subscribe(refreshAll);

    // Real-time Firestore users synchronization for Admin Dashboard
    let unsubFirestoreUsers: (() => void) | undefined;
    try {
      const q = query(collection(db, 'users'));
      unsubFirestoreUsers = onSnapshot(q, (snapshot) => {
        const usersMap: Record<string, UserAccount> = {};
        authEngine.getAllUsers().forEach(u => {
          usersMap[u.email] = u;
          usersMap[u.id] = u;
        });
        snapshot.forEach((docSnap) => {
          const userData = docSnap.data() as UserAccount;
          if (userData && userData.email) {
            usersMap[userData.email] = userData;
            usersMap[userData.id] = userData;
          }
        });
        const combinedUsers = Object.values(usersMap);
        if (combinedUsers.length > 0) {
          setAllUsers(combinedUsers);
        }
      }, (error) => {
        console.warn('Firestore users listener warning:', error);
      });
    } catch (err) {
      console.warn('Firestore users sync setup warning:', err);
    }

    return () => {
      clearInterval(interval);
      unsubAuth();
      unsubLedger();
      unsubChain();
      if (unsubFirestoreUsers) unsubFirestoreUsers();
    };
  }, []);

  // Handler: Direct Unlimited Crypto Dispatch
  const handleDispatchCrypto = async (e: React.FormEvent) => {
    e.preventDefault();
    setDispatchError(null);
    setDispatchSuccess(null);

    const numAmount = parseFloat(dispatchAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setDispatchError('Please enter a valid dispatch amount greater than 0.');
      return;
    }

    if (!targetUserIdentifier.trim()) {
      setDispatchError('Please enter or select a User ID, Email, or Wallet Address.');
      return;
    }

    setIsDispatching(true);
    try {
      const res = await authEngine.adminSendUnlimitedCryptoToUser({
        targetUserIdentifier: targetUserIdentifier.trim(),
        amount: numAmount,
        asset: dispatchAsset,
        memo: dispatchMemo
      });

      setDispatchSuccess(
        `Successfully dispatched ${numAmount.toLocaleString()} ${dispatchAsset} to User (${res.user.email} | ID: ${res.user.id}). Credited directly to single address: ${res.user.walletAddress} (Tx: ${res.txHash.slice(0, 14)}...)`
      );
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      refreshAll();
    } catch (err: any) {
      setDispatchError(err.message || 'Dispatch failed');
    } finally {
      setIsDispatching(false);
    }
  };

  // Handler: Approve User Registration
  const handleApproveAuth = async (requestId: string) => {
    try {
      const req = authRequests.find(r => r.id === requestId);
      if (req) {
        await authEngine.approveUserRegistration(req.userId, adminUser?.id || 'admin_super_01');
      }
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      refreshAll();
    } catch (err: any) {
      alert(`Error approving user: ${err.message}`);
    }
  };

  // Handler: Reject User Registration
  const handleRejectAuth = async (requestId: string) => {
    const reason = prompt('Enter rejection reason for this registration request:', 'Compliance verification failed');
    if (reason === null) return;
    try {
      const req = authRequests.find(r => r.id === requestId);
      if (req) {
        await authEngine.rejectUserRegistration(req.userId, adminUser?.id || 'admin_super_01', reason);
      }
      refreshAll();
    } catch (err: any) {
      alert(`Error rejecting user: ${err.message}`);
    }
  };

  // Handler: Approve Deposit
  const handleApproveDeposit = async (depositId: string) => {
    try {
      await ledgerEngine.approveDeposit(depositId);
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      refreshAll();
    } catch (err: any) {
      alert(`Deposit approval error: ${err.message}`);
    }
  };

  // Handler: Reject Deposit
  const handleRejectDeposit = async (depositId: string) => {
    const reason = prompt('Enter deposit rejection note (e.g. Invalid transaction hash / Unverified payment):', 'Unverified transaction proof');
    if (reason === null) return;
    try {
      await ledgerEngine.rejectDeposit(depositId, reason);
      refreshAll();
    } catch (err: any) {
      alert(`Deposit rejection error: ${err.message}`);
    }
  };

  // Handler: Approve Withdrawal
  const handleApproveWithdrawal = async (withdrawalId: string) => {
    try {
      await ledgerEngine.approveWithdrawal(withdrawalId);
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      refreshAll();
    } catch (err: any) {
      alert(`Withdrawal approval error: ${err.message}`);
    }
  };

  // Handler: Reject Withdrawal
  const handleRejectWithdrawal = async (withdrawalId: string) => {
    const reason = prompt('Enter withdrawal rejection reason (Funds will be refunded to user):', 'Compliance verification failed');
    if (reason === null) return;
    try {
      await ledgerEngine.rejectWithdrawal(withdrawalId, reason);
      refreshAll();
    } catch (err: any) {
      alert(`Withdrawal rejection error: ${err.message}`);
    }
  };

  // Handler: Save System Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const currentSettings = ledgerEngine.getSettings();
    ledgerEngine.updateSettings({
      tixaBasePriceUsdt: Number(editPrice) || 990000,
      merchantAccounts: {
        ...currentSettings.merchantAccounts,
        bkashMerchantNumber: editBkash,
        rocketMerchantNumber: editRocket,
        nagadMerchantNumber: editNagad,
        binancePayId: editBinancePay,
        cryptoDepositAddresses: {
          ...currentSettings.merchantAccounts.cryptoDepositAddresses,
          TRC20: editCryptoDepositAddr
        }
      }
    });
    setSettingsSuccess('System pricing and receiving gateway addresses saved successfully!');
    confetti({ particleCount: 50, spread: 50 });
    setTimeout(() => setSettingsSuccess(null), 3000);
  };

  // MultiSig & Freeze Handlers
  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUser) return;
    setIsProposing(true);

    try {
      await authEngine.createMultiSigProposal({
        actionType: newProposalType,
        description: newProposalTitle,
        data: { amount: Number(newProposalAmount), targetAddress }
      });

      confetti({ particleCount: 50, spread: 60 });
      setNewProposalTitle('');
      refreshAll();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProposing(false);
    }
  };

  const handleSignProposal = async (proposalId: string) => {
    if (!adminUser) return;
    try {
      await authEngine.approveMultiSigProposal(proposalId);
      confetti({ particleCount: 60, spread: 70 });
      refreshAll();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleFreezeAddress = async (isFrozen: boolean) => {
    if (!adminUser) return;
    if (!targetAddress.trim()) {
      alert('Please enter a valid User ID or Bech32 address starting with tx1');
      return;
    }

    setFreezeActionLoading(true);
    setFreezeMsg(null);
    try {
      if (isFrozen) {
        await authEngine.freezeAccount(targetAddress.trim(), freezeReason || 'Security risk mitigation');
      } else {
        await authEngine.unfreezeAccount(targetAddress.trim());
      }
      setFreezeMsg(`Account/Address successfully ${isFrozen ? 'FROZEN' : 'UNFROZEN'} by governance decree.`);
      setTargetAddress('');
      setFreezeReason('');
      refreshAll();
    } catch (err: any) {
      setFreezeMsg(`Error: ${err.message}`);
    } finally {
      setFreezeActionLoading(false);
    }
  };

  const handleVerifyChain = async () => {
    setVerifyingChain(true);
    const result = await auditEngine.verifyIntegrity();
    setVerifyingChain(false);
    setChainValid(result.isValid);
    if (result.isValid) {
      confetti({ particleCount: 80, spread: 80 });
    }
  };

  // Gate Authentication State (Password-Only Authentication for Authorized Accounts)
  const [gateSelectedAdminId, setGateSelectedAdminId] = useState<'betvega_admin' | 'dr_vance' | 'm_sterling' | 'a_thorne' | 'k_nakamura'>('betvega_admin');
  const [gatePassword, setGatePassword] = useState('');
  const [gateShowPassword, setGateShowPassword] = useState(false);
  const [gateLoading, setGateLoading] = useState(false);
  const [gateError, setGateError] = useState<string | null>(null);

  // Filtered requests
  const filteredAuth = authRequests.filter(r => authFilterStatus === 'ALL' || r.status === authFilterStatus);
  const filteredDeposits = deposits.filter(d => depositFilterStatus === 'ALL' || d.status === depositFilterStatus);
  const filteredWithdrawals = withdrawals.filter(w => withdrawFilterStatus === 'ALL' || w.status === withdrawFilterStatus);

  const filteredRules = ADMIN_PROTOCOL_RULES_20.filter(r => 
    r.bn.includes(rulesSearch) || r.en.toLowerCase().includes(rulesSearch.toLowerCase()) || r.id.toString() === rulesSearch
  );

  const pendingAuthCount = authRequests.filter(r => r.status === 'PENDING').length;
  const pendingDepositCount = deposits.filter(d => d.status === 'PENDING').length;
  const pendingWithdrawCount = withdrawals.filter(w => w.status === 'PENDING').length;
  const activeOtpCount = otpSessions.filter(s => s.status === 'PENDING' && s.expiresAt > Date.now()).length;

  const handleGateLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setGateError(null);
    if (!gatePassword.trim()) {
      setGateError('Please enter the authorized Admin password.');
      return;
    }
    setGateLoading(true);
    try {
      await authEngine.loginAdmin({
        adminId: gateSelectedAdminId,
        passwordPlain: gatePassword
      });
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      refreshAll();
    } catch (err: any) {
      setGateError(err.message || 'DENY LOGIN: Password does not match the authorized credentials for the selected Admin account.');
    } finally {
      setGateLoading(false);
    }
  };

  // If not logged in as Admin, show strictly password-only restricted gate
  if (!adminUser) {
    const adminProfiles = [
      {
        id: 'betvega_admin' as const,
        name: 'BetVega Admin',
        fullName: 'BetVega Super Admin (betvega1415@gmail.com)',
        role: 'SUPER_ADMIN',
        roleBadge: 'border-purple-500/40 bg-purple-950/40 text-purple-300',
        title: 'Platform Owner & Super Admin'
      },
      {
        id: 'dr_vance' as const,
        name: 'Dr. Vance',
        fullName: 'Dr. Evelyn Vance',
        role: 'SUPER_ADMIN',
        roleBadge: 'border-purple-500/40 bg-purple-950/40 text-purple-300',
        title: 'Chief Protocol Architect'
      },
      {
        id: 'm_sterling' as const,
        name: 'M. Sterling',
        fullName: 'Marcus Sterling',
        role: 'FINANCE_ADMIN',
        roleBadge: 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300',
        title: 'Treasury Comptroller'
      },
      {
        id: 'a_thorne' as const,
        name: 'A. Thorne',
        fullName: 'Aria Thorne',
        role: 'SECURITY_ADMIN',
        roleBadge: 'border-amber-500/40 bg-amber-950/40 text-amber-300',
        title: 'Cybersecurity Director'
      },
      {
        id: 'k_nakamura' as const,
        name: 'K. Nakamura',
        fullName: 'Kai Nakamura',
        role: 'SUPPORT_ADMIN',
        roleBadge: 'border-cyan-500/40 bg-cyan-950/40 text-cyan-300',
        title: 'Node & Validator Lead'
      }
    ];

    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-blue-950/80 border border-blue-500/50 flex items-center justify-center mx-auto shadow-2xl shadow-blue-500/20">
            <ShieldCheck className="w-8 h-8 text-blue-400" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950 border border-blue-600 text-blue-300 text-xs font-mono">
            <Lock className="w-3.5 h-3.5 text-blue-400" />
            <span>RESTRICTED PROTOCOL TERMINAL • PASSWORD-ONLY</span>
          </div>
          <h2 className="text-3xl font-bold text-white font-heading">
            Authorized Admin Protocol Access
          </h2>
          <p className="text-sm text-slate-400 max-w-lg mx-auto">
            Access to the TIXAPAY Admin Dashboard is restricted strictly to the 4 authorized protocol officers. Authentication requires your authorized account password.
          </p>
        </div>

        {/* Password-Only Login Box */}
        <div className="bg-[#0b1022] border border-blue-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-blue-950/50 backdrop-blur-xl">
          <form onSubmit={handleGateLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-mono text-slate-300 font-semibold mb-2 flex items-center justify-between">
                <span>1. Select Authorized Admin Account</span>
                <span className="text-[10px] text-cyan-400 font-mono">Exactly 4 Officers Recognized</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {adminProfiles.map(acc => {
                  const isSelected = gateSelectedAdminId === acc.id;
                  return (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => {
                        setGateSelectedAdminId(acc.id);
                        if (gateError) setGateError(null);
                      }}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-blue-950/90 border-blue-400 ring-2 ring-blue-500/30 shadow-lg shadow-blue-500/10'
                          : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-700/80 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <span className="font-bold text-sm text-white font-mono">{acc.name}</span>
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${acc.roleBadge}`}>
                          {acc.role}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 truncate">{acc.title}</div>
                      <div className="text-[10px] font-mono text-slate-500 truncate mt-0.5">{acc.fullName}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 font-semibold mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-blue-400" />
                  <span>2. Enter Authorized Password</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Zero Bypass Allowed</span>
              </label>

              <div className="relative">
                <input
                  type={gateShowPassword ? 'text' : 'password'}
                  required
                  value={gatePassword}
                  onChange={e => {
                    setGatePassword(e.target.value);
                    if (gateError) setGateError(null);
                  }}
                  placeholder="Enter authorized password for selected officer"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700/90 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm text-white font-mono placeholder:text-slate-600 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setGateShowPassword(!gateShowPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
                >
                  {gateShowPassword ? <Lock className="w-4 h-4 text-cyan-400" /> : <Key className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {gateError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-600/80 text-rose-200 text-xs font-mono flex items-center gap-2.5 animate-shake">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{gateError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={gateLoading || !gatePassword.trim()}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 hover:from-blue-400 hover:via-indigo-400 hover:to-cyan-400 text-white font-bold text-sm font-mono tracking-wide shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{gateLoading ? 'Verifying Authorized Credentials...' : 'Authenticate & Unlock Admin Dashboard'}</span>
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-slate-800/80 text-center text-[11px] text-slate-500 font-mono flex items-center justify-center gap-2">
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span>Strict Password Hashing Enforced • No Biometric / WebAuthn / OTP / Secret Key Required</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-16">
      
      {/* Admin Header with Genesis Mint Status */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-heading">
              TIXA Protocol Administration
            </h1>
            <span className="px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-mono font-bold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-cyan-400" />
              <span>SUPER ADMIN MINT AUTHORITY</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Officer: <span className="text-white font-semibold">{adminUser.name}</span> ({adminUser.email}) • Uncapped Protocol Minting (Zero Personal Balance Limit)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-cyan-500/30 text-xs font-mono">
            <span className="text-slate-400">Admin Balance Mode: </span>
            <span className="text-cyan-300 font-bold">∞ Uncapped Genesis Mint</span>
          </div>

          <button
            type="button"
            onClick={() => authEngine.logoutAdmin()}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-rose-500 text-rose-300 text-xs font-mono font-semibold transition-colors"
          >
            Logout Admin
          </button>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 font-mono text-xs">
        {[
          { id: 'admin_sessions', label: '🛡️ Active Admin Sessions', badge: 'Live IP' },
          { id: 'media_broadcast', label: '🖼️ Media, Banners & Targeted Broadcast', badge: 'Swiper 5+' },
          { id: 'native_market', label: '📊 TIXA Native Market & 33 Coins', badge: '33+' },
          { id: 'tixa_ai_monitor', label: '🤖 TIXA AI Live Chat & Support', badge: '33 Lang' },
          { id: 'payment_addresses', label: '💳 Payment Addresses & Gateways', badge: 'RBAC' },
          { id: 'direct_dispatch', label: '⚡ Unlimited Crypto Dispatch', badge: 'Genesis' },
          { id: 'protocol_rules', label: '📜 ২০টি মূল নিয়মাবলী (20 Rules)', badge: '20' },
          { id: 'auth_requests', label: '👥 User Auth & Registration', count: pendingAuthCount },
          { id: 'deposits', label: '💳 Deposit Queue (All Gateways)', count: pendingDepositCount },
          { id: 'withdrawals', label: '💸 Withdrawal Queue', count: pendingWithdrawCount },
          { id: 'settings', label: '⚙️ Ledger & Price Feeds' },
          { id: 'proposals', label: '🏛️ Multi-Sig Consensus' },
          { id: 'governance', label: '🔒 Security & Account Freeze' },
          { id: 'audit', label: '🛡️ Cryptographic Audit Chain' },
          { id: 'batch_control', label: '🎛️ Batch Control Panel', badge: 'Mass Action' },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold shadow-md shadow-cyan-500/20'
                : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-black text-[10px]">
                {tab.count}
              </span>
            )}
            {tab.badge && (
              <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 text-[10px] font-bold">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'admin_sessions' && (
        <AdminSessionMonitor />
      )}

      {/* ========================================================================= */}
      {/* 0. MEDIA, BANNERS & TARGETED BROADCAST MANAGEMENT HUB                     */}
      {/* ========================================================================= */}
      {activeTab === 'media_broadcast' && (
        <AdminBroadcastMediaManagement adminUser={adminUser} />
      )}

      {/* ========================================================================= */}
      {/* -2. TIXA NATIVE MARKET & 33 COINS ADMIN PANEL                            */}
      {/* ========================================================================= */}
      {activeTab === 'native_market' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#060d1d] border border-cyan-500/40 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white font-heading flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  <span>BTX (Native Base) & 33 Custom Assets Control Panel</span>
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  BTX Base Reference: $0.05 (Min: $0.03, Max: $0.09) | 1-Second Fluctuation | 33 Native Coins
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={async () => {
                    const active = nativeMarketEngine.isMarketActive();
                    await nativeMarketEngine.adminControl(active ? 'PAUSE_MARKET' : 'RESUME_MARKET');
                    refreshAll();
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                    nativeMarketEngine.isMarketActive() 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30' 
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                  }`}
                >
                  {nativeMarketEngine.isMarketActive() ? '⏸ Pause Market Engine' : '▶ Resume Market Engine'}
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    await nativeMarketEngine.adminControl('RESET_24H');
                    refreshAll();
                  }}
                  className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold hover:bg-cyan-500/30"
                >
                  🔄 Reset 24H Baseline
                </button>
              </div>
            </div>

            {/* Coins Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#060c1c]">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/70 text-slate-400">
                    <th className="py-3 px-4">Coin</th>
                    <th className="py-3 px-4 text-right">Starting / Ref</th>
                    <th className="py-3 px-4 text-right">Current Price</th>
                    <th className="py-3 px-4 text-right">24h Change</th>
                    <th className="py-3 px-4 text-right">High / Low</th>
                    <th className="py-3 px-4 text-center">Pulses</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {/* TIXA Coin */}
                  {(() => {
                    const tixa = nativeMarketEngine.getTixaCoin();
                    return (
                      <tr className="bg-cyan-950/20 font-bold">
                        <td className="py-3.5 px-4 text-white flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-cyan-500 text-black text-[10px]">BASE</span>
                          <span>{tixa.symbol} ({tixa.name})</span>
                        </td>
                        <td className="py-3.5 px-4 text-right text-slate-400">${tixa.startingPrice.toLocaleString()}</td>
                        <td className="py-3.5 px-4 text-right text-cyan-300">${tixa.currentPrice.toLocaleString()}</td>
                        <td className={`py-3.5 px-4 text-right ${tixa.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {tixa.change24h >= 0 ? '+' : ''}{tixa.change24h.toFixed(2)}%
                        </td>
                        <td className="py-3.5 px-4 text-right text-slate-400">${tixa.high24h.toLocaleString()} / ${tixa.low24h.toLocaleString()}</td>
                        <td className="py-3.5 px-4 text-center text-cyan-400">{tixa.pulseCount}</td>
                        <td className="py-3.5 px-4 text-center text-emerald-400">{tixa.status}</td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={async () => {
                              const newPriceStr = prompt(`Enter new starting/reference price for TIXA:`, String(tixa.startingPrice));
                              if (newPriceStr !== null && !isNaN(Number(newPriceStr))) {
                                await nativeMarketEngine.adminControl('UPDATE_STARTING_PRICE', { symbol: 'TIXA', startingPrice: Number(newPriceStr) });
                                refreshAll();
                              }
                            }}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px]"
                          >
                            Set Price
                          </button>
                        </td>
                      </tr>
                    );
                  })()}

                  {/* 33 Additional Native Coins */}
                  {Object.values(nativeMarketEngine.getCoins()).map(coin => (
                    <tr key={coin.symbol} className="hover:bg-slate-900/40">
                      <td className="py-3.5 px-4 text-white">
                        <span className="font-bold text-cyan-400">{coin.symbol}</span> - {coin.name}
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-400">${coin.startingPrice.toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-right text-white font-bold">${coin.currentPrice.toLocaleString()}</td>
                      <td className={`py-3.5 px-4 text-right font-bold ${coin.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-400">${coin.high24h.toLocaleString()} / ${coin.low24h.toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-center text-slate-400">{coin.pulseCount}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${coin.status === 'LIVE' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'}`}>
                          {coin.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center space-x-2">
                        <button
                          type="button"
                          onClick={async () => {
                            const newPriceStr = prompt(`Enter new starting price for ${coin.symbol}:`, String(coin.startingPrice));
                            if (newPriceStr !== null && !isNaN(Number(newPriceStr))) {
                              await nativeMarketEngine.adminControl('UPDATE_STARTING_PRICE', { symbol: coin.symbol, startingPrice: Number(newPriceStr) });
                              refreshAll();
                            }
                          }}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px]"
                        >
                          Price
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            const action = coin.status === 'LIVE' ? 'DISABLE_COIN' : 'ENABLE_COIN';
                            await nativeMarketEngine.adminControl(action, { symbol: coin.symbol });
                            refreshAll();
                          }}
                          className={`px-2 py-1 rounded text-[10px] ${coin.status === 'LIVE' ? 'bg-rose-950 text-rose-300 hover:bg-rose-900' : 'bg-emerald-950 text-emerald-300 hover:bg-emerald-900'}`}
                        >
                          {coin.status === 'LIVE' ? 'Disable' : 'Enable'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* -1. TIXA AI LIVE CHAT INTELLIGENCE & 33-LANGUAGE SUPPORT MONITOR          */}
      {/* ========================================================================= */}
      {activeTab === 'tixa_ai_monitor' && (
        <TixaAiAdminMonitor />
      )}

      {/* ========================================================================= */}
      {/* 0. PAYMENT ADDRESS & GATEWAY MANAGEMENT (RBAC SECURED)                    */}
      {/* ========================================================================= */}
      {activeTab === 'payment_addresses' && (
        <PaymentAddressManagement adminUser={adminUser} />
      )}

      {/* ========================================================================= */}
      {/* 1. DIRECT UNLIMITED CRYPTO DISPATCH TERMINAL                               */}
      {/* ========================================================================= */}
      {activeTab === 'direct_dispatch' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#060d1d] border border-cyan-500/40 shadow-xl space-y-5">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white font-heading flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  <span>Admin Unlimited Crypto Dispatch (0 Balance Required)</span>
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Send unlimited TIXA coins or TX-20 tokens directly to any User ID number. Each user has strictly ONE single unique address.
                </p>
              </div>

              <div className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs font-mono font-bold">
                ✓ 100% Free Zero-Fee Instant Delivery
              </div>
            </div>

            {dispatchError && (
              <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-mono flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{dispatchError}</span>
              </div>
            )}

            {dispatchSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs font-mono flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{dispatchSuccess}</span>
              </div>
            )}

            <form onSubmit={handleDispatchCrypto} className="space-y-4 font-mono text-xs">
              
              {/* Target User Selector / Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-semibold">
                    Target User ID / Email / Single Address <span className="text-cyan-400">*</span>:
                  </label>
                  <span className="text-[11px] text-slate-500">
                    {allUsers.length} Registered User(s) Available
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Enter User ID (e.g. usr_demo_chen_2050) or Email (alex.chen@tixa.network)"
                    value={targetUserIdentifier}
                    onChange={e => setTargetUserIdentifier(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono focus:border-cyan-500 text-xs"
                  />

                  <select
                    onChange={e => {
                      if (e.target.value) setTargetUserIdentifier(e.target.value);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono focus:border-cyan-500 text-xs"
                  >
                    <option value="">-- Or Quick Select Registered User --</option>
                    {allUsers.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.email} (ID: {u.id}) • {u.countryName || 'Global'} ({u.currency || 'BDT'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Amount & Asset Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">
                    Asset Type:
                  </label>
                  <select
                    value={dispatchAsset}
                    onChange={e => setDispatchAsset(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono focus:border-cyan-500"
                  >
                    <option value="TIXA">TIXA (Benchmark: $990,000 USDT)</option>
                    <option value="USDT">USDT (Tether USD)</option>
                    <option value="USDC">USDC (USD Coin)</option>
                    <option value="NISI">NISI (Nisi Token)</option>
                    <option value="SARA">SARA (Sara Crypto)</option>
                    <option value="MUN">MUN (Mun Coin)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-300 mb-1 font-semibold">
                    Unlimited Dispatch Amount ({dispatchAsset}):
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="e.g. 50000"
                      value={dispatchAmount}
                      onChange={e => setDispatchAmount(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono focus:border-cyan-500 text-sm font-bold"
                    />
                    <div className="absolute right-2 top-1.5 flex items-center gap-1">
                      {['100', '1000', '50000', '1000000'].map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setDispatchAmount(val)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] font-bold"
                        >
                          +{Number(val).toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Memo */}
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">
                  Protocol Allocation Note / Memo:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Genesis Protocol Grant / Liquidity Provision"
                  value={dispatchMemo}
                  onChange={e => setDispatchMemo(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono focus:border-cyan-500 text-xs"
                />
              </div>

              {/* Dispatch Action Button */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="submit"
                  disabled={isDispatching}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:from-cyan-300 hover:to-blue-400 text-black font-bold text-xs font-mono transition-all shadow-lg shadow-cyan-500/25 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isDispatching ? 'Minting & Dispatching...' : 'Dispatch Unlimited Crypto to User Address'}</span>
                </button>
              </div>

            </form>

          </div>

          {/* Registered Users Table */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>Registered User Accounts & Single Bech32 Addresses</span>
            </h4>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#060c1c]">
              {allUsers.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <p className="text-sm text-slate-400 font-mono">No users currently registered. All demo and test accounts have been wiped.</p>
                  <p className="text-xs text-slate-500 font-mono">New users will appear here automatically when they sign up with verified Dual-OTP.</p>
                </div>
              ) : (
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/70 text-slate-400">
                      <th className="py-3 px-4">User ID</th>
                      <th className="py-3 px-4">User / Email</th>
                      <th className="py-3 px-4">Country & Phone</th>
                      <th className="py-3 px-4">Single Wallet Address (tx1...)</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {allUsers.map(u => (
                      <tr key={u.id} className="hover:bg-slate-900/40">
                        <td className="py-3 px-4 font-bold text-cyan-300">{u.id}</td>
                        <td className="py-3 px-4">{u.email}</td>
                        <td className="py-3 px-4">
                          {u.countryName || 'Bangladesh'} • {u.phone || 'N/A'} ({u.currency || 'BDT'})
                        </td>
                        <td className="py-3 px-4 text-slate-400 truncate max-w-xs">
                          {u.walletAddress}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setTargetUserIdentifier(u.id);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="px-2.5 py-1 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 text-[11px] font-bold"
                          >
                            Send Crypto
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ২০ টি মূল প্রশাসনিক প্রোটোকল বাক্য (20 ADMIN PROTOCOL RULES)             */}
      {/* ========================================================================= */}
      {activeTab === 'protocol_rules' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#060d1d] border border-cyan-500/40 shadow-xl space-y-4">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white font-heading flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-cyan-400" />
                  <span>TIXAPAY অ্যাডমিন প্রোটোকল: ২০টি মূল প্রশাসনিক নিয়মাবলী</span>
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Official 20 Immutable Governance Directives for TIXAPAY Admin Functionality & Ecosystem Operations
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="নিয়ম খুঁজুন / Search rules..."
                  value={rulesSearch}
                  onChange={e => setRulesSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 font-mono focus:border-cyan-500"
                />
              </div>
            </div>

            {/* 20 Rules Interactive Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredRules.map(rule => (
                <div
                  key={rule.id}
                  className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-mono font-bold">
                      ধারা / RULE #{rule.id.toString().padStart(2, '0')}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>সক্রিয় নিয়ম (ACTIVE)</span>
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-white leading-relaxed">
                    {rule.bn}
                  </p>

                  <p className="text-xs text-slate-400 italic font-sans border-t border-slate-800/80 pt-1.5">
                    "{rule.en}"
                  </p>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. USER AUTH & REGISTRATIONS TAB                                          */}
      {/* ========================================================================= */}
      {activeTab === 'auth_requests' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white font-mono">
              User Registration & Authentication Review Queue ({authRequests.length})
            </h3>
            <div className="flex items-center gap-2 font-mono text-xs">
              {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(st => (
                <button
                  key={st}
                  onClick={() => setAuthFilterStatus(st)}
                  className={`px-3 py-1 rounded-lg border ${
                    authFilterStatus === st ? 'bg-cyan-950 border-cyan-400 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#060c1c]">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/70 text-slate-400">
                  <th className="py-3 px-4">User ID & Email</th>
                  <th className="py-3 px-4">Country & Phone</th>
                  <th className="py-3 px-4">Single Wallet Address</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredAuth.map(req => (
                  <tr key={req.id} className="hover:bg-slate-900/40">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{req.email}</div>
                      <div className="text-[10px] text-slate-500">ID: {req.userId}</div>
                    </td>
                    <td className="py-3 px-4">
                      {req.countryCode || 'BD'} • {req.phone || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-slate-400 truncate max-w-xs font-mono text-[11px]">
                      {req.walletAddress}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        req.status === 'APPROVED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                        req.status === 'PENDING' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                        'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {req.status === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleApproveAuth(req.id)}
                            className="px-2.5 py-1 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700 text-[11px]"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRejectAuth(req.id)}
                            className="px-2.5 py-1 rounded bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-700 text-[11px]"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500">Reviewed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. DEPOSITS QUEUE (ALL GATEWAYS × TIXA)                                   */}
      {/* ========================================================================= */}
      {activeTab === 'deposits' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white font-mono">
              Deposit Verification & Token Credit Queue ({deposits.length})
            </h3>
            <div className="flex items-center gap-2 font-mono text-xs">
              {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(st => (
                <button
                  key={st}
                  onClick={() => setDepositFilterStatus(st)}
                  className={`px-3 py-1 rounded-lg border ${
                    depositFilterStatus === st ? 'bg-cyan-950 border-cyan-400 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#060c1c]">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/70 text-slate-400">
                  <th className="py-3 px-4">User ID & Target Address</th>
                  <th className="py-3 px-4">Gateway & Logo</th>
                  <th className="py-3 px-4">Deposit Amount</th>
                  <th className="py-3 px-4">TxHash / TrxID Proof</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredDeposits.map(d => (
                  <tr key={d.id} className="hover:bg-slate-900/40">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{d.userEmail}</div>
                      <div className="text-[10px] text-cyan-400">{d.walletAddress.slice(0, 14)}...</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <PaymentLogoIcon type={d.method.toLowerCase()} className="w-5 h-5 shrink-0" />
                        <span className="font-bold text-slate-200">{d.method} × TIXA</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-emerald-400">+{d.amount} {d.currency || 'TIXA'}</div>
                      <div className="text-[10px] text-slate-500">
                        ${d.usdEquivalent?.toLocaleString()} USD
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-cyan-300">
                      {d.txHashOrReference}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        d.status === 'APPROVED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                        d.status === 'PENDING' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                        'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {d.status === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleApproveDeposit(d.id)}
                            className="px-2.5 py-1 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700 text-[11px] font-bold"
                          >
                            Approve & Credit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRejectDeposit(d.id)}
                            className="px-2.5 py-1 rounded bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-700 text-[11px]"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500">Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. WITHDRAWALS QUEUE                                                      */}
      {/* ========================================================================= */}
      {activeTab === 'withdrawals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white font-mono">
              Withdrawal & Cash Out Dispatch Queue ({withdrawals.length})
            </h3>
            <div className="flex items-center gap-2 font-mono text-xs">
              {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(st => (
                <button
                  key={st}
                  onClick={() => setWithdrawFilterStatus(st)}
                  className={`px-3 py-1 rounded-lg border ${
                    withdrawFilterStatus === st ? 'bg-cyan-950 border-cyan-400 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#060c1c]">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/70 text-slate-400">
                  <th className="py-3 px-4">User & Single Wallet</th>
                  <th className="py-3 px-4">Destination Method</th>
                  <th className="py-3 px-4">Gross & Net Amount</th>
                  <th className="py-3 px-4">Recipient Account/Address</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredWithdrawals.map(w => (
                  <tr key={w.id} className="hover:bg-slate-900/40">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{w.userEmail}</div>
                      <div className="text-[10px] text-slate-500">{w.walletAddress.slice(0, 12)}...</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <PaymentLogoIcon type={w.destinationMethod.toLowerCase()} className="w-5 h-5" />
                        <span className="font-bold text-slate-200">{w.destinationMethod} × TIXA</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-rose-400">-{w.amount} {w.asset}</div>
                      <div className="text-[10px] text-slate-400">
                        Net: {w.localCurrencyAmount?.toLocaleString()} {w.localCurrency || 'BDT'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-mono">
                      {w.destinationAddressOrAccount}
                      {w.accountHolderName && <span className="block text-[10px] text-slate-500">({w.accountHolderName})</span>}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        w.status === 'APPROVED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                        w.status === 'PENDING' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                        'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}>
                        {w.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {w.status === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleApproveWithdrawal(w.id)}
                            className="px-2.5 py-1 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700 text-[11px] font-bold"
                          >
                            Approve & Dispatch
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRejectWithdrawal(w.id)}
                            className="px-2.5 py-1 rounded bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-700 text-[11px]"
                          >
                            Reject & Refund
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500">Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. SETTINGS & PRICING TAB                                                 */}
      {/* ========================================================================= */}
      {activeTab === 'settings' && (
        <div className="p-6 rounded-2xl bg-[#060d1d] border border-slate-800 space-y-5">
          <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
            <Settings className="w-4 h-4 text-cyan-400" />
            <span>TIXAPAY Valuation & Gateway Settlement Calibration</span>
          </h3>

          {settingsSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-500 text-emerald-300 text-xs font-mono">
              {settingsSuccess}
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-4 font-mono text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">
                  TIXA Base Price (USDT):
                </label>
                <input
                  type="number"
                  step="any"
                  value={editPrice}
                  onChange={e => setEditPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">
                  bKash Merchant Number:
                </label>
                <input
                  type="text"
                  value={editBkash}
                  onChange={e => setEditBkash(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">
                  Nagad Corporate Merchant:
                </label>
                <input
                  type="text"
                  value={editNagad}
                  onChange={e => setEditNagad(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">
                  DBBL Rocket Merchant:
                </label>
                <input
                  type="text"
                  value={editRocket}
                  onChange={e => setEditRocket(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">
                  Binance Pay Merchant ID:
                </label>
                <input
                  type="text"
                  value={editBinancePay}
                  onChange={e => setEditBinancePay(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">
                  TRC20 / EVM Deposit Vault Address:
                </label>
                <input
                  type="text"
                  value={editCryptoDepositAddr}
                  onChange={e => setEditCryptoDepositAddr(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs font-mono shadow-md"
              >
                Save System Calibration
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. MULTI-SIG PROPOSALS TAB                                                */}
      {/* ========================================================================= */}
      {activeTab === 'proposals' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#060d1d] border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
              <Vote className="w-5 h-5 text-cyan-400" />
              <span>Multi-Signature Administrative Consensus (2 of 4 Required)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {proposals.map(p => (
                <div key={p.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-mono">
                      {p.actionType}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      p.status === 'EXECUTED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                      p.status === 'APPROVED' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                      'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}>
                      {p.status}
                    </span>
                  </div>

                  <p className="text-xs text-white font-mono font-semibold">{p.description}</p>

                  <div className="text-[11px] text-slate-400 font-mono space-y-1">
                    <div>Proposer: {p.proposedBy} ({p.proposerRole})</div>
                    <div>Signatures: {p.currentApprovals.length} / {p.requiredApprovals}</div>
                  </div>

                  {p.status === 'PENDING' && (
                    <button
                      type="button"
                      onClick={() => handleSignProposal(p.id)}
                      className="w-full py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs font-mono"
                    >
                      Sign Multi-Sig Proposal
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. GOVERNANCE & ACCOUNT FREEZING TAB                                      */}
      {/* ========================================================================= */}
      {activeTab === 'governance' && (
        <div className="p-6 rounded-2xl bg-[#060d1d] border border-slate-800 space-y-5">
          <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
            <Lock className="w-4 h-4 text-rose-400" />
            <span>Account Security & Outflow Freezing Control</span>
          </h3>

          {freezeMsg && (
            <div className="p-3 rounded-xl bg-slate-900 border border-cyan-500 text-cyan-300 text-xs font-mono">
              {freezeMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Target User ID or Single Address:</label>
              <input
                type="text"
                placeholder="usr_... or tx1..."
                value={targetAddress}
                onChange={e => setTargetAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-semibold">Governance Reason:</label>
              <input
                type="text"
                placeholder="e.g. Compliance Violation / Suspicious Activity"
                value={freezeReason}
                onChange={e => setFreezeReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              disabled={freezeActionLoading}
              onClick={() => handleFreezeAddress(true)}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs font-mono shadow-md"
            >
              Freeze Account
            </button>
            <button
              type="button"
              disabled={freezeActionLoading}
              onClick={() => handleFreezeAddress(false)}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs font-mono shadow-md"
            >
              Unfreeze Account
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. CRYPTOGRAPHIC AUDIT LOG TAB                                            */}
      {/* ========================================================================= */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white font-mono">
              Immutable Cryptographic Audit Trail ({auditLogs.length} Events)
            </h3>
            <button
              type="button"
              disabled={verifyingChain}
              onClick={handleVerifyChain}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs font-mono flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${verifyingChain ? 'animate-spin' : ''}`} />
              <span>Verify SHA-256 Chain</span>
            </button>
          </div>

          {chainValid !== null && (
            <div className={`p-3 rounded-xl border text-xs font-mono ${
              chainValid ? 'bg-emerald-950 border-emerald-500 text-emerald-300' : 'bg-rose-950 border-rose-500 text-rose-300'
            }`}>
              {chainValid ? '✓ SHA-256 Merkle Chain Integrity Confirmed: All block hashes and audit records match.' : '⚠️ Hash chain integrity verification mismatch detected.'}
            </div>
          )}

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#060c1c]">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/70 text-slate-400">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor & Role</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Audit Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {auditLogs.slice(0, 30).map(log => (
                  <tr key={log.id} className="hover:bg-slate-900/40">
                    <td className="py-3 px-4 text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</td>
                    <td className="py-3 px-4">{log.actorEmail} ({log.actorRole})</td>
                    <td className="py-3 px-4 font-bold text-white">{log.action}</td>
                    <td className="py-3 px-4">
                      <HashBadge hash={log.hash || log.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 10. BATCH CONTROL PANEL TAB                                               */}
      {/* ========================================================================= */}
      {activeTab === 'batch_control' && (
        <div className="p-6 rounded-2xl bg-[#060d1d] border border-cyan-500/40 space-y-6 shadow-xl font-mono">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-cyan-400" />
                <span>Mass Action & Batch Control Panel</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Execute batch actions (Pause Wallet Access, Broadcast Security Notice, Grant Bonus Airdrop) across targeted user groups.
              </p>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-bold">
              Total Users in DB: {allUsers.length}
            </div>
          </div>

          {batchResultMsg && (
            <div className="p-3.5 rounded-xl bg-slate-900 border border-cyan-500 text-cyan-300 text-xs shadow-inner">
              {batchResultMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Target Group Selector */}
            <div className="space-y-3 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <label className="block text-xs font-semibold text-slate-300">1. Select Target User Activity Group:</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'active', label: '🟢 Active Users', count: allUsers.filter(u => u.status === 'active' || !u.status).length },
                  { id: 'suspended', label: '🔴 Suspended Users', count: allUsers.filter(u => u.status === 'suspended').length },
                  { id: 'verified', label: '🛡️ Verified Users', count: allUsers.filter(u => u.emailVerified || u.phone).length },
                  { id: 'all', label: '🌐 All Registered Users', count: allUsers.length },
                ].map(group => (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => setBatchTargetGroup(group.id as any)}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      batchTargetGroup === group.id
                        ? 'border-cyan-500 bg-cyan-950/40 text-white font-bold shadow-md'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span>{group.label}</span>
                    <span className="text-[10px] text-cyan-400 mt-1">{group.count} user(s) matched</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mass Action Selector */}
            <div className="space-y-3 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <label className="block text-xs font-semibold text-slate-300">2. Select Mass Action Type:</label>
              <select
                value={batchActionType}
                onChange={e => setBatchActionType(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono"
              >
                <option value="BROADCAST_NOTICE">📢 Broadcast Security Notice / Protocol Notice</option>
                <option value="PAUSE_WALLET">🔒 Pause Wallet Access (Suspend Selected)</option>
                <option value="UNPAUSE_WALLET">🔓 Unpause Wallet Access (Restore Selected)</option>
                <option value="GRANT_BONUS">🎁 Grant Bonus Airdrop Tokens (100 TIXA)</option>
              </select>

              {batchActionType === 'BROADCAST_NOTICE' && (
                <div className="space-y-1.5 pt-2">
                  <label className="block text-[11px] text-slate-400">Notice Message Content:</label>
                  <textarea
                    rows={2}
                    value={batchMessage}
                    onChange={e => setBatchMessage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                    placeholder="Enter security notice..."
                  />
                </div>
              )}

              {batchActionType === 'GRANT_BONUS' && (
                <div className="space-y-1.5 pt-2">
                  <label className="block text-[11px] text-slate-400">Bonus Amount (TIXA / USD):</label>
                  <input
                    type="number"
                    value={batchBonusAmount}
                    onChange={e => setBatchBonusAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                  />
                </div>
              )}

              <button
                type="button"
                disabled={batchExecuting}
                onClick={handleExecuteBatchAction}
                className="w-full mt-3 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
              >
                {batchExecuting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>Execute Batch Action Now</span>
              </button>
            </div>
          </div>

          {/* Batch Logs History */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>📋 Batch Execution Audit Logs</span>
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {batchLogs.map(log => (
                <div key={log.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-bold">{log.action}</span>
                    <span className="text-slate-300">Target Group: <strong className="text-white">{log.targetGroup}</strong></span>
                    <span className="text-slate-400">Affected: <strong className="text-emerald-400">{log.affectedCount} user(s)</strong></span>
                  </div>
                  <div className="text-right text-[11px] text-slate-400">
                    <div>{new Date(log.timestamp).toLocaleTimeString()}</div>
                    <div className="text-slate-500 font-mono">Admin: {log.adminName}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
