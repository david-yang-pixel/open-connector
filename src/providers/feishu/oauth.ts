import type { OAuthAuthorizationScopeResolutionInput, ProviderOAuthRuntime } from "../../oauth/oauth-token.ts";

import {
  optionalNumber,
  optionalObjectArray,
  optionalRecord,
  optionalString,
  optionalStringArray,
} from "../../core/cast.ts";
import { ProviderRequestError, readProviderJsonBody, runProviderRequest } from "../provider-runtime.ts";
import { feishuProviderScopes } from "./scopes.ts";

const feishuTenantAccessTokenUrl = "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal";
const feishuApplicationBaseUrl = "https://open.feishu.cn/open-apis/application/v6/applications";

/** Feishu OAuth preflight that limits consent to user scopes enabled on the configured app. */
export const oauth: ProviderOAuthRuntime = {
  async resolveAuthorizationScopes(input) {
    try {
      return await resolveFeishuAuthorizationScopes(input);
    } catch (error) {
      if (error instanceof ProviderRequestError) {
        throw input.createError(error.message);
      }
      throw error;
    }
  },
};

async function resolveFeishuAuthorizationScopes(input: OAuthAuthorizationScopeResolutionInput): Promise<string[]> {
  return runProviderRequest({ label: "Feishu OAuth scope discovery" }, async (signal) => {
    const tenantAccessToken = await fetchFeishuTenantAccessToken(input, signal);
    const enabledUserScopes = await fetchFeishuEnabledUserScopes(input, tenantAccessToken, signal);
    return input.requestedScopes.filter(
      (scope) => scope === feishuProviderScopes.offlineAccess || enabledUserScopes.has(scope),
    );
  });
}

async function fetchFeishuTenantAccessToken(
  input: OAuthAuthorizationScopeResolutionInput,
  signal: AbortSignal,
): Promise<string> {
  const response = await input.fetcher(feishuTenantAccessTokenUrl, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      app_id: input.clientConfig.clientId,
      app_secret: input.clientConfig.clientSecret,
    }),
    redirect: "manual",
    signal,
  });
  const payload = optionalRecord(
    await readProviderJsonBody(response, {
      emptyBody: null,
      invalidJsonMessage: "Feishu OAuth app credential check returned invalid JSON.",
    }),
  );
  const token = optionalString(payload?.tenant_access_token);
  if (!response.ok || optionalNumber(payload?.code) !== 0 || !token) {
    throw new ProviderRequestError(
      response.status >= 400 ? response.status : 502,
      "Feishu OAuth app credentials could not be validated before authorization.",
    );
  }
  return token;
}

async function fetchFeishuEnabledUserScopes(
  input: OAuthAuthorizationScopeResolutionInput,
  tenantAccessToken: string,
  signal: AbortSignal,
): Promise<Set<string>> {
  const appId = encodeURIComponent(input.clientConfig.clientId);
  const response = await input.fetcher(`${feishuApplicationBaseUrl}/${appId}?lang=zh_cn`, {
    headers: {
      accept: "application/json",
      authorization: `Bearer ${tenantAccessToken}`,
    },
    redirect: "manual",
    signal,
  });
  const payload = optionalRecord(
    await readProviderJsonBody(response, {
      emptyBody: null,
      invalidJsonMessage: "Feishu app permission query returned invalid JSON.",
    }),
  );
  if (!response.ok || optionalNumber(payload?.code) !== 0) {
    throw new ProviderRequestError(
      response.status >= 400 ? response.status : 502,
      "Feishu app permissions could not be read before authorization.",
    );
  }

  const app = optionalRecord(optionalRecord(payload?.data)?.app);
  const enabled = new Set<string>();
  for (const item of optionalObjectArray(app?.scopes)) {
    const scope = optionalString(item.scope);
    const tokenTypes = optionalStringArray(item.token_types) ?? [];
    if (scope && tokenTypes.includes("user")) enabled.add(scope);
  }
  return enabled;
}
