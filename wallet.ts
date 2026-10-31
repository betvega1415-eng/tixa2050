export interface WalletAccount {
  id: string;
  name: string;
  address: string; // 'tx1...'
  publicKey: string;
  encryptedPrivateKey: string; // Encrypted with salt
  isDefault: boolean;
  avatarSeed: string;
  createdAt: number;
}

export interface WalletVault {
  version: number;
  encryptedSeedPhrase: string; // AES-GCM encrypted or Salted Hash
  salt: string;
  accounts: WalletAccount[];
  activeAccountId: string;
  createdAt: number;
}

export interface SendTransactionParams {
  recipient: string;
  amount: number;
  fee: number;
  type?: 'TRANSFER' | 'TOKEN_TRANSFER' | 'STAKE' | 'UNSTAKE';
  tokenAddress?: string;
  memo?: string;
}

export interface FaucetClaim {
  address: string;
  amount: number;
  timestamp: number;
  txHash: string;
}
