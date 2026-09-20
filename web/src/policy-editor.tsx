import type { PolicyRules, ProviderDefinition } from "./model";
import type { AllowMode, PolicyEditorDraft, PolicyResource } from "./policy";
import type { ReactNode } from "react";

import { useTranslate } from "@embra/i18n/react";
import { CircleAlert, Plus, Trash2 } from "lucide-react";
import { useId, useMemo, useState } from "react";
import {
  filterPolicyRuleCandidates,
  isKnownPolicyRule,
  parsePolicyLines,
  policyRuleCandidates,
  policyRuleIssue,
  validatePolicyEditorDraft,
} from "./policy";
import { PolicySuggestionInput } from "./policy-suggestion-input";
import { Badge } from "./shared-ui";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

interface PolicyEditorProps {
  draft: PolicyEditorDraft;
  providers: ProviderDefinition[];
  includeProxies: boolean;
  proxyAccess?: "constraint" | "grant";
  connectionEditor?: ReactNode;
  connectionInvalid?: boolean;
  onChange(draft: PolicyEditorDraft): void;
}

export function PolicyEditor(props: PolicyEditorProps): ReactNode {
  const t = useTranslate();
  const issues = validatePolicyEditorDraft(props.draft, props.includeProxies);
  const actionIssue = issues.find((issue) => issue.field === "allowedActions" || issue.field === "blockedActions");
  const proxyIssue = issues.find((issue) => issue.field === "allowedProxies" || issue.field === "blockedProxies");
  const actionEditor = (
    <PolicyResourceEditor resource="action" draft={props.draft} providers={props.providers} onChange={props.onChange} />
  );

  return (
    <div className="structured-policy-editor">
      {props.includeProxies ? (
        <Tabs defaultValue={props.connectionEditor ? "connection" : "action"}>
          <TabsList variant="line" aria-label={t("access.policy.editor.resourceLabel")}>
            {props.connectionEditor ? (
              <TabsTrigger value="connection">
                {t("access.policy.editor.connectionsTitle")}
                {props.connectionInvalid ? <CircleAlert className="policy-tab-issue" aria-hidden /> : null}
              </TabsTrigger>
            ) : null}
            <TabsTrigger value="action">
              {t("access.policy.editor.actionsTab")}
              {actionIssue ? <CircleAlert className="policy-tab-issue" aria-hidden /> : null}
            </TabsTrigger>
            <TabsTrigger value="proxy">
              {t("access.policy.editor.proxiesTab")}
              {proxyIssue ? <CircleAlert className="policy-tab-issue" aria-hidden /> : null}
            </TabsTrigger>
          </TabsList>
          {props.connectionEditor ? <TabsContent value="connection">{props.connectionEditor}</TabsContent> : null}
          <TabsContent value="action">
            {actionEditor}
            {actionIssue ? <PolicyEditorError issue={actionIssue} /> : null}
          </TabsContent>
          <TabsContent value="proxy">
            <PolicyResourceEditor
              resource="proxy"
              draft={props.draft}
              providers={props.providers}
              proxyAccess={props.proxyAccess}
              onChange={props.onChange}
            />
            {proxyIssue ? <PolicyEditorError issue={proxyIssue} /> : null}
          </TabsContent>
        </Tabs>
      ) : (
        <>
          {actionEditor}
          {actionIssue ? <PolicyEditorError issue={actionIssue} /> : null}
        </>
      )}
    </div>
  );
}

function PolicyEditorError(props: { issue: ReturnType<typeof validatePolicyEditorDraft>[number] }): ReactNode {
  const t = useTranslate();
  return (
    <div className="policy-editor-error" role="alert">
      <CircleAlert size={15} />
      <span>{draftIssueLabel(props.issue, t)}</span>
    </div>
  );
}

interface PolicyResourceEditorProps {
  resource: PolicyResource;
  draft: PolicyEditorDraft;
  providers: ProviderDefinition[];
  proxyAccess?: "constraint" | "grant";
  onChange(draft: PolicyEditorDraft): void;
}

const destructiveOperationRules = ["@operation:destructive"];
const readOnlyOperationRules = ["@operation:write", "@operation:destructive"];

