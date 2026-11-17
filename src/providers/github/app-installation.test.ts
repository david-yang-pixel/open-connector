import { jwtVerify, importSPKI } from "jose";
import { generateKeyPairSync } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProviderRequestError } from "../provider-runtime.ts";
import {
  clearGitHubInstallationTokenCache,
  createGitHubInstallationTokenResolver,
  pkcs1ToPkcs8Pem,
  readGitHubAppInstallationCredential,
  signGitHubAppJwt,
} from "./app-installation.ts";

const appId = "5360099";
const installationId = "172567438";

interface TestKey {
  pkcs1: string;
  pkcs8: string;
  publicKey: CryptoKey;
}

async function createTestKey(): Promise<TestKey> {
  const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  return {
    pkcs1: privateKey.export({ type: "pkcs1", format: "pem" }).toString(),
    pkcs8: privateKey.export({ type: "pkcs8", format: "pem" }).toString(),
    publicKey: await importSPKI(publicKey.export({ type: "spki", format: "pem" }).toString(), "RS256"),
  };
}

function stripPem(pem: string): string {
  return pem.replace(/-----[A-Z ]+-----/gu, "").replace(/\s+/gu, "");
}

function mintResponse(expiresInMs: number, token = "ghs_minted"): Response {
  return Response.json(
    {
      token,
      expires_at: new Date(Date.now() + expiresInMs).toISOString(),
      permissions: { issues: "read", metadata: "read" },
      repository_selection: "selected",
    },
    { status: 201 },
  );
}

