import { describe, expect, it } from "vitest";
import {
  oauthProviderErrorCode,
  parseOAuthResultOrigins,
  renderOAuthCompletionPage,
  renderOAuthRefusedPage,
} from "./oauth-completion-page.ts";

describe("renderOAuthCompletionPage", () => {
  it("renders escaped completion content and the broadcast payload", () => {
    const html = renderOAuthCompletionPage('oauth_<example>"');

    expect(html).toContain("Connection complete");
    expect(html).toContain("Close this window to continue where you started.");
    expect(html).toContain('"type":"oauth.completed"');
    expect(html).toContain('"service":"oauth_\\u003cexample>\\""');
    expect(html).toContain("BroadcastChannel");
    expect(html).not.toContain("OOMOL Connect");
    expect(html).not.toContain("OAuth finished");
  });

  it("embeds client-side translations and a manual-close fallback", () => {
    const html = renderOAuthCompletionPage("github");

    // Localizable nodes are marked so the client script can swap text.
    expect(html).toContain('data-t="badge"');
    expect(html).toContain('data-t="title"');
    expect(html).toContain("data-close-note");
    // Bundled locales (English default plus at least one non-English locale).
    expect(html).toContain("连接完成");
    expect(html).toContain("接続が完了しました");
    // Honest close handling: a manual-close hint replaces the countdown when
    // window.close() is blocked on a user-navigated tab.
    expect(html).toContain("现在可以手动关闭此窗口。");
    expect(html).toContain("navigator.languages");
  });
});

describe("renderOAuthRefusedPage", () => {
  it("posts nothing when no result origin is configured", () => {
    const html = renderOAuthRefusedPage({ code: "access_denied", state: "s1", resultOrigins: [] });

    expect(html).toContain("Authorization cancelled");
    expect(html).toContain("已取消授权");
    expect(html).not.toContain("postMessage");
    expect(html).toContain("let remaining=5;");
  });

  it("posts nothing when the callback did not end a pending authorization", () => {
    const html = renderOAuthRefusedPage({ code: "access_denied", resultOrigins: ["https://a.example.com"] });

    expect(html).not.toContain("postMessage");
  });

  it("posts to each configured origin, never to *, escapes the state and keeps the close delay", () => {
    const html = renderOAuthRefusedPage({
      code: "server_error",
      state: '</script><b>"',
      resultOrigins: ["https://a.example.com", "https://b.example.com"],
      closeDelaySeconds: 0,
    });

    expect(html).toContain("Authorization not completed");
    expect(html).toContain("<code>server_error</code>");
    expect(html).toContain(
      '"type":"oauth.refused","status":"error","code":"server_error","state":"\\u003c/script>\\u003cb>\\""',
    );
    expect(html).toContain('for(const origin of ["https://a.example.com","https://b.example.com"])');
    expect(html).not.toContain("</script><b>");
    expect(html).not.toContain('"*"');
    expect(html).toContain("let remaining=0;");
  });

  it("leaves closing to the countdown after posting the result", () => {
    const html = renderOAuthRefusedPage({
      code: "access_denied",
      state: "s1",
      resultOrigins: ["https://a.example.com"],
      closeDelaySeconds: 7,
    });

    const post = html.slice(html.indexOf("window.opener.postMessage"));
    expect(post.slice(0, post.indexOf("\n"))).not.toContain("window.close()");
    expect(html).toContain("let remaining=7;");
  });
});

describe("parseOAuthResultOrigins", () => {
  it("reads a comma-separated list of exact origins", () => {
    expect(parseOAuthResultOrigins(undefined)).toEqual([]);
    expect(parseOAuthResultOrigins(" https://a.example.com/ ,http://localhost:3000,https://a.example.com")).toEqual([
      "https://a.example.com",
      "http://localhost:3000",
    ]);
  });

  it("refuses a wildcard or anything that is not an origin", () => {
    expect(() => parseOAuthResultOrigins("*")).toThrow(/exact http\(s\) origin/);
    expect(() => parseOAuthResultOrigins("https://a.example.com/path")).toThrow();
    expect(() => parseOAuthResultOrigins("javascript:alert(1)")).toThrow();
  });
});

describe("oauthProviderErrorCode", () => {
  it("echoes a code-shaped error and replaces anything else", () => {
    expect(oauthProviderErrorCode("access_denied")).toBe("access_denied");
    expect(oauthProviderErrorCode("<img src=x>")).toBe("provider_error");
    expect(oauthProviderErrorCode("x".repeat(65))).toBe("provider_error");
  });
});
