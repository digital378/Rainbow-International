import type { Express, NextFunction, Request, Response } from "express";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { and, desc, eq, gte, isNull, lte, or, sql } from "drizzle-orm";
import { db } from "./db";
import {
  blogPostsTable,
  brochureRequests,
  callbackRequests,
  careerApplications,
  friendshipSchoolLeads,
  friendshipSchools,
  indraSyncStates,
  inquiries,
  walkinBranches,
  walkinCloseReasons,
  walkinLeads,
  walkinPrograms,
  walkinSources,
  walkinStaff,
  walkinStatuses,
} from "@shared/schema";
import { CODE_OWNED_BLOGS } from "@shared/codeOwnedBlogs";

export const INDRA_ALLOWED_ORIGIN = "https://indra-intelligence-assistant.replit.app";
const API_VERSION = "v1";
const INTEGRATION_KEY = "indra-intelligence";
const MAX_PAGE_SIZE = 200;
const PUSH_TARGET_HOST = new URL(INDRA_ALLOWED_ORIGIN).hostname;
const DEFAULT_PUSH_URL = `${INDRA_ALLOWED_ORIGIN}/api/integrations/rainbow/v1/deliveries`;
const DELIVERY_LEASE_MS = 10 * 60_000;

type Page = { page: number; pageSize: number; offset: number };
type PushState = {
  enabled: boolean;
  intervalMinutes: number;
  targetConfigured: boolean;
  tokenConfigured: boolean;
  pushSecretConfigured: boolean;
  lastAttemptedAt: Date | null;
  lastSuccessfulAt: Date | null;
  lastDeliveryId: string | null;
  lastError: string | null;
};

const requestWindows = new Map<string, { count: number; startedAt: number }>();
let schedulerStarted = false;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function parsePage(req: Request): Page {
  const page = clamp(Number.parseInt(String(req.query.page || "1"), 10) || 1, 1, 10_000);
  const pageSize = clamp(Number.parseInt(String(req.query.pageSize || "100"), 10) || 100, 1, MAX_PAGE_SIZE);
  return { page, pageSize, offset: (page - 1) * pageSize };
}

function parseDate(value: unknown, name: string): Date | null {
  if (value === undefined || value === "") return null;
  if (typeof value !== "string") throw new Error(`${name} must be an ISO date`);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error(`${name} must be an ISO date`);
  return date;
}

function parseOptionalBrand(value: unknown): "RIS" | "RPS" | null {
  if (value === undefined || value === "") return null;
  if (value === "RIS" || value === "RPS") return value;
  throw new Error("brand must be RIS or RPS");
}

function parseAcademicYear(value: unknown): string {
  const academicYear = String(value || "2027-28");
  if (!/^\d{4}-\d{2}$/.test(academicYear)) {
    throw new Error("academicYear must use YYYY-YY format");
  }
  return academicYear;
}

function parseOptionalAcademicYear(value: unknown): string | null {
  if (value === undefined || value === "") return null;
  return parseAcademicYear(value);
}

function parseOptionalPositiveInteger(value: unknown, name: string): number | null {
  if (value === undefined || value === "") return null;
  const raw = String(value);
  if (!/^[1-9]\d*$/.test(raw)) throw new Error(`${name} must be a positive integer`);
  const parsed = Number(raw);
  if (!Number.isSafeInteger(parsed)) throw new Error(`${name} must be a positive integer`);
  return parsed;
}

function parseBoolean(value: unknown): boolean {
  return value === "true" || value === true;
}

function envelope(dataset: string, data: unknown, page?: Page & { total: number }) {
  return {
    ok: true,
    apiVersion: API_VERSION,
    source: "rainbow-international-school",
    dataset,
    generatedAt: new Date().toISOString(),
    ...(page ? {
      page: page.page,
      pageSize: page.pageSize,
      total: page.total,
      totalPages: Math.max(1, Math.ceil(page.total / page.pageSize)),
    } : {}),
    data,
  };
}

type AdmissionsRow = {
  brand: string;
  status: string | null;
  monthLabel: string;
  branchId: number | null;
  source: string | null;
};

