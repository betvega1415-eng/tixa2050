export type VideoStatus = 'PUBLISHED' | 'DRAFT' | 'UNDER_REVIEW' | 'FLAGGED' | 'REMOVED';
export type RewardLedgerEventType = 
  | 'CREATOR_ELIGIBLE_VIEW' 
  | 'CREATOR_ENGAGEMENT_BONUS' 
  | 'VIEWER_WATCH_REWARD' 
  | 'DAILY_LOGIN_BONUS'
  | 'REFERRAL_BONUS' 
  | 'WITHDRAWAL_DEDUCTION' 
  | 'REWARD_REVERSAL';

export type RewardEventStatus = 'PENDING' | 'VERIFIED' | 'AVAILABLE' | 'SETTLED' | 'REVERSED' | 'HELD';

export type WithdrawalStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED' | 'UNDER_REVIEW';

export type SupportedWithdrawalNetwork = 
  | 'TIXA_MAINNET' 
  | 'USDT_TRC20' 
  | 'USDT_ERC20' 
  | 'USDT_BEP20';

export interface BlueTixaVideo {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorHandle: string;
  creatorAvatar: string;
  creatorAddress: string;
  creatorIsVerified: boolean;
  videoUrl: string;
  thumbnailUrl: string;
  caption: string;
  hashtags: string[];
  audioTitle: string;
  audioArtist: string;
  duration: number; // in seconds
  aspectRatio: '9:16' | '16:9' | '1:1';
  viewsCount: number;
  eligibleViewsCount: number;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  savesCount: number;
  pointsEarned: number;
  status: VideoStatus;
  monetizationEnabled: boolean;
  isLiked?: boolean;
  isSaved?: boolean;
  isFollowing?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface BlueTixaComment {
  id: string;
  videoId: string;
  userId: string;
  userName: string;
  userHandle: string;
  userAvatar: string;
  content: string;
  likesCount: number;
  isLiked: boolean;
  createdAt: number;
}

export interface BlueTixaRewardLedgerEvent {
  id: string;
  userId: string;
  type: RewardLedgerEventType;
  videoId?: string;
  points: number; // e.g. +50 points
  usdValue: number; // calculated as points / 100
  status: RewardEventStatus;
  description: string;
  fingerprint: string;
  fraudScore: number; // 0 (legit) to 100 (fraud)
  createdAt: number;
  verifiedAt?: number;
}

export interface BlueTixaWithdrawal {
  id: string;
  userId: string;
  userName: string;
  walletAddress: string;
  network: SupportedWithdrawalNetwork;
  asset: 'TIXA' | 'USDT';
  requestedPoints: number;
  usdAmount: number;
  assetPayoutAmount: number;
  feeUsd: number;
  status: WithdrawalStatus;
  txHash?: string;
  requestedAt: number;
  processedAt?: number;
  adminNotes?: string;
}

export interface BlueTixaCreatorStats {
  totalViews: number;
  eligibleViews: number;
  totalVideos: number;
  followersCount: number;
  followingCount: number;
  totalLikes: number;
  totalComments: number;
  totalPointsEarned: number;
  pendingRewards: number;
  availableRewards: number;
  estimatedUsdValue: number;
}

export interface BlueTixaViewerStats {
  totalWatchTimeSeconds: number;
  todayWatchTimeSeconds: number;
  todayPointsEarned: number;
  todayMaxPoints: number;
  lifetimePointsEarned: number;
  availablePoints: number;
  pendingPoints: number;
  withdrawnPoints: number;
}

export interface BlueTixaAdminConfig {
  viewerRewardPointsPerMin: number; // default: 20 pts / min
  creatorRewardPointsPer1kEligibleViews: number; // default: 200 pts / 1,000 eligible views ($2/1k)
  minEligibleWatchSeconds: number; // default: 5 seconds
  viewerDailyMaxPoints: number; // default: 200 pts ($2/day)
  minWithdrawalPoints: number; // STRICT REQUIREMENT: 500 points ($5 USD)
  pointsPerUsd: number; // STRICT REQUIREMENT: 100 points = $1 USD
  supportedNetworks: {
    id: SupportedWithdrawalNetwork;
    name: string;
    asset: 'TIXA' | 'USDT';
    feeUsd: number;
    enabled: boolean;
  }[];
  fraudDetectionLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'STRICT';
  autoApproveThresholdUsd: number;
}

export interface BlueTixaReport {
  id: string;
  videoId: string;
  videoTitle: string;
  creatorHandle: string;
  reportedBy: string;
  reason: 'SPAM' | 'COPYRIGHT' | 'INAPPROPRIATE' | 'MISINFORMATION' | 'FRAUD_VIEWS' | 'OTHER';
  details: string;
  status: 'OPEN' | 'RESOLVED' | 'DISMISSED';
  createdAt: number;
}

export interface BlueTixaUserProfile {
  id: string;
  handle: string;
  name: string;
  avatar: string;
  bio: string;
  walletAddress: string;
  isVerified: boolean;
  followersCount: number;
  followingCount: number;
  likesReceivedCount: number;
  totalVideosCount: number;
  joinedDate: string;
  socialLinks?: {
    x?: string;
    telegram?: string;
    youtube?: string;
  };
}
