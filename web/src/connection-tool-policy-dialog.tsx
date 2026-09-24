import type { ConnectionGrantOption } from "./access-page";
import type { ConnectionAccessLevel, ConnectionToolPolicy } from "./model";
import type { ReactNode } from "react";

import { useTranslate } from "@embra/i18n/react";
import { Loader2, Search, Wrench, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge, FormStatus } from "./shared-ui";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type ToolRisk = "read" | "write" | "destructive";
type RiskFilter = "all" | ToolRisk;

interface ConnectionToolItem {
  actionId: string;
  name: string;
  description?: string;
  operationType: ToolRisk;
}

interface ConnectionToolCatalog {
  connectionId: string;
  service: string;
  tools: ConnectionToolItem[];
  total: number;
}

interface ConnectionToolPolicyDialogProps {
  option: ConnectionGrantOption;
  access: ConnectionAccessLevel;
  value?: ConnectionToolPolicy;
  allowProxy: boolean;
  open: boolean;
  onOpenChange(open: boolean): void;
  onSave(value: ConnectionToolPolicy, allowProxy: boolean): void;
}

const pageSize = 50;

export function ConnectionToolPolicyDialog(props: ConnectionToolPolicyDialogProps): ReactNode {
  const t = useTranslate();
  const [tools, setTools] = useState<ConnectionToolItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [risk, setRisk] = useState<RiskFilter>("all");
  const [selectedOnly, setSelectedOnly] = useState(false);
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const [draft, setDraft] = useState<ConnectionToolPolicy>(() => props.value ?? emptyAllToolPolicy());
  const [allowProxy, setAllowProxy] = useState(props.access === "full" && props.allowProxy);

  useEffect(() => {
    if (!props.open) return;
    setDraft(props.value ?? emptyAllToolPolicy());
    setQuery("");
    setRisk("all");
    setSelectedOnly(false);
    setVisibleCount(pageSize);
    setAllowProxy(props.access === "full" && props.allowProxy);
    setLoading(true);
    setError(null);
    void fetch(`/api/connections/tools/${encodeURIComponent(props.option.id)}`, { credentials: "same-origin" })
      .then(async (response) => {
        const payload = (await response.json()) as ConnectionToolCatalog & { error?: { message?: string } };
        if (!response.ok || !Array.isArray(payload.tools)) {
          throw new Error(payload.error?.message ?? `Failed to load tools (${response.status})`);
        }
        setTools(payload.tools);
      })
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Failed to load tools."))
      .finally(() => setLoading(false));
  }, [props.access, props.allowProxy, props.open, props.option.id, props.value]);

  const counts = useMemo(() => {
    return {
      all: tools.length,
      read: tools.filter((tool) => tool.operationType === "read").length,
      write: tools.filter((tool) => tool.operationType === "write").length,
      destructive: tools.filter((tool) => tool.operationType === "destructive").length,
    };
  }, [tools]);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return tools.filter((tool) => {
      if (risk !== "all" && tool.operationType !== risk) return false;
      if (selectedOnly && !toolSelected(draft, tool.actionId)) return false;
      if (!normalized) return true;
      return tool.name.toLowerCase().includes(normalized) || tool.description?.toLowerCase().includes(normalized);
    });
  }, [draft, query, risk, selectedOnly, tools]);
  const visible = filtered.slice(0, visibleCount);
  const compatible = filtered.filter((tool) => accessAllows(props.access, tool.operationType));
  const compatibleTools = tools.filter((tool) => accessAllows(props.access, tool.operationType));
  const selectedCount = compatibleTools.filter((tool) => toolSelected(draft, tool.actionId)).length;
  const catalogIds = new Set(tools.map((tool) => tool.actionId));
  const staleIds = policyIds(draft).filter((id) => !catalogIds.has(id));
  const invalid = draft.mode === "selected" && draft.allowedActionIds.length === 0;

  function changeMode(mode: ConnectionToolPolicy["mode"]): void {
    setDraft(mode === "all" ? emptyAllToolPolicy() : { mode: "selected", allowedActionIds: [] });
  }

  function toggleTool(tool: ConnectionToolItem): void {
    if (!accessAllows(props.access, tool.operationType)) return;
    if (draft.mode === "selected") {
      setDraft({
        mode: "selected",
        allowedActionIds: toggleId(draft.allowedActionIds, tool.actionId),
      });
      return;
    }
    setDraft({ mode: "all", excludedActionIds: toggleId(draft.excludedActionIds, tool.actionId) });
  }

  function setFilteredSelection(selected: boolean): void {
    const ids = new Set(compatible.map((tool) => tool.actionId));
    if (draft.mode === "selected") {
      setDraft({
        mode: "selected",
        allowedActionIds: selected
          ? [...new Set([...draft.allowedActionIds, ...ids])]
          : draft.allowedActionIds.filter((id) => !ids.has(id)),
      });
      return;
    }
    setDraft({
      mode: "all",
      excludedActionIds: selected
        ? draft.excludedActionIds.filter((id) => !ids.has(id))
        : [...new Set([...draft.excludedActionIds, ...ids])],
    });
  }

  function removeStaleId(actionId: string): void {
    setDraft(
      draft.mode === "selected"
        ? { mode: "selected", allowedActionIds: draft.allowedActionIds.filter((id) => id !== actionId) }
        : { mode: "all", excludedActionIds: draft.excludedActionIds.filter((id) => id !== actionId) },
    );
  }

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent
        className="connection-tool-dialog max-h-[min(860px,calc(100svh-2rem))] max-w-[min(820px,calc(100vw-2rem))] gap-0 overflow-hidden p-0 sm:max-w-[min(820px,calc(100vw-2rem))]"
        showCloseButton={false}
      >
        <DialogHeader className="token-dialog-header">
          <div>
            <DialogTitle className="flex items-center gap-2">
              <Wrench size={18} />
              {t("access.policy.tools.title")}
            </DialogTitle>
            <DialogDescription>
              {props.option.provider} · {props.option.name} ·{" "}
              {t(`access.policy.editor.access${capitalize(props.access)}`)}
            </DialogDescription>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={() => props.onOpenChange(false)}>
            <X size={16} />
          </Button>
        </DialogHeader>

        <div className="connection-tool-dialog-body">
          <fieldset className="policy-allow-mode">
            <legend>{t("access.policy.tools.scope")}</legend>
            <label>
              <input type="radio" checked={draft.mode === "all"} onChange={() => changeMode("all")} />
              <span>
                <strong>{t("access.policy.tools.allMode")}</strong>
                <small>{t("access.policy.tools.allModeHint")}</small>
              </span>
            </label>
            <label>
              <input type="radio" checked={draft.mode === "selected"} onChange={() => changeMode("selected")} />
              <span>
                <strong>{t("access.policy.tools.selectedMode")}</strong>
                <small>{t("access.policy.tools.selectedModeHint")}</small>
              </span>
            </label>
          </fieldset>

          <div className="connection-tool-toolbar">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                className="pl-8"
                placeholder={t("access.policy.tools.search")}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setVisibleCount(pageSize);
                }}
              />
            </div>
            <label className="connection-tool-selected-only">
              <input
                type="checkbox"
                checked={selectedOnly}
                onChange={(event) => {
                  setSelectedOnly(event.target.checked);
                  setVisibleCount(pageSize);
                }}
              />
              {t("access.policy.tools.selectedOnly")}
            </label>
          </div>

          <div className="connection-tool-filters">
            {(["all", "read", "write", "destructive"] as const).map((value) => (
              <Button
                key={value}
                type="button"
                size="sm"
                variant={risk === value ? "default" : "outline"}
                onClick={() => {
                  setRisk(value);
                  setVisibleCount(pageSize);
                }}
              >
                {t(`access.policy.tools.filter${capitalize(value)}`)}
                <Badge>{counts[value]}</Badge>
              </Button>
            ))}
          </div>

          <div className="connection-tool-selection-bar">
            <span>
              {t("access.policy.tools.selectionCount", { selected: selectedCount, total: compatibleTools.length })}
            </span>
            <div className="flex gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => setFilteredSelection(true)}>
                {t("access.policy.tools.selectFiltered")}
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => setFilteredSelection(false)}>
                {t("access.policy.tools.clearFiltered")}
              </Button>
            </div>
          </div>

          {staleIds.length > 0 ? (
            <section className="connection-tool-stale" aria-label={t("access.policy.tools.unavailableTitle")}>
              <div>
                <strong>{t("access.policy.tools.unavailableTitle", { count: staleIds.length })}</strong>
                <small>{t("access.policy.tools.unavailableHint")}</small>
              </div>
              {staleIds.map((actionId) => (
                <div key={actionId}>
                  <code>{actionId}</code>
                  <Button type="button" size="sm" variant="ghost" onClick={() => removeStaleId(actionId)}>
                    <X size={14} />
                    {t("access.policy.tools.removeUnavailable")}
                  </Button>
                </div>
              ))}
            </section>
          ) : null}

          <div className="connection-tool-list">
            {loading ? (
              <div className="connection-tool-state">
                <Loader2 className="animate-spin" size={20} />
                {t("access.policy.tools.loading")}
              </div>
            ) : error ? (
              <FormStatus message={error} />
            ) : visible.length === 0 ? (
              <div className="connection-tool-state">{t("access.policy.tools.empty")}</div>
            ) : (
              visible.map((tool) => {
                const allowedByAccess = accessAllows(props.access, tool.operationType);
                return (
                  <label className="connection-tool-row" key={tool.actionId}>
                    <input
                      type="checkbox"
                      checked={toolSelected(draft, tool.actionId) && allowedByAccess}
                      disabled={!allowedByAccess}
                      onChange={() => toggleTool(tool)}
                    />
                    <span className="connection-tool-copy">
                      <code>{tool.name}</code>
                      {tool.description ? <small>{tool.description}</small> : null}
                    </span>
                    <Badge tone={tool.operationType === "destructive" ? "error" : undefined}>
                      {t(`access.policy.tools.filter${capitalize(tool.operationType)}`)}
                    </Badge>
                    {!allowedByAccess ? <small>{t("access.policy.tools.raiseAccess")}</small> : null}
                  </label>
                );
              })
            )}
          </div>

          {visible.length < filtered.length ? (
            <Button type="button" variant="outline" onClick={() => setVisibleCount((count) => count + pageSize)}>
              {t("access.policy.tools.loadMore", { shown: visible.length, total: filtered.length })}
            </Button>
          ) : null}
          <label className={`connection-proxy-toggle ${props.access !== "full" ? "is-disabled" : ""}`}>
            <input
              type="checkbox"
              checked={allowProxy}
              disabled={props.access !== "full"}
              onChange={(event) => setAllowProxy(event.target.checked)}
            />
            <span>
              <strong>{t("access.policy.tools.rawProxy")}</strong>
              <small>
                {t(
                  props.access === "full"
                    ? "access.policy.tools.rawProxyHint"
                    : "access.policy.tools.rawProxyRequiresFull",
                )}
              </small>
            </span>
          </label>
          {invalid ? <p className="policy-rule-error">{t("access.policy.tools.selectedRequired")}</p> : null}
        </div>

        <div className="connection-tool-dialog-actions">
          <Button type="button" variant="outline" onClick={() => props.onOpenChange(false)}>
            {t("common.close")}
          </Button>
          <Button
            type="button"
            disabled={loading || Boolean(error) || invalid}
            onClick={() => {
              props.onSave(draft, props.access === "full" && allowProxy);
              props.onOpenChange(false);
            }}
          >
            {t("access.policy.tools.save")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function emptyAllToolPolicy(): ConnectionToolPolicy {
  return { mode: "all", excludedActionIds: [] };
}

function toolSelected(policy: ConnectionToolPolicy, actionId: string): boolean {
  return policy.mode === "selected"
    ? policy.allowedActionIds.includes(actionId)
    : !policy.excludedActionIds.includes(actionId);
}

function policyIds(policy: ConnectionToolPolicy): string[] {
  return policy.mode === "selected" ? policy.allowedActionIds : policy.excludedActionIds;
}

function toggleId(values: string[], id: string): string[] {
  return values.includes(id) ? values.filter((value) => value !== id) : [...values, id];
}

function accessAllows(access: ConnectionAccessLevel, operationType: ToolRisk): boolean {
  if (access === "full") return true;
  if (access === "read") return operationType === "read";
  return operationType === "read" || operationType === "write";
}

function capitalize(value: string): string {
  return `${value.slice(0, 1).toUpperCase()}${value.slice(1)}`;
}
