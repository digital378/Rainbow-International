import { afterEach, describe, expect, it, vi } from "vitest";

const fixture = vi.hoisted(() => ({
  getValues: vi.fn(),
}));

vi.mock("./googleCredentials", () => ({ getGoogleRefreshToken: () => "fixture-token" }));
vi.mock("googleapis", () => ({
  google: {
    auth: {
      OAuth2: class {
        setCredentials() {}
      },
    },
    sheets: () => ({ spreadsheets: { values: { get: fixture.getValues } } }),
  },
}));

import { readBranchWalkinsOnly } from "./marketing2728Sheets";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  fixture.getValues.mockReset();
});

describe("readBranchWalkinsOnly", () => {
  it("returns unavailable without attempting sheet access in test mode", async () => {
    vi.stubEnv("NODE_ENV", "test");

    const result = await readBranchWalkinsOnly("RIS");

    expect(result).toEqual({
      walkins: [], fetchedAt: null, available: false, mode: "unavailable",
    });
    expect(fixture.getValues).not.toHaveBeenCalled();
  });

  it("reads only the WALKINs tab with OAuth and preserves workbook provenance", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("GOOGLE_CLIENT_ID", "client");
    vi.stubEnv("GOOGLE_CLIENT_SECRET", "secret");
    fixture.getValues.mockResolvedValue({
      data: { values: [
        ["Date", "Student Name", "Status"],
        ["20/06/2027", "Aarav Sharma", "OPEN"],
      ] },
    });

    const result = await readBranchWalkinsOnly("RPS");

    expect(fixture.getValues).toHaveBeenCalledTimes(1);
    expect(fixture.getValues).toHaveBeenCalledWith({
      spreadsheetId: "1cai6w40yIbCcAn6KvjrQomgu4BpBVh_yB00UqKaHEXA",
      range: "'WALKINs'!A:Z",
    });
    expect(result).toMatchObject({
      available: true,
      mode: "oauth",
      walkins: [{
        childName: "Aarav Sharma",
        sourceLocations: ["WALKINs row 2"],
      }],
    });
    expect(result.fetchedAt).toEqual(expect.any(String));
  });

  it("falls back to the public WALKINs CSV only and avoids claiming source row numbers", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("GOOGLE_CLIENT_ID", "client");
    vi.stubEnv("GOOGLE_CLIENT_SECRET", "secret");
    fixture.getValues.mockRejectedValue(new Error("OAuth unavailable"));
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => "Date,Student Name,Status\n20/06/2027,Aarav Sharma,OPEN\n",
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await readBranchWalkinsOnly("RIS");

    expect(fixture.getValues).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toContain("sheet=WALKINs");
    expect(fetchMock.mock.calls[0][0]).not.toContain("CRM");
    expect(result).toMatchObject({
      available: true,
      mode: "public",
      warning: "Authenticated Sheet access failed: OAuth unavailable",
      walkins: [{
        childName: "Aarav Sharma",
        sourceLocations: ["WALKINs (public read)"],
      }],
    });
  });
});