function emptyAdmissionsSummary(brand: string, academicYear: string) {
  return {
    brand,
    academicYear,
    kpis: { totalLeads: 0, bookings: 0, walkins: 0, admissions: 0 },
    statusBreakdown: [] as Array<{ status: string; count: number }>,
    monthly: [] as Array<{ month: string; leads: number; walkins: number; admissions: number }>,
    byBranch: [] as Array<{ branchId: number | null; leads: number; admissions: number }>,
    bySource: [] as Array<{ source: string; leads: number; admissions: number }>,
  };
}

function aggregateAdmissionsRows(rows: AdmissionsRow[], brand: string, academicYear: string) {
  const result = emptyAdmissionsSummary(brand, academicYear);
  const statusMap = new Map<string, number>();
  const monthMap = new Map<string, { leads: number; walkins: number; admissions: number }>();
  const branchMap = new Map<number | null, { leads: number; admissions: number }>();
  const sourceMap = new Map<string, { leads: number; admissions: number }>();

  for (const row of rows) {
    const status = (row.status || "").trim().toUpperCase() || "UNKNOWN";
    const month = row.monthLabel?.trim() || "Unknown";
    const source = row.source?.trim() || "Unknown";
    const isAdmission = status === "ADMISSION DONE";
    const isWalkin = status === "WALK-IN COMPLETED" || isAdmission;
    const isBooking = status === "WALK-IN BOOKED";

    result.kpis.totalLeads++;
    if (isBooking) result.kpis.bookings++;
    if (isWalkin) result.kpis.walkins++;
    if (isAdmission) result.kpis.admissions++;

    statusMap.set(status, (statusMap.get(status) || 0) + 1);

    const monthStats = monthMap.get(month) || { leads: 0, walkins: 0, admissions: 0 };
    monthStats.leads++;
    if (isWalkin) monthStats.walkins++;
    if (isAdmission) monthStats.admissions++;
    monthMap.set(month, monthStats);

    const branchStats = branchMap.get(row.branchId) || { leads: 0, admissions: 0 };
    branchStats.leads++;
    if (isAdmission) branchStats.admissions++;
    branchMap.set(row.branchId, branchStats);

    const sourceStats = sourceMap.get(source) || { leads: 0, admissions: 0 };
    sourceStats.leads++;
    if (isAdmission) sourceStats.admissions++;
    sourceMap.set(source, sourceStats);
  }

  result.statusBreakdown = Array.from(statusMap, ([status, count]) => ({ status, count }))
    .sort((a, b) => b.count - a.count || a.status.localeCompare(b.status));
  result.monthly = Array.from(monthMap, ([month, stats]) => ({ month, ...stats }));
  result.byBranch = Array.from(branchMap, ([branchId, stats]) => ({ branchId, ...stats }))
    .sort((a, b) => b.admissions - a.admissions || b.leads - a.leads);
  result.bySource = Array.from(sourceMap, ([source, stats]) => ({ source, ...stats }))
    .sort((a, b) => b.admissions - a.admissions || b.leads - a.leads);
  return result;
}

function sanitizeLead(lead: typeof walkinLeads.$inferSelect) {
  return {
    id: lead.id,
    brand: lead.brand,
    branchId: lead.branchId,
    academicYear: lead.academicYear,
    enquiryDate: lead.enquiryDate,
    monthLabel: lead.monthLabel,
    parentName: lead.parentName,
    motherName: lead.motherName,
    childName: lead.childName,
    phone: lead.phone,
    altPhone: lead.altPhone,
    email: lead.email,
    program: lead.program,
    source: lead.source,
    status: lead.status,
    closeReason: lead.closeReason,
    leadOwner: lead.leadOwner,
    walkInDate: lead.walkInDate,
    revisitDate: lead.revisitDate,
    revisitDate2: lead.revisitDate2,
    isArchived: lead.isArchived,
    createdAt: lead.createdAt,
    updatedAt: lead.updatedAt,
  };
}

function sanitizeBranch(branch: typeof walkinBranches.$inferSelect) {
  return {
    id: branch.id,
    name: branch.name,
    brand: branch.brand,
    code: branch.code,
    isActive: branch.isActive,
    createdAt: branch.createdAt,
  };
}

