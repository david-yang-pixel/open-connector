import type { ActionDefinition } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
const id = s.nonWhitespaceString("The resource ID.");
const limit = s.integer("Maximum number of results; the API defaults to 10.", { minimum: 1 });
const fields = s.string("Comma-separated response fields to include.");
const widgetData = s.record(
  "Widget configuration matching the widget type schema.",
  s.unknown("A widget configuration value."),
);
const widget = s.looseObject("Widget metadata and type-specific configuration.", {
  id: s.string("The widget ID."),
  name: s.string("The widget name."),
  description: s.string("The widget description."),
  type: s.string("The widget type ID."),
  projectId: s.string("The associated project ID."),
  status: s.string("The publication status."),
  modelVersion: s.integer("The widget data model version."),
  previewImage: s.string("The preview image URL."),
  created: s.string("The creation timestamp."),
  updated: s.string("The last update timestamp."),
  data: widgetData,
  embedCode: s.looseObject("HTML and script for embedding the widget.", {
    html: s.string("Widget container HTML."),
    script: s.string("SDK script tag; include once per page."),
  }),
  editorUrl: s.string("The widget editor URL."),
});
const widgetType = s.looseObject("Available widget type metadata.", {
  id: s.string("The widget type ID."),
  name: s.string("The widget type name."),
  slug: s.string("The widget type slug."),
  buttonText: s.string("The creation button label."),
  teaser: s.string("A short widget type description."),
  logo: s.string("The widget type logo URL."),
  promotionImage: s.string("The promotional image URL."),
  categories: s.array("Widget type categories.", s.string("A category name.")),
});
const project = s.looseObject("Project metadata.", {
  projectId: s.string("The project ID."),
  userId: s.string("The project owner ID."),
  name: s.string("The project name."),
  slug: s.string("The project slug."),
  domains: s.array("Associated domains.", s.string("A project domain.")),
  description: s.string("The project description."),
  thumbnail: s.string("The project thumbnail URL."),
  created: s.string("The creation timestamp."),
  updated: s.string("The last update timestamp."),
});
function listOutput(item: Record<string, unknown>) {
  return s.looseObject("Result list with upstream pagination metadata.", {
    docs: s.array("Returned resources.", item),
    total: s.integer("Total matching resources."),
    limit: s.integer("The result limit."),
    offset: s.integer("The result offset."),
    page: s.integer("The current page."),
    pages: s.integer("The total page count."),
  });
}
export const commonninjaActions: ActionDefinition[] = [
  defineProviderAction("commonninja", {
    name: "get_user",
    operationType: "read",
    description: "Get the authenticated Common Ninja account profile.",
    inputSchema: s.requiredObject("No input parameters are required.", {}),
    outputSchema: s.looseObject("Account profile.", {
      id: s.string("The account ID."),
      name: s.string("The account name."),
      email: s.string("The account email address."),
    }),
  }),
  defineProviderAction("commonninja", {
    name: "list_widgets",
    operationType: "read",
    description:
      "List Common Ninja widgets with optional filters. Results exclude widget configuration; use get_widget to read it. Only documented list filters are supported; automatic pagination is not available.",
    inputSchema: s.object(
      "Widget list filters.",
      {
        limit,
        fields,
        projectId: s.string("Filter by project ID."),
        search: s.string("Filter by widget search query."),
        type: s.string("Filter by widget type ID."),
      },
      {
        required: [],
      },
    ),
    outputSchema: listOutput(widget),
  }),
  defineProviderAction("commonninja", {
    name: "get_widget",
    operationType: "read",
    description: "Get a Common Ninja widget, including its type-specific configuration.",
    inputSchema: s.requiredObject("Widget lookup input.", { id }),
    outputSchema: widget,
  }),
  defineProviderAction("commonninja", {
    name: "create_widget",
    operationType: "write",
    description:
      "Create a Common Ninja widget. Choose draft or published explicitly. Omit data to use the type defaults, or obtain its configuration schema with get_widget_type_schema.",
    inputSchema: s.object(
      "New widget parameters.",
      {
        type: s.nonWhitespaceString("The widget type ID."),
        name: s.nonWhitespaceString("The widget name."),
        status: s.stringEnum("The publication status.", ["draft", "published"]),
        data: widgetData,
        description: s.string("The widget description."),
        projectId: s.nonWhitespaceString("The associated project ID."),
        modelVersion: s.integer("The widget data model version; omitted uses the latest version."),
      },
      {
        optional: ["data", "description", "projectId", "modelVersion"],
      },
    ),
    outputSchema: widget,
  }),
  defineProviderAction("commonninja", {
    name: "update_widget",
    operationType: "write",
    description:
      "Update selected Common Ninja widget fields. Omitted fields remain unchanged; configuration must match the widget type schema.",
    inputSchema: s.object(
      "Widget update parameters.",
      {
        id,
        name: s.string("The widget name."),
        description: s.string("The widget description."),
        status: s.stringEnum("The publication status.", ["draft", "published"]),
        data: widgetData,
      },
      {
        optional: ["name", "description", "status", "data"],
      },
    ),
    outputSchema: widget,
  }),
  defineProviderAction("commonninja", {
    name: "delete_widget",
    operationType: "destructive",
    description: "Delete a Common Ninja widget. Set permanent to true only when it must be irrecoverably removed.",
    inputSchema: s.object(
      "Widget deletion input.",
      { id, permanent: s.boolean("Permanently delete the widget; the API defaults to false.") },
      {
        optional: ["permanent"],
      },
    ),
    outputSchema: s.looseObject("Deletion response; the API normally returns an empty object.", {}),
  }),
  defineProviderAction("commonninja", {
    name: "get_widget_embed_code",
    operationType: "read",
    description: "Get the HTML container and SDK script for embedding a Common Ninja widget.",
    inputSchema: s.requiredObject("Widget lookup input.", { id }),
    outputSchema: s.looseObject("HTML and script for embedding the widget.", {
      html: s.string("Widget container HTML."),
      script: s.string("SDK script tag; include once per page."),
    }),
  }),
  defineProviderAction("commonninja", {
    name: "get_widget_editor_url",
    operationType: "read",
    description: "Get a Common Ninja widget editor URL, which can be embedded in an iframe.",
    inputSchema: s.requiredObject("Widget lookup input.", { id }),
    outputSchema: s.looseObject("Widget editor link.", { url: s.string("The widget editor URL.") }),
  }),
  defineProviderAction("commonninja", {
    name: "list_widget_types",
    operationType: "read",
    description:
      "List Common Ninja widget types. Only documented limit and field selection are supported; automatic pagination is not available.",
    inputSchema: s.object(
      "Widget type list options.",
      { limit, fields },
      {
        required: [],
      },
    ),
    outputSchema: listOutput(widgetType),
  }),
  defineProviderAction("commonninja", {
    name: "get_widget_type",
    operationType: "read",
    description: "Get metadata for a Common Ninja widget type.",
    inputSchema: s.requiredObject("Widget type lookup input.", { id }),
    outputSchema: widgetType,
  }),
  defineProviderAction("commonninja", {
    name: "get_widget_type_schema",
    operationType: "read",
    description: "Get the JSON Schema for a Common Ninja widget type before supplying widget configuration.",
    inputSchema: s.requiredObject("Widget type lookup input.", { id }),
    outputSchema: s.looseObject("Type-specific JSON Schema, including upstream references and definitions.", {
      $id: s.string("The schema identifier."),
      $schema: s.string("The JSON Schema dialect URI."),
      properties: s.record("Schema properties.", s.unknown("An upstream property schema.")),
      definitions: s.record("Reusable schema definitions.", s.unknown("An upstream schema definition.")),
      allOf: s.array("Schemas combined by intersection.", s.unknown("An upstream schema or reference.")),
    }),
  }),
  defineProviderAction("commonninja", {
    name: "list_projects",
    operationType: "read",
    description:
      "List Common Ninja projects. Only the documented limit is supported; automatic pagination is not available.",
    inputSchema: s.object(
      "Project list options.",
      { limit },
      {
        required: [],
      },
    ),
    outputSchema: listOutput(project),
  }),
  defineProviderAction("commonninja", {
    name: "get_project",
    operationType: "read",
    description: "Get a Common Ninja project by ID.",
    inputSchema: s.requiredObject("Project lookup input.", { id }),
    outputSchema: project,
  }),
];
