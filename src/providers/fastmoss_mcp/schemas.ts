import type { JsonSchema } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";

export const resultSchema: JsonSchema = s.object(
  "The FastMoss MCP tool result.",
  {
    result: s.unknown(
      "Structured MCP content when available; otherwise the complete MCP content envelope. Data availability and Credits depend on the connected FastMoss account.",
    ),
  },
  { required: ["result"] },
);

export const pagination: { orderby: JsonSchema; page: JsonSchema; pagesize: JsonSchema } = {
  orderby: s.array("Sort options.", s.unknown("An item accepted by the live FastMoss tool schema.")),
  page: s.integer("Page number. Default 1, max 10.", { minimum: 1, maximum: 10 }),
  pagesize: s.integer("Page size. Default 10, max 10.", { minimum: 1, maximum: 10 }),
};
export const dateFields: { start_date: JsonSchema; end_date: JsonSchema } = {
  start_date: s.string("Start date, YYYY-MM-DD."),
  end_date: s.string("End date, YYYY-MM-DD."),
};
export const periodFields: { start_date: JsonSchema; end_date: JsonSchema; time_range_days: JsonSchema } = {
  ...dateFields,
  time_range_days: s.integer("Days: 7/14/28/90; recent=28; -1=cumulative."),
};
export const rankingFields: { date_type: JsonSchema; date_value: JsonSchema } = {
  date_type: s.string("Ranking period: day, week, or month; MCN agency rankings support only week/month."),
  date_value: s.string(
    "Completed period only: yesterday YYYY-MM-DD, last week YYYY-ww or YYYY-Www, last month YYYY-MM; do not use the current period.",
  ),
};
export const bounds: { min: JsonSchema; max: JsonSchema } = {
  min: s.number("Minimum value."),
  max: s.number("Maximum value."),
};
export const fields: {
  product_id: JsonSchema;
  uid: JsonSchema;
  seller_id: JsonSchema;
  video_id: JsonSchema;
  agency_id: JsonSchema;
  room_id: JsonSchema;
  region: JsonSchema;
  category_id: JsonSchema;
  product_category_id: JsonSchema;
  creator_category_id: JsonSchema;
  category_path: JsonSchema;
  keywords: JsonSchema;
  lang: JsonSchema;
  shop_type: JsonSchema;
  is_cross_border: JsonSchema;
  is_fully_managed: JsonSchema;
  is_ad: JsonSchema;
  follower_count_range: JsonSchema;
  create_time_range: JsonSchema;
  play_count_range: JsonSchema;
} = {
  product_id: s.string("Product ID; use product_search first if only a product name is known."),
  uid: s.string("Creator UID; use creator_search first if only a handle/nickname is known."),
  seller_id: s.string("Shop seller_id; use shop_search first if only a shop name is known."),
  video_id: s.string("Video ID; use video_search first if only a title/creator is known."),
  agency_id: s.string("Unique MCN agency ID; use agency_search first when only the agency name is known."),
  room_id: s.string("Live room ID."),
  region: s.string("Country or region code, e.g. US, UK, ID."),
  category_id: s.integer("Category ID; confirm category first if only a category name is known."),
  product_category_id: s.integer("Product category ID."),
  creator_category_id: s.integer("Creator category ID."),
  category_path: s.array(
    "Category path from level 1 to level 3, e.g. [100, 200, 300].",
    s.unknown("An item accepted by the live FastMoss tool schema."),
  ),
  keywords: s.string("Search keywords: product, shop, creator, video, live, or category terms."),
  lang: s.string("Language. Default EN_US, optional ZH_CN."),
  shop_type: s.integer("Shop type: 1 brand shop, 2 retail shop."),
  is_cross_border: s.boolean("Whether it is cross-border."),
  is_fully_managed: s.boolean("Whether it is fully managed."),
  is_ad: s.boolean("Whether it uses ad traffic."),
  follower_count_range: s.object("Follower count range.", bounds, { required: [] }),
  create_time_range: s.object("Creation or publish time range in Unix timestamps.", bounds, { required: [] }),
  play_count_range: s.object("Video play-count range.", bounds, { required: [] }),
};
export const productFilter: JsonSchema = s.object(
  "Filter parameters.",
  { product_id: fields.product_id },
  { required: ["product_id"] },
);
export const creatorFilter: JsonSchema = s.object("Filter parameters.", { uid: fields.uid }, { required: ["uid"] });
export const shopPeriodFilter: JsonSchema = s.object(
  "Filter parameters.",
  { seller_id: fields.seller_id, ...periodFields },
  { required: ["seller_id"] },
);
export const videoPeriodFilter: JsonSchema = s.object(
  "Filter parameters.",
  { video_id: fields.video_id, ...periodFields },
  { required: ["video_id"] },
);
export const agencyFilter: JsonSchema = s.object(
  "Filter parameters.",
  { agency_id: fields.agency_id, time_range_days: periodFields.time_range_days },
  { required: ["agency_id"] },
);
