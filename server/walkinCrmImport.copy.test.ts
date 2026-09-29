import { beforeEach, describe, expect, it, vi } from "vitest";
import { walkinBranches, walkinLeads, walkinSyncReconciliations, walkinSyncSnapshots } from "../shared/schema";

// These are deliberately local workbook copies: a test must never obtain an OAuth
// client or a real spreadsheet ID, even when run in a configured workspace.
const fixture = vi.hoisted(() => ({
  rows: [] as any[],
  markers: new Set<string>(),
  snapshots: new Map<string, any>(),
  books: new Map<string, { rows: string[][]; protections: object[]; columns?: number; rowCount?: number }>(),
  supplement: vi.fn(),
  failAppend: "" as string,
  writes: [] as string[],
  sheetClients: [] as string[],
  sheetReads: [] as string[],
}));

vi.mock("./googleCredentials", () => ({ getGoogleRefreshToken: () => "fixture-only" }));
vi.mock("./walkinSyncCoordinator", () => ({
  fencedWalkinSheetWrite: async (_label: string, write: () => Promise<unknown>) => write(),
  runWalkinSheetOperation: async (_label: string, operation: () => Promise<unknown>) => operation(),
  beginWalkinSyncShutdown: vi.fn(),
  isWalkinSyncDraining: () => false,
  waitForWalkinSyncDrain: vi.fn(),
}));
vi.mock("./marketing2728Sheets", () => ({
  readMarketing2728Supplement: fixture.supplement,
  supplementLeadKey: (row: any) => [
    row.enquiryDate, row.phone.replace(/\D/g, "").slice(-10), row.childName.toLowerCase().trim(),
  ].join("|"),
}));

function conditionHas(condition: unknown, value: string): boolean {
  // Drizzle SQL parameters in a where clause carry the actual bound value.
  const seen = new WeakSet<object>();
  return JSON.stringify(condition, (_key, item) => {
    if (typeof item === "object" && item !== null) {
      if (seen.has(item)) return undefined;
      seen.add(item);
    }
    return item;
  })?.includes(`"${value}"`) ?? false;
}

vi.mock("./db", () => {
  const select = () => ({
    from: (table: unknown) => {
      const read = (condition?: unknown) => {
        if (table === walkinBranches) return [{ id: 1, name: "Central", code: "central", brand: "RIS" },
          { id: 2, name: "West", code: "west", brand: "RPS" }];
        if (table === walkinSyncReconciliations) return [...fixture.markers].map(scope => ({ scope }));
        if (table === walkinSyncSnapshots) {
          return [...fixture.snapshots.entries()].map(([key, snapshot]) => ({
            scope: key.split(":")[0], leadId: key.split(":")[1], snapshot, updatedAt: new Date(),
          })).filter(row => !condition || conditionHas(condition, row.scope) && conditionHas(condition, row.leadId));
        }
        if (table === walkinLeads) return fixture.rows.filter(row =>
          !condition || ((!conditionHas(condition, "RIS") || row.brand === "RIS")
            && (!conditionHas(condition, "RPS") || row.brand === "RPS")));
        return [];
      };
      const query = (condition?: unknown) => ({
        then: (resolve: any, reject: any) => Promise.resolve(read(condition)).then(resolve, reject),
        orderBy: () => Promise.resolve(read(condition)),
      });
      return { ...query(), where: (condition: unknown) => query(condition) };
    },
  });
  const insert = (table: unknown) => ({
    values: (value: any) => {
      if (table === walkinLeads) fixture.rows.push(value);
      if (table === walkinSyncReconciliations) fixture.markers.add(value.scope);
      if (table === walkinSyncSnapshots) fixture.snapshots.set(`${value.scope}:${value.leadId}`, value.snapshot);
      return {
        returning: async () => [value],
        onConflictDoUpdate: async () => undefined,
      };
    },
  });
  return { db: {
    select, insert,
    delete: (_table: unknown) => ({ where: async (condition: unknown) => {
      for (const scope of [...fixture.markers]) if (conditionHas(condition, scope)) fixture.markers.delete(scope);
    } }),
    execute: async () => ({ rows: [{ brandSeqNum: "1" }] }),
    transaction: async (callback: (tx: any) => Promise<unknown>) =>
      callback({ select, insert, execute: async () => ({ rows: [{ brandSeqNum: "1" }] }) }),
  } };
});

