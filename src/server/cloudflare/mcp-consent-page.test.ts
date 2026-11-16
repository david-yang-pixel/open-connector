import { expect, it } from "vitest";
import { renderMcpConsentPage } from "./mcp-consent-page.ts";

it("escapes untrusted client metadata and the consent handle", () => {
  const html = renderMcpConsentPage(
    {
      clientId: "unverified-client",
      clientName: '<img src=x onerror="alert(1)">',
      clientDomain: "example.com<script>",
      redirectHost: "callback.example<script>",
      redirectUri: "https://callback.example/return",
      redirectIsLoopback: false,
      scope: ["mcp:access"],
    },
    '" autofocus onfocus="alert(1)',
    ["mcp:access", "offline_access", "evil<script>"],
  );
  expect(html).not.toContain("<img");
  expect(html).not.toContain("<script>");
  expect(html).not.toContain('value="" autofocus');
  expect(html).toContain("&#60;img");
  expect(html).toContain('type="password"');
  expect(html).toContain("including write Actions");
  expect(html).toContain("<code>mcp:access</code>");
  expect(html).toContain("<code>offline_access</code>");
  expect(html).toContain("<code>evil&#60;script&#62;</code>");
  expect(html).toContain("Keep this connection active for up to 30 days");
});
