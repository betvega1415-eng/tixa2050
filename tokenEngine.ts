import { TX20Token } from '../types/blockchain';
import { sha256 } from './crypto';
import { blockchainEngine } from './blockchainEngine';
import { auditEngine } from './auditEngine';

const STORAGE_TOKENS_KEY = 'tixa_tx20_tokens_v1';

export class TokenEngine {
  private static instance: TokenEngine;
  private tokens: TX20Token[] = [];
  private listeners: Array<() => void> = [];

  private constructor() {
    this.initializeTokens();
  }

  public static getInstance(): TokenEngine {
    if (!TokenEngine.instance) {
      TokenEngine.instance = new TokenEngine();
    }
    return TokenEngine.instance;
  }

  public subscribe(callback: () => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notify(): void {
    this.listeners.forEach(cb => {
      try { cb(); } catch (err) { console.error('Token listener error', err); }
    });
  }

  private async initializeTokens(): Promise<void> {
    try {
      const stored = localStorage.getItem(STORAGE_TOKENS_KEY);
      if (stored) {
        this.tokens = JSON.parse(stored);
      } else {
        await this.bootstrapTokens();
      }
    } catch {
      await this.bootstrapTokens();
    }
  }

  private async bootstrapTokens(): Promise<void> {
    const genesisTreasury = 'tx1treasury2050futurenetworkprime99';

    this.tokens = [
      {
        address: 'tx1tokenneoquantumcomputation7781a9',
        name: 'Neo Quantum Compute',
        symbol: 'NEO',
        totalSupply: 10000000,
        circulatingSupply: 4500000,
        decimals: 18,
        owner: genesisTreasury,
        mintable: true,
        burnable: true,
        metadataURI: 'ipfs://QmQuantumComputeInfrastructure2050',
        createdAt: Date.now() - 86400000 * 10,
        holdersCount: 420,
        icon: 'Cpu'
      },
      {
        address: 'tx1tokenstabledigitalliquidity9982bb',
        name: 'TIXA USD Synthetic',
        symbol: 'txUSD',
        totalSupply: 50000000,
        circulatingSupply: 28500000,
        decimals: 6,
        owner: genesisTreasury,
        mintable: true,
        burnable: true,
        metadataURI: 'ipfs://QmSyntheticUSDCurrencyReserve2050',
        createdAt: Date.now() - 86400000 * 20,
        holdersCount: 1850,
        icon: 'DollarSign'
      },
      {
        address: 'tx1tokenagentautonomousneural3344cc',
        name: 'Cyber Autonomous AI',
        symbol: 'CYBER',
        totalSupply: 21000000,
        circulatingSupply: 8900000,
        decimals: 18,
        owner: genesisTreasury,
        mintable: false,
        burnable: true,
        metadataURI: 'ipfs://QmNeuralAgentGasToken2050',
        createdAt: Date.now() - 86400000 * 5,
        holdersCount: 930,
        icon: 'Bot'
      },
      {
        address: 'tx1tokensolarenergygreengrid5566dd',
        name: 'Solar Grid Mesh',
        symbol: 'SOLAR',
        totalSupply: 100000000,
        circulatingSupply: 42000000,
        decimals: 18,
        owner: genesisTreasury,
        mintable: true,
        burnable: false,
        metadataURI: 'ipfs://QmGreenProofOfSolarCapture2050',
        createdAt: Date.now() - 86400000 * 15,
        holdersCount: 610,
        icon: 'Sun'
      }
    ];

    // Distribute initial tokens to genesis treasury and test addresses
    for (const tok of this.tokens) {
      const acc = blockchainEngine.getOrCreateAccount(genesisTreasury);
      acc.tokens[tok.address] = tok.circulatingSupply;
    }

    this.saveTokens();
  }

  // Deploy a new TX-20 Standard Token on TIXA Network
  public async deployToken(params: {
    name: string;
    symbol: string;
    initialSupply: number;
    decimals: number;
    owner: string;
    mintable: boolean;
    burnable: boolean;
    metadataURI?: string;
  }): Promise<{ token: TX20Token; txHash: string }> {
    const ownerAcc = blockchainEngine.getOrCreateAccount(params.owner);
    const deployFee = 5; // 5 TIXA deployment gas fee
    if (ownerAcc.balance < deployFee) {
      throw new Error(`Insufficient TIXA balance for deployment fee (Requires 5.0 TIXA).`);
    }

    const now = Date.now();
    const tokenHash = await sha256(`TX20_DEPLOY:${params.symbol}:${params.owner}:${now}`);
    const tokenAddress = 'tx1token' + tokenHash.slice(0, 30);

    const newToken: TX20Token = {
      address: tokenAddress,
      name: params.name.trim(),
      symbol: params.symbol.trim().toUpperCase(),
      totalSupply: params.initialSupply,
      circulatingSupply: params.initialSupply,
      decimals: params.decimals || 18,
      owner: params.owner,
      mintable: params.mintable,
      burnable: params.burnable,
      metadataURI: params.metadataURI || `tixa-tx20://${params.symbol.toLowerCase()}`,
      createdAt: now,
      holdersCount: 1,
      icon: 'Coins'
    };

    // Credit initial supply to owner
    ownerAcc.tokens[tokenAddress] = params.initialSupply;

    // Submit deployment transaction
    const tx = await blockchainEngine.submitTransaction({
      sender: params.owner,
      receiver: 'tx1000000000000000000000000000000000000000',
      amount: 0,
      fee: deployFee,
      type: 'TOKEN_DEPLOY',
      payload: {
        tokenAddress,
        tokenName: params.name,
        tokenSymbol: params.symbol,
        initialSupply: params.initialSupply,
        memo: `TX-20 Protocol Deployment: ${params.symbol}`
      }
    });

    this.tokens.unshift(newToken);
    this.saveTokens();
    this.notify();

    await auditEngine.logEvent({
      actorId: params.owner,
      actorEmail: 'token_deployer@tixa.network',
      actorRole: 'DEVELOPER',
      action: 'TX20_TOKEN_DEPLOYED',
      targetId: tokenAddress,
      details: { symbol: params.symbol, supply: params.initialSupply, txHash: tx.id }
    });

    return { token: newToken, txHash: tx.id };
  }

  // Transfer TX-20 tokens between accounts
  public async transferTokens(params: {
    tokenAddress: string;
    sender: string;
    recipient: string;
    amount: number;
  }): Promise<string> {
    const senderAcc = blockchainEngine.getOrCreateAccount(params.sender);
    const recipientAcc = blockchainEngine.getOrCreateAccount(params.recipient);

    const token = this.tokens.find(t => t.address === params.tokenAddress);
    if (!token) throw new Error('Token not found');

    const currentBal = senderAcc.tokens[params.tokenAddress] || 0;
    if (currentBal < params.amount) {
      throw new Error(`Insufficient ${token.symbol} balance. Has: ${currentBal}, needs: ${params.amount}`);
    }

    senderAcc.tokens[params.tokenAddress] = currentBal - params.amount;
    recipientAcc.tokens[params.tokenAddress] = (recipientAcc.tokens[params.tokenAddress] || 0) + params.amount;

    const tx = await blockchainEngine.submitTransaction({
      sender: params.sender,
      receiver: params.recipient,
      amount: 0,
      fee: 0.001,
      type: 'TRANSFER',
      payload: {
        tokenAddress: params.tokenAddress,
        tokenSymbol: token.symbol,
        amount: params.amount,
        memo: `TX-20 ${token.symbol} Transfer`
      }
    });

    this.notify();
    return tx.id;
  }

  // Mint more tokens (if token is mintable and sender is owner)
  public async mintTokens(tokenAddress: string, amount: number, sender: string): Promise<string> {
    const token = this.tokens.find(t => t.address === tokenAddress);
    if (!token) throw new Error('Token not found');
    if (!token.mintable) throw new Error('This token is non-mintable by policy.');
    if (token.owner !== sender) throw new Error('Only the token contract owner can mint new tokens.');

    token.totalSupply += amount;
    token.circulatingSupply += amount;

    const ownerAcc = blockchainEngine.getOrCreateAccount(sender);
    ownerAcc.tokens[tokenAddress] = (ownerAcc.tokens[tokenAddress] || 0) + amount;

    const tx = await blockchainEngine.submitTransaction({
      sender,
      receiver: sender,
      amount: 0,
      fee: 0.002,
      type: 'TOKEN_MINT',
      payload: { tokenAddress, amount, memo: `TX-20 Supply Mint: +${amount} ${token.symbol}` }
    });

    this.saveTokens();
    this.notify();
    return tx.id;
  }

  // Burn tokens
  public async burnTokens(tokenAddress: string, amount: number, sender: string): Promise<string> {
    const token = this.tokens.find(t => t.address === tokenAddress);
    if (!token) throw new Error('Token not found');
    if (!token.burnable) throw new Error('This token is non-burnable by contract policy.');

    const acc = blockchainEngine.getOrCreateAccount(sender);
    const currentBal = acc.tokens[tokenAddress] || 0;
    if (currentBal < amount) throw new Error(`Insufficient token balance to burn.`);

    acc.tokens[tokenAddress] = currentBal - amount;
    token.totalSupply -= amount;
    token.circulatingSupply -= amount;

    const tx = await blockchainEngine.submitTransaction({
      sender,
      receiver: 'tx1000000000000000000000000000000000000000',
      amount: 0,
      fee: 0.001,
      type: 'TOKEN_BURN',
      payload: { tokenAddress, amount, memo: `TX-20 Supply Burn: -${amount} ${token.symbol}` }
    });

    this.saveTokens();
    this.notify();
    return tx.id;
  }

  public getTokens(): TX20Token[] {
    return [...this.tokens];
  }

  public getTokenByAddress(address: string): TX20Token | undefined {
    return this.tokens.find(t => t.address === address);
  }

  private saveTokens(): void {
    try {
      localStorage.setItem(STORAGE_TOKENS_KEY, JSON.stringify(this.tokens));
    } catch (e) {
      console.warn('Failed to save tokens', e);
    }
  }
}

export const tokenEngine = TokenEngine.getInstance();
