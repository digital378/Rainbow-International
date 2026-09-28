import { describe, expect, it } from "vitest";
import { findTrackerTargets, istDay, sheetDay, shiftDay, writableFields, type Snapshot } from "../server/risInstagramTrackerCore";

describe("RIS Instagram tracker row matching", () => {
  it("uses IST days and Google Sheets serial dates", () => {
    expect(istDay(new Date("2026-09-27T19:00:00Z"))).toBe("2026-09-28");
    expect(sheetDay(46289)).toBe("2026-09-24");
    expect(shiftDay("2026-09-01", -1)).toBe("2026-08-31");
  });

  it("matches only existing RIS dates and completed weekly/monthly summaries", () => {
    const snapshots: Snapshot[] = Array.from({ length: 7 }, (_, n) => ({
      day: shiftDay("2026-09-21", n), posts: n === 1 ? 1 : 0, views: n === 1 ? 120 : 0,
    }));
    const rows = [
      ["Date", "Branch", "", "Reels/Posts Published", "Total Views "],
      [], ...snapshots.flatMap(s => [[(Date.parse(s.day) - Date.UTC(1899, 11, 30)) / 86400000, "RIS", "", 0, 0],
        ["", "RPS", "", 0, 0]]),
      ["Sept Week 4\n(21 Sep - 27 Sep)", "RIS", "", 0, 0],
      ["", "RPS", "", 0, 0],
      ["September 2026\nReport", "RIS", "", 0, 0],
    ];
    const targets = findTrackerTargets(rows, snapshots);
    expect(targets.filter(t => t.kind === "daily")).toHaveLength(7);
    expect(targets.find(t => t.kind === "weekly")).toMatchObject({ posts: 1, views: 120 });
    expect(targets.find(t => t.kind === "monthly")).toBeUndefined();
    expect(targets.every(t => rows[t.row - 1][1] === "RIS")).toBe(true);
    expect(writableFields(rows[4], targets[1])).toEqual([{ column: "D", value: 1 }, { column: "E", value: 120 }]);
  });

  it("never overwrites staff values or formulas", () => {
    const target = { row: 5, kind: "daily" as const, key: "2026-09-27", posts: 1, views: 200 };
    expect(writableFields(["", "RIS", "", 2, "=SUM(E1:E3)"], target)).toEqual([]);
  });

  it("rejects duplicate RIS dates instead of updating the wrong row", () => {
    expect(() => findTrackerTargets([
      ["Date", "Branch"], [], [46289, "RIS"], [46289, "RIS"],
    ], [{ day: "2026-09-24", posts: 0, views: 0 }])).toThrow(/Duplicate RIS/);
  });
});