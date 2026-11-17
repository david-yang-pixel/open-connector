import type { CatalogStore, RuntimeActionDefinition } from "../../catalog-store.ts";
import type { ConnectionService } from "../../connection-service.ts";
import type { ActionSearchDocument, ActionSearchIndexProvider } from "../../core/action-search.ts";
import type { OAuthClientConfigService } from "../../oauth/oauth-client-config-service.ts";
import type { SaasProjectService } from "../../saas/saas-project-service.ts";
import type { Context } from "hono";

import { Hono } from "hono";
import {
  DEFAULT_ACTION_SEARCH_LIMIT,
  MAX_ACTION_SEARCH_LIMIT,
  decodeActionSearchCursor,
  encodeActionSearchCursor,
  searchActions,
} from "../../core/action-search.ts";
import { optionalString } from "../../core/cast.ts";
import { catalogLocale } from "./catalog-locale.ts";
import {
  serializeRuntimeAction,
  serializeRuntimeActionService,
  serializeRuntimeProvider,
  serializeRuntimeProviderSetup,
  unknownActionFailure,
  unknownServiceFailure,
  writeRuntimeFailure,
  writeRuntimeSuccess,
} from "./runtime-api.ts";

export interface RuntimeActionSearchResult {
  id: string;
  service: string;
  name: string;
  description: string;
  operationType: RuntimeActionDefinition["operationType"];
  authenticated: boolean;
  inputSchema: RuntimeActionDefinition["inputSchema"];
  outputSchema: RuntimeActionDefinition["outputSchema"];
}

export function serializeActionSearchResult(
  result: ActionSearchDocument,
  action: RuntimeActionDefinition,
  authenticated: boolean,
): RuntimeActionSearchResult {
  return {
    id: result.id,
    service: result.service,
    name: result.name,
    description: result.description,
    operationType: action.operationType,
    authenticated,
    inputSchema: action.inputSchema,
    outputSchema: action.outputSchema,
  };
}

export type SearchQuery =
  | {
      ok: true;
      q?: string;
      service?: string;
      limit: number;
      offset: number;
    }
  | {
      ok: false;
      message: string;
    };

/** One page of action search results plus the facts needed to request the next page. */
export interface ActionSearchPage {
  results: ActionSearchDocument[];
  total: number;
  hasMore: boolean;
  nextCursor?: string;
}

/**
 * Read `q`, `service`, `limit`, and an opaque `cursor`. A cursor carries the query, service, and offset of the
 * next page; `service` alone enumerates that service's actions without depending on keyword ranking.
 */
export function readSearchQuery(context: Context, defaultLimit: number = DEFAULT_ACTION_SEARCH_LIMIT): SearchQuery {
  const requestedQuery = optionalString(context.req.query("q") ?? context.req.query("query"));
  const requestedService = optionalString(context.req.query("service"));
  const rawCursor = optionalString(context.req.query("cursor"));
  const cursor = rawCursor ? decodeActionSearchCursor(rawCursor) : undefined;
  if (rawCursor && !cursor) return { ok: false, message: "cursor is invalid or expired." };
  if (cursor && requestedQuery !== undefined && requestedQuery !== cursor.query) {
    return { ok: false, message: "q must match the query encoded in cursor." };
  }
  if (cursor && requestedService !== undefined && requestedService !== cursor.service) {
    return { ok: false, message: "service must match the service encoded in cursor." };
  }
  const q = requestedQuery ?? cursor?.query;
  const service = requestedService ?? cursor?.service;
  if ((!q && !service) || (q?.length ?? 0) > 256) {
    return { ok: false, message: "Provide q (at most 256 characters) or service." };
  }

  const rawLimit = optionalString(context.req.query("limit"));
  const limit = rawLimit ? Number(rawLimit) : defaultLimit;
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_ACTION_SEARCH_LIMIT) {
    return { ok: false, message: `limit must be an integer between 1 and ${MAX_ACTION_SEARCH_LIMIT}.` };
  }
  return { ok: true, q, service, limit, offset: cursor?.offset ?? 0 };
}

/** Rank (or, without `q`, list) the matching catalog actions and cut one page from them. */
export async function searchActionPage(
  catalog: CatalogStore,
  actionSearch: ActionSearchIndexProvider,
  query: Extract<SearchQuery, { ok: true }>,
): Promise<ActionSearchPage> {
  const ranked = query.q
    ? searchActions(await actionSearch.get(), query.q, { service: query.service, limit: Number.MAX_SAFE_INTEGER })
    : catalog.actions
        .filter((action) => action.service === query.service)
        .map((action) => ({
          id: action.id,
          service: action.service,
          name: action.name,
          description: action.description,
        }));
  const valid = ranked.filter((result) => catalog.actionsById.has(result.id));
  const results = valid.slice(query.offset, query.offset + query.limit);
  const nextOffset = query.offset + results.length;
  const hasMore = nextOffset < valid.length;
  return {
    results,
    total: valid.length,
    hasMore,
    nextCursor: hasMore
      ? encodeActionSearchCursor({ offset: nextOffset, query: query.q, service: query.service })
      : undefined,
  };
}

