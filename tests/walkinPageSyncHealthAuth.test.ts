import { afterEach, describe, expect, it } from "vitest";
import type { Request } from "express";
import { createWalkinPageSession, isWalkinPageAuthorized } from "../server/walkinPageAuth";

const previous = {
  session: process.env.SESSION_SECRET,
  leads: process.env.WALKIN_LEADS_PASSCODE,
  panel: process.env.WALKIN_PANEL_PASSCODE,
};
afterEach(() => {
  for (const [name, value] of Object.entries({
    SESSION_SECRET: previous.session,
    WALKIN_LEADS_PASSCODE: previous.leads,
    WALKIN_PANEL_PASSCODE: previous.panel,
  })) {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
});

describe("Leads session sheet permissions", () => {
  it("can view status but cannot run sheet operations", () => {
    process.env.SESSION_SECRET = "test-session-secret";
    process.env.WALKIN_LEADS_PASSCODE = "test-leads-passcode";
    process.env.WALKIN_PANEL_PASSCODE = "test-panel-passcode";
    const session = createWalkinPageSession("leads", "test-leads-passcode");
    const req = (path: string) => ({ path, headers: { authorization: `Bearer ${session}` } }) as Request;
    expect(isWalkinPageAuthorized(req("/api/walkin/sheets/status"))).toBe(true);
    expect(isWalkinPageAuthorized(req("/api/walkin/sheets/pull"))).toBe(false);
    expect(isWalkinPageAuthorized(req("/api/walkin/sheets/resync"))).toBe(false);
    expect(isWalkinPageAuthorized(req("/api/walkin/sheets/pull-log"))).toBe(false);
  });
});