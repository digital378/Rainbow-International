import { describe, expect, it } from "vitest";
import {
  mergeLeadAndWalkinRows,
  parseLeadRows,
  parseWalkinRows,
  type SupplementLead,
} from "./marketing2728Sheets";

const crm = (overrides: Partial<SupplementLead> = {}): SupplementLead => ({
  sourceLocations: ["CRM Leads Tracker row 2"],
  enquiryDate: "2027-06-10",
  monthLabel: "Jun-27",
  parentName: "",
  childName: "Aarav Sharma",
  phone: "9876543210",
  branchName: "Central",
  walkInDate: null,
  status: "DM ENQUIRY",
  source: "Instagram",
  leadOwner: "Counsellor",
  program: "Grade 1",
  ...overrides,
});


const walkin = (overrides: Partial<SupplementLead> = {}): SupplementLead => ({
  sourceLocations: ["WALKINs row 2"],
  enquiryDate: "2027-06-20",
  monthLabel: "Jun-27",
  parentName: "Parent Sharma",
  childName: "Aarav-Sharma",
  phone: "9876543210",
  branchName: "Central",
  walkInDate: "2027-06-20",
  status: "WALK-IN COMPLETED",
  source: "Walk-in",
  leadOwner: "Visit Owner",
  program: "Grade 1",
  leadId: "crm-linked-id",
  remark: "Follow up next month",
  misCallingRemarks: "Called after visit",
  closeReason: "Not applicable",
  ...overrides,
});

describe("unified marketing lead view fixtures", () => {
  it("merges an exact person across different enquiry dates and keeps CRM source/date", () => {
    const [merged] = mergeLeadAndWalkinRows([crm()], [walkin()]);

    expect(merged).toMatchObject({
      enquiryDate: "2027-06-10",
      monthLabel: "Jun-27",
      source: "Instagram",
      status: "WALK-IN COMPLETED",
      walkInDate: "2027-06-20",
      branchName: "Central",
      leadId: "crm-linked-id",
      remark: "Follow up next month",
      misCallingRemarks: "Called after visit",
      closeReason: "Not applicable",
    });
    expect(merged.sourceLocations).toEqual(["CRM Leads Tracker row 2", "WALKINs row 2"]);
  });

  it("does not merge ambiguous siblings or rows matching only by phone", () => {
    const twoSameChildLeads = [
      crm({ enquiryDate: "2027-06-10" }),
      crm({ enquiryDate: "2027-06-11", sourceLocations: ["CRM Leads Tracker row 3"] }),
    ];
    const oneVisit = walkin();
    const ambiguous = mergeLeadAndWalkinRows(twoSameChildLeads, [oneVisit]);
    expect(ambiguous).toHaveLength(3);
    expect(ambiguous.every(row => row.matchNeedsReview)).toBe(true);

    const differentChildVisit = walkin({ childName: "Mira Sharma" });
    const phoneOnly = mergeLeadAndWalkinRows([crm()], [differentChildVisit]);
    expect(phoneOnly).toHaveLength(2);
    expect(phoneOnly[0].sourceLocations).toEqual(["CRM Leads Tracker row 2"]);
    expect(phoneOnly.every(row => !row.matchNeedsReview)).toBe(true);
  });

  it("keeps a later OPEN visit row as the completed-visit record", () => {
    const [merged] = mergeLeadAndWalkinRows(
      [crm()],
      [walkin({ status: "OPEN", remark: "Visit done; revisit pending" })],
    );
    expect(merged.status).toBe("OPEN");
    expect(merged.remark).toBe("Visit done; revisit pending");
    expect(merged.enquiryDate).toBe("2027-06-10");
  });

  it("parses first Lead ID and WALKINs remarks and operational fields", () => {
    const rows = parseWalkinRows([
      ["Date", "Student Name", "Father Contact", "Status", "Follow up Remarks", "MIS Calling Remarks", "Close Reason", "Lead ID", "Lead ID"],
      ["20/06/2027", "Aarav Sharma", "9876543210", "OPEN", "Revisit pending", "Called", "Fees", "first-id", "second-id"],
    ]);
    expect(rows[0]).toMatchObject({
      leadId: "first-id",
      remark: "Revisit pending",
      misCallingRemarks: "Called",
      closeReason: "Fees",
    });
  });

  it("parses the DM enquiry as CRM-sourced separately from the visit status", () => {
    const rows = parseLeadRows([
      ["Date", "Child Name", "Phone", "Status", "Source"],
      ["10/06/2027", "Aarav Sharma", "9876543210", "OPEN", "Instagram"],
    ]);
    expect(rows[0]).toMatchObject({
      enquiryDate: "2027-06-10",
      source: "Instagram",
      status: "OPEN",
    });
  });
});
