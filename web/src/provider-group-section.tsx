import type { ConnectionGrantOption } from "./access-page";
import type { ConnectionAccessLevel, ConnectionToolPolicy } from "./model";
import type { ReactNode } from "react";

import { useTranslate } from "@embra/i18n/react";
import { ChevronRight } from "lucide-react";
import { Badge } from "./shared-ui";

export interface ProviderConnectionGroup {
  service: string;
  provider: string;
  options: ConnectionGrantOption[];
  toolCount: number;
}

export interface ProviderGroupSectionProps {
  group: ProviderConnectionGroup;
  listId: string;
  isExpanded: boolean;
  selectedIds: string[];
  accessById: Record<string, ConnectionAccessLevel>;
  toolPolicyById: Record<string, ConnectionToolPolicy>;
  maxItems: number;
  onToggleExpand(service: string): void;
  onToggleGroup(groupOptions: ConnectionGrantOption[]): void;
  onToggleOption(id: string, checked: boolean): void;
  onSetGroupAccess(groupOptions: ConnectionGrantOption[], access: ConnectionAccessLevel | "disabled"): void;
  onSetOptionAccess(id: string, access: ConnectionAccessLevel): void;
  onConfigureTools(option: ConnectionGrantOption): void;
}

export function ProviderGroupSection(props: ProviderGroupSectionProps): ReactNode {
  const t = useTranslate();
  const group = props.group;
  const groupOptionIds = group.options.map((o) => o.id);
  const checkedCount = groupOptionIds.filter((id) => props.selectedIds.includes(id)).length;
  const isAllChecked = checkedCount === group.options.length;
  const isIndeterminate = checkedCount > 0 && !isAllChecked;
  const selectedAccess = group.options
    .filter((option) => props.selectedIds.includes(option.id))
    .map((option) => props.accessById[option.id] ?? "full");
  const groupAccess =
    selectedAccess.length === 0
      ? "disabled"
      : isAllChecked && selectedAccess.every((access) => access === selectedAccess[0])
        ? selectedAccess[0]
        : "mixed";

  return (
    <div className="rounded border bg-card/40 overflow-hidden mb-2.5">
      <div
        className="flex items-center justify-between p-2.5 bg-muted/40 cursor-pointer hover:bg-muted/70 transition-colors select-none"
        onClick={() => props.onToggleExpand(group.service)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            className="text-muted-foreground p-0.5 hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation();
              props.onToggleExpand(group.service);
            }}
          >
            <ChevronRight
              size={16}
              className={`transition-transform duration-200 ${props.isExpanded ? "rotate-90" : ""}`}
            />
          </button>
          <input
            type="checkbox"
            className="w-4 h-4 cursor-pointer accent-primary"
            checked={isAllChecked}
            ref={(el) => {
              if (el) el.indeterminate = isIndeterminate;
            }}
            onClick={(e) => e.stopPropagation()}
            onChange={() => props.onToggleGroup(group.options)}
          />
          <strong className="text-sm truncate">{group.provider}</strong>
          <Badge>{t("providers.connectionCount", { count: group.options.length })}</Badge>
          {group.toolCount > 0 ? <Badge>{t("providers.toolCount", { count: group.toolCount })}</Badge> : null}
        </div>
        <div className="flex items-center gap-2 text-xs">
          <label className="sr-only" htmlFor={`${props.listId}-${group.service}-access`}>
            {t("access.policy.editor.providerAccess", { provider: group.provider })}
          </label>
          <select
            id={`${props.listId}-${group.service}-access`}
            className="h-8 rounded border bg-background px-2 text-xs"
            value={groupAccess}
            onClick={(e) => {
              e.stopPropagation();
            }}
            onChange={(event) =>
              props.onSetGroupAccess(group.options, event.target.value as ConnectionAccessLevel | "disabled")
            }
          >
            {groupAccess === "mixed" ? (
              <option value="mixed" disabled>
                {t("access.policy.editor.accessMixed")}
              </option>
            ) : null}
            <option value="disabled">{t("access.policy.editor.accessDisabled")}</option>
            <option value="read">{t("access.policy.editor.accessRead")}</option>
            <option value="write">{t("access.policy.editor.accessWrite")}</option>
            <option value="full">{t("access.policy.editor.accessFull")}</option>
          </select>
        </div>
      </div>

      {props.isExpanded ? (
        <div className="divide-y border-t bg-background/50">
          {group.options.map((option, index) => {
            const checked = props.selectedIds.includes(option.id);
            return (
              <div
                key={option.id}
                className={`flex items-center justify-between p-2.5 pl-8 hover:bg-accent/40 transition-colors ${
                  checked ? "bg-accent/20" : ""
                }`}
              >
                <label
                  className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer"
                  htmlFor={`${props.listId}-${group.service}-${index}`}
                >
                  <input
                    id={`${props.listId}-${group.service}-${index}`}
                    type="checkbox"
                    className="w-4 h-4 cursor-pointer accent-primary"
                    value={option.id}
                    checked={checked}
                    disabled={!checked && props.selectedIds.length >= props.maxItems}
                    onChange={(e) => props.onToggleOption(option.id, e.target.checked)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <code className="text-xs font-mono font-semibold">{option.name}</code>
                      {option.isDefault ? <Badge>{t("providers.defaultConnection")}</Badge> : null}
                    </div>
                    {option.displayName && option.displayName !== option.name ? (
                      <small className="text-muted-foreground block truncate text-xs">{option.displayName}</small>
                    ) : null}
                  </div>
                </label>

                {checked ? (
                  <div className="ml-2 flex items-center gap-2">
                    <select
                      className="h-8 rounded border bg-background px-2 text-xs"
                      value={props.accessById[option.id] ?? "read"}
                      disabled={!checked}
                      aria-label={t("access.policy.editor.connectionAccess", { connection: option.name })}
                      onChange={(event) =>
                        props.onSetOptionAccess(option.id, event.target.value as ConnectionAccessLevel)
                      }
                    >
                      <option value="read">{t("access.policy.editor.accessRead")}</option>
                      <option value="write">{t("access.policy.editor.accessWrite")}</option>
                      <option value="full">{t("access.policy.editor.accessFull")}</option>
                    </select>
                    <button
                      type="button"
                      className="inline-flex cursor-pointer"
                      title={t("access.policy.tools.configure")}
                      onClick={() => props.onConfigureTools(option)}
                    >
                      <Badge>{toolPolicyLabel(props.toolPolicyById[option.id], option.toolCount, t)}</Badge>
                    </button>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function toolPolicyLabel(
  policy: ConnectionToolPolicy | undefined,
  toolCount: number | undefined,
  t: NonNullable<ReturnType<typeof useTranslate>>,
): string {
  if (!policy || (policy.mode === "all" && policy.excludedActionIds.length === 0)) {
    return toolCount === undefined
      ? t("access.policy.tools.allTools")
      : t("access.policy.tools.allToolsCount", { count: toolCount });
  }
  return policy.mode === "selected"
    ? t("access.policy.tools.selectedCount", { count: policy.allowedActionIds.length })
    : t("access.policy.tools.excludedCount", { count: policy.excludedActionIds.length });
}
