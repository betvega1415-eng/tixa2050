import { 
  Block, 
  Transaction, 
  Validator, 
  NetworkStats, 
  AccountState, 
  NetworkEnvironment,
  ConsensusProposal
} from '../types/blockchain';
import { sha256, calculateMerkleRoot } from './crypto';
import { auditEngine } from './auditEngine';

const STORAGE_BLOCKS_KEY = 'tixa_blocks_ledger_v1';
const STORAGE_ACCOUNTS_KEY = 'tixa_accounts_state_v1';
const STORAGE_VALIDATORS_KEY = 'tixa_validators_v1';
const STORAGE_MEMPOOL_KEY = 'tixa_mempool_v1';

export class BlockchainEngine {
  private static instance: BlockchainEngine;

  private networkEnv: NetworkEnvironment = 'mainnet';
  private blocks: Block[] = [];
  private mempool: Transaction[] = [];
  private accounts: Record<string, AccountState> = {};
  private validators: Validator[] = [];
  private proposals: ConsensusProposal[] = [];
  private stats: NetworkStats = {
    chainId: 'tixa-2050-mainnet-1',
    networkName: 'TIXAPAY Quantum Mainnet',
    blockHeight: 0,
    currentTPS: 142.5,
    peakTPS: 12500,
    avgBlockTimeSeconds: 3.0,
    activeValidators: 7,
    totalStaked: 45000000,
    totalBurned: 12480.45,
    totalSupply: 250000000,
    circulatingSupply: 165000000,
    treasuryBalance: 39987519.55,
    gasPriceGwei: 1.2,
    epoch: 142,
    lastFinalizedBlock: 0,
    status: 'OPTIMAL'
  };

  private listeners: Array<() => void> = [];
  private miningInterval: any = null;
  private isProducingBlocks: boolean = true;

  private constructor() {
    this.initializeState();
    this.startBlockProductionLoop();
  }

  public static getInstance(): BlockchainEngine {
    if (!BlockchainEngine.instance) {
      BlockchainEngine.instance = new BlockchainEngine();
    }
    return BlockchainEngine.instance;
  }

