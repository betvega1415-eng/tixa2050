export type NetworkEnvironment = 'development' | 'mainnet' | 'testnet' | 'mainnet_preview';

export type TransactionType = 
  | 'TRANSFER' 
  | 'TOKEN_MINT' 
  | 'TOKEN_BURN' 
  | 'TOKEN_DEPLOY' 
  | 'STAKE' 
  | 'UNSTAKE' 
  | 'CLAIM_REWARD' 
  | 'GOVERNANCE_VOTE' 
  | 'TREASURY_TRANSFER';

export type TransactionStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED';

export interface Transaction {
  id: string; // Tx Hash
  sender: string; // Bech32 'tx1...'
  receiver: string; // Bech32 'tx1...'
  amount: number; // in TIXA
  fee: number; // in TIXA (e.g. 0.001)
  nonce: number;
  timestamp: number;
  type: TransactionType;
  status: TransactionStatus;
  blockHeight?: number;
  signature: string;
  payload?: {
    tokenSymbol?: string;
    tokenAddress?: string;
    asset?: string;
    authorizedByAdmin?: string;
    metadata?: string;
    stakeDuration?: number;
    memo?: string;
  };
  confirmations: number;
  gasUsed: number;
}

export interface BlockHeader {
  height: number;
  timestamp: number;
  previousHash: string;
  merkleRoot: string;
  stateRoot: string;
  validatorAddress: string;
  validatorSignature: string;
  nonce: number;
  gasUsed: number;
  gasLimit: number;
  difficulty: number;
}

export interface Block {
  header: BlockHeader;
  hash: string;
  transactions: Transaction[];
  txCount: number;
  sizeBytes: number;
  rewardTIXA: number;
  burnedTIXA: number;
}

export interface Validator {
  address: string;
  name: string;
  pubKey: string;
  stakedAmount: number;
  delegatedAmount: number;
  commissionRate: number; // percentage, e.g. 5%
  uptime: number; // percentage, e.g. 99.98%
  blocksProposed: number;
  blocksValidated: number;
  totalRewards: number;
  status: 'ACTIVE' | 'JAILED' | 'STANDBY' | 'INACTIVE';
  performanceScore: number; // 0 - 100
  lastActiveTimestamp: number;
  slashingCount: number;
}

export interface TX20Token {
  address: string;
  name: string;
  symbol: string;
  totalSupply: number;
  circulatingSupply: number;
  decimals: number;
  owner: string;
  mintable: boolean;
  burnable: boolean;
  metadataURI: string;
  createdAt: number;
  holdersCount: number;
  icon?: string;
}

export interface AccountState {
  address: string;
  balance: number; // TIXA balance
  stakedBalance: number;
  lockedBalance: number;
  pendingRewards: number;
  nonce: number;
  tokens: Record<string, number>; // tokenAddress -> balance
  isFrozen: boolean;
  freezeReason?: string;
  lastUpdated: number;
}

export interface NetworkStats {
  chainId: string;
  networkName: string;
  blockHeight: number;
  currentTPS: number;
  peakTPS: number;
  avgBlockTimeSeconds: number;
  activeValidators: number;
  totalStaked: number;
  totalBurned: number;
  totalSupply: number;
  circulatingSupply: number;
  treasuryBalance: number;
  gasPriceGwei: number;
  epoch: number;
  lastFinalizedBlock: number;
  status: 'OPTIMAL' | 'DEGRADED' | 'MAINTENANCE';
}

export interface ConsensusProposal {
  id: string;
  title: string;
  description: string;
  proposer: string;
  type: 'PARAMETER_CHANGE' | 'TREASURY_SPEND' | 'PROTOCOL_UPGRADE' | 'EMERGENCY_ACTION';
  parameters?: Record<string, any>;
  yesVotes: number;
  noVotes: number;
  abstainVotes: number;
  quorum: number;
  deadline: number;
  status: 'ACTIVE' | 'PASSED' | 'REJECTED' | 'EXECUTED';
}
