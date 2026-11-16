import type { ActionDefinition } from "../../core/types.ts";

import { jsonSchema as s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
export const tapdFamilies: Array<{ name: string; path: string; wrapper: string; filters: string }> = [
  {
    name: "stories",
    path: "stories",
    wrapper: "Story",
    filters:
      "id, name, status, owner, iteration_id, priority_label, created, modified, custom_field_* and custom_plan_field_*",
  },
  {
    name: "bugs",
    path: "bugs",
    wrapper: "Bug",
    filters:
      "id, title, status, severity, current_owner, iteration_id, module, priority_label, created, modified, custom_field_* and custom_plan_field_*",
  },
  {
    name: "tasks",
    path: "tasks",
    wrapper: "Task",
    filters: "id, name, status, owner, story_id, iteration_id, priority_label, created, modified and custom_field_*",
  },
  {
    name: "iterations",
    path: "iterations",
    wrapper: "Iteration",
    filters:
      "id, name, status, creator, startdate, enddate, workitem_type_id, plan_app_id, created, modified and custom_field_*",
  },
  {
    name: "wikis",
    path: "tapd_wikis",
    wrapper: "Wiki",
    filters: "name, modifier, creator, note, view_count, created and modified; id is supported only by list_wikis",
  },
];
const workspaceId = s.nonEmptyString("TAPD project ID, supplied as a string to preserve precision.");
const itemsOutput = s.requiredObject("Requested TAPD records.", {
  items: s.array(
    "Records with the TAPD entity wrapper removed.",
    s.looseObject("TAPD record, including custom fields and future upstream fields."),
  ),
});
export const tapdActions: ActionDefinition[] = [
  defineProviderAction("tapd", {
    name: "list_projects",
    operationType: "read",
    requiredScopes: [],
    description: "List all projects in a TAPD company. This endpoint does not paginate.",
    inputSchema: s.requiredObject("Company project query.", {
      company_id: s.nonEmptyString("TAPD company ID."),
      category: s.optional(
        s.string("Project categories, comma-separated: organization, product, project, mini_project or program."),
      ),
      with_extends: s.optional(s.integer("Set to 1 to include custom project fields.", { minimum: 0, maximum: 1 })),
    }),
    outputSchema: itemsOutput,
  }),
  defineProviderAction("tapd", {
    name: "get_project",
    operationType: "read",
    requiredScopes: [],
    description: "Retrieve a TAPD project by its workspace ID.",
    inputSchema: s.requiredObject("Project lookup.", { workspace_id: workspaceId }),
    outputSchema: s.requiredObject("Project lookup result.", {
      project: s.looseObject("TAPD project, including its ID, name and provider-defined fields."),
    }),
  }),
];
for (const family of tapdFamilies) {
  const filters = s.optional(
    s.record(
      `Official TAPD query filters, including ${family.filters}. Values use upstream query syntax, such as comma-separated IDs or >2026-01-01 timestamps. Do not pre-encode values. Pagination, fields, order, workspace_id and format cannot be set here.`,
      s.string("Upstream filter value; use strings for IDs, numbers and date expressions."),
    ),
  );
  tapdActions.push(
    defineProviderAction("tapd", {
      name: `list_${family.name}`,
      operationType: "read",
      requiredScopes: [],
      description: `Query one page of TAPD ${family.name}. Filter by id to retrieve specific records. Continue with the next page until an empty page is returned.`,
      inputSchema: s.requiredObject("Paginated project records query.", {
        workspace_id: workspaceId,
        filters,
        page: s.optional(s.integer("Page number, starting at 1. Defaults to 1.", { minimum: 1 })),
        limit: s.optional(s.integer("Records per page. Defaults to 30; maximum 200.", { minimum: 1, maximum: 200 })),
        fields: s.optional(s.nonEmptyString("Comma-separated upstream field names to return.")),
        order: s.optional(s.nonEmptyString("Upstream sort expression, for example created desc. Do not URL-encode.")),
      }),
      outputSchema: itemsOutput,
    }),
    defineProviderAction("tapd", {
      name: `count_${family.name}`,
      operationType: "read",
      requiredScopes: [],
      description: `Count TAPD ${family.name} matching the supplied project and filters.`,
      inputSchema: s.requiredObject("Project records count query.", { workspace_id: workspaceId, filters }),
      outputSchema: s.requiredObject("Matching record count.", {
        count: s.integer("Number of matching records.", { minimum: 0 }),
      }),
    }),
  );
}
