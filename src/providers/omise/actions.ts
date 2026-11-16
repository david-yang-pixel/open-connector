import type { ActionDefinition } from "../../core/types.ts";

import { jsonSchema as s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";

const service = "omise";

const resourceIdSchema = s.nonEmptyString("The Omise resource ID.");
const paginationProperties = {
  limit: s.integer("The maximum number of resources to return.", { minimum: 1, maximum: 100 }),
  offset: s.integer("The number of resources to skip before returning results.", { minimum: 0 }),
  order: s.stringEnum("The order in which Omise returns resources.", ["chronological", "reverse_chronological"]),
  from: s.string("Return resources created on or after this ISO 8601 date-time."),
  to: s.string("Return resources created before this ISO 8601 date-time."),
};
const paginationOptional = ["limit", "offset", "order", "from", "to"];
const metadataValueSchema = s.union(
  [
    s.string("A customer metadata string value."),
    s.number("A customer metadata number value."),
    s.boolean("A customer metadata boolean value."),
  ],
  { description: "A primitive customer metadata value." },
);
const metadataSchema = s.record("Custom metadata attached to the customer.", metadataValueSchema);
const customerFields = {
  email: s.email("The customer's email address."),
  description: s.string("A description that helps identify the customer."),
  metadata: metadataSchema,
};

const getAccountAction = defineProviderAction(service, {
  name: "get_account",
  description: "Get the Omise account associated with the connected secret key.",
  operationType: "read",
  inputSchema: s.object("Input parameters for retrieving the connected Omise account.", {}),
  outputSchema: s.object("The connected Omise account response.", {
    account: s.looseObject("The account object returned by Omise."),
  }),
});

const getBalanceAction = defineProviderAction(service, {
  name: "get_balance",
  description: "Get the current transferable and on-hold balances for the Omise account.",
  operationType: "read",
  inputSchema: s.object("Input parameters for retrieving the Omise balance.", {}),
  outputSchema: s.object("The Omise balance response.", {
    balance: s.looseObject("The balance object returned by Omise."),
  }),
});

const listCustomersAction = defineProviderAction(service, {
  name: "list_customers",
  description: "List customers in the connected Omise account.",
  operationType: "read",
  inputSchema: s.object("Filters and pagination for listing Omise customers.", paginationProperties, {
    optional: paginationOptional,
  }),
  outputSchema: s.object("The paginated Omise customer list.", {
    customers: s.array("The customer objects returned by Omise.", s.looseObject("An Omise customer.")),
    pagination: s.looseObject("The pagination fields returned by Omise."),
  }),
});

const getCustomerAction = defineProviderAction(service, {
  name: "get_customer",
  description: "Get an Omise customer by ID.",
  operationType: "read",
  inputSchema: s.object("Input parameters for retrieving an Omise customer.", {
    customer_id: resourceIdSchema,
  }),
  outputSchema: s.object("The retrieved Omise customer.", {
    customer: s.looseObject("The customer object returned by Omise."),
  }),
});

const createCustomerAction = defineProviderAction(service, {
  name: "create_customer",
  description: "Create an Omise customer without collecting or attaching card data.",
  operationType: "write",
  inputSchema: s.object("Input parameters for creating an Omise customer.", customerFields, {
    optional: ["email", "description", "metadata"],
  }),
  outputSchema: s.object("The created Omise customer.", {
    customer: s.looseObject("The customer object returned by Omise."),
  }),
});

const updateCustomerAction = defineProviderAction(service, {
  name: "update_customer",
  description: "Update the email, description, or metadata of an Omise customer.",
  operationType: "write",
  inputSchema: s.object(
    "Input parameters for updating an Omise customer.",
    { customer_id: resourceIdSchema, ...customerFields },
    { optional: ["email", "description", "metadata"] },
  ),
  outputSchema: s.object("The updated Omise customer.", {
    customer: s.looseObject("The customer object returned by Omise."),
  }),
});

const deleteCustomerAction = defineProviderAction(service, {
  name: "delete_customer",
  description: "Permanently delete an Omise customer.",
  operationType: "destructive",
  inputSchema: s.object("Input parameters for deleting an Omise customer.", {
    customer_id: resourceIdSchema,
  }),
  outputSchema: s.object("The deleted Omise customer response.", {
    customer: s.looseObject("The deleted customer object returned by Omise."),
  }),
});

const listChargesAction = defineProviderAction(service, {
  name: "list_charges",
  description: "List charges in the connected Omise account for reconciliation or support.",
  operationType: "read",
  inputSchema: s.object("Filters and pagination for listing Omise charges.", paginationProperties, {
    optional: paginationOptional,
  }),
  outputSchema: s.object("The paginated Omise charge list.", {
    charges: s.array("The charge objects returned by Omise.", s.looseObject("An Omise charge.")),
    pagination: s.looseObject("The pagination fields returned by Omise."),
  }),
});

const getChargeAction = defineProviderAction(service, {
  name: "get_charge",
  description: "Get an Omise charge by ID.",
  operationType: "read",
  inputSchema: s.object("Input parameters for retrieving an Omise charge.", {
    charge_id: resourceIdSchema,
  }),
  outputSchema: s.object("The retrieved Omise charge.", {
    charge: s.looseObject("The charge object returned by Omise."),
  }),
});

export const omiseActions: readonly ActionDefinition[] = [
  getAccountAction,
  getBalanceAction,
  listCustomersAction,
  getCustomerAction,
  createCustomerAction,
  updateCustomerAction,
  deleteCustomerAction,
  listChargesAction,
  getChargeAction,
];
