import type {
  ConnectionAccessLevel,
  ConnectionPermissionGrant,
  ConnectionRecord,
  ConnectionToolPolicy,
  PolicyRules,
  ProviderDefinition,
  RuntimePolicyState,
  RuntimeTokenCreation,
  RuntimeTokenSummary,
} from "./model";
import type { PolicyEditorDraft, PolicyEvaluation, PolicyResource } from "./policy";
import type { ReactNode, SubmitEvent } from "react";

import { useTranslate } from "@embra/i18n/react";
import { useClipboard } from "foxact/use-clipboard";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  CircleCheck,
  CircleX,
  Copy,
  KeyRound,
  Loader2,
  Pencil,
  Play,
  RotateCcw,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { apiDelete, apiPost, apiPut } from "./api";
import { ConnectionToolPolicyDialog } from "./connection-tool-policy-dialog";
import { connectionDiscoveredToolCount, formatDate } from "./model";
import {
  countAllowedActions,
  countAllowedProxies,
  createPolicyEditorDraft,
  evaluatePolicy,
  filterPolicyRuleCandidates,
  parsePolicyLines,
  policyEditorDraftEquals,
  policyLayers,
  policyRuleCandidates,
  policyRulesFromEditorDraft,
  validatePolicyEditorDraft,
} from "./policy";
import { PolicyEditor } from "./policy-editor";
import { PolicySuggestionInput } from "./policy-suggestion-input";
import { ProviderGroupSection } from "./provider-group-section";
import { Badge, EmptyState, FormStatus } from "./shared-ui";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface AccessPageProps {
  providers: ProviderDefinition[];
  connections: ConnectionRecord[];
  tokens: RuntimeTokenSummary[];
  policy: RuntimePolicyState;
  onRefresh(): void;
}

export interface ConnectionGrantDraft {
  mode: "unrestricted" | "restricted";
  ids: string[];
  accessById: Record<string, ConnectionAccessLevel>;
  toolPolicyById: Record<string, ConnectionToolPolicy>;
  allowProxyById: Record<string, boolean>;
}

export interface ConnectionGrantOption {
  id: string;
  service: string;
  name: string;
  displayName?: string;
  provider: string;
  toolCount?: number;
  isDefault?: boolean;
}

interface CreateTokenDialogProps {
  name: string;
  created: RuntimeTokenCreation | null;
  status: string | null;
  copied: boolean;
  draft: PolicyEditorDraft;
  connections: ConnectionGrantDraft;
  connectionOptions: ConnectionGrantOption[];
  providers: ProviderDefinition[];
  onNameChange(name: string): void;
  onDraftChange(draft: PolicyEditorDraft): void;
  onConnectionsChange(draft: ConnectionGrantDraft): void;
  onSubmit(event: SubmitEvent<HTMLFormElement>): Promise<void>;
  onCopy(token: string): void;
  onClose(): void;
}

export interface PolicyDraft {
  allowedActions: string;
  blockedActions: string;
  allowedProxies: string;
  blockedProxies: string;
}

export function createTokenDialogMode(created: RuntimeTokenCreation | null): "form" | "created" {
  return created ? "created" : "form";
}

