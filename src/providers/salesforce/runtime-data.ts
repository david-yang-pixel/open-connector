import type { SalesforceHandler } from "./context.ts";

import { recordOrEmpty } from "../../core/cast.ts";
import { providerInputError } from "../provider-runtime.ts";
import { requiredResponseRecord } from "../provider-runtime.ts";
import { queryPath, segment } from "./context.ts";
import { salesforceRequest, salesforceOrigin } from "./transport.ts";

function rejectReservedFields(fields: Record<string, unknown>) {
  if (Object.keys(fields).some((key) => ["attributes", "id"].includes(key.toLowerCase())))
    throw providerInputError("Use recordId and objectName instead of fields.Id or fields.attributes");
}
function validateComposite(requests: Record<string, unknown>[], graph: boolean) {
  const references = new Set<string>();
  let collectionQueries = 0;
  for (const request of requests) {
    if (
      Object.keys(recordOrEmpty(request.httpHeaders)).some((header) =>
        ["accept", "authorization", "content-type"].includes(header.toLowerCase()),
      )
    )
      throw providerInputError(
        "Composite subrequests inherit Accept, Authorization and Content-Type; do not override them",
      );
    const ref = String(request.referenceId);
    if (references.has(ref)) throw providerInputError("Composite reference IDs must be unique");
    references.add(ref);
    const path = String(request.url);
    const resourcePath = path.split("?")[0]!;
    const parts = resourcePath.split("/");
    if (
      !path.startsWith("/services/data/v") ||
      parts.length < 5 ||
      path.includes("\\") ||
      path.includes("#") ||
      parts.slice(4).some((part) => {
        try {
          const decoded = decodeURIComponent(part);
          return decoded === "." || decoded === "..";
        } catch {
          return true;
        }
      })
    )
      throw providerInputError("Invalid composite resource URL");
    const resource = parts[4]?.split("?")[0];
    const collection = resource === "composite" && parts[5]?.split("?")[0] === "sobjects";
    if (resource !== "sobjects" && (graph || (!collection && resource !== "query" && resource !== "queryAll")))
      throw providerInputError("Resource is not supported by Salesforce Composite");
    if (collection || resource === "query" || resource === "queryAll") collectionQueries++;
  }
  if (!graph && collectionQueries > 5) throw providerInputError("Composite allows at most five queries or collections");
}
function validateTree(records: unknown[], rootType: string) {
  let count = 0;
  const types = new Set<string>();
  const refs = new Set<string>();
  function visit(nodes: unknown[], depth: number, root: boolean) {
    if (depth > 5) throw providerInputError("Record trees support at most five levels");
    for (const node of nodes) {
      const record = recordOrEmpty(node);
      const attrs = recordOrEmpty(record.attributes);
      if (
        typeof attrs.type !== "string" ||
        typeof attrs.referenceId !== "string" ||
        !attrs.referenceId ||
        (root && attrs.type !== rootType)
      )
        throw providerInputError(
          "Tree records require attributes.type and referenceId; root type must match objectName",
        );
      if (refs.has(attrs.referenceId)) throw providerInputError("Tree reference IDs must be unique");
      refs.add(attrs.referenceId);
      types.add(attrs.type);
      count++;
      if (count > 200 || types.size > 5)
        throw providerInputError("Record trees allow 200 records and five object types");
      for (const value of Object.values(record)) {
        const nested = recordOrEmpty(value);
        if (Array.isArray(nested.records)) visit(nested.records, depth + 1, false);
      }
    }
  }
  visit(records, 1, true);
}

