import type { ProviderFetch } from "../../providers/provider-runtime.ts";

import { looseArray, optionalNumber, optionalRecord, optionalString } from "../../core/cast.ts";
import { readBoundedResponseBytes } from "../../core/request.ts";
import { providerFetch } from "../../providers/provider-runtime.ts";

const apiOrigin = "https://api.cloudflare.com/client/v4";
const accountIdPattern = /^[a-f0-9]{32}$/;
const responseMaxBytes = 1_000_000;
const d1GroupLimit = 1_000;
const workerGroupLimit = 10_000;

export interface CloudflareDailyMetric {
  used: number;
  limit: number;
}

export interface CloudflareAccountUsage {
  accountId: string;
  accountName: string;
  workerRequests: CloudflareDailyMetric;
  d1RowsRead: CloudflareDailyMetric;
  d1RowsWritten: CloudflareDailyMetric;
}

export interface CloudflareUsageSnapshot {
  periodStart: string;
  observedAt: string;
  accounts: CloudflareAccountUsage[];
}

export class CloudflareUsageError extends Error {
  constructor(message: string) {
    super(message);
  }
}

/** Read account-wide Free-plan reference usage without exposing the connected API token. */
export async function loadCloudflareUsage(
  token: string,
  options: { fetcher?: ProviderFetch; now?: Date; signal?: AbortSignal } = {},
): Promise<CloudflareUsageSnapshot> {
  const fetcher = options.fetcher ?? providerFetch;
  const observedAt = (options.now ?? new Date()).toISOString();
  const date = observedAt.slice(0, 10);
  const periodStart = `${date}T00:00:00.000Z`;
  const accountsPayload = await requestCloudflareJson(fetcher, token, `${apiOrigin}/accounts?per_page=50`, {
    method: "GET",
    signal: options.signal,
  });
  const accountResult = optionalRecord(accountsPayload);
  if (accountResult?.success === false || !Array.isArray(accountResult?.result)) {
    throw new CloudflareUsageError("Cloudflare returned an invalid account list.");
  }
  const accountPage = optionalRecord(accountResult?.result_info);
  if ((optionalNumber(accountPage?.total_pages) ?? 1) > 1) {
    throw new CloudflareUsageError("Too many Cloudflare accounts to display without pagination.");
  }
  const accounts = looseArray(accountResult?.result).map((entry) => {
    const record = optionalRecord(entry);
    const accountId = optionalString(record?.id);
    const accountName = optionalString(record?.name);
    if (!accountId || !accountIdPattern.test(accountId) || !accountName) {
      throw new CloudflareUsageError("Cloudflare returned an invalid account list.");
    }
    return { accountId, accountName };
  });

  const usage = await Promise.all(
    accounts.map(async (account): Promise<CloudflareAccountUsage> => {
      const query = createUsageQuery(account.accountId, date, periodStart, observedAt);
      const payload = await requestCloudflareJson(fetcher, token, `${apiOrigin}/graphql`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query }),
        signal: options.signal,
      });
      const result = optionalRecord(payload);
      if (looseArray(result?.errors).length > 0) {
        throw new CloudflareUsageError("Cloudflare Analytics rejected the request. Check Analytics Read permission.");
      }
      const viewer = optionalRecord(optionalRecord(result?.data)?.viewer);
      const accountUsage = optionalRecord(looseArray(viewer?.accounts)[0]);
      if (!accountUsage) {
        throw new CloudflareUsageError("Cloudflare Analytics did not return account usage.");
      }
      const d1Groups = accountUsage.d1AnalyticsAdaptiveGroups;
      const workerGroups = accountUsage.workersInvocationsAdaptive;
      if (!Array.isArray(d1Groups) || !Array.isArray(workerGroups)) {
        throw new CloudflareUsageError("Cloudflare Analytics returned incomplete usage data.");
      }
      if (d1Groups.length >= d1GroupLimit || workerGroups.length >= workerGroupLimit) {
        throw new CloudflareUsageError("Cloudflare Analytics usage exceeds the supported group limit.");
      }
      return {
        ...account,
        workerRequests: { used: sumMetric(workerGroups, "requests"), limit: 100_000 },
        d1RowsRead: { used: sumMetric(d1Groups, "rowsRead"), limit: 5_000_000 },
        d1RowsWritten: { used: sumMetric(d1Groups, "rowsWritten"), limit: 100_000 },
      };
    }),
  );

  return { periodStart, observedAt, accounts: usage };
}

function createUsageQuery(accountId: string, date: string, periodStart: string, observedAt: string): string {
  return `query {
    viewer {
      accounts(filter: { accountTag: "${accountId}" }) {
        d1AnalyticsAdaptiveGroups(limit: ${d1GroupLimit}, filter: { date_geq: "${date}", date_leq: "${date}" }) {
          sum { rowsRead rowsWritten }
        }
        workersInvocationsAdaptive(limit: ${workerGroupLimit}, filter: {
          datetime_geq: "${periodStart}", datetime_leq: "${observedAt}"
        }) {
          sum { requests }
        }
      }
    }
  }`;
}

function sumMetric(groups: unknown, field: string): number {
  return looseArray(groups).reduce<number>((total, group) => {
    const value = optionalNumber(optionalRecord(optionalRecord(group)?.sum)?.[field]);
    if (value === undefined || !Number.isFinite(value) || value < 0) {
      throw new CloudflareUsageError("Cloudflare Analytics returned invalid usage data.");
    }
    return total + value;
  }, 0);
}

async function requestCloudflareJson(
  fetcher: ProviderFetch,
  token: string,
  url: string,
  init: RequestInit,
): Promise<unknown> {
  let response: Response;
  try {
    response = await fetcher(url, {
      ...init,
      headers: {
        accept: "application/json",
        authorization: `Bearer ${token}`,
        ...init.headers,
      },
    });
  } catch {
    throw new CloudflareUsageError("Cloudflare Analytics is temporarily unavailable.");
  }
  if (!response.ok) {
    throw new CloudflareUsageError(
      response.status === 401 || response.status === 403
        ? "Cloudflare connection lacks permission to read account analytics."
        : "Cloudflare Analytics is temporarily unavailable.",
    );
  }
  const bytes = await readBoundedResponseBytes(response, {
    maxBytes: responseMaxBytes,
    fieldName: "Cloudflare Analytics response",
    createError: () => new CloudflareUsageError("Cloudflare Analytics response was too large."),
  });
  try {
    return JSON.parse(new TextDecoder().decode(bytes)) as unknown;
  } catch {
    throw new CloudflareUsageError("Cloudflare Analytics returned an invalid response.");
  }
}
