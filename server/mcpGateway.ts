import type { Express, NextFunction, Request, Response } from "express";
import { createHash, randomUUID, timingSafeEqual } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { mcpAuditLogs, mcpIdempotencyKeys } from "@shared/schema";

const MAX_REQUESTS_PER_MINUTE = 120;
const SESSION_TTL_MS = 30 * 60_000;

type McpSession = {
  transport: StreamableHTTPServerTransport;
  server: McpServer;
  lastUsedAt: number;
};

const sessions = new Map<string, McpSession>();
const requestWindows = new Map<string, { startedAt: number; count: number }>();

function jsonResult(data: unknown, isError = false) {
  return {
    ...(isError ? { isError: true } : {}),
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

function redact(value: unknown, key = ""): unknown {
  if (/(token|secret|password|pin|phone|email|name|owner|remark|content|body)/i.test(key)) {
    return "[redacted]";
  }
  if (Array.isArray(value)) return value.map((item) => redact(item));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([childKey, childValue]) => [
        childKey,
        redact(childValue, childKey),
      ]),
    );
  }
  return value;
}

function affectedResource(args: unknown) {
  if (!args || typeof args !== "object") return null;
  const record = args as Record<string, unknown>;
  for (const key of ["leadId", "branchId", "staffId", "valueId", "slug", "brand"]) {
    if (record[key] !== undefined) return `${key}:${String(record[key])}`;
  }
  return null;
}

function failureCategory(message: string, outcome: "started" | "success" | "error" | "blocked") {
  if (outcome === "started" || outcome === "success") return null;
  if (outcome === "blocked") return "confirmation_required";
  if (/^401|unauthorized/i.test(message)) return "unauthorized";
  if (/^404/.test(message)) return "not_found";
  if (/^400|validation|required|invalid/i.test(message)) return "validation_failed";
  if (/^5\d\d|configured|fetch|timeout|upstream/i.test(message)) return "upstream_unavailable";
  return "operation_failed";
}

async function writeAudit(input: {
  tool: string;
  outcome: "started" | "success" | "error" | "blocked";
  args: unknown;
  requestId: string;
  durationMs: number;
  message?: string;
}) {
  const event = {
    at: new Date().toISOString(),
    principal: "mcp-bearer",
    requestId: input.requestId,
    tool: input.tool,
    outcome: input.outcome,
    durationMs: input.durationMs,
    affectedResource: affectedResource(input.args),
    arguments: redact(input.args),
    category: failureCategory(input.message || "", input.outcome),
  };
  console.info(`[mcp-audit] ${JSON.stringify(event)}`);
  await db.insert(mcpAuditLogs).values({
    principal: event.principal,
    requestId: event.requestId,
    tool: event.tool,
    outcome: event.outcome,
    failureCategory: event.category,
    resourceId: event.affectedResource,
    durationMs: event.durationMs,
    argumentsRedacted: event.arguments,
  });
}

function requireMcpToken(req: Request, res: Response, next: NextFunction) {
  if (process.env.MCP_ENABLED !== "true") {
    res.status(404).json({ error: "MCP gateway is disabled" });
    return;
  }

  const expected = process.env.MCP_ADMIN_TOKEN;
  const authorization = req.header("authorization") || "";
  const provided = authorization.replace(/^Bearer\s+/i, "");
  if (!expected) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (!provided || provided.length !== expected.length) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    if (!timingSafeEqual(Buffer.from(provided), Buffer.from(expected))) throw new Error("token mismatch");
  } catch {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const clientKey = req.ip || "unknown";
  const now = Date.now();
  const window = requestWindows.get(clientKey);
  if (!window || now - window.startedAt >= 60_000) {
    requestWindows.set(clientKey, { startedAt: now, count: 1 });
  } else if (window.count >= MAX_REQUESTS_PER_MINUTE) {
    res.setHeader("Retry-After", "60");
    res.status(429).json({ error: "Rate limit exceeded" });
    return;
  } else {
    window.count += 1;
  }
  next();
}

