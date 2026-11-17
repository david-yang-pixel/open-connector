import type { ActionDefinition } from "../../core/types.ts";

import { jsonSchema as s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";
export const keyzyActions: ActionDefinition[] = [
  defineProviderAction("keyzy", {
    name: "register_license",
    description: "Register a customer to a license. SKU settings control whether KEYZY emails the license.",
    operationType: "write",
    requiredScopes: [],
    inputSchema: {
      ...s.object(
        "License operation input.",
        {
          sku_number: s.nonEmptyString("The SKU number to register."),
          name: s.nonEmptyString("The licensee name."),
          email: s.string("The licensee email address.", { format: "email" }),
          type: s.stringEnum("The license type; omit on registration to inherit the SKU type.", [
            "perpetual",
            "subscription",
            "trial",
          ]),
          start_at: s.integer("The license start time as a Unix timestamp."),
          end_at: s.integer("The license end time as a Unix timestamp."),
        },
        { optional: ["type", "start_at", "end_at"] },
      ),
      allOf: [
        {
          if: { properties: { type: { enum: ["subscription", "trial"] } }, required: ["type"] },
          then: { required: ["start_at", "end_at"] },
        },
      ],
    },
    outputSchema: s.looseObject("Registration response.", {
      message: s.looseObject("Registration result.", {
        serial: s.string("The registered license serial number."),
      }),
    }),
  }),
  defineProviderAction("keyzy", {
    name: "get_license",
    description: "Get license details by serial number.",
    operationType: "read",
    requiredScopes: [],
    inputSchema: s.requiredObject("License operation input.", {
      serial: s.nonEmptyString("The license serial number."),
    }),
    outputSchema: s.looseObject("License details response.", {
      data: s.object(
        "License details returned by KEYZY.",
        {
          serial: s.string("The license serial number."),
          name: s.string("The licensee name."),
          email: s.string("The licensee email address."),
          type: s.string("The license type."),
          sku_number: s.string("The associated SKU number."),
          sku_name: s.string("The associated SKU name."),
          start_at: s.nullable(s.integer("The license start time as a Unix timestamp.")),
          end_at: s.nullable(s.integer("The license end time as a Unix timestamp.")),
          registered: s.boolean("Whether the license has been registered."),
        },
        { required: [], additionalProperties: true },
      ),
    }),
  }),
  defineProviderAction("keyzy", {
    name: "update_license_sku",
    description: "Change the SKU associated with a license.",
    operationType: "write",
    requiredScopes: [],
    inputSchema: s.requiredObject("License operation input.", {
      serial: s.nonEmptyString("The license serial number."),
      current_sku_number: s.nonEmptyString("The current SKU number."),
      new_sku_number: s.nonEmptyString(
        "The new SKU number. Its type replaces the license type; trial or subscription may also need update_license_time.",
      ),
    }),
    outputSchema: s.looseObject("License operation response.", {
      message: s.string("The operation result message."),
    }),
  }),
  defineProviderAction("keyzy", {
    name: "update_license_time",
    description: "Update the end time and optional start time of a subscription or trial license.",
    operationType: "write",
    requiredScopes: [],
    inputSchema: s.object(
      "License operation input.",
      {
        serial: s.nonEmptyString("The license serial number."),
        start_at: s.integer("The license start time as a Unix timestamp."),
        end_at: s.integer("The license end time as a Unix timestamp."),
      },
      { optional: ["start_at"] },
    ),
    outputSchema: s.looseObject("License operation response.", {
      message: s.string("The operation result message."),
    }),
  }),
  defineProviderAction("keyzy", {
    name: "delete_license",
    description: "Delete a license and all its activations. The supplied type must match the license type.",
    operationType: "destructive",
    requiredScopes: [],
    inputSchema: s.requiredObject("License operation input.", {
      serial: s.nonEmptyString("The license serial number."),
      type: s.stringEnum("The actual license type, required to confirm deletion.", [
        "perpetual",
        "subscription",
        "trial",
      ]),
    }),
    outputSchema: s.looseObject("License operation response.", {
      message: s.string("The operation result message."),
    }),
  }),
];
