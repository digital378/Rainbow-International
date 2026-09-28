import assert from "node:assert/strict";
import { test } from "node:test";
import type { Request } from "express";
import {
  createWalkinPageSession,
  hasWalkinPageSession,
  isWalkinPageAuthorized,
  validWalkinPageSession,
} from "./walkinPageAuth";

// Test-only credentials; no configured secret values are read or printed.
process.env.SESSION_SECRET = "page-auth-test-secret";
process.env.WALKIN_LEADS_PASSCODE = "test-leads-passcode";
process.env.WALKIN_PANEL_PASSCODE = "test-panel-passcode";

function request(token: string, path: string): Request {
  return { headers: { authorization: `Bearer ${token}` }, path } as Request;
}

test("each password issues only its own scoped page session", () => {
  assert.equal(createWalkinPageSession("leads", "wrong"), null);
  assert.equal(createWalkinPageSession("panel", "test-leads-passcode"), null);
  const leads = createWalkinPageSession("leads", "test-leads-passcode");
  const panel = createWalkinPageSession("panel", "test-panel-passcode");
  assert.ok(leads);
  assert.ok(panel);
  assert.equal(hasWalkinPageSession(request(leads, "/api/walkin/leads"), "leads"), true);
  assert.equal(hasWalkinPageSession(request(leads, "/api/walkin/leads"), "panel"), false);
  assert.equal(isWalkinPageAuthorized(request(leads, "/api/walkin/leads/abc/history")), true);
  assert.equal(isWalkinPageAuthorized(request(leads, "/api/walkin/sheets/status")), false);
  assert.equal(isWalkinPageAuthorized(request(panel, "/api/walkin/branches")), true);
  assert.equal(isWalkinPageAuthorized(request(panel, "/api/walkin/lookups/programs/1")), true);
  assert.equal(isWalkinPageAuthorized(request(panel, "/api/walkin/leads")), false);
  assert.equal(isWalkinPageAuthorized(request(panel, "/api/walkin/sheets/pull-hook")), false);
  assert.equal(isWalkinPageAuthorized(request(panel, "/api/walkin/crm-stats")), false);
});

test("tampering and passcode rotation invalidate page sessions", () => {
  const token = createWalkinPageSession("leads", "test-leads-passcode");
  assert.ok(token);
  assert.equal(validWalkinPageSession(token + "x", "leads"), false);
  process.env.WALKIN_LEADS_PASSCODE = "rotated-test-leads-code";
  assert.equal(validWalkinPageSession(token, "leads"), false);
});