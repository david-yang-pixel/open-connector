import type { ActionDefinition } from "../../core/types.ts";

import { describe, expect, it } from "vitest";
import { provider } from "./definition.ts";

function action(name: string): ActionDefinition {
  const found = provider.actions.find((candidate) => candidate.name === name);
  expect(found, `${name} must remain in the Feishu catalog`).toBeDefined();
  return found!;
}

describe("Feishu provider definition", () => {
  // `permissionResourceSchema` used to pass `optional: []`, and an empty
  // array is truthy for `s.object`, so `fields` and `permType` were required
  // and a caller that supplied only the resource was rejected before the
  // request was even built.
  it("requires only the resource for the permission actions", () => {
    expect(action("list_drive_permissions").inputSchema.required).toEqual(["token", "resourceType"]);
    expect(action("add_drive_permission").inputSchema.required).toEqual([
      "token",
      "resourceType",
      "memberId",
      "memberType",
      "permission",
    ]);
    expect(action("update_drive_permission").inputSchema.required).toEqual([
      "token",
      "resourceType",
      "memberId",
      "memberType",
      "permission",
    ]);
    expect(action("remove_drive_permission").inputSchema.required).toEqual([
      "token",
      "resourceType",
      "memberId",
      "memberType",
    ]);
  });
});
