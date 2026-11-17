import type { CatalogStore } from "../../catalog-store.ts";
import type { ConnectionService } from "../../connection-service.ts";
import type { RuntimeLogger } from "../../core/types.ts";
import type { ActionRunner } from "../actions/action-runner.ts";
import type { PolicySnapshotProvider } from "./policy-snapshot.ts";
import type { Context } from "hono";

import { Hono } from "hono";
import { ConnectionError } from "../../connection-error.ts";
import { looseArray, optionalRecord, optionalString } from "../../core/cast.ts";
import { jsonError, readConnectionName, readJsonBody } from "./http-utils.ts";

export interface ConsoleConnectionRoutesOptions {
  catalog: CatalogStore;
  connections: ConnectionService;
  actions: ActionRunner;
  getPolicySnapshot: PolicySnapshotProvider;
  /** Without an admin token every network peer of the console is an administrator. */
  adminAuthConfigured: boolean;
  logger?: RuntimeLogger;
}

/**
 * Console routes that inspect and edit one saved connection: the tools a connection can grant,
 * saved custom credential settings, secret reveal, partial credential updates, and Cloudflare usage.
 */
export function createConsoleConnectionRoutes({
  catalog,
  connections,
  actions,
  getPolicySnapshot,
  adminAuthConfigured,
  logger,
}: ConsoleConnectionRoutesOptions): Hono {
  const app = new Hono();

  const writeConnectionResult = async (
    context: Context,
    operation: Promise<unknown>,
    logContext?: Record<string, unknown>,
  ): Promise<Response> => {
    try {
      const result = await operation;
      if (logContext) logger?.info(logContext, "connection completed");
      return context.json(result);
    } catch (error) {
      if (error instanceof ConnectionError) {
        if (logContext) logger?.warn({ ...logContext, errorCode: error.code }, "connection failed");
        const status =
          error.code === "unknown_service" || error.code === "connection_not_found"
            ? 404
            : error.code === "admin_auth_required"
              ? 403
              : 400;
        return jsonError(context, status, error.code, error.message);
      }
      throw error;
    }
  };

  app.get("/connections/tools/:connectionId", async (context) => {
    const connectionId = context.req.param("connectionId");
    const connection = (await connections.listConnections()).find((item) => item.id === connectionId);
    if (!connection || connection.virtual || connection.authType === "no_auth") {
      return jsonError(context, 404, "connection_not_found", `Connection not found: ${connectionId}.`);
    }

    if (connection.service !== "custom_mcp") {
      const provider = catalog.providers.find((item) => item.service === connection.service);
      if (!provider) return jsonError(context, 404, "unknown_service", `Unknown service: ${connection.service}.`);
      const tools = provider.actions.map((action) => ({
        actionId: action.id,
        name: action.name,
        description: action.description,
        operationType: action.operationType ?? "write",
      }));
      return context.json({ connectionId, service: connection.service, tools, total: tools.length });
    }

    const run = await actions.run({
      actionId: "custom_mcp.list_tools",
      input: {},
      caller: "web",
      connectionName: connection.connectionName,
      policy: await getPolicySnapshot(context),
      signal: context.req.raw.signal,
    });
    if (!run) return jsonError(context, 404, "unknown_action", "Custom MCP tool discovery is unavailable.");
    if (!run.result.ok) {
      return jsonError(
        context,
        500,
        run.result.error?.code ?? "provider_error",
        run.result.error?.message ?? "Custom MCP tool discovery failed.",
      );
    }
    const tools = looseArray(optionalRecord(run.result.output)?.tools).flatMap((value) => {
      const item = optionalRecord(value);
      const actionId = optionalString(item?.actionId);
      const name = optionalString(item?.name);
      const operationType = optionalString(item?.operationType);
      if (!actionId || !name || !isActionOperationType(operationType)) return [];
      return [{ actionId, name, description: optionalString(item?.description), operationType }];
    });
    return context.json({ connectionId, service: connection.service, tools, total: tools.length });
  });

  app.get("/connections/:service/settings", (context) =>
    writeConnectionResult(
      context,
      connections.getCustomCredentialSettings(context.req.param("service"), readConnectionName(context)),
    ),
  );

  // Reveal one saved secret only behind the admin token; without one the endpoint stays closed.
  app.get("/connections/:service/settings/secrets/:field", (context) => {
    if (!adminAuthConfigured) {
      return jsonError(
        context,
        403,
        "admin_auth_required",
        "Set OOMOL_CONNECT_ADMIN_TOKEN before revealing saved connection secrets.",
      );
    }
    const service = context.req.param("service");
    const field = context.req.param("field");
    const connectionName = readConnectionName(context);
    context.header("cache-control", "no-store");
    return writeConnectionResult(
      context,
      connections.revealCustomCredentialSecret(service, connectionName, field).then((secret) => {
        logger?.info({ service, connectionName: secret.connectionName, field }, "connection secret revealed");
        return secret;
      }),
    );
  });

  app.patch("/connections/:service", async (context) => {
    const service = context.req.param("service");
    const body = await readJsonBody(context);
    const values = optionalRecord(body.values);
    const connectionName = readConnectionName(context, body);
    const logContext = {
      operation: "connect",
      path: context.req.path,
      service,
      authType: "custom_credential",
      connectionName,
    };
    if (!values) {
      logger?.warn({ ...logContext, errorCode: "invalid_input" }, "connection patch rejected");
      return jsonError(context, 400, "invalid_input", "values must be an object.");
    }
    logger?.info(logContext, "connection patch started");
    return writeConnectionResult(
      context,
      connections.patchCustomCredentialValues(service, {
        connectionName,
        values,
        signal: context.req.raw.signal,
        allowRetargetWithSavedSecrets: adminAuthConfigured,
      }),
      logContext,
    );
  });

  app.get("/cloudflare-usage", async (context) => {
    const configured = (await connections.listConnectionsByService("cloudflare_mcp")).filter(
      (connection) => connection.configured && !connection.virtual,
    );
    if (configured.length === 0) return context.json({ status: "unavailable", reason: "connection_not_configured" });

    const requestedName = context.req.query("connectionName");
    const connection = requestedName
      ? configured.find((item) => item.connectionName === requestedName)
      : configured.length === 1
        ? configured[0]
        : undefined;
    if (!connection) {
      return jsonError(context, 400, "invalid_connection", "Select a configured Cloudflare MCP connection.");
    }
    const credential = await connections.getCredential("cloudflare_mcp", connection.connectionName);
    const token =
      credential?.authType === "api_key"
        ? credential.apiKey
        : credential?.authType === "oauth2"
          ? credential.accessToken
          : undefined;
    if (!token) return context.json({ status: "unavailable", reason: "connection_not_configured" });

    let usageModule: typeof import("../cloudflare/cloudflare-usage.ts") | undefined;
    try {
      usageModule = await import("../cloudflare/cloudflare-usage.ts");
      return context.json({
        status: "ready",
        ...(await usageModule.loadCloudflareUsage(token, { signal: context.req.raw.signal })),
      });
    } catch (error) {
      if (usageModule && error instanceof usageModule.CloudflareUsageError) {
        return context.json({ errorCode: "cloudflare_usage_unavailable", message: error.message }, 502);
      }
      logger?.error({ err: error }, "Cloudflare usage lookup failed");
      return context.json(
        { errorCode: "cloudflare_usage_unavailable", message: "Cloudflare usage is unavailable." },
        502,
      );
    }
  });

  return app;
}

function isActionOperationType(value: string | undefined): value is "read" | "write" | "destructive" {
  return value === "read" || value === "write" || value === "destructive";
}
