import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SupplementLead } from "./marketing2728Sheets";
import { walkinBranches, walkinLeads } from "../shared/schema";

const mocks = vi.hoisted(() => ({
  supplement: vi.fn(),
  existing: [] as any[],
  branches: [] as any[],
  inserted: [] as Array<{ table: unknown; values: any }>,
  transaction: vi.fn(),
}));

vi.mock("./marketing2728Sheets", () => ({
  readMarketing2728Supplement: mocks.supplement,
  supplementLeadKey: (lead: Pick<SupplementLead, "enquiryDate" | "phone" | "childName">) => [
    lead.enquiryDate,
    lead.phone.replace(/\D/g, "").slice(-10),
    lead.childName.toLowerCase().replace(/\s+/g, " ").trim(),
  ].join("|"),
}));

vi.mock("./db", () => {
  const query = (getRows: () => any[]) => {
    const promise = Promise.resolve(getRows());
    return {
      where: () => Promise.resolve(getRows()),
      then: promise.then.bind(promise),
      catch: promise.catch.bind(promise),
    };
  };
  const select = () => ({
    from: (table: unknown) => query(() => table === walkinLeads ? mocks.existing : mocks.branches),
  });
  const tx: any = {
    select,
    execute: vi.fn(async () => ({ rows: [{ brandSeqNum: "1" }] })),
    insert: (table: unknown) => ({
      values: (values: any) => {
        mocks.inserted.push({ table, values });
        return {
          returning: async () => [{ id: values.id }],
          onConflictDoUpdate: async () => undefined,
        };
      },
    }),
  };
  return {
    db: {
      select,
      transaction: mocks.transaction.mockImplementation(async (callback: (transaction: any) => unknown) => callback(tx)),
    },
  };
});

import { applyCrmImport, previewCrmImport } from "./walkinCrmImport";

const lead = (overrides: Partial<SupplementLead> = {}): SupplementLead => ({
  enquiryDate: "2027-06-12",
  monthLabel: "Jun-27",
  parentName: "",
  childName: "Aarav",
  phone: "9876543210",
  branchName: "Central",
  walkInDate: null,
  status: "OPEN",
  source: "Website",
  leadOwner: "",
  program: "Grade 1",
  ...overrides,
});

function source(leads: SupplementLead[], walkins: SupplementLead[] = leads, mode: "oauth" | "public" = "oauth") {
  return {
    leads,
    walkins,
    months: [],
    fetchedAt: "2027-06-13T00:00:00.000Z",
    available: true,
    mode,
  };
}

describe("historical CRM walk-in import", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.existing = [];
    mocks.inserted = [];
    mocks.branches = [{ id: 1, name: "Central", code: "central", brand: "RIS" }];
  });

  it("imports DM tracker rows only and reviews unsafe tracker rows", async () => {
    const valid = lead();
    const missingPhone = lead({
      childName: "Mira", phone: "",
      sourceLocations: ["CRM Leads Tracker row 42"],
    });
    const completedVisit = lead({
      childName: "Walk-in only",
      phone: "9876543212",
      status: "WALK-IN COMPLETED",
      walkInDate: "2027-06-12",
      sourceLocations: ["WALKINs row 19"],
    });
    mocks.supplement.mockImplementation(async (brand: string) => source(
      brand === "RIS" ? [valid, missingPhone] : [],
      brand === "RIS" ? [valid, completedVisit] : [],
    ));

    const result = await previewCrmImport();

    expect(result).toMatchObject({
      eligible: 1,
      alreadyPresent: 0,
      review: 1,
      byBrand: { RIS: 1, RPS: 0 },
    });
    expect(result.issues[0].reason).toContain("Phone number is missing");
    expect(result.issues[0].reference).toMatch(/^RIS-[a-f0-9]{10}$/);
    expect(result.issues[0].reference).not.toContain("Mira");
    expect(result.issues[0].sourceLocations).toEqual(["CRM Leads Tracker row 42"]);

    const applied = await applyCrmImport();
    const importedLeads = mocks.inserted.filter(row => row.table === walkinLeads).map(row => row.values);
    expect(applied.imported).toBe(1);
    expect(importedLeads.map(row => row.childName)).toEqual(["Aarav"]);
    expect(importedLeads.some(row => row.childName === "Walk-in only")).toBe(false);
  });

  it("previews a conflicting identity within the same import batch as needing review", async () => {
    mocks.supplement.mockImplementation(async (brand: string) => source(
      brand === "RIS" ? [lead(), lead({ childName: "Another Child" })] : [],
      [],
    ));

    const preview = await previewCrmImport();
    expect(preview).toMatchObject({
      eligible: 1,
      review: 1,
      byBrand: { RIS: 1, RPS: 0 },
    });
    expect(preview.issues[0].reason).toContain("different child name");
  });

  it("keeps a missing child name pending without inserting or inventing an identity", async () => {
    mocks.supplement.mockImplementation(async (brand: string) => source(
      brand === "RIS" ? [lead({ childName: "", sourceLocations: ["CRM Leads Tracker row 50"] })] : [],
      [],
    ));
    const preview = await previewCrmImport();
    const applied = await applyCrmImport();
    expect(preview).toMatchObject({ eligible: 0, review: 1 });
    expect(preview.issues[0]).toMatchObject({
      sourceLocations: ["CRM Leads Tracker row 50"],
      reason: expect.stringContaining("Child name is missing"),
    });
    expect(applied).toMatchObject({ imported: 0, review: 1 });
    expect(mocks.inserted.some(row => row.table === walkinLeads)).toBe(false);
  });

  it("does not import an eleven-digit malformed phone", async () => {
    mocks.existing = [{
      id: "existing-1", brand: "RIS", enquiryDate: "2027-06-12",
      phone: "9876543210", childName: "Aarav",
    }];
    mocks.supplement.mockImplementation(async (brand: string) => source(
      brand === "RIS" ? [lead({ phone: "19876543210" })] : [],
      [],
    ));
    const preview = await previewCrmImport();
    const result = await applyCrmImport();
    expect(preview).toMatchObject({ alreadyPresent: 0, review: 1 });
    expect(result).toMatchObject({ imported: 0, review: 1 });
    expect(result.issues[0].reason).toContain("Phone number is missing or invalid");
  });

  it("keeps an ambiguous branch null, with a warning rather than blocking import", async () => {
    mocks.branches.push({ id: 2, name: "CENTRAL", code: "central-2", brand: "RIS" });
    mocks.supplement.mockImplementation(async (brand: string) => source(brand === "RIS" ? [lead()] : []));

    const result = await previewCrmImport();

    expect(result.eligible).toBe(1);
    expect(result.review).toBe(0);
    expect(result.issues[0].reason).toContain("Warning:");
    expect(result.issues[0].reason).toContain("more than one location");
  });

  it("skips exact database identities and sends edited-child phone collisions to review", async () => {
    const existing = lead();
    const edited = lead({ childName: "Aarav Kumar" });
    mocks.existing = [{
      id: "existing-1",
      brand: "RIS",
      enquiryDate: existing.enquiryDate,
      phone: existing.phone,
      childName: existing.childName,
    }];
    mocks.supplement.mockImplementation(async (brand: string) => source(
      brand === "RIS" ? [existing, edited] : [],
    ));

    const result = await previewCrmImport();

    expect(result.alreadyPresent).toBe(1);
    expect(result.eligible).toBe(0);
    expect(result.review).toBe(1);
    expect(result.issues[0].reason).toContain("different child name");
  });

  it("retains the public fallback source type and refuses to apply its read-only data", async () => {
    mocks.supplement.mockImplementation(async (brand: string) => source(
      brand === "RIS" ? [lead()] : [],
      brand === "RIS" ? [lead()] : [],
      brand === "RIS" ? "public" : "oauth",
    ));

    const preview = await previewCrmImport();
    const result = await applyCrmImport();

    expect(preview.sourceReady).toBe(false);
    expect(preview.eligible).toBe(1);
    expect(result.imported).toBe(0);
    expect(result.review).toBe(1);
    expect(result.issues[0].reason).toContain("authenticated, complete CRM source data");
  });

  it("inserts eligible records with stable legacy provenance and a brand sequence", async () => {
    const valid = lead();
    mocks.supplement.mockImplementation(async (brand: string) => source(brand === "RIS" ? [valid] : []));

    const result = await applyCrmImport();
    const insertedLead = mocks.inserted.find(row => row.table === walkinLeads)?.values;

    expect(result).toMatchObject({ imported: 1, skipped: 0, review: 0, issues: [] });
    expect(insertedLead).toMatchObject({
      id: expect.stringMatching(/^crm-[a-f0-9]{64}$/),
      brand: "RIS",
      branchId: 1,
      parentName: "",
      createdBy: "legacy-import",
      brandSeqNum: 1,
    });
    expect(mocks.inserted.some(row => row.values?.field === "created"
      && row.values?.changedBy === "legacy-import"
      && row.values?.newValue.includes("marketing-27-28-crm-tracker"))).toBe(true);
  });

  it("imports incomplete historical branch, close-reason, and walk-in fields as null with warnings", async () => {
    const incomplete = lead({
      branchName: "",
      status: "CLOSED",
      walkInDate: null,
    });
    mocks.supplement.mockImplementation(async (brand: string) => source(brand === "RIS" ? [incomplete] : []));

    const preview = await previewCrmImport();
    const applied = await applyCrmImport();
    const insertedLead = mocks.inserted.find(row => row.table === walkinLeads)?.values;

    expect(preview).toMatchObject({ eligible: 1, review: 0, byBrand: { RIS: 1, RPS: 0 } });
    expect(preview.issues[0].reason).toContain("Branch is missing");
    expect(preview.issues[0].reason).toContain("no close reason");
    expect(applied).toMatchObject({ imported: 1, review: 0 });
    expect(applied.issues.some(issue => issue.reason.startsWith("Warning:"))).toBe(true);
    expect(insertedLead).toMatchObject({ branchId: null, closeReason: null, walkInDate: null });
  });

  it("accepts canonical tracker statuses without requiring matching WALKINs statuses", async () => {
    const extraStatuses = ["TRANSFERRED", "INTEGRATED", "NEXT YEAR"];
    const statuses = extraStatuses.map((status, index) => lead({
      childName: `Child ${index}`,
      phone: `987654321${index}`,
      status,
    }));
    const conflictingLead = lead({ childName: "Conflict", phone: "9876543214", status: "OPEN" });
    const conflictingWalkin = { ...conflictingLead, status: "CLOSED" };
    mocks.supplement.mockImplementation(async (brand: string) => source(
      brand === "RIS" ? [...statuses, conflictingLead] : [],
      brand === "RIS" ? [...statuses, conflictingWalkin] : [],
    ));

    const result = await previewCrmImport();

    expect(result.eligible).toBe(4);
    expect(result.review).toBe(0);
    expect(result.issues.some(issue => issue.reason.includes("conflicting statuses"))).toBe(false);
  });

  it("imports a booked lead without its legacy walk-in date and reports a warning", async () => {
    const booked = lead({ status: "WALK-IN BOOKED", walkInDate: null });
    mocks.supplement.mockImplementation(async (brand: string) => source(brand === "RIS" ? [booked] : []));

    const result = await previewCrmImport();

    expect(result.eligible).toBe(1);
    expect(result.review).toBe(0);
    expect(result.issues[0].reason).toContain("no valid walk-in date");
  });
});