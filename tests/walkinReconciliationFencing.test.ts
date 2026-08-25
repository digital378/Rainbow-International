import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockFencedWrite,
  mockGoogleRefreshToken,
  mockInsert,
  mockDelete,
  mockSheetsAppend,
  mockSheetsGet,
  mockSpreadsheetsGet,
} = vi.hoisted(() => ({
  mockFencedWrite: vi.fn(),
  mockGoogleRefreshToken: vi.fn(),
  mockInsert: vi.fn(),
  mockDelete: vi.fn(),
  mockSheetsAppend: vi.fn(),
  mockSheetsGet: vi.fn(),
  mockSpreadsheetsGet: vi.fn(),
}));

vi.mock("googleapis", () => {
  class OAuth2 {
    setCredentials(_credentials: object) {}
  }

  return {
    google: {
      auth: { OAuth2 },
      sheets: vi.fn().mockReturnValue({
        spreadsheets: {
          get: mockSpreadsheetsGet,
          values: {
            append: mockSheetsAppend,
            get: mockSheetsGet,
          },
        },
      }),
    },
  };
});

vi.mock("../server/db", () => ({
  db: {
    delete: mockDelete,
    insert: mockInsert,
  },
}));

vi.mock("../server/googleCredentials", () => ({
  getGoogleRefreshToken: mockGoogleRefreshToken,
}));

vi.mock("../server/walkinSyncCoordinator", () => ({
  beginWalkinSyncShutdown: vi.fn(),
  fencedWalkinSheetWrite: mockFencedWrite,
  isWalkinSyncDraining: () => false,
  runWalkinSheetOperation: (_name: string, operation: () => Promise<unknown>) => operation(),
  waitForWalkinSyncDrain: async () => true,
}));

import { queueUpsert } from "../server/walkinSheets";

const lead = {
  id: "lease-fence-test-lead",
  brand: "RIS",
  parentName: "Parent",
  childName: "Child",
  phone: "0000000000",
  email: null,
  enquiryDate: "2026-08-25",
  program: "Class 1",
  status: "OPEN",
  source: "Walk-In",
  branch: "Brahmand",
  branchId: null,
  academicYear: "2027-28",
  createdAt: new Date("2026-08-25T00:00:00.000Z"),
} as any;

function reconciliationInsert() {
  return {
    values: vi.fn().mockReturnValue({
      onConflictDoUpdate: vi.fn().mockResolvedValue(undefined),
    }),
  };
}

function reconciliationDelete() {
  return {
    where: vi.fn().mockResolvedValue(undefined),
  };
}

async function settleQueue(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe("queueUpsert reconciliation fencing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGoogleRefreshToken.mockReturnValue("test-refresh-token");
    mockInsert.mockImplementation(reconciliationInsert);
    mockDelete.mockImplementation(reconciliationDelete);
    mockSpreadsheetsGet.mockResolvedValue({
      data: { sheets: [{ properties: { title: "WALKINs" } }] },
    });
    mockSheetsGet.mockResolvedValue({ data: { values: [] } });
    mockSheetsAppend.mockResolvedValue({});
  });

  it("keeps durable markers after a stale holder is rejected, then clears them after the next owner retries", async () => {
    mockFencedWrite.mockRejectedValueOnce(
      new Error("Walk-in sheet write rejected: lease was lost before append RIS lead"),
    );

    queueUpsert("RIS", lead);
    await settleQueue();

    expect(mockInsert).toHaveBeenCalledTimes(2);
    expect(mockSheetsAppend).not.toHaveBeenCalled();
    expect(mockDelete).not.toHaveBeenCalled();

    mockFencedWrite.mockImplementation((_name: string, write: () => Promise<unknown>) => write());
    queueUpsert("RIS", lead);
    await settleQueue();

    expect(mockSheetsAppend).toHaveBeenCalledTimes(2);
    expect(mockDelete).toHaveBeenCalledTimes(2);
  });

  it("keeps markers pending when authentication fails before any Sheet request", async () => {
    mockGoogleRefreshToken.mockReturnValue(null);

    queueUpsert("RIS", lead);
    await settleQueue();

    expect(mockInsert).toHaveBeenCalledTimes(2);
    expect(mockSheetsAppend).not.toHaveBeenCalled();
    expect(mockDelete).not.toHaveBeenCalled();
  });
});