import { describe, expect, it, vi } from "vitest";
import { oauth } from "./oauth.ts";

const clientConfig = {
  service: "feishu",
  clientId: "cli_test",
  clientSecret: "secret",
  extra: {},
  secretExtra: {},
};

describe("Feishu OAuth scope discovery", () => {
  it("keeps offline access and only user scopes enabled on the configured app", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(Response.json({ code: 0, msg: "ok", tenant_access_token: "tenant-token", expire: 7200 }))
      .mockResolvedValueOnce(
        Response.json({
          code: 0,
          msg: "ok",
          data: {
            app: {
              scopes: [
                { scope: "approval:approval:read", token_types: ["user"] },
                { scope: "calendar:calendar.event:create", token_types: ["tenant"] },
                { scope: "outside:provider:scope", token_types: ["user"] },
              ],
            },
          },
        }),
      );

    await expect(
      oauth.resolveAuthorizationScopes!({
        clientConfig,
        requestedScopes: [
          "offline_access",
          "approval:approval:read",
          "calendar:calendar.event:create",
          "bitable:app:readonly",
        ],
        fetcher,
        createError: (message) => new Error(message),
      }),
    ).resolves.toEqual(["offline_access", "approval:approval:read"]);

    expect(fetcher).toHaveBeenNthCalledWith(
      1,
      "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ app_id: "cli_test", app_secret: "secret" }),
      }),
    );
    expect(fetcher).toHaveBeenNthCalledWith(
      2,
      "https://open.feishu.cn/open-apis/application/v6/applications/cli_test?lang=zh_cn",
      expect.objectContaining({ headers: expect.objectContaining({ authorization: "Bearer tenant-token" }) }),
    );
  });

  it("stops authorization when app permissions cannot be inspected", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(Response.json({ code: 0, tenant_access_token: "tenant-token" }))
      .mockResolvedValueOnce(Response.json({ code: 99991672, msg: "permission denied" }));

    await expect(
      oauth.resolveAuthorizationScopes!({
        clientConfig,
        requestedScopes: ["approval:approval:read"],
        fetcher,
        createError: (message) => new Error(message),
      }),
    ).rejects.toThrow("Feishu app permissions could not be read before authorization.");
  });

  it("does not expose provider responses when app credentials are invalid", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(Response.json({ code: 10003, msg: "secret echoed: secret" }));

    await expect(
      oauth.resolveAuthorizationScopes!({
        clientConfig,
        requestedScopes: ["approval:approval:read"],
        fetcher,
        createError: (message) => new Error(message),
      }),
    ).rejects.toThrow("Feishu OAuth app credentials could not be validated before authorization.");
  });
});