function PolicyResourceEditor(props: PolicyResourceEditorProps): ReactNode {
  const t = useTranslate();
  const fields = resourceFields(props.resource);
  const allowMode = props.draft[fields.allowMode];
  const grantsProxy = props.resource === "proxy" && props.proxyAccess === "grant";

  function setAllowMode(mode: AllowMode): void {
    props.onChange({
      ...props.draft,
      [fields.allowMode]: mode,
      rules: mode === "unrestricted" ? { ...props.draft.rules, [fields.allowed]: [] } : props.draft.rules,
    });
  }

  function setRules(field: keyof PolicyRules, values: string[]): void {
    props.onChange({
      ...props.draft,
      ...(grantsProxy && field === fields.allowed
        ? { [fields.allowMode]: values.length > 0 ? "restricted" : "unrestricted" }
        : {}),
      rules: { ...props.draft.rules, [field]: values },
    });
  }

  const blockedRules = props.draft.rules[fields.blocked] || [];
  const isFullAccess = allowMode === "unrestricted" && blockedRules.length === 0;
  const isNoDelete = allowMode === "unrestricted" && sameRules(blockedRules, destructiveOperationRules);
  const isReadOnly = allowMode === "unrestricted" && sameRules(blockedRules, readOnlyOperationRules);

  const applyFullAccess = () => {
    props.onChange({
      ...props.draft,
      [fields.allowMode]: "unrestricted",
      rules: { ...props.draft.rules, [fields.allowed]: [], [fields.blocked]: [] },
    });
  };

  const applyNoDelete = () => {
    props.onChange({
      ...props.draft,
      [fields.allowMode]: "unrestricted",
      rules: {
        ...props.draft.rules,
        [fields.allowed]: [],
        [fields.blocked]: destructiveOperationRules,
      },
    });
  };

  const applyReadOnly = () => {
    props.onChange({
      ...props.draft,
      [fields.allowMode]: "unrestricted",
      rules: {
        ...props.draft.rules,
        [fields.allowed]: [],
        [fields.blocked]: readOnlyOperationRules,
      },
    });
  };

  const toggleBlockedRule = (rule: string) => {
    const next = blockedRules.includes(rule) ? blockedRules.filter((r) => r !== rule) : [...blockedRules, rule];
    setRules(fields.blocked, next);
  };

  return (
    <div className="policy-resource-editor">
      {props.resource === "action" ? (
        <div className="space-y-1.5 mb-2">
          <div className="text-xs font-medium text-muted-foreground">{t("access.policy.editor.quickPresets")}</div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              className={`p-2 rounded border text-left text-xs transition-all ${isFullAccess ? "border-primary bg-primary/10 font-medium" : "hover:bg-accent/40"}`}
              onClick={applyFullAccess}
            >
              <div className="font-semibold text-foreground">🟢 {t("access.policy.editor.presetFull")}</div>
              <div className="text-[11px] text-muted-foreground truncate">
                {t("access.policy.editor.presetFullHint")}
              </div>
            </button>
            <button
              type="button"
              className={`p-2 rounded border text-left text-xs transition-all ${isNoDelete ? "border-amber-500 bg-amber-500/10 font-medium" : "hover:bg-accent/40"}`}
              onClick={applyNoDelete}
            >
              <div className="font-semibold text-amber-600 dark:text-amber-400">
                🛡️ {t("access.policy.editor.presetNoDelete")}
              </div>
              <div className="text-[11px] text-muted-foreground truncate">
                {t("access.policy.editor.presetNoDeleteHint")}
              </div>
            </button>
            <button
              type="button"
              className={`p-2 rounded border text-left text-xs transition-all ${isReadOnly ? "border-blue-500 bg-blue-500/10 font-medium" : "hover:bg-accent/40"}`}
              onClick={applyReadOnly}
            >
              <div className="font-semibold text-blue-600 dark:text-blue-400">
                🔒 {t("access.policy.editor.presetReadOnly")}
              </div>
              <div className="text-[11px] text-muted-foreground truncate">
                {t("access.policy.editor.presetReadOnlyHint")}
              </div>
            </button>
          </div>
        </div>
      ) : null}
      {!grantsProxy ? (
        <fieldset className="policy-allow-mode">
          <legend>{t("access.policy.editor.allowMode")}</legend>
          <label>
            <input
              type="radio"
              name={`${props.resource}-allow-mode`}
              value="unrestricted"
              checked={allowMode === "unrestricted"}
              onChange={() => setAllowMode("unrestricted")}
            />
            <span>
              <strong>{t("access.policy.editor.unrestricted")}</strong>
              <small>{t(`access.policy.editor.${props.resource}UnrestrictedHint`)}</small>
            </span>
          </label>
          <label>
            <input
              type="radio"
              name={`${props.resource}-allow-mode`}
              value="restricted"
              checked={allowMode === "restricted"}
              onChange={() => setAllowMode("restricted")}
            />
            <span>
              <strong>{t("access.policy.editor.restricted")}</strong>
              <small>{t(`access.policy.editor.${props.resource}RestrictedHint`)}</small>
            </span>
          </label>
        </fieldset>
      ) : null}

      {grantsProxy || allowMode === "restricted" ? (
        <RuleListEditor
          resource={props.resource}
          effect="allow"
          values={props.draft.rules[fields.allowed]}
          providers={props.providers}
          onChange={(values) => setRules(fields.allowed, values)}
        />
      ) : null}

      {!grantsProxy ? (
        <>
          {props.resource === "action" ? (
            <div className="flex items-center gap-1.5 flex-wrap my-1.5">
              <span className="text-xs text-muted-foreground">{t("access.policy.editor.quickChips")}:</span>
              {[
                { label: t("access.policy.editor.chipDelete"), rule: "*.delete*" },
                { label: t("access.policy.editor.chipRemove"), rule: "*.remove*" },
                { label: t("access.policy.editor.chipCreate"), rule: "*.create*" },
                { label: t("access.policy.editor.chipUpdate"), rule: "*.update*" },
              ].map((chip) => {
                const hasRule = blockedRules.includes(chip.rule);
                return (
                  <button
                    key={chip.rule}
                    type="button"
                    className={`text-[11px] px-2 py-0.5 rounded border transition-colors ${hasRule ? "bg-destructive/15 text-destructive border-destructive/40 font-medium" : "hover:bg-accent"}`}
                    onClick={() => toggleBlockedRule(chip.rule)}
                  >
                    {hasRule ? `✓ ${chip.label}` : `+ ${chip.label}`}
                  </button>
                );
              })}
            </div>
          ) : null}
          <RuleListEditor
            resource={props.resource}
            effect="block"
            values={props.draft.rules[fields.blocked]}
            providers={props.providers}
            onChange={(values) => setRules(fields.blocked, values)}
          />
        </>
      ) : null}

      <details className="policy-advanced-editor">
        <summary>{t("access.policy.editor.advanced")}</summary>
        <p>{t("access.policy.editor.advancedHint")}</p>
        <div className="policy-advanced-grid">
          <Label className="field">
            <span>{t("access.policy.editor.allowedRaw")}</span>
            <Textarea
              value={grantsProxy || allowMode === "restricted" ? props.draft.rules[fields.allowed].join("\n") : ""}
              placeholder={props.resource === "action" ? "github.*" : "github"}
              onChange={(event) => {
                const values = parsePolicyLines(event.target.value);
                props.onChange({
                  ...props.draft,
                  [fields.allowMode]: values.length > 0 ? "restricted" : "unrestricted",
                  rules: { ...props.draft.rules, [fields.allowed]: values },
                });
              }}
            />
          </Label>
          {!grantsProxy ? (
            <Label className="field">
              <span>{t("access.policy.editor.blockedRaw")}</span>
              <Textarea
                value={props.draft.rules[fields.blocked].join("\n")}
                placeholder={props.resource === "action" ? "github.delete_repository" : "*"}
                onChange={(event) => setRules(fields.blocked, parsePolicyLines(event.target.value))}
              />
            </Label>
          ) : null}
        </div>
      </details>
    </div>
  );
}

