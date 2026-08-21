# Internal Dashboards MCP Gateway

## Status

Bearer-token MCP implementation exists. Google Workspace OAuth support is
implemented pending production OAuth-client configuration.

## Goal

Expose Rainbow International School's internal dashboards and supported
administrative operations through one MCP endpoint that can be connected by
Claude or compatible ChatGPT MCP clients.

The gateway must support broad administrative access while keeping the
application's existing validation, permissions, sync safeguards, and business
rules authoritative.

## Non-goals

- No arbitrary `call_api` or URL-proxy tool.
- No unrestricted SQL or direct database access from MCP clients.
- No exposure of secrets, API keys, refresh tokens, session cookies, password
  material, debug headers, or environment-variable values.
- No Google credential or browser-session handling in MCP prompts or results.
- No second copy of dashboard business logic.

## Public connection

The production MCP endpoint will be:

```text
https://rainbowinternationalschool.in/mcp
```

It uses MCP Streamable HTTP transport. Compatible clients may continue using a
dedicated bearer credential:

```text
Authorization: Bearer <MCP_ADMIN_TOKEN>
```

`MCP_ADMIN_TOKEN` is a dedicated secret. It must not reuse `ADMIN_TOKEN`,
`INDRA_API_TOKEN`, Google credentials, or a browser session.

OAuth clients use discovery, dynamic client registration, Authorization Code
with PKCE S256, and a separate Google Workspace OAuth client. The endpoint is
not considered ready to share until its feature flag, OAuth client,
health/discovery checks, and production deployment are all verified.

## Architecture

The server adds a typed MCP gateway to the existing application:

```text
MCP client
  -> OAuth protected-resource metadata and authorization-server discovery
  -> Dynamic public-client registration and Google Workspace authorization
  -> PKCE-protected MCP access token
  -> Streamable HTTP /mcp endpoint
  -> MCP authentication and rate limit
  -> explicit tool allowlist and input schemas
  -> confirmation/idempotency checks for high-impact writes
  -> existing application services and route logic
  -> structured MCP result or typed error
```

Tools call existing application services wherever possible. They must not
reimplement lead status rules, academic-year behavior, sheet synchronization
semantics, or dashboard calculations.

The gateway must not expose a generic method/path/body passthrough. Explicit
tools make the available surface reviewable and prevent a client from
discovering and invoking unrelated routes.

## Tool groups

### Dashboard and reporting

- dashboard overview;
- academic-year/provider discovery;
- historical dashboard reports;
- Marketing monthly and live reporting;
- RIS Sales reporting;
- RPS Sales reporting;
- CRM summary and admissions performance;
- approved sheet-backed dashboard reads;
- Google Ads, Meta Ads, Search Console, and SEO reporting actions already
  supported by the application.

### CRM and operational data

- list and search leads;
- retrieve a lead and its history;
- create, update, and archive leads;
- read branches, staff, programs, statuses, sources, and close reasons;
- create/update/delete branches where the existing application permits it;
- create/update staff and lookup values where the existing application
  permits it.

Authenticated MCP administrators may receive the CRM fields needed for these
operations, including personal data already available to the application's
admin UI. Secrets, credentials, and authentication material remain excluded.

### Google Sheets synchronization

- inspect sheet synchronization status and pull logs;
- run an approved pull;
- run approved resync and master-sheet synchronization actions;
- report partial failures and upstream failures explicitly.

Destructive, archival, deletion, and synchronization tools require an
explicit `confirm: true` argument. Where an operation supports it, the tool
also accepts an idempotency key so a retried model request cannot duplicate an
operation.

### Content and site administration

- create, update, and delete blog/content records through the existing admin
  services;
- run the existing internal site administration actions that have a clear
  validated route;
- exclude debug, credential, upload, and unrestricted maintenance endpoints
  unless they receive a separate security review.

## Authentication and authorization

Every MCP request requires either the dedicated bearer token or an unexpired
OAuth-issued MCP access token. OAuth clients are authorized through a separate
Google Workspace OAuth client. The server accepts only verified emails in the
`rainbowinternationalschool.in` Workspace domain.

