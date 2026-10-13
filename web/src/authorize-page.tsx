import type { ConnectionGrantDraft } from "./access-page";
import type { ConnectionRecord, ProviderDefinition } from "./model";
import type { ReactNode, SubmitEvent } from "react";

import { useTranslate } from "@embra/i18n/react";
import { AlertTriangle, Check, Loader2, ShieldCheck, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import {
  connectionGrantIssue,
  connectionGrantOptions,
  createRecommendedConnectionGrantDraft,
  emptyPolicyRules,
  runtimeTokenPolicyBody,
  TokenPermissionEditor,
} from "./access-page";
import { ApiError, apiGet, apiPost } from "./api";
import { createPolicyEditorDraft, policyRulesFromEditorDraft, validatePolicyEditorDraft } from "./policy";
import { FormStatus, InlineError } from "./shared-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** A pending OAuth authorization request from an MCP client such as ChatGPT. */
interface AuthorizationRequest {
  id: string;
  clientId: string;
  clientName: string;
  redirectUri: string;
  createdAt: string;
  expiresAt: string;
}

interface AuthorizationRedirect {
  redirectUrl: string;
}

interface AuthorizePageProps {
  providers: ProviderDefinition[];
  connections: ConnectionRecord[];
}

type RequestState =
  | { status: "loading" }
  | { status: "missing" }
  | { status: "failed"; message: string }
  | { status: "ready"; request: AuthorizationRequest };

/**
 * Consent page for MCP OAuth. The administrator chooses the permissions of the runtime token issued to the client,
 * exactly as when creating a token on the Access page, then the browser returns to the client.
 */
export function AuthorizePage(props: AuthorizePageProps): ReactNode {
  const t = useTranslate();
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get("request") ?? "";
  const [state, setState] = useState<RequestState>({ status: "loading" });

  useEffect(() => {
    if (!requestId) {
      setState({ status: "missing" });
      return;
    }
    let cancelled = false;
    setState({ status: "loading" });
    apiGet<AuthorizationRequest>(`/api/mcp-oauth/requests/${encodeURIComponent(requestId)}`)
      .then((request) => {
        if (!cancelled) setState({ status: "ready", request });
      })
      .catch((caught: unknown) => {
        if (cancelled) return;
        setState(
          caught instanceof ApiError && caught.status === 404
            ? { status: "missing" }
            : { status: "failed", message: caught instanceof Error ? caught.message : t("authorize.failed") },
        );
      });
    return () => {
      cancelled = true;
    };
  }, [requestId, t]);

  return (
    <div className="authorize-layout">
      {state.status === "loading" ? (
        <div className="loading-panel">
          <Loader2 className="spin" size={16} />
          {t("authorize.loading")}
        </div>
      ) : state.status === "missing" ? (
        <InlineError message={t("authorize.notFound")} />
      ) : state.status === "failed" ? (
        <InlineError message={state.message} />
      ) : (
        <AuthorizeForm request={state.request} providers={props.providers} connections={props.connections} />
      )}
    </div>
  );
}

interface AuthorizeFormProps {
  request: AuthorizationRequest;
  providers: ProviderDefinition[];
  connections: ConnectionRecord[];
}

function AuthorizeForm(props: AuthorizeFormProps): ReactNode {
  const t = useTranslate();
  const { request } = props;
  const connectionOptions = useMemo(
    () => connectionGrantOptions(props.connections, props.providers),
    [props.connections, props.providers],
  );
  const [name, setName] = useState(request.clientName);
  const [draft, setDraft] = useState(() => createPolicyEditorDraft(emptyPolicyRules()));
  // Match the Access page: new tokens start read-only on every connection.
  const [connections, setConnections] = useState<ConnectionGrantDraft>(() =>
    createRecommendedConnectionGrantDraft(connectionOptions),
  );
  const [pending, setPending] = useState<"approve" | "deny" | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const issues = validatePolicyEditorDraft(draft, false);
  const connectionIssue = connectionGrantIssue(connections);
  const callbackHost = useMemo(() => new URL(request.redirectUri).host, [request.redirectUri]);

  async function answer(decision: "approve" | "deny"): Promise<void> {
    setPending(decision);
    setStatus(null);
    try {
      const path = `/api/mcp-oauth/requests/${encodeURIComponent(request.id)}/${decision}`;
      const body =
        decision === "approve"
          ? { name, ...runtimeTokenPolicyBody(policyRulesFromEditorDraft(draft), connections, connectionOptions) }
          : {};
      const { redirectUrl } = await apiPost<AuthorizationRedirect>(path, body);
      window.location.assign(redirectUrl);
    } catch (caught) {
      setPending(null);
      setStatus(
        caught instanceof ApiError && caught.status === 404
          ? t("authorize.notFound")
          : caught instanceof Error
            ? caught.message
            : t("authorize.failed"),
      );
    }
  }

  function submit(event: SubmitEvent<HTMLFormElement>): void {
    event.preventDefault();
    void answer("approve");
  }

  return (
    <form className="authorize-card" onSubmit={submit}>
      <div className="authorize-heading">
        <span className="doc-icon">
          <ShieldCheck size={20} />
        </span>
        <div>
          <h2>{t("authorize.title", { client: request.clientName })}</h2>
          <p>{t("authorize.description", { client: request.clientName })}</p>
        </div>
      </div>

      <div className="authorize-warning" role="note">
        <AlertTriangle size={16} />
        <span>{t("authorize.warning")}</span>
      </div>

      <dl className="authorize-facts">
        <dt>{t("authorize.client")}</dt>
        <dd>
          {request.clientName} <small>{t("authorize.clientNameHint")}</small>
        </dd>
        <dt>{t("authorize.callback")}</dt>
        <dd>
          <strong>{callbackHost}</strong> <small>{request.redirectUri}</small>
        </dd>
        <dt>{t("authorize.requestedAt")}</dt>
        <dd>{new Date(request.createdAt).toLocaleString()}</dd>
        <dt>{t("authorize.expiresAt")}</dt>
        <dd>{new Date(request.expiresAt).toLocaleString()}</dd>
      </dl>

      <Label className="field">
        <span>{t("authorize.tokenName")}</span>
        <Input value={name} onChange={(event) => setName(event.target.value)} maxLength={200} />
      </Label>
      <TokenPermissionEditor
        draft={draft}
        providers={props.providers}
        connections={connections}
        connectionOptions={connectionOptions}
        onDraftChange={setDraft}
        onConnectionsChange={setConnections}
      />
      <p className="authorize-hint">{t("authorize.revokeHint")}</p>
      {status ? <FormStatus message={status} /> : null}

      <div className="authorize-actions">
        <Button variant="outline" type="button" disabled={pending !== null} onClick={() => void answer("deny")}>
          {pending === "deny" ? <Loader2 className="spin" size={16} /> : <X size={16} />}
          {t("authorize.deny")}
        </Button>
        <Button
          type="submit"
          disabled={pending !== null || !name.trim() || issues.length > 0 || connectionIssue != null}
        >
          {pending === "approve" ? <Loader2 className="spin" size={16} /> : <Check size={16} />}
          {t("authorize.approve")}
        </Button>
      </div>
    </form>
  );
}
