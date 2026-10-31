import React, { useState, useEffect } from 'react';
import { Navbar, ActiveTab } from './components/common/Navbar';
import { BottomNav } from './components/common/BottomNav';
import { MainCoinPriceBar } from './components/common/MainCoinPriceBar';
import { Footer } from './components/common/Footer';
import { PublicHomepage } from './components/public/PublicHomepage';
import { WalletView } from './components/wallet/WalletView';
import { ExplorerView } from './components/explorer/ExplorerView';
import { ExchangeView } from './components/exchange/ExchangeView';
import { TokensView } from './components/tokens/TokensView';
import { DeveloperSandbox } from './components/developer/DeveloperSandbox';
import { Top100HoldingsDashboard } from './components/dashboard/Top100HoldingsDashboard';
import { UserDashboardView } from './components/dashboard/UserDashboardView';
import { UserProfileView } from './components/profile/UserProfileView';
import { MarketsView } from './components/markets/MarketsView';
import { TransactionHistoryView } from './components/transactions/TransactionHistoryView';
import { BlueTixaView } from './components/blueTixa/BlueTixaView';
import { AuthModal } from './components/auth/AuthModal';
import { LanguageModal } from './components/common/LanguageModal';
import { FloatingTixaAiButton } from './components/tixaAi/FloatingTixaAiButton';
import { TixaAiDashboardModal } from './components/tixaAi/TixaAiDashboardModal';
import { FixDipozPageView } from './components/fixdipoz/FixDipozPageView';
import { CoinLiveDashboardPageView } from './components/markets/CoinLiveDashboardPageView';
import { NativeCoin } from './core/nativeMarketEngine';
import { PrivacyPolicyModal } from './components/common/PrivacyPolicyModal';
import { WelcomeAnnouncementModal } from './components/common/WelcomeAnnouncementModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { GoogleCalendarView } from './components/calendar/GoogleCalendarView';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { blockchainEngine } from './core/blockchainEngine';
import { authEngine } from './core/authEngine';

