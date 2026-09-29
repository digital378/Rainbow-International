import { describe, expect, it } from "vitest";
import { findManagedRow, resolveManagedSheetLayout } from "./walkinSheetLayout";

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
});