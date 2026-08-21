# Rainbow Operations MCP Gateway

## Endpoint

Use the Streamable HTTP MCP endpoint:

```text
https://rainbowinternationalschool.in/mcp
```

## Required configuration

The MCP gateway is intentionally disabled unless:

- `MCP_ENABLED=true`
- either the legacy `MCP_ADMIN_TOKEN` is configured for header-based clients,
  or the MCP-specific Google OAuth client is configured for OAuth clients.

OAuth clients require a **separate** Google Cloud OAuth web client:

- `MCP_GOOGLE_CLIENT_ID` — the MCP Google OAuth client ID;
- `MCP_GOOGLE_CLIENT_SECRET` — the MCP Google OAuth client secret;
- `MCP_GOOGLE_WORKSPACE_DOMAIN` — allowed Workspace domain; defaults to
  `rainbowinternationalschool.in`;
- `MCP_PUBLIC_URL` — production public origin, set to
  `https://rainbowinternationalschool.in` if the server may not infer it from
  the request host.

In Google Cloud, register this exact authorized redirect URI:

```text
https://rainbowinternationalschool.in/oauth/google/callback
```

Never reuse the Google Sheets client, browser sessions, the general admin
token, or Indra token for the MCP OAuth client.

## Client configuration

### Claude custom connector

Use the Streamable HTTP endpoint:

```text
https://rainbowinternationalschool.in/mcp
```

Claude discovers the MCP OAuth authorization server automatically. It
registers a public client, completes Google Workspace sign-in, and uses
PKCE-protected, short-lived MCP access tokens. Only verified accounts in the
approved Workspace domain can complete the flow.

### Compatible header-based clients

Clients that support a static authorization header can continue using:

```text
Authorization: Bearer <MCP_ADMIN_TOKEN>
```

The gateway creates an MCP session after the client sends `initialize`;
clients must retain the returned `Mcp-Session-Id` header for follow-up
requests.

## Safety model

- Only named operations are available. There is no generic HTTP proxy, arbitrary SQL tool, debug route, upload capability, or credential access.
- The gateway uses the application’s existing validation for each approved operation.
- Lead archiving, branch deletion, sheet pulls/resyncs, SEO checks, and blog deletion require `confirm: true`.
- Consequential calls require an idempotency key. Retries are reserved durably and ambiguous outcomes are held for reconciliation rather than repeated.
- Requests are rate-limited, sessions expire after inactivity, and calls are audited with redacted arguments.
- OAuth requires Authorization Code flow with PKCE S256. Authorization codes
  are single-use, access tokens are short-lived, and refresh tokens rotate on
  every use. The database retains only token/code hashes.
- OAuth-issued sessions are bound to the authenticating Workspace principal;
  one client cannot reuse another principal’s MCP session.

## Available capability groups

- Live dashboard, admissions, marketing, RIS/RPS sales, and SEO reports
- CRM summary, lead creation, lookup, history, update, and archive
- CRM branch, staff, and lookup-list administration
- CRM sheet status, pull logs, pull, and resynchronization operations
- Editorial post listing, creation, update, and deletion

## Publishing prerequisite

The MCP audit, retry-protection, OAuth-client, authorization-code, and token
tables are part of the managed application schema. Before enabling the
published endpoint, use the Publish flow to review and apply the schema diff,
then verify OAuth discovery and `/mcp` with an authenticated client. Do not add
database DDL to the application startup or deployment build: managed schema
changes are applied by the Publish flow.

After publishing, verify the production endpoint with an MCP client before relying on it operationally.