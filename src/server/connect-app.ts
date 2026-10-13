import type { CatalogStore } from "../catalog-store.ts";
import type { ActionPolicyService } from "../core/action-policy.ts";
import type { RuntimeLogger, TransitFileUpload } from "../core/types.ts";
import type { IProviderLoader } from "../providers/provider-loader.ts";
import type { RuntimeJwtVerifier } from "./api/runtime-jwt.ts";
import type { ITransitFileService } from "./files/transit-file-store.ts";
import type { ISecretCodec } from "./secrets/secret-codec-core.ts";
import type { RuntimeDatabase } from "./storage/runtime-database.ts";
import type { Hono } from "hono";

import { ConnectionService } from "../connection-service.ts";
import { MarketplaceService } from "../marketplace/marketplace-service.ts";
import { OAuthClientConfigService } from "../oauth/oauth-client-config-service.ts";
import { OAuthCredentialRefreshService } from "../oauth/oauth-credential-refresh-service.ts";
import { OAuthFlowService } from "../oauth/oauth-flow-service.ts";
import { ActionRunner } from "./actions/action-runner.ts";
import { ConnectServer } from "./connect-server.ts";
import { McpOAuthService } from "./mcp-oauth/mcp-oauth-service.ts";
import { RuntimeTokenService } from "./storage/runtime-token-service.ts";

export interface ConnectAppOptions {
  catalog: CatalogStore;
  providerLoader: IProviderLoader;
  runtimeDatabase: RuntimeDatabase;
  transitFiles: ITransitFileService;
  uploadTransitFile?: (request: Request) => Promise<TransitFileUpload>;
  publicOrigin: string;
  secretCodec: ISecretCodec;
  adminToken?: string;
  runtimeToken?: string;
  allowedCustomOAuth?: string[];
  verifyRuntimeJwt?: RuntimeJwtVerifier;
  /** Let ChatGPT custom connectors obtain /mcp runtime tokens through OAuth with administrator approval. */
  mcpOAuth?: boolean;
  actionPolicy?: ActionPolicyService;
  registerStaticRoutes?: (app: Hono) => void;
  logger?: RuntimeLogger;
  computeRuntimeAuthConfigured?: boolean;
  compressApiResponses?: boolean;
  serveDocumentation?: boolean;
}

export interface ConnectApp {
  app: Hono;
  runtimeAuthConfigured: boolean;
}

export async function createConnectApp(options: ConnectAppOptions): Promise<ConnectApp> {
  if (options.mcpOAuth) assertMcpOAuthConfiguration(options);
  const marketplace = new MarketplaceService({
    catalog: options.catalog,
    store: options.runtimeDatabase.marketplaceStore,
    secretCodec: options.secretCodec,
  });
  await marketplace.initialize();
  const runtimeTokens = new RuntimeTokenService(options.runtimeDatabase.runtimeTokenStore, options.logger);
  const hasStoredRuntimeTokens = async (): Promise<boolean> => (await runtimeTokens.listTokens()).length > 0;
  const mcpOAuth = options.mcpOAuth
    ? new McpOAuthService({
        store: options.runtimeDatabase.mcpOAuthStore,
        runtimeTokens,
        publicOrigin: options.publicOrigin,
      })
    : undefined;
  const allowedCustomOAuth = new Set(options.allowedCustomOAuth);
  const isCustomClientConfigAllowed = (service: string): boolean =>
    allowedCustomOAuth.has("*") || allowedCustomOAuth.has(service);
  const oauthClientConfigs = new OAuthClientConfigService({
    catalog: options.catalog,
    origin: options.publicOrigin,
    store: options.runtimeDatabase.oauthClientConfigStore,
    isCustomClientConfigAvailable: (service) => options.secretCodec.encrypted && isCustomClientConfigAllowed(service),
  });
  const connections = new ConnectionService({
    catalog: options.catalog,
    oauthCredentials: new OAuthCredentialRefreshService(oauthClientConfigs, options.providerLoader),
    providerLoader: options.providerLoader,
    store: options.runtimeDatabase.connectionStore,
    logger: options.logger,
    marketplace,
  });
  const actions = new ActionRunner({
    catalog: options.catalog,
    providerLoader: options.providerLoader,
    connections,
    runs: options.runtimeDatabase.runLogStore,
    transitFiles: options.transitFiles,
    logger: options.logger,
    marketplace,
  });

  return {
    app: new ConnectServer({
      catalog: options.catalog,
      publicOrigin: options.publicOrigin,
      providerLoader: options.providerLoader,
      connections,
      oauthClientConfigs,
      oauthFlow: new OAuthFlowService({
        clientConfigs: oauthClientConfigs,
        connections,
        providerLoader: options.providerLoader,
        states: options.runtimeDatabase.oauthStateStore,
        requests: options.runtimeDatabase.connectionRequestStore,
        secretCodec: options.secretCodec,
        isCustomClientConfigAllowed,
      }),
      actions,
      idempotency: options.runtimeDatabase.idempotencyStore,
      transitFiles: options.transitFiles,
      uploadTransitFile: options.uploadTransitFile,
      runtimeTokens,
      mcpOAuth,
      runtimePolicyStore: options.runtimeDatabase.runtimePolicyStore,
      registerStaticRoutes: options.registerStaticRoutes,
      auth: {
        adminToken: options.adminToken,
        runtimeToken: options.runtimeToken,
        hasRuntimeTokens: hasStoredRuntimeTokens,
        resolveRuntimeToken: (token) => runtimeTokens.resolveToken(token),
        verifyRuntimeJwt: options.verifyRuntimeJwt,
        mcpResourceMetadataUrl: mcpOAuth?.resourceMetadataUrl,
      },
      actionPolicy: options.actionPolicy,
      logger: options.logger,
      marketplace,
      compressApiResponses: options.compressApiResponses,
      serveDocumentation: options.serveDocumentation,
    }).createApp(),
    runtimeAuthConfigured:
      Boolean(options.runtimeToken) ||
      Boolean(options.verifyRuntimeJwt) ||
      Boolean(mcpOAuth) ||
      (options.computeRuntimeAuthConfigured === false ? false : await hasStoredRuntimeTokens()),
  };
}

/**
 * Only the administrator may approve OAuth clients, so the consent page must be protected, and ChatGPT reaches the
 * runtime over the public internet, so the advertised issuer must be HTTPS. Loopback HTTP stays available for local
 * development.
 */
function assertMcpOAuthConfiguration(options: ConnectAppOptions): void {
  if (!options.adminToken?.trim()) {
    throw new Error("MCP OAuth requires OOMOL_CONNECT_ADMIN_TOKEN so that only the administrator can approve clients.");
  }
  const origin = new URL(options.publicOrigin);
  const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname);
  if (origin.protocol !== "https:" && !(origin.protocol === "http:" && loopback)) {
    throw new Error("MCP OAuth requires an HTTPS OOMOL_CONNECT_ORIGIN.");
  }
}
