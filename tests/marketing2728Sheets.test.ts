import { describe, expect, it } from "vitest";
import {
  parseCsv,
  parseDashboardRows,
  parseLeadRows,
  supplementLeadKey,
} from "../server/marketing2728Sheets";

describe("2027-28 supplementary Sheet parsing", () => {
  it("parses quoted CSV fields and embedded commas", () => {
    expect(parseCsv('"Name","Source"\n"Child, One","Meta"\n')).toEqual([
      ["Name", "Source"],
      ["Child, One", "Meta"],
    ]);
  });

  it("maps RIS headers without a Centre column", () => {
    const rows = [
      ["Date", "Time", "Parent's Name", "Child's Name", "Phone Number", "Alternate Number", "Program", "Status", "Remark", "Lead Owner", "Source"],
      ["4-Aug-26", "", "Parent", "Child", "98765 43210", "", "Nursery", "walkin completed", "", "Bhumika", "Google"],
    ];
    expect(parseLeadRows(rows)).toEqual([expect.objectContaining({
      enquiryDate: "2026-08-04",
      monthLabel: "Aug-26",
      childName: "Child",
      phone: "9876543210",
      status: "WALK-IN COMPLETED",
      source: "Google",
      leadOwner: "Bhumika",
      program: "Nursery",
    })]);
  });

  it("normalizes live status variants and excludes AY 2028-29 rows", () => {
    const headers = ["Date", "Child's Name", "Phone Number", "Program", "Status", "Lead Owner", "Source"];
    const rows = [
      headers,
      ["4-Aug-26", "One", "9876543210", "Nursery", "WALKIN COMPLETED", "Bhumika", "Google"],
      ["5-Aug-26", "Two", "9876543211", "Nursery", "WALKIN BOOKED", "Bhumika", "Google"],
      ["6-Aug-26", "Three", "9876543212", "Nursery", "AY 28-29", "Bhumika", "Google"],
      ["7-Aug-26", "Four", "9876543213", "Nursery", "OPEN", "Bhumika", "Google"],
    ];
    expect(parseLeadRows(rows).map(row => row.status)).toEqual([
      "WALK-IN COMPLETED",
      "WALK-IN BOOKED",
    ]);
  });

  it("maps RPS headers with Alternate Number and Centre columns", () => {
    const rows = [
      ["Date", "Time", "Parent's Name", "Child's Name", "Phone Number", "Alternate Number", "Program", "Centre", "Status", "Remark", "Lead Owner", "Source"],
      ["22-May-26", "", "Parent", "Child", "9824466635", "", "Playgroup", "Manpada", "OPEN", "", "Bhumika", "Meta"],
    ];
    expect(parseLeadRows(rows)[0]).toEqual(expect.objectContaining({
      monthLabel: "May-26",
      status: "OPEN",
      source: "Meta",
      program: "Playgroup",
    }));
  });

  it("ignores blank, total, and malformed dashboard rows", () => {
    const rows = [
      ["Date", "Total Leads", "Closed", "Open", "Bookings", "Walk-ins", "Admissions"],
      ["August 2026", "20", "1", "0", "19", "5", "2"],
      ["1", "", "", "", "", "", ""],
      ["", "20", "1", "", "", "", ""],
      ["Not a month", "99", "", "", "", "", ""],
    ];
    expect(parseDashboardRows(rows)).toEqual([{
      month: "Aug-26",
      leads: 20,
      closed: 1,
      open: 0,
      bookings: 19,
      walkins: 5,
      admissions: 2,
    }]);
  });

  it("finds dashboard headers after title and blank rows returned by authenticated access", () => {
    const rows = [
      ["DM RPS LEAD TO ADMISSION WEEKLY UPDATE FOR AY 27-28"],
      [],
      ["Date", "Total Leads", "Closed", "Open", "Bookings", "Walk-ins", "Admissions"],
      ["July 2026", "15", "0", "13", "2", "1", "0"],
    ];
    expect(parseDashboardRows(rows)).toEqual([{
      month: "Jul-26",
      leads: 15,
      closed: 0,
      open: 13,
      bookings: 2,
      walkins: 1,
      admissions: 0,
    }]);
  });

  it("accepts alternate dashboard metric labels", () => {
    const rows = [
      ["Month", "Total Enquiries", "Total Closed", "Total Open", "Walk-in Booked", "Walk-in Done", "Admission Done"],
      ["September 2026", "3", "0", "1", "2", "0", "0"],
    ];
    expect(parseDashboardRows(rows)[0]).toEqual({
      month: "Sep-26",
      leads: 3,
      closed: 0,
      open: 1,
      bookings: 2,
      walkins: 0,
      admissions: 0,
    });
  });

  it("stops dashboard parsing at the AY 2028-29 boundary", () => {
    const rows = [
      ["Date", "Total Leads", "Closed", "Open", "Bookings", "Walk-ins", "Admissions"],
      ["August 2026", "20", "1", "0", "19", "5", "2"],
      ["AY 28-29", "", "", "", "", "", ""],
      ["September 2026", "99", "0", "99", "0", "0", "0"],
    ];
    expect(parseDashboardRows(rows).map(row => row.month)).toEqual(["Aug-26"]);
  });

  it("does not accept summary months beyond the workbook's 12-month cycle", () => {
    const rows = [
      ["Date", "Total Leads", "Closed", "Open", "Bookings", "Walk-ins", "Admissions"],
      ["May 2026", "4", "0", "4", "0", "0", "0"],
      ["April 2027", "5", "0", "5", "0", "0", "0"],
      ["May 2027", "100", "0", "100", "0", "0", "0"],
    ];
    expect(parseDashboardRows(rows).map(row => row.month)).toEqual(["May-26", "Apr-27"]);
  });

  it("uses normalized date, phone, and child name for deduplication", () => {
    expect(supplementLeadKey({
      enquiryDate: "2026-08-04",
      phone: "+91 98765-43210",
      childName: "  Anika   Gupta ",
    })).toBe("2026-08-04|9876543210|anika gupta");
  });
});