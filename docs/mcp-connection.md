# Rainbow Operations MCP Gateway

## Endpoint

Use the Streamable HTTP MCP endpoint:

```text
https://rainbowinternationalschool.in/mcp
```

## Required configuration

The gateway is intentionally disabled unless both settings are present:

- `MCP_ENABLED=true`
- `MCP_ADMIN_TOKEN` — a new, high-entropy secret dedicated only to MCP clients

Never use browser sessions, the general admin token, Indra token, or Google credentials to connect an MCP client.

## Client configuration

Configure an MCP client with:

- **Transport:** Streamable HTTP
- **URL:** `https://rainbowinternationalschool.in/mcp`
- **Header:** `Authorization: Bearer <MCP_ADMIN_TOKEN>`

The gateway creates an MCP session after the client sends `initialize`; clients must retain the returned `Mcp-Session-Id` header for follow-up requests.

## Safety model

- Only named operations are available. There is no generic HTTP proxy, arbitrary SQL tool, debug route, upload capability, or credential access.
- The gateway uses the application’s existing validation for each approved operation.
- Lead archiving, branch deletion, sheet pulls/resyncs, SEO checks, and blog deletion require `confirm: true`.
- Consequential calls require an idempotency key. Retries are reserved durably and ambiguous outcomes are held for reconciliation rather than repeated.
- Requests are rate-limited, sessions expire after inactivity, and calls are audited with redacted arguments.
- OAuth provisioning is not part of this release; clients authenticate with the dedicated bearer token.

## Available capability groups

- Live dashboard, admissions, marketing, RIS/RPS sales, and SEO reports
- CRM summary, lead creation, lookup, history, update, and archive
- CRM branch, staff, and lookup-list administration
- CRM sheet status, pull logs, pull, and resynchronization operations
- Editorial post listing, creation, update, and deletion

## Publishing prerequisite

The MCP audit and retry-protection tables are part of the managed application schema. Before enabling the published endpoint, use the Publish flow to review and apply the schema diff, then verify `/mcp` with an authenticated client. Do not add database DDL to the application startup or deployment build: managed schema changes are applied by the Publish flow.

After publishing, verify the production endpoint with an MCP client before relying on it operationally.