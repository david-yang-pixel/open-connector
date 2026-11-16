import type { ExecutionContext } from "../../core/types.ts";

import { describe, expect, it } from "vitest";
import { createXiaohongshuStoreSign, credentialValidators, executors } from "./executors.ts";

describe("createXiaohongshuStoreSign", () => {
  it("reproduces the documented createItem signature example", () => {
    // Example from the official signature spec (open.xiaohongshu.com/document/developer/file/39):
    // MD5("product.createItem?appId=21d6748be8de0&timestamp=1612518379&version=2.0" + appSecret).
    const sign = createXiaohongshuStoreSign({
      method: "product.createItem",
      appId: "21d6748be8de0",
      timestamp: "1612518379",
      appSecret: "429aa3aee9ef9e4a858210",
    });
    expect(sign).toBe("1e039e3cd6e0d895e59133029602297e");
  });

  it("changes when any signed field changes", () => {
    const base = {
      method: "order.getOrderList",
      appId: "app-id",
      timestamp: "1700000000",
      appSecret: "app-secret",
    };
    const sign = createXiaohongshuStoreSign(base);
    expect(createXiaohongshuStoreSign({ ...base, method: "order.getOrderDetail" })).not.toBe(sign);
    expect(createXiaohongshuStoreSign({ ...base, appId: "other-app-id" })).not.toBe(sign);
    expect(createXiaohongshuStoreSign({ ...base, timestamp: "1700000001" })).not.toBe(sign);
    expect(createXiaohongshuStoreSign({ ...base, appSecret: "other-secret" })).not.toBe(sign);
  });
});

describe("list_orders time window", () => {
  // order.getOrderList takes startTime/endTime in seconds, unlike the millisecond after-sale list.
  const context: ExecutionContext = {
    getCredential: async () => ({
      authType: "custom_credential",
      values: { appId: "x", appSecret: "y", accessToken: "z" },
      profile: { accountId: "xiaohongshu_store:x", displayName: "Xiaohongshu Store", grantedScopes: [] },
      metadata: {},
    }),
  };
  const listOrders = executors["xiaohongshu_store.list_orders"];
  const startTime = 1_790_000_000;

  it("rejects millisecond timestamps before calling Xiaohongshu", async () => {
    const result = await listOrders(
      { timeType: 1, startTime: startTime * 1000, endTime: startTime * 1000 + 1 },
      context,
    );
    expect(result).toMatchObject({
      ok: false,
      error: { code: "invalid_input", message: "startTime must be a Unix timestamp in seconds" },
    });
  });

  it("enforces the 24 hour and 30 minute windows in seconds", async () => {
    const byCreation = await listOrders({ timeType: 1, startTime, endTime: startTime + 86_401 }, context);
    expect(byCreation).toMatchObject({
      ok: false,
      error: { message: "The creation-time window cannot exceed 24 hours" },
    });
    const byUpdate = await listOrders({ timeType: 2, startTime, endTime: startTime + 1_801 }, context);
    expect(byUpdate).toMatchObject({
      ok: false,
      error: { message: "The update-time window cannot exceed 30 minutes" },
    });
  });
});

describe("credentialValidators.customCredential", () => {
  // The connect form treats an upstream 401 as a wrong field value: the validate
  // phase must surface it as a 400 invalid_input, not an authorization_failed
  // reconnect prompt (see provider-runtime.auth-status.test.ts).
  it("maps an upstream auth failure to a 400 input error", async () => {
    const fetcher = (async () =>
      Response.json({ error_code: 401, error_msg: "应用不存在", success: false })) as typeof fetch;
    const validate = credentialValidators.customCredential;
    if (!validate) throw new Error("missing customCredential validator");
    await expect(
      validate({ values: { appId: "x", appSecret: "y", accessToken: "z" } }, { fetcher }),
    ).rejects.toMatchObject({ status: 400 });
  });

  // The item publish APIs can answer { success: true, error_code: 50209 } with no data for a business
  // rejection; the error code has to win over the success flag so the message is not lost.
  it("treats success with a non-zero error code and no data as an upstream error", async () => {
    const fetcher = (async () =>
      Response.json({
        success: true,
        error_code: 50209,
        error_msg: "当前商品必须支持七天无理由退货",
      })) as typeof fetch;
    const validate = credentialValidators.customCredential;
    if (!validate) throw new Error("missing customCredential validator");
    await expect(
      validate({ values: { appId: "x", appSecret: "y", accessToken: "z" } }, { fetcher }),
    ).rejects.toMatchObject({ status: 502, message: "[50209] 当前商品必须支持七天无理由退货" });
  });

  // The gateway reports throttling as HTTP 200 with error_code -9013 rather than an HTTP 429.
  it("maps the gateway throttle response to a 429", async () => {
    const fetcher = (async () =>
      Response.json({ error_code: -9013, error_msg: "触发Method维度的限流", success: false })) as typeof fetch;
    const validate = credentialValidators.customCredential;
    if (!validate) throw new Error("missing customCredential validator");
    await expect(
      validate({ values: { appId: "x", appSecret: "y", accessToken: "z" } }, { fetcher }),
    ).rejects.toMatchObject({ status: 429 });
  });
});
