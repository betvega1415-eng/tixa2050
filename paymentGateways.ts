import React from 'react';

export interface PaymentGatewayItem {
  id: string;
  name: string;
  nameBn: string;
  category: 'BANGLADESH_MFS' | 'CRYPTO_WALLET' | 'BANGLADESH_BANK';
  tixaLabel: string; // e.g. "bKash × TIXA"
  brandColor: string;
  badge: string;
  description: string;
  defaultNetwork?: string;
  accountOrAddress: string;
  accountType?: string;
  logoType: string;
}

export const PAYMENT_GATEWAYS: PaymentGatewayItem[] = [
  // --- BANGLADESH MOBILE FINANCIAL SERVICES (MFS) ---
  {
    id: 'BKASH',
    name: 'bKash Merchant',
    nameBn: 'বিকাশ মার্চেন্ট',
    category: 'BANGLADESH_MFS',
    tixaLabel: 'bKash × TIXA',
    brandColor: '#E2136E',
    badge: '🇧🇩 Bangladesh Top MFS',
    description: 'Instant deposit & cash out via bKash Merchant Gateway',
    accountOrAddress: '',
    accountType: 'Merchant Wallet',
    logoType: 'bkash'
  },
  {
    id: 'NAGAD',
    name: 'Nagad Corporate',
    nameBn: 'নগদ মার্চেন্ট',
    category: 'BANGLADESH_MFS',
    tixaLabel: 'Nagad × TIXA',
    brandColor: '#F7931E',
    badge: '🇧🇩 Bangladesh Postal MFS',
    description: 'Fast digital cash settlement via Nagad Corporate Merchant',
    accountOrAddress: '',
    accountType: 'Corporate Merchant',
    logoType: 'nagad'
  },
  {
    id: 'ROCKET',
    name: 'DBBL Rocket',
    nameBn: 'রকেট মার্চেন্ট',
    category: 'BANGLADESH_MFS',
    tixaLabel: 'Rocket × TIXA',
    brandColor: '#8C3494',
    badge: '🇧🇩 Dutch-Bangla Bank MFS',
    description: 'Direct banking MFS channel via DBBL Rocket',
    accountOrAddress: '',
    accountType: 'Merchant Account',
    logoType: 'rocket'
  },
  {
    id: 'UPAY',
    name: 'UCB Upay',
    nameBn: 'উপায় ডিজিটাল',
    category: 'BANGLADESH_MFS',
    tixaLabel: 'Upay × TIXA',
    brandColor: '#005CAB',
    badge: '🇧🇩 UCB Mobile Wallet',
    description: 'Secure instant mobile financial service via United Commercial Bank Upay',
    accountOrAddress: '',
    accountType: 'Merchant Agent',
    logoType: 'upay'
  },
  {
    id: 'CELLFIN',
    name: 'IBBL Cellfin',
    nameBn: 'সেলফিন ডিজিটাল',
    category: 'BANGLADESH_MFS',
    tixaLabel: 'Cellfin × TIXA',
    brandColor: '#008751',
    badge: '🇧🇩 Islami Bank Digital',
    description: 'Smart banking app settlement by Islami Bank Bangladesh',
    accountOrAddress: '',
    accountType: 'Smart App Gateway',
    logoType: 'cellfin'
  },

  // --- BANGLADESH ONLINE BANKING & SWIFT WIRE ---
  {
    id: 'CITY_TOUCH',
    name: 'City Bank (Citytouch)',
    nameBn: 'সিটি ব্যাংক',
    category: 'BANGLADESH_BANK',
    tixaLabel: 'City Bank × TIXA',
    brandColor: '#ED1C24',
    badge: '🏦 Bangladesh Banking',
    description: 'Corporate settlement escrow account at City Bank Ltd.',
    accountOrAddress: '',
    accountType: 'Corporate Escrow',
    logoType: 'citybank'
  },
  {
    id: 'ISLAMI_BANK',
    name: 'Islami Bank Bangladesh',
    nameBn: 'ইসলামী ব্যাংক',
    category: 'BANGLADESH_BANK',
    tixaLabel: 'IBBL × TIXA',
    brandColor: '#008751',
    badge: '🏦 Direct Bank Wire',
    description: 'Official corporate treasury account at Islami Bank Bangladesh Ltd.',
    accountOrAddress: '',
    accountType: 'Institutional Account',
    logoType: 'ibbl'
  },
  {
    id: 'BRAC_BANK',
    name: 'BRAC Bank (Astha)',
    nameBn: 'ব্র্যাক ব্যাংক',
    category: 'BANGLADESH_BANK',
    tixaLabel: 'BRAC Bank × TIXA',
    brandColor: '#004A99',
    badge: '🏦 Corporate Gateway',
    description: 'Direct wire & NPSB instantaneous transfer through BRAC Bank Astha',
    accountOrAddress: '',
    accountType: 'Corporate Account',
    logoType: 'bracbank'
  },

  // --- GLOBAL CRYPTOCURRENCY WALLETS & EXCHANGES ---
  {
    id: 'BINANCE_PAY',
    name: 'Binance & Binance Pay',
    nameBn: 'বাইনান্স পে',
    category: 'CRYPTO_WALLET',
    tixaLabel: 'Binance × TIXA',
    brandColor: '#F0B90B',
    badge: '🌐 Global #1 Exchange',
    description: 'Direct zero-fee instant deposit & cash out via Binance Pay',
    accountOrAddress: '',
    defaultNetwork: 'BEP20',
    accountType: 'Binance Merchant ID',
    logoType: 'binance'
  },
  {
    id: 'TRUST_WALLET',
    name: 'Trust Wallet',
    nameBn: 'ট্রাস্ট ওয়ালেট',
    category: 'CRYPTO_WALLET',
    tixaLabel: 'Trust Wallet × TIXA',
    brandColor: '#0500FF',
    badge: '🔒 Multi-Chain Web3',
    description: 'Decentralized non-custodial multi-chain gateway for TRC20, BEP20 & Native TIXA',
    accountOrAddress: '',
    defaultNetwork: 'BEP20',
    accountType: 'Web3 Multi-Chain',
    logoType: 'trustwallet'
  },
  {
    id: 'METAMASK',
    name: 'MetaMask',
    nameBn: 'মেটামাস্ক',
    category: 'CRYPTO_WALLET',
    tixaLabel: 'MetaMask × TIXA',
    brandColor: '#F6851B',
    badge: '🦊 Leading EVM Wallet',
    description: 'Connect & transfer directly via MetaMask Web3 extension or mobile wallet',
    accountOrAddress: '',
    defaultNetwork: 'ERC20',
    accountType: 'EVM Gateway',
    logoType: 'metamask'
  },
  {
    id: 'PHANTOM',
    name: 'Phantom Wallet',
    nameBn: 'ফ্যান্টম ওয়ালেট',
    category: 'CRYPTO_WALLET',
    tixaLabel: 'Phantom × TIXA',
    brandColor: '#AB9FF2',
    badge: '👻 Solana & Multi-Chain',
    description: 'High-speed settlement across Solana and cross-chain TIXA bridges',
    accountOrAddress: '',
    defaultNetwork: 'SOLANA',
    accountType: 'Solana/EVM Bridge',
    logoType: 'phantom'
  },
  {
    id: 'OKX_WALLET',
    name: 'OKX Web3 Wallet',
    nameBn: 'ওকেএক্স ওয়ালেট',
    category: 'CRYPTO_WALLET',
    tixaLabel: 'OKX × TIXA',
    brandColor: '#FFFFFF',
    badge: '🌐 Multi-Chain Exchange',
    description: 'OKX Web3 wallet and exchange internal direct transfer channel',
    accountOrAddress: '',
    defaultNetwork: 'TRC20',
    accountType: 'OKX Web3 Hub',
    logoType: 'okx'
  },
  {
    id: 'BYBIT',
    name: 'Bybit Wallet',
    nameBn: 'বাইবিট ওয়ালেট',
    category: 'CRYPTO_WALLET',
    tixaLabel: 'Bybit × TIXA',
    brandColor: '#F7A600',
    badge: '⚡ Crypto Derivatives & Spot',
    description: 'Instant liquidity & direct deposit from Bybit institutional pools',
    accountOrAddress: '',
    defaultNetwork: 'TRC20',
    accountType: 'Bybit Institutional',
    logoType: 'bybit'
  },
  {
    id: 'KUCOIN',
    name: 'KuCoin (KuCard / Pay)',
    nameBn: 'কুকয়েন ওয়ালেট',
    category: 'CRYPTO_WALLET',
    tixaLabel: 'KuCoin × TIXA',
    brandColor: '#24AE8F',
    badge: '💎 People\'s Exchange',
    description: 'Direct KuCoin UID transfer and on-chain deposits in USDT, TIXA & BTC',
    accountOrAddress: '',
    defaultNetwork: 'TRC20',
    accountType: 'KuCoin Pay UID',
    logoType: 'kucoin'
  },
  {
    id: 'COINBASE_WALLET',
    name: 'Coinbase Wallet',
    nameBn: 'কয়েনবেস ওয়ালেট',
    category: 'CRYPTO_WALLET',
    tixaLabel: 'Coinbase × TIXA',
    brandColor: '#0052FF',
    badge: '🛡️ Regulated Global Web3',
    description: 'Coinbase self-custody and institutional custody settlement channel',
    accountOrAddress: '',
    defaultNetwork: 'ERC20',
    accountType: 'Smart Web3 Wallet',
    logoType: 'coinbase'
  },
  {
    id: 'TRONLINK',
    name: 'TronLink',
    nameBn: 'ট্রনলিঙ্ক',
    category: 'CRYPTO_WALLET',
    tixaLabel: 'TronLink × TIXA',
    brandColor: '#FF060A',
    badge: '⚡ Low-Fee TRC20 Gateway',
    description: 'TRC20 USDT zero-latency network connection for instant micro-settlement',
    accountOrAddress: '',
    defaultNetwork: 'TRC20',
    accountType: 'Tron Network Client',
    logoType: 'tronlink'
  },
  {
    id: 'SAFEPAL',
    name: 'SafePal Wallet',
    nameBn: 'সেফপ্যাল ওয়ালেট',
    category: 'CRYPTO_WALLET',
    tixaLabel: 'SafePal × TIXA',
    brandColor: '#2354E6',
    badge: '🛡️ Hardware & Software Vault',
    description: 'Decentralized air-gapped hardware and software security integration',
    accountOrAddress: '',
    defaultNetwork: 'BEP20',
    accountType: 'Cold Storage Vault',
    logoType: 'safepal'
  },
  {
    id: 'BITGET',
    name: 'Bitget Wallet',
    nameBn: 'বিটগেট ওয়ালেট',
    category: 'CRYPTO_WALLET',
    tixaLabel: 'Bitget × TIXA',
    brandColor: '#00F0FF',
    badge: '🚀 Web3 Trading Hub',
    description: 'Decentralized multi-chain Web3 wallet powered by Bitget global liquidity',
    accountOrAddress: '',
    defaultNetwork: 'BEP20',
    accountType: 'Bitget Web3 ID',
    logoType: 'bitget'
  },
  {
    id: 'MEXC_PAY',
    name: 'MEXC Global Pay',
    nameBn: 'এমইএক্সসি পে',
    category: 'CRYPTO_WALLET',
    tixaLabel: 'MEXC × TIXA',
    brandColor: '#00B894',
    badge: '🌐 Global Liquidity Hub',
    description: 'Direct internal transfer via MEXC with zero gas fees',
    accountOrAddress: '',
    defaultNetwork: 'TRC20',
    accountType: 'MEXC Internal Pay',
    logoType: 'mexc'
  },
  {
    id: 'EXODUS',
    name: 'Exodus Wallet',
    nameBn: 'এক্সোডাস ওয়ালেট',
    category: 'CRYPTO_WALLET',
    tixaLabel: 'Exodus × TIXA',
    brandColor: '#8952FF',
    badge: '💎 Desktop & Mobile Vault',
    description: 'Sleek multichain wallet with Trezor integration and instant settlement',
    accountOrAddress: '',
    defaultNetwork: 'TIXA_2050_NATIVE',
    accountType: 'Multi-Chain Vault',
    logoType: 'exodus'
  },
  {
    id: 'LEDGER',
    name: 'Ledger Live',
    nameBn: 'লেজার লাইভ',
    category: 'CRYPTO_WALLET',
    tixaLabel: 'Ledger × TIXA',
    brandColor: '#FFFFFF',
    badge: '🔐 Institutional Cold Storage',
    description: 'Secure hardware-level transaction signing and enterprise-grade cold storage',
    accountOrAddress: '',
    defaultNetwork: 'ERC20',
    accountType: 'Hardware Security Module',
    logoType: 'ledger'
  }
];