function sanitizeInquiry(row: typeof inquiries.$inferSelect) {
  return {
    id: row.id,
    parentName: row.parentName,
    email: row.email,
    phone: row.phone,
    studentName: row.studentName,
    grade: row.grade,
    preferredTime: row.preferredTime,
    source: row.source,
    pagePath: row.pagePath,
    pageTitle: row.pageTitle,
    formLocation: row.formLocation,
    utmSource: row.utmSource,
    utmMedium: row.utmMedium,
    utmCampaign: row.utmCampaign,
    createdAt: row.createdAt,
  };
}

function sanitizeCareerApplication(row: typeof careerApplications.$inferSelect) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    position: row.position,
    experience: row.experience,
    qualification: row.qualification,
    currentLocation: row.currentLocation,
    createdAt: row.createdAt,
  };
}

function sanitizeBrochureRequest(row: typeof brochureRequests.$inferSelect) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    requestedAt: row.requestedAt,
  };
}

function sanitizeCallbackRequest(row: typeof callbackRequests.$inferSelect) {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    preferredTime: row.preferredTime,
    createdAt: row.createdAt,
  };
}

function sanitizeStaff(row: typeof walkinStaff.$inferSelect) {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    branchId: row.branchId,
    isActive: row.isActive,
    sortOrder: row.sortOrder,
  };
}

function sanitizeLookup<T extends { id: number; label: string; brand: string | null; sortOrder: number; isActive: boolean }>(row: T) {
  return {
    id: row.id,
    label: row.label,
    brand: row.brand,
    sortOrder: row.sortOrder,
    isActive: row.isActive,
  };
}

function sanitizeFriendshipSchool(row: typeof friendshipSchools.$inferSelect) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    contactPerson: row.contactPerson,
    contactEmail: row.contactEmail,
    contactPhone: row.contactPhone,
    sheetsTabName: row.sheetsTabName,
    isActive: row.isActive,
    contactOverride: row.contactOverride,
    createdAt: row.createdAt,
  };
}

function sanitizeFriendshipLead(row: typeof friendshipSchoolLeads.$inferSelect) {
  return {
    id: row.id,
    schoolId: row.schoolId,
    studentName: row.studentName,
    grade: row.grade,
    parentName: row.parentName,
    phone: row.phone,
    email: row.email,
    source: row.source,
    status: row.status,
    commissionPaid: row.commissionPaid,
    submittedAt: row.submittedAt,
    syncedToSheets: row.syncedToSheets,
    syncFailed: row.syncFailed,
  };
}

function isIndraTokenValid(req: Request): boolean {
  const expected = process.env.INDRA_API_TOKEN;
  if (!expected) return false;
  const authorization = req.headers.authorization || "";
  const bearer = authorization.replace(/^Bearer\s+/i, "");
  const provided = (req.headers["x-indra-api-key"] as string | undefined) || bearer;
  if (!provided || provided.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(provided));
  } catch {
    return false;
  }
}

function requireIndraToken(req: Request, res: Response, next: NextFunction) {
  res.setHeader("Cache-Control", "no-store");
  if (!process.env.INDRA_API_TOKEN) {
    return res.status(503).json({ message: "Indra integration is not configured" });
  }
  if (!isIndraTokenValid(req)) return res.status(401).json({ message: "Unauthorized" });
  next();
}

function rateLimitIndra(req: Request, res: Response, next: NextFunction) {
  const key = (req.headers["x-forwarded-for"] as string || req.socket.remoteAddress || "unknown").split(",")[0].trim();
  const now = Date.now();
  const entry = requestWindows.get(key);
  if (!entry || now - entry.startedAt >= 60_000) {
    requestWindows.set(key, { count: 1, startedAt: now });
    return next();
  }
  entry.count += 1;
  if (entry.count > 120) return res.status(429).json({ message: "Rate limit exceeded" });
  next();
}

function safeErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : "Unknown delivery error";
  return message.replace(/https?:\/\/\S+/g, "[destination]").slice(0, 240);
}

function isAllowedPushUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === PUSH_TARGET_HOST;
  } catch {
    return false;
  }
}

async function getStoredState() {
  const [state] = await db
    .select()
    .from(indraSyncStates)
    .where(eq(indraSyncStates.integration, INTEGRATION_KEY));
  return state;
}

