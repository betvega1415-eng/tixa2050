import React from 'react';
import { Zap, ShieldCheck, Cpu, Terminal, FileText, ExternalLink, GitBranch, Globe } from 'lucide-react';
import { ActiveTab } from './Navbar';
import { LanguageSelectorButton } from './LanguageSelectorButton';
import { useLanguage } from '../../context/LanguageContext';
import { NewsletterSubscriptionForm } from './NewsletterSubscriptionForm';

interface FooterProps {
  setActiveTab: (tab: ActiveTab) => void;
  onOpenWhitepaper?: () => void;
  onOpenPrivacyPolicy?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab, onOpenWhitepaper, onOpenPrivacyPolicy }) => {
  const { t } = useLanguage();

  return (
    <footer className="w-full border-t border-cyan-500/15 bg-[#03060f] text-slate-400 text-sm mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Newsletter Subscription for Protocol Upgrades */}
        <NewsletterSubscriptionForm className="mb-12" />

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-black" />
              </div>
              <span className="text-lg font-bold text-white font-heading tracking-wider">
                TIXAPAY
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
                MAINNET READY
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              {t('footer_tagline', 'Next-Generation Non-Custodial Layer-1 Financial Infrastructure.')}
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs font-mono text-cyan-400/80">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>SHA-256 Chained Ledger</span>
              </span>
              <span className="text-slate-700">•</span>
              <span className="inline-flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>3.0s Deterministic Finality</span>
              </span>
            </div>
            {/* Footer Language Switcher Trigger */}
            <div className="pt-2">
              <LanguageSelectorButton variant="footer" />
            </div>
          </div>

          {/* Ecosystem Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
              {t('dash_ecosystem', 'Ecosystem')}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setActiveTab('wallet')} className="hover:text-cyan-400 transition-colors">
                  {t('nav_wallet', 'Wallet')}
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('explorer')} className="hover:text-cyan-400 transition-colors">
                  {t('nav_explorer', 'Blockchain')}
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('exchange')} className="hover:text-cyan-400 transition-colors">
                  {t('nav_trading', 'Trading')}
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('tokens')} className="hover:text-cyan-400 transition-colors">
                  {t('nav_tokens', 'Tokens')}
                </button>
              </li>
            </ul>
          </div>

          {/* Developers & Governance */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
              Architecture & Dev
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setActiveTab('developer')} className="hover:text-cyan-400 transition-colors flex items-center gap-1">
                  <Terminal className="w-3 h-3 text-cyan-400" />
                  <span>Node JSON-RPC Sandbox</span>
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('developer')} className="hover:text-cyan-400 transition-colors flex items-center gap-1">
                  <GitBranch className="w-3 h-3 text-blue-400" />
                  <span>15-Step Blueprint Guide</span>
                </button>
              </li>
              <li>
                <button onClick={onOpenWhitepaper} className="hover:text-cyan-400 transition-colors flex items-center gap-1">
                  <FileText className="w-3 h-3 text-emerald-400" />
                  <span>Interactive Whitepaper</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Legal / Security Notice */}
          <div className="space-y-3">
            <button 
              type="button"
              onClick={onOpenPrivacyPolicy}
              className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono hover:text-cyan-400 transition-colors flex items-center gap-1.5 cursor-pointer text-left"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Trust & Safety (Privacy Policy)</span>
            </button>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              TIXAPAY strictly isolates testnet simulation from real-value mainnet assets. Private keys are never transmitted to server nodes or admin consoles. All privileged actions produce immutable cryptographic audit proofs.
            </p>
            <div className="text-[10px] font-mono text-slate-600">
              BUILD: v2050.8.21-ALPHA // PROTOCOL: TIXA-BFT
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800/80 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© TIXAPAY Network Foundation. {t('footer_rights', 'All cryptographic rights reserved.')}</p>
          <div className="flex items-center gap-4 mt-3 sm:mt-0 font-mono text-[11px]">
            <span className="text-cyan-400/70">GENESIS BLOCK HASH: 0x00000000a94bf821...</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

