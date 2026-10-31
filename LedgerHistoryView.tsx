import React, { useState, useEffect } from 'react';
import { 
  History, 
  ArrowDownLeft, 
  ArrowUpRight, 
  RefreshCw, 
  Filter, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Search,
  Download,
  Coins,
  ShieldCheck
} from 'lucide-react';
import { ledgerEngine } from '../../core/ledgerEngine';
import { authEngine } from '../../core/authEngine';
import { LedgerEntry } from '../../types/ledger';
import { HashBadge } from '../common/HashBadge';
import { COUNTRIES } from '../../data/countries';

interface LedgerHistoryViewProps {
  walletAddress?: string;
}

export const LedgerHistoryView: React.FC<LedgerHistoryViewProps> = ({ walletAddress }) => {
  const session = authEngine.getSession();
  const currentUser = authEngine.getCurrentUser();
  const activeAddress = walletAddress || session?.walletAddress || currentUser?.walletAddress || 'tx1alexchennoncustodial2050vault99aa';

  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const refresh = () => {
    setEntries(ledgerEngine.getLedger(activeAddress));
  };

  useEffect(() => {
    refresh();
    const unsub = ledgerEngine.subscribe(refresh);
    return () => unsub();
  }, [activeAddress]);

  const filteredEntries = entries.filter(item => {
    if (filterType !== 'ALL' && item.type !== filterType) return false;
    if (filterStatus !== 'ALL' && item.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchDesc = item.description?.toLowerCase().includes(q);
      const matchRef = item.referenceId?.toLowerCase().includes(q);
      const matchCounterparty = item.counterparty?.toLowerCase().includes(q);
      const matchAsset = item.asset.toLowerCase().includes(q);
      if (!matchDesc && !matchRef && !matchCounterparty && !matchAsset) return false;
    }
    return true;
  });

  const getStatusBadge = (status: LedgerEntry['status']) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800 text-[10px]">
            <CheckCircle2 className="w-3 h-3" />
            <span>COMPLETED</span>
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-700 text-[10px] animate-pulse">
            <Clock className="w-3 h-3" />
            <span>PENDING</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-950/80 text-rose-400 border border-rose-800 text-[10px]">
            <XCircle className="w-3 h-3" />
            <span>REJECTED</span>
          </span>
        );
      default:
        return null;
    }
  };

  const getTypeBadge = (type: LedgerEntry['type']) => {
    switch (type) {
      case 'CRYPTO_DEPOSIT':
      case 'LOCAL_GATEWAY_DEPOSIT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-bold">
            <ArrowDownLeft className="w-3 h-3 text-cyan-400" />
            <span>DEPOSIT</span>
          </span>
        );
      case 'WITHDRAWAL':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-bold">
            <ArrowUpRight className="w-3 h-3 text-rose-400" />
            <span>WITHDRAWAL</span>
          </span>
        );
      case 'TRANSFER_IN':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
            <ArrowDownLeft className="w-3 h-3" />
            <span>TRANSFER IN</span>
          </span>
        );
      case 'TRANSFER_OUT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold">
            <ArrowUpRight className="w-3 h-3" />
            <span>TRANSFER OUT</span>
          </span>
        );
      case 'STAKING_REWARD':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-bold">
            <Coins className="w-3 h-3 text-purple-400" />
            <span>STAKE REWARD</span>
          </span>
        );
      case 'TRADE_BUY':
      case 'TRADE_SELL':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 text-[10px] font-bold">
            <span>DEX TRADE</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
            <span>{type}</span>
          </span>
        );
    }
  };

  const exportCsv = () => {
    const headers = ['ID', 'Date', 'Type', 'Asset', 'Amount', 'Fee', 'Status', 'Balance Before', 'Balance After', 'Description', 'Local Currency Value'];
    const rows = filteredEntries.map(e => [
      e.id,
      new Date(e.timestamp).toISOString(),
      e.type,
      e.asset,
      e.amount,
      e.fee,
      e.status,
      e.balanceBefore,
      e.balanceAfter,
      `"${e.description.replace(/"/g, '""')}"`,
      e.localCurrencyAmount ? `${e.localCurrencyCode || ''} ${e.localCurrencyAmount}` : ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tixa-ledger-${activeAddress.slice(0, 8)}-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 font-mono">
      {/* Search and Filters Strip */}
      <div className="p-4 rounded-2xl cyber-glass border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search description, reference, counterparty..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:border-cyan-500"
          />
        </div>

        {/* Filter by Type */}
        <div className="flex items-center gap-2">
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
          >
            <option value="ALL">All Event Types</option>
            <option value="LOCAL_GATEWAY_DEPOSIT">Local Payment Deposits</option>
            <option value="CRYPTO_DEPOSIT">Crypto On-Chain Deposits</option>
            <option value="WITHDRAWAL">Withdrawals</option>
            <option value="TRANSFER_IN">Transfers In</option>
            <option value="TRANSFER_OUT">Transfers Out</option>
            <option value="STAKING_REWARD">Staking Rewards</option>
            <option value="TRADE_BUY">DEX Buys</option>
            <option value="TRADE_SELL">DEX Sells</option>
          </select>

          {/* Filter by Status */}
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending Approval</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <button
            type="button"
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200"
            title="Export CSV Statement"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">CSV Statement</span>
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="overflow-hidden rounded-2xl cyber-glass border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#060b17] border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Description & Reference</th>
                <th className="p-3.5">Amount & Local Fiat</th>
                <th className="p-3.5">Balance After</th>
                <th className="p-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No ledger entries match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredEntries.map(entry => {
                  const isCredit = ['CRYPTO_DEPOSIT', 'LOCAL_GATEWAY_DEPOSIT', 'TRANSFER_IN', 'STAKING_REWARD', 'TRADE_BUY', 'FAUCET_CLAIM'].includes(entry.type);
                  return (
                    <tr key={entry.id} className="hover:bg-slate-900/50 transition-colors">
                      
                      {/* Date & Time */}
                      <td className="p-3.5 text-slate-400 whitespace-nowrap">
                        <div>{new Date(entry.timestamp).toLocaleDateString()}</div>
                        <div className="text-[10px] text-slate-500">{new Date(entry.timestamp).toLocaleTimeString()}</div>
                      </td>

                      {/* Type Badge */}
                      <td className="p-3.5 whitespace-nowrap">
                        {getTypeBadge(entry.type)}
                      </td>

                      {/* Description & Reference */}
                      <td className="p-3.5 max-w-xs">
                        <div className="text-white font-medium truncate">{entry.description}</div>
                        {entry.counterparty && (
                          <div className="text-[10px] text-slate-400 truncate">
                            Via: {entry.counterparty}
                          </div>
                        )}
                        {entry.referenceId && (
                          <div className="text-[9px] text-slate-500 font-mono">
                            Ref: {entry.referenceId}
                          </div>
                        )}
                      </td>

                      {/* Amount and Local Value */}
                      <td className="p-3.5 whitespace-nowrap">
                        <div className={`font-bold ${isCredit ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isCredit ? '+' : '-'}{entry.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })} {entry.asset}
                        </div>
                        {entry.localCurrencyAmount ? (
                          <div className="text-[10px] text-cyan-300">
                            ≈ {entry.localCurrencyCode || ''} {entry.localCurrencyAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        ) : null}
                      </td>

                      {/* Balance After */}
                      <td className="p-3.5 text-slate-300 whitespace-nowrap font-semibold">
                        {entry.balanceAfter.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} {entry.asset}
                      </td>

                      {/* Status */}
                      <td className="p-3.5 text-right whitespace-nowrap">
                        {getStatusBadge(entry.status)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
