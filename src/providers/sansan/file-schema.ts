import type { JsonSchema } from "../../core/types.ts";

import { s } from "../../core/json-schema.ts";
export const sansanFileSchema: JsonSchema = s.actionOutput(
  {
    fileId: s.string("The stored transit file identifier."),
    downloadUrl: s.string("The transit file download URL."),
    name: s.string("The file name."),
    mimeType: s.string("The file media type."),
    sizeBytes: s.integer("The file size in bytes."),
  },
  "A downloaded file in local transit storage.",
);
