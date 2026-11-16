import type { IOAuthStateStore, OAuthAuthorizationState } from "../../oauth/oauth-flow-service.ts";
import type { ISecretCodec } from "../secrets/secret-codec-core.ts";
import type { RequestTransaction } from "./connection-request-store.ts";

import { normalizeConnectionName } from "../../connection-service.ts";
import { initializeRetirement, lockRetirement, retirementMatches } from "./connection-retirement.ts";

/** Pending OAuth state shares the same durable fence and transaction as credential retirement. */
export class SqlOAuthStateStore implements IOAuthStateStore {
  private readonly transaction: RequestTransaction;
  private readonly codec: ISecretCodec;

  constructor(transaction: RequestTransaction, codec: ISecretCodec) {
    this.transaction = transaction;
    this.codec = codec;
  }

  async deleteCreatedBefore(cutoff: string): Promise<void> {
    await this.transaction([{ sql: "delete from oauth_states where created_at < ?", values: [cutoff] }]);
  }

  async set(state: OAuthAuthorizationState): Promise<void> {
    const connectionName = normalizeConnectionName(state.connectionName);
    const value = await this.codec.encode(JSON.stringify(state));
    const fence = retirementMatches(state.service, connectionName, state.retirementGeneration);
    await this.transaction([
      initializeRetirement(state.service, connectionName, state.retirementGeneration),
      lockRetirement(state.service, connectionName, state.retirementGeneration),
      {
        sql: `insert into oauth_states (state, value, created_at, service, connection_name)
        select ?, ?, ?, ?, ? where ${fence.sql}
        on conflict(state) do update set value = excluded.value, created_at = excluded.created_at,
          service = excluded.service, connection_name = excluded.connection_name`,
        values: [state.state, value, state.createdAt, state.service, connectionName, ...fence.values],
      },
    ]);
  }

  async take(state: string): Promise<OAuthAuthorizationState | undefined> {
    const [[row]] = await this.transaction([
      { sql: "delete from oauth_states where state = ? returning value", values: [state] },
    ]);
    return row ? (JSON.parse(await this.codec.decode(row.value as string)) as OAuthAuthorizationState) : undefined;
  }
}
