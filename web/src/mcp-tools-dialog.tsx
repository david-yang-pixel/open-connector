import type { ConnectionRecord } from "./model";
import type { ReactNode } from "react";

import { useTranslate } from "@embra/i18n/react";
import { Check, ChevronDown, ChevronRight, Copy, Loader2, RefreshCw, Search, Wrench } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge, EmptyState } from "./shared-ui";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export interface McpToolItem {
  name: string;
  description?: string;
  inputSchema?: {
    type?: string;
    properties?: Record<
      string,
      {
        type?: string;
        description?: string;
        title?: string;
        [key: string]: unknown;
      }
    >;
    required?: string[];
    [key: string]: unknown;
  };
  annotations?: Record<string, unknown>;
}

interface McpToolsDialogProps {
  connection: ConnectionRecord;
  open: boolean;
  onOpenChange(open: boolean): void;
}

export function McpToolsDialog(props: McpToolsDialogProps): ReactNode {
  const t = useTranslate();
  const [tools, setTools] = useState<McpToolItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedTools, setExpandedTools] = useState<Record<string, boolean>>({});
  const [copiedName, setCopiedName] = useState<string | null>(null);

  const connectionName = props.connection.connectionName || "default";

  const fetchTools = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/v1/actions/custom_mcp.list_tools", {
        method: "POST",
        headers: new Headers({ "content-type": "application/json" }),
        credentials: "same-origin",
        body: JSON.stringify({
          input: {},
          connectionName,
        }),
      });

      const payload = (await response.json()) as {
        success?: boolean;
        message?: string;
        data?: { tools?: McpToolItem[] };
      };

      if (response.ok && payload.success && Array.isArray(payload.data?.tools)) {
        setTools(payload.data.tools);
      } else {
        setError(payload.message || `Failed to fetch MCP tools (${response.status})`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error fetching MCP tools");
    } finally {
      setLoading(false);
    }
  }, [connectionName]);

  useEffect(() => {
    if (props.open) {
      setSearchQuery("");
      fetchTools();
    }
  }, [props.open, fetchTools]);

  const filteredTools = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return tools;
    }
    return tools.filter(
      (tool) => tool.name.toLowerCase().includes(q) || (tool.description && tool.description.toLowerCase().includes(q)),
    );
  }, [tools, searchQuery]);

  const toggleExpand = (toolName: string) => {
    setExpandedTools((prev) => ({ ...prev, [toolName]: !prev[toolName] }));
  };

  const copyToolName = (toolName: string) => {
    navigator.clipboard.writeText(toolName);
    setCopiedName(toolName);
    setTimeout(() => {
      setCopiedName((curr) => (curr === toolName ? null : curr));
    }, 2000);
  };

  const displayName =
    (props.connection.profile?.displayName as string) || props.connection.connectionName || "MCP Server";

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-6 gap-4">
        <DialogHeader className="gap-1.5">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Wrench className="w-5 h-5 text-primary" />
            <span>{t("providers.mcpToolsTitle")}</span>
            <Badge>{displayName}</Badge>
            {tools.length > 0 ? (
              <span className="text-xs text-muted-foreground ml-auto">
                {t("providers.toolCount", { count: tools.length })}
              </span>
            ) : null}
          </DialogTitle>
          <DialogDescription className="text-xs">{t("providers.mcpToolsDescription")}</DialogDescription>
        </DialogHeader>

        {tools.length > 5 ? (
          <div className="relative">
            <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("providers.searchToolsPlaceholder")}
              className="pl-8 text-xs h-8"
            />
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-[200px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <p className="text-xs">{t("providers.loadingTools")}</p>
            </div>
          ) : error ? (
            <Alert variant="destructive" className="my-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription className="text-xs flex flex-col gap-2">
                <span>{error}</span>
                <div>
                  <Button type="button" size="sm" variant="outline" onClick={fetchTools}>
                    <RefreshCw className="w-3.5 h-3.5 mr-1" />
                    {t("providers.refreshTools")}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          ) : filteredTools.length === 0 ? (
            <EmptyState
              title={t("providers.noToolsFound")}
              description={searchQuery ? `No tools match "${searchQuery}".` : t("providers.mcpToolsDescription")}
            />
          ) : (
            filteredTools.map((tool) => {
              const properties = tool.inputSchema?.properties ?? {};
              const propKeys = Object.keys(properties);
              const requiredKeys = new Set(tool.inputSchema?.required ?? []);
              const isExpanded = expandedTools[tool.name] ?? false;

              return (
                <div
                  key={tool.name}
                  className="border rounded-md p-3.5 bg-card/50 hover:bg-card transition-colors space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      <code className="font-mono font-semibold text-primary text-sm break-all">{tool.name}</code>
                      <button
                        type="button"
                        onClick={() => copyToolName(tool.name)}
                        className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors p-0.5"
                        title={t("providers.copyToolName")}
                      >
                        {copiedName === tool.name ? (
                          <Check className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    {propKeys.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => toggleExpand(tool.name)}
                        className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>
                          {t("providers.parameters")} ({propKeys.length})
                        </span>
                        {isExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5" />
                        )}
                      </button>
                    ) : (
                      <span className="text-muted-foreground text-[11px]">{t("providers.noParameters")}</span>
                    )}
                  </div>

                  {tool.description ? (
                    <p className="text-muted-foreground leading-relaxed text-xs">{tool.description}</p>
                  ) : null}

                  {isExpanded && propKeys.length > 0 ? (
                    <div className="mt-2 pt-2 border-t space-y-1.5 bg-muted/30 rounded p-2.5">
                      <div className="font-medium text-[11px] text-muted-foreground uppercase tracking-wider">
                        {t("providers.parameters")}
                      </div>
                      <div className="space-y-2 divide-y divide-border/40">
                        {propKeys.map((propName) => {
                          const prop = properties[propName] || {};
                          const isRequired = requiredKeys.has(propName);
                          return (
                            <div key={propName} className="pt-1.5 first:pt-0">
                              <div className="flex items-center gap-1.5 font-mono text-[11px]">
                                <span className="font-semibold text-foreground">{propName}</span>
                                {isRequired ? (
                                  <span className="text-destructive font-bold" title={t("providers.required")}>
                                    *
                                  </span>
                                ) : null}
                                <span className="text-muted-foreground text-[10px]">({prop.type || "any"})</span>
                              </div>
                              {prop.description ? (
                                <p className="text-muted-foreground text-[11px] mt-0.5">{prop.description}</p>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={fetchTools}
            disabled={loading}
            className="gap-1.5 text-xs text-muted-foreground"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>{t("providers.refreshTools")}</span>
          </Button>

          <Button type="button" variant="outline" size="sm" onClick={() => props.onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
