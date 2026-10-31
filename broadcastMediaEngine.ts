import { BroadcastMediaItem, BroadcastPlacement, AudienceTargetType } from '../types/broadcast';

const STORAGE_KEY = 'tixa_broadcast_media_v2';

export const MEDIA_PRESETS = [
  {
    name: 'Genesis Mainnet Launch (Cyber Blue)',
    imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1600&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=400&q=80',
    gradient: 'from-cyan-950 via-slate-900 to-blue-950',
    tag: 'MAINNET'
  },
  {
    name: 'TX-20 Token Factory (Amber Gold)',
    imageUrl: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?auto=format&fit=crop&w=1600&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?auto=format&fit=crop&w=400&q=80',
    gradient: 'from-amber-950 via-slate-900 to-emerald-950',
    tag: '5 TIXA DEPLOY'
  },
  {
    name: 'Bangladesh Instant MFS 0% Fee (Emerald)',
    imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1600&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=400&q=80',
    gradient: 'from-emerald-950 via-slate-900 to-cyan-950',
    tag: 'MFS 0% FEE'
  },
  {
    name: 'AI Sovereign Node Staking 18.5% APY (Neon Purple)',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    gradient: 'from-purple-950 via-slate-900 to-indigo-950',
    tag: '18.5% STAKING'
  },
  {
    name: 'Exclusive VIP Grand Tournament (Rose Crimson)',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80',
    gradient: 'from-rose-950 via-slate-900 to-purple-950',
    tag: 'VIP EXCLUSIVE'
  }
];

const INITIAL_DEFAULT_BROADCASTS: BroadcastMediaItem[] = [
  {
    id: 'broadcast-hero-1',
    title: 'TIXAPAY Layer-1 Mainnet Genesis Active',
    subtitle: 'Zero-Gas Quantum Speed Consensus & Deterministic 3.0s Finality',
    type: 'image',
    placement: 'HERO_SWIPER',
    imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1600&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=400&q=80',
    message: 'Experience next-generation decentralized finance powered by BFT-consensus and non-custodial cryptographic key vaults.',
    actionLabel: 'Explore Ecosystem',
    actionUrl: '#markets',
    badgeText: 'GENESIS LIVE',
    gradientTheme: 'from-cyan-950/90 via-slate-950/80 to-blue-950/90',
    alwaysActive: true,
    targetType: 'ALL',
    isActive: true,
    priorityOrder: 1,
    viewCount: 1420,
    clickCount: 312,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdByAdminName: 'Super Admin Council'
  },
  {
    id: 'broadcast-hero-2',
    title: 'Deploy TX-20 Standard Smart Assets',
    subtitle: 'Mandatory 5.0 TIXA Protocol Fee • Verification via Gmail',
    type: 'box',
    placement: 'HERO_SWIPER',
    imageUrl: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?auto=format&fit=crop&w=1600&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?auto=format&fit=crop&w=400&q=80',
    message: 'Launch compliant tokens, mint supply policies, and establish on-chain metadata with 5.0 TIXA protocol fee authorization.',
    actionLabel: 'Deploy TX-20 (5 TIXA)',
    actionUrl: '#tokens',
    badgeText: '5 TIXA PAY',
    gradientTheme: 'from-amber-950/90 via-slate-950/80 to-yellow-950/90',
    alwaysActive: true,
    targetType: 'ALL',
    isActive: true,
    priorityOrder: 2,
    viewCount: 980,
    clickCount: 245,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdByAdminName: 'Super Admin Council'
  },
  {
    id: 'broadcast-hero-3',
    title: 'Bangladesh MFS Multi-Channel Gateways',
    subtitle: 'bKash, Nagad, Rocket & Upay • Payment, Send Money & Cashout',
    type: 'image',
    placement: 'HERO_SWIPER',
    imageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1600&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=400&q=80',
    message: 'Instant automated fiat-to-TIXA settlement with verified counter numbers and real-time ledger accounting.',
    actionLabel: 'Deposit via MFS',
    actionUrl: '#deposit',
    badgeText: '0% MFS FEE',
    gradientTheme: 'from-emerald-950/90 via-slate-950/80 to-cyan-950/90',
    alwaysActive: true,
    targetType: 'ALL',
    isActive: true,
    priorityOrder: 3,
    viewCount: 1650,
    clickCount: 410,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdByAdminName: 'Payment Director'
  },
  {
    id: 'broadcast-hero-4',
    title: 'Autonomous AI Node Validator Staking',
    subtitle: 'Earn up to 18.5% APY Daily Compounded Rewards',
    type: 'video',
    placement: 'HERO_SWIPER',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    message: 'Stake your TIXA coins in high-yield decentralized validator pools with instant unstaking and automated smart payouts.',
    actionLabel: 'Start Staking (18.5%)',
    actionUrl: '#staking',
    badgeText: '18.5% APY',
    gradientTheme: 'from-purple-950/90 via-slate-950/80 to-indigo-950/90',
    alwaysActive: true,
    targetType: 'ALL',
    isActive: true,
    priorityOrder: 4,
    viewCount: 820,
    clickCount: 189,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdByAdminName: 'Security Lead'
  }
];

type Listener = () => void;

class BroadcastMediaEngine {
  private items: BroadcastMediaItem[] = [];
  private listeners: Listener[] = [];

  constructor() {
    this.load();
  }

  private load(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.items = JSON.parse(stored);
      } else {
        this.items = [...INITIAL_DEFAULT_BROADCASTS];
        this.save();
      }
    } catch {
      this.items = [...INITIAL_DEFAULT_BROADCASTS];
    }
  }

  private save(notifyListeners = true): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
    } catch (e) {
      console.error('Failed to save broadcast items to localStorage', e);
    }
    if (notifyListeners) {
      this.notify();
    }
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach(listener => {
      try {
        listener();
      } catch (e) {
        console.error('Broadcast listener error', e);
      }
    });
  }

  // Get all items for Admin
  public getAllBroadcasts(): BroadcastMediaItem[] {
    return [...this.items].sort((a, b) => a.priorityOrder - b.priorityOrder);
  }

  // Check if an item is active based on exact Date, Hour, Minute
  public isScheduleActive(item: BroadcastMediaItem, targetDate: Date = new Date()): boolean {
    if (!item.isActive) return false;
    if (item.alwaysActive) return true;

    const now = targetDate.getTime();

    // Check start date & time
    if (item.startDate) {
      const startTimeStr = item.startTime || '00:00';
      const startDateTime = new Date(`${item.startDate}T${startTimeStr}:00`).getTime();
      if (!isNaN(startDateTime) && now < startDateTime) {
        return false; // Not yet started
      }
    }

    // Check end date & time
    if (item.endDate) {
      const endTimeStr = item.endTime || '23:59';
      const endDateTime = new Date(`${item.endDate}T${endTimeStr}:59`).getTime();
      if (!isNaN(endDateTime) && now > endDateTime) {
        return false; // Already expired
      }
    }

    return true;
  }

  // Check audience match for specific user
  public isTargetMatch(
    item: BroadcastMediaItem, 
    userEmail?: string, 
    userPhone?: string,
    userRole?: string
  ): boolean {
    if (item.targetType === 'ALL') return true;

    if (item.targetType === 'TARGETED_EMAIL') {
      if (!userEmail) return false;
      const cleanUserEmail = userEmail.trim().toLowerCase();
      return (item.targetEmails || []).some(
        e => e.trim().toLowerCase() === cleanUserEmail || e.trim().toLowerCase() === '*'
      );
    }

    if (item.targetType === 'TARGETED_PHONE') {
      if (!userPhone) return false;
      const cleanUserPhone = userPhone.replace(/\D/g, '');
      return (item.targetPhones || []).some(p => {
        const cleanTarget = p.replace(/\D/g, '');
        return cleanTarget && (cleanUserPhone.includes(cleanTarget) || cleanTarget.includes(cleanUserPhone));
      });
    }

    if (item.targetType === 'TARGETED_ROLE') {
      if (!userRole) return false;
      return (item.targetRoles || []).includes(userRole);
    }

    return true;
  }

  // Get active items for Front UI (filtered by placement, schedule, and user targeting)
  public getActiveBroadcasts(
    placement: BroadcastPlacement,
    userEmail?: string,
    userPhone?: string,
    userRole?: string
  ): BroadcastMediaItem[] {
    const now = new Date();
    return this.items
      .filter(item => item.placement === placement)
      .filter(item => this.isScheduleActive(item, now))
      .filter(item => this.isTargetMatch(item, userEmail, userPhone, userRole))
      .sort((a, b) => a.priorityOrder - b.priorityOrder);
  }

  // Create new item
  public createBroadcast(item: Omit<BroadcastMediaItem, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'clickCount'>): BroadcastMediaItem {
    const newItem: BroadcastMediaItem = {
      ...item,
      id: `broadcast-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      viewCount: 0,
      clickCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.items.push(newItem);
    this.save();
    return newItem;
  }

  // Update item
  public updateBroadcast(id: string, updates: Partial<BroadcastMediaItem>): BroadcastMediaItem | null {
    const index = this.items.findIndex(i => i.id === id);
    if (index === -1) return null;

    this.items[index] = {
      ...this.items[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.save();
    return this.items[index];
  }

  // Delete item
  public deleteBroadcast(id: string): boolean {
    const prevLen = this.items.length;
    this.items = this.items.filter(i => i.id !== id);
    if (this.items.length !== prevLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Toggle active status
  public toggleStatus(id: string): boolean {
    const item = this.items.find(i => i.id === id);
    if (!item) return false;
    item.isActive = !item.isActive;
    item.updatedAt = new Date().toISOString();
    this.save();
    return item.isActive;
  }

  // Track impressions
  public recordImpression(id: string): void {
    const item = this.items.find(i => i.id === id);
    if (item) {
      item.viewCount = (item.viewCount || 0) + 1;
      this.save(false);
    }
  }

  // Track clicks
  public recordClick(id: string): void {
    const item = this.items.find(i => i.id === id);
    if (item) {
      item.clickCount = (item.clickCount || 0) + 1;
      this.save(false);
    }
  }

  // Reset to demo presets
  public resetToDefaults(): void {
    this.items = [...INITIAL_DEFAULT_BROADCASTS];
    this.save();
  }
}

export const broadcastMediaEngine = new BroadcastMediaEngine();
