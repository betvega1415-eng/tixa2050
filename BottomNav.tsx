import React from 'react';
import { 
  Home, 
  TrendingUp, 
  ArrowLeftRight, 
  Wallet, 
  User
} from 'lucide-react';
import { ActiveTab } from './Navbar';
import { useLanguage } from '../../context/LanguageContext';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const { t } = useLanguage();

  const items: { id: ActiveTab; label: string; icon: React.ElementType }[] = [
    { id: 'home', label: t('nav_home', 'Home'), icon: Home },
    { id: 'markets', label: t('nav_markets', 'Markets'), icon: TrendingUp },
    { id: 'exchange', label: t('nav_trading', 'Trade'), icon: ArrowLeftRight },
    { id: 'wallet', label: t('nav_wallet', 'Wallet'), icon: Wallet },
    { id: 'profile', label: t('nav_profile', 'Profile'), icon: User }
  ];

  return (
    <nav 
      id="fixed-bottom-navigation" 
      aria-label="Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#050814]/95 backdrop-blur-2xl border-t border-cyan-500/25 shadow-[0_-8px_25px_rgba(0,0,0,0.7)] px-1 sm:px-4 py-1.5"
    >
      <div className="max-w-lg md:max-w-2xl mx-auto flex items-center justify-around gap-1">
        {items.map(item => {
          const Icon = item.icon;
          const isActive = 
            item.id === activeTab || 
            (item.id === 'profile' && activeTab === 'dashboard');

          return (
            <button
              key={item.id}
              id={`bottom-nav-${item.id}`}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-2.5 sm:px-4 rounded-2xl transition-all duration-200 group ${
                isActive
                  ? 'text-cyan-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/20 to-blue-500/5 rounded-2xl border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.3)]" />
              )}

              <div className="relative z-10 flex flex-col items-center gap-0.5">
                <div className={`p-0.5 rounded-xl transition-transform duration-200 ${
                  isActive ? 'scale-110 text-cyan-400' : 'group-hover:scale-105'
                }`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className={`text-[10px] sm:text-[11px] font-mono font-semibold tracking-wide ${
                  isActive ? 'text-white font-bold' : 'text-slate-400'
                }`}>
                  {item.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

