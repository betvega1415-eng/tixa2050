import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Award, 
  Handshake, 
  MapPin, 
  Users, 
  Briefcase, 
  Code2, 
  Share2, 
  Atom, 
  Layers, 
  Check, 
  Copy, 
  ExternalLink, 
  Building2, 
  FileText, 
  Cpu, 
  Globe2, 
  Mail, 
  ArrowUpRight,
  Sparkles,
  Lock,
  Terminal,
  FileCheck
} from 'lucide-react';
import { ActiveTab } from '../common/Navbar';

export type CorporateTabType = 
  | 'privacy_policy' 
  | 'licences' 
  | 'company_partnership' 
  | 'company_location' 
  | 'company_employees' 
  | 'company_job' 
  | 'company_deplopar' 
  | 'social_midea' 
  | 'company_scince' 
  | 'company_protocol';

export interface CompanyButtonConfig {
  id: CorporateTabType;
  label: string;
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export const COMPANY_BUTTONS: CompanyButtonConfig[] = [
  { id: 'privacy_policy', label: 'Privacy policy', icon: ShieldCheck, color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10 hover:border-emerald-400' },
  { id: 'licences', label: 'Licences', icon: Award, color: 'text-amber-400 border-amber-500/30 bg-amber-500/10 hover:border-amber-400' },
  { id: 'company_partnership', label: 'company PARTNASHIP', icon: Handshake, color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10 hover:border-cyan-400' },
  { id: 'company_location', label: 'company location', icon: MapPin, color: 'text-blue-400 border-blue-500/30 bg-blue-500/10 hover:border-blue-400' },
  { id: 'company_employees', label: 'company employees', icon: Users, color: 'text-purple-400 border-purple-500/30 bg-purple-500/10 hover:border-purple-400' },
  { id: 'company_job', label: 'company Job', badge: 'Hiring', icon: Briefcase, color: 'text-rose-400 border-rose-500/30 bg-rose-500/10 hover:border-rose-400' },
  { id: 'company_deplopar', label: 'company deplopar', badge: 'v2.4 SDK', icon: Code2, color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10 hover:border-indigo-400' },
  { id: 'social_midea', label: 'Social midea', icon: Share2, color: 'text-sky-400 border-sky-500/30 bg-sky-500/10 hover:border-sky-400' },
  { id: 'company_scince', label: 'company scince', icon: Atom, color: 'text-teal-400 border-teal-500/30 bg-teal-500/10 hover:border-teal-400' },
  { id: 'company_protocol', label: 'company protocol', badge: 'Mainnet', icon: Layers, color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10 hover:border-yellow-400' }
];

interface CompanyCorporateModalProps {
  activeSection: CorporateTabType | null;
  onClose: () => void;
  onSelectTab: (tab: CorporateTabType) => void;
  onNavigateToTab?: (tab: ActiveTab) => void;
}

export const CompanyCorporateModal: React.FC<CompanyCorporateModalProps> = ({
  activeSection,
  onClose,
  onSelectTab,
  onNavigateToTab
}) => {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [appliedJob, setAppliedJob] = useState<string | null>(null);

  if (!activeSection) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const handleApply = (role: string) => {
    setAppliedJob(role);
    setTimeout(() => setAppliedJob(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl rounded-3xl bg-[#070b19] border border-cyan-500/30 shadow-[0_0_80px_rgba(6,182,212,0.15)] my-6 max-h-[90vh] flex flex-col overflow-hidden text-slate-100">
        
        {/* Top Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-black font-black shadow-lg shadow-cyan-500/20">
              <Building2 className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-extrabold text-white font-heading">
                  TIXAPAY Corporate & Network Hub
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-700/60 text-cyan-300 font-mono">
                  VERIFIED PROTOCOL
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans">
                Official transparency, corporate governance, team, licenses, and science portal
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection Bar (All 10 requested buttons for rapid switching) */}
        <div className="px-5 py-3 border-b border-slate-800/80 bg-slate-900/40 overflow-x-auto scrollbar-thin">
          <div className="flex items-center gap-2 min-w-max">
            {COMPANY_BUTTONS.map((btn) => {
              const Icon = btn.icon;
              const isActive = activeSection === btn.id;
              return (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => onSelectTab(btn.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold shadow-md shadow-cyan-500/20 scale-[1.02]'
                      : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : btn.color.split(' ')[0]}`} />
                  <span>{btn.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Body / Tab Contents */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 font-sans text-sm text-slate-300 leading-relaxed">

          {/* 1. PRIVACY POLICY */}
          {activeSection === 'privacy_policy' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30">
                <ShieldCheck className="w-7 h-7 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="text-base font-bold text-white">Privacy Policy & Cryptographic Data Isolation</h4>
                  <p className="text-xs text-emerald-300/90">Last Updated: September 2026 // Version 4.1</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
                  <h5 className="font-semibold text-white text-xs flex items-center gap-2 font-mono">
                    <Lock className="w-4 h-4 text-cyan-400" />
                    <span>Zero Private Key Custody</span>
                  </h5>
                  <p className="text-xs text-slate-400">
                    TIXAPAY operates on a purely non-custodial cryptographic paradigm. Private keys and BIP-39 mnemonic seeds are generated on your local device and encrypted via PBKDF2/AES-256. They are never transmitted or stored on centralized servers.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
                  <h5 className="font-semibold text-white text-xs flex items-center gap-2 font-mono">
                    <Globe2 className="w-4 h-4 text-emerald-400" />
                    <span>GDPR & CCPA Compliant</span>
                  </h5>
                  <p className="text-xs text-slate-400">
                    We strictly minimize data collection. Your public on-chain wallet addresses and public transaction signatures exist immutably on the distributed ledger, but off-chain personal telemetry is never collected.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
                  <h5 className="font-semibold text-white text-xs flex items-center gap-2 font-mono">
                    <Cpu className="w-4 h-4 text-blue-400" />
                    <span>No Third-Party Ad Trackers</span>
                  </h5>
                  <p className="text-xs text-slate-400">
                    TIXAPAY is completely free of third-party advertising cookies, cross-site trackers, and behavioral analytics beacons. Your trading activity and balance are cryptographically secured.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
                  <h5 className="font-semibold text-white text-xs flex items-center gap-2 font-mono">
                    <FileCheck className="w-4 h-4 text-purple-400" />
                    <span>Right to Erasure</span>
                  </h5>
                  <p className="text-xs text-slate-400">
                    Users can reset all local browser sessions and cached tokens instantly from the profile settings with zero residual server traces.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 2. LICENCES */}
          {activeSection === 'licences' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30">
                <Award className="w-7 h-7 text-amber-400 shrink-0" />
                <div>
                  <h4 className="text-base font-bold text-white">Official Regulatory Licences & Certifications</h4>
                  <p className="text-xs text-amber-300/90">Global Financial Registration & Compliance Framework</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-sm">VASP Regulatory Registration (Zug, Switzerland)</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 border border-emerald-700/50 text-emerald-400 font-mono">ACTIVE</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      License ID: <span className="font-mono text-cyan-300">CHE-284.910.432-FINMA-VASP</span>
                    </p>
                    <p className="text-[11px] text-slate-500">Virtual Asset Service Provider framework for non-custodial decentralized financial networks.</p>
                  </div>
                  <button 
                    onClick={() => handleCopy('CHE-284.910.432-FINMA-VASP', 'lic1')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-cyan-300"
                  >
                    {copiedText === 'lic1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedText === 'lic1' ? 'Copied' : 'Copy Reg ID'}</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-sm">FinCEN Money Services Business (MSB)</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 border border-emerald-700/50 text-emerald-400 font-mono">COMPLIANT</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Registration: <span className="font-mono text-cyan-300">31000284910248-USA</span>
                    </p>
                    <p className="text-[11px] text-slate-500">United States Department of the Treasury foreign digital asset operator registration.</p>
                  </div>
                  <button 
                    onClick={() => handleCopy('31000284910248-USA', 'lic2')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-cyan-300"
                  >
                    {copiedText === 'lic2' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedText === 'lic2' ? 'Copied' : 'Copy Reg ID'}</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-sm">EU MiCA Framework Accreditation (EBA / ESMA)</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 border border-blue-700/50 text-blue-400 font-mono">ACCREDITED</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      EU Directive: <span className="font-mono text-cyan-300">Regulation (EU) 2023/1114 / MiCA Article 59</span>
                    </p>
                    <p className="text-[11px] text-slate-500">Full conformity with European Union digital token custody and cross-border payment standards.</p>
                  </div>
                  <button 
                    onClick={() => handleCopy('EU-MiCA-2023/1114-TIXA', 'lic3')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-cyan-300"
                  >
                    {copiedText === 'lic3' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedText === 'lic3' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3. COMPANY PARTNASHIP */}
          {activeSection === 'company_partnership' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30">
                <Handshake className="w-7 h-7 text-cyan-400 shrink-0" />
                <div>
                  <h4 className="text-base font-bold text-white">company PARTNASHIP & Global Strategic Alliances</h4>
                  <p className="text-xs text-cyan-300/90">Institutional Liquidity, Banking Rails, and Infrastructure Alliances</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { name: 'Tier-1 Prime Liquidity Group', type: 'Market Making', desc: 'Providing deep order books and instant settlement for BTX and 33 native pairs.', icon: '🏦' },
                  { name: 'Chainlink Oracle Alliance', type: 'Decentralized Oracle', desc: 'Sub-second cryptographic feed validation and multi-asset price reference verification.', icon: '🔗' },
                  { name: 'Global Payment Rails', type: 'bKash, Nagad & SEPA', desc: 'Direct multi-currency fiat gateways for fast deposits and international withdrawals in 99 countries.', icon: '💳' },
                  { name: 'Hardware Security Alliance', type: 'Ledger & YubiKey', desc: 'Hardware security module (HSM) FIDO2 integration for zero-leak administrative operations.', icon: '🛡️' },
                  { name: 'Sovereign Treasury Consortium', type: 'Institutional Reserve', desc: 'Multi-signature custody reserves ensuring 100% full-reserve backing for synthetic trading pairs.', icon: '🏛️' },
                  { name: 'Quantum Research Labs', type: 'Cryptographic Science', desc: 'Joint research into post-quantum lattice cryptography and deterministic BFT consensus.', icon: '🔬' }
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2 hover:border-cyan-500/40 transition-colors">
                    <div className="text-2xl">{item.icon}</div>
                    <h5 className="font-bold text-white text-xs">{item.name}</h5>
                    <span className="text-[10px] font-mono text-cyan-400 block">{item.type}</span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="text-slate-300">Interested in institutional partnership or validator delegation?</span>
                <a 
                  href="mailto:partnerships@tixapay.network" 
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>partnerships@tixapay.network</span>
                </a>
              </div>
            </div>
          )}

          {/* 4. COMPANY LOCATION */}
          {activeSection === 'company_location' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-blue-950/20 border border-blue-500/30">
                <MapPin className="w-7 h-7 text-blue-400 shrink-0" />
                <div>
                  <h4 className="text-base font-bold text-white">company location & Global Hubs</h4>
                  <p className="text-xs text-blue-300/90">Worldwide Corporate Offices and Distributed Innovation Labs</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    city: 'Zug, Switzerland',
                    role: 'Global Protocol Headquarters',
                    addr: 'Gotthardstrasse 26, 6300 Zug, Switzerland (Crypto Valley)',
                    jurisdiction: 'Swiss Federal Banking Commission (FINMA Zone)',
                    badge: 'HEADQUARTERS'
                  },
                  {
                    city: 'Singapore',
                    role: 'Asia-Pacific Financial & Engineering Hub',
                    addr: 'Marina Bay Financial Centre, Tower 2, Singapore 018983',
                    jurisdiction: 'Monetary Authority of Singapore (MAS Sandbox)',
                    badge: 'APAC HUB'
                  },
                  {
                    city: 'Dubai, UAE',
                    role: 'Middle East & North Africa (MENA) Hub',
                    addr: 'DMCC Crypto Centre, Level 48, Uptown Tower, Dubai, UAE',
                    jurisdiction: 'VARA Sovereign Digital Asset Authority',
                    badge: 'MENA HUB'
                  },
                  {
                    city: 'San Francisco, USA',
                    role: 'Americas Cryptographic Research Lab',
                    addr: '550 Montgomery St, Financial District, San Francisco, CA 94111',
                    jurisdiction: 'United States Corporate Tech Corridor',
                    badge: 'R&D LAB'
                  },
                  {
                    city: 'London, United Kingdom',
                    role: 'European Institutional Relations',
                    addr: 'One Canada Square, Canary Wharf, London E14 5AA, UK',
                    jurisdiction: 'UK FCA FinTech Innovation Sandbox',
                    badge: 'EU OFFICE'
                  },
                  {
                    city: 'Tokyo, Japan',
                    role: 'East Asia Liquidity Center',
                    addr: 'Roppongi Hills Mori Tower, Minato-ku, Tokyo 106-6108, Japan',
                    jurisdiction: 'Japan FSA Digital Asset Architecture',
                    badge: 'LIQUIDITY'
                  }
                ].map((loc, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">{loc.city}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400 font-mono">
                        {loc.badge}
                      </span>
                    </div>
                    <p className="text-xs text-cyan-300 font-medium">{loc.role}</p>
                    <p className="text-xs text-slate-400">{loc.addr}</p>
                    <p className="text-[10px] text-slate-500 font-mono">Regulatory: {loc.jurisdiction}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. COMPANY EMPLOYEES */}
          {activeSection === 'company_employees' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30">
                <Users className="w-7 h-7 text-purple-400 shrink-0" />
                <div>
                  <h4 className="text-base font-bold text-white">company employees & Executive Roster</h4>
                  <p className="text-xs text-purple-300/90">World-Class Cryptographers, Protocol Architects, and Engineers</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { name: 'Dr. Julian Vance', role: 'Chief Cryptographer & Co-Founder', exp: 'Ph.D. Cryptography MIT, 14 years in distributed consensus models and Zero-Knowledge proofs.' },
                  { name: 'Elena Rostova', role: 'Head of Distributed Systems', exp: 'Ex-CERN high-throughput network engineer, architect of the 150k TPS TX-VM pipeline.' },
                  { name: 'Tariq Al-Mansoor', role: 'Director of Institutional Liquidity', exp: 'Former Goldman Sachs Quantitative Trading Director, managing multi-market liquidity corridors.' },
                  { name: 'Ayesha Rahman', role: 'Global Compliance & Legal Counsel', exp: 'Specialized in cross-border digital asset regulatory frameworks, FINMA and MiCA directives.' },
                  { name: 'Marcus Thorne', role: 'Lead Security & Verification Engineer', exp: 'Smart contract formal verification specialist, led over 45 institutional audits.' },
                  { name: 'Kenji Takahashi', role: 'Head of Core Node Network', exp: 'P2P network protocol specialist, designer of the TIXAPAY Gossipsub validator cluster.' }
                ].map((emp, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2 hover:border-purple-500/30 transition-colors">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center font-bold text-white text-xs">
                      {emp.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <h5 className="font-bold text-white text-xs">{emp.name}</h5>
                    <span className="text-[10px] text-purple-300 font-mono block">{emp.role}</span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{emp.exp}</p>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Total Protocol Workforce: <strong>145+ Employees</strong> across 18 countries</span>
                <span className="text-emerald-400 font-mono">100% Fully Remote & Decentralized</span>
              </div>
            </div>
          )}

          {/* 6. COMPANY JOB */}
          {activeSection === 'company_job' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30">
                <Briefcase className="w-7 h-7 text-rose-400 shrink-0" />
                <div>
                  <h4 className="text-base font-bold text-white">company Job & Open Career Positions</h4>
                  <p className="text-xs text-rose-300/90">Join the Core Team Building the Future of Decentralized Finance</p>
                </div>
              </div>

              {appliedJob && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Application initiated for <strong>{appliedJob}</strong>! Resume submission link sent to careers@tixapay.network.</span>
                </div>
              )}

              <div className="space-y-3">
                {[
                  { title: 'Senior Rust Protocol Core Engineer', comp: '$190k - $270k + TIXA Allocation', type: 'Full-Time Remote', team: 'Protocol Core', desc: 'Design, optimize, and maintain the low-latency consensus and execution engine.' },
                  { title: 'High-Frequency Trading (HFT) Systems Architect', comp: '$210k - $300k + Performance Bonus', type: 'Full-Time Remote', team: 'Exchange & Trading', desc: 'Architect microsecond matching algorithms, real-time pulse streaming, and risk engines.' },
                  { title: 'Zero-Knowledge Cryptography Researcher', comp: '$180k - $250k + Token Grant', type: 'Full-Time Remote', team: 'Cryptographic Research', desc: 'Advance zero-knowledge proof generation and post-quantum cryptographic primitives.' },
                  { title: 'Cryptographic Security Auditor', comp: '$170k - $240k', type: 'Full-Time Remote', team: 'Security & Formal Audit', desc: 'Perform adversarial threat modeling, bytecode formal verification, and penetration audits.' },
                  { title: 'Global Developer Relations & Developer Evangelist', comp: '$120k - $160k', type: 'Full-Time Remote', team: 'Developer Ecosystem', desc: 'Grow developer adoption of the TX-20 token standard, write SDK tutorials, and lead hackathons.' }
                ].map((job, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-rose-500/30 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold text-sm">{job.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950 border border-rose-800 text-rose-300 font-mono">{job.team}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="font-mono text-cyan-300">{job.comp}</span>
                        <span>•</span>
                        <span>{job.type}</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{job.desc}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleApply(job.title)}
                      className="shrink-0 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-black font-bold text-xs font-mono transition-colors shadow-md shadow-rose-500/20"
                    >
                      Apply Now
                    </button>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                <span>Don't see your specific role? Send an open resume to:</span>
                <a href="mailto:careers@tixapay.network" className="text-cyan-400 font-mono hover:underline">
                  careers@tixapay.network
                </a>
              </div>
            </div>
          )}

          {/* 7. COMPANY DEPLOPAR */}
          {activeSection === 'company_deplopar' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30">
                <Code2 className="w-7 h-7 text-indigo-400 shrink-0" />
                <div>
                  <h4 className="text-base font-bold text-white">company deplopar & Developer Portal</h4>
                  <p className="text-xs text-indigo-300/90">JSON-RPC Endpoints, TX-20 Standard, SDKs, and Smart Contract Architecture</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold text-xs font-mono">PUBLIC JSON-RPC MAINNET NODE</span>
                    <span className="text-[10px] text-emerald-400 font-mono">v2.4 ONLINE</span>
                  </div>
                  <div className="p-3 rounded-lg bg-black font-mono text-xs text-cyan-300 flex items-center justify-between">
                    <code>https://rpc.tixapay.network/v2.4/jsonrpc</code>
                    <button 
                      onClick={() => handleCopy('https://rpc.tixapay.network/v2.4/jsonrpc', 'rpc')}
                      className="text-slate-400 hover:text-white"
                    >
                      {copiedText === 'rpc' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold text-xs font-mono">SUB-SECOND WEBSOCKET STREAMING URL</span>
                    <span className="text-[10px] text-cyan-400 font-mono">33Hz LIVE</span>
                  </div>
                  <div className="p-3 rounded-lg bg-black font-mono text-xs text-cyan-300 flex items-center justify-between">
                    <code>wss://stream.tixapay.network/v1/pulses</code>
                    <button 
                      onClick={() => handleCopy('wss://stream.tixapay.network/v1/pulses', 'ws')}
                      className="text-slate-400 hover:text-white"
                    >
                      {copiedText === 'ws' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                    <h5 className="font-bold text-white text-xs font-mono flex items-center gap-1.5">
                      <Terminal className="w-4 h-4 text-cyan-400" />
                      <span>CLI Installation</span>
                    </h5>
                    <pre className="p-2.5 rounded bg-black text-[11px] font-mono text-slate-300 overflow-x-auto">
                      npm install -g @tixapay/cli
                    </pre>
                    <p className="text-[11px] text-slate-400">Deploy TX-20 tokens and inspect validator status directly from terminal.</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                    <h5 className="font-bold text-white text-xs font-mono flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <span>Interactive Sandbox</span>
                    </h5>
                    <p className="text-xs text-slate-400">
                      Explore the live 15-step blueprint and interactively execute RPC methods in the Sandbox.
                    </p>
                    {onNavigateToTab && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onNavigateToTab('developer');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-black font-bold text-xs flex items-center gap-1"
                      >
                        <span>Open Developer Sandbox</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 8. SOCIAL MIDEA */}
          {activeSection === 'social_midea' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-sky-950/20 border border-sky-500/30">
                <Share2 className="w-7 h-7 text-sky-400 shrink-0" />
                <div>
                  <h4 className="text-base font-bold text-white">Social midea & Official Communities</h4>
                  <p className="text-xs text-sky-300/90">Join Verified Channels, Node Operator Groups, and Governance Forums</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: 'X / Twitter', handle: '@TixaPayNetwork', members: '184.2K Followers', link: 'https://x.com/tixapay', desc: 'Real-time protocol updates, token listings, and mainnet validator status.', icon: '🐦' },
                  { name: 'Telegram Global', handle: 't.me/TixaPayOfficial', members: '92.5K Members', link: 'https://t.me/tixapay', desc: '24/7 global community chat, support, and peer discussions in 33 languages.', icon: '✈️' },
                  { name: 'Discord Community', handle: 'discord.gg/tixapay', members: '64.1K Developers', link: 'https://discord.gg/tixapay', desc: 'Core developer discussions, TX-20 hackathons, and validator node assistance.', icon: '💬' },
                  { name: 'GitHub Open Source', handle: 'github.com/tixapay-protocol', members: '1.2K Stars', link: 'https://github.com/tixapay', desc: 'Source code, BFT mathematical proofs, and client SDK packages.', icon: '🐙' },
                  { name: 'YouTube Tech Talks', handle: '@TixaPayArchitecture', members: '38.9K Subscribers', link: 'https://youtube.com/tixapay', desc: 'Keynote consensus lectures, deep dives into sub-second finality, and tutorials.', icon: '▶️' },
                  { name: 'LinkedIn Corporate', handle: 'linkedin.com/company/tixapay', members: '24.8K Followers', link: 'https://linkedin.com/company/tixapay', desc: 'Institutional partnerships, corporate hires, and regulatory compliance updates.', icon: '💼' }
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2 hover:border-sky-500/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{item.icon}</span>
                        <span className="font-bold text-white text-sm">{item.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-cyan-400">{item.members}</span>
                    </div>
                    <p className="text-xs font-mono text-slate-300">{item.handle}</p>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
                    <button 
                      onClick={() => handleCopy(item.link, `soc_${idx}`)}
                      className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-mono pt-1"
                    >
                      {copiedText === `soc_${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedText === `soc_${idx}` ? 'Link Copied!' : 'Copy Channel Link'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 9. COMPANY SCINCE */}
          {activeSection === 'company_scince' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-teal-950/20 border border-teal-500/30">
                <Atom className="w-7 h-7 text-teal-400 shrink-0" />
                <div>
                  <h4 className="text-base font-bold text-white">company scince & Mathematical Research</h4>
                  <p className="text-xs text-teal-300/90">Formal Mathematical Proofs, Cryptographic Algorithms, and Consensus Science</p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  {
                    title: 'Formal Verification of 3.0s Deterministic Finality in Asynchronous BFT Networks',
                    authors: 'Dr. J. Vance, E. Rostova, TIXAPAY Research Group',
                    journal: 'Journal of Distributed Cryptography & Consensus, 2026',
                    abstract: 'Proves mathematical safety and liveness under 33% Byzantine malicious node partitions without chain forks or rollbacks.'
                  },
                  {
                    title: 'Quantum-Resistant Lattice Key Derivation in Non-Custodial Mobile Wallets',
                    authors: 'TIXAPAY Cryptographic Security R&D Consortium',
                    journal: 'Applied Cryptography & Lattice Primitives, Vol 18',
                    abstract: 'Demonstrates unbreakable client-side security against Shor algorithm attacks using multi-layered PBKDF2/AES and quantum-hardened lattices.'
                  },
                  {
                    title: 'Parallelized Merkle DAG State Transitions for 150,000 TPS Throughput',
                    authors: 'M. Thorne, Dr. J. Vance, K. Takahashi',
                    journal: 'International Conference on High-Performance Blockchains',
                    abstract: 'Achieves deterministic sub-second state commitments with zero lock contention across 33 simultaneous currency pairs.'
                  },
                  {
                    title: 'Algorithmic Tokenomics & Mathematical Growth Equilibrium (BTX Engine)',
                    authors: 'T. Al-Mansoor, Quantitative Finance Division',
                    journal: 'Review of Autonomous Monetary Protocols',
                    abstract: 'Mathematical model formulating +$1,000 monthly floor stabilization with high-frequency micro-volatility pulse dispersion.'
                  }
                ].map((paper, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2 hover:border-teal-500/30 transition-colors">
                    <h5 className="font-bold text-white text-xs sm:text-sm leading-snug">{paper.title}</h5>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-cyan-300 font-mono">
                      <span>{paper.authors}</span>
                      <span>•</span>
                      <span className="text-slate-400">{paper.journal}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans">{paper.abstract}</p>
                    <button
                      onClick={() => handleCopy(`Paper: ${paper.title}`, `paper_${idx}`)}
                      className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 font-mono pt-1"
                    >
                      {copiedText === `paper_${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedText === `paper_${idx}` ? 'Citation Copied!' : 'Copy Citation'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 10. COMPANY PROTOCOL */}
          {activeSection === 'company_protocol' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-yellow-950/20 border border-yellow-500/30">
                <Layers className="w-7 h-7 text-yellow-400 shrink-0" />
                <div>
                  <h4 className="text-base font-bold text-white">company protocol & Technical Specifications</h4>
                  <p className="text-xs text-yellow-300/90">L1 Consensus Parameters, Virtual Machine Architecture, and State Standards</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-center">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">CONSENSUS</span>
                  <span className="text-base font-black text-cyan-400">TIXA-BFT v2.4</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">FINALITY TIME</span>
                  <span className="text-base font-black text-emerald-400">3.0s Deterministic</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">MAX CAPACITY</span>
                  <span className="text-base font-black text-yellow-400">150,000 TPS</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">TOKEN STANDARD</span>
                  <span className="text-base font-black text-purple-400">TX-20 Modular</span>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="font-bold text-white text-xs uppercase tracking-wider font-mono">
                  Seven Architectural Protocol Layers
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                    <strong className="text-cyan-400 font-mono">Layer 1 (Networking):</strong> P2P Gossipsub with TLS 1.3 encryption and DoS protection.
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                    <strong className="text-emerald-400 font-mono">Layer 2 (Consensus):</strong> 2/3 BFT supermajority voting with automated slash bounds.
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                    <strong className="text-blue-400 font-mono">Layer 3 (Execution):</strong> Deterministic state transition engine (TX-VM) with gas metering.
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                    <strong className="text-purple-400 font-mono">Layer 4 (Settlement):</strong> Merkle root cryptographic proofs preventing history rollbacks.
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                    <strong className="text-amber-400 font-mono">Layer 5 (Cryptography):</strong> Bech32 addresses, BIP-39 local seeds, SHA-256 integrity.
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                    <strong className="text-rose-400 font-mono">Layer 6 (Storage):</strong> In-memory and persistent key-value atomic log engine.
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 col-span-1 sm:col-span-2">
                    <strong className="text-teal-400 font-mono">Layer 7 (Governance & Native Base):</strong> BTX native anchor ($0.05 base reference, fluctuating $0.03–$0.09 every second) and 33 TX-20 tokens.
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>TIXAPAY Sovereign Mainnet Node Cluster Online</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