function requireConfirmation(args: { confirm?: boolean }, description: string) {
  if (args.confirm !== true) {
    throw new Error(`${description} requires confirm: true after the user has reviewed the impact.`);
  }
}

async function withIdempotency(
  tool: string,
  idempotencyKey: string,
  payload: unknown,
  operation: () => Promise<unknown>,
) {
  const principal = "mcp-bearer";
  const recordId = `${principal}:${tool}:${idempotencyKey}`;
  const fingerprint = createHash("sha256").update(JSON.stringify(payload)).digest("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60_000);
  const [created] = await db.insert(mcpIdempotencyKeys).values({
    id: recordId,
    principal,
    tool,
    fingerprint,
    expiresAt,
  }).onConflictDoNothing().returning();

  if (!created) {
    const [existing] = await db.select().from(mcpIdempotencyKeys)
      .where(eq(mcpIdempotencyKeys.id, recordId)).limit(1);
    if (!existing) throw new Error("Unable to reserve the idempotency key. Retry with a new key.");
    if (existing.expiresAt < new Date()) {
      await db.delete(mcpIdempotencyKeys).where(eq(mcpIdempotencyKeys.id, recordId));
      return withIdempotency(tool, idempotencyKey, payload, operation);
    }
    if (existing.fingerprint !== fingerprint) {
      throw new Error("This idempotency key was already used for a different request.");
    }
    if (existing.state === "completed") return existing.result;
    throw new Error("This operation is already in progress. Do not retry with a new key.");
  }

  let dispatched = false;
  try {
    // From this point onward the underlying route may have committed even if a
    // network or response error is observed. Keep the reservation on any error
    // after dispatch so a retry cannot repeat a high-impact side effect.
    dispatched = true;
    const result = await operation();
    await db.update(mcpIdempotencyKeys)
      .set({ state: "completed", result, completedAt: new Date() })
      .where(eq(mcpIdempotencyKeys.id, recordId));
    return result;
  } catch (error) {
    if (dispatched) {
      await db.update(mcpIdempotencyKeys)
        .set({ state: "reconciliation_required" })
        .where(eq(mcpIdempotencyKeys.id, recordId))
        .catch((updateError) => console.error("[mcp-idempotency] unable to retain reconciliation state", updateError));
    } else {
      await db.delete(mcpIdempotencyKeys).where(eq(mcpIdempotencyKeys.id, recordId));
    }
    throw error;
  }
}

function internalOrigin() {
  return `http://127.0.0.1:${process.env.PORT || "5000"}`;
}

async function callInternal(
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE",
  path: string,
  body?: unknown,
  credential: "admin" | "indra" = "admin",
) {
  const token = credential === "admin" ? process.env.ADMIN_TOKEN : process.env.INDRA_API_TOKEN;
  if (!token) {
    throw new Error(`Required ${credential} application credential is not configured.`);
  }
  const response = await fetch(`${internalOrigin()}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const text = await response.text();
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { message: text };
  }
  if (!response.ok) {
    throw new Error(`${response.status}: ${typeof data === "object" && data ? JSON.stringify(data) : "Request failed"}`);
  }
  return data;
}

function query(params: Record<string, string | number | boolean | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) search.set(key, String(value));
  }
  const output = search.toString();
  return output ? `?${output}` : "";
}

const blogPostInputSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  metaTitle: z.string().min(1),
  metaDescription: z.string().min(1),
  keywords: z.string().optional(),
  date: z.string().min(1),
  cat: z.string().min(1),
  thumbUrl: z.string().optional().nullable(),
  heroUrl: z.string().optional(),
  intro: z.string().optional(),
  sections: z.array(z.object({
    heading: z.string().optional(),
    body: z.string(),
    list: z.array(z.string()).optional(),
  })).optional(),
  conclusion: z.string().optional(),
  relatedSlugs: z.array(z.string()).optional(),
  internalLinks: z.array(z.object({ label: z.string(), href: z.string() })).optional(),
  faqs: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
});

function createMcpServer() {
  const server = new McpServer({
    name: "rainbow-operations",
    version: "1.0.0",
  });

  const tool = (
    name: string,
    description: string,
    inputSchema: Record<string, z.ZodTypeAny>,
    handler: (args: any) => Promise<unknown>,
    readOnlyHint = false,
  ) => server.registerTool(name, {
    title: name.replace(/_/g, " "),
    description,
    inputSchema,
    annotations: { readOnlyHint, destructiveHint: !readOnlyHint, openWorldHint: false },
  }, async (args) => {
    const requestId = randomUUID();
    const startedAt = Date.now();
    try {
      await writeAudit({ tool: name, outcome: "started", args, requestId, durationMs: 0 });
    } catch (error) {
      console.error("[mcp-audit] unable to record operation start", error);
      return jsonResult({ ok: false, error: "Operation temporarily unavailable. Please retry later." }, true);
    }
    try {
      const result = await handler(args);
      await writeAudit({ tool: name, outcome: "success", args, requestId, durationMs: Date.now() - startedAt })
        .catch((error) => console.error("[mcp-audit] unable to finalize operation audit", error));
      return jsonResult({ ok: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Operation failed";
      const outcome = /requires confirm: true/.test(message) ? "blocked" : "error";
      await writeAudit({
        tool: name,
        outcome,
        args,
        requestId,
        durationMs: Date.now() - startedAt,
        message,
      }).catch((auditError) => console.error("[mcp-audit] failed to record tool error", auditError));
      return jsonResult({ ok: false, error: message }, true);
    }
  });

  tool("dashboard_overview", "Read the live cross-school operational overview.", {
    academicYear: z.string().regex(/^\d{4}-\d{2}$/),
    brand: z.enum(["RIS", "RPS"]).optional(),
    branchId: z.number().int().positive().optional(),
  }, (args) => callInternal("GET", `/api/indra/v1/dashboard/overview${query(args)}`, undefined, "indra"), true);

  tool("dashboard_academic_years", "Discover the academic years and reporting-provider availability before requesting a report.", {}, () =>
    callInternal("GET", "/api/indra/v1/dashboard/academic-years", undefined, "indra"), true);

  tool("dashboard_reports", "Read approved aggregate dashboard providers for an academic year. Unavailable providers remain explicit and are never converted to zero.", {
    academicYear: z.union([z.string().regex(/^\d{4}-\d{2}$/), z.literal("all")]),
  }, ({ academicYear }) => callInternal(
    "GET",
    `/api/indra/v1/dashboard/reports${query({ academicYear })}`,
    undefined,
    "indra",
  ), true);

  tool("crm_admissions_report", "Read admissions, bookings, walk-ins, and conversion metrics.", {
    academicYear: z.string().regex(/^\d{4}-\d{2}$/),
    brand: z.enum(["RIS", "RPS"]).optional(),
    branchId: z.number().int().positive().optional(),
  }, (args) => callInternal("GET", `/api/indra/v1/crm/admissions-performance${query(args)}`, undefined, "indra"), true);

  tool("crm_summary_report", "Read current CRM totals by brand, status, and source.", {
    academicYear: z.string().regex(/^\d{4}-\d{2}$/).optional(),
    brand: z.enum(["RIS", "RPS"]).optional(),
  }, (args) => callInternal("GET", `/api/indra/v1/crm/summary${query(args)}`, undefined, "indra"), true);

  tool("marketing_live_report", "Read the live marketing dashboard data for approved school reporting.", {}, () =>
    callInternal("GET", "/api/marketing/live"), true);

  tool("marketing_monthly_report", "Read the approved monthly marketing-spend series.", {}, () =>
    callInternal("GET", "/api/marketing/monthly"), true);

  tool("ris_sales_report", "Read the live RIS sales dashboard report.", {
    academicYear: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  }, (args) => callInternal("GET", `/api/sales/live${query(args)}`), true);

  tool("rps_sales_report", "Read the live RPS sales dashboard report.", {
    academicYear: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  }, (args) => callInternal("GET", `/api/rps-sales/live${query(args)}`), true);

  tool("seo_check", "Run the existing validated SEO check and return its latest report.", {
    confirm: z.boolean().optional(),
    idempotencyKey: z.string().min(8).max(128),
  }, async ({ confirm, idempotencyKey }) => {
    requireConfirmation({ confirm }, "Running an SEO check");
    return withIdempotency("seo_check", idempotencyKey, {}, () =>
      callInternal("POST", "/api/admin/seo-check"));
  });

  tool("crm_list_leads", "List CRM leads with the approved filters. Returns personal data only for this explicit administrative tool.", {
    academicYear: z.string().regex(/^\d{4}-\d{2}$/).optional(),
    brand: z.enum(["RIS", "RPS"]).optional(),
    branchId: z.number().int().positive().optional(),
    includeArchived: z.boolean().optional(),
    page: z.number().int().positive().max(10000).optional(),
    pageSize: z.number().int().positive().max(200).optional(),
  }, (args) => callInternal("GET", `/api/indra/v1/crm/leads${query(args)}`, undefined, "indra"), true);

  tool("crm_get_lead", "Get a single CRM lead and its current values.", {
    leadId: z.string().uuid(),
  }, ({ leadId }) => callInternal("GET", `/api/walkin/leads/${encodeURIComponent(leadId)}`), true);

  tool("crm_lead_history", "Read the existing audit history for a CRM lead.", {
    leadId: z.string().uuid(),
  }, ({ leadId }) => callInternal("GET", `/api/walkin/leads/${encodeURIComponent(leadId)}/history`), true);

  tool("crm_create_lead", "Create a CRM lead using the application’s existing validation and duplicate reporting.", {
    lead: z.object({
      brand: z.enum(["RIS", "RPS"]),
      branchId: z.number().int().positive().optional(),
      academicYear: z.string().regex(/^\d{4}-\d{2}$/).optional(),
      enquiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      parentName: z.string().min(2),
      motherName: z.string().min(2),
      childName: z.string().min(2),
      phone: z.string().min(1),
      altPhone: z.string().min(1),
      email: z.string().email().optional(),
      program: z.string().min(1),
      source: z.string().min(1),
      status: z.string().optional(),
      closeReason: z.string().optional(),
      remark: z.string().optional(),
      leadOwner: z.string().optional(),
      walkInDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      revisitDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    }),
    idempotencyKey: z.string().min(8).max(128),
  }, ({ lead, idempotencyKey }) => withIdempotency("crm_create_lead", idempotencyKey, lead, () =>
    callInternal("POST", "/api/walkin/leads", { ...lead, createdBy: "mcp" })));

  tool("crm_update_lead", "Update a CRM lead using the application’s existing validations and audit trail.", {
    leadId: z.string().uuid(),
    changes: z.object({
      parentName: z.string().min(1).optional(),
      motherName: z.string().optional().nullable(),
      childName: z.string().min(1).optional(),
      altPhone: z.string().optional().nullable(),
      email: z.string().email().optional().nullable(),
      program: z.string().min(1).optional(),
      source: z.string().min(1).optional(),
      status: z.string().min(1).optional(),
      closeReason: z.string().optional().nullable(),
      remark: z.string().optional().nullable(),
      leadOwner: z.string().optional().nullable(),
      walkInDate: z.string().optional().nullable(),
      revisitDate: z.string().optional().nullable(),
      revisitDate2: z.string().optional().nullable(),
      branchId: z.number().int().positive().optional().nullable(),
      misCallingRemarks: z.string().optional().nullable(),
    }).refine((value) => Object.keys(value).length > 0, "At least one change is required"),
    idempotencyKey: z.string().min(8).max(128),
  }, ({ leadId, changes, idempotencyKey }) => withIdempotency(
    "crm_update_lead",
    idempotencyKey,
    { leadId, changes },
    () => callInternal("PATCH", `/api/walkin/leads/${encodeURIComponent(leadId)}`, {
      ...changes,
      updatedBy: "mcp",
    }),
  ));

  tool("crm_archive_lead", "Archive a lead and remove it from the synchronized sheets. This action is not reversible through this tool.", {
    leadId: z.string().uuid(),
    confirm: z.boolean().optional(),
    idempotencyKey: z.string().min(8).max(128),
  }, async ({ leadId, confirm, idempotencyKey }) => {
    requireConfirmation({ confirm }, "Archiving a lead");
    return withIdempotency("crm_archive_lead", idempotencyKey, { leadId }, () =>
      callInternal("POST", `/api/walkin/leads/${encodeURIComponent(leadId)}/archive`, { archivedBy: "mcp" }));
  });

  tool("crm_reference_data", "Read branches, staff, programs, sources, statuses, and close reasons.", {
    brand: z.enum(["RIS", "RPS"]).optional(),
    includeInactive: z.boolean().optional(),
  }, (args) => callInternal("GET", `/api/indra/v1/crm/reference${query(args)}`, undefined, "indra"), true);

  tool("crm_create_branch", "Create a new CRM branch.", {
    name: z.string().min(2),
    brand: z.enum(["RIS", "RPS"]),
    code: z.string().min(2).regex(/^[a-z0-9-]+$/),
    pin: z.string().min(4).max(8).optional(),
    isActive: z.boolean().optional(),
    idempotencyKey: z.string().min(8).max(128),
  }, ({ idempotencyKey, ...branch }) => withIdempotency(
    "crm_create_branch",
    idempotencyKey,
    branch,
    () => callInternal("POST", "/api/walkin/branches", branch),
  ));

  tool("crm_update_branch", "Change a branch name, kiosk PIN, or active status.", {
    branchId: z.number().int().positive(),
    name: z.string().min(2).optional(),
    pin: z.string().min(4).max(8).optional(),
    isActive: z.boolean().optional(),
    confirm: z.boolean().optional(),
    idempotencyKey: z.string().min(8).max(128),
  }, ({ branchId, confirm, idempotencyKey, ...changes }) => {
    if (changes.isActive === false) requireConfirmation({ confirm }, "Deactivating a branch");
    return withIdempotency(
      "crm_update_branch",
      idempotencyKey,
      { branchId, changes },
      () => callInternal("PATCH", `/api/walkin/branches/${branchId}`, changes),
    );
  });

  tool("crm_delete_branch", "Permanently delete an unused branch. The application will reject branches that still have leads or staff.", {
    branchId: z.number().int().positive(),
    confirm: z.boolean().optional(),
    idempotencyKey: z.string().min(8).max(128),
  }, async ({ branchId, confirm, idempotencyKey }) => {
    requireConfirmation({ confirm }, "Deleting a branch");
    return withIdempotency("crm_delete_branch", idempotencyKey, { branchId }, () =>
      callInternal("DELETE", `/api/walkin/branches/${branchId}`));
  });

  tool("crm_create_staff", "Create a CRM staff member.", {
    name: z.string().min(2),
    brand: z.enum(["RIS", "RPS"]).nullable().optional(),
    branchId: z.number().int().positive().nullable().optional(),
    sortOrder: z.number().int().optional(),
    idempotencyKey: z.string().min(8).max(128),
  }, ({ idempotencyKey, ...staff }) => withIdempotency(
    "crm_create_staff",
    idempotencyKey,
    staff,
    () => callInternal("POST", "/api/walkin/staff", staff),
  ));

  tool("crm_update_staff", "Update or deactivate a CRM staff member.", {
    staffId: z.number().int().positive(),
    name: z.string().min(2).optional(),
    brand: z.enum(["RIS", "RPS"]).nullable().optional(),
    branchId: z.number().int().positive().nullable().optional(),
    isActive: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
    confirm: z.boolean().optional(),
    idempotencyKey: z.string().min(8).max(128),
  }, ({ staffId, confirm, idempotencyKey, ...changes }) => {
    if (changes.isActive !== undefined) requireConfirmation({ confirm }, "Changing staff active status");
    return withIdempotency(
      "crm_update_staff",
      idempotencyKey,
      { staffId, changes },
      () => callInternal("PATCH", `/api/walkin/staff/${staffId}`, changes),
    );
  });

  tool("crm_create_lookup_value", "Add an approved CRM program, source, status, or close reason.", {
    list: z.enum(["programs", "sources", "statuses", "close-reasons"]),
    label: z.string().min(1),
    brand: z.enum(["RIS", "RPS"]).nullable().optional(),
    sortOrder: z.number().int().optional(),
    idempotencyKey: z.string().min(8).max(128),
  }, ({ list, idempotencyKey, ...data }) => withIdempotency(
    "crm_create_lookup_value",
    idempotencyKey,
    { list, data },
    () => callInternal("POST", `/api/walkin/lookups/${list}`, data),
  ));

  tool("crm_update_lookup_value", "Rename, reorder, or deactivate an approved CRM lookup value.", {
    list: z.enum(["programs", "sources", "statuses", "close-reasons"]),
    valueId: z.number().int().positive(),
    label: z.string().min(1).optional(),
    isActive: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
    confirm: z.boolean().optional(),
    idempotencyKey: z.string().min(8).max(128),
  }, ({ list, valueId, confirm, idempotencyKey, ...data }) => {
    if (data.isActive === false) requireConfirmation({ confirm }, "Deactivating a CRM lookup value");
    return withIdempotency(
      "crm_update_lookup_value",
      idempotencyKey,
      { list, valueId, data },
      () => callInternal("PATCH", `/api/walkin/lookups/${list}/${valueId}`, data),
    );
  });

  tool("sheets_sync_status", "Read CRM-to-sheet synchronization health and latest synchronization state.", {}, () =>
    callInternal("GET", "/api/walkin/sheets/status"), true);

  tool("sheets_pull_log", "Read the latest CRM sheet-pull results and errors.", {}, () =>
    callInternal("GET", "/api/walkin/sheets/pull-log"), true);

  tool("sheets_pull_changes", "Pull approved changes from a school sheet into the CRM.", {
    brand: z.enum(["RIS", "RPS", "MASTER", "ALL"]).optional(),
    confirm: z.boolean().optional(),
    idempotencyKey: z.string().min(8).max(128),
  }, async ({ brand, confirm, idempotencyKey }) => {
    requireConfirmation({ confirm }, "Pulling sheet changes into the CRM");
    return withIdempotency("sheets_pull_changes", idempotencyKey, { brand }, () =>
      callInternal("POST", `/api/walkin/sheets/pull${query({ brand })}`));
  });

  tool("sheets_resync_brand", "Replace a brand’s synchronized sheet contents from the CRM. Use only after reviewing the impact.", {
    brand: z.enum(["RIS", "RPS"]),
    confirm: z.boolean().optional(),
    idempotencyKey: z.string().min(8).max(128),
  }, async ({ brand, confirm, idempotencyKey }) => {
    requireConfirmation({ confirm }, "Resynchronizing a brand sheet");
    return withIdempotency("sheets_resync_brand", idempotencyKey, { brand }, () =>
      callInternal("POST", `/api/walkin/sheets/resync${query({ brand })}`));
  });

  tool("sheets_resync_master", "Replace the master synchronized sheet contents from the CRM. Use only after reviewing the impact.", {
    confirm: z.boolean().optional(),
    idempotencyKey: z.string().min(8).max(128),
  }, async ({ confirm, idempotencyKey }) => {
    requireConfirmation({ confirm }, "Resynchronizing the master sheet");
    return withIdempotency("sheets_resync_master", idempotencyKey, {}, () =>
      callInternal("POST", "/api/walkin/sheets/resync-master"));
  });

  tool("content_list_blog_posts", "List editorial blog posts for administration.", {}, () =>
    callInternal("GET", "/api/admin/blog-posts"), true);

  tool("content_create_blog_post", "Create a validated editorial post through the existing administration route.", {
    post: blogPostInputSchema,
    idempotencyKey: z.string().min(8).max(128),
  }, ({ post, idempotencyKey }) => withIdempotency("content_create_blog_post", idempotencyKey, post, () =>
    callInternal("POST", "/api/admin/blog-posts", post)));

  tool("content_update_blog_post", "Update a validated editorial post through the existing administration route.", {
    currentSlug: z.string().min(1),
    post: blogPostInputSchema,
    idempotencyKey: z.string().min(8).max(128),
  }, ({ currentSlug, post, idempotencyKey }) => withIdempotency(
    "content_update_blog_post",
    idempotencyKey,
    { currentSlug, post },
    () => callInternal("PUT", `/api/admin/blog-posts/${encodeURIComponent(currentSlug)}`, post),
  ));

  tool("content_delete_blog_post", "Permanently delete a blog post. This action requires explicit confirmation.", {
    slug: z.string().min(1),
    confirm: z.boolean().optional(),
    idempotencyKey: z.string().min(8).max(128),
  }, async ({ slug, confirm, idempotencyKey }) => {
    requireConfirmation({ confirm }, "Deleting a blog post");
    return withIdempotency("content_delete_blog_post", idempotencyKey, { slug }, () =>
      callInternal("DELETE", `/api/admin/blog-posts/${encodeURIComponent(slug)}`));
  });

  return server;
}

function cleanupExpiredSessions() {
  const expiry = Date.now() - SESSION_TTL_MS;
  for (const [id, session] of sessions) {
    if (session.lastUsedAt < expiry) {
      sessions.delete(id);
      session.transport.close().catch(() => {});
    }
  }
}

function sessionIdFrom(req: Request) {
  const value = req.header("mcp-session-id");
  return value && value.length <= 256 ? value : undefined;
}

function mcpError(res: Response, status: number, message: string) {
  res.status(status).json({ jsonrpc: "2.0", error: { code: -32000, message }, id: null });
}

export function registerMcpGateway(app: Express) {
  const handler = async (req: Request, res: Response) => {
    cleanupExpiredSessions();
    const sessionId = sessionIdFrom(req);
    let session = sessionId ? sessions.get(sessionId) : undefined;

    try {
      if (!session && req.method === "POST" && !sessionId && isInitializeRequest(req.body)) {
        const transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          onsessioninitialized: (id) => {
            const created = sessions.get(id);
            if (created) created.lastUsedAt = Date.now();
          },
        });
        const server = createMcpServer();
        session = { transport, server, lastUsedAt: Date.now() };
        transport.onclose = () => {
          const activeId = transport.sessionId;
          if (activeId) sessions.delete(activeId);
        };
        await server.connect(transport);
        await transport.handleRequest(req, res, req.body);
        if (transport.sessionId) sessions.set(transport.sessionId, session);
        return;
      }

      if (!session) {
        mcpError(res, sessionId ? 404 : 400, sessionId ? "Unknown MCP session" : "Initialize a session before sending this request");
        return;
      }
      session.lastUsedAt = Date.now();
      await session.transport.handleRequest(req, res, req.method === "POST" ? req.body : undefined);
    } catch (error) {
      console.error("[mcp] request failed:", error instanceof Error ? error.message : "unknown error");
      if (!res.headersSent) mcpError(res, 500, "MCP request failed");
    }
  };

  app.post("/mcp", requireMcpToken, handler);
  app.get("/mcp", requireMcpToken, handler);
  app.delete("/mcp", requireMcpToken, handler);
}

export const __mcpGatewayTestUtils = {
  redact,
  failureCategory,
  requireConfirmation,
};