import { 
  DepositRequest, 
  WithdrawalRequest, 
  LedgerEntry, 
  AdminNotification, 
  SystemSettings, 
  DepositMethod, 
  CryptoNetwork 
} from '../types/ledger';
import { blockchainEngine } from './blockchainEngine';
import { auditEngine } from './auditEngine';
import { COUNTRIES, getCountryByCode } from '../data/countries';

const STORAGE_DEPOSITS_KEY = 'tixa_deposit_requests_v1';
const STORAGE_WITHDRAWALS_KEY = 'tixa_withdrawal_requests_v1';
const STORAGE_LEDGER_KEY = 'tixa_unified_ledger_v1';
const STORAGE_NOTIFICATIONS_KEY = 'tixa_admin_notifications_v1';
const STORAGE_SETTINGS_KEY = 'tixa_system_settings_v1';

const DEFAULT_SETTINGS: SystemSettings = {
  tixaBasePriceUsdt: 990000.00,
  tixaPriceVolatilityPerSec: 10000.00,
  enablePricePulse: true,
  minDepositUsd: 10.00,
  minWithdrawUsd: 25.00,
  cryptoWithdrawFeePercent: 0.25, // 0.25%
  localWithdrawFeePercent: 1.00, // 1%
  autoApproveRegistrations: false,
  merchantAccounts: {
    binancePayId: '',
    binanceMerchantName: '',
    mexcPayUid: '',
    bkashMerchantNumber: '',
    bkashType: 'Merchant',
    rocketMerchantNumber: '',
    nagadMerchantNumber: '',
    bankAccountName: '',
    bankName: '',
    bankAccountNumber: '',
    bankSwiftRouting: '',
    cryptoDepositAddresses: {
      TIXA_2050_NATIVE: '',
      TRC20: '',
      ERC20: '',
      BEP20: '',
      POLYGON: '',
      SOLANA: '',
      BITCOIN_LIGHTNING: ''
    }
  },
  customExchangeRates: {
    BDT: 121.50,
    USD: 1.00,
    GBP: 0.79,
    EUR: 0.92,
    AED: 3.67,
    INR: 86.80,
    PKR: 278.50,
    SAR: 3.75,
    QAR: 3.64,
    MYR: 4.45,
    IDR: 15900.00,
    NGN: 1520.00,
    JPY: 155.20,
    CAD: 1.38,
    AUD: 1.54,
    SGD: 1.34,
    NISI: 1 / 64280.50,
    SARA: 1 / 3485.20,
    MUN: 1 / 154.60
  }
};

export class LedgerEngine {
  private static instance: LedgerEngine;

  private deposits: DepositRequest[] = [];
  private withdrawals: WithdrawalRequest[] = [];
  private ledger: LedgerEntry[] = [];
  private notifications: AdminNotification[] = [];
  private settings: SystemSettings = DEFAULT_SETTINGS;
  private listeners: Array<() => void> = [];

  private constructor() {
    this.loadStorage();
  }

  public static getInstance(): LedgerEngine {
    if (!LedgerEngine.instance) {
      LedgerEngine.instance = new LedgerEngine();
    }
    return LedgerEngine.instance;
  }

