import React, { useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';

interface HashBadgeProps {
  hash?: string;
  type?: 'address' | 'tx' | 'block' | 'hash';
  truncate?: boolean;
  prefixLength?: number;
  suffixLength?: number;
  length?: number;
  onClick?: () => void;
  className?: string;
  showCopy?: boolean;
}

export const HashBadge: React.FC<HashBadgeProps> = ({
  hash = '',
  type = 'hash',
  truncate = true,
  prefixLength = 6,
  suffixLength = 4,
  length,
  onClick,
  className = '',
  showCopy = true
}) => {
  const [copied, setCopied] = useState(false);
  const safeHash = typeof hash === 'string' ? hash : (hash ? String(hash) : '');

  // If length is explicitly provided (e.g. length={12})
  const effectivePrefix = length ? Math.floor(length / 2) : prefixLength;
  const effectiveSuffix = length ? Math.ceil(length / 2) : suffixLength;

  const displayString = !safeHash
    ? 'N/A'
    : truncate && safeHash.length > effectivePrefix + effectiveSuffix + 3
      ? `${safeHash.slice(0, effectivePrefix)}...${safeHash.slice(-effectiveSuffix)}`
      : safeHash;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!safeHash) return;
    navigator.clipboard.writeText(safeHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const getStyleForType = () => {
    switch (type) {
      case 'address':
        return 'text-cyan-400 bg-cyan-950/40 border-cyan-800/40 hover:border-cyan-500/60';
      case 'tx':
        return 'text-blue-400 bg-blue-950/40 border-blue-800/40 hover:border-blue-500/60';
      case 'block':
        return 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40 hover:border-emerald-500/60';
      default:
        return 'text-slate-300 bg-slate-900/60 border-slate-700/50 hover:border-slate-500';
    }
  };

  return (
    <div
      id={`hash-badge-${safeHash ? safeHash.slice(0, 8) : 'empty'}`}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-mono text-xs border transition-all ${getStyleForType()} ${onClick ? 'cursor-pointer hover:bg-opacity-80' : ''} ${className}`}
      onClick={onClick}
    >
      <span className="tracking-tight">{displayString}</span>
      
      {showCopy && safeHash && (
        <button
          type="button"
          onClick={handleCopy}
          className="text-slate-400 hover:text-cyan-300 transition-colors p-0.5 rounded"
          title="Copy full hash to clipboard"
        >
          {copied ? (
            <Check className="w-3 h-3 text-emerald-400 animate-scale" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
        </button>
      )}

      {onClick && (
        <ExternalLink className="w-2.5 h-2.5 opacity-60 ml-0.5" />
      )}
    </div>
  );
};
