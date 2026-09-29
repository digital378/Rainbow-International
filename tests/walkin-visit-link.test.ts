import { describe, expect, it } from "vitest";
import { parseWalkinRows } from "../server/marketing2728Sheets";
import { selectUnlinkedVisit, visitFingerprint } from "../server/walkinVisitLink";

const header = ["Date", "Student Name", "Father Contact", "Lead ID", "Lead ID", "Status", "Father Name"];
const siblingRows = [
  header,
  ["04/09/2027", "Sarthak Agarwal", "8879225512", "", "", "OPEN", "Parent"],
  ["04/09/2027", "Saanvi Agarwal", "8879225512", "", "", "OPEN", "Parent"],
];
const fingerprintAt = (rows: string[][], rowNumber: number) => {
  const visit = parseWalkinRows(rows).find(v => v.sourceLocations?.[0] === `WALKINs row ${rowNumber}`)!;
  return visitFingerprint("RIS", visit);
};

describe("single-visit linking", () => {
  it("keeps siblings with the same parent phone as separate linkable visits", () => {
    const first = selectUnlinkedVisit(siblingRows, "RIS", 2, fingerprintAt(siblingRows, 2));
    const second = selectUnlinkedVisit(siblingRows, "RIS", 3, fingerprintAt(siblingRows, 3));
    expect(first.visit.childName).toBe("Sarthak Agarwal");
    expect(second.visit.childName).toBe("Saanvi Agarwal");
    expect(first.idColumn).toBe(3);
  });

  it("refuses duplicate visits for the same child and phone", () => {
    const duplicate = [...siblingRows, [...siblingRows[1]]];
    expect(() => selectUnlinkedVisit(duplicate, "RIS", 2, fingerprintAt(duplicate, 2)))
      .toThrow(/More than one visit/);
  });

  it("refuses an occupied primary or repeated Lead ID cell", () => {
    const occupied = siblingRows.map(row => [...row]);
    occupied[1][3] = "another-lead";
    expect(() => selectUnlinkedVisit(occupied, "RIS", 2, fingerprintAt(occupied, 2)))
      .toThrow(/already contains a Lead ID/);
    occupied[1][3] = "";
    occupied[2][4] = "another-lead";
    expect(() => selectUnlinkedVisit(occupied, "RIS", 2, fingerprintAt(occupied, 2)))
      .toThrow(/repeated Lead ID/);
  });

  it("does not link a visit recorded for a different academic year", () => {
    const rows = [
      [...header, "Academic Year"],
      [...siblingRows[1], "2026-27"],
    ];
    expect(() => selectUnlinkedVisit(rows, "RIS", 2, fingerprintAt(rows, 2)))
      .toThrow(/different academic year/);
  });

  it("refuses a row that changed since the list loaded", () => {
    const fingerprint = fingerprintAt(siblingRows, 2);
    const changed = siblingRows.map(row => [...row]);
    changed[1][5] = "WAITING LIST";
    expect(() => selectUnlinkedVisit(changed, "RIS", 2, fingerprint))
      .toThrow(/changed since you loaded/);
  });
});