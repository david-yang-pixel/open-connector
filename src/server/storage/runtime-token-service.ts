import type { ConnectionPermissionGrant, TokenPolicy } from "../../core/action-policy.ts";
import type { RuntimeLogger } from "../../core/types.ts";

import { createHash, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";

export interface RuntimeTokenRecord {
  id: string;
  name: string;
  tokenHash: string;
  allowedActions: string[];
  blockedActions: string[];
  allowedProxies: string[];
  allowedConnections: string[];
  connectionPermissions?: ConnectionPermissionGrant[];
  createdAt: string;
  lastUsedAt?: string;
}

export interface RuntimeTokenSummary {
  id: string;
  name: string;
  allowedActions: string[];
  blockedActions: string[];
  allowedProxies: string[];
  allowedConnections: string[];
  connectionPermissions?: ConnectionPermissionGrant[];
  createdAt: string;
  lastUsedAt?: string;
}

export interface RuntimeTokenCreation {
  token: string;
  record: RuntimeTokenRecord;
}

export interface IRuntimeTokenStore {
  add(record: RuntimeTokenRecord): Promise<void>;
  list(): Promise<RuntimeTokenRecord[]>;
  findByHash(tokenHash: string): Promise<RuntimeTokenRecord | undefined>;
  updatePolicy(id: string, policy: TokenPolicy): Promise<RuntimeTokenRecord | undefined>;
  revoke(id: string): Promise<boolean>;
  markUsed(id: string, usedAt: string): Promise<void>;
}

const tokenPrefix = "oct_";

export interface RuntimeGrant extends TokenPolicy {
  tokenId: string;
}

export class RuntimeTokenService {
  private readonly store: IRuntimeTokenStore;
  private readonly logger?: RuntimeLogger;

  constructor(store: IRuntimeTokenStore, logger?: RuntimeLogger) {
    this.store = store;
    this.logger = logger;
  }

  async createToken(
    name: string,
    policy: TokenPolicy = {
      allowedActions: [],
      blockedActions: [],
      allowedProxies: [],
      allowedConnections: [],
      connectionPermissions: [],
    },
  ): Promise<RuntimeTokenCreation> {
    const token = `${tokenPrefix}${randomBytes(32).toString("base64url")}`;
    const now = new Date().toISOString();
    const normalizedPolicy = normalizeTokenPolicy(policy);
    const record: RuntimeTokenRecord = {
      id: randomUUID(),
      name: name.trim(),
      tokenHash: hashRuntimeToken(token),
      allowedActions: normalizedPolicy.allowedActions,
      blockedActions: normalizedPolicy.blockedActions,
      allowedProxies: normalizedPolicy.allowedProxies,
      allowedConnections: normalizedPolicy.allowedConnections ?? [],
      connectionPermissions: normalizedPolicy.connectionPermissions ?? [],
      createdAt: now,
    };
    await this.store.add(record);
    return { token, record };
  }

  async listTokens(): Promise<RuntimeTokenSummary[]> {
    return (await this.store.list()).map(summarizeRuntimeToken);
  }

  async revokeToken(id: string): Promise<boolean> {
    return this.store.revoke(id);
  }

  async updateTokenPolicy(id: string, policy: TokenPolicy): Promise<RuntimeTokenSummary | undefined> {
    const record = await this.store.updatePolicy(id, normalizeTokenPolicy(policy));
    return record ? summarizeRuntimeToken(record) : undefined;
  }

  /**
   * Drop a deleted connection from every token that grants it, so policies stop listing an ID
   * that no longer resolves. An empty connection list means "any connection", so a token whose
   * only grants point at deleted connections keeps them and stays restricted to nothing instead
   * of silently widening. The connection is already gone when this runs, so a failed write is
   * logged rather than failing the deletion; a stale grant authorizes nothing.
   */
  async removeConnectionGrants(connectionId: string): Promise<void> {
    try {
      for (const token of await this.store.list()) {
        const connectionPermissions = token.connectionPermissions ?? [];
        const remainingPermissions = connectionPermissions.filter((grant) => grant.connectionId !== connectionId);
        const remainingConnections = token.allowedConnections.filter((id) => id !== connectionId);
        if (
          remainingPermissions.length === connectionPermissions.length &&
          remainingConnections.length === token.allowedConnections.length
        ) {
          continue;
        }
        if (remainingPermissions.length === 0 && remainingConnections.length === 0) {
          this.logger?.warn(
            { tokenId: token.id, connectionId },
            "runtime token keeps a deleted connection grant to stay restricted",
          );
          continue;
        }

        await this.store.updatePolicy(token.id, {
          allowedActions: token.allowedActions,
          blockedActions: token.blockedActions,
          allowedProxies: token.allowedProxies,
          allowedConnections: remainingConnections,
          connectionPermissions: remainingPermissions,
        });
      }
    } catch (error) {
      this.logger?.warn({ connectionId, err: error }, "runtime token connection grant cleanup failed");
    }
  }

  async resolveToken(token: string): Promise<RuntimeGrant | undefined> {
    if (!token.startsWith(tokenPrefix)) {
      return undefined;
    }
    const tokenHash = hashRuntimeToken(token);
    const matched = await this.store.findByHash(tokenHash);
    if (!matched || !equalHashes(matched.tokenHash, tokenHash)) {
      return undefined;
    }

    await this.recordLastUsed(matched.id);
    return {
      tokenId: matched.id,
      allowedActions: matched.allowedActions,
      blockedActions: matched.blockedActions,
      allowedProxies: matched.allowedProxies,
      allowedConnections: matched.allowedConnections ?? [],
      connectionPermissions: matched.connectionPermissions ?? [],
    };
  }

  async verifyToken(token: string): Promise<boolean> {
    return Boolean(await this.resolveToken(token));
  }

  /**
   * `last_used_at` is best-effort audit metadata, so a failed write is logged
   * instead of turning an authenticated caller into a failed request.
   */
  private async recordLastUsed(tokenId: string): Promise<void> {
    try {
      await this.store.markUsed(tokenId, new Date().toISOString());
    } catch (error) {
      this.logger?.warn({ tokenId, err: error }, "runtime token last use update failed");
    }
  }
}

function normalizeTokenPolicy(policy: TokenPolicy): TokenPolicy {
  const connectionPermissions = policy.connectionPermissions ?? [];
  return {
    ...policy,
    allowedConnections:
      connectionPermissions.length > 0
        ? connectionPermissions.map((grant) => grant.connectionId)
        : (policy.allowedConnections ?? []),
    connectionPermissions,
  };
}

export function hashRuntimeToken(token: string): string {
  return createHash("sha256").update(token).digest("base64url");
}

export function summarizeRuntimeToken(record: RuntimeTokenRecord): RuntimeTokenSummary {
  return {
    id: record.id,
    name: record.name,
    allowedActions: record.allowedActions,
    blockedActions: record.blockedActions,
    allowedProxies: record.allowedProxies,
    allowedConnections: record.allowedConnections,
    connectionPermissions: record.connectionPermissions ?? [],
    createdAt: record.createdAt,
    lastUsedAt: record.lastUsedAt,
  };
}

function equalHashes(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}
