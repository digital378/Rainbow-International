import express from "express";
import type { Server } from "node:http";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { __mcpGatewayTestUtils, registerMcpGateway } from "../server/mcpGateway";

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