  // Subscribe to blockchain state updates
  public subscribe(callback: () => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notify(): void {
    this.listeners.forEach(cb => {
      try { cb(); } catch (err) { console.error('Listener err', err); }
    });
  }

  public getNetworkEnv(): NetworkEnvironment {
    return this.networkEnv;
  }

  public setNetworkEnv(env: NetworkEnvironment): void {
    this.networkEnv = env;
    if (env === 'development') {
      this.stats.chainId = 'tixa-2050-dev-local';
      this.stats.networkName = 'TIXA Local Devnet';
    } else {
      this.stats.chainId = 'tixa-2050-mainnet-1';
      this.stats.networkName = 'TIXAPAY Quantum Mainnet';
    }
    this.notify();
  }

  private async initializeState(): Promise<void> {
    try {
      const storedBlocks = localStorage.getItem(STORAGE_BLOCKS_KEY);
      const storedAccounts = localStorage.getItem(STORAGE_ACCOUNTS_KEY);
      const storedValidators = localStorage.getItem(STORAGE_VALIDATORS_KEY);
      const storedMempool = localStorage.getItem(STORAGE_MEMPOOL_KEY);

      if (storedBlocks && storedAccounts && storedValidators) {
        this.blocks = JSON.parse(storedBlocks);
        this.accounts = JSON.parse(storedAccounts);
        this.validators = JSON.parse(storedValidators);
        this.mempool = storedMempool ? JSON.parse(storedMempool) : [];
        this.updateStats();
      } else {
        await this.bootstrapGenesis();
      }
    } catch {
      await this.bootstrapGenesis();
    }
  }

  // Create initial Genesis block & initial state
  public async bootstrapGenesis(): Promise<void> {
    this.blocks = [];
    this.mempool = [];
    this.accounts = {};

    // Initial Genesis Validators
    this.validators = [
      {
        address: 'tx1genesisval01quantumprime7729xk82',
        name: 'Nexus Core Prime (Genesis #01)',
        pubKey: '0x04e8a1f94bc8d8e30b3...99b2',
        stakedAmount: 15000000,
        delegatedAmount: 2500000,
        commissionRate: 3.5,
        uptime: 99.99,
        blocksProposed: 1204,
        blocksValidated: 4890,
        totalRewards: 4520.12,
        status: 'ACTIVE',
        performanceScore: 99.8,
        lastActiveTimestamp: Date.now(),
        slashingCount: 0
      },
      {
        address: 'tx1genesisval02cyberhorizona9218ll44',
        name: 'Cyber Horizon Labs (Genesis #02)',
        pubKey: '0x04b2a8d77cf8910e41...14ca',
        stakedAmount: 10000000,
        delegatedAmount: 1800000,
        commissionRate: 5.0,
        uptime: 99.95,
        blocksProposed: 980,
        blocksValidated: 4880,
        totalRewards: 3120.45,
        status: 'ACTIVE',
        performanceScore: 99.4,
        lastActiveTimestamp: Date.now(),
        slashingCount: 0
      },
      {
        address: 'tx1genesisval03stellarshieldb1874cc19',
        name: 'Stellar Sentinel BFT (Genesis #03)',
        pubKey: '0x04a9f33c1d940e7192...77fe',
        stakedAmount: 8000000,
        delegatedAmount: 950000,
        commissionRate: 4.0,
        uptime: 99.92,
        blocksProposed: 810,
        blocksValidated: 4875,
        totalRewards: 2480.90,
        status: 'ACTIVE',
        performanceScore: 98.9,
        lastActiveTimestamp: Date.now(),
        slashingCount: 0
      },
      {
        address: 'tx1genesisval04matrixnode448910zk90',
        name: 'Matrix Proof Validator (Genesis #04)',
        pubKey: '0x0419fc77ad0991823...33aa',
        stakedAmount: 6000000,
        delegatedAmount: 600000,
        commissionRate: 4.5,
        uptime: 99.88,
        blocksProposed: 620,
        blocksValidated: 4860,
        totalRewards: 1910.15,
        status: 'ACTIVE',
        performanceScore: 98.5,
        lastActiveTimestamp: Date.now(),
        slashingCount: 0
      },
      {
        address: 'tx1genesisval05zenithrelay889211aa34',
        name: 'Zenith Relay Systems (Genesis #05)',
        pubKey: '0x0455aa91bc0293481...55fd',
        stakedAmount: 6000000,
        delegatedAmount: 400000,
        commissionRate: 5.0,
        uptime: 99.85,
        blocksProposed: 590,
        blocksValidated: 4855,
        totalRewards: 1820.30,
        status: 'ACTIVE',
        performanceScore: 98.1,
        lastActiveTimestamp: Date.now(),
        slashingCount: 0
      }
    ];

    // Genesis Accounts
    const genesisTreasuryAddr = 'tx1treasury2050futurenetworkprime99';
    const devFunderAddr = 'tx1faucetfunder2050testnetdroppool11';
    const genesisValAddr = 'tx1genesisval01quantumprime7729xk82';
    
    this.accounts[genesisTreasuryAddr] = {
      address: genesisTreasuryAddr,
      balance: 100000000,
      stakedBalance: 0,
      lockedBalance: 50000000,
      pendingRewards: 0,
      nonce: 0,
      tokens: {},
      isFrozen: false,
      lastUpdated: Date.now()
    };

    this.accounts[devFunderAddr] = {
      address: devFunderAddr,
      balance: 10000000,
      stakedBalance: 0,
      lockedBalance: 0,
      pendingRewards: 0,
      nonce: 0,
      tokens: {},
      isFrozen: false,
      lastUpdated: Date.now()
    };

    this.accounts[genesisValAddr] = {
      address: genesisValAddr,
      balance: 2500000,
      stakedBalance: 15000000,
      lockedBalance: 5000000,
      pendingRewards: 4520.12,
      nonce: 15,
      tokens: {},
      isFrozen: false,
      lastUpdated: Date.now()
    };

    // Genesis Block
    const genesisTime = Date.now() - (60 * 60 * 1000); // 1 hour ago
    const genesisHash = '0x00000000a94bf821e909a341e0bca7819cf9012a448102bc89a710fe81b29901';
    const genesisMerkle = await calculateMerkleRoot(['0xgenesis_tx_00000000000000000000000000000000']);
    
    const genesisTx: Transaction = {
      id: '0xgenesis_tx_00000000000000000000000000000000',
      sender: 'tx1000000000000000000000000000000000000000',
      receiver: genesisTreasuryAddr,
      amount: 250000000,
      fee: 0,
      nonce: 0,
      timestamp: genesisTime,
      type: 'TRANSFER',
      status: 'CONFIRMED',
      blockHeight: 0,
      signature: '0xgenesis_immutable_proof_signature',
      confirmations: 5000,
      gasUsed: 21000,
      payload: { memo: 'TIXAPAY Genesis: A Future-Ready Digital Infrastructure Network' }
    };

    const genesisBlock: Block = {
      header: {
        height: 0,
        timestamp: genesisTime,
        previousHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
        merkleRoot: genesisMerkle,
        stateRoot: '0xstate_root_genesis_2050',
        validatorAddress: this.validators[0].address,
        validatorSignature: '0xval_sig_genesis_nexus_prime',
        nonce: 20502050,
        gasUsed: 21000,
        gasLimit: 30000000,
        difficulty: 1
      },
      hash: genesisHash,
      transactions: [genesisTx],
      txCount: 1,
      sizeBytes: 1024,
      rewardTIXA: 0,
      burnedTIXA: 0
    };

    this.blocks.push(genesisBlock);

    // Generate ~8 historical blocks to give rich explorer timeline
    let lastHash = genesisHash;
    for (let h = 1; h <= 8; h++) {
      const blockTime = genesisTime + (h * 3000);
      const val = this.validators[h % this.validators.length];
      const mockTxHash = `0x${await sha256(`hist_tx_${h}`)}`;
      const tx: Transaction = {
        id: mockTxHash,
        sender: genesisTreasuryAddr,
        receiver: val.address,
        amount: 50 + (h * 10),
        fee: 0.001,
        nonce: h,
        timestamp: blockTime,
        type: 'TRANSFER',
        status: 'CONFIRMED',
        blockHeight: h,
        signature: `0xsig_${h}`,
        confirmations: 8 - h + 1,
        gasUsed: 21000,
        payload: { memo: `Protocol validation reward seed block #${h}` }
      };

      const mRoot = await calculateMerkleRoot([mockTxHash]);
      const rawHeader = `${h}:${blockTime}:${lastHash}:${mRoot}:${val.address}`;
      const blkHash = '0x' + (await sha256(rawHeader));

      const blk: Block = {
        header: {
          height: h,
          timestamp: blockTime,
          previousHash: lastHash,
          merkleRoot: mRoot,
          stateRoot: `0xstate_${h}`,
          validatorAddress: val.address,
          validatorSignature: `0xval_sig_${val.address.slice(0, 10)}_${h}`,
          nonce: 1000 + h,
          gasUsed: 21000,
          gasLimit: 30000000,
          difficulty: 1
        },
        hash: blkHash,
        transactions: [tx],
        txCount: 1,
        sizeBytes: 1140,
        rewardTIXA: 2.0,
        burnedTIXA: 0.0005
      };

      this.blocks.push(blk);
      lastHash = blkHash;
    }

    // Add explicit Block #9 with user-provided hashes and validator signature
    const block9Time = genesisTime + (9 * 3000);
    const block9Tx: Transaction = {
      id: '0x209a165e15c5105744378bdcd2fcb7b0112e548207068467b8804eaf72bb04cd_tx',
      sender: genesisTreasuryAddr,
      receiver: 'tx1genesisval01quantumprime7729xk82',
      amount: 150000,
      fee: 0.001,
      nonce: 9,
      timestamp: block9Time,
      type: 'TRANSFER',
      status: 'CONFIRMED',
      blockHeight: 9,
      signature: '0xval_sig_tx1genesis_14885',
      confirmations: 10,
      gasUsed: 21000,
      payload: { memo: 'Quantum Genesis Staking & Validator Consensus Reward Block' }
    };

    const block9: Block = {
      header: {
        height: 9,
        timestamp: block9Time,
        previousHash: '0xbd375c1172edee0870de7b721ed72d4311c7d055ba20f25052c82f4f7062a51a',
        merkleRoot: '0x209a165e15c5105744378bdcd2fcb7b0112e548207068467b8804eaf72bb04cd',
        stateRoot: '0xstate_root_genesis_9',
        validatorAddress: 'tx1genesisval01quantumprime7729xk82',
        validatorSignature: '0xval_sig_tx1genesis_14885',
        nonce: 205099,
        gasUsed: 21000,
        gasLimit: 30000000,
        difficulty: 1
      },
      hash: '0x4661eab3a004aa7aae4bdc49e5dc2e530783cc251fd488148aa87bd3fa2066c3',
      transactions: [block9Tx],
      txCount: 1,
      sizeBytes: 1250,
      rewardTIXA: 1.5,
      burnedTIXA: 0.0005
    };
    this.blocks.push(block9);

    this.saveToStorage();
    this.updateStats();
    this.notify();
  }

  private startBlockProductionLoop(): void {
    if (this.miningInterval) clearInterval(this.miningInterval);
    
    this.miningInterval = setInterval(async () => {
      if (this.isProducingBlocks) {
        await this.proposeAndSealNextBlock();
      }
    }, 4000); // New block every 4 seconds
  }

  // Propose and commit the next block
  public async proposeAndSealNextBlock(): Promise<Block | null> {
    if (this.validators.length === 0) return null;

    const lastBlock = this.blocks[this.blocks.length - 1];
    const newHeight = lastBlock ? lastBlock.header.height + 1 : 0;
    const now = Date.now();

    // Select validator via weighted stake round-robin
    const activeValidators = this.validators.filter(v => v.status === 'ACTIVE');
    if (activeValidators.length === 0) return null;
    const proposer = activeValidators[newHeight % activeValidators.length];

    // Pick transactions from mempool (up to 50)
    const txsToInclude = this.mempool.splice(0, 50);

    // If mempool is empty, occasionally generate a network heartbeat consensus transaction
    if (txsToInclude.length === 0 && Math.random() > 0.4) {
      const syntheticTxHash = '0x' + (await sha256(`tixa_network_heartbeat_${newHeight}_${now}`));
      txsToInclude.push({
        id: syntheticTxHash,
        sender: proposer.address,
        receiver: 'tx1000000000000000000000000000000000000000',
        amount: 0,
        fee: 0.0005,
        nonce: proposer.blocksProposed + 1,
        timestamp: now,
        type: 'TRANSFER',
        status: 'CONFIRMED',
        blockHeight: newHeight,
        signature: `0xval_heartbeat_${proposer.address.slice(0, 8)}`,
        confirmations: 1,
        gasUsed: 21000,
        payload: { memo: `Epoch Sync & BFT Vote Round #${newHeight}` }
      });
    }

    // Execute state transitions for included transactions
    let totalGasUsed = 0;
    let totalFees = 0;

    for (const tx of txsToInclude) {
      tx.status = 'CONFIRMED';
      tx.blockHeight = newHeight;
      tx.confirmations = 1;
      totalGasUsed += tx.gasUsed || 21000;
      totalFees += tx.fee || 0;

      // Apply balances if standard transfer
      if (tx.type === 'TRANSFER' && tx.amount > 0) {
        this.applyBalanceTransfer(tx.sender, tx.receiver, tx.amount, tx.fee || 0);
      }
    }

    // Reward validator (Block Reward = 1.5 TIXA + 50% Fees, 50% Fees burned)
    const blockReward = 1.5;
    const burnedFees = totalFees * 0.5;
    const validatorFeeReward = totalFees * 0.5;
    proposer.blocksProposed += 1;
    proposer.totalRewards += blockReward + validatorFeeReward;
    proposer.lastActiveTimestamp = now;

    // Credit validator balance
    this.creditBalance(proposer.address, blockReward + validatorFeeReward);

    const txHashes = txsToInclude.map(t => t.id);
    const merkleRoot = await calculateMerkleRoot(txHashes);
    const prevHash = lastBlock ? lastBlock.hash : '0x0000000000000000000000000000000000000000000000000000000000000000';
    const headerStr = `${newHeight}:${now}:${prevHash}:${merkleRoot}:${proposer.address}:${totalGasUsed}`;
    const blockHash = '0x' + (await sha256(headerStr));

    const newBlock: Block = {
      header: {
        height: newHeight,
        timestamp: now,
        previousHash: prevHash,
        merkleRoot,
        stateRoot: `0xstate_root_h${newHeight}`,
        validatorAddress: proposer.address,
        validatorSignature: `0xval_sig_${proposer.address.slice(0, 10)}_${newHeight}`,
        nonce: Math.floor(Math.random() * 900000) + 100000,
        gasUsed: totalGasUsed,
        gasLimit: 30000000,
        difficulty: 1
      },
      hash: blockHash,
      transactions: txsToInclude,
      txCount: txsToInclude.length,
      sizeBytes: 850 + (txsToInclude.length * 280),
      rewardTIXA: blockReward + validatorFeeReward,
      burnedTIXA: burnedFees
    };

    this.blocks.push(newBlock);
    // Keep max 250 blocks in memory for performance
    if (this.blocks.length > 250) {
      this.blocks.shift();
    }

    // Increment confirmations for recent blocks
    for (let i = 0; i < this.blocks.length - 1; i++) {
      const b = this.blocks[i];
      b.transactions.forEach(t => t.confirmations++);
    }

    this.stats.totalBurned += burnedFees;
    this.updateStats();
    this.saveToStorage();
    this.notify();

    return newBlock;
  }

  // Submit a new transaction to the mempool
  public async submitTransaction(txParams: {
    sender: string;
    receiver: string;
    amount: number;
    fee: number;
    type: Transaction['type'];
    signature?: string;
    payload?: any;
  }): Promise<Transaction> {
    const senderState = this.getOrCreateAccount(txParams.sender);

    if (senderState.isFrozen) {
      throw new Error(`Transaction Rejected: Sender account ${txParams.sender} is FROZEN by governance.`);
    }

    const totalRequired = txParams.amount + txParams.fee;
    if (senderState.balance < totalRequired) {
      throw new Error(`Insufficient Balance: Account has ${senderState.balance.toFixed(4)} TIXA, required ${totalRequired.toFixed(4)} TIXA.`);
    }

    const now = Date.now();
    const nonce = senderState.nonce + 1;
    senderState.nonce = nonce;

    const rawPayload = `${txParams.sender}:${txParams.receiver}:${txParams.amount}:${txParams.fee}:${nonce}:${now}`;
    const txHash = '0x' + (await sha256(rawPayload));

    const newTx: Transaction = {
      id: txHash,
      sender: txParams.sender,
      receiver: txParams.receiver,
      amount: txParams.amount,
      fee: txParams.fee,
      nonce,
      timestamp: now,
      type: txParams.type,
      status: 'PENDING',
      signature: txParams.signature || `0xauto_signed_key_${txParams.sender.slice(0, 10)}`,
      payload: txParams.payload,
      confirmations: 0,
      gasUsed: 21000
    };

    this.mempool.unshift(newTx);
    this.saveToStorage();
    this.notify();

    // Fast-track block proposal so user doesn't wait long
    setTimeout(() => {
      this.proposeAndSealNextBlock();
    }, 600);

    return newTx;
  }

  // Protocol Genesis Community Grant Claim
  public async claimFaucet(recipientAddress: string, amount: number = 100): Promise<Transaction> {
    const genesisFunder = 'tx1genesiscommunitygrantpool2050vault99';
    this.creditBalance(genesisFunder, 100000);

    const tx = await this.submitTransaction({
      sender: genesisFunder,
      receiver: recipientAddress,
      amount,
      fee: 0,
      type: 'TRANSFER',
      payload: { memo: 'TIXAPAY Mainnet Genesis Community Grant' }
    });

    await auditEngine.logEvent({
      actorId: recipientAddress,
      actorEmail: 'genesis_grants@tixa.network',
      actorRole: 'COMMUNITY',
      action: 'MAINNET_GENESIS_GRANT_CLAIM',
      targetId: recipientAddress,
      details: { amount, txHash: tx.id }
    });

    return tx;
  }

  // Staking
  public async stakeTIXA(accountAddress: string, amount: number, validatorAddress: string): Promise<Transaction> {
    const acc = this.getOrCreateAccount(accountAddress);
    if (acc.balance < amount) {
      throw new Error(`Cannot stake ${amount} TIXA. Available balance: ${acc.balance} TIXA`);
    }

    acc.balance -= amount;
    acc.stakedBalance += amount;
    acc.lastUpdated = Date.now();

    const targetVal = this.validators.find(v => v.address === validatorAddress);
    if (targetVal) {
      targetVal.delegatedAmount += amount;
    }

    const tx = await this.submitTransaction({
      sender: accountAddress,
      receiver: validatorAddress,
      amount,
      fee: 0.001,
      type: 'STAKE',
      payload: { validatorAddress, memo: 'Delegated Stake to Validator' }
    });

    return tx;
  }

  // Unstake
  public async unstakeTIXA(accountAddress: string, amount: number): Promise<Transaction> {
    const acc = this.getOrCreateAccount(accountAddress);
    if (acc.stakedBalance < amount) {
      throw new Error(`Cannot unstake ${amount} TIXA. Staked balance: ${acc.stakedBalance} TIXA`);
    }

    acc.stakedBalance -= amount;
    acc.balance += amount;
    acc.lastUpdated = Date.now();

    const tx = await this.submitTransaction({
      sender: accountAddress,
      receiver: accountAddress,
      amount,
      fee: 0.001,
      type: 'UNSTAKE',
      payload: { memo: 'Unstake release to Available Balance' }
    });

    return tx;
  }

  // Admin Account Freeze / Unfreeze
  public setAccountFreeze(address: string, isFrozen: boolean, reason: string): void {
    const acc = this.getOrCreateAccount(address);
    acc.isFrozen = isFrozen;
    acc.freezeReason = reason;
    acc.lastUpdated = Date.now();
    this.saveToStorage();
    this.notify();
  }

  // Controlled Treasury Mint (Admin)
  public async mintTreasurySupply(amount: number, reason: string, adminId: string): Promise<Transaction> {
    const treasuryAddr = 'tx1treasury2050futurenetworkprime99';
    this.creditBalance(treasuryAddr, amount);
    this.stats.totalSupply += amount;
    this.stats.circulatingSupply += amount;

    const tx = await this.submitTransaction({
      sender: 'tx1000000000000000000000000000000000000000',
      receiver: treasuryAddr,
      amount,
      fee: 0,
      type: 'TREASURY_TRANSFER',
      payload: { reason, authorizedBy: adminId, memo: 'On-Chain Supply Expansion' }
    });

    return tx;
  }

  // Admin Direct Genesis Crypto Dispatch (No admin balance constraints, sends to user's single unique address)
  public async adminDispatchUnlimitedCrypto(params: {
    targetAddress: string;
    amount: number;
    asset?: string;
    adminId: string;
    memo?: string;
  }): Promise<Transaction> {
    const targetAcc = this.getOrCreateAccount(params.targetAddress);
    const asset = params.asset || 'TIXA';
    
    if (asset === 'TIXA') {
      targetAcc.balance += params.amount;
      this.stats.totalSupply += params.amount;
      this.stats.circulatingSupply += params.amount;
    } else {
      if (!targetAcc.tokens) targetAcc.tokens = {};
      targetAcc.tokens[asset] = (targetAcc.tokens[asset] || 0) + params.amount;
    }
    targetAcc.lastUpdated = Date.now();

    const now = Date.now();
    const genesisMinter = 'tx1genesisprotocolmasterminter2050vault00';
    const rawPayload = `genesis_mint:${genesisMinter}:${params.targetAddress}:${params.amount}:${asset}:${now}`;
    const txHash = '0x' + (await sha256(rawPayload));

    const newTx: Transaction = {
      id: txHash,
      sender: genesisMinter,
      receiver: params.targetAddress,
      amount: params.amount,
      fee: 0,
      nonce: targetAcc.nonce + 1,
      timestamp: now,
      type: 'TREASURY_TRANSFER',
      status: 'CONFIRMED',
      signature: `0xgenesis_protocol_mint_${params.adminId}`,
      payload: {
        asset,
        authorizedByAdmin: params.adminId,
        memo: params.memo || 'Admin Genesis Protocol Unlimited Dispatch (0% Fee, Zero Constraints)'
      },
      confirmations: 1,
      gasUsed: 0
    };

    // Insert into latest block
    if (this.blocks.length > 0) {
      this.blocks[this.blocks.length - 1].transactions.unshift(newTx);
    }
    this.saveToStorage();
    this.notify();

    await auditEngine.logEvent({
      actorId: params.adminId,
      actorEmail: 'admin@tixa.network',
      actorRole: 'SUPER_ADMIN',
      action: 'ADMIN_UNLIMITED_CRYPTO_DISPATCH',
      targetId: params.targetAddress,
      details: {
        amount: params.amount,
        asset,
        recipientAddress: params.targetAddress,
        txHash
      }
    });

    return newTx;
  }

  // Controlled Treasury Burn (Admin)
  public async burnTreasurySupply(amount: number, reason: string, adminId: string): Promise<Transaction> {
    const treasuryAddr = 'tx1treasury2050futurenetworkprime99';
    const acc = this.getOrCreateAccount(treasuryAddr);
    if (acc.balance < amount) {
      throw new Error(`Treasury only has ${acc.balance} TIXA available to burn.`);
    }

    acc.balance -= amount;
    this.stats.totalSupply -= amount;
    this.stats.circulatingSupply -= amount;
    this.stats.totalBurned += amount;

    const tx = await this.submitTransaction({
      sender: treasuryAddr,
      receiver: 'tx1000000000000000000000000000000000000000',
      amount,
      fee: 0,
      type: 'TOKEN_BURN',
      payload: { reason, authorizedBy: adminId, memo: 'Treasury Supply Deflation Burn' }
    });

    return tx;
  }

  // Internal balance helpers
  public getOrCreateAccount(address: string): AccountState {
    if (!this.accounts[address]) {
      this.accounts[address] = {
        address,
        balance: 0,
        stakedBalance: 0,
        lockedBalance: 0,
        pendingRewards: 0,
        nonce: 0,
        tokens: {},
        isFrozen: false,
        lastUpdated: Date.now()
      };
    }
    return this.accounts[address];
  }

  public creditBalance(address: string, amount: number): void {
    const acc = this.getOrCreateAccount(address);
    acc.balance += amount;
    acc.lastUpdated = Date.now();
    this.saveToStorage();
    this.notify();
  }

  public deductBalance(address: string, amount: number, memo?: string): boolean {
    const acc = this.getOrCreateAccount(address);
    if (acc.balance < amount) return false;
    acc.balance -= amount;
    acc.lastUpdated = Date.now();
    this.saveToStorage();
    this.notify();
    return true;
  }

  private applyBalanceTransfer(sender: string, receiver: string, amount: number, fee: number): void {
    const senderAcc = this.getOrCreateAccount(sender);
    const receiverAcc = this.getOrCreateAccount(receiver);

    senderAcc.balance = Math.max(0, senderAcc.balance - (amount + fee));
    receiverAcc.balance += amount;
    senderAcc.lastUpdated = Date.now();
    receiverAcc.lastUpdated = Date.now();
  }

  private updateStats(): void {
    const lastBlock = this.blocks[this.blocks.length - 1];
    if (lastBlock) {
      this.stats.blockHeight = lastBlock.header.height;
      this.stats.lastFinalizedBlock = Math.max(0, lastBlock.header.height - 2);
    }
    this.stats.activeValidators = this.validators.filter(v => v.status === 'ACTIVE').length;
    this.stats.totalStaked = this.validators.reduce((sum, v) => sum + v.stakedAmount + v.delegatedAmount, 0);
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_BLOCKS_KEY, JSON.stringify(this.blocks.slice(-100)));
      localStorage.setItem(STORAGE_ACCOUNTS_KEY, JSON.stringify(this.accounts));
      localStorage.setItem(STORAGE_VALIDATORS_KEY, JSON.stringify(this.validators));
      localStorage.setItem(STORAGE_MEMPOOL_KEY, JSON.stringify(this.mempool.slice(0, 100)));
    } catch (e) {
      console.warn('Storage save failed', e);
    }
  }

  // Getters
  public getBlocks(): Block[] {
    return [...this.blocks];
  }

  public getMempool(): Transaction[] {
    return [...this.mempool];
  }

  public getValidators(): Validator[] {
    return [...this.validators];
  }

  public getStats(): NetworkStats {
    return { ...this.stats };
  }

  public getAccount(address: string): AccountState | null {
    return this.accounts[address] || null;
  }

  public getBalance(address: string): number {
    const acc = this.accounts[address];
    return acc ? acc.balance : 1250.0;
  }

  public creditFaucet(address: string, amount: number = 100): void {
    const acc = this.getOrCreateAccount(address);
    acc.balance += amount;
    acc.lastUpdated = Date.now();
    this.saveToStorage();
    this.notify();
  }

  public getAllAccounts(): Record<string, AccountState> {
    return { ...this.accounts };
  }

  public toggleMining(active: boolean): void {
    this.isProducingBlocks = active;
    this.notify();
  }

  public isMiningActive(): boolean {
    return this.isProducingBlocks;
  }
}

export const blockchainEngine = BlockchainEngine.getInstance();
