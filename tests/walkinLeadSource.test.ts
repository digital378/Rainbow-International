import { describe, expect, it } from "vitest";
import { normalizeWalkinLeadSource } from "../shared/walkinLeadSource";
import { aggregateCrmRows } from "../server/walkinSheets";

describe("walk-in digital marketing source", () => {
  it.each(["Google", "GOOGLE", "Meta", "META", "Digital Marketing", "google digital marketing", "Google Ads", "Meta Ads", "dm"])(
    "groups %s under DM",
    value => expect(normalizeWalkinLeadSource(value)).toBe("DM"),
  );

  it("leaves other sources separate", () => {
    expect(normalizeWalkinLeadSource(" Referral ")).toBe("Referral");
    expect(normalizeWalkinLeadSource("DW")).toBe("DW");
  });

  it("combines historical tracker source totals without modifying its rows", () => {
    const row = (source: string) => {
      const cells = Array(13).fill("");
      cells[0] = "01/07/2027";
      cells[7] = "OPEN";
      cells[10] = source;
      return cells;
    };
    const rows = [row("Google"), row("META"), row("Digital marketing"), row("DM"), row("Referral")];
    const result = aggregateCrmRows(rows);
    expect(result.bySource).toEqual([
      { source: "DM", cnt: 4 },
      { source: "Referral", cnt: 1 },
    ]);
    expect(rows[0][10]).toBe("Google");
  });
});