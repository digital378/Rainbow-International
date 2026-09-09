/**
 * AY 2027-28 Walk-in Admissions Capture System — API Routes
 *
 * Endpoints:
 *   GET  /api/walkin/lookups              — all lookup values (programs, sources, statuses, etc.)
 *   POST /api/walkin/leads                — create a lead (kiosk form)
 *   GET  /api/walkin/leads                — list / search leads (admin only)
 *   GET  /api/walkin/leads/export         — .xlsx export of filtered leads (admin only)
 *   GET  /api/walkin/leads/check-duplicate — check if phone already exists for brand+AY
 *   GET  /api/walkin/leads/:id            — get a single lead (admin only)
 *   PATCH /api/walkin/leads/:id           — update mutable fields (admin only)
 *   POST /api/walkin/leads/:id/archive    — soft-delete (admin only)
 *   GET  /api/walkin/leads/:id/history    — audit trail for a lead (admin only)
 *   GET  /api/walkin/branches             — list branches
 *   POST /api/walkin/branches             — create a branch (admin only)
 *   PATCH /api/walkin/branches/:id        — update a branch (admin only)
 *   POST /api/walkin/sheets/resync        — rewrite entire sheet from DB (admin only)
 *   GET  /api/walkin/sheets/status        — last-sync timestamp + lead counts (admin only)
 */

import { type Express, type Request, type Response, type NextFunction } from "express";
import { createHash, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { db } from "./db";
import {
  walkinLeads, walkinLeadAuditLog, walkinBranches,
  walkinPrograms, walkinSources, walkinStatuses, walkinCloseReasons, walkinStaff,
  type WalkinLead,
} from "@shared/schema";
import { normalizePhoneOrThrow } from "@shared/phoneNormalizer";
import { eq, and, gte, lte, ilike, desc, or, sql, isNull, ne } from "drizzle-orm";
import * as XLSX from "xlsx";
import { queueUpsert, queueRemove, resyncBrandToSheet, resyncMasterSheet, resyncArchivedLead, removeLeadFromMasterSheet, getSyncStatus, startAutoPull, getPullLog, pullChangesFromSheet, pullChangesFromMasterSheet, readCrmLeadsTrackerStats, bustCrmStatsCache, syncDeletionsFromMaster } from "./walkinSheets";
import { runWalkinSheetOperation } from "./walkinSyncCoordinator";
import { getGoogleCredentialSource } from "./googleCredentials";
import { readMarketing2728Supplement, supplementLeadKey } from "./marketing2728Sheets";

// ── Helpers ─────────────────────────────────────────────────────

function isAdmin(req: Express["request"]): boolean {
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) return false;
  const provided =
    (req.headers["x-api-key"] as string) ||
    (req.headers.authorization || "").replace(/^Bearer\s+/i, "") ||
    (typeof req.query.token === "string" ? req.query.token : "");
  if (!provided) return false;
  const padded = provided.padEnd(adminToken.length).slice(0, adminToken.length);
  try {
    return timingSafeEqual(Buffer.from(adminToken), Buffer.from(padded));
  } catch {
    return false;
  }
}

function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!isAdmin(req)) return res.status(401).json({ message: "Unauthorized" });
  next();
}

/**
 * Returns true if the request carries a valid token for the given brand.
 * Accepts either:
 *   - the master ADMIN_TOKEN (full access, any brand), OR
 *   - the brand-specific token (RIS_ADMIN_TOKEN / RPS_ADMIN_TOKEN) for
 *     read-only access scoped to that brand.
 *
 * Used by the Training Performance Platform to pull dashboard data via API.
 */
function isBrandAuthorized(req: Express["request"], brand: string): boolean {
  if (isAdmin(req)) return true; // master token always works
  const brandUpper = brand.toUpperCase();
  const envKey = brandUpper === "RIS" ? "RIS_ADMIN_TOKEN" : brandUpper === "RPS" ? "RPS_ADMIN_TOKEN" : null;
  if (!envKey) return false;
  const brandToken = process.env[envKey];
  if (!brandToken) return false;
  const provided =
    (req.headers["x-api-key"] as string) ||
    (req.headers.authorization || "").replace(/^Bearer\s+/i, "") ||
    (typeof req.query.token === "string" ? req.query.token : "");
  if (!provided) return false;
  const padded = provided.padEnd(brandToken.length).slice(0, brandToken.length);
  try {
    return timingSafeEqual(Buffer.from(brandToken), Buffer.from(padded));
  } catch {
    return false;
  }
}

/** Derive "Mon-YY" label from a YYYY-MM-DD date string, e.g. "2027-06-15" → "Jun-27" */
function deriveMonthLabel(dateStr: string): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const [yearStr, monthStr] = dateStr.split("-");
  const month = parseInt(monthStr, 10) - 1;
  const year = parseInt(yearStr, 10) % 100;
  return `${months[month]}-${String(year).padStart(2, "0")}`;
}

/** Write one audit log row */
async function writeAudit(
  leadId: string,
  field: string,
  oldValue: string | null | undefined,
  newValue: string | null | undefined,
  changedBy: string,
) {
  await db.insert(walkinLeadAuditLog).values({
    leadId,
    field,
    oldValue: oldValue ?? null,
    newValue: newValue ?? null,
    changedBy,
  });
}

// ── Zod Schemas ─────────────────────────────────────────────────

const createLeadSchema = z.object({
  brand: z.enum(["RIS", "RPS"]),
  branchId: z.number().int().positive().optional(),
  academicYear: z.string().default("2027-28"),
  enquiryDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "enquiryDate must be YYYY-MM-DD")
    .refine((d) => d <= new Date().toISOString().slice(0, 10), {
      message: "enquiryDate cannot be in the future",
    }),
  parentName: z.string().min(2, "Father name is required (min 2 characters)").trim(),
  motherName: z.string().min(2, "Mother name is required (min 2 characters)").trim(),
  childName: z.string().min(2, "Child name is required (min 2 characters)").trim(),
  phone: z.string().min(1, "Father contact is required"),
  altPhone: z.string().min(1, "Mother contact is required"),
  email: z
    .string()
    .email("Invalid email")
    .optional()
    .or(z.literal(""))
    .transform((v) => v || undefined),
  program: z.string().min(1, "Program is required"),
  source: z.string().min(1, "Source is required"),
  status: z.string().default("OPEN"),
  closeReason: z.string().optional(),
  remark: z.string().optional(),
  leadOwner: z.string().optional(),
  walkInDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .or(z.literal(""))
    .transform((v) => v || undefined),
  revisitDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .or(z.literal(""))
    .transform((v) => v || undefined),
  createdBy: z.string().default("kiosk"),
});

