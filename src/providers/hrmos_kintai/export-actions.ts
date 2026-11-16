import type { ActionDefinition } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";

const exportInput = s.actionInput(
  {
    year: s.integer("Four-digit target year.", { minimum: 1000, maximum: 9999 }),
  },
  ["year"],
  "CSV export parameters.",
);
const exportOutput = s.actionOutput(
  {
    file: s.actionOutput(
      {
        fileId: s.string("Transit file identifier."),
        name: s.string("CSV file name."),
        mimeType: s.string("Original CSV media type and character encoding when supplied."),
        downloadUrl: s.string("Local transit file download URL."),
        sizeBytes: s.integer("File size in bytes."),
      },
      "Downloadable CSV artifact.",
    ),
  },
  "Exported CSV file.",
);

export const exportActions: ActionDefinition[] = [
  defineProviderAction("hrmos_kintai", {
    name: "export_dependent_declaration",
    operationType: "read",
    description: "Export dependent declaration as a downloadable CSV file for the specified year.",
    inputSchema: exportInput,
    outputSchema: exportOutput,
  }),
  defineProviderAction("hrmos_kintai", {
    name: "export_next_year_dependent_declaration",
    operationType: "read",
    description: "Export next year dependent declaration as a downloadable CSV file for the specified year.",
    inputSchema: exportInput,
    outputSchema: exportOutput,
  }),
  defineProviderAction("hrmos_kintai", {
    name: "export_insurance_deduction_declaration",
    operationType: "read",
    description: "Export insurance deduction declaration as a downloadable CSV file for the specified year.",
    inputSchema: exportInput,
    outputSchema: exportOutput,
  }),
  defineProviderAction("hrmos_kintai", {
    name: "export_income_deduction_declaration",
    operationType: "read",
    description: "Export income deduction declaration as a downloadable CSV file for the specified year.",
    inputSchema: exportInput,
    outputSchema: exportOutput,
  }),
  defineProviderAction("hrmos_kintai", {
    name: "export_housing_loan_declaration",
    operationType: "read",
    description: "Export housing loan declaration as a downloadable CSV file for the specified year.",
    inputSchema: exportInput,
    outputSchema: exportOutput,
  }),
  defineProviderAction("hrmos_kintai", {
    name: "export_previous_employment_withholding",
    operationType: "read",
    description: "Export previous employment withholding as a downloadable CSV file for the specified year.",
    inputSchema: exportInput,
    outputSchema: exportOutput,
  }),
];
