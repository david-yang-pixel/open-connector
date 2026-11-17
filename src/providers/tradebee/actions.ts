import type { ActionDefinition } from "../../core/types.ts";

import { jsonSchema as s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
const language = s.nonWhitespaceString("An enabled site language code returned by list_languages.");
const id = {
  type: ["integer", "string"],
  description: "The resource ID, returned as an integer or string by Tradebee.",
};
const paginationInput = s.object(
  "Pagination; omitted values default to page 1 and 5 items.",
  {
    current_page: s.integer("Page number, starting at 1.", { minimum: 1 }),
    page_size: s.integer("Items per page, from 1 to 10.", { minimum: 1, maximum: 10 }),
  },
  { optional: ["current_page", "page_size"] },
);
const paginationOutput = s.looseObject("Pagination returned by Tradebee; use next_page while has_next_page is true.", {
  current_page: s.integer("The current page number."),
  page_size: s.integer("The returned page size."),
  total_page: s.integer("The total number of pages."),
  total_count: s.integer("The total number of matching records."),
  has_next_page: s.boolean("Whether another page is available."),
  next_page: s.nullable(s.integer("The next page number, or null on the last page.")),
});
const commonFields = {
  language: s.string("The site language code."),
  tags: s.array("Resource keywords.", s.string("A keyword.")),
  seo: s.looseObject("Search engine metadata.", {
    title: s.string("The SEO title."),
    description: s.string("The SEO description."),
    keywords: s.string("Comma-separated SEO keywords."),
  }),
  create_time: s.string("The creation time as returned by Tradebee."),
  update_time: s.string("The last update time as returned by Tradebee."),
};
const productFields = {
  products_id: id,
  ...commonFields,
  group: s.looseObject("The product group.", {
    productsgroup_id: id,
    group_name: s.string("The group name."),
  }),
  product_name: s.string("The product name."),
  model: s.string("The product model."),
  images: s.array("Product image URLs.", s.string("An image URL.")),
  attributes: s.array(
    "Product attributes.",
    s.looseObject("A product attribute.", {
      name: s.string("The attribute name."),
      value: s.string("The attribute value."),
    }),
  ),
  brief_description: s.string("A short product description."),
  description: s.string("The product HTML description."),
  view_count: s.integer("The product view count."),
  inquiry_count: s.integer("The product inquiry count."),
  products_url: s.string("The product page URL."),
};
const productGroupFields = {
  productsgroup_id: id,
  ...commonFields,
  group_name: s.string("The group name."),
  productsgroup_url: s.string("The product group page URL."),
  section: s.looseObject("HTML sections of the product group page.", {
    top: s.string("The header HTML fragment."),
    bottom: s.string("The footer HTML fragment."),
  }),
  is_leaf: s.boolean("Whether the group has no child groups."),
  children: s.array(
    "Recursive child groups, preserving provider-defined fields.",
    s.looseObject("A child product group.", {}),
  ),
};
const blogFields = {
  blog_id: id,
  ...commonFields,
  group: s.looseObject("The blog group.", {
    bloggroup_id: id,
    group_name: s.string("The group name."),
  }),
  publisher: s.string("The publisher name."),
  publication_date: s.string("The publication date as returned by Tradebee."),
  title: s.string("The blog title."),
  images: s.array("Blog cover image URLs.", s.string("An image URL.")),
  summary: s.string("The blog summary."),
  description: s.string("The blog HTML body."),
  blog_url: s.string("The blog page URL."),
};
const blogGroupFields = {
  bloggroup_id: id,
  ...commonFields,
  group_name: s.string("The group name."),
  brief_description: s.string("A short blog group description."),
  bloggroup_url: s.string("The blog group page URL."),
};
function fieldsInput(fields: Record<string, unknown>) {
  return s.array(
    "Return only these fields; omit to use the provider defaults.",
    s.stringEnum("A documented response field.", Object.keys(fields)),
  );
}
export const tradebeeActions: ActionDefinition[] = [
  defineProviderAction("tradebee", {
    name: "list_languages",
    operationType: "read",
    requiredScopes: [],
    description: "List the enabled Tradebee site languages before querying products or blogs.",
    inputSchema: s.requiredObject("No input parameters are required.", {}),
    outputSchema: s.looseRequiredObject("Enabled site languages.", {
      list: s.array(
        "The enabled languages.",
        s.looseObject("An enabled language.", {
          name: s.string("The language display name."),
          language: s.string("The site language code."),
        }),
      ),
    }),
  }),
  defineProviderAction("tradebee", {
    name: "list_products",
    operationType: "read",
    requiredScopes: [],
    description:
      "Read Tradebee products in an enabled language, optionally by product or group. Filters are mutually exclusive. Follow pagination.next_page to continue.",
    inputSchema: {
      ...s.object(
        "Product query.",
        {
          language,
          products_id: s.integer("Filter by product ID; cannot be combined with productsgroup_id."),
          productsgroup_id: s.integer("Filter by product group ID; cannot be combined with products_id."),
          fields: fieldsInput(productFields),
          pagination: paginationInput,
        },
        { optional: ["products_id", "productsgroup_id", "fields", "pagination"] },
      ),
      not: { required: ["products_id", "productsgroup_id"] },
    },
    outputSchema: s.looseRequiredObject("A page of products with selected fields.", {
      list: s.array("Products on this page.", s.looseObject("A product with the selected fields.", productFields)),
      pagination: paginationOutput,
    }),
  }),
  defineProviderAction("tradebee", {
    name: "list_product_groups",
    operationType: "read",
    requiredScopes: [],
    description:
      "Read Tradebee product groups and their children. Omit both filters for top-level groups, or select one group or parent. This endpoint is not paginated.",
    inputSchema: {
      ...s.object(
        "Product group query.",
        {
          language,
          productsgroup_id: s.integer("Read one product group; cannot be combined with parent_productsgroup_id."),
          parent_productsgroup_id: s.integer(
            "Read children of this group; 0 selects top-level groups. Cannot be combined with productsgroup_id.",
          ),
          fields: fieldsInput(productGroupFields),
        },
        { optional: ["productsgroup_id", "parent_productsgroup_id", "fields"] },
      ),
      not: { required: ["productsgroup_id", "parent_productsgroup_id"] },
    },
    outputSchema: s.looseRequiredObject("Product group hierarchy with selected fields.", {
      list: s.array("Product groups.", s.looseObject("A product group with the selected fields.", productGroupFields)),
    }),
  }),
  defineProviderAction("tradebee", {
    name: "list_blogs",
    operationType: "read",
    requiredScopes: [],
    description:
      "Read Tradebee blogs in an enabled language, optionally by blog or group. Filters are mutually exclusive. Follow pagination.next_page to continue.",
    inputSchema: {
      ...s.object(
        "Blog query.",
        {
          language,
          blog_id: s.integer("Filter by blog ID; cannot be combined with bloggroup_id."),
          bloggroup_id: s.integer("Filter by blog group ID; cannot be combined with blog_id."),
          fields: fieldsInput(blogFields),
          pagination: paginationInput,
        },
        { optional: ["blog_id", "bloggroup_id", "fields", "pagination"] },
      ),
      not: { required: ["blog_id", "bloggroup_id"] },
    },
    outputSchema: s.looseRequiredObject("A page of blogs with selected fields.", {
      list: s.array("Blogs on this page.", s.looseObject("A blog with the selected fields.", blogFields)),
      pagination: paginationOutput,
    }),
  }),
  defineProviderAction("tradebee", {
    name: "list_blog_groups",
    operationType: "read",
    requiredScopes: [],
    description:
      "Read Tradebee blog groups in an enabled language, optionally selecting one group. Follow pagination.next_page to continue.",
    inputSchema: s.object(
      "Blog group query.",
      {
        language,
        bloggroup_id: s.integer("Read one blog group; omit to list all blog groups."),
        fields: fieldsInput(blogGroupFields),
        pagination: paginationInput,
      },
      { optional: ["bloggroup_id", "fields", "pagination"] },
    ),
    outputSchema: s.looseRequiredObject("A page of blog groups with selected fields.", {
      list: s.array(
        "Blog groups on this page.",
        s.looseObject("A blog group with the selected fields.", blogGroupFields),
      ),
      pagination: paginationOutput,
    }),
  }),
];