function sameRules(left: string[], right: readonly string[]): boolean {
  return left.length === right.length && right.every((rule) => left.includes(rule));
}

interface RuleListEditorProps {
  resource: PolicyResource;
  effect: "allow" | "block";
  values: string[];
  providers: ProviderDefinition[];
  onChange(values: string[]): void;
}

function RuleListEditor(props: RuleListEditorProps): ReactNode {
  const t = useTranslate();
  const listId = useId();
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const candidates = useMemo(
    () => policyRuleCandidates(props.providers, props.resource),
    [props.providers, props.resource],
  );
  const suggestions = useMemo(() => {
    return input.trim() ? filterPolicyRuleCandidates(candidates, input, 6) : [];
  }, [candidates, input]);

  function addRule(): boolean {
    const rule = input.trim();
    if (!rule) {
      setError(t("access.policy.editor.ruleRequired"));
      return false;
    }
    const issue = policyRuleIssue(rule, props.resource);
    if (issue) {
      setError(t(`access.policy.editor.${issue === "too_long" ? "ruleTooLong" : "ruleInvalid"}`));
      return false;
    }
    if (props.values.includes(rule)) {
      setError(t("access.policy.editor.ruleDuplicate"));
      return false;
    }
    if (props.values.length >= 128) {
      setError(t("access.policy.editor.tooManyRules"));
      return false;
    }
    props.onChange([...props.values, rule]);
    setInput("");
    setError(null);
    setSuggestionsOpen(false);
    return true;
  }

  return (
    <section className="policy-rule-section">
      <div className="policy-rule-heading">
        <div>
          <h4>{t(`access.policy.editor.${props.effect === "allow" ? "allowedList" : "blockedList"}`)}</h4>
          <p>
            {t(`access.policy.editor.${props.resource}${props.effect === "allow" ? "AllowedHint" : "BlockedHint"}`)}
          </p>
        </div>
        <span>{t("access.policy.editor.ruleCount", { count: props.values.length })}</span>
      </div>
      <div className="policy-rule-add">
        <label className="sr-only" htmlFor={`${listId}-input`}>
          {t(`access.policy.editor.${props.resource}${props.effect === "allow" ? "AllowedInput" : "BlockedInput"}`)}
        </label>
        <PolicySuggestionInput
          id={`${listId}-input`}
          value={input}
          suggestions={suggestions}
          invalid={Boolean(error)}
          open={suggestionsOpen}
          placeholder={t(
            `access.policy.editor.${props.resource}${props.effect === "allow" ? "AllowedInput" : "BlockedInput"}`,
          )}
          onChange={(value) => {
            setInput(value);
            setError(null);
          }}
          onOpenChange={setSuggestionsOpen}
          onSubmit={addRule}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={t("access.policy.editor.addRule")}
          onClick={(event) => {
            if (addRule()) {
              event.currentTarget.focus();
            }
          }}
        >
          <Plus size={16} />
        </Button>
      </div>
      {error ? <p className="policy-rule-error">{error}</p> : null}
      {props.values.length > 0 ? (
        <div className="policy-rule-list">
          {props.values.map((rule) => {
            const known = isKnownPolicyRule(rule, props.resource, props.providers);
            return (
              <div className="policy-rule-row" key={rule}>
                <code>{rule}</code>
                {!known ? <span className="policy-rule-unknown">{t("access.policy.editor.unknownRule")}</span> : null}
                <Badge tone={props.effect === "allow" ? "success" : "error"}>
                  {t(`access.policy.editor.${props.effect}`)}
                </Badge>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label={t("access.policy.editor.removeRule", { rule })}
                  onClick={() => props.onChange(props.values.filter((value) => value !== rule))}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="policy-rule-empty">{t("access.policy.editor.noRules")}</p>
      )}
    </section>
  );
}

function resourceFields(resource: PolicyResource): {
  allowed: "allowedActions" | "allowedProxies";
  blocked: "blockedActions" | "blockedProxies";
  allowMode: "actionAllowMode" | "proxyAllowMode";
} {
  return resource === "action"
    ? { allowed: "allowedActions", blocked: "blockedActions", allowMode: "actionAllowMode" }
    : { allowed: "allowedProxies", blocked: "blockedProxies", allowMode: "proxyAllowMode" };
}

function draftIssueLabel(
  issue: ReturnType<typeof validatePolicyEditorDraft>[number],
  t: NonNullable<ReturnType<typeof useTranslate>>,
): string {
  if (issue.code === "required") {
    return t(
      issue.field === "allowedActions"
        ? "access.policy.editor.actionAllowRequired"
        : "access.policy.editor.proxyAllowRequired",
    );
  }
  if (issue.code === "too_many") {
    return t("access.policy.editor.tooManyRules");
  }
  return t(issue.code === "too_long" ? "access.policy.editor.ruleTooLong" : "access.policy.editor.ruleInvalid");
}