export function AccessPage(props: AccessPageProps): ReactNode {
  const t = useTranslate();
  const [name, setName] = useState("");
  const [createDraft, setCreateDraft] = useState(() => createPolicyEditorDraft(emptyPolicyRules()));
  const [createConnections, setCreateConnections] = useState(() => createConnectionGrantDraft());
  const [created, setCreated] = useState<RuntimeTokenCreation | null>(null);
  const [editingToken, setEditingToken] = useState<RuntimeTokenSummary | null>(null);
  const [editTokenDraft, setEditTokenDraft] = useState(() => createPolicyEditorDraft(emptyPolicyRules()));
  const [editConnections, setEditConnections] = useState(() => createConnectionGrantDraft());
  const [policy, setPolicy] = useState(props.policy);
  const [runtimeDraft, setRuntimeDraft] = useState(() => createPolicyEditorDraft(props.policy.runtime));
  const [policyExpanded, setPolicyExpanded] = useState(true);
  const [runtimeEditing, setRuntimeEditing] = useState(false);
  const [runtimeSaving, setRuntimeSaving] = useState(false);
  const [confirmRuntimeSave, setConfirmRuntimeSave] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [runtimeStatus, setRuntimeStatus] = useState<string | null>(null);
  const [tokenStatus, setTokenStatus] = useState<string | null>(null);
  const previousPolicy = useRef(props.policy);
  const { copy, copied } = useClipboard();
  const savedRuntimeDraft = useMemo(() => createPolicyEditorDraft(policy.runtime), [policy.runtime]);
  const runtimeDirty = !policyEditorDraftEquals(runtimeDraft, savedRuntimeDraft);
  const runtimeRules = useMemo(() => policyRulesFromEditorDraft(runtimeDraft), [runtimeDraft]);
  const runtimeDraftState: RuntimePolicyState = useMemo(
    () => ({ ...policy, runtime: runtimeRules }),
    [policy, runtimeRules],
  );
  const runtimeIssues = validatePolicyEditorDraft(runtimeDraft, true);
  const connectionOptions = useMemo(
    () => connectionGrantOptions(props.connections, props.providers),
    [props.connections, props.providers],
  );
  const connectionLabels = useMemo(
    () => new Map(connectionOptions.map((option) => [option.id, `${option.provider} · ${option.name}`])),
    [connectionOptions],
  );
  const runtimeRisk = useMemo(
    () => (runtimeEditing ? policyRisk(runtimeDraftState, props.providers) : null),
    [runtimeDraftState, props.providers, runtimeEditing],
  );

  useEffect(() => {
    if (props.policy === previousPolicy.current) {
      return;
    }
    previousPolicy.current = props.policy;
    if (!runtimeEditing) {
      setPolicy(props.policy);
      setRuntimeDraft(createPolicyEditorDraft(props.policy.runtime));
    }
  }, [props.policy, runtimeEditing]);

  async function submitToken(event: SubmitEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setTokenStatus(t("access.creating"));
    setCreated(null);
    const rules = policyRulesFromEditorDraft(createDraft);
    try {
      const result = await apiPost<RuntimeTokenCreation>("/api/runtime-tokens", {
        name,
        ...runtimeTokenPolicyBody(rules, createConnections, connectionOptions),
      });
      setCreated(result);
      setName("");
      setCreateDraft(createPolicyEditorDraft(emptyPolicyRules()));
      setCreateConnections(createConnectionGrantDraft());
      setTokenStatus(t("access.created"));
      props.onRefresh();
    } catch (error) {
      setTokenStatus(error instanceof Error ? error.message : t("access.createFailed"));
    }
  }

  async function persistRuntimePolicy(): Promise<void> {
    setRuntimeSaving(true);
    setRuntimeStatus(t("access.policy.saving"));
    try {
      const updated = await apiPut<RuntimePolicyState>("/api/runtime-policy", runtimeRules);
      setPolicy(updated);
      setRuntimeDraft(createPolicyEditorDraft(updated.runtime));
      setRuntimeStatus(t("access.policy.saved"));
      setRuntimeEditing(false);
      props.onRefresh();
    } catch (error) {
      setRuntimeStatus(error instanceof Error ? error.message : t("access.policy.saveFailed"));
    } finally {
      setRuntimeSaving(false);
    }
  }

  function requestRuntimeSave(): void {
    if (runtimeIssues.length > 0 || !runtimeDirty) {
      return;
    }
    if (runtimeRisk) {
      setConfirmRuntimeSave(true);
      return;
    }
    void persistRuntimePolicy();
  }

  async function saveTokenPolicy(event: SubmitEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!editingToken) {
      return;
    }
    const rules = policyRulesFromEditorDraft(editTokenDraft);
    setTokenStatus(t("access.policy.saving"));
    try {
      await apiPut(
        `/api/runtime-tokens/${editingToken.id}`,
        runtimeTokenPolicyBody(rules, editConnections, connectionOptions),
      );
      setEditingToken(null);
      setTokenStatus(t("access.policy.saved"));
      props.onRefresh();
    } catch (error) {
      setTokenStatus(error instanceof Error ? error.message : t("access.policy.saveFailed"));
    }
  }

  async function revoke(id: string): Promise<void> {
    setTokenStatus(t("access.revoking"));
    try {
      await apiDelete(`/api/runtime-tokens/${id}`);
      setTokenStatus(t("access.revoked"));
      props.onRefresh();
    } catch (error) {
      setTokenStatus(error instanceof Error ? error.message : t("access.revokeFailed"));
    }
  }

  function openCreate(): void {
    setName("");
    setCreateDraft(createPolicyEditorDraft(emptyPolicyRules()));
    setCreateConnections(createRecommendedConnectionGrantDraft(connectionOptions));
    setCreated(null);
    setTokenStatus(null);
    setCreateOpen(true);
  }

  function closeCreate(): void {
    setCreateOpen(false);
    setName("");
    setCreateDraft(createPolicyEditorDraft(emptyPolicyRules()));
    setCreateConnections(createConnectionGrantDraft());
    setCreated(null);
    setTokenStatus(null);
  }

  function openPolicyEditor(token: RuntimeTokenSummary): void {
    const connections = createConnectionGrantDraft(token.allowedConnections ?? [], token.connectionPermissions);
    const generatedActions = connectionScopedAllowedActions([], connections, connectionOptions);
    setEditingToken(token);
    setEditTokenDraft(
      createPolicyEditorDraft({
        allowedActions: sameStringSet(token.allowedActions, generatedActions) ? [] : token.allowedActions,
        blockedActions: token.blockedActions,
        allowedProxies: [],
        blockedProxies: [],
      }),
    );
    setEditConnections(connections);
    setTokenStatus(null);
  }

  function startRuntimeEditing(): void {
    setRuntimeDraft(createPolicyEditorDraft(policy.runtime));
    setRuntimeStatus(null);
    setRuntimeEditing(true);
  }

  function discardRuntimeEditing(): void {
    setConfirmRuntimeSave(false);
    setPolicy(props.policy);
    setRuntimeDraft(createPolicyEditorDraft(props.policy.runtime));
    setRuntimeStatus(null);
    setRuntimeEditing(false);
  }

  return (
    <section className="detail-panel access-panel">
      <details
        className="access-section-disclosure"
        open={policyExpanded}
        onToggle={(event) => setPolicyExpanded(event.currentTarget.open)}
      >
        <summary className="access-section-heading">
          <div>
            <h2>{t("access.policy.title")}</h2>
            <p>{t("access.policy.description")}</p>
          </div>
          <ChevronDown size={17} />
        </summary>

        <div className="access-section-content">
          <PolicyBaseline policy={policy} providers={props.providers} />
          <PolicyTester policy={policy} providers={props.providers} tokens={props.tokens} />
          <div className="access-settings-list">
            <PolicyLayerDisclosure rules={policy.deployment} />
            <RuntimePolicySummary policy={policy} onEdit={startRuntimeEditing} />
          </div>
          {!runtimeEditing && runtimeStatus ? <FormStatus message={runtimeStatus} /> : null}
        </div>
      </details>

      <div className="access-section-heading">
        <div>
          <h2>{t("access.title")}</h2>
          <p>{t("access.description")}</p>
        </div>

        <Button variant="outline" size="sm" type="button" onClick={openCreate}>
          <KeyRound size={16} />
          {t("access.createToken")}
        </Button>
      </div>

      {!createOpen && tokenStatus ? <FormStatus message={tokenStatus} /> : null}

      <section className="table-panel">
        {props.tokens.length === 0 ? (
          <EmptyState
            icon={<KeyRound size={20} />}
            title={t("access.noTokensTitle")}
            description={t("access.noTokensDescription")}
            density="compact"
          />
        ) : (
          <Table className="token-table">
            <TableHeader>
              <TableRow>
                <TableHead>{t("access.table.name")}</TableHead>
                <TableHead>{t("access.table.status")}</TableHead>
                <TableHead>{t("access.table.policy")}</TableHead>
                <TableHead>{t("access.table.created")}</TableHead>
                <TableHead>{t("access.table.lastUsed")}</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {props.tokens.map((token) => {
                const policySummary = tokenPolicySummary(token, t);
                const connectionSummary = tokenConnectionSummary(token, t, connectionLabels);
                return (
                  <TableRow key={token.id}>
                    <TableCell>
                      <strong>{token.name}</strong>
                    </TableCell>
                    <TableCell>
                      <Badge tone="success">{t("common.active")}</Badge>
                    </TableCell>
                    <TableCell className="token-policy-cell">
                      <div className="token-policy-summary">
                        <span title={policySummary}>{policySummary}</span>
                        <span className="token-policy-connections" title={connectionSummary.title}>
                          {connectionSummary.preview}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(token.createdAt)}</TableCell>
                    <TableCell>{token.lastUsedAt ? formatDate(token.lastUsedAt) : ""}</TableCell>
                    <TableCell className="table-actions">
                      <div className="token-table-actions">
                        <Button variant="outline" size="sm" onClick={() => openPolicyEditor(token)}>
                          <Pencil size={15} />
                          {t("access.policy.edit")}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => void revoke(token.id)}>
                          <Trash2 size={15} />
                          {t("access.revoke")}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </section>

      {runtimeEditing ? (
        <RuntimePolicyDialog
          draft={runtimeDraft}
          draftState={runtimeDraftState}
          providers={props.providers}
          dirty={runtimeDirty}
          risk={runtimeRisk}
          saving={runtimeSaving}
          status={runtimeStatus}
          onDraftChange={setRuntimeDraft}
          onDiscard={discardRuntimeEditing}
          onSave={requestRuntimeSave}
        />
      ) : null}

      {createOpen ? (
        <CreateTokenDialog
          name={name}
          created={created}
          status={tokenStatus}
          copied={copied}
          draft={createDraft}
          connections={createConnections}
          connectionOptions={connectionOptions}
          providers={props.providers}
          onNameChange={setName}
          onDraftChange={setCreateDraft}
          onConnectionsChange={setCreateConnections}
          onSubmit={submitToken}
          onCopy={(token) => void copy(token)}
          onClose={closeCreate}
        />
      ) : null}
      {editingToken ? (
        <EditTokenPolicyDialog
          token={editingToken}
          draft={editTokenDraft}
          connections={editConnections}
          connectionOptions={connectionOptions}
          providers={props.providers}
          status={tokenStatus}
          onDraftChange={setEditTokenDraft}
          onConnectionsChange={setEditConnections}
          onSubmit={saveTokenPolicy}
          onClose={() => setEditingToken(null)}
        />
      ) : null}
      <Dialog open={confirmRuntimeSave} onOpenChange={setConfirmRuntimeSave}>
        <DialogContent className="max-w-[min(480px,calc(100vw-2rem))]">
          <DialogHeader>
            <DialogTitle>{t("access.policy.confirm.title")}</DialogTitle>
            <DialogDescription>{t(`access.policy.confirm.${runtimeRisk ?? "actions"}`)}</DialogDescription>
          </DialogHeader>
          <div className="button-row">
            <Button
              variant="destructive"
              onClick={() => {
                setConfirmRuntimeSave(false);
                void persistRuntimePolicy();
              }}
            >
              {t("access.policy.confirm.save")}
            </Button>
            <Button variant="outline" onClick={() => setConfirmRuntimeSave(false)}>
              {t("access.policy.confirm.keepEditing")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function PolicyBaseline(props: { policy: RuntimePolicyState; providers: ProviderDefinition[] }): ReactNode {
  const t = useTranslate();
  const titleId = useId();
  const { actions, proxies } = useMemo(() => {
    const layers = policyLayers(props.policy);
    return {
      actions: countAllowedActions(props.providers, layers),
      proxies: countAllowedProxies(props.providers, layers),
    };
  }, [props.policy, props.providers]);
  const deploymentRules = configuredRuleCount(props.policy.deployment);
  const runtimeRules = configuredRuleCount(props.policy.runtime);
  const actionsBlocked = actions.total > 0 && actions.allowed === 0;
  const proxiesBlocked = proxies.total > 0 && proxies.allowed === 0;
  const risk =
    actionsBlocked && proxiesBlocked ? "all" : actionsBlocked ? "actions" : proxiesBlocked ? "proxies" : null;

  return (
    <section className="policy-baseline" aria-labelledby={titleId}>
      <div className="policy-section-title">
        <h3 id={titleId}>{t("access.policy.baseline.title")}</h3>
        <Badge tone={risk ? "error" : "success"}>
          {risk ? <AlertTriangle size={13} /> : <CircleCheck size={13} />}
          {t(risk ? `access.policy.baseline.${risk}Blocked` : "access.policy.baseline.healthy")}
        </Badge>
      </div>
      <div className="policy-baseline-grid">
        <div>
          <span>{t("access.policy.baseline.actions")}</span>
          <strong>{t("access.policy.baseline.allowedCount", actions)}</strong>
          <small>{t("access.policy.baseline.catalogHint")}</small>
        </div>
        <div>
          <span>{t("access.policy.baseline.proxies")}</span>
          <strong>{t("access.policy.baseline.allowedCount", proxies)}</strong>
          <small>{t("access.policy.baseline.providersHint")}</small>
        </div>
        <div>
          <span>{t("access.policy.baseline.layers")}</span>
          <strong>
            {t("access.policy.baseline.layerCount", { deployment: deploymentRules, runtime: runtimeRules })}
          </strong>
          <small>{t("access.policy.baseline.blockPriority")}</small>
        </div>
      </div>
    </section>
  );
}

function PolicyTester(props: {
  policy: RuntimePolicyState;
  providers: ProviderDefinition[];
  tokens: RuntimeTokenSummary[];
  compact?: boolean;
}): ReactNode {
  const t = useTranslate();
  const [resource, setResource] = useState<PolicyResource>("action");
  const [tokenId, setTokenId] = useState("none");
  const candidates = useMemo(
    () =>
      policyRuleCandidates(props.providers, resource).filter(
        (candidate) => candidate !== "*" && !candidate.endsWith(".*"),
      ),
    [props.providers, resource],
  );
  const [input, setInput] = useState("");
  const [testedValue, setTestedValue] = useState("");
  const suggestions = useMemo(
    () => (input.trim() ? filterPolicyRuleCandidates(candidates, input, 6) : []),
    [candidates, input],
  );
  const token = props.tokens.find((item) => item.id === tokenId);
  const layers = policyLayers(props.policy, token);
  const testedAction =
    resource === "action"
      ? props.providers.flatMap((provider) => provider.actions).find((action) => action.id === testedValue)
      : undefined;
  const result = testedValue ? evaluatePolicy(testedValue, resource, layers, testedAction?.operationType) : null;
  const listId = `policy-tester-${props.compact ? "compact" : "default"}-${resource}`;

  function changeResource(next: PolicyResource): void {
    setResource(next);
    setInput("");
    setTestedValue("");
  }

  return (
    <section className={props.compact ? "policy-tester compact" : "policy-tester"}>
      <div className="policy-section-title">
        <h3>{t("access.policy.tester.title")}</h3>
        {!props.compact ? <p>{t("access.policy.tester.description")}</p> : null}
      </div>
      <form
        className="policy-tester-form"
        onSubmit={(event) => {
          event.preventDefault();
          setTestedValue(input.trim());
        }}
      >
        <ToggleGroup
          className="policy-resource-control bg-muted p-[3px]"
          type="single"
          value={resource}
          spacing={0}
          aria-label={t("access.policy.tester.resourceLabel")}
          onValueChange={(value) => (value ? changeResource(value as PolicyResource) : undefined)}
        >
          <ToggleGroupItem
            value="action"
            className="h-[30px] rounded-md px-3 text-sm data-[state=on]:bg-background data-[state=on]:shadow-console-sm"
          >
            {t("access.policy.tester.action")}
          </ToggleGroupItem>
          <ToggleGroupItem
            value="proxy"
            className="h-[30px] rounded-md px-3 text-sm data-[state=on]:bg-background data-[state=on]:shadow-console-sm"
          >
            {t("access.policy.tester.proxy")}
          </ToggleGroupItem>
        </ToggleGroup>
        {props.tokens.length > 0 ? (
          <Select value={tokenId} onValueChange={setTokenId}>
            <SelectTrigger className="policy-token-select-trigger" aria-label={t("access.policy.tester.tokenLabel")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="policy-token-select-content" position="popper" align="start" sideOffset={4}>
              <SelectGroup>
                <SelectItem value="none">{t("access.policy.tester.noToken")}</SelectItem>
                {props.tokens.map((item) => (
                  <SelectItem value={item.id} key={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        ) : null}
        <Label className="sr-only" htmlFor={`${listId}-input`}>
          {t("access.policy.tester.inputLabel")}
        </Label>
        <PolicySuggestionInput
          id={`${listId}-input`}
          value={input}
          suggestions={suggestions}
          placeholder={t(`access.policy.tester.${resource}Placeholder`)}
          onChange={setInput}
        />
        <Button type="submit" disabled={!input.trim()}>
          <Play size={15} />
          {t("access.policy.tester.test")}
        </Button>
      </form>
      {result ? <PolicyDecisionTrace value={testedValue} result={result} /> : null}
    </section>
  );
}

function PolicyDecisionTrace(props: { value: string; result: PolicyEvaluation }): ReactNode {
  const t = useTranslate();
  return (
    <details className="policy-decision-trace">
      <summary>
        <Badge tone={props.result.allowed ? "success" : "error"}>
          {props.result.allowed ? <CircleCheck size={13} /> : <CircleX size={13} />}
          {t(props.result.allowed ? "access.policy.tester.allowed" : "access.policy.tester.blocked")}
        </Badge>
        <code>{props.value}</code>
        <span>{t("access.policy.tester.trace")}</span>
        <ChevronDown size={15} />
      </summary>
      <ol>
        {props.result.trace.map((check) => (
          <li key={check.source}>
            <strong>{t(`access.policy.sources.${check.source}`)}</strong>
            <span>{t(`access.policy.outcomes.${check.outcome}`)}</span>
            {check.rule ? <code>{check.rule}</code> : null}
          </li>
        ))}
      </ol>
    </details>
  );
}

function PolicyLayerDisclosure(props: { rules: PolicyRules }): ReactNode {
  const t = useTranslate();
  return (
    <details className="policy-layer-disclosure">
      <summary>
        <ShieldCheck size={16} />
        <div className="access-setting-copy">
          <strong>{t("access.policy.deploymentSummary.title")}</strong>
          <span>{policyLayerSummary(props.rules, t)}</span>
        </div>
        <ChevronDown size={15} />
      </summary>
      <PolicyRuleReadout rules={props.rules} />
    </details>
  );
}

function RuntimePolicySummary(props: { policy: RuntimePolicyState; onEdit(): void }): ReactNode {
  const t = useTranslate();
  return (
    <section className="runtime-policy-summary">
      <SlidersHorizontal size={16} />
      <div className="access-setting-copy">
        <strong>{t("access.policy.runtimeSummary.title")}</strong>
        <span>
          {policyLayerSummary(props.policy.runtime, t)}
          {props.policy.updatedAt
            ? ` · ${t("access.policy.runtimeSummary.updated", { date: formatDate(props.policy.updatedAt) })}`
            : ""}
        </span>
      </div>
      <Button variant="outline" size="sm" onClick={props.onEdit}>
        <Pencil size={15} />
        {t("access.policy.runtimeSummary.edit")}
      </Button>
    </section>
  );
}

interface RuntimePolicyDialogProps {
  draft: PolicyEditorDraft;
  draftState: RuntimePolicyState;
  providers: ProviderDefinition[];
  dirty: boolean;
  risk: "actions" | "proxies" | "all" | null;
  saving: boolean;
  status: string | null;
  onDraftChange(draft: PolicyEditorDraft): void;
  onDiscard(): void;
  onSave(): void;
}

function RuntimePolicyDialog(props: RuntimePolicyDialogProps): ReactNode {
  const t = useTranslate();
  return (
    <Dialog open onOpenChange={(open) => (!open ? props.onDiscard() : undefined)}>
      <DialogContent className="runtime-policy-dialog max-h-[calc(100svh-2rem)] max-w-[min(1080px,calc(100vw-2rem))] overflow-y-auto sm:max-w-[min(1080px,calc(100vw-2rem))]">
        <div className="runtime-policy-dialog-heading">
          <DialogHeader>
            <DialogTitle>{t("access.policy.editor.title")}</DialogTitle>
            <DialogDescription>{t("access.policy.editor.description")}</DialogDescription>
          </DialogHeader>
          <Badge tone={props.dirty ? "warning" : undefined}>
            {t(props.dirty ? "access.policy.editor.unsaved" : "access.policy.editor.noChanges")}
          </Badge>
        </div>
        <RuntimePolicyEditor {...props} />
      </DialogContent>
    </Dialog>
  );
}

function RuntimePolicyEditor(props: RuntimePolicyDialogProps): ReactNode {
  const t = useTranslate();
  const issues = validatePolicyEditorDraft(props.draft, true);

  return (
    <section className="runtime-policy-editor">
      <div className="runtime-policy-editor-grid">
        <PolicyEditor draft={props.draft} providers={props.providers} includeProxies onChange={props.onDraftChange} />
        <aside className="policy-impact-panel" id="runtime-policy-impact">
          <h3>{t("access.policy.impact.title")}</h3>
          <p>{t("access.policy.impact.description")}</p>
          <PolicyBaseline policy={props.draftState} providers={props.providers} />
          <PolicyTester policy={props.draftState} providers={props.providers} tokens={[]} compact />
          {props.risk ? (
            <div className="policy-risk-warning" role="alert">
              <AlertTriangle size={16} />
              <span>{t(`access.policy.impact.${props.risk}Blocked`)}</span>
            </div>
          ) : null}
        </aside>
      </div>
      <div className="runtime-policy-actions">
        <span>{t(props.dirty ? "access.policy.editor.unsaved" : "access.policy.editor.noChanges")}</span>
        <div className="button-row">
          <Button type="button" variant="outline" onClick={props.onDiscard}>
            <RotateCcw size={15} />
            {t("access.policy.editor.discard")}
          </Button>
          <Button type="button" disabled={!props.dirty || issues.length > 0 || props.saving} onClick={props.onSave}>
            {props.saving ? <Loader2 className="spin" size={15} /> : <Save size={15} />}
            {t("access.policy.save")}
          </Button>
        </div>
      </div>
      {props.status ? <FormStatus message={props.status} /> : null}
    </section>
  );
}

function PolicyRuleReadout(props: { rules: PolicyRules }): ReactNode {
  const t = useTranslate();
  const fields: Array<[keyof PolicyRules, string]> = [
    ["allowedActions", t("access.policy.allowedActions")],
    ["blockedActions", t("access.policy.blockedActions")],
    ["allowedProxies", t("access.policy.allowedProxies")],
    ["blockedProxies", t("access.policy.blockedProxies")],
  ];
  return (
    <div className="policy-rule-readout">
      {fields.map(([field, label]) => (
        <div key={field}>
          <strong>{label}</strong>
          {props.rules[field].length > 0 ? (
            <div>
              {props.rules[field].map((rule) => (
                <code key={rule}>{rule}</code>
              ))}
            </div>
          ) : (
            <span>{t("access.policy.deploymentSummary.none")}</span>
          )}
        </div>
      ))}
    </div>
  );
}

function CreateTokenDialog(props: CreateTokenDialogProps): ReactNode {
  const t = useTranslate();
  const mode = createTokenDialogMode(props.created);
  const created = mode === "created" ? props.created : null;
  const issues = validatePolicyEditorDraft(props.draft, false);
  const connectionIssue = connectionGrantIssue(props.connections);

  return (
    <Dialog open onOpenChange={(open) => (!open ? props.onClose() : undefined)}>
      <DialogContent
        className="token-dialog policy-token-dialog max-w-[min(760px,calc(100vw-2rem))] gap-0 overflow-hidden p-0 sm:max-w-[min(760px,calc(100vw-2rem))]"
        showCloseButton={false}
      >
        <DialogHeader className="token-dialog-header">
          <div>
            <DialogTitle>{mode === "created" ? t("access.newToken") : t("access.createToken")}</DialogTitle>
            <DialogDescription>
              {mode === "created" ? t("access.tokenShownOnce") : t("access.createTokenDescription")}
            </DialogDescription>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={props.onClose} aria-label={t("access.closeCreateToken")}>
            <X size={16} />
          </Button>
        </DialogHeader>
        <div className="token-dialog-body">
          {created ? (
            <>
              <section className="example-card token-result">
                <div className="tab-row">
                  <strong>{t("access.newToken")}</strong>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => props.onCopy(created.token)}
                    aria-label={props.copied ? t("access.copiedRuntimeToken") : t("access.copyRuntimeToken")}
                  >
                    {props.copied ? <Check size={15} /> : <Copy size={15} />}
                    {props.copied ? t("access.copiedToken") : t("access.copyToken")}
                  </Button>
                </div>
                <pre>{created.token}</pre>
              </section>
              <FormStatus message={t("access.tokenShownOnce")} />
              <div className="button-row">
                <Button variant="outline" type="button" onClick={props.onClose}>
                  {t("common.close")}
                </Button>
              </div>
            </>
          ) : (
            <form className="token-dialog-form" onSubmit={(event) => void props.onSubmit(event)}>
              <Label className="field">
                <span>{t("access.name")}</span>
                <Input
                  value={props.name}
                  onChange={(event) => props.onNameChange(event.target.value)}
                  placeholder={t("access.namePlaceholder")}
                />
              </Label>
              <TokenPermissionEditor
                draft={props.draft}
                providers={props.providers}
                connections={props.connections}
                connectionOptions={props.connectionOptions}
                onDraftChange={props.onDraftChange}
                onConnectionsChange={props.onConnectionsChange}
              />
              {props.status ? <FormStatus message={props.status} /> : null}
              <div className="token-dialog-actions">
                <div className="button-row">
                  <Button variant="outline" type="button" onClick={props.onClose}>
                    {t("common.close")}
                  </Button>
                  <Button type="submit" disabled={!props.name.trim() || issues.length > 0 || connectionIssue != null}>
                    <KeyRound size={16} />
                    {t("access.createToken")}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface EditTokenPolicyDialogProps {
  token: RuntimeTokenSummary;
  draft: PolicyEditorDraft;
  connections: ConnectionGrantDraft;
  connectionOptions: ConnectionGrantOption[];
  providers: ProviderDefinition[];
  status: string | null;
  onDraftChange(draft: PolicyEditorDraft): void;
  onConnectionsChange(draft: ConnectionGrantDraft): void;
  onSubmit(event: SubmitEvent<HTMLFormElement>): Promise<void>;
  onClose(): void;
}

function EditTokenPolicyDialog(props: EditTokenPolicyDialogProps): ReactNode {
  const t = useTranslate();
  const issues = validatePolicyEditorDraft(props.draft, false);
  const connectionIssue = connectionGrantIssue(props.connections);
  return (
    <Dialog open onOpenChange={(open) => (!open ? props.onClose() : undefined)}>
      <DialogContent
        className="token-dialog policy-token-dialog max-w-[min(760px,calc(100vw-2rem))] gap-0 overflow-hidden p-0 sm:max-w-[min(760px,calc(100vw-2rem))]"
        showCloseButton={false}
      >
        <DialogHeader className="token-dialog-header">
          <div>
            <DialogTitle>{t("access.policy.editToken")}</DialogTitle>
            <DialogDescription>{props.token.name}</DialogDescription>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={props.onClose} aria-label={t("common.close")}>
            <X size={16} />
          </Button>
        </DialogHeader>
        <div className="token-dialog-body">
          <form className="token-dialog-form" onSubmit={(event) => void props.onSubmit(event)}>
            <TokenPermissionEditor
              draft={props.draft}
              providers={props.providers}
              connections={props.connections}
              connectionOptions={props.connectionOptions}
              onDraftChange={props.onDraftChange}
              onConnectionsChange={props.onConnectionsChange}
            />
            {props.status ? <FormStatus message={props.status} /> : null}
            <div className="token-dialog-actions">
              <div className="button-row">
                <Button variant="outline" type="button" onClick={props.onClose}>
                  {t("common.close")}
                </Button>
                <Button type="submit" disabled={issues.length > 0 || connectionIssue != null}>
                  <Save size={16} />
                  {t("access.policy.save")}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface TokenPermissionEditorProps {
  draft: PolicyEditorDraft;
  providers: ProviderDefinition[];
  connections: ConnectionGrantDraft;
  connectionOptions: ConnectionGrantOption[];
  onDraftChange(draft: PolicyEditorDraft): void;
  onConnectionsChange(draft: ConnectionGrantDraft): void;
}

export function TokenPermissionEditor(props: TokenPermissionEditorProps): ReactNode {
  const t = useTranslate();
  const customRuleCount = props.draft.rules.allowedActions.length + props.draft.rules.blockedActions.length;
  return (
    <div className="token-permission-editor">
      <section className="token-permission-primary">
        <div className="token-permission-heading">
          <div>
            <h3>{t("access.policy.tools.connectionPermissions")}</h3>
            <p>{t("access.policy.tools.connectionPermissionsHint")}</p>
          </div>
          <Badge>{t("access.policy.editor.connectionCount", { count: props.connections.ids.length })}</Badge>
        </div>
        <ConnectionGrantEditor
          draft={props.connections}
          options={props.connectionOptions}
          onChange={props.onConnectionsChange}
        />
      </section>

      <details className="token-permission-advanced" open={customRuleCount > 0 || undefined}>
        <summary>
          <span>
            <strong>{t("access.policy.tools.advancedRules")}</strong>
            <small>{t("access.policy.tools.advancedRulesHint")}</small>
          </span>
          {customRuleCount > 0 ? (
            <Badge>{t("access.policy.tools.customRuleCount", { count: customRuleCount })}</Badge>
          ) : null}
        </summary>
        <div className="token-permission-advanced-body">
          <PolicyEditor
            draft={props.draft}
            providers={props.providers}
            includeProxies={false}
            showActionPresets={false}
            onChange={props.onDraftChange}
          />
        </div>
      </details>
    </div>
  );
}

export function policyDraftFromRules(rules: PolicyRules): PolicyDraft {
  return {
    allowedActions: rules.allowedActions.join("\n"),
    blockedActions: rules.blockedActions.join("\n"),
    allowedProxies: rules.allowedProxies.join("\n"),
    blockedProxies: rules.blockedProxies.join("\n"),
  };
}

export function policyRulesFromDraft(draft: PolicyDraft): PolicyRules {
  return {
    allowedActions: parsePolicyLines(draft.allowedActions),
    blockedActions: parsePolicyLines(draft.blockedActions),
    allowedProxies: parsePolicyLines(draft.allowedProxies),
    blockedProxies: parsePolicyLines(draft.blockedProxies),
  };
}

function tokenPolicySummary(token: RuntimeTokenSummary, t: NonNullable<ReturnType<typeof useTranslate>>): string {
  return t("access.policy.tokenSummary", {
    allowed: token.allowedActions.length,
    blocked: token.blockedActions.length,
    proxies: token.allowedProxies.length,
  });
}

function tokenConnectionSummary(
  token: RuntimeTokenSummary,
  t: NonNullable<ReturnType<typeof useTranslate>>,
  connectionLabels: Map<string, string>,
): { preview: string; title: string } {
  const allowedConnections = token.allowedConnections ?? [];
  if (allowedConnections.length === 0) {
    const unrestricted = t("access.policy.connectionsUnrestricted");
    return { preview: unrestricted, title: unrestricted };
  }

  const labels = allowedConnections.map((id) => connectionLabels.get(id) ?? id);
  const permissionById = new Map(
    (token.connectionPermissions ?? []).map((grant) => [grant.connectionId, grant.access]),
  );
  const labelsWithAccess = allowedConnections.map((id, index) => {
    const access = permissionById.get(id);
    return access ? `${labels[index]} (${t(`access.policy.editor.access${capitalize(access)}`)})` : labels[index];
  });
  const remaining = labels.length - 2;
  return {
    preview: t("access.policy.connectionsRestricted", {
      names: `${labels.slice(0, 2).join(", ")}${remaining > 0 ? ` +${remaining}` : ""}`,
    }),
    title: labelsWithAccess.join(", "),
  };
}

function capitalize(value: string): string {
  return `${value.slice(0, 1).toUpperCase()}${value.slice(1)}`;
}

function policyLayerSummary(rules: PolicyRules, t: NonNullable<ReturnType<typeof useTranslate>>): string {
  const action = resourcePolicySummary(rules.allowedActions, rules.blockedActions, t);
  const proxy = resourcePolicySummary(rules.allowedProxies, rules.blockedProxies, t);
  return t("access.policy.layerSummary", { action, proxy });
}

function resourcePolicySummary(
  allowed: string[],
  blocked: string[],
  t: NonNullable<ReturnType<typeof useTranslate>>,
): string {
  const allowSummary =
    allowed.length === 0
      ? t("access.policy.summary.unrestricted")
      : t("access.policy.summary.restricted", { count: allowed.length });
  return blocked.length === 0
    ? allowSummary
    : t("access.policy.summary.withBlocked", { allow: allowSummary, count: blocked.length });
}

function configuredRuleCount(rules: PolicyRules): number {
  return Object.values(rules).reduce((count, values) => count + values.length, 0);
}

function policyRisk(policy: RuntimePolicyState, providers: ProviderDefinition[]): "actions" | "proxies" | "all" | null {
  const layers = policyLayers(policy);
  const actions = countAllowedActions(providers, layers);
  const proxies = countAllowedProxies(providers, layers);
  const actionsBlocked = actions.total > 0 && actions.allowed === 0;
  const proxiesBlocked = proxies.total > 0 && proxies.allowed === 0;
  return actionsBlocked && proxiesBlocked ? "all" : actionsBlocked ? "actions" : proxiesBlocked ? "proxies" : null;
}

function emptyPolicyRules(): PolicyRules {
  return { allowedActions: [], blockedActions: [], allowedProxies: [], blockedProxies: [] };
}

const defaultConnectionName = "default";
const connectionListMaxItems = 128;

export function createConnectionGrantDraft(
  ids: string[] = [],
  permissions: ConnectionPermissionGrant[] = [],
): ConnectionGrantDraft {
  const permissionById = new Map(permissions.map((grant) => [grant.connectionId, grant]));
  const effectiveIds = ids.length > 0 ? ids : permissions.map((grant) => grant.connectionId);
  return {
    mode: effectiveIds.length > 0 ? "restricted" : "unrestricted",
    ids: [...effectiveIds],
    accessById: Object.fromEntries(effectiveIds.map((id) => [id, permissionById.get(id)?.access ?? "full"])),
    toolPolicyById: Object.fromEntries(
      effectiveIds.flatMap((id) => {
        const policy = permissionById.get(id)?.toolPolicy;
        return policy ? [[id, policy]] : [];
      }),
    ),
    allowProxyById: Object.fromEntries(
      effectiveIds.flatMap((id) => {
        const allowProxy = permissionById.get(id)?.allowProxy;
        return allowProxy === undefined ? [] : [[id, allowProxy]];
      }),
    ),
  };
}

export function createRecommendedConnectionGrantDraft(options: ConnectionGrantOption[]): ConnectionGrantDraft {
  return {
    mode: "restricted",
    ids: options.map((option) => option.id),
    accessById: Object.fromEntries(options.map((option) => [option.id, "read"])),
    toolPolicyById: {},
    allowProxyById: {},
  };
}

export function allowedConnectionsFromDraft(draft: ConnectionGrantDraft): string[] {
  return draft.mode === "restricted" ? [...draft.ids] : [];
}

export function connectionPermissionsFromDraft(draft: ConnectionGrantDraft): ConnectionPermissionGrant[] {
  return draft.mode === "restricted"
    ? draft.ids.map((connectionId) => {
        const grant: ConnectionPermissionGrant = {
          connectionId,
          access: draft.accessById[connectionId] ?? "read",
          allowProxy: draft.allowProxyById[connectionId] ?? false,
        };
        const toolPolicy = draft.toolPolicyById[connectionId];
        if (toolPolicy) grant.toolPolicy = toolPolicy;
        return grant;
      })
    : [];
}

export function runtimeTokenPolicyBody(
  rules: Pick<PolicyRules, "allowedActions" | "blockedActions" | "allowedProxies">,
  connections: ConnectionGrantDraft,
  options: ConnectionGrantOption[] = [],
): {
  allowedActions: string[];
  blockedActions: string[];
  allowedProxies: string[];
  allowedConnections: string[];
  connectionPermissions: ConnectionPermissionGrant[];
} {
  return {
    allowedActions: connectionScopedAllowedActions(rules.allowedActions, connections, options),
    blockedActions: rules.blockedActions,
    allowedProxies: connectionScopedAllowedProxies(rules.allowedProxies, connections, options),
    allowedConnections: allowedConnectionsFromDraft(connections),
    connectionPermissions: connectionPermissionsFromDraft(connections),
  };
}

function connectionScopedAllowedProxies(
  allowedProxies: string[],
  connections: ConnectionGrantDraft,
  options: ConnectionGrantOption[],
): string[] {
  if (connections.mode !== "restricted") return allowedProxies;
  const selected = new Set(
    connections.ids.filter((id) => connections.accessById[id] === "full" && connections.allowProxyById[id] === true),
  );
  return [...new Set(options.filter((option) => selected.has(option.id)).map((option) => option.service))];
}

function connectionScopedAllowedActions(
  allowedActions: string[],
  connections: ConnectionGrantDraft,
  options: ConnectionGrantOption[],
): string[] {
  if (connections.mode !== "restricted" || allowedActions.length > 0) return allowedActions;
  const selected = new Set(connections.ids);
  const services = options.filter((option) => selected.has(option.id)).map((option) => `${option.service}.*`);
  return [...new Set(services)];
}

function sameStringSet(left: string[], right: string[]): boolean {
  return left.length === right.length && left.every((value) => right.includes(value));
}

export function connectionGrantOptions(
  connections: ConnectionRecord[],
  providers: ProviderDefinition[] = [],
): ConnectionGrantOption[] {
  const providerNames = new Map(providers.map((provider) => [provider.service, provider.displayName]));
  return connections.flatMap((connection) => {
    if (!connection.id || connection.virtual || connection.authType === "no_auth") {
      return [];
    }
    const displayName =
      typeof connection.profile?.displayName === "string" ? connection.profile.displayName : undefined;
    const connectionName = connection.connectionName?.trim() || defaultConnectionName;
    const toolCount = connectionDiscoveredToolCount(connection);
    return [
      {
        id: connection.id,
        service: connection.service,
        name: connectionName,
        displayName,
        provider: providerNames.get(connection.service) ?? connection.service,
        toolCount,
        isDefault: connection.default ?? connectionName === defaultConnectionName,
      },
    ];
  });
}

function connectionGrantIssue(draft: ConnectionGrantDraft): "required" | "too_many" | undefined {
  if (draft.mode !== "restricted") {
    return undefined;
  }
  return draft.ids.length === 0 ? "required" : draft.ids.length > connectionListMaxItems ? "too_many" : undefined;
}

interface ConnectionGrantEditorProps {
  draft: ConnectionGrantDraft;
  options: ConnectionGrantOption[];
  onChange(draft: ConnectionGrantDraft): void;
}

export function ConnectionGrantEditor(props: ConnectionGrantEditorProps): ReactNode {
  const t = useTranslate();
  const listId = useId();
  const options: ConnectionGrantOption[] = [
    ...props.options,
    ...props.draft.ids
      .filter((id) => !props.options.some((option) => option.id === id))
      .map((id) => ({ id, service: "unknown", name: id, provider: t("access.policy.editor.unknownRule") })),
  ];
  const issue = connectionGrantIssue(props.draft);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedServices, setExpandedServices] = useState<Set<string>>(() => new Set(options.map((o) => o.service)));
  const [viewingToolsOption, setViewingToolsOption] = useState<ConnectionGrantOption | null>(null);

  function toggleServiceExpand(service: string): void {
    setExpandedServices((prev) => {
      const next = new Set(prev);
      if (next.has(service)) {
        next.delete(service);
      } else {
        next.add(service);
      }
      return next;
    });
  }

  function toggleGroup(groupOptions: ConnectionGrantOption[]): void {
    const groupIds = groupOptions.map((o) => o.id);
    const allChecked = groupIds.every((id) => props.draft.ids.includes(id));
    const nextIds = allChecked
      ? props.draft.ids.filter((id) => !groupIds.includes(id))
      : Array.from(new Set([...props.draft.ids, ...groupIds]));
    const accessById = { ...props.draft.accessById };
    const toolPolicyById = { ...props.draft.toolPolicyById };
    const allowProxyById = { ...props.draft.allowProxyById };
    for (const id of groupIds) {
      if (allChecked) {
        delete accessById[id];
        delete toolPolicyById[id];
        delete allowProxyById[id];
      } else accessById[id] ??= "read";
    }
    props.onChange({ mode: "restricted", ids: nextIds, accessById, toolPolicyById, allowProxyById });
  }

  function setGroupAccess(groupOptions: ConnectionGrantOption[], access: ConnectionAccessLevel | "disabled"): void {
    const groupIds = groupOptions.map((option) => option.id);
    const accessById = { ...props.draft.accessById };
    const toolPolicyById = { ...props.draft.toolPolicyById };
    const allowProxyById = { ...props.draft.allowProxyById };
    if (access === "disabled") {
      for (const id of groupIds) {
        delete accessById[id];
        delete toolPolicyById[id];
        delete allowProxyById[id];
      }
      props.onChange({
        mode: "restricted",
        ids: props.draft.ids.filter((id) => !groupIds.includes(id)),
        accessById,
        toolPolicyById,
        allowProxyById,
      });
      return;
    }
    for (const id of groupIds) accessById[id] = access;
    props.onChange({
      mode: "restricted",
      ids: Array.from(new Set([...props.draft.ids, ...groupIds])),
      accessById,
      toolPolicyById,
      allowProxyById,
    });
  }

  const filteredOptions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return options;
    return options.filter((option) => {
      return (
        option.name.toLowerCase().includes(q) ||
        option.provider.toLowerCase().includes(q) ||
        (option.displayName && option.displayName.toLowerCase().includes(q))
      );
    });
  }, [options, searchQuery]);

  const groups = useMemo(() => {
    const map = new Map<
      string,
      { service: string; provider: string; options: ConnectionGrantOption[]; toolCount: number }
    >();
    for (const option of filteredOptions) {
      const key = option.service;
      let group = map.get(key);
      if (!group) {
        group = { service: option.service, provider: option.provider, options: [], toolCount: 0 };
        map.set(key, group);
      }
      group.options.push(option);
      if (typeof option.toolCount === "number") {
        group.toolCount += option.toolCount;
      }
    }
    return Array.from(map.values());
  }, [filteredOptions]);

  return (
    <div className="policy-resource-editor">
      <p className="mb-3 text-sm text-muted-foreground">{t("access.policy.editor.accessHint")}</p>
      {props.draft.mode === "unrestricted" ? (
        <div className="token-legacy-permission" role="alert">
          <div>
            <strong>{t("access.policy.tools.legacyUnrestricted")}</strong>
            <p>{t("access.policy.tools.legacyUnrestrictedHint")}</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => props.onChange(createRecommendedConnectionGrantDraft(options))}
          >
            {t("access.policy.tools.convertLegacy")}
          </Button>
        </div>
      ) : (
        <section className="policy-rule-section">
          <div className="policy-rule-heading">
            <div>
              <h4>{t("access.policy.editor.connectionsList")}</h4>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="text-xs text-primary hover:underline"
                onClick={() =>
                  props.onChange({
                    mode: "restricted",
                    ids: options.map((option) => option.id),
                    accessById: Object.fromEntries(options.map((option) => [option.id, "read"])),
                    toolPolicyById: {},
                    allowProxyById: {},
                  })
                }
              >
                {t("access.policy.editor.selectAll")}
              </button>
              <span className="text-muted-foreground">·</span>
              <button
                type="button"
                className="text-xs text-muted-foreground hover:underline"
                onClick={() =>
                  props.onChange({
                    mode: "restricted",
                    ids: [],
                    accessById: {},
                    toolPolicyById: {},
                    allowProxyById: {},
                  })
                }
              >
                {t("access.policy.editor.deselectAll")}
              </button>
              <span className="text-muted-foreground">·</span>
              <span>{t("access.policy.editor.connectionCount", { count: props.draft.ids.length })}</span>
            </div>
          </div>
          <p>{t("access.policy.editor.connectionsDefaultHint")}</p>
          <div className="mb-2">
            <input
              type="search"
              className="w-full rounded border px-2 py-1 text-sm bg-background"
              placeholder={t("access.policy.editor.searchConnectionsPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {groups.length > 0 ? (
            <div className="connection-grant-groups max-h-[380px] overflow-y-auto pr-1">
              {groups.map((group) => (
                <ProviderGroupSection
                  key={group.service}
                  group={group}
                  listId={listId}
                  isExpanded={expandedServices.has(group.service)}
                  selectedIds={props.draft.ids}
                  accessById={props.draft.accessById}
                  toolPolicyById={props.draft.toolPolicyById}
                  maxItems={connectionListMaxItems}
                  onToggleExpand={toggleServiceExpand}
                  onToggleGroup={toggleGroup}
                  onSetGroupAccess={setGroupAccess}
                  onToggleOption={(id, checked) =>
                    props.onChange({
                      mode: "restricted",
                      ids: checked ? [...props.draft.ids, id] : props.draft.ids.filter((item) => item !== id),
                      accessById: checked
                        ? { ...props.draft.accessById, [id]: props.draft.accessById[id] ?? "read" }
                        : Object.fromEntries(Object.entries(props.draft.accessById).filter(([item]) => item !== id)),
                      toolPolicyById: checked
                        ? props.draft.toolPolicyById
                        : Object.fromEntries(
                            Object.entries(props.draft.toolPolicyById).filter(([item]) => item !== id),
                          ),
                      allowProxyById: checked
                        ? props.draft.allowProxyById
                        : Object.fromEntries(
                            Object.entries(props.draft.allowProxyById).filter(([item]) => item !== id),
                          ),
                    })
                  }
                  onSetOptionAccess={(id, access) =>
                    props.onChange({
                      mode: "restricted",
                      ids: props.draft.ids.includes(id) ? props.draft.ids : [...props.draft.ids, id],
                      accessById: { ...props.draft.accessById, [id]: access },
                      toolPolicyById: props.draft.toolPolicyById,
                      allowProxyById:
                        access === "full" ? props.draft.allowProxyById : { ...props.draft.allowProxyById, [id]: false },
                    })
                  }
                  onConfigureTools={(option) => setViewingToolsOption(option)}
                />
              ))}
            </div>
          ) : (
            <p className="policy-rule-empty">{t("access.policy.editor.noConnections")}</p>
          )}
          {issue ? (
            <p className="policy-rule-error">
              {t(
                issue === "required"
                  ? "access.policy.editor.connectionsRequired"
                  : "access.policy.editor.tooManyConnections",
              )}
            </p>
          ) : null}
        </section>
      )}

      {viewingToolsOption ? (
        <ConnectionToolPolicyDialog
          option={viewingToolsOption}
          access={props.draft.accessById[viewingToolsOption.id] ?? "read"}
          value={props.draft.toolPolicyById[viewingToolsOption.id]}
          allowProxy={props.draft.allowProxyById[viewingToolsOption.id] ?? false}
          open={Boolean(viewingToolsOption)}
          onOpenChange={(open) => {
            if (!open) setViewingToolsOption(null);
          }}
          onSave={(toolPolicy, allowProxy) =>
            props.onChange({
              ...props.draft,
              toolPolicyById: { ...props.draft.toolPolicyById, [viewingToolsOption.id]: toolPolicy },
              allowProxyById: { ...props.draft.allowProxyById, [viewingToolsOption.id]: allowProxy },
            })
          }
        />
      ) : null}
    </div>
  );
}
