import express from "express";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import type { Server } from "node:http";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { __mcpGatewayTestUtils, registerMcpGateway } from "../server/mcpGateway";
import { db } from "../server/db";
import { mcpOauthAuthorizationCodes, mcpOauthClients } from "@shared/schema";
import { __mcpOauthTestUtils } from "../server/mcpOAuth";
import { eq } from "drizzle-orm";

let server: Server | undefined;
let baseUrl = "";

function parseMcpResponse(text: string) {
  const eventData = text
    .split(/\r?\n/)
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trim())
    .join("\n");
  return JSON.parse(eventData || text);
}

async function mcpRequest(payload: object, headers: Record<string, string> = {}) {
  const response = await fetch(`${baseUrl}/mcp`, {
    method: "POST",
    headers: {
      Accept: "application/json, text/event-stream",
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(payload),
  });
  return { response, body: await response.text() };
}

beforeEach(async () => {
  process.env.MCP_ENABLED = "true";
  process.env.MCP_ADMIN_TOKEN = "test-mcp-token";
  const app = express();
  app.use(express.json());
  registerMcpGateway(app);
  await new Promise<void>((resolve) => {
    server = app.listen(0, "127.0.0.1", () => resolve());
  });
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Test server did not start");
  baseUrl = `http://127.0.0.1:${address.port}`;
});

afterEach(async () => {
  await new Promise<void>((resolve, reject) => {
    server?.close((error) => error ? reject(error) : resolve());
  });
  server = undefined;
});

describe("MCP gateway safety helpers", () => {
  it("redacts personal fields and credentials recursively before audit logging", () => {
    const redacted = __mcpGatewayTestUtils.redact({
      academicYear: "2026-27",
      parentName: "Example Parent",
      phone: "9999999999",
      nested: { email: "family@example.test", remark: "private note" },
      idempotencyKey: "retry-key",
    });

    expect(redacted).toEqual({
      academicYear: "2026-27",
      parentName: "[redacted]",
      phone: "[redacted]",
      nested: { email: "[redacted]", remark: "[redacted]" },
      idempotencyKey: "retry-key",
    });
  });

  it("requires explicit confirmation for consequential actions", () => {
    expect(() => __mcpGatewayTestUtils.requireConfirmation({}, "Archiving a lead"))
      .toThrow("requires confirm: true");
    expect(() => __mcpGatewayTestUtils.requireConfirmation({ confirm: true }, "Archiving a lead"))
      .not.toThrow();
  });

  it("categorizes blocked, validation, and upstream failures without exposing details", () => {
    expect(__mcpGatewayTestUtils.failureCategory("", "started")).toBeNull();
    expect(__mcpGatewayTestUtils.failureCategory("", "blocked")).toBe("confirmation_required");
    expect(__mcpGatewayTestUtils.failureCategory("400 invalid data", "error")).toBe("validation_failed");
    expect(__mcpGatewayTestUtils.failureCategory("upstream timeout", "error")).toBe("upstream_unavailable");
  });

  it("requires bearer auth and supports a session-scoped allowlisted tools discovery", async () => {
    const initializePayload = {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2025-06-18",
        capabilities: {},
        clientInfo: { name: "gateway-test", version: "1.0" },
      },
    };
    const rejected = await mcpRequest(initializePayload);
    expect(rejected.response.status).toBe(401);

    const initialized = await mcpRequest(initializePayload, {
      Authorization: "Bearer test-mcp-token",
    });
    expect(initialized.response.status).toBe(200);
    const sessionId = initialized.response.headers.get("mcp-session-id");
    expect(sessionId).toBeTruthy();

    const discovered = await mcpRequest({
      jsonrpc: "2.0",
      id: 2,
      method: "tools/list",
      params: {},
    }, {
      Authorization: "Bearer test-mcp-token",
      "mcp-session-id": sessionId!,
    });
    const payload = parseMcpResponse(discovered.body);
    const names = payload.result.tools.map((tool: { name: string }) => tool.name);
    expect(names).toContain("crm_create_lead");
    expect(names).toContain("content_update_blog_post");
    expect(names).not.toContain("execute_sql");
    expect(names).not.toContain("http_proxy");

    const missingRetryKey = await mcpRequest({
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: {
        name: "crm_create_staff",
        arguments: { name: "Safety Test" },
      },
    }, {
      Authorization: "Bearer test-mcp-token",
      "mcp-session-id": sessionId!,
    });
    const mutationResult = parseMcpResponse(missingRetryKey.body);
    expect(mutationResult.result.isError).toBe(true);
    expect(JSON.stringify(mutationResult)).toMatch(/idempotencyKey|required/i);
  });

});