OAuth discovery exposes protected-resource metadata, authorization-server
metadata, and dynamic public-client registration. The authorization flow
requires PKCE S256 and exact registered redirect-URI matching. Authorization
codes are short-lived and single-use. Access and refresh tokens are opaque,
stored only as hashes, and refresh tokens rotate on use.

Missing, invalid, expired, revoked, or misconfigured credentials return a
generic unauthorized response without revealing whether a resource exists.

The bearer token is an application-level administrator credential, not a
Google credential. The implementation uses constant-time comparison for it and
never logs any bearer token, OAuth token, authorization code, Google profile,
or client secret. The existing Google Sheets OAuth client is never reused.

The tool registry is the authorization boundary. New application routes are
not automatically exposed through MCP; they require an explicit tool
definition and review.

## Audit and safety controls

Each tool call records:

- timestamp;
- authenticated MCP principal label;
- tool name;
- request correlation ID;
- success or failure category;
- redacted argument summary;
- affected resource identifier where safe;
- duration.

Argument redaction must cover names, phone numbers, email addresses, child
details, remarks, tokens, and other sensitive values where they appear in
logs. MCP responses must never include secrets or environment values.

High-impact operations require confirmation. At minimum this includes
archive/delete operations, sheet resync or deletion synchronization, staff
permission changes, lookup deletion, and content deletion. Confirmation must
be checked server-side; it cannot be implemented only as an instruction in the
tool description.

Rate limits and request-size limits apply before tool execution. Tool errors
use stable categories:

- `unauthorized`;
- `confirmation_required`;
- `validation_failed`;
- `not_found`;
- `upstream_unavailable`;
- `operation_failed`.

Provider failures must remain failures. They must never be returned as a
successful zero-valued dashboard result.

## Compatibility

The MCP endpoint uses Streamable HTTP so Claude and compatible ChatGPT clients
can use the same endpoint. Claude custom connectors discover and complete the
OAuth flow automatically; header-based compatible clients may use the dedicated
bearer token.

No token is embedded in this document, the OpenAPI schema, a prompt, a URL, or
application source code.

## Rollout

1. Add the MCP SDK and a focused gateway module.
2. Add `MCP_ENABLED`, bearer compatibility, and separate MCP Google OAuth
   secret handling.
3. Implement OAuth discovery, public-client registration, Google Workspace
   authorization, callback, PKCE exchange, refresh-token rotation, and domain
   enforcement.
4. Register audit, idempotency, OAuth-client, authorization-code, and token
   storage.
5. Verify the local MCP lifecycle, OAuth discovery, registration, PKCE
   exchange, refresh rotation, and tool calls.
6. Restart the application workflow and inspect logs.
7. Publish and apply the managed schema diff, then verify production OAuth
   discovery and the `/mcp` flow.

## Verification

Automated and integration checks must cover:

- missing, invalid, and valid MCP credentials;
- Streamable HTTP initialization and session lifecycle;
- tool discovery contains only the explicit allowlist;
- dashboard reads return current structured data;
- Marketing, RIS Sales, and RPS Sales remain separate;
- historical academic-year filters are preserved;
- CRM create/update/archive validation and authorization;
- destructive and synchronization confirmation gates;
- retry/idempotency behavior where supported;
- upstream failures remain unavailable/error responses;
- audit records are created and sensitive values are redacted;
- debug, secret, generic-proxy, and SQL capabilities are unreachable;
- production workflow startup, logs, and MCP endpoint availability.

## Success criteria

- Claude and compatible ChatGPT clients can connect to the same production MCP
  URL using the dedicated token.
- The client can discover and use all approved dashboard and administrative
  tools without a second data bridge.
- Every mutation is validated by the existing application rules and audited.
- High-impact actions cannot run without server-side confirmation.
- No token, credential, debug data, or unrestricted database capability is
  available through MCP.
- The application reports unavailable providers honestly instead of presenting
  false zero values.