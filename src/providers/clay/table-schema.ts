import type { JsonSchema } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
const field = s.nonEmptyString("Field name or ID according to field_mode.");
const nestedPath = s.array("Nested property path, up to 5 segments.", s.nonEmptyString("Path segment."), {
  minItems: 1,
  maxItems: 5,
});
const filterRef = { $ref: "#/$defs/filter", description: "Recursive filter expression." };
const filter = s.anyOf(
  [
    s.object(
      "Field predicate.",
      {
        field,
        op: s.stringEnum("Comparison operator.", [
          "=",
          "!=",
          ">",
          ">=",
          "<",
          "<=",
          "contains",
          "not_contains",
          "starts_with",
          "ends_with",
          "in",
          "not_in",
          "is_empty",
          "is_not_empty",
        ]),
        path: nestedPath,
        value: s.anyOf(
          [
            s.string("Text value."),
            s.number("Numeric value."),
            s.boolean("Boolean value."),
            s.array(
              "Values for membership tests.",
              s.anyOf([s.string("Text value."), s.number("Numeric value.")], {
                description: "Text or number.",
              }),
            ),
          ],
          { description: "Comparison value; omit for empty checks." },
        ),
      },
      {
        optional: ["path", "value"],
      },
    ),
    s.requiredObject("All child conditions must match.", {
      and: s.array("Conjoined conditions.", filterRef, { minItems: 1, maxItems: 10 }),
    }),
    s.requiredObject("Any child condition may match.", {
      or: s.array("Alternative conditions.", filterRef, { minItems: 1, maxItems: 10 }),
    }),
    s.requiredObject("Negated condition.", { not: filterRef }),
  ],
  { description: "Predicate or Boolean filter expression." },
);
export const tableQueryInput: JsonSchema = {
  ...s.object(
    "Structured table query parameters.",
    {
      query: s.object(
        "Structured query over known tables.",
        {
          tables: s.array(
            "Tables to query, up to 5.",
            s.object(
              "Table reference.",
              {
                id: s.nonEmptyString("Table ID from the Clay table URL after /tables/."),
                alias: s.string("Optional table alias."),
              },
              {
                optional: ["alias"],
              },
            ),
            { minItems: 1, maxItems: 5 },
          ),
          field_mode: s.stringEnum("Whether fields use names or IDs.", ["names", "ids"]),
          select: s.array(
            "Selected fields or aggregates, up to 20.",
            s.anyOf(
              [
                s.object(
                  "Aggregate selection.",
                  {
                    fn: s.stringEnum("Aggregate function.", ["count", "sum", "avg", "max", "min"]),
                    field,
                    as: s.nonEmptyString("Output alias for the aggregate."),
                    path: nestedPath,
                  },
                  {
                    optional: ["path"],
                  },
                ),
                s.object(
                  "Field selection.",
                  {
                    field,
                    path: nestedPath,
                    as: s.string("Output column alias."),
                    table: s.string("Table reference for the field."),
                  },
                  {
                    optional: ["path", "as", "table"],
                  },
                ),
              ],
              { description: "Field selection or aggregate." },
            ),
            { maxItems: 20 },
          ),
          filter: filterRef,
          group_by: s.array("Grouping fields, up to 5.", field, { maxItems: 5 }),
          join: s.array(
            "Table joins, up to 4.",
            s.object(
              "Table join.",
              {
                table: s.nonEmptyString("Table reference to join."),
                type: s.stringEnum("Join type; defaults to inner.", ["inner", "left"]),
                on: s.requiredObject("Join condition.", {
                  left: s.nonEmptyString("Left join field."),
                  right: s.nonEmptyString("Right join field."),
                }),
              },
              {
                optional: ["type"],
              },
            ),
            { maxItems: 4 },
          ),
          order_by: s.array(
            "Custom ordering disables cursor pagination; up to 3 fields.",
            s.object(
              "Sort term.",
              {
                field,
                direction: s.stringEnum("Sort direction; defaults to asc.", ["asc", "desc"]),
              },
              {
                optional: ["direction"],
              },
            ),
            { maxItems: 3 },
          ),
        },
        {
          optional: ["field_mode", "select", "filter", "group_by", "join", "order_by"],
        },
      ),
      cursor: s.string("Opaque cursor; concurrent updates can repeat rows, so deduplicate by ID."),
      limit: s.integer("Page size, 1–100; defaults to 50.", { minimum: 1, maximum: 100 }),
    },
    {
      optional: ["cursor", "limit"],
    },
  ),
  $defs: { filter },
};
