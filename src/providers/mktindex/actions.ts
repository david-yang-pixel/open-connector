import type { ActionDefinition } from "../../core/types.ts";

import { mktindexMmiActions } from "./actions-mmi.ts";
export const mktindexActions: readonly ActionDefinition[] = [...mktindexMmiActions];
