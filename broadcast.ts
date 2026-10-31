export type BroadcastMediaType = 'image' | 'video' | 'sms' | 'announcement' | 'box';
export type BroadcastPlacement = 'HERO_SWIPER' | 'POPUP_MODAL' | 'MARQUEE_TICKER' | 'USER_INBOX_SMS';
export type AudienceTargetType = 'ALL' | 'TARGETED_EMAIL' | 'TARGETED_PHONE' | 'TARGETED_ROLE';

export interface BroadcastMediaItem {
  id: string;
  title: string;
  subtitle?: string;
  type: BroadcastMediaType;
  placement: BroadcastPlacement;
  
  // Media Assets
  imageUrl?: string;
  thumbnailUrl?: string;
  videoUrl?: string; // mp4, webm, or youtube embed
  gradientTheme?: string; // custom css gradient class
  
  // Message / Body
  message: string;
  
  // Call to action
  actionLabel?: string;
  actionUrl?: string; // e.g. '#deposit', '#tokens', '#staking', 'https://...'
  badgeText?: string; // e.g. 'HOT PROMO', 'NEW ASSET', 'EXCLUSIVE VIP', '5 TIXA'
  
  // Timing & Scheduling (তারিখ, সময়, মিনিট)
  alwaysActive: boolean;
  startDate?: string; // YYYY-MM-DD
  startTime?: string; // HH:MM
  endDate?: string;   // YYYY-MM-DD
  endTime?: string;   // HH:MM
  
  // Targeting (ইউজার জিমেইল বা নম্বর টার্গেট)
  targetType: AudienceTargetType;
  targetEmails?: string[]; // list of emails
  targetPhones?: string[]; // list of phone numbers
  targetRoles?: string[];
  
  // State & Metrics
  isActive: boolean;
  priorityOrder: number; // 1, 2, 3...
  viewCount: number;
  clickCount: number;
  createdAt: string;
  updatedAt: string;
  createdByAdminName?: string;
}

export interface BroadcastFilterOptions {
  placement?: BroadcastPlacement | 'ALL';
  type?: BroadcastMediaType | 'ALL';
  targetType?: AudienceTargetType | 'ALL';
  status?: 'ALL' | 'ACTIVE' | 'SCHEDULED' | 'EXPIRED' | 'INACTIVE';
  searchQuery?: string;
}
