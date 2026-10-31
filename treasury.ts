export type SectorType = 
  | 'Tech Giants'
  | 'Sovereign Wealth & Central Banks'
  | 'Asset Management & Hedge Funds'
  | 'Banking & Financial Institutions'
  | 'AI & Semiconductor'
  | 'Energy & Conglomerates'
  | 'Crypto & Web3 Native';

export type TreasuryStrategy = 'Accumulate' | 'HODL' | 'Staking' | 'Rebalancing';

export interface CompanyHolding {
  id: string;
  rank: number;
  name: string;
  ticker: string;
  logoBg: string;
  logoText: string;
  country: string;
  countryCode: string;
  flagEmoji: string;
  sector: SectorType;
  tixaHeld: number;
  avgEntryPrice: number;
  totalValueUsd: number;
  pnl24hPercent: number;
  pnlTotalPercent: number;
  tickDirection: 'up' | 'down' | 'neutral';
  delta24hAmount: number;
  allocationPercent: number;
  treasuryStrategy: TreasuryStrategy;
  vaultAddress: string;
  verifiedDate: string;
  stakingYieldApy?: number;
  stakedAmount?: number;
  notes?: string;
  sparkline: number[];
}

export type CommentSentiment = 'BULLISH' | 'ULTRA_BULLISH' | 'MOON_2050' | 'NEUTRAL';
export type UserTier = 'Retail Investor' | 'Whale' | 'Institutional Analyst' | 'Validator Node' | 'Core Dev';

export interface WorldComment {
  id: string;
  authorName: string;
  authorHandle: string;
  authorCountry: string;
  countryCode: string;
  flagEmoji: string;
  userTier: UserTier;
  avatarColor: string;
  timestamp: number;
  timeAgoText?: string;
  message: string;
  futureGoalPrice: number;
  timeHorizon: '2026' | '2030' | '2040' | '2050';
  sentiment: CommentSentiment;
  likesCount: number;
  isLikedByUser?: boolean;
  isVerified?: boolean;
  tags: string[];
}

export interface TreasurySummaryMetrics {
  totalTixaInTreasuries: number;
  totalTreasuryValueUsd: number;
  percentOfCirculatingSupply: number;
  totalCompaniesTracked: number;
  topGainer24h: {
    name: string;
    ticker: string;
    gainPercent: number;
  };
  net24hInflowUsd: number;
  liveUpCount: number;
  liveDownCount: number;
  avgTargetPrice2050: number;
  bullishSentimentPercent: number;
  totalWorldComments: number;
}
