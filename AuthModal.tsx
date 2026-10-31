import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  Key, 
  ShieldCheck, 
  Lock, 
  Mail, 
  Phone, 
  Copy, 
  Check, 
  AlertCircle, 
  Sparkles, 
  Eye, 
  EyeOff, 
  Globe, 
  RefreshCw, 
  UserCheck, 
  Info, 
  ArrowRight, 
  ShieldAlert, 
  CheckCircle2,
  Share2
} from 'lucide-react';
import { authEngine } from '../../core/authEngine';
import { generateSecretPhrase } from '../../core/crypto';
import { COUNTRIES, CountryData, getCountryByCode } from '../../data/countries';
import confetti from 'canvas-confetti';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccess
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  
  // Registration Form State (Direct - No OTP)
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCountryCode, setSelectedCountryCode] = useState('BD');
  const [selectedCountry, setSelectedCountry] = useState<CountryData>(COUNTRIES.find(c => c.code === 'BD') || COUNTRIES[0]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [generatedPhrase, setGeneratedPhrase] = useState('');
  const [phraseCopied, setPhraseCopied] = useState(false);
  const [backupConfirmed, setBackupConfirmed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // AFILET (Affiliate Referral Code) State
  const [affiliateCodeInput, setAffiliateCodeInput] = useState('');
  const [referrerInfo, setReferrerInfo] = useState<{ found: boolean; name?: string; code?: string } | null>(null);

  // Login Form State (Direct - No OTP)
  const [loginEmailOrPhone, setLoginEmailOrPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginSecretPhrase, setLoginSecretPhrase] = useState('');
  const [showLoginPhrase, setShowLoginPhrase] = useState(false);
  const [loginCaptchaCode, setLoginCaptchaCode] = useState('');
  const [loginCaptchaInput, setLoginCaptchaInput] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Helper to generate 4-character English CAPTCHA
  const generateNewCaptcha = useCallback(() => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }, []);

  // Update selected country details
  const handleCountryChange = (code: string) => {
    setSelectedCountryCode(code);
    const country = getCountryByCode(code);
    if (country) {
      setSelectedCountry(country);
    }
  };

  // Refresh captchas and reset state on modal open or mode change
  useEffect(() => {
    if (isOpen) {
      setCaptchaCode(generateNewCaptcha());
      setLoginCaptchaCode(generateNewCaptcha());
      setCaptchaInput('');
      setLoginCaptchaInput('');
      setError(null);
      setSuccessMsg(null);
      if (mode === 'register' && !generatedPhrase) {
        setGeneratedPhrase(generateSecretPhrase());
      }
      
      // Auto-detect affiliate / referral code from URL parameters (?ref=... or ?affiliate=...)
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const refParam = urlParams.get('ref') || urlParams.get('affiliate') || urlParams.get('afilet') || sessionStorage.getItem('tixa_pending_ref');
        if (refParam && !affiliateCodeInput) {
          setAffiliateCodeInput(refParam.toUpperCase());
        }
      } catch (e) {
        console.error('Error parsing ref param', e);
      }
    }
  }, [isOpen, mode, generateNewCaptcha, generatedPhrase]);

  // Real-time Affiliate Code verification
  useEffect(() => {
    if (affiliateCodeInput.trim()) {
      const u = authEngine.getUserByAffiliateCode(affiliateCodeInput.trim());
      if (u) {
        setReferrerInfo({ found: true, name: u.name || u.email.split('@')[0], code: u.affiliateCode });
      } else {
        setReferrerInfo({ found: false });
      }
    } else {
      setReferrerInfo(null);
    }
  }, [affiliateCodeInput]);

  if (!isOpen) return null;

  // Direct User Registration (No OTP)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    // 1. CAPTCHA Validation
    if (captchaInput.trim().toUpperCase() !== captchaCode) {
      setError('ভুল সিকিউরিটি ক্যাপচা কোড! অনুগ্রহ করে সঠিক ৪ অক্ষরের ক্যাপচা লিখুন। (Security CAPTCHA verification failed)');
      setCaptchaCode(generateNewCaptcha());
      setCaptchaInput('');
      return;
    }

    // 2. Email Validation
    if (!email.trim() || !email.includes('@')) {
      setError('অনুগ্রহ করে একটি সঠিক জিমেইল / ইমেইল ঠিকানা দিন। (Please provide a valid Gmail/Email address)');
      return;
    }

    // 3. Mobile Number Validation
    if (!phone.trim()) {
      setError('অনুগ্রহ করে একটি বৈধ মোবাইল নম্বর প্রদান করুন। (Please enter your mobile phone number)');
      return;
    }

    // 4. Password validation
    if (password.length < 8) {
      setError('পাসওয়ার্ড ন্যূনতম ৮ ডিজিটের হতে হবে। (Password must be at least 8 characters long)');
      return;
    }

    if (password !== confirmPassword) {
      setError('কনফার্ম পাসওয়ার্ড মিলছে না! উভয় পাসওয়ার্ড এক হতে হবে। (Passwords do not match)');
      return;
    }

    // 5. Recovery phrase acknowledgment
    if (!backupConfirmed) {
      setError('অনুগ্রহ করে নিশ্চিত করুন যে আপনি ১২-শব্দের সিক্রেট রিকভারি ফ্রেজটি নিরাপদ স্থানে লিখে রেখেছেন।');
      return;
    }

    setLoading(true);

    try {
      const fullPhone = `${selectedCountry.callingCode} ${phone.trim()}`;
      await authEngine.register({
        email: email.trim(),
        phone: fullPhone,
        countryCode: selectedCountry.code,
        countryName: selectedCountry.name,
        callingCode: selectedCountry.callingCode,
        currencyCode: selectedCountry.currency,
        passwordPlain: password,
        customSecretPhrase: generatedPhrase,
        affiliateCodeUsed: affiliateCodeInput.trim() || undefined
      });

      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 }
      });

      setSuccessMsg('🎉 অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে! কোনো OTP ছাড়াই সরাসরি ভল্ট প্রস্তুত করা হয়েছে।');
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 900);
    } catch (err: any) {
      setError(err.message || 'অ্যাকাউন্ট তৈরি করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  // Direct User Login (No OTP)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    // 1. CAPTCHA Validation
    if (loginCaptchaInput.trim().toUpperCase() !== loginCaptchaCode) {
      setError('ভুল সিকিউরিটি ক্যাপচা কোড! অনুগ্রহ করে সঠিক ৪ অক্ষরের কোড লিখুন। (Invalid CAPTCHA code)');
      setLoginCaptchaCode(generateNewCaptcha());
      setLoginCaptchaInput('');
      return;
    }

    if (!loginEmailOrPhone.trim()) {
      setError('অনুগ্রহ করে আপনার রেজিস্টার্ড জিমেইল বা মোবাইল নম্বর লিখুন। (Please enter your registered Email or Phone)');
      return;
    }

    if (!loginPassword.trim()) {
      setError('অনুগ্রহ করে আপনার পাসওয়ার্ড লিখুন। (Please enter your password)');
      return;
    }

    setLoading(true);

    try {
      await authEngine.login({
        emailOrPhone: loginEmailOrPhone.trim(),
        passwordPlain: loginPassword,
        secretPhrasePlain: loginSecretPhrase.trim() ? loginSecretPhrase.trim() : undefined
      });

      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 }
      });

      setSuccessMsg('✅ সফলভাবে লগইন সম্পন্ন হয়েছে! ভল্ট ড্যাশবোর্ড ওপেন হচ্ছে...');
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 800);
    } catch (err: any) {
      setError(err.message || 'লগইন ব্যর্থ হয়েছে। আপনার ইমেইল বা পাসওয়ার্ড সঠিক নয়।');
    } finally {
      setLoading(false);
    }
  };

  const copySecretPhrase = () => {
    navigator.clipboard.writeText(generatedPhrase);
    setPhraseCopied(true);
    setTimeout(() => setPhraseCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl bg-[#090e1e] border border-cyan-500/30 shadow-2xl p-6 sm:p-8 my-8 text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Mode Selector Tabs */}
        {mode === 'admin' ? (
          <div className="flex items-center justify-between p-2.5 bg-blue-950/60 rounded-xl border border-blue-500/40 mb-6 font-mono text-xs text-blue-300">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span className="font-bold tracking-wider">TIXA RESTRICTED ADMIN PROTOCOL</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-blue-900/80 text-[10px] font-bold text-blue-200 border border-blue-700/60">
              OFFICER CLEARANCE
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1 p-1 bg-slate-900/90 rounded-xl border border-slate-800 mb-6 font-mono text-xs">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); setSuccessMsg(null); }}
              className={`flex-1 py-2.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 ${
                mode === 'login'
                  ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>User Login (লগইন)</span>
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(null); setSuccessMsg(null); }}
              className={`flex-1 py-2.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 ${
                mode === 'register'
                  ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Create Account (নতুন একাউন্ট)</span>
            </button>
          </div>
        )}

        {/* System Announcements & Duplicate Information Alerts */}
        {error && (
          <div className="mb-5 p-4 rounded-xl bg-rose-950/80 border border-rose-600 text-rose-200 text-xs flex items-start gap-3 shadow-lg shadow-rose-950/40">
            <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1 flex-1">
              <div className="font-bold text-rose-300 font-mono text-[11px] tracking-wide uppercase">
                সিস্টেম নোটিশ / System Announcement
              </div>
              <p className="leading-relaxed font-sans text-xs text-rose-100">
                {error}
              </p>
              {error.includes('ইতিমধ্যে একটি অ্যাকাউন্ট তৈরি') && mode === 'register' && (
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setLoginEmailOrPhone(email || phone);
                    setError(null);
                  }}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-900/80 hover:bg-rose-800 text-white font-mono text-[11px] font-bold transition-colors border border-rose-700"
                >
                  <span>সরাসরি লগইন পেজে যান (Go to Login)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs flex items-start gap-2.5 shadow-lg shadow-emerald-950/40">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span className="font-medium leading-relaxed">{successMsg}</span>
          </div>
        )}

        {/* ================================================================= */}
        {/* --- 1. DIRECT USER LOGIN FORM (NO OTP REQUIRED) ---              */}
        {/* ================================================================= */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="text-center space-y-1 mb-4">
              <h3 className="text-xl font-bold text-white font-heading flex items-center justify-center gap-2">
                <span>Sign In to TIXA Vault</span>
              </h3>
              <p className="text-xs text-slate-400">
                সরাসরি পাসওয়ার্ড দিয়ে লগইন করুন (কোনো ওটিপি ছাড়াই ইনস্ট্যান্ট এক্সেস)
              </p>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5">
                Registered Gmail or Mobile Phone <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="user@gmail.com or 017XXXXXXXX"
                  value={loginEmailOrPhone}
                  onChange={e => {
                    setLoginEmailOrPhone(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-cyan-500 focus:outline-none text-sm text-white placeholder-slate-600 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5">
                Password <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={loginPassword}
                  onChange={e => {
                    setLoginPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-cyan-500 focus:outline-none text-sm text-white placeholder-slate-600 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Optional 12-Word Recovery Phrase Toggle */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowLoginPhrase(!showLoginPhrase)}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1.5"
              >
                <Key className="w-3.5 h-3.5" />
                <span>{showLoginPhrase ? '− Hide 12-Word Secret Phrase' : '+ 12-Word Secret Phrase (Optional)'}</span>
              </button>

              {showLoginPhrase && (
                <div className="mt-2 space-y-1 animate-in fade-in duration-150">
                  <textarea
                    rows={2}
                    placeholder="nexus quantum cyber solar element horizon beacon forge logic orbit matrix vector"
                    value={loginSecretPhrase}
                    onChange={e => setLoginSecretPhrase(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-cyan-500 focus:outline-none text-xs text-white placeholder-slate-600 font-mono leading-relaxed resize-none"
                  />
                </div>
              )}
            </div>

            {/* Login 4-char English CAPTCHA */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <label className="block text-xs font-mono text-slate-300">
                Security Verification (4-Character CAPTCHA) <span className="text-rose-400">*</span>
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-slate-900 to-cyan-950/70 border border-cyan-500/50 rounded-lg select-none tracking-[0.35em] font-mono text-base font-extrabold text-cyan-300 shadow-inner">
                  {loginCaptchaCode}
                </div>
                <button
                  type="button"
                  onClick={() => setLoginCaptchaCode(generateNewCaptcha())}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Refresh CAPTCHA"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <input
                  type="text"
                  required
                  maxLength={4}
                  placeholder="Enter 4 letters"
                  value={loginCaptchaInput}
                  onChange={e => setLoginCaptchaInput(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 focus:border-cyan-500 focus:outline-none text-xs text-white font-mono uppercase tracking-widest placeholder-slate-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-bold text-sm tracking-wide transition-all shadow-lg shadow-cyan-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>{loading ? 'লগইন যাচাই হচ্ছে...' : 'Sign In to Vault (লগইন করুন)'}</span>
            </button>
          </form>
        )}

        {/* ================================================================= */}
        {/* --- 2. DIRECT USER REGISTRATION (1 EMAIL & 1 PHONE STRICT) ---    */}
        {/* ================================================================= */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div className="text-center space-y-1 mb-2">
              <h3 className="text-xl font-bold text-white font-heading">
                Create Non-Custodial Vault
              </h3>
              <p className="text-xs text-slate-400">
                একটি জিমেইল ও ফোন নম্বর দিয়ে কেবল একটি অ্যাকাউন্ট তৈরি হবে (কোনো OTP লাগবে না)
              </p>
            </div>

            {/* Email Field with 1 Email = 1 Account Notice */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-mono text-slate-300">
                  Gmail / Email Address <span className="text-rose-400">*</span>
                </label>
                <span className="text-[10px] text-cyan-400 font-mono bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/60">
                  ১ ইমেইল = ১ একাউন্ট
                </span>
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="user@gmail.com"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-cyan-500 text-xs text-white placeholder-slate-600 font-mono"
                />
              </div>
            </div>

            {/* Country Selector & Phone Number (1 Phone = 1 Account Notice) */}
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Country & Mobile Phone</span>
                </label>
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/80">
                  <span>১ নম্বর = ১ একাউন্ট</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <div className="sm:col-span-6">
                  <select
                    value={selectedCountryCode}
                    onChange={e => handleCountryChange(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:border-cyan-500"
                  >
                    {COUNTRIES.map(c => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.name} ({c.callingCode})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Phone Number Field with Calling Code prefix */}
                <div className="sm:col-span-6">
                  <div className="relative flex">
                    <span className="inline-flex items-center px-2.5 rounded-l-lg border border-r-0 border-slate-700 bg-slate-800 text-xs text-cyan-300 font-mono select-none">
                      {selectedCountry.callingCode}
                    </span>
                    <input
                      type="tel"
                      required
                      placeholder="017XXXXXXXX"
                      value={phone}
                      onChange={e => {
                        setPhone(e.target.value);
                        if (error) setError(null);
                      }}
                      className="w-full pl-2.5 pr-3 py-2 rounded-r-lg bg-slate-900 border border-slate-700 focus:border-cyan-500 text-xs text-white placeholder-slate-600 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Password (Min. 8) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={e => {
                      setPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    className="w-full pl-3 pr-8 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-cyan-500 text-xs text-white placeholder-slate-600 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Confirm Password <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    placeholder="••••••••••••"
                    value={confirmPassword}
                    onChange={e => {
                      setConfirmPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    className="w-full pl-3 pr-8 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 focus:border-cyan-500 text-xs text-white placeholder-slate-600 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* AFILET (Affiliate / Referral Code Box) */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-blue-950/40 border border-cyan-500/30 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono text-cyan-300 flex items-center gap-1.5 font-bold">
                  <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>AFILET / Referral Code (ঐচ্ছিক / Optional)</span>
                </label>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-bold">
                  ২.৫৪% কমিশন বোনাস
                </span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. TIXA-AFF-CHEN2050 (রেফারাল কোড থাকলে লিখুন)"
                  value={affiliateCodeInput}
                  onChange={e => {
                    setAffiliateCodeInput(e.target.value.toUpperCase());
                    if (error) setError(null);
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 focus:border-cyan-400 text-xs text-white placeholder-slate-600 font-mono uppercase tracking-wider"
                />
              </div>
              {referrerInfo && (
                <div className={`text-[11px] font-mono flex items-center gap-1.5 mt-1 ${
                  referrerInfo.found ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {referrerInfo.found ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>ভেরিফাইড রেফারার: <strong>{referrerInfo.name}</strong> ({referrerInfo.code}) • ডিপোজিট থেকে ২.৫৪% কমিশন সক্রিয়</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>রেফারাল কোডটি সিস্টেমে পাওয়া যায়নি (সঠিক কোড দিন অথবা খালি রাখুন)</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Generated Secret Recovery Phrase Display */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono text-cyan-300 font-semibold flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-cyan-400" />
                  <span>12-Word Secret Recovery Phrase (BIP-39)</span>
                </label>
                <button
                  type="button"
                  onClick={copySecretPhrase}
                  className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-mono px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800"
                >
                  {phraseCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{phraseCopied ? 'Copied' : 'Copy Words'}</span>
                </button>
              </div>

              <div className="p-2.5 rounded-xl bg-[#040813] border border-cyan-500/40 grid grid-cols-3 sm:grid-cols-4 gap-1.5 text-[10px] font-mono text-slate-200">
                {generatedPhrase.split(' ').map((word, idx) => (
                  <div key={idx} className="flex items-center gap-1 bg-slate-900/90 px-2 py-1 rounded border border-slate-800">
                    <span className="text-slate-500 text-[9px]">{idx + 1}.</span>
                    <span className="text-cyan-300 font-medium">{word}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 4-Character English CAPTCHA */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono text-slate-300">
                  Bot Protection (4-Character CAPTCHA) <span className="text-rose-400">*</span>
                </label>
                <span className="text-[10px] text-slate-400 font-mono">Case-Insensitive</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-slate-900 to-cyan-950/70 border border-cyan-500/50 rounded-lg select-none tracking-[0.35em] font-mono text-base font-extrabold text-cyan-300 shadow-inner">
                  {captchaCode}
                </div>
                <button
                  type="button"
                  onClick={() => setCaptchaCode(generateNewCaptcha())}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Refresh CAPTCHA"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <input
                  type="text"
                  required
                  maxLength={4}
                  placeholder="Enter 4 characters"
                  value={captchaInput}
                  onChange={e => setCaptchaInput(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 focus:border-cyan-500 focus:outline-none text-xs text-white font-mono uppercase tracking-widest placeholder-slate-600"
                />
              </div>
            </div>

            {/* Backup Checkbox */}
            <label className="flex items-start gap-2.5 text-xs text-slate-400 cursor-pointer pt-1">
              <input
                type="checkbox"
                required
                checked={backupConfirmed}
                onChange={e => setBackupConfirmed(e.target.checked)}
                className="mt-0.5 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-cyan-400"
              />
              <span>
                আমি নিশ্চিত করছি যে ১২-শব্দের সিক্রেট রিকভারি ফ্রেজটি নিরাপদে সংরক্ষণ করেছি।
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 via-emerald-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-bold text-sm tracking-wide transition-all shadow-lg shadow-cyan-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'Create Account & Activate Vault (একাউন্ট তৈরি করুন)'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
