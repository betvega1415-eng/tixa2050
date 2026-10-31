export type DepositMethod = 
  | 'CRYPTO_ONCHAIN'
  | 'BINANCE_PAY'
  | 'MEXC_PAY'
  | 'BKASH'
  | 'ROCKET'
  | 'NAGAD'
  | 'BANK_TRANSFER'
  | 'UPAY';

export type CryptoNetwork = 
  | 'TIXA_2050_NATIVE'
  | 'TRC20'
  | 'ERC20'
  | 'BEP20'
  | 'POLYGON'
  | 'SOLANA'
  | 'BITCOIN_LIGHTNING';

export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSING';

export interface DepositRequest {
  id: string; // 'dep_req_...'
  userId: string;
  userEmail: string;
  walletAddress: string;
  asset: string; // 'TIXA', 'USDT', 'BTC', 'ETH'
  network?: CryptoNetwork;
  amount: number; // in Asset
  usdValue: number;
  localCurrency: string;
  localCurrencyAmount: number;
  method: DepositMethod;
  mfsTransferType?: 'PAYMENT' | 'SEND_MONEY' | 'CASH_OUT';
  txHashOrReference: string; // TXID or Payment Ref
  senderAccountOrPhone?: string;
  screenshotUrl?: string;
  depositAddressUsed: string;
  status: RequestStatus;
  adminNote?: string;
  processedByAdminId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface WithdrawalRequest {
  id: string; // 'wdr_req_...'
  userId: string;
  userEmail: string;
  walletAddress: string;
  asset: string; // 'TIXA', 'USDT', 'BTC', 'ETH'
  amount: number; // gross amount to withdraw
  feeAmount: number; // network / processing fee
  netAmount: number; // amount sent to user
  usdValue: number;
  localCurrency: string;
  localCurrencyAmount: number;
  destinationMethod: 'CRYPTO_ADDRESS' | 'BKASH' | 'ROCKET' | 'NAGAD' | 'BINANCE_PAY' | 'BANK_TRANSFER';
  network?: CryptoNetwork;
  destinationAddressOrAccount: string;
  accountHolderName?: string;
  bankName?: string;
  status: RequestStatus;
  adminNote?: string;
  payoutTxHash?: string;
  processedByAdminId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface LedgerEntry {
  id: string;
  userId: string;
  walletAddress: string;
  type: 
    | 'CRYPTO_DEPOSIT' 
    | 'LOCAL_GATEWAY_DEPOSIT' 
    | 'WITHDRAWAL' 
    | 'TRANSFER_OUT' 
    | 'TRANSFER_IN' 
    | 'STAKE_LOCK' 
    | 'UNSTAKE_RELEASE' 
    | 'FAUCET_CLAIM' 
    | 'TOKEN_SWAP' 
    | 'STAKING_REWARD'
    | 'TRADE_BUY'
    | 'TRADE_SELL'
    | 'ADMIN_ADJUSTMENT';
  asset: string;
  amount: number;
  fee: number;
  balanceBefore: number;
  balanceAfter: number;
  status: 'COMPLETED' | 'PENDING' | 'REJECTED';
  referenceId: string; // TxHash or Deposit/Withdrawal Request ID
  description: string;
  counterparty?: string;
  timestamp: number;
  countryCode?: string;
  localCurrencyAmount?: number;
  localCurrencyCode?: string;
}

export type LedgerTransaction = LedgerEntry;

export interface AdminNotification {
  id: string;
  type: 
    | 'USER_REGISTRATION'
    | 'USER_LOGIN'
    | 'CRYPTO_DEPOSIT'
    | 'LOCAL_PAYMENT_DEPOSIT'
    | 'DEPOSIT_APPROVED'
    | 'WITHDRAWAL_REQUEST'
    | 'WITHDRAWAL_APPROVED'
    | 'SECURITY_ALERT'
    | 'MULTISIG_PROPOSAL';
  title: string;
  message: string;
  severity: 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL';
  referenceId?: string;
  userId?: string;
  userEmail?: string;
  amount?: number;
  asset?: string;
  isRead: boolean;
  timestamp: number;
  data?: Record<string, any>;
}

export interface MerchantAccountConfig {
  binancePayId: string;
  binanceMerchantName: string;
  mexcPayUid: string;
  bkashMerchantNumber: string;
  bkashType: 'Merchant' | 'Personal' | 'Agent';
  rocketMerchantNumber: string;
  nagadMerchantNumber: string;
  bankAccountName: string;
  bankName: string;
  bankAccountNumber: string;
  bankSwiftRouting: string;
  cryptoDepositAddresses: Record<string, string>; // Network -> Address
}

export interface SystemSettings {
  tixaBasePriceUsdt: number;
  tixaPriceVolatilityPerSec: number; // e.g. 10000
  enablePricePulse: boolean;
  minDepositUsd: number;
  minWithdrawUsd: number;
  cryptoWithdrawFeePercent: number; // e.g. 0.5%
  localWithdrawFeePercent: number; // e.g. 1.0%
  autoApproveRegistrations: boolean;
  merchantAccounts: MerchantAccountConfig;
  customExchangeRates: Record<string, number>; // Currency code -> rate to USD
}

export type SystemLedgerSettings = SystemSettings;
