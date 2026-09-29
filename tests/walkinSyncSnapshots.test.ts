import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockSelect, mockInsert, mockExecute } = vi.hoisted(() => ({
  mockSelect: vi.fn(),
  mockInsert: vi.fn(),
  mockExecute: vi.fn(),
}));

vi.mock("googleapis", () => {
  class OAuth2 {
    setCredentials(_credentials: object) {}
  }
  return { google: { auth: { OAuth2 }, sheets: vi.fn() } };
});

vi.mock("../server/db", () => ({
  db: {
    select: mockSelect,
    insert: mockInsert,
    execute: mockExecute,
  },
}));

vi.mock("../server/googleCredentials", () => ({
  getGoogleRefreshToken: vi.fn(),
}));

vi.mock("../server/marketing2728Sheets", () => ({
  readMarketing2728Supplement: vi.fn(),
  supplementLeadKey: vi.fn(),
}));

vi.mock("../server/walkinSyncCoordinator", () => ({
  beginWalkinSyncShutdown: vi.fn(),
  fencedWalkinSheetWrite: vi.fn(),
  isWalkinSyncDraining: () => false,
  runWalkinSheetOperation: vi.fn(),
  waitForWalkinSyncDrain: vi.fn(),
}));

import { bootstrapWalkinSyncSnapshots, hydrateWalkinSyncSnapshots, persistSyncSnapshot } from "../server/walkinSheets";

describe("durable walk-in sheet snapshots", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("persists a checkpoint keyed by workbook scope and lead", async () => {
    const onConflictDoUpdate = vi.fn().mockResolvedValue(undefined);
    const values = vi.fn().mockReturnValue({ onConflictDoUpdate });
    mockInsert.mockReturnValue({ values });

    await persistSyncSnapshot("RIS", "lead-17", {
      status: "CLOSED",
      walkInDate: null,
      admissionDate: null,
      remark: "Called",
      closeReason: null,
      revisitDate: null,
      revisitDate2: null,
    });

    expect(mockInsert).toHaveBeenCalledOnce();
    expect(values).toHaveBeenCalledWith(expect.objectContaining({
      scope: "RIS",
      leadId: "lead-17",
      snapshot: expect.objectContaining({ status: "CLOSED", remark: "Called" }),
    }));
    expect(onConflictDoUpdate).toHaveBeenCalledOnce();
  });

  it("hydrates existing workbook/lead checkpoints from the durable table", async () => {
    const snapshots = [
      { scope: "RIS", leadId: "lead-17", snapshot: { status: "CLOSED" } },
      { scope: "MASTER", leadId: "lead-21", snapshot: { status: "OPEN" } },
    ];
    mockSelect.mockReturnValue({ from: vi.fn().mockResolvedValue(snapshots) });

    await expect(hydrateWalkinSyncSnapshots()).resolves.toBe(2);
    expect(mockSelect).toHaveBeenCalledOnce();
  });

  it("creates the snapshot table and index before hydration", async () => {
    mockExecute.mockResolvedValue({});

    await bootstrapWalkinSyncSnapshots();

    expect(mockExecute).toHaveBeenCalledTimes(2);
  });
});