export const salesforceDataHandlers: Record<string, SalesforceHandler> = {
  async search_records(d, c) {
    return c.object(queryPath(`${c.base}/search`, { q: d.sosl }));
  },
  async parameterized_search(d, c) {
    return c.object(`${c.base}/parameterizedSearch`, "POST", d.request);
  },
  async get_record_by_external_id(d, c) {
    return {
      record: await c.object(
        queryPath(
          `${c.base}/sobjects/${segment(d.objectName)}/${segment(d.externalIdField)}/${segment(d.externalId)}`,
          { fields: d.fields },
        ),
      ),
    };
  },
  async get_related_records(d, c) {
    return {
      result: await c.request(
        queryPath(
          `${c.base}/sobjects/${segment(d.objectName)}/${segment(d.recordId)}/${(d.relationships as string[]).map(segment).join("/")}`,
          { fields: d.fields },
        ),
      ),
    };
  },
  async list_updated_records(d, c) {
    validateWindow(d);
    return c.object(
      queryPath(`${c.base}/sobjects/${segment(d.objectName)}/updated/`, {
        start: d.start,
        end: d.end,
      }),
    );
  },
  async list_deleted_records(d, c) {
    validateWindow(d);
    return c.object(
      queryPath(`${c.base}/sobjects/${segment(d.objectName)}/deleted/`, {
        start: d.start,
        end: d.end,
      }),
    );
  },
  async get_record_counts(d, c) {
    return c.object(queryPath(`${c.base}/limits/recordCount`, { sObjects: d.objectNames }));
  },
  async get_records(d, c) {
    return c.items(`${c.base}/composite/sobjects/${segment(d.objectName)}`, "POST", {
      recordIds: d.recordIds,
      fieldNames: d.fields,
    });
  },
  async create_records(d, c) {
    return collectionWrite(d, c, false);
  },
  async update_records(d, c) {
    return collectionWrite(d, c, true);
  },
  async upsert_records(d, c) {
    const records = (d.records as Record<string, unknown>[]).map((fields) => {
      rejectReservedFields(fields);
      if (!Object.hasOwn(fields, String(d.externalIdField)))
        throw providerInputError("Each upsert record must contain the external ID field");
      return { ...fields, attributes: { type: d.objectName } };
    });
    return c.items(`${c.base}/composite/sobjects/${segment(d.objectName)}/${segment(d.externalIdField)}`, "PATCH", {
      records,
      allOrNone: d.allOrNone,
    });
  },
  async delete_records(d, c) {
    return c.items(queryPath(`${c.base}/composite/sobjects`, { ids: d.recordIds, allOrNone: d.allOrNone }), "DELETE");
  },
  async create_record_tree(d, c) {
    validateTree(d.records as unknown[], String(d.objectName));
    return c.object(`${c.base}/composite/tree/${segment(d.objectName)}`, "POST", {
      records: d.records,
    });
  },
  async execute_composite(d, c) {
    validateComposite(d.requests as Record<string, unknown>[], false);
    return c.object(`${c.base}/composite`, "POST", {
      compositeRequest: d.requests,
      allOrNone: d.allOrNone,
      collateSubrequests: d.collateSubrequests,
    });
  },
  async execute_composite_graph(d, c) {
    const graphs = d.graphs as { graphId: string; compositeRequest: Record<string, unknown>[] }[];
    if (
      new Set(graphs.map((g) => g.graphId)).size !== graphs.length ||
      graphs.reduce((sum, g) => sum + g.compositeRequest.length, 0) > 500
    )
      throw providerInputError("Graphs require unique IDs and at most 500 total subrequests");
    for (const graph of graphs) validateComposite(graph.compositeRequest, true);
    return c.object(`${c.base}/composite/graph`, "POST", { graphs });
  },
  async list_list_views(d, c) {
    return c.object(`${c.base}/sobjects/${segment(d.objectName)}/listviews`);
  },
  async describe_list_view(d, c) {
    return c.object(`${c.base}/sobjects/${segment(d.objectName)}/listviews/${segment(d.listViewId)}/describe`);
  },
  async get_list_view_records(d, c) {
    return c.object(
      queryPath(`${c.base}/sobjects/${segment(d.objectName)}/listviews/${segment(d.listViewId)}/results`, {
        limit: d.limit,
        offset: d.offset,
      }),
    );
  },
  async get_picklist_values(d, c) {
    return c.object(`${c.base}/ui-api/object-info/${segment(d.objectName)}/picklist-values/${segment(d.recordTypeId)}`);
  },
  async get_current_user(_d, c) {
    const url = new URL(String(c.providerSecret?.identityUrl));
    salesforceOrigin(url.origin, "identityUrl");
    return {
      user: requiredResponseRecord(
        (await salesforceRequest(url, { headers: { authorization: `Bearer ${c.accessToken}` } }, c.fetcher, c.signal))
          .body,
        "Salesforce identity",
      ),
    };
  },
  async get_org_limits(_d, c) {
    return { limits: await c.object(`${c.base}/limits`) };
  },
};
function validateWindow(d: Record<string, unknown>) {
  if (Date.parse(String(d.start)) >= Date.parse(String(d.end))) throw providerInputError("start must precede end");
}
async function collectionWrite(d: Record<string, unknown>, c: Parameters<SalesforceHandler>[1], update: boolean) {
  const records = (d.records as Record<string, unknown>[]).map((entry) => {
    const fields = recordOrEmpty(entry.fields);
    rejectReservedFields(fields);
    return {
      ...fields,
      attributes: { type: entry.objectName },
      Id: update ? entry.recordId : undefined,
    };
  });
  return c.items(`${c.base}/composite/sobjects`, update ? "PATCH" : "POST", {
    records,
    allOrNone: d.allOrNone,
  });
}
