import React from 'react';

interface PaymentLogoIconProps {
  type: string;
  className?: string;
  size?: number;
}

export const PaymentLogoIcon: React.FC<PaymentLogoIconProps> = ({ type, className = 'w-6 h-6', size = 24 }) => {
  switch (type.toLowerCase()) {
    // --- BANGLADESH GATEWAYS ---
    case 'bkash':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size} fill="none">
          <rect width="100" height="100" rx="20" fill="#E2136E" />
          <path d="M22 68L48 24L74 46L54 58L42 76L22 68Z" fill="#FFFFFF" />
          <path d="M48 24L65 38L54 58L48 24Z" fill="#F48CB7" />
          <circle cx="75" cy="28" r="7" fill="#FFFFFF" />
        </svg>
      );

    case 'nagad':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size} fill="none">
          <rect width="100" height="100" rx="20" fill="#F7931E" />
          <path d="M50 15C50 15 26 40 26 62C26 75.25 36.75 86 50 86C63.25 86 74 75.25 74 62C74 40 50 15 50 15Z" fill="#ED1C24" />
          <path d="M50 35C50 35 37 52 37 66C37 73.18 42.82 79 50 79C57.18 79 63 73.18 63 66C63 52 50 35 50 35Z" fill="#FFE600" />
          <circle cx="50" cy="62" r="6" fill="#FFFFFF" />
        </svg>
      );

    case 'rocket':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size} fill="none">
          <rect width="100" height="100" rx="20" fill="#8C3494" />
          <path d="M50 18L64 42H56V66L50 60L44 66V42H36L50 18Z" fill="#FFFFFF" />
          <path d="M38 72C38 72 44 84 50 84C56 84 62 72 62 72L50 76L38 72Z" fill="#FFCC00" />
          <circle cx="50" cy="46" r="4" fill="#8C3494" />
        </svg>
      );

    case 'upay':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size} fill="none">
          <rect width="100" height="100" rx="20" fill="#005CAB" />
          <path d="M30 30V54C30 65 39 74 50 74C61 74 70 65 70 54V30H58V54C58 58.4 54.4 62 50 62C45.6 62 42 58.4 42 54V30H30Z" fill="#FFDE00" />
          <circle cx="50" cy="22" r="6" fill="#FFFFFF" />
        </svg>
      );

    case 'cellfin':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size} fill="none">
          <rect width="100" height="100" rx="20" fill="#008751" />
          <circle cx="50" cy="50" r="32" stroke="#FFFFFF" strokeWidth="6" />
          <path d="M50 26V50L68 60" stroke="#00F0FF" strokeWidth="6" strokeLinecap="round" />
          <circle cx="50" cy="50" r="8" fill="#FFDE00" />
        </svg>
      );

    case 'citybank':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size} fill="none">
          <rect width="100" height="100" rx="20" fill="#ED1C24" />
          <path d="M25 45L50 24L75 45V76H25V45Z" fill="#FFFFFF" />
          <rect x="36" y="52" width="8" height="24" fill="#ED1C24" />
          <rect x="56" y="52" width="8" height="24" fill="#ED1C24" />
        </svg>
      );

    case 'ibbl':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size} fill="none">
          <rect width="100" height="100" rx="20" fill="#0A5C36" />
          <circle cx="50" cy="50" r="30" stroke="#E6A117" strokeWidth="5" />
          <path d="M34 50C34 41.16 41.16 34 50 34C58.84 34 66 41.16 66 50H34Z" fill="#E6A117" />
          <path d="M44 50L50 68L56 50H44Z" fill="#FFFFFF" />
        </svg>
      );

    case 'bracbank':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size} fill="none">
          <rect width="100" height="100" rx="20" fill="#004A99" />
          <path d="M26 30H74L60 70H40L26 30Z" fill="#F47920" />
          <circle cx="50" cy="46" r="8" fill="#FFFFFF" />
        </svg>
      );

    // --- GLOBAL CRYPTO WALLETS ---
    case 'binance':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size} fill="none">
          <rect width="100" height="100" rx="20" fill="#181A20" />
          <path d="M50 22L62 34L50 46L38 34L50 22Z" fill="#F0B90B" />
          <path d="M28 44L40 56L28 68L16 56L28 44Z" fill="#F0B90B" />
          <path d="M72 44L84 56L72 68L60 56L72 44Z" fill="#F0B90B" />
          <path d="M50 54L62 66L50 78L38 66L50 54Z" fill="#F0B90B" />
          <path d="M50 38L58 46L50 54L42 46L50 38Z" fill="#F0B90B" />
        </svg>
      );

    case 'trustwallet':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size} fill="none">
          <rect width="100" height="100" rx="20" fill="#0B1A30" />
          <path d="M50 20C65 24 74 34 74 54C74 72 50 82 50 82C50 82 26 72 26 54C26 34 35 24 50 20Z" fill="#0500FF" />
          <path d="M50 26C61 29 68 37 68 53C68 67 50 75 50 75V26Z" fill="#3375BB" />
          <path d="M50 38L60 48L44 64L38 58L42 54L44 56L56 44L50 38Z" fill="#FFFFFF" />
        </svg>
      );

    case 'metamask':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size} fill="none">
          <rect width="100" height="100" rx="20" fill="#1C1814" />
          <path d="M22 22L42 36L48 20L22 22Z" fill="#E2761B" />
          <path d="M78 22L52 20L58 36L78 22Z" fill="#E2761B" />
          <path d="M30 68L38 80L50 84L62 80L70 68L66 54L50 62L34 54L30 68Z" fill="#E2761B" />
          <path d="M50 62L66 54L74 46L58 36L50 48L42 36L26 46L34 54L50 62Z" fill="#E4761B" />
          <path d="M38 52L32 46L42 36L38 52Z" fill="#D7C1B3" />
          <path d="M62 52L58 36L68 46L62 52Z" fill="#D7C1B3" />
          <circle cx="40" cy="50" r="3" fill="#161616" />
          <circle cx="60" cy="50" r="3" fill="#161616" />
        </svg>
      );

    case 'phantom':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size} fill="none">
          <rect width="100" height="100" rx="20" fill="#201C38" />
          <path d="M25 50C25 36 36 25 50 25C64 25 75 36 75 50V68C75 74 70 79 64 79C58 79 55 74 50 74C45 74 42 79 36 79C30 79 25 74 25 68V50Z" fill="#AB9FF2" />
          <circle cx="42" cy="46" r="4.5" fill="#201C38" />
          <circle cx="58" cy="46" r="4.5" fill="#201C38" />
        </svg>
      );

    case 'okx':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size} fill="none">
          <rect width="100" height="100" rx="20" fill="#000000" />
          <rect x="25" y="25" width="22" height="22" rx="3" fill="#FFFFFF" />
          <rect x="53" y="25" width="22" height="22" rx="3" fill="#FFFFFF" />
          <rect x="25" y="53" width="22" height="22" rx="3" fill="#FFFFFF" />
          <rect x="53" y="53" width="22" height="22" rx="3" fill="#FFFFFF" />
          <rect x="39" y="39" width="22" height="22" rx="3" fill="#000000" />
        </svg>
      );

    case 'bybit':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size} fill="none">
          <rect width="100" height="100" rx="20" fill="#121214" />
          <path d="M30 25H52C62 25 68 31 68 39C68 45 64 50 58 52C65 54 70 60 70 68C70 76 63 82 52 82H30V25Z" fill="#F7A600" />
          <path d="M42 36H50C54 36 56 38 56 42C56 46 54 48 50 48H42V36Z" fill="#121214" />
          <path d="M42 58H51C55 58 58 60 58 65C58 70 55 72 51 72H42V58Z" fill="#121214" />
        </svg>
      );

    case 'kucoin':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size} fill="none">
          <rect width="100" height="100" rx="20" fill="#0C1D24" />
          <path d="M32 25H44V44L60 25H74L54 48L76 75H61L44 54V75H32V25Z" fill="#24AE8F" />
          <circle cx="68" cy="32" r="5" fill="#00E5A3" />
        </svg>
      );

    case 'coinbase':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size} fill="none">
          <rect width="100" height="100" rx="20" fill="#0052FF" />
          <circle cx="50" cy="50" r="28" fill="#FFFFFF" />
          <rect x="42" y="42" width="16" height="16" rx="4" fill="#0052FF" />
        </svg>
      );

    case 'tronlink':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size} fill="none">
          <rect width="100" height="100" rx="20" fill="#2B0506" />
          <path d="M22 25L78 28L70 82L22 25Z" fill="#FF060A" />
          <path d="M36 34L70 52L30 68L36 34Z" fill="#FFFFFF" />
          <path d="M30 68L70 52L64 74L30 68Z" fill="#FF787A" />
        </svg>
      );

    case 'safepal':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size} fill="none">
          <rect width="100" height="100" rx="20" fill="#0A1838" />
          <path d="M60 24H35C28 24 22 30 22 37C22 44 28 50 35 50H65C72 50 78 56 78 63C78 70 72 76 65 76H40" stroke="#2354E6" strokeWidth="10" strokeLinecap="round" />
          <circle cx="65" cy="76" r="6" fill="#00E5FF" />
        </svg>
      );

    case 'bitget':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size} fill="none">
          <rect width="100" height="100" rx="20" fill="#072228" />
          <path d="M26 30L44 48L26 66L36 76L64 48L36 20L26 30Z" fill="#00F0FF" />
          <path d="M52 30L70 48L52 66L62 76L90 48L62 20L52 30Z" fill="#0088FF" />
        </svg>
      );

    case 'mexc':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size} fill="none">
          <rect width="100" height="100" rx="20" fill="#0B231D" />
          <path d="M24 74V26L50 56L76 26V74H64V46L50 62L36 46V74H24Z" fill="#00B894" />
          <circle cx="50" cy="26" r="5" fill="#00F0FF" />
        </svg>
      );

    case 'exodus':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size} fill="none">
          <rect width="100" height="100" rx="20" fill="#170F2C" />
          <path d="M50 18L80 34V66L50 82L20 66V34L50 18Z" stroke="#8952FF" strokeWidth="6" fill="none" />
          <path d="M50 30L70 42V58L50 70L30 58V42L50 30Z" fill="#8952FF" />
          <circle cx="50" cy="50" r="5" fill="#00F0FF" />
        </svg>
      );

    case 'ledger':
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size} fill="none">
          <rect width="100" height="100" rx="20" fill="#0A0A0A" />
          <path d="M24 24H44V34H34V44H24V24Z" fill="#FFFFFF" />
          <path d="M76 24H56V34H66V44H76V24Z" fill="#FFFFFF" />
          <path d="M24 76H44V66H34V56H24V76Z" fill="#FFFFFF" />
          <path d="M76 76H56V66H66V56H76V76Z" fill="#FFFFFF" />
          <rect x="42" y="42" width="16" height="16" fill="#00F0FF" />
        </svg>
      );

    // Default TIXA Native
    default:
      return (
        <svg viewBox="0 0 100 100" className={className} width={size} height={size} fill="none">
          <rect width="100" height="100" rx="20" fill="#051923" />
          <circle cx="50" cy="50" r="32" stroke="#00E5FF" strokeWidth="6" />
          <path d="M34 38H66M50 38V68" stroke="#00E5FF" strokeWidth="7" strokeLinecap="round" />
          <circle cx="50" cy="50" r="6" fill="#FFD700" />
        </svg>
      );
  }
};

