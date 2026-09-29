import { createHash } from "node:crypto";
import { google } from "googleapis";
import { and, eq } from "drizzle-orm";
import { db } from "./db";
import { getGoogleRefreshToken } from "./googleCredentials";
import { parseWalkinRows, type SupplementLead } from "./marketing2728Sheets";
import { fencedWalkinSheetWrite, runWalkinSheetOperation } from "./walkinSyncCoordinator";
import { persistSyncSnapshot, syncValuesFromSheetRow } from "./walkinSheets";
import { walkinLeadAuditLog, walkinLeads, type WalkinLead } from "@shared/schema";
import { normalizeWalkinLeadSource } from "@shared/walkinLeadSource";

type Brand = "RIS" | "RPS";

const childKey = (value: string) => value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
  .toLowerCase().replace(/[^a-z0-9]+/g, "");
const phoneKey = (value: string) => value.replace(/\D/g, "").slice(-10);
const headerKey = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "");

export class VisitLinkError extends Error {
  constructor(message: string, public status = 409) { super(message); }
}

export function visitFingerprint(brand: Brand, visit: SupplementLead): string {
  return createHash("sha256").update(JSON.stringify([
    brand, visit.sourceLocations?.[0], visit.enquiryDate, visit.parentName,
    visit.childName, visit.phone, visit.branchName, visit.program,
    visit.source, visit.status, visit.leadOwner, visit.walkInDate,
    visit.leadId, visit.remark, visit.closeReason, visit.misCallingRemarks,
  ])).digest("hex");
}

/** Require a single identifiable child, not merely a unique parent phone. */
export function selectUnlinkedVisit(rows: string[][], brand: Brand, rowNumber: number, fingerprint: string) {
  const headerIndex = rows.findIndex(row => row.some(cell => ["date", "enquirydate"].includes(headerKey(cell))));
  if (headerIndex < 0 || rowNumber <= headerIndex + 1 || rowNumber > rows.length) {
    throw new VisitLinkError("Visit row moved or is no longer available. Refresh the list.");
  }
  const header = rows[headerIndex];
  const idColumns = header.flatMap((name, index) => headerKey(name) === "leadid" ? [index] : []);
  if (!idColumns.length) throw new VisitLinkError("The visit has no Lead ID column. No link was written.");
  const yearColumn = header.findIndex(name => headerKey(name) === "academicyear");
  const sheetYear = yearColumn >= 0 ? String(rows[rowNumber - 1]?.[yearColumn] ?? "").trim() : "";
  if (sheetYear && !/^2027\s*[-/]\s*(?:28|2028)$/.test(sheetYear)) {
    throw new VisitLinkError("This visit belongs to a different academic year. No link was written.");
  }
  if (rows.slice(headerIndex + 1).some(row =>
    idColumns.slice(1).some(index => String(row[index] ?? "").trim()))) {
    throw new VisitLinkError("A repeated Lead ID column contains values. Review the sheet before linking.");
  }
  const visits = parseWalkinRows(rows);
  const visit = visits.find(item => item.sourceLocations?.[0] === `WALKINs row ${rowNumber}`);
  if (!visit || visitFingerprint(brand, visit) !== fingerprint) {
    throw new VisitLinkError("This visit changed since you loaded it. Refresh and review it again.");
  }
  if (!childKey(visit.childName) || !/^\d{10}$/.test(phoneKey(visit.phone))) {
    throw new VisitLinkError("A child name and valid phone are needed before linking.");
  }
  if (visits.filter(item =>
    childKey(item.childName) === childKey(visit.childName) && phoneKey(item.phone) === phoneKey(visit.phone)
  ).length !== 1) {
    throw new VisitLinkError("More than one visit matches this child and phone. Review the rows before linking.");
  }
  if (idColumns.some(index => String(rows[rowNumber - 1]?.[index] ?? "").trim())) {
    throw new VisitLinkError("This visit already contains a Lead ID. Refresh and review its identity.");
  }
  return { visit, header, idColumn: idColumns[0], row: rows[rowNumber - 1] ?? [] };
}

function columnLetter(index: number): string {
  let value = index + 1;
  let letters = "";
  while (value > 0) {
    value--;
    letters = String.fromCharCode(65 + (value % 26)) + letters;
    value = Math.floor(value / 26);
  }
  return letters;
}

