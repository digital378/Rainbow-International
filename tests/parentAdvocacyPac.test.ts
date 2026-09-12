import { describe, expect, it } from "vitest";
import {
  matchesParentAdvocacyFilters,
  parseParentAdvocacySheet,
} from "../shared/parentAdvocacyPac";

const baseHeaders = [
  "Sr No",
  "Student Name",
  "Branch",
  "Referring Parent's Ward - Class",
  "Name of the Parent",
  "Name of the Mother",
  "Contact Number",
  "Ambassador Status",
  "Referred Family Name",
  "Grade Applying For",
  "Status",
  "Date Referred",
  "Last Update Date",
  "Referral Amount",
];

describe("parseParentAdvocacySheet", () => {
  it("treats the legacy Ambassador Meeting column as PAC 1", () => {
    const result = parseParentAdvocacySheet([
      [...baseHeaders, "Ambassador Meeting"],
      ["1", "Student A", "Branch A", "Class 1", "Parent A", "", "111", "Accepted", "", "", "", "", "", "", "First Parent Ambassador Circle Meeting Done on 6th September 2026"],
      ["2", "Student B", "Branch B", "Class 2", "Parent B", "", "222", "Rejected", "", "", "", "", "", "", ""],
    ]);

    expect(result.pacMeetings).toEqual([
      { key: "PAC 1", label: "PAC 1", date: "6 September 2026", attendedCount: 1 },
    ]);
    expect(result.parentAdvocacy[0].pacAttendance["PAC 1"]).toBe("6 September 2026");
    expect(result.parentAdvocacy[1].pacAttendance["PAC 1"]).toBe("");
  });

  it("discovers numbered PAC columns without shifting other fields", () => {
    const headers = [
      ...baseHeaders.slice(0, 8),
      "PAC 1",
      "PAC 2 - October",
      ...baseHeaders.slice(8),
      "Ambassador Meeting",
    ];
    const result = parseParentAdvocacySheet([
      headers,
      ["1", "Student A", "Branch A", "Class 1", "Parent A", "Mother A", "111", "Accepted", "06/09/2026", "", "Family A", "Grade 1", "Enquired", "7 Sep", "8 Sep", "1000", "legacy text"],
      ["2", "Student B", "Branch B", "Class 2", "Parent B", "Mother B", "222", "Accepted", "", "10/10/2026", "Family B", "Grade 2", "", "", "", "", ""],
    ]);

    expect(result.pacMeetings.map(meeting => meeting.key)).toEqual(["PAC 1", "PAC 2"]);
    expect(result.pacMeetings.map(meeting => meeting.attendedCount)).toEqual([1, 1]);
    expect(result.parentAdvocacy[0]).toMatchObject({
      referringParent: "Student A",
      partnerStatus: "Accepted",
      referredFamily: "Family A",
      status: "Enquired",
    });
  });
});

describe("matchesParentAdvocacyFilters", () => {
  const [attended, absent] = parseParentAdvocacySheet([
    [...baseHeaders, "PAC 1"],
    ["1", "Student A", "A", "Class 1", "Parent A", "", "111", "Accepted", "", "", "", "", "", "", "6 September 2026"],
    ["2", "Student B", "B", "Class 2", "Parent B", "", "222", "Accepted", "", "", "", "", "", "", ""],
  ]).parentAdvocacy;

  it("distinguishes attended dates from blank attendance", () => {
    expect(matchesParentAdvocacyFilters(attended, { pacKey: "PAC 1", pacAttendance: "Attended" })).toBe(true);
    expect(matchesParentAdvocacyFilters(absent, { pacKey: "PAC 1", pacAttendance: "Attended" })).toBe(false);
    expect(matchesParentAdvocacyFilters(absent, { pacKey: "PAC 1", pacAttendance: "Not attended" })).toBe(true);
    expect(matchesParentAdvocacyFilters(attended, { branch: "A" })).toBe(true);
    expect(matchesParentAdvocacyFilters(attended, { branch: "B" })).toBe(false);
  });
});