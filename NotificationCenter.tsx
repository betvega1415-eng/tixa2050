import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowLeftRight, 
  ShieldAlert, 
  ShieldCheck, 
  Megaphone, 
  Info, 
  UserCheck, 
  X,
  ExternalLink
} from 'lucide-react';
import { notificationEngine, AppNotification, NotificationType } from '../../core/notificationEngine';
import { useLanguage } from '../../context/LanguageContext';

interface NotificationCenterProps {
  onNavigate?: (tab: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<AppNotification[]>(notificationEngine.getNotifications());
  const [unreadCount, setUnreadCount] = useState<number>(notificationEngine.getUnreadCount());
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      setNotifications(notificationEngine.getNotifications());
      setUnreadCount(notificationEngine.getUnreadCount());
    };
    const unsub = notificationEngine.subscribe(update);
    return unsub;
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'DEPOSIT_RECEIVED':
        return <ArrowDownLeft className="w-4 h-4 text-emerald-400" />;
      case 'WITHDRAWAL_REQUEST':
      case 'WITHDRAWAL_COMPLETED':
        return <ArrowUpRight className="w-4 h-4 text-cyan-400" />;
      case 'TRADE_EXECUTED':
        return <ArrowLeftRight className="w-4 h-4 text-amber-400" />;
      case 'SECURITY_ALERT':
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      case 'LOGIN_ALERT':
        return <UserCheck className="w-4 h-4 text-purple-400" />;
      case 'SYSTEM_ANNOUNCEMENT':
        return <Megaphone className="w-4 h-4 text-blue-400" />;
      case 'ADMIN_MESSAGE':
      default:
        return <Info className="w-4 h-4 text-indigo-400" />;
    }
  };

  const formatTime = (timestamp: number) => {
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        type="button"
        id="notification-bell-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-slate-900/80 border border-slate-700/60 hover:border-cyan-500/40 text-slate-300 hover:text-white transition-all shadow-sm"
        aria-label="Notifications"
      >
        <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-3.5 min-w-3.5 sm:h-4 sm:min-w-4 px-1 items-center justify-center rounded-full bg-cyan-500 text-black font-extrabold text-[9px] sm:text-[10px] ring-2 ring-[#050814] animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#080d1e] border border-cyan-500/30 shadow-2xl shadow-cyan-950/80 p-0 z-50 overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="px-4 py-3 bg-[#0c142b] border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm font-heading">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 text-[10px] font-mono border border-cyan-800">
                  {unreadCount} unread
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => notificationEngine.markAllAsRead()}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-800/60 transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Read all</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => notificationEngine.clearAll()}
                className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-800/60 transition-colors"
                title="Clear all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800/60"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-800/60 custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-slate-500 text-xs font-mono space-y-2">
                <Bell className="w-8 h-8 mx-auto text-slate-600 opacity-50" />
                <p>No notifications yet</p>
                <p className="text-[10px] text-slate-600">Transactions and alerts will appear here</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => notificationEngine.markAsRead(n.id)}
                  className={`p-3.5 flex gap-3 text-left transition-colors cursor-pointer ${
                    n.read ? 'bg-transparent hover:bg-slate-900/40 opacity-75' : 'bg-cyan-950/20 hover:bg-cyan-950/30'
                  }`}
                >
                  <div className="flex-shrink-0 mt-0.5 p-2 rounded-xl bg-slate-900 border border-slate-800">
                    {getIcon(n.type)}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-xs font-bold truncate ${n.read ? 'text-slate-300' : 'text-white'}`}>
                        {n.title}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-500 whitespace-nowrap">
                        {formatTime(n.timestamp)}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed break-words">
                      {n.message}
                    </p>

                    {!n.read && (
                      <div className="pt-1 flex items-center justify-between">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                        <span className="text-[9px] font-mono text-cyan-400/80">Click to mark read</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Note */}
          <div className="px-4 py-2 bg-[#060a17] border-t border-slate-800 text-[10px] font-mono text-slate-500 flex items-center justify-between">
            <span>TIXA Protocol Event Stream</span>
            <span className="text-cyan-400/80">Real-Time WebSocket/RPC</span>
          </div>
        </div>
      )}
    </div>
  );
};
