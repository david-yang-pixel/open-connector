import type { TinyfishEndpoint } from "./endpoints.ts";

import { s } from "../../core/json-schema.ts";
const empty = s.requiredObject("No parameters are required.", {});
const profileId = s.nonEmptyString("Browser Context Profile ID.");
const sessionId = s.nonEmptyString("Browser session ID.");
const profileInput = s.requiredObject("Select a Browser Context Profile.", { profileId });
const profileFields = {
  id: profileId,
  name: s.string("Browser Context Profile display name."),
  proxy_country_code: s.nullable(s.string("Proxy country code.")),
  is_default: s.boolean("Whether this is the default profile."),
  fingerprint_seed: s.string("Browser fingerprint seed."),
  domain_count: s.integer("Number of saved domains.", { minimum: 0 }),
  created_at: s.string("Creation timestamp."),
  updated_at: s.string("Last update timestamp."),
};
const domainState = s.looseObject("Saved domain state metadata.", {
  domain: s.string("Saved domain."),
  cookie_count: s.integer("Saved cookie count.", { minimum: 0 }),
  local_storage_origin_count: s.integer("Saved local storage origin count.", { minimum: 0 }),
  last_accessed_at: s.string("Last access timestamp."),
  last_written_at: s.string("Last write timestamp."),
  last_written_by_run_id: s.string("Run that last wrote the state."),
});
const profile = s.object("Browser Context Profile metadata.", profileFields, {
  required: ["id", "name", "created_at"],
  additionalProperties: true,
});
const profileDetail = s.object(
  "Browser Context Profile and saved domains.",
  {
    ...profileFields,
    domains: s.array("Saved domains.", domainState),
  },
  {
    required: ["id", "name", "created_at", "domains"],
    additionalProperties: true,
  },
);
const profileChanges = {
  name: s.nonEmptyString("Profile display name.", { maxLength: 100 }),
  set_as_default: s.boolean("Set this profile as the default."),
  proxy_country_code: s.nullable(s.string("Proxy country code, or null to clear it.")),
};
const sessionFields = {
  session_id: sessionId,
  cdp_url: s.string("WebSocket URL for a CDP client to connect to the browser.", { format: "uri" }),
  base_url: s.string("HTTPS base URL for browser session endpoints.", { format: "uri" }),
};
const sessionParameters = {
  url: s.string("Startup URL; bare domains are prefixed with https://. Omit to start at about:blank."),
  timeout_seconds: s.nullable(
    s.integer("Inactivity timeout in seconds. Omitted, null, or above the plan maximum uses the plan maximum.", {
      minimum: 5,
      maximum: 86400,
    }),
  ),
};
const savedFields = {
  domains_updated: s.stringArray("Domains whose state was saved."),
  domains_failed: s.stringArray("Domains whose state could not be saved."),
  cookie_count: s.integer("Saved cookie count.", { minimum: 0 }),
  domains_skipped: s.looseObject("Domains skipped by state category.", {
    cookies_skipped: s.stringArray("Domains with skipped cookies."),
    local_storage_skipped: s.stringArray("Origins with skipped local storage."),
    session_storage_skipped: s.stringArray("Origins with skipped session storage."),
    blob_too_large: s.stringArray("Domains whose saved state exceeded the size limit."),
  }),
};
const stateSaved = s.looseObject("Profile state upload result.", savedFields);
const storage = s.array(
  "Browser storage grouped by origin.",
  s.requiredObject("Storage for one origin.", {
    origin: s.nonEmptyString("Storage origin.", { maxLength: 2048 }),
    items: s.array(
      "Stored name and value pairs.",
      s.requiredObject("One storage entry.", {
        name: s.string("Storage key.", { maxLength: 4096 }),
        value: s.string("Storage value, which may contain credentials.", { maxLength: 5242880 }),
      }),
    ),
  }),
  { maxItems: 100 },
);
const vaultProvider = s.stringEnum("Password manager provider.", ["1password", "bitwarden"]);
const vaultItem = s.looseObject("Display-safe vault item metadata; no secret field values.", {
  itemId: s.string("Vault item ID."),
  connectionId: s.nullable(s.string("Connection ID.")),
  label: s.string("Item display label."),
  vaultName: s.string("Vault name."),
  domains: s.stringArray("Domains associated with this item."),
  fieldMetadata: s.array(
    "Display-safe field metadata.",
    s.looseObject("Vault field metadata.", {
      fieldId: s.string("Field ID."),
      label: s.string("Field label."),
      type: s.stringEnum("Field type.", ["STRING", "CONCEALED", "OTP"]),
    }),
  ),
  hasTotp: s.boolean("Whether the item contains a time-based one-time password."),
});
const vaultItems = s.array("Available vault items.", vaultItem);
const deleted = s.looseObject("Deletion result.", {
  deleted: s.boolean("Whether the resource was deleted."),
});
const money = s.string("Decimal amount in USD.");
export const managementEndpoints: TinyfishEndpoint[] = [
  {
    name: "list_profiles",
    description: "List Browser Context Profiles and tracked signed-in sites.",
    operationType: "read",
    origin: "main",
    method: "GET",
    path: "/v1/profiles",
    inputSchema: empty,
    outputSchema: s.looseObject("Browser Context Profile list.", {
      profiles: s.array(
        "Available profiles.",
        s.object(
          "Profile and optional tracked sign-ins.",
          {
            ...profileFields,
            signed_in_sites: s.array(
              "Sites with saved sign-in cookies; this does not guarantee a valid session.",
              s.looseObject("Tracked signed-in site.", {
                site: s.string("Registered domain."),
                claimed_at: s.string("Sign-in tracking timestamp."),
              }),
            ),
          },
          {
            required: ["id", "name", "created_at"],
            additionalProperties: true,
          },
        ),
      ),
    }),
  },
  {
    name: "create_profile",
    description: "Create a Browser Context Profile for reusable browser state.",
    operationType: "write",
    origin: "main",
    method: "POST",
    path: "/v1/profiles",
    inputSchema: s.object("New Browser Context Profile.", profileChanges, { required: ["name"] }),
    outputSchema: profile,
  },
  {
    name: "get_profile",
    description: "Get a Browser Context Profile and its saved domain metadata.",
    operationType: "read",
    origin: "main",
    method: "GET",
    path: "/v1/profiles/{profileId}",
    pathKeys: ["profileId"],
    inputSchema: profileInput,
    outputSchema: profileDetail,
  },
  {
    name: "update_profile",
    description: "Update profile metadata, default selection, or proxy country.",
    operationType: "write",
    origin: "main",
    method: "PATCH",
    path: "/v1/profiles/{profileId}",
    pathKeys: ["profileId"],
    inputSchema: s.object("Profile metadata changes.", { profileId, ...profileChanges }, { required: ["profileId"] }),
    outputSchema: profileDetail,
  },
  {
    name: "delete_profile",
    description: "Delete a Browser Context Profile and its saved state.",
    operationType: "destructive",
    origin: "main",
    method: "DELETE",
    path: "/v1/profiles/{profileId}",
    pathKeys: ["profileId"],
    inputSchema: profileInput,
    outputSchema: deleted,
  },
  {
    name: "create_profile_setup_session",
    description: "Start an interactive setup browser to sign in and capture state for a profile.",
    operationType: "write",
    origin: "main",
    method: "POST",
    path: "/v1/profiles/{profileId}/setup-session",
    pathKeys: ["profileId"],
    inputSchema: s.object(
      "Profile setup session parameters.",
      { profileId, ...sessionParameters },
      { required: ["profileId"] },
    ),
    outputSchema: s.looseObject("Interactive profile setup session.", {
      ...sessionFields,
      timeout_seconds: s.integer("Session inactivity timeout."),
      expires_at: s.string("Session expiry timestamp."),
    }),
  },
  {
    name: "cancel_profile_setup_session",
    description: "Cancel a profile setup session without saving browser state.",
    operationType: "destructive",
    origin: "main",
    method: "POST",
    path: "/v1/profiles/{profileId}/setup-session/cancel",
    pathKeys: ["profileId"],
    inputSchema: s.requiredObject("Profile setup session to cancel.", { profileId, session_id: sessionId }),
    outputSchema: s.looseObject("Cancellation result.", {
      cancelled: s.boolean("Whether the session was cancelled."),
    }),
  },
  {
    name: "save_profile_setup_session",
    description: "Save cookies and browser storage from a setup session into its profile.",
    operationType: "write",
    origin: "main",
    method: "POST",
    path: "/v1/profiles/{profileId}/save",
    pathKeys: ["profileId"],
    inputSchema: s.object(
      "Profile setup state to save.",
      {
        profileId,
        session_id: sessionId,
        signed_in_sites: s.array(
          "Hosts or URLs the user confirms signing into. Only sites with saved cookies are recorded.",
          s.string("Signed-in host or URL.", { maxLength: 253 }),
          { maxItems: 20 },
        ),
      },
      { optional: ["signed_in_sites"] },
    ),
    outputSchema: s.object(
      "Profile setup save result.",
      {
        ...savedFields,
        pages_captured: s.integer("Captured page count.", { minimum: 0 }),
        target_reads_skipped: s.integer("Skipped target read count.", { minimum: 0 }),
        cleanup_failed: s.boolean("Whether browser cleanup failed."),
        cleanup_kind: s.string("Cleanup operation kind."),
        signed_in_sites: s.stringArray("Sites recorded as signed in."),
        sign_in: s.looseObject("Sign-in detection for the setup's initial site.", {
          site: s.nullable(s.string("Site domain.")),
          status: s.stringEnum("Detection status.", ["recorded", "already_recorded", "not_detected", "unverifiable"]),
        }),
        user_confirmed_sites: s.looseObject("Results for user-confirmed sites.", {
          recorded: s.stringArray("Recorded registered domains."),
          rejected: s.array(
            "Rejected sites.",
            s.looseObject("Rejected site and reason.", {
              site: s.string("Rejected site."),
              reason: s.stringEnum("Rejection reason.", [
                "invalid_site",
                "not_saved",
                "no_sign_in_cookie",
                "record_failed",
              ]),
            }),
          ),
        }),
      },
      {
        required: ["domains_updated", "domains_failed", "cookie_count", "domains_skipped"],
        additionalProperties: true,
      },
    ),
  },
  {
    name: "upload_profile_state",
    description: "Upload cookies, local storage, and session storage into a Browser Context Profile.",
    operationType: "write",
    origin: "main",
    method: "POST",
    path: "/v1/profiles/{profileId}/upload",
    pathKeys: ["profileId"],
    inputSchema: s.object(
      "Browser state to save in the profile.",
      {
        profileId,
        cookies: s.array(
          "Browser cookies, including secret values.",
          s.object(
            "Browser cookie with optional browser-specific properties.",
            {
              name: s.nonEmptyString("Cookie name.", { maxLength: 4096 }),
              value: s.string("Cookie value.", { maxLength: 16384 }),
              domain: s.nonEmptyString("Cookie domain.", { maxLength: 255 }),
              path: s.string("Cookie path.", { maxLength: 4096 }),
              httpOnly: s.boolean("HTTP-only cookie."),
              secure: s.boolean("Secure cookie."),
              sameSite: s.stringEnum("Same-site policy.", ["Strict", "Lax", "None"]),
              expires: s.number("Cookie expiry timestamp."),
              sourceScheme: s.string("Cookie source scheme.", { maxLength: 10 }),
              sourcePort: s.number("Cookie source port."),
              partitionKey: s.nullable(s.string("Cookie partition key.", { maxLength: 255 })),
              priority: s.stringEnum("Cookie priority.", ["Low", "Medium", "High"]),
            },
            { required: ["name", "value", "domain"], additionalProperties: true },
          ),
          { maxItems: 3000 },
        ),
        localStorage: storage,
        sessionStorage: s.describe(storage, "Session storage grouped by origin."),
      },
      { optional: ["localStorage", "sessionStorage"] },
    ),
    outputSchema: stateSaved,
  },
  {
    name: "delete_profile_domain",
    description: "Delete cookies and storage for one saved profile domain.",
    operationType: "destructive",
    origin: "main",
    method: "DELETE",
    path: "/v1/profiles/{profileId}/domains/{domain}",
    pathKeys: ["profileId", "domain"],
    inputSchema: s.requiredObject("Saved domain to remove.", {
      profileId,
      domain: s.nonEmptyString("Domain to remove from the profile."),
    }),
    outputSchema: deleted,
  },
  {
    name: "connect_vault",
    description: "Connect 1Password or Bitwarden and immediately sync display-safe credential metadata.",
    operationType: "write",
    origin: "main",
    method: "POST",
    path: "/v1/vault/connections",
    inputSchema: s.object(
      "Password manager credentials.",
      {
        provider: vaultProvider,
        token: s.string("1Password service account token; required for 1password."),
        clientId: s.string("Bitwarden client ID; required for bitwarden."),
        clientSecret: s.string("Bitwarden client secret; required for bitwarden."),
        masterPassword: s.string("Bitwarden master password; required for bitwarden."),
        serverUrl: s.string("Optional self-hosted Bitwarden server URL.", { format: "uri" }),
      },
      {
        required: ["provider"],
        anyOf: [
          { properties: { provider: { const: "1password" } }, required: ["token"] },
          {
            properties: { provider: { const: "bitwarden" } },
            required: ["clientId", "clientSecret", "masterPassword"],
          },
        ],
      },
    ),
    outputSchema: s.looseObject("Connected vault and available item metadata.", {
      connectionId: s.string("Connection ID."),
      connected: s.boolean("Whether the vault is connected."),
      provider: vaultProvider,
      items: vaultItems,
    }),
  },
  {
    name: "list_vault_connections",
    description: "List connected password managers and validation status.",
    operationType: "read",
    origin: "main",
    method: "GET",
    path: "/v1/vault/connections",
    inputSchema: empty,
    outputSchema: s.looseObject("Connected password managers.", {
      connections: s.array(
        "Vault connections.",
        s.looseObject("Vault connection metadata.", {
          id: s.string("Connection ID."),
          provider: vaultProvider,
          connectionStatus: s.string("Connection status."),
          lastValidatedAt: s.nullable(s.string("Last validation timestamp.")),
        }),
      ),
    }),
  },
  {
    name: "disconnect_vault",
    description: "Disconnect a password manager and remove its stored enabled items.",
    operationType: "destructive",
    origin: "main",
    method: "DELETE",
    path: "/v1/vault/connections/{connectionId}",
    pathKeys: ["connectionId"],
    inputSchema: s.requiredObject("Vault connection to disconnect.", {
      connectionId: s.string("Connection ID."),
    }),
    outputSchema: s.looseObject("Vault disconnection result.", {
      disconnected: s.boolean("Whether the vault was disconnected."),
      connectionId: s.string("Connection ID."),
    }),
  },
  {
    name: "list_vault_items",
    description: "List display-safe vault item metadata available from connected password managers.",
    operationType: "read",
    origin: "main",
    method: "GET",
    path: "/v1/vault/items",
    inputSchema: empty,
    outputSchema: s.looseObject("Available vault items.", { items: vaultItems }),
  },
  {
    name: "sync_vault_items",
    description: "Sync connected password managers and return item metadata and synchronization counts.",
    operationType: "write",
    origin: "main",
    method: "POST",
    path: "/v1/vault/items/sync",
    inputSchema: empty,
    outputSchema: s.looseObject("Synchronized vault metadata.", {
      items: vaultItems,
      sync_summary: s.looseObject("Synchronization counts.", {
        added: s.integer("Added item count.", { minimum: 0 }),
        updated: s.integer("Updated item count.", { minimum: 0 }),
        removed: s.integer("Removed item count.", { minimum: 0 }),
      }),
    }),
  },
  {
    name: "get_wallet",
    description: "Get wallet balance, auto-reload configuration, rates, and pending top-up details.",
    operationType: "read",
    origin: "main",
    method: "GET",
    path: "/v1/wallet",
    inputSchema: empty,
    outputSchema: s.object(
      "Wallet balance and billing configuration.",
      {
        available_balance: s.string("Spendable decimal USD balance; negative means overdrawn."),
        currency: s.stringEnum("Wallet currency.", ["USD"]),
        as_of: s.dateTime("Balance observation timestamp."),
        auto_reload: s.nullable(
          s.object(
            "Auto-reload configuration; null means the contract read failed.",
            {
              state: s.stringEnum("Auto-reload state.", [
                "unconfigured",
                "on",
                "off",
                "paused_payment_failed",
                "needs_payment_method",
              ]),
              threshold: s.describe(money, "Balance floor triggering reload."),
              recharge_to: s.describe(money, "Target balance after reload."),
            },
            {
              required: ["state"],
              additionalProperties: true,
            },
          ),
        ),
        pending_top_up: s.nullable(
          s.looseObject("In-flight top-up; null also covers a failed ledger read.", {
            amount: money,
            started_at: s.dateTime("Top-up start timestamp."),
          }),
        ),
        rates: s.nullable(
          s.looseObject("Rates; null means unavailable or no rate contract.", {
            meters: s.array(
              "Priced product meters.",
              s.object(
                "One priced meter.",
                {
                  label: s.string("Meter label."),
                  unit_amount: s.describe(money, "Decimal USD per-unit price."),
                  currency: s.stringEnum("Rate currency.", ["USD"]),
                  per: s.string("Billable unit, if labeled."),
                },
                {
                  required: ["label", "unit_amount", "currency"],
                  additionalProperties: true,
                },
              ),
            ),
            as_of: s.dateTime("Rates observation timestamp."),
          }),
        ),
        agent_top_up_url: s.string("Top-up endpoint when agent-paid funding is available.", {
          format: "uri",
        }),
      },
      {
        required: ["available_balance", "currency", "as_of", "auto_reload", "pending_top_up", "rates"],
        additionalProperties: true,
      },
    ),
  },
  {
    name: "top_up_wallet",
    description:
      "Request a wallet top-up or submit caller-supplied MPP payment authorization. Return the payment challenge when payment is required. A pending result means payment was charged; do not pay again.",
    operationType: "write",
    origin: "main",
    method: "POST",
    path: "/v1/wallet/top-up",
    inputSchema: s.object(
      "Wallet top-up request.",
      {
        amount: s.string("USD amount from 10.00 to 500.00, with at most two decimal places.", {
          pattern: "^(?=.*[1-9])(?:0|[1-9]\\d{0,11})(?:\\.\\d{1,2})?$",
        }),
        paymentAuthorization: s.nonEmptyString(
          "Caller-signed MPP Payment-Authorization header value. Omit to obtain a challenge.",
        ),
      },
      { optional: ["paymentAuthorization"] },
    ),
    outputSchema: {
      description: "Payment challenge, settled payment, or pending wallet credit.",
      anyOf: [
        s.looseObject(
          "Payment required; inspect the challenge and problem body before deciding whether to authorize payment.",
          {
            status: s.stringEnum("Payment challenge status.", ["payment_required"]),
            challenge: s.string(
              "WWW-Authenticate payment challenge. A rejected paid attempt without a challenge is returned as an error with provider guidance.",
            ),
            body: s.unknown("Original MPP problem response, including any instruction not to pay again."),
          },
        ),
        s.object(
          "Top-up payment result.",
          {
            status: s.stringEnum("Settled or pending credit. Pending means already charged; do not pay again.", [
              "settled",
              "pending",
            ]),
            amount: money,
            currency: s.stringEnum("Payment currency.", ["USD"]),
            payment_reference: s.string("PaymentIntent reference."),
            ledger_entry_id: s.nullable(s.string("Ledger entry ID.")),
            available_balance: s.nullable(s.string("Spendable balance after credit; null when pending or unreadable.")),
            hint: s.string("Provider payment guidance; on pending results, do not pay again."),
          },
          {
            required: ["status", "amount", "currency", "payment_reference", "ledger_entry_id", "available_balance"],
            additionalProperties: true,
          },
        ),
      ],
    },
  },
  {
    name: "create_browser_session",
    description: "Create a remote browser session and return CDP connection details for an external browser client.",
    operationType: "write",
    origin: "browser",
    method: "POST",
    path: "/",
    inputSchema: s.object(
      "Remote browser session parameters.",
      {
        ...sessionParameters,
        proxy_config: s.object(
          "Browser proxy configuration; omitted uses TinyFish's US proxy.",
          {
            enabled: s.boolean("Route through a proxy; false uses direct egress."),
            type: s.stringEnum("Proxy provider; custom requires url.", ["tinyfish", "custom"]),
            country_code: s.string("TinyFish proxy exit country, ISO 3166-1 alpha-2."),
            url: s.string("Custom HTTP or HTTPS proxy URL.", { format: "uri" }),
            username: s.string("Custom proxy username."),
            password: s.string("Custom proxy password."),
          },
          {
            required: [],
            anyOf: [
              { properties: { type: { const: "custom" } }, required: ["type", "url"] },
              { properties: { type: { const: "tinyfish" } } },
            ],
          },
        ),
      },
      { required: [] },
    ),
    outputSchema: s.looseObject("Created remote browser session.", sessionFields),
  },
  {
    name: "list_browser_usage",
    description: "List paginated browser session usage, filtered by session, timestamps, or status.",
    operationType: "read",
    origin: "browser",
    method: "GET",
    path: "/usage",
    queryKeys: ["session_id", "start_after", "end_before", "status", "limit", "page"],
    inputSchema: s.object(
      "Browser usage filters and pagination.",
      {
        session_id: s.string("Session ID filter."),
        start_after: s.dateTime("Include sessions starting after this timestamp."),
        end_before: s.dateTime("Include sessions ending before this timestamp."),
        status: s.stringEnum("Session status filter.", ["running", "ended"]),
        limit: s.integer("Page size; defaults to 100.", { minimum: 1, maximum: 1000 }),
        page: s.integer("Page number; defaults to 1.", { minimum: 1 }),
      },
      { required: [] },
    ),
    outputSchema: s.looseObject("Paginated browser usage.", {
      items: s.array(
        "Browser usage records.",
        s.looseObject("One browser usage record.", {
          session_id: sessionId,
          user_id: s.string("User ID."),
          sub_user_id: s.nullable(s.string("Sub-user ID.")),
          mode: s.stringEnum("Browser mode.", ["light", "stealth", "tf-browser"]),
          start_time: s.dateTime("Session start timestamp."),
          end_time: s.nullable(s.dateTime("Session end timestamp.")),
          duration_ms: s.nullable(s.integer("Duration in milliseconds.")),
          proxy_trg_rx_bytes: s.nullable(s.integer("Proxy received bytes.")),
          proxy_trg_tx_bytes: s.nullable(s.integer("Proxy transmitted bytes.")),
          status: s.stringEnum("Session status.", ["running", "ended", "created"]),
          created_at: s.dateTime("Creation timestamp."),
          updated_at: s.dateTime("Update timestamp."),
        }),
      ),
      total: s.integer("Total matching records."),
      limit: s.integer("Page size."),
      page: s.integer("Current page."),
      total_pages: s.integer("Total pages."),
      has_more: s.boolean("Whether more pages exist."),
    }),
  },
  {
    name: "terminate_browser_session",
    description: "Terminate a remote browser session; an already-ended session also succeeds.",
    operationType: "destructive",
    origin: "browser",
    method: "DELETE",
    path: "/{sessionId}",
    pathKeys: ["sessionId"],
    inputSchema: s.requiredObject("Browser session to terminate.", { sessionId }),
    outputSchema: s.requiredObject("Browser termination result.", {
      success: s.boolean("Whether the session termination succeeded."),
    }),
  },
];