vi.mock("googleapis", () => {
  const column = (letters: string) => [...letters].reduce((n, c) => n * 26 + c.charCodeAt(0) - 64, 0) - 1;
  const sheets = {
    spreadsheets: {
      get: async ({ spreadsheetId }: any) => {
        fixture.sheetReads.push(spreadsheetId);
        if (!fixture.books.has(spreadsheetId)) throw Error("Unexpected workbook");
        const book = fixture.books.get(spreadsheetId)!;
        return { data: { sheets: [{ properties: {
          title: "WALKINs", sheetId: ids.indexOf(spreadsheetId) + 1,
          gridProperties: {
            columnCount: book.columns ?? book.rows[0].length,
            rowCount: book.rowCount ?? 1028,
          },
        }, protectedRanges: book.protections }] } };
      },
      batchUpdate: async ({ spreadsheetId, requestBody }: any) => {
        const book = fixture.books.get(spreadsheetId)!;
        for (const request of requestBody.requests) {
          if (!request.appendDimension) {
            throw Error("Unexpected metadata mutation");
          }
          if (request.appendDimension.dimension === "COLUMNS") {
            book.columns = (book.columns ?? book.rows[0].length) + request.appendDimension.length;
          } else if (request.appendDimension.dimension === "ROWS") {
            book.rowCount = (book.rowCount ?? 1028) + request.appendDimension.length;
          } else {
            throw Error("Unexpected dimension");
          }
          fixture.writes.push(`extend:${spreadsheetId}`);
        }
      },
      values: {
        get: async ({ spreadsheetId, range }: any) => {
          fixture.sheetReads.push(spreadsheetId);
          const rows = fixture.books.get(spreadsheetId)?.rows;
          if (!rows) throw Error("Unexpected workbook");
          const part = range.split("!")[1];
          let values: string[][];
          if (part === "1:1") values = rows.slice(0, 1);
          else if (/^([A-Z]+):\1$/.test(part)) {
            const index = column(part.split(":")[0]);
            values = rows.map(row => [row[index] ?? ""]);
          } else if (/^A\d+:[A-Z]+\d+$/.test(part)) {
            const start = Number(part.match(/^A(\d+)/)![1]) - 1;
            values = [rows[start] ?? []];
          } else values = rows;
          return { data: { values: structuredClone(values) } };
        },
        append: async ({ spreadsheetId, requestBody }: any) => {
          if (fixture.failAppend === spreadsheetId) {
            fixture.failAppend = "";
            throw Error("simulated interrupted mirror");
          }
          fixture.books.get(spreadsheetId)!.rows.push(structuredClone(requestBody.values[0]));
          fixture.writes.push(`append:${spreadsheetId}`);
        },
        batchUpdate: async ({ spreadsheetId, requestBody }: any) => {
          for (const data of requestBody.data) {
            const match = data.range.match(/!([A-Z]+)(\d+):/)!;
            const row = fixture.books.get(spreadsheetId)!.rows[Number(match[2]) - 1];
            data.values[0].forEach((cell: string, offset: number) => { row[column(match[1]) + offset] = cell; });
          }
          fixture.writes.push(`update:${spreadsheetId}`);
        },
        update: async ({ spreadsheetId, range, requestBody }: any) => {
          const cell = range.match(/!([A-Z]+)1$/);
          const newRow = range.match(/!A(\d+):([A-Z]+)\1$/);
          const book = fixture.books.get(spreadsheetId)!;
          if (newRow) {
            if (fixture.failAppend === spreadsheetId) {
              fixture.failAppend = "";
              throw Error("simulated interrupted mirror");
            }
            if (Number(newRow[1]) !== book.rows.length + 1) throw Error("Unexpected row overwrite");
            book.rows.push(structuredClone(requestBody.values[0]));
            fixture.writes.push(`append:${spreadsheetId}`);
            return;
          }
          const targetCell = range.match(/!([A-Z]+)(\d+)$/);
          if (!targetCell || requestBody.values.length !== 1 || requestBody.values[0].length !== 1) {
            throw Error("Unexpected full-row update");
          }
          if (column(targetCell[1]) >= (book.columns ?? book.rows[0].length)) {
            throw Error("Header write exceeds grid limits");
          }
          book.rows[Number(targetCell[2]) - 1][column(targetCell[1])] = requestBody.values[0][0];
          fixture.writes.push(`cell:${spreadsheetId}!${targetCell[1]}${targetCell[2]}`);
        },
        clear: async () => { throw Error("Unexpected sheet clear"); },
      },
    },
  };
  return { google: {
    auth: { OAuth2: class {
      setCredentials() {}
      async getAccessToken() { return "fixture-only"; }
    } },
    sheets: () => {
      fixture.sheetClients.push("created");
      return sheets;
    },
  } };
});

