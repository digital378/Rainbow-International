import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockSheetsGet,
  mockSpreadsheetsGet,
  mockDbSelect,
  mockDbUpdate,
  mockDbInsert,
} = vi.hoisted(() => ({
  mockSheetsGet: vi.fn(),
  mockSpreadsheetsGet: vi.fn(),
  mockDbSelect: vi.fn(),
  mockDbUpdate: vi.fn(),
  mockDbInsert: vi.fn(),
}));

vi.mock("googleapis", () => {
  class OAuth2 {
    setCredentials(_credentials: object) {}
  }
  return {
    google: {
      auth: { OAuth2 },
      sheets: vi.fn(() => ({
        spreadsheets: {
          get: mockSpreadsheetsGet,
          values: {
            get: mockSheetsGet,
            update: vi.fn().mockResolvedValue({}),
            append: vi.fn().mockResolvedValue({}),
            batchUpdate: vi.fn().mockResolvedValue({}),
          },
          batchUpdate: vi.fn().mockResolvedValue({}),
        },
      })),
    },
  };
});

vi.mock("../server/db", () => ({
  db: {
    select: mockDbSelect,
    update: mockDbUpdate,
    insert: mockDbInsert,
  },
}));

import {
  leadToRow,
  pullChangesFromSheet,
  SHEET_HEADERS,
  RPS_SHEET_HEADERS,
  MASTER_SHEET_HEADERS,
} from "../server/walkinSheets";
import { db } from "../server/db";
import type { WalkinLead } from "../shared/schema";

const dateLead = (admissionDate: string | null): WalkinLead => ({
  id: "lead-42",
  brand: "RIS",
  branchId: null,
  academicYear: "2027-28",
  enquiryDate: "2026-09-01",
  monthLabel: "Sep-26",
  parentName: "Test Parent",
  childName: "Test Child",
  phone: "9000000001",
  altPhone: null,
  email: null,
  program: "Grade 1",
  source: "Walk-in",
  status: "WALK-IN COMPLETED",
  closeReason: null,
  remark: null,
  leadOwner: null,
  walkInDate: "2026-09-12",
  admissionDate,
  revisitDate: null,
  misCallingRemarks: null,
  isArchived: false,
  createdBy: "test",
  updatedBy: null,
  createdAt: new Date("2026-09-01T10:00:00.000Z"),
  updatedAt: new Date("2026-09-01T10:00:00.000Z"),
  seqNum: 42,
  brandSeqNum: 42,
});

const indexOfHeader = (header: readonly string[], value: string) => header.indexOf(value);

beforeEach(() => {
  vi.clearAllMocks();

  process.env.GOOGLE_REFRESH_TOKEN = "test-refresh-token";
  process.env.GOOGLE_CLIENT_ID = "test-client-id";
  process.env.GOOGLE_CLIENT_SECRET = "test-client-secret";
  process.env.RIS_WALKIN_SHEET_ID_2728 = "test-ris-sheet";
  delete process.env.MASTER_WALKIN_SHEET_ID_2728;

  mockSpreadsheetsGet.mockResolvedValue({
    data: { sheets: [{ properties: { title: "WALKINs" } }] },
  });
  mockSheetsGet.mockResolvedValue({ data: { values: [] } });
  mockDbUpdate.mockReturnValue({
    set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue([]) }),
  });
  mockDbInsert.mockReturnValue({ values: vi.fn().mockResolvedValue([]) });
});

describe("independent walk-in and actual admission dates", () => {
  it("serializes the legacy Admission Date and Actual Admission Date independently", async () => {
    const row = await leadToRow(dateLead("2026-09-29"));

    expect(row[indexOfHeader(SHEET_HEADERS, "Admission Date")]).toBe("12/09/2026");
    expect(row[indexOfHeader(SHEET_HEADERS, "Actual Admission Date")]).toBe("29/09/2026");
  });

  it("leaves Actual Admission Date blank when admissionDate is null", async () => {
    const row = await leadToRow(dateLead(null));

    expect(row[indexOfHeader(SHEET_HEADERS, "Admission Date")]).toBe("12/09/2026");
    expect(row[indexOfHeader(SHEET_HEADERS, "Actual Admission Date")]).toBe("");
  });

  it("appends the new header without moving the existing Lead ID column", () => {
    expect(indexOfHeader(SHEET_HEADERS, "Lead ID")).toBe(19);
    expect(indexOfHeader(RPS_SHEET_HEADERS, "Lead ID")).toBe(20);
    expect(indexOfHeader(MASTER_SHEET_HEADERS, "Lead ID")).toBe(21);
    expect(indexOfHeader(SHEET_HEADERS, "Actual Admission Date")).toBe(20);
    expect(indexOfHeader(RPS_SHEET_HEADERS, "Actual Admission Date")).toBe(21);
    expect(indexOfHeader(MASTER_SHEET_HEADERS, "Actual Admission Date")).toBe(22);
  });

  it("pulls Actual Admission Date into admissionDate without changing legacy walkInDate", async () => {
    const header = [...SHEET_HEADERS];
    const row = Array<string>(header.length).fill("");
    row[indexOfHeader(header, "Status")] = "WALK-IN COMPLETED";
    row[indexOfHeader(header, "Admission Date")] = "12/09/2026";
    row[indexOfHeader(header, "Actual Admission Date")] = "29/09/2026";
    row[indexOfHeader(header, "Lead ID")] = "lead-42";
    mockSheetsGet.mockResolvedValue({ data: { values: [header, row] } });

    const existing = {
      ...dateLead(null),
      remark: null,
      revisitDate2: null,
    };
    mockDbSelect.mockImplementation((fields?: unknown) => {
      if (fields) {
        return {
          from: vi.fn().mockResolvedValue(
            // Status and close-reason allowlists; the existing values are valid.
            [{ label: "WALK-IN COMPLETED" }],
          ),
        } as any;
      }
      return {
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([existing]),
        }),
      } as any;
    });

    const updateSet = vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue([]),
    });
    mockDbUpdate.mockReturnValue({ set: updateSet });

    const result = await pullChangesFromSheet("RIS");

    expect(result.errors).toEqual([]);
    expect(result.changes).toContainEqual({
      leadId: "lead-42",
      parentName: "Test Parent",
      field: "admissionDate",
      oldVal: null,
      newVal: "2026-09-29",
    });
    expect(updateSet).toHaveBeenCalledOnce();
    const patch = updateSet.mock.calls[0][0] as Record<string, unknown>;
    expect(patch.admissionDate).toBe("2026-09-29");
    expect(patch).not.toHaveProperty("walkInDate");
    expect(patch.updatedBy).toBe("sheet-sync");
    expect(vi.mocked(db.update)).toHaveBeenCalled();
  });
});