export interface RuntimeCatalogRoutesOptions {
  catalog: CatalogStore;
  connections: ConnectionService;
  actionSearch: ActionSearchIndexProvider;
  oauthClientConfigs: OAuthClientConfigService;
  saasProject?: SaasProjectService;
}

/** Provider and action discovery, inspection and search routes under /v1. */
export function createRuntimeCatalogRoutes({
  catalog,
  connections,
  actionSearch,
  oauthClientConfigs,
  saasProject,
}: RuntimeCatalogRoutesOptions): Hono {
  const app = new Hono();

  const serializeSearchResults = async (results: ActionSearchDocument[]): Promise<RuntimeActionSearchResult[]> => {
    const authenticated = new Set(
      await connections.listAuthenticatedServices([...new Set(results.map((result) => result.service))]),
    );
    const items: RuntimeActionSearchResult[] = [];
    for (const result of results) {
      const action = await catalog.getAction(result.id);
      if (action) items.push(serializeActionSearchResult(result, action, authenticated.has(action.service)));
    }
    return items;
  };

  app.get("/providers/:service/setup", async (context) => {
    const service = context.req.param("service");
    const locale = catalogLocale(context);
    const provider = catalog.getProviderDisplay(locale).providers.find((p) => p.service === service);
    if (!provider) return writeRuntimeFailure(context, unknownServiceFailure(service));
    let oauth = provider.auth.some((auth) => auth.type === "oauth2")
      ? await oauthClientConfigs.getSummary(service)
      : undefined;
    const source = oauth ? await saasProject?.getSource(service) : undefined;
    if (oauth && source?.mode === "saas") {
      const { config } = await saasProject!.resolveConfig(
        service,
        source.providerConfigId,
        source.managedProjectId,
        context.req.raw.signal,
      );
      oauth = {
        ...oauth,
        configured: true,
        customClientAvailable: false,
        expectedRedirectUri: config.callbackUrl,
        missingFields: [],
      };
    }
    return writeRuntimeSuccess(context, serializeRuntimeProviderSetup(provider, oauth, locale));
  });

  app.get("/providers", (context) => {
    const services = context.req.queries("service") ?? [];
    const query = optionalString(context.req.query("q"))?.toLowerCase();
    const providers = catalog.getProviderDisplay(catalogLocale(context)).providers.filter((provider) => {
      if (services.length > 0 && !services.includes(provider.service)) {
        return false;
      }
      if (!query) {
        return true;
      }

      return [
        provider.service,
        provider.displayName,
        provider.categories.join(" "),
        Object.values(provider.categoryDisplayNames ?? {}).join(" "),
        provider.scenario,
        provider.authTypes.join(" "),
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });

    return writeRuntimeSuccess(context, providers.map(serializeRuntimeProvider));
  });

  app.get("/actions", async (context) => {
    const service = optionalString(context.req.query("service"));
    if (!service) {
      const services = [...new Set(catalog.actions.map((action) => action.service))];
      return writeRuntimeSuccess(context, services.map(serializeRuntimeActionService));
    }

    const actions = catalog.actions.filter((action) => action.service === service);
    const definitions = await Promise.all(actions.map((action) => catalog.getAction(action.id)));
    const results = [];
    for (const [index, definition] of definitions.entries()) {
      if (!definition) return writeRuntimeFailure(context, unknownActionFailure(actions[index]!.id));
      results.push(serializeRuntimeAction(definition));
    }
    return writeRuntimeSuccess(context, results);
  });

  app.get("/actions/search", async (context) => {
    const query = readSearchQuery(context, 10);
    if (!query.ok) {
      return writeRuntimeFailure(context, {
        status: 400,
        errorCode: "invalid_input",
        message: query.message,
      });
    }

    const page = await searchActionPage(catalog, actionSearch, query);
    return writeRuntimeSuccess(context, await serializeSearchResults(page.results), {
      total: page.total,
      count: page.results.length,
      hasMore: page.hasMore,
      nextCursor: page.nextCursor ?? null,
    });
  });

  app.get("/actions/:actionId", async (context) => {
    const actionId = context.req.param("actionId");
    const action = await catalog.getAction(actionId);
    if (!action) {
      return writeRuntimeFailure(context, unknownActionFailure(actionId));
    }

    return writeRuntimeSuccess(context, serializeRuntimeAction(action));
  });

  return app;
}
