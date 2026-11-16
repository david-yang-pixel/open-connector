import type { RequestStatement } from "./connection-request-store.ts";

/** SQL predicate for the one durable retirement fence shared by OAuth publication paths. */
export function retirementMatches(service: string, connectionName: string, generation: string): RequestStatement {
  return {
    sql: "exists (select 1 from connection_retirements where service = ? and connection_name = ? and generation = ?)",
    values: [service, connectionName, generation],
  };
}

/** Keeps retirement and publication in the same lock order, including on PostgreSQL. */
export function lockRetirement(service: string, connectionName: string, generation: string): RequestStatement {
  return {
    sql: "update connection_retirements set generation = generation where service = ? and connection_name = ? and generation = ? returning generation",
    values: [service, connectionName, generation],
  };
}

/** A retired name's row is never removed, including when no credential was ever published. */
export function initializeRetirement(service: string, connectionName: string, generation: string): RequestStatement {
  return {
    sql: "insert into connection_retirements (service, connection_name, generation) values (?, ?, ?) on conflict do nothing",
    values: [service, connectionName, generation],
  };
}