function AppContent() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [selectedTradePair, setSelectedTradePair] = useState<string>('TIXA_USDT');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalInitialMode, setAuthModalInitialMode] = useState<'login' | 'register'>('login');
  const [isTixaAiOpen, setIsTixaAiOpen] = useState(false);
  const [isPrivacyPolicyOpen, setIsPrivacyPolicyOpen] = useState(false);
  const [selectedNativeCoin, setSelectedNativeCoin] = useState<NativeCoin | null>(null);
  const { isLanguageModalOpen, setIsLanguageModalOpen } = useLanguage();
  const { isMinimalistMono } = useTheme();

  // Background interval to simulate live block creation every 4.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      blockchainEngine.proposeAndSealNextBlock();
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  // Detect referral parameter and admin portal parameter (?admin=login or #admin)
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const ref = urlParams.get('ref') || urlParams.get('affiliate') || urlParams.get('afilet');
      if (ref) {
        sessionStorage.setItem('tixa_pending_ref', ref.toUpperCase());
        if (!authEngine.getSession()) {
          openAuth('register');
        }
      }

      const adminParam = urlParams.get('admin') || urlParams.get('portal');
      if (adminParam === 'login' || adminParam === 'true' || adminParam === 'admin' || window.location.hash === '#admin') {
        setActiveTab('admin');
      }
    } catch {}
  }, []);

  const openAuth = (mode: 'login' | 'register') => {
    setAuthModalInitialMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleSelectPairForTrade = (pairId: string) => {
    setSelectedTradePair(pairId);
    setActiveTab('exchange');
  };

  // If activeTab is admin, render clean standalone admin portal with no user navigation or registration
  if (activeTab === 'admin') {
    return (
      <div className={`min-h-screen flex flex-col font-sans relative overflow-x-clip ${
        isMinimalistMono ? 'bg-[#09090b] text-zinc-100' : 'bg-[#030712] text-slate-100'
      }`}>
        {/* Background Grid Accent */}
        <div className="fixed inset-0 pointer-events-none z-0 bg-cyber-grid opacity-30" />

        {/* Dedicated Admin Header */}
        <header className="w-full bg-[#060c1c]/90 backdrop-blur-md border-b border-blue-500/30 px-6 py-4 flex items-center justify-between z-20 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-500/50 flex items-center justify-center text-blue-400 font-bold shadow-lg shadow-blue-500/20">
              🛡️
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-white font-mono tracking-wider">TIXAPAY SECURE ADMIN PORTAL</h1>
              <p className="text-[11px] text-slate-400 font-mono">Restricted Administrator Protocol & Governance Terminal</p>
            </div>
          </div>
          <button
            onClick={() => {
              window.location.href = window.location.pathname;
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold transition-all border border-slate-700 shadow-md flex items-center gap-2"
          >
            <span>Exit to User App</span>
          </button>
        </header>

        {/* Main Admin Content Area */}
        <main className="flex-1 w-full z-10 py-6">
          <AdminDashboard onOpenAuth={() => {}} />
        </main>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans relative overflow-x-clip pb-20 md:pb-24 transition-colors duration-200 ${
      isMinimalistMono 
        ? 'bg-[#09090b] text-zinc-100 selection:bg-white selection:text-black' 
        : 'bg-[#030712] text-slate-100 selection:bg-cyan-500 selection:text-black'
    }`}>
      {/* Background Grid Accent */}
      <div className={`fixed inset-0 pointer-events-none z-0 ${
        isMinimalistMono ? 'bg-cyber-grid opacity-25' : 'cyber-grid opacity-40'
      }`} />

      {/* Top Fixed Header with Global Ecosystem Branding */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={openAuth}
        onOpenFixDipoz={() => setActiveTab('fixdipoz')}
        onSelectPairForTrade={handleSelectPairForTrade}
      />

      {/* Always-Visible Native Coin Price & Global Ticker Bar */}
      <MainCoinPriceBar
        onTradeClick={() => setActiveTab('exchange')}
        onExploreClick={() => setActiveTab('markets')}
      />

      {/* Main View Area */}
      <main className="flex-1 w-full z-10">
        {activeTab === 'home' && (
          <PublicHomepage
            setActiveTab={setActiveTab}
            onOpenAuth={openAuth}
            onOpenFixDipoz={() => setActiveTab('fixdipoz')}
          />
        )}

        {activeTab === 'blue_tixa' && (
          <div className="pt-0">
            <BlueTixaView onCloseToMainApp={() => setActiveTab('home')} />
          </div>
        )}

        {activeTab === 'fixdipoz' && (
          <div className="pt-0">
            <FixDipozPageView onCloseToMainApp={() => setActiveTab('home')} />
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="pt-2">
            <UserDashboardView
              setActiveTab={setActiveTab}
              onOpenAuth={openAuth}
              onOpenFixDipoz={() => setActiveTab('fixdipoz')}
            />
          </div>
        )}

        {activeTab === 'holdings' && (
          <div className="pt-2">
            <Top100HoldingsDashboard
              onTradePair={(pair) => handleSelectPairForTrade(pair)}
              onViewExplorer={() => setActiveTab('explorer')}
            />
          </div>
        )}

        {activeTab === 'markets' && (
          <div className="pt-2">
            {selectedNativeCoin ? (
              <CoinLiveDashboardPageView
                coin={selectedNativeCoin}
                onCloseToMarkets={() => setSelectedNativeCoin(null)}
                onTradeNow={(sym) => {
                  setSelectedNativeCoin(null);
                  handleSelectPairForTrade(`${sym}_USDT`);
                }}
              />
            ) : (
              <MarketsView
                onSelectPair={(pairId) => handleSelectPairForTrade(pairId)}
                onSelectNativeCoin={(coin) => setSelectedNativeCoin(coin)}
              />
            )}
          </div>
        )}

        {activeTab === 'exchange' && (
          <div className="pt-2">
            <ExchangeView
              selectedPairId={selectedTradePair}
              onSelectPair={setSelectedTradePair}
              onOpenAuth={openAuth}
            />
          </div>
        )}

        {activeTab === 'wallet' && (
          <div className="pt-2">
            <WalletView
              onOpenAuth={openAuth}
              onGoToTrade={() => setActiveTab('exchange')}
              onOpenFixDipoz={() => setActiveTab('fixdipoz')}
            />
          </div>
        )}

        {activeTab === 'explorer' && (
          <div className="pt-2">
            <ExplorerView />
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="pt-2">
            <TransactionHistoryView
              onViewInExplorer={() => setActiveTab('explorer')}
              onGoToTrade={() => setActiveTab('exchange')}
            />
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="pt-2">
            <UserProfileView
              setActiveTab={setActiveTab}
              onOpenAuth={openAuth}
            />
          </div>
        )}

        {activeTab === 'tokens' && (
          <div className="pt-2">
            <TokensView />
          </div>
        )}

        {activeTab === 'developer' && (
          <div className="pt-2">
            <DeveloperSandbox />
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="pt-2">
            <GoogleCalendarView />
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="pt-2">
            <AdminDashboard onOpenAuth={(mode) => openAuth(mode)} />
          </div>
        )}
      </main>

      {/* Global Footer */}
      <Footer
        setActiveTab={setActiveTab}
        onOpenWhitepaper={() => setActiveTab('home')}
        onOpenPrivacyPolicy={() => setIsPrivacyPolicyOpen(true)}
      />

      {/* Fixed Permanent Bottom Navigation Shell */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Global Non-Custodial Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalInitialMode}
        onSuccess={() => {
          setIsAuthModalOpen(false);
          setActiveTab('dashboard');
        }}
      />

      {/* 99 Languages Global Selection Modal */}
      <LanguageModal
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
      />

      {/* Persistent Swappable / Draggable TIXA AI Support Button (Floats Globally) */}
      <FloatingTixaAiButton
        onOpenDashboard={() => setIsTixaAiOpen(true)}
      />

      {/* TIXA AI 33-Language Multimodal & Image Analysis Chat Dashboard Modal */}
      <TixaAiDashboardModal
        isOpen={isTixaAiOpen}
        onClose={() => setIsTixaAiOpen(false)}
        onOpenAuth={openAuth}
        onNavigateTab={(tab) => setActiveTab(tab as any)}
      />

      {/* TIXA Privacy Policy & Non-Custodial Wallet Security Modal */}
      <PrivacyPolicyModal
        isOpen={isPrivacyPolicyOpen}
        onClose={() => setIsPrivacyPolicyOpen(false)}
      />

      {/* Visitor Welcome Announcement Modal for Login / Registration */}
      <WelcomeAnnouncementModal
        onOpenAuth={openAuth}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}