async function claimDeliveryLease() {
  const now = new Date();
  const leaseId = randomUUID();
  const leaseUntil = new Date(now.getTime() + DELIVERY_LEASE_MS);
  const claimed = await db
    .insert(indraSyncStates)
    .values({
      integration: INTEGRATION_KEY,
      lastAttemptedAt: now,
      lastError: null,
      leaseId,
      leaseUntil,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: indraSyncStates.integration,
      set: {
        lastAttemptedAt: now,
        lastError: null,
        leaseId,
        leaseUntil,
        updatedAt: now,
      },
      where: or(
        isNull(indraSyncStates.leaseUntil),
        lte(indraSyncStates.leaseUntil, now),
      ),
    })
    .returning({ leaseId: indraSyncStates.leaseId });
  return claimed[0]?.leaseId === leaseId ? leaseId : null;
}

async function completeDeliveryLease(leaseId: string, checkpointAt: Date, deliveryId: string) {
  await db
    .update(indraSyncStates)
    .set({
      lastSuccessfulAt: checkpointAt,
      lastDeliveryId: deliveryId,
      lastError: null,
      leaseId: null,
      leaseUntil: null,
      updatedAt: new Date(),
    })
    .where(and(
      eq(indraSyncStates.integration, INTEGRATION_KEY),
      eq(indraSyncStates.leaseId, leaseId),
    ));
}

async function failDeliveryLease(leaseId: string, error: string) {
  await db
    .update(indraSyncStates)
    .set({
      lastError: error,
      leaseId: null,
      leaseUntil: null,
      updatedAt: new Date(),
    })
    .where(and(
      eq(indraSyncStates.integration, INTEGRATION_KEY),
      eq(indraSyncStates.leaseId, leaseId),
    ));
}

async function getPushState(): Promise<PushState> {
  const stored = await getStoredState();
  const intervalMinutes = Number.parseInt(process.env.INDRA_PUSH_INTERVAL_MINUTES || "0", 10) || 0;
  const target = process.env.INDRA_PUSH_URL || DEFAULT_PUSH_URL;
  const targetConfigured = isAllowedPushUrl(target);
  const pushSecretConfigured = Boolean(process.env.INDRA_PUSH_SECRET);
  return {
    enabled: process.env.INDRA_PUSH_ENABLED === "true" && targetConfigured && pushSecretConfigured && intervalMinutes >= 5,
    intervalMinutes,
    targetConfigured,
    tokenConfigured: Boolean(process.env.INDRA_API_TOKEN),
    pushSecretConfigured,
    lastAttemptedAt: stored?.lastAttemptedAt ?? null,
    lastSuccessfulAt: stored?.lastSuccessfulAt ?? null,
    lastDeliveryId: stored?.lastDeliveryId ?? null,
    lastError: stored?.lastError ?? null,
  };
}

