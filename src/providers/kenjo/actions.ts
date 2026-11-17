import type { ActionDefinition } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";

const name = s.string("The name to filter by.");
const country = s.string("The ISO 3166-1 alpha-2 country code.", { minLength: 2, maxLength: 2 });
const officeFields = {
  name: s.nonEmptyString("The office name."),
  companyId: s.nonEmptyString("The Kenjo company ID."),
  calendarId: s.nonEmptyString("The Kenjo calendar ID."),
  street: s.string("The office street address."),
  postalCode: s.string("The office postal code."),
  city: s.string("The office city."),
  country,
};
const officeId = s.nonEmptyString("The Kenjo office ID.");
const directoryItem = s.looseObject("A Kenjo directory entry, including additional upstream fields.", {
  _id: s.string("The Kenjo entry ID."),
  name: s.string("The entry name."),
});
const office = s.looseObject("A Kenjo office, including additional upstream fields.", {
  _id: s.string("The Kenjo office ID."),
  ...officeFields,
  postalCode: s.anyOf("The office postal code, returned as a string or number.", [
    s.string("A postal code."),
    s.number("A numeric postal code."),
  ]),
  activeForShiftplan: s.boolean("Whether the office is enabled as a shift plan location."),
});
const officeOutput = s.requiredObject("The returned Kenjo office.", { office });

export const kenjoActions: ActionDefinition[] = [
  defineProviderAction("kenjo", {
    name: "list_companies",
    operationType: "read",
    requiredScopes: [],
    description: "List Kenjo companies, optionally filtered by name, city, or country.",
    inputSchema: s.object(
      "Company filters.",
      { name, city: s.string("The company city."), country },
      { optional: ["name", "city", "country"] },
    ),
    outputSchema: s.requiredObject("Matching Kenjo companies.", {
      items: s.array(
        "The companies.",
        s.looseObject("A Kenjo company.", {
          _id: s.string("The company ID."),
          name,
          city: s.string("The company city."),
          country,
        }),
      ),
    }),
  }),
  defineProviderAction("kenjo", {
    name: "list_departments",
    operationType: "read",
    requiredScopes: [],
    description: "List Kenjo departments, optionally filtered by name.",
    inputSchema: s.object("Department filters.", { name }, { optional: ["name"] }),
    outputSchema: s.requiredObject("Matching Kenjo departments.", {
      items: s.array("The departments.", directoryItem),
    }),
  }),
  defineProviderAction("kenjo", {
    name: "list_calendars",
    operationType: "read",
    requiredScopes: [],
    description: "List Kenjo calendars for use when creating offices.",
    inputSchema: s.object("Calendar filters.", { name }, { optional: ["name"] }),
    outputSchema: s.requiredObject("Matching Kenjo calendars.", {
      items: s.array("The calendars.", directoryItem),
    }),
  }),
  defineProviderAction("kenjo", {
    name: "list_offices",
    operationType: "read",
    requiredScopes: [],
    description: "List Kenjo offices using company, calendar, address, or shift plan filters.",
    inputSchema: s.object(
      "Office filters.",
      {
        ...officeFields,
        activeForShiftplan: s.boolean("Filter by whether the office is enabled for the shift plan."),
      },
      { optional: [...Object.keys(officeFields), "activeForShiftplan"] },
    ),
    outputSchema: s.requiredObject("Matching Kenjo offices.", { items: s.array("The offices.", office) }),
  }),
  defineProviderAction("kenjo", {
    name: "get_office",
    operationType: "read",
    requiredScopes: [],
    description: "Get a Kenjo office by ID.",
    inputSchema: s.requiredObject("The office to retrieve.", { id: officeId }),
    outputSchema: officeOutput,
  }),
  defineProviderAction("kenjo", {
    name: "create_office",
    operationType: "write",
    requiredScopes: [],
    description: "Create a Kenjo office linked to an existing company and calendar.",
    inputSchema: s.object("The office to create.", officeFields, {
      optional: ["street", "postalCode", "city", "country"],
    }),
    outputSchema: officeOutput,
  }),
  defineProviderAction("kenjo", {
    name: "update_office",
    operationType: "write",
    requiredScopes: [],
    description: "Update the name of an existing Kenjo office.",
    inputSchema: s.requiredObject("The office name update.", { id: officeId, name: officeFields.name }),
    outputSchema: officeOutput,
  }),
  defineProviderAction("kenjo", {
    name: "delete_office",
    operationType: "destructive",
    requiredScopes: [],
    description: "Delete a Kenjo office by ID.",
    inputSchema: s.requiredObject("The office to delete.", { id: officeId }),
    outputSchema: s.requiredObject("Office deletion result.", {
      deleted: s.boolean("Whether Kenjo confirmed deletion."),
    }),
  }),
];
