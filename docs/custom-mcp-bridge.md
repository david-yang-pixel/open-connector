# Custom Remote MCP Bridge

OpenConnector's `custom_mcp` provider preserves the remote MCP contract instead of treating every tool result as an
opaque JSON provider response. This document is the maintained behavior contract for discovery, execution, safety,
pagination, large results, and operational fallback.

## Discovery And Freshness

`custom_mcp.list_tools` reads the remote server on every call and follows the remote `tools/list` `nextCursor` until
the directory is complete. Each tool includes its live `inputSchema`, MCP
`annotations`, derived `operationType`, `confirmationRequired`, and a dynamic policy id:

```text
custom_mcp.remote.<percent-encoded-tool-name>
```

No stored tool snapshot is used for execution. `call_tool` lists tools again in the same MCP session before invoking
one, so a removed tool fails as `unknown_action` and a changed schema or annotation applies immediately.

MCP hosts may cache OpenConnector's own fixed tool declarations for the lifetime of a client session. After an
OpenConnector upgrade changes a dispatcher schema, such as adding `search_actions.cursor`, reconnect or reload the MCP
client (or start a new client task) to refresh `tools/list`. The server accepts the new field immediately, but it cannot
rewrite a declaration already cached inside an existing host session.

## Validation, Risk, And Confirmation

OpenConnector validates `arguments` against the remote tool's current JSON Schema before sending the call. It derives
risk conservatively:

- `destructiveHint: true` -> `destructive`
- otherwise `readOnlyHint: true` -> `read`
- missing or non-read annotations -> `write`

If a remote server omits or misstates annotations, the connection owner can set `toolOperationTypes` to a JSON map of
tool names to `read`, `write`, or `destructive`. This trusted local override takes precedence over remote hints; unknown
tools remain conservatively classified as `write`.

The static dispatcher action is followed by a second server-side policy evaluation of the dynamic tool action. This
makes `@operation:*` and exact dynamic action rules effective at execution time. A `write` or `destructive` call must
also include an exact `confirmOperation` value. This is a caller attestation and a defense-in-depth gate; it cannot
cryptographically prove that a human approved the request, so clients must still obtain explicit user intent.

## Timeouts And Endpoint Fallback

Custom credentials accept these optional fields:

- `requestTimeoutMs`: connection, discovery, and default tool timeout; 1,000 through 900,000 ms.
- `toolTimeouts`: JSON object mapping tool names to timeout milliseconds.
- `toolOperationTypes`: trusted local risk overrides described above.
- `fallbackServerUrls`: ordered JSON array of alternate MCP endpoints used when connection setup fails.

Operators can update these optional, non-secret fields without resubmitting `serverUrl` or an authorization token:

```http
PATCH /api/connections/custom_mcp
Content-Type: application/json

{
  "connectionName": "dify-signoz",
  "values": {
    "toolOperationTypes": "{\"signoz_search_logs\":\"read\"}",
    "paginationRules": "{\"signoz_search_logs\":{\"mode\":\"offset\",\"requestOffsetField\":\"offset\",\"requestLimitField\":\"limit\",\"responseItemsPath\":\"data\"}}"
  }
}
```

Only optional non-secret fields declared by the provider are patchable. Required fields and secrets are rejected, the
merged credential is revalidated, and a concurrent connection change prevents the patch from being committed.

The admin-only settings view returns the currently configured optional non-secret values, while continuing to omit the
primary endpoint, authorization token, and every provider-declared secret:

```http
GET /api/connections/custom_mcp/settings?connectionName=dify-signoz
```

An omitted `fallbackServerUrls`, `requestTimeoutMs`, or `toolTimeouts` value means that setting was not explicitly
configured. This endpoint reports configuration; it does not claim that a fallback endpoint is healthy.

OpenConnector tries Streamable HTTP and then SSE where applicable. It never retries a tool callback on another
transport or endpoint after invocation begins, because retrying a write could duplicate an external effect. Errors
identify the remote-MCP transport layer and whether the failure is retryable.

