import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { timingSafeEqual, randomBytes, createHmac } from "node:crypto";
import fs from "fs";
import path from "path";
import { storage } from "./storage";
import { OPENAPI_YAML } from "./openapiSpec";
import { INDRA_OPENAPI_YAML } from "./indraOpenapiSpec";
import { z } from "zod";
import { insertInquirySchema, insertEventSchema, insertCallbackRequestSchema, insertCareerApplicationSchema, insertBrochureRequestSchema, insertRaSchema, insertFriendshipSchoolSchema, insertFriendshipLeadSchema, type InsertFriendshipLead, walkinLeads, callbackRequests } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

// ── Restricted public input schema for friendship lead submission ─
// Only accepts student/parent fields; server forces status, source, etc.
const publicFriendshipLeadSchema = z.object({
  studentName: z.string().min(1, "Student name is required"),
  grade: z.string().min(1, "Grade is required"),
  parentName: z.string().min(1, "Parent name is required"),
  phone: z.string().min(7, "Valid phone number required"),
  email: z.string().email().optional().or(z.literal("")).transform(v => v || undefined),
});
import nodemailer from "nodemailer";
import multer from "multer";
import { registerSSRRoutes } from "./ssrBlog";
import { registerHomeSSR } from "./ssrHome";
import { registerPageSSR } from "./ssrPages";
import { registerSpainArgentinaSSR } from "./ssrSpainArgentina";
import { registerRakshaBandhan2026SSR } from "./ssrRakshaBandhan2026";
import { CODE_OWNED_BLOG_SLUGS } from "@shared/codeOwnedBlogs";
import {
  registerCodeOwnedBlogSlug,
  primeBlogSlugCache,
  getKnownBlogSlugs,
  noteBlogSlugAdded,
  noteBlogSlugRemoved,
  getRegistryCounts,
  createLegacyRedirectRouter,
  isKnownBlogSlug,
} from "./blogRoutes";
import { runAndAlert } from "./seoMonitor";
import { google } from "googleapis";
import { registerWalkinRoutes } from "./walkinRoutes";
import { bustCrmStatsCache } from "./walkinSheets";
import { registerIndraIntegrationRoutes, startIndraPushScheduler } from "./indraIntegration";
import { registerMcpGateway } from "./mcpGateway";
import { db } from "./db";
import {
  getGoogleRefreshToken,
  googleOAuthSuccessPage,
  storeGoogleRefreshToken,
} from "./googleCredentials";
import {
  buildCounselorPerformance,
  parseCounselorPerformanceFilters,
  type CounselorPerformanceRecord,
} from "./counselorPerformance";

/** Derive "Mon-YY" month label from a YYYY-MM-DD date string (e.g. "2027-06-15" → "Jun-27"). */
function crmMonthLabel(dateStr: string): string {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const [yearStr, monthStr] = dateStr.split("-");
  const month = parseInt(monthStr, 10) - 1;
  const year  = parseInt(yearStr,  10) % 100;
  return `${months[month]}-${String(year).padStart(2, "0")}`;
}

/** Return today's date in YYYY-MM-DD format, adjusted to IST. */
function todayIST(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

const RESUME_ALLOWED_MIMES_BY_EXT: Record<string, Set<string>> = {
  pdf: new Set(["application/pdf", "application/octet-stream"]),
  doc: new Set(["application/msword", "application/octet-stream"]),
  docx: new Set([
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/octet-stream",
    "application/zip",
  ]),
};
const RESUME_MAX_BYTES = 5 * 1024 * 1024;
const RESUME_MAGIC_BYTES: Record<string, Buffer[]> = {
  pdf: [Buffer.from("%PDF-")],
  doc: [Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])],
  docx: [Buffer.from([0x50, 0x4b, 0x03, 0x04])],
};

// ── Simple in-memory rate limiter (no external package needed) ─
const _ipRateMap = new Map<string, { count: number; windowStart: number }>();
function makeRateLimit(maxReqs: number, windowMs: number) {
  return (_req: express.Request, res: express.Response, next: express.NextFunction) => {
    const ip = (_req.headers["x-forwarded-for"] as string || _req.socket.remoteAddress || "unknown").split(",")[0].trim();
    const now = Date.now();
    const entry = _ipRateMap.get(ip);
    if (!entry || now - entry.windowStart > windowMs) {
      _ipRateMap.set(ip, { count: 1, windowStart: now });
      return next();
    }
    entry.count++;
    if (entry.count > maxReqs) {
      return res.status(429).json({ message: "Too many requests. Please try again in a minute." });
    }
    next();
  };
}
const friendshipSubmitRateLimit = makeRateLimit(20, 60_000);

const xlsxUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    const ok = file.originalname.toLowerCase().endsWith(".xlsx");
    cb(ok ? null : new Error("Only .xlsx files are accepted") as any, ok);
  },
});

const careerUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: RESUME_MAX_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    const ext = (file.originalname.split(".").pop() || "").toLowerCase();
    const allowedMimes = RESUME_ALLOWED_MIMES_BY_EXT[ext];
    if (!allowedMimes || !allowedMimes.has(file.mimetype)) {
      return cb(new Error("Resume must be a PDF, DOC, or DOCX file"));
    }
    cb(null, true);
  },
});

// ── Blog image upload (admin only) ──────────────────────────────────────────
const BLOG_IMAGE_MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const BLOG_IMAGE_ALLOWED_MIMES = new Set(["image/jpeg", "image/png", "image/webp"]);
const BLOG_UPLOAD_DIR = path.resolve("./uploads/blog");

function checkImageMagicBytes(filePath: string): boolean {
  const fd = fs.openSync(filePath, "r");
  const buf = Buffer.alloc(12);
  const bytesRead = fs.readSync(fd, buf, 0, 12, 0);
  fs.closeSync(fd);
  if (bytesRead < 3) return false;
  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return true;
  // PNG: 89 50 4E 47
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return true;
  // WebP: RIFF????WEBP (bytes 0-3 == "RIFF", bytes 8-11 == "WEBP")
  if (bytesRead >= 12 &&
      buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
      buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50) return true;
  return false;
}

const blogImageUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      fs.mkdirSync(BLOG_UPLOAD_DIR, { recursive: true });
      cb(null, BLOG_UPLOAD_DIR);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
      cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
    },
  }),
  limits: { fileSize: BLOG_IMAGE_MAX_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (BLOG_IMAGE_ALLOWED_MIMES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, and WebP images are allowed"));
    }
  },
});

function resumeContentMatchesType(file: Express.Multer.File): boolean {
  const ext = (file.originalname.split(".").pop() || "").toLowerCase();
  const signatures = RESUME_MAGIC_BYTES[ext];
  if (!signatures || file.buffer.length < 4) return false;
  return signatures.some((sig) => file.buffer.subarray(0, sig.length).equals(sig));
}

// ── Email helpers ───────────────────────────────────────────────
function getTransporter() {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT) || 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) return null;

  return {
    transport: nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    }),
    from: `"Rainbow International School" <${smtpUser}>`,
    to: process.env.ENQUIRY_MAIL_TO || "digital@rainbowinternationalschool.in",
  };
}

function tableRow(label: string, value: string | undefined | null) {
  if (!value) return "";
  return `<tr><td style="padding:8px 14px;font-weight:bold;border-bottom:1px solid #eee;color:#091a4f;">${label}</td><td style="padding:8px 14px;border-bottom:1px solid #eee;">${value}</td></tr>`;
}

function getLeadSourceLabel(utmSource?: string | null, utmMedium?: string | null): string {
  if (!utmSource && !utmMedium) return "Organic / Direct";
  const src = (utmSource || "").toLowerCase();
  const med = (utmMedium || "").toLowerCase();
  if (src === "google" && (med === "cpc" || med === "paid" || med.includes("paid"))) return "Google Ads";
  if (src === "facebook" || src === "instagram" || src === "meta") return "Meta Ads";
  if (med === "cpc" || med === "ppc" || med.includes("paid")) return `Paid Ads (${utmSource || "Unknown"})`;
  if (med === "email") return "Email Campaign";
  if (med === "social" || med === "organic_social") return `Social Media (${utmSource || "Unknown"})`;
  if (med === "referral") return `Referral (${utmSource || "Unknown"})`;
  return utmSource || "Organic / Direct";
}

function getMediumLabel(utmMedium?: string | null): string {
  if (!utmMedium) return "Direct";
  const med = utmMedium.toLowerCase();
  if (med === "cpc" || med === "ppc") return "Paid Ads";
  if (med === "display") return "Paid Ads";
  if (med === "paid_social") return "Paid Ads";
  if (med === "social" || med === "organic_social") return "Social";
  if (med === "email") return "Email";
  if (med === "referral") return "Referral";
  if (med === "organic") return "Organic Search";
  return utmMedium;
}

async function sendInquiryEmail(data: {
  parentName: string;
  email?: string | null;
  phone: string;
  studentName: string;
  grade: string;
  preferredTime?: string | null;
  message?: string | null;
  pagePath?: string | null;
  pageTitle?: string | null;
  formLocation?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmTerm?: string | null;
  utmContent?: string | null;
}) {
  const mailer = getTransporter();
  if (!mailer) {
    console.log("[inquiry] SMTP not configured — skipping email. Inquiry saved to DB.");
    return;
  }

  const leadSource = getLeadSourceLabel(data.utmSource, data.utmMedium);
  const leadMedium = getMediumLabel(data.utmMedium);
  const isPaid = leadSource !== "Organic / Direct";

  const formLocationLabel = data.formLocation || (data.pagePath === "/" ? "Homepage" : data.pagePath || "Unknown");
  const pageLabel = data.pagePath || "/";

  await mailer.transport.sendMail({
    from: mailer.from,
    to: mailer.to,
    replyTo: data.email || undefined,
    subject: `New Admission Enquiry – ${data.studentName} (${data.grade})`,
    html: `
      <div style="font-family:'Segoe UI',sans-serif;max-width:600px;">
        <div style="background:#091a4f;color:#fff;padding:20px 24px;border-radius:8px 8px 0 0;">
          <h2 style="margin:0;font-size:20px;">🌈 New Admission Enquiry</h2>
          <p style="margin:4px 0 0;opacity:0.85;font-size:13px;">Rainbow International School Website</p>
        </div>
        <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #e5e7eb;border-top:none;">
          ${tableRow("Parent Name", data.parentName)}
          ${tableRow("Student Name", data.studentName)}
          ${tableRow("Grade / Class", data.grade)}
          ${tableRow("Phone", data.phone)}
          ${tableRow("Email", data.email)}
          ${tableRow("Preferred Time", data.preferredTime)}
          ${tableRow("Message", data.message)}
        </table>

        <div style="margin-top:16px;background:#f0f4ff;border:1px solid #d1daf0;border-radius:8px;padding:16px;">
          <h3 style="margin:0 0 10px;font-size:14px;color:#091a4f;">📍 Submission Details</h3>
          <table style="width:100%;border-collapse:collapse;font-size:13px;">
            ${tableRow("Submitted From Page", pageLabel)}
            ${tableRow("Form Location", formLocationLabel)}
            ${tableRow("Lead Source", leadSource)}
            ${tableRow("Lead Medium", leadMedium)}
            ${isPaid ? tableRow("Campaign", data.utmCampaign) : ""}
            ${isPaid ? tableRow("Ad Keyword / Term", data.utmTerm) : ""}
            ${isPaid ? tableRow("Ad Content / Variant", data.utmContent) : ""}
            ${isPaid ? tableRow("Platform", data.utmSource) : ""}
          </table>
        </div>

        <p style="color:#888;font-size:12px;margin-top:16px;padding:0 4px;">Submitted via the school website enquiry form.</p>
      </div>
    `,
  });
  console.log("[inquiry] Email sent to", mailer.to);
}

async function sendCallbackEmail(data: { name: string; phone: string; preferredTime: string }) {
  const mailer = getTransporter();
  if (!mailer) {
    console.log("[callback] SMTP not configured — skipping email. Request saved to DB.");
    return;
  }

  await mailer.transport.sendMail({
    from: mailer.from,
    to: mailer.to,
    subject: `Callback Request – ${data.name}`,
    html: `
      <div style="font-family:'Segoe UI',sans-serif;max-width:600px;">
        <div style="background:#091a4f;color:#fff;padding:20px 24px;border-radius:8px 8px 0 0;">
          <h2 style="margin:0;font-size:20px;">📞 New Callback Request</h2>
          <p style="margin:4px 0 0;opacity:0.85;font-size:13px;">Rainbow International School Website</p>
        </div>
        <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #e5e7eb;border-top:none;">
          ${tableRow("Name", data.name)}
          ${tableRow("Phone", data.phone)}
          ${tableRow("Preferred Time", data.preferredTime)}
        </table>
        <p style="color:#888;font-size:12px;margin-top:16px;padding:0 4px;">Submitted via the website chatbot.</p>
      </div>
    `,
  });
  console.log("[callback] Email sent to", mailer.to);
}

const CAREER_EMAIL_TO = "hr.recruiter3@rainbowinternationalschool.in";

