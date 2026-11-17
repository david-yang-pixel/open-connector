import type { JsonSchema } from "../../core/types.ts";
export interface DataTool {
  name: string;
  path: string;
  description: string;
  input: JsonSchema;
  asyncInput: JsonSchema;
  output: JsonSchema;
}
