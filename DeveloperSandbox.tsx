import React, { useState } from 'react';
import { 
  Terminal, 
  Code2, 
  GitBranch, 
  Play, 
  Copy, 
  Check, 
  Layers, 
  Cpu, 
  ShieldCheck, 
  Server, 
  BookOpen, 
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { blockchainEngine } from '../../core/blockchainEngine';
import { tokenEngine } from '../../core/tokenEngine';
import { exchangeEngine } from '../../core/exchangeEngine';

export const DeveloperSandbox: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'rpc' | 'blueprint' | 'sdk' | 'contracts'>('rpc');
  
  // RPC Console state
  const [selectedMethod, setSelectedMethod] = useState('tixa_getNetworkStats');
  const [rpcParams, setRpcParams] = useState('[]');
  const [rpcOutput, setRpcOutput] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // SDK Language
  const [sdkLang, setSdkLang] = useState<'ts' | 'python' | 'curl' | 'go'>('ts');

  const rpcMethods = [
    { method: 'tixa_getNetworkStats', desc: 'Returns current block height, TPS, circulating supply, and validator count.' },
    { method: 'tixa_getBlockByNumber', desc: 'Returns full block header, transactions, and Merkle root by height number.' },
    { method: 'tixa_getBalance', desc: 'Returns liquid, staked, and locked TIXA balance for a given address.' },
    { method: 'tixa_getValidators', desc: 'Returns active and standby BFT consensus validator nodes.' },
    { method: 'tixa_getTokens', desc: 'Returns list of all verified TX-20 smart asset contracts.' },
    { method: 'tixa_getExchangeDepth', desc: 'Returns live order book bids and asks for a trading pair.' }
  ];

  const handleExecuteRpc = () => {
    let result: any = null;
    const stats = blockchainEngine.getStats();

    switch (selectedMethod) {
      case 'tixa_getNetworkStats':
        result = stats;
        break;
      case 'tixa_getBlockByNumber':
        result = blockchainEngine.getBlocks().slice(-1)[0];
        break;
      case 'tixa_getBalance':
        result = blockchainEngine.getAccount('tx1alexchennoncustodial2050vault99aa');
        break;
      case 'tixa_getValidators':
        result = blockchainEngine.getValidators();
        break;
      case 'tixa_getTokens':
        result = tokenEngine.getTokens();
        break;
      case 'tixa_getExchangeDepth':
        result = exchangeEngine.getOrderBook('TIXA_txUSD');
        break;
      default:
        result = { error: 'Unknown RPC method' };
    }

    setRpcOutput({
      jsonrpc: '2.0',
      id: Math.floor(Math.random() * 10000),
      result
    });
  };

  const stepsBlueprint = [
    { step: 1, name: 'Formal Mathematical Architecture & Layer Boundaries', desc: 'Complete mathematical specification of 7 modular blockchain layers, BFT quorum thresholds, and state transition equations.' },
    { step: 2, name: 'Cryptographic Hash Hierarchy & Address Derivation', desc: 'WebCrypto client-side SHA-256 Merkle trees, Bech32 address encoding, and BIP-39 mnemonic phrase vault.' },
    { step: 3, name: 'Blockchain State Engine & Genesis Block', desc: 'Deterministic genesis block production, in-memory account states, nonces, and unspent balances.' },
    { step: 4, name: 'TX-20 Smart Asset Factory & Standards', desc: 'Smart token deployment factory with mintable, burnable, and pausable flags, and verified bytecode.' },
    { step: 5, name: 'Order-Book Matching Engine & Exchange Simulation', desc: 'High-speed limit and market order matching engine with visual order book depth and atomic settlement.' },
    { step: 6, name: 'Cryptographic Audit Hash-Chain Engine', desc: 'Immutable tamper-evident hash-chained event logs for transparent administrative tracking.' },
    { step: 7, name: 'High-Speed Blockchain Explorer (UI)', desc: 'Full-stack explorer with block inspectors, transaction verification, validator analytics, and address search.' },
    { step: 8, name: 'Triple-Factor Non-Custodial Authentication & Vault', desc: 'Zero plaintext password storage, client-side salted hashing, WebAuthn FIDO2 passkey prompts.' },
    { step: 9, name: 'Institutional User Financial Dashboard', desc: 'Multi-account management, gas fee estimator, live portfolio valuation, and institutional liquidity gateways.' },
    { step: 10, name: 'Multi-Role Admin Control Center (RBAC)', desc: '6-tier Role-Based Access Control, multi-sig signoff, account freezing, and immutable audit inspection.' },
    { step: 11, name: 'TX-20 Token Creation & Management Terminal', desc: 'Intuitive asset creation portal, supply mint/burn controls, and verified Solidity-equivalent interface.' },
    { step: 12, name: 'Integrated Centralized Order-Book Exchange (UI)', desc: 'Professional trading terminal with depth charts, 24h ticker metrics, and real-time execution.' },
    { step: 13, name: 'Public Network Portal & Interactive Whitepaper', desc: 'Comprehensive ecosystem portal, live block ticker, 10-phase roadmap, and cryptographic specifications.' },
    { step: 14, name: 'Automated Security & Stress-Testing Suite', desc: 'Double-spend prevention, replay attack validation, hash-chain integrity verification, and fuzz tests.' },
    { step: 15, name: 'Mainnet Transition & Node CLI Tooling', desc: 'Self-hosted node deployment instructions, JSON-RPC endpoints, and decentralized validator setup.' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-heading">
              TIXA Developer Sandbox & Architecture
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-mono">
              JSON-RPC 2.0
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Interactive JSON-RPC node sandbox, multi-language SDK client code, and 15-step ecosystem blueprint.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 font-mono text-xs">
          <button
            onClick={() => setActiveTab('rpc')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'rpc' ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            RPC Console
          </button>
          <button
            onClick={() => setActiveTab('blueprint')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'blueprint' ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            15-Step Blueprint
          </button>
          <button
            onClick={() => setActiveTab('sdk')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'sdk' ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            Client SDKs
          </button>
        </div>
      </div>

      {/* --- TAB 1: INTERACTIVE JSON-RPC CONSOLE --- */}
      {activeTab === 'rpc' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Method Selector */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-2xl cyber-glass border border-slate-800 space-y-3 font-mono text-xs">
              <h3 className="font-bold text-white font-heading text-sm flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>Select JSON-RPC Method</span>
              </h3>

              <div className="space-y-1.5">
                {rpcMethods.map(m => (
                  <div
                    key={m.method}
                    onClick={() => {
                      setSelectedMethod(m.method);
                      setRpcOutput(null);
                    }}
                    className={`p-2.5 rounded-xl cursor-pointer transition-all ${
                      selectedMethod === m.method
                        ? 'bg-cyan-950 border border-cyan-500/50 text-cyan-300'
                        : 'bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <p className="font-bold">{m.method}</p>
                    <p className="text-[10px] text-slate-400">{m.desc}</p>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleExecuteRpc}
                className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>Execute RPC Request</span>
              </button>
            </div>
          </div>

          {/* Right Column: Interactive Terminal Output */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-5 rounded-2xl bg-[#040711] border border-cyan-500/30 space-y-3 font-mono text-xs h-full flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                  <span>Endpoint: https://testnet-rpc.tixa.network/v2</span>
                </span>
                {rpcOutput && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(rpcOutput, null, 2));
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="text-[11px] text-cyan-400 flex items-center gap-1 hover:underline"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy Response'}</span>
                  </button>
                )}
              </div>

              <div className="flex-1 p-3 rounded-xl bg-black/80 border border-slate-900 overflow-x-auto text-[11px] text-cyan-300 leading-relaxed font-mono">
                {rpcOutput ? (
                  <pre>{JSON.stringify(rpcOutput, null, 2)}</pre>
                ) : (
                  <div className="text-slate-600 italic py-12 text-center">
                    Select a method on the left and click "Execute RPC Request" to simulate a real node query.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: 15-STEP BLUEPRINT ARCHITECTURE GUIDE --- */}
      {activeTab === 'blueprint' && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl cyber-glass border border-cyan-500/30 space-y-3">
            <h3 className="text-xl font-bold text-white font-heading flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-cyan-400" />
              <span>TIXAPAY 15-Step Master Architectural Blueprint</span>
            </h3>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Every milestone follows strict modular separation of concerns. All 15 foundational steps are fully realized inside the active TIXAPAY engine codebase.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stepsBlueprint.map((step) => (
              <div
                key={step.step}
                className="p-4 rounded-xl cyber-glass border border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-cyan-400">
                    STEP {step.step.toString().padStart(2, '0')}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono">
                    IMPLEMENTED & VERIFIED
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white font-heading">{step.name}</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-mono text-[11px]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 3: CLIENT SDKs --- */}
      {activeTab === 'sdk' && (
        <div className="p-6 rounded-3xl cyber-glass border border-cyan-500/30 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white font-heading">
                TIXA Developer SDK Client Code
              </h3>
              <p className="text-xs text-slate-400">
                Connect your decentralized application or institutional trading bot in seconds.
              </p>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center gap-1 font-mono text-xs">
              {(['ts', 'python', 'curl', 'go'] as const).map(lang => (
                <button
                  key={lang}
                  onClick={() => setSdkLang(lang)}
                  className={`px-3 py-1 rounded-lg uppercase font-bold transition-all ${
                    sdkLang === lang ? 'bg-cyan-500 text-black' : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#040711] border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto">
            {sdkLang === 'ts' && (
              <pre>{`import { TixaClient } from '@tixa/sdk';

const client = new TixaClient({
  rpcUrl: 'https://testnet-rpc.tixa.network/v2',
  network: 'tixa-testnet-2050'
});

// Query Network Height & TPS
const stats = await client.getNetworkStats();
console.log('Block Height:', stats.blockHeight);

// Non-Custodial Transfer
const tx = await client.sendTransaction({
  privateKey: '0x...', // Derived locally
  to: 'tx1destinationaddress...',
  amount: 25.5,
  memo: 'Decentralized Settlement'
});
console.log('Tx Broadcasted:', tx.hash);`}</pre>
            )}

            {sdkLang === 'python' && (
              <pre>{`from tixa import TixaNodeClient

client = TixaNodeClient(endpoint="https://testnet-rpc.tixa.network/v2")

# Get block by number
block = client.get_block_by_height(1048576)
print(f"Block Hash: {block['hash']}, Merkle Root: {block['header']['merkleRoot']}")

# Place order on TIXA Exchange
order = client.exchange.place_limit_order(
    pair="TIXA_txUSD",
    side="BUY",
    price=4.85,
    amount=100.0
)`}</pre>
            )}

            {sdkLang === 'curl' && (
              <pre>{`curl -X POST https://testnet-rpc.tixa.network/v2 \\
  -H "Content-Type: application/json" \\
  -d '{
    "jsonrpc": "2.0",
    "method": "tixa_getNetworkStats",
    "params": [],
    "id": 1
  }'`}</pre>
            )}

            {sdkLang === 'go' && (
              <pre>{`package main

import (
    "fmt"
    "github.com/tixa-network/tixa-go/rpc"
)

func main() {
    client := rpc.NewClient("https://testnet-rpc.tixa.network/v2")
    stats, err := client.GetStats()
    if err != nil {
        panic(err)
    }
    fmt.Printf("Current TIXA Height: %d, TPS: %f\\n", stats.Height, stats.TPS)
}`}</pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
