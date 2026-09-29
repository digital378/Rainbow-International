import { createHash } from "node:crypto";
import { and, eq, sql } from "drizzle-orm";
import { readMarketing2728Supplement, supplementLeadKey, type SupplementLead } from "./marketing2728Sheets";
import { db } from "./db";
import { walkinBranches, walkinLeadAuditLog, walkinLeads, walkinSyncReconciliations } from "../shared/schema";

type Brand = "RIS" | "RPS";
type ImportIssue = { brand: string; reason: string; reference: string; sourceLocations?: string[] };
type PreviewResult = {
  eligible: number;
  alreadyPresent: number;
  review: number;
  sourceReady: boolean;
  byBrand: { RIS: number; RPS: number };
  issues: ImportIssue[];
};
type ApplyResult = { imported: number; importedIds: string[]; skipped: number; review: number; issues: ImportIssue[] };
type SourceRow = SupplementLead & { brand: Brand; conflicts: string[] };

const BRANDS: Brand[] = ["RIS", "RPS"];
const ALLOWED_STATUSES = new Set([
  "OPEN", "FOLLOW-UP", "WALK-IN BOOKED", "WALK-IN COMPLETED", "ADMISSION DONE", "CLOSED",
  "TRANSFERRED", "INTEGRATED", "NEXT YEAR", "NON WORKABLE", "WAITING LIST", "IN PROCESS",
]);

function maskedReference(brand: Brand, lead: SupplementLead): string {
  const digest = createHash("sha256").update(`${brand}|${supplementLeadKey(lead)}`).digest("hex");
  return `${brand}-${digest.slice(0, 10)}`;
}

