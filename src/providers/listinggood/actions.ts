import type { ActionDefinition } from "../../core/types.ts";

import { jsonSchema as s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
const service = "listinggood";
const lang = s.stringEnum("Report language. Defaults to en.", ["en", "zh"]);
const result = s.requiredObject("The ListingGood response.", {
  result: s.looseObject("The upstream JSON result, including provider-defined fields."),
});
const productFields = {
  category: s.string("Product category name."),
  category_code: s.string("ListingGood category code, when known."),
  brand: s.string("Product brand."),
  gender: s.string("Intended audience or gender."),
  price: s.string("Product price, optionally including the currency."),
  material_main: s.string("Main product material."),
  material_lining: s.string("Lining material."),
  sizes: s.string("Available sizes."),
  colors: s.string("Available colors."),
  season: s.string("Intended seasons."),
  occasion: s.string("Intended occasions."),
  keywords: s.string("Target search keywords."),
  note: s.string("Additional factual product details."),
  diff: s.string("Product differentiators."),
  selling_points: s.array("Factual product selling points.", s.string("One selling point.")),
  lang,
};
export const listinggoodActions: ActionDefinition[] = [
  defineProviderAction(service, {
    name: "ai_readiness_check",
    operationType: "read",
    requiredScopes: [],
    description:
      "Check listing copy for AI readability and compliance signals without submitting lead contact details.",
    inputSchema: s.object(
      "Listing copy to check.",
      {
        text: s.nonEmptyString("Listing title, bullets and description as plain text."),
        marketplace: s.nonEmptyString("Marketplace code, such as US or DE. Defaults to US."),
        lang,
      },
      { optional: ["marketplace", "lang"] },
    ),
    outputSchema: result,
  }),
  defineProviderAction(service, {
    name: "compliance_check",
    operationType: "read",
    requiredScopes: [],
    description: "Run a quick pre-publication check for risky listing terms and category issues.",
    inputSchema: s.object(
      "Listing copy for a quick check.",
      {
        text: s.nonEmptyString("Listing copy to check."),
        category: s.string("Optional category hint, such as electronics or apparel."),
        lang,
      },
      { optional: ["category", "lang"] },
    ),
    outputSchema: result,
  }),
  defineProviderAction(service, {
    name: "fill_from_sentence",
    operationType: "read",
    requiredScopes: [],
    description: "Expand a short product description into structured fields for listing generation.",
    inputSchema: s.object(
      "Product description to structure.",
      {
        sentence: s.string("Product description containing 4 to 1000 characters.", {
          minLength: 4,
          maxLength: 1000,
        }),
        lang,
      },
      { optional: ["lang"] },
    ),
    outputSchema: result,
  }),
  defineProviderAction(service, {
    name: "generate_listing",
    operationType: "write",
    requiredScopes: [],
    description:
      "Submit a text-based listing generation task for explicitly selected marketplaces. Uses account credits and saves generated copy in ListingGood; does not publish to Amazon.",
    asyncLifecycle: { startActionId: "listinggood.generate_listing", statusActionId: "listinggood.get_task" },
    inputSchema: s.object(
      "Text-based listing generation parameters.",
      {
        cn_name: s.nonEmptyString("Product name; the upstream field is named cn_name."),
        sku: s.nonEmptyString("Product SKU."),
        marketplaces: s.array(
          "Marketplace codes to generate for. Select explicitly to avoid generating for every marketplace.",
          s.nonEmptyString("Marketplace code, such as US, UK or DE."),
          { minItems: 1, uniqueItems: true },
        ),
        ...productFields,
      },
      { optional: Object.keys(productFields) },
    ),
    outputSchema: s.looseRequiredObject("Accepted generation task and upstream metadata.", {
      task_id: s.nonEmptyString("Task identifier for get_task."),
    }),
  }),
  defineProviderAction(service, {
    name: "get_task",
    operationType: "read",
    requiredScopes: [],
    description: "Retrieve a ListingGood task and its generated result, preserving upstream status and metadata.",
    asyncLifecycle: { startActionId: "listinggood.generate_listing", statusActionId: "listinggood.get_task" },
    inputSchema: s.requiredObject("Task lookup parameters.", {
      task_id: s.nonEmptyString("Task identifier returned by generate_listing."),
    }),
    outputSchema: s.requiredObject("Task state and full upstream response.", {
      status: s.stringEnum("Normalized task state.", ["pending", "succeeded", "failed"]),
      task: s.looseObject("Upstream task with status, progress, message, result or error."),
    }),
  }),
];
