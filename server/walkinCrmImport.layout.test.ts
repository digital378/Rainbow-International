import { describe, expect, it } from "vitest";
import { findManagedRow, findUnlinkedVisitRow, resolveManagedSheetLayout } from "./walkinSheetLayout";

const expected = ["Student Name", "Status", "Follow up Remarks", "Lead ID", "Actual Admission Date"];
const header = ["Student Name", "Sub Source", "Status", "Remark", "Lead ID", "Lead ID"];

describe("existing WALKINs layout safety", () => {
  it("maps known fields while preserving historical extra columns", () => {
    const rows = [header, ["Old student", "staff entry", "OPEN", "staff note", "", ""]];
    const layout = resolveManagedSheetLayout(rows, expected);
    expect(layout.leadIdIndex).toBe(4);
    expect(layout.protectedIndices).toEqual([1, 5]);
    expect(layout.project(["New student", "CLOSED", "CRM note", "crm-123", ""])).toEqual([
      "New student", "", "CLOSED", "CRM note", "crm-123", "",
    ]);
    expect(findManagedRow(rows, layout.leadIdIndex, "crm-123")).toBe(-1);
  });

  it("refuses occupied duplicate ID columns and headerless data", () => {
    expect(() => resolveManagedSheetLayout([header, ["Old", "", "", "", "", "unknown-id"]], expected))
      .toThrow(/repeated Lead ID/);
    expect(() => resolveManagedSheetLayout([header, ["Old", "", "", "", "", "", "other"]], expected))
      .toThrow(/data beyond its headers/);
  });

  it("refuses ambiguous identities or missing managed columns", () => {
    expect(() => findManagedRow([
      header, ["A", "", "", "", "crm-123"], ["B", "", "", "", "crm-123"],
    ], 4, "crm-123")).toThrow(/Duplicate Lead ID/);
    expect(() => resolveManagedSheetLayout([header, ["A", "", "", "", "crm-123"], ["B", "", "", "", "crm-123"]], expected))
      .toThrow(/duplicate Lead IDs/);
    expect(() => resolveManagedSheetLayout([header.filter(name => name !== "Status")], expected))
      .toThrow(/missing "status"/);
  });

  it("finds only a uniquely matching visit with an empty primary Lead ID", () => {
    const visitHeader = [
      "Student Name", "Father Contact", "Status", "Follow up Remarks",
      "Lead ID", "Lead ID", "Staff Extra",
    ];
    const layout = resolveManagedSheetLayout([visitHeader], expected);
    const unique = [
      visitHeader,
      ["Aarav Sharma", "9876543210", "WALK-IN COMPLETED", "staff note", "", "", "keep"],
    ];
    expect(findUnlinkedVisitRow(unique, layout, "Aarav-Sharma", "+91 9876543210", "RIS")).toBe(1);
    expect(() => findUnlinkedVisitRow([
      ...unique,
      ["Aarav Sharma", "9876543210", "WALK-IN COMPLETED", "another visit", "", "", "also keep"],
    ], layout, "Aarav Sharma", "9876543210", "RIS")).toThrow(/Multiple WALKINs rows match/);
    expect(() => findUnlinkedVisitRow([
      visitHeader,
      ["Aarav Sharma", "9876543210", "WALK-IN COMPLETED", "staff note", "already-linked", "", "keep"],
    ], layout, "Aarav Sharma", "9876543210", "RIS")).toThrow(/already linked to another Lead ID/);
  });
});