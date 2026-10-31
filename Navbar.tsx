import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Wallet, 
  Compass, 
  ArrowLeftRight, 
  Coins, 
  Terminal, 
  LayoutDashboard, 
  Globe, 
  Menu, 
  X, 
  Zap, 
  ChevronDown,
  User,
  LogOut,
  Sparkles,
  Layers,
  Lock,
  TrendingUp,
  History,
  ShieldCheck,
  Building2,
  Calendar
} from 'lucide-react';
import { blockchainEngine } from '../../core/blockchainEngine';
import { authEngine } from '../../core/authEngine';
import { exchangeEngine } from '../../core/exchangeEngine';
import { NetworkStats, NetworkEnvironment } from '../../types/blockchain';
import { HashBadge } from './HashBadge';
import { NotificationCenter } from './NotificationCenter';
import { LanguageSelectorButton } from './LanguageSelectorButton';
import { SoundToggleButton } from './SoundToggleButton';
import { ThemeSwitcher } from './ThemeSwitcher';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

export type ActiveTab = 
  | 'home' 
  | 'markets'
  | 'exchange' 
  | 'wallet' 
  | 'explorer' 
  | 'transactions'
  | 'dashboard'
  | 'holdings'
  | 'profile'
  | 'tokens' 
  | 'developer' 
  | 'admin'
  | 'blue_tixa'
  | 'fixdipoz'
  | 'calendar';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAuth: (mode: 'login' | 'register' | 'admin') => void;
  onOpenFixDipoz: () => void;
  onSelectPairForTrade?: (pairId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAuth,
  onOpenFixDipoz
}) => {
  const { t, openLanguageModal } = useLanguage();
  const [stats, setStats] = useState<NetworkStats>(blockchainEngine.getStats());
  const [networkEnv, setNetworkEnv] = useState<NetworkEnvironment>(blockchainEngine.getNetworkEnv());
  const [userSession, setUserSession] = useState(authEngine.getSession());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNetworkDropdownOpen, setIsNetworkDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  // User live balance
  const [userBalance, setUserBalance] = useState<number>(() => {
    const s = authEngine.getSession();
    return s ? blockchainEngine.getBalance(s.walletAddress) : 1250;
  });

  useEffect(() => {
    const unsubChain = blockchainEngine.subscribe(() => {
      setStats(blockchainEngine.getStats());
      setNetworkEnv(blockchainEngine.getNetworkEnv());
      const s = authEngine.getSession();
      if (s) {
        setUserBalance(blockchainEngine.getBalance(s.walletAddress));
      }
    });

    const unsubAuth = authEngine.subscribe(() => {
      const s = authEngine.getSession();
      setUserSession(s);
      if (s) {
        setUserBalance(blockchainEngine.getBalance(s.walletAddress));
      }
    });

    return () => {
      unsubChain();
      unsubAuth();
    };
  }, []);

  const handleNetworkChange = (env: NetworkEnvironment) => {
    blockchainEngine.setNetworkEnv(env);
    setIsNetworkDropdownOpen(false);
  };

  const navItems: { id: ActiveTab; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'home', label: t('nav_home', 'Home'), icon: Globe },
    { id: 'markets', label: t('nav_markets', 'Markets'), icon: TrendingUp },
    { id: 'exchange', label: t('nav_trading', 'Trading'), icon: ArrowLeftRight },
    { id: 'wallet', label: t('nav_wallet', 'Wallet'), icon: Wallet },
    { id: 'explorer', label: t('nav_explorer', 'Blockchain'), icon: Compass },
    { id: 'transactions', label: t('nav_transactions', 'Transactions'), icon: History },
    { id: 'holdings', label: t('nav_holdings', 'Top 100 & 2050 Goals'), icon: Building2, badge: 'LIVE' },
    { id: 'calendar', label: t('nav_calendar', 'Calendar'), icon: Calendar },
    { id: 'developer', label: t('nav_developer', 'Dev Tools'), icon: Terminal }
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-cyan-500/20 bg-[#050814]/95 backdrop-blur-xl">
        {/* Top Ticker Bar */}
        <div className="hidden lg:flex items-center justify-between px-6 py-1.5 bg-[#03060d] border-b border-slate-800/80 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-slate-300 font-semibold">TIXA NETWORK NODE</span>
              <span className="text-emerald-400 font-bold">{t('net_online', 'ONLINE')}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">{t('net_block', 'BLOCK')}:</span>
              <span className="text-cyan-400 font-bold">#{stats.blockHeight}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">{t('net_tps', 'TPS')}:</span>
              <span className="text-slate-200 font-medium">142.5 (PEAK 12.5K)</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">{t('net_finality', 'FINALITY')}:</span>
              <span className="text-cyan-300 font-medium">3.0s (BFT/PoS)</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">{t('net_gas', 'GAS')}:</span>
              <span className="text-amber-400">1.2 Gwei</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">{t('net_total_burned', 'TOTAL BURNED')}:</span>
              <span className="text-rose-400 font-medium">{stats.totalBurned.toFixed(2)} TIXA</span>
            </div>
            <div className="h-3 w-px bg-slate-800"></div>
            <div className="text-cyan-400/90 font-medium">
              {t('net_protocol', 'TIXAPAY PROTOCOL v2.4')}
            </div>
          </div>
        </div>

        {/* Main Navigation Bar */}
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Brand Logo */}
            <div 
              className="flex items-center gap-2 sm:gap-3 cursor-pointer group shrink-0"
              onClick={() => setActiveTab('home')}
              id="brand-logo-btn"
            >
              <div className="relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-900 p-0.5 shadow-md sm:shadow-lg shadow-cyan-500/25 group-hover:shadow-cyan-400/40 transition-all duration-300">
                <div className="w-full h-full bg-[#050814] rounded-[6px] sm:rounded-[10px] flex items-center justify-center">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <span className="text-base sm:text-xl font-black tracking-wider text-white font-heading">
                    TIXA
                  </span>
                  <span className="px-1 sm:px-1.5 py-0.2 rounded bg-gradient-to-r from-cyan-400 to-blue-500 text-[9px] sm:text-[10px] font-black text-black tracking-wider font-mono">
                    PAY
                  </span>
                </div>
                <p className="text-[8px] sm:text-[10px] text-cyan-400/80 tracking-wider sm:tracking-widest font-mono uppercase hidden xs:block">
                  Web3 Ecosystem
                </p>
              </div>
            </div>

            {/* Desktop Nav Items */}
            <nav className="hidden xl:flex items-center gap-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-item-${item.id}`}
                    onClick={() => setActiveTab(item.id)}
                    className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                      isActive
                        ? 'text-cyan-300 bg-cyan-950/60 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/40 border border-transparent'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="text-[8px] px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}

              {/* FIXDIPOZ VIP Box Button */}
              <button
                type="button"
                id="navbar-fixdipoz-btn"
                onClick={onOpenFixDipoz}
                className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-black bg-gradient-to-r from-cyan-400 via-emerald-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 shadow-md shadow-cyan-500/30 transition-all shrink-0 animate-pulse"
              >
                <Zap className="w-3.5 h-3.5 fill-black" />
                <span>FIXDIPOZ</span>
                <span className="text-[8px] px-1 py-0.2 rounded bg-black text-cyan-300 font-mono">
                  33 BOX
                </span>
              </button>

              <button
                type="button"
                id="navbar-admin-btn"
                onClick={() => setActiveTab('admin')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-purple-200 bg-purple-950/70 hover:bg-purple-900/90 border border-purple-500/50 shadow-md shadow-purple-950/40 transition-all shrink-0"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                <span>Admin Portal</span>
              </button>
            </nav>

            {/* Right Action Bar */}
            <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
              {/* Visual Theme Switcher (Cyber Blue vs Minimalist Mono) */}
              <ThemeSwitcher variant="navbar" />

              {/* Modern Click & Audio Sound Effects Toggle Button */}
              <SoundToggleButton variant="navbar" />

              {/* Language Selector Button (Requirement: Support for 99 Country Languages) */}
              <LanguageSelectorButton variant="navbar" />

              {/* Notification Center */}
              <NotificationCenter onNavigate={(tab) => setActiveTab(tab as ActiveTab)} />

              {/* Mainnet Production Network Indicator */}
              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-xs font-mono text-slate-200">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </div>
                <span className="text-[11px] font-bold text-white tracking-wide">
                  {t('net_mainnet', 'TIXA MAINNET')}
                </span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/80">
                  v2.4
                </span>
              </div>

              {/* Auth / Account Profile / Balance */}
              {userSession ? (
                <div className="relative">
                  <button
                    type="button"
                    id="user-profile-menu-btn"
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center gap-1 sm:gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-cyan-950/80 to-blue-950/80 border border-cyan-500/40 text-xs font-mono text-cyan-300 hover:border-cyan-400 transition-all shadow-md shadow-cyan-950/50"
                  >
                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-black font-bold text-[9px] sm:text-[10px]">
                      TX
                    </div>
                    {/* Live Wallet Balance in Header */}
                    <div className="hidden sm:flex flex-col text-left">
                      <span className="text-[11px] font-bold text-white leading-tight">
                        {userBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TIXA
                      </span>
                      <span className="text-[9px] text-cyan-400/80 leading-tight">
                        ≈ ${(userBalance * 142.85).toLocaleString('en-US', { maximumFractionDigits: 0 })} USD
                      </span>
                    </div>
                    <ChevronDown className="w-3 h-3 text-cyan-400 ml-0.5" />
                  </button>

                  {isUserDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#090e1f] border border-cyan-500/30 shadow-2xl p-2 z-50 text-xs">
                      <div className="px-3 py-2 border-b border-slate-800">
                        <p className="text-[10px] text-slate-400">Connected Vault</p>
                        <p className="font-semibold text-slate-100 truncate">{userSession?.email}</p>
                        <div className="mt-1">
                          <HashBadge hash={userSession?.walletAddress || ''} type="address" />
                        </div>
                      </div>

                      <div className="py-1">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('dashboard');
                            setIsUserDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-left text-slate-200 hover:bg-slate-800/60 rounded-xl"
                        >
                          <LayoutDashboard className="w-4 h-4 text-cyan-400" />
                          <span>{t('nav_dashboard', 'My Dashboard')}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('wallet');
                            setIsUserDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-left text-slate-200 hover:bg-slate-800/60 rounded-xl"
                        >
                          <Wallet className="w-4 h-4 text-blue-400" />
                          <span>{t('nav_wallet', 'My Wallet')}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('profile');
                            setIsUserDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-left text-slate-200 hover:bg-slate-800/60 rounded-xl"
                        >
                          <User className="w-4 h-4 text-emerald-400" />
                          <span>{t('nav_profile', 'Security & Profile')}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('transactions');
                            setIsUserDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-left text-slate-200 hover:bg-slate-800/60 rounded-xl"
                        >
                          <History className="w-4 h-4 text-purple-400" />
                          <span>{t('nav_transactions', 'Transaction History')}</span>
                        </button>
                        <div className="border-t border-slate-800 my-1"></div>
                        <button
                          type="button"
                          onClick={() => {
                            authEngine.logoutUser();
                            setIsUserDropdownOpen(false);
                            setActiveTab('home');
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-left text-rose-400 hover:bg-rose-950/40 rounded-xl"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>{t('btn_logout', 'Sign Out')}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <button
                    type="button"
                    id="navbar-sign-in-btn"
                    onClick={() => onOpenAuth('login')}
                    className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 transition-colors shrink-0"
                  >
                    {t('btn_login', 'Login')}
                  </button>
                  <button
                    type="button"
                    id="navbar-create-wallet-btn"
                    onClick={() => onOpenAuth('register')}
                    className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold text-black bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 shadow-md shadow-cyan-500/25 transition-all shrink-0"
                  >
                    <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span>{t('btn_signup', 'Sign Up')}</span>
                  </button>
                </div>
              )}



              {/* Mobile menu trigger */}
              <button
                type="button"
                id="mobile-menu-trigger"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="xl:hidden p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800 shrink-0"
              >
                {isMobileMenuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="xl:hidden border-t border-slate-800 bg-[#050814] px-4 pt-3 pb-6 space-y-1">
            {/* Mobile Language, Sound & Theme Switchers */}
            <div className="pb-2.5 mb-2 border-b border-slate-800/80 space-y-2">
              <ThemeSwitcher variant="drawer" />
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 text-xs font-mono text-slate-400">
                  <span>Sound FX:</span>
                  <SoundToggleButton variant="compact" />
                </div>
                <LanguageSelectorButton variant="compact" />
              </div>
            </div>

            {/* Mobile FIXDIPOZ Button */}
            <div className="pb-2 mb-2 border-b border-slate-800/80">
              <button
                type="button"
                id="mobile-fixdipoz-btn"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenFixDipoz();
                }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-mono font-black text-black bg-gradient-to-r from-cyan-400 via-emerald-400 to-blue-500 shadow-md"
              >
                <div className="flex items-center gap-2.5">
                  <Zap className="w-4 h-4 fill-black" />
                  <span>FIXDIPOZ VIP MINING (33 BOX)</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-black text-cyan-300 font-mono">
                  ACTIVE
                </span>
              </button>
            </div>

            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'text-cyan-300 bg-cyan-950/50 border border-cyan-500/40'
                      : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </header>
    </>
  );
};