describe("MCP OAuth connector support", () => {
  it("publishes discovery metadata and registers public PKCE clients", async () => {
    const metadata = await fetch(`${baseUrl}/.well-known/oauth-authorization-server`);
    expect(metadata.status).toBe(200);
    const body = await metadata.json();
    expect(body.authorization_endpoint).toBe(`${baseUrl}/oauth/authorize`);
    expect(body.token_endpoint).toBe(`${baseUrl}/oauth/token`);
    expect(body.registration_endpoint).toBe(`${baseUrl}/oauth/register`);
    expect(body.code_challenge_methods_supported).toEqual(["S256"]);

    const registration = await fetch(`${baseUrl}/oauth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_name: "Claude test connector",
        redirect_uris: ["https://claude.example.test/oauth/callback"],
        token_endpoint_auth_method: "none",
      }),
    });
    expect(registration.status).toBe(201);
    const client = await registration.json();
    expect(client.client_id).toEqual(expect.any(String));
    expect(client.redirect_uris).toEqual(["https://claude.example.test/oauth/callback"]);
    expect(client.token_endpoint_auth_method).toBe("none");
  });

  it("exchanges one PKCE authorization code once, rotates refresh tokens, and accepts the issued token", async () => {
    const clientId = randomUUID();
    const code = randomBytes(32).toString("base64url");
    const verifier = randomBytes(32).toString("base64url");
    const challenge = createHash("sha256").update(verifier).digest("base64url");
    const redirectUri = "https://claude.example.test/oauth/callback";
    await db.insert(mcpOauthClients).values({
      clientId,
      clientName: "OAuth exchange test",
      redirectUris: [redirectUri],
    });
    await db.insert(mcpOauthAuthorizationCodes).values({
      codeHash: createHash("sha256").update(code).digest("hex"),
      clientId,
      redirectUri,
      codeChallenge: challenge,
      principal: "admin@rainbowinternationalschool.in",
      scope: "mcp",
      expiresAt: new Date(Date.now() + 60_000),
    });

    const exchange = await fetch(`${baseUrl}/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: clientId,
        code,
        redirect_uri: redirectUri,
        code_verifier: verifier,
      }),
    });
    expect(exchange.status).toBe(200);
    const issued = await exchange.json();
    expect(issued.access_token).toEqual(expect.any(String));
    expect(issued.refresh_token).toEqual(expect.any(String));
    expect(issued.token_type).toBe("Bearer");

    const replay = await fetch(`${baseUrl}/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: clientId,
        code,
        redirect_uri: redirectUri,
        code_verifier: verifier,
      }),
    });
    expect(replay.status).toBe(400);
    expect((await replay.json()).error).toBe("invalid_grant");

    const refreshed = await fetch(`${baseUrl}/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: clientId,
        refresh_token: issued.refresh_token,
      }),
    });
    expect(refreshed.status).toBe(200);
    const rotated = await refreshed.json();
    expect(rotated.refresh_token).not.toBe(issued.refresh_token);

    const initialize = await mcpRequest({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2025-06-18",
        capabilities: {},
        clientInfo: { name: "oauth-test", version: "1.0" },
      },
    }, { Authorization: `Bearer ${issued.access_token}` });
    expect(initialize.response.status).toBe(200);
  });

  it("allows only one concurrent redemption and rejects invalid PKCE and scopes", async () => {
    const clientId = randomUUID();
    const code = randomBytes(32).toString("base64url");
    const verifier = randomBytes(32).toString("base64url");
    const challenge = createHash("sha256").update(verifier).digest("base64url");
    const redirectUri = "https://claude.example.test/oauth/concurrent-callback";
    await db.insert(mcpOauthClients).values({
      clientId,
      clientName: "Concurrent OAuth exchange test",
      redirectUris: [redirectUri],
    });
    await db.insert(mcpOauthAuthorizationCodes).values({
      codeHash: createHash("sha256").update(code).digest("hex"),
      clientId,
      redirectUri,
      codeChallenge: challenge,
      principal: "admin@rainbowinternationalschool.in",
      scope: "mcp",
      expiresAt: new Date(Date.now() + 60_000),
    });
    const exchangeBody = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: clientId,
      code,
      redirect_uri: redirectUri,
      code_verifier: verifier,
    });
    const [first, second] = await Promise.all([1, 2].map(() => fetch(`${baseUrl}/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: exchangeBody.toString(),
    })));
    expect([first.status, second.status].sort()).toEqual([200, 400]);

    const invalidVerifier = await fetch(`${baseUrl}/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: clientId,
        code: randomBytes(32).toString("base64url"),
        redirect_uri: redirectUri,
        code_verifier: "short",
      }),
    });
    expect(invalidVerifier.status).toBe(400);
    expect((await invalidVerifier.json()).error).toBe("invalid_request");

    const invalidScope = await fetch(`${baseUrl}/oauth/authorize?${new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: redirectUri,
      code_challenge: challenge,
      code_challenge_method: "S256",
      scope: "mcp unsupported",
    })}`);
    expect(invalidScope.status).toBe(400);
    expect((await invalidScope.json()).error).toBe("invalid_scope");
  });

  it("hides all OAuth routes when the MCP feature is disabled", async () => {
    process.env.MCP_ENABLED = "false";
    try {
      for (const path of [
        "/.well-known/oauth-protected-resource/mcp",
        "/.well-known/oauth-authorization-server",
        "/oauth/register",
        "/oauth/authorize",
        "/oauth/token",
      ]) {
        const response = await fetch(`${baseUrl}${path}`, {
          method: path === "/oauth/register" || path === "/oauth/token" ? "POST" : "GET",
        });
        expect(response.status).toBe(404);
      }
    } finally {
      process.env.MCP_ENABLED = "true";
    }
  });

  it("removes expired authorization records during background cleanup", async () => {
    const codeHash = createHash("sha256").update(randomBytes(32)).digest("hex");
    await db.insert(mcpOauthAuthorizationCodes).values({
      codeHash,
      clientId: randomUUID(),
      redirectUri: "https://claude.example.test/oauth/expired-callback",
      codeChallenge: randomBytes(32).toString("base64url"),
      principal: "admin@rainbowinternationalschool.in",
      scope: "mcp",
      expiresAt: new Date(Date.now() - 60_000),
    });
    await __mcpOauthTestUtils.cleanupExpiredOAuthRecords();
    const [remaining] = await db.select().from(mcpOauthAuthorizationCodes)
      .where(eq(mcpOauthAuthorizationCodes.codeHash, codeHash)).limit(1);
    expect(remaining).toBeUndefined();
  });
});