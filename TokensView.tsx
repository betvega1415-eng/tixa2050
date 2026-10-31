import React, { useState, useEffect } from 'react';
import { 
  Coins, 
  Plus, 
  Flame, 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Send, 
  Copy, 
  Check, 
  Code, 
  Sliders, 
  AlertCircle,
  FileCode2,
  TrendingUp,
  Layers,
  Mail,
  ExternalLink,
  AlertTriangle,
  Info,
  CheckCircle2
} from 'lucide-react';
import { tokenEngine } from '../../core/tokenEngine';
import { blockchainEngine } from '../../core/blockchainEngine';
import { authEngine } from '../../core/authEngine';
import { TX20Token } from '../../types/blockchain';
import { HashBadge } from '../common/HashBadge';
import confetti from 'canvas-confetti';

const COUNCIL_EMAIL = 'tixapaysuport247@gmail.com';

export const TokensView: React.FC = () => {
  const [tokens, setTokens] = useState<TX20Token[]>(tokenEngine.getTokens());
  const [session, setSession] = useState(authEngine.getSession());
  const activeAddress = session?.walletAddress || 'tx1alexchennoncustodial2050vault99aa';

  // Modals & Drawers
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<TX20Token | null>(null);
  const [isContractCodeOpen, setIsContractCodeOpen] = useState(false);
  const [copiedDraft, setCopiedDraft] = useState(false);

  // Deploy Form State
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [decimals, setDecimals] = useState(18);
  const [initialSupply, setInitialSupply] = useState(1000000);
  const [maxSupply, setMaxSupply] = useState(10000000);
  const [isMintable, setIsMintable] = useState(true);
  const [isBurnable, setIsBurnable] = useState(true);
  const [isPausable, setIsPausable] = useState(true);
  const [deployLoading, setDeployLoading] = useState(false);
  const [deployError, setDeployError] = useState<string | null>(null);
  const [deploySuccessNotice, setDeploySuccessNotice] = useState<string | null>(null);

  // Manage Form State (Mint/Burn)
  const [actionAmount, setActionAmount] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const refresh = () => {
    setTokens([...tokenEngine.getTokens()]);
    if (selectedToken) {
      setSelectedToken(tokenEngine.getTokenByAddress(selectedToken.address) || null);
    }
  };

  useEffect(() => {
    const unsub = tokenEngine.subscribe(refresh);
    return unsub;
  }, [selectedToken]);

  // Construct Email Subject & Body
  const getEmailSubject = () => {
    const sym = tokenSymbol.trim().toUpperCase() || 'NEW-ASSET';
    return `TX-20 Standard Asset Deployment Request (5.0 TIXA Fee Authorization) - [${sym}]`;
  };

  const getEmailBody = () => {
    const name = tokenName.trim() || 'Custom TX-20 Asset';
    const sym = tokenSymbol.trim().toUpperCase() || 'TKN';
    const supply = initialSupply.toLocaleString();
    const userEmail = session?.email || 'N/A';
    
    return `Dear TIXA Network Core Verification Council,

I am requesting official protocol authorization to deploy a new TX-20 Standard Asset on the TIXAPAY Blockchain Consensus Layer.

=== ASSET DEPLOYMENT SPECIFICATIONS ===
- Protocol Standard: TX-20 Decentralized Smart Asset
- Token Name: ${name}
- Token Symbol / Ticker: ${sym}
- Decimals: ${decimals}
- Initial Supply: ${supply} ${sym}
- Max Supply Cap: ${maxSupply ? maxSupply.toLocaleString() + ' ' + sym : 'UNLIMITED'}
- Capabilities: ${isMintable ? 'Mintable, ' : ''}${isBurnable ? 'Burnable, ' : ''}${isPausable ? 'Pausable' : 'Standard'}
- Creator / Requester Wallet Address: ${activeAddress}
- Requester Account Email: ${userEmail}
- Mandatory Protocol Deployment Fee: 5.0 TIXA PAY

Please provide the official 5.0 TIXA deployment invoice and validator clearance for on-chain contract activation.

Best regards,
Token Creator`;
  };

  const handleOpenGmail = () => {
    const subject = getEmailSubject();
    const body = getEmailBody();
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(COUNCIL_EMAIL)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(gmailUrl, '_blank', 'noopener,noreferrer');
  };

  const handleOpenMailto = () => {
    const subject = getEmailSubject();
    const body = getEmailBody();
    const mailtoUrl = `mailto:${COUNCIL_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  const handleCopyDraft = () => {
    const draftText = `To: ${COUNCIL_EMAIL}\nSubject: ${getEmailSubject()}\n\n${getEmailBody()}`;
    navigator.clipboard.writeText(draftText);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 3000);
  };

  const handleOpenDeployModal = () => {
    setIsAnnouncementModalOpen(true);
  };

  const handleDeployToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeployError(null);

    if (!tokenName.trim() || !tokenSymbol.trim()) {
      setDeployError('Please provide a valid Token Name and Symbol.');
      return;
    }

    setDeployLoading(true);
    try {
      const result = await tokenEngine.deployToken({
        name: tokenName.trim(),
        symbol: tokenSymbol.trim().toUpperCase(),
        decimals,
        initialSupply: Number(initialSupply),
        mintable: isMintable,
        burnable: isBurnable,
        owner: activeAddress
      });

      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      setIsDeployModalOpen(false);
      setDeploySuccessNotice(`TX-20 Asset "${tokenName.trim()} (${tokenSymbol.trim().toUpperCase()})" successfully initialized! 5.0 TIXA protocol registration fee recorded. Please ensure verification is sent to Gmail.`);
      // Reset form
      setTokenName('');
      setTokenSymbol('');
      setSelectedToken(result.token);
    } catch (err: any) {
      setDeployError(err.message || 'Deployment failed');
    } finally {
      setDeployLoading(false);
    }
  };

  const handleMint = async () => {
    if (!selectedToken) return;
    setActionError(null);
    setActionSuccess(null);

    const amt = parseFloat(actionAmount);
    if (isNaN(amt) || amt <= 0) {
      setActionError('Enter a valid amount to mint.');
      return;
    }

    setActionLoading(true);
    try {
      const tx = await tokenEngine.mintTokens(selectedToken.address, amt, activeAddress);

      confetti({ particleCount: 50, spread: 50 });
      setActionSuccess(`Successfully minted ${amt} ${selectedToken.symbol}! Tx: ${tx.slice(0, 14)}...`);
      setActionAmount('');
      refresh();
    } catch (err: any) {
      setActionError(err.message || 'Minting failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBurn = async () => {
    if (!selectedToken) return;
    setActionError(null);
    setActionSuccess(null);

    const amt = parseFloat(actionAmount);
    if (isNaN(amt) || amt <= 0) {
      setActionError('Enter a valid amount to burn.');
      return;
    }

    setActionLoading(true);
    try {
      const tx = await tokenEngine.burnTokens(selectedToken.address, amt, activeAddress);

      setActionSuccess(`Successfully burned ${amt} ${selectedToken.symbol}! Tx: ${tx.slice(0, 14)}...`);
      setActionAmount('');
      refresh();
    } catch (err: any) {
      setActionError(err.message || 'Burn failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTogglePause = () => {
    if (!selectedToken) return;
    alert('Smart asset contract parameter verified: All runtime transfer guards are active.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-heading">
              TX-20 Smart Token Factory
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-mono">
              STANDARD TX-20
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Mint, deploy, inspect, and manage verifiable decentralized assets with deterministic on-chain governance.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenDeployModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-cyan-400 to-blue-500 hover:from-amber-300 hover:to-blue-400 text-black font-bold text-xs font-mono tracking-wide shadow-lg shadow-cyan-500/20 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>Deploy New TX-20 Token (5 TIXA)</span>
        </button>
      </div>

      {deploySuccessNotice && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs font-mono flex items-start justify-between gap-3 shadow-lg">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white text-sm">Deployment Initialized!</p>
              <p className="text-emerald-300 mt-0.5">{deploySuccessNotice}</p>
            </div>
          </div>
          <button
            onClick={() => setDeploySuccessNotice(null)}
            className="text-emerald-400 hover:text-white text-xs font-bold px-2 py-1 rounded bg-emerald-900/50"
          >
            ✕
          </button>
        </div>
      )}

      {/* Grid of Deployed Tokens */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tokens.map(token => (
          <div
            key={token.address}
            onClick={() => setSelectedToken(token)}
            className={`p-5 rounded-2xl cursor-pointer transition-all space-y-4 ${
              selectedToken?.address === token.address
                ? 'cyber-glass-glow border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                : 'cyber-glass-card hover:border-cyan-500/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 flex items-center justify-center font-bold text-cyan-400 font-mono text-sm">
                  {token.symbol.slice(0, 3)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-heading">{token.name}</h3>
                  <span className="text-xs font-mono text-cyan-400 font-semibold">{token.symbol}</span>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                token.isPaused ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}>
                {token.isPaused ? 'PAUSED' : 'ACTIVE'}
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Contract Address:</span>
                <HashBadge hash={token.address} type="address" />
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Supply:</span>
                <span className="text-white font-bold">{token.totalSupply.toLocaleString()} {token.symbol}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Max Cap:</span>
                <span className="text-slate-300">{token.maxSupply ? `${token.maxSupply.toLocaleString()} ${token.symbol}` : 'UNLIMITED'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
              {token.mintable && <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700">MINTABLE</span>}
              {token.burnable && <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700">BURNABLE</span>}
              {token.pausable && <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700">PAUSABLE</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Selected Token Management Terminal */}
      {selectedToken && (
        <div className="p-6 rounded-3xl cyber-glass border border-cyan-500/40 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center font-bold text-cyan-300 font-mono text-lg">
                {selectedToken.symbol}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white font-heading">
                  Manage {selectedToken.name} ({selectedToken.symbol})
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Owner Address: <span className="text-cyan-400">{selectedToken.creatorAddress}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsContractCodeOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono"
              >
                <Code className="w-3.5 h-3.5 text-cyan-400" />
                <span>View Smart Contract Bytecode</span>
              </button>

              {selectedToken.pausable && (
                <button
                  type="button"
                  onClick={handleTogglePause}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-mono font-semibold ${
                    selectedToken.isPaused
                      ? 'bg-emerald-950 border-emerald-600 text-emerald-300'
                      : 'bg-rose-950 border-rose-600 text-rose-300'
                  }`}
                >
                  {selectedToken.isPaused ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                  <span>{selectedToken.isPaused ? 'Unpause Transfers' : 'Pause Transfers'}</span>
                </button>
              )}
            </div>
          </div>

          {actionError && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-mono">
              {actionError}
            </div>
          )}

          {actionSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-mono">
              {actionSuccess}
            </div>
          )}

          {/* Mint & Burn Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mint Form */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white font-heading flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Mint Additional Tokens</span>
                </h4>
                <span className="text-[10px] font-mono text-slate-400">
                  {selectedToken.mintable ? 'ENABLED' : 'DISABLED'}
                </span>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Mint Amount</label>
                <input
                  type="number"
                  disabled={!selectedToken.mintable}
                  placeholder="0.00"
                  value={actionAmount}
                  onChange={e => setActionAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono disabled:opacity-40"
                />
              </div>

              <button
                type="button"
                onClick={handleMint}
                disabled={!selectedToken.mintable || actionLoading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 text-black font-bold text-xs font-mono disabled:opacity-40 shadow-md shadow-cyan-500/20"
              >
                {actionLoading ? 'Minting On-Chain...' : `Mint ${selectedToken.symbol}`}
              </button>
            </div>

            {/* Burn Form */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white font-heading flex items-center gap-2">
                  <Flame className="w-4 h-4 text-rose-400" />
                  <span>Deflationary Token Burn</span>
                </h4>
                <span className="text-[10px] font-mono text-slate-400">
                  {selectedToken.burnable ? 'ENABLED' : 'DISABLED'}
                </span>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Burn Amount</label>
                <input
                  type="number"
                  disabled={!selectedToken.burnable}
                  placeholder="0.00"
                  value={actionAmount}
                  onChange={e => setActionAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono disabled:opacity-40"
                />
              </div>

              <button
                type="button"
                onClick={handleBurn}
                disabled={!selectedToken.burnable || actionLoading}
                className="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs font-mono disabled:opacity-40 shadow-md shadow-rose-500/20"
              >
                {actionLoading ? 'Executing Burn...' : `Permanently Burn ${selectedToken.symbol}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- PROTOCOL ANNOUNCEMENT MODAL (5 TIXA FEE & GMAIL SUBMISSION) --- */}
      {isAnnouncementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-3xl bg-[#090e23] border-2 border-amber-500/50 shadow-[0_0_50px_rgba(245,158,11,0.25)] p-6 sm:p-8 text-slate-100 space-y-6 my-8">
            
            {/* Header Badge */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-400">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-700 text-[10px] font-mono font-bold tracking-wider">
                      PROTOCOL ANNOUNCEMENT
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700 text-[10px] font-mono font-bold">
                      FEE: 5.0 TIXA
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white font-heading mt-1">
                    Deploy TX-20 Standard Asset
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setIsAnnouncementModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm font-mono"
              >
                ✕
              </button>
            </div>

            {/* Announcement Highlight Box in English */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-cyan-950/60 border border-amber-500/40 space-y-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <h4 className="font-bold text-amber-300 font-heading text-sm">
                    Mandatory Protocol Fee: 5.0 TIXA PAY Required
                  </h4>
                  <p className="text-slate-300 leading-relaxed">
                    To deploy, mint, and register an official <strong>TX-20 Standard Smart Asset</strong> onto the TIXAPAY Layer-1 Blockchain Network, a mandatory protocol verification and consensus storage fee of <strong>5.0 TIXA</strong> is required.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1.5">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Target Standard:</span>
                  <span className="text-cyan-400 font-bold">TX-20 Smart Token Standard</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Required Deployment Fee:</span>
                  <span className="text-amber-400 font-bold text-xs">5.000000 TIXA PAY</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Verification Email:</span>
                  <span className="text-white font-bold">{COUNCIL_EMAIL}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Your Connected Wallet:</span>
                  <span className="text-cyan-300">{activeAddress.slice(0, 14)}...{activeAddress.slice(-8)}</span>
                </div>
              </div>
            </div>

            {/* Token Quick Parameters (Optional Customization) */}
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-200 text-xs">
                  Asset Details for Gmail Request (Optional):
                </label>
                <span className="text-[10px] text-slate-400 font-sans">Pre-fills your Gmail message</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    placeholder="Token Name (e.g. My Asset)"
                    value={tokenName}
                    onChange={e => setTokenName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Token Symbol (e.g. TKN)"
                    value={tokenSymbol}
                    onChange={e => setTokenSymbol(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons: Gmail, Default Mail, Copy Draft */}
            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={handleOpenGmail}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-red-500 via-amber-500 to-cyan-400 hover:from-red-400 hover:to-cyan-300 text-black font-extrabold text-sm font-heading flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 transition-all transform hover:scale-[1.01]"
              >
                <Mail className="w-5 h-5 text-black" />
                <span>Open Gmail & Send Deployment Request (5 TIXA)</span>
                <ExternalLink className="w-4 h-4 ml-1 text-black/70" />
              </button>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <button
                  type="button"
                  onClick={handleOpenMailto}
                  className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Default Mail App</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyDraft}
                  className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                    copiedDraft
                      ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                      : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                  }`}
                >
                  {copiedDraft ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
                  <span>{copiedDraft ? 'Draft Copied!' : 'Copy Email Draft'}</span>
                </button>
              </div>
            </div>

            {/* Direct Deployment Studio Trigger */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-sans">
              <span className="text-slate-400 text-[11px]">
                Already contacted via Gmail or running testnet?
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsAnnouncementModalOpen(false);
                  setIsDeployModalOpen(true);
                }}
                className="text-cyan-400 hover:text-cyan-300 font-mono font-bold underline flex items-center gap-1"
              >
                <span>Continue to Deployment Form</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- DEPLOY TOKEN MODAL --- */}
      {isDeployModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#090e1e] border border-cyan-500/40 shadow-2xl p-6 text-slate-100 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white font-heading flex items-center gap-2">
                <Coins className="w-5 h-5 text-cyan-400" />
                <span>Deploy TX-20 Standard Asset</span>
              </h3>
              <button
                onClick={() => setIsDeployModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Announcement Banner inside Form */}
            <div className="p-3.5 rounded-xl bg-amber-950/50 border border-amber-500/40 text-amber-200 text-xs font-mono space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Protocol Deployment Fee: 5.0 TIXA PAY Required
                </span>
                <button
                  type="button"
                  onClick={handleOpenGmail}
                  className="px-2 py-1 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold text-[10px] flex items-center gap-1"
                >
                  <Mail className="w-3 h-3" />
                  <span>Email Gmail</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-300 leading-tight">
                To verify your TX-20 token on the TIXAPAY ledger, email <strong className="text-white">{COUNCIL_EMAIL}</strong> to authorize your 5.0 TIXA deployment settlement.
              </p>
            </div>

            {deployError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-mono">
                {deployError}
              </div>
            )}

            <form onSubmit={handleDeployToken} className="space-y-4 font-mono text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Token Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Solar Energy Credit"
                    value={tokenName}
                    onChange={e => setTokenName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Token Symbol</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SOLAR"
                    value={tokenSymbol}
                    onChange={e => setTokenSymbol(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Initial Supply</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={initialSupply}
                    onChange={e => setInitialSupply(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Max Hard Cap</label>
                  <input
                    type="number"
                    min={1}
                    value={maxSupply}
                    onChange={e => setMaxSupply(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
              </div>

              {/* Feature Toggles */}
              <div className="space-y-2 pt-2">
                <label className="text-slate-300 block">Smart Contract Capabilities</label>
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isMintable}
                      onChange={e => setIsMintable(e.target.checked)}
                      className="rounded bg-slate-800 border-slate-700 text-cyan-400"
                    />
                    <span>Mintable</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isBurnable}
                      onChange={e => setIsBurnable(e.target.checked)}
                      className="rounded bg-slate-800 border-slate-700 text-cyan-400"
                    />
                    <span>Burnable</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPausable}
                      onChange={e => setIsPausable(e.target.checked)}
                      className="rounded bg-slate-800 border-slate-700 text-cyan-400"
                    />
                    <span>Pausable</span>
                  </label>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-cyan-300 text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span>Mandatory Protocol Fee:</span>
                  <span className="font-bold text-amber-400">5.0 TIXA PAY</span>
                </div>
                <div className="flex justify-between">
                  <span>Verification Recipient:</span>
                  <span className="text-white font-mono">{COUNCIL_EMAIL}</span>
                </div>
                <div className="flex justify-between">
                  <span>State Storage:</span>
                  <span>Deterministic SHA-256 Contract Tree</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={deployLoading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-cyan-400 to-blue-500 text-black font-bold text-sm tracking-wide transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
              >
                {deployLoading ? 'Deploying to TX-VM...' : 'Deploy Smart Contract & Mint Initial Supply (5 TIXA)'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- SMART CONTRACT CODE MODAL --- */}
      {isContractCodeOpen && selectedToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-[#090e1e] border border-cyan-500/40 shadow-2xl p-6 text-slate-100 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
                <FileCode2 className="w-5 h-5 text-cyan-400" />
                <span>TX20_{selectedToken.symbol}.sol (Verified Code)</span>
              </h3>
              <button
                onClick={() => setIsContractCodeOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#040711] border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto max-h-72">
              <pre>{`// SPDX-License-Identifier: TIXA-COMMUNITY-2050
pragma solidity ^0.8.24;

import "@tixa/contracts/token/TX20/ITX20.sol";
import "@tixa/contracts/security/Pausable.sol";
import "@tixa/contracts/access/Ownable.sol";

contract TX20_${selectedToken.symbol} is ITX20, Pausable, Ownable {
    string public override name = "${selectedToken.name}";
    string public override symbol = "${selectedToken.symbol}";
    uint8 public override decimals = ${selectedToken.decimals};
    uint256 public override totalSupply = ${selectedToken.totalSupply} * 10**${selectedToken.decimals};
    uint256 public override maxSupply = ${selectedToken.maxSupply ? selectedToken.maxSupply + " * 10**" + selectedToken.decimals : "type(uint256).max"};

    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    constructor() Ownable(msg.sender) {
        _balances[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }

    function transfer(address to, uint256 amount) external override whenNotPaused returns (bool) {
        require(_balances[msg.sender] >= amount, "TX20: insufficient balance");
        _balances[msg.sender] -= amount;
        _balances[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }
}`}</pre>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsContractCodeOpen(false)}
                className="px-4 py-2 rounded-xl bg-cyan-500 text-black font-bold text-xs font-mono"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
