import { describe, expect, it } from "vitest";
import { validateArcmiraCredential, arcmiraActionHandlers } from "./runtime.ts";

describe("Arcmira native credential and error contracts", () => {
  it("returns the account inside the runtime profile envelope", async () => {
    const fetcher = async () => Response.json({ account: { id: "team", name: "Research" }, scopes: ["read"] });
    expect(await validateArcmiraCredential({ apiKey: "test-key", fetcher })).toEqual({
      profile: { accountId: "team", displayName: "Research" },
      grantedScopes: ["read"],
    });
  });
  it.each([401, 403])("preserves unknown HTTP %i without triggering credential recovery", async (status) => {
    const context = {
      apiKey: "test-key",
      fetcher: async () => Response.json({ error: { message: "Key or plan refused" } }, { status }),
    };
    await expect(validateArcmiraCredential(context)).rejects.toMatchObject({ status, code: "provider_error" });
    await expect(arcmiraActionHandlers.get_account({}, context)).rejects.toMatchObject({
      status,
      code: "provider_error",
    });
  });
});
