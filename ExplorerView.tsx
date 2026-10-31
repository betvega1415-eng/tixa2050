import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Search, 
  Layers, 
  ArrowLeftRight, 
  Server, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  ExternalLink, 
  Cpu, 
  Flame, 
  Activity, 
  Coins,
  Check,
  Copy,
  AlertTriangle
} from 'lucide-react';
import { blockchainEngine } from '../../core/blockchainEngine';
import { tokenEngine } from '../../core/tokenEngine';
import { Block, Transaction, Validator, NetworkStats, AccountState } from '../../types/blockchain';
import { HashBadge } from '../common/HashBadge';

export const ExplorerView: React.FC = () => {
  const [stats, setStats] = useState<NetworkStats>(blockchainEngine.getStats());
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [validators, setValidators] = useState<Validator[]>([]);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'blocks' | 'transactions' | 'validators' | 'addresses'>('blocks');

  // Inspector Modals
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [inspectedAddress, setInspectedAddress] = useState<string | null>(null);
  const [addressState, setAddressState] = useState<AccountState | null>(null);

  const refreshExplorer = () => {
    setStats(blockchainEngine.getStats());
    setBlocks([...blockchainEngine.getBlocks()].reverse());
    setValidators([...blockchainEngine.getValidators()]);

    if (inspectedAddress) {
      setAddressState(blockchainEngine.getAccount(inspectedAddress));
    }
  };

  useEffect(() => {
    refreshExplorer();
    const unsub = blockchainEngine.subscribe(refreshExplorer);
    return unsub;
  }, [inspectedAddress]);

  // Aggregate all transactions
  const allTransactions: Transaction[] = [];
  blocks.forEach(b => {
    b.transactions.forEach(t => allTransactions.push(t));
  });

  // Handle global search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;

    // Search by height
    if (/^\d+$/.test(q)) {
      const height = parseInt(q, 10);
      const foundBlock = blocks.find(b => b.header.height === height);
      if (foundBlock) {
        setSelectedBlock(foundBlock);
        return;
      }
    }

    // Search by address
    if (q.startsWith('tx1')) {
      setInspectedAddress(q);
      setActiveTab('addresses');
      return;
    }

    // Search by Tx hash
    const foundTx = allTransactions.find(t => t.id.toLowerCase() === q.toLowerCase());
    if (foundTx) {
      setSelectedTx(foundTx);
      return;
    }

    // Search by Block hash, previous hash, or merkle root
    const foundBlockHash = blocks.find(b => 
      b.hash.toLowerCase() === q.toLowerCase() ||
      b.header.previousHash.toLowerCase() === q.toLowerCase() ||
      b.header.merkleRoot.toLowerCase() === q.toLowerCase()
    );
    if (foundBlockHash) {
      setSelectedBlock(foundBlockHash);
      return;
    }

    // Search validator by name or address
    const foundVal = validators.find(v => 
      v.name.toLowerCase().includes(q.toLowerCase()) ||
      v.address.toLowerCase() === q.toLowerCase()
    );
    if (foundVal) {
      setActiveTab('validators');
      return;
    }

    alert(`No matching block, transaction, address or validator found for "${q}".`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-16">
      {/* Header & Global Search */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-white font-heading">
                TIXA Blockchain Explorer
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-mono">
                REAL-TIME TELEMETRY
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Deterministic Merkle state verification, validator BFT consensus rounds, and on-chain state inspection.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>SLOT TIME: 3.0s</span>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative">
          <Search className="w-5 h-5 text-slate-500 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Search by Block Height (#0), Tx Hash (0x...), Address (tx1...), or Validator..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-slate-900/90 border border-cyan-500/30 focus:border-cyan-400 focus:outline-none text-sm text-white placeholder-slate-500 font-mono shadow-lg shadow-cyan-950/20"
          />
          <button
            type="submit"
            className="absolute right-2 top-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs font-mono transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Explorer Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl cyber-glass border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Block Height</span>
          <p className="text-lg font-bold text-cyan-400 font-mono">#{stats.blockHeight}</p>
        </div>
        <div className="p-3.5 rounded-xl cyber-glass border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Live TPS</span>
          <p className="text-lg font-bold text-emerald-400 font-mono">142.5</p>
        </div>
        <div className="p-3.5 rounded-xl cyber-glass border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Active Validators</span>
          <p className="text-lg font-bold text-blue-400 font-mono">{stats.activeValidators} / 21</p>
        </div>
        <div className="p-3.5 rounded-xl cyber-glass border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Gas Price</span>
          <p className="text-lg font-bold text-amber-400 font-mono">1.2 Gwei</p>
        </div>
        <div className="p-3.5 rounded-xl cyber-glass border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Total Burned</span>
          <p className="text-lg font-bold text-rose-400 font-mono">{stats.totalBurned.toFixed(2)}</p>
        </div>
        <div className="p-3.5 rounded-xl cyber-glass border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Epoch</span>
          <p className="text-lg font-bold text-purple-400 font-mono">#{stats.epoch}</p>
        </div>
      </div>

      {/* Explorer Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-1 font-mono text-xs">
        <button
          onClick={() => setActiveTab('blocks')}
          className={`px-4 py-2 rounded-t-xl font-bold transition-all ${
            activeTab === 'blocks'
              ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-950/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Blocks ({blocks.length})
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-4 py-2 rounded-t-xl font-bold transition-all ${
            activeTab === 'transactions'
              ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-950/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Transactions ({allTransactions.length})
        </button>
        <button
          onClick={() => setActiveTab('validators')}
          className={`px-4 py-2 rounded-t-xl font-bold transition-all ${
            activeTab === 'validators'
              ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-950/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Validators ({validators.length})
        </button>
        {inspectedAddress && (
          <button
            onClick={() => setActiveTab('addresses')}
            className={`px-4 py-2 rounded-t-xl font-bold transition-all ${
              activeTab === 'addresses'
                ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-950/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Address Inspector
          </button>
        )}
      </div>

      {/* --- TAB 1: BLOCKS TABLE --- */}
      {activeTab === 'blocks' && (
        <div className="overflow-hidden rounded-2xl cyber-glass border border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#060b17] border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Height</th>
                  <th className="p-3.5">Block Hash</th>
                  <th className="p-3.5">Validator</th>
                  <th className="p-3.5">Tx Count</th>
                  <th className="p-3.5">Reward / Burn</th>
                  <th className="p-3.5">Gas Used</th>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {blocks.map(blk => (
                  <tr 
                    key={blk.hash}
                    onClick={() => setSelectedBlock(blk)}
                    className="hover:bg-cyan-950/20 transition-colors cursor-pointer"
                  >
                    <td className="p-3.5 font-bold text-cyan-400">
                      #{blk.header.height}
                    </td>
                    <td className="p-3.5">
                      <HashBadge hash={blk.hash} type="block" />
                    </td>
                    <td className="p-3.5">
                      <HashBadge hash={blk.header.validatorAddress} type="address" />
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200">
                        {blk.txCount} TXs
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="text-emerald-400">+{blk.rewardTIXA.toFixed(2)}</span>
                      <span className="text-slate-500"> / </span>
                      <span className="text-rose-400">-{blk.burnedTIXA.toFixed(4)}</span>
                    </td>
                    <td className="p-3.5 text-slate-400">
                      {blk.header.gasUsed.toLocaleString()}
                    </td>
                    <td className="p-3.5 text-slate-500">
                      {new Date(blk.header.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="p-3.5 text-right">
                      <span className="text-cyan-400 hover:underline inline-flex items-center gap-0.5">
                        <span>Inspect</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 2: TRANSACTIONS TABLE --- */}
      {activeTab === 'transactions' && (
        <div className="overflow-hidden rounded-2xl cyber-glass border border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#060b17] border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Tx ID</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5">Sender</th>
                  <th className="p-3.5">Receiver</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Fee</th>
                  <th className="p-3.5">Block</th>
                  <th className="p-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {allTransactions.map(tx => (
                  <tr
                    key={tx.id}
                    onClick={() => setSelectedTx(tx)}
                    className="hover:bg-blue-950/20 transition-colors cursor-pointer"
                  >
                    <td className="p-3.5">
                      <HashBadge hash={tx.id} type="tx" />
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 text-[10px] font-semibold">
                        {tx.type}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <HashBadge hash={tx.sender} type="address" />
                    </td>
                    <td className="p-3.5">
                      <HashBadge hash={tx.receiver} type="address" />
                    </td>
                    <td className="p-3.5 font-bold text-white">
                      {tx.amount} {tx.payload?.tokenSymbol || 'TIXA'}
                    </td>
                    <td className="p-3.5 text-slate-400">
                      {tx.fee} TIXA
                    </td>
                    <td className="p-3.5 text-cyan-400">
                      #{tx.blockHeight ?? 'Pending'}
                    </td>
                    <td className="p-3.5 text-right">
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px]">
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 3: VALIDATORS LEADERBOARD --- */}
      {activeTab === 'validators' && (
        <div className="overflow-hidden rounded-2xl cyber-glass border border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#060b17] border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Validator Node</th>
                  <th className="p-3.5">Address</th>
                  <th className="p-3.5">Total Staked (TIXA)</th>
                  <th className="p-3.5">Commission</th>
                  <th className="p-3.5">Uptime</th>
                  <th className="p-3.5">Blocks Proposed</th>
                  <th className="p-3.5">Total Rewards</th>
                  <th className="p-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {validators.map(v => (
                  <tr key={v.address} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-cyan-950 border border-cyan-800 flex items-center justify-center font-bold text-[10px] text-cyan-400">
                          {v.name.slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-bold text-white">{v.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{v.pubKey.slice(0, 14)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <HashBadge hash={v.address} type="address" />
                    </td>
                    <td className="p-3.5 font-bold text-cyan-300">
                      {(v.stakedAmount + v.delegatedAmount).toLocaleString()} TIXA
                    </td>
                    <td className="p-3.5 text-slate-300">{v.commissionRate}%</td>
                    <td className="p-3.5 text-emerald-400 font-bold">{v.uptime}%</td>
                    <td className="p-3.5 text-slate-300">{v.blocksProposed.toLocaleString()}</td>
                    <td className="p-3.5 text-amber-400">{v.totalRewards.toFixed(2)} TIXA</td>
                    <td className="p-3.5 text-right">
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px]">
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 4: ADDRESS INSPECTOR --- */}
      {activeTab === 'addresses' && inspectedAddress && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl cyber-glass border border-cyan-500/30 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-slate-400 uppercase">Inspected Account State</span>
                <p className="font-mono text-sm text-cyan-300 font-bold break-all">{inspectedAddress}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
                addressState?.isFrozen ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}>
                {addressState?.isFrozen ? 'FROZEN BY GOVERNANCE' : 'ACTIVE / OPERATIONAL'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono">AVAILABLE TIXA</span>
                <p className="text-lg font-bold text-white font-mono">{(addressState?.balance || 0).toFixed(4)}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono">STAKED TIXA</span>
                <p className="text-lg font-bold text-cyan-400 font-mono">{(addressState?.stakedBalance || 0).toFixed(4)}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono">NONCE COUNT</span>
                <p className="text-lg font-bold text-slate-200 font-mono">{addressState?.nonce || 0}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono">TX-20 HOLDINGS</span>
                <p className="text-lg font-bold text-blue-400 font-mono">
                  {Object.keys(addressState?.tokens || {}).length} Tokens
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- BLOCK DETAIL MODAL --- */}
      {selectedBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-[#090e1e] border border-cyan-500/40 shadow-2xl p-6 text-slate-100 space-y-4 my-8 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white font-heading flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                <span>Block #{selectedBlock.header.height} Details</span>
              </h3>
              <button
                onClick={() => setSelectedBlock(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Block Hash:</span>
                  <HashBadge hash={selectedBlock.hash} type="block" truncate={false} />
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Previous Hash:</span>
                  <HashBadge hash={selectedBlock.header.previousHash} type="block" truncate={false} />
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Merkle Root:</span>
                  <span className="text-cyan-300 font-bold">{selectedBlock.header.merkleRoot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Validator Proposer:</span>
                  <HashBadge hash={selectedBlock.header.validatorAddress} type="address" truncate={false} />
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Validator Signature:</span>
                  <span className="text-slate-400">{selectedBlock.header.validatorSignature}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">Gas Used / Limit:</span>
                  <p className="text-white font-bold">{selectedBlock.header.gasUsed.toLocaleString()} / 30,000,000</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">Block Size:</span>
                  <p className="text-white font-bold">{selectedBlock.sizeBytes} Bytes</p>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <h4 className="font-bold text-white">Transactions in Block ({selectedBlock.transactions.length})</h4>
                <div className="divide-y divide-slate-800 rounded-xl bg-slate-950 border border-slate-800 p-2 max-h-48 overflow-y-auto">
                  {selectedBlock.transactions.map(tx => (
                    <div key={tx.id} className="py-1.5 flex items-center justify-between text-[11px]">
                      <HashBadge hash={tx.id} type="tx" />
                      <span className="text-emerald-400 font-bold">{tx.amount} TIXA</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TRANSACTION DETAIL MODAL --- */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-xl rounded-2xl bg-[#090e1e] border border-blue-500/40 shadow-2xl p-6 text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white font-heading flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5 text-blue-400" />
                <span>Transaction Proof</span>
              </h3>
              <button
                onClick={() => setSelectedTx(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Tx Hash:</span>
                  <HashBadge hash={selectedTx.id} type="tx" truncate={false} />
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Sender:</span>
                  <HashBadge hash={selectedTx.sender} type="address" truncate={false} />
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Receiver:</span>
                  <HashBadge hash={selectedTx.receiver} type="address" truncate={false} />
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Amount:</span>
                  <span className="text-emerald-400 font-bold">{selectedTx.amount} {selectedTx.payload?.tokenSymbol || 'TIXA'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Gas Fee:</span>
                  <span className="text-slate-300">{selectedTx.fee} TIXA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Included in Block:</span>
                  <span className="text-cyan-400 font-bold">#{selectedTx.blockHeight}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Digital Signature:</span>
                  <span className="text-slate-500 truncate max-w-xs">{selectedTx.signature}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