describe("GitHub App private keys", () => {
  it("wraps the PKCS#1 key GitHub downloads into exactly the PKCS#8 encoding WebCrypto imports", async () => {
    const key = await createTestKey();

    const converted = pkcs1ToPkcs8Pem(key.pkcs1);

    expect(converted.startsWith("-----BEGIN PRIVATE KEY-----\n")).toBe(true);
    expect(stripPem(converted)).toBe(stripPem(key.pkcs8));
  });

  it("accepts PKCS#1, PKCS#8 and escaped line breaks, and refuses anything else", async () => {
    const key = await createTestKey();

    expect(readGitHubAppInstallationCredential({ appId, installationId, privateKey: key.pkcs1 }).privateKey).toBe(
      pkcs1ToPkcs8Pem(key.pkcs1),
    );
    expect(readGitHubAppInstallationCredential({ appId, installationId, privateKey: key.pkcs8 }).privateKey).toBe(
      key.pkcs8.trim(),
    );
    expect(
      readGitHubAppInstallationCredential({ appId, installationId, privateKey: key.pkcs1.replaceAll("\n", "\\n") })
        .privateKey,
    ).toBe(pkcs1ToPkcs8Pem(key.pkcs1));
    expect(() => readGitHubAppInstallationCredential({ appId, installationId, privateKey: "ghp_notakey" })).toThrow(
      ProviderRequestError,
    );
  });

  it("rejects invalid App identifiers and nonnumeric installation IDs", async () => {
    const key = await createTestKey();

    for (const invalid of ["my app", "https://x", "my-app"]) {
      expect(() =>
        readGitHubAppInstallationCredential({ appId: invalid, installationId, privateKey: key.pkcs1 }),
      ).toThrow(/appId must be the GitHub App's numeric App ID or its client ID/u);
    }
    expect(() =>
      readGitHubAppInstallationCredential({ appId, installationId: "bakey", privateKey: key.pkcs1 }),
    ).toThrow(/installationId must be the numeric installation id/u);
  });
});

describe("GitHub App JWT", () => {
  it.each([appId, "Iv23liYP08qB9Y6Bk9HV", "Iv1.pgyb7nOiAvasoAZL"])(
    "signs an RS256 token issued by %s and valid for nine minutes",
    async (appId) => {
      const key = await createTestKey();
      const credential = readGitHubAppInstallationCredential({ appId, installationId, privateKey: key.pkcs1 });

      const token = await signGitHubAppJwt(credential);

      const { payload, protectedHeader } = await jwtVerify(token, key.publicKey);
      expect(protectedHeader).toMatchObject({ alg: "RS256", typ: "JWT" });
      expect(payload.iss).toBe(appId);
      // GitHub refuses a JWT older than ten minutes and one issued in the future.
      expect((payload.exp as number) - (payload.iat as number)).toBe(540);
      expect(payload.iat as number).toBeLessThan(Math.floor(Date.now() / 1000));
    },
  );

  it("reports a key that is PEM but not RSA as a credential error", async () => {
    const { privateKey } = generateKeyPairSync("ec", { namedCurve: "P-256" });
    const credential = readGitHubAppInstallationCredential({
      appId,
      installationId,
      privateKey: privateKey.export({ type: "pkcs8", format: "pem" }).toString(),
    });

    await expect(signGitHubAppJwt(credential)).rejects.toMatchObject({ status: 400 });
  });
});

describe("GitHub installation token cache", () => {
  let key: TestKey;

  beforeEach(async () => {
    key = await createTestKey();
    clearGitHubInstallationTokenCache();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("mints once and shares the token across runs of the same installation", async () => {
    const fetcher = vi.fn<typeof fetch>(async () => mintResponse(60 * 60 * 1000));
    const values = { appId, installationId, privateKey: key.pkcs1 };

    const first = createGitHubInstallationTokenResolver(values, fetcher);
    const second = createGitHubInstallationTokenResolver(values, fetcher);
    const [tokenA, tokenB] = await Promise.all([first(), second()]);

    expect(tokenA).toBe("ghs_minted");
    expect(tokenB).toBe("ghs_minted");
    expect(fetcher).toHaveBeenCalledTimes(1);
    const [url, init] = fetcher.mock.calls[0]!;
    expect(String(url)).toBe(`https://api.github.com/app/installations/${installationId}/access_tokens`);
    expect(init?.method).toBe("POST");
    const headers = init?.headers as Record<string, string> | undefined;
    const authorization = headers?.authorization ?? "";
    expect(authorization.startsWith("Bearer ")).toBe(true);
    expect(authorization.slice("Bearer ".length).split(".")).toHaveLength(3);
  });

  it("mints again once the cached token is within five minutes of expiry", async () => {
    vi.useFakeTimers({ now: Date.parse("2026-10-18T02:00:00Z") });
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(mintResponse(60 * 60 * 1000, "ghs_first"))
      .mockResolvedValueOnce(mintResponse(60 * 60 * 1000, "ghs_second"));
    const access = createGitHubInstallationTokenResolver({ appId, installationId, privateKey: key.pkcs1 }, fetcher);

    expect(await access()).toBe("ghs_first");
    vi.setSystemTime(Date.parse("2026-10-18T02:56:00Z"));
    expect(await access()).toBe("ghs_second");
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("does not cache a failed mint", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(Response.json({ message: "Bad credentials" }, { status: 401 }))
      .mockResolvedValueOnce(mintResponse(60 * 60 * 1000));
    const access = createGitHubInstallationTokenResolver({ appId, installationId, privateKey: key.pkcs1 }, fetcher);

    await expect(access()).rejects.toMatchObject({ status: 401 });
    expect(await access()).toBe("ghs_minted");
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("keys the cache by installation, so two installations never share a token", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(mintResponse(60 * 60 * 1000, "ghs_one"))
      .mockResolvedValueOnce(mintResponse(60 * 60 * 1000, "ghs_two"));

    const one = createGitHubInstallationTokenResolver({ appId, installationId, privateKey: key.pkcs1 }, fetcher);
    const two = createGitHubInstallationTokenResolver({ appId, installationId: "99", privateKey: key.pkcs1 }, fetcher);

    expect(await one()).toBe("ghs_one");
    expect(await two()).toBe("ghs_two");
  });

  it("joins one replacement mint when concurrent callers all find the token stale", async () => {
    vi.useFakeTimers({ now: Date.parse("2026-10-18T02:00:00Z") });
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(mintResponse(60 * 60 * 1000, "ghs_first"))
      .mockResolvedValueOnce(mintResponse(60 * 60 * 1000, "ghs_second"));
    const access = createGitHubInstallationTokenResolver({ appId, installationId, privateKey: key.pkcs1 }, fetcher);
    expect(await access()).toBe("ghs_first");

    vi.setSystemTime(Date.parse("2026-10-18T02:56:00Z"));
    const tokens = await Promise.all([access(), access(), access()]);

    expect(tokens).toEqual(["ghs_second", "ghs_second", "ghs_second"]);
    // One initial mint, one replacement — not one replacement per waiting caller.
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("reports a failed mint to every caller that joined it, without a retry burst", async () => {
    let answerMint: ((response: Response) => void) | undefined;
    const fetcher = vi
      .fn<typeof fetch>()
      .mockReturnValueOnce(new Promise<Response>((resolve) => (answerMint = resolve)))
      .mockResolvedValueOnce(mintResponse(60 * 60 * 1000));
    const access = createGitHubInstallationTokenResolver({ appId, installationId, privateKey: key.pkcs1 }, fetcher);

    const first = access();
    const second = access();
    // The mint signs a JWT before it fetches, so wait for the single request;
    // both callers are then waiting on the same in-flight mint.
    await vi.waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1));
    answerMint!(Response.json({ message: "Bad credentials" }, { status: 401 }));

    await expect(first).rejects.toMatchObject({ status: 401 });
    await expect(second).rejects.toMatchObject({ status: 401 });
    expect(fetcher).toHaveBeenCalledTimes(1);
    // The failure was evicted, so the next call starts over and succeeds.
    expect(await access()).toBe("ghs_minted");
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
  it("mints a new token after private-key rotation", async () => {
    const replacement = await createTestKey();
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(mintResponse(3600000, "old-token"))
      .mockResolvedValueOnce(mintResponse(3600000, "new-token"));
    expect(
      await createGitHubInstallationTokenResolver({ appId, installationId, privateKey: key.pkcs1 }, fetcher)(),
    ).toBe("old-token");
    expect(
      await createGitHubInstallationTokenResolver({ appId, installationId, privateKey: replacement.pkcs1 }, fetcher)(),
    ).toBe("new-token");
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("does not reuse a cached token for an invalid private key", async () => {
    const fetcher = vi.fn<typeof fetch>(async () => mintResponse(3600000));
    await createGitHubInstallationTokenResolver({ appId, installationId, privateKey: key.pkcs1 }, fetcher)();
    const resolve = createGitHubInstallationTokenResolver(
      { appId, installationId, privateKey: "-----BEGIN PRIVATE KEY-----\ninvalid\n-----END PRIVATE KEY-----" },
      fetcher,
    );
    await expect(resolve()).rejects.toMatchObject({ status: 400 });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("cancels one waiter without cancelling a shared mint", async () => {
    const response = Promise.withResolvers<Response>();
    const fetcher = vi.fn<typeof fetch>(() => response.promise);
    const resolve = createGitHubInstallationTokenResolver({ appId, installationId, privateKey: key.pkcs1 }, fetcher);
    const controller = new AbortController();
    const reason = new Error("Caller cancelled");
    const cancelled = expect(resolve(controller.signal)).rejects.toBe(reason);
    const remaining = resolve();
    await vi.waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1));
    controller.abort(reason);
    await cancelled;
    expect(fetcher.mock.calls[0]![1]?.signal?.aborted).toBe(false);
    response.resolve(mintResponse(3600000));
    expect(await remaining).toBe("ghs_minted");
    expect(await resolve()).toBe("ghs_minted");
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("does not start a mint for an already cancelled caller", async () => {
    const fetcher = vi.fn<typeof fetch>();
    const signal = AbortSignal.abort();
    const resolve = createGitHubInstallationTokenResolver({ appId, installationId, privateKey: key.pkcs1 }, fetcher);
    await expect(resolve(signal)).rejects.toBe(signal.reason);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("times out a shared mint and permits a subsequent retry", async () => {
    vi.useFakeTimers();
    const fetcher = vi
      .fn<typeof fetch>()
      .mockImplementationOnce(
        (_url, init) =>
          new Promise<Response>((_resolve, reject) => {
            init!.signal!.addEventListener("abort", () => reject(init!.signal!.reason), { once: true });
          }),
      )
      .mockResolvedValueOnce(mintResponse(3600000));
    const resolve = createGitHubInstallationTokenResolver({ appId, installationId, privateKey: key.pkcs1 }, fetcher);
    const first = expect(resolve()).rejects.toMatchObject({ status: 504 });
    const second = expect(resolve()).rejects.toMatchObject({ status: 504 });
    await vi.waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1));
    await vi.advanceTimersByTimeAsync(30000);
    await Promise.all([first, second]);
    expect(await resolve()).toBe("ghs_minted");
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