  public subscribe(callback: () => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notify(): void {
    this.listeners.forEach(cb => {
      try { cb(); } catch (err) { console.error('LedgerEngine listener error', err); }
    });
  }

  private loadStorage(): void {
    try {
      const storedDeposits = localStorage.getItem(STORAGE_DEPOSITS_KEY);
      const storedWithdrawals = localStorage.getItem(STORAGE_WITHDRAWALS_KEY);
      const storedLedger = localStorage.getItem(STORAGE_LEDGER_KEY);
      const storedNotifications = localStorage.getItem(STORAGE_NOTIFICATIONS_KEY);
      const storedSettings = localStorage.getItem(STORAGE_SETTINGS_KEY);

      if (storedDeposits) {
        const parsed = JSON.parse(storedDeposits);
        this.deposits = (parsed as DepositRequest[]).filter(d => !d.userId?.includes('chen') && !d.userEmail?.includes('alex.chen'));
      }
      if (storedWithdrawals) {
        const parsed = JSON.parse(storedWithdrawals);
        this.withdrawals = (parsed as WithdrawalRequest[]).filter(w => !w.userId?.includes('chen') && !w.userEmail?.includes('alex.chen'));
      }
      if (storedLedger) {
        const parsed = JSON.parse(storedLedger);
        this.ledger = (parsed as LedgerEntry[]).filter(l => !l.userId?.includes('chen'));
      }
      if (storedNotifications) {
        const parsed = JSON.parse(storedNotifications);
        this.notifications = (parsed as AdminNotification[]).filter(n => !n.userEmail?.includes('alex.chen'));
      }
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        this.settings = {
          ...DEFAULT_SETTINGS,
          ...parsedSettings,
          merchantAccounts: DEFAULT_SETTINGS.merchantAccounts // Reset all addresses
        };
      }
    } catch {
      this.deposits = [];
      this.withdrawals = [];
      this.ledger = [];
      this.notifications = [];
      this.settings = DEFAULT_SETTINGS;
    }
    this.saveAll();
  }