// Mutable fields only — brand, enquiryDate, createdBy are locked
const updateLeadSchema = z.object({
  parentName: z.string().min(2).trim().optional(),
  motherName: z.string().min(2).trim().optional(),
  childName: z.string().min(2).trim().optional(),
  altPhone: z.string().optional().or(z.literal("")).transform((v) => v || undefined),
  email: z
    .string()
    .email()
    .optional()
    .or(z.literal(""))
    .transform((v) => v || undefined),
  program: z.string().min(1).optional(),
  source: z.string().min(1).optional(),
  status: z.string().min(1).optional(),
  closeReason: z.string().optional().or(z.literal("")).transform((v) => v || undefined),
  remark: z.string().optional(),
  leadOwner: z.string().optional(),
  walkInDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .or(z.literal(""))
    .transform((v) => v || undefined),
  revisitDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .or(z.literal(""))
    .transform((v) => v || undefined),
  revisitDate2: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .or(z.literal(""))
    .transform((v) => v || undefined),
  branchId: z.number().int().positive().optional(),
  misCallingRemarks: z.string().optional(),
  updatedBy: z.string().default("admin"),
});

// ── Route Registration ───────────────────────────────────────────

export function registerWalkinRoutes(app: Express) {

  // ── GET /api/walkin/lookups ────────────────────────────────────
  // Returns lookup values for the kiosk form dropdowns.
  // ?brand=RIS|RPS   — filter brand-specific lookups
  // ?includeInactive — admin only; includes inactive items for the admin panel
  app.get("/api/walkin/lookups", async (req, res) => {
    try {
      const brand = typeof req.query.brand === "string" ? req.query.brand : null;
      const branchCode = typeof req.query.branchCode === "string" ? req.query.branchCode : null;
      const includeInactive = isAdmin(req) && req.query.includeInactive === "true";
      const activeFilter = includeInactive ? undefined : true;

      // When a branchCode is provided (kiosk QR scan), pre-fetch that branch's ID so
      // the staff dropdown only shows RAs assigned to that specific branch (plus unassigned RAs).
      let specificBranchId: number | null = null;
      if (branchCode && brand) {
        const [br] = await db.select({ id: walkinBranches.id })
          .from(walkinBranches)
          .where(and(eq(walkinBranches.code, branchCode), eq(walkinBranches.brand, brand)));
        specificBranchId = br?.id ?? null;
      }

      const [programs, sources, statuses_rows, closeReasons, staff, branches] = await Promise.all([
        db.select().from(walkinPrograms)
          .where(and(
            activeFilter != null ? eq(walkinPrograms.isActive, activeFilter) : undefined,
            brand ? or(eq(walkinPrograms.brand, brand), isNull(walkinPrograms.brand)) : undefined,
          ))
          .orderBy(walkinPrograms.sortOrder),
        db.select().from(walkinSources)
          .where(and(
            activeFilter != null ? eq(walkinSources.isActive, activeFilter) : undefined,
            brand ? or(eq(walkinSources.brand, brand), isNull(walkinSources.brand)) : undefined,
          ))
          .orderBy(walkinSources.sortOrder),
        db.select().from(walkinStatuses)
          .where(and(
            activeFilter != null ? eq(walkinStatuses.isActive, activeFilter) : undefined,
            brand ? or(eq(walkinStatuses.brand, brand), isNull(walkinStatuses.brand)) : undefined,
          ))
          .orderBy(walkinStatuses.sortOrder),
        db.select().from(walkinCloseReasons)
          .where(and(
            activeFilter != null ? eq(walkinCloseReasons.isActive, activeFilter) : undefined,
            brand ? or(eq(walkinCloseReasons.brand, brand), isNull(walkinCloseReasons.brand)) : undefined,
          ))
          .orderBy(walkinCloseReasons.sortOrder),
        db.select().from(walkinStaff)
          .where(and(
            activeFilter != null ? eq(walkinStaff.isActive, activeFilter) : undefined,
            // Branch filter: if a specific branch was scanned, show only that branch's staff
            // (or staff with no branch assignment — they float across all branches of the brand)
            specificBranchId != null
              ? or(eq(walkinStaff.branchId, specificBranchId), isNull(walkinStaff.branchId))
              : undefined,
            brand ? or(eq(walkinStaff.brand, brand), isNull(walkinStaff.brand)) : undefined,
          ))
          .orderBy(walkinStaff.sortOrder),
        db.select().from(walkinBranches)
          .where(and(
            activeFilter != null ? eq(walkinBranches.isActive, activeFilter) : undefined,
            brand ? eq(walkinBranches.brand, brand) : undefined,
          ))
          .orderBy(walkinBranches.name),
      ]);

      res.json({ programs, sources, statuses: statuses_rows, closeReasons, staff, branches });
    } catch (err: any) {
      console.error("[walkin/lookups]", err?.message);
      res.status(500).json({ message: "Failed to fetch lookups" });
    }
  });

  // ── GET /api/walkin/leads/check-duplicate ─────────────────────
  app.get("/api/walkin/leads/check-duplicate", async (req, res) => {
    try {
      const phone = typeof req.query.phone === "string" ? req.query.phone : "";
      const brand = typeof req.query.brand === "string" ? req.query.brand : "";
      const ay = typeof req.query.ay === "string" ? req.query.ay : "2027-28";

      if (!phone || !brand) {
        return res.status(400).json({ message: "phone and brand are required" });
      }

      const normResult = normalizePhoneOrThrow(phone);
      const [existing] = await db
        .select({
          id: walkinLeads.id,
          enquiryDate: walkinLeads.enquiryDate,
          program: walkinLeads.program,
          branchId: walkinLeads.branchId,
          status: walkinLeads.status,
        })
        .from(walkinLeads)
        .where(
          and(
            eq(walkinLeads.phone, normResult),
            eq(walkinLeads.brand, brand),
            eq(walkinLeads.academicYear, ay),
            eq(walkinLeads.isArchived, false),
          ),
        )
        .limit(1);

      if (existing) {
        return res.json({ duplicate: existing });
      }
      res.json({ duplicate: null });
    } catch (err: any) {
      res.status(400).json({ message: err.message || "Check failed" });
    }
  });

  // ── POST /api/walkin/leads ─────────────────────────────────────
  app.post("/api/walkin/leads", async (req, res) => {
    try {
      const parsed = createLeadSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }
      const data = parsed.data;

      // Normalize phone
      let phone: string;
      try {
        phone = normalizePhoneOrThrow(data.phone);
      } catch (e: any) {
        return res.status(400).json({ message: e.message });
      }

      // Normalize altPhone (now mandatory — store raw value if normalization fails)
      let altPhone: string = data.altPhone;
      try {
        altPhone = normalizePhoneOrThrow(data.altPhone);
      } catch {
        // non-fatal: store raw value so the lead isn't lost
      }

      // Derive monthLabel
      const monthLabel = deriveMonthLabel(data.enquiryDate);

      // Validate status-dependent fields
      if (data.status === "CLOSED" && !data.closeReason) {
        return res.status(400).json({ message: "closeReason is required when status is CLOSED" });
      }
      const walkinStatuses = ["WALK-IN BOOKED", "WALK-IN COMPLETED"];
      if (walkinStatuses.includes(data.status) && !data.walkInDate) {
        return res.status(400).json({ message: "walkInDate is required for walk-in statuses" });
      }

      // Check duplicate (non-blocking — just return info alongside the created lead)
      const [existingDuplicate] = await db
        .select({
          id: walkinLeads.id,
          enquiryDate: walkinLeads.enquiryDate,
          program: walkinLeads.program,
          status: walkinLeads.status,
        })
        .from(walkinLeads)
        .where(
          and(
            eq(walkinLeads.phone, phone),
            eq(walkinLeads.brand, data.brand),
            eq(walkinLeads.academicYear, data.academicYear),
            eq(walkinLeads.isArchived, false),
          ),
        )
        .limit(1);

      // Fetch the next per-brand sequence number before inserting
      const seqName = data.brand === "RIS" ? "walkin_ris_seq" : "walkin_rps_seq";
      const seqResult = await db.execute<{ brandSeqNum: string }>(
        sql`SELECT nextval(${seqName}) AS "brandSeqNum"`,
      );
      const brandSeqNum = Number(seqResult.rows[0]?.brandSeqNum);
      if (!brandSeqNum) throw new Error(`Failed to fetch next sequence value for ${seqName}`);

      // Insert lead
      const [lead] = await db
        .insert(walkinLeads)
        .values({
          brand: data.brand,
          branchId: data.branchId,
          academicYear: data.academicYear,
          enquiryDate: data.enquiryDate,
          monthLabel,
          parentName: data.parentName,
          motherName: data.motherName,
          childName: data.childName,
          phone,
          altPhone,
          email: data.email ? data.email.toLowerCase() : undefined,
          program: data.program,
          source: data.source,
          status: data.status,
          closeReason: data.closeReason,
          remark: data.remark,
          leadOwner: data.leadOwner,
          walkInDate: data.walkInDate,
          revisitDate: data.revisitDate,
          createdBy: data.createdBy,
          brandSeqNum: Number(brandSeqNum),
        })
        .returning();

      // Write audit row for creation
      await writeAudit(lead.id, "created", null, JSON.stringify({ brand: lead.brand, phone, program: lead.program }), data.createdBy);

      // Mirror to Google Sheets (fire-and-forget — never blocks the API response)
      queueUpsert(lead.brand as "RIS" | "RPS", lead);

      res.status(201).json({
        lead,
        duplicate: existingDuplicate ?? null,
      });
    } catch (err: any) {
      console.error("[walkin/leads POST]", err?.message);
      res.status(500).json({ message: "Failed to create lead" });
    }
  });

  // ── GET /api/walkin/leads ─────────────────────────────────────
  app.get("/api/walkin/leads", requireAdmin, async (req, res) => {
    try {
      const {
        brand, branchId, status, leadOwner, dateFrom, dateTo, phone: phoneQ,
        search, page = "1", pageSize = "50", includeArchived,
      } = req.query as Record<string, string>;

      const PAGE = Math.max(1, parseInt(page, 10));
      const SIZE = Math.min(200, Math.max(1, parseInt(pageSize, 10)));
      const OFFSET = (PAGE - 1) * SIZE;

      const conditions: any[] = [eq(walkinLeads.academicYear, "2027-28")];
      if (brand) conditions.push(eq(walkinLeads.brand, brand));
      if (branchId) conditions.push(eq(walkinLeads.branchId, parseInt(branchId, 10)));
      if (status) conditions.push(eq(walkinLeads.status, status));
      if (leadOwner) conditions.push(eq(walkinLeads.leadOwner, leadOwner));
      if (dateFrom) conditions.push(gte(walkinLeads.enquiryDate, dateFrom));
      if (dateTo) conditions.push(lte(walkinLeads.enquiryDate, dateTo));
      if (!includeArchived || includeArchived !== "true") {
        conditions.push(eq(walkinLeads.isArchived, false));
      }
      if (phoneQ) {
        try {
          const norm = normalizePhoneOrThrow(phoneQ);
          conditions.push(eq(walkinLeads.phone, norm));
        } catch {
          // raw search fallback
          conditions.push(ilike(walkinLeads.phone, `%${phoneQ}%`));
        }
      }
      if (search) {
        conditions.push(
          or(
            ilike(walkinLeads.parentName, `%${search}%`),
            ilike(walkinLeads.childName, `%${search}%`),
            ilike(walkinLeads.phone, `%${search}%`),
          ),
        );
      }

      const where = conditions.length ? and(...conditions) : undefined;

      const [databaseRows, allDatabaseIdentities] = await Promise.all([
        db.select().from(walkinLeads)
          .where(where)
          .orderBy(desc(walkinLeads.createdAt)),
        db.select({
          enquiryDate: walkinLeads.enquiryDate,
          phone: walkinLeads.phone,
          childName: walkinLeads.childName,
        }).from(walkinLeads).where(eq(walkinLeads.academicYear, "2027-28")),
      ]);

      // Marketing 27-28 overlays historical CRM tracker rows that have not
      // yet entered the database. Include those same rows here as read-only
      // records, while allowing any DB row (including an archived one) to win.
      const databaseKeys = new Set(allDatabaseIdentities.map(supplementLeadKey));
      const requestedBrands: Array<"RIS" | "RPS"> = brand === "RIS" || brand === "RPS"
        ? [brand]
        : ["RIS", "RPS"];
      const supplements = await Promise.all(
        requestedBrands.map(async supplementBrand => ({
          brand: supplementBrand,
          result: await readMarketing2728Supplement(supplementBrand),
        })),
      );

      const normalizedPhoneQuery = phoneQ?.replace(/\D/g, "").slice(-10);
      const searchLower = search?.trim().toLowerCase();
      const supplementalRows = supplements.flatMap(({ brand: supplementBrand, result }) =>
        result.leads
          .filter(lead => !databaseKeys.has(supplementLeadKey(lead)))
          .filter(lead => !branchId)
          .filter(lead => !status || lead.status === status)
          .filter(lead => !leadOwner || lead.leadOwner === leadOwner)
          .filter(lead => !dateFrom || lead.enquiryDate >= dateFrom)
          .filter(lead => !dateTo || lead.enquiryDate <= dateTo)
          .filter(lead => !normalizedPhoneQuery || lead.phone.includes(normalizedPhoneQuery))
          .filter(lead => !searchLower || [lead.childName, lead.phone]
            .some(value => value.toLowerCase().includes(searchLower)))
          .map(lead => {
            const identity = `${supplementBrand}|${supplementLeadKey(lead)}`;
            const timestamp = `${lead.enquiryDate}T00:00:00.000Z`;
            return {
              id: `crm-${createHash("sha256").update(identity).digest("hex").slice(0, 20)}`,
              brand: supplementBrand,
              branchId: null,
              academicYear: "2027-28",
              enquiryDate: lead.enquiryDate,
              monthLabel: lead.monthLabel,
              parentName: "",
              motherName: null,
              childName: lead.childName,
              phone: lead.phone,
              altPhone: null,
              email: null,
              program: lead.program,
              source: lead.source,
              status: lead.status,
              closeReason: null,
              remark: null,
              leadOwner: lead.leadOwner || null,
              walkInDate: null,
              revisitDate: null,
              revisitDate2: null,
              misCallingRemarks: null,
              seqNum: 0,
              brandSeqNum: null,
              isArchived: false,
              createdBy: "crm-supplement",
              updatedBy: null,
              createdAt: timestamp,
              updatedAt: timestamp,
              readOnly: true,
            };
          }),
      );

      const combinedRows = [...databaseRows, ...supplementalRows]
        .sort((a, b) => b.enquiryDate.localeCompare(a.enquiryDate));
      const total = combinedRows.length;
      const rows = combinedRows.slice(OFFSET, OFFSET + SIZE);

      res.json({ leads: rows, total, page: PAGE, pageSize: SIZE });
    } catch (err: any) {
      console.error("[walkin/leads GET]", err?.message);
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });

  // ── GET /api/walkin/leads/export ─────────────────────────────
  // Supports ?format=xlsx (default) or ?format=csv
  app.get("/api/walkin/leads/export", requireAdmin, async (req, res) => {
    try {
      const {
        brand, branchId, status, leadOwner, dateFrom, dateTo,
      } = req.query as Record<string, string>;
      const format = typeof req.query.format === "string" ? req.query.format : "xlsx";

      const conditions: any[] = [eq(walkinLeads.isArchived, false)];
      if (brand)    conditions.push(eq(walkinLeads.brand, brand));
      if (branchId) conditions.push(eq(walkinLeads.branchId, parseInt(branchId, 10)));
      if (status)   conditions.push(eq(walkinLeads.status, status));
      if (leadOwner) conditions.push(eq(walkinLeads.leadOwner, leadOwner));
      if (dateFrom) conditions.push(gte(walkinLeads.enquiryDate, dateFrom));
      if (dateTo)   conditions.push(lte(walkinLeads.enquiryDate, dateTo));

      const rows = await db.select().from(walkinLeads)
        .where(and(...conditions))
        .orderBy(desc(walkinLeads.enquiryDate));

      const HEADERS = [
        "Enquiry Date", "Month", "Academic Year", "Brand", "Branch ID",
        "Parent Name", "Child Name", "Phone", "Alt Phone", "Email",
        "Program", "Source", "Status", "Close Reason", "Remark",
        "Lead Owner", "Walk-in Date", "Revisit Date",
        "Created By", "Created At", "Updated At", "ID",
      ];
      const dataRows = rows.map((r) => [
        r.enquiryDate, r.monthLabel, r.academicYear, r.brand, r.branchId ?? "",
        r.parentName, r.childName, r.phone, r.altPhone ?? "", r.email ?? "",
        r.program, r.source, r.status, r.closeReason ?? "", r.remark ?? "",
        r.leadOwner ?? "", r.walkInDate ?? "", r.revisitDate ?? "",
        r.createdBy, r.createdAt.toISOString(), r.updatedAt.toISOString(), r.id,
      ]);

      const baseName = `walkin-leads-${brand || "all"}-${new Date().toISOString().slice(0, 10)}`;

      if (format === "csv") {
        const escape = (v: string | number | null | undefined) => {
          const s = String(v ?? "");
          return (s.includes(",") || s.includes('"') || s.includes("\n"))
            ? `"${s.replace(/"/g, '""')}"` : s;
        };
        const csv = [HEADERS.join(","), ...dataRows.map(r => r.map(escape).join(","))].join("\n");
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename="${baseName}.csv"`);
        return res.send(csv);
      }

      // Default: xlsx
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([HEADERS, ...dataRows]);
      ws["!cols"] = [10,8,10,6,9,20,18,13,13,22,18,14,18,22,30,18,10,10,12,22,22,38].map(w => ({ wch: w }));
      XLSX.utils.book_append_sheet(wb, ws, "Leads");
      const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename="${baseName}.xlsx"`);
      res.send(buf);
    } catch (err: any) {
      console.error("[walkin/leads/export]", err?.message);
      res.status(500).json({ message: "Export failed" });
    }
  });

  // ── GET /api/walkin/leads/:id ────────────────────────────────
  app.get("/api/walkin/leads/:id", requireAdmin, async (req, res) => {
    try {
      const [lead] = await db.select().from(walkinLeads).where(eq(walkinLeads.id, req.params.id));
      if (!lead) return res.status(404).json({ message: "Lead not found" });
      res.json(lead);
    } catch (err: any) {
      res.status(500).json({ message: "Failed to fetch lead" });
    }
  });

  // ── PATCH /api/walkin/leads/:id ──────────────────────────────
  app.patch("/api/walkin/leads/:id", requireAdmin, async (req, res) => {
    try {
      const parsed = updateLeadSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.data });
      }
      const updates = parsed.data;
      const changedBy = updates.updatedBy || "admin";

      // Fetch existing lead
      const [existing] = await db.select().from(walkinLeads).where(eq(walkinLeads.id, req.params.id));
      if (!existing) return res.status(404).json({ message: "Lead not found" });
      if (existing.isArchived) return res.status(400).json({ message: "Cannot update an archived lead" });

      // Validate status-dependent fields against merged values
      const newStatus = updates.status ?? existing.status;
      const newCloseReason = updates.closeReason ?? existing.closeReason;
      const newWalkInDate = updates.walkInDate ?? existing.walkInDate;
      if (newStatus === "CLOSED" && !newCloseReason) {
        return res.status(400).json({ message: "closeReason is required when status is CLOSED" });
      }
      const walkinStatusList = ["WALK-IN BOOKED", "WALK-IN COMPLETED"];
      if (walkinStatusList.includes(newStatus) && !newWalkInDate) {
        return res.status(400).json({ message: "walkInDate is required for walk-in statuses" });
      }

      // Diff and collect audit rows
      const MUTABLE_FIELDS: (keyof WalkinLead)[] = [
        "parentName", "motherName", "childName", "altPhone", "email", "program",
        "source", "status", "closeReason", "remark", "leadOwner",
        "walkInDate", "revisitDate", "revisitDate2", "branchId", "misCallingRemarks",
      ];

      const auditRows: Array<{ field: string; oldValue: string | null; newValue: string | null }> = [];
      for (const field of MUTABLE_FIELDS) {
        const newVal = (updates as any)[field];
        if (newVal === undefined) continue;
        const oldStr = existing[field] != null ? String(existing[field]) : null;
        const newStr = newVal != null ? String(newVal) : null;
        if (oldStr !== newStr) {
          auditRows.push({ field, oldValue: oldStr, newValue: newStr });
        }
      }

      // Build patch object
      const patch: Partial<typeof walkinLeads.$inferInsert> = {
        updatedBy: changedBy,
        updatedAt: new Date(),
      };
      for (const field of MUTABLE_FIELDS) {
        const v = (updates as any)[field];
        if (v !== undefined) (patch as any)[field] = v ?? null;
      }

      const [updated] = await db
        .update(walkinLeads)
        .set(patch)
        .where(eq(walkinLeads.id, req.params.id))
        .returning();

      // Write audit rows
      await Promise.all(
        auditRows.map((r) => writeAudit(req.params.id, r.field, r.oldValue, r.newValue, changedBy)),
      );

      // Mirror update to Google Sheets (fire-and-forget)
      queueUpsert(updated.brand as "RIS" | "RPS", updated);

      res.json(updated);
    } catch (err: any) {
      console.error("[walkin/leads PATCH]", err?.message);
      res.status(500).json({ message: "Failed to update lead" });
    }
  });

  // ── POST /api/walkin/leads/:id/archive ───────────────────────
  app.post("/api/walkin/leads/:id/archive", requireAdmin, async (req, res) => {
    try {
      const changedBy = (req.body as any)?.archivedBy || "admin";
      const [existing] = await db.select().from(walkinLeads).where(eq(walkinLeads.id, req.params.id));
      if (!existing) return res.status(404).json({ message: "Lead not found" });

      const [updated] = await db
        .update(walkinLeads)
        .set({ isArchived: true, updatedBy: changedBy, updatedAt: new Date() })
        .where(eq(walkinLeads.id, req.params.id))
        .returning();

      await writeAudit(req.params.id, "archived", "false", "true", changedBy);

      // Mirror archival to Google Sheets (fire-and-forget — never blocks the API response).
      // Use a full brand resync so the archived row is physically removed from the sheet
      // (consistent with how syncDeletionsFromMaster handles deletions from the Master MIS).
      const archiveBrand = existing.brand as "RIS" | "RPS";
      resyncArchivedLead(archiveBrand).catch((err) =>
        console.error("[walkin/leads/archive] Sheet propagation failed:", err?.message)
      );

      res.json(updated);
    } catch (err: any) {
      console.error("[walkin/leads/archive]", err?.message);
      res.status(500).json({ message: "Failed to archive lead" });
    }
  });

  // ── GET /api/walkin/leads/:id/history ────────────────────────
  app.get("/api/walkin/leads/:id/history", requireAdmin, async (req, res) => {
    try {
      const rows = await db
        .select()
        .from(walkinLeadAuditLog)
        .where(eq(walkinLeadAuditLog.leadId, req.params.id))
        .orderBy(desc(walkinLeadAuditLog.changedAt));
      res.json(rows);
    } catch (err: any) {
      res.status(500).json({ message: "Failed to fetch audit history" });
    }
  });

  // ── GET /api/walkin/branches ──────────────────────────────────
  app.get("/api/walkin/branches", async (req, res) => {
    try {
      const brand = typeof req.query.brand === "string" ? req.query.brand : null;
      const activeOnly = req.query.active !== "false";

      const conditions: any[] = [];
      if (brand) conditions.push(eq(walkinBranches.brand, brand));
      if (activeOnly) conditions.push(eq(walkinBranches.isActive, true));

      const rows = await db
        .select()
        .from(walkinBranches)
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(walkinBranches.name);

      // Never return PINs to unauthenticated callers
      const safe = isAdmin(req)
        ? rows
        : rows.map(({ pin: _pin, ...rest }) => rest);

      res.json(safe);
    } catch (err: any) {
      res.status(500).json({ message: "Failed to fetch branches" });
    }
  });

  // ── POST /api/walkin/branches ─────────────────────────────────
  app.post("/api/walkin/branches", requireAdmin, async (req, res) => {
    try {
      const schema = z.object({
        name: z.string().min(2),
        brand: z.enum(["RIS", "RPS"]),
        code: z.string().min(2).regex(/^[a-z0-9-]+$/, "code must be lowercase letters, numbers, and hyphens"),
        pin: z.string().min(4).max(8).optional().default("0000"),
        isActive: z.boolean().default(true),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }
      const [branch] = await db.insert(walkinBranches).values(parsed.data).returning();
      res.status(201).json(branch);
    } catch (err: any) {
      if (err.code === "23505") return res.status(409).json({ message: "Branch code already exists" });
      res.status(500).json({ message: "Failed to create branch" });
    }
  });

  // ── PATCH /api/walkin/branches/:id ───────────────────────────
  app.patch("/api/walkin/branches/:id", requireAdmin, async (req, res) => {
    try {
      const schema = z.object({
        name: z.string().min(2).optional(),
        pin: z.string().min(4).max(8).optional(),
        isActive: z.boolean().optional(),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }
      const [branch] = await db
        .update(walkinBranches)
        .set(parsed.data)
        .where(eq(walkinBranches.id, parseInt(req.params.id, 10)))
        .returning();
      if (!branch) return res.status(404).json({ message: "Branch not found" });
      res.json(branch);
    } catch (err: any) {
      res.status(500).json({ message: "Failed to update branch" });
    }
  });

  // ── DELETE /api/walkin/branches/:id ──────────────────────────
  app.delete("/api/walkin/branches/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid id" });

      // Refuse if any leads or staff are assigned to this branch
      const [leadCount] = await db
        .select({ cnt: sql<number>`cast(count(*) as int)` })
        .from(walkinLeads)
        .where(eq(walkinLeads.branchId, id));
      if (leadCount.cnt > 0) {
        return res.status(409).json({
          message: `Cannot delete: ${leadCount.cnt} lead(s) are assigned to this branch. Reassign them first.`,
        });
      }
      const [staffCount] = await db
        .select({ cnt: sql<number>`cast(count(*) as int)` })
        .from(walkinStaff)
        .where(eq(walkinStaff.branchId, id));
      if (staffCount.cnt > 0) {
        return res.status(409).json({
          message: `Cannot delete: ${staffCount.cnt} staff member(s) are assigned to this branch. Reassign them first.`,
        });
      }

      const [deleted] = await db
        .delete(walkinBranches)
        .where(eq(walkinBranches.id, id))
        .returning();
      if (!deleted) return res.status(404).json({ message: "Branch not found" });
      res.json({ message: "Branch deleted", branch: deleted });
    } catch (err: any) {
      res.status(500).json({ message: "Failed to delete branch" });
    }
  });

  // ── POST /api/walkin/sheets/pull-hook ────────────────────────
  // Called by Google Apps Script onEdit trigger for instant Sheet→DB→Master sync.
  // Authenticated by x-admin-token header (same token as admin panel).
  // Responds immediately; pull runs async so Apps Script doesn't time out.
  app.post("/api/walkin/sheets/pull-hook", async (req, res) => {
    const provided =
      (req.headers["x-admin-token"] as string | undefined) ||
      (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    const adminToken = process.env.ADMIN_TOKEN;
    if (!adminToken || !provided || provided !== adminToken) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const brand = (req.body?.brand ?? "").toUpperCase();
    if (brand !== "RIS" && brand !== "RPS" && brand !== "MASTER") {
      return res.status(400).json({ error: "brand must be RIS, RPS, or MASTER" });
    }
    // Respond immediately so Apps Script doesn't hit its 30-s timeout
    res.json({ ok: true, message: "Pull triggered" });
    if (brand === "MASTER") {
      runWalkinSheetOperation("pull webhook", pullChangesFromMasterSheet).catch((e: any) =>
        console.error("[walkin/pull-hook]", e?.message)
      );
    } else {
      runWalkinSheetOperation("pull webhook", () => pullChangesFromSheet(brand as "RIS" | "RPS")).catch((e: any) =>
        console.error("[walkin/pull-hook]", e?.message)
      );
    }
  });

  // ── GET /api/walkin/sheets/pull-log ───────────────────────────
  // Returns the last 50 sheet-pull log entries for the admin panel.
  app.get("/api/walkin/sheets/pull-log", requireAdmin, async (req, res) => {
    res.json(getPullLog().slice(0, 50));
  });

  // ── POST /api/walkin/sheets/pull ──────────────────────────────
  // Manually trigger a Sheet→DB pull for one or all brands.
  // ?brand=RIS|RPS|MASTER  (optional; defaults to all three)
  // Runs synchronously so the response includes the result.
  app.post("/api/walkin/sheets/pull", requireAdmin, async (req, res) => {
    const brandParam = typeof req.query.brand === "string" ? req.query.brand.toUpperCase() : "ALL";

    try {
      const brandResults: Array<ReturnType<typeof pullChangesFromSheet>> = [];
      let masterResult: ReturnType<typeof pullChangesFromMasterSheet> | null = null;

      if (brandParam === "RIS") {
        brandResults.push(runWalkinSheetOperation("manual RIS pull", () => pullChangesFromSheet("RIS")));
      } else if (brandParam === "RPS") {
        brandResults.push(runWalkinSheetOperation("manual RPS pull", () => pullChangesFromSheet("RPS")));
      } else if (brandParam === "MASTER") {
        masterResult = runWalkinSheetOperation("manual Master pull", pullChangesFromMasterSheet);
      } else {
        // ALL — MASTER must run first so its DB writes land before the brand pulls
        // compare brand-sheet values against the DB.  Running them in parallel risks
        // a race where a brand pull reads the brand sheet (old value), sees it differs
        // from the DB (already updated by MASTER), and reverts the master change.
        const allEntries0 = await runWalkinSheetOperation("manual full pull", async () => {
          const masterEntry0 = await pullChangesFromMasterSheet();
          const brandEntries0 = await Promise.all([pullChangesFromSheet("RIS"), pullChangesFromSheet("RPS")]);
          return [masterEntry0, ...brandEntries0];
        });
        return res.json({
          results: allEntries0,
          summary: allEntries0.map((r) => ({
            brand: r.brand,
            rowsScanned: r.rowsScanned,
            changesApplied: r.changesApplied,
            errors: r.errors,
          })),
        });
      }

      const [brandEntries, masterEntry] = await Promise.all([
        Promise.all(brandResults),
        masterResult,
      ]);

      const allEntries = masterEntry ? [...brandEntries, masterEntry] : brandEntries;
      res.json({
        results: allEntries,
        summary: allEntries.map((r) => ({
          brand: r.brand,
          rowsScanned: r.rowsScanned,
          changesApplied: r.changesApplied,
          errors: r.errors,
        })),
      });
    } catch (err: any) {
      console.error("[walkin/sheets/pull]", err?.message);
      res.status(500).json({ message: err?.message ?? "Pull failed" });
    }
  });

  // ── GET /api/walkin/stats ─────────────────────────────────────
  // Aggregate funnel stats for dashboards (Task 4)
  // Public: returns only aggregated counts (no PII). Individual leads are
  // behind requireAdmin separately.
  app.get("/api/walkin/stats", async (req, res) => {
    try {
      const brand = typeof req.query.brand === "string" ? req.query.brand : null;
      const ay = typeof req.query.ay === "string" ? req.query.ay : "2027-28";

      const conditions: any[] = [
        eq(walkinLeads.academicYear, ay),
        eq(walkinLeads.isArchived, false),
      ];
      if (brand) conditions.push(eq(walkinLeads.brand, brand));

      const where = and(...conditions);

      // Total counts by status
      const byCounts = await db
        .select({ status: walkinLeads.status, cnt: sql<number>`cast(count(*) as int)` })
        .from(walkinLeads)
        .where(where)
        .groupBy(walkinLeads.status);

      const totalLeads = byCounts.reduce((s, r) => s + r.cnt, 0);
      const bookings = byCounts.find((r) => r.status === "WALK-IN BOOKED")?.cnt ?? 0;
      const walkins = byCounts
        .filter((r) => ["WALK-IN COMPLETED", "ADMISSION DONE"].includes(r.status))
        .reduce((s, r) => s + r.cnt, 0);
      const admissions = byCounts.find((r) => r.status === "ADMISSION DONE")?.cnt ?? 0;

      // Monthly breakdown
      const monthly = await db
        .select({
          month: walkinLeads.monthLabel,
          cnt: sql<number>`cast(count(*) as int)`,
        })
        .from(walkinLeads)
        .where(where)
        .groupBy(walkinLeads.monthLabel)
        .orderBy(walkinLeads.monthLabel);

      // By source
      const bySource = await db
        .select({ source: walkinLeads.source, cnt: sql<number>`cast(count(*) as int)` })
        .from(walkinLeads)
        .where(where)
        .groupBy(walkinLeads.source)
        .orderBy(desc(sql`count(*)`));

      // By branch
      const byBranch = await db
        .select({ branchId: walkinLeads.branchId, cnt: sql<number>`cast(count(*) as int)` })
        .from(walkinLeads)
        .where(where)
        .groupBy(walkinLeads.branchId)
        .orderBy(desc(sql`count(*)`));

      // By lead owner
      const byOwner = await db
        .select({ leadOwner: walkinLeads.leadOwner, cnt: sql<number>`cast(count(*) as int)` })
        .from(walkinLeads)
        .where(where)
        .groupBy(walkinLeads.leadOwner)
        .orderBy(desc(sql`count(*)`));

      res.json({
        brand,
        academicYear: ay,
        kpis: { totalLeads, bookings, walkins, admissions },
        monthly,
        bySource,
        byBranch,
        byOwner,
        statusBreakdown: byCounts,
        generatedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error("[walkin/stats]", err?.message);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // ── GET /api/walkin/crm-stats ─────────────────────────────────
  // Reads the "CRM Leads Tracker" tab directly from the brand's Google
  // Sheet and returns KPIs in the same shape as /api/walkin/stats.
  // Results are cached for 2 minutes to protect Google Sheets quota.
  //
  // Query params:
  //   brand  — required; "RIS" or "RPS"
  //   bust   — optional; any truthy value forces a fresh read (admin only)
  // Public: returns only aggregated counts (no PII). Tokens are accepted
  // but not required — external callers (Training Platform) may pass
  // RIS_ADMIN_TOKEN / RPS_ADMIN_TOKEN for future scoped endpoints, but
  // this endpoint is open so internal dashboards work without headers.
  app.get("/api/walkin/crm-stats", async (req, res) => {
    try {
      const brand = typeof req.query.brand === "string" ? req.query.brand : null;
      if (!brand || !["RIS", "RPS"].includes(brand)) {
        return res.status(400).json({ message: "brand must be RIS or RPS" });
      }

      // Only admins may bypass the cache
      const bustRequested = req.query.bust !== undefined && req.query.bust !== "0" && req.query.bust !== "false";
      const bust = bustRequested && isAdmin(req);

      const stats = await readCrmLeadsTrackerStats(brand as "RIS" | "RPS", { bust });
      res.json(stats);
    } catch (err: any) {
      console.error("[walkin/crm-stats]", err?.message);
      res.status(500).json({ message: "Failed to fetch CRM stats from sheet" });
    }
  });

  // ── GET /api/walkin/staff ─────────────────────────────────────
  // Public: active only. Admin: all (including inactive) + lead counts.
  app.get("/api/walkin/staff", async (req, res) => {
    try {
      const admin = isAdmin(req);
      const brand = typeof req.query.brand === "string" ? req.query.brand : null;
      const conditions: any[] = [];
      if (!admin) conditions.push(eq(walkinStaff.isActive, true));
      if (brand) conditions.push(or(eq(walkinStaff.brand, brand), isNull(walkinStaff.brand)));
      const rows = await db.select().from(walkinStaff)
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(walkinStaff.sortOrder);

      if (!admin) {
        return res.json(rows);
      }

      // For admin requests, fetch open lead counts grouped by leadOwner name
      const leadCounts = await db
        .select({
          leadOwner: walkinLeads.leadOwner,
          count: sql<number>`cast(count(*) as int)`,
        })
        .from(walkinLeads)
        .where(eq(walkinLeads.isArchived, false))
        .groupBy(walkinLeads.leadOwner);

      const countMap = new Map<string, number>();
      for (const row of leadCounts) {
        if (row.leadOwner) countMap.set(row.leadOwner, row.count);
      }

      const rowsWithCounts = rows.map(s => ({
        ...s,
        leadCount: countMap.get(s.name) ?? 0,
      }));

      res.json(rowsWithCounts);
    } catch (err: any) {
      res.status(500).json({ message: "Failed to fetch staff" });
    }
  });

  // ── POST /api/walkin/staff ────────────────────────────────────
  app.post("/api/walkin/staff", requireAdmin, async (req, res) => {
    try {
      const schema = z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        brand: z.enum(["RIS", "RPS"]).optional().nullable(),
        branchId: z.number().int().nullable().optional(),
        sortOrder: z.number().int().default(0),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: parsed.error.errors[0].message });
      const [row] = await db.insert(walkinStaff).values(parsed.data).returning();
      res.status(201).json(row);
    } catch (err: any) {
      res.status(500).json({ message: "Failed to create staff member" });
    }
  });

  // ── PATCH /api/walkin/staff/:id ───────────────────────────────
  app.patch("/api/walkin/staff/:id", requireAdmin, async (req, res) => {
    try {
      const schema = z.object({
        name: z.string().min(2).optional(),
        brand: z.enum(["RIS", "RPS"]).optional().nullable(),
        branchId: z.number().int().nullable().optional(),
        isActive: z.boolean().optional(),
        sortOrder: z.number().int().optional(),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: parsed.error.errors[0].message });
      const [row] = await db.update(walkinStaff).set(parsed.data)
        .where(eq(walkinStaff.id, parseInt(req.params.id, 10))).returning();
      if (!row) return res.status(404).json({ message: "Staff member not found" });
      res.json(row);
    } catch (err: any) {
      res.status(500).json({ message: "Failed to update staff member" });
    }
  });

  // ── POST /api/walkin/lookups/:table ───────────────────────────
  // Add a new lookup item to one of the four lookup tables.
  // table: programs | sources | statuses | close-reasons
  app.post("/api/walkin/lookups/:table", requireAdmin, async (req, res) => {
    try {
      const table = req.params.table;
      const schema = z.object({
        label: z.string().min(1, "Label is required"),
        brand: z.enum(["RIS", "RPS"]).optional().nullable(),
        sortOrder: z.number().int().default(0),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: parsed.error.errors[0].message });

      // Duplicate-label check (case-insensitive) before inserting
      const newLabelLower = parsed.data.label.trim().toLowerCase();
      let existing: any[] = [];
      if (table === "programs")           existing = await db.select().from(walkinPrograms);
      else if (table === "sources")       existing = await db.select().from(walkinSources);
      else if (table === "statuses")      existing = await db.select().from(walkinStatuses);
      else if (table === "close-reasons") existing = await db.select().from(walkinCloseReasons);
      else return res.status(400).json({ message: "Invalid table; use programs | sources | statuses | close-reasons" });
      const clash = existing.some((r: any) => r.label.trim().toLowerCase() === newLabelLower);
      if (clash) {
        return res.status(409).json({ message: `"${parsed.data.label}" already exists in this list. Please choose a different name.` });
      }

      let row: any;
      if (table === "programs")      [row] = await db.insert(walkinPrograms).values(parsed.data).returning();
      else if (table === "sources")  [row] = await db.insert(walkinSources).values(parsed.data).returning();
      else if (table === "statuses") [row] = await db.insert(walkinStatuses).values(parsed.data).returning();
      else if (table === "close-reasons") [row] = await db.insert(walkinCloseReasons).values(parsed.data).returning();
      else return res.status(400).json({ message: "Invalid table; use programs | sources | statuses | close-reasons" });

      res.status(201).json(row);
    } catch (err: any) {
      res.status(500).json({ message: "Failed to add lookup item" });
    }
  });

  // ── PATCH /api/walkin/lookups/:table/:id ─────────────────────
  // Update label, isActive, or sortOrder of a single lookup item.
  app.patch("/api/walkin/lookups/:table/:id", requireAdmin, async (req, res) => {
    try {
      const table = req.params.table;
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid id" });

      const schema = z.object({
        label: z.string().min(1).optional(),
        isActive: z.boolean().optional(),
        sortOrder: z.number().int().optional(),
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: parsed.error.errors[0].message });

      // Duplicate-label check (case-insensitive) when renaming
      if (parsed.data.label !== undefined) {
        const newLabelLower = parsed.data.label.trim().toLowerCase();
        let existing: any[] = [];
        if (table === "programs")           existing = await db.select().from(walkinPrograms).where(ne(walkinPrograms.id, id));
        else if (table === "sources")       existing = await db.select().from(walkinSources).where(ne(walkinSources.id, id));
        else if (table === "statuses")      existing = await db.select().from(walkinStatuses).where(ne(walkinStatuses.id, id));
        else if (table === "close-reasons") existing = await db.select().from(walkinCloseReasons).where(ne(walkinCloseReasons.id, id));
        const clash = existing.some((r: any) => r.label.trim().toLowerCase() === newLabelLower);
        if (clash) {
          return res.status(409).json({ message: `"${parsed.data.label}" already exists in this list. Please choose a different name.` });
        }
      }

      let row: any;
      if (table === "programs")      [row] = await db.update(walkinPrograms).set(parsed.data).where(eq(walkinPrograms.id, id)).returning();
      else if (table === "sources")  [row] = await db.update(walkinSources).set(parsed.data).where(eq(walkinSources.id, id)).returning();
      else if (table === "statuses") [row] = await db.update(walkinStatuses).set(parsed.data).where(eq(walkinStatuses.id, id)).returning();
      else if (table === "close-reasons") [row] = await db.update(walkinCloseReasons).set(parsed.data).where(eq(walkinCloseReasons.id, id)).returning();
      else return res.status(400).json({ message: "Invalid table; use programs | sources | statuses | close-reasons" });

      if (!row) return res.status(404).json({ message: "Item not found" });
      res.json(row);
    } catch (err: any) {
      res.status(500).json({ message: "Failed to update lookup item" });
    }
  });

  // ── POST /api/walkin/sheets/resync ────────────────────────────
  // Admin-only. Rewrites the entire Leads tab for the given brand from the DB.
  // Query params: ?brand=RIS|RPS  (required)
  // Returns: { brand, dbCount, sheetCount, syncedAt }
  app.post("/api/walkin/sheets/resync", requireAdmin, async (req, res) => {
    try {
      const brand = typeof req.query.brand === "string" ? req.query.brand.toUpperCase() : "";
      if (brand !== "RIS" && brand !== "RPS") {
        return res.status(400).json({ message: "brand query param must be RIS or RPS" });
      }

      const { dbCount, sheetCount } = await runWalkinSheetOperation(
        `${brand} manual resync`,
        () => resyncBrandToSheet(brand as "RIS" | "RPS"),
      );

      res.json({
        brand,
        dbCount,
        sheetCount,
        syncedAt: new Date().toISOString(),
        message: `Resynced ${dbCount} leads to ${brand} sheet`,
      });
    } catch (err: any) {
      console.error("[walkin/sheets/resync]", err?.message);
      res.status(500).json({ message: err?.message ?? "Resync failed" });
    }
  });

  // ── POST /api/walkin/sheets/resync-master ─────────────────────
  // Rewrites the entire master (combined RIS + RPS) sheet from DB.
  app.post("/api/walkin/sheets/resync-master", requireAdmin, async (req, res) => {
    try {
      const { dbCount, sheetCount } = await runWalkinSheetOperation("Master manual resync", resyncMasterSheet);
      res.json({ message: `Resynced ${dbCount} leads (RIS + RPS) to master sheet`, dbCount, sheetCount });
    } catch (err: any) {
      console.error("[walkin/sheets/resync-master]", err?.message);
      res.status(500).json({ message: err?.message ?? "Resync failed" });
    }
  });

  // ── POST /api/walkin/sheets/sync-master-deletions ─────────────
  // Detects leads that exist in DB but were deleted from the Master MIS
  // WALKINs tab, archives them in DB, and marks ARCHIVED in brand sheets.
  // Explicit admin action — intentionally NOT part of auto-pull.
  app.post("/api/walkin/sheets/sync-master-deletions", requireAdmin, async (req, res) => {
    try {
      const result = await runWalkinSheetOperation("manual deletion sync", syncDeletionsFromMaster);
      const message = result.archived > 0
        ? `Archived ${result.archived} lead(s) that were removed from Master MIS`
        : "No missing leads found — all DB leads are present in Master MIS";
      res.json({ message, ...result });
    } catch (err: any) {
      console.error("[walkin/sheets/sync-master-deletions]", err?.message);
      res.status(500).json({ message: err?.message ?? "Sync failed" });
    }
  });

  // ── GET /api/walkin/sheets/status ──────────────────────────────
  // Admin-only. Returns last-sync timestamp and lead counts for both brands.
  app.get("/api/walkin/sheets/status", requireAdmin, async (req, res) => {
    try {
      const status = getSyncStatus();

      // Also fetch live DB counts for comparison
      const [risCount, rpsCount] = await Promise.all([
        db.select({ cnt: sql<number>`cast(count(*) as int)` })
          .from(walkinLeads)
          .where(and(eq(walkinLeads.brand, "RIS"), eq(walkinLeads.isArchived, false))),
        db.select({ cnt: sql<number>`cast(count(*) as int)` })
          .from(walkinLeads)
          .where(and(eq(walkinLeads.brand, "RPS"), eq(walkinLeads.isArchived, false))),
      ]);

      const risSheetConfigured = !!process.env.RIS_WALKIN_SHEET_ID_2728;
      const rpsSheetConfigured = !!process.env.RPS_WALKIN_SHEET_ID_2728;
      const masterSheetConfigured = !!process.env.MASTER_WALKIN_SHEET_ID_2728;
      const credentialSource = getGoogleCredentialSource();
      const googleConfigured = credentialSource !== "unavailable" && !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

      res.json({
        googleConfigured,
        credentialSource,
        RIS: {
          sheetConfigured: risSheetConfigured,
          sheetId: risSheetConfigured ? process.env.RIS_WALKIN_SHEET_ID_2728!.slice(0, 8) + "…" : null,
          lastSyncAt: status.RIS.lastSyncAt?.toISOString() ?? null,
          dbCount: risCount[0].cnt,
          sheetCount: status.RIS.sheetCount,
          lastError: status.RIS.lastError,
        },
        RPS: {
          sheetConfigured: rpsSheetConfigured,
          sheetId: rpsSheetConfigured ? process.env.RPS_WALKIN_SHEET_ID_2728!.slice(0, 8) + "…" : null,
          lastSyncAt: status.RPS.lastSyncAt?.toISOString() ?? null,
          dbCount: rpsCount[0].cnt,
          sheetCount: status.RPS.sheetCount,
          lastError: status.RPS.lastError,
        },
        MASTER: {
          sheetConfigured: masterSheetConfigured,
          sheetId: masterSheetConfigured ? process.env.MASTER_WALKIN_SHEET_ID_2728!.slice(0, 8) + "…" : null,
          lastSyncAt: status.MASTER.lastSyncAt?.toISOString() ?? null,
          dbCount: (risCount[0].cnt ?? 0) + (rpsCount[0].cnt ?? 0),
          sheetCount: status.MASTER.sheetCount,
          lastError: status.MASTER.lastError,
        },
      });
    } catch (err: any) {
      console.error("[walkin/sheets/status]", err?.message);
      res.status(500).json({ message: "Failed to fetch sync status" });
    }
  });

  // Start auto-pull: every 5 minutes, read green columns from both sheets and sync back to DB
  startAutoPull();

  console.log("[walkin] Routes registered");
}
