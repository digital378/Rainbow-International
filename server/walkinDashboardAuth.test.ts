import assert from "node:assert/strict";
import { test } from "node:test";
import type { Request } from "express";
import {
  createWalkinDashboardSession,
  hasWalkinDashboardAccess,
  hasWalkinDashboardSession,
  walkinDashboardCookieName,
} from "./walkinDashboardAuth";

// These are test-only values. This test never reads the real configured secrets.
process.env.SESSION_SECRET = "test-session-key";
process.env.WALKIN_RIS_DASHBOARD_PASSCODE = "test-ris-code";
process.env.WALKIN_RPS_DASHBOARD_PASSCODE = "test-rps-code";

function request(scope: "ris-sales" | "rps-sales", token: string): Request {
  return { headers: { cookie: `${walkinDashboardCookieName(scope)}=${token}` } } as Request;
}

test("remembered dashboard access survives the in-memory session store and stays scoped", () => {
  const token = createWalkinDashboardSession("test-ris-code", "ris-sales", true);
  assert.ok(token);
  assert.equal(hasWalkinDashboardSession(request("ris-sales", token), "ris-sales"), true);
  assert.equal(hasWalkinDashboardAccess(request("ris-sales", token), "RIS"), true);
  assert.equal(hasWalkinDashboardAccess(request("ris-sales", token), "RPS"), false);
  assert.equal(hasWalkinDashboardSession(request("rps-sales", token), "rps-sales"), false);
  assert.equal(hasWalkinDashboardSession(request("ris-sales", token + "x"), "ris-sales"), false);

  process.env.WALKIN_RIS_DASHBOARD_PASSCODE = "rotated-test-code";
  assert.equal(hasWalkinDashboardSession(request("ris-sales", token), "ris-sales"), false);
});

test("ordinary sessions remain temporary and invalid passcodes cannot create remembered access", () => {
  assert.equal(createWalkinDashboardSession("wrong", "rps-sales", true), null);
  const token = createWalkinDashboardSession("test-rps-code", "rps-sales");
  assert.ok(token);
  assert.equal(hasWalkinDashboardSession(request("rps-sales", token), "rps-sales"), true);
});