export async function linkVisitForEditing(brand: Brand, rowNumber: number, fingerprint: string): Promise<WalkinLead> {
  return runWalkinSheetOperation(`link ${brand} visit`, async () => {
    const spreadsheetId = process.env[brand === "RIS" ? "RIS_WALKIN_SHEET_ID_2728" : "RPS_WALKIN_SHEET_ID_2728"];
    const refreshToken = getGoogleRefreshToken();
    if (!spreadsheetId || !refreshToken || !process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      throw new VisitLinkError("Authenticated visit linking is unavailable. No link was written.", 503);
    }
    const auth = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
    auth.setCredentials({ refresh_token: refreshToken });
    const sheets = google.sheets({ version: "v4", auth });
    const readRows = async () => (await sheets.spreadsheets.values.get({
      spreadsheetId, range: "'WALKINs'!A:AZ",
    })).data.values as string[][] ?? [];

    const initialRows = await readRows();
    const initial = selectUnlinkedVisit(initialRows, brand, rowNumber, fingerprint);
    // Read again immediately before linking: a staff edit or row insertion must not
    // cause an ID to be attached to a different child's visit.
    const freshRows = await readRows();
    const fresh = selectUnlinkedVisit(freshRows, brand, rowNumber, fingerprint);
    if (JSON.stringify(initial.header) !== JSON.stringify(fresh.header)
      || JSON.stringify(initial.row) !== JSON.stringify(fresh.row)) {
      throw new VisitLinkError("This visit changed while linking. Refresh and try again.");
    }

    const { visit, header, row, idColumn } = fresh;
    const candidates = await db.select().from(walkinLeads)
      .where(and(eq(walkinLeads.brand, brand), eq(walkinLeads.academicYear, "2027-28")));
    const matches = candidates.filter(lead =>
      childKey(lead.childName) === childKey(visit.childName)
      && phoneKey(lead.phone) === phoneKey(visit.phone));
    if (matches.length > 1) throw new VisitLinkError("Several lead records match this child. Review them before linking.");
    const existing = matches[0];
    if (existing?.isArchived) throw new VisitLinkError("The matching lead is archived. Review it before linking.");
    if (existing && normalizeWalkinLeadSource(existing.source) !== normalizeWalkinLeadSource(visit.source || "Unknown")) {
      throw new VisitLinkError("This child's lead has a different source. Review it before linking.");
    }
    if (existing && freshRows.some((otherRow, index) =>
      index !== rowNumber - 1 && String(otherRow[idColumn] ?? "").trim() === existing.id)) {
      throw new VisitLinkError("The matching lead is already linked to another visit. Review both rows.");
    }
    const sheetValues = syncValuesFromSheetRow(
      header, row, header.some(name => headerKey(name) === "actualadmissiondate"),
    );
    const updateFromVisit = {
      parentName: visit.parentName || "",
      childName: visit.childName,
      program: visit.program || "Unknown",
      status: visit.status || "OPEN",
      walkInDate: visit.walkInDate,
      admissionDate: sheetValues.admissionDate,
      revisitDate: sheetValues.revisitDate,
      revisitDate2: sheetValues.revisitDate2,
      remark: visit.remark || null,
      closeReason: visit.closeReason || null,
      leadOwner: visit.leadOwner || null,
      misCallingRemarks: visit.misCallingRemarks || null,
    };
    let lead: WalkinLead;
    if (existing) {
      lead = existing;
    } else {
      [lead] = await db.insert(walkinLeads).values({
        brand, academicYear: "2027-28", enquiryDate: visit.enquiryDate,
        monthLabel: visit.monthLabel,
        phone: visit.phone, source: normalizeWalkinLeadSource(visit.source || "Unknown"),
        createdBy: "sheet-walkin", ...updateFromVisit,
      }).returning();
    }

    const beforeWriteRows = await readRows();
    const beforeWrite = selectUnlinkedVisit(beforeWriteRows, brand, rowNumber, fingerprint);
    if (JSON.stringify(beforeWrite.header) !== JSON.stringify(header)
      || JSON.stringify(beforeWrite.row) !== JSON.stringify(row)) {
      throw new VisitLinkError("This visit changed while linking. Refresh and try again.");
    }
    await fencedWalkinSheetWrite(`link ${brand} visit row ${rowNumber}`, () =>
      sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `'WALKINs'!${columnLetter(idColumn)}${rowNumber}`,
        valueInputOption: "RAW",
        requestBody: { values: [[lead.id]] },
      }));
    if (existing) {
      const [updated] = await db.update(walkinLeads)
        .set({ ...updateFromVisit, updatedAt: new Date() })
        .where(and(eq(walkinLeads.id, existing.id), eq(walkinLeads.updatedAt, existing.updatedAt)))
        .returning();
      if (!updated) throw new VisitLinkError("The visit was linked, but the lead changed during linking. Refresh and review it.");
      const changed = Object.entries(updateFromVisit).flatMap(([field, value]) => {
        const old = existing[field as keyof WalkinLead];
        return (old ?? null) === (value ?? null) ? [] : [{
          leadId: lead.id, field, oldValue: old == null ? null : String(old),
          newValue: value == null ? null : String(value), changedBy: "leads-admin",
        }];
      });
      if (changed.length) await db.insert(walkinLeadAuditLog).values(changed);
      lead = updated;
    }
    await persistSyncSnapshot(brand, lead.id, {
      ...sheetValues,
    });
    await db.insert(walkinLeadAuditLog).values({
      leadId: lead.id, field: "visit_linked", oldValue: null,
      newValue: `${brand} WALKINs row ${rowNumber}`, changedBy: "leads-admin",
    });
    return lead;
  });
}