  public wipeAllLedgerData(): void {
    this.deposits = [];
    this.withdrawals = [];
    this.ledger = [];
    this.notifications = [];
    this.settings.merchantAccounts = DEFAULT_SETTINGS.merchantAccounts;
    localStorage.removeItem(STORAGE_DEPOSITS_KEY);
    localStorage.removeItem(STORAGE_WITHDRAWALS_KEY);
    localStorage.removeItem(STORAGE_LEDGER_KEY);
    localStorage.removeItem(STORAGE_NOTIFICATIONS_KEY);
    localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(this.settings));
    this.notify();
  }

  // --- 1. CRYPTO & LOCAL DEPOSIT REQUESTS ---

  public async submitCryptoDeposit(params: {
    userId: string;
    userEmail: string;
    walletAddress: string;
    asset: string;
    network: CryptoNetwork;
    amount: number;
    usdValue: number;
    txHash: string;
    localCurrency: string;
    localCurrencyAmount: number;
  }): Promise<DepositRequest> {
    const newReq: DepositRequest = {
      id: `dep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: params.userId,
      userEmail: params.userEmail,
      walletAddress: params.walletAddress,
      asset: params.asset,
      network: params.network,
      amount: params.amount,
      usdValue: params.usdValue,
      localCurrency: params.localCurrency,
      localCurrencyAmount: params.localCurrencyAmount,
      method: 'CRYPTO_ONCHAIN',
      txHashOrReference: params.txHash.trim(),
      depositAddressUsed: this.settings.merchantAccounts.cryptoDepositAddresses[params.network] || 'tx1tixadepositvaulttreasury2050master001',
      status: 'PENDING',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.deposits.unshift(newReq);

    // Create Notification for Admin
    this.createNotification({
      type: 'CRYPTO_DEPOSIT',
      title: `New On-Chain ${params.asset} Deposit`,
      message: `${params.userEmail} submitted a ${params.amount} ${params.asset} (${params.network}) deposit. TXID: ${params.txHash.slice(0, 16)}...`,
      severity: 'INFO',
      referenceId: newReq.id,
      userId: params.userId,
      userEmail: params.userEmail,
      amount: params.amount,
      asset: params.asset
    });

    // Create a pending ledger entry
    const currentBal = blockchainEngine.getAccount(params.walletAddress)?.balance || 0;
    this.recordLedgerEntry({
      userId: params.userId,
      walletAddress: params.walletAddress,
      type: 'CRYPTO_DEPOSIT',
      asset: params.asset,
      amount: params.amount,
      fee: 0,
      balanceBefore: currentBal,
      balanceAfter: currentBal, // unchanged until approved
      status: 'PENDING',
      referenceId: newReq.id,
      description: `Pending ${params.network} On-Chain Deposit: ${params.amount} ${params.asset}`,
      counterparty: newReq.depositAddressUsed,
      localCurrencyAmount: params.localCurrencyAmount,
      localCurrencyCode: params.localCurrency
    });

    this.saveAll();
    this.notify();

    await auditEngine.logEvent({
      actorId: params.userId,
      actorEmail: params.userEmail,
      actorRole: 'USER',
      action: 'CRYPTO_DEPOSIT_SUBMITTED',
      targetId: newReq.id,
      details: { asset: params.asset, network: params.network, amount: params.amount, txHash: params.txHash }
    });

    return newReq;
  }

  public async submitLocalPaymentDeposit(params: {
    userId: string;
    userEmail: string;
    walletAddress: string;
    asset: string;
    amount: number;
    usdValue: number;
    method: DepositMethod;
    localCurrency: string;
    localCurrencyAmount: number;
    senderAccountOrPhone: string;
    txHashOrReference: string;
    mfsTransferType?: 'PAYMENT' | 'SEND_MONEY' | 'CASH_OUT';
    depositAddressUsed?: string;
  }): Promise<DepositRequest> {
    let merchantAddr = params.depositAddressUsed || '';
    if (!merchantAddr) {
      if (params.method === 'BKASH') merchantAddr = `${this.settings.merchantAccounts.bkashMerchantNumber} (bKash ${this.settings.merchantAccounts.bkashType})`;
      else if (params.method === 'ROCKET') merchantAddr = `${this.settings.merchantAccounts.rocketMerchantNumber} (Rocket)`;
      else if (params.method === 'NAGAD') merchantAddr = `${this.settings.merchantAccounts.nagadMerchantNumber} (Nagad)`;
      else if (params.method === 'BINANCE_PAY') merchantAddr = `Binance Pay ID: ${this.settings.merchantAccounts.binancePayId} (${this.settings.merchantAccounts.binanceMerchantName})`;
      else if (params.method === 'MEXC_PAY') merchantAddr = `MEXC UID: ${this.settings.merchantAccounts.mexcPayUid}`;
      else merchantAddr = `${this.settings.merchantAccounts.bankName} Acc: ${this.settings.merchantAccounts.bankAccountNumber}`;
    }

    const newReq: DepositRequest = {
      id: `dep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: params.userId,
      userEmail: params.userEmail,
      walletAddress: params.walletAddress,
      asset: params.asset,
      amount: params.amount,
      usdValue: params.usdValue,
      localCurrency: params.localCurrency,
      localCurrencyAmount: params.localCurrencyAmount,
      method: params.method,
      mfsTransferType: params.mfsTransferType,
      senderAccountOrPhone: params.senderAccountOrPhone.trim(),
      txHashOrReference: params.txHashOrReference.trim(),
      depositAddressUsed: merchantAddr,
      status: 'PENDING',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.deposits.unshift(newReq);

    // Create Admin Notification
    this.createNotification({
      type: 'LOCAL_PAYMENT_DEPOSIT',
      title: `New ${params.method} ${params.mfsTransferType ? `(${params.mfsTransferType})` : ''} Deposit`,
      message: `${params.userEmail} submitted a ${params.method} ${params.mfsTransferType || ''} deposit of ${params.localCurrency} ${params.localCurrencyAmount.toLocaleString()} (${params.amount} ${params.asset}). Ref: ${params.txHashOrReference}`,
      severity: 'WARNING',
      referenceId: newReq.id,
      userId: params.userId,
      userEmail: params.userEmail,
      amount: params.amount,
      asset: params.asset
    });

    // Create pending ledger entry
    const currentBal = blockchainEngine.getAccount(params.walletAddress)?.balance || 0;
    this.recordLedgerEntry({
      userId: params.userId,
      walletAddress: params.walletAddress,
      type: 'LOCAL_GATEWAY_DEPOSIT',
      asset: params.asset,
      amount: params.amount,
      fee: 0,
      balanceBefore: currentBal,
      balanceAfter: currentBal,
      status: 'PENDING',
      referenceId: newReq.id,
      description: `Pending ${params.method} ${params.mfsTransferType ? `(${params.mfsTransferType})` : ''} Payment: ${params.localCurrency} ${params.localCurrencyAmount.toLocaleString()} -> ${params.amount} ${params.asset}`,
      counterparty: merchantAddr,
      localCurrencyAmount: params.localCurrencyAmount,
      localCurrencyCode: params.localCurrency
    });

    this.saveAll();
    this.notify();

    await auditEngine.logEvent({
      actorId: params.userId,
      actorEmail: params.userEmail,
      actorRole: 'USER',
      action: 'LOCAL_PAYMENT_DEPOSIT_SUBMITTED',
      targetId: newReq.id,
      details: { method: params.method, mfsTransferType: params.mfsTransferType, localAmount: params.localCurrencyAmount, ref: params.txHashOrReference }
    });

    return newReq;
  }

  public async submitDeposit(params: {
    userId: string;
    userEmail: string;
    walletAddress: string;
    amount: number;
    currency?: string;
    method: DepositMethod;
    network?: CryptoNetwork;
    txHashOrReference: string;
    senderAccountOrPhone?: string;
    usdEquivalent?: number;
    localCurrency?: string;
    localAmount?: number;
    mfsTransferType?: 'PAYMENT' | 'SEND_MONEY' | 'CASH_OUT';
    depositAddressUsed?: string;
  }): Promise<DepositRequest> {
    const isCrypto = params.method === 'CRYPTO_ONCHAIN' || (params.network !== undefined && params.network !== null && params.network !== 'BANGLADESH_MFS' as any);
    if (isCrypto) {
      return this.submitCryptoDeposit({
        userId: params.userId,
        userEmail: params.userEmail,
        walletAddress: params.walletAddress,
        asset: params.currency || 'TIXA',
        network: params.network || 'TRC20',
        amount: params.amount,
        usdValue: params.usdEquivalent || (params.amount * this.settings.tixaBasePriceUsdt),
        txHash: params.txHashOrReference,
        localCurrency: params.localCurrency || 'BDT',
        localCurrencyAmount: params.localAmount || 0
      });
    } else {
      return this.submitLocalPaymentDeposit({
        userId: params.userId,
        userEmail: params.userEmail,
        walletAddress: params.walletAddress,
        asset: 'TIXA',
        amount: params.amount,
        usdValue: params.usdEquivalent || (params.amount * this.settings.tixaBasePriceUsdt),
        method: params.method,
        localCurrency: params.localCurrency || 'BDT',
        localCurrencyAmount: params.localAmount || 0,
        senderAccountOrPhone: params.senderAccountOrPhone || '',
        txHashOrReference: params.txHashOrReference,
        mfsTransferType: params.mfsTransferType,
        depositAddressUsed: params.depositAddressUsed
      });
    }
  }

  public async approveDeposit(depositId: string, adminId?: string, note?: string): Promise<DepositRequest> {
    return this.approveDepositRequest(depositId, adminId || 'admin_fin_01', note);
  }

  public async rejectDeposit(depositId: string, reason?: string, adminId?: string): Promise<DepositRequest> {
    return this.rejectDepositRequest(depositId, adminId || 'admin_fin_01', reason || 'Unverified payment proof');
  }

  public async approveWithdrawal(withdrawalId: string, adminId?: string, payoutTxHash?: string, note?: string): Promise<WithdrawalRequest> {
    return this.approveWithdrawalRequest(withdrawalId, adminId || 'admin_fin_01', payoutTxHash, note);
  }

  public async rejectWithdrawal(withdrawalId: string, reason?: string, adminId?: string): Promise<WithdrawalRequest> {
    return this.rejectWithdrawalRequest(withdrawalId, adminId || 'admin_fin_01', reason || 'Compliance validation failed');
  }

  // Admin approves deposit -> safely credits user balance & ledger
  public async approveDepositRequest(requestId: string, adminId: string, note?: string): Promise<DepositRequest> {
    const req = this.deposits.find(d => d.id === requestId);
    if (!req) throw new Error('Deposit request not found.');
    if (req.status !== 'PENDING') throw new Error(`Deposit request already ${req.status}.`);

    const acc = blockchainEngine.getOrCreateAccount(req.walletAddress);
    const balBefore = acc.balance;

    // Credit user balance in blockchain engine
    if (req.asset === 'TIXA') {
      blockchainEngine.creditBalance(req.walletAddress, req.amount);
    } else {
      if (!acc.tokens) acc.tokens = {};
      acc.tokens[req.asset] = (acc.tokens[req.asset] || 0) + req.amount;
      acc.lastUpdated = Date.now();
    }

    const balAfter = req.asset === 'TIXA' ? acc.balance : (acc.tokens[req.asset] || 0);

    req.status = 'APPROVED';
    req.adminNote = note || 'Verified & Credited by Admin';
    req.processedByAdminId = adminId;
    req.updatedAt = Date.now();

    // Update existing pending ledger entry or create completed ledger entry
    const ledgerEntry = this.ledger.find(l => l.referenceId === req.id && l.status === 'PENDING');
    if (ledgerEntry) {
      ledgerEntry.status = 'COMPLETED';
      ledgerEntry.balanceBefore = balBefore;
      ledgerEntry.balanceAfter = balAfter;
      ledgerEntry.timestamp = Date.now();
      ledgerEntry.description = `${req.method === 'CRYPTO_ONCHAIN' ? req.network : req.method} Deposit Verified: +${req.amount} ${req.asset}`;
    } else {
      this.recordLedgerEntry({
        userId: req.userId,
        walletAddress: req.walletAddress,
        type: req.method === 'CRYPTO_ONCHAIN' ? 'CRYPTO_DEPOSIT' : 'LOCAL_GATEWAY_DEPOSIT',
        asset: req.asset,
        amount: req.amount,
        fee: 0,
        balanceBefore: balBefore,
        balanceAfter: balAfter,
        status: 'COMPLETED',
        referenceId: req.id,
        description: `${req.method === 'CRYPTO_ONCHAIN' ? req.network : req.method} Deposit Verified: +${req.amount} ${req.asset}`,
        counterparty: req.depositAddressUsed,
        localCurrencyAmount: req.localCurrencyAmount,
        localCurrencyCode: req.localCurrency
      });
    }

    this.saveAll();
    this.notify();

    // Trigger 2.54% Affiliate Commission for Referrer (+গানিতিক হিসাব: depositUsd * 0.0254)
    try {
      const depositUsd = req.usdValue || (req.amount * (this.settings?.tixaBasePriceUsdt || 0.05));
      import('./authEngine').then(({ authEngine }) => {
        authEngine.processAffiliateDepositCommission(req.userId || req.walletAddress, depositUsd, req.id);
      }).catch(err => console.error('Affiliate commission hook error:', err));
    } catch (e) {
      console.error('Failed to trigger affiliate commission:', e);
    }

    await auditEngine.logEvent({
      actorId: adminId,
      actorEmail: 'admin@tixa.network',
      actorRole: 'FINANCE_ADMIN',
      action: 'DEPOSIT_REQUEST_APPROVED_AND_CREDITED',
      targetId: req.id,
      details: { userId: req.userId, walletAddress: req.walletAddress, amount: req.amount, asset: req.asset, balAfter }
    });

    return req;
  }

  // Admin rejects deposit
  public async rejectDepositRequest(requestId: string, adminId: string, reason: string): Promise<DepositRequest> {
    const req = this.deposits.find(d => d.id === requestId);
    if (!req) throw new Error('Deposit request not found.');
    if (req.status !== 'PENDING') throw new Error(`Deposit request already ${req.status}.`);

    req.status = 'REJECTED';
    req.adminNote = reason;
    req.processedByAdminId = adminId;
    req.updatedAt = Date.now();

    // Mark pending ledger entry rejected
    const ledgerEntry = this.ledger.find(l => l.referenceId === req.id && l.status === 'PENDING');
    if (ledgerEntry) {
      ledgerEntry.status = 'REJECTED';
      ledgerEntry.description = `Deposit Rejected: ${reason}`;
      ledgerEntry.timestamp = Date.now();
    }

    this.saveAll();
    this.notify();

    await auditEngine.logEvent({
      actorId: adminId,
      actorEmail: 'admin@tixa.network',
      actorRole: 'FINANCE_ADMIN',
      action: 'DEPOSIT_REQUEST_REJECTED',
      targetId: req.id,
      details: { reason }
    });

    return req;
  }

  // --- 2. WITHDRAWAL REQUESTS & WORKFLOW ---

  public async submitWithdrawal(params: {
    userId: string;
    userEmail: string;
    walletAddress: string;
    asset: string;
    amount: number;
    feeAmount: number;
    destinationMethod: 'CRYPTO_ADDRESS' | 'BKASH' | 'ROCKET' | 'NAGAD' | 'BINANCE_PAY' | 'BANK_TRANSFER';
    network?: CryptoNetwork;
    destinationAddressOrAccount: string;
    accountHolderName?: string;
    bankName?: string;
    localCurrency: string;
    localCurrencyAmount: number;
  }): Promise<WithdrawalRequest> {
    const grossAmount = params.amount;
    const acc = blockchainEngine.getOrCreateAccount(params.walletAddress);

    // Balance check
    if (params.asset === 'TIXA') {
      if (acc.balance < grossAmount) {
        throw new Error(`Insufficient available balance. You have ${acc.balance.toFixed(4)} TIXA available.`);
      }
      // Deduct/hold from available balance
      acc.balance -= grossAmount;
      acc.lastUpdated = Date.now();
    } else {
      const tokenBal = acc.tokens?.[params.asset] || 0;
      if (tokenBal < grossAmount) {
        throw new Error(`Insufficient ${params.asset} balance. You have ${tokenBal} ${params.asset} available.`);
      }
      acc.tokens[params.asset] -= grossAmount;
      acc.lastUpdated = Date.now();
    }

    const netAmount = Math.max(0, grossAmount - params.feeAmount);
    const usdVal = params.asset === 'TIXA' ? grossAmount * this.settings.tixaBasePriceUsdt : grossAmount;

    const newWithdrawal: WithdrawalRequest = {
      id: `wdr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: params.userId,
      userEmail: params.userEmail,
      walletAddress: params.walletAddress,
      asset: params.asset,
      amount: grossAmount,
      feeAmount: params.feeAmount,
      netAmount,
      usdValue: usdVal,
      localCurrency: params.localCurrency,
      localCurrencyAmount: params.localCurrencyAmount,
      destinationMethod: params.destinationMethod,
      network: params.network,
      destinationAddressOrAccount: params.destinationAddressOrAccount.trim(),
      accountHolderName: params.accountHolderName?.trim(),
      bankName: params.bankName?.trim(),
      status: 'PENDING',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.withdrawals.unshift(newWithdrawal);

    // Record pending ledger entry
    const balAfter = params.asset === 'TIXA' ? acc.balance : (acc.tokens[params.asset] || 0);
    this.recordLedgerEntry({
      userId: params.userId,
      walletAddress: params.walletAddress,
      type: 'WITHDRAWAL',
      asset: params.asset,
      amount: grossAmount,
      fee: params.feeAmount,
      balanceBefore: balAfter + grossAmount,
      balanceAfter: balAfter,
      status: 'PENDING',
      referenceId: newWithdrawal.id,
      description: `Withdrawal Request: ${grossAmount} ${params.asset} to ${params.destinationAddressOrAccount}`,
      counterparty: params.destinationAddressOrAccount,
      localCurrencyAmount: params.localCurrencyAmount,
      localCurrencyCode: params.localCurrency
    });

    // Notify Admin
    this.createNotification({
      type: 'WITHDRAWAL_REQUEST',
      title: `New Withdrawal Request (${params.asset})`,
      message: `${params.userEmail} requested withdrawal of ${grossAmount} ${params.asset} via ${params.destinationMethod}. Destination: ${params.destinationAddressOrAccount}`,
      severity: 'WARNING',
      referenceId: newWithdrawal.id,
      userId: params.userId,
      userEmail: params.userEmail,
      amount: grossAmount,
      asset: params.asset
    });

    this.saveAll();
    this.notify();

    await auditEngine.logEvent({
      actorId: params.userId,
      actorEmail: params.userEmail,
      actorRole: 'USER',
      action: 'WITHDRAWAL_REQUEST_SUBMITTED',
      targetId: newWithdrawal.id,
      details: { grossAmount, fee: params.feeAmount, destination: params.destinationAddressOrAccount }
    });

    return newWithdrawal;
  }

  // Admin approves withdrawal
  public async approveWithdrawalRequest(
    requestId: string, 
    adminId: string, 
    payoutTxHash?: string, 
    note?: string
  ): Promise<WithdrawalRequest> {
    const req = this.withdrawals.find(w => w.id === requestId);
    if (!req) throw new Error('Withdrawal request not found.');
    if (req.status !== 'PENDING') throw new Error(`Withdrawal request already ${req.status}.`);

    req.status = 'APPROVED';
    req.payoutTxHash = payoutTxHash || `tx_payout_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    req.adminNote = note || 'Processed and Dispatched by Admin';
    req.processedByAdminId = adminId;
    req.updatedAt = Date.now();

    // Mark ledger entry COMPLETED
    const ledgerEntry = this.ledger.find(l => l.referenceId === req.id && l.status === 'PENDING');
    if (ledgerEntry) {
      ledgerEntry.status = 'COMPLETED';
      ledgerEntry.description = `Withdrawal Dispatched: -${req.amount} ${req.asset} (Payout Tx: ${req.payoutTxHash.slice(0, 14)}...)`;
      ledgerEntry.timestamp = Date.now();
    }

    this.saveAll();
    this.notify();

    await auditEngine.logEvent({
      actorId: adminId,
      actorEmail: 'admin@tixa.network',
      actorRole: 'FINANCE_ADMIN',
      action: 'WITHDRAWAL_APPROVED_AND_EXECUTED',
      targetId: req.id,
      details: { amount: req.amount, payoutTxHash: req.payoutTxHash }
    });

    return req;
  }

  // Admin rejects withdrawal -> refunds user balance safely
  public async rejectWithdrawalRequest(requestId: string, adminId: string, reason: string): Promise<WithdrawalRequest> {
    const req = this.withdrawals.find(w => w.id === requestId);
    if (!req) throw new Error('Withdrawal request not found.');
    if (req.status !== 'PENDING') throw new Error(`Withdrawal request already ${req.status}.`);

    // Refund the reserved balance back to the user
    const acc = blockchainEngine.getOrCreateAccount(req.walletAddress);
    if (req.asset === 'TIXA') {
      acc.balance += req.amount;
    } else {
      if (!acc.tokens) acc.tokens = {};
      acc.tokens[req.asset] = (acc.tokens[req.asset] || 0) + req.amount;
    }
    acc.lastUpdated = Date.now();

    req.status = 'REJECTED';
    req.adminNote = reason;
    req.processedByAdminId = adminId;
    req.updatedAt = Date.now();

    // Mark pending ledger entry rejected and add a refund entry
    const ledgerEntry = this.ledger.find(l => l.referenceId === req.id && l.status === 'PENDING');
    if (ledgerEntry) {
      ledgerEntry.status = 'REJECTED';
      ledgerEntry.description = `Withdrawal Rejected: ${reason} (Refunded)`;
      ledgerEntry.timestamp = Date.now();
    }

    this.recordLedgerEntry({
      userId: req.userId,
      walletAddress: req.walletAddress,
      type: 'ADMIN_ADJUSTMENT',
      asset: req.asset,
      amount: req.amount,
      fee: 0,
      balanceBefore: req.asset === 'TIXA' ? acc.balance - req.amount : (acc.tokens[req.asset] || 0) - req.amount,
      balanceAfter: req.asset === 'TIXA' ? acc.balance : (acc.tokens[req.asset] || 0),
      status: 'COMPLETED',
      referenceId: req.id,
      description: `Refund for Rejected Withdrawal: +${req.amount} ${req.asset}`,
      counterparty: 'Treasury Settlement Node'
    });

    this.saveAll();
    this.notify();

    await auditEngine.logEvent({
      actorId: adminId,
      actorEmail: 'admin@tixa.network',
      actorRole: 'FINANCE_ADMIN',
      action: 'WITHDRAWAL_REJECTED_AND_REFUNDED',
      targetId: req.id,
      details: { reason, refundAmount: req.amount }
    });

    return req;
  }

  // --- 3. UNIFIED LEDGER HELPERS ---

  public recordLedgerEntry(entry: Omit<LedgerEntry, 'id' | 'timestamp'> & { timestamp?: number }): LedgerEntry {
    const newEntry: LedgerEntry = {
      id: `ledg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: entry.timestamp || Date.now(),
      ...entry
    };

    this.ledger.unshift(newEntry);
    this.saveAll();
    this.notify();
    return newEntry;
  }

  // --- 4. ADMIN NOTIFICATIONS ---

  public createNotification(params: Omit<AdminNotification, 'id' | 'timestamp' | 'isRead'>): AdminNotification {
    const notif: AdminNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      isRead: false,
      ...params
    };

    this.notifications.unshift(notif);
    this.saveAll();
    this.notify();
    return notif;
  }

  public markNotificationAsRead(id: string): void {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) {
      notif.isRead = true;
      this.saveAll();
      this.notify();
    }
  }

  public markAllNotificationsAsRead(): void {
    this.notifications.forEach(n => { n.isRead = true; });
    this.saveAll();
    this.notify();
  }

  public getUnreadNotificationCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  // --- 5. SYSTEM SETTINGS & CURRENCIES ---

  public getSettings(): SystemSettings {
    return { ...this.settings };
  }

  public updateSettings(partial: Partial<SystemSettings>): SystemSettings {
    this.settings = { ...this.settings, ...partial };
    this.saveAll();
    this.notify();
    return this.settings;
  }

  public getTixaUsdtPrice(): number {
    return this.settings.tixaBasePriceUsdt;
  }

  public getFiatRate(currencyCode: string): number {
    const upper = (currencyCode || 'BDT').toUpperCase();
    if (this.settings.customExchangeRates[upper]) {
      return this.settings.customExchangeRates[upper];
    }
    if (upper === 'NISI') {
      return 1 / 64280.50;
    }
    if (upper === 'SARA') {
      return 1 / 3485.20;
    }
    if (upper === 'MUN') {
      return 1 / 154.60;
    }
    const country = COUNTRIES.find(c => c.currency === upper);
    return country ? country.rateToUsd : 1.0;
  }

  public convertUsdToFiat(amountUsd: number, currencyCode: string = 'BDT'): number {
    const rate = this.getFiatRate(currencyCode);
    return amountUsd * rate;
  }

  // Getters
  public getDeposits(walletAddress?: string): DepositRequest[] {
    if (walletAddress) {
      return this.deposits.filter(d => d.walletAddress === walletAddress);
    }
    return [...this.deposits];
  }

  public getWithdrawals(walletAddress?: string): WithdrawalRequest[] {
    if (walletAddress) {
      return this.withdrawals.filter(w => w.walletAddress === walletAddress);
    }
    return [...this.withdrawals];
  }

  public getLedger(walletAddress?: string): LedgerEntry[] {
    if (walletAddress) {
      return this.ledger.filter(l => l.walletAddress === walletAddress);
    }
    return [...this.ledger];
  }

  public getAllTransactions(walletAddress?: string): LedgerEntry[] {
    return this.getLedger(walletAddress);
  }

  public getNotifications(): AdminNotification[] {
    return [...this.notifications];
  }

  private saveAll(): void {
    try {
      localStorage.setItem(STORAGE_DEPOSITS_KEY, JSON.stringify(this.deposits.slice(0, 300)));
      localStorage.setItem(STORAGE_WITHDRAWALS_KEY, JSON.stringify(this.withdrawals.slice(0, 300)));
      localStorage.setItem(STORAGE_LEDGER_KEY, JSON.stringify(this.ledger.slice(0, 500)));
      localStorage.setItem(STORAGE_NOTIFICATIONS_KEY, JSON.stringify(this.notifications.slice(0, 200)));
      localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(this.settings));
    } catch (e) {
      console.warn('Failed to save ledger storage', e);
    }
  }
}

export const ledgerEngine = LedgerEngine.getInstance();