async function buildPushPayload(since: Date | null, checkpointAt: Date, deliveryId: string) {
  const leadWhere = since
    ? gte(walkinLeads.updatedAt, since)
    : undefined;
  const inquiryWhere = since ? gte(inquiries.createdAt, since) : undefined;
  const callbackWhere = since ? gte(callbackRequests.createdAt, since) : undefined;
  const brochureWhere = since ? gte(brochureRequests.requestedAt, since) : undefined;
  const careerWhere = since ? gte(careerApplications.createdAt, since) : undefined;
  // Friendship School records are altered and removed by sheet reconciliation
  // without a durable update timestamp. A declared snapshot keeps the receiver
  // correct for both edits and removals.
  const friendshipLeadWhere = undefined;

  const [
    leads,
    inquiriesRows,
    callbackRows,
    brochureRows,
    careerRows,
    friendshipLeadRows,
    branches,
    staff,
    programs,
    sources,
    statuses,
    closeReasons,
    schools,
    databaseBlogs,
  ] = await Promise.all([
    db.select().from(walkinLeads).where(leadWhere).orderBy(desc(walkinLeads.updatedAt)),
    db.select().from(inquiries).where(inquiryWhere).orderBy(desc(inquiries.createdAt)),
    db.select().from(callbackRequests).where(callbackWhere).orderBy(desc(callbackRequests.createdAt)),
    db.select().from(brochureRequests).where(brochureWhere).orderBy(desc(brochureRequests.requestedAt)),
    db.select().from(careerApplications).where(careerWhere).orderBy(desc(careerApplications.createdAt)),
    db.select().from(friendshipSchoolLeads).where(friendshipLeadWhere).orderBy(desc(friendshipSchoolLeads.submittedAt)),
    db.select().from(walkinBranches).orderBy(walkinBranches.name),
    db.select().from(walkinStaff).orderBy(walkinStaff.sortOrder),
    db.select().from(walkinPrograms).orderBy(walkinPrograms.sortOrder),
    db.select().from(walkinSources).orderBy(walkinSources.sortOrder),
    db.select().from(walkinStatuses).orderBy(walkinStatuses.sortOrder),
    db.select().from(walkinCloseReasons).orderBy(walkinCloseReasons.sortOrder),
    db.select().from(friendshipSchools).orderBy(friendshipSchools.name),
    db.select().from(blogPostsTable).orderBy(desc(blogPostsTable.publishedAt)),
  ]);

  return {
    apiVersion: API_VERSION,
    source: "rainbow-international-school",
    delivery: {
      id: deliveryId,
      type: since ? "incremental" : "initial",
      since: since?.toISOString() ?? null,
      checkpointAt: checkpointAt.toISOString(),
    },
    datasets: {
      crm: {
        leads: leads.map(sanitizeLead),
        branches: branches.map(sanitizeBranch),
        staff: staff.map(sanitizeStaff),
        lookups: {
          programs: programs.map(sanitizeLookup),
          sources: sources.map(sanitizeLookup),
          statuses: statuses.map(sanitizeLookup),
          closeReasons: closeReasons.map(sanitizeLookup),
        },
      },
      website: {
        inquiries: inquiriesRows.map(sanitizeInquiry),
        callbackRequests: callbackRows.map(sanitizeCallbackRequest),
        brochureRequests: brochureRows.map(sanitizeBrochureRequest),
        careerApplications: careerRows.map(sanitizeCareerApplication),
      },
      friendship: {
        mode: "snapshot",
        schools: schools.map(sanitizeFriendshipSchool),
        leads: friendshipLeadRows.map(sanitizeFriendshipLead),
      },
      content: {
        mode: "snapshot",
        blogPosts: databaseBlogs,
        codeOwnedBlogs: CODE_OWNED_BLOGS,
      },
    },
  };
}

export async function runIndraPush(): Promise<{ deliveryId: string; sent: boolean; reason?: string }> {
  const pushUrl = process.env.INDRA_PUSH_URL || DEFAULT_PUSH_URL;
  const pushSecret = process.env.INDRA_PUSH_SECRET;
  if (process.env.INDRA_PUSH_ENABLED !== "true" || !pushSecret || !isAllowedPushUrl(pushUrl)) {
    return { deliveryId: "", sent: false, reason: "Indra delivery is not configured" };
  }

  const leaseId = await claimDeliveryLease();
  if (!leaseId) {
    return { deliveryId: "", sent: false, reason: "Another Indra delivery is already running" };
  }

  const checkpointAt = new Date();
  const deliveryId = randomUUID();

  try {
    const state = await getStoredState();
    const payload = await buildPushPayload(state?.lastSuccessfulAt ?? null, checkpointAt, deliveryId);
    const body = JSON.stringify(payload);
    const signature = createHmac("sha256", pushSecret).update(body).digest("hex");
    let lastFailure = "";

    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        const response = await fetch(pushUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Indra-Delivery-Id": deliveryId,
            "X-Indra-Signature": `sha256=${signature}`,
            "User-Agent": "Rainbow-Indra-Bridge/1.0",
          },
          body,
          signal: AbortSignal.timeout(15_000),
        });
        if (!response.ok) throw new Error(`Receiver returned ${response.status}`);
        await completeDeliveryLease(leaseId, checkpointAt, deliveryId);
        return { deliveryId, sent: true };
      } catch (error) {
        lastFailure = safeErrorMessage(error);
        if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, attempt * 750));
      }
    }
    throw new Error(lastFailure || "Delivery failed");
  } catch (error) {
    const message = safeErrorMessage(error);
    await failDeliveryLease(leaseId, message);
    return { deliveryId, sent: false, reason: message };
  }
}

