import type { SansanContext } from "./request.ts";

import { providerInputError } from "../provider-runtime.ts";
import { normalizeSansanPage, requestSansanJson, sansanPageQuery, sansanPathId } from "./request.ts";
const actionRoutes: Record<string, { path: string; idField?: string; list?: boolean }> = {
  get_current_user: { path: "/me" },
  list_business_cards: { path: "/bizCards", list: true },
  search_business_cards: { path: "/bizCards/search", list: true },
  get_business_card: { path: "/bizCards/{id}", idField: "businessCardId" },
  get_person: { path: "/persons/{id}", idField: "personId" },
  list_business_card_tags: { path: "/bizCards/{id}/tags", idField: "businessCardId", list: true },
  list_tags: { path: "/tags", list: true },
  list_contact_reports: { path: "/reports", list: true },
};
export async function executeSansanRead(
  name: string,
  input: Record<string, unknown>,
  context: SansanContext,
): Promise<Record<string, unknown>> {
  const route = actionRoutes[name];
  if (!route) throw providerInputError(`Unknown Sansan read action: ${name}`);
  const query = { ...input };
  let path = route.path;
  if (route.idField) {
    path = path.replace("{id}", sansanPathId(query[route.idField], route.idField));
    delete query[route.idField];
  }
  const result = await requestSansanJson(path, { query: sansanPageQuery(query) }, context);
  return route.list ? normalizeSansanPage(result) : result;
}