import { applyCrmImport, previewCrmImport } from "./walkinCrmImport";
import {
  MASTER_SHEET_HEADERS, queueImportUpserts, RPS_SHEET_HEADERS,
  SHEET_HEADERS, upsertLeadToMasterSheet, upsertLeadToSheet, getSyncStatus,
  pullChangesFromMasterSheet, removeLeadFromMasterSheet, queueUpsert, queueRemove,
  syncDeletionsFromMaster,
  resyncBrandToSheet, resyncMasterSheet,
} from "./walkinSheets";

const ids = ["copy-ris", "copy-rps", "copy-master"] as const;
const originals = new Map<string, string[][]>();
const protections = new Map<string, object[]>();
const importedRow = (book: string) => fixture.books.get(book)!.rows.slice(1).filter(row =>
  row[fixture.books.get(book)!.rows[0].indexOf("Lead ID")]?.startsWith("crm-"));
const tick = async () => {
  for (let i = 0; i < 20; i++) await new Promise(resolve => setTimeout(resolve, 0));
};

describe("historical import against isolated RIS, RPS and Master workbook copies", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fixture.rows = [];
    fixture.markers.clear();
    fixture.snapshots.clear();
    fixture.books.clear();
    fixture.writes = [];
    fixture.sheetClients = [];
    fixture.sheetReads = [];
    fixture.failAppend = "";
    vi.stubEnv("GOOGLE_CLIENT_ID", "fixture-only");
    vi.stubEnv("GOOGLE_CLIENT_SECRET", "fixture-only");
    vi.stubEnv("RIS_WALKIN_SHEET_ID_2728", ids[0]);
    vi.stubEnv("RPS_WALKIN_SHEET_ID_2728", ids[1]);
    vi.stubEnv("MASTER_WALKIN_SHEET_ID_2728", ids[2]);
    const headers = [SHEET_HEADERS, RPS_SHEET_HEADERS, MASTER_SHEET_HEADERS];
    ids.forEach((id, index) => {
      const historical = Array.from({ length: 3 }, (_, n) => {
        const row = Array.from({ length: headers[index].length }, () => "");
        row[headers[index].indexOf("Student Name")] = `Historical student ${index}-${n}`;
        row[headers[index].indexOf("Status")] = n === 2 ? "FOLLOW-UP" : "OPEN";
        row[headers[index].indexOf("Follow up Remarks")] = `Staff note ${n}`;
        return row; // intentionally no Lead ID, even for incomplete old records
      });
      const guard = [{ protectedRangeId: 100 + index, description: "Yellow submission columns — protected by sync" }];
      fixture.books.set(id, { rows: [Array.from(headers[index]), ...historical], protections: structuredClone(guard) });
      originals.set(id, structuredClone(historical));
      protections.set(id, structuredClone(guard));
    });
    fixture.supplement.mockImplementation(async (brand: string) => {
      const row = {
        enquiryDate: "2027-06-12", monthLabel: "Jun-27", parentName: "Parent",
        childName: brand === "RIS" ? "New RIS" : "New RPS",
        phone: brand === "RIS" ? "9876543210" : "9876543211",
        branchName: brand === "RIS" ? "Central" : "West",
        walkInDate: null, status: "OPEN", source: "Website", leadOwner: "", program: "Grade 1",
      };
      return { leads: [row], walkins: [row], months: [], fetchedAt: "2027-06-13T00:00:00Z", available: true, mode: "oauth" };
    });
  });

  function assertUntouched() {
    for (const id of ids) {
      expect(fixture.books.get(id)!.rows.slice(1, 4)).toEqual(originals.get(id));
      expect(fixture.books.get(id)!.protections).toEqual(protections.get(id));
    }
  }

  it("imports reviewed enquiries into CRM without mirroring them into WALKINs", async () => {
    expect(await previewCrmImport()).toMatchObject({ eligible: 2, review: 0, byBrand: { RIS: 1, RPS: 1 } });
    expect(fixture.writes).toEqual([]);
    assertUntouched();
    const first = await applyCrmImport();
    expect(first).toMatchObject({ imported: 2, skipped: 0, review: 0 });
    expect(first.importedIds).toHaveLength(2);
    queueImportUpserts(first.importedIds);
    await tick();
    expect(fixture.writes).toEqual([]);
    expect(importedRow(ids[0])).toHaveLength(0);
    expect(importedRow(ids[1])).toHaveLength(0);
    expect(importedRow(ids[2])).toHaveLength(0);
    assertUntouched();

    expect(await previewCrmImport()).toMatchObject({ eligible: 0, alreadyPresent: 2 });
    expect(await applyCrmImport()).toMatchObject({ imported: 0, skipped: 2 });
    queueImportUpserts(first.importedIds);
    await tick();
    expect(fixture.writes).toEqual([]);
    expect(importedRow(ids[0])).toHaveLength(0);
    expect(importedRow(ids[1])).toHaveLength(0);
    expect(importedRow(ids[2])).toHaveLength(0);
    assertUntouched();
  });

  it("leaves a non-completed unmatched DM enquiry out of all WALKINs tabs", async () => {
    const result = await applyCrmImport();
    queueImportUpserts(result.importedIds);
    const ris = fixture.rows.find(row => row.brand === "RIS");
    await upsertLeadToSheet("RIS", ris);
    await tick();
    expect(fixture.writes).toEqual([]);
    expect(importedRow(ids[0])).toHaveLength(0);
    expect(importedRow(ids[1])).toHaveLength(0);
    expect(importedRow(ids[2])).toHaveLength(0);
    assertUntouched();
  });

  it("links a unique completed visit by changing only its primary Lead ID cell", async () => {
    const result = await applyCrmImport();
    const lead = fixture.rows.find(row => row.brand === "RIS");
    Object.assign(lead, {
      createdBy: "kiosk",
      status: "WALK-IN COMPLETED",
      walkInDate: "2027-06-20",
    });
    const book = fixture.books.get(ids[0])!;
    const header = book.rows[0];
    const visit = book.rows[1];
    visit[header.indexOf("Student Name")] = lead.childName;
    visit[header.indexOf("Father Contact")] = lead.phone;
    visit[header.indexOf("Status")] = "WALK-IN COMPLETED";
    const extraIndex = header.length;
    header.push("Staff Extra");
    book.rows.forEach((row, index) => { row[extraIndex] = index === 1 ? "preserve this" : ""; });
    originals.set(ids[0], structuredClone(book.rows.slice(1)));
    const before = structuredClone(book.rows);
    const guard = structuredClone(book.protections);

    await upsertLeadToSheet("RIS", lead);

    const linkedRow = book.rows[1];
    const idColumn = header.indexOf("Lead ID");
    expect(linkedRow[idColumn]).toBe(lead.id);
    const expectedRows = before.slice(1).map(row => [...row]);
    expectedRows[0][idColumn] = lead.id;
    expect(book.rows.slice(1)).toEqual(expectedRows);
    expect(book.protections).toEqual(guard);
    expect(fixture.writes).toEqual([`cell:${ids[0]}!${String.fromCharCode(65 + idColumn)}2`]);
  });

  it("refuses ambiguous visit identities without writing", async () => {
    await applyCrmImport();
    const lead = fixture.rows.find(row => row.brand === "RIS");
    Object.assign(lead, {
      createdBy: "kiosk",
      status: "WALK-IN COMPLETED",
      walkInDate: "2027-06-20",
    });
    const book = fixture.books.get(ids[0])!;
    const header = book.rows[0];
    for (const row of book.rows.slice(1, 3)) {
      row[header.indexOf("Student Name")] = lead.childName;
      row[header.indexOf("Father Contact")] = lead.phone;
      row[header.indexOf("Status")] = "WALK-IN COMPLETED";
    }
    const before = structuredClone(book.rows);
    await expect(upsertLeadToSheet("RIS", lead)).rejects.toThrow(/Multiple WALKINs rows match/);
    expect(fixture.writes).toEqual([]);
    expect(book.rows).toEqual(before);
    expect(book.protections).toEqual(protections.get(ids[0]));
  });

  it("rejects full resync on all three copies before clearing historical rows or protections", async () => {
    await applyCrmImport();
    await expect(resyncBrandToSheet("RIS")).rejects.toThrow(/Full resync is disabled/);
    await expect(resyncBrandToSheet("RPS")).rejects.toThrow(/Full resync is disabled/);
    await expect(resyncMasterSheet()).rejects.toThrow(/Master WALKINs resync is temporarily disabled/);
    expect(fixture.writes).toEqual([]);
    assertUntouched();
  });

  it("surfaces a conflicting green-column edit instead of overwriting it", async () => {
    await applyCrmImport();
    const ris = fixture.rows.find(row => row.brand === "RIS");
    Object.assign(ris, {
      createdBy: "kiosk",
      status: "WALK-IN COMPLETED",
      walkInDate: "2027-06-20",
    });
    await upsertLeadToSheet("RIS", ris);
    const row = fixture.books.get(ids[0])!.rows.find(item =>
      item[SHEET_HEADERS.indexOf("Lead ID")] === ris.id)!;
    row[SHEET_HEADERS.indexOf("Status")] = "CLOSED"; // staff changes after the last successful mirror
    ris.status = "WALK-IN BOOKED"; // CRM changes concurrently
    const before = structuredClone(row);
    await expect(upsertLeadToSheet("RIS", ris)).rejects.toThrow(/unsynced concurrent edits.*status/);
    expect(importedRow(ids[0])[0]).toEqual(before);
    expect(getSyncStatus().RIS.lastError).toContain("status");
    assertUntouched();
    await expect(upsertLeadToMasterSheet(ris)).rejects.toThrow(/Master WALKINs synchronization is temporarily disabled/);
    assertUntouched();
  });

  it("fails direct Master operations before Google access and preserves existing Master data and pending markers", async () => {
    fixture.markers.add("MASTER");
    const masterBefore = structuredClone(fixture.books.get(ids[2]));
    const pull = await pullChangesFromMasterSheet();
    expect(pull.errors).toContain("Master WALKINs synchronization is temporarily disabled");
    expect(await syncDeletionsFromMaster()).toMatchObject({
      archived: 0,
      errors: ["Master WALKINs deletion sync is temporarily disabled"],
    });
    await expect(upsertLeadToMasterSheet({ id: "master-disabled" } as any))
      .rejects.toThrow(/Master WALKINs synchronization is temporarily disabled/);
    await expect(removeLeadFromMasterSheet("master-disabled"))
      .rejects.toThrow(/Master WALKINs removal is temporarily disabled/);
    await expect(resyncMasterSheet())
      .rejects.toThrow(/Master WALKINs resync is temporarily disabled/);

    expect(fixture.sheetClients).toEqual([]);
    expect(fixture.sheetReads).toEqual([]);
    expect(fixture.writes).toEqual([]);
    expect(fixture.books.get(ids[2])).toEqual(masterBefore);
    expect(fixture.markers).toEqual(new Set(["MASTER"]));
  });

  it("queues branch upserts and removals without touching Master or its reconciliation marker", async () => {
    await applyCrmImport();
    // Import's separate reconciliation marker is outside this queued mirror;
    // start without one to verify the queue does not create it.
    fixture.markers.delete("MASTER");
    const lead = fixture.rows.find(row => row.brand === "RIS");
    Object.assign(lead, {
      createdBy: "kiosk",
      status: "WALK-IN COMPLETED",
      walkInDate: "2027-06-20",
    });
    const masterBefore = structuredClone(fixture.books.get(ids[2]));

    queueUpsert("RIS", lead);
    await tick();
    expect(fixture.markers.has("MASTER")).toBe(false);

    fixture.markers.add("MASTER");
    queueRemove("RIS", lead.id);
    await tick();

    expect(fixture.sheetReads.every(id => id !== ids[2])).toBe(true);
    expect(fixture.writes.every(write => !write.includes(ids[2]))).toBe(true);
    expect(fixture.books.get(ids[2])).toEqual(masterBefore);
    expect(fixture.markers.has("MASTER")).toBe(true);
  });
});