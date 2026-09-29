import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, jsonb, serial, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const inquiries = pgTable("inquiries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  parentName: text("parent_name").notNull(),
  email: text("email"),
  phone: text("phone").notNull(),
  studentName: text("student_name").notNull(),
  grade: text("grade").notNull(),
  preferredTime: text("preferred_time"),
  source: text("source"),
  message: text("message"),
  pagePath: text("page_path"),
  pageTitle: text("page_title"),
  formLocation: text("form_location"),
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  utmTerm: text("utm_term"),
  utmContent: text("utm_content"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const inquiryAbuseBuckets = pgTable("inquiry_abuse_buckets", {
  bucketKey: text("bucket_key").primaryKey(),
  windowStartedAt: timestamp("window_started_at").notNull(),
  requestCount: integer("request_count").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("inquiry_abuse_buckets_updated_at_idx").on(table.updatedAt),
]);

export const ganeshGalleryDownloads = pgTable("ganesh_gallery_downloads", {
  assetId: text("asset_id").primaryKey(),
  downloadCount: integer("download_count").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type GaneshGalleryDownload = typeof ganeshGalleryDownloads.$inferSelect;

const safeTrackingValue = (maxLength: number, label: string) =>
  z.string()
    .trim()
    .max(maxLength, `${label} is too long`)
    .regex(/^[^<>{}$`\\]*$/, `${label} contains unsupported characters`)
    .optional()
    .or(z.literal(""));

const safeAttributionValue = (maxLength: number, label: string) =>
  z.string()
    .trim()
    .max(maxLength, `${label} is too long`)
    .regex(/^[a-z0-9][a-z0-9 _./-]*$/i, `${label} contains unsupported characters`)
    .optional()
    .or(z.literal(""));

export const insertInquirySchema = createInsertSchema(inquiries).omit({
  id: true,
  createdAt: true,
  source: true,
}).extend({
  parentName: z.string().trim().min(1, "Parent name is required").max(120, "Parent name is too long"),
  phone: z.string().regex(/^\d{10}$/, "Please enter a valid 10-digit mobile number"),
  studentName: z.string().trim().min(1, "Child's name is required").max(120, "Child's name is too long"),
  grade: z.string().trim().min(1, "Please select a class").max(80, "Class value is too long"),
  preferredTime: z.string().trim().max(120, "Preferred time is too long").optional().or(z.literal("")),
  email: z.string().trim().email("Please enter a valid email").max(254, "Email is too long").optional().or(z.literal("")),
  message: z.string().trim().max(3000, "Message is too long").optional().or(z.literal("")),
  pagePath: safeTrackingValue(500, "Page path"),
  pageTitle: safeTrackingValue(200, "Page title"),
  formLocation: safeTrackingValue(120, "Form location"),
  utmSource: safeAttributionValue(100, "Campaign source"),
  utmMedium: safeAttributionValue(100, "Campaign medium"),
  utmCampaign: safeAttributionValue(200, "Campaign name"),
  utmTerm: safeAttributionValue(200, "Campaign term"),
  utmContent: safeAttributionValue(200, "Campaign content"),
});

export type InsertInquiry = z.infer<typeof insertInquirySchema>;
export type Inquiry = typeof inquiries.$inferSelect;

export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: text("date").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url"),
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
});

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

export const callbackRequests = pgTable("callback_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  preferredTime: text("preferred_time").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCallbackRequestSchema = createInsertSchema(callbackRequests).omit({
  id: true,
  createdAt: true,
}).extend({
  phone: z.string().regex(/^\d{10}$/, "Please enter a valid 10-digit mobile number"),
});

export type InsertCallbackRequest = z.infer<typeof insertCallbackRequestSchema>;
export type CallbackRequest = typeof callbackRequests.$inferSelect;

export const careerApplications = pgTable("career_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  position: text("position").notNull(),
  experience: text("experience"),
  qualification: text("qualification"),
  currentLocation: text("current_location"),
  resumeFilename: text("resume_filename"),
  resumeMimeType: text("resume_mime_type"),
  resumeSize: text("resume_size"),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCareerApplicationSchema = createInsertSchema(careerApplications).omit({
  id: true,
  createdAt: true,
}).extend({
  name: z.string().min(1, "Full name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(7, "Please enter a valid phone number"),
  position: z.string().min(1, "Please select a position"),
  experience: z.string().min(1, "Total experience is required"),
  qualification: z.string().min(1, "Qualification is required"),
  currentLocation: z.string().min(1, "Current location is required"),
  resumeFilename: z.string().optional().or(z.literal("")),
  resumeMimeType: z.string().optional().or(z.literal("")),
  resumeSize: z.string().optional().or(z.literal("")),
  message: z.string().optional().or(z.literal("")),
});

export type InsertCareerApplication = z.infer<typeof insertCareerApplicationSchema>;
export type CareerApplication = typeof careerApplications.$inferSelect;

export const brochureRequests = pgTable("brochure_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cardNumber: text("card_number").notNull(),
  name: text("name"),
  email: text("email"),
  phone: text("phone"),
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
});

export const insertBrochureRequestSchema = createInsertSchema(brochureRequests).omit({
  id: true,
  requestedAt: true,
}).extend({
  cardNumber: z.string().min(1, "Privilege card number is required"),
  name: z.string().optional().or(z.literal("")),
  email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
});

export type InsertBrochureRequest = z.infer<typeof insertBrochureRequestSchema>;
export type BrochureRequest = typeof brochureRequests.$inferSelect;

// ── Blog Posts ──────────────────────────────────────────────────
export const blogPostsTable = pgTable("blog_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  metaTitle: text("meta_title").notNull(),
  metaDescription: text("meta_description").notNull(),
  keywords: text("keywords").notNull().default(""),
  date: text("date").notNull(),
  cat: text("cat").notNull(),
  thumbUrl: text("thumb_url"),
  heroUrl: text("hero_url").notNull().default(""),
  intro: text("intro").notNull().default(""),
  sections: jsonb("sections").$type<Array<{ heading?: string; body: string; list?: string[] }>>().notNull().default([]),
  conclusion: text("conclusion").notNull().default(""),
  relatedSlugs: jsonb("related_slugs").$type<string[]>().notNull().default([]),
  internalLinks: jsonb("internal_links").$type<Array<{ label: string; href: string }>>().notNull().default([]),
  faqs: jsonb("faqs").$type<Array<{ q: string; a: string }>>().notNull().default([]),
  publishedAt: timestamp("published_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBlogPostSchema = createInsertSchema(blogPostsTable, {
  sections: z.array(z.object({ heading: z.string().optional(), body: z.string(), list: z.array(z.string()).optional() })).optional(),
  relatedSlugs: z.array(z.string()).optional(),
  internalLinks: z.array(z.object({ label: z.string(), href: z.string() })).optional(),
  faqs: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
}).omit({
  id: true,
  createdAt: true,
});

export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPostsTable.$inferSelect;

// ── Friendship School QR Portal ───────────────────────────────
export const friendshipSchools = pgTable("friendship_schools", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  token: text("token").notNull().unique(),
  contactPerson: text("contact_person").notNull(),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  sheetsTabName: text("sheets_tab_name").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  // When true, Sheets auto-sync will not overwrite contactPerson/contactPhone
  contactOverride: boolean("contact_override").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertFriendshipSchoolSchema = createInsertSchema(friendshipSchools).omit({
  id: true,
  createdAt: true,
}).extend({
  name: z.string().min(1, "School name is required"),
  contactPerson: z.string().min(1, "Contact person is required"),
  sheetsTabName: z.string().min(1, "Sheets tab name is required"),
});
export type InsertFriendshipSchool = z.infer<typeof insertFriendshipSchoolSchema>;
export type FriendshipSchool = typeof friendshipSchools.$inferSelect;

export const friendshipSchoolLeads = pgTable("friendship_school_leads", {
  id: serial("id").primaryKey(),
  schoolId: integer("school_id").notNull().references(() => friendshipSchools.id),
  studentName: text("student_name").notNull(),
  grade: text("grade").notNull(),
  parentName: text("parent_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  source: text("source").notNull().default("manual"),
  status: text("status").notNull().default("Open"),
  commissionPaid: boolean("commission_paid"),
  remarks: text("remarks"),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  syncedToSheets: boolean("synced_to_sheets").notNull().default(false),
  syncFailed: boolean("sync_failed").notNull().default(false),
});

export const insertFriendshipLeadSchema = createInsertSchema(friendshipSchoolLeads).omit({
  id: true,
  submittedAt: true,
  syncedToSheets: true,
  syncFailed: true,
}).extend({
  studentName: z.string().min(1, "Student name is required"),
  grade: z.string().min(1, "Grade is required"),
  parentName: z.string().min(1, "Parent name is required"),
  phone: z.string().min(7, "Valid phone number required"),
  source: z.enum(["manual", "bulk"]).default("manual"),
  status: z.string().default("Open"),
});
export type InsertFriendshipLead = z.infer<typeof insertFriendshipLeadSchema>;
export type FriendshipSchoolLead = typeof friendshipSchoolLeads.$inferSelect;

// ── RA Walk-in QR Check-in System ─────────────────────────────
export const ras = pgTable("ras", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  branch: text("branch").notNull().default("Main"),
  school: text("school").notNull().default("RIS"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRaSchema = createInsertSchema(ras).omit({
  id: true,
  createdAt: true,
}).extend({
  name: z.string().min(1, "RA name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  branch: z.string().min(1, "Branch is required"),
  school: z.enum(["RIS", "RPS"]).optional().default("RIS"),
  active: z.boolean().optional().default(true),
});

export type InsertRa = z.infer<typeof insertRaSchema>;
export type Ra = typeof ras.$inferSelect;

export const walkinCheckins = pgTable("walkin_checkins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  raId: varchar("ra_id").notNull().references(() => ras.id),
  raName: text("ra_name").notNull(),
  raBranch: text("ra_branch").notNull(),
  school: text("school").notNull().default("RIS"),
  parentName: text("parent_name").notNull(),
  studentName: text("student_name").notNull(),
  grade: text("grade").notNull(),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  syncedToSheets: boolean("synced_to_sheets").default(false).notNull(),
  sheetSyncError: text("sheet_sync_error"),
});

export const insertWalkinCheckinSchema = createInsertSchema(walkinCheckins).omit({
  id: true,
  submittedAt: true,
  raName: true,
  raBranch: true,
  school: true,
}).extend({
  parentName: z.string().min(1, "Parent name is required"),
  studentName: z.string().min(1, "Student name is required"),
  grade: z.string().min(1, "Grade is required"),
});

export type InsertWalkinCheckin = z.infer<typeof insertWalkinCheckinSchema>;
export type WalkinCheckin = typeof walkinCheckins.$inferSelect;

// ── AY 2027-28 Walk-in Admissions Capture System ─────────────

export const walkinBranches = pgTable("walkin_branches", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  brand: text("brand").notNull(), // "RIS" or "RPS"
  code: text("code").notNull().unique(), // short slug, e.g. "brahmand"
  pin: text("pin").notNull().default("1234"), // kiosk access PIN
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const walkinPrograms = pgTable("walkin_programs", {
  id: serial("id").primaryKey(),
  label: text("label").notNull(),
  brand: text("brand"), // null = shared; "RIS" or "RPS" for brand-specific
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

export const walkinSources = pgTable("walkin_sources", {
  id: serial("id").primaryKey(),
  label: text("label").notNull(),
  brand: text("brand"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

export const walkinStatuses = pgTable("walkin_statuses", {
  id: serial("id").primaryKey(),
  label: text("label").notNull(),
  brand: text("brand"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

export const walkinCloseReasons = pgTable("walkin_close_reasons", {
  id: serial("id").primaryKey(),
  label: text("label").notNull(),
  brand: text("brand"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

export const walkinStaff = pgTable("walkin_staff", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  brand: text("brand"), // null = all brands
  branchId: integer("branch_id").references(() => walkinBranches.id), // null = all branches of their brand
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const walkinLeads = pgTable(
  "walkin_leads",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    brand: text("brand").notNull(),          // "RIS" or "RPS" — immutable after creation
    branchId: integer("branch_id").references(() => walkinBranches.id),
    academicYear: text("academic_year").notNull().default("2027-28"),
    enquiryDate: text("enquiry_date").notNull(), // YYYY-MM-DD; defaults to today; cannot be future
    monthLabel: text("month_label").notNull(),   // e.g. "Jun-27" — auto-derived; never user-editable
    parentName: text("parent_name").notNull(),    // Father Name
    motherName: text("mother_name"),              // Mother Name (new; mandatory in UI)
    childName: text("child_name").notNull(),
    phone: text("phone").notNull(),              // Father Contact (normalized 10-digit Indian mobile)
    altPhone: text("alt_phone"),                 // Mother Contact (mandatory in UI)
    email: text("email"),
    program: text("program").notNull(),
    source: text("source").notNull(),
    status: text("status").notNull().default("OPEN"),
    closeReason: text("close_reason"),           // required when status = CLOSED
    remark: text("remark"),                      // free-text; never feeds analytics
    leadOwner: text("lead_owner"),
    walkInDate: text("walk_in_date"),            // YYYY-MM-DD; required for WALK-IN states
    admissionDate: text("admission_date"),      // YYYY-MM-DD; actual admission, separate from walk-in
    revisitDate: text("revisit_date"),           // Revisit 1 Date (YYYY-MM-DD)
    revisitDate2: text("revisit_date_2"),         // Revisit 2 Date (YYYY-MM-DD)
    misCallingRemarks: text("mis_calling_remarks"),  // kept for backward-compat; not in sheets
    seqNum: serial("seq_num"),                   // global serial (kept for backward-compat / ordering)
    brandSeqNum: integer("brand_seq_num"),       // per-brand sequential counter; used in Unique ID
    isArchived: boolean("is_archived").notNull().default(false),
    createdBy: text("created_by").notNull().default("kiosk"),
    updatedBy: text("updated_by"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    index("walkin_leads_brand_branch_date_idx").on(t.brand, t.branchId, t.enquiryDate),
    index("walkin_leads_phone_idx").on(t.phone),
  ],
);

export const walkinLeadAuditLog = pgTable("walkin_lead_audit_log", {
  id: serial("id").primaryKey(),
  leadId: varchar("lead_id").notNull().references(() => walkinLeads.id),
  field: text("field").notNull(),     // field name that changed, or "created" / "archived"
  oldValue: text("old_value"),
  newValue: text("new_value"),
  changedBy: text("changed_by").notNull().default("system"),
  changedAt: timestamp("changed_at").defaultNow().notNull(),
});

// MCP records deliberately retain only redacted arguments, never bearer tokens
// or the personal-data fields passed through administrative tools.
export const mcpAuditLogs = pgTable("mcp_audit_logs", {
  id: serial("id").primaryKey(),
  principal: text("principal").notNull().default("legacy"),
  requestId: varchar("request_id").notNull().default(sql`gen_random_uuid()`),
  tool: text("tool").notNull(),
  outcome: text("outcome").notNull(),
  failureCategory: text("failure_category"),
  resourceId: text("resource_id"),
  durationMs: integer("duration_ms").notNull().default(0),
  argumentsRedacted: jsonb("arguments_redacted").notNull(),
  // Retained for a non-destructive schema transition. MCP audit writes do not
  // populate this legacy free-text field.
  detail: text("detail"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("mcp_audit_logs_created_at_idx").on(table.createdAt),
  index("mcp_audit_logs_tool_idx").on(table.tool),
  index("mcp_audit_logs_request_id_idx").on(table.requestId),
]);

// Durable retry protection for MCP operations that archive, delete, pull, or
// replace synchronized data. The request fingerprint prevents key reuse for a
// different operation without storing the request body itself.
export const mcpIdempotencyKeys = pgTable("mcp_idempotency_keys", {
  id: text("id").primaryKey(),
  principal: text("principal").notNull(),
  tool: text("tool").notNull(),
  fingerprint: varchar("fingerprint", { length: 64 }).notNull(),
  state: text("state").notNull().default("processing"),
  result: jsonb("result"),
  completedAt: timestamp("completed_at"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("mcp_idempotency_keys_expires_at_idx").on(table.expiresAt),
]);

export const mcpOauthClients = pgTable("mcp_oauth_clients", {
  clientId: text("client_id").primaryKey(),
  clientName: text("client_name"),
  redirectUris: jsonb("redirect_uris").$type<string[]>().notNull(),
  tokenEndpointAuthMethod: text("token_endpoint_auth_method").notNull().default("none"),
  scope: text("scope").notNull().default("mcp"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const mcpOauthAuthorizationRequests = pgTable("mcp_oauth_authorization_requests", {
  id: text("id").primaryKey(),
  clientId: text("client_id").notNull(),
  redirectUri: text("redirect_uri").notNull(),
  clientState: text("client_state"),
  codeChallenge: text("code_challenge").notNull(),
  scope: text("scope").notNull().default("mcp"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("mcp_oauth_authorization_requests_expires_at_idx").on(table.expiresAt),
]);

export const mcpOauthAuthorizationCodes = pgTable("mcp_oauth_authorization_codes", {
  codeHash: varchar("code_hash", { length: 64 }).primaryKey(),
  clientId: text("client_id").notNull(),
  redirectUri: text("redirect_uri").notNull(),
  codeChallenge: text("code_challenge").notNull(),
  principal: text("principal").notNull(),
  scope: text("scope").notNull().default("mcp"),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("mcp_oauth_authorization_codes_expires_at_idx").on(table.expiresAt),
]);

export const mcpOauthAccessTokens = pgTable("mcp_oauth_access_tokens", {
  tokenHash: varchar("token_hash", { length: 64 }).primaryKey(),
  clientId: text("client_id").notNull(),
  principal: text("principal").notNull(),
  scope: text("scope").notNull().default("mcp"),
  expiresAt: timestamp("expires_at").notNull(),
  revokedAt: timestamp("revoked_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("mcp_oauth_access_tokens_expires_at_idx").on(table.expiresAt),
]);

export const mcpOauthRefreshTokens = pgTable("mcp_oauth_refresh_tokens", {
  tokenHash: varchar("token_hash", { length: 64 }).primaryKey(),
  clientId: text("client_id").notNull(),
  principal: text("principal").notNull(),
  scope: text("scope").notNull().default("mcp"),
  expiresAt: timestamp("expires_at").notNull(),
  revokedAt: timestamp("revoked_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("mcp_oauth_refresh_tokens_expires_at_idx").on(table.expiresAt),
]);

// ── Server-managed Google OAuth credential ───────────────────────
// The refresh token is encrypted before it reaches this table. Its encryption
// key stays in SESSION_SECRET and is never persisted alongside the ciphertext.
export const googleOauthCredentials = pgTable("google_oauth_credentials", {
  provider: text("provider").primaryKey(),
  encryptedRefreshToken: text("encrypted_refresh_token").notNull(),
  iv: text("iv").notNull(),
  authTag: text("auth_tag").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// One durable lease shared by all Autoscale instances that can write the
// walk-in workbooks. Expiry makes a crashed instance recoverable.
export const walkinSyncLeases = pgTable("walkin_sync_leases", {
  leaseName: text("lease_name").primaryKey(),
  ownerId: text("owner_id").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("walkin_sync_leases_expires_at_idx").on(table.expiresAt),
]);

// Durable, idempotent resync requests. A replacement instance drains scopes
// left behind if its predecessor stops between multi-workbook writes.
export const walkinSyncReconciliations = pgTable("walkin_sync_reconciliations", {
  scope: text("scope").primaryKey(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ── Indra Intelligence integration delivery state ───────────────
// Stores only operational delivery metadata. Payloads, credentials, and
// customer records are intentionally never persisted here.
export const indraSyncStates = pgTable("indra_sync_states", {
  integration: text("integration").primaryKey(),
  lastAttemptedAt: timestamp("last_attempted_at"),
  lastSuccessfulAt: timestamp("last_successful_at"),
  lastDeliveryId: text("last_delivery_id"),
  lastError: text("last_error"),
  leaseId: text("lease_id"),
  leaseUntil: timestamp("lease_until"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ── Types ─────────────────────────────────────────────────────
export type WalkinBranch = typeof walkinBranches.$inferSelect;
export type InsertWalkinBranch = typeof walkinBranches.$inferInsert;
export type WalkinLead = typeof walkinLeads.$inferSelect;
export type InsertWalkinLead = typeof walkinLeads.$inferInsert;
export type WalkinLeadAuditLog = typeof walkinLeadAuditLog.$inferSelect;
export type WalkinProgram = typeof walkinPrograms.$inferSelect;
export type WalkinSource = typeof walkinSources.$inferSelect;
export type WalkinStatus = typeof walkinStatuses.$inferSelect;
export type WalkinCloseReason = typeof walkinCloseReasons.$inferSelect;
export type WalkinStaffMember = typeof walkinStaff.$inferSelect;
