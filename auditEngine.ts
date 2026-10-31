import { SecurityAuditLog } from '../types/auth';
import { sha256 } from './crypto';

const AUDIT_STORAGE_KEY = 'tixa_audit_chain_v1';

export class AuditEngine {
  private static instance: AuditEngine;
  private logs: SecurityAuditLog[] = [];
  private lastHash: string = '0x0000000000000000000000000000000000000000000000000000000000000000';

  private constructor() {
    this.loadChain();
  }

  public static getInstance(): AuditEngine {
    if (!AuditEngine.instance) {
      AuditEngine.instance = new AuditEngine();
    }
    return AuditEngine.instance;
  }

  private loadChain(): void {
    try {
      const stored = localStorage.getItem(AUDIT_STORAGE_KEY);
      if (stored) {
        this.logs = JSON.parse(stored);
        if (this.logs.length > 0) {
          this.lastHash = this.logs[this.logs.length - 1].hash;
        }
      } else {
        this.seedInitialLogs();
      }
    } catch {
      this.seedInitialLogs();
    }
  }

  private async seedInitialLogs(): Promise<void> {
    this.logs = [];
    this.lastHash = '0x0000000000000000000000000000000000000000000000000000000000000000';
    
    await this.logEvent({
      actorId: 'system_genesis',
      actorEmail: 'genesis@tixa.network',
      actorRole: 'SUPER_ADMIN',
      action: 'NETWORK_GENESIS_INITIALIZED',
      details: { chainId: 'tixa-2050-main-1', totalGenesisSupply: 250000000 },
      ipAddress: '127.0.0.1 (Local Node)'
    });

    await this.logEvent({
      actorId: 'sec_admin_01',
      actorEmail: 'security@tixa.network',
      actorRole: 'SECURITY_ADMIN',
      action: 'CONSENSUS_VALIDATOR_REGISTRY_OPEN',
      details: { activeValidators: 7, consensusScheme: 'TIXA-BFT/PoS' },
      ipAddress: '192.168.1.100'
    });
  }

  public async logEvent(params: {
    actorId: string;
    actorEmail: string;
    actorRole: string;
    action: string;
    targetId?: string;
    details: Record<string, any>;
    ipAddress?: string;
    status?: 'SUCCESS' | 'DENIED' | 'REQUIRES_MULTISIG';
  }): Promise<SecurityAuditLog> {
    const timestamp = Date.now();
    const id = `audit_${timestamp}_${Math.random().toString(36).substring(2, 8)}`;
    const previousHash = this.lastHash;
    const ipAddress = params.ipAddress || '127.0.0.1';
    const status = params.status || 'SUCCESS';

    const rawToHash = `${id}:${timestamp}:${params.actorId}:${params.action}:${previousHash}:${JSON.stringify(params.details)}`;
    const hash = '0x' + (await sha256(rawToHash));

    const newLog: SecurityAuditLog = {
      id,
      timestamp,
      actorId: params.actorId,
      actorEmail: params.actorEmail,
      actorRole: params.actorRole,
      action: params.action,
      targetId: params.targetId,
      details: params.details,
      previousHash,
      hash,
      ipAddress,
      status
    };

    this.logs.unshift(newLog); // newest first for display
    this.lastHash = hash;
    this.saveChain();

    return newLog;
  }

  public logAction(params: {
    userId?: string;
    action: string;
    details: any;
    ip?: string;
    severity?: string;
    status?: 'SUCCESS' | 'DENIED' | 'REQUIRES_MULTISIG';
  }): Promise<SecurityAuditLog> {
    return this.logEvent({
      actorId: params.userId || 'system',
      actorEmail: params.userId ? `${params.userId}@tixa.network` : 'system@tixa.network',
      actorRole: 'SYSTEM_SERVICE',
      action: params.action,
      details: typeof params.details === 'string' ? { message: params.details } : params.details,
      ipAddress: params.ip || '127.0.0.1',
      status: params.status
    });
  }

  public getLogs(): SecurityAuditLog[] {
    return [...this.logs];
  }

  public async verifyIntegrity(): Promise<{ isValid: boolean; checkedCount: number; brokenIndex?: number }> {
    // Reverse to check from oldest to newest
    const chronological = [...this.logs].reverse();
    let prev = '0x0000000000000000000000000000000000000000000000000000000000000000';

    for (let i = 0; i < chronological.length; i++) {
      const entry = chronological[i];
      if (entry.previousHash !== prev) {
        return { isValid: false, checkedCount: i, brokenIndex: i };
      }
      const rawToHash = `${entry.id}:${entry.timestamp}:${entry.actorId}:${entry.action}:${entry.previousHash}:${JSON.stringify(entry.details)}`;
      const expectedHash = '0x' + (await sha256(rawToHash));
      if (entry.hash !== expectedHash) {
        return { isValid: false, checkedCount: i, brokenIndex: i };
      }
      prev = entry.hash;
    }

    return { isValid: true, checkedCount: chronological.length };
  }

  private saveChain(): void {
    try {
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(this.logs.slice(0, 200)));
    } catch (e) {
      console.warn('Failed to save audit logs', e);
    }
  }
}

export const auditEngine = AuditEngine.getInstance();
