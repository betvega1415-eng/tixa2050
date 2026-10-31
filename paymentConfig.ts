export type PaymentCategory = 
  | 'STABLECOIN' 
  | 'LAYER1_CRYPTO' 
  | 'MFS_BANGLADESH' 
  | 'FIAT_BANK' 
  | 'EXCHANGE_PAY';

export type MfsTransferType = 'PAYMENT' | 'SEND_MONEY' | 'CASH_OUT';

export interface MfsModeConfig {
  paymentNumber?: string; // মার্চেন্ট পেমেন্ট নম্বর (Merchant Payment)
  paymentCounter?: string; // কাউন্টার নং / রেফারেন্স (Counter / Ref)
  paymentInstructions?: string;
  paymentEnabled?: boolean;

  sendMoneyNumber?: string; // সেন্ড মানি পার্সোনাল নম্বর (Send Money / Personal)
  sendMoneyInstructions?: string;
  sendMoneyEnabled?: boolean;

  cashOutNumber?: string; // ক্যাশ আউট এজেন্ট নম্বর (Cash Out / Agent)
  cashOutInstructions?: string;
  cashOutEnabled?: boolean;
}

export type SupportedNetwork = 
  | 'TRC20'
  | 'ERC20'
  | 'BEP20'
  | 'TIXA_2050_NATIVE'
  | 'BITCOIN'
  | 'ETHEREUM'
  | 'SOLANA'
  | 'POLYGON'
  | 'ARBITRUM'
  | 'BANGLADESH_MFS'
  | 'BANK_WIRE'
  | 'BINANCE_DIRECT'
  | 'NISI_NET'
  | 'SARA_NET'
  | 'MUN_NET';

export interface PaymentMethodConfig {
  id: string; // e.g. 'usdt_trc20'
  name: string; // e.g. 'USDT'
  network: SupportedNetwork; // e.g. 'TRC20'
  networkDisplayName: string; // e.g. 'Tron (TRC20)'
  currency: string; // e.g. 'USDT', 'TIXA', 'BTC'
  category: PaymentCategory;
  receivingAddress: string; // Default active wallet address or primary number
  mfsModes?: MfsModeConfig; // Dedicated PAYMENT, SEND MONEY, CASH OUT addresses & instructions
  isActive: boolean;
  minDepositUsd: number; // e.g. 10.00
  depositFeePercent: number; // e.g. 0.00%
  networkWarning: string;
  depositInstructions: string;
  requiresTxHash: boolean;
  iconType: string; // e.g. 'usdt', 'tixa', 'btc', 'eth', 'sol', 'binance', 'bkash', 'nagad', 'rocket'
  brandColor: string; // e.g. '#26A17B' for USDT
  lastUpdatedAt: number;
  lastUpdatedByAdmin: {
    adminId: string;
    adminName: string;
    adminEmail: string;
    adminRole: string;
  };
  extraFields?: {
    memoOrTagRequired?: boolean;
    memoOrTagValue?: string;
    accountHolderName?: string;
    bankSwiftCode?: string;
    qrCodeCustomUrl?: string;
  };
}

export interface PaymentAddressAuditLog {
  id: string;
  timestamp: number;
  paymentMethodId: string;
  paymentMethodName: string;
  network: string;
  action: 'CREATED' | 'UPDATED' | 'STATUS_TOGGLED' | 'DELETED';
  oldAddress: string;
  newAddress: string;
  oldStatus?: boolean;
  newStatus?: boolean;
  adminId: string;
  adminEmail: string;
  adminName: string;
  adminRole: string;
  ipAddress: string;
  deviceInfo: string;
  reason?: string;
  hash: string;
}

export interface AddressValidationResult {
  isValid: boolean;
  network: SupportedNetwork;
  formattedAddress: string;
  errorMessage?: string;
}

export type AdminPermission = 
  | 'payment_address.manage'
  | 'users.manage'
  | 'deposits.approve'
  | 'withdrawals.approve'
  | 'treasury.mint'
  | 'security.freeze'
  | 'audit.view';