## Native Content And Large Results

Remote `text`, `image`, `audio`, `resource`, and `resource_link` blocks remain MCP content blocks when the caller uses
OpenConnector's MCP endpoint. `structuredContent` remains structured and JSON text is not stringified a second time.

`inlineResultMaxBytes` defaults to 262,144 bytes and accepts 4 KiB through 16 MiB. A larger block or structured payload
is stored through the configured transit-file backend and replaced by an MCP `resource_link`. Result metadata always
includes `truncated`, inline byte counts, and stored-file descriptors. If the complete result cannot fit either inline
or in transit storage, execution fails explicitly with `result_too_large`; OpenConnector never silently clips it.

When a remote server repeats the same large JSON in both a text block and `structuredContent`, OpenConnector stores one
structured JSON file and removes the duplicate text copy. When an oversized image, audio block, or binary resource is
also repeated as Base64 inside `structuredContent`, the binary is stored once and the duplicate Base64 value is
replaced by the same download URL. Result metadata reports the number of removed copies as `deduplicatedCopies`.

## Remote Pagination Rules

Remote MCP pagination is provider-specific, so connections may declare `paginationRules` as JSON keyed by tool name.
Cursor, offset, and page-number contracts are supported:

```json
{
  "conversation_log": {
    "mode": "cursor",
    "requestCursorField": "conversation_after",
    "requestLimitField": "limit",
    "responseItemsPath": "messages",
    "responseNextCursorPath": "next_cursor",
    "responseHasMorePath": "has_more",
    "responseTotalPath": "total",
    "maxPages": 100,
    "stable": true
  },
  "query_range": {
    "mode": "offset",
    "requestOffsetField": "offset",
    "requestLimitField": "limit",
    "responseItemsPath": "data.rows",
    "responseHasMorePath": "data.has_more",
    "maxPages": 50
  },
  "list_tickets": {
    "mode": "page",
    "requestPageField": "page",
    "requestLimitField": "per_page",
    "responseItemsPath": "data.tickets",
    "responseNextPagePath": "data.next_page",
    "responseTotalPath": "data.count",
    "maxPages": 100,
    "stable": false
  }
}
```

`call_tool.pagination.mode` is `single` or `all`. A single page returns an opaque `nextCursor`; a bounded `all` call
follows pages, merges the configured item array, and reports `pagesFetched`, `recordCount`, `hasMore`, `truncated`,
`remainingRecords`, `nextCursor`, and `stable`. If the page budget is reached, callers can resume from `nextCursor`.
OpenConnector reports `stable: true` only when the connection owner declared that the remote cursor provides stable
snapshot semantics.

The pagination object is returned in both MCP `_meta` and
`structuredContent["io.oomol.open-connector/pagination"]`. Clients that hide MCP metadata can therefore still inspect
continuation and stability information. `stable: false` is an explicit best-effort result: page-number and offset
pagination cannot guarantee an immutable export while upstream records are inserted or reordered. OpenConnector does
not relabel those contracts as stable unless the remote API provides a real snapshot guarantee.

## Availability And Equivalence

The bridge adds a network hop; software cannot remove that dependency from inside the failed hop itself. Deployments
that require availability beyond one process must run redundant OpenConnector instances with shared PostgreSQL and
transit-file storage, place them behind a health-checked load balancer, and retain a separately tested direct-MCP
fallback in the agent host. Cloudflare Workers supplies platform-level instance redundancy, but remote MCP availability
still needs endpoint fallback or remote-side high availability.

Generic tests cover pagination, native media, large-result transfer, schema rejection, policy denial, confirmation,
and timeout selection. A specific remote MCP is considered equivalent only after read, write-approval, long-pagination,
large-result, and attachment fixtures pass against that server; successful `list_tools` alone is not equivalence.