export function startIndraPushScheduler() {
  if (schedulerStarted) return;
  schedulerStarted = true;
  const intervalMinutes = Number.parseInt(process.env.INDRA_PUSH_INTERVAL_MINUTES || "0", 10) || 0;
  if (process.env.INDRA_PUSH_ENABLED !== "true" || intervalMinutes < 5) {
    console.log("[indra] Scheduled delivery disabled. Enable it only after the Indra receiver and shared secret are configured.");
    return;
  }
  const run = async () => {
    const result = await runIndraPush();
    if (!result.sent && result.reason !== "Indra delivery is not configured") {
      console.warn(`[indra] Scheduled delivery failed: ${result.reason}`);
    }
  };
  setTimeout(() => void run(), 10_000);
  setInterval(() => void run(), intervalMinutes * 60_000);
  console.log(`[indra] Scheduled delivery enabled every ${intervalMinutes} minute(s).`);
}

export function registerIndraIntegrationRoutes(app: Express) {
  app.use("/api/indra/v1", rateLimitIndra, requireIndraToken);

  const sendCatalog = (_req: Request, res: Response) => {
    res.json(envelope("catalog", {
      crm: ["leads", "reference", "summary", "admissions"],
      website: ["inquiries", "callback-requests", "brochure-requests", "career-applications"],
      friendship: ["schools", "leads"],
      content: ["blogs"],
      excluded: [
        "resume files and contents",
        "branch PINs",
        "friendship school tokens",
        "all API keys, session data, credentials, and database connection values",
        "unstructured internal remarks and messages",
      ],
    }));
  };

  // Make the documented base URL useful for clients that probe it before
  // selecting a dataset. `/catalog` remains the explicit discovery route.
  app.get("/api/indra/v1", sendCatalog);
  app.get("/api/indra/v1/catalog", sendCatalog);

  app.get("/api/indra/v1/health", async (_req, res) => {
    const status = await getPushState();
    res.json(envelope("health", status));
  });

  app.get("/api/indra/v1/crm/leads", async (req, res) => {
    try {
      const { page, pageSize, offset } = parsePage(req);
      const brand = parseOptionalBrand(req.query.brand);
      const branchId = parseOptionalPositiveInteger(req.query.branchId, "branchId");
      const updatedSince = parseDate(req.query.updatedSince, "updatedSince");
      const academicYear = parseOptionalAcademicYear(req.query.academicYear);
      const includeArchived = parseBoolean(req.query.includeArchived);
      const conditions: any[] = [];
      if (brand) conditions.push(eq(walkinLeads.brand, brand));
      if (branchId) conditions.push(eq(walkinLeads.branchId, branchId));
      if (updatedSince) conditions.push(gte(walkinLeads.updatedAt, updatedSince));
      if (academicYear) conditions.push(eq(walkinLeads.academicYear, academicYear));
      if (!includeArchived) conditions.push(eq(walkinLeads.isArchived, false));
      const where = conditions.length ? and(...conditions) : undefined;
      const [rows, [{ total }]] = await Promise.all([
        db.select().from(walkinLeads).where(where).orderBy(desc(walkinLeads.updatedAt)).limit(pageSize).offset(offset),
        db.select({ total: sql<number>`cast(count(*) as int)` }).from(walkinLeads).where(where),
      ]);
      res.json(envelope("crm.leads", rows.map(sanitizeLead), { page, pageSize, offset, total }));
    } catch (error) {
      res.status(400).json({ message: safeErrorMessage(error) });
    }
  });

  app.get("/api/indra/v1/crm/reference", async (req, res) => {
    try {
      const brand = parseOptionalBrand(req.query.brand);
      const activeOnly = !parseBoolean(req.query.includeInactive);
      const filterByBrand = (table: any) => and(
        activeOnly ? eq(table.isActive, true) : undefined,
        brand ? sql`(${table.brand} = ${brand} OR ${table.brand} IS NULL)` : undefined,
      );
      const [branches, staff, programs, sources, statuses, closeReasons] = await Promise.all([
        db.select().from(walkinBranches).where(and(
          activeOnly ? eq(walkinBranches.isActive, true) : undefined,
          brand ? eq(walkinBranches.brand, brand) : undefined,
        )).orderBy(walkinBranches.name),
        db.select().from(walkinStaff).where(filterByBrand(walkinStaff)).orderBy(walkinStaff.sortOrder),
        db.select().from(walkinPrograms).where(filterByBrand(walkinPrograms)).orderBy(walkinPrograms.sortOrder),
        db.select().from(walkinSources).where(filterByBrand(walkinSources)).orderBy(walkinSources.sortOrder),
        db.select().from(walkinStatuses).where(filterByBrand(walkinStatuses)).orderBy(walkinStatuses.sortOrder),
        db.select().from(walkinCloseReasons).where(filterByBrand(walkinCloseReasons)).orderBy(walkinCloseReasons.sortOrder),
      ]);
      res.json(envelope("crm.reference", {
        branches: branches.map(sanitizeBranch),
        staff: staff.map(sanitizeStaff),
        programs: programs.map(sanitizeLookup),
        sources: sources.map(sanitizeLookup),
        statuses: statuses.map(sanitizeLookup),
        closeReasons: closeReasons.map(sanitizeLookup),
      }));
    } catch (error) {
      res.status(400).json({ message: safeErrorMessage(error) });
    }
  });

  app.get("/api/indra/v1/crm/summary", async (req, res) => {
    try {
      const brand = parseOptionalBrand(req.query.brand);
      const academicYear = parseOptionalAcademicYear(req.query.academicYear);
      const where = and(
        eq(walkinLeads.isArchived, false),
        academicYear ? eq(walkinLeads.academicYear, academicYear) : undefined,
        brand ? eq(walkinLeads.brand, brand) : undefined,
      );
      const [byBrand, byStatus, bySource] = await Promise.all([
        db.select({ brand: walkinLeads.brand, total: sql<number>`cast(count(*) as int)` })
          .from(walkinLeads).where(where).groupBy(walkinLeads.brand),
        db.select({ status: walkinLeads.status, total: sql<number>`cast(count(*) as int)` })
          .from(walkinLeads).where(where).groupBy(walkinLeads.status),
        db.select({ source: walkinLeads.source, total: sql<number>`cast(count(*) as int)` })
          .from(walkinLeads).where(where).groupBy(walkinLeads.source),
      ]);
      res.json(envelope("crm.summary", { academicYear, byBrand, byStatus, bySource }));
    } catch (error) {
      res.status(400).json({ message: safeErrorMessage(error) });
    }
  });

  app.get("/api/indra/v1/crm/admissions", async (req, res) => {
    try {
      const academicYear = parseAcademicYear(req.query.academicYear);
      const requestedBrand = String(req.query.brand || "BOTH").toUpperCase();
      if (requestedBrand !== "RIS" && requestedBrand !== "RPS" && requestedBrand !== "BOTH") {
        throw new Error("brand must be RIS, RPS, or BOTH");
      }
      const branchId = parseOptionalPositiveInteger(req.query.branchId, "branchId");
      const brandFilter = requestedBrand === "BOTH" ? null : requestedBrand as "RIS" | "RPS";
      const conditions: any[] = [
        eq(walkinLeads.academicYear, academicYear),
        eq(walkinLeads.isArchived, false),
      ];
      if (brandFilter) conditions.push(eq(walkinLeads.brand, brandFilter));
      else conditions.push(or(eq(walkinLeads.brand, "RIS"), eq(walkinLeads.brand, "RPS")));
      if (branchId) conditions.push(eq(walkinLeads.branchId, branchId));

      const rows = await db
        .select({
          brand: walkinLeads.brand,
          status: walkinLeads.status,
          monthLabel: walkinLeads.monthLabel,
          branchId: walkinLeads.branchId,
          source: walkinLeads.source,
        })
        .from(walkinLeads)
        .where(and(...conditions));

      const brands = brandFilter
        ? [aggregateAdmissionsRows(rows, brandFilter, academicYear)]
        : (["RIS", "RPS"] as const).map((brand) =>
            aggregateAdmissionsRows(rows.filter((row) => row.brand === brand), brand, academicYear),
          );
      const combined = aggregateAdmissionsRows(rows, "RIS+RPS", academicYear);

      res.json(envelope("crm.admissions", {
        academicYear,
        requestedBrand,
        admissionDefinition: {
          status: "ADMISSION DONE",
          countedAsAdmission: "A non-archived walk-in lead whose current status is exactly ADMISSION DONE.",
          countedAsWalkIn: ["WALK-IN COMPLETED", "ADMISSION DONE"],
          sourceTable: "walkin_leads",
        },
        brands,
        combined,
      }));
    } catch (error) {
      res.status(400).json({ message: safeErrorMessage(error) });
    }
  });

  app.get("/api/indra/v1/website/:dataset", async (req, res) => {
    try {
      const { page, pageSize, offset } = parsePage(req);
      const createdSince = parseDate(req.query.createdSince, "createdSince");
      const dataset = req.params.dataset;
      let table: any;
      let timestampColumn: any;
      let mapper: (row: any) => unknown = (row) => row;
      if (dataset === "inquiries") {
        table = inquiries; timestampColumn = inquiries.createdAt; mapper = sanitizeInquiry;
      } else if (dataset === "callback-requests") {
        table = callbackRequests; timestampColumn = callbackRequests.createdAt; mapper = sanitizeCallbackRequest;
      } else if (dataset === "brochure-requests") {
        table = brochureRequests; timestampColumn = brochureRequests.requestedAt; mapper = sanitizeBrochureRequest;
      } else if (dataset === "career-applications") {
        table = careerApplications; timestampColumn = careerApplications.createdAt; mapper = sanitizeCareerApplication;
      } else {
        return res.status(404).json({ message: "Unknown website dataset" });
      }
      const where = createdSince ? gte(timestampColumn, createdSince) : undefined;
      const [rows, [{ total }]] = await Promise.all([
        db.select().from(table).where(where).orderBy(desc(timestampColumn)).limit(pageSize).offset(offset),
        db.select({ total: sql<number>`cast(count(*) as int)` }).from(table).where(where),
      ]);
      res.json(envelope(`website.${dataset}`, rows.map(mapper), { page, pageSize, offset, total: Number(total) }));
    } catch (error) {
      res.status(400).json({ message: safeErrorMessage(error) });
    }
  });

  app.get("/api/indra/v1/friendship/:dataset", async (req, res) => {
    try {
      const { page, pageSize, offset } = parsePage(req);
      const dataset = req.params.dataset;
      if (dataset === "schools") {
        const [rows, [{ total }]] = await Promise.all([
          db.select().from(friendshipSchools).orderBy(friendshipSchools.name).limit(pageSize).offset(offset),
          db.select({ total: sql<number>`cast(count(*) as int)` }).from(friendshipSchools),
        ]);
        return res.json(envelope("friendship.schools", rows.map(sanitizeFriendshipSchool), { page, pageSize, offset, total: Number(total) }));
      }
      if (dataset === "leads") {
        const createdSince = parseDate(req.query.createdSince, "createdSince");
        const where = createdSince ? gte(friendshipSchoolLeads.submittedAt, createdSince) : undefined;
        const [rows, [{ total }]] = await Promise.all([
          db.select().from(friendshipSchoolLeads).where(where).orderBy(desc(friendshipSchoolLeads.submittedAt)).limit(pageSize).offset(offset),
          db.select({ total: sql<number>`cast(count(*) as int)` }).from(friendshipSchoolLeads).where(where),
        ]);
        return res.json(envelope("friendship.leads", rows.map(sanitizeFriendshipLead), { page, pageSize, offset, total: Number(total) }));
      }
      res.status(404).json({ message: "Unknown friendship dataset" });
    } catch (error) {
      res.status(400).json({ message: safeErrorMessage(error) });
    }
  });

  app.get("/api/indra/v1/content/blogs", async (req, res) => {
    try {
      const { page, pageSize, offset } = parsePage(req);
      const publishedSince = parseDate(req.query.publishedSince, "publishedSince");
      const rows = await db.select().from(blogPostsTable).orderBy(desc(blogPostsTable.publishedAt));
      const all = [
        ...rows,
        ...CODE_OWNED_BLOGS.map((blog) => ({ ...blog, source: "code-owned" })),
      ]
        .filter((blog: any) => !publishedSince || new Date(blog.publishedAt).getTime() >= publishedSince.getTime())
        .sort((a: any, b: any) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
      res.json(envelope("content.blogs", all.slice(offset, offset + pageSize), { page, pageSize, offset, total: all.length }));
    } catch (error) {
      res.status(400).json({ message: safeErrorMessage(error) });
    }
  });
}