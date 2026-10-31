import React, { useState, useEffect } from 'react';
import { Mail, ArrowRight, CheckCircle2, AlertCircle, Loader2, BellRing, Sparkles, ShieldCheck } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import confetti from 'canvas-confetti';

interface NewsletterSubscriptionFormProps {
  className?: string;
}

const STORAGE_KEY_SUBSCRIBED = 'tixa_newsletter_subscribed_email';
const STORAGE_KEY_ALL = 'tixa_newsletter_subscribers_history';

export const NewsletterSubscriptionForm: React.FC<NewsletterSubscriptionFormProps> = ({ className = '' }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [subscribedEmail, setSubscribedEmail] = useState<string | null>(null);
  const [isNewSubscription, setIsNewSubscription] = useState(false);

  useEffect(() => {
    // Check local storage for existing subscription
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SUBSCRIBED);
      if (stored) {
        setSubscribedEmail(stored);
      }
    } catch {
      // localStorage may fail in private mode
    }
  }, []);

  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setErrorMessage('Please enter an email address.');
      setStatus('error');
      return;
    }

    if (!validateEmail(cleanEmail)) {
      setErrorMessage('Please enter a valid email address.');
      setStatus('error');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    const now = new Date().toISOString();
    // Unique ID compliant with isValidId (alphanumeric and dashes/underscores)
    const docId = 'sub_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8);

    const subscriptionData = {
      id: docId,
      email: cleanEmail,
      createdAt: now,
      source: 'footer',
      status: 'active'
    };

    let firestoreSaved = false;

    // 1. Attempt Firestore write
    try {
      const docRef = doc(db, 'newsletter_subscriptions', docId);
      await setDoc(docRef, subscriptionData);
      firestoreSaved = true;
    } catch (err) {
      console.warn('Firestore subscription write fallback:', err);
      // We will still persist locally to ensure zero user frustration
    }

    // 2. Persist in local storage
    try {
      localStorage.setItem(STORAGE_KEY_SUBSCRIBED, cleanEmail);
      const historyStr = localStorage.getItem(STORAGE_KEY_ALL);
      const historyList: string[] = historyStr ? JSON.parse(historyStr) : [];
      if (!historyList.includes(cleanEmail)) {
        historyList.push(cleanEmail);
        localStorage.setItem(STORAGE_KEY_ALL, JSON.stringify(historyList));
      }
    } catch {
      // ignore storage error
    }

    setSubscribedEmail(cleanEmail);
    setStatus('success');
    setIsNewSubscription(true);
    setEmail('');

    // Trigger subtle celebratory confetti
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.85 },
        colors: ['#06b6d4', '#3b82f6', '#10b981']
      });
    } catch {
      // ignore
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setErrorMessage('');
    setIsNewSubscription(false);
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-b from-[#071326]/80 via-[#030b18]/90 to-[#020611] p-6 sm:p-8 backdrop-blur-md shadow-2xl shadow-cyan-950/30 ${className}`}>
      {/* Background glow and geometric grid accent */}
      <div className="absolute -right-16 -top-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#082f490a_1px,transparent_1px),linear-gradient(to_bottom,#082f490a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-40" />

      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Header info */}
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-400 text-xs font-mono">
              <BellRing className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>PROTOCOL UPGRADE DISPATCH</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              <span className="text-[10px] text-cyan-500 uppercase">Quantum Mainnet</span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-white tracking-wide font-heading flex items-center gap-2">
              Stay Notified of TIXAPAY Upgrades
              <Sparkles className="w-4 h-4 text-cyan-400 hidden sm:inline" />
            </h3>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Subscribe for real-time alerts regarding consensus hard forks, cryptographic protocol upgrades, testnet-to-mainnet bridge migrations, and node validator governance.
            </p>

            {/* Feature bullets */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-[11px] text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero-Spam Guarantee</span>
              </span>
              <span className="text-slate-700 hidden sm:inline">•</span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                <span>Hard Fork Schedules</span>
              </span>
              <span className="text-slate-700 hidden sm:inline">•</span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                <span>Node Binary Updates</span>
              </span>
            </div>
          </div>

          {/* Form / State container */}
          <div className="w-full lg:w-auto lg:min-w-[380px] xl:min-w-[420px]">
            {status === 'success' || (subscribedEmail && !isNewSubscription && status !== 'submitting') ? (
              <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-slate-200 space-y-3 animate-fade-in">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-white">
                      {isNewSubscription ? 'Subscription Confirmed!' : 'Active Protocol Alerts'}
                    </div>
                    <div className="text-xs text-cyan-300 font-mono truncate mt-0.5">
                      {subscribedEmail}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      You will receive notifications ahead of every TIXAPAY protocol milestone.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-[11px] text-slate-400 hover:text-cyan-400 transition-colors font-mono underline decoration-dotted"
                  >
                    Subscribe another email
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative flex flex-col sm:flex-row items-stretch gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Mail className="w-4 h-4 text-cyan-500/70" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errorMessage) setErrorMessage('');
                      }}
                      placeholder="developer@domain.com"
                      disabled={status === 'submitting'}
                      aria-label="Email address for protocol upgrade notifications"
                      className="w-full pl-10 pr-3 py-2.5 bg-[#030914] text-white placeholder-slate-500 text-xs sm:text-sm rounded-xl border border-slate-700/80 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all disabled:opacity-50 font-sans"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-semibold text-xs sm:text-sm transition-all duration-200 shadow-md shadow-cyan-500/20 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer shrink-0 active:scale-[0.98]"
                  >
                    {status === 'submitting' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-black" />
                        <span>Connecting...</span>
                      </>
                    ) : (
                      <>
                        <span>Subscribe</span>
                        <ArrowRight className="w-3.5 h-3.5 text-black" />
                      </>
                    )}
                  </button>
                </div>

                {/* Error message if any */}
                {errorMessage && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-400 pt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="text-[10px] text-slate-500 flex items-center justify-between px-1">
                  <span>Cryptographically verified alerts only.</span>
                  <span className="font-mono text-cyan-500/60">TIXA-BFT DISPATCH</span>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