// Official 20 Sentences of Admin Protocol Function & Rules (বাংলা + English)
export const ADMIN_PROTOCOL_RULES_20 = [
  {
    id: 1,
    bn: 'TIXAPAY ইকোসিস্টেমে অ্যাডমিন অ্যাকাউন্টের নিজস্ব কোনো ব্যক্তিগত বা সীমাবদ্ধ ব্যালেন্স সীমা থাকে না।',
    en: 'In the TIXAPAY ecosystem, Admin accounts operate under zero personal balance limits or constraints.'
  },
  {
    id: 2,
    bn: 'অ্যাডমিন আনক্যাপড জেনেসিস প্রোটোকল মিন্টিং ক্ষমতার মাধ্যমে যেকোনো ব্যবহারকারীর অ্যাকাউন্টে তাৎক্ষণিক ক্রিপ্টো ইস্যু ও পাঠাতে পারে।',
    en: 'Admin possesses uncapped Genesis Protocol Minting power to immediately issue and dispatch crypto to any user.'
  },
  {
    id: 3,
    bn: 'অ্যাডমিন যে কোনো ব্যবহারকারীর ইউনিক ID নম্বর অথবা নিবন্ধিত ইমেইলে সরাসরি আনলিমিটেড ক্রিপ্টো (TIXA বা TX-20 টোকেন) ট্রান্সফার করতে পারবে।',
    en: 'Admin can transfer unlimited crypto (TIXA or TX-20 tokens) directly to any user by their unique User ID or registered email.'
  },
  {
    id: 4,
    bn: 'প্রতিটি নিবন্ধিত ব্যবহারকারীর জন্য সিস্টেমে কেবল একটি এবং শুধুমাত্র একটি ইউনিক Bech32 (tx1...) ওয়ালেট অ্যাড্রেস বরাদ্দ থাকবে।',
    en: 'Every registered user is assigned strictly one and only one unique Bech32 (tx1...) wallet address in the system.'
  },
  {
    id: 5,
    bn: 'ইউজার থেকে ইউজারের অভ্যন্তরীণ সকল ওয়ালেট লেনদেন ১০০% সম্পূর্ণ ফ্রি (0% Gas Fee) তে সম্পন্ন হবে।',
    en: 'All internal peer-to-peer user-to-user wallet transactions are executed 100% free of charge with zero gas fees.'
  },
  {
    id: 6,
    bn: 'একজন ব্যবহারকারী অন্য ব্যবহারকারীর একক ওয়ালেট অ্যাড্রেসে যেকোনো পরিমাণ ক্রিপ্টো পাঠালে তা কোনো গ্যাস ফি ছাড়াই শূন্য সেকেন্ডে প্রাপকের ব্যালেন্সে যুক্ত হবে।',
    en: 'When a user transfers crypto to another user\'s single address, it is instantly credited to the recipient\'s balance in zero seconds without any fee.'
  },
  {
    id: 7,
    bn: 'ডিপোজিট ও উইথড্র অপশনে বাংলাদেশের শীর্ষস্থানীয় সকল পেমেন্ট গেটওয়ে যেমন বিকাশ, নগদ, রকেট, উপায়, সেলফিন ও ব্যাংক ওয়্যার সংযুক্ত থাকবে।',
    en: 'Deposit and withdrawal channels integrate all leading Bangladeshi payment gateways including bKash, Nagad, Rocket, Upay, Cellfin, and Bank Wire.'
  },
  {
    id: 8,
    bn: 'বহির্বিশ্বের এবং স্থানীয় প্রতিটি পেমেন্ট অপশন ও ক্রিপ্টো ওয়ালেটের নামের সাথে ব্র্যান্ডেড "TIXA" লোগো ও কো-ব্র্যান্ডিং ব্যাজ দৃশ্যমান থাকবে।',
    en: 'Every global and local payment method and crypto wallet proudly displays a branded "TIXA" logo and co-branding badge.'
  },
  {
    id: 9,
    bn: 'বিশ্বের শীর্ষ ক্রিপ্টো ওয়ালেট যেমন Binance, Trust Wallet, MetaMask, Phantom, OKX, Bybit, KuCoin, Coinbase, TronLink, Bitget, Exodus ও Ledger-এর অফিসিয়াল ভিজ্যুয়াল লোগো সংযুক্ত থাকবে।',
    en: 'Official visual logos for world-leading crypto wallets including Binance, Trust Wallet, MetaMask, Phantom, OKX, Bybit, KuCoin, Coinbase, TronLink, Bitget, Exodus, and Ledger are fully embedded.'
  },
  {
    id: 10,
    bn: 'ডিপোজিট ফরম সাবমিট করার সাথে সাথে সিস্টেম স্বয়ংক্রিয়ভাবে ট্রানজ্যাকশন আইডি ও পেমেন্ট প্রুফ যাচাইয়ের জন্য অ্যাডমিন প্যানেলে প্রেরণ করবে।',
    en: 'Submitting a deposit form automatically routes the transaction hash and payment proof to the Admin queue for immediate verification.'
  },
  {
    id: 11,
    bn: 'অ্যাডমিন যাচাই শেষে এক ক্লিকে ইউজারের ডিপোজিট অ্যাপ্রুভ করলে ইউজারের সিঙ্গেল ওয়ালেট অ্যাড্রেসে কাঙ্ক্ষিত TIXA কয়েন বা টোকেন ক্রেডিট হয়ে যাবে।',
    en: 'Upon one-click approval by Admin after verification, the requested TIXA coins or tokens are credited to the user\'s single wallet address.'
  },
  {
    id: 12,
    bn: 'ব্যবহারকারী যেকোনো সময় তার সিঙ্গেল ওয়ালেট থেকে বিকাশ, রকেট, নগদ, বাইনান্স পে অথবা ক্রিপ্টো ঠিকানায় ক্যাশ আউট / উইথড্র রিকোয়েস্ট করতে পারবে।',
    en: 'Users can request cash outs and withdrawals from their single wallet to bKash, Rocket, Nagad, Binance Pay, or external crypto addresses at any time.'
  },
  {
    id: 13,
    bn: 'অ্যাডমিন ড্যাশবোর্ডে উইথড্রল ডিসপ্যাচ কিউ থেকে রিকোয়েস্ট অনুমোদন করলে স্বয়ংক্রিয়ভাবে ব্যবহারকারীর ফান্ড গন্তব্যে প্রেরিত হবে।',
    en: 'Approving a request from the Admin Withdrawal Dispatch Queue automatically releases the user\'s funds to their specified destination.'
  },
  {
    id: 14,
    bn: 'অ্যাডমিন ড্যাশবোর্ড থেকে রিয়েল-টাইমে TIXA কয়েনের আন্তর্জাতিক বেঞ্চমার্ক প্রাইস ($990,000 USDT) ও এক্সচেঞ্জ রেট সমন্বয় করা যাবে।',
    en: 'Admins can calibrate the international benchmark price of TIXA ($990,000 USDT) and foreign fiat exchange rates in real time.'
  },
  {
    id: 15,
    bn: 'প্রতিটি নতুন ব্যবহারকারীর রেজিস্ট্রেশন বিস্তারিত (দেশ, ফোন, আইপি ও ডিভাইস ফিঙ্গারপ্রিন্ট) অ্যাডমিনের অডিট প্যানেলে সংরক্ষিত হবে।',
    en: 'Full registration metadata (country, phone, IP address, and hardware device fingerprint) for every new user is securely archived in the Admin audit log.'
  },
  {
    id: 16,
    bn: 'সিস্টেমে সিকিউরিটি থ্রেট বা নিয়ম ভঙ্গের ক্ষেত্রে অ্যাডমিন যেকোনো ইউজারের ওয়ালেট আউটফ্লো তাৎক্ষণিক ফ্রিজ ও আনফ্রিজ করতে পারবে।',
    en: 'In the event of a security threat or policy violation, Admin has the authority to immediately freeze or unfreeze any user\'s wallet outflows.'
  },
  {
    id: 17,
    bn: 'প্রতিটি আর্থিক লেনদেন এবং ব্যালেন্সের পরিবর্তন ডাবল-এন্ট্রি লেজার ও ক্রিপ্টোগ্রাফিক হ্যাশ-চেইনে অপরিবর্তনীয়ভাবে লিপিবদ্ধ হয়।',
    en: 'Every financial transaction and balance alteration is immutably inscribed into the double-entry ledger and cryptographic hash chain.'
  },
  {
    id: 18,
    bn: 'সমস্ত অভ্যন্তরীণ ও বহিরাগত লেনদেনের তথ্য স্টেটমেন্ট হিসেবে সরাসরি CSV ফরম্যাটে ডাউনলোডযোগ্য।',
    en: 'Complete internal and external transaction statements can be downloaded directly in CSV format for institutional auditing.'
  },
  {
    id: 19,
    bn: 'মাল্টি-সিগনেচার কনসেনসাসের মাধ্যমে একাধিক অ্যাডমিন যৌথভাবে প্রধান নেটওয়ার্ক প্রোটোকল আপডেট অনুমোদন করতে পারবে।',
    en: 'Major network protocol updates require collective multi-signature consensus approvals from authorized Admin officers.'
  },
  {
    id: 20,
    bn: 'অ্যাডমিন কর্তৃক প্রেরিত বা অনুমোদিত প্রতিটি ক্রিপ্টো লেনদেন তাৎক্ষণিকভাবে TIXAPAY ডিসেন্ট্রালাইজড ব্লকে সিল করা হয়।',
    en: 'Every crypto transaction dispatched or validated by Admin is instantly sealed into the TIXAPAY decentralized blockchain.'
  }
];
