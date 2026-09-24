import type { ConnectionRecord } from "./model.ts";
import type { ReactNode } from "react";

import { useTranslate } from "@embra/i18n/react";
import { RefreshCw } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { apiGet } from "./api";
import { Button } from "@/components/ui/button";

interface CloudflareUsageProps {
  connections: ConnectionRecord[];
}

interface CloudflareDailyMetric {
  used: number;
  limit: number;
}

interface CloudflareUsageSnapshot {
  periodStart: string;
  observedAt: string;
  accounts: {
    accountId: string;
    accountName: string;
    workerRequests: CloudflareDailyMetric;
    d1RowsRead: CloudflareDailyMetric;
    d1RowsWritten: CloudflareDailyMetric;
  }[];
}

type CloudflareUsageResponse = (CloudflareUsageSnapshot & { status: "ready" }) | { status: "unavailable" };

interface QuotaItemProps {
  label: string;
  metric: CloudflareDailyMetric;
}

export function availableCloudflareMcpConnections(connections: ConnectionRecord[]): string[] {
  return connections
    .filter(
      (connection) => connection.service === "cloudflare_mcp" && connection.configured !== false && !connection.virtual,
    )
    .map((connection) => connection.connectionName ?? "default")
    .sort((left, right) => Number(left === "default") - Number(right === "default"));
}

export function cloudflareQuotaPercent(metric: CloudflareDailyMetric): string {
  const percent = (metric.used / metric.limit) * 100;
  if (percent > 0 && percent < 0.01) return "<0.01%";
  return `${percent.toFixed(2)}%`;
}

export function CloudflareUsage(props: CloudflareUsageProps): ReactNode {
  const t = useTranslate();
  const titleId = useId();
  const names = availableCloudflareMcpConnections(props.connections);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [snapshot, setSnapshot] = useState<CloudflareUsageSnapshot | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const connectionName = selectedName && names.includes(selectedName) ? selectedName : names[0];

  useEffect(() => {
    if (!connectionName) return;
    let active = true;
    setLoading(true);
    setError(null);
    setSnapshot(null);
    setUnavailable(false);
    void apiGet<CloudflareUsageResponse>(`/api/cloudflare-usage?connectionName=${encodeURIComponent(connectionName)}`, {
      cache: "no-store",
    })
      .then((response) => {
        if (!active) return;
        if (response.status === "ready") setSnapshot(response);
        else setUnavailable(true);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "Request failed.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [connectionName, refreshVersion]);

  return (
    <section className="cloudflare-usage" aria-labelledby={titleId}>
      <div className="policy-section-title cloudflare-usage-heading">
        <div>
          <h3 id={titleId}>{t("access.policy.usage.title")}</h3>
          <p>{t("access.policy.usage.description")}</p>
        </div>
        {connectionName ? (
          <div className="cloudflare-usage-controls">
            {names.length > 1 ? (
              <select
                aria-label={t("access.policy.usage.connection")}
                value={connectionName}
                onChange={(event) => setSelectedName(event.target.value)}
              >
                {names.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            ) : null}
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={loading}
              onClick={() => setRefreshVersion((version) => version + 1)}
            >
              <RefreshCw size={14} aria-hidden="true" />
              {t("common.refresh")}
            </Button>
          </div>
        ) : null}
      </div>
      {!connectionName || unavailable ? (
        <p className="cloudflare-usage-message">{t("access.policy.usage.connectMcp")}</p>
      ) : loading && !snapshot ? (
        <p className="cloudflare-usage-message" role="status">
          {t("access.policy.usage.loading")}
        </p>
      ) : error ? (
        <p className="cloudflare-usage-message cloudflare-usage-error" role="alert">
          {t("access.policy.usage.loadFailed")} {error}
        </p>
      ) : snapshot?.accounts.length ? (
        <>
          {snapshot.accounts.map((account) => (
            <div className="cloudflare-usage-account" key={account.accountId}>
              <div className="cloudflare-usage-account-heading">
                <strong>{account.accountName}</strong>
                <small>
                  {t("access.policy.usage.asOf")}: {new Date(snapshot.observedAt).toLocaleString()}
                </small>
              </div>
              <div className="cloudflare-usage-grid">
                <QuotaItem label={t("access.policy.usage.workerRequests")} metric={account.workerRequests} />
                <QuotaItem label={t("access.policy.usage.d1RowsRead")} metric={account.d1RowsRead} />
                <QuotaItem label={t("access.policy.usage.d1RowsWritten")} metric={account.d1RowsWritten} />
              </div>
            </div>
          ))}
        </>
      ) : (
        <p className="cloudflare-usage-message">{t("access.policy.usage.noAccounts")}</p>
      )}
      <small className="cloudflare-usage-note">{t("access.policy.usage.note")}</small>
    </section>
  );
}

function QuotaItem(props: QuotaItemProps): ReactNode {
  const t = useTranslate();
  const percent = cloudflareQuotaPercent(props.metric);
  return (
    <div className="cloudflare-usage-item">
      <span>{props.label}</span>
      <strong>
        {props.metric.used.toLocaleString()} / {props.metric.limit.toLocaleString()}
      </strong>
      <div
        className="cloudflare-usage-track"
        role="progressbar"
        aria-label={props.label}
        aria-valuemin={0}
        aria-valuemax={props.metric.limit}
        aria-valuenow={Math.min(props.metric.used, props.metric.limit)}
      >
        <span style={{ width: `${Math.min((props.metric.used / props.metric.limit) * 100, 100)}%` }} />
      </div>
      <small>{t("access.policy.usage.percentUsed", { percent })}</small>
    </div>
  );
}