function normalizeIdentity(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function normalizeStatus(value: string): string {
  return value.trim().toUpperCase()
    .replace(/^ADM DONE$/, "ADMISSION DONE")
    .replace(/^WALKIN BOOKED$/, "WALK-IN BOOKED")
    .replace(/^WALKIN COMPLETED$/, "WALK-IN COMPLETED");
}

function isIsoDate(value: string | null | undefined): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function possibleEditedIdentity(
  rows: Array<{ brand: string; enquiryDate: string; phone: string; childName: string }>,
  lead: SourceRow,
  phone: string,
): boolean {
  return rows.some(row => row.brand === lead.brand
    && row.enquiryDate === lead.enquiryDate
    && row.phone.replace(/\D/g, "").slice(-10) === phone
    && normalizeIdentity(row.childName) !== normalizeIdentity(lead.childName));
}

function mergedRows(brand: Brand, leads: SupplementLead[], walkins: SupplementLead[]): SourceRow[] {
  const rows = new Map<string, SourceRow>();
  for (const lead of [...leads, ...walkins]) {
    const key = supplementLeadKey(lead);
    // Do not let a partial identity inherit a missing child/phone by merging
    // it with a different tracker row; exact repeated records can still dedupe.
    const safeKey = lead.phone && lead.childName
      ? key
      : `partial|${createHash("sha256").update(JSON.stringify({ ...lead, sourceLocations: undefined })).digest("hex")}`;
    const previous = rows.get(safeKey);
    if (previous) {
      previous.sourceLocations = [...new Set([...(previous.sourceLocations ?? []), ...(lead.sourceLocations ?? [])])];
      if (previous.childName.trim() && lead.childName.trim()
        && normalizeIdentity(previous.childName) !== normalizeIdentity(lead.childName)) {
        previous.conflicts.push("conflicting child names");
      }
      if (previous.status.trim() && lead.status.trim()
        && normalizeStatus(previous.status) !== normalizeStatus(lead.status)) {
        previous.conflicts.push("conflicting statuses");
      }
      if (previous.branchName.trim() && lead.branchName.trim()
        && normalizeIdentity(previous.branchName) !== normalizeIdentity(lead.branchName)) {
        previous.conflicts.push("conflicting branches");
      }
      for (const [field, value] of Object.entries(lead)) {
        if (field === "sourceLocations") continue;
        if (["childName", "status", "branchName"].includes(field)
          && previous.conflicts.some(conflict => conflict.startsWith(`conflicting ${field === "childName" ? "child names" : field === "status" ? "statuses" : "branches"}`))) {
          continue;
        }
        if (value != null && !(typeof value === "string" && !value.trim())) {
          Object.assign(previous, { [field]: value });
        }
      }
    } else {
      rows.set(safeKey, { ...lead, brand, conflicts: [] });
    }
  }
  return [...rows.values()];
}

function branchFor(branches: Array<typeof walkinBranches.$inferSelect>, brand: Brand, branchName: string) {
  const identity = normalizeIdentity(branchName);
  if (!identity) return { branch: null, warning: "Branch is missing; imported without a branch" };
  const matches = branches.filter(branch => branch.brand === brand
    && [branch.name, branch.code].some(value => normalizeIdentity(value) === identity));
  if (matches.length !== 1) {
    return {
      branch: null,
      warning: matches.length
        ? "Branch matches more than one location; imported without a branch"
        : "Branch does not match a known location; imported without a branch",
    };
  }
  return { branch: matches[0], warning: "" };
}

function validateLead(lead: SourceRow, branches: Array<typeof walkinBranches.$inferSelect>) {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!isIsoDate(lead.enquiryDate)) errors.push("Enquiry date is invalid");
  const phone = lead.phone.replace(/\D/g, "");
  if (!/^\d{10}$/.test(phone)) errors.push("Phone number is missing or invalid");
  if (!lead.childName.trim()) errors.push("Child name is missing");
  const status = normalizeStatus(lead.status);
  if (status && !ALLOWED_STATUSES.has(status)) errors.push("Status is unrecognised");
  if (!status) warnings.push("Status is missing; imported without a status for staff review");
  if (lead.conflicts.length) errors.push(...lead.conflicts);
  if (status === "CLOSED") warnings.push("Closed lead has no close reason; imported without one");
  if (["WALK-IN BOOKED", "WALK-IN COMPLETED"].includes(status) && !isIsoDate(lead.walkInDate)) {
    warnings.push("Walk-in status has no valid walk-in date; imported without one");
  }
  if (lead.walkInDate && !isIsoDate(lead.walkInDate)
    && !["WALK-IN BOOKED", "WALK-IN COMPLETED"].includes(status)) {
    warnings.push("Walk-in date is invalid; imported without one");
  }
  const branchResult = lead.conflicts.includes("conflicting branches")
    ? { branch: null, warning: "Source rows disagree on branch; imported without a branch" }
    : branchFor(branches, lead.brand, lead.branchName);
  if (branchResult.warning) warnings.push(branchResult.warning);
  return {
    errors,
    warnings,
    branch: branchResult.branch,
    phone,
    status,
    walkInDate: isIsoDate(lead.walkInDate) ? lead.walkInDate : null,
  };
}

async function loadSource() {
  const results = await Promise.all(BRANDS.map(async brand => ({
    brand,
    result: await readMarketing2728Supplement(brand),
  })));
  const issues: ImportIssue[] = [];
  const rows: SourceRow[] = [];
  for (const { brand, result } of results) {
    if (!result.available) {
      issues.push({ brand, reason: "CRM source is unavailable", reference: `${brand}-source` });
      continue;
    }
    rows.push(...mergedRows(brand, result.leads, result.walkins ?? []));
  }
  return { results, rows, issues };
}

