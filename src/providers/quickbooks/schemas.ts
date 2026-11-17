import type { JsonSchema } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { quickbooksAccountingScope, quickbooksDefaultMaxResults, quickbooksMaxResults } from "./constants.ts";

export const service: string = "quickbooks";
export const requiredScopes: string[] = [quickbooksAccountingScope];

export const isoDate: JsonSchema = s.date("A calendar date in YYYY-MM-DD format.");
export const entityId: JsonSchema = s.nonEmptyString("The QuickBooks entity ID, as returned in the `Id` field.");
export const syncToken: JsonSchema = s.nonEmptyString(
  "The entity's current SyncToken. QuickBooks rejects an update, void or delete whose SyncToken is stale. When omitted, the current SyncToken is fetched first.",
);
export const sparse: JsonSchema = s.boolean({
  default: true,
  description:
    "When true (default), only the supplied fields change and the rest of the entity is kept. When false QuickBooks replaces the whole entity, so every field you want to keep must be supplied.",
});
export const additionalFields: JsonSchema = s.unknownObject(
  "Extra QuickBooks fields in their native PascalCase names, merged over the modelled fields. Use it for any field not listed here.",
);

export const reference = (description: string): JsonSchema =>
  s.object(
    {
      value: s.nonEmptyString("The ID of the referenced entity."),
      name: s.string("Optional display name of the referenced entity. QuickBooks ignores it on input."),
    },
    { required: ["value"], description },
  );

export const postalAddress = (description: string): JsonSchema =>
  s.object(
    {
      line1: s.string("Street address line 1."),
      line2: s.string("Street address line 2."),
      city: s.string("City."),
      country_sub_division_code: s.string("State or province code."),
      postal_code: s.string("Postal or ZIP code."),
      country: s.string("Country."),
    },
    { description },
  );

const startPosition = s.positiveInteger("1-based index of the first row to return.", { default: 1 });
const maxResults = s.integer({
  minimum: 1,
  maximum: quickbooksMaxResults,
  default: quickbooksDefaultMaxResults,
  description: `Maximum rows to return per page, up to ${quickbooksMaxResults}.`,
});
export const activeStatus: JsonSchema = s.stringEnum(["active", "inactive", "all"], {
  default: "active",
  description: "Which records to return by their Active flag. QuickBooks hides inactive records unless asked.",
});
export const descending: JsonSchema = s.boolean({ default: false, description: "Sort in descending order." });

export const pagingFields: Record<string, JsonSchema> = { start_position: startPosition, max_results: maxResults };

export function listOutput(itemsDescription: string): JsonSchema {
  return s.object(
    {
      items: s.array(s.unknownObject("A QuickBooks entity in its native shape."), { description: itemsDescription }),
      start_position: s.integer({ description: "The 1-based index of the first returned row." }),
      max_results: s.integer({ description: "The page size that was requested." }),
      next_start_position: s.nullableInteger(
        "Pass this as start_position to fetch the next page. Null when this was the last page.",
      ),
      has_more: s.boolean("Whether another page may be available."),
    },
    { required: ["items", "start_position", "max_results", "next_start_position", "has_more"] },
  );
}

export function entityOutput(key: string, description: string): JsonSchema {
  return s.object(
    {
      [key]: s.object(
        {
          Id: s.string("The entity ID."),
          SyncToken: s.string("The version token required for updates, voids and deletes."),
        },
        { description, required: ["Id", "SyncToken"], additionalProperties: true },
      ),
    },
    { required: [key] },
  );
}
