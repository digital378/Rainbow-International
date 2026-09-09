import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createWalkinDashboardSession,
  hasWalkinDashboardAccess,
  revokeWalkinDashboardSession,
  walkinDashboardCookieName,
} from "../server/walkinDashboardAuth";

function requestWith(session?: string, scope: "ris-sales" | "rps-sales" | "overview" | "marketing" = "overview"): any {
  return { headers: { cookie: session ? `${walkinDashboardCookieName(scope)}=${session}` : "" } };
}

describe("walk-in dashboard authorization", () => {
  const originalSecret = process.env.SESSION_SECRET;
  const passcodeKeys = {
    WALKIN_RIS_DASHBOARD_PASSCODE: process.env.WALKIN_RIS_DASHBOARD_PASSCODE,
    WALKIN_RPS_DASHBOARD_PASSCODE: process.env.WALKIN_RPS_DASHBOARD_PASSCODE,
    WALKIN_OVERVIEW_DASHBOARD_PASSCODE: process.env.WALKIN_OVERVIEW_DASHBOARD_PASSCODE,
    WALKIN_MARKETING_DASHBOARD_PASSCODE: process.env.WALKIN_MARKETING_DASHBOARD_PASSCODE,
  };

  beforeEach(() => {
    process.env.SESSION_SECRET = "dashboard-auth-test-secret";
    process.env.WALKIN_RIS_DASHBOARD_PASSCODE = "ris-test-passcode";
    process.env.WALKIN_RPS_DASHBOARD_PASSCODE = "rps-test-passcode";
    process.env.WALKIN_OVERVIEW_DASHBOARD_PASSCODE = "overview-test-passcode";
    process.env.WALKIN_MARKETING_DASHBOARD_PASSCODE = "marketing-test-passcode";
  });

  afterEach(() => {
    if (originalSecret === undefined) delete process.env.SESSION_SECRET;
    else process.env.SESSION_SECRET = originalSecret;
    for (const [key, value] of Object.entries(passcodeKeys)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  it("rejects missing, invalid, and tampered sessions", () => {
    expect(hasWalkinDashboardAccess(requestWith(), "RIS")).toBe(false);
    expect(createWalkinDashboardSession("wrong", "overview")).toBeNull();
    expect(hasWalkinDashboardAccess(requestWith("tampered"), "RPS")).toBe(false);
  });

  it("allows the group session to read both brands", () => {
    const session = createWalkinDashboardSession("overview-test-passcode", "overview");
    expect(session).not.toBeNull();
    expect(hasWalkinDashboardAccess(requestWith(session!), "RIS")).toBe(true);
    expect(hasWalkinDashboardAccess(requestWith(session!), "RPS")).toBe(true);
  });

  it("keeps school sessions scoped to their own brand", () => {
    const risSession = createWalkinDashboardSession("ris-test-passcode", "ris-sales");
    const rpsSession = createWalkinDashboardSession("rps-test-passcode", "rps-sales");
    expect(hasWalkinDashboardAccess(requestWith(risSession!), "RIS")).toBe(true);
    expect(hasWalkinDashboardAccess(requestWith(risSession!), "RPS")).toBe(false);
    expect(hasWalkinDashboardAccess(requestWith(rpsSession!), "RPS")).toBe(true);
    expect(hasWalkinDashboardAccess(requestWith(rpsSession!), "RIS")).toBe(false);
  });

  it("binds each passcode to its intended dashboard", () => {
    expect(createWalkinDashboardSession("rps-test-passcode", "ris-sales")).toBeNull();
    expect(createWalkinDashboardSession("overview-test-passcode", "marketing")).toBeNull();
  });

  it("revokes only the requested dashboard session", () => {
    const overview = createWalkinDashboardSession("overview-test-passcode", "overview")!;
    const ris = createWalkinDashboardSession("ris-test-passcode", "ris-sales")!;
    const req = {
      headers: {
        cookie: `${walkinDashboardCookieName("overview")}=${overview}; ${walkinDashboardCookieName("ris-sales")}=${ris}`,
      },
    } as any;
    revokeWalkinDashboardSession(req, "overview");
    expect(hasWalkinDashboardAccess(req, "RPS")).toBe(false);
    expect(hasWalkinDashboardAccess(req, "RIS")).toBe(true);
  });
});