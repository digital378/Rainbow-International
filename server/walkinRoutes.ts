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
 *   GET  /api/walkin/branches/:code/verify-pin — verify kiosk PIN
 *   POST /api/walkin/sheets/resync        — rewrite entire sheet from DB (admin only)
 *   GET  /api/walkin/sheets/status        — last-sync timestamp + lead counts (admin only)
 */

import { type Express } from "express";
import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { db } from "./db";
import {
  walkinLeads, walkinLeadAuditLog, walkinBranches,
  walkinPrograms, walkinSources, walkinStatuses, walkinCloseReasons, walkinStaff,
  type WalkinLead,
} from "@shared/schema";
import { normalizePhoneOrThrow } from "@shared/phoneNormalizer";
import { eq, and, gte, lte, ilike, desc, or, sql, isNull, ne } from "drizzle-orm";
import { createRequire } from "node:module";
const _require = createRequire(import.meta.url);
const XLSX = _require("xlsx") as typeof import("xlsx");
import { queueUpsert, resyncBrandToSheet, getSyncStatus } from "./walkinSheets";

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
  req: Express["request"],
  res: Express["response"],
  next: Express["nextFunction"],
) {
  if (!isAdmin(req)) return res.status(401).json({ message: "Unauthorized" });
  next();
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
  parentName: z.string().min(2, "Parent name is required (min 2 characters)").trim(),
  childName: z.string().min(2, "Child name is required (min 2 characters)").trim(),
  phone: z.string().min(1, "Phone is required"),
  altPhone: z.string().optional().or(z.literal("")).transform((v) => v || undefined),
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
  branchId: z.number().int().positive().optional(),
  updatedBy: z.string().default("admin"),
});

// ── Route Registration ───────────────────────────────────────────

export function registerWalkinRoutes(app: Express) {

  // ── GET /api/walkin/lookups ────────────────────────────────────
  // Returns all active lookup values for the kiosk form dropdowns.
  // Accepts optional ?brand=RIS|RPS to filter brand-specific lookups.
  app.get("/api/walkin/lookups", async (req, res) => {
    try {
      const brand = typeof req.query.brand === "string" ? req.query.brand : null;

      const [programs, sources, statuses, closeReasons, staff, branches] = await Promise.all([
        db.select().from(walkinPrograms)
          .where(
            and(
              eq(walkinPrograms.isActive, true),
              brand
                ? or(eq(walkinPrograms.brand, brand), isNull(walkinPrograms.brand))
                : undefined,
            ),
          )
          .orderBy(walkinPrograms.sortOrder),
        db.select().from(walkinSources)
          .where(eq(walkinSources.isActive, true))
          .orderBy(walkinSources.sortOrder),
        db.select().from(walkinStatuses)
          .where(eq(walkinStatuses.isActive, true))
          .orderBy(walkinStatuses.sortOrder),
        db.select().from(walkinCloseReasons)
          .where(eq(walkinCloseReasons.isActive, true))
          .orderBy(walkinCloseReasons.sortOrder),
        db.select().from(walkinStaff)
          .where(
            and(
              eq(walkinStaff.isActive, true),
              brand
                ? or(eq(walkinStaff.brand, brand), isNull(walkinStaff.brand))
                : undefined,
            ),
          )
          .orderBy(walkinStaff.sortOrder),
        db.select().from(walkinBranches)
          .where(
            and(
              eq(walkinBranches.isActive, true),
              brand ? eq(walkinBranches.brand, brand) : undefined,
            ),
          )
          .orderBy(walkinBranches.name),
      ]);

      res.json({ programs, sources, statuses, closeReasons, staff, branches });
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

      // Normalize altPhone if provided
      let altPhone: string | undefined;
      if (data.altPhone) {
        try {
          altPhone = normalizePhoneOrThrow(data.altPhone);
        } catch {
          altPhone = undefined; // non-fatal for alt phone
        }
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

      const conditions: any[] = [];
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

      const [rows, [{ total }]] = await Promise.all([
        db.select().from(walkinLeads)
          .where(where)
          .orderBy(desc(walkinLeads.createdAt))
          .limit(SIZE)
          .offset(OFFSET),
        db.select({ total: sql<number>`cast(count(*) as int)` }).from(walkinLeads).where(where),
      ]);

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
        "parentName", "childName", "altPhone", "email", "program",
        "source", "status", "closeReason", "remark", "leadOwner",
        "walkInDate", "revisitDate", "branchId",
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
        pin: z.string().min(4).max(8),
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

  // ── GET /api/walkin/branches/:code/verify-pin ────────────────
  // Verifies a kiosk PIN for a given branch code. Returns branch info (without PIN) on success.
  app.get("/api/walkin/branches/:code/verify-pin", async (req, res) => {
    try {
      const pin = typeof req.query.pin === "string" ? req.query.pin : "";
      const [branch] = await db
        .select()
        .from(walkinBranches)
        .where(and(eq(walkinBranches.code, req.params.code), eq(walkinBranches.isActive, true)));

      if (!branch) return res.status(404).json({ message: "Branch not found or inactive" });

      if (!pin || branch.pin !== pin) {
        return res.status(401).json({ message: "Incorrect PIN" });
      }

      const { pin: _pin, ...safe } = branch;
      res.json(safe);
    } catch (err: any) {
      res.status(500).json({ message: "PIN verification failed" });
    }
  });

  // ── GET /api/walkin/stats ─────────────────────────────────────
  // Aggregate funnel stats for dashboards (Task 4)
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

      const { dbCount, sheetCount } = await resyncBrandToSheet(brand as "RIS" | "RPS");

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
      const googleConfigured = !!(process.env.GOOGLE_REFRESH_TOKEN && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

      res.json({
        googleConfigured,
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
      });
    } catch (err: any) {
      console.error("[walkin/sheets/status]", err?.message);
      res.status(500).json({ message: "Failed to fetch sync status" });
    }
  });

  console.log("[walkin] Routes registered");
}
