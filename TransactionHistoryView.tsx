import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowLeftRight, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  XCircle, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  Calendar,
  Layers,
  ChevronDown
} from 'lucide-react';
import { ledgerEngine } from '../../core/ledgerEngine';
import { blockchainEngine } from '../../core/blockchainEngine';
import { authEngine } from '../../core/authEngine';
import { LedgerTransaction } from '../../types/ledger';
import { HashBadge } from '../common/HashBadge';
import { ActiveTab } from '../common/Navbar';

interface TransactionHistoryViewProps {
  setActiveTab?: (tab: ActiveTab) => void;
  onOpenAuth?: (mode: 'login' | 'register' | 'admin') => void;
  onSelectTx?: (txHash: string) => void;
  onViewInExplorer?: () => void;
  onGoToTrade?: () => void;
}

export const TransactionHistoryView: React.FC<TransactionHistoryViewProps> = ({
  setActiveTab,
  onOpenAuth,
  onSelectTx,
  onViewInExplorer,
  onGoToTrade
}) => {
  const [transactions, setTransactions] = useState<LedgerTransaction[]>(ledgerEngine.getAllTransactions());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedTimeRange, setSelectedTimeRange] = useState<'ALL' | '24H' | '7D' | '30D'>('ALL');
  const [selectedTx, setSelectedTx] = useState<LedgerTransaction | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const session = authEngine.getSession();
  const activeAddress = session?.walletAddress;

  useEffect(() => {
    const unsub = ledgerEngine.subscribe(() => {
      setTransactions([...ledgerEngine.getAllTransactions()]);
    });
    return unsub;
  }, []);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter logic
  const filteredTxs = transactions.filter(tx => {
    // Search query match
    const matchesSearch = 
      tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.referenceHash.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.fromAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.toAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.assetSymbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.note && tx.note.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    // Type filter
    if (selectedType !== 'ALL') {
      if (selectedType === 'DEPOSIT' && tx.type !== 'FIAT_DEPOSIT' && tx.type !== 'TRANSFER_IN') return false;
      if (selectedType === 'WITHDRAWAL' && tx.type !== 'FIAT_WITHDRAWAL' && tx.type !== 'TRANSFER_OUT') return false;
      if (selectedType === 'SWAP' && tx.type !== 'SWAP') return false;
      if (selectedType === 'TRADE' && tx.type !== 'ORDER_BUY' && tx.type !== 'ORDER_SELL') return false;
      if (selectedType === 'TRANSFER' && tx.type !== 'TRANSFER_IN' && tx.type !== 'TRANSFER_OUT') return false;
    }

    // Status filter
    if (selectedStatus !== 'ALL' && tx.status !== selectedStatus) {
      return false;
    }

    // Time range filter
    if (selectedTimeRange !== 'ALL') {
      const now = Date.now();
      const diffHours = (now - tx.timestamp) / 3600000;
      if (selectedTimeRange === '24H' && diffHours > 24) return false;
      if (selectedTimeRange === '7D' && diffHours > 24 * 7) return false;
      if (selectedTimeRange === '30D' && diffHours > 24 * 30) return false;
    }

    return true;
  });

  const exportCSV = () => {
    const headers = 'ID,Type,Asset,Amount,Fee,Status,From,To,Timestamp,Hash\n';
    const rows = filteredTxs.map(t => 
      `"${t.id}","${t.type}","${t.assetSymbol}",${t.amount},${t.fee || 0},"${t.status}","${t.fromAddress}","${t.toAddress}","${new Date(t.timestamp).toISOString()}","${t.referenceHash}"`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tixa_transactions_${Date.now()}.csv`;
    a.click();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 text-[11px] font-mono font-bold">
            <CheckCircle2 className="w-3 h-3" />
            <span>Completed</span>
          </span>
        );
      case 'PENDING':
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-950/80 text-amber-400 border border-amber-500/30 text-[11px] font-mono font-bold">
            <Clock className="w-3 h-3 animate-spin" />
            <span>Processing</span>
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-950/80 text-rose-400 border border-rose-500/30 text-[11px] font-mono font-bold">
            <AlertCircle className="w-3 h-3" />
            <span>Failed</span>
          </span>
        );
      case 'CANCELLED':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[11px] font-mono font-bold">
            <XCircle className="w-3 h-3" />
            <span>Cancelled</span>
          </span>
        );
    }
  };

  const getTypeIcon = (type: string) => {
    if (type.includes('DEPOSIT') || type.includes('IN')) {
      return <ArrowDownLeft className="w-4 h-4 text-emerald-400" />;
    }
    if (type.includes('WITHDRAWAL') || type.includes('OUT')) {
      return <ArrowUpRight className="w-4 h-4 text-cyan-400" />;
    }
    if (type.includes('SWAP')) {
      return <ArrowLeftRight className="w-4 h-4 text-purple-400" />;
    }
    return <Layers className="w-4 h-4 text-amber-400" />;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#091129] via-[#071329] to-[#0a1b38] border border-cyan-500/25 shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-400 text-xs font-mono border border-cyan-800">
              AUDITED ON-CHAIN & LEDGER LOGS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-heading">
            Transaction <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">History</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time record of all deposits, withdrawals, transfers, AMM swaps, and order executions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onViewInExplorer && (
            <button
              type="button"
              id="tx-history-explorer-btn"
              onClick={onViewInExplorer}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white text-xs font-mono transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
              <span>Explorer</span>
            </button>
          )}

          {onGoToTrade && (
            <button
              type="button"
              id="tx-history-trade-btn"
              onClick={onGoToTrade}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono transition-all"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-cyan-400" />
              <span>Trade</span>
            </button>
          )}

          <button
            type="button"
            onClick={exportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white text-xs font-mono transition-all"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab?.('wallet')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all"
          >
            <span>Open Wallet</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="p-4 rounded-2xl bg-[#060b1b] border border-cyan-500/20 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, Hash, Address..."
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">All Transaction Types</option>
              <option value="DEPOSIT">Deposits</option>
              <option value="WITHDRAWAL">Withdrawals</option>
              <option value="TRANSFER">Transfers</option>
              <option value="SWAP">Swaps</option>
              <option value="TRADE">Exchange Trades</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">All Statuses</option>
              <option value="CONFIRMED">Completed</option>
              <option value="PENDING">Pending / Processing</option>
              <option value="FAILED">Failed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as any)}
              className="w-full py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">All Time</option>
              <option value="24H">Last 24 Hours</option>
              <option value="7D">Last 7 Days</option>
              <option value="30D">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transaction Records Table */}
      <div className="rounded-2xl bg-[#060b1b] border border-cyan-500/20 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#09112a] border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase">
                <th className="py-3.5 px-4">Type / Reference</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Network Fee</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">From / To</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredTxs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 text-sm">
                    No transactions found matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredTxs.map((tx) => (
                  <tr key={tx.id} className="hover:bg-cyan-950/20 transition-colors">
                    {/* Type & ID */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                          {getTypeIcon(tx.type)}
                        </div>
                        <div>
                          <span className="font-bold text-white font-sans block">
                            {tx.type.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            ID: {tx.id.slice(0, 10)}...
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4">
                      <span className="text-sm font-extrabold text-white">
                        {tx.amount.toLocaleString('en-US', { maximumFractionDigits: 6 })} {tx.assetSymbol}
                      </span>
                    </td>

                    {/* Fee */}
                    <td className="py-3.5 px-4 text-slate-400">
                      {tx.fee ? `${tx.fee} TIXA` : '0.0001 TIXA'}
                    </td>

                    {/* Date Time */}
                    <td className="py-3.5 px-4 text-slate-300">
                      <div>{new Date(tx.timestamp).toLocaleDateString()}</div>
                      <div className="text-[10px] text-slate-500">{new Date(tx.timestamp).toLocaleTimeString()}</div>
                    </td>

                    {/* From / To */}
                    <td className="py-3.5 px-4 text-[11px] text-slate-400">
                      <div className="truncate max-w-[140px]" title={tx.fromAddress}>
                        From: {tx.fromAddress ? `${tx.fromAddress.slice(0, 6)}...${tx.fromAddress.slice(-4)}` : 'System Vault'}
                      </div>
                      <div className="truncate max-w-[140px] text-cyan-400/80" title={tx.toAddress}>
                        To: {tx.toAddress ? `${tx.toAddress.slice(0, 6)}...${tx.toAddress.slice(-4)}` : 'System Vault'}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      {getStatusBadge(tx.status)}
                    </td>

                    {/* Details Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedTx(tx)}
                        className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 border border-slate-700 text-xs transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-[#090f23] border border-cyan-500/30 p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-cyan-950 text-cyan-400">
                  {getTypeIcon(selectedTx.type)}
                </span>
                <div>
                  <h3 className="text-base font-bold text-white font-heading">
                    Transaction Details
                  </h3>
                  <p className="text-xs font-mono text-slate-400">ID: {selectedTx.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                className="text-slate-400 hover:text-white text-sm p-1 rounded hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400">Status</span>
                <span>{getStatusBadge(selectedTx.status)}</span>
              </div>

              <div className="flex justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400">Amount Transferred</span>
                <span className="font-bold text-white text-sm">
                  {selectedTx.amount} {selectedTx.assetSymbol}
                </span>
              </div>

              <div className="flex justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400">Network Gas Fee</span>
                <span className="text-amber-400">{selectedTx.fee || '0.0001'} TIXA</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Cryptographic Hash</span>
                  <button
                    type="button"
                    onClick={() => handleCopy('hash', selectedTx.referenceHash)}
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[11px]"
                  >
                    {copiedId === 'hash' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === 'hash' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-cyan-300 break-all font-mono">
                  {selectedTx.referenceHash}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-slate-400 block">Sender Address</span>
                <p className="text-[11px] text-slate-200 break-all">{selectedTx.fromAddress || 'System Protocol Genesis'}</p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-slate-400 block">Recipient Address</span>
                <p className="text-[11px] text-slate-200 break-all">{selectedTx.toAddress || 'System Protocol Vault'}</p>
              </div>

              <div className="flex justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400">Timestamp</span>
                <span className="text-slate-300">{new Date(selectedTx.timestamp).toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
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
