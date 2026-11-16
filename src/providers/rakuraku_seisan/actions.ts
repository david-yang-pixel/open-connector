import type { ActionDefinition } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
import { defineProviderAction } from "../../core/provider-definition.ts";

export const rakurakuSeisanActions: ActionDefinition[] = [
  defineProviderAction("rakuraku_seisan", {
    name: "download_journal_file",
    operationType: "read",
    description:
      "Download the latest automatically generated journal file for an export configuration. Historical files are unavailable. Preserves CSV/TXT MS932 encoding or ZIP bytes in transit storage, up to 64 MiB or the configured storage limit.",
    inputSchema: s.actionInput(
      { fileGenerateId: s.integer("Automatic file export configuration ID shown in the administration screen.") },
      ["fileGenerateId"],
    ),
    outputSchema: s.actionOutput({
      file: s.actionOutput(
        {
          fileId: s.string("Transit file identifier."),
          downloadUrl: s.url("Temporary download URL."),
          name: s.string("Export filename."),
          mimeType: s.string("File MIME type."),
          sizeBytes: s.nonNegativeInteger("File size in bytes."),
        },
        "Downloaded journal file in transit storage.",
      ),
    }),
  }),
  defineProviderAction("rakuraku_seisan", {
    name: "import_master_csv",
    operationType: "write",
    description:
      "Schedule a master CSV import from a public URL. Requires MS932 encoding, official column names in the first row, at most 5 MB and 50,000 rows. Creates or updates records without deleting them. Poll get_import_status for completion and failed record counts.",
    inputSchema: s.actionInput(
      {
        fileUrl: s.url("Public URL of the MS932 CSV file, including its header row."),
        masterId: s.integer(
          "Official master ID: 0 employees, 1 departments, 2 positions, 3 payees, 4 projects, 18 approvers, 81-85 general masters. For other supported masters such as exchange rates, use the ID supplied by Rakuraku Seisan.",
        ),
        duplicateKey: s.withEnum(
          s.integer("Duplicate record handling: 0 skip, 1 update. Defaults to 0, or 1 for approvers (masterId 18)."),
          [0, 1],
        ),
        sendPasswordEmail: s.boolean("Send password setup emails when importing employees. Defaults to false."),
        createCategory: s.boolean(
          "Create missing categories for payees, projects, or general masters. Defaults to false.",
        ),
      },
      ["fileUrl", "masterId"],
    ),
    outputSchema: s.actionOutput({ processId: s.string("Import process ID used to poll the result.") }),
    asyncLifecycle: {
      startActionId: "rakuraku_seisan.import_master_csv",
      statusActionId: "rakuraku_seisan.get_import_status",
    },
  }),
  defineProviderAction("rakuraku_seisan", {
    name: "get_import_status",
    operationType: "read",
    description:
      "Get a CSV import result. A complete process may still contain failed records; inspect failureCount and obtain error reports from the Rakuraku Seisan CSV import status screen.",
    inputSchema: s.actionInput({ processId: s.nonEmptyString("Process ID returned by import_master_csv.") }, [
      "processId",
    ]),
    outputSchema: s.actionOutput(
      {
        processStatus: s.string("Provider process state: wait, active, complete, abort, or error."),
        successCount: s.nonNegativeInteger("Successfully imported record count, when supplied."),
        failureCount: s.nonNegativeInteger("Failed record count, when supplied."),
        raw: s.unknownObject("Original provider response, including additional fields."),
      },
      "CSV import status.",
      ["processStatus", "raw"],
    ),
  }),
];