interface TixaCoBrandedBadgeProps {
  logoType: string;
  brandName: string;
  brandNameBn?: string;
  badge?: string;
  selected?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export const TixaCoBrandedBadge: React.FC<TixaCoBrandedBadgeProps> = ({
  logoType,
  brandName,
  brandNameBn,
  badge,
  selected = false,
  onClick,
  size = 'md'
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative w-full text-left rounded-2xl border transition-all duration-200 ${
        selected
          ? 'bg-gradient-to-br from-cyan-950/90 via-slate-900 to-blue-950/90 border-cyan-400 shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400'
          : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
      } ${size === 'sm' ? 'p-2.5' : 'p-3.5'}`}
    >
      <div className="flex items-center gap-3">
        {/* Co-Branded Dual Logo Icon Container */}
        <div className="relative shrink-0 flex items-center">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md flex items-center justify-center bg-slate-950 border border-slate-800 group-hover:scale-105 transition-transform">
            <PaymentLogoIcon type={logoType} className="w-8 h-8" />
          </div>
          {/* TIXA mini co-brand tag overlay */}
          <div className="absolute -bottom-1.5 -right-1 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-black text-[8px] font-mono tracking-tighter shadow-md border border-black/40">
            TIXA
          </div>
        </div>

        {/* Text Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <h4 className="text-xs font-bold text-white truncate font-heading group-hover:text-cyan-300 transition-colors">
              {brandName}
            </h4>
            {badge && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono shrink-0">
                {badge}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] text-slate-400 font-mono truncate">
              {brandNameBn ? `${brandNameBn} ⚡ ` : ''}TIXAPAY Gateway
            </span>
          </div>
        </div>
      </div>
    </button>
  );
};
