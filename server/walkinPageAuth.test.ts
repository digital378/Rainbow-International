import assert from "node:assert/strict";
import { test } from "node:test";
import type { Request } from "express";
import {
  createWalkinPageSession,
  hasWalkinPageSession,
  isWalkinPageAuthorized,
  validWalkinPageSession,
  walkinLeadsAccess,
} from "./walkinPageAuth";

// Test-only credentials; no configured secret values are read or printed.
process.env.SESSION_SECRET = "page-auth-test-secret";
process.env.WALKIN_LEADS_PASSCODE = "test-leads-passcode";
process.env.WALKIN_PANEL_PASSCODE = "test-panel-passcode";
process.env.WALKIN_RIS_LEADS_PASSCODE = "test-ris-leads-passcode";
process.env.WALKIN_RPS_LEADS_PASSCODE = "test-rps-leads-passcode";

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

test("RIS and RPS Leads sessions remain separate and do not authorize admin panel access", () => {
  const ris = createWalkinPageSession("leads", "test-ris-leads-passcode");
  const rps = createWalkinPageSession("leads", "test-rps-leads-passcode");
  const group = createWalkinPageSession("leads", process.env.WALKIN_LEADS_PASSCODE!);
  assert.ok(ris);
  assert.ok(rps);
  assert.ok(group);
  assert.equal(walkinLeadsAccess(request(ris, "/api/walkin/leads")), "RIS");
  assert.equal(walkinLeadsAccess(request(rps, "/api/walkin/leads")), "RPS");
  assert.equal(walkinLeadsAccess(request(group, "/api/walkin/leads")), "GROUP");
  assert.equal(isWalkinPageAuthorized(request(ris, "/api/walkin/leads")), true);
  assert.equal(isWalkinPageAuthorized(request(ris, "/api/walkin/branches")), false);
  assert.equal(walkinLeadsAccess(request(ris + "a", "/api/walkin/leads")), null);
  process.env.WALKIN_RIS_LEADS_PASSCODE = "rotated-ris-leads-code";
  assert.equal(walkinLeadsAccess(request(ris, "/api/walkin/leads")), null);
  assert.equal(walkinLeadsAccess(request(rps, "/api/walkin/leads")), "RPS");
});