import type { ActionDefinition } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
import { contractSchema, businessPartnerSchema, businessPartnerUserSchema } from "./business-schemas.ts";
import { pagination, listOutput } from "./schemas.ts";

export const businessActions: ActionDefinition[] = [
  defineProviderAction("hrmos_kintai", {
    name: "list_contracts",
    operationType: "read",
    description: "List contracts.",
    inputSchema: s.object(
      "Parameters to list contract.",
      {
        ...pagination,
        employeeId: s.integer("Filter contracts by employee ID."),
        partnerId: s.integer("Filter contracts by business partner ID."),
      },
      { required: [] },
    ),
    outputSchema: listOutput(s.looseObject("Returned contract with additional fields preserved.")),
  }),
  defineProviderAction("hrmos_kintai", {
    name: "create_contract",
    operationType: "write",
    description: "Create contract.",
    inputSchema: s.object(
      "Parameters to create contract.",
      {
        data: contractSchema,
      },
      { required: ["data"] },
    ),
    outputSchema: s.object(
      "HRMOS operation result.",
      {
        record: s.looseObject("Returned contract with additional fields preserved."),
      },
      { required: ["record"] },
    ),
  }),
  defineProviderAction("hrmos_kintai", {
    name: "update_contract",
    operationType: "write",
    description: "Update contract.",
    inputSchema: s.object(
      "Parameters to update contract.",
      {
        contractId: s.integer("Contract ID."),
        data: contractSchema,
      },
      { required: ["contractId", "data"] },
    ),
    outputSchema: s.object(
      "HRMOS operation result.",
      {
        record: s.looseObject("Returned contract with additional fields preserved."),
      },
      { required: ["record"] },
    ),
  }),
  defineProviderAction("hrmos_kintai", {
    name: "delete_contract",
    operationType: "destructive",
    description: "Delete contract.",
    inputSchema: s.object(
      "Parameters to delete contract.",
      {
        contractId: s.integer("Contract ID."),
      },
      { required: ["contractId"] },
    ),
    outputSchema: s.object(
      "HRMOS operation result.",
      {
        record: s.looseObject("Returned contract with additional fields preserved."),
      },
      { required: ["record"] },
    ),
  }),
  defineProviderAction("hrmos_kintai", {
    name: "list_business_partners",
    operationType: "read",
    description: "List business partners.",
    inputSchema: s.object(
      "Parameters to list business partner.",
      {
        ...pagination,
        partnerId: s.integer("Filter by business partner ID."),
        closeOut: { ...s.integer("Trading status: 0 active, 1 trading ended."), enum: [0, 1] },
      },
      { required: [] },
    ),
    outputSchema: listOutput(s.looseObject("Returned business partner with additional fields preserved.")),
  }),
  defineProviderAction("hrmos_kintai", {
    name: "create_business_partner",
    operationType: "write",
    description: "Create business partner.",
    inputSchema: s.object(
      "Parameters to create business partner.",
      {
        data: businessPartnerSchema,
      },
      { required: ["data"] },
    ),
    outputSchema: s.object(
      "HRMOS operation result.",
      {
        record: s.looseObject("Returned business partner with additional fields preserved."),
      },
      { required: ["record"] },
    ),
  }),
  defineProviderAction("hrmos_kintai", {
    name: "update_business_partner",
    operationType: "destructive",
    description: "Update business partner. May end the trading relationship when close_out is 1.",
    inputSchema: s.object(
      "Parameters to update business partner.",
      {
        partnerId: s.integer("Business partner ID."),
        data: businessPartnerSchema,
      },
      { required: ["partnerId", "data"] },
    ),
    outputSchema: s.object(
      "HRMOS operation result.",
      {
        record: s.looseObject("Returned business partner with additional fields preserved."),
      },
      { required: ["record"] },
    ),
  }),
  defineProviderAction("hrmos_kintai", {
    name: "delete_business_partner",
    operationType: "destructive",
    description: "Delete business partner.",
    inputSchema: s.object(
      "Parameters to delete business partner.",
      {
        partnerId: s.integer("Business partner ID."),
      },
      { required: ["partnerId"] },
    ),
    outputSchema: s.object(
      "HRMOS operation result.",
      {
        record: s.looseObject("Returned business partner with additional fields preserved."),
      },
      { required: ["record"] },
    ),
  }),
  defineProviderAction("hrmos_kintai", {
    name: "list_partner_contacts",
    operationType: "read",
    description: "List business partner approval contacts.",
    inputSchema: s.object(
      "Parameters to list partner contact.",
      {
        ...pagination,
        partnerId: s.integer("Business partner ID."),
      },
      { required: ["partnerId"] },
    ),
    outputSchema: listOutput(s.looseObject("Returned partner contact with additional fields preserved.")),
  }),
  defineProviderAction("hrmos_kintai", {
    name: "create_partner_contact",
    operationType: "write",
    description: "Create business partner approval contacts.",
    inputSchema: s.object(
      "Parameters to create partner contact.",
      {
        partnerId: s.integer("Business partner ID."),
        data: businessPartnerUserSchema,
      },
      { required: ["partnerId", "data"] },
    ),
    outputSchema: s.object(
      "HRMOS operation result.",
      {
        record: s.looseObject("Returned partner contact with additional fields preserved."),
      },
      { required: ["record"] },
    ),
  }),
  defineProviderAction("hrmos_kintai", {
    name: "update_partner_contact",
    operationType: "write",
    description: "Update business partner approval contacts.",
    inputSchema: s.object(
      "Parameters to update partner contact.",
      {
        partnerId: s.integer("Business partner ID."),
        contactId: s.integer("Partner contact ID."),
        data: businessPartnerUserSchema,
      },
      { required: ["partnerId", "contactId", "data"] },
    ),
    outputSchema: s.object(
      "HRMOS operation result.",
      {
        record: s.looseObject("Returned partner contact with additional fields preserved."),
      },
      { required: ["record"] },
    ),
  }),
  defineProviderAction("hrmos_kintai", {
    name: "delete_partner_contact",
    operationType: "destructive",
    description: "Delete business partner approval contacts.",
    inputSchema: s.object(
      "Parameters to delete partner contact.",
      {
        partnerId: s.integer("Business partner ID."),
        contactId: s.integer("Partner contact ID."),
      },
      { required: ["partnerId", "contactId"] },
    ),
    outputSchema: s.object(
      "HRMOS operation result.",
      {
        record: s.looseObject("Returned partner contact with additional fields preserved."),
      },
      { required: ["record"] },
    ),
  }),
];
