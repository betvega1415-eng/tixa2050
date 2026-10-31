import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  FileText, 
  UserCheck, 
  Server, 
  Smartphone, 
  EyeOff, 
  Copy, 
  Check, 
  QrCode, 
  ArrowDown, 
  ExternalLink,
  HelpCircle,
  Cpu,
  Database,
  Wallet
} from 'lucide-react';
import { soundEngine } from '../../core/soundEngine';
import confetti from 'canvas-confetti';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  const [accepted, setAccepted] = useState(false);
  const [copied, setCopied] = useState(false);
  const sampleAddress = "0xA8F2bC4918ef92F1834bC09210e";

  if (!isOpen) return null;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(sampleAddress);
    setCopied(true);
    soundEngine.play('success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleContinue = () => {
    if (!accepted) return;
    soundEngine.play('success');
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#080c19] border border-cyan-500/40 rounded-3xl shadow-2xl shadow-cyan-500/20 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-cyan-950/90 via-[#060a17] to-blue-950/90 border-b border-cyan-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-600 text-black shadow-lg shadow-cyan-500/30">
              <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">TIXA PRIVACY POLICY & SECURITY CENTER</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-mono text-xs font-bold">
                  NON-CUSTODIAL
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Your Privacy. Your Wallet. Your Control. • Official TIXA Cryptographic Security Protocol
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-8 text-slate-300">
          
          {/* 1 & 2. HERO SECTION */}
          <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-cyan-950/30 to-slate-950 border border-cyan-500/40 overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>🔐 NON-CUSTODIAL WALLET ARCHITECTURE</span>
              </div>
              
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                TIXA PRIVACY POLICY
              </h1>
              <p className="text-base sm:text-lg font-bold text-cyan-300 font-mono">
                Your Privacy. Your Wallet. Your Control.
              </p>
              
              <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
                «TIXA is designed to protect user privacy and provide users with meaningful control over their account and non-custodial wallet credentials.»
              </p>
            </div>
          </div>

          {/* 3. IMPORTANT WALLET NOTICE */}
          <div className="p-5 sm:p-6 rounded-2xl bg-amber-950/40 border border-amber-500/60 shadow-lg space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm sm:text-base font-mono">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              <span>🔐 IMPORTANT SECURITY NOTICE</span>
            </div>
            <p className="text-xs sm:text-sm text-amber-200/90 leading-relaxed">
              «Your TIXA wallet is designed to be non-custodial. Your private key and recovery phrase are intended to remain under your control and must never be shared with anyone.»
            </p>
            <div className="pt-2 border-t border-amber-500/30 space-y-1.5">
              <div className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span>⚠️ TIXA SUPPORT WILL NEVER ASK FOR YOUR:</span>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono text-xs font-black">
                <li className="p-2.5 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 text-center shadow-inner">
                  PRIVATE KEY
                </li>
                <li className="p-2.5 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 text-center shadow-inner">
                  RECOVERY PHRASE
                </li>
                <li className="p-2.5 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 text-center shadow-inner">
                  WALLET PASSWORD
                </li>
              </ul>
            </div>
          </div>

          {/* 4. NON-CUSTODIAL WALLET SECTION */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 font-mono text-sm font-bold text-cyan-400">
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">01</span>
              <span>YOUR WALLET, YOUR CONTROL</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              «TIXA is designed around a non-custodial wallet model. Users can create and control their own wallet through the TIXA application.»
            </p>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              «When technically supported, wallet credentials are generated locally on the user's device. TIXA should not receive or store the user's recovery phrase or private key as part of normal wallet creation and transaction signing.»
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>YOUR PRIVATE KEY STAYS UNDER YOUR CONTROL.</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>YOUR RECOVERY PHRASE STAYS UNDER YOUR CONTROL.</span>
              </div>
            </div>
          </div>

          {/* 5. WALLET CREATION FLOW */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>HOW YOUR WALLET IS CREATED</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { step: '01', title: 'LOGIN TO TIXA', desc: 'Authenticate securely into your user account.' },
                { step: '02', title: 'SELECT CREATE WALLET', desc: 'Initialize non-custodial cryptographic generation.' },
                { step: '03', title: 'GENERATE LOCALLY', desc: 'Keys generated directly inside device entropy.' },
                { step: '04', title: 'BIP-39 RECOVERY', desc: 'Standard 12-word recovery phrase produced.' },
                { step: '05', title: 'KEYS DERIVED', desc: 'Public & Private cryptographic pairs established.' },
                { step: '06', title: 'ADDRESS CREATED', desc: 'Unique blockchain receiving address assigned.' },
                { step: '07', title: 'USER CONTROLS', desc: 'Full sovereign control retained by the user.' }
              ].map((s, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between shadow-md relative overflow-hidden group hover:border-cyan-500/50 transition-all">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-8 h-8 rounded-xl bg-cyan-500 text-black font-mono font-black text-xs flex items-center justify-center shadow-md">
                      {s.step}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">SECURE STEP</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white mb-1">{s.title}</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 6. WALLET ADDRESS SECTION */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 font-mono text-sm font-bold text-cyan-400">
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">📍</span>
              <span>YOUR WALLET ADDRESS</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              «After creating a wallet, the user receives a unique wallet address generated by the wallet's cryptographic system.»
            </p>

            <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-mono text-slate-400 font-bold">TIXA WALLET ADDRESS SAMPLE</div>
                  <div className="text-xs sm:text-sm font-mono font-bold text-cyan-200 select-all">{sampleAddress}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleCopyAddress}
                  className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'COPY ADDRESS'}</span>
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-400 italic">
              «A wallet address is generally public information and may be shared when receiving supported assets. Never share your private key or recovery phrase.»
            </p>
          </div>

          {/* 7. PRIVATE KEY SECTION */}
          <div className="p-6 rounded-2xl bg-purple-950/30 border border-purple-500/50 space-y-4">
            <div className="flex items-center gap-2 font-mono text-sm font-bold text-purple-300">
              <Key className="w-5 h-5 text-purple-400" />
              <span>PRIVATE KEY</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              «Your private key is a sensitive cryptographic credential that can authorize transactions from the associated wallet.»
            </p>
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs font-mono font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>NEVER SHARE YOUR PRIVATE KEY WITH ANYONE.</span>
            </div>
            <p className="text-xs text-slate-300">
              «TIXA administrators, developers, and support representatives must not ask users to provide their private key.»
            </p>
          </div>

          {/* 8. RECOVERY PHRASE SECTION */}
          <div className="p-6 rounded-2xl bg-red-950/20 border border-red-500/40 space-y-4">
            <div className="flex items-center gap-2 font-mono text-sm font-bold text-red-400">
              <ShieldCheck className="w-5 h-5 text-red-400" />
              <span>RECOVERY PHRASE</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              «Your recovery phrase is highly sensitive wallet information. Anyone who obtains it may potentially gain control of the associated wallet.»
            </p>
            <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/60 text-red-200 text-xs font-mono font-bold text-center">
              🛡️ NEVER SEND YOUR RECOVERY PHRASE TO ANYONE.
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">DO NOT SEND IT THROUGH:</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                {['Email', 'Chat', 'Telegram', 'WhatsApp', 'Social media', 'Support tickets', 'Screenshots', 'Online forms'].map((item, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2 text-slate-300">
                    <X className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 9. PASSWORD PRIVACY */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 font-mono text-sm font-bold text-cyan-400">
              <Lock className="w-4 h-4 text-cyan-400" />
              <span>YOUR PASSWORD IS PRIVATE</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              «Your password belongs to you. TIXA must never display or request your plaintext password.»
            </p>
            <div className="p-3 rounded-xl bg-cyan-950/50 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold">
              🔒 ADMINISTRATORS CANNOT VIEW YOUR ORIGINAL PASSWORD.
            </div>
            <p className="text-xs text-slate-400">
              Passwords must be protected using appropriate security practices and must not be stored as readable plaintext.
            </p>
          </div>

          {/* 10. ACCOUNT VS WALLET */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              ACCOUNT VS NON-CUSTODIAL WALLET
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-cyan-400 font-mono">TIXA ACCOUNT</div>
                <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                  <li>Login & Authentication</li>
                  <li>User Profile & Settings</li>
                  <li>Notifications & Alerts</li>
                  <li>Application Feature Access</li>
                </ul>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-purple-500/40 space-y-2">
                <div className="text-xs font-bold text-purple-400 font-mono">NON-CUSTODIAL WALLET</div>
                <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                  <li>Controlled through Recovery Mechanism</li>
                  <li>Secured by Private Key</li>
                  <li>Local Wallet Protection</li>
                  <li>Sovereign User Control</li>
                </ul>
              </div>
            </div>
            <p className="text-xs text-slate-300 italic pt-2">
              «Logging into your TIXA account does not give TIXA administrators ownership of your non-custodial wallet.»
            </p>
          </div>

          {/* 11. TRANSACTION SECURITY */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 font-mono text-sm font-bold text-cyan-400">
              <Server className="w-4 h-4 text-cyan-400" />
              <span>LOCAL TRANSACTION SIGNING</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              {['USER CREATES', 'REVIEW', 'USER CONFIRMS', 'SIGNED LOCALLY', 'SIGNED TX', 'BLOCKCHAIN'].map((step, idx, arr) => (
                <React.Fragment key={idx}>
                  <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-cyan-500/40 text-cyan-300 font-bold">
                    {step}
                  </div>
                  {idx < arr.length - 1 && <span className="text-slate-600 font-bold">→</span>}
                </React.Fragment>
              ))}
            </div>
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold">
              ✓ YOUR PRIVATE KEY SHOULD NOT BE SENT TO THE SERVER FOR NORMAL TRANSACTION SIGNING.
            </div>
          </div>

          {/* 12. ADMIN SECURITY */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              👨💻 ADMINISTRATOR ACCESS CONTROL
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/40 space-y-2">
                <div className="text-xs font-bold text-red-400 font-mono">ADMINS DO NOT HAVE ACCESS TO:</div>
                <ul className="text-xs text-red-300 space-y-1.5">
                  <li>❌ Recovery phrases</li>
                  <li>❌ Private keys</li>
                  <li>❌ Plaintext passwords</li>
                  <li>❌ Wallet encryption secrets</li>
                </ul>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/40 space-y-2">
                <div className="text-xs font-bold text-emerald-400 font-mono">ADMINS MAY ACCESS LEGITIMATE DATA:</div>
                <ul className="text-xs text-emerald-300 space-y-1.5">
                  <li>✅ Account status</li>
                  <li>✅ Public wallet address</li>
                  <li>✅ Public transaction information</li>
                  <li>✅ Security events & settings</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 13. USER PRIVACY */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 font-mono text-sm font-bold text-cyan-400">
              <EyeOff className="w-4 h-4 text-cyan-400" />
              <span>🕊️ YOUR PRIVACY MATTERS</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              «TIXA should collect only information reasonably necessary to provide services, maintain security, operate the platform, and comply with applicable legal requirements.»
            </p>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              «Sensitive information should be protected against unauthorized access. TIXA should not disclose wallet secrets to unauthorized parties.»
            </p>
          </div>

          {/* 14. USER RESPONSIBILITY */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              ⚠️ YOUR SECURITY RESPONSIBILITY
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              «Non-custodial wallet technology gives users greater control, but it also means users must protect their own wallet credentials.»
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { title: '🔐 PASSWORD', desc: 'Keep it private and secure.' },
                { title: '🔑 PRIVATE KEY', desc: 'Never share it with anyone.' },
                { title: '🛡️ RECOVERY PHRASE', desc: 'Keep it backed up offline.' },
                { title: '📱 DEVICE', desc: 'Protect your device integrity.' }
              ].map((card, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-xs font-bold text-white font-mono">{card.title}</div>
                  <div className="text-[11px] text-slate-400">{card.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 15. WALLET RECOVERY WARNING */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-orange-950/60 to-red-950/60 border border-orange-500/60 space-y-3 shadow-lg">
            <div className="flex items-center gap-2 text-orange-400 font-bold text-sm font-mono">
              <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0" />
              <span>⚠️ IMPORTANT RECOVERY WARNING</span>
            </div>
            <p className="text-xs sm:text-sm text-orange-200 leading-relaxed">
              «If you permanently lose your recovery phrase and other supported recovery credentials, TIXA may not be able to recover your non-custodial wallet on your behalf.»
            </p>
            <div className="p-3 rounded-xl bg-orange-950/90 border border-orange-500/80 text-orange-200 text-xs font-mono font-black text-center shadow-inner">
              BACK UP YOUR RECOVERY INFORMATION SECURELY. NEVER SHARE IT WITH ANYONE.
            </div>
          </div>

          {/* 16. SECURITY SUPPORT NOTICE */}
          <div className="p-6 rounded-2xl bg-cyan-950/40 border border-cyan-500/50 space-y-4">
            <div className="flex items-center gap-2 font-mono text-sm font-bold text-cyan-300">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <span>🚨 TIXA SECURITY PROMISE</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              «TIXA support will never ask you to provide your recovery phrase, private key, or plaintext wallet password. If someone claiming to represent TIXA requests these credentials: <strong>STOP — DO NOT SHARE THEM.</strong>»
            </p>
          </div>

          {/* 17. TRANSPARENCY SECTION */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>🔎 TRANSPARENCY COMMITMENT</span>
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
              <li className="flex items-center gap-2"><span className="text-cyan-400">✓</span> How wallets are created locally</li>
              <li className="flex items-center gap-2"><span className="text-cyan-400">✓</span> Where cryptographic keys are generated</li>
              <li className="flex items-center gap-2"><span className="text-cyan-400">✓</span> What information TIXA can access</li>
              <li className="flex items-center gap-2"><span className="text-cyan-400">✓</span> What information TIXA cannot access</li>
              <li className="flex items-center gap-2"><span className="text-cyan-400">✓</span> How transactions are signed locally</li>
              <li className="flex items-center gap-2"><span className="text-cyan-400">✓</span> User security responsibilities</li>
            </ul>
          </div>

          {/* 18. FINAL USER-CONTROL STATEMENT */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-cyan-950 via-blue-950 to-slate-950 border border-cyan-500/50 text-center space-y-4 shadow-2xl">
            <h3 className="text-lg sm:text-xl font-black text-white font-mono tracking-wide">
              YOUR WALLET. YOUR KEYS. YOUR CONTROL.
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono font-bold">
              <span className="px-3 py-1 rounded-lg bg-black/50 text-cyan-300 border border-cyan-500/30">YOUR ACCOUNT</span>
              <span className="px-3 py-1 rounded-lg bg-black/50 text-cyan-300 border border-cyan-500/30">YOUR WALLET</span>
              <span className="px-3 py-1 rounded-lg bg-black/50 text-cyan-300 border border-cyan-500/30">YOUR ADDRESS</span>
              <span className="px-3 py-1 rounded-lg bg-black/50 text-cyan-300 border border-cyan-500/30">YOUR PRIVATE KEY</span>
              <span className="px-3 py-1 rounded-lg bg-black/50 text-cyan-300 border border-cyan-500/30">YOUR RECOVERY PHRASE</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
              «TIXA provides the software and infrastructure for interacting with the wallet, while the user retains control of the wallet's private credentials.»
            </p>
          </div>

          {/* 19. ACCEPTANCE CHECKBOX */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={accepted}
                onChange={e => setAccepted(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400 bg-slate-950 border-slate-700 shrink-0"
              />
              <span className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                I have read and understood the TIXA Privacy Policy and Non-Custodial Wallet Security information.
              </span>
            </label>
          </div>

        </div>

        {/* Modal Footer with Continue Button */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#050814] border-t border-slate-800">
          <div className="text-xs text-slate-500 font-mono">
            * Acceptance required to proceed with sovereign wallet operations.
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs border border-slate-700 transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleContinue}
              disabled={!accepted}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-black text-xs shadow-md shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              CONTINUE
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