async function calculatePreview(sourceOverride?: Awaited<ReturnType<typeof loadSource>>): Promise<PreviewResult> {
  const source = sourceOverride ?? await loadSource();
  const [existing, branches] = await Promise.all([
    db.select({
      id: walkinLeads.id,
      brand: walkinLeads.brand,
      enquiryDate: walkinLeads.enquiryDate,
      phone: walkinLeads.phone,
      childName: walkinLeads.childName,
    }).from(walkinLeads).where(eq(walkinLeads.academicYear, "2027-28")),
    db.select().from(walkinBranches),
  ]);
  const existingKeys = new Set(existing.map(row => `${row.brand}|${supplementLeadKey(row)}`));
  const existingIds = new Set(existing.map(row => row.id));
  const result: PreviewResult = {
    eligible: 0, alreadyPresent: 0, review: 0,
    sourceReady: source.results.every(({ result: item }) => item.available && item.mode === "oauth"),
    byBrand: { RIS: 0, RPS: 0 }, issues: [...source.issues],
  };
  for (const lead of source.rows) {
    const reference = maskedReference(lead.brand, lead);
    const key = `${lead.brand}|${supplementLeadKey(lead)}`;
    const deterministicId = `crm-${createHash("sha256").update(key).digest("hex")}`;
    const validation = validateLead(lead, branches);
    if (validation.errors.length) {
      result.review += 1;
      result.issues.push({ brand: lead.brand, reason: validation.errors.join("; "), reference, sourceLocations: lead.sourceLocations });
      continue;
    }
    if (existingIds.has(deterministicId) || existingKeys.has(key)) {
      result.alreadyPresent += 1;
      continue;
    }
    if (validation.phone && possibleEditedIdentity(existing, lead, validation.phone)) {
      result.review += 1;
      result.issues.push({
        brand: lead.brand,
        reason: "A lead with the same date and phone but a different child name already exists; identity needs manual review",
        reference,
        sourceLocations: lead.sourceLocations,
      });
      continue;
    }
    if (validation.warnings.length) {
      result.issues.push({
        brand: lead.brand,
        reason: `Warning: ${validation.warnings.join("; ")}`,
        reference,
        sourceLocations: lead.sourceLocations,
      });
    }
    result.eligible += 1;
    result.byBrand[lead.brand] += 1;
  }
  return result;
}

export async function previewCrmImport(): Promise<PreviewResult> {
  return calculatePreview();
}

