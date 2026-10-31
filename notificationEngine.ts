export type NotificationType = 
  | 'DEPOSIT_RECEIVED' 
  | 'WITHDRAWAL_REQUEST' 
  | 'WITHDRAWAL_COMPLETED' 
  | 'TRADE_EXECUTED' 
  | 'LOGIN_ALERT' 
  | 'SECURITY_ALERT' 
  | 'SYSTEM_ANNOUNCEMENT' 
  | 'ADMIN_MESSAGE';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

const STORAGE_NOTIFICATIONS_KEY = 'tixa_notifications_v1';

export class NotificationEngine {
  private static instance: NotificationEngine;
  private notifications: AppNotification[] = [];
  private listeners: Array<() => void> = [];

  private constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): NotificationEngine {
    if (!NotificationEngine.instance) {
      NotificationEngine.instance = new NotificationEngine();
    }
    return NotificationEngine.instance;
  }

  private loadFromStorage() {
    try {
      const data = localStorage.getItem(STORAGE_NOTIFICATIONS_KEY);
      if (data) {
        this.notifications = JSON.parse(data);
      } else {
        this.seedInitialNotifications();
      }
    } catch (e) {
      this.seedInitialNotifications();
    }
  }

  private seedInitialNotifications() {
    const now = Date.now();
    this.notifications = [
      {
        id: 'notif_welcome_01',
        type: 'SYSTEM_ANNOUNCEMENT',
        title: 'Welcome to TIXAPAY Ecosystem',
        message: 'Your non-custodial cryptographic vault is active. Live market trading, on-chain ledger, and Top 100 Treasuries are online.',
        timestamp: now - 3600000 * 2,
        read: false
      },
      {
        id: 'notif_faucet_02',
        type: 'DEPOSIT_RECEIVED',
        title: 'Genesis Liquidity Vault Credited',
        message: 'Received 1,250.00 TIXA and 10,000.00 USDX to your on-chain vault address.',
        timestamp: now - 3600000 * 5,
        read: false
      },
      {
        id: 'notif_sec_03',
        type: 'SECURITY_ALERT',
        title: 'Account Security Shield Active',
        message: 'Your account is protected by cryptographic end-to-end encryption and smart contract validation.',
        timestamp: now - 3600000 * 12,
        read: true
      },
      {
        id: 'notif_treasury_04',
        type: 'ADMIN_MESSAGE',
        title: 'Top 100 Companies Holdings Live',
        message: 'Apple, BlackRock, NVIDIA, Temasek and 96 other treasuries proof-of-reserves updated with real-time on-chain hashes.',
        timestamp: now - 3600000 * 24,
        read: true
      }
    ];
    this.saveToStorage();
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_NOTIFICATIONS_KEY, JSON.stringify(this.notifications));
    } catch (e) {
      console.warn('Failed to persist notifications', e);
    }
  }

  public getNotifications(): AppNotification[] {
    return [...this.notifications].sort((a, b) => b.timestamp - a.timestamp);
  }

  public getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  public markAsRead(id: string) {
    const item = this.notifications.find(n => n.id === id);
    if (item) {
      item.read = true;
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  public markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.saveToStorage();
    this.notifyListeners();
  }

  public deleteNotification(id: string) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.saveToStorage();
    this.notifyListeners();
  }

  public clearAll() {
    this.notifications = [];
    this.saveToStorage();
    this.notifyListeners();
  }

  public addNotification(type: NotificationType, title: string, message: string, metadata?: Record<string, any>): AppNotification {
    const newNotif: AppNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type,
      title,
      message,
      timestamp: Date.now(),
      read: false,
      metadata
    };
    this.notifications.unshift(newNotif);
    // Keep max 50
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }
    this.saveToStorage();
    this.notifyListeners();
    return newNotif;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(l => l());
  }
}

export const notificationEngine = NotificationEngine.getInstance();
