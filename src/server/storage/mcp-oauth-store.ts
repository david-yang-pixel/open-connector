import type { RequestTransaction } from "./connection-request-store.ts";
import type { RuntimeRow } from "./runtime-sql.ts";

import { optionalRawString } from "../../core/cast.ts";
import { parseJson, readString } from "./runtime-sql.ts";

/** How a registered MCP OAuth client authenticates to the token endpoint (RFC 7591 `token_endpoint_auth_method`). */
export type McpOAuthClientAuthMethod = "none" | "client_secret_basic" | "client_secret_post";

/** One OAuth client registered through dynamic client registration for the /mcp endpoint. */
export interface McpOAuthClient {
  clientId: string;
  clientName: string;
  redirectUris: string[];
  tokenEndpointAuthMethod: McpOAuthClientAuthMethod;
  clientSecretHash: string | null;
  createdAt: string;
  lastUsedAt: string | null;
}

export interface McpOAuthClientRegistration {
  client: McpOAuthClient;
  /** Clients that never completed a token exchange and were created before this instant are pruned first. */
  staleBefore: string;
  /** Registration is refused once this many clients exist after pruning. */
  maxClients: number;
}

export interface McpOAuthStateInput {
  id: string;
  /** Serialized state owned by the MCP OAuth service. */
  value: string;
  expiresAt: string;
  /** Rows that expired before this instant are deleted while the new row is written. */
  purgeBefore: string;
}

const clientColumns =
  "client_id, client_name, redirect_uris, token_endpoint_auth_method, client_secret_hash, created_at, last_used_at";

/**
 * Shared SQL for MCP OAuth clients and short-lived authorization state on SQLite, PostgreSQL and D1.
 *
 * State rows hold pending authorization requests and authorization codes. They are consumed exactly once; a consumed
 * code row is kept until it is purged so a replayed code can still be traced to the token it issued.
 */
export class McpOAuthStore {
  private readonly transaction: RequestTransaction;

  constructor(transaction: RequestTransaction) {
    this.transaction = transaction;
  }

  /** Insert a client unless the registration cap is reached. Returns whether the client was stored. */
  async registerClient(registration: McpOAuthClientRegistration): Promise<boolean> {
    const { client } = registration;
    const [, inserted] = await this.transaction([
      {
        sql: "delete from mcp_oauth_clients where last_used_at is null and created_at < ?",
        values: [registration.staleBefore],
      },
      {
        sql: `insert into mcp_oauth_clients (${clientColumns})
          select ?, ?, ?, ?, ?, ?, ? where (select count(*) from mcp_oauth_clients) < ? returning client_id`,
        values: [
          client.clientId,
          client.clientName,
          JSON.stringify(client.redirectUris),
          client.tokenEndpointAuthMethod,
          client.clientSecretHash,
          client.createdAt,
          client.lastUsedAt,
          registration.maxClients,
        ],
      },
    ]);
    return inserted.length > 0;
  }

  async getClient(clientId: string): Promise<McpOAuthClient | undefined> {
    const [[row]] = await this.transaction([
      { sql: `select ${clientColumns} from mcp_oauth_clients where client_id = ?`, values: [clientId] },
    ]);
    return row ? readClientRow(row) : undefined;
  }

  async markClientUsed(clientId: string, usedAt: string): Promise<void> {
    await this.transaction([
      { sql: "update mcp_oauth_clients set last_used_at = ? where client_id = ?", values: [usedAt, clientId] },
    ]);
  }

  async putState(input: McpOAuthStateInput): Promise<void> {
    await this.transaction([
      { sql: "delete from mcp_oauth_states where expires_at < ?", values: [input.purgeBefore] },
      {
        sql: "insert into mcp_oauth_states (id, value, expires_at) values (?, ?, ?)",
        values: [input.id, input.value, input.expiresAt],
      },
    ]);
  }

  /** Read an unconsumed, unexpired state without consuming it. */
  async readState(id: string, now: string): Promise<string | undefined> {
    const [[row]] = await this.transaction([
      {
        sql: "select value from mcp_oauth_states where id = ? and consumed_at is null and expires_at > ?",
        values: [id, now],
      },
    ]);
    return row ? readString(row, "value") : undefined;
  }

  /** Atomically consume an unexpired state. Concurrent callers race; at most one receives the value. */
  async consumeState(id: string, now: string): Promise<string | undefined> {
    const [[row]] = await this.transaction([
      {
        sql: "update mcp_oauth_states set consumed_at = ? where id = ? and consumed_at is null and expires_at > ? returning value",
        values: [now, id, now],
      },
    ]);
    return row ? readString(row, "value") : undefined;
  }

  async recordIssuedToken(id: string, tokenId: string): Promise<void> {
    await this.transaction([
      { sql: "update mcp_oauth_states set issued_token_id = ? where id = ?", values: [tokenId, id] },
    ]);
  }

  /** The token issued from an already consumed state, used to revoke it when the same code is replayed. */
  async readIssuedTokenId(id: string): Promise<string | undefined> {
    const [[row]] = await this.transaction([
      {
        sql: "select issued_token_id from mcp_oauth_states where id = ? and consumed_at is not null",
        values: [id],
      },
    ]);
    return optionalRawString(row?.issued_token_id);
  }
}

function readClientRow(row: RuntimeRow): McpOAuthClient {
  return {
    clientId: readString(row, "client_id"),
    clientName: readString(row, "client_name"),
    redirectUris: parseJson<string[]>(readString(row, "redirect_uris")),
    tokenEndpointAuthMethod: readString(row, "token_endpoint_auth_method") as McpOAuthClientAuthMethod,
    clientSecretHash: optionalRawString(row.client_secret_hash) ?? null,
    createdAt: readString(row, "created_at"),
    lastUsedAt: optionalRawString(row.last_used_at) ?? null,
  };
}
