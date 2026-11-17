export type QuickbooksEnvironment = "production" | "sandbox";

/** Accounting API hosts. The environment selects one of these; no credential value becomes a URL. */
export const quickbooksBaseUrls: Record<QuickbooksEnvironment, string> = {
  production: "https://quickbooks.api.intuit.com",
  sandbox: "https://sandbox-quickbooks.api.intuit.com",
};

/** Sent as `minorversion` on every request. Intuit serves minor versions 1-74 as 75 since 2025-08-01. */
export const quickbooksMinorVersion = "75";

/** Largest `MAXRESULTS` the query endpoint accepts. */
export const quickbooksMaxResults = 1000;

/** Page size used when a list action does not set `max_results`. */
export const quickbooksDefaultMaxResults = 100;

/** Entity name used in query statements and the lowercase path segment used by CRUD endpoints. */
export interface QuickbooksEntity {
  name: string;
  path: string;
}

/** The only OAuth scope the QuickBooks Online Accounting API needs; it covers reads and writes. */
export const quickbooksAccountingScope = "com.intuit.quickbooks.accounting";

/** Intuit OAuth token endpoint; the refresh hook receives no token URL, so it is pinned here to match `definition.ts`. */
export const quickbooksTokenUrl = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer";