export async function applyCrmImport(): Promise<ApplyResult> {
  const result: ApplyResult = { imported: 0, importedIds: [], skipped: 0, review: 0, issues: [] };
  try {
    await db.transaction(async tx => {
      await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended('walkin-crm-historical-import-2027-28', 0))`);
      const brandsToMirror = new Set<Brand>();
      const source = await loadSource();
      const publicBrands = source.results.filter(({ result: item }) => item.available && item.mode !== "oauth");
      if (source.issues.length || publicBrands.length) {
        result.review = source.issues.length;
        result.issues = [...source.issues];
        for (const { brand } of publicBrands) {
          result.issues.push({
            brand,
            reason: "Apply requires authenticated, complete CRM source data; read-only CSV fallback is not safe for import",
            reference: `${brand}-source`,
          });
          result.review += 1;
        }
        return;
      }

      const [existing, branches] = await Promise.all([
        tx.select({
          id: walkinLeads.id,
          brand: walkinLeads.brand,
          enquiryDate: walkinLeads.enquiryDate,
          phone: walkinLeads.phone,
          childName: walkinLeads.childName,
        }).from(walkinLeads).where(eq(walkinLeads.academicYear, "2027-28")),
        tx.select().from(walkinBranches),
      ]);
      const existingKeys = new Set(existing.map(row => `${row.brand}|${supplementLeadKey(row)}`));
      const existingIds = new Set(existing.map(row => row.id));
      for (const lead of source.rows) {
        const key = `${lead.brand}|${supplementLeadKey(lead)}`;
        const id = `crm-${createHash("sha256").update(key).digest("hex")}`;
        const reference = maskedReference(lead.brand, lead);
        const validation = validateLead(lead, branches);
        if (validation.errors.length) {
          result.review += 1;
          result.issues.push({ brand: lead.brand, reason: validation.errors.join("; "), reference, sourceLocations: lead.sourceLocations });
          continue;
        }
        if (existingIds.has(id) || existingKeys.has(key)) {
          result.skipped += 1;
          continue;
        }
        if (validation.phone && possibleEditedIdentity(existing, lead, validation.phone)) {
          result.review += 1;
          result.issues.push({
            brand: lead.brand,
            reason: "A lead with the same date and phone but a different child name already exists; identity needs manual review",
            reference,
            sourceLocations: lead.sourceLocations,
          });
          continue;
        }
        if (validation.warnings.length) {
          result.issues.push({
            brand: lead.brand,
            reason: `Warning: ${validation.warnings.join("; ")}`,
            reference,
            sourceLocations: lead.sourceLocations,
          });
        }
        // Use the same phone lock as interactive lead creation, then refetch
        // identity rows so a concurrent edit/create cannot race the import.
        await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${`walkin:2027-28:${validation.phone}`}, 0))`);
        const concurrentRows = await tx.select({
          id: walkinLeads.id,
          childName: walkinLeads.childName,
        })
          .from(walkinLeads)
          .where(and(
            eq(walkinLeads.academicYear, "2027-28"),
            eq(walkinLeads.brand, lead.brand),
            eq(walkinLeads.enquiryDate, lead.enquiryDate),
            eq(walkinLeads.phone, validation.phone),
          ));
        if (concurrentRows.some(row => normalizeIdentity(row.childName) === normalizeIdentity(lead.childName))) {
          result.skipped += 1;
          for (const row of concurrentRows) existingIds.add(row.id);
          existingKeys.add(key);
          continue;
        }
        if (concurrentRows.length) {
          result.review += 1;
          result.issues.push({
            brand: lead.brand,
            reason: "A lead with the same date and phone but a different child name already exists; identity needs manual review",
            reference,
            sourceLocations: lead.sourceLocations,
          });
          continue;
        }
        const seqName = lead.brand === "RIS" ? "walkin_ris_seq" : "walkin_rps_seq";
        const sequence = await tx.execute<{ brandSeqNum: string }>(
          sql`SELECT nextval(${seqName}) AS "brandSeqNum"`,
        );
        const brandSeqNum = Number(sequence.rows[0]?.brandSeqNum);
        if (!brandSeqNum) throw new Error(`Could not allocate ${lead.brand} lead sequence`);
        const timestamp = new Date(`${lead.enquiryDate}T00:00:00.000Z`);
        const [inserted] = await tx.insert(walkinLeads).values({
          id,
          brand: lead.brand,
          branchId: validation.branch?.id ?? null,
          academicYear: "2027-28",
          enquiryDate: lead.enquiryDate,
          monthLabel: lead.monthLabel,
          parentName: lead.parentName || "",
          motherName: null,
          childName: lead.childName.trim(),
          phone: validation.phone,
          altPhone: null,
          email: null,
          program: lead.program || "Unknown",
          source: lead.source || "Unknown",
          status: validation.status,
          closeReason: null,
          remark: null,
          leadOwner: lead.leadOwner || null,
          walkInDate: validation.walkInDate,
          admissionDate: null,
          revisitDate: null,
          revisitDate2: null,
          misCallingRemarks: null,
          brandSeqNum,
          isArchived: false,
          createdBy: "legacy-import",
          createdAt: timestamp,
          updatedAt: timestamp,
        }).returning();
        await tx.insert(walkinLeadAuditLog).values({
          leadId: id,
          field: "created",
          oldValue: null,
          newValue: JSON.stringify({ brand: lead.brand, provenance: "marketing-27-28-crm-tracker" }),
          changedBy: "legacy-import",
        });
        result.imported += 1;
        result.importedIds.push(inserted.id);
        brandsToMirror.add(lead.brand);
        existingIds.add(id);
        existingKeys.add(key);
      }
      if (brandsToMirror.size) {
        for (const scope of [...brandsToMirror, "MASTER" as const]) {
          await tx.insert(walkinSyncReconciliations)
            .values({ scope, updatedAt: new Date() })
            .onConflictDoUpdate({
              target: walkinSyncReconciliations.scope,
              set: { updatedAt: new Date() },
            });
        }
      }
    });
  } catch (error) {
    console.error("[walkin/import] Import transaction rolled back");
    throw new Error("Import transaction failed; no leads were imported", { cause: error });
  }
  return result;
}