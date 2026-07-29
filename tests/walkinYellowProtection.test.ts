/**
 * Unit tests for yellow-column protection logic in walkinSheets.ts
 *
 * These tests verify that buildYellowProtectionRequests() produces the correct
 * batchUpdate request list in every scenario a live resync can encounter:
 *   1. First-ever resync  — no existing protections → only 6 addProtectedRange
 *   2. Repeated resync    — our 6 protections exist → 6 delete + 6 add (no net duplicate)
 *   3. Alien protections  — other owners' protections exist → they are untouched
 *   4. Mixed              — both ours and alien protections → only ours are deleted
 *   5. Correct columns    — the 6 add requests cover exactly A,D,E,F,J,K (0,3,4,5,9,10)
 *   6. warningOnly flag   — every add request sets warningOnly: true
 */

import { describe, it, expect } from "vitest";
import {
  buildYellowProtectionRequests,
  YELLOW_PROTECTION_DESCRIPTION,
  YELLOW_COL_INDICES,
} from "../server/walkinSheets";

// ─── helpers ─────────────────────────────────────────────────────────────────

/** Build a fake existing protection as the Sheets API would return it. */
function makeExisting(id: number, description: string) {
  return { protectedRangeId: id, description };
}

/** Pull only the addProtectedRange requests out of a mixed list. */
function addRequests(reqs: object[]) {
  return reqs.filter((r: any) => "addProtectedRange" in r);
}

/** Pull only the deleteProtectedRange requests out of a mixed list. */
function deleteRequests(reqs: object[]) {
  return reqs.filter((r: any) => "deleteProtectedRange" in r);
}

// ─── tests ───────────────────────────────────────────────────────────────────

const TAB_SHEET_ID = 42;

describe("buildYellowProtectionRequests", () => {
  it("produces exactly 6 add requests and 0 delete requests on the first resync (no existing protections)", () => {
    const reqs = buildYellowProtectionRequests(TAB_SHEET_ID, []);

    expect(addRequests(reqs)).toHaveLength(6);
    expect(deleteRequests(reqs)).toHaveLength(0);
  });

  it("produces 6 delete + 6 add when our own protections already exist (prevents duplicates)", () => {
    // Simulate the state left behind by a previous resync
    const existing = YELLOW_COL_INDICES.map((_, i) =>
      makeExisting(100 + i, YELLOW_PROTECTION_DESCRIPTION),
    );

    const reqs = buildYellowProtectionRequests(TAB_SHEET_ID, existing);

    expect(deleteRequests(reqs)).toHaveLength(6);
    expect(addRequests(reqs)).toHaveLength(6);

    // Each delete targets one of the pre-existing IDs
    const deletedIds = deleteRequests(reqs).map(
      (r: any) => r.deleteProtectedRange.protectedRangeId,
    );
    expect(deletedIds.sort()).toEqual([100, 101, 102, 103, 104, 105]);
  });

  it("does NOT delete alien protections (different description)", () => {
    const alien = [
      makeExisting(999, "Manually set by owner"),
      makeExisting(998, "Finance columns — do not touch"),
    ];

    const reqs = buildYellowProtectionRequests(TAB_SHEET_ID, alien);

    // No deletes — the alien protections must survive intact
    expect(deleteRequests(reqs)).toHaveLength(0);
    expect(addRequests(reqs)).toHaveLength(6);
  });

  it("only deletes OUR protections when both ours and alien protections exist", () => {
    const mixed = [
      makeExisting(200, YELLOW_PROTECTION_DESCRIPTION), // ours
      makeExisting(201, YELLOW_PROTECTION_DESCRIPTION), // ours
      makeExisting(777, "Some other protection"),        // alien — must survive
    ];

    const reqs = buildYellowProtectionRequests(TAB_SHEET_ID, mixed);

    expect(deleteRequests(reqs)).toHaveLength(2);
    const deletedIds = deleteRequests(reqs).map(
      (r: any) => r.deleteProtectedRange.protectedRangeId,
    );
    expect(deletedIds).toContain(200);
    expect(deletedIds).toContain(201);
    expect(deletedIds).not.toContain(777);

    expect(addRequests(reqs)).toHaveLength(6);
  });

  it("adds protections for exactly columns A,D,E,F,J,K (0-based: 0,3,4,5,9,10)", () => {
    const reqs = buildYellowProtectionRequests(TAB_SHEET_ID, []);
    const adds = addRequests(reqs) as any[];

    const startCols = adds
      .map((r) => r.addProtectedRange.protectedRange.range.startColumnIndex)
      .sort((a, b) => a - b);

    expect(startCols).toEqual([...YELLOW_COL_INDICES].sort((a, b) => a - b));
  });

  it("each add request spans exactly one column (endColumnIndex = startColumnIndex + 1)", () => {
    const reqs = buildYellowProtectionRequests(TAB_SHEET_ID, []);
    const adds = addRequests(reqs) as any[];

    for (const r of adds) {
      const range = r.addProtectedRange.protectedRange.range;
      expect(range.endColumnIndex).toBe(range.startColumnIndex + 1);
    }
  });

  it("every add request uses the correct sheetId", () => {
    const reqs = buildYellowProtectionRequests(TAB_SHEET_ID, []);
    const adds = addRequests(reqs) as any[];

    for (const r of adds) {
      expect(r.addProtectedRange.protectedRange.range.sheetId).toBe(TAB_SHEET_ID);
    }
  });

  it("every add request sets warningOnly: true (editors see a dialog, not a hard block)", () => {
    const reqs = buildYellowProtectionRequests(TAB_SHEET_ID, []);
    const adds = addRequests(reqs) as any[];

    for (const r of adds) {
      expect(r.addProtectedRange.protectedRange.warningOnly).toBe(true);
    }
  });

  it("every add request stamps the canonical protection description", () => {
    const reqs = buildYellowProtectionRequests(TAB_SHEET_ID, []);
    const adds = addRequests(reqs) as any[];

    for (const r of adds) {
      expect(r.addProtectedRange.protectedRange.description).toBe(
        YELLOW_PROTECTION_DESCRIPTION,
      );
    }
  });

  it("deletes come BEFORE adds in the request array (safe ordering for batchUpdate)", () => {
    const existing = [makeExisting(300, YELLOW_PROTECTION_DESCRIPTION)];
    const reqs = buildYellowProtectionRequests(TAB_SHEET_ID, existing);

    const firstDeleteIdx = reqs.findIndex((r: any) => "deleteProtectedRange" in r);
    const firstAddIdx = reqs.findIndex((r: any) => "addProtectedRange" in r);

    expect(firstDeleteIdx).toBeGreaterThanOrEqual(0);
    expect(firstAddIdx).toBeGreaterThan(firstDeleteIdx);
  });
});
