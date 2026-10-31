export type AdminRole = 
  | 'SUPER_ADMIN' 
  | 'ADMIN' 
  | 'FINANCE_ADMIN' 
  | 'SECURITY_ADMIN' 
  | 'SUPPORT_ADMIN' 
  | 'READ_ONLY';

export interface SavedWithdrawalAddress {
  id: string;
  label: string; // e.g. 'My Personal bKash', 'Nagad Cash Account', 'Binance TRC20', 'City Bank Savings'
  methodId: string; // 'bkash', 'nagad', 'rocket', 'usdt_trc20', 'bank_bd', etc.
  methodName: string; // 'bKash', 'Nagad', 'Rocket', 'USDT (TRC20)', 'Bank Wire'
  network: string; // 'BANGLADESH_MFS', 'TRC20', 'BANK_WIRE', etc.
  addressOrNumber: string; // Phone number / wallet address / account number
  accountType?: 'PERSONAL' | 'AGENT' | 'MERCHANT' | 'SAVINGS' | 'CURRENT';
  accountHolderName?: string;
  bankName?: string;
  branchName?: string;
  isDefault?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface AffiliateCommissionRecord {
  id: string;
  referredUserId: string;
  referredUserEmail: string; // masked: e.g. "bet***@gmail.com"
  depositTxId: string;
  depositAmountUSD: number;
  commissionRate: number; // 0.0254 (2.54%)
  commissionEarnedUSD: number; // depositAmountUSD * 0.0254
  timestamp: number;
}

export interface AffiliateWithdrawalRecord {
  id: string;
  amountUSD: number;
  tixaAmount: number;
  destinationAddress: string; // Strictly user's own primary Tixapay address (tx1...)
  timestamp: number;
  txHash: string;
  status: 'COMPLETED';
}

export interface UserAccount {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  countryCode?: string;
  countryName?: string;
  callingCode?: string;
  currency?: string;
  currencyCode?: string;
  passwordHash: string; // SHA-256 with user salt
  secretPhraseHash: string; // SHA-256 with user salt
  salt: string;
  walletAddress: string;
  createdAt: number;
  lastLoginAt: number;
  isFrozen: boolean;
  freezeReason?: string;
  status: 'ACTIVE' | 'FROZEN' | 'SUSPENDED';
  registrationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminApprovalNote?: string;
  passkeyEnrolled: boolean;
  passkeyCredentialId?: string;
  savedWithdrawalAddresses?: SavedWithdrawalAddress[];
  
  // AFILET (Affiliate & Referral System)
  affiliateCode?: string; // e.g. "TIXA-AFF-8X92K"
  referredByCode?: string; // Affiliate code of who referred this user
  affiliateBalanceUSD?: number; // Separate affiliate balance (Unmerged from main balance)
  affiliateTotalEarnedUSD?: number; // Lifetime earnings from 2.54% deposits
  affiliateWithdrawnUSD?: number; // Total withdrawn to primary Tixapay address
  affiliateTotalReferrals?: number; // Count of referred users
  affiliateCommissions?: AffiliateCommissionRecord[];
  affiliateWithdrawals?: AffiliateWithdrawalRecord[];
}

export interface AuthRequestLog {
  id: string;
  type: 'REGISTRATION' | 'LOGIN';
  userId?: string;
  email: string;
  phone?: string;
  countryCode?: string;
  walletAddress?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  ipAddress: string;
  timestamp: number;
  adminNote?: string;
  reviewedByAdmin?: string;
}

export interface UserSession {
  token: string;
  userId: string;
  email: string;
  phone?: string;
  walletAddress: string;
  expiresAt: number;
  device: string;
  ipAddress: string;
  createdAt: number;
}

export interface AdminUser {
  id: string;
  name: string;
  shortName?: string;
  title?: string;
  email: string;
  role: AdminRole;
  passwordHash?: string;
  adminSecretHash?: string;
  salt?: string;
  passkeyEnabled?: boolean;
  lastLoginAt: number;
}

export interface AdminSessionRecord {
  id: string;
  adminId: string;
  adminName: string;
  adminEmail: string;
  role: AdminRole;
  ipAddress: string;
  location: string;
  device: string;
  sessionToken: string;
  lastLoginAt: number;
  isActive: boolean;
}

export interface SecurityAuditLog {
  id: string;
  timestamp: number;
  actorId: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  targetId?: string;
  details: Record<string, any>;
  previousHash: string;
  hash: string; // Cryptographic chain of integrity
  ipAddress: string;
  status: 'SUCCESS' | 'DENIED' | 'REQUIRES_MULTISIG';
}

export interface LoginOtpSession {
  id: string;
  userId?: string;
  email: string;
  phone?: string;
  otpCode: string; // 6-digit cryptographic verification code
  createdAt: number;
  expiresAt: number; // 3-minute window (180 seconds)
  status: 'PENDING' | 'VERIFIED' | 'EXPIRED' | 'FAILED';
  ipAddress?: string;
}

export interface DualOtpSession {
  id: string;
  type: 'REGISTRATION' | 'LOGIN';
  userId?: string;
  email: string;
  phone: string;
  countryCode?: string;
  countryName?: string;
  callingCode?: string;
  currencyCode?: string;
  emailOtp: string;       // 6-digit cryptographic code for Gmail
  mobileOtp: string;      // 6-digit cryptographic code for Mobile SMS
  emailVerified: boolean;
  mobileVerified: boolean;
  createdAt: number;
  expiresAt: number;      // 180 seconds (3 minutes)
  status: 'PENDING' | 'DUAL_VERIFIED' | 'EXPIRED' | 'FAILED';
  ipAddress: string;
  registrationPayload?: {
    passwordHash: string;
    secretPhraseHash: string;
    salt: string;
    secretPhrase: string;
    walletAddress: string;
  };
}

export interface DualOtpVerificationResult {
  success: boolean;
  message: string;
  session?: UserSession;
  user?: UserAccount;
  secretPhrase?: string;
  emailMatched?: boolean;
  mobileMatched?: boolean;
}

export interface MultiSigAction {
  id: string;
  actionType: 'ACCOUNT_FREEZE' | 'TREASURY_MINT' | 'TREASURY_BURN' | 'VALIDATOR_SLASH' | 'EMERGENCY_HALT';
  proposedBy: string;
  proposerRole: AdminRole;
  description: string;
  data: Record<string, any>;
  requiredApprovals: number;
  currentApprovals: string[]; // admin IDs
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXECUTED';
  createdAt: number;
  expiresAt: number;
}