async function sendCareerEmail(
  data: {
    name: string;
    email: string;
    phone: string;
    position: string;
    experience?: string | null;
    qualification?: string | null;
    currentLocation?: string | null;
    message?: string | null;
  },
  resume?: { filename: string; content: Buffer; contentType: string } | null,
) {
  const mailer = getTransporter();
  if (!mailer) {
    console.log("[career] SMTP not configured — skipping email. Application saved to DB.");
    return;
  }

  await mailer.transport.sendMail({
    from: mailer.from,
    to: CAREER_EMAIL_TO,
    replyTo: data.email,
    subject: `New Job Application – ${data.name} (${data.position})`,
    html: `
      <div style="font-family:'Segoe UI',sans-serif;max-width:600px;">
        <div style="background:#091a4f;color:#fff;padding:20px 24px;border-radius:8px 8px 0 0;">
          <h2 style="margin:0;font-size:20px;">💼 New Career Application</h2>
          <p style="margin:4px 0 0;opacity:0.85;font-size:13px;">Rainbow International School — Careers Page</p>
        </div>
        <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #e5e7eb;border-top:none;">
          ${tableRow("Full Name", data.name)}
          ${tableRow("Email", data.email)}
          ${tableRow("Phone", data.phone)}
          ${tableRow("Position Applied For", data.position)}
          ${tableRow("Total Experience", data.experience)}
          ${tableRow("Qualification", data.qualification)}
          ${tableRow("Current Location", data.currentLocation)}
          ${tableRow("Resume", resume ? `Attached: ${resume.filename}` : "Not provided")}
          ${tableRow("Message", data.message)}
        </table>
        <p style="color:#888;font-size:12px;margin-top:16px;padding:0 4px;">Submitted via the school website careers page.</p>
      </div>
    `,
    attachments: resume
      ? [{ filename: resume.filename, content: resume.content, contentType: resume.contentType }]
      : undefined,
  });
  console.log("[career] Email sent to", CAREER_EMAIL_TO, resume ? `(with ${resume.filename})` : "");
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Serve admin-uploaded blog images from the persistent uploads directory.
  // This must be registered early so it resolves before the SPA catch-all.
  app.use("/uploads", express.static(path.resolve("./uploads"), {
    maxAge: "365d",
    immutable: false,
  }));

  // Serve static blog assets (images, etc.) from client/public/blog-assets/.
  // In dev mode Vite middleware does not reliably serve publicDir files through
  // the Express pipeline, so we register an explicit static route here.
  // In production, dist/public/blog-assets/ is already covered by serveStatic(),
  // but having this route earlier is harmless and ensures consistent behaviour.
  app.use("/blog-assets", express.static(path.join(process.cwd(), "client/public/blog-assets"), {
    maxAge: "7d",
    redirect: false,
  }));

  // SSR must be registered BEFORE wpRedirects so that search engine bots receive
  // fully-rendered HTML for all registered paths. For bots, the SSR handler returns
  // early with HTML. For regular browsers, SSR calls next() and the redirect fires.
  // Intentional split for /rainbow-preschool-international:
  //   - Bots → SSR content for the preschool page (indexable)
  //   - Browsers → 301 redirect to /pre-primary-school-thane (legacy URL consolidation)
  registerHomeSSR(app);
  registerPageSSR(app);
  registerSpainArgentinaSSR(app);
  registerRakshaBandhan2026SSR(app);

  // Independence Day 2026 static blog — registered before SSR so ssrBlog does not intercept it
  // process.cwd() = project root in both dev (tsx server/index.ts) and production
  // (node dist/index.cjs). blog-pages/ is also copied into dist/ by the build script
  // so it is present whether production runs from the root or just dist/.
  // redirect:false prevents express.static from adding a trailing slash, which would
  // loop with the global trailing-slash stripper in server/index.ts (ERR_TOO_MANY_REDIRECTS).
  const blogDir = path.join(process.cwd(), "blog-pages/independence-day-2026");
  app.use("/blog/independence-day-2026", express.static(blogDir, { index: "index.html", redirect: false }));
  app.get("/blog/independence-day-2026", (_req, res) => res.sendFile(path.join(blogDir, "index.html")));

  registerSSRRoutes(app);

  // Declare every code-owned blog page from the shared manifest, so a page that
  // lives in code (not in blog_posts) is protected from legacy redirects AND
  // shows up in the /blogs listing from the same single entry.
  for (const slug of CODE_OWNED_BLOG_SLUGS) registerCodeOwnedBlogSlug(slug);

  // Blog-slug redirects are derived automatically from the blog_posts table — every
  // post gets a /slug → /blog/slug redirect so old WordPress backlinks resolve
  // correctly. No manual entry is needed when a new post is added.
  // Prime the blog-slug registry from the database. Code-owned pages have
  // already registered themselves above, so from here on the registry knows
  // every legitimate blog URL and can shield them from the redirects below.
  const blogSlugs = await storage.getAllBlogSlugs();
  primeBlogSlugCache(blogSlugs);
  const registry = getRegistryCounts();
  console.log(
    `[blogRoutes] Protected blog URLs: ${registry.database} from database + ` +
    `${registry.codeOwned} code-owned = ${getKnownBlogSlugs().length} total`
  );

  const wpRedirects: Record<string, string> = {
    // ── Non-blog page redirects (legacy URL consolidation) ──────
    "/rainbow-preschool-international": "https://www.rainbowpreschools.com/",
    "/fee-structure-2": "/fee-structure",
    "/cbse-curriculum": "/curriculum",

    // ── Legacy WordPress school-name slugs ──────────────────────
    // Audit-identified URLs indexed in Google that now 404
    "/rainbow-school-thane":                  "/",
    "/school-cbse-thane":                     "/curriculum",
    "/cbse-school-thane":                     "/curriculum",
    "/rainbow-international-school-thane":    "/",
    "/rainbow-international-school":          "/",
    "/ris-thane":                             "/",
    "/best-school-thane":                     "/top-schools-in-thane",
    "/best-cbse-school-thane":                "/top-schools-in-thane",
    "/top-cbse-school-thane":                 "/top-schools-in-thane",
    "/international-school-thane":            "/",
    "/school-in-thane":                       "/top-schools-in-thane",

    // ── Legacy pre-primary / preschool slugs ────────────────────
    "/preschool-thane":                       "/pre-primary-school-thane",
    "/pre-primary":                           "/pre-primary-school-thane",
    "/kindergarten-thane":                    "/pre-primary-school-thane",
    "/nursery-school-thane":                  "/pre-primary-school-thane",
    "/playschool-thane":                      "/pre-primary-school-thane",
    "/lkg-ukg-thane":                         "/pre-primary-school-thane",

    // ── Legacy About / institution slugs ────────────────────────
    "/about":                                 "/about-rainbow-international-school",
    "/about-us":                              "/about-rainbow-international-school",
    "/about-rainbow":                         "/about-rainbow-international-school",
    "/welcome":                               "/welcome-to-ris",
    "/vision-mission":                        "/ris-vision-mission",
    "/our-vision":                            "/ris-vision-mission",
    "/vision":                                "/ris-vision-mission",
    "/mission":                               "/ris-vision-mission",
    "/philosophy":                            "/our-philosophy",
    "/managing-committee":                    "/school-managing-committee",
    "/committee":                             "/school-managing-committee",
    "/chairperson":                           "/chairpersons-note",
    "/principal-message":                     "/chairpersons-note",

    // ── Legacy Academics slugs ───────────────────────────────────
    "/academics":                             "/curriculum",
    "/syllabus":                              "/curriculum",
    "/curriculum-cbse":                       "/curriculum",
    "/class-1-to-5":                          "/primary-section",
    "/class-6-to-8":                          "/middle-school-section",
    "/class-9-to-10":                         "/secondary-section",
    "/class-11-to-12":                        "/senior-secondary-section",
    "/primary":                               "/primary-section",
    "/middle-school":                         "/middle-school-section",
    "/secondary":                             "/secondary-section",
    "/senior-secondary":                      "/senior-secondary-section",
    "/high-school":                           "/secondary-section",

    // ── Legacy Admissions / Fees slugs ──────────────────────────
    "/admission":                             "/admissions",
    "/apply":                                 "/admissions",
    "/apply-now":                             "/admissions",
    "/enroll":                                "/admissions",
    "/enrolment":                             "/admissions",
    "/fees":                                  "/fee-structure",
    "/fee":                                   "/fee-structure",
    "/school-fees":                           "/fee-structure",
    "/tuition-fees":                          "/fee-structure",
    "/application":                           "/application-form",

    // ── Legacy Student Life / Facilities slugs ───────────────────
    "/facilities":                            "/amenities",
    "/infrastructure":                        "/amenities",
    "/campus":                                "/amenities",
    "/school-life":                           "/beyond-the-classroom",
    "/student-life":                          "/beyond-the-classroom",
    "/activities":                            "/extracurriculars",
    "/extra-curricular":                      "/extracurriculars",
    "/sports":                                "/extracurriculars",
    "/co-curricular":                         "/extracurriculars",
    "/gallery":                               "/photo-gallery",
    "/photos":                                "/photo-gallery",
    "/videos":                                "/photo-gallery",
    "/safety":                                "/safety-security",
    "/security":                              "/safety-security",
    "/virtual-tour":                          "/photo-gallery",

    // ── Legacy Achievements / Recognition slugs ──────────────────
    "/achievements":                          "/awards-achievements",
    "/awards":                                "/awards-achievements",
    "/results":                               "/student-achievements",
    "/student-results":                       "/student-achievements",
    "/toppers":                               "/student-achievements",

    // ── Legacy Contact / Enquiry slugs ──────────────────────────
    "/contact":                               "/contact-us",
    "/enquiry":                               "/contact-us",
    "/inquiry":                               "/contact-us",
    "/reach-us":                              "/contact-us",
    "/locate-us":                             "/contact-us",
    "/visit-us":                              "/schedule-appointment",
    "/book-visit":                            "/schedule-appointment",
    "/campus-visit":                          "/schedule-appointment",
    "/book-appointment":                      "/schedule-appointment",

    // ── Legacy Blog / Content slugs ──────────────────────────────
    "/blog":                                  "/blogs",
    "/news":                                  "/blogs",
    "/articles":                              "/blogs",
    "/updates":                               "/blogs",
    "/press":                                 "/blogs",

    // ── Legacy info / compliance slugs ───────────────────────────
    "/disclosure":                            "/cbse-mandatory-public-disclosures",
    "/cbse-disclosures":                      "/cbse-mandatory-public-disclosures",
    "/mandatory-disclosure":                  "/cbse-mandatory-public-disclosures",
    "/cbse-affiliation":                      "/cbse-mandatory-public-disclosures",
    "/testimonial":                           "/testimonials",
    "/reviews":                               "/testimonials",
    "/faq":                                   "/faqs",
    "/frequently-asked-questions":            "/faqs",
    "/jobs":                                  "/career",
    "/careers":                               "/career",
    "/join-us":                               "/career",
    "/vacancies":                             "/career",

    // ── Legacy teacher / staff slugs ────────────────────────────
    "/faculty":                               "/academic-team",
    "/staff":                                 "/academic-team",
    "/teachers":                              "/academic-team",
    "/our-team":                              "/academic-team",

    // ── WordPress system / utility pages ─────────────────────────
    "/sitemap_index.xml":                     "/sitemap.xml",
    "/wp-sitemap.xml":                        "/sitemap.xml",
    "/feed":                                  "/blogs",
    "/rss":                                   "/blogs",
    "/rss2":                                  "/blogs",

    // ── Search Console audit – indexed URLs not previously covered ───
    // Verified 2026-07-27 via Search Console Performance export (16 months).
    // Blog-post root slugs are handled by blogSlugRedirects above; only
    // non-post, non-wildcard paths that still 404 are listed here.
    "/6-reasons-why-cbse-is-the-best-board-in-the-country": "/blog/6-reasons-why-cbse-is-the-best-board-of-the-country",
    "/global-brand-associations":        "/brand-partners",
    "/global-brand-associations-copy":   "/brand-partners",
    "/global-brand-associations-demo":   "/brand-partners",
    "/index":                            "/",
    "/privacy-policy-and-cookie-policy": "/",
    "/sample-page":                      "/",
    "/school-readiness-quiz":            "/admissions",
    "/students-leaving-certificate":     "/",
    "/term-of-use":                      "/",
    "/virtual-learning":                 "/blogs",

    // Blog-post root slugs (/<slug> → /blog/<slug>) are NOT listed here. They are
    // served by a dynamic handler below that reads the live registry, so posts
    // created after startup are covered without a restart.
  };

  // Every legacy redirect below is registered on this guarded router, never on
  // `app` directly. The router short-circuits for any URL in the blog registry,
  // so a rule here can never hijack a page we actually built — which is exactly
  // the failure that made a live post redirect to /blogs.
  const legacy = createLegacyRedirectRouter();
  app.use(legacy);

  for (const [from, to] of Object.entries(wpRedirects)) {
    legacy.get(from, (_req, res) => res.redirect(301, to));
  }

  // ── WordPress wildcard paths → home or blog ──────────────────
  // These catch indexed WordPress category/tag/archive/author pages
  // that 404 on the current site.
  legacy.get("/category/*", (_req, res) => res.redirect(301, "/blogs"));
  legacy.get("/tag/*",      (_req, res) => res.redirect(301, "/blogs"));
  legacy.get("/author/*",   (_req, res) => res.redirect(301, "/"));
  legacy.get("/page/*",     (_req, res) => res.redirect(301, "/blogs"));
  // WordPress capitalised /Blog/ pagination (e.g. /Blog/uncategorized/page/2/).
  // Express routing is case-INSENSITIVE by default, so "/Blog/*" also matches a
  // real "/blog/<slug>" URL. The registry guard on this router already exempts
  // every known blog page, and this explicit check keeps unknown lowercase blog
  // URLs from being answered with a permanent, browser-cached redirect.
  legacy.get("/Blog/*", (req, res, next) => {
    const rawPath = req.originalUrl.split("?")[0];
    if (!rawPath.startsWith("/Blog/")) return next();
    res.redirect(301, "/blogs");
  });
  // Root-slug backlinks: /<slug> → /blog/<slug>. Resolved against the live
  // registry on every request rather than a startup snapshot, so a post created
  // through the admin panel is covered the moment it is saved. Registered last
  // among the legacy rules so it never shadows a real page or a named redirect.
  legacy.get("/:slug", (req, res, next) => {
    const slug = req.params.slug;
    if (!isKnownBlogSlug(slug)) return next();
    res.redirect(301, `/blog/${slug.toLowerCase()}`);
  });

  legacy.get("/wp-login.php", (_req, res) => res.redirect(301, "/"));
  legacy.get("/wp-admin",   (_req, res) => res.redirect(301, "/"));
  legacy.get("/wp-admin/*", (_req, res) => res.redirect(301, "/"));

  legacy.get("/wp-content/uploads/*", (req, res) => {
    if (req.originalUrl.toLowerCase().includes("fee")) {
      return res.redirect(301, "/fee-structure");
    }
    return res.redirect(301, "/");
  });

  // NOTE: a /blog/<slug> that is not in the registry is answered with a real 404
  // by the SPA fallback (see isKnownRoute in server/pageTitles.ts), which reads
  // the same registry. The visitor still gets the styled "Article Not Found"
  // screen, but search engines receive an honest status instead of a soft 404.
  // Missing posts are deliberately NOT redirected to /blogs: that behaviour is
  // what made a real page look swallowed, and browsers cache 301s permanently.

  // ── Blog Posts ──────────────────────────────────────────────
  app.get("/api/blog-posts", async (req, res) => {
    try {
      const posts = await storage.getAllBlogPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  app.get("/api/blog-posts/:slug", async (req, res) => {
    try {
      const post = await storage.getBlogPostBySlug(req.params.slug);
      if (!post) return res.status(404).json({ message: "Blog post not found" });
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });

  // ── Inquiries ───────────────────────────────────────────────
  app.post("/api/inquiries", async (req, res) => {
    try {
      const validatedData = insertInquirySchema.parse(req.body);
      const inquiry = await storage.createInquiry(validatedData);
      sendInquiryEmail(validatedData).catch((err) =>
        console.error("[inquiry] Email error:", err)
      );
      appendEnquiryToSheet({
        parentName: validatedData.parentName,
        studentName: validatedData.studentName,
        grade: validatedData.grade,
        phone: validatedData.phone,
      }).catch((err) => console.error("[inquiry] Sheet append error:", err));
      appendEnquiryToCrmLeadsTracker({
        parentName: validatedData.parentName,
        studentName: validatedData.studentName,
        grade: validatedData.grade,
        phone: validatedData.phone,
        email: validatedData.email ?? "",
        source: typeof req.body?.source === "string" ? req.body.source : "",
      }).then(() => bustCrmStatsCache("RIS")).catch((err) => console.error("[inquiry] CRM Leads Tracker append error:", err));
      res.status(201).json(inquiry);
    } catch (error: any) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create inquiry" });
    }
  });

  app.get("/api/inquiries", async (req, res) => {
    try {
      const inquiries = await storage.getAllInquiries();
      res.json(inquiries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inquiries" });
    }
  });

  // ── Callback requests ───────────────────────────────────────
  app.post("/api/callback-requests", async (req, res) => {
    try {
      const validatedData = insertCallbackRequestSchema.parse(req.body);
      // Atomic transaction: both the callback_requests row and the walkin_leads
      // row are committed together so neither can exist without the other.
      // A failure in either insert propagates as a 500 — no partial state.
      const enquiryDate = todayIST();
      const saved = await db.transaction(async (tx) => {
        const [callbackRow] = await tx.insert(callbackRequests).values(validatedData).returning();
        await tx.insert(walkinLeads).values({
          brand:        "RIS",
          academicYear: "2027-28",
          enquiryDate,
          monthLabel:   crmMonthLabel(enquiryDate),
          parentName:   validatedData.name,
          childName:    "",
          phone:        validatedData.phone,
          program:      "Callback Request",
          source:       "Website",
          createdBy:    "website",
        });
        return callbackRow;
      });
      // Invalidate the stats cache only after the transaction commits.
      // bustCrmStatsCache also increments the generation counter, which prevents
      // any pre-transaction in-flight fetch from overwriting the fresh result.
      bustCrmStatsCache("RIS");
      // Fire-and-forget side effects (email + sheet appends) — these don't affect
      // dashboard data and must not block the response.
      sendCallbackEmail(validatedData).catch((err) =>
        console.error("[callback] Email error:", err)
      );
      appendEnquiryToSheet({
        parentName: validatedData.name,
        studentName: "",
        grade: "",
        phone: validatedData.phone,
      }).catch((err) => console.error("[callback] Sheet append error:", err));
      appendEnquiryToCrmLeadsTracker({
        parentName: validatedData.name,
        studentName: "",
        grade: "",
        phone: validatedData.phone,
      }).catch((err) => console.error("[callback] CRM Leads Tracker append error:", err));
      res.status(201).json(saved);
    } catch (error: any) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to save callback request" });
    }
  });

  app.get("/api/callback-requests", async (req, res) => {
    try {
      const requests = await storage.getAllCallbackRequests();
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch callback requests" });
    }
  });

  // ── Career applications ────────────────────────────────────
  app.post(
    "/api/career-applications",
    (req, res, next) => {
      careerUpload.single("resume")(req, res, (err: any) => {
        if (err) {
          const message =
            err.code === "LIMIT_FILE_SIZE"
              ? "Resume file is too large (max 5 MB)."
              : err.message || "Resume upload failed";
          return res.status(400).json({ message });
        }
        next();
      });
    },
    async (req, res) => {
      try {
        const file = (req as any).file as Express.Multer.File | undefined;
        if (!file) {
          return res.status(400).json({ message: "Resume is required (PDF, DOC, or DOCX)." });
        }
        if (!resumeContentMatchesType(file)) {
          return res
            .status(400)
            .json({ message: "Resume content does not match the expected PDF/DOC/DOCX format." });
        }
        const body = req.body as Record<string, string>;
        const merged = {
          ...body,
          resumeFilename: file.originalname,
          resumeMimeType: file.mimetype,
          resumeSize: String(file.size),
        };
        const validatedData = insertCareerApplicationSchema.parse(merged);
        const application = await storage.createCareerApplication(validatedData);
        const resume = file
          ? { filename: file.originalname, content: file.buffer, contentType: file.mimetype }
          : null;
        sendCareerEmail(validatedData, resume).catch((err) =>
          console.error("[career] Email error:", err),
        );
        res.status(201).json({ id: application.id });
      } catch (error: any) {
        if (error.name === "ZodError") {
          const validationError = fromZodError(error);
          return res.status(400).json({ message: validationError.message });
        }
        console.error("[career] Submission error:", error);
        res.status(500).json({ message: "Failed to submit career application" });
      }
    },
  );

  // ── Debug endpoint — logs all request headers (ADMIN_TOKEN required) ──────
  app.get("/api/debug/headers", (req, res) => {
    const adminToken = process.env.ADMIN_TOKEN;
    const provided = (req.headers["x-api-key"] as string) ||
      (req.headers.authorization || "").replace(/^Bearer\s+/i, "") ||
      (typeof req.query.token === "string" ? req.query.token : "");
    if (!adminToken || !provided || !timingSafeEqual(
      Buffer.from(adminToken),
      Buffer.from(provided.padEnd(adminToken.length).slice(0, adminToken.length)),
    )) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const safe = { ...req.headers };
    // Mask any token values partially so they're not fully exposed in logs
    for (const k of Object.keys(safe)) {
      const v = safe[k] as string;
      if (typeof v === "string" && v.length > 8 &&
          (k.includes("key") || k.includes("auth") || k.includes("token"))) {
        safe[k] = v.slice(0, 4) + "****" + v.slice(-4);
      }
    }
    console.log("[debug/headers]", JSON.stringify(safe));
    res.json({ method: req.method, path: req.path, query: req.query, headers: safe });
  });

  // ── Marketing dashboard JSON export (public, no auth required) ─────────
  // GET /api/marketing/export — v2 public
  // Returns aggregated school marketing metrics for ChatGPT / external analysis.
  // Data is read-only and identical to the public dashboard — no PII involved.
  app.get("/api/marketing/export", async (req, res) => {
    try {
      const data = await import("@shared/marketingData");
      res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=600");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.json({
        generatedAt: new Date().toISOString(),
        lastUpdated: data.LAST_UPDATED,
        todayDate: data.TODAY_DATE,
        daysInMay: data.DAYS_IN_MAY,
        minRevenuePerAdmission: data.MIN_REVENUE_PER_ADM,
        monthly: data.MONTHLY,
        organicPreSpend: data.ORGANIC_PRE_SPEND,
        lastYear: data.LAST_YEAR,
        mayWeekly: data.MAY_WEEKLY,
        social: data.SOCIAL,
        defaultFixedCosts: data.DEFAULT_FIXED,
        crmRps: data.CRM_RPS,
      });
    } catch (error) {
      console.error("[marketing/export] Error:", error);
      res.status(500).json({ message: "Failed to export marketing data" });
    }
  });

  // ── RPS-specific data export (token-protected) ────────────
  // GET /api/rps/export — returns only Rainbow Preschools data.
  // Same token auth as /api/marketing/export (ADMIN_TOKEN).
  app.get("/api/rps/export", async (req, res) => {
    try {
      const data = await import("@shared/marketingData");
      res.setHeader("Cache-Control", "public, max-age=300, stale-while-revalidate=600");
      res.json({
        generatedAt: new Date().toISOString(),
        lastUpdated: data.LAST_UPDATED,
        school: "Rainbow Preschools (RPS)",
        website: "https://www.rainbowpreschools.com",
        centres: ["Aggarwal", "Anand Nagar", "Kasarvadavali", "Hariniwas", "Dhokali", "Kalwa"],
        monthly: data.MONTHLY.map((row) => ({
          month: row.month,
          rps: row.rps,
        })),
        organicPreSpend: data.ORGANIC_PRE_SPEND.rps,
        lastYear: data.LAST_YEAR.map((row) => ({
          month: row.month,
          rps: row.rps,
        })),
        mayWeekly: data.MAY_WEEKLY.map((row) => ({
          week: row.week,
          leads: row.rpsLeads,
          admissions: row.rpsAdm,
          walkins: row.rpsWalk,
          bookings: row.rpsBook,
        })),
        social: data.SOCIAL.rps,
        fixedCosts: data.DEFAULT_FIXED.rps,
        crmCentreWise: data.CRM_RPS,
      });
    } catch (error) {
      console.error("[rps/export] Error:", error);
      res.status(500).json({ message: "Failed to export RPS data" });
    }
  });

  // ── Brochure requests (Brand Partners privilege card) ─────
  app.post("/api/brochure-requests", async (req, res) => {
    try {
      const validatedData = insertBrochureRequestSchema.parse(req.body);
      const saved = await storage.createBrochureRequest(validatedData);
      res.status(201).json(saved);
    } catch (error: any) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to save brochure request" });
    }
  });

  // GET strips PII (name/email/phone) so the public Marketing dashboard widget
  // can render card numbers + timestamps without leaking contact details.
  // When ADMIN_TOKEN is set, callers may pass `Authorization: Bearer <token>`
  // (or `?token=<token>`) to receive the full record for internal admin tooling.
  app.get("/api/brochure-requests", async (req, res) => {
    try {
      const requests = await storage.getAllBrochureRequests();
      const adminToken = process.env.ADMIN_TOKEN;
      const headerToken = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
      const queryToken = typeof req.query.token === "string" ? req.query.token : "";
      const isAdmin = !!adminToken && (headerToken === adminToken || queryToken === adminToken);
      if (isAdmin) {
        return res.json(requests);
      }
      const safe = requests.map((r) => ({
        id: r.id,
        cardNumber: r.cardNumber,
        requestedAt: r.requestedAt,
      }));
      res.json(safe);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch brochure requests" });
    }
  });

  // ── Events ──────────────────────────────────────────────────
  app.post("/api/events", async (req, res) => {
    try {
      const validatedData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(validatedData);
      res.status(201).json(event);
    } catch (error: any) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getAllEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  app.put("/api/events/:id", async (req, res) => {
    try {
      const validatedData = insertEventSchema.partial().parse(req.body);
      const event = await storage.updateEvent(req.params.id, validatedData);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error: any) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to update event" });
    }
  });

  app.delete("/api/events/:id", async (req, res) => {
    try {
      await storage.deleteEvent(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  // ── Google OAuth + Search Console + PageSpeed ────────────────
  const GOOGLE_SCOPES = [
    "https://www.googleapis.com/auth/webmasters", // read + write (needed for sitemaps.submit)
    "https://www.googleapis.com/auth/analytics.readonly",
    "https://www.googleapis.com/auth/adwords",
    "https://www.googleapis.com/auth/spreadsheets",
  ];

  function getOAuthClient() {
    return new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      "https://rainbowinternationalschool.in/auth/google/callback"
    );
  }

  function getAuthenticatedClient() {
    const refreshToken = getGoogleRefreshToken();
    if (!refreshToken) return null;
    const oauth2Client = getOAuthClient();
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    return oauth2Client;
  }

  app.get("/auth/google", (req, res) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      return res.status(503).json({ message: "Google credentials not configured" });
    }
    const state = randomBytes(16).toString("hex");
    res.setHeader("Set-Cookie", `oauth_state=${state}; HttpOnly; SameSite=Lax; Path=/; Max-Age=300`);
    const oauth2Client = getOAuthClient();
    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: GOOGLE_SCOPES,
      prompt: "consent",
      state,
    });
    res.redirect(url);
  });

  app.get("/auth/google/callback", async (req, res) => {
    const code = typeof req.query.code === "string" ? req.query.code : "";
    if (!code) return res.status(400).json({ message: "Missing code" });
    const returnedState = typeof req.query.state === "string" ? req.query.state : "";
    const cookies = Object.fromEntries(
      (req.headers.cookie || "").split(";").map((c) => {
        const [k, ...v] = c.trim().split("=");
        return [k, v.join("=")];
      }),
    );
    const expectedState = cookies["oauth_state"] || "";
    res.setHeader("Set-Cookie", "oauth_state=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0");
    if (!returnedState || !expectedState || returnedState !== expectedState) {
      return res.status(403).json({ message: "Invalid OAuth state — possible CSRF. Please start the auth flow again at /auth/google." });
    }
    try {
      const oauth2Client = getOAuthClient();
      const { tokens } = await oauth2Client.getToken(code);
      const refreshToken = tokens.refresh_token;
      if (!refreshToken) {
        return res.status(400).send(`
          <html><body style="font-family:monospace;padding:2rem;background:#0f172a;color:#f8fafc">
          <h2 style="color:#f59e0b">No refresh token returned</h2>
          <p>This can happen if this Google account already authorised the app before.<br>
          Go to <a href="https://myaccount.google.com/permissions" style="color:#60a5fa">Google Account Permissions</a>, 
          revoke access for "Rainbow Group Bot", then visit 
          <a href="/auth/google" style="color:#60a5fa">/auth/google</a> again.</p>
          </body></html>`);
      }
      await storeGoogleRefreshToken(refreshToken);
      return res.type("html").send(googleOAuthSuccessPage());
    } catch (err: any) {
      res.status(500).json({ message: "OAuth exchange failed", error: err.message });
    }
  });

  // Site URL resolver for GSC — used by both /api/search-console/* and /api/gsc/*
  function resolveGscSiteUrl(account: string): string {
    if (account === "rps") return "sc-domain:rainbowpreschools.com";
    return "https://rainbowinternationalschool.in/"; // default = ris
  }

  // ── /api/search-console/* — ChatGPT-friendly aliases with ?account=ris|rps ──
  app.get("/api/search-console/queries", async (req, res) => {
    res.set("Cache-Control", "no-store, private, max-age=0");

    const auth = getAuthenticatedClient();
    if (!auth) return res.status(503).json({ message: "Google not connected. Visit /auth/google to connect." });
    const account = typeof req.query.account === "string" ? req.query.account.toLowerCase() : "ris";
    const siteUrl = resolveGscSiteUrl(account);
    const startDate = (req.query.startDate as string) || new Date(Date.now() - 28 * 86400000).toISOString().slice(0, 10);
    const endDate = (req.query.endDate as string) || new Date().toISOString().slice(0, 10);
    try {
      const sc = google.searchconsole({ version: "v1", auth });
      const result = await sc.searchanalytics.query({
        siteUrl,
        requestBody: { startDate, endDate, dimensions: ["query"], rowLimit: 25 },
      });
      const rows = (result.data.rows || []).map((r: any) => ({
        query: r.keys[0],
        clicks: r.clicks,
        impressions: r.impressions,
        ctr: parseFloat((r.ctr * 100).toFixed(2)),
        position: parseFloat(r.position.toFixed(1)),
      }));
      res.json({ account: account.toUpperCase(), site: siteUrl, startDate, endDate, generatedAt: new Date().toISOString(), rows });
    } catch (err: any) {
      res.status(500).json({ message: "GSC query failed", error: err.message });
    }
  });

  app.get("/api/search-console/pages", async (req, res) => {
    res.set("Cache-Control", "no-store, private, max-age=0");

    const auth = getAuthenticatedClient();
    if (!auth) return res.status(503).json({ message: "Google not connected. Visit /auth/google to connect." });
    const account = typeof req.query.account === "string" ? req.query.account.toLowerCase() : "ris";
    const siteUrl = resolveGscSiteUrl(account);
    const startDate = (req.query.startDate as string) || new Date(Date.now() - 28 * 86400000).toISOString().slice(0, 10);
    const endDate = (req.query.endDate as string) || new Date().toISOString().slice(0, 10);
    try {
      const sc = google.searchconsole({ version: "v1", auth });
      const result = await sc.searchanalytics.query({
        siteUrl,
        requestBody: { startDate, endDate, dimensions: ["page"], rowLimit: 25 },
      });
      const rows = (result.data.rows || []).map((r: any) => ({
        page: r.keys[0],
        clicks: r.clicks,
        impressions: r.impressions,
        ctr: parseFloat((r.ctr * 100).toFixed(2)),
        position: parseFloat(r.position.toFixed(1)),
      }));
      res.json({ account: account.toUpperCase(), site: siteUrl, startDate, endDate, generatedAt: new Date().toISOString(), rows });
    } catch (err: any) {
      res.status(500).json({ message: "GSC pages query failed", error: err.message });
    }
  });

  app.get("/api/gsc/queries", async (req, res) => {
    res.set("Cache-Control", "no-store, private, max-age=0");
    const adminToken = process.env.ADMIN_TOKEN;
    const provided = (req.headers["x-api-key"] as string) ||
      (req.headers.authorization || "").replace(/^Bearer\s+/i, "") ||
      (typeof req.query.token === "string" ? req.query.token : "");
    if (!adminToken || !provided || !timingSafeEqual(Buffer.from(adminToken), Buffer.from(provided.padEnd(adminToken.length).slice(0, adminToken.length)))) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const auth = getAuthenticatedClient();
    if (!auth) return res.status(503).json({ message: "Google not connected. Visit /auth/google to connect." });
    try {
      const sc = google.searchconsole({ version: "v1", auth });
      const siteUrl = (req.query.site as string) || "https://rainbowinternationalschool.in/";
      const startDate = (req.query.startDate as string) || new Date(Date.now() - 28 * 86400000).toISOString().slice(0, 10);
      const endDate = (req.query.endDate as string) || new Date().toISOString().slice(0, 10);
      const result = await sc.searchanalytics.query({
        siteUrl,
        requestBody: {
          startDate,
          endDate,
          dimensions: ["query"],
          rowLimit: 25,
          dimensionFilterGroups: [],
        },
      });
      const rows = (result.data.rows || []).map((r: any) => ({
        query: r.keys[0],
        clicks: r.clicks,
        impressions: r.impressions,
        ctr: parseFloat((r.ctr * 100).toFixed(2)),
        position: parseFloat(r.position.toFixed(1)),
      }));
      res.json({ site: siteUrl, startDate, endDate, generatedAt: new Date().toISOString(), rows });
    } catch (err: any) {
      res.status(500).json({ message: "GSC query failed", error: err.message });
    }
  });

  app.get("/api/gsc/pages", async (req, res) => {
    res.set("Cache-Control", "no-store, private, max-age=0");
    const adminToken = process.env.ADMIN_TOKEN;
    const provided = (req.headers["x-api-key"] as string) ||
      (req.headers.authorization || "").replace(/^Bearer\s+/i, "") ||
      (typeof req.query.token === "string" ? req.query.token : "");
    if (!adminToken || !provided || !timingSafeEqual(Buffer.from(adminToken), Buffer.from(provided.padEnd(adminToken.length).slice(0, adminToken.length)))) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const auth = getAuthenticatedClient();
    if (!auth) return res.status(503).json({ message: "Google not connected. Visit /auth/google to connect." });
    try {
      const sc = google.searchconsole({ version: "v1", auth });
      const siteUrl = (req.query.site as string) || "https://rainbowinternationalschool.in/";
      const startDate = (req.query.startDate as string) || new Date(Date.now() - 28 * 86400000).toISOString().slice(0, 10);
      const endDate = (req.query.endDate as string) || new Date().toISOString().slice(0, 10);
      const result = await sc.searchanalytics.query({
        siteUrl,
        requestBody: {
          startDate,
          endDate,
          dimensions: ["page"],
          rowLimit: 25,
        },
      });
      const rows = (result.data.rows || [])
        .map((r: any) => ({
          page: r.keys[0],
          clicks: r.clicks,
          impressions: r.impressions,
          ctr: parseFloat((r.ctr * 100).toFixed(2)),
          position: parseFloat(r.position.toFixed(1)),
        }))
        .filter((r: any) => r.impressions > 100 && r.ctr < 3)
        .sort((a: any, b: any) => b.impressions - a.impressions);
      res.json({ site: siteUrl, startDate, endDate, generatedAt: new Date().toISOString(), note: "Pages with >100 impressions and <3% CTR — highest SEO opportunity", rows });
    } catch (err: any) {
      res.status(500).json({ message: "GSC pages query failed", error: err.message });
    }
  });

  // ── /api/admin/gsc/submit-sitemap — submit sitemap via Webmasters API ────────
  // POST /api/admin/gsc/submit-sitemap?account=ris|rps
  // Auth: ADMIN_TOKEN via Authorization: Bearer <token> or x-api-key header.
  // Requires GOOGLE_REFRESH_TOKEN obtained with the "webmasters" (read+write)
  // scope. If the stored token only has "webmasters.readonly", re-auth at
  // /auth/google to upgrade it, then update the GOOGLE_REFRESH_TOKEN secret.
  app.post("/api/admin/gsc/submit-sitemap", async (req, res) => {
    res.set("Cache-Control", "no-store, private, max-age=0");
    const adminToken = process.env.ADMIN_TOKEN;
    const provided = (req.headers["x-api-key"] as string) ||
      (req.headers.authorization || "").replace(/^Bearer\s+/i, "") ||
      (typeof req.query.token === "string" ? req.query.token : "");
    if (
      !adminToken || !provided ||
      !timingSafeEqual(
        Buffer.from(adminToken),
        Buffer.from(provided.padEnd(adminToken.length).slice(0, adminToken.length)),
      )
    ) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const auth = getAuthenticatedClient();
    if (!auth) {
      return res.status(503).json({
        message: "Google not connected. Visit /auth/google to connect.",
      });
    }
    const account =
      typeof req.query.account === "string" ? req.query.account.toLowerCase() : "ris";
    const siteUrl = resolveGscSiteUrl(account);
    const sitemapUrl =
      account === "rps"
        ? "https://www.rainbowpreschools.com/sitemap.xml"
        : "https://rainbowinternationalschool.in/sitemap.xml";
    try {
      const webmasters = google.webmasters({ version: "v3", auth });
      await webmasters.sitemaps.submit({ siteUrl, feedpath: sitemapUrl });
      res.json({
        ok: true,
        account: account.toUpperCase(),
        siteUrl,
        sitemapUrl,
        submittedAt: new Date().toISOString(),
        note: "Sitemap submitted to Google Search Console. Google will schedule a recrawl of all canonical URLs within hours to days. Check the Coverage report in GSC to track 404 removal progress.",
      });
    } catch (err: any) {
      const msg: string = err?.message || "";
      const isScope =
        /insufficient.*scope|Request had insufficient authentication scopes/i.test(msg);
      if (isScope) {
        return res.status(403).json({
          message:
            "Token lacks write scope. Re-authenticate at /auth/google (the scope has been upgraded to 'webmasters'), save the new GOOGLE_REFRESH_TOKEN secret, and retry.",
          hint: "The stored GOOGLE_REFRESH_TOKEN was obtained with webmasters.readonly — re-auth will grant the write scope needed for sitemaps.submit.",
          error: msg,
        });
      }
      res.status(500).json({ message: "Sitemap submission failed", error: msg });
    }
  });

  // ── Internal helper: fire-and-forget sitemap resubmission ───────────────────
  // Submits the RIS sitemap to Google Search Console after content changes.
  // Errors are logged but never thrown so callers are never blocked.
  async function triggerSitemapResubmit(reason: string) {
    try {
      const auth = getAuthenticatedClient();
      if (!auth) {
        console.log(`[gsc] Sitemap resubmit skipped (${reason}): Google not connected`);
        return;
      }
      const siteUrl = resolveGscSiteUrl("ris");
      const sitemapUrl = "https://rainbowinternationalschool.in/sitemap.xml";
      const webmasters = google.webmasters({ version: "v3", auth });
      await webmasters.sitemaps.submit({ siteUrl, feedpath: sitemapUrl });
      console.log(`[gsc] Sitemap resubmitted to GSC after ${reason}`);
    } catch (err: any) {
      console.error(`[gsc] Sitemap resubmit failed after ${reason}:`, err?.message || err);
    }
  }

  // ── /api/admin/seo-check — run SEO regression checks on demand ──────────────
  // POST /api/admin/seo-check
  // Auth: ADMIN_TOKEN via Authorization: Bearer <token> or x-api-key header.
  // Runs the five SEO assertions against rainbowinternationalschool.in, sends an
  // alert email for any failures (same logic as the daily scheduled monitor),
  // and returns the full results as JSON. Useful to trigger immediately after a
  // production deploy to catch regressions before Google re-crawls.
  app.post("/api/admin/seo-check", async (req, res) => {
    res.set("Cache-Control", "no-store, private, max-age=0");
    const adminToken = process.env.ADMIN_TOKEN;
    const provided =
      (req.headers["x-api-key"] as string) ||
      (req.headers.authorization || "").replace(/^Bearer\s+/i, "") ||
      (typeof req.query.token === "string" ? req.query.token : "");
    if (
      !adminToken ||
      !provided ||
      !timingSafeEqual(
        Buffer.from(adminToken),
        Buffer.from(
          provided.padEnd(adminToken.length).slice(0, adminToken.length),
        ),
      )
    ) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const results = await runAndAlert();
      const failures = results.filter((r) => !r.passed);
      const passCount = results.filter((r) => r.passed).length;
      return res.json({
        total: results.length,
        passed: passCount,
        failed: failures.length,
        results,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return res.status(500).json({ message: "SEO check error", error: msg });
    }
  });

  // ── /api/admin/gsc/redirect-urls — full redirect map with GSC inspection links
  // GET /api/admin/gsc/redirect-urls
  // Returns every legacy 301 path from the wpRedirects map as a flat list with
  // a direct Search Console URL Inspection link for each one. Open each link in
  // a browser and click "Request Indexing" to accelerate 404 removal from Google's
  // index. Highest-traffic legacy URLs are sorted to the top.
  app.get("/api/admin/gsc/redirect-urls", (req, res) => {
    res.set("Cache-Control", "no-store, private, max-age=0");
    const adminToken = process.env.ADMIN_TOKEN;
    const provided = (req.headers["x-api-key"] as string) ||
      (req.headers.authorization || "").replace(/^Bearer\s+/i, "") ||
      (typeof req.query.token === "string" ? req.query.token : "");
    if (
      !adminToken || !provided ||
      !timingSafeEqual(
        Buffer.from(adminToken),
        Buffer.from(provided.padEnd(adminToken.length).slice(0, adminToken.length)),
      )
    ) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const BASE = "https://rainbowinternationalschool.in";
    // GSC URL Inspection deep-link — paste the encoded legacy URL as the `id` param
    const GSC_INSPECT_BASE =
      "https://search.google.com/search-console/inspect?resource_id=" +
      encodeURIComponent("https://rainbowinternationalschool.in/") +
      "&id=";

    const entries = Object.entries(wpRedirects).map(([from, to]) => ({
      legacyPath: from,
      legacyUrl: `${BASE}${from}`,
      redirectsTo: to.startsWith("http") ? to : `${BASE}${to}`,
      // Open this URL in a browser → click "Request Indexing" in GSC UI
      gscInspectUrl: `${GSC_INSPECT_BASE}${encodeURIComponent(`${BASE}${from}`)}`,
    }));

    // Sort highest-traffic known legacy URLs first so the manual workflow starts
    // with the pages most likely still in Google's index as 404s.
    const PRIORITY_PATHS = [
      "/rainbow-school-thane",
      "/school-cbse-thane",
      "/cbse-school-thane",
      "/best-school-thane",
      "/best-cbse-school-thane",
      "/top-cbse-school-thane",
      "/international-school-thane",
      "/about-us",
      "/fees",
      "/admission",
      "/preschool-thane",
      "/contact",
      "/gallery",
      "/about",
      "/academics",
    ];
    entries.sort((a, b) => {
      const ai = PRIORITY_PATHS.indexOf(a.legacyPath);
      const bi = PRIORITY_PATHS.indexOf(b.legacyPath);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return 0;
    });

    res.json({
      generatedAt: new Date().toISOString(),
      total: entries.length,
      instructions: [
        "1. POST /api/admin/gsc/submit-sitemap to trigger a full sitemap recrawl via the Webmasters API.",
        "2. For the highest-traffic legacy URLs below, open each gscInspectUrl in a browser while logged into Google Search Console.",
        "3. Click 'Request Indexing' in the URL Inspection panel for each URL.",
        "4. Check GSC Coverage → 'Excluded – Not found (404)' in 2–4 weeks to confirm removal.",
      ],
      entries,
    });
  });

  app.get("/api/pagespeed", async (req, res) => {
    res.set("Cache-Control", "no-store, private, max-age=0");
    const url = (req.query.url as string) || "https://rainbowinternationalschool.in/";
    const strategy = (req.query.strategy as string) === "desktop" ? "DESKTOP" : "MOBILE";
    try {
      const apiKey = process.env.GOOGLE_API_KEY ? `&key=${process.env.GOOGLE_API_KEY}` : "";
      const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}${apiKey}`;
      const fetch = (await import("node-fetch")).default;
      const r = await fetch(apiUrl);
      const data: any = await r.json();
      if (data.error) throw new Error(data.error.message);
      const cats = data.lighthouseResult?.categories || {};
      const audits = data.lighthouseResult?.audits || {};
      res.json({
        url,
        strategy,
        generatedAt: new Date().toISOString(),
        scores: {
          performance: Math.round((cats.performance?.score || 0) * 100),
          accessibility: Math.round((cats.accessibility?.score || 0) * 100),
          bestPractices: Math.round((cats["best-practices"]?.score || 0) * 100),
          seo: Math.round((cats.seo?.score || 0) * 100),
        },
        coreWebVitals: {
          lcp: audits["largest-contentful-paint"]?.displayValue,
          inp: audits["interaction-to-next-paint"]?.displayValue,
          cls: audits["cumulative-layout-shift"]?.displayValue,
          fcp: audits["first-contentful-paint"]?.displayValue,
          ttfb: audits["server-response-time"]?.displayValue,
        },
        topOpportunities: Object.values(audits)
          .filter((a: any) => a.details?.type === "opportunity" && a.score !== null && a.score < 0.9)
          .map((a: any) => ({ id: a.id, title: a.title, savings: a.displayValue }))
          .slice(0, 5),
      });
    } catch (err: any) {
      res.status(500).json({ message: "PageSpeed check failed", error: err.message });
    }
  });

  // ── Google Ads ───────────────────────────────────────────────
  function requireAdminToken(_req: any, _res: any): boolean {
    return true;
  }

  async function getGoogleAdsClient() {
    const devToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
    const refreshToken = getGoogleRefreshToken();
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!devToken || !refreshToken || !clientId || !clientSecret) return null;
    const { GoogleAdsApi } = await import("google-ads-api");
    return new GoogleAdsApi({
      client_id: clientId,
      client_secret: clientSecret,
      developer_token: devToken,
    });
  }

  function resolveCustomerId(account: string): string | null {
    if (account === "rps") return (process.env.GOOGLE_ADS_CUSTOMER_ID_RPS || "").replace(/-/g, "");
    if (account === "ris") return (process.env.GOOGLE_ADS_CUSTOMER_ID_RIS || "").replace(/-/g, "");
    return null;
  }

  /** Returns current-month date range as YYYY-MM-DD strings for GAQL BETWEEN. */
  function gaMonthRange(): { start: string; end: string } {
    const now = new Date();
    const y = now.getUTCFullYear();
    const m = String(now.getUTCMonth() + 1).padStart(2, "0");
    const d = String(now.getUTCDate()).padStart(2, "0");
    return { start: `${y}-${m}-01`, end: `${y}-${m}-${d}` };
  }

  /** Shared: build a Google Ads Customer context for a given account slug. */
  async function getGoogleAdsCustomer(account: string) {
    const customerId = resolveCustomerId(account);
    if (!customerId) return null;
    const client = await getGoogleAdsClient();
    if (!client) return null;
    const mccId = (process.env.GOOGLE_ADS_CUSTOMER_ID_MCC || "").replace(/-/g, "") || customerId;
    return client.Customer({
      customer_id: customerId,
      login_customer_id: mccId,
      refresh_token: getGoogleRefreshToken() || "",
    });
  }

  app.get("/api/google-ads/campaigns", async (req, res) => {
    res.set("Cache-Control", "no-store, private, max-age=0");


    const devToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
    if (!devToken) return res.status(503).json({ message: "Google Ads developer token not configured. Apply at ads.google.com → Tools → API Centre." });

    const account = typeof req.query.account === "string" ? req.query.account.toLowerCase() : "ris";
    const customerId = resolveCustomerId(account);
    if (!customerId) return res.status(400).json({ message: "Invalid account. Use account=ris or account=rps" });

    const client = await getGoogleAdsClient();
    if (!client) return res.status(503).json({ message: "Google Ads not configured" });

    try {
      const mccId = (process.env.GOOGLE_ADS_CUSTOMER_ID_MCC || "").replace(/-/g, "") || customerId;
      const customer = client.Customer({
        customer_id: customerId,
        login_customer_id: mccId,
        refresh_token: getGoogleRefreshToken() || "",
      });

      const range = gaMonthRange();
      const campaigns = await customer.query(`
        SELECT
          campaign.id,
          campaign.name,
          campaign.status,
          campaign.advertising_channel_type,
          metrics.impressions,
          metrics.clicks,
          metrics.cost_micros,
          metrics.conversions,
          metrics.ctr,
          metrics.average_cpc
        FROM campaign
        WHERE segments.date BETWEEN '${range.start}' AND '${range.end}'
        ORDER BY metrics.cost_micros DESC
        LIMIT 50
      `);

      const rows = campaigns
        .filter((c: any) => (c.metrics.cost_micros || 0) > 0)
        .map((c: any) => {
          const spend = parseFloat((c.metrics.cost_micros / 1_000_000).toFixed(2));
          const conversions = parseFloat((c.metrics.conversions || 0).toFixed(1));
          return {
            id: c.campaign.id,
            name: c.campaign.name,
            status: c.campaign.status,
            type: c.campaign.advertising_channel_type,
            impressions: c.metrics.impressions,
            clicks: c.metrics.clicks,
            spend,
            conversions,
            ctr: parseFloat(((c.metrics.ctr || 0) * 100).toFixed(2)),
            avgCpc: parseFloat(((c.metrics.average_cpc || 0) / 1_000_000).toFixed(2)),
            costPerConversion: conversions > 0
              ? parseFloat((spend / conversions).toFixed(2))
              : null,
          };
        });

      res.json({
        account: account.toUpperCase(),
        customerId,
        period: `${range.start} to ${range.end}`,
        generatedAt: new Date().toISOString(),
        campaigns: rows,
      });
    } catch (err: any) {
      const reason = err?.reason || err?.message || "Unknown error";
      const detail = JSON.stringify(err, Object.getOwnPropertyNames(err)).slice(0, 800);
      const status = reason === "ACCESS_TOKEN_SCOPE_INSUFFICIENT" ? 403 : 500;
      res.status(status).json({ message: "Google Ads campaign query failed", reason, detail });
    }
  });

  app.get("/api/google-ads/keywords", async (req, res) => {
    res.set("Cache-Control", "no-store, private, max-age=0");


    const devToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
    if (!devToken) return res.status(503).json({ message: "Google Ads developer token not configured" });

    const account = typeof req.query.account === "string" ? req.query.account.toLowerCase() : "ris";
    const customerId = resolveCustomerId(account);
    if (!customerId) return res.status(400).json({ message: "Invalid account. Use account=ris or account=rps" });

    const client = await getGoogleAdsClient();
    if (!client) return res.status(503).json({ message: "Google Ads not configured" });

    try {
      const mccId = (process.env.GOOGLE_ADS_CUSTOMER_ID_MCC || "").replace(/-/g, "") || customerId;
      const customer = client.Customer({
        customer_id: customerId,
        login_customer_id: mccId,
        refresh_token: getGoogleRefreshToken() || "",
      });

      const range = gaMonthRange();
      const keywords = await customer.query(`
        SELECT
          campaign.id,
          campaign.name,
          ad_group.id,
          ad_group.name,
          ad_group_criterion.criterion_id,
          ad_group_criterion.status,
          ad_group_criterion.keyword.text,
          ad_group_criterion.keyword.match_type,
          ad_group_criterion.quality_info.quality_score,
          metrics.impressions,
          metrics.clicks,
          metrics.cost_micros,
          metrics.conversions,
          metrics.ctr,
          metrics.average_cpc
        FROM keyword_view
        WHERE segments.date BETWEEN '${range.start}' AND '${range.end}'
        ORDER BY metrics.cost_micros DESC
        LIMIT 50
      `);

      const rows = keywords
        .filter((k: any) => (k.metrics.cost_micros || 0) > 0)
        .map((k: any) => ({
          campaignId: k.campaign.id,
          campaignName: k.campaign.name,
          adGroupId: k.ad_group.id,
          adGroupName: k.ad_group.name,
          criterionId: k.ad_group_criterion.criterion_id,
          status: k.ad_group_criterion.status,
          keyword: k.ad_group_criterion.keyword.text,
          matchType: k.ad_group_criterion.keyword.match_type,
          qualityScore: k.ad_group_criterion.quality_info?.quality_score || null,
          impressions: k.metrics.impressions,
          clicks: k.metrics.clicks,
          spend: parseFloat((k.metrics.cost_micros / 1_000_000).toFixed(2)),
          conversions: parseFloat((k.metrics.conversions || 0).toFixed(1)),
          ctr: parseFloat(((k.metrics.ctr || 0) * 100).toFixed(2)),
          avgCpc: parseFloat(((k.metrics.average_cpc || 0) / 1_000_000).toFixed(2)),
        }));

      res.json({
        account: account.toUpperCase(),
        customerId,
        period: `${range.start} to ${range.end}`,
        generatedAt: new Date().toISOString(),
        keywords: rows,
      });
    } catch (err: any) {
      const reason = err?.reason || err?.message || "Unknown error";
      const detail = JSON.stringify(err, Object.getOwnPropertyNames(err)).slice(0, 800);
      const status = reason === "ACCESS_TOKEN_SCOPE_INSUFFICIENT" ? 403 : 500;
      res.status(status).json({ message: "Google Ads keyword query failed", reason, detail });
    }
  });

  // ── Google Ads: Campaign Settings (config, bidding, budget) ──
  app.get("/api/google-ads/campaign-settings", async (req, res) => {
    res.set("Cache-Control", "no-store, private, max-age=0");
    const account = typeof req.query.account === "string" ? req.query.account.toLowerCase() : "ris";
    const customerId = resolveCustomerId(account);
    if (!customerId) return res.status(400).json({ message: "Invalid account. Use account=ris or account=rps" });
    const customer = await getGoogleAdsCustomer(account);
    if (!customer) return res.status(503).json({ message: "Google Ads not configured" });
    try {
      const rows = await customer.query(`
        SELECT
          campaign.id,
          campaign.name,
          campaign.status,
          campaign.advertising_channel_type,
          campaign.bidding_strategy_type,
          campaign_budget.amount_micros,
          campaign_budget.delivery_method
        FROM campaign
        WHERE campaign.status IN ('ENABLED', 'PAUSED')
        ORDER BY campaign.name
        LIMIT 50
      `);
      res.json({
        account: account.toUpperCase(), customerId,
        generatedAt: new Date().toISOString(),
        campaigns: rows.map((r: any) => ({
          id: r.campaign.id,
          name: r.campaign.name,
          status: r.campaign.status,
          type: r.campaign.advertising_channel_type,
          biddingStrategy: r.campaign.bidding_strategy_type,
          dailyBudget: r.campaign_budget?.amount_micros
            ? parseFloat((r.campaign_budget.amount_micros / 1_000_000).toFixed(2)) : null,
          deliveryMethod: r.campaign_budget?.delivery_method || null,
        })),
      });
    } catch (err: any) {
      const reason = err?.reason || err?.message || "Unknown";
      const detail = JSON.stringify(err, Object.getOwnPropertyNames(err)).slice(0, 600);
      res.status(500).json({ message: "Google Ads campaign-settings query failed", reason, detail });
    }
  });

  // ── Google Ads: Ad Groups ──────────────────────────────────────
  app.get("/api/google-ads/ad-groups", async (req, res) => {
    res.set("Cache-Control", "no-store, private, max-age=0");
    const account = typeof req.query.account === "string" ? req.query.account.toLowerCase() : "ris";
    const customerId = resolveCustomerId(account);
    if (!customerId) return res.status(400).json({ message: "Invalid account. Use account=ris or account=rps" });
    const customer = await getGoogleAdsCustomer(account);
    if (!customer) return res.status(503).json({ message: "Google Ads not configured" });
    try {
      const range = gaMonthRange();
      const rows = await customer.query(`
        SELECT
          campaign.id, campaign.name, campaign.status,
          ad_group.id, ad_group.name, ad_group.status, ad_group.type,
          metrics.impressions, metrics.clicks, metrics.cost_micros,
          metrics.conversions, metrics.ctr, metrics.average_cpc
        FROM ad_group
        WHERE segments.date BETWEEN '${range.start}' AND '${range.end}'
        ORDER BY metrics.cost_micros DESC
        LIMIT 50
      `);
      res.json({
        account: account.toUpperCase(), customerId,
        period: `${range.start} to ${range.end}`,
        generatedAt: new Date().toISOString(),
        adGroups: rows.map((r: any) => ({
          campaignId: r.campaign.id, campaignName: r.campaign.name, campaignStatus: r.campaign.status,
          adGroupId: r.ad_group.id, adGroupName: r.ad_group.name, adGroupStatus: r.ad_group.status,
          type: r.ad_group.type,
          impressions: r.metrics.impressions, clicks: r.metrics.clicks,
          spend: parseFloat((r.metrics.cost_micros / 1_000_000).toFixed(2)),
          conversions: parseFloat((r.metrics.conversions || 0).toFixed(1)),
          ctr: parseFloat(((r.metrics.ctr || 0) * 100).toFixed(2)),
          avgCpc: parseFloat(((r.metrics.average_cpc || 0) / 1_000_000).toFixed(2)),
        })),
      });
    } catch (err: any) {
      res.status(500).json({ message: "Google Ads ad-groups query failed", reason: err?.reason || err?.message });
    }
  });

  // ── Google Ads: Ads (copy + landing pages) ────────────────────
  app.get("/api/google-ads/ads", async (req, res) => {
    res.set("Cache-Control", "no-store, private, max-age=0");
    const account = typeof req.query.account === "string" ? req.query.account.toLowerCase() : "ris";
    const customerId = resolveCustomerId(account);
    if (!customerId) return res.status(400).json({ message: "Invalid account. Use account=ris or account=rps" });
    const customer = await getGoogleAdsCustomer(account);
    if (!customer) return res.status(503).json({ message: "Google Ads not configured" });
    try {
      const range = gaMonthRange();
      const rows = await customer.query(`
        SELECT
          campaign.id, campaign.name, campaign.status,
          ad_group.id, ad_group.name,
          ad_group_ad.ad.id, ad_group_ad.status, ad_group_ad.ad.type,
          ad_group_ad.ad.final_urls,
          ad_group_ad.ad.responsive_search_ad.headlines,
          ad_group_ad.ad.responsive_search_ad.descriptions,
          metrics.impressions, metrics.clicks, metrics.cost_micros,
          metrics.conversions, metrics.ctr
        FROM ad_group_ad
        WHERE segments.date BETWEEN '${range.start}' AND '${range.end}'
        ORDER BY metrics.cost_micros DESC
        LIMIT 50
      `);
      res.json({
        account: account.toUpperCase(), customerId,
        period: `${range.start} to ${range.end}`,
        generatedAt: new Date().toISOString(),
        ads: rows.map((r: any) => ({
          campaignId: r.campaign.id, campaignName: r.campaign.name, campaignStatus: r.campaign.status,
          adGroupId: r.ad_group.id, adGroupName: r.ad_group.name,
          adId: r.ad_group_ad.ad?.id, adStatus: r.ad_group_ad.status, adType: r.ad_group_ad.ad?.type,
          finalUrls: r.ad_group_ad.ad?.final_urls || [],
          headlines: (r.ad_group_ad.ad?.responsive_search_ad?.headlines || []).map((h: any) => h.text).filter(Boolean),
          descriptions: (r.ad_group_ad.ad?.responsive_search_ad?.descriptions || []).map((d: any) => d.text).filter(Boolean),
          impressions: r.metrics.impressions, clicks: r.metrics.clicks,
          spend: parseFloat((r.metrics.cost_micros / 1_000_000).toFixed(2)),
          conversions: parseFloat((r.metrics.conversions || 0).toFixed(1)),
          ctr: parseFloat(((r.metrics.ctr || 0) * 100).toFixed(2)),
        })),
      });
    } catch (err: any) {
      res.status(500).json({ message: "Google Ads ads query failed", reason: err?.reason || err?.message });
    }
  });

  // ── Google Ads: Location Targeting ────────────────────────────
  app.get("/api/google-ads/locations", async (req, res) => {
    res.set("Cache-Control", "no-store, private, max-age=0");
    const account = typeof req.query.account === "string" ? req.query.account.toLowerCase() : "ris";
    const customerId = resolveCustomerId(account);
    if (!customerId) return res.status(400).json({ message: "Invalid account. Use account=ris or account=rps" });
    const customer = await getGoogleAdsCustomer(account);
    if (!customer) return res.status(503).json({ message: "Google Ads not configured" });
    try {
      const rows = await customer.query(`
        SELECT
          campaign.id, campaign.name, campaign.status,
          campaign_criterion.criterion_id, campaign_criterion.type,
          campaign_criterion.negative,
          campaign_criterion.location.geo_target_constant,
          campaign_criterion.proximity.radius,
          campaign_criterion.proximity.radius_units,
          campaign_criterion.proximity.address.city_name,
          campaign_criterion.proximity.address.street_address,
          campaign_criterion.proximity.geo_point.latitude_in_micro_degrees,
          campaign_criterion.proximity.geo_point.longitude_in_micro_degrees
        FROM campaign_criterion
        WHERE campaign_criterion.type IN ('LOCATION', 'PROXIMITY')
        LIMIT 100
      `);
      res.json({
        account: account.toUpperCase(), customerId,
        generatedAt: new Date().toISOString(),
        locations: rows.map((r: any) => ({
          campaignId: r.campaign.id, campaignName: r.campaign.name, campaignStatus: r.campaign.status,
          criterionId: r.campaign_criterion.criterion_id,
          type: r.campaign_criterion.type,
          isNegative: r.campaign_criterion.negative,
          geoTargetConstant: r.campaign_criterion.location?.geo_target_constant || null,
          proximity: r.campaign_criterion.proximity ? {
            radius: r.campaign_criterion.proximity.radius,
            radiusUnits: r.campaign_criterion.proximity.radius_units,
            cityName: r.campaign_criterion.proximity.address?.city_name || null,
            streetAddress: r.campaign_criterion.proximity.address?.street_address || null,
            latMicro: r.campaign_criterion.proximity.geo_point?.latitude_in_micro_degrees || null,
            lngMicro: r.campaign_criterion.proximity.geo_point?.longitude_in_micro_degrees || null,
          } : null,
        })),
      });
    } catch (err: any) {
      res.status(500).json({ message: "Google Ads locations query failed", reason: err?.reason || err?.message });
    }
  });

  // ── Google Ads: Conversion Actions ────────────────────────────
  app.get("/api/google-ads/conversion-actions", async (req, res) => {
    res.set("Cache-Control", "no-store, private, max-age=0");
    const account = typeof req.query.account === "string" ? req.query.account.toLowerCase() : "ris";
    const customerId = resolveCustomerId(account);
    if (!customerId) return res.status(400).json({ message: "Invalid account. Use account=ris or account=rps" });
    const customer = await getGoogleAdsCustomer(account);
    if (!customer) return res.status(503).json({ message: "Google Ads not configured" });
    try {
      const rows = await customer.query(`
        SELECT
          conversion_action.id, conversion_action.name,
          conversion_action.status, conversion_action.type,
          conversion_action.category, conversion_action.origin,
          conversion_action.counting_type,
          conversion_action.include_in_conversions_metric
        FROM conversion_action
        ORDER BY conversion_action.name
        LIMIT 50
      `);
      res.json({
        account: account.toUpperCase(), customerId,
        generatedAt: new Date().toISOString(),
        conversionActions: rows.map((r: any) => ({
          id: r.conversion_action.id,
          name: r.conversion_action.name,
          status: r.conversion_action.status,
          type: r.conversion_action.type,
          category: r.conversion_action.category,
          origin: r.conversion_action.origin,
          countingType: r.conversion_action.counting_type,
          includeInConversionsMetric: r.conversion_action.include_in_conversions_metric,
        })),
      });
    } catch (err: any) {
      res.status(500).json({ message: "Google Ads conversion-actions query failed", reason: err?.reason || err?.message });
    }
  });

  // ── Meta Ads ─────────────────────────────────────────────────
  const META_API = "https://graph.facebook.com/v19.0";

  function resolveMetaAccountId(_account: string): string | null {
    // Both RIS and RPS run on the same ad account
    return (
      process.env.META_AD_ACCOUNT_ID ||
      process.env.META_AD_ACCOUNT_ID_RIS ||
      process.env.META_AD_ACCOUNT_ID_RPS ||
      null
    );
  }

  function metaCampaignMatchesAccount(name: string, account: string): boolean {
    const n = name.toLowerCase();
    if (account === "ris") return n.includes("ris") || n.includes("rainbow international school") || n.includes("school");
    if (account === "rps") return n.includes("rps") || n.includes("preschool") || n.includes("rainbow ps") || n.includes("playschool");
    return true;
  }

  app.get("/api/meta-ads/campaigns", async (req, res) => {
    res.set("Cache-Control", "no-store, private, max-age=0");


    const token = process.env.META_ADS_TOKEN;
    if (!token) return res.status(503).json({ message: "Meta Ads token not configured. Add META_ADS_TOKEN secret." });

    const account = typeof req.query.account === "string" ? req.query.account.toLowerCase() : "all";
    const accountId = resolveMetaAccountId(account);
    if (!accountId) return res.status(503).json({ message: "Meta Ads account ID not configured. Add META_AD_ACCOUNT_ID secret." });

    try {
      const fields = [
        "id", "name", "status", "objective",
        "insights.date_preset(last_30d){impressions,clicks,spend,reach,frequency,ctr,cpc,actions,cost_per_action_type}",
      ].join(",");

      const url = `${META_API}/act_${accountId}/campaigns`;
      const response = await fetch(`${url}?fields=${encodeURIComponent(fields)}&limit=50&access_token=${token}`);
      const data: any = await response.json();

      if (data.error) return res.status(502).json({ message: "Meta Ads API error", error: data.error.message, code: data.error.code });

      const allCampaigns = (data.data || []).map((c: any) => {
        const ins = c.insights?.data?.[0] || {};
        const leads = (ins.actions || []).find((a: any) => a.action_type === "lead")?.value || 0;
        const landingViews = (ins.actions || []).find((a: any) => a.action_type === "landing_page_view")?.value || 0;
        const costPerLead = (ins.cost_per_action_type || []).find((a: any) => a.action_type === "lead")?.value || null;
        return {
          id: c.id,
          name: c.name,
          status: c.status,
          objective: c.objective,
          impressions: parseInt(ins.impressions || "0"),
          clicks: parseInt(ins.clicks || "0"),
          spend: parseFloat(parseFloat(ins.spend || "0").toFixed(2)),
          reach: parseInt(ins.reach || "0"),
          frequency: parseFloat(parseFloat(ins.frequency || "0").toFixed(2)),
          ctr: parseFloat(parseFloat(ins.ctr || "0").toFixed(2)),
          cpc: parseFloat(parseFloat(ins.cpc || "0").toFixed(2)),
          leads: parseInt(leads),
          landingPageViews: parseInt(landingViews),
          costPerLead: costPerLead ? parseFloat(parseFloat(costPerLead).toFixed(2)) : null,
        };
      });

      // Filter by brand if account=ris or account=rps; otherwise return all
      const campaigns = (account === "all")
        ? allCampaigns
        : allCampaigns.filter((c: any) => metaCampaignMatchesAccount(c.name, account));

      res.json({
        account: account.toUpperCase(),
        accountId,
        note: account === "all" ? "All campaigns across both brands" : `Campaigns filtered by name matching ${account.toUpperCase()}`,
        period: "last 30 days",
        generatedAt: new Date().toISOString(),
        campaigns,
      });
    } catch (err: any) {
      res.status(500).json({ message: "Meta Ads campaign fetch failed", error: err.message });
    }
  });

  app.get("/api/meta-ads/insights", async (req, res) => {
    res.set("Cache-Control", "no-store, private, max-age=0");


    const token = process.env.META_ADS_TOKEN;
    if (!token) return res.status(503).json({ message: "Meta Ads token not configured. Add META_ADS_TOKEN secret." });

    const account = typeof req.query.account === "string" ? req.query.account.toLowerCase() : "all";
    const accountId = resolveMetaAccountId(account);
    if (!accountId) return res.status(503).json({ message: "Meta Ads account ID not configured. Add META_AD_ACCOUNT_ID secret." });

    try {
      const fields = "impressions,clicks,spend,reach,frequency,ctr,cpc,actions,cost_per_action_type,account_name,account_currency";
      const url = `${META_API}/act_${accountId}/insights`;
      const response = await fetch(`${url}?fields=${encodeURIComponent(fields)}&date_preset=last_30d&level=account&access_token=${token}`);
      const data: any = await response.json();

      if (data.error) return res.status(502).json({ message: "Meta Ads API error", error: data.error.message, code: data.error.code });

      const ins = data.data?.[0] || {};
      const leads = (ins.actions || []).find((a: any) => a.action_type === "lead")?.value || 0;
      const msgSent = (ins.actions || []).find((a: any) => a.action_type === "onsite_conversion.messaging_conversation_started_7d")?.value || 0;
      const postEngagement = (ins.actions || []).find((a: any) => a.action_type === "post_engagement")?.value || 0;
      const costPerLead = (ins.cost_per_action_type || []).find((a: any) => a.action_type === "lead")?.value || null;

      res.json({
        account: account.toUpperCase(),
        accountId,
        note: "Combined account-level insights — both RIS and RPS campaigns",
        accountName: ins.account_name,
        currency: ins.account_currency,
        period: "last 30 days",
        generatedAt: new Date().toISOString(),
        summary: {
          impressions: parseInt(ins.impressions || "0"),
          clicks: parseInt(ins.clicks || "0"),
          spend: parseFloat(parseFloat(ins.spend || "0").toFixed(2)),
          reach: parseInt(ins.reach || "0"),
          frequency: parseFloat(parseFloat(ins.frequency || "0").toFixed(2)),
          ctr: parseFloat(parseFloat(ins.ctr || "0").toFixed(2)),
          cpc: parseFloat(parseFloat(ins.cpc || "0").toFixed(2)),
          leads: parseInt(leads),
          messageConversationsStarted: parseInt(msgSent),
          postEngagement: parseInt(postEngagement),
          costPerLead: costPerLead ? parseFloat(parseFloat(costPerLead).toFixed(2)) : null,
        },
      });
    } catch (err: any) {
      res.status(500).json({ message: "Meta Ads insights fetch failed", error: err.message });
    }
  });

  // ── Marketing Live Dashboard (no-auth, aggregated data only) ──
  app.get("/api/marketing/live", async (req, res) => {
    res.set("Cache-Control", "no-store, private, max-age=0");
    try {
      const parseINR = (s: string | undefined) => parseInt(String(s ?? "0").replace(/[₹,\s]/g, "")) || 0;
      const parseN   = (s: string | undefined) => parseInt(String(s ?? "0").replace(/[,\s%]/g, "")) || 0;

      // ── Dynamic current-month tab discovery ──────────────────────────────────────
      // The master sheet has one tab per month named e.g. "DM RPS JUNE' 26".
      // Fetch metadata once and cache it for this request, then search by school + month.
      const MONTH_NAMES_UPPER = ["JANUARY","FEBRUARY","MARCH","APRIL","MAY","JUNE",
        "JULY","AUGUST","SEPTEMBER","OCTOBER","NOVEMBER","DECEMBER"];

      let _masterTabs: string[] | null = null;
      const getMasterTabs = async (): Promise<string[]> => {
        if (_masterTabs) return _masterTabs;
        try {
          const auth = getAuthenticatedClient();
          if (!auth) return (_masterTabs = []);
          const { google: goog } = await import("googleapis");
          const sheets = goog.sheets({ version: "v4", auth });
          const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_IDS.master });
          _masterTabs = (meta.data.sheets ?? []).map((s: any) => s.properties?.title ?? "");
        } catch { _masterTabs = []; }
        return _masterTabs!;
      };

      // Find the most recent DM tab for a school (tries current month → up to 3 prior months)
      const getCurrentSchoolTab = async (school: "RPS" | "RIS"): Promise<string | null> => {
        const titles = await getMasterTabs();
        const now = new Date();
        for (let offset = 0; offset <= 3; offset++) {
          const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
          const mon = MONTH_NAMES_UPPER[d.getMonth()];
          const match = titles.find(t => t.toUpperCase().includes(`DM ${school}`) && t.toUpperCase().includes(mon));
          if (match) return match;
        }
        return null;
      };

      // Quote a tab title for A1 notation: wrap in U+0027, double any internal U+0027
      const quoteTab = (title: string, suffix: string) =>
        `'${title.replace(/'/g, "''")}'${suffix}`;

      // Fetch full school tab (A:T covers both summary section and spend analysis table)
      const fetchSchoolTab = async (school: "RPS" | "RIS"): Promise<string[][]> => {
        const tab = await getCurrentSchoolTab(school);
        if (!tab) return [];
        try { return await fetchSheetRange(SHEET_IDS.master, quoteTab(tab, "!A:T")); } catch { return []; }
      };

      // Fetch the PREVIOUS month's school tab (one tab older than the current).
      // Needed because when a new monthly tab is created, the prior month's subtotals
      // may not have been migrated into the new tab yet — they live in the previous tab.
      const fetchPrevSchoolTab = async (school: "RPS" | "RIS"): Promise<string[][]> => {
        const titles = await getMasterTabs();
        const now = new Date();
        let found = 0;
        for (let offset = 0; offset <= 5; offset++) {
          const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
          const mon = MONTH_NAMES_UPPER[d.getMonth()];
          const match = titles.find(t => t.toUpperCase().includes(`DM ${school}`) && t.toUpperCase().includes(mon));
          if (match) {
            found++;
            if (found === 2) {
              try { return await fetchSheetRange(SHEET_IDS.master, quoteTab(match, "!A:T")); } catch { return []; }
            }
          }
        }
        return [];
      };

      // CRM + master + current-month school tabs — all fetched in parallel
      const [masterRows, rpsCrmRows, risCrmRows, rpsAllRows, risAllRows, rpsPrevRows, risPrevRows] = await Promise.all([
        fetchSheetRange(SHEET_IDS.master, "DM Overall!A1:Z200"),
        fetchSheetRange(SHEET_IDS.rpsCrm, "DM 2026-27!A:K"),
        fetchSheetRange(SHEET_IDS.risCrm, "Nur to Class 12!A:L"),
        fetchSchoolTab("RPS"),
        fetchSchoolTab("RIS"),
        fetchPrevSchoolTab("RPS"),
        fetchPrevSchoolTab("RIS"),
      ]);
      // Both school summary rows and spend analysis come from the same full-tab fetch
      const rpsSchoolRows = rpsAllRows;
      const risSchoolRows = risAllRows;
      const rpsSpendRaw   = rpsAllRows;
      const risSpendRaw   = risAllRows;

      // ── Per-school master monthly totals (source of truth for walkins/admissions) ──
      // Auto-built from all AY 2025-26 months so it never needs manual updating.
      // Each entry maps both bare "MONTHNAME" and "MONTHNAME TOTAL" → "Mon-YY".
      // The `seen` set in parseSchoolRows handles ambiguity (section-1 TOTAL rows
      // always precede section-2 prior-year historical bare rows, so TOTAL wins).
      // Dynamically generate months for the previous and current academic year
      // (AY starts in August) so this never needs manual updating at AY rollover.
      const _SHORT_MONTHS_AY = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      const _ayNow = new Date();
      const _curAYStart = _ayNow.getMonth() >= 7 ? _ayNow.getFullYear() : _ayNow.getFullYear() - 1;
      const _AY_SCHOOL_MONTHS: string[] = [];
      for (const _ays of [_curAYStart - 1, _curAYStart]) {
        for (let _m = 0; _m < 12; _m++) {
          const _abs = 7 + _m;
          const _yr  = _ays + Math.floor(_abs / 12);
          _AY_SCHOOL_MONTHS.push(`${_SHORT_MONTHS_AY[_abs % 12]}-${String(_yr).slice(2)}`);
        }
      }
      const _MONTH_ABBR_TO_UPPER: Record<string,string> = {
        Jan:"JANUARY",Feb:"FEBRUARY",Mar:"MARCH",Apr:"APRIL",May:"MAY",Jun:"JUNE",
        Jul:"JULY",Aug:"AUGUST",Sep:"SEPTEMBER",Oct:"OCTOBER",Nov:"NOVEMBER",Dec:"DECEMBER",
      };
      const SCHOOL_MONTH_KEY: Record<string, string> = {};
      for (const key of _AY_SCHOOL_MONTHS) {
        const upper = _MONTH_ABBR_TO_UPPER[key.slice(0, 3)];
        const year4 = "20" + key.slice(4);          // "2025" or "2026"
        if (upper) {
          SCHOOL_MONTH_KEY[upper] = key;
          SCHOOL_MONTH_KEY[upper + " TOTAL"] = key;
          SCHOOL_MONTH_KEY[upper + " " + year4] = key;              // e.g. "JUNE 2026"  (year-qualified, no TOTAL)
          SCHOOL_MONTH_KEY[upper + " " + year4 + " TOTAL"] = key;  // e.g. "JULY 2026 TOTAL"
        }
      }
      const parseSchoolRows = (rows: string[][]): Array<{month:string;leads:number;bookings:number;walkins:number;admissions:number}> => {
        const hIdx = rows.findIndex(r => r.some(c => String(c).includes("Total Walkins")));
        if (hIdx === -1) return [];
        const header = rows[hIdx];
        const leadCol = header.findIndex(h => String(h).includes("Total Leads"));
        const bookCol = header.findIndex(h => String(h).toLowerCase().includes("booking"));
        const wCol    = header.findIndex(h => String(h).includes("Total Walkins"));
        const aCol    = header.findIndex(h => String(h).includes("Total Admissions"));
        // Use a Map (last-occurrence wins) so later month-end subtotal rows override
        // any early new-cycle rows that share the same month label (e.g. JUNE/JULY
        // at the top of the tab are AY 26-27 new-cycle; correct AY 25-26 subtotals
        // appear further down after all daily entries for that month).
        // IMPORTANT: only match on col0 — col1 fallback was also matching spend-summary
        // rows where the month name sits in col1 with ₹ spend values in the data cols.
        const seen = new Map<string, {month:string;leads:number;bookings:number;walkins:number;admissions:number}>();
        for (const row of rows.slice(hIdx + 1)) {
          const r0 = String(row[0] ?? "").trim().toUpperCase();
          const crmKey = SCHOOL_MONTH_KEY[r0];
          if (crmKey) {
            const p = (v: unknown) => parseInt(String(v ?? 0).replace(/[₹,\s]/g,"")) || 0;
            seen.set(crmKey, {
              month:      crmKey,
              leads:      leadCol >= 0 ? p(row[leadCol]) : 0,
              bookings:   bookCol >= 0 ? p(row[bookCol]) : 0,
              walkins:    p(row[wCol]),
              admissions: p(row[aCol]),
            });
          }
        }
        return [...seen.values()];
      };

      // Reads the "TOTAL (TILL DATE)" summary row from the school tab — the single
      // authoritative YTD figure the school maintains for each metric.
      const parseSchoolYtd = (rows: string[][]): {leads:number;walkins:number;admissions:number} | null => {
        const hIdx = rows.findIndex(r => r.some(c => String(c).includes("Total Walkins")));
        if (hIdx === -1) return null;
        const header = rows[hIdx];
        const leadCol = header.findIndex(h => String(h).includes("Total Leads"));
        const wCol    = header.findIndex(h => String(h).includes("Total Walkins"));
        const aCol    = header.findIndex(h => String(h).includes("Total Admissions"));
        for (const row of rows.slice(hIdx + 1)) {
          const r0 = String(row[0] ?? "").trim().toUpperCase();
          if (r0.includes("TOTAL") && (r0.includes("DATE") || r0.includes("TILL"))) {
            const p = (v: unknown) => parseInt(String(v ?? 0).replace(/[₹,\s]/g,"")) || 0;
            return {
              leads:      leadCol >= 0 ? p(row[leadCol]) : 0,
              walkins:    wCol >= 0 ? p(row[wCol]) : 0,
              admissions: aCol >= 0 ? p(row[aCol]) : 0,
            };
          }
        }
        return null;
      };
      // Merge current + previous tab monthly data.
      // Rule: for each month, prefer non-zero data from either tab.
      // The current tab wins when it has real data; otherwise the previous tab's
      // data is used (covers the transition window when a new tab is created but
      // the prior month's subtotals haven't been migrated into it yet).
      type SchoolMonthRow = { month: string; leads: number; bookings: number; walkins: number; admissions: number };
      const mergeSchoolMonthly = (current: SchoolMonthRow[], prev: SchoolMonthRow[]): SchoolMonthRow[] => {
        const result = new Map<string, SchoolMonthRow>();
        for (const m of prev) result.set(m.month, m);
        for (const m of current) {
          const hasData = m.leads > 0 || m.walkins > 0 || m.admissions > 0 || m.bookings > 0;
          if (hasData || !result.has(m.month)) {
            result.set(m.month, m);   // current has real data → always prefer; or new month not in prev
          }
          // else: current is all-zeros AND prev has real data → keep prev
        }
        return [...result.values()];
      };
      const rpsSchoolMonthlyRaw = mergeSchoolMonthly(parseSchoolRows(rpsSchoolRows), parseSchoolRows(rpsPrevRows));
      const risSchoolMonthlyRaw = mergeSchoolMonthly(parseSchoolRows(risSchoolRows), parseSchoolRows(risPrevRows));
      const risSchoolYtd = parseSchoolYtd(risSchoolRows);
      const rpsSchoolYtd = parseSchoolYtd(rpsSchoolRows);

      // If the last completed month has all-zeros (school hasn't entered subtotals yet
      // into the new tab), derive its data from: YTD - sum(all other months).
      // This is purely master-sheet data — YTD comes from the TOTAL (TILL DATE) row
      // in the same school tab, so it's always self-consistent.
      const MONTH_SHORT_3 = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      const _now = new Date();
      const _cm = _now.getMonth();
      const _cy = _now.getFullYear() % 100;
      const _pm = _cm === 0 ? 11 : _cm - 1;
      const _py = _cm === 0 ? _cy - 1 : _cy;
      const curMonthKey  = `${MONTH_SHORT_3[_cm]}-${String(_cy).padStart(2,"0")}`;
      const prevMonthKey = `${MONTH_SHORT_3[_pm]}-${String(_py).padStart(2,"0")}`;

      const fillMissingLastMonth = (
        monthly: SchoolMonthRow[],
        ytd: { leads: number; walkins: number; admissions: number } | null,
      ): SchoolMonthRow[] => {
        if (!ytd) return monthly;
        const prev = monthly.find(m => m.month === prevMonthKey);
        // Skip if the prev month already has real data
        if (prev && (prev.leads > 0 || prev.walkins > 0 || prev.admissions > 0)) return monthly;
        const cur = monthly.find(m => m.month === curMonthKey);
        const sumOther = monthly
          .filter(m => m.month !== prevMonthKey && m.month !== curMonthKey)
          .reduce((s, m) => ({ leads: s.leads + m.leads, walkins: s.walkins + m.walkins, admissions: s.admissions + m.admissions }),
            { leads: 0, walkins: 0, admissions: 0 });
        const derived = {
          leads:      Math.max(0, ytd.leads      - sumOther.leads      - (cur?.leads ?? 0)),
          walkins:    Math.max(0, ytd.walkins    - sumOther.walkins    - (cur?.walkins ?? 0)),
          admissions: Math.max(0, ytd.admissions - sumOther.admissions - (cur?.admissions ?? 0)),
        };
        // If prev month row is absent entirely, append it; otherwise overwrite the all-zeros row
        const derivedRow = { month: prevMonthKey, leads: derived.leads, bookings: 0, walkins: derived.walkins, admissions: derived.admissions };
        return prev
          ? monthly.map(m => m.month === prevMonthKey ? { ...m, ...derived } : m)
          : [...monthly, derivedRow];
      };

      const rpsSchoolMonthly = fillMissingLastMonth(rpsSchoolMonthlyRaw, rpsSchoolYtd);
      const risSchoolMonthly = fillMissingLastMonth(risSchoolMonthlyRaw, risSchoolYtd);

      // ── Per-school weekly rows (for the weekly breakdown table) ──
      // Reads weekly aggregate rows (date ranges like "01/06 - 07/06") from the current school tab.
      const parseSchoolWeeklyRows = (rows: string[][]): Array<{week:string;leads:number;bookings:number;walkins:number;admissions:number}> => {
        const hIdx = rows.findIndex(r => r.some(c => String(c).includes("Total Walkins")));
        if (hIdx === -1) return [];
        const header = rows[hIdx];
        const leadCol = header.findIndex(h => String(h).includes("Total Leads"));
        const bookCol = header.findIndex(h => String(h).toLowerCase().includes("booking"));
        const wCol    = header.findIndex(h => String(h).includes("Total Walkins"));
        const aCol    = header.findIndex(h => String(h).includes("Total Admissions"));
        const result: Array<{week:string;leads:number;bookings:number;walkins:number;admissions:number}> = [];
        for (const row of rows.slice(hIdx + 1)) {
          const labelB = String(row[1] ?? "").trim();
          const labelA = String(row[0] ?? "").trim();
          if (labelA.toUpperCase().includes("DIGITAL") || labelB.toUpperCase().includes("DIGITAL")) break;
          // Weekly aggregate rows have a date-range format: "01/06 - 07/06" (contains both "/" and "-")
          // Some school tab layouts put the date in col A (row[0]) rather than col B (row[1])
          const label = (labelB.includes("/") && labelB.includes("-")) ? labelB
                      : (labelA.includes("/") && labelA.includes("-")) ? labelA
                      : "";
          if (label) {
            result.push({
              week: label,
              leads:      parseInt(String(row[leadCol] ?? 0).replace(/[₹,\s]/g,"")) || 0,
              bookings:   parseInt(String(row[bookCol] ?? 0).replace(/[₹,\s]/g,"")) || 0,
              walkins:    parseInt(String(row[wCol]    ?? 0).replace(/[₹,\s]/g,"")) || 0,
              admissions: parseInt(String(row[aCol]    ?? 0).replace(/[₹,\s]/g,"")) || 0,
            });
          }
        }
        return result;
      };
      const rpsWeekly = parseSchoolWeeklyRows(rpsSchoolRows);
      const risWeekly = parseSchoolWeeklyRows(risSchoolRows);

      // ── Per-school Meta/Google spend from the "DIGITAL MARKETING SPEND ANALYSIS" table ──
      // Both "DM RIS MAY' 26" and "DM RPS MAY' 26" tabs contain this table after the weekly rows.
      // Month names in the table: "June"…"December" (2025), "January"…"May" (2026).
      const SPEND_MONTH_MAP: Record<string, string> = {
        "June":"Jun 25","July":"Jul 25","August":"Aug 25","September":"Sep 25",
        "October":"Oct 25","November":"Nov 25","December":"Dec 25",
        "January":"Jan 26","February":"Feb 26","March":"Mar 26","April":"Apr 26","May":"May 26",
        "June26":"Jun 26",    // sentinel: 2nd bare "June" → Jun 26
        "July26":"Jul 26",    // sentinel: 2nd bare "July" → Jul 26
        "August26":"Aug 26",  // sentinel: 2nd bare "August" → Aug 26
        "June 2026":"Jun 26",    // school renamed row to "June 2026"
        "July 2026":"Jul 26",    // school renamed row to "July 2026"
        "August 2026":"Aug 26",  // school renamed row to "August 2026"
        "September 2026":"Sep 26","October 2026":"Oct 26","November 2026":"Nov 26",
        "December 2026":"Dec 26","January 2027":"Jan 27","February 2027":"Feb 27",
        "March 2027":"Mar 27","April 2027":"Apr 27","May 2027":"May 27",
      };
      const parseSpendRows = (rows: string[][]): Array<{month:string;salaries:number;meta:number;google:number;adSpend:number}> => {
        // Find header row: must contain both "meta" and "google" (partial, case-insensitive)
        const hIdx = rows.findIndex(r => {
          const cells = r.map(c => String(c).trim().toLowerCase());
          return cells.some(c => c.includes("meta")) && cells.some(c => c.includes("google"));
        });
        if (hIdx === -1) return [];
        const header = rows[hIdx];
        const metaCol   = header.findIndex(h => String(h).trim().toLowerCase().includes("meta"));
        const googleCol = header.findIndex(h => String(h).trim().toLowerCase().includes("google"));
        const salaryCol = header.findIndex(h => String(h).trim().toLowerCase().includes("salar"));
        if (metaCol === -1 || googleCol === -1) return [];

        const afterHeader = rows.slice(hIdx + 1);

        // Dynamically detect which column holds month names (some sheets have Month at col B, not col A)
        let monthCol = 0;
        for (const row of afterHeader.slice(0, 10)) {
          for (let ci = 0; ci < row.length; ci++) {
            if (SPEND_MONTH_MAP[String(row[ci] ?? "").trim()]) { monthCol = ci; break; }
          }
          if (monthCol > 0) break;
        }

        const result: Array<{month:string;salaries:number;meta:number;google:number;adSpend:number}> = [];
        const seenInThisSheet = new Set<string>();
        for (const row of afterHeader) {
          const rawMonth = String(row[monthCol] ?? "").trim();
          if (!rawMonth) continue;
          if (rawMonth.toUpperCase().startsWith("TOTAL")) break;
          // If "June" or "July" appears a second time in the sheet, it's the 2026 occurrence
          const lookupKey =
            (rawMonth === "June"   && seenInThisSheet.has("Jun 25")) ? "June26" :
            (rawMonth === "July"   && seenInThisSheet.has("Jul 25")) ? "July26" :
            (rawMonth === "August" && seenInThisSheet.has("Aug 25")) ? "August26" :
            rawMonth;
          const mapped = SPEND_MONTH_MAP[lookupKey];
          if (!mapped) continue;
          seenInThisSheet.add(mapped);
          const meta   = parseINR(row[metaCol]);
          const google = parseINR(row[googleCol]);
          result.push({ month: mapped, salaries: salaryCol >= 0 ? parseINR(row[salaryCol]) : 0, meta, google, adSpend: meta + google });
        }
        return result;
      };
      const risSpend = parseSpendRows(risSpendRaw);
      const rpsSpend = parseSpendRows(rpsSpendRaw);


      // ── DM Overall → monthly combined totals + May weekly ──
      const MONTH_MAP: Record<string, string> = {
        JUNE: "Jun 25", JULY: "Jul 25", AUGUST: "Aug 25", SEPTEMBER: "Sep 25",
        OCTOBER: "Oct 25", NOVEMBER: "Nov 25", DECEMBER: "Dec 25", JANUARY: "Jan 26",
        FEBRUARY: "Feb 26", MARCH: "Mar 26", APRIL: "Apr 26", MAY: "May 26",
        // AY 25-26: school renamed current-cycle month rows to include the year
        "JUNE 2026": "Jun 26", "JULY 2026": "Jul 26",
        // AY 26-27: year-qualified entries (school continues the same naming pattern)
        "AUGUST 2026": "Aug 26", "SEPTEMBER 2026": "Sep 26", "OCTOBER 2026": "Oct 26",
        "NOVEMBER 2026": "Nov 26", "DECEMBER 2026": "Dec 26",
        "JANUARY 2027": "Jan 27", "FEBRUARY 2027": "Feb 27", "MARCH 2027": "Mar 27",
        "APRIL 2027": "Apr 27", "MAY 2027": "May 27",
      };
      const monthlyTotals: any[] = [];
      const mayWeeklyCombined: any[] = [];
      let inMay = false;
      let passedMay   = false; // tracks when we've seen MAY, so next bare JUNE/JULY = 2026
      let passedJul26 = false; // tracks when we've seen Jul 26, so next bare AUGUST = 2026

      for (const row of masterRows) {
        const label = String(row[1] ?? "").trim();
        if (!label) continue;
        if (label.toUpperCase().startsWith("TOTAL")) break;
        let monthVal = MONTH_MAP[label.toUpperCase()];
        // After seeing MAY (May 26), subsequent JUNE/JULY rows are 2026, not 2025
        if (passedMay   && label.toUpperCase() === "JUNE")   monthVal = "Jun 26";
        if (passedMay   && label.toUpperCase() === "JULY")   monthVal = "Jul 26";
        // After seeing Jul 26, bare AUGUST = Aug 26 (new AY started)
        if (passedJul26 && label.toUpperCase() === "AUGUST") monthVal = "Aug 26";
        if (monthVal) {
          if (monthVal === "May 26") passedMay   = true;
          if (monthVal === "Jul 26") passedJul26 = true;
          inMay = monthVal === "May 26";
          const leads = parseN(row[2]); const spend = parseINR(row[20]);
          if (leads > 0 || spend > 0) {
            monthlyTotals.push({ month: monthVal, leads, bookings: parseN(row[5]), walkins: parseN(row[6]), admissions: parseN(row[10]), meta: parseINR(row[18]), google: parseINR(row[19]), spend });
          }
          continue;
        }
        // Weekly rows: any date-range label like "01/01 - 07/01", "01/05 - 02/05", "01/06 - 07/06"
        if (label.includes("/") && label.includes("-") && /\d{2}\/\d{2}/.test(label)) {
          const leads = parseN(row[2]); const spend = parseINR(row[20]);
          if (leads > 0 || spend > 0) {
            mayWeeklyCombined.push({ week: label, leads, bookings: parseN(row[5]), walkins: parseN(row[6]), admissions: parseN(row[10]), spend });
          }
        }
      }

      // Fallback: if Jun 26 monthly row wasn't captured from DM Overall
      // (monthly summary row uses formula cells that Google Sheets API may not evaluate),
      // synthesise it from the June weekly rows that were already collected.
      if (!monthlyTotals.some(m => m.month === "Jun 26")) {
        const junWeeks = mayWeeklyCombined.filter(w => /\/06/.test(w.week));
        if (junWeeks.length > 0) {
          const junRis = risSpend.find(s => s.month === "Jun 26");
          const junRps = rpsSpend.find(s => s.month === "Jun 26");
          monthlyTotals.push({
            month: "Jun 26",
            leads:      junWeeks.reduce((s, w) => s + w.leads,       0),
            bookings:   junWeeks.reduce((s, w) => s + w.bookings,    0),
            walkins:    junWeeks.reduce((s, w) => s + w.walkins,     0),
            admissions: junWeeks.reduce((s, w) => s + w.admissions,  0),
            meta:   (junRis?.meta   ?? 0) + (junRps?.meta   ?? 0),
            google: (junRis?.google ?? 0) + (junRps?.google ?? 0),
            spend:  (junRis?.adSpend ?? 0) + (junRps?.adSpend ?? 0),
          });
        }
      }

      // Dedup fix: DM Overall sheet sometimes labels the new-AY month row as the previous
      // year's month (e.g. "Jul 25" instead of "Jul 26"). If a month appears twice and the
      // second occurrence sits after "Jun 26" in the list, relabel it to the next-year key.
      const seenMonths = new Set<string>();
      for (let i = 0; i < monthlyTotals.length; i++) {
        const m = monthlyTotals[i].month as string;
        if (seenMonths.has(m)) {
          // Duplicate — advance year by 1: "Jul 25" → "Jul 26"
          const [mon, yr] = m.split(" ");
          monthlyTotals[i].month = `${mon} ${String(parseInt(yr) + 1).padStart(2, "0")}`;
        } else {
          seenMonths.add(m);
        }
      }

      // ── Fresh booking-to-walk-in: CRM-based same-month conversion ──
      // The DM Overall master sheet counts walk-ins by CALENDAR month (when visited),
      // so it includes carry-over from previous months' bookings.
      // The CRM groups each lead by their ENTRY/BOOKING month, so CRM walk-ins for
      // month X = leads booked in X who have visited (same-month attribution).
      // Additionally, RIS col 11 = Revisit Date — leads with a revisit date are
      // returning visitors and must be excluded.
      //
      // freshWalkins[month] = RIS CRM walk-ins (no revisit) + RPS CRM walk-ins (all)
      //                       both keyed to the booking/entry month, not the visit month.
      const risFreshWalkinsMap: Record<string, number> = {};
      const rpsFreshWalkinsMap: Record<string, number> = {};

      // ── RPS CRM → branch-wise by month ──
      const MONTH_ORDER = ["Apr-25","May-25","Jun-25","Jul-25","Aug-25","Sep-25","Oct-25","Nov-25","Dec-25","Jan-26","Feb-26","Mar-26","Apr-26","May-26","Jun-26"];
      const rpsMonthBranch: Record<string, Record<string, {leads:number;bookings:number;walkins:number;admissions:number;closed:number}>> = {};
      const rpsCloseReasons: Record<string, number> = {};
      const rpsMonthReasons: Record<string, Record<string, number>> = {};
      const rpsStatusCount: Record<string, number> = {};
      const rpsSourceCount: Record<string, number> = {};

      for (const r of rpsCrmRows.slice(1)) {
        if (!r[0]) continue;                         // skip rows with no date (blank/header rows)
        const month = String(r[1] ?? "").trim();
        const centre = String(r[6] ?? "").trim() || "Unassigned";
        const status = String(r[7] ?? "OPEN").trim().toUpperCase();
        const remark = String(r[8] ?? "").trim();
        const source = String(r[10] ?? "Unknown").trim() || "Unknown";
        if (!month) continue;
        if (!rpsMonthBranch[month]) rpsMonthBranch[month] = {};
        if (!rpsMonthBranch[month][centre]) rpsMonthBranch[month][centre] = { leads:0, bookings:0, walkins:0, admissions:0, closed:0 };
        // Cumulative funnel: status is the CURRENT stage; leads who progressed to
        // WALK-IN COMPLETED / ADM DONE / CLOSED AFTER WALKIN were once WALKIN BOOKED.
        rpsMonthBranch[month][centre].leads++;
        if (["WALKIN BOOKED","WALK-IN COMPLETED","ADM DONE","CLOSED AFTER WALKIN"].includes(status))
          rpsMonthBranch[month][centre].bookings++;
        if (["WALK-IN COMPLETED","ADM DONE","CLOSED AFTER WALKIN"].includes(status))
          rpsMonthBranch[month][centre].walkins++;
        if (status === "ADM DONE") rpsMonthBranch[month][centre].admissions++;
        if (status === "CLOSED" || status === "CLOSED AFTER WALKIN") {
          rpsMonthBranch[month][centre].closed++;
          if (remark) {
            rpsCloseReasons[remark] = (rpsCloseReasons[remark] || 0) + 1;
            if (!rpsMonthReasons[month]) rpsMonthReasons[month] = {};
            rpsMonthReasons[month][remark] = (rpsMonthReasons[month][remark] || 0) + 1;
          }
        }
        rpsStatusCount[status] = (rpsStatusCount[status] || 0) + 1;
        rpsSourceCount[source] = (rpsSourceCount[source] || 0) + 1;
        // RPS has no Revisit Date column — count all walk-in status leads as fresh
        // (attributing to their booking/entry month, not the physical visit month).
        if (["WALK-IN COMPLETED","ADM DONE","CLOSED AFTER WALKIN"].includes(status)) {
          rpsFreshWalkinsMap[month] = (rpsFreshWalkinsMap[month] || 0) + 1;
        }
      }

      const rpsByMonth = Object.keys(rpsMonthBranch)
        .sort((a, b) => { const ai = MONTH_ORDER.indexOf(a), bi = MONTH_ORDER.indexOf(b); return (ai<0?99:ai)-(bi<0?99:bi); })
        .map(month => {
          const allEntries = Object.entries(rpsMonthBranch[month])
            .map(([centre, d]) => ({ centre, ...d }));
          // Total includes ALL leads (Unassigned + named centres) — matches sheet row count
          const total = allEntries.reduce((a, b) => ({ leads:a.leads+b.leads, bookings:a.bookings+b.bookings, walkins:a.walkins+b.walkins, admissions:a.admissions+b.admissions, closed:a.closed+b.closed }), { leads:0, bookings:0, walkins:0, admissions:0, closed:0 });
          // Display table shows named centres only (Unassigned rows have no actionable centre info)
          const branches = allEntries
            .filter(b => b.centre && b.centre !== "Unassigned")
            .sort((a, b) => b.leads - a.leads);
          const closedReasons = Object.entries(rpsMonthReasons[month] || {}).filter(([r]) => r.trim()).sort((a,b) => b[1]-a[1]).map(([reason,count]) => ({reason,count}));
          return { month, branches, total, closedReasons };
        });

      // ── RIS CRM → education-level groups by month ──
      const GRADE_MAP: Record<string, string> = {};
      // Pre-Primary: all common variants used in sheets and forms
      for (const g of [
        "nursery","playgroup","junior kg","senior kg","kg",
        "jr. kg","jr kg","sr. kg","sr kg","lkg","ukg",
        "pre-primary","pre primary","pp","jkg","skg",
        "jr. k.g.","sr. k.g.","junior k.g.","senior k.g.",
        "nursery / jr. kg","nur","nur/jr.kg",
      ]) GRADE_MAP[g] = "Pre-Primary";
      // Primary: Class 1–5 and Grade 1–5 variants
      for (const g of ["class 1","class 2","class 3","class 4","class 5",
        "grade 1","grade 2","grade 3","grade 4","grade 5",
        "std 1","std 2","std 3","std 4","std 5",
        "1st","2nd","3rd","4th","5th",
      ]) GRADE_MAP[g] = "Primary";
      // Middle: Class 6–8 and Grade 6–8 variants
      for (const g of ["class 6","class 7","class 8",
        "grade 6","grade 7","grade 8",
        "std 6","std 7","std 8",
        "6th","7th","8th",
      ]) GRADE_MAP[g] = "Middle";
      // Secondary: Class 9–10 and Grade 9–10 variants
      for (const g of ["class 9","class 10",
        "grade 9","grade 10",
        "std 9","std 10",
        "9th","10th",
      ]) GRADE_MAP[g] = "Secondary";
      // Senior Secondary: Class 11–12 and Grade 11–12 variants
      for (const g of [
        "class 11","class 11 science","class 11 commerce","class 11 humanities",
        "class 12","class 12 science","class 12 commerce","class 12 humanities",
        "11th","12th","grade 11","grade 12","std 11","std 12",
      ]) GRADE_MAP[g] = "Senior Secondary";

      const risMonthGroup: Record<string, Record<string, {leads:number;bookings:number;walkins:number;admissions:number;closed:number}>> = {};
      const risCloseReasons: Record<string, number> = {};
      const risMonthReasons: Record<string, Record<string, number>> = {};
      const risStatusCount: Record<string, number> = {};
      const risSourceCount: Record<string, number> = {};

      for (const r of risCrmRows.slice(1)) {
        if (!r[0]) continue;                         // skip rows with no date (blank/header rows)
        const month = String(r[1] ?? "").trim();
        const grade = String(r[5] ?? "").trim().toLowerCase().replace(/\s+/g, " ");
        const group = GRADE_MAP[grade] || "Other";
        if (!month) continue;
        const status = String(r[6] ?? "OPEN").trim().toUpperCase();
        const remark = String(r[7] ?? "").trim();
        const source = String(r[9] ?? "Unknown").trim() || "Unknown";
        // Column K = "Walk-In Date" — if present on a CLOSED lead, it walked in before being closed
        const hasWalkinDate = String(r[10] ?? "").trim().length > 0;
        // Treat CLOSED+Walk-In Date as "CLOSED AFTER WALKIN" (RIS sheet doesn't use that label)
        const effectiveStatus = (status === "CLOSED" && hasWalkinDate) ? "CLOSED AFTER WALKIN" : status;
        if (!risMonthGroup[month]) risMonthGroup[month] = {};
        if (!risMonthGroup[month][group]) risMonthGroup[month][group] = { leads:0, bookings:0, walkins:0, admissions:0, closed:0 };
        // Cumulative funnel for RIS — mirrors RPS logic exactly
        risMonthGroup[month][group].leads++;
        if (["WALKIN BOOKED","WALK-IN COMPLETED","ADM DONE","CLOSED AFTER WALKIN"].includes(effectiveStatus))
          risMonthGroup[month][group].bookings++;
        if (["WALK-IN COMPLETED","ADM DONE","CLOSED AFTER WALKIN"].includes(effectiveStatus))
          risMonthGroup[month][group].walkins++;
        if (effectiveStatus === "ADM DONE") risMonthGroup[month][group].admissions++;
        if (effectiveStatus === "CLOSED" || effectiveStatus === "CLOSED AFTER WALKIN") {
          risMonthGroup[month][group].closed++;
          if (remark) {
            risCloseReasons[remark] = (risCloseReasons[remark] || 0) + 1;
            if (!risMonthReasons[month]) risMonthReasons[month] = {};
            risMonthReasons[month][remark] = (risMonthReasons[month][remark] || 0) + 1;
          }
        }
        // Use effectiveStatus so CLOSED+walkin-date shows as "CLOSED AFTER WALKIN" in status summary
        risStatusCount[effectiveStatus] = (risStatusCount[effectiveStatus] || 0) + 1;
        risSourceCount[source] = (risSourceCount[source] || 0) + 1;
        // Fresh walk-in: lead is attributed to their BOOKING/ENTRY month (same-month),
        // and col 11 (Revisit Date) must be empty — revisiting parents are not fresh.
        // Walk-in date (col 10) is intentionally NOT required because it is sparsely
        // filled in the CRM; entry-month attribution is the reliable same-month proxy.
        if (["WALK-IN COMPLETED","ADM DONE","CLOSED AFTER WALKIN"].includes(effectiveStatus)) {
          const revisitDateRaw = String(r[11] ?? "").trim();
          if (!revisitDateRaw) {
            risFreshWalkinsMap[month] = (risFreshWalkinsMap[month] || 0) + 1;
          }
        }
      }

      const GROUP_ORDER_SRV = ["Pre-Primary","Primary","Middle","Secondary","Senior Secondary"];
      const risByMonth = Object.keys(risMonthGroup)
        .sort((a, b) => { const ai = MONTH_ORDER.indexOf(a), bi = MONTH_ORDER.indexOf(b); return (ai<0?99:ai)-(bi<0?99:bi); })
        .map(month => {
          const groups = GROUP_ORDER_SRV
            .filter(g => risMonthGroup[month][g])
            .map(g => ({ group: g, ...risMonthGroup[month][g] }));
          // Total counts ALL rows in the month (including "Other"/unrecognised grades)
          const total = Object.values(risMonthGroup[month]).reduce((a, g) => ({ leads:a.leads+g.leads, bookings:a.bookings+g.bookings, walkins:a.walkins+g.walkins, admissions:a.admissions+g.admissions, closed:a.closed+g.closed }), { leads:0, bookings:0, walkins:0, admissions:0, closed:0 });
          const closedReasons = Object.entries(risMonthReasons[month] || {}).filter(([r]) => r.trim()).sort((a,b) => b[1]-a[1]).map(([reason,count]) => ({reason,count}));
          return { month, groups, total, closedReasons };
        });

      const sortReasons = (map: Record<string, number>) =>
        Object.entries(map).filter(([r]) => r.trim()).sort((a, b) => b[1] - a[1]).map(([reason, count]) => ({ reason, count }));

      // Post-process: inject freshWalkins (RIS no-revisit + RPS all) into each monthlyTotals entry.
      // Both maps key by "Jun-26" (dash); monthlyTotals uses "Jun 26" (space) → normalise.
      for (const mt of monthlyTotals) {
        const mKey = mt.month.replace(" ", "-");
        mt.risFreshWalkins = risFreshWalkinsMap[mKey] || 0;
        mt.rpsFreshWalkins = rpsFreshWalkinsMap[mKey] || 0;
        mt.freshWalkins    = mt.risFreshWalkins + mt.rpsFreshWalkins;
      }

      res.json({
        generatedAt: new Date().toISOString(),
        currentDayOfMonth: new Date().getDate(),
        monthlyTotals,
        mayWeeklyCombined,
        rpsCrm: { byMonth: rpsByMonth, closedReasons: sortReasons(rpsCloseReasons), statusSummary: rpsStatusCount, bySource: rpsSourceCount },
        risCrm: { byMonth: risByMonth, closedReasons: sortReasons(risCloseReasons), statusSummary: risStatusCount, bySource: risSourceCount },
        rpsSchoolMonthly,
        risSchoolMonthly,
        risSchoolYtd,
        rpsSchoolYtd,
        rpsWeekly,
        risWeekly,
        risSpend,
        rpsSpend,
      });
    } catch (err: any) {
      res.status(500).json({ message: "Failed to fetch live marketing data", error: err.message });
    }
  });

  // ── Google Sheets ─────────────────────────────────────────────
  const SHEET_IDS = {
    dmTracker: "1gzMAO-RyVFfz5hqANr8JApu-M6LwAftMyXnZD8_kjMw",
    rpsCrm:    "1t1_2SPI6--W-nCWc-lHHE-D4ee38WGFxiBsB5txI-CM",
    risCrm:    "1zLIWutvJxwLyVBAK-vDlpEzNPV7c2RwutYC9Gn3yd2s",
    master:    "1FjLbJbThU2wZCu7m0Y-GAzv6vTs8WdkVxBRBZh8QZqc",
    sales:     "1R5evjW6gVYIB6nyR1dmIdiWp1qMTui4J9wQovmUkakw",
    alliances: "1eTo457sA4SXnlQoEthHclcnr2WO_YG6cosUfhcrRmxA",
  };

  async function fetchSheetRange(sheetId: string, range: string): Promise<string[][]> {
    const auth = getAuthenticatedClient();
    if (!auth) throw new Error("Google not connected");
    const { google: goog } = await import("googleapis");
    const sheets = goog.sheets({ version: "v4", auth });
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range });
    return (res.data.values || []) as string[][];
  }

  const WALKIN_SHEET_TAB = process.env.WALKIN_SHEET_TAB || "RA Checkin";

  async function appendToWalkinSheet(checkin: {
    id: string; submittedAt: Date | string; raName: string; raBranch: string;
    parentName: string; studentName: string; grade: string;
  }): Promise<void> {
    const sheetId = process.env.WALKIN_SHEET_ID;
    if (!sheetId) throw new Error("WALKIN_SHEET_ID env var not set");
    const auth = getAuthenticatedClient();
    if (!auth) throw new Error("Google not connected");
    const { google: goog } = await import("googleapis");
    const sheets = goog.sheets({ version: "v4", auth });
    const dt = new Date(checkin.submittedAt);
    const dateStr = dt.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", year: "numeric" });
    const timeStr = dt.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: true });
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: `${WALKIN_SHEET_TAB}!A:G`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[dateStr, timeStr, checkin.raName, checkin.raBranch, checkin.parentName, checkin.studentName, checkin.grade]],
      },
    });
  }

  // Website enquiry form → Google Sheet ("Nur to Class 12" tab)
  const ENQUIRY_SHEET_ID = "1zLIWutvJxwLyVBAK-vDlpEzNPV7c2RwutYC9Gn3yd2s";
  const ENQUIRY_SHEET_TAB = "Nur to Class 12";
  async function appendEnquiryToSheet(data: {
    parentName: string; studentName: string; grade: string; phone: string;
  }): Promise<void> {
    const auth = getAuthenticatedClient();
    if (!auth) throw new Error("Google not connected");
    const { google: goog } = await import("googleapis");
    const sheets = goog.sheets({ version: "v4", auth });
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const dd = now.getDate().toString().padStart(2, "0");
    const mon = MON[now.getMonth()];
    const yy = now.getFullYear().toString().slice(-2);
    const dateStr = `${dd}-${mon}-${yy}`;   // e.g. 24-Jun-26
    const monthStr = `${mon}-${yy}`;         // e.g. Jun-26
    await sheets.spreadsheets.values.append({
      spreadsheetId: ENQUIRY_SHEET_ID,
      range: `${ENQUIRY_SHEET_TAB}!A:F`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[dateStr, monthStr, data.parentName, data.studentName, data.phone, data.grade]],
      },
    });
    console.log(`[sheet] Appended enquiry row — ${data.parentName} / ${data.phone}`);
  }

  // Website enquiry form → CRM Leads Tracker tab of Master MIS 27-28
  // ⚠️  This ID must match RIS_WALKIN_SHEET_ID_2728 env var
  //     (currently "1YoMro8ypodwcleFc7PQ5JZ0FccycUm0h_VSeRxwpYhA") so that
  //     readCrmLeadsTrackerStats("RIS") in walkinSheets.ts reads from the
  //     same sheet that new enquiries are written to.
  //     Verified correct — the 27-28 RIS CRM dashboard total-leads count
  //     will include every website enquiry appended below.
  const CRM_LEADS_TRACKER_SHEET_ID = process.env.RIS_WALKIN_SHEET_ID_2728 ?? "1YoMro8ypodwcleFc7PQ5JZ0FccycUm0h_VSeRxwpYhA";
  const CRM_LEADS_TRACKER_TAB = "CRM Leads Tracker";
  async function appendEnquiryToCrmLeadsTracker(data: {
    parentName: string; studentName: string; grade: string;
    phone: string; email?: string; source?: string;
  }): Promise<void> {
    const auth = getAuthenticatedClient();
    if (!auth) throw new Error("Google not connected");
    const { google: goog } = await import("googleapis");
    const sheets = goog.sheets({ version: "v4", auth });
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const dd   = now.getDate().toString().padStart(2, "0");
    const mm   = (now.getMonth() + 1).toString().padStart(2, "0");
    const yyyy = now.getFullYear();
    const dateStr = `${dd}/${mm}/${yyyy}`;                    // DD/MM/YYYY — canonical CRM format
    const hh  = now.getHours();
    const min = now.getMinutes().toString().padStart(2, "0");
    const ampm = hh >= 12 ? "PM" : "AM";
    const h12 = (hh % 12 || 12).toString().padStart(2, "0");
    const timeStr = `${h12}:${min} ${ampm}`;
    await sheets.spreadsheets.values.append({
      spreadsheetId: CRM_LEADS_TRACKER_SHEET_ID,
      range: `${CRM_LEADS_TRACKER_TAB}!A:M`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          dateStr,            // A  Date
          timeStr,            // B  Time
          data.parentName,    // C  Parent's Name
          data.studentName,   // D  Child's Name
          data.phone,         // E  Phone
          data.grade,         // F  Program
          "OPEN",             // G  Status
          "",                 // H  Remark
          "Head Office",      // I  Lead Owner  — all website enquiries default to Head Office
          "GOOGLE",           // J  Source      — all website enquiries come via Google/web
          "",                 // K  Walk-In Date
          "",                 // L  Revisit Date
          data.email ?? "",   // M  Email ID
        ]],
      },
    });
    console.log(`[crm-sheet] Appended to CRM Leads Tracker — ${data.parentName} / ${data.phone}`);
  }

  // RPS walk-in check-ins sync to the RPS master sheet ("RA Checkin" tab)
  const RPS_WALKIN_SHEET_ID = "1ShXsyfbtViGccYcgPGMIEcT8C4m_Cs3b6yio6N54D1Q";
  async function appendToRpsWalkinSheet(checkin: {
    id: string; submittedAt: Date | string; raName: string; raBranch: string;
    parentName: string; studentName: string; grade: string;
  }): Promise<void> {
    const auth = getAuthenticatedClient();
    if (!auth) throw new Error("Google not connected");
    const { google: goog } = await import("googleapis");
    const sheets = goog.sheets({ version: "v4", auth });
    const dt = new Date(checkin.submittedAt);
    const dateStr = dt.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", year: "numeric" });
    const timeStr = dt.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: true });
    await sheets.spreadsheets.values.append({
      spreadsheetId: RPS_WALKIN_SHEET_ID,
      range: `${WALKIN_SHEET_TAB}!A:G`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[dateStr, timeStr, checkin.raName, checkin.raBranch, checkin.parentName, checkin.studentName, checkin.grade]],
      },
    });
  }

  // 1. DM Team Task Tracker
  app.get("/api/sheets/tasks", async (req, res) => {
    res.set("Cache-Control", "no-store, private, max-age=0");

    try {
      const rows = await fetchSheetRange(SHEET_IDS.dmTracker, "Key Task!A:I");
      const [header, ...data] = rows;
      const statusFilter = typeof req.query.status === "string" ? req.query.status.toLowerCase() : "";
      const tasks = data
        .filter(r => r[2]) // must have a task name
        .map(r => ({
          assignedDate: r[0] || "",
          endDate: r[1] || "",
          task: r[2] || "",
          owner: r[3] || "",
          status: r[4] || "Pending",
          remarks: r[8] || "",
        }))
        .filter(t => !statusFilter || t.status.toLowerCase().includes(statusFilter));
      const summary = {
        total: tasks.length,
        completed: tasks.filter(t => t.status.toLowerCase() === "completed").length,
        pending: tasks.filter(t => t.status.toLowerCase() === "pending").length,
      };
      res.json({ generatedAt: new Date().toISOString(), summary, tasks });
    } catch (err: any) {
      res.status(500).json({ message: "Failed to fetch tasks", error: err.message });
    }
  });

  // 2. CRM Lead Summary
  app.get("/api/sheets/crm", async (req, res) => {
    res.set("Cache-Control", "no-store, private, max-age=0");

    const account = typeof req.query.account === "string" ? req.query.account.toLowerCase() : "ris";
    const monthFilter = typeof req.query.month === "string" ? req.query.month.toLowerCase() : "";
    try {
      let rows: string[][];
      if (account === "rps") {
        rows = await fetchSheetRange(SHEET_IDS.rpsCrm, "DM 2026-27!A:K");
      } else {
        rows = await fetchSheetRange(SHEET_IDS.risCrm, "Nur to Class 12!A:L");
      }
      const [, ...data] = rows; // skip header
      const leads = data.filter(r => r[0] && r[2]); // must have date and parent name
      const filtered = monthFilter
        ? leads.filter(r => (r[1] || "").toLowerCase().includes(monthFilter))
        : leads;

      // Aggregate by status
      const byStatus: Record<string, number> = {};
      const bySource: Record<string, number> = {};
      const byMonth: Record<string, number> = {};
      const byOwner: Record<string, number> = {};
      filtered.forEach(r => {
        const status = r[account === "rps" ? 7 : 6] || "Open";
        const source = r[account === "rps" ? 10 : 9] || "Unknown";
        const month  = r[1] || "Unknown";
        const owner  = r[account === "rps" ? 9 : 8] || "Unknown";
        byStatus[status] = (byStatus[status] || 0) + 1;
        bySource[source] = (bySource[source] || 0) + 1;
        byMonth[month]   = (byMonth[month] || 0) + 1;
        byOwner[owner]   = (byOwner[owner] || 0) + 1;
      });

      const admDone  = byStatus["ADM DONE"] || 0;
      const closed   = byStatus["CLOSED"] || 0;
      const total    = filtered.length;
      const convRate = total > 0 ? parseFloat(((admDone / total) * 100).toFixed(1)) : 0;

      res.json({
        account: account.toUpperCase(),
        monthFilter: monthFilter || "all months",
        generatedAt: new Date().toISOString(),
        summary: { totalLeads: total, admissionsDone: admDone, closed, open: total - admDone - closed, conversionRate: `${convRate}%` },
        byStatus,
        bySource,
        byMonth,
        byLeadOwner: byOwner,
      });
    } catch (err: any) {
      res.status(500).json({ message: "Failed to fetch CRM data", error: err.message });
    }
  });

  // 2b. CRM Raw Rows — every lead row with named columns for ChatGPT date+source calculations
  app.get("/api/sheets/crm/rows", async (req, res) => {
    res.set("Cache-Control", "no-store, private, max-age=0");

    const account      = typeof req.query.account === "string" ? req.query.account.toLowerCase() : "rps";
    const dateFilter   = typeof req.query.date   === "string" ? req.query.date.toLowerCase()   : "";
    const sourceFilter = typeof req.query.source === "string" ? req.query.source.toLowerCase() : "";
    const statusFilter = typeof req.query.status === "string" ? req.query.status.toLowerCase() : "";
    const monthFilter  = typeof req.query.month  === "string" ? req.query.month.toLowerCase()  : "";
    const centreFilter = typeof req.query.centre === "string" ? req.query.centre.toLowerCase() : "";

    try {
      let rows: string[][];
      if (account === "rps") {
        rows = await fetchSheetRange(SHEET_IDS.rpsCrm, "DM 2026-27!A:K");
      } else {
        rows = await fetchSheetRange(SHEET_IDS.risCrm, "Nur to Class 12!A:L");
      }

      const [headerRow, ...dataRows] = rows;
      const headers = (headerRow || []).map(h => (h || "").trim());

      // Map each row to a named object using actual sheet column headers
      const allLeads = dataRows
        .filter(r => r[0] && r[2]) // must have date and parent name columns populated
        .map(r => {
          const obj: Record<string, string> = {};
          headers.forEach((h, i) => { if (h) obj[h] = (r[i] || "").trim(); });
          return obj;
        });

      // Dynamically locate filter columns from the actual header names
      const findHeader = (kw: string) =>
        headers.find(h => h.toLowerCase().includes(kw)) || "";

      const dateKey   = findHeader("date");
      const sourceKey = findHeader("source");
      const statusKey = findHeader("status");
      const monthKey  = findHeader("month");
      const centreKey = findHeader("centre") || findHeader("branch");

      let filtered = allLeads;
      if (dateFilter)   filtered = filtered.filter(r => (r[dateKey]   || "").toLowerCase().includes(dateFilter));
      if (sourceFilter) filtered = filtered.filter(r => (r[sourceKey] || "").toLowerCase().includes(sourceFilter));
      if (statusFilter) filtered = filtered.filter(r => (r[statusKey] || "").toLowerCase().includes(statusFilter));
      if (monthFilter)  filtered = filtered.filter(r => (r[monthKey]  || "").toLowerCase().includes(monthFilter));
      if (centreFilter) filtered = filtered.filter(r => (r[centreKey] || "").toLowerCase().includes(centreFilter));

      // Quick aggregate counts on the filtered set — useful at-a-glance without iterating rows
      const bySource: Record<string, number> = {};
      const byStatus: Record<string, number> = {};
      const byDate:   Record<string, number> = {};
      filtered.forEach(r => {
        const src = r[sourceKey] || "Unknown";
        const sts = r[statusKey] || "Unknown";
        const dt  = r[dateKey]   || "Unknown";
        bySource[src] = (bySource[src] || 0) + 1;
        byStatus[sts] = (byStatus[sts] || 0) + 1;
        byDate[dt]    = (byDate[dt]    || 0) + 1;
      });

      res.json({
        account: account.toUpperCase(),
        filters: {
          date:   dateFilter   || "all",
          source: sourceFilter || "all",
          status: statusFilter || "all",
          month:  monthFilter  || "all",
          centre: centreFilter || "all",
        },
        generatedAt: new Date().toISOString(),
        totalRows: filtered.length,
        columns: headers.filter(h => h),
        quickCount: { bySource, byStatus, byDate },
        rows: filtered,
      });
    } catch (err: any) {
      res.status(500).json({ message: "Failed to fetch CRM rows", error: err.message });
    }
  });

  // 3. Master Weekly Funnel Data
  app.get("/api/sheets/master", async (req, res) => {
    res.set("Cache-Control", "no-store, private, max-age=0");

    const account = typeof req.query.account === "string" ? req.query.account.toLowerCase() : "ris";
    const month   = typeof req.query.month === "string" ? req.query.month.toLowerCase() : "may";
    try {
      // Map to the correct tab name
      const monthMap: Record<string, string> = {
        may: "may", april: "apr", apr: "apr", feb: "feb", february: "feb",
      };
      const resolvedMonth = monthMap[month] || month;
      let tabName: string;
      if (account === "rps") {
        tabName = resolvedMonth === "apr" ? "Total RPS Apr'26" : resolvedMonth === "feb" ? "DM RPS Feb' 26" : "'DM RPS MAY'' 26'";
      } else {
        tabName = resolvedMonth === "apr" ? "Total RIS Apr'26" : resolvedMonth === "feb" ? "DM RIS Feb' 26" : "'DM RIS MAY'' 26'";
      }
      const rows = await fetchSheetRange(SHEET_IDS.master, `${tabName}!A:S`);
      // Find header row (row with "Date" or "Total Leads")
      let headerIdx = rows.findIndex(r => r.some(c => c === "Date" || c === "Total Leads"));
      if (headerIdx === -1) headerIdx = 1;
      const header = rows[headerIdx];
      const dataRows = rows.slice(headerIdx + 1).filter(r => r[0] && r[0] !== "");
      const weekly = dataRows.map(r => {
        const obj: Record<string, string> = {};
        header.forEach((h, i) => { if (h) obj[h] = r[i] || "0"; });
        return obj;
      });
      res.json({
        account: account.toUpperCase(),
        tab: tabName,
        month: resolvedMonth,
        generatedAt: new Date().toISOString(),
        weeklyBreakdown: weekly,
      });
    } catch (err: any) {
      res.status(500).json({ message: "Failed to fetch master data", error: err.message });
    }
  });

  // 4. Targets vs Actuals by Branch/Grade
  app.get("/api/sheets/targets", async (req, res) => {
    res.set("Cache-Control", "no-store, private, max-age=0");

    const account = typeof req.query.account === "string" ? req.query.account.toLowerCase() : "ris";
    try {
      // RPS: Row1=section labels ("Jan Actual" / "Monthly Target"), Row2=col headers, Row3+=data
      //   Cols A-H = actuals, Cols K-R = monthly targets (side by side)
      // RIS: Row1=section label, Row2=col headers (Grade-based), Row3+=data (actuals only)
      if (account === "rps") {
        const rows = await fetchSheetRange(SHEET_IDS.rpsCrm, "Target Sheet!A1:R50");
        const colHeaders = rows[1] || []; // Row 2
        const dataRows   = rows.slice(2).filter(r => r[0] && r[0] !== "" && r[0] !== "Branch");
        const merged = dataRows.map(r => ({
          branch:                   r[0] || "",
          // Actuals (Jan)
          leadsActual:              r[1] || "0",
          bookingsActual:           r[2] || "0",
          walkinsActual:            r[3] || "0",
          admissionsActual:         r[4] || "0",
          leadToBookingActual:      r[5] || "0%",
          bookingToWalkinActual:    r[6] || "0%",
          walkinToAdmissionActual:  r[7] || "0%",
          // Monthly Targets (col K=index10 onwards)
          leadsTarget:              r[11] || "0",
          bookingsTarget:           r[12] || "0",
          walkinsTarget:            r[13] || "0",
          admissionsTarget:         r[14] || "0",
          leadToBookingTarget:      r[15] || "0%",
          bookingToWalkinTarget:    r[16] || "0%",
          walkinToAdmissionTarget:  r[17] || "0%",
        }));
        res.json({
          account: "RPS",
          generatedAt: new Date().toISOString(),
          note: "Jan actuals vs monthly targets by branch. Conversion rates: lead→booking, booking→walkin, walkin→admission.",
          branches: merged,
        });
      } else {
        // RIS: by grade, actuals only
        const rows = await fetchSheetRange(SHEET_IDS.risCrm, "Target sheet!A1:H50");
        const dataRows = rows.slice(2).filter(r => r[0] && r[0] !== "" && r[0] !== "Grade");
        const grades = dataRows.map(r => ({
          grade:                   r[0] || "",
          leadsActual:             r[1] || "0",
          bookingsActual:          r[2] || "0",
          walkinsActual:           r[3] || "0",
          admissionsActual:        r[4] || "0",
          leadToBookingActual:     r[5] || "0%",
          bookingToWalkinActual:   r[6] || "0%",
          walkinToAdmissionActual: r[7] || "0%",
        }));
        res.json({
          account: "RIS",
          generatedAt: new Date().toISOString(),
          note: "Jan actuals by grade (Nursery → Class 12). No monthly target column in this sheet.",
          grades,
        });
      }
    } catch (err: any) {
      res.status(500).json({ message: "Failed to fetch targets", error: err.message });
    }
  });

  // ── Sales Dashboard (Walkin Enquiries spreadsheet) ──────────────
  // Aggregates all subsheets from the 2026-27 Walkin Enquiries workbook.
  // Auto-updates: response is no-store; frontend polls every 5 minutes.
  app.get("/api/sales/live", async (req, res) => {
    res.set("Cache-Control", "no-store, private, max-age=0");
    const performanceFilterResult = parseCounselorPerformanceFilters(req.query as Record<string, unknown>);
    if ("error" in performanceFilterResult) {
      return res.status(400).json({ message: performanceFilterResult.error });
    }
    const performanceFilters = performanceFilterResult.filters;
    try {
      const SID = SHEET_IDS.sales;
      const [walkinRows, admRows, provAdmRows, convRows, targetAchRows, targetMonthRow, misDashRows, risDmRows, rpsAdmRows] = await Promise.all([
        fetchSheetRange(SID, "'Walkin Sheet 26-27'!A2:S5000"),
        fetchSheetRange(SID, "'New Admission List'!A2:T500"),
        fetchSheetRange(SID, "'Provisional Admission LIST'!A2:T200"),
        fetchSheetRange(SID, "'CONVERSION RATIO'!I4:Q200"),
        fetchSheetRange(SID, "'RIS Target Sheet '!B13:N14"),   // achieved + target rows
        fetchSheetRange(SID, "'RIS Target Sheet '!B2:N2"),     // month header row
        fetchSheetRange(SID, "'MIS DASHBOARD'!A4:E300"),       // daily MIS rows
        fetchSheetRange(SHEET_IDS.risCrm, "Nur to Class 12!A:L"), // DM pipeline
        fetchSheetRange(SID, "'RPS ADMISSIONS'!A2:A500"),      // RPS rollover admissions
      ]);

      // ── helpers ────────────────────────────────────────────────
      const norm = (s: any) => String(s ?? "").trim();
      const upper = (s: any) => norm(s).toUpperCase();
      const isEmptyRow = (r: any[]) => !r || r.every(c => norm(c) === "");
      // Parse loose date strings ("19 Jun 25", "5-Jul-2025", "01.10.2025", "10/27/2025")
      const parseDate = (s: any): Date | null => {
        const v = norm(s); if (!v) return null;
        const t = v.replace(/\./g, "/").replace(/\s+/g, " ");
        // try direct
        const d1 = new Date(t); if (!isNaN(d1.getTime()) && d1.getFullYear() > 2020 && d1.getFullYear() < 2030) return d1;
        // try DD-MMM-YY / DD MMM YY
        const m = t.match(/^(\d{1,2})[\s\-\/]([A-Za-z]{3,})[\s\-\/](\d{2,4})$/);
        if (m) {
          const y = m[3].length === 2 ? 2000 + +m[3] : +m[3];
          const d2 = new Date(`${m[2]} ${m[1]}, ${y}`);
          if (!isNaN(d2.getTime())) return d2;
        }
        return null;
      };
      const monthKey = (d: Date | null) => d ? `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}` : "";
      const monthLabel = (d: Date | null) => d ? d.toLocaleString("en-US", { month: "short", year: "2-digit" }) : "";
      const incBy = (m: Map<string,number>, k: string) => { if (!k) return; m.set(k, (m.get(k) || 0) + 1); };
      const sortByCount = (m: Map<string,number>) => Array.from(m, ([k,v]) => ({ key: k, count: v })).sort((a,b) => b.count - a.count);

      const now = new Date();
      const curMonthKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;

      // ── Walkins ────────────────────────────────────────────────
      // Cols: 0=SrNo 1=Date 2=Month 3=Name 4=Grade 5=Gender 6=Section 7=Contact 8=Counsellor 9=Source 10=Status
      const sourceMap = new Map<string,number>();
      const statusMap = new Map<string,number>();
      const gradeMap  = new Map<string,number>();
      const walkinByMonth = new Map<string,{label:string; count:number}>();
      type CounselorAgg = { walkins: number; admissions: number; closed: number; followup: number; provisional: number };
      const counselorMap = new Map<string, CounselorAgg>();
      const recentWalkins: Array<{date:string; name:string; grade:string; counselor:string; source:string; status:string; sortKey:number}> = [];
      const closedSegmentMap = new Map<string,number>();
      // Admitted walk-ins by marketing source (replaces New Admission List source col which only has "Unknown"/"Revisit adm")
      const walkinAdmBySource = new Map<string,number>();
      const walkinAdmSrcByMonth = new Map<string, Map<string,number>>();
      const walkinAdmByGrade = new Map<string,number>();
      const walkinAdmByCounselor = new Map<string,number>();
      // Lead temperature classification
      type HeatCell = { hot: number; warm: number; cold: number; provisional: number; open: number };
      const heatGridMap = new Map<string, Map<string, HeatCell>>();
      let tempHot = 0, tempWarm = 0, tempCold = 0, tempProvisional = 0, tempOpen = 0;
      const leadTemp = (st: string): "hot"|"warm"|"cold"|"provisional"|"open" => {
        if (st.includes("ADMIS") && !st.includes("PROV")) return "hot";
        if (st.includes("PROV")) return "provisional";
        if (st.includes("FOLLOW")) return "warm";
        if (st.includes("CLOSED")) return "cold";
        return "open";
      };
      let walkinsTotal = 0, walkinsThisMonth = 0;
      const openWalkinsList: Array<{ date: string; name: string; grade: string; counselor: string; source: string; status: string; daysOpen: number }> = [];

      // Maps raw "REASON OF CLOSING" (col 13) → curated segment name
      const closedSegment = (raw: string): string => {
        const r = raw.toLowerCase().trim();
        if (!r) return "No Reason Recorded";
        if (r.includes("relocat")) return "Location / Not in Catchment";
        if (r.includes("distance")) return "Distance / Too Far";
        if (r.includes("taken") || r.includes("same school") || r.includes("pre-school") || r.includes("pre- school") || r.includes("preschool")) return "Joined Another School";
        if (r.includes("continu")) return "Joined Another School";
        if (r.includes("finance")) return "Finance / Fees";
        if (r.includes("board") || r.includes("icse") || r.includes("rte")) return "Board / Curriculum Preference";
        if (r.includes("not interest") || r.includes("not respond")) return "Not Interested / Unresponsive";
        if (r.includes("shift") || r.includes("saturday") || r.includes("morning") || r.includes("afternoon") || r.includes("day care")) return "Timing / Schedule";
        return "Other";
      };

      // Per-month aggregation for client-side filtering
      type MonthWalkinAgg = {
        label: string;
        walkins: number; admissions: number; closed: number; provisional: number; followup: number;
        counselors: Map<string, CounselorAgg>;
        closedSegs: Map<string, number>;
      };
      const monthWalkinMap = new Map<string, MonthWalkinAgg>();

      for (const r of walkinRows) {
        if (isEmptyRow(r)) continue;
        const name = norm(r[3]); if (!name) continue;
        const d = parseDate(r[1]);
        const counselorRaw = norm(r[7]);
        const isStatusAsCounselor = /ADMIS|CLOSED|FOLLOW[ -]?UP|NOT COUNTED|SEAT NOT|PROVISIONAL|WALKIN/i.test(counselorRaw);
        const counselor = (!isStatusAsCounselor && counselorRaw) ? counselorRaw : "Unassigned";
        const source = norm(r[8]) || "Unknown";
        const status = upper(r[9]) || "OPEN";
        const grade = norm(r[4]) || "Unspecified";
        // Track admitted walk-ins by source, grade and counselor (walk-in sheet cols are correct; New Admission List cols are not)
        if (status.includes("ADMIS") && !status.includes("PROV")) {
          walkinAdmBySource.set(source, (walkinAdmBySource.get(source) || 0) + 1);
          walkinAdmByGrade.set(grade, (walkinAdmByGrade.get(grade) || 0) + 1);
          walkinAdmByCounselor.set(counselor, (walkinAdmByCounselor.get(counselor) || 0) + 1);
          if (d) {
            const mk2 = monthKey(d);
            const msm2 = walkinAdmSrcByMonth.get(mk2) || new Map<string,number>();
            msm2.set(source, (msm2.get(source) || 0) + 1);
            walkinAdmSrcByMonth.set(mk2, msm2);
          }
        }
        const temp = leadTemp(status);
        if (temp === "open" || temp === "warm") {
          const daysOpen = d ? Math.floor((now.getTime() - d.getTime()) / 86400000) : 0;
          openWalkinsList.push({ date: d ? d.toISOString().slice(0,10) : norm(r[1]), name, grade, counselor, source, status, daysOpen });
        }
        if (temp === "hot") tempHot++;
        else if (temp === "warm") tempWarm++;
        else if (temp === "cold") tempCold++;
        else if (temp === "provisional") tempProvisional++;
        else tempOpen++;
        if (d) {
          const mk = monthKey(d);
          const cgrid = heatGridMap.get(counselor) || new Map<string, HeatCell>();
          const cell = cgrid.get(mk) || { hot:0, warm:0, cold:0, provisional:0, open:0 };
          cell[temp]++;
          cgrid.set(mk, cell);
          heatGridMap.set(counselor, cgrid);
        }
        walkinsTotal++;
        if (d && monthKey(d) === curMonthKey) walkinsThisMonth++;
        incBy(sourceMap, source);
        incBy(statusMap, status);
        incBy(gradeMap, grade);
        if (d) {
          const mk = monthKey(d);
          const cur = walkinByMonth.get(mk) || { label: monthLabel(d), count: 0 };
          cur.count++; walkinByMonth.set(mk, cur);
        }
        const ca = counselorMap.get(counselor) || { walkins: 0, admissions: 0, closed: 0, followup: 0, provisional: 0 };
        ca.walkins++;
        if (status.includes("ADMIS") && !status.includes("PROV")) ca.admissions++;
        else if (status.includes("PROV")) ca.provisional++;
        else if (status.includes("CLOSED")) {
          ca.closed++;
          const seg = closedSegment(norm(r[13]));
          closedSegmentMap.set(seg, (closedSegmentMap.get(seg) || 0) + 1);
        }
        else if (status.includes("FOLLOW")) ca.followup++;
        counselorMap.set(counselor, ca);
        recentWalkins.push({
          date: d ? d.toISOString().slice(0,10) : norm(r[1]),
          name, grade, counselor, source, status,
          sortKey: d ? d.getTime() : 0,
        });
        // Per-month aggregation
        if (d) {
          const mk = monthKey(d);
          const mw = monthWalkinMap.get(mk) || { label: monthLabel(d), walkins:0, admissions:0, closed:0, provisional:0, followup:0, counselors: new Map(), closedSegs: new Map() };
          mw.walkins++;
          if (status.includes("ADMIS") && !status.includes("PROV")) mw.admissions++;
          else if (status.includes("PROV")) mw.provisional++;
          else if (status.includes("CLOSED")) { mw.closed++; const s2 = closedSegment(norm(r[13])); mw.closedSegs.set(s2, (mw.closedSegs.get(s2)||0)+1); }
          else if (status.includes("FOLLOW")) mw.followup++;
          const mca = mw.counselors.get(counselor) || { walkins:0, admissions:0, closed:0, followup:0, provisional:0 };
          mca.walkins++;
          if (status.includes("ADMIS") && !status.includes("PROV")) mca.admissions++;
          else if (status.includes("PROV")) mca.provisional++;
          else if (status.includes("CLOSED")) mca.closed++;
          else if (status.includes("FOLLOW")) mca.followup++;
          mw.counselors.set(counselor, mca);
          monthWalkinMap.set(mk, mw);
        }
      }
      const closedReasonSegments = sortByCount(closedSegmentMap).map(x => ({ segment: x.key, count: x.count }));

      // Build heatmap grid: counselor × month cells
      const heatGridArr = Array.from(heatGridMap.entries())
        .map(([counselor, monthMap]) => {
          const months = Array.from(monthMap.entries()).map(([mk, cell]) => ({
            monthKey: mk,
            hot: cell.hot, warm: cell.warm, cold: cell.cold,
            provisional: cell.provisional, open: cell.open,
            total: cell.hot + cell.warm + cell.cold + cell.provisional + cell.open,
          }));
          const totals = months.reduce((acc, m) => ({
            hot: acc.hot + m.hot, warm: acc.warm + m.warm, cold: acc.cold + m.cold,
            provisional: acc.provisional + m.provisional, open: acc.open + m.open,
            total: acc.total + m.total,
          }), { hot:0, warm:0, cold:0, provisional:0, open:0, total:0 });
          return { counselor, months, totals };
        })
        .sort((a, b) => b.totals.total - a.totals.total)
        .filter(c => c.totals.total >= 3);
      const leadTemperature = { hot: tempHot, warm: tempWarm, cold: tempCold, provisional: tempProvisional, open: tempOpen };

      // ── Admissions (New Admission List = single source of truth = 287 confirmed) ──
      // Cols: 0=Sr 1=Date 2=? 3=Week 4=Month 5=Name 6=? 7=Grade 8=Contact
      //       9=Source 10=Revisit 11=Branch 12=Counselor 16=Pendency
      const normBranch = (b: string): string => {
        const v = b.replace(/^RPS\s+/i, "").trim().toLowerCase();
        const MAP: Record<string,string> = {
          "na": "Main", "": "Main",
          "agarwal": "Agarwal", "agrawal": "Agarwal", "agrawal ": "Agarwal",
          "dhokali": "Dhokali",
          "kasarwadavali": "Kasarwadavali",
          "anandnagar": "Anand Nagar", "anand nagar": "Anand Nagar",
          "hariniwas": "Hariniwas",
          "kalwa": "Kalwa",
          "ris": "Main",
        };
        return MAP[v] || b.trim() || "Main";
      };
      // Map text month names (from MONTH col) to YYYY-MM keys
      const MONTH_KEYS: Record<string,string> = {
        "oct":  "2025-10", "november":"2025-11", "nov":"2025-11",
        "dec":  "2025-12", "january": "2026-01", "jan":"2026-01",
        "feb":  "2026-02", "february":"2026-02",
        "mar":  "2026-03", "march":   "2026-03",
        "apr":  "2026-04", "april":   "2026-04",
        "may":  "2026-05",
        "jun":  "2026-06", "june":    "2026-06",
        "jul":  "2026-07", "july":    "2026-07",
        "aug":  "2026-08", "august":  "2026-08",
        "sep":  "2026-09", "september":"2026-09",
      };
      const MONTH_LABELS: Record<string,string> = {
        "2025-10":"Oct '25","2025-11":"Nov '25","2025-12":"Dec '25",
        "2026-01":"Jan '26","2026-02":"Feb '26","2026-03":"Mar '26",
        "2026-04":"Apr '26","2026-05":"May '26","2026-06":"Jun '26",
        "2026-07":"Jul '26","2026-08":"Aug '26","2026-09":"Sep '26",
      };

      const admByMonth  = new Map<string,{label:string; total:number}>();
      const admByBranch = new Map<string,number>();
      const admByGrade  = new Map<string,number>();
      const admBySource = new Map<string,number>();
      const admByCounselor = new Map<string,number>();
      const admSourceByMonth = new Map<string, Map<string,number>>();  // mk → source → count
      const recentAdmissions: Array<{date:string; name:string; grade:string; counselor:string; source:string; branch:string; sortKey:number}> = [];
      // RPS rollover = count of rows in the dedicated "RPS ADMISSIONS" tab (source of truth)
      const rpsRollover = rpsAdmRows.filter(r => r && r[0] && String(r[0]).trim() !== "").length;
      let admTotal = 0, admThisMonth = 0, docsClear = 0, docsPending = 0;

      for (const r of admRows) {
        const name = norm(r[5]); if (!name) continue;       // col 5 = student name
        const d = parseDate(r[1]);
        const monthText = norm(r[4]).toLowerCase();
        const mk = d ? monthKey(d) : (MONTH_KEYS[monthText] || "");
        const label = mk ? (MONTH_LABELS[mk] || mk) : "";
        const grade = norm(r[7]) || "Unspecified";
        const source = norm(r[9]) || "Unknown";
        const rawBranch = norm(r[11]);
        const branch = normBranch(rawBranch);
        const counselor = norm(r[12]) || "Unassigned";
        const pend = upper(r[16]);
        admTotal++;
        if (mk === curMonthKey) admThisMonth++;

        if (pend === "CLEAR CASE" || pend === "CLEAR") docsClear++; else docsPending++;
        if (mk) {
          const cur = admByMonth.get(mk) || { label, total: 0 };
          cur.total++; admByMonth.set(mk, cur);
          const msm = admSourceByMonth.get(mk) || new Map<string,number>();
          msm.set(source, (msm.get(source)||0)+1);
          admSourceByMonth.set(mk, msm);
        }
        incBy(admByBranch, branch);
        incBy(admByGrade, grade);
        incBy(admBySource, source);
        incBy(admByCounselor, counselor);
        recentAdmissions.push({
          date: d ? d.toISOString().slice(0,10) : norm(r[1]),
          name, grade, counselor, source, branch,
          sortKey: d ? d.getTime() : 0,
        });
      }

      // ── Provisional (pending confirmation, not yet in New Admission List) ──
      // Sheet has two sections separated by a label row:
      //   Row "REGULAR PROVISIONAL" → rows with Sr 1-4
      //   Row "INTEGRATED PROVISIONAL" → rows with Sr 1-6
      // Cols (data rows): 0=Sr 1=Date 2=Month 3=Name 4=Grade 5=Contact
      //                   6=Counselor 7=Source 8=Status 10=Branch 19=CoachingInstitute
      let provRegular = 0, provIntegrated = 0, provThisMonth = 0;
      let provSection: "Regular" | "Integrated" = "Regular";
      const recentProvisional: Array<{date:string; name:string; grade:string; counselor:string; source:string; branch:string; type:string; coaching:string; sortKey:number}> = [];
      for (const r of provAdmRows) {
        const sr = norm(r[0]);
        if (!sr) continue;
        // Section header or column header rows — not data rows
        const srUpper = sr.toUpperCase();
        if (srUpper.includes("PROVISIONAL") || srUpper.includes("SR NO") || isNaN(+sr)) {
          if (srUpper.includes("INTEGRATED")) provSection = "Integrated";
          continue;
        }
        const name = norm(r[3]); if (!name) continue;
        const d = parseDate(r[1]);
        const grade = norm(r[4]) || "Unspecified";
        const counselor = norm(r[6]) || "Unassigned";
        const source = norm(r[7]) || "Unknown";
        const branch = normBranch(norm(r[10]));
        const coaching = norm(r[19]) || "";
        if (provSection === "Regular") provRegular++;
        else provIntegrated++;
        if (d && monthKey(d) === curMonthKey) provThisMonth++;
        recentProvisional.push({ date: d ? d.toISOString().slice(0,10) : norm(r[1]), name, grade, counselor, source, branch, type: provSection, coaching, sortKey: d ? d.getTime() : 0 });
      }
      const provTotal = provRegular + provIntegrated;

      // ── Conversion ratio — SUMMARY section (Nursery to Grade 12 consolidated) ──
      const conversionRatio: Array<{counselor:string; enquiries:number; open:number; closed:number; admissions:number; ratio:number; provisional:number; ratioWithProv:number}> = [];
      const CONV_STATUS_LIKE = /ADMIS|CLOSED|FOLLOW[ -]?UP|NOT COUNTED|SEAT NOT|PROVISIONAL|WALKIN|GRAND TOTAL/i;
      for (const r of convRows) {
        if (isEmptyRow(r)) continue;
        const nm = norm(r[1]);
        if (!nm || nm.toLowerCase().includes("name") || nm.toLowerCase() === "total") continue;
        if (CONV_STATUS_LIKE.test(nm)) continue;
        const enq = +norm(r[2]) || 0; if (!enq) continue;
        conversionRatio.push({
          counselor: nm, enquiries: enq,
          open: +norm(r[3]) || 0, closed: +norm(r[4]) || 0,
          admissions: +norm(r[5]) || 0,
          ratio: Math.round((+norm(r[6]) || 0) * 100) / 100,
          provisional: +norm(r[7]) || 0,
          ratioWithProv: Math.round((+norm(r[8]) || 0) * 100) / 100,
        });
      }
      conversionRatio.sort((a, b) => b.admissions - a.admissions);

      // ── Target Sheet (monthly target vs achieved) ──────────────
      // targetAchRows[0] = achieved row (B13:N13), targetAchRows[1] = target row (B14:N14)
      // Cols idx 1-11 = Oct-25 through Aug-26; idx 0=label, idx 12=Total
      const TARGET_MONTHS = ["Oct-25","Nov-25","Dec-25","Jan-26","Feb-26","Mar-26","Apr-26","May-26","Jun-26","Jul-26","Aug-26"];
      const achRow  = targetAchRows[0] || [];
      const tgtRow  = targetAchRows[1] || [];
      const monthlyTargets = TARGET_MONTHS.map((mo, i) => ({
        month: mo,
        target: +norm(tgtRow[i + 1]) || 0,
        achieved: +norm(achRow[i + 1]) || 0,
        gap: Math.max(0, (+norm(tgtRow[i + 1]) || 0) - (+norm(achRow[i + 1]) || 0)),
      }));
      const yearTarget = +norm(tgtRow[12]) || 0;
      const yearAchieved = admTotal;   // New Admission List is single source of truth
      const yearTargetGap = Math.max(0, yearTarget - yearAchieved);

      // ── MIS Dashboard (latest day's ops data) ─────────────────
      const misDateRows = misDashRows.filter((r: any[]) => r[0] && /\d{1,2}\.\d{2}\.\d{4}/.test(norm(r[0])) && norm(r[1]));
      const lastMIS = misDateRows[misDateRows.length - 1] || [];
      const misData = {
        date: norm(lastMIS[0]) || "",
        walkins: +norm(lastMIS[1]) || 0,
        admissions: +norm(lastMIS[2]) || 0,
        targetGap: +norm(lastMIS[3]) || 0,
      };

      // ── Shape outputs ──────────────────────────────────────────
      const sortedMonths = (m: Map<string,any>) => Array.from(m.entries()).sort((a,b) => a[0].localeCompare(b[0]));
      recentWalkins.sort((a,b) => b.sortKey - a.sortKey);
      recentAdmissions.sort((a,b) => b.sortKey - a.sortKey);
      recentProvisional.sort((a,b) => b.sortKey - a.sortKey);

      const counselorLeaderboard = Array.from(counselorMap, ([name, a]) => ({
        counselor: name,
        walkins: a.walkins,
        admissions: a.admissions,
        provisional: a.provisional,
        closed: a.closed,
        followup: a.followup,
        admFromList: admByCounselor.get(name) || 0,
        conversion: a.walkins ? Math.round(((a.admissions + a.provisional) / a.walkins) * 10000) / 100 : 0,
      })).sort((a,b) => b.admissions - a.admissions).filter(c => c.walkins > 0 && c.counselor !== "Unassigned");

      const overallConversion = walkinsTotal ? Math.round((admTotal / walkinsTotal) * 10000) / 100 : 0;
      const generatedAt = new Date().toISOString();
      const counselorPerformanceRecords: CounselorPerformanceRecord[] = [];
      for (const r of walkinRows) {
        if (isEmptyRow(r)) continue;
        const counselorRaw = norm(r[7]);
        const isStatusAsCounselor = /ADMIS|CLOSED|FOLLOW[ -]?UP|NOT COUNTED|SEAT NOT|PROVISIONAL|WALKIN/i.test(counselorRaw);
        const counselor = (!isStatusAsCounselor && counselorRaw) ? counselorRaw : "Unassigned";
        const status = upper(r[9]) || "OPEN";
        const admission = status.includes("ADMIS") && !status.includes("PROV");
        const provisional = status.includes("PROV");
        const closed = status.includes("CLOSED") || status.includes("SEAT NOT") || status.includes("NOT COUNT");
        const followUp = status.includes("FOLLOW");
        counselorPerformanceRecords.push({
          counselor,
          branch: "Main",
          source: norm(r[8]) || "Unknown",
          date: parseDate(r[1]),
          status: {
            admission,
            provisional,
            closed,
            followUp,
            open: !admission && !provisional && !closed && !followUp,
          },
        });
      }
      const counselorPerformance = buildCounselorPerformance(
        "ris",
        generatedAt,
        performanceFilters,
        counselorPerformanceRecords,
      );

      // ── Per-month breakdown for client-side filtering ──────────
      const monthBreakdown = Array.from(monthWalkinMap.entries())
        .sort((a,b) => a[0].localeCompare(b[0]))
        .map(([mk, mw]) => {
          const admSrc = walkinAdmSrcByMonth.get(mk);
          return {
            monthKey: mk, label: mw.label,
            walkins: mw.walkins,
            admissions: mw.admissions,
            closed: mw.closed,
            provisional: mw.provisional,
            followup: mw.followup,
            admBySource: admSrc ? sortByCount(admSrc).map(x => ({ source: x.key, count: x.count })) : [],
            closedSegs: sortByCount(mw.closedSegs).map(x => ({ segment: x.key, count: x.count })),
            counselors: Array.from(mw.counselors, ([name, c]) => ({
              counselor: name, ...c, admFromList: 0,
              conversion: c.walkins ? Math.round(((c.admissions + c.provisional) / c.walkins) * 10000) / 100 : 0,
            })).sort((a,b) => b.admissions - a.admissions).filter(c => c.walkins > 0 && c.counselor !== "Unassigned"),
          };
        });

      // ── RIS DM Pipeline (from Walk-in Sheet — "Digital Marketing" source) ───
      // Reuses walkinRows (already fetched). Filters for source = "Digital Marketing".
      // Shows RA (counselor) breakdown, open leads, ageing, monthly trend.
      // Cols: 7=Counselor(RA)  8=Source  9=Status  1=Date  3=Name  4=Grade
      const dmIsAdm2   = (st: string) => st.includes("ADMIS") && !st.includes("PROV");
      const dmIsProv2  = (st: string) => st.includes("PROV");
      const dmIsClosd2 = (st: string) => st.includes("CLOSED") || st.includes("SEAT NOT") || st.includes("NOT COUNT");

      let dm2Total = 0, dm2Open = 0, dm2Admitted = 0, dm2Closed = 0, dm2Provisional = 0;
      const dm2RaMap = new Map<string, { total: number; open: number; admitted: number; closed: number; provisional: number }>();
      const dm2MonthMap = new Map<string, { label: string; total: number; open: number; admitted: number; closed: number }>();
      const dm2AgeingBuckets: Record<string, number> = { "0-7d": 0, "8-14d": 0, "15-30d": 0, "31-60d": 0, "60d+": 0 };
      const dm2OpenLeads: Array<{ date: string; name: string; grade: string; ra: string; status: string; daysOpen: number }> = [];

      for (const r of walkinRows) {
        if (isEmptyRow(r)) continue;
        const name = norm(r[3]); if (!name) continue;
        const srcFull = norm(r[8]);
        if (!srcFull.toLowerCase().includes("digital marketing")) continue;

        const d = parseDate(r[1]);
        const counselorRaw = norm(r[7]);
        const isStatusVal = /ADMIS|CLOSED|FOLLOW[ -]?UP|NOT COUNT|SEAT NOT|PROV|WALKIN/i.test(counselorRaw);
        const ra = (!isStatusVal && counselorRaw) ? counselorRaw : "Unassigned";
        const status = upper(r[9]) || "OPEN";
        const grade = norm(r[4]) || "Unspecified";

        const isAdm   = dmIsAdm2(status);
        const isProv  = dmIsProv2(status);
        const isClosed= dmIsClosd2(status);
        const isOpen  = !isAdm && !isProv && !isClosed;

        dm2Total++;
        if (isAdm) dm2Admitted++;
        else if (isProv) dm2Provisional++;
        else if (isClosed) dm2Closed++;
        else dm2Open++;

        const raEntry = dm2RaMap.get(ra) || { total:0, open:0, admitted:0, closed:0, provisional:0 };
        raEntry.total++;
        if (isAdm) raEntry.admitted++;
        else if (isProv) raEntry.provisional++;
        else if (isClosed) raEntry.closed++;
        else raEntry.open++;
        dm2RaMap.set(ra, raEntry);

        if (d) {
          const mk = monthKey(d);
          const ml = monthLabel(d);
          const mo = dm2MonthMap.get(mk) || { label: ml, total:0, open:0, admitted:0, closed:0 };
          mo.total++;
          if (isAdm) mo.admitted++;
          else if (isClosed) mo.closed++;
          else if (!isProv) mo.open++;
          dm2MonthMap.set(mk, mo);

          if (isOpen) {
            const daysOpen = Math.max(0, Math.floor((now.getTime() - d.getTime()) / 86400000));
            if (daysOpen <= 7)  dm2AgeingBuckets["0-7d"]++;
            else if (daysOpen <= 14) dm2AgeingBuckets["8-14d"]++;
            else if (daysOpen <= 30) dm2AgeingBuckets["15-30d"]++;
            else if (daysOpen <= 60) dm2AgeingBuckets["31-60d"]++;
            else                     dm2AgeingBuckets["60d+"]++;
            dm2OpenLeads.push({ date: d.toISOString().slice(0,10), name, grade, ra, status, daysOpen });
          }
        }
      }

      dm2OpenLeads.sort((a, b) => b.daysOpen - a.daysOpen);

      const dmPipeline = {
        total:       dm2Total,
        open:        dm2Open,
        admitted:    dm2Admitted,
        closed:      dm2Closed,
        provisional: dm2Provisional,
        convRate:    dm2Total > 0 ? Math.round((dm2Admitted / dm2Total) * 1000) / 10 : 0,
        byRA: Array.from(dm2RaMap.entries())
          .map(([ra, v]) => ({
            ra, total: v.total, open: v.open, admitted: v.admitted, closed: v.closed, provisional: v.provisional,
            convRate: v.total > 0 ? Math.round((v.admitted / v.total) * 1000) / 10 : 0,
          }))
          .sort((a, b) => b.total - a.total),
        byMonth: Array.from(dm2MonthMap.entries())
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([mk, v]) => ({ monthKey: mk, label: v.label, total: v.total, open: v.open, admitted: v.admitted, closed: v.closed })),
        ageing: Object.entries(dm2AgeingBuckets)
          .map(([bucket, count]) => ({ bucket, count, pct: dm2Open > 0 ? Math.round((count / dm2Open) * 100) : 0 })),
        recentOpen: dm2OpenLeads.slice(0, 100),
      };

      const risKpis = {
        walkinsTotal,
        walkinsThisMonth,
        admissionsTotal: admTotal,
        admissionsThisMonth: admThisMonth,
        provisionalCount: provTotal,
        provisionalRegular: provRegular,
        provisionalIntegrated: provIntegrated,
        provisionalThisMonth: provThisMonth,
        rpsRollover,
        overallConversion,
        openEnquiries: (statusMap.get("OPEN") || 0) + (statusMap.get("FOLLOW UP") || 0) + (statusMap.get("FOLLOWUP") || 0),
        closedEnquiries: statusMap.get("CLOSED") || 0,
        yearTarget,
        yearAchieved,
        yearTargetGap,
        docsPending,
        docsClear,
        misDate: misData.date,
        misWalkins: misData.walkins,
        misAdmissions: misData.admissions,
        misTargetGap: misData.targetGap,
      };

      // Slim response for AI agents (default). Pass ?full=1 for the complete dashboard payload.
      if (!req.query.full) {
        let slimCheckins = { todayTotal: 0, byRa: [] as any[] };
        try {
          const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
          const istNow = new Date(Date.now() + IST_OFFSET_MS);
          istNow.setUTCHours(0, 0, 0, 0);
          const todayStart = new Date(istNow.getTime() - IST_OFFSET_MS);
          const counts = await storage.getTodayCheckinCounts(todayStart, "RIS");
          slimCheckins = {
            todayTotal: counts.reduce((s: number, r: any) => s + r.count, 0),
            byRa: counts.sort((a: any, b: any) => b.count - a.count).slice(0, 5),
          };
        } catch {}
        return res.json({
          account: "ris",
          generatedAt,
          counselorPerformance: counselorPerformance.counselorPerformance,
          kpis: risKpis,
          leadTemperature,
          walkinsByMonth: sortedMonths(walkinByMonth).map(([k, v]) => ({ monthKey: k, month: v.label, count: v.count })),
          admissionsByMonth: sortedMonths(admByMonth).map(([k, v]) => ({ monthKey: k, month: v.label, total: v.total })),
          topSources: sortByCount(sourceMap).slice(0, 6).map(x => ({ source: x.key, count: x.count })),
          counselorLeaderboard: counselorLeaderboard.slice(0, 8),
          dmPipeline: { total: dmPipeline.total, open: dmPipeline.open, admitted: dmPipeline.admitted, closed: dmPipeline.closed, convRate: dmPipeline.convRate },
          openWalkins: { count: openWalkinsList.length, oldest5: openWalkinsList.sort((a, b) => b.daysOpen - a.daysOpen).slice(0, 5) },
          todayCheckins: slimCheckins,
        });
      }

      res.json({
        account: "ris",
        generatedAt,
        counselorPerformance: counselorPerformance.counselorPerformance,
        kpis: risKpis,
        monthlyTargets,
        walkins: {
          byMonth: sortedMonths(walkinByMonth).map(([k, v]) => ({ monthKey: k, month: v.label, count: v.count })),
          bySource: sortByCount(sourceMap).map(x => ({ source: x.key, count: x.count })),
          byStatus: sortByCount(statusMap).map(x => ({ status: x.key, count: x.count })),
          byGrade: sortByCount(gradeMap).map(x => ({ grade: x.key, count: x.count })),
          recent: recentWalkins.slice(0, 25).map(({sortKey, ...rest}) => rest),
          closedReasonSegments,
        },
        admissions: {
          byMonth: sortedMonths(admByMonth).map(([k, v]) => ({ monthKey: k, month: v.label, total: v.total })),
          byBranch: sortByCount(admByBranch).map(x => ({ branch: x.key, count: x.count })),
          byGrade: sortByCount(walkinAdmByGrade).map(x => ({ grade: x.key, count: x.count })),
          bySource: sortByCount(walkinAdmBySource).map(x => ({ source: x.key, count: x.count })),
          byCounselor: sortByCount(walkinAdmByCounselor).map(x => ({ counselor: x.key, count: x.count })),
          recent: recentAdmissions.slice(0, 25).map(({sortKey, ...rest}) => rest),
          recentProvisional: recentProvisional.slice(0, 10).map(({sortKey, ...rest}) => rest),
        },
        counselorLeaderboard,
        conversionRatio,
        monthBreakdown,
        leadTemperature,
        heatGrid: heatGridArr,
        dmPipeline,
        openWalkins: openWalkinsList.sort((a, b) => b.daysOpen - a.daysOpen),
        liveCheckins: await (async () => {
          try {
            // IST midnight in UTC: IST = UTC+5:30, so IST midnight = UTC 18:30 previous day
            const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
            const nowUTC = Date.now();
            const istNow = new Date(nowUTC + IST_OFFSET_MS);
            istNow.setUTCHours(0, 0, 0, 0);
            const todayStart = new Date(istNow.getTime() - IST_OFFSET_MS);
            const [todayCounts, todayRecent, last7Days] = await Promise.all([
              storage.getTodayCheckinCounts(todayStart, "RIS"),
              storage.listCheckins(todayStart, "RIS"),
              storage.getDailyCheckinCounts(7, "RIS"),
            ]);
            return {
              todayTotal: todayCounts.reduce((s, r) => s + r.count, 0),
              byRa: todayCounts.sort((a, b) => b.count - a.count),
              recent: todayRecent.slice(0, 20),
              last7Days,
            };
          } catch {
            return { todayTotal: 0, byRa: [], recent: [], last7Days: [] };
          }
        })(),
      });
    } catch (err: any) {
      res.status(500).json({ message: "Failed to fetch sales data", error: err.message });
    }
  });

  // ── OpenAPI schema served as static file ──────────────────
  // client/public/openapi.yaml is the single source of truth, served by Vite
  // (dev) and express.static (prod). Do not re-add a dynamic /openapi.yaml route
  // here — it shadows the static file and drifts out of sync, which broke the
  // ChatGPT custom GPT in May 2026 (spec missing /api/marketing/export).
  /* DISABLED dynamic /openapi.yaml route — kept commented for history only.
  app.get("/openapi.yaml", (req, res) => {
    const proto = "https";
    const host  = "rainbowinternationalschool.in";
    const base  = `${proto}://${host}`;
    const yaml  = `openapi: "3.0.0"
info:
  title: Rainbow Group Marketing API
  description: >
    Live marketing, CRM and operations data for Rainbow International School (RIS)
    and Rainbow Preschools (RPS). Protected endpoints require the ADMIN_TOKEN as
    an API key in the X-Api-Key header.
  version: "1.0.0"
servers:
  - url: ${base}
    description: Rainbow Group API

security:
  - ApiKeyAuth: []

components:
  securitySchemes:
    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-Api-Key

paths:
  /api/marketing/live:
    get:
      operationId: getMarketingLive
      summary: Live combined marketing metrics from Google Sheets
      description: >
        Returns live monthly totals (leads, bookings, walk-ins, admissions, ad spend)
        for both RIS and RPS combined, sourced directly from the DM Overall master
        Google Sheet. Also includes RPS branch-wise CRM, RIS education-level CRM,
        closed-lead reasons for both, and May weekly breakdown. No auth required.
      security: []
      responses:
        "200":
          description: >
            Live aggregated data — monthly totals, RPS branch CRM, RIS grade CRM,
            closed reasons, May weekly, and current day of month.

  /api/sheets/crm:
    get:
      operationId: getSheetsCrm
      summary: CRM lead summary by status, source, month and owner
      description: >
        Returns live lead counts from the RPS or RIS CRM Google Sheet, aggregated
        by status (ADM DONE, CLOSED, Open…), lead source, month, and owner.
        Optionally filter to a single month.
      parameters:
        - name: account
          in: query
          required: true
          schema:
            type: string
            enum: [ris, rps]
          description: Which school's CRM to query.
        - name: month
          in: query
          required: false
          schema:
            type: string
          description: >
            Optional month filter (case-insensitive substring match), e.g. "may",
            "apr", "jan". Omit for all months.
      responses:
        "200":
          description: >
            CRM summary with totalLeads, admissionsDone, closed, open,
            conversionRate, and breakdowns by status, source, month, and owner.
        "401":
          description: Missing or invalid API key.

  /api/sheets/master:
    get:
      operationId: getSheetsMaster
      summary: Weekly funnel breakdown from the DM master tracker
      description: >
        Returns week-by-week lead → booking → walk-in → admission data for a
        given school and month from the DM master Google Sheet.
      parameters:
        - name: account
          in: query
          required: true
          schema:
            type: string
            enum: [ris, rps]
          description: Which school's tab to fetch.
        - name: month
          in: query
          required: false
          schema:
            type: string
            enum: [may, april, feb]
          description: Month to retrieve. Defaults to may.
      responses:
        "200":
          description: Weekly breakdown — leads, walk-ins, admissions, conversion rates.
        "401":
          description: Missing or invalid API key.

  /api/sheets/targets:
    get:
      operationId: getSheetsTargets
      summary: Branch/grade actuals vs targets from Google Sheets
      description: >
        RPS — returns per-branch actuals (leads, bookings, walk-ins, admissions,
        conversion rates) alongside monthly targets.
        RIS — returns per-grade actuals (Nursery through Class 12).
      parameters:
        - name: account
          in: query
          required: true
          schema:
            type: string
            enum: [ris, rps]
          description: Which school's target sheet to fetch.
      responses:
        "200":
          description: Per-branch actuals vs monthly targets (RPS) or per-grade actuals (RIS).
        "401":
          description: Missing or invalid API key.

  /api/sheets/tasks:
    get:
      operationId: getSheetsTasks
      summary: Key task tracker from Google Sheets
      description: >
        Returns tasks from the Key Task sheet with assignee, due date, status
        and remarks. Optionally filter by status.
      parameters:
        - name: status
          in: query
          required: false
          schema:
            type: string
          description: >
            Filter by task status (case-insensitive substring), e.g. "pending",
            "completed". Omit for all tasks.
      responses:
        "200":
          description: Task list with summary counts (total, completed, pending).
        "401":
          description: Missing or invalid API key.
`;
    res.setHeader("Content-Type", "text/yaml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=60");
    res.send(yaml);
  });
  */

  // ── OpenAPI schema — served dynamically from latest source file ────────
  // This prevents the stale-file problem where Vite’s build output (dist/public/)
  // sometimes lags behind client/public/ during deployment. The dynamic route
  // reads the file directly so ChatGPT always gets the current spec.
  app.get("/openapi.yaml", (_req, res) => {
    res.setHeader("Content-Type", "text/yaml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=60, must-revalidate");
    res.send(OPENAPI_YAML);
  });

  // ── Indra OpenAPI schema ───────────────────────────────────────────────
  // Keep this route separate from /openapi.yaml: the older public marketing
  // schema is still used by the existing GPT integration, while this schema
  // describes only the read-only, token-protected Indra bridge.
  app.get("/openapi-indra.yaml", (_req, res) => {
    res.setHeader("Content-Type", "text/yaml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=300, must-revalidate");
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
    res.send(INDRA_OPENAPI_YAML);
  });

  // ── RA Walk-in QR Check-in System ──────────────────────────────────────

  function requireAdmin(req: any, res: any, next: any) {
    const adminToken = process.env.ADMIN_TOKEN;
    if (!adminToken) return res.status(503).json({ message: "Admin token not configured" });
    const authHeader = req.headers.authorization || "";
    const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    // Reject immediately if lengths differ (timing-safe compare requires equal-length buffers)
    if (!bearer || bearer.length !== adminToken.length) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      if (!timingSafeEqual(Buffer.from(adminToken), Buffer.from(bearer))) throw new Error();
    } catch {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  }

  // Returns the expected HMAC session token for the alliances dashboard session cookie.
  function alliancesSessionToken(): string | null {
    const secret = process.env.SESSION_SECRET;
    if (!secret) return null;
    return createHmac("sha256", secret).update("alliances-session-v1").digest("hex");
  }

  // Parses cookies from a raw Cookie header string.
  function parseCookies(cookieHeader: string): Record<string, string> {
    return Object.fromEntries(
      cookieHeader.split(";").map(c => {
        const i = c.indexOf("=");
        return i < 0 ? [c.trim(), ""] : [c.slice(0, i).trim(), decodeURIComponent(c.slice(i + 1).trim())];
      })
    );
  }

  // Accepts either the admin Bearer token OR a valid server-issued alliances session cookie.
  // Used for read-only Friendship Schools endpoints accessible from the alliances dashboard.
  function requireAlliancesOrAdmin(req: any, res: any, next: any) {
    // Check server-issued alliances session cookie
    const expected = alliancesSessionToken();
    if (expected) {
      const cookies = parseCookies(req.headers.cookie || "");
      const sessionVal = cookies["alliances_session"] || "";
      if (sessionVal && sessionVal.length === expected.length) {
        try {
          if (timingSafeEqual(Buffer.from(expected), Buffer.from(sessionVal))) return next();
        } catch { /* fall through */ }
      }
    }
    // Fall back to admin Bearer token
    const adminToken = process.env.ADMIN_TOKEN;
    if (!adminToken) return res.status(503).json({ message: "Admin token not configured" });
    const authHeader = req.headers.authorization || "";
    const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!bearer || bearer.length !== adminToken.length) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      if (!timingSafeEqual(Buffer.from(adminToken), Buffer.from(bearer))) throw new Error();
    } catch {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  }

  // ── AY 2027-28 Walk-in Admissions Capture System ─────────────
  // Must be registered BEFORE /api/walkin/:slug so specific paths like
  // /api/walkin/leads and /api/walkin/branches are not swallowed by the RA slug route.
  registerWalkinRoutes(app);
  registerIndraIntegrationRoutes(app);
  registerMcpGateway(app);
  startIndraPushScheduler();

  // Public: get RA info by slug (used by walkin form to display RA name)
  app.get("/api/walkin/:slug/info", async (req, res) => {
    try {
      const ra = await storage.getRaBySlug(req.params.slug);
      if (!ra || !ra.active) return res.status(404).json({ message: "RA not found or inactive" });
      res.json({ id: ra.id, name: ra.name, branch: ra.branch });
    } catch {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Public: submit walk-in check-in
  app.post("/api/walkin/:slug", async (req, res) => {
    try {
      const ra = await storage.getRaBySlug(req.params.slug);
      if (!ra || !ra.active) return res.status(404).json({ message: "RA not found or inactive" });
      const { parentName, studentName, grade } = req.body;
      if (!parentName?.trim() || !studentName?.trim() || !grade?.trim()) {
        return res.status(400).json({ message: "parentName, studentName, and grade are required" });
      }
      const checkin = await storage.createCheckin(ra.id, ra.name, ra.branch, parentName.trim(), studentName.trim(), grade.trim(), ra.school);
      console.log(`[walkin] Check-in (${ra.school}): ${parentName} / ${studentName} (${grade}) → ${ra.name}`);
      res.status(201).json({ success: true, id: checkin.id });
      // Best-effort: sync to Google Sheets in the background (does not block or affect the response)
      const appendFn = checkin.school === "RPS" ? appendToRpsWalkinSheet : appendToWalkinSheet;
      appendFn(checkin)
        .then(() => storage.markCheckinSynced(checkin.id))
        .catch(async (err: unknown) => {
          const msg = err instanceof Error ? err.message : String(err);
          console.error(`[walkin] Sheet sync failed for ${checkin.id}: ${msg}`);
          await storage.markCheckinSyncFailed(checkin.id, msg).catch(() => {});
        });
    } catch {
      res.status(500).json({ message: "Failed to record check-in" });
    }
  });

  // Admin: manually retry syncing all unsynced check-ins to Google Sheets
  app.post("/api/admin/ras/sync-sheets", requireAdmin, async (_req, res) => {
    try {
      const rows = await storage.listUnsyncedCheckins();
      let synced = 0;
      let failed = 0;
      for (const row of rows) {
        try {
          await (row.school === "RPS" ? appendToRpsWalkinSheet(row) : appendToWalkinSheet(row));
          await storage.markCheckinSynced(row.id);
          synced++;
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          await storage.markCheckinSyncFailed(row.id, msg).catch(() => {});
          failed++;
        }
      }
      res.json({ total: rows.length, synced, failed });
    } catch {
      res.status(500).json({ message: "Sync failed" });
    }
  });

  // Admin: list all RAs
  app.get("/api/admin/ras", requireAdmin, async (_req, res) => {
    try {
      res.json(await storage.listRas());
    } catch {
      res.status(500).json({ message: "Failed to fetch RAs" });
    }
  });

  // Admin: get single RA by slug (for QR card page)
  app.get("/api/admin/ras/slug/:slug", requireAdmin, async (req, res) => {
    try {
      const ra = await storage.getRaBySlug(req.params.slug);
      if (!ra) return res.status(404).json({ message: "RA not found" });
      res.json(ra);
    } catch {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Admin: list all submissions with optional ?since= filter
  app.get("/api/admin/ras/submissions", requireAdmin, async (req, res) => {
    try {
      const since = req.query.since ? new Date(String(req.query.since)) : undefined;
      res.json(await storage.listCheckins(since));
    } catch {
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });

  // Admin: create RA
  app.post("/api/admin/ras", requireAdmin, async (req, res) => {
    try {
      const validated = insertRaSchema.parse(req.body);
      const existing = await storage.getRaBySlug(validated.slug);
      if (existing) return res.status(409).json({ message: `Slug "${validated.slug}" is already taken` });
      const ra = await storage.createRa(validated);
      res.status(201).json(ra);
      // Fire-and-forget: notify GSC about the new page without blocking the response
      triggerSitemapResubmit(`new RA page created: ${validated.slug}`);
    } catch (err: any) {
      if (err.name === "ZodError") return res.status(400).json({ message: fromZodError(err).message });
      res.status(500).json({ message: "Failed to create RA" });
    }
  });

  // Admin: update RA
  app.put("/api/admin/ras/:id", requireAdmin, async (req, res) => {
    try {
      const validated = insertRaSchema.partial().parse(req.body);
      if (validated.slug) {
        const existing = await storage.getRaBySlug(validated.slug);
        if (existing && existing.id !== req.params.id) {
          return res.status(409).json({ message: `Slug "${validated.slug}" is already taken` });
        }
      }
      const ra = await storage.updateRa(req.params.id, validated);
      if (!ra) return res.status(404).json({ message: "RA not found" });
      res.json(ra);
      // Fire-and-forget: notify GSC about the updated page without blocking the response
      triggerSitemapResubmit(`RA page updated: ${req.params.id}`);
    } catch (err: any) {
      if (err.name === "ZodError") return res.status(400).json({ message: fromZodError(err).message });
      res.status(500).json({ message: "Failed to update RA" });
    }
  });

  // ── Admin: Blog Posts ────────────────────────────────────────────────────────
  app.get("/api/admin/blog-posts", requireAdmin, async (_req, res) => {
    try {
      const posts = await storage.getAllBlogPosts();
      res.json(posts);
    } catch {
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  app.post("/api/admin/blog-posts", requireAdmin, async (req, res) => {
    try {
      const { insertBlogPostSchema } = await import("@shared/schema");
      const validated = insertBlogPostSchema.parse(req.body);
      const post = await storage.upsertBlogPost(validated);
      // Protect the new URL immediately — no server restart required.
      noteBlogSlugAdded(post.slug);
      res.status(201).json(post);
      // Fire-and-forget: notify GSC about the new content without blocking the response
      triggerSitemapResubmit(`new blog post published: ${validated.slug}`);
    } catch (err: any) {
      if (err.name === "ZodError") return res.status(400).json({ message: fromZodError(err).message });
      res.status(500).json({ message: "Failed to save blog post" });
    }
  });

  app.put("/api/admin/blog-posts/:slug", requireAdmin, async (req, res) => {
    try {
      const { insertBlogPostSchema } = await import("@shared/schema");
      const validated = insertBlogPostSchema.parse(req.body);
      const post = await storage.updateBlogPost(req.params.slug, validated);
      if (!post) return res.status(404).json({ message: "Blog post not found" });
      // A rename changes the live URL: protect the new slug, release the old one.
      if (post.slug !== req.params.slug) noteBlogSlugRemoved(req.params.slug);
      noteBlogSlugAdded(post.slug);
      res.json(post);
      // Fire-and-forget: notify GSC about the updated content without blocking the response
      triggerSitemapResubmit(`blog post updated: ${req.params.slug}`);
    } catch (err: any) {
      if (err.name === "ZodError") return res.status(400).json({ message: fromZodError(err).message });
      res.status(500).json({ message: "Failed to update blog post" });
    }
  });

  app.delete("/api/admin/blog-posts/:slug", requireAdmin, async (req, res) => {
    try {
      const post = await storage.getBlogPostBySlug(req.params.slug);
      if (!post) return res.status(404).json({ message: "Blog post not found" });
      await storage.deleteBlogPost(req.params.slug);
      noteBlogSlugRemoved(req.params.slug);
      res.json({ success: true });
    } catch {
      res.status(500).json({ message: "Failed to delete blog post" });
    }
  });

  // POST /api/admin/upload-image — upload a blog hero or thumbnail image (admin only)
  // Accepts: multipart/form-data with a single "image" field (JPEG, PNG, WebP; max 5 MB)
  // Returns: { url: "/uploads/blog/<filename>" }
  app.post("/api/admin/upload-image", requireAdmin, (req: any, res: any) => {
    blogImageUpload.single("image")(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ message: "File too large. Maximum size is 5 MB." });
        }
        return res.status(400).json({ message: `Upload error: ${err.message}` });
      }
      if (err) return res.status(400).json({ message: err.message });
      if (!req.file) return res.status(400).json({ message: "No file provided." });
      if (!checkImageMagicBytes(req.file.path)) {
        try { fs.unlinkSync(req.file.path); } catch {}
        return res.status(400).json({ message: "File content does not match a valid image format (JPEG, PNG, or WebP required)." });
      }
      res.json({ url: `/uploads/blog/${req.file.filename}` });
    });
  });

  // Sales: today's live check-in counts (no extra auth — same trust level as /api/sales/live)
  app.get("/api/walkin/today", async (req, res) => {
    res.set("Cache-Control", "no-store, private, max-age=0");
    try {
      const schoolParam = typeof req.query.school === "string" ? req.query.school.toUpperCase() : undefined;
      const school = schoolParam === "RIS" || schoolParam === "RPS" ? schoolParam : undefined;
      const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
      const istNow = new Date(Date.now() + IST_OFFSET_MS);
      istNow.setUTCHours(0, 0, 0, 0);
      const todayStart = new Date(istNow.getTime() - IST_OFFSET_MS);
      const [counts, recent] = await Promise.all([
        storage.getTodayCheckinCounts(todayStart, school),
        storage.listCheckins(todayStart, school),
      ]);
      const total = counts.reduce((s, r) => s + r.count, 0);
      res.json({ total, byRa: counts, recent: recent.slice(0, 30) });
    } catch {
      res.status(500).json({ message: "Failed to fetch today's check-ins" });
    }
  });

  // ── RPS Marketing Monthly Spend (real data from master sheet) ───────────────
  app.get("/api/marketing/monthly", async (_req, res) => {
    res.set("Cache-Control", "no-store, private, max-age=0");
    try {
      // Re-use the already-parsed rpsSpend from /api/marketing/live by fetching it internally.
      // rpsSpend month labels ("Dec 25", "Jan 26", …) → YYYY-MM monthKeys for the RpsSales page.
      const LABEL_TO_KEY: Record<string, string> = {
        "Jun 25": "2025-06", "Jul 25": "2025-07", "Aug 25": "2025-08",
        "Sep 25": "2025-09", "Oct 25": "2025-10", "Nov 25": "2025-11",
        "Dec 25": "2025-12", "Jan 26": "2026-01", "Feb 26": "2026-02",
        "Mar 26": "2026-03", "Apr 26": "2026-04", "May 26": "2026-05",
        "Jun 26": "2026-06",
      };
      const liveResp = await fetch(`http://localhost:${process.env.PORT ?? 5000}/api/marketing/live`);
      if (!liveResp.ok) return res.json([]);
      const live = await liveResp.json() as { rpsSpend: Array<{ month: string; salaries: number; meta: number; google: number; adSpend: number }> };
      const result = (live.rpsSpend ?? [])
        .filter(s => s.adSpend > 0 || s.salaries > 0)
        .map(s => {
          const monthKey = LABEL_TO_KEY[s.month] ?? "";
          return { monthKey, label: s.month, salaries: s.salaries, meta: s.meta, google: s.google, adSpend: s.adSpend, total: s.adSpend };
        })
        .filter(s => s.monthKey);
      res.json(result);
    } catch (err: any) {
      console.error("[marketing/monthly] error:", err?.message);
      res.status(500).json({ message: "Failed to fetch RPS marketing spend" });
    }
  });

  // ── RPS Sales Dashboard ─────────────────────────────────────────────────────
  app.get("/api/rps-sales/live", async (req, res) => {
    res.set("Cache-Control", "no-store, private, max-age=0");
    const performanceFilterResult = parseCounselorPerformanceFilters(req.query as Record<string, unknown>);
    if ("error" in performanceFilterResult) {
      return res.status(400).json({ message: performanceFilterResult.error });
    }
    const performanceFilters = performanceFilterResult.filters;
    try {
      const requestedAcademicYear = performanceFilters.academicYear || "";
      const RPS_SID = "1ShXsyfbtViGccYcgPGMIEcT8C4m_Cs3b6yio6N54D1Q";
      const [walkinRows, indConvRows, dmRows, misRows, dCohortRows, branchClosedRows, branchAsmRows, branchOpenRows, branchWalkinRows] = await Promise.all([
        fetchSheetRange(RPS_SID, "'Walkin Data'!A2:U5000"),
        fetchSheetRange(RPS_SID, "'Individual Conversion'!A3:K100"),
        fetchSheetRange(RPS_SID, "'DM Tracker'!A2:Z2000"),
        fetchSheetRange(RPS_SID, "'MIS DASHBOARD'!A5:D100"),
        fetchSheetRange(RPS_SID, "'D-Cohort'!A1:I200"),
        fetchSheetRange(RPS_SID, "'Branch Closed'!A1:C200"),
        fetchSheetRange(RPS_SID, "'Branch Admissions'!A2:K10"),
        fetchSheetRange(RPS_SID, "'Branch Open'!A2:G10"),
        fetchSheetRange(RPS_SID, "'Branch Walkin'!A2:I10"),
      ]);

      const norm  = (s: any) => String(s ?? "").trim();
      const upper = (s: any) => norm(s).toUpperCase();
      const isEmptyRow = (r: any[]) => !r || r.every(c => norm(c) === "");
      const toInt = (s: any) => parseInt(norm(s).replace(/,/g, ""), 10) || 0;

      const parseDate = (s: any): Date | null => {
        const v = norm(s); if (!v) return null;
        const t = v.replace(/\./g, "/").replace(/\s+/g, " ");
        const d1 = new Date(t);
        if (!isNaN(d1.getTime()) && d1.getFullYear() > 2020 && d1.getFullYear() < 2030) return d1;
        const m = t.match(/^(\d{1,2})[\s\-\/]([A-Za-z]{3,})[\s\-\/](\d{2,4})$/);
        if (m) {
          const y = m[3].length === 2 ? 2000 + +m[3] : +m[3];
          const d2 = new Date(`${m[2]} ${m[1]}, ${y}`);
          if (!isNaN(d2.getTime())) return d2;
        }
        return null;
      };
      const mkKey   = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
      const mkLabel = (d: Date) => d.toLocaleString("en-US", { month: "short", year: "2-digit" });

      const now = new Date();
      const curMK = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;

      // ── Walkin Data ─────────────────────────────────────────────────────────
      // Cols: 0=No 1=Date 2=Month 3=Branch 4=StudentName 5=Grade 6=AcadYear
      //       7=MotherContact 8=FatherContact 9=Email 10=Counsellor
      //       11=CounsellingRecorded 12=SchoolTour 13=SOURCE 14=Status
      //       15=AdmDate 16=Remarks 17=ReasonForClosed 18=Trial 19=UniqueID 20=MIS
      let totalEnq = 0, totalAdm = 0, totalAdmRIS = 0, openEnq = 0, closedTotal = 0, inProcess = 0, futureProspect = 0;
      let thisMonthEnq = 0, thisMonthAdm = 0;

      const byMonthMap  = new Map<string, { label: string; enquiries: number; admissions: number }>();
      type MonthDetail = { monthKey: string; label: string; enquiries: number; admissions: number; branches: Map<string, { enquiries: number; admissions: number }>; sources: Map<string, { enquiries: number; admissions: number }> };
      const monthDetailMap = new Map<string, MonthDetail>();
      const byBranchMap = new Map<string, { enquiries: number; admissions: number; open: number; closed: number }>();
      const bySourceMap = new Map<string, { enquiries: number; admissions: number }>();
      const byGradeMap  = new Map<string, number>();
      const closedReasonMap = new Map<string, number>();
      type RpsRecent = { date: string; monthKey: string; name: string; grade: string; branch: string; counselor: string; source: string; status: string; sortKey: number };
      const recentEnquiries: RpsRecent[] = [];
      // Lead time (enquiry → admission)
      const leadDays: number[] = [];
      // Ageing for open/in-process leads
      let age0_7 = 0, age7_14 = 0, age15_30 = 0, age31_60 = 0, age60p = 0;
      const rpsOpenWalkins: Array<{ date: string; name: string; grade: string; branch: string; counselor: string; source: string; status: string; daysOpen: number }> = [];
      // Closed reason by month for heat-map
      const closedByMonthReason = new Map<string, Map<string, number>>();
      // Counselor funnel (from Walkin Data cols 11=CounsellingRecorded 12=SchoolTour)
      type CounFunnel = { display: string; enquiries: number; counselled: number; toured: number; admitted: number };
      const counselorFunnelMap = new Map<string, CounFunnel>();
      // Counselor leaderboard — derived directly from Walkin Data (more accurate than pivot)
      type CounLB = { display: string; admDone: number; admRIS: number; closed: number; open: number; inProcess: number; futureProspect: number; total: number };
      const counselorLBMap = new Map<string, CounLB>();
      // Title-case helper for merging name variants ("Snehal shetty" → "Snehal Shetty")
      const toTitleCase = (s: string) => s.replace(/\b\w/g, c => c.toUpperCase());

      for (const r of walkinRows) {
        if (isEmptyRow(r)) continue;
        if (requestedAcademicYear && norm(r[6]) !== requestedAcademicYear) continue;
        const name = norm(r[4]); if (!name) continue;
        const d       = parseDate(r[1]);
        const branch  = norm(r[3]) || "Unknown";
        const source  = norm(r[13]) || "Unknown";
        const statusRaw = upper(r[14]);
        const grade   = norm(r[5]) || "Unspecified";
        const reason  = norm(r[17]);
        const counselor = norm(r[10]) || "Unassigned";

        const isAdm    = statusRaw === "ADM DONE";
        const isAdmRIS = statusRaw === "ADM DONE IN RIS";
        const isClosed = statusRaw.startsWith("CLOSED");
        const isOpen   = statusRaw === "OPEN";
        const isInProc = statusRaw === "IN PROCESS ADM";
        const isFuture = statusRaw.startsWith("FUTURE");

        totalEnq++;
        if (isAdm)    totalAdm++;
        if (isAdmRIS) totalAdmRIS++;
        if (isClosed) { closedTotal++; if (reason) closedReasonMap.set(reason, (closedReasonMap.get(reason)||0)+1); }
        if (isOpen)   openEnq++;
        if (isInProc) inProcess++;
        if (isFuture) futureProspect++;

        if (d) {
          const mk = mkKey(d);
          const lbl = mkLabel(d);
          const mo = byMonthMap.get(mk) || { label: lbl, enquiries: 0, admissions: 0 };
          mo.enquiries++;
          if (isAdm || isAdmRIS) mo.admissions++;
          byMonthMap.set(mk, mo);
          // per-month branch+source detail (for month filter)
          const det = monthDetailMap.get(mk) || { monthKey: mk, label: lbl, enquiries: 0, admissions: 0, branches: new Map(), sources: new Map() };
          det.enquiries++;
          if (isAdm || isAdmRIS) det.admissions++;
          const detBr = det.branches.get(branch) || { enquiries: 0, admissions: 0 };
          detBr.enquiries++; if (isAdm || isAdmRIS) detBr.admissions++;
          det.branches.set(branch, detBr);
          const detSrc = det.sources.get(source) || { enquiries: 0, admissions: 0 };
          detSrc.enquiries++; if (isAdm || isAdmRIS) detSrc.admissions++;
          det.sources.set(source, detSrc);
          monthDetailMap.set(mk, det);
          if (mk === curMK) { thisMonthEnq++; if (isAdm || isAdmRIS) thisMonthAdm++; }
          // Lead time (v2.3 bug fix: strictly > 0 days, admDate must be after enqDate)
          if ((isAdm || isAdmRIS) && norm(r[15])) {
            const admD = parseDate(r[15]);
            if (admD) {
              const days = Math.round((admD.getTime() - d.getTime()) / 86400000);
              if (days > 0 && days < 400) leadDays.push(days);
            }
          }
          // Ageing for open leads
          if (isOpen || isInProc || isFuture) {
            const daysOld = Math.round((now.getTime() - d.getTime()) / 86400000);
            if (daysOld < 7) age0_7++;
            else if (daysOld < 15) age7_14++;
            else if (daysOld < 31) age15_30++;
            else if (daysOld < 61) age31_60++;
            else age60p++;
          }
          // Closed reason by month
          if (isClosed && reason) {
            const rMap = closedByMonthReason.get(mk) || new Map();
            rMap.set(reason, (rMap.get(reason)||0)+1);
            closedByMonthReason.set(mk, rMap);
          }
        }
        // Collect open walk-in leads (visited but not yet admitted/closed)
        if (isOpen || isInProc || isFuture) {
          const daysOpen = d ? Math.floor((now.getTime() - d.getTime()) / 86400000) : 0;
          rpsOpenWalkins.push({ date: d ? d.toISOString().slice(0,10) : norm(r[1]), name, grade, branch, counselor, source, status: statusRaw, daysOpen });
        }

        const br = byBranchMap.get(branch) || { enquiries: 0, admissions: 0, open: 0, closed: 0 };
        br.enquiries++;
        if (isAdm || isAdmRIS) br.admissions++;
        if (isOpen || isInProc || isFuture) br.open++;
        if (isClosed) br.closed++;
        byBranchMap.set(branch, br);

        const src = bySourceMap.get(source) || { enquiries: 0, admissions: 0 };
        src.enquiries++;
        if (isAdm || isAdmRIS) src.admissions++;
        bySourceMap.set(source, src);

        byGradeMap.set(grade, (byGradeMap.get(grade)||0)+1);

        // Counselor funnel — key is lowercase so "Snehal shetty" merges with "Snehal Shetty"
        const cfKey = counselor.toLowerCase();
        const cf = counselorFunnelMap.get(cfKey) || { display: toTitleCase(counselor), enquiries:0, counselled:0, toured:0, admitted:0 };
        cf.enquiries++;
        if (norm(r[11]).toLowerCase() === "yes") cf.counselled++;
        if (norm(r[12]).toLowerCase() === "yes") cf.toured++;
        if (isAdm || isAdmRIS) cf.admitted++;
        counselorFunnelMap.set(cfKey, cf);


        recentEnquiries.push({
          date: d ? `${d.getDate()} ${d.toLocaleString("en-US",{month:"short"})} ${String(d.getFullYear()).slice(2)}` : "",
          monthKey: d ? mkKey(d) : "",
          name, grade, branch, source, status: statusRaw, counselor,
          sortKey: d ? d.getTime() : 0,
        });
      }
      recentEnquiries.sort((a, b) => b.sortKey - a.sortKey);

      // ── Counselor leaderboard — dedicated pass (does NOT gate on student name) ──
      // The main walkin loop skips rows with empty student names; the pivot counts ALL rows
      // where the counsellor column is filled. This separate pass matches the pivot's count.
      for (const r of walkinRows) {
        if (isEmptyRow(r)) continue;
        if (requestedAcademicYear && norm(r[6]) !== requestedAcademicYear) continue;
        const coun = norm(r[10]); if (!coun || coun.toLowerCase() === "unassigned") continue;
        const lbKey = coun.toLowerCase();
        const lb = counselorLBMap.get(lbKey) || { display: toTitleCase(coun), admDone:0, admRIS:0, closed:0, open:0, inProcess:0, futureProspect:0, total:0 };
        lb.total++; // count every row where counsellor name is present
        const st = upper(r[14]);
        if (st === "ADM DONE")             lb.admDone++;
        else if (st === "ADM DONE IN RIS") lb.admRIS++;
        else if (st.startsWith("CLOSED"))  lb.closed++;
        else if (st === "OPEN")            lb.open++;
        else if (st === "IN PROCESS ADM")  lb.inProcess++;
        else if (st.startsWith("FUTURE"))  lb.futureProspect++;
        counselorLBMap.set(lbKey, lb);
      }

      // ── Lead time stats ─────────────────────────────────────────────────────
      leadDays.sort((a, b) => a - b);
      const ltMedian = leadDays.length ? leadDays[Math.floor(leadDays.length / 2)] : 0;
      const ltP90    = leadDays.length ? leadDays[Math.floor(leadDays.length * 0.9)] : 0;
      const ltBuckets = [
        { bucket:"0-15d",  count: leadDays.filter(d=>d<16).length },
        { bucket:"16-30d", count: leadDays.filter(d=>d>=16&&d<31).length },
        { bucket:"31-60d", count: leadDays.filter(d=>d>=31&&d<61).length },
        { bucket:"61-90d", count: leadDays.filter(d=>d>=61&&d<91).length },
        { bucket:">90d",   count: leadDays.filter(d=>d>=91).length },
      ].filter(b=>b.count>0);

      // ── Ageing buckets ──────────────────────────────────────────────────────
      const openActiveTotal = age0_7+age7_14+age15_30+age31_60+age60p;
      const ageingBuckets = [
        { bucket:"<7 days",    count:age0_7,   pct: openActiveTotal ? Math.round(age0_7/openActiveTotal*100)   : 0 },
        { bucket:"7-14 days",  count:age7_14,  pct: openActiveTotal ? Math.round(age7_14/openActiveTotal*100)  : 0 },
        { bucket:"15-30 days", count:age15_30, pct: openActiveTotal ? Math.round(age15_30/openActiveTotal*100) : 0 },
        { bucket:"31-60 days", count:age31_60, pct: openActiveTotal ? Math.round(age31_60/openActiveTotal*100) : 0 },
        { bucket:">60 days",   count:age60p,   pct: openActiveTotal ? Math.round(age60p/openActiveTotal*100)   : 0 },
      ];

      // ── Counselor funnel top 12 ─────────────────────────────────────────────
      const counselorFunnel = Array.from(counselorFunnelMap, ([, f]) => ({ counselor: f.display, enquiries: f.enquiries, counselled: f.counselled, toured: f.toured, admitted: f.admitted }))
        .filter(c => c.enquiries > 2)
        .sort((a, b) => b.admitted - a.admitted)
        .slice(0, 12);

      // ── Closed-reason trend heat-map ────────────────────────────────────────
      const heatMonthKeys = Array.from(byMonthMap.keys()).sort();
      const topReasons = Array.from(closedReasonMap.entries()).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([r])=>r);
      const closedReasonTrend = {
        months: heatMonthKeys.map(mk => byMonthMap.get(mk)?.label || mk),
        monthKeys: heatMonthKeys,
        data: topReasons.map(reason => ({
          reason,
          counts: Object.fromEntries(heatMonthKeys.map(mk => [mk, closedByMonthReason.get(mk)?.get(reason)||0])),
        })),
      };

      // ── Forecast (linear regression on monthly admissions) ──────────────────
      const sortedMoArr = Array.from(byMonthMap, ([mk, v]) => ({ mk, label: v.label, admissions: v.admissions }))
        .sort((a,b) => a.mk.localeCompare(b.mk));
      const regData = sortedMoArr.slice(-6);
      let forecastSeries: Array<{ label: string; actual?: number; projected?: number }> = [];
      if (regData.length >= 3) {
        const n = regData.length;
        const xs = regData.map((_, i) => i);
        const ys = regData.map(m => m.admissions);
        const sX = xs.reduce((s,x)=>s+x,0), sY = ys.reduce((s,y)=>s+y,0);
        const sXY = xs.reduce((s,x,i)=>s+x*ys[i],0), sX2 = xs.reduce((s,x)=>s+x*x,0);
        const b = (n*sXY-sX*sY)/(n*sX2-sX*sX||1);
        const a = (sY-b*sX)/n;
        forecastSeries = sortedMoArr.map(m => ({ label: m.label, actual: m.admissions }));
        const lastMK = sortedMoArr[sortedMoArr.length-1].mk;
        const [ly, lm] = lastMK.split("-").map(Number);
        for (let i = 1; i <= 2; i++) {
          const nm = lm+i; const ny = nm>12?ly+1:ly; const nml = nm>12?nm-12:nm;
          const projLabel = new Date(ny,nml-1,1).toLocaleString("en-US",{month:"short",year:"2-digit"});
          forecastSeries.push({ label: projLabel, projected: Math.max(0,Math.round(a+b*(n-1+i))) });
        }
      }

      // ── Counselor leaderboard — built from Walkin Data (row-level, most accurate) ──
      // counselorLBMap was populated inside the walkin loop above.
      // Conv% = (admDone + admRIS) / total enquiries × 100
      const counselorLeaderboard = Array.from(counselorLBMap, ([, c]) => ({
        counselor: c.display, admDone: c.admDone, admRIS: c.admRIS, closed: c.closed,
        open: c.open, inProcess: c.inProcess, futureProspect: c.futureProspect, total: c.total,
        conversion: c.total > 0 ? Math.round(((c.admDone + c.admRIS) / c.total) * 1000) / 10 : 0,
      })).filter(c => c.total > 0).sort((a, b) => (b.admDone + b.admRIS) - (a.admDone + a.admRIS));

      // ── DM Tracker ──────────────────────────────────────────────────────────
      // Cols: 0=UniqueID 1=Date 2=Month 3=Branch 4=StudentName 5=Grade 6=AcadYear
      //       7=MothersContact 8=FathersContact 9=Email 10=Counsellor 11=Source
      //       12=EnqMode 13=AdmDate 14=AdmMonth 15=Remarks 16=DaysSinceVisit(pre-computed)
      //       17=AdmDeadline 18=Status(Admitted/Closed/Open) 19=DeadlineExt
      //       20=SalesConfidence 21=DeadlineStatus 22=ConversionTimeline(days)
      let dmAdmitted = 0, dmOpen = 0, dmClosed = 0;
      const dmByBranchMap    = new Map<string, { admitted: number; open: number; closed: number }>();
      const dmConfidenceMap  = new Map<string, number>();
      // v2.3 additions
      const dmConvTimes: number[] = [];   // days to convert (admitted only)
      type DmCoun = { open: number; admitted: number; closed: number; totalConvDays: number };
      const dmCounselorMap = new Map<string, DmCoun>();
      // DM open ageing using pre-computed DaysSinceVisit (col 16)
      let dmAge0_7 = 0, dmAge7_14 = 0, dmAge15_30 = 0, dmAge31_60 = 0, dmAge60p = 0;
      // Confidence × branch matrix (open only)
      type ConfBr = { branch: string; High: number; Medium: number; Low: number };
      const dmConfBranchMap = new Map<string, ConfBr>();

      for (const r of dmRows) {
        if (isEmptyRow(r)) continue;
        const name     = norm(r[4]); if (!name) continue;
        const status   = norm(r[18]).toLowerCase();
        const branch   = norm(r[3]) || "Unknown";
        const conf     = norm(r[20]) || "Unknown";
        const counselor = norm(r[10]) || "Unassigned";
        const daysSince = parseInt(norm(r[16])||"0", 10);
        const convDays  = parseInt(norm(r[22])||"0", 10);

        if (status === "admitted")    dmAdmitted++;
        else if (status === "closed") dmClosed++;
        else if (status === "open")   dmOpen++;
        else continue;

        const br = dmByBranchMap.get(branch) || { admitted:0, open:0, closed:0 };
        if (status === "admitted") { br.admitted++; if (convDays > 0) dmConvTimes.push(convDays); }
        else if (status === "closed") br.closed++;
        else if (status === "open")   { br.open++; }
        dmByBranchMap.set(branch, br);

        if (conf && conf !== "Unknown")
          dmConfidenceMap.set(conf, (dmConfidenceMap.get(conf)||0) + (status === "open" ? 1 : 0));

        // Counselor DM breakdown
        const dc = dmCounselorMap.get(counselor) || { open:0, admitted:0, closed:0, totalConvDays:0 };
        if (status === "admitted") { dc.admitted++; if (convDays > 0) dc.totalConvDays += convDays; }
        else if (status === "closed") dc.closed++;
        else if (status === "open") dc.open++;
        dmCounselorMap.set(counselor, dc);

        // DM ageing for open records (using pre-computed DaysSinceVisit)
        if (status === "open" && daysSince >= 0) {
          if (daysSince < 7)       dmAge0_7++;
          else if (daysSince < 15) dmAge7_14++;
          else if (daysSince < 31) dmAge15_30++;
          else if (daysSince < 61) dmAge31_60++;
          else                     dmAge60p++;
        }

        // Confidence × branch matrix (open)
        if (status === "open") {
          const cb = dmConfBranchMap.get(branch) || { branch, High:0, Medium:0, Low:0 };
          if (conf === "High") cb.High++;
          else if (conf === "Medium") cb.Medium++;
          else if (conf === "Low") cb.Low++;
          dmConfBranchMap.set(branch, cb);
        }
      }

      // DM derived stats
      dmConvTimes.sort((a,b)=>a-b);
      const dmConvMedian = dmConvTimes.length ? dmConvTimes[Math.floor(dmConvTimes.length/2)] : 0;
      const dmOpenTotal  = dmAge0_7+dmAge7_14+dmAge15_30+dmAge31_60+dmAge60p;
      const dmAgeing = [
        { bucket:"<7 days",   count:dmAge0_7,   pct: dmOpenTotal?Math.round(dmAge0_7/dmOpenTotal*100):0 },
        { bucket:"7-14 days", count:dmAge7_14,  pct: dmOpenTotal?Math.round(dmAge7_14/dmOpenTotal*100):0 },
        { bucket:"15-30 days",count:dmAge15_30, pct: dmOpenTotal?Math.round(dmAge15_30/dmOpenTotal*100):0 },
        { bucket:"31-60 days",count:dmAge31_60, pct: dmOpenTotal?Math.round(dmAge31_60/dmOpenTotal*100):0 },
        { bucket:">60 days",  count:dmAge60p,   pct: dmOpenTotal?Math.round(dmAge60p/dmOpenTotal*100):0 },
      ];
      const dmCounselorStats = Array.from(dmCounselorMap, ([counselor, c]) => ({
        counselor, ...c,
        avgConvDays: c.admitted > 0 ? Math.round(c.totalConvDays / c.admitted) : 0,
        total: c.open + c.admitted + c.closed,
        conv: (c.open+c.admitted+c.closed) ? Math.round(c.admitted/(c.open+c.admitted+c.closed)*100) : 0,
      })).filter(c => c.total > 0).sort((a,b) => b.admitted - a.admitted).slice(0, 12);

      // ── D-Cohort (weekly DM conversion speed cohort) ─────────────────────────
      // Col: 0=WeekStart 1=Walkins 2=AdmDone 3=Conv% 4=AvgDays 5=0-3d 6=4-7d 7=8-14d 8=15+d
      type CohortRow = { week: string; walkins: number; admDone: number; convPct: number; avgDays: number; b0_3: number; b4_7: number; b8_14: number; b15p: number };
      const dCohort: CohortRow[] = [];
      for (const r of dCohortRows) {
        if (isEmptyRow(r)) continue;
        const week = norm(r[0]); if (!week || week === "Cohort Week Start") continue;
        const walkins = toInt(r[1]); if (!walkins) continue;
        dCohort.push({
          week, walkins, admDone: toInt(r[2]),
          convPct: parseFloat(norm(r[3]).replace("%","")) || 0,
          avgDays: toInt(r[4]), b0_3: toInt(r[5]), b4_7: toInt(r[6]), b8_14: toInt(r[7]), b15p: toInt(r[8]),
        });
      }

      // ── Branch Closed (reason × branch) ─────────────────────────────────────
      // Cols: 0=Branch(may be blank for subsequent rows) 1=Reason 2=Count
      type BranchClosed = { branch: string; reason: string; count: number };
      const branchClosedList: BranchClosed[] = [];
      let lastBranch = "";
      for (const r of branchClosedRows) {
        if (isEmptyRow(r)) continue;
        const br = norm(r[0]); const reason = norm(r[1]); const count = toInt(r[2]);
        if (!reason || !count) continue;
        if (br) lastBranch = br;
        if (lastBranch && lastBranch !== "BRANCH") branchClosedList.push({ branch: lastBranch, reason, count });
      }

      // ── Branch Admissions pivot (source breakdown per branch) ─────────────────
      // Row 0 = ["BRANCH","Brand Tie up","Direct Walkin","DM","DM Online Enquiry","EX-Parent","Referral","Sibling","Telephonic","Grand Total"]
      // Row 1+ = branch data
      type BranchSrcAdm = { branch: string; brandTieup: number; directWalkin: number; dm: number; referral: number; sibling: number; total: number };
      const branchSrcAdmList: BranchSrcAdm[] = [];
      const baHeader = branchAsmRows[0] || [];
      for (let i = 1; i < branchAsmRows.length; i++) {
        const r = branchAsmRows[i];
        const br = norm(r[0]); if (!br || br === "Grand Total") continue;
        branchSrcAdmList.push({
          branch: br, brandTieup: toInt(r[1]), directWalkin: toInt(r[2]),
          dm: toInt(r[3]), referral: toInt(r[5]||"0"), sibling: toInt(r[6]||"0"),
          total: toInt(r[baHeader.length - 1] || r[r.length-1]),
        });
      }

      // ── Branch Open pivot (live open pipeline per branch) ─────────────────────
      // Row 0 = ["BRANCH","Direct Walkin","DM","DM Online Enquiry","Referral","Grand Total"]
      type BranchOpenRow = { branch: string; directWalkin: number; dm: number; referral: number; total: number };
      const branchOpenList: BranchOpenRow[] = [];
      const boHeader = branchOpenRows[0] || [];
      for (let i = 1; i < branchOpenRows.length; i++) {
        const r = branchOpenRows[i];
        const br = norm(r[0]); if (!br || br === "Grand Total") continue;
        branchOpenList.push({
          branch: br, directWalkin: toInt(r[1]), dm: toInt(r[2]), referral: toInt(r[3]||"0"),
          total: toInt(r[boHeader.length - 1] || r[r.length-1]),
        });
      }

      // ── MIS History (cumulative running totals) ─────────────────────────────
      // A5 = first data row; Cols: 0=Date(DD.MM.YYYY) 1=TotalWalkins 2=TotalAdm 3=TargetGap
      const misHistory: Array<{ date: string; walkins: number; admissions: number; gap: number }> = [];
      for (const r of misRows) {
        if (isEmptyRow(r)) continue;
        const date = norm(r[0]); if (!/\d{2}\.\d{2}\.\d{4}/.test(date)) continue;
        const walkins = toInt(r[1]); if (!walkins) continue;
        misHistory.push({ date, walkins, admissions: toInt(r[2]), gap: toInt(r[3]) });
      }

      // ── Shape output ────────────────────────────────────────────────────────
      const byMonth  = Array.from(byMonthMap,  ([monthKey, v]) => ({ monthKey, ...v })).sort((a,b) => a.monthKey.localeCompare(b.monthKey));
      const byBranch = Array.from(byBranchMap, ([branch, v]) => ({
        branch, ...v, conversion: v.enquiries ? Math.round((v.admissions/v.enquiries)*1000)/10 : 0,
      })).sort((a,b) => b.admissions - a.admissions);
      const bySource = Array.from(bySourceMap, ([source, v]) => ({ source, ...v })).sort((a,b) => b.enquiries - a.enquiries);
      const byGrade  = Array.from(byGradeMap,  ([grade, count]) => ({ grade, count })).sort((a,b) => b.count - a.count);
      const closedReasons = Array.from(closedReasonMap, ([reason, count]) => ({ reason, count })).sort((a,b) => b.count - a.count).slice(0,12);
      const overallConversion = totalEnq ? Math.round(((totalAdm + totalAdmRIS)/totalEnq)*1000)/10 : 0;
      const generatedAt = new Date().toISOString();
      const counselorPerformanceRecords: CounselorPerformanceRecord[] = [];
      for (const r of walkinRows) {
        if (isEmptyRow(r)) continue;
        const status = upper(r[14]);
        counselorPerformanceRecords.push({
          counselor: norm(r[10]) || "Unassigned",
          branch: norm(r[3]) || "Unknown",
          source: norm(r[13]) || "Unknown",
          date: parseDate(r[1]),
          academicYear: norm(r[6]) || null,
          status: {
            admission: status === "ADM DONE" || status === "ADM DONE IN RIS",
            closed: status.startsWith("CLOSED"),
            open: status === "OPEN",
            inProcess: status === "IN PROCESS ADM",
            futureProspect: status.startsWith("FUTURE"),
          },
        });
      }
      const counselorPerformance = buildCounselorPerformance(
        "rps",
        generatedAt,
        performanceFilters,
        counselorPerformanceRecords,
      );

      const monthlyDetail = Array.from(monthDetailMap.values()).map(det => ({
        monthKey: det.monthKey, label: det.label, enquiries: det.enquiries, admissions: det.admissions,
        branches: Object.fromEntries(Array.from(det.branches.entries()).map(([br, v]) => [br, v])),
        sources:  Object.fromEntries(Array.from(det.sources.entries()).map(([src, v]) => [src, v])),
      })).sort((a, b) => a.monthKey.localeCompare(b.monthKey));

      // Slim response for AI agents (default). Pass ?full=1 for the complete dashboard payload.
      if (!req.query.full) {
        let slimCheckins = { todayTotal: 0, byRa: [] as any[] };
        try {
          const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
          const istNow = new Date(Date.now() + IST_OFFSET_MS);
          istNow.setUTCHours(0, 0, 0, 0);
          const todayStart = new Date(istNow.getTime() - IST_OFFSET_MS);
          const counts = await storage.getTodayCheckinCounts(todayStart, "RPS");
          slimCheckins = {
            todayTotal: counts.reduce((s: number, r: any) => s + r.count, 0),
            byRa: counts.sort((a: any, b: any) => b.count - a.count).slice(0, 5),
          };
        } catch {}
        return res.json({
          account: "rps",
          generatedAt,
          counselorPerformance: counselorPerformance.counselorPerformance,
          kpis: { totalEnquiries: totalEnq, totalAdmissions: totalAdm, totalAdmRIS, openEnquiries: openEnq, closedTotal, inProcess, futureProspect, overallConversion, thisMonthEnquiries: thisMonthEnq, thisMonthAdm },
          byMonth,
          byBranch,
          topSources: bySource.slice(0, 6),
          counselorLeaderboard: counselorLeaderboard.slice(0, 8),
          closedReasons: closedReasons.slice(0, 6),
          dmPipeline: { admitted: dmAdmitted, open: dmOpen, closed: dmClosed, convMedianDays: dmConvMedian },
          ageingBuckets,
          openWalkins: { count: rpsOpenWalkins.length, oldest5: rpsOpenWalkins.sort((a, b) => b.daysOpen - a.daysOpen).slice(0, 5) },
          todayCheckins: slimCheckins,
        });
      }

      res.json({
        account: "rps",
        generatedAt,
        counselorPerformance: counselorPerformance.counselorPerformance,
        kpis: { totalEnquiries: totalEnq, totalAdmissions: totalAdm, totalAdmRIS, openEnquiries: openEnq, closedTotal, inProcess, futureProspect, overallConversion, thisMonthEnquiries: thisMonthEnq, thisMonthAdm },
        byMonth, byBranch, bySource, byGrade, counselorLeaderboard, closedReasons,
        monthlyDetail,
        recentEnquiries: recentEnquiries,
        dmPipeline: {
          admitted: dmAdmitted, open: dmOpen, closed: dmClosed,
          convMedianDays: dmConvMedian,
          byBranch: Array.from(dmByBranchMap, ([branch, v]) => ({ branch, ...v })).sort((a,b) => b.admitted - a.admitted),
          byConfidence: Array.from(dmConfidenceMap, ([confidence, count]) => ({ confidence, count })).filter(x=>x.count>0).sort((a,b) => b.count - a.count),
          ageing: dmAgeing,
          counselors: dmCounselorStats,
          confByBranch: Array.from(dmConfBranchMap.values()).sort((a,b) => (b.High+b.Medium+b.Low)-(a.High+a.Medium+a.Low)),
        },
        misHistory: misHistory.slice(-30),
        leadTime: { median: ltMedian, p90: ltP90, histogram: ltBuckets, sampleSize: leadDays.length },
        ageingBuckets,
        counselorFunnel,
        closedReasonTrend,
        forecastSeries,
        dCohort,
        branchClosedList,
        branchSrcAdm: branchSrcAdmList,
        branchOpenPipeline: branchOpenList,
        openWalkins: rpsOpenWalkins.sort((a, b) => b.daysOpen - a.daysOpen),
        liveCheckins: await (async () => {
          try {
            const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
            const istNow = new Date(Date.now() + IST_OFFSET_MS);
            istNow.setUTCHours(0, 0, 0, 0);
            const todayStart = new Date(istNow.getTime() - IST_OFFSET_MS);
            const [todayCounts, todayRecent, last7Days] = await Promise.all([
              storage.getTodayCheckinCounts(todayStart, "RPS"),
              storage.listCheckins(todayStart, "RPS"),
              storage.getDailyCheckinCounts(7, "RPS"),
            ]);
            return {
              todayTotal: todayCounts.reduce((s, r) => s + r.count, 0),
              byRa: todayCounts.sort((a, b) => b.count - a.count),
              recent: todayRecent.slice(0, 20),
              last7Days,
            };
          } catch {
            return { todayTotal: 0, byRa: [], recent: [], last7Days: [] };
          }
        })(),
      });
    } catch (err: any) {
      console.error("[rps-sales] error:", err?.message);
      res.status(500).json({ message: err?.message || "Failed to load RPS sales data" });
    }
  });

  // ── Alliances Dashboard ───────────────────────────────────────
  // Public: exchange alliances dashboard passcode for a signed session cookie
  app.post("/api/alliances/verify-passcode", async (req, res) => {
    try {
      const passcode = process.env.ALLIANCES_PASSCODE;
      if (!passcode) return res.status(503).json({ message: "Not configured" });
      const submitted = String(req.body?.passcode || "");
      if (!submitted || submitted.length !== passcode.length) {
        return res.status(401).json({ ok: false });
      }
      try {
        if (!timingSafeEqual(Buffer.from(passcode), Buffer.from(submitted))) {
          return res.status(401).json({ ok: false });
        }
      } catch { return res.status(401).json({ ok: false }); }
      const token = alliancesSessionToken();
      if (!token) return res.status(503).json({ message: "SESSION_SECRET not configured" });
      res.setHeader("Set-Cookie", `alliances_session=${token}; Path=/; HttpOnly; SameSite=Strict`);
      res.json({ ok: true });
    } catch {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/alliances/live", async (_req, res) => {
    try {
      const SID = SHEET_IDS.alliances;
      const [bpRows, ctRows, fsRows, paRows] = await Promise.all([
        fetchSheetRange(SID, "Brand Partners!A:T"),
        fetchSheetRange(SID, "Corporate Tie-ups!A:R"),
        fetchSheetRange(SID, "Friendship Schools!A:R"),
        fetchSheetRange(SID, "Parent Advocacy!A:N"),
      ]);

      const n = (v: string | undefined) => { const x = parseFloat((v ?? "").replace(/,/g, "")); return isNaN(x) ? 0 : x; };
      const bool = (v: string | undefined) => (v ?? "").toLowerCase().includes("yes") || (v ?? "").toLowerCase().includes("true");

      // Brand Partners (skip header row 0)
      // Actual sheet columns (A:T, 0-indexed):
      // 0=S.No  1=Brand Name  2=Category  3=Address/Location  4=Contact details
      // 5=Discount/Offer  6=Owner  7=Stage  8=Date First Approached  9=Last Update Date
      // 10=MOU Sent Date  11=MOU Done Date  12=Banner  13=Website  14=Brochure
      // 15=Instagram  16=Admissions Referred  17=Days Since Update  18=Follow Up Needed
      const brandPartners = bpRows.slice(1)
        .filter(r => r[1] && r[1].trim())
        .map(r => ({
          sno: r[0] ?? "",
          name: r[1] ?? "",
          category: r[2] ?? "",
          discount: r[5] ?? "",
          owner: r[6] ?? "",
          stage: r[7] ?? "",
          dateApproached: r[8] ?? "",
          lastUpdate: r[9] ?? "",
          mouSentDate: r[10] ?? "",
          mouDoneDate: r[11] ?? "",
          hasBanner: bool(r[12]),
          hasWebsite: bool(r[13]),
          hasBrochure: bool(r[14]),
          admissionsReferred: n(r[16]),
          daysSinceUpdate: n(r[17]),
          followUpNeeded: bool(r[18]),
        }));

      // Corporate Tie-ups
      const corporates = ctRows.slice(1)
        .filter(r => r[1] && r[1].trim())
        .map(r => ({
          sno: r[0] ?? "",
          name: r[1] ?? "",
          size: r[2] ?? "",
          industry: r[3] ?? "",
          location: r[4] ?? "",
          employees: r[5] ?? "",
          contactPerson: r[6] ?? "",
          contactNumber: r[7] ?? "",
          owner: r[8] ?? "",
          stage: r[9] ?? "",
          dateApproached: r[10] ?? "",
          lastUpdate: r[11] ?? "",
          mouSentDate: r[12] ?? "",
          mouDoneDate: r[13] ?? "",
          admissionsReferred: n(r[14]),
          daysSinceUpdate: n(r[15]),
          followUpNeeded: bool(r[16]),
          remarks: r[17] ?? "",
        }));

      // Friendship Schools
      const friendshipSchools = fsRows.slice(1)
        .filter(r => r[1] && r[1].trim())
        .map(r => ({
          sno: r[0] ?? "",
          name: r[1] ?? "",
          location: r[2] ?? "",
          address: r[3] ?? "",
          contactPerson: r[4] ?? "",
          contactNumber: r[5] ?? "",
          catersFrom: r[6] ?? "",
          avgFee: r[7] ?? "",
          strength: r[8] ?? "",
          contractType: r[9] ?? "",
          owner: r[10] ?? "",
          stage: r[11] ?? "",
          dateApproached: r[12] ?? "",
          lastUpdate: r[13] ?? "",
          mouSentDate: r[14] ?? "",
          mouDoneDate: r[15] ?? "",
          admJrKg: n(r[16]),
          admSrKg: n(r[17]),
          totalAdm: n(r[16]) + n(r[17]),
        }));

      // Parent Advocacy
      // Actual sheet columns (A:N, 0-indexed):
      // 0=S.No  1=Student Name (RIS student)  2=Branch  3=Ward-Class
      // 4=Father Name  5=Mother Name  6=Contact Number
      // 7=Partner Status (H)  8=Referred Family Name  9=Grade Applying For
      // 10=Status (referral lead stage)  11=Date Referred  12=Last Update  13=Incentive Given?
      const parentAdvocacy = paRows.slice(1)
        .filter(r => r[1] && r[1].trim())
        .map(r => ({
          sno: r[0] ?? "",
          referringParent: r[1] ?? "",
          branch: r[2] ?? "",
          wardClass: r[3] ?? "",
          fatherName: r[4] ?? "",
          motherName: r[5] ?? "",
          contactNumber: r[6] ?? "",
          partnerStatus: r[7] ?? "",
          referredFamily: r[8] ?? "",
          gradeApplying: r[9] ?? "",
          status: r[10] ?? "",
          dateReferred: r[11] ?? "",
          lastUpdate: r[12] ?? "",
          incentiveGiven: r[13] ?? "",
        }));

      // ── Computed aggregates ────────────────────────────────────
      const PIPELINE_STAGES = ["Not Contacted","Initial Discussion","Touchbase Done","Waiting for Revert","MOU Sent","MOU Signing Pending","MOU Done","Not Interested / Dropped"];
      const PA_STATUSES = ["Enquired","Campus Visit Scheduled","Application Submitted","Admission Confirmed","Not Interested"];
      const PA_PARTNER_STATUSES = ["Accepted","To be Decided","Rejected","Not yet reached"];

      // Ambassador recruitment counts (partnerStatus col H)
      const partnerStatusCounts = {
        accepted:   parentAdvocacy.filter(p => p.partnerStatus === "Accepted").length,
        pending:    parentAdvocacy.filter(p => p.partnerStatus === "To be Decided").length,
        rejected:   parentAdvocacy.filter(p => p.partnerStatus === "Rejected").length,
        notReached: parentAdvocacy.filter(p => !p.partnerStatus?.trim()).length,
      };

      const stageCounts = (arr: {stage:string}[]) => {
        const m: Record<string,number> = {};
        for (const s of PIPELINE_STAGES) m[s] = 0;
        for (const r of arr) { if (m[r.stage] !== undefined) m[r.stage]++; else m["Not Contacted"]++; }
        return m;
      };
      const statusCounts = (arr: {status:string}[]) => {
        const m: Record<string,number> = {};
        for (const s of PA_STATUSES) m[s] = 0;
        for (const r of arr) { if (m[r.status] !== undefined) m[r.status]++; }
        return m;
      };

      // Owner leaderboard — across all verticals
      const ownerMap: Record<string, {total:number;mouDone:number;admissions:number;followUp:number}> = {};
      const addOwner = (owner:string, isMou:boolean, adm:number, fu:boolean) => {
        if (!owner.trim()) return;
        if (!ownerMap[owner]) ownerMap[owner] = {total:0,mouDone:0,admissions:0,followUp:0};
        ownerMap[owner].total++;
        if (isMou) ownerMap[owner].mouDone++;
        ownerMap[owner].admissions += adm;
        if (fu) ownerMap[owner].followUp++;
      };
      for (const r of brandPartners) addOwner(r.owner, r.stage==="MOU Done", r.admissionsReferred, r.followUpNeeded);
      for (const r of corporates) addOwner(r.owner, r.stage==="MOU Done", r.admissionsReferred, r.followUpNeeded);
      for (const r of friendshipSchools) addOwner(r.owner, r.stage==="MOU Done", r.totalAdm, false);
      // PA has no owner column — skip owner leaderboard for PA entries

      const ownerLeaderboard = Object.entries(ownerMap)
        .map(([name, d]) => ({ name, ...d }))
        .sort((a, b) => b.total - a.total);

      // Category breakdown for brand partners
      const categoryMap: Record<string, {total:number;mouDone:number;admissions:number}> = {};
      for (const r of brandPartners) {
        const cat = r.category || "Uncategorised";
        if (!categoryMap[cat]) categoryMap[cat] = {total:0,mouDone:0,admissions:0};
        categoryMap[cat].total++;
        if (r.stage==="MOU Done") categoryMap[cat].mouDone++;
        categoryMap[cat].admissions += r.admissionsReferred;
      }
      const categoryBreakdown = Object.entries(categoryMap)
        .map(([name, d]) => ({ name, ...d }))
        .sort((a, b) => b.total - a.total);

      // KPIs
      const totalProspects = brandPartners.length + corporates.length + friendshipSchools.length;
      const totalMouDone = brandPartners.filter(r=>r.stage==="MOU Done").length
        + corporates.filter(r=>r.stage==="MOU Done").length
        + friendshipSchools.filter(r=>r.stage==="MOU Done").length;
      const totalAdmissions = brandPartners.reduce((s,r)=>s+r.admissionsReferred,0)
        + corporates.reduce((s,r)=>s+r.admissionsReferred,0)
        + friendshipSchools.reduce((s,r)=>s+r.totalAdm,0)
        + parentAdvocacy.filter(r=>r.status==="Admission Confirmed").length;
      const totalFollowUp = brandPartners.filter(r=>r.followUpNeeded).length
        + corporates.filter(r=>r.followUpNeeded).length;
      const paAdmissions = parentAdvocacy.filter(r=>r.status==="Admission Confirmed").length;
      const paReferrals = parentAdvocacy.length;

      res.json({
        generatedAt: new Date().toISOString(),
        kpi: { totalProspects, totalMouDone, totalAdmissions, totalFollowUp, paReferrals, paAdmissions },
        funnel: {
          brandPartners: stageCounts(brandPartners),
          corporates: stageCounts(corporates),
          friendshipSchools: stageCounts(friendshipSchools),
          parentAdvocacy: statusCounts(parentAdvocacy),
        },
        brandPartners,
        corporates,
        friendshipSchools,
        parentAdvocacy,
        ownerLeaderboard,
        categoryBreakdown,
        pipelineStages: PIPELINE_STAGES,
        paStatuses: PA_STATUSES,
        paPartnerStatuses: PA_PARTNER_STATUSES,
        partnerStatusCounts,
      });
    } catch (err: any) {
      console.error("[alliances] error:", err?.message);
      res.status(500).json({ message: "Failed to fetch alliances data", error: err.message });
    }
  });

  // ── Friendship School QR Portal ─────────────────────────────────────────────

  const FRIENDSHIP_TEMPLATE_PATH = path.resolve("./server/assets/friendship_school_template.xlsx");

  async function ensureFriendshipSheetTab(sheets: any, sheetId: string, tabName: string): Promise<void> {
    const meta = await sheets.spreadsheets.get({ spreadsheetId: sheetId, fields: "sheets.properties.title,sheets.properties.sheetId" });
    const existing = (meta.data.sheets || []).find((s: any) => s.properties?.title === tabName);
    if (!existing) {
      const addResp = await sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: { requests: [{ addSheet: { properties: { title: tabName } } }] },
      });
      const newSheetId: number | undefined = addResp.data.replies?.[0]?.addSheet?.properties?.sheetId;
      // Write header row
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `${tabName}!A1:J1`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [["Date", "Student Name", "Grade", "Parent Name", "Phone", "Email", "Source", "Status", "Referral Amount", "Remarks"]] },
      });
      // Add status dropdown on column H (index 7) and Referral Amount dropdown on column I (index 8), rows 2-1000
      if (newSheetId !== undefined) {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: sheetId,
          requestBody: {
            requests: [
              {
                setDataValidation: {
                  range: { sheetId: newSheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 7, endColumnIndex: 8 },
                  rule: {
                    condition: {
                      type: "ONE_OF_LIST",
                      values: [
                        { userEnteredValue: "Open" },
                        { userEnteredValue: "Walk-in Booked" },
                        { userEnteredValue: "Walk-in Completed" },
                        { userEnteredValue: "Closed" },
                        { userEnteredValue: "Future Prospect" },
                        { userEnteredValue: "Admission Done" },
                      ],
                    },
                    showCustomUi: true,
                    strict: false,
                  },
                },
              },
              {
                setDataValidation: {
                  range: { sheetId: newSheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 8, endColumnIndex: 9 },
                  rule: {
                    condition: {
                      type: "ONE_OF_LIST",
                      values: [
                        { userEnteredValue: "Pending" },
                        { userEnteredValue: "Paid" },
                      ],
                    },
                    showCustomUi: true,
                    strict: false,
                  },
                },
              },
            ],
          },
        });
      }
      console.log(`[friendship] Created sheet tab with status dropdown: ${tabName}`);
    }
  }

  async function appendFriendshipLeadToSheets(lead: {
    id: number; submittedAt: Date | string; studentName: string; grade: string;
    parentName: string; phone: string; email?: string | null; source: string;
  }, tabName: string): Promise<void> {
    const sheetId = SHEET_IDS.alliances;  // same sheet as auto-sync — Alliances Dashboard
    if (!sheetId) throw new Error("Alliances sheet ID not configured");
    const auth = getAuthenticatedClient();
    if (!auth) throw new Error("Google not connected");
    const { google: goog } = await import("googleapis");
    const sheets = goog.sheets({ version: "v4", auth });
    await ensureFriendshipSheetTab(sheets, sheetId, tabName);
    const dt = new Date(lead.submittedAt);
    const dateStr = dt.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", year: "numeric" });
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: `${tabName}!A:J`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[dateStr, lead.studentName, lead.grade, lead.parentName, lead.phone, lead.email || "", lead.source, "Open", "Pending", ""]],
      },
    });
  }

  // ── Aggregate "All Friendship Leads" tab helpers ─────────────────
  const AGGREGATE_TAB = "All Friendship Leads";

  async function ensureAggregateLeadsTab(sheets: any, sheetId: string): Promise<void> {
    const meta = await sheets.spreadsheets.get({ spreadsheetId: sheetId, fields: "sheets.properties.title,sheets.properties.sheetId" });
    const existing = (meta.data.sheets || []).find((s: any) => s.properties?.title === AGGREGATE_TAB);
    let tabSheetId: number | undefined;
    if (!existing) {
      const addResp = await sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: { requests: [{ addSheet: { properties: { title: AGGREGATE_TAB } } }] },
      });
      tabSheetId = addResp.data.replies?.[0]?.addSheet?.properties?.sheetId;
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `${AGGREGATE_TAB}!A1:K1`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [["Date", "School Name", "Student Name", "Grade", "Parent Name", "Phone", "Email", "Source", "Status", "Referral Amount", "Remarks"]] },
      });
      console.log(`[friendship] Created aggregate tab: ${AGGREGATE_TAB}`);
    } else {
      tabSheetId = existing.properties?.sheetId;
    }
    // Always apply/refresh dropdowns so they survive if the tab was recreated or fixed
    if (tabSheetId !== undefined) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: {
          requests: [
            {
              setDataValidation: {
                range: { sheetId: tabSheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 8, endColumnIndex: 9 },
                rule: {
                  condition: {
                    type: "ONE_OF_LIST",
                    values: [
                      { userEnteredValue: "Open" }, { userEnteredValue: "Walk-in Booked" },
                      { userEnteredValue: "Walk-in Completed" }, { userEnteredValue: "Closed" },
                      { userEnteredValue: "Future Prospect" }, { userEnteredValue: "Admission Done" },
                    ],
                  },
                  showCustomUi: true, strict: false,
                },
              },
            },
            {
              setDataValidation: {
                range: { sheetId: tabSheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 9, endColumnIndex: 10 },
                rule: {
                  condition: {
                    type: "ONE_OF_LIST",
                    values: [{ userEnteredValue: "Pending" }, { userEnteredValue: "Paid" }],
                  },
                  showCustomUi: true, strict: false,
                },
              },
            },
          ],
        },
      });
    }
  }

  // Serialization queue: concurrent values.append calls to the same spreadsheet
  // can collide — both see the same "last row" and one silently overwrites the other.
  // This promise-chain queue ensures all appends run one at a time in arrival order.
  let _appendQueue: Promise<void> = Promise.resolve();
  function queueAppend(
    leads: Parameters<typeof appendLeadsToAggregateTab>[0],
    schoolName: string
  ): Promise<void> {
    const task = _appendQueue.then(() => appendLeadsToAggregateTab(leads, schoolName));
    // Keep queue alive even if an individual append fails
    _appendQueue = task.catch(() => {});
    return task; // Caller receives the real promise (may reject)
  }

  async function appendLeadsToAggregateTab(leads: Array<{
    id?: number;
    submittedAt: Date | string; studentName: string; grade: string;
    parentName: string; phone: string; email?: string | null; source: string;
  }>, schoolName: string): Promise<void> {
    const sheetId = SHEET_IDS.alliances;
    if (!sheetId) throw new Error("Alliances sheet ID not configured");
    const auth = getAuthenticatedClient();
    if (!auth) throw new Error("Google not connected");
    const { google: goog } = await import("googleapis");
    const sheets = goog.sheets({ version: "v4", auth });
    await ensureAggregateLeadsTab(sheets, sheetId);
    const rows = leads.map(lead => {
      const dt = new Date(lead.submittedAt);
      const dateStr = dt.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", year: "numeric" });
      return [dateStr, schoolName, lead.studentName, lead.grade, lead.parentName, lead.phone, lead.email || "", lead.source, "Open", "Pending", ""];
    });
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: `${AGGREGATE_TAB}!A:K`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: rows },
    });
    // Mark every lead as confirmed in the sheet so the sync-all deletion guard works correctly
    await Promise.all(
      leads
        .filter(l => l.id !== undefined)
        .map(l => storage.markFriendshipLeadSynced(l.id!).catch(() => {}))
    );
  }

  // Template download (public)
  app.get("/api/alliances/friendship/template", (_req, res) => {
    if (!fs.existsSync(FRIENDSHIP_TEMPLATE_PATH)) {
      return res.status(404).json({ message: "Template not found" });
    }
    res.setHeader("Content-Disposition", 'attachment; filename="friendship_school_template.xlsx"');
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.sendFile(FRIENDSHIP_TEMPLATE_PATH);
  });

  // Public: get school info by token (name + active flag only — no PII)
  app.get("/api/alliances/friendship/school/:token", async (req, res) => {
    try {
      const school = await storage.getFriendshipSchoolByToken(req.params.token);
      if (!school) return res.status(404).json({ message: "School not found" });
      res.json({ id: school.id, name: school.name, isActive: school.isActive });
    } catch {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Public: school leads portal — returns that school's leads for the view-only portal page.
  // The token IS the credential; no login required. Returns only non-sensitive columns.
  app.get("/api/school-leads/:token", async (req, res) => {
    try {
      const school = await storage.getFriendshipSchoolByToken(req.params.token);
      if (!school || !school.isActive) return res.status(404).json({ message: "School not found" });
      const leads = await storage.listFriendshipLeads(school.id, undefined, 500, 0);
      res.json({
        school: { name: school.name },
        leads: leads.map(l => ({
          id: l.id,
          date: l.submittedAt,
          studentName: l.studentName,
          grade: l.grade,
          parentName: l.parentName,
          phone: l.phone,
          email: l.email ?? null,
          status: l.status,
        })),
      });
    } catch {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Public: submit individual lead
  app.post("/api/alliances/friendship/submit/:token", friendshipSubmitRateLimit, async (req, res) => {
    try {
      const school = await storage.getFriendshipSchoolByToken(req.params.token);
      if (!school || !school.isActive) return res.status(404).json({ message: "School not found or inactive" });

      const input = publicFriendshipLeadSchema.parse(req.body);
      const lead = await storage.createFriendshipLead({
        schoolId: school.id, source: "manual", status: "Open",
        studentName: input.studentName, grade: input.grade,
        parentName: input.parentName, phone: input.phone, email: input.email,
      });
      console.log(`[friendship] Lead submitted: ${input.studentName} → ${school.name}`);
      res.status(201).json({ success: true, id: lead.id });

      // Append to aggregate "All Friendship Leads" tab (fire-and-forget, serialised via queue)
      queueAppend([lead], school.name)
        .catch((err: unknown) => {
          console.error(`[friendship] Aggregate tab sync failed for lead ${lead.id}:`, err instanceof Error ? err.message : String(err));
        });
    } catch (err: any) {
      if (err.name === "ZodError") return res.status(400).json({ message: fromZodError(err).message });
      res.status(500).json({ message: "Failed to submit lead" });
    }
  });

  // Public: bulk upload leads (multipart .xlsx file, parsed server-side)
  app.post("/api/alliances/friendship/bulk-upload/:token", friendshipSubmitRateLimit, xlsxUpload.single("file"), async (req, res) => {
    try {
      const school = await storage.getFriendshipSchoolByToken(req.params.token);
      if (!school || !school.isActive) return res.status(404).json({ message: "School not found or inactive" });

      if (!req.file) return res.status(400).json({ message: "No .xlsx file uploaded (field name: 'file')" });

      const { read, utils } = await import("xlsx");
      const wb = read(req.file.buffer, { type: "buffer" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows: string[][] = utils.sheet_to_json(ws, { header: 1, defval: "" }) as string[][];

      if (rows.length < 2) return res.status(400).json({ message: "Sheet is empty or missing data rows" });

      const header = rows[0].map((h: unknown) => String(h).trim().toLowerCase());
      const idx = {
        studentName: header.findIndex(h => h.includes("student")),
        grade: header.findIndex(h => h.includes("grade")),
        parentName: header.findIndex(h => h.includes("parent")),
        phone: header.findIndex(h => h.includes("phone") || h.includes("mobile")),
        email: header.findIndex(h => h.includes("email")),
      };
      if (idx.studentName < 0 || idx.grade < 0 || idx.parentName < 0 || idx.phone < 0) {
        return res.status(400).json({ message: "Missing required columns: Student Name, Grade, Parent Name, Phone" });
      }

      const skipped: string[] = [];
      const rawLeads = rows.slice(1).flatMap((row, i) => {
        const sn = String(row[idx.studentName] ?? "").trim();
        const gr = String(row[idx.grade] ?? "").trim();
        const pn = String(row[idx.parentName] ?? "").trim();
        const ph = String(row[idx.phone] ?? "").trim();
        const em = idx.email >= 0 ? String(row[idx.email] ?? "").trim() : "";
        if (!sn && !pn && !ph) return [];
        if (!sn || !gr || !pn || !ph) {
          skipped.push(`Row ${i + 2}: missing required fields`);
          return [];
        }
        return [{ studentName: sn, grade: gr, parentName: pn, phone: ph, email: em || undefined }];
      });

      if (rawLeads.length === 0) return res.status(400).json({ message: "No valid rows found", skippedDetails: skipped });
      if (rawLeads.length > 500) return res.status(400).json({ message: "Maximum 500 rows per upload" });

      // Force all server-controlled fields; never trust client for status/commission/remarks
      const leadsToInsert = rawLeads.map(row => ({
        schoolId: school.id, source: "bulk" as const, status: "Open",
        studentName: row.studentName, grade: row.grade,
        parentName: row.parentName, phone: row.phone, email: row.email,
      }));
      const inserted = await storage.createFriendshipLeads(leadsToInsert);
      console.log(`[friendship] Bulk upload: ${inserted.length} leads for ${school.name} (${skipped.length} skipped)`);
      res.status(201).json({ success: true, inserted: inserted.length, skipped: skipped.length, skippedDetails: skipped });

      // Append all inserted leads to aggregate tab in one batch call (fire-and-forget, serialised via queue)
      queueAppend(inserted, school.name)
        .catch((err: unknown) => {
          console.error(`[friendship] Aggregate tab bulk sync failed:`, err instanceof Error ? err.message : String(err));
        });
    } catch (err: any) {
      if (err.name === "ZodError") return res.status(400).json({ message: fromZodError(err).message });
      res.status(500).json({ message: "Failed to process bulk upload" });
    }
  });

  // Admin: list all friendship schools (with lead counts)
  app.get("/api/admin/alliances/friendship/schools", requireAlliancesOrAdmin, async (_req, res) => {
    try {
      // Auto-sync: pull MOU Done schools from Sheets and upsert any that aren't in the DB yet
      const SID = SHEET_IDS.alliances;
      if (SID) {
        try {
          const rows = await fetchSheetRange(SID, "Friendship Schools!A:Z");
          const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
          const mouDone = rows.slice(1)
            .filter(r => r[1] && r[1].trim() && String(r[11] ?? "").trim() === "MOU Done")
            .map(r => {
              const schoolName = String(r[1]).trim();
              const location   = String(r[2] ?? "").trim();
              // Multi-branch schools share a name but differ by location — append location
              // so each branch gets its own QR entry.  Skip the append when the school name
              // already ends with "- <location>" (e.g. "Euro Kids - Anand Nagar").
              const alreadyHasLoc = location &&
                schoolName.toLowerCase().endsWith(`- ${location.toLowerCase()}`);
              const displayName = (location && !alreadyHasLoc)
                ? `${schoolName} - ${location}` : schoolName;
              return {
                name: displayName,
                contactPerson: String(r[4] ?? "").trim() || "—",
                contactPhone:  String(r[5] ?? "").trim() || undefined,
                sheetsTabName: displayName,
              };
            });
          const existing = await storage.listFriendshipSchools();
          const existingByName = new Map(existing.map((s: any) => [s.name.toLowerCase().trim(), s]));
          // Auto-remove stale entries: schools with 0 leads whose name is no longer in
          // the current MOU Done list (e.g. old name-only entries superseded by name+location ones)
          const currentMouNamesLc = new Set(mouDone.map(s => s.name.toLowerCase()));
          for (const school of existing) {
            if (currentMouNamesLc.has(school.name.toLowerCase())) continue; // still live in sheet
            // Only auto-remove schools synced from Sheets — never delete ones the admin manually
            // created with a custom contactOverride (they were added directly in the dashboard).
            if ((school as any).contactOverride) continue;
            console.log(`[friendship] auto-removing school "${school.name}" (no longer in Friendship Schools tab)`);
            await storage.deleteFriendshipSchool(school.id).catch(() => {});
          }
          for (const s of mouDone) {
            const dbSchool = existingByName.get(s.name.toLowerCase());
            if (dbSchool) {
              // School already exists — update contact details from Sheets if they've changed,
              // but only when the admin has not manually overridden them (contactOverride flag).
              if (!dbSchool.contactOverride) {
                const contactChanged =
                  dbSchool.contactPerson !== s.contactPerson ||
                  (dbSchool.contactPhone ?? "") !== (s.contactPhone ?? "");
                if (contactChanged) {
                  await storage.updateFriendshipSchool(dbSchool.id, {
                    contactPerson: s.contactPerson,
                    contactPhone: s.contactPhone,
                  }).catch((e: unknown) => {
                    console.error(`[friendship] contact update failed for "${s.name}":`, e instanceof Error ? e.message : e);
                  });
                }
              }
              continue;
            }
            // New school — create it
            const school = await storage.createFriendshipSchool({
              name: s.name,
              slug: slugify(s.name),
              token: randomBytes(16).toString("hex"),
              contactPerson: s.contactPerson,
              contactPhone: s.contactPhone,
              sheetsTabName: s.sheetsTabName,
              isActive: true,
            });
            existingByName.set(s.name.toLowerCase(), school);
            // Tab is created on-demand when the first lead is submitted — no need to pre-create it here.
          }
        } catch (syncErr) {
          console.error("[friendship] auto-sync error:", syncErr instanceof Error ? syncErr.message : syncErr);
          // Non-fatal: still return whatever is in the DB
        }
      }
      res.json(await storage.listFriendshipSchools());
    } catch {
      res.status(500).json({ message: "Failed to fetch schools" });
    }
  });

  // Admin: get single school by ID
  app.get("/api/admin/alliances/friendship/schools/:id", requireAlliancesOrAdmin, async (req, res) => {
    try {
      const school = await storage.getFriendshipSchoolById(Number(req.params.id));
      if (!school) return res.status(404).json({ message: "School not found" });
      res.json(school);
    } catch {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Admin: create friendship school (slug + token auto-generated server-side)
  app.post("/api/admin/alliances/friendship/schools", requireAlliancesOrAdmin, async (req, res) => {
    try {
      const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const body = {
        ...req.body,
        slug: slugify(String(req.body.name || "")),
        token: randomBytes(16).toString("hex"),
        isActive: req.body.isActive !== false,
        // Mark as manually-created so the auto-sync never deletes it when the
        // sheet no longer lists it (only schools synced FROM the sheet are auto-removed).
        contactOverride: true,
      };
      const validated = insertFriendshipSchoolSchema.parse(body);
      const school = await storage.createFriendshipSchool(validated);
      res.status(201).json(school);
      // Auto-create the Sheets tab (non-blocking) — skip for e2e test schools
      const sheetId = process.env.ALLIANCES_SHEET_ID;
      const auth = getAuthenticatedClient();
      if (sheetId && auth && !school.name.startsWith("e2e-")) {
        import("googleapis").then(({ google: goog }) => {
          const sheets = goog.sheets({ version: "v4", auth });
          ensureFriendshipSheetTab(sheets, sheetId, school.sheetsTabName).catch((e: unknown) => {
            console.error(`[friendship] Tab creation failed for "${school.sheetsTabName}":`, e instanceof Error ? e.message : e);
          });
        });
      }
    } catch (err: any) {
      if (err.name === "ZodError") return res.status(400).json({ message: fromZodError(err).message });
      res.status(500).json({ message: "Failed to create school" });
    }
  });

  // Admin: update friendship school
  app.put("/api/admin/alliances/friendship/schools/:id", requireAlliancesOrAdmin, async (req, res) => {
    try {
      const update = { ...req.body };
      // If the admin is manually setting contact fields, mark the record so that
      // the Sheets auto-sync won't overwrite them on the next poll.
      const existing = await storage.getFriendshipSchoolById(Number(req.params.id));
      if (existing && ("contactPerson" in update || "contactPhone" in update)) {
        const personChanged = "contactPerson" in update && update.contactPerson !== existing.contactPerson;
        const phoneChanged  = "contactPhone"  in update && update.contactPhone  !== existing.contactPhone;
        if (personChanged || phoneChanged) {
          update.contactOverride = true;
        }
      }
      const school = await storage.updateFriendshipSchool(Number(req.params.id), update);
      if (!school) return res.status(404).json({ message: "School not found" });
      res.json(school);
    } catch {
      res.status(500).json({ message: "Failed to update school" });
    }
  });

  // Admin: regenerate QR token
  app.delete("/api/admin/alliances/friendship/schools/:id", requireAlliancesOrAdmin, async (req, res) => {
    try {
      await storage.deleteFriendshipSchool(Number(req.params.id));
      res.json({ success: true });
    } catch {
      res.status(500).json({ message: "Failed to delete school" });
    }
  });

  app.post("/api/admin/alliances/friendship/schools/:id/regenerate-token", requireAlliancesOrAdmin, async (req, res) => {
    try {
      const newToken = randomBytes(16).toString("hex");
      const school = await storage.regenerateFriendshipSchoolToken(Number(req.params.id), newToken);
      if (!school) return res.status(404).json({ message: "School not found" });
      res.json({ success: true, token: newToken });
    } catch {
      res.status(500).json({ message: "Failed to regenerate token" });
    }
  });

  // Admin: list leads (optionally filtered by schoolId / status)
  app.get("/api/admin/alliances/friendship/leads", requireAlliancesOrAdmin, async (req, res) => {
    try {
      const schoolId = req.query.schoolId ? Number(req.query.schoolId) : undefined;
      const status = typeof req.query.status === "string" ? req.query.status : undefined;
      const limit = req.query.limit ? Math.min(Number(req.query.limit), 500) : 200;
      const offset = req.query.offset ? Number(req.query.offset) : 0;
      res.json(await storage.listFriendshipLeads(schoolId, status, limit, offset));
    } catch {
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });

  // Admin: update lead status / commission
  app.patch("/api/admin/alliances/friendship/leads/:id", requireAlliancesOrAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (!id) return res.status(400).json({ message: "Invalid lead id" });
      const { status, commissionPaid } = req.body as { status?: string; commissionPaid?: boolean };
      const VALID_STATUSES = ["Open", "Walk-in Booked", "Walk-in Completed", "Closed", "Future Prospect", "Admission Done"];
      if (status !== undefined && !VALID_STATUSES.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      const update: { status?: string; commissionPaid?: boolean } = {};
      if (status !== undefined) update.status = status;
      if (commissionPaid !== undefined) update.commissionPaid = Boolean(commissionPaid);
      if (Object.keys(update).length === 0) return res.status(400).json({ message: "Nothing to update" });
      const lead = await storage.updateFriendshipLead(id, update);
      if (!lead) return res.status(404).json({ message: "Lead not found" });
      res.json(lead);
      // Write-back to aggregate sheet (fire-and-forget)
      storage.getFriendshipSchoolById(lead.schoolId).then(school => {
        if (school) updateAggregateLeadRow(lead.phone, school.name, update).catch((e: unknown) => {
          console.error("[friendship] aggregate sheet write-back failed:", e instanceof Error ? e.message : e);
        });
      }).catch(() => {});
    } catch {
      res.status(500).json({ message: "Failed to update lead" });
    }
  });

  // Helper: update a lead's status + referral amount in the aggregate tab (fire-and-forget)
  async function updateAggregateLeadRow(
    phone: string, schoolName: string,
    fields: { status?: string; commissionPaid?: boolean }
  ): Promise<void> {
    const sheetId = SHEET_IDS.alliances;
    if (!sheetId) return;
    const auth = getAuthenticatedClient();
    if (!auth) return;
    const { google: goog } = await import("googleapis");
    const sheets = goog.sheets({ version: "v4", auth });
    const resp = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${AGGREGATE_TAB}!A:K`,
    });
    const rows = resp.data.values || [];
    const normalised = phone.replace(/\D/g, "");
    const updates: Promise<any>[] = [];
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      const rowSchool = (r[1] || "").toString().trim();
      const rowPhone  = (r[5] || "").toString().replace(/\D/g, "");
      if (rowSchool !== schoolName || rowPhone !== normalised) continue;
      const rowNum = i + 1; // 1-based sheet row
      if (fields.status !== undefined) {
        updates.push(sheets.spreadsheets.values.update({
          spreadsheetId: sheetId,
          range: `${AGGREGATE_TAB}!I${rowNum}`,
          valueInputOption: "USER_ENTERED",
          requestBody: { values: [[fields.status]] },
        }));
      }
      if (fields.commissionPaid !== undefined) {
        updates.push(sheets.spreadsheets.values.update({
          spreadsheetId: sheetId,
          range: `${AGGREGATE_TAB}!J${rowNum}`,
          valueInputOption: "USER_ENTERED",
          requestBody: { values: [[fields.commissionPaid ? "Paid" : "Pending"]] },
        }));
      }
    }
    await Promise.all(updates);
  }

  // Admin: sync ALL schools at once — reads aggregate tab once, processes every school in one pass
  app.post("/api/admin/alliances/friendship/sync-all-from-sheets", requireAlliancesOrAdmin, async (req, res) => {
    try {
      const sheetId = SHEET_IDS.alliances;
      if (!sheetId) return res.status(500).json({ message: "Alliances sheet ID not configured" });
      const auth = getAuthenticatedClient();
      if (!auth) return res.status(500).json({ message: "Google not connected" });

      const { google: goog } = await import("googleapis");
      const sheets = goog.sheets({ version: "v4", auth });

      // Single read of the entire aggregate tab
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${AGGREGATE_TAB}!A:K`,
      });
      const allRows = response.data.values || [];
      const dataRows = allRows.slice(1); // skip header

      // Build phone set across ALL rows (used for deletion check)
      const allSheetPhones = new Set(
        dataRows.map(r => (r[5] || "").toString().replace(/\D/g, "")).filter(Boolean)
      );

      // Group sheet rows by school name (col B)
      const rowsBySchool = new Map<string, typeof dataRows>();
      for (const r of dataRows) {
        const name = (r[1] || "").toString().trim();
        if (!name) continue;
        if (!rowsBySchool.has(name)) rowsBySchool.set(name, []);
        rowsBySchool.get(name)!.push(r);
      }

      // Process every school in DB
      const allSchools = await storage.listFriendshipSchools();
      let totalUpdated = 0, totalDeleted = 0;

      for (const school of allSchools) {
        try {
          const existing = await storage.listFriendshipLeads(school.id);
          const existingPhones = new Set(existing.map(l => l.phone.replace(/\D/g, "")));
          const schoolRows = rowsBySchool.get(school.name) ?? [];

          const fieldUpdates: { phone: string; status?: string; commissionPaid?: boolean | null }[] = [];

          for (const r of schoolRows) {
            const phone  = (r[5] || "").toString().trim();
            const status = (r[8] || "Open").toString().trim();
            if (!phone) continue;
            const entry: { phone: string; status?: string; commissionPaid?: boolean | null } = { phone };
            if (status) entry.status = status;
            // Col J = Referral Amount: "Paid" → true, "Pending" / empty → false, absent → null (leave unchanged)
            const refAmt = (r[9] ?? "").toString().trim().toLowerCase();
            if (refAmt === "paid") entry.commissionPaid = true;
            else if (refAmt === "pending" || refAmt === "") entry.commissionPaid = false;
            fieldUpdates.push(entry);
          }

          // Delete leads absent from the entire sheet (rename-safe: check all phones not just school rows)
          // Only delete leads confirmed in the sheet (syncedToSheets=true).
          // Leads still pending their first append are never treated as "removed".
          const toDelete = existing.filter(l => l.syncedToSheets && !allSheetPhones.has(l.phone.replace(/\D/g, "")));
          const deleted = toDelete.length ? await storage.deleteFriendshipLeads(toDelete.map(l => l.id)) : 0;
          const updated = await storage.bulkUpdateFriendshipLeadFields(school.id, fieldUpdates);

          totalUpdated += updated;
          totalDeleted += deleted;

          if (deleted > 0) {
            console.log(`[friendship] sync-all ${school.name}: ${deleted} deleted`);
          }
        } catch (e: unknown) {
          console.error(`[friendship] sync-all school="${school.name}" error:`, e instanceof Error ? e.message : e);
        }
      }

      console.log(`[friendship] sync-all complete: ${totalUpdated} updated, ${totalDeleted} deleted`);
      res.json({ updated: totalUpdated, deleted: totalDeleted, schools: allSchools.length });
    } catch (err: any) {
      const msg = err?.message || String(err) || "";
      console.error("[sync-all] error:", msg);
      res.status(500).json({ message: msg.slice(0, 200) || "Sync failed" });
    }
  });

  // Admin: sync lead statuses from the aggregate "All Friendship Leads" sheet tab back into DB
  app.post("/api/admin/alliances/friendship/sync-status-from-sheets", requireAlliancesOrAdmin, async (req, res) => {
    try {
      const schoolId = Number(req.body?.schoolId);
      if (!schoolId) return res.status(400).json({ message: "schoolId required" });
      const sheetId = SHEET_IDS.alliances;
      if (!sheetId) return res.status(500).json({ message: "Alliances sheet ID not configured" });
      const auth = getAuthenticatedClient();
      if (!auth) return res.status(500).json({ message: "Google not connected" });

      const school = await storage.getFriendshipSchoolById(schoolId);
      if (!school) return res.status(404).json({ message: "School not found" });

      const { google: goog } = await import("googleapis");
      const sheets = goog.sheets({ version: "v4", auth });

      // Read aggregate tab — cols A:K
      // A=Date B=School C=Student D=Grade E=Parent F=Phone G=Email H=Source I=Status J=Ref Amt K=Remarks
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${AGGREGATE_TAB}!A:K`,
      });
      const allRows = response.data.values || [];

      // Filter to rows for this school
      const schoolRows = allRows.slice(1).filter(r => (r[1] || "").toString().trim() === school.name);

      // Get existing DB leads for this school
      const existing = await storage.listFriendshipLeads(schoolId);
      const existingPhones = new Set(existing.map(l => l.phone.replace(/\D/g, "")));

      const statusUpdates: { phone: string; status: string }[] = [];
      const newLeads: InsertFriendshipLead[] = [];

      for (const r of schoolRows) {
        const phone  = (r[5] || "").toString().trim();
        const status = (r[8] || "Open").toString().trim();
        if (!phone) continue;
        if (status) statusUpdates.push({ phone, status });
        // Rows present in the sheet but missing from the DB → import them
        if (!existingPhones.has(phone.replace(/\D/g, ""))) {
          newLeads.push({
            schoolId,
            studentName: (r[2] || "").toString().trim() || "Unknown",
            grade: (r[3] || "").toString().trim() || "Unknown",
            parentName: (r[4] || "").toString().trim() || "Unknown",
            phone,
            email: (r[6] || "").toString().trim() || null,
            source: "manual",
            status: status || "Open",
            remarks: (r[10] || "").toString().trim() || null,
          });
        }
      }

      // Leads in DB but absent from the sheet → delete them.
      // Use ALL rows in the aggregate tab (not just schoolRows) so that leads appended
      // under a previous school name (before a rename) are not mistakenly deleted.
      const allSheetPhones = new Set(
        allRows.slice(1)
          .map(r => (r[5] || "").toString().replace(/\D/g, ""))
          .filter(Boolean)
      );
      // Only delete leads confirmed in the sheet (syncedToSheets=true).
      const toDelete = existing.filter(l => l.syncedToSheets && !allSheetPhones.has(l.phone.replace(/\D/g, "")));
      const deleted = toDelete.length ? await storage.deleteFriendshipLeads(toDelete.map(l => l.id)) : 0;
      if (deleted > 0) {
        console.log(`[friendship] sync-status: deleted ${deleted} leads removed from sheet for ${school.name}`);
      }

      const updated = await storage.bulkUpdateFriendshipLeadStatuses(schoolId, statusUpdates);
      let imported = 0;
      if (newLeads.length) {
        await storage.createFriendshipLeads(newLeads);
        imported = newLeads.length;
      }

      console.log(`[friendship] sync-status school=${school.name}: ${updated} updated, ${imported} imported, ${deleted} deleted`);
      res.json({ updated, imported, deleted, total: statusUpdates.length });
    } catch (err: any) {
      const msg = err?.message || String(err) || "";
      console.error("[sync-status] error:", msg);
      res.status(500).json({ message: msg.slice(0, 200) || "Failed to sync status from sheets" });
    }
  });

  // Admin: backfill status dropdown validation on all existing sheet tabs
  app.get("/api/admin/alliances/friendship/validation-status", requireAdmin, async (_req, res) => {
    try {
      const sheetId = process.env.ALLIANCES_SHEET_ID;
      if (!sheetId) return res.status(500).json({ message: "ALLIANCES_SHEET_ID env var not set" });
      const auth = getAuthenticatedClient();
      if (!auth) return res.status(500).json({ message: "Google not connected" });

      const { google: goog } = await import("googleapis");
      const sheets = goog.sheets({ version: "v4", auth });

      const meta = await sheets.spreadsheets.get({
        spreadsheetId: sheetId,
        fields: "sheets.properties.title",
      });
      const existingTabs = new Set(
        (meta.data.sheets || []).map(s => s.properties?.title).filter(Boolean)
      );

      const schools = await storage.listFriendshipSchools();
      const result: { id: number; name: string; tab: string; hasDropdown: boolean; reason?: string }[] = [];

      const schoolsWithTabs = schools.filter(s => existingTabs.has(s.sheetsTabName));
      const schoolsWithoutTabs = schools.filter(s => !existingTabs.has(s.sheetsTabName));

      for (const s of schoolsWithoutTabs) {
        result.push({ id: s.id, name: s.name, tab: s.sheetsTabName, hasDropdown: false, reason: "tab not found" });
      }

      if (schoolsWithTabs.length > 0) {
        const ranges = schoolsWithTabs.map(s => `${s.sheetsTabName}!H2:H2`);
        const gridResp = await sheets.spreadsheets.get({
          spreadsheetId: sheetId,
          ranges,
          includeGridData: true,
          fields: "sheets(properties.title,data.rowData.values.dataValidation)",
        });

        const tabValidation: Record<string, boolean> = {};
        for (const sheet of (gridResp.data.sheets || [])) {
          const title = sheet.properties?.title;
          if (!title) continue;
          const cell = sheet.data?.[0]?.rowData?.[0]?.values?.[0];
          const dvType = cell?.dataValidation?.condition?.type;
          tabValidation[title] = dvType === "ONE_OF_LIST";
        }

        for (const s of schoolsWithTabs) {
          const hasDropdown = tabValidation[s.sheetsTabName] ?? false;
          result.push({ id: s.id, name: s.name, tab: s.sheetsTabName, hasDropdown });
        }
      }

      res.json({ schools: result });
    } catch (err: any) {
      console.error("[friendship] validation-status error:", err?.message);
      res.status(500).json({ message: "Failed to check validation status", error: err?.message });
    }
  });

  app.post("/api/admin/alliances/friendship/apply-validation", requireAdmin, async (_req, res) => {
    try {
      const sheetId = process.env.ALLIANCES_SHEET_ID;
      if (!sheetId) return res.status(500).json({ message: "ALLIANCES_SHEET_ID env var not set" });
      const auth = getAuthenticatedClient();
      if (!auth) return res.status(500).json({ message: "Google not connected" });

      const { google: goog } = await import("googleapis");
      const sheets = goog.sheets({ version: "v4", auth });

      // Get all sheet tab metadata (title → numeric sheetId)
      const meta = await sheets.spreadsheets.get({
        spreadsheetId: sheetId,
        fields: "sheets.properties.title,sheets.properties.sheetId",
      });
      const tabMap: Record<string, number> = {};
      for (const s of (meta.data.sheets || [])) {
        if (s.properties?.title != null && s.properties?.sheetId != null) {
          tabMap[s.properties.title] = s.properties.sheetId;
        }
      }

      const schools = await storage.listFriendshipSchools();
      const results: { school: string; tab: string; status: string }[] = [];

      // Batch-check which tabs already have a ONE_OF_LIST rule on column H (H2)
      const existingTabTitles = Object.keys(tabMap);
      const schoolsWithTabs = schools.filter(s => existingTabTitles.includes(s.sheetsTabName));
      const tabHasDropdown: Record<string, boolean> = {};

      if (schoolsWithTabs.length > 0) {
        const ranges = schoolsWithTabs.map(s => `${s.sheetsTabName}!H2:H2`);
        const gridResp = await sheets.spreadsheets.get({
          spreadsheetId: sheetId,
          ranges,
          includeGridData: true,
          fields: "sheets(properties.title,data.rowData.values.dataValidation)",
        });
        for (const sheet of (gridResp.data.sheets || [])) {
          const title = sheet.properties?.title;
          if (!title) continue;
          const cell = sheet.data?.[0]?.rowData?.[0]?.values?.[0];
          const dvType = cell?.dataValidation?.condition?.type;
          tabHasDropdown[title] = dvType === "ONE_OF_LIST";
        }
      }

      for (const school of schools) {
        const tabName = school.sheetsTabName;
        const numericSheetId = tabMap[tabName];
        if (numericSheetId === undefined) {
          results.push({ school: school.name, tab: tabName, status: "tab not found in sheet" });
          continue;
        }
        if (tabHasDropdown[tabName]) {
          results.push({ school: school.name, tab: tabName, status: "already has dropdown" });
          continue;
        }
        try {
          await sheets.spreadsheets.batchUpdate({
            spreadsheetId: sheetId,
            requestBody: {
              requests: [
                {
                  setDataValidation: {
                    range: { sheetId: numericSheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 7, endColumnIndex: 8 },
                    rule: {
                      condition: {
                        type: "ONE_OF_LIST",
                        values: [
                          { userEnteredValue: "Open" },
                          { userEnteredValue: "Walk-in Booked" },
                          { userEnteredValue: "Walk-in Completed" },
                          { userEnteredValue: "Closed" },
                          { userEnteredValue: "Future Prospect" },
                          { userEnteredValue: "Admission Done" },
                        ],
                      },
                      showCustomUi: true,
                      strict: false,
                    },
                  },
                },
                {
                  setDataValidation: {
                    range: { sheetId: numericSheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 8, endColumnIndex: 9 },
                    rule: {
                      condition: {
                        type: "ONE_OF_LIST",
                        values: [
                          { userEnteredValue: "Pending" },
                          { userEnteredValue: "Paid" },
                        ],
                      },
                      showCustomUi: true,
                      strict: false,
                    },
                  },
                },
              ],
            },
          });
          console.log(`[friendship] Applied status dropdown to existing tab: ${tabName}`);
          results.push({ school: school.name, tab: tabName, status: "ok" });
        } catch (err: any) {
          console.error(`[friendship] Failed to apply validation to "${tabName}":`, err?.message);
          results.push({ school: school.name, tab: tabName, status: `error: ${err?.message}` });
        }
      }

      const skipped = results.filter(r => r.status === "already has dropdown").length;
      res.json({ applied: results.filter(r => r.status === "ok").length, skipped, total: schools.length, results });
    } catch (err: any) {
      console.error("[friendship] apply-validation error:", err?.message);
      res.status(500).json({ message: "Failed to apply validation", error: err?.message });
    }
  });

  // Admin: retry sync (per-school tab sync removed; aggregate tab is fire-and-forget)
  app.post("/api/admin/alliances/friendship/sync-sheets", requireAdmin, async (_req, res) => {
    res.json({ total: 0, synced: 0, failed: 0, message: "Per-school sheet sync disabled; leads go to the All Friendship Leads aggregate tab only." });
  });

  // Admin: one-shot sheet cleanup — fix aggregate tab schema + delete junk/per-school tabs
  app.post("/api/admin/alliances/friendship/cleanup-sheets", requireAdmin, async (_req, res) => {
    try {
      // School tabs may be in the env-var sheet; aggregate tab is in the hardcoded SHEET_IDS.alliances.
      // Deduplicate so we don't double-clean when they're the same sheet.
      const envSheetId = process.env.ALLIANCES_SHEET_ID ?? "";
      const aggSheetId = SHEET_IDS.alliances;
      const sheetIdsToClean = [...new Set([aggSheetId, envSheetId].filter(Boolean))];
      if (!sheetIdsToClean.length) return res.status(503).json({ message: "Alliances sheet ID not configured" });
      const auth = getAuthenticatedClient();
      if (!auth) return res.status(503).json({ message: "Google not connected" });
      const { google: goog } = await import("googleapis");
      const sheets = goog.sheets({ version: "v4", auth });

      // We fix the aggregate tab from the dedicated aggSheetId sheet.
      const sheetId = aggSheetId || envSheetId;

      // Get all tabs with their numeric sheetIds — from every sheet we need to clean
      const allTabsBySheet: Array<{ spreadsheetId: string; title: string; sheetId: number }> = [];
      for (const sid of sheetIdsToClean) {
        const meta = await sheets.spreadsheets.get({ spreadsheetId: sid, fields: "sheets.properties" });
        for (const s of meta.data.sheets || []) {
          allTabsBySheet.push({ spreadsheetId: sid, title: s.properties?.title ?? "", sheetId: s.properties?.sheetId ?? -1 });
        }
      }
      const allTabs = allTabsBySheet.filter(t => t.spreadsheetId === sheetId);

      // Fix "All Friendship Leads" header + dropdowns (even if tab already existed)
      const aggregateTab = allTabs.find(t => t.title === AGGREGATE_TAB);
      if (aggregateTab) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: sheetId,
          range: `${AGGREGATE_TAB}!A1:K1`,
          valueInputOption: "USER_ENTERED",
          requestBody: { values: [["Date", "School Name", "Student Name", "Grade", "Parent Name", "Phone", "Email", "Source", "Status", "Referral Amount", "Remarks"]] },
        });
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: sheetId,
          requestBody: {
            requests: [
              {
                setDataValidation: {
                  range: { sheetId: aggregateTab.sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 8, endColumnIndex: 9 },
                  rule: {
                    condition: {
                      type: "ONE_OF_LIST",
                      values: [
                        { userEnteredValue: "Open" }, { userEnteredValue: "Walk-in Booked" },
                        { userEnteredValue: "Walk-in Completed" }, { userEnteredValue: "Closed" },
                        { userEnteredValue: "Future Prospect" }, { userEnteredValue: "Admission Done" },
                      ],
                    },
                    showCustomUi: true, strict: false,
                  },
                },
              },
              {
                setDataValidation: {
                  range: { sheetId: aggregateTab.sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: 9, endColumnIndex: 10 },
                  rule: {
                    condition: {
                      type: "ONE_OF_LIST",
                      values: [{ userEnteredValue: "Pending" }, { userEnteredValue: "Paid" }],
                    },
                    showCustomUi: true, strict: false,
                  },
                },
              },
            ],
          },
        });
        console.log(`[friendship] Fixed aggregate tab schema: ${AGGREGATE_TAB}`);
      }

      // Delete e2e test schools from DB first, then clean their tabs from the sheet
      const allSchools = await storage.listFriendshipSchools();
      const e2eSchools = allSchools.filter(s => s.name.startsWith("e2e-") || s.sheetsTabName.startsWith("e2e-"));
      for (const s of e2eSchools) {
        await storage.deleteFriendshipSchool(s.id).catch(() => {});
      }
      console.log(`[friendship] Deleted ${e2eSchools.length} e2e test schools from DB`);

      // Identify junk tabs across ALL sheets we checked: any e2e-* tab + per-school tabs
      const knownSchoolNames = new Set(
        (await storage.listFriendshipSchools()).map(s => s.sheetsTabName)
      );
      const junkTabs = allTabsBySheet.filter(t =>
        t.title !== AGGREGATE_TAB &&
        (t.title.startsWith("e2e-") || knownSchoolNames.has(t.title))
      );

      // Group deletions by spreadsheet so each sheet gets one batchUpdate call
      const bySheet = new Map<string, typeof junkTabs>();
      for (const t of junkTabs) {
        if (!bySheet.has(t.spreadsheetId)) bySheet.set(t.spreadsheetId, []);
        bySheet.get(t.spreadsheetId)!.push(t);
      }
      let deleted = 0;
      for (const [sid, tabs] of bySheet) {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: sid,
          requestBody: { requests: tabs.map(t => ({ deleteSheet: { sheetId: t.sheetId } })) },
        });
        deleted += tabs.length;
        console.log(`[friendship] Deleted ${tabs.length} junk tabs from ${sid}: ${tabs.map(t => t.title).join(", ")}`);
      }

      res.json({
        aggregateTabFixed: !!aggregateTab,
        sheetsScanned: sheetIdsToClean,
        deletedTabs: junkTabs.map(t => t.title),
        deleted,
      });
    } catch (err: any) {
      console.error("[friendship] cleanup-sheets error:", err?.message);
      res.status(500).json({ message: "Cleanup failed", error: err?.message });
    }
  });

  app.get("/api/admin/alliances/friendship/stats", requireAlliancesOrAdmin, async (_req, res) => {
    try {
      const schools = await storage.listFriendshipSchools();
      const totalSchools = schools.length;
      const activeSchools = schools.filter(s => s.leadCount > 0).length;
      const { totalLeads, walkIns, admissions } = await storage.getFriendshipLeadStats();
      res.json({ totalSchools, activeSchools, totalLeads, walkIns, admissions });
    } catch {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  return httpServer;
}
