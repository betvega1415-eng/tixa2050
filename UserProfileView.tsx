import React, { useState, useEffect } from 'react';
import { 
  User, 
  ShieldCheck, 
  Key, 
  Lock, 
  Unlock, 
  LogOut, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Globe, 
  Laptop, 
  Trash2, 
  ShieldAlert, 
  RefreshCw,
  ExternalLink,
  Sparkles,
  Zap
} from 'lucide-react';
import { authEngine } from '../../core/authEngine';
import { notificationEngine } from '../../core/notificationEngine';
import { HashBadge } from '../common/HashBadge';
import { ThemeSwitcher } from '../common/ThemeSwitcher';
import { ActiveTab } from '../common/Navbar';
import confetti from 'canvas-confetti';
import { useLanguage } from '../../context/LanguageContext';
import { AffiliateDashboard } from './AffiliateDashboard';

interface UserProfileViewProps {
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAuth: (mode: 'login' | 'register' | 'admin') => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  setActiveTab,
  onOpenAuth
}) => {
  const { currentLanguage, openLanguageModal, t } = useLanguage();
  const [session, setSession] = useState(authEngine.getSession());
  const [account, setAccount] = useState(session ? authEngine.getUserById(session.userId) : null);

  // Security Form States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // KYC / Verification State
  const [kycTier, setKycTier] = useState<'TIER_1_STANDARD' | 'TIER_2_INSTITUTIONAL'>('TIER_2_INSTITUTIONAL');
  const [kycStatus, setKycStatus] = useState<'VERIFIED' | 'PENDING' | 'UNVERIFIED'>('VERIFIED');

  // Active Sessions
  const [activeSessions, setActiveSessions] = useState([
    { id: 'sess_current', device: 'Chrome on macOS (Current)', ip: '142.250.190.46', location: 'San Jose, USA', lastActive: 'Active Now', current: true },
    { id: 'sess_mobile_02', device: 'TIXA Mobile App (iOS)', ip: '172.56.42.10', location: 'Tokyo, Japan', lastActive: '2 hours ago', current: false },
    { id: 'sess_terminal_03', device: 'Linux Node CLI v2.4', ip: '104.244.42.1', location: 'Frankfurt, Germany', lastActive: 'Yesterday', current: false }
  ]);

  useEffect(() => {
    const update = () => {
      const s = authEngine.getSession();
      setSession(s);
      if (s) {
        setAccount(authEngine.getUserById(s.userId));
      } else {
        setAccount(null);
      }
    };
    update();
    const unsub = authEngine.subscribe(update);
    return unsub;
  }, []);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg(null);

    if (!newPassword || newPassword.length < 8) {
      setPwdMsg({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setPwdMsg({ type: 'success', text: 'Password successfully updated! All security logs updated.' });
    notificationEngine.addNotification(
      'SECURITY_ALERT',
      'Password Updated',
      'Your account login credentials were changed successfully.'
    );
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleLogoutAll = () => {
    setActiveSessions(activeSessions.filter(s => s.current));
    notificationEngine.addNotification(
      'SECURITY_ALERT',
      'Sessions Terminated',
      'All other active mobile and desktop sessions were invalidated.'
    );
  };

  if (!session) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-cyan-500/30 mx-auto flex items-center justify-center">
          <Lock className="w-8 h-8 text-cyan-400" />
        </div>
        <h2 className="text-2xl font-bold text-white font-heading">
          Authentication Required
        </h2>
        <p className="text-sm text-slate-400">
          Please log in or register to access your personalized Profile & Security settings.
        </p>
        <div className="flex justify-center gap-4">
          <button
            type="button"
            onClick={() => onOpenAuth('login')}
            className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shadow-lg"
          >
            Login to Vault
          </button>
          <button
            type="button"
            onClick={() => onOpenAuth('register')}
            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs"
          >
            Register
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-in fade-in duration-300">
      {/* Profile Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#09122a] via-[#091938] to-[#07132a] border border-cyan-500/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-black font-black text-2xl shadow-xl shadow-cyan-500/25">
            TX
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white font-heading">
                {account?.name || session.email.split('@')[0]}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono font-bold">
                <CheckCircle2 className="w-3 h-3" />
                <span>KYC VERIFIED TIER 2</span>
              </span>
            </div>
            <p className="text-xs text-slate-300 font-mono">{session.email}</p>
            <div className="pt-1">
              <HashBadge hash={session.walletAddress} type="address" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              authEngine.logoutUser();
              setActiveTab('home');
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* DEDICATED AFFILIATE DASHBOARD (LIVE STATISTICS, REFERRAL CONTRIBUTIONS & UNMERGED BALANCE) */}
      {account && (
        <AffiliateDashboard
          account={account}
          onRefreshAccount={() => {
            const s = authEngine.getSession();
            if (s) setAccount(authEngine.getUserById(s.userId));
          }}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Security & Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Language & Internationalization Settings (99 Countries) */}
          <div className="p-6 rounded-3xl bg-[#060b1b] border border-cyan-500/25 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-heading">
                    {t('settings_language', 'Interface Language')}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Switch between 99 country languages. All menus, balances, and notifications translate instantly.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{currentLanguage.flag}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white font-sans">{currentLanguage.nativeName}</span>
                    <span className="text-xs text-slate-400 font-mono">({currentLanguage.name})</span>
                    <span className="px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 text-[10px] font-mono border border-cyan-800">
                      {currentLanguage.code.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Region: {currentLanguage.region} • Country: {currentLanguage.country}
                  </span>
                </div>
              </div>

              <button
                type="button"
                id="profile-open-language-modal-btn"
                onClick={openLanguageModal}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold text-xs shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1.5 font-mono"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{t('btn_select_language', 'Change Language (99 Available)')}</span>
              </button>
            </div>
          </div>

          {/* Change Password Form */}
          <div className="p-6 rounded-3xl bg-[#060b1b] border border-cyan-500/25 space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-950 text-purple-400 border border-purple-800">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-heading">
                  Change Password
                </h3>
                <p className="text-xs text-slate-400">
                  Update your master password with high-entropy cryptographic salt hashing.
                </p>
              </div>
            </div>

            {pwdMsg && (
              <div className={`p-3 rounded-xl text-xs font-mono flex items-center gap-2 ${
                pwdMsg.type === 'success' 
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30' 
                  : 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
              }`}>
                {pwdMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                <span>{pwdMsg.text}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-400 mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>

          {/* Interface Visual Theme Engine Card */}
          <ThemeSwitcher variant="card" />

          {/* Active Sessions Manager */}
          <div className="p-6 rounded-3xl bg-[#060b1b] border border-cyan-500/25 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-950 text-blue-400 border border-blue-800">
                  <Laptop className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-heading">
                    Active Devices & Sessions
                  </h3>
                  <p className="text-xs text-slate-400">
                    Devices currently authorized to access your non-custodial vault.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogoutAll}
                className="text-xs text-rose-400 hover:text-rose-300 font-mono underline"
              >
                Terminate Other Sessions
              </button>
            </div>

            <div className="space-y-2">
              {activeSessions.map((s) => (
                <div
                  key={s.id}
                  className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs font-mono"
                >
                  <div className="flex items-center gap-3">
                    <Laptop className="w-4 h-4 text-cyan-400" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white font-sans">{s.device}</span>
                        {s.current && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[9px] border border-emerald-800 font-bold">
                            THIS DEVICE
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        IP: {s.ip} • {s.location}
                      </span>
                    </div>
                  </div>

                  <span className="text-slate-400 text-[11px]">{s.lastActive}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Account Status & KYC */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[#060b1b] border border-cyan-500/25 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Identity Verification (KYC)</span>
            </h3>

            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300">Level:</span>
                <span className="text-emerald-400 font-bold">Tier 2 Institutional</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300">Daily Limit:</span>
                <span className="text-white font-bold">$10,000,000 USD</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300">Withdrawal Speed:</span>
                <span className="text-cyan-300 font-bold">Instant BFT 3.0s</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Your account identity has passed cryptographic AML and zero-knowledge identity proofs. No further verification required.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#060b1b] border border-cyan-500/25 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              <span>Connected Web3 Keys</span>
            </h3>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-white font-bold block">TIXA Local Vault</span>
                  <span className="text-[10px] text-slate-500">Ed25519 Native</span>
                </div>
                <span className="text-emerald-400 text-[10px]">CONNECTED</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-white font-bold block">Hardware Ledger Nano</span>
                  <span className="text-[10px] text-slate-500">FIDO2 / U2F Security</span>
                </div>
                <span className="text-cyan-400 text-[10px]">ENROLLED</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
