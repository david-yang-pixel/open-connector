import type { OAuthClientConfig } from "../../oauth/oauth-client-config-service.ts";
import type { ChannelCredentialSource } from "./contract.ts";

import { describe, expect, it } from "vitest";
import { executorModules } from "../../providers/registry.generated.ts";
import { isChannelEventVerifyRequest, listChannelEventVerifiers } from "./registry.ts";

// Every field a verifier asks for reads as this value, so the checks below hold for any channel's fields.
const fixtureValue = "fixture-credential-value";
const anyFields = new Proxy<Record<string, string>>({}, { get: () => fixtureValue });

function configuredSource(): ChannelCredentialSource {
  const applicationConfig: OAuthClientConfig = {
    service: "fixture",
    clientId: fixtureValue,
    clientSecret: fixtureValue,
    extra: anyFields,
    secretExtra: anyFields,
  };
  return { connectionValues: anyFields, applicationConfig };
}

describe("channel event verifier registry", () => {
  const verifiers = listChannelEventVerifiers();

  it("registers only real provider services", () => {
    expect(verifiers.length).toBeGreaterThan(0);
    for (const [service] of verifiers) expect(Object.hasOwn(executorModules, service), service).toBe(true);
  });

  it("exempts exactly the registered POST verify routes from admin/runtime auth", () => {
    for (const [service] of verifiers) {
      expect(isChannelEventVerifyRequest(`/v1/providers/${service}/events/verify`, "POST")).toBe(true);
      expect(isChannelEventVerifyRequest(`/v1/providers/${service}/events/verify`, "GET")).toBe(false);
      expect(isChannelEventVerifyRequest(`/v1/providers/${service}/events/verify/extra`, "POST")).toBe(false);
    }
    expect(isChannelEventVerifyRequest("/v1/providers/github/events/verify", "POST")).toBe(false);
    expect(isChannelEventVerifyRequest("/v1/providers/constructor/events/verify", "POST")).toBe(false);
  });

  describe.each(verifiers)("%s", (_service, load) => {
    it("fails closed when its credential is not configured", async () => {
      const verifier = await load();
      expect(verifier.readCredential({})).toBeUndefined();
      expect(verifier.readCredential({ connectionValues: {} })).toBeUndefined();
    });

    it("rejects an unsigned request without echoing credential values", async () => {
      const verifier = await load();
      const credential = verifier.readCredential(configuredSource());
      expect(credential).toBeDefined();

      const verification = await verifier.verify(
        { headers: new Headers(), rawBody: new TextEncoder().encode("{}"), now: Date.now() },
        credential,
      );

      expect(verification.verified).toBe(false);
      expect(JSON.stringify(verification)).not.toContain(fixtureValue);
      expect(verifier.messages.notConfigured).not.toContain(fixtureValue);
    });